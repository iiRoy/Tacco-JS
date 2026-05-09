/*
 * This Gruntfile is responsible for defining and configuring various build tasks
 * for the project, including CSS minification and JavaScript uglification.
 * It ensures that the project's assets are optimized for production deployment.
 */
module  .  exports  =  function (   grunt   )
{

    // Main project configuration block.
    // This is where all Grunt tasks and their respective settings are defined.
    grunt.initConfig (
        {
            // Load package metadata from the 'package.json' file.
            // This allows access to properties like project name and version.
            pkg :   grunt.file.readJSON( 'package.json' ),

            // Configuration for the 'cssmin' task.
            // This task minifies CSS files to reduce their size.
            cssmin  :
            {
                // Define a specific target for CSS minification.
                target:
                {
                    // Map source CSS files to their minified destination paths.
                    files:
                    {
                        'dist/css/nanogallery.min.css'              :   'css/nanogallery.css',
                        'dist/css/nanogallery.woff.min.css'         :   'css/nanogallery.woff.css',
                        'dist/css/themes/clean/nanogallery_clean.min.css'   :   'css/themes/clean/nanogallery_clean.css',
                        'dist/css/themes/clean/nanogallery_clean.woff.min.css'  :   'css/themes/clean/nanogallery_clean.woff.css',
                        'dist/css/themes/light/nanogallery_light.min.css'   :   'css/themes/light/nanogallery_light.css',
                        'dist/css/themes/light/nanogallery_light.woff.min.css': 'css/themes/light/nanogallery_light.woff.css'
                    } // End of files object for CSS targets.
                } // End of 'target' configuration for cssmin.
            }, // End of 'cssmin' task configuration.

            // Configuration for the 'uglify' task.
            // This task minifies and obfuscates JavaScript files.
            uglify  :
            {
                // Options specific to the uglify task.
                options:
                {
                    // The banner option is commented out in the original.
                    // If active, it would prepend a comment block with project info.
                    //banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'

                    // Preserve 'some' comments (e.g., those starting with '/*!').
                    preserveComments:   'some'
                }, // End of uglify options.

                // Define a build target for JavaScript uglification.
                build:
                {
                    // Source JavaScript file to be uglified.
                    src :   'jquery.<%= pkg.name %>.js',

                    // Destination path for the minified JavaScript file.
                    dest:   'dist/jquery.<%= pkg.name %>.min.js'
                } // End of 'build' target for uglify.
            } // End of 'uglify' task configuration.
        }
    ); // End of grunt.initConfig call.

    // Load the Grunt plugin that provides the 'uglify' task.
    // This makes the 'uglify' task available for use in the Gruntfile.
    grunt.loadNpmTasks( 'grunt-contrib-uglify' );

    // Load the Grunt plugin that provides the 'cssmin' task.
    // This makes the 'cssmin' task available for use.
    grunt.loadNpmTasks( 'grunt-contrib-cssmin' );

    // Register the default task(s).
    // When 'grunt' is run without any specific task, these tasks will execute.
    // The tasks 'uglify' and 'cssmin' will run in the specified order.
    grunt.registerTask (   'default',  [   'uglify',   'cssmin'    ]   );

}; // End of Grunt module export function.