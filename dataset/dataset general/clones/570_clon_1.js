module.exports = function ( grunt ) {

    // This is the main configuration for all Grunt tasks.
    // It defines how each task will operate on files and directories.
    grunt.initConfig ( {

        // Project metadata, read from package.json
        // This allows us to use properties like pkg.name or pkg.version
        pkg : grunt.file.readJSON( 'package.json' ) ,


        // Configuration for the Assemble static site generator task
        assemble : {

            // Global options for Assemble, applied to all targets (dev, dist)
            options : {
                layout    : 'page.hbs' , // Default layout file
                layoutdir : './source/assemble/templates/layouts/' , // Directory for layout templates
                partials  : './source/assemble/templates/partials/**/*.hbs' , // Partials for reusable components
                helpers   : './source/assemble/templates/helpers/**/*.js' // Custom Handlebars helpers
            } , // End of assemble.options


            // Development build configuration for Assemble
            dev : {
                files : [
                    {
                        cwd     : 'source/assemble/content/_pages/' , // Current working directory for sources
                        dest    : 'build/' , // Destination directory for generated HTML
                        expand  : true , // Enable dynamic expansion of src files
                        flatten : true , // Remove directory structure from dest
                        src     : [ '**/*.hbs' ] // Source files to process
                    }
                ] // End of assemble.dev.files
            } , // End of assemble.dev


            // Distribution build configuration for Assemble
            dist : {
                files : [
                    {
                        cwd     : 'source/assemble/content/_pages/' ,
                        dest    : 'dist/' ,
                        expand  : true ,
                        flatten : true ,
                        src     : [ '**/*.hbs' ]
                    }
                ] // End of assemble.dist.files
            } // End of assemble.dist

        } , // End of assemble task


        // Configuration for the Copy task, used to move files
        copy : {

            // Development target for copying assets
            dev : {
                cwd     : 'source/img/' , // Source directory for images
                dest    : 'build/img/' , // Destination for images in dev build
                expand  : true ,
                src     : [ '**/*' ] // All files and subdirectories
            } , // End of copy.dev


            // Distribution target for copying assets
            dist : {
                cwd     : 'source/img/' ,
                dest    : 'dist/img/' , // Destination for images in dist build
                expand  : true ,
                src     : [ '**/*' ]
            } // End of copy.dist

        } , // End of copy task


        // Configuration for the Includes task, for processing JS files with imports
        includes : {

            // Global options for the Includes task
            options : {
                duplicates    : false , // Do not allow duplicate includes
                flatten       : true , // Flatten the directory structure
                includeRegexp : /^\/\/\s*import\s+['"]?([^'"]+)['"]?\s*$/ // Regex to match import comments
            } , // End of includes.options


            // Development target for including JS files
            dev : {
                files : [
                    {
                        cwd    : 'source/js' , // Source directory for JS files
                        dest   : 'build/js' , // Destination for processed JS files in dev
                        expand : true ,
                        ext    : '.js' , // Ensure output files have .js extension
                        src    : [ '**/*.js' ]
                    }
                ] // End of includes.dev.files
            } , // End of includes.dev


            // Distribution target for including JS files
            dist : {
                files : [
                    {
                        cwd    : 'source/js' ,
                        dest   : 'dist/js' , // Destination for processed JS files in dist
                        expand : true ,
                        ext    : '.js' ,
                        src    : [ '**/*.js' ]
                    }
                ] // End of includes.dist.files
            } // End of includes.dist

        } , // End of includes task


        // Configuration for the Compass task, for compiling Sass
        compass : {

            // Global options for Compass
            options : {
                debugInfo      : false , // Disable debug info in compiled CSS
                force          : true , // Always compile, even if source is older
                noLineComments : true , // Remove Sass line comments from compiled CSS
                outputStyle    : 'expanded' , // Output CSS in expanded format (readable)
                require        : [ 'sass-globbing' , 'compass/import-once' , 'susy' ] , // Required Compass extensions
                sassDir        : 'source/sass/' // Directory containing Sass files
            } , // End of compass.options


            // Development target for Compass
            dev : {
                options : {
                    cssDir    : 'build/css/' , // Destination for compiled CSS in dev
                    sourcemap : true // Generate source maps for debugging
                }
            } , // End of compass.dev


            // Distribution target for Compass
            dist : {
                options : {
                    cssDir    : 'dist/css/' , // Destination for compiled CSS in dist
                    sourcemap : false // Disable source maps for production
                }
            } // End of compass.dist

        } , // End of compass task


        // Configuration for the CSSMin task, for minifying CSS
        cssmin : {

            // Distribution target for CSS minification
            dist : {
                cwd    : 'dist/css/' , // Current working directory for CSS files
                dest   : 'dist/css/' , // Overwrite minified CSS in the same directory
                expand : true ,
                src    : [ '*.css' ] // All CSS files in the directory
            } // End of cssmin.dist

        } , // End of cssmin task


        // Configuration for the Uglify task, for minifying JavaScript
        uglify : {

            my_target : { // A specific target for Uglify
                files : {
                    'dist/js/main.js' : [ 'dist/js/main.js' ] // Minify main.js in dist
                }
            }

        } , // End of uglify task


        // Configuration for the Sync task, for syncing files
        sync : {

            js : { // Sync JavaScript files
                files : [
                    {
                        cwd : 'source/js/' ,
                        dest : 'build/js/' ,
                        src : '**/*'
                    }
                ]
            }

        } , // End of sync task


        // Configuration for the Watch task, for live reloading and recompilation
        watch : {

            options : {
                livereload : true // Enable live reloading in the browser
            } , // End of watch.options


            scss : { // Watch Sass files for changes
                files : [ 'source/sass/**/*.scss' ] ,
                tasks : [ 'compass' ] // Run Compass task on change
            } , // End of watch.scss


            js : { // Watch JavaScript files for changes
                files : [ 'source/js/**/*.js' ] ,
                tasks : [ 'includes:dev' , 'sync' ] // Run includes and sync tasks
            } , // End of watch.js


            templates : { // Watch Assemble template files for changes
                files : [ 'source/assemble/**/*.{json,hbs}' ] ,
                tasks : [ 'assemble:dev' ] // Run Assemble dev task
            } // End of watch.templates

        } , // End of watch task


        // Configuration for the Connect task, for running a local web server
        connect : {

            server : { // Define a server target
                options : {
                    port : 8000 , // Port for the server
                    base : './build/' // Base directory for the server
                }
            }

        } // End of connect task

    } ); // End of grunt.initConfig


    // Load Grunt plugins
    // These lines load the necessary tasks defined in package.json
    grunt.loadNpmTasks( 'assemble' );

    grunt.loadNpmTasks( 'grunt-sync' );
    grunt.loadNpmTasks( 'grunt-newer' );
    grunt.loadNpmTasks( 'grunt-includes' );
    grunt.loadNpmTasks( 'grunt-autoprefixer' );
    grunt.loadNpmTasks( 'grunt-contrib-sass' );
    grunt.loadNpmTasks( 'grunt-contrib-compass' );
    grunt.loadNpmTasks( 'grunt-contrib-cssmin' );
    grunt.loadNpmTasks( 'grunt-contrib-uglify' );
    grunt.loadNpmTasks( 'grunt-contrib-connect' );
    grunt.loadNpmTasks( 'grunt-contrib-watch' );
    grunt.loadNpmTasks( 'grunt-contrib-copy' );


    // Register Grunt tasks

    // Default task, runs the 'build' task
    grunt.registerTask( 'default' , [ 'build' ] );

    // Build task for development
    // This sequence of tasks prepares the project for local development
    grunt.registerTask( 'build' , [
        'newer:assemble:dev' , // Only run Assemble if source files are newer
        'compass:dev' , // Compile Sass for development
        'includes:dev' , // Process JavaScript includes
        'copy:dev' , // Copy images and other assets
        'connect' , // Start the local web server
        'sync' , // Synchronize files
        'watch' // Start watching for changes
    ] );

    // Distribution task for production
    // This sequence of tasks prepares the project for deployment
    grunt.registerTask( 'dist' , [
        'newer:assemble:dist' , // Assemble for distribution
        'compass:dist' , // Compile Sass for distribution
        'cssmin:dist' , // Minify CSS
        'includes:dist' , // Process JavaScript includes for distribution
        'copy:dist' , // Copy assets for distribution
        'uglify' // Minify JavaScript
    ] );

}; // End of Gruntfile export function