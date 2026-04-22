(function moduleLoader(moduleDefinitions, moduleCache, entryPoints) {
  /**
   * Internal function to load a specific module from the definitions.
   * Handles caching, dependency resolution, and error reporting for missing modules.
   * @param {string|number} moduleId - The identifier for the module to load.
   * @param {boolean} [isSilent=false] - If true, suppresses module not found errors from global require.
   * @returns {object} The exports object of the loaded module.
   */
  function loadModule(moduleId, isSilent) {
    // If module is already in cache, return its exports
    if (moduleCache[moduleId]) {
      return moduleCache[moduleId].exports;
    }

    // If module definition doesn't exist, try global/local require
    if (!moduleDefinitions[moduleId]) {
      var globalRequire = typeof require === "function" && require;
      // Attempt to use global require if available and not silent
      if (!isSilent && globalRequire) return globalRequire(moduleId, true);
      // Attempt to use local require (if defined later in scope)
      if (localRequire) return localRequire(moduleId, true);

      // If all attempts fail, throw a module not found error
      var notFoundError = new Error("Cannot find module '" + moduleId + "'");
      notFoundError.code = "MODULE_NOT_FOUND";
      throw notFoundError;
    }

    // Create a new module object and store it in cache
    var moduleObject = moduleCache[moduleId] = {
      exports: {}
    };

    // Execute the module's factory function
    // The factory function receives (require, module, module.exports, global_require_alias, moduleDefinitions, moduleCache, entryPoints)
    moduleDefinitions[moduleId][0].call(
      moduleObject.exports,
      function(dependencyId) {
        // Resolve dependency ID from module's dependency map or use as-is
        var resolvedDependency = moduleDefinitions[moduleId][1][dependencyId];
        // Recursively load the dependency
        return loadModule(resolvedDependency ? resolvedDependency : dependencyId);
      },
      moduleObject,
      moduleObject.exports,
      moduleLoader, // Alias for the top-level module loader
      moduleDefinitions,
      moduleCache,
      entryPoints
    );

    // Return the module's exports
    return moduleCache[moduleId].exports;
  }

  // Determine if a global 'require' function exists
  var localRequire = typeof require === "function" && require;

  // Load all entry point modules
  for (var entryIndex = 0; entryIndex < entryPoints.length; entryIndex++) {
    loadModule(entryPoints[entryIndex]);
  }

  // Return the main module loading function
  return loadModule;
})({
  1: [
    function(require, module, exports) {
      'use strict';
      // Import necessary components for credential management and logging.
      var CredentialManager, HttpRequestAgent, logService, CommonUtilities;

      // Initialize the logging utility for this module.
      logService = require('debug')('platform:credentialManager');
      // Import the HTTP request utility.
      HttpRequestAgent = require('./utils/httpRequestAgent');
      // Import general utilities (though 'throwError' might be handled locally now).
      CommonUtilities = require('./utils/commonUtilities'); // Assuming Utils was renamed

      /**
       * Manages authentication and authorization requests for the platform.
       * This component is responsible for verifying user access to various services
       * or channels by interacting with an authentication endpoint.
       */
      CredentialManager = (function() {
        /**
         * @constructor
         * @param {object} coreSystem - The main system instance, providing access to options and connection.
         */
        function CredentialManager(coreSystem) {
          // Validate coreSystem presence.
          if (!coreSystem) {
            throw new Error("Core system reference is mandatory for CredentialManager initialization.");
          }
          this.coreSystem = coreSystem;
          logService('Initialized new CredentialManager instance.');
        }

        /**
         * Performs an authorization request to a configured endpoint.
         *
         * @param {object} accessOptions - Options specific to this authorization request.
         * @param {object} payloadData - Data to be sent with the authorization request (e.g., channelName).
         * @param {function} completionHandler - Callback function to handle the authorization response.
         *   It receives `(operationError, verificationOutcome)`.
         * @returns {void}
         */
        CredentialManager.prototype.verifyAccess = function(accessOptions, payloadData, completionHandler) {
          // Declare variables for request configuration.
          var credentialPayload, verificationEndpoint, transferMechanism, activeRequestFunction;
          var systemConfiguration = this.coreSystem.options; // Cache system options for easier access.

          // Ensure input parameters are objects.
          accessOptions = accessOptions || {};
          payloadData = payloadData || {};

          // Determine the authentication endpoint, prioritizing request options over system options.
          verificationEndpoint = accessOptions.authEndpoint || systemConfiguration.authEndpoint;

          // Crucial validation: An authentication endpoint must be configured.
          if (!verificationEndpoint) {
            var endpointError = new Error('Authorization endpoint is not configured. Cannot proceed with access verification.');
            endpointError.code = 'CONFIG_ERROR';
            // Use a custom utility or throw directly.
            CommonUtilities.throwError(endpointError.message); // If CommonUtilities.throwError expects string.
            // Alternatively: throw endpointError;
          }

          // Determine the transport mechanism, prioritizing request options.
          transferMechanism = accessOptions.authTransport || systemConfiguration.authTransport;
          // Determine the authentication data payload.
          credentialPayload = accessOptions.authData || systemConfiguration.authData;

          // If credentialPayload is an object, convert it to a JSON string.
          // Add a guard to ensure it's not null/undefined before stringifying.
          if (typeof credentialPayload === 'object' && credentialPayload !== null) {
            try {
              credentialPayload = JSON.stringify(credentialPayload);
            } catch (jsonError) {
              logService('Failed to stringify credential payload:', jsonError);
              return completionHandler({
                message: 'Invalid authorization data format',
                error: jsonError
              });
            }
          }

          // Attach the current socket ID to the payload data for the server.
          // Add a check for connection object existence.
          if (this.coreSystem.connection && this.coreSystem.connection.socketId) {
            payloadData.connectionIdentifier = this.coreSystem.connection.socketId;
          } else {
            logService('Warning: Socket ID not available for authorization request.');
          }


          // If credentialPayload exists and is a non-empty string, attach it to the request data.
          if (credentialPayload && typeof credentialPayload === 'string') {
            payloadData.authorizationData = credentialPayload;
          } else {
            logService('No specific authorization payload provided or it was empty.');
          }

          // Define request method based on transport mechanism.
          var JSONP_TRANSPORT_KEY = 'jsonp';
          if (typeof window !== 'undefined' && transferMechanism === JSONP_TRANSPORT_KEY) {
            activeRequestFunction = HttpRequestAgent.jsonp;
            logService('Using JSONP for authorization request.');
          } else {
            activeRequestFunction = HttpRequestAgent.post;
            logService('Using POST for authorization request.');
          }

          // Log the outgoing authorization request details.
          logService('Initiating access verification request:', {
            targetEndpoint: verificationEndpoint,
            requestPayload: payloadData
          });

          // Execute the request and handle the response.
          return activeRequestFunction(verificationEndpoint, payloadData, function(operationError, verificationOutcome) {
            // Log the received response.
            logService('Received access verification response:', {
              errorDetails: operationError,
              outcomeData: verificationOutcome
            });

            // Process the response: success or failure.
            if (operationError) {
              // Standardize error reporting for the client.
              var clientError = {
                message: 'Access verification failed due to an unexpected response from the server.',
                details: operationError
              };
              logService('Access verification failed:', clientError);
              return completionHandler(clientError);
            } else {
              // Successfully verified access.
              logService('Access verification successful.');
              return completionHandler(null, verificationOutcome);
            }
          });
        };

        return CredentialManager;
      })();

      // Export the CredentialManager class.
      module.exports = CredentialManager;

    }, {
      "./utils/httpRequestAgent": 15,
      "debug": 19,
      "./utils/commonUtilities": 14 // Assuming Utils was renamed to CommonUtilities
    }
  ],
  2: [
    function(require, module, exports) {
      'use strict';
      // Importing necessary modules and utilities.
      var BaseTopicStream, EventDispatcher, streamLogger,
        // Helper function to establish prototype inheritance.
        _inheritPrototype = function(derivedClass, baseClass) {
          // Copy static properties from base to derived class.
          for (var key in baseClass) {
            if (_hasOwnProperty.call(baseClass, key)) derivedClass[key] = baseClass[key];
          }

          // Intermediate constructor to avoid calling baseClass constructor during inheritance setup.
          function ConstructorProxy() {
            this.constructor = derivedClass;
          }
          ConstructorProxy.prototype = baseClass.prototype;
          derivedClass.prototype = new ConstructorProxy();
          derivedClass.superPrototype = baseClass.prototype; // Renamed __super__ for clarity.
          return derivedClass;
        },
        // Cached reference to Object.prototype.hasOwnProperty.
        _hasOwnProperty = {}.hasOwnProperty;

      // Initialize the logging utility for topic streams.
      streamLogger = require('debug')('platform:topicStream');
      // Import the event dispatcher utility.
      EventDispatcher = require('../utils/eventDispatcher'); // Renamed EventEmitter

      /**
       * Base class for managing communication channels (topic streams).
       * Provides core subscription, unsubscription, and event handling capabilities.
       */
      BaseTopicStream = (function(EventDispatcherBase) {
        _inheritPrototype(BaseTopicStream, EventDispatcherBase);

        /**
         * @constructor
         * @param {string} streamName - The unique identifier for this topic stream.
         * @param {object} coreSystemRef - Reference to the core system instance.
         */
        function BaseTopicStream(streamName, coreSystemRef) {
          // Validate input parameters.
          if (!streamName || typeof streamName !== 'string') {
            streamLogger('Error: Stream name must be a non-empty string.');
            throw new Error('Invalid stream name provided.');
          }
          if (!coreSystemRef) {
            streamLogger('Error: Core system reference is missing for stream initialization.');
            throw new Error('Missing core system reference.');
          }

          this.streamName = streamName;
          this.coreSystem = coreSystemRef;
          this.isActivelySubscribed = false; // Renamed 'subscribed' for clarity and added 'this'.
          streamLogger('Topic stream initialized:', this.streamName);
        }

        /**
         * Internal method for stream-specific authorization.
         * By default, grants immediate authorization. Subclasses can override.
         *
         * @param {function} authCompletion - Callback `(authIssue, authResult)` to signal authorization status.
         * @returns {void}
         */
        BaseTopicStream.prototype._performAuthorization = function(authCompletion) {
          streamLogger('Default authorization for stream "%s" (no specific auth required).', this.streamName);
          // Simulate an asynchronous call for consistency.
          setTimeout(function() {
            authCompletion(null, {
              status: 'authorized',
              message: 'Default authorization granted.'
            });
          }, 0);
        };

        /**
         * Initiates the subscription process for this topic stream.
         * This involves performing authorization and then sending a subscribe event to the connection.
         * @returns {void}
         */
        BaseTopicStream.prototype.activateSubscription = function() {
          var self = this; // Capture 'this' for use in nested callbacks.
          streamLogger('Attempting to activate subscription for stream: %s', self.streamName);

          // Guard clause: If already subscribed, prevent redundant action.
          if (self.isActivelySubscribed) {
            streamLogger('Stream "%s" is already subscribed. Skipping activation.', self.streamName);
            return;
          }

          self._performAuthorization(function(authIssue, authResponseDetails) {
            if (authIssue) {
              streamLogger('Authorization failed for stream "%s":', self.streamName, authIssue);
              // Dispatch an error event if authorization fails.
              return self.processIncomingEvent({
                name: 'platform_stream:subscription_error',
                data: authIssue
              });
            }

            streamLogger('Authorization successful for stream "%s". Sending subscription request.', self.streamName);

            // Prepare the subscription payload.
            var subscriptionPayload = {
              streamId: self.streamName
            };
            if (authResponseDetails) {
              // Add signature and channelData if provided by authorization.
              if (authResponseDetails.signature !== undefined) {
                subscriptionPayload.signature = authResponseDetails.signature;
              }
              if (authResponseDetails.channelData !== undefined) {
                subscriptionPayload.channelData = authResponseDetails.channelData;
              }
            }

            // Send the subscription event to the core system's connection.
            self.coreSystem.connection.sendEvent('platform_stream:subscribe', subscriptionPayload);
          });
        };

        /**
         * Deactivates the subscription for this topic stream.
         * Sends an unsubscribe event to the connection.
         * @returns {void}
         */
        BaseTopicStream.prototype.deactivateSubscription = function() {
          streamLogger('Deactivating subscription for stream: %s', this.streamName);
          // Send the unsubscribe event to the core system's connection.
          this.coreSystem.connection.sendEvent('platform_stream:unsubscribe', {
            streamId: this.streamName
          });
        };

        /**
         * Processes an incoming event related to this topic stream.
         * Dispatches specific events based on the incoming event's name.
         *
         * @param {object} incomingEvent - The event object received from the connection.
         * @param {string} incomingEvent.name - The name of the event.
         * @param {object} incomingEvent.data - The data associated with the event.
         * @returns {void}
         */
        BaseTopicStream.prototype.processIncomingEvent = function(incomingEvent) {
          if (!incomingEvent || !incomingEvent.name) {
            streamLogger('Received invalid incoming event:', incomingEvent);
            return;
          }
          streamLogger('Processing event "%s" for stream "%s".', incomingEvent.name, this.streamName);

          var eventData = incomingEvent.data;
          var eventName = incomingEvent.name;

          // Handle common subscription lifecycle events.
          switch (eventName) {
            case 'platform_stream:subscription_succeeded':
              this.isActivelySubscribed = true;
              this.emit('platform:subscription_established', eventData);
              streamLogger('Subscription established for stream: %s', this.streamName);
              break;
            case 'platform_stream:subscription_error':
              this.isActivelySubscribed = false;
              this.emit('platform:subscription_failed', eventData);
              streamLogger('Subscription failed for stream: %s', this.streamName, eventData);
              break;
            default:
              // For all other events, re-emit them directly.
              this.emit(eventName, eventData);
              break;
          }
        };

        /**
         * Disconnects the stream, primarily by updating its subscription status.
         * @returns {void}
         */
        BaseTopicStream.prototype.terminateStream = function() {
          this.isActivelySubscribed = false;
          streamLogger('Stream "%s" terminated and subscription status reset.', this.streamName);
        };

        return BaseTopicStream;

      })(EventDispatcher);

      // Export the BaseTopicStream class.
      module.exports = BaseTopicStream;

    }, {
      "../utils/eventDispatcher": 13,
      "debug": 19
    }
  ],
  3: [
    function(require, module, exports) {
      'use strict';
      // Import various topic stream types and utility for inheritance.
      var BaseTopicStream, TopicStreamRegistry, AudienceTopicStream, SecureTopicStream,
        _hasOwnProp = {}.hasOwnProperty; // Cached reference for hasOwnProperty.

      BaseTopicStream = require('./topicStream'); // Renamed Channel to BaseTopicStream
      SecureTopicStream = require('./secureTopicStream'); // Renamed PrivateChannel
      AudienceTopicStream = require('./audienceTopicStream'); // Renamed PresenceChannel


      /**
       * Manages a collection of topic streams, providing methods for adding,
       * removing, and batch operations.
       * It acts as a central registry for all active communication streams.
       */
      TopicStreamRegistry = (function() {
        /**
         * @constructor
         * @param {object} systemCore - The core system instance, providing connection status.
         */
        function TopicStreamRegistry(systemCore) {
          if (!systemCore) {
            throw new Error("System core reference is required for TopicStreamRegistry.");
          }
          this.systemCore = systemCore;
          this._streamMap = {}; // Renamed _store to _streamMap for clarity.
          console.log('TopicStreamRegistry initialized.'); // Added a simple log for initialization.
        }

        /**
         * Factory method to instantiate the correct type of topic stream
         * based on its identifier prefix.
         *
         * @param {string} streamIdentifier - The name/identifier of the stream.
         * @returns {BaseTopicStream} An instance of a specific topic stream type.
         */
        TopicStreamRegistry.prototype._instantiateStream = function(streamIdentifier) {
          if (!streamIdentifier || typeof streamIdentifier !== 'string') {
            throw new Error('Invalid stream identifier provided for instantiation.');
          }

          var PRIVATE_PREFIX = 'private-';
          var PRESENCE_PREFIX = 'presence-';

          if (streamIdentifier.indexOf(PRIVATE_PREFIX) === 0) {
            return new SecureTopicStream(streamIdentifier, this.systemCore);
          } else if (streamIdentifier.indexOf(PRESENCE_PREFIX) === 0) {
            return new AudienceTopicStream(streamIdentifier, this.systemCore);
          } else {
            return new BaseTopicStream(streamIdentifier, this.systemCore);
          }
        };

        /**
         * Checks if the underlying system connection is in a 'connected' state.
         * @returns {boolean} True if connected, false otherwise.
         */
        TopicStreamRegistry.prototype._checkConnectivityStatus = function() {
          var connectionState = this.systemCore.connection ? this.systemCore.connection.state : null;
          return connectionState === 'connected';
        };

        /**
         * Registers a new topic stream or retrieves an existing one.
         * If the system is connected, it also attempts to subscribe to the stream.
         *
         * @param {string} streamIdentifier - The unique name of the stream to add/get.
         * @returns {BaseTopicStream} The registered or retrieved topic stream instance.
         */
        TopicStreamRegistry.prototype.registerStream = function(streamIdentifier) {
          if (!streamIdentifier || typeof streamIdentifier !== 'string') {
            throw new Error('A valid stream identifier is required to register a stream.');
          }

          var currentStream;
          // Use hasOwnProperty for more robust check.
          if (!_hasOwnProp.call(this._streamMap, streamIdentifier)) {
            currentStream = this._instantiateStream(streamIdentifier);
            this._streamMap[streamIdentifier] = currentStream;
            console.log('New stream "%s" instantiated and registered.', streamIdentifier);
          } else {
            currentStream = this._streamMap[streamIdentifier];
            console.log('Stream "%s" already registered, returning existing instance.', streamIdentifier);
          }

          // If the system is currently connected, attempt to subscribe to the stream.
          if (this._checkConnectivityStatus() && !currentStream.isActivelySubscribed) {
            console.log('System is connected; attempting to subscribe to stream "%s".', streamIdentifier);
            currentStream.activateSubscription();
          }

          return currentStream;
        };

        /**
         * Deregisters a topic stream. If the system is connected, it also
         * attempts to unsubscribe from the stream.
         *
         * @param {string} streamIdentifier - The name of the stream to remove.
         * @returns {BaseTopicStream|undefined} The removed stream instance, or undefined if not found.
         */
        TopicStreamRegistry.prototype.deregisterStream = function(streamIdentifier) {
          if (!streamIdentifier || typeof streamIdentifier !== 'string') {
            console.warn('Attempted to deregister with an invalid stream identifier.');
            return undefined;
          }

          var currentStream = this._streamMap[streamIdentifier];
          if (currentStream) {
            if (this._checkConnectivityStatus()) {
              console.log('System is connected; attempting to unsubscribe from stream "%s".', streamIdentifier);
              currentStream.deactivateSubscription();
            }
            delete this._streamMap[streamIdentifier];
            console.log('Stream "%s" deregistered successfully.', streamIdentifier);
          } else {
            console.warn('Attempted to deregister non-existent stream "%s".', streamIdentifier);
          }
          return currentStream;
        };

        /**
         * Retrieves a registered topic stream by its identifier.
         *
         * @param {string} streamIdentifier - The name of the stream to find.
         * @returns {BaseTopicStream|undefined} The stream instance, or undefined if not found.
         */
        TopicStreamRegistry.prototype.retrieveStream = function(streamIdentifier) {
          if (!streamIdentifier || typeof streamIdentifier !== 'string') {
            console.warn('Attempted to retrieve with an invalid stream identifier.');
            return undefined;
          }
          return this._streamMap[streamIdentifier];
        };

        /**
         * Activates subscriptions for all currently registered streams.
         * This is typically called when the core system establishes a connection.
         * @returns {Array<Promise|void>} An array of results from each subscription attempt.
         */
        TopicStreamRegistry.prototype.activateAllStreams = function() {
          var activationResults = [];
          var internalMap = this._streamMap;
          var isSystemConnected = this._checkConnectivityStatus();

          if (!isSystemConnected) {
            console.warn('Cannot activate all streams: System is not connected.');
            return activationResults; // Return empty array if not connected.
          }

          // Iterate over all registered streams and activate their subscriptions.
          for (var streamIdentifier in internalMap) {
            if (_hasOwnProp.call(internalMap, streamIdentifier)) {
              var currentStream = internalMap[streamIdentifier];
              // Only activate if not already subscribed to avoid redundant calls.
              if (!currentStream.isActivelySubscribed) {
                console.log('Activating subscription for registered stream: %s', streamIdentifier);
                activationResults.push(currentStream.activateSubscription());
              } else {
                console.log('Stream "%s" is already active, skipping activation.', streamIdentifier);
              }
            }
          }
          return activationResults;
        };

        /**
         * Deactivates all currently registered streams.
         * This is typically called when the core system disconnects.
         * @returns {Array<Promise|void>} An array of results from each disconnection attempt.
         */
        TopicStreamRegistry.prototype.deactivateAllStreams = function() {
          var disconnectionResults = [];
          var internalMap = this._streamMap;

          // Iterate over all registered streams and disconnect them.
          for (var streamIdentifier in internalMap) {
            if (_hasOwnProp.call(internalMap, streamIdentifier)) {
              var currentStream = internalMap[streamIdentifier];
              console.log('Deactivating stream: %s', streamIdentifier);
              disconnectionResults.push(currentStream.terminateStream());
            }
          }
          return disconnectionResults;
        };

        return TopicStreamRegistry;

      })();

      // Export the TopicStreamRegistry class.
      module.exports = TopicStreamRegistry;

    }, {
      "./topicStream": 2,
      "./audienceTopicStream": 4,
      "./secureTopicStream": 5
    }
  ],
  4: [
    function(require, module, exports) {
      'use strict';
      // Import base classes and utilities for presence channels.
      var AudienceTopicStream, SecureTopicStream, ParticipantCollection,
        // Helper function for inheritance (assuming it's defined globally or imported).
        _inheritPrototype = function(derivedClass, baseClass) {
          for (var key in baseClass) {
            if (_hasOwnProperty.call(baseClass, key)) derivedClass[key] = baseClass[key];
          }

          function ConstructorProxy() {
            this.constructor = derivedClass;
          }
          ConstructorProxy.prototype = baseClass.prototype;
          derivedClass.prototype = new ConstructorProxy();
          derivedClass.superPrototype = baseClass.prototype;
          return derivedClass;
        },
        _hasOwnProperty = {}.hasOwnProperty;

      // Import the SecureTopicStream as the base for PresenceChannel.
      SecureTopicStream = require('./secureTopicStream'); // Renamed PrivateChannel
      // Import the Users management utility.
      ParticipantCollection = require('./participantCollection'); // Renamed Users

      /**
       * Represents an audience (presence) topic stream.
       * Extends SecureTopicStream to add functionality for tracking channel participants.
       */
      AudienceTopicStream = (function(SecureTopicStreamBase) {
        _inheritPrototype(AudienceTopicStream, SecureTopicStreamBase);

        /**
         * @constructor
         * @param {string} streamId - The unique identifier for this audience stream.
         * @param {object} systemRef - Reference to the core system instance.
         */
        function AudienceTopicStream(streamId, systemRef) {
          // Validate input parameters.
          if (!streamId || typeof streamId !== 'string') {
            throw new Error('Invalid stream ID provided for AudienceTopicStream.');
          }
          if (!systemRef) {
            throw new Error('System reference is missing for AudienceTopicStream initialization.');
          }

          this.streamId = streamId;
          this.systemRef = systemRef;

          // Call the constructor of the parent class (SecureTopicStream).
          AudienceTopicStream.superPrototype.constructor.call(this, this.streamId, this.systemRef);

          // Initialize a collection to manage participants in this stream.
          this.participants = new ParticipantCollection();
          console.log('AudienceTopicStream "%s" initialized with participant collection.', this.streamId);
        }

        /**
         * Overrides the base authorization method to handle participant data from auth results.
         *
         * @param {function} authCompletionCallback - Callback `(authorizationError, permissionResult)`.
         * @returns {void}
         */
        AudienceTopicStream.prototype._verifyStreamPermissions = function(authCompletionCallback) {
          var self = this; // Capture 'this' for use in the callback.
          console.log('Performing authorization for audience stream "%s".', self.streamId);

          // Call the parent's authorization method first.
          return AudienceTopicStream.superPrototype._performAccessVerification.call(self, function(authorizationError, permissionResult) {
            if (!authorizationError) {
              // Attempt to parse user data from the authorization result.
              try {
                // Ensure permissionResult and channelData exist before parsing.
                if (permissionResult && permissionResult.channelData) {
                  var channelSpecificData = JSON.parse(permissionResult.channelData);
                  // Set the current user's ID in the participant collection.
                  if (channelSpecificData && channelSpecificData.userId) {
                    self.participants.setCurrentUserId(channelSpecificData.userId);
                    console.log('Current user ID "%s" set for stream "%s".', channelSpecificData.userId, self.streamId);
                  } else {
                    console.warn('Authorization result for "%s" did not contain a valid userId in channelData.', self.streamId);
                  }
                } else {
                  console.warn('Authorization result for "%s" did not contain channelData for participant parsing.', self.streamId);
                }
              } catch (parsingIssue) {
                // Log parsing errors but don't fail authorization if it's already successful.
                console.error('Error parsing channelData for stream "%s":', self.streamId, parsingIssue);
              }
            } else {
              console.error('Authorization failed for audience stream "%s":', self.streamId, authorizationError);
            }
            // Always invoke the original callback with the authorization outcome.
            return authCompletionCallback(authorizationError, permissionResult);
          });
        };

        /**
         * Overrides the base event handling to manage participant-specific events.
         *
         * @param {object} streamEvent - The incoming event object.
         * @returns {void}
         */
        AudienceTopicStream.prototype.processStreamEvent = function(streamEvent) {
          if (!streamEvent || !streamEvent.name) {
            console.warn('Received invalid stream event in AudienceTopicStream:', streamEvent);
            return;
          }

          var eventData = streamEvent.data;
          var eventName = streamEvent.name;

          // Define common event names as constants for clarity.
          var SUB_SUCCESS_EVENT = 'platform_stream:subscription_succeeded';
          var SUB_ERROR_EVENT = 'platform_stream:subscription_error';
          var USER_ADDED_EVENT = 'platform_stream:user_added';
          var USER_REMOVED_EVENT = 'platform_stream:user_removed';

          switch (eventName) {
            case SUB_SUCCESS_EVENT:
              this.isActivelySubscribed = true;
              // Initialize the participant collection with the list of users.
              this.participants.initializeParticipants(eventData);
              this.emit('platform:subscription_established', this.participants);
              console.log('Audience stream "%s" subscription established. Participants loaded.', this.streamId);
              break;
            case SUB_ERROR_EVENT:
              this.isActivelySubscribed = false;
              this.emit('platform:subscription_failed', eventData);
              console.error('Audience stream "%s" subscription failed:', this.streamId, eventData);
              break;
            case USER_ADDED_EVENT:
              // Add a new participant to the collection and emit an event.
              var newParticipant = this.participants.addParticipant(eventData);
              if (newParticipant) {
                this.emit('platform:participant_joined', newParticipant);
                console.log('Participant "%s" joined stream "%s".', newParticipant.uniqueId, this.streamId);
              } else {
                console.warn('Failed to add participant from event data:', eventData);
              }
              break;
            case USER_REMOVED_EVENT:
              // Remove a participant from the collection and emit an event.
              var departedParticipant = this.participants.removeParticipant(eventData);
              if (departedParticipant) { // Only emit if a participant was actually removed.
                this.emit('platform:participant_left', departedParticipant);
                console.log('Participant "%s" left stream "%s".', departedParticipant.uniqueId, this.streamId);
              } else {
                console.warn('Attempted to remove non-existent participant from stream "%s" with data:', this.streamId, eventData);
              }
              break;
            default:
              // For other events, delegate to the parent class's handler.
              AudienceTopicStream.superPrototype.processIncomingEvent.call(this, streamEvent);
              break;
          }
        };

        /**
         * Overrides the base disconnect method to also reset participant data.
         * @returns {void}
         */
        AudienceTopicStream.prototype.closeStream = function() {
          // Clear all participant data when the stream is disconnected.
          this.participants.clearAllParticipants();
          console.log('Participant collection for stream "%s" reset.', this.streamId);
          // Call the parent's disconnect method.
          return AudienceTopicStream.superPrototype.terminateStream.call(this);
        };

        return AudienceTopicStream;

      })(SecureTopicStream);

      // Export the AudienceTopicStream class.
      module.exports = AudienceTopicStream;

    }, {
      "./secureTopicStream": 5,
      "./participantCollection": 6
    }
  ],
  5: [
    function(require, module, exports) {
      'use strict';
      // Import base classes and utilities for secure channels.
      var BaseTopicStream, SecureTopicStream, HttpRequestAgent, CommonUtilities,
        // Helper function for inheritance.
        _inheritPrototype = function(derivedClass, baseClass) {
          for (var key in baseClass) {
            if (_hasOwnProperty.call(baseClass, key)) derivedClass[key] = baseClass[key];
          }

          function ConstructorProxy() {
            this.constructor = derivedClass;
          }
          ConstructorProxy.prototype = baseClass.prototype;
          derivedClass.prototype = new ConstructorProxy();
          derivedClass.superPrototype = baseClass.prototype;
          return derivedClass;
        },
        _hasOwnProperty = {}.hasOwnProperty;

      // Import the base topic stream class.
      BaseTopicStream = require('./topicStream'); // Renamed Channel
      // Import the HTTP request utility (though not directly used here, it's part of the dependency chain).
      HttpRequestAgent = require('../utils/httpRequestAgent'); // Renamed Requester
      // Import general utilities (if `Utils` was used directly, it would be here).
      CommonUtilities = require('../utils/commonUtilities'); // Renamed Utils

      /**
       * Represents a secure (private) topic stream.
       * Extends BaseTopicStream to add specific authorization logic
       * that interacts with the main system's credential manager.
       */
      SecureTopicStream = (function(BaseTopicStreamBase) {
        _inheritPrototype(SecureTopicStream, BaseTopicStreamBase);

        /**
         * @constructor
         * @param {string} streamIdentifier - The unique identifier for this secure stream.
         * @param {object} coreSystem - Reference to the core system instance.
         */
        function SecureTopicStream(streamIdentifier, coreSystem) {
          // Ensure parent constructor is called with correct context and arguments.
          // Using `apply` for forward compatibility with variable arguments, though direct `call` is also an option.
          SecureTopicStream.superPrototype.constructor.apply(this, arguments);
          console.log('SecureTopicStream "%s" initialized.', streamIdentifier);
        }

        /**
         * Overrides the base authorization method to use the system's credential manager.
         * This method is responsible for obtaining authorization for private channels.
         *
         * @param {function} verificationCallback - Callback `(operationError, verificationOutcome)`.
         * @returns {void}
         */
        SecureTopicStream.prototype._performAccessVerification = function(verificationCallback) {
          console.log('Initiating access verification for secure stream: %s', this.streamName);

          // Guard clause for core system and credential manager availability.
          if (!this.coreSystem || !this.coreSystem.credentialManager) {
            var missingManagerError = {
              message: 'Core system or credential manager not available to perform access verification.',
              code: 'AUTH_DEPENDENCY_MISSING'
            };
            console.error(missingManagerError.message);
            return verificationCallback(missingManagerError);
          }

          var verificationOptions = {}; // No specific options for this call, but passed for consistency.
          var verificationPayload = {
            streamIdentifier: this.streamName // Use the renamed property.
          };

          // Delegate the actual authorization request to the core system's credential manager.
          return this.coreSystem.credentialManager.verifyAccess(
            verificationOptions,
            verificationPayload,
            verificationCallback
          );
        };

        return SecureTopicStream;

      })(BaseTopicStream);

      // Export the SecureTopicStream class.
      module.exports = SecureTopicStream;

    }, {
      "../utils/commonUtilities": 14,
      "../utils/httpRequestAgent": 15,
      "./topicStream": 2
    }
  ],
  6: [
    function(require, module, exports) {
      'use strict';
      /**
       * Manages a collection of participants within a presence-enabled topic stream.
       * Provides methods for adding, removing, retrieving, and iterating over participants.
       */
      var ParticipantCollection;

      ParticipantCollection = (function() {
        /**
         * @constructor
         */
        function ParticipantCollection() {
          this.clearAllParticipants(); // Call reset method for initial state.
          console.log('ParticipantCollection initialized.');
        }

        /**
         * Resets the entire participant collection to its initial empty state.
         * @returns {void}
         */
        ParticipantCollection.prototype.clearAllParticipants = function() {
          this._participantMap = {}; // Renamed _users to _participantMap.
          this.participantCount = 0; // Renamed count.
          this._currentUserId = null; // Renamed _myId.
          this.currentUserProfile = null; // Renamed me.
          console.log('Participant collection cleared.');
        };

        /**
         * Formats raw participant data into a standardized user profile object.
         *
         * @param {object} rawParticipant - The raw participant data received from the server.
         * @returns {object|null} A formatted participant object or null if input is invalid.
         */
        ParticipantCollection.prototype._transformParticipantData = function(rawParticipant) {
          if (!rawParticipant || typeof rawParticipant !== 'object') {
            console.warn('Attempted to format invalid raw participant data:', rawParticipant);
            return null;
          }
          // Use explicit checks and default to `undefined` instead of `void 0`.
          var participantId = rawParticipant.userId !== undefined ? rawParticipant.userId : undefined;
          var participantInfo = rawParticipant.userInfo !== undefined ? rawParticipant.userInfo : undefined;

          return {
            uniqueId: participantId, // Renamed 'id' to 'uniqueId'.
            profileInfo: participantInfo // Renamed 'info' to 'profileInfo'.
          };
        };

        /**
         * Sets the unique ID of the current user for this collection.
         * This ID is used to identify the local user in the participant list.
         *
         * @param {string} currentId - The ID of the current user.
         * @returns {void}
         */
        ParticipantCollection.prototype.setCurrentUserId = function(currentId) {
          if (currentId === null || currentId === undefined || currentId === '') {
            console.warn('Attempted to set an invalid current user ID:', currentId);
            return;
          }
          this._currentUserId = currentId;
          console.log('Current user ID set to: %s', currentId);
        };

        /**
         * Initializes the participant collection with an array of participant data.
         * This typically happens upon successful subscription to a presence stream.
         *
         * @param {Array<object>} participantList - An array of raw participant objects.
         * @returns {void}
         */
        ParticipantCollection.prototype.initializeParticipants = function(participantList) {
          if (!Array.isArray(participantList)) {
            console.error('Invalid participant list provided for initialization. Expected an array.');
            return;
          }

          this._participantMap = {};
          this.participantCount = 0;

          // Iterate using forEach for modern readability.
          participantList.forEach(function(rawParticipant) {
            if (rawParticipant && rawParticipant.userId) {
              var formattedParticipant = this._transformParticipantData(rawParticipant);
              if (formattedParticipant) {
                this._participantMap[rawParticipant.userId] = formattedParticipant;
                this.participantCount++;
              }
            } else {
              console.warn('Skipping invalid participant data during initialization:', rawParticipant);
            }
          }, this); // Pass 'this' context to forEach.

          // Set the current user's profile if their ID is known.
          if (this._currentUserId) {
            this.currentUserProfile = this.getParticipantById(this._currentUserId);
            if (this.currentUserProfile) {
              console.log('Current user profile set: %s', this.currentUserProfile.uniqueId);
            } else {
              console.warn('Current user ID "%s" not found in the initialized participant list.', this._currentUserId);
            }
          }
        };

        /**
         * Adds a new participant to the collection or updates an existing one.
         *
         * @param {object} rawParticipant - The raw participant data to add.
         * @returns {object|null} The formatted participant object, or null if input is invalid.
         */
        ParticipantCollection.prototype.addParticipant = function(rawParticipant) {
          if (!rawParticipant || !rawParticipant.userId) {
            console.warn('Cannot add participant: Invalid raw participant data or missing userId.', rawParticipant);
            return null;
          }

          var participantId = rawParticipant.userId;
          // Check if participant already exists before incrementing count.
          if (!this._participantMap[participantId]) {
            this.participantCount++;
            console.log('New participant "%s" added to collection.', participantId);
          } else {
            console.log('Updating existing participant "%s" in collection.', participantId);
          }

          var formattedParticipant = this._transformParticipantData(rawParticipant);
          if (formattedParticipant) {
            this._participantMap[participantId] = formattedParticipant;
            return this.getParticipantById(participantId);
          } else {
            console.error('Failed to format participant data for "%s".', participantId);
            return null;
          }
        };

        /**
         * Removes a participant from the collection.
         *
         * @param {object} rawParticipant - The raw participant data containing the userId to remove.
         * @returns {object|null} The removed formatted participant object, or null if not found/invalid input.
         */
        ParticipantCollection.prototype.removeParticipant = function(rawParticipant) {
          if (!rawParticipant || !rawParticipant.userId) {
            console.warn('Cannot remove participant: Invalid raw participant data or missing userId.', rawParticipant);
            return null;
          }

          var participantIdToRemove = rawParticipant.userId;
          var participantProfile = this._participantMap[participantIdToRemove];

          if (participantProfile) {
            delete this._participantMap[participantIdToRemove];
            this.participantCount--;
            console.log('Participant "%s" removed from collection.', participantIdToRemove);
            return participantProfile;
          } else {
            console.warn('Attempted to remove non-existent participant "%s".', participantIdToRemove);
            return null;
          }
        };

        /**
         * Iterates over each participant in the collection and applies a callback function.
         *
         * @param {function(object):*} iteratorFunction - The function to call for each participant.
         *   It receives the formatted participant object as an argument.
         * @returns {Array<*>} An array containing the results of each `iteratorFunction` call.
         */
        ParticipantCollection.prototype.forEachParticipant = function(iteratorFunction) {
          if (typeof iteratorFunction !== 'function') {
            console.error('forEachParticipant expects a function as an argument.');
            return [];
          }

          var iterationResults = [];
          var mapReference = this._participantMap;

          // Using Object.keys and forEach for clearer iteration.
          Object.keys(mapReference).forEach(function(participantId) {
            var participant = mapReference[participantId];
            iterationResults.push(iteratorFunction(participant));
          });
          return iterationResults;
        };

        /**
         * Retrieves a formatted participant object by their unique ID.
         *
         * @param {string} participantId - The unique ID of the participant to retrieve.
         * @returns {object|undefined} The formatted participant object, or undefined if not found.
         */
        ParticipantCollection.prototype.getParticipantById = function(participantId) {
          if (!participantId) {
            console.warn('Attempted to get participant with an invalid ID.');
            return undefined;
          }
          return this._participantMap[participantId];
        };

        return ParticipantCollection;

      })();

      // Export the ParticipantCollection class.
      module.exports = ParticipantCollection;

    }, {}
  ],
  7: [
    function(require, module, exports) {
      'use strict';
      // Import necessary modules and define local variables.
      var MessagingCoordinator, CommunicationProtocol, logManager; // Removed unused variables: api, event, trivialRequestResponseAPIEventMapping, _fn;

      // Initialize the logging utility for this module.
      logManager = require('debug')('platform:messagingCoordinator');
      // Import the communication protocol definitions.
      CommunicationProtocol = require('./communicationProtocol'); // Renamed Protocol

      /**
       * Manages chat-related operations, including user login, message dispatch, etc.
       * It orchestrates interactions between the UI, core system, and authentication.
       */
      MessagingCoordinator = (function() {
        /**
         * @constructor
         * @param {object} systemInterface - The core system instance, providing connection and authorizer.
         */
        function MessagingCoordinator(systemInterface) {
          // Validate input.
          if (!systemInterface) {
            logManager('Error: System interface is mandatory for MessagingCoordinator initialization.');
            throw new Error("Missing system interface for MessagingCoordinator.");
          }
          this.systemInterface = systemInterface;
          this._cachedLoginConfig = null; // Renamed _loginOptions
          this.activeUserProfile = null; // Renamed user
          this.currentStatus = MessagingCoordinator.STATUS_INITIALIZED; // Renamed state, using a constant.
          logManager('MessagingCoordinator initialized with status: %s', this.currentStatus);
        }

        // Define status constants for better readability and maintainability.
        MessagingCoordinator.STATUS_INITIALIZED = 'initialized';
        MessagingCoordinator.STATUS_LOGGING_IN = 'loggingIn';
        MessagingCoordinator.STATUS_LOGGED_IN = 'loggedIn';
        MessagingCoordinator.STATUS_FAILED = 'failed';

        /**
         * Separates request parameters from callback handlers in a given options object.
         * This allows flexible API calls where handlers can be mixed with data.
         *
         * @param {object} inputArguments - The original options object, potentially containing handlers.
         * @returns {Array<object, object>} A tuple: [requestParameters, eventCallbacks].
         */
        MessagingCoordinator.prototype._parseRequestArguments = function(inputArguments) {
          var requestParameters = {};
          var eventCallbacks = {};

          if (!inputArguments || typeof inputArguments !== 'object') {
            logManager('Warning: Invalid or empty input arguments provided for parsing.');
            return [requestParameters, eventCallbacks];
          }

          // Iterate over properties to separate data from functions.
          for (var propKey in inputArguments) {
            // Ensure property belongs to the object itself, not its prototype chain.
            if (Object.prototype.hasOwnProperty.call(inputArguments, propKey)) {
              var propValue = inputArguments[propKey];
              if (typeof propValue === 'function') {
                eventCallbacks[propKey] = propValue;
              } else {
                requestParameters[propKey] = propValue;
              }
            }
          }
          return [requestParameters, eventCallbacks];
        };

        /**
         * Dispatches a message (event) to the core system's connection.
         * Handles pre-request checks and post-request callback processing.
         *
         * @param {string} messageType - The name of the event to send.
         * @param {object} requestParameters - Data parameters for the event.
         * @param {boolean} requiresAcknowledgement - Flag indicating if an ACK is needed.
         * @returns {void}
         */
        MessagingCoordinator.prototype._dispatchMessage = function(messageType, requestParameters, requiresAcknowledgement) {
          var parsedArgs = this._parseRequestArguments(requestParameters);
          var actualRequestParameters = parsedArgs[0];
          var eventCallbacks = parsedArgs[1];

          // Guard clause: Only allow message dispatch if the user is logged in.
          if (this.currentStatus !== MessagingCoordinator.STATUS_LOGGED_IN) {
            logManager('Message dispatch aborted: User is not logged in. Current status: %s', this.currentStatus);
            if (typeof eventCallbacks.onError === "function") {
              eventCallbacks.onError(CommunicationProtocol.errorCodes.accessDenied); // Renamed error code.
            }
            return;
          }

          var responseHandler = function(operationFailure, operationResult) {
            if (operationFailure) {
              logManager('Message dispatch failed for type "%s":', messageType, operationFailure);
              if (typeof eventCallbacks.onError === "function") {
                eventCallbacks.onError(operationFailure);
              }
            } else {
              logManager('Message dispatch successful for type "%s".', messageType);
              if (typeof eventCallbacks.onSuccess === "function") {
                eventCallbacks.onSuccess(operationResult);
              }
            }
          };

          if (requiresAcknowledgement) {
            responseHandler.needSendAck = true; // Mark the callback for ACK.
          }

          // Ensure connection exists before sending.
          if (!this.systemInterface.connection) {
            logManager('Error: Cannot dispatch message "%s", system connection is unavailable.', messageType);
            if (typeof eventCallbacks.onError === "function") {
              eventCallbacks.onError({
                message: 'Connection unavailable',
                code: CommunicationProtocol.errorCodes.noConnectivity
              });
            }
            return;
          }

          logManager('Sending message "%s" with parameters:', messageType, actualRequestParameters);
          this.systemInterface.connection.sendEvent(messageType, actualRequestParameters, responseHandler);
        };

        /**
         * Initiates the user login process for the chat system.
         * This involves authorization and then sending a login event to the server.
         *
         * @param {object} [loginConfig={}] - Configuration options for the login,
         *   including authData and callbacks (onSuccess, onError).
         * @returns {void}
         */
        MessagingCoordinator.prototype.initiateSession = function(loginConfig) {
          loginConfig = loginConfig || {}; // Ensure options is an object.
          this.currentStatus = MessagingCoordinator.STATUS_LOGGING_IN;
          this._cachedLoginConfig = loginConfig; // Cache login configuration.
          logManager('Initiating session login. Current status: %s', this.currentStatus);

          // Guard clause: Check connection state before proceeding.
          var connectionStatus = this.systemInterface.connection ? this.systemInterface.connection.state : 'disconnected';
          if (connectionStatus !== 'connected') {
            logManager('Login deferred: System not connected. Current connection state: %s', connectionStatus);
            // The login process will resume upon connection if _cachedLoginConfig is set.
            return;
          }

          var parsedArgs = this._parseRequestArguments(loginConfig);
          var requestParameters = parsedArgs[0];
          var eventCallbacks = parsedArgs[1];

          // Retrieve authentication data, prioritizing request config over system options.
          if (!requestParameters.authData) {
            var engineOpts = this.systemInterface.options;
            requestParameters.authData = (engineOpts != null) ? engineOpts.authData : undefined;
            if (requestParameters.authData) {
              logManager('Using system-wide authentication data for login.');
            }
          }

          // Prepare payload for authorization, indicating it's for chat login.
          var authPayload = {
            chatLogin: true
          };

          // Step 1: Authorize the login request.
          this.systemInterface.credentialManager.verifyAccess(
            requestParameters,
            authPayload,
            (function(self) { // Using IIFE to capture 'this' as 'self'.
              return function(operationFailure, authenticationOutcome) {
                if (operationFailure) {
                  self.currentStatus = MessagingCoordinator.STATUS_FAILED;
                  logManager('Login authorization failed:', operationFailure);
                  if (typeof eventCallbacks.onError === "function") {
                    eventCallbacks.onError(operationFailure);
                  }
                  return;
                }

                // Attempt to parse user profile data from the authorization outcome.
                try {
                  if (authenticationOutcome && authenticationOutcome.userData) {
                    self.activeUserProfile = JSON.parse(authenticationOutcome.userData);
                    logManager('User profile parsed from authorization outcome.');
                  } else {
                    self.activeUserProfile = {}; // Initialize as empty object if no user data.
                    logManager('No user profile data found in authorization outcome.');
                  }
                } catch (parsingIssue) {
                  logManager('Error parsing user profile data from authorization outcome:', parsingIssue);
                  // Continue login attempt, but with potentially incomplete user data.
                  self.activeUserProfile = self.activeUserProfile || {}; // Ensure it's an object.
                }

                // Step 2: Send the user login event to the backend.
                self.systemInterface.connection.sendEvent('platform_chat:user:login', authenticationOutcome, function(eventFailure, eventResult) {
                  if (eventFailure) {
                    // Check for specific connection errors that might warrant a retry or different handling.
                    if (eventFailure.code === CommunicationProtocol.errorCodes.noConnectivity) {
                      logManager('Login event failed due to no connectivity. Will re-attempt on reconnect.');
                      // Do not set status to failed, as it's a transient connection issue.
                      // The cached login config will trigger a retry on 'connected' event.
                      return;
                    }

                    self.currentStatus = MessagingCoordinator.STATUS_FAILED;
                    logManager('Final login event failed:', eventFailure);
                    if (typeof eventCallbacks.onError === "function") {
                      eventCallbacks.onError(eventFailure);
                    }
                    return;
                  }

                  // Merge additional properties from the login event result into the user profile.
                  if (eventResult && typeof eventResult === 'object') {
                    for (var propKey in eventResult) {
                      if (Object.prototype.hasOwnProperty.call(eventResult, propKey)) {
                        self.activeUserProfile[propKey] = eventResult[propKey];
                      }
                    }
                  }

                  self.currentStatus = MessagingCoordinator.STATUS_LOGGED_IN;
                  self._cachedLoginConfig = null; // Clear cached config on successful login.
                  logManager('User successfully logged in. Current status: %s', self.currentStatus);
                  if (typeof eventCallbacks.onSuccess === "function") {
                    eventCallbacks.onSuccess(self.activeUserProfile);
                  }
                });
              };
            })(this) // End of IIFE.
          );
        };
        // The original code snippet ends abruptly here.
        // Assuming the rest of the class definition would follow.
        // For Type III clone, I'll stop here and maintain the structure.

        // ... (rest of ChatManager/MessagingCoordinator methods would go here) ...

        return MessagingCoordinator;
      })();

      // Export the MessagingCoordinator class.
      module.exports = MessagingCoordinator;

    }, {
      "./communicationProtocol": 10,
      "debug": 19
    }
  ]
});