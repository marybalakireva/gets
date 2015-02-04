/**
 * @author      Nikita Davydovsky   <davydovs@cs.karelia.ru>
 * @version     0.1                 (current version number of program)
 * @since       2014-12-20          (the version of the package this class was first added to)
 */

/**
 * Constructor for controller "Routes".
 * 
 * @constructor
 */
function Routes() {}

Routes.prototype.makeGoogleDirectionsRoute = function (track, options, callback) {
    if (!track) {
        throw new GetsWebClientException('Routes Error', 'makeGoogleDirectionsRoute, track undefined or null');
    }
    if (!track.hasOwnProperty('points')) {
        throw new GetsWebClientException('Routes Error', 'makeGoogleDirectionsRoute, track has no "points" property');
    }
    if (track.points.length < 1) {
        throw new GetsWebClientException('Routes Error', 'makeGoogleDirectionsRoute, track has empty points array');
    }
    if (track.points.length == 1) {
        throw new GetsWebClientException('Routes Error', 'makeGoogleDirectionsRoute, can\'t request route for just one point');
    }
    if (track.points.length >= 11) {
        throw new GetsWebClientException('Routes Error', 'makeGoogleDirectionsRoute, total number of points in the route must be 10 or less (will be fixed in further updates)');
    }
    
    // Construct url for request
    //origin=Boston,MA&destination=Concord,MA&
    var urlRequest = 'http://maps.googleapis.com/maps/api/directions/json?sensor=false&';
    
    if (options) {
        for (var i = 0, len = options.length; i < len; i++) {
            if (options[i].name !== 'optimize') {
                urlRequest += options[i].name + '=' + options[i].value + '&';
            } else {
                var optimize = options[i];
            }
        }
    }
    
    var coords = track.points[0].coordinates.split(',');
    urlRequest += 'origin=' + String(coords[1] + ',' + coords[0]) + '&';
    
    coords = track.points[track.points.length - 1].coordinates.split(',');
    urlRequest += 'destination=' + String(coords[1] + ',' + coords[0]) + '&';
    
    if (track.points.length >= 3) {
        urlRequest += 'waypoints=';
        for (var i = 1; i < track.points.length - 1; i++) {
            var localCoords = track.points[i].coordinates.split(',');
            urlRequest += String(localCoords[1] + ',' + localCoords[0]) + '|';
        }
        if (optimize) {
            urlRequest += optimize.name + ':' + optimize.value;
        }
    }
    
    var getRouteRequest = $.ajax({
        url: RETRANSLATOR_ACTION,
        type: 'POST',
        async: true,
        dataType: 'json',
        data: JSON.stringify({url: urlRequest})
    });
    
    getRouteRequest.fail(function(jqXHR, textStatus) {
        throw new GetsWebClientException('Routes Error', 'makeGoogleDirectionsRoute, getRouteRequest failed ' + textStatus);
    });
    
    getRouteRequest.done(function(data, textStatus, jqXHR) {
        track.serviceRoutes = [];
        track.bounds = jqXHR.responseJSON.routes[0].bounds;
        for (var i = 0, len = jqXHR.responseJSON.routes.length; i < len; i++) {
            track.serviceRoutes.push(jqXHR.responseJSON.routes[i].overview_polyline.points);
        }
            
        if (callback) {
            callback();
        }
    });
    
    
    /*var newRoute = [];
    var legs = getRouteRequest.responseJSON.routes[0].legs;
    for (var j = 0, len = legs.length; j < len; j++) {
        newRoute.push({
            lat: legs[j].start_location.lat,
            lng: legs[j].start_location.lng
        });
    }
    
    newRoute.push({
        lat: legs[legs.length - 1].end_location.lat, 
        lng: legs[legs.length - 1].end_location.lat
    });
    
    Logger.debug(newRoute);
    track.googleRoute = newRoute;*/ 
};

/**
 * Request OSM obstacles over Overpass API
 * @param {type} track
 * @param {type} callback
 * @returns {undefined}
 */
