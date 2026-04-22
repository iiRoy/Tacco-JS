'use strict';
// This line enforces strict mode for the entire script, ensuring stricter parsing and error handling.

var _ = require('lodash'); // Include the Lodash utility library for various helpful functions.

var path = require('path'); // Include Node.js's built-in 'path' module for handling and transforming file paths.

// Exporting a Grunt multi-task function. This function will be called by Grunt.
module.exports = function(grunt) {

  var options; // Declare a variable to hold the task's configuration options. It will be populated later.

  /**
   * Parses a given manifest file (expected to be a LESS file) to extract all `@import` statements.
   *
   * @param   {string}  filename  The path to the manifest file to be read and parsed.
   * @returns {Array<string>} An array containing the filenames specified in the `@import` statements.
   */
  var parseManifest = function   parseManifest (   filename   )   {

    // Read the entire content of the specified file into a string.
    var data = grunt.file.read(filename);

    // Define a regular expression to find `@import "filename";` patterns.
    // It captures the filename (group 1) which consists of word characters, dots, or hyphens.
    var pattern = /@import "([\w\.-]+)";/g;

    // Initialize an empty array to store the extracted manifest entries (filenames).
    var manifest = [];
    // A variable to hold the result of each regex execution.
    var match;

    // Loop continuously as long as the regex finds matches in the 'data' string.
    while ( ( match = pattern.exec(data) ) !== null )
    {
      // If a match is found, push the captured filename (the first capturing group) into the manifest array.
      manifest .  push  (  match[1]  )  ;
    }

    // Return the populated manifest array.
    return manifest;
  };

  /**
   * Takes a manifest array of filenames and generates a string of `@import` statements.
   * It intelligently prepends the correct path prefix based on whether a file is an override,
   * a local custom file, or an original Bootstrap component.
   *
   * @param   {Array<string>} manifest  An array of filenames to be imported.
   * @param   {Array<string>} overrides A list of filenames that represent overrides for Bootstrap components.
   * @returns {string} A single string containing all generated `@import` statements, separated by newlines.
   */
  var processManifest = function processManifest(manifest, overrides) {

    // Calculate the relative path from the destination directory to the source directory.
    // This prefix is used for custom override files.
    var overridePrefix = path.relative(options.dest, options.src);

    // Calculate the relative path from the destination directory to the original Bootstrap LESS files.
    // This prefix is used for standard Bootstrap component files.
    var origPrefix = path.relative(options.dest, path.join(options.bootstrapPath, 'less'));

    // Use the 'map' function to transform each filename in the manifest into a full `@import` statement.
    var less = manifest.map(function(filename) {
      var prefix; // Declare a variable to store the path prefix for the current filename.

      // Check if the current filename exists in the 'overrides' list.
      if (
        _.contains(overrides, filename)
      ) {
        prefix = overridePrefix; // If it's an override, use the 'overridePrefix'.
      }
      // Otherwise, check if a 'local' option is specified and if the filename matches it.
      else if (
        options.local &&
        filename === options.local
      ) {
        prefix = ''; // If it's the specified local file, no prefix is needed (it's relative to destination).
      }
      // If it's neither an override nor the local file, assume it's a standard Bootstrap file.
      else {
        prefix = origPrefix; // Use the 'origPrefix' for Bootstrap components.
      }

      // Construct the final `@import` string by joining the determined prefix and the filename.
      return '@import "' + path.join(prefix, filename) + '";';
    }).join('\n'); // Join all the generated `@import` strings into a single string, separated by newlines.

    // Return the complete string of `@import` statements.
    return less;
  };


  // This is the main function that Grunt will execute when the task runs.
  // 'this' context here refers to the Grunt task.
  return function() {

    // Merge default options with any options specified in the Gruntfile.js for this task.
    options = this.options({
      bootstrapPath: 'bower_components/bootstrap', // Default path to the Bootstrap installation.
      src: 'src/styles/bootstrap/', // Default source directory for custom Bootstrap-related LESS files.
      dest: 'src/styles' // Default destination directory where the generated 'bootstrap.less' will be written.
    });


    // Parse the main Bootstrap LESS file (e.g., 'bootstrap.less') to get its core import directives.
    var manifest = parseManifest(
      path.join(
        options.bootstrapPath,
        'less',
        'bootstrap.less'
      )
    );


    // Conditional block to insert a user-specified local LESS file into the manifest.
    // This ensures local styles are included at an appropriate point, typically before 'utilities.less'.
    if (options.local) {
      // Remove 'utilities.less' (assumed to be the last item) temporarily from the manifest.
      var utilities = manifest.pop();
      // Insert the user's local LESS file into the manifest.
      manifest.push(options.local);
      // Re-add 'utilities.less' back to the manifest, now after the local file.
      manifest.push(utilities);
    }


    // Use Grunt's file expansion utility to find all '.less' files in the specified source directory.
    // These files are treated as potential overrides for Bootstrap components.
    var overrides = grunt.file.expand({
      cwd: options.src // Set the current working directory for the expansion.
    }, '*.less');


    // Process the manifest array, incorporating the calculated prefixes and overrides.
    // This step transforms the list of filenames into actual `@import` strings.
    manifest = processManifest(manifest, overrides);


    // Construct the full path for the destination LESS file.
    var destFile = path.join(options.dest, 'bootstrap.less');

    // Write the generated LESS content (the `manifest` string) to the specified destination file.
    grunt.file.write(destFile, manifest);

    // Log a message to the Grunt console, indicating that the file has been created.
    // The `.cyan` method is a Grunt utility for coloring console output.
    grunt.log.writeln('File ' + destFile.cyan + ' created');
  };
};