// This extensively modified JavaScript module is designed for demonstrating
// WebRTC peer-to-peer data channel communication within a single browser
// context, simulating two distinct peers: an initiator and a responder.
// It supports both text messaging and basic file transfer functionalities.
// The code has undergone significant structural and naming transformations
// to represent a Type III clone of its original version.

// Key functionalities include:
// - WebRTC PeerConnection setup with STUN servers.
// - DataChannel creation and reception for application data.
// - UI interactions for initiating/joining calls and exchanging SDPs.
// - Handling of ICE candidates and various connection state changes.
// - Utility functions for chat logging and file transfer management.

// Historical references that inspired the original implementation:
// - Early WebRTC basics from HTML5Rocks: https://www.html5rocks.com/en/tutorials/webrtc/basics/
// - Google's AppRTC sample code: https://code.google.com/p/webrtc-samples/source/browse/trunk/apprtc/index.html
// - Interactive WebRTC demonstrations: https://webrtc-demos.appspot.com/html/pc1.html

/**
 * Primary configuration object for RTCPeerConnection instances.
 * Specifies ICE servers to enable connectivity across different network topologies.
 */
const GLOBAL_PEER_CONFIGURATION = {
    // A list of ICE (Interactive Connectivity Establishment) servers.
    // STUN servers help peers discover their public IP addresses and ports.
    iceServers: [
        {
            urls: "stun:23.21.150.121" // A public STUN server, often used for NAT traversal.
        }
    ]
};

/**
 * Supplementary options and constraints for RTCPeerConnection.
 * This can include preferences for specific WebRTC features.
 */
const PEER_CONNECTION_AUXILIARY_SETTINGS = {
    optional: [
        { DtlsSrtpKeyAgreement: true } // Essential for cryptographic key agreement for data and media.
    ]
};

/**
 * Centralized mapping of jQuery selectors for various UI elements.
 * Improves maintainability and readability of UI interaction code.
 */
const USER_INTERFACE_ELEMENTS = {
    MODAL_INITIATOR_OFFER_VIEW: '#showLocalOffer',
    MODAL_RESPONDER_ANSWER_INPUT: '#getRemoteAnswer',
    MODAL_CONNECTION_PENDING: '#waitForConnection',
    MODAL_ROLE_SELECTION: '#createOrJoin',
    MODAL_REMOTE_OFFER_ENTRY: '#getRemoteOffer',
    MODAL_LOCAL_ANSWER_VIEW: '#showLocalAnswer',
    BTN_INITIATE_SESSION: '#createBtn',
    BTN_ACCEPT_SESSION: '#joinBtn',
    BTN_OFFER_CONFIRM_SENT: '#offerSentBtn',
    BTN_OFFER_CONFIRM_RECEIVED: '#offerRecdBtn',
    BTN_ANSWER_CONFIRM_SENT: '#answerSentBtn',
    BTN_ANSWER_CONFIRM_RECEIVED: '#answerRecdBtn',
    INPUT_FILE_TRANSFER: '#fileBtn',
    TEXTAREA_REMOTE_OFFER_SDP: '#remoteOffer',
    TEXTAREA_REMOTE_ANSWER_SDP: '#remoteAnswer',
    INPUT_CHAT_MESSAGE: '#messageTextBox',
    DIV_CONVERSATION_HISTORY: '#chatlog',
    DIV_LOCAL_OFFER_SDP: '#localOffer',
    DIV_LOCAL_ANSWER_SDP: '#localAnswer'
};

/**
 * Enumeration for various chat message styling classes.
 * Helps standardize the appearance of messages in the chat log.
 */
const MESSAGE_DISPLAY_STYLES = {
    SUCCESS_INDICATION: 'text-success',
    GENERAL_INFORMATION: 'text-info',
    ERROR_ALERT: 'text-danger'
};

/**
 * A robust JSON parsing utility with integrated error handling.
 * Prevents application crashes due to malformed JSON input.
 * @param {string} jsonString - The string to be parsed.
 * @returns {object|null} The parsed JavaScript object, or null if parsing fails.
 */
const parseJsonSafely = (jsonString) => {
    try {
        return JSON.parse(jsonString);
    } catch (parseError) {
        console.error("JSON parsing encountered an error:", parseError.message);
        return null;
    }
};

/**
 * Controls the visibility state of a Bootstrap modal.
 * @param {string} modalSelector - The jQuery selector for the target modal.
 * @param {boolean} displayState - True to show the modal, false to hide it.
 */