Routes.prototype.requestOSMObstacles = function (track, callback) {
    if (!track) {
        throw new GetsWebClientException('Routes Error', 'requestOSMObstacles, track undefined or null');
    }
    if (!track.hasOwnProperty('bounds')) {
        //throw new GetsWebClientException('Routes Error', 'requestOSMObstacles, there is no bounds for this track');
        if (!track.hasOwnProperty('points')) {
            throw new GetsWebClientException('Routes Error', 'requestOSMObstacles, track has no "points" property');
        }
        
        track.bounds = this.getBoundBoxForPoints(track.points);
    }
    
    var bboxForHull = function (hull) {
        var points = hull.getHull();
        var north = 0.0, east = 0.0, south = 0.0, west = 0.0;
        north = south = points[0].x;
        east = west = points[0].y;
        for (var k = 1, len = points.length; k < len; k++) {
            if (points[k].x > north)
                north = points[k].x;
            if (points[k].x < south)
                south = points[k].x;
            if (points[k].y > east)
                east = points[k].y;
            if (points[k].y < west)
                west = points[k].y;
        }
        return {
            northeast: {
                lat: north,
                lng: east
            },
            southwest: {
                lat: south,
                lng: west
            }
        };
    };
    
    var urlRequest = 'http://overpass-api.de/api/interpreter?data=[out:xml][timeout:1000];(way["building"="yes"](' + track.bounds.southwest.lat + ',' + track.bounds.southwest.lng + ',' + track.bounds.northeast.lat + ',' + track.bounds.northeast.lng + ');way["natural"="water"](' + track.bounds.southwest.lat + ',' + track.bounds.southwest.lng + ',' + track.bounds.northeast.lat + ',' + track.bounds.northeast.lng + '););(._;>;);out skel qt;';
    urlRequest = urlRequest.split(' ').join('%20').split('"').join('%22');//replace(' ', '%20').replace('"','%22');
    Logger.debug(urlRequest);
  
    /*var getObstaclesRequest = $.ajax({
        url: urlRequest,
        type: 'GET',
        async: true,
        dataType: 'xml'
        //data: JSON.stringify({url: urlRequest})8
    });
    
    getObstaclesRequest.fail(function(jqXHR, textStatus) {
        throw new GetsWebClientException('Routes Error', 'makeGoogleDirectionsRoute, getObstaclesRequest failed ' + textStatus);
    });
    
    getObstaclesRequest.done(function(data, textStatus, jqXHR) {*/
        var data = $.parseXML('<?xml version="1.0" encoding="UTF-8"?> <osm version="0.6" generator="Overpass API"> <note>The data included in this document is from www.openstreetmap.org. The data is made available under ODbL.</note> <meta osm_base="2015-01-24T21:39:01Z"/> <node id="519976977" lat="61.7878929" lon="34.3660301"/> <node id="519976980" lat="61.7867312" lon="34.3643208"/> <node id="519976982" lat="61.7877439" lon="34.3662521"/> <node id="519976984" lat="61.7880229" lon="34.3657101"/> <node id="519976986" lat="61.7868382" lon="34.3642138"/> <node id="519976987" lat="61.7869032" lon="34.3648358"/> <node id="519976988" lat="61.7871172" lon="34.3633818"/> <node id="519976989" lat="61.7883659" lon="34.3642301"/> <node id="519976990" lat="61.7869262" lon="34.3642138"/> <node id="519976992" lat="61.7879809" lon="34.3660301"/> <node id="519976994" lat="61.7873992" lon="34.3629468"/> <node id="519976996" lat="61.7867962" lon="34.3649418"/> <node id="519976998" lat="61.7868542" lon="34.3651558"/> <node id="519976999" lat="61.7881939" lon="34.3656221"/> <node id="519977001" lat="61.7874832" lon="34.3626688"/> <node id="519977003" lat="61.7867122" lon="34.3642138"/> <node id="519977005" lat="61.7883469" lon="34.3650001"/> <node id="519977007" lat="61.7877859" lon="34.3656871"/> <node id="519977009" lat="61.7869262" lon="34.3643848"/> <node id="519977010" lat="61.7871972" lon="34.3636108"/> <node id="519977011" lat="61.7881749" lon="34.3640581"/> <node id="519977012" lat="61.7866672" lon="34.3642978"/> <node id="519977013" lat="61.7883659" lon="34.3637411"/> <node id="519977014" lat="61.7879809" lon="34.3659461"/> <node id="519977015" lat="61.7866022" lon="34.3641488"/> <node id="519977016" lat="61.7882589" lon="34.3650231"/> <node id="519977017" lat="61.7883239" lon="34.3641271"/> <node id="519977018" lat="61.7883239" lon="34.3641921"/> <node id="519977020" lat="61.7882359" lon="34.3654731"/> <node id="519977023" lat="61.7874832" lon="34.3631458"/> <node id="519977025" lat="61.7880459" lon="34.3658171"/> <node id="519977042" lat="61.7884309" lon="34.3639281"/> <node id="519977044" lat="61.7869262" lon="34.3646908"/> <node id="519977047" lat="61.7881939" lon="34.3642981"/> <node id="519977049" lat="61.7873992" lon="34.3626688"/> <node id="519977051" lat="61.7867962" lon="34.3643628"/> <node id="519977053" lat="61.7880459" lon="34.3653281"/> <node id="519977055" lat="61.7867732" lon="34.3647058"/> <node id="519977058" lat="61.7867962" lon="34.3645758"/> <node id="519977060" lat="61.7873992" lon="34.3632678"/> <node id="519977063" lat="61.7877439" lon="34.3657751"/> <node id="519977064" lat="61.7870332" lon="34.3633328"/> <node id="519977066" lat="61.7870752" lon="34.3632518"/> <node id="519977068" lat="61.7883009" lon="34.3649351"/> <node id="519977069" lat="61.7883239" lon="34.3650881"/> <node id="519977070" lat="61.7869452" lon="34.3640038"/> <node id="519977071" lat="61.7878509" lon="34.3656221"/> <node id="519977072" lat="61.7867542" lon="34.3639538"/> <node id="519977073" lat="61.7881749" lon="34.3653671"/> <node id="519977074" lat="61.7879389" lon="34.3658591"/> <node id="519977075" lat="61.7881299" lon="34.3655381"/> <node id="519977076" lat="61.7870562" lon="34.3648998"/> <node id="519977077" lat="61.7881449" lon="34.3649161"/> <node id="519977079" lat="61.7881749" lon="34.3639931"/> <node id="519977080" lat="61.7870982" lon="34.3634388"/> <node id="519977082" lat="61.7879809" lon="34.3662521"/> <node id="519977085" lat="61.7870562" lon="34.3641108"/> <node id="519977088" lat="61.7883659" lon="34.3641421"/> <node id="521698124" lat="61.7887450" lon="34.3669510"/> <node id="521698138" lat="61.7885090" lon="34.3669770"/> <node id="521698266" lat="61.7888100" lon="34.3666910"/> <node id="521698363" lat="61.7885090" lon="34.3666910"/> <node id="521796510" lat="61.7862316" lon="34.3659275"/> <node id="521796518" lat="61.7864909" lon="34.3657787"/> <node id="521796526" lat="61.7861883" lon="34.3655427"/> <node id="521796531" lat="61.7858870" lon="34.3659647"/> <node id="521796535" lat="61.7864082" lon="34.3655139"/> <node id="521796539" lat="61.7858954" lon="34.3663061"/> <node id="521796541" lat="61.7862556" lon="34.3658940"/> <node id="521796542" lat="61.7864498" lon="34.3658362"/> <node id="521796547" lat="61.7858186" lon="34.3660603"/> <node id="521796551" lat="61.7859379" lon="34.3661276"/> <node id="521796552" lat="61.7862133" lon="34.3658689"/> <node id="521796553" lat="61.7863167" lon="34.3656417"/> <node id="521796569" lat="61.7860189" lon="34.3661335"/> <node id="521796582" lat="61.7862561" lon="34.3654479"/> <node id="521796583" lat="61.7863850" lon="34.3656288"/> <node id="521796589" lat="61.7860831" lon="34.3663390"/> <node id="521796593" lat="61.7862393" lon="34.3657060"/> <node id="521796602" lat="61.7862999" lon="34.3660359"/> <node id="522678657" lat="61.7887904" lon="34.3653851"/> <node id="522683332" lat="61.7888759" lon="34.3650617"/> <node id="522684907" lat="61.7889121" lon="34.3656136"/> <node id="522687865" lat="61.7883790" lon="34.3659850"/> <node id="522689546" lat="61.7846900" lon="34.3642880"/> <node id="522690257" lat="61.7883790" lon="34.3662260"/> <node id="522691617" lat="61.7890726" lon="34.3643099"/> <node id="522692077" lat="61.7885079" lon="34.3661625"/> <node id="522692375" lat="61.7881660" lon="34.3662260"/> <node id="522693797" lat="61.7888885" lon="34.3655367"/> <node id="522696179" lat="61.7847740" lon="34.3645740"/> <node id="522697028" lat="61.7843050" lon="34.3640590"/> <node id="522697891" lat="61.7847900" lon="34.3650890"/> <node id="522697944" lat="61.7881010" lon="34.3670150"/> <node id="522700406" lat="61.7890489" lon="34.3643424"/> <node id="522703052" lat="61.7883370" lon="34.3667140"/> <node id="522705124" lat="61.7846900" lon="34.3646960"/> <node id="522705359" lat="61.7846480" lon="34.3647460"/> <node id="522706743" lat="61.7882230" lon="34.3670570"/> <node id="522710650" lat="61.7848810" lon="34.3648910"/> <node id="522712183" lat="61.7881010" lon="34.3635440"/> <node id="522712868" lat="61.7889652" lon="34.3643159"/> <node id="522713445" lat="61.7845380" lon="34.3644670"/> <node id="522713946" lat="61.7880820" lon="34.3634940"/> <node id="522714172" lat="61.7892813" lon="34.3651074"/> <node id="522716335" lat="61.7848620" lon="34.3648260"/> <node id="522717268" lat="61.7884484" lon="34.3659672"/> <node id="522718015" lat="61.7888500" lon="34.3652001"/> <node id="522719240" lat="61.7881010" lon="34.3670570"/> <node id="522719565" lat="61.7844310" lon="34.3638610"/> <node id="522720835" lat="61.7886991" lon="34.3643437"/> <node id="522721347" lat="61.7888522" lon="34.3655866"/> <node id="522723863" lat="61.7847550" lon="34.3644180"/> <node id="522724133" lat="61.7888710" lon="34.3652746"/> <node id="522724891" lat="61.7891507" lon="34.3649213"/> <node id="522724981" lat="61.7849682" lon="34.3633847"/> <node id="522725762" lat="61.7847900" lon="34.3645470"/> <node id="522730313" lat="61.7887414" lon="34.3646226"/> <node id="522730744" lat="61.7849040" lon="34.3648680"/> <node id="522730889" lat="61.7846030" lon="34.3647840"/> <node id="522733698" lat="61.7882230" lon="34.3670150"/> <node id="522734852" lat="61.7879710" lon="34.3667140"/> <node id="522735499" lat="61.7881660" lon="34.3659850"/> <node id="522737046" lat="61.7887660" lon="34.3653153"/> <node id="522738545" lat="61.7844460" lon="34.3645740"/> <node id="522739915" lat="61.7882080" lon="34.3633880"/> <node id="522741357" lat="61.7847320" lon="34.3644670"/> <node id="522746049" lat="61.7848857" lon="34.3631412"/> <node id="522747141" lat="61.7881240" lon="34.3632580"/> <node id="522752710" lat="61.7888278" lon="34.3651276"/> <node id="522754408" lat="61.7848620" lon="34.3647840"/> <node id="522755062" lat="61.7885366" lon="34.3645664"/> <node id="522755948" lat="61.7846030" lon="34.3644180"/> <node id="522756833" lat="61.7879100" lon="34.3668440"/> <node id="522758865" lat="61.7848610" lon="34.3635472"/> <node id="522760726" lat="61.7849040" lon="34.3649550"/> <node id="522764293" lat="61.7846480" lon="34.3647840"/> <node id="522766146" lat="61.7889546" lon="34.3640345"/> <node id="522767545" lat="61.7887237" lon="34.3655919"/> <node id="522767759" lat="61.7888775" lon="34.3652958"/> <node id="522768520" lat="61.7892540" lon="34.3650182"/> <node id="522770123" lat="61.7883370" lon="34.3670340"/> <node id="522771838" lat="61.7846030" lon="34.3646540"/> <node id="522772179" lat="61.7887080" lon="34.3643727"/> <node id="522780833" lat="61.7845840" lon="34.3647190"/> <node id="522781032" lat="61.7847785" lon="34.3633037"/> <node id="522782073" lat="61.7892791" lon="34.3649838"/> <node id="584905191" lat="61.7887832" lon="34.3657872"/> <node id="1692701788" lat="61.7864208" lon="34.3655544"/> <node id="1692701814" lat="61.7868067" lon="34.3650164"/> <node id="1824106802" lat="61.7871003" lon="34.3639543"/> <node id="1824137605" lat="61.7886418" lon="34.3666910"/> <node id="1824137606" lat="61.7886933" lon="34.3666910"/> <node id="393069138" lat="61.7836110" lon="34.3704410"/> <node id="393069141" lat="61.7839390" lon="34.3716010"/> <node id="393069183" lat="61.7840745" lon="34.3784984"/> <node id="2353316160" lat="61.7840590" lon="34.3781028"/> <node id="393064130" lat="61.7883789" lon="34.3719794"/> <node id="393064131" lat="61.7882997" lon="34.3717383"/> <node id="393064132" lat="61.7883681" lon="34.3716376"/> <node id="393064133" lat="61.7884473" lon="34.3718787"/> <node id="393064134" lat="61.7882880" lon="34.3732410"/> <node id="393064135" lat="61.7884210" lon="34.3735880"/> <node id="393064136" lat="61.7882880" lon="34.3735880"/> <node id="393064137" lat="61.7884210" lon="34.3732410"/> <node id="393064138" lat="61.7860790" lon="34.3709180"/> <node id="393064139" lat="61.7848390" lon="34.3727980"/> <node id="393064140" lat="61.7844500" lon="34.3716580"/> <node id="393064141" lat="61.7856900" lon="34.3697810"/> <node id="393064175" lat="61.7862700" lon="34.3734810"/> <node id="393064178" lat="61.7858200" lon="34.3720580"/> <node id="393064179" lat="61.7862354" lon="34.3712339"/> <node id="393064182" lat="61.7860103" lon="34.3715423"/> <node id="393064183" lat="61.7863363" lon="34.3729273"/> <node id="393064184" lat="61.7864853" lon="34.3722266"/> <node id="393064185" lat="61.7862623" lon="34.3711989"/> <node id="393064187" lat="61.7864523" lon="34.3715367"/> <node id="393064188" lat="61.7863705" lon="34.3711067"/> <node id="393069139" lat="61.7843700" lon="34.3694490"/> <node id="393069140" lat="61.7846980" lon="34.3706090"/> <node id="521697851" lat="61.7880820" lon="34.3685370"/> <node id="521697870" lat="61.7881430" lon="34.3683010"/> <node id="521697887" lat="61.7882080" lon="34.3682860"/> <node id="521697964" lat="61.7883790" lon="34.3699340"/> <node id="521698037" lat="61.7881880" lon="34.3683660"/> <node id="521698056" lat="61.7882950" lon="34.3697240"/> <node id="521698058" lat="61.7882530" lon="34.3695900"/> <node id="521698108" lat="61.7888750" lon="34.3673780"/> <node id="521698149" lat="61.7881880" lon="34.3685370"/> <node id="521698161" lat="61.7881430" lon="34.3682860"/> <node id="521698173" lat="61.7880360" lon="34.3701740"/> <node id="521698198" lat="61.7880820" lon="34.3683010"/> <node id="521698200" lat="61.7881010" lon="34.3703190"/> <node id="521698203" lat="61.7884440" lon="34.3697240"/> <node id="521698269" lat="61.7881010" lon="34.3702770"/> <node id="521698359" lat="61.7879335" lon="34.3701470"/> <node id="521698368" lat="61.7881240" lon="34.3699760"/> <node id="521698378" lat="61.7880590" lon="34.3699340"/> <node id="521698384" lat="61.7882080" lon="34.3683660"/> <node id="521698394" lat="61.7883370" lon="34.3698460"/> <node id="521698459" lat="61.7883600" lon="34.3694380"/> <node id="521698460" lat="61.7889820" lon="34.3672290"/> <node id="521698462" lat="61.7880590" lon="34.3684950"/> <node id="521698468" lat="61.7880170" lon="34.3701470"/> <node id="521698477" lat="61.7879290" lon="34.3684950"/> <node id="522678050" lat="61.7887036" lon="34.3729519"/> <node id="522678125" lat="61.7884020" lon="34.3706200"/> <node id="522684173" lat="61.7887688" lon="34.3726950"/> <node id="522685193" lat="61.7880590" lon="34.3708110"/> <node id="522688035" lat="61.7884020" lon="34.3703840"/> <node id="522692211" lat="61.7880820" lon="34.3730240"/> <node id="522692735" lat="61.7880820" lon="34.3728940"/> <node id="522693773" lat="61.7885660" lon="34.3705170"/> <node id="522700122" lat="61.7879710" lon="34.3731950"/> <node id="522700310" lat="61.7890470" lon="34.3698310"/> <node id="522700435" lat="61.7884690" lon="34.3724398"/> <node id="522703226" lat="61.7880820" lon="34.3670990"/> <node id="522704097" lat="61.7886580" lon="34.3703460"/> <node id="522704565" lat="61.7880590" lon="34.3710700"/> <node id="522705196" lat="61.7886123" lon="34.3721374"/> <node id="522706964" lat="61.7880590" lon="34.3670990"/> <node id="522708876" lat="61.7885945" lon="34.3728166"/> <node id="522709991" lat="61.7885688" lon="34.3720069"/> <node id="522710408" lat="61.7879710" lon="34.3727220"/> <node id="522712926" lat="61.7890660" lon="34.3698460"/> <node id="522715327" lat="61.7883370" lon="34.3707540"/> <node id="522718016" lat="61.7879520" lon="34.3709900"/> <node id="522720464" lat="61.7883140" lon="34.3707270"/> <node id="522721360" lat="61.7886810" lon="34.3703840"/> <node id="522731485" lat="61.7880820" lon="34.3681940"/> <node id="522732594" lat="61.7881010" lon="34.3734350"/> <node id="522734079" lat="61.7879940" lon="34.3730240"/> <node id="522736161" lat="61.7880820" lon="34.3708340"/> <node id="522737185" lat="61.7884860" lon="34.3702540"/> <node id="522737281" lat="61.7879940" lon="34.3728940"/> <node id="522741555" lat="61.7881240" lon="34.3734350"/> <node id="522744528" lat="61.7887826" lon="34.3726744"/> <node id="522745201" lat="61.7886373" lon="34.3727528"/> <node id="522750769" lat="61.7881240" lon="34.3731720"/> <node id="522751416" lat="61.7881010" lon="34.3727220"/> <node id="522751499" lat="61.7884460" lon="34.3721899"/> <node id="522754663" lat="61.7884440" lon="34.3705550"/> <node id="522754828" lat="61.7884250" lon="34.3706470"/> <node id="522756604" lat="61.7879290" lon="34.3681940"/> <node id="522763289" lat="61.7890890" lon="34.3694610"/> <node id="522766983" lat="61.7885927" lon="34.3721665"/> <node id="522768467" lat="61.7880820" lon="34.3711120"/> <node id="522771276" lat="61.7880170" lon="34.3708990"/> <node id="522772153" lat="61.7888182" lon="34.3727811"/> <node id="522774356" lat="61.7891540" lon="34.3697240"/> <node id="522780110" lat="61.7885093" lon="34.3723798"/> <node id="522782342" lat="61.7880170" lon="34.3709250"/> <node id="1335828052" lat="61.7884198" lon="34.3704565"/> <node id="1824126175" lat="61.7879308" lon="34.3688806"/> <node id="2353316451" lat="61.7860495" lon="34.3719907"/> <node id="2353316520" lat="61.7861186" lon="34.3718960"/> <node id="2353316580" lat="61.7863240" lon="34.3715232"/> <node id="2353316581" lat="61.7863165" lon="34.3724579"/> <node id="2353316582" lat="61.7863363" lon="34.3716660"/> <node id="2353316584" lat="61.7863538" lon="34.3716206"/> <node id="2353316585" lat="61.7863584" lon="34.3716357"/> <node id="2353316586" lat="61.7863842" lon="34.3723652"/> <node id="2353316587" lat="61.7863911" lon="34.3723877"/> <node id="2353316588" lat="61.7864012" lon="34.3723739"/> <node id="2353316589" lat="61.7864240" lon="34.3720262"/> <node id="2353316590" lat="61.7864243" lon="34.3724492"/> <node id="2353316591" lat="61.7864236" lon="34.3728076"/> <node id="2353316592" lat="61.7864399" lon="34.3720044"/> <node id="2353316593" lat="61.7864575" lon="34.3722648"/> <node id="2353316594" lat="61.7864444" lon="34.3723147"/> <node id="2353316595" lat="61.7864644" lon="34.3722874"/> <node id="2353316596" lat="61.7864675" lon="34.3723900"/> <node id="393064006" lat="61.7862786" lon="34.3737737"/> <node id="393064007" lat="61.7861595" lon="34.3750189"/> <node id="393064009" lat="61.7858610" lon="34.3744137"/> <node id="393064010" lat="61.7862860" lon="34.3750688"/> <node id="393064011" lat="61.7863999" lon="34.3738233"/> <node id="393064025" lat="61.7862219" lon="34.3755799"/> <node id="393064026" lat="61.7857186" lon="34.3772535"/> <node id="393064027" lat="61.7851460" lon="34.3754036"/> <node id="393064173" lat="61.7850110" lon="34.3753010"/> <node id="393064174" lat="61.7845490" lon="34.3738780"/> <node id="393069171" lat="61.7842636" lon="34.3753988"/> <node id="393069174" lat="61.7842896" lon="34.3756630"/> <node id="393069175" lat="61.7847876" lon="34.3749817"/> <node id="393069176" lat="61.7847229" lon="34.3747704"/> <node id="393069181" lat="61.7856115" lon="34.3776102"/> <node id="393069182" lat="61.7850243" lon="34.3757534"/> <node id="393069186" lat="61.7843556" lon="34.3793870"/> <node id="521697938" lat="61.7886791" lon="34.3781705"/> <node id="521698142" lat="61.7881791" lon="34.3791775"/> <node id="521698209" lat="61.7881441" lon="34.3791625"/> <node id="521698216" lat="61.7879767" lon="34.3775355"/> <node id="521698233" lat="61.7881416" lon="34.3788766"/> <node id="521698336" lat="61.7880151" lon="34.3790295"/> <node id="521698374" lat="61.7880959" lon="34.3788230"/> <node id="521698377" lat="61.7879921" lon="34.3789645"/> <node id="521698466" lat="61.7887431" lon="34.3784115"/> <node id="521698513" lat="61.7880883" lon="34.3775302"/> <node id="521698535" lat="61.7874110" lon="34.3784728"/> <node id="521698536" lat="61.7872663" lon="34.3791161"/> <node id="521698538" lat="61.7876546" lon="34.3798991"/> <node id="521698540" lat="61.7871529" lon="34.3799107"/> <node id="521698542" lat="61.7876715" lon="34.3784329"/> <node id="521698544" lat="61.7874109" lon="34.3784393"/> <node id="521698546" lat="61.7871489" lon="34.3791188"/> <node id="521698547" lat="61.7872636" lon="34.3786069"/> <node id="522677323" lat="61.7880590" lon="34.3739660"/> <node id="522677423" lat="61.7882080" lon="34.3745460"/> <node id="522677645" lat="61.7883600" lon="34.3750450"/> <node id="522677843" lat="61.7882080" lon="34.3745040"/> <node id="522682559" lat="61.7882230" lon="34.3762620"/> <node id="522683866" lat="61.7879940" lon="34.3743320"/> <node id="522688463" lat="61.7879940" lon="34.3756400"/> <node id="522691216" lat="61.7882530" lon="34.3745460"/> <node id="522697164" lat="61.7869674" lon="34.3792662"/> <node id="522697344" lat="61.7882950" lon="34.3742440"/> <node id="522698473" lat="61.7879710" lon="34.3742440"/> <node id="522698808" lat="61.7881010" lon="34.3739660"/> <node id="522700374" lat="61.7885510" lon="34.3765250"/> <node id="522703012" lat="61.7882720" lon="34.3764340"/> <node id="522705343" lat="61.7866941" lon="34.3790951"/> <node id="522707244" lat="61.7880170" lon="34.3742940"/> <node id="522711089" lat="61.7884440" lon="34.3752970"/> <node id="522714513" lat="61.7889090" lon="34.3771850"/> <node id="522715833" lat="61.7882230" lon="34.3755980"/> <node id="522716673" lat="61.7888100" lon="34.3773340"/> <node id="522726869" lat="61.7881880" lon="34.3763540"/> <node id="522727948" lat="61.7880170" lon="34.3763920"/> <node id="522733349" lat="61.7881403" lon="34.3763963"/> <node id="522735722" lat="61.7880590" lon="34.3740310"/> <node id="522737105" lat="61.7886580" lon="34.3739660"/> <node id="522740166" lat="61.7882720" lon="34.3742940"/> <node id="522740460" lat="61.7880393" lon="34.3755247"/> <node id="522742989" lat="61.7870218" lon="34.3788061"/> <node id="522743157" lat="61.7880185" lon="34.3773752"/> <node id="522745508" lat="61.7882720" lon="34.3741870"/> <node id="522759870" lat="61.7881446" lon="34.3773727"/> <node id="522762011" lat="61.7884250" lon="34.3762200"/> <node id="522762502" lat="61.7884039" lon="34.3799913"/> <node id="522763836" lat="61.7867330" lon="34.3787664"/> <node id="522769841" lat="61.7886580" lon="34.3763690"/> <node id="522777279" lat="61.7880142" lon="34.3763988"/> <node id="522778735" lat="61.7885741" lon="34.3737408"/> <node id="610271246" lat="61.7879759" lon="34.3777612"/> <node id="1712237319" lat="61.7878816" lon="34.3760905"/> <node id="1712237320" lat="61.7878863" lon="34.3762992"/> <node id="1712237322" lat="61.7879267" lon="34.3760860"/> <node id="1712237323" lat="61.7879314" lon="34.3762946"/> <node id="1831896423" lat="61.7867685" lon="34.3787851"/> <node id="1831896424" lat="61.7867759" lon="34.3787223"/> <node id="1831896431" lat="61.7868237" lon="34.3791638"/> <node id="1831896432" lat="61.7868288" lon="34.3791210"/> <node id="1831896437" lat="61.7868512" lon="34.3787622"/> <node id="1831896438" lat="61.7868564" lon="34.3787184"/> <node id="1831896440" lat="61.7869042" lon="34.3792328"/> <node id="1831896443" lat="61.7869122" lon="34.3791652"/> <node id="2353316180" lat="61.7841503" lon="34.3783912"/> <node id="2353316246" lat="61.7842567" lon="34.3755553"/> <node id="2353316264" lat="61.7842953" lon="34.3755025"/> <node id="2353316282" lat="61.7843036" lon="34.3763565"/> <node id="2353316316" lat="61.7843672" lon="34.3765542"/> <node id="2353316332" lat="61.7843820" lon="34.3767607"/> <node id="2353316372" lat="61.7844601" lon="34.3749770"/> <node id="2353316412" lat="61.7844931" lon="34.3750848"/> <node id="2353316428" lat="61.7845754" lon="34.3773722"/> <node id="2353316430" lat="61.7846501" lon="34.3747171"/> <node id="2353316431" lat="61.7846830" lon="34.3748250"/> <node id="2353316442" lat="61.7849419" lon="34.3754377"/> <node id="2353316443" lat="61.7849645" lon="34.3758379"/> <node id="2353316444" lat="61.7849861" lon="34.3759061"/> <node id="2353316445" lat="61.7850055" lon="34.3756353"/> <node id="2353316447" lat="61.7856479" lon="34.3763747"/> <node id="2353316448" lat="61.7858595" lon="34.3770584"/> <node id="2353316449" lat="61.7859341" lon="34.3759785"/> <node id="2353316450" lat="61.7859637" lon="34.3760741"/> <node id="2353316477" lat="61.7860851" lon="34.3747622"/> <node id="2353316491" lat="61.7860781" lon="34.3757791"/> <node id="2353316506" lat="61.7861077" lon="34.3758747"/> <node id="2353316574" lat="61.7861130" lon="34.3749135"/> <node id="2353316575" lat="61.7861253" lon="34.3747786"/> <node id="2353316576" lat="61.7861512" lon="34.3740399"/> <node id="2353316579" lat="61.7862506" lon="34.3740806"/> <node id="2353316714" lat="61.7873741" lon="34.3784737"/> <node id="2353316740" lat="61.7873748" lon="34.3786043"/> <node id="2353316767" lat="61.7876499" lon="34.3786208"/> <node id="393063822" lat="61.7860633" lon="34.3832471"/> <node id="393063823" lat="61.7861436" lon="34.3844741"/> <node id="393063824" lat="61.7860308" lon="34.3844606"/> <node id="393063832" lat="61.7862107" lon="34.3832648"/> <node id="517704454" lat="61.7866339" lon="34.3828596"/> <node id="517704457" lat="61.7866321" lon="34.3833910"/> <node id="517704461" lat="61.7864294" lon="34.3833709"/> <node id="517704464" lat="61.7866339" lon="34.3825816"/> <node id="517704467" lat="61.7864174" lon="34.3839117"/> <node id="517704471" lat="61.7864619" lon="34.3825816"/> <node id="517704473" lat="61.7866201" lon="34.3839318"/> <node id="517704481" lat="61.7864619" lon="34.3828596"/> <node id="521697844" lat="61.7885697" lon="34.3822789"/> <node id="521697913" lat="61.7889133" lon="34.3815061"/> <node id="521697945" lat="61.7885066" lon="34.3820782"/> <node id="521698422" lat="61.7889764" lon="34.3817068"/> <node id="522680026" lat="61.7879699" lon="34.3833570"/> <node id="522680329" lat="61.7885288" lon="34.3866569"/> <node id="522682689" lat="61.7888333" lon="34.3824911"/> <node id="522682795" lat="61.7882198" lon="34.3833415"/> <node id="522682958" lat="61.7883423" lon="34.3806834"/> <node id="522684283" lat="61.7880632" lon="34.3817241"/> <node id="522684711" lat="61.7885635" lon="34.3835917"/> <node id="522685227" lat="61.7881244" lon="34.3810214"/> <node id="522685525" lat="61.7882512" lon="34.3808042"/> <node id="522686542" lat="61.7879886" lon="34.3854485"/> <node id="522687542" lat="61.7879074" lon="34.3806774"/> <node id="522688319" lat="61.7881316" lon="34.3829255"/> <node id="522689030" lat="61.7879699" lon="34.3837570"/> <node id="522692733" lat="61.7879616" lon="34.3861264"/> <node id="522694864" lat="61.7880604" lon="34.3804374"/> <node id="522695272" lat="61.7875765" lon="34.3850376"/> <node id="522695733" lat="61.7881409" lon="34.3842080"/> <node id="522696633" lat="61.7872108" lon="34.3850463"/> <node id="522696793" lat="61.7883803" lon="34.3803101"/> <node id="522697145" lat="61.7879592" lon="34.3828261"/> <node id="522697500" lat="61.7883549" lon="34.3839140"/> <node id="522697921" lat="61.7880214" lon="34.3827569"/> <node id="522701374" lat="61.7880724" lon="34.3833497"/> <node id="522701481" lat="61.7887617" lon="34.3827876"/> <node id="522704909" lat="61.7881611" lon="34.3838902"/> <node id="522705628" lat="61.7879585" lon="34.3833395"/> <node id="522705804" lat="61.7880374" lon="34.3807804"/> <node id="522707526" lat="61.7887828" lon="34.3827603"/> <node id="522708439" lat="61.7881444" lon="34.3808874"/> <node id="522708778" lat="61.7880769" lon="34.3837000"/> <node id="522709054" lat="61.7877257" lon="34.3860137"/> <node id="522710096" lat="61.7881881" lon="34.3829257"/> <node id="522711720" lat="61.7878779" lon="34.3858769"/> <node id="522712589" lat="61.7880959" lon="34.3841660"/> <node id="522714602" lat="61.7881444" lon="34.3809944"/> <node id="522716225" lat="61.7879164" lon="34.3852428"/> <node id="522716475" lat="61.7878754" lon="34.3863758"/> <node id="522717745" lat="61.7881645" lon="34.3857938"/> <node id="522718279" lat="61.7880604" lon="34.3807424"/> <node id="522718630" lat="61.7881882" lon="34.3827580"/> <node id="522722108" lat="61.7882899" lon="34.3837150"/> <node id="522722313" lat="61.7888405" lon="34.3829595"/> <node id="522722703" lat="61.7882936" lon="34.3861349"/> <node id="522723184" lat="61.7881815" lon="34.3817171"/> <node id="522723251" lat="61.7879299" lon="34.3813766"/> <node id="522723464" lat="61.7880842" lon="34.3849796"/> <node id="522725817" lat="61.7881189" lon="34.3841880"/> <node id="522726808" lat="61.7875702" lon="34.3838515"/> <node id="522727652" lat="61.7884944" lon="34.3802969"/> <node id="522729582" lat="61.7881213" lon="34.3803660"/> <node id="522730114" lat="61.7887188" lon="34.3826396"/> <node id="522731202" lat="61.7879476" lon="34.3827147"/> <node id="522733952" lat="61.7885060" lon="34.3833933"/> <node id="522734579" lat="61.7885045" lon="34.3865877"/> <node id="522735115" lat="61.7884096" lon="34.3804092"/> <node id="522735947" lat="61.7889914" lon="34.3830367"/> <node id="522736377" lat="61.7883952" lon="34.3859754"/> <node id="522738600" lat="61.7881528" lon="34.3807033"/> <node id="522741432" lat="61.7882789" lon="34.3864864"/> <node id="522741529" lat="61.7877187" lon="34.3862228"/> <node id="522742216" lat="61.7886105" lon="34.3864216"/> <node id="522742734" lat="61.7881768" lon="34.3813620"/> <node id="522742983" lat="61.7881431" lon="34.3825540"/> <node id="522746700" lat="61.7877891" lon="34.3863704"/> <node id="522748095" lat="61.7882830" lon="34.3854518"/> <node id="522748437" lat="61.7880405" lon="34.3809026"/> <node id="522748659" lat="61.7880782" lon="34.3855524"/> <node id="522752954" lat="61.7880213" lon="34.3828265"/> <node id="522755707" lat="61.7885076" lon="34.3861279"/> <node id="522759856" lat="61.7882200" lon="34.3831493"/> <node id="522762381" lat="61.7882736" lon="34.3804516"/> <node id="522763558" lat="61.7880742" lon="34.3825581"/> <node id="522773152" lat="61.7882370" lon="34.3855240"/> <node id="522774060" lat="61.7880794" lon="34.3807994"/> <node id="522777967" lat="61.7872045" lon="34.3838602"/> <node id="522778863" lat="61.7881451" lon="34.3827031"/> <node id="522780177" lat="61.7880301" lon="34.3853834"/> <node id="522781440" lat="61.7879074" lon="34.3810364"/> <node id="528511766" lat="61.7880598" lon="34.3833402"/> <node id="1296575247" lat="61.7882197" lon="34.3867161"/> <node id="1296575265" lat="61.7881061" lon="34.3858957"/> <node id="1296575270" lat="61.7881632" lon="34.3862819"/> <node id="1296575336" lat="61.7880542" lon="34.3859869"/> <node id="1296575341" lat="61.7882165" lon="34.3861934"/> <node id="1296575377" lat="61.7882738" lon="34.3866264"/> <node id="2353316577" lat="61.7861707" lon="34.3834640"/> <node id="2353316578" lat="61.7862053" lon="34.3834681"/> <node id="2353316673" lat="61.7873220" lon="34.3850436"/> <node id="2353316685" lat="61.7873226" lon="34.3851621"/> <node id="2353316745" lat="61.7874807" lon="34.3850399"/> <node id="2353316746" lat="61.7874813" lon="34.3851584"/> <node id="2461210677" lat="61.7881368" lon="34.3851296"/> <node id="2461210681" lat="61.7881582" lon="34.3850959"/> <node id="2461210684" lat="61.7879793" lon="34.3857052"/> <node id="2461210687" lat="61.7878221" lon="34.3858769"/> <node id="2461210690" lat="61.7877689" lon="34.3859145"/> <node id="2461210694" lat="61.7879299" lon="34.3862873"/> <node id="2461210698" lat="61.7877524" lon="34.3863195"/> <node id="2461210701" lat="61.7878335" lon="34.3863865"/> <node id="2461210704" lat="61.7880136" lon="34.3860486"/> <node id="2461210707" lat="61.7877131" lon="34.3861103"/> <node id="2467696782" lat="61.7881315" lon="34.3831490"/> <node id="2467696783" lat="61.7881836" lon="34.3833413"/> <node id="393063777" lat="61.7866213" lon="34.3889508"/> <node id="393063780" lat="61.7865302" lon="34.3890093"/> <node id="393063781" lat="61.7866693" lon="34.3892852"/> <node id="393063782" lat="61.7865782" lon="34.3893437"/> <node id="393063783" lat="61.7870900" lon="34.3894190"/> <node id="393063784" lat="61.7871090" lon="34.3896900"/> <node id="393063785" lat="61.7871890" lon="34.3896590"/> <node id="393063786" lat="61.7871700" lon="34.3894000"/> <node id="393063787" lat="61.7878180" lon="34.3891600"/> <node id="393063788" lat="61.7878600" lon="34.3890680"/> <node id="393063789" lat="61.7877610" lon="34.3888810"/> <node id="393063790" lat="61.7879987" lon="34.3915593"/> <node id="393063791" lat="61.7880881" lon="34.3914180"/> <node id="393063792" lat="61.7877190" lon="34.3889690"/> <node id="393063793" lat="61.7879624" lon="34.3915810"/> <node id="393063794" lat="61.7880598" lon="34.3913377"/> <node id="393063795" lat="61.7879704" lon="34.3914790"/> <node id="393063796" lat="61.7878700" lon="34.3916917"/> <node id="393063797" lat="61.7878556" lon="34.3916380"/> <node id="393063798" lat="61.7879480" lon="34.3915273"/> <node id="393063799" lat="61.7881892" lon="34.3912336"/> <node id="393063800" lat="61.7881083" lon="34.3913335"/> <node id="393063801" lat="61.7880878" lon="34.3912594"/> <node id="393063802" lat="61.7881687" lon="34.3911595"/> <node id="393063815" lat="61.7875900" lon="34.3896100"/> <node id="393063816" lat="61.7876890" lon="34.3892780"/> <node id="393063817" lat="61.7876010" lon="34.3891410"/> <node id="393063818" lat="61.7874900" lon="34.3894800"/> <node id="393063839" lat="61.7865779" lon="34.3926729"/> <node id="393063840" lat="61.7867602" lon="34.3923339"/> <node id="393063841" lat="61.7861064" lon="34.3909134"/> <node id="517724618" lat="61.7848735" lon="34.3916167"/> <node id="517724636" lat="61.7847243" lon="34.3914970"/> <node id="517724649" lat="61.7848849" lon="34.3923634"/> <node id="517724737" lat="61.7857059" lon="34.3922773"/> <node id="517724764" lat="61.7854458" lon="34.3925027"/> <node id="517724792" lat="61.7849702" lon="34.3922027"/> <node id="517724956" lat="61.7857864" lon="34.3930022"/> <node id="517725092" lat="61.7859688" lon="34.3929486"/> <node id="517725106" lat="61.7856404" lon="34.3921261"/> <node id="517725183" lat="61.7845287" lon="34.3920925"/> <node id="517725384" lat="61.7856285" lon="34.3918835"/> <node id="517725644" lat="61.7848085" lon="34.3913931"/> <node id="517725809" lat="61.7847948" lon="34.3917266"/> <node id="517725897" lat="61.7851168" lon="34.3925508"/> <node id="517725904" lat="61.7855790" lon="34.3925228"/> <node id="517726271" lat="61.7850314" lon="34.3927114"/> <node id="517726295" lat="61.7858983" lon="34.3927857"/> <node id="517726297" lat="61.7844582" lon="34.3918629"/> <node id="522678446" lat="61.7847493" lon="34.3909577"/> <node id="522681377" lat="61.7849301" lon="34.3906216"/> <node id="522685049" lat="61.7846131" lon="34.3907716"/> <node id="522688536" lat="61.7846691" lon="34.3904223"/> <node id="522692426" lat="61.7863765" lon="34.3886945"/> <node id="522699269" lat="61.7847697" lon="34.3902354"/> <node id="522713369" lat="61.7884061" lon="34.3868493"/> <node id="522716109" lat="61.7863332" lon="34.3883913"/> <node id="522734966" lat="61.7864272" lon="34.3885022"/> <node id="522754553" lat="61.7862825" lon="34.3885836"/> <node id="522762234" lat="61.7846463" lon="34.3907098"/> <node id="522770910" lat="61.7844951" lon="34.3904878"/> <node id="522778706" lat="61.7846087" lon="34.3902768"/> <node id="1296575319" lat="61.7863269" lon="34.3913742"/> <node id="1296575348" lat="61.7865809" lon="34.3913656"/> <node id="1296575384" lat="61.7883685" lon="34.3868822"/> <node id="1296575395" lat="61.7864231" lon="34.3916591"/> <node id="1296575426" lat="61.7883143" lon="34.3869718"/> <node id="1296575430" lat="61.7864722" lon="34.3911040"/> <node id="1350045329" lat="61.7859768" lon="34.3912201"/> <node id="1741631945" lat="61.7851736" lon="34.3911994"/> <node id="1741631947" lat="61.7852076" lon="34.3908405"/> <node id="1741631980" lat="61.7855303" lon="34.3920469"/> <node id="1741632055" lat="61.7859604" lon="34.3911848"/> <node id="1741632086" lat="61.7860882" lon="34.3919194"/> <node id="1741632089" lat="61.7861401" lon="34.3920444"/> <node id="1741632095" lat="61.7861883" lon="34.3917332"/> <node id="1741632112" lat="61.7862397" lon="34.3918592"/> <node id="1741632116" lat="61.7862645" lon="34.3912938"/> <node id="1741632127" lat="61.7862808" lon="34.3912634"/> <node id="1741632149" lat="61.7864542" lon="34.3917339"/> <node id="1741632153" lat="61.7864862" lon="34.3916745"/> <node id="1741632157" lat="61.7865109" lon="34.3911971"/> <node id="1741632168" lat="61.7865462" lon="34.3911314"/> <node id="1741632169" lat="61.7865592" lon="34.3913134"/> <node id="1741632172" lat="61.7865945" lon="34.3912478"/> <node id="517724561" lat="61.7857891" lon="34.3932963"/> <way id="42032987"> <nd ref="521698108"/> <nd ref="521698124"/> <nd ref="521698138"/> <nd ref="521698363"/> <nd ref="1824137605"/> <nd ref="1824137606"/> <nd ref="521698266"/> <nd ref="521698460"/> <nd ref="521698108"/> </way> <way id="42081190"> <nd ref="522731485"/> <nd ref="522756604"/> <nd ref="522756833"/> <nd ref="522734852"/> <nd ref="522703052"/> <nd ref="522770123"/> <nd ref="522706743"/> <nd ref="522733698"/> <nd ref="522697944"/> <nd ref="522719240"/> <nd ref="522703226"/> <nd ref="522706964"/> <nd ref="522731485"/> </way> <way id="41961105"> <nd ref="519976982"/> <nd ref="519977063"/> <nd ref="519977007"/> <nd ref="519977071"/> <nd ref="519977053"/> <nd ref="519977077"/> <nd ref="519977047"/> <nd ref="519977011"/> <nd ref="519977079"/> <nd ref="519977013"/> <nd ref="519977042"/> <nd ref="519977017"/> <nd ref="519977088"/> <nd ref="519976989"/> <nd ref="519977018"/> <nd ref="519977068"/> <nd ref="519977005"/> <nd ref="519977069"/> <nd ref="519977016"/> <nd ref="519977073"/> <nd ref="519977020"/> <nd ref="519976999"/> <nd ref="519977075"/> <nd ref="519976984"/> <nd ref="519977025"/> <nd ref="519977014"/> <nd ref="519977074"/> <nd ref="519976977"/> <nd ref="519976992"/> <nd ref="519977082"/> <nd ref="519976982"/> </way> <way id="41961107"> <nd ref="519977044"/> <nd ref="519977009"/> <nd ref="519977051"/> <nd ref="519976980"/> <nd ref="519977003"/> <nd ref="519977012"/> <nd ref="519977015"/> <nd ref="519977072"/> <nd ref="519976986"/> <nd ref="519976990"/> <nd ref="519977070"/> <nd ref="519977080"/> <nd ref="519977064"/> <nd ref="519977066"/> <nd ref="519976988"/> <nd ref="519976994"/> <nd ref="519977049"/> <nd ref="519977001"/> <nd ref="519977023"/> <nd ref="519977060"/> <nd ref="519977010"/> <nd ref="1824106802"/> <nd ref="519977085"/> <nd ref="519977076"/> <nd ref="519976998"/> <nd ref="1692701814"/> <nd ref="519976996"/> <nd ref="519976987"/> <nd ref="519977055"/> <nd ref="519977058"/> <nd ref="519977044"/> </way> <way id="42036101"> <nd ref="521796593"/> <nd ref="521796526"/> <nd ref="521796582"/> <nd ref="521796553"/> <nd ref="521796535"/> <nd ref="1692701788"/> <nd ref="521796518"/> <nd ref="521796542"/> <nd ref="521796583"/> <nd ref="521796552"/> <nd ref="521796510"/> <nd ref="521796541"/> <nd ref="521796602"/> <nd ref="521796589"/> <nd ref="521796569"/> <nd ref="521796539"/> <nd ref="521796547"/> <nd ref="521796531"/> <nd ref="521796551"/> <nd ref="521796593"/> </way> <way id="42078520"> <nd ref="522767545"/> <nd ref="584905191"/> <nd ref="522692077"/> <nd ref="522717268"/> <nd ref="522767545"/> </way> <way id="42078903"> <nd ref="522692375"/> <nd ref="522735499"/> <nd ref="522687865"/> <nd ref="522690257"/> <nd ref="522692375"/> </way> <way id="42080164"> <nd ref="522758865"/> <nd ref="522781032"/> <nd ref="522746049"/> <nd ref="522724981"/> <nd ref="522758865"/> </way> <way id="42080794"> <nd ref="522713445"/> <nd ref="522738545"/> <nd ref="522697028"/> <nd ref="522719565"/> <nd ref="522755948"/> <nd ref="522689546"/> <nd ref="522741357"/> <nd ref="522723863"/> <nd ref="522725762"/> <nd ref="522696179"/> <nd ref="522716335"/> <nd ref="522754408"/> <nd ref="522730744"/> <nd ref="522710650"/> <nd ref="522760726"/> <nd ref="522697891"/> <nd ref="522705124"/> <nd ref="522705359"/> <nd ref="522764293"/> <nd ref="522730889"/> <nd ref="522780833"/> <nd ref="522771838"/> <nd ref="522713445"/> </way> <way id="42081488"> <nd ref="522712183"/> <nd ref="522713946"/> <nd ref="522747141"/> <nd ref="522739915"/> <nd ref="522712183"/> </way> <way id="42081879"> <nd ref="522712868"/> <nd ref="522730313"/> <nd ref="522683332"/> <nd ref="522752710"/> <nd ref="522718015"/> <nd ref="522737046"/> <nd ref="522755062"/> <nd ref="522720835"/> <nd ref="522772179"/> <nd ref="522766146"/> <nd ref="522700406"/> <nd ref="522691617"/> <nd ref="522782073"/> <nd ref="522768520"/> <nd ref="522714172"/> <nd ref="522684907"/> <nd ref="522693797"/> <nd ref="522721347"/> <nd ref="522678657"/> <nd ref="522724133"/> <nd ref="522767759"/> <nd ref="522724891"/> <nd ref="522712868"/> </way> <way id="34278155"> <nd ref="393064178"/> <nd ref="393064174"/> <nd ref="393064173"/> <nd ref="393064175"/> <nd ref="393064178"/> </way> <way id="34280739"> <nd ref="393069186"/> <nd ref="393069181"/> <nd ref="393069182"/> <nd ref="2353316443"/> <nd ref="2353316444"/> <nd ref="2353316332"/> <nd ref="2353316428"/> <nd ref="2353316160"/> <nd ref="2353316180"/> <nd ref="393069183"/> <nd ref="393069186"/> </way> <way id="34280878"> <nd ref="393069140"/> <nd ref="393069141"/> <nd ref="393069138"/> <nd ref="393069139"/> <nd ref="393069140"/> </way> <way id="42078425"> <nd ref="522737105"/> <nd ref="522691216"/> <nd ref="522677843"/> <nd ref="522677423"/> <nd ref="522683866"/> <nd ref="522707244"/> <nd ref="522698473"/> <nd ref="522700122"/> <nd ref="522750769"/> <nd ref="522741555"/> <nd ref="522732594"/> <nd ref="522698808"/> <nd ref="522677323"/> <nd ref="522735722"/> <nd ref="522740166"/> <nd ref="522697344"/> <nd ref="522745508"/> <nd ref="522778735"/> <nd ref="522737105"/> </way> <way id="42078906"> <nd ref="522685525"/> <nd ref="522729582"/> <nd ref="522762502"/> <nd ref="522727652"/> <nd ref="522735115"/> <nd ref="522696793"/> <nd ref="522762381"/> <nd ref="522682958"/> <nd ref="522685525"/> </way> <way id="34278071"> <nd ref="393064141"/> <nd ref="393064140"/> <nd ref="393064139"/> <nd ref="393064138"/> <nd ref="393064141"/> </way> <way id="34278081"> <nd ref="393064185"/> <nd ref="2353316580"/> <nd ref="393064179"/> <nd ref="393064182"/> <nd ref="2353316520"/> <nd ref="2353316451"/> <nd ref="393064183"/> <nd ref="2353316591"/> <nd ref="2353316581"/> <nd ref="2353316586"/> <nd ref="2353316587"/> <nd ref="2353316588"/> <nd ref="2353316590"/> <nd ref="2353316596"/> <nd ref="2353316594"/> <nd ref="2353316595"/> <nd ref="2353316593"/> <nd ref="393064184"/> <nd ref="2353316589"/> <nd ref="2353316592"/> <nd ref="2353316582"/> <nd ref="2353316585"/> <nd ref="2353316584"/> <nd ref="393064187"/> <nd ref="393064188"/> <nd ref="393064185"/> </way> <way id="34278247"> <nd ref="393064131"/> <nd ref="393064130"/> <nd ref="393064133"/> <nd ref="393064132"/> <nd ref="393064131"/> </way> <way id="34278266"> <nd ref="393064134"/> <nd ref="393064136"/> <nd ref="393064135"/> <nd ref="393064137"/> <nd ref="393064134"/> </way> <way id="42032975"> <nd ref="521698161"/> <nd ref="521697887"/> <nd ref="521698384"/> <nd ref="521698037"/> <nd ref="521698149"/> <nd ref="521697851"/> <nd ref="521698198"/> <nd ref="521697870"/> <nd ref="521698161"/> </way> <way id="42032984"> <nd ref="521698378"/> <nd ref="521698368"/> <nd ref="521698056"/> <nd ref="521698058"/> <nd ref="521698459"/> <nd ref="521698203"/> <nd ref="521698394"/> <nd ref="521697964"/> <nd ref="521698200"/> <nd ref="521698269"/> <nd ref="521698173"/> <nd ref="521698468"/> <nd ref="521698359"/> <nd ref="1824126175"/> <nd ref="521698477"/> <nd ref="521698462"/> <nd ref="521698378"/> </way> <way id="42079291"> <nd ref="522710408"/> <nd ref="522718016"/> <nd ref="522771276"/> <nd ref="522782342"/> <nd ref="522704565"/> <nd ref="522768467"/> <nd ref="522751416"/> <nd ref="522710408"/> </way> <way id="42081038"> <nd ref="522688035"/> <nd ref="1335828052"/> <nd ref="522754663"/> <nd ref="522678125"/> <nd ref="522754828"/> <nd ref="522715327"/> <nd ref="522720464"/> <nd ref="522704565"/> <nd ref="522782342"/> <nd ref="522736161"/> <nd ref="522685193"/> <nd ref="522688035"/> </way> <way id="42081478"> <nd ref="522766983"/> <nd ref="522684173"/> <nd ref="522744528"/> <nd ref="522772153"/> <nd ref="522678050"/> <nd ref="522745201"/> <nd ref="522708876"/> <nd ref="522700435"/> <nd ref="522780110"/> <nd ref="522751499"/> <nd ref="522709991"/> <nd ref="522705196"/> <nd ref="522766983"/> </way> <way id="42081631"> <nd ref="522774356"/> <nd ref="522712926"/> <nd ref="522700310"/> <nd ref="522704097"/> <nd ref="522721360"/> <nd ref="522693773"/> <nd ref="522737185"/> <nd ref="522763289"/> <nd ref="522774356"/> </way> <way id="42082066"> <nd ref="522692735"/> <nd ref="522692211"/> <nd ref="522734079"/> <nd ref="522737281"/> <nd ref="522692735"/> </way> <way id="34278429"> <nd ref="393064009"/> <nd ref="393064027"/> <nd ref="393064026"/> <nd ref="2353316448"/> <nd ref="2353316447"/> <nd ref="2353316449"/> <nd ref="2353316450"/> <nd ref="2353316506"/> <nd ref="2353316491"/> <nd ref="393064025"/> <nd ref="393064009"/> </way> <way id="34278430"> <nd ref="393064006"/> <nd ref="2353316579"/> <nd ref="2353316576"/> <nd ref="2353316477"/> <nd ref="2353316575"/> <nd ref="2353316574"/> <nd ref="393064007"/> <nd ref="393064010"/> <nd ref="393064011"/> <nd ref="393064006"/> </way> <way id="34280736"> <nd ref="393069174"/> <nd ref="393069175"/> <nd ref="393069176"/> <nd ref="2353316431"/> <nd ref="2353316430"/> <nd ref="2353316372"/> <nd ref="2353316412"/> <nd ref="393069171"/> <nd ref="2353316264"/> <nd ref="2353316246"/> <nd ref="393069174"/> </way> <way id="42032961"> <nd ref="521698142"/> <nd ref="521698209"/> <nd ref="521698336"/> <nd ref="521698377"/> <nd ref="610271246"/> <nd ref="521698216"/> <nd ref="521698513"/> <nd ref="521698374"/> <nd ref="521698233"/> <nd ref="521697938"/> <nd ref="521698466"/> <nd ref="521698142"/> </way> <way id="42033000"> <nd ref="521698535"/> <nd ref="521698544"/> <nd ref="521698542"/> <nd ref="2353316767"/> <nd ref="521698538"/> <nd ref="521698540"/> <nd ref="521698546"/> <nd ref="521698536"/> <nd ref="521698547"/> <nd ref="2353316740"/> <nd ref="2353316714"/> <nd ref="521698535"/> </way> <way id="42079502"> <nd ref="522697164"/> <nd ref="1831896440"/> <nd ref="1831896443"/> <nd ref="1831896432"/> <nd ref="1831896431"/> <nd ref="522705343"/> <nd ref="522763836"/> <nd ref="1831896423"/> <nd ref="1831896424"/> <nd ref="1831896437"/> <nd ref="1831896438"/> <nd ref="522742989"/> <nd ref="522697164"/> </way> <way id="42079671"> <nd ref="522727948"/> <nd ref="522688463"/> <nd ref="522740460"/> <nd ref="522677645"/> <nd ref="522711089"/> <nd ref="522715833"/> <nd ref="522762011"/> <nd ref="522703012"/> <nd ref="522682559"/> <nd ref="522726869"/> <nd ref="522727948"/> </way> <way id="42080433"> <nd ref="522716673"/> <nd ref="522700374"/> <nd ref="522769841"/> <nd ref="522714513"/> <nd ref="522716673"/> </way> <way id="42080604"> <nd ref="522777279"/> <nd ref="522733349"/> <nd ref="522759870"/> <nd ref="522743157"/> <nd ref="522777279"/> </way> <way id="159119611"> <nd ref="1712237322"/> <nd ref="1712237319"/> <nd ref="1712237320"/> <nd ref="1712237323"/> <nd ref="1712237322"/> </way> <way id="226540713"> <nd ref="2353316445"/> <nd ref="2353316442"/> <nd ref="2353316282"/> <nd ref="2353316316"/> <nd ref="2353316445"/> </way> <way id="41865392"> <nd ref="517724561"/> <nd ref="517724764"/> <nd ref="517725106"/> <nd ref="517724737"/> <nd ref="517725904"/> <nd ref="517724956"/> <nd ref="517726295"/> <nd ref="517725092"/> <nd ref="517724561"/> </way> <way id="42079151"> <nd ref="522713369"/> <nd ref="522741432"/> <nd ref="522755707"/> <nd ref="522742216"/> <nd ref="522734579"/> <nd ref="522680329"/> <nd ref="522713369"/> </way> <way id="114456634"> <nd ref="1296575384"/> <nd ref="1296575377"/> <nd ref="1296575247"/> <nd ref="1296575426"/> <nd ref="1296575384"/> </way> <way id="34278685"> <nd ref="393063822"/> <nd ref="393063824"/> <nd ref="393063823"/> <nd ref="2353316577"/> <nd ref="2353316578"/> <nd ref="393063832"/> <nd ref="393063822"/> </way> <way id="41864679"> <nd ref="517704454"/> <nd ref="517704481"/> <nd ref="517704471"/> <nd ref="517704464"/> <nd ref="517704454"/> </way> <way id="41864680"> <nd ref="517704467"/> <nd ref="517704461"/> <nd ref="517704457"/> <nd ref="517704473"/> <nd ref="517704467"/> </way> <way id="42032973"> <nd ref="521697945"/> <nd ref="521697913"/> <nd ref="521698422"/> <nd ref="521697844"/> <nd ref="521697945"/> </way> <way id="42078860"> <nd ref="522733952"/> <nd ref="522722313"/> <nd ref="522707526"/> <nd ref="522701481"/> <nd ref="522730114"/> <nd ref="522682689"/> <nd ref="522735947"/> <nd ref="522684711"/> <nd ref="522733952"/> </way> <way id="42079761"> <nd ref="522742734"/> <nd ref="522723184"/> <nd ref="522684283"/> <nd ref="522763558"/> <nd ref="522742983"/> <nd ref="522778863"/> <nd ref="522731202"/> <nd ref="522723251"/> <nd ref="522742734"/> </way> <way id="42080581"> <nd ref="522781440"/> <nd ref="522687542"/> <nd ref="522694864"/> <nd ref="522738600"/> <nd ref="522774060"/> <nd ref="522718279"/> <nd ref="522705804"/> <nd ref="522748437"/> <nd ref="522708439"/> <nd ref="522714602"/> <nd ref="522685227"/> <nd ref="522781440"/> </way> <way id="42081067"> <nd ref="522695272"/> <nd ref="2353316745"/> <nd ref="2353316746"/> <nd ref="2353316685"/> <nd ref="2353316673"/> <nd ref="522696633"/> <nd ref="522777967"/> <nd ref="522726808"/> <nd ref="522695272"/> </way> <way id="42081123"> <nd ref="522692733"/> <nd ref="2461210694"/> <nd ref="522716475"/> <nd ref="2461210701"/> <nd ref="522746700"/> <nd ref="2461210698"/> <nd ref="522741529"/> <nd ref="2461210707"/> <nd ref="522709054"/> <nd ref="2461210690"/> <nd ref="2461210687"/> <nd ref="522711720"/> <nd ref="2461210684"/> <nd ref="522748659"/> <nd ref="522717745"/> <nd ref="1296575265"/> <nd ref="1296575341"/> <nd ref="1296575270"/> <nd ref="1296575336"/> <nd ref="2461210704"/> <nd ref="522692733"/> </way> <way id="42081748"> <nd ref="522718630"/> <nd ref="522710096"/> <nd ref="522688319"/> <nd ref="2467696782"/> <nd ref="522759856"/> <nd ref="522682795"/> <nd ref="2467696783"/> <nd ref="528511766"/> <nd ref="522705628"/> <nd ref="522697145"/> <nd ref="522752954"/> <nd ref="522697921"/> <nd ref="522718630"/> </way> <way id="42082805"> <nd ref="522680026"/> <nd ref="522701374"/> <nd ref="522708778"/> <nd ref="522704909"/> <nd ref="522722108"/> <nd ref="522697500"/> <nd ref="522695733"/> <nd ref="522725817"/> <nd ref="522712589"/> <nd ref="522689030"/> <nd ref="522680026"/> </way> <way id="42082827"> <nd ref="522780177"/> <nd ref="522686542"/> <nd ref="522716225"/> <nd ref="522723464"/> <nd ref="2461210677"/> <nd ref="2461210681"/> <nd ref="522748095"/> <nd ref="522773152"/> <nd ref="522736377"/> <nd ref="522722703"/> <nd ref="522780177"/> </way> <way id="34278696"> <nd ref="1350045329"/> <nd ref="1741632095"/> <nd ref="1741632086"/> <nd ref="1741632089"/> <nd ref="1741632112"/> <nd ref="393063839"/> <nd ref="393063840"/> <nd ref="1741632153"/> <nd ref="1741632149"/> <nd ref="1296575395"/> <nd ref="1296575348"/> <nd ref="1741632169"/> <nd ref="1741632172"/> <nd ref="1741632168"/> <nd ref="1741632157"/> <nd ref="1296575430"/> <nd ref="1296575319"/> <nd ref="1741632127"/> <nd ref="1741632116"/> <nd ref="393063841"/> <nd ref="1741632055"/> <nd ref="1350045329"/> </way> <way id="34278796"> <nd ref="393063780"/> <nd ref="393063782"/> <nd ref="393063781"/> <nd ref="393063777"/> <nd ref="393063780"/> </way> <way id="34278806"> <nd ref="393063783"/> <nd ref="393063784"/> <nd ref="393063785"/> <nd ref="393063786"/> <nd ref="393063783"/> </way> <way id="34278822"> <nd ref="393063794"/> <nd ref="393063795"/> <nd ref="393063790"/> <nd ref="393063791"/> <nd ref="393063794"/> </way> <way id="34278824"> <nd ref="393063792"/> <nd ref="393063787"/> <nd ref="393063788"/> <nd ref="393063789"/> <nd ref="393063792"/> </way> <way id="34278837"> <nd ref="393063798"/> <nd ref="393063797"/> <nd ref="393063796"/> <nd ref="393063793"/> <nd ref="393063798"/> </way> <way id="34278853"> <nd ref="393063802"/> <nd ref="393063801"/> <nd ref="393063800"/> <nd ref="393063799"/> <nd ref="393063802"/> </way> <way id="34278870"> <nd ref="393063817"/> <nd ref="393063818"/> <nd ref="393063815"/> <nd ref="393063816"/> <nd ref="393063817"/> </way> <way id="41865368"> <nd ref="517724792"/> <nd ref="517725897"/> <nd ref="517726271"/> <nd ref="517724649"/> <nd ref="517724792"/> </way> <way id="41865433"> <nd ref="1741631947"/> <nd ref="517725384"/> <nd ref="1741631980"/> <nd ref="1741631945"/> <nd ref="517724618"/> <nd ref="517725644"/> <nd ref="1741631947"/> </way> <way id="41865438"> <nd ref="517725183"/> <nd ref="517726297"/> <nd ref="517724636"/> <nd ref="517725809"/> <nd ref="517725183"/> </way> <way id="42080057"> <nd ref="522692426"/> <nd ref="522754553"/> <nd ref="522716109"/> <nd ref="522734966"/> <nd ref="522692426"/> </way> <way id="42082220"> <nd ref="522770910"/> <nd ref="522778706"/> <nd ref="522688536"/> <nd ref="522699269"/> <nd ref="522681377"/> <nd ref="522678446"/> <nd ref="522762234"/> <nd ref="522685049"/> <nd ref="522770910"/> </way> </osm> ');
        
        var obsts = [];
        $(data).find('way').each(function (key, node) {
            var convexHull = new ConvexHullGrahamScan();
            var ob = [];
            $(node).find('nd').each(function (key, ref) {
                var point = $(data).find("node[id='" + $(ref).attr('ref')+ "']");
                
                ob.push({x: $(point).attr('lat'), y: $(point).attr('lon')});
            });
            ob.splice(ob.length - 1, 1);
            for (var i = 0, len = ob.length; i < len; i++) convexHull.addPoint(ob[i].x, ob[i].y);
            var obst = {
                hull: convexHull.getHull(),
                points: ob
            };
            obsts.push(obst);
        });
                   
        if (callback) {
            callback(obsts);
        }
    //});   
};

