// This script acts as a specialized runner for a designated Node.js module,
// primarily 'glass-test'. It handles dynamic module resolution,
// platform-specific executable adjustments, and transforms command-line
// arguments to ensure they are correctly interpreted by the target module.

// Essential Node.js modules for interacting with the operating system
// and managing file paths.
const { spawn: invokeExternalProcess } = require('child_process');
const fileSystemPathUtility = require('path');

// Extract raw input arguments provided on the command line.
// We create a new array from process.argv and discard the first two elements
// (node executable path and script file path).
const rawCommandLineArguments = Array.from(process.argv).slice(2);

// Placeholder for the absolute path to the main script of the module we intend to run.
let primaryTargetModulePath;

try {
    // Attempt to dynamically locate the 'glass-test' module within the Node.js
    // module resolution paths. This is the standard operational mode.
    primaryTargetModulePath = require.resolve('glass-test');
} catch (moduleResolutionFailure) {
    // If 'glass-test' cannot be resolved (e.g., not installed or linked),
    // we assume this script is being run from within the 'glass-test'
    // project itself, likely for development or self-testing.
    // In this scenario, the entry point defaults to 'lib/index.js'
    // relative to the current script's directory.
    primaryTargetModulePath = fileSystemPathUtility.join(__dirname, 'lib', 'index.js');
    // A more advanced Type III change could involve logging this fallback or
    // performing a check if 'lib/index.js' actually exists at this path.
}

// Determine if the current operating system is Windows. This impacts
// how executable paths are constructed (e.g., adding '.cmd' suffix).
const isCurrentOSWindows = process.platform === 'win32';
const executableFileExtension = isCurrentOSWindows ? '.cmd' : '';

// Obtain the path to the Node.js executable itself. This is more reliable
// than simply using 'node' as it uses the exact path of the running interpreter.
const nodeRuntimeExecutable = process.execPath;

// --- Transform Command-Line Arguments ---
// The original arguments (e.g., paths to test files) need to be made relative
// to the directory of the 'glass-test' module itself, not the current working directory.
// This ensures 'glass-test' correctly interprets the provided paths.
const transformedExecutionArguments = rawCommandLineArguments.map(argumentItem => {
    // First, resolve the input argument to an absolute path based on the current working directory.
    const absoluteArgumentPath = fileSystemPathUtility.resolve(argumentItem);
    // Then, calculate the path of this absolute argument relative to the directory
    // where the 'glass-test' module's main script resides.
    const relativePathToModuleDir = fileSystemPathUtility.relative(
        fileSystemPathUtility.dirname(primaryTargetModulePath),
        absoluteArgumentPath
    );
    // Finally, normalize the resulting relative path and prepend './' to explicitly
    // mark it as a relative path, which can be important for some tools or contexts.
    return fileSystemPathUtility.normalize('./' + relativePathToModuleDir);
});

// Optional addition: A guard clause or informational message if no arguments were provided.
// This fragment can be added or removed without altering core functionality for existing args.
// if (transformedExecutionArguments.length === 0) {
//     console.info("No specific target files or options provided. The primary module might run its default behavior.");
// }

// Configuration object for the child process.
// 'stdio: inherit' ensures that the child process's standard input, output,
// and error streams are directly passed through to the parent process,
// allowing for interactive sessions and direct output.
const childProcessExecutionOptions = {
    stdio: 'inherit',
    // One could also specify a 'cwd' (current working directory) here,
    // e.g., cwd: fileSystemPathUtility.dirname(primaryTargetModulePath),
    // but inheriting the parent's CWD is usually sufficient.
};

// Construct the complete list of arguments for the Node.js executable.
// The first argument is always the path to the main script to be executed,
// followed by the transformed user-provided arguments.
const finalProcessArgumentList = [
    primaryTargetModulePath,
    ...transformedExecutionArguments
];

// Execute the Node.js runtime as a child process.
// The executable path is dynamically determined, and the constructed
// argument list and options are passed.
invokeExternalProcess(
    nodeRuntimeExecutable + executableFileExtension,
    finalProcessArgumentList,
    childProcessExecutionOptions
);