const adjustModalVisibility = (modalSelector, displayState) => {
    $(modalSelector).modal(displayState ? 'show' : 'hide');
};

// --- Initiator Peer (Alice) Global Variables ---
let initiatorConnectionInstance = null; // RTCPeerConnection for the initiating side.
let initiatorPrimaryDataChannel = null; // The DataChannel established by the initiator.
let activeDataChannelReference = null;  // Points to the currently active data channel (initiator or responder).

// The `tn1` variable from the original code was unused and has been removed.
// Flags like `pc1icedone` are often redundant as connection states provide sufficient information.

/**
 * Orchestrates the initial setup of the user interface,
 * including modal states and event listeners for interaction buttons.
 */
function initializeUserInterface() {
    // Ensure all relevant modals are hidden at startup.
    adjustModalVisibility(USER_INTERFACE_ELEMENTS.MODAL_INITIATOR_OFFER_VIEW, false);
    adjustModalVisibility(USER_INTERFACE_ELEMENTS.MODAL_RESPONDER_ANSWER_INPUT, false);
    adjustModalVisibility(USER_INTERFACE_ELEMENTS.MODAL_CONNECTION_PENDING, false);
    adjustModalVisibility(USER_INTERFACE_ELEMENTS.MODAL_REMOTE_OFFER_ENTRY, false);

    // Display the initial modal for role selection (create or join).
    adjustModalVisibility(USER_INTERFACE_ELEMENTS.MODAL_ROLE_SELECTION, true);

    // Bind event handlers to UI buttons using jQuery.
    $(USER_INTERFACE_ELEMENTS.BTN_INITIATE_SESSION).on('click', () => {
        adjustModalVisibility(USER_INTERFACE_ELEMENTS.MODAL_INITIATOR_OFFER_VIEW, true);
        initiateSessionOfferGeneration(); // Start the WebRTC offer process.
    });

    $(USER_INTERFACE_ELEMENTS.BTN_ACCEPT_SESSION).on('click', () => {
        adjustModalVisibility(USER_INTERFACE_ELEMENTS.MODAL_REMOTE_OFFER_ENTRY, true); // Prompt for remote offer.
    });

    $(USER_INTERFACE_ELEMENTS.BTN_OFFER_CONFIRM_SENT).on('click', () => {
        adjustModalVisibility(USER_INTERFACE_ELEMENTS.MODAL_RESPONDER_ANSWER_INPUT, true); // Prepare to receive answer.
    });

    $(USER_INTERFACE_ELEMENTS.BTN_OFFER_CONFIRM_RECEIVED).on('click', () => {
        const receivedOfferString = $(USER_INTERFACE_ELEMENTS.TEXTAREA_REMOTE_OFFER_SDP).val();
        if (!receivedOfferString.trim()) {
            appendToChatLog("Error: Remote offer text field is empty.", MESSAGE_DISPLAY_STYLES.ERROR_ALERT);
            return; // Guard clause for empty input.
        }

        const offerDataObject = parseJsonSafely(receivedOfferString);
        if (!offerDataObject) {
            appendToChatLog("Error: Remote offer JSON format is invalid.", MESSAGE_DISPLAY_STYLES.ERROR_ALERT);
            return; // Guard clause for invalid JSON.
        }
        const remoteSessionDescription = new RTCSessionDescription(offerDataObject);
        console.info("Processed remote session offer:", remoteSessionDescription);
        appendToChatLog("Remote session offer successfully processed.", MESSAGE_DISPLAY_STYLES.SUCCESS_INDICATION);
        processIncomingSessionOffer(remoteSessionDescription); // Delegate to responder logic.
        adjustModalVisibility(USER_INTERFACE_ELEMENTS.MODAL_LOCAL_ANSWER_VIEW, true); // Show local answer modal.
    });

    $(USER_INTERFACE_ELEMENTS.BTN_ANSWER_CONFIRM_SENT).on('click', () => {
        adjustModalVisibility(USER_INTERFACE_ELEMENTS.MODAL_CONNECTION_PENDING, true); // Await full connection.
    });

    $(USER_INTERFACE_ELEMENTS.BTN_ANSWER_CONFIRM_RECEIVED).on('click', () => {
        const receivedAnswerString = $(USER_INTERFACE_ELEMENTS.TEXTAREA_REMOTE_ANSWER_SDP).val();
        if (!receivedAnswerString.trim()) {
            appendToChatLog("Error: Remote answer text field is empty.", MESSAGE_DISPLAY_STYLES.ERROR_ALERT);
            return;
        }

        const answerDataObject = parseJsonSafely(receivedAnswerString);
        if (!answerDataObject) {
            appendToChatLog("Error: Remote answer JSON format is invalid.", MESSAGE_DISPLAY_STYLES.ERROR_ALERT);
            return;
        }
        const remoteAnswerDescription = new RTCSessionDescription(answerDataObject);
        handleRemoteSessionAnswer(remoteAnswerDescription); // Delegate to initiator logic.
        adjustModalVisibility(USER_INTERFACE_ELEMENTS.MODAL_CONNECTION_PENDING, true); // Continue waiting.
    });

    // Event handler for file input changes.
    $(USER_INTERFACE_ELEMENTS.INPUT_FILE_TRANSFER).on('change', function() {
        const selectedFile = this.files && this.files[0];
        if (selectedFile) {
            console.debug("User selected file for transfer:", selectedFile.name);
            initiateDataFileTransfer(selectedFile);
        } else {
            appendToChatLog("No file selected for data transfer.", MESSAGE_DISPLAY_STYLES.GENERAL_INFORMATION);
        }
    });

    // Form submission handler for chat messages.
    $('#messageForm').on('submit', (event) => {
        event.preventDefault(); // Prevent default form submission to avoid page reload.
        sendUserTextMessage();
    });
}

