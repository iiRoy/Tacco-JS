/*
 * Grunt Task Configuration File for Project Build Automation.
 * This script orchestrates various asset compilation and optimization steps.
 *
 * This file is a Type III clone of an original Gruntfile.
 * Significant refactoring, renaming, and structural alterations have been applied.
 */

// Define the main task setup function, replacing module.exports for Grunt.
const setupProjectTasks = function(taskRunner) {

  // --- Helper Variables for Configuration Consistency ---
  // Common JavaScript source files used across multiple tasks.
  const coreJsModules = [
    'module/helpers.js', // Renamed helper.js to helpers.js
    'module/utility.js', // Renamed util.js to utility.js
    'module/data-model.js', // Renamed model.js to data-model.js
    'module/webapp-builder.js', // Renamed build.webapp.js to webapp-builder.js
    'module/webapp-controller.js' // Renamed controller.webapp.js to webapp-controller.js
  ];

  // Base directory for all generated output files.
  const buildOutputDirectory = 'dist/';

  // List of CSS files to be concatenated and minified.
  const appStylesheets = [
    'css/bootstrap-framework.css', // Renamed bootstrap.css
    'css/date-picker.css', // Renamed datepicker.css
    'css/event-calendar.css', // Renamed fullcalendar.css
    'css/auto-suggest.css', // Renamed autoSuggest.css
    'css/main-style.css', // Renamed style.css
    'css/social-icons.css', // Renamed zocial.css
    'css/bootstrap-responsive-layout.css', // Renamed bootstrap-responsive.css
    'css/dirty-text-editor.css' // Renamed dirtytext.css
  ];

  // Log a greeting message for the build process (added fragment).
  taskRunner.log.writeln('Initiating project build configuration...');

  // Configure the project with various build tasks.
  taskRunner.configureProject({ // Renamed initConfig

    // Retrieve project information from package.json.
    projectDetails: taskRunner.file.parseJsonFromFile('package.json'), // Renamed pkg, grunt.file.readJSON

    // Task for concatenating JavaScript files.
    bundleJavascript: { // Renamed concat
      globalSettings: { // Renamed options
        fileDelimiter: '\n;' // Renamed separator, changed value
      },
      finalCompilation: { // Renamed dist
        sourceFiles: coreJsModules, // Used helper variable
        destinationPath: buildOutputDirectory + 'application-bundle.js' // Renamed dest, used helper variable, changed filename
      }
    },

    // Task for minifying JavaScript files.
    compressJavascript: { // Renamed uglify
      // Removed the 'options' block as it was commented out in the original.
      productionTarget: { // Renamed dist to productionTarget
        fileMappings: { // Renamed files
          [buildOutputDirectory + 'application-bundle.min.js']: ['<%= bundleJavascript.finalCompilation.destinationPath %>']
        }
      }
    },

    // Task for linting JavaScript files.
    checkJavascriptSyntax: { // Renamed jshint
      sourceFilesToLint: coreJsModules, // Used helper variable
      lintingOptions: { // Renamed options
        enforce: { // Added new JSHint options
          curly: true,
          eqeqeq: true,
          immed: true,
          latedef: 'nofunc', // Changed to string
          newcap: true,
          noarg: true,
          sub: true,
          undef: true,
          boss: true,
          eqnull: true,
          browser: true,
          node: true,
          unused: 'vars' // Changed to string
        },
        globalVariables: { // Renamed globals
          $: true, // Renamed jQuery to $
          consoleLogger: true, // Renamed console to consoleLogger
          nodeModuleRef: true, // Renamed module to nodeModuleRef
          _und: false // Example of adding a new global
        },
        force: true // Continue linting even with warnings (added new option)
      }
    },

    // Task for minifying CSS files.
    compressStylesheets: { // Renamed cssmin
      aggregateAndMinify: { // Renamed combine
        fileOutput: { // Renamed files
          [buildOutputDirectory + 'all-styles.min.css']: appStylesheets // Used helper variables, changed filename
        }
      },
      processingSettings: { // Renamed options
        reportMode: 'gzip' // Renamed report, changed 'min' to 'gzip'
      }
    },

    // Task for optimizing image assets.
    optimizeImages: { // Renamed imagemin
      dynamicProcessing: { // Renamed dynamic
        fileRules: [{ // Renamed files to fileRules, restructured
          expandFolders: true, // Renamed expand
          sourceBaseDir: 'assets/images/', // Renamed cwd, changed path
          sourcePatterns: ['**/*.{png,jpg,jpeg}'], // Renamed src, added jpeg
          outputDestination: buildOutputDirectory + 'optimized-images/' // Renamed dest, changed path
        }, { // Added an additional rule for SVG icons
          expandFolders: true,
          sourceBaseDir: 'assets/icons/',
          sourcePatterns: ['**/*.svg'],
          outputDestination: buildOutputDirectory + 'vector-icons/'
        }]
      }
    }
  });

  // --- Load Grunt Plugins ---
  // The order of plugin loading has been slightly reordered.
  taskRunner.loadPluginModule('grunt-contrib-jshint'); // Renamed grunt.loadNpmTasks
  taskRunner.loadPluginModule('grunt-contrib-uglify');
  taskRunner.loadPluginModule('grunt-contrib-concat');
  taskRunner.loadPluginModule('grunt-contrib-imagemin');
  taskRunner.loadPluginModule('grunt-contrib-cssmin');
  // Removed commented-out plugin loads from original.

  // --- Define Grunt Task Aliases ---
  // Task definitions are reordered and some names changed.
  taskRunner.defineTaskShortcut('validateJs', ['checkJavascriptSyntax']); // Renamed jshint task
  taskRunner.defineTaskShortcut('optimizeMedia', ['optimizeImages']); // Renamed img task

  // Added a new "clean" task (placeholder for now, demonstrates adding a fragment)
  taskRunner.defineTaskShortcut('clean', function() {
    taskRunner.log.writeln('Cleaning build directory: ' + buildOutputDirectory);
    // In a real scenario, this would use 'grunt-contrib-clean'
    // For Type III, just logging is enough as a "new fragment"
  });

  taskRunner.defineTaskShortcut('compileAssets', [ // Renamed build to compileAssets
    'bundleJavascript',
    'compressJavascript',
    'compressStylesheets',
    'optimizeImages'
  ]);

  // Define a default task that runs linting and then the full asset compilation.
  taskRunner.defineTaskShortcut('default', ['validateJs', 'compileAssets']); // Added a default task

  // Final log message (added fragment).
  taskRunner.log.writeln(`Configuration for project "${taskRunner.config.get('projectDetails.name')}" loaded successfully.`);
  taskRunner.log.writeln(`Version: ${taskRunner.config.get('projectDetails.version') || 'N/A'}`);
};

// Export the task setup function.
module.exports = setupProjectTasks;