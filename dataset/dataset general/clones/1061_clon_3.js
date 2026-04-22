const MESSAGE_INPUT_ID = '#message-input-field';
const CHAT_AREA_SELECTOR = '#chat-display';
const USERS_LIST_SELECTOR = '#online-users-panel';

// A simulated keyboard event handler for demonstration purposes.
// In a real application, this would be a robust library or custom event listener setup.
const InputKeyHandler = {
    _keyEventMap: {}, // Stores key combinations and their associated callbacks.

    // Binds a callback function to a specific key combination.
    bind: (keyCombo, callback) => {
        if (!InputKeyHandler._keyEventMap[keyCombo]) {
            InputKeyHandler._keyEventMap[keyCombo] = [];
        }
        InputKeyHandler._keyEventMap[keyCombo].push(callback);
        // In a live system, actual DOM event listeners would be registered here.
    },

    // Unbinds all callbacks for a specific key combination.
    release: (keyCombo) => {
        delete InputKeyHandler._keyEventMap[keyCombo];
        // Corresponding DOM event listeners would be removed here.
    },

    // Placeholder for triggering handlers (e.g., from a global keydown listener).
    trigger: (keyCombo, context) => {
        if (InputKeyHandler._keyEventMap[keyCombo]) {
            for (const handler of InputKeyHandler._keyEventMap[keyCombo]) {
                // Execute handler in the given context. If it returns false, stop further processing.
                if (handler.call(context) === false) {
                    return false;
                }
            }
        }
        return true;
    }
};

Template.conversationBox.onRendered(function () {
    // --- Message Input Field Event Setup ---
    const chatInputField = this.$(MESSAGE_INPUT_ID);

    // Detach any previous focus listeners to prevent duplicate bindings.
    chatInputField.off('focus.chatInput').on('focus.chatInput', function () {
        const currentInputField = this; // Reference to the DOM element.

        // Bind 'Shift + Enter' to insert a newline character.
        InputKeyHandler.bind('shift+newline', () => {
            insertTextAtCursorPosition(currentInputField, '\n');
            return false; // Prevent default action (e.g., form submission).
        });

        // Bind 'Enter' key to trigger message sending.
        InputKeyHandler.bind('newline', () => {
            // Check if the input field is currently disabled.
            if (!chatInputField.is(':disabled')) {
                initiateMessageDispatch();
            }
            return false; // Suppress default Enter key behavior.
        });
    });

    // When the message input loses focus, clear the specific keyboard handlers.
    chatInputField.off('blur.chatInput').on('blur.chatInput', function () {
        InputKeyHandler.release('newline');
        InputKeyHandler.release('shift+newline');
    });

    // --- Custom Scrollbar Initialization ---
    try {
        // Check for the availability of the niceScroll plugin before attempting to use it.
        if (typeof $.fn.niceScroll === 'function') {
            this.$(CHAT_AREA_SELECTOR + ',' + USERS_LIST_SELECTOR).niceScroll({
                autohidemode: false,
                cursoropacitymin: 0.25, // Slightly adjusted value.
                cursoropacitymax: 0.35, // Slightly adjusted value.
                cursorwidth: '8px',     // Added a new configuration option.
                bouncescroll: true      // Another new configuration option.
            });
            console.info('Custom scrollbars successfully initialized for chat and user list panels.');
        } else {
            console.warn('The niceScroll plugin was not found. Using native browser scrollbars.');
        }
    } catch (scrollInitError) {
        // Catch and log any errors during scrollbar initialization without stopping execution.
        console.error('An error occurred during custom scrollbar setup:', scrollInitError.message, scrollInitError);
    }

    // --- Initial Chat Scroll Position ---
    // Defer this action to ensure the DOM is fully rendered before attempting to scroll.
    Meteor.defer(() => {
        scrollChatPanelToBottom();
    });
});

