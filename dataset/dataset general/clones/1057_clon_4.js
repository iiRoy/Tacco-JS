const synthesizerFabricator = (blueprintConfiguration, audioContextHandle, primaryOutputSink) => {
    const activeAudioContext = audioContextHandle || new AudioContext();
    const finalAudioDestination = primaryOutputSink || activeAudioContext.destination;
    const processingComponentRegistry = new Map();

    const retrieveComponent = (componentIdentifier) => {
        if (componentIdentifier === "destination") {
            return finalAudioDestination;
        }
        const componentPath = componentIdentifier.split(".");
        if (componentPath.length === 1) {
            return processingComponentRegistry.get(componentPath[0]);
        }
        const baseComponent = processingComponentRegistry.get(componentPath[0]);
        return baseComponent ? baseComponent[componentPath[1]] : undefined;
    };

    // --- Custom Component Definitions ---

    const createFrequencyProcessor = () => {
        let numericOperands = [0, 0];
        const linkedOutputChannels = [];
        let calculationLogic = (valA, valB) => 440 * Math.pow(2, (valA + valB - 69) / 12);

        const applyAndBroadcast = (newValue, operandSlot) => {
            numericOperands[operandSlot] = newValue;
            const computedResult = calculationLogic(numericOperands[0], numericOperands[1]);
            linkedOutputChannels.forEach(([targetEntity, outputPort, inputPort]) => {
                if (typeof targetEntity.receiveValueUpdate === 'function') {
                    targetEntity.receiveValueUpdate(computedResult, inputPort);
                } else if (typeof targetEntity.value === 'number') {
                    targetEntity.value = computedResult;
                }
                // Original's 'else c[0]=y' branch is ambiguous for object targets (would reassign local reference).
                // For primitives, it's a no-op as JS passes by value. Thus, functionally equivalent to doing nothing.
            });
        };

        return {
            receiveValueUpdate: applyAndBroadcast,
            establishConnection: (targetComponent, outputChannel = 0, inputChannel = 0) => {
                linkedOutputChannels.push([targetComponent, outputChannel, inputChannel]);
            },
            getCalculationLogic: () => calculationLogic,
            setCalculationLogic: (logicExpression) => {
                // Using new Function for dynamic code generation, diverging from eval.
                calculationLogic = new Function('valA', 'valB', `return ${logicExpression};`);
            },
            getOperands: () => numericOperands,
            componentType: "frequency_processor",
        };
    };

    const createInputSourceAbstraction = (htmlElementId, valueMappingFunction) => {
        const connectedOutputs = [];
        const attachedElement = document.getElementById(htmlElementId);
        if (!attachedElement) {
            console.warn(`HTML element with ID '${htmlElementId}' not found for input source.`);
            return {
                establishConnection: () => {},
                beginOperation: () => {},
                componentType: "input_source_stub"
            };
        }

        const inputChangeListener = (eventObject) => {
            connectedOutputs.forEach(([targetComponent, outputChannel, inputChannel]) => {
                const propagatedValue = valueMappingFunction(eventObject, outputChannel);
                if (typeof targetComponent.receiveValueUpdate === 'function') {
                    targetComponent.receiveValueUpdate(propagatedValue, inputChannel);
                } else if (typeof targetComponent.value === 'number') {
                    targetComponent.value = propagatedValue;
                }
                // Ambiguous 'else' branch from original is omitted for functional equivalence.
            });
        };

        attachedElement.addEventListener("change", inputChangeListener);

        return {
            establishConnection: (targetComponent, outputChannel = 0, inputChannel = 0) => {
                connectedOutputs.push([targetComponent, outputChannel, inputChannel]);
            },
            beginOperation: () => { /* Input elements don't typically have a 'start' method */ },
            componentType: "input_source"
        };
    };

    const createKeyboardInputController = (elementId) =>
        createInputSourceAbstraction(elementId, (e, outputIdx) => e.note[1 - (outputIdx || 0)]);

    const createControlDialHandler = (elementId) =>
        createInputSourceAbstraction(elementId, (e) => parseFloat(e.target.value));

    // --- Component Factory Dispatch Table ---

    const componentFactories = new Map([
        ["osc", () => activeAudioContext.createOscillator()],
        ["buf", () => activeAudioContext.createBufferSource()],
        ["str", () => activeAudioContext.createMediaStreamSource()],
        ["ele", () => activeAudioContext.createMediaElementSource()],
        ["gai", () => activeAudioContext.createGain()],
        ["fil", () => activeAudioContext.createBiquadFilter()],
        ["del", () => activeAudioContext.createDelay()],
        ["pan", () => activeAudioContext.createPanner()],
        ["com", () => activeAudioContext.createDynamicsCompressor()],
        ["sha", () => activeAudioContext.createWaveShaper()],
        ["con", () => activeAudioContext.createConvolver()],
        ["scr", () => activeAudioContext.createScriptProcessor(2048, 2, 2)],
        ["ana", () => activeAudioContext.createAnalyser()],
        ["spl", () => activeAudioContext.createChannelSplitter()],
        ["mer", () => activeAudioContext.createChannelMerger()],
        ["fun", () => createFrequencyProcessor()],
        ["key", (params, componentId) => createKeyboardInputController(componentId)],
        ["kno", (params, componentId) => createControlDialHandler(componentId)]
    ]);

    // --- Component Configuration Logic ---

    const applyComponentConfiguration = (componentInstance, parameters) => {
        if (!parameters) return;

        for (const configKey in parameters) {
            const configValue = parameters[configKey];

            if (configKey === "func" && typeof componentInstance.setCalculationLogic === 'function') {
                componentInstance.setCalculationLogic(configValue);
            } else if (typeof componentInstance[configKey] === 'object' && typeof componentInstance[configKey].value === 'number') {
                // Web Audio API AudioParam (e.g., gain.gain)
                componentInstance[configKey].value = configValue;
            } else if (typeof componentInstance.getOperands === 'function' && configKey.startsWith('var')) {
                // Custom operands for frequency processor (e.g., var0, var1)
                const operandIndex = parseInt(configKey.substring(3), 10);
                if (!isNaN(operandIndex) && componentInstance.getOperands().length > operandIndex) {
                    componentInstance.getOperands()[operandIndex] = configValue;
                }
            } else {
                // Generic property assignment (e.g., oscillator.type, delay.delayTime)
                componentInstance[configKey] = configValue;
            }
        }
    };

    let keyboardInputDetected = false;

    const commenceProcessing = () => {
        // First pass: Pre-scan for specific component types (mimics original 'usekey' logic)
        blueprintConfiguration.forEach(nodeDescriptor => {
            if (nodeDescriptor.n.startsWith("key")) {
                keyboardInputDetected = true;
            }
        });
        // Original has an empty 'if(this.usekey)' block, replicating that structure.
        if (keyboardInputDetected) {
            // No functional impact here, just structural mimicry.
        }

        // Second pass: Instantiate all components
        blueprintConfiguration.forEach(nodeDescriptor => {
            const nodePrefix = nodeDescriptor.n.substring(0, 3);
            const factoryFunction = componentFactories.get(nodePrefix);
            if (factoryFunction) {
                const newComponent = factoryFunction(nodeDescriptor.p, nodeDescriptor.n);
                processingComponentRegistry.set(nodeDescriptor.n, newComponent);
                applyComponentConfiguration(newComponent, nodeDescriptor.p);
            } else {
                console.warn(`Unrecognized component type prefix: ${nodePrefix}`);
            }
        });

        // Third pass: Establish all inter-component connections
        blueprintConfiguration.forEach(nodeDescriptor => {
            const sourceComponent = processingComponentRegistry.get(nodeDescriptor.n);
            if (sourceComponent && nodeDescriptor.c) {
                nodeDescriptor.c.forEach(connectionSpecification => {
                    let targetIdentifier, outputIndex = 0, inputIndex = 0;

                    if (typeof connectionSpecification === 'string') {
                        targetIdentifier = connectionSpecification;
                    } else {
                        targetIdentifier = connectionSpecification.t;
                        outputIndex = connectionSpecification.o ? 1 : 0;
                        inputIndex = connectionSpecification.i ? 1 : 0;
                    }

                    const targetComponent = retrieveComponent(targetIdentifier);

                    if (targetComponent) {
                        // Custom connection method for custom components
                        if (typeof sourceComponent.establishConnection === 'function') {
                            sourceComponent.establishConnection(targetComponent, outputIndex, inputIndex);
                        }
                        // Standard Web Audio API connect method
                        else if (typeof sourceComponent.connect === 'function') {
                            if (inputIndex !== 0) {
                                sourceComponent.connect(targetComponent, outputIndex, inputIndex);
                            } else {
                                sourceComponent.connect(targetComponent, outputIndex);
                            }
                        } else {
                            console.warn(`Source component '${nodeDescriptor.n}' lacks a connectable interface.`);
                        }
                    } else {
                        console.warn(`Connection target '${targetIdentifier}' not found for source '${nodeDescriptor.n}'.`);
                    }
                });
            }
        });

        // Fourth pass: Initiate operations for components that require it
        processingComponentRegistry.forEach(component => {
            if (typeof component.beginOperation === 'function') {
                component.beginOperation(0); // Mimics original's start(0) call
            }
        });
    };

    return {
        commence: commenceProcessing,
        fetchComponent: retrieveComponent // Provides external access, similar to original's 'nodes' property
    };
};