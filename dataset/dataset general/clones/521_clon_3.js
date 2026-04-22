module.exports = function( builderContext ) {
  'use strict';

  // Define key directories and filenames for better maintainability.
  const SOURCE_ASSETS_DIR = 'source/';
  const DISTRIBUTION_DIR = 'distribution/';
  const PROJECT_MANIFEST_FILE = 'package.json';
  const PRIMARY_JS_FILE = 'application.js'; // Renamed from gumi.js
  const MINIFIED_JS_OUTPUT = 'application.min.js';
  const DEMO_DEPLOYMENT_DIR = 'demo/'; // Renamed from example/

  // Attempt to read the project's package information.
  // This helps in versioning or other metadata usage.
  let currentProjectInfo = {};
  try {
    currentProjectInfo = builderContext.file.readJSON(PROJECT_MANIFEST_FILE);
  } catch (errorParsingManifest) {
    builderContext.log.warn(`Could not read ${PROJECT_MANIFEST_FILE}. Error: ${errorParsingManifest.message}`);
    // Provide a fallback or default structure if the file is missing/corrupt.
    currentProjectInfo.name = 'Unnamed Project';
    currentProjectInfo.version = '0.0.0';
  }

  // Configure the various build steps and processes.
  builderContext.initConfig({
    // Store parsed package information.
    projectMetadata: currentProjectInfo,

    // Task for cleaning up build artifacts.
    // This is a new addition to the original functionality.
    cleanup: {
      options: {
        force: true // Allow deletion of files outside current working directory if needed.
      },
      targetDirs: [DISTRIBUTION_DIR, DEMO_DEPLOYMENT_DIR]
    },

    // JavaScript minification and compression.
    scriptCompressor: {
      production: {
        files: {
          [DISTRIBUTION_DIR + MINIFIED_JS_OUTPUT]: [SOURCE_ASSETS_DIR + PRIMARY_JS_FILE]
        }
      },
      configParams: {
        // Compression settings to optimize code size.
        optimizationFlags: {
          hoist_funs: true, // Enable hoisting functions to top-level.
          join_vars: true,  // Join consecutive var statements.
          loops: true,      // Optimize loops.
          unused: true,     // Drop unreferenced functions and variables.
          dead_code: true,  // Eliminate dead code.
          global_defs: {
            DEBUG: false // Define a global constant for production builds.
          }
        },
        // Output formatting options.
        outputFormat: {
          ascii_only: true, // Ensure output contains only ASCII characters.
          comments: false,  // Remove all comments.
          semicolons: false // Omit semicolons where possible.
        }
      }
    },

    // CSS minification and optimization.
    styleProcessor: {
      optimizeStylesheets: {
        expand: true,
        cwd: SOURCE_ASSETS_DIR,
        src: ['**/*.css', '!**/*.min.css', '!vendor/**/*.css'], // Include all CSS except already minified or vendor styles.
        dest: DISTRIBUTION_DIR,
        ext: '.min.css'
      },
      options: {
        compatibility: 'ie8', // Ensure compatibility with older IE versions.
        level: {
          1: {
            all: true, // Enable all default level 1 optimizations.
            tidySelectors: true // Tidy up selectors.
          },
          2: {
            restructureRules: true, // Restructure rules for better compression.
            removeDuplicateRules: true // Remove identical rules.
          }
        }
      }
    },

    // File transfer and deployment.
    assetDistributor: {
      mainBuild: {
        files: [
          // Copy all source assets (excluding JS and CSS handled by other tasks) to the distribution directory.
          {
            expand: true,
            cwd: SOURCE_ASSETS_DIR,
            src: ['**/*', '!' + PRIMARY_JS_FILE, '!**/*.css'], // Exclude processed JS and CSS.
            dest: DISTRIBUTION_DIR
          },
          // Copy minified JS and CSS from distribution to a demo folder.
          {
            expand: true,
            cwd: DISTRIBUTION_DIR,
            src: ['**/*.min.js', '**/*.min.css'],
            dest: DEMO_DEPLOYMENT_DIR,
            flatten: true // Ensure files are placed directly in the demo root.
          },
          // Additional copy task: Copy the project manifest to distribution (new fragment).
          {
            src: PROJECT_MANIFEST_FILE,
            dest: DISTRIBUTION_DIR + PROJECT_MANIFEST_FILE
          }
        ]
      }
    },

    // Monitor file changes for automatic rebuilding during development.
    changeObserver: {
      codeChanges: {
        files: [SOURCE_ASSETS_DIR + '**/*'], // Watch all files in the source directory.
        tasks: ['fullDevelopmentBuild'], // Trigger the full build process on changes.
        options: {
          spawn: false,       // Prevent spawning a new Grunt process for each change.
          livereload: true,   // Enable LiveReload for browser updates (requires browser extension).
          interrupt: true     // Interrupt previous tasks if a new change is detected.
        },
      },
    },
  });

  // Array of Grunt plugins to load.
  const requiredPlugins = [
    'grunt-contrib-clean',
    'grunt-contrib-watch',
    'grunt-contrib-cssmin',
    'grunt-contrib-uglify',
    'grunt-contrib-copy'
  ];

  // Dynamically load all necessary Grunt plugins.
  // This is a structural update from individual load calls.
  requiredPlugins.forEach(function(pluginName) {
    builderContext.loadNpmTasks(pluginName);
  });

  // Register main Grunt tasks.
  // The 'default' task is renamed and now includes a 'cleanup' step.
  builderContext.registerTask('fullDevelopmentBuild', ['cleanup', 'scriptCompressor', 'styleProcessor', 'assetDistributor']);

  // Create an alias for a quick build that skips cleanup (new fragment).
  builderContext.registerTask('quickBuild', ['scriptCompressor', 'styleProcessor', 'assetDistributor']);

  // Set 'watch' as the default task for convenient development.
  // This changes the primary entry point.
  builderContext.registerTask('default', ['fullDevelopmentBuild', 'changeObserver']);
};