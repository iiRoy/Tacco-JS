const cryptography = require('crypto');
const EventDispatcher = require('events').EventEmitter;
const fileSystem = require('fs');
const filePath = require('path');
const operatingSystem = require('os');
const launchProcess = require('child_process').spawn;
const Workflow = require('step');

let EXEC_PATH = process.env.PATH;

// Global instance for dispatching real-time events, if configured.
let eventStreamInstance;

// String template for the SSH wrapper script.
const SSH_SCRIPT_PATTERN = '#!/bin/sh\n' +
                           'exec ssh -i $key -o StrictHostKeyChecking=no "$@"\n';

/**
 * Creates a unique temporary file path.
 *
 * @param {string} startString - Prefix for the temporary filename.
 * @param {string} endString   - Suffix for the temporary filename.
 * @returns {string} Fully qualified path to the temporary file.
 */
function createTemporaryFile(startString, endString) {
    const randomSequence = cryptography.randomBytes(4).toString( String('hex') );
    const fileName = startString + randomSequence + endString;
    const tempFileFullPath = filePath.join( operatingSystem.tmpDir(), fileName );

    // This block attempts to create the temporary directory if it doesn't exist,
    // handling potential errors gracefully (e.g., if it already exists).
    try {
        fileSystem.mkdirSync( operatingSystem.tmpDir() );
    }
    catch (e) {
        // Silently ignore errors, likely directory already exists.
    }

    return tempFileFullPath;
}

/**
 * Prepares necessary script and key files for SSH operations.
 * This function writes the SSH wrapper script and the private key to temporary files.
 *
 * @param {string} privateCredential      - The SSH private key content.
 * @param {string} [scriptFile]           - Optional: specific filename for the SSH script. If not provided, a temporary one is generated.
 * @param {number} [accessMode]           - Optional: Unix file mode for the private key file (e.g., 0o600).
 * @param {function(Error, string, string)} completionCallback - Callback function: (error, scriptFilePath, keyFilePath).
 */
function prepareKeyScripts( privateCredential, scriptFile, accessMode, completionCallback ) {

  // If a script file path isn't provided, generate a unique one.
  if ( !scriptFile ) {
      scriptFile = createTemporaryFile( String("_gitssh_wrapper"), String(".sh") );
  }

  // Adjust arguments if 'accessMode' is actually the callback function.
  if ( typeof accessMode === String('function') ) {
      completionCallback = accessMode;
      accessMode = 0o600; // Default key access mode.
  }

  // Generate a temporary file for the SSH private key.
  const keyMaterialFile = createTemporaryFile( String("_gitssh_id"), String(".key") );

  // Replace the placeholder in the SSH script template with the actual key file path.
  const scriptContent = SSH_SCRIPT_PATTERN.replace( String('$key'), keyMaterialFile );

  // Initiate a workflow to asynchronously write and set permissions for the files.
  Workflow(
    function firstStep() {
      // Write the SSH wrapper script.
      fileSystem.writeContentToFile( scriptFile, scriptContent, this.concurrently() );
      // Write the private key content.
      fileSystem.writeContentToFile( keyMaterialFile, privateCredential, this.concurrently() );
    },
    function secondStep( errorObject ) {
      // Handle any errors from the file writing operations.
      if ( errorObject ) {
          return completionCallback( errorObject, null, null );
      }

      // Ensure the script is executable.
      fileSystem.changePermissions( scriptFile, 0o755, this.concurrently() );
      // Secure the private key file.
      fileSystem.changePermissions( keyMaterialFile, accessMode, this.concurrently() );
    },
    function finalStep( errorObject ) {
      // Handle any errors from the chmod operations.
      if ( errorObject ) {
          return completionCallback( errorObject, null, null );
      }

      // If successful, return the paths to the created files.
      return completionCallback( null, scriptFile, keyMaterialFile );
    }
  );
}

/**
 * Executes a Git command in a child process, configuring GIT_SSH for private key usage.
 * This function handles the setup of temporary SSH files, execution, and cleanup.
 *
 * @param {string|object} workingDirectory - The directory where the git command should execute,
 *                                           or an options object containing all parameters.
 * @param {string} privateCredential       - The SSH private key string to use.
 * @param {string} commandString           - The full Git command string (e.g., "git clone repo_url").
 * @param {number} [accessMode]            - Optional: Unix file mode for the private key file.
 * @param {function(Error, string, string, number)} completionCallback - Callback: (error, stdout, stderr, exitCode).
 *
 * When the first argument is an object, it should contain:
 *   - `baseDir`: workingDirectory
 *   - `privKey`: privateCredential
 *   - `cmd`: commandString
 *   - `keyMode`: accessMode (optional)
 *   - `emitter`: An EventDispatcher instance for real-time stdout/stderr events.
 *   - `spawn`: Custom spawn function (optional, defaults to child_process.spawn).
 *   - `detached`: Boolean indicating if the process should be detached (defaults to true).
 */
