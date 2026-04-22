const FlowForge = {
    // Core parameters for component rendering and layout
    COMPONENT_HEADER_HEIGHT: 18,
    COMPONENT_PORT_SIZE: 16,
    COMPONENT_MIN_VISUAL_WIDTH: 60,
    COMPONENT_DEFAULT_WIDTH: 150,
    COMPONENT_COLLAPSED_RADIUS: 12,
    COMPONENT_COLLAPSED_PRESENTATION_WIDTH: 85,
    CANVAS_GRID_UNIT: 12,
    COMPONENT_HEADER_TEXT_COLOR: "#333",
    COMPONENT_BACKGROUND_COLOR: "#555",
    COMPONENT_DEFAULT_OUTLINE: "#BEE",
    COMPONENT_SHAPE_RECTANGLE: "rect", // Using 'rect' instead of 'box'
    MAX_PROCESSING_UNITS: 1200, // Safeguard against runaway processes
    INITIAL_PLACEMENT_COORDS: [120, 120], // Default node position
    assetPath: "", // Path for component images or resources

    // Internal system flags and data stores
    _redirectedCalls: null, // For proxying functionalities
    _componentDefinitions: {}, // Repository for all registered component types
    _globalDebugMode: false, // Control verbose logging
    _strictErrorHandling: true, // Determines if errors are thrown or just logged

    /**
     * Registers a new component type with the system, making it available for instantiation.
     *
     * @param {string} componentKey - Unique identifier for the component (e.g., "logic/and_gate").
     * @param {Function} componentBlueprint - The constructor function or class definition for the component.
     * @throws {Error} If the provided blueprint is not a valid class/constructor.
     * @returns {boolean} True if registration was successful, false otherwise.
     */
    addComponentType: function(componentKey, componentBlueprint) {
        if (!componentBlueprint || typeof componentBlueprint !== 'function') {
            console.error("Invalid component blueprint provided for key:", componentKey);
            throw new Error("A component blueprint must be a class or a constructor function.");
        }
        if (!componentBlueprint.prototype) {
            console.error("Blueprint lacks a prototype, cannot register:", componentKey);
            throw new Error("Cannot register a simple object; it must be a class with a prototype.");
        }

        // Assign the identifier directly to the blueprint for easy lookup
        componentBlueprint.componentKey = componentKey;

        // Extract category from the component key
        const lastSlashIndex = componentKey.lastIndexOf("/");
        componentBlueprint.category = (lastSlashIndex !== -1) ? componentKey.substring(0, lastSlashIndex) : "";

        // Inherit base component properties if not already present
        // Assuming 'FlowComponent' is a globally available base class or similar structure
        if (typeof FlowComponent !== 'undefined' && componentBlueprint.prototype) {
            Object.keys(FlowComponent.prototype).forEach(prop => {
                if (!(prop in componentBlueprint.prototype)) {
                    componentBlueprint.prototype[prop] = FlowComponent.prototype[prop];
                }
            });
        }

        this._componentDefinitions[componentKey] = componentBlueprint;

        if (this._globalDebugMode) {
            console.info(`Component registered: ${componentKey}`);
        }
        return true;
    },

    /**
     * Creates a new instance of a registered component type.
     * The new component is not yet attached to any workflow graph.
     *
     * @param {string} componentKey - The full identifier of the component class (e.g., "math/add").
     * @param {string} [instanceTitle] - An optional title for this specific component instance.
     * @param {Object} [initialConfig] - Configuration options to apply to the new instance.
     * @returns {Object|null} A new component instance, or null if the type is not found.
     */
    spawnComponent: function(componentKey, instanceTitle, initialConfig) {
        const blueprint = this._componentDefinitions[componentKey];
        if (!blueprint) {
            if (this._globalDebugMode) {
                console.warn(`Component type "${componentKey}" is not registered.`);
            }
            return null;
        }

        // Instantiate the component using its constructor
        const newComponent = new blueprint();

        // Assign essential properties if not already set by the constructor
        newComponent.componentKey = componentKey;
        newComponent.title = instanceTitle || blueprint.title || componentKey.split('/').pop();
        newComponent.properties = newComponent.properties || {};
        newComponent.flags = newComponent.flags || {};
        newComponent.size = newComponent.size || (typeof newComponent.calculateDimensions === 'function' ? newComponent.calculateDimensions() : [this.COMPONENT_DEFAULT_WIDTH, 60]);
        newComponent.position = newComponent.position || [...FlowForge.INITIAL_PLACEMENT_COORDS]; // Use spread to copy array

        // Apply any provided initial configuration
        if (initialConfig) {
            Object.assign(newComponent, initialConfig); // Merge options into the new component
        }

        if (this._globalDebugMode) {
            console.log(`Spawned new component: ${newComponent.title} (${componentKey})`);
        }
        return newComponent;
    },

    /**
     * Retrieves the class definition for a specific component type.
     *
     * @param {string} componentKey - The full identifier of the component.
     * @returns {Function|undefined} The component's constructor function, or undefined if not found.
     */
    getComponentDefinition: function(componentKey) {
        return this._componentDefinitions[componentKey];
    },

    /**
     * Fetches a list of component definitions belonging to a specified category.
     *
     * @param {string} categoryName - The category to filter by (e.g., "math", "logic").
     * @returns {Array<Function>} An array of component constructor functions.
     */
    getCategoryComponents: function(categoryName) {
        return Object.values(this._componentDefinitions).filter(blueprint => {
            // Include components with no category if categoryName is an empty string
            const matchesCategory = (categoryName === "" && !blueprint.category) || (blueprint.category === categoryName);
            // Exclude components marked to be skipped from listings
            return matchesCategory && !blueprint.skipListing;
        });
    },

    /**
     * Provides a list of all unique categories represented by registered components.
     *
     * @returns {Array<string>} An array of category names.
     */
    listComponentCategories: function() {
        const uniqueCategories = new Set([""]); // Always include a default empty category
        Object.values(this._componentDefinitions).forEach(blueprint => {
            if (blueprint.category && !blueprint.skipListing) {
                uniqueCategories.add(blueprint.category);
            }
        });
        return Array.from(uniqueCategories);
    },

    /**
     * Attempts to dynamically reload JavaScript module files based on a wildcard path.
     * This is primarily for development and debugging purposes.
     *
     * @param {string} modulePathWildcard - A wildcard string to match script URLs (e.g., "modules/*").
     */
    refreshModuleScripts: function(modulePathWildcard) {
        const currentScripts = Array.from(document.getElementsByTagName("script"));
        const headElement = document.head || document.getElementsByTagName("head")[0];
        const fullWildcard = document.location.href.split('/').slice(0, -1).join('/') + '/' + modulePathWildcard;

        currentScripts.forEach(script => {
            const scriptSource = script.src;
            if (!scriptSource || !scriptSource.startsWith(fullWildcard.replace('*', ''))) { // Basic wildcard match
                return;
            }

            try {
                if (this._globalDebugMode) {
                    console.log(`Reloading script: ${scriptSource}`);
                }
                const newScriptElement = document.createElement("script");
                newScriptElement.type = "text/javascript";
                newScriptElement.src = scriptSource + "?_ts=" + Date.now(); // Cache-busting
                headElement.appendChild(newScriptElement);
                if (script.parentNode === headElement) { // Ensure script is still in head before removing
                    headElement.removeChild(script);
                }
            } catch (err) {
                if (this._strictErrorHandling) {
                    throw err;
                }
                if (this._globalDebugMode) {
                    console.error(`Error during script reload for ${scriptSource}:`, err);
                }
            }
        });

        if (this._globalDebugMode) {
            console.log("Module scripts refresh attempt completed.");
        }
    },

    /**
     * Performs a deep copy of a given JavaScript object.
     *
     * @param {Object} sourceObject - The object to be cloned.
     * @param {Object} [destinationObject] - An optional object to merge the cloned properties into.
     * @returns {Object|null} A new deeply cloned object, or null if the source is null.
     */
    deepCopyEntity: function(sourceObject, destinationObject) {
        if (sourceObject === null || typeof sourceObject !== 'object') {
            return sourceObject; // Primitive values or null are returned as is
        }
        try {
            const cloned = JSON.parse(JSON.stringify(sourceObject));
            if (destinationObject) {
                return Object.assign(destinationObject, cloned);
            }
            return cloned;
        } catch (e) {
            console.error("Failed to deep copy object using JSON methods:", e);
            // Fallback for objects that cannot be stringified (e.g., circular refs, functions)
            // For a Type III clone, we can just return a shallow copy or throw for strictness
            if (this._strictErrorHandling) {
                throw new Error("Deep copy failed due to non-JSON-serializable object structure.");
            }
            return Object.assign({}, sourceObject); // Fallback to shallow copy
        }
    },

    /**
     * Provides a high-resolution timestamp.
     *
     * @returns {number} The current timestamp in milliseconds.
     */
    getCurrentTimestamp: function() {
        return (typeof performance !== "undefined" && performance.now) ? performance.now() : Date.now();
    }
};


