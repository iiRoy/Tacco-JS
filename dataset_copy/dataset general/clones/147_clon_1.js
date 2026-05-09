Posts = new Mongo.Collection( 'posts' ); /* Initialize the Posts collection */

Comments = new Mongo.Collection( 'comments' ); // Initialize the Comments collection


Schemas = {}; /* Global object to store all schema definitions */


// --- Schema Definition for Posts ---
Schemas.Post = new SimpleSchema(
    {
        // The title of the blog post
        title: {
            type:     String,
            label:    "Title",
            max:      200,
            optional: true
        },

        // The main body content of the post
        body: {
            type:     String,
            label:    "Body",
            optional: true
        },

        // Timestamp of post creation or last update
        timestamp: {
            type:  Number,
            label: "Timestamp"
        },

        // The user who created the post
        user: {
            type:     String,
            label:    "User",
            optional: true
        },

        // An array of tags for categorizing the post
        tags: {
            type:     [String],
            label:    "Tags",
            optional: true
        }
    }
);


// --- Schema Definition for Comments ---
Schemas.Comment = new SimpleSchema(
    {
        // The actual text content of the comment
        text: {
            type:     String,
            label:    "text",
            optional: true
        },

        // The ID of the post this comment belongs to
        post_id: {
            type:  String,
            label: "post_id"
        },

        // Timestamp of comment creation
        timestamp: {
            type:  Number,
            label: "Timestamp"
        },

        // The user who made the comment
        user: {
            type:     String,
            label:    "User",
            optional: true
        }
    }
);


// --- Schema Definition for Users (Meteor's built-in users) ---
Schemas.User = new SimpleSchema(
    {
        // Array of email objects for the user
        emails: {
            type:     [Object],
            optional: true
        },

        // Address field within the emails array
        "emails.$.address": {
            type:  String,
            regEx: SimpleSchema.RegEx.Email // Regex for email validation
        },

        // Verified status field within the emails array
        "emails.$.verified": {
            type: Boolean
        },

        // Date when the user account was created
        createdAt: {
            type: Date
        },

        // Services object (e.g., login services like password, facebook)
        services: {
            type:     Object,
            optional: true,
            blackbox: true // Do not validate contents of this object
        }
    }
);


// Attach the defined schemas to their respective collections
Posts.attachSchema( Schemas.Post );
Comments.attachSchema( Schemas.Comment );
Meteor.users.attachSchema( Schemas.User );


// --- Configuration for the EditableText package ---

// Enable transaction tracking for EditableText changes
EditableText.useTransactions = true;

// Set the maximum allowed image size for uploads (in bytes)
EditableText.maximumImageSize = 200000;


// Register a callback function for EditableText operations
EditableText.registerCallbacks(
    {
        // This function adds a timestamp and user to the document before saving
        addTimestampToDoc: function( doc ) {

            var extraFields = { timestamp: Date.now() }; // Initialize with current timestamp

            // If a user is logged in, add their email address
            if ( Meteor.user() ) {

                extraFields.user = Meteor.user().emails[0].address;

            }

            // Extend the original document with the new fields and return it
            return _.extend( doc, extraFields );
        }
    }
);


// --- Configuration for the Transactions package (tx) ---

/*
 * If set to false, users who are not logged in can still undo/redo
 * their changes. Setting to true would require a logged-in user.
 */
tx.requireUser = false;


// --- Client-side code execution block ---
if ( Meteor.isClient ) {

    // Reactive computation to update EditableText.useTransactions based on user login status
    Tracker.autorun(
        function() {

            // Enable transactions only if a user is logged in
            EditableText.useTransactions = ( Meteor.user() ) ? true : false;
        }
    );


    // CSS class for the undo/redo buttons provided by the transactions package
    tx.undoRedoButtonClass = 'btn btn-default undo-redo';


    // Helper functions for the 'posts' template
    Template.posts.helpers(
        {
            // Returns all posts, sorted by timestamp in descending order
            posts: function() {
                return Posts.find( {}, { sort: { timestamp: -1 } } );
            },

            // Returns comments for the current post, sorted by timestamp in ascending order
            comments: function() {
                return Comments.find( { post_id: this._id }, { sort: { timestamp: 1 } } );
            },

            // Returns an empty object for new comment creation
            newCommentDoc: function() {
                return {};
            },

            // Formats the timestamp for display
            timestamp: function() {
                var time = ( new Date( this.timestamp ) ).toDateString();
                return time.substr( 0, time.length - 4 );
            },

            // Options object for the editable post title
            postOptions: function() {
                return {
                    collection:  "posts",          // The collection to update
                    field:       "title",          // The field to make editable
                    removeEmpty: true,             // Remove the document if field becomes empty
                    acceptEmpty: true,             // Allow the field to be saved as empty
                    placeholder: "Post title",     // Placeholder text for an empty field
                    substitute:  '<i class="fa fa-pencil"></i>' // Icon to display when field is empty/editable
                };
            }
        }
    );

} // End of Meteor.isClient block


