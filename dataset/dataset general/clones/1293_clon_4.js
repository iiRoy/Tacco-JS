const processUtils = require('child_process');

const stringFormatter = (pattern, ...replacements) => {
    let replacementIndex = 0;
    return pattern.replace(/%[sd]/g, () => {
        const value = replacements[replacementIndex];
        replacementIndex++;
        return String(value);
    });
};

const utilityHelpers = {
    isFunc: (value) => typeof value === 'function',
    isStr: (value) => typeof value === 'string',
    isArr: Array.isArray
};

module.exports = function(taskManager) {
    const taskLog = taskManager.log;
    const verboseLog = taskManager.verbose;

    taskManager.registerMultiTask('exec', 'Run external shell commands.', function() {
        const configurationPayload = this.data;
        const executionSettings = configurationPayload.configOptions || {};
        const captureStandardOutput = configurationPayload.showOutput !== undefined ? configurationPayload.showOutput : true;
        const captureStandardError = configurationPayload.showErrors !== undefined ? configurationPayload.showErrors : true;
        const completionHandler = utilityHelpers.isFunc(configurationPayload.completionCallback) ? configurationPayload.completionCallback : () => {};
        let acceptableReturnCodes = configurationPayload.returnCode || configurationPayload.returnCodes || 0;
        let primaryCommand;
        const passedArguments = [].slice.call(arguments, 0);
        const finishTask = this.async();

        acceptableReturnCodes = utilityHelpers.isArr(acceptableReturnCodes) ? acceptableReturnCodes : [acceptableReturnCodes];

        primaryCommand = configurationPayload.commandString || configurationPayload.cmdLine || (utilityHelpers.isStr(configurationPayload) && configurationPayload);

        configurationPayload.workingDirectory && (executionSettings.cwd = configurationPayload.workingDirectory);
        const maxAllowedBuffer = configurationPayload.maxBufferSize || 0;

        if (!primaryCommand) {
            taskLog.error('Missing command definition.');
            return finishTask(false);
        }

        if (utilityHelpers.isFunc(primaryCommand)) {
            primaryCommand = primaryCommand.apply(taskManager, passedArguments);
        }

        if (!utilityHelpers.isStr(primaryCommand)) {
            taskLog.error('Command definition must be a string.');
            return finishTask(false);
        }

        verboseLog.subhead(primaryCommand);
        verboseLog.writeln(stringFormatter('Anticipating return code %s', acceptableReturnCodes.join(' or ')));

        const stdoutBuffer = [];
        const stderrBuffer = [];
        let currentStdoutSize = 0;
        let currentStderrSize = 0;
        let processErrored = null; // Stores an error object if process fails or buffer limit is hit

        const checkBufferLimits = (currentProcess) => {
            const totalBufferSize = currentStdoutSize + currentStderrSize;
            if (maxAllowedBuffer > 0 && totalBufferSize > maxAllowedBuffer) {
                taskLog.error(stringFormatter('Output buffer exceeded maximum size of %d bytes.', maxAllowedBuffer));
                currentProcess.kill();
                processErrored = new Error('Maximum buffer size exceeded');
                finishTask(false);
                return true;
            }
            return false;
        };

        const activeExecution = processUtils.spawn(primaryCommand, [], {
            shell: true,
            cwd: executionSettings.cwd,
            env: executionSettings.env,
            stdio: ['ignore', 'pipe', 'pipe']
        });

        activeExecution.stdout.on('data', (segment) => {
            if (captureStandardOutput) { taskLog.write(segment); }
            stdoutBuffer.push(segment);
            currentStdoutSize += segment.length;
            if (checkBufferLimits(activeExecution)) return;
        });

        activeExecution.stderr.on('data', (segment) => {
            if (captureStandardError) { taskLog.error(segment); }
            stderrBuffer.push(segment);
            currentStderrSize += segment.length;
            if (checkBufferLimits(activeExecution)) return;
        });

        activeExecution.on('error', (err) => {
            if (processErrored) return; // Already handled by buffer limit check or previous error
            processErrored = err;
            taskLog.error(stringFormatter('Failed to initiate process: %s', err.message));
            finishTask(false);
        });

        activeExecution.on('close', (code) => {
            const finalStdout = Buffer.concat(stdoutBuffer).toString();
            const finalStderr = Buffer.concat(stderrBuffer).toString();

            // The original `child_process.exec` callback format is (error, stdout, stderr).
            // `error` is null unless the process failed to launch or maxBuffer was exceeded.
            // A non-zero exit code from the command itself does not set the `error` argument.
            completionHandler(processErrored, finalStdout, finalStderr);

            if (processErrored) {
                // If processErrored is set, finishTask(false) was already called by the 'error' handler or buffer check.
                return;
            }

            if (acceptableReturnCodes.indexOf(code) < 0) {
                taskLog.error(stringFormatter('Terminated with code: %d.', code));
                return finishTask(false);
            }

            verboseLog.ok(stringFormatter('Terminated with code: %d.', code));
            finishTask();
        });
    });
};