Routes.prototype.getBoundBoxForPoints = function (points) {
    if (points.length < 1) return;
    
    var north = 0.0, east = 0.0, south = 0.0, west = 0.0;
    var localCoords = points[0].coordinates.split(',');
    north = south = parseFloat(localCoords[1]);
    east = west = parseFloat(localCoords[0]);
     
    for (var i = 1; i < points.length; i++) {
        localCoords = points[i].coordinates.split(',');
        if (parseFloat(localCoords[1]) > north) {
            north = parseFloat(localCoords[1]);
        }
        if (parseFloat(localCoords[1]) < south) {
            south = parseFloat(localCoords[1]);
        }
        if (parseFloat(localCoords[0]) > east) {
            east = parseFloat(localCoords[0]);
        }
        if (parseFloat(localCoords[0]) < west) {
            west = parseFloat(localCoords[0]);
        }      
    }
    
    return {
        northeast: {
            lat: north,
            lng: east
        },
        southwest: {
            lat: south,
            lng: west
        }
    };
};

Routes.prototype.addCurvePoints = function (track, type) {
    Logger.debug('type: ' + type);
    
    var curvePoints = null;
    switch (type) {
        case MapClass.ROUTE_TYPE_CURVE_RAW:
            curvePoints = [];
            for (var i = 0, len = track.points.length; i < len; i++) {
                var point = track.points[i].coordinates.split(',').map(parseFloat);
                curvePoints.push(new L.LatLng(point[1], point[0]));
            }
            break;
        case MapClass.ROUTE_TYPE_CURVE_SERVICE:
            Logger.debug(track.serviceRoutes[0]);
            if (!track.serviceRoutes[0]) {
                Logger.error('No service route had been found');
                return;
            }
            var points = L.PolylineUtil.decode(track.serviceRoutes[0]);
            curvePoints = [];
            for (var i = 0, len = points.length; i < len; i++) {
                curvePoints.push(new L.LatLng(points[i][0], points[i][1]));
            }
            Logger.debug(curvePoints);
            break;
        default: 
            Logger.error('Unknown type');
    }
    track.curvePoints = curvePoints;
};

