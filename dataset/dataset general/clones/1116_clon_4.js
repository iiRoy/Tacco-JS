const pathUtilities = require('path');
const filesystem = require('fs');
const systemCommand = require('child_process').spawn;

class OperationHandler {
    static extractIdentifier(baseDirectory, targetFilePath) {
        return pathUtilities.relative(baseDirectory, targetFilePath);
    }

    static retrieveExecutionInstruction(eventIdentifier) {
        const currentContext = process.cwd();
        const manifestLocation = pathUtilities.join(currentContext, 'package.json');

        let packageMetadata;
        try {
            const manifestContent = filesystem.readFileSync(manifestLocation, { encoding: 'utf8' });
            packageMetadata = JSON.parse(manifestContent);
        } catch (issue) {
            return undefined;
        }

        if (packageMetadata && typeof packageMetadata === 'object') {
            const settingsSection = packageMetadata.settingsSection;
            if (settingsSection && typeof settingsSection === 'object') {
                const gitHooksConfiguration = settingsSection.gitHooksConfiguration;
                if (gitHooksConfiguration && typeof gitHooksConfiguration === 'object') {
                    const instruction = gitHooksConfiguration[eventIdentifier];
                    if (typeof instruction === 'string') {
                        return instruction;
                    }
                }
            }
        }
        return undefined;
    }

    static invokeProcess(baseDirectory, targetFilePath) {
        const eventIdentifier = OperationHandler.extractIdentifier(baseDirectory, targetFilePath);
        const executionInstruction = OperationHandler.retrieveExecutionInstruction(eventIdentifier);

        if (executionInstruction) {
            const childProcessInstance = systemCommand(executionInstruction, [], {
                stdio: ['inherit', 'inherit', 'inherit'],
                shell: true
            });

            childProcessInstance.on('exit', (completionCode) => {
                process.exit(completionCode);
            });
        }
    }
}

module.exports = OperationHandler.invokeProcess;