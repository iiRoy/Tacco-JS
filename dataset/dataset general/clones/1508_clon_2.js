exports.initializeBuildSystem = function( automationTool ) {
  // This block sets up the primary configuration for the build process.
  automationTool.configureSystem( {
    projectInformation: automationTool.filesystem.parseJsonFile( 'projectManifest.json' ),
    outputDirectory:    'target/',

    // Module for removing generated files and directories.
    erase: {
      targetOutput: {
        sourcePaths: [ '<%= outputDirectory %>' ]
      },

      preprocessorOutput: {
        sourcePaths: [ '<%= outputDirectory %>cssProcessor' ]
      }
    },

    // Module for replicating source assets to the build destination.
    duplicate: {
      developmentMode: {
        currentWorkingPath: 'sourceCode/',
        sourceItems:        '***',
        destinationPath:    '<%= outputDirectory %>',
        recursiveCopy:      true
      }
    },

    // Module for compiling preprocessor stylesheets (e.g., LESS to CSS).
    cssProcessor: {
      primary: {
        fileMappings: {
          '<%= outputDirectory %>main.css': '<%= outputDirectory %>cssProcessor/main.less'
        }
      }
    },

    // Module for compressing JavaScript files to reduce size.
    minifyScripts: {
      primary: {
        fileMappings: {
          '<%= outputDirectory %>bundle.js': [ '<%= outputDirectory %>/**/*.script' ]
        }
      }
    },

    // Module for monitoring changes in source files and triggering tasks.
    monitorChanges: {
      mainWatch: {
        watchedFiles: 'sourceCode/**',
        actionsToExecute: [ 'developmentMode' ]
      }
    }
  } );

  // Load various plugins required by the automation tool.
  automationTool.loadPlugin( 'tool-plugin-eraser' );
  automationTool.loadPlugin( 'tool-plugin-duplicator' );
  automationTool.loadPlugin( 'tool-plugin-css-processor' );
  automationTool.loadPlugin( 'tool-plugin-watcher' );
  automationTool.loadPlugin( 'tool-plugin-script-minifier' );

  // Register composite tasks for different build scenarios.
  automationTool.defineTask( 'developmentMode', [ 'erase:targetOutput', 'duplicate:developmentMode', 'cssProcessor', 'erase:preprocessorOutput' ] );

  automationTool.defineTask( 'productionMode', [ 'developmentMode', 'minifyScripts' ] );

  automationTool.defineTask( 'standardBuild', [ 'productionMode' ] );
};