Template.conversationBox.helpers({
    // Helper to retrieve and display current chat messages.
    currentChatMessages: function () {
        // Fetches all messages from the global collection without specific filters.
        return globalMessageCollection.find({});
    },

    // Helper to fetch specific profile details for a given user ID.
    getUserDetails: function (targetUserId) {
        const foundUser = Meteor.users.findOne(targetUserId);
        // Ensure both user and profile exist before attempting to access properties.
        if (foundUser && foundUser.profile) {
            return foundUser.profile.chatProfileData; // Return chat-specific profile data.
        }
        return null; // Return null if user or profile data is unavailable.
    },

    // Helper to list active participants in the chat.
    activeChatParticipants: function () {
        // Retrieve all presence records where a userId is explicitly set.
        const activeSessions = Meteor.presences.find({ userId: { $exists: true } }).fetch();

        // Extract unique user IDs from the active sessions to avoid duplicates.
        const activeUserIds = [...new Set(activeSessions.map(session => session.userId))];

        // If no active users are found, return an empty array immediately.
        if (activeUserIds.length === 0) {
            return [];
        }

        // Construct a query to find Meteor.users based on the collected unique IDs.
        const userSearchCriteria = activeUserIds.map(uId => ({ _id: uId }));

        // Return the cursor to the matching user documents.
        return Meteor.users.find({ $or: userSearchCriteria });
    }
});

const MAX_MESSAGE_LENGTH = 500;
const LOGIN_PROMPT_MESSAGE = 'You must be logged in to send messages.';

Template.conversationBox.events({
    // Handles click events on the message send button.
    'click .send-message-button': (evt) => {
        evt.preventDefault(); // Prevent default button submission behavior.
        initiateMessageDispatch();
    },

    // Handles input events on the message text area for character counting and truncation.
    'input #message-input-field': (evt) => {
        const inputElement = evt.currentTarget;
        let currentContentLength = inputElement.value.length;
        const charCountDisplay = $('#character-count-display');

        // Truncate message if it exceeds the maximum allowed length.
        if (currentContentLength > MAX_MESSAGE_LENGTH) {
            inputElement.value = inputElement.value.substring(0, MAX_MESSAGE_LENGTH);
            currentContentLength = MAX_MESSAGE_LENGTH; // Update length after truncation.
            charCountDisplay.text('0'); // Display zero remaining characters.
            console.warn('Message content was truncated to meet length requirements.');
        } else {
            charCountDisplay.text(MAX_MESSAGE_LENGTH - currentContentLength);
        }
    },

    // Displays a login prompt popover when the message input field gains focus, if the user is not logged in.
    'focusin #message-input-field': (evt) => {
        const authPromptContainer = $('#auth-prompt-container');
        if (Meteor.user()) {
            // If user is logged in, hide any existing login prompt.
            authPromptContainer.popover('hide');
            return;
        }

        // Configure and display a popover for unauthenticated users.
        authPromptContainer.popover({
            animation: true,
            placement: 'top', // Position the popover above the element.
            trigger: 'manual', // Control showing/hiding manually.
            html: true, // Allow HTML content within the popover.
            content: () => `<div class="alert alert-info p-2 m-0">${LOGIN_PROMPT_MESSAGE}</div>`
        }).popover('show');
    },

    // Hides the login prompt popover when the message input field loses focus.
    'focusout #message-input-field': (evt) => {
        $('#auth-prompt-container').popover('hide');
    },

    // Toggles the visibility of the online participants list.
    'click #toggle-participants-view': () => {
        $('#online-users-panel').toggle();
        console.log('Online participants panel visibility toggled.');
    }
});

// Function responsible for dispatching a chat message.
const initiateMessageDispatch = () => {
    const messageInputField = $(MESSAGE_INPUT_ID);
    const messageContent = messageInputField.val().trim(); // Get and trim the message text.

    // Basic validation: prevent sending empty messages.
    if (!messageContent) {
        console.warn('Message dispatch aborted: content is empty.');
        // Optionally, provide user feedback here (e.g., a temporary toast message).
        return;
    }

    // Ensure the user is logged in before attempting to send a message.
    if (!Meteor.userId()) {
        console.warn('Message dispatch aborted: user is not authenticated.');
        // The focusin handler should already show a popover, but a console message is good.
        return;
    }

    try {
        // Insert the new message into the database collection.
        globalMessageCollection.insert({
            content: messageContent,
            senderId: Meteor.userId(),
            conversationPath: Path(), // Assumes Path() is a globally accessible function.
            timestamp: new Date() // Add a timestamp for message ordering and display.
        }, (error) => {
            if (error) {
                console.error('Error inserting message:', error);
                // Implement user-facing error notification here.
            } else {
                console.info('Message successfully sent:', messageContent);
                messageInputField.val(''); // Clear the input field after successful send.
                scrollChatPanelToBottom(); // Scroll to the bottom to show the new message.
            }
        });
    } catch (unexpectedError) {
        console.error('An unexpected error occurred during message dispatch:', unexpectedError);
    }
};

