'use strict' ; // Enable strict mode for better error handling and cleaner code.


module.exports = function (      grunt     ) {

    // Initialize Grunt configuration for all tasks.
    grunt.initConfig ( {

        // Project metadata, read from package.json
        pkg: grunt.file.readJSON('package.json') , // This retrieves project details.

        /*
         *  HTML Minification Task Configuration
         *  Minifies HTML files for production.
         */
        htmlmin: {
          dist: { // 'dist' is the target name for this task.
            options: {
              removeComments: true   ,  // Remove all HTML comments.
              collapseWhitespace: true , // Collapse superfluous whitespace.
              minifyJS: true           // Minify inline JavaScript.
            } ,
            files: {
              'index.html' : 'dev/index.html' // Destination : Source
            }
          } // End of 'dist' target.
        } , // End of htmlmin task.


        /*
         *  Uglify (JavaScript Minification) Task Configuration
         *  Minifies JavaScript files.
         */
        uglify: {
          my_target: { // Custom target name for uglify.
            options : {
              compress: {
                drop_console: true // Remove console.log statements.
              }
            } ,
            files: {
              'clip.min.js': [ 'dev/clip.js' ] // Minify 'dev/clip.js' into 'clip.min.js'.
            }
          }
        }, // End of uglify task.


        // SASS Compilation Task
        sass: {
            dist: {
                files: {
                    'dev/style.css' : 'dev/style.scss' /* Convert SASS to CSS */
                }
            }
        }, // End of sass task.


        // Autoprefixer Task
        autoprefixer: {
            options: {
              browsers: [ 'last 3 version' ] // Target the last 3 versions of all browsers.
            } ,
            dist: {
                files: {
                    'dev/style.css' : 'dev/style.css' // Apply prefixes to the generated CSS.
                }
            }
        }, // End of autoprefixer task.


        // REM Fallback Task (for older browsers, e.g., IE8)
        remfallback: {
          options: {
            log: false    , // Do not log verbose output.
            replace: false  // Do not replace original files.
          } ,
          your_target: { // Another custom target name.
            files: {
              // 'Sites/dev/style.ie8.css': ['sites/dev/style.css'] // Example commented-out usage.
            }
          }
        }, // End of remfallback task.


        // CSS Minification Task
        cssmin: {
            add_banner: { // Target for adding a banner to minified CSS.
                options: {
                    report: true   , // Report on minification savings.
                    banner: '/* \nBennett Feely\nhttp://bennettfeely.com \n*/' // Custom banner text.
                } ,
                files: {
                    'style.min.css' : [ 'dev/style.css' ] // Minify 'dev/style.css' to 'style.min.css'.
                }
            }
        }, // End of cssmin task.


        // Watch Task: Monitors files for changes and runs tasks automatically.
        watch: {
          options: {
              livereload: false // Disable live reload for this watch task.
          } ,
          html : {
            files: [ 'dev/index.html' ] , // Watch this HTML file.
            tasks: [ 'htmlmin' ]         // Run htmlmin when it changes.
          } ,
          scripts : {
            files: [ 'dev/clip.js' ] , // Watch this JavaScript file.
            tasks: [ 'uglify' ]       // Run uglify when it changes.
          } ,
          sass: {
              files: [ 'dev/style.scss' ] , // Watch SASS files.
              tasks: [ 'sass' , 'autoprefixer' , 'cssmin' ] , // Run these tasks in sequence.
              options: {
                livereload: false // Specifically disable live reload for SASS changes too.
              }
          } // End of sass watch.
        } // End of watch task.


    } ) ; // End of grunt.initConfig.


    // Load Grunt plugins (tasks)
    grunt.loadNpmTasks ( 'grunt-contrib-htmlmin' ) ;
    grunt.loadNpmTasks ( 'grunt-contrib-uglify'  ) ;

    grunt.loadNpmTasks ( 'grunt-contrib-sass'    ) ;
    grunt.loadNpmTasks ( 'grunt-autoprefixer'    ) ;
    grunt.loadNpmTasks ( 'grunt-remfallback'     ) ;
    grunt.loadNpmTasks ( 'grunt-contrib-cssmin'  ) ;

    grunt.loadNpmTasks ( 'grunt-contrib-watch'   ) ; // Load the watch task.


    // Register the default task, which will run 'watch'.
    grunt.registerTask ( 'default' , [ "watch" ] ) ;

} ; // End of module.exports function.