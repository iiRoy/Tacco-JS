(function() {
  'use strict'; // Enforce strict mode for cleaner code practices

  /**
   * @module ngCommsHub
   * @description
   * This module facilitates inter-frame communication within an AngularJS application
   * using the `window.postMessage` API. It provides services for sending and
   * receiving messages across different browser contexts (e.g., iframes, new windows).
   */
  var commsApp;

  // Initialize the core Angular module for inter-process communication
  commsApp = angular.module("ngCommsHub", ['ng']);

  /**
   * @name ngCommsHub.run
   * @description
   * The run block sets up global listeners and handlers for message events.
   * It registers an outbound message handler and an inbound message listener.
   */
  commsApp.run([
    '$window',
    'messageBroker',
    '$rootScope',
    function(currentWindow, messageBroker, appScope) {

      /**
       * @event outboundSignal
       * @description
       * Listens for an internal Angular event to dispatch a message via `postMessage`.
       * This allows other parts of the application to trigger messages.
       * @param {Object} evt - The Angular event object.
       * @param {string|Object} msgPayload - The data to be sent.
       * @param {string} [targetDomain='*'] - The target origin for the message.
       */
      appScope.$on('outboundSignal', function(evt, msgPayload, targetDomain) {
        // Ensure a valid target domain is specified; default to '*' for any origin.
        const effectiveDomain = targetDomain || '*';

        // Determine the recipient of the message.
        // Prioritize a manually set sender on the rootScope, otherwise default to the parent window.
        const messageRecipient = appScope.activeSender || currentWindow.parent;

        // Dispatch the message using the browser's native postMessage API.
        messageRecipient.postMessage(msgPayload, effectiveDomain);
      });

      /**
       * @event message
       * @description
       * Listens for native `message` events on the window object.
       * This handler processes incoming messages from other contexts.
       * It attempts to parse JSON data and broadcasts it internally.
       */
      currentWindow.addEventListener('message', function(rawEvent) {
        // Normalize the event object to ensure cross-browser compatibility and access original event data.
        const msgEvent = rawEvent.originalEvent || rawEvent;

        // Basic validation: ensure the event and its data property exist.
        if (!msgEvent || !msgEvent.data) {
          // If no data, or event is malformed, simply ignore this message.
          return;
        }

        // Optional: Ignore messages originating from the same window to prevent infinite loops or self-messaging.
        if (msgEvent.source === currentWindow) {
          // console.log("Ignoring message from self.");
          return;
        }

        let processedData = null;
        // Store the source of the message on the rootScope for potential replies.
        appScope.activeSender = msgEvent.source;

        try {
          // Attempt to parse the incoming data as JSON.
          // This assumes messages are typically JSON-serialized.
          processedData = angular.fromJson(msgEvent.data);
        } catch (parsingError) {
          // If JSON parsing fails, treat the raw data as the message payload.
          // Log an error/warning for debugging purposes.
          console.warn('ngCommsHub: Failed to parse incoming message as JSON.', parsingError, 'Raw data:', msgEvent.data);
          processedData = msgEvent.data;
        }

        // Broadcast the processed incoming message throughout the Angular application.
        // This allows various components to subscribe to incoming messages.
        appScope.$root.$broadcast('inboundSignal', processedData);

        // Optionally, log the incoming message via the message broker service.
        return messageBroker.recordMessage(processedData);
      });
    }
  ]);

  /**
   * @name ngCommsHub.factory:messageBroker
   * @description
   * Provides a service for managing and dispatching inter-frame messages.
   * It keeps a log of received messages and offers methods to send new ones.
   */
  commsApp.factory("messageBroker", [
    '$rootScope',
    function(mainAppScope) {
      // Internal collection to store a history of incoming messages.
      const receivedMsgLog = [];

      /**
       * @interface IMessageBroker
       * @description
       * Public API for the messageBroker service.
       */
      const commsInterface = {
        /**
         * @function recordMessage
         * @description
         * Adds a new message to the internal log. Triggers a digest cycle
         * to update any bound UI components.
         * @param {string|Object} newMsgEntry - The message to be logged.
         * @returns {Array} The current array of logged messages.
         */
        recordMessage: function(newMsgEntry) {
          if (newMsgEntry) { // Only log non-empty messages
            receivedMsgLog.push(newMsgEntry);
            // Ensure Angular's digest cycle runs to update any watchers.
            // This is crucial if message logging affects the UI.
            if (!mainAppScope.$$phase) { // Avoids "$digest already in progress" errors
                mainAppScope.$digest();
            }
          }
          return receivedMsgLog;
        },

        /**
         * @function retrieveLastMessage
         * @description
         * Retrieves the most recently received message from the log.
         * @returns {string|Object|undefined} The last message, or undefined if the log is empty.
         */
        retrieveLastMessage: function() {
          // Use slice to get the last element without modifying the original array.
          const lastEntry = receivedMsgLog.slice(-1)[0];
          return lastEntry;
        },

        /**
         * @function dispatchMessage
         * @description
         * Sends a message to another browsing context. This function
         * internally broadcasts an 'outboundSignal' event.
         * @param {string|Object} msgContent - The data to be sent.
         * @param {string} [destinationOrigin='*'] - The target origin (e.g., "http://example.com").
         *                                           Defaults to '*' for any origin.
         * @returns {void}
         */
        dispatchMessage: function(msgContent, destinationOrigin) {
          // Set a default destination origin if none is provided.
          const effectiveOrigin = destinationOrigin || '*';

          // Broadcast an internal Angular event to trigger the actual postMessage call
          // in the run block, passing the message content and the target origin.
          mainAppScope.$broadcast('outboundSignal', msgContent, effectiveOrigin);
        }
      };

      return commsInterface;
    }
  ]);

}).call(this); // Execute the IIFE with `this` context