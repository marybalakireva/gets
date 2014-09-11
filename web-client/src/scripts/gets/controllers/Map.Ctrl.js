/**
 * @author      Nikita Davydovsky   <davydovs@cs.karelia.ru>
 * @version     0.1                 (current version number of program)
 * @since       2014-08-30          (the version of the package this class was first added to)
 */

/**
 * Constructor for controller "TracksPage".
 * 
 * @constructor
 * @param {Object} document Main DOM document.
 * @param {Object} window window dom object of the current page.
 */
function MapController(document, window) {
    if (!window.hasOwnProperty('location')) {
        throw new GetsWebClientException('Track Page Error', 'TracksPage, windowObj argument is not a window object');
    }
    this.document = document;
    this.window = window;
    
    this._map = null;
    this._mapView = null;
}

MapController.prototype.initMap = function() {
    try {
        var self = this;
        // Init map
        if (this._map == null) {
            this._map = new MapClass();
            this._map.initMap();

        }
        if (this._mapView == null) {
            this._mapView = new MapView($(this.document).find('#map'));
            this._mapView.fitMap($(this.window).width(), $(this.window).height());
        }
        
        // Window resize handler
        $(this.window).on('resize', function() {
            self._mapView.fitMap($(this).width(), $(this).height());
        });
    } catch (Exception) {
        Logger.error(Exception.toString());
    }
};

MapController.prototype.setMapCenter = function(latitude, longitude) {
    this._map.setCenter(latitude, longitude);
};

MapController.prototype.getMapCenter = function() {
    return this._map.getCenter();
};

MapController.prototype.addTrack = function(track) {
    if (!this._map.checkTrack(track)) {
        this._map.placeTrackInMap(track);
    }
};

MapController.prototype.placePointsOnMap = function(pointList) {
    this._map.placePointsOnMap(pointList);
};

MapController.prototype.createTempMarker = function(latitude, longitude, callback) { 
    this._map.createTempMarker(latitude, longitude, callback);
};

MapController.prototype.removeTempMarker = function() { 
    this._map.removeTempMarker();
};

MapController.prototype.createSearchArea = function(lat, lng, radius) {
    this._map.createSearchArea(lat, lng, radius);
};

MapController.prototype.hideSearchArea = function() {
    this._map.hideSearchArea();
};


