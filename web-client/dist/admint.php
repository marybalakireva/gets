<?php 
session_start();
require_once('./config.php');
require_once(TRANSLATIONS_SCRIPT); 
$_POST  = $_SESSION['POST'];
?>
<html>
    <head>    
     
        <link rel="stylesheet" id="font-awesome-css" href="//netdna.bootstrapcdn.com/font-awesome/4.0.3/css/font-awesome.css" type="text/css" media="screen">
 
        <link rel="stylesheet" href="styles/bootstrap-3.2.0/bootstrap.css">          
        <link rel="stylesheet" href="styles/bootstrap-3.2.0/bootstrap.min.css">
        <link rel="stylesheet" href="styles/bootstrap-3.2.0/bootstrap-theme.min.css">
        <link rel="stylesheet" type="text/css" href="http://cdn.leafletjs.com/leaflet-0.7.2/leaflet.css"/>
        <link rel="stylesheet" type="text/css" href="styles/bootstrap-3.2.0/bootstrap-lightbox.min.css"/>
        <link rel="stylesheet" type="text/css" href="styles/bootstrap-slider.min.css"/>
        <link rel="stylesheet" href="styles/languages.min.css">
        <link rel="stylesheet" type="text/css" href="styles/leaflet.contextmenu.css"/>
        <?php
        include_once('html_headers.php');
        ?>
       
        <!-- ADD ACTION CONSTANTS SPECIFIC FOR DOMAIN -->
        <script src="actions/generateActionNames.php"></script>
        <!-- ADD IMAGE CONSTANTS SPECIFIC FOR DOMAIN -->
        <script src="images/generateImagesPaths.php"></script>
        
        <script src="scripts/jquery/jquery-1.11.1.js"></script>
        <script src="scripts/jquery/jquery-1.11.1.min.js"></script>
        <script src="scripts/jquery/jquery.cookie.js"></script>
        <script src="scripts/bootstrap/bootstrap.min.js"></script>
        <script src="scripts/bootstrap/bootstrap-lightbox.min.js"></script>
        <script src="http://cdn.leafletjs.com/leaflet-0.7.2/leaflet.js"></script>
        <script src="scripts/logger.min.js"></script>
        <script src="scripts/readmore.min.js"></script>
        <script src="scripts/bootstrap-slider.min.js"></script>
        <script src="scripts/leaflet.contextmenu.js"></script>
        <script src="scripts/Polyline.encoded.js"></script>
        <script src="scripts/graham_scan.min.js"></script>
        <script src="scripts/jquery.inputmask.bundle.min.js"></script>
        <script src="scripts/admin/scrollToTop.js"></script>

        <script type="text/javascript" src="http://maps.google.com/maps/api/js?sensor=true"></script>
        <script type="text/javascript" src="http://ajax.googleapis.com/ajax/libs/jquery/1.7/jquery.min.js"></script>
        <script type="text/javascript" src="scripts/jquery/jquery.googlemap.js"></script>
