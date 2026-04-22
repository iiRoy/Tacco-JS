'use strict';

// Module for parsing command-line arguments from an options object
const parseCliArgs = require('dargs');

// Exports a function that registers a Grunt task
module.exports = function(taskRunner) {
  // Path utilities for handling file paths
  const pathResolver = require('path');

  // Register a multi-task named 'markupTranspiler' for converting Haml to HTML
  taskRunner.registerMultiTask('markupTranspiler', 'Converts Haml source files to HTML output', function() {
    // Retrieve task-specific options provided by the user
    const userConfig = this.options();
    // Get an asynchronous completion callback for this task
    const notifyCompletion = this.async();

    // Extract specific configuration flags and collect the rest for direct argument passing.
    // Using object destructuring with default values for robustness.
    const {
      bundleExec: runWithBundle = false, // Renamed from 'bundleExec', defaults to false
      encoding: inputCharset = 'UTF-8', // Renamed from 'encoding', defaults to UTF-8
      ...remainingOptions // Collects all other properties
    } = userConfig;

    // Iterate over each file group (source-destination pair) asynchronously and sequentially
    taskRunner.util.async.forEachSeries(this.files, function(currentFileGroup, proceedToNextFile) {

      // Guard clause: If there are no source files in the current group, log a warning and skip
      if (!currentFileGroup.src || currentFileGroup.src.length === 0) {
        taskRunner.log.warn(`Warning: No source files specified for destination "${currentFileGroup.dest}". Skipping this target.`);
        return proceedToNextFile();
      }

      // Initialize the array of command-line arguments for the Haml process
      let commandLineArguments = [
        'haml',
        currentFileGroup.dest,
        '--stdin'
      ];

      // Append arguments generated from the remaining user configuration using the parseCliArgs utility
      commandLineArguments = commandLineArguments.concat(parseCliArgs(remainingOptions));

      // If 'runWithBundle' is true, prepend 'bundle exec' to the command
      if (runWithBundle) {
        // Using splice for insertion at the beginning, an alternative to unshift
        commandLineArguments.splice(0, 0, 'bundle', 'exec');
      }

      // If a specific input character set is provided and it's not the default 'UTF-8', add it
      if (inputCharset && inputCharset !== 'UTF-8') {
        commandLineArguments.push('-E', inputCharset);
      }

      // Process source files: filter out non-existent ones, then read and combine their content
      const aggregatedSourceContent = currentFileGroup.src.filter(function(sourceFilePath) {
        // Check if the source file actually exists on the filesystem
        if (!taskRunner.file.exists(sourceFilePath)) {
          taskRunner.log.warn(`Source file not found: "${sourceFilePath}". This file will be excluded from compilation.`);
          return false; // Exclude this file
        }
        return true; // Include this file
      }).map(function(sourceFilePath) {
        // For each valid source file, add its directory to Haml's load path
        const sourceFileDirectory = pathResolver.dirname(sourceFilePath); // Intermediate variable for clarity
        commandLineArguments.push('--load-path', sourceFileDirectory);

        // Read the content of the source file
        return taskRunner.file.read(sourceFilePath);
      }).join(taskRunner.util.linefeed); // Combine all source file contents using normalized line endings

      // Ensure the target output directory exists. If not, create it.
      const outputDirectory = pathResolver.dirname(currentFileGroup.dest);
      if (!taskRunner.file.isDir(outputDirectory)) {
        taskRunner.file.mkdir(outputDirectory); // Create the directory
        taskRunner.log.verbose.writeln(`Created output directory: ${outputDirectory}`);
      }
      // Write an empty file to the destination to ensure the path is valid and created,
      // and to prevent issues if the Haml process fails to write anything.
      taskRunner.file.write(currentFileGroup.dest, '');

      // Spawn the Haml compilation process
      const hamlChildProcess = taskRunner.util.spawn({
        executable: commandLineArguments.shift(), // The first argument is the command itself
        parameters: commandLineArguments // The rest are parameters for the command
      }, function(spawnError, processOutput, exitCode) {
        // Handle the specific error code for command not found
        if (exitCode === 127) {
          return taskRunner.warn(
            'Haml compiler executable was not found. Please ensure that Ruby and the Haml gem are installed\n' +
            'and available in your system\'s PATH environment variable.\n' +
            'More information can be found at: https://github.com/jhchen/grunt-haml2html'
          );
        }
        // If there was any other error during spawning, propagate it
        proceedToNextFile(spawnError);
      });

      // Write the combined source content to the Haml process's standard input
      // Using Buffer.from() for modern Node.js compatibility and explicit encoding
      hamlChildProcess.stdin.write(Buffer.from(aggregatedSourceContent, 'utf8'));
      hamlChildProcess.stdin.end(); // Signal end of input

      // Pipe the Haml process's standard output and standard error to the main process's streams
      hamlChildProcess.stdout.pipe(process.stdout);
      hamlChildProcess.stderr.pipe(process.stderr);

    }, notifyCompletion); // Call the task completion callback once all file groups are processed
  });
};