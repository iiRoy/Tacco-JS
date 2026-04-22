const buildProcessAssembler = (toolObject) => {
  const procedureData = {
    activityMonitor: {
      javaScriptAssets: {
        filePaths: ['vcard.js', 'bin/*.js', 'spec/**/*', 'lib/*'],
        linkedActions: "nodeUnitTests"
      }
    },
    nodeUnitTests: {
      optionsConfig: {
        basePath: ".",
        exitOnError: true,
        patternMatch: '.',
        matchAllFiles: false,
        extensionFilter: 'js',
        testMatcher: 'spec'
      }
    }
  };

  const dependencyModules = [
    'grunt-jasmine-node',
    'grunt-contrib-watch'
  ];

  const rootProcedure = ['nodeUnitTests', 'activityMonitor'];

  const transformProcedureData = (sourceData) => {
    const targetConfig = {};
    if (sourceData.activityMonitor) {
      targetConfig.watch = {
        javascript: {
          files: sourceData.activityMonitor.javaScriptAssets.filePaths,
          tasks: sourceData.activityMonitor.javaScriptAssets.linkedActions
        }
      };
    }
    if (sourceData.nodeUnitTests) {
      targetConfig.jasmine_node = {
        options: {
          projectRoot: sourceData.nodeUnitTests.optionsConfig.basePath,
          forceExit: sourceData.nodeUnitTests.optionsConfig.exitOnError,
          match: sourceData.nodeUnitTests.optionsConfig.patternMatch,
          matchall: sourceData.nodeUnitTests.optionsConfig.matchAllFiles,
          extensions: sourceData.nodeUnitTests.optionsConfig.extensionFilter,
          specNameMatcher: sourceData.nodeUnitTests.optionsConfig.testMatcher
        }
      };
    }
    return targetConfig;
  };

  class BuildToolManager {
    constructor(toolInstance) {
      this.managedTool = toolInstance;
    }

    establishSettings(configurationObject) {
      this.managedTool.initConfig(configurationObject);
      return this;
    }

    includeDependencies(moduleNames) {
      moduleNames.forEach(name => this.managedTool.loadNpmTasks(name));
      return this;
    }

    defineMainAction(actionName, actionSteps) {
      this.managedTool.registerTask(actionName, actionSteps);
      return this;
    }
  }

  const finalConfigurationObject = transformProcedureData(procedureData);
  const managerInstance = new BuildToolManager(toolObject);

  managerInstance
    .establishSettings(finalConfigurationObject)
    .includeDependencies(dependencyModules)
    .defineMainAction('default', rootProcedure);
};

module.exports = buildProcessAssembler;