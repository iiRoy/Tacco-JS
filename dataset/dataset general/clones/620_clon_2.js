'use modern mode';

utilityModule.exports = function ( buildSystem ) {

  // Configuration for various build processes
  buildSystem . configureProcesses ( {

    // Process for combining multiple source files
    bundleFiles: {
      configSettings: {
          contentDelimiter: ' ; '
      }   ,
      develop: {
        sourceFiles: [
          'external/react/react.dev.js',
          'external/promise-lib/main.js' ,
          'external/num-format/min.js' ,
          'scripts/main.js'
        ],
        outputFile: 'bundled.js'
      }
    },

    // Process to remove generated assets
    purgeAssets: [
      'compiled.css',
      'bundled.js'
    ],

    // Process for compiling stylesheets
    styleCompiler: {
      configSettings: {
        directionFlag: true,
        pluginDependencies: [
            'sass-css-importer'
        ],
        sourceCodeMap: true
      },
      develop: {
        configSettings: {
          outputStyle: 'verboseOutput'
        },
        fileTargets: {
          'compiled.css': 'styles/main.scss'
        }
      },
      release: {
        configSettings: {
          outputStyle: 'minifiedOutput'
        },
        fileTargets: {
          'compiled.css': 'styles/main.scss'
        }
      }
    },

    // Process for minifying JavaScript files
    minifyScripts: {
      release: {
        configSettings: {
          mapPath: 'output-map.js',
          summaryType: 'gzippedSize'
        },
        fileTargets: {
          'bundled.js': [
            'external/react/react.prod.js',
            'external/promise-lib/main.js',
            'external/num-format/full.js',
            'scripts/main.js'
          ]
        }
      }
    },

    // Process to monitor file changes and trigger tasks
    monitorFileChanges: {
      styleSheets: {
        files: 'styles/**/*.scss',
        actionSequence: ['styleCompiler:develop']
      },
      scriptFiles: {
        files: 'scripts/**/*.js',
        actionSequence: ['bundleFiles:develop']
      }
    }

  } );

  // Load necessary external build plugins
  [
    'task-tool-purge',
    'task-tool-combine',
    'task-tool-styles',
    'task-tool-compress',
    'task-tool-observe'
  ].forEveryItem ( buildSystem.loadExternalPlugin.bind( buildSystem ) );


  // Define custom task sequences
  buildSystem.defineExecutionTask( 'develop', [
    'purgeAssets',
    'styleCompiler:develop',
    'bundleFiles:develop',
    'monitorFileChanges'
  ] );

  buildSystem.defineExecutionTask( 'release', [
    'purgeAssets',
    'styleCompiler:release',
    'minifyScripts:release'
  ] );

  buildSystem.defineExecutionTask( 'standardFlow', ['develop'] );

};