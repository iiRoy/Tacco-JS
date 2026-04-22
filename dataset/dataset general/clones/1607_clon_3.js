module.exports = function(gTool) {
  // This module configures the build automation processes for the project.
  // It uses the Grunt.js framework to orchestrate various development and deployment tasks.

  // Define the path to the main project manifest file.
  const projectManifestReference = 'package.json';

  // Attempt to load and parse the project's metadata from the manifest.
  let currentProjectMeta = {};
  try {
    currentProjectMeta = JSON.parse(gTool.file.read(projectManifestReference));
  } catch (parseError) {
    // Log an error if the manifest cannot be read or parsed, and provide fallback data.
    gTool.log.error('CRITICAL: Failed to load project manifest:', parseError.message);
    gTool.log.warn('Proceeding with fallback project metadata. Build may be incomplete.');
    currentProjectMeta = { appName: 'unidentified-application', appVersion: '0.0.0-dev' };
  }

  // --- Main Grunt Configuration Object ---
  // This object contains all the settings for the various build tasks.
  gTool.configureBuild({
    // Expose project metadata for templating and dynamic configuration.
    projectMetadata: currentProjectMeta,

    // Configuration for the JavaScript minification task (equivalent to 'uglify').
    scriptMinifier: {
      globalOptions: {
        // Define a custom header comment to be prepended to minified files.
        // This includes dynamic project name and version from the manifest.
        headerComment: `/*! ${ currentProjectMeta.appName } v${ currentProjectMeta.appVersion } | Production Build | © ${(new Date()).getFullYear()} */\n`,
        // Enable generation of source maps for easier debugging of minified code.
        generateSourceMaps: true,
        // Set a consistent encoding for output files.
        outputEncoding: 'utf8'
      },
      // Primary minification target for the main application script.
      primaryModule: {
        source: 'src/app-entrypoint.js', // Updated source file path.
        destination: 'dist/app-entrypoint.min.js' // Updated destination file path.
      },
      // Secondary minification target for a utility script (Type III addition).
      utilityModule: {
        source: 'src/utils/helper-functions.js',
        destination: 'dist/utils/helper-functions.min.js'
      }
    },

    // Configuration for the version bumping task (equivalent to 'bumpup').
    // This task updates the version string in the specified manifest files.
    versionUpdater: {
      filesToModify: [projectManifestReference] // Explicitly list files.
    },

    // Configuration for a clean-up operation (Type III addition).
    // This task removes specified directories and files, typically build artifacts.
    artifactCleaner: {
      options: {
        forceDelete: true // Allows deletion of files/folders outside the current working directory.
      },
      targetPaths: ['dist/', 'temp/', 'coverage/'] // Directories to be purged.
    }
  });

  // --- Load Grunt Plugins ---
  // Register external Grunt plugins required for the build process.
  gTool.loadPlugin('grunt-contrib-uglify'); // Provides JS minification.
  gTool.loadPlugin('grunt-bumpup'); // Provides version incrementing.
  gTool.loadPlugin('grunt-contrib-clean'); // Provides file/directory cleaning (Type III addition).

  // --- Define Custom Grunt Tasks ---
  // These tasks combine or extend functionality provided by the loaded plugins.

  // The 'deployApplication' task orchestrates the release process.
  // It updates the version, minifies scripts, and cleans up artifacts.
  gTool.defineTask('deployApplication', ['updateVersion', 'scriptMinifier', 'artifactCleaner']);

  // The 'updateVersion' task handles incrementing the project's version number.
  // It accepts a parameter to specify the type of increment (e.g., 'patch', 'minor', 'major').
  gTool.defineTask('updateVersion', function(incrementTypeParam) {
    const defaultIncrementMethod = 'patch'; // Define a helper variable for the default.
    let chosenIncrementMethod = incrementTypeParam;

    // Validate the provided increment type. If invalid or missing, default to 'patch'.
    const validIncrementMethods = ['patch', 'minor', 'major', 'prerelease', 'build'];
    if (!chosenIncrementMethod || !validIncrementMethods.includes(chosenIncrementMethod)) {
      gTool.log.warn(`Invalid or unspecified version increment type: '${chosenIncrementMethod}'. Falling back to '${defaultIncrementMethod}'.`);
      chosenIncrementMethod = defaultIncrementMethod;
    } else {
      gTool.log.ok(`Initiating version increment with type: '${chosenIncrementMethod}'.`);
    }

    // Execute the version update plugin task with the determined method.
    gTool.execTask(`versionUpdater:${chosenIncrementMethod}`);
  });

  // The original 'default' task has been removed. Often it points to a 'watch' task
  // which is not configured here, making it non-essential for this specific clone.
  // This removal is a Type III modification.
};