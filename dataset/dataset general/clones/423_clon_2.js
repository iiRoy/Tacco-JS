'use strict';

// Main application namespace for real-time communication utilities.
var CometHub = {
  PROTOCOL_VER:            '0.8.9',

  BAYEUX_SPEC_VER:         '1.0',
  IDENTIFIER_SIZE:         160,
  JSONP_INVOKER:           'jsonpcallback', // Default JSONP callback name
  SUPPORTED_TRANSPORTS:    ['long-polling', 'cross-origin-long-polling', 'callback-polling', 'websocket', 'eventsource', 'in-process'],

  REQUIRED_TRANSPORTS:     ['long-polling', 'callback-polling', 'in-process'],

  GLOBAL_SCOPE:            (typeof global === 'undefined') ? window : global, // Determine global object

  /*
   * Assigns properties from a source object to a target object.
   * @param {object} targetObj - The object to extend.
   * @param {object} sourceObj - The object containing properties to assign.
   * @param {boolean} allowOverwrite - If false, existing properties in targetObj are not overwritten.
   * @returns {object} The extended target object.
   */
  assignProps: function(targetObj, sourceObj, allowOverwrite) {
    if (!sourceObj) return targetObj;
    for (var propName in sourceObj) {
      if (!sourceObj.hasOwnProperty(propName)) continue;
      if (targetObj.hasOwnProperty(propName) && allowOverwrite === false) continue;
      if (targetObj[propName] !== sourceObj[propName])
        targetObj[propName] = sourceObj[propName];
    }
    return targetObj;
  },

  /*
   * Generates a random identifier string.
   * @param {number} bitCount - The desired bit length of the identifier. Defaults to IDENTIFIER_SIZE.
   * @returns {string} The generated random identifier.
   */
  genRandomId: function(bitCount) {
    bitCount = bitCount || this.IDENTIFIER_SIZE;
    if (bitCount > 32) {
      var sections    = Math.ceil(bitCount / 32),
          tempStr     = '';
      while (sections--) tempStr += this.genRandomId(32);
      var charList    = tempStr.split(''),
          finalResult = '';
      while (charList.length > 0) finalResult += charList.pop();
      return finalResult;
    }
    var upperBound  = Math.pow(2, bitCount) - 1,
        maxLength   = upperBound.toString(36).length,
        tempStr     = Math.floor(Math.random() * upperBound).toString(36);

    while (tempStr.length < maxLength) tempStr = '0' + tempStr;
    return tempStr;
  },

  /*
   * Extracts the client identifier from a list of messages.
   * @param {Array<object>} msgArray - An array of message objects.
   * @returns {string|undefined} The client identifier or undefined if not found.
   */
  extractClientKey: function(msgArray) {
    var initialMsg = [].concat(msgArray)[0];
    return initialMsg && initialMsg.clientIdentifier;
  },

  /*
   * Creates a deep clone of an object or array.
   * @param {any} inputObj - The object or value to clone.
   * @returns {any} A deep copy of the input.
   */
  deepClone: function(inputObj) {
    var clonedObj, idx, propKey;
    if (inputObj instanceof Array) {
      clonedObj = [];
      idx       = inputObj.length;
      while (idx--) clonedObj[idx] = CometHub.deepClone(inputObj[idx]);
      return clonedObj;
    } else if (typeof inputObj === 'object') {
      clonedObj = (inputObj === null) ? null : {};
      for (propKey in inputObj) clonedObj[propKey] = CometHub.deepClone(inputObj[propKey]);
      return clonedObj;
    } else {
      return inputObj;
    }
  },

  /*
   * Finds the first common element between two arrays.
   * @param {Array} arrayA - The first array.
   * @param {Array} arrayB - The second array.
   * @returns {any|null} The first common element found, or null if none.
   */
  findIntersection: function(arrayA, arrayB) {
    for (var idx = 0, len = arrayA.length; idx < len; idx++) {
      if (this.findIndex(arrayB, arrayA[idx]) !== -1)
        return arrayA[idx];
    }
    return null;
  },

  /*
   * Finds the index of an item in a list. Uses native indexOf if available.
   * @param {Array} dataList - The array to search.
   * @param {any} itemToFind - The item to locate.
   * @returns {number} The index of the item, or -1 if not found.
   */
  findIndex: function(dataList, itemToFind) {
    if (dataList.indexOf) return dataList.indexOf(itemToFind);

    for (var idx = 0, length = dataList.length; idx < length; idx++) {
      if (dataList[idx] === itemToFind) return idx;
    }
    return -1;
  },

  /*
   * Transforms a collection (array or object) using a callback function.
   * @param {Array|object} targetCollection - The collection to transform.
   * @param {function} transformerFn - The function to apply to each element.
   * @param {object} [executionCtx] - The context for the callback.
   * @returns {Array} An array of transformed results.
   */
  transformCollection: function(targetCollection, transformerFn, executionCtx) {
    if (targetCollection.map) return targetCollection.map(transformerFn, executionCtx);
    var transformedResult = [];

    if (targetCollection instanceof Array) {
      for (var index = 0, count = targetCollection.length; index < count; index++) {
        transformedResult.push(transformerFn.call(executionCtx || null, targetCollection[index], index));
      }
    } else {
      for (var elementKey in targetCollection) {
        if (!targetCollection.hasOwnProperty(elementKey)) continue;
        transformedResult.push(transformerFn.call(executionCtx || null, elementKey, targetCollection[elementKey]));
      }
    }
    return transformedResult;
  },

  /*
   * Filters an array based on a predicate function.
   * @param {Array} sourceArray - The array to filter.
   * @param {function} predicateFn - The function to test each element.
   * @param {object} [executionCtx] - The context for the predicate.
   * @returns {Array} A new array containing only the elements for which the predicate returned true.
   */
  selectElements: function(sourceArray, predicateFn, executionCtx) {
    var filteredItems = [];
    for (var idx = 0, arrLen = sourceArray.length; idx < arrLen; idx++) {
      if (predicateFn.call(executionCtx || null, sourceArray[idx], idx))
        filteredItems.push(sourceArray[idx]);
    }
    return filteredItems;
  },

  /*
   * Iterates over a list asynchronously.
   * @param {Array} itemList - The list to iterate.
   * @param {function} asyncIterator - The function to call for each item, taking the item and a 'resume' callback.
   * @param {function} [completionCallback] - Callback to execute when all items are processed.
   * @param {object} [execContext] - The context for the callbacks.
   */
  processAsyncList: function(itemList, asyncIterator, completionCallback, execContext) {
    var totalItems       = itemList.length,
        currentItemIndex = -1,
        pendingCalls     = 0,
        isLooping        = false;

    var processNext = function() {
      pendingCalls -= 1;
      currentItemIndex += 1;
      if (currentItemIndex === totalItems) return completionCallback && completionCallback.call(execContext);
      asyncIterator(itemList[currentItemIndex], continueProcessing);
    };

    var runLoop = function() {
      if (isLooping) return;
      isLooping = true;
      while (pendingCalls > 0) processNext();
      isLooping = false;
    };

    var continueProcessing = function() {
      pendingCalls += 1;
      runLoop();
    };
    continueProcessing();
  },

  /*
   * Serializes an object to a JSON string.
   * Handles circular references if a custom stringifier is provided.
   * @param {object} inputVal - The object to serialize.
   * @returns {string} The JSON string representation.
   */
  serializeObject: function(inputVal) {
    if (this.serializerFunc)
      return this.serializerFunc(inputVal, function(propName, propValue) {
        return (this[propName] instanceof Array)
            ? this[propName]
            : propValue;
      });

    return JSON.stringify(inputVal);
  },

  /*
   * Logs a message to the console if available.
   * @param {string} logMsg - The message to log.
   */
  logOutput: function(logMsg) {
    if (typeof console !== 'undefined') console.log(logMsg);
  },

  /*
   * Generates a formatted timestamp string.
   * @returns {string} The formatted timestamp.
   */
  getCurrentTime: function() {
    var currentDate    = new Date(),
        fullYear       = currentDate.getFullYear(),
        calMonth       = currentDate.getMonth() + 1,
        dayOfMonth     = currentDate.getDate(),
        hourOfDay      = currentDate.getHours(),
        minuteOfHour   = currentDate.getMinutes(),
        secondOfMinute = currentDate.getSeconds();

    var addLeadingZero = function(num) {
      return num < 10 ? '0' + num : String(num);
    };

    return addLeadingZero(fullYear) + '-' + addLeadingZero(calMonth) + '-' + addLeadingZero(dayOfMonth) + ' ' +
           addLeadingZero(hourOfDay) + ':' + addLeadingZero(minuteOfHour) + ':' + addLeadingZero(secondOfMinute);
  }
};

