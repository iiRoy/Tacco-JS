function GridGenerator(initialData) {
  // Parse the incoming string of numbers into an array of integers.
  // For example, "5 3" will be converted to [5, 3].
  let numericSequence = initialData.split(' ').map(singleValue => parseInt(singleValue, 10));

  // Declare variables to hold the two quantities and their associated pattern characters.
  let bigQuantity, smallQuantity, bigCharSymbol, smallCharSymbol;

  // Determine which of the two initial numbers is larger, and assign character symbols.
  // The larger number dictates the 'big' symbol, and the smaller the 'small' symbol.
  if (numericSequence[0] > numericSequence[1]) {
    bigQuantity = numericSequence[0];
    smallQuantity = numericSequence[1];
    bigCharSymbol = '.';   // Character for the predominant pattern.
    smallCharSymbol = '#'; // Character for the less frequent pattern.
  } else {
    smallQuantity = numericSequence[0];
    bigQuantity = numericSequence[1];
    smallCharSymbol = '.'; // Character for the less frequent pattern.
    bigCharSymbol = '#';   // Character for the predominant pattern.
  }

  // Calculate the overall dimension of the square grid.
  // This is based on the square root of the larger quantity, rounded up,
  // and then multiplied by 4, as the grid is constructed in 4x4 blocks.
  const gridExtent = Math.ceil(Math.sqrt(bigQuantity)) * 4;

  // Define the various 4-character patterns used to build grid rows.
  // This pattern mostly uses the 'big' character, with one 'small' character at the end.
  const firstPattern = [bigCharSymbol, bigCharSymbol, bigCharSymbol, smallCharSymbol];
  // This pattern alternates between the 'big' and 'small' characters.
  const mixedPattern = [bigCharSymbol, smallCharSymbol, bigCharSymbol, smallCharSymbol];
  // This pattern consists entirely of the 'small' character.
  const zeroPattern = [smallCharSymbol, smallCharSymbol, smallCharSymbol, smallCharSymbol];

  // Initialize the main data structure that will store the grid rows.
  let outputStructure = [];

  // Initialize counters for tracking the progress of filling patterns for both quantities.
  let mainCounter = 1, subCounter = 1;

  // Begin iterating through the grid rows, processing in chunks of 4 rows at a time.
  for (let rowIterator = 0; rowIterator < gridExtent; rowIterator += 4) {
    // Ensure that the four rows for the current block are initialized as empty arrays.
    outputStructure[rowIterator] = [];
    outputStructure[rowIterator + 1] = [];
    outputStructure[rowIterator + 2] = [];
    outputStructure[rowIterator + 3] = [];

    // Iterate through the grid columns, also processing in chunks of 4 columns.
    for (let columnIterator = 0; columnIterator < gridExtent; columnIterator += 4) {
      // Special handling for the very first 4x4 block at the top-left corner (0,0).
      if (rowIterator === 0 && columnIterator === 0) {
        outputStructure[rowIterator].push(...firstPattern);
        outputStructure[rowIterator + 1].push(...firstPattern);
        outputStructure[rowIterator + 2].push(...firstPattern);
        outputStructure[rowIterator + 3].push(...zeroPattern);
      }
      // If the main quantity counter has reached its target, fill the entire 4x4 block
      // with the 'zeroPattern' (all 'small' characters).
      else if (mainCounter === bigQuantity) {
        outputStructure[rowIterator].push(...zeroPattern);
        outputStructure[rowIterator + 1].push(...zeroPattern);
        outputStructure[rowIterator + 2].push(...zeroPattern);
        outputStructure[rowIterator + 3].push(...zeroPattern);
      }
      // If the sub quantity counter has reached its target, apply the 'firstPattern'
      // to the first three rows and the 'zeroPattern' to the fourth.
      else if (subCounter === smallQuantity) {
        outputStructure[rowIterator].push(...firstPattern);
        outputStructure[rowIterator + 1].push(...firstPattern);
        outputStructure[rowIterator + 2].push(...firstPattern);
        outputStructure[rowIterator + 3].push(...zeroPattern);
        mainCounter++; // Increment the main counter as a block has been placed.
      }
      // For all other general cases, apply a mixed set of patterns and increment both counters.
      else {
        outputStructure[rowIterator].push(...firstPattern);
        outputStructure[rowIterator + 1].push(...mixedPattern);
        outputStructure[rowIterator + 2].push(...firstPattern);
        outputStructure[rowIterator + 3].push(...zeroPattern);
        mainCounter++; // Increment both counters for this block type.
        subCounter++;
      }
    }
  }

  // After constructing the grid with character arrays, convert each row array into a single string.
  for (let rowConvertIndex = 0; rowConvertIndex < gridExtent; rowConvertIndex++) {
    outputStructure[rowConvertIndex] = outputStructure[rowConvertIndex].join('');
  }

  // Print the final grid dimensions followed by the joined grid rows.
  // The first two %d are for the grid dimensions (width and height), and %s for the grid content.
  console.log("%d %d\n%s", gridExtent, gridExtent, outputStructure.join('\n'));
}

// Execute the grid generation process by reading input from standard input.
// The input is read as UTF-8, and any leading/trailing whitespace is removed before processing.
GridGenerator(require("fs").readFileSync("/dev/stdin", "utf8").trim());