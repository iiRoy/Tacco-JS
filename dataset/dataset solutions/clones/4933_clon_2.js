process.stdin.resume();

process.stdin.setEncoding('utf8');

let inputDataRows = [];
const inputProcessor = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

inputProcessor.on('line', (currentLineText) => {
  inputDataRows.push(currentLineText);
});

inputProcessor.on('close', () => {
    // Extract numerical parameters from the first line of input
    const [totalItems, typeACapacity, typeBCapacity] = inputDataRows[0].split(" ").map(numericValue => numericValue - 0);

    // Convert the second line of input into an array of characters
    const characterSequence = inputDataRows[1].split("");

    // Initialize an array to store boolean flags indicating eligibility
    const eligibilityFlags = [];

    // Counters for accepted items of different types
    let totalAcceptedCount = 0;
    let typeBAcceptedCount = 0;

    // Iterate over each character in the sequence with its index
    characterSequence.forEach((currentChar, currentIndex) => {
        // By default, mark the current item as not eligible
        eligibilityFlags[currentIndex] = false;

        // Check if the total number of accepted items is within the combined capacity
        if (totalAcceptedCount < typeACapacity + typeBCapacity) {
            // If the current character is 'a'
            if (currentChar === "a") {
                totalAcceptedCount++; // Increment the overall accepted count
                eligibilityFlags[currentIndex] = true; // Mark this item as eligible
            }
            // If the current character is 'b' AND there's still capacity for 'b' type items
            else if (currentChar === "b" && typeBAcceptedCount < typeBCapacity) {
                totalAcceptedCount++;   // Increment the overall accepted count
                typeBAcceptedCount++;   // Increment the 'b' type accepted count
                eligibilityFlags[currentIndex] = true; // Mark this item as eligible
            }
            // Characters other than 'a' or 'b', or 'b' without capacity, remain ineligible
        }
    });

    // Transform the boolean eligibility flags into "Yes" or "No" strings and join them with newlines
    console.log(eligibilityFlags.map(isEligible => isEligible ? "Yes" : "No").join("\n"));
});
