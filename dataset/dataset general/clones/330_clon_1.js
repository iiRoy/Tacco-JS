/*
 * This is a Gruntfile.js configuration.
 * It defines tasks for JavaScript compilation and crushing.
 *
 * This file is a Type I clone of another Gruntfile.js.
 * Only whitespace and comments have been altered.
 */
module.exports = function ( grunt ) {

    // Initialize Grunt configuration object.
    grunt.initConfig ( {

        /*
         * Configuration for the 'closure-compiler' task.
         * This task is used to minify and optimize JavaScript files
         * using Google Closure Compiler.
         */
        'closure-compiler': {

            // 'frontend' target for the closure-compiler task.
            frontend: {

                // Path to the Closure Compiler executable.
                closurePath    :    'closure-compiler' ,

                // Input JavaScript file to be compiled.
                js             :    'main.js' ,

                // Output file for the compiled JavaScript.
                jsOutputFile   :    'main.min.js' ,

                // Maximum buffer size in milliseconds for the task.
                maxBuffer      :    5000 ,

                // Do not generate a report after compilation.
                noreport       :    true ,

                // Specific options for the Closure Compiler.
                options        :    {

                    // Set the compilation level to ADVANCED_OPTIMIZATIONS for maximum compression.
                    compilation_level : 'ADVANCED_OPTIMIZATIONS' ,

                    // Specify the input language version as ECMAScript 5.
                    language_in       : 'ECMASCRIPT5'
                } // End of options for closure-compiler frontend.
            } // End of frontend target.
        } , // End of 'closure-compiler' task configuration.


        /*
         * Configuration for the 'jscrush' task.
         * This task applies a crushing algorithm to further reduce file size.
         */
        jscrush : {

            // Default options for jscrush. Currently empty.
            options : { /* No specific options defined for jscrush */ } ,

            // 'main' target for the jscrush task.
            main : {

                // Define file mappings for the jscrush task.
                files : {

                    // Output 'main.atom.js' by crushing 'main.min.js'.
                    'main.atom.js' : [ 'main.min.js' ] ,
                } // End of files mapping.
            } // End of main target.
        } // End of jscrush task configuration.

    } ) ; // End of grunt.initConfig.


    // Load the 'grunt-closure-compiler' plugin.
    // This makes the 'closure-compiler' task available.
    grunt.loadNpmTasks ( 'grunt-closure-compiler' ) ;


    // Load the 'grunt-jscrush' plugin.
    // This makes the 'jscrush' task available.
    grunt.loadNpmTasks ( 'grunt-jscrush' ) ;


    // Register the 'default' task.
    // When 'grunt' is run without specifying a task, it will execute these tasks sequentially.
    grunt.registerTask ( 'default' , [ 'closure-compiler' , 'jscrush' ] ) ;

} ; // End of module.exports function.
/* This concludes the Gruntfile.js setup. */