(function (utilLib, frameLib) {

    const stdArraySlice = Array.prototype.slice;

    function invokeWithArguments(func, context, argArray) {
        return argArray.length <= 4 ?
            func.call(context, argArray[0], argArray[1], argArray[2], argArray[3]) :
            func.apply(context, argArray);
    }

    function extractRange(source, startIdx) {
        return stdArraySlice.call(source, startIdx);
    }

    function isObjectEmpty(obj) {
        return Object.keys(obj).length === 0;
    }

    function verifyPropertyExistence(target, ...keysToCheck) {
        if (target == null) return false;
        if (!Array.isArray(keysToCheck[0])) {
            keysToCheck = extractRange(arguments, 1);
        }
        return keysToCheck.every(key => key in target);
    }

    const getExecutionBlockIdentifier = (() => {
        let blockActivityFlag = false;
        let currentBlockIdentity = -1;
        function cycleBlockIdentity() {
            currentBlockIdentity++;
            blockActivityFlag = true;
            Promise.resolve().then(() => {
                blockActivityFlag = false;
            });
        }
        return () => {
            if (!blockActivityFlag) {
                cycleBlockIdentity();
            }
            return currentBlockIdentity;
        };
    })();

    class EventDispatcher {
        constructor() {
            this.listeners = {};
        }
        on(eventName, handler) {
            if (!this.listeners[eventName]) this.listeners[eventName] = [];
            this.listeners[eventName].push(handler);
        }
        off(eventName, handler) {
            if (this.listeners[eventName]) {
                this.listeners[eventName] = this.listeners[eventName].filter(l => l !== handler);
            }
        }
        trigger(eventName, ...args) {
            if (this.listeners[eventName]) {
                this.listeners[eventName].forEach(handler => handler(...args));
            }
        }
    }

    class EntityTracker {
        constructor() {
            this.trackedCidEntities = new Map();
            this.trackedPlainEntities = new Set();
        }
        checkPresence(entity) {
            if (!entity) return false;
            if (entity.cid) {
                return this.trackedCidEntities.has(entity.cid);
            } else {
                return this.trackedPlainEntities.has(entity);
            }
        }
        placeEntity(entity) {
            if (!this.checkPresence(entity)) {
                if (entity && entity.cid) {
                    this.trackedCidEntities.set(entity.cid, entity);
                } else {
                    this.trackedPlainEntities.add(entity);
                }
                return true;
            }
            return false;
        }
        removeEntity(entity) {
            if (this.checkPresence(entity)) {
                if (entity && entity.cid) {
                    this.trackedCidEntities.delete(entity.cid);
                } else {
                    this.trackedPlainEntities.delete(entity);
                }
                return true;
            }
            return false;
        }
        retrieveAll() {
            return Array.from(this.trackedCidEntities.values()).concat(Array.from(this.trackedPlainEntities.values()));
        }
    }

    function manageEntityListeners(activityType, targetEntities, eventHandler, handlerContext) {
        for (let i = 0, l = targetEntities.length, currentEntity; i < l; i++) {
            currentEntity = targetEntities[i];
            if (!currentEntity) continue;
            if (activityType === "on") {
                if (!handlerContext.objectRegistry.placeEntity(currentEntity)) {
                    continue;
                }
            } else {
                if (!handlerContext.objectRegistry.removeEntity(currentEntity)) {
                    continue;
                }
            }
            if (typeof currentEntity[activityType] === 'function') {
                currentEntity[activityType]("all", eventHandler, handlerContext);
            }
        }
    }

    function executeOperation(operationDirection, operationRecord) {
        const recordType = operationRecord.recordType;
        const operationDefinitions = operationRecord.operationDefinitions;
        const operationFunction = !operationDefinitions[recordType] || operationDefinitions[recordType][operationDirection];
        if (typeof operationFunction === 'function') {
            operationFunction(operationRecord.entity, operationRecord.previous, operationRecord.current, operationRecord.settings);
        }
    }

    function processHistoryOperations(direction, controller, historySequence, groupRelated, allEntries) {
        if (historySequence.processing ||
            (direction === "revert" && historySequence.cursor === -1) ||
            (direction === "restore" && historySequence.cursor === historySequence.recordCount - 1)) {
            return;
        }
        historySequence.processing = true;
        let currentRecord;
        let recordsToProcess;
        const isRevert = direction === "revert";

        if (allEntries) {
            recordsToProcess = isRevert && historySequence.cursor === historySequence.recordCount - 1 ||
                               !isRevert && historySequence.cursor === -1 ?
                               historySequence.allRecords :
                               stdArraySlice.apply(historySequence.records, isRevert ? [0, historySequence.cursor + 1] : [historySequence.cursor + 1, historySequence.recordCount]);
        } else {
            currentRecord = historySequence.getRecordAt(isRevert ? historySequence.cursor : historySequence.cursor + 1);
            recordsToProcess = groupRelated ? historySequence.findRecordsBy("executionBlockId", currentRecord.executionBlockId) : [currentRecord];
        }

        historySequence.cursor += (isRevert ? -1 : 1) * recordsToProcess.length;
        while (currentRecord = isRevert ? recordsToProcess.pop() : recordsToProcess.shift()) {
            currentRecord[direction]();
        }
        historySequence.processing = false;

        controller.trigger(direction, controller);
    }

    function determineOperationValidity(operationDefinition, eventArguments) {
        const creationCondition = operationDefinition.creationCondition;
        const conditionType = typeof creationCondition;
        return conditionType === "function" ? !!invokeWithArguments(creationCondition, operationDefinition, eventArguments) :
            conditionType === "boolean" ? creationCondition : true;
    }

    function recordOperationToHistory(historySequence, operationKind, eventArguments, operationDefinitions) {
        if (historySequence.trackChanges && !historySequence.processing && operationKind in operationDefinitions &&
            determineOperationValidity(operationDefinitions[operationKind], eventArguments)) {

            const processedData = invokeWithArguments(operationDefinitions[operationKind]["capture"], operationDefinitions[operationKind], eventArguments);
            if (verifyPropertyExistence(processedData, "entity", "previous", "current")) {
                processedData.recordType = operationKind;
                processedData.executionBlockId = getExecutionBlockIdentifier();
                processedData.operationDefinitions = operationDefinitions;
                processedData.revert = function() { executeOperation("revert", this); };
                processedData.restore = function() { executeOperation("restore", this); };

                if (historySequence.cursor < historySequence.recordCount - 1) {
                    let excessRecords = historySequence.recordCount - historySequence.cursor - 1;
                    while (excessRecords--) {
                        historySequence.removeLastRecord();
                    }
                }
                historySequence.cursor = historySequence.recordCount;
                historySequence.addRecord(processedData);
                if (historySequence.recordCount > historySequence.maxCapacity) {
                    historySequence.removeFirstRecord();
                    historySequence.cursor--;
                }
            }
        }
    }

    const DefaultOperationHandlers = {
        "add_item": {
            "revert": function (container, ignore, item, config) {
                container.remove(item, config);
            },
            "restore": function (container, ignore, item, config) {
                if (config.pos) {
                    config.at = config.pos;
                }
                container.add(item, config);
            },
            "capture": function (item, container, config) {
                return {
                    entity: container,
                    previous: undefined,
                    current: item,
                    settings: { ...config }
                };
            }
        },
        "remove_item": {
            "revert": function (container, item, ignore, config) {
                if ("pos" in config) {
                    config.at = config.pos;
                }
                container.add(item, config);
            },
            "restore": function (container, item, ignore, config) {
                container.remove(item, config);
            },
            "capture": function (item, container, config) {
                return {
                    entity: container,
                    previous: item,
                    current: undefined,
                    settings: { ...config }
                };
            }
        },
        "modify_props": {
            "revert": function (item, previous, current, config) {
                if (isObjectEmpty(previous)) {
                    Object.keys(current).forEach(item.unset, item);
                } else {
                    item.set(previous);
                    if (config && config.removedPropData && config.removedPropData.pre && config.removedPropData.pre.length) {
                        config.removedPropData.pre.forEach(item.unset, item);
                    }
                }
            },
            "restore": function (item, previous, current, config) {
                if (isObjectEmpty(current)) {
                    Object.keys(previous).forEach(item.unset, item);
                } else {
                    item.set(current);
                    if (config && config.removedPropData && config.removedPropData.post && config.removedPropData.post.length) {
                        config.removedPropData.post.forEach(item.unset, item);
                    }
                }
            },
            "capture": function (item, config) {
                const updatedAttributes = item.changedAttributes();
                const updatedKeys = Object.keys(updatedAttributes);
                const formerAttributes = {};
                for(const key of updatedKeys) {
                    formerAttributes[key] = item.previous(key);
                }
                const formerKeys = Object.keys(formerAttributes);
                const removedPropData = (config || (config = {})).removedPropData = {
                    post: [],
                    pre: []
                };

                if (updatedKeys.length !== formerKeys.length) {
                    if (updatedKeys.length > formerKeys.length) {
                        updatedKeys.forEach(val => {
                            if (!(val in formerAttributes)) {
                                removedPropData.pre.push(val);
                            }
                        });
                    } else {
                        formerKeys.forEach(val => {
                            if (!(val in updatedAttributes)) {
                                removedPropData.post.push(val);
                            }
                        });
                    }
                }
                return {
                    entity: item,
                    previous: formerAttributes,
                    current: updatedAttributes,
                    settings: { ...config }
                };
            }
        },
        "clear_all": {
            "revert": function (container, previous, current) {
                container.reset(previous);
            },
            "restore": function (container, previous, current) {
                container.reset(current);
            },
            "capture": function (container, config) {
                return {
                    entity: container,
                    previous: config.priorItems,
                    current: [...container.models]
                };
            }
        }
    };

    class CustomOperationHandlers extends null {
        constructor() {
            super();
            Object.setPrototypeOf(this, DefaultOperationHandlers);
        }
    }

    function modifyOperationDefinition(modificationKind, definitionKey, definitionFunctions, handlerContainer) {
        if (typeof definitionKey === 'object') {
            if (Array.isArray(definitionKey)) {
                modificationKind = 2; // Force remove if array
                definitionKey.forEach(key => modifyOperationDefinition(modificationKind, key, null, handlerContainer));
            } else { // Bulk object
                for (const key in definitionKey) {
                    if (Object.prototype.hasOwnProperty.call(definitionKey, key)) {
                        modifyOperationDefinition(modificationKind, key, definitionKey[key], handlerContainer);
                    }
                }
            }
            return;
        }

        switch (modificationKind) {
            case 0: // Add
                handlerContainer[definitionKey] = definitionFunctions;
                break;
            case 1: // Change/Update
                if (handlerContainer[definitionKey]) {
                    Object.assign(handlerContainer[definitionKey], definitionFunctions);
                } else {
                    handlerContainer[definitionKey] = definitionFunctions; // Add if not exists
                }
                break;
            case 2: // Remove
                delete handlerContainer[definitionKey];
                break;
        }
    }

    class HistorySequence {
        constructor(maxLen) {
            this.records = [];
            this.cursor = -1;
            this.processing = false;
            this.maxCapacity = maxLen || 100;
            this.trackChanges = true;
        }
        getRecordAt(index) {
            return this.records[index];
        }
        addRecord(recordData) {
            this.records.push(recordData);
        }
        removeLastRecord() {
            return this.records.pop();
        }
        removeFirstRecord() {
            return this.records.shift();
        }
        get recordCount() {
            return this.records.length;
        }
        findRecordsBy(property, value) {
            return this.records.filter(r => r[property] === value);
        }
        get allRecords() {
            return [...this.records];
        }
    }

    class LogicFlowReversionController extends EventDispatcher {
        constructor(maxHistoryLength) {
            super();
            this.historySequence = new HistorySequence(maxHistoryLength);
            this.activeEntities = new EntityTracker();
            this.operationHandlers = new CustomOperationHandlers();
            this.boundEventHandler = this._handleEntityEvent.bind(this);
        }

        beginTracking() {
            this.historySequence.trackChanges = true;
        }
        endTracking() {
            this.historySequence.trackChanges = false;
        }
        revertLast(groupRelated = false, all = false) {
            processHistoryOperations("revert", this, this.historySequence, groupRelated, all);
        }
        restoreNext(groupRelated = false, all = false) {
            processHistoryOperations("restore", this, this.historySequence, groupRelated, all);
        }
        addOperationHandler(key, functions) {
            modifyOperationDefinition(0, key, functions, this.operationHandlers);
        }
        removeOperationHandler(key) {
            modifyOperationDefinition(2, key, null, this.operationHandlers);
        }
        updateOperationHandler(key, functions) {
            modifyOperationDefinition(1, key, functions, this.operationHandlers);
        }
        registerReversible(entities) {
            manageEntityListeners("on", Array.isArray(entities) ? entities : [entities], this.boundEventHandler, {objectRegistry: this.activeEntities});
        }
        unregisterReversible(entities) {
            manageEntityListeners("off", Array.isArray(entities) ? entities : [entities], this.boundEventHandler, {objectRegistry: this.activeEntities});
        }
        _handleEntityEvent(eventName, ...args) {
            if (!this.historySequence.trackChanges || this.historySequence.processing) return;
            recordOperationToHistory(this.historySequence, eventName, args, this.operationHandlers);
        }
    }

    const createReversionManager = function(utilityLib, frameworkLib) {
        return LogicFlowReversionController;
    };

    if (typeof define === "function" && define.amd) {
        define(["underscore", "backbone"], createReversionManager);
    } else if (typeof exports !== 'undefined') {
        module.exports = createReversionManager;
    } else {
        if (frameLib && frameLib.Undo) {
            frameLib.Undo.Manager = createReversionManager(utilLib, frameLib);
        } else if (typeof window !== 'undefined') {
             window.LogicFlowReversion = window.LogicFlowReversion || {};
             window.LogicFlowReversion.Manager = createReversionManager(utilLib, frameLib);
        }
    }

})((typeof _ !== 'undefined' ? _ : null), (typeof Backbone !== 'undefined' ? Backbone : null));