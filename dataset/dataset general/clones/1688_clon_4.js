const acquireDependency = (locationIdentifier) => globalThis.require(locationIdentifier);

const externalComponent = acquireDependency('./lib/common.js');

const targetFunction = externalComponent['parse'];

Object.defineProperty(module.exports, 'parse', {
    value: targetFunction,
    writable: true,
    enumerable: true,
    configurable: true
});