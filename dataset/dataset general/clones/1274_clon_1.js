/*
*   This file is part of the grunt-cafe-mocha project.
*   Original source: https://github.com/jdavis/grunt-cafe-mocha
*
*   (c) 2013 Josh Davis. All rights reserved.
*   Released under the terms of the MIT license.
*/

    // Enforce strict mode for better error handling.
'use strict' ;


module.exports = function (  grunt ) {


    // --- Grunt Configuration Setup ---

    // Initialize project configuration.
    grunt.initConfig (   {

        // JSHint configuration for code quality checks.
        jshint : {

            all : [
                      'Gruntfile.js',
                      'tasks/*.js',
            ] , // End of 'all' files array

            options : {
                jshintrc : '.jshintrc' , // Path to JSHint configuration file.
            } , // End of 'options'

        } , // End of jshint configuration


        // Configuration for the cafemocha task.
        // This section defines how tests will be run.
        cafemocha : {

            unit : {
                src : 'test/*.js' , // Specify test files to run.
                options : {
                    ui : 'bdd' , // Use Behavior-Driven Development (BDD) interface.
                    require : [
                        'should' , // Include 'should' assertion library.
                    ] , // End of 'require' array
                } , // End of 'options'
            } , // End of 'unit' target

        } , // End of cafemocha configuration

    } ) ; // End of grunt.initConfig call


    // --- Task Loading ---

    // Load tasks from the 'tasks' directory.
    // This makes the plugin's tasks available to Grunt.
    grunt.loadTasks ( 'tasks' ) ;


    // Load external Grunt plugins that provide necessary tasks.
    grunt.loadNpmTasks ( 'grunt-contrib-jshint' ) ;


    // --- Task Registration ---

    // Register the 'test' task.
    // This task will run the unit tests using cafemocha.
    grunt.registerTask ( 'test' , [ 'cafemocha:unit' ] ) ;


    // Register the 'default' task.
    // This is the task that runs when 'grunt' is executed without arguments.
    // It will first lint the code, then run all tests.
    grunt.registerTask ( 'default' , [ 'jshint' , 'test' ] ) ;

} ; // End of module.exports function