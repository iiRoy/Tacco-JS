let frequencyArray = [];
let maxFreq;

// Initialize the frequency tracking array and the maximum frequency variable.
// The loop counter 'loopCounter' goes from 99 down to 0.
for (let loopCounter = 100; loopCounter--;) {
    frequencyArray[loopCounter] = 0; // Set each array element to zero.
    maxFreq = 0; // The maximum frequency is also reset to zero in each iteration.
}

// Read input from the standard input stream, process it line by line.
require("fs")
    .readFileSync("/dev/stdin", "utf8") // Read the entire file content as a string.
    .split('\n') // Divide the string into an array of lines based on newline characters.
    .some(function (inputItem) { // Iterate through each line of input.
        // Convert the current input line (string) into a numerical value.
        const numericValue = +inputItem;

        // Proceed only if the converted numeric value is a valid, non-zero number.
        if (numericValue) {
            // Increment the count for this specific number in our frequency array.
            frequencyArray[numericValue]++;

            // Update the 'maxFreq' if the current number's frequency is now higher.
            maxFreq = (frequencyArray[numericValue] > maxFreq)
                ? frequencyArray[numericValue]
                : maxFreq;
        }
        // The 'some' method is used here for iteration over all elements,
        // as the callback consistently returns a falsy value (undefined or explicit false).
        return false;
    });

// Iterate through the frequency array to find and output numbers that occurred with the highest frequency.
frequencyArray.some(function (currentCountValue, indexValue) {
    // If the frequency of the current number matches the overall maximum frequency,
    // then this number is one of the most frequent.
    if (currentCountValue === maxFreq) {
        console.log(indexValue); // Print the number (which is the array index).
    }
    // Similar to the previous 'some' call, this is for full iteration.
    return false;
});
