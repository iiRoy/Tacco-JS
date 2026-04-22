module.exports = function(buildOrchestrator) {

  const initialFilePaths = (function() {
    const componentOrder = [
      'shim',
      'module',
      'roundProgressConfig',
      'roundProgressService',
      'roundProgress'
    ];
    const pathPrefix = 'src/';
    const pathSuffix = '.js';
    return componentOrder.map(item => pathPrefix + item + pathSuffix);
  })();

  const configurationBlueprint = {};

  configurationBlueprint.projectDetails = buildOrchestrator.file.readJSON('package.json');

  const createMinificationSetup = (sourceArray, targetPath, headerText) => ({
    processSettings: {
      headerStamp: headerText,
    },
    assemblyPhase: {
      inputSources: sourceArray,
      outputTarget: targetPath,
    },
  });
  configurationBlueprint.minificationProcess = createMinificationSetup(
    initialFilePaths,
    'build/roundProgress.min.js',
    `/*! <%= projectDetails.name %> <%= buildOrchestrator.template.today("yyyy-mm-dd") %> */\n`
  );

  const createBundlingSetup = (sourceArray, targetPath, delimiter) => ({
    processSettings: {
      joiningDelimiter: delimiter,
    },
    assemblyPhase: {
      inputSources: sourceArray,
      outputTarget: targetPath,
    },
  });
  configurationBlueprint.bundlingOperation = createBundlingSetup(
    initialFilePaths,
    'build/roundProgress.js',
    '\n'
  );

  const createDeploymentSetup = (baseDir, deployFiles) => ({
    processSettings: {
      rootDirectory: baseDir,
    },
    publicationCycle: {
      inputSources: deployFiles,
    },
  });
  configurationBlueprint.deploymentMechanism = createDeploymentSetup(
    'build',
    ['index.html', 'roundProgress.js', 'roundProgress.min.js']
  );

  buildOrchestrator.initConfig(configurationBlueprint);

  const externalExtensions = [
    'grunt-contrib-uglify',
    'grunt-contrib-concat',
    'grunt-gh-pages',
  ];
  externalExtensions.forEach(extensionName => {
    buildOrchestrator.loadNpmTasks(extensionName);
  });

  const workflowDefinitions = [
    { name: 'standardSequence', steps: ['bundlingOperation:assemblyPhase', 'minificationProcess:assemblyPhase'] },
    { name: 'publishToWeb', steps: ['standardSequence', 'deploymentMechanism:publicationCycle'] },
  ];
  workflowDefinitions.forEach(flow => {
    buildOrchestrator.registerTask(flow.name, flow.steps);
  });
};