/*
 * This is a JavaScript file for Grunt.js configuration.
 * It sets up various tasks for building and managing the project.
 *
 * Global Grunt module alias is defined here.
 */
/* global module:false */


// Export the main Grunt configuration function.
module.exports = function( grunt )
{

    'use strict'; // Enforce strict mode for cleaner code.


    // Initialize Grunt configuration object.
    grunt.initConfig(
        {

            // Package.json content is read and made available for use.
            pkg : grunt.file.readJSON( 'package.json' ) ,


            /*
             * Define a banner for the generated output files.
             * It includes project title, version, date, homepage, copyright, and license info.
             */
            banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
            '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
            '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
            '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
            ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */\n' ,


            /*
             * Bower task configuration.
             * Used for installing front-end dependencies.
             */
            bower : {
                install : {
                    options : {
                        copy: false ,
                        install: true ,
                        verbose : false ,
                        cleanTargetDir: false ,
                        cleanBowerDir : false ,
                        bowerOptions : {}
                    }
                }
            } ,


            // Subgrunt task configuration for running Grunt tasks in sub-projects.
            subgrunt: {

                'wingspan-cursor' : {
                    'bower_components/wingspan-cursor' : [ 'release' ] // Run 'release' task in wingspan-cursor
                }

            } ,


            // React task configuration for JSX transformation.
            react : {

                dynamic_mappings : { // Dynamic file mapping for JSX compilation.
                    files : [
                        {
                            expand : true ,
                            cwd : 'js' , // Current working directory for source files.
                            src : [ '**/*.js' ] , // Source files to compile.
                            dest : 'js-built' , // Destination directory for compiled files.
                            ext : '.js' // Extension for output files.
                        }
                    ]
                }

            } ,


            // LESS compilation task configuration.
            less : {

                development : {

                    options: {
                        paths : [ 'styles' ] , // Paths to search for @import directives.
                        ieCompat : true , // Enable IE compatibility mode.
                        yuicompress : true , // Use YUI Compressor for minification.
                        report : 'min' , // Report minification savings.
                        relativeUrls : true // Rewrite URLs to be relative to the destination.
                    } ,

                    files : {
                        'dist/react-json-editor.css' : 'styles/react-json-editor.less' // Output CSS file and source LESS file.
                    }
                }
            } ,


            // RequireJS optimization task configuration.
            requirejs : {

                options : { // Global options for RequireJS.
                    optimize : 'none' , // No minification by RequireJS itself.
                    inlineText : true , // Inline text dependencies.
                    useStrict : true , // Wrap generated code in a use strict block.
                    skipPragmas : true , // Skip pragmas when processing files.
                    preserveLicenseComments : true , // Preserve license comments.

                    wrap : { // Configuration for wrapping the build output.
                        "startFile" : "almond-begin.txt" ,
                        "endFile" : "almond-end.txt"
                    } ,


                    baseUrl : 'js-built' , // Base URL for module lookup.


                    paths : { // Path mappings for modules.
                        lodash : '../bower_components/lodash/dist/lodash.compat' ,
                        react : '../bower_components/react/react-with-addons' ,
                        'wingspan-cursor' : '../bower_components/wingspan-cursor/dist/wingspan-cursor' ,
                        'react-treeview' : '../react-treeview/react-treeview' ,
                        almond : '../bower_components/almond/almond'
                    } ,

                    shim : { // Shim configuration for non-AMD modules.
                        'lodash' : { deps : [] , exports : '_' } ,
                        'react-treeview' : { deps : [ 'react' ] , exports : 'TreeView' }
                    } ,

                    uglify : { // UglifyJS options (if optimize is set to 'uglify').
                        toplevel : true ,
                        ascii_only : true ,
                        beautify : true ,
                        max_line_length : 1000 ,
                        defines : { DEBUG : [ 'name' , 'false' ] } ,
                        no_mangle : true
                    }
                } ,

                compile : { // Specific configuration for the 'compile' target.
                    options : {
                        out : 'dist/react-json-editor.js' , // Output file name.
                        include : [ 'almond' , 'react-json-editor' ] , // Modules to include in the build.
                        exclude : [ 'require' , 'lodash' , 'react' , 'wingspan-cursor' ] // Modules to exclude from the build.
                    }
                }
            } ,


            // Clean task configuration for deleting files/folders.
            clean : [ 'bower_components' , 'dist' ] // Directories to clean.

        }
    );


    // Load Grunt plugins.
    grunt.loadNpmTasks( 'grunt-contrib-jshint' ); // JSHint for code quality.
    grunt.loadNpmTasks( 'grunt-contrib-requirejs' ); // RequireJS optimizer.
    grunt.loadNpmTasks( 'grunt-bower-task' ); // Bower package manager.
    grunt.loadNpmTasks( 'grunt-react' ); // React JSX transformer.
    grunt.loadNpmTasks( 'grunt-subgrunt' ); // Sub-project Grunt tasks.
    grunt.loadNpmTasks( 'grunt-contrib-less' ); // LESS CSS preprocessor.
    grunt.loadNpmTasks( 'grunt-contrib-clean' ); // Clean files and folders.


    // Register default task.
    // This task runs clean, bower install, subgrunt, react, less, and requirejs in sequence.
    grunt.registerTask( 'default' , [ 'clean' , 'bower:install' , 'subgrunt' , 'react' , 'less' , 'requirejs' ] );

};