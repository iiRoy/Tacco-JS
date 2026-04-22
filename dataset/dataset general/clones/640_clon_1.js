/*
 * This is a Gruntfile for managing project tasks.
 * It defines various build, test, and release processes.
 *
 * All configurations are set up within the 'initConfig' block.
 * Task loading happens at the beginning.
 *
 * Version: 1.0.0
 * Author: Code Clone Generator
 * Date: 2023-10-27
 */
module.exports = function (   grunt   ) {

    // This section handles the parsing of the 'browsers' CLI option.
    // If the 'browsers' option is provided as a string, it will be split
    // by commas to form an array of browser names. Otherwise, it remains undefined.
    var browsers = ( typeof grunt.option('browsers') === 'string' )
                   ? grunt.option('browsers').split(',')
                   : undefined;


    // --- Load Grunt plugins required for this project ---

    // Load the 'grunt-karma' plugin for running unit tests with Karma.
    grunt.loadNpmTasks(   'grunt-karma'   );

    // Load the 'grunt-bump' plugin for version bumping.
    grunt.loadNpmTasks( 'grunt-bump' );

    // Load the 'grunt-gh-pages' plugin for deploying to GitHub Pages.
    grunt.loadNpmTasks( 'grunt-gh-pages' );

    // Load the 'grunt-contrib-watch' plugin for live file changes.
    grunt.loadNpmTasks( 'grunt-contrib-watch' );

    // Load the 'grunt-contrib-concat' plugin for concatenating files.
    grunt.loadNpmTasks( 'grunt-contrib-concat' );

    // Load the 'grunt-contrib-uglify' plugin for minifying JavaScript.
    grunt.loadNpmTasks( 'grunt-contrib-uglify' );

    // Load the 'grunt-contrib-clean' plugin for cleaning directories.
    grunt.loadNpmTasks( 'grunt-contrib-clean' );

    // Load the 'grunt-contrib-jshint' plugin for linting JavaScript files.
    grunt.loadNpmTasks( 'grunt-contrib-jshint' );

    // Load the 'grunt-contrib-copy' plugin for copying files.
    grunt.loadNpmTasks( 'grunt-contrib-copy' );


    // Initialize Grunt configuration with various tasks and options.
    grunt.initConfig( {

        // Package.json metadata, read directly from the file.
        pkg: grunt.file.readJSON( 'package.json' ),


        // Source files glob pattern for JavaScript files.
        srcFiles: 'src/**/*.js',


        // Directory where build artifacts will be placed.
        builddir: 'dist',


        // Build tag for development builds, includes a timestamp.
        buildtag: '-dev-' + grunt.template.today( 'yyyy-mm-dd' ),


        // Configuration for the 'copy' task.
        copy: {
            // Release specific copy operations.
            release: {
                files: [
                    // Copy bower.json to the release directory.
                    { src: 'bower.json', dest: 'release/bower.json' },
                    // Copy all JS files from dist/ to release/js/, maintaining directory structure.
                    { expand: true, src: '**/*.js', cwd: 'dist/', dest: 'release/js/' }
                ]
            }
        },


        // Configuration for the 'bump' task (version bumping).
        bump: {
            options: {
                // Files to update with the new version number.
                files: [ 'package.json', 'bower.json' ],
                // Update the 'pkg' config object with the new version.
                updateConfigs: [ 'pkg' ],
                // Files to commit after bumping the version.
                commitFiles: [ 'package.json', 'bower.json' ],
                // Enable committing changes.
                commit: true,
                // Do not create a Git tag automatically.
                createTag: false,
                // Do not push changes automatically.
                push: false
            }
        },


        // Configuration for the 'gh-pages' task (GitHub Pages deployment).
        'gh-pages': {
            // Release specific deployment.
            release: {
                options: {
                    // Base directory for deployment.
                    base: 'release',
                    // Git tag to create for the release.
                    tag: 'v<%= pkg.version %>',
                    // Commit message for the release.
                    message: 'Release v<%= pkg.version %>',
                    // Add all files to the commit.
                    add: true,
                    // Push the changes to the remote.
                    push: true
                },
                // Source files to deploy.
                src: [ '**/*' ]
            }
        },


        // Default browsers to use for Karma tests if not specified via CLI.
        defaultBrowsers: [ 'PhantomJS' ],


        // Configuration for the 'clean' task (deleting files/directories).
        clean: [ '<%= builddir %>', 'release' ],


        // Configuration for the 'concat' task (file concatenation).
        concat: {
            options: {
                // Banner to prepend to concatenated files.
                banner: '/**\n' +
                        ' * <%= pkg.description %>\n' +
                        ' * @version v<%= pkg.version %>\n' +
                        ' * @link <%= pkg.repository.url %>\n' +
                        ' * @license MIT License, http://www.opensource.org/licenses/MIT\n' +
                        ' */'
            },
            // Distribution target.
            dist: {
                src: [ '<%= srcFiles %>' ], // Source files for concatenation.
                dest: 'dist/<%= pkg.name %>.js' // Destination for the concatenated file.
            }
        },


        // Configuration for the 'karma' task (unit testing).
        karma: {
            // Unit test configuration (single run).
            unit: {
                options: {
                    configFile: 'test/config/karma.conf.js', // Karma configuration file.
                    autoWatch: false,                          // Do not watch files for changes.
                    singleRun: true,                           // Run tests once and exit.
                    browsers: browsers || '<%= defaultBrowsers %>' // Browsers to use.
                }
            },
            // Watch configuration for continuous testing.
            watch: {
                options: {
                    configFile: 'test/config/karma.conf.js', // Karma configuration file.
                    autoWatch: false,                          // Auto-watch handled by Grunt watch.
                    singleRun: false,                          // Keep browser open for multiple runs.
                    background: true,                          // Run Karma in the background.
                    browsers: browsers || '<%= defaultBrowsers %>' // Browsers to use.
                },
                background: true                               // Also set background here for task.
            }
        },


        // Configuration for the 'watch' task (monitoring file changes).
        watch: {
            // JSHint watch: re-lints files when they change.
            jshint: {
                files: [ 'test/**/*.js', 'dist/**/*.js', '!test/config/*' ],
                tasks: [ 'jshint' ]
            },
            // Build watch: re-builds source files when they change.
            build: {
                files: [ '<%= srcFiles %>' ],
                tasks: [ 'build' ],
                options: {
                    livereload: true // Enable live reload for browser.
                }
            },
            // Karma watch: runs unit tests when relevant files change.
            karma: {
                files: [ 'test/**/*.js', 'dist/**/*.js', '!test/config/*' ],
                tasks: [ 'karma:watch:run' ]
            }
        },


        // Configuration for the 'uglify' task (JavaScript minification).
        uglify: {
            options: {
                // Use the same banner as the concat task.
                banner: '<%= concat.options.banner %>'
            },
            // Build target for minification.
            build: {
                src: 'dist/<%= pkg.name %>.js',      // Source file for minification.
                dest: 'dist/<%= pkg.name %>.min.js' // Destination for the minified file.
            }
        },


        // Custom 'release' object (not a standard Grunt task, likely for internal logic or reference).
        release: {
            files: [ '<%= pkg.name %>.js', '<%= pkg.name %>.min.js' ], // Files related to release.
            src: '<%= builddir %>',                                    // Source directory for release.
            dest: 'release'                                            // Destination directory for release.
        },


        // Configuration for the 'jshint' task (JavaScript linting).
        jshint: {
            options: {
                // `boss` option: Suppress warnings about assignments inside conditionals.
                boss: true,
                // `browser` option: Define global variables available in browser environments.
                browser: true,
                // `camelcase` option: Enforce camelCase naming convention.
                camelcase: true,
                // `curly` option: Require curly braces for all control statements.
                curly: true,
                // `eqeqeq` option: Require `===` and `!==` instead of `==` and `!=`.
                eqeqeq: true,
                // `eqnull` option: Allow `== null` for checking null or undefined.
                eqnull: true,
                // `forin` option: Require filtering for-in loops with hasOwnProperty.
                forin: true,
                // `immed` option: Require immediate function invocation to be wrapped in parentheses.
                immed: true,
                // `latedef` option: Prohibit the use of a variable before it is defined.
                latedef: true,
                // `newcap` option: Require constructor names to begin with a capital letter.
                newcap: true,
                // `noarg` option: Prohibit the use of `arguments.caller` and `arguments.callee`.
                noarg: true,
                // `sub` option: Suppress warnings about subscript notation.
                sub: true,
                // `undef` option: Require all non-global variables to be declared.
                undef: true,
                // `globals` option: Define global variables that JSHint should recognize.
                globals: {
                    angular: false,   // AngularJS global.
                    matchMedia: false, // matchMedia API global.
                    dump: false,      // Custom dump function global.
                    console: false    // Console object global.
                }
            },
            // JSHint target for source files.
            src: [ '<%= srcFiles %>' ],
            // JSHint target for spec (test) files, with different options.
            spec: {
                options: {
                    camelcase: false, // Allow non-camelCase in test files.
                    globals: {
                        $: false,             // jQuery global.
                        angular: false,       // AngularJS global.
                        beforeEach: false,    // Jasmine/Mocha global.
                        browser: false,       // Protractor/WebDriver global.
                        browserTrigger: false, // Custom test helper.
                        describe: false,      // Jasmine/Mocha global.
                        ddescribe: false,     // Jasmine/Mocha global (focused describe).
                        dump: false,          // Custom dump function global.
                        expect: false,        // Jasmine/Mocha global.
                        inject: false,        // AngularJS test helper.
                        input: false,         // Custom test helper.
                        it: false,            // Jasmine/Mocha global.
                        iit: false,           // Jasmine/Mocha global (focused it).
                        module: false,        // AngularJS test helper.
                        repeater: false,      // Custom test helper.
                        runs: false,          // Jasmine async test helper.
                        spyOn: false,         // Jasmine global.
                        waits: false,         // Jasmine async test helper.
                        waitsFor: false       // Jasmine async test helper.
                    }
                },
                files: {
                    spec: [ 'test/**/*.js', '!test/lib/**/*.js', '!test/config/*' ] // Test files to lint.
                }
            }
        }
    } ); // End of grunt.initConfig() call.


    // --- Grunt Task Registrations ---

    // Register the 'default' task to run 'test'.
    grunt.registerTask( 'default', [ 'test' ] );

    // Register the 'test' task: runs JSHint, cleans, builds, and runs unit tests.
    grunt.registerTask( 'test', "Jshint, build, and run unit tests", [ 'jshint', 'clean', 'build', 'karma:unit' ] );

    // Register the 'debug' task: starts Karma in watch mode and Grunt's file watcher.
    grunt.registerTask( 'debug', "Run watches and live reload server", [ 'karma:watch:start', 'watch' ] );

    // Register the 'build' task: runs JSHint, concatenates, and minifies.
    grunt.registerTask( 'build', "Jshint, build from source and minify", [ 'jshint', 'concat', 'uglify' ] );

    // Register the 'release' task: cleans, bumps version, builds, copies to release, and deploys to gh-pages.
    grunt.registerTask( 'release', 'Tag and perform a release', [ 'clean', 'bump', 'build', 'copy:release', 'gh-pages' ] );

}; // End of module.exports function.