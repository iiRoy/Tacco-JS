((globalContext) => {
    const fileInteractionModule = require('fs');

    let programArgumentsCollection = [];
    let processedLogEntries = [];
    let logEntryPointer = 0;

    const outputInformation = (...items) => {
        console.log(...items);
    };

    const terminateProgram = (exitValue = 0) => {
        process.exit(exitValue);
    };

    const retrieveFileText = (pathIdentifier) => {
        return fileInteractionModule.readFileSync(pathIdentifier, 'utf-8');
    };

    const fetchNextLogRecord = () => {
        if (logEntryPointer >= processedLogEntries.length) {
            return void 0;
        }
        return processedLogEntries[logEntryPointer++];
    };

    programArgumentsCollection = process.argv.slice(2);
    const operatingSystemIdentifier = process.platform;

    switch (operatingSystemIdentifier) {
        case 'darwin':
            programArgumentsCollection.push('--mac');
            programArgumentsCollection.push('--nm=mac-nm');
            break;
    }

    processedLogEntries = retrieveFileText('v8.log').split('\n');

    globalContext.displayOutput = outputInformation;
    globalContext.exitProgram = terminateProgram;
    globalContext.getFileContents = retrieveFileText;
    globalContext.getNextLogLine = fetchNextLogRecord;
    globalContext.programInputArgs = programArgumentsCollection;
    globalContext.parsedLogData = processedLogEntries;

})(global);