// Workflow Orchestration Engine (WOE)
//
// A flexible engine for managing sequential processes and state transitions.
// This implementation is based on a JavaScript finite state machine pattern.
//
// Derived from:
// https://github.com/jhund/js-finite-state-machine
// Copyright (c)2011 Jo Hund, ClearCove Software Inc.
// Original FSM concept by Anthony Blackshaw <ant@getme.co.uk> (www.getme.co.uk) Copyright (c)2008


// Establishes a new workflow orchestrator instance.
//
// @param {string} startingPoint - The initial operational phase of the orchestrator.
// @param {object} [contextualPayload={}] - Auxiliary data relevant to this orchestrator instance.
//   Accessible as `this.contextualPayload` within action handlers.
function ProcessOrchestrator(startingPoint, contextualPayload) {
    // Input validation for the initial phase.
    if (typeof startingPoint !== 'string' || startingPoint.trim() === '') {
        throw new Error("Initialization error: Initial phase must be a non-empty string.");
    }

    // Internal storage for phase-specific transition definitions.
    // Structure: { signalType: { currentPhase: [actionHandler, nextPhase] } }
    this.phaseSpecificPathways = {};

    // Internal storage for global, event-triggered transitions applicable from any phase.
    // Structure: { signalType: [actionHandler, nextPhase] }
    this.anyPhasePathways = {};

    // The universal fallback transition definition. Applied if no other specific or global
    // pathway matches a dispatched signal.
    // Structure: [actionHandler, nextPhase]
    this.universalFallback = null;

    // Collection of handler functions executed upon entering a specific phase.
    // Structure: { phaseName: handlerFunction }
    this.onPhaseEntryHandlers = {};

    // Collection of handler functions executed upon exiting a specific phase.
    // Structure: { phaseName: handlerFunction }
    this.onPhaseExitHandlers = {};

    // The current operational phase of this orchestrator instance.
    this.currentOperationalPhase = startingPoint;

    // Supplemental data associated with this orchestrator, often used in handlers.
    this.contextualPayload = contextualPayload || {};

    // Flag to control detailed console output for diagnostic purposes.
    this.enableDiagnosticLogging = true;

    // Private utility method for consistent logging.
    this._logDiagnostic = function(message) {
        if (this.enableDiagnosticLogging && typeof console !== 'undefined' && console.log) {
            const instanceIdentifier = this.contextualPayload.identifier || 'Unnamed Instance';
            console.log(`WOE [${instanceIdentifier}]: ${message}`);
        }
    };
}


// Registers a specific transition pathway, valid only for particular signals and origin phases.
//
// @param {string|Array<string>} triggerSignals - One or more signals that can initiate this pathway.
// @param {string|Array<string>} originPhases - One or more phases from which this pathway is valid.
// @param {Function|null} actionHandler - An optional function to execute before the phase change.
//   Receives `signalPayload` as its sole argument. `this` context is the orchestrator instance.
// @param {string} [destinationPhase] - The target phase after the transition. If omitted,
//   the orchestrator remains in the `originPhase`.
ProcessOrchestrator.prototype.registerPathway = function(triggerSignals, originPhases, actionHandler, destinationPhase) {
    const signalList = Array.isArray(triggerSignals) ? triggerSignals : [triggerSignals];
    const phaseList = Array.isArray(originPhases) ? originPhases : [originPhases];

    // Validate the action handler.
    if (actionHandler !== null && typeof actionHandler !== 'function') {
        throw new Error("Pathway registration error: Action handler must be a function or null.");
    }
    // Validate the destination phase if provided.
    if (destinationPhase !== undefined && typeof destinationPhase !== 'string') {
        throw new Error("Pathway registration error: Destination phase must be a string or undefined.");
    }

    for (const currentSignal of signalList) {
        if (typeof currentSignal !== 'string' || currentSignal.trim() === '') {
            this._logDiagnostic(`Warning: Skipping pathway registration due to invalid signal: '${currentSignal}'.`);
            continue;
        }
        // Initialize nested object for signals if it doesn't exist.
        if (!this.phaseSpecificPathways[currentSignal]) {
            this.phaseSpecificPathways[currentSignal] = {};
        }
        for (const currentPhase of phaseList) {
            if (typeof currentPhase !== 'string' || currentPhase.trim() === '') {
                this._logDiagnostic(`Warning: Skipping pathway registration due to invalid phase: '${currentPhase}'.`);
                continue;
            }
            // If no explicit destination is given, the orchestrator stays in the current phase.
            const resolvedDestination = destinationPhase || currentPhase;
            this.phaseSpecificPathways[currentSignal][currentPhase] = [actionHandler, resolvedDestination];
        }
    }
    this._logDiagnostic(`Registered specific pathway(s) for signals: ${signalList.join(', ')} from phases: ${phaseList.join(', ')}.`);
};


