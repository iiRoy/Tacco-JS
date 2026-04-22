module.exports = function(buildAutomation) {
  'use strict'; // Enforce stricter parsing and error handling for the Gruntfile

  // --- Configuration Variables and Constants ---
  const sourceDirectory = 'src/';
  const outputDirectory = 'dist/'; // Renamed from 'build/' to 'dist/' for consistency
  const componentBaseName = 'circularProgressIndicator'; // New constant for the base filename of the compiled asset

  // Original component source files, now with renamed internal modules for clarity.
  const componentSourceFiles = [
    sourceDirectory + 'polyfillBase.js',      // Provides necessary shims or polyfills for browser compatibility.
    sourceDirectory + 'coreModule.js',        // Defines the main Angular module for the component.
    sourceDirectory + 'configProvider.js',    // Manages global configuration settings for the component.
    sourceDirectory + 'serviceLogic.js',      // Contains the core business logic for progress updates and calculations.
    sourceDirectory + 'mainDirective.js',     // The primary Angular directive responsible for rendering the component.
  ];

  // Helper variable to hold project metadata from package.json.
  let projectManifest = {};
  try {
    projectManifest = buildAutomation.file.readJSON('package.json');
    // Optional: Add a simple check for essential package info to ensure validity.
    if (!projectManifest.name || !projectManifest.version) {
      buildAutomation.log.warn('Warning: package.json is missing essential "name" or "version" fields.');
    }
  } catch (error) {
    buildAutomation.log.error('Failed to read package.json. Please ensure it exists and is valid JSON: ' + error.message);
    // Exit the process if a critical file like package.json is missing or malformed.
    process.exit(1);
  }

  // Define the header comment to be prepended to bundled and minified files.
  // Uses template literals for cleaner string construction.
  const bundleHeader = `/*!
 * ${projectManifest.name || 'Unknown Project'} v${projectManifest.version || '0.0.0'}
 * Built on: ${buildAutomation.template.today('isoDateTime')}
 * License: ${projectManifest.license || 'UNLICENSED'}
 * (c) ${new Date().getFullYear()} ${projectManifest.author ? projectManifest.author.name || projectManifest.author : 'Developer'}
 */\n`;

  // --- Grunt Task Configuration ---
  buildAutomation.initConfig({
    // Store project metadata under a new key for access within Grunt tasks.
    projectInfo: projectManifest,

    // Task to clean the output directory before a new build.
    // This is a new addition to ensure a clean slate and remove old artifacts.
    cleanArtifacts: {
      configuration: {
        force: true // Allows deletion of files/folders outside the current working directory (use with caution).
      },
      targetOutput: [outputDirectory + '**/*', '!' + outputDirectory + '.gitkeep'] // Deletes everything inside output dir, except .gitkeep
    },

    // Concatenates JavaScript files into a single bundle.
    scriptBundler: {
      configuration: {
        joinDelimiter: '\n\n/* --- END OF FILE --- */\n\n', // Custom separator for concatenated files.
        fileHeader: bundleHeader, // Custom header using the constant defined above.
        // Additional options could go here, e.g., source maps.
      },
      releaseVersion: {
        inputSources: componentSourceFiles, // Uses the renamed array of source files.
        destinationPath: outputDirectory + componentBaseName + '.js', // Output to the new 'dist' directory with new filename.
      }
    },

    // Minifies the concatenated JavaScript bundle for production deployment.
    javascriptMinifier: {
      configuration: {
        fileHeader: bundleHeader, // Applies the same custom header.
        mangle: {
          properties: false // Disable property mangling, can break Angular.
        },
        compress: {
          drop_console: true, // Removes console.log statements from production code.
          drop_debugger: true, // Removes debugger statements.
          unused: true, // Remove unused functions and variables.
          dead_code: true // Remove unreachable code.
        }
      },
      releaseVersion: {
        inputSources: [outputDirectory + componentBaseName + '.js'], // Minify the already bundled file.
        destinationPath: outputDirectory + componentBaseName + '.min.js' // Output minified file.
      }
    },

    // Deploys build artifacts to GitHub Pages or similar static hosting.
    webPagePublisher: {
      configuration: {
        rootDirectory: outputDirectory, // Specifies the base directory for deployment.
        branch: 'gh-pages', // Target branch for deployment.
        message: 'Deployment triggered by Grunt build [skip ci]', // Commit message.
        dotfiles: true // Include dotfiles (like .nojekyll)
      },
      liveDeployment: {
        inputSources: [
          'index.html', // Assumes an index.html exists in the output directory for the demo.
          componentBaseName + '.js',
          componentBaseName + '.min.js',
          'assets/**/*', // Deploy any additional assets like images or styles.
        ]
      }
    },

    // Placeholder for a Watch task (new addition, not fully configured, but showing intent).
    fileWatcher: {
      scripts: {
        files: [sourceDirectory + '**/*.js', 'Gruntfile.js'], // Watch source files and the Gruntfile itself.
        tasks: ['preflightChecks', 'scriptBundler:releaseVersion'], // Tasks to run on change.
        options: {
          spawn: false, // Prevents spawning new Grunt processes for faster feedback.
          livereload: true // Enable live reloading if a server is running.
        }
      }
    },

    // Placeholder for JSHint/ESLint configuration (new addition to demonstrate extensibility).
    codeLinter: {
      options: {
        jshintrc: '.jshintrc', // Path to JSHint configuration file.
        reporter: require('jshint-stylish') // Use a stylish reporter.
      },
      all: [
        sourceDirectory + '**/*.js', // Lint all JavaScript files in the source directory.
        'Gruntfile.js' // Lint the Gruntfile itself for best practices.
      ]
    }
  });

  // --- Load Grunt Plugins ---
  // Ensure all required plugins are installed via npm (e.g., npm install --save-dev grunt-contrib-uglify).
  buildAutomation.loadNpmTasks('grunt-contrib-uglify');
  buildAutomation.loadNpmTasks('grunt-contrib-concat');
  buildAutomation.loadNpmTasks('grunt-gh-pages');
  buildAutomation.loadNpmTasks('grunt-contrib-clean'); // New plugin load for the 'cleanArtifacts' task.
  buildAutomation.loadNpmTasks('grunt-contrib-watch'); // New plugin load for the 'fileWatcher' task.
  buildAutomation.loadNpmTasks('grunt-contrib-jshint'); // New plugin load for 'codeLinter'.

  // --- Register Custom Grunt Tasks ---

  // A custom task for pre-build checks or logging.
  buildAutomation.registerTask('preflightChecks', 'Performs pre-build validations and informational logging.', function() {
    buildAutomation.log.writeln('\n>> Initiating build preflight checks...');
    // Example: Check for a specific environment variable to alter build behavior.
    if (process.env.NODE_ENV === 'production') {
      buildAutomation.log.ok('Detected production environment. Build will be optimized for release.');
    } else {
      buildAutomation.log.subhead('Detected development/staging environment. Building for local testing.');
    }
    // More complex checks could go here, e.g., checking for specific file existence, API keys, etc.
    buildAutomation.log.writeln('>> Preflight checks concluded.\n');
  });

  // The main build task: clean, lint, pre-check, bundle, then minify.
  // Order of tasks is crucial.
  buildAutomation.registerTask('performBuild', [
    'preflightChecks',           // Run pre-build validations first.
    'cleanArtifacts:targetOutput', // Clean the output directory to ensure fresh build.
    'codeLinter:all',            // Lint all JS files for quality assurance.
    'scriptBundler:releaseVersion', // Concatenate source files.
    'javascriptMinifier:releaseVersion' // Minify the concatenated bundle.
  ]);

  // Task for deploying the built assets to a remote location (e.g., GitHub Pages).
  buildAutomation.registerTask('publishWebsite', ['performBuild', 'webPagePublisher:liveDeployment']);

  // Set 'performBuild' as the default task when running 'grunt' without arguments.
  buildAutomation.registerTask('default', ['performBuild']);

  // Add a development task that builds and then watches for changes.
  buildAutomation.registerTask('dev', ['performBuild', 'fileWatcher']);
};