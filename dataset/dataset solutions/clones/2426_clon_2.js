'use strict';
process.stdin.resume();

process.stdin.setEncoding('utf-8');

let receivedData = '';
let lineIndex = 0;

process.stdin.on('data', chunkOfInput => {
    receivedData += chunkOfInput;
});

process.stdin.on('end', () => {
    receivedData = receivedData.split('\n');
    executePrimaryLogic();
});

function fetchLine() {
    return receivedData[lineIndex++];
}

// This section contains the core algorithm logic.
// The primary function processes input and produces output.

function executePrimaryLogic() {

    // Read the integer value for the length.
    var inputLength = parseInt(fetchLine());
    // Read the string value.
    var inputSequence = fetchLine();

    // Divide the string into two parts based on the length.
    var firstHalf = inputSequence.slice(0, Math.floor(inputLength / 2));
    var secondHalf = inputSequence.slice(inputLength / 2);

    // Check for a special case where the string has only one character.
    if (inputSequence.length === 1) {
        print('No');
    }
    // Compare the two halves and print the result.
    print(firstHalf === secondHalf ? 'Yes' : 'No');

}
