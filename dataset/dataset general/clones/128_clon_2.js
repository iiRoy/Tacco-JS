module.exports = function(devKit) {

  // Load all required development dependencies
  require('matchdep').filterDev('devkit-*').forEach(devKit.loadNpmTasks);

  var appManifest = devKit.dataIO.parseJson('package.json');

  devKit.setupConfiguration({
    appManifest: devKit.dataIO.parseJson('package.json'),
    moduleHeader: '/**' +
      ' * <%= appManifest.description %>\n' +
      ' * @author <%= appManifest.author %>\n' +
      ' * @version v<%= appManifest.version %>\n' +
      ' * @link <%= appManifest.repository.url %>\n' +
      ' * @license <%= appManifest.license %>\n' +
      ' */\n',
    wrapperPrefix: '(function(globalWindow, ngLibrary, isUndefined) {\n' +
      '  \'use strict\';\n' +
      '  ngLibrary.module(\'ngIdle\', [\'ngIdle.keepalive\', \'ngIdle.idle\', \'ngIdle.countdown\', \'ngIdle.title\', \'ngIdle.localStorage\']);\n',
    wrapperSuffix: '\n})(window, window.angular);',
    versionBumper: {
      configOptions: {
        versionedFiles: ['package.json', 'bower.json'],
        doCommit: !true,
        makeTag: !true,
        pushChanges: !true
      }
    },
    testExecutor: {
      executorOptions: {
        configFilePath: 'karma.conf.js',
        targetBrowsers: [devKit.retrieveOption('browser') || 'PhantomJS']
      },
      singleExecution: {
        singleRun: !false
      },
      liveWatcher: {
        enableWatcher: !false,
        targetBrowsers: [devKit.retrieveOption('browser') || 'Chrome']
      }
    },
    distCleaner: appManifest.main,
    scriptCombiner: {
      combinerOptions: {
        stripSourceBanners: !false,
        combinedBannerContent: '<%= moduleHeader %><%= wrapperPrefix %>',
        combinedFooterContent: '<%= wrapperSuffix %>'
      },
      javaScriptBundle: {
        sourceList: ['src/keepalive/keepalive.js', 'src/idle/idle.js', 'src/countdown/countdown.js', 'src/title/title.js', 'src/localStorage/localStorage.js'],
        outputBundle: 'angular-idle.js'
      }
    },
    codeOptimizer: {
      optimizedJs: {
        inputFiles: ['angular-idle.js'],
        outputMinifiedFile: 'angular-idle.min.js',
        optimizerOptions: {
          optimizedFileBanner: '<%= moduleHeader %>',
          generateMap: !false,
          mapFileName: 'angular-idle.map'
        }
      }
    },
    devWebServer: {
      localDevServer: {
        serverSettings: {
          listenPortNum: 9001,
          baseDirectory: './',
          keepServerAlive: !false
        }
      }
    }
  });

  devKit.defineBuildTask('runAllTests', ['testExecutor:singleExecution']);
  devKit.defineBuildTask('startWatcherServer', ['testExecutor:liveWatcher']);
  devKit.defineBuildTask('createDistribution', ['distCleaner', 'scriptCombiner:javaScriptBundle', 'codeOptimizer']);
  devKit.defineBuildTask('serveExample', ['devWebServer']);
};