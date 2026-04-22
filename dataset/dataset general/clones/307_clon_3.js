(function () {
    "use strict";

    // Utility module for handling operating system processes
    var osProcessUtil = require("child_process");

    // Unique identifier for this command group
    var commandNamespaceIdentifier = "system.shell.executor";

    /**
     * Executes a given shell command within a specified working directory.
     * @param {string} targetDirectory - The path to the directory where the command should be executed.
     * @param {string} commandToExecute - The actual shell command string to run.
     * @param {function(string|null, string|null): void} completionHandler - Callback function
     *   to be invoked upon command completion. Receives an error string (if any) and the command's standard output.
     */
    function executeSystemCommand(targetDirectory, commandToExecute, completionHandler) {
        // --- Type III Addition: Guard clause for empty command ---
        if (!commandToExecute || commandToExecute.trim().length === 0) {
            console.error("Attempted to execute an empty command.");
            return completionHandler("Error: No command string provided for execution.", null);
        }

        // --- Type III Update: Create an options object explicitly, add 'encoding' ---
        const executionOptions = {
            cwd: targetDirectory, // working directory
            encoding: 'utf8'      // ensure consistent encoding for output
        };

        // --- Type III Update: Re-write callback logic for clarity and error handling ---
        osProcessUtil.exec(commandToExecute, executionOptions, function handleProcessCompletion(opError, cmdOutput, errorOutput) {
            if (opError) {
                // --- Type III Addition: Combine error messages for better context ---
                const comprehensiveError = errorOutput ?
                    `Command failed with error: ${opError.message || String(opError)}. Stderr: ${errorOutput.trim()}` :
                    `Command execution error: ${opError.message || String(opError)}`;
                completionHandler(comprehensiveError, null);
            } else {
                // Return only stdout upon success
                completionHandler(null, cmdOutput);
            }
        });
    }

    /**
     * Sets up the module by registering its commands with the extension manager.
     * @param {object} extensionManager - The manager object responsible for domain and command registration.
     */
    module.exports.setupModule = function (extensionManager) {
        // --- Type III Addition: Console log for initialization status ---
        console.log(`[${commandNamespaceIdentifier}] Initializing command execution service.`);

        // --- Type III Addition: Define version object explicitly ---
        const moduleVersion = {
            currentMajor: 0,
            currentMinor: 2 // Updated minor version for this clone
        };

        // --- Type II & III: Rename and reformat domain registration check ---
        if (!extensionManager.hasDomain(commandNamespaceIdentifier)) {
            extensionManager.registerDomain(commandNamespaceIdentifier, {
                versionMajor: moduleVersion.currentMajor,
                versionMinor: moduleVersion.currentMinor
            });
            console.info(`[${commandNamespaceIdentifier}] Registered new domain.`);
        } else {
            console.warn(`[${commandNamespaceIdentifier}] Domain already registered, skipping.`);
        }

        // --- Type III Addition: Define command registration components as variables ---
        const registeredCommandName = "executeShellCommand"; // Renamed from "exec"
        const commandIsAsynchronous = true;
        const commandDescriptionString = "Executes a specified shell command in a target directory.";

        const inputParameterDefinitions = [
            {
                paramName: "workingDirectoryPath", // Renamed from "directory"
                paramType: "string",
                description: "The absolute path where the command should run."
            },
            {
                paramName: "shellCommandString", // Renamed from "command"
                paramType: "string",
                description: "The actual command string to be executed."
            }
        ];

        const outputParameterDefinitions = [
            {
                outputName: "commandOutput", // Renamed from "stdout"
                outputType: "string",
                description: "The standard output received from the command."
            }
        ];

        // --- Type III Update: Use defined variables for clearer command registration ---
        extensionManager.registerCommand(
            commandNamespaceIdentifier,
            registeredCommandName,
            executeSystemCommand, // Reference to the renamed function
            commandIsAsynchronous,
            commandDescriptionString,
            inputParameterDefinitions,
            outputParameterDefinitions
        );

        console.log(`[${commandNamespaceIdentifier}] Command '${registeredCommandName}' registered successfully.`);
    };

}());