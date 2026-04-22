function CoreUnitPrototype(label = "") {
    this.unitLabel = label;
    this.configData = {};
    this.statusFlags = {};
    this.dimensions = [0, 0];
    this.coordinates = [0, 0];
    this.unitId = 0;

    this.inputTerminals = [];
    this.outputTerminals = [];
}

CoreUnitPrototype.prototype.calculateDimensions = function() {
    return [FlowEngine.getSystemConfiguration('elementWidthDefault'), FlowEngine.getSystemConfiguration('elementHeightPrimary')];
};

CoreUnitPrototype.prototype.beginOperation = function() {};
CoreUnitPrototype.prototype.terminateOperation = function() {};
CoreUnitPrototype.prototype.processCycle = function() {};

const FlowEngine = (function() {
    const systemSettings = {
        elementHeightPrimary: 16,
        elementHeightSecondary: 15,
        elementWidthDefault: 140,
        elementWidthMin: 50,
        elementCollapseRadius: 10,
        elementCollapsedWidth: 80,
        canvasGridSpacing: 10,
        elementTitleColor: "#222",
        elementDefaultColor: "#999",
        elementDefaultBackgroundColor: "#444",
        elementDefaultBorderColor: "#AEF",
        elementDefaultVisual: "box",
        maximumElementCount: 1000,
        initialPlacement: [100, 100],
        assetDirectory: "",
        proxyTarget: null,
        debugMode: false,
        propagateErrors: true
    };

    class BlueprintRepository {
        constructor() {
            this.definitions = new Map();
        }

        enrollBlueprint(identifier, blueprintClass) {
            if (typeof blueprintClass !== 'function' || !blueprintClass.prototype) {
                throw new Error("Blueprint must be a class with a prototype.");
            }

            blueprintClass.prototype.blueprintIdentifier = identifier;
            const pathSegments = identifier.split("/");
            blueprintClass.prototype.blueprintCategory = pathSegments.length > 1 ? pathSegments.slice(0, pathSegments.length - 1).join("/") : "";

            if (typeof CoreUnitPrototype !== 'undefined') {
                for (const prop in CoreUnitPrototype.prototype) {
                    if (prop !== 'constructor' && !Object.prototype.hasOwnProperty.call(blueprintClass.prototype, prop)) {
                        blueprintClass.prototype[prop] = CoreUnitPrototype.prototype[prop];
                    }
                }
            }

            this.definitions.set(identifier, blueprintClass);
            if (systemSettings.debugMode) {
                console.log("Blueprint registered: " + identifier);
            }
        }

        instantiateUnit(identifier, unitLabel, unitOptions) {
            const blueprintClass = this.definitions.get(identifier);
            if (!blueprintClass) {
                if (systemSettings.debugMode) {
                    console.log("Blueprint type \"" + identifier + "\" not found.");
                }
                return null;
            }

            const activeLabel = unitLabel || blueprintClass.title || identifier;
            const newUnit = new blueprintClass(activeLabel);

            newUnit.blueprintIdentifier = identifier;
            if (!newUnit.unitLabel) newUnit.unitLabel = activeLabel;
            if (!newUnit.configData) newUnit.configData = {};
            if (!newUnit.statusFlags) newUnit.statusFlags = {};
            if (!newUnit.dimensions || (newUnit.dimensions[0] === 0 && newUnit.dimensions[1] === 0)) {
                newUnit.dimensions = newUnit.calculateDimensions ? newUnit.calculateDimensions() : [systemSettings.elementWidthDefault, systemSettings.elementHeightPrimary];
            }
            if (!newUnit.coordinates || (newUnit.coordinates[0] === 0 && newUnit.coordinates[1] === 0)) {
                newUnit.coordinates = [...systemSettings.initialPlacement];
            }

            if (unitOptions) {
                Object.assign(newUnit, unitOptions);
            }

            return newUnit;
        }

        fetchBlueprint(identifier) {
            return this.definitions.get(identifier);
        }

        queryBlueprintsByCategory(categoryFilter) {
            const results = [];
            for (const blueprintClass of this.definitions.values()) {
                const blueprintCategory = blueprintClass.prototype.blueprintCategory || "";
                if (categoryFilter === "" && blueprintCategory === "") {
                    results.push(blueprintClass);
                } else if (blueprintCategory === categoryFilter) {
                    results.push(blueprintClass);
                }
            }
            return results;
        }

        listAllCategories() {
            const uniqueCategories = new Set([""]);
            for (const blueprintClass of this.definitions.values()) {
                if (blueprintClass.prototype.blueprintCategory && !blueprintClass.skipCategoryListing) {
                    uniqueCategories.add(blueprintClass.prototype.blueprintCategory);
                }
            }
            return Array.from(uniqueCategories);
        }
    }

    const blueprintStore = new BlueprintRepository();

    const auxiliaryUtilities = {
        deepDuplicate: function(originalObject, targetObject) {
            if (originalObject === null || typeof originalObject !== 'object') return originalObject;
            const cloned = JSON.parse(JSON.stringify(originalObject));
            if (!targetObject) return cloned;
            Object.assign(targetObject, cloned);
            return targetObject;
        },

        getPreciseTime: function() {
            return typeof performance !== "undefined" ? performance.now() : Date.now();
        }
    };

    return {
        getSystemConfiguration: (key) => systemSettings[key],
        setSystemConfiguration: (key, value) => { systemSettings[key] = value; },

        enrollProcessorBlueprint: (id, cls) => blueprintStore.enrollBlueprint(id, cls),
        fabricateProcessorInstance: (id, label, opts) => blueprintStore.instantiateUnit(id, label, opts),
        retrieveProcessorBlueprint: (id) => blueprintStore.fetchBlueprint(id),
        queryProcessorBlueprintsByCategory: (cat) => blueprintStore.queryBlueprintsByCategory(cat),
        listProcessorCategories: () => blueprintStore.listAllCategories(),

        duplicateDataStructure: auxiliaryUtilities.deepDuplicate,
        getPreciseTime: auxiliaryUtilities.getPreciseTime,

        enableSystemDebugging: () => { systemSettings.debugMode = true; },
        disableSystemDebugging: () => { systemSettings.debugMode = false; },
        configureErrorPropagation: (shouldThrow) => { systemSettings.propagateErrors = shouldThrow; },

        setGlobalProxy: (handler) => { systemSettings.proxyTarget = handler; },
        getGlobalProxy: () => systemSettings.proxyTarget
    };
})();