/**
 * Callback function executed upon successful completion of a file transmission.
 * @param {File} completedFile - The File object that was transferred.
 */
function onFileTransferCompletion(completedFile) {
    console.debug(`File "${completedFile.name}" transfer has finished.`);
    appendToChatLog(`File "${completedFile.name}" sent.`, MESSAGE_DISPLAY_STYLES.SUCCESS_INDICATION);
}

/**
 * Callback function to report progress during file transmission.
 * @param {File} currentFile - The file currently being transferred.
 * @param {number} progressPercentage - The current progress as a percentage.
 */
function onFileTransferProgress(currentFile, progressPercentage) {
    console.debug(`File "${currentFile.name}" transfer progress: ${progressPercentage.toFixed(2)}%`);
    // This is where UI elements like progress bars could be updated.
}

/**
 * Initiates the transfer of a specified file through the active WebRTC DataChannel.
 * Includes validation for file existence and channel readiness.
 * @param {File} fileObject - The File object to be sent.
 */
function initiateDataFileTransfer(fileObject) {
    // Comprehensive validation for the file and data channel state.
    if (!fileObject || fileObject.size === 0) {
        appendToChatLog("Cannot transfer an empty or invalid file.", MESSAGE_DISPLAY_STYLES.ERROR_ALERT);
        return;
    }
    if (!activeDataChannelReference || activeDataChannelReference.readyState !== 'open') {
        appendToChatLog("Data channel not open for file transfer. Please establish connection first.", MESSAGE_DISPLAY_STYLES.ERROR_ALERT);
        return;
    }

    // Check for the availability of the file transfer utility.
    if (typeof FileTransferInitiator === 'undefined') {
        console.error("FileTransferInitiator library is not available.");
        appendToChatLog("File transfer service is missing or not loaded.", MESSAGE_DISPLAY_STYLES.ERROR_ALERT);
        return;
    }

    // Delegate the actual file sending to the FileTransferInitiator utility.
    FileTransferInitiator.send({
        file: fileObject,
        onFileSent: onFileTransferCompletion,
        onFileProgress: onFileTransferProgress,
        dataChannel: activeDataChannelReference // Explicitly pass the channel.
    });
    appendToChatLog(`Commencing transfer for: ${fileObject.name}`, MESSAGE_DISPLAY_STYLES.GENERAL_INFORMATION);
}

/**
 * Dispatches a text message from the chat input box via the active data channel.
 * Validates the message content and ensures the data channel is ready.
 */
