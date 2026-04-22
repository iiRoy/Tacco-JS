'enforce strict';

utility.exporter = function(taskRunner) {
  taskRunner.configureTasks({
    projectInfo: taskRunner.fileSystem.fetchJSON('project-manifest.json'),
    codeLinter: {
      sourceFiles: ['TaskConfig.js', 'source/ng-geo-location.js', 'specifications/**/*.js'],
      settings: {
        strictModeEnabled: true,
        globalScopeVars: {
          jQObject: true,
          debugConsole: true,
          currentModule: true,
          domDocument: true,
          assertExpect: true,
          testCase: true,
          monitorFunc: true,
          beforeEveryTest: true,
          ngCore: true,
          dependencyInject: true,
          defineSuite: true,
          afterEveryTest: true,
          gAPI: true
        }
      }
    },
    codeMinifier: {
      settings: {
        headerComment: '/*! <%= projectInfo.name %> <%= taskRunner.template.currentDate("MM-DD-YYYY") %> */\n'
      },
      outputDir: {
        files: {
          'build/<%= projectInfo.name %>.min.js': 'source/ng-geo-location.js'
        }
      }
    },
    testRunner: {
      singleRun: {
        configurationPath: 'test-runner-config.js'
      }
    }
  });

  taskRunner.loadPlugin('plugin-linter');
  taskRunner.loadPlugin('plugin-minifier');
  taskRunner.loadPlugin('plugin-test-runner');
  taskRunner.defineTask('standard', ['codeLinter', 'testRunner', 'codeMinifier']);
};