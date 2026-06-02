(function(sourceText) {
    // This object will store the frequency of each lowercase letter.
    let charCounts = {};

    // Initialize counts for all lowercase English alphabet characters to zero.
    for (let charCodeVal = 'a'.charCodeAt(0); charCodeVal <= 'z'.charCodeAt(0); charCodeVal++) {
        charCounts[String.fromCharCode(charCodeVal)] = 0;
    }

    // Process the input text character by character.
    sourceText.split('').forEach(function(currentChar) {
        // Convert the current character to lowercase for case-insensitive counting.
        currentChar = currentChar.toLowerCase();
        // If the character is one of the tracked lowercase letters, increment its count.
        if (currentChar in charCounts) {
            charCounts[currentChar]++;
        }
    });

    // Format and print the character counts to the console.
    // The 'this' context for the map function is set to 'charCounts' itself.
    console.log(Object.keys(charCounts).map(function(charKey) {
        return charKey + ': ' + this[charKey];
    }, charCounts).join('\n'));

})(require('fs').readFileSync('/dev/stdin', 'utf8'));


/**
 * Parses a multi-line string into a 2D array based on specified separators.
 * @param {string} inputString - The string to be parsed.
 * @param {string} [separatorChar=' '] - The character used to split individual lines into elements.
 * @param {string} [terminatorChar='\n'] - The character used to split the input string into lines.
 * @returns {Array<Array<string>>} A 2D array representing the parsed data.
 */
function processStringData(inputString, separatorChar, terminatorChar) {
    // Set default separator if not provided.
    separatorChar = (typeof separatorChar !== 'undefined') ? separatorChar : ' ';
    // Set default terminator if not provided.
    terminatorChar = (typeof terminatorChar !== 'undefined') ? terminatorChar : '\n';

    // Remove a trailing newline character if present.
    inputString = inputString.replace(/\n$/, '');

    // Split the main string into an array of lines.
    let resultArray = inputString.split(terminatorChar);

    // For each line, split it further by the separator character.
    for (let idx = 0; idx < resultArray.length; idx++) {
        resultArray[idx] = resultArray[idx].split(separatorChar);
    }

    // Return the resulting 2D array.
    return resultArray;
}
