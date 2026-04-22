//
// Advanced REPL Toolkit
// (C) 2024 FictionalDev - All rights reserved under the MIT License.
//
// This module extends Node.js's native REPL with advanced editing and script management features.
//
// Future enhancements: Introduce async/await for stream operations, improve argument parsing.

const filesystem = require('fs');
const shellCore = require('repl');
const processExec = require('child_process').spawn;
const systemUtils = require('util');
const codeExecutor = require('vm');
const os = require('os'); // Utilized for cross-platform temporary directory resolution
const pathUtility = require('path'); // Used for path manipulation

// --- Core Module State ---
let currentShellInstance = null;
let initialPromptValue = null;
let interactionStatus = {
  isInitialized: false, // Tracks if the shell has been set up
  isPaused: false       // Tracks if input/output is currently suspended
};

const commandGuidance = `
Available Tools:
  .modify          - Launch editor for the current command buffer.
  .execute         - Run the code from the last modified temporary file.
  .saveAs <path>   - Store the current buffer's contents to a specified file.
  .loadFrom <path> - Replace the current buffer with contents from a file.
  .setEditor <app> - Configure the default external editor application.
`;

// --- Module Exports ---
exports.beginInteractiveShell = initiateConsoleSession;
exports.augmentShellEnvironment = enhanceConsoleFeatures;

// --- Primary Control Functions ---

/**
 * Kicks off a new interactive console session.
 * Ensures only a single instance is active at any given time.
 * @returns {object|null} The new REPL instance, or null if already active.
 */
function initiateConsoleSession() {
  if (interactionStatus.isInitialized) {
    process.stderr.write('Warning: An interactive shell is already operational. Only one instance is supported.\n');
    return null;
  }
  const newReplInstance = shellCore.start('> ');
  return enhanceConsoleFeatures(newReplInstance);
}

/**
 * Prints a message to the currently active console's output stream.
 * Manages prompt display to ensure consistent user experience.
 * @param {string} messageContent - The string message to be displayed.
 */
function outputMessage(messageContent) {
  if (!currentShellInstance || !currentShellInstance.outputStream) {
    process.stderr.write(`Error: Attempted to output message "${messageContent}" without an active console stream.\n`);
    return;
  }
  currentShellInstance.outputStream.write(String(messageContent) + '\n' + currentShellInstance.prompt);
  currentShellInstance.displayPrompt();
}

/**
 * Integrates custom commands and features into an existing REPL object.
 * @param {object} shellObject - The REPL instance to be extended.
 * @returns {object|null} The enhanced REPL instance, or null on failure.
 */
function enhanceConsoleFeatures(shellObject) {
  if (interactionStatus.isInitialized) {
    process.stderr.write('Warning: Shell features have already been augmented. Skipping redundant setup.\n');
    return null;
  }

  // Basic validation for the REPL object's compatibility.
  if (!shellObject || typeof shellObject.defineCommand !== 'function' || typeof shellObject.rli === 'undefined') {
    process.stderr.write('Error: Provided shell object is incompatible or incomplete. Augmentation failed.\n');
    return null;
  }

  currentShellInstance = shellObject;
  interactionStatus.isInitialized = true;

  const temporaryCommandFile = createTemporaryScriptFile();

  // Register cleanup for the temporary file on process termination.
  process.on('exit', () => {
    try {
      if (filesystem.existsSync(temporaryCommandFile)) {
        filesystem.unlinkSync(temporaryCommandFile);
      }
    } catch (exceptionDetails) {
      // Non-critical error if file can't be deleted (e.g., permissions, already deleted).
      // outputMessage(`Cleanup warning: Failed to remove temporary file '${temporaryCommandFile}'.`);
    }
  });

  outputMessage(commandGuidance);

  // --- Defining Custom REPL Commands ---

  currentShellInstance.defineCommand('modify', {
    help: 'Opens the current REPL input buffer in an external editor for modification.',
    action: function(editorApplication) {
      launchEditorForInput(temporaryCommandFile, editorApplication);
    }
  });

  currentShellInstance.defineCommand('execute', {
    help: 'Executes the content previously edited in the temporary script file.',
    action: function() {
      suspendConsoleInteraction();
      processScriptContent(temporaryCommandFile, () => resumeConsoleInteraction());
    }
  });

  currentShellInstance.defineCommand('saveAs', {
    help: 'Persists the contents of the temporary command file to a specified permanent file.',
    action: function(destinationPath) {
      persistInputToDisk(temporaryCommandFile, destinationPath);
    }
  });

  currentShellInstance.defineCommand('loadFrom', {
    help: 'Replaces the temporary command file content with data from a specified source file.',
    action: function(sourcePath) {
      restoreInputFromDisk(temporaryCommandFile, sourcePath);
    }
  });

  currentShellInstance.defineCommand('setEditor', function(editorAppName) {
    const trimmedEditor = editorAppName ? editorAppName.trim() : '';
    if (trimmedEditor.length > 0) {
      process.env['VISUAL'] = trimmedEditor;
      outputMessage(`Default external editor configured to: '${process.env['VISUAL']}'.`);
    } else {
      outputMessage('Please specify an editor application (e.g., "vim", "code --wait").');
    }
  });

  return currentShellInstance;
}