if (typeof window !== 'undefined') {
  window.CometHub = CometHub;
}


/*
 * Defines a new class based on a parent class and a set of methods.
 * @param {function} [baseClass=Object] - The parent constructor function.
 * @param {object} classMethods - An object containing methods for the new class.
 * @returns {function} The new class constructor.
 */
CometHub.DefineClass = function(baseClass, classMethods) {
  if (typeof baseClass !== 'function') {
    classMethods = baseClass;
    baseClass    = Object;
  }

  var newClass = function() {
    if (!this.init) return this;
    return this.init.apply(this, arguments) || this;
  };

  var protoBridge = function() {};
  protoBridge.prototype = baseClass.prototype;

  newClass.prototype = new protoBridge();
  CometHub.assignProps(newClass.prototype, classMethods);

  return newClass;
};


/*
 * Manages a registry of unique names/identifiers.
 */
CometHub.NameRegistry = CometHub.DefineClass({
  init: function() {
    this._registeredNames = {};
  },

  /*
   * Checks if an ID is already registered.
   * @param {string} nameId - The ID to check.
   * @returns {boolean} True if registered, false otherwise.
   */
  isRegistered: function(nameId) {
    return this._registeredNames.hasOwnProperty(nameId);
  },

  /*
   * Generates and registers a new unique ID.
   * @returns {string} The newly generated and registered ID.
   */
  createUnique: function() {
    var name = CometHub.genRandomId();
    while (this._registeredNames.hasOwnProperty(name))
      name = CometHub.genRandomId();
    return this._registeredNames[name] = name;
  },

  /*
   * Deregisters an ID.
   * @param {string} nameId - The ID to deregister.
   */
  deregister: function(nameId) {
    delete this._registeredNames[nameId];
  }
});


