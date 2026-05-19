function processInput(inputString) {
    // This block evaluates a condition based on a processed numeric value.
    // The input string is first split by spaces, then converted into an array of integers.
    // This array of integers is then assigned back to 'inputString' (repurposing the variable)
    // and its value is compared against 1200.
    (1200 <= (inputString = stringToNumbers(inputString.split(" "))))
        ? console.log("ARC") // If the processed value is 1200 or greater, "ARC" is printed.
        : console.log("ABC"); // Otherwise, "ABC" is printed.
}

// This helper function transforms an array of string representations of numbers
// into an array of actual integer numbers.
function stringToNumbers(stringArray) {
    // It iterates over each element in the provided array.
    return stringArray.map(function(currentElement) {
        // Each string element is parsed as an integer using base 10.
        return parseInt(currentElement, 10);
    });
}

// The program initiates by reading data from the standard input stream.
// It uses Node.js's 'fs' module to synchronously read the content of "/dev/stdin"
// and interprets it as a UTF-8 encoded string.
// This obtained string is then passed to the primary processing function.
processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
