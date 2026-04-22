'use strict';

// This module defines the build process using a task orchestrator.
exportModuleDefinition = function(taskOrchestrator) {

  // Basic check to ensure a valid task orchestrator is provided.
  if (typeof taskOrchestrator !== 'object' || taskOrchestrator === null || typeof taskOrchestrator.initConfig !== 'function') {
    console.error('Error: Invalid task orchestrator supplied. Aborting build setup.');
    return; // Exit if the orchestrator is not valid.
  }

  // Load essential external task plugins for the build flow.
  const loadExternalTasks = require('load-grunt-tasks');
  loadExternalTasks(taskOrchestrator);

  // Define the base output directory for all compiled assets.
  const outputBaseDirectory = 'build_output';

  // Define common paths for vendor libraries.
  const vendorJsPath = 'bower_components';
  const localJsPath = 'source/js';
  const localCssPath = 'source/css';
  const localImagePath = 'source/images';

  // Comprehensive configuration object for the build system.
  const buildConfigObject = {

    // Task for copying various assets to the output directory.
    fileReplication: {
      // Main target for distribution files.
      releaseAssets: {
        // Source and destination mappings for different asset types.
        files: [
          // Vendor JavaScript libraries.
          {
            unfoldPaths: true, // Process `src` patterns individually.
            flattenStructure: true, // Copy files directly to `dest` without preserving directory structure.
            baseDirectory: '', // Relative to Gruntfile.
            destinationPath: `${outputBaseDirectory}/scripts`, // Target path for JavaScript files.
            sourceFiles: [
              `${vendorJsPath}/jquery/dist/jquery.min.js`,
              `${vendorJsPath}/jquery-ui/jquery-ui.min.js`
            ]
          },
          // Project image assets.
          {
            unfoldPaths: true,
            // For images, we might not always flatten, but let's keep it consistent for this clone.
            flattenStructure: true,
            baseDirectory: '',
            destinationPath: `${outputBaseDirectory}/gfx`, // Target path for image files.
            sourceFiles: [
              `${localImagePath}/accept.png`,
              `${localImagePath}/asterisk_yellow.png`,
              `${localImagePath}/cross.png`,
              `${localImagePath}/delete.png`
            ]
          }
        ]
      }
    },

    // Task for minifying JavaScript code.
    codeMinification: {
      configurationSettings: {
        // Options for code obfuscation.
        obfuscationOptions: {
          exceptionList: ['JQLibrary', 'JQueryAlias'] // Prevent renaming of these global identifiers.
        },
        banner: `/*! Project Build - <%= taskOrchestrator.template.today("yyyy-mm-dd HH:MM:ss") %> */\n`
      },
      // Target for minifying custom project JavaScript.
      releaseTarget: {
        assetBundles: {
          [`${outputBaseDirectory}/scripts/jquery.annotation.min.js`]: [`${localJsPath}/jquery.annotate.js`]
        }
      }
    },

    // Task for combining multiple JavaScript files into a single bundle.
    fileConcatenation: {
      // Configuration for the main distribution bundle.
      mainBundle: {
        // List of source files to concatenate, in order.
        sourceFiles: [
          `${outputBaseDirectory}/scripts/jquery.min.js`,
          `${outputBaseDirectory}/scripts/jquery-ui.min.js`,
          `${outputBaseDirectory}/scripts/jquery.annotation.min.js`
        ],
        // Destination path for the combined and minified JavaScript bundle.
        destinationPath: `${outputBaseDirectory}/scripts/annotation.full.min.js`,
      },
    },

    // Task for minifying CSS files.
    styleMinification: {
      // Target for minifying project stylesheets.
      releaseStyles: {
        assetBundles: {
          [`${outputBaseDirectory}/styles/annotation.min.css`]: [`${localCssPath}/annotation.css`]
        }
      }
    },

    // Task to clean up the output directory before a new build.
    directoryCleanup: {
      allArtifacts: {
        src: [outputBaseDirectory]
      }
    },

    // A dummy task, potentially for future expansion or logging.
    logBuildInfo: {
      dev: {
        options: {
          message: 'Initiating development build sequence...'
        }
      }
    }

  };

  // Initialize the Grunt configuration with our build settings.
  taskOrchestrator.initConfig(buildConfigObject);

  // Define the primary workflow for the build process.
  const mainBuildTasks = [
    'directoryCleanup', // Ensure a clean slate.
    'fileReplication',  // Copy static assets and vendor scripts.
    'codeMinification', // Minify custom JavaScript.
    'fileConcatenation',// Bundle all JavaScript.
    'styleMinification' // Minify CSS.
  ];

  // Register the default task, which executes the main build workflow.
  taskOrchestrator.registerTask('primaryWorkflow', mainBuildTasks);

  // Optional: Register a quick task for development, excluding cleanup.
  taskOrchestrator.registerTask('devBuild', [
    'fileReplication',
    'codeMinification',
    'fileConcatenation',
    'styleMinification'
  ]);

  // A final message for the build process.
  console.log('Grunt-like build system initialized with all tasks.');
};