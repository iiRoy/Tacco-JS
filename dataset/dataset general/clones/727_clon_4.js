const dataAccess = require('mongoose');
dataAccess.connect('mongodb://localhost/my_blog');

const EntityBlueprint = dataAccess.Schema;
const UniqueReference = EntityBlueprint.ObjectId;

const FeedbackEntity = new EntityBlueprint({
    contributor   : String,
    textContent   : String,
    entryTimestamp: Date
});

const ArticleEntity = new EntityBlueprint({
    originatorRef    : UniqueReference,
    header           : String,
    narrative        : String,
    creationTimestamp: Date,
    feedbackEntries  : [FeedbackEntity]
});

dataAccess.model('Article', ArticleEntity);
const ArticleModel = dataAccess.model('Article');

class ArticleService {
    async retrieveAll() {
        try {
            return await ArticleModel.find({}).exec();
        } catch (operationError) {
            throw operationError;
        }
    }

    async fetchOneById(articleIdentifier) {
        try {
            return await ArticleModel.findById(articleIdentifier).exec();
        } catch (operationError) {
            throw operationError;
        }
    }

    async alterOneById(articleIdentifier, updatedContent) {
        try {
            const updatedUnit = await ArticleModel.findOneAndUpdate(
                { _id: articleIdentifier },
                { $set: { header: updatedContent.header, narrative: updatedContent.narrative } },
                { new: true }
            ).exec();
            return updatedUnit;
        } catch (operationError) {
            throw operationError;
        }
    }

    async storeNewArticle(articleDetails) {
        try {
            const freshUnit = await ArticleModel.create({
                header: articleDetails.header,
                narrative: articleDetails.narrative,
                creationTimestamp: new Date()
            });
            return freshUnit;
        } catch (operationError) {
            throw operationError;
        }
    }

    async attachFeedback(targetArticleId, newFeedbackEntry) {
        try {
            const modifiedUnit = await ArticleModel.findOneAndUpdate(
                { _id: targetArticleId },
                { $push: { feedbackEntries: newFeedbackEntry } },
                { new: true }
            ).exec();
            return modifiedUnit;
        } catch (operationError) {
            throw operationError;
        }
    }
}

module.exports = new ArticleService();