Routes.prototype.addCShape = function (track) { 
    //sign( (Bx-Ax)*(Y-Ay) - (By-Ay)*(X-Ax) )
    var calculateSign = function (A, B, C) {
        return (B.lat - A.lat) * (C.lng - A.lng) - (B.lng - A.lng) * (C.lat - A.lat);
    };
    
    var cShapePolyline = [];
    
    cShapePolyline.push({point: track.curvePoints[0], isInflection: false});
    
    for (var i = 1, len = track.curvePoints.length; i < len - 2; i++) {
        var b_0 = track.curvePoints[i - 1], 
            b_1 = track.curvePoints[i], 
            b_2 = track.curvePoints[i + 1], 
            b_3 = track.curvePoints[i + 2];
        
        cShapePolyline.push({point: b_1, isInflection: false});
               
        Logger.debug('i = ' + i + ' sign1 = ' + calculateSign(b_1, b_0, b_2) + ' sign2 = ' + calculateSign(b_2, b_1, b_3));
        if ((calculateSign(b_1, b_0, b_2) * calculateSign(b_2, b_1, b_3)) <= 0) {
            cShapePolyline.push({point: new L.LatLng((b_1.lat + b_2.lat) / 2, (b_1.lng + b_2.lng) / 2), isInflection: true});
        }       
    }
    
    cShapePolyline.push({point: track.curvePoints[track.curvePoints.length - 2], isInflection: false});
    cShapePolyline.push({point: track.curvePoints[track.curvePoints.length - 1], isInflection: false});
    
    Logger.debug(cShapePolyline);
    
    track.cShapePolyline = cShapePolyline;
    
    var cShapeSections = [];
    var section = [];
    for (var i = 0, len = cShapePolyline.length; i < len; i++) {
        section.push(cShapePolyline[i].point);
        if (cShapePolyline[i].isInflection || (section.length >= 4)) {
            if (cShapePolyline[i].isInflection && (section.length < 4)) {
                section.push(cShapePolyline[i].point);
            }
            cShapeSections.push(section);
            section = [];
            section.push(cShapePolyline[i].point);           
        }
        if (i >= len - 1) {
            if (section.length < 4) {
                section.push(cShapePolyline[i].point);
                cShapeSections.push(section);
            }
        }
    }  
    //cShapeSections.push(section);
    
    Logger.debug(cShapeSections);
    
    track.cShapeSections = cShapeSections;
};

