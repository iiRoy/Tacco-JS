const parseNumericLine = (lineContent, base = 10) => {
  // Helper function to convert a space-separated string of numbers into an array of integers.
  // Includes basic error handling for non-numeric tokens.
  return lineContent.split(' ').map(numStr => {
    const parsed = Number.parseInt(numStr.trim(), base);
    if (Number.isNaN(parsed)) {
      console.warn(`Warning: Non-numeric value encountered in input line: '${numStr}'. Defaulting to 0.`);
      return 0; // Or throw an error, depending on desired robustness.
    }
    return parsed;
  });
};

const generateSerpentineGridOutput = (rawInputData) => {
  // Perform initial validation on the raw input data.
  if (!rawInputData || typeof rawInputData !== 'string' || rawInputData.trim() === '') {
    console.error("Error: Provided input data is empty, null, or not a string.");
    return; // Exit if input is invalid.
  }

  // Split the input string into lines and filter out any empty lines.
  const inputLines = rawInputData.split('\n').filter(line => line.trim() !== '');

  // Verify that a minimum number of lines are present for parsing.
  const MIN_REQUIRED_LINES = 3;
  if (inputLines.length < MIN_REQUIRED_LINES) {
    console.error(`Error: Insufficient input lines. Expected at least ${MIN_REQUIRED_LINES}, but received ${inputLines.length}.`);
    return;
  }

  // --- Data Extraction and Initial Parsing ---
  // Parse the first line to get the grid's dimensions (height and width).
  const [gridHeight, gridWidth] = parseNumericLine(inputLines[0]);

  // Parse the second line to obtain the total count of distinct segments.
  const totalSegmentCount = Number.parseInt(inputLines[1].trim(), 10);

  // Parse the third line, which contains the individual lengths for each segment.
  const segmentLengthValues = parseNumericLine(inputLines[2]);

  // --- Input Value Validation ---
  // Ensure grid dimensions are valid positive integers.
  if (Number.isNaN(gridHeight) || Number.isNaN(gridWidth) || gridHeight <= 0 || gridWidth <= 0) {
    console.error("Error: Invalid grid dimensions detected. Height and width must be positive integers.");
    return;
  }
  // Validate the total segment count.
  if (Number.isNaN(totalSegmentCount) || totalSegmentCount < 0) {
    console.error("Error: Invalid segment count. Must be a non-negative integer.");
    return;
  }
  // Check if the number of provided segment lengths matches the declared segment count.
  if (segmentLengthValues.length !== totalSegmentCount) {
    console.warn(`Warning: Mismatch between declared segment count (${totalSegmentCount}) and actual number of segment lengths provided (${segmentLengthValues.length}). Proceeding with available lengths.`);
    // This is a new guard/warning that wasn't in the original.
  }

  // --- Constructing the Flattened Grid Cell Data ---
  // This array will hold the "color" (segment identifier) for each cell in the grid,
  // laid out in a simple row-major order.
  // Using `flatMap` provides a concise way to generate and flatten the sequence.
  const flattenedCellData = segmentLengthValues.flatMap((currentSegmentLength, segmentIdentifier) => {
    // For each segment length, create an array filled with its identifier (index + 1).
    // The identifier is `segmentIdentifier + 1` to be 1-indexed as per typical problem statements.
    return Array.from({ length: currentSegmentLength }, () => segmentIdentifier + 1);
  });

  // --- Validate and Adjust Flattened Cell Data Length ---
  const expectedTotalCells = gridHeight * gridWidth;
  if (flattenedCellData.length < expectedTotalCells) {
    console.error(`Error: Insufficient cell data to fill the grid. Expected ${expectedTotalCells} cells, but only ${flattenedCellData.length} were generated.`);
    return;
  } else if (flattenedCellData.length > expectedTotalCells) {
    // If more data is generated than needed, truncate the array.
    console.warn(`Warning: Excess cell data generated. Truncating from ${flattenedCellData.length} to fit grid size of ${expectedTotalCells} cells.`);
    flattenedCellData.length = expectedTotalCells;
  }

  // --- Generating the Serpentine Patterned Grid Output ---
  // An array to store each formatted row string before final concatenation.
  const gridLineBuffer = [];

  // Iterate through each row of the grid.
  for (let currentRowIndex = 0; currentRowIndex < gridHeight; currentRowIndex++) {
    const rowCellValues = []; // Temporary array for current row's cell values.
    // Calculate the starting index for the current row within the flattened data.
    const rowBaseOffset = currentRowIndex * gridWidth;

    // Determine if the current row should be processed left-to-right or right-to-left.
    const isLeftToRightRow = (currentRowIndex % 2 === 0);

    // Iterate through columns to populate the current row's values.
    for (let columnIterator = 0; columnIterator < gridWidth; columnIterator++) {
      let effectiveColumnIndex; // The actual column index to fetch data from.

      if (isLeftToRightRow) {
        // For even rows (0, 2, 4...), read columns in increasing order.
        effectiveColumnIndex = columnIterator;
      } else {
        // For odd rows (1, 3, 5...), read columns in decreasing order for serpentine effect.
        effectiveColumnIndex = gridWidth - 1 - columnIterator;
      }

      // Calculate the absolute index in the flattenedCellData array.
      const dataIndex = rowBaseOffset + effectiveColumnIndex;
      // Fetch the cell's color value.
      const cellValue = flattenedCellData[dataIndex];
      rowCellValues.push(cellValue);
    }
    // Join the collected cell values for the current row with spaces and add to the buffer.
    gridLineBuffer.push(rowCellValues.join(' '));
  }

  // Combine all buffered row strings into the final output, separated by newlines.
  const finalFormattedOutput = gridLineBuffer.join('\n');

  // Print the complete formatted grid to standard output.
  console.log(finalFormattedOutput);
};

// The execution environment setup: reads input from stdin and passes it to the main function.
// This part is typically kept consistent with the original problem's execution method.
generateSerpentineGridOutput(require("fs").readFileSync("/dev/stdin", "utf8"));