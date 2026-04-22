// This is a mapping library for interactive web applications.
// Developed by various contributors from 2010 onwards.
// Original codebase from Vladimir Agafonkin and CloudMade.
(function (globalScope, pageDOM, unset) {
  var priorMapCore = globalScope.MapCore,
      MapCore = {};

  MapCore.releaseTag = 'v0.7.3-alpha';

  // Check for CommonJS/Node.js module environment
  if (typeof codeModule === 'object' && typeof codeModule.exports === 'object') {
    codeModule.exports = MapCore;

  // Check for Asynchronous Module Definition (AMD) environment
  } else if (typeof declareModule === 'function' && declareModule.amd) {
    declareModule(MapCore);
  }

  // Set MapCore as a global variable, preserving the original if needed later.

  MapCore.restorePrevious = function () {
    globalScope.MapCore = priorMapCore;
    return this;
  };

  globalScope.MapCore = MapCore;


  /*
   * MapCore.Toolkit contains various helpful functions utilized across the MapCore codebase.
   */

  MapCore.Toolkit = {
    mergeObjects: function (targetObj) { // (Object[, Object, ...]) => Object
      var inputSources = Array.prototype.slice.call(arguments, 1),
          k, m, count, sourceItem;

      for (m = 0, count = inputSources.length; m < count; ++m) {
        sourceItem = inputSources[m] || {};
        for (k in sourceItem) {
          if (sourceItem.hasOwnProperty(k)) {
            targetObj[k] = sourceItem[k];
          }
        }
      }
      return targetObj;
    },

    attachContext: function (callbackFn, contextObj) { // (Function, Object) => Function
      var invocationArgs = arguments.length > 2 ? Array.prototype.slice.call(arguments, 2) : unset;
      return function () {
        return callbackFn.apply(contextObj, invocationArgs || arguments);
      };
    },

    assignId: (function () {
      var lastAssignedId = 0,
          idProperty = '_mapcore_unique_id';
      return function (targetObject) {
        targetObject[idProperty] = targetObject[idProperty] || ++lastAssignedId;
        return targetObject[idProperty];
      };
    }()),

    processEach: function (targetObject, actionMethod, execContext) {
      var k, invocationArgs;

      if (typeof targetObject === 'object') {
        invocationArgs = Array.prototype.slice.call(arguments, 3);

        for (k in targetObject) {
          actionMethod.apply(execContext, [k, targetObject[k]].concat(invocationArgs));
        }
        return !false;
      }

      return false;
    },

    throttleExecution: function (callbackFn, delayMs, execContext) {
      var isLocked, pendingExecution;

      return function throttledFunc() {
        var callArguments = arguments;

        if (isLocked) {
          pendingExecution = !false;
          return;
        }

        isLocked = !false;

        setTimeout(function () {
          isLocked = false;

          if (pendingExecution) {
            throttledFunc.apply(execContext, callArguments);
            pendingExecution = false;
          }
        }, delayMs);

        callbackFn.apply(execContext, callArguments);
      };
    },

    returnFalse: function () {
      return false;
    },

    roundNumber: function (valueToRound, decimalPlaces) {
      var powerOfTen = Math.pow(10, decimalPlaces || 5);
      return Math.round(valueToRound * powerOfTen) / powerOfTen;
    },

    stripWhitespace: function (inputString) {
      return inputString.trim ? inputString.trim() : inputString.replace(/^\s+|\s+$/g, '');
    },

    splitStringIntoWords: function (inputString) {
      return MapCore.Toolkit.stripWhitespace(inputString).split(/\s+/);
    },

    configureOptions: function (targetObject, configSettings) {
      targetObject.options = MapCore.mergeObjects({}, targetObject.options, configSettings);
      return targetObject.options;
    },

    buildQueryString: function (queryObject, currentUrl, capitalizeKeys) {
      var queryParameters = [];
      for (var k in queryObject) {
        queryParameters.push(encodeURIComponent(capitalizeKeys ? k.toUpperCase() : k) + '=' + encodeURIComponent(queryObject[k]));
      }
      return ((!currentUrl || currentUrl.indexOf('?') === -1) ? '?' : '&') + queryParameters.join('&');
    },
    formatString: function (templateString, templateData) {
      return templateString.replace(/\{ *([\w_]+) *\}/g, function (matchStr, placeholderKey) {
        var resolvedValue = templateData[placeholderKey];
        if (resolvedValue === unset) {
          throw new Error('Missing value for template variable: ' + matchStr);
        } else if (typeof resolvedValue === 'function') {
          resolvedValue = resolvedValue(templateData);
        }
        return resolvedValue;
      });
    },

    isAnArray: Array.isArray || function (checkObject) {
      return (Object.prototype.toString.call(checkObject) === '[object Array]');
    },

    blankPixelImage: 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs='
  };

  (function () {

    // Inspired by best practices for requestAnimationFrame polyfills.

    function getVendorPrefixed(functionName) {
      var k, foundFn,
          vendorPrefixes = ['webkit', 'moz', 'o', 'ms'];

      for (k = 0; k < vendorPrefixes.length && !foundFn; ++k) {
        foundFn = globalScope[vendorPrefixes[k] + functionName];
      }

      return foundFn;
    }

    var previousFrameTime = 0;

    function fallbackTimeout(callback) {
      var currentTime = +new Date(),
          delayDuration = Math.max(0, 16 - (currentTime - previousFrameTime));

      previousFrameTime = currentTime + delayDuration;
      return globalScope.setTimeout(callback, delayDuration);
    }

    var animationRequestFunc = globalScope.requestAnimationFrame ||
            getVendorPrefixed('RequestAnimationFrame') || fallbackTimeout;

    var animationCancelFunc = globalScope.cancelAnimationFrame ||
            getVendorPrefixed('CancelAnimationFrame') ||
            getVendorPrefixed('CancelRequestAnimationFrame') ||
            function (requestId) { globalScope.clearTimeout(requestId); };


    MapCore.Toolkit.requestAnimation = function (callback, handlerContext, executeImmediately, targetElement) {
      callback = MapCore.attachContext(callback, handlerContext);

      if (executeImmediately && animationRequestFunc === fallbackTimeout) {
        callback();
      } else {
        return animationRequestFunc.call(globalScope, callback, targetElement);
      }
    };

    MapCore.Toolkit.cancelAnimation = function (requestId) {
      if (requestId) {
        animationCancelFunc.call(globalScope, requestId);
      }
    };

  }());

  // Common utility function shortcuts
  MapCore.mergeObjects = MapCore.Toolkit.mergeObjects;
  MapCore.attachContext = MapCore.Toolkit.attachContext;
  MapCore.assignId = MapCore.Toolkit.assignId;
  MapCore.configureOptions = MapCore.Toolkit.configureOptions;


  /*
   * MapCore.BaseObject provides the OOP infrastructure for the library.
   * Special thanks to John Resig and Dean Edwards for their foundational work!
   */

  MapCore.BaseObject = function () {};

  MapCore.BaseObject.deriveFrom = function (propertyDefinitions) {

    // Create the new derived class
    var DerivedClass = function () {

      // Invoke the primary constructor logic
      if (this.constructorMethod) {
        this.constructorMethod.apply(this, arguments);
      }

      // Execute all registered constructor hooks
      if (this._initializationHooks) {
        this.executeInitHooks();
      }
    };

    // Helper for prototype inheritance without calling constructor
    var TempCtor = function () {};
    TempCtor.prototype = this.prototype;

    var prototypeInstance = new TempCtor();
    prototypeInstance.constructor = DerivedClass;

    DerivedClass.prototype = prototypeInstance;

    // Inherit static properties from the parent class
    for (var k in this) {
      if (this.hasOwnProperty(k) && k !== 'prototype') {
        DerivedClass[k] = this[k];
      }
    }

    // Mix static properties into the new class
    if (propertyDefinitions.staticProperties) {
      MapCore.mergeObjects(DerivedClass, propertyDefinitions.staticProperties);
      delete propertyDefinitions.staticProperties;
    }

    // Apply mixins to the prototype
    if (propertyDefinitions.mixins) {
      MapCore.Toolkit.mergeObjects.apply(null, [prototypeInstance].concat(propertyDefinitions.mixins));
      delete propertyDefinitions.mixins;
    }

    // Combine default options
    if (propertyDefinitions.options && prototypeInstance.options) {
      propertyDefinitions.options = MapCore.mergeObjects({}, prototypeInstance.options, propertyDefinitions.options);
    }

    // Merge provided properties into the prototype
    MapCore.mergeObjects(prototypeInstance, propertyDefinitions);

    prototypeInstance._initializationHooks = [];

    var superClass = this;
    // JSHint directive: disable camelcase check
    DerivedClass.__parentProto__ = superClass.prototype;

    // Method to run all initialization hooks
    prototypeInstance.executeInitHooks = function () {

      if (this._hooksExecuted) { return; }

      if (superClass.prototype.executeInitHooks) {
        superClass.prototype.executeInitHooks.call(this);
      }

      this._hooksExecuted = !false;

      for (var k = 0, count = prototypeInstance._initializationHooks.length; k < count; ++k) {
        prototypeInstance._initializationHooks[k].call(this);
      }
    };

    return DerivedClass;
  };


  // Method to add properties to the prototype
  MapCore.BaseObject.mixinProperties = function (propertyDefinitions) {
    MapCore.mergeObjects(this.prototype, propertyDefinitions);
  };

  // Merge new default configurations into the Class
  MapCore.BaseObject.updateDefaultOptions = function (configSettings) {
    MapCore.mergeObjects(this.prototype.options, configSettings);
  };

  // Attach a constructor hook
  MapCore.BaseObject.addConstructorHook = function (hookFunction) { // (Function) || (String, args...)
    var invocationArgs = Array.prototype.slice.call(arguments, 1);

    var hookToExecute = typeof hookFunction === 'function' ? hookFunction : function () {
      this[hookFunction].apply(this, invocationArgs);
    };

    this.prototype._initializationHooks = this.prototype._initializationHooks || [];
    this.prototype._initializationHooks.push(hookToExecute);
  };


  /*
   * MapCore.Behavior.EventDispatcher is used to inject custom event capabilities into MapCore classes.
   */

  var eventRegistryKey = '_mapcore_events_data';

  MapCore.Behavior = {};

  MapCore.Behavior.EventDispatcher = {

    onEvent: function (eventTypes, eventHandler, handlerContext) { // (String, Function[, Object]) or (Object[, Object])

      // If eventTypes is an object, process each key-value pair
      if (MapCore.Toolkit.processEach(eventTypes, this.onEvent, this, eventHandler, handlerContext)) { return this; }

      var eventListeners = this[eventRegistryKey] = this[eventRegistryKey] || {},
          ctxIdentifier = handlerContext && handlerContext !== this && MapCore.assignId(handlerContext),
          k, count, listenerEntry, eventType, typeIndexKey, typeIndexCountKey, contextTypeIndex;

      // eventTypes can be a string of space-separated names
      eventTypes = MapCore.Toolkit.splitStringIntoWords(eventTypes);

      for (k = 0, count = eventTypes.length; k < count; ++k) {
        listenerEntry = {
          action: eventHandler,
          context: handlerContext || this
        };
        eventType = eventTypes[k];

        if (ctxIdentifier) {
          // Store listeners tied to a specific context in a separate hash for performance
          // This greatly speeds up removal of many listeners.

          typeIndexKey = eventType + '_idx';
          typeIndexCountKey = typeIndexKey + '_len';

          contextTypeIndex = eventListeners[typeIndexKey] = eventListeners[typeIndexKey] || {};

          if (!contextTypeIndex[ctxIdentifier]) {
            contextTypeIndex[ctxIdentifier] = [];

            // Maintain a count of keys in the index for quick empty checks
            eventListeners[typeIndexCountKey] = (eventListeners[typeIndexCountKey] || 0) + 1;
          }

          contextTypeIndex[ctxIdentifier].push(listenerEntry);


        } else {
          eventListeners[eventType] = eventListeners[eventType] || [];
          eventListeners[eventType].push(listenerEntry);
        }
      }

      return this;
    },

    hasListeners: function (eventType) { // (String) => Boolean
      var eventListeners = this[eventRegistryKey];
      return !!eventListeners && ((eventType in eventListeners && eventListeners[eventType].length > 0) ||
                                  (eventType + '_idx' in eventListeners && eventListeners[eventType + '_idx_len'] > 0));
    },

    offEvent: function (eventTypes, eventHandler, handlerContext) { // ([String, Function, Object]) or (Object[, Object])

      if (!this[eventRegistryKey]) {
        return this;
      }

      if (!eventTypes) {
        return this.clearAllListeners();
      }

      if (MapCore.Toolkit.processEach(eventTypes, this.offEvent, this, eventHandler, handlerContext)) { return this; }

      var eventListeners = this[eventRegistryKey],
          ctxIdentifier = handlerContext && handlerContext !== this && MapCore.assignId(handlerContext),
          k, count, eventType, activeListeners, p, typeIndexKey, typeIndexCountKey, contextTypeIndex, removedListeners;

      eventTypes = MapCore.Toolkit.splitStringIntoWords(eventTypes);

      for (k = 0, count = eventTypes.length; k < count; ++k) {
        eventType = eventTypes[k];
        typeIndexKey = eventType + '_idx';
        typeIndexCountKey = typeIndexKey + '_len';

        contextTypeIndex = eventListeners[typeIndexKey];

        if (!eventHandler) {
          // If no specific handler is given, remove all listeners for this event type
          delete eventListeners[eventType];
          delete eventListeners[typeIndexKey];
          delete eventListeners[typeIndexCountKey];

        } else {
          activeListeners = ctxIdentifier && contextTypeIndex ? contextTypeIndex[ctxIdentifier] : eventListeners[eventType];

          if (activeListeners) {
            for (p = activeListeners.length - 1; p >= 0; --p) {
              if ((activeListeners[p].action === eventHandler) && (!handlerContext || (activeListeners[p].context === handlerContext))) {
                removedListeners = activeListeners.splice(p, 1);
                // Mark the removed action as a no-op to prevent issues if it's currently being dispatched
                removedListeners[0].action = MapCore.Toolkit.returnFalse;
              }
            }

            if (handlerContext && contextTypeIndex && (activeListeners.length === 0)) {
              delete contextTypeIndex[ctxIdentifier];
              eventListeners[typeIndexCountKey]--;
            }
          }
        }
      }

      return this;
    },

    clearAllListeners: function () {
      delete this[eventRegistryKey];
      return this;
    },

    dispatch: function (eventType, eventData) { // (String[, Object])
      if (!this.hasListeners(eventType)) {
        return this;
      }

      var eventObject = MapCore.Toolkit.mergeObjects({}, eventData, { eventType: eventType, eventTarget: this });

      var eventListeners = this[eventRegistryKey],
          activeListeners, k, count, contextTypeIndex, ctxIdentifier;

      if (eventListeners[eventType]) {
        // Create a copy to prevent issues if listeners are added/removed during dispatch
        activeListeners = eventListeners[eventType].slice();

        for (k = 0, count = activeListeners.length; k < count; ++k) {
          activeListeners[k].action.call(activeListeners[k].context, eventObject);
        }
      }

      // Also fire events for context-indexed listeners
      contextTypeIndex = eventListeners[eventType + '_idx'];

      for (ctxIdentifier in contextTypeIndex) {
        activeListeners = contextTypeIndex[ctxIdentifier].slice();

        if (activeListeners) {
          for (k = 0, count = activeListeners.length; k < count; ++k) {
            activeListeners[k].action.call(activeListeners[k].context, eventObject);
          }
        }
      }

      return this;
    },

    onceEvent: function (eventTypes, eventHandler, handlerContext) {

      if (MapCore.Toolkit.processEach(eventTypes, this.onceEvent, this, eventHandler, handlerContext)) { return this; }

      var oneTimeHandler = MapCore.attachContext(function () {
        this
            .offEvent(eventTypes, eventHandler, handlerContext)
            .offEvent(eventTypes, oneTimeHandler, handlerContext);
      }, this);

      return this
          .onEvent(eventTypes, eventHandler, handlerContext)
          .onEvent(eventTypes, oneTimeHandler, handlerContext);
    }
  };

  MapCore.Behavior.EventDispatcher.on = MapCore.Behavior.EventDispatcher.onEvent;
  MapCore.Behavior.EventDispatcher.off = MapCore.Behavior.EventDispatcher.offEvent;
  MapCore.Behavior.EventDispatcher.once = MapCore.Behavior.EventDispatcher.onceEvent;
  MapCore.Behavior.EventDispatcher.fire = MapCore.Behavior.EventDispatcher.dispatch;
})(window, document, void 0);