<style>
tr{
    display:none;
}
</style>
        <script>

            $(function(){

                $( document ).ready(function() {

                    $("#seeMoreRecordsPoints").click();
                    $("#seeMoreRecordsTracks").click();
                   
                });

                $("#mapCont").googleMap({
                    zoom: 11, // Initial zoom level (optional)
                    coords: [61.787617, 34.364347], // Map center (optional)
                    type: "ROADMAP" // Map type (optional)                    
                });
               
                $('.btn-map').on("click", function () {

                    latitude = $(this).parent().find("input[name*='latitude']").val();
                    longitude = $(this).parent().find("input[name*='longitude']").val();
                    name = $(this).parent().find("input[name*='name']").val();
                    point_id = $(this).parent().find("input[name*='point_id']").val();
               
                    element = $("#mapCont");
                    
                    offsetTop = element.offset().top;
                    $('html, body').animate({scrollTop: offsetTop}, 500);

                    element.addMarker({
                        coords: [latitude, longitude], // GPS coords
                        title: name, // Title
                        text:  'id=' + point_id // HTML content
                    });                   
                }); 

                $('.maintr').on("click", function () {

                    $('.subtr').fadeOut();

                    var subtr = $(this).next();              

                    subtr.is(":visible") ? subtr.fadeOut() : subtr.fadeIn();                 
                });    

                var currentIndexPoints = 0;
                var currentIndexTracks = 0;

                $("#seeMoreRecordsPoints").click(function () { 

                    $(".points-table .maintr").slice(currentIndexPoints, currentIndexPoints + 10).fadeIn();
                    currentIndexPoints += 10;

                    if (currentIndexPoints > $(".points-table .maintr").length){
                        $("#seeMoreRecordsPoints").fadeOut();
                    }
                });   

                $("#seeMoreRecordsTracks").click(function () { 

                    $(".Tracks-table .maintr").slice(currentIndexTracks, currentIndexTracks + 10).fadeIn();
                    currentIndexTracks += 10;

                    if (currentIndexTracks > $(".points-table .maintr").length){
                        $("#seeMoreRecordsTracks").fadeOut();
                    }
                });  

                $('.point').on('click', function () {
                    
                    var clickPoint = $(this);
                    clickPointId = clickPoint.attr('id');

                    $(".points-table .maintr #id").each(function(){

                        if($(this).text().indexOf(clickPointId) == 0){

                            element = $(this);

                            subtr = element.next();
                            subtr.click();
                            
                            offset = element.offset();
                            offsetTop = offset.top;
                            $('html, body').animate({scrollTop: offsetTop}, 500);
                            return false;
                        }

                    });  
                });    

                $(".dropdown-menu-item").on("click",function() { 

                    var span = '<span class=\"caret\"></span>'; 
                    var btn = $(this).parent().parent().parent().find(".btn");
                    var input = $(this).parent().parent().parent().find("input");
                    
                    btn.text($(this).text());
                    btn.append(span);

                    input.attr("value", $(this).attr("id"));
                });

                $( ".addPhotoBtn" ).click(function() 
                { 
                    $(this).parent().append(jQuery('<input>', {
                        'name': 'snap' +  $(this).attr("num"), 
                        'class': 'form-control',
                        'type': 'text'
                    }));

                    $(this).attr("num", parseInt($(this).attr("num")) + 1);                    
                });

                $("#search").on("keyup", function() {
                    var value = $(this).val();   
                    $(".maintr").each(function(index) {
                        if(value == ""){
                            $(this).show();
                        }else{
                            $(this).hide();
                        }
                    })     
                    $(".maintr td").each(function(index) {
                        if (index != 0) {

                            $row = $(this).text();                     

                            if ($row.toLowerCase().indexOf(value.toLowerCase()) >= 0) {
                                $(this).parent().show();
                            }                            
                        }
                    })   
                });
            });


        </script>


        <title>GeTS Web Client</title>
    </head>
    <body>
        <div class="main-container">
            <div class="main-header">
                <?php                
                require_once('./widgets/Header.inc');
                echo get_navbar_depend_on_page(basename(__FILE__, '.php'));
                ?>
            </div>
            <div class="main-content">

                <div class="action-menu">
                    <div class="menu-admin-container">
                            <?php
                                require_once('./widgets/AdminsMenu.inc');
                                echo get_admin_menu_item(basename(__FILE__, '.php'));   
                            ?> 
                    </div>
                </div>
                <div class="main-action">

                        <h1><?php echo getString('search','Search') ?></h1>  
                        <input id="search" name="search" type="text" class="form-control" placeholder="<?php echo getString('search..','Search..') ?>"/> 
                        <br/>
                  
                        <h1><?php echo getString('list-of-all-points','List of all points') ?></h1>  
                        
                        <table class="table table-hover tablesorter points-table">
                            <?php 
                               require_once('./actions/getUserPoints.php');
                            ?>
                        </table>
                        <input id="seeMoreRecordsPoints" type="button" value="More" class="btn btn-primary"/>
                        <div class="result"></div>

                        <h1><?php echo getString('list-of-all-tracks','List of all tracks') ?></h1>  
                        
                        <table class="table table-hover tablesorter tracks-table">
                            <?php 
                               require_once('./actions/getUserTracks.php');
                            ?>
                        </table>
                        <input id="seeMoreRecordsTracks" type="button" value="<?php echo getString('more','More') ?>" class="btn btn-primary"/>
                        <div class="result"></div>

                        
                        <!--     -->
                        
                </div> 
                <div id="mapCont" ></div>
            </div>

            <div class="scroll-top-wrapper ">
                <span class="scroll-top-inner">
                    <i class="fa fa-2x fa-arrow-circle-up"></i>
                </span>
            </div>
           <!--- <div class="main-footer">
                <?php
                /*require_once('./widgets/Footer.inc');
                //$xml = simplexml_load_file('./actions/getCategories.php');
                //$xml = require_once('./actions/getCategories.php');
                echo "zaza\n";
echo $xml;*/
              /*  foreach($xml->xpath("content/categories/category") as $i){
                    echo "ИМЯ:" . $i->name . "<br/> " ;  
                }*/
            ?>
            </div> -->
        </div>         
    </body>
</html>