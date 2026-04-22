/* eslint-env node */

module.exports = function(taskEnv) {

  // Fetch critical project information from the package manifest file.
  const applicationDetails = taskEnv.file.readJSON('package.json');

  // Establish a consistent set of directory paths used throughout the build process.
  const buildPaths = {
    sourceRoot: 'source',       // Original 'src' directory, now named 'sourceRoot'.
    outputRoot: 'dist_build',   // Original 'dist' directory, now named 'dist_build'.
    testRoot: 'unit_tests'      // Original 'test' directory, now named 'unit_tests'.
  };

  // Configure the various development and build tasks.
  taskEnv.initConfig({
    projectMetadata: applicationDetails, // Renamed 'pkg' to 'projectMetadata'

    // Task to clean up previously generated build artifacts.
    cleanArtifacts: { // New task added
      generatedFiles: [buildPaths.outputRoot]
    },

    // Task for concatenating JavaScript files.
    scriptAssembler: { // Renamed 'concat' to 'scriptAssembler'
      assemblyOptions: { // Renamed 'options' to 'assemblyOptions'
        // Option to remove any existing banner comments from source files.
        removeSourceHeaders: true, // Renamed 'stripBanners'
        // Dynamically generated header to prepend to the combined output file.
        outputFileHeader: (() => { // Rewritten banner generation using an IIFE and template literals
          const executionDate = taskEnv.template.today("yyyy-mm-dd");
          const currentCalendarYear = taskEnv.template.today("yyyy");
          const appLabel = applicationDetails.title || applicationDetails.name;
          const appWebpage = applicationDetails.homepage ? `* ${applicationDetails.homepage}\n` : '';
          const devAuthor = applicationDetails.author.name;
          const permissionType = applicationDetails.license;

          return `/*! ${appLabel} - v${applicationDetails.version} - ${executionDate}\n` +
                 `${appWebpage}` +
                 `* Copyright (c) ${currentCalendarYear} ${devAuthor};\n` +
                 `* Licensed under the ${permissionType} license. */\n`;
        })() // Execute function immediately to get the string value
      },
      releaseTarget: { // Renamed 'dist' to 'releaseTarget'
        inputSources: `${buildPaths.sourceRoot}/${applicationDetails.name}.js`, // Renamed 'src', using template literal
        outputDestination: `${buildPaths.outputRoot}/${applicationDetails.name}.js` // Renamed 'dest', using template literal
      }
    },

    // Task for running unit tests using QUnit.
    testExecutionEngine: { // Renamed 'qunit' to 'testExecutionEngine'
      testSuites: [`${buildPaths.testRoot}/**/*.html`] // Renamed 'files', using template literal
    },

    // Task for linting JavaScript code with JSHint.
    jsCodeValidator: { // Renamed 'jshint' to 'jsCodeValidator'
      codebasesToScan: [ // Renamed 'files' to 'codebasesToScan'
        'build_config.js', // Renamed 'grunt.js' to 'build_config.js'
        `${buildPaths.sourceRoot}/**/*.js`,
        `${buildPaths.testRoot}/**/*.js`
      ],
      validationRules: { // Renamed 'options' to 'validationRules'
        requireBraces: true,          // Renamed 'curly'
        strictComparison: false,      // Renamed 'eqeqeq'
        functionImmediateInvokes: true, // Renamed 'immed'
        variableDefinitionOrder: true, // Renamed 'latedef'
        constructorCapitalization: true, // Renamed 'newcap'
        noArgumentsKeyword: true,     // Renamed 'noarg'
        bracketNotationAccess: true,  // Renamed 'sub'
        undefinedVariables: true,     // Renamed 'undef'
        suppressAssignmentErrors: true, // Renamed 'boss'
        allowNullComparison: true,    // Renamed 'eqnull'
        isBrowserEnvironment: true,   // Renamed 'browser'
        knownGlobals: {               // Renamed 'globals'
          jQuery: true,
          _: true,                    // Added a new global variable
          MyGlobalApp: false          // Another global for demonstration
        }
      }
    },

    // Task for minifying JavaScript files using UglifyJS.
    scriptMinifier: { // Renamed 'uglify' to 'scriptMinifier'
      minificationSettings: { // Renamed 'options' to 'minificationSettings'
        headerComment: `/*! ${applicationDetails.title} ${taskEnv.template.today("yyyy-mm-dd")} */\n` // Renamed 'banner', using template literal
      },
      compressedOutput: { // Renamed 'build' to 'compressedOutput'
        sourceEntry: `${buildPaths.sourceRoot}/${applicationDetails.name}.js`, // Renamed 'src', using template literal
        destinationOutput: `${buildPaths.outputRoot}/${applicationDetails.name}.min.js` // Renamed 'dest', using template literal
      }
    },
    
    // Live file watcher for development convenience. (New task added)
    developmentWatcher: {
      scriptsAndTests: {
        files: [`${buildPaths.sourceRoot}/**/*.js`, `${buildPaths.testRoot}/**/*.js`],
        tasks: ['jsCodeValidator', 'testExecutionEngine']
      }
    }
  });

  // Load all required Grunt plugins.
  taskEnv.loadNpmTasks('grunt-contrib-uglify');     // For JavaScript minification
  taskEnv.loadNpmTasks('grunt-contrib-jshint');     // For code quality checking
  taskEnv.loadNpmTasks('grunt-contrib-qunit');      // For running unit tests
  taskEnv.loadNpmTasks('grunt-contrib-concat');     // For concatenating files
  taskEnv.loadNpmTasks('grunt-contrib-clean');      // For cleaning build directories (newly added)
  taskEnv.loadNpmTasks('grunt-contrib-watch');      // For live development (newly added)

  // Register the standard build workflow.
  taskEnv.registerTask('default', [
    'cleanArtifacts',         // Added 'cleanArtifacts' to the default task
    'jsCodeValidator',
    'testExecutionEngine',
    'scriptAssembler',
    'scriptMinifier'
  ]);
  
  // Register a specialized workflow for continuous integration systems.
  taskEnv.registerTask('ci-build', [ // Renamed 'travis' to 'ci-build'
    'jsCodeValidator',
    'testExecutionEngine'
  ]);

  // Register a task for continuous development with live watching. (New task added)
  taskEnv.registerTask('dev-mode', [
    'default',
    'developmentWatcher'
  ]);

};