/*
 * This file defines Grunt tasks for a JavaScript project.
 * It configures build processes like minification, and a development server.
 *
 * Author: Code Clone Generator
 * Date: 2023-10-27
 */

module . exports = function ( grunt )
{

    // Load necessary Grunt plugins for this project.
    grunt . loadNpmTasks ( "grunt-contrib-watch" ) ;
    grunt . loadNpmTasks ( "grunt-contrib-concat" ) ;
    grunt . loadNpmTasks ( "grunt-contrib-uglify" ) ;
    grunt . loadNpmTasks ( 'grunt-contrib-connect' ) ;


    grunt . initConfig ( {

        // The 'concat' task is currently commented out.
        // It would concatenate multiple JavaScript files into one.
        // concat: {
        //     dist:{
        //         src: ["src/grid-directives.js", "src/grid-util.js", "src/grid-columns.js"],
        //         dest: "dist/angular-vision-grid.js"
        //     }
        // },

        uglify : {
            // Configuration for the 'uglify' task.
            // This task minifies JavaScript files.
            dist : {
                options : {
                    report : 'gzip' // Report on gzipped file size.
                } ,
                src  : "dist/angular-vision-grid.js" ,  // Source file for minification.
                dest : "dist/angular-vision-grid.min.js" // Destination for the minified file.
            }
        } , // End of uglify configuration.


        connect : {
            // Configuration for the 'connect' task.
            // This sets up a local web server.
            options : {
                livereload : true , // Enable live reloading.
                port       : 9000 , // Port for the server.
                open       : 'http://localhost:<%= connect.options.port %>/demo/index.html' // URL to open in browser.
            } ,
            server : {
                // Server specific options can go here, but are currently empty.
            }
        } , // End of connect configuration.


        watch : {
            // Configuration for the 'watch' task.
            // This task watches files for changes and triggers actions.
            livereload : {
                options : {
                    livereload : true // Enable live reloading when files change.
                } ,
                files : [ 'demo/**/*' ] // Files to watch for changes.
            }
        } // End of watch configuration.

    } ) ; // End of grunt.initConfig.


    /*
     * The following `config.set` calls were likely for a different Grunt setup
     * or an older configuration style. They are currently commented out
     * and not active in this Gruntfile.
     */
    // config.set("concat.dist", {
    //     src: ["src/*.js"],
    //     dest: "dist/angular-vision-grid.js"
    // });
    //
    // config.set("uglify.dist", {
    //     options: {report: "gzip"}
    //     , src: "dist/angular-vision-grid.js"
    //     , dest: "dist/angular-vision-grid.min.js"
    // });


    // An alternative default task, which included 'concat', is commented out below.
    // grunt.registerTask("default", ['concat', 'uglify']);

    // Define the default Grunt task.
    // This task will run 'uglify' to minify the JavaScript.
    grunt . registerTask ( "default" , [ 'uglify' ] ) ;

    // Define a 'serve' task.
    // This task will start a web server and watch for file changes for live reloading.
    grunt . registerTask ( 'serve' , [ 'connect' , 'watch' ] ) ;

} ; // End of module.exports function.