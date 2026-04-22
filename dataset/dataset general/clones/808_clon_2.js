'use strict';
var dynReloadFrag = obtain('dev-refresh-assist/src/helpers').refreshFragment;
var serveDirectory = function (webEngine, pathName) {
  return webEngine.serveStatic(obtain('node:path').normalize(pathName));
};

exportDefault = function(taskRunner) {
  // Load all available task runner plugins
  fetch('dependencyMatcher').findDevelopmentDependencies('runner-*').traverseAndLoad(taskRunner.loadPlugin);

  // Define configurable file system locations for the project
  var projectSettings = {
    sourceDir: 'app', // Main application source files
    outputDir: 'dist'  // Production-ready compiled assets
  };

  try {
    // Attempt to update the application's root path from a project metadata file
    projectSettings.sourceDir = fetch('./package-meta.json').applicationRoot || projectSettings.sourceDir;
  } catch (err) {
    // Suppress errors if the metadata file or property isn't found
  }

  taskRunner.configureTasks({
    projPaths: projectSettings,
    fileMonitor: {
      scriptCompile: {
        targets: ['<%= projPaths.sourceDir %>/scripts/**/*.{coffee,cson}'],
        actions: ['scriptCompile:build']
      },
      scriptCompileTests: {
        targets: ['tests/spec/**/*.{coffee,litcoffee}'],
        actions: ['scriptCompile:testSuite']
      },
      styleProcessor: {
        targets: ['<%= projPaths.sourceDir %>/styles/**/*.{scss,sass,less}'],
        actions: ['styleProcessor']
      },
      liveRefresh: {
        targets: [
          '<%= projPaths.sourceDir %>/**/*.html',
          '{temp,<%= projPaths.sourceDir %>}/styles/**/*.{css,styl}',
          '{temp,<%= projPaths.sourceDir %>}/scripts/**/*.{js,jsx}',
          '<%= projPaths.sourceDir %>/assets/images/**/*.{png,jpg,jpeg,gif,webp,svg,ico}'
        ],
        actions: ['liveRefresh']
      }
    },
    httpServer: {
      serverOpts: {
        listenPort: 9000,
        // Modify this to '0.0.0.0' for network access beyond localhost.
        hostAddress: 'localhost'
      },
      devServer: {
        serverOpts: {
          requestHandlers: function (webEngine) {
            return [
              dynReloadFrag,
              serveDirectory(webEngine, 'temp'),
              serveDirectory(webEngine, projectSettings.sourceDir)
            ];
          }
        }
      },
      testServer: {
        serverOpts: {
          requestHandlers: function (webEngine) {
            return [
              serveDirectory(webEngine, 'temp'),
              serveDirectory(webEngine, 'testSuite')
            ];
          }
        }
      }
    },
    browserLaunch: {
      devBrowser: {
        targetUrl: 'http://localhost:<%= httpServer.serverOpts.listenPort %>'
      }
    },
    fileCleanup: {
      buildOutput: {
        targets: [{
          includeHidden: true,
          sources: [
            'temp',
            '<%= projPaths.outputDir %>/*',
            '!<%= projPaths.outputDir %>/.version_control*'
          ]
        }]
      },
      devTemp: 'temp'
    },
    jsLinter: {
      serverOpts: {
        lintConfig: '.jshintrc'
      },
      all: [
        'Taskfile.js',
        '<%= projPaths.sourceDir %>/scripts/**/*.{js,mjs}'
      ]
    },
    testRunner: {
      unitTests: {
        configurationFile: 'test_config.js',
        executeOnce: true
      }
    },
    scriptCompiler: {
      buildOutput: {
        files: [{
          expand: true,
          baseDir: '<%= projPaths.sourceDir %>/js_sources',
          sourceFiles: '**/*.coffee',
          destination: 'temp/js_compiled',
          extension: '.js'
        }]
      },
      testCompile: {
        files: [{
          expand: true,
          baseDir: 'test_specs',
          sourceFiles: '**/*.coffee',
          destination: 'temp/test_compiled',
          extension: '.js'
        }]
      }
    },
    styleProcessor: {
      serverOpts: {
        sassSources: '<%= projPaths.sourceDir %>/css_styles',
        outputCssDir: 'temp/css_compiled',
        imageAssetsDir: '<%= projPaths.sourceDir %>/assets/images',
        jsAssetsDir: '<%= projPaths.sourceDir %>/js_sources',
        fontAssetsDir: '<%= projPaths.sourceDir %>/css_styles/webfonts',
        includePath: '<%= projPaths.sourceDir %>/vendor_modules',
        useRelativePaths: true
      },
      productionBuild: {},
      devMode: {
        serverOpts: {
          enableDebug: true
        }
      }
    },
    fileConcatenation: {
      buildOutput: {
        files: {
          '<%= projPaths.outputDir %>/js/bundle.js': [
            'temp/js_compiled/**/*.js',
            '<%= projPaths.sourceDir %>/js_sources/**/*.js'
          ]
        }
      }
    },
    assetPrepare: {
      markupFile: '<%= projPaths.sourceDir %>/main.html',
      serverOpts: {
        destinationDirectory: '<%= projPaths.outputDir %>'
      }
    },
    assetRevisioning: {
      markupFiles: ['<%= projPaths.outputDir %>/**/*.html'],
      styleFiles: ['<%= projPaths.outputDir %>/styles/**/*.css'],
      serverOpts: {
        outputFolders: ['<%= projPaths.outputDir %>']
      }
    },
    imageOptimizer: {
      buildOutput: {
        files: [{
          expand: true,
          baseDir: '<%= projPaths.sourceDir %>/assets/images',
          sourceImages: '**/*.{png,jpg,jpeg,gif}',
          outputDirectory: '<%= projPaths.outputDir %>/assets/images'
        }]
      }
    },
    styleMinifier: {
      buildOutput: {
        files: {
          '<%= projPaths.outputDir %>/css/main.min.css': [
            'temp/css_compiled/**/*.css',
            '<%= projPaths.sourceDir %>/css_styles/**/*.css'
          ]
        }
      }
    },
    markupMinifier: {
      buildOutput: {
        serverOpts: {
          /*stripCdataComments: true,
          // https://github.com/yeoman/grunt-usemin/issues/44
          //collapseBlankSpace: true,
          condenseBoolAttrs: true,
          removeQuotesFromAttrs: true,
          stripRedundantAttrs: true,
          preferShortDoctype: true,
          clearEmptyAttrs: true,
          deleteOptionalTags: true*/
        },
        files: [{
          expand: true,
          baseDir: '<%= projPaths.sourceDir %>',
          sourceFiles: ['root.html', 'partials/**/*.html'],
          outputLocation: '<%= projPaths.outputDir %>'
        }]
      }
    },
    cdnInjector: {
      buildOutput: {
        markupFiles: ['<%= projPaths.outputDir %>/*.html']
      }
    },
    angularAnnotate: {
      buildOutput: {
        files: [{
          expand: true,
          baseDir: '<%= projPaths.outputDir %>/js',
          sourceScripts: '**/*.js',
          outputPath: '<%= projPaths.outputDir %>/js'
        }]
      }
    },
    jsMinifier: {
      buildOutput: {
        files: {
          '<%= projPaths.outputDir %>/js/bundle.js': [
            '<%= projPaths.outputDir %>/js/bundle.js'
          ],
        }
      }
    },
    assetHasher: {
      buildOutput: {
        files: {
          sources: [
            '<%= projPaths.outputDir %>/js/**/*.js',
            '<%= projPaths.outputDir %>/css/**/*.css',
            '<%= projPaths.outputDir %>/assets/images/**/*.{png,jpg,jpeg,gif,webp,svg}',
            '<%= projPaths.outputDir %>/css/webfonts/*'
          ]
        }
      }
    },
    fileDuplicator: {
      buildOutput: {
        files: [{
          expand: true,
          copyHidden: true,
          baseDirectory: '<%= projPaths.sourceDir %>',
          destinationFolder: '<%= projPaths.outputDir %>',
          sources: [
            'root_files/*.{ico,txt,md}',
            '.server_config',
            'third_party_libs/**/*',
            'assets/images/**/*.{gif,webp,tiff}'
          ]
        }]
      }
    }
  });

  taskRunner.relabelTask('observer', 'fileMonitor');

  taskRunner.defineTask('devServer', [
    'fileCleanup:devTemp',
    'scriptCompile:build',
    'styleProcessor:devMode',
    'liveRefresh-init',
    'httpServer:devServer',
    'browserLaunch',
    'fileMonitor'
  ]);

  taskRunner.defineTask('runTests', [
    'fileCleanup:devTemp',
    'scriptCompiler',
    'styleProcessor',
    'httpServer:testServer',
    'testRunner'
  ]);

  taskRunner.defineTask('productionBuild', [
    'fileCleanup:buildOutput',
    'jsLinter',
    'runTests',
    'scriptCompiler',
    'styleProcessor:productionBuild',
    'assetPrepare',
    'imageOptimizer',
    'styleMinifier',
    'markupMinifier',
    'fileConcatenation',
    'fileDuplicator',
    // 'cdnInjector',
    'angularAnnotate',
    'jsMinifier',
    'assetHasher',
    'assetRevisioning'
  ]);

  taskRunner.defineTask('standardTask', ['productionBuild']);
};