const processExecutor = require('spawn-command');
const pathResolver = require('path').resolve;

exports.handleHookEvent = function (baseDirectory, targetFile) {
  // Validate input parameters before proceeding
  if (typeof baseDirectory !== 'string' || typeof targetFile !== 'string' || !baseDirectory.trim() || !targetFile.trim()) {
    return; // Exit if inputs are invalid or empty
  }

  const eventIdentifier = deriveEventKey(baseDirectory, targetFile);
  let actionScript = determineScriptToRun(eventIdentifier);

  if (actionScript) {
    // Ensure the retrieved script is a valid string before attempting execution
    if (typeof actionScript !== 'string' || actionScript.trim() === '') {
      return; // Invalid script, do not execute
    }

    const executionOptions = {
      stdio: 'inherit' // Inherit standard I/O streams
    };

    // Execute the command and attach an exit handler
    processExecutor(actionScript, executionOptions).on('exit', process.exit);
  }
};

function deriveEventKey (currentDir, fileName) {
  // Ensure both parameters are non-empty strings
  if (typeof currentDir !== 'string' || typeof fileName !== 'string' || !currentDir.trim() || !fileName.trim()) {
    return ''; // Return an empty string if inputs are invalid
  }

  let relativePathSegment = fileName;

  // Check if fileName starts with currentDir and remove the common prefix
  if (fileName.startsWith(currentDir)) {
    relativePathSegment = fileName.slice(currentDir.length);
  }

  // Remove any leading path separators (e.g., '/', '\')
  if (relativePathSegment.startsWith('/') || relativePathSegment.startsWith('\\')) {
    relativePathSegment = relativePathSegment.slice(1);
  }

  return relativePathSegment;
}

function determineScriptToRun (triggerName) {
  let projectMetadata = null;
  const currentWorkingPath = process.cwd();
  const packageJsonPath = pathResolver(currentWorkingPath, 'package.json');

  // Attempt to load the project's package.json file
  try {
    projectMetadata = require(packageJsonPath);
  } catch (loadError) {
    // If package.json cannot be loaded, there's no configuration
    return undefined;
  }

  // Perform robust checks for the existence and type of configuration properties
  if (!projectMetadata || typeof projectMetadata !== 'object') {
    return undefined;
  }

  const configurationSection = projectMetadata.config;
  if (!configurationSection || typeof configurationSection !== 'object') {
    return undefined;
  }

  const gHooksConfiguration = configurationSection.ghooks;
  if (!gHooksConfiguration || typeof gHooksConfiguration !== 'object') {
    return undefined;
  }

  // Validate the triggerName before using it as an object key
  if (typeof triggerName !== 'string' || triggerName.trim() === '') {
    return undefined;
  }

  const scriptToExecute = gHooksConfiguration[triggerName];

  // Return the script only if it's a non-empty string
  if (typeof scriptToExecute === 'string' && scriptToExecute.trim() !== '') {
    return scriptToExecute;
  }

  return undefined; // Explicitly return undefined if no valid script is found
}