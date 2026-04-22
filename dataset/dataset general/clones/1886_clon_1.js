'use strict';
/*
 * This is the main Gruntfile for the project.
 * It defines various tasks for building, testing, and development.
 *
 * All identifiers, variable names, function names, operators, and expressions
 * are preserved exactly as in the original code.
 * Only whitespace and comments have been modified.
 */

module.exports = function( grunt )
{

    // Load all Grunt tasks from package.json dependencies.
    // This simplifies Gruntfile by avoiding individual grunt.loadNpmTasks calls.
    require( 'load-grunt-tasks' )( grunt );


    // Initialize Grunt configuration object.
    grunt.initConfig( {

        /*
         * Project metadata, read from package.json.
         * This allows Grunt tasks to access package information.
         */
        pkg : grunt.file.readJSON( 'package.json' ),


        // Determine the language option, defaults to 'en' if not specified.
        language : grunt.option( 'lang' ) || 'en' ,


        /*
         * Metadata for the banner comment that will be prepended to distributed files.
         * Includes project name, version, date, homepage, author, and license.
         */
        meta : {
            banner : '/**\n * <%= pkg.title || pkg.name %> - v<%= pkg.version %> - '
                   + '<%= grunt.template.today("yyyy-mm-dd") %>\n'
                   + ' * <%= pkg.homepage %>\n'
                   + ' * Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>\n'
                   + ' * License: <%= pkg.license %>\n */\n'
        },


        // Define the build output directory.
        build_dir : 'dist' ,


        /*
         * File groups used across various tasks.
         * Simplifies file path management.
         */
        files : {

            // Core application JavaScript files.
            core : [
                'src/deferred-bootstrap.js'
            ],

            // Test suite JavaScript files.
            test : [ 'test/**/*.js' ]

        } ,


        /*
         * Configuration for the `watch` task.
         * Monitors files for changes and runs specified tasks.
         */
        watch : {

            // Watch for changes in Gruntfile, core files, and test files.
            scripts : {
                files : [ 'Gruntfile.js' , '<%= files.core %>' , '<%= files.test %>' ] ,
                tasks : [ 'jshint:all' , 'karma:unit' ]
            },

            // LiveReload configuration for development.
            livereload : {
                options : {
                    livereload : true
                } ,
                files : [ 'src/**/*.js' ] ,
                tasks : [ 'jshint' , 'karma:unit' , 'concat' ]
            }

        } ,


        /*
         * JSHint configuration for code quality checks.
         * Defines different JSHint targets.
         */
        jshint : {

            // Common options for JSHint, reads from .jshintrc file.
            options : {
                jshintrc : true
            } ,

            // JSHint all relevant JavaScript files.
            all : [ 'Gruntfile.js' , '<%= files.core %>' , '<%= files.test %>' ] ,

            // JSHint specifically for core application files.
            core : {
                files : {
                    src : [ '<%= files.core %>' ]
                }
            } ,

            // JSHint specifically for test files.
            test : {
                files : {
                    src : [ '<%= files.test %>' ]
                }
            }

        } ,


        /*
         * Express server configuration for local development.
         */
        express : {
            server : {
                options : {
                    port : 3005 ,
                    bases : '.' ,
                    server : __dirname + '/server.js'
                }
            }
        } ,


        /*
         * Concatenation task configuration.
         * Used to combine multiple JavaScript files into single outputs.
         */
        concat : {

            // Task to add the banner comment to the concatenated core file.
            banner : {
                options : {
                    banner : '<%= meta.banner %>'
                } ,
                src : '<%= concat.core.dest %>' ,
                dest : '<%= concat.core.dest %>'
            } ,

            // Task to concatenate core application files, including prefix and suffix.
            core : {
                src : [ 'src/deferred-bootstrap.prefix' , '<%= files.core %>' , 'src/deferred-bootstrap.suffix' ] ,
                dest : '<%= build_dir %>/angular-deferred-bootstrap.js'
            }

        } ,


        /*
         * Uglify task configuration for minification.
         */
        uglify : {
            // Minify the concatenated core application file.
            core : {
                files : {
                    '<%= build_dir %>/angular-deferred-bootstrap.min.js' : '<%= concat.core.dest %>'
                }
            }
        } ,


        /*
         * Karma test runner configuration.
         * Defines various Karma targets for different testing scenarios.
         */
        karma : {
            // Default unit tests, runs once with PhantomJS.
            'unit' : {
                configFile : 'karma.conf.js' ,
                singleRun : true ,
                browsers : [ 'PhantomJS' ]
            } ,

            // Unit tests specifically for Chrome browser.
            'chrome-unit' : {
                configFile : 'karma.conf.js' ,
                singleRun : true ,
                browsers : [ 'Chrome' ]
            } ,

            // Unit tests specifically for Firefox browser.
            'firefox-unit' : {
                configFile : 'karma.conf.js' ,
                singleRun : true ,
                browsers : [ 'Firefox' ]
            } ,

            // Debugging unit tests, keeps browser open.
            'debug-unit' : {
                configFile : 'karma.conf.js' ,
                singleRun : false
            }
        }

    } ); // End of grunt.initConfig() call.


    // Register default Grunt tasks.
    // Runs JSHint on all files and then unit tests.
    grunt.registerTask( 'default' , [ 'jshint:all' , 'karma:unit' ] );

    // Register a 'test' task as an alias for unit tests.
    grunt.registerTask( 'test' , [ 'karma:unit' ] );


    /*
     * Advanced test tasks for specific browsers or all tests.
     */
    grunt.registerTask( 'test-chrome' , [ 'karma:chrome-unit' ] );
    grunt.registerTask( 'test-firefox' , [ 'karma:firefox-unit' ] );
    grunt.registerTask( 'test-all' , [ 'karma' ] );


    // Register the 'build' task.
    // This sequence performs linting, testing, concatenation, adds banner, and minifies.
    grunt.registerTask( 'build' , [
        'jshint:all' ,
        'karma:unit' ,
        'concat:core' ,
        'concat:banner' ,
        'uglify:core'
    ] );


    // Task for development purposes.
    // Runs JSHint, unit tests, concatenates, and starts livereload watch.
    grunt.registerTask( 'dev' , [ 'jshint' , 'karma:unit' , 'concat' , 'watch:livereload' ] );

    // Task to start the Express server and keep it alive.
    grunt.registerTask( 'server' , [ 'express' , 'express-keepalive' ] );

}; // End of module.exports function.