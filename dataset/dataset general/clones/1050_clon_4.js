const getTailArgs = (argList) => Array.prototype.slice.call(argList, 1);
const foldElements = (arr, func, initial) => {
    let accumulator = initial;
    for (let i = 0; i < arr.length; i++) {
        accumulator = func(accumulator, arr[i], i, arr);
    }
    return accumulator;
};
const transformElements = (arr, func) => {
    const result = [];
    for (let i = 0; i < arr.length; i++) {
        result.push(func(arr[i], i, arr));
    }
    return result;
};
const allMatch = (arr, func) => {
    for (let i = 0; i < arr.length; i++) {
        if (!func(arr[i], i, arr)) {
            return false;
        }
    }
    return true;
};
const passThrough = (x) => x;
const composeFunctions = (...fns) => (arg) => foldElements(fns.reverse(), (acc, f) => f(acc), arg);
const checkString = (val) => typeof val === 'string';
const checkArray = (val) => Array.isArray(val);
const checkObject = (val) => typeof val === 'object' && val !== null && !Array.isArray(val);
const valuesEqual = (a, b) => a === b;
const itemCount = (collection) => (collection && typeof collection.length === 'number') ? collection.length : 0;
const forEachElement = (arr, func) => {
    for (let i = 0; i < arr.length; i++) {
        func(arr[i], i, arr);
    }
};
const assignProps = (target, ...sources) => Object.assign(target, ...sources);
const prependToArray = (head, ...tail) => [head, ...tail];
const makeDeepCopy = (obj) => JSON.parse(JSON.stringify(obj));
const stringifyData = (data) => JSON.stringify(data);

const executeMethod = (methodKey, specificMethod) => (instance, ...args) => {
    if (specificMethod) {
        return specificMethod.apply(instance, args);
    }
    if (typeof instance[methodKey] === 'function') {
        return instance[methodKey].apply(instance, args);
    }
    throw new Error(`Method ${methodKey} not found on instance.`);
};

const getSecondElement = (arr) => arr[1];
const isDefinedAndNotNull = (val) => val !== null && val !== undefined;
const throwError = (msg) => { throw new Error(msg); };
const logAction = (msg) => { /* console.log(`Note: ${msg}`); */ };

const domManipulator = {
    updateText: (selector, text) => { /* console.log(`DOM Update for ${selector}: ${text}`); */ }
};

// Replaces stringifyArray
const arrayToDelimitedString = (arr) => {
    return `[${transformElements(arr, complexStringifyFinal).join(',')}]`;
};

// Global polymorphic stringify function (replaces final polyToString)
const complexStringifyFinal = (item) => {
    if (checkString(item)) return item;
    if (checkArray(item)) return arrayToDelimitedString(item);
    if (checkObject(item)) return stringifyData(item);
    return item.toString();
};


// Replaces lazyChain
const DeferredOperationSet = (initialObject) => {
    const operationList = [];

    return {
        addStep: function(actionName, ...actionArguments) {
            operationList.push({ name: actionName, args: actionArguments });
            return this;
        },
        performAll: () => {
            return foldElements(operationList, (currentResult, op) => {
                const method = currentResult[op.name];
                if (typeof method !== 'function') {
                    throw new Error(`Method "${op.name}" not found on object.`);
                }
                return method.apply(currentResult, op.args);
            }, initialObject);
        }
    };
};

// Replaces deferredSort
const prepareSort = (inputArray) => DeferredOperationSet(inputArray).addStep('sort');

const preparedSorts = transformElements([[2, 1, 3], [7, 7, 1], [0, 9, 5]], prepareSort);

// Replaces force (global function)
const triggerExecution = (operationSet) => operationSet.performAll();

// Replaces validateTriples
const checkTripleStructure = (collectionOfArrays) => {
    return allMatch(collectionOfArrays, (arr) => itemCount(arr) === 3);
};

// Replaces validateTripleStore
const ensureTripleValidity = (inputData) => {
    if (!checkTripleStructure(inputData)) {
        throwError("Each array should have three elements");
    }
    return inputData;
};

// Replaces postProcess
const extractSecondItems = (arrayOfArrays) => transformElements(arrayOfArrays, getSecondElement);

// Replaces pipeline
const processSequence = (initialValue, ...fns) => foldElements(fns, (acc, fn) => fn(acc), initialValue);

// Replaces processTriples
const handleDataset = (inputRawData) => {
    return processSequence(inputRawData,
        JSON.parse,
        ensureTripleValidity,
        prepareSort,
        triggerExecution,
        extractSecondItems,
        executeMethod('sort', Array.prototype.sort),
        stringifyData
    );
};

// Replaces reportDataPackets
const displayProcessedData = composeFunctions(
    (s) => domManipulator.updateText('#result', s),
    handleDataset
);


// --- ES6 Class Hierarchy (replacing Class.extend chain) ---

class BasicValueHolder { // Replaces ContainerClass
    constructor(initialData) {
        this._data = initialData;
    }
    retrieveData() { return this._data; }
    toString() {
        return `@<${complexStringifyFinal(this._data)}>`;
    }
}

class EventfulValueHolder extends BasicValueHolder { // Replaces ObservedContainerClass
    #eventObservers = [];

