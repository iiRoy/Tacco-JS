// A custom event dispatcher implementation
function EventDispatcher() {
    this._listeners = {};
    this._externalSubscriptions = [];
}

EventDispatcher.prototype.subscribe = function(eventName, callback, context) {
    if (!this._listeners[eventName]) {
        this._listeners[eventName] = [];
    }
    this._listeners[eventName].push({ callback: callback, context: context });
};

EventDispatcher.prototype.unsubscribe = function(eventName, callback, context) {
    if (!this._listeners[eventName]) return;
    this._listeners[eventName] = this._listeners[eventName].filter(function(listener) {
        return !(listener.callback === callback && listener.context === context);
    });
};

EventDispatcher.prototype.notify = function() {
    var args = Array.prototype.slice.call(arguments);
    var eventName = args.shift();
    var listeners = this._listeners[eventName] ? this._listeners[eventName].slice() : [];
    listeners.forEach(function(listener) {
        listener.callback.apply(listener.context || this, args);
    }, this);
};

EventDispatcher.prototype.registerExternalSubscription = function(source, eventName, callback, context) {
    source.on(eventName, callback, context);
    this._externalSubscriptions.push({ source: source, eventName: eventName, callback: callback, context: context });
};

EventDispatcher.prototype.unregisterAllExternalSubscriptions = function() {
    this._externalSubscriptions.forEach(function(sub) {
        sub.source.off(sub.eventName, sub.callback, sub.context);
    });
    this._externalSubscriptions = [];
};

// Utility function for deep cloning objects
function deepCloneObject(obj) {
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }
    var cloned = Array.isArray(obj) ? [] : {};
    for (var key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            cloned[key] = deepCloneObject(obj[key]);
        }
    }
    return cloned;
}

// Utility function for filtering models based on properties
function checkObjectMatch(model, criteria) {
    for (var key in criteria) {
        if (Object.prototype.hasOwnProperty.call(criteria, key)) {
            if (model.get(key) !== criteria[key]) {
                return false;
            }
        }
    }
    return true;
}

// Utility for array iteration
function iterateArray(arr, callback, context) {
    for (var i = 0; i < arr.length; i++) {
        callback.call(context, arr[i], i, arr);
    }
}

// Utility for calling a method on each item in an array
function invokeMethodOnArray(arr, methodName) {
    var args = Array.prototype.slice.call(arguments, 2);
    iterateArray(arr, function(item) {
        if (typeof item[methodName] === 'function') {
            item[methodName].apply(item, args);
        }
    });
}

// Utility for checking if an array contains an item
function arrayContains(arr, item) {
    return arr.indexOf(item) !== -1;
}

// Utility for converting arguments to array
function argumentsToArray(args) {
    return Array.prototype.slice.call(args);
}

// Custom binary search for insertion point
function findInsertionPoint(targetArray, newItem, comparatorFunction, contextRef) {
    var low = 0, high = targetArray.length;
    if (!comparatorFunction) return high;

    var isSingleArg = comparatorFunction.length === 1;

    while (low < high) {
        var mid = (low + high) >>> 1;
        var comparisonResult;
        if (isSingleArg) {
            comparisonResult = comparatorFunction.call(contextRef, newItem) - comparatorFunction.call(contextRef, targetArray[mid]);
        } else {
            comparisonResult = comparatorFunction.call(contextRef, newItem, targetArray[mid]);
        }

        if (comparisonResult > 0) {
            low = mid + 1;
        } else {
            high = mid;
        }
    }
    return low;
}

// Main class definition
function SourceCollectionWrapper(sourceAggregate, configuration) {
    configuration = configuration || {};

    EventDispatcher.call(this);

    this.sourceCollection = sourceAggregate;
    this.internalElements = [];
    this.elementMap = {};

    if (configuration.comparisonFunction !== undefined) {
        this.comparisonFunction = configuration.comparisonFunction;
    }
    if (configuration.disposeWith) {
        this.attachDisposalHandler(configuration.disposeWith, 'close');
    }
    if (configuration.releaseWith) {
        this.attachDisposalHandler(configuration.releaseWith, 'destroy');
    }
    if (!this.elementSchema) {
        this.elementSchema = sourceAggregate.model;
    }

    this.inclusionPredicate = SourceCollectionWrapper.generatePredicate(configuration.filter);
    this.updateInternalStructure();

    this.registerExternalSubscription(this.sourceCollection, 'add', this.handleElementAddition, this);
    this.registerExternalSubscription(this.sourceCollection, 'remove', this.handleElementRemoval, this);
    this.registerExternalSubscription(this.sourceCollection, 'change', this.handleElementModification, this);
    this.registerExternalSubscription(this.sourceCollection, 'reset', this.handleSourceReset, this);
    this.registerExternalSubscription(this.sourceCollection, 'sort', this.handleSourceSort, this);
    this.relaySourceNotifications(['sync', 'request', 'error']);

    if (typeof this.initMethod === 'function') {
        this.initMethod.apply(this, argumentsToArray(arguments));
    }
}

