// This function processes raw input data to determine a specific common divisor.
function ProcessInput(rawData) {
    // The input string is expected to contain space-separated numerical values.
    // We parse these into an array of numbers for subsequent calculations.
    const numericalComponents = rawData.split(" ").map(Number);

    // An array is initialized to store all common divisors found between the first two numbers.
    const commonDivisorList = [];

    // We iterate through potential divisors, starting from 1.
    // The upper bound for the loop is set to one less than the minimum of the first two input numbers.
    // This ensures we check divisors up to (min(num1, num2) - 2).
    for (let currentDivisorCandidate = 1; currentDivisorCandidate < Math.min(numericalComponents[0], numericalComponents[1]) - 1; currentDivisorCandidate++) {
        // Check if the current candidate divides both the first and second numbers without any remainder.
        if (numericalComponents[0] % currentDivisorCandidate === 0 && numericalComponents[1] % currentDivisorCandidate === 0) {
            // If it is a common divisor, add it to our collection.
            commonDivisorList.push(currentDivisorCandidate);
        }
    }

    // The final step is to output a specific element from the list of common divisors.
    // The index is calculated by subtracting the third input number from the total count of common divisors.
    // This effectively selects an element from the end of the array.
    console.log(commonDivisorList[commonDivisorList.length - numericalComponents[2]]);
}

// The program execution starts here by reading input from standard input.
// The 'fs' module is used to synchronously read the file content from '/dev/stdin' as UTF-8.
// This content is then passed to our main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
