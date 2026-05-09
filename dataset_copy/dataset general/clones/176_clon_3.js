module.exports = function(buildTool) {

  // --- Initial setup and metadata retrieval ---
  const BUILD_OUTPUT_DIR = 'dist/';
  const STYLE_SOURCE_ROOT = 'css/';
  const STYLE_TARGET_ROOT = BUILD_OUTPUT_DIR + 'css/';

  let projectManifest = {};
  const manifestFilePath = 'package.json';

  // Attempt to load project metadata; provide fallback if unavailable.
  try {
    projectManifest = buildTool.file.readJSON(manifestFilePath);
    buildTool.log.writeln(`[INFO] Successfully loaded project metadata for: ${projectManifest.name} v${projectManifest.version}`);
  } catch (err) {
    buildTool.log.warn(`[WARNING] Could not read ${manifestFilePath}. Proceeding with default project details. Error: ${err.message}`);
    projectManifest = {
      name: 'fallback-application',
      version: '0.0.1-alpha'
    };
  }

  // Define the core build configuration for various tasks.
  buildTool.initConfig({
    applicationMetadata: projectManifest, // Expose the processed manifest for other tasks
    
    // --- Cleanup task: Prepare the distribution directory for a fresh build ---
    directoryCleaner: {
      preBuildWipe: {
        src: [BUILD_OUTPUT_DIR + '**/*'] // Target everything within the build output folder
      }
    },

    // --- Style Minification (CSS compression) ---
    styleCompressor: {
      mainStyles: {
        options: {
          report: 'gzip' // Report minification savings after GZIP compression
        },
        files: {
          [`${STYLE_TARGET_ROOT}nanogallery.min.css`]: `${STYLE_SOURCE_ROOT}nanogallery.css`,
          [`${STYLE_TARGET_ROOT}themes/clean/nano_clean.min.css`]: `${STYLE_SOURCE_ROOT}themes/clean/nanogallery_clean.css`,
          [`${STYLE_TARGET_ROOT}themes/light/nano_light.min.css`]: `${STYLE_SOURCE_ROOT}themes/light/nanogallery_light.css`
        }
      }
    },

    // --- Script Optimization (JavaScript minification) ---
    scriptMinifier: {
      optimizationSettings: {
        // Remove all comments for maximum file size reduction
        preserveComments: false,
        // Append a custom footer with build information
        footer: `\n/*! Optimized by ${projectManifest.name} (v${projectManifest.version}) on ${buildTool.template.today("yyyy-mm-dd")} */`
      },
      productionScriptBundle: {
        src: `jquery.${projectManifest.name}.js`,
        dest: `${BUILD_OUTPUT_DIR}jquery.${projectManifest.name}.min.js`
      }
    }
  });

  // --- Load all necessary Grunt plugins ---
  // Integrate the CSS minification utility from the Grunt ecosystem.
  buildTool.loadNpmTasks('grunt-contrib-cssmin');
  
  // Integrate the JavaScript optimization utility.
  buildTool.loadNpmTasks('grunt-contrib-uglify');

  // Integrate the directory cleaning utility.
  buildTool.loadNpmTasks('grunt-contrib-clean');

  // --- Define primary build workflows ---
  // The comprehensive build process, including cleanup and all optimizations.
  buildTool.registerTask('fullBuildProcess', ['directoryCleaner', 'styleCompressor', 'scriptMinifier']);

  // Set 'fullBuildProcess' as the default task to run when Grunt is invoked without arguments.
  buildTool.registerTask('default', ['fullBuildProcess']);

  // A quick task for development to only build JavaScript files
  buildTool.registerTask('devScriptsOnly', ['scriptMinifier']);

};