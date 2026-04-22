function ProcessInput(rawData) {
    // Split the entire input string by newline characters into an array of lines.
    rawData = rawData.split('\n');

    // Extract the second line, split it by spaces, creating an array of string numbers.
    let numberSequence = rawData[1].split(' ');

    // Convert each string element in the sequence array to an integer.
    numberSequence = numberSequence.map(itemString => parseInt(itemString, 10));

    // Parse the first line of the input as the total count of elements.
    let countElements = parseInt(rawData[0], 10);

    // Initialize a variable to store the cumulative sum.
    let accumulatedValue = 0;

    // Iterate through the number sequence from the first element up to the specified count.
    for (let idx = 0; idx < countElements; idx++) {
        // Apply conditional logic for accumulation:
        // If it's the very first element (index 0), just add its value directly.
        // Otherwise, compare the current element with the previous one.
        // If the previous element is smaller than the current, add their difference; otherwise, add zero.
        accumulatedValue += (idx === 0) ? numberSequence[idx] : ((numberSequence[idx - 1] < numberSequence[idx]) ? (numberSequence[idx] - numberSequence[idx - 1]) : 0);
    }
    // Output the final computed accumulated value to the console.
    console.log(accumulatedValue);
}

// The section below is responsible for handling standard input/output.
// This part of the code should not be altered as it manages the program's interaction with the environment.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));