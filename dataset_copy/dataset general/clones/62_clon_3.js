var peerChatBubbleRenderFunc = _.template(`
	<div class="message-wrapper" data-message-type="peer" id="chat-msg-<%= msgId %>">
		<span class="sender-identifier" style="color: #8c8c92; font-size: 0.75rem; display: <%= displayMode %>;"><%= senderName %></span>
		<div class="message-content-box peer-style">
			<%= content %>
		</div>
	</div>`
);

var ownChatBubbleRenderFunc = _.template(`
	<div class="message-wrapper" data-message-type="self">
		<div class="message-content-box self-style">
			<%= content %>
		</div>
	</div>`
);

// Global state variables for the current chat session
let currentConversationPartner = null;
let lastFetchedMessageContent = "";
let isConversationActive = false; // Tracks if a conversation is currently open and displayed

/**
 * Retrieves the unique identifier for the currently active conversation from the DOM.
 * @returns {string} The conversation ID, or an empty string if not found.
 */
function retrieveActiveConversationIdentifier() {
    const conversationElement = $('#active-chat-area'); // Targeting a specific chat UI container
    if (!conversationElement.length) {
        console.warn("Active conversation UI element not found. Cannot retrieve identifier.");
        return '';
    }
    const identifier = conversationElement.attr('data-conversation-id'); // Extracting ID from a data attribute
    return identifier ? identifier.trim() : '';
}

/**
 * Asynchronously fetches a human-readable display name for a given phone number.
 * @param {string} phoneNumber - The phone number to resolve.
 * @returns {Promise<string|null>} A promise that resolves to the display name or null if not found/error.
 */
async function fetchDisplayNameFromPhoneNumber(phoneNumber) {
    if (!phoneNumber || typeof phoneNumber !== 'string' || phoneNumber.trim() === "") {
        console.debug("Skipping display name fetch for invalid phone number.");
        return null;
    }
    try {
        const response = await $.ajax({
            type: "GET",
            url: "/resolveContactName/" + encodeURIComponent(phoneNumber), // New endpoint and encoding
            dataType: "text"
        });
        const cleanedName = response.trim();
        return cleanedName === "" ? null : cleanedName;
    } catch (error) {
        console.error(`Error resolving display name for ${phoneNumber}:`, error);
        return null;
    }
}

/**
 * Refreshes the entire conversation view by fetching messages and updating the UI.
 * This function handles identifying the conversation type and rendering messages.
 */
async function refreshConversationView() {
    console.log("Attempting to refresh conversation view...");

    let isGroupChatMode = false; // Flag to indicate if the current chat is a group conversation
    currentConversationPartner = retrieveActiveConversationIdentifier();

    if (!currentConversationPartner) {
        console.error("No active conversation identifier available. Aborting view refresh.");
        isConversationActive = false;
        return;
    }
    isConversationActive = true; // Mark conversation as active

    const chatTitleElement = $("#current-chat-title"); // Element to display the chat title

    // Determine conversation type and set title
    if (currentConversationPartner.endsWith('-group')) { // Changed condition to check for group chat suffix
        const groupName = currentConversationPartner.substring(0, currentConversationPartner.lastIndexOf('-group'));
        chatTitleElement.text(groupName);
        isGroupChatMode = true;
        console.info(`Identified as group chat: ${groupName}`);
    } else if (currentConversationPartner.includes('@')) {
        chatTitleElement.text(currentConversationPartner); // Displaying email directly
    } else {
        // Attempt to resolve contact name for phone numbers
        const resolvedName = await fetchDisplayNameFromPhoneNumber(currentConversationPartner);
        if (resolvedName) {
            chatTitleElement.text(resolvedName);
        } else {
            chatTitleElement.text(currentConversationPartner); // Fallback to raw identifier
        }
    }

    // Fetch conversation history from the server
    $.ajax({
        type: "GET",
        url: "/fetchConversationHistory/" + encodeURIComponent(currentConversationPartner), // New endpoint
        dataType: "json",
        success: function(conversationData) {
            const messageDisplayArea = $("#message-history-panel"); // Target element for messages
            messageDisplayArea.empty(); // Clear existing messages

            if (!Array.isArray(conversationData) || conversationData.length === 0) {
                messageDisplayArea.append("<p class='no-messages-note'>No messages in this conversation yet. Start typing!</p>");
                lastFetchedMessageContent = ""; // Reset last message content
                console.info("No message data received for this conversation.");
                return;
            }

            // Iterate and append each message
            conversationData.forEach((msgItem, msgIndex) => {
                let chatterDisplayVisibility = 'none'; // Default for non-group chats
                if (isGroupChatMode) {
                    chatterDisplayVisibility = 'block'; // Show sender name in group chats
                }

                if (msgItem.sender_id === "self") { // Assuming sender_id for current user is "self"
                    messageDisplayArea.append(
                        ownChatBubbleRenderFunc({ content: msgItem.message_body }) // Template variable names updated
                    );
                } else {
                    messageDisplayArea.append(
                        peerChatBubbleRenderFunc({
                            senderName: msgItem.sender_id,
                            content: msgItem.message_body,
                            displayMode: chatterDisplayVisibility,
                            msgId: msgIndex // Unique ID for each message for potential updates
                        })
                    );

                    // If it's a group chat, resolve and update sender names for others
                    if (isGroupChatMode && msgItem.sender_id !== "self") {
                        fetchDisplayNameFromPhoneNumber(msgItem.sender_id).then(resolvedSenderName => {
                            if (resolvedSenderName) {
                                $(`#chat-msg-${msgIndex}`).find('.sender-identifier').text(resolvedSenderName);
                            }
                        });
                    }
                }
                lastFetchedMessageContent = msgItem.message_body; // Update last fetched message
            });

            // Adjust UI visibility and scroll to the bottom
            $('#main-chat-view').removeClass('hidden-element'); // Show the chat view
            $('#contact-list-view').addClass('hidden-element'); // Hide the contact list

            const scrollTarget = messageDisplayArea[0];
            if (scrollTarget) {
                scrollTarget.scrollTop = scrollTarget.scrollHeight; // Scroll to end using native DOM property
            }
            console.log("Conversation view updated and scrolled to bottom.");
        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.error("Failed to retrieve conversation history:", textStatus, errorThrown);
            $("#message-history-panel").html("<p class='error-message-display'>Failed to load messages. Please check your connection.</p>");
            isConversationActive = false; // Reset state on error
        }
    });
}