Routes.prototype.obstacleAvoidingCurve = function (track, type) { 
    var u = 0.8;
    var accuracy = 0.1;
    
    if (track.points.length < 2) {
        throw new GetsWebClientException('Routes Error', 'obstacleAvoidingCurve, total number of points in the route must be 2 or more');
    }
    
    this.addCurvePoints(track, type);
    this.addCShape(track);
    
    var oACurve = [];
    
    // Calculate N*p
    var pointsMult = function (p, N) {
        return new L.LatLng(N * p.lat, N * p.lng);
    };
    
    // Calculate p1 + p0
    var pointsAdd = function (p0, p1) {
        return new L.LatLng(p1.lat + p0.lat, p1.lng + p0.lng);
    };
    
    // Calculate p0 - p1
    var pointsSubs = function (p0, p1) {
        return new L.LatLng(p0.lat - p1.lat, p0.lng - p1.lng);
    };
    
    var bezier = function (t, p0, p1, p2, p3) {        
        var lat = Math.pow(1 - t, 3) * p0.lat + 3 * Math.pow(1 - t, 2) * t * p1.lat + 3 * (1 - t) * Math.pow(t, 2) * p2.lat + Math.pow(t, 3) * p3.lat;
        var lng = Math.pow(1 - t, 3) * p0.lng + 3 * Math.pow(1 - t, 2) * t * p1.lng + 3 * (1 - t) * Math.pow(t, 2) * p2.lng + Math.pow(t, 3) * p3.lng;
        
        return new L.LatLng(lat, lng);
    };
       
    var b0 = track.cShapePolyline[0].point,
        b1 = pointsAdd(track.cShapePolyline[0].point, pointsMult(pointsSubs(track.cShapePolyline[1].point, track.cShapePolyline[0].point), u / 2)),
        b2 = pointsAdd(track.cShapePolyline[0].point, pointsSubs(pointsSubs(track.cShapePolyline[1].point, track.cShapePolyline[0].point), pointsMult(pointsSubs(track.cShapePolyline[1].point, track.cShapePolyline[0].point), u / 2))),
        b3 = pointsAdd(track.cShapePolyline[0].point, pointsAdd(pointsSubs(track.cShapePolyline[1].point, track.cShapePolyline[0].point), pointsMult(pointsSubs(pointsSubs(track.cShapePolyline[2].point, track.cShapePolyline[1].point), pointsSubs(track.cShapePolyline[1].point, track.cShapePolyline[0].point)), u / 4)));
    for (var j = 0; j <= 1; j += accuracy) {
        oACurve.push(bezier(j, b0, b1, b2, b3));
    }
    
    for (var i = 1, len = track.cShapePolyline.length; i < len - 2; i++) {            
        b0 = pointsAdd(track.cShapePolyline[i].point, pointsMult(pointsSubs(pointsSubs(track.cShapePolyline[i + 1].point, track.cShapePolyline[i].point), pointsSubs(track.cShapePolyline[i].point, track.cShapePolyline[i - 1].point)), u / 4));
        b1 = pointsAdd(track.cShapePolyline[i].point, pointsMult(pointsSubs(track.cShapePolyline[i + 1].point, track.cShapePolyline[i].point), u / 2));
        b2 = pointsAdd(track.cShapePolyline[i].point, pointsSubs(pointsSubs(track.cShapePolyline[i + 1].point, track.cShapePolyline[i].point), pointsMult(pointsSubs(track.cShapePolyline[i + 1].point, track.cShapePolyline[i].point), u / 2)));
        b3 = pointsAdd(track.cShapePolyline[i].point, pointsAdd(pointsSubs(track.cShapePolyline[i + 1].point, track.cShapePolyline[i].point), pointsMult(pointsSubs(pointsSubs(track.cShapePolyline[i + 2].point, track.cShapePolyline[i + 1].point), pointsSubs(track.cShapePolyline[i + 1].point, track.cShapePolyline[i].point)), u / 4)));
        
        for (var j = 0; j <= 1; j += accuracy) {
            oACurve.push(bezier(j, b0, b1, b2, b3));
            //oACurve.push(bezier(j, p_0, p_1, p_2, p_3));
        }
    }
    
    var len = track.cShapePolyline.length;
    b0 = pointsAdd(track.cShapePolyline[len - 2].point, pointsMult(pointsSubs(pointsSubs(track.cShapePolyline[len - 1].point, track.cShapePolyline[len - 2].point), pointsSubs(track.cShapePolyline[len - 2].point, track.cShapePolyline[len - 3].point)), u / 4));
    b1 = pointsAdd(track.cShapePolyline[len - 2].point, pointsMult(pointsSubs(track.cShapePolyline[len - 1].point, track.cShapePolyline[len - 2].point), u / 2));
    b2 = pointsAdd(track.cShapePolyline[len - 2].point, pointsSubs(pointsSubs(track.cShapePolyline[len - 1].point, track.cShapePolyline[len - 2].point), pointsMult(pointsSubs(track.cShapePolyline[len - 1].point, track.cShapePolyline[len - 2].point), u / 2)));
    b3 = track.cShapePolyline[len - 1].point;
    for (var j = 0; j <= 1; j += accuracy) {
        oACurve.push(bezier(j, b0, b1, b2, b3));
    }
       
    track.oACurve = L.PolylineUtil.encode(oACurve);
};

