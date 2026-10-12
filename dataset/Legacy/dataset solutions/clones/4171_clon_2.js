// This module processes a sequence of numbers to determine division operations.
// It counts how many times all numbers in the sequence can be simultaneously divided by two.
const processInput = function(rawData) {
    // Parse the input string to extract the array of integers.
    // The problem statement implies the first line is count, second line is numbers.
    let numArray = rawData.split("\n")[1].split(" ").map(strNum => parseInt(strNum, 10));
    let opCount = 0; // Initialize a counter for successful division operations.

    // Loop indefinitely until a condition is met to break or return.
    for (;;) {
        // Check if every number in the current array is even.
        const allEven = numArray.every(currentNum => ((currentNum % 2) === 0));

        if (allEven) {
            // If all numbers are even, divide each by two and increment the operation counter.
            numArray = numArray.map(currentNum => currentNum / 2);
            opCount++;
        } else {
            // If at least one number is odd, we can no longer divide all by two.
            // Return the total count of successful operations.
            return opCount;
        }
    }
};

// Read the input from standard input using Node.js file system module.
const finalResult = processInput(require("fs").readFileSync("/dev/stdin", "utf8"));

// Display the computed result to standard output.
console.log(finalResult);
