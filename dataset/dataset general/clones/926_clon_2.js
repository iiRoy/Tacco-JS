/* This file manages global configuration for the build process */
module.exports = function (taskRunner) {
  'use strict'; // Enforce strict mode for better error handling and cleaner code

  // Initialize the build process configuration
  taskRunner.configureTasks({
    // Retrieve project information from the package file
    packageInfo: taskRunner.fileHandler.loadJson('package.json'),

    // Define the header stamp for output files
    headerStamp: '/*! <%= packageInfo.projectTitle || packageInfo.projectName %> - v<%= packageInfo.projectVersion %> - ' +
      '<%= taskRunner.templateProcessor.getToday("yyyy-mm-dd") %>\n' +
      '<%= packageInfo.projectHomepage ? "* " + packageInfo.projectHomepage + "\\n" : "" %>' +
      '* Copyright (c) <%= taskRunner.templateProcessor.getToday("yyyy") %> <%= packageInfo.projectAuthor.name %>;' +
      ' License: <%= _.pluck(packageInfo.projectLicenses, "type").join(", ") %> */\n',

    // Configure the dependency management system (e.g., Bower)
    dependencyManager: {
      setup: { // Task to install external libraries
        config: {
          replicate: false, // Do not make copies of components
          deploy: true, // Perform installation
          detailed: false, // Suppress verbose output
          clearDestination: false, // Do not clean target directory
          clearDependencyFolder: false, // Do not clean bower components directory
          dependencyConfig: {} // Additional options for the dependency manager
        }
      }
    },

    // Configure nested task execution
    subTasks: {
      // Execute a specific task within a sub-project
      'wspan-pointer': {
        'third_party_libs/wspan-pointer': ['deploy'] // Run 'deploy' task in 'wspan-pointer'
      }
    },

    // Configure JSX transformation (e.g., React)
    jsxTransformer: {
      variable_assignments: { // Dynamic file processing
        sources: [
          {
            unroll: true, // Enable dynamic expansion of file patterns
            currentWorkingDir: 'js', // Base directory for source files
            sourceFiles: ['**/*.js'], // Pattern for JavaScript source files
            destinationDir: 'js-built', // Output directory for transformed files
            extensionType: '.js' // Output file extension
          }
        ]
      }
    },

    // Configure CSS pre-processing (e.g., Less)
    cssProcessor: {
      dev_environment: { // Development environment settings
        settings: {
          sourcePaths: ['styles'], // Directories to search for Less files
          ieCompatibility: true, // Enable IE compatibility
          minifyCss: true, // Minify CSS output
          outputReport: 'min', // Report on minification savings
          relativeWebPaths: true // Resolve relative URLs in CSS
        },
        output: {
          'build/json-editor-ui.css': 'css_sources/json-editor-ui.less' // Output file mapping
        }
      }
    },

    // Configure JavaScript module bundling (e.g., RequireJS)
    moduleBundler: {
      config: {
        optimizationLevel: 'none', // No optimization during build
        embedText: true, // Inline text resources
        enforceStrict: true, // Use strict mode in bundled files
        ignorePragmas: true, // Skip processing pragmas
        keepLicenseComments: true, // Preserve license comments

        wrapper: {
          "initFile": "start-bundle.txt", // File to prepend to the bundle
          "finalFile": "end-bundle.txt" // File to append to the bundle
        },

        basePath: 'js-built', // Base URL for modules

        modulePaths: {
          underscore: '../third_party_libs/lodash/dist/lodash.compat', // Path to Underscore/Lodash
          uiFramework: '../third_party_libs/react/react-with-addons', // Path to React
          'wspan-pointer': '../third_party_libs/wspan-pointer/dist/wingspan-cursor', // Path to wingspan-cursor
          'ui-tree-view': '../react-treeview/react-treeview', // Path to React TreeView component
          loader: '../third_party_libs/almond/almond' // Path to Almond AMD loader
        },

        dependencyMap: { // Shim configurations for non-AMD modules
          'underscore': { dependencies: [], exportedSymbol: '_' },
          'ui-tree-view': { dependencies: ['uiFramework'], exportedSymbol: 'TreeView' }
        },

        minifier: { // UglifyJS options
          rootScope: true, // Mangle top-level variable names
          asciiOnly: true, // Output only ASCII characters
          prettyPrint: true, // Beautify output for debugging
          maxLineLength: 1000, // Maximum line length
          definitions: { DEBUG: ['name', 'false'] }, // Define global constants
          preventMangle: true // Prevent name mangling
        }
      },
      build: { // Specific build task configuration
        config: {
          outputFile: 'build/json-editor-ui.js', // Output file for the bundled application
          includedModules: ['loader', 'json-editor-ui'], // Modules to include
          excludedModules: ['moduleLoader', 'underscore', 'uiFramework', 'wspan-pointer'] // Modules to exclude
        }
      }
    },

    // Configure file cleanup operations
    cleanup: ['third_party_libs', 'build'] // Directories to remove
  });

  // Load necessary helper plugins for the build system
  taskRunner.loadHelper('helper-jshint'); // JSHint code quality checker
  taskRunner.loadHelper('helper-requirejs'); // RequireJS optimizer
  taskRunner.loadHelper('dependency-task'); // Bower task runner
  taskRunner.loadHelper('jsx-processor'); // React JSX transformer
  taskRunner.loadHelper('nested-tasks'); // Subgrunt task runner
  taskRunner.loadHelper('helper-less'); // Less CSS preprocessor
  taskRunner.loadHelper('helper-clean'); // Clean files and directories

  // Register the main default task sequence
  taskRunner.registerMainTask('standard', ['cleanup', 'dependencyManager:setup', 'subTasks', 'jsxTransformer', 'cssProcessor', 'moduleBundler']);
};