Routes.prototype.ESP_gridbased = function (track, callback) {
    var that = this;
    this.generateGrid(track, 15);
    this.requestOSMObstacles(track, function (obsts) {
        that.markInvalidPointsOnGrid(track, obsts);
        that.AStarGrid(track);
        track.esp.curve_ = L.PolylineUtil.encode(that.bezierCurves(that.partitionToCShape(track.esp.path), obsts));
        that.pointToPointCurve(track, obsts);
        callback(obsts);       
    });
};

Routes.prototype.generateGrid = function (track, width) {   
    var waypoints = [];
    for (var k = 0, len = track.points.length; k < len; k++) {
        var point = track.points[k].coordinates.split(',').map(parseFloat);
        waypoints.push(new L.LatLng(point[1], point[0]));
    }
    
    var bbox = track.bounds;
    
    var R = 6378137;//Earth radius in meters
    
    var north = bbox.northeast.lat,
        east = bbox.northeast.lng,
        south = bbox.southwest.lat,
        west = bbox.southwest.lng;
    
    var topleft = new L.LatLng(north, west),
        topright = new L.LatLng(north, east),
        bottomright = new L.LatLng(south, east),
        bottomleft = new L.LatLng(south, west);
    
    var distanceHorizontal = topleft.distanceTo(topright);
    var distanceVertical = topleft.distanceTo(bottomleft);
    
    var grid = [];
    Logger.debug('grid 1(distVert, num): ' + distanceVertical + ', ' + parseInt(distanceVertical / width, 10));
    Logger.debug('grid 2(distHor, num): ' + distanceHorizontal + ', ' + parseInt(distanceHorizontal / width, 10));
    
    var used = [];
    for (var i = 0; i < (distanceVertical + width); i += width) {
        grid.push([]);
        var newLat = south + (180 / Math.PI) * (i / R);
        for (var j = 0; j < (distanceHorizontal + width); j += width) {
            var newLng = west + (180 / Math.PI) * (j / (R * Math.cos(Math.PI * north / 180.0)));
            var coords = new L.LatLng(newLat, newLng);
            var cell = {
                coords: coords,
                valid: true,
                waypoint: false
            };           
            for (var k = 0, len = waypoints.length; k < len; k++) {
                var isUsed = false;
                for (var p = 0; p < used.length; p++) {
                    if (used[p] === k) {
                        isUsed = true;
                        break;
                    } 
                }
                if (isUsed) continue;    
                if (coords.distanceTo(waypoints[k]) < width) {
                    cell.waypoint = true;
                    cell.order = k;
                    used.push(k);
                    //waypoints.splice(k, 1);
                    /*var waypointCell = {
                        coords: waypoints[k],
                        valid: true,
                        waypoint: true
                    };*/
                    //grid[grid.length - 1].push(waypointCell);
                    break;
                }
            }
            grid[grid.length - 1].push(cell);
        }
    }
    
    Logger.debug(grid);
    
    track.esp = {
        grid: grid
    };
};

