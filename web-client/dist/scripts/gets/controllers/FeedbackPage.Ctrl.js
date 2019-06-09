/**
 * @author      Nikita Davydovsky   <davydovs@cs.karelia.ru>
 * @version     0.1                 (current version number of program)
 * @since       2014-09-03          (the version of the package this class was first added to)
 */

/**
 * Constructor for controller "PointsPage".
 * 
 * @constructor
 * @param {Object} document Main DOM document.
 * @param {Object} window window dom object of the current page.
 */
function FeedbackPage(document, window) {
    this.document = document;
    this.window = window;
    
    // Models
	this._feedback = null;
    this._categories = null;
    this._user = null;
    this._utils = null;

    this._mapCtrl = null;
    
    // Views
	this._feedbackMain = null;
    this._headerView = null;
    this.currentView = null;
}

// Forms
FeedbackPage.MAIN = 'main';
FeedbackPage.ADD_FEEDBACK = 'feedback_add';

FeedbackPage.prototype.changeForm = function() {
    var form = this._utils.getHashVar('form');
    Logger.debug('changeForm form = ' + form);
    if (form === FeedbackPage.MAIN) {
        this.showFeedbackMain();
    } else if (typeof form == 'undefined') {
        this.window.location.replace('#form=' + FeedbackPage.MAIN);
        // this.showFeedbackMain();
    }
};

FeedbackPage.prototype.initPage = function() {
    var self = this;
    
    try {      
        // Init models
		if (!this._feedback) {
            this._feedback = new FeedbackClass();
        }
        if (!this._categories) {
            this._categories = new CategoriesClass();
        }
        if (!this._user) {
            this._user = new UserClass(this.window);
            this._user.fetchAuthorizationStatus();
            Logger.debug('is Auth: ' + this._user.isLoggedIn());
        }
        if (!this._utils) {
            this._utils = new UtilsClass(this.window);
        }
    
        // Init views
		if (!this._feedbackMain) {
            this._feedbackMain = new FeedbackMain(this.document, $(this.document).find('#feedback-main-page'));
            this._feedbackMain.initView(this._user.isLoggedIn());
        }
        if (!this._headerView) {
            this._headerView = new HeaderView(this.document, $(this.document).find('.navbar'));
        }
        
        
        // Init map
        if (this._mapCtrl == null) {
            this._mapCtrl = new MapController(this.document, this.window);
            this._mapCtrl.initMap();
        }        
    } catch (Exception) {
        MessageBox.showMessage(Exception.toString(), MessageBox.ERROR_MESSAGE);
        Logger.error(Exception.toString());
    }

    $(document).on('submit', '#feedback-main-form',  function(e) {
        e.preventDefault();
        //alert("event");
        var form = self._utils.getHashVar('form');
           self.addFeedbackHandler(this, false);

    });

    //Init first page
    this.currentView = this._feedbackMain;
    this.changeForm();
    // Hash change handler
    $(this.window).on('hashchange', function() {
        Logger.debug('hashchanged');
        self.changeForm();
    });
}


//
FeedbackPage.prototype.showFeedbackMain = function() {
    try {
        this._headerView.clearOption();
        
        this._feedbackMain.placeCategoriesInFeedbackMain(this._categories.getCategories());

        this.currentView.hideView();
        this.currentView = this._feedbackMain;
        this.currentView.showView();
    } catch (Exception) {
        MessageBox.showMessage(Exception.toString(), MessageBox.ERROR_MESSAGE);
        Logger.error(Exception.toString());
    }
};

FeedbackPage.prototype.addFeedbackHandler = function(formData, update) {
    var self = this;
    var paramsObj = $(formData).serializeArray();
    //alert("handler");
     //       this._feedback.addFeedback(paramsObj, update);
    this.addFeedback(paramsObj, update);
};

FeedbackPage.prototype.addFeedback = function (paramsObj, update) {
    //alert(paramsObj);
    if (!paramsObj) {
        throw new GetsWebClientException('Feedbacks Error', 'addFeedback, paramsObj is undefined or null');
    }
    if (update && !this.feedback) {
        throw new GetsWebClientException('Feedbacks Error', 'addFeedback, there is no feedback to update');
    }

    Logger.debug(paramsObj);

    var newParamsObj = {};
    var comment = null;
    var category = null;


    $(paramsObj).each(function (idx, value) {
        Logger.debug(idx, value);
        if (value.name == 'category') {
            category = value.value;
        } else if (value.name == 'comment') {
            comment = value.value;
        }
    });

    if (category) {
        newParamsObj.category = category;
    }
    if   (comment)    {
        newParamsObj.comment = comment;
    }

    //alert(newParamsObj.category);
    //alert(newParamsObj.comment);
    var addFeedbackRequest = $.ajax({
        url: ADD_FEEDBACK_ACTION,
        type: 'POST',
        async: false,
        contentType: 'application/json',
        dataType: 'xml',
        data: JSON.stringify(newParamsObj)
    });

    alert("Ваш запрос отправлен!");
};

//
FeedbackPage.prototype.placeCategoriesInFeedbackAdd = function (categories, selected) {
    var feedbackAddCategories = $(this).find('#feedback-main-filter-category');
    var feedbackAddCategories = $(feedbackAddCategories).parent();
    if ($(feedbackAddCategoriesParent).hasClass('hidden')) {
        $(feedbackAddCategoriesParent).removeClass('hidden').addClass('show');
    }
    $(feedbackAddCategories).empty();

    var self = this;
    $(categories).each(function(index, value) {
        var categoryItem = $(self.document.createElement('option'));
        $(categoryItem).attr('value', value.id);
        $(categoryItem).text(value.name);
        $(categoryItem).appendTo(pointAddCategories);
    });

    if (selected) {
        $(feedbackAddCategories).val(selected);
    }
};