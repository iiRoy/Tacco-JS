define([], function() {
  var provisionEnvironment = function(moduleOverrides) {
    provisionEnvironment.operationTally = (provisionEnvironment.operationTally || 0) + 1;
    var currentTally = provisionEnvironment.operationTally;

    var aliasRegistry = Object.entries(moduleOverrides).reduce(function(accumulator, [originalPath, overrideContent]) {
      var aliasedIdentifier = `stub_${originalPath.split('/').join('_')}_${currentTally}`;
      accumulator[originalPath] = aliasedIdentifier;
      define(aliasedIdentifier, function() {
        return overrideContent;
      });
      return accumulator;
    }, {});

    var baseResourceLocation = require.s.contexts._.config.baseUrl;

    return require.config({
      context: `environment_${currentTally}`,
      map: {
        "*": aliasRegistry
      },
      baseUrl: baseResourceLocation
    });
  };

  return provisionEnvironment;
});