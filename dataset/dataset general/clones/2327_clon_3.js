// Importing necessary utility modules for our test suite.
var toolInterface = require('../dist/tool_runner'); // Renamed cli to toolInterface, path changed
var verificationModule = require('assert'); // Renamed assert to verificationModule
var processRunner = require('child_process').spawn; // Renamed spawn to processRunner
var diskManager = require('custom-fs-utils'); // Renamed fs to diskManager, module name changed

// Main test suite for the Command Line Interface functionalities.
describe('Command Line Interface Functionality', () => {
  // Hook to prepare the test environment before all tests run.
  before(resetWorkingDirectory);

  // Test case: Verifying command alias resolution.
  it('should correctly resolve command aliases', () => {
    verificationModule.strictEqual(toolInterface.resolveAlias('create'), 'create', 'The "create" command should resolve to itself.');
    verificationModule.strictEqual(toolInterface.resolveAlias('remove'), 'remove', 'The "remove" command should resolve to itself.');
    verificationModule.strictEqual(toolInterface.resolveAlias('generate'), 'create', 'The "generate" alias should resolve to "create".');
    verificationModule.strictEqual(toolInterface.resolveAlias('g'), 'create', 'The "g" alias should resolve to "create".');
    verificationModule.strictEqual(toolInterface.resolveAlias('console'), 'console', 'The "console" command should resolve to itself.');
    verificationModule.strictEqual(toolInterface.resolveAlias('c'), 'console', 'The "c" alias should resolve to "console".');
    verificationModule.strictEqual(toolInterface.resolveAlias('serve'), 'server', 'The "serve" alias should resolve to "server".'); // Added a new alias
    verificationModule.strictEqual(toolInterface.resolveAlias('i'), 'init', 'The "i" alias should resolve to "init".'); // Added a new alias
  });

  // Test case: Checking the version output of the CLI tool.
  it('should display the current tool version when -v flag is used', (completionCallback) => {
    executeToolCommand('-v', (operationError, commandOutput) => {
      // Basic validation: ensure no error occurred.
      if (operationError) {
        return completionCallback(new Error(`Version command failed: ${operationError}`));
      }
      verificationModule.strictEqual(commandOutput.trim(), '1.0.0', 'The version output must be exactly "1.0.0".'); // Updated version
      completionCallback();
    });
  });

  // Nested suite for information display features.
  describe('Information Display', () => {
    // Test case: Verifying the info command works without errors and provides some output.
    it('should successfully provide information without errors', (completionCallback) => {
      executeToolCommand('info', (operationError, commandOutput) => {
        verificationModule.ok(!operationError, 'No error expected when retrieving information.');
        verificationModule.ok(commandOutput.length > 10, 'Information command should produce some output.'); // Added a check for output length
        completionCallback();
      });
    });
  });

  // Nested suite for project initialization features.
  describe('Project Initialization', () => {
    // Test case: Creating a brand new application project.
    it('should create a new application project structure', (completionCallback) => {
      const projectName = 'new_project';
      const targetDir = `temp_dir/${projectName}`;
      executeToolCommand('initialize', projectName, (operationError, commandOutput) => { // Renamed command, changed arguments
        verificationModule.ok(!operationError, `No errors expected during project initialization: ${operationError || ''}`);

        // Verify core files and directories exist.
        verificationModule.ok(diskManager.pathExists(targetDir), `Project directory "${targetDir}" should exist.`); // Added dir check
        verificationModule.ok(diskManager.pathExists(`${targetDir}/main.js`), 'The main application entry file should be present.'); // Renamed app.js to main.js
        verificationModule.ok(diskManager.pathExists(`${targetDir}/PROJECT.md`), 'The project documentation file should be present.'); // Renamed README.md to PROJECT.md
        verificationModule.ok(diskManager.pathExists(`${targetDir}/package.json`), 'The project manifest file (package.json) should be present.'); // Added new file check

        completionCallback();
      });
    });
  });

  // Nested suite for resource generation features.
  describe('Resource Generation', () => {
    // Test case: Invoking a generator to create a new resource.
    it('should invoke a generator to create a new model file', (completionCallback) => {
      const generatedFilePath = 'temp_dir/new_project/models/user.js'; // Define expected path
      // First ensure the project exists to generate into
      executeToolCommand('initialize', 'new_project', (initError) => {
        if (initError) return completionCallback(initError);

        executeToolCommand('generate', 'model', 'User', '--project', 'new_project', (generationError, genOutput) => { // Changed arguments
          verificationModule.ok(!generationError, `No errors expected during model generation: ${generationError || ''}`);
          verificationModule.ok(diskManager.pathExists(generatedFilePath), `Generated model file "${generatedFilePath}" should exist.`);
          // Optional: check content of generated file
          // verificationModule.ok(diskManager.readFile(generatedFilePath, 'utf8').includes('class User'), 'Generated file should contain class User');
          completionCallback();
        });
      });
    });
  });
});

