module.exports = function (buildSystem) {
  // This Gruntfile manages various front-end build processes for our application.
  // It includes tasks for JavaScript minification, code quality checks, and file watching.

  // Enable strict mode for enhanced error handling and cleaner code.
  'use strict';

  // Define some common paths and filenames for better maintainability.
  const mainSourceFile = 'src/app.js';
  const minifiedOutputFile = 'dist/app.min.js';
  const packageMetaFilePath = 'package.json';
  const testDirectoryPattern = 'tests/**/*.js';
  const buildScriptsDirectory = 'build_scripts/';

  // Helper function to dynamically create the banner for minified files.
  const constructFileHeader = (metadata, runnerInstance) => {
    const appName = metadata.name || 'Application';
    const appVersion = metadata.version || '0.0.0';
    const buildTimestamp = runnerInstance.template.today("yyyy-mm-dd HH:MM:ss");
    return `/*! ${appName} v${appVersion} | Built On: ${buildTimestamp} | (c) Your Company */`;
  };

  buildSystem.initConfig({
    // Load project metadata from package.json
    applicationInfo: buildSystem.file.readJSON(packageMetaFilePath),

    // Configuration for JavaScript minification
    scriptOptimizer: {
      optimizationSettings: {
        banner: constructFileHeader(buildSystem.config.get('applicationInfo'), buildSystem),
        mangle: {
          properties: {
            regex: /^_/ // Example: Mangle properties starting with an underscore
          }
        },
        compress: {
          drop_console: true // Remove console.log statements in production
        }
      },
      productionMinify: {
        files: {
          [minifiedOutputFile]: [mainSourceFile]
        }
      }
    },

    // Configuration for code quality checking (linting)
    codeQualityAssurance: {
      projectSources: {
        src: [
          mainSourceFile,
          `${buildScriptsDirectory}*.js`, // Include all build scripts
          testDirectoryPattern
        ],
        lintConfiguration: true // Use .jshintrc file for rules
      }
    },

    // Configuration for file watching and live reloading
    fileChangeMonitor: {
      javascriptFiles: {
        files: ['src/**/*.js', `${buildScriptsDirectory}*.js`],
        tasks: ['codeQualityAssurance', 'scriptOptimizer'], // Run lint and minify on JS changes
        options: {
          spawn: false // Important for performance with watch tasks
        }
      }
    }
  });

  // --- Plugin Loading ---
  buildSystem.log.writeln('Initializing essential build system plugins...');

  // Store plugin names in variables for clarity and potential reuse.
  const uglifyPlugin = 'grunt-contrib-uglify';
  const jshintPlugin = 'grunt-contrib-jshint';
  const watchPlugin = 'grunt-contrib-watch'; // Renamed from 'regarde'

  buildSystem.loadNpmTasks(uglifyPlugin);
  buildSystem.loadNpmTasks(jshintPlugin);
  buildSystem.loadNpmTasks(watchPlugin);

  // --- Custom Task Definitions ---
  buildSystem.log.writeln('Defining project-specific tasks...');

  // Define a simple task for cleaning up build artifacts.
  buildSystem.registerTask('cleanBuildOutput', 'Cleans the distribution directory.', function() {
    buildSystem.log.writeln('Executing build output cleanup...');
    // In a real scenario, this would use 'grunt-contrib-clean' or similar.
    // For this example, it's a placeholder log.
    const done = this.async();
    setTimeout(() => {
      buildSystem.log.ok('Cleanup complete.');
      done();
    }, 500);
  });

  // Task for continuous development workflow (watch and lint).
  const developmentModeTasks = ['fileChangeMonitor', 'codeQualityAssurance'];
  buildSystem.registerTask('devMode', developmentModeTasks);

  // Default task for a full production build.
  const productionBuildTasks = ['cleanBuildOutput', 'scriptOptimizer'];
  buildSystem.registerTask('fullBuild', productionBuildTasks);

  // Alias 'default' Grunt command to 'fullBuild' for convenience.
  buildSystem.registerTask('default', ['fullBuild']);

};