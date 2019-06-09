/**
 * @author      Nikita Davydovsky   <davydovs@cs.karelia.ru>
 * @version     0.1                 (current version number of program)
 * @since       2014-08-30          (the version of the package this class was first added to)
 */

/**
 * Constructor for class "Categories". This class is suppoused to contain all categories 
 * data and methods to operate on it.
 * 
 * @constructor
 */
function CategoriesClass() {
    this.categories = null;
};

/**
 * Check whether categories are downloaded or not.
 */
CategoriesClass.prototype.isCategoriesDownloaded = function () {
    return !!this.categories;
};

/**
 * Check is categories need to be downloaded.
 */
CategoriesClass.prototype.checkCategories = function () {
    if (!this.isCategoriesDownloaded()) {
        this.downloadCategories();
    }
};

/**
 * Download list of categories from the GeTS Server. 
 */
CategoriesClass.prototype.downloadCategories = function () {
    var getCategoriesRequest = $.ajax({
        url: GET_CATEGORIES_ACTION,
        type: 'POST',
        async: false, 
        contentType: 'application/json', 
        dataType: 'xml', 
        data: ''
    });
       
    getCategoriesRequest.fail(function( jqXHR, textStatus ) {
        throw new GetsWebClientException('Categories Error', 'getCategoriesAsArray, getCategoriesRequest failed ' + textStatus);
    });
      
    if ($(getCategoriesRequest.responseText).find('code').text() !== '0') {
        throw new GetsWebClientException('Categories Error', 'getCategoriesAsArray, ' + $(getCategoriesRequest.responseText).find('message').text());
    }

    var categoryElementList = $(getCategoriesRequest.responseText).find('category');
    var categoriesArray = [];
    $(categoryElementList).each(function (index, value) {
        var categoryObj = {};
        categoryObj.id = $(value).find('id').length ? $(value).find('id').text() : '';
        categoryObj.name = $(value).find('name').length ? $(value).find('name').text() : '';
        categoryObj.description = $(value).find('description').length ? $(value).find('description').text() : '';
        categoryObj.url = $(value).find('url').length ? $(value).find('url').text() : '';

        categoriesArray.push(categoryObj);
    });

    this.categories = categoriesArray;
};

/**
 * Getters
 */
CategoriesClass.prototype.getCategories = function () {
    this.checkCategories();
    return this.categories;
};