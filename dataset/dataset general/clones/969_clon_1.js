/*
 * This script sets up a file watching and LESS compilation system.
 * It uses several Node.js modules for file system operations and process execution.
 */

// Module imports section for required functionalities
var stalker = require('stalker');              // For watching directories efficiently
var spawn   = require('child_process').spawn;  // For spawning child processes to run external commands
var sys     = require('sys');                  // For system utilities, primarily used here for printing
var fs      = require('fs');                   // For file system operations, like watching individual files

/*
 * Defines an 'exec' utility function to run external commands.
 * It captures stdout and stderr from the spawned process and prints them to the console.
 *
 * @param {string} command - The executable command to run (e.g., 'lessc').
 * @param {Array<string>} params - An array of command-line arguments for the command.
 */
var exec = function (command, params)
{
    // Spawn a new child process with the specified command and its parameters.
    var subprocess = spawn(command, params);

    // Attach a 'data' event listener to the subprocess's standard output stream.
    subprocess.stdout.on('data', function (data)
    {
        // Print the received data from stdout, ensuring it's treated as ASCII.
        sys.print(data.asciiSlice(0, data.length));
    });

    // Attach a 'data' event listener to the subprocess's standard error stream.
    subprocess.stderr.on('data', function (data)
    {
        // Print the received data from stderr, also treating it as ASCII.
        sys.print(data.asciiSlice(0, data.length));
    });
}; // End of exec function definition


/*
 * The 'baker' function orchestrates the watching and compilation of LESS files.
 * It monitors a given input directory for LESS files and compiles them to a specified output path.
 *
 * @param {string} input_path - The absolute path to the directory containing LESS files to watch.
 * @param {string} output_path - The absolute path to the directory where compiled CSS files will be saved.
 */
var baker = function (input_path, output_path)
{
    // Use 'stalker' to watch the designated input directory for any file system events (creation, modification, deletion).
    // The callback function is invoked whenever 'stalker' detects a change within the watched path.
    stalker.watch(input_path, function (err, file_path)
    {
        // Check if any error occurred during the file watching operation.
        if (err)
        {
            // Log the error message to the console for debugging purposes.
            console.log('Error: ' + err);

            // Terminate the current execution path if an error is present.
            return;
        }

        // Extract the file extension from the detected file_path.
        // This is done by splitting the path at '.' and taking the last segment.
        var extension = file_path.split('.').pop();

        // Ensure that only files with the 'less' extension are processed.
        if (extension !== 'less')
        {
            // If the file is not a LESS file, exit this callback invocation.
            return;
        }

        /*
         * Internal function 'compile' handles the actual LESS to CSS compilation process.
         * It constructs the target CSS file path and executes the 'lessc' compiler.
         */
        var compile = function ()
        {
            // Construct the new file path for the compiled CSS file.
            // This involves replacing the input base path with the output base path,
            // removing any directory structure from the filename, and changing the extension to '.css'.
            var new_file_path = file_path
                .replace(input_path, output_path)   // Replace the input root with the output root
                .replace(/^.*\\/, '')               // Remove any preceding directory components, keeping only the filename
                .replace(/\.[^\.]*$/, '.css');      // Change the file extension to '.css'

            // Log the action to the console, indicating which file is being compiled.
            console.log('less - compiled ' + new_file_path);

            // Execute the 'lessc' command-line tool with the source LESS file and the target CSS file path.
            exec('lessc', [file_path, new_file_path]);
        }; // End of compile function definition

        // Immediately call the 'compile' function for the initially detected or changed LESS file.
        compile();

        // Set up a native file system watcher for the specific LESS file.
        // This ensures that changes to the file's content (modification time) trigger a re-compilation.
        fs.watchFile(file_path, function (curr, prev)
        {
            // Compare the current modification time (mtime) with the previous one.
            // If the current mtime is newer, it means the file has been updated.
            if (curr.mtime > prev.mtime)
            {
                // Trigger the compilation process again if the file has been modified.
                compile();
            }
        }); // End of fs.watchFile callback
    }); // End of stalker.watch callback
}; // End of baker function definition

// --- Script Initialization and Execution ---

// Start the 'baker' process to monitor a specific LESS file and manage its compilation.
// This example watches '/source/theme.less' within the current directory and outputs to '/build/theme.css'.
baker(
    __dirname + '/source/theme.less',  // Full path to the input LESS file
    __dirname + '/build/theme.css'     // Full path for the output CSS file
);
// --- End of Script Execution ---