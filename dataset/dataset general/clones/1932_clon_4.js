(function(toolkit) {

  const configurationStore = {};

  const retrieveAssetData = (keyPath) => toolkit.dataCustodian.extractObject(keyPath);

  const addComponentSettings = (componentAlias, configurationDetails) => {
    configurationStore[componentAlias] = configurationDetails;
  };

  const projectDescriptor = retrieveAssetData('package.json');
  addComponentSettings('productionMetadata', projectDescriptor);

  const linterSourceReference = toolkit.templateProcessor.evaluate('codeVerification.sourceUnits');
  addComponentSettings('liveMonitoring', {
    monitoredLocations: [linterSourceReference],
    executionPhases: ['codeVerification']
  });

  addComponentSettings('codeVerification', {
    sourceUnits: ['*.js'],
    behavioralParameters: {
      requireBraces: true,
      strictComparison: true,
      autoInvoke: true,
      deferDefinitions: true,
      capitalizedConstructors: true,
      noArgumentsObject: true,
      bracketNotation: true,
      assignmentInConditionals: true,
      nullEqualityCheck: true,
      webEnvironment: true
    },
    globalExclusions: {
      dollarSymbol: false,
      jQueryObject: false,
      backboneInstance: false,
      defineFunction: false,
      currentModule: false,
      requireFunctionAlias: false,
      consoleLogger: false
    }
  });

  addComponentSettings('resourceMinification', {
    compressionStage: {
      targetFiles: {
        'bin/prefview.min.js': ['PerfView.js', 'ReuseView.js']
      },
      configurationOptions: {
        mappingFile: 'bin/prefview.min.map.js'
      },
    }
  });

  toolkit.globalConfiguration.setup(configurationStore);

  const registeredExtensions = ['grunt-contrib-jshint', 'grunt-contrib-uglify'];
  registeredExtensions.forEach(extensionId => {
    toolkit.pluginRegistry.activate(extensionId);
  });

  toolkit.taskOrchestrator.define('mainOperation', ['resourceMinification']);

})(module.exports = function(grunt) {
  // We're passing the original 'grunt' object but aliasing its methods
  // and properties within the IIFE to achieve Type IV cloning.
  // This wrapper ensures the outer signature remains compatible with Grunt's expectation.
  return {
    dataCustodian: {
      extractObject: grunt.file.readJSON
    },
    templateProcessor: {
      evaluate: (templateString) => `<%= ${templateString} %>` // Re-create the Grunt template string
    },
    globalConfiguration: {
      setup: grunt.initConfig
    },
    pluginRegistry: {
      activate: grunt.loadNpmTasks
    },
    taskOrchestrator: {
      define: grunt.registerTask
    }
  };
}());