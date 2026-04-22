/*
 * Expert-generated Type III code clone.
 * This version introduces extensive renames, structural alterations,
 * additions of new logic, and removal of redundant parts,
 * while striving to maintain the original functional essence.
 */

// --- Utility Functions (Mock/Native Replacements) ---
// These are assumed external libraries/helpers from the original context,
// here provided as minimal implementations or native JS equivalents
// to ensure the cloned code is self-contained and runnable.

const _l = { // Renamed from '_' to '_l' for "lodash-like"
  sliceArgs: (args, startIndex = 0) => Array.prototype.slice.call(args, startIndex),
  reduceIter: (arr, fn, initial) => Array.prototype.reduce.call(arr, fn, initial),
  mapIter: (arr, fn) => Array.prototype.map.call(arr, fn),
  checkAll: (arr, fn) => Array.prototype.every.call(arr, fn),
  echo: (val) => val, // Renamed from identity
  isStr: (s) => typeof s === 'string',
  isArr: (a) => Array.isArray(a),
  isObj: (o) => o !== null && typeof o === 'object',
  deepCompare: (a, b) => JSON.stringify(a) === JSON.stringify(b), // Simplified deep equality
  countElements: (arr) => arr.length,
  eachElement: (arr, fn) => Array.prototype.forEach.call(arr, fn),
  mixin: (target, ...sources) => Object.assign(target, ...sources), // Renamed from extend
  chainFns: (...fns) => (...args) => fns.reduceRight((acc, fn) => [fn(...acc)], args)[0], // Renamed from compose
  toArray: (args) => Array.from(args)
};

// Mock for 'Class.extend' - a simple inheritance utility
const PrototypalClass = function() {};
PrototypalClass.extend = function(protoProps) {
  const ParentConstructor = this;
  const ChildConstructor = function(...args) {
    if (protoProps && protoProps.hasOwnProperty('initInstance')) { // Renamed from init
      protoProps.initInstance.apply(this, args);
    } else {
      ParentConstructor.apply(this, args);
    }
  };
  const PrototypeBridge = function() { this.constructor = ChildConstructor; };
  PrototypeBridge.prototype = ParentConstructor.prototype;
  ChildConstructor.prototype = new PrototypeBridge();
  _l.mixin(ChildConstructor.prototype, protoProps);
  ChildConstructor.__super__ = ParentConstructor.prototype;
  ChildConstructor.extend = ParentConstructor.extend;
  return ChildConstructor;
};

// Mock for other helpers
const logEvent = (msg) => console.log(`[Event Log] ${msg}`); // Renamed from note
const raiseError = (msg) => { throw new Error(`[RUNTIME FAILURE] ${msg}`); }; // Renamed from fail
const isDefinedAndNotNull = (val) => val !== null && val !== undefined; // Renamed from existy
const buildArguments = (head, tail) => [head, ...tail]; // Renamed from construct
const deepDuplicate = (obj) => JSON.parse(JSON.stringify(obj)); // Renamed from deepClone

// Mock for validation and pipeline helpers
const validationCreator = (errMsg, predicateFn) => (valueToValidate) => { // Renamed from validator
  if (!predicateFn(valueToValidate)) {
    raiseError(errMsg);
  }
  return valueToValidate;
};
const applyPartialArg = (func, argOne) => (...remainingArgs) => func(argOne, ...remainingArgs); // Renamed from partial1
const enforceCondition = (predicate) => (valueToCheck) => { // Renamed from condition1
  if (!predicate(valueToCheck)) {
    raiseError("Condition failed during processing.");
  }
  return valueToCheck;
};
const functionalPipeline = (...functions) => (initialInput) => functions.reduce((currentResult, func) => func(currentResult), initialInput); // Renamed from pipeline
const methodCallerFactory = (methodName, methodReference) => (...callArgs) => (targetObject) => methodReference.apply(targetObject, callArgs); // Renamed from invoker
const retrieveSecondElement = (inputArray) => inputArray[1]; // Renamed from second
const stringifyData = (val) => JSON.stringify(val); // Renamed from str
const multiTypeDispatcher = (...dispatchFns) => (...candidateArgs) => { // Renamed from dispatch
  for (let i = 0; i < dispatchFns.length; i++) {
    const fnResult = dispatchFns[i](...candidateArgs);
    if (fnResult !== undefined) {
      return fnResult;
    }
  }
  return undefined; // If no function handles the input
};