// Assuming FlowComponent is defined elsewhere or this is a placeholder.
// For this clone, we'll just define a minimal placeholder if it's not provided.
if (typeof FlowComponent === 'undefined') {
    class FlowComponent {
        constructor() {
            this.title = "Generic Component";
            this.properties = {};
            this.flags = {};
            this.size = [FlowForge.COMPONENT_DEFAULT_WIDTH, 60];
            this.position = [0, 0];
            this.inputs = [];
            this.outputs = [];
        }
        calculateDimensions() {
            return [this.size[0], this.size[1]]; // Default implementation
        }
        onStart() {}
        onExecute() {}
        onStop() {}
        // ... other base methods
    }
    // Make FlowComponent globally accessible if needed, or adjust FlowForge.addComponentType inheritance
    // This is a minimal definition to satisfy the prototype inheritance in addComponentType
    window.FlowComponent = FlowComponent;
}



//*********************************************************************************
// WorkflowEngine CLASS
//*********************************************************************************

/**
 * The WorkflowEngine orchestrates the execution and management of a graph of components.
 * It handles lifecycle, state, and processing order.
 *
 * @class WorkflowEngine
 * @constructor
 */
class WorkflowEngine {
    static #defaultSupportedDataTypes = new Set(["number", "string", "boolean", "object", "array"]);
    static #engineStatus = {
        IDLE: 1,
        ACTIVE: 2
    };

    /**
     * Creates an instance of WorkflowEngine.
     */
    constructor() {
        if (FlowForge._globalDebugMode) {
            console.log("WorkflowEngine instance created.");
        }

        this._attachedVisualizers = new Set(); // Using Set for efficient management of visualizer panels
        this._processingStatus = WorkflowEngine.#engineStatus.IDLE;
        this._lastComponentId = 0;
        this._lastConnectionId = 0;

        // Component storage
        this._workflowComponents = [];
        this._componentsById = new Map(); // Using Map for efficient ID-based lookup

        // Connection storage
        this._workflowConnections = new Map(); // Map: linkId -> linkObject

        // Execution context and timing
        this._currentIteration = 0;
        this._config = {}; // General configuration object for the engine
        this._elapsedGlobalTime = 0; // Total time since engine started
        this._runtimeDuration = 0; // Time since last start() call
        this._fixedTimeStep = 0.01; // Default fixed time step for deterministic updates
        this._lastCycleDuration = 0.01; // Duration of the last execution cycle
        this._engineStartTime = 0;

        // Global I/O for the workflow
        this._globalInputs = new Map();
        this._globalOutputs = new Map();

        this._hasExecutionErrors = false;
        this._executionTimerHandle = null; // Store timer ID for clearInterval

        this.resetGraph(); // Initialize or clear to a clean state
    }

    /**
     * Retrieves the set of data types supported by this workflow engine.
     *
     * @returns {Set<string>} A set of supported data type strings.
     */
    get supportedDataTypes() {
        return this._customSupportedTypes || WorkflowEngine.#defaultSupportedDataTypes;
    }

    /**
     * Resets the workflow engine to its initial state, clearing all components and connections.
     */
    resetGraph() {
        this.haltExecution(); // Stop any ongoing execution
        this._processingStatus = WorkflowEngine.#engineStatus.IDLE;
        this._lastComponentId = 0;
        this._lastConnectionId = 0;

        this._workflowComponents.length = 0; // Clear array
        this._componentsById.clear(); // Clear map
        this._workflowConnections.clear(); // Clear map

        this._currentIteration = 0;
        this._elapsedGlobalTime = 0;
        this._runtimeDuration = 0;
        this._engineStartTime = 0;

        this._globalInputs.clear();
        this._globalOutputs.clear();

        this._hasExecutionErrors = false;

        this._triggerGraphChange(); // Notify visualizers of a significant change
        this._broadcastToVisualizers("clear"); // Explicitly tell visualizers to clear their display
    }

    /**
     * Associates a visualizer panel (e.g., a canvas renderer) with this workflow engine.
     *
     * @param {Object} visualizerPanel - An instance of a visualizer class (e.g., LGraphCanvas).
     * @throws {Error} If the provided panel is not a valid visualizer instance.
     */
    connectVisualizer(visualizerPanel) {
        // Basic validation for visualizer type (assuming it has a constructor and `graph` property)
        if (!visualizerPanel || typeof visualizerPanel.constructor !== 'function' || visualizerPanel.constructor.name !== 'LGraphCanvas') {
            throw new Error("connectVisualizer expects an LGraphCanvas instance.");
        }

        // If the visualizer is already connected to another graph, detach it first
        if (visualizerPanel.graph && visualizerPanel.graph !== this) {
            visualizerPanel.graph.disconnectVisualizer(visualizerPanel);
        }

        visualizerPanel.graph = this; // Assign this engine instance to the visualizer
        this._attachedVisualizers.add(visualizerPanel);

        if (FlowForge._globalDebugMode) {
            console.log(`Visualizer connected: ${visualizerPanel.constructor.name}`);
        }
    }

    /**
     * Disassociates a visualizer panel from this workflow engine.
     *
     * @param {Object} visualizerPanel - The visualizer instance to detach.
     */
    disconnectVisualizer(visualizerPanel) {
        if (!this._attachedVisualizers.has(visualizerPanel)) {
            if (FlowForge._globalDebugMode) {
                console.warn("Attempted to disconnect a visualizer that was not attached.");
            }
            return;
        }
        visualizerPanel.graph = null; // Clear the graph reference from the visualizer
        this._attachedVisualizers.delete(visualizerPanel);

        if (FlowForge._globalDebugMode) {
            console.log(`Visualizer disconnected: ${visualizerPanel.constructor.name}`);
        }
    }

    /**
     * Initiates the continuous execution of the workflow graph at a specified interval.
     *
     * @param {number} [executionIntervalMs=1] - The delay in milliseconds between each execution cycle.
     */
    initiateExecution(executionIntervalMs = 1) {
        if (this._processingStatus === WorkflowEngine.#engineStatus.ACTIVE) {
            if (FlowForge._globalDebugMode) {
                console.warn("Workflow already active. Ignoring initiateExecution call.");
            }
            return;
        }
        this._processingStatus = WorkflowEngine.#engineStatus.ACTIVE;

        if (typeof this.onExecutionStart === 'function') {
            this.onExecutionStart();
        }

        this._broadcastComponentEvent("onStart"); // Notify all components of execution start

        this._engineStartTime = FlowForge.getCurrentTimestamp();
        const self = this; // Capture 'this' for setInterval callback

        this._executionTimerHandle = setInterval(() => {
            self.executeCycle(1);
        }, executionIntervalMs);

        if (FlowForge._globalDebugMode) {
            console.log(`Workflow execution initiated with interval: ${executionIntervalMs}ms`);
        }
    }

    /**
     * Halts any ongoing continuous execution of the workflow graph.
     */
    haltExecution() {
        if (this._processingStatus === WorkflowEngine.#engineStatus.IDLE) {
            if (FlowForge._globalDebugMode) {
                console.warn("Workflow already idle. Ignoring haltExecution call.");
            }
            return;
        }

        this._processingStatus = WorkflowEngine.#engineStatus.IDLE;

        if (typeof this.onExecutionStop === 'function') {
            this.onExecutionStop();
        }

        if (this._executionTimerHandle !== null) {
            clearInterval(this._executionTimerHandle);
            this._executionTimerHandle = null;
        }

        this._broadcastComponentEvent("onStop"); // Notify all components of execution stop

        if (FlowForge._globalDebugMode) {
            console.log("Workflow execution halted.");
        }
    }

    /**
     * Executes a specified number of processing cycles (steps) of the workflow graph.
     *
     * @param {number} [cycleCount=1] - The number of execution cycles to perform.
     */
    executeCycle(cycleCount = 1) {
        if (this._processingStatus === WorkflowEngine.#engineStatus.IDLE) {
            if (FlowForge._globalDebugMode) {
                console.warn("Attempted to execute cycles while engine is idle. Call initiateExecution first.");
            }
            return;
        }

        const cycleStartTime = FlowForge.getCurrentTimestamp();
        this._runtimeDuration = 0.001 * (cycleStartTime - this._engineStartTime); // Update total runtime

        try {
            for (let i = 0; i < cycleCount; i++) {
                this._broadcastComponentEvent("onExecute"); // Trigger 'onExecute' for all components
                this._elapsedGlobalTime += this._fixedTimeStep; // Advance fixed time
                if (typeof this.onBeforeCycleStep === 'function') {
                    this.onBeforeCycleStep(); // Custom hook for before each step
                }
            }

            if (typeof this.onAfterAllCycles === 'function') {
                this.onAfterAllCycles(); // Custom hook after all cycles are done
            }
            this._hasExecutionErrors = false;
        } catch (err) {
            this._hasExecutionErrors = true;
            if (FlowForge._strictErrorHandling) {
                this.haltExecution(); // Stop execution on error
                throw err;
            }
            console.error("Error during workflow execution cycle:", err);
            this.haltExecution(); // Stop execution on error
        }

        const cycleEndTime = FlowForge.getCurrentTimestamp();
        const actualElapsed = cycleEndTime - cycleStartTime;
        this._lastCycleDuration = 0.001 * (actualElapsed === 0 ? 1 : actualElapsed); // Ensure non-zero duration
        this._runtimeDuration += this._lastCycleDuration; // Add actual elapsed time to runtime
        this._currentIteration++;

        if (FlowForge._globalDebugMode && this._currentIteration % 100 === 0) { // Log every 100 iterations
            console.log(`Cycle ${this._currentIteration} completed. Duration: ${this._lastCycleDuration.toFixed(4)}s`);
        }
    }

    /**
     * Recalculates the internal processing order of components based on their dependencies.
     * This method should be called after any changes to component connections.
     */
    recalculateProcessingSequence() {
        this._orderedProcessingList = this.deriveProcessingOrder();
        if (FlowForge._globalDebugMode) {
            console.log("Processing sequence updated.");
        }
    }

    /**
     * Performs a topological sort to determine the optimal execution order of components.
     * This ensures that components are processed only after their input dependencies are met.
     *
     * @returns {Array<Object>} An array of component instances in topological order.
     * @private
     */
    deriveProcessingOrder() {
        const sortedComponents = [];
        const initialCandidates = [];
        const componentInputCounts = new Map(); // Tracks how many incoming links each component still expects
        const componentMap = new Map(); // Maps component ID to component instance

        // Initialize maps and find initial candidates (components with no active inputs)
        for (const component of this._workflowComponents) {
            componentMap.set(component.id, component);
            let activeInputs = 0;
            if (Array.isArray(component.inputs)) {
                for (const inputPort of component.inputs) {
                    if (inputPort && inputPort.link !== null) {
                        activeInputs++;
                    }
                }
            }
            componentInputCounts.set(component.id, activeInputs);

            if (activeInputs === 0) {
                initialCandidates.push(component);
            }
        }

        const processingQueue = [...initialCandidates]; // Use a queue for breadth-first processing
        const processedConnections = new Set(); // To avoid processing the same connection multiple times

        while (processingQueue.length > 0) {
            const currentComponent = processingQueue.shift();
            sortedComponents.push(currentComponent);

            // Iterate through currentComponent's outputs to find dependent components
            if (Array.isArray(currentComponent.outputs)) {
                for (const outputPort of currentComponent.outputs) {
                    if (!outputPort || !Array.isArray(outputPort.links) || outputPort.links.length === 0) {
                        continue; // No connections from this output port
                    }

                    for (const connectionId of outputPort.links) {
                        if (processedConnections.has(connectionId)) {
                            continue; // Already handled this connection
                        }
                        processedConnections.add(connectionId);

                        const connection = this._workflowConnections.get(connectionId);
                        if (!connection) {
                            console.warn(`Connection with ID ${connectionId} not found.`);
                            continue;
                        }

                        const targetComponent = componentMap.get(connection.target_id);
                        if (!targetComponent) {
                            console.warn(`Target component with ID ${connection.target_id} for connection ${connectionId} not found.`);
                            continue;
                        }

                        // Decrement the input count for the target component
                        const remainingInputs = componentInputCounts.get(targetComponent.id) - 1;
                        componentInputCounts.set(targetComponent.id, remainingInputs);

                        // If the target component now has no pending inputs, add it to the queue
                        if (remainingInputs === 0) {
                            processingQueue.push(targetComponent);
                        }
                    }
                }
            }
        }

        // Basic cycle detection: If not all components are in the sorted list, there's a cycle
        if (sortedComponents.length !== this._workflowComponents.length) {
            console.warn("Workflow contains a cycle or unreachable components. Topological sort incomplete.");
            // For a Type III clone, one might add more sophisticated cycle reporting or breaking
        }

        return sortedComponents;
    }

    /**
     * Broadcasts a custom event to all components in the workflow.
     * Components with a corresponding method (e.g., `onStart`, `onExecute`) will have it invoked.
     *
     * @param {string} eventName - The name of the event to broadcast (e.g., "onStart", "onExecute").
     * @param {...any} args - Additional arguments to pass to the event handler function.
     * @private
     */
    _broadcastComponentEvent(eventName, ...args) {
        for (const component of this._workflowComponents) {
            if (typeof component[eventName] === 'function') {
                try {
                    component[eventName](...args);
                } catch (e) {
                    console.error(`Error in component '${component.title}' during event '${eventName}':`, e);
                    if (FlowForge._strictErrorHandling) {
                        throw e; // Re-throw if strict error handling is enabled
                    }
                }
            }
        }
    }

    /**
     * Notifies all attached visualizer panels about a significant change in the graph structure.
     *
     * @private
     */
    _triggerGraphChange() {
        if (typeof this.onGraphStructureChange === 'function') {
            this.onGraphStructureChange();
        }
        this._broadcastToVisualizers("change"); // Assuming visualizers have a "change" event handler
    }

    /**
     * Sends a specific action/event to all attached visualizer panels.
     *
     * @param {string} actionName - The name of the action to send.
     * @param {...any} args - Arguments to pass with the action.
     * @private
     */
    _broadcastToVisualizers(actionName, ...args) {
        for (const visualizer of this._attachedVisualizers) {
            if (typeof visualizer.onGraphAction === 'function') {
                visualizer.onGraphAction(actionName, ...args);
            }
        }
    }

    // Placeholder for getting a component by ID (used in deriveProcessingOrder)
    getComponentById(componentId) {
        return this._componentsById.get(componentId);
    }

    // Example of adding a component (simplified, real implementation would be more complex)
    addComponent(component) {
        if (!component || !component.id) {
            component.id = ++this._lastComponentId; // Assign a new ID
        }
        this._workflowComponents.push(component);
        this._componentsById.set(component.id, component);
        this._triggerGraphChange();
        return component;
    }

    // Example of adding a connection (simplified)
    addConnection(connection) {
        if (!connection || !connection.id) {
            connection.id = ++this._lastConnectionId;
        }
        this._workflowConnections.set(connection.id, connection);
        this._triggerGraphChange();
        return connection;
    }
}