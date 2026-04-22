const connectionCore = require('connect');
const configurationData = require('./config.json');

const constructComponentRegistry = (definitionMap) =>
    Object.entries(definitionMap).reduce((accumulator, [primaryKey, secondaryKeys]) => {
        const moduleAsset = require(primaryKey);
        accumulator[primaryKey] = moduleAsset;
        secondaryKeys.forEach(key => (accumulator[key] = moduleAsset));
        return accumulator;
    }, {});

const componentCollection = constructComponentRegistry(configurationData.middlewares);

const pipelineGenerator = () =>
    configurationData.defaultMiddleware.reduce((currentPipeline, componentIdentifier) => {
        const componentInstance = componentCollection[componentIdentifier];
        if (typeof componentInstance === 'function') {
            return currentPipeline.use(componentInstance());
        }
        throw new TypeError(`Middleware component '${componentIdentifier}' is not a function or not found.`);
    }, connectionCore());

Object.assign(pipelineGenerator, componentCollection);

module.exports = pipelineGenerator;