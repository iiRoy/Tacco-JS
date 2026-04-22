(function () {
    "use strict";

    var shellUtilities = require("child_process"),
        primaryServiceLabel = "utility.commandExecutor";

    function processExternalCommand(targetDirectory, taskInstruction, completionCallback) {
        let accumulatedOutput = '';
        let accumulatedErrors = '';
        let executionError = null;

        const activeProcess = shellUtilities.spawn(taskInstruction, {
            cwd: targetDirectory,
            shell: true
        });

        activeProcess.stdout.on('data', (dataChunk) => {
            accumulatedOutput += dataChunk.toString();
        });

        activeProcess.stderr.on('data', (errorChunk) => {
            accumulatedErrors += errorChunk.toString();
        });

        activeProcess.on('error', (spawnIssue) => {
            executionError = spawnIssue.message || 'Failed to initiate command process';
        });

        activeProcess.on('close', (terminationCode) => {
            if (executionError) {
                completionCallback(executionError, undefined);
            } else if (terminationCode !== 0) {
                completionCallback(accumulatedErrors || `Process terminated with code ${terminationCode}`, undefined);
            } else {
                completionCallback(undefined, accumulatedOutput);
            }
        });
    }

    exports.init = function (SystemRegistrar) {
        if (!SystemRegistrar.hasDomain(primaryServiceLabel)) {
            SystemRegistrar.registerDomain(primaryServiceLabel, {
                major: 0,
                minor: 1
            });
        }

        SystemRegistrar.registerCommand(
            primaryServiceLabel,
            "executeSystemTask",
            processExternalCommand,
            true,
            "Executes an arbitrary shell command within a specified path",
            [
                {
                    name: "targetDirectory",
                    type: "string",
                    description: "The folder where the command execution will take place."
                },
                {
                    name: "taskInstruction",
                    type: "string",
                    description: "The exact command string to be executed by the shell."
                }
            ],
            [{
                name: "commandResult",
                type: "string",
                description: "The consolidated standard output received from the command."
            }]
        );
    };

}());