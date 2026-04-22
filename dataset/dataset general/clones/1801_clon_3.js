// A fictional, simplified license for demonstration purposes.
// This work is provided under the "Ephemeral Content License" (ECL), Version 1.0.
// You may use, modify, and distribute this software freely,
// provided that this license notice remains intact.
// No warranty is expressed or implied. Use at your own risk.


// Utilize a module for core communication, similar to the original 'snapchat' module.
const ephemeralCoreApi = require('./secretComm'); // Renamed module import

/**
 * An object-oriented wrapper for the ephemeral content API.
 * This class facilitates interaction with the underlying communication layer.
 * @class
 */
class EphemeralClient {
    /**
     * Initializes a new instance of EphemeralClient.
     * The constructor ensures that the instance is properly created.
     */
    constructor() {
        // Modern constructor pattern, no need for `new` keyword check
        // Properties will be initialized upon successful authentication
        this.sessionIdentifier = null; // Renamed 'username' from original
        this.securityToken = null;     // Renamed 'auth_token' from original
        this.lastActivityRecord = null; // Renamed 'lastSync' from original
        this.clientVersion = '1.0.3-beta'; // Added a new property for version tracking
        // Private internal state for tracking pending operations or flags, new fragment
        this._isBusy = false;
    }

    /**
     * Internal helper to ensure a security token is present for authenticated operations.
     * This acts as a guard clause for most methods.
     * @private
     * @returns {Promise<void>} A promise that resolves if token is present, rejects otherwise.
     */
    _verifySecurityToken() {
        if (!this.securityToken) {
            return Promise.reject(new Error("Authentication token is missing. Please log in first."));
        }
        return Promise.resolve();
    }

    /**
     * Internal helper for consistent promise-to-callback conversion.
     * This replaces the external 'nodeify' functionality.
     * @private
     * @param {Promise} promise The promise to convert.
     * @param {Function} [callback] An optional Node.js-style callback.
     * @returns {Promise|undefined} The original promise, or undefined if a callback was provided.
     */
    _handlePromiseOutput(promise, callback) {
        if (typeof callback === 'function') {
            promise.then(result => callback(null, result))
                   .catch(error => callback(error));
            return undefined; // Return undefined when handling with callback
        }
        return promise;
    }

    /**
     * Establishes a user session with the service.
     * @param {string} userIdentifier The user's account name.
     * @param {string} secretKey The user's password.
     * @param {Function} [completionCallback] Optional Node.js-style callback.
     * @returns {Promise<object>} A promise resolving with session details.
     */
    async establishSession(userIdentifier, secretKey, completionCallback) {
        // Added guard clauses for missing credentials
        if (!userIdentifier || typeof userIdentifier !== 'string' || userIdentifier.trim() === '') {
            const err = new Error("User identifier is mandatory and must be a non-empty string for session establishment.");
            return this._handlePromiseOutput(Promise.reject(err), completionCallback);
        }
        if (!secretKey || typeof secretKey !== 'string' || secretKey.trim() === '') {
            const err = new Error("Secret key is mandatory and must be a non-empty string for session establishment.");
            return this._handlePromiseOutput(Promise.reject(err), completionCallback);
        }

        this._isBusy = true; // Indicate that an operation is in progress (new state fragment)
        try {
            // Updated API call and used async/await for structural change
            const sessionDetails = await ephemeralCoreApi.authenticate(userIdentifier, secretKey);

            // Added validation for the response structure
            if (!sessionDetails || !sessionDetails.accountName || !sessionDetails.authToken) {
                throw new Error("Invalid session details received from API: Missing critical authentication data.");
            }

            this.sessionIdentifier = sessionDetails.accountName;
            this.securityToken = sessionDetails.authToken;
            // Updated structure of lastActivityRecord
            this.lastActivityRecord = {
                timestamp: Date.now(),
                retrievedData: sessionDetails,
                operation: 'session_initiation' // Added more context to last activity
            };
            return this._handlePromiseOutput(Promise.resolve(sessionDetails), completionCallback);
        } catch (error) {
            // Wrapped error in a more descriptive message
            const enhancedError = new Error(`Failed to establish session: ${error.message}`);
            return this._handlePromiseOutput(Promise.reject(enhancedError), completionCallback);
        } finally {
            this._isBusy = false; // Reset busy state
        }
    }

