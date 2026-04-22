// This line declares global variables for JSHint, ensuring it recognizes 'module' and 'require' without errors.
/*global module:false require */

// This is the main Grunt plugin export function.
// It takes the 'grunt' object as its sole argument.
module.exports = function (  grunt ) {

    // --- Project configuration section ---
    // All Grunt tasks are configured within this object.
    grunt.initConfig ( {

        pkg: grunt.file.readJSON( 'package.json' ), // Reads the package.json file for project metadata.

        // --- File paths configuration ---
        files: {
            grunt: [
                'gruntfile.js'
            ], // Specifies the Gruntfile itself.
            js:    [
                'js/custom/*.js'
            ], // All custom JavaScript files.
            css:   [
                'css/custom/*.css'
            ], // All custom CSS files.
            img:   [
                'img'
            ] // The image directory.
        },

        // --- Smushit task configuration ---
        // This task is used for image optimization.
        smushit: {
            path: {
                src: '<%= files.img %>'
            } // Recursively replaces images with their minified versions.
        },

        // --- Concat task configuration ---
        // This task concatenates multiple files into a single file.
        concat: {

            // Concatenate custom CSS files.
            css: {
                src:  [
                    '<%= files.css %>'
                ],
                dest: 'css/libs/z.styles.concat.css'
            },

            // Concatenate CSS library files.
            csslibs: {
                src:  [
                    'css/libs/*.css'
                ],
                dest: 'css/libs/z.styles.concat.css'
            },

            // Concatenate minified CSS files.
            cssmin: {
                src:  [
                    'css/min/*.css'
                ],
                dest: 'css/min/styles.min.css'
            },

            // Concatenate custom JavaScript files.
            js: {
                src:  [
                    '<%= files.js %>'
                ],
                dest: 'js/libs/z.scripts.concat.js'
            },

            // Concatenate JavaScript library files.
            jslibs: {
                src:  [
                    'js/libs/*.js'
                ],
                dest: 'js/libs/z.scripts.concat.js'
            },

            // Concatenate minified JavaScript files.
            jsmin: {
                src:  [
                    'js/min/*.js'
                ],
                dest: 'js/min/scripts.min.js'
            }
        },

        // --- Uglify task configuration ---
        // This task minifies JavaScript files.
        uglify: {
            dist: {
                src:  [
                    'js/libs/z.scripts.concat.js'
                ],
                dest: 'js/min/scripts.min.js'
            }
        },

        // --- JSHint task configuration ---
        // This task checks JavaScript code for errors and potential problems.
        jshint: {

            files: [
                '<%= files.grunt %>',
                '<%= files.js %>'
            ], // Files to be linted.

            options: {
                jquery:      true, // Predefines the jQuery global.
                smarttabs:   true, // Suppresses warnings about mixed tabs and spaces.
                curly:       true, // Requires braces around all control structures.
                eqeqeq:      true, // Requires the use of === and !==.
                immed:       true, // Requires immediate invocation of function expressions.
                latedef:     true, // Prohibits the use of a variable before it has been defined.
                newcap:      true, // Requires all constructor functions to be capitalized.
                noarg:       true, // Prohibits the use of arguments.caller and arguments.callee.
                sub:         true, // Suppresses warnings about using bracket notation instead of dot notation.
                undef:       true, // Requires all non-global variables to be declared.
                boss:        true, // Suppresses warnings about assignments inside of conditionals.
                eqnull:      true, // Suppresses warnings about == null comparisons.
                browser:     true // Predefines globals available in web browsers.
            },

            globals: {
                jQuery:  true, // Declares jQuery as a global variable.
                console: true, // Declares console as a global variable.
                undef:   true, // A redundant declaration, usually handled by 'undef' option.
                unused:  false // Allows unused variables without warning.
            }
        },

        // --- CSSMin task configuration ---
        // This task minifies CSS files.
        cssmin: {
            dist: {
                src:  [
                    'css/libs/z.styles.concat.css'
                ],
                dest: 'css/min/styles.min.css'
            }
        },

        // --- CSSLint task configuration ---
        // This task checks CSS code for errors and adherence to coding conventions.
        csslint: {
            styles: {
                src:     [
                    'css/custom/*.css'
                ], // Custom CSS files to be linted.
                options: {
                    // 'import': false, // Disables the 'import' rule.
                    'ids':                        false, // Disables warnings for IDs in CSS.
                    'font-sizes':                 false, // Disables warnings for font-size declarations.
                    'unqualified-attributes':     false, // Disables warnings for unqualified attribute selectors.
                    'floats':                     false, // Disables warnings for float usage.
                    'overqualified-elements':     false, // Disables warnings for overqualified element selectors.
                    'adjoining-classes':          false, // Disables warnings for adjoining class selectors.
                    'important':                  false, // Disables warnings for '!important' usage.
                    'box-sizing':                 false, // Disables warnings for box-sizing property.
                    'unique-headings':            false, // Disables warnings for non-unique heading styles.
                    'qualified-headings':         false, // Disables warnings for qualified heading selectors.
                    'regex-selectors':            false, // Disables warnings for regex selectors.
                    'universal-selector':         false, // Disables warnings for universal selector usage.
                    'duplicate-properties':       false, // Disables warnings for duplicate properties.
                    'duplicate-background-images': false, // Disables warnings for duplicate background images.
                    'box-model':                  false, // Disables warnings for box model issues.
                    'outline-none':               false, // Disables warnings for 'outline: none' usage.
                    'text-indent':                false, // Disables warnings for text-indent usage.
                    'compatible-vendor-prefixes': false, // Disables warnings for missing vendor prefixes.
                    'star-property-hack':         false, // Disables warnings for star property hack.
                    'display-property-grouping':  false, // Disables warnings for display property grouping.
                    'underscore-property-hack':   false // Disables warnings for underscore property hack.
                }
            }
        },

        // --- Watch task configuration ---
        // This task watches for file changes and runs specified tasks.
        watch: {
            files: [
                '<%= files.grunt %>',
                '<%= files.js %>',
                '<%= files.css %>'
            ], // Files to watch.
            tasks: [
                'default'
            ] // Tasks to run when files change.
        }
    } );


    // --- Load Grunt plugins ---
    // These lines load tasks from npm-installed Grunt plugins.

    // Loads the 'concat' task.
    grunt.loadNpmTasks( 'grunt-contrib-concat' );
    // Loads the 'jshint' task.
    grunt.loadNpmTasks( 'grunt-contrib-jshint' );
    // Loads the 'watch' task.
    grunt.loadNpmTasks( 'grunt-contrib-watch' );
    // Loads the 'uglify' task.
    grunt.loadNpmTasks( 'grunt-contrib-uglify' );
    // Loads the 'csslint' task.
    grunt.loadNpmTasks( 'grunt-contrib-csslint' );
    // Loads the 'cssmin' task.
    grunt.loadNpmTasks( 'grunt-contrib-cssmin' );
    // Loads the 'smushit' task.
    grunt.loadNpmTasks( 'grunt-smushit' );


    /**
     * Default Grunt task.
     *
     * This task orchestrates the linting, concatenation, and minification
     * processes for both JavaScript and CSS assets.
     *
     * The workflow is structured to:
     * 1. Lint custom JavaScript code.
     * 2. Concatenate custom JavaScript into a single file.
     * 3. Concatenate JavaScript library files into the same file.
     * 4. Minify the combined JavaScript.
     * 5. Concatenate all minified JavaScript files.
     *
     * The same steps are then repeated for CSS assets:
     * 1. Lint custom CSS code.
     * 2. Concatenate custom CSS into a single file.
     * 3. Concatenate CSS library files into the same file.
     * 4. Minify the combined CSS.
     * 5. Concatenate all minified CSS files.
     *
     * This process ensures:
     * - Consistent file paths through a flat structure.
     * - Development environment uses concatenated files (e.g., /libs/scripts.js, /libs/styles.css).
     * - Production environment uses minified files (e.g., /min/scripts.min.js, /min/styles.min.css).
     */
    grunt.registerTask( 'default', [

        'jshint',         // First, lint all JavaScript files.

        'concat:js',      // Concatenate custom JS.
        'concat:jslibs',  // Then, concatenate JS libraries.
        'uglify',         // Next, minify the combined JS.
        'concat:jsmin',   // Finally, concatenate all minified JS.

        'csslint',        // Now, lint all CSS files.

        'concat:css',     // Concatenate custom CSS.
        'concat:csslibs', // Then, concatenate CSS libraries.
        'cssmin',         // Next, minify the combined CSS.
        'concat:cssmin'   // Finally, concatenate all minified CSS.

    ] );

    /**
     * Minify task.
     *
     * This task first executes the 'default' task to process all JS and CSS,
     * and then proceeds to losslessly optimize images using Yahoo!'s Smush-It service.
     * It ensures all assets, including images, are optimized for production.
     */
    grunt.registerTask( 'minify', [
        'default', // Run the default build process.
        'smushit'  // Then, optimize images.
    ] );

};