function sendUserTextMessage() {
    const messageText = $(USER_INTERFACE_ELEMENTS.INPUT_CHAT_MESSAGE).val();
    if (!messageText.trim()) { // Check for messages containing only whitespace.
        appendToChatLog("Cannot send an empty message.", MESSAGE_DISPLAY_STYLES.GENERAL_INFORMATION);
        return;
    }

    if (!activeDataChannelReference || activeDataChannelReference.readyState !== 'open') {
        appendToChatLog("Data channel is not open. Message cannot be dispatched.", MESSAGE_DISPLAY_STYLES.ERROR_ALERT);
        return;
    }

    // Verify the message broadcasting utility is loaded.
    if (typeof RTCMessageBroadcaster === 'undefined') {
        console.error("RTCMessageBroadcaster library is not available.");
        appendToChatLog("Message broadcasting service is unavailable.", MESSAGE_DISPLAY_STYLES.ERROR_ALERT);
        return;
    }

    try {
        // Encapsulate the message in a structured object for better handling.
        const structuredMessagePayload = {
            type: 'chat_message', // Custom type to differentiate message types.
            content: messageText,
            timestamp: Date.now()
        };
        RTCMessageBroadcaster.send({
            channel: activeDataChannelReference,
            payload: structuredMessagePayload
        });
        appendToChatLog(messageText, MESSAGE_DISPLAY_STYLES.SUCCESS_INDICATION);
        $(USER_INTERFACE_ELEMENTS.INPUT_CHAT_MESSAGE).val(""); // Clear the input field.
        scrollChatToBottom(); // Auto-scroll to the latest message.
    } catch (transmissionError) {
        console.error("Error during text message transmission:", transmissionError);
        appendToChatLog("Failed to send message due to an internal error.", MESSAGE_DISPLAY_STYLES.ERROR_ALERT);
    }
}

/**
 * Initializes and configures the DataChannel for the initiating peer.
 * This channel is the primary conduit for application-specific data.
 */
function initializeInitiatorDataChannel() {
    // Lazily create the peer connection if it hasn't been initialized yet.
    if (!initiatorConnectionInstance) {
        initiatorConnectionInstance = new RTCPeerConnection(GLOBAL_PEER_CONFIGURATION, PEER_CONNECTION_AUXILIARY_SETTINGS);
        configureInitiatorPeerEventHandlers();
    }

    try {
        const fileReceiverForInitiator = new FileTransferRecipient(); // Handles incoming file parts on this side.
        initiatorPrimaryDataChannel = initiatorConnectionInstance.createDataChannel('primary_comm_channel', { reliable: true });
        activeDataChannelReference = initiatorPrimaryDataChannel; // Set as the currently active channel.
        console.debug("Initiator created data channel ('primary_comm_channel').");

        initiatorPrimaryDataChannel.onopen = (event) => {
            console.info('Initiator data channel has transitioned to an open state.');
            adjustModalVisibility(USER_INTERFACE_ELEMENTS.MODAL_CONNECTION_PENDING, false);
            $(USER_INTERFACE_ELEMENTS.MODAL_CONNECTION_PENDING).remove(); // Remove from DOM to prevent re-display.
            appendToChatLog("Data channel successfully established.", MESSAGE_DISPLAY_STYLES.SUCCESS_INDICATION);
            $(USER_INTERFACE_ELEMENTS.INPUT_CHAT_MESSAGE).trigger('focus'); // Focus on chat input.
        };

        initiatorPrimaryDataChannel.onmessage = (event) => {
            console.debug("Received message on initiator's data channel:", event.data);
            processIncomingDataChannelMessage(event.data, fileReceiverForInitiator);
        };

        initiatorPrimaryDataChannel.onclose = () => {
            console.warn("Initiator data channel has been closed.");
            appendToChatLog("Data channel disconnected.", MESSAGE_DISPLAY_STYLES.ERROR_ALERT);
        };

        initiatorPrimaryDataChannel.onerror = (channelError) => {
            console.error("Initiator data channel encountered an error:", channelError);
            appendToChatLog(`Data channel error: ${channelError.message}`, MESSAGE_DISPLAY_STYLES.ERROR_ALERT);
        };

    } catch (channelCreationError) {
        console.error("Failed to create data channel for initiator:", channelCreationError);
        appendToChatLog(`Error creating data channel: ${channelCreationError.message}`, MESSAGE_DISPLAY_STYLES.ERROR_ALERT);
    }
}

/**
 * Asynchronously generates the local session offer (SDP) for the initiating peer.
 * This involves creating the RTCPeerConnection and DataChannel if not present,
 * then executing the WebRTC signaling flow for offer creation.
 */
