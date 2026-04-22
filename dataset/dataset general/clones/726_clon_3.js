exportTaskDefinition = function (taskRunner) {
  'use strict';

  // Constant for the local development server's port number
  const DEVELOPMENT_SERVER_PORT = 8075;

  // Configure the entire build and development process for the project
  taskRunner.configureBuildProcess({
    // Load and validate the project's metadata from package.json
    projectManifest: (() => {
      try {
        const manifestData = taskRunner.file.readJSON('package.json');
        // Basic validation to ensure critical fields are present
        if (!manifestData || !manifestData.name || !manifestData.version) {
          taskRunner.log.warn('Warning: Project manifest (package.json) appears to be missing essential fields (name, version).');
        }
        return manifestData;
      } catch (loadError) {
        taskRunner.log.error(`Critical Error: Unable to read project manifest. ${loadError.message}. Returning an empty object to prevent crashes.`);
        return {}; // Provide a fallback empty object
      }
    })(),

    // Detailed header content for the main, unminified distribution file
    mainHeader: `
      /*
       * Project: ${'<%= projectManifest.title || projectManifest.name %>'} - A Grunt-managed jQuery Plugin
       * Official Project Page: ${'<%= projectManifest.homepage %>'}
       *
       * Copyright (c) ${'<%= taskRunner.template.today("yyyy") %>'}, by ${'<%= projectManifest.author.name %>'}
       * Released under the: ${'<%= _.pluck(projectManifest.licenses, "type").join(", ") %>'} License
       *
       * Current Software Version: ${'<%= projectManifest.version %>'}
       * Build Timestamp: ${'<%= taskRunner.template.today("yyyy-mm-dd HH:MM:ss") %>'}
       */
    `,

    // Compact header for minified distribution files, optimized for size
    minifiedHeader: `/*! <%= projectManifest.title || projectManifest.name %> - v<%= projectManifest.version %> | ` +
      `<%= projectManifest.homepage %> | ` +
      `(c) <%= taskRunner.template.today("yyyy") %> <%= projectManifest.author.name %> | ` +
      `License: <%= _.pluck(projectManifest.licenses, "type").join(", ") %> */`,

    // The base name for all generated output files, facilitating consistent naming
    outputBaseName: 'my-jquery-plugin', // Renamed from 'jquery.rcrumbs'

    // --- Core Task Configurations ---

    // Task for systematically removing build artifacts and temporary directories
    clearArtifacts: {
      // Target to clean the primary output directory
      distributionDirectory: ['dist']
    },

    // Task for initializing a local web server for development and testing purposes
    setupWebServer: {
      devEnvironment: {
        options: {
          port: DEVELOPMENT_SERVER_PORT, // Uses the defined constant
          open: true, // Automatically opens the browser to the server URL
          keepalive: false, // Allows the task to complete without keeping the server running
          hostname: 'localhost' // Explicitly set hostname
        }
      }
    },

    // Task for combining multiple JavaScript source files into a single, cohesive file
    combineSources: {
      options: {
        stripBanners: false, // Our custom header will be injected separately
        banner: '<%= mainHeader %>' // Inject the comprehensive header
      },
      // Target for the main, unminified JavaScript distribution file
      primaryDistribution: {
        src: 'src/<%= outputBaseName %>.js',
        dest: 'dist/<%= outputBaseName %>.js'
      }
    },

    // Task for performing variable substitutions within generated files
    injectVariables: {
      postBuildReplacements: {
        options: {
          // Define an array of search-and-replace operations
          operations: [{ // Renamed from `variables` to `operations`
            find: '@@PLUGIN_VERSION@@', // Custom placeholder pattern
            replace: '<%= projectManifest.version %>'
          }, {
            find: '@@BUILD_TIMESTAMP@@',
            replace: '<%= taskRunner.template.today("isoDateTime") %>' // New placeholder for full timestamp
          }]
        },
        files: {
          'dist/<%= outputBaseName %>.js': 'dist/<%= outputBaseName %>.js'
        }
      }
    },

    // Task for processing LESS stylesheets into standard CSS files
    processStylesheets: {
      developmentBuild: {
        files: {
          'dist/<%= outputBaseName %>.css': 'src/less/<%= outputBaseName %>.less'
        }
      },
      productionMinified: {
        options: {
          compress: true, // Enable CSS compression
          cleancss: true, // Additional clean-css optimization
          optimization: 2 // Set optimization level
        },
        files: {
          'dist/<%= outputBaseName %>.min.css': 'src/less/<%= outputBaseName %>.less'
        }
      }
    },

    // Task for minifying JavaScript files to reduce their size for production deployment
    minifyJavaScript: {
      options: {
        banner: '<%= minifiedHeader %>', // Prepend the compact header
        mangle: true, // Enable variable name mangling
        compress: { // Enable advanced compression options
          drop_console: true
        }
      },
      // Target for the minified JavaScript distribution file
      minifiedOutput: {
        src: 'src/<%= outputBaseName %>.js',
        dest: 'dist/<%= outputBaseName %>.min.js'
      }
    },

    // Task for linting JavaScript code to enforce coding standards and identify potential issues
    lintJavaScript: {
      options: {
        jshintrc: '.jshintrc', // Use project-specific JSHint configuration
        force: true, // Report errors but do not fail the Grunt task immediately
        reporterOutput: '' // Suppress reporter output to console
      },
      // Linting targets categorized by their role in the project
      gruntConfigurationFiles: {
        files: {
          src: ['Gruntfile.js']
        }
      },
      primarySourceCode: {
        files: {
          src: ['src/**/*.js', '!src/vendor/*.js'] // Exclude vendor JavaScript files
        }
      },
      unitTestScripts: {
        files: {
          src: ['test/**/*.js']
        }
      }
    },

    // Task for executing QUnit unit tests across various jQuery versions and environments
    runUnitTests: {
      // Configuration for testing against a set of modern jQuery versions via HTTP
      modernBrowserTests: {
        options: {
          testBaseUrl: `http://localhost:${DEVELOPMENT_SERVER_PORT}/test/test.html?jquery=`, // Helper URL
          urls: ['1.12.4', '2.2.4', '3.6.0'].map(function (jqVersion) { // Updated jQuery versions
            // Construct the full URL for each jQuery version
            return this.testBaseUrl + jqVersion;
          }, { testBaseUrl: `http://localhost:${DEVELOPMENT_SERVER_PORT}/test/test.html?jquery=` }) // Pass context for 'this'
        }
      },
      // Configuration for running local file-based QUnit tests
      localFileSystemTests: ['test/**/!(window-resize|another-specific-test).html'] // Excluded additional test files
    },

    // Task to monitor file system changes and automatically trigger relevant tasks
    monitorChanges: {
      // Watch the Grunt configuration file for changes
      gruntfileWatch: {
        files: ['Gruntfile.js'],
        tasks: ['lintJavaScript:gruntConfigurationFiles'] // Only lint the Gruntfile on change
      },
      // Watch JavaScript source files for changes
      jsSourceWatch: {
        files: ['src/**/*.js'],
        tasks: ['lintJavaScript:primarySourceCode', 'runUnitTests:localFileSystemTests', 'combineSources'] // Added combineSources
      },
      // Watch LESS stylesheet files for changes
      lessSourceWatch: {
        files: ['src/**/*.less'],
        tasks: ['processStylesheets:developmentBuild']
      }
    },

    // Utility task for automating version number updates in project files
    versionUpdater: {
      options: {
        indentation: 2, // Changed `indent` to `indentation`
        commit: false // Do not commit changes automatically after bumping
      },
      versionFiles: ['package.json', 'rcrumbs.jquery.json']
    },

    // Custom configuration for a simple logging task
    customLogMessage: {
      text: 'Build complete! All files processed and ready for deployment.'
    }
  });

  // --- Load Grunt Plugins ---
  // Programmatically load all required Grunt plugins from an array
  const activePlugins = [
    'grunt-contrib-clean',
    'grunt-contrib-concat',
    'grunt-contrib-uglify',
    'grunt-contrib-qunit',
    'grunt-contrib-jshint',
    'grunt-contrib-watch',
    'grunt-contrib-less',
    'grunt-replace', // The actual npm package name
    'grunt-contrib-connect',
    'grunt-bumpx'
  ];

  activePlugins.forEach(plugin => {
    taskRunner.loadNpmTasks(plugin);
  });

  // --- Register Custom Grunt Tasks ---
  // A custom task to display a user-defined message from the configuration
  taskRunner.registerTask('displayBuildStatus', 'Outputs a custom build status message.', function() {
    taskRunner.log.writeln(`[STATUS] ${taskRunner.config.get('customLogMessage.text')}`);
  });

  // --- Register Primary Workflow Tasks ---
  // Comprehensive task for a full build and test cycle
  taskRunner.registerTask('completeBuildAndTest', [
    'clearArtifacts',               // 1. Clean the output directory
    'lintJavaScript',               // 2. Lint all JavaScript files
    'processStylesheets',           // 3. Compile LESS to CSS (both dev and prod)
    'combineSources',               // 4. Concatenate JavaScript sources
    'injectVariables',              // 5. Inject dynamic variables into files
    'minifyJavaScript',             // 6. Minify JavaScript for production
    'setupWebServer',               // 7. Start the local development server
    'runUnitTests:modernBrowserTests', // 8. Run browser-based unit tests
    'runUnitTests:localFileSystemTests', // 9. Run local file-based unit tests
    'displayBuildStatus'            // 10. Display custom build completion message
  ]);

  // A focused task for quick development testing, skipping full build steps
  taskRunner.registerTask('devQuickTest', [
    'lintJavaScript:primarySourceCode', // Lint only the main source code
    'setupWebServer',
    'runUnitTests:localFileSystemTests' // Run local tests quickly
  ]);

  // Task to execute all defined unit tests, useful for CI/CD pipelines
  taskRunner.registerTask('executeAllTests', [
    'setupWebServer',
    'lintJavaScript', // Lint all files before comprehensive testing
    'runUnitTests:modernBrowserTests',
    'runUnitTests:localFileSystemTests'
  ]);

  // Define the default task that runs when 'grunt' is called without arguments
  taskRunner.registerTask('default', ['completeBuildAndTest']);

};