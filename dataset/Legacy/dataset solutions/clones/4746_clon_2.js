function getInputData() {
  // Reads input from standard input, decodes it as UTF-8, and removes leading/trailing whitespace.
  return require("fs").readFileSync("/dev/stdin", "utf8").trim();
}

function displayResult(finalOutput) {
  // Outputs the given value to standard output.
  console.log(finalOutput);
}

function logError(errorMessage) {
  // Outputs the given error message to standard error.
  console.error(errorMessage);
}

/*
 * This utility function converts input strings based on a specified type.
 * conversionType:
 *   0x0: No conversion, returns the input string as is.
 *   0x1: Converts the input string to an integer.
 *   0x2: Splits the input string by half-width spaces.
 *   0x3: Splits the input string by newline characters.
 *   0x4: Splits by spaces and converts each part to a number.
 *   0x5: Splits by newlines and converts each part to a number.
 *   0x6: Splits the input string into individual characters.
 *   0x7: Splits into characters and converts each to a number.
 */
function transformInput(inputStr, conversionType) {
  switch (conversionType) {
    case 0x0:
      return inputStr;
    case 0x1:
      return parseInt(inputStr, 10);
    case 0x2:
      return inputStr.split(" ");
    case 0x3:
      return inputStr.split("\n");
    case 0x4:
      return inputStr.split(" ").map((itemValue) => Number(itemValue));
    case 0x5:
      return inputStr.split("\n").map((itemValue) => Number(itemValue));
    case 0x6:
      return inputStr.split("");
    case 0x7:
      return inputStr.split("").map((itemValue) => Number(itemValue));
    default:
      return inputStr; // Fallback for unknown types
  }
}

function processData(rawInputContent) {
  // First, split the entire input by newlines.
  let parsedLines = transformInput(rawInputContent, 0x3);

  // The first line contains the total number of elements.
  const totalNumbers = transformInput(parsedLines[0], 0x1);

  // The second line contains the list of numbers, split by spaces and converted to numbers.
  const numberSequence = transformInput(parsedLines[1], 0x4);

  // Create a frequency map to count occurrences of each number.
  const valueFrequencies = {};
  for (let index = 0; index < totalNumbers; index++) {
    const currentNumber = numberSequence[index];
    if (valueFrequencies[currentNumber] === undefined) {
      valueFrequencies[currentNumber] = 1;
    } else {
      valueFrequencies[currentNumber]++;
    }
  }

  // Extract unique values and sort them numerically.
  const distinctValuesSorted = Array.from(Object.keys(valueFrequencies));
  distinctValuesSorted.sort(function (firstVal, secondVal) {
    return transformInput(firstVal, 0x1) - transformInput(secondVal, 0x1);
  });

  /*
   * The core logic involves pairing numbers from both ends of the sorted unique values.
   * Numbers with counts greater than 1 are prioritized for pairing.
   * If a number's count drops to 1, it's no longer available for pairing and is skipped.
   */
  let leftPointer = 0;
  let rightPointer = distinctValuesSorted.length - 1;

  while (true) {
    const leftElementKey = distinctValuesSorted[leftPointer];
    let leftCount = valueFrequencies[leftElementKey];

    // If the left element has a count of 1 or less, move the pointer.
    if (leftCount <= 1) {
      leftPointer++;
      continue;
    }

    const rightElementKey = distinctValuesSorted[rightPointer];
    let rightCount = valueFrequencies[rightElementKey];

    // If the right element has a count of 1 or less, move the pointer.
    if (rightCount <= 1) {
      rightPointer--;
      continue;
    }

    // If pointers cross or meet, the pairing process for distinct elements ends.
    if (leftPointer >= rightPointer) {
      // Special handling if the meeting element still has multiple counts.
      if (leftCount >= 2) {
        // If odd, one remains; if even, all are paired (count becomes 0).
        if (leftCount % 2 === 1) {
          valueFrequencies[leftElementKey] = 1;
        } else {
          valueFrencies[leftElementKey] = 0;
        }
      }
      break; // Exit the loop.
    } else {
      // Pair one from each end, decrementing their counts.
      valueFrequencies[leftElementKey]--;
      valueFrequencies[rightElementKey]--;
    }
  }

  // Count how many elements ultimately have a frequency of exactly 1.
  let finalResult = 0;
  for (let index = 0; index < distinctValuesSorted.length; index++) {
    const currentKey = distinctValuesSorted[index];
    if (valueFrequencies[currentKey] === 1) {
      finalResult++;
    }
  }

  // Output the final count.
  displayResult(finalResult);
}

// Execute the main processing function with input from stdin.
processData(getInputData());