async function initiateSessionOfferGeneration() {
    // Ensure the peer connection is ready.
    if (!initiatorConnectionInstance) {
        initiatorConnectionInstance = new RTCPeerConnection(GLOBAL_PEER_CONFIGURATION, PEER_CONNECTION_AUXILIARY_SETTINGS);
        configureInitiatorPeerEventHandlers();
    }
    initializeInitiatorDataChannel(); // Data channel must be created before the offer.

    try {
        const sessionOffer = await initiatorConnectionInstance.createOffer();
        await initiatorConnectionInstance.setLocalDescription(sessionOffer);
        console.info("Local session offer successfully generated:", sessionOffer);

        // Display the generated offer in the UI for manual exchange.
        $(USER_INTERFACE_ELEMENTS.DIV_LOCAL_OFFER_SDP).html(JSON.stringify(initiatorConnectionInstance.localDescription, null, 2));
        appendToChatLog("Local session offer is ready.", MESSAGE_DISPLAY_STYLES.SUCCESS_INDICATION);

    } catch (offerError) {
        console.error("Failed to generate local session offer:", offerError);
        appendToChatLog(`Error creating session offer: ${offerError.message}`, MESSAGE_DISPLAY_STYLES.ERROR_ALERT);
    }
}

/**
 * Configures all essential event handlers for the initiator's RTCPeerConnection.
 * This includes ICE candidate management and various connection state transitions.
 */
function configureInitiatorPeerEventHandlers() {
    if (!initiatorConnectionInstance) {
        console.warn("Attempted to configure event handlers on a null initiator peer connection.");
        return;
    }

    initiatorConnectionInstance.onicecandidate = (iceEvent) => {
        // ICE candidates are crucial for discovering network paths between peers.
        if (iceEvent.candidate) {
            console.debug("Initiator ICE candidate discovered:", iceEvent.candidate);
            // In a production environment, this candidate would be sent to the remote peer via a signaling server.
        } else {
            // A null candidate indicates that ICE gathering is complete.
            console.info("Initiator ICE candidate gathering process finished.");
            // At this point, the local description (offer) is fully stable.
            // (The UI update for local offer happens in `initiateSessionOfferGeneration`.)
        }
    };

    // Assign generic state change logging functions.
    initiatorConnectionInstance.onconnectionstatechange = handlePeerConnectionStateChange;
    initiatorConnectionInstance.onsignalingstatechange = logSignalingStateTransition;
    initiatorConnectionInstance.oniceconnectionstatechange = logIceConnectionStateTransition;
    initiatorConnectionInstance.onicegatheringstatechange = logIceGatheringStateTransition;
}

/**
 * Generic handler for RTCPeerConnection's `connectionstatechange` event.
 * Updates the UI and logs the connection status.
 */
function handlePeerConnectionStateChange() {
    const currentState = initiatorConnectionInstance ? initiatorConnectionInstance.connectionState :
                         responderConnectionInstance ? responderConnectionInstance.connectionState : 'unknown';
    console.info(`Peer connection state updated to: ${currentState}`);

    if (currentState === 'connected') {
        appendToChatLog("Peer connection successfully established!", MESSAGE_DISPLAY_STYLES.SUCCESS_INDICATION);
        adjustModalVisibility(USER_INTERFACE_ELEMENTS.MODAL_CONNECTION_PENDING, false);
        // Remove the modal from the DOM to prevent it from interfering with future UI flows.
        $(USER_INTERFACE_ELEMENTS.MODAL_CONNECTION_PENDING).remove();
        adjustModalVisibility(USER_INTERFACE_ELEMENTS.MODAL_LOCAL_ANSWER_VIEW, false); // Hide answer display if shown.
        $(USER_INTERFACE_ELEMENTS.INPUT_CHAT_MESSAGE).trigger('focus'); // Direct focus to the chat input.
    } else {
        appendToChatLog(`Connection state: ${currentState}`, MESSAGE_DISPLAY_STYLES.GENERAL_INFORMATION);
    }
}

/**
 * Logs changes in the RTCPeerConnection's signaling state.
 * @param {Event} stateChangeEvent - The event object for signaling state change.
 */
function logSignalingStateTransition(stateChangeEvent) {
    const state = stateChangeEvent.target.signalingState;
    console.debug('Signaling state changed to:', state);
    appendToChatLog(`Signaling state: ${state}`, MESSAGE_DISPLAY_STYLES.GENERAL_INFORMATION);
}

/**
 * Logs changes in the RTCPeerConnection's ICE connection state.
 * @param {Event} stateChangeEvent - The event object for ICE connection state change.
 */
function logIceConnectionStateTransition(stateChangeEvent) {
    const state = stateChangeEvent.target.iceConnectionState;
    console.debug('ICE connection state changed to:', state);
    appendToChatLog(`ICE connection state: ${state}`, MESSAGE_DISPLAY_STYLES.GENERAL_INFORMATION);
}

