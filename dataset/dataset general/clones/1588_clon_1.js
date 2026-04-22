// This file is a Grunt configuration. It's intended for Node.js environments.
// Original hint: /* jshint node: true */

// Export the main Grunt configuration function.
module.exports =
    function (grunt) {

        'use strict'; // Enforce strict mode for better code quality.


        // --- Project Configuration Section ---
        // This is where all the Grunt tasks and their options are defined.

        grunt.initConfig(
            {

                // Read package.json for project metadata.
                // This allows accessing properties like name, version, homepage, etc.
                pkg: grunt.file.readJSON('package.json'),

                // Define a banner for output files (e.g., minified JavaScript).
                // It includes project name, version, copyright, and license information.
                banner: '/*!\n' +
                    ' * <%= pkg.name %> v<%= pkg.version %> - <%= pkg.homepage %>\n' +
                    ' * Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>\n' +
                    ' * Licensed under the <%= pkg.license %> license\n' +
                    ' */\n',


                // JSHint task configuration.
                // JSHint is a static analysis tool used to detect errors and potential problems in JavaScript code.
                jshint: {
                    // Files to lint.
                    files: [
                        '*.js'
                    ],

                    // JSHint options.
                    options: {
                        'browser': true, // Assume code runs in a browser.
                        'node': false, // Do not assume code runs in Node.js (overridden by file-level hint).
                        'camelcase': true, // Enforce camelCase naming convention.
                        'curly': true, // Require curly braces for all control structures.
                        'eqeqeq': true, // Require triple equals (===) for comparison.
                        'eqnull': true, // Allow == null for checking null or undefined.
                        'forin': true, // Require filtering for-in loops with hasOwnProperty.
                        'immed': true, // Require immediate invocations to be wrapped in parentheses.
                        'indent': 4, // Enforce a 4-space indentation.
                        'laxbreak': true, // Suppress warnings about unsafe line breaks.
                        'laxcomma': true, // Suppress warnings about leading commas.
                        'lastsemic': true, // Enforce a semicolon after the last statement in a block.
                        'loopfunc': true, // Allow functions to be defined in loops.
                        'noarg': true, // Prohibit use of arguments.caller and arguments.callee.
                        'noempty': true, // Prohibit empty blocks.
                        'newcap': true, // Require capitalization of constructor functions.
                        'plusplus': false, // Prohibit use of ++ and -- operators.
                        'quotmark': 'single', // Enforce the use of single quotes.
                        'shadow': true, // Allow variable shadowing.
                        'smarttabs': false, // Prohibit mixed tabs and spaces.
                        'strict': false, // Do not enforce strict mode globally (handled per file).
                        'sub': true, // Allow [ ] subscript notation for accessing object properties.
                        'trailing': true, // Prohibit trailing whitespace.
                        'undef': true, // Require all variables to be declared.
                        'unused': true, // Warn about unused variables.
                        // Files or directories to ignore during linting.
                        ignores: [
                            'bower_components',
                            'node_modules'
                        ]
                    }
                },


                // Uglify task configuration.
                // UglifyJS is used for minification and compression of JavaScript files.
                uglify: {
                    options: {
                        banner: '<%= banner %>', // Prepend the banner defined above.
                        compress: true, // Enable compression.
                        mangle: true, // Enable mangling of variable names.
                        preserveComments: false, // Remove all comments.
                        report: 'gzip' // Report file size after gzip compression.
                    },
                    // Dist target for Uglify.
                    dist: {
                        files: {
                            // Output minified file: Source file.
                            'dist/rainyday.min.js': [
                                'rainyday.js'
                            ]
                        }
                    }
                }
            }
        ); // End of grunt.initConfig({...});


        // --- Load Grunt Plugins ---
        // These lines load external Grunt tasks from npm packages.

        grunt.loadNpmTasks('grunt-contrib-jshint'); // Load the JSHint plugin.
        grunt.loadNpmTasks('grunt-contrib-uglify'); // Load the Uglify plugin.


        // --- Register Grunt Tasks ---
        // Define custom tasks that combine one or more loaded tasks.

        // Default task: runs JSHint and Uglify.
        grunt.registerTask(
            'default',
            [
                'jshint',
                'uglify'
            ]
        );

        // Dist task: runs only Uglify for distribution build.
        grunt.registerTask(
            'dist',
            [
                'uglify'
            ]
        );

        // Test task: runs only JSHint for code quality checks.
        grunt.registerTask(
            'test',
            [
                'jshint'
            ]
        );

    }; // End of module.exports function.