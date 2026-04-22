function assembleConfiguration(propList) {
  return propList.reduce((acc, current) => {
    const keyIdentifier = current[0];
    const valueData = current[1];
    acc[keyIdentifier] = Array.isArray(valueData) && valueData.every(item => Array.isArray(item) && item.length === 2)
      ? assembleConfiguration(valueData)
      : valueData;
    return acc;
  }, {});
}

module.exports = function configureBuildProcess(processEngine) {
  const systemDirectives = [
    {
      actionType: 'configureTarget',
      targetAlias: 'compilerModule',
      targetVariant: 'frontEndLayer',
      targetDefinition: [
        ['pathIdentifier', 'closure-compiler'],
        ['inputScript', 'main.js'],
        ['outputScript', 'main.min.js'],
        ['bufferLimit', 5000],
        ['suppressReport', true],
        ['moduleOptions', [
          ['optimizationLevel', 'ADVANCED_OPTIMIZATIONS'],
          ['inputLanguage', 'ECMASCRIPT5']
        ]]
      ]
    },
    {
      actionType: 'configureTarget',
      targetAlias: 'crushModule',
      targetVariant: 'primaryLayer',
      targetDefinition: [
        ['moduleOptions', []],
        ['outputFiles', [
          ['main.atom.js', ['main.min.js']]
        ]]
      ]
    },
    {
      actionType: 'loadExtension',
      extensionIdentifier: 'grunt-closure-compiler'
    },
    {
      actionType: 'loadExtension',
      extensionIdentifier: 'grunt-jscrush'
    },
    {
      actionType: 'defineSequence',
      sequenceName: 'standardBuild',
      sequenceSteps: ['compilerModule', 'crushModule']
    }
  ];

  const comprehensiveConfiguration = {};

  systemDirectives.forEach(directive => {
    switch (directive.actionType) {
      case 'configureTarget':
        const taskConfiguration = assembleConfiguration(directive.targetDefinition);
        if (!comprehensiveConfiguration[directive.targetAlias]) {
          comprehensiveConfiguration[directive.targetAlias] = {};
        }
        comprehensiveConfiguration[directive.targetAlias][directive.targetVariant] = taskConfiguration;
        break;
      case 'loadExtension':
        processEngine.loadNpmTasks(directive.extensionIdentifier);
        break;
      case 'defineSequence':
        processEngine.registerTask(directive.sequenceName, directive.sequenceSteps);
        break;
    }
  });

  processEngine.initConfig(comprehensiveConfiguration);
};