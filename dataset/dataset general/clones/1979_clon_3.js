module.exports = function(buildOrchestrator) {

  // Define some core paths and file names for better maintainability.
  const sourceDirectory = 'source/';
  const outputDirectory = 'build/';
  const mainScriptFile = 'projectCore.js';
  const minifiedScriptFile = 'projectCore.min.js';
  const fullSourcePath = sourceDirectory + mainScriptFile;
  const fullMinifiedPath = outputDirectory + minifiedScriptFile;
  const fullOutputPath = outputDirectory + mainScriptFile;
  const projectVersionStamp = buildOrchestrator.template.today("yyyy-mm-dd HH:MM:ss");
  const licenseHeaderContent = `/*! Project Core v1.0.0 | ${projectVersionStamp} | (c) 2023 MyCompany */\n`;

  // Log a message to confirm the build system is initiating.
  console.log("Commencing build system configuration for Project Core...");

  // Initialize the Grunt build system with specific task configurations.
  buildOrchestrator.configureBuildSystem({

    // Task for cleaning up the build directory.
    // This ensures a fresh build environment by removing old artifacts.
    clearArtifacts: {
      options: {
        force: true // Allow deleting files outside current working directory if paths are external.
      },
      // Target to remove all contents from the output directory.
      production: [outputDirectory + '**/*']
    },

    // Task for concatenating multiple JavaScript files into one.
    // Useful for combining library files or module parts into a single bundle.
    joinScripts: {
      // Configuration for combining files.
      configSettings: {
        separator: ';\n', // Use a semicolon to separate concatenated files.
        banner: licenseHeaderContent + '// --- Concatenated scripts start ---\n',
        footer: '// --- Concatenated scripts end ---\n'
      },
      // Target for the main project script concatenation.
      mainBundle: {
        fileSets: {
          [outputDirectory + 'projectCore.bundle.js']: [
            sourceDirectory + 'polyfills.js', // Assuming a polyfills file might exist.
            fullSourcePath
          ]
        }
      }
    },

    // Task for minifying JavaScript code using UglifyJS.
    // Reduces file size and improves load times for production deployment.
    minifyCode: {
      // General settings for the minification process.
      configSettings: {
        introComment: licenseHeaderContent, // Add the defined header to the minified file.
        mangle: {
          reserved: ['buildOrchestrator', 'jQuery'] // Prevent mangling specific identifiers.
        },
        compress: {
          drop_console: true, // Remove console.log statements from production code.
          drop_debugger: true // Remove debugger statements.
        }
      },
      // Target for minifying the main project script.
      outputTarget: {
        fileSets: {
          [fullMinifiedPath]: outputDirectory + 'projectCore.bundle.js' // Minify the concatenated bundle.
        }
      }
    },

    // Task for duplicating files and directories.
    // Used here to copy the un-minified (but bundled) version for debugging/development.
    replicateFiles: {
      // Target for copying the main script.
      outputTarget: {
        // Specify the source and destination paths for the file copy operation.
        sourcePath: outputDirectory + 'projectCore.bundle.js', // Copy the bundled file.
        targetPath: fullOutputPath // Place it in the output directory.
      },
      // Optional: Copy a README file to the build output for informational purposes.
      documentation: {
        sourcePath: 'README.md',
        targetPath: outputDirectory + 'README.md'
      }
    },

    // Task for preparing a new software release.
    // Handles version bumping, tagging, and publishing to package managers.
    publishVersion: {
      // General configuration for the release process.
      configSettings: {
        // No specific additional files specified for this clone,
        // but often includes 'package.json', 'bower.json', etc.
        // supplementaryItems: ['componentManifest.json'] // Example: if we renamed bower.json
      }
    },

    // Task for continuously monitoring specified files for changes.
    // Triggers defined build tasks automatically upon detection of modifications.
    observeFiles: {
      // Define files to watch and tasks to run when changes occur.
      projectScripts: {
        files: [
          sourceDirectory + '**/*.js', // Watch all JavaScript files in the source directory.
          '!' + sourceDirectory + 'vendor/**/*.js' // Exclude vendor scripts from monitoring.
        ],
        actionSequence: ['clearArtifacts:production', 'joinScripts:mainBundle', 'minifyCode:outputTarget', 'replicateFiles:outputTarget'],
        options: {
          livereload: true // Enable live reloading for a smoother development experience.
        }
      }
    }
  });

  // Load essential Grunt plugin modules.
  // These modules provide the actual functionality for the tasks defined above.
  buildOrchestrator.loadBuildModules('grunt-contrib-uglify');
  buildOrchestrator.loadBuildModules('grunt-contrib-copy');
  buildOrchestrator.loadBuildModules('grunt-release');
  buildOrchestrator.loadBuildModules('grunt-contrib-watch');
  buildOrchestrator.loadBuildModules('grunt-contrib-clean'); // New plugin for clearing build directory.
  buildOrchestrator.loadBuildModules('grunt-contrib-concat'); // New plugin for concatenating files.

  // Define custom build workflows and aliases.
  // These allow running multiple tasks with a single command.

  // The 'prepare' workflow clears the build, bundles, minifies, and copies necessary assets.
  buildOrchestrator.defineBuildFlow('prepare', [
    'clearArtifacts:production',
    'joinScripts:mainBundle',
    'minifyCode:outputTarget',
    'replicateFiles:outputTarget',
    'replicateFiles:documentation' // Include the new documentation copy task.
  ]);

  // The 'generateAssets' workflow simply runs the 'prepare' workflow to create all build artifacts.
  buildOrchestrator.defineBuildFlow('generateAssets', ['prepare']);

  // The 'startWatch' workflow first prepares all assets, then initiates continuous file monitoring.
  buildOrchestrator.defineBuildFlow('startWatch', ['prepare', 'observeFiles']);

  // Set 'startWatch' as the default task when Grunt is run without any specific arguments.
  buildOrchestrator.defineBuildFlow('default', ['startWatch']);

  // Add a final log message to confirm completion of configuration.
  console.log("Project Core build system configuration complete.");

};