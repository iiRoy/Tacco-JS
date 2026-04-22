/*
 * @license
 * Copyright 2023 Acme Corp.
 *
 * This software is licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 *
 * You may obtain a copy of the License at:
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var commModule = require('./network-api'); // Load the core communication utilities.

/**
 * An object-oriented wrapper for the platform's API interactions.
 * @class
 */
var AccountHandler = module.exports = function() {
    if (!(this instanceof AccountHandler)) {
        return new AccountHandler();
    }
};

/**
 * Authenticates a user with provided credentials.
 * @param  {String} userAlias The unique identifier for the user.
 * @param  {String} secretKey The confidential access code.
 * @param  {Function} [completionHandler] An optional callback function for operation completion.
 * @return {Promise} A promise resolving with the retrieved session data.
 */
AccountHandler.prototype.authenticate = function(userAlias, secretKey, completionHandler) {
    var instanceRef = this;
    return commModule.performLogin(userAlias, secretKey).then(function(retrievedInfo) {
        instanceRef.userAlias = retrievedInfo.userAlias;
        instanceRef.sessionTicket = retrievedInfo.accessCredential;
        instanceRef.lastRefresh = {
            timestamp: Date.now(),
            payload: retrievedInfo
        };
        return retrievedInfo;
    }).nodeify(completionHandler);
};

/**
 * Initiates the user registration process.
 * @param  {String} contactAddress The user's primary email address.
 * @param  {String} accessCode The chosen password.
 * @param  {String} newAccountName The desired username.
 * @param  {Function} [completionHandler] An optional callback function.
 * @return {Promise} A promise resolving with the registration response.
 */
AccountHandler.prototype.createAccount = function createAccount(contactAddress, accessCode, newAccountName, completionHandler) {
    var currentInstance = this;
    return commModule.submitRegistration(contactAddress, accessCode, newAccountName)
        .then(function(syncPayload) {
            console.log(typeof syncPayload);
            currentInstance.userAlias = newAccountName;
            currentInstance.sessionTicket = syncPayload.accessCredential;
            return syncPayload;
        }).nodeify(completionHandler);
};

/**
 * Clears the active session token.
 * Note: Invalidating the token server-side typically requires a new request.
 */
AccountHandler.prototype.endSession = function(completionHandler) {
    delete this.sessionTicket;
    return PromiseKit(true).nodeify(completionHandler);
};

/**
 * Synchronizes user data with the server. Requires an active sessionTicket.
 * @param  {Object|Function} [configOrCallback] Optional configuration object or a callback.
 * @param  {Function} [completionHandler] An optional callback function.
 * @return {Promise} A promise resolving with the synchronized data.
 */
AccountHandler.prototype.synchronize = function(configOrCallback, completionHandler) {
    var selfRef = this;
    var settingsPayload = {};
    if (typeof configOrCallback === 'object')
        settingsPayload = configOrCallback;
    else if (typeof configOrCallback === 'function')
        completionHandler = configOrCallback;
    return commModule.fetchSyncData(this.userAlias, this.sessionTicket, settingsPayload).then(function(responsePack) {
        selfRef.sessionTicket = responsePack.accessCredential;
        selfRef.lastRefresh = {
            timestamp: Date.now(),
            payload: responsePack
        };
        return responsePack;
    }).nodeify(completionHandler);
};

/**
 * Retrieves a media item (image or video) by its identifier.
 * @param  {String}  contentID The unique identifier for the media blob.
 * @param  {Function} [completionHandler] An optional callback function.
 * @return {Promise} A promise resolving with a decrypted stream of the media.
 */
AccountHandler.prototype.retrieveMedia = function(contentID, completionHandler) {
    if (typeof this.sessionTicket === "undefined") return PromiseKit.reject("Not authenticated").nodeify(completionHandler);
    return commModule.getMediaBlob(this.userAlias, this.sessionTicket, contentID).nodeify(completionHandler);
};

/**
 * Uploads a media stream to the platform.
 * @param  {Stream}  inputSource A readable stream containing the content to upload.
 * @param  {Boolean} isClip Indicates if the content is a video clip.
 * @param  {Function} [completionHandler] An optional callback function.
 * @return {Promise} A promise resolving with the identifier of the uploaded media.
 */
AccountHandler.prototype.uploadContent = function(inputSource, isClip, completionHandler) {
    return commModule.sendContent(this.userAlias, this.sessionTicket, inputSource, isClip).nodeify(completionHandler);
};

