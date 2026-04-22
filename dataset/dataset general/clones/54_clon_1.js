module .exports = function ( grunt ) {
    // This is the main Grunt configuration function.
    // It takes the 'grunt' object as an argument.

    // Initialize Grunt configuration object.
    grunt . initConfig ( {

        /*
         *  Project package metadata
         *  Reads the package.json file to access project details.
         */
        pkg : grunt . file . readJSON ( "package.json" ) ,


        // Define metadata for the banner comment.
        meta : {
            // This banner will be prepended to output files.
            banner : "/*\n"
                   + " *  <%= pkg.title || pkg.name %> - v<%= pkg.version %>\n"
                   + " *  <%= pkg.description %>\n"
                   + " *  <%= pkg.homepage %>\n"
                   + " *\n"
                   + " *  Made by <%= pkg.author.name %>\n"
                   + " *  Under <%= pkg.licenses %> License\n"
                   + " */\n"
        } , // End of 'meta' configuration.


        // Configuration for CoffeeLint, a linter for CoffeeScript files.
        coffeelint : {
            app : [ "src/labelholder.coffee" ] // Lint this specific file.
        } , // End of 'coffeelint' configuration.


        // Configuration for Less compilation.
        less : {
            // Development build settings.
            development : {
                files : {
                    "dist/labelholder.css" : "src/less/labelholder-standalone.less" // Output to dist, from src.
                }
            } ,
            // Distribution build settings (minified).
            dist : {
                files : {
                    "dist/labelholder.min.css" : "src/less/labelholder-standalone.less" // Minified output.
                } ,
                options : {
                    compress   : true , // Enable CSS compression.
                    optimization : 2    // Set optimization level.
                }
            }
        } , // End of 'less' configuration.


        // Configuration for Autoprefixer to add vendor prefixes to CSS.
        autoprefixer : {
            override : {
                src : 'dist/*.css' // Apply autoprefixing to all CSS files in 'dist'.
            }
        } , // End of 'autoprefixer' configuration.


        // Configuration for UglifyJS to minify JavaScript files.
        uglify : {
            my_target : {
                src  : [ "dist/labelholder.js" ] , // Source JavaScript file.
                dest : "dist/labelholder.min.js"    // Destination for minified file.
            }
        } , // End of 'uglify' configuration.


        // Configuration for CoffeeScript compilation.
        coffee : {
            compile : {
                files : {
                    "dist/labelholder.js" : "src/labelholder.coffee" // Compile CoffeeScript to JavaScript.
                }
            }
        } , // End of 'coffee' configuration.


        // Configuration for grunt-banner to add file banners.
        usebanner : {
            setBanners : {
                options : {
                    position  : 'top' ,         // Place banner at the top of the file.
                    banner    : '<%= meta.banner %>' , // Use the banner defined in 'meta'.
                    linebreak : true            // Add a newline after the banner.
                } ,
                files : {
                    src : [ 'dist/*' ] // Apply banner to all files in the 'dist' directory.
                }
            }
        } , // End of 'usebanner' configuration.


        // Configuration for grunt-contrib-watch to monitor file changes.
        watch : {
            files : [ 'src/*' ] , // Watch all files in the 'src' directory.
            tasks : [ 'default' ] // Run the 'default' task when changes are detected.
        } // End of 'watch' configuration.

    } ) ; // End of grunt.initConfig call.


    // Load Grunt plugins. These lines make the tasks available.

    grunt . loadNpmTasks ( "grunt-coffeelint" ) ;


    grunt . loadNpmTasks ( "grunt-contrib-uglify" ) ;


    grunt . loadNpmTasks ( "grunt-contrib-coffee" ) ;


    grunt . loadNpmTasks ( "grunt-contrib-watch" ) ;


    grunt . loadNpmTasks ( "grunt-contrib-less" ) ;


    grunt . loadNpmTasks ( 'grunt-banner' ) ;


    grunt . loadNpmTasks ( 'grunt-autoprefixer' ) ;


    // Register the default task.
    // This task runs a sequence of other tasks when 'grunt' is called without arguments.
    grunt . registerTask ( "default" , [ "less" , "autoprefixer" , "coffeelint" , "coffee" , "uglify" , "usebanner" ] ) ;

} ; // End of module.exports function.
// This marks the end of the Gruntfile.js configuration.