// --- Command Implementation Details ---

/**
 * Initiates an external text editor to modify the content of a script file.
 * @param {string} scriptWorkFile - The path to the temporary file holding the script.
 * @param {string} externalEditorApp - The command string for the editor application.
 */
function launchEditorForInput(scriptWorkFile, externalEditorApp) {
  let chosenEditor = externalEditorApp || process.env['VISUAL'] || process.env['EDITOR'];

  if (!chosenEditor || chosenEditor.trim().length === 0) {
    outputMessage('No editor application specified. Please set VISUAL/EDITOR environment variables or use the `.setEditor` command.');
    return;
  }

  // Attempt to parse editor command and its arguments.
  const editorCommandTokens = chosenEditor.split(/\s+/);
  const mainEditorExecutable = editorCommandTokens[0];
  const editorArguments = editorCommandTokens.slice(1).concat(scriptWorkFile);

  // Pre-populate the script file with the last non-command history entry, if the file is new or empty.
  if (!filesystem.existsSync(scriptWorkFile) || filesystem.statSync(scriptWorkFile).size === 0) {
    const historyItems = currentShellInstance.rli.history;
    let mostRecentCode = '';
    // Iterate history to find the most recent non-dot command
    for (let i = 0; i < historyItems.length; i++) {
      const historyEntry = historyItems[i];
      if (historyEntry && historyEntry.trim().length > 0 && historyEntry.trim()[0] !== '.') {
        mostRecentCode = historyEntry;
        break;
      }
    }

    if (mostRecentCode) {
      try {
        filesystem.writeFileSync(scriptWorkFile, mostRecentCode);
      } catch (errorDetails) {
        outputMessage(`Warning: Failed to pre-fill temporary script file: ${errorDetails.message}`);
      }
    }
  }

  suspendConsoleInteraction();
  // Standard I/O for the child process: stdin for input, stdout/stderr for output.
  const stdioChannels = [process.openStdin(), process.stdout, process.stderr];

  const editorChildProcess = processExec(mainEditorExecutable, editorArguments, { stdio: stdioChannels });

  editorChildProcess.on('error', (spawnError) => {
    outputMessage(`Error: Failed to launch editor '${mainEditorExecutable}'. Is it installed and in your PATH? (${spawnError.message})`);
    resumeConsoleInteraction();
  });

  editorChildProcess.on('exit', (exitStatus) => {
    if (exitStatus !== 0) {
      outputMessage(`Editor process exited with non-zero status: ${exitStatus}. Code might not have been saved.`);
      resumeConsoleInteraction();
      return;
    }
    // Some editors might leave the terminal in a strange state; attempt to reset it.
    processExec('reset', [], { stdio: 'inherit' }).on('exit', () => {
      processScriptContent(scriptWorkFile, () => resumeConsoleInteraction());
    });
  });
}