/*
 * Represents a CometHub error with a code, parameters, and message.
 */
CometHub.Issue = CometHub.DefineClass({
  init: function(errorCode, errorParams, errorMsg) {
    this.errorCode   = errorCode;
    this.errorParams = Array.from(errorParams); // Convert arguments to actual array
    this.errorMsg    = errorMsg;
  },

  /*
   * Formats the error into a string.
   * @returns {string} The formatted error string.
   */
  formatError: function() {
    return this.errorCode + ':' +
           this.errorParams.join(',') + ':' +
           this.errorMsg;
  }
});

/*
 * Static method to parse an error string into a CometHub.Issue object.
 * @param {string} message - The error string to parse.
 * @returns {CometHub.Issue} The parsed error object.
 */
CometHub.Issue.parseIssue = function(message) {
  message = message || '';
  if (!CometHub.SyntaxRules.ISSUE_PATTERN.test(message)) return new this(null, [], message);

  var msgParts   = message.split(':'),
      parsedCode = parseInt(msgParts[0]),
      parsedParams = msgParts[1].split(','),
      parsedMsg  = msgParts[2];

  return new this(parsedCode, parsedParams, parsedMsg);
};


/*
 * Predefined error types for common scenarios.
 */
CometHub.Issue.verMismatch = function() {
  return new CometHub.Issue(300, arguments, "Version mismatch").formatError();
};

CometHub.Issue.transportMismatch = function() {
  return new CometHub.Issue(301, arguments, "Connection types not supported").formatError();
};

CometHub.Issue.extensMismatch = function() {
  return new CometHub.Issue(302, arguments, "Extension mismatch").formatError();
};

