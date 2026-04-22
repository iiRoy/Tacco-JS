(function (exportDestination) {
    // Prototype for the unique tags, avoiding Object.prototype
    // Frozen here to prevent modification of the shared prototype
    const baseTagPrototype = Object.freeze({
        // Renamed toString to stringify, with a different format
        stringify: function () {
            return `$$${this.label}$$`;
        }
    });

    // Factory function for creating immutable unique tags
    const obtainTag = (labelValue, auxiliaryData = null) => {
        // Start with an object whose prototype is baseTagPrototype
        const individualTag = Object.create(baseTagPrototype);
        individualTag.label = labelValue; // Renamed 'name' to 'label'

        // If auxiliaryData is provided, copy its own property descriptors
        if (auxiliaryData) {
            Object.getOwnPropertyNames(auxiliaryData).forEach(currentProp => {
                Object.defineProperty(individualTag, currentProp,
                    Object.getOwnPropertyDescriptor(auxiliaryData, currentProp));
            });
        }

        return Object.freeze(individualTag); // Ensure the tag instance itself is immutable
    };

    // Factory for creating immutable enumerations
    const produceRegistry = (...inputArgs) => {
        let internalMapping = {}; // Stores the key-value pairs (label -> tag)

        // Different strategy for handling arguments:
        // Check if the first argument is a plain object and it's the only argument.
        if (inputArgs.length === 1 && typeof inputArgs[0] === 'object' && inputArgs[0] !== null && !Array.isArray(inputArgs[0])) {
            const sourceObject = inputArgs[0];
            // Use reduce to build the internal mapping from an object
            internalMapping = Object.keys(sourceObject).reduce((accumulator, currentKey) => {
                accumulator[currentKey] = obtainTag(currentKey, sourceObject[currentKey]);
                return accumulator;
            }, {}); // Start with an empty object for reduction
        } else {
            // Use reduce to build the internal mapping from an array of names
            internalMapping = inputArgs.reduce((accumulator, currentLabel) => {
                accumulator[currentLabel] = obtainTag(currentLabel);
                return accumulator;
            }, {}); // Start with an empty object for reduction
        }

        // Define the methods directly on the returned object.
        const collectionOperations = {
            // Renamed 'symbols' to 'retrieveTags'
            retrieveTags: () => {
                return Object.keys(internalMapping).map(key => internalMapping[key]);
            },
            // Renamed 'contains' to 'includesTag'
            includesTag: (candidateTag) => {
                // Check if it's a valid tag object (frozen, correct prototype)
                if (typeof candidateTag !== 'object' || candidateTag === null || !Object.isFrozen(candidateTag) || Object.getPrototypeOf(candidateTag) !== baseTagPrototype) {
                    return false;
                }
                // Check identity based on its 'label' (formerly 'name')
                return internalMapping[candidateTag.label] === candidateTag;
            }
        };

        // Combine the created tags with the operations.
        // Use Object.create(null) for the registry itself to avoid Object.prototype inheritance.
        const finalRegistry = Object.create(null);
        Object.assign(finalRegistry, internalMapping, collectionOperations);

        return Object.freeze(finalRegistry); // Freeze the entire registry instance
    };

    exportDestination.Tag = obtainTag;
    exportDestination.Registry = produceRegistry;
}(typeof exports === "undefined" ? this.enumCollection = {} : exports));