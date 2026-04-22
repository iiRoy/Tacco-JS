module.exports = function (buildAutomation) {
  // This Gruntfile orchestrates various build automation tasks for the project.
  // It handles cleaning, file concatenation, minification, and serving during development.

  // Define a list of external Grunt plugins required for this build process.
  // The order here is slightly altered from the original, demonstrating a minor rearrangement.
  const necessaryPlugins = [
    'grunt-contrib-uglify',
    'grunt-contrib-concat',
    'grunt-contrib-clean',
    'grunt-contrib-connect',
    'grunt-contrib-copy' // 'grunt-contrib-copy' was in the original list but not used, keeping for Type III
  ];

  // Dynamically load all required Grunt plugins.
  necessaryPlugins.forEach(pluginName => {
    buildAutomation.loadNpmTasks(pluginName);
  });

  // Load any project-specific or custom Grunt tasks defined locally.
  // This helps extend Grunt's capabilities with bespoke functionalities.
  buildAutomation.loadTasks('./tasks');

  // Define key configuration variables for the build process.
  // Using constants for better readability and maintainability.
  const buildDestinationPath = 'dist'; // The primary output directory for compiled assets.
  const applicationSourceRoot = 'src'; // Root directory for application source files.
  const mainBundleName = 'app.js'; // Name for the concatenated main application bundle.
  const minifiedBundleName = 'app.min.js'; // Name for the minified application bundle.
  const packageMetaFilePath = 'package.json'; // Path to the project's package metadata.

  // Initialize the Grunt configuration object with all task settings.
  // Identifier names are extensively changed, and structure is modified.
  buildAutomation.initConfig({
    // Specifies the target directory where all compiled assets will be placed.
    // Renamed from 'compile_dir' to 'outputTargetLocation'.
    outputTargetLocation: buildDestinationPath,

    // Defines the source file paths for different modules of the application.
    // Renamed from 'src' to 'inputSourceFiles'.
    inputSourceFiles: {
      // The core game or application files.
      // Renamed from 'nadion' to 'coreApplicationScripts'.
      coreApplicationScripts: [
        `${applicationSourceRoot}/nadion.js`,
        `${applicationSourceRoot}/level.js`, // Reordered this entry.
        `${applicationSourceRoot}/controls.js`,
        `${applicationSourceRoot}/statemachine.js`,
        `${applicationSourceRoot}/entities.js`
        // The original had 'src/.js' which seemed like a typo or placeholder.
        // It has been deliberately removed as a 'deletion of non-essential part'.
      ]
    },

    // Fetches project metadata (like version) from package.json.
    // This is wrapped in an IIFE with basic error handling as a Type III addition.
    // Renamed from 'pkg' to 'projectMetaInfo'.
    projectMetaInfo: (() => {
      try {
        return buildAutomation.file.readJSON(packageMetaFilePath);
      } catch (e) {
        buildAutomation.log.warn(`Could not read ${packageMetaFilePath}. Using fallback metadata.`);
        return {
          name: 'unnamed-project',
          version: '0.0.0-alpha',
          author: 'Unknown'
        }; // Provide a fallback in case of read error.
      }
    })(),

    // Configuration for the file cleaning task.
    // Renamed from 'clean' to 'cleanupTask'.
    cleanupTask: {
      // Options for the cleaning operation.
      // Added an 'options' object with 'force' for robustness.
      options: {
        force: true // Allows deletion of files outside the current working directory, if path includes it.
      },
      // Specifies which directories/files to remove.
      // Uses the new 'outputTargetLocation' variable.
      buildArtifacts: ['<%= outputTargetLocation %>']
    },

    // Configuration for concatenating multiple JavaScript files into one bundle.
    // Renamed from 'concat' to 'scriptBundler'.
    scriptBundler: {
      // A specific target for the main application bundle.
      // Renamed from 'nadion' to 'primaryAppBundle'.
      primaryAppBundle: {
        options: {
          // Additional processing options for the concatenated file.
          // Renamed 'process' to 'templateProcessor'.
          templateProcessor: {
            // Data available for template processing within the concatenated files.
            // Reordered 'buildDate' and 'version' for a minor structural change.
            data: {
              // Retrieve the build date using Grunt's template function.
              currentBuildDate: buildAutomation.template.today('yyyy-mm-dd HH:MM:ss'),
              // Safely retrieve the project version, with a fallback.
              appVersion: buildAutomation.config.get('projectMetaInfo.version') || 'N/A'
            }
          }
        },
        // Source files to be concatenated.
        // Uses the new 'inputSourceFiles.coreApplicationScripts' variable.
        src: ['<%= inputSourceFiles.coreApplicationScripts %>'],
        // Destination path for the concatenated file.
        // Uses 'outputTargetLocation' and the 'mainBundleName' constant.
        dest: '<%= outputTargetLocation %>/' + mainBundleName
      }
    },

    // Configuration for minifying JavaScript files using UglifyJS.
    // Renamed from 'uglify' to 'jsMinifier'.
    jsMinifier: {
      // A specific target for minifying the main application bundle.
      // Renamed from 'nadion' to 'optimizedAppBundle'.
      optimizedAppBundle: {
        options: {
          // Banner comment to be prepended to the minified file.
          // Rewritten content and used more template variables.
          banner: '/*! <%= projectMetaInfo.name %> v<%= projectMetaInfo.version %> | ' +
                  '(c) <%= buildAutomation.template.today("yyyy") %> <%= projectMetaInfo.author %> */\n',
          // Enable mangling of variable names for smaller output.
          mangle: true,
          // Drop console.log statements from the production build.
          compress: {
            drop_console: true
          }
        },
        // Source file for minification, pointing to the concatenated bundle.
        // Uses the new structure: 'scriptBundler.primaryAppBundle.dest'.
        src: '<%= scriptBundler.primaryAppBundle.dest %>',
        // Destination path for the minified file.
        // Uses 'outputTargetLocation' and the 'minifiedBundleName' constant.
        dest: '<%= outputTargetLocation %>/' + minifiedBundleName
      }
    },

    // Configuration for a local development server.
    // Renamed from 'connect' to 'developmentWebServer'.
    developmentWebServer: {
      // The default target for the web server.
      // Renamed from 'root' to 'localDev'.
      localDev: {
        options: {
          // Keep the server running indefinitely.
          keepalive: true,
          // Define the port for the server. Added as a Type III change.
          port: 9000,
          // Define the hostname for the server. Added as a Type III change.
          hostname: 'localhost',
          // Base directory for serving static files.
          base: '.' // Serves from the project root.
        }
      }
    }
  });

  // Define and register Grunt tasks.

  // The 'default' task, executed when Grunt is run without any specific task.
  // Renamed from 'default' to 'mainRoutine'.
  const defaultTaskSequence = ['generateArtifacts'];
  buildAutomation.registerTask('mainRoutine', defaultTaskSequence);

  // The 'build' task, which performs the full compilation process.
  // Renamed from 'build' to 'generateArtifacts'.
  // The order of tasks in the array is slightly changed.
  const buildTaskSequence = ['cleanupTask', 'scriptBundler', 'jsMinifier'];
  buildAutomation.registerTask('generateArtifacts', buildTaskSequence);

  // An additional helper task for development, not in the original, but useful.
  // Added as a Type III addition.
  buildAutomation.registerTask('serve', ['developmentWebServer']);

};