CometHub.Issue.badRequestError = function() {
  return new CometHub.Issue(400, arguments, "Bad request").formatError();
};

CometHub.Issue.unknownClient = function() {
  return new CometHub.Issue(401, arguments, "Unknown client").formatError();
};

CometHub.Issue.missingParam = function() {
  return new CometHub.Issue(402, arguments, "Missing required parameter").formatError();
};

CometHub.Issue.forbiddenChannel = function() {
  return new CometHub.Issue(403, arguments, "Forbidden channel").formatError();
};

CometHub.Issue.unknownChannel = function() {
  return new CometHub.Issue(404, arguments, "Unknown channel").formatError();
};

CometHub.Issue.invalidChannel = function() {
  return new CometHub.Issue(405, arguments, "Invalid channel").formatError();
};

CometHub.Issue.unknownExtension = function() {
  return new CometHub.Issue(406, arguments, "Unknown extension").formatError();
};

CometHub.Issue.pubFailed = function() {
  return new CometHub.Issue(407, arguments, "Failed to publish").formatError();
};

CometHub.Issue.internalServerError = function() {
  return new CometHub.Issue(500, arguments, "Internal server error").formatError();
};



/*
 * Mixin for adding deferred execution capabilities (promises).
 */
CometHub.DeferredHandler = {
  /*
   * Registers a success callback. If the deferred operation has already completed successfully,
   * the callback is executed immediately.
   * @param {function} callback - The function to call on success.
   * @param {object} [execContext] - The context for the callback.
   */
  onSuccess: function(callback, execContext) {
    if (!callback) return;

    if (this._deferState === 'completed')
      return callback.apply(execContext, this._deferArgs);

    this._successCallbacks = this._successCallbacks || [];
    this._successCallbacks.push([callback, execContext]);
  },

  /*
   * Sets a timeout for the deferred operation, causing it to fail if not completed within the delay.
   * @param {number} delaySeconds - The timeout duration in seconds.
   * @param {string} timeoutMessage - The message to pass to the failure callback.
   */
  addTimeout: function(delaySeconds, timeoutMessage) {
    var selfRef = this;
    var timer   = CometHub.GLOBAL_SCOPE.setTimeout(function() {
      selfRef.setDeferState('errored', timeoutMessage);
    }, delaySeconds * 1000);
    this._deferTimer = timer;
  },

  /*
   * Registers a failure callback. If the deferred operation has already failed,
   * the callback is executed immediately.
   * @param {function} callback - The function to call on failure.
   * @param {object} [execContext] - The context for the callback.
   */
  onFailure: function(callback, execContext) {
    if (!callback) return;

    if (this._deferState === 'errored')
      return callback.apply(execContext, this._deferArgs);

    this._errorCallbacks = this._errorCallbacks || [];
    this._errorCallbacks.push([callback, execContext]);
  },

  /*
   * Sets the status of the deferred operation and triggers appropriate callbacks.
   * @param {string} newState - The new state ('completed' or 'errored').
   * @param {...any} stateArgs - Arguments to pass to the callbacks.
   */
  setDeferState: function() {
    if (this._deferTimer)
      CometHub.GLOBAL_SCOPE.clearTimeout(this._deferTimer);

    var stateArgs       = Array.from(arguments),
        newState        = stateArgs.shift(),
        activeCallbacks;

    this._deferState = newState;
    this._deferArgs  = stateArgs;

    if (newState === 'completed')
      activeCallbacks = this._successCallbacks;
    else if (newState === 'errored')
      activeCallbacks = this._errorCallbacks;

    if (!activeCallbacks) return;

    var currentCallback;
    while (currentCallback = activeCallbacks.shift())
      currentCallback[0].apply(currentCallback[1], this._deferArgs);
  }
};


/*
 * Mixin for adding event publishing/subscribing capabilities.
 */
