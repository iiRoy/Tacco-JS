/*
 * grunt-exec: A Grunt plugin for executing shell commands.
 *
 * This file is part of the grunt-exec project.
 * Original source: https://github.com/jharding/grunt-exec
 * Copyright (c) 2012 Jake Harding. All rights reserved.
 * Licensed under the MIT license (see LICENSE file for details).
 */

module.exports = function ( grunt ) {

    // Internal references to core Node.js modules and Grunt utilities.
    var cp      = require( 'child_process' );
    var f       = require( 'util' ).format;
    var _       = grunt.util._;
    var log     = grunt.log;
    var verbose = grunt.verbose;


    // Register the 'exec' multitasks for executing shell commands.
    grunt.registerMultiTask( 'exec', 'Execute shell commands.', function () {

        var data        = this.data;

        // Determine execution options, defaulting to an empty object if not specified.
        var execOptions = data.options !== undefined ? data.options : {};

        // Control stdout logging, defaults to true.
        var stdout      = data.stdout !== undefined ? data.stdout : true;

        // Control stderr logging, defaults to true.
        var stderr      = data.stderr !== undefined ? data.stderr : true;

        // Custom callback function, if provided, otherwise an empty function.
        var callback    = _.isFunction( data.callback ) ? data.callback : function () {};

        // Expected exit codes for successful execution, defaults to 0.
        var exitCodes   = data.exitCode || data.exitCodes || 0;

        var command;
        var childProcess;

        // Capture any additional arguments passed to the task.
        var args        = [].slice.call( arguments, 0 );

        // Inform Grunt that this is an asynchronous task.
        var done        = this.async();


        // Ensure exitCodes is always an array for consistent checking.
        // This handles cases where a single exit code is provided.
        exitCodes       = _.isArray( exitCodes ) ? exitCodes : [ exitCodes ];


        // The command can be specified in 'command', 'cmd' properties,
        // or directly as a string if 'data' itself is a string.
        command         = data.command || data.cmd || ( _.isString( data ) && data );


        // Set current working directory if specified in task data.
        if ( data.cwd ) {
            execOptions.cwd = data.cwd;
        }

        // Set maxBuffer if specified in task data.
        if ( data.maxBuffer ) {
            execOptions.maxBuffer = data.maxBuffer;
        }


        // Validate that a command has been provided.
        if ( ! command ) {
            log.error( 'Missing command property.' );
            return done( false );
        }


        // If the command is a function, execute it to get the actual command string.
        if ( _.isFunction( command ) ) {
            command = command.apply( grunt, args );
        }


        // Final validation: command must be a string.
        if ( ! _.isString( command ) ) {
            log.error( 'Command property must be a string.' );
            return done( false );
        }


        verbose.subhead( command );
        verbose.writeln( f( 'Expecting exit code %s', exitCodes.join( ' or ' ) ) );


        // Execute the command using Node's child_process.exec.
        childProcess = cp.exec( command, execOptions, callback );


        // Attach data listeners for stdout, if enabled.
        if ( stdout ) {
            childProcess.stdout.on( 'data', function ( d ) {
                log.write( d );
            } );
        }


        // Attach data listeners for stderr, if enabled.
        if ( stderr ) {
            childProcess.stderr.on( 'data', function ( d ) {
                log.error( d );
            } );
        }


        // Handle execution errors (e.g., command not found, permissions issues).
        // The 'exit' event might not fire in these cases.
        childProcess.on( 'error', function ( err ) {

            log.error( f( 'Failed with: %s', err ) );
            done( false );
        } );


        // Handle the process exiting.
        childProcess.on( 'exit', function ( code ) {

            // Check if the exit code is among the expected successful codes.
            if ( exitCodes.indexOf( code ) < 0 ) {
                log.error( f( 'Exited with code: %d.', code ) );
                return done( false );
            }

            verbose.ok( f( 'Exited with code: %d.', code ) );
            done();
        } );

    } );

};