const conversionUtility = require('react-tools');

const transformationFunction = (inputContent) => {
    return conversionUtility.transform(inputContent, { harmony: true });
};

const exportContainer = {};

Object.defineProperty(exportContainer, 'performConversion', {
    value: transformationFunction,
    writable: false,
    configurable: false
});

module.exports = exportContainer;