CometHub.EventBroadcaster = {
  /*
   * Returns the number of listeners for a specific event type.
   * @param {string} eventName - The name of the event.
   * @returns {number} The count of listeners.
   */
  listenerCount: function(eventName) {
    if (!this._eventSubscribers || !this._eventSubscribers[eventName]) return 0;
    return this._eventSubscribers[eventName].length;
  },

  /*
   * Subscribes a listener to an event.
   * @param {string} eventName - The name of the event.
   * @param {function} eventListener - The function to call when the event is emitted.
   * @param {object} [listenerContext] - The context for the listener function.
   */
  subscribe: function(eventName, eventListener, listenerContext) {
    this._eventSubscribers = this._eventSubscribers || {};
    var subscriberList = this._eventSubscribers[eventName] = this._eventSubscribers[eventName] || [];
    subscriberList.push([eventListener, listenerContext]);
  },

  /*
   * Unsubscribes a listener from an event.
   * If no listener is provided, all listeners for the event are removed.
   * @param {string} eventName - The name of the event.
   * @param {function} [eventListener] - The specific listener to remove.
   * @param {object} [listenerContext] - The context of the listener to remove.
   */
  unsubscribe: function(eventName, eventListener, listenerContext) {
    if (!this._eventSubscribers || !this._eventSubscribers[eventName]) return;

    if (!eventListener) {
      delete this._eventSubscribers[eventName];
      return;
    }
    var subscriberList = this._eventSubscribers[eventName],
        idx            = subscriberList.length;

    while (idx--) {
      if (eventListener !== subscriberList[idx][0]) continue;
      if (listenerContext && subscriberList[idx][1] !== listenerContext) continue;
      subscriberList.splice(idx,1);
    }
  },

  /*
   * Emits an event, calling all registered listeners.
   * @param {string} eventName - The name of the event to emit.
   * @param {...any} eventArgs - Arguments to pass to the listeners.
   */
  emitEvent: function() {
    var eventArgs = Array.from(arguments),
        eventName = eventArgs.shift();

    if (!this._eventSubscribers || !this._eventSubscribers[eventName]) return;

    var activeListeners = this._eventSubscribers[eventName].slice(),
        currentListener;

    for (var idx = 0, len = activeListeners.length; idx < len; idx++) {
      currentListener = activeListeners[idx];
      currentListener[0].apply(currentListener[1], eventArgs);
    }
  }
};


/*
 * Mixin for managing scheduled timeouts.
 */
CometHub.TimerManager = {
  /*
   * Registers a new named timeout. If a timeout with the same name already exists, it is ignored.
   * @param {string} timerName - A unique name for the timeout.
   * @param {number} delayInSeconds - The delay before the callback is executed.
   * @param {function} timerCallback - The function to execute after the delay.
   * @param {object} [callbackContext] - The context for the callback.
   */
  registerTimer: function(timerName, delayInSeconds, timerCallback, callbackContext) {
    this._activeTimers = this._activeTimers || {};
    if (this._activeTimers.hasOwnProperty(timerName)) return;
    var instanceRef = this;
    this._activeTimers[timerName] = CometHub.GLOBAL_SCOPE.setTimeout(function() {
      delete instanceRef._activeTimers[timerName];
      timerCallback.call(callbackContext);
    }, 1000 * delayInSeconds);
  },

  /*
   * Cancels a previously registered named timeout.
   * @param {string} timerName - The name of the timeout to cancel.
   */
  cancelTimer: function(timerName) {
    this._activeTimers = this._activeTimers || {};
    var currentTimer = this._activeTimers[timerName];
    if (!currentTimer) return;
    clearTimeout(currentTimer);
    delete this._activeTimers[timerName];
  }
};


/*
 * Mixin for adding logging functionality.
 */
