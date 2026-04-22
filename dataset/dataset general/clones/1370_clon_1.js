/*
 * This file contains the primary logic for the `grunt-jscrambler` plugin.
 * It leverages the Jscrambler API to obfuscate JavaScript source files
 * as part of a Grunt build process.
 *
 * Project Name: grunt-jscrambler
 * Author: José Magalhães (magalhas@gmail.com)
 * License: MIT - For more details, see <http://opensource.org/licenses/MIT>
 *
 * This module is designed to integrate seamlessly with the Grunt task runner.
 * It sets up a multi-task that can be configured in a Gruntfile.js.
 */
 'use strict'; // Enforce strict mode for cleaner, safer code.

 var _          = require('lodash');       // Utility library for common programming tasks.
 var jScrambler = require('jscrambler');   // The official Jscrambler API client.
 var path       = require('path');         // Node.js path module for handling file paths.
 var util       = require('util');         // Node.js utility module, useful for debugging.

// Export the main function that Grunt will call to register the task.
 module.exports = function (grunt) {

   // Register 'jscrambler' as a multi-task.
   // The second argument is a short description for the task.
   grunt.registerMultiTask(
     'jscrambler',
     'Obfuscate your source files using the Jscrambler service.',
     function () {

       // Mark the task as asynchronous. This is crucial for tasks that perform I/O operations
       // or interact with external services, like the Jscrambler API.
       var done = this.async();


       // Retrieve the files configured for this task instance.
       // `this.files` is an array of file objects, each containing `src` and `dest`.
       var files = this.files;


       // Get task options, merging them with default values.
       // This allows users to override defaults in their Gruntfile.
       var options = this.options(
         {
           keys:          {},          // Jscrambler API keys (accessKey, secretKey).
           deleteProject: false        // Whether to delete the project from Jscrambler after processing.
         }
       );

       // Check if custom Jscrambler parameters have been provided.
       if (!options.params) {
         // If no parameters are specified, use a default set focusing on minification.
         // '%DEFAULT%' signifies using Jscrambler's default values for these transformations.
         options.params = {
           rename_local: '%DEFAULT%', // Enable local variable renaming.
           whitespace:   '%DEFAULT%'   // Enable whitespace removal.
         };
       }

       // Initiate the Jscrambler obfuscation process.
       jScrambler
         .process(
           {
             host:          options.host,          // Jscrambler API host.
             port:          options.port,          // Jscrambler API port.
             apiVersion:    options.apiVersion,    // Jscrambler API version.
             keys:          options.keys,          // Authentication keys.
             deleteProject: options.deleteProject, // Project deletion preference.
             filesSrc:      this.filesSrc,         // Source files to be processed by Jscrambler.
             params:        options.params         // Obfuscation parameters.
           },
           writeFile // Callback function to handle each processed file.
         )
         .then(done) // If the Jscrambler process succeeds, call `done()` to signal task completion.
         .fail(
           function (err) {
             // If any error occurs during the Jscrambler process,
             // log it and terminate the Grunt task with a fatal error.
             grunt.fail.fatal(util.inspect(err));
           }
         );


    /**
     * Callback function executed by jScrambler for each obfuscated file.
     * This function is responsible for writing the processed buffer to the correct destination path.
     *
     * @param {Buffer} buffer - The obfuscated content of the file.
     * @param {string} file   - The original path of the file that was obfuscated.
     */
     function writeFile(buffer, file) {
       // Iterate through all file groups defined in the Grunt configuration.
       files.forEach(
         function (elem) {
           // For each group, iterate through its source files.
           elem.src.forEach(
             function (src) {
               // Check if the current source file is the one that was just processed by Jscrambler.
               if (grunt.file.arePathsEquivalent(src, file)) {

                 var dest         = elem.dest;         // Get the destination path for this file group.
                 var lastDestChar = dest[dest.length - 1]; // Get the last character of the destination path.

                 var destPath; // Declare variable to hold the final destination path.

                 // Determine the correct destination path.
                 // If there's only one source file and the destination is not a directory (doesn't end with / or \),
                 // then the destination path is exactly `dest`.
                 if (elem.src.length === 1 && lastDestChar !== '/' && lastDestChar !== '\\') {
                   destPath = dest;
                 } else {
                   // Otherwise, join the destination directory with the original filename.
                   destPath = path.join(dest, file);
                 }

                 // Write the obfuscated buffer to the determined destination path.
                 grunt.file.write(destPath, buffer);
               }
             }
           );
         }
       );
     }
   });
 };