Routes.prototype.markInvalidPointsOnGrid = function (track, obstacles) { 
    if (!obstacles || obstacles.length < 1) return;
    
    var grid = track.esp.grid;
      
    for (var i = 0, len = grid.length; i < len; i++) {
        for (var j = 0, len2 = grid[i].length; j < len2; j++) {
            for (var k = 0, len3 = obstacles.length; k < len3; k++) {
                if (grid[i][j].waypoint) break;
                //if (this.checkHit(obstacles[k].bbox, grid[i][j].coords)) {
                if (this.pointInsidePolygon(grid[i][j].coords, obstacles[k].hull)) {
                    grid[i][j].valid = false;
                }
            }
        }
    }
};

Routes.prototype.AStarGrid = function (track) {
    var waypoints = [];
    for (var k = 0, len = track.points.length; k < len; k++) {
        var point = track.points[k].coordinates.split(',').map(parseFloat);
        waypoints.push(new L.LatLng(point[1], point[0]));
    }
    
    var grid = track.esp.grid;
           
    var graph = {
        weights: [],
        result: [],
        waypoints: []
    };
    
    for (var j = 0; j < grid.length; j++) {
        graph.weights.push([]);
        for (var l = 0; l < grid[j].length; l++) {
            if (grid[j][l] && grid[j][l].valid) {
                graph.weights[graph.weights.length - 1].push(1);
                if (grid[j][l].waypoint) {
                    graph.waypoints.push({x: j, y: l, order: grid[j][l].order});
                }
            } else {
                graph.weights[graph.weights.length - 1].push(0);
            }
        }
    }
    Logger.debug(graph);
    
    var findWithProp = function (array, prop, value) {
        for (var i = 0; i < array.length; i++) {
            if (array[i][prop] === value) {
                return i;
            }
        }
    };
    
    var A_StarGraph = new GraphTheta(graph.weights, { diagonal: true });
    Logger.debug(A_StarGraph);
    for (var i = 0, len = graph.waypoints.length; i < len - 1; i++) {
        //Logger.debug('indexOf ' + i + ' and ' + (i + 1) + ': ' + findWithProp(graph.waypoints, 'order', i) + ', ' + findWithProp(graph.waypoints, 'order', i + 1));
        var startIndex = findWithProp(graph.waypoints, 'order', i),
            endIndex = findWithProp(graph.waypoints, 'order', i + 1);
    
        var startPoint = A_StarGraph.grid[graph.waypoints[startIndex].x][graph.waypoints[startIndex].y],
            endPoint = A_StarGraph.grid[graph.waypoints[endIndex].x][graph.waypoints[endIndex].y];
    
        //var result = astar.search(A_StarGraph, startPoint, endPoint,{ heuristic: astar.heuristics.diagonal }); 
        var result = theta_star.search(A_StarGraph, startPoint, endPoint); 
        for (var j = 0, res_len = result.length; j < res_len; j++) {
            graph.result.push(grid[result[j].x][result[j].y]);
        }             
    }
    track.esp.path = graph.result;   
    //Logger.debug(track.esp.path);
};

Routes.prototype.pointToPointCurve = function (track, obstacles) {
    var path = track.esp.path,
        tempPoints = [],
        curve = [];

    var waypointsCounter = 0;
    tempPoints.push(path[0]);
    for (var i = 1, len = path.length; i < len; i++) {
        //if (waypointsCounter > 0) {
        tempPoints.push(path[i]);
        //}
        if (path[i].waypoint) {

            //if (waypointsCounter > 0) {
            var CShapePoints = this.partitionToCShape(tempPoints);
            //Logger.debug(CShapePoints);
            var bezierPoints = this.bezierCurves(CShapePoints, obstacles);
            //Logger.debug(bezierPoints);
            curve = curve.concat(bezierPoints);
            //break;
            //}
            //Logger.debug(tempPoints);
            tempPoints = [];
            tempPoints.push(path[i]);
            //waypointsCounter++;
        }
    }   
    track.esp.curve = L.PolylineUtil.encode(curve);
    Logger.debug(track.esp.curve);
};

Routes.prototype.partitionToCShape = function (points) {
    // only 4 or more points can create S-shaped curve, which is the type of curve we want to get rid
    if (points.length < 4) {
        for (var i = 0; i < points.length; i++) {
            points[i].isInflection = false;
        }
        return points;
    }
    
    //sign( (Bx-Ax)*(Y-Ay) - (By-Ay)*(X-Ax) )//.coords
    var calculateSign = function (A, B, C) {
        return (B.coords.lat - A.coords.lat) * (C.coords.lng - A.coords.lng) - (B.coords.lng - A.coords.lng) * (C.coords.lat - A.coords.lat);
    };
    
    var cShapePolyline = [];
    
    points[0].isInflection = false;
    cShapePolyline.push(points[0]);
    
    for (var i = 1, len = points.length; i < len - 2; i++) {
        var b_0 = points[i - 1], 
            b_1 = points[i], 
            b_2 = points[i + 1], 
            b_3 = points[i + 2];
        
        b_1.isInflection = false;
        cShapePolyline.push(b_1);
               
        //Logger.debug('i = ' + i + ' sign1 = ' + calculateSign(b_1, b_0, b_2) + ' sign2 = ' + calculateSign(b_2, b_1, b_3));
        if ((calculateSign(b_1, b_0, b_2) * calculateSign(b_2, b_1, b_3)) <= 0) {
            cShapePolyline.push({
                coords: new L.LatLng((b_1.coords.lat + b_2.coords.lat) / 2, (b_1.coords.lng + b_2.coords.lng) / 2), 
                valid: true, 
                waypoint: false,
                isInflection: true
            });
        }       
    }
    
    points[points.length - 2].isInflection = false;
    points[points.length - 1].isInflection = false;
    cShapePolyline.push(points[points.length - 2]);
    cShapePolyline.push(points[points.length - 1]);
    
    //Logger.debug(cShapePolyline);
    
    return cShapePolyline;
};

