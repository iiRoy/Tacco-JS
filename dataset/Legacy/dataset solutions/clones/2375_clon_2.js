function ProcessInput(rawData) {
  // Split the raw input string into an array of lines.
  rawData = rawData.split('\n');

  // The first line contains the length of the target sequence.
  let sequenceLength = Number(rawData[0]);

  // Initialize variables for processing.
  let currentNumberString = ''; // Holds the string representation of the current number (0-999).
  const numberDigits = []; // Stores individual digits of currentNumberString.
  const targetSequence = Array(sequenceLength); // Array to hold the numeric target sequence.
  let matchIndex = 0; // Tracks the progress of matching the 3-digit sequence.
  let foundCombinations = 0; // Counts how many 3-digit numbers match the pattern.

  // Populate the target sequence array from the second line of input.
  // Each character is converted to a number.
  for (let idx = 0; idx < sequenceLength; idx++) {
    targetSequence[idx] = Number(rawData[1].charAt(idx));
  }

  // Iterate through numbers from 0 to 999 (inclusive).
  // These are the potential 3-digit combinations to check.
  for (let num = 0; num < 1e3; num++) {
    // Convert the current number to its string representation.
    // This handles padding for single/double digit numbers (e.g., '0', '10').
    currentNumberString = String(num);

    // Reset the match index for each new 3-digit number.
    matchIndex = 0;

    // Extract the first three characters (digits) of the current number string.
    // If the number is less than 100, charAt(0) or charAt(1) might be 'undefined' or '0'.
    // The original code implicitly handles this by comparing 'undefined' with a number, which results in false.
    numberDigits[0] = currentNumberString.charAt(0);
    numberDigits[1] = currentNumberString.charAt(1);
    numberDigits[2] = currentNumberString.charAt(2);

    // Iterate through the user-provided target sequence.
    for (let pos = 0; pos < sequenceLength; pos++) {
      // Check if the current digit from our 3-digit number matches the target sequence element,
      // and if we haven't already found all three digits (matchIndex < 3).
      if (numberDigits[matchIndex] == targetSequence[pos] && matchIndex !== 0x3) {
        matchIndex++; // Move to the next digit in our 3-digit number.
      }
    }

    // If all three digits of the current number were found in order within the target sequence,
    // increment the count of successful combinations.
    if (matchIndex === 0x3) {
      foundCombinations++;
    }
  }

  // Output the total number of found combinations to the console.
  console.log(foundCombinations);
}

// Read input from standard input and pass it to the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
