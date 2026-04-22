/*
 * This file is an exact Type I clone of the original source.
 *
 * All identifiers, operators, and expressions are preserved precisely.
 * Only whitespace (indentation, line breaks, spacing) and comments have been altered.
 *
 * Original Copyright:
 * Copyright 2010 - 2011 Sami Sam @_sjs
 * MIT license
 * github.com/samsonjs/repl-edit
 */

// This section handles importing necessary Node.js modules for REPL functionality.
var fs         = require('fs')
  , replModule = require('repl')
  , spawn      = require('child_process').spawn
  , util       = require('util')
  , vm         = require('vm')
  , Hint       = 'Commands: .edit, .run, .stash <filename>, .unstash <filename>, .editor <editor>' // User hint message.
  , theRepl; // Global variable to hold the REPL instance.


// Export the main functions for starting and extending a REPL.
module.exports = {
    startRepl: startRepl
  , extendRepl: extendRepl
};


/**
 * Initiates a new REPL instance if one is not already running.
 *
 * @returns {object|undefined} The extended REPL instance or undefined if already running.
 */
function startRepl() {
    // Check if a REPL instance is already active.
    if (theRepl) {
        console.error('repl is already running, only one instance is allowed');
        return;
    }

    // Start a new REPL and extend it with custom commands.
    return extendRepl(replModule.start('> '));
}


/**
 * Logs a message to the REPL's output stream and redisplays the prompt.
 *
 * @param {string} s The string message to log.
 */
function log(s) {
    // Ensure the output stream is available before writing.
    if (theRepl.outputStream) {
        theRepl.outputStream.write(s + '\n' + theRepl.prompt);
        theRepl.displayPrompt();
    }
}


/**
 * Extends an existing REPL instance with custom commands for editing, running, stashing, and unstashing.
 *
 * @param {object} aRepl The REPL instance to extend.
 * @returns {object|undefined} The extended REPL instance or undefined if an error occurred.
 */
function extendRepl(aRepl) {
    // Prevent multiple REPL extensions.
    if (theRepl) {
        console.error('repl is already running, only one instance is allowed');
        return;
    }

    // Validate the provided REPL object.
    if (!aRepl || typeof aRepl.defineCommand !== 'function') {
        console.error('bad argument, repl is not compatible');
        return;
    }

    // Assign the REPL instance globally.
    theRepl = aRepl;

    // Create a temporary file for command storage.
    var tmpfile = makeTempfile();

    // Register an exit handler to clean up the temporary file.
    process.on('exit', function() {
        try {
            fs.unlinkSync(tmpfile);
        }
        catch (e) {
            /* The file might not exist or might have already been removed;
             *  swallow the error silently. */
        }
    });

    // Display the initial hint to the user.
    log(Hint);

    // Define the '.edit' command.
    theRepl.defineCommand('edit', {
        help: 'Edit the current command in your text editor'
      , action: function(editor) {
            edit(tmpfile, editor);
        }
    });


    // Define the '.run' command.
    theRepl.defineCommand('run', {
        help: 'Run the previously edited command'
      , action: function() {
            pause(); // Pause the REPL before running the command.
            run(tmpfile, function() {
                unpause(); // Unpause after command execution.
            });
        }
    });


    // Define the '.stash' command.
    theRepl.defineCommand('stash', {
        help: 'Write the current command to the named file'
      , action: function(dest) {
            stash(tmpfile, dest);
        }
    });


    // Define the '.unstash' command.
    theRepl.defineCommand('unstash', {
        help: 'Replace the current command with the contents of the named file'
      , action: function(source) {
            unstash(tmpfile, source);
        }
    });


    // Define the '.editor' command to set the preferred editor.
    theRepl.defineCommand('editor', function(editor) {
        process.env['VISUAL'] = editor;
    });

    // Return the extended REPL instance.
    return theRepl;
}


// --- Custom REPL Commands Implementation ---


/**
 * Opens a temporary file containing the current REPL command in an external editor.
 *
 * @param {string} cmdFile The path to the temporary command file.
 * @param {string} editor  The editor command to use (optional, falls back to environment variables).
 */
function edit(cmdFile, editor) {
    // Determine which editor to use, prioritizing arguments then environment variables.
    editor = editor || process.env['VISUAL'] || process.env['EDITOR'];

    // Setup file descriptors for the child process.
    var fds  = [process.openStdin(), process.stdout, process.stdout]
      , args = [cmdFile];

    /* Handle editors that require special argument formatting (e.g., 'mate -w').
     * This is a basic split and may not cover all complex cases. */
    if (editor.match(/\s/)) {
        var words = editor.split(/\s+/); // Splits by one or more whitespace characters.
        args      = words.slice(1).concat(args);
        editor    = words[0];
    }

    // Seed the temporary file with the last REPL command if the file is new.
    try {
        fs.statSync(cmdFile);
    }
    catch (e) {
        // If the file doesn't exist, try to write the last REPL command to it.
        var lastCmd = theRepl.rli.history[1]; // history[0] is the .edit command itself.
        if (lastCmd && lastCmd[0] !== '.') { // Avoid stashing other dot commands.
            fs.writeFileSync(cmdFile, lastCmd);
        }
    }

    // Pause the REPL and launch the editor.
    pause();
    spawn(editor, args, {customFds: fds}).on('exit', function(code) {
        /* Some editors can alter terminal settings.
         * Running 'reset' attempts to restore the terminal to its default state. */
        spawn('reset').on('exit', function(_) {
            if (code === 0) {
                // If the editor exited successfully, run the edited command.
                run(cmdFile, function() {
                    unpause();
                });
            }
            else {
                // If the editor exited with an error, just unpause the REPL.
                unpause();
            }
        });
    });
}


