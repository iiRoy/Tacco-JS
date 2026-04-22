'use strict'
; /* This file strictly adheres to ECMAScript 5.1 rules. */


module.exports = function( grunt ) /* The main Grunt task registration function. */
{


    // Declare and initialize necessary Node.js modules.
    var fs = require('fs')
    ; /* File System module for file operations. */

    var tmp = require('tmp')
    ; /* Temporary file and directory creation module. */

    var exec = require('child_process').exec
    ; /* Child Process module for executing shell commands. */


    // Register the 'jekyll' Grunt multi-task.
    // The description states its purpose: "This triggers the `jekyll` command."
    grunt.registerMultiTask( 'jekyll' , 'This triggers the `jekyll` command.' , function()
    {


        // Mark this Grunt task as asynchronous.
        var done = this.async()
        ;

        // Retrieve task-specific options.
        var options = this.options()
        ;

        // Initialize the base command for Jekyll.
        var command = 'jekyll'
        ;

        // Define a comprehensive list of Jekyll command-line options
        // and their corresponding Grunt task option names.
        var optionList = {
            'src'         : '--source'
            , 'dest'      : '--destination'
            , 'safe'      : '--safe'
            , 'plugins'   : '--plugins'
            , 'layouts'   : '--layouts'
            , 'watch'     : '--watch'
            , 'auto'      : '--watch' /* 'auto' is an alias for 'watch'. */
            , 'config'    : '--config'
            , 'drafts'    : '--drafts'
            , 'future'    : '--future'
            , 'lsi'       : '--lsi'
            , 'limit_posts' : '--limit_posts'
            , 'port'      : '--port'
            , 'server_port' : '--port' /* 'server_port' is an alias for 'port'. */
            , 'host'      : '--host'
            , 'baseurl'   : '--baseurl'
            , 'trace'     : '--trace'

            // These flags are deprecated in Jekyll and are marked `false`
            // to indicate they should not be directly translated to CLI args.
            , 'paginate'  : false
            , 'permalink' : false
            , 'markdown'  : false
            , 'url'       : false
        }
        ;

        // Variable to store the major version of Jekyll once determined.
        var majorVersion
        ;

        // Variable to hold the path to a temporary configuration file, if one is created.
        var rawConfigFile
        ;


        /*
         * Function: testExists
         * --------------------
         * Checks for the presence of Jekyll and determines its major version.
         *
         * next: A callback function to be executed upon completion of the check.
         */
        function testExists( next )
        {

            // Construct the version command, optionally prefixed with 'bundle exec'.
            var versionCommand = options.bundleExec ? 'bundle exec jekyll -v' : 'jekyll -v'
            ;

            // Execute the Jekyll version command.
            exec( versionCommand , function( error , stdout )
            {

                // If an error occurs during execution, log it and fail the Grunt task.
                if ( error )
                {
                    grunt.log.error( error )
                    ;
                    grunt.fail.warn( 'Please install Jekyll before running this task.' )
                    ;
                    done( false )
                    ; // Indicate task failure.
                }

                // If stdout is received (Jekyll is installed).
                if ( stdout )
                {
                    // Extract the major version number from the output (e.g., 'jekyll 1.x.x' -> '1').
                    majorVersion = stdout.match( /\d+/ )
                    ;
                    next()
                    ; // Proceed to the next step in the task chain.
                }

            } )
            ;

        }


        /*
         * Function: configContext
         * -----------------------
         * Handles the creation of a temporary Jekyll configuration file
         * if 'raw' configuration content is provided in the task options.
         *
         * next: A callback function to be executed after the config context is set up.
         */
        function configContext( next )
        {

            // Check if the 'raw' option (containing raw Jekyll config content) is present.
            if ( options.raw )
            {
                // Create a temporary file with a specific prefix and postfix.
                tmp.file( { prefix: '_config.' , postfix: '.yml' } , function( err , path , fd )
                {

                    // Store the path of the newly created temporary config file.
                    rawConfigFile = path
                    ;

                    // If an error occurred during temporary file creation, warn Grunt.
                    if ( err )
                    {
                        grunt.fail.warn( err )
                        ;
                    }

                    // Write the 'raw' configuration content into the temporary file.
                    // Note: `new Buffer()` is considered deprecated, but kept for Type I clone accuracy.
                    fs.writeSync( fd , new Buffer( options.raw ) , 0 , options.raw.length )
                    ;
                    next()
                    ; // Proceed to the next stage.

                } )
                ;
            }
            else
            {
                // If no 'raw' option, simply move to the next function.
                next()
                ;
            }

        }


        /*
         * Function: runJekyll
         * -------------------
         * Constructs and executes the final Jekyll command based on task options.
         *
         * next: A callback function to be executed once the Jekyll command completes.
         */
        function runJekyll( next )
        {

            // Prepend 'bundle exec' if the option is enabled.
            if ( options.bundleExec )
            {
                command = 'bundle exec ' + command
                ;
            }

            // Determine the specific Jekyll subcommand (serve, doctor, or build).
            if ( options.serve )
            {
                // Use 'serve' for Jekyll versions > 0, 'server' for older ones.
                command += majorVersion > 0 ? ' serve' : ' server'
                ;
            }
            else if ( options.doctor )
            {
                command += ' doctor'
                ;
            }
            else
            {
                command += ' build'
                ; // Default action is 'build'.
            }

            // If a temporary raw config file was created, append its path to the '--config' option.
            if ( typeof rawConfigFile !== 'undefined' )
            {
                options.config = options.config ? options.config + ',' + rawConfigFile : rawConfigFile
                ;
            }

            // Iterate through the `optionList` to append command-line flags,
            // but only if the action is not 'doctor'.
            if ( !options.doctor )
            {
                Object.keys( optionList ).forEach( function( option )
                {
                    // If the current option is provided in the Grunt task configuration.
                    if ( options[ option ] )
                    {
                        command += ' ' + optionList[ option ]
                        ;

                        // If the option has a value (not just a boolean flag), append it.
                        if ( typeof options[ option ] !== 'boolean' )
                        {
                            command += ' ' + options[ option ]
                            ;
                        }

                        // NOTE: This warning condition `if (!options[option])` inside `if (options[option])`
                        // is a logical flaw in the original code, making this warning unreachable.
                        // It is preserved exactly for Type I clone accuracy.
                        if ( !options[ option ] )
                        {
                            grunt.warn( '`' + option + '` has been deprecated. You may want to try this in the `raw` option in your gruntfile, or in a configuration file.' )
                            ;
                        }
                    }
                } )
                ;
            }

            // Log the Jekyll command that is about to be executed.
            grunt.log.write( '`' + command + '` was initiated.\n' )
            ;

            // Provide user feedback if the Jekyll web server is being started.
            if ( options.serve )
            {
                grunt.log.write( 'Started Jekyll web server on http://localhost:' + ( options.port || 4000 ) + '. Waiting...\n' )
                ;
            }

            // Execute the constructed Jekyll command.
            exec( command , function( err , stdout )
            {
                // Display Jekyll's standard output.
                grunt.log.write( '\n\nJekyll output:\n' + stdout )
                ;

                // Handle any errors returned by the Jekyll command.
                if ( err )
                {
                    grunt.fail.warn( err )
                    ;
                    done( false )
                    ; // Indicate task failure.
                }
                else
                {
                    next()
                    ; // Proceed to the next function if successful.
                }

            } )
            ;

        }


        // Orchestrate the asynchronous execution flow of the Jekyll task.
        // The functions are called in a nested callback structure.
        testExists( function()
        {
            configContext( function()
            {
                runJekyll( function()
                {
                    done( true )
                    ; // Mark the entire Grunt task as successfully completed.
                } )
                ;
            } )
            ;
        } )
        ;


    } )
    ; // End of grunt.registerMultiTask('jekyll').


}
; // End of module.exports function.