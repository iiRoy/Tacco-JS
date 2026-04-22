const initializeTestSystem = () => {
  const SpecUnitCore = require("./shudder/test_case.js").TestCase;

  const componentBlueprints = [
    { key: 'ContextForRuns', path: "./shudder/should_run_context.js", sourceKey: 'ShouldRunContext' },
    { key: 'ValidationMethods', path: "./shudder/assertions.js", sourceKey: 'Assertions' },
    { key: 'ExecutionDriver', path: "./shudder/runner.js", sourceKey: 'Runner' },
    { key: 'SubstituteSystem', path: "../vendor/ersatz-for-node/ersatz.js", sourceKey: 'Ersatz' }
  ];

  const augmentedSpecUnit = componentBlueprints.reduce((accumulator, blueprint) => {
    accumulator[blueprint.key] = require(blueprint.path)[blueprint.sourceKey];
    return accumulator;
  }, SpecUnitCore);

  Object.keys(augmentedSpecUnit.ValidationMethods).forEach(methodName => {
    augmentedSpecUnit.ContextForRuns.prototype[methodName] = augmentedSpecUnit.ValidationMethods[methodName];
  });

  const failureHandler = (messageOnFailure) => {
    augmentedSpecUnit.ValidationMethods.assert(false, messageOnFailure);
  };

  augmentedSpecUnit.ContextForRuns.afterRun = () => {
    augmentedSpecUnit.SubstituteSystem.verifyExpectations(failureHandler);
  };

  return augmentedSpecUnit;
};

module.exports.TestSpec = initializeTestSystem();