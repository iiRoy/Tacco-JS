var crypto = require ( 'crypto' ) ;
var EventEmitter = require ( 'events' ) . EventEmitter ;
var fs = require ( 'fs' ) ;
var path = require ( 'path' ) ;
var os = require ( 'os' ) ;
var spawn = require ( 'child_process' ) . spawn ;
var Step = require ( 'step' ) ;


var PATH = process . env . PATH ; // System PATH environment variable.


var emitter ; // Global event emitter instance.


// Template string used for generating the SSH wrapper script.
var GIT_SSH_TEMPLATE = '#!/bin/sh\n'
                     + 'exec ssh -i $key -o StrictHostKeyChecking=no "$@"\n' ;


/**
 * Generates a unique temporary file path within the system's temporary directory.
 *
 * @param {string} prefix - A string to prepend to the random part of the filename.
 * @param {string} suffix - A string to append (e.g., file extension).
 * @returns {string} The complete path to the temporary file.
 */
function mkTempFile ( prefix , suffix )
{
    var randomStr = crypto . randomBytes ( 4 ) . toString ( 'hex' ) ; // Generate a random hex string.
    var name = prefix + randomStr + suffix ; // Construct the filename.
    var file = path . join ( os . tmpDir ( ) , name ) ; // Full path using OS temp directory.

    // Workaround for environments where os.tmpDir() might not guarantee directory existence.
    try
    {
        fs . mkdirSync ( os . tmpDir ( ) ) ; // Attempt to create the temporary directory.
    }
    catch ( e )
    {
        /*
         * Ignore errors, especially if the directory already exists.
         * This prevents crashes in certain edge cases.
         */
    }

    return file ;
}


/**
 * Writes the SSH wrapper script and the private key content to temporary files.
 * These files are essential for `gitane` to use custom SSH keys.
 *
 * @param {string} privKey   - The SSH private key content as a string.
 * @param {string} file      - (Optional) Desired path for the SSH wrapper script. If null, a temp file is created.
 * @param {number} keyMode   - (Optional) Unix file mode (permissions) for the private key file. Defaults to 0600.
 * @param {Function} cb      - Callback function: `function(err, scriptFilePath, keyFilePath)`.
 */
function writeFiles ( privKey , file , keyMode , cb )
{
    // If no specific file path for the script is provided, generate a temporary one.
    if ( ! file )
    {
        file = mkTempFile ( "_gitane" , ".sh" ) ;
    }

    // Adjust arguments if `keyMode` is omitted and `cb` is passed as the third argument.
    if ( typeof ( keyMode ) === 'function' )
    {
        cb = keyMode ;
        keyMode = 0600 ; // Default secure permissions for the private key.
    }

    // Generate a temporary file path for the SSH private key.
    var keyfile = mkTempFile ( "_gitaneid" , ".key" ) ;

    // Replace the placeholder in the template with the actual key file path.
    var data = GIT_SSH_TEMPLATE . replace ( '$key' , keyfile ) ;

    // Use `Step` for managing asynchronous file operations.
    Step (
        function ( )
        {
            // Write the SSH wrapper script content to its temporary file.
            fs . writeFile ( file , data , this . parallel ( ) ) ;

            // Write the provided private key content to its temporary file.
            fs . writeFile ( keyfile , privKey , this . parallel ( ) ) ;
        } ,
        function ( err )
        {
            // If any error occurred during the initial file writes, propagate it.
            if ( err )
            {
                return cb ( err , null ) ;
            }

            // Set executable permissions for the SSH wrapper script (0755: rwx for owner, rx for group/others).
            fs . chmod ( file , 0755 , this . parallel ( ) ) ;

            // Set secure permissions for the private key file (e.g., 0600: rw for owner only).
            fs . chmod ( keyfile , keyMode , this . parallel ( ) ) ;
        } ,
        function ( err )
        {
            // If any error occurred during the chmod operations, propagate it.
            if ( err )
            {
                return cb ( err , null ) ;
            }

            // All files are written and permissions set; call back with the file paths.
            return cb ( null , file , keyfile ) ;
        }
    ) ;
}


