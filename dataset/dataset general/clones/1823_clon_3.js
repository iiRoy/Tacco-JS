((globalContext) => {

    // --- Internal Utility: A basic Event Emitter for extending functionality ---
    /**
     * @class EventDispatcher
     * @description A fundamental class to manage event subscriptions and notifications.
     * Provides methods to attach, detach, and trigger event listeners.
     */
    class EventDispatcher {
        constructor() {
            /** @private @type {Map<string, Set<Function>>} */
            this._eventSubscribers = new Map();
        }

        /**
         * Registers a listener function to be invoked when a specific event occurs.
         * @param {string} eventName - The name of the event to listen for.
         * @param {Function} handlerFunction - The function to execute when the event is dispatched.
         * @returns {this} The current instance for chaining.
         */
        subscribe(eventName, handlerFunction) {
            if (typeof handlerFunction !== 'function') {
                console.warn(`Attempted to subscribe with a non-function handler for event: ${eventName}`);
                return this;
            }
            if (!this._eventSubscribers.has(eventName)) {
                this._eventSubscribers.set(eventName, new Set());
            }
            this._eventSubscribers.get(eventName).add(handlerFunction);
            return this;
        }

        /**
         * Registers a listener function that will be invoked only once for a specific event, then automatically removed.
         * @param {string} eventName - The name of the event to listen for.
         * @param {Function} handlerFunction - The function to execute once when the event is dispatched.
         * @returns {this} The current instance for chaining.
         */
        subscribeOnce(eventName, handlerFunction) {
            if (typeof handlerFunction !== 'function') {
                console.warn(`Attempted to subscribeOnce with a non-function handler for event: ${eventName}`);
                return this;
            }
            const oneTimeWrapper = (...args) => {
                handlerFunction(...args);
                this.unsubscribe(eventName, oneTimeWrapper);
            };
            // Attach a reference to the original handler to the wrapper for proper removal
            oneTimeWrapper._originalHandler = handlerFunction;
            return this.subscribe(eventName, oneTimeWrapper);
        }

        /**
         * Removes a previously registered event listener.
         * If no handlerFunction is provided, all listeners for the given eventName are removed.
         * If no eventName is provided, all listeners for all events are removed.
         * @param {string=} eventName - The name of the event from which to remove listeners.
         * @param {Function=} handlerFunction - The specific function to remove.
         * @returns {this} The current instance for chaining.
         */
        unsubscribe(eventName, handlerFunction) {
            if (!eventName) { // No eventName, clear all
                this._eventSubscribers.clear();
                return this;
            }

            const handlers = this._eventSubscribers.get(eventName);
            if (!handlers) {
                return this; // No handlers for this event
            }

            if (!handlerFunction) { // No specific handler, clear all for this event
                this._eventSubscribers.delete(eventName);
            } else {
                // Find and remove the handler, including 'once' wrappers
                for (const h of handlers) {
                    if (h === handlerFunction || (h._originalHandler && h._originalHandler === handlerFunction)) {
                        handlers.delete(h);
                        break;
                    }
                }
                if (handlers.size === 0) {
                    this._eventSubscribers.delete(eventName);
                }
            }
            return this;
        }

        /**
         * Dispatches an event, invoking all registered listeners for that event.
         * @protected
         * @param {string} eventName - The name of the event to dispatch.
         * @param {object} [eventPayload={}] - An object containing event-specific data to pass to listeners.
         */
        _dispatch(eventName, eventPayload = {}) {
            const handlers = this._eventSubscribers.get(eventName);
            if (handlers) {
                // Create a snapshot of handlers to prevent issues if handlers modify the list
                [...handlers].forEach(handler => {
                    try {
                        handler({ eventType: eventName, ...eventPayload });
                    } catch (e) {
                        console.error(`Error in event handler for '${eventName}':`, e);
                    }
                });
            }
        }
    }

    // --- Core Communication Classes ---

    /**
     * @summary Manages a specific media resource (audio/video stream) within a communication context.
     * @constructor
     * @memberOf teleCom
     * @param {MediaStream} underlyingStreamObj - The native WebRTC MediaStream object this resource wraps.
     * @property {string} _uniqueResourceId - An internal identifier for this media resource.
     * @property {MediaStream} _wrappedMediaStream - The actual WebRTC MediaStream object.
     * @property {boolean} _isTransmissionActive - Internal flag indicating if the stream is currently sending data.
     */
    function MediaResource(underlyingStreamObj) {
        if (!underlyingStreamObj || !(underlyingStreamObj instanceof MediaStream)) {
            // A basic guard clause for input validation
            throw new Error("MediaResource: Invalid or missing MediaStream object provided.");
        }

        /** @private */
        this._uniqueResourceId = `res-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        /** @private */
        this._wrappedMediaStream = underlyingStreamObj;
        /** @private */
        this._isTransmissionActive = true; // Assume active by default

        /**
         * @summary Determines the primary media kind (e.g., "audio", "video") represented by this resource.
         * If the stream contains multiple tracks, this might return a primary type or a combined string.
         * @returns {string} The dominant media type (e.g., "audio", "video", "mixed").
         */
        this.getMediaType = function() {
            if (this._wrappedMediaStream.getAudioTracks().length > 0 && this._wrappedMediaStream.getVideoTracks().length > 0) {
                return "mixed"; // Placeholder, could be more sophisticated
            } else if (this._wrappedMediaStream.getAudioTracks().length > 0) {
                return "audio";
            } else if (this._wrappedMediaStream.getVideoTracks().length > 0) {
                return "video";
            }
            return "unknown";
        };

        /**
         * @summary Resumes the flow of media data after a prior pause or stop.
         * This operation attempts to re-enable all tracks within the wrapped MediaStream.
         */
        this.restartTransmission = function() {
            if (!this._isTransmissionActive) {
                this._wrappedMediaStream.getTracks().forEach(track => {
                    track.enabled = true; // Re-enable all tracks
                });
                this._isTransmissionActive = true;
                console.info(`MediaResource ${this._uniqueResourceId}: Transmission restarted.`);
            } else {
                console.log(`MediaResource ${this._uniqueResourceId}: Transmission already active.`);
            }
        };

        /**
         * @summary Halts the transmission of media data for this resource.
         * This typically involves disabling all tracks without necessarily stopping the stream entirely.
         */
        this.haltTransmission = function() {
            if (this._isTransmissionActive) {
                this._wrappedMediaStream.getTracks().forEach(track => {
                    track.enabled = false; // Disable all tracks
                });
                this._isTransmissionActive = false;
                console.info(`MediaResource ${this._uniqueResourceId}: Transmission halted.`);
            } else {
                console.log(`MediaResource ${this._uniqueResourceId}: Transmission already halted.`);
            }
        };

        /**
         * @summary Retrieves the underlying WebRTC MediaStream object.
         * This allows direct interaction with the native browser API if needed.
         * @returns {MediaStream} The raw WebRTC MediaStream instance.
         */
        this.getRawStream = function() {
            return this._wrappedMediaStream;
        };
    }

    /**
     * @classdesc Handles the lifecycle and events of a user's communication session with a backend service.
     * Session objects are typically instantiated via a factory method on the primary `teleCom` namespace.
     * @summary Manages global connectivity and session-level interactions for a given user.
     * @augments EventDispatcher
     * @constructor
     * @memberOf teleCom
     */
    class CommsSession extends EventDispatcher {
        constructor() {
            super();
            /** @private @type {string} */
            this._sessionIdentifier = `sess-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
            /** @private @type {string} */
            this._connectionState = "uninitialized"; // Possible states: "uninitialized", "connecting", "active", "terminated"
            /** @private @type {Map<string, TeleCall>} */
            this._activeCalls = new Map(); // Stores active call instances

            console.log(`CommsSession ${this._sessionIdentifier} created.`);
        }

        /**
         * @summary Initiates the communication session, attempting to connect to the gateway server.
         * This method will trigger various events like "connecting" and "active" upon status changes.
         * @param {string} userIdentity - The user's identifier for authentication.
         * @param {string} userCredentials - The password or token for authentication.
         * @param {object} [sessionConfig={}] - Optional configuration for the session, e.g., server URLs.
         * @returns {Promise<void>} A promise that resolves if connection is successful, rejects otherwise.
         */
        async establishConnection(userIdentity, userCredentials, sessionConfig = {}) {
            if (this._connectionState === "active" || this._connectionState === "connecting") {
                console.warn("Connection already active or in progress.");
                return Promise.resolve();
            }

            this._updateConnectionState("connecting");
            this._dispatch("connecting", { userId: userIdentity });

            // Placeholder for actual connection logic
            console.log(`Attempting to establish session for ${userIdentity}...`);
            await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay

            const isAuthSuccessful = Math.random() > 0.1; // Simulate 90% success rate
            if (isAuthSuccessful) {
                this._updateConnectionState("active");
                this._dispatch("active", { userId: userIdentity });
                console.log(`Session ${this._sessionIdentifier} connected for ${userIdentity}.`);
            } else {
                this._updateConnectionState("terminated");
                const errorDetails = {
                    errorCode: teleCom.ConnectionErrorCodes.AUTHENTICATION_FAILED,
                    errorDescription: "Invalid user credentials or authentication failure."
                };
                this._dispatch("error", { ...errorDetails, userId: userIdentity });
                this._dispatch("terminated", { userId: userIdentity });
                console.error(`Session ${this._sessionIdentifier} failed to connect: ${errorDetails.errorDescription}`);
                throw new Error(errorDetails.errorDescription);
            }
        }

        /**
         * @summary Creates and returns a new call instance for communicating with specified recipients.
         * @param {string|string[]} targetRecipients - The identifier(s) of the call recipient(s). Can be a single string or an array.
         * @param {string} streamTypesDesired - Comma-separated list of media types (e.g., "audio", "video") to request for the call.
         * @returns {teleCom.TeleCall} A new instance of a TeleCall object.
         */
        initiateNewCall(targetRecipients, streamTypesDesired) {
            if (this._connectionState !== "active") {
                console.warn("Cannot create a call: Session is not active.");
                // Optionally throw an error or return null
                throw new Error("Session not active, unable to initiate call.");
            }

            const newCall = new TeleCall(this._sessionIdentifier, targetRecipients, streamTypesDesired);
            this._activeCalls.set(newCall.getCallIdentifier(), newCall);

            // Example of an incoming call event (simulated)
            if (Math.random() > 0.8) { // Simulate an incoming call from somewhere else
                setTimeout(() => {
                    const incomingCall = new TeleCall(this._sessionIdentifier, "some_remote_user", "audio,video");
                    this._activeCalls.set(incomingCall.getCallIdentifier(), incomingCall);
                    this._dispatch("incomingCall", {
                        relatedCall: incomingCall,
                        mediaKinds: incomingCall.getRequestedMediaTypes(),
                        participantId: incomingCall.getActiveParticipants()[0]?.participantIdentifier // First participant
                    });
                    console.log(`Simulated incoming call received: ${incomingCall.getCallIdentifier()}`);
                }, 3000);
            }

            return newCall;
        }

        /**
         * @summary Terminates the active communication session with the gateway server.
         * All active calls associated with this session will also be ended.
         * @returns {Promise<void>} A promise that resolves when the session is successfully terminated.
         */
        async terminateConnection() {
            if (this._connectionState === "terminated" || this._connectionState === "uninitialized") {
                console.warn("Session already terminated or not initialized.");
                return Promise.resolve();
            }

            this._updateConnectionState("terminating");
            console.log(`Terminating session ${this._sessionIdentifier}...`);

            // End all associated calls gracefully
            for (const call of this._activeCalls.values()) {
                await call.endCall(); // Ensure calls are ended
            }
            this._activeCalls.clear();

            await new Promise(resolve => setTimeout(resolve, 500)); // Simulate cleanup time

            this._updateConnectionState("terminated");
            this._dispatch("terminated", { sessionId: this._sessionIdentifier });
            console.log(`Session ${this._sessionIdentifier} terminated.`);
        }

        /**
         * @summary Retrieves the current operational status of this communication session.
         * @returns {string} One of: "uninitialized", "connecting", "active", "terminated".
         */
        getCurrentStatus() {
            return this._connectionState;
        }

        /**
         * @private
         * @param {string} newState - The new state to set.
         */
        _updateConnectionState(newState) {
            if (this._connectionState !== newState) {
                console.log(`Session ${this._sessionIdentifier} state changed from '${this._connectionState}' to '${newState}'`);
                this._connectionState = newState;
            }
        }
    }

    /**
     * @classdesc Manages the specifics of an individual voice/video call, whether incoming or outgoing.
     * Call objects are obtained through `teleCom.CommsSession.initiateNewCall` or from an incoming call event.
     * @summary Provides methods for controlling an active communication call.
     * @augments EventDispatcher
     * @constructor
     * @memberOf teleCom
     * @param {string} parentSessionId - The ID of the session this call belongs to.
     * @param {string|string[]} recipients - The initial target recipients for the call.
     * @param {string} requestedMedia - Comma-separated media types requested for the call.
     */
    class TeleCall extends EventDispatcher {
        constructor(parentSessionId, recipients, requestedMedia) {
            super();
            /** @private @type {string} */
            this._callIdentifier = `call-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
            /** @private @type {string} */
            this._parentSessionId = parentSessionId;
            /** @private @type {Array<ParticipantInfo>} */
            this._activeParticipants = this._normalizeRecipients(recipients);
            /** @private @type {string} */
            this._requestedMediaTypes = requestedMedia || "audio,video";
            /** @private @type {string} */
            this._callStatus = "pending"; // States: "pending", "dialing", "established", "onHold", "ended", "rejected"
            /** @private @type {Array<MediaResource>} */
            this._localAttachedResources = [];
            /** @private @type {Array<MediaResource>} */
            this._remoteAttachedResources = [];
            /** @private @type {boolean} */
            this._isLocallyHeld = false;
            /** @private @type {boolean} */
            this._isRemotelyHeld = false;

            console.log(`TeleCall ${this._callIdentifier} created with recipients: ${JSON.stringify(this._activeParticipants.map(p => p.participantIdentifier))}`);
        }

        /**
         * @private
         * @param {string|string[]} recipients - The recipients list.
         * @returns {Array<ParticipantInfo>} Normalized array of participant info.
         */
        _normalizeRecipients(recipients) {
            const recipientArray = Array.isArray(recipients) ? recipients : [recipients];
            return recipientArray.map(id => ({ participantIdentifier: String(id) }));
        }

        /**
         * @summary Retrieves the unique identifier for this particular call instance.
         * @returns {string} The unique ID of the call.
         */
        getCallIdentifier() {
            return this._callIdentifier;
        }

        /**
         * @summary Retrieves the list of known participants currently connected to this call.
         * @returns {Array<ParticipantInfo>} An array of objects, each describing a participant.
         */
        getActiveParticipants() {
            // Return a clone to prevent external modification of internal state
            return [...this._activeParticipants];
        }

        /**
         * @summary Attaches a local media resource (e.g., webcam or microphone stream) to the call.
         * This should typically be done before attempting to connect the call.
         * @param {(MediaResource|MediaStream)} mediaItem - The media resource object or a raw WebRTC MediaStream.
         */
        attachMediaResource(mediaItem) {
            let resourceToAdd;
            if (mediaItem instanceof MediaResource) {
                resourceToAdd = mediaItem;
            } else if (mediaItem instanceof MediaStream) {
                resourceToAdd = new MediaResource(mediaItem);
            } else {
                console.error("Invalid media item provided for attachment. Must be MediaResource or MediaStream.");
                return;
            }

            // Prevent adding the same resource twice
            if (this._localAttachedResources.some(res => res.getRawStream().id === resourceToAdd.getRawStream().id)) {
                console.warn(`Media resource with ID ${resourceToAdd.getRawStream().id} is already attached.`);
                return;
            }

            this._localAttachedResources.push(resourceToAdd);
            console.log(`Media resource ${resourceToAdd._uniqueResourceId} attached to call ${this._callIdentifier}.`);
        }

        /**
         * @summary Removes a local media resource from the call.
         * @param {(MediaResource|MediaStream|string)} mediaReference - The MediaResource instance, its underlying MediaStream, or the stream's ID.
         * @returns {boolean} True if a matching resource was found and removed, false otherwise.
         */
        detachMediaResource(mediaReference) {
            let targetId = '';
            if (mediaReference instanceof MediaResource) {
                targetId = mediaReference.getRawStream().id;
            } else if (mediaReference instanceof MediaStream) {
                targetId = mediaReference.id;
            } else if (typeof mediaReference === 'string') {
                targetId = mediaReference;
            } else {
                console.error("Invalid media reference provided for detachment.");
                return false;
            }

            const initialLength = this._localAttachedResources.length;
            this._localAttachedResources = this._localAttachedResources.filter(res => res.getRawStream().id !== targetId);

            if (this._localAttachedResources.length < initialLength) {
                console.log(`Media resource with ID ${targetId} detached from call ${this._callIdentifier}.`);
                return true;
            }
            console.warn(`No media resource with ID ${targetId} found to detach from call ${this._callIdentifier}.`);
            return false;
        }

        /**
         * @summary Initiates an outgoing call or accepts an incoming call.
         * This method handles the signaling and WebRTC peer connection establishment.
         * @returns {Promise<void>} A promise that resolves when the call is established, rejects on failure.
         */
        async initiateOrAccept() {
            if (this._callStatus === "established" || this._callStatus === "dialing") {
                console.warn("Call is already established or in progress.");
                return Promise.resolve();
            }

            this._updateCallState("dialing");
            this._dispatch("dialing", { relatedCall: this });
            console.log(`Call ${this._callIdentifier}: Attempting to connect...`);

            // Simulate signaling and connection setup
            await new Promise(resolve => setTimeout(resolve, 2000));

            const connectionSuccessful = Math.random() > 0.05; // Simulate 95% success

            if (connectionSuccessful) {
                this._updateCallState("established");
                this._dispatch("established", { relatedCall: this });
                console.log(`Call ${this._callIdentifier} established.`);

                // Simulate remote stream addition
                if (Math.random() > 0.5) {
                    setTimeout(() => {
                        const dummyRemoteStream = new MediaStream();
                        const remoteMediaResource = new MediaResource(dummyRemoteStream);
                        this._remoteAttachedResources.push(remoteMediaResource);
                        this._dispatch("resourceAdded", { relatedCall: this, mediaResource: remoteMediaResource, isRemote: true });
                        console.log(`Simulated remote media resource added to call ${this._callIdentifier}.`);
                    }, 1000);
                }
            } else {
                this._updateCallState("ended"); // Or "failed"
                const errorDetails = {
                    errorCode: teleCom.CommsErrorCodes.NETWORK_ERROR,
                    errorDescription: "Failed to establish call connection."
                };
                this._dispatch("error", { ...errorDetails, relatedCall: this });
                this._dispatch("ended", { relatedCall: this });
                console.error(`Call ${this._callIdentifier} failed to connect: ${errorDetails.errorDescription}`);
                throw new Error(errorDetails.errorDescription);
            }
        }

        /**
         * @summary Terminates an active call.
         * This will clean up all associated media resources and peer connections.
         * @returns {Promise<void>} A promise that resolves when the call is fully ended.
         */
        async endCall() {
            if (this._callStatus === "ended") {
                console.warn("Call already ended.");
                return Promise.resolve();
            }

            console.log(`Call ${this._callIdentifier}: Ending call...`);
            // Clean up resources (e.g., stop tracks, close peer connection)
            this._localAttachedResources.forEach(res => res.getRawStream().getTracks().forEach(track => track.stop()));
            this._localAttachedResources = [];
            this._remoteAttachedResources = [];

            await new Promise(resolve => setTimeout(resolve, 300)); // Simulate cleanup

            this._updateCallState("ended");
            this._dispatch("ended", { relatedCall: this });
            console.log(`Call ${this._callIdentifier} has concluded.`);
        }

        /**
         * @summary Declines an incoming call, preventing it from being established.
         * This can only be called when the call is in a "pending" or "dialing" state.
         * @returns {boolean} True if the call was successfully rejected, false otherwise (e.g., if already connected).
         */
        declineIncomingCall() {
            if (this._callStatus === "pending" || this._callStatus === "dialing") {
                console.log(`Call ${this._callIdentifier}: Declining incoming call.`);
                this._updateCallState("rejected");
                this._dispatch("rejected", { relatedCall: this });
                // No 'ended' event directly after rejected, as it implies it never connected.
                return true;
            }
            console.warn(`Cannot decline call ${this._callIdentifier} in state: ${this._callStatus}.`);
            return false;
        }

        /**
         * @summary Adds a new participant to a multi-party call.
         * @param {string} newParticipantId - The user identifier of the participant to add.
         * @returns {boolean} True if the participant can be added, false otherwise (e.g., not a group call).
         */
        addParticipantToGroup(newParticipantId) {
            if (this._callStatus !== "established") {
                console.warn("Cannot add participant to a call that is not established.");
                return false;
            }
            if (this._activeParticipants.some(p => p.participantIdentifier === newParticipantId)) {
                console.warn(`Participant ${newParticipantId} is already in call ${this._callIdentifier}.`);
                return false;
            }

            const newParticipant = { participantIdentifier: newParticipantId };
            this._activeParticipants.push(newParticipant);
            this._dispatch("participantJoined", { relatedCall: this, participantId: newParticipantId });
            console.log(`Participant ${newParticipantId} added to call ${this._callIdentifier}.`);
            return true;
        }

        /**
         * @summary Removes a participant from a multi-party call.
         * @param {string} participantToRemoveId - The user identifier of the participant to remove.
         * @returns {boolean} True if the participant was found and removed, false otherwise.
         */
        removeParticipantFromGroup(participantToRemoveId) {
            if (this._callStatus !== "established") {
                console.warn("Cannot remove participant from a call that is not established.");
                return false;
            }
            const initialCount = this._activeParticipants.length;
            this._activeParticipants = this._activeParticipants.filter(p => p.participantIdentifier !== participantToRemoveId);

            if (this._activeParticipants.length < initialCount) {
                this._dispatch("participantLeft", { relatedCall: this, participantId: participantToRemoveId });
                console.log(`Participant ${participantToRemoveId} removed from call ${this._callIdentifier}.`);
                return true;
            }
            console.warn(`Participant ${participantToRemoveId} not found in call ${this._callIdentifier}.`);
            return false;
        }

        /**
         * @summary Mutes one or more participants' media streams in the call.
         * @param {string} [mediaKinds="audio,video"] - Comma-separated list of media types to mute (e.g., "audio", "video").
         * @param {string|string[]} [participantList] - One or more user identifiers to mute. Defaults to all participants if not specified.
         * @returns {boolean} True if the mute operation was conceptually possible, false if call is not active.
         */
        silenceParticipants(mediaKinds = "audio,video", participantList) {
            if (this._callStatus !== "established") {
                console.warn("Cannot mute participants: Call is not established.");
                return false;
            }

            const targets = participantList ? (Array.isArray(participantList) ? participantList : [participantList]) : this._activeParticipants.map(p => p.participantIdentifier);
            console.log(`Muting ${mediaKinds} for participants: ${targets.join(', ')} in call ${this._callIdentifier}.`);
            // Placeholder for actual mute logic (e.g., sending signaling messages)
            return true;
        }

        /**
         * @summary Unmutes one or more participants' media streams in the call.
         * @param {string} [mediaKinds="audio,video"] - Comma-separated list of media types to unmute.
         * @param {string|string[]} [participantList] - One or more user identifiers to unmute. Defaults to all.
         * @returns {boolean} True if the unmute operation was conceptually possible, false if call is not active.
         */
        unmuteParticipants(mediaKinds = "audio,video", participantList) {
            if (this._callStatus !== "established") {
                console.warn("Cannot unmute participants: Call is not established.");
                return false;
            }

            const targets = participantList ? (Array.isArray(participantList) ? participantList : [participantList]) : this._activeParticipants.map(p => p.participantIdentifier);
            console.log(`Unmuting ${mediaKinds} for participants: ${targets.join(', ')} in call ${this._callIdentifier}.`);
            // Placeholder for actual unmute logic
            return true;
        }

        /**
         * @summary Initiates a call transfer to another user.
         * @param {string} transferTargetId - The user identifier to whom the call will be transferred.
         * @param {boolean} [isAttendedTransfer=false] - True for an attended transfer (consult first), false for unattended (blind transfer).
         * @param {boolean} [hideTargetIdentity=false] - Whether to conceal the target's identity from the original transferee.
         * @returns {boolean} True if the transfer attempt was initiated, false if not possible.
         */
        transferCallTo(transferTargetId, isAttendedTransfer = false, hideTargetIdentity = false) {
            if (this._callStatus !== "established") {
                console.warn("Cannot transfer call: Call is not established.");
                return false;
            }
            if (!transferTargetId) {
                console.error("Transfer target ID cannot be empty.");
                return false;
            }

            console.log(`Initiating call transfer from ${this._callIdentifier} to ${transferTargetId}. Attended: ${isAttendedTransfer}, Hide Target: ${hideTargetIdentity}.`);
            // Placeholder for actual transfer signaling logic
            // This might involve creating a new call, holding the current one, etc.
            return true;
        }

        /**
         * @summary Transmits DTMF (Dual-Tone Multi-Frequency) signals during an active call.
         * @param {string} dtmfSequence - The sequence of DTMF tones to send (e.g., "123#ABCD").
         * @returns {boolean} True if DTMF transmission is possible, false otherwise.
         */
        transmitDTMFSignal(dtmfSequence) {
            if (this._callStatus !== "established") {
                console.warn("Cannot send DTMF: Call is not established.");
                return false;
            }
            if (typeof dtmfSequence !== 'string' || dtmfSequence.length === 0) {
                console.warn("Empty or invalid DTMF sequence provided.");
                return true; // Still considered possible, just nothing sent
            }

            const validTones = "0123456789*#ABCDabcde".split(''); // 'e' is a placeholder for comma pause
            const cleanedSequence = dtmfSequence.split('').filter(char => validTones.includes(char.toUpperCase()) || char === ',').join('');

            if (cleanedSequence.length === 0) {
                console.warn("DTMF sequence contained no valid tones after filtering.");
                return true; // Still possible, but effectively no-op
            }

            console.log(`Sending DTMF sequence "${cleanedSequence}" on call ${this._callIdentifier}.`);
            // Placeholder for actual DTMF sending mechanism (e.g., RTCDTMFSender)
            return true;
        }

        /**
         * @summary Places the current call on hold.
         * @param {boolean} [sendOnlyMode=false] - If true, audio/video will still be sent, but not received. If false, both send/receive are halted.
         * @returns {boolean} True if the hold operation was successful, false if not possible (e.g., already on hold).
         */
        placeOnHold(sendOnlyMode = false) {
            if (this._callStatus !== "established" || this._isLocallyHeld) {
                console.warn("Cannot place call on hold: Not established or already held locally.");
                return false;
            }

            this._isLocallyHeld = true;
            this._updateCallState("onHold:local");
            this._dispatch("localHold", { relatedCall: this, sendOnly: sendOnlyMode });
            console.log(`Call ${this._callIdentifier} placed on local hold (sendOnly: ${sendOnlyMode}).`);
            // Placeholder for WebRTC operations to pause media sending/receiving
            return true;
        }

        /**
         * @summary Takes the current call off hold.
         * @returns {boolean} True if the unhold operation was successful, false if not possible (e.g., not on hold).
         */
        releaseFromHold() {
            if (!this._isLocallyHeld) {
                console.warn("Cannot unhold call: Not currently on local hold.");
                return false;
            }

            this._isLocallyHeld = false;
            // If remote party also has us on hold, status might remain 'onHold:remote'
            this._updateCallState(this._isRemotelyHeld ? "onHold:remote" : "established");
            this._dispatch("unheld", { relatedCall: this });
            console.log(`Call ${this._callIdentifier} released from local hold.`);
            // Placeholder for WebRTC operations to resume media sending/receiving
            return true;
        }

        /**
         * @summary Retrieves a filtered list of media resources associated with this call.
         * @param {string} [queryFilter] - An optional string to filter the results.
         *   Examples: "local", "remote", ".audio", ".video", "#streamId".
         * @returns {Array<MediaResource>} An array of matching MediaResource instances.
         */
        getAssociatedMediaResources(queryFilter) {
            let allResources = [...this._localAttachedResources, ...this._remoteAttachedResources];

            if (!queryFilter) {
                return allResources;
            }

            const lowerCaseFilter = queryFilter.toLowerCase();
            let filtered = allResources;

            if (lowerCaseFilter.includes("local") && !lowerCaseFilter.includes("remote")) {
                filtered = filtered.filter(res => this._localAttachedResources.includes(res));
            } else if (lowerCaseFilter.includes("remote") && !lowerCaseFilter.includes("local")) {
                filtered = filtered.filter(res => this._remoteAttachedResources.includes(res));
            }

            if (lowerCaseFilter.includes(".audio")) {
                filtered = filtered.filter(res => res.getMediaType() === "audio" || res.getMediaType() === "mixed");
            }
            if (lowerCaseFilter.includes(".video")) {
                filtered = filtered.filter(res => res.getMediaType() === "video" || res.getMediaType() === "mixed");
            }

            if (lowerCaseFilter.startsWith("#")) {
                const targetId = lowerCaseFilter.substring(1);
                // Assuming _uniqueResourceId is what is being queried by '#'
                filtered = filtered.filter(res => res._uniqueResourceId === targetId || res.getRawStream().id === targetId);
            }

            return filtered;
        }

        /**
         * @summary Retrieves the current operational state of this call.
         * @returns {string} One of: "pending", "dialing", "established", "onHold:local", "onHold:remote", "ended", "rejected".
         */
        getCallState() {
            return this._callStatus;
        }

        /**
         * @summary Retrieves the media types requested when the call was initiated.
         * @returns {string} Comma-separated string of requested media types.
         */
        getRequestedMediaTypes() {
            return this._requestedMediaTypes;
        }

        /**
         * @private
         * @param {string} newState - The new state to set.
         */
        _updateCallState(newState) {
            if (this._callStatus !== newState) {
                console.log(`Call ${this._callIdentifier} state changed from '${this._callStatus}' to '${newState}'`);
                this._callStatus = newState;

                // Handle specific state transitions for hold status
                if (newState === "onHold:local") {
                    this._isLocallyHeld = true;
                } else if (newState === "onHold:remote") {
                    this._isRemotelyHeld = true;
                } else if (newState === "established" && (this._isLocallyHeld || this._isRemotelyHeld)) {
                    // If returning to established, ensure both holds are cleared internally
                    this._isLocallyHeld = false;
                    this._isRemotelyHeld = false;
                }
            }
        }
    }

    // --- Type Definitions (Enums and Interfaces) ---

    /**
     * @summary Defines possible error codes specifically for `teleCom.TeleCall` operations.
     * @typedef {object} CommsErrorCodes
     * @memberOf teleCom
     * @property {string} NETWORK_ERROR - An underlying network communication error occurred.
     * @property {string} MEDIA_ACCESS_DENIED - User denied access to media devices.
     * @property {string} UNSUPPORTED_OPERATION - An attempted operation is not supported by the current client or server.
     */
    const CommsErrorCodes = Object.freeze({
        NETWORK_ERROR: 'NETWORK_COMMUNICATION_FAILURE',
        MEDIA_ACCESS_DENIED: 'MEDIA_DEVICE_PERMISSION_DENIED',
        UNSUPPORTED_OPERATION: 'OPERATION_NOT_SUPPORTED'
    });

    /**
     * @summary Provides detailed information about a dispatched communication event.
     * @typedef {object} CommsEventDetail
     * @memberOf teleCom
     * @property {string} eventType - The specific type or name of the event (e.g., "connected", "incomingCall").
     * @property {string} [errorCode] - An {@link teleCom.CommsErrorCodes} or {@link teleCom.ConnectionErrorCodes} if the event signifies an error.
     * @property {string} [errorDescription] - A human-readable description of the error.
     * @property {teleCom.TeleCall} [relatedCall] - The `TeleCall` object associated with this event (e.g., for "incomingCall", "connected").
     * @property {teleCom.MediaResource} [mediaResource] - A `MediaResource` object, typically for stream-related events.
     * @property {string} [participantId] - The identifier of a participant relevant to the event (e.g., "participantJoined").
     * @property {string} [dtmfTone] - The DTMF tone received, for "dtmf" events.
     * @property {string} [mediaKinds] - Comma-separated list of media types, e.g., for incoming calls.
     * @property {string} [sessionId] - The ID of the session if relevant to the event.
     * @property {string} [userId] - The user ID if relevant to the event.
     * @property {boolean} [isRemote] - True if the media resource is from a remote participant, false for local.
     */

    /**
     * @summary Represents basic identity information for a communication participant.
     * @typedef {object} ParticipantInfo
     * @memberOf teleCom
     * @property {string} participantIdentifier - The unique identifier or address string of the participant.
     * @property {string} [displayName] - An optional human-readable display name for the participant.
     */

    /**
     * @summary Defines possible error codes specifically for `teleCom.CommsSession` operations.
     * @typedef {object} ConnectionErrorCodes
     * @memberOf teleCom
     * @property {string} AUTHENTICATION_FAILED - The user's credentials were rejected.
     * @property {string} NETWORK_ERROR - A network timeout or connectivity issue prevented session establishment.
     * @property {string} SERVER_UNAVAILABLE - The communication server could not be reached or is down.
     */
    const ConnectionErrorCodes = Object.freeze({
        AUTHENTICATION_FAILED: 'INVALID_CREDENTIALS',
        NETWORK_ERROR: 'CONNECTION_TIMEOUT',
        SERVER_UNAVAILABLE: 'SERVICE_UNREACHABLE'
    });

    // --- Global Namespace Definition ---

    /**
     * @namespace teleCom
     * @summary The primary namespace for the TeleCommunication API.
     * This object provides factory methods for creating core communication components.
     */
    const teleCom = {
        /**
         * @summary Creates a new instance of a `CommsSession` object.
         * Each session manages a user's connection to the communication gateway.
         * @returns {teleCom.CommsSession} A new communication session instance.
         */
        createSession: function () {
            console.log("teleCom.createSession called.");
            return new CommsSession();
        },

        /**
         * @summary Creates a new instance of a `MediaResource` object.
         * This factory method wraps a native WebRTC MediaStream.
         * @param {MediaStream} rawMediaStream - The raw WebRTC MediaStream to wrap.
         * @returns {teleCom.MediaResource} A new media resource instance.
         */
        createMediaResource: function (rawMediaStream) {
            console.log("teleCom.createMediaResource called.");
            return new MediaResource(rawMediaStream);
        },

        // Expose enums and types
        CommsErrorCodes: CommsErrorCodes,
        ConnectionErrorCodes: ConnectionErrorCodes,
        // CommsEventDetail and ParticipantInfo are typedefs, not runtime objects
    };

    // Export the teleCom namespace to the global context
    globalContext.teleCom = teleCom;

})(typeof window !== 'undefined' ? window : global);