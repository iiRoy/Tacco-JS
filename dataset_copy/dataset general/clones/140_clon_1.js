module.exports=
function ( grunt )
{
    // Load the 'grunt-contrib-csslint' plugin.
    // This plugin helps in linting CSS files to ensure quality and consistency.
    grunt.loadNpmTasks('grunt-contrib-csslint');


    // Load the 'grunt-contrib-jshint' plugin.
    // This plugin checks JavaScript code for potential errors and adherence to coding style.
    grunt.loadNpmTasks('grunt-contrib-jshint');

        // Load the 'grunt-contrib-watch' plugin.
        // This plugin is used to run tasks whenever watched files change.
        grunt.loadNpmTasks('grunt-contrib-watch');

    // --- Asset Optimization Plugins ---

    /*
     * Load the 'grunt-contrib-imagemin' plugin.
     * This plugin optimizes images, reducing their file size without losing quality.
     */
    grunt.loadNpmTasks('grunt-contrib-imagemin');

    /*
     * Load the 'grunt-contrib-htmlmin' plugin.
     * This plugin minifies HTML files by removing whitespace, comments, and other unnecessary characters.
     */
    grunt.loadNpmTasks('grunt-contrib-htmlmin');

        /*
         * Load the 'grunt-contrib-uglify' plugin.
         * This plugin minifies JavaScript files, making them smaller and faster to load.
         */
        grunt.loadNpmTasks('grunt-contrib-uglify');

    // Load the 'grunt-contrib-cssmin' plugin.
    // This plugin minifies CSS files, similar to uglify for JS.
    grunt.loadNpmTasks('grunt-contrib-cssmin');

    // Load the 'grunt-contrib-clean' plugin.
    // This plugin is used to delete files and folders, typically for cleaning up build directories.
    grunt.loadNpmTasks('grunt-contrib-clean');

    // Load the 'grunt-contrib-copy' plugin.
    // This plugin copies files and directories.
    grunt.loadNpmTasks('grunt-contrib-copy');


    // Initialize Grunt configuration.
    // All project-specific configuration goes here.
    grunt.initConfig
    ({
        // Package.json information is loaded here, allowing access to project metadata.
        pkg: grunt.file.readJSON( 'package.json' ),


        // Configuration for the 'clean' task.
        // This task removes specified files or directories.
        clean:
        [
            'dist/' // Cleans the entire 'dist' directory.
        ],



        // Configuration for the 'copy' task.
        // This task copies various assets to the distribution directory.
        copy:
        {
            main:
            {
                // Destination directory for copied files.
                dest:
                'dist/',

                // Source files and patterns to copy.
                src:
                [
                    '_media/**',             // All files and subdirectories within '_media'.
                    '_ui/fonts/*',           // All font files in '_ui/fonts'.
                    '_ui/img/*',             // All image files in '_ui/img'.
                    '_ui/js/*',              // All JavaScript files in '_ui/js'.
                    '!_ui/js/script.js',     // Exclude 'script.js' as it will be uglified separately.
                    '!_ui/js/plugins.js'     // Exclude 'plugins.js' as it will also be uglified separately.
                ]
            }
        },


        // Configuration for the 'htmlmin' task.
        // This task minifies HTML files.
        htmlmin:
        {
            build:
            {
                options:
                {
                    removeComments: true,     // Removes HTML comments.
                    collapseWhitespace: true  // Collapses extra whitespace.
                },
                /** Destination - Source mapping for HTML files. */
                files:
                {
                    'dist/index.html': 'index.html' // Minify 'index.html' to 'dist/index.html'.
                }
            }
        },

        // Configuration for the 'imagemin' task.
        // This task optimizes images.
        imagemin:
        {
            build:
            {
                options:
                {
                    optimizationLevel: 3, // Optimization level (0-7).
                    progressive: true     // Progressive JPEGs.
                },
                /** Destination - Source mapping for image files. */
                files:
                {
                    // Uncomment the lines below to enable image optimization for specific files.
                    // 'dist/_ui/img/logo.png': '_ui/img/logo.png',
                    // 'dist/_ui/img/sprite.png': '_ui/img/sprite.png'
                }
            }
        },

        // Configuration for the 'uglify' task.
        // This task minifies JavaScript files.
        uglify:
        {
            options:
            {
                preserveComments: 'some', // Preserves comments starting with '!' or containing '@preserve', '@license', or '@cc_on'.
                banner: '/*! <%= pkg.name %> | <%= pkg.author.name %> */\n' // Adds a banner comment at the top of the minified file.
            },
            build:
            {
                /** Destination - Source mapping for JavaScript files. */
                files:
                {
                    'dist/_ui/js/script.js':  '_ui/js/script.js',   // Minify 'script.js'.
                    'dist/_ui/js/plugins.js': '_ui/js/plugins.js'   // Minify 'plugins.js'.
                }
            }
        },


        // Configuration for the 'cssmin' task.
        // This task minifies CSS files.
        cssmin:
        {
            with_banner:
            {
                options:
                {
                    banner: '/*! <%= pkg.name %> | <%= pkg.author.name %> */\n' // Adds a banner comment.
                },
                /** Destination - Source mapping for CSS files. */
                files:
                {
                    'dist/_ui/style.css': ['_ui/*.css'] // Minify all CSS files in '_ui/' to 'dist/_ui/style.css'.
                }
            }
        },

        // Configuration for the 'jshint' task.
        // This task lints JavaScript files.
        jshint:
        {
            all:
            [
                '_ui/js/script.js' // Files to lint.
            ],
            options:
            {
                curly: true,    // Require curly braces for all control statements.
                eqeqeq: true,   // Require triple equals.
                eqnull: true,   // Allow == null.
                browser: true,  // Define global browser variables.
                globals:
                {
                    jQuery: true,   // jQuery is a global.
                    console: true,  // console object is a global.
                    DevTools: true  // DevTools specific global.
                }
            }
        },


        // Configuration for the 'csslint' task.
        // This task lints CSS files.
        csslint:
        {
            dev:
            {
                options:
                {
                    "adjoining-classes": false,            // Don't warn about adjoining classes.
                    "box-sizing": false,                   // Don't warn about box-sizing.
                    "box-model": false,                    // Don't warn about box-model issues.
                    "compatible-vendor-prefixes": false,   // Don't warn about vendor prefix compatibility.
                    "empty-rules": false,                  // Don't warn about empty rules.
                    "font-sizes": false,                   // Don't warn about font sizes.
                    "floats": false,                       // Don't warn about floats.
                    "important": false,                    // Don't warn about !important usage.
                    "known-properties": false,             // Don't warn about unknown properties.
                    "outline-none": false,                 // Don't warn about outline: none.
                    "regex-selectors": false,              // Don't warn about regex selectors.
                    "star-property-hack": false,           // Don't warn about star property hacks.
                    "underscore-property-hack": false,     // Don't warn about underscore property hacks.
                    "universal-selector": false,           // Don't warn about universal selectors.
                    "unique-headings": false,              // Don't warn about unique headings.
                    "unqualified-attributes": false,       // Don't warn about unqualified attributes.

                    "display-property-grouping": true,     // Warn about display property grouping.
                    "display-property-grouping": true,     // Duplicate, but kept for Type I.
                    "overqualified-elements": true,        // Warn about overqualified elements.
                    "duplicate-properties": true,          // Warn about duplicate properties.
                    "text-indent": true,                   // Warn about text-indent issues.
                    "zero-units": true,                    // Warn about zero units.
                    "errors": true,                        // Report all errors.
                    "ids": true                            // Warn about ID selectors.
                },
                /** Source files for CSS linting. */
                src: '_ui/*.css' // All CSS files in the '_ui/' directory.
            }
        },


        // Configuration for the 'watch' task.
        // This task watches for file changes and runs specified tasks.
        watch:
        {
            scripts:
            {
                /** Source JavaScript files to watch. */
                files: ['_ui/js/script.js'], // Watch 'script.js'.
                tasks: ['jshint']            // Run 'jshint' task on changes.
            },
            styles:
            {
                /** Source CSS files to watch. */
                files: ['_ui/*.css'], // Watch all CSS files in '_ui/'.
                tasks: ['csslint']    // Run 'csslint' task on changes.
            }
        }
    });


    // Register default Grunt task for development.
    // This task runs JSHint, CSSLint, and then starts watching for file changes.
    grunt.registerTask( 'default', [ 'jshint', 'csslint', 'watch' ] );

    // Register 'lint' Grunt task.
    // This task simply runs JSHint and CSSLint once.
    grunt.registerTask( 'lint', [ 'jshint', 'csslint' ] );

    // Register 'build' Grunt task for production.
    // This task cleans the 'dist' directory, then minifies/optimizes HTML, JS, CSS, images, and copies other assets.
    grunt.registerTask( 'build', [ 'clean', 'htmlmin', 'uglify', 'cssmin', 'imagemin', 'copy' ] );
};