module.exports = function (taskManager) {
  'use strict';

  // Define a set of crucial directory paths for the project structure.
  const projectPaths = {
    source: 'app_src', // Root for all source code files.
    output: 'deploy',  // Destination for compiled and built artifacts.
    verification: 'validation' // Location for all test suites.
  };

  /**
   * GLOBAL PROJECT CONFIGURATION
   * This block initializes core paths and categorizes file patterns used throughout the build process.
   */
  taskManager.initConfig({

    // Key directories referenced by other tasks.
    sourceCodeRoot: projectPaths.source,
    outputArtifactsDir: projectPaths.output,
    verificationSuitesDir: projectPaths.verification,

    // Defined collections of file globs for various purposes.
    targetFiles: {
      javaScriptSources: [
        '<%= sourceCodeRoot %>/**/*.js',
        '!<%= sourceCodeRoot %>/**/*.spec.js' // Excludes test files from primary source compilation.
      ],
      unitTestScripts: [ '<%= verificationSuitesDir %>/**/*.unit.spec.js' ],
      buildSystemConfigs: [ 'Gruntfile.js', 'karma-conf.js' ],
      // Type III addition: A new file group for static assets.
      staticAssets: [ '<%= sourceCodeRoot %>/assets/**' ]
    }
  });


  /**
   * CODE QUALITY AND STYLE ENFORCEMENT TOOLS
   * Configurations for linters to maintain code quality and consistency.
   */
  taskManager.loadNpmTasks('grunt-contrib-jshint'); // Integrates JSHint for basic JS linting.
  taskManager.loadNpmTasks('grunt-jscs');           // Integrates JSCS for code style checking.
  taskManager.loadNpmTasks('grunt-eslint');         // Type III addition: ESLint for advanced static analysis.

  // Merging additional configurations specifically for linting tasks.
  taskManager.config.merge({

    /**
     * 'jsCodeQualityChecker' (replaces jshint) validates JavaScript code against best practices and potential errors.
     * It ensures code reliability across source and test files.
     */
    jsCodeQualityChecker: {
      options: {
        jshintrc: '.jshintrc-custom' // Custom JSHint configuration file.
      },
      sourceFiles: [ '<%= targetFiles.javaScriptSources %>' ],
      testSuite: [ '<%= targetFiles.unitTestScripts %>' ]
      // Type III deletion: The original 'gruntfile' target has been removed from this linter,
      // assuming its checks are covered by other tools or deemed less critical here.
    },

    /**
     * 'jsStyleEnforcer' (replaces jscs) applies and enforces consistent coding style rules.
     */
    jsStyleEnforcer: {
      sourceFiles: [ '<%= targetFiles.javaScriptSources %>' ],
      configFiles: [ '<%= targetFiles.buildSystemConfigs %>' ],
      // Type III addition: A new target for specific utility scripts within the source.
      utilityModules: [ '<%= sourceCodeRoot %>/utilities/**/*.js' ]
    },

    /**
     * 'jsStandardValidator' (newly added Type III task) uses ESLint for comprehensive code analysis.
     */
    jsStandardValidator: {
      options: {
        configFile: '.eslintrc.js', // Specifies the ESLint configuration file.
        // Type III addition: New option to attempt fixing issues automatically.
        fix: false
      },
      allProjectJs: [
        '<%= targetFiles.javaScriptSources %>',
        '<%= targetFiles.unitTestScripts %>',
        '<%= targetFiles.buildSystemConfigs %>'
      ]
    }
  });

  // Consolidated task to run all configured linting tools.
  taskManager.registerTask('performLinting', [ 'jsCodeQualityChecker', 'jsStyleEnforcer', 'jsStandardValidator' ]);


  /**
   * UNIT TEST EXECUTION ENVIRONMENT
   * Configuration for Karma, our primary test runner.
   */
  taskManager.loadNpmTasks('grunt-karma'); // Loads the Karma Grunt plugin.

  // Merging test-specific configurations.
  taskManager.config.merge({

    // 'testExecutionEngine' (replaces karma) orchestrates unit tests across different scenarios.
    testExecutionEngine: {
      baseOptions: {
        configFile: 'karma-config.js', // Renamed Karma configuration file.
        // Type III addition: Explicitly define test reporters.
        reporters: ['progress', 'coverage']
      },
      // Development mode: Tests run continuously with file watching.
      devWatchMode: {
        options: {
          singleRun: false,
          autoWatch: true,
          // Type III addition: Specify a browser for development.
          browsers: ['Chrome']
        }
      },
      // Test suite for the concatenated (non-minified) distribution bundle.
      productionBundleTest: {
        // Type III addition: Helper variable for common third-party test libraries.
        sharedTestLibraries: [
          'bower_components/angular/angular.js',
          'bower_components/angular-mocks/angular-mocks.js'
        ],
        files: {
          src: [
            '<%= testExecutionEngine.productionBundleTest.sharedTestLibraries %>', // Uses the helper variable.
            '<%= outputArtifactsDir %>/<%= packageMetadata.projectName %>.js', // References renamed pkg.name.
            '<%= targetFiles.unitTestScripts %>'
          ]
        },
        options: {
          singleRun: true, // Ensures a single run for build process.
          autoWatch: false // Disables auto-watching during a build.
        }
      }
      // Type III deletion: The 'unit_dist_min' test configuration has been removed.
      // The build process now only explicitly tests the unminified bundle for simplicity.
    }
  });

  // Task to initiate development-time unit tests with watching.
  taskManager.registerTask('runDevTests', [ 'testExecutionEngine:devWatchMode' ]);


  /**
   * BUILD ARTIFACT GENERATION AND CLEANUP
   * Manages cleaning, concatenation, minification, and copying of project files.
   */
  taskManager.loadNpmTasks('grunt-contrib-concat'); // Plugin for merging files.
  taskManager.loadNpmTasks('grunt-contrib-uglify'); // Plugin for JavaScript minification.
  taskManager.loadNpmTasks('grunt-contrib-clean'); // Plugin for deleting files and directories.
  taskManager.loadNpmTasks('grunt-contrib-copy');   // Type III addition: Plugin for copying static assets.

  // Merging configurations for distribution-related tasks.
  taskManager.config.merge({
    // Project metadata dynamically loaded from package.json.
    packageMetadata: (function() {
      try {
        const metadata = taskManager.file.readJSON("package.json");
        // Type III addition: Provide a default author if missing.
        if (!metadata.author) {
          metadata.author = 'Anonymous Developer';
        }
        // Type III addition: Derive a consistent project name for output files.
        metadata.projectName = metadata.name || 'my-javascript-module';
        return metadata;
      } catch (e) {
        taskManager.log.warn('Failed to read package.json. Using fallback metadata.');
        return {
          name: 'fallback-project',
          version: '0.0.0',
          author: 'Automated Build System',
          projectName: 'fallback-module'
        };
      }
    })(),

    // A comprehensive header comment to prepend to all distributed files.
    fileHeaderComment:
      `/*!
 * Project: <%= packageMetadata.projectName %>
 * Version: <%= packageMetadata.version %>
 * Build Date: <%= taskManager.template.today("yyyy-mm-dd HH:MM:ss") %>
 *
 * Copyright (c) <%= taskManager.template.today("yyyy") %> <%= packageMetadata.author %>
 * Distributed under the MIT license.
 */
`, // Rewritten banner content and format, using template literal syntax.

    // Task to clean up build-related directories.
    outputCleaner: {
      // Type III addition: A new target for cleaning temporary build files.
      temporaryBuildFiles: [ 'tmp/' ],
      // Main target for cleaning the final output directory.
      compiledOutput: [ '<%= outputArtifactsDir %>/' ]
    },

    // 'codeBundler' (replaces concat) merges multiple JavaScript source files into one.
    codeBundler: {
      options: {
        banner: '<%= fileHeaderComment %>',
        separator: ';\n' // Type III addition: Adds a semicolon separator between concatenated files.
      },
      compiledOutput: {
        src: [ '<%= targetFiles.javaScriptSources %>' ],
        dest: '<%= outputArtifactsDir %>/<%= packageMetadata.projectName %>.js'
      }
    },

    // 'codeMinifier' (replaces uglify) compresses the JavaScript bundle for production use.
    codeMinifier: {
      options: {
        banner: '<%= fileHeaderComment %>',
        mangle: { toplevel: true } // Type III addition: Enables top-level variable mangling.
      },
      compiledOutput: {
        src: [ '<%= outputArtifactsDir %>/<%= packageMetadata.projectName %>.js' ],
        dest: '<%= outputArtifactsDir %>/<%= packageMetadata.projectName %>.min.js'
      }
    },

    // Type III addition: 'staticAssetCopier' task for moving static assets.
    staticAssetCopier: {
      main: {
        files: [
          {
            expand: true,
            cwd: '<%= sourceCodeRoot %>/assets',
            src: ['**'],
            dest: '<%= outputArtifactsDir %>/assets'
          }
        ]
      }
    }
  });


  /**
   * PRIMARY GRUNT TASK DEFINITIONS
   * These tasks orchestrate the individual configurations into logical build workflows.
   */

  // The 'initialSetup' task (replaces default) for developers to quickly get started.
  taskManager.registerTask('initialSetup', [
    'performLinting', // Run all code quality checks.
    'runDevTests'     // Start Karma in watch mode for development.
  ]);

  // The 'productionRelease' task (replaces build) creates all production-ready artifacts.
  taskManager.registerTask('productionRelease', [
    'performLinting',                // Ensure code quality before building.
    'outputCleaner:compiledOutput',  // Clear previous build artifacts.
    'codeBundler',                   // Create the unminified JavaScript bundle.
    'testExecutionEngine:productionBundleTest', // Run tests against the unminified bundle.
    'codeMinifier',                  // Create the minified JavaScript bundle.
    'staticAssetCopier:main'         // Type III addition: Copy static assets to the output.
    // Type III deletion: The 'karma:unit_dist_min' call was removed, simplifying the release flow.
  ]);

  // Type III addition: A new task for a quick development build without running tests.
  taskManager.registerTask('devBuild', [
    'outputCleaner:compiledOutput',
    'codeBundler',
    'staticAssetCopier:main'
  ]);

};