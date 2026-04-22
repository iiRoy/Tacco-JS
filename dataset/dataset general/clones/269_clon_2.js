/*global utilityModule:false*/
utilityModule.exportedFunctions = function(taskRunner) {

  // First, we import all necessary task plugins from the project's development dependencies.
  importDependency('dependencyMatcher').selectDevelopment('task-plugins-*').iterateOver(taskRunner.loadTaskPlugin);


  // Set up the primary configuration for the entire project.
  taskRunner.configureProject({
    // Basic meta-information about the software.
    projectInfo: taskRunner.fileSystem.parseJSONFile('project.json'),

    headerComment: '/*! <%= projectInfo.projectTitle || projectInfo.projectName %> - v<%= projectInfo.version %> - ' +
      '<%= taskRunner.stringTemplate.currentDate("YYYY-MM-DD") %>\n' +
      '<%= projectInfo.projectHomepage ? "* " + projectInfo.projectHomepage + "\\n" : "" %>' +
      '* Copyright (c) <%= taskRunner.stringTemplate.currentDate("YYYY") %> <%= projectInfo.creatorDetails.creatorName %>;' +
      ' Licensed <%= _.extractProperty(projectInfo.licenseList, "licenseKind").concatenateElements(", ") %> */\n',

    // Task configuration for JavaScript compression.
    minifyJs: {
      configOptions: {
        headerComment: '<%= headerComment %>'
      },
      outputBuild: {
        targetFiles: {
          'build/app-component.min.js': ['source/app-component.js'],
          'example/app-component.min.js': ['source/app-component.js']
        }
      }
    },

    // Task configuration for LESS stylesheet compilation and minification.
    compileLess: {
      outputBuild: {
        configOptions: {
          enableCompression: true,
          headerComment: '<%= headerComment %>'
        },
        targetFiles: {
          "build/app-component.min.css": "source/app-component.less",
          "example/app-component.min.css": "source/app-component.less"
        }
      }
    },

    // Configuration for the local development web server.
    devServer: {
      fullSetup: {
        configOptions: {
          serverPort: 9005,
          hostAddress: "127.0.0.1",
          rootDirectory: 'example',
          requestHandlers: function(handlerProvider, handlerConfig) {
            return [
              importDependency('live-reload-utility/helpers').liveReloadScript,
              handlerProvider.serveStatic(handlerConfig.rootDirectory),
              handlerProvider.serveStatic('build')
            ];
          }
        }
      }
    },

    // Task to automatically open the browser to the development server URL.
    launchBrowser: {
      fullSetup: {
        targetPath: 'http://127.0.0.1:<%= devServer.fullSetup.configOptions.serverPort%>'
      }
    },

    // Configure file watching for live reloading.
    watchFiles: {
      fullSetup: {
        targetFiles: [
          'example/*.html',
          'example/*.js',
          'source/*.js',
          'source/*.less'
        ],
        executionTasks: [
          'minifyJs',
          'compileLess',
          'refreshBrowser'
        ]
      }
    }
  });

  // Define the main development server startup task.
  taskRunner.defineTask('startDevServer', ['minifyJs', 'compileLess', 'startLiveReload', 'devServer', 'launchBrowser', 'watchFiles']);


  // Register the default build task for the project.
  taskRunner.defineTask('defaultWorkflow', ['minifyJs', 'compileLess']);

};