SourceCollectionWrapper.prototype = Object.create(EventDispatcher.prototype);
SourceCollectionWrapper.prototype.constructor = SourceCollectionWrapper;

// Static methods
SourceCollectionWrapper.generatePredicate = function(predicateConfig) {
    if (!predicateConfig) {
        return function () {
            return true;
        };
    } else if (typeof predicateConfig === 'function') {
        return predicateConfig;
    } else if (predicateConfig && typeof predicateConfig === 'object' && !Array.isArray(predicateConfig)) {
        return function (element) {
            return checkObjectMatch(element, predicateConfig);
        };
    }
    return function() { return true; };
};

// Instance methods
SourceCollectionWrapper.prototype.attachDisposalHandler = function (hostView, eventKind) {
    hostView.on(eventKind, this.unregisterAllExternalSubscriptions, this);
};

SourceCollectionWrapper.prototype.reconfigureInclusionCriteria = function (newPredicateConfig) {
    this.inclusionPredicate = SourceCollectionWrapper.generatePredicate(newPredicateConfig);
    this.updateInternalStructure();
    this.notify('filter', this, newPredicateConfig);
    this.notify('reset', this, newPredicateConfig);
    return this;
};

SourceCollectionWrapper.prototype.updateInternalStructure = function () {
    invokeMethodOnArray(this.internalElements, 'off', 'all', this.processElementEvent, this);
    this.clearElements();

    var currentPredicate = this.inclusionPredicate;
    var instance = this;

    this.sourceCollection.each(function (element, idx) {
        if (currentPredicate.call(instance, element, idx)) {
            element.on('all', instance.processElementEvent, instance);
            instance.internalElements.push(element);
            instance.elementMap[element.cid] = element;
            if (element.id) {
                instance.elementMap[element.id] = element;
            }
        }
    });
    this.size = this.internalElements.length;

    if (this.comparisonFunction) {
        this.sortElements({ isSilent: true });
    }
};

SourceCollectionWrapper.prototype.adjustOrderBasedOnSource = function (options) {
    var newElements = [];
    var instance = this;
    this.sourceCollection.forEach(function (element) {
        if (instance.elementMap[element.cid] !== undefined) {
            newElements.push(element);
        }
    });
    this.internalElements = newElements;
    if (!options || !options.isSilent) {
        this.notify('sort', this, options);
    }
};

SourceCollectionWrapper.prototype.handleSourceSort = function (source, options) {
    if (this.comparisonFunction !== undefined) return;
    this.adjustOrderBasedOnSource(options);
};

SourceCollectionWrapper.prototype.relaySourceNotifications = function (notificationNames) {
    var instance = this;
    iterateArray(notificationNames, function (notificationName) {
        instance.registerExternalSubscription(instance.sourceCollection, notificationName, function () {
            var args = argumentsToArray(arguments);
            args.unshift(notificationName);
            instance.notify.apply(instance, args);
        }, instance);
    });
};

SourceCollectionWrapper.prototype.handleElementAddition = function (element, source, options) {
    var elementPresent = this.retrieveElement(element);
    if (!elementPresent && this.inclusionPredicate(element, options.index)) {
        this.insertElementIntoCache(element);
        element.on('all', this.processElementEvent, this);
        this.notify('add', element, this, options);
    }
};

SourceCollectionWrapper.prototype.handleElementRemoval = function (element, source, options) {
    if (!this.retrieveElement(element)) return;

    var insertionIndex = this.removeElementFromCache(element);
    var clonedOptions = deepCloneObject(options);
    clonedOptions.index = insertionIndex;
    element.off('all', this.processElementEvent, this);
    this.notify('remove', element, this, clonedOptions);
};