// Defines a global transition pathway that applies irrespective of the current phase.
// This pathway is considered if no specific phase-event pathway is found.
//
// @param {string|Array<string>} triggerSignals - One or more signals that can initiate this global pathway.
// @param {Function|null} actionHandler - An optional function to execute before the phase change.
// @param {string} destinationPhase - The target phase after the transition. This is mandatory for global pathways.
ProcessOrchestrator.prototype.registerGlobalPathway = function(triggerSignals, actionHandler, destinationPhase) {
    const signalList = Array.isArray(triggerSignals) ? triggerSignals : [triggerSignals];

    if (actionHandler !== null && typeof actionHandler !== 'function') {
        throw new Error("Global pathway registration error: Action handler must be a function or null.");
    }
    if (typeof destinationPhase !== 'string' || destinationPhase.trim() === '') {
        throw new Error("Global pathway registration error: Destination phase is mandatory and must be a non-empty string.");
    }

    for (const currentSignal of signalList) {
        if (typeof currentSignal !== 'string' || currentSignal.trim() === '') {
            this._logDiagnostic(`Warning: Skipping global pathway registration due to invalid signal: '${currentSignal}'.`);
            continue;
        }
        this.anyPhasePathways[currentSignal] = [actionHandler, destinationPhase];
    }
    this._logDiagnostic(`Registered global pathway(s) for signals: ${signalList.join(', ')}.`);
};


// Establishes a universal fallback pathway. This pathway is utilized if no other
// specific or global pathways match the dispatched signal.
//
// @param {Function|null} actionHandler - An optional function to execute before the phase change.
// @param {string} destinationPhase - The target phase after the transition. This is mandatory.
ProcessOrchestrator.prototype.setUniversalFallbackPathway = function(actionHandler, destinationPhase) {
    if (actionHandler !== null && typeof actionHandler !== 'function') {
        throw new Error("Fallback pathway registration error: Action handler must be a function or null.");
    }
    if (typeof destinationPhase !== 'string' || destinationPhase.trim() === '') {
        throw new Error("Fallback pathway registration error: Destination phase is mandatory and must be a non-empty string.");
    }
    this.universalFallback = [actionHandler, destinationPhase];
    this._logDiagnostic(`Set universal fallback pathway to phase: '${destinationPhase}'.`);
};


// Retrieves the appropriate transition pathway based on the current phase and incoming signal.
// The pathway resolution hierarchy is:
// 1. Specific pathway (matching signal and current phase)
// 2. Global pathway (matching signal, applicable from any phase)
// 3. Universal fallback pathway (if defined)
//
// @param {string} incomingSignal - The signal being processed.
// @param {string} currentPhase - The orchestrator's current operational phase.
// @returns {Array} A tuple `[actionHandler, nextPhase]`.
// @throws {Error} If no matching pathway can be resolved.
ProcessOrchestrator.prototype.determinePathway = function(incomingSignal, currentPhase) {
    // Pre-check for valid input parameters.
    if (typeof incomingSignal !== 'string' || incomingSignal.trim() === '') {
        throw new Error("Pathway determination error: Incoming signal must be a non-empty string.");
    }
    if (typeof currentPhase !== 'string' || currentPhase.trim() === '') {
        throw new Error("Pathway determination error: Current phase must be a non-empty string.");
    }

    let resolvedPath = null;

    // Attempt 1: Look for a phase-specific pathway.
    const phaseSpecificRules = this.phaseSpecificPathways[incomingSignal];
    if (phaseSpecificRules && phaseSpecificRules[currentPhase]) {
        resolvedPath = phaseSpecificRules[currentPhase];
    }

    // Attempt 2: If no specific pathway, check for a global pathway.
    if (!resolvedPath) {
        resolvedPath = this.anyPhasePathways[incomingSignal];
    }

    // Attempt 3: If still no pathway, use the universal fallback.
    if (!resolvedPath) {
        resolvedPath = this.universalFallback;
    }

    if (resolvedPath) {
        // For pathways where `nextPhase` might be optional (e.g., specific pathways),
        // default to staying in the `currentPhase` if not explicitly defined.
        // Global and fallback pathways are enforced to have a `destinationPhase` during registration.
        const effectiveNextPhase = resolvedPath[1] || currentPhase;
        return [resolvedPath[0], effectiveNextPhase];
    } else {
        // If no pathway was found after all attempts, throw an error.
        throw new Error(`Pathway determination error: No transition defined for signal '${incomingSignal}' in phase '${currentPhase}'.`);
    }
};


