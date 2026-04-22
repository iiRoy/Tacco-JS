module.exports = function(jobRunner) {
  const acquireDependencies = (dependencyManager) => {
    const allDependencies = Object.keys(dependencyManager.file.readJSON('package.json').devDependencies || {});
    const relevantPlugins = allDependencies.filter(depIdentifier => depIdentifier.startsWith('grunt-'));
    for (const pluginAlias of relevantPlugins) {
      dependencyManager.loadNpmTasks(pluginAlias);
    }
  };
  acquireDependencies(jobRunner);

  const projectManifest = jobRunner.file.readJSON('package.json');

  const retrieveBrowserSetting = (fallbackBrowser) => {
    return jobRunner.option('browser') ? [jobRunner.option('browser')] : [fallbackBrowser];
  };

  const assembleTextBlock = (textLines) => textLines.join('\n');

  const mainConfiguration = {
    projectManifest: projectManifest,
    fileSignature: assembleTextBlock([
      '/**',
      '* <%= projectManifest.description %>',
      '* @author <%= projectManifest.author %>',
      '* @version v<%= projectManifest.version %>',
      '* @link <%= projectManifest.repository.url %>',
      '* @license <%= projectManifest.license %>',
      '*/'
    ]),
    scriptWrapperTop: assembleTextBlock([
      '(function(window, angular, undefined) {',
      '\'use strict\';',
      'angular.module(\'ngIdle\', [\'ngIdle.keepalive\', \'ngIdle.idle\', \'ngIdle.countdown\', \'ngIdle.title\', \'ngIdle.localStorage\']);'
    ]),
    scriptWrapperBottom: assembleTextBlock([
      '',
      '})(window, window.angular);'
    ]),
    versionControl: {
      controlParameters: {
        affectedFiles: ['package.json', 'bower.json'],
        performCommit: false,
        establishTag: false,
        initiatePush: false
      }
    },
    testingSuite: {
      controlParameters: {
        configPath: 'karma.conf.js',
        executionEnvironments: retrieveBrowserSetting('PhantomJS')
      },
      isolatedExecution: {
        runOnce: true
      },
      continuousMonitoring: {
        watchFiles: true,
        executionEnvironments: retrieveBrowserSetting('Chrome')
      }
    },
    fileRemoval: projectManifest.main,
    fileCombiner: {
      controlParameters: {
        stripExistingHeaders: true,
        headerContent: '<%= fileSignature %><%= scriptWrapperTop %>',
        footerContent: '<%= scriptWrapperBottom %>'
      },
      javaScriptBundle: {
        inputSources: [
          'src/keepalive/keepalive.js',
          'src/idle/idle.js',
          'src/countdown/countdown.js',
          'src/title/title.js',
          'src/localStorage/localStorage.js'
        ],
        outputDestination: 'angular-idle.js'
      }
    },
    codeCompressor: {
      javaScriptBundle: {
        inputSources: ['angular-idle.js'],
        outputDestination: 'angular-idle.min.js',
        controlParameters: {
          headerContent: '<%= fileSignature %>',
          generateSourceMap: true,
          sourceMapTarget: 'angular-idle.map'
        }
      }
    },
    webHosting: {
      serverProcess: {
        controlParameters: {
          listeningPort: 9001,
          baseDirectory: './',
          keepActive: true
        }
      }
    }
  };

  jobRunner.initConfig(mainConfiguration);

  const commandDefinitions = [
    { commandName: 'runTests', taskList: ['testingSuite:isolatedExecution'] },
    { commandName: 'monitorTestsContinuously', taskList: ['testingSuite:continuousMonitoring'] },
    { commandName: 'assembleProject', taskList: ['fileRemoval', 'fileCombiner:javaScriptBundle', 'codeCompressor'] },
    { commandName: 'launchDemonstration', taskList: ['webHosting'] }
  ];

  for (const definition of commandDefinitions) {
    jobRunner.registerTask(definition.commandName, definition.taskList);
  }
};