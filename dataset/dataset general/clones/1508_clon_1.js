module.exports = function (  grunt   ) {
/*
 * This is the main Gruntfile for project configuration.
 * It defines various tasks for building and managing the project.
 */

    // Project configuration settings go here.
    grunt.initConfig (   {

        // Package.json file is read to get project metadata.
        pkg   :  grunt.file.readJSON (   'package.json'   ) ,

        // Define the main build directory path.
        build :   'build/' ,


        // The 'clean' task is used to delete files and folders.
        clean   : {

            // Sub-task to clean the primary build directory.
            build : {
                src   : [   '<%= build %>'   ]
            }
            , // Separator for sub-tasks

            // Sub-task to clean the LESS-related build directory.
            less  : {
                src : [   '<%= build %>less'   ]
            }

        }
        , // End of clean task.


        // The 'copy' task handles file and directory copying.
        copy  :   {

            // Development copy task.
            dev   : {
                cwd     :   'src/'    , // Source directory for copying.
                src     :   '**'      , // All files and subdirectories.
                dest    :   '<%= build %>'   , // Destination build directory.
                expand  :   true        // Enable dynamic expansion of src.
            }

        }
        , // End of copy task.


        // The 'less' task compiles LESS files into CSS.
        less  : {

            // Main LESS compilation task.
            main  : {
                files : {
                    '<%= build %>style.css'   :   '<%= build %>less/style.less' // Output CSS and input LESS.
                }
            }

        }
        , // End of less task.


        // The 'uglify' task minifies JavaScript files.
        uglify  : {

            // Main uglify task.
            main  : {
                files : {
                    '<%= build %>plugin.js' :   [   '<%= build %>/**/*.js'   ] // Output minified JS and input JS files.
                }
            }

        }
        , // End of uglify task.


        // The 'watch' task monitors files for changes and runs tasks.
        watch   : {

            // Main watch task.
            main  : {
                files :   'src/**'  , // Files to watch for changes.
                tasks :   [   'dev'   ] // Tasks to run when changes are detected.
            }

        } // End of watch task.

    }   ) ; // End of grunt.initConfig call.

    /*
     * Load various Grunt plugins needed for this project.
     */
    grunt.loadNpmTasks  (   'grunt-contrib-clean'   ) ;
    grunt.loadNpmTasks  (   'grunt-contrib-copy'    ) ;
    grunt.loadNpmTasks  (   'grunt-contrib-less'    ) ;
    grunt.loadNpmTasks  (   'grunt-contrib-watch'   ) ;
    grunt.loadNpmTasks  (   'grunt-contrib-uglify'  ) ;


    /*
     * Register custom Grunt tasks.
     */

    // 'dev' task: Prepares the development environment.
    grunt.registerTask (   'dev' ,   [   'clean:build' ,   'copy:dev' ,   'less' ,   'clean:less'   ]   ) ;

    // 'prod' task: Builds for production, including minification.
    grunt.registerTask (   'prod' ,   [   'dev' ,   'uglify'   ]   ) ;

    // 'default' task: The task that runs when 'grunt' is called without arguments.
    grunt.registerTask (   'default' ,   [   'prod'   ]   ) ;

} ; // End of module.exports function.