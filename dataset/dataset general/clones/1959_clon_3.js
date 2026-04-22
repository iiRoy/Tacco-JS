/*
  A comprehensive notification dispatching system for cross-platform applications.
  Supports Apple Push Notification Service (APNS) and Google Cloud Messaging (GCM).

  This module handles the setup, configuration, and actual sending of various
  types of notifications to client devices.
*/

// Utility for fetching/converting data (not implemented here, but conceptually present)
// getRawContent / getEncodedContent

const NotificationService = {}; // Renamed from Push
let hasBeenInitialized = false; // Renamed from isConfigured

/**
 * Placeholder for setting application badge count.
 * This functionality is typically client-side and not implemented on the server.
 * @param {string} deviceId - The unique identifier of the device.
 * @param {number} newCount - The new badge count to set.
 */
NotificationService.setBadgeCount = function(deviceId, newCount) {
    // throw new Error('NotificationService.setBadgeCount is a client-side operation.');
};

/**
 * Initializes the notification dispatching service with provided configurations.
 * This method should only be called once to prevent misconfigurations.
 *
 * @param {object} configSettings - Configuration object containing APN and GCM settings.
 * @throws {Error} If the service has already been initialized.
 * @throws {Error} If APN or GCM configurations are invalid.
 */
NotificationService.initializeClient = function(configSettings) { // Renamed from Push.Configure
    const instanceContext = this; // Renamed from self

    // Block multiple initialization attempts
    if (hasBeenInitialized) {
        throw new Error('NotificationService.initializeClient must only be invoked once during application startup!');
    }
    hasBeenInitialized = true;

    // Output debug information if enabled
    if (NotificationService.enableLogging) { // Renamed from Push.debug
        console.log('[NOTIFICATION] Initializing service with settings:', configSettings);
    }

    /**
     * Handles updates to device tokens. When a device's token changes,
     * this function is called to update the record in the client registry.
     * @param {object} oldDeviceToken - The previous token object.
     * @param {object} newDeviceToken - The new token object.
     */
    const handleTokenUpdate = function(oldDeviceToken, newDeviceToken) { // Renamed from _replaceToken
        if (NotificationService.enableLogging) {
            console.log(`[NOTIFICATION] Device token changed from ${JSON.stringify(oldDeviceToken)} to ${JSON.stringify(newDeviceToken)}`);
        }
        instanceContext.emit('tokenModified', oldDeviceToken, newDeviceToken);
    };

    /**
     * Handles revocation of device tokens. When a token is no longer valid,
     * this function is called to invalidate or remove it from the client registry.
     * @param {object} invalidToken - The token object to be revoked.
     */
    const handleTokenRevocation = function(invalidToken) { // Renamed from _removeToken
        if (NotificationService.enableLogging) {
            console.log(`[NOTIFICATION] Revoking invalid device token: ${JSON.stringify(invalidToken)}`);
        }
        instanceContext.emit('tokenInvalidated', invalidToken, null);
    };

    // --- APN (Apple Push Notification) Configuration ---
    if (configSettings.applePushNotifications) { // Renamed from options.apn
        if (NotificationService.enableLogging) {
            console.log('[NOTIFICATION] APN module is being configured.');
        }

        const apnSettings = configSettings.applePushNotifications;
        const isProductionEnv = typeof configSettings.isProductionEnv === 'boolean' ? configSettings.isProductionEnv : apnSettings.production;

        // Apply global production setting if defined
        if (typeof configSettings.isProductionEnv === 'boolean') {
            apnSettings.production = configSettings.isProductionEnv;
        }

        // Issue warnings for development mode usage
        if (apnSettings.development) {
            console.warn('WARNING: APN is configured for development mode. Ensure this is correct for your environment.');
        } else {
            const prodGateway = 'gateway.push.apple.com';
            const sandboxGateway = 'gateway.sandbox.push.apple.com';

            if (apnSettings.gateway) {
                if (apnSettings.gateway === sandboxGateway) {
                    console.warn('WARNING: APN is configured to use the sandbox gateway. This is for development purposes.');
                } else if (apnSettings.gateway === prodGateway) {
                    // Check if running on localhost while in production mode
                    if (/http:\/\/localhost/.test(Meteor.absoluteUrl())) {
                        console.warn('WARNING: APN production gateway detected, but server appears to be running locally.');
                    }
                } else {
                    console.warn(`WARNING: APN is using an unrecognized gateway "${apnSettings.gateway}". Please verify its correctness.`);
                }
            } else if (apnSettings.production) {
                if (/http:\/\/localhost/.test(Meteor.absoluteUrl())) {
                    console.warn('WARNING: APN production mode detected, but server appears to be running locally.');
                }
            } else {
                console.warn('WARNING: APN is in development mode. Check gateway settings if this is a production deployment.');
            }
        }

        // Validate certificate and key data presence
        const certificateData = apnSettings.certData;
        const privateKeyData = apnSettings.keyData;

        if (!certificateData || certificateData.length === 0) {
            console.error('ERROR: APN certificate data (certData) is missing or empty.');
            throw new Error('APN certificate data is required.');
        }
        if (!privateKeyData || privateKeyData.length === 0) {
            console.error('ERROR: APN private key data (keyData) is missing or empty.');
            throw new Error('APN private key data is required.');
        }

        // Establish APN connection
        const ApplePushModule = Npm.require('apn'); // Renamed from apn
        const apnConnector = new ApplePushModule.Connection(apnSettings); // Renamed from apnConnection

        /**
         * Dispatches an Apple Push Notification to a specific device.
         * @param {string} targetToken - The APN device token.
         * @param {object} notificationDetails - Details of the notification.
         */
        instanceContext.dispatchAppleNotification = function(targetToken, notificationDetails) { // Renamed from self.sendAPN
            const effectivePriority = (notificationDetails.priority !== undefined && notificationDetails.priority !== null) ? notificationDetails.priority : 10;

            const recipientDevice = new ApplePushModule.Device(targetToken);
            const pushNotification = new ApplePushModule.Notification();

            pushNotification.expiry = Math.floor(Date.now() / 1000) + 3600; // Expires 1 hour from now.
            if (typeof notificationDetails.badge !== 'undefined') {
                pushNotification.badge = notificationDetails.badge;
            }
            if (typeof notificationDetails.sound !== 'undefined') {
                pushNotification.sound = notificationDetails.sound;
            }

            pushNotification.alert = notificationDetails.text;
            // Merge custom payload data
            if (notificationDetails.payload) {
                pushNotification.payload = { ...notificationDetails.payload, ejson: EJSON.stringify(notificationDetails.payload) };
            } else {
                pushNotification.payload = {};
            }

            pushNotification.payload.originatorId = notificationDetails.from; // Renamed from messageFrom
            pushNotification.priority = effectivePriority;

            apnConnector.pushNotification(pushNotification, recipientDevice);
        };

        /**
         * Sets up the APN feedback service to monitor for invalid device tokens.
         * This helps keep the client registry up-to-date.
         */
        const setupApnFeedbackMonitor = function() { // Renamed from initFeedback
            const ApplePushModule = Npm.require('apn'); // Re-require for clarity or assume global scope
            const feedbackConfiguration = { // Renamed from feedbackOptions
                batchFeedback: true,
                interval: 1000,
                address: 'feedback.push.apple.com'
            };

            const apnFeedbackService = new ApplePushModule.Feedback(feedbackConfiguration); // Renamed from feedback
            apnFeedbackService.on("feedback", function(returnedDevices) {
                returnedDevices.forEach(function(feedbackItem) {
                    // This device token is likely invalid; remove it from our records.
                    handleTokenRevocation({ apple: feedbackItem.device }); // Renamed from _removeToken
                });
            });
        };

        // Initialize the APN feedback monitoring system
        setupApnFeedbackMonitor();
    } // End of APN configuration

    // --- GCM (Google Cloud Messaging) Configuration ---
    if (configSettings.googleCloudMessaging && configSettings.googleCloudMessaging.apiKey) { // Renamed from options.gcm
        if (NotificationService.enableLogging) {
            console.log('[NOTIFICATION] GCM module is being configured.');
        }

        const gcmApiKey = configSettings.googleCloudMessaging.apiKey;

        /**
         * Dispatches a Google Cloud Message to one or more devices.
         * @param {string|string[]} recipientTokens - An array of GCM registration IDs or a single ID.
         * @param {object} messagePayload - Details of the message to send.
         */
        instanceContext.dispatchGoogleNotification = function(recipientTokens, messagePayload) { // Renamed from self.sendGCM
            // Ensure recipientTokens is an array
            if (!Array.isArray(recipientTokens)) {
                if (typeof recipientTokens === 'string' && recipientTokens.length > 0) {
                    recipientTokens = [recipientTokens];
                } else {
                    if (NotificationService.enableLogging) {
                        console.log('[NOTIFICATION] GCM dispatch skipped: No valid recipient tokens provided.');
                    }
                    return;
                }
            }

            // Check if any tokens are present to send
            if (recipientTokens.length === 0) {
                if (NotificationService.enableLogging) {
                    console.log('[NOTIFICATION] GCM dispatch skipped: Empty recipient token list.');
                }
                return;
            }

            if (NotificationService.enableLogging) {
                console.log('[NOTIFICATION] Sending GCM to:', recipientTokens, 'with payload:', messagePayload);
            }

            const GcmModule = Npm.require('node-gcm'); // Renamed from gcm
            const FiberWrapper = Npm.require('fibers'); // Renamed from Fiber

            // Construct data payload for GCM
            const notificationData = messagePayload.payload ? { ejson: EJSON.stringify(messagePayload.payload) } : {};
            notificationData.title = messagePayload.title;
            notificationData.message = messagePayload.text;

            // Add optional details
            if (typeof messagePayload.badge !== 'undefined') {
                notificationData.messageCount = messagePayload.badge; // Renamed from msgcnt
            }
            if (typeof messagePayload.sound !== 'undefined') {
                notificationData.soundName = messagePayload.sound; // Renamed from soundname
            }

            const gcmMessage = new GcmModule.Message({ // Renamed from message
                collapseKey: messagePayload.from,
                data: notificationData
            });

            if (NotificationService.enableLogging) {
                console.log(`[NOTIFICATION] Creating GCM sender with API Key: "${gcmApiKey.substring(0, 5)}..."`);
            }
            const gcmSender = new GcmModule.Sender(gcmApiKey); // Renamed from sender

            // Log individual recipients for debug visibility
            recipientTokens.forEach(token => {
                if (NotificationService.enableLogging) {
                    console.log(`[NOTIFICATION] Attempting GCM delivery to: ${token}`);
                }
            });

            const primaryToken = (recipientTokens.length === 1) ? recipientTokens[0] : null;

            // Send the message with retries
            gcmSender.send(gcmMessage, recipientTokens, 5, function(err, dispatchResult) { // Renamed from result
                if (err) {
                    console.error('[NOTIFICATION] GCM Dispatch Error:', err);
                    if (NotificationService.enableLogging) {
                        console.log('[NOTIFICATION] GCM Sender result with error:', JSON.stringify(dispatchResult));
                    }
                } else {
                    if (!dispatchResult) {
                        if (NotificationService.enableLogging) {
                            console.log('[NOTIFICATION] GCM Sender result is null or undefined.');
                        }
                        return;
                    }
                    if (NotificationService.enableLogging) {
                        console.log('[NOTIFICATION] GCM Sender successful result:', JSON.stringify(dispatchResult));
                    }

                    // Handle canonical IDs (token replacement)
                    if (dispatchResult.canonical_ids === 1 && primaryToken && dispatchResult.results && dispatchResult.results[0] && dispatchResult.results[0].registration_id) {
                        FiberWrapper(function() {
                            handleTokenUpdate({ gcm: primaryToken }, { gcm: dispatchResult.results[0].registration_id });
                        }).run();
                    }

                    // Handle failed registrations (invalid tokens)
                    if (dispatchResult.failure > 0 && primaryToken) {
                        // Check if any results indicate a specific failure for the primary token
                        const primaryTokenResult = dispatchResult.results && dispatchResult.results[0];
                        if (primaryTokenResult && (primaryTokenResult.error === 'NotRegistered' || primaryTokenResult.error === 'InvalidRegistration')) {
                             FiberWrapper(function() {
                                handleTokenRevocation({ gcm: primaryToken });
                            }).run();
                        }
                    }
                }
            });
        };
    } // End of GCM configuration

    /**
     * Internal function to process and dispatch notifications based on a query.
     * @param {object} notificationQuery - MongoDB query to select client app entries.
     * @param {object} deliveryOptions - Options for the notification payload.
     * @returns {object} An object containing counts of APN and GCM recipients.
     */
    const processNotificationBatches = function(notificationQuery, deliveryOptions) { // Renamed from _querySend

        const iosProcessed = []; // Renamed from countApn
        const androidProcessed = []; // Renamed from countGcm

        NotificationService.clientRegistry.find(notificationQuery).forEach(function(clientAppEntry) { // Renamed from Push.appCollection.find, app
            if (NotificationService.enableLogging) {
                console.log('[NOTIFICATION] Processing client entry for token:', clientAppEntry.deviceToken); // Renamed from app.token
            }

            if (clientAppEntry.deviceToken.apple) { // Renamed from app.token.apn
                iosProcessed.push(clientAppEntry._id);
                if (instanceContext.dispatchAppleNotification) {
                    instanceContext.dispatchAppleNotification(clientAppEntry.deviceToken.apple, deliveryOptions);
                }
            } else if (clientAppEntry.deviceToken.google) { // Renamed from app.token.gcm
                androidProcessed.push(clientAppEntry._id);
                // GCM can handle multiple tokens, but here we send one by one if the client registry stores them individually.
                // If the clientRegistry was designed to group GCM tokens, this part would change.
                if (instanceContext.dispatchGoogleNotification) {
                    instanceContext.dispatchGoogleNotification(clientAppEntry.deviceToken.google, deliveryOptions);
                }
            } else {
                console.error('ERROR: Client entry found with unknown token type:', clientAppEntry);
                // Do not throw, just log and continue to avoid halting batch processing
            }
        });

        if (NotificationService.enableLogging) {
            console.log(`[NOTIFICATION] Dispatched message "${deliveryOptions.title}" to ${iosProcessed.length} iOS and ${androidProcessed.length} Android clients.`);

            // Provide guidance if no clients were found or specific platform clients are missing
            if (iosProcessed.length === 0 && androidProcessed.length === 0) {
                if (NotificationService.clientRegistry.find().count() === 0) {
                    console.log('GUIDE: The "NotificationService.clientRegistry" is currently empty. No devices have registered yet.');
                }
            } else if (iosProcessed.length === 0) {
                if (NotificationService.clientRegistry.find({ 'deviceToken.apple': { $exists: true } }).count() === 0) {
                    console.log('GUIDE: No iOS clients with APN tokens are registered in "NotificationService.clientRegistry".');
                }
            } else if (androidProcessed.length === 0) {
                if (NotificationService.clientRegistry.find({ 'deviceToken.google': { $exists: true } }).count() === 0) {
                    console.log('GUIDE: No Android clients with GCM tokens are registered in "NotificationService.clientRegistry".');
                }
            }
        }

        return {
            iosRecipients: iosProcessed,
            androidRecipients: androidProcessed
        };
    };

    /**
     * Initiates a server-side notification dispatch based on provided instructions.
     * @param {object} dispatchInstructions - Object containing notification details and targeting.
     * @returns {object} Result of the dispatch operation.
     * @throws {Error} If required dispatch instructions are missing or invalid.
     */
    instanceContext.initiateServerDispatch = function(dispatchInstructions) { // Renamed from self.serverSend
        dispatchInstructions = dispatchInstructions || { badge: 0 };
        let targetQuery;

        // Basic validation for mandatory fields
        if (typeof dispatchInstructions.from !== 'string' || dispatchInstructions.from.trim() === '') {
            throw new Error('NotificationService.send: "from" field must be a non-empty string.');
        }
        if (typeof dispatchInstructions.title !== 'string' || dispatchInstructions.title.trim() === '') {
            throw new Error('NotificationService.send: "title" field must be a non-empty string.');
        }
        if (typeof dispatchInstructions.text !== 'string' || dispatchInstructions.text.trim() === '') {
            throw new Error('NotificationService.send: "text" field must be a non-empty string.');
        }

        // Determine target query based on tokens or custom query
        if (dispatchInstructions.token || dispatchInstructions.tokens) {
            const individualTokens = Array.isArray(dispatchInstructions.tokens) ? dispatchInstructions.tokens : [dispatchInstructions.token];

            if (NotificationService.enableLogging) {
                console.log(`[NOTIFICATION] Dispatching message "${dispatchInstructions.title}" to specific token(s):`, individualTokens);
            }

            targetQuery = {
                $or: [
                    { deviceToken: { $in: individualTokens } }, // Match exact token object
                    { _id: { $in: individualTokens } }, // Match by client app ID if tokens are IDs
                    // Fallback to match if token string is in specific platform properties
                    { 'deviceToken.apple': { $in: individualTokens } },
                    { 'deviceToken.google': { $in: individualTokens } }
                ]
            };
        } else if (dispatchInstructions.query) {
            if (NotificationService.enableLogging) {
                console.log(`[NOTIFICATION] Dispatching message "${dispatchInstructions.title}" via custom query:`, dispatchInstructions.query);
            }

            targetQuery = {
                $and: [
                    dispatchInstructions.query, // The user-provided query object
                    { $or: [
                        { 'deviceToken.apple': { $exists: true } }, // Must have an APN token
                        { 'deviceToken.google': { $exists: true } } // Or a GCM token
                    ]}
                ]
            };
        }

        if (targetQuery) {
            return processNotificationBatches(targetQuery, dispatchInstructions);
        } else {
            throw new Error('NotificationService.send: Please specify "token", "tokens", or a "query" for targeting recipients.');
        }
    };

    let dispatchCycleInProgress = false; // Renamed from isSendingNotification

    // Schedule periodic processing of pending notifications
    Meteor.setInterval(function() {
        if (dispatchCycleInProgress) {
            if (NotificationService.enableLogging) {
                console.log('[NOTIFICATION] Skipping notification dispatch cycle: previous cycle still in progress.');
            }
            return; // Skip if a dispatch cycle is already running
        }

        dispatchCycleInProgress = true; // Set a fence to prevent concurrent runs

        try {
            // Retrieve one pending notification, ordered by creation time
            const pendingNotification = NotificationService.messageQueue.findOne(
                { status: { $ne: 'sent' } }, // Renamed from sent: { $ne: true }
                { sort: { createdAt: 1 } }
            );

            if (pendingNotification) {
                // Parse query string if it's a string representation
                if (typeof pendingNotification.query === 'string') {
                    try {
                        pendingNotification.query = JSON.parse(pendingNotification.query);
                    } catch(err) {
                        console.error(`ERROR: Failed to parse query string for notification ${pendingNotification._id}. Error: ${err.message}`);
                        // Mark as failed or skip to prevent infinite loop on bad data
                        NotificationService.messageQueue.update({ _id: pendingNotification._id }, {
                            $set: { status: 'failed', errorMessage: `Query parse error: ${err.message}`, processedAt: new Date() }
                        });
                        return; // Skip this notification and proceed to next cycle
                    }
                }

                // Dispatch the notification
                const dispatchResult = NotificationService.initiateServerDispatch(pendingNotification); // Renamed from result, Push.serverSend

                if (!configSettings.retainSentNotifications) { // Renamed from options.keepNotifications
                    // By default, remove notifications after successful processing
                    NotificationService.messageQueue.removeEntry({ _id: pendingNotification._id }); // Renamed from Push.notifications.remove
                } else {
                    // Update the notification status and metadata
                    NotificationService.messageQueue.updateEntry({ _id: pendingNotification._id }, { // Renamed from Push.notifications.update
                        $set: {
                            status: 'sent', // Renamed from sent: true
                            sentTimestamp: new Date(), // Renamed from sentAt
                            dispatchCounts: dispatchResult // Renamed from count
                        }
                    });
                }

                // Emit an event indicating successful dispatch
                instanceContext.emit('dispatchCompleted', { notificationId: pendingNotification._id, outcome: dispatchResult }); // Renamed from send, result
            }
        } catch (error) {
            console.error('[NOTIFICATION] Unexpected error during notification dispatch cycle:', error);
            // Optionally update the notification to reflect an error during processing
            if (pendingNotification && pendingNotification._id) {
                 NotificationService.messageQueue.update({ _id: pendingNotification._id }, {
                    $set: { status: 'errored', errorMessage: error.message, processedAt: new Date() }
                });
            }
        } finally {
            dispatchCycleInProgress = false; // Release the fence
        }
    }, configSettings.processingIntervalMs || 15000); // Renamed from options.sendInterval, default to 15 seconds
};