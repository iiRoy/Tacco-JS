// This file defines the Grunt configuration for the project.
// It sets up various tasks for build processes, including minification and version management.

module.exports = function ( grunt ) {

    // Initialize the Grunt configuration object with project settings.
    grunt.initConfig( {
        // Read the package.json file to access project metadata.
        pkg: grunt.file.readJSON( 'package.json' ),

        // Configuration for the 'uglify' task, which minifies JavaScript files.
        uglify: {
            options: {
                // Add a banner comment to the top of the minified file, including package name and version.
                banner: '/*! <%= pkg.name %> <%= pkg.version %> */\n'
            },
            build: {
                // Specify the source JavaScript file to be minified.
                src: 'lib/device.js',
                // Specify the destination path for the minified JavaScript file.
                dest: 'lib/device.min.js'
            }
        },

        // Configuration for the 'bumpup' task, used to update package version numbers.
        bumpup: 'package.json'
    } );

    // Load the 'grunt-contrib-uglify' plugin, which provides the 'uglify' task.
    grunt.loadNpmTasks( 'grunt-contrib-uglify' );
    // Load the 'grunt-bumpup' plugin, which provides the 'bumpup' task.
    grunt.loadNpmTasks( 'grunt-bumpup' );

    // Register custom Grunt tasks for easier command-line usage.

    // The 'default' task runs the 'watch' task.
    grunt.registerTask( 'default', [ 'watch' ] );

    // The 'release' task first bumps the version, then minifies the code.
    grunt.registerTask( 'release', [ 'bump', 'uglify' ] );

    // The 'bump' task is a custom task to handle version bumping.
    grunt.registerTask( 'bump', function ( type ) {
        // Determine the type of bump (e.g., 'patch', 'minor', 'major').
        // If no type is provided, default to 'patch'.
        type = type ? type : 'patch';
        // Run the 'bumpup' task with the determined type.
        grunt.task.run( "bumpup:" + type );
    } );

}; // End of module.exports function.