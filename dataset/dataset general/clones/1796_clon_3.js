var appMod = angular.module('dataExchangeModule', []);

appMod.provider('dataChannelService', function() {
  // Internal configuration settings for the communication service.
  // These can be modified before the service is instantiated.
  var providerSettings = {
    enableDispatchLogging: true,
    maxLoggedDispatches: 50,
    logLevel: 'debug' // Can be 'debug', 'info', 'warn', 'error'
  };

  /**
   * Allows external configuration of the dataChannelService provider.
   * This method is accessible during the Angular configuration phase.
   * @param {object} options - An object containing configuration properties to apply.
   */
  this.setup = function(options) {
    angular.extend(providerSettings, options);
  };

  /**
   * The factory function that creates the actual dataChannelService instance.
   * This is where the core logic resides and where dependencies are injected.
   * @param {object} $scopeHost - The Angular $rootScope service for digest cycle management.
   * @param {object} $systemLogger - The Angular $log service for logging activities.
   * @returns {object} The public interface of the dataChannelService.
   */
  this.$get = ['$rootScope', '$log', function($scopeHost, $systemLogger) {
    // The main object representing our communication layer.
    var commServiceInstance = {};

    // A registry to store all callback functions subscribed to various message types.
    // Structure: { 'messageTypeA': [handler1, handler2], 'messageTypeB': [handler3] }
    commServiceInstance.registeredHandlers = {};

    // A record of all messages dispatched by the client, primarily for debugging or testing.
    // Structure: { 'messageTypeX': [[payload1], [payload2]], 'messageTypeY': [[payload3]] }
    commServiceInstance.clientDispatches = {};

    // A simple counter for the total number of messages processed (both incoming and outgoing).
    commServiceInstance.totalProcessedMessages = 0;

    /**
     * A utility function to safely trigger an Angular digest cycle.
     * Prevents "$digest already in progress" errors.
     * @param {object} targetScope - The scope on which to apply the function.
     * @param {function} executionFn - The function to execute within the digest cycle.
     */
    var safeScopeApply = function(targetScope, executionFn) {
      if (!targetScope || typeof executionFn !== 'function') {
        $systemLogger.warn('Invalid scope or function provided to safeScopeApply.');
        return;
      }
      var currentPhase = targetScope.$root.$$phase;
      if (currentPhase === '$apply' || currentPhase === '$digest') {
        try {
          executionFn();
        } catch (error) {
          $systemLogger.error('Error during safeScopeApply execution:', error);
        }
      } else {
        targetScope.$apply(executionFn);
      }
    };

    /**
     * Subscribes a callback function to a specific message type.
     * When a message of this type is received, the handler will be invoked.
     * @param {string} messageIdentifier - The unique string identifier for the message type.
     * @param {function} handlerFunction - The function to execute when the message is received.
     * @returns {boolean} True if subscription was successful, false otherwise.
     */
    commServiceInstance.subscribeToMessage = function(messageIdentifier, handlerFunction) {
      if (typeof messageIdentifier !== 'string' || messageIdentifier.trim() === '') {
        $systemLogger.error('Subscription failed: Invalid message identifier provided.');
        return false;
      }
      if (typeof handlerFunction !== 'function') {
        $systemLogger.error('Subscription failed for "' + messageIdentifier + '": Handler must be a function.');
        return false;
      }

      // Initialize the array for this message type if it doesn't exist.
      if (!this.registeredHandlers[messageIdentifier]) {
        this.registeredHandlers[messageIdentifier] = [];
      }
      this.registeredHandlers[messageIdentifier].push(handlerFunction);
      $systemLogger[providerSettings.logLevel]('Subscribed handler for message type:', messageIdentifier);
      return true;
    };

    /**
     * Dispatches a message from the client, optionally including a payload.
     * This method logs the dispatched message based on provider settings.
     * @param {string} messageIdentifier - The type of message being dispatched.
     * @param {...any} messageData - Any number of additional arguments representing the message payload.
     */
    commServiceInstance.dispatchClientMessage = function(messageIdentifier /*, ...messageData */ ) {
      this.totalProcessedMessages++;
      const payloadArguments = Array.from(arguments).slice(1); // Extract payload from arguments.

      // Log the dispatched message if logging is enabled in the provider settings.
      if (providerSettings.enableDispatchLogging) {
        if (!this.clientDispatches[messageIdentifier]) {
          this.clientDispatches[messageIdentifier] = [];
        }
        // Enforce maximum logged messages per type to prevent excessive memory usage.
        if (this.clientDispatches[messageIdentifier].length >= providerSettings.maxLoggedDispatches) {
          this.clientDispatches[messageIdentifier].shift(); // Remove the oldest entry.
        }
        this.clientDispatches[messageIdentifier].push(payloadArguments);
        $systemLogger[providerSettings.logLevel]('Dispatched message:', messageIdentifier, 'Payload:', payloadArguments);
      }
    };

    /**
     * Simulates the receipt of an incoming message from an external source (e.g., server).
     * This will trigger all handlers subscribed to the given message type.
     * @param {string} messageIdentifier - The type of incoming message.
     * @param {...any} receivedData - Any number of additional arguments representing the incoming message data.
     */
    commServiceInstance.ingestExternalMessage = function(messageIdentifier /*, ...receivedData */ ) {
      this.totalProcessedMessages++;
      const incomingData = [...arguments].slice(1); // Use modern spread syntax for arguments.

      const activeHandlers = this.registeredHandlers[messageIdentifier];

      // Only proceed if there are handlers registered for this message type.
      if (activeHandlers && activeHandlers.length > 0) {
        $systemLogger[providerSettings.logLevel]('Ingesting message:', messageIdentifier, 'with data:', incomingData);

        // Iterate over a shallow copy of the handlers array to prevent issues if handlers modify the array during iteration.
        [...activeHandlers].forEach(function(currentHandler) {
          safeScopeApply($scopeHost, function() {
            try {
              // Invoke the handler function with the received data as its arguments.
              currentHandler.apply(null, incomingData);
            } catch (handlerError) {
              $systemLogger.error('Error executing handler for message type "' + messageIdentifier + '":', handlerError);
            }
          });
        });
      } else {
        $systemLogger.warn('No active handlers found for incoming message type:', messageIdentifier);
      }
    };

    /**
     * Provides access to the recorded client dispatches. Useful for testing.
     * @returns {object} An object containing all recorded client dispatches.
     */
    commServiceInstance.getRecordedDispatches = function() {
      return angular.copy(this.clientDispatches); // Return a deep copy to prevent external modification.
    };

    /**
     * Resets the log of client-dispatched messages. Useful for cleaning up test states.
     */
    commServiceInstance.clearDispatchLog = function() {
      this.clientDispatches = {};
      $systemLogger[providerSettings.logLevel]('Client dispatch log has been cleared.');
    };

    // Return the constructed service instance.
    return commServiceInstance;
  }];
});