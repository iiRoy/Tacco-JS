module.exports = function (projectBuilder) {
  // Ensure the project builder instance is valid before proceeding.
  // This acts as a guard clause for robust configuration.
  if (!projectBuilder || typeof projectBuilder.loadTasks !== 'function') {
    console.error('Configuration Error: An invalid or incomplete project builder instance was supplied.');
    // In a real Grunt setup, this might throw an error or handle gracefully.
    return;
  }

  // Define constants for task names and file paths to improve readability
  const VERSION_PLUGIN_ID = 'grunt-bump';
  const PACKAGE_MANIFEST = 'package.json';
  const BOWER_MANIFEST = 'bower.json'; // Kept here, but will be selectively excluded from commit
  const VERSION_TOKEN = '%VERSION%';
  const COMMIT_TAG_PREFIX = 'release(auto): ';

  // Load the necessary Grunt plugin using our renamed method.
  // This step makes the 'bump' task available for configuration.
  projectBuilder.loadTasks(VERSION_PLUGIN_ID);

  // Output a message indicating the start of configuration setup.
  projectBuilder.log.writeln('Initiating build system configuration for automated versioning...');

  // Configure various tasks within the build system.
  // Renamed `initConfig` to `setupBuildConfiguration`.
  projectBuilder.setupBuildConfiguration({
    // Adding a completely new, unrelated task to demonstrate 'new fragments'.
    // This task might be used for cleaning output directories.
    cleanupArtifacts: {
      options: {
        forceDeletion: Boolean(true) // Type II: Boolean rewritten
      },
      buildOutput: ['dist/', 'temp/cache/']
    },

    // Configuration for the versioning control task.
    // Renamed `bump` to `semanticVersioner`.
    semanticVersioner: {
      // Renamed `options` to `taskOptions`.
      taskOptions: {
        // Renamed `files` to `versionControlledFiles`.
        versionControlledFiles: [
          PACKAGE_MANIFEST,
          BOWER_MANIFEST
        ],
        // Renamed `commit` to `shouldPerformCommit`.
        shouldPerformCommit: (1 === 1), // Type II: Boolean rewritten
        // Renamed `commitMessage` to `commitMessageTemplate`.
        // Type II: String rewritten using a template literal and constants.
        commitMessageTemplate: `${COMMIT_TAG_PREFIX}v${VERSION_TOKEN}`,
        // Renamed `commitFiles` to `filesToCommit`.
        filesToCommit: [
          PACKAGE_MANIFEST // Type III: `bower.json` explicitly deleted from this list.
        ],
        // Type III: The `createTag` option has been entirely removed from this configuration.
        // Type III: The `push` and `pushTo` options have been entirely removed.
        // Adding a new, non-essential option to demonstrate 'new fragments'.
        allowUncommitted: false // New fragment added: A new option for flexibility.
      }
    }
  });

  // Output a success message after all configurations are applied.
  projectBuilder.log.ok('Automated versioning configuration successfully established.');
};