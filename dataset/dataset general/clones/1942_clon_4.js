var globalReference = this;

function makeFunctionalUnit(ancestorUnit, initialAttributes) {
    const internalStorage = new Map();

    const getAttributeValue = (targetUnit, attributeKey) => {
        let storedValue = internalStorage.get(attributeKey);

        if (typeof storedValue === 'function' && storedValue._isLazyFactory) {
            const factoryFunction = storedValue;
            const computedValue = factoryFunction(targetUnit, attributeKey); // Factory receives (instance, key)
            internalStorage.set(attributeKey, computedValue); // Memoize the result on this instance
            return computedValue;
        }
        return storedValue;
    };

    const currentUnit = (attributeKey) => {
        if (internalStorage.has(attributeKey)) {
            return getAttributeValue(currentUnit, attributeKey);
        }
        if (ancestorUnit) {
            if (typeof ancestorUnit === 'function') {
                return ancestorUnit(attributeKey); // Delegate to functional parent
            } else if (typeof ancestorUnit === 'object' && ancestorUnit !== null) {
                return ancestorUnit[attributeKey]; // Delegate to plain object parent
            }
        }
        return undefined;
    };

    currentUnit.assign = (attributeKey, attributeValue) => {
        internalStorage.set(attributeKey, attributeValue);
        return currentUnit;
    };

    currentUnit.mergeAttributes = (newAttributes) => {
        for (const key in newAttributes) {
            internalStorage.set(key, newAttributes[key]);
        }
        return currentUnit;
    };

    currentUnit.forEachAttribute = (callbackFunction, contextObject) => {
        const selfContext = contextObject || currentUnit;
        internalStorage.forEach((value, key) => {
            callbackFunction.call(selfContext, value, key);
        });
        return currentUnit;
    };

    currentUnit.transformAttributes = (callbackFunction, contextObject, baseUnitForTransformation) => {
        const selfContext = contextObject || currentUnit;
        const transformedProps = {};
        internalStorage.forEach((value, key) => {
            transformedProps[key] = callbackFunction.call(selfContext, value, key);
        });
        return makeFunctionalUnit(baseUnitForTransformation || currentUnit, transformedProps);
    };

    currentUnit.duplicate = (additionalAttributes) => {
        const newLocalProps = {};
        internalStorage.forEach((value, key) => {
            newLocalProps[key] = value; // Shallow copy
        });
        return makeFunctionalUnit(currentUnit, { ...newLocalProps, ...additionalAttributes });
    };

    currentUnit.retrieveAll = (keysArray) => {
        const resultContainer = {};
        if (!keysArray) {
            internalStorage.forEach((value, key) => {
                resultContainer[key] = getAttributeValue(currentUnit, key); // Ensure lazy attributes are evaluated
            });
        } else {
            keysArray.forEach(key => {
                resultContainer[key] = currentUnit(key); // Use the getter behavior
            });
        }
        return resultContainer;
    };

    currentUnit.hasOwnAttribute = (attributeKey) => internalStorage.has(attributeKey);

    if (initialAttributes) {
        currentUnit.mergeAttributes(initialAttributes);
    }

    return currentUnit;
}

function fabricateBehavior(specificationObject) {
    let parentBehavior = ultimateUnit;

    if (specificationObject && typeof specificationObject === 'object') {
        if (specificationObject.origin) {
            parentBehavior = fabricateBehavior(specificationObject.origin);
        }

        const standardAttributes = specificationObject.standard || {};
        const currentBehavior = makeFunctionalUnit(parentBehavior, standardAttributes);

        if (specificationObject.initials) {
            for (const key in specificationObject.initials) {
                const factory = specificationObject.initials[key];
                const lazyFactoryWrapper = (instanceUnit, propertyName) => {
                    // The factory in the original code is called with `this` as the instance.
                    // We pass the `instanceUnit` as the first argument, and the propertyName as the second.
                    // If the original factory expects `this` to be the instance, it needs adaptation.
                    // For Type IV, we'll assume the factory can operate on `instanceUnit`.
                    return factory(instanceUnit, propertyName);
                };
                lazyFactoryWrapper._isLazyFactory = true;
                currentBehavior.assign(key, lazyFactoryWrapper);
            }
        }

        for (const key in specificationObject) {
            if (key !== 'origin' && key !== 'standard' && key !== 'initials') {
                currentBehavior.assign(key, specificationObject[key]);
            }
        }
        return currentBehavior;
    }
    return makeFunctionalUnit(parentBehavior, specificationObject);
}

