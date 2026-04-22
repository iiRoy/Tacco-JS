function SoundSynthesisEngine(topologyData, mainAudioCtx, masterOutput) {
    // This flag indicates if any keyboard input components are part of the graph.
    this._keyboardInputDetected = false;

    // Store the audio context instance, creating a new one if none is provided.
    this.audioContext = mainAudioCtx;
    if (!this.audioContext) {
        console.info("SoundSynthesisEngine: No AudioContext provided. Creating a new one for operation.");
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }

    // Assign the final audio output destination. Defaults to the AudioContext's destination.
    this.finalOutput = masterOutput || this.audioContext.destination;

    // An object to store all instantiated audio components, indexed by their unique names.
    this.componentRegistry = {};

    /**
     * Internal helper function to locate a component instance or its property within the registry.
     * @param {SoundSynthesisEngine} engineInstance - The current engine instance.
     * @param {string} componentReference - The string reference (e.g., "osc1", "osc1.frequency", "destination").
     * @returns {AudioNode|Object|undefined} The resolved component or its property, or undefined if not found.
     */
    const _resolveComponentReference = (engineInstance, componentReference) => {
        // Special case: the global audio output destination.
        if (componentReference.toLowerCase() === "destination") {
            return engineInstance.finalOutput;
        }

        // Split the reference string by dot to handle properties (e.g., "gainNode.gain").
        const referenceSegments = componentReference.split('.');

        // If it's a top-level component name (e.g., "osc1").
        if (referenceSegments.length === 1) {
            const component = engineInstance.componentRegistry[referenceSegments[0]];
            if (!component) {
                console.warn(`SoundSynthesisEngine: Component '${componentReference}' not found in registry.`, { reference: componentReference });
            }
            return component;
        }

        // If it's a component property (e.g., "osc1.frequency").
        const parentComponentName = referenceSegments[0];
        const propertyName = referenceSegments[1];
        const parentComponent = engineInstance.componentRegistry[parentComponentName];

        if (!parentComponent) {
            console.warn(`SoundSynthesisEngine: Parent component '${parentComponentName}' for reference '${componentReference}' not found.`);
            return undefined;
        }
        return parentComponent[propertyName];
    };

    /**
     * Constructor for a custom node that generates a frequency based on two input parameters.
     * This emulates a MIDI-to-frequency conversion.
     */
    function ParametricFrequencyGenerator() {
        // Stores the two input values for the function.
        this.inputParameters = { primary: 0, secondary: 0 };
        // List of components connected to this generator's output.
        this.outputConnections = [];
        // The mathematical function used to calculate the output frequency.
        this.calculationMethod = (valX, valY) => {
            const A4_FREQUENCY = 440; // Reference A4 note frequency
            const MIDI_NOTE_A4 = 69; // MIDI note number for A4
            return A4_FREQUENCY * Math.pow(2, (valX + valY - MIDI_NOTE_A4) / 12);
        };
        // Identifier for this custom node type.
        this.nodeKind = "custom_frequency_function";

        /**
         * Establishes a connection from this generator to a target component.
         * @param {AudioNode|Object} destinationNode - The component to connect to.
         * @param {number} [outputChannel=0] - The output channel index (usually 0 or 1).
         * @param {number} [inputChannel=0] - The input channel index on the target (usually 0 or 1).
         */
        this.establishConnection = (destinationNode, outputChannel = 0, inputChannel = 0) => {
            // Ensure channel indices are treated as 0 or 1.
            const effectiveOutput = outputChannel ? 1 : 0;
            const effectiveInput = inputChannel ? 1 : 0;
            this.outputConnections.push([destinationNode, effectiveOutput, effectiveInput]);
        };

        /**
         * Updates one of the generator's input parameters and recalculates its output.
         * @param {number} newValue - The new value for the parameter.
         * @param {number} paramIndex - The index of the parameter to update (0 for primary, 1 for secondary).
         */
        this.updateValue = (newValue, paramIndex) => {
            // Update the specific input parameter based on the index.
            if (paramIndex === 0) {
                this.inputParameters.primary = newValue;
            } else if (paramIndex === 1) {
                this.inputParameters.secondary = newValue;
            } else {
                console.warn(`ParametricFrequencyGenerator: Invalid parameter index '${paramIndex}' received. Value not updated.`);
                return;
            }

            // Calculate the new output based on the updated inputs.
            const calculatedOutput = this.calculationMethod(this.inputParameters.primary, this.inputParameters.secondary);

            // Propagate the calculated output to all connected components.
            this.outputConnections.forEach(currentConnection => {
                let targetComponent = currentConnection[0];
                const targetInputChannel = currentConnection[2];

                if (targetComponent && typeof targetComponent.updateValue === "function") {
                    // If the target has a custom 'updateValue' method, call it.
                    targetComponent.updateValue(calculatedOutput, targetInputChannel);
                } else if (targetComponent && typeof targetComponent.value === "number") {
                    // If the target is an AudioParam (e.g., gain, frequency), set its value.
                    targetComponent.value = calculatedOutput;
                } else if (targetComponent) {
                    // Fallback for direct assignment. This directly overwrites the reference in the connection array.
                    // This behavior is maintained from the original code but can be problematic in some contexts.
                    currentConnection[0] = calculatedOutput;
                }
            });
        };
    }

    /**
     * Constructor for a custom node that handles input from a keyboard-like DOM element.
     */
    function KeyboardEventSource(elementIdentifier) {
        this.outputLinks = []; // Connections originating from this source.
        this.nodeKind = "keyboard_input_source"; // Type identifier.

        // Retrieve the DOM element. Exit if not found.
        const domElement = document.getElementById(elementIdentifier);
        if (!domElement) {
            console.error(`KeyboardEventSource: DOM element with ID '${elementIdentifier}' not found. This component will not function.`);
            return;
        }
        this.inputElement = domElement;

        // Capture 'this' context for event listener.
        const self = this;

        // Attach an event listener for 'change' events on the input element.
        this.inputElement.addEventListener("change", (eventObject) => {
            // Validate the event object structure.
            if (!eventObject || !eventObject.note || !Array.isArray(eventObject.note) || eventObject.note.length < 2) {
                console.warn("KeyboardEventSource: Received 'change' event without expected 'note' data. Skipping event.", eventObject);
                return;
            }

            // Iterate over all established connections.
            self.outputLinks.forEach(currentLink => {
                const targetComponent = currentLink[0];
                const outputParamIndex = currentLink[1]; // Which part of 'event.note' to use (e.g., 0 or 1).
                const targetInputChannel = currentLink[2];

                // Extract the value from the event's note data.
                const receivedValue = eventObject.note[1 - outputParamIndex];

                // Propagate the value to the connected target.
                if (targetComponent && typeof targetComponent.updateValue === "function") {
                    targetComponent.updateValue(receivedValue, targetInputChannel);
                } else if (targetComponent && typeof targetComponent.value === "number") {
                    targetComponent.value = receivedValue;
                } else if (targetComponent) {
                    // Direct assignment to connection reference, mirroring original behavior.
                    currentLink[0] = receivedValue;
                }
            });
        });

        /**
         * Establishes a connection from this keyboard source to a target component.
         * @param {AudioNode|Object} destinationNode - The component to connect to.
         * @param {number} [outputPort=0] - The output port index (used to select from event.note array).
         * @param {number} [inputPort=0] - The input port index on the target.
         */
        this.establishConnection = (destinationNode, outputPort = 0, inputPort = 0) => {
            const effectiveOutput = outputPort ? 1 : 0;
            const effectiveInput = inputPort ? 1 : 0;
            this.outputLinks.push([destinationNode, effectiveOutput, effectiveInput]);
        };

        // Placeholder method for activation, as the original was empty.
        this.activateSource = () => {
            // console.log(`KeyboardEventSource '${elementIdentifier}' is active and listening.`);
        };
    }

    /**
     * Constructor for a custom node that handles input from a UI control element (e.g., a slider or knob).
     */
    function UIControlParameter(elementIdentifier) {
        this.outgoingConnections = []; // Connections from this control.
        this.nodeKind = "ui_control_input"; // Type identifier.

        // Retrieve the DOM element. Exit if not found.
        const domElement = document.getElementById(elementIdentifier);
        if (!domElement) {
            console.error(`UIControlParameter: DOM element with ID '${elementIdentifier}' not found. This component will not function.`);
            return;
        }
        this.controlElement = domElement;

        // Capture 'this' context for event listener.
        const selfRef = this;

        // Attach an event listener for 'change' events.
        this.controlElement.addEventListener("change", (eventDetails) => {
            // Parse the value from the event target, ensuring it's a number.
            const controlValue = parseFloat(eventDetails.target.value);
            if (isNaN(controlValue)) {
                console.warn("UIControlParameter: Received non-numeric value from event target. Skipping event.", { value: eventDetails.target.value });
                return;
            }

            // Propagate the value to all connected components.
            selfRef.outgoingConnections.forEach(currentLink => {
                let targetComponent = currentLink[0];
                const targetInputPort = currentLink[2];

                if (targetComponent && typeof targetComponent.updateValue === "function") {
                    targetComponent.updateValue(controlValue, targetInputPort);
                } else if (targetComponent && typeof targetComponent.value === "number") {
                    targetComponent.value = controlValue;
                } else if (targetComponent) {
                    // Direct assignment to connection reference, mirroring original behavior.
                    currentLink[0] = controlValue;
                }
            });
        });

        /**
         * Establishes a connection from this UI control to a target component.
         * @param {AudioNode|Object} destinationNode - The component to connect to.
         * @param {number} [outputPort=0] - The output port index (usually 0).
         * @param {number} [inputPort=0] - The input port index on the target.
         */
        this.establishConnection = (destinationNode, outputPort = 0, inputPort = 0) => {
            const effectiveOutput = outputPort ? 1 : 0;
            const effectiveInput = inputPort ? 1 : 0;
            this.outgoingConnections.push([destinationNode, effectiveOutput, effectiveInput]);
        };
    }

    /**
     * Configures properties of an audio component instance based on provided settings.
     * @param {AudioNode|Object} componentInstance - The component to configure.
     * @param {Object} componentSettings - An object containing key-value pairs of settings.
     */
    this.configureAudioComponent = function (componentInstance, componentSettings) {
        // Guard clause: Do nothing if no settings are provided.
        if (!componentSettings) {
            return;
        }

        // Iterate over each setting key.
        Object.keys(componentSettings).forEach(settingKey => {
            const settingValue = componentSettings[settingKey];

            if (settingKey === "func") {
                // Special handling for defining a custom function using eval.
                // This is a direct replication of the original code's behavior.
                try {
                    componentInstance[settingKey] = eval("(function (x,y){return " + settingValue + "})");
                } catch (e) {
                    console.error(`SoundSynthesisEngine: Error evaluating function for setting '${settingKey}'.`, e);
                }
            } else if (componentInstance[settingKey] && typeof componentInstance[settingKey].value === "number") {
                // If the property is an AudioParam (has a 'value' property), set its value.
                componentInstance[settingKey].value = settingValue;
            } else {
                // For all other properties, assign directly.
                componentInstance[settingKey] = settingValue;
            }
        });
    };

    /**
     * Initiates the processing of the audio graph:
     * 1. Detects special component types (e.g., keyboard input).
     * 2. Instantiates and configures all components.
     * 3. Establishes connections between components.
     * 4. Activates components that require a 'start' or 'activateSource' call.
     */
    this.initiateGraphProcessing = function () {
        // Guard clause: Ensure there's topology data to process.
        if (!topologyData || topologyData.length === 0) {
            console.warn("SoundSynthesisEngine: No graph topology data provided. Processing halted.");
            return;
        }

        // --- Pass 1: Pre-scan for specific component types ---
        topologyData.forEach(componentDef => {
            if (componentDef.n && componentDef.n.startsWith("key")) {
                this._keyboardInputDetected = true;
            }
        });
        if (this._keyboardInputDetected) {
            console.log("SoundSynthesisEngine: Keyboard input component detected in the graph configuration.");
        }


        // --- Pass 2: Instantiate and configure all components ---
        // A map to associate component type prefixes with their creation functions.
        const nodeCreationFactory = {
            "osc": (name, params) => this.audioContext.createOscillator(),
            "buf": (name, params) => this.audioContext.createBufferSource(),
            "str": (name, params) => this.audioContext.createMediaStreamSource(),
            "ele": (name, params) => this.audioContext.createMediaElementSource(),
            "gai": (name, params) => this.audioContext.createGain(),
            "fil": (name, params) => this.audioContext.createBiquadFilter(),
            "del": (name, params) => this.audioContext.createDelay(),
            "pan": (name, params) => this.audioContext.createPanner(),
            "com": (name, params) => this.audioContext.createDynamicsCompressor(),
            "sha": (name, params) => this.audioContext.createWaveShaper(),
            "con": (name, params) => this.audioContext.createConvolver(),
            "scr": (name, params) => this.audioContext.createScriptProcessor(2048, 2, 2),
            "ana": (name, params) => this.audioContext.createAnalyser(),
            "spl": (name, params) => this.audioContext.createChannelSplitter(),
            "mer": (name, params) => this.audioContext.createChannelMerger(),
            "fun": (name, params) => new ParametricFrequencyGenerator(),
            "key": (name, params) => new KeyboardEventSource(name),
            "kno": (name, params) => new UIControlParameter(name),
        };

        topologyData.forEach(componentDefinition => {
            const componentName = componentDefinition.n;
            const componentTypePrefix = componentName.substring(0, 3);
            const componentParameters = componentDefinition.p;

            let newComponentInstance = null;

            // Use the factory to create the component.
            if (nodeCreationFactory[componentTypePrefix]) {
                newComponentInstance = nodeCreationFactory[componentTypePrefix](componentName, componentParameters);
            } else {
                console.warn(`SoundSynthesisEngine: Unknown component type prefix '${componentTypePrefix}' for '${componentName}'. Skipping creation.`);
                return;
            }

            // Store the newly created component in the registry.
            this.componentRegistry[componentName] = newComponentInstance;

            // Apply any specified parameters to the component.
            if (newComponentInstance && componentParameters) {
                this.configureAudioComponent(newComponentInstance, componentParameters);
            }
        });

        // --- Pass 3: Establish connections between components ---
        topologyData.forEach(sourceComponentDefinition => {
            const sourceComponentName = sourceComponentDefinition.n;
            const sourceComponentInstance = this.componentRegistry[sourceComponentName];

            if (!sourceComponentInstance) {
                console.warn(`SoundSynthesisEngine: Source component '${sourceComponentName}' not found for connection setup. Skipping its connections.`);
                return;
            }

            const connectionSpecifications = sourceComponentDefinition.c;

            if (connectionSpecifications && connectionSpecifications.length > 0) {
                connectionSpecifications.forEach(linkSpecification => {
                    let destinationReference = linkSpecification;
                    let sourceOutputPort = 0;
                    let targetInputPort = 0;

                    // Check if the connection is a detailed object or a simple string reference.
                    if (typeof linkSpecification === 'object' && linkSpecification !== null && linkSpecification.t) {
                        destinationReference = linkSpecification.t;
                        sourceOutputPort = linkSpecification.o || 0;
                        targetInputPort = linkSpecification.i || 0;
                    }

                    // Resolve the actual target component using the helper.
                    const targetComponent = _resolveComponentReference(this, destinationReference);

                    if (!targetComponent) {
                        console.warn(`SoundSynthesisEngine: Target component '${destinationReference}' for source '${sourceComponentName}' not found. Connection skipped.`);
                        return;
                    }

                    // Use the appropriate connection method: custom 'establishConnection' or Web Audio API 'connect'.
                    if (typeof sourceComponentInstance.establishConnection === 'function') {
                        sourceComponentInstance.establishConnection(targetComponent, sourceOutputPort, targetInputPort);
                    } else if (typeof sourceComponentInstance.connect === 'function') {
                        // Web Audio API connect method can have varying arguments.
                        if (targetInputPort !== 0) {
                            sourceComponentInstance.connect(targetComponent, sourceOutputPort, targetInputPort);
                        } else if (sourceOutputPort !== 0) {
                            sourceComponentInstance.connect(targetComponent, sourceOutputPort);
                        } else {
                            sourceComponentInstance.connect(targetComponent);
                        }
                    } else {
                        console.warn(`SoundSynthesisEngine: Component '${sourceComponentName}' lacks a 'connect' or 'establishConnection' method. Cannot form connection.`);
                    }
                });
            }
        });

        // --- Pass 4: Activate components that need to be started ---
        // Collect all components from the registry.
        const componentsRequiringActivation = Object.values(this.componentRegistry);

        componentsRequiringActivation.forEach(component => {
            if (typeof component.activateSource === 'function') {
                // For custom input sources like KeyboardEventSource.
                component.activateSource();
            } else if (typeof component.start === 'function') {
                // For Web Audio API nodes (e.g., Oscillators, BufferSources).
                // It's common practice to start them at the current audio context time.
                component.start(this.audioContext.currentTime);
            }
        });

    }.bind(this); // Bind 'this' to the current instance for 'initiateGraphProcessing'.
}