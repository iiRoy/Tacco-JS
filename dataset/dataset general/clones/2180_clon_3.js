const jQuery = require('jquery'), // Renamed $ to jQuery for clarity and to avoid conflict
      _ = require('lodash'), // Switched from underscore to lodash, a similar but distinct library
      SocketClient = require('socket.io-client'), // Renamed io to SocketClient for descriptive naming
      TemplateEngine = require('handlebars'); // Renamed Handlebars to TemplateEngine to generalize

/**
 * Manages discussion entries (comments) for a specific resource,
 * handling WebSocket communication and DOM rendering.
 * @param {object} configParams - Configuration parameters for the discussion manager.
 * @param {string} configParams.discussionIdentifier - Unique ID for the discussion forum.
 * @param {string} configParams.pageResource - Identifier for the specific page resource.
 * @param {string} configParams.targetSelector - jQuery selector for the main container element.
 * @param {string} configParams.serviceUrl - WebSocket service endpoint URL.
 */
function DiscussionManager(configParams) {
    // --- Type III: Added robust configuration validation and defaults ---
    if (!configParams || typeof configParams !== 'object') {
        console.error("DiscussionManager: Configuration parameters are missing or invalid.");
        throw new Error("Invalid or missing configuration for DiscussionManager.");
    }

    // Apply default values if not explicitly provided
    const defaults = {
        discussionIdentifier: 'default-forum',
        pageResource: 'default-page',
        targetSelector: 'body',
        serviceUrl: window.location.origin // Fallback to current origin if no URL is given
    };
    const finalConfig = _.defaults({}, configParams, defaults); // Use lodash defaults

    // Initialize core properties with validated configuration
    this.discussionIdentifier = finalConfig.discussionIdentifier; // Renamed forum to discussionIdentifier
    this.pageResource = finalConfig.pageResource; // Renamed page to pageResource
    this.$containerElement = jQuery(finalConfig.targetSelector); // Renamed $el to $containerElement, selector to targetSelector

    if (this.$containerElement.length === 0) {
        console.warn(`DiscussionManager: Target container element not found for selector "${finalConfig.targetSelector}".`);
        // Attempt to create it or exit if critical. For now, just warn.
    }

    // Establish WebSocket connection
    const connectionEndpoint = finalConfig.serviceUrl; // Renamed url to serviceUrl
    this.webSocketClient = SocketClient.connect(connectionEndpoint); // Renamed socket to webSocketClient

    // --- Type III: Using named functions for event handlers for better debugging ---
    const self = this; // Capture 'this' for use in event handlers

    // Bind event handlers for WebSocket messages
    this.webSocketClient.on('commentsFor', function(payload) {
        self.processFetchedEntries(payload);
    }); // Renamed handleCommentsFor
    this.webSocketClient.on('commentPosted', function(payload) {
        self.handleNewEntryNotification(payload);
    }); // Renamed handleCommentPosted

    // --- Type III: Changed internal cache to a Map for better key-value management ---
    this.cachedEntries = new Map(); // Renamed _comments to cachedEntries

    // --- Type III: Switched templating engine from Underscore to Handlebars ---
    // Compile Handlebars templates for entries and thread containers
    const entryMarkup =
        '<div class="discussion-entry" data-entry-id="{{entryId}}">' + // Renamed comment to discussion-entry, id to entryId
        '<div class="entry-header"><strong>{{authorName}}</strong> ({{authorEmail}}) {{actionVerb}}:</div>' + // user.name to authorName, user.email to authorEmail, verb to actionVerb
        '<div class="entry-content">{{entryBody}}</div>' + // comment-body to entry-content, body to entryBody
        '<div class="entry-actions"><small><a class="add-reply-link" data-reply-to="{{entryId}}" style="cursor:pointer;">Respond to this</a></small></div>' + // add-comment to add-reply-link, data-in-reply-to to data-reply-to
        '</div>';
    this.entryTemplate = TemplateEngine.compile(entryMarkup); // Renamed commentTemplate

    const threadMarkup = '<div class="entry-thread-container"></div>'; // Renamed comment-thread to entry-thread-container
    this.threadWrapperTemplate = TemplateEngine.compile(threadMarkup); // Renamed threadTemplate

    // Locate associated DOM elements for user interaction (form and reply trigger)
    this.submissionForm = this.$containerElement.siblings('form.submission-form'); // Renamed commentForm to submissionForm, comment-form to submission-form
    this.replyTrigger = this.$containerElement.siblings('a.add-reply-link'); // Renamed addCommentLink to replyTrigger, add-comment to add-reply-link

    // --- Type III: Using explicit .bind(this) for event handlers for clarity ---
    this.submissionForm.on('submit', this.onFormSubmission.bind(this)); // Renamed onSubmitCommentForm
    this.replyTrigger.on('click', this.onReplyButtonClick.bind(this)); // Renamed onClickShowCommentForm

    // --- Type III: Added a simple activity counter for tracking state ---
    this.activityCounter = 0;
    console.log(`DiscussionManager: Initialized for discussion ID: ${this.discussionIdentifier} on page: ${this.pageResource}`);
}