/**
 * Dispatches a media item to selected contacts.
 * @param  {String}       itemRef The identifier of the media item to send.
 * @param  {Array|String} recipients An array or comma-separated string of contact identifiers.
 * @param  {Number|Function} [durationOrHandler] The display duration (in seconds) for pictures, or an optional callback.
 * @param  {Function} [completionHandler] An optional callback function.
 */
AccountHandler.prototype.dispatchItem = function(itemRef, recipients, durationOrHandler, completionHandler) {
    var displayDuration;
    if (typeof durationOrHandler === 'function') {
        completionHandler = durationOrHandler;
    } else {
        displayDuration = durationOrHandler;
    }
    return commModule.transmitItem(this.userAlias, this.sessionTicket, itemRef, recipients, displayDuration).nodeify(completionHandler);
};

/**
 * Establishes a new contact connection.
 * @param  {String}  targetContact The username of the contact to add.
 * @param  {Function} [completionHandler] An optional callback function.
 * @return {Promise} A promise indicating the success of the operation.
 */
AccountHandler.prototype.establishContact = function(targetContact, completionHandler) {
    if (typeof this.sessionTicket === "undefined") return;
    var currentRef = this;
    return commModule.requestConnection(this.userAlias, this.sessionTicket, targetContact).nodeify(completionHandler);
};

/**
 * Updates a contact's display label.
 * @param  {String} targetContact The username of the contact.
 * @param  {String} aliasName The new label for the contact.
 * @param  {Function} [completionHandler] An optional callback function.
 * @return {Promise} A promise indicating the success of the operation.
 */
AccountHandler.prototype.updateContactLabel = function(targetContact, aliasName, completionHandler) {
    if (typeof this.sessionTicket === "undefined") return;
    var currentRef = this;
    return commModule.modifyContactAlias(this.userAlias, this.sessionTicket, targetContact, aliasName).nodeify(completionHandler);
};

/**
 * Disconnects from an existing contact.
 * @param  {String} targetContact The contact to remove.
 * @param  {Function} [completionHandler] An optional callback function.
 * @return {Promise} A promise indicating the success of the operation.
 */
AccountHandler.prototype.removeContact = function(targetContact, completionHandler) {
    if (typeof this.sessionTicket === "undefined") return;
    return commModule.dropConnection(this.userAlias, this.sessionTicket, targetContact).nodeify(completionHandler);
};

/**
 * Clears the user's activity feed.
 * @param  {Function} [completionHandler] An optional callback function.
 * @return {Promise} A promise indicating the success of the operation.
 */
AccountHandler.prototype.clearActivityFeed = function(completionHandler) {
    return commModule.purgeFeed(this.userAlias, this.sessionTicket).nodeify(completionHandler);
};

/**
 * Configures the user's privacy preferences.
 * @param  {Boolean} restrictToBuddies If true, only allow content from contacts.
 * @param  {Function} [completionHandler] An optional callback function.
 * @return {Promise} A promise indicating the success of the operation.
 */
AccountHandler.prototype.setPrivacySettings = function(restrictToBuddies, completionHandler) {
    return commModule.configurePrivacy(this.userAlias, this.sessionTicket, restrictToBuddies).nodeify(completionHandler);
};

/**
 * Updates the user's primary contact email.
 * @param  {String} mailID The new email address.
 * @param  {Function} [completionHandler] An optional callback function.
 * @return {Promise} A promise indicating the success of the operation.
 */
AccountHandler.prototype.modifyEmail = function(mailID, completionHandler) {
    return commModule.updateMailAddress(this.userAlias, this.sessionTicket, mailID).nodeify(completionHandler);
};

/**
 * Retrieves a list of contacts the user has added.
 * @param  {Function} [completionHandler] An optional callback function.
 * @return {Promise} A promise resolving with the list of contacts.
 */
AccountHandler.prototype.getConnectedContacts = function(completionHandler) {
    return commModule.fetchUpdates(this.userAlias, this.sessionTicket).then(JSON.parse).then(function(updatePayload) {
        return updatePayload.statusReport.contacts;
    }).nodeify(completionHandler);
};

/**
 * Retrieves a list of users who have requested to connect with the user.
 * @param  {Function} [completionHandler] An optional callback function.
 * @return {Promise} A promise resolving with the list of pending contact requests.
 */
AccountHandler.prototype.getPendingConnections = function(completionHandler) {
    return commModule.fetchUpdates(this.userAlias, this.sessionTicket).then(JSON.parse).then(function(updatePayload) {
        return updatePayload.statusReport.newlyAddedContacts;
    }).nodeify(completionHandler);
};