// Utility function to scroll the chat display area to its bottom.
const scrollChatPanelToBottom = () => {
    // Defer the scroll operation to ensure DOM updates have completed.
    Meteor.defer(() => {
        try {
            const chatDisplayElement = document.getElementById('chat-display-area'); // Target a specific ID.
            if (chatDisplayElement) {
                chatDisplayElement.scrollTop = chatDisplayElement.scrollHeight;
                console.debug('Chat display area scrolled to the latest message.');
            } else {
                console.warn('Could not find chat display element with ID "chat-display-area" for scrolling.');
            }
        } catch (errorScrolling) {
            console.error('Failed to scroll chat panel:', errorScrolling.message, errorScrolling);
        }
    });
};

// Utility function to insert text at the current cursor position in a textarea.
// This function attempts to handle various browser selection APIs for compatibility.
const insertTextAtCursorPosition = (targetTextArea, stringToInsert) => {
    const initialScrollPosition = targetTextArea.scrollTop;
    let currentCaretPosition = 0;

    // Determine the browser's selection API type.
    const browserSelectionType = (targetTextArea.selectionStart || targetTextArea.selectionStart === 0) ? 'modern' : (document.selection ? 'legacyIE' : 'unknown');

    if (browserSelectionType === 'legacyIE') {
        targetTextArea.focus();
        const textRange = document.selection.createRange();
        textRange.moveStart('character', -targetTextArea.value.length);
        currentCaretPosition = textRange.text.length;
    } else if (browserSelectionType === 'modern') {
        currentCaretPosition = targetTextArea.selectionStart;
    } else {
        console.warn('Unsupported browser selection API detected. Text insertion might not be accurate.');
        // Fallback: insert at the beginning for unknown types.
        currentCaretPosition = 0;
    }

    // Split the textarea content and insert the new string.
    const textBeforeCaret = targetTextArea.value.substring(0, currentCaretPosition);
    const textAfterCaret = targetTextArea.value.substring(currentCaretPosition);
    targetTextArea.value = textBeforeCaret + stringToInsert + textAfterCaret;

    // Update caret position after insertion.
    currentCaretPosition += stringToInsert.length;

    // Restore caret position and focus based on browser type.
    if (browserSelectionType === 'legacyIE') {
        targetTextArea.focus();
        const newTextRange = document.selection.createRange();
        newTextRange.moveStart('character', -targetTextArea.value.length);
        newTextRange.moveStart('character', currentCaretPosition);
        newTextRange.moveEnd('character', 0);
        newTextRange.select();
    } else if (browserSelectionType === 'modern') {
        targetTextArea.selectionStart = currentCaretPosition;
        targetTextArea.selectionEnd = currentCaretPosition;
        targetTextArea.focus();
    }

    // Restore the original scroll position.
    targetTextArea.scrollTop = initialScrollPosition;
};

const FLOOD_BAN_MESSAGE = 'Access restricted: You are temporarily unable to send messages (potential flooding).';
const MESSAGE_INPUT_FIELD_SELECTOR = '#message-input-field';
const MESSAGE_SEND_BUTTON_SELECTOR = '.send-message-button';

// Reactive computation to monitor and apply chat restrictions based on user status.
Tracker.autorun(() => {
    const currentUserEntity = Meteor.user();
    const messageInput = $(MESSAGE_INPUT_FIELD_SELECTOR);
    const sendMessageButton = $(MESSAGE_SEND_BUTTON_SELECTOR);

    // Check if a user is logged in AND if their chat capabilities are explicitly disabled.
    if (currentUserEntity && currentUserEntity.profile && currentUserEntity.profile.isChatEnabled === false) {
        // Apply restrictions: disable input, display ban message, disable send button.
        messageInput.prop('disabled', true); // Use .prop() for boolean properties.
        messageInput.val(FLOOD_BAN_MESSAGE);
        sendMessageButton.prop('disabled', true);
        console.warn(`User ID ${currentUserEntity._id} has chat functionality disabled.`);
    } else {
        // If chat is not explicitly disabled, ensure the input and button are enabled.
        messageInput.prop('disabled', false);
        // Only clear the message if it was the ban message; otherwise, preserve user's draft.
        if (messageInput.val() === FLOOD_BAN_MESSAGE) {
            messageInput.val('');
        }
        sendMessageButton.prop('disabled', false);
        console.debug('Chat functionality is enabled for the current user or anonymous access.');
    }
});