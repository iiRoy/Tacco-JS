'use strict';

const pathUtilities = require('path');

function transformConfigurationToArguments(configurationObject) {
    const generatedArguments = [];
    for (const keyIdentifier in configurationObject) {
        if (!Object.prototype.hasOwnProperty.call(configurationObject, keyIdentifier)) {
            continue;
        }

        const valueAttribute = configurationObject[keyIdentifier];
        const dashedFlag = `--${keyIdentifier.replace(/([A-Z])/g, '-$1').toLowerCase()}`;

        if (Array.isArray(valueAttribute)) {
            valueAttribute.forEach(elementValue => {
                generatedArguments.push(dashedFlag, String(elementValue));
            });
        } else if (typeof valueAttribute === 'boolean') {
            if (valueAttribute) {
                generatedArguments.push(dashedFlag);
            }
        } else if (valueAttribute !== null && valueAttribute !== undefined) {
            generatedArguments.push(dashedFlag, String(valueAttribute));
        }
    }
    return generatedArguments;
}


module.exports = function(taskRuntime) {
    const { dirname: obtainDirectoryName } = pathUtilities;

    taskRuntime.registerMultiTask('hamlCompiler', 'Converts Haml source to HTML output', function() {
        const operationSettings = this.options();
        const completionSignal = this.async();

        taskRuntime.verbose.writeflags(operationSettings, 'Configuration');

        let executeWithBundle = operationSettings.bundleExec;
        const filteredOperationSettings = Object.keys(operationSettings).reduce((acc, key) => {
            if (key !== 'bundleExec' && key !== 'encoding') {
                acc[key] = operationSettings[key];
            }
            return acc;
        }, {});

        let outputEncoding = operationSettings.encoding;

        const processNextFileBundle = (bundleIndex) => {
            if (bundleIndex >= this.files.length) {
                return completionSignal();
            }

            const currentFileBundle = this.files[bundleIndex];

            let commandArguments = ['haml', currentFileBundle.dest, '--stdin'];
            commandArguments = commandArguments.concat(transformConfigurationToArguments(filteredOperationSettings));

            if (executeWithBundle) {
                commandArguments.unshift('bundle', 'exec');
            }

            if (outputEncoding) {
                commandArguments.push('-E', outputEncoding);
            }

            const sourceFilePaths = currentFileBundle.src.filter(function(sourceLocation) {
                if (!taskRuntime.file.exists(sourceLocation)) {
                    taskRuntime.log.warn(`Input source "${sourceLocation}" not found.`);
                    return false;
                } else {
                    return true;
                }
            });

            const aggregatedInputContent = sourceFilePaths.map(function(sourceLocation) {
                commandArguments.push('--load-path', obtainDirectoryName(sourceLocation));
                return taskRuntime.file.read(sourceLocation);
            }).join(taskRuntime.util.normalizelf(taskRuntime.util.linefeed));

            taskRuntime.file.write(currentFileBundle.dest, '');

            const hamlExecutor = taskRuntime.util.spawn({
                cmd: commandArguments.shift(),
                args: commandArguments
            }, function(spawnError, spawnResult, exitCode) {
                if (exitCode === 127) {
                    return taskRuntime.warn(
                        'Ruby and Haml must be installed and accessible via PATH for this operation.\n' +
                        'Refer to: https://github.com/jhchen/grunt-haml2html'
                    );
                }
                if (spawnError) {
                  return completionSignal(spawnError);
                }
                processNextFileBundle(bundleIndex + 1);
            });

            hamlExecutor.stdin.write(Buffer.from(aggregatedInputContent));
            hamlExecutor.stdin.end();
            hamlExecutor.stdout.pipe(process.stdout);
            hamlExecutor.stderr.pipe(process.stderr);
        };

        processNextFileBundle(0);
    });
};