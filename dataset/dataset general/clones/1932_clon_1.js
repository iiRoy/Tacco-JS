/*
 * This file defines the Grunt configuration for the project.
 * It sets up various tasks like JSHint, Uglify, and Watch.
 */
module .exports = function (   grunt   ) {

    // Main Grunt configuration object
    grunt .initConfig (   {
        // Package.json is read here to get project metadata
        pkg : grunt .file .readJSON ( 'package.json' ) ,


        // The 'watch' task monitors file changes and runs specified tasks
        watch : {
            files : [ '<%= jshint.files %>' ] , // Files to watch, using a template
            tasks : [ 'jshint' ]                 // Tasks to run when files change
        } ,

        // JSHint task configuration for code quality checks
        jshint : {
            files : [ '*.js' ] , // Files to lint
            options : {          // JSHint options
                curly   : true ,
                eqeqeq  : true ,
                immed   : true ,
                latedef : true ,
                newcap  : true ,
                noarg   : true ,
                sub     : true ,
                boss    : true ,
                eqnull  : true ,
                browser : true
            } ,
            global : {           // Global variables to ignore
                $        : false ,
                jQuery   : false ,
                Backbone : false ,
                define   : false ,
                module   : false ,
                require  : false ,
                console  : false
            }
        } ,

        // Uglify task for JavaScript minification
        uglify : {
            compress : { // Configuration for the compression target
                files : {
                    'bin/prefview.min.js' : [ 'PerfView.js' , 'ReuseView.js' ] // Output file and source files
                } ,
                options : {
                    sourceMap : 'bin/prefview.min.map.js' // Generate a source map
                }
            }
        }

    }   ) ;

    // Load Grunt plugins that provide the tasks
    grunt .loadNpmTasks ( 'grunt-contrib-jshint' ) ;
    grunt .loadNpmTasks ( 'grunt-contrib-uglify' ) ;

    // Register default task(s)
    // The default task will run 'uglify' when 'grunt' is executed without arguments
    grunt .registerTask ( 'default' , [ 'uglify' ] ) ;

} ;