/**
 * Copies the content from the temporary working file to a user-specified destination.
 * @param {string} scriptWorkFile - Path to the source temporary file.
 * @param {string} targetDestination - Path to the target file for saving.
 */
function persistInputToDisk(scriptWorkFile, targetDestination) {
  if (!filesystem.existsSync(scriptWorkFile)) {
    outputMessage('Error: No active script content found to save.');
    return;
  }
  const cleanedTarget = targetDestination ? targetDestination.trim() : '';
  if (!cleanedTarget) {
    outputMessage('Error: A valid destination path is required. Example: `.saveAs /my/path/script.js`');
    return;
  }

  suspendConsoleInteraction();

  const sourceStream = filesystem.createReadStream(scriptWorkFile);
  const destinationStream = filesystem.createWriteStream(cleanedTarget);

  sourceStream.on('error', (err) => {
    outputMessage(`Error reading source file for saving: ${err.message}`);
    resumeConsoleInteraction();
  });
  destinationStream.on('error', (err) => {
    outputMessage(`Error writing to destination file '${cleanedTarget}': ${err.message}`);
    resumeConsoleInteraction();
  });

  sourceStream.on('end', () => {
    outputMessage(`Script content successfully saved to: '${cleanedTarget}'.`);
    resumeConsoleInteraction();
  });

  systemUtils.pump(sourceStream, destinationStream); // Util.pump for robust stream piping
}

/**
 * Loads content from a user-specified source file into the temporary working file.
 * @param {string} scriptWorkFile - Path to the temporary file that will receive the content.
 * @param {string} inputSourcePath - Path to the source file to load from.
 */
function restoreInputFromDisk(scriptWorkFile, inputSourcePath) {
  const cleanedSource = inputSourcePath ? inputSourcePath.trim() : '';
  if (!cleanedSource) {
    outputMessage('Error: A valid source path is required. Example: `.loadFrom /my/path/existing.js`');
    return;
  }
  if (!filesystem.existsSync(cleanedSource)) {
    outputMessage(`Error: Source file not found at '${cleanedSource}'.`);
    return;
  }

  suspendConsoleInteraction();

  const sourceStream = filesystem.createReadStream(cleanedSource);
  const destinationStream = filesystem.createWriteStream(scriptWorkFile);

  sourceStream.on('error', (err) => {
    outputMessage(`Error reading source file for loading: ${err.message}`);
    resumeConsoleInteraction();
  });
  destinationStream.on('error', (err) => {
    outputMessage(`Error writing to temporary file: ${err.message}`);
    resumeConsoleInteraction();
  });

  sourceStream.on('end', () => {
    outputMessage(`Temporary buffer updated from: '${cleanedSource}'.`);
    resumeConsoleInteraction();
  });

  systemUtils.pump(sourceStream, destinationStream);
}

/**
 * Executes the JavaScript code contained within a specified file in the REPL's context.
 * @param {string} executionFilePath - The path to the script file to be executed.
 * @param {Function} [completionCallback] - An optional callback to be invoked after execution.
 */
