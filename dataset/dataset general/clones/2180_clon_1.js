/*
 *  This section handles the loading of external JavaScript modules.
 *  It uses Node.js 'require' syntax for module importation.
 */
var $          =  require ( 'jquery' ) ; // jQuery library for DOM manipulation.
var _          =  require ( 'underscore' ) ; // Underscore.js for utility functions.

var io         =  require ( 'socket.io-client' ) ; // Socket.IO client for real-time communication.

var Handlebars =  require ( 'handlebars' ) ; // Handlebars.js for templating (though _.template is used later, this might be a leftover or for future use).


/*
 *  The main Kaiju application constructor function.
 *  Initializes the application with provided options.
 */
var Kaiju = function (  options  )
{
    // Store the forum identifier from the options.
    this.forum = options.forum ;


    // Store the current page identifier.
    this.page = options.page ;


    // Select the main HTML element using jQuery and store it.
    this.$el = $ (  options.selector  ) ;


    // Establish a Socket.IO connection to the specified URL.
    var socket = this.socket = io.connect (  options.url  ) ;


    // Set up event listeners for Socket.IO messages.
    // When 'commentsFor' event is received, call handleCommentsFor method, binding 'this' context.
    this.socket.on (  'commentsFor'  ,  _.bind (  this.handleCommentsFor  ,  this  )  ) ;
    // When 'commentPosted' event is received, call handleCommentPosted method, binding 'this' context.
    this.socket.on (  'commentPosted'  ,  _.bind (  this.handleCommentPosted  ,  this  )  ) ;


    // Initialize an empty object to hold comments, indexed by ID perhaps.
    this._comments = {  } ;


    // Define the template for rendering a single comment.
    // This uses Underscore's templating utility.
    this.commentTemplate = _.template (
        '<div class="comment" data-id="<%= id %>">'
      + '<div class="comment-header"><strong><%= user.name %></strong> (<%= user.email %>) <%= verb %>:</div>'
      + '<div class="comment-body"><%= body %></div>'
      + '<div class="comment-actions"><small><a class="add-comment" data-in-reply-to="<%= id %>" style="cursor:pointer;">Reply to this</a></small></div>'
      + '</div>'
    ) ; // End of commentTemplate definition.


    // Define the template for a comment thread container.
    this.threadTemplate = _.template (  '<div class="comment-thread"></div>'  ) ;


    // Locate the comment form element, assumed to be a sibling of the main element.
    this.commentForm = this.$el.siblings (  'form.comment-form'  ) ;

    // Locate the 'add comment' link element, also a sibling.
    this.addCommentLink = this.$el.siblings (  'a.add-comment'  ) ;


    // Attach event handlers for the form and link.
    // On form submission, call onSubmitCommentForm.
    this.commentForm.on (  'submit'  ,  _.bind (  this.onSubmitCommentForm  ,  this  )  ) ;
    // On click of 'add comment' link, call onClickShowCommentForm.
    this.addCommentLink.on (  'click'  ,  _.bind (  this.onClickShowCommentForm  ,  this  )  ) ;
};


// Define prototype methods for the Kaiju application.

/*
 *  Initiates the connection process for comments.
 *  Primarily, it requests existing comments from the server.
 */
Kaiju.prototype.connect = function (  )
{
        this.getComments (  ) ; // Request comments from the server.
};


/*
 *  Sends a new comment message to the server via Socket.IO.
 *  The message is extended with forum and page context before sending.
 */
Kaiju.prototype.postComment = function (  message  )
{
    // Emit 'postComment' event with a JSON stringified message.
    this.socket.emit (  'postComment'  ,  JSON.stringify (  _.extend (
        {
            forum : this.forum , // Current forum ID.
            page  : this.page    // Current page ID.
        } ,
        message                   // The actual comment message.
    )  )  ) ;
};


/*
 *  Requests comments for the current forum and page from the server.
 */
Kaiju.prototype.getComments = function (  )
{
    // Emit 'getComments' event with a JSON stringified object containing forum and page details.
    this.socket.emit (  'getComments'  ,  JSON.stringify (
        {
            forum : this.forum , // Forum context.
            page  : this.page    // Page context.
        }
    )  ) ;
};


/*
 *  Handles incoming 'commentsFor' data from the server.
 *  Parses the data and renders each comment if it's an array.
 */
Kaiju.prototype.handleCommentsFor = function (  data  )
{
    var self = this ; // Keep a reference to 'this' for use in the callback.

    data = JSON.parse (  data  ) ; // Parse the incoming JSON string.


    // Check if the parsed data is an array of comments.
    if (  _.isArray (  data  )  )
    {
        // Iterate over each comment in the array.
        _.each (  data  ,  function (  comment  )
        {
            self.renderComment (  comment  ) ; // Render each individual comment.
        }  ) ;
    }
};


/*
 *  Handles a single 'commentPosted' event from the server.
 *  Parses the comment data and renders it.
 */
Kaiju.prototype.handleCommentPosted = function (  data  )
{
    // Parse the JSON string into a comment object.
    var comment = JSON.parse (  data  ) ;


    // If a valid comment object was received, render it.
    if (  comment  )
    {
        this.renderComment (  comment  ) ;
    }
};