function FlowVisualizer() {
    this.linkedGraph = null;
}
FlowVisualizer.prototype.notifyClear = function() {};
FlowVisualizer.prototype.notifyChange = function() {};

function ComputationGraph() {
    if (FlowEngine.getSystemConfiguration('debugMode')) {
        console.log("Computation graph initialized.");
    }
    this.visualizerInstances = null;
    this.resetFlowState();
}

ComputationGraph.allowedDataTypes = ["numeric", "text", "binary", "any"];

ComputationGraph.prototype.getAllowedTypes = function() {
    return this.allowedDataTypes || ComputationGraph.allowedDataTypes;
};

ComputationGraph.EXEC_STATE_IDLE = 1;
ComputationGraph.EXEC_STATE_ACTIVE = 2;

ComputationGraph.prototype.resetFlowState = function() {
    this.haltExecution();
    this.executionState = ComputationGraph.EXEC_STATE_IDLE;
    this.nextUnitId = 0;

    this.activeUnits = [];
    this.unitsById = {};

    this.nextConnectionId = 0;
    this.connections = {};

    this.cycleCount = 0;

    this.flowConfiguration = {};

    this.totalRuntime = 0;
    this.activeRuntime = 0;
    this.fixedTimeCounter = 0;
    this.fixedTimeStep = 0.01;
    this.lastCycleDuration = 0.01;
    this.startTimeRef = 0;

    this.systemInputs = {};
    this.systemOutputs = {};

    this.graphDebugEnabled = true;

    this.signalStateChange();

    this.sendNotificationToVisualizers("clear");
};

