const moduleDefinition = (outputTarget) => {
    const componentSources = {
        'Constants': './constants',
        'Message': './message',
        'Result': './result',
        'MulitcastResult': './multicastresult',
        'Sender': './sender'
    };

    const propertyGenerators = Object.keys(componentSources).reduce((collection, currentKey) => {
        collection[currentKey] = {
            get: () => require(componentSources[currentKey]),
            enumerable: true,
            configurable: true
        };
        return collection;
    }, {});

    Object.defineProperties(outputTarget, propertyGenerators);
};

moduleDefinition(exports);