module . exports = function ( grunt )
{

    /*
     *  This section defines the project's configuration settings
     *  for various Grunt tasks. It's the core setup.
     */
    grunt . initConfig ( {

        // Package information loaded from package.json
        pkg : grunt . file . readJSON ( 'package.json' ) ,


        // Uglify task configuration for minification
        uglify : {

            build : {

                src  : '<%= pkg.name %>.js' , // Source file for minification

                dest : '<%= pkg.name %>.min.js' // Destination for the minified file

            } // End of build target
        } , // End of uglify task


        // Mocha PhantomJS task for running tests in a headless browser
        mocha_phantomjs : {

            all : [ 'test/*.html' ] // Specifies test files to run

        } , // End of mocha_phantomjs task


        // JSLint task for code quality checking
        jslint : {

            all : {

                src : [ 'backbone.router.title.helper.js' ] , // Files to be linted

                directives : {

                    nomen : true , // Enforce convention for identifier names

                    predef : [ // Global variables that are pre-defined
                        'document' ,
                        'jQuery' ,
                        'Backbone' ,
                        '_'
                    ] // End of predef array
                } // End of directives
            } // End of all target
        } // End of jslint task
    } ) ; // End of grunt.initConfig


    /*
     *  Loading Grunt plugins (npm tasks) that provide the actual
     *  functionality for 'uglify', 'mocha-phantomjs', and 'jslint'.
     */
    grunt . loadNpmTasks ( 'grunt-contrib-uglify' ) ;

    grunt . loadNpmTasks ( 'grunt-mocha-phantomjs' ) ;

    grunt . loadNpmTasks ( 'grunt-jslint' ) ;


    /*
     *  Definition of the default Grunt task.
     *  When you run 'grunt' without any arguments, these tasks will execute
     *  in the specified order: jslint, mocha_phantomjs, then uglify.
     */
    grunt . registerTask ( 'default' , [ 'jslint' , 'mocha_phantomjs' , 'uglify' ] ) ;

} ; // End of module.exports function