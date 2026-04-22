var jq = require('jquery'),
    util = require('underscore'),
    comm = require('socket.io-client'),
    tplEngine = require('handlebars');

/**
 * Manages discussion threads and message posting.
 * @param {object} config - Configuration settings for the discussion manager.
 */
var DiscussionManager = function(config) {
    // Initialize core properties from the provided configuration
    this.discussionTopic = config.discussionTopic;
    this.currentView = config.currentView;
    this.containerElement = jq(config.displaySelector);

    // Establish WebSocket connection to the server endpoint
    var wsConnection = this.webSocketConnection = comm.connect(config.serverUrl);

    // Set up event listeners for incoming messages from the server
    this.webSocketConnection.on('receivedMessages', util.bind(this.processIncomingMessages, this));
    this.webSocketConnection.on('messageBroadcast', util.bind(this.processNewMessage, this));

    // Internal cache for messages, though not actively used in this version for rendering
    this._messageCache = {};

    // Template for rendering individual message entries
    this.messageDisplayTemplate = util.template(
        "<div class='post-entry' data-identity='<%= uniqueId %>'>" +
        "<div class='post-header'><strong><%= senderInfo.displayName %></strong> (<%= senderInfo.contactAddress %>) <%= actionWord %>:</div>" +
        "<div class='post-body'><%= contentBody %></div>" +
        "<div class='post-actions'><small><a class='reply-action' data-responding-to='<%= uniqueId %>' style='cursor: pointer;'>Respond to this</a></small></div>" +
        "</div>"
    );

    // Template for rendering a block of conversation entries
    this.conversationBlockTemplate = util.template("<div class='post-conversation'></div>");

    // Locate related DOM elements for message input and reply actions
    this.messageInputForm = this.containerElement.siblings('form.message-form');
    this.replyActionLink = this.containerElement.siblings('a.reply-action');

    // Attach event handlers to the form and action links
    this.messageInputForm.on('submit', util.bind(this.onFormSubmission, this));
    this.replyActionLink.on('click', util.bind(this.onReplyClick, this));
};

// Define methods on the prototype for efficient memory usage
DiscussionManager.prototype.initiateConnection = function() {
    // Request initial set of messages upon connection
    this.requestMessages();
};

DiscussionManager.prototype.publishMessage = function(inputMessage) {
    // Emit a message to the server, including context information
    this.webSocketConnection.emit('publishMessage', JSON.stringify(util.extend({
        discussionTopic: this.discussionTopic,
        currentView: this.currentView
    }, inputMessage)));
};

DiscussionManager.prototype.requestMessages = function() {
    // Request messages for the current topic and view from the server
    this.webSocketConnection.emit('requestMessages', JSON.stringify({
        discussionTopic: this.discussionTopic,
        currentView: this.currentView
    }));
};

DiscussionManager.prototype.processIncomingMessages = function(payload) {
    var instanceRef = this; // Capture 'this' for use in inner functions
    var parsedData = JSON.parse(payload);
    // Check if the payload is an array of messages
    if (util.isArray(parsedData)) {
        util.each(parsedData, function(postEntry) {
            instanceRef.displayMessage(postEntry);
        });
    }
};

DiscussionManager.prototype.processNewMessage = function(payload) {
    var postEntry = JSON.parse(payload);

    // If a valid message object is received, render it
    if (postEntry) {
        this.displayMessage(postEntry);
    }
};

DiscussionManager.prototype.displayMessage = function(postEntry) {
    var messageDisplayTemplate = this.messageDisplayTemplate,
        conversationBlockTemplate = this.conversationBlockTemplate,
        parentPostId = postEntry.ParentRef, // ID of the parent message
        newPostElement = jq(messageDisplayTemplate({
            senderInfo: {
                displayName: postEntry.Author.FullName,
                contactAddress: postEntry.Author.Email
            },
            actionWord: postEntry.ParentRef ? "responded" : "stated",
            contentBody: postEntry.Content,
            uniqueId: postEntry.PostId,
            parentRefId: postEntry.ParentRef || "" // Use empty string if no parent
        }));

    // Determine where to insert the new message based on its parent
    if (parentPostId) {
        var parentPostElement = this.containerElement.find("div.post-entry[data-identity='" + parentPostId + "']"),
            newThreadContainer = parentPostElement.find('div.post-conversation');

        // Create a new thread container if it doesn't exist
        if (newThreadContainer.length === 0) {
            newThreadContainer = jq('<div class="post-conversation">');
            parentPostElement.append(newThreadContainer);
        }

        // Append the new message to the appropriate thread container
        newThreadContainer.append(newPostElement);
    } else {
        // For top-level messages, append to the main conversation thread
        var mainThreadContainer = this.containerElement.find('> div.post-conversation');
        if (mainThreadContainer.length === 0) {
            mainThreadContainer = jq(conversationBlockTemplate());
            this.containerElement.empty().append(mainThreadContainer);
        }
        mainThreadContainer.append(newPostElement);
    }
    // Attach click handler for reply action on the newly rendered message
    newPostElement.find('a.reply-action').on('click', util.bind(this.onReplyClick, this));
};

DiscussionManager.prototype.onFormSubmission = function(eventObject) {
    // Prevent default form submission and event bubbling
    eventObject.stopPropagation();
    eventObject.preventDefault();

    var inputForm = this.messageInputForm[0]; // Access the native DOM form element

    // Publish the message using values from the form fields
    this.publishMessage({
        senderName: inputForm.user.value,
        email: inputForm.email.value,
        body: inputForm.body.value,
        parent: inputForm.parent.value
    });

    // Hide the form after submission
    this.messageInputForm.addClass('hidden');
};

DiscussionManager.prototype.onReplyClick = function(eventObject) {
    // Halt event propagation and default behavior
    eventObject.stopPropagation();
    eventObject.preventDefault();

    var clickedElement = jq(eventObject.currentTarget),
        parentRef = clickedElement.data('responding-to');

    // Position the form depending on whether it's a reply or a new top-level message
    if (parentRef) {
        this.messageInputForm.detach(); // Remove from current position
        this.messageInputForm.insertAfter(clickedElement.closest('div.post-entry').find('> div.post-actions'));
        this.messageInputForm[0].parent.value = parentRef; // Set parent ID in hidden field
    } else {
        this.messageInputForm.appendTo(this.containerElement); // Append to main container
        this.messageInputForm[0].parent.value = ""; // Clear parent ID for top-level
    }
    this.revealInputForm(); // Make the form visible
};

DiscussionManager.prototype.revealInputForm = function() {
    this.messageInputForm.removeClass('hidden');
    // Optional: Clear form fields here if desired
    // this.messageInputForm.find('input, textarea').val('');
};

DiscussionManager.prototype.concealInputForm = function() {
    this.messageInputForm.addClass('hidden');
};