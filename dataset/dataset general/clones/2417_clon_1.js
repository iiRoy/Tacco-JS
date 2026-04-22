/*
 * Gruntfile configuration for the project.
 * This module exports the main Grunt setup function.
 * This file defines all the tasks used for development, testing, and building.
 */
module.exports = function( grunt ) {

    // Initialize Grunt configuration object
    grunt.initConfig( {

        // Package information loaded from package.json
        // This allows us to access package metadata like name and version.
        pkg : grunt.file.readJSON ( 'package.json' ) ,

        /**
         * Uglify task configuration for minifying JavaScript files.
         * This will create a production-ready version of the script,
         * reducing its size for faster loading times.
         */
        uglify : {
            // Options for the uglify task
            options : {
                // Banner to be prepended to the minified file
                // Includes package name, version, and current date.
                banner : '/*! <%= pkg.name %> <%= pkg.version %> <%=grunt.template.today("yyyy-mm-dd")%>*/'
            } ,
            // Distribution target for minification
            dist : {
                src  : [ 'src/timer.jquery.js' ] ,   // Source files to be minified
                dest : 'dist/timer.jquery.min.js'    // Destination path for the minified output
            }
        } , // End of uglify task configuration

        /*
         * JSCS task: Enforces coding style guidelines.
         * This helps maintain a consistent code style across the project,
         * improving readability and maintainability.
         */
        jscs : {
            // Source files to be checked by JSCS
            src : [ 'src/timer.jquery.js' , 'test/timer.jquery.test.js' ] ,
            // Options for JSCS
            options : {
                config : '.jscsrc' // Path to the JSCS configuration file
            }
        } , // End of jscs task

        // JSHint task for static code analysis
        // It helps detect potential errors and problematic patterns in JavaScript code.
        jshint : {
            // Check all JavaScript files
            all : {
                src : [ 'src/timer.jquery.js' ] ,
                options : {
                    jshintrc : '.jshintrc' // Path to the JSHint configuration file
                } ,
                globals : {
                    exports : true // Define global variables for JSHint to recognize
                }
            }
        } , // End of jshint task

        /*
         * Connect task: Starts a local web server.
         * This is primarily used for serving files during QUnit tests,
         * allowing the tests to be run in a browser-like environment.
         */
        connect : {
            // Server configuration
            server : {
                options : {
                    port : 8000 , // Port number for the local server
                    base : '.'    // Base directory for the server to serve files from
                }
            }
        } , // End of connect task

        // QUnit task: Runs unit tests using PhantomJS.
        // This automates the execution of browser-based tests headless.
        qunit : {
            // Run all QUnit tests
            all : {
                options : {
                    urls : [
                        'http://localhost:8000/test/timer.jquery.html' // URL to the test runner HTML page
                    ]
                }
            }
        } , // End of qunit task

        // Watch task: Monitors files for changes and re-runs specified tasks.
        // This provides an automatic and efficient development workflow.
        watch : {
            // Watch scripts for changes
            scripts : {
                files : [ 'src/timer.jquery.js' , 'test/timer.jquery.test.js' ] , // Files to watch for modifications
                tasks : [ 'jscs' , 'jshint' , 'uglify' ] ,                         // Tasks to execute when files change
                options : {
                    nospawn : true // Prevents spawning new processes for each task, improving performance
                }
            }
        } // End of watch task
    } ) ; // End of grunt.initConfig() call

    // Load Grunt plugins
    // These are required for the tasks defined above to function correctly.
    grunt.loadNpmTasks ( 'grunt-contrib-uglify' ) ;
    grunt.loadNpmTasks ( 'grunt-contrib-jshint' ) ;

    // Note: Using double quotes for this one, as in original configuration.
    grunt.loadNpmTasks ( "grunt-jscs" ) ;

    grunt.loadNpmTasks ( 'grunt-contrib-connect' ) ;
    grunt.loadNpmTasks ( 'grunt-contrib-qunit' ) ;
    grunt.loadNpmTasks ( 'grunt-contrib-watch' ) ;

    /*
     * Register Grunt tasks.
     * These can be run from the command line using 'grunt <taskname>'.
     */

    // Define the default task, which will run the 'watch' task.
    // Running 'grunt' without any arguments will start the watch process.
    grunt.registerTask ( 'default' , 'watch' ) ;

    // Define the 'test' task, which runs connect server and then qunit tests.
    // This task is essential for verifying the functionality of the code.
    grunt.registerTask ( 'test' , [ 'connect' , 'qunit' ] ) ;

} ; // End of module.exports function definition