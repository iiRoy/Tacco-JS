/*
 * Gruntfile.js - Grunt Task Configuration for Project Build
 * This file defines the various tasks Grunt will perform,
 * such as compiling SASS, concatenating JavaScript, optimizing images,
 * minifying code, and watching for file changes.
 *
 * All configurations are defined within the grunt.initConfig() function.
 */
module.exports = function (  grunt  )  {


    // Initialize Grunt configuration object.
    // This object contains all the task configurations for the project.
    grunt.initConfig ( {

        // Read the package.json file to access project metadata
        // and custom properties like directory paths (pkg.dir).
        pkg : grunt.file.readJSON ( 'package.json' ),


        /*
         * Define and configure individual Grunt tasks.
         * Each property here corresponds to a Grunt plugin/task.
         */

        // Task: compass
        // Compiles Sass files into CSS using the Compass preprocessor.
        compass : {
            dist : { // This is a specific target for the compass task, named 'dist'.
                options : { // Options for the 'dist' target of the compass task.
                    sassDir        : '<%= pkg.dir.sass %>',       // Specifies the input directory for Sass source files.
                    cssDir         : '<%= pkg.dir.css %>',        // Specifies the output directory for compiled CSS files.
                    javascriptDir  : '<%= pkg.dir.js %>',         // Directory where JavaScript files are located (for Compass).
                    imageDir       : '<%= pkg.dir.img %>',        // Directory where image assets are located (for Compass).
                    environment    : 'development',                // Sets the Compass environment (e.g., 'production', 'development').
                    noLineComments : true,                         // Disables line comments in the output CSS.
                    relativeAssets : true,                         // Uses relative paths for assets in the generated CSS.
                    outputStyle    : 'compressed'                  // Sets the output style for CSS (e.g., 'expanded', 'compressed').
                }
            }
        },


        // Task: concat
        // Concatenates multiple JavaScript files into a single file.
        concat : {
            lib : { // This is a specific target for the concat task, named 'lib'.
                src  : [ '<%= pkg.dir.js %>/*.js' ], // Specifies the source JavaScript files to be concatenated.
                dest : '<%= pkg.dir.js %>/concat/custom.cat.js'  // Specifies the destination path for the concatenated file.
            }
        },


        // Task: imagemin
        // Optimizes image files (PNG, JPEG, GIF) to reduce their size.
        imagemin : {
            dist : { // This is a specific target for the imagemin task, named 'dist'.
                options : { // Options for the 'dist' target of the imagemin task.
                    optimizationLevel : 6,   // Sets the optimization level for PNG files (0-7).
                    progressive       : true // Enables progressive rendering for JPEG files.
                },
                src  : [ '<%= pkg.dir.img %>/*' ], // Specifies the source image files to be optimized.
                dest : '<%= pkg.dir.img %>/compressed' // Specifies the destination directory for the optimized images.
            }
        },


        // Task: uglify
        // Minifies JavaScript files to reduce their size and obfuscate code.
        uglify : {
            my_target : { // This is a specific target for the uglify task, named 'my_target'.
                files : { // Defines the mapping of output files to input files.
                    // Output file path : [ Input file path(s) ]
                    '<%= pkg.dir.js %>/custom.min.js' : [ '<%= pkg.dir.js %>/concat/custom.cat.js' ]
                }
            }
        },


        // Task: watch
        // Monitors specified files for changes and automatically runs tasks when changes are detected.
        watch : {
            files : [ '<%= pkg.dir.sass %>/*.scss' ], // Specifies the files to watch (all .scss files in the sass directory).
            tasks : [ 'compass' ]                     // Specifies the tasks to run when changes are detected (run the 'compass' task).
        }

    } );


    /*
     * Load Grunt plugins.
     * These lines load the necessary npm packages that provide the tasks defined above.
     * Each plugin typically provides one or more tasks (e.g., 'grunt-contrib-compass' provides the 'compass' task).
     */
    grunt.loadNpmTasks ( 'grunt-contrib-compass' );

    grunt.loadNpmTasks ( 'grunt-contrib-imagemin' );

    grunt.loadNpmTasks ( 'grunt-contrib-concat' );

    grunt.loadNpmTasks ( 'grunt-contrib-uglify' );

    grunt.loadNpmTasks ( 'grunt-contrib-watch' );


    /*
     * Register default Grunt tasks.
     * When you run `grunt` from the command line without specifying a task,
     * it will execute all tasks listed in this array in the given order.
     */
    grunt.registerTask ( 'default', [ 'compass', 'imagemin', 'concat', 'uglify' ] );

};