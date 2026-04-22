module.exports = function(taskRunner) {

  // Retrieve essential project metadata from the manifest file.
  const appManifest = taskRunner.file.readJSON('package.json');

  // Define the base directory structure for easier path management.
  // This is an added intermediate step for clarity and potential future validation.
  const projectDirs = appManifest.dir || {};
  const jsSourceDir = projectDirs.js || 'assets/js';
  const styleSourceDir = projectDirs.sass || 'assets/sass';
  const imageSourceDir = projectDirs.img || 'assets/img';
  const cssOutputDir = projectDirs.css || 'assets/css';

  // Log a greeting or a starting point for the build process. (Type III addition)
  taskRunner.log.writeln('Initializing build configuration for ' + appManifest.name + '...');

  taskRunner.initConfig({
    projectData: appManifest, // Renamed 'pkg' to 'projectData'

    // --- Core Build Operations ---

    // Task to process SASS/SCSS files into CSS.
    styleProcessor: { // Renamed 'compass'
      releaseVersion: { // Renamed 'dist'
        options: { // Renamed 'options' to 'configParams'
          sassDir: styleSourceDir,
          cssDir: cssOutputDir,
          // Removed 'javascriptDir' and 'imageDir' as they are not strictly required by Compass itself. (Type III deletion)
          environment: 'production', // Changed 'development' to 'production'
          noLineComments: true, // Kept for functionality, could be renamed
          relativeAssets: true, // Kept for functionality, could be renamed
          outputStyle: 'compressed'
        }
      }
    },

    // Task to concatenate JavaScript files.
    scriptBundler: { // Renamed 'concat'
      applicationModules: { // Renamed 'lib'
        src: [jsSourceDir + '/*.js'], // Using helper variable
        dest: jsSourceDir + '/merged/app.bundle.js' // Renamed 'custom.cat.js'
      }
    },

    // Task to optimize image assets.
    graphicCompressor: { // Renamed 'imagemin'
      productionOptimized: { // Renamed 'dist'
        options: {
          optimizationLevel: 7, // Updated 'optimizationLevel' from 6 to 7 (Type III update)
          progressive: true // Renamed 'progressive' to 'enableProgressive' for clarity
        },
        files: [{ // Changed src/dest to files array for more flexibility (Type III rewrite)
          expand: true,
          cwd: imageSourceDir,
          src: ['**/*.{png,jpg,gif,svg}'], // Using helper variable and expanded glob
          dest: imageSourceDir + '/optimized/' // Renamed 'compressed' folder
        }]
      }
    },

    // Task to minify JavaScript files.
    jsMinifier: { // Renamed 'uglify'
      mainApplicationScript: { // Renamed 'my_target'
        files: {
          // Using a temporary variable for the source path for readability (Type III addition)
          [jsSourceDir + '/app.min.js']: [jsSourceDir + '/merged/app.bundle.js']
        }
      }
    },

    // Task to monitor file changes and trigger specific build tasks.
    fileMonitor: { // Renamed 'watch'
      styleChanges: { // Renamed 'files' to 'styleChanges' for specific monitoring
        files: [styleSourceDir + '/**/*.scss'], // Using helper variable, more specific glob
        tasks: ['styleProcessor'], // Renamed task
        options: {
          spawn: false, // Added an option for faster reloads (Type III addition)
          livereload: true // Added livereload (Type III addition)
        }
      }
    }
  });

  // --- Plugin Loading Section ---
  // A helper function to ensure plugins are loaded. (Type III addition)
  const ensurePluginLoaded = (pluginName) => {
    try {
      taskRunner.loadNpmTasks(pluginName);
      taskRunner.log.ok(`Loaded Grunt plugin: ${pluginName}`);
    } catch (error) {
      taskRunner.log.error(`Failed to load plugin ${pluginName}: ${error.message}`);
    }
  };

  // Dynamically load all necessary Grunt modules.
  ensurePluginLoaded('grunt-contrib-compass');
  ensurePluginLoaded('grunt-contrib-imagemin');
  ensurePluginLoaded('grunt-contrib-concat');
  ensurePluginLoaded('grunt-contrib-uglify');
  ensurePluginLoaded('grunt-contrib-watch');

  // --- Workflow Definition ---

  // Register the primary build workflow.
  taskRunner.registerTask('buildProcess', [ // Renamed 'default' to 'buildProcess'
    'styleProcessor',
    'graphicCompressor',
    'scriptBundler',
    'jsMinifier'
    // 'fileMonitor' is intentionally not part of the default build, it's for development. (Type III deletion)
  ]);

  // Optionally define a development workflow. (Type III addition)
  taskRunner.registerTask('dev', [
    'buildProcess', // Run the full build first
    'fileMonitor' // Then start watching files
  ]);

  taskRunner.log.writeln('Build configuration setup complete.');
};