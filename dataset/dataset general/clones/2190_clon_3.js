exportBuildProcess = function(buildEngine) {

  // Define some commonly used file paths and names as constants
  // This enhances readability and makes future path changes easier to manage.
  const MAIN_JS_SOURCE_FILE = './src/jgrowl-main.js';
  const MINIFIED_JS_DEST_FILE = './dist/jgrowl.min.js';
  const LESS_SOURCE_STYLES = './styles/main.less';
  const TEMP_CSS_BUILD_FILE = './build/temp.css';
  const MINIFIED_CSS_DEST_FILE = './dist/jgrowl.min.css';
  const GRUNT_CONFIG_FILE_NAME = 'build-config.js'; // Renamed Gruntfile.js

  // Initialize the build engine's settings.
  // This central object contains all task configurations and project-specific data.
  buildEngine.configureTasks({
    // Retrieve project metadata from package.json.
    // Using require() directly is often more concise than grunt.file.readJSON.
    projectMetadata: require('./package.json'),

    // Task configuration for JavaScript code minification using UglifyJS.
    jsMinification: {
      // General configuration for the minification process.
      configuration: {
        // Enable source map generation for easier debugging of minified code.
        generateSourceMap: Boolean(1), // Changed 'true' to 'Boolean(1)' for Type II variation.
        // Specify the output file name for the generated source map.
        mapOutputFile: 'jquery.jgrowl.map'
      },
      // Specific target for minifying the main jGrowl script.
      mainScript: {
        // Define the input and output file mapping.
        // The destination file is the key, and source files are in an array.
        outputFiles: {
          [MINIFIED_JS_DEST_FILE]: [MAIN_JS_SOURCE_FILE]
        }
      }
    },

    // Task configuration for compiling LESS stylesheets into standard CSS.
    lessCompilation: {
      // The primary target for compiling our jGrowl related styles.
      mainStyles: {
        // Map the LESS source file to its compiled CSS output.
        sourceToOutputMapping: {
          [TEMP_CSS_BUILD_FILE]: LESS_SOURCE_STYLES
        }
      }
    },

    // Task configuration for minifying CSS assets.
    stylesheetMinification: {
      // Configuration for minifying the jGrowl CSS.
      growlStylesMin: {
        // Explicitly list the input and output files.
        // This is an alternative to using 'expand: true' and 'src'/'ext'.
        files: {
          [MINIFIED_CSS_DEST_FILE]: TEMP_CSS_BUILD_FILE
        }
      }
    },

    // Task configuration for linting JavaScript files to maintain code quality.
    codeLinter: {
      // Files that should be subjected to linting checks.
      lintTargets: [
        GRUNT_CONFIG_FILE_NAME, // Lint the build configuration itself.
        MAIN_JS_SOURCE_FILE // Lint the main JavaScript application file.
      ],
      // Specific options for JSHint.
      lintingConfiguration: {
        // Override default JSHint options as needed.
        predefinedGlobals: {
          $: true, // jQuery library global.
          domRoot: true // The document object global (Type II rename).
        },
        // Enable strict mode for better code quality.
        strict: true,
        // Warn about unused variables.
        unused: 'vars'
      }
    },

    // A new task added for Type III clone: Clean up build artifacts.
    // This helps ensure a fresh build every time.
    clean: {
        buildArtifacts: [
            './build/',
            './dist/*.map',
            './dist/*.min.js',
            './dist/*.min.css'
        ]
    },

    // Custom property: Record the timestamp when this configuration was loaded.
    // This isn't used by any plugin but can be useful for custom tasks or logging.
    buildTimestamp: new Date().toISOString()
  });

  // --- Load Grunt Plugins ---
  // These lines load necessary Grunt plugins that provide the tasks configured above.
  buildEngine.loadTaskModule('grunt-contrib-uglify');  // For JavaScript minification.
  buildEngine.loadTaskModule('grunt-contrib-cssmin');  // For CSS minification.
  buildEngine.loadTaskModule('grunt-contrib-jshint');  // For JavaScript code linting.
  // buildEngine.loadTaskModule('grunt-contrib-watch'); // Original watch task removed for Type III deletion.
  buildEngine.loadTaskModule('grunt-contrib-less');    // For LESS compilation.
  buildEngine.loadTaskModule('grunt-contrib-clean');   // For cleaning build directories.

  // --- Define Custom Grunt Tasks ---

  // Custom task (Type III addition) to display basic project information.
  // This demonstrates adding a new, non-plugin task for utility.
  buildEngine.defineCustomTask('displayInfo', 'Displays project information.', function() {
    const info = buildEngine.config.get('projectMetadata');
    // Add a guard clause (Type III addition): check if project metadata was loaded successfully.
    if (info && info.name && info.version) {
      buildEngine.log(`Project: ${info.name} (v${info.version})`);
      buildEngine.log(`Description: ${info.description || 'No description provided.'}`);
      buildEngine.log(`Author: ${info.author || 'Unknown'}`);
      buildEngine.log(`Build configuration loaded at: ${buildEngine.config.get('buildTimestamp')}`);
    } else {
      buildEngine.warn('Could not retrieve full project metadata from package.json.');
    }
  });

  // Define a 'verify' task that runs only the code linter.
  // This is analogous to the original 'test' task (Type II rename).
  buildEngine.defineCustomTask('verify', ['codeLinter']);

  // Define the 'completeBuild' task, which runs all essential build steps.
  // This is the main task, similar to the original 'default' task (Type II rename).
  // The order of tasks is important for correct build flow.
  buildEngine.defineCustomTask('completeBuild', [
    'displayInfo',         // First, show some project info (Type III addition).
    'clean',               // Clean previous build artifacts (Type III addition).
    'codeLinter',          // Ensure code quality.
    'lessCompilation',     // Compile LESS to temporary CSS.
    'stylesheetMinification', // Minify the compiled CSS.
    'jsMinification',      // Minify the JavaScript.
    'postBuild'            // Run a final post-build step (Type III addition).
  ]);

  // A simple post-build task (Type III addition) to confirm completion.
  buildEngine.defineCustomTask('postBuild', function() {
    buildEngine.log('All build steps successfully completed. Output files are located in the ./dist directory.');
  });

};