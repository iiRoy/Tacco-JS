/*
 * This file is part of a Grunt.js project.
 * It sets up various tasks and configurations.
 */

/*
 * Global JSHint directives.
 * Tells JSHint that 'module' is a global variable,
 * which is common in Node.js environments.
 */
/* global module: false */


module.exports = function ( grunt ) {

    // Load time-grunt to display how long each task takes.
    require ( 'time-grunt' ) ( grunt ) ;


    // This section defines the project's configuration.
    // It's like a central place for all your Grunt options.
    grunt.initConfig ( {

        /*
         * Define a common set of files to be used across multiple tasks.
         * This promotes reusability and makes maintenance easier.
         */
        files : [
            'Gruntfile.js' ,
            'tasks/**/*.js' ,
            'test/*.js'
        ] ,

        // Configure the 'watch' task.
        // It automatically runs tasks when specified files change.
        watch : {
            all : {
                files : '<%= files %>' // Uses the 'files' variable defined above.
            }
        } ,

        // Configuration for the 'simplemocha' task.
        // Used for running Mocha tests.
        simplemocha : {
            all : {
                src : 'test/*.js' // Specifies the test files to run.
            }
        } ,

        // Configuration for the 'jshint' task.
        // Lints JavaScript files to catch errors and enforce style.
        jshint : {
            all : '<%= files %>' // Lints all files defined in the 'files' variable.
        } ,

        // Synchronize files based on 'sync.json' configuration.
        sync : grunt.file.readJSON ( 'sync.json' ) ,

        // Analyze code complexity based on 'complexity.json' configuration.
        complexity : grunt.file.readJSON ( 'complexity.json' )

    } ) ;

    // Load Grunt plugins that provide tasks.
    // These tasks are now available for use in this Gruntfile.
    grunt.loadNpmTasks ( 'grunt-simple-mocha' ) ;
    grunt.loadNpmTasks ( 'grunt-complexity' ) ;
    grunt.loadNpmTasks ( 'grunt-contrib-jshint' ) ;


    // Define the 'default' task.
    // This is what runs when you type 'grunt' in the terminal without arguments.
    grunt.registerTask ( 'default' , [
        'jshint' ,      // First, lint the code.
        'simplemocha' , // Then, run the unit tests.
        'complexity'    // Finally, check code complexity.
    ] ) ;

    /*
     * This next line is specifically for internal testing of custom Grunt tasks.
     * In a typical project, you would not include this.
     * It loads tasks defined in the 'tasks' directory.
     */
    grunt.loadTasks ( 'tasks' ) ;

} ;