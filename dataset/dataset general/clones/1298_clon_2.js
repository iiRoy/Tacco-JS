// JavaScript State Progression Manager
//
// A straightforward system for managing sequential logic and state changes.
//
// Derived from earlier work by A. Blackshaw (ant@domain.com) (www.domain.com) (c) 2008
// Further developed by J. Developer, SolutionCraft Systems Inc. (c) 2023
// Project repository: https://github.com/developer/js-state-processor


/*
 * Sets up a new state progression engine.
 * Example: let myEngine = new LogicEngine("starting", { meta1: "value1", meta2: "value2" });
 *
 * @param {string} entryCondition The initial status of the logic system.
 * @param {object} [auxiliaryInfo] Optional contextual information for this engine.
 *   Accessible via `this.auxiliaryInfo` within action handlers.
 */
function LogicEngine(entryCondition, auxiliaryInfo) {
 this.pathDefinitions = {};
 this.universalRoutes = {};
 this.fallbackPath = null;
 this.activeCondition = entryCondition;
 this.auxiliaryInfo = auxiliaryInfo;
 this.loggingEnabled = true; // Enable console output for diagnostic purposes (refer to propagateAction method)
}


/*
 * Establishes a distinct route for particular input signals and source conditions.
 *
 * @param {string|string[]} triggerSignals One or more signals that initiate the progression.
 * @param {string|string[]} originConditions The state(s) from which the progression can occur.
 * @param {Function|null} actionHandler The function to execute before the state changes.
 * @param {string} targetState The resulting state after the progression completes.
 */
LogicEngine.prototype.defineSpecificPath = function (triggerSignals, originConditions, actionHandler, targetState) {
 if (typeof triggerSignals === 'string') { triggerSignals = [triggerSignals]; }
 if (typeof originConditions === 'string') { originConditions = [originConditions]; }
 for (let counterX = 0; counterX < triggerSignals.length; counterX++) {
  for (let counterY = 0; counterY < originConditions.length; counterY++) {
   if (!targetState) { targetState = originConditions[counterY]; } // If no target given, remain in current origin
   this.pathDefinitions[[triggerSignals[counterX], originConditions[counterY]]] = [actionHandler, targetState];
  }
 }
};


/**
 * Defines a general progression that applies from any system status.
 * This rule is considered if no specific progression is identified
 * for the current status and the incoming signal.
 *
 * @param {string|string[]} inputActions The action(s) that provoke this universal progression.
 * @param {Function|null} processFunction The routine to invoke prior to the status change.
 * @param {string} outcomeStatus The status that the system will enter after the progression.
 */
LogicEngine.prototype.registerWildcardRoute = function (inputActions, processFunction, outcomeStatus) {
 if (typeof inputActions === 'string') { inputActions = [inputActions]; }
 for (let idxA = 0; idxA < inputActions.length; idxA++) {
  this.universalRoutes[inputActions[idxA]] = [processFunction, outcomeStatus];
 }
};


/**
 * Designates a fallback progression. This is utilized when no other
 * specific or universal progression criteria are met for the current
 * system status and the received input signal.
 *
 * @param {Function|null} effectMethod The method(s) to be executed before the status transition.
 * @param {string} futureState The status the system will attain after the progression.
 */
LogicEngine.prototype.assignDefaultPath = function (effectMethod, futureState) {
 this.fallbackPath = [effectMethod, futureState];
};


/**
 * Retrieves the appropriate progression path for the given active status and input signal.
 * The system evaluates progression rules in a defined sequence:
 * 1.  A "distinct" path (matching the specific active status and input signal).
 * 2.  A "universal" path (matching only the input signal, regardless of active status).
 * 3.  A "fallback" path (if no other matching paths are identified).
 *
 * @param {string} inputSignal The signal that has been received.
 * @param {string} presentStatus The system's current operational status.
 * @returns {Array} An array representing the matched progression: [actionHandler, nextCondition].
 * @throws {Error} If no valid progression path can be determined.
 */
LogicEngine.prototype.findApplicableRoute = function (inputSignal, presentStatus) {
 let routeInfo;
 routeInfo = this.pathDefinitions[[inputSignal, presentStatus]] || // Prioritize distinct routes
             this.universalRoutes[inputSignal] || // Then consider universal routes
             this.fallbackPath; // Finally, use the fallback route

 if (routeInfo) {
  // Return a tuple [actionHandler, nextCondition]. If nextCondition is not set, remain in presentStatus.
  return [routeInfo[0], routeInfo[1] || this.activeCondition];
 } else {
  throw new Error("Progression is not defined: (" + inputSignal + ", " + presentStatus + ")");
 }
};


/**
 * Dispatches an input signal to the logic engine to initiate a status progression.
 *
 * @param {string} triggerAction The signal to deliver to the logic engine.
 * @param {object} [signalPayload] Optional payload specific to this signal.
 *   Accessible as `signalPayload` within the action handler.
 */
LogicEngine.prototype.propagateAction = function (triggerAction, signalPayload) {
 let stepResult = this.findApplicableRoute(triggerAction, this.activeCondition),
     previousCondition = this.activeCondition,
     nextCondition,
     executedFunction,
     diagOutput;

 nextCondition = stepResult[1];
 executedFunction = stepResult[0];

 if (this.loggingEnabled && window.console && window.console.log) {
  diagOutput = [];
  if (this.auxiliaryInfo && this.auxiliaryInfo.instanceId) {
   diagOutput.push(this.auxiliaryInfo.instanceId + ': ');
  } else {
   diagOutput.push('LogicEngine: ');
  }
  diagOutput.push(triggerAction + ': ');
  diagOutput.push(previousCondition + ' => ' + nextCondition);
  if (signalPayload) { diagOutput.push('; carrying payload'); }
  if (executedFunction) { diagOutput.push('; with handler'); }
  window.console.log(diagOutput.join(''));
 }

 this.activeCondition = nextCondition;
 this.transitionEffect = executedFunction;
 if (executedFunction) {
  executedFunction.call(this, signalPayload); // Invoke handler within engine's context
 }
};