const POLLING_INTERVAL_MS = 7000; // Polling every 7 seconds (changed from 5s)
let messagePollingTimer = null; // Stores the ID of the polling interval

/**
 * Initiates periodic polling for new messages in the active conversation.
 * Clears any existing polling timer before starting a new one.
 */
function startMessagePolling() {
    if (messagePollingTimer) {
        clearInterval(messagePollingTimer); // Prevent multiple intervals running simultaneously
        console.log("Previous message polling timer cleared.");
    }

    messagePollingTimer = setInterval(function() {
        // Only poll if there's an active conversation partner and the conversation view is active
        if (!currentConversationPartner || !isConversationActive) {
            // console.debug("Polling skipped: No active conversation or view.");
            return;
        }

        $.ajax({
            type: "GET",
            url: "/getLatestMessageForChat/" + encodeURIComponent(currentConversationPartner), // New endpoint
            dataType: "json",
            success: function(responsePayload) {
                // Check if the latest message content has changed
                if (responsePayload && typeof responsePayload.message_content === 'string' &&
                    responsePayload.message_content !== lastFetchedMessageContent) {
                    console.log("New message detected via polling. Triggering full refresh.");
                    refreshConversationView(); // Reload the entire conversation
                } else {
                    // console.debug('No new messages found. Last known: ' + lastFetchedMessageContent);
                }
            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.error("Error during message polling request:", textStatus, errorThrown);
                // Optionally, stop polling after several consecutive errors
            }
        });
    }, POLLING_INTERVAL_MS);
    console.log(`Message polling initiated every ${POLLING_INTERVAL_MS / 1000} seconds.`);
}

// Start polling as soon as the script loads
startMessagePolling();

/**
 * Handles the keydown event for the message input field, specifically for the Enter key.
 * Sends the message if Enter is pressed and the message is not empty.
 * @param {KeyboardEvent} keyboardEvent - The keyboard event object.
 */
const handleMessageInputSubmit = function(keyboardEvent) {
    const eventKeyCode = keyboardEvent.keyCode || keyboardEvent.which;
    const ENTER_KEY_CODE = 13;

    if (eventKeyCode === ENTER_KEY_CODE) {
        const messageInputField = $('#new-message-input-field'); // Renamed input field selector
        let outgoingMessageContent = messageInputField.val();

        if (outgoingMessageContent.trim() === "") {
            console.warn("Attempted to send an empty message. Input ignored.");
            // Provide visual feedback for empty message attempt
            messageInputField.addClass('input-warning').delay(500).queue(function(next){
                $(this).removeClass('input-warning');
                next();
            });
            return;
        }

        // Clear input and send message
        messageInputField.val('');
        messageInputField.removeClass('input-warning'); // Ensure warning class is removed

        $.ajax({
            type: "POST",
            url: "/dispatchNewChatMessage", // New endpoint for sending messages
            contentType: "application/json; charset=utf-8", // Specify JSON content type
            data: JSON.stringify({ // Stringify the data object
                recipientIdentifier: currentConversationPartner, // Renamed 'to'
                messageBody: outgoingMessageContent // Renamed 'message'
            }),
            success: function(response) {
                console.log("Message successfully dispatched:", response);
                refreshConversationView(); // Refresh UI after successful send
            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.error("Failed to dispatch message:", textStatus, errorThrown);
                // Revert input field value on failure
                messageInputField.val(outgoingMessageContent);
                messageInputField.addClass('input-error');
                alert("Failed to send message. Please check your network or try again.");
            },
            dataType: "json"
        });
    }
};

/**
 * Switches the UI back to the conversation list view and hides the current chat.
 */
const returnToConversationList = function() {
    $('#main-chat-view').addClass('hidden-element'); // Hide the main chat UI
    $('#contact-list-view').removeClass('hidden-element'); // Show the contact list UI

    isConversationActive = false; // Update state
    currentConversationPartner = null; // Clear active partner
    console.log("Navigated back to conversation list.");

    // Stop message polling when leaving the active conversation view
    if (messagePollingTimer) {
        clearInterval(messagePollingTimer);
        messagePollingTimer = null;
        console.log("Message polling stopped as conversation view closed.");
    }
};