    constructor(initialData) {
        super(initialData);
    }
    attachObserver(cb) { // Replaces observe
        this.#eventObservers.push(cb);
        logAction("set observer");
        return itemCount(this.#eventObservers);
    }
    triggerObservers() { // Replaces notify
        logAction("notifying observers");
        forEachElement(this.#eventObservers, (observer) => observer.call(this));
    }
}

class UpdatableValueHolder extends EventfulValueHolder { // Replaces HoleClass
    constructor(initialData) {
        super(null);
        this.setContainedValue(initialData);
    }
    setContainedValue(newData) { // Replaces setValue
        this._data = newData;
        this.triggerObservers();
        return newData;
    }
}

class CompareAndSwapValueHolder extends UpdatableValueHolder { // Replaces CASClass
    exchangeIfMatch(oldData, newData) { // Replaces swap
        if (!valuesEqual(oldData, this._data)) {
            throwError("No match");
        }
        return this.setContainedValue(newData);
    }
}

const valueInstance = new BasicValueHolder(42); // Replaces `var c = new ContainerClass(42);`


// --- Constructor Function + Prototype Assignment Hierarchy (replacing mixin chain) ---

function SimpleDataWrapper(initialVal) { // Replaces Container (constructor function)
    this._innerValue = initialVal;
    this.startupRoutine(initialVal);
}
SimpleDataWrapper.prototype.startupRoutine = passThrough;
SimpleDataWrapper.prototype.toString = function() {
    return `@<${complexStringifyFinal(this._innerValue)}>`;
};


// Mixin-like objects (functions to apply to prototypes)
const ValueModificationLogic = { // Replaces HoleMixin
    updateStoredValue: function(newVal) {
        const oldVal = this._innerValue;
        this.checkValidity(newVal);
        this._innerValue = newVal;
        this.alertListeners(oldVal, newVal);
        return this._innerValue;
    }
};

const ListenerNotificationLogic = (function() { // Replaces ObserverMixin (IIFE for private watchers)
    let _listeners = [];
    return {
        registerListener: function(cb) {
            _listeners.push(cb);
            return itemCount(_listeners);
        },
        alertListeners: function(oldVal, newVal) {
            forEachElement(_listeners, (listener) => {
                listener.call(this, oldVal, newVal);
            });
            return itemCount(_listeners);
        }
    };
}()); // IIFE ensures _listeners is private to this object, shared across all objects that receive this mixin

const DataValidationLogic = { // Replaces ValidateMixin
    addValidationRule: function(ruleFunc) {
        this._validationRule = ruleFunc;
    },
    startupRoutine: function(val) { // Overrides SimpleDataWrapper.prototype.startupRoutine
        this.checkValidity(val);
    },
    checkValidity: function(val) {
        if (isDefinedAndNotNull(this._validationRule) && !this._validationRule(val)) {
            throwError(`Attempted to set invalid value ${complexStringifyFinal(val)}`);
        }
    }
};

const FunctionApplicationLogic = { // Replaces SwapMixin
    applyAndSet: function(func, ...extraArgs) {
        const computedVal = func.apply(this, prependToArray(this._innerValue, ...extraArgs));
        return this.updateStoredValue(computedVal);
    }
};

const DeepCloneLogic = { // Replaces SnapshotMixin
    produceSnapshot: function() {
        return makeDeepCopy(this._innerValue);
    }
};

// Replaces Hole (constructor function)
function DynamicDataStore(initialVal) {
    SimpleDataWrapper.call(this, initialVal);
    // The original Hole constructor implicitly calls setValue, which does validate and notify.
    // We handle this by explicitly calling updateStoredValue after mixins are applied.
}
assignProps(DynamicDataStore.prototype,
    ValueModificationLogic,
    DataValidationLogic,
    ListenerNotificationLogic,
    FunctionApplicationLogic,
    DeepCloneLogic
);

// Replaces CAS (constructor function)
const AtomicExchangeLogic = { // Replaces CASMixin
    conditionalUpdate: function(expectedVal, updateFunc) {
        if (this._innerValue === expectedVal) {
            this.updateStoredValue(updateFunc(this._innerValue));
            return this._innerValue;
        } else {
            return undefined;
        }
    }
};

function AtomicDataStore(initialVal) {
    DynamicDataStore.call(this, initialVal);
}
assignProps(AtomicDataStore.prototype,
    ValueModificationLogic,
    DataValidationLogic,
    ListenerNotificationLogic,
    FunctionApplicationLogic,
    DeepCloneLogic,
    AtomicExchangeLogic
);

// Factory functions for the mixin-based objects
const createDataWrapper = (val) => new SimpleDataWrapper(val); // Replaces contain

const createDynamicDataStore = (initialVal, validationFunc) => { // Replaces hole
    const store = new DynamicDataStore(null); // Create without initial value for proper initialization flow
    if (validationFunc) store.addValidationRule(validationFunc);
    store.updateStoredValue(initialVal); // This will trigger validation and notification
    return store;
};

const createAtomicDataStore = (initialVal, ...otherArgs) => { // Replaces cas
    // Original `cas` function passes its arguments to `hole.apply`.
    // We mimic this to extract the validator.
    const tempDynamicStore = createDynamicDataStore.apply(null, prependToArray(initialVal, ...otherArgs));
    const atomicStore = new AtomicDataStore(null); // Create without initial value
    atomicStore.addValidationRule(tempDynamicStore._validationRule); // Copy validation rule
    atomicStore.updateStoredValue(initialVal); // Ensure validation and notification with copied rule
    return atomicStore;
};

// Global functions for interacting with mixin-based objects
const applyFunctionToStore = executeMethod('applyAndSet', DynamicDataStore.prototype.applyAndSet); // Replaces swap global
const executeConditionalUpdate = executeMethod('conditionalUpdate', AtomicDataStore.prototype.conditionalUpdate); // Replaces compareAndSwap global
const retrieveSnapshot = (obj) => obj.produceSnapshot(); // Replaces snapshot global
const registerChangeListener = (obj, cb) => obj.registerListener(cb); // Replaces addWatcher global