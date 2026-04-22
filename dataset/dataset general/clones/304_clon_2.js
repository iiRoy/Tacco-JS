/*
 * ng-entitygen v1.0.0
 *
 * Basic data structures for Angular applications
 * Inspired by Backbone.js, Restangular, and Ember Data patterns.
 */

'use strict';

;(function (globalObj, creationFunc) {

  // Check for AMD loader and define the module if available.
  if (typeof define === 'function' && define.amd) {
    define(['angular'], function (ngCore) {
      return creationFunc(ngCore, document);
    });
  } else {
    // If no AMD, assume global `angular` and `document` are available.
    /* global angular */
    creationFunc(angular, document);
  }

}(window, function (ngCore, domElement, unusedVar) {

  var baseItemSchema;

  // Utility to enable throwing errors in contexts
  // where direct `throw` might be problematic, like ternary operations.
  var triggerFault = function (faultMessage) {
    throw new Error(faultMessage);
  };

  // Internal Object Utility Collection
  //
  // Provides a minimal set of common object/array manipulation
  // functions, similar to how Angular handles its jqLite.
  // Covered (or partially covered) operations include:
  // - isTextVal
  // - isNumericVal
  // - isPlainObject
  // - isCollection
  // - isArgumentList
  // - isExecutable
  // - compareValues
  // - checkEmpty
  // - mergeObjects
  // - hasProperty
  // - findElementIndex
  // - getObjectKeys
  // - retrieveObjectValues
  // - createKeyValuePairs
  // - includesElement
  // - flattenCollection
  // - findDifference
  // - removeElements
  // - transformCollection
  // - createIterator
  // - matchProperties
  // - checkAny
  // - locateFirst
  // - selectElements
  // - duplicateObject
  // - generateUniqueId

  var uniqueIdGen = 0;

  var toolBelt = {};

  toolBelt.isTextVal = function (textInput) {
    return ngCore.isString(textInput);
  };

  toolBelt.isNumericVal = function (numericInput) {
    return ngCore.isNumber(numericInput);
  };

  toolBelt.isPlainObject = function (examinedValue) {
    var itemType = typeof examinedValue;
    return itemType === 'function' || (examinedValue && itemType === 'object') || false;
  };

  toolBelt.isCollection = function (collectionInput) {
    return ngCore.isArray(collectionInput);
  };

  toolBelt.isArgumentList = function (argSet) {
    return Object.prototype.toString.call(argSet) === '[object Arguments]';
  };

  toolBelt.isExecutable = function (funcRef) {
    return ngCore.isFunction(funcRef);
  };

  toolBelt.compareValues = function (firstVal, secondVal) {
    return ngCore.equals(firstVal, secondVal);
  };

  toolBelt.checkEmpty = function (targetItem) {
    if (targetItem === null || targetItem === void 0) return true;
    if (toolBelt.isCollection(targetItem) || toolBelt.isTextVal(targetItem) || toolBelt.isArgumentList(targetItem)) return targetItem.length === 0;
    for (var propName in targetItem) if (toolBelt.hasProperty(targetItem, propName)) return false;
    return true;
  };

  toolBelt.mergeObjects = function (destinationObject) {
    if (!toolBelt.isPlainObject(destinationObject)) return destinationObject;
    var sourceData, currentProperty;
    for (var i = 1, totalArgs = arguments.length; i < totalArgs; i++) {
      sourceData = arguments[i];
      for (currentProperty in sourceData) {
        if (!Object.prototype.hasOwnProperty.call(sourceData, currentProperty)) continue;

        // Verify if target object has getters but no setters for this property and skip
        var targetPropertyDef = Object.getOwnPropertyDescriptor(destinationObject, currentProperty);
        if (targetPropertyDef && (targetPropertyDef.get && !targetPropertyDef.set)) continue;

        destinationObject[currentProperty] = sourceData[currentProperty];
      }
    }

    return destinationObject;
  };

  toolBelt.hasProperty = function(itemToCheck, propertyName) {
    return itemToCheck && Object.prototype.hasOwnProperty.call(itemToCheck, propertyName);
  };

  toolBelt.findElementIndex = function (dataArray, searchItem) {
    if (!dataArray || !dataArray.length) return -1;
    for (var position = 0; position < dataArray.length; position++) if (dataArray[position] === searchItem) return position;
    return -1;
  };

  toolBelt.getObjectKeys = function (targetObject) {
    if (!toolBelt.isPlainObject(targetObject)) return [];
    if (Object.keys) return Object.keys(targetObject);

    var collectedKeys = [];
    for (var currentKey in targetObject) if (toolBelt.hasProperty(targetObject, currentKey)) collectedKeys.push(currentKey);

    return collectedKeys;
  };

  toolBelt.retrieveObjectValues = function (sourceObject) {
    var retrievedKeys = toolBelt.getObjectKeys(sourceObject),
        keyCount = retrievedKeys.length,
        collectedValues = new Array(keyCount);

    for (var vIdx = 0; vIdx < keyCount; vIdx++) {
      collectedValues[vIdx] = sourceObject[retrievedKeys[vIdx]];
    }

    return collectedValues;
  };

  toolBelt.createKeyValuePairs = function (sourceItem) {
    var itemKeys = toolBelt.getObjectKeys(sourceItem);
    var itemLength = itemKeys.length;
    var resultPairs = new Array(itemLength);
    for (var pIdx = 0; pIdx < itemLength; pIdx++) {
      resultPairs[pIdx] = [itemKeys[pIdx], sourceItem[itemKeys[pIdx]]];
    }
    return resultPairs;
  };

  toolBelt.includesElement = function (targetCollection, soughtElement) {
    if (!targetCollection) return false;
    if (targetCollection.length !== +targetCollection.length) targetCollection = toolBelt.retrieveObjectValues(targetCollection);
    return toolBelt.findElementIndex(targetCollection, soughtElement) >= 0;
  };

  toolBelt.flattenCollection = function (inputData, isShallow, isStrict, outputArray) {
    isStrict = !!isStrict;
    outputArray = outputArray || [];

    if (isShallow && toolBelt.isCollection(inputData) && inputData.length > 0) {
      var allSubArrays = true;
      for (var arrIndex = 0; arrIndex < inputData.length; arrIndex++) {
        if (!toolBelt.isCollection(inputData[arrIndex])) {
          allSubArrays = false;
          break;
        }
      }

      if (allSubArrays) return Array.prototype.concat.apply(outputArray, inputData);
    }

    for (var itemIdx = 0, dataLen = inputData.length; itemIdx < dataLen; itemIdx++) {
      var currentItem = inputData[itemIdx];
      if (!toolBelt.isCollection(currentItem) && !toolBelt.isArgumentList(currentItem)) {
        if (!isStrict) outputArray.push(currentItem);
      } else if (isShallow) {
        Array.prototype.push.apply(outputArray, currentItem);
      } else {
        toolBelt.flattenCollection(currentItem, isShallow, isStrict, outputArray);
      }
    }

    return outputArray;
  };

  toolBelt.findDifference = function (mainArray) {
    var remainingElements = toolBelt.flattenCollection(Array.prototype.slice.call(arguments, 1), true, true, []);
    return toolBelt.selectElements(mainArray, function (elementValue) {
      return !toolBelt.includesElement(remainingElements, elementValue);
    });
  };

  toolBelt.removeElements = function (sourceArr) {
    return toolBelt.findDifference(sourceArr, Array.prototype.slice.call(arguments, 1));
  };

  toolBelt.transformCollection = function (inputSource, mappingFunction) {
    return Array.prototype.map.call(inputSource, mappingFunction);
  };

  toolBelt.createIterator = function (iteratorValue) {
    if (!iteratorValue) return ngCore.identity;
    if (toolBelt.isExecutable(iteratorValue)) {
      var callbackFunc = iteratorValue;

      // Simplified case compared to full underscore/lodash implementations
      return function (itemVal, itemIdx, itemCollection) {
        return callbackFunc.call(null, itemVal, itemIdx, itemCollection);
      };
    }

    if (toolBelt.isPlainObject(iteratorValue)) {
      return toolBelt.matchProperties(iteratorValue);
    }

    var propLookupFn = function (propId) {
      return function (itemObj) {
        return itemObj[propId];
      };
    };

    return propLookupFn(iteratorValue);
  };

  toolBelt.matchProperties = function (attributeSet) {
    var propPairs = toolBelt.createKeyValuePairs(attributeSet),
        pairCount = propPairs.length;

    return function (targetItem) {
      if (!targetItem) return !pairCount;

      targetItem = new Object(targetItem);
      for (var pairIndex = 0; pairIndex < pairCount; pairIndex++) {
        var currentPair = propPairs[pairIndex],
            attributeKey = currentPair[0];

        if (currentPair[1] !== targetItem[attributeKey] || !(attributeKey in targetItem)) return false;
      }

      return true;
    };
  };

  toolBelt.checkAny = function (dataCollection, testCondition) {
    if (!dataCollection) return false;

    testCondition = toolBelt.createIterator(testCondition);

    var itemKeys = dataCollection.length !== +dataCollection.length && toolBelt.getObjectKeys(dataCollection),
        dataLength = (itemKeys || dataCollection).length,
        currentPos, currentKeyId;

    for (currentPos = 0; currentPos < dataLength; currentPos++) {
      currentKeyId = itemKeys ? itemKeys[currentPos] : currentPos;
      if (testCondition(dataCollection[currentKeyId], currentKeyId, dataCollection)) return true;
    }

    return false;
  };

  toolBelt.locateFirst = function (searchCollection, searchPredicate) {
    var foundResult;

    searchPredicate = toolBelt.createIterator(searchPredicate);

    toolBelt.checkAny(searchCollection, function (elementValue, elementIndex, elementList) {
      if (searchPredicate(elementValue, elementIndex, elementList)) {
        foundResult = elementValue;
        return true;
      }
    });

    return foundResult;
  };

  toolBelt.selectElements = function (sourceCollection, selectionPredicate) {
    var filteredResults = [];
    if (!sourceCollection) return filteredResults;

    selectionPredicate = toolBelt.createIterator(selectionPredicate);

    ngCore.forEach(sourceCollection, function (elementValue, elementIndex, elementList) {
      if (selectionPredicate(elementValue, elementIndex, elementList)) filteredResults.push(elementValue);
    });

    return filteredResults;
  };

  toolBelt.duplicateObject = function (targetObj) {
    if (!toolBelt.isPlainObject(targetObj)) return targetObj;
    return toolBelt.isCollection(targetObj) ? targetObj.slice() : toolBelt.mergeObjects({}, targetObj);
  };

  toolBelt.generateUniqueId = function (idPrefix) {
    var newId = ++uniqueIdGen;
    return String(idPrefix === null ? '' : idPrefix) + newId;
  };


  // Custom helper functions, not directly from underscore/lodash,
  // but often simplified versions to avoid extensive code migration.

  // Sets up a getter/setter accessor from a `sourceObject` to a
  // `destObject` for a specific `propKey`.
  // Returns `true` if the property was an accessor and successfully set,
  // `false` otherwise.
  var definePropAccess = function (destObject, sourceObject, propKey) {
    if (!toolBelt.isPlainObject(sourceObject) || !toolBelt.isPlainObject(destObject) || !propKey) return false;

    var propDefinition = Object.getOwnPropertyDescriptor(sourceObject, propKey);

    // If a getter or setter function is present,
    if (propDefinition && (propDefinition.get || propDefinition.set)) {
      // Manually transfer the property definition.
      // This prevents the getter from being evaluated during a regular copy.
      // Ensure it's enumerable for future mixins.
      var getterFn = propDefinition.get || undefined,
          setterFn = propDefinition.set || undefined;

      Object.defineProperty(
        destObject, propKey, { get: getterFn, set: setterFn, enumerable: true, configurable: true }
      );

      return true;
    }

    return false;
  };

  // Filters properties from an object based on a list of names.
  // Only supports string property names, unlike a full _.omit().
  var excludeProps = function (inputObj) {
    if (!inputObj) return {};
    if (!toolBelt.isPlainObject(inputObj)) return inputObj;

    var propsToRemove = Array.prototype.slice.call(arguments, 1),
        objKeys = toolBelt.getObjectKeys(inputObj),
        finalResult = {};

    for (var kIdx = 0; kIdx < objKeys.length; kIdx++) {
      var currentKey = objKeys[kIdx];
      if (currentKey in inputObj && !toolBelt.includesElement(propsToRemove, currentKey)) {
        if (!definePropAccess(finalResult, inputObj, currentKey)) {
          finalResult[currentKey] = inputObj[currentKey];
        }
      }
    }

    return finalResult;
  };

  // Performs a semi-deep clone. Designed to work with `deepMergeWithAccessors`.
  var recursiveCopy = function (valToCopy, copyStrategy) {
    if (!valToCopy) return valToCopy;
    if (!copyStrategy || !toolBelt.isExecutable(copyStrategy)) copyStrategy = toolBelt.mergeObjects;

    if (toolBelt.isCollection(valToCopy)) {
      var tempArray = toolBelt.duplicateObject(valToCopy);
      for (var arrPos = 0; arrPos < tempArray.length; arrPos++) {
        tempArray[arrPos] = recursiveCopy(tempArray[arrPos]);
      }

      return tempArray;
    } else if (toolBelt.isExecutable(valToCopy)) {
      return valToCopy;
    } else if (toolBelt.isPlainObject(valToCopy)) {
      // Standard objects are extended using a "structured clone"
      // approach with an optional custom merging function.
      return copyStrategy({}, valToCopy);
    } else {
      return valToCopy;
    }
  };

  var deepMergeWithAccessors = function (targetDestination) {
    targetDestination = targetDestination || {};
    ngCore.forEach(arguments, function (currentObject) {
      if (currentObject !== targetDestination && toolBelt.isPlainObject(currentObject)) {
        for (var propertyId in currentObject) {
          // Attempt to define properties as getter/setters first.
          if (!definePropAccess(targetDestination, currentObject, propertyId)) {
            // If it's not a getter/setter, perform a full recursive copy.
            targetDestination[propertyId] = recursiveCopy(currentObject[propertyId], deepMergeWithAccessors);
          }
        }
      }
    });

    return targetDestination;
  };


  // # Internal Path Helpers
  // =======================

  // A set of functions to help with URL/path string manipulation and checks.
  var pathUtil = {
    isPathLike: function (inputPath) {
      // A basic, straightforward check.
      // Future enhancement: could include checks for other special characters.
      return toolBelt.includesElement(inputPath, '/') || toolBelt.includesElement(inputPath, '-');
    },

    convertToPath: function (pathSegment) {
      if (!pathSegment) return '';
      return pathUtil.removeDoubleSlashes('/' + pathSegment);
    },

    // Accepts any number of path segments to join.
    combinePathSegments: function (segmentOne, segmentTwo, segmentThree) {
      var allSegments = toolBelt.selectElements(
        Array.prototype.slice.call(arguments),
        function (itemEntry) { return !!itemEntry; });

      return pathUtil.convertToPath(allSegments.join('/'));
    },

    removeDoubleSlashes: function (inputUrl) {
      if (!inputUrl) return '';
      return inputUrl.replace(/(\/)\/+/g, '$1');
    },

    // Cleans leading and trailing slashes from a path.
    trimPathSlashes: function (resourcePath) {
      return resourcePath.replace(/^\/|\/$/g, '');
    },

    stripPathOverlap: function (mainPath, overlappingPath) {
      if (!mainPath || !overlappingPath) return mainPath;

      var mainPathParts      = pathUtil.trimPathSlashes(mainPath).split('/'),
          overlapPathParts = pathUtil.trimPathSlashes(overlappingPath).split('/'),
          commonIntersection     = [],
          isMatchFound       = false;

      // Adjust arrays to be of comparable length for initial check.
      if (mainPathParts.length > overlapPathParts.length) {
        // Remove elements from the start of the main path.
        mainPathParts.splice(0, mainPathParts.length - overlapPathParts.length);
      } else {
        // Truncate the overlapping path from the end.
        overlapPathParts.length = mainPathParts.length;
      }

      // Identify the longest common intersection.
      while (mainPathParts.length) {

        for (var partIdx = 0; partIdx < mainPathParts.length; partIdx++) {
          if (mainPathParts[partIdx] === overlapPathParts[partIdx]) {
            isMatchFound = true;
            commonIntersection.push(mainPathParts[partIdx]);
          } else {
            commonIntersection = [];
            isMatchFound = false;
            break;
          }
        }

        if (isMatchFound) break;

        mainPathParts.shift();    // Remove from front
        overlapPathParts.pop(); // Remove from back
      }

      // Extract the non-overlapping prefix from the original `mainPath`.
      var intersectionString = pathUtil.convertToPath(commonIntersection.join('/'));
      return pathUtil.convertToPath(intersectionString.length ? mainPath.substring(0, mainPath.indexOf(intersectionString)) : mainPath);
    },

    // Helper for URL parameters.
    // Replaces placeholder names (e.g., `:id`) in a path string
    // with actual values provided in `pathParameters`.
    setPathParameters: function (targetPath, pathParameters, ignoreMissingVals) {
      if (!targetPath) return targetPath;

      return targetPath.replace(/\:\_*[A-Za-z]+/g, function (paramPlaceholder) {
        paramPlaceholder = paramPlaceholder.replace(/\:*/, '');
        if (pathParameters[paramPlaceholder] === undefined && !ignoreMissingVals) triggerFault('No value for parameter "'+ paramPlaceholder + '" found for path ' + targetPath);
        return pathParameters[paramPlaceholder];
      });
    },

    // This method conventionally appends the item's primary key
    // (or the attribute defined as the 'idAttribute') to a base path.
    // It assumes a base URL structure.
    appendItemIdToPath: function (basePath, itemIdentifier, identifierAttribute) {
      if (!basePath) return '';
      if (!itemIdentifier) return basePath;

      identifierAttribute = identifierAttribute || 'id';

      // If the path already has a placeholder for the ID, replace it.
      if (toolBelt.includesElement(basePath, ':' + identifierAttribute)) {
        var paramObj = {};
        paramObj[identifierAttribute] = itemIdentifier;
        return pathUtil.setPathParameters(basePath, paramObj);
      }

      // Otherwise, append the ID to the path.
      return pathUtil.combinePathSegments(basePath, itemIdentifier);
    }
  };

  // The main module definition for `ngEntityGen`.
  // This factory function will be registered with Angular.
  var ngEntityGenFactory = function ($httpService, $qService, $timeoutService) {

    // Internal constants for HTTP methods.
    var httpMethods = {
      GET: 'GET',
      POST: 'POST',
      PUT: 'PUT',
      DELETE: 'DELETE',
      PATCH: 'PATCH'
    };

    // Default configuration for the data models.
    var defaultSchemaConfig = {
      primaryKey: 'id', // The attribute used as the unique identifier.
      basePath: '', // Base URL for API calls.
      resourcePath: '', // Specific path for this resource.
      parentPath: '', // Path to a parent resource, if nested.
      fullResourcePath: '', // Computed full path.
      endpoint: '', // Final endpoint used for requests.
      requestHeaders: {}, // Custom HTTP headers.
      queryParams: {}, // Default query parameters.
      isCollection: false, // Is this model representing a collection of items?
      isSingleton: false, // Is this model representing a single, unique item?
      isNew: true, // Is this a newly created item (not yet saved)?
      isDirty: false, // Has the item been modified since last fetch/save?
      isFetching: false, // Is an API request currently in progress?
      isSaving: false, // Is the item currently being saved?
      isDestroying: false, // Is the item currently being deleted?
      lastSyncTime: null, // Timestamp of the last successful sync.
      parseResponse: null, // Function to parse API responses.
      serializeData: null, // Function to serialize data for requests.
      validationRules: null, // Validation logic for model attributes.
      errorHandlers: null, // Custom error handling callbacks.
      transformRequest: null, // Angular's request transform.
      transformResponse: null, // Angular's response transform.
      httpInterceptors: [] // Array of HTTP interceptors for this model.
    };

    // A collection of default callbacks for various model events.
    var modelEventCallbacks = {
      // Called before an API request is sent.
      beforeRequest: function (modelInstance, httpConfig) { return httpConfig; },
      // Called after a successful API response.
      afterResponse: function (modelInstance, apiResponse) { return apiResponse; },
      // Called after a successful data parsing.
      afterParse: function (modelInstance, parsedData) { return parsedData; },
      // Called before data is serialized for a request.
      beforeSerialize: function (modelInstance, rawData) { return rawData; },
      // Called when an error occurs during an API request.
      onError: function (modelInstance, errorResponse) { return errorResponse; },
      // Called when an API request is completed (success or error).
      onComplete: function (modelInstance, responseOrError) { return responseOrError; }
    };

    // A simple event emitter implementation.
    var eventManager = function () {
      this._eventListeners = {}; // Stores registered event handlers.
    };

    toolBelt.mergeObjects(eventManager.prototype, {
      // Registers an event handler for a given event name.
      on: function (eventName, handlerFunction) {
        if (!toolBelt.isTextVal(eventName) || !toolBelt.isExecutable(handlerFunction)) {
          triggerFault('Event name must be a string and handler must be a function.');
        }
        this._eventListeners[eventName] = this._eventListeners[eventName] || [];
        this._eventListeners[eventName].push(handlerFunction);
        return this; // Enable chaining.
      },

      // Removes an event handler. If no handlerFunction is provided, all handlers for the event are removed.
      off: function (eventName, handlerFunction) {
        if (!toolBelt.isTextVal(eventName)) {
          triggerFault('Event name must be a string.');
        }
        var eventHandlers = this._eventListeners[eventName];
        if (eventHandlers) {
          if (handlerFunction) {
            this._eventListeners[eventName] = toolBelt.removeElements(eventHandlers, handlerFunction);
          } else {
            delete this._eventListeners[eventName];
          }
        }
        return this;
      },

      // Triggers all registered handlers for an event.
      trigger: function (eventName) {
        if (!toolBelt.isTextVal(eventName)) {
          triggerFault('Event name must be a string.');
        }
        var eventHandlers = this._eventListeners[eventName];
        if (eventHandlers) {
          var handlerArgs = Array.prototype.slice.call(arguments, 1);
          for (var hIdx = 0; hIdx < eventHandlers.length; hIdx++) {
            eventHandlers[hIdx].apply(this, handlerArgs);
          }
        }
        return this;
      }
    });

    // Base constructor for all data models.
    var BaseDataModel = function (initialData) {
      // Initialize configuration and event manager.
      this.modelConfiguration = toolBelt.mergeObjects({}, defaultSchemaConfig);
      this.attributeData = {};
      this.previousAttributeData = {}; // Stores data before last save/fetch for `isDirty` check.
      this.eventEmitter = new eventManager();

      // Apply initial data if provided.
      if (initialData) {
        this.setAttributes(initialData, { silent: true });
      }

      // If no ID is provided, mark as new.
      if (!this.getAttribute(this.modelConfiguration.primaryKey)) {
        this.modelConfiguration.isNew = true;
      } else {
        this.modelConfiguration.isNew = false;
      }

      this.modelConfiguration.isDirty = false; // Initially clean.
    };

    toolBelt.mergeObjects(BaseDataModel.prototype, {
      // Alias for eventEmitter.on
      on: function () {
        this.eventEmitter.on.apply(this.eventEmitter, arguments);
        return this;
      },

      // Alias for eventEmitter.off
      off: function () {
        this.eventEmitter.off.apply(this.eventEmitter, arguments);
        return this;
      },

      // Alias for eventEmitter.trigger
      trigger: function () {
        this.eventEmitter.trigger.apply(this.eventEmitter, arguments);
        return this;
      },

      // Retrieves a model attribute.
      getAttribute: function (attrName) {
        return this.attributeData[attrName];
      },

      // Sets one or more attributes on the model.
      setAttributes: function (newData, options) {
        options = options || {};
        var changedAttributes = {};
        var oldAttributes = {};
        var currentAttributes = this.attributeData;
        var primaryKey = this.modelConfiguration.primaryKey;

        for (var key in newData) {
          if (toolBelt.hasProperty(newData, key)) {
            var newValue = newData[key];
            var oldValue = currentAttributes[key];

            if (!toolBelt.compareValues(newValue, oldValue)) {
              currentAttributes[key] = newValue;
              changedAttributes[key] = newValue;
              oldAttributes[key] = oldValue;
            }
          }
        }

        // If the primary key is set or changed, update `isNew` status.
        if (toolBelt.hasProperty(changedAttributes, primaryKey)) {
          this.modelConfiguration.isNew = !changedAttributes[primaryKey];
        }

        // Mark as dirty if any attributes changed and it's not a silent update.
        if (!toolBelt.checkEmpty(changedAttributes) && !options.silent) {
          this.modelConfiguration.isDirty = true;
          this.trigger('change', this, changedAttributes, oldAttributes);
        }

        return this;
      },

      // Resets the `isDirty` flag and updates `previousAttributeData`.
      _markClean: function () {
        this.modelConfiguration.isDirty = false;
        this.previousAttributeData = toolBelt.duplicateObject(this.attributeData);
      },

      // Generates the full endpoint URL for the model.
      _resolveEndpoint: function () {
        var config = this.modelConfiguration;
        var computedPath = pathUtil.combinePathSegments(config.basePath, config.parentPath, config.resourcePath);

        if (config.isCollection) {
          config.fullResourcePath = computedPath;
        } else {
          // For single items, append the ID.
          config.fullResourcePath = pathUtil.appendItemIdToPath(computedPath, this.getAttribute(config.primaryKey), config.primaryKey);
        }

        config.endpoint = config.fullResourcePath;
        return config.endpoint;
      },

      // Constructs the HTTP request configuration.
      _buildRequestConfig: function (method, options) {
        options = options || {};
        var config = this.modelConfiguration;

        var requestConfig = {
          method: method,
          url: this._resolveEndpoint(),
          headers: toolBelt.mergeObjects({}, config.requestHeaders, options.headers),
          params: toolBelt.mergeObjects({}, config.queryParams, options.params),
          transformRequest: config.transformRequest,
          transformResponse: config.transformResponse,
          interceptor: config.httpInterceptors
        };

        // Add data payload for non-GET requests.
        if (method !== httpMethods.GET) {
          requestConfig.data = toolBelt.mergeObjects(
            {},
            this.serialize(options.serialize),
            options.data
          );
        }

        // Trigger 'beforeRequest' event.
        var modifiedConfig = modelEventCallbacks.beforeRequest(this, requestConfig);
        if (modifiedConfig && toolBelt.isPlainObject(modifiedConfig)) {
          requestConfig = modifiedConfig;
        }

        return requestConfig;
      },

      // Executes an HTTP request.
      _sendRequest: function (method, options) {
        var self = this;
        var config = this.modelConfiguration;

        // Set fetching state.
        config.isFetching = true;
        config.isSaving = (method === httpMethods.POST || method === httpMethods.PUT || method === httpMethods.PATCH);
        config.isDestroying = (method === httpMethods.DELETE);

        var deferred = $qService.defer();

        var requestPromise = $httpService(this._buildRequestConfig(method, options));

        requestPromise.then(function (response) {
          // Trigger 'afterResponse' event.
          var processedResponse = modelEventCallbacks.afterResponse(self, response);
          if (processedResponse && toolBelt.isPlainObject(processedResponse)) {
            response = processedResponse;
          }

          // Parse and update model attributes.
          var parsedData = self.parse(response.data, options.parse);
          self.setAttributes(parsedData, { silent: true });
          self._markClean();
          config.lastSyncTime = new Date();

          self.trigger('sync', self, response);
          deferred.resolve(response);
        }, function (errorResponse) {
          // Trigger 'onError' event.
          modelEventCallbacks.onError(self, errorResponse);
          self.trigger('error', self, errorResponse);
          deferred.reject(errorResponse);
        }).finally(function () {
          // Reset fetching states.
          config.isFetching = false;
          config.isSaving = false;
          config.isDestroying = false;
          modelEventCallbacks.onComplete(self, arguments[0]); // Pass response or error.
          self.trigger('complete', self, arguments[0]);
        });

        return deferred.promise;
      },

      // Fetches data for the model from the API.
      fetch: function (options) {
        options = options || {};
        return this._sendRequest(httpMethods.GET, options);
      },

      // Saves the model data to the API (creates or updates).
      save: function (data, options) {
        options = options || {};
        var method = this.modelConfiguration.isNew ? httpMethods.POST : httpMethods.PUT;

        // If data is provided, set it before saving.
        if (data) {
          this.setAttributes(data, { silent: true });
        }

        return this._sendRequest(method, options);
      },

      // Deletes the model from the API.
      destroy: function (options) {
        options = options || {};
        return this._sendRequest(httpMethods.DELETE, options);
      },

      // Merges new data into the model, triggering change events.
      patch: function (data, options) {
        options = options || {};
        if (data) {
          this.setAttributes(data, { silent: true });
        }
        return this._sendRequest(httpMethods.PATCH, options);
      },

      // Validates the model attributes.
      validate: function (attributesToValidate) {
        var rules = this.modelConfiguration.validationRules;
        if (!rules) return true; // No validation rules defined.

        attributesToValidate = attributesToValidate || this.attributeData;
        var validationErrors = {};

        for (var attrKey in rules) {
          if (toolBelt.hasProperty(rules, attrKey) && toolBelt.hasProperty(attributesToValidate, attrKey)) {
            var validator = rules[attrKey];
            var value = attributesToValidate[attrKey];

            if (toolBelt.isExecutable(validator)) {
              var error = validator(value, this);
              if (error) {
                validationErrors[attrKey] = error;
              }
            }
            // Add support for array of validators or regex, etc. here if needed.
          }
        }

        if (!toolBelt.checkEmpty(validationErrors)) {
          this.trigger('validation:error', this, validationErrors);
          return false;
        }

        return true;
      },

      // Parses the raw API response data.
      parse: function (rawData, parserFn) {
        parserFn = parserFn || this.modelConfiguration.parseResponse;
        var parsed = rawData;
        if (toolBelt.isExecutable(parserFn)) {
          parsed = parserFn(rawData, this);
        }
        return modelEventCallbacks.afterParse(this, parsed);
      },

      // Serializes model data for sending to the API.
      serialize: function (serializerFn) {
        serializerFn = serializerFn || this.modelConfiguration.serializeData;
        var serialized = this.attributeData;
        if (toolBelt.isExecutable(serializerFn)) {
          serialized = serializerFn(this.attributeData, this);
        }
        return modelEventCallbacks.beforeSerialize(this, serialized);
      },

      // Checks if an attribute has changed since the last sync.
      hasChanged: function (attrName) {
        if (!attrName) {
          return !toolBelt.checkEmpty(this._getChangedAttributes());
        }
        return toolBelt.hasProperty(this._getChangedAttributes(), attrName);
      },

      // Returns an object containing all attributes that have changed.
      _getChangedAttributes: function () {
        var changed = {};
        var current = this.attributeData;
        var previous = this.previousAttributeData;

        for (var key in current) {
          if (toolBelt.hasProperty(current, key) && !toolBelt.compareValues(current[key], previous[key])) {
            changed[key] = current[key];
          }
        }
        for (var key in previous) {
          if (toolBelt.hasProperty(previous, key) && !toolBelt.hasProperty(current, key)) {
            changed[key] = undefined; // Attribute removed.
          }
        }
        return changed;
      },

      // Returns the previous value of an attribute.
      previousAttribute: function (attrName) {
        if (!attrName) return null;
        return this.previousAttributeData[attrName];
      },

      // Creates a new instance of the model with merged attributes.
      cloneModel: function () {
        return new BaseDataModel(toolBelt.duplicateObject(this.attributeData));
      },

      // Extends the model with additional properties or methods.
      // Uses the custom deep merge with accessor handling.
      extendModel: function (extensionObject) {
        return deepMergeWithAccessors(this, extensionObject);
      },

      // Returns a plain JavaScript object representation of the model.
      toPlainObject: function () {
        return toolBelt.duplicateObject(this.attributeData);
      },

      // Returns a JSON string representation of the model.
      toJSON: function () {
        return JSON.stringify(this.toPlainObject());
      },

      // Sets a custom configuration option for the model.
      setOption: function (optionName, optionValue) {
        if (toolBelt.isPlainObject(optionName)) {
          toolBelt.mergeObjects(this.modelConfiguration, optionName);
        } else {
          this.modelConfiguration[optionName] = optionValue;
        }
        this._resolveEndpoint(); // Recompute endpoint if path-related options change.
        return this;
      },

      // Retrieves a custom configuration option.
      getOption: function (optionName) {
        return this.modelConfiguration[optionName];
      }
    });

    // Static method to create a new model class based on BaseDataModel.
    BaseDataModel.extend = function (protoProps, staticProps) {
      var Parent = this;
      var Child;

      // The constructor function for the new model class.
      if (protoProps && toolBelt.hasProperty(protoProps, 'constructor')) {
        Child = protoProps.constructor;
      } else {
        Child = function () {
          return Parent.apply(this, arguments);
        };
      }

      // Inherit static properties.
      toolBelt.mergeObjects(Child, Parent, staticProps);

      // Set up the prototype chain.
      var Surrogate = function () { this.constructor = Child; };
      Surrogate.prototype = Parent.prototype;
      Child.prototype = new Surrogate();

      // Extend the prototype with new instance properties.
      if (protoProps) toolBelt.mergeObjects(Child.prototype, protoProps);

      // Store a reference to the parent prototype.
      Child.__super__ = Parent.prototype;

      return Child;
    };

    // Default model class for convenience.
    baseItemSchema = BaseDataModel;

    // Module object to be returned by the factory.
    var moduleApi = {
      // Exposes the base model class.
      BaseModel: baseItemSchema,

      // Utility to create a new model class.
      createModel: function (configObject) {
        var newModelClass = baseItemSchema.extend(configObject);
        return newModelClass;
      },

      // Utility to create a new collection class (not implemented in this snippet).
      createCollection: function (modelClass, configObject) {
        // Placeholder for collection logic.
        // This would typically return a new Collection class that manages multiple models.
        triggerFault('Collection creation is not yet implemented.');
      },

      // Exposes internal utility functions.
      utils: toolBelt,

      // Exposes internal path utility functions.
      path: pathUtil,

      // Sets global default configuration for all models.
      configure: function (newDefaults) {
        toolBelt.mergeObjects(defaultSchemaConfig, newDefaults);
      }
    };

    return moduleApi;
  };

  // Register the factory with Angular.
  ngCore.module('ngEntityGen', []).factory('ngEntityGen', ['$http', '$q', '$timeout', ngEntityGenFactory]);

}));