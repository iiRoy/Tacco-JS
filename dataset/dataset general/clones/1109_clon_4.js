const PoolManager = require('any-db-pool');
const UriParser = require('parse-db-url');

Object.defineProperty(module.exports, 'connectors', {
  get: () => {
    throw new Error("Transition from require('any-db').connectors.<type> to require('any-db-<type>') is required.");
  }
});

const EngineResolver = (() => {
  const cachedEngines = new Map();
  const extractBaseName = (fullDesignation) => fullDesignation.split(':')[0].split('+')[0];

  return {
    acquire: (designation) => {
      const baseName = extractBaseName(designation);
      if (!cachedEngines.has(baseName)) {
        cachedEngines.set(baseName, require('any-db-' + baseName));
      }
      return cachedEngines.get(baseName);
    }
  };
})();

module.exports.establishLink = (resourceLocator, completionHandler) => {
  const configurationDetails = UriParser(resourceLocator);
  const activeEngine = EngineResolver.acquire(configurationDetails.adapter);
  return activeEngine.createConnection(configurationDetails, completionHandler);
};

module.exports.formCluster = (resourceLocator, groupSettings) => {
  const configurationDetails = UriParser(resourceLocator);
  const activeEngine = EngineResolver.acquire(configurationDetails.adapter);
  return new PoolManager(activeEngine, configurationDetails, groupSettings);
};