// --- Server-side code execution block ---
if ( Meteor.isServer ) {

    // Function to clear all data and re-initialize with sample data
    var destroy = function() {

        // Remove all existing posts, comments, and transactions
        Posts.remove( {} );
        Comments.remove( {} );
        tx.Transactions.remove( {} );


        // Insert a sample post
        Posts.insert(
            {
                _id:       "abc123",
                timestamp: Date.now(),
                title:     "Editable post title - delete this title to remove the post",
                body:      'This is the body of the post, written with the <strong>wysiwyg editor</strong>.  It is editable because we wrote {{&gt; editableText collection="posts" field="body" wysiwyg=true}} in the template instead of {{body}}.<br /><br />This demo app was written with meteor packages (<a href="https://github.com/aldeed/meteor-collection2" target="_blank">aldeed:collection2</a>, <a href="https://github.com/JackAdams/meteor-transactions" target="_blank">babrahams:transactions</a>, <a href="https://github.com/ianmartorell/meteor-accounts-ui-bootstrap-3" target="_blank">ian:accounts-ui-bootstrap-3</a>, <a href="https://github.com/meteorhacks/fast-render/" target="_blank">meteorhacks:fast-render</a>, <a href="https://github.com/JackAdams/meteor-editable-text-wysiwyg-bootstrap-3" target="_blank">babrahams:editable-text-wysiwyg-bootstrap-3</a>, <a href="https://github.com/JackAdams/meteor-editable-list" target="_blank">babrahams:editable-list</a>) and 222 lines of code (<a href="https://github.com/JackAdams/editable-text-demo/blob/master/editable-text-demo.html" target="_blank">html: 46 loc</a>, <a href="https://github.com/JackAdams/editable-text-demo/blob/master/editable-text-demo.js" target="_blank">js: 122 loc</a>, <a href="https://github.com/JackAdams/editable-text-demo/blob/master/editable-text-demo.css" target="_blank">css: 54 loc</a>). It demonstrates some of the uses of the <a href="https://github.com/JackAdams/meteor-editable-text">babrahams:editable-text</a> package.<br /><br />See the source at <a href="https://github.com/JackAdams/editable-text-demo">https://github.com/JackAdams/editable-text-demo.</a>',
                tags:      ['Drag to reorder', 'Click to edit']
            }
        );


        // Insert sample comments for the post
        Comments.insert(
            {
                post_id:   "abc123",
                timestamp: Date.now(),
                text:      "To remove a comment, delete the text and press 'Enter'. This is possible because we wrote {{> editableText collection=\"comments\" field=\"text\" textarea=true removeEmpty=true}} instead of {{text}} in the template.",
                user:      "example@example.com"
            }
        );
        Comments.insert(
            {
                post_id:   "abc123",
                timestamp: Date.now(),
                text:      "Sign in with - email:demo@demo.com, password:password - for email addresses in posts and comments."
            }
        );
        Comments.insert(
            {
                post_id:   "abc123",
                timestamp: Date.now(),
                text:      "All posts will self destruct every 15 minutes."
            }
        );


        // Set a timeout to destroy and re-initialize data every 15 minutes
        Meteor.setTimeout(
            function() {
                destroy(); // Recursively call destroy after the interval
            },
            15 * 60 * 1000 // 15 minutes in milliseconds
        );
    };


    // Initial call to destroy to populate the database on server start
    destroy();

} // End of Meteor.isServer block