ComputationGraph.prototype.connectVisualizer = function(visualizerInstance) {
    if (!(visualizerInstance instanceof FlowVisualizer)) {
        throw new Error("connectVisualizer expects a FlowVisualizer instance.");
    }
    if (visualizerInstance.linkedGraph && visualizerInstance.linkedGraph !== this) {
        visualizerInstance.linkedGraph.disconnectVisualizer(visualizerInstance);
    }

    visualizerInstance.linkedGraph = this;
    if (!this.visualizerInstances) {
        this.visualizerInstances = [];
    }
    this.visualizerInstances.push(visualizerInstance);
};

ComputationGraph.prototype.disconnectVisualizer = function(visualizerInstance) {
    if (!this.visualizerInstances) return;
    const index = this.visualizerInstances.indexOf(visualizerInstance);
    if (index === -1) return;
    visualizerInstance.linkedGraph = null;
    this.visualizerInstances.splice(index, 1);
};

ComputationGraph.prototype.sendNotificationToVisualizers = function(actionName) {
    if (!this.visualizerInstances) return;
    for (const viz of this.visualizerInstances) {
        const methodName = `notify${actionName.charAt(0).toUpperCase() + actionName.slice(1)}`;
        if (typeof viz[methodName] === 'function') {
            viz[methodName]();
        }
    }
};

ComputationGraph.prototype.dispatchUnitEvent = function(eventName) {
    for (const unit of this.activeUnits) {
        if (typeof unit[eventName] === 'function') {
            unit[eventName]();
        }
    }
};

ComputationGraph.prototype.initiateExecution = function(intervalDuration) {
    if (this.executionState === ComputationGraph.EXEC_STATE_ACTIVE) return;
    this.executionState = ComputationGraph.EXEC_STATE_ACTIVE;

    if (this.onFlowStart) {
        this.onFlowStart();
    }

    this.dispatchUnitEvent("beginOperation");

    this.startTimeRef = FlowEngine.getPreciseTime();
    const cycleInterval = intervalDuration || 1;
    const self = this;

    this.executionLoopHandle = setInterval(function() {
        self.advanceExecutionCycles(1);
    }, cycleInterval);
};

ComputationGraph.prototype.haltExecution = function() {
    if (this.executionState === ComputationGraph.EXEC_STATE_IDLE) {
        return;
    }

    this.executionState = ComputationGraph.EXEC_STATE_IDLE;

    if (this.onFlowStop) {
        this.onFlowStop();
    }

    if (this.executionLoopHandle !== null) {
        clearInterval(this.executionLoopHandle);
    }
    this.executionLoopHandle = null;

    this.dispatchUnitEvent("terminateOperation");
};

ComputationGraph.prototype.advanceExecutionCycles = function(numberOfCycles) {
    const cycles = numberOfCycles || 1;

    const cycleStartTime = FlowEngine.getPreciseTime();
    this.totalRuntime = 0.001 * (cycleStartTime - this.startTimeRef);

    try {
        for (let k = 0; k < cycles; k++) {
            this.dispatchUnitEvent("processCycle");
            this.fixedTimeCounter += this.fixedTimeStep;
            if (this.onCycleAdvance) {
                this.onCycleAdvance();
            }
        }

        if (this.onPostCycle) {
            this.onPostCycle();
        }
        this.executionErrorOccurred = false;
    } catch (err) {
        this.executionErrorOccurred = true;
        if (FlowEngine.getSystemConfiguration('propagateErrors')) {
            throw err;
        }
        if (FlowEngine.getSystemConfiguration('debugMode')) {
            console.log("Error during execution cycle: " + err);
        }
        this.haltExecution();
    }

    const duration = FlowEngine.getPreciseTime() - cycleStartTime;
    this.lastCycleDuration = duration === 0 ? 0.001 : 0.001 * duration;
    this.totalRuntime += this.lastCycleDuration;
    this.cycleCount += 1;
};