SourceCollectionWrapper.prototype.handleElementModification = function (element, options) {
    if (!element || !options) return;
    var elementPresent = this.retrieveElement(element);
    var meetsCriteria = this.inclusionPredicate(element, options.index);

    if (meetsCriteria) {
        if (elementPresent) {
            this.notify('change', element, this, options);
        } else {
            this.insertElementIntoCache(element);
            this.notify('add', element, this, options);
        }
    } else {
        if (elementPresent) {
            var insertionIndex = this.removeElementFromCache(element);
            var clonedOptions = deepCloneObject(options);
            clonedOptions.index = insertionIndex;
            this.notify('remove', element, this, clonedOptions);
        }
    }
};

SourceCollectionWrapper.prototype.handleSourceReset = function (source, options) {
    this.updateInternalStructure();
    this.notify('reset', this, options);
};

SourceCollectionWrapper.prototype.findSortedPosition = function (element, valueExtractor, contextReference) {
    var iterator = typeof valueExtractor === 'function' ? valueExtractor : function(target) {
        return target.get(valueExtractor);
    };

    return findInsertionPoint(this.internalElements, element, iterator, contextReference);
};

SourceCollectionWrapper.prototype.insertElementIntoCache = function (element) {
    if (this.retrieveElement(element)) return;
    var insertionIndex;

    if (this.comparisonFunction) {
        insertionIndex = this.findSortedPosition(element, this.comparisonFunction, this);
    } else if (this.comparisonFunction === undefined) {
        insertionIndex = this.findSortedPosition(element, function (target) {
            return this.sourceCollection.indexOf(target);
        }, this);
    } else {
        insertionIndex = this.size;
    }
    this.internalElements.splice(insertionIndex, 0, element);
    this.elementMap[element.cid] = element;
    if (element.id) {
        this.elementMap[element.id] = element;
    }
    this.size += 1;
};

SourceCollectionWrapper.prototype.removeElementFromCache = function (element) {
    element.off('all', this.processElementEvent, this);
    var insertionIndex = this.internalElements.indexOf(element);
    if (insertionIndex === -1) return insertionIndex;
    this.internalElements.splice(insertionIndex, 1);
    delete this.elementMap[element.cid];
    if (element.id) {
        delete this.elementMap[element.id];
    }
    this.size -= 1;
    return insertionIndex;
};

SourceCollectionWrapper.prototype.processElementEvent = function (eventKind) {
    var handledEvents = ['add', 'remove', 'change', 'reset', 'sort'];
    if (!arrayContains(handledEvents, eventKind)) {
        this.notify.apply(this, argumentsToArray(arguments));
    }
};

SourceCollectionWrapper.prototype.createDuplicate = function () {
    return new this.sourceCollection.constructor(this.internalElements);
};

SourceCollectionWrapper.prototype.retrieveElement = function(model) {
    return this.elementMap[model.cid] || (model.id ? this.elementMap[model.id] : undefined);
};

SourceCollectionWrapper.prototype.clearElements = function() {
    this.internalElements.length = 0;
    this.elementMap = {};
    this.size = 0;
};

SourceCollectionWrapper.prototype.sortElements = function(options) {
    if (!this.comparisonFunction) return;
    var instance = this;
    this.internalElements.sort(function(a, b) {
        return instance.comparisonFunction.call(instance, a, b);
    });
    if (!options || !options.isSilent) {
        this.notify('sort', this, options);
    }
};

SourceCollectionWrapper.prototype.get = SourceCollectionWrapper.prototype.retrieveElement;
SourceCollectionWrapper.prototype.at = function(index) {
    return this.internalElements[index];
};
Object.defineProperty(SourceCollectionWrapper.prototype, 'models', {
    get: function() { return this.internalElements; }
});
Object.defineProperty(SourceCollectionWrapper.prototype, 'length', {
    get: function() { return this.size; }
});

var proxiedMethods = ['add', 'remove', 'set', 'reset', 'push', 'pop', 'unshift', 'shift', 'slice', 'sync', 'fetch'];
iterateArray(proxiedMethods, function (methodName) {
    SourceCollectionWrapper.prototype[methodName] = function () {
        return this.sourceCollection[methodName].apply(this.sourceCollection, argumentsToArray(arguments));
    };
});

var DynamicAggregateView = SourceCollectionWrapper;