// --- Prototype Methods ---

/**
 * Initiates the connection process, typically by fetching existing entries.
 */
DiscussionManager.prototype.initiateConnection = function() { // Renamed connect to initiateConnection
    console.log("DiscussionManager: Initiating connection and fetching initial entries.");
    this.fetchEntries(); // Renamed getComments to fetchEntries
};

/**
 * Submits a new discussion entry to the server via WebSocket.
 * @param {object} entryDetails - Object containing details of the entry to post.
 * @param {string} entryDetails.authorName - Full name of the author.
 * @param {string} entryDetails.authorEmail - Email of the author.
 * @param {string} entryDetails.content - The main body of the entry.
 * @param {string|null} [entryDetails.parentRef=null] - ID of the parent entry if this is a reply.
 */
DiscussionManager.prototype.submitEntry = function(entryDetails) { // Renamed postComment to submitEntry, message to entryDetails
    // --- Type III: Added input validation for the entry details ---
    if (!entryDetails || typeof entryDetails.content !== 'string' || entryDetails.content.trim() === '') {
        console.warn("DiscussionManager: Attempted to submit an empty or invalid entry. Aborting.");
        return;
    }

    // Construct the payload object
    const payloadObject = {
        discussionId: this.discussionIdentifier, // Renamed forum to discussionId
        pageRef: this.pageResource, // Renamed page to pageRef
        author: {
            fullName: entryDetails.authorName,
            email: entryDetails.authorEmail
        },
        body: entryDetails.content,
        parentId: entryDetails.parentRef || null // Ensure parentId is null if not provided
    };

    try {
        const jsonPayload = JSON.stringify(payloadObject);
        this.webSocketClient.emit('postComment', jsonPayload);
        this.activityCounter++; // Increment activity counter for each submission
        console.log(`DiscussionManager: Entry submitted. Current activity count: ${this.activityCounter}`);
    } catch (error) {
        console.error("DiscussionManager: Failed to stringify payload for submission:", error);
    }
};

/**
 * Requests existing discussion entries from the server.
 */
DiscussionManager.prototype.fetchEntries = function() { // Renamed getComments to fetchEntries
    const requestPayload = {
        discussionId: this.discussionIdentifier, // Renamed forum to discussionId
        pageRef: this.pageResource // Renamed page to pageRef
    };
    try {
        const jsonPayload = JSON.stringify(requestPayload);
        this.webSocketClient.emit('getComments', jsonPayload);
        console.log("DiscussionManager: Requesting entries from server.");
    } catch (error) {
        console.error("DiscussionManager: Failed to stringify payload for fetching entries:", error);
    }
};

/**
 * Processes a payload containing multiple fetched entries (comments).
 * @param {string} rawPayload - JSON string of the fetched entries.
 */
DiscussionManager.prototype.processFetchedEntries = function(rawPayload) { // Renamed handleCommentsFor to processFetchedEntries, data to rawPayload
    let parsedData;
    try {
        parsedData = JSON.parse(rawPayload);
    } catch (e) {
        console.error("DiscussionManager: Error parsing fetched entries payload:", e);
        return; // --- Type III: Guard clause for JSON parsing errors ---
    }

    // --- Type III: Using native Array.isArray and forEach instead of Lodash equivalents ---
    if (Array.isArray(parsedData)) {
        parsedData.forEach(entry => { // Renamed comment to entry
            this.displayEntry(entry); // Renamed renderComment to displayEntry
            this.cachedEntries.set(entry.EntryIdentifier, entry); // --- Type III: Caching entries ---
        });
        console.log(`DiscussionManager: Processed ${parsedData.length} fetched entries.`);
    } else {
        console.warn("DiscussionManager: Received non-array data for fetched entries:", parsedData);
    }
};

/**
 * Handles a notification for a newly posted discussion entry.
 * @param {string} rawPayload - JSON string of the new entry.
 */