/*
 *  Renders a comment onto the page.
 *  Handles both top-level comments and replies (threaded comments).
 */
Kaiju.prototype.renderComment = function (  comment  )
{
    var commentTemplate = this.commentTemplate ; // Get the comment rendering template.
    var threadTemplate  = this.threadTemplate ;  // Get the thread container template.


    var parent = comment.Parent ; // Check if this comment is a reply to another comment.


    // Generate the jQuery object for the new comment using the template.
    var $comment = $ (  commentTemplate (
        {
            user :
            {
                name  : comment.User.FullName , // User's full name.
                email : comment.User.Email      // User's email.
            } ,
            verb : parent ? "replied" : "said" , // Verb changes based on whether it's a reply.
            body : comment.Body ,               // The actual content of the comment.
            id   : comment.Id ,                 // Unique ID of the comment.
            parentId : comment.Parent || "null" // Parent ID, or "null" if it's a top-level comment.
        }
    )  ) ;


    // --- Logic for appending comments ---
    // If the comment has a parent, it's a reply.
    if (  parent  )
    {
        // Find the parent comment's DOM element.
        var $parentComment = this.$el.find (  "div.comment[data-id='" + parent + "']"  ) ;
        // Look for an existing comment thread container within the parent.
        var $newThread     = $parentComment.find (  'div.comment-thread'  ) ;


        // If no thread container exists, create one and append it to the parent.
        if (  $newThread.length === 0  )
        {
            $newThread = $ (  '<div class="comment-thread">'  ) ; // Create new thread div.
            $parentComment.append (  $newThread  ) ;              // Append to parent comment.
        }

        // Append the new comment to the appropriate thread container.
        $newThread.append (  $comment  ) ;
    }
    // If there is no parent, it's a top-level comment.
    else
    {
        // Find the main comment thread container.
        var $mainThread = this.$el.find (  '> div.comment-thread'  ) ;

        // If the main thread container doesn't exist, create it and clear/append to the main element.
        if (  $mainThread.length === 0  )
        {
            $mainThread = $ (  threadTemplate (  )  ) ; // Create new main thread div.
            this.$el.empty (  ) .append (  $mainThread  ) ; // Clear main element and append.
        }

        // Append the new top-level comment to the main thread.
        $mainThread.append (  $comment  ) ;
    }


    // Attach a click handler to the 'Reply to this' link within the newly rendered comment.
    $comment.find (  'a.add-comment'  ) .on (  'click'  ,  _.bind (  this.onClickShowCommentForm  ,  this  )  ) ;
};


/*
 *  Handles the submission of the comment form.
 *  Prevents default form submission, posts the comment, and hides the form.
 */
Kaiju.prototype.onSubmitCommentForm = function (  evt  )
{
    evt.stopPropagation (  ) ; // Stop event propagation.
    evt.preventDefault (  ) ;  // Prevent default form submission behavior.


    var form = this.commentForm [  0  ] ; // Get the native DOM element of the form.


    // Post the comment with data from the form fields.
    this.postComment (
        {
            fullname : form.user.value ,    // User's full name.
            email    : form.email.value ,   // User's email.
            body     : form.body.value ,    // Comment body text.
            parent   : form.parent.value    // Parent comment ID (if it's a reply).
        }
    ) ;


    this.commentForm.addClass (  'hidden'  ) ; // Hide the comment form after submission.
};


/*
 *  Handles the click event for showing the comment form.
 *  Positions the form correctly (for replies or new comments) and displays it.
 */
Kaiju.prototype.onClickShowCommentForm = function (  evt  )
{
    evt.stopPropagation (  ) ; // Prevent event bubbling.
    evt.preventDefault (  ) ;  // Prevent default link behavior.


    var $target = $ (  evt.currentTarget  ) ; // The element that was clicked.
    var parent  = $target.data (  'in-reply-to'  ) ; // Get the parent ID from data attribute.


    // If a parent ID exists, this is a reply.
    if (  parent  )
    {
        this.commentForm.detach (  ) ; // Remove the form from its current position in the DOM.
        this.commentForm.insertAfter (  $target.closest (  'div.comment'  ) .find (  '> div.comment-actions'  )  ) ; // Insert form after parent comment's actions.
        this.commentForm [  0  ] .parent.value = parent ; // Set the hidden parent ID field in the form.
    }
    // Otherwise, it's a new top-level comment.
    else
    {
        this.commentForm.appendTo (  this.$el  ) ; // Append the form to the main Kaiju element.
        this.commentForm [  0  ] .parent.value = "" ; // Clear the parent ID field.
    }

    this.showCommentForm (  ) ; // Finally, display the comment form.
};


/*
 *  Makes the comment form visible.
 *  Removes the 'hidden' class.
 *  (Optional: could clear form fields here, but commented out in original.)
 */
Kaiju.prototype.showCommentForm = function (  )
{
    this.commentForm.removeClass (  'hidden'  ) ; // Remove the 'hidden' class to show the form.
    // this.commentForm.find('input, textarea').val(''); // Original comment - can be kept or removed.
};


/*
 *  Hides the comment form.
 *  Adds the 'hidden' class.
 */
Kaiju.prototype.hideCommentForm = function (  )
{
    this.commentForm.addClass (  'hidden'  ) ; // Add the 'hidden' class to hide the form.
};