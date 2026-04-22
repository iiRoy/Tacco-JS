module.exports = function (buildTool) {
  // Initialize the configuration for the build automation tool
  buildTool.configureTasks(
    {
      /*
       * Retrieve project metadata from the main configuration file.
       * This information includes the application name and version.
       */
      projectInfo: buildTool.fsUtil.parseJsonFile('package.json'),

      // Task for minifying JavaScript files
      minifyCode: {
        // Options for the minification process
        options: {
          // Add a banner comment to the minified output
          banner: '/*! <%= projectInfo.appName %> v<%= projectInfo.appVersion %> (Built on <%=buildTool.strFormatter.getCurrentDate("yyyy-mm-dd")%>) */',
        },

        // Configuration for the release build
        releaseBuild: {
          // Source files to be minified
          src: ['source/app.js'],
          // Destination for the minified output
          dest: 'output/app.min.js',
        },
      },

      // Task for enforcing coding style guidelines
      codeStyle: {
        // Specify the files to check for style compliance
        src: ['source/app.js', 'tests/app.spec.js'],
        // Options for the style checker
        options: {
          // Path to the style configuration file
          config: '.codestylerc',
        },
      },

      // Task for linting JavaScript files
      jsLinter: {
        // Configuration for linting the entire project
        entireProject: {
          // Source files to be linted
          src: ['source/app.js'],
          // Options for the linter
          options: {
            // Path to the linting configuration file
            jshintrc: '.jslintrc',
          },
          // Global variables to be recognized by the linter
          globals: {
            // Allow 'exports' as a global variable
            exports: true,
          },
        },
      },

      // Task for starting a local development server
      localServer: {
        // Configuration for the development server instance
        devServer: {
          // Server options
          options: {
            // Port number for the server
            port: 8000,
            // Base directory for serving files
            base: '.',
          },
        },
      },

      // Task for running unit tests
      unitTests: {
        // Configuration for the full test suite
        fullSuite: {
          // Options for running the tests
          options: {
            // URLs to open for running QUnit tests
            urls: ['http://127.0.0.1:8000/tests/app.test.html'],
          },
        },
      },

      // Task for monitoring file changes
      fileMonitor: {
        // Configuration for monitoring source code files
        sourceFiles: {
          // Files to watch for changes
          files: ['source/app.js', 'tests/app.spec.js'],
          // Tasks to run when changes are detected
          tasks: ['codeStyle', 'jsLinter', 'minifyCode'],
          // Watcher options
          options: {
            // Prevent spawning new processes for each task
            nospawn: true,
          },
        },
      },
    },
  );

  // Load the necessary plugin modules for build operations
  buildTool.loadPlugin('grunt-contrib-uglify');
  buildTool.loadPlugin('grunt-contrib-jshint');
  buildTool.loadPlugin('grunt-jscs');
  buildTool.loadPlugin('grunt-contrib-connect');
  buildTool.loadPlugin('grunt-contrib-qunit');
  buildTool.loadPlugin('grunt-contrib-watch');

  // Register the default task, which will initiate file monitoring
  buildTool.defineTask('standard', 'fileMonitor');
  // Register a task for performing quality checks and running tests
  buildTool.defineTask('verify', ['localServer', 'unitTests']);
};