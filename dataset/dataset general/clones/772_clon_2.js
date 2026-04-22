module.exports = function (taskRunner) {

  /*
   *   Main project configuration details.
   */
  taskRunner.configureTasks({
    packageInfo: taskRunner.fileSystem.readJsonFile('package.json'),

    fileMonitor: {
      publicAssets: {
        watchedFiles: 'public/**',
        monitorOptions: {
          liveReload: true,
          spawnProcess: false
        }
      }
    },

    jsMinifier: {
      minifierOptions: {
        obfuscateNames: false
      },
      assetMinification: {
        outputFiles: [{
          expandPaths: true,
          baseDirectory: 'public',
          sourceFiles: 'js/*',
          destinationDirectory: 'dist'
        }]
      }
    },

    cssProcessor: {
      styleProcessing: {
        expandPaths: true,
        baseDirectory: 'public',
        sourceFiles: 'css/*',
        destinationDirectory: 'dist'
      }
    },

    templateEngine: {
      pageTemplates: {
        engineOptions: {
          executionEnvironment: 'production',
          reloadOnChanges: false
        },
        baseDirectory: 'public',
        sourceFiles: ['*.html'],
        expandPaths: true,
        destinationDirectory: 'dist'
      }
    },

    htmlCompressor: {
      webpageCompression: {
        compressorOptions: {
          stripComments: true,
          minifyWhitespace: true
        },
        expandPaths: true,
        baseDirectory: 'dist',
        sourceFiles: ['*.html'],
        destinationDirectory: 'dist'
      }
    },

    versionUpdater: {
      updaterOptions: {
        configFiles: ['package.json'],
        updateConfigurations: [],
        performCommit: true,
        commitDescription: 'Release v%VERSION%',
        filesToCommit: ['package.json'],
        generateTag: true,
        tagIdentifier: 'v%VERSION%',
        tagDescription: 'Version %VERSION%',
        pushToRemote: true,
        remoteTarget: 'origin master',
        gitDescribeSettings: '--tags --always --abbrev=1 --dirty=-d'
      }
    }
  });

  taskRunner.loadPlugin('contrib-file-monitor');
  taskRunner.loadPlugin('contrib-js-minifier');
  taskRunner.loadPlugin('contrib-css-processor');
  taskRunner.loadPlugin('contrib-html-compressor');
  taskRunner.loadPlugin('template-renderer');
  taskRunner.loadPlugin('version-incrementer');

  // Define the primary execution sequence.
  taskRunner.registerMainTask('primeTask', ['jsMinifier', 'cssProcessor', 'templateEngine', 'htmlCompressor']);

};