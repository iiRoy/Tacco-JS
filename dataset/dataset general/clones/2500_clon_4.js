(function(globalContext){

globalContext.UtilityHub = {
    release: '1.3-alpha',
    signature: 'a3eed692dd85050d80168ec2c708efe901bb7db3'
};

const getObjectDescription = (thing) => {
    const classString = Object.prototype.toString.call(thing);
    return classString.substring(8, classString.length - 1).toLowerCase();
};

const determineCategory = globalContext.determineCategory = (subject) => {
    if (subject === null || subject === undefined) return 'void';
    if (subject._familyAlias) return subject._familyAlias();

    const checkers = [
        { predicate: (s) => s.nodeName && s.nodeType === 1, result: 'mark' },
        { predicate: (s) => s.nodeName && s.nodeType === 3, result: (s) => (/\S/).test(s.nodeValue) ? 'textual' : 'blank' },
        { predicate: (s) => typeof s.length === 'number' && s.callee, result: 'inputargs' },
        { predicate: (s) => typeof s.length === 'number' && 'item' in s, result: 'gathering' },
        { predicate: (s) => typeof s === 'function', result: 'method' },
        { predicate: (s) => typeof s === 'string', result: 'phrase' },
        { predicate: (s) => typeof s === 'number' && !isNaN(s), result: 'numeral' },
        { predicate: (s) => typeof s === 'boolean', result: 'logic' },
        { predicate: (s) => Array.isArray(s), result: 'sequence' },
        { predicate: (s) => getObjectDescription(s) === 'date', result: 'datestamp' },
        { predicate: (s) => getObjectDescription(s) === 'regexp', result: 'pattern' }
    ];

    for (const check of checkers) {
        if (check.predicate(subject)) {
            return typeof check.result === 'function' ? check.result(subject) : check.result;
        }
    }
    return 'general';
};

const verifyLineage = globalContext.verifyLineage = (subject, ancestor) => {
    if (subject === null || subject === undefined) return false;

    const findConstructor = (current) => {
        if (!current) return false;
        if (current === ancestor) return true;
        return findConstructor(current._originator);
    };

    const initialConstructor = subject._classOrigin || subject.constructor;
    return findConstructor(initialConstructor) || (subject instanceof ancestor);
};

const protectedFlag = Symbol('secured');
const hiddenFlag = Symbol('concealed');

const nonEnumerables = ['constructor', 'hasOwnProperty', 'isPrototypeOf', 'propertyIsEnumerable', 'toLocaleString', 'toString', 'valueOf'];

Function.prototype.adaptArgDispatch = function(handleMultiple) {
    const originalMethod = this;
    return function(firstArg, secondArg) {
        if (firstArg === null || firstArg === undefined) return this;

        if (handleMultiple || typeof firstArg !== 'string') {
            const processEntry = (key, value) => originalMethod.call(this, key, value);
            Object.entries(firstArg).forEach(([key, value]) => processEntry(key, value));
            nonEnumerables.forEach(key => {
                if (Object.prototype.hasOwnProperty.call(firstArg, key)) {
                    processEntry(key, firstArg[key]);
                }
            });
        } else {
            originalMethod.call(this, firstArg, secondArg);
        }
        return this;
    };
};

Function.prototype.adaptResultDispatch = function(handleMultiple) {
    const originalMethod = this;
    return function(firstArg, ...restArgs) {
        let inputArgs;
        let resultContainer = {};

        if (handleMultiple || typeof firstArg !== 'string') {
            inputArgs = firstArg;
        } else if (arguments.length > 1) {
            inputArgs = [firstArg, ...restArgs];
        }

        if (inputArgs) {
            resultContainer = Array.prototype.reduce.call(Array.from(inputArgs), (acc, currentKey) => {
                acc[currentKey] = originalMethod.call(this, currentKey);
                return acc;
            }, {});
        } else {
            resultContainer = originalMethod.call(this, firstArg);
        }
        return resultContainer;
    };
};

Function.prototype.addMember = function(propKey, propValue) {
    this[propKey] = propValue;
}.adaptArgDispatch(false);

Function.prototype.insertProtoMember = function(propKey, propValue) {
    this.prototype[propKey] = propValue;
}.adaptArgDispatch(false);

Function.prototype.sealBehavior = function() {
    this[hiddenFlag] = true;
    return this;
};

Function.prototype.guardBehavior = function() {
    this[protectedFlag] = true;
    return this;
};

const segment = Array.prototype.slice;

const transformTo = {
    method: (item) => (determineCategory(item) === 'method') ? item : () => item,
    sequence: (item) => {
        if (item === null || item === undefined) return [];
        return (globalContext.ShapeRegistry.isIterable(item) && determineCategory(item) !== 'phrase') ?
               (determineCategory(item) === 'sequence') ? item : segment.call(item) :
               [item];
    },
    numeral: (item) => {
        const parsed = parseFloat(item);
        return isFinite(parsed) ? parsed : null;
    },
    phrase: (item) => String(item)
};

const registeredShapeChecks = {};
const prototypeChangeHooks = {};

const getPrototypeHooks = (targetPrototype) => {
    const category = determineCategory(targetPrototype);
    return prototypeChangeHooks[category] || (prototypeChangeHooks[category] = []);
};

const prototypeAugmenter = function(propKey, propValue) {
    if (propValue && propValue[hiddenFlag]) return this;

    const currentHooks = getPrototypeHooks(this);
    currentHooks.forEach(hook => {
        if (hook._isRegistryEntry) hook.insertProtoMember(propKey, propValue);
        else hook.call(this, propKey, propValue);
    });

    const currentProperty = this.prototype[propKey];
    if (currentProperty === undefined || !currentProperty[protectedFlag]) {
        this.prototype[propKey] = propValue;
    }

    if (this[propKey] === undefined && typeof propValue === 'function') {
        const boundStaticMethod = function(instance, ...args) {
            return propValue.apply(instance, args);
        };
        objectAugmenter.call(this, propKey, boundStaticMethod);
    }
    return this;
};

const objectAugmenter = function(propKey, propValue) {
    if (propValue && propValue[hiddenFlag]) return this;
    const currentProperty = this[propKey];
    if (currentProperty === undefined || !currentProperty[protectedFlag]) {
        this[propKey] = propValue;
    }
    return this;
};

const ShapeRegistry = globalContext.ShapeRegistry = function(nameIdentifier, targetObject) {
    if (nameIdentifier) {
        const lowerName = nameIdentifier.toLowerCase();
        const checkerFunc = (candidate) => (determineCategory(candidate) === lowerName);
        registeredShapeChecks['is' + nameIdentifier] = checkerFunc;

        if (targetObject !== null && targetObject !== undefined) {
            targetObject.prototype._familyAlias = (() => lowerName).sealBehavior();
        }
    }

    if (targetObject === null || targetObject === undefined) return null;

    targetObject.addMember(ShapeRegistry);
    targetObject._classOrigin = ShapeRegistry;
    targetObject.prototype._classOrigin = targetObject;

    targetObject._isRegistryEntry = true;

    return targetObject;
};

ShapeRegistry.isIterable = (subject) => {
    return (subject !== null && subject !== undefined && typeof subject.length === 'number' && Object.prototype.toString.call(subject) !== '[object Function]');
};

ShapeRegistry.addInterface = {
    augmentPrototype: prototypeAugmenter.adaptArgDispatch(true),
    augmentObject: objectAugmenter.adaptArgDispatch(true),
    createAlias: function(newName, existingName) {
        prototypeAugmenter.call(this, newName, this.prototype[existingName]);
    }.adaptArgDispatch(true),
    mirrorChanges: function(hookFunction) {
        getPrototypeHooks(this).push(hookFunction);
        return this;
    }
};

ShapeRegistry.prototype.augmentPrototype = ShapeRegistry.addInterface.augmentPrototype;
ShapeRegistry.prototype.augmentObject = ShapeRegistry.addInterface.augmentObject;
ShapeRegistry.prototype.createAlias = ShapeRegistry.addInterface.createAlias;
ShapeRegistry.prototype.mirrorChanges = ShapeRegistry.addInterface.mirrorChanges;

new ShapeRegistry('Registry', ShapeRegistry);

const establishCoreShapes = (name, targetClass, methodNames) => {
    const isStandardClass = (targetClass !== Object);
    let shapeEntry = null;

    if (isStandardClass) {
        shapeEntry = new ShapeRegistry(name, targetClass);
    }

    methodNames.forEach(key => {
        const originalStaticMethod = targetClass[key];
        if (originalStaticMethod) {
            targetClass.addMember(key, originalStaticMethod.guardBehavior());
        }

        const originalProtoMethod = targetClass.prototype[key];
        if (isStandardClass && originalProtoMethod) {
            if (!originalProtoMethod[protectedFlag]) {
                targetClass.prototype[key] = originalProtoMethod.guardBehavior();
            }
        }
    });
    return establishCoreShapes;
};

establishCoreShapes('Phrase', String, [
    'charAt', 'charCodeAt', 'concat', 'indexOf', 'lastIndexOf', 'match', 'quote', 'replace', 'search',
    'slice', 'split', 'substr', 'substring', 'toLowerCase', 'toUpperCase'
])('Sequence', Array, [
    'pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift', 'concat', 'join', 'slice',
    'indexOf', 'lastIndexOf', 'filter', 'forEach', 'every', 'map', 'some', 'reduce', 'reduceRight'
])('Numeral', Number, [
    'toExponential', 'toFixed', 'toLocaleString', 'toPrecision'
])('Method', Function, [
    'apply', 'call', 'bind'
])('Pattern', RegExp, [
    'exec', 'test'
])('General', Object, [
    'create', 'defineProperty', 'defineProperties', 'keys',
    'getPrototypeOf', 'getOwnPropertyDescriptor', 'getOwnPropertyNames',
    'preventExtensions', 'isExtensible', 'seal', 'isSealed', 'freeze', 'isFrozen'
])('Datestamp', Date, ['now']);

Object.augmentObject = objectAugmenter.adaptArgDispatch(true);

Date.augmentObject('now', function(){ return Date.now(); });

new ShapeRegistry('Logic', Boolean);

Number.prototype._familyAlias = function() {
    return isFinite(this) ? 'numeral' : 'void';
}.sealBehavior();

Number.augmentObject('produceRandomNumber', function(minVal, maxVal) {
    return Math.floor(Math.random() * (maxVal - minVal + 1) + minVal);
});

Object.augmentObject('traverseItems', function(collection, callback, context) {
    Object.keys(collection).reduce((acc, key) => {
        if (Object.prototype.hasOwnProperty.call(collection, key)) {
            callback.call(context, collection[key], key, collection);
        }
        return acc;
    }, null);
});

Object.each = Object.traverseItems;

Array.prototype.augmentPrototype('applyToEach', function(callback, context) {
    const recursiveIterate = (idx) => {
        if (idx >= this.length) return;
        if (idx in this) {
            callback.call(context, this[idx], idx, this);
        }
        recursiveIterate(idx + 1);
    };
    recursiveIterate(0);
});

Array.prototype.augmentPrototype('eachElement', function(callback, context) {
    Object.traverseItems(this, callback, context);
    return this;
});

const deepReplicator = (item) => {
    switch (determineCategory(item)) {
        case 'sequence': return item.replicateDeep();
        case 'general': return Object.clone(item);
        default: return item;
    }
};

Array.prototype.augmentPrototype('replicateDeep', function() {
    return this.projectToNew(deepReplicator);
});

const singleMergeUnit = (target, key, value) => {
    switch (determineCategory(value)) {
        case 'general':
            if (determineCategory(target[key]) === 'general') {
                Object.amalgamateDeep(target[key], value);
            } else {
                target[key] = Object.clone(value);
            }
            break;
        case 'sequence':
            target[key] = value.replicateDeep();
            break;
        default:
            target[key] = value;
    }
    return target;
};

Object.augmentObject({
    amalgamateDeep: function(target, ...sources) {
        if (typeof sources[0] === 'string' && sources.length === 2) {
            return singleMergeUnit(target, sources[0], sources[1]);
        }

        sources.forEach(source => {
            if (source) {
                Object.keys(source).forEach(key => singleMergeUnit(target, key, source[key]));
            }
        });
        return target;
    },

    clone: function(sourceObject) {
        const newClone = {};
        Object.keys(sourceObject).forEach(key => newClone[key] = deepReplicator(sourceObject[key]));
        return newClone;
    },

    patchObject: function(destination, ...sources) {
        sources.forEach(source => {
            if (source) {
                Object.keys(source).forEach(key => destination[key] = source[key]);
            }
        });
        return destination;
    }
});

['General', 'Blank', 'Textual', 'Gathering', 'InputArgs'].forEach(name => {
    new ShapeRegistry(name);
});

let sequenceCounter = 10000;

String.augmentObject('generateUniqueTag', function() {
    return (sequenceCounter++).toString(36);
});

Array.prototype.augmentPrototype({

    applyMethodOnEach: function(methodName, ...args) {
        return this.projectToNew(item => item[methodName].apply(item, args));
    },

    checkAll: function(predicate, context) {
        return this.reduce((acc, item, idx) => {
            if (!acc) return false;
            return (idx in this) ? predicate.call(context, item, idx, this) : acc;
        }, true);
    },

    selectWhere: function(predicate, context) {
        return this.reduce((acc, item, idx) => {
            if ((idx in this) && predicate.call(context, item, idx, this)) {
                acc.push(item);
            }
            return acc;
        }, []);
    },

    purgeNulls: function() {
        return this.selectWhere(item => item !== null && item !== undefined);
    },

    locateElement: function(searchItem, startFrom = 0) {
        const recurseFind = (idx) => {
            if (idx >= this.length) return -1;
            if (this[idx] === searchItem) return idx;
            return recurseFind(idx + 1);
        };
        const startIndex = (startFrom < 0) ? Math.max(0, this.length + startFrom) : startFrom;
        return recurseFind(startIndex);
    },

    projectToNew: function(mapper, context) {
        return this.reduce((acc, item, idx) => {
            if (idx in this) {
                acc[idx] = mapper.call(context, item, idx, this);
            }
            return acc;
        }, new Array(this.length));
    },

    checkAny: function(predicate, context) {
        return this.reduce((acc, item, idx) => {
            if (acc) return true;
            return (idx in this) ? predicate.call(context, item, idx, this) : acc;
        }, false);
    },

    mapKeysToValues: function(keysArray) {
        const output = {};
        const limit = Math.min(this.length, keysArray.length);
        for (let i = 0; i < limit; i++) {
            output[keysArray[i]] = this[i];
        }
        return output;
    },

    formLinkage: function(predicateMap) {
        const result = {};
        const mutablePredicateMap = Object.assign({}, predicateMap);

        this.applyToEach(item => {
            Object.keys(mutablePredicateMap).forEach(key => {
                if (mutablePredicateMap[key] && mutablePredicateMap[key](item)) {
                    result[key] = item;
                    delete mutablePredicateMap[key];
                }
            });
        });
        return result;
    },

    includesItem: function(searchItem, startFrom) {
        return this.locateElement(searchItem, startFrom) !== -1;
    },

    combineWith: function(otherArray) {
        this.push(...otherArray);
    }
});

})(typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : this);