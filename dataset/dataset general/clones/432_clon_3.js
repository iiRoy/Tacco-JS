/*global jQuery */
/*!
 * KineticEngine.js 1.1.0
 *
 * Copyright 2023, Jane Doe
 * jane.doe@example.com
 * Released under the MIT license
 * https://opensource.org/licenses/MIT
 *
 */

(function(globalScope){
    // Private utility for logging messages based on the debug flag
    const logUtility = function(level, message, debugActive) {
        if (!debugActive) return;
        const timestamp = new Date().toISOString();
        if (console && console[level]) {
            console[level](`[KineticEngine] [${timestamp}] ${message}`);
        }
    };

    // Main KineticEngine constructor function
    globalScope.KineticEngine = function(runtimeSettings){
        let debugModeActive = false;
        // Initialize debugging based on provided runtime settings
        if(runtimeSettings && typeof runtimeSettings === 'object' && runtimeSettings !== null){
            debugModeActive = Object.prototype.hasOwnProperty.call(runtimeSettings, 'enableDebugging') ? !!runtimeSettings.enableDebugging : false;
        }

        // Internal data stores
        const globalRegistry = new Map(); // Stores global variables defined in the definition tree
        const eventDefinitions = new Map(); // Maps event names to their AnimationSequence instances
        const eventCompletionHandlers = new Map(); // Maps event names to their completion callbacks

        const selfRef = this; // Reference to the current instance of KineticEngine

        // Predefined keys for animation options
        const animationOptionKeys = ["duration", "easing", "delay", "completionCallback", "iterationCount"];

        /**
         * Computes a random numeric value within a specified range.
         * @param {number|string} lowerBound - The minimum value for the range.
         * @param {number|string} upperBound - The maximum value for the range.
         * @returns {number} A random number within the given range.
         */
        const computeRandomRangeValue = function(lowerBound, upperBound){
            const minVal = Number(lowerBound);
            const maxVal = Number(upperBound);

            // Ensure the first parameter is indeed smaller; swap if necessary
            if(maxVal <= minVal){
                selfRef.log("warn", `Random range input error: lower bound (${lowerBound}) must be less than upper bound (${upperBound}). Swapping values for continuity.`);
                return minVal + (minVal - maxVal) * Math.random(); // minVal is now the larger, maxVal the smaller
            }

            const difference = maxVal - minVal;
            return minVal + difference * Math.random();
        };

        /**
         * Retrieves an event definition object by its identifier.
         * @param {string} eventId - The unique identifier of the event.
         * @returns {AnimationSequence|undefined} The corresponding AnimationSequence object.
         */
        const retrieveEventDefinition = function(eventId){
            return eventDefinitions.get(eventId);
        };

        /**
         * Extracts the arithmetic modifier (e.g., '+=', '-=') from a string value.
         * @param {string} inputString - The string to analyze.
         * @returns {string} The modifier string or an empty string if none.
         */
        const extractValueModifier = function(inputString){
            if(inputString.startsWith('+=') || inputString.startsWith('-=')) {
                return inputString.substring(0, 2);
            }
            if(inputString.startsWith('-')) { // For negative numbers without operator
                return '-';
            }
            return "";
        };

        /**
         * Determines the unit suffix (e.g., 'px', '%') from a string value.
         * @param {string} inputString - The string to analyze.
         * @returns {string} The unit string or an empty string if none.
         */
        const determineValueUnits = function(inputString){
            if(inputString.endsWith(')px')) {
                return 'px';
            }
            if(inputString.endsWith('%')) {
                return '%';
            }
            return '';
        };

        /**
         * Parses a dynamic property name from a special string format (e.g., '(@params.myProp)px').
         * @param {string} dynamicString - The string containing the dynamic property reference.
         * @returns {string} The extracted property name.
         */
        const parseDynamicPropertyName = function(dynamicString){
            // This is a bit brittle, assumes specific formats like `@params.prop` or `(@params.prop)px`
            const match = dynamicString.match(/@(?:params|domel)\.([a-zA-Z0-9\-\_]+)/);
            if (match && match[1]) {
                return match[1];
            }
            selfRef.log("warn", `Could not parse dynamic property name from: ${dynamicString}`);
            return '';
        };

        /**
         * Central logging function for the KineticEngine instance.
         * @param {string} level - The log level (e.g., 'info', 'warn', 'error').
         * @param {string} message - The message to log.
         */
        this.log = function(level, message) {
            logUtility(level, message, debugModeActive);
        };

        /**
         * Initiates an animation sequence by triggering a defined event.
         * @param {string} eventId - The name of the event to trigger.
         * @param {object} [eventContext] - The original DOM event object or a custom context object.
         * @param {object} [overrideOptions] - Options to override default animation settings.
         * @param {function} [onSequenceComplete] - A callback function to execute when the sequence finishes.
         * @returns {ActiveSequenceController} An object to control the triggered sequence.
         */
        this.initiateSequence = function(eventId, eventContext, overrideOptions, onSequenceComplete){
            let inputIsValid = true;
            let sequenceController;

            // Validate eventId
            if(typeof eventId !== "string" || eventId.trim() === ""){
                selfRef.log("error", "The first argument for 'initiateSequence' must be a non-empty string representing the event identifier.");
                inputIsValid = false;
            }

            // Normalize arguments
            let actualEventContext = null;
            let actualOverrideOptions = {};
            let actualCompletionCallback = function(){};

            // Argument parsing logic
            const argCount = arguments.length;
            if (inputIsValid && argCount > 1) {
                if (typeof arguments[1] === "object" && arguments[1] !== null) {
                    if (arguments[1].target) { // Heuristic for a DOM event object
                        actualEventContext = arguments[1];
                        if (argCount > 2) {
                            if (typeof arguments[2] === "object" && arguments[2] !== null) {
                                actualOverrideOptions = arguments[2];
                                if (argCount > 3) {
                                    if (typeof arguments[3] === "function") {
                                        actualCompletionCallback = arguments[3];
                                    } else {
                                        selfRef.log("error", `Invalid 4th parameter for event '${eventId}'. Expected a function, got ${typeof arguments[3]}.`);
                                        inputIsValid = false;
                                    }
                                }
                            } else if (typeof arguments[2] === "function") {
                                actualCompletionCallback = arguments[2];
                            } else {
                                selfRef.log("error", `Invalid 3rd parameter for event '${eventId}'. Expected an object or function, got ${typeof arguments[2]}.`);
                                inputIsValid = false;
                            }
                        }
                    } else { // It's an options object
                        actualOverrideOptions = arguments[1];
                        if (argCount > 2) {
                            if (typeof arguments[2] === "function") {
                                actualCompletionCallback = arguments[2];
                            } else {
                                selfRef.log("error", `Invalid 3rd parameter for event '${eventId}'. Expected a function, got ${typeof arguments[2]}.`);
                                inputIsValid = false;
                            }
                        }
                    }
                } else if (typeof arguments[1] === "function") {
                    actualCompletionCallback = arguments[1];
                } else {
                    selfRef.log("error", `Invalid 2nd parameter for event '${eventId}'. Expected an object or function, got ${typeof arguments[1]}.`);
                    inputIsValid = false;
                }
            }

            if(inputIsValid){
                const registeredSequence = eventDefinitions.get(eventId);
                if(registeredSequence){
                    sequenceController = new ActiveSequenceController(registeredSequence);
                    registeredSequence.activate(actualEventContext, actualOverrideOptions, actualCompletionCallback);
                } else {
                    sequenceController = new ActiveSequenceController(null);
                    selfRef.log("error", `Event '${eventId}' is not defined in any processed definition files. It will be ignored.`);
                }
            } else {
                sequenceController = new ActiveSequenceController(null); // Return a non-functional controller on error
            }

            return sequenceController;
        };

        /**
         * Processes a hierarchical definition tree to register global variables and event sequences.
         * @param {object} definitionRoot - The root node of the definition tree.
         * @param {function} completionCallback - A callback to execute once processing is complete.
         */
        const processDefinitionTree = function(definitionRoot, completionCallback){
            const completionCallbackPattern = /^[a-zA-Z0-9\.\-\_]+\:completion$/;
            const globalVarPattern = /^@[a-zA-Z0-9\.\-\_]*?/;

            // Process global variable definitions
            if (definitionRoot.attributes) {
                for(const attrKey in definitionRoot.attributes){
                    if(Object.prototype.hasOwnProperty.call(definitionRoot.attributes, attrKey)){
                        if(["@index", "@params", "@domel"].includes(attrKey)){
                            selfRef.log("warn", `Reserved keyword '${attrKey}' cannot be used as a global variable name. This global will be ignored.`);
                            continue;
                        }
                        if(globalVarPattern.test(attrKey)){
                            globalRegistry.set(attrKey, definitionRoot.attributes[attrKey]);
                        } else {
                            selfRef.log("warn", `Property '${attrKey}' should start with '@' to be recognized as a global variable. It will be ignored.`);
                        }
                    }
                }
            }

            // Process event definitions and their nested tasks
            if (definitionRoot.children) {
                for(const childKey in definitionRoot.children){
                    if(Object.prototype.hasOwnProperty.call(definitionRoot.children, childKey)){
                        if(completionCallbackPattern.test(childKey)){
                            const eventIdentifier = childKey.split(":")[0];
                            eventCompletionHandlers.set(eventIdentifier, definitionRoot.children[childKey].attributes.eventName);
                            continue; // Skip to next child, this is a special handler
                        }

                        // Split the selector string into parts
                        const segmentParts = childKey.split(":");

                        // Validate the segment structure
                        if(segmentParts.length < 2){
                            selfRef.log("error", `Invalid MC selection and event part '${childKey}'. Expected at least a selection string and an event name separated by ':'.`);
                            continue; // Skip invalid segments
                        }

                        const eventName = segmentParts[segmentParts.length - 1];
                        let currentSequence = eventDefinitions.get(eventName);

                        if(!currentSequence){
                            let loopIterations = 1;
                            if(definitionRoot.children[childKey].attributes && Object.prototype.hasOwnProperty.call(definitionRoot.children[childKey].attributes, 'iterationCount')){
                                loopIterations = definitionRoot.children[childKey].attributes['iterationCount'];
                            }
                            currentSequence = new AnimationSequence(loopIterations, eventName);
                            eventDefinitions.set(eventName, currentSequence);
                        }
                        currentSequence.addExecutionTask(segmentParts, definitionRoot.children[childKey]);
                    }
                }
            } else {
                selfRef.log("info", "No children found in the definition root to process for events.");
            }

            completionCallback();
        };

        // Expose the compiler function
        this.processDefinition = processDefinitionTree;

        /**
         * Manages the lifecycle of an active animation sequence, allowing it to be stopped.
         * @param {AnimationSequence|null} controlledSequence - The sequence instance being controlled.
         */
        const ActiveSequenceController = function(controlledSequence){
            /**
             * Halts the execution of the controlled animation sequence.
             */
            this.haltExecution = function(){
                if(controlledSequence){
                    controlledSequence.terminate();
                } else {
                    selfRef.log("error", "Attempted to halt an execution process that was never successfully initiated.");
                }
            };
        };

        /**
         * Represents an individual animation task within an event sequence.
         * This object is responsible for selecting elements and creating their animation functions.
         * @param {string[]} selectionCriteria - Array of selectors for element selection.
         * @param {object} taskNode - The definition node for this task.
         * @param {AnimationSequence} parentSequence - The parent animation sequence.
         * @param {object} [inheritedProps] - Properties inherited from a parent task.
         * @param {string} [subScopeIdentifier] - An identifier for a sub-scope, if applicable.
         */
        const AnimationTask = function(selectionCriteria, taskNode, parentSequence, inheritedProps, subScopeIdentifier){
            this.iterationCount = 1; // Default iteration count for this task

            // Initialize inherited properties
            const currentInheritedProps = inheritedProps || {
                attributes:{},
                options:{}
            };
            const currentSubScopeIdentifier = subScopeIdentifier || '';

            // Generate a function to locate elements based on the criteria
            this.elementLocatorFn = this.generateElementSelector(selectionCriteria, currentSubScopeIdentifier);

            const globalReferencePattern = /^@globals\.[a-zA-Z0-9\-\_]*$/;

            // Deep clone inherited properties to avoid mutation
            const taskProperties = {
                attributes: {...currentInheritedProps.attributes},
                options: {...currentInheritedProps.options}
            };

            // Process attributes specific to this task node
            if (taskNode.attributes) {
                for(const propName in taskNode.attributes){
                    if(Object.prototype.hasOwnProperty.call(taskNode.attributes, propName)){
                        let propValue = taskNode.attributes[propName];

                        // Resolve global variable references
                        if(typeof propValue === 'string' && globalReferencePattern.test(propValue)){
                            const expectedGlobalKey = `@${propValue.split('.')[1].trim()}`;
                            if(!globalRegistry.has(expectedGlobalKey)){
                                selfRef.log("error", `Global variable '${propValue}' is not defined. It will be ignored.`);
                                propValue = undefined; // Mark for removal or default
                            } else {
                                propValue = globalRegistry.get(expectedGlobalKey);
                            }
                        }

                        if (propValue !== undefined) {
                            if(animationOptionKeys.includes(propName)){
                                if(propName === "iterationCount"){
                                    this.iterationCount = Number(propValue);
                                } else {
                                    taskProperties.options[propName] = propValue;
                                }
                            } else {
                                taskProperties.attributes[propName] = propValue;
                            }
                        }
                    }
                }
            }

            let taskCompletionCallback = function(){
                parentSequence.sequenceCompletionTracker.notifyTaskCompletion();
            };

            const nestedTaskKeys = Object.keys(taskNode.children || {});

            // Override sequence loop count if specified at task level
            if(taskNode.attributes && Object.prototype.hasOwnProperty.call(taskNode.attributes, 'iterationCount')){
                parentSequence.setLoopIterations(Number(taskNode.attributes.iterationCount));
            }

            // Process nested child tasks or special completion triggers
            for(let i=0; i<nestedTaskKeys.length; i++){
                const childTaskKey = nestedTaskKeys[i];

                if(childTaskKey === "completion:trigger"){
                    // This task triggers another event upon its completion
                    const triggeredEventName = taskNode.children[childTaskKey].attributes.eventName;
                    if (!triggeredEventName) {
                        selfRef.log("error", `Completion trigger defined without an 'eventName' attribute for task '${childTaskKey}'.`);
                        continue;
                    }
                    taskCompletionCallback = function(triggeringEvent, dynamicParams){
                        const finalCallback = function(){
                            parentSequence.sequenceCompletionTracker.notifyTaskCompletion();
                        };
                        const targetEvent = retrieveEventDefinition(triggeredEventName);
                        if (targetEvent) {
                            targetEvent.activate(triggeringEvent, dynamicParams, finalCallback);
                        } else {
                            selfRef.log("warn", `Completion trigger for event '${triggeredEventName}' failed: event not found.`);
                            finalCallback(); // Still notify parent completion
                        }
                    };
                } else if(childTaskKey !== "completion"){
                    // Add a regular nested animation task
                    parentSequence.addPreppedTask(new AnimationTask(this.elementLocatorFn, taskNode.children[childTaskKey], parentSequence, taskProperties, childTaskKey));
                } else {
                    // Handle a nested 'completion' sequence
                    let nestedLoopIterations = 1;
                    if(taskNode.children[childTaskKey].attributes && Object.prototype.hasOwnProperty.call(taskNode.children[childTaskKey].attributes, 'iterationCount')){
                        nestedLoopIterations = Number(taskNode.children[childTaskKey].attributes['iterationCount']);
                    }

                    const nestedSequence = new AnimationSequence(nestedLoopIterations);
                    nestedSequence.addPreppedTask(new AnimationTask(this.elementLocatorFn, taskNode.children.completion, nestedSequence, taskProperties));
                    taskCompletionCallback = function(triggeringEvent, dynamicParams){
                        const finalCallback = function(){
                            parentSequence.sequenceCompletionTracker.notifyTaskCompletion();
                        };
                        nestedSequence.activate(triggeringEvent, dynamicParams, finalCallback);
                    };
                }
            }

            // Create the actual animation function for this task
            this.buildAnimationExecutor(taskProperties, taskCompletionCallback);

            /**
             * Executes the animation function for this task.
             * @param {object} currentEventContext - The DOM event context.
             * @param {object} dynamicParams - Parameters passed to the animation.
             */
            this.execute = function(currentEventContext, dynamicParams){
                this.animationExecutor(currentEventContext, dynamicParams);
            };
        };

        /**
         * Builds the specific animation executor function for this task.
         * This function will be responsible for applying animations to selected elements.
         * @param {object} executionConfig - The combined properties and options for the animation.
         * @param {function} completionNotifier - Callback to signal task completion.
         */
        AnimationTask.prototype.buildAnimationExecutor = function(executionConfig, completionNotifier){
            const paramRefPattern = /^(@params\.[a-zA-Z0-9\-\_]*?)(?:%|px)?$|^([+\-]?=|[-])?(@params\.[a-zA-Z0-9\-\_]*?)(?:%|px)?$/;
            const domElemRefPattern = /^(@domel\.[a-zA-Z0-9\-\_]*?)(?:%|px)?$|^([+\-]?=|[-])?(@domel\.[a-zA-Z0-9\-\_]*?)(?:%|px)?$/;
            const randomValuePattern = /^([+\-]?=|[-])?@rand\( *?.+ *?, *?.+ *?\)(?:%|px)?$/;

            let durationMissingFlag = false;
            // Set default duration if not specified
            if(!executionConfig.options.hasOwnProperty("duration")){
                executionConfig.options.duration = '0.3s';
                durationMissingFlag = true;
            }

            this.animationExecutor = function(eventContext, dynamicParams){
                let hasDynamicParams = false;
                let hasRandomValues = false;

                // Stores references to properties that need dynamic resolution at runtime
                const dynamicParamRefs = [];
                const randomValueRefs = [];

                let totalAnimatedProperties = 0; // Counts properties that will trigger an animation

                const preAnimationSteps = []; // Functions to execute before animation starts

                /**
                 * Applies pre-animation actions (e.g., add/remove classes) to an element.
                 * @param {jQuery} targetElement - The jQuery-wrapped DOM element.
                 * @returns {jQuery} The element after applying actions.
                 */
                const applyPreAnimationSteps = function(targetElement){
                    for(let i=0; i<preAnimationSteps.length; i++){
                        preAnimationSteps[i](targetElement);
                    }
                    return targetElement;
                };

                // Process properties in 'attributes'
                for(const propKey in executionConfig.attributes){
                    if(Object.prototype.hasOwnProperty.call(executionConfig.attributes, propKey)){
                        let propValue = executionConfig.attributes[propKey];

                        // Special handling for class manipulations
                        if(propKey === '-.'){
                            const classNameToRemove = String(propValue);
                            preAnimationSteps.push(function(element){ element.removeClass(classNameToRemove); });
                            continue;
                        } else if(propKey === '+.') {
                            const classNameToAdd = String(propValue);
                            preAnimationSteps.push(function(element){ element.addClass(classNameToAdd); });
                            continue;
                        }

                        totalAnimatedProperties++;

                        // Resolve @params references
                        if(typeof propValue === 'string' && paramRefPattern.test(propValue)){
                            const actualPropName = parseDynamicPropertyName(propValue);
                            if(Object.prototype.hasOwnProperty.call(dynamicParams, actualPropName)){
                                executionConfig.attributes[propKey] = extractValueModifier(propValue) + dynamicParams[actualPropName] + determineValueUnits(propValue);
                            } else {
                                selfRef.log("error", `Parameter '${actualPropName}' expected in dynamicParams but not provided. Property '${propKey}' will be ignored.`);
                                delete executionConfig.attributes[propKey]; // Remove invalid property
                            }
                        }
                        // Store @domel references for runtime resolution
                        else if(typeof propValue === 'string' && domElemRefPattern.test(propValue)){
                            dynamicParamRefs.push({
                                modifier: extractValueModifier(propValue),
                                units: determineValueUnits(propValue),
                                part: 'attributes',
                                key: propKey,
                                sourceAttr: parseDynamicPropertyName(propValue)
                            });
                            hasDynamicParams = true;
                        }
                        // Store @rand references for runtime generation
                        else if(typeof propValue === 'string' && randomValuePattern.test(propValue)){
                            const rangeParts = propValue.match(/@rand\(([^,]+),([^)]+)\)/);
                            if (rangeParts && rangeParts.length === 3) {
                                randomValueRefs.push({
                                    modifier: extractValueModifier(propValue),
                                    units: determineValueUnits(propValue),
                                    part: 'attributes',
                                    key: propKey,
                                    range: [Number(rangeParts[1].trim()), Number(rangeParts[2].trim())]
                                });
                                hasRandomValues = true;
                            } else {
                                selfRef.log("error", `Invalid @rand format for property '${propKey}': ${propValue}. It will be ignored.`);
                                delete executionConfig.attributes[propKey];
                            }
                        }
                    }
                }

                // Process properties in 'options' (similar logic to 'attributes')
                for(const propKey in executionConfig.options){
                    if(Object.prototype.hasOwnProperty.call(executionConfig.options, propKey)){
                        let propValue = executionConfig.options[propKey];

                        if(typeof propValue === 'string' && paramRefPattern.test(propValue)){
                            const actualPropName = parseDynamicPropertyName(propValue);
                            if(Object.prototype.hasOwnProperty.call(dynamicParams, actualPropName)){
                                executionConfig.options[propKey] = extractValueModifier(propValue) + dynamicParams[actualPropName] + determineValueUnits(propValue);
                            } else {
                                selfRef.log("error", `Parameter '${actualPropName}' expected in dynamicParams but not provided. Option '${propKey}' will be ignored.`);
                                delete executionConfig.options[propKey];
                            }
                        }
                        else if(typeof propValue === 'string' && domElemRefPattern.test(propValue)){
                            dynamicParamRefs.push({
                                modifier: extractValueModifier(propValue),
                                units: determineValueUnits(propValue),
                                part: 'options',
                                key: propKey,
                                sourceAttr: parseDynamicPropertyName(propValue)
                            });
                            hasDynamicParams = true;
                        }
                        else if(typeof propValue === 'string' && randomValuePattern.test(propValue)){
                            const rangeParts = propValue.match(/@rand\(([^,]+),([^)]+)\)/);
                            if (rangeParts && rangeParts.length === 3) {
                                randomValueRefs.push({
                                    modifier: extractValueModifier(propValue),
                                    units: determineValueUnits(propValue),
                                    part: 'options',
                                    key: propKey,
                                    range: [Number(rangeParts[1].trim()), Number(rangeParts[2].trim())]
                                });
                                hasRandomValues = true;
                            } else {
                                selfRef.log("error", `Invalid @rand format for option '${propKey}': ${propValue}. It will be ignored.`);
                                delete executionConfig.options[propKey];
                            }
                        }
                    }
                }

                // If no attributes to animate, just run pre-actions and notify completion
                if(totalAnimatedProperties === 0 && preAnimationSteps.length === 0){
                    completionNotifier(eventContext, dynamicParams);
                    return true;
                } else if(durationMissingFlag){
                    selfRef.log("warn", "Animation duration was not explicitly defined for this task. Defaulting to '0.3s'.");
                }

                // Get the elements to animate
                const affectedElements = this.elementLocatorFn(eventContext, dynamicParams);

                if(!hasDynamicParams && !hasRandomValues){
                    // If no dynamic values, animate all elements uniformly
                    executionConfig.options.complete = function(){ completionNotifier(eventContext, dynamicParams); };
                    applyPreAnimationSteps(affectedElements).velocity(executionConfig.attributes, executionConfig.options);
                    selfRef.log("info", `Executing uniform animation on ${affectedElements.length} elements.`);
                    if(debugModeActive) {
                        selfRef.log("debug", `Uniform animation config: ${JSON.stringify(executionConfig.attributes)} with options ${JSON.stringify(executionConfig.options)}`);
                    }
                } else {
                    // If dynamic values are present, animate each element individually
                    const CompletionTracker = {
                        totalElements: affectedElements.length,
                        completedElements: 0,
                        finished: function(){
                            this.completedElements++;
                            if(this.completedElements === this.totalElements){
                                completionNotifier(eventContext, dynamicParams);
                            }
                        }
                    };

                    affectedElements.each(function(){
                        const element = jQuery(this);
                        // Deep clone configuration for each element to allow individual modifications
                        const elementSpecificConfig = {
                            attributes: {...executionConfig.attributes},
                            options: {...executionConfig.options}
                        };

                        // Resolve @domel references for the current element
                        for(let i=0; i<dynamicParamRefs.length; i++){
                            const ref = dynamicParamRefs[i];
                            const sourceValue = element.attr(ref.sourceAttr);
                            if (sourceValue !== undefined) {
                                elementSpecificConfig[ref.part][ref.key] = ref.modifier + sourceValue + ref.units;
                            } else {
                                selfRef.log("warn", `DOM element attribute '${ref.sourceAttr}' not found on element. Dynamic property '${ref.key}' ignored.`);
                                delete elementSpecificConfig[ref.part][ref.key]; // Remove if source attribute is missing
                            }
                        }
                        // Generate random values for the current element
                        for(let i=0; i<randomValueRefs.length; i++){
                            const ref = randomValueRefs[i];
                            elementSpecificConfig[ref.part][ref.key] = ref.modifier + computeRandomRangeValue(ref.range[0], ref.range[1]) + ref.units;
                        }

                        elementSpecificConfig.options.complete = function(){ CompletionTracker.finished(); };
                        applyPreAnimationSteps(element).velocity(elementSpecificConfig.attributes, elementSpecificConfig.options);
                        if(debugModeActive) {
                             selfRef.log("debug", `Individual animation for element: ${element.get(0).tagName}#${element.attr('id') || 'no-id'} with config ${JSON.stringify(elementSpecificConfig.attributes)} and options ${JSON.stringify(elementSpecificConfig.options)}`);
                        }
                    });
                }
            };
        };

        /**
         * Generates a function that selects DOM elements based on provided criteria.
         * @param {string[]} selectionSegments - An array of strings defining the selection logic.
         * @param {string} subScopeIdentifier - An additional identifier for scoping.
         * @returns {function(object, object): jQuery} A function that returns a jQuery collection of elements.
         */
        AnimationTask.prototype.generateElementSelector = function(selectionSegments, subScopeIdentifier){
            // Definitions for various selection rules
            const selectionRuleDefinitions = [
                {
                    name:'index greater than',
                    pattern: /^@index\ *?\>\ *?(\d+)$/,
                    createSelector: function(matchResult){
                        const indexValue = Number(matchResult[1]);
                        return function(){ return `:gt(${indexValue})`; };
                    }
                },
                {
                    name:'index less than',
                    pattern: /^@index\ *?\<\ *?(\d+)$/,
                    createSelector: function(matchResult){
                        const indexValue = Number(matchResult[1]);
                        return function(){ return `:lt(${indexValue})`; };
                    }
                },
                {
                    name:'index less or equal to',
                    pattern: /^@index\ *?\<\=\ *?(\d+)$/,
                    createSelector: function(matchResult){
                        const indexValue = Number(matchResult[1]);
                        return function(){ return `:lt(${indexValue + 1})`; }; // :lt(N+1) is equivalent to :le(N)
                    }
                },
                {
                    name:'index greater or equal to',
                    pattern: /^@index\ *?\>\=\ *?(\d+)$/,
                    createSelector: function(matchResult){
                        const indexValue = Number(matchResult[1]);
                        return function(){ return `:gt(${indexValue - 1})`; }; // :gt(N-1) is equivalent to :ge(N)
                    }
                },
                {
                    name:'index equals',
                    pattern: /^@index\ *?\=\ *?(\d+)$/,
                    createSelector: function(matchResult){
                        const indexValue = Number(matchResult[1]);
                        return function(){ return `:eq(${indexValue})`; };
                    }
                },
                {
                    name:'data attribute greater than',
                    pattern: /^@data-([a-zA-Z0-9\-\_]+)\ *?\>\ *?(.+)$/,
                    createSelector: function(matchResult){
                        const dataAttr = `data-${matchResult[1]}`;
                        const value = matchResult[2];
                        return function(element){
                            return element.filter(function(){ return Number(jQuery(this).attr(dataAttr)) > Number(value); });
                        };
                    }
                },
                {
                    name:'data attribute less than',
                    pattern: /^@data-([a-zA-Z0-9\-\_]+)\ *?\<\ *?(.+)$/,
                    createSelector: function(matchResult){
                        const dataAttr = `data-${matchResult[1]}`;
                        const value = matchResult[2];
                        return function(element){
                            return element.filter(function(){ return Number(jQuery(this).attr(dataAttr)) < Number(value); });
                        };
                    }
                },
                {
                    name:'data attribute equals',
                    pattern: /^@data-([a-zA-Z0-9\-\_]+)\ *?\=\ *?(.+)$/,
                    createSelector: function(matchResult){
                        const dataAttr = `data-${matchResult[1]}`;
                        const value = matchResult[2];
                        return function(element){
                            return element.filter(function(){ return jQuery(this).attr(dataAttr) === value; });
                        };
                    }
                }
            ];

            // The main selector string, usually the first segment
            const primarySelector = selectionSegments[0];
            const eventName = selectionSegments[selectionSegments.length - 1]; // The last segment is the event name

            let initialElementSetFn;

            // Determine the initial set of elements
            if(primarySelector === "triggeringElement"){
                initialElementSetFn = function(evtContext){
                    return evtContext && evtContext.target ? jQuery(evtContext.target) : jQuery();
                };
            } else if(primarySelector.startsWith("not(triggeringElement)")){
                initialElementSetFn = function(evtContext){
                    const allElements = jQuery(primarySelector.substring(4, primarySelector.length - 1)); // Extract selector inside not()
                    return evtContext && evtContext.target ? allElements.not(evtContext.target) : allElements;
                };
            } else {
                initialElementSetFn = function(){
                    return jQuery(primarySelector);
                };
            }

            // Prepare subsequent filter functions from other segments
            const filterFunctions = [];
            for(let i = 1; i < selectionSegments.length - 1; i++){ // Iterate through segments between primary selector and event name
                const currentSegment = selectionSegments[i];
                let matchedRule = false;

                for(const rule of selectionRuleDefinitions){
                    const match = currentSegment.match(rule.pattern);
                    if(match){
                        filterFunctions.push(rule.createSelector(match));
                        matchedRule = true;
                        break;
                    }
                }

                if(!matchedRule){
                    // If no special rule matched, assume it's a standard jQuery filter string
                    filterFunctions.push(function(elements){
                        return elements.filter(currentSegment);
                    });
                }
            }

            // Return the combined selection function
            return function(eventContext, dynamicParams){
                let selectedElements = initialElementSetFn(eventContext);

                // Apply all filter functions sequentially
                for(const filterFn of filterFunctions){
                    selectedElements = filterFn(selectedElements);
                }

                // If a sub-scope identifier is present, use it for 'find'
                if (currentSubScopeIdentifier) {
                    selectedElements = selectedElements.find(currentSubScopeIdentifier);
                }

                selfRef.log("debug", `Selector for event '${eventName}' yielded ${selectedElements.length} elements.`);
                return selectedElements;
            };
        };

        /**
         * Represents an entire animation sequence, potentially composed of multiple tasks.
         * @param {number} [totalIterations=1] - The number of times the sequence should loop.
         * @param {string} [sequenceId='anonymous'] - An identifier for this sequence.
         */
        const AnimationSequence = function(totalIterations = 1, sequenceId = 'anonymous'){
            let currentLoop = 0;
            let isRunning = false;
            let stopRequested = false;
            let completionCallback = function(){}; // Callback for the entire sequence

            const preppedTasks = []; // Tasks added before activation
            const readyTasks = []; // Tasks ready for execution after activation

            this.sequenceId = sequenceId;

            // Tracks completion of individual tasks within the sequence
            this.sequenceCompletionTracker = {
                pendingTasks: 0,
                completedTasks: 0,
                notifyTaskCompletion: function(){
                    this.completedTasks++;
                    if(this.completedTasks >= this.pendingTasks){
                        this.reset();
                        currentLoop++;
                        if(!stopRequested && currentLoop < totalIterations){
                            selfRef.log("info", `Sequence '${sequenceId}' completed loop ${currentLoop}/${totalIterations}. Starting next loop.`);
                            this.executeNextBatch(); // Start next loop
                        } else {
                            selfRef.log("info", `Sequence '${sequenceId}' finished all ${currentLoop} loops or was stopped.`);
                            isRunning = false;
                            stopRequested = false;
                            completionCallback(); // Trigger the overall sequence completion callback
                        }
                    }
                },
                executeNextBatch: function(){
                    this.pendingTasks = readyTasks.length;
                    this.completedTasks = 0;
                    if(this.pendingTasks === 0) { // Handle empty sequences immediately
                        this.notifyTaskCompletion();
                        return;
                    }
                    readyTasks.forEach(task => task.execute(this.eventContext, this.dynamicParams));
                },
                reset: function(){
                    this.pendingTasks = 0;
                    this.completedTasks = 0;
                    this.eventContext = null;
                    this.dynamicParams = null;
                },
                eventContext: null,
                dynamicParams: null
            };

            /**
             * Adds an animation task to the sequence's prepped tasks list.
             * @param {string[]} taskSegments - The selection segments for the task.
             * @param {object} taskDefinitionNode - The definition node for the task.
             */
            this.addExecutionTask = function(taskSegments, taskDefinitionNode){
                preppedTasks.push(new AnimationTask(taskSegments, taskDefinitionNode, this));
            };

            /**
             * Adds an already prepared AnimationTask instance to the sequence.
             * Used for nested tasks.
             * @param {AnimationTask} taskInstance - The prepared task instance.
             */
            this.addPreppedTask = function(taskInstance){
                preppedTasks.push(taskInstance);
            };

            /**
             * Sets the total number of iterations for this sequence.
             * @param {number} loops - The new total number of loops.
             */
            this.setLoopIterations = function(loops){
                totalIterations = Number(loops);
            };

            /**
             * Activates the animation sequence, starting its execution.
             * @param {object} eventContext - The original DOM event context.
             * @param {object} dynamicParams - Parameters to pass to animation tasks.
             * @param {function} finalCompletionCallback - Callback for overall sequence completion.
             */
            this.activate = function(eventContext, dynamicParams, finalCompletionCallback){
                if(isRunning){
                    selfRef.log("warn", `Sequence '${sequenceId}' is already running. Activation request ignored.`);
                    return;
                }
                isRunning = true;
                stopRequested = false;
                currentLoop = 0;
                completionCallback = finalCompletionCallback || function(){};

                // Clear and populate readyTasks for the current run
                readyTasks.length = 0;
                preppedTasks.forEach(task => readyTasks.push(task));

                this.sequenceCompletionTracker.eventContext = eventContext;
                this.sequenceCompletionTracker.dynamicParams = dynamicParams;

                selfRef.log("info", `Activating sequence '${sequenceId}' for ${totalIterations} iterations with ${readyTasks.length} tasks.`);
                this.sequenceCompletionTracker.executeNextBatch();
            };

            /**
             * Terminates the ongoing animation sequence prematurely.
             */
            this.terminate = function(){
                if(isRunning){
                    stopRequested = true;
                    selfRef.log("info", `Termination requested for sequence '${sequenceId}'. Current animations will complete, but no new loops will start.`);
                } else {
                    selfRef.log("warn", `Cannot terminate sequence '${sequenceId}'. It is not currently running.`);
                }
            };
        };
    };
})(window);