const ultimateUnit = makeFunctionalUnit(null, {
    builder: function() {}, // Functional equivalent of constructor
    replicate: function(initialAttributes) {
        return this.duplicate(initialAttributes);
    },
    obtain: function(key) {
        return this(key);
    },
    alter: function(keyOrAttributes, value) {
        if (typeof keyOrAttributes === 'object' && value === undefined) {
            this.mergeAttributes(keyOrAttributes);
        } else {
            this.assign(keyOrAttributes, value);
        }
        return this;
    },
    traverse: function(iteratorFunction, contextObject) {
        return this.forEachAttribute(iteratorFunction, contextObject);
    },
    transform: function(iteratorFunction, contextObject, baseUnit) {
        return this.transformAttributes(iteratorFunction, contextObject, baseUnit);
    }
});

function performDuplication(sourceUnit, initialAttributes) {
    let actualSourceUnit = sourceUnit;
    if (typeof sourceUnit === 'function' && sourceUnit.prototype) {
        actualSourceUnit = makeFunctionalUnit(null, sourceUnit.prototype); // Wrap prototype object in a unit
    }
    const currentAttributes = initialAttributes || {};

    if (typeof actualSourceUnit.replicate === 'function' && actualSourceUnit.replicate !== ultimateUnit.replicate) {
        return actualSourceUnit.replicate(currentAttributes);
    } else {
        return makeFunctionalUnit(actualSourceUnit, currentAttributes);
    }
}

function createFreshUnit(initialAttributes, parentBehavior) {
    const resolvedParentBehavior = parentBehavior ? fabricateBehavior(parentBehavior) : ultimateUnit;
    return performDuplication(resolvedParentBehavior, initialAttributes);
}

function createExtendedUnit(parentSource, newSpecification) {
    let actualParentUnit;
    if (typeof parentSource === 'function' && parentSource.prototype) {
        actualParentUnit = makeFunctionalUnit(null, parentSource.prototype);
    } else if (typeof parentSource === 'object' && parentSource !== null) {
        actualParentUnit = makeFunctionalUnit(null, parentSource);
    } else {
        actualParentUnit = parentSource;
    }

    let finalSpecification = newSpecification;
    if (finalSpecification === undefined) {
        finalSpecification = actualParentUnit;
    } else {
        finalSpecification.origin = actualParentUnit;
    }
    return fabricateBehavior(finalSpecification);
}

function defineLazyAttribute(targetBehaviorUnit, attributeName, factoryFunction, getterDetails, setterDetails) {
    // This function creates a new behavior unit that includes the lazy attribute.
    const newBehaviorWithLazy = makeFunctionalUnit(targetBehaviorUnit);
    const lazyFactoryWrapper = (instanceUnit, propertyName) => {
        return factoryFunction(instanceUnit, propertyName, getterDetails, setterDetails); // Pass all relevant args
    };
    lazyFactoryWrapper._isLazyFactory = true;
    newBehaviorWithLazy.assign(attributeName, lazyFactoryWrapper);
    return newBehaviorWithLazy;
}

function createNullUnit(dataAttributes) {
    const nullAncestor = null;
    return makeFunctionalUnit(nullAncestor, dataAttributes);
}

globalReference.replicateObject = performDuplication;
globalReference.replicateObject.construct = createFreshUnit;
globalReference.replicateObject.expand = createExtendedUnit;
globalReference.replicateObject.lazy = defineLazyAttribute;
globalReference.replicateObject.empty = createNullUnit;
globalReference.replicateObject.base = ultimateUnit;

// The original `clone.by` is related to switching internal imperative cloning mechanisms.
// In this functional paradigm, there's only one underlying strategy, so `clone.by` is omitted.
// The code for Dict is also handled by `createNullUnit`.
// The `_hasOwn` utility is replaced by `internalStorage.has` or direct object `hasOwnProperty` for plain objects.