/**
 * Executes a Git command as a child process, utilizing a provided SSH private key.
 * This function supports two calling signatures:
 *
 * 1. `run(baseDir, privKey, cmd, [keyMode], cb)`
 *    - `baseDir`: The current working directory for the Git command execution.
 *    - `privKey`: The SSH private key content (string).
 *    - `cmd`: The full Git command string (e.g., "git clone git@github.com:user/repo.git").
 *    - `keyMode`: (Optional) Permissions for the private key file (defaults to 0600).
 *    - `cb`: Callback function with signature `function(err, stdout, stderr, exitCode)`.
 *
 * 2. `run(options, cb)`
 *    - `options`: An object containing the following properties:
 *        - `baseDir`, `privKey`, `cmd`, `keyMode` (same as above).
 *        - `emitter`: (Optional) An EventEmitter instance to emit `stdout` and `stderr` events in real-time.
 *        - `spawn`: (Optional) A custom `spawn` function to use instead of `child_process.spawn`.
 *        - `detached`: (Optional) Boolean. If `true`, the child process runs independently. Defaults to `true`
 *                      to prevent the Git process from hanging if it prompts for a password.
 *    - `cb`: Callback function with signature `function(err, stdout, stderr, exitCode)`.
 */
function run ( baseDir , privKey , cmd , keyMode , cb )
{
    var detached = true ; // By default, spawn the child process as detached.
    var spawnFn = spawn ; // Use the default `child_process.spawn` unless overridden.

    // Handle the case where `keyMode` is omitted and `cb` is the fourth argument.
    if ( typeof ( keyMode ) === 'function' )
    {
        cb = keyMode ;
        keyMode = 0600 ; // Apply default secure permissions for the key.
    }

    // Check if the function was called with an options object.
    if ( typeof ( baseDir ) === 'object' )
    {
        var opts = baseDir ; // Alias the options object for readability.

        // Extract parameters from the options object.
        cb = privKey ; // The second argument is the callback in this signature.
        cmd = opts . cmd ;
        privKey = opts . privKey ;
        keyMode = opts . keyMode || 0600 ; // Use provided keyMode or default.
        emitter = opts . emitter ; // Assign the global emitter if provided.
        baseDir = opts . baseDir ;
        spawnFn = opts . spawn || spawn ; // Use custom spawn function if specified.

        // Explicitly check for the `detached` option.
        if ( typeof ( opts . detached ) !== 'undefined' )
        {
            detached = opts . detached ;
        }
    }

    // Split the command string into the executable and its arguments.
    var split = cmd . split ( /\s+/ ) ;
    var commandExecutable = split [ 0 ] ; // The main command (e.g., "git").
    var args = split . slice ( 1 ) ; // Remaining parts are arguments.

    // Orchestrate the process using `Step`.
    Step (
        function ( )
        {
            // Step 1: Write the necessary temporary files (SSH script and private key).
            writeFiles ( privKey , null , keyMode , this ) ;
        } ,
        function ( err , file , keyfile )
        {
            // Handle any errors that occurred during file writing.
            if ( err )
            {
                console . log ( "Error writing temporary files for Git SSH: %s" , err ) ;
                return cb ( err , null ) ;
            }

            // Store the temporary file paths in the `this` context for later cleanup.
            this . file = file ;
            this . keyfile = keyfile ;

            // Spawn the child process for the Git command.
            var proc = spawnFn ( commandExecutable , args ,
                {
                    cwd : baseDir , // Set the current working directory.
                    env : {
                        GIT_SSH : file , // Crucially, set GIT_SSH to our wrapper script.
                        PATH : PATH // Preserve the original system PATH.
                    } ,
                    detached : detached // Control whether the process is detached.
                }
            ) ;

            // Initialize buffers to capture all stdout and stderr output.
            proc . stdoutBuffer = "" ;
            proc . stderrBuffer = "" ;

            // Set encoding for the standard output and error streams.
            proc . stdout . setEncoding ( 'utf8' ) ;
            proc . stderr . setEncoding ( 'utf8' ) ;

            // Listen for data on stdout.
            proc . stdout . on ( 'data' , function ( buf )
            {
                // If an emitter is provided, emit real-time stdout data.
                if ( typeof ( emitter ) === 'object' )
                {
                    emitter . emit ( 'stdout' , buf ) ;
                }
                proc . stdoutBuffer += buf ; // Accumulate stdout data.
            } ) ;

            // Listen for data on stderr.
            proc . stderr . on ( 'data' , function ( buf )
            {
                // If an emitter is provided, emit real-time stderr data.
                if ( typeof ( emitter ) === 'object' )
                {
                    emitter . emit ( 'stderr' , buf ) ;
                }
                proc . stderrBuffer += buf ; // Accumulate stderr data.
            } ) ;

            var self = this ; // Capture the `Step`'s `this` context for the `close` event handler.
            proc . on ( 'close' , function ( exitCode )
            {
                var err = null ; // Assume success initially.
                // If the process exited with a non-zero status code, it indicates an error.
                if ( exitCode !== 0 )
                {
                    err = "process exited with status " + exitCode ;
                }
                // Proceed to the next `Step` stage with the results.
                self ( err , proc . stdoutBuffer , proc . stderrBuffer , exitCode ) ;
            } ) ;

            // Attach an error handler to prevent Node.js from throwing an uncaught exception
            // if the spawned process itself fails to start (e.g., command not found).
            // The 'close' event will still fire, and its exitCode will indicate the failure.
            proc . on ( 'error' , function ( err )
            {
                // This handler is mainly to prevent crashes. Actual command errors are
                // typically reflected in the `exitCode` of the 'close' event.
            } ) ;
        } ,
        function ( err , stdout , stderr , exitCode )
        {
            // Final step: Clean up the temporary files created earlier.
            try
            {
                fs . unlink ( this . file ) ; // Delete the temporary SSH wrapper script.
                fs . unlink ( this . keyfile ) ; // Delete the temporary private key.
            }
            catch ( e )
            {
                // Log a warning if cleanup fails, but don't prevent the callback from firing.
                console . error ( "Warning: Failed to unlink temporary files: " , e . message ) ;
            }

            // Invoke the original callback with the command's results.
            cb ( err , stdout , stderr , exitCode ) ;
        }
    ) ;
}


/**
 * A convenience wrapper function for performing a `git clone` operation.
 * It leverages the `run` function to execute the command with a custom SSH key.
 *
 * @param {string} args    - Arguments to pass to the `git clone` command (e.g., "repo_url target_directory").
 * @param {string} baseDir - The directory in which the `git clone` command should be executed.
 * @param {string} privKey - The SSH private key content required for repository access.
 * @param {Function} cb    - Callback function: `function(err, stdout, stderr, exitCode)`.
 */
function clone ( args , baseDir , privKey , cb )
{
    // Construct the full `git clone` command and pass it to the `run` function.
    run ( baseDir , privKey , "git clone " + args , cb ) ;
}


/**
 * Appends a given path string to the global `PATH` environment variable.
 * This can be useful for ensuring that child processes can locate specific executables.
 *
 * @param {string} str - The path string to be appended.
 */
function addPath ( str )
{
    PATH = PATH + ":" + str ;
}


// Export the public API functions of this module.
module . exports = {
    clone      : clone ,      // Function for performing git clone operations.
    run        : run ,        // General function for running git commands with SSH keys.
    writeFiles : writeFiles , // Utility to write temporary SSH-related files.
    addPath    : addPath       // Function to modify the system PATH.
} ;