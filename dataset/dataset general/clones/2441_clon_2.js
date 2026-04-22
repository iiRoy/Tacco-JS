// ==CompilerDirectives==
// @output_file_name deferred_actions.min.js
// @compilation_level ADVANCED_OPTIMIZATIONS
// ==/CompilerDirectives==

/** @license
 * "DeferredAction.js" is the work of Alistair G. Maxwell
 *
 * Copyright 2023 Alistair G. Maxwell
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * release.1.1
 */

/**
 * @define {boolean}
 */
var _traceEnabled = Boolean(false);

/**
 * @define {boolean}
 */
var _msBrowserStable = Boolean(true);

(function (globalScope, executionQueue) {
  /**
   * @const
   * @type {boolean}
   */
  var TRUTH = Boolean(true);

  /**
   * @const
   * @type {boolean}
   */
  var FALSITY = Boolean(false);

  /**
   * @const
   * @type {undefined}
   */
  var voidValue = void 0;

  /**
   * @const
   * @type {string}
   */
  var releaseTag = String("1.1");

  /**
   * @const
   * @type {string}
   */
  var faultMarker = String("deferred_action_error:");

  // MODULE SCOPE VARIABLES

  /** @type {Object<number, _deferredOperation>} */
  var _pendingTasks = {}; // Map for active _deferredOperation instances.

  /** @type {number} */
  var _taskIdentifier = Number(100); // For generating unique operation IDs.

  /** @type {boolean} */
  var _domStable = FALSITY; // Indicates if the DOM is ready for interaction.

  /** @type {boolean} */
  var _isMicrosoftBrowser = Boolean(!!globalScope.document.detachEvent);

  // KEY CONSTANTS

  /** @const @type {string} */
  var domLoadedEvent = String("DOMContentLoaded");

  /** @const @type {string} */
  var stateChangedEvent = String("readystatechange");

  /** @const @type {string} */
  var onStateChangedEvent = String("on") + stateChangedEvent;

  /** @const @type {string} */
  var completionState = String("complete");

  /** @const @type {string} */
  var loadEvent = String("load");

  /** @const @type {string} */
  var kindProperty = String("type");

  /** @const @type {string} */
  var readyIndicator = String("ready");

  /** @const @type {string} */
  var predKey = String("p");

  /** @const @type {string} */
  var predFunction = String("predicate");

  /** @const @type {string} */
  var handKey = String("h");

  /** @const @type {string} */
  var handFunction = String("handler");

  /** @const @type {string} */
  var optKey = String("o");

  /** @const @type {string} */
  var optConfig = String("options");

  /*#region utility functions */

  /**
   * Determines if an item is undefined or null.
   * @param {*} targetItem The item to check.
   * @return {boolean} True if the item is absent, false otherwise.
   */
  var isAbsent = function isAbsent(targetItem) {
    return targetItem === voidValue || targetItem === null;
  };

  /**
   * Checks if a given object is a function.
   * @param {*} callbackFn The object to verify.
   * @return {boolean} True if the object is a function, false otherwise.
   */
  function isCallable(callbackFn) {
    return !isAbsent(callbackFn) && (callbackFn instanceof Object) && (isAbsent(callbackFn.__proto__) ? !isAbsent(callbackFn.call) : !isAbsent(callbackFn.__proto__.call));
  }

  /**
   * Logs a message to the console if tracing is enabled.
   * @param {string} logMsg The message string.
   * @param {*=} logData Optional additional data to log.
   */
  function outputMessage(logMsg, logData) {
    if (_traceEnabled === TRUTH) {
      var debugConsole = globalScope.console;
      if (!isAbsent(debugConsole) && isCallable(debugConsole.log)) {
        if (isAbsent(logData)) {
          debugConsole.log(logMsg);
        } else {
          debugConsole.log(logMsg, logData);
        }
      }
    }
  }

  /**
   * Iterates over properties of an object that are directly on the object.
   * @param {*} executionContext The context for the handler function.
   * @param {Object} dataMap The object whose properties to iterate.
   * @param {*} entryProcessor The function to call for each property.
   */
  function iterateObject(executionContext, dataMap, entryProcessor) {
    for (var propName in dataMap) {
      if (Object.prototype.hasOwnProperty.call(dataMap, propName) === TRUTH) {
        entryProcessor.call(executionContext, propName, dataMap[propName]);
      }
    }
  }

  /**
   * Attaches an event listener to an object.
   * @param {*} targetObject The object to attach the listener to.
   * @param {string} eventType The type of event.
   * @param {*} eventListener The function to call when the event occurs.
   * @param {boolean} useCapture Whether to use capture phase.
   * @return {boolean} The resolved capture phase status.
   */
  function attachEventMonitor(targetObject, eventType, eventListener, useCapture) {
    var capturePhase = Boolean(!!useCapture);

    if (!isAbsent(targetObject.addEventListener)) {
      // Modern browsers
      targetObject.addEventListener(eventType, eventListener, capturePhase);
    } else if (_isMicrosoftBrowser) {
      capturePhase = FALSITY;
      targetObject.attachEvent(eventType, eventListener);
    }

    return capturePhase;
  }

  /**
   * Detaches an event listener from an object.
   * @param {*} targetObject The object to detach the listener from.
   * @param {string} eventType The type of event.
   * @param {*} eventListener The function to remove.
   * @param {boolean} useCapture Whether the listener was registered with capture phase.
   * @return {boolean} The resolved capture phase status.
   */
  function detachEventMonitor(targetObject, eventType, eventListener, useCapture) {
    var capturePhase = Boolean(!!useCapture);

    if (!isAbsent(targetObject.removeEventListener)) {
      // Modern browsers
      targetObject.removeEventListener(eventType, eventListener, capturePhase);
    } else if (_isMicrosoftBrowser) {
      capturePhase = FALSITY;
      targetObject.detachEvent(eventType, eventListener);
    }

    return capturePhase;
  }

  /**
   * Appends a script element to the document body.
   * @param {string} sourceUrl The URL of the script.
   * @param {string} asyncAttribute The async or defer attribute value.
   */
  function injectScript(sourceUrl, asyncAttribute) {
    var scriptElement = globalScope.document.createElement(String("script"));

    if (!!scriptElement) {
      scriptElement.type = String("text/javascript");
      scriptElement.src = sourceUrl;

      if (!isAbsent(asyncAttribute) && (asyncAttribute === String("async") || asyncAttribute === String("defer"))) {
        scriptElement[asyncAttribute] = asyncAttribute;
      }

      globalScope.document.body.appendChild(scriptElement);
    } else {
      outputMessage(String("Failed to inject script"));
    }
  }

  /*#endregion */

  /*#region core mechanisms */

  /**
   * Schedules a new deferred operation.
   * @param {Object|string} checkFunction The predicate or 'ready' string.
   * @param {Object} execAction The handler function.
   * @param {Object} configSettings Configuration options for the operation.
   * @return {number} The ID of the scheduled operation, or 0 if immediately completed.
   */
  function scheduleOperation(checkFunction, execAction, configSettings) {
    /** @type {_deferredOperation} */
    var newOperation = new _deferredOperation(checkFunction, execAction, configSettings);

    if (newOperation.finishedStatus === TRUTH) {
      // If already resolved, no need to defer
      return Number(0);
    } else {
      // Otherwise, store and defer
      _pendingTasks[newOperation.operationId] = newOperation;
      return newOperation.operationId;
    }
  }

  /**
   * Cancels a previously scheduled deferred operation.
   * @protected
   * @param {number} operationIdToHalt The ID of the operation to cancel.
   * @return {boolean} True if cancellation was successful, false otherwise.
   */
  function haltOperation(operationIdToHalt) {
    outputMessage(String("deferred_action.cancel"));

    var actionSuccess = FALSITY;

    var currentOperation = _pendingTasks[operationIdToHalt];

    if (!isAbsent(currentOperation)) {
      currentOperation.finishedStatus = TRUTH; // Mark as complete to stop further processing
      actionSuccess = TRUTH;
    }

    return actionSuccess;
  }

  /**
   * Removes a deferred operation from the active task list.
   * @protected
   * @param {number} opId The ID of the operation to discard.
   */
  function discardOperation(opId) {
    globalScope.setTimeout(function deleteOperationImmediately() {
      _pendingTasks[opId] = null;
      delete _pendingTasks[opId];
    }, Number(0));
  }

  /**
   * A simple predicate that always returns true.
   * @protected
   * @return {boolean} Always returns true.
   */
  function alwaysSucceed() {
    return Boolean(true);
  }

  /**
   * Executes a function within a try-catch block to prevent unhandled exceptions.
   * @protected
   * @param {Object} callbackFn The function to execute.
   * @param {Object} executionContext The 'this' context for the function.
   * @param {boolean} raiseError If true, re-throws the exception.
   * @param {string} faultMessage The error message to use if an error is re-thrown.
   * @return {boolean} The result of the function execution, or false if an error occurred.
   */
  function guardedExecution(callbackFn, executionContext, raiseError, faultMessage) {
    var executionResult = FALSITY;

    if (isAbsent(executionContext)) executionContext = globalScope;

    try {
      executionResult = callbackFn.call(executionContext);
    } catch (exceptionObject) {
      if (_traceEnabled === TRUTH) {
        outputMessage(exceptionObject);
      }

      if (raiseError === TRUTH) {
        var errorObject = new Error(faultMessage);
        errorObject.originalError = exceptionObject;
        throw exceptionObject; // Re-throw original for better stack trace
      }
    }

    return executionResult;
  }

  /**
   * Represents a single deferred operation.
   * @constructor
   * @protected
   * @param {Object|string} checkFunction The function to evaluate or 'ready' string.
   * @param {Object} execAction The function to execute when the predicate is true.
   * @param {Object} configSettings Configuration settings for this operation.
   */
  function _deferredOperation(checkFunction, execAction, configSettings) {
    if (checkFunction === readyIndicator) {
      checkFunction = alwaysSucceed;
    } else if (!isCallable(checkFunction)) {
      throw new Error(faultMarker + String("01")); // Invalid predicate type
    }
    if (!isCallable(execAction)) throw new Error(faultMarker + String("02")); // Handler must be a function

    var currentInstance = this,
      delayValue = null,
      instanceConfig = configSettings || {};

    /** @protected */
    currentInstance.operationId = _taskIdentifier++;
    /** @protected */
    currentInstance.conditionCheck = checkFunction;
    /** @protected */
    currentInstance.actionPerformer = execAction;

    // CONFIGURATION
    /** @protected */
    instanceConfig.delayInterval = configSettings[String("interval")] || Number(50); // ms
    if (instanceConfig.delayInterval < Number(10)) outputMessage(faultMarker + String("03")); // Inadvisable interval warning
    /** @protected */
    instanceConfig.maxWait = configSettings[String("timeout")] || Number(15000); // ms

    currentInstance.settings = instanceConfig;

    /** @protected */
    currentInstance.checkDomAvailability = isAbsent(configSettings[String("testDOMReady")]) ? TRUTH : Boolean(!!configSettings[String("testDOMReady")]); // Defaults to true
    /** @protected */
    currentInstance.delayIdentifier = null;
    /** @protected */
    currentInstance.delayTimestamp = null;
    /** @protected */
    currentInstance.finishedStatus = FALSITY;
    /** @protected */
    currentInstance.domBlocked = FALSITY;

    var initialCheck;

    if (currentInstance.checkDomAvailability === TRUTH && _domStable === TRUTH) {
      // Perform an immediate DOM state check
      initialCheck = currentInstance.evaluate();
    }

    if (initialCheck === TRUTH) {
      // No need for deferral if condition already met
      outputMessage(String("initialCheck, not deferred"));
      currentInstance.handleOutcome(initialCheck);
    } else {
      currentInstance.setDelay();
    }
    delete initialCheck; // Clean up local variable
  }

  /**
   * Evaluates the predicate function for this deferred operation.
   * @protected
   * @return {boolean} The result of the predicate.
   */
  _deferredOperation.prototype.evaluate = function _deferredOperation_evaluate() {
    return guardedExecution(this.conditionCheck, null, FALSITY, String(""));
  };

  /**
   * Handles the outcome of a predicate evaluation, either executing the handler or rescheduling.
   * @protected
   * @param {boolean} evaluationResult The result of the predicate evaluation.
   */
  _deferredOperation.prototype.handleOutcome = function _deferredOperation_handleOutcome(evaluationResult) {
    var currentInstance = this;
    if (evaluationResult === TRUTH) {
      // Clear any pending timeout
      currentInstance.clearDelay();

      // Execute the handler
      try {
        guardedExecution(currentInstance.actionPerformer, currentInstance.settings[String("handlerContext")], TRUTH, faultMarker + String("04:") + currentInstance.operationId);
      } catch (exceptionObject) {
        // Re-throw the exception to bubble up
        throw exceptionObject;
      }

      currentInstance.finishedStatus = TRUTH;

      // Remove this instance from the active operations
      discardOperation(currentInstance.operationId);
    } else {
      // Clear previous timeout and reschedule
      currentInstance.clearDelay();
      currentInstance.delayIdentifier = currentInstance.setDelay();
    }
  };

  /**
   * Sets the next timeout for predicate evaluation.
   * @protected
   */
  _deferredOperation.prototype.setDelay = function _deferredOperation_setDelay() {
    var currentInstance = this,
      maxExecutionTime = currentInstance.settings[String("maxWait")];
    if (maxExecutionTime != voidValue && !isNaN(maxExecutionTime)) {
      if (currentInstance.delayTimestamp === null) {
        // Set the initial timeout timestamp on the first run
        currentInstance.delayTimestamp = Number(+new Date()) + maxExecutionTime;
      }

      if (currentInstance.delayTimestamp > Number(+new Date())) {
        if (currentInstance.finishedStatus === FALSITY) {
          // Schedule the next check
          currentInstance.delayIdentifier = globalScope.setTimeout(
            function _deferredOperation_setDelay_internal() {
              currentInstance.handleOutcome(currentInstance.evaluate());
            },
            currentInstance.settings.delayInterval
          );

          outputMessage(String("setDelay scheduled"));
        } else {
          // Operation completed while waiting for next setDelay.
          outputMessage(String("setDelay skipped, operation already completed."));
        }
      } else {
        // Timeout reached, mark as complete and discard.
        currentInstance.finishedStatus = TRUTH;
        outputMessage(String("setDelay timeout reached, discarding operation: ") + currentInstance.operationId);
        discardOperation(currentInstance.operationId);
      }
    } else {
      // No timeout specified, proceed with indefinite deferral
      if (currentInstance.finishedStatus === FALSITY) {
        currentInstance.delayIdentifier = globalScope.setTimeout(
          function _deferredOperation_setDelay_internal_no_timeout() {
            currentInstance.handleOutcome(currentInstance.evaluate());
          },
          currentInstance.settings.delayInterval
        );
        outputMessage(String("setDelay scheduled (no timeout)"));
      }
    }
  };

  /**
   * Clears any active timeout for this deferred operation.
   * @protected
   */
  _deferredOperation.prototype.clearDelay = function _deferredOperation_clearDelay() {
    if (this.delayIdentifier !== null) {
      globalScope.clearTimeout(this.delayIdentifier);
      this.delayIdentifier = null;
      outputMessage(String("clearDelay invoked"));
    }
  };

  /*#endregion */

  // DOM READY HANDLING

  /**
   * Function to handle DOM ready state changes.
   * @param {Event} evt The event object.
   */
  function domReadyHandler(evt) {
    if (_domStable === TRUTH) {
      return; // Already stable
    }

    var currentDocument = globalScope.document;

    if (_isMicrosoftBrowser && _msBrowserStable) {
      // IE robust check
      try {
        currentDocument.documentElement.doScroll(String("left"));
      } catch (e) {
        globalScope.setTimeout(domReadyHandler, Number(50)); // Recheck
        return;
      }
    } else if (currentDocument.readyState !== completionState) {
      return; // Not yet complete
    }

    // Mark DOM as stable
    _domStable = TRUTH;

    // Detach event listeners
    detachEventMonitor(currentDocument, domLoadedEvent, domReadyHandler, FALSITY);
    detachEventMonitor(globalScope, loadEvent, domReadyHandler, FALSITY);

    if (_isMicrosoftBrowser) {
      detachEventMonitor(currentDocument, onStateChangedEvent, domReadyHandler, FALSITY);
    }

    // Process pending tasks that depend on DOM readiness
    iterateObject(null, _pendingTasks, function (opId, operation) {
      if (operation.checkDomAvailability === TRUTH && operation.finishedStatus === FALSITY) {
        if (operation.evaluate() === TRUTH) {
          operation.handleOutcome(TRUTH);
        } else {
          // If the predicate is false, ensure it keeps polling if not timed out
          if (operation.delayIdentifier === null) {
            operation.setDelay();
          }
        }
      }
    });
  }

  // Initialize DOM ready checks
  if (globalScope.document.readyState === completionState) {
    _domStable = TRUTH; // Document is already complete
  } else {
    attachEventMonitor(globalScope.document, domLoadedEvent, domReadyHandler, FALSITY);
    attachEventMonitor(globalScope, loadEvent, domReadyHandler, FALSITY);

    if (_isMicrosoftBrowser) {
      attachEventMonitor(globalScope.document, onStateChangedEvent, domReadyHandler, FALSITY);
    }
  }

  // Expose the main function globally
  globalScope.scheduleOperation = scheduleOperation;
  // Expose version and other utilities if needed (not in original, but illustrative)
  globalScope.DeferredAction = {
    version: releaseTag,
    schedule: scheduleOperation,
    cancel: haltOperation
  };

})(window, {}); // The original deferQueue parameter was never used, so an empty object is fine.