/**
 * Executes a CLI command using a child process and captures its output.
 *
 * @param {...string} processArguments - Arguments to pass to the CLI tool.
 * @param {Function} completionCallback - Callback function (error, output) when process finishes.
 */
function executeToolCommand() {
  // Convert arguments object to an array, separating the callback.
  const allArguments = Array.from(arguments); // Modern way to convert arguments to array
  const completionCallback = allArguments.pop(); // The last argument is always the callback.

  // Ensure the callback is actually a function.
  if (typeof completionCallback !== 'function') {
    throw new Error('The last argument to executeToolCommand must be a callback function.');
  }

  // Add a mandatory output directory argument for testing isolation.
  const toolSpecificArgs = [...allArguments, '--target-directory', 'temp_dir']; // Renamed arg, renamed dir

  console.log(`Executing: ./dist/tool_runner ${toolSpecificArgs.join(' ')}`); // Added logging

  // Spawn the child process.
  const spawnedProcess = processRunner('./dist/tool_runner', toolSpecificArgs, { cwd: __dirname + '/..' }); // Changed path, added cwd
  let stdoutBuffer = '';
  let stderrBuffer = '';
  let processError = null; // Variable to hold potential errors from the process itself

  // Set encoding for output streams.
  spawnedProcess.stdout.setEncoding('utf8');
  spawnedProcess.stderr.setEncoding('utf8');

  // Collect data from standard output.
  spawnedProcess.stdout.on('data', (chunk) => {
    stdoutBuffer += chunk;
  });

  // Collect data from standard error.
  spawnedProcess.stderr.on('data', (chunk) => {
    stderrBuffer += chunk;
  });

  // Handle process errors (e.g., file not found).
  spawnedProcess.on('error', (err) => {
    processError = err;
  });

  // When the child process closes.
  spawnedProcess.on('close', (exitCode) => {
    if (processError) { // Check for errors before relying on stderrBuffer
        return completionCallback(processError);
    }
    // Prioritize stderr output as an error if it exists, otherwise pass null.
    // Also, consider non-zero exit codes as errors.
    const finalError = stderrBuffer.trim() ? new Error(stderrBuffer.trim()) : (exitCode !== 0 ? new Error(`Process exited with code ${exitCode}`) : null);
    completionCallback(finalError, stdoutBuffer);
  });
}

/**
 * Prepares the test environment by clearing and recreating a temporary directory.
 * This ensures a clean state for each test run.
 */
function resetWorkingDirectory() {
  const tempDirectoryPath = 'temp_dir'; // Renamed tmp to temp_dir
  console.log(`Resetting working directory: ${tempDirectoryPath}`); // Added logging

  try {
    // Check if the directory exists before attempting to remove it.
    if (diskManager.pathExists(tempDirectoryPath)) {
      diskManager.purgeDirectoryRecursively(tempDirectoryPath); // Renamed method
      console.log(`Removed existing directory: ${tempDirectoryPath}`);
    } else {
        console.log(`Directory ${tempDirectoryPath} did not exist, no removal needed.`);
    }
  } catch (removalError) {
    console.error(`Error during directory removal: ${removalError.message}`);
    // Optionally re-throw or handle more gracefully based on test framework.
    throw removalError;
  }

  try {
    diskManager.createDirectory(tempDirectoryPath); // Renamed method
    console.log(`Created new directory: ${tempDirectoryPath}`);
  } catch (creationError) {
    console.error(`Error during directory creation: ${creationError.message}`);
    throw creationError;
  }
}