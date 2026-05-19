function logResult(messageContent) {
  // This function outputs the final computed value to the console.
  console.log(messageContent);
}

function ProcessInputData(rawData) {
  // Initial processing of the raw input string.
  let processedInput = rawData.trim();

  // Split the input into an array of lines.
  processedInput = processedInput.split("\n");

  // Parse the first line to get the length of the sequence.
  const arrayLength = parseInt(processedInput[0], 10);

  // Parse the second line to get the numeric sequence.
  const numericSequence = processedInput[1].split(" ").map((elementValue) => Number(elementValue));

  // Create a map to store the occurrences of each number.
  const occurrenceMap = {};

  // Iterate through the numeric sequence to count occurrences.
  for (let idx = 0; idx < arrayLength; idx++) {
    const currentNumber = numericSequence[idx];
    if (occurrenceMap[currentNumber] === undefined) {
      // If the number is encountered for the first time, set its count to 1.
      occurrenceMap[currentNumber] = 1;
    } else if (occurrenceMap[currentNumber] === 1) {
      // If the number has been seen once, increment its count to 2.
      occurrenceMap[currentNumber]++;
    }
    // Numbers appearing more than twice are not explicitly handled here,
    // as the problem logic implies they would lead to an invalid state later.
  }

  // Sort the unique numbers in the sequence.
  numericSequence.sort((a, b) => a - b);

  // Filter out duplicate numbers to get a unique sorted list.
  const uniqueNumericSequence = numericSequence.filter(function (currentVal, currentIndex, originalArray) {
    return originalArray.indexOf(currentVal) === currentIndex;
  });

  // Initialize the final result.
  let finalResult = 1;

  // Validate the unique numbers based on their occurrences and the array length.
  for (let idx = 0; idx < uniqueNumericSequence.length; idx++) {
    const currentUniqueNumber = uniqueNumericSequence[idx];

    // Special handling for the number 0 when the array length is odd.
    if (arrayLength % 2 === 1 && currentUniqueNumber === 0) {
      // If 0 is present and the length is odd, its count must be exactly 1.
      if (occurrenceMap[currentUniqueNumber] !== 1) {
        logResult("0"); // Output 0 if validation fails.
        return; // Exit the function.
      }
      continue; // Continue to the next unique number.
    }

    // For all other numbers, their count must be exactly 2.
    if (occurrenceMap[currentUniqueNumber] !== 2) {
      logResult("0"); // Output 0 if validation fails.
      return; // Exit the function.
    }
  }

  // If the original array length is odd, remove the first element (which must be 0 if valid).
  if (arrayLength % 2 === 1) {
    uniqueNumericSequence.shift();
  }

  // Calculate the final result as 2 raised to the power of the remaining unique numbers' count.
  finalResult *= Math.pow(2, uniqueNumericSequence.length);

  // Output the final calculated result.
  logResult(finalResult);
}

// Read input from standard input and pass it to the main processing function.
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