/**
 * Logs changes in the RTCPeerConnection's ICE gathering state.
 * @param {Event} stateChangeEvent - The event object for ICE gathering state change.
 */
function logIceGatheringStateTransition(stateChangeEvent) {
    const state = stateChangeEvent.target.iceGatheringState;
    console.debug('ICE gathering state changed to:', state);
    appendToChatLog(`ICE gathering state: ${state}`, MESSAGE_DISPLAY_STYLES.GENERAL_INFORMATION);
}

/**
 * Processes a remote session answer received from the responding peer.
 * Applies this answer as the remote description for the initiator's connection.
 * @param {RTCSessionDescription} remoteAnswerSDP - The session description representing the remote answer.
 */
async function handleRemoteSessionAnswer(remoteAnswerSDP) {
    if (!initiatorConnectionInstance) {
        console.error("Initiator peer connection is not initialized to handle remote answer.");
        appendToChatLog("Error: Initiator not ready for remote answer.", MESSAGE_DISPLAY_STYLES.ERROR_ALERT);
        return;
    }
    console.info("Applying received remote session answer:", remoteAnswerSDP);
    appendToChatLog("Remote session answer applied.", MESSAGE_DISPLAY_STYLES.SUCCESS_INDICATION);
    try {
        await initiatorConnectionInstance.setRemoteDescription(remoteAnswerSDP);
        console.debug("Remote answer successfully set on initiator.");
    } catch (setDescError) {
        console.error("Failed to set remote answer on initiator:", setDescError);
        appendToChatLog(`Error applying remote answer: ${setDescError.message}`, MESSAGE_DISPLAY_STYLES.ERROR_ALERT);
    }
}

/**
 * Adds an ICE candidate received from the responding peer to the initiator's connection.
 * @param {RTCIceCandidate} iceCandidateObject - The ICE candidate object to add.
 */
async function addRemoteIceCandidateToInitiator(iceCandidateObject) {
    if (!initiatorConnectionInstance) {
        console.error("Initiator peer connection not ready to add remote ICE candidate.");
        return;
    }
    try {
        await initiatorConnectionInstance.addIceCandidate(iceCandidateObject);
        console.debug("Remote ICE candidate added by initiator.");
    } catch (addCandidateError) {
        console.error("Error adding remote ICE candidate to initiator:", addCandidateError);
    }
}


// --- Responder Peer (Bob) Global Variables ---
let responderConnectionInstance = null; // RTCPeerConnection for the responding side.
let responderReceivedDataChannel = null; // The DataChannel received by the responder.

// The `pc2icedone` flag from the original code was unused and has been removed.

/**
 * Sets up the RTCPeerConnection for the responding peer, including
 * its event handlers, specifically for handling incoming data channels.
 */