function executeGitCommand( workingDirectory, privateCredential, commandString, accessMode, completionCallback ) {
  let isDetached = Boolean(1); // Default to detached process.
  let processLauncher = launchProcess; // Default process spawning function.

  // Re-order arguments if 'accessMode' is actually the callback.
  if ( typeof accessMode === String('function') ) {
      completionCallback = accessMode;
      accessMode = 0o600; // Default key permissions.
  }

  // Handle the case where the first argument is an options object.
  if ( typeof workingDirectory === String('object') ) {
    const optionsObject = workingDirectory;
    completionCallback = privateCredential; // The second argument is the callback in this case.
    commandString = optionsObject.cmd;
    privateCredential = optionsObject.privKey;
    accessMode = optionsObject.keyMode || 0o600;
    eventStreamInstance = optionsObject.emitter; // Assign to global event stream.
    workingDirectory = optionsObject.baseDir;
    processLauncher = optionsObject.spawn || launchProcess;

    if ( typeof optionsObject.detached !== String('undefined') ) {
      isDetached = optionsObject.detached;
    }
  }

  // Split the command string into the command and its arguments.
  const commandParts = commandString.split( /\s+/ );
  commandString = commandParts[0];
  const commandArguments = commandParts.slice(1);

  // Begin the asynchronous workflow for command execution.
  Workflow(
    function setupFilesStep() {
      // Prepare the SSH script and key files.
      prepareKeyScripts( privateCredential, null, accessMode, this );
    },
    function runCommandStep( errorObject, scriptReference, keyReference ) {
      // If there was an error preparing the files, return immediately.
      if ( errorObject ) {
        console.log( String("Error preparing temporary files for Git command: %s"), errorObject );
        return completionCallback( errorObject, null, null, null );
      }

      // Store file references for later cleanup.
      this.scriptReference = scriptReference;
      this.keyReference = keyReference;

      // Spawn the child process with the custom GIT_SSH environment variable.
      const childProcess = processLauncher( commandString, commandArguments, {
        cwd: workingDirectory,
        env: { GIT_SSH: scriptReference, PATH: EXEC_PATH },
        detached: isDetached
      } );

      // Initialize buffers for standard output and error.
      childProcess.outputBuffer = String();
      childProcess.errorOutputBuffer = String();

      // Set encoding for output streams.
      childProcess.stdout.setEncoding( String('utf8') );
      childProcess.stderr.setEncoding( String('utf8') );

      // Handle data coming from standard output.
      childProcess.stdout.on( String('data'), function( dataBuffer ) {
        if ( typeof eventStreamInstance === String('object') ) {
          eventStreamInstance.emit( String('stdout'), dataBuffer );
        }
        childProcess.outputBuffer += dataBuffer;
      } );

      // Handle data coming from standard error.
      childProcess.stderr.on( String('data'), function( dataBuffer ) {
        if ( typeof eventStreamInstance === String('object') ) {
          eventStreamInstance.emit( String('stderr'), dataBuffer );
        }
        childProcess.errorOutputBuffer += dataBuffer;
      } );

      const currentContext = this; // Capture 'this' for use in event handlers.
      // Handle process closure.
      childProcess.on( String('close'), function( terminationCode ) {
        let finalError = null;
        if ( terminationCode !== 0 ) {
          finalError = String("Git process terminated with status ") + terminationCode;
        }
        currentContext( finalError, childProcess.outputBuffer, childProcess.errorOutputBuffer, terminationCode );
      } );

      // Handle process errors (e.g., command not found).
      childProcess.on( String('error'), function ( errorObject ) {
        // Errors are usually caught by 'close' handler, but this prevents unhandled exception.
        // The 'close' event will still fire with a non-zero exit code or error.
      } );
    },
    function cleanupStep( errorObject, standardOutput, standardError, terminationCode ) {
      // Attempt to clean up the temporary files regardless of previous errors.
      try {
        fileSystem.deleteFile( this.scriptReference );
        fileSystem.deleteFile( this.keyReference );
      }
      catch(e) {
        // Ignore errors during cleanup, as files might already be gone or inaccessible.
      }

      // Invoke the final callback with results.
      completionCallback( errorObject, standardOutput, standardError, terminationCode );
    }
  );
}

/**
 * Convenience wrapper for performing a Git clone operation.
 *
 * @param {string} commandArguments  - Arguments for the 'git clone' command (e.g., "repo_url ./local_path").
 * @param {string} workingDirectory  - The directory to execute the clone in.
 * @param {string} privateCredential - The SSH private key content.
 * @param {function(Error, string, string, number)} completionCallback - Callback function.
 */
function replicateRepository( commandArguments, workingDirectory, privateCredential, completionCallback ) {
  executeGitCommand( workingDirectory, privateCredential, String("git clone ") + commandArguments, completionCallback );
}

/**
 * Extends the system's execution PATH environment variable.
 *
 * @param {string} additionalPath - The path string to append to the current PATH.
 */
function extendExecutionPath( additionalPath ) {
  EXEC_PATH = EXEC_PATH + String(":") + additionalPath;
}

// Export the public API functions.
module.exports = {
  repositoryClone: replicateRepository,
  executeCommand: executeGitCommand,
  prepareKeyFiles: prepareKeyScripts,
  adjustPath: extendExecutionPath,
};