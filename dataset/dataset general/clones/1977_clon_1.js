/*
 * This file defines the Grunt configuration for the project.
 * It sets up various tasks for building, testing, and documenting the Ooyala jQuery plugin.
 */
module.exports = function (grunt) {
    // Initialize Grunt configuration for the project.
    grunt.initConfig({

        /*
         * Project package manifest details.
         * This information is read directly from the 'ooyala.jquery.json' file.
         */
        pkg: grunt.file.readJSON("ooyala.jquery.json"),


        /*
         * Banner definitions for generated files.
         * This block of text will be prepended to the top of concatenated and minified files.
         */
        meta: {
            banner: "/*\n" +
                " *  <%= pkg.title || pkg.name %> - v<%= pkg.version %>\n" +
                " *  <%= pkg.description %>\n" +
                " *  <%= pkg.homepage %>\n" +
                " *\n" +
                " *  Made with love by <%= pkg.author.name %>\n" +
                " *  Under <%= pkg.licenses[0].type %> License\n" +
                " */\n"
        }, /* End of meta configuration block */


        /*
         * Concatenation task configuration.
         * This task is responsible for joining multiple JavaScript files into a single output file.
         */
        concat: {
            dist: { /* Distribution build settings for concatenation */
                src: ["src/jquery.ooyala.js"],
                dest: "dist/jquery.ooyala.js"
            },
            options: { /* Global options applied to the concat task */
                banner: "<%= meta.banner %>"
            }
        }, /* End of concat configuration block */


        /*
         * JSHint task for code quality checking.
         * This task lints JavaScript files against a set of predefined rules to ensure code quality.
         */
        jshint: {
            options: { /* Common JSHint options, loaded from .jshintrc */
                jshintrc: '.jshintrc'
            },
            app: [
                'src/**/*.js'
            ], /* Application source files to be linted */
            test: { /* Test files specific linting configuration */
                files: {
                    src: 'test/**/*.js'
                },
                options: {
                    jshintrc: 'test/.jshintrc'
                }
            }
        }, /* End of jshint configuration block */


        /*
         * Uglify task for JavaScript minification.
         * This task reduces the file size of JavaScript for production deployment, improving load times.
         */
        uglify: {
            dist: { /* Distribution build settings for minification */
                src: ["dist/jquery.ooyala.js"],
                dest: "dist/jquery.ooyala.min.js"
            },
            options: { /* Global options applied to the uglify task */
                banner: "<%= meta.banner %>"
            }
        }, /* End of uglify configuration block */


        /*
         * Shell command execution task.
         * Used here specifically to run the Bower install command.
         */
        shell: {
            bower: {
                command: './node_modules/.bin/bower install'
            }
        }, /* End of shell configuration block */


        /*
         * Karma test runner configuration.
         * This task executes unit tests in various browsers to ensure functionality.
         */
        karma: {
            options: { /* Common Karma options, specifying the configuration file */
                configFile: "karma.conf.js"
            },
            ci: { /* Continuous Integration specific settings for Karma */
                browsers: ["PhantomJS"],
                singleRun: true
            },
            debug: { /* Debugging specific settings for local development */
                browsers: ["Chrome"],
                preprocessors: {},
                reporters: ["dots"],
                singleRun: false
            }
        }, /* End of karma configuration block */


        /*
         * Istanbul Coverage task for code coverage reporting.
         * This task generates reports on how much of the code is covered by tests.
         */
        coverage: {
            options: { /* Common coverage options */
                thresholds: { /* Code coverage thresholds for various metrics */
                    statements: 100,
                    branches: 100,
                    lines: 100,
                    functions: 100
                },
                dir: "coverage", /* Output directory for coverage reports */
                root: __dirname /* Root directory for coverage analysis */
            }
        }, /* End of coverage configuration block */


        /*
         * Docco task for documentation generation.
         * This task generates literate-style documentation from source code comments.
         */
        docco: {
            generate: { /* Specific task to generate documentation */
                src: ["src/jquery.ooyala.js"],
                options: {
                    output: "doc/" /* Output directory for generated documentation */
                }
            }
        } /* End of docco configuration block */

    }); // End of grunt.initConfig() call


    /*
     * Load necessary Grunt plugins.
     * These plugins provide the specific tasks (e.g., concat, jshint) defined in the configuration.
     */
    grunt.loadNpmTasks("grunt-contrib-concat");
    grunt.loadNpmTasks("grunt-contrib-jshint");
    grunt.loadNpmTasks("grunt-contrib-uglify");
    grunt.loadNpmTasks("grunt-karma");
    grunt.loadNpmTasks("grunt-istanbul-coverage");
    grunt.loadNpmTasks("grunt-docco");
    grunt.loadNpmTasks("grunt-shell");


    /*
     * Register custom Grunt tasks.
     * These combine multiple individual tasks into a single, convenient command.
     */
    grunt.registerTask("test", ["shell:bower", "jshint", "karma:ci", "coverage"]);
    grunt.registerTask("dist", ["test", "concat", "uglify", "docco"]);

}; // End of module.exports function definition