/**
 * Saves the contents of the temporary command file to a specified destination file.
 *
 * @param {string} cmdFile The path to the temporary command file.
 * @param {string} dest    The destination file path.
 */
function stash(cmdFile, dest) {
    // Check if there's any content in the command file to stash.
    try {
        fs.statSync(cmdFile);
    }
    catch (e) {
        log('nothing to stash');
        return;
    }

    // Sanitize and validate the destination path.
    dest = dest.trim();
    if (!dest) {
        log('try: .stash /path/to/file');
        return;
    }

    // Create a readable stream from the temporary file.
    var read = fs.createReadStream(cmdFile);

    // Log success and unpause REPL upon stream completion.
    read.on('end', function() {
        log('stashed');
        unpause();
    });

    // Pause the REPL during the file operation.
    pause();

    // Pipe the content to the destination file.
    util.pump(read, fs.createWriteStream(dest));
}


/**
 * Replaces the content of the temporary command file with the content from a specified source file.
 *
 * @param {string} cmdFile The path to the temporary command file.
 * @param {string} source  The source file path.
 */
function unstash(cmdFile, source) {
    // Sanitize and validate the source path.
    source = source.trim();
    if (!source) {
        log('try: .unstash /path/to/file');
        return;
    }

    // Check if the source file exists.
    try {
        fs.statSync(source);
    }
    catch (e) {
        log('no stash at ' + source);
        return;
    }

    // Create a readable stream from the source file.
    var read = fs.createReadStream(source);

    // Log success and unpause REPL upon stream completion.
    read.on('end', function() {
        log('unstashed');
        unpause();
    });

    // Pause the REPL during the file operation.
    pause();

    // Pipe the content to the temporary command file.
    util.pump(read, fs.createWriteStream(cmdFile));
}


/**
 * Executes the JavaScript code contained within a specified file in the REPL's context.
 *
 * @param {string}   filename The path to the file containing the code to execute.
 * @param {function} callback A callback function to execute after the code has run.
 */
function run(filename, callback) {
    // Check for the existence of the file before attempting to run.
    try {
        fs.statSync(filename);
    }
    catch (e) {
        log('nothing to run\n');
        callback();
        return;
    }

    // Read the file content into a string.
    var read = fs.createReadStream(filename)
      , cmd  = '';

    read.on('data', function(d) {
        cmd += d;
    });

    read.on('end', function() {
        // Execute the collected command string within the REPL's VM context.
        try {
            var ret = vm.runInContext(cmd, theRepl.context, 'repl');
            theRepl.context._ = ret; // Store the result in the '_' variable.
            theRepl.outputStream.write(replModule.writer(ret) + '\n');
        }
        catch (e) {
            // If an error occurs during execution, print it to the console.
            if (e.stack) {
                log(e.stack + '\n');
            }
            else {
                log(e.toString() + '\n');
            }
        }
        // Execute the callback if provided.
        if (callback) callback();
    });
}


// --- REPL State Management ---


var origPrompt; // Stores the original REPL prompt string.

/**
 * Resumes the REPL's input/output streams and re-enables the prompt.
 */
function unpause() {
    theRepl.prompt         = origPrompt;
    theRepl.rli.enabled    = true;
    theRepl.outputStream.resume();
    theRepl.inputStream.resume();
    theRepl.displayPrompt();
}


/**
 * Pauses the REPL's input/output streams and disables the prompt.
 */
function pause() {
    theRepl.outputStream.pause();
    theRepl.inputStream.pause();
    theRepl.rli.enabled    = false;
    origPrompt             = theRepl.prompt || '> '; // Save the current prompt.
    theRepl.prompt         = ''; // Clear the prompt during pause.
}


/**
 * Generates a unique temporary filename for storing REPL commands.
 *
 * @returns {string} The full path to the temporary file.
 */
function makeTempfile() {
    var path   = require('path')
      , tmpdir;

    // Determine a suitable temporary directory.
    if (process.env['TMPDIR']) {
        tmpdir = process.env['TMPDIR'];
    }
    else {
        try {
            fs.statSync('/tmp'); // Check if /tmp exists.
            tmpdir = '/tmp';
        } catch (e) {
            tmpdir = process.cwd(); // Fallback to current working directory.
        }
    }

    // Construct the full temporary file path.
    return path.join(tmpdir, 'node-repl-' + process.pid + '.js');
}


// --- Module Initialization ---

// Check if the script is being run directly.
if (require.main === module) {
    startRepl(); // Start a new REPL instance.
}
// Check if the script is being required by Node's built-in REPL module.
else if (module.parent && module.parent.id === 'repl') {
    extendRepl(module.parent.exports.repl); // Extend the existing REPL instance.
}