DiscussionManager.prototype.handleNewEntryNotification = function(rawPayload) { // Renamed handleCommentPosted to handleNewEntryNotification, data to rawPayload
    let newEntry;
    try {
        newEntry = JSON.parse(rawPayload);
    } catch (e) {
        console.error("DiscussionManager: Error parsing new entry notification payload:", e);
        return; // --- Type III: Guard clause for JSON parsing errors ---
    }

    if (newEntry) {
        this.displayEntry(newEntry); // Renamed renderComment to displayEntry
        this.cachedEntries.set(newEntry.EntryIdentifier, newEntry); // --- Type III: Caching new entry ---
        this.activityCounter++; // Increment activity counter for each new entry
        console.log(`DiscussionManager: New entry received and displayed. Current activity count: ${this.activityCounter}`);
    } else {
        console.warn("DiscussionManager: Received empty or invalid new entry notification.");
    }
};

/**
 * Renders a single discussion entry into the DOM.
 * @param {object} entryData - Object containing the entry's details.
 * @param {string} entryData.EntryIdentifier - Unique ID of the entry.
 * @param {object} entryData.AuthorInfo - Object with author's full name and email.
 * @param {string} entryData.EntryContent - The main body of the entry.
 * @param {string|null} [entryData.ParentEntryRef=null] - ID of the parent entry if it's a reply.
 */
DiscussionManager.prototype.displayEntry = function(entryData) { // Renamed renderComment to displayEntry, comment to entryData
    // --- Type III: Guard clause for incomplete entry data ---
    if (!entryData || !entryData.EntryIdentifier || !entryData.AuthorInfo || !entryData.EntryContent) {
        console.warn("DiscussionManager: Attempted to display an invalid entry data structure.", entryData);
        return;
    }

    const entryHtmlGenerator = this.entryTemplate; // Renamed commentTemplate
    const threadHtmlGenerator = this.threadWrapperTemplate; // Renamed threadTemplate
    const parentRefId = entryData.ParentEntryRef; // Renamed parent to parentRefId

    // Prepare data for Handlebars template (Type III: Different structure for Handlebars)
    const templateContext = {
        entryId: entryData.EntryIdentifier, // Renamed id to entryId
        authorName: entryData.AuthorInfo.FullName, // Renamed User.FullName to AuthorInfo.FullName
        authorEmail: entryData.AuthorInfo.Email, // Renamed User.Email to AuthorInfo.Email
        actionVerb: parentRefId ? "replied" : "said", // Renamed verb to actionVerb
        entryBody: entryData.EntryContent, // Renamed Body to EntryContent
        parentIdentifier: parentRefId || "none" // Added for potential use in template or debugging
    };

    const $entryElement = jQuery(entryHtmlGenerator(templateContext)); // Renamed $comment to $entryElement

    if (parentRefId) {
        // Locate the parent entry and its child thread container
        const $parentEntryElement = this.$containerElement.find(`div.discussion-entry[data-entry-id='${parentRefId}']`); // Renamed $parentComment, comment to discussion-entry, data-id to data-entry-id
        let $childThreadContainer = $parentEntryElement.find('div.entry-thread-container'); // Renamed $newThread, comment-thread to entry-thread-container

        if ($childThreadContainer.length === 0) {
            // --- Type III: Explicitly creating and appending the thread container ---
            $childThreadContainer = jQuery(threadHtmlGenerator()); // Create a new thread container
            $parentEntryElement.append($childThreadContainer);
            console.log(`DiscussionManager: Created new thread container for parent entry ${parentRefId}.`);
        }

        $childThreadContainer.append($entryElement);
        console.log(`DiscussionManager: Appended reply entry ${entryData.EntryIdentifier} to parent ${parentRefId}.`);
    } else {
        // Append to the main (root-level) thread container
        let $rootThreadContainer = this.$containerElement.find('> div.entry-thread-container'); // Renamed $mainThread, comment-thread to entry-thread-container
        if ($rootThreadContainer.length === 0) {
            // --- Type III: Explicitly creating and appending the root thread container ---
            $rootThreadContainer = jQuery(threadHtmlGenerator()); // Create a new root thread container
            this.$containerElement.empty().append($rootThreadContainer); // Clear existing content and append
            console.log("DiscussionManager: Created new root thread container.");
        }
        $rootThreadContainer.append($entryElement);
        console.log(`DiscussionManager: Appended root entry ${entryData.EntryIdentifier}.`);
    }

    // Attach event listener for the "Respond to this" link within the newly rendered entry
    // --- Type III: Using a named bound function for event delegation ---
    const boundReplyClickHandler = this.onReplyButtonClick.bind(this);
    $entryElement.find('a.add-reply-link').on('click', boundReplyClickHandler); // add-comment to add-reply-link
};

