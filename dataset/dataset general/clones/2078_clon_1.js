/*
 * Node Pandoc Wrapper
 *
 * This module provides a simple interface to the `pandoc` command-line tool.
 * It leverages Node.js's `child_process` module to spawn Pandoc processes.
 * Compatibility with older Node.js versions (e.g., 0.4.x) necessitates
 * the use of `spawn` over `fork`.
 *
 * This file serves as the primary and currently sole component of the library.
 */


var  childProcess  = require ( 'child_process' ) ;
var     spawn      = childProcess.spawn;
var      exec      = childProcess.exec;


//  Configuration for global command-line arguments passed to Pandoc.
var globalArgs = {

    // Stores user-provided arguments.
    provided  :  null ,

    // Flag to determine if arguments should persist across calls.
    persist   :  false ,

    // Resets global arguments to their default state.
    reset     :  function ( )  {
        this.provided = null;
        this.persist  = false;
    }
};


/*
 *  `type`      :  The source markup format (e.g., 'markdown', 'html').
 *  `input`     :  The actual markup content to be converted.
 *  `types`     :  Target markup format(s). Can be a single string or an array of strings.
 *  `callback`  :  A function to be invoked upon completion or error.
 *                 Receives an object mapping target types to converted markup,
 *                 or `(null, statusCode)` in case of an error.
 */
exports.convert = function ( type , input , types , callback ) {

    var             res             = { } ;
    var             numResponses    = 0 ;
    var             targetResponses ;

    var             pandoc          ;
    var             args            ;

    var             i               ;

    // --- Input validation checks ---

    if ( ! type  ||  typeof  type  !==  'string' )
    {
        throw  'Invalid source markup type: must be a string.' ;
    }


    if ( ! input  ||  typeof  input  !==  'string' )
    {
        throw  'Invalid markup type: must be a string.' ;
    }


    if ( typeof  types  !==  'string'  &&  ! Array.isArray ( types ) )
    {
        throw  'Invalid destination types: must be a string or an array of strings.' ;
    }


    if ( types.length  <=  0 )
    {
        throw  'No destination types provided (empty array).' ;
    }


    if ( typeof  callback  !==  'function' )
    {
        if ( callback )
        {
            throw  'Invalid callback provided: must be a function.' ;
        }
        else
        {
            throw  'No callback provided: must be a function.' ;
        }
    }

    // Initialize result with the original input for its type.
    res [ type ] = input;

    // Ensure `types` is an array for consistent processing.
    if ( typeof  types  ===  'string' )
    {
        types = [ types ] ;
    }

    targetResponses = types.length;


    // --- Locate Pandoc executable and perform conversions ---
    exec ( 'which pandoc' ,  function ( err , stdout ) {

        var pandocPath ;

        if ( err )
        {
            // Propagate any error from 'which pandoc' command.
            throw  err ;
        }


        if ( ! stdout )
        {
            // Pandoc executable not found.
            throw  new Error ( 'Cannot find pandoc - is it installed?' ) ;
        }

        // Remove trailing newline from the `which` command output.
        pandocPath = stdout.substr ( 0 , stdout.length - 1 ) ;


        // Iterate through each target type for conversion.
        for ( i  in  types )
        {
            if ( types.hasOwnProperty ( i ) )
            {
                // Validate each destination type.
                if ( typeof  types [ i ]  !==  'string' )
                {
                    throw  'Invalid destination type provided: non-string value found in array.' ;
                }

                /*
                 * This conditional block ensures that we only attempt to convert
                 * if the target markup type hasn't already been set (e.g., if
                 * the source and target types are identical).
                 */
                if ( ! res [ types [ i ] ] )
                {
                    args = globalArgs.provided  ||  [ ] ; // Use provided args or an empty array.
                    // Append format arguments for Pandoc.
                    args.push ( '-f' , type , '-t' , types [ i ] ) ;

                    // Spawn the Pandoc process.
                    pandoc = spawn ( pandocPath , args ) ;

                    // Attach the target type to the stdout stream for later reference in the 'data' event.
                    pandoc.stdout.targetType = types [ i ] ;

                    pandoc.stdout.on ( 'data' ,  function ( data )  {
                        // Convert buffer to string and store in results.
                        res [ this.targetType ] = data + '' ;
                    } ) ;

                    pandoc.on ( 'error' ,  function ( err )  {
                        // Handle errors during Pandoc execution.
                        callback ( null , err ) ;
                    } ) ;

                    pandoc.on ( 'exit' ,  function ( code , signal )  {
                        numResponses ++ ; // Increment count of completed conversions.

                        if ( code  !==  0 )
                        {
                            // If Pandoc exited with a non-zero code, it indicates an error.
                            callback ( null , code ) ;
                        }
                        else if ( numResponses  ===  targetResponses )
                        {
                            // All conversions are complete and successful.
                            callback ( res ) ;
                        }
                    } ) ;

                    // Write the input markup to Pandoc's stdin.
                    pandoc.stdin.write ( input , 'utf8' ) ;
                    pandoc.stdin.end ( ) ; // Close stdin to signal end of input.

                    // Reset global args if persistence is not enabled.
                    if ( ! globalArgs.persist )
                    {
                        globalArgs.reset ( ) ;
                    }
                }
            }
        }
    } ) ;
} ;


/*
 * Sets global command-line arguments for Pandoc.
 *
 * `args`    :  An array of strings representing command-line arguments.
 *              If `null` or not an array, default arguments will be used.
 * `persist` :  A boolean flag. If `true`, the provided arguments will
 *              be retained for subsequent `convert()` calls.
 *              Otherwise, they are reset after each call.
 *
 * Returns the module exports object, allowing for method chaining.
 */
exports.args = function ( args , persist ) {

    if ( Array.isArray ( args ) )
    {
        globalArgs.provided = args ;
        globalArgs.persist  = persist ;
    }
    else
    {
        // If args are not an array, reset to defaults.
        globalArgs.reset ( ) ;
    }

    return  exports ;
};