function ProcessData(rawData) {
  // This function takes raw input data as a string.
  // It processes the data to determine if there are any duplicate numbers in the second line.

  // First, the input string is divided into an array of strings,
  // with each element representing a line from the original input.
  let linesOfText = rawData.split("\n");

  // The second line (at index 1) is then taken and split by spaces.
  // This creates an array of strings, where each string is expected to be a number.
  let processedNumbers = linesOfText[1].split(" ");

  // A custom comparison function is defined for sorting.
  // This function ensures that the array elements are sorted numerically rather than lexicographically.
  const numericComparator = (firstElement, secondElement) => {
    // Converts string elements to integers and subtracts them to achieve numerical sorting.
    return parseInt(firstElement, 10) - parseInt(secondElement, 10);
  };

  // The array of number strings is sorted in ascending numerical order.
  processedNumbers = processedNumbers.sort(numericComparator);

  // A boolean variable is initialized to track whether any duplicate numbers are found.
  let hasDuplicates = false;

  // The code then iterates through the sorted array, starting from the second element.
  // It compares each element with its immediate predecessor.
  for (let currentIdx = 1; currentIdx < processedNumbers.length; currentIdx++) {
    // If an element is found to be identical to the one before it,
    // it signifies the presence of a duplicate.
    if (processedNumbers[currentIdx - 1] === processedNumbers[currentIdx]) {
      hasDuplicates = true; // The duplicate flag is set to true.
      // The loop continues to check for other potential duplicates, mirroring the original logic.
    }
  }

  // Finally, based on the value of the 'hasDuplicates' flag,
  // an appropriate message is printed to the console.
  if (hasDuplicates) {
    console.log("NO"); // If duplicates were found, "NO" is output.
  } else {
    console.log("YES"); // Otherwise, "YES" is output.
  }
}

// The main processing function is invoked with data read from standard input.
// The data is read as UTF-8, and any leading or trailing whitespace is removed.
ProcessData(require("fs").readFileSync("/dev/stdin", "utf8").trim());
