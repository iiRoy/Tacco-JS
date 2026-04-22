class DataAnalysisKit {
    constructor() {
        this.kitVersion = "1.0.0";

        this._initializeTimeServices();
        this._configureArrayAdapters();
        this._patchDomElementMethods();

        this.orderAscending = this._produceAscendingComparison();
        this.orderDescending = this._produceDescendingComparison();
        this.findMinimum = this._createMinFinder();
        this.findMaximum = this._createMaxFinder();
        this.calculateRange = this._createExtentCalculator();
        this.computeTotal = this._createSumAggregator();
        this.computeAverage = this._createMeanCalculator();
        this.determineQuantile = this._createQuantileEstimator();
        this.findMedian = this._createMedianFinder();

        this.binarySearchHelper = this._createBisectorMechanism();
        this.leftmostSearch = this.binarySearchHelper((v) => v).seekLeftBoundary;
        this.rightmostSearch = this.binarySearchHelper((v) => v).seekRightBoundary;
        this.rearrangeRandomly = this._createShuffleAlgorithm();
        this.extractPermuted = this._createPermutationExtractor();
        this.createPairs = this._createPairGenerator();
        this.alignColumns = this._createColumnZipper();
        this.flipMatrix = this._createMatrixTransposer();
        this.getObjectKeys = this._createKeyLister();
        this.getObjectValues = this._createValueLister();
        this.getObjectEntries = this._createEntryLister();
        this.flattenArrays = this._createArrayFlattener();
        this.generateSequence = this._createNumberSequenceGenerator();

        this.createCustomMap = this._createMapCreator();
        this.createCustomSet = this._createSetCreator();
        this.createNestingTool = this._createNestingBuilder();

        this.eventUtilities = {};
        this.redirectMethods = this._createMethodRelinker();
        this.notificationSystem = this._createEventDispatcher();
        this.currentEvent = null;

        this.domQuery = this._createDomAccessors();
        this.selectionManager = this._createSelectionController();

        this.escapeRegex = this._generateRegexEscaper();
    }

    _initializeTimeServices() {
        if (!Date.now) {
            Object.defineProperty(Date, 'now', {
                value: () => new Date().valueOf(),
                writable: true,
                configurable: true
            });
        }
    }

    _configureArrayAdapters() {
        const nativeArraySlice = Array.prototype.slice;
        let flexibleArrayConverter = function(sourceCollection) {
            return nativeArraySlice.call(sourceCollection);
        };

        try {
            if (typeof document !== 'undefined' && document.documentElement && document.documentElement.childNodes) {
                nativeArraySlice.call(document.documentElement.childNodes, 0, 1)[0].nodeType;
            }
        } catch (error) {
            flexibleArrayConverter = function(sourceCollection) {
                const collectionSize = sourceCollection.length;
                const resultingArray = new Array(collectionSize);
                let currentPos = collectionSize;
                while (currentPos--) {
                    resultingArray[currentPos] = sourceCollection[currentPos];
                }
                return resultingArray;
            };
        }
        this._arrayConversionHelper = flexibleArrayConverter;
    }

    _patchDomElementMethods() {
        if (typeof window === 'undefined' || !window.Element || !window.CSSStyleDeclaration) {
            return;
        }

        const elementProto = window.Element.prototype;
        const styleProto = window.CSSStyleDeclaration.prototype;

        let needsValueStringification = false;
        try {
            const tempDiv = document.createElement("temp-test-element");
            tempDiv.style.setProperty("test-property", 0, "");
        } catch (error) {
            needsValueStringification = true;
        }

        if (needsValueStringification) {
            const originalSetAttribute = elementProto.setAttribute;
            const originalSetAttributeNS = elementProto.setAttributeNS;
            const originalSetProperty = styleProto.setProperty;

            Object.defineProperties(elementProto, {
                setAttribute: {
                    value: function(nameStr, val) {
                        originalSetAttribute.call(this, nameStr, String(val));
                    },
                    writable: true,
                    configurable: true
                },
                setAttributeNS: {
                    value: function(ns, nameStr, val) {
                        originalSetAttributeNS.call(this, ns, nameStr, String(val));
                    },
                    writable: true,
                    configurable: true
                }
            });

            Object.defineProperty(styleProto, 'setProperty', {
                value: function(nameStr, val, priorityStr) {
                    originalSetProperty.call(this, nameStr, String(val), priorityStr);
                },
                writable: true,
                configurable: true
            });
        }
    }

    _produceAscendingComparison() {
        return (val1, val2) => {
            if (val1 < val2) return -1;
            if (val1 > val2) return 1;
            if (val1 >= val2) return 0;
            return NaN;
        };
    }

    _produceDescendingComparison() {
        return (val1, val2) => {
            if (val2 < val1) return -1;
            if (val2 > val1) return 1;
            if (val2 >= val1) return 0;
            return NaN;
        };
    }

    _isValidNumerical(value) {
        return value != null && !Number.isNaN(value);
    }

    _createMinFinder() {
        return (collection, valueExtractor) => {
            if (!Array.isArray(collection) || collection.length === 0) {
                return undefined;
            }

            const accessor = typeof valueExtractor === 'function' ? valueExtractor : (d) => d;
            let currentMinimum = undefined;
            let firstValidEncountered = false;

            for (let i = 0; i < collection.length; i++) {
                const itemValue = accessor(collection[i], i, collection);
                if (this._isValidNumerical(itemValue)) {
                    if (!firstValidEncountered) {
                        currentMinimum = itemValue;
                        firstValidEncountered = true;
                    } else if (itemValue < currentMinimum) {
                        currentMinimum = itemValue;
                    }
                }
            }
            return currentMinimum;
        };
    }

    _createMaxFinder() {
        return (collection, valueExtractor) => {
            if (!Array.isArray(collection) || collection.length === 0) {
                return undefined;
            }

            const accessor = typeof valueExtractor === 'function' ? valueExtractor : (d) => d;
            let currentMaximum = undefined;
            let firstValidEncountered = false;

            for (let i = 0; i < collection.length; i++) {
                const itemValue = accessor(collection[i], i, collection);
                if (this._isValidNumerical(itemValue)) {
                    if (!firstValidEncountered) {
                        currentMaximum = itemValue;
                        firstValidEncountered = true;
                    } else if (itemValue > currentMaximum) {
                        currentMaximum = itemValue;
                    }
                }
            }
            return currentMaximum;
        };
    }

    _createExtentCalculator() {
        return (dataInput, valueExtractor) => {
            if (!Array.isArray(dataInput) || dataInput.length === 0) {
                return [undefined, undefined];
            }

            const accessor = typeof valueExtractor === 'function' ? valueExtractor : (d) => d;
            let minVal = undefined;
            let maxVal = undefined;
            let foundAny = false;

            for (let idx = 0; idx < dataInput.length; idx++) {
                const processed = accessor(dataInput[idx], idx, dataInput);
                if (this._isValidNumerical(processed)) {
                    if (!foundAny) {
                        minVal = processed;
                        maxVal = processed;
                        foundAny = true;
                    } else {
                        if (processed < minVal) minVal = processed;
                        if (processed > maxVal) maxVal = processed;
                    }
                }
            }
            return [minVal, maxVal];
        };
    }

    _createSumAggregator() {
        return (dataCollection, valueTransformer) => {
            if (!Array.isArray(dataCollection)) {
                return 0;
            }

            const transformer = typeof valueTransformer === 'function' ? valueTransformer : (d) => d;
            return dataCollection.reduce((accumulator, currentItem, index, arr) => {
                const numericValue = +transformer(currentItem, index, arr);
                return this._isValidNumerical(numericValue) ? accumulator + numericValue : accumulator;
            }, 0);
        };
    }

    _createMeanCalculator() {
        return (sourceSet, valueProducer) => {
            if (!Array.isArray(sourceSet)) {
                return undefined;
            }

            const producer = typeof valueProducer === 'function' ? valueProducer : (d) => d;
            let total = 0;
            let count = 0;

            for (let idx = 0; idx < sourceSet.length; idx++) {
                const item = sourceSet[idx];
                const transformed = producer(item, idx, sourceSet);
                if (this._isValidNumerical(transformed)) {
                    total += transformed;
                    count++;
                }
            }
            return count > 0 ? total / count : undefined;
        };
    }

    _createQuantileEstimator() {
        return (sortedNumericValues, fraction) => {
            if (!Array.isArray(sortedNumericValues) || sortedNumericValues.length === 0) {
                return undefined;
            }
            const count = sortedNumericValues.length;
            const rank = (count - 1) * fraction + 1;
            const lowerBoundIndex = Math.floor(rank);
            const lowerBoundValue = +sortedNumericValues[lowerBoundIndex - 1];
            const remainder = rank - lowerBoundIndex;

            if (remainder) {
                const upperBoundValue = +sortedNumericValues[lowerBoundIndex];
                return lowerBoundValue + remainder * (upperBoundValue - lowerBoundValue);
            } else {
                return lowerBoundValue;
            }
        };
    }

    _createMedianFinder() {
        return (inputArray, valueConverter) => {
            let numericValues;
            if (typeof valueConverter === 'function') {
                numericValues = inputArray.map(valueConverter);
            } else {
                numericValues = [...inputArray];
            }

            const filteredAndValid = numericValues.filter(v => this._isValidNumerical(v));
            if (filteredAndValid.length === 0) {
                return undefined;
            }

            filteredAndValid.sort(this.orderAscending);
            return this.determineQuantile(filteredAndValid, 0.5);
        };
    }

    _createBisectorMechanism() {
        class RangeSearcher {
            constructor(accessor) {
                this._keyExtractor = accessor;
            }

            seekLeftBoundary(items, target, lowIndex = 0, highIndex = items.length) {
                let lower = lowIndex;
                let upper = highIndex;
                while (lower < upper) {
                    const midPoint = lower + upper >>> 1;
                    if (this._keyExtractor(items[midPoint], midPoint, items) < target) {
                        lower = midPoint + 1;
                    } else {
                        upper = midPoint;
                    }
                }
                return lower;
            }

            seekRightBoundary(items, target, lowIndex = 0, highIndex = items.length) {
                let lower = lowIndex;
                let upper = highIndex;
                while (lower < upper) {
                    const midPoint = lower + upper >>> 1;
                    if (target < this._keyExtractor(items[midPoint], midPoint, items)) {
                        upper = midPoint;
                    } else {
                        lower = midPoint + 1;
                    }
                }
                return lower;
            }
        }
        return (accessor) => new RangeSearcher(accessor);
    }

    _createShuffleAlgorithm() {
        return (inputArray) => {
            const mutableArray = [...inputArray];
            let currentElementCount = mutableArray.length;
            let temporaryValue, randomIndex;

            while (currentElementCount !== 0) {
                randomIndex = Math.floor(Math.random() * currentElementCount);
                currentElementCount--;

                temporaryValue = mutableArray[currentElementCount];
                mutableArray[currentElementCount] = mutableArray[randomIndex];
                mutableArray[randomIndex] = temporaryValue;
            }
            return mutableArray;
        };
    }

    _createPermutationExtractor() {
        return (sourceArray, indexArray) => {
            return indexArray.map(idx => sourceArray[idx]);
        };
    }

    _createPairGenerator() {
        return (sourceItems) => {
            if (!Array.isArray(sourceItems) || sourceItems.length < 2) {
                return [];
            }
            const generatedPairs = [];
            for (let i = 0; i < sourceItems.length - 1; i++) {
                generatedPairs.push([sourceItems[i], sourceItems[i + 1]]);
            }
            return generatedPairs;
        };
    }

    _createColumnZipper() {
        return (...collections) => {
            if (collections.length === 0) {
                return [];
            }
            const smallestLength = Math.min(...collections.map(arr => arr.length));
            return Array.from({
                length: smallestLength
            }, (_, index) => {
                return collections.map(arr => arr[index]);
            });
        };
    }

    _createMatrixTransposer() {
        return (matrix) => {
            if (!Array.isArray(matrix) || matrix.length === 0 || !Array.isArray(matrix[0])) {
                return [];
            }
            return this.alignColumns(...matrix);
        };
    }

    _createKeyLister() {
        return (targetObject) => Object.keys(targetObject);
    }

    _createValueLister() {
        return (targetObject) => Object.values(targetObject);
    }

    _createEntryLister() {
        return (targetObject) => Object.entries(targetObject).map(([k, v]) => ({
            key: k,
            value: v
        }));
    }

    _createArrayFlattener() {
        return (arraysToCombine) => [].concat(...arraysToCombine);
    }

    _createNumberSequenceGenerator() {
        const getPrecisionFactor = (num) => {
            if (!Number.isFinite(num)) return 1;
            const numStr = String(num);
            const decimalPointIdx = numStr.indexOf('.');
            return decimalPointIdx === -1 ? 1 : Math.pow(10, numStr.length - 1 - decimalPointIdx);
        };

        return (startNum, endNum, stepNum) => {
            let actualStart = 0;
            let actualEnd;
            let actualStep = 1;

            if (arguments.length === 1) {
                actualEnd = startNum;
            } else if (arguments.length === 2) {
                actualStart = startNum;
                actualEnd = endNum;
            } else {
                actualStart = startNum;
                actualEnd = endNum;
                actualStep = stepNum;
            }

            if (actualStep === 0) {
                throw new Error("Step value cannot be zero.");
            }

            const difference = actualEnd - actualStart;
            if (!Number.isFinite(difference / actualStep)) {
                throw new Error("Infinite sequence detected.");
            }

            const maxPrecision = Math.max(
                getPrecisionFactor(actualStart),
                getPrecisionFactor(actualEnd),
                getPrecisionFactor(actualStep)
            );

            const scaledStart = Math.round(actualStart * maxPrecision);
            const scaledStep = Math.round(actualStep * maxPrecision);
            const scaledEnd = Math.round(actualEnd * maxPrecision);

            const resultList = [];
            let currentScaled = scaledStart;
            let iteration = 0;

            if (scaledStep > 0) {
                while (currentScaled < scaledEnd) {
                    resultList.push(currentScaled / maxPrecision);
                    currentScaled = scaledStart + scaledStep * (++iteration);
                }
            } else {
                while (currentScaled > scaledEnd) {
                    resultList.push(currentScaled / maxPrecision);
                    currentScaled = scaledStart + scaledStep * (++iteration);
                }
            }
            return resultList;
        };
    }

    _createMapCreator() {
        const uniqueKeyMarker = Symbol('__custom_map_id__');

        class DynamicKeyMap {
            constructor() {
                this._dataStorage = {};
                this._keyPrefix = `_map_${Math.random().toString(36).substring(2, 15)}_`;
                this[uniqueKeyMarker] = true;
            }

            static isDynamicKeyMapInstance(obj) {
                return obj && obj[uniqueKeyMarker] === true;
            }

            _getInternalKey(userKey) {
                return this._keyPrefix + String(userKey);
            }

            has(userKey) {
                return Object.prototype.hasOwnProperty.call(this._dataStorage, this._getInternalKey(userKey));
            }

            get(userKey) {
                return this._dataStorage[this._getInternalKey(userKey)];
            }

            set(userKey, value) {
                this._dataStorage[this._getInternalKey(userKey)] = value;
                return this;
            }

            remove(userKey) {
                const internalKey = this._getInternalKey(userKey);
                if (this.has(userKey)) {
                    delete this._dataStorage[internalKey];
                    return true;
                }
                return false;
            }

            getKeys() {
                const keys = [];
                this.forEach((k) => keys.push(k));
                return keys;
            }

            getValues() {
                const values = [];
                this.forEach((k, v) => values.push(v));
                return values;
            }

            getEntries() {
                const entries = [];
                this.forEach((k, v) => entries.push({
                    key: k,
                    value: v
                }));
                return entries;
            }

            forEach(callbackFunction) {
                for (const internalKey in this._dataStorage) {
                    if (Object.prototype.hasOwnProperty.call(this._dataStorage, internalKey) &&
                        internalKey.startsWith(this._keyPrefix)) {
                        const originalKey = internalKey.substring(this._keyPrefix.length);
                        callbackFunction.call(this, originalKey, this._dataStorage[internalKey]);
                    }
                }
            }
        }

        return (initialData) => {
            const newMap = new DynamicKeyMap();
            if (DynamicKeyMap.isDynamicKeyMapInstance(initialData)) {
                initialData.forEach((k, v) => newMap.set(k, v));
            } else if (initialData) {
                for (const k in initialData) {
                    if (Object.prototype.hasOwnProperty.call(initialData, k)) {
                        newMap.set(k, initialData[k]);
                    }
                }
            }
            return newMap;
        };
    }

    _createSetCreator() {
        const uniqueSetMarker = Symbol('__custom_set_id__');

        class UniqueValueCollection {
            constructor() {
                this._valueRegistry = {};
                this._valuePrefix = `_set_${Math.random().toString(36).substring(2, 15)}_`;
                this[uniqueSetMarker] = true;
            }

            _getRegistryKey(val) {
                return this._valuePrefix + String(val);
            }

            has(val) {
                return Object.prototype.hasOwnProperty.call(this._valueRegistry, this._getRegistryKey(val));
            }

            add(val) {
                this._valueRegistry[this._getRegistryKey(val)] = true;
                return this;
            }

            remove(val) {
                const registryKey = this._getRegistryKey(val);
                if (this.has(val)) {
                    delete this._valueRegistry[registryKey];
                    return true;
                }
                return false;
            }

            getValues() {
                const values = [];
                this.forEach((v) => values.push(v));
                return values;
            }

            forEach(callbackFunction) {
                for (const registryKey in this._valueRegistry) {
                    if (Object.prototype.hasOwnProperty.call(this._valueRegistry, registryKey) &&
                        registryKey.startsWith(this._valuePrefix)) {
                        const originalValue = registryKey.substring(this._valuePrefix.length);
                        callbackFunction.call(this, originalValue);
                    }
                }
            }
        }

        return (initialValues) => {
            const newSet = new UniqueValueCollection();
            if (Array.isArray(initialValues)) {
                for (let i = 0; i < initialValues.length; i++) {
                    newSet.add(initialValues[i]);
                }
            }
            return newSet;
        };
    }

    _createNestingBuilder() {
        return () => ({
            defineKey: () => this.createNestingTool(),
            sortKeysBy: () => this.createNestingTool(),
            sortValuesBy: () => this.createNestingTool(),
            applyRollup: () => this.createNestingTool(),
            processMap: (data, mapType) => mapType ? new Map() : {},
            processEntries: (data) => []
        });
    }

    _createMethodRelinker() {
        const createMethodProxy = (destinationObject, sourceObject, originalMethod) => {
            return function(...args) {
                const outcome = originalMethod.apply(sourceObject, args);
                return outcome === sourceObject ? destinationObject : outcome;
            };
        };

        return (target, origin, ...methodNames) => {
            methodNames.forEach(methodName => {
                if (typeof origin[methodName] === 'function') {
                    target[methodName] = createMethodProxy(target, origin, origin[methodName]);
                }
            });
            return target;
        };
    }

    _createEventDispatcher() {
        class CustomEventMediator {
            constructor() {
                this._listeners = new Map();
            }

            attach(eventName, handler) {
                if (!this._listeners.has(eventName)) {
                    this._listeners.set(eventName, new Set());
                }
                this._listeners.get(eventName).add(handler);
                return this;
            }

            detach(eventName, handler) {
                if (this._listeners.has(eventName)) {
                    this._listeners.get(eventName).delete(handler);
                }
                return this;
            }

            send(eventName, ...args) {
                if (this._listeners.has(eventName)) {
                    for (const handler of this._listeners.get(eventName)) {
                        handler.apply(this, args);
                    }
                }
                return this;
            }
        }

        return (...eventTypes) => {
            const mediatorInstance = new CustomEventMediator();
            const dispatchInterface = {};

            eventTypes.forEach(type => {
                dispatchInterface[type] = {
                    on: (nameWithNamespace, callback) => {
                        const [eventName, namespace] = nameWithNamespace.split('.');
                        const fullEventName = eventName + (namespace ? `:${namespace}` : '');
                        if (callback) mediatorInstance.attach(fullEventName, callback);
                        else mediatorInstance.detach(fullEventName, null); // Simplified detach
                        return mediatorInstance;
                    },
                    trigger: (...args) => mediatorInstance.send(type, ...args)
                };
            });

            dispatchInterface.connect = (targetContext, invocationArgs) => {
                return (incomingEvent) => {
                    try {
                        const priorEvent = incomingEvent.sourceEvent = this.currentEvent;
                        incomingEvent.target = targetContext;
                        this.currentEvent = incomingEvent;
                        dispatchInterface[incomingEvent.type].trigger.apply(targetContext, invocationArgs);
                    } finally {
                        this.currentEvent = priorEvent;
                    }
                };
            };
            return dispatchInterface;
        };
    }

    _createDomAccessors() {
        const querySingle = (selector, contextNode) => (contextNode || document).querySelector(selector);
        const queryAllElements = (selector, contextNode) => Array.from((contextNode || document).querySelectorAll(selector));
        const checkElementMatch = (element, selector) => element.matches(selector);

        const domInterface = {
            selectElement: querySingle,
            selectAllElements: queryAllElements,
            elementMatches: checkElementMatch
        };

        (function() {
            if (typeof globalThis.Sizzle === "function") {
                domInterface.selectElement = (s, n) => globalThis.Sizzle(s, n)[0] || null;
                domInterface.selectAllElements = (s, n) => globalThis.Sizzle.uniqueSort(globalThis.Sizzle(s, n));
                domInterface.elementMatches = globalThis.Sizzle.matchesSelector;
            }
        })();

        return domInterface;
    }

    _createSelectionController() {
        class NodeCollection extends Array {
            constructor(initialNodeGroups) {
                super();
                initialNodeGroups.forEach(group => this.push(group));
            }

            choose(selector) {
                const newGroups = [];
                const selectionResolver = typeof selector === 'string' ?
                    (parentNode) => this.domQuery.selectElement(selector, parentNode) :
                    selector;

                for (const group of this) {
                    const nextGroup = [];
                    for (const node of group) {
                        if (node) {
                            const selectedChild = selectionResolver(node);
                            if (selectedChild) nextGroup.push(selectedChild);
                        }
                    }
                    newGroups.push(nextGroup);
                }
                return new NodeCollection(newGroups);
            }
        }

        const rootSelectionInstance = new NodeCollection([
            [typeof document !== 'undefined' ? document.documentElement : null]
        ]);

        return () => rootSelectionInstance;
    }

    _generateRegexEscaper() {
        const charactersToEscape = /[\\^$.*+?()[\]{}|]/g;
        return (inputString) => {
            return inputString.replace(charactersToEscape, '\\$&');
        };
    }
}

const globalKit = new DataAnalysisKit();
globalThis.DataTool = globalKit;