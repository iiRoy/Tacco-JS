ArticleRecords = new Mongo.Collection('articles');
FeedbackEntries = new Mongo.Collection('feedback');
ActivityLogs = new Mongo.Collection('userActivity'); // New collection for Type III

RecordBlueprints = {};

const maxHeadlineLength = 180; // Added constant

RecordBlueprints.ArticleSchema = new SimpleSchema({
  headline: {
    type: String,
    label: "Article Headline",
    max: maxHeadlineLength,
    optional: true // Can be empty initially
  },
  contentNarrative: {
    type: String,
    label: "Main Content",
    optional: true
  },
  creationDate: {
    type: Date, // Changed from Number to Date
    label: "Published On",
    autoValue: function() {
      if (this.isInsert) {
        return new Date();
      } else if (this.isUpsert) {
        return { $setOnInsert: new Date() };
      } else {
        this.unset(); // Prevent updates
      }
    }
  },
  authorIdentifier: {
    type: String,
    label: "Author User ID",
    optional: true
  },
  categoryLabels: {
    type: [String],
    label: "Categories",
    optional: true,
    defaultValue: []
  },
  status: { // Added new field
    type: String,
    label: "Publication Status",
    allowedValues: ['draft', 'published', 'archived'],
    defaultValue: 'draft'
  }
});

RecordBlueprints.FeedbackSchema = new SimpleSchema({
  feedbackContent: {
    type: String,
    label: "Comment Text",
    optional: true
  },
  associatedArticleId: {
    type: String,
    label: "Related Article ID"
  },
  submissionTime: { // Renamed and changed to Date
    type: Date,
    label: "Submitted At",
    autoValue: function() {
      if (this.isInsert) {
        return new Date();
      } else if (this.isUpsert) {
        return { $setOnInsert: new Date() };
      } else {
        this.unset();
      }
    }
  },
  submitterIdentity: { // Renamed field
    type: String,
    label: "Commenter's User ID",
    optional: true
  }
});

RecordBlueprints.AccountSchema = new SimpleSchema({
  contactDetails: { // Renamed from 'emails'
    type: Array,
    optional: true
  },
  'contactDetails.$': {
    type: Object
  },
  'contactDetails.$.emailAddress': { // Renamed
    type: String,
    regEx: SimpleSchema.RegEx.Email
  },
  'contactDetails.$.isVerified': { // Renamed
    type: Boolean
  },
  accountCreationDate: { // Renamed from 'createdAt'
    type: Date
  },
  authServices: { // Renamed from 'services'
    type: Object,
    optional: true,
    blackbox: true
  },
  lastLogin: { // Added new field
    type: Date,
    optional: true
  }
});

// Attach the defined data models to their respective collections
ArticleRecords.attachSchema(RecordBlueprints.ArticleSchema);
FeedbackEntries.attachSchema(RecordBlueprints.FeedbackSchema);
Meteor.users.attachSchema(RecordBlueprints.AccountSchema);

// Configuration for the inline content editor widget
// Removed EditableText.maximumImageSize as it's less critical for the clone's core functionality demonstration.
ContentEditor.enableUndoRedo = true; // Renamed property

ContentEditor.registerCallbacks({
  // Callback to enrich documents with creation date and author info before saving
  enrichDocumentOnSave: function(sourceDoc) {
    let augmentedFields = { creationDate: new Date() }; // Changed from timestamp:Date.now()
    const currentUser = Meteor.user();

    if (currentUser && currentUser.contactDetails && currentUser.contactDetails.length > 0) {
      const userEmail = currentUser.contactDetails[0].emailAddress;
      augmentedFields.authorIdentifier = userEmail;
    } else {
      // Fallback for guest users or users without email
      augmentedFields.authorIdentifier = 'anonymous@example.com';
    }
    // Using spread syntax for object merging
    return { ...sourceDoc, ...augmentedFields };
  }
});

// Configuration for transaction management system
OperationHistory.allowGuestOperations = true; // Renamed tx to OperationHistory and requireUser to allowGuestOperations

