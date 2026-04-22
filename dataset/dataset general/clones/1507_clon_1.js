/*
 * This is a Gruntfile configuration.
 * It sets up various tasks for project automation.
 */
module.exports = function ( grunt ) {


    // Grunt configuration object initialization
    grunt.initConfig ( {


        // Package.json details are read here for project metadata
        pkg : grunt.file.readJSON ( "package.json" ) ,


        /*
         * JSHint task configuration.
         * This lints JavaScript files for potential errors and style issues.
         */
        jshint : {

            // JSHint options
            options : {
                reporter : require ( "jshint-stylish" ) ,

                // Global variables allowed in the JavaScript code
                globals : {
                    console : true ,
                    $       : true ,
                    jQuery  : true ,
                } // end of globals object
            } , // end of options object

            // Target files for JSHint to process
            target : [ "src/squishy.js" ]
        } , // end of jshint task


        /**
         * Uglify task configuration.
         * This task minifies JavaScript files.
         */
        uglify : {
            // Build target for minification
            build : {
                src  : "src/squishy.js" ,
                dest : "dist/squishy.min.js"
            } // end of build target
        } , // end of uglify task


        // Shell commands execution task
        shell : {
            // Copy main script to distribution directory
            copyMain : {
                command : 'cp src/squishy.js dist/squishy.js'
            } // end of copyMain target
        } , // end of shell task


        /*
         * Watch task configuration.
         * Monitors files for changes and runs specified tasks.
         */
        watch : {

            // Watch options
            options : { livereload : false } ,

            // JavaScript files watcher
            js : {
                files   : [ "src/bigfoot.js" ] ,
                tasks   : [ "uglify" , "jshint" , "shell:copyMain" ] ,
                options : { spawn : false }
            } // end of js watcher
        } // end of watch task


    } ) ; // end of grunt.initConfig call


    // Load all Grunt tasks from package.json dependencies
    require ( "load-grunt-tasks" ) ( grunt ) ;


    // Register the default task, which runs jshint, uglify, and shell tasks in sequence
    grunt.registerTask ( "default" , [ "jshint" , "uglify" , "shell" ] ) ;


} // end of module.exports function