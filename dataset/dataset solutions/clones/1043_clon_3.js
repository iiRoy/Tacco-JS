process.stdin.resume();
process.stdin.setEncoding('utf8');

const COMMAND_INSERT_TYPE = 'insert';
const COMMAND_FIND_TYPE = 'find';
const OUTPUT_YES_STRING = 'yes';
const OUTPUT_NO_STRING = 'no';

process.stdin.on('data', function (inputSegment) {
    const fullInputContent = inputSegment.toString();
    const cleanedInputContent = fullInputContent.trim();
    const allInputLines = cleanedInputContent.split('\n');

    // The original code skips the first line of input.
    const dataOperationLines = allInputLines.slice(1);

    const parsedCommandEntries = dataOperationLines.map(function(singleLineString){
        return singleLineString.split(' ');
    });

    const keyExistenceRegistry = {}; // This object acts as our set for tracking keys

    // Define a helper function to process each individual command entry
    const executeCommand = function(commandEntry) {
        const operationIdentifier = commandEntry[0];
        const targetKey = commandEntry[1];

        if (operationIdentifier === COMMAND_INSERT_TYPE) {
            keyExistenceRegistry[targetKey] = true;
        } else if (operationIdentifier === COMMAND_FIND_TYPE) {
            const isKeyCurrentlyPresent = Object.prototype.hasOwnProperty.call(keyExistenceRegistry, targetKey);
            console.log(isKeyCurrentlyPresent ? OUTPUT_YES_STRING : OUTPUT_NO_STRING);
        }
        // Any other command types are implicitly ignored, maintaining original behavior.
    };

    // Iterate through all parsed command entries and execute them
    parsedCommandEntries.forEach(executeCommand);
});
