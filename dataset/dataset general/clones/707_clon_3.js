(function(jq) {
  // Application state variables for the chat module
  let activeParticipantName, // Stores the current user's alias
    previousChatAuthor = '', // Tracks the author of the last message for display formatting
    cometdSubscriptionRef = null, // Reference to the metadata subscription object
    isSessionActive = false; // Flag indicating if the CometD connection is established

  // Initialize the chat application when the DOM is ready
  prepareInterface();
  // Ensure graceful disconnection on window unload
  jq(window).on('beforeunload', terminateSession);

  /**
   * Sets up the initial user interface elements and event listeners.
   */
  function prepareInterface() {
    jq("#connectionPanel").css('display', 'block');
    jq("#activeSessionPanel").css('display', 'none');
    jq('#messageInput').focus(); // Set focus to the message input field
    jq('#customCometdHost').prop('autocomplete', false); // Disable autocomplete for server URL

    // Event listener for the "Connect" button
    jq("#connectButton").on('click', function(domEvent) {
      establishConnection();
      domEvent.preventDefault(); // Prevent default form submission behavior
    });
    // Event listener for the "Disconnect" button
    jq("#disconnectButton").on('click', terminateSession);

    // Event listener for the username input field (Enter key to connect)
    jq("#userAlias").prop({
      "autocomplete": false
    }).on('keyup', function(keyboardEvent) {
      if (keyboardEvent.key === 'Enter') { // Check for the 'Enter' key
        establishConnection();
        keyboardEvent.preventDefault();
      }
    });
    // Event listener for the message input field (Enter key to send)
    jq("#messageInput").prop({
      "autocomplete": false
    }).on('keyup', function(keyboardEvent) {
      if (keyboardEvent.key === 'Enter') {
        dispatchContent();
        keyboardEvent.preventDefault();
      }
    });
    // Event listener for the "Send" button
    jq("#sendMessageButton").on('click', dispatchContent);

    console.info('Chat interface initialized and event handlers bound.');
  }

  /**
   * Initiates the CometD connection and joins the chat room.
   */
  function establishConnection() {
    activeParticipantName = jq('#userAlias').val().trim();
    if (!activeParticipantName) {
      alert('Please provide a user alias to join the chat!');
      jq('#userAlias').focus();
      return; // Exit if no username
    }

    const customHostOverride = jq('#customCometdHost').val().trim();
    const currentProtocol = document.location.protocol;
    const currentPort = document.location.port;
    const defaultHost = document.location.hostname;

    // Construct the CometD endpoint URL
    const cometdEndpointUrl = `${currentProtocol}//` +
      `${customHostOverride.length > 0 ? customHostOverride : defaultHost}:` +
      `${currentPort}/cometd`;

    console.debug(`Attempting CometD connection to: ${cometdEndpointUrl}`);

    // Connect to the CometD server
    jq.comet.connect(cometdEndpointUrl);
    isSessionActive = true; // Mark session as active

    // Update UI visibility
    jq("#connectionPanel").css('display', 'none');
    jq("#activeSessionPanel").css('display', 'block');
    jq('#userAlias').focus(); // Re-focus username field (or could be message input)

    // Subscribe to the chat channel and announce join
    jq.comet.startBatch(); // Begin a batch of CometD operations
    jq.comet.subscribe("/chat/demo", processIncomingMessage);
    jq.comet.publish("/chat/demo", {
      user: activeParticipantName,
      join: true,
      chat: `${activeParticipantName} has entered the conversation.`
    });
    jq.comet.endBatch(); // End batch, sending all queued messages

    // Manage the CometD metadata subscription for connection status updates
    if (cometdSubscriptionRef) {
      jq.comet.unsubscribe(cometdSubscriptionRef);
    }
    cometdSubscriptionRef = jq.comet.subscribe("/cometd/meta", function(eventObj) {
      // console.log("CometD meta event:", eventObj);
      switch (eventObj.action) {
        case "handshake":
          if (eventObj.reestablish) {
            if (eventObj.successful) {
              jq.comet.subscribe("/chat/demo", processIncomingMessage);
              jq.comet.publish("/chat/demo", {
                user: activeParticipantName,
                join: true,
                chat: `${activeParticipantName} has re-joined after a handshake.`
              });
            }
            processIncomingMessage({
              data: {
                join: true,
                user: "SYSTEM_MSG",
                chat: `Handshake ${eventObj.successful ? "successful." : "failed."}`
              }
            });
          }
          break;
        case "connect":
          if (eventObj.successful && !isSessionActive) {
            processIncomingMessage({
              data: {
                join: true,
                user: "SYSTEM_MSG",
                chat: "Reconnected to the chat server!"
              }
            });
          } else if (!eventObj.successful && isSessionActive) {
            processIncomingMessage({
              data: {
                leave: true,
                user: "SYSTEM_MSG",
                chat: "Disconnected from the chat server!"
              }
            });
          }
          isSessionActive = eventObj.successful;
          break;
        default:
          // Ignore other meta events for now
          break;
      }
    });
  }

  /**
   * Sends a chat message to the CometD server.
   */
  function dispatchContent() {
    const messageInputField = jq("#messageInput");
    let userTypedContent = messageInputField.val().trim();
    messageInputField.val(''); // Clear the input field

    if (userTypedContent === '') {
      console.warn('Attempted to send an empty message.');
      return; // Do not send empty messages
    }

    jq.comet.publish("/chat/demo", {
      user: activeParticipantName,
      chat: userTypedContent
    });
    // Optionally, give focus back to the input field
    messageInputField.focus();
  }

  /**
   * Handles incoming CometD messages and updates the chat display.
   * @param {object} incomingPayload - The message object received from CometD.
   */
  function processIncomingMessage(incomingPayload) {
    if (!incomingPayload || !incomingPayload.data) {
      console.warn("Invalid message format received:", incomingPayload);
      return;
    }

    const payloadData = incomingPayload.data;
    const chatDisplayArea = jq('#conversationLog');

    // Handle special case for member list updates
    if (Array.isArray(payloadData)) {
      let memberListMarkup = '';
      payloadData.forEach(member => {
        memberListMarkup += `<li>${member}</li>`;
      });
      jq('#participantList').html(`<ul>${memberListMarkup}</ul>`);
      return; // Handled as member list, no further processing for chat messages
    }

    // Process regular chat messages
    const sender = payloadData.user;
    const isSystemOrControlMessage = payloadData.join || payloadData.leave;
    const messageText = payloadData.chat;

    if (!messageText) {
      console.debug("Received message without text content, ignoring.");
      return;
    }

    let formattedSender = sender;
    if (!isSystemOrControlMessage && sender === previousChatAuthor) {
      formattedSender = "..."; // Abbreviate sender if same as previous
    } else {
      previousChatAuthor = sender;
      formattedSender += ":";
    }

    // Construct the message HTML
    const messageHtml = isSystemOrControlMessage ?
      `<div class="chat-alert"><span class="chat-sender">${formattedSender}&nbsp;</span><span class="chat-text">${messageText}</span></div>` :
      `<div class="chat-entry"><span class="chat-sender">${formattedSender}&nbsp;</span><span class="chat-text">${messageText}</span></div>`;

    chatDisplayArea.append(messageHtml);

    // Reset previous author for system messages to ensure next message shows full name
    if (isSystemOrControlMessage) {
      previousChatAuthor = '';
    }

    // Scroll chat display to the bottom
    chatDisplayArea.prop('scrollTop', chatDisplayArea.prop('scrollHeight') - chatDisplayArea.prop('clientHeight'));
  }

  /**
   * Disconnects from the CometD server and leaves the chat room.
   */
  function terminateSession() {
    if (!activeParticipantName) {
      console.warn('No active participant to disconnect.');
      return; // Nothing to do if not connected
    }

    // Unsubscribe from the metadata channel
    if (cometdSubscriptionRef) {
      jq.comet.unsubscribe(cometdSubscriptionRef);
      cometdSubscriptionRef = null;
    }

    // Announce departure and unsubscribe from chat channel
    jq.comet.startBatch();
    jq.comet.unsubscribe("/chat/demo", processIncomingMessage);
    jq.comet.publish("/chat/demo", {
      user: activeParticipantName,
      leave: true,
      chat: `${activeParticipantName} has exited the conversation.`
    });
    jq.comet.endBatch();

    // Update UI visibility and reset state
    jq("#connectionPanel").css('display', 'block');
    jq("#activeSessionPanel").css('display', 'none');
    jq('#userAlias').focus();
    activeParticipantName = null; // Clear the active user
    isSessionActive = false; // Mark session as inactive
    jq.comet.disconnect(); // Disconnect CometD
    jq('#participantList').empty(); // Clear the member list
    jq('#conversationLog').empty(); // Clear the chat history
    console.info('Chat session terminated.');
  }

})(jQuery); // Pass jQuery as 'jq' to the IIFE