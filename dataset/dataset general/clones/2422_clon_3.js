/*
 * This module manages real-time communication and UI updates for a collaborative text interface.
 * It handles message display, user interactions, and connection state.
 * Developed as part of an experimental web-based chat platform.
 * (c) 2023 Acme Corp. - All rights reserved.
 */
(function () {
  // Core application configuration and state variables
  const serverHostAddress = window.__chattrrHost;
  const connectionPort = window.__chattrrPort ? Number.parseInt(window.__chattrrPort, 10) : 80;
  const clientAuthToken = window.__userToken;

  let wasEverConnected = false; // Flag indicating if a successful connection was ever established
  let uiInputHandlerActive = false; // Controls if the send button listener is active

  let activePasskey = null; // Stores the hashed password for the current session
  let passkeyPreApplied = false; // Indicates if the password was auto-applied after a disconnect

  let initiateNetworkSession; // Function reference for starting socket connections
  const sessionManager = {}; // Holds the active socket connection and related state
  let reconnectAttemptCounter = 0; // Number of failed reconnection attempts
  let reconnectSchedulerId = null; // Timer ID for scheduled reconnection attempts

  const messageLog = []; // Stores sent messages (raw input + command data) for history navigation
  let logPointer = 0; // Current position in the message history

  const pendingTransmissions = {}; // Messages sent but not yet acknowledged (or lost before server receipt)
  let transmissionIdCounter = 1; // Counter for unique message IDs

  let lastAliasChangeTimestamp = 0; // Timestamp of the last name change request
  // let lastTransmissionTimestamp = 0; // Original variable, but unused; removed.

  // let initialBottomPadding; // Original variable, unused and removed.
  let isInterfaceClosed = false; // Flag if the chat window is considered closed

  let canFlashTitle = true; // User preference for title flashing
  let isTitleAlerting = false; // Current state of title flashing animation
  let titleAlertTimerId = null; // Timer ID for title flashing animation

  const loadingBoardNamePlaceholder = "<loading board name>"; // Default text for board URL
  let currentBoardIdentifier = loadingBoardNamePlaceholder; // The current board's URL

  let localParticipantId = null; // Unique ID for the current user
  let isInitialLoadPhase = true; // Flag for initial loading phase, affects title flashing behavior
  let initialLoadTimerId = null; // Timer ID for the initial load phase duration

  let isPasskeyPromptActive = false; // Flag indicating if password prompt is currently displayed

  const appCore = {}; // Main object to hold application functions (formerly 'f')
  
  // Cache frequently accessed DOM elements for performance
  const domElements = {
    messageInputField: null,
    inputHolder: null,
    languageSelector: null,
    topBarTextContainer: null,
    userInfoTableBody: null,
    messageTableHolder: null,
    messageTableBody: null,
    sendButton: null,
  };

  // Helper function to get DOM elements, with caching
  const getDomElement = (id, cacheKey) => {
    if (!domElements[cacheKey]) {
      domElements[cacheKey] = document.getElementById(id);
    }
    return domElements[cacheKey];
  };

  // --- Core Network Management Functions ---

  // Placeholder for the actual socket.io connection logic.
  // This function attempts to establish a connection to the chat server.
  initiateNetworkSession = () => { // Renamed startSockets
    reconnectAttemptCounter++; // Increment attempt counter
    appCore.displaySystemNotification(`Attempting to connect (attempt ${reconnectAttemptCounter})...`);

    // Clear any pending reconnection timers if a new attempt is initiated
    if (reconnectSchedulerId) {
      clearInterval(reconnectSchedulerId);
      reconnectSchedulerId = null;
    }

    // Simulate socket connection setup. Assumes a global 'io' object is available.
    if (typeof window.io === 'undefined' || typeof window.io.connect !== 'function') {
      console.error("Socket.io client library ('io') not found. Cannot establish connection.");
      appCore.displaySystemNotification("Critical error: Communication library missing. Check console.");
      return;
    }

    const connectionUri = `${serverHostAddress}:${connectionPort}`;
    const newSocket = window.io.connect(connectionUri, {
      'reconnect': false, // We handle reconnection manually
      'force new connection': true,
      'query': `token=${clientAuthToken}` // Pass authentication token
    });

    sessionManager.connection = newSocket; // Store the new socket

    newSocket.on('connect', () => {
      appCore.displaySystemNotification("Connected to service.");
      wasEverConnected = true;
      reconnectAttemptCounter = 0; // Reset counter on successful connection
      if (reconnectSchedulerId) {
        clearInterval(reconnectSchedulerId);
        reconnectSchedulerId = null;
      }
      // If a password is set and wasn't pre-applied, send it upon successful connection.
      if (activePasskey && !passkeyPreApplied) {
        appCore.transmitConnectionCredentials(activePasskey);
        passkeyPreApplied = true;
      }
      appCore.initializeInputListeners(); // Ensure input listeners are active
    });

    newSocket.on('message', (data) => appCore.processIncomingMessage(data));
    newSocket.on('disconnect', () => {
      appCore.displaySystemNotification("Disconnected from service. Attempting to reconnect...");
      // Schedule reconnection only if not already scheduled by a server shutdown message
      if (!reconnectSchedulerId) {
        reconnectSchedulerId = setInterval(initiateNetworkSession, 3000); // Reconnect every 3 seconds
      }
    });
    newSocket.on('error', (err) => {
      console.error("Socket connection error:", err);
      appCore.displaySystemNotification(`Connection error: ${err.message || 'Unknown error'}.`);
      if (!reconnectSchedulerId) { // Schedule reconnect on error if not already doing so
         reconnectSchedulerId = setInterval(initiateNetworkSession, 5000); // Longer delay for error-based reconnect
      }
    });
  };

  // Sends connection-specific credentials (like password) to the server.
  appCore.transmitConnectionCredentials = (credentialHash) => { // Renamed sendConnectMessage
    const currentSocket = sessionManager.connection;
    if (currentSocket && currentSocket.connected) {
      currentSocket.send(JSON.stringify({ type: "auth", passkey: credentialHash })); // Added 'type' for clarity
    } else {
      appCore.displaySystemNotification("Cannot send credentials: Not connected.");
    }
  };

  // Displays a system-generated informational message within the chat interface.
  appCore.displaySystemNotification = (notificationContent) => { // Renamed showMessage
    if (typeof notificationContent !== 'string' || notificationContent.length === 0) {
      console.warn("Attempted to display empty or invalid system notification.");
      return;
    }

    const systemMessage = {
      source: "app-system", // Renamed 'name' to 'source'
      identifier: 0, // Renamed 'id' to 'identifier'
      timestamp: Date.now(), // Used Date.now()
      payload: notificationContent // Renamed 'msg' to 'payload'
    };
    appCore.processIncomingMessage(JSON.stringify(systemMessage));
  };

  // Handles the processing of a raw message string received from the server.
  appCore.processIncomingMessage = (rawMessageData) => { // Renamed messageReceived
    let parsedMessage;
    try {
      parsedMessage = JSON.parse(rawMessageData);
    } catch (error) {
      console.error("Failed to parse incoming message data:", error, rawMessageData);
      appCore.displaySystemNotification("Error: Corrupt message received from server.");
      return; // Early exit on parsing error
    }

    const currentSocket = sessionManager.connection; // Renamed socketHolder.socket to sessionManager.connection

    // Handle server shutdown notification
    if (parsedMessage.sessionTermination) { // Renamed 'closing' to 'sessionTermination'
      if (currentSocket && currentSocket.connected) {
        currentSocket.disconnect();
      }
      if (reconnectSchedulerId) { // Renamed retryTimeout to reconnectSchedulerId
        clearInterval(reconnectSchedulerId);
      }
      reconnectSchedulerId = setInterval(initiateNetworkSession, 2000); // Calls initiateNetworkSession
      appCore.displaySystemNotification(
        "Server is shutting down. Attempting to re-establish connection periodically.");
      return;
    }

    // Handle password authentication failure
    if (parsedMessage.authFailure) { // Renamed 'passwordFailed' to 'authFailure'
      if (activePasskey && !passkeyPreApplied) { // Renamed currentPassword & justSetPasswordUsingExisting
        appCore.transmitConnectionCredentials(activePasskey); // Renamed sendConnectMessage
        passkeyPreApplied = true;
      } else {
        appCore.requestPasskeyInput(); // Renamed promptForPassword
      }
      return;
    }
    passkeyPreApplied = false; // Reset flag after successful or failed password attempt

    // Update board URL if provided
    if (parsedMessage.boardURI) { // Renamed 'url' to 'boardURI'
      currentBoardIdentifier = parsedMessage.boardURI;
    }

    // Update user ID and manage initial load state
    if (parsedMessage.clientIdentity) { // Renamed 'userId' to 'clientIdentity'
      localParticipantId = parsedMessage.clientIdentity;
      isInitialLoadPhase = true;
      if (initialLoadTimerId) { // Renamed justStartedTimeout
        clearTimeout(initialLoadTimerId);
      }
      initialLoadTimerId = setTimeout(() => { // Using arrow function for brevity
        isInitialLoadPhase = false;
      }, 5000);
    }

    // Update title flashing preference
    if (typeof parsedMessage.alertPreference !== 'undefined') { // Renamed 'flash' to 'alertPreference'
      canFlashTitle = Boolean(parsedMessage.alertPreference); // Ensured boolean type explicitly
    }

    // Set language if provided
    if (parsedMessage.localeSetting) { // Renamed 'language' to 'localeSetting'
      appCore.adjustInterfaceLanguage(parsedMessage); // Renamed setLanguage
    }

    // Display lurker count
    if (parsedMessage.observerCount) { // Renamed 'count' to 'observerCount'
      appCore.renderObserverCount(parsedMessage); // Renamed showLurkers
    }

    // Display popular URLs
    if (parsedMessage.popularLinks) { // Renamed 'urls' to 'popularLinks'
      appCore.populatePopularLinks(parsedMessage); // Renamed writePopularUrlsToDom
    }

    // Display active users
    if (parsedMessage.activeParticipants) { // Renamed 'users' to 'activeParticipants'
      appCore.displayActiveUsers(parsedMessage); // Renamed showUsers
    }

    // If no message body, stop processing (e.g., control message without content)
    if (!parsedMessage.messageBody) { // Renamed 'msg' to 'messageBody'
      return;
    }
    
    // Finally, write the message to the DOM
    appCore.outputMessageToDisplay(parsedMessage); // Renamed writeMessageToDom
  };

  // Prompts the user to enter a password for the chat session.
  appCore.requestPasskeyInput = () => { // Renamed promptForPassword
    if (isPasskeyPromptActive) { // Guard clause to prevent multiple prompts
      console.log("Password prompt already active.");
      return;
    }

    appCore.displaySystemNotification("Please provide your session passkey."); // Renamed showMessage
    isPasskeyPromptActive = true;

    const msgInput = getDomElement("chattrr_in", "messageInputField"); // Cached DOM element
    const inputContainer = getDomElement("chattrr_inputHolder", "inputHolder"); // Cached DOM element

    if (!msgInput || !inputContainer) {
      console.error("Missing critical DOM elements for password prompt.");
      return;
    }

    msgInput.style.display = "none"; // Hide the regular message input

    const passkeyField = document.createElement("input");
    passkeyField.type = "password";
    passkeyField.id = "chattrr_in_passkey"; // Renamed ID
    passkeyField.placeholder = "Enter passkey..."; // Added placeholder
    passkeyField.classList.add("chattrr_password_input"); // Added a class for styling

    inputContainer.appendChild(passkeyField);

    // Temporarily disable the main send button's functionality, if active.
    const originalSendHandler = getDomElement("chattrr_send", "sendButton")?.onclick;
    if (originalSendHandler) {
      getDomElement("chattrr_send", "sendButton").onclick = null; // Disable click handler
    }

    const passkeyInputHandler = (evt) => {
      if (evt.key === "Enter") { // Modern event.key instead of event.which
        evt.preventDefault(); // Prevent accidental form submission
        inputContainer.removeChild(passkeyField);
        msgInput.style.display = ""; // Restore regular message input display

        // Re-enable original send button handler
        if (originalSendHandler) {
          getDomElement("chattrr_send", "sendButton").onclick = originalSendHandler;
        }

        const currentSocket = sessionManager.connection;
        if (currentSocket && currentSocket.connected) {
          // Use Crypto.SHA256 for hashing the password, assumes global Crypto object.
          activePasskey = window.Crypto.SHA256(passkeyField.value); // Renamed currentPassword
          appCore.transmitConnectionCredentials(activePasskey); // Renamed sendConnectMessage
        } else {
          appCore.displaySystemNotification("Cannot authenticate: not connected to the service.");
        }
        msgInput.focus();
        passkeyField.removeEventListener("keypress", passkeyInputHandler); // Clean up listener
        isPasskeyPromptActive = false; // Reset flag
      }
    };

    passkeyField.addEventListener("keypress", passkeyInputHandler, false);
    passkeyField.focus();
  };

  // Sets the display language of the interface based on server message.
  appCore.adjustInterfaceLanguage = (msgData) => { // Renamed setLanguage, message to msgData
    const langSelector = getDomElement("chattrr_languageSelect", "languageSelector"); // Cached DOM element
    if (!langSelector) {
      console.warn("Language selector element not found.");
      return;
    }

    const targetLocale = msgData.localeSetting; // Renamed message.language to msgData.localeSetting
    if (!targetLocale) {
      console.warn("No locale setting provided in message data.");
      return;
    }

    // Iterate through options to find and select the matching language
    for (const option of langSelector.options) { // Using for...of loop for conciseness
      if (option.value === targetLocale) {
        option.selected = true;
        break; // Exit loop once found
      }
    }
  };

  // Updates the display with the current number of observers (lurkers) and the board URL.
  appCore.renderObserverCount = (msgData) => { // Renamed showLurkers, message to msgData
    const topBarTextContainer = getDomElement("chattrr_topBarText", "topBarTextContainer"); // Cached DOM element
    if (!topBarTextContainer) {
      console.warn("Top bar text container not found.");
      return;
    }

    // Clear existing content more efficiently
    while (topBarTextContainer.lastChild) {
      topBarTextContainer.removeChild(topBarTextContainer.lastChild);
    }

    const infoSpan = document.createElement("span");
    infoSpan.textContent = `${msgData.observerCount} participants observing on `; // Using template literal, renamed count

    const boardLink = document.createElement("a");
    boardLink.textContent = currentBoardIdentifier; // Using currentBoardIdentifier
    boardLink.href = `http://${serverHostAddress}:${connectionPort}/log/${encodeURIComponent(currentBoardIdentifier)}?offset=0`; // Using template literal and renamed variables
    boardLink.target = "_blank"; // Open in new tab for logs
    boardLink.rel = "noopener noreferrer"; // Added for security

    topBarTextContainer.append(infoSpan, boardLink); // Using append for multiple nodes
  };

  // Populates the user list display with currently active participants.
  appCore.displayActiveUsers = (msgData) => { // Renamed showUsers, message to msgData
    const userInfoTableBody = getDomElement("chattrr_out_info_tablebody", "userInfoTableBody"); // Cached DOM element
    if (!userInfoTableBody) {
      console.warn("User info table body not found.");
      return;
    }

    // Clear previous user entries more efficiently
    userInfoTableBody.innerHTML = ''; 

    const activeParticipants = msgData.activeParticipants; // Renamed message.users to msgData.activeParticipants
    if (!activeParticipants || typeof activeParticipants !== 'object') {
      console.warn("Invalid or missing active participants data.");
      return;
    }

    Object.keys(activeParticipants).forEach((userName) => { // Using Object.keys and arrow function
      const userRow = document.createElement("tr");
      userRow.className = "chattrr_active_user_row"; // Renamed class for styling

      const userIdentifierCell = document.createElement("td");
      userIdentifierCell.className = "chattrr_user_id_cell"; // Renamed class
      userIdentifierCell.textContent = activeParticipants[userName]; // Value from the users object

      const userNameCell = document.createElement("td");
      userNameCell.className = "chattrr_user_name_cell"; // Renamed class
      userNameCell.textContent = userName; // Key from the users object

      userRow.append(userIdentifierCell, userNameCell); // Using append
      userInfoTableBody.appendChild(userRow);
    });
  };

  // Renders a list of popular URLs provided by the server to the DOM.
  appCore.populatePopularLinks = (msgData) => { // Renamed writePopularUrlsToDom, message to msgData
    const infoDisplayContainer = getDomElement("chattrr_out_info_tablebody", "userInfoTableBody"); // Cached DOM element
    if (!infoDisplayContainer) {
      console.warn("Info display container not found for popular links.");
      return;
    }

    infoDisplayContainer.innerHTML = ''; // Efficiently clear existing content

    const topLinks = msgData.popularLinks; // Renamed message.urls to msgData.popularLinks
    if (!Array.isArray(topLinks)) {
      console.warn("Invalid or missing popular links array.");
      return;
    }

    topLinks.forEach((linkEntry) => { // Renamed urlInfo to linkEntry
      if (!Array.isArray(linkEntry) || linkEntry.length < 2) {
        console.warn("Skipping malformed link entry:", linkEntry);
        return;
      }

      const linkRow = document.createElement("tr");
      linkRow.className = "chattrr_popular_link_row"; // Renamed class
      infoDisplayContainer.appendChild(linkRow);

      const visitorCountCell = document.createElement("td");
      visitorCountCell.className = "chattrr_link_visitors_cell"; // Renamed class
      visitorCountCell.textContent = linkEntry[1]; // Visitor count is the second element
      linkRow.appendChild(visitorCountCell);

      const linkUrlCell = document.createElement("td");
      linkUrlCell.className = "chattrr_link_url_cell"; // Renamed class
      linkRow.appendChild(linkUrlCell);
      
      const linkAnchor = document.createElement("a");
      linkAnchor.className = "chattrr_popular_link_anchor"; // Renamed class
      linkAnchor.href = linkEntry[0]; // URL is the first element
      linkAnchor.textContent = linkEntry[0];
      linkAnchor.target = "_blank"; // Open in new tab
      linkAnchor.rel = "noopener noreferrer"; // Added for security
      linkUrlCell.appendChild(linkAnchor);
    });
  };

  // Appends a new message entry to the chat display area.
  appCore.outputMessageToDisplay = (parsedMessage) => { // Renamed writeMessageToDom, message to parsedMessage
    const messageTableHolder = getDomElement("chattrr_out_tableHolder", "messageTableHolder"); // Cached DOM element
    if (!messageTableHolder) {
      // It's likely the chat interface has been closed or not fully initialized.
      console.warn("Message table holder not found; message discarded.");
      return;
    }

    const messageTableBody = getDomElement("chattrr_out_tablebody", "messageTableBody"); // Cached DOM element
    if (!messageTableBody) {
      console.error("Message table body not found.");
      return;
    }

    // Check if the user was scrolled near the bottom before adding new content
    const SCROLL_TOLERANCE = 20; // Pixels from bottom to consider "at bottom"
    const wasScrolledToBottom = (messageTableHolder.scrollHeight - messageTableHolder.clientHeight) <=
      (messageTableHolder.scrollTop + SCROLL_TOLERANCE);

    const messageRow = document.createElement("tr");
    messageRow.className = "chattrr_chat_message_row"; // Renamed class

    const senderNameCell = document.createElement("td");
    senderNameCell.className = "chattrr_sender_name_cell"; // Renamed class
    senderNameCell.textContent = parsedMessage.source; // Renamed message.name to parsedMessage.source

    const senderIdCell = document.createElement("td");
    senderIdCell.className = "chattrr_sender_id_cell"; // Renamed class
    senderIdCell.textContent = parsedMessage.identifier; // Renamed message.id to parsedMessage.identifier

    const messageTimeCell = document.createElement("td");
    messageTimeCell.className = "chattrr_message_time_cell"; // Renamed class
    const messageDate = new Date(parsedMessage.timestamp); // Renamed message.time to parsedMessage.timestamp
    messageTimeCell.textContent = messageDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }); // More specific time format
    messageTimeCell.title = messageDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }); // More specific date format

    const messageContentCell = document.createElement("td");
    messageContentCell.className = "chattrr_message_content_cell"; // Renamed class

    // If this message corresponds to a pending transmission, remove it from the pending list
    if (parsedMessage.sequenceId && pendingTransmissions[parsedMessage.sequenceId]) { // Renamed lostMessages to pendingTransmissions, message.seq to parsedMessage.sequenceId
      delete pendingTransmissions[parsedMessage.sequenceId];
    }

    appCore.injectFormattedContent(messageContentCell, parsedMessage.payload); // Renamed assignMessage, message.msg to parsedMessage.payload

    if (parsedMessage.originalContent) { // Renamed message.origMsg to parsedMessage.originalContent
      messageContentCell.title = parsedMessage.originalContent;
      messageContentCell.classList.add("chattrr_translated_content"); // Renamed class
    }

    messageRow.append(senderNameCell, senderIdCell, messageTimeCell, messageContentCell); // Using append for multiple nodes
    messageTableBody.appendChild(messageRow);

    // Scroll to bottom if user was already near the bottom
    if (wasScrolledToBottom) {
      messageTableHolder.scrollTop = messageTableHolder.scrollHeight; // Simpler way to scroll to bottom
    }

    // Trigger title flashing for new, non-self, non-system messages
    if (!isInitialLoadPhase && (parsedMessage.identifier !== 0) && (parsedMessage.identifier !== localParticipantId)) {
      isTitleAlerting = true; // Renamed titleFlashing
      appCore.animateTitleAlert(false); // Renamed flashTitle
    }
  };

  // Injects and formats message content (text and links) into a target DOM element.
  appCore.injectFormattedContent = (targetElement, contentString) => { // Renamed assignMessage, msgHolder to targetElement, msg to contentString
    if (!targetElement || typeof contentString !== 'string') {
      console.warn("Invalid arguments for injectFormattedContent.");
      return;
    }
    
    // Ensure the target element is empty before adding content
    targetElement.innerHTML = ''; 

    // Check if linkify function is available globally
    if (typeof window.linkify !== 'function') {
      console.error("Linkify library not found. Message content will not be linked.");
      const textNode = document.createTextNode(appCore.processTextForBreaks(contentString));
      targetElement.appendChild(textNode);
      return;
    }

    // Use a DocumentFragment for performance when appending multiple elements
    const fragment = document.createDocumentFragment();

    window.linkify(contentString, {
      callback: (segmentText, segmentHref) => { // Renamed text, href to segmentText, segmentHref
        let elementToAppend;
        if (segmentHref) {
          elementToAppend = document.createElement("a");
          elementToAppend.href = segmentHref;
          elementToAppend.target = "_blank";
          elementToAppend.rel = "noopener noreferrer"; // Added for security
          elementToAppend.textContent = appCore.truncateLinkDisplay(segmentText); // Renamed processLinkText
          elementToAppend.title = segmentText;
          elementToAppend.classList.add("chattrr_link_segment"); // Added class
        } else {
          elementToAppend = document.createElement("span");
          elementToAppend.textContent = appCore.processTextForBreaks(segmentText); // Renamed processMessageText
          elementToAppend.classList.add("chattrr_text_segment"); // Added class
        }
        fragment.appendChild(elementToAppend);
      }
    });
    targetElement.appendChild(fragment); // Append the fragment once
  };

  // Truncates long URLs for display purposes, adding an ellipsis in the middle.
  const MAX_LINK_DISPLAY_LENGTH = 30;
  const TRUNCATION_HALF_LENGTH = 15; // MAX_LINK_DISPLAY_LENGTH / 2

  appCore.truncateLinkDisplay = (rawUrlText) => { // Renamed processLinkText, rawText to rawUrlText
    if (typeof rawUrlText !== 'string') {
      return ''; // Handle non-string input gracefully
    }
    if (rawUrlText.length > MAX_LINK_DISPLAY_LENGTH) {
      // Use slice for consistency and potentially better performance over substring
      return `${rawUrlText.slice(0, TRUNCATION_HALF_LENGTH)}\u2026${rawUrlText.slice(-TRUNCATION_HALF_LENGTH)}`; // Using template literal and slice
    }
    return rawUrlText;
  };

  // Processes message text to insert zero-width spaces for better word wrapping in long words.
  appCore.processTextForBreaks = (rawMessageContent) => { // Renamed processMessageText, rawText to rawMessageContent
    if (typeof rawMessageContent !== 'string') {
      return '';
    }
    // Split by whitespace, process each word, then rejoin.
    return rawMessageContent.split(' ').map(appCore.insertZeroWidthBreaks).join(' '); // Renamed processMessageWord
  };

  // Inserts zero-width spaces into excessively long words to aid in text wrapping.
  const MAX_WORD_SEGMENT_LENGTH = 10;
  const LONG_WORD_THRESHOLD = 20;

  appCore.insertZeroWidthBreaks = (inputWord) => { // Renamed processMessageWord, word to inputWord
    let processedResult = "";
    let remainingWord = inputWord; // Renamed word to remainingWord

    while (remainingWord.length > MAX_WORD_SEGMENT_LENGTH) {
      if (remainingWord.length > LONG_WORD_THRESHOLD) { // If it's very long, break it
        processedResult += remainingWord.substring(0, MAX_WORD_SEGMENT_LENGTH) + "\u200B"; // Zero-width space
        remainingWord = remainingWord.substring(MAX_WORD_SEGMENT_LENGTH);
      } else {
        // If it's long but not excessively so, keep it as one chunk, then exit.
        processedResult += remainingWord;
        remainingWord = ""; // Clear remainingWord to exit loop
      }
    }
    processedResult += remainingWord; // Append any remaining part of the word
    return processedResult;
  };

  // Animates the browser tab title to alert the user of new activity.
  const FLASH_INITIAL_DELAY_MS = 10 * 1000; // 10 seconds for the first flash cycle
  const FLASH_CYCLE_DELAY_MS = 1000; // 1 second for subsequent flashes

  appCore.animateTitleAlert = (isSubsequentFlash) => { // Renamed flashTitle, flashedOnce to isSubsequentFlash
    if (canFlashTitle && isTitleAlerting && !titleAlertTimerId) { // Renamed allowFlashing, titleFlashing, titleFlashingTimeout
      const currentTitle = document.title;
      if (!currentTitle) { 
          console.warn("Document title is empty, cannot flash.");
          return;
      }

      titleAlertTimerId = setTimeout(() => {
        titleAlertTimerId = null; // Clear timer ID after execution
        
        // Ensure title is at least 2 chars long before attempting substring operations
        const baseTitle = currentTitle.length >= 2 && (currentTitle.startsWith("*!") || currentTitle.startsWith("* ")) 
                          ? currentTitle.substring(2) : currentTitle;
        document.title = `*!${baseTitle}`; // Add '!' for initial alert state

        titleAlertTimerId = setTimeout(() => {
          titleAlertTimerId = null; // Clear timer ID
          document.title = `* ${baseTitle}`; // Change '!' to ' ' for next state
          appCore.animateTitleAlert(true); // Continue flashing, now it's a subsequent flash
        }, FLASH_CYCLE_DELAY_MS);
      }, isSubsequentFlash ? FLASH_CYCLE_DELAY_MS : FLASH_INITIAL_DELAY_MS); // Different initial delay
    } else if (!isTitleAlerting) { // If flashing is no longer desired
      if (titleAlertTimerId) {
        clearTimeout(titleAlertTimerId);
        titleAlertTimerId = null;
      }
      // Restore original title if it was modified by flashing (remove "*!" or "* ")
      if (document.title.startsWith("*!") || document.title.startsWith("* ")) {
        document.title = document.title.substring(2);
      }
    }
  };

  // Initializes and connects all event listeners for the chat input and send button.
  appCore.initializeInputListeners = () => { // Renamed connectSendButton
    if (uiInputHandlerActive) { // Renamed sendButtonConnected
      console.log("Input listeners already active.");
      return;
    }
    uiInputHandlerActive = true;

    const messageInput = getDomElement("chattrr_in", "messageInputField");
    const sendButton = getDomElement("chattrr_send", "sendButton");

    if (!messageInput || !sendButton) {
      console.error("Missing critical input DOM elements for listener initialization.");
      return;
    }

    // Helper to parse and execute commands
    const executeCommand = (inputText) => {
      const trimmedText = inputText.trim();
      const messageObject = {}; // This object will be passed to command handlers and potentially sent to server

      if (!trimmedText) {
        return { handled: false, sendMessage: false, sendText: false, msgObj: messageObject };
      }

      let commandHandled = false;
      let shouldSendMessage = true; 
      let shouldSendTextToHistory = true; 

      // Define commands with their prefixes and handlers
      const commandMap = [
        { prefix: "/nick ", handler: (obj, val) => appCore.changeAlias(obj, val) }, 
        { prefix: "set name:", handler: (obj, val) => appCore.changeAlias(obj, val) },
        { prefix: "/quit", handler: () => appCore.terminateSession(), noHistory: true, noMessage: true }, 
        { prefix: "/exit", handler: () => appCore.terminateSession(), noHistory: true, noMessage: true }, 
        { prefix: "/close", handler: () => appCore.terminateSession(), noHistory: true, noMessage: true }, 
        { prefix: "/clear", handler: () => appCore.clearChatHistory(), noHistory: true, noMessage: true }, 
        { prefix: "/reload", handler: () => appCore.refreshInterface(), noHistory: true, noMessage: true }, 
        { prefix: "/force ", handler: (obj, val) => appCore.forceBoardUrl(obj, val), noHistory: true }, 
        { prefix: "set history depth:", handler: (obj, val) => appCore.setHistoryDepth(obj, val), noHistory: true }, 
        { prefix: "/depth ", handler: (obj, val) => appCore.setHistoryDepth(obj, val), noHistory: true },
        { prefix: "/help", handler: () => appCore.displayHelpInfo(), noHistory: true, noMessage: true }, 
        { prefix: "/users", handler: (obj) => appCore.requestActiveUsers(obj), noHistory: true }, 
        { prefix: "/minbs ", handler: (obj, val) => appCore.setMinBoardSize(obj, val), noHistory: true }, 
        { prefix: "/maxbs ", handler: (obj, val) => appCore.setMaxBoardSize(obj, val), noHistory: true }, 
        { prefix: "/flash ", handler: (obj, val) => appCore.setFlashPreference(obj, val), noHistory: true }, 
        { prefix: "/password", handler: () => appCore.initiatePasskeySetting(), noHistory: true, noMessage: true }, 
      ];

      for (const cmd of commandMap) {
        if (trimmedText.startsWith(cmd.prefix)) {
          commandHandled = true;
          const value = trimmedText.substring(cmd.prefix.length).trim();
          cmd.handler(messageObject, value); // Pass messageObject and value (some handlers might ignore these)
          
          if (cmd.noMessage) { shouldSendMessage = false; }
          if (cmd.noHistory) { shouldSendTextToHistory = false; }
          break; // Command found and handled, exit loop
        }
      }

      if (!commandHandled) {
        // If no command matched, it's a regular message
        appCore.prepareRegularMessage(messageObject, trimmedText); 
      }
      return { handled: commandHandled, sendMessage: shouldSendMessage, sendText: shouldSendTextToHistory, msgObj: messageObject };
    };

    const handleUserInput = () => { // Renamed send
      const inputText = messageInput.value;
      const processingResult = executeCommand(inputText);

      // Early exit for commands that don't produce a message or history entry
      if (!processingResult.sendMessage && !processingResult.sendText) {
        messageInput.value = "";
        messageInput.focus();
        return;
      }
      
      // Add message to local history for navigation (stores raw input and the command object)
      if (processingResult.sendText) {
        messageLog.push({ rawInput: inputText, commandData: processingResult.msgObj });
        logPointer = messageLog.length;
      }
      
      // If the command handler didn't explicitly set a sequence ID, set it for outgoing messages
      if (processingResult.sendMessage && Object.keys(processingResult.msgObj).length > 0 && !processingResult.msgObj.sequenceId) {
          processingResult.msgObj.sequenceId = transmissionIdCounter++;
      }

      // If it's a message that needs to be sent to the server (not just a local command)
      if (processingResult.sendMessage && Object.keys(processingResult.msgObj).length > 0) {
        // Store in pendingTransmissions if it has a sequenceId (i.e., it's a real message to track)
        if (processingResult.msgObj.sequenceId) {
          pendingTransmissions[processingResult.msgObj.sequenceId] = processingResult.msgObj;
        }
        appCore.transmitOutgoingMessage(processingResult.msgObj, inputText); 
      }

      messageInput.value = ""; // Clear input field
      messageInput.focus(); // Keep focus on input
    };

    // Event listener for mouse movement to reset title flashing
    document.body.addEventListener("mousemove", () => {
      isTitleAlerting = false; // Renamed titleFlashing
      appCore.animateTitleAlert(false); // Ensure title is reset
    }, false);

    // Click listener for the send button
    sendButton.addEventListener("click", handleUserInput, false);

    // Keydown listener for the message input field (history navigation)
    messageInput.addEventListener("keydown", (evt) => {
      isTitleAlerting = false; // Reset title flashing on input interaction
      appCore.animateTitleAlert(false); // Clear any active title alert animation

      if (evt.key === "ArrowUp") { // Renamed keyCode 38
        evt.preventDefault(); // Prevent cursor from moving to start of line
        if (logPointer > 0) {
          logPointer--; // Decrement pointer
          messageInput.value = messageLog[logPointer].rawInput; // Set input value from history
        }
      } else if (evt.key === "ArrowDown") { // Renamed keyCode 40
        evt.preventDefault(); // Prevent cursor from moving to end of line
        if (logPointer < messageLog.length - 1) {
          logPointer++; // Increment pointer
          messageInput.value = messageLog[logPointer].rawInput;
        } else if (logPointer === messageLog.length - 1) {
          // If at the last history item and pressing down again, clear input
          logPointer++;
          messageInput.value = "";
        }
      }
    }, false);

    // Keypress listener for Enter key to send message
    messageInput.addEventListener("keypress", (evt) => {
      if (evt.key === "Enter") { // Renamed event.which === 13
        evt.preventDefault(); // Prevent default form submission or new line in textarea
        handleUserInput();
      }
    }, false);
  };

  // Placeholder for the actual socket send, called by handleUserInput
  appCore.transmitOutgoingMessage = (messageObj, originalText) => {
    const currentSocket = sessionManager.connection;
    if (currentSocket && currentSocket.connected) {
      currentSocket.send(JSON.stringify(messageObj));
    } else {
      appCore.displaySystemNotification("Cannot send message: Not connected to the service.");
      console.warn("Message could not be sent due to disconnected socket:", originalText);
    }
  };

  // --- UI Interaction and Command Handlers ---

  // Closes the current chat session or window.
  appCore.terminateSession = () => { // Renamed closeWindow
    appCore.displaySystemNotification("Terminating session...");
    isInterfaceClosed = true; // Set flag
    if (sessionManager.connection) {
      sessionManager.connection.disconnect();
    }
    if (reconnectSchedulerId) {
      clearInterval(reconnectSchedulerId);
      reconnectSchedulerId = null;
    }
    window.alert("Chat session closed. You may refresh the page to rejoin."); // User feedback
  };

  // Clears all messages from the chat display area.
  appCore.clearChatHistory = () => { // Renamed clearHistory
    const messageTableBody = getDomElement("chattrr_out_tablebody", "messageTableBody");
    if (messageTableBody) {
      messageTableBody.innerHTML = ""; // Clear all child nodes
    }
    // Optionally clear the messageLog array if it's meant to reflect visible history
    // messageLog.length = 0; 
    // logPointer = 0;
    appCore.displaySystemNotification("Chat display cleared.");
  };

  // Reloads the entire browser window/interface.
  appCore.refreshInterface = () => { // Renamed reloadWindow
    appCore.displaySystemNotification("Reloading interface...");
    window.location.reload();
  };

  // Forces the current board URL to a new value (admin command likely).
  appCore.forceBoardUrl = (messageObject, newUrl) => { // Renamed forceUrl, msg to messageObject
    const trimmedUrl = newUrl.trim();
    if (trimmedUrl) {
      messageObject.command = "set_board_url"; // Added command type for server
      messageObject.boardURI = trimmedUrl; // Renamed msg.url
      appCore.displaySystemNotification(`Attempting to set board URL to: ${trimmedUrl}`);
    } else {
      appCore.displaySystemNotification("Command '/force' requires a URL argument.");
    }
  };

  // Displays help information within the chat.
  appCore.displayHelpInfo = () => { // Renamed showHelp
    const helpText = `Available commands:
    /nick [newname] - Change your display name.
    /depth [num] - Set chat history depth (0-20).
    /users - Request list of active users.
    /flash [on|off] - Toggle title flashing.
    /password - Set/change your session password.
    /clear - Clear chat display.
    /quit, /exit, /close - Disconnect from chat.
    /reload - Reload the page.
    /force [url] - Force a new board URL (admin).
    /minbs [size], /maxbs [size] - Adjust board size preferences.`;
    appCore.displaySystemNotification(helpText);
  };

  // Requests a list of currently active users from the server.
  appCore.requestActiveUsers = (messageObject) => { // Renamed requestUsers, msg to messageObject
    messageObject.command = "request_users"; // Added command type
    // No specific payload needed for this command, just its presence signals the request
    appCore.displaySystemNotification("Requesting active user list...");
  };

  // Sets the minimum board size preference.
  appCore.setMinBoardSize = (messageObject, sizeText) => { // Renamed grabMinBoardSize, msg to messageObject
    const sizeValue = Number.parseInt(sizeText.trim(), 10);
    if (!Number.isNaN(sizeValue) && sizeValue >= 0) {
      messageObject.command = "set_min_board_size";
      messageObject.minBoardDimension = sizeValue; // Renamed msg.minBoardSize
      appCore.displaySystemNotification(`Min board size preference set to ${sizeValue}.`);
    } else {
      appCore.displaySystemNotification("Invalid minimum board size. Please use a non-negative number.");
    }
  };

  // Sets the maximum board size preference.
  appCore.setMaxBoardSize = (messageObject, sizeText) => { // Renamed grabMaxBoardSize, msg to messageObject
    const sizeValue = Number.parseInt(sizeText.trim(), 10);
    if (!Number.isNaN(sizeValue) && sizeValue >= 0) {
      messageObject.command = "set_max_board_size";
      messageObject.maxBoardDimension = sizeValue; // Renamed msg.maxBoardSize
      appCore.displaySystemNotification(`Max board size preference set to ${sizeValue}.`);
    } else {
      appCore.displaySystemNotification("Invalid maximum board size. Please use a non-negative number.");
    }
  };

  // Sets the user's preference for title flashing.
  appCore.setFlashPreference = (messageObject, preferenceText) => { // Renamed grabFlash, msg to messageObject
    const lowerCasePref = preferenceText.trim().toLowerCase();
    if (lowerCasePref === "on" || lowerCasePref === "true") {
      messageObject.command = "set_flash_preference";
      messageObject.alertPreference = true; // Renamed msg.flash
      appCore.displaySystemNotification("Title flashing enabled.");
    } else if (lowerCasePref === "off" || lowerCasePref === "false") {
      messageObject.command = "set_flash_preference";
      messageObject.alertPreference = false; // Renamed msg.flash
      appCore.displaySystemNotification("Title flashing disabled.");
    } else {
      appCore.displaySystemNotification("Invalid flash preference. Use 'on' or 'off'.");
    }
  };

  // Initiates the process for setting or changing the session password.
  appCore.initiatePasskeySetting = () => { // Renamed setPassword
    // This command simply triggers the password prompt UI.
    appCore.requestPasskeyInput(); // Calls the prompt function
  };

  // Prepares a regular chat message for sending.
  appCore.prepareRegularMessage = (messageObject, messageContent) => { // Renamed grabMessage, msg to messageObject, text to messageContent
    messageObject.command = "chat_message"; // Explicitly set command type
    messageObject.payload = messageContent; // Renamed msg.msg
    // Server is expected to fill in name, id, time, and sequenceId if not already present.
  };

  // Handles requests to change the user's alias (name).
  const ALIAS_CHANGE_COOLDOWN_MS = 10 * 1000; // 10 seconds cooldown
  const MAX_ALIAS_LENGTH = 16; // Maximum length for the alias

  appCore.changeAlias = (messageObject, newAliasText) => { // Renamed grabName, msg to messageObject, text to newAliasText
    const currentTime = Date.now(); // Using Date.now() for current timestamp
    if (currentTime - lastAliasChangeTimestamp > ALIAS_CHANGE_COOLDOWN_MS) { // Renamed lastSetNameTime
      messageObject.command = "set_alias"; // Explicitly set command type
      messageObject.alias = newAliasText.trim().substring(0, MAX_ALIAS_LENGTH); // Renamed msg.name
      lastAliasChangeTimestamp = currentTime; // Update timestamp of last change
      appCore.displaySystemNotification(`Attempting to change alias to: ${messageObject.alias}`);
    } else {
      appCore.displaySystemNotification(
        `Alias changes are rate-limited to once every ${ALIAS_CHANGE_COOLDOWN_MS / 1000} seconds. Please wait.`);
    }
  };

  // Processes a command to set the chat history depth (number of messages to keep).
  const MAX_HISTORY_DEPTH = 20; // Maximum allowed history depth

  appCore.setHistoryDepth = (messageObject, depthInputText) => { // Renamed grabDepth, msg to messageObject, text to depthInputText
    const trimmedDepthText = depthInputText.trim();
    if (trimmedDepthText) {
      const requestedDepth = Number.parseInt(trimmedDepthText, 10); // Using Number.parseInt
      if (!Number.isNaN(requestedDepth) && Number.isInteger(requestedDepth) && requestedDepth >= 0) { // Added Number.isInteger for robustness
        messageObject.command = "set_history_depth"; // Explicitly set command type
        messageObject.logLimit = Math.min(requestedDepth, MAX_HISTORY_DEPTH); // Renamed msg.historyCount, applied max limit
        appCore.displaySystemNotification(`History depth preference set to ${messageObject.logLimit}.`);
      } else {
        appCore.displaySystemNotification("Invalid history depth. Please provide a non-negative integer.");
      }
    } else {
      appCore.displaySystemNotification("History depth command requires a numerical value.");
    }
  };

  // --- Initial Setup ---

  // Start the network session when the script loads.
  // Use a slight delay to ensure DOM is ready or other initializations complete.
  setTimeout(initiateNetworkSession, 100);

  // Expose appCore globally for debugging or external interaction if needed
  window.chatClient = appCore;

})();