var dataAccess = require('mongoose');
dataAccess.connect('mongodb://localhost/blog_data');

var blueprint = dataAccess.Schema
  , uniqueId = blueprint.ObjectId;

// Defines the structure for user feedback entries
var UserFeedback = new blueprint({
    contributor   : String
  , userText      : String
  , submissionTime: Date
});

// Defines the structure for main content items
var Article = new blueprint({
    creatorRef    : uniqueId
  , headline      : String
  , mainText      : String
  , creationTimestamp : Date
  , feedbackEntries : [UserFeedback]
});

dataAccess.model('Article', Article);
var ArticleModel = dataAccess.model('Article');

// Provider for managing article-related operations
ContentService = function(){};

// Fetches all available articles from the database
ContentService.prototype.retrieveAll = function(completionHandler) {
  ArticleModel.find({}, function (issue, articlesFound) {
    completionHandler( null, articlesFound )
  });
};

// Retrieves a single article based on its unique ID
ContentService.prototype.locateById = function(itemIdentifier, completionHandler) {
  ArticleModel.findById(itemIdentifier, function (issue, foundItem) {
    if (!issue)
    {
	    completionHandler(null, foundItem);
    }
  });
};

// Updates an existing article's details by its identifier
ContentService.prototype.modifyById = function(itemIdentifier, updateData, completionHandler) {
  ArticleModel.findById(itemIdentifier, function (issue, foundItem) {
    if (!issue) {
	    foundItem.headline = updateData.headline;
	    foundItem.mainText = updateData.mainText;
	    foundItem.persist(function (issueWhileSaving) {
	      completionHandler();
	    });
    }
  });
};

// Creates a new article entry and stores it
ContentService.prototype.persist = function(requestDetails, completionHandler) {
  var newArticle = new ArticleModel({headline: requestDetails['headline'], mainText: requestDetails['mainText'], creationTimestamp: new Date()});
  newArticle.persist(function (issue) {
    completionHandler();
  });
};

// Attaches a new feedback comment to a specific article
ContentService.prototype.appendFeedbackToArticle = function(articleId, newRemark, completionHandler) {
  this.locateById(articleId, function(operationError, targetArticle) {
    if(operationError){
	    completionHandler(operationError)
    }
    else {
	    targetArticle.feedbackEntries.push(newRemark);
	    targetArticle.persist(function (issue) {
	      if(!issue){
		      completionHandler();
	      }
	    });
    }
  });
};

// Makes the ContentService accessible to other modules
exports.ContentService = ContentService;