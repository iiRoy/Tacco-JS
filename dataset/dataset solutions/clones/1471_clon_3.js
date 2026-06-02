(function() {
    const FILE_SOURCE_PATH = '/dev/stdin';
    const INPUT_ENCODING = 'utf8';
    const TERMINATION_SIGNAL = 'quit';
    const PUSH_VALUE_INDEX = 1; // Index for the value part in a 'push' command

    var fileContent = require('fs').readFileSync(FILE_SOURCE_PATH, INPUT_ENCODING);
    var instructionQueue = fileContent.split('\n');

    var dataContainer = []; // Renamed 'stack'
    var currentOperation; // Renamed 'command'

    while (true) {
        currentOperation = instructionQueue.shift();

        if (currentOperation === TERMINATION_SIGNAL) {
            break; // Exit loop if termination signal is received
        }

        if (currentOperation === 'pop') {
            var extractedElement = dataContainer.pop(); // Renamed 'c'
            console.log(extractedElement);
        } else {
            // Assuming any other command is a 'push' operation
            const operationParts = currentOperation.split(' ');
            const elementToStore = operationParts[PUSH_VALUE_INDEX];
            dataContainer.push(elementToStore);
        }
    }
})();
