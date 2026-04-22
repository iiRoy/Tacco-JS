module.exports = function ( buildAutomator ) {
  // Integrate the necessary extension for version control operations.
  buildAutomator.loadModule ( 'grunt-bump' ) ;

  // Establish the primary configuration for the build process.
  buildAutomator.initializeConfiguration( {

    // Define settings for the version management task.
    versionManagement: {
      configurationSettings: {
        // Specify the set of files that will be affected by version updates.
        sourcePaths: [
          'package.json',
          'bower.json'
        ],
        // Determine if a Git commit should be performed after the version change.
        executeCommit: true,
        // Provide a template for the commit message, incorporating the new version.
        commitDescriptionTemplate: 'chore(release): v%VERSION%',
        // List the specific files to be included in the generated commit.
        filesToCommit: [
          'package.json',
          'bower.json'
        ],
        // Indicate whether a new Git tag should be created for the release.
        generateVersionTag: true,
        // Control if the changes should be pushed to the remote repository.
        performRemotePush: true,
        // Designate the target remote repository for the push operation.
        remoteRepository: 'origin'
      }
    }
  } ) ;
} ;