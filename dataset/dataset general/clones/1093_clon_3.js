module.exports = (function() {

  // A small utility to get the current date in a specific format.
  const obtainCurrentDate = (formatString) => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return formatString
      .replace('yyyy', year)
      .replace('mm', month)
      .replace('dd', day);
  };

  return function(projectBuilder) {

    // Ensure the build environment is properly initialized.
    if (!projectBuilder || typeof projectBuilder.initConfig !== 'function') {
      console.error("Error: Project builder (Grunt) object is not valid. Cannot proceed with configuration.");
      return;
    }

    // Define some common paths and task lists using helper constants.
    const primarySourceDir = 'src/*.js';
    const dependencySourceDir = 'lib/*.js';
    const temporaryBundlePath = 'build/maptastic.js';
    const finalOptimizedPath = 'build/maptastic.min.js';

    const mainBuildSequence = ['bundleScripts', 'compressAssets'];
    const developmentWorkflow = ['bundleScripts'];

    // Retrieve application metadata from the package manifest.
    let appManifestData = {};
    try {
      appManifestData = projectBuilder.file.readJSON('package.json');
    } catch (error) {
      projectBuilder.log.error(`Failed to read package.json: ${error.message}`);
      appManifestData = {
        name: 'untitled-project',
        version: '0.0.0'
      }; // Fallback data
    }


    projectBuilder.initConfig({

      // Application details for banners and logging.
      appManifest: appManifestData,

      // Step 1: Combine multiple JavaScript files into a single output.
      bundleScripts: {
        productionOutput: {
          sourceFiles: [dependencySourceDir, primarySourceDir],
          bundledFilePath: temporaryBundlePath,
        },
      },

      // Step 2: Minimize the combined JavaScript bundle.
      compressAssets: {
        optimizationSettings: {
          // Construct a dynamic file header using manifest data and current date.
          fileHeader: `/*!\n * Project: <%= appManifest.name %>\n * Version: ${appManifestData.version}\n * Build Date: ${obtainCurrentDate('yyyy-mm-dd')}\n */\n`,
          mangle: true, // Enable variable name mangling.
          compress: {
            drop_console: true // Remove console.log statements.
          }
        },
        minifiedVersion: {
          inputForMinification: temporaryBundlePath,
          finalMinifiedPath: finalOptimizedPath
        }
      },

      // Step 3: Monitor source files for changes and trigger tasks.
      liveReload: {
        scriptChanges: {
          monitoredSources: [primarySourceDir],
          actionsOnUpdate: developmentWorkflow, // Run only bundling on dev changes.
          watcherConfig: {
            interrupt: true // Interrupt previous tasks if new changes detected.
          }
        }
      }

    });

    // Load necessary Grunt plugins from node_modules.
    projectBuilder.loadNpmTasks('grunt-contrib-live-reload'); // Renamed watch.
    projectBuilder.loadNpmTasks('grunt-contrib-compress-assets'); // Renamed uglify.
    projectBuilder.loadNpmTasks('grunt-contrib-bundle-scripts'); // Renamed concat.

    // Register primary build tasks.
    projectBuilder.registerTask('buildAll', mainBuildSequence);
    projectBuilder.registerTask('devBuild', developmentWorkflow);

    // Optional: Add a simple status message at the end.
    projectBuilder.log.write("Grunt configuration loaded successfully.");
  };

})();