if (Meteor.isClient) {

  ReactiveObserver.autorun(function() {
    // Dynamically enable/disable undo/redo based on user login status
    ContentEditor.enableUndoRedo = Boolean(Meteor.user());
  });

  OperationHistory.controlButtonStyle = 'button btn-info history-control'; // Renamed

  Template.articleListing.helpers({ // Renamed template and helpers
    retrieveArticles: function() {
      // Fetch articles, sorted by creation date descending, limiting to 10
      return ArticleRecords.find({ status: { $ne: 'archived' } }, { sort: { creationDate: -1 }, limit: 10 });
    },
    fetchFeedbackEntries: function() {
      // Retrieve comments for the current article, sorted by submission time ascending
      return FeedbackEntries.find({ associatedArticleId: this._id }, { sort: { submissionTime: 1 } });
    },
    generateNewFeedbackStub: function() {
      // Provides a default document structure for new comments
      return { associatedArticleId: this._id };
    },
    formattedCreationDate: function() {
      if (!this.creationDate instanceof Date || isNaN(this.creationDate)) {
        return 'Invalid Date'; // Guard clause
      }
      // Format date to a more readable string, excluding the year
      const dateString = this.creationDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
      // Removing the last 4 characters (year)
      return dateString.substring(0, dateString.length - 5);
    },
    articleEditorOptions: function() { // Renamed options object
      return {
        targetCollection: "articles", // Renamed collection
        editField: "headline", // Renamed field
        removeEmpty: true,
        acceptEmpty: true,
        emptyPrompt: "Enter article headline here", // Renamed placeholder
        visualFallback: '<i class="fas fa-edit"></i>' // Renamed substitute, changed icon class
      };
    },
    // New helper: checks if the current user is the author
    isAuthor: function() {
      const currentUser = Meteor.user();
      if (!currentUser || !currentUser.contactDetails || currentUser.contactDetails.length === 0) {
        return false;
      }
      return currentUser.contactDetails[0].emailAddress === this.authorIdentifier;
    }
  });

}

if (Meteor.isServer) {
  // Utility function to generate sample article content
  const generateSampleContent = (title) => `This is the descriptive narrative for the article titled "${title}".
    It demonstrates the capabilities of the <a href="https://github.com/JackAdams/meteor-editable-text">ContentEditor</a> package.
    <br/><br/>
    Feel free to modify this content using the built-in WYSIWYG editor.
    This application is built with various Meteor packages including aldeed:collection2, babrahams:transactions, and babrahams:editable-text.
    Source code is available on GitHub.`;

  // Function to initialize or reset application data
  const initializeAndCleanData = function() { // Renamed 'destroy'
    console.log('Server: Resetting application data...');
    ArticleRecords.remove({});
    FeedbackEntries.remove({});
    OperationHistory.Records.remove({}); // Renamed tx.Transactions

    const initialArticleId = "article_alpha_001"; // Changed ID
    const sampleArticleTitle = "Exploring Dynamic Content Editing with Meteor";

    // Insert a primary demonstration article
    ArticleRecords.insert({
      _id: initialArticleId,
      creationDate: new Date(), // Changed to Date object
      headline: sampleArticleTitle,
      contentNarrative: generateSampleContent(sampleArticleTitle),
      authorIdentifier: "demo@example.com",
      categoryLabels: ['Meteor', 'JavaScript', 'WebDev'], // Renamed tags
      status: 'published' // Added status field
    });

    // Insert some initial feedback entries for the primary article
    FeedbackEntries.insert({
      associatedArticleId: initialArticleId,
      submissionTime: new Date(Date.now() - 3600000), // One hour ago
      feedbackContent: "To remove this comment, clear its text and press 'Enter'. This is enabled by the ContentEditor configuration.",
      submitterIdentity: "guest@guest.com"
    });
    FeedbackEntries.insert({
      associatedArticleId: initialArticleId,
      submissionTime: new Date(Date.now() - 1800000), // 30 mins ago
      feedbackContent: "Log in with demo@demo.com / password to see author names in posts and comments.",
      submitterIdentity: "info@system.com"
    });
    FeedbackEntries.insert({
      associatedArticleId: initialArticleId,
      submissionTime: new Date(),
      feedbackContent: "All data automatically resets periodically to maintain a fresh demo environment.",
      submitterIdentity: "admin@system.com"
    });

    // Schedule a self-destruct mechanism for the data
    const resetIntervalMinutes = 20; // Changed from 15 to 20
    console.log(`Server: Data scheduled for reset in ${resetIntervalMinutes} minutes.`);
    Meteor.setTimeout(function() {
      initializeAndCleanData(); // Recursive call for continuous reset
    }, resetIntervalMinutes * 60 * 1000);
  };

  // Execute the data initialization on server startup
  initializeAndCleanData();

  // New server-side publication for articles (Type III addition)
  Meteor.publish('allArticles', function() {
    return ArticleRecords.find({});
  });

  // New server-side method to log user activity (Type III addition)
  Meteor.methods({
    'logUserAction': function(actionType, details) {
      if (!this.userId) {
        throw new Meteor.Error('not-authorized', 'User must be logged in to log activity.');
      }
      ActivityLogs.insert({
        userId: this.userId,
        action: actionType,
        details: details,
        timestamp: new Date()
      });
      console.log(`User ${this.userId} performed action: ${actionType}`);
    }
  });
}