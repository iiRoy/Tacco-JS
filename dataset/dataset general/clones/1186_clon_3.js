'use strict'; // Global strict mode, can be moved or removed based on preference.

const _helper = require('lodash'); // Renamed 'lodash' import variable.
const fileSystemPath = require('path'); // Renamed 'path' import variable.

// The main Grunt task export function.
module.exports = function(buildSystem) { // Renamed 'grunt' to 'buildSystem'.

  let taskConfiguration; // Renamed 'options' to 'taskConfiguration'.

  /**
   * Reads a LESS file and extracts all `@import` directives.
   * @param {string} inputFilePath The path to the LESS file.
   * @returns {string[]} An array of imported filenames.
   */
  const extractImportDirectives = function extractImportDirectives(inputFilePath) { // Renamed 'parseManifest' to 'extractImportDirectives', 'filename' to 'inputFilePath'.
    // Guard clause: Ensure a valid file path is provided.
    if (!inputFilePath || typeof inputFilePath !== 'string' || inputFilePath.length === 0) {
      buildSystem.log.warn('Warning: An invalid or empty file path was provided for import extraction. Returning empty list.');
      return [];
    }

    const fileContents = buildSystem.file.read(inputFilePath); // Renamed 'data' to 'fileContents'.

    // Regular expression to find `@import "filename";` patterns.
    // Renamed 'pattern' to 'importRegexPattern'.
    const importRegexPattern = /@import\s+"([\w\d\.-]+)";/g;

    const discoveredDependencies = []; // Renamed 'manifest' to 'discoveredDependencies'.
    let currentMatchResult; // Renamed 'match' to 'currentMatchResult'.

    // Loop through all matches using `do...while` for stylistic change.
    do {
      currentMatchResult = importRegexPattern.exec(fileContents);
      if (currentMatchResult !== null) {
        // The first capturing group contains the actual imported filename.
        discoveredDependencies.push(currentMatchResult[1]);
      }
    } while (currentMatchResult !== null); // Continue as long as matches are found.

    return discoveredDependencies;
  };

  /**
   * Processes a list of LESS dependencies and generates the final `@import` string.
   * Adjusts paths based on whether a file is an override, local, or standard bootstrap component.
   * @param {string[]} dependencyList The ordered list of LESS filenames.
   * @param {string[]} overrideStyleFiles A list of filenames that are custom overrides.
   * @returns {string} The complete LESS content with adjusted `@import` paths.
   */
  const composeFinalLessContent = function composeFinalLessContent(dependencyList, overrideStyleFiles) { // Renamed 'processManifest' to 'composeFinalLessContent', 'manifest' to 'dependencyList', 'overrides' to 'overrideStyleFiles'.
    // Basic input validation as a Type III addition.
    if (!Array.isArray(dependencyList) || !Array.isArray(overrideStyleFiles)) {
        buildSystem.log.error('Error: Invalid input types for composing final LESS content. Expected arrays.');
        return '';
    }

    // Calculate relative paths for different import types.
    // Renamed 'overridePrefix' to 'customSourceRelativePath'.
    const customSourceRelativePath = fileSystemPath.relative(taskConfiguration.outputDirectory, taskConfiguration.sourceInputDirectory);
    // Renamed 'origPrefix' to 'bootstrapBaseRelativePath'.
    const bootstrapBaseRelativePath = fileSystemPath.relative(
      taskConfiguration.outputDirectory,
      fileSystemPath.join(taskConfiguration.bootstrapRootPath, 'less')
    );

    // Map each dependency filename to its corresponding `@import` statement with the correct path.
    const generatedImportStatements = dependencyList.map(function(currentFileName) { // Renamed 'filename' to 'currentFileName'.
      let importPathQualifier; // Renamed 'prefix' to 'importPathQualifier'.

      // Determine the correct path prefix for the current file.
      // Replaced `_.contains` with `Array.prototype.includes` for native JS.
      if (overrideStyleFiles.includes(currentFileName)) {
        importPathQualifier = customSourceRelativePath;
      }
      // Check if it's the explicitly defined local style file.
      else if (taskConfiguration.localStyleFile && currentFileName === taskConfiguration.localStyleFile) {
        importPathQualifier = ''; // Local styles are assumed to be in the output root.
      }
      // Default case: it's a standard Bootstrap component.
      else {
        importPathQualifier = bootstrapBaseRelativePath;
      }

      // Construct the full `@import` string.
      return `@import "${fileSystemPath.join(importPathQualifier, currentFileName)}";`;
    });

    // Join all generated import statements with newline characters.
    // Rewritten from `.join('\n')` to `.reduce` for structural variation.
    const finalLessContentString = generatedImportStatements.reduce((accumulator, currentStatement) => {
        return accumulator ? `${accumulator}\n${currentStatement}` : currentStatement;
    }, '');

    return finalLessContentString;
  };

  // The actual Grunt task function that gets registered.
  return function() {
    // Define default options for the task.
    // Moved defaults into a separate object as an intermediate step.
    const defaultTaskOptions = {
      bootstrapRootPath: 'bower_components/bootstrap', // Renamed 'bootstrapPath'
      sourceInputDirectory: 'src/styles/bootstrap/', // Renamed 'src'
      outputDirectory: 'src/styles', // Renamed 'dest'
      localStyleFile: null // Renamed 'local'
    };

    // Merge user-defined options with the defaults.
    taskConfiguration = this.options(defaultTaskOptions); // Renamed 'options' to 'taskConfiguration'.

    // Define constants for magic strings as a Type III addition.
    const BOOTSTRAP_MAIN_LESS_FILE = 'bootstrap.less';
    const LESS_FILE_EXTENSION = '.less';
    const UTILITIES_LESS_FILE = 'utilities.less';

    // Construct the full path to the primary Bootstrap LESS manifest.
    const mainBootstrapManifestPath = fileSystemPath.join(
      taskConfiguration.bootstrapRootPath,
      'less',
      BOOTSTRAP_MAIN_LESS_FILE
    );

    // Extract the initial list of dependencies from the main Bootstrap file.
    let orderedDependencyList = extractImportDirectives(mainBootstrapManifestPath); // Renamed 'manifest'.

    // Conditional logic to insert a local style file.
    if (taskConfiguration.localStyleFile) {
      // Ensure the local style file has the correct extension.
      let adjustedLocalFile = taskConfiguration.localStyleFile;
      if (!adjustedLocalFile.endsWith(LESS_FILE_EXTENSION)) {
        adjustedLocalFile += LESS_FILE_EXTENSION;
      }

      // The 'utilities.less' file must always be the last import.
      // Find and temporarily remove it before inserting the local style.
      const utilitiesIndex = orderedDependencyList.indexOf(UTILITIES_LESS_FILE);
      let removedUtilitiesFile = null;

      if (utilitiesIndex !== -1) {
        removedUtilitiesFile = orderedDependencyList.splice(utilitiesIndex, 1)[0]; // Remove and store.
      } else {
        // Log a warning if the expected utility file is not found.
        buildSystem.log.warn(`Warning: '${UTILITIES_LESS_FILE}' not found in the manifest. Local style file insertion might not be optimal.`);
      }

      // Insert the local style file into the list.
      orderedDependencyList.push(adjustedLocalFile);

      // Re-add the utilities file if it was found and removed.
      if (removedUtilitiesFile) {
        orderedDependencyList.push(removedUtilitiesFile);
      }
    }

    // Expand to find any custom LESS files in the source directory.
    // Renamed 'overrides' to 'foundOverrideStyles'.
    const foundOverrideStyles = buildSystem.file.expand(
      { cwd: taskConfiguration.sourceInputDirectory },
      `*${LESS_FILE_EXTENSION}` // Use constant for extension.
    );

    // Generate the final combined LESS content string.
    const finalGeneratedContent = composeFinalLessContent(orderedDependencyList, foundOverrideStyles);

    // Construct the full path for the output file.
    // Renamed 'destFile' to 'outputFilePath'.
    const outputFilePath = fileSystemPath.join(taskConfiguration.outputDirectory, BOOTSTRAP_MAIN_LESS_FILE);

    // Write the generated LESS content to the specified output file.
    buildSystem.file.write(outputFilePath, finalGeneratedContent);

    // Log the successful completion of the task using a template literal.
    buildSystem.log.writeln(`LESS compilation complete: File '${outputFilePath.cyan}' successfully generated.`);
  };
};