function processScriptContent(executionFilePath, completionCallback) {
  if (!filesystem.existsSync(executionFilePath)) {
    outputMessage('Error: No script file found for execution. Nothing to process.');
    if (completionCallback) completionCallback();
    return;
  }

  const fileReader = filesystem.createReadStream(executionFilePath);
  const scriptContentChunks = [];

  fileReader.on('data', (dataChunk) => {
    scriptContentChunks.push(dataChunk);
  });

  fileReader.on('error', (readError) => {
    outputMessage(`Error reading script file for execution: ${readError.message}`);
    if (completionCallback) completionCallback();
  });

  fileReader.on('end', () => {
    const fullScriptContent = Buffer.concat(scriptContentChunks).toString('utf8');

    if (!fullScriptContent.trim()) {
      outputMessage('Warning: Script file is empty. No code to execute.');
      if (completionCallback) completionCallback();
      return;
    }

    try {
      // Execute the script within the REPL's context to maintain scope.
      const evaluationResult = codeExecutor.runInContext(fullScriptContent, currentShellInstance.context, {
        filename: executionFilePath, // Provides better stack traces.
        displayErrors: false         // REPL handles error display.
      });
      currentShellInstance.context._ = evaluationResult; // Store the last result.
      currentShellInstance.outputStream.write(shellCore.writer(evaluationResult) + '\n');
    } catch (codeExecutionError) {
      // Custom error reporting for different error types.
      if (codeExecutionError instanceof SyntaxError) {
        outputMessage(`Syntax Error in script: ${codeExecutionError.message}`);
      } else if (codeExecutionError.stack) {
        outputMessage(`Runtime Execution Error:\n${codeExecutionError.stack}`);
      } else {
        outputMessage(`Generic Error during execution: ${codeExecutionError.toString()}`);
      }
    } finally {
      // Always ensure the completion callback is invoked.
      if (completionCallback) completionCallback();
    }
  });
}

// --- Console State Management ---

/**
 * Restores the interactive console's normal operation, displaying the prompt and enabling input/output.
 */
function resumeConsoleInteraction() {
  if (!currentShellInstance || !interactionStatus.isInitialized) {
    process.stderr.write('Warning: Attempted to resume interaction, but no active shell instance or uninitialized state.\n');
    return;
  }
  if (!interactionStatus.isPaused) {
    // Already resumed or not paused, no action needed.
    return;
  }

  currentShellInstance.prompt = initialPromptValue || shellCore.setPrompt('> '); // Fallback to default prompt
  currentShellInstance.rli.enabled = true;
  currentShellInstance.outputStream.resume();
  currentShellInstance.inputStream.resume();
  currentShellInstance.displayPrompt();
  // Use nextTick to ensure prompt is displayed after any pending I/O.
  process.nextTick(() => currentShellInstance.displayPrompt());
  interactionStatus.isPaused = false;
}

/**
 * Temporarily halts the interactive console's input and output, clearing the prompt.
 * Useful during external operations like launching an editor.
 */
function suspendConsoleInteraction() {
  if (!currentShellInstance || !interactionStatus.isInitialized) {
    process.stderr.write('Warning: Attempted to suspend interaction, but no active shell instance or uninitialized state.\n');
    return;
  }
  if (interactionStatus.isPaused) {
    // Already paused, no action needed.
    return;
  }

  currentShellInstance.outputStream.pause();
  currentShellInstance.inputStream.pause();
  currentShellInstance.rli.enabled = false;
  initialPromptValue = currentShellInstance.prompt || '> '; // Capture current prompt
  currentShellInstance.prompt = ''; // Clear prompt display
  interactionStatus.isPaused = true;
}

// --- Utility Functions ---

/**
 * Creates a unique path for a temporary JavaScript file.
 * Uses OS-specific temporary directory and adds unique identifiers.
 * @returns {string} The full, unique path for the temporary file.
 */
function createTemporaryScriptFile() {
  const uniqueIdentifier = Math.random().toString(36).substring(2, 12) + Date.now().toString(36);
  const systemTempDir = os.tmpdir();
  return pathUtility.join(systemTempDir, `node-repl-session-${process.pid}-${uniqueIdentifier}.js`);
}

// --- Module Initialization ---

// Determines if the module is being executed directly or required by another module (specifically the native REPL).
if (require.main === module) {
  // If run directly, start a new REPL session.
  initiateConsoleSession();
} else if (module.parent && module.parent.id === 'repl') {
  // If required by the native REPL, augment its existing instance.
  const parentReplInstance = module.parent.exports.repl;
  if (parentReplInstance) {
    enhanceConsoleFeatures(parentReplInstance);
  } else {
    process.stderr.write('Error: Could not locate parent REPL instance for augmentation. Features disabled.\n');
  }
}