CometHub.DebugLog = {
  SEVERITY_LEVELS: {
    crit:  3,
    warn:  2,
    info:  1,
    debug: 0
  },

  currentSeverity: 'crit', // Default logging level

  /*
   * Outputs a log message if its level meets the current severity threshold.
   * @param {Array<any>} logArguments - An array containing the message format string and arguments.
   * @param {string} level - The severity level of the message (e.g., 'crit', 'warn').
   */
  outputLog: function(logArguments, level) {
    if (!CometHub.logOutput) return;

    var severityMap = CometHub.DebugLog.SEVERITY_LEVELS;
    if (severityMap[CometHub.DebugLog.currentSeverity] > severityMap[level]) return;

    var logArguments     = Array.from(logArguments),
        logPrefix        = ' [' + level.toUpperCase() + '] [CometHub',
        className        = this.className,

        formattedMessage = logArguments.shift().replace(/\?/g, function() {
          try {
            return CometHub.serializeObject(logArguments.shift());
          } catch (err) {
            return '[Object]';
          }
        });

    for (var propKey in CometHub) {
      if (className) continue;
      if (typeof CometHub[propKey] !== 'function') continue;
      if (this instanceof CometHub[propKey]) className = propKey;
    }
    if (className) logPrefix += '.' + className;
    logPrefix += '] ';

    CometHub.logOutput(CometHub.getCurrentTime() + logPrefix + formattedMessage);
  }
};

/*
 * Dynamically creates logging methods (e.g., CometHub.DebugLog.crit(), CometHub.DebugLog.debug()).
 */
(function() {
  for (var levelKey in CometHub.DebugLog.SEVERITY_LEVELS)
    (function(currentLevel, levelValue) {
      CometHub.DebugLog[currentLevel] = function() {
        this.outputLog(arguments, currentLevel);
      };
    })(levelKey, CometHub.DebugLog.SEVERITY_LEVELS[levelKey]);
})();


/*
 * Defines regular expressions for validating various components.
 */
CometHub.SyntaxRules = {

  LOWERCASE_ALPHA:     /^[a-z]$/,

  UPPERCASE_ALPHA:     /^[A-Z]$/,

  ANY_ALPHA:           /^([a-z]|[A-Z])$/,

  NUMERIC_DIGIT:       /^[0-9]$/,

  ALPHA_NUMERIC:       /^(([a-z]|[A-Z])|[0-9])$/,

  SPECIAL_CHAR:        /^(\-|\_|\!|\~|\(|\)|\$|\@)$/,

  GENERAL_STRING:      /^(((([a-z]|[A-Z])|[0-9])|(\-|\_|\!|\~|\(|\)|\$|\@)| |\/|\*|\.))*$/,

  IDENTIFIER_TOKEN:    /^(((([a-z]|[A-Z])|[0-9])|(\-|\_|\!|\~|\(|\)|\$|\@)))+$/,

  WHOLE_NUMBER:        /^([0-9])+$/,

  PATH_SEGMENT:        /^(((([a-z]|[A-Z])|[0-9])|(\-|\_|\!|\~|\(|\)|\$|\@)))+$/,

  PATH_SEGMENTS:       /^(((([a-z]|[A-Z])|[0-9])|(\-|\_|\!|\~|\(|\)|\$|\@)))+(\/(((([a-z]|[A-Z])|[0-9])|(\-|\_|\!|\~|\(|\)|\$|\@)))+)*$/,

  RESOURCE_PATH:       /^\/(((([a-z]|[A-Z])|[0-9])|(\-|\_|\!|\~|\(|\)|\$|\@)))+(\/(((([a-z]|[A-Z])|[0-9])|(\-|\_|\!|\~|\(|\)|\$|\@)))+)*$/,

  WILDCARD_SYMBOL:     /^\*{1,2}$/,

  RESOURCE_PATTERN:    /^(\/(((([a-z]|[A-Z])|[0-9])|(\-|\_|\!|\~|\(|\)|\$|\@)))+)*\/\*{1,2}$/,

  VERSION_PART:        /^(([a-z]|[A-Z])|[0-9])(((([a-z]|[A-Z])|[0-9])|\-|\_))*$/,

  FULL_VERSION:        /^([0-9])+(\.(([a-z]|[A-Z])|[0-9])(((([a-z]|[A-Z])|[0-9])|\-|\_))*)*$/,

  CLIENT_IDENTIFIER:   /^((([a-z]|[A-Z])|[0-9]))+$/,

  GENERIC_ID:          /^((([a-z]|[A-Z])|[0-9]))+$/,

  ISSUE_PATTERN:       /^([0-9]+):((([^,:]+)(,([^,:]+))*)*):(.*)$/ // For parsing error messages
};