function configureResponderPeerConnection() {
    if (!responderConnectionInstance) {
        responderConnectionInstance = new RTCPeerConnection(GLOBAL_PEER_CONFIGURATION, PEER_CONNECTION_AUXILIARY_SETTINGS);

        // This event fires when the initiating peer creates a DataChannel.
        responderConnectionInstance.ondatachannel = (dataChannelEvent) => {
            // Normalize for browser differences (Chrome sends event.channel, FF sends raw channel).
            const incomingChannel = dataChannelEvent.channel || dataChannelEvent;
            console.info("Responder received an incoming data channel:", incomingChannel);
            responderReceivedDataChannel = incomingChannel;
            activeDataChannelReference = responderReceivedDataChannel; // Set as the active channel.

            const fileReceiverForResponder = new FileTransferRecipient(); // Manages incoming file parts.

            responderReceivedDataChannel.onopen = () => {
                console.info('Responder data channel is now open and operational.');
                adjustModalVisibility(USER_INTERFACE_ELEMENTS.MODAL_CONNECTION_PENDING, false);
                $(USER_INTERFACE_ELEMENTS.MODAL_CONNECTION_PENDING).remove();
                appendToChatLog("Data channel established successfully.", MESSAGE_DISPLAY_STYLES.SUCCESS_INDICATION);
            };

            responderReceivedDataChannel.onmessage = (messageEvent) => {
                console.debug("Received message on responder's data channel:", messageEvent.data);
                processIncomingDataChannelMessage(messageEvent.data, fileReceiverForResponder);
            };

            responderReceivedDataChannel.onclose = () => {
                console.warn("Responder data channel has been closed.");
                appendToChatLog("Data channel disconnected.", MESSAGE_DISPLAY_STYLES.ERROR_ALERT);
            };

            responderReceivedDataChannel.onerror = (channelError) => {
                console.error("Responder data channel encountered an error:", channelError);
                appendToChatLog(`Data channel error: ${channelError.message}`, MESSAGE_DISPLAY_STYLES.ERROR_ALERT);
            };
        };

        // Attach ICE candidate handler for the responder.
        responderConnectionInstance.onicecandidate = (iceEvent) => {
            if (iceEvent.candidate) {
                console.debug("Responder ICE candidate discovered:", iceEvent.candidate);
                // This candidate should be sent to the initiator via signaling.
            } else {
                console.info("Responder ICE candidate gathering process finished.");
                // The local description (answer) is now stable and can be shared.
                $(USER_INTERFACE_ELEMENTS.DIV_LOCAL_ANSWER_SDP).html(JSON.stringify(responderConnectionInstance.localDescription, null, 2));
            }
        };

        // Assign common state change logging functions to the responder.
        responderConnectionInstance.onsignalingstatechange = logSignalingStateTransition;
        responderConnectionInstance.oniceconnectionstatechange = logIceConnectionStateTransition;
        responderConnectionInstance.onicegatheringstatechange = logIceGatheringStateTransition;
        responderConnectionInstance.onconnectionstatechange = handlePeerConnectionStateChange; // Reuse generic handler.

        // Handler for incoming media tracks (if media streams were part of the offer).
        responderConnectionInstance.ontrack = (mediaTrackEvent) => {
            console.info("Received remote media stream track:", mediaTrackEvent.track);
            const audioOutputElement = new Audio(); // Create an audio element.
            audioOutputElement.autoplay = true;
            // `attachMediaStream` is typically provided by a WebRTC adapter.js shim.
            if (typeof attachMediaStream === 'function') {
                attachMediaStream(audioOutputElement, mediaTrackEvent.streams[0]);
                appendToChatLog("Remote media stream received.", MESSAGE_DISPLAY_STYLES.SUCCESS_INDICATION);
            } else {
                console.warn("`attachMediaStream` utility not found; cannot render remote stream.");
                appendToChatLog("Warning: Remote media stream received but cannot be displayed.", MESSAGE_DISPLAY_STYLES.GENERAL_INFORMATION);
            }
        };
    }
}

/**
 * Processes an incoming session offer (SDP) from the initiating peer.
 * Sets the remote description and then generates a local answer.
 * @param {RTCSessionDescription} receivedOfferSDP - The session description received from the initiator.
 */
async function processIncomingSessionOffer(receivedOfferSDP) {
    configureResponderPeerConnection(); // Ensure responder PC is initialized before processing.
    if (!responderConnectionInstance) {
        console.error("Responder peer connection is not initialized to handle remote offer.");
        appendToChatLog("Error: Responder not ready for remote offer.", MESSAGE_DISPLAY_STYLES.ERROR_ALERT);
        return;
    }

    console.info("Applying received remote session offer:", receivedOfferSDP);
    appendToChatLog("Remote session offer applied.", MESSAGE_DISPLAY_STYLES.SUCCESS_INDICATION);
    try {
        await responderConnectionInstance.setRemoteDescription(receivedOfferSDP);
        const sessionAnswer = await responderConnectionInstance.createAnswer();
        await responderConnectionInstance.setLocalDescription(sessionAnswer);
        console.info("Local session answer generated:", sessionAnswer);
        appendToChatLog("Local session answer generated.", MESSAGE_DISPLAY_STYLES.SUCCESS_INDICATION);

        // Display the generated answer in the UI for manual exchange.
        $(USER_INTERFACE_ELEMENTS.DIV_LOCAL_ANSWER_SDP).html(JSON.stringify(responderConnectionInstance.localDescription, null, 2));
    } catch (offerProcessingError) {
        console.error("Failed to process remote offer or create answer:", offerProcessingError);
        appendToChatLog(`Error handling offer: ${offerProcessingError.message}`, MESSAGE_DISPLAY_STYLES.ERROR_ALERT);
    }
}

/**
 * Adds an ICE candidate received from the initiating peer to the responder's connection.
 * @param {RTCIceCandidate} iceCandidateFromInitiator - The ICE candidate object from the initiator.
 */
