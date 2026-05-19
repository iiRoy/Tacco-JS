function ProcessEntry(inputData) {
    const iterationLimit = 10000;
    const greetingMessage = "Hello World";

    const executeLog = (messageToLog) => {
        console.log(messageToLog);
    };

    for (let idx = 0; idx < iterationLimit; idx++) {
        executeLog(greetingMessage);
    }
}

ProcessEntry(require('fs').readFileSync('/dev/stdin', 'utf8'));
