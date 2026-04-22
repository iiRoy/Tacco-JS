// This primary function processes a given input string to analyze numerical sequences.
function ProcessDataStream(rawData) {

  // First, the raw input data is divided into individual rows
  // using the newline character as a delimiter.
  const dataRows = rawData.split('\n');

  // The very first row is expected to contain the total count of items.
  // This string value is converted into a numerical integer.
  let totalElements = Number(dataRows[0]);

  // The second row holds space-separated numeric items.
  // These are split into an array of string representations.
  let itemArray = dataRows[1].split(' ');

  // To facilitate counting, the array of stringified numbers is sorted
  // in ascending order.
  itemArray.sort();

  // An internal pointer is initialized to keep track of the current position
  // within the sorted item array during traversal.
  let arrayPointer = 0;

  // A variable to hold the computed frequency (occurrence count)
  // for each distinct expected value.
  let frequency;

  // A loop iterates through each expected integer value, starting from one
  // up to the 'totalElements' count.
  for (let expectedValue = 1; expectedValue <= totalElements; expectedValue++) {

    // For every new expected value, the frequency counter is reset to zero.
    frequency = 0;

    // This inner loop continues as long as the numerical value of the item
    // at the 'arrayPointer' matches the 'expectedValue' AND the pointer
    // has not exceeded the bounds of the 'totalElements'.
    while (Number(itemArray[arrayPointer]) == expectedValue && arrayPointer < totalElements) {
      arrayPointer++; // Advance the pointer to the next element in the array.
      frequency++;    // Increment the occurrence count for the current 'expectedValue'.
    }

    // Once all occurrences of the 'expectedValue' have been counted,
    // its total frequency is printed to the console.
    console.log(frequency);
  }
}

// The program initiates by reading the entire content of the standard input
// asynchronously, decoding it as UTF-8, and then passes this raw string
// to the 'ProcessDataStream' function for analysis.
ProcessDataStream(require("fs").readFileSync("/dev/stdin", "utf8"));