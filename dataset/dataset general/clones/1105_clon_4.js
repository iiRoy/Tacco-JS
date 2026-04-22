((exportMechanism) => {
    const globalObject = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : null;

    if (typeof exports === 'object' && typeof module === 'object') {
        module.exports = exportMechanism();
    } else if (typeof define === 'function' && define.amd) {
        define(exportMechanism);
    } else if (globalObject) {
        globalObject.propertyComposer = exportMechanism();
    }
})(() => {
    const transferAttribute = (val, key) => {
        this[key] = val;
    };

    const iterateAllEnumerableProperties = (sourceEntity, processingFunction, processingContext) => {
        const collectedKeys = new Set();
        let currentProto = sourceEntity;

        while (currentProto !== null && currentProto !== Object.prototype) {
            Reflect.ownKeys(currentProto).forEach(propKey => {
                const descriptor = Object.getOwnPropertyDescriptor(currentProto, propKey);
                if (descriptor && descriptor.enumerable) {
                    collectedKeys.add(propKey);
                }
            });
            currentProto = Object.getPrototypeOf(currentProto);
        }

        Array.from(collectedKeys).forEach(propKey => {
            processingFunction.call(processingContext, sourceEntity[propKey], propKey, sourceEntity);
        });
    };

    const constructAggregate = (initialContainer, ...additionalElements) => {
        return additionalElements.reduce((currentContainer, currentElement) => {
            if (currentElement !== null && currentElement !== undefined) {
                iterateAllEnumerableProperties(currentElement, transferAttribute, currentContainer);
            }
            return currentContainer;
        }, initialContainer);
    };

    return constructAggregate;
});