const executionEngine = require("child_process");
const fileHandler = require("path");

const operationalSettings = Object.freeze({
    platformWindowsIdentifier: 'win32',
    nodeProgramName: 'node',
    windowsProgramExtension: '.cmd',
    fallbackModulePath: 'lib/index.js',
    targetModuleName: 'glass-test'
});

function acquireScriptReference(settings) {
    let determinedLocation = null;
    try {
        determinedLocation = require.resolve(settings.targetModuleName);
    } catch (issue) {
    }
    return determinedLocation || settings.fallbackModulePath;
}

function adjustArgumentPaths(pathUtility, baseLocation, rawArguments) {
    const baseDirectory = pathUtility.dirname(baseLocation);
    const currentDirectoryPrefix = pathUtility.normalize('./');

    return rawArguments.map(singleArgument => 
        currentDirectoryPrefix + pathUtility.relative(baseDirectory, singleArgument)
    );
}

function getSystemExecutable(settings) {
    const isCurrentSystemWindows = process.platform === settings.platformWindowsIdentifier;
    return isCurrentSystemWindows 
        ? settings.nodeProgramName + settings.windowsProgramExtension 
        : settings.nodeProgramName;
}

const incomingParameters = process.argv.slice(2);

const mainScriptPointer = acquireScriptReference(operationalSettings);

const processedParameters = adjustArgumentPaths(
    fileHandler,
    mainScriptPointer,
    incomingParameters
);

const programToExecute = getSystemExecutable(operationalSettings);

const finalCommandArgs = [mainScriptPointer, ...processedParameters];

executionEngine.spawn(programToExecute, finalCommandArgs, { stdio: 'inherit' });