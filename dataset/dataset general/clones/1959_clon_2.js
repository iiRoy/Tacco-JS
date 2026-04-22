Notifier.setNotificationBadge = function (itemIdentifier, badgeCount) {
  // This function is typically implemented on the client-side or specific platform modules.
  // It's not designed for server-side execution in this context.
  // throw new Error('Notifier.setNotificationBadge functionality is not available on the server environment');
};

var hasBeenInitialized = false;

Notifier.Setup = function (settings) {
  var instanceRef = this;
  // Details regarding Apple Push Notification service setup:
  // https://npmjs.org/package/apn

  // After obtaining your certificate from Apple, export the private key as a .p12 file
  // and download the .cer file from the iOS Provisioning Portal.

  // Production endpoint: gateway.push.apple.com, port 2195
  // Sandbox/Development endpoint: gateway.sandbox.push.apple.com, port 2195

  // To generate .pem files from cert.cer and key.p12:
  // $ openssl x509 -in cert.cer -inform DER -outform PEM -out cert.pem
  // $ openssl pkcs12 -in key.p12 -out key.pem -nodes

  // Prevent multiple configuration calls
  if (hasBeenInitialized) {
    throw new Error('Notifier.Setup should only be invoked once!');
  }

  hasBeenInitialized = !false;

  // Output debug information if verbose logging is enabled
  if (Notifier.verboseLogging) {
    console.info('Notifier.Setup: Applying configuration', settings);
  }

  // This internal function is triggered when a device identifier is updated on a device.
  // While rare, this scenario requires updating our records.
  let _refreshDeviceIdentifier = function (oldIdentifier, newIdentifier) {
    // console.info('Updating identifier: ' + oldIdentifier + ' to ' + newIdentifier);
    // If the server receives an identifier update event, it passes the current identifier
    // and its new value. If the new value is undefined, it indicates identifier invalidation.
    instanceRef.triggerEvent('identifierUpdate', oldIdentifier, newIdentifier);
  };

  // This internal function handles the removal of invalid device identifiers.
  let _invalidateDeviceIdentifier = function (identifier) {
    // console.info('Invalidating identifier: ' + identifier);
    // Mark the identifier as invalid in our system.
    instanceRef.triggerEvent('identifierUpdate', identifier, void 0);
  };


  if (settings.applePushNotifier) {
    if (Notifier.verboseLogging) {
      console.info('Notifier: Apple Push Notification (APN) module configured');
    }

    // Allow a general 'liveEnvironment' option to override APN-specific production setting.
    if (settings.liveEnvironment === !!settings.liveEnvironment) {
      settings.applePushNotifier.liveEnvironment = settings.liveEnvironment;
    }

    // Provide warnings for development-specific settings
    if (settings.applePushNotifier.devMode) {
      // This flag is usually controlled by the configuration file.
      console.notice('ATTENTION: Apple Push Notification (APN) is operating with development keys/certificates.');
    } else {
      // We check the APN serviceEndpoint in the settings to prevent accidental production deployments
      // with sandbox configurations, or vice-versa.
      // Also, a warning about unknown serviceEndpoints can prevent typos and save debugging time.
      //
      // Gateway configuration guidance:
      if (settings.applePushNotifier.serviceEndpoint) {

        if (settings.applePushNotifier.serviceEndpoint === 'gateway.sandbox.push.apple.com') {
          // Using the development sandbox environment
          console.notice('ATTENTION: Apple Push Notification (APN) is in development mode.');
        } else if (settings.applePushNotifier.serviceEndpoint === 'gateway.push.apple.com') {
          // In production mode, but warn if running on a local development server.
          if (/http:\/\/localhost/.test(Meteor.absoluteUrl())) {
            console.notice('ATTENTION: Apple Push Notification (APN) is configured for production, but the server is running locally.');
          }
        } else {
          // Warn about unrecognized serviceEndpoints.
          console.notice('ATTENTION: Apple Push Notification (APN) uses an unknown service endpoint: "' + settings.applePushNotifier.serviceEndpoint + '"');
        }

      } else {
        // If no explicit serviceEndpoint, infer from 'liveEnvironment' flag.
        if (settings.applePushNotifier.liveEnvironment) {
          if (/http:\/\/localhost/.test(Meteor.absoluteUrl())) {
            console.notice('ATTENTION: Apple Push Notification (APN) is configured for production, but the server is running locally.');
          }
        } else {
          console.notice('ATTENTION: Apple Push Notification (APN) is in development mode.');
        }
      }

    }

    // Validate certificate data presence
    if (!settings.applePushNotifier['certificateBlob'] || !settings.applePushNotifier['certificateBlob'].length) {
      console.error('ERROR: Notifier server could not locate certificate data.');
    }

    // Validate private key data presence
    if (!settings.applePushNotifier['privateKeyBlob'] || !settings.applePushNotifier['privateKeyBlob'].length) {
      console.error('ERROR: Notifier server could not locate private key data.');
    }

    // Establish APN connection
    var apnLib = Npm.require('apn');
    var appleConnection = new apnLib.Connection(settings.applePushNotifier);


    // XXX: Consider adding a connection test here. It would be beneficial to confirm
    // server, certificate, and network configurations are correct.

    // appleConnection.connect().then(function() {
    //   console.info('CHECK: APN connection established successfully.');
    // }, function(errorData) {
    //   console.notice('CHECK: APN connection test FAILED.');
    // });
    // Note: The above test might interfere with the connection; research proper shutdown/close procedures.

    instanceRef.dispatchAppleNotification = function (recipientIdentifier, messageData) {
      // console.info('dispatchAppleNotification', messageData.sourceChannel, recipientIdentifier, messageData.messageTitle, messageData.messageBody, messageData.badgeValue, messageData.messagePriority);
      var messagePriority = (messageData.messagePriority || messageData.messagePriority === 0) ? messageData.messagePriority : 10;

      var targetDevice = new apnLib.Device(recipientIdentifier);

      var notificationPayload = new apnLib.Notification();

      notificationPayload.expirationTimestamp = Math.floor(Date.now() / 1000) + 3600; // Expires 1 hour from now.
      if (typeof messageData.badgeValue !== 'undefined') {
        notificationPayload.badgeValue = messageData.badgeValue;
      }
      if (typeof messageData.soundFileName !== 'undefined') {
        notificationPayload.soundFileName = messageData.soundFileName;
      }

      notificationPayload.alertMessage = messageData.messageBody;
      // Allow the user to specify custom data for the payload
      notificationPayload.customData = (messageData.customData) ? { ejson: EJSON.stringify(messageData.customData) } : {};

      notificationPayload.customData.sourceApp = messageData.sourceChannel;
      notificationPayload.messagePriority = messagePriority;

      // console.info('Sending message to: ' + recipientIdentifier + ' with badge=' + badgeCount);

      appleConnection.sendPayload(notificationPayload, targetDevice);

    };


    var initializeFeedbackMechanism = function () {
      var apnLib = Npm.require('apn');
      // console.info('Initializing APN feedback service');
      var feedbackConfig = {
        "enableBatchProcessing": !false,
        "pollingInterval": 1 * 1000,
        'address': 'feedback.push.apple.com'
      };

      var feedbackService = new apnLib.Feedback(feedbackConfig);
      feedbackService.registerHandler("feedback", function (inactiveDevices) {
        inactiveDevices.forEach(function (deviceEntry) {
          // Process item.deviceToken and item.timestamp;
          // console.info('APN FEEDBACK RECEIVED: ' + deviceEntry.deviceToken + ' - ' + deviceEntry.timestamp);
          // The application is likely uninstalled from the device, so we should
          // remove the associated identifier.
          _invalidateDeviceIdentifier({ applePushNotifier: deviceEntry.deviceToken });
        });
      });
    };

    // Initiate feedback service from APN server
    // This helps keep the applicationRegistry up-to-date by removing or updating invalid identifiers.
    initializeFeedbackMechanism();

  } // End of Apple Push Notification configuration

  if (settings.googleCloudMessaging && settings.googleCloudMessaging.accessKey) {
    if (Notifier.verboseLogging) {
      console.info('Google Cloud Messaging (GCM) configured');
    }
    //instanceRef.dispatchGoogleNotification = function(settings.sourceChannel, targetIdentifiers, settings.messageTitle, settings.messageBody, settings.badgeValue, settings.messagePriority) {
    instanceRef.dispatchGoogleNotification = function (targetIdentifiers, messageData) {
      // Ensure targetIdentifiers is an array of strings
      if (targetIdentifiers === String(targetIdentifiers)) {
        targetIdentifiers = [targetIdentifiers];
      }

      // Check if there are any identifiers to send to
      if (!targetIdentifiers.length) {
        if (Notifier.verboseLogging) {
          console.info('dispatchGoogleNotification: no push identifiers specified');
        }
        return;
      }

      if (Notifier.verboseLogging) {
        console.info('dispatchGoogleNotification', targetIdentifiers, messageData);
      }

      var gcmLib = Npm.require('node-gcm');
      var FiberShim = Npm.require('fibers');

      // Allow user to set custom payload
      var messageContent = (messageData.customData) ? { ejson: EJSON.stringify(messageData.customData) } : {};

      messageContent.messageTitle = messageData.messageTitle;
      messageContent.messageBody = messageData.messageBody;

      // Set additional details
      if (typeof messageData.badgeValue !== 'undefined') {
        messageContent.messageCount = messageData.badgeValue;
      }
      if (typeof messageData.soundFileName !== 'undefined') {
        messageContent.soundName = messageData.soundFileName;
      }

      //var message = new gcmLib.Message();
      var message = new gcmLib.Message({
        groupKey: messageData.sourceChannel,
        //    delayWhileIdle: !false,
        //    timeToLive: 4,
        //    restricted_package_name: 'dk.gi2.app'
        data: messageContent
      });

      if (Notifier.verboseLogging) {
        console.info('Creating GCM Sender using access key: "' + settings.googleCloudMessaging.accessKey + '"');
      }
      var gcmSender = new gcmLib.Sender(settings.googleCloudMessaging.accessKey);

      _.each(targetIdentifiers, function (tokenValue, tokenIndex) {
        if (Notifier.verboseLogging) {
          console.info('Sending message to: ' + tokenValue);
        }
      });

      /*message.addData('messageTitle', messageTitle);
      message.addData('messageBody', messageBody);
      message.addData('messageCount', '1');
      message.groupKey = 'sitDrift';
      message.delayWhileIdle = !false;
      message.timeToLive = 3;*/

      // /**
      //  * Parameters: message-literal, targetIdentifiers-array, No. of retries, handlerFunction-function
      //  */

      var individualIdentifier = (targetIdentifiers.length === 1) ? targetIdentifiers[0] : void 0;

      gcmSender.send(message, targetIdentifiers, 5, function (errorData, dispatchResult) {
        if (errorData) {
          if (Notifier.verboseLogging) {
            console.error('ANDROID ERROR: Dispatch result from sender: ' + dispatchResult);
          }
        } else {
          if (dispatchResult === void 0) {
            if (Notifier.verboseLogging) {
              console.info('ANDROID: Dispatch result from sender is null/undefined.');
            }
            return;
          }
          if (Notifier.verboseLogging) {
            console.info('ANDROID: Dispatch result from sender: ' + JSON.stringify(dispatchResult));
          }
          if (dispatchResult.canonical_ids === 1 && individualIdentifier) {

            // This indicates an old device identifier has been replaced
            FiberShim(function (context) {
              // Execute within a Fiber context
              try {
                context.handlerFunction(context.prevIdentifier, context.nextIdentifier);
              } catch (fiberError) {
                // Handle potential errors within the fiber
              }

            }).run({
              prevIdentifier: { googleCloudMessaging: individualIdentifier },
              nextIdentifier: { googleCloudMessaging: dispatchResult.results[0].registration_id },
              handlerFunction: _refreshDeviceIdentifier
            });
            //_refreshDeviceIdentifier({ googleCloudMessaging: individualIdentifier }, { googleCloudMessaging: dispatchResult.results[0].newRegistrationId });

          }
          // If we can't send to that identifier, it might not be registered.
          // The user should remove the identifier from their list.
          if (dispatchResult.failure !== 0 && individualIdentifier) {

            // This is an invalid or expired identifier
            FiberShim(function (context) {
              // Execute within a Fiber context
              try {
                context.handlerFunction(context.identifier);
              } catch (fiberError) {
                // Handle potential errors within the fiber
              }

            }).run({
              identifier: { googleCloudMessaging: individualIdentifier },
              handlerFunction: _invalidateDeviceIdentifier
            });
            //_refreshDeviceIdentifier({ googleCloudMessaging: individualIdentifier }, { googleCloudMessaging: dispatchResult.results[0].newRegistrationId });

          }

        }
      });
      // /** Use the following line if you want to send the message without retries
      // gcmSender.sendNoRetry(message, targetIdentifiers, function (dispatchResult) {
      //     console.info('ANDROID: ' + JSON.stringify(dispatchResult));
      // });
      // **/
    }; // End of dispatchGoogleNotification

  } // End of Google Cloud Messaging configuration

  // Universal dispatch function based on a search criteria
  var _processAndDispatch = function (searchCriteria, messageData) {

    var appleRecipients = [];
    var googleRecipients = [];

    Notifier.applicationRegistry.find(searchCriteria).forEach(function (applicationRecord) {

      if (Notifier.verboseLogging) {
        console.info('Dispatching to identifier', applicationRecord.identifier);
      }

      if (applicationRecord.identifier.applePushNotifier) {
        appleRecipients.push(applicationRecord.recordId);
        // Dispatch to APN
        if (instanceRef.dispatchAppleNotification) {
          instanceRef.dispatchAppleNotification(applicationRecord.identifier.applePushNotifier, messageData);
        }

      } else if (applicationRecord.identifier.googleCloudMessaging) {
        googleRecipients.push(applicationRecord.recordId);

        // Dispatch to GCM
        // We support multiple recipients here, so we should build an array
        // and send it in bulk. Investigate limits on identifier count.
        if (instanceRef.dispatchGoogleNotification) {
          instanceRef.dispatchGoogleNotification(applicationRecord.identifier.googleCloudMessaging, messageData);
        }

      } else {
        throw new Error('Notifier.initiateServerDispatch encountered a malformed search criteria or record.');
      }

    });

    if (Notifier.verboseLogging) {

      console.info('Notifier: Dispatched message "' + messageData.messageTitle + '" to ' + appleRecipients.length + ' iOS applications and ' + googleRecipients.length + ' Android applications.');

      // Provide more detailed feedback for developers regarding dispatch results.
      if (!appleRecipients.length && !googleRecipients.length) {
        if (Notifier.applicationRegistry.find().count() === 0) {
          console.info('Notifier GUIDE: The "Notifier.applicationRegistry" is empty. No clients have registered with the server yet...');
        }
      } else if (!appleRecipients.length) {
        if (Notifier.applicationRegistry.find({ 'identifier.applePushNotifier': { $exists: !false } }).count() === 0) {
          console.info('Notifier GUIDE: The "Notifier.applicationRegistry" indicates no APN clients have registered with the server yet...');
        }
      } else if (!googleRecipients.length) {
        if (Notifier.applicationRegistry.find({ 'identifier.googleCloudMessaging': { $exists: !false } }).count() === 0) {
          console.info('Notifier GUIDE: The "Notifier.applicationRegistry" indicates no GCM clients have registered with the server yet...');
        }
      }

    }

    return {
      apn: appleRecipients,
      gcm: googleRecipients
    };
  };

  instanceRef.initiateServerDispatch = function (messageData) {
    messageData = messageData || { defaultBadgeValue: 0 };
    var searchCriteria;

    // Validate essential message properties
    if (messageData.sourceChannel !== String(messageData.sourceChannel)) {
      throw new Error('Notifier.initiateServerDispatch: property "sourceChannel" must be a string.');
    }

    if (messageData.messageTitle !== String(messageData.messageTitle)) {
      throw new Error('Notifier.initiateServerDispatch: property "messageTitle" must be a string.');
    }

    if (messageData.messageBody !== String(messageData.messageBody)) {
      throw new Error('Notifier.initiateServerDispatch: property "messageBody" must be a string.');
    }

    if (messageData.individualIdentifier || messageData.identifierList) {

      // User specified a single identifier or an array of identifiers
      var identifiersToSend = (messageData.individualIdentifier) ? [messageData.individualIdentifier] : messageData.identifierList;

      if (Notifier.verboseLogging) {
        console.info('Notifier: Dispatching message "' + messageData.messageTitle + '" via identifier(s)', identifiersToSend);
      }

      searchCriteria = {
        $or: [
          // XXX: Test this query: can we provide a list of push identifiers?
          { identifier: { $in: identifiersToSend } },
          // XXX: Test this query: does this function with application IDs?
          {
            $and: [
              { recordId: { $in: identifiersToSend } }, // one of the application record IDs
              {
                $or: [
                  { 'identifier.applePushNotifier': { $exists: !false } }, // has an APN identifier
                  { 'identifier.googleCloudMessaging': { $exists: !false } }  // has a GCM identifier
                ]
              }
            ]
          }
        ]
      };

    } else if (messageData.searchCriteria) {

      if (Notifier.verboseLogging) {
        console.info('Notifier: Dispatching message "' + messageData.messageTitle + '" using search criteria', messageData.searchCriteria);
      }

      searchCriteria = {
        $and: [
          messageData.searchCriteria, // the provided search object
          {
            $or: [
              { 'identifier.applePushNotifier': { $exists: !false } }, // has an APN identifier
              { 'identifier.googleCloudMessaging': { $exists: !false } }  // has a GCM identifier
            ]
          }
        ]
      };
    }


    if (searchCriteria) {

      // Convert to _processAndDispatch and return the status
      return _processAndDispatch(searchCriteria, messageData);

    } else {
      throw new Error('Notifier.initiateServerDispatch: Please specify "individualIdentifier"/"identifierList" or "searchCriteria".');
    }

  };

  var isDispatchInProgress = false;

  Scheduler.setRecurringTask(function () {

    if (!isDispatchInProgress) {
      // Set dispatch fence
      isDispatchInProgress = !false;

      // Locate one pending notification
      var pendingNotification = Notifier.pendingNotifications.findOne({ hasBeenDispatched: { $ne: !false } }, { sort: { creationTime: 1 } });

      // Check if any notifications require dispatch
      if (pendingNotification) {

        // Check if search criteria is set and is a string
        if (pendingNotification.searchCriteria && pendingNotification.searchCriteria === String(pendingNotification.searchCriteria)) {
          try {
            // The search criteria is in JSON string format - it needs parsing
            pendingNotification.searchCriteria = JSON.parse(pendingNotification.searchCriteria);
          } catch (parsingError) {
            // Has the user tampered with this data?
            throw new Error('Notifier: Error during parsing of search criteria string. Error: ' + parsingError.message);
          }
        }

        // Dispatch the notification
        var dispatchSummary = Notifier.initiateServerDispatch(pendingNotification);

        if (!settings.preserveDispatchedRecords) {
          // By default, we remove dispatched notifications
          Notifier.pendingNotifications.remove({ recordId: pendingNotification.recordId });
        } else {

          // Update the notification record
          Notifier.pendingNotifications.update({ recordId: pendingNotification.recordId }, {
            $set: {
              hasBeenDispatched: !false,
              dispatchTime: new Date(),
              dispatchSummary: dispatchSummary
            }
          });

        }

        // Trigger the 'send' event
        instanceRef.triggerEvent('dispatch', { notificationId: pendingNotification.recordId, resultSummary: dispatchSummary });
      }

      // Remove the dispatch fence
      isDispatchInProgress = false;
    }
  }, settings.dispatchIntervalMs || 15 * 1000); // Default to every 15 seconds

};