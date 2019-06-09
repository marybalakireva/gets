/**
 * @author      Nikita Davydovsky   <davydovs@cs.karelia.ru>
 * @version     0.1                 (current version number of program)
 * @since       2014-09-03          (the version of the package this class was first added to)
 */

/**
 * Constructor for view "PointsMain".
 * 
 * @constructor
 * @param {Object} document Main DOM document.
 * @param {Object} mainPoints mainPoints dom object.
 */
function PointsMain(document, mainPoints) {
    this.document = document;
    this.mainPoints = mainPoints;
}

PointsMain.prototype.initView = function(isAuth) {
    if (!isAuth) {
        $(this.mainPoints).find('#points-main-add-point').addClass('disabled').on('click', function(e) {
            e.preventDefault();
        });
    }
};

/**
 * Place points data into point list HTML object.
 * 
 * @constructor
 * @param {Array} pointList Array which contains points.
 * 
 * @throws {GetsWebClientException}
 */
PointsMain.prototype.placePointsInPointList = function (pointList) {   
    var pointListElement = $(this.mainPoints).find( '#point-list' );
    $( pointListElement ).empty();
   
    if (!pointListElement || !pointListElement.length) {
        throw new GetsWebClientException('PointsMain View Error', 'placePointsInPointList, pointListElement undefined or null');
    }
    
    if (!pointList) {
       throw new GetsWebClientException('PointsMain View Error', 'placePointsInPointList, pointList undefined or null');
    }
    
    var pointListHTML = '';
    for (var i = 0, len = pointList.length; i < len; i++) {
        pointListHTML += '<li class="list-group-item"><a href="#form=point_info&point_uuid=' + pointList[i].uuid + '">' + pointList[i].name + '</a></li>';
    }
    $(pointListElement).html(pointListHTML);
};

/**
 * Place categories into track mainPoints HTML object.
 * 
 * @param {Array} categories Array which contains categories.
 * 
 * @throws {GetsWebClientException}
 */
PointsMain.prototype.placeCategoriesInPointMain = function (categories) {
    var mainPointsCategories = $(this.mainPoints).find('#points-main-filter-category');
    $(mainPointsCategories).empty();

    // Add 'none' category with value -1
    $(this.document.createElement('option'))
            .attr('value', -1)
            .text('None')
            .appendTo(mainPointsCategories);

    var self = this;
    $(categories).each(function(index, value) {
        var categoryItem = $(self.document.createElement('option'));
        $(categoryItem).attr('value', value.id);
        $(categoryItem).text(value.name);
        $(categoryItem).appendTo(mainPointsCategories);
    });
};

/**
 * Show view
 */
PointsMain.prototype.showView = function() {
    $(this.mainPoints).removeClass('hidden').addClass('show');
};

/**
 * Hide view
 */
PointsMain.prototype.hideView = function() {
    $(this.mainPoints).removeClass('show').addClass('hidden');
};

PointsMain.prototype.getLatitude = function() {
    return $(this.mainPoints).find('#points-main-latitude-input').val();
};

PointsMain.prototype.getLongitude = function() {
    return $(this.mainPoints).find('#points-main-longitude-input').val();
};

PointsMain.prototype.getRadius = function() {
    return $(this.mainPoints).find('#points-main-radius-input').val();
};

PointsMain.prototype.setLatitude = function(latitude) {
    $(this.mainPoints).find('#points-main-latitude-input').val(latitude);
};

PointsMain.prototype.setLongitude = function(longitude) {
    $(this.mainPoints).find('#points-main-longitude-input').val(longitude);
};

PointsMain.prototype.setRadius = function(radius) {
    $(this.mainPoints).find('#points-main-radius-input').val(radius);
};

/**
 * Toggle overlay
 */
PointsMain.prototype.toggleOverlay = function() {
    $(this.mainPoints).find('#points-main-overlay').toggleClass('busy-overlay-visible');
};

/**
 * Add overlay
 */
PointsMain.prototype.showOverlay = function() {
    $(this.mainPoints).find('#points-main-overlay').addClass('busy-overlay-visible');
};

/**
 * Remove overlay
 */
PointsMain.prototype.hideOverlay = function() {
    $(this.mainPoints).find('#points-main-overlay').removeClass('busy-overlay-visible');
};