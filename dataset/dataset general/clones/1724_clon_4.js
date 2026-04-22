'use strict';

const backgroundProcessManager = require('daemon');
const fileSystemOperations = require('fs');

const initialConfiguration = Object.freeze({
    authorizationRequired: false,
    secureConnectionEnabled: false
});

module.exports = (executionTarget, inputParameters, runtimeConfiguration) => {
    const effectiveConfiguration = { ...initialConfiguration, ...(runtimeConfiguration || {}) };

    const outputStreamHandle = fileSystemOperations.openSync(inputParameters.logPath, 'a');

    let commandLineArguments = [
        '-h', inputParameters.host,
        '-p', inputParameters.port,
        '-n', inputParameters.number,
        '-l', inputParameters.lines,
        '-t', inputParameters.theme
    ];

    const conditionalArgumentDefinitions = [
        {
            test: (p, c) => c.authorizationRequired,
            values: (p, c) => ['-U', p.user, '-P', p.password]
        },
        {
            test: (p, c) => c.secureConnectionEnabled,
            values: (p, c) => ['-k', p.key, '-c', p.certificate]
        },
        {
            test: (p, c) => c.doSSH,
            values: (p, c) => ['--remote-host', p.remoteHost, '--remote-user', p.remoteUser, '--remote-port', p.remotePort]
        },
        {
            test: (p, c) => p.uiHideTopbar,
            values: (p, c) => ['--ui-hide-topbar']
        },
        {
            test: (p, c) => !p.uiIndent,
            values: (p, c) => ['--ui-no-indent']
        },
        {
            test: (p, c) => p.uiHighlight,
            values: (p, c) => ['--ui-highlight', '--ui-highlight-preset', p.uiHighlightPreset]
        }
    ];

    const generatedArguments = conditionalArgumentDefinitions.flatMap(definition =>
        definition.test(inputParameters, effectiveConfiguration)
            ? definition.values(inputParameters, effectiveConfiguration)
            : []
    );

    commandLineArguments = commandLineArguments.concat(generatedArguments);
    commandLineArguments = commandLineArguments.concat(inputParameters.args);

    const initiatedProcess = backgroundProcessManager.daemon(executionTarget, commandLineArguments, {
        stdout: outputStreamHandle,
        stderr: outputStreamHandle
    });

    fileSystemOperations.writeFileSync(inputParameters.pidPath, initiatedProcess.pid);
};