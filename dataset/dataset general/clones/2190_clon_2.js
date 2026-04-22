module.exports = function(taskRunner) {
  // This function defines the primary configuration for our automated build tasks.

  taskRunner.setupBuild({
    // Fetch project details from the application's manifest file.
    appManifest: taskRunner.dataAccess.parseJSONFile('project.manifest'),

    // Section for compressing JavaScript files.
    compressScripts: {
      // Universal settings for all script compression operations.
      settings: {
        generateMap: true, // Activates the creation of source maps.
        mapFilename: 'myproject.min.map' // Designates the name for the generated source map.
      },
      // Specific configuration for the main application's scripts.
      coreModule: {
        // Defines the source and destination files for minification.
        inputOutput: {
          'main.compressed.js': ['main.uncompressed.js'] // Takes 'main.uncompressed.js' and outputs 'main.compressed.js'.
        }
      }
    },

    // Configuration for compiling LESS stylesheets into standard CSS.
    compileCSS: {
      // Target settings for the core module's stylesheets.
      coreModule: {
        // Specifies the input LESS file and the output CSS file.
        inputOutput: {
          "main.styles.css": "styles/main.raw.less" // Compiles 'styles/main.raw.less' into 'main.styles.css'.
        }
      }
    },

    // Module for minifying CSS files.
    compressStyles: {
      // Configuration for the primary stylesheet.
      coreModule: {
        processMultiple: true, // Enables processing of multiple files if a pattern is provided.
        sourcePath: 'main.styles.css', // The source CSS file to be minified.
        outputExtension: '.min.optimized.css' // The extension to append to the minified output file.
      }
    },

    // Tool for checking JavaScript code quality and style.
    lintScripts: {
      // An array of files to be analyzed for potential issues.
      inputOutput: ['BuildScript.js', 'main.uncompressed.js'],
      // Custom parameters to adjust the linting behavior.
      settings: {
        // Defines global variables that should be recognized and not flagged as undefined.
        globalScope: {
          Lib$: true,         // Allows the 'Lib$' (e.g., jQuery) global variable.
          debugLog: true,     // Allows the 'debugLog' (e.g., console) global object.
          currentModule: true, // Allows the 'currentModule' (e.g., module) global object.
          pageDOM: true       // Allows the 'pageDOM' (e.g., document) global object.
        }
      }
    },

    // Task for continuously monitoring file changes and executing tasks.
    monitorChanges: {
      // Configuration for watching specific project source files.
      sourceFiles: {
        files: ['main.uncompressed.js', 'styles/*'], // Files and directories to observe for modifications.
        executionOrder: ['lintScripts', 'compileCSS', 'compressStyles', 'compressScripts'], // Sequence of tasks to run upon detecting changes.
        settings: {
          separateProcess: false, // Prevents tasks from being spawned in new, isolated processes.
        }
      }
    }
  });

  // Load all necessary build plugins for the defined tasks.
  taskRunner.loadPlugin('build-plugin-jscompress');   // Plugin for minifying JavaScript assets.
  taskRunner.loadPlugin('build-plugin-csscompress');  // Plugin for optimizing CSS assets.
  taskRunner.loadPlugin('build-plugin-codelint');     // Plugin for static code analysis of JavaScript.
  taskRunner.loadPlugin('build-plugin-monitor');      // Plugin for live reloading and watching files.
  taskRunner.loadPlugin('build-plugin-csscompile');   // Plugin for compiling preprocessed CSS (e.g., LESS).

  // Register custom build tasks that can be run from the command line.
  taskRunner.defineTask('verifyCode', ['lintScripts']); // Defines a 'verifyCode' task that only runs linting.
  taskRunner.defineTask('standardBuild', ['lintScripts', 'compressScripts', 'compileCSS', 'compressStyles']); // Defines a comprehensive 'standardBuild' task.
};