// Dispatches a signal to the orchestrator, potentially triggering a phase transition.
// This method orchestrates the sequence of exit handlers, pathway actions, and entry handlers.
//
// @param {string} signalType - The type of signal to send.
// @param {object} [signalPayload] - Optional data associated with this signal,
//   passed as an argument to the action handler.
ProcessOrchestrator.prototype.dispatchSignal = function(signalType, signalPayload) {
    // Basic validation for the signal type.
    if (typeof signalType !== 'string' || signalType.trim() === '') {
        this._logDiagnostic("Error: Attempted to dispatch an invalid or empty signal type. Operation aborted.");
        return; // Halt execution for invalid signals.
    }

    const previousPhase = this.currentOperationalPhase;
    let nextPhaseCandidate;
    let pathwayHandler;

    try {
        // Resolve the correct pathway based on the signal and current phase.
        const pathwayTuple = this.determinePathway(signalType, previousPhase);
        pathwayHandler = pathwayTuple[0]; // The action handler function.
        nextPhaseCandidate = pathwayTuple[1]; // The determined next phase.
    } catch (err) {
        this._logDiagnostic(`Dispatch failure for signal '${signalType}' from phase '${previousPhase}': ${err.message}`);
        throw err; // Re-throw the error if no pathway could be found.
    }

    // Step 1: Execute the 'onPhaseExit' handler for the *current* phase, if registered.
    if (this.onPhaseExitHandlers[previousPhase]) {
        this._logDiagnostic(`Executing exit handler for phase: '${previousPhase}'`);
        this.onPhaseExitHandlers[previousPhase].call(this, signalType, signalPayload, nextPhaseCandidate);
    }

    // Log the impending phase transition for diagnostic purposes.
    let diagnosticMessage = `Signal '${signalType}' from '${previousPhase}' -> '${nextPhaseCandidate}'`;
    if (signalPayload) { diagnosticMessage += ' (with payload)'; }
    if (pathwayHandler) { diagnosticMessage += ' (with action)'; }
    this._logDiagnostic(diagnosticMessage);

    // Step 2: Update the orchestrator's current operational phase.
    this.currentOperationalPhase = nextPhaseCandidate;

    // Step 3: Execute the action handler associated with the resolved pathway, if defined.
    if (pathwayHandler) {
        pathwayHandler.call(this, signalPayload); // 'this' context is the orchestrator instance.
    }

    // Step 4: Execute the 'onPhaseEntry' handler for the *new* phase, if registered.
    if (this.onPhaseEntryHandlers[this.currentOperationalPhase]) {
        this._logDiagnostic(`Executing entry handler for phase: '${this.currentOperationalPhase}'`);
        this.onPhaseEntryHandlers[this.currentOperationalPhase].call(this, signalType, signalPayload, previousPhase);
    }
};


// Registers a handler function to be executed whenever the orchestrator enters a specific phase.
// These handlers provide a hook for phase-specific setup or logging.
//
// @param {string} phaseName - The name of the phase to attach the entry handler to.
// @param {Function} handlerFunction - The function to execute. It receives (signalType, signalPayload, previousPhase).
ProcessOrchestrator.prototype.onPhaseEntry = function(phaseName, handlerFunction) {
    if (typeof phaseName !== 'string' || phaseName.trim() === '') {
        throw new Error("Entry handler registration error: Phase name must be a non-empty string.");
    }
    if (typeof handlerFunction !== 'function') {
        throw new Error("Entry handler registration error: Handler must be a function.");
    }
    this.onPhaseEntryHandlers[phaseName] = handlerFunction;
    this._logDiagnostic(`Registered entry handler for phase: '${phaseName}'.`);
};


// Registers a handler function to be executed whenever the orchestrator exits a specific phase.
// These handlers are useful for cleanup or final actions before a phase change.
//
// @param {string} phaseName - The name of the phase to attach the exit handler to.
// @param {Function} handlerFunction - The function to execute. It receives (signalType, signalPayload, nextPhase).
ProcessOrchestrator.prototype.onPhaseExit = function(phaseName, handlerFunction) {
    if (typeof phaseName !== 'string' || phaseName.trim() === '') {
        throw new Error("Exit handler registration error: Phase name must be a non-empty string.");
    }
    if (typeof handlerFunction !== 'function') {
        throw new Error("Exit handler registration error: Handler must be a function.");
    }
    this.onPhaseExitHandlers[phaseName] = handlerFunction;
    this._logDiagnostic(`Registered exit handler for phase: '${phaseName}'.`);
};


// Retrieves the current operational phase of the orchestrator.
//
// @returns {string} The name of the current phase.
ProcessOrchestrator.prototype.queryCurrentPhase = function() {
    return this.currentOperationalPhase;
};


// Resets the orchestrator to a new initial phase and optionally updates its contextual data.
// This effectively reinitializes the orchestrator's state without altering its defined pathways or handlers.
//
// @param {string} newStartingPoint - The new initial operational phase for the orchestrator.
// @param {object} [newContextualPayload={}] - Optional new auxiliary data to associate with the orchestrator.
ProcessOrchestrator.prototype.resetOrchestrator = function(newStartingPoint, newContextualPayload) {
    if (typeof newStartingPoint !== 'string' || newStartingPoint.trim() === '') {
        throw new Error("Orchestrator reset error: New starting point must be a non-empty string.");
    }
    this._logDiagnostic(`Resetting orchestrator from '${this.currentOperationalPhase}' to new starting phase '${newStartingPoint}'.`);
    this.currentOperationalPhase = newStartingPoint;
    this.contextualPayload = newContextualPayload || {};
    // Note: This reset only affects the current phase and contextual data.
    // Transition rules and entry/exit handlers remain as previously defined.
};