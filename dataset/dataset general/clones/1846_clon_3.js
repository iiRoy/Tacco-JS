module.exports = function(g) {
  // This build script configures various tasks for a JavaScript project.
  // It leverages the Grunt.js automation tool (aliased as 'g' here).

  // --- Core Configuration Setup ---

  // Define the path to the project's metadata file.
  const projectManifestPath = 'package.json';
  let projectDetailsObject;

  // Attempt to load project metadata; provide a fallback if the file is unreadable.
  try {
    projectDetailsObject = g.file.readJSON(projectManifestPath);
    g.log.ok(`Successfully loaded project details from: ${projectManifestPath}`);
  } catch (readError) {
    g.log.error(`Failed to load project details from ${projectManifestPath}. Error: ${readError.message}`);
    // Fallback in case package.json is missing or malformed.
    projectDetailsObject = {
      name: 'unnamed-javascript-project',
      version: '1.0.0-SNAPSHOT'
    };
    g.log.warn('Proceeding with default project details. Some tasks might behave unexpectedly.');
  }

  // Consolidate all build-related settings into a single configuration object.
  const buildSettings = {

    // General information about the project, derived from the package manifest.
    projectInfo: projectDetailsObject,

    // Mapping of source and destination file paths for various assets.
    fileAssetMap: {
      sourceScript: 'jquery.toolbar.js',
      minifiedScript: 'jquery.toolbar.min.js'
    },

    // Configuration for the JavaScript code minification task.
    jsMinifier: {
      releaseTarget: {
        taskOptions: {
          // Prepend a dynamic header comment to the minified output.
          headerText: `/*! ${ projectDetailsObject.name } v${ projectDetailsObject.version } | Minified: ${ g.template.today("yyyy-mm-dd HH:MM:ss") } */\n`,
          // Prevent mangling of top-level variable names.
          compress: {
            toplevel: false // Keep top-level variable names readable (changed from default)
          },
          mangle: {
            toplevel: false // Keep top-level variable names readable (changed from default)
          }
        },
        // Define the input-to-output file transformation.
        outputFiles: {
          '<%= fileAssetMap.minifiedScript %>' : '<%= fileAssetMap.sourceScript %>'
        }
      }
    },

    // Configuration for the JavaScript code quality analysis (linting) task.
    codeReviewer: {
      // Specify which files should be subjected to linting.
      lintTargets: [
        'gruntfile.js', // Include the build script itself for quality checks.
        '<%= fileAssetMap.sourceScript %>' // The main source code file.
      ],
      // Detailed options for the linter.
      reviewOptions: {
        // Enforce a strict subset of JavaScript language rules.
        strictMode: true,
        // Define global variables that are expected to be present in the environment.
        environmentGlobals: {
          "bitwise": true, // Disallow bitwise operators (e.g., `&`, `|`, `^`).
          "curly": true,   // Require curly braces for all control structures.
          "eqeqeq": true,  // Enforce strict equality (`===`) over loose equality (`==`).
          "indent": 2,     // Set preferred indentation to 2 spaces. (Changed from 4)
          "latedef": "nofunc", // Warn if a variable is used before it's defined, except for functions.
          "newcap": true,  // Require constructor function names to start with a capital letter.
          "noarg": true,   // Prohibit the use of `arguments.caller` and `arguments.callee`.
          "node": true,    // Predefine global variables for Node.js environment.
          "undef": true,   // Warn about undeclared variables.
          "unused": "vars",// Warn about variables that are declared but never used.
          "quotmark": "double" // Enforce the use of double quotes for string literals. (Changed from single)
        },
        // Suppress warnings about specific issues if desired (none here, but illustrative).
        ignores: []
      }
    }
  };

  // Initialize the Grunt build system with the prepared configuration.
  g.initConfig(buildSettings);

  // --- Plugin Loading ---

  // Helper function to safely load Grunt plugins.
  const attachPlugin = (pluginPackageName) => {
    try {
      g.loadNpmTasks(pluginPackageName);
      g.log.verbose.writeln(`[SUCCESS] Plugin loaded: ${pluginPackageName}`);
    } catch (pluginError) {
      g.log.error(`[ERROR] Failed to load plugin '${pluginPackageName}'. Please ensure it is installed.`);
      g.log.error(`Details: ${pluginError.message}`);
      // In a real scenario, you might want to exit or disable tasks dependent on this plugin.
    }
  };

  // Load the necessary Grunt plugins for minification and linting.
  attachPlugin('grunt-contrib-uglify');
  attachPlugin('grunt-contrib-jshint');

  // --- Task Registration ---

  // Define a task for running code quality checks.
  const lintTaskIdentifier = 'validate-code';
  g.registerTask(lintTaskIdentifier, ['codeReviewer']);

  // Define the main build task, which includes minification.
  const mainBuildSteps = ['jsMinifier'];
  g.registerTask('build', mainBuildSteps);

  // Set the default task to run when Grunt is invoked without arguments.
  // This will perform the minification.
  g.registerTask('default', ['build']);

  // An additional task combining linting and building, useful for development cycles.
  g.registerTask('dev-full-check', [lintTaskIdentifier, 'build']);

  g.log.ok('Grunt configuration loaded and tasks registered.');
};