// --- Core Application Logic ---

/**
 * Creates a deferred operation builder for an initial value.
 * Operations are queued and executed upon an explicit trigger.
 * @param {any} initialValue The value to start the chain with.
 * @returns {object} An object with methods to queue and execute operations.
 */
function deferredOperationBuilder(initialValue) {
  const pendingOperations = []; // Renamed from 'calls'
  let currentOperationCount = 0; // Added: track number of pending operations

  return {
    /**
     * Queues a method invocation on the target object.
     * @param {string} methodAlias The name of the method to call.
     * @param {...any} opArguments Arguments to pass to the method.
     * @returns {object} 'this' for chaining.
     */
    applyMethod: function(methodAlias /* , ...opArguments */) {
      if (typeof methodAlias !== 'string' || !methodAlias) { // Added: guard clause
        console.warn("Attempted to apply a non-string or empty method alias. Operation skipped.");
        return this;
      }
      const opArguments = _l.sliceArgs(arguments, 1); // Renamed from 'args', rewritten _.rest

      pendingOperations.push(function(targetItem) {
        const targetMethod = targetItem[methodAlias];
        if (typeof targetMethod !== 'function') { // Added: runtime method existence check
          raiseError(`Method '${methodAlias}' not found on target item.`);
        }
        return targetMethod.apply(targetItem, opArguments);
      });
      currentOperationCount++; // Updated: increment counter
      return this;
    },

    /**
     * Executes all queued operations in sequence on the initial value.
     * @returns {any} The final result after all operations.
     */
    executeAll: function() { // Renamed from 'force'
      if (currentOperationCount === 0) { // Added: guard for no operations
        console.info("No operations queued, returning initial value directly.");
        return initialValue;
      }
      const finalResult = _l.reduceIter(pendingOperations, function(currentResult, operationFn) { // Renamed ret, thunk
        return operationFn(currentResult);
      }, initialValue);
      // Optional: Clear operations after execution to allow reuse or prevent re-execution side effects
      // pendingOperations.length = 0;
      // currentOperationCount = 0;
      return finalResult;
    },

    // Added: a method to inspect the queue
    getPendingCount: function() {
      return currentOperationCount;
    }
  };
}

/**
 * Creates a deferred sorting operation for an array.
 * @param {Array} dataArray The array to be sorted.
 * @returns {object} A deferred operation builder containing the sort.
 */
const queuedArraySorter = (dataArray) => { // Renamed from deferredSort, using const
  // A new intermediate variable added for clarity
  const sortingChain = deferredOperationBuilder(dataArray);
  return sortingChain.applyMethod('sort');
};

const initialDataSets = [
  [2, 1, 3],
  [7, 7, 1],
  [0, 9, 5]
];
const queuedSortersCollection = _l.mapIter(initialDataSets, queuedArraySorter); // Renamed from deferredSorts, using _l.mapIter

//=> [<thunk>, <thunk>, <thunk>] (original comment, now refers to deferred builders)

/**
 * Triggers the execution of a deferred operation builder.
 * @param {object} executableItem A deferred operation builder instance.
 * @returns {any} The result of executing all operations.
 */
const triggerExecution = (executableItem) => { // Renamed from force, using const
  return executableItem.executeAll();
};

const ensureThreeElements = validationCreator( // Renamed from validateTriples
  "Each array in the collection must strictly contain three elements.", // Rewritten message
  function(arraysCollection) { // Renamed arrays
    return _l.checkAll(arraysCollection, function(singleArray) { // Rewritten _.every to _l.checkAll
      return singleArray.length === 3;
    });
  });

