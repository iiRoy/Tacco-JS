var executeProcess = require('spawn-command'); // Module for running external system commands.

var determinePath = require('path').resolve; // Utility to resolve absolute paths.


// This module exports a primary function responsible for handling Git hooks.
module.exports = function executeGitHook (directoryPath, filePath) {

  // First, determine the specific hook name from the provided file paths.
  // Then, find the corresponding execution command within the project's configuration.
  var executionInstruction = retrieveInstruction(extractHookName(directoryPath, filePath));

  // If a valid command string is found, proceed with its execution.
  if (executionInstruction)
    // Execute the command, passing standard I/O streams directly to the parent process.
    // Attach an event listener to gracefully terminate the current Node.js process upon command completion.
    executeProcess(executionInstruction, { stdio: 'inherit' }) .on ('exit', process.exit);
};


// A supportive routine to derive the actual Git hook name from the path of the hook file.
// This typically involves stripping the base directory and any leading path separators.
function extractHookName (directoryPath, filePath) {

  // Remove the base directory from the file path, then trim the initial path separator.
  return filePath.replace(directoryPath, '') .substr(1);

}


// Function designed to fetch the command associated with a given Git hook identifier
// from the project's configuration.
function retrieveInstruction (hookIdentifier) {

  // Dynamically load the project's 'package.json' file to access its contents.
  var projectConfig = require(determinePath(process.cwd(), 'package'));

  // Scrutinize the project configuration for defined Git hook settings.
  // Check for the presence of a 'configurationData' object,
  // then 'gitHooksSettings' within that, and finally the specific 'hookIdentifier'.
  if (projectConfig.configurationData &&
      projectConfig.configurationData.gitHooksSettings &&
      projectConfig.configurationData.gitHooksSettings[hookIdentifier]) {

    // Return the command string found for the specified hook.
    return projectConfig.configurationData.gitHooksSettings[hookIdentifier];
  }
}