"use strict";

// This function recursively generates all possible sequences of a given length
// from a set of input elements, allowing for repetitions of elements.
const generateSequences = (
  inputElements,
  sequenceLength = inputElements.length
) => {
  // Base case: if the desired sequence length is one,
  // return each input element wrapped in its own array.
  if (sequenceLength === 1) {
    return inputElements.map(element => [element]);
  }

  // Initialize an array to accumulate all generated sequences.
  const resultSequences = [];

  // Recursive step: obtain all sequences of length (sequenceLength - 1).
  const subSequences = generateSequences(
    inputElements,
    sequenceLength - 1
  );

  // Iterate through each available element from the input set.
  inputElements.forEach((currentElement) => {
    // For every smaller sequence obtained from the recursive call,
    // prepend the current element to form a new, longer sequence.
    subSequences.forEach((subSequence) => {
      resultSequences.push([currentElement, ...subSequence]);
    });
  });

  // Return the complete collection of sequences.
  return resultSequences;
};

// Main function to process input, calculate, and output the result.
const processInputAndCalculate = (rawData) => {
    // Clean and parse the raw input data.
    const lines = rawData.trim().split("\n");

    // Guard clause: ensure sufficient input lines are provided.
    if (lines.length < 2) {
        console.error("Error: Insufficient input data. Expected at least two lines.");
        return;
    }

    // The first line (N) is not used in the problem's logic, so we skip it.
    // The second line contains the sequence of digits to search within.
    const searchSequence = lines[1].split("").map(Number); // Convert string digits to numbers.

    // Define the universe of digits (0-9) from which target sequences are formed.
    const allowedDigits = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    
    // Generate all possible 3-digit combinations (e.g., 000, 001, ..., 999).
    const targetSequences = generateSequences(allowedDigits, 3);
    
    // Initialize a counter for how many target sequences are found as subsequences.
    let matchCount = 0;
    
    // Iterate through each generated 3-digit target sequence.
    for (const currentTarget of targetSequences) {
        // Flags to track the sequential discovery of target digits within the search sequence.
        let foundFirstDigit = false;
        let foundSecondDigit = false;
        let foundThirdDigit = false;
        
        // Iterate through each digit in the provided search sequence.
        for (const inputDigit of searchSequence) {
            // Check if the current input digit matches the first digit of the target sequence
            // and the first digit hasn't been found yet.
            if (!foundFirstDigit && inputDigit === currentTarget[0]) {
                foundFirstDigit = true;
            } 
            // If the first digit was found, check if the current input digit matches the second target digit,
            // and the second digit hasn't been found yet.
            else if (foundFirstDigit && !foundSecondDigit && inputDigit === currentTarget[1]) {
                foundSecondDigit = true;
            } 
            // If both the first and second digits were found, check if the current input digit
            // matches the third target digit, and the third hasn't been found yet.
            else if (foundFirstDigit && foundSecondDigit && !foundThirdDigit && inputDigit === currentTarget[2]) {
                foundThirdDigit = true;
                // Optimization: If all three digits are found, no need to check further in this searchSequence.
                break; 
            }
        }
        
        // If all three digits of the current target sequence were found in order, increment the counter.
        if (foundFirstDigit && foundSecondDigit && foundThirdDigit) {
            matchCount++;
        }
    }
    
    // Output the final tally of matching sequences.
    console.log(matchCount);
};

// Execute the main processing function by reading input from standard input.
processInputAndCalculate(require('fs').readFileSync('/dev/stdin', 'utf8'));