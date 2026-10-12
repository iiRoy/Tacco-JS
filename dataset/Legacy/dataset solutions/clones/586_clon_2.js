function processSequence(inputString) {
    // This loop continues as long as the input string contains sequences of four or more identical digits (1, 2, or 3).
    while (/(1{4,}|2{4,}|3{4,})/.test(inputString)) {
        // All occurrences of such sequences are removed from the string.
        inputString = inputString.replace(/(1{4,}|2{4,}|3{4,})/g, "");
    }
    // After processing, the length of the resulting string is compared with the current minimum length,
    // and the global minimum is updated if the current string is shorter.
    minimumLength = Math.min(minimumLength, inputString.length);
}

// The program reads its entire input from standard input.
var fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');

// The input content is trimmed of leading/trailing whitespace and then split into an array of lines.
var lineData = (fileContent.trim()).split("\n");

// The main processing loop continues indefinitely until a specific termination condition is met.
while (true) {
    // The first element of the lineData array is shifted off, converted to a number, and stored as the count for the current test case.
    var countOfNumbers = +lineData.shift();

    // If the count of numbers is zero, it signals the end of all test cases, and the loop breaks.
    if (countOfNumbers === 0) {
        break;
    }

    // An empty array is initialized to store the numbers for the current test case.
    var numberArray = [];
    // Numbers are read from the input lines and added to the array based on the current count.
    for (var loopIndex = 0; loopIndex < countOfNumbers; loopIndex++) {
        var currentNumber = +lineData.shift();
        numberArray.push(currentNumber);
    }

    // The minimum length for the current test case is initialized to a very large value (infinity).
    var minimumLength = Infinity;

    // This variable holds the initial string representation of the number array but is not used further in the logic.
    var initialStringRepresentation = numberArray.join("");

    // This loop iterates through each element of the number array to generate modified sequences.
    for (var loopIndex = 0; loopIndex < countOfNumbers; loopIndex++) {
        // Two distinct copies of the original number array are created for modification.
        var modifiedArrayA = numberArray.slice();
        var modifiedArrayB = numberArray.slice();

        // For modifiedArrayA, if the current element is not the last one, it's replaced by the next element.
        if (loopIndex < countOfNumbers - 1) {
            modifiedArrayA[loopIndex] = modifiedArrayA[loopIndex + 1];
        }

        // For modifiedArrayB, if the current element is not the first one, it's replaced by the previous element.
        if (loopIndex > 0) {
            modifiedArrayB[loopIndex] = modifiedArrayB[loopIndex - 1];
        }

        // The modified array A is joined into a string and passed to the processing function.
        processSequence(modifiedArrayA.join(""));
        // The modified array B is joined into a string and passed to the processing function.
        processSequence(modifiedArrayB.join(""));
    }

    // The final minimum length found for the current test case is printed to the console.
    console.log(minimumLength);
}