const checkArrayStructure = applyPartialArg(enforceCondition(ensureThreeElements), _l.echo); // Renamed from validateTripleStore, using _l.echo for identity

const extractSecondElements = (inputCollections) => { // Renamed from postProcess, using const
  return _l.mapIter(inputCollections, retrieveSecondElement); // Rewritten _.map to _l.mapIter, renamed second
};

/**
 * Defines a complete data processing workflow.
 * @param {string} rawInput JSON string data.
 * @returns {string} Processed data as a string.
 */
function workflowProcessor(rawInput) { // Renamed from processTriples
  let parsedData; // Added intermediate variable
  try {
    parsedData = JSON.parse(rawInput);
  } catch (error) { // Added error handling
    raiseError(`Failed to parse input JSON: ${error.message}`);
  }

  // Changed order of steps and added new intermediate step for parsed data
  const processedResult = functionalPipeline( // Renamed from pipeline
    // Original JSON.parse already handled above for error safety
    checkArrayStructure, // Renamed from validateTripleStore
    queuedArraySorter, // Renamed from deferredSort
    triggerExecution, // Renamed from force
    extractSecondElements, // Renamed from postProcess
    methodCallerFactory('sort', Array.prototype.sort), // Renamed from invoker
    stringifyData // Renamed from str
  )(parsedData); // Now passing parsedData

  return processedResult;
}

const displayProcessedReport = _l.chainFns( // Renamed from reportDataPackets, rewritten _.compose to _l.chainFns
  function(finalOutput) { // Renamed s
    const outputArea = document.getElementById('output-area'); // Changed ID from #result
    if (outputArea) { // Added check for DOM element
      outputArea.textContent = finalOutput;
    } else {
      console.warn("DOM element with ID 'output-area' not found to display report.");
    }
  },
  workflowProcessor // Renamed from processTriples
);

/**
 * Helper for formatting arrays into string representation.
 * @param {Array} arrayToFormat The array to convert to string.
 * @returns {string} String representation of the array.
 */
function formatArrayContent(arrayToFormat) { // Renamed from stringifyArray
  if (!_l.isArr(arrayToFormat)) { // Added guard for non-arrays
    return String(arrayToFormat);
  }
  const formattedElements = _l.mapIter(arrayToFormat, unifiedValueFormatter); // Rewritten _.map to _l.mapIter, renamed polyToString
  return `[ ${formattedElements.join(' | ')} ]`; // Changed separator and spacing
}

/**
 * Provides a unified way to format various value types into strings.
 * This is the primary dispatcher for string conversion.
 * @param {any} valCandidate The value to represent as a string.
 * @returns {string} The string representation.
 */
const dynamicValueRepresenter = multiTypeDispatcher( // Renamed from polyToString (second definition), rewritten dispatch to multiTypeDispatcher
  (valCandidate) => _l.isStr(valCandidate) ? valCandidate : undefined, // Rewritten _.isString to _l.isStr
  (valCandidate) => _l.isArr(valCandidate) ? formatArrayContent(valCandidate) : undefined, // Rewritten _.isArray to _l.isArr, renamed stringifyArray
  (valCandidate) => _l.isObj(valCandidate) ? JSON.stringify(valCandidate) : undefined, // Rewritten _.isObject to _l.isObj
  (valCandidate) => String(valCandidate) // Simplified default toString, assuming it exists or is safe
);

// This function was originally named 'polyToString' but was shadowed by the dispatch version.
// It's kept as a private helper for `formatArrayContent` to avoid circular dependencies in the dispatcher.
function unifiedValueFormatter(itemToFormat) { // Renamed from polyToString (first definition), made private helper
  if (itemToFormat === null || itemToFormat === undefined) return String(itemToFormat); // Added null/undefined check
  if (itemToFormat instanceof String) // Original check, kept for primitive string wrappers
    return itemToFormat.valueOf(); // Changed to valueOf for primitive string
  else if (itemToFormat instanceof Array)
    return formatArrayContent(itemToFormat);

  return itemToFormat.toString();
}


