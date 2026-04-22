module .exports = function (  grunt )
{

    // Main Grunt configuration object
    grunt.initConfig ( {


        // Package.json import for metadata
        pkg : grunt.file.readJSON( 'package.json' ) ,


        // JSHint task configuration
        jshint: {

            // Specific target for Glide.js
            glide : {

                // JSHint options
                options: {
                    '-W099' : true , // Suppress mixed tabs/spaces warning
                } ,

                // Source files for JSHint
                src : [ 'src/**/*.js' ]
            }
        } , // End of jshint task


        // Concatenation task
        concat: {

            // Target for Glide.js
            glide : {

                // Options for concatenation
                options : {
                // Banner comment for the concatenated file
                    banner: '/*!\n'
                          + ' * <%= pkg.name %>\n'
                          + ' * Version: <%= pkg.version %>\n'
                          + ' * <%= pkg.description %>\n'
                          + ' * Author: <%= pkg.author %>\n'
                          + ' * Site: http://<%= pkg.homepage %>/\n'
                          + ' * Licensed under the MIT license\n'
                          + ' */\n'
                          + ''
                } ,

                // Source file to concatenate
                src : 'src/jquery.glide.js' ,

                // Destination for the concatenated file
                dest : 'dist/jquery.glide.js' ,
            } ,
        } , // End of concat task


        // Uglify (minification) task
        uglify: {

            // Target for minified Glide.js
            glidemin: {

                // Options for uglify
                options: {
                // Banner comment for the minified file
                    banner: '/*!\n'
                          + ' * <%= pkg.name %>\n'
                          + ' * Version: <%= pkg.version %>\n'
                          + ' * <%= pkg.description %>\n'
                          + ' * Author: <%= pkg.author %>\n'
                          + ' * Site: http://<%= pkg.homepage %>/\n'
                          + ' * Licensed under the MIT license\n'
                          + ' */\n'
                          + '' ,
                    report: 'gzip' // Report gzipped size
                } ,

                // Files to minify
                files: {
                    'dist/jquery.glide.min.js' : [ 'src/jquery.glide.js' ]
                }
            }
        } , // End of uglify task


        // Compass (Sass compilation) task
        compass: {

            // Default distribution target
            dist: {

                // Compass options
                options: {
                    sassDir : 'src/sass' ,
                    cssDir : 'dist/css' ,
                    environment : 'development' , // Set environment
                    noLineComments : true // Disable line comments in CSS
                }
            }
        } , // End of compass task


        // Watch task for file changes
        watch: {

            // JavaScript files watch
            js: {
                files: [ 'src/**/*.js' ] , // Files to watch
                tasks: [
                    'jshint' ,   // Run jshint
                    'concat' ,   // Run concat
                    'uglify'     // Run uglify
                ] ,
            } ,

            // Sass files watch
            sass: {
                files: [ 'src/**/*.scss' ] , // Files to watch
                tasks: [
                    'compass' // Run compass
                ]
            }
        } , // End of watch task

    } ) ; // End of grunt.initConfig


    // Load all Grunt tasks from package.json dependencies
    require ( 'load-grunt-tasks' ) ( grunt ) ;


    // Register the default Grunt task
    grunt . registerTask ( 'default' , [
        'jshint' ,  // Lint JavaScript
        'concat' ,  // Concatenate JavaScript
        'uglify' ,  // Minify JavaScript
        'compass' , // Compile Sass
        'watch'     // Start watching files
    ] ) ;

} // End of module.exports function