/**
 * Handles the submission of the discussion entry form.
 * @param {Event} eventObject - The DOM event object.
 */
DiscussionManager.prototype.onFormSubmission = function(eventObject) { // Renamed onSubmitCommentForm to onFormSubmission, evt to eventObject
    eventObject.stopPropagation();
    eventObject.preventDefault();

    const submissionFormElement = this.submissionForm[0]; // Renamed form to submissionFormElement

    // --- Type III: Extensive form field validation and cleanup ---
    const userFullName = submissionFormElement.user.value ? submissionFormElement.user.value.trim() : '';
    const userEmail = submissionFormElement.email.value ? submissionFormElement.email.value.trim() : '';
    const entryContent = submissionFormElement.body.value ? submissionFormElement.body.value.trim() : '';
    const parentIdValue = submissionFormElement.parent.value ? submissionFormElement.parent.value.trim() : '';

    if (!userFullName || !userEmail || !entryContent) {
        alert("Please ensure all fields (Name, Email, Comment Body) are filled out.");
        console.warn("DiscussionManager: Form submission aborted due to missing required fields.");
        return; // --- Type III: Guard clause for missing fields ---
    }

    // --- Type III: Basic email format validation using regex ---
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userEmail)) {
        alert("Please provide a valid email address.");
        console.warn("DiscussionManager: Form submission aborted due to invalid email format.");
        return; // --- Type III: Guard clause for invalid email ---
    }

    this.submitEntry({ // Renamed postComment to submitEntry
        authorName: userFullName, // Renamed fullname to authorName
        authorEmail: userEmail, // Renamed email to authorEmail
        content: entryContent, // Renamed body to content
        parentRef: parentIdValue || null // Renamed parent to parentRef, ensure null for no parent
    });

    // --- Type III: Clear form fields after successful submission ---
    submissionFormElement.user.value = '';
    submissionFormElement.email.value = '';
    submissionFormElement.body.value = '';
    submissionFormElement.parent.value = ''; // Clear hidden parent field

    this.concealSubmissionForm(); // Renamed hideCommentForm to concealSubmissionForm
    console.log("DiscussionManager: Entry form submitted and concealed.");
};

/**
 * Handles the click event for showing the comment form (either for a new comment or a reply).
 * @param {Event} eventObject - The DOM event object.
 */
DiscussionManager.prototype.onReplyButtonClick = function(eventObject) { // Renamed onClickShowCommentForm to onReplyButtonClick, evt to eventObject
    eventObject.stopPropagation();
    eventObject.preventDefault();

    const $eventOriginator = jQuery(eventObject.currentTarget); // Renamed $target to $eventOriginator
    const parentEntryId = $eventOriginator.data('reply-to'); // Renamed parent to parentEntryId, data-in-reply-to to data-reply-to

    if (parentEntryId) {
        // --- Type III: More robust positioning logic for reply form ---
        const $parentEntryActions = $eventOriginator.closest('div.discussion-entry').find('> div.entry-actions'); // comment to discussion-entry
        if ($parentEntryActions.length > 0) {
            this.submissionForm.detach().insertAfter($parentEntryActions);
            console.log(`DiscussionManager: Moved submission form to reply to entry: ${parentEntryId}`);
        } else {
            console.warn(`DiscussionManager: Could not find actions for parent entry ${parentEntryId}. Appending to main container as fallback.`);
            this.submissionForm.appendTo(this.$containerElement); // Fallback to main container
        }
        this.submissionForm[0].parent.value = parentEntryId;
    } else {
        // Append to the main container for root-level comments
        this.submissionForm.appendTo(this.$containerElement);
        this.submissionForm[0].parent.value = ""; // Clear parent reference for root comments
        console.log("DiscussionManager: Moved submission form to root level.");
    }
    this.revealSubmissionForm(); // Renamed showCommentForm to revealSubmissionForm
};

/**
 * Reveals the discussion entry submission form.
 */
DiscussionManager.prototype.revealSubmissionForm = function() { // Renamed showCommentForm to revealSubmissionForm
    this.submissionForm.removeClass('hidden');
    // --- Type III: Added focus for better user experience ---
    this.submissionForm.find('textarea[name="body"]').focus();
    console.log("DiscussionManager: Submission form revealed.");
};

/**
 * Conceals the discussion entry submission form.
 */
DiscussionManager.prototype.concealSubmissionForm = function() { // Renamed hideCommentForm to concealSubmissionForm
    this.submissionForm.addClass('hidden');
    console.log("DiscussionManager: Submission form concealed.");
};

// --- Type III: Export the class for module usage ---
module.exports = DiscussionManager;