/**
 * Represents a basic value wrapper.
 * @constructor
 * @param {any} initialData The value to wrap.
 */
function ItemHolder(initialData) { // Renamed from Container
  this._heldItem = initialData; // Renamed _value
  this.setup(initialData); // Renamed init
}

ItemHolder.prototype.setup = _l.echo; // Renamed init, rewritten _.identity to _l.echo

ItemHolder.prototype.toString = function() {
  return `[Wrapped: ${dynamicValueRepresenter(this._heldItem)}]`; // Renamed Container, polyToString, changed format
};

// --- Legacy Class Definitions (Old-style Prototype Chain) ---
// These are likely remnants or alternative implementations.
// Renaming and using Object.create for cleaner prototype linking.

function BaseContainer() {} // Renamed from ContainerClass
function TrackedContainer() {} // Renamed from ObservedContainerClass
function DataHole() {} // Renamed from HoleClass
function AtomicCAS() {} // Renamed from CASClass
function DataGridBase() {} // Renamed from TableBaseClass

TrackedContainer.prototype = Object.create(BaseContainer.prototype); // Cleaner inheritance
DataHole.prototype = Object.create(TrackedContainer.prototype);
AtomicCAS.prototype = Object.create(DataHole.prototype);
DataGridBase.prototype = Object.create(DataHole.prototype);
// Ensure constructors are correctly set
TrackedContainer.prototype.constructor = TrackedContainer;
DataHole.prototype.constructor = DataHole;
AtomicCAS.prototype.constructor = AtomicCAS;
DataGridBase.prototype.constructor = DataGridBase;


// --- Modern Class Definitions (using PrototypalClass.extend) ---

const ManagedContainer = PrototypalClass.extend({ // Renamed from ContainerClass
  initInstance: function(val) { // Renamed init
    this._heldItem = val; // Renamed _value
  },
});

const myContainerInstance = new ManagedContainer(123); // Renamed c, changed value

// myContainerInstance; //=> {_heldItem: 123 ...}
// myContainerInstance instanceof PrototypalClass; //=> true

const ChangeNotifyingContainer = ManagedContainer.extend({ // Renamed from ObservedContainerClass
  addChangeListener: function(callback) { // Renamed observe
    logEvent("Registered a new change listener."); // Renamed note
  },
  triggerChangeListeners: function() { // Renamed notify
    logEvent("Notifying all registered change listeners."); // Renamed note
  }
});

const MutableSlot = ChangeNotifyingContainer.extend({ // Renamed from HoleClass
  initInstance: function(val) { // Renamed init
    this.updateValue(val); // Renamed setValue
  },
  updateValue: function(val) { // Renamed setValue
    this._currentValue = val; // Renamed _value
    this.triggerChangeListeners(); // Renamed notify
    return val;
  }
});

const CompareSwapSlot = MutableSlot.extend({ // Renamed from CASClass
  attemptSwap: function(expectedValue, proposedValue) { // Renamed swap, oldVal, newVal
    // Changed comparison to strict equality instead of _.isEqual for simplicity
    if (this._currentValue !== expectedValue) {
      raiseError("Mismatch: Current value does not match expected value for swap."); // Renamed fail
    }

    return this.updateValue(proposedValue); // Renamed setValue
  }
});

// --- Mixins for Composable Behavior ---

const MutableValueBehavior = { // Renamed from HoleMixin
  setContainedValue: function(incomingValue) { // Renamed setValue, newValue
    const previousValue = this._internalValue; // Renamed oldVal, _value

    this.performValidation(incomingValue); // Renamed validate
    this._internalValue = incomingValue; // Renamed _value
    this.notifyObservers(previousValue, incomingValue); // Renamed notify
    return this._internalValue;
  }
};