async function addInitiatorIceCandidateToResponder(iceCandidateFromInitiator) {
    if (!responderConnectionInstance) {
        console.error("Responder peer connection not ready to add initiator ICE candidate.");
        return;
    }
    try {
        await responderConnectionInstance.addIceCandidate(iceCandidateFromInitiator);
        console.debug("Initiator ICE candidate added by responder.");
    } catch (addCandidateError) {
        console.error("Error adding initiator ICE candidate to responder:", addCandidateError);
    }
}

/**
 * Centralized function to process any incoming message received on a DataChannel.
 * It intelligently distinguishes between file data and structured chat messages.
 * @param {string|Blob} receivedData - The raw data received from the channel.
 * @param {FileTransferRecipient} fileHandlerInstance - An instance of the file receiver for handling file blobs.
 */
function processIncomingDataChannelMessage(receivedData, fileHandlerInstance) {
    // If the data is a Blob, it's likely a file chunk.
    if (receivedData instanceof Blob) {
        fileHandlerInstance.receive(receivedData, {}); // Delegate to the file receiver.
        return;
    }

    // Attempt to parse the data as JSON for structured messages.
    const parsedMessage = parseJsonSafely(receivedData);

    // Check for a specific chat message structure.
    if (parsedMessage && parsedMessage.type === 'chat_message' && typeof parsedMessage.content === 'string') {
        appendToChatLog(parsedMessage.content, MESSAGE_DISPLAY_STYLES.GENERAL_INFORMATION);
        scrollChatToBottom();
    }
    // Placeholder for a more complex file transfer protocol, e.g., metadata messages.
    else if (parsedMessage && parsedMessage.type === 'file_metadata') {
        console.debug("Received file metadata:", parsedMessage);
        // fileHandlerInstance.processMetadata(parsedMessage);
    }
    else {
        // Handle unexpected or non-JSON string data.
        // The original code had a specific check for ASCII 2 from Firefox.
        if (typeof receivedData === 'string' && receivedData.charCodeAt(0) === 2) {
            console.warn("Received a peculiar ASCII 2 character. Ignoring this browser quirk.");
            return;
        }
        console.warn("Received unhandled or malformed data channel message:", receivedData);
        appendToChatLog("Received an unrecognized message format.", MESSAGE_DISPLAY_STYLES.GENERAL_INFORMATION);
    }
}

/**
 * Generates a formatted timestamp string (HH:MM:SS) for chat messages.
 * @returns {string} The formatted timestamp.
 */
function getFormattedCurrentTimestamp() {
    const currentTime = new Date();
    // Helper to left-pad numbers with a leading zero if less than 10.
    const padNumber = (number) => number < 10 ? `0${number}` : number;

    const hours = padNumber(currentTime.getHours());
    const minutes = padNumber(currentTime.getMinutes());
    const seconds = padNumber(currentTime.getSeconds());

    return `${hours}:${minutes}:${seconds}`;
}

/**
 * Appends a new message entry to the chat history display area.
 * @param {string} messageContent - The text content of the message.
 * @param {string} cssClass - The CSS class to apply for styling (e.g., 'text-info').
 */
function appendToChatLog(messageContent, cssClass) {
    const timestamp = getFormattedCurrentTimestamp();
    const chatEntryHtml = `<p class="${cssClass}">[${timestamp}] ${messageContent}</p>`;
    $(USER_INTERFACE_ELEMENTS.DIV_CONVERSATION_HISTORY).append(chatEntryHtml);
    // Scrolling is now handled by a dedicated function for better separation of concerns.
}

/**
 * Scrolls the chat history display element to its very bottom,
 * ensuring the most recent messages are always visible.
 */
function scrollChatToBottom() {
    const chatHistoryDiv = $(USER_INTERFACE_ELEMENTS.DIV_CONVERSATION_HISTORY);
    if (chatHistoryDiv.length) { // Ensure the element exists before attempting to scroll.
        chatHistoryDiv.scrollTop(chatHistoryDiv[0].scrollHeight);
    }
}

// Entry point: Execute initialization logic once the DOM is fully loaded.
$(document).ready(() => {
    initializeUserInterface();
    // The responder's peer connection setup is deferred until an offer is received,
    // which is more resource-efficient than initializing both peers immediately.
});

// A conceptual global state object (not heavily utilized in this example,
// but useful for more complex application state management).
const applicationState = {
    isConnected: false,
    currentRole: null // Could be 'initiator' or 'responder'
};

// Potential future enhancements:
// - Implement a robust signaling server for SDP and ICE candidate exchange.
// - Add user authentication and session management.
// - Integrate a more advanced logging framework.
// - Abstract UI components into reusable modules.
// - Implement automated testing for WebRTC flows.