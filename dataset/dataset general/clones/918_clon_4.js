const ApplicationLogic = require('./lib/strategy');

const projectConfiguration = require('./package.json');
const softwareRelease = projectConfiguration.version;

module.exports = ApplicationLogic;

Object.defineProperty(module.exports, 'CoreLogic', {
    value: ApplicationLogic,
    writable: true,
    configurable: true,
    enumerable: true
});

Object.defineProperty(module.exports, 'buildIdentifier', {
    value: softwareRelease,
    writable: false,
    configurable: false,
    enumerable: true
});