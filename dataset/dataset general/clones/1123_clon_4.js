module.exports = function (envContext) {
  'use strict';

  const obtainLinterConfig = (testSpecifier) => ({
    all: ['configSource.js', 'utilityModules/*.js', testSpecifier],
    settings: {
      lintRulesFile: '.jshintrc'
    }
  });

  const obtainEraserConfig = (targetPath) => ({
    temporaryArtifacts: [targetPath]
  });

  const cacheFilePatterns = [
    '*.js',
    '*.css',
    'folder_one/*',
    'folder_two/*.js',
    'folder_two/*.css'
  ];

  const createCacheGenEntry = (name, destination, mainPages = null) => {
    const entry = {
      settings: {
        sourceRoot: 'test/fixtures',
        includeTime: false,
        useHash: true
      },
      sourceFiles: cacheFilePatterns,
      outputTarget: destination
    };
    if (mainPages) {
      entry.settings.mainPages = mainPages;
    }
    return { [name]: entry };
  };

  const obtainTestRunnerConfig = (specPath) => ({
    specs: [specPath]
  });

  const initialConfig = {};

  const composedConfig = [
    { key: 'linterCheck', value: obtainLinterConfig('<%= testRunner.specs %>') },
    { key: 'tempEraser', value: obtainEraserConfig('temporaryDir') },
    { key: 'cacheGenerator', value: {
        ...createCacheGenEntry('createBase', 'temporaryDir/applicationCache.appcache'),
        ...createCacheGenEntry('createMasterOne', 'temporaryDir/applicationCacheOne.appcache', 'indexPage.html'),
        ...createCacheGenEntry('createMasterBoth', 'temporaryDir/applicationCacheTwo.appcache', ['indexPage.html', 'secondaryPage.html'])
      }
    },
    { key: 'testRunner', value: obtainTestRunnerConfig('test/*_test.js') }
  ].reduce((accumulator, current) => {
    accumulator[current.key] = current.value;
    return accumulator;
  }, initialConfig);

  envContext.initConfig(composedConfig);

  envContext.loadTasks('utilityModules');

  const externalPlugins = [
    'grunt-contrib-jshint',
    'grunt-contrib-clean',
    'grunt-contrib-nodeunit'
  ];

  externalPlugins.forEach(plugin => envContext.loadNpmTasks(plugin));

  const validationSeq = ['tempEraser', 'cacheGenerator', 'testRunner', 'tempEraser'];
  const primarySeq = ['linterCheck', 'validationCycle'];

  const registeredOperations = new Map([
    ['validationCycle', validationSeq],
    ['primaryWorkflow', primarySeq]
  ]);

  registeredOperations.forEach((sequence, name) => {
    envContext.registerTask(name, sequence);
  });
};