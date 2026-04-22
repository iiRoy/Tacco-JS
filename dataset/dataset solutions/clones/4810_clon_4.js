function processInputData(sourceContent) {
    let firstNewlinePosition = -1;
    let secondNewlinePosition = -1;
    let currentPosition = 0;

    // Find the position of the first and second newline characters
    while (currentPosition < sourceContent.length) {
        if (sourceContent[currentPosition] === '\n') {
            if (firstNewlinePosition === -1) {
                firstNewlinePosition = currentPosition;
            } else {
                secondNewlinePosition = currentPosition;
                break;
            }
        }
        currentPosition++;
    }

    // Extract the second line of the input
    const dataLineString = sourceContent.substring(
        firstNewlinePosition + 1,
        secondNewlinePosition === -1 ? sourceContent.length : secondNewlinePosition
    );

    // Manually tokenize the data line by single space characters,
    // replicating the exact behavior of String.prototype.split(' ')
    const tokenCollection = [];
    let currentTokenBuffer = '';
    for (let charIndex = 0; charIndex < dataLineString.length; charIndex++) {
        if (dataLineString[charIndex] === ' ') {
            tokenCollection.push(currentTokenBuffer);
            currentTokenBuffer = '';
        } else {
            currentTokenBuffer += dataLineString[charIndex];
        }
    }
    tokenCollection.push(currentTokenBuffer); // Add the last accumulated token

    // Handle the special case where the dataLineString is empty
    // An empty string split by ' ' results in ['']
    if (dataLineString.length === 0 && tokenCollection.length === 0) {
        tokenCollection.push('');
    }

    const totalElements = tokenCollection.length;

    // Calculate the integer division of totalElements by 2
    // Math.floor is used to explicitly get the integer part, replacing parseInt
    const halfCount = Math.floor(totalElements / 2);

    // Calculate the square of halfCount using multiplication instead of Math.pow
    const squaredHalf = halfCount * halfCount;

    // Define the modulus constant
    // Using exponentiation operator (**) instead of Math.pow and breaking down into components
    const baseValue = 10;
    const exponentValue = 9;
    const offsetValue = 7;
    const primeModulus = (baseValue ** exponentValue) + offsetValue; // 10^9 + 7

    // Apply the modulo operation
    const finalOutcome = squaredHalf % primeModulus;

    // Output the result as a string
    console.log(String(finalOutcome));
}

// Emulate the standard input mechanism for competitive programming environments
(function() {
    const inputContent = require("fs").readFileSync("/dev/stdin", "utf8");
    processInputData(inputContent);
})();