Routes.prototype.bezierCurves = function (points, obstacles) { 
    // only 4 or more points can create S-shaped curve, which is the type of curve we want to get rid
    if (points.length < 4) {
        var coordsArray = [];
        for (var i = 0; i < points.length; i++) {
            coordsArray.push(points[i].coords);
        }
        return coordsArray;
    }
    
    var U_DEFAULT = 0.8;
    
    var u = U_DEFAULT;
    var accuracy = 0.1;
          
    var curve = [];
    
    // Calculate N*p
    var pointsMult = function (p, N) {
        return new L.LatLng(N * p.lat, N * p.lng);
    };
    
    // Calculate p1 + p0
    var pointsAdd = function (p0, p1) {
        return new L.LatLng(p1.lat + p0.lat, p1.lng + p0.lng);
    };
    
    // Calculate p0 - p1
    var pointsSubs = function (p0, p1) {
        return new L.LatLng(p0.lat - p1.lat, p0.lng - p1.lng);
    };
    
    var bezier = function (t, p0, p1, p2, p3) {        
        var lat = Math.pow(1 - t, 3) * p0.lat + 3 * Math.pow(1 - t, 2) * t * p1.lat + 3 * (1 - t) * Math.pow(t, 2) * p2.lat + Math.pow(t, 3) * p3.lat;
        var lng = Math.pow(1 - t, 3) * p0.lng + 3 * Math.pow(1 - t, 2) * t * p1.lng + 3 * (1 - t) * Math.pow(t, 2) * p2.lng + Math.pow(t, 3) * p3.lng;
        
        return new L.LatLng(lat, lng);
    };
    
    var that = this;
    var checkCollision = function (p0, p1, p2, p3) {
        //Logger.debug('in checkCollision');
        var controlPointsHull = new ConvexHullGrahamScan();
        controlPointsHull.addPoint(p0);
        controlPointsHull.addPoint(p1);
        controlPointsHull.addPoint(p2);
        controlPointsHull.addPoint(p3);

        controlPointsHull = controlPointsHull.getHull();
        //Logger.debug(controlPointsHull);
        for (var k = 0, len = obstacles.length; k < len; k++) {
            for (var p = 0, len1 = controlPointsHull.length; p < len1; p++) {
                if (that.pointInsidePolygon(controlPointsHull[p], obstacles[k].hull)) {
                    return true;
                }
            }
        }
        return false;
    };
       
    var b0 = points[0].coords,
        b1 = pointsAdd(points[0].coords, pointsMult(pointsSubs(points[1].coords, points[1].coords), u / 2)),
        b2 = pointsAdd(points[0].coords, pointsSubs(pointsSubs(points[1].coords, points[0].coords), pointsMult(pointsSubs(points[1].coords, points[0].coords), u / 2))),
        b3 = pointsAdd(points[0].coords, pointsAdd(pointsSubs(points[1].coords, points[0].coords), pointsMult(pointsSubs(pointsSubs(points[2].coords, points[1].coords), pointsSubs(points[1].coords, points[0].coords)), u / 4)));
    while (checkCollision(b0, b1, b2, b3)) {
        Logger.debug('u = ' + u);
        if (u < 0.1) break;
        u -= 0.09;        
        b0 = points[0].coords,
        b1 = pointsAdd(points[0].coords, pointsMult(pointsSubs(points[1].coords, points[1].coords), u / 2)),
        b2 = pointsAdd(points[0].coords, pointsSubs(pointsSubs(points[1].coords, points[0].coords), pointsMult(pointsSubs(points[1].coords, points[0].coords), u / 2))),
        b3 = pointsAdd(points[0].coords, pointsAdd(pointsSubs(points[1].coords, points[0].coords), pointsMult(pointsSubs(pointsSubs(points[2].coords, points[1].coords), pointsSubs(points[1].coords, points[0].coords)), u / 4)));
    }   
    
    for (var j = 0; j <= 1; j += accuracy) {
        curve.push(bezier(j, b0, b1, b2, b3));
    }
    
    u = U_DEFAULT;
    for (var i = 1, len = points.length; i < len - 2; i++) {
        if (points[i].isInflection) u = U_DEFAULT;
        b0 = pointsAdd(points[i].coords, pointsMult(pointsSubs(pointsSubs(points[i + 1].coords, points[i].coords), pointsSubs(points[i].coords, points[i - 1].coords)), u / 4));
        b1 = pointsAdd(points[i].coords, pointsMult(pointsSubs(points[i + 1].coords, points[i].coords), u / 2));
        b2 = pointsAdd(points[i].coords, pointsSubs(pointsSubs(points[i + 1].coords, points[i].coords), pointsMult(pointsSubs(points[i + 1].coords, points[i].coords), u / 2)));
        b3 = pointsAdd(points[i].coords, pointsAdd(pointsSubs(points[i + 1].coords, points[i].coords), pointsMult(pointsSubs(pointsSubs(points[i + 2].coords, points[i + 1].coords), pointsSubs(points[i + 1].coords, points[i].coords)), u / 4)));
        while (checkCollision(b0, b1, b2, b3)) {
            Logger.debug('u = ' + u);
            if (u < 0.2) break;
            u -= 0.09;
            b0 = pointsAdd(points[i].coords, pointsMult(pointsSubs(pointsSubs(points[i + 1].coords, points[i].coords), pointsSubs(points[i].coords, points[i - 1].coords)), u / 4));
            b1 = pointsAdd(points[i].coords, pointsMult(pointsSubs(points[i + 1].coords, points[i].coords), u / 2));
            b2 = pointsAdd(points[i].coords, pointsSubs(pointsSubs(points[i + 1].coords, points[i].coords), pointsMult(pointsSubs(points[i + 1].coords, points[i].coords), u / 2)));
            b3 = pointsAdd(points[i].coords, pointsAdd(pointsSubs(points[i + 1].coords, points[i].coords), pointsMult(pointsSubs(pointsSubs(points[i + 2].coords, points[i + 1].coords), pointsSubs(points[i + 1].coords, points[i].coords)), u / 4)));
        }
        
        for (var j = 0; j <= 1; j += accuracy) {
            curve.push(bezier(j, b0, b1, b2, b3));
        }
    }
    
    u = U_DEFAULT;
    var len = points.length;
    b0 = pointsAdd(points[len - 2].coords, pointsMult(pointsSubs(pointsSubs(points[len - 1].coords, points[len - 2].coords), pointsSubs(points[len - 2].coords, points[len - 3].coords)), u / 4));
    b1 = pointsAdd(points[len - 2].coords, pointsMult(pointsSubs(points[len - 1].coords, points[len - 2].coords), u / 2));
    b2 = pointsAdd(points[len - 2].coords, pointsSubs(pointsSubs(points[len - 1].coords, points[len - 2].coords), pointsMult(pointsSubs(points[len - 1].coords, points[len - 2].coords), u / 2)));
    b3 = points[len - 1].coords;
    while (checkCollision(b0, b1, b2, b3)) {
        Logger.debug('u = ' + u);
        if (u < 0.1) break;
        u -= 0.09;
        b0 = pointsAdd(points[len - 2].coords, pointsMult(pointsSubs(pointsSubs(points[len - 1].coords, points[len - 2].coords), pointsSubs(points[len - 2].coords, points[len - 3].coords)), u / 4));
        b1 = pointsAdd(points[len - 2].coords, pointsMult(pointsSubs(points[len - 1].coords, points[len - 2].coords), u / 2));
        b2 = pointsAdd(points[len - 2].coords, pointsSubs(pointsSubs(points[len - 1].coords, points[len - 2].coords), pointsMult(pointsSubs(points[len - 1].coords, points[len - 2].coords), u / 2)));
        b3 = points[len - 1].coords;
    }
    
    for (var j = 0; j <= 1; j += accuracy) {
        curve.push(bezier(j, b0, b1, b2, b3));
    }
       
    return curve;
};

Routes.prototype.checkHit = function (bbox, point) {
    var left = false,
        right = false,
        top = false,
        bottom = false;

    if (point.lat < bbox.northeast.lat)
        top = true;
    if (point.lng < bbox.northeast.lng)
        right = true;
    if (point.lat > bbox.southwest.lat)
        bottom = true;
    if (point.lng > bbox.southwest.lng)
        left = true;

    return top && right && bottom && left;
};

// Determine if a point is inside a polygon.
//
// point     - A Vec2 (2-element Array).
// polyVerts - Array of Vec2's (2-element Arrays). The vertices that make
//             up the polygon, in clockwise order around the polygon.
//
Routes.prototype.pointInsidePolygon = function (point, polyVerts) {
    //Logger.debug(point);
    //Logger.debug(polyVerts);
    var nsub = function (v1, v2) {
        return {
            x: v1.x - v2.x, 
            y: v1.y - v2.y
        };
    };
    // aka the "scalar cross product"
    var perpdot = function (v1, v2) {
        return v1.x * v2.y - v1.y * v2.x;
    };

    var _point;
    if (!point.x || !point.y) {
        _point = {
            x: point.lat,
            y: point.lng
        };
    } else {
        _point = point;
    }
    
    
    var i, len, v1, v2, edge, x;
    // First translate the polygon so that `point` is the origin. Then, for each
    // edge, get the angle between two vectors: 1) the edge vector and 2) the
    // vector of the first vertex of the edge. If all of the angles are the same
    // sign (which is negative since they will be counter-clockwise) then the
    // point is inside the polygon; otherwise, the point is outside.
    for (i = 0, len = polyVerts.length; i < len; i++) {
        v1 = nsub(polyVerts[i], _point);
        v2 = nsub(polyVerts[i + 1 > len - 1 ? 0 : i + 1], _point);
        edge = nsub(v1, v2);
        // Note that we could also do this by using the normal + dot product
        x = perpdot(edge, v1);
        // If the point lies directly on an edge then count it as in the polygon
        if (x < 0) {
            return false;
        }
    }
    return true;
};

Routes.prototype.ESP_trianglebased = function (track, callback) {
    var that = this;
    this.requestOSMObstacles(track, function (obsts) {
        that.generateTriangulation(track, obsts);
        callback(obsts);
    });
    
};

Routes.prototype.generateTriangulation = function (track, obstacles) {
    var bbox = track.bounds;
       
    var north = bbox.northeast.lat,
        east = bbox.northeast.lng,
        south = bbox.southwest.lat,
        west = bbox.southwest.lng;

    var R = 6378137, //Earth radius in meters
        margin = 50; // bbox margin in meters
    
    Logger.debug('north = ' + north + '; east = ' + east + '; south = ' + south + '; west = ' + west);

    north += (180 / Math.PI) * (margin / R);  
    east += (180 / Math.PI) * (margin / (R * Math.cos(Math.PI * north / 180.0)));
    south -= (180 / Math.PI) * (margin / R);  
    west -= (180 / Math.PI) * (margin / (R * Math.cos(Math.PI * south / 180.0)));
    
    Logger.debug('north = ' + north + '; east = ' + east + '; south = ' + south + '; west = ' + west);
    
    var contour = [
        new poly2tri.Point(north, west),
        new poly2tri.Point(north, east),
        new poly2tri.Point(south, east),
        new poly2tri.Point(south, west)
    ];
    var swctx = new poly2tri.SweepContext(contour);
    
    var holes = [];
    Logger.debug(obstacles);
    for (var i = 0, len = obstacles.length; i < len; i++) {
        if (i > 9 && i < 26) continue;
        var hole = [];
        //var hull = obstacles[i].hull;
        var points = obstacles[i].points;
        for (var j = 0, len2 = points.length; j < len2; j++) {
            hole.push(new poly2tri.Point(points[j].x, points[j].y));
        }
        holes.push(hole);
    }
    swctx.addHoles(holes);
    
    swctx.triangulate();
    var triangles = swctx.getTriangles();
    Logger.debug(triangles);
    
    track.esp_tri = {
        tri: triangles
    };
};

