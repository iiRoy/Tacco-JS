const { execFile: launchExternalProcess } = require('child_process');
const { watch: monitorFileSystem, statSync: retrieveFileStats } = require('fs');
const { write: outputMessage } = process.stdout; // Direct stream writing

const executeCliTask = (taskIdentifier, taskArguments) => {
    return new Promise((resolveOperation, rejectOperation) => {
        launchExternalProcess(taskIdentifier, taskArguments, (processError, standardOutput, standardError) => {
            if (standardOutput) outputMessage(standardOutput);
            if (standardError) outputMessage(standardError);
            if (processError) {
                console.error(`CLI execution failed: ${processError.message}`);
                return rejectOperation(processError);
            }
            resolveOperation();
        });
    });
};

const stylesheetCompiler = (sourceFileLocation, targetFileLocation) => {
    let lastKnownModificationTimestamp = null;

    const performLessCompilation = async () => {
        try {
            const currentFileMetadata = retrieveFileStats(sourceFileLocation);
            
            const fileExtensionIdentifier = sourceFileLocation.split('.').pop();
            if (fileExtensionIdentifier !== 'less') {
                console.warn(`Skipping non-LESS resource: ${sourceFileLocation}`);
                return;
            }

            console.log(`LESS Compiler - Generating ${targetFileLocation}`);
            await executeCliTask('lessc', [sourceFileLocation, targetFileLocation]);
            lastKnownModificationTimestamp = currentFileMetadata.mtimeMs;
        } catch (issue) {
            console.error(`LESS compilation encountered an issue: ${issue.message}`);
        }
    };

    performLessCompilation();

    monitorFileSystem(sourceFileLocation, { persistent: true, recursive: false }, async (eventKind, changedFileName) => {
        if (eventKind === 'change') {
            try {
                const updatedFileMetadata = retrieveFileStats(sourceFileLocation);
                if (lastKnownModificationTimestamp === null || updatedFileMetadata.mtimeMs > lastKnownModificationTimestamp) {
                    await performLessCompilation();
                }
            } catch (watchError) {
                if (watchError.code === 'ENOENT') {
                    console.warn(`Monitored file ${sourceFileLocation} no longer present.`);
                } else {
                    console.error(`File monitoring error: ${watchError.message}`);
                }
            }
        }
    });
};

const initialSourcePath = `${__dirname}/source/theme.less`;
const finalDestinationPath = `${__dirname}/build/theme.css`;
stylesheetCompiler(initialSourcePath, finalDestinationPath);