const ObservableBehavior = (function() { // Renamed from ObserverMixin
  const _subscribers = new Set(); // Renamed _watchers, changed to Set for uniqueness

  return {
    subscribe: function(callbackFn) { // Renamed watch, fun
      _subscribers.add(callbackFn); // Added to Set
      logEvent(`New subscriber added. Total: ${_subscribers.size}`);
      return _subscribers.size; // Rewritten _.size to .size
    },
    alertSubscribers: function(oldData, newData) { // Renamed notify, oldVal, newVal
      _subscribers.forEach(function(subscriber) { // Rewritten _.each to forEach
        subscriber.call(this, oldData, newData); // Call in context
      }, this); // Added 'this' context for call

      logEvent(`Notified ${_subscribers.size} subscribers about change.`);
      return _subscribers.size; // Rewritten _.size to .size
    }
  };
}());

const ValidatableBehavior = { // Renamed from ValidateMixin
  registerValidator: function(validationFn) { // Renamed addValidator, fun
    this._validationPredicate = validationFn; // Renamed _validator
  },
  initializeValidation: function(initialVal) { // Renamed init
    this.checkValueValidity(initialVal); // Renamed validate
  },
  checkValueValidity: function(valToCheck) { // Renamed validate
    if (isDefinedAndNotNull(this._validationPredicate) && // Renamed existy
      !this._validationPredicate(valToCheck)) {
      throwValidationError(`Attempted to assign an invalid value: ${unifiedValueFormatter(valToCheck)}`); // Renamed fail, polyToString
    }
  },
  throwValidationError: function(message) { // Added: explicit error throwing method
    raiseError(`Validation Error: ${message}`);
  }
};

const TransformableValueBehavior = { // Renamed from SwapMixin
  applyTransformation: function(transformerFn /* , ...extraArgs */) { // Renamed swap, fun, args
    const extraArgs = _l.sliceArgs(arguments, 1); // Rewritten _.rest to _l.sliceArgs
    const transformedValue = transformerFn.apply(this, buildArguments(this._internalValue, extraArgs)); // Renamed newValue, construct, _value

    return this.setContainedValue(transformedValue); // Renamed setValue
  }
};

const SnapshotableBehavior = { // Renamed from SnapshotMixin
  createDeepCopy: function() { // Renamed snapshot
    return deepDuplicate(this._internalValue); // Renamed deepClone, _value
  }
};

const AtomicCompareSwapBehavior = { // Renamed from CASMixin
  compareAndExchange: function(expectedCurrentValue, updaterFunction) { // Renamed swap, oldVal, f
    if (this._internalValue === expectedCurrentValue) { // Renamed _value
      this.setContainedValue(updaterFunction(this._internalValue)); // Renamed setValue, _value
      return this._internalValue;
    } else {
      console.warn("Compare-and-exchange failed: current value did not match expected value."); // Added warning
      return undefined;
    }
  }
};


/**
 * Represents a mutable data cell.
 * @constructor
 * @param {any} initialValue The starting value.
 */
function MutableCell(initialValue) { // Renamed from Hole, using const
  ItemHolder.call(this, initialValue); // Renamed Container.call to ItemHolder.call
  // Initialize internal value for mixins
  this._internalValue = initialValue;
  // Initialize observers
  this.alertSubscribers = ObservableBehavior.alertSubscribers;
  this.subscribe = ObservableBehavior.subscribe;
  // Initialize validation
  this.checkValueValidity = ValidatableBehavior.checkValueValidity;
  this.registerValidator = ValidatableBehavior.registerValidator;
  this.throwValidationError = ValidatableBehavior.throwValidationError;
}

// Applying behaviors to MutableCell prototype.
// The original code had two extend calls for Hole.prototype; the first was redundant.
// This is a deletion of non-essential statements.
_l.mixin(MutableCell.prototype, // Renamed Hole.prototype, rewritten _.extend to _l.mixin
  MutableValueBehavior, // Renamed HoleMixin
  ValidatableBehavior, // Renamed ValidateMixin
  ObservableBehavior, // Renamed ObserverMixin
  TransformableValueBehavior, // Renamed SwapMixin
  SnapshotableBehavior // Renamed SnapshotMixin
);

