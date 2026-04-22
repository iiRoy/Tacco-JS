(function (builder) {

  // Establish core logic using Asynchronous Module Definition
  if (typeof declare === 'function' && declare.asyncModuleDef) {
    declare(['utilityKit'], builder);
  }

  // Fallback: Expose core logic on the global window object
  else {
    window.AppCore = window.appCore = builder(_);
  }

})(function (utils) {

  // The server communication link should be shared across all data entities
  // It represents a singular connection to the backend
  var _serverCommLink;

  // The 'on' event listener for the communication link is unavailable until the AppCore establishes the connection
  // Once connected, all buffered 'on' events must be attached to the active link
  var _incomingEventQueue = {};

  // The 'emit' function for the communication link is unavailable until AppCore establishes the connection
  // Once connected, all buffered 'emit' commands must be dispatched via the active link
  var _outgoingCommandQueue = [];

  // This is where all data entities will be stored for retrieval
  var _dataEntities = {};

  // Retrieve a DataEntity from the global AppCore object
  var _entityRetrieve = function (entityLabel) {
    return _dataEntities[entityLabel];
  };

  // Create a DataEntity and assign it to the global AppCore object
  var _entityRegister = function (entityLabel, initializer) {

    // This function handles saving modifications to an object returned by 'read' or 'readOne' operations
    var _objectPersist = function (completionHandler) {

      // Ensure the completion handler is a valid function, default to no-op if not
      completionHandler = (completionHandler && utils.isFunction(completionHandler)) ? completionHandler : function () { };

      // 'persistenceMode' determines which notification receiver to trigger
      var persistenceMode;

      var executeCompletion = function (errorInfo, operationOutcome) {

        // This is necessary for sending a single object
        if (persistenceMode === 'generate') {
          DataEntity.notify('generate', operationOutcome);
        }

        // This is necessary for sending an array of objects
        else if (persistenceMode === 'modify') {
          DataEntity.notify('modify', [operationOutcome]);
        }

        DataEntity.notify('persist', operationOutcome);

        // Invoke the completion handler provided to the 'persist' method
        // The DataEntity instance becomes the 'this' context
        completionHandler.call(DataEntity, errorInfo, operationOutcome);

      };

      var performPersistenceSteps = function (errorInfo, operationOutcome) {

        // Check if there are any post-hooks assigned for the 'persist' action
        if (DataEntity._postHooks.hasOwnProperty('persist')) {

          // Call the post-persist hook
          // The DataEntity instance becomes the 'this' context
          DataEntity._postHooks.persist.call(DataEntity, operationOutcome, function () {
            executeCompletion(errorInfo, operationOutcome);
          });

        } else {
          executeCompletion(errorInfo, operationOutcome);
        }

      };

      var finalizeModification = function (dataRecord) {

        DataEntity.modifyQuietly({
          '_uniqueId': dataRecord._uniqueId
        }, dataRecord, function (errorInfo, outcomes) {

          var operationOutcome = outcomes[0];

          // Check for any post-hooks assigned to the 'modify' action
          if (DataEntity._postHooks.hasOwnProperty('modify')) {

            // Call the post-modify hook
            // The DataEntity instance becomes the 'this' context
            DataEntity._postHooks.modify.call(DataEntity, outcomes, function () {
              performPersistenceSteps(errorInfo, operationOutcome);
            });

          } else {
            performPersistenceSteps(errorInfo, operationOutcome);
          }

        });

      };

      var finalizeGeneration = function (dataRecord) {

        DataEntity.generateQuietly(dataRecord, function (errorInfo, operationOutcome) {

          // Check for any post-hooks assigned to the 'generate' action
          if (DataEntity._postHooks.hasOwnProperty('generate')) {

            // Call the post-generate hook
            // The DataEntity instance becomes the 'this' context
            DataEntity._postHooks.generate.call(DataEntity, dataRecord, function () {
              performPersistenceSteps(errorInfo, operationOutcome);
            });

          } else {
            performPersistenceSteps(errorInfo, operationOutcome);
          }

        });

      };

      // Execute the appropriate CRUD (Create/Read/Update/Delete) method
      var executeRecordOperation = function (dataRecord) {

        // GENERATE (CREATE)
        // This object is being newly created
        if (!dataRecord.hasOwnProperty('_uniqueId')) {

          persistenceMode = 'generate';

          // Check for any pre-hooks assigned to the 'generate' action
          if (DataEntity._preHooks.hasOwnProperty('generate')) {

            // Call the pre-generate hook
            // The DataEntity instance becomes the 'this' context
            DataEntity._preHooks.generate.call(DataEntity, dataRecord, function () {
              finalizeGeneration(dataRecord);
            });

          } else {
            finalizeGeneration(dataRecord);
          }

        }

        // MODIFY (UPDATE)
        // Check if the object originated from a 'read' operation and requires an update
        else {

          persistenceMode = 'modify';

          // Check for any pre-hooks assigned to the 'modify' action
          if (DataEntity._preHooks.hasOwnProperty('modify')) {

            // Call the pre-modify hook
            // The DataEntity instance becomes the 'this' context
            DataEntity._preHooks.modify.call(DataEntity, {
              '_uniqueId': dataRecord._uniqueId
            }, dataRecord, function () {
              finalizeModification(dataRecord);
            });

          } else {
            finalizeModification(dataRecord);
          }

        }

      };

      // 'this' refers to the operation outcome or a new object being created
      var _currentInstance = this || {};

      // The 'persist' method can save new or existing objects using 'generate' or 'modify'
      // This should trigger the correct pre-hooks and post-hooks
      // It should always trigger all pre-persist and post-persist hooks, regardless of 'generate' or 'modify'

      // Check for any pre-hooks assigned to the 'persist' action
      if (DataEntity._preHooks.hasOwnProperty('persist')) {

        // Call the pre-persist hook
        // The DataEntity instance becomes the 'this' context
        DataEntity._preHooks.persist.call(DataEntity, _currentInstance, function () {
          executeRecordOperation(_currentInstance);
        });

      } else {
        executeRecordOperation(_currentInstance);
      }

    };

    var _objectRemove = function (completionHandler) {

      // Validate the completion handler, default to a no-op
      completionHandler = (completionHandler && utils.isFunction(completionHandler)) ? completionHandler : function () { };

      // 'this' will always refer to the item being removed
      DataEntity.erase(this, completionHandler);

    };

    var _objectRemoveQuietly = function (completionHandler) {

      // Validate the completion handler, default to a no-op
      completionHandler = (completionHandler && utils.isFunction(completionHandler)) ? completionHandler : function () { };

      // 'this' will always refer to the item
      DataEntity.eraseQuietly(this, completionHandler);

    };

    // This DataEntity constructor will encapsulate all CRUD operations
    // It's a function so we can instantiate it using the 'new' keyword
    var DataEntity = _dataEntities[entityLabel] = function (instanceData) {

      instanceData = instanceData || {};

      // Attach additional methods to the object
      instanceData.persist = _objectPersist;

      // We don't need to directly add the deletion methods here;
      // they are typically added when the 'persist' method is called or for specific instances.

      return instanceData;

    };

    // PRIVATE PROPERTIES FOR DATAENTITY

    // Configure the internal variables of the DataEntity
    // '_itemCollection' will hold all the data for this entity
    DataEntity._itemCollection = [];
    DataEntity._nextIdentifier = 0;

    DataEntity._preHooks = {};
    DataEntity._postHooks = {};

    DataEntity._eventListeners = {};

    DataEntity._entityName = entityLabel;

    // PRIVATE METHODS FOR DATAENTITY

    DataEntity._generateNextId = function () {
      DataEntity._nextIdentifier++;
      return DataEntity._nextIdentifier;
    };

    // PUBLIC METHODS FOR DATAENTITY

    // Server Communication Link Events

    DataEntity.listen = function (eventKey, handlerFunction) {

      // If the server communication link is not yet established, listeners need to be buffered
      if (!_serverCommLink) {

        // Set the DataEntity name property if not already present
        if (!_incomingEventQueue.hasOwnProperty(DataEntity._entityName)) {
          _incomingEventQueue[DataEntity._entityName] = {};
        }

        // Store the handler function in the incoming event queue
        _incomingEventQueue[DataEntity._entityName][eventKey] = handlerFunction;

      } else {

        _serverCommLink.on(eventKey, function (payload) {
          handlerFunction.call(DataEntity, payload);
        });

      }

    };

    DataEntity.dispatch = function (eventKey, payload, extraPayload) {

      // If the server communication link is not yet established, dispatches need to be buffered and sent later
      if (!_serverCommLink) {

        // Add the event and payload to the outgoing command queue
        _outgoingCommandQueue.push([eventKey, payload, extraPayload]);

      } else {

        _serverCommLink.emit(eventKey, payload, extraPayload);

      }

    };

    // Internal Event Management

    DataEntity.integrate = function (extensionHandler) {
      // Invoke the plugin's handler function
      // The DataEntity instance becomes the 'this' context
      extensionHandler.call(DataEntity);
    };

    // Register a pre-operation hook
    DataEntity.addPreHook = function (hookType, hookFunction) {

      // If the hook type is a single string
      // No need to configure multiple
      if (utils.isString(hookType)) {
        DataEntity._preHooks[hookType] = hookFunction;
      }

      // If multiple hook types were provided in an array
      else if (utils.isArray(hookType)) {
        utils.each(hookType, function (identifier) {
          DataEntity._preHooks[identifier] = hookFunction;
        });
      }

    };

    // Unregister a pre-operation hook
    DataEntity.removePreHook = function (hookType) {

      // If the hook type is a single string
      // No need to remove multiple
      if (utils.isString(hookType)) {
        DataEntity._preHooks[hookType] = function () { };
      }

      // If multiple hook types were provided in an array
      else if (utils.isArray(hookType)) {
        utils.each(hookType, function (identifier) {
          DataEntity._preHooks[identifier] = function () { };
        });
      }

    };

    // Register a post-operation hook
    DataEntity.addPostHook = function (hookType, hookFunction) {

      // If the hook type is a single string
      // No need to configure multiple
      if (utils.isString(hookType)) {
        DataEntity._postHooks[hookType] = hookFunction;
      }

      // If multiple hook types were provided in an array
      else if (utils.isArray(hookType)) {
        utils.each(hookType, function (identifier) {
          DataEntity._postHooks[identifier] = hookFunction;
        });
      }

    };

    // Unregister a post-operation hook
    DataEntity.removePostHook = function (hookType) {

      // If the hook type is a single string
      // No need to remove multiple
      if (utils.isString(hookType)) {
        DataEntity._postHooks[hookType] = function () { };
      }

      // If multiple hook types were provided in an array
      else if (utils.isArray(hookType)) {
        utils.each(hookType, function (identifier) {
          DataEntity._postHooks[identifier] = function () { };
        });
      }

    };

    // Trigger an internal notification
    DataEntity.notify = function (messageType, messageData) {
      if (DataEntity._eventListeners[messageType]) {
        // Invoke the listener's handler function
        // The DataEntity instance becomes the 'this' context
        DataEntity._eventListeners[messageType].call(DataEntity, messageData);
      }
    };

    // Register an internal event listener
    DataEntity.registerListener = function (messageType, listenerHandler) {

      // If the message type is a single string
      // No need to configure multiple
      if (utils.isString(messageType)) {
        DataEntity._eventListeners[messageType] = listenerHandler;
      }

      // If multiple message types were provided in an array
      else if (utils.isArray(messageType)) {
        utils.each(messageType, function (identifier) {
          DataEntity._eventListeners[identifier] = listenerHandler;
        });
      }

    };

    // Unregister an internal event listener
    DataEntity.unregisterListener = function (messageType) {

      // Remove all listeners if no specific message type is provided
      if (utils.isEmpty(messageType)) {

        DataEntity._eventListeners = {};

      }

      // Remove specific listeners
      else {

        // If the message type is a single string
        // No need to remove multiple
        if (utils.isString(messageType)) {
          DataEntity._eventListeners[messageType] = function () { };
        }

        // If multiple message types were provided in an array
        else if (utils.isArray(messageType)) {
          utils.each(messageType, function (identifier) {
            DataEntity._eventListeners[identifier] = function () { };
          });
        }

      }

    };

    // Data Query Methods

    // Replaces the internal collection with a new array of objects
    // This will assign a '_uniqueId' property to each new item
    // It will also modify the collection in a way that is compatible with data binding
    DataEntity.setCollection = function (itemsArray) {

      // Verify that the provided itemsArray is indeed an array
      if (!utils.isArray(itemsArray)) {
        // TODO: Implement proper error handling here
        return;
      }

      // Clear the existing collection in a data-binding friendly manner
      while (DataEntity._itemCollection.length > 0) {
        DataEntity._itemCollection.pop();
      }

      // Populate the collection with new items, assigning unique IDs
      for (var i = 0, j = itemsArray.length; i < j; i++) {
        itemsArray[i]._uniqueId = DataEntity._generateNextId();
        DataEntity._itemCollection.push(itemsArray[i]);
      }

    };

    // GENERATE (CREATE)

    DataEntity.generate = function (newItem, completionHandler) {

      // Ensure the completion handler is a valid function, default to no-op if not
      completionHandler = (completionHandler && utils.isFunction(completionHandler)) ? completionHandler : function () { };

      var executeCompletion = function (errorInfo, operationOutcome) {

        DataEntity.notify('generate', operationOutcome);

        // Invoke the completion handler provided to the 'generate' method
        // The DataEntity instance becomes the 'this' context
        completionHandler.call(DataEntity, errorInfo, operationOutcome);

      };

      var finishOperation = function () {

        DataEntity.generateQuietly(newItem, function (errorInfo, operationOutcome) {

          // Check for any post-hooks assigned to the 'generate' action
          if (DataEntity._postHooks.hasOwnProperty('generate')) {

            // Call the post-generate hook
            // The DataEntity instance becomes the 'this' context
            DataEntity._postHooks.generate.call(DataEntity, newItem, function () {
              executeCompletion(errorInfo, operationOutcome);
            });

          } else {
            executeCompletion(errorInfo, operationOutcome);
          }

        });

      };