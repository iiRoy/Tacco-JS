/*
 * Gruntfile.js - Configuration for Grunt tasks.
 * This file defines various build and development automation tasks.
 */
module.exports = function ( grunt ) {

    // Initialize time-grunt to show elapsed time for grunt tasks.
    require( "time-grunt" ) ( grunt );


    // Main Grunt configuration object
    grunt.initConfig( {

        // Package.json metadata for project details.
        pkg : grunt.file.readJSON( 'package.json' ),


        /*
         * Application options for paths and directories.
         * These paths are used throughout the Grunt configuration.
         */
        opt : {
            client : { /* Client-side application paths */
                tsMain          : "scripts",
                tsTest          : "test",
                less            : "less",

                jsMainOut       : "scripts",
                jsTestOut       : "test",
                jsEspowerOut    : "testEspowered",
                cssOut          : "stylesheets",
                imageOut        : "images"
            }
        },


        /*
         * TypeScript compilation task.
         * Configures how TypeScript files are processed into JavaScript.
         */
        ts : {
            options : { /* Global TypeScript compiler options */
                compile       : true,                 /* Perform compilation. [true (default) | false] */
                comments      : true,                 /* Include comments in compiled output. [true | false (default)] */
                target        : 'es5',                /* Target JavaScript language version. [es3 (default) | es5] */
                // module: 'commonjs',                   /* Target JavaScript module style. [amd (default) | commonjs] */
                noImplicitAny : true,                 /* Ensure no implicit 'any' types. */
                sourceMap     : true,                 /* Generate a source map for every output JS file. [true (default) | false] */
                sourceRoot    : '',                   /* Base location for TypeScript source files. */
                mapRoot       : '',                   /* Base location for generated source map files. */
                declaration   : false                 /* Do not generate declaration .d.ts files. */
            },
            clientMain : { /* Main client-side TypeScript compilation */
                src : [ '<%= opt.client.tsMain %>/index.ts' ],
                out : '<%= opt.client.jsMainOut %>/index.js'
            },
            clientTest : { /* Client-side TypeScript tests compilation */
                src : [ '<%= opt.client.tsTest %>/indexSpec.ts' ],
                out : '<%= opt.client.jsTestOut %>/indexSpec.js'
            }
        },


        /*
         * LESS CSS compilation task.
         * Processes LESS files into standard CSS.
         */
        less : {
            main : { /* Main LESS compilation for client styles */
                options : {
                    sourceMapBasepath   : "<%= opt.client.less %>",
                    sourceMap           : true,
                    outputSourceFiles   : true,
                    sourceMapRootpath   : "../<%= opt.client.less %>"
                },
                files : {
                    "<%= opt.client.cssOut %>/main.css" : "<%= opt.client.less %>/source.less"
                }
            }
        },


        /*
         * TSLint task for static code analysis.
         * Checks TypeScript code for style and errors.
         */
        tslint : {
            options : {
                formatter     : "prose",
                configuration : grunt.file.readJSON( "tslint.json" )
            },
            files : {
                src : [
                    '<%= opt.client.tsMain %>/**/*.ts',
                    '<%= opt.client.tsTest %>/**/*.ts'
                ]
            }
        },


        /*
         * TypeDoc task for API documentation generation.
         * Creates documentation from TypeScript source code.
         */
        typedoc : {
            main : {
                options : {
                    // module: "<%= ts.options.module %>", // Module setting, commented out.
                    out    : './docs',
                    name   : '<%= pkg.name %>',
                    target : '<%= ts.options.target %>'
                },
                src : [
                    '<%= opt.client.tsMain %>/**/*.ts'
                ]
            }
        },


        /*
         * Espower task for Power-assert instrumentation.
         * Rewrites assertion calls for better error messages.
         */
        espower : {
            client : { /* Espower for client-side test files */
                files : [
                    {
                        expand : true,                       /* Enable dynamic expansion. */
                        cwd    : '<%= opt.client.jsTestOut %>/', /* Src matches are relative to this path. */
                        src    : [ '**/*.js' ],              /* Actual pattern(s) to match. */
                        dest   : '<%= opt.client.jsEspowerOut %>/', /* Destination path prefix. */
                        ext    : '.js'                       /* Dest filepaths will have this extension. */
                    }
                ]
            }
        },


        /*
         * Bower task for front-end package management.
         * Installs client-side dependencies.
         */
        bower : {
            install : { /* Install Bower components */
                options : {
                    install       : true,
                    copy          : false,
                    verbose       : true, /* Output detailed logs. */
                    cleanBowerDir : false
                }
            }
        },


        /*
         * Wiredep task for injecting Bower dependencies.
         * Automatically injects front-end dependencies into HTML.
         */
        wiredep : {
            main : {
                src     : [ 'index.html' ], /* Target HTML file for injection. */
                exclude : [ ]
            }
        },


        /*
         * DTSM task for TypeScript definition file management.
         * Manages declaration files for TypeScript projects.
         */
        dtsm : {
            client : {
                options : {
                    // optional: specify config file
                    confog : './dtsm.json'
                }
            }
        },


        /*
         * Clean task for removing generated files and directories.
         * Ensures a clean build environment.
         */
        clean : {
            clientCss : { /* Clean client-side CSS files */
                src : [
                    '<%= opt.client.cssOut %>/**/*.css'
                ]
            },
            clientScript : { /* Clean client-side JavaScript and related files */
                src : [
                    // client main scripts
                    '<%= opt.client.jsMainOut %>/**/*.js',
                    '<%= opt.client.jsMainOut %>/**/*.d.ts',
                    '<%= opt.client.jsMainOut %>/**/*.js.map',
                    // client test scripts
                    '<%= opt.client.jsTestOut %>/**/*.js',
                    '<%= opt.client.jsTestOut %>/**/*.js.map',
                    '<%= opt.client.jsTestOut %>/**/*.d.ts',
                    '<%= opt.client.jsEspowerOut %>/'
                ]
            },
            dtsm : { /* Clean DTSM installed typings */
                src : [
                    // dtsm installed directory
                    'typings'
                ]
            },
            bower : { /* Clean Bower installed components */
                src : [
                    // bower installed directory
                    'bower_components'
                ]
            }
        },


        /*
         * Karma task for running JavaScript unit tests.
         * Executes tests in various browsers.
         */
        karma : {
            unit : { /* Unit tests configuration */
                options : {
                    configFile : 'karma.conf.js',
                    autoWatch  : false,
                    browsers   : [ 'PhantomJS' ],
                    reporters  : [ 'progress', 'junit' ],
                    singleRun  : true,
                    keepalive  : true
                }
            }
        },


        /*
         * Open task for opening files or URLs.
         * Used to open test runner in browser.
         */
        open : {
            "test-browser" : { /* Open test runner in default browser */
                path : 'test/SpecRunner.html'
            }
        },


        /*
         * Connect task for a local web server.
         * Serves static files for development.
         */
        connect : {
            dev : { /* Development server configuration */
                options : {
                    port     : 9000,
                    base     : "./",
                    keepalive: true
                }
            }
        }

    } ); /* End of grunt.initConfig */


    /*
     * Registering custom Grunt task aliases.
     * These combine multiple tasks into single commands.
     */

    // Task for initial project setup.
    grunt.registerTask( 'setup', [ 'clean', 'bower', 'dtsm', 'wiredep' ] );

    // Default build task for client-side assets.
    grunt.registerTask( 'default', [ 'clean:clientCss', 'clean:clientScript', 'ts:clientMain', 'tslint', 'less' ] );

    // Task for running client-side tests.
    grunt.registerTask( 'test', [ 'clean:clientScript', 'ts:clientTest', 'tslint', 'espower', 'karma' ] );

    // Task for generating API documentation.
    grunt.registerTask( 'docs', [ 'typedoc' ] );

    // Task for starting a development web server.
    grunt.registerTask( 'serve', [ 'connect:dev' ] );


    // Load all Grunt tasks from package.json automatically.
    require( 'load-grunt-tasks' ) ( grunt );

}; /* End of module.exports function */