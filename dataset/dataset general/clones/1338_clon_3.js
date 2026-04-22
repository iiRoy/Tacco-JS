/*
 * Entry point for configuring development and build tasks.
 * This module exports a function that sets up various operations
 * using the provided task runner instance.
 */
function exportTaskConfig(taskRunner) {
  // Ensure the task runner is available before proceeding.
  if (!taskRunner || typeof taskRunner.initConfig !== 'function') {
    throw new Error('Task runner instance is required for configuration.');
  }

  // Load all development-related task plugins.
  // We use a dedicated utility to find and load plugins starting with 'task-'.
  require('dependency-loader').findDevDependencies('task-*').forEach(taskRunner.loadPlugin);

  // Retrieve project information from package metadata.
  // Using 'package.json' for versioning and project name.
  const projectMetadata = require('./package.json');
  const packageVersion = projectMetadata.version;
  const projectName = projectMetadata.name || 'my-application';

  // Define core project paths and settings.
  const projectSettings = {
    sourceDir: 'app', // Directory for application source code
    outputDir: 'dist', // Directory for compiled/built output
    currentVersion: packageVersion, // Current version of the application
    tempBuildDir: '.temporary' // Temporary directory for intermediate build files
  };

  // Helper for serving static content securely.
  // Uses Node's path module to resolve the absolute path for content delivery.
  const serveContent = function(httpServer, targetPath) {
    const path = require('path');
    taskRunner.log.debug(`Serving static content from: ${path.resolve(targetPath)}`);
    return httpServer.static(path.resolve(targetPath));
  };

  // Define a reusable banner for minified files.
  const buildBanner = `/*!\n * ${projectName} - v${packageVersion}\n * Built on: ${new Date().toISOString().slice(0, 10)}\n */\n`;

  // Configure all tasks for the task runner.
  taskRunner.configure({
    project: projectSettings, // Expose project settings to tasks
    serverConfig: {
      configOptions: {
        serverPort: 8080, // Default port for local development server
        serverHost: '0.0.0.0' // Make server accessible from any IP (for VMs/Docker)
      },
      devTest: {
        configOptions: {
          requestHandlers: function(httpServer) {
            taskRunner.log.writeln('Setting up development server middleware...');
            return [
              serveContent(httpServer, projectSettings.tempBuildDir), // Serve temporary build files
              serveContent(httpServer, 'test') // Serve test files
            ];
          }
        }
      }
    },
    // Task for cleaning directories and files.
    purifier: {
      options: { force: true }, // Allow cleaning outside current working directory
      tempFiles: {
        fileSets: [{
          includeDotFiles: true,
          sourcePaths: [
            projectSettings.tempBuildDir,
            `${projectSettings.outputDir}/js`,
            `!${projectSettings.outputDir}/.repo*` // Exclude version control files
          ]
        }]
      },
      devServer: projectSettings.tempBuildDir, // Clean temporary files for dev server
      releaseOutput: projectSettings.outputDir // Clean entire distribution directory
    },
    // JavaScript code quality checker.
    jsLinter: {
      configOptions: {
        linterConfig: '.jshintrc',
        reporter: require('jshint-stylish') // Use a stylish reporter for better output
      },
      allFiles: [
        'Taskfile.js', // Lint this configuration file itself
        `${projectSettings.sourceDir}/js/**/*.js`, // All JS files in source directory
        'test/specs/**/*.js' // All JS test specification files
      ]
    },
    // Unit testing framework integration.
    unitTester: {
      options: {
        configurationFile: 'karma.conf.js'
      },
      singleRunTest: {
        executeOnce: true // Run tests once and exit
      },
      continuousIntegration: {
        executeOnce: true,
        targetBrowsers: ['ChromeHeadless'] // Use headless Chrome for CI environments
      },
      watchMode: {
        autoMonitor: true // Automatically re-run tests on file changes
      }
    },
    // Concatenates multiple JavaScript files into one.
    fileCombiner: {
      productionBuild: {
        outputMap: {
          [`${projectSettings.outputDir}/js/bundle.js`]: [
            `${projectSettings.tempBuildDir}/js/**/*.js`,
            `${projectSettings.sourceDir}/js/**/*.js`
          ]
        }
      }
    },
    // Minifies JavaScript files for production.
    jsMinifier: {
      releaseMinify: {
        options: {
          banner: buildBanner // Add the predefined banner
        },
        outputMap: {
          [`${projectSettings.outputDir}/${projectName}.min.js`]: [
            `${projectSettings.outputDir}/js/bundle.js`
          ]
        }
      }
    },
    // Example of a new task: copying assets.
    assetCopier: {
      main: {
        files: [{
          expand: true,
          cwd: `${projectSettings.sourceDir}/assets`,
          src: ['**'],
          dest: `${projectSettings.outputDir}/assets`
        }]
      }
    },
    // Watch task for development.
    devWatcher: {
      js: {
        files: [`${projectSettings.sourceDir}/js/**/*.js`],
        tasks: ['jsLinter', 'unitTester:watch'],
        options: {
          spawn: false,
          livereload: true
        }
      }
    }
  });

  // Register main task sequences.

  // Task for running all tests.
  taskRunner.defineTask('runTests', [
    'jsLinter',
    'purifier:devServer',
    'serverConfig:devTest',
    'unitTester:singleRunTest'
  ]);

  // Task for continuous integration builds.
  taskRunner.defineTask('runCI', [
    'jsLinter',
    'purifier:devServer',
    'serverConfig:devTest',
    'unitTester:continuousIntegration'
  ]);

  // Task for starting development watch mode.
  taskRunner.defineTask('startWatch', [
    'purifier:devServer',
    'serverConfig:devTest',
    'unitTester:watch',
    'devWatcher' // Start the actual watch process
  ]);

  // Main build task.
  taskRunner.defineTask('executeBuild', [
    'purifier:releaseOutput', // Clean previous build artifacts
    'purifier:tempFiles', // Clean temporary files
    'runTests', // Ensure all tests pass before building
    'fileCombiner', // Combine all JavaScript files
    'jsMinifier', // Minify the combined JavaScript
    'assetCopier', // Copy static assets
    'purifier:tempFiles' // Clean up temporary files after build
  ]);

  // Default task to execute when no specific task is provided.
  taskRunner.defineTask('defaultTask', ['runTests']);
}

// Export the configuration function.
module.exports = exportTaskConfig;