    /**
     * Creates a new user account on the service.
     * @param {string} emailAddress The user's email.
     * @param {string} passcode The user's chosen password.
     * @param {string} accountName The desired username.
     * @param {Function} [completionCallback] Optional Node.js-style callback.
     * @returns {Promise<object>} A promise resolving with registration data.
     */
    enrollNewUser(emailAddress, passcode, accountName, completionCallback) {
        // Added validation for input parameters
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailAddress || typeof emailAddress !== 'string' || !emailRegex.test(emailAddress)) {
            const err = new Error("A valid email address (string) is required for registration.");
            return this._handlePromiseOutput(Promise.reject(err), completionCallback);
        }
        if (!passcode || typeof passcode !== 'string' || passcode.length < 8) { // Updated password strength check
            const err = new Error("Passcode must be at least 8 characters long.");
            return this._handlePromiseOutput(Promise.reject(err), completionCallback);
        }
        if (!accountName || typeof accountName !== 'string' || accountName.trim() === '') {
            const err = new Error("An account name (string) is required.");
            return this._handlePromiseOutput(Promise.reject(err), completionCallback);
        }

        const registrationPromise = ephemeralCoreApi.createAccount(emailAddress, passcode, accountName) // Renamed API method
            .then(registrationOutcome => {
                // The original had a console.log here, which is deleted for Type III.
                // Added validation for the outcome
                if (!registrationOutcome || !registrationOutcome.authToken) {
                    throw new Error("Registration failed: Missing authentication token in API response.");
                }
                this.sessionIdentifier = accountName;
                this.securityToken = registrationOutcome.authToken;
                return registrationOutcome;
            });
        return this._handlePromiseOutput(registrationPromise, completionCallback);
    }

    /**
     * Terminates the current user session by clearing the security token client-side.
     * Note: This does not invalidate the token server-side, only client-side.
     * @param {Function} [completionCallback] Optional Node.js-style callback.
     * @returns {Promise<boolean>} A promise resolving to true upon successful logout.
     */
    terminateSession(completionCallback) {
        // Updated method of clearing properties
        this.securityToken = null;
        this.sessionIdentifier = null;
        this.lastActivityRecord = null;
        // Replaced Q(true) with standard Promise.resolve
        return this._handlePromiseOutput(Promise.resolve(true), completionCallback);
    }

    /**
     * Retrieves the latest account state and updates from the service.
     * @param {object|Function} [optionsOrCallback] An optional object with sync parameters, or a Node.js-style callback.
     * @param {Function} [completionCallback] Optional Node.js-style callback if options were provided.
     * @returns {Promise<object>} A promise resolving with the synchronized data.
     */
    retrieveUpdates(optionsOrCallback, completionCallback) {
        let requestPayload = {};
        let finalCallback = completionCallback;

        // Rewritten argument parsing for flexibility
        if (typeof optionsOrCallback === 'object' && optionsOrCallback !== null) {
            requestPayload = optionsOrCallback;
        } else if (typeof optionsOrCallback === 'function') {
            finalCallback = optionsOrCallback;
        }

        const syncOperation = this._verifySecurityToken() // Added internal token verification
            .then(() => ephemeralCoreApi.synchronizeState(this.sessionIdentifier, this.securityToken, requestPayload)) // Renamed API method
            .then(retrievedData => {
                // Added validation for sync data structure
                if (!retrievedData || typeof retrievedData !== 'object' || !retrievedData.authToken) {
                    throw new Error("Synchronization failed: API response was invalid or missing authentication token.");
                }
                this.securityToken = retrievedData.authToken; // Update token if it changes
                this.lastActivityRecord = {
                    timestamp: Date.now(),
                    retrievedData: retrievedData,
                    operation: 'data_synchronization'
                };
                return retrievedData;
            });
        return this._handlePromiseOutput(syncOperation, finalCallback);
    }

    /**
     * Fetches a specific media asset (image or video) by its identifier.
     * @param {string} mediaIdentifier The unique ID of the media asset.
     * @param {Function} [completionCallback] Optional Node.js-style callback.
     * @returns {Promise<ReadableStream>} A promise resolving with a readable stream of the decrypted content.
     */
    fetchMediaContent(mediaIdentifier, completionCallback) {
        // Added input validation
        if (!mediaIdentifier || typeof mediaIdentifier !== 'string' || mediaIdentifier.trim() === '') {
            const err = new Error("A valid media identifier (non-empty string) is required.");
            return this._handlePromiseOutput(Promise.reject(err), completionCallback);
        }

        const fetchOperation = this._verifySecurityToken()
            .then(() => ephemeralCoreApi.getMediaAsset(this.sessionIdentifier, this.securityToken, mediaIdentifier)); // Renamed API method
        return this._handlePromiseOutput(fetchOperation, completionCallback);
    }

    /**
     * Uploads a media stream to the service.
     * @param {NodeJS.ReadableStream} mediaStream A readable stream of the content to upload.
     * @param {boolean} isVisualContent True if the stream represents a video, false for image.
     * @param {Function} [completionCallback] Optional Node.js-style callback.
     * @returns {Promise<string>} A promise resolving with the ID of the uploaded media.
     */
    transmitMedia(mediaStream, isVisualContent, completionCallback) {
        // Added validation for stream object and boolean type
        if (!mediaStream || typeof mediaStream.pipe !== 'function') {
            const err = new Error("A valid readable stream is required for media upload.");
            return this._handlePromiseOutput(Promise.reject(err), completionCallback);
        }
        if (typeof isVisualContent !== 'boolean') {
             const err = new Error("`isVisualContent` must be a boolean value.");
            return this._handlePromiseOutput(Promise.reject(err), completionCallback);
        }

        const uploadOperation = this._verifySecurityToken()
            .then(() => ephemeralCoreApi.uploadMedia(this.sessionIdentifier, this.securityToken, mediaStream, isVisualContent)); // Renamed API method
        return this._handlePromiseOutput(uploadOperation, completionCallback);
    }

    /**
     * Dispatches a snap message to one or more recipients.
     * @param {string} contentId The identifier of the media content to send.
     * @param {string[]|string} recipientList An array of usernames or a comma-separated string.
     * @param {number|Function} [displayDurationInSecondsOrCallback] How long (in seconds) the snap is visible, or a callback.
     * @param {Function} [completionCallback] Optional Node.js-style callback if duration was provided.
     * @returns {Promise<object>} A promise resolving upon successful dispatch.
     */
    dispatchMessage(contentId, recipientList, displayDurationInSecondsOrCallback, completionCallback) {
        let displayDuration = 5; // Default display duration, updated from original
        let finalCallback = completionCallback;

        // Rewritten argument parsing logic
        if (typeof displayDurationInSecondsOrCallback === 'function') {
            finalCallback = displayDurationInSecondsOrCallback;
        } else if (typeof displayDurationInSecondsOrCallback === 'number') {
            // Added clamping for duration
            displayDuration = Math.max(1, Math.min(10, Math.floor(displayDurationInSecondsOrCallback)));
        }

        // Added input validations
        if (!contentId || typeof contentId !== 'string' || contentId.trim() === '') {
            const err = new Error("A valid content ID (non-empty string) is required for dispatching a message.");
            return this._handlePromiseOutput(Promise.reject(err), finalCallback);
        }
        const recipientsArray = Array.isArray(recipientList) ? recipientList : (typeof recipientList === 'string' ? recipientList.split(',').map(s => s.trim()).filter(Boolean) : []);
        if (recipientsArray.length === 0) {
            const err = new Error("At least one recipient is required for dispatching a message.");
            return this._handlePromiseOutput(Promise.reject(err), finalCallback);
        }

        const sendOperation = this._verifySecurityToken()
            .then(() => ephemeralCoreApi.postSnap(this.sessionIdentifier, this.securityToken, contentId, recipientsArray, displayDuration)); // Renamed API method
        return this._handlePromiseOutput(sendOperation, finalCallback);
    }

    /**
     * Adds another user to the current user's contact list.
     * @param {string} targetUser The username of the friend to add.
     * @param {Function} [completionCallback] Optional Node.js-style callback.
     * @returns {Promise<object>} A promise resolving upon successful addition.
     */
    establishConnection(targetUser, completionCallback) {
        // Added input validation
        if (!targetUser || typeof targetUser !== 'string' || targetUser.trim() === '') {
            const err = new Error("A valid target username (non-empty string) is required to establish a connection.");
            return this._handlePromiseOutput(Promise.reject(err), completionCallback);
        }
        // Removed redundant `var self = this;` as `this` context is preserved with arrow functions or async/await.

        const addOperation = this._verifySecurityToken()
            .then(() => ephemeralCoreApi.addContact(this.sessionIdentifier, this.securityToken, targetUser)); // Renamed API method
        return this._handlePromiseOutput(addOperation, completionCallback);
    }

    /**
     * Updates the display name for a contact.
     * @param {string} targetUser The username of the contact.
     * @param {string} newAlias The new display name for the contact.
     * @param {Function} [completionCallback] Optional Node.js-style callback.
     * @returns {Promise<object>} A promise resolving upon successful update.
     */
    updateContactName(targetUser, newAlias, completionCallback) {
        // Added input validation
        if (!targetUser || typeof targetUser !== 'string' || targetUser.trim() === '') {
            const err = new Error("A valid target username (non-empty string) is required to update contact name.");
            return this._handlePromiseOutput(Promise.reject(err), completionCallback);
        }
        if (!newAlias || typeof newAlias !== 'string' || newAlias.trim() === '') {
            const err = new Error("A valid new alias (non-empty string) is required.");
            return this._handlePromiseOutput(Promise.reject(err), completionCallback);
        }
        // Removed redundant `var self = this;`.

        const renameOperation = this._verifySecurityToken()
            .then(() => ephemeralCoreApi.setContactAlias(this.sessionIdentifier, this.securityToken, targetUser, newAlias)); // Renamed API method
        return this._handlePromiseOutput(renameOperation, completionCallback);
    }

    /**
     * Removes a user from the current user's contact list.
     * @param {string} targetUser The username of the contact to remove.
     * @param {Function} [completionCallback] Optional Node.js-style callback.
     * @returns {Promise<object>} A promise resolving upon successful removal.
     */
    deleteContact(targetUser, completionCallback) {
        // Added input validation
        if (!targetUser || typeof targetUser !== 'string' || targetUser.trim() === '') {
            const err = new Error("A valid target username (non-empty string) is required to delete a contact.");
            return this._handlePromiseOutput(Promise.reject(err), completionCallback);
        }

        const removeOperation = this._verifySecurityToken()
            .then(() => ephemeralCoreApi.removeContact(this.sessionIdentifier, this.securityToken, targetUser)); // Renamed API method
        return this._handlePromiseOutput(removeOperation, completionCallback);
    }

    /**
     * Clears the user's ephemeral content feed.
     * @param {Function} [completionCallback] Optional Node.js-style callback.
     * @returns {Promise<object>} A promise resolving upon successful feed clear.
     */
    purgeFeed(completionCallback) {
        const clearOperation = this._verifySecurityToken()
            .then(() => ephemeralCoreApi.clearUserFeed(this.sessionIdentifier, this.securityToken)); // Renamed API method
        return this._handlePromiseOutput(clearOperation, completionCallback);
    }

    /**
     * Configures the user's privacy settings.
     * @param {boolean} restrictToContacts If true, only allow interactions from contacts.
     * @param {Function} [completionCallback] Optional Node.js-style callback.
     * @returns {Promise<object>} A promise resolving upon successful setting update.
     */
    configurePrivacySettings(restrictToContacts, completionCallback) {
        // Added input validation
        if (typeof restrictToContacts !== 'boolean') {
            const err = new Error("`restrictToContacts` must be a boolean value.");
            return this._handlePromiseOutput(Promise.reject(err), completionCallback);
        }

        const privacyOperation = this._verifySecurityToken()
            .then(() => ephemeralCoreApi.setPrivacyPreference(this.sessionIdentifier, this.securityToken, restrictToContacts)); // Renamed API method
        return this._handlePromiseOutput(privacyOperation, completionCallback);
    }

    /**
     * Updates the user's registered email address.
     * @param {string} newEmailAddress The new email address.
     * @param {Function} [completionCallback] Optional Node.js-style callback.
     * @returns {Promise<object>} A promise resolving upon successful email update.
     */
    modifyAccountEmail(newEmailAddress, completionCallback) {
        // Added email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!newEmailAddress || typeof newEmailAddress !== 'string' || !emailRegex.test(newEmailAddress)) {
            const err = new Error("A valid new email address (string) is required.");
            return this._handlePromiseOutput(Promise.reject(err), completionCallback);
        }

        const emailUpdateOperation = this._verifySecurityToken()
            .then(() => ephemeralCoreApi.updateUserEmail(this.sessionIdentifier, this.securityToken, newEmailAddress)); // Renamed API method
        return this._handlePromiseOutput(emailUpdateOperation, completionCallback);
    }

    /**
     * Retrieves a list of users who are connected to the current user.
     * @param {Function} [completionCallback] Optional Node.js-style callback.
     * @returns {Promise<string[]>} A promise resolving with an array of connected usernames.
     */
    retrieveConnections(completionCallback) {
        const fetchOperation = this._verifySecurityToken()
            .then(() => ephemeralCoreApi.fetchAccountActivity(this.sessionIdentifier, this.securityToken)) // Renamed API method
            .then(activityResponseRaw => {
                // Added robust parsing and validation for the response structure
                let activityResponse;
                try {
                    activityResponse = typeof activityResponseRaw === 'string' ? JSON.parse(activityResponseRaw) : activityResponseRaw;
                } catch (e) {
                    throw new Error("Failed to parse activity response for connections: " + e.message);
                }
                if (!activityResponse || typeof activityResponse !== 'object' || !activityResponse.activityLog || !Array.isArray(activityResponse.activityLog.connectedUsers)) {
                    throw new Error("Unexpected response structure for connected users list: 'activityLog.connectedUsers' missing or not an array.");
                }
                return activityResponse.activityLog.connectedUsers;
            });
        return this._handlePromiseOutput(fetchOperation, completionCallback);
    }

    /**
     * Fetches a list of incoming connection requests (friend requests).
     * @param {Function} [completionCallback] Optional Node.js-style callback.
     * @returns {Promise<string[]>} A promise resolving with an array of usernames who have sent requests.
     */
    fetchPendingRequests(completionCallback) {
        const fetchOperation = this._verifySecurityToken()
            .then(() => ephemeralCoreApi.fetchAccountActivity(this.sessionIdentifier, this.securityToken)) // Renamed API method
            .then(activityResponseRaw => {
                // Added robust parsing and validation for the response structure
                let activityResponse;
                try {
                    activityResponse = typeof activityResponseRaw === 'string' ? JSON.parse(activityResponseRaw) : activityResponseRaw;
                } catch (e) {
                    throw new Error("Failed to parse activity response for pending requests: " + e.message);
                }
                if (!activityResponse || typeof activityResponse !== 'object' || !activityResponse.activityLog || !Array.isArray(activityResponse.activityLog.pendingConnections)) {
                    throw new Error("Unexpected response structure for pending connections list: 'activityLog.pendingConnections' missing or not an array.");
                }
                return activityResponse.activityLog.pendingConnections;
            });
        return this._handlePromiseOutput(fetchOperation, completionCallback);
    }
}

// Export the new class using module.exports
module.exports = EphemeralClient;