module.exports = function ( grunt ) {
    /*
     * Load all Grunt tasks automatically from package.json dependencies.
     * This ensures all necessary plugins are available.
     */
    require( 'matchdep' ).filterDev( 'grunt-*' ).forEach( grunt.loadNpmTasks );


    // Main Grunt configuration object
    grunt.initConfig( {

        // --- Grunt Watch Task Configuration ---
        // Monitors files and runs tasks when changes are detected.
        watch: {
            // Watch configuration for Karma tests
            karma: {
                files: [ 'angular-toggle-switch.js', 'test/{,**/}*.js' ], // Files to monitor for changes
                tasks: [ 'karma:unit' ]                                   // Tasks to run on change
            }
        },

        // --- Grunt Bump Task Configuration ---
        // Automates version bumping, committing, and tagging.
        bump: {
            options: {
                commitMessage: 'chore: release v%VERSION%',                                        // Commit message template
                commitFiles: [ 'package.json', 'bower.json', 'angular-toggle-switch.min.js' ],     // Files to include in the commit
                files: [ 'package.json', 'bower.json' ],                                           // Files whose versions will be bumped
                pushTo: 'origin'                                                                   // Push to specified remote
            }
        },

        // --- Grunt Karma Task Configuration ---
        // Runs unit tests using the Karma test runner.
        karma: {
            unit: {
                configFile: 'karma.conf.js', // Path to Karma configuration file
                singleRun: true              // Run tests once and exit
            }
        },

        // --- Grunt JSHint Task Configuration ---
        // Lints JavaScript files for potential errors and style issues.
        jshint: {
            all: [
                'Gruntfile.js',                          // Lint Gruntfile itself
                'angular-toggle-switch.js',              // Lint the main source file
                'test/angular-toggle-switch.spec.js'     // Lint test files
            ]
        },

        // --- Grunt ngmin Task Configuration ---
        // Pre-minifies AngularJS files to protect against minification issues.
        ngmin: {
            dist: {
                files: {
                    'angular-toggle-switch.min.js': [ 'angular-toggle-switch.js' ] // Input and output files
                }
            }
        },

        // --- Grunt npm-contributors Task Configuration ---
        // Updates the list of contributors in package.json.
        'npm-contributors': {
            options: {
                commitMessage: 'chore: update contributors' // Commit message for contributor updates
            }
        },

        // --- Grunt Uglify Task Configuration ---
        // Minifies JavaScript files for production.
        uglify: {
            options: {
                mangle: false // Prevent variable name mangling (important for some Angular setups)
            },
            dist: {
                files: {
                    'angular-toggle-switch.min.js': [ 'angular-toggle-switch.min.js' ] // Minify the pre-minified file
                }
            }
        }
    } ); // End of grunt.initConfig

    // --- Grunt Task Registrations ---

    /*
     * Registers the 'build' task.
     * This task performs linting, ngminification, and uglification.
     */
    grunt.registerTask( 'build', [
        'jshint:all', // Lint all JavaScript files
        'ngmin',      // Pre-minify Angular files
        'uglify'      // Uglify (minify) the final JavaScript
    ] );

    /*
     * Registers the 'test' task.
     * This task runs JSHint and Karma unit tests.
     */
    grunt.registerTask( 'test', [
        'jshint:all', // Lint all JavaScript files
        'karma:unit'  // Run Karma unit tests
    ] );

    /*
     * Registers the 'release' task.
     * This task builds, updates contributors, and bumps the version.
     * @param {string} type - The type of version bump (e.g., 'patch', 'minor', 'major').
     */
    grunt.registerTask( 'release', 'Bump the version', function ( type ) {
        grunt.task.run( [
            'build',                                 // First, build the project
            'npm-contributors',                      // Then, update the npm contributors list
            'bump:' + ( type ? type : 'patch' )      // Finally, bump the version (default to 'patch' if no type specified)
        ] );
    } );

    /*
     * Registers the 'default' task.
     * This task is executed when Grunt is run without any specific task.
     */
    // The default Grunt task simply starts watching for file changes.
    grunt.registerTask( 'default', [ 'watch' ] );
};