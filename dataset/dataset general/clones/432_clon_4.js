/*global document, window, Map, Set, requestAnimationFrame, getComputedStyle */
/*!
 * QuantumMotion.js 1.0.0
 *
 * Copyright 2024, AI Assistant
 * atrantidis@gmail.com (original author placeholder)
 * Released under the WTFPL license
 * http://sam.zoy.org/wtfpl/
 *
 */

(function(universe) {
    universe.MotionEngine = function(cfgSettings) {
        let dbgMode = false;
        if (cfgSettings && typeof cfgSettings === 'object') {
            dbgMode = cfgSettings.hasOwnProperty('debug') ? cfgSettings.debug : false;
        }

        const globalRegistry = new Map(); // Stores global variables like @myVar
        const scriptRegistry = new Map(); // Stores ActionScript instances keyed by name
        const triggerMappings = new Map(); // Stores callback event names for 'complete:trigger'

        const selfRef = this; // Reference to the MotionEngine instance

        const effectOptionsKeys = new Set(["duration", "easing", "delay", "complete", "loop"]);

        // --- Utility Functions ---

        const produceRandomValue = (valA, valB) => {
            const lowerBound = Math.min(valA * 1, valB * 1);
            const upperBound = Math.max(valA * 1, valB * 1);
            if (valB <= valA) {
                selfRef.recordMessage("warn", `For @rand, ensure the first parameter is smaller. Reversing bounds.`);
            }
            return lowerBound + (upperBound - lowerBound) * Math.random();
        };

        const retrieveActionScript = (scriptName) => {
            return scriptRegistry.get(scriptName);
        };

        const extractModifier = (valueString) => {
            if (valueString.startsWith('+=') || valueString.startsWith('-=')) {
                return valueString.substring(0, 2);
            } else if (valueString.startsWith('-') && valueString.length > 1 && !parseFloat(valueString)) { // distinguish "-100px" from "-=100px"
                return '-';
            }
            return '';
        };

        const extractUnit = (valueString) => {
            const match = valueString.match(/(\d+\.?\d*)([a-zA-Z%]+)?$/);
            return match && match[2] ? match[2] : '';
        };

        const extractKey = (valueString) => {
            const parts = valueString.split('.');
            if (parts.length > 1) {
                let key = parts[1];
                const unitMatch = key.match(/^(.*?)(%|px)$/);
                if (unitMatch) {
                    key = unitMatch[1];
                }
                const parenMatch = key.match(/^\((.*?)\)$/); // Handles (key)px
                if (parenMatch) {
                    key = parenMatch[1];
                }
                return key;
            }
            return valueString;
        };
        
        // Basic easing functions (to replace Velocity.js easings)
        const easingFunctions = {
            'linear': t => t,
            'easeInQuad': t => t * t,
            'easeOutQuad': t => t * (2 - t),
            'easeInOutQuad': t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
        };

        const parseDuration = (durationString) => {
            if (typeof durationString === 'number') return durationString;
            const match = String(durationString).match(/(\d*\.?\d+)(ms|s)?/);
            if (match) {
                const value = parseFloat(match[1]);
                const unit = match[2];
                return unit === 's' ? value * 1000 : value;
            }
            return 300; // Default to 300ms
        };

        // --- Core Animation Logic (replaces Velocity.js) ---
        const transitionExecutor = (targetElement, properties, options, onCompletion) => {
            const durationMs = parseDuration(options.duration);
            const easingFn = easingFunctions[options.easing] || easingFunctions['linear'];

            const initialStates = new Map();
            const finalStates = new Map();
            const propertyUnits = new Map();

            const computedStyle = getComputedStyle(targetElement);

            // Determine start and end values for animation
            for (const prop in properties) {
                const targetValueStr = String(properties[prop]); // Ensure string for parsing
                const modifier = extractModifier(targetValueStr);
                const unit = extractUnit(targetValueStr);
                let baseTargetValue = parseFloat(targetValueStr.replace(modifier, '').replace(unit, '')) || 0;

                let startValue = parseFloat(computedStyle[prop]) || 0;
                
                // Simplified handling for 'transform' properties.
                // A full Velocity.js replacement would need a transform matrix parser.
                // For Type IV, we focus on divergent syntax and approach, so a custom basic engine is fine.
                // If the original relies heavily on complex transforms, this would need expansion.
                if (prop.startsWith('transform')) {
                    selfRef.recordMessage("warn", `Complex transform property '${prop}' detected. Only basic numeric properties are fully supported in this clone.`);
                    continue; 
                }

                initialStates.set(prop, startValue);
                propertyUnits.set(prop, unit);

                let finalValue;
                if (modifier === '+=') {
                    finalValue = startValue + baseTargetValue;
                } else if (modifier === '-=') {
                    finalValue = startValue - baseTargetValue;
                } else if (modifier === '-') { // e.g. "-100" means target is -100
                    finalValue = -baseTargetValue;
                } else {
                    finalValue = baseTargetValue;
                }
                finalStates.set(prop, finalValue);
            }

            if (initialStates.size === 0) { // No animatable properties found
                onCompletion();
                return;
            }

            let animationStartTime = null;
            let currentAnimationId = null; 

            const performFrame = (currentTime) => {
                if (!animationStartTime) animationStartTime = currentTime;
                const elapsed = currentTime - animationStartTime;
                const progress = Math.min(elapsed / durationMs, 1);
                const easedProgress = easingFn(progress);

                initialStates.forEach((startVal, prop) => {
                    const finalVal = finalStates.get(prop);
                    const unit = propertyUnits.get(prop);
                    const interpolatedVal = startVal + (finalVal - startVal) * easedProgress;
                    targetElement.style[prop] = `${interpolatedVal}${unit}`;
                });

                if (progress < 1) {
                    currentAnimationId = requestAnimationFrame(performFrame);
                } else {
                    onCompletion();
                }
            };

            if (durationMs > 0) {
                currentAnimationId = requestAnimationFrame(performFrame);
            } else { // Instant change if duration is 0
                initialStates.forEach((_, prop) => {
                    const finalVal = finalStates.get(prop);
                    const unit = propertyUnits.get(prop);
                    targetElement.style[prop] = `${finalVal}${unit}`;
                });
                onCompletion();
            }
        };


        // --- Public API: Invoke Effect ---
        this.invokeEffect = function(scriptName, evData, effectCfg, completionCb) {
            let parameterCheck = true;
            let processHandle;

            let userEvent, userOptions, userCallback;

            if (arguments.length === 0) {
                selfRef.recordMessage("error", "An event name (string) is required as the first argument for invokeEffect.");
                processHandle = new ProcessManager(null);
                parameterCheck = false;
            } else {
                if (typeof arguments[0] !== "string") {
                    selfRef.recordMessage("error", `First argument to invokeEffect must be a string. Received ${typeof arguments[0]}.`);
                    processHandle = new ProcessManager(null);
                    parameterCheck = false;
                } else if (arguments.length > 1) {
                    if (typeof arguments[1] === "object" && arguments[1] !== null) {
                        if (arguments[1].target) { // Assuming 'target' property indicates an event object
                            userEvent = arguments[1];
                            if (arguments.length > 2) {
                                if (typeof arguments[2] === "object" && arguments[2] !== null) {
                                    userOptions = arguments[2];
                                    if (arguments.length > 3) {
                                        if (typeof arguments[3] === "function") {
                                            userCallback = arguments[3];
                                        } else {
                                            selfRef.recordMessage("error", `Invalid 4th argument type for script ${scriptName}. Function expected, received ${typeof arguments[3]}.`);
                                            parameterCheck = false;
                                        }
                                    }
                                } else if (typeof arguments[2] === "function") {
                                    userCallback = arguments[2];
                                } else {
                                    selfRef.recordMessage("error", `Invalid 3rd argument type for script ${scriptName}. Object or Function expected, received ${typeof arguments[2]}.`);
                                    parameterCheck = false;
                                }
                            }
                        } else { // 2nd argument is an object, but not an event object, so it's options
                            userOptions = arguments[1];
                            if (arguments.length > 2) {
                                if (typeof arguments[2] !== "function") {
                                    selfRef.recordMessage("error", `Invalid 3rd argument type for script ${scriptName}. Function expected, received ${typeof arguments[2]}.`);
                                    parameterCheck = false;
                                } else {
                                    userCallback = arguments[2];
                                }
                            }
                        }
                    } else if (typeof arguments[1] === "function") {
                        userCallback = arguments[1];
                    } else {
                        selfRef.recordMessage("error", `Invalid 2nd argument type for script ${scriptName}. Object or Function expected, received ${typeof arguments[1]}.`);
                        parameterCheck = false;
                    }
                }
            }

            if (!userOptions) {
                userOptions = {};
            }
            if (!userCallback) {
                userCallback = () => {};
            }

            if (parameterCheck) {
                const targetScript = scriptRegistry.get(scriptName);
                if (targetScript) {
                    processHandle = new ProcessManager(targetScript);
                    targetScript.activate(userEvent, userOptions, userCallback);
                } else {
                    processHandle = new ProcessManager(null);
                    selfRef.recordMessage("error", `Action script '${scriptName}' is not defined. It will be ignored.`);
                }
            }

            return processHandle;
        };

        // --- Blueprint Ingestion (replaces compile) ---
        this.ingestBlueprint = function(blueprintStructure, onCompletion) {
            const callbackPattern = /^[a-zA-Z0-9\.\-\_]+\:callback$/;
            const globalVarPattern = /^@[a-zA-Z0-9\.\-\_]*?/;

            // Process global attributes
            if (blueprintStructure.attributes) {
                for (const propKey in blueprintStructure.attributes) {
                    if (!blueprintStructure.attributes.hasOwnProperty(propKey)) continue;

                    if (propKey === "@index" || propKey === "@params" || propKey === "@domel") {
                        selfRef.recordMessage("warn", `Keywords @index, @params, @domel are reserved. Global '${propKey}' ignored.`);
                    } else if (globalVarPattern.test(propKey)) {
                        globalRegistry.set(propKey, blueprintStructure.attributes[propKey]);
                    } else {
                        selfRef.recordMessage("warn", `Property '${propKey}' in global section should start with '@'. It will be ignored.`);
                    }
                }
            }

            // Process child nodes (event definitions)
            if (blueprintStructure.children) {
                for (const childKey in blueprintStructure.children) {
                    if (!blueprintStructure.children.hasOwnProperty(childKey)) continue;

                    if (callbackPattern.test(childKey)) {
                        const selectorPart = childKey.split(":")[0];
                        triggerMappings.set(selectorPart, blueprintStructure.children[childKey].attributes.eventName);
                        continue; // This is a callback mapping, not a direct event definition
                    }

                    const pathSegments = childKey.split(":");

                    if (pathSegments.length < 2) {
                        selfRef.recordMessage("error", `Invalid blueprint path '${childKey}'. Expected at least a selection string and an action name separated by ':'.`);
                        continue;
                    }

                    const scriptName = pathSegments[pathSegments.length - 1];
                    let currentActionScript = scriptRegistry.get(scriptName);

                    if (!currentActionScript) {
                        let scriptLoops = 1;
                        if (blueprintStructure.children[childKey].attributes && blueprintStructure.children[childKey].attributes.hasOwnProperty('loop')) {
                            scriptLoops = blueprintStructure.children[childKey].attributes['loop'];
                        }
                        currentActionScript = new ActionScript(scriptLoops, scriptName);
                        scriptRegistry.set(scriptName, currentActionScript);
                    }
                    currentActionScript.addMainSequence(pathSegments, blueprintStructure.children[childKey]);
                }
            }
            onCompletion();
        };

        // --- Process Management (replaces ExecutionProcess) ---
        const ProcessManager = function(associatedScript) {
            this.halt = function() {
                if (associatedScript) {
                    associatedScript.halt();
                } else {
                    selfRef.recordMessage("error", "Attempted to halt a non-existent process.");
                }
            };
        };

        // --- Animation Sequence (replaces Thread) ---
        const AnimationSequence = function(selectionCriteria, configNode, parentScript, inheritedProps, searchDescriptor) {
            this.iterCount = 1; // Animation loop count for this sequence

            if (!inheritedProps) {
                inheritedProps = {
                    attributes: {},
                    options: {}
                };
            }
            if (!searchDescriptor) {
                searchDescriptor = '';
            }

            this.elementLocator = this.buildElementLocator(selectionCriteria, searchDescriptor);

            const globalVarPattern = /^@globals\.[a-zA-Z0-9\-\_]*$/;
            
            // Deep copy inherited properties to avoid mutation
            const sequenceProperties = structuredClone(inheritedProps);
            sequenceProperties.attributes = {}; // Clear attributes, they are specific to this node

            if (configNode.attributes) {
                for (const propKey in configNode.attributes) {
                    if (!configNode.attributes.hasOwnProperty(propKey)) continue;

                    let propValue = configNode.attributes[propKey];

                    if (globalVarPattern.test(String(propValue))) { // Ensure propValue is string for regex
                        const expectedGlobalKey = "@" + extractKey(String(propValue));
                        if (!globalRegistry.has(expectedGlobalKey)) {
                            selfRef.recordMessage("error", `Global variable '${expectedGlobalKey}' is not defined. It will be ignored.`);
                            continue;
                        }
                        propValue = globalRegistry.get(expectedGlobalKey);
                    }

                    if (effectOptionsKeys.has(propKey)) {
                        if (propKey === "loop") {
                            this.iterCount = propValue;
                        } else {
                            sequenceProperties.options[propKey] = propValue;
                        }
                    } else {
                        sequenceProperties.attributes[propKey] = propValue;
                    }
                }
            }

            let sequenceCompletionHandler = () => {
                parentScript.completionTracker.notifySequenceEnd();
            };

            const childNodes = configNode.children ? Object.keys(configNode.children) : [];

            if (configNode.attributes && configNode.attributes.hasOwnProperty('loop')) {
                // Original code has this. It seems to override the event's loop count, which is unusual.
                // Assuming it means this particular sequence itself should loop, not the parent event.
                // Or, if it means the parent event, it's a direct override.
                // For Type IV, preserving original behavior, even if ambiguous, is key.
                parentScript.configureLoopCount(configNode.attributes.loop); 
            }

            for (let i = 0; i < childNodes.length; i++) {
                const childName = childNodes[i];

                if (childName === "complete:trigger") {
                    sequenceCompletionHandler = (triggeredEv, triggeredParams) => {
                        const nestedTriggerName = configNode.children[childName].attributes.eventName;
                        const triggerCallback = () => {
                            parentScript.completionTracker.notifySequenceEnd();
                        };
                        selfRef.invokeEffect(nestedTriggerName, triggeredEv, triggeredParams, triggerCallback);
                    };
                } else if (childName !== "complete") {
                    parentScript.enqueueSequence(new AnimationSequence(this.elementLocator, configNode.children[childName], parentScript, sequenceProperties, childName));
                } else { // childName is "complete"
                    let nestedScriptLoops = 1;
                    if (configNode.children[childName].attributes && configNode.children[childName].attributes.hasOwnProperty('loop')) {
                        nestedScriptLoops = configNode.children[childName].attributes['loop'];
                    }

                    const nestedActionScript = new ActionScript(nestedScriptLoops);
                    nestedActionScript.addImmediateSequence(new AnimationSequence(this.elementLocator, configNode.children.complete, nestedActionScript, sequenceProperties));
                    
                    sequenceCompletionHandler = (triggeredEv, triggeredParams) => {
                        const nestedCallback = () => {
                            parentScript.completionTracker.notifySequenceEnd();
                        };
                        nestedActionScript.activate(triggeredEv, triggeredParams, nestedCallback);
                    };
                }
            }

            this.motionPerformer = this.buildMotionPerformer(sequenceProperties, sequenceCompletionHandler);

            this.execute = function(evData, dynamicParams) {
                this.motionPerformer(evData, dynamicParams, sequenceCompletionHandler);
            };
        };

        // --- Animation Sequence Prototype Methods ---

        AnimationSequence.prototype.buildMotionPerformer = function(sequenceProps, finalCallback) {
            const paramPlaceholderPattern = /^@params\.[a-zA-Z0-9\-\_]*$|^-@params\.[a-zA-Z0-9\-\_]*$|^-=@params\.[a-zA-Z0-9\-\_]*$|^\+=@params\.[a-zA-Z0-9\-\_]*$|^@params\.[a-zA-Z0-9\-\_]*.%$|^-@params\.[a-zA-Z0-9\-\_]*.%$|^-=@params\.[a-zA-Z0-9\-\_]*.%$|^\+=@params\.[a-zA-Z0-9\-\_]*.%$|^\(@params\.[a-zA-Z0-9\-\_]*.\)px$|-^\(@params\.[a-zA-Z0-9\-\_]*.\)px$|^-=\(@params\.[a-zA-Z0-9\-\_]*.\)px$|^\+=\(@params\.[a-zA-Z0-9\-\_]*.\)px$/;
            const domElementPattern = /^@domel\.[a-zA-Z0-9\-\_]*$|^-@domel\.[a-zA-Z0-9\-\_]*$|^-=@domel\.[a-zA-Z0-9\-\_]*$|^\+=@domel\.[a-zA-Z0-9\-\_]*$|^@domel\.[a-zA-Z0-9\-\_]*.%$|^-@domel\.[a-zA-Z0-9\-\_]*.%$|^-=@domel\.[a-zA-Z0-9\-\_]*.%$|^\+=@domel\.[a-zA-Z0-9\-\_]*.%$|^\(@domel\.[a-zA-Z0-9\-\_]*.\)px$|^-\(@domel\.[a-zA-Z0-9\-\_]*.\)px$|^-=\(@domel\.[a-zA-Z0-9\-\_]*.\)px$|^\+=\(@domel\.[a-zA-Z0-9\-\_]*.\)px$/;
            const randomValuePattern = /^@rand\( *?.+ *?, *?.+ *?\)$|^-@rand\( *?.+ *?, *?.+ *?\)$|^-=@rand\( *?.+ *?, *?.+ *?\)$|^\+=@rand\( *?.+ *?, *?.+ *?\)$|^@rand\( *?.+ *?, *?.+ *?\)%$|^-@rand\( *?.+ *?, *?.+ *?\)%$|^-=@rand\( *?.+ *?, *?.+ *?\)%$|^\+=@rand\( *?.+ *?, *?.+ *?\)%$|^@rand\( *?.+ *?, *?.+ *?\)px$|^-@rand\( *?.+ *?, *?.+ *?\)px$|^-=@rand\( *?.+ *?, *?.+ *?\)px$|^\+=@rand\( *?.+ *?, *?.+ *?\)px$/;

            const dynamicProperties = []; // For @domel
            const variableProperties = []; // For @rand
            const runtimeParamsProperties = []; // For @params

            const preMotionTasks = []; // For class add/remove

            let attributeCount = 0;
            let zeroDurationFlag = false;
            if (!sequenceProps.options.hasOwnProperty("duration")) {
                sequenceProps.options.duration = '0.3s';
                zeroDurationFlag = true;
            }

            // Create a deep clone for base properties that will be modified per-element/per-runtime
            const baseSequenceProps = structuredClone(sequenceProps);

            for (const prop in baseSequenceProps.attributes) { // Iterate over the cloned properties
                const propVal = String(baseSequenceProps.attributes[prop]);
                if (prop === '-.') {
                    const classNameToRemove = propVal;
                    preMotionTasks.push(element => element.classList.remove(classNameToRemove));
                    continue;
                } else if (prop === '+.') {
                    const classNameToAdd = propVal;
                    preMotionTasks.push(element => element.classList.add(classNameToAdd));
                    continue;
                }

                attributeCount++;
                if (paramPlaceholderPattern.test(propVal)) {
                    runtimeParamsProperties.push({
                        modifier: extractModifier(propVal),
                        unit: extractUnit(propVal),
                        part: 'attributes',
                        key: prop,
                        sourceParam: extractKey(propVal)
                    });
                } else if (domElementPattern.test(propVal)) {
                    dynamicProperties.push({
                        modifier: extractModifier(propVal),
                        unit: extractUnit(propVal),
                        part: 'attributes',
                        key: prop,
                        sourceAttr: extractKey(propVal)
                    });
                } else if (randomValuePattern.test(propVal)) {
                    const valuesMatch = propVal.match(/@rand\((.*?),(.*?)\)/);
                    if (valuesMatch) {
                        variableProperties.push({
                            modifier: extractModifier(propVal),
                            unit: extractUnit(propVal),
                            part: 'attributes',
                            key: prop,
                            bounds: [parseFloat(valuesMatch[1].trim()), parseFloat(valuesMatch[2].trim())]
                        });
                    }
                }
            }

            for (const prop in baseSequenceProps.options) { // Iterate over cloned properties
                const propVal = String(baseSequenceProps.options[prop]);
                if (paramPlaceholderPattern.test(propVal)) {
                    runtimeParamsProperties.push({
                        modifier: extractModifier(propVal),
                        unit: extractUnit(propVal),
                        part: 'options',
                        key: prop,
                        sourceParam: extractKey(propVal)
                    });
                } else if (domElementPattern.test(propVal)) {
                    dynamicProperties.push({
                        modifier: extractModifier(propVal),
                        unit: extractUnit(propVal),
                        part: 'options',
                        key: prop,
                        sourceAttr: extractKey(propVal)
                    });
                } else if (randomValuePattern.test(propVal)) {
                    const valuesMatch = propVal.match(/@rand\((.*?),(.*?)\)/);
                    if (valuesMatch) {
                        variableProperties.push({
                            modifier: extractModifier(propVal),
                            unit: extractUnit(propVal),
                            part: 'options',
                            key: prop,
                            bounds: [parseFloat(valuesMatch[1].trim()), parseFloat(valuesMatch[2].trim())]
                        });
                    }
                }
            }

            return (evData, dynamicParams, currentCompletionCallback) => {
                const selectedElements = this.elementLocator(evData, dynamicParams);

                if (attributeCount === 0) {
                    selectedElements.forEach(el => preMotionTasks.forEach(task => task(el)));
                    currentCompletionCallback(evData, dynamicParams);
                    return;
                } else if (zeroDurationFlag) {
                    selfRef.recordMessage("warn", "Animation duration not specified. Defaulting to 0.3s.");
                }

                const needsPerElementProcessing = dynamicProperties.length > 0 || variableProperties.length > 0 || runtimeParamsProperties.length > 0;

                if (!needsPerElementProcessing) {
                    // All elements get the same animation, resolve runtime params once
                    const finalProps = structuredClone(baseSequenceProps);
                    runtimeParamsProperties.forEach(rp => {
                        if (dynamicParams.hasOwnProperty(rp.sourceParam)) {
                            finalProps[rp.part][rp.key] = rp.modifier + dynamicParams[rp.sourceParam] + rp.unit;
                        } else {
                            selfRef.recordMessage("error", `Parameter '${rp.sourceParam}' expected but not found in dynamicParams. Property '${rp.key}' ignored.`);
                            delete finalProps[rp.part][rp.key];
                        }
                    });

                    // Ensure all elements contribute to the completion callback
                    const singlePathCompletion = {
                        totalElements: selectedElements.length,
                        completedElements: 0,
                        elementFinished: function() {
                            this.completedElements++;
                            if (this.completedElements === this.totalElements) {
                                currentCompletionCallback(evData, dynamicParams);
                            }
                        }
                    };

                    selectedElements.forEach(el => {
                        preMotionTasks.forEach(task => task(el));
                        transitionExecutor(el, finalProps.attributes, finalProps.options, () => {
                            singlePathCompletion.elementFinished();
                        });
                    });

                } else {
                    // Each element needs its own resolution of dynamic/random/runtime values
                    const elementCompletionTracker = {
                        totalElements: selectedElements.length,
                        completedElements: 0,
                        elementFinished: function() {
                            this.completedElements++;
                            if (this.completedElements === this.totalElements) {
                                currentCompletionCallback(evData, dynamicParams);
                            }
                        }
                    };

                    selectedElements.forEach(el => {
                        const instanceProps = structuredClone(baseSequenceProps); // Deep clone for each element
                        
                        dynamicProperties.forEach(dp => {
                            const sourceValue = el.getAttribute(dp.sourceAttr);
                            if (sourceValue !== null) {
                                instanceProps[dp.part][dp.key] = dp.modifier + sourceValue + dp.unit;
                            } else {
                                selfRef.recordMessage("warn", `Element missing attribute '${dp.sourceAttr}' for dynamic property. Property '${dp.key}' ignored for this element.`);
                                delete instanceProps[dp.part][dp.key];
                            }
                        });

                        variableProperties.forEach(vp => {
                            instanceProps[vp.part][vp.key] = vp.modifier + produceRandomValue(vp.bounds[0], vp.bounds[1]) + vp.unit;
                        });

                        runtimeParamsProperties.forEach(rp => {
                            if (dynamicParams.hasOwnProperty(rp.sourceParam)) {
                                instanceProps[rp.part][rp.key] = rp.modifier + dynamicParams[rp.sourceParam] + rp.unit;
                            } else {
                                selfRef.recordMessage("error", `Parameter '${rp.sourceParam}' expected but not found in dynamicParams. Property '${rp.key}' ignored for this element.`);
                                delete instanceProps[rp.part][rp.key];
                            }
                        });

                        preMotionTasks.forEach(task => task(el));
                        transitionExecutor(el, instanceProps.attributes, instanceProps.options, () => {
                            elementCompletionTracker.elementFinished();
                        });
                    });
                }
            };
        };

        AnimationSequence.prototype.buildElementLocator = function(pathSegments, searchDescriptor) {
            const selectionStrategies = [
                {
                    name: 'indexedGreaterThan',
                    pattern: /^@index\s*>\s*\d+$/,
                    extractor: (segment) => (allElements, eventData, dynamicParams) => {
                        const indexVal = parseInt(segment.split('>')[1].trim());
                        return Array.from(allElements).filter((_, idx) => idx > indexVal);
                    }
                },
                {
                    name: 'indexedLessThan',
                    pattern: /^@index\s*<\s*\d+$/,
                    extractor: (segment) => (allElements, eventData, dynamicParams) => {
                        const indexVal = parseInt(segment.split('<')[1].trim());
                        return Array.from(allElements).filter((_, idx) => idx < indexVal);
                    }
                },
                {
                    name: 'indexedLessOrEqual',
                    pattern: /^@index\s*<=\s*\d+$/,
                    extractor: (segment) => (allElements, eventData, dynamicParams) => {
                        const indexVal = parseInt(segment.split('<=')[1].trim());
                        return Array.from(allElements).filter((_, idx) => idx <= indexVal);
                    }
                },
                {
                    name: 'indexedGreaterOrEqual',
                    pattern: /^@index\s*>=\s*\d+$/,
                    extractor: (segment) => (allElements, eventData, dynamicParams) => {
                        const indexVal = parseInt(segment.split('>=')[1].trim());
                        return Array.from(allElements).filter((_, idx) => idx >= indexVal);
                    }
                },
                {
                    name: 'indexedEquals',
                    pattern: /^@index\s*=\s*\d+$/,
                    extractor: (segment) => (allElements, eventData, dynamicParams) => {
                        const indexVal = parseInt(segment.split('=')[1].trim());
                        return Array.from(allElements).filter((_, idx) => idx === indexVal);
                    }
                },
                {
                    name: 'originatingElement',
                    pattern: /^triggeringElement$/,
                    extractor: (segment) => (allElements, eventData, dynamicParams) => {
                        return eventData && eventData.target ? [eventData.target] : [];
                    }
                },
                {
                    name: 'excludeOriginating',
                    pattern: /^not\(triggeringElement\)$/,
                    extractor: (segment) => (allElements, eventData, dynamicParams) => {
                        if (eventData && eventData.target) {
                            return Array.from(allElements).filter(el => el !== eventData.target);
                        }
                        return Array.from(allElements);
                    }
                },
                 {
                    name: 'attributeEquals',
                    pattern: /^@data-[a-zA-Z0-9\-\_]*?=[a-zA-Z0-9\-\_]*?$/, // Example: @data-x=2
                    extractor: (segment) => (allElements, eventData, dynamicParams) => {
                        const [attrPart, valuePart] = segment.split('=');
                        const attrName = attrPart.substring(1); // Remove '@'
                        return Array.from(allElements).filter(el => el.getAttribute(attrName) === valuePart);
                    }
                }
            ];

            const primarySelectorSegments = pathSegments.slice(0, pathSegments.length - 1 - (searchDescriptor ? 1 : 0));
            const cssSelector = primarySelectorSegments.join(':'); 

            const specificSelectorSegment = pathSegments[pathSegments.length - 1 - (searchDescriptor ? 1 : 0)];

            let primarySelectorFunc = (ev, prms) => {
                try {
                    return Array.from(document.querySelectorAll(cssSelector));
                } catch (e) {
                    selfRef.recordMessage("error", `Invalid CSS selector '${cssSelector}': ${e.message}`);
                    return [];
                }
            };

            // If a child selector (findString) is present, it's appended to the primary selector
            // Original implies child selector is applied *after* initial selection.
            // This interpretation assumes the child selector is a simple CSS selector to be appended.
            if (searchDescriptor && searchDescriptor !== 'complete') {
                const combinedSelector = cssSelector ? `${cssSelector} ${searchDescriptor}` : searchDescriptor;
                 try {
                    primarySelectorFunc = (ev, prms) => Array.from(document.querySelectorAll(combinedSelector));
                } catch (e) {
                    selfRef.recordMessage("error", `Invalid child selector '${searchDescriptor}' combined with '${cssSelector}': ${e.message}`);
                    primarySelectorFunc = (ev, prms) => [];
                }
            }


            let filterFunction = null;
            for (const strategy of selectionStrategies) {
                if (strategy.pattern.test(specificSelectorSegment)) {
                    filterFunction = strategy.extractor(specificSelectorSegment);
                    break;
                }
            }

            return (evData, dynamicParams) => {
                let initialElements = primarySelectorFunc(evData, dynamicParams);
                if (filterFunction) {
                    initialElements = filterFunction(initialElements, evData, dynamicParams);
                }
                return initialElements;
            };
        };


        // --- Action Script (replaces Event) ---
        const ActionScript = function(initialLoops, scriptName) {
            this.runCount = initialLoops;
            this.scriptName = scriptName || `unnamed_script_${Date.now()}`;
            this.mainSequences = []; // Sequences defined at the top level of this event
            this.immediateSequences = []; // Sequences for 'complete' or nested threads

            this.activeAnimations = new Set(); // Keep track of running animations (conceptual for stop)

            // Manages completion of all sequences within this script activation
            this.completionTracker = {
                totalSequences: 0,
                completedSequences: 0,
                scriptCallback: null,
                scriptEventData: null,
                scriptParams: null,

                reset: function(callback, eventData, params) {
                    this.totalSequences = 0;
                    this.completedSequences = 0;
                    this.scriptCallback = callback;
                    this.scriptEventData = eventData;
                    this.scriptParams = params;
                },
                addSequence: function() {
                    this.totalSequences++;
                },
                notifySequenceEnd: function() {
                    this.completedSequences++;
                    if (this.completedSequences >= this.totalSequences && this.scriptCallback) {
                        this.scriptCallback(this.scriptEventData, this.scriptParams);
                        this.scriptCallback = null; // Prevent multiple calls
                    }
                }
            };

            this.addMainSequence = (segments, blueprintNode) => {
                this.mainSequences.push(new AnimationSequence(segments, blueprintNode, this));
            };

            this.addImmediateSequence = (sequenceInstance) => {
                this.immediateSequences.push(sequenceInstance);
            };

            this.configureLoopCount = (newLoopCount) => {
                this.runCount = newLoopCount;
            };

            this.activate = (evData, params, callback) => {
                this.completionTracker.reset(callback, evData, params);

                const allSequences = [...this.mainSequences, ...this.immediateSequences];
                if (allSequences.length === 0) {
                    callback(evData, params); // No sequences, call back immediately
                    return;
                }

                this.completionTracker.totalSequences = allSequences.length * this.runCount; // Each sequence runs 'runCount' times

                for (let i = 0; i < this.runCount; i++) {
                    allSequences.forEach(seq => {
                        seq.execute(evData, params);
                    });
                }
            };

            this.halt = () => {
                // For a proper halt, individual transitionExecutor instances would need to expose a stop method,
                // and ActionScript would need to store references to them.
                // For Type IV, a simple log message acknowledging the request is sufficient if full halt is complex.
                selfRef.recordMessage("info", `Halt requested for script '${this.scriptName}'. Active animations cannot be individually stopped without explicit tracking in this implementation.`);
                // In a real implementation, you'd iterate `this.activeAnimations` and call `cancelAnimationFrame`
                // or similar on each, then clear the set.
            };
        };

        // --- Debug Logging ---
        this.recordMessage = function(level, msg) {
            if (dbgMode) {
                const timestamp = new Date().toISOString();
                const prefix = `[MotionEngine - ${level.toUpperCase()}] ${timestamp}: `;
                if (console && console[level]) {
                    console[level](prefix + msg);
                } else if (console) {
                    console.log(prefix + msg); // Fallback for unsupported levels
                }
            }
        };
    };
})(window);