/**
 * Represents an atomic mutable data cell with compare-and-swap.
 * @constructor
 * @param {any} startingValue The initial value.
 */
function AtomicCell(startingValue) { // Renamed from CAS, using const
  MutableCell.call(this, startingValue); // Renamed Hole.call to MutableCell.call
  // Initialize internal value
  this._currentDatum = startingValue; // Renamed _value
}

// Applying behaviors to AtomicCell prototype
_l.mixin(AtomicCell.prototype, // Renamed CAS.prototype, rewritten _.extend to _l.mixin
  MutableValueBehavior, // Renamed HoleMixin
  ValidatableBehavior, // Renamed ValidateMixin
  ObservableBehavior, // Renamed ObserverMixin
  TransformableValueBehavior, // Renamed SwapMixin
  AtomicCompareSwapBehavior, // Renamed CASMixin
  SnapshotableBehavior // Renamed SnapshotMixin
);


// --- Public Factory and Helper Functions ---

/**
 * Factory function to wrap a value in an ItemHolder.
 * @param {any} item The value to wrap.
 * @returns {ItemHolder} A new ItemHolder instance.
 */
function wrapValue(item) { // Renamed from contain
  return new ItemHolder(item); // Renamed Container
}

/**
 * Factory function to create a MutableCell.
 * @param {any} initialDatum The initial value for the cell.
 * @param {function} [optionalValidator] An optional validation function.
 * @returns {MutableCell} A new MutableCell instance.
 */
function createMutableCell(initialDatum /* , optionalValidator */) { // Renamed from hole
  const newCell = new MutableCell(); // Renamed h, Hole
  const suppliedValidator = _l.toArray(arguments)[1]; // Renamed v, rewritten _.toArray

  if (suppliedValidator && typeof suppliedValidator === 'function') { // Added type check
    newCell.registerValidator(suppliedValidator); // Renamed addValidator
  } else if (isDefinedAndNotNull(suppliedValidator)) { // Added: Warn about non-function validator
    console.warn("Provided validator is not a function and will be ignored.");
  }

  // Ensure initial validation if a validator was provided
  newCell.setContainedValue(initialDatum); // Renamed setValue

  return newCell;
}

const performTransformation = methodCallerFactory('applyTransformation', MutableCell.prototype.applyTransformation); // Renamed from swap, invoker, Hole.prototype.swap

/**
 * Factory function to create an AtomicCell.
 * @param {any} initialContent The initial value for the atomic cell.
 * @param {Array} [additionalArgs] Additional arguments for internal setup.
 * @returns {AtomicCell} A new AtomicCell instance.
 */
function createAtomicCell(initialContent /* , ...additionalArgs */) { // Renamed from cas, val, args
  // Re-used `createMutableCell` to initialize base properties and validator
  const tempCell = createMutableCell.apply(this, arguments); // Renamed h, hole
  const atomicInstance = new AtomicCell(initialContent); // Renamed c, CAS
  atomicInstance._validationPredicate = tempCell._validationPredicate; // Transfer validator

  return atomicInstance;
}

const executeCompareAndExchange = methodCallerFactory('compareAndExchange', AtomicCell.prototype.compareAndExchange); // Renamed from compareAndSwap, invoker, CAS.prototype.swap

/**
 * Retrieves a deep copy of the object's internal value.
 * @param {object} sourceObject An object implementing SnapshotableBehavior.
 * @returns {any} A deep copy of the internal value.
 */
function getDeepCopy(sourceObject) { // Renamed from snapshot, o
  return sourceObject.createDeepCopy(); // Renamed snapshot
}

/**
 * Attaches an observer callback to an observable instance.
 * @param {object} observableInstance An object implementing ObservableBehavior.
 * @param {function} observerCallback The callback function to attach.
 */
function attachObserver(observableInstance, observerCallback) { // Renamed from addWatcher, o, fun
  observableInstance.subscribe(observerCallback); // Renamed watch
}