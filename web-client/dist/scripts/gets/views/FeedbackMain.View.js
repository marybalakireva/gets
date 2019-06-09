/**
 * @author      Nikita Davydovsky   <davydovs@cs.karelia.ru>
 * @version     0.1                 (current version number of program)
 * @since       2014-09-03          (the version of the package this class was first added to)
 */


function FeedbackMain(document, mainFeedback) {
    this.document = document;
    this.mainFeedback = mainFeedback;
}

FeedbackMain.prototype.initView = function(isAuth) {
    if (!isAuth) {
        $(this.mainFeedback).find('#feedback-main-add-feedback').addClass('disabled').on('click', function(e) {
            e.preventDefault();
        });
    }
};


FeedbackMain.prototype.placeCategoriesInFeedbackMain = function (categories) {
    var mainFeedbackCategories = $(this.mainFeedback).find('#feedback-main-filter-category');
    $(mainFeedbackCategories).empty();

    // Add 'none' category with value -1
    $(this.document.createElement('option'))
        .attr('value', -1)
        .text('None')
        .appendTo(mainFeedbackCategories);

    var self = this;
    $(categories).each(function(index, value) {
        var categoryItem = $(self.document.createElement('option'));
        $(categoryItem).attr('value', value.id);
        $(categoryItem).text(value.name);
        $(categoryItem).appendTo(mainFeedbackCategories);
    });
};

FeedbackMain.prototype.hideView = function() {
    $(this.mainFeedback).removeClass('show').addClass('hidden');
};
FeedbackMain.prototype.showView = function() {
    Logger.debug('showView');
    $(this.mainFeedback).removeClass('hidden').addClass('show');
};