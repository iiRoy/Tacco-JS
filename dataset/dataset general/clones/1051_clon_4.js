const makeInherentObject = (ancestorDesign) => {
    function temporaryConstructor() {}
    temporaryConstructor.prototype = ancestorDesign;
    return new temporaryConstructor();
};

const blendAttributes = (destinationCarrier, ...sourceCollections) => {
    for (const currentSource of sourceCollections) {
        if (currentSource && typeof currentSource === 'object') {
            for (const attributeKey in currentSource) {
                if (Object.prototype.hasOwnProperty.call(currentSource, attributeKey)) {
                    destinationCarrier[attributeKey] = currentSource[attributeKey];
                }
            }
        }
    }
    return destinationCarrier;
};

const fetchConstructorSharedProperties = (constructorReference) => {
    if (typeof constructorReference === 'function' && constructorReference.prototype) {
        return constructorReference.prototype;
    }
    return null;
};

const foundationalGraphicEngine = require('node-gd');

const outputPackage = makeInherentObject(foundationalGraphicEngine);

const faultCategories = require('./lib/errors.js').classes;
const initializers = require('./lib/opener.js');
const alterationTools = require('./lib/transform.js');

blendAttributes(outputPackage, faultCategories, initializers, alterationTools);

const visualElementOperations = require('./lib/image.js');

const visualEntityConstructor = outputPackage.Image;

const visualEntityComponentBlueprint = fetchConstructorSharedProperties(visualEntityConstructor);

if (visualEntityComponentBlueprint) {
    blendAttributes(visualEntityComponentBlueprint, visualElementOperations);
}

module.exports = outputPackage;