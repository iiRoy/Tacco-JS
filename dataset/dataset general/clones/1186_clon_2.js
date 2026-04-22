'use strict';

const utilityBelt = require('lodash'); // Core utility functions
const directoryHandler = require('path'); // Path manipulation module

module.exports = function(buildTool) { // Main export function for the build system
  let configuration; // Global settings object

  // Function to extract @import declarations from a given file
  const extractDeclarations = function retrieveDeclarations(sourcePath) {
    const fileContents = buildTool.file.read(sourcePath); // Read the full content of the stylesheet file
    const importExpression = /@import "([\w\.-]+)";/g; // Regular expression to find import statements
    let declarationList = []; // Array to store extracted import paths
    let foundItem; // Variable to hold the result of regex execution

    // Loop through the file content to find all matching import statements
    while ( (foundItem = importExpression.exec(fileContents)) !== null ) {
      declarationList.push(foundItem[1]); // Add the captured filename to the list
    }

    return declarationList; // Return the list of extracted declarations
  };

  // Function to process and format the list of declarations into proper @import statements
  const assembleImports = function prepareImportStatements(declarations, customRules) {
    // Calculate the relative path for custom overrides
    const customPrefix = directoryHandler.relative(configuration.outputDir, configuration.inputPath);
    // Calculate the relative path for the base framework files
    const basePrefix = directoryHandler.relative(configuration.outputDir, directoryHandler.join(configuration.coreLibPath, 'less'));

    // Map each declaration to its final @import statement with the correct prefix
    const compiledStyles = declarations.map(function(itemPath) {
      let currentSegment; // Variable to hold the determined path prefix for the current item

      // Check if the current item is part of the custom overrides
      if (utilityBelt.includes(customRules, itemPath)) {
        currentSegment = customPrefix; // Use the custom prefix
      }
      // Check if the current item is a specific localized style
      else if (configuration.localized && itemPath === configuration.localized) {
        currentSegment = ''; // No prefix needed for local styles
      }
      // Otherwise, it's a core framework file
      else {
        currentSegment = basePrefix; // Use the base framework prefix
      }

      return '@import "' + directoryHandler.join(currentSegment, itemPath) + '";'; // Construct the full import statement
    }).join('\n'); // Join all import statements with a newline character

    return compiledStyles; // Return the complete string of import statements
  };

  // The main task function returned by the module
  return function() {
    // Initialize configuration with default values, allowing overrides
    configuration = this.configure({
      coreLibPath: 'vendor_modules/bootstrap-framework', // Path to the main framework components
      inputPath: 'source/css/framework/', // Directory containing custom styles to inject
      outputDir: 'source/css' // Target directory for the generated stylesheet
    });

    // Extract initial declarations from the core framework's main LESS file
    const declarationList = extractDeclarations(directoryHandler.join(configuration.coreLibPath, 'less', 'framework.less'));

    // If localized styles are specified, insert them before the base utility styles
    if (configuration.localized) {
      const baseUtils = declarationList.pop(); // Remove the last item (typically utilities)
      declarationList.push(configuration.localized); // Add the localized style
      declarationList.push(baseUtils); // Re-add the base utility styles at the end
    }

    // Find all custom LESS files in the input directory that override framework defaults
    const customRules = buildTool.file.findFiles(
      { baseDir: configuration.inputPath },
      '*.less'
    );
    // Process the declaration list, incorporating custom rules and formatting
    declarationList = assembleImports(declarationList, customRules);

    // Define the path for the final output file
    const targetFile = directoryHandler.join(configuration.outputDir, 'framework-bundle.less');
    // Write the combined import statements to the target file
    buildTool.file.saveFile(targetFile, declarationList);
    // Log a success message to the console
    buildTool.log.printMessage('Asset file ' + targetFile.highlight + ' has been generated.');
  };
};