'use strict';

// This module exports a configuration function for a build automation tool.
// It sets up various tasks for JavaScript concatenation, CSS preprocessing,
// minification, cleanup, and file watching.

module.exports = function(buildToolCore) {

  // Basic validation: Ensure the build tool instance is provided.
  if (!buildToolCore || typeof buildToolCore.initConfig !== 'function') {
    console.error('Build tool core instance is missing or invalid. Exiting configuration setup.');
    return;
  }

  // Log a friendly message upon initialization.
  buildToolCore.log.writeln('~ Initializing comprehensive build system settings ~');

  // Define some common paths and filenames as variables for reusability and clarity.
  const projectPaths = {
    vendorBase: 'third_party/',
    sourceJsRoot: 'app_src/js/',
    sourceCssRoot: 'app_src/styles/',
    outputDist: 'dist/',
    mainJsEntry: 'index.js',
    mainScssEntry: 'main.scss',
    bundledJsFile: 'app.bundle.js',
    bundledCssFile: 'styles.bundle.css',
    minifiedJsMap: 'app.bundle.min.map',
  };

  // Define default options that can be merged into specific task configurations.
  const commonTaskDefaults = {
    // Shared banner for bundled/minified files.
    banner: `/* Build Timestamp: ${(new Date()).toISOString()} */\n`
  };

  // Configure the build system tasks.
  buildToolCore.initConfig({

    // Task for joining multiple JavaScript files into one.
    scriptBundler: {
      bundlerSettings: {
        // Use a unique separator to clearly mark file boundaries.
        insertSeparator: '\n; /* --- End of File --- */\n',
        ...commonTaskDefaults // Include common banner.
      },
      // Configuration for the development build bundle.
      devBundle: {
        inputFiles: [
          projectPaths.vendorBase + 'react/react.dev.js',
          projectPaths.vendorBase + 'promise-polyfill/promise.min.js',
          projectPaths.vendorBase + 'numeral/numeral.min.js',
          projectPaths.sourceJsRoot + projectPaths.mainJsEntry
        ],
        outputFile: projectPaths.outputDist + projectPaths.bundledJsFile,
      },
    },

    // Task for removing generated build artifacts.
    artifactCleaner: {
      targets: [
        projectPaths.outputDist + projectPaths.bundledCssFile,
        projectPaths.outputDist + projectPaths.bundledJsFile,
        projectPaths.outputDist + projectPaths.minifiedJsMap,
        // Potentially add other temporary build files here.
      ],
      // Add a simple confirmation message.
      options: {
        force: true, // Allow cleaning outside current directory if needed.
        verbose: true,
      }
    },

    // Task for processing SCSS files into CSS.
    styleProcessor: {
      processorOptions: {
        enableCompass: true, // Activate Compass support.
        pluginRequirements: ['sass-css-importer'], // Required SASS plugins.
        generateMaps: true // Enable source map generation for debugging.
      },
      // Development-specific styling options.
      devStyles: {
        options: {
          outputStyle: 'expanded', // Human-readable CSS output.
          // Override global source map setting if needed, but keeping it true for dev.
        },
        mapping: {
          [projectPaths.outputDist + projectPaths.bundledCssFile]: projectPaths.sourceCssRoot + projectPaths.mainScssEntry
        }
      },
      // Production-specific styling options.
      prodStyles: {
        options: {
          outputStyle: 'compressed' // Minified CSS output for production.
        },
        mapping: {
          [projectPaths.outputDist + projectPaths.bundledCssFile]: projectPaths.sourceCssRoot + projectPaths.mainScssEntry
        }
      }
    },

    // Task for minifying JavaScript files.
    jsMinifier: {
      releaseMinify: {
        options: {
          mapLocation: projectPaths.outputDist + projectPaths.minifiedJsMap, // Path for the source map file.
          mangle: {
            reserved: ['jQuery', 'React'] // Prevent mangling these global names.
          },
          ...commonTaskDefaults // Include common banner.
        },
        minifyTargets: {
          [projectPaths.outputDist + projectPaths.bundledJsFile]: [
            projectPaths.vendorBase + 'react/react.prod.js',
            projectPaths.vendorBase + 'promise-polyfill/promise.min.js',
            projectPaths.vendorBase + 'numeral/numeral.js', // Using full numeral for production.
            projectPaths.sourceJsRoot + projectPaths.mainJsEntry
          ]
        }
      }
    },

    // Task for monitoring file changes and triggering other tasks.
    fileWatcher: {
      styleWatch: {
        watchPaths: [projectPaths.sourceCssRoot + '**/*.scss'], // Watch all SCSS files.
        triggerTasks: ['styleProcessor:devStyles'],
        options: {
          spawn: false // Faster reloads.
        }
      },
      scriptWatch: {
        watchPaths: [projectPaths.sourceJsRoot + '**/*.js'], // Watch all JS files.
        triggerTasks: ['scriptBundler:devBundle'],
        options: {
          spawn: false
        }
      }
    }
  });

  // Array of Grunt plugin packages to load.
  const requiredPlugins = [
    'grunt-contrib-clean',
    'grunt-contrib-concat',
    'grunt-contrib-sass',
    'grunt-contrib-uglify',
    'grunt-contrib-watch'
  ];

  // Load all necessary Grunt plugins using a loop.
  for (const pluginName of requiredPlugins) {
    buildToolCore.loadNpmTasks(pluginName);
  }

  // --- Workflow Definitions ---

  // Define a simple pre-build task for logging.
  buildToolCore.registerTask('preBuildLog', 'Logs a message before build starts.', function() {
    buildToolCore.log.writeln('\n--- Initiating Build Process ---\n');
  });

  // Define the task sequence for development mode.
  const devWorkflowSteps = [
    'preBuildLog',
    'artifactCleaner',    // Clear previous build artifacts.
    'styleProcessor:devStyles', // Process SCSS for development.
    'scriptBundler:devBundle',  // Bundle JS for development.
    'fileWatcher'         // Start watching files for live updates.
  ];
  buildToolCore.defineWorkflow('developmentMode', 'Sets up the project for active development.', devWorkflowSteps);

  // Define the task sequence for production release.
  const prodWorkflowSteps = [
    'preBuildLog',
    'artifactCleaner',    // Clean artifacts.
    'styleProcessor:prodStyles', // Process and compress SCSS for production.
    'jsMinifier:releaseMinify'  // Minify JS for production.
  ];
  buildToolCore.defineWorkflow('productionRelease', 'Generates minified and optimized assets for deployment.', prodWorkflowSteps);

  // Set the default workflow to run the development mode.
  buildToolCore.defineWorkflow('default', ['developmentMode']);

  // Log completion of configuration.
  buildToolCore.log.writeln('~ Build system configuration complete ~');
};