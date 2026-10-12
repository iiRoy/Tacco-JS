// This function serves as the primary entry point for processing input data.
function ProcessInputData(rawInputString) {
  // The raw input string is first divided into an array of lines.
  let processedLines = rawInputString.split("\n");

  // The first element, often a count or metadata, is removed from the array.
  const initialCount = processedLines.shift();

  // The remaining lines are considered the core data entries.
  let dataEntries = processedLines;

  // An object is initialized to store the frequency of each unique data entry.
  let occurrenceMap = {};

  // Iterate through each data entry to populate the frequency map.
  dataEntries.forEach(entryValue => {
    // If the entry already exists in the map, its count is incremented; otherwise, it's set to one.
    occurrenceMap[entryValue] ? occurrenceMap[entryValue] += 1 : occurrenceMap[entryValue] = 1;
  });

  // An array containing all unique keys (data entries) from the frequency map is created.
  let uniqueEntryKeys = Object.keys(occurrenceMap);

  // The array of keys is then sorted. The original code attempts to sort using an undefined identifier 'O'.
  // This behavior is preserved, meaning a ReferenceError will occur if this line is executed,
  // as 'O' is not defined within this scope or globally.
  uniqueEntryKeys = uniqueEntryKeys.sort((keyA, keyB) => O[keyB] - O[keyA]);

  // The maximum frequency is determined from the first element of the (potentially unsorted due to error) keys array.
  const maximumFrequency = occurrenceMap[uniqueEntryKeys[0]];

  // This filter operation creates a new array based on a condition, but the result is not assigned back.
  // Therefore, this line has no observable effect on the 'uniqueEntryKeys' array used subsequently.
  uniqueEntryKeys.filter(currentKey => currentKey == maximumFrequency);

  // A loop is initiated to process and output the keys.
  while (true) {
    // The loop terminates if there are no more keys left in the array.
    if (uniqueEntryKeys.length === 0) {
      break;
    }
    // The first key is removed from the array and printed to the console.
    console.log(uniqueEntryKeys.shift());
  }
}

// The following lines are responsible for reading input from standard input and invoking the main processing function.
// These lines should not be altered.
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