ComputationGraph.prototype.refreshProcessingOrder = function() {
    this.orderedProcessingUnits = this.deriveProcessingSequence();
};

ComputationGraph.prototype.deriveProcessingSequence = function() {
    const orderedSequence = [];
    const initialUnits = [];
    const pendingUnits = {};
    const processedConnections = {};
    const incomingConnectionCounts = {};

    for (const unit of this.activeUnits) {
        pendingUnits[unit.unitId] = unit;

        let inputLinkCount = 0;
        if (unit.inputTerminals) {
            for (const terminal of unit.inputTerminals) {
                if (terminal && terminal.connectedLink !== null) {
                    inputLinkCount += 1;
                }
            }
        }

        if (inputLinkCount === 0) {
            initialUnits.push(unit);
        } else {
            incomingConnectionCounts[unit.unitId] = inputLinkCount;
        }
    }

    while (initialUnits.length > 0) {
        const currentUnit = initialUnits.shift();
        orderedSequence.push(currentUnit);
        delete pendingUnits[currentUnit.unitId];

        if (currentUnit.outputTerminals) {
            for (const outputTerminal of currentUnit.outputTerminals) {
                if (!outputTerminal || !outputTerminal.outgoingLinks || outputTerminal.outgoingLinks.length === 0) {
                    continue;
                }

                for (const connectionId of outputTerminal.outgoingLinks) {
                    const connection = this.connections[connectionId];
                    if (!connection) continue;

                    if (processedConnections[connection.connectionId]) {
                        continue;
                    }

                    const destinationUnit = this.getUnitById(connection.destinationUnitId);
                    if (!destinationUnit) {
                        processedConnections[connection.connectionId] = true;
                        continue;
                    }

                    incomingConnectionCounts[destinationUnit.unitId] = (incomingConnectionCounts[destinationUnit.unitId] || 0) - 1;

                    if (incomingConnectionCounts[destinationUnit.unitId] <= 0) {
                        initialUnits.push(destinationUnit);
                        delete incomingConnectionCounts[destinationUnit.unitId];
                    }
                    processedConnections[connection.connectionId] = true;
                }
            }
        }
    }

    return orderedSequence;
};

ComputationGraph.prototype.getUnitById = function(id) {
    return this.unitsById[id];
};

ComputationGraph.prototype.signalStateChange = function() {
    if (FlowEngine.getSystemConfiguration('debugMode')) {
        console.log("Graph state changed.");
    }
    this.sendNotificationToVisualizers("change");
};

ComputationGraph.prototype.addUnit = function(unit) {
    if (!unit.unitId) {
        unit.unitId = ++this.nextUnitId;
    }
    this.activeUnits.push(unit);
    this.unitsById[unit.unitId] = unit;
    this.signalStateChange();
    return unit;
};

ComputationGraph.prototype.addConnection = function(sourceUnit, outputIndex, destinationUnit, inputIndex, dataType) {
    const newConnection = {
        connectionId: ++this.nextConnectionId,
        sourceUnitId: sourceUnit.unitId,
        sourceTerminalIndex: outputIndex,
        destinationUnitId: destinationUnit.unitId,
        destinationTerminalIndex: inputIndex,
        dataType: dataType || null
    };

    this.connections[newConnection.connectionId] = newConnection;

    if (!sourceUnit.outputTerminals[outputIndex]) {
        sourceUnit.outputTerminals[outputIndex] = { outgoingLinks: [] };
    }
    if (!sourceUnit.outputTerminals[outputIndex].outgoingLinks) {
        sourceUnit.outputTerminals[outputIndex].outgoingLinks = [];
    }
    sourceUnit.outputTerminals[outputIndex].outgoingLinks.push(newConnection.connectionId);

    if (!destinationUnit.inputTerminals[inputIndex]) {
        destinationUnit.inputTerminals[inputIndex] = {};
    }
    destinationUnit.inputTerminals[inputIndex].connectedLink = newConnection.connectionId;

    this.signalStateChange();
    return newConnection;
};