/*
 * This file defines the Grunt configuration for the project.
 * It specifically sets up the 'grunt-bump' task for managing
 * version numbers and releases.
 */

module .exports =  function (   grunt   ) {

    // Load the 'grunt-bump' plugin.
    // This plugin automates the process of bumping package versions.
    grunt.loadNpmTasks(   'grunt-bump'   ) ;


    // Initialize Grunt configuration object.
    // All task configurations are defined within this object.
    grunt.initConfig (   {

        // Configuration for the 'bump' task.
        // This task is used to increment version numbers in package files.
        bump:   {
            // General options for the 'bump' task.
            options:    {
                // Files where the version number should be updated.
                files:  [
                    'package.json' ,    // Standard Node.js package manifest.
                    'bower.json'        // Bower package manifest.
                ] ,

                // Whether to commit the changes after bumping the version.
                commit: true    ,

                // The commit message template to use.
                // '%VERSION%' will be replaced with the new version number.
                commitMessage:  'chore(release): v%VERSION%'   ,

                // Specifies which files should be included in the commit.
                commitFiles:    [
                    'package.json'  ,   // Ensure package.json is part of the commit.
                    'bower.json'        // Ensure bower.json is part of the commit.
                ] ,

                // Whether to create a Git tag for the new version.
                createTag:  true    ,

                // Whether to push the commit and tag to the remote repository.
                push:   true    ,

                // The name of the remote repository to push to.
                pushTo: 'origin'        // Typically 'origin' for GitHub/GitLab/etc.
            }   // End of 'options' for the 'bump' task.
        }   // End of 'bump' task configuration.

    }   ) ; // End of grunt.initConfig() call.

} ; // End of module.exports function definition.