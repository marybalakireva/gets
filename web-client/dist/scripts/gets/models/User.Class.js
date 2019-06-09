/**
 * @author      Nikita Davydovsky   <davydovs@cs.karelia.ru>
 * @version     0.1                 (current version number of program)
 * @since       2014-08-30          (the version of the package this class was first added to)
 */

/**
 * Constructor for class "User". This class is suppoused to contain all user 
 * data and methods to operate on it.
 * 
 * @constructor
 * @param {Object} windowObj windowObj window dom object of the current page.
 */
function UserClass(windowObj) {
    this.email = null;
    this.coreUser = null;
    this.trustedUser = null;
    this.adminUser = null;
    this.isAuthorized = false;
    if (!windowObj.hasOwnProperty('location')) {
        throw new GetsWebClientException('User Error', 'UserClass, windowObj argument is not a window object');
    }
    this.windowObj = windowObj;
    this.coords = null;
    this.coordsSet = false;
};

/**
 * Authorize user using Google OAuth2.0.
 * 
 * @throws {GetsWebClientException}
 */ 
UserClass.prototype.authorizeGoogle = function() {
    var getRedirectLinkRequest = $.ajax({
        url: LOGIN_ACTION,
        type: 'POST',
        async: false, 
        contentType: 'application/json',
        dataType: 'xml', 
        data: ''
    });
    
    getRedirectLinkRequest.fail(function(jqXHR, textStatus) {
        throw new GetsWebClientException('User Error', 'authorizeGoogle, getRedirectLinkRequest failed ' + textStatus);
    });

    if ($(getRedirectLinkRequest.responseText).find('code').text() !== '2') {
        throw new GetsWebClientException('User Error', 'authorizeGoogle, getRedirectLinkRequest: ' + $(getRedirectLinkRequest.responseText).find('message').text());
    }
    
    var id = $(getRedirectLinkRequest.responseText).find('id').text();
    var redirect_url = $(getRedirectLinkRequest.responseText).find('redirect_url').text();
    
    var googleAuthWindow = this.windowObj.open(redirect_url, 'Google Auth', 'height=600,width=500');
    var self = this;
    var timer = setInterval(function() {
        if (googleAuthWindow.closed) {
            clearInterval(timer);
            
            var getAuthTokenRequest = $.ajax({
                url: LOGIN_ACTION,
                type: 'POST',
                async: true,
                contentType: 'application/json',
                dataType: 'xml',
                data: JSON.stringify({id: id})
            });
            
            getAuthTokenRequest.fail(function(jqXHR, textStatus) {
                throw new GetsWebClientException('User Error', 'authorizeGoogle, getAuthTokenRequest failed ' + textStatus);
            });

            getAuthTokenRequest.done(function (data, textStatus, jqXHR) {
                if ($(jqXHR.responseText).find('code').text() !== '0') {
                    throw new GetsWebClientException('User Error', 'authorizeGoogle, getAuthTokenRequest: ' + $(jqXHR.responseText).find('message').text());
                }
                Logger.debug($(jqXHR.responseText).find('auth_token').text());
                self.windowObj.location.replace('#form=main');
                self.windowObj.location.reload(true);
            });        
        }
    }, 1000);
};

UserClass.prototype.logout = function() {
    $.ajax({
        url: LOGOUT_ACTION,
        type: 'GET',
        async: false,
        contentType: 'text/xml',
        dataType: 'xml',
        data: ''
    });
    this.windowObj.location.reload(true);
};

/**
 * Fetch authorization status from the GeTS Server.
 * 
 * @throws {GetsWebClientException}
 */
UserClass.prototype.fetchAuthorizationStatus = function() {
    var getAuthStatusRequest = $.ajax({
        url: IS_LOGGED_IN_ACTION,
        type: 'GET',
        async: false,
        data: null
    });
    
    getAuthStatusRequest.fail(function(jqXHR, textStatus) {
        throw new GetsWebClientException('User Error', 'fetchAuthorizationStatus, getAuthStatusRequest failed ' + textStatus);
    });
       
    var statusObj = JSON.parse(getAuthStatusRequest.responseText);
    if (statusObj.hasOwnProperty('status')) {       
        this.isAuthorized = statusObj.status;
    }
};

/**
 * Fetch user's info from the GeTS Server.
 * 
 * @throws {GetsWebClientException}
 */
UserClass.prototype.fetchInfo = function() {
    var getEmailRequest = $.ajax({
        url: GET_USER_INFO_ACTION,
        type: 'GET',
        async: false,
        data: null
    });
    
    getEmailRequest.fail(function(jqXHR, textStatus) {
        throw new GetsWebClientException('User Error', 'fetchEmail, getEmailRequest failed ' + textStatus);
    });
    
    Logger.debug(getEmailRequest.responseText);
    
    var emailObj = JSON.parse(getEmailRequest.responseText);      
    this.email = emailObj.email;
    this.coreUser = emailObj.core_user;
    this.trustedUser = emailObj.trusted_user;
    this.adminUser = emailObj.admin_user;
};
/**
 * Get users geo coordinates.
 * 
 * @returns {Object} User's location in format {latitude: "someLatitude", longitude: "someLongitude"}
 */
UserClass.prototype.setUserGeoPosition = function(position) {
    this.coords = {};
    this.coords.lat = position.coords.latitude;
    this.coords.lng = position.coords.longitude;
    this.coordsSet = true;
};

UserClass.prototype.handleGeoLocationError = function (error) {
    switch(error.code) {
        case error.PERMISSION_DENIED:
            throw new GetsWebClientException('User Error', 'handleGeoLocationError, user denied the request for Geolocation');
        case error.POSITION_UNAVAILABLE:
            throw new GetsWebClientException('User Error', 'handleGeoLocationError, location information is unavailable');
        case error.TIMEOUT:
            throw new GetsWebClientException('User Error', 'handleGeoLocationError, the request to get user location timed out');
        case error.UNKNOWN_ERROR:
            throw new GetsWebClientException('User Error', 'handleGeoLocationError, an unknown error occurred');
    }
};

/**
 * Get authorization status.
 */
UserClass.prototype.isLoggedIn = function() {
    return this.isAuthorized;
};

/**
 * Get users coords.
 * 
 * @returns {Object} coordiantes {latitude: "someLatitude", longitude: "someLongitude"}.
 */
UserClass.prototype.getUsersGeoPosition = function() {
    return this.coords;
};

/**
 * Check is user's coordinates set.
 * 
 * @returns {Boolean} coordiantes status.
 */
UserClass.prototype.isCoordsSet = function() {
    return this.coordsSet;
};

/**
 * Get users email.
 */
UserClass.prototype.getEmail = function() {
    if (!this.email) {
        this.fetchInfo();
    }
    return this.email;
};

/**
 * Is core user.
 */
UserClass.prototype.isCoreUser = function() {
    if (!this.coreUser) {
        this.fetchInfo();
    }
    return this.coreUser;
};

/**
 * Is trusted user.
 */
UserClass.prototype.isTrustedUser = function() {
    if (!this.trustedUser) {
        this.fetchInfo();
    }
    return this.trustedUser;
};

/**
 * Is admin user.
 */
UserClass.prototype.isAdminUser = function() {
    if (!this.adminUser) {
        this.fetchInfo();
    }
    return this.adminUser;
};

/**
 * Is admin user.
 */
UserClass.prototype.getUser = function() {
    this.fetchInfo();
    return {
        email: this.email,
        coreUser: this.coreUser,
        trustedUser: this.trustedUser,
        adminUser: this.adminUser,
        isAuth: this.isAuthorized
    };
};