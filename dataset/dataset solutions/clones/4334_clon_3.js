const STANDARD_INPUT_PATH = "/dev/stdin";

const OutputHandler = {
  // Displays a message to standard output, possibly with a prefix.
  displayResult: function(message) {
    // Add a simple prefix for clarity, mimicking the comment style.
    console.log(`[OUTPUT] ${message}`);
  },
  // Reports an error message to standard error, with more context.
  reportIssue: function(errorMessage) {
    console.error(`[ERROR] ${errorMessage}`);
  }
};

const TransformationEngine = {
  // Internal helper to convert to integer safely.
  #safeParseInt: (val) => {
    const num = Number.parseInt(val, 10);
    if (Number.isNaN(num)) {
      throw new Error(`Cannot parse "${val}" as an integer.`);
    }
    return num;
  },

  // Defines a mapping for various data transformation operations.
  #transformationMap: new Map([
    // Case 1: Convert to integer.
    [1, (value) => TransformationEngine.#safeParseInt(value)],
    // Case 2: Split string by space.
    [2, (value) => value.split(" ")],
    // Case 4: Split by space, then convert each part to a number.
    [4, (value) => value.split(" ").map(TransformationEngine.#safeParseInt)],
    // Case 6: Split string into individual characters.
    [6, (value) => value.split("")],
    // Case 7: Split by character, then convert each part to a number.
    [7, (value) => value.split("").map(TransformationEngine.#safeParseInt)],
    // Case 8: Join array elements with a space.
    [8, (valueArray) => valueArray.join(" ")],
    // Case 9: Join array elements with a newline.
    [9, (valueArray) => valueArray.join("\n")],
    // Case 0: Join array elements without a separator.
    [0, (valueArray) => valueArray.join("")]
  ]),

  // Processes a given value based on a specified transformation code.
  applyTransformation: function(dataSegment, transformationCode) {
    const transformOperation = this.#transformationMap.get(transformationCode);

    if (transformOperation) {
      try {
        return transformOperation(dataSegment);
      } catch (err) {
        // Log the error but return the original segment for robustness, mirroring the original function's behavior.
        OutputHandler.reportIssue(`Data transformation failed for code ${transformationCode} on segment "${dataSegment}": ${err.message}`);
        return dataSegment;
      }
    } else {
      // If no specific code matches, return the original data segment unchanged.
      return dataSegment;
    }
  }
};

class InputDataProcessor {
  #bufferedLines;    // Stores lines from the input source.
  #currentLineIndex; // Tracks the current position in the buffered lines.
  #totalLineCount;   // Total number of lines available.

  constructor(sourcePath) {
    let fileContents;
    try {
      // Read the entire file synchronously.
      fileContents = require("fs").readFileSync(sourcePath, "utf8");
    } catch (readError) {
      OutputHandler.reportIssue(`Critical: Could not read input from ${sourcePath}. Error: ${readError.message}`);
      this.#bufferedLines = [];
      this.#totalLineCount = 0;
      this.#currentLineIndex = 0;
      return;
    }

    // Process the raw file content: split into lines, trim whitespace, and discard empty lines.
    this.#bufferedLines = fileContents
      .split("\n")
      .map(line => line.trim())
      .filter(line => line.length > 0); // Only keep non-empty lines.

    this.#totalLineCount = this.#bufferedLines.length;
    this.#currentLineIndex = 0;

    if (this.#totalLineCount === 0) {
      OutputHandler.reportIssue("Warning: Input file processed but contains no valid data lines.");
    }
  }

  // Determines if there are more lines left to read.
  hasMoreLines() {
    return this.#currentLineIndex < this.#totalLineCount;
  }

  // Retrieves the next line from the input buffer.
  retrieveNextLine() {
    if (!this.hasMoreLines()) {
      throw new Error("InputBufferExhausted: Attempted to read beyond the end of the input stream.");
    }
    const lineToReturn = this.#bufferedLines[this.#currentLineIndex];
    this.#currentLineIndex++; // Advance the pointer to the next line.
    return lineToReturn;
  }
}

// The core logic of the program.
function executeMainAlgorithm() {
  const dataSource = new InputDataProcessor(STANDARD_INPUT_PATH);

  // Early exit if no input data is available.
  if (!dataSource.hasMoreLines()) {
    OutputHandler.displayResult("No");
    return;
  }

  // Read and parse the first line, which contains N, M, K.
  const initialParameters = TransformationEngine.applyTransformation(dataSource.retrieveNextLine(), 4); // Code 4: split by space, map to numbers.

  // Validate the structure of the initial parameters.
  if (!Array.isArray(initialParameters) || initialParameters.length !== 3) {
    OutputHandler.reportIssue("Error: Initial parameters line is malformed. Expected three numeric values.");
    OutputHandler.displayResult("No");
    return;
  }

  const dimensionN = initialParameters[0]; // Corresponds to original 'N'
  const dimensionM = initialParameters[1]; // Corresponds to original 'M'
  const targetSumK = initialParameters[2]; // Corresponds to original 'K'

  // Validate that N, M are positive integers and K is a non-negative integer.
  if (dimensionN <= 0 || dimensionM <= 0 || targetSumK < 0 ||
      !Number.isInteger(dimensionN) || !Number.isInteger(dimensionM) || !Number.isInteger(targetSumK)) {
    OutputHandler.reportIssue(`Error: Invalid input values. N=${dimensionN}, M=${dimensionM} must be positive integers; K=${targetSumK} must be a non-negative integer.`);
    OutputHandler.displayResult("No");
    return;
  }

  let solutionFound = false; // Flag to track if a valid combination is found.

  // First, check for simple conditions: if K is directly divisible by N or M.
  // This is an optimization for quick exits.
  if (targetSumK % dimensionM === 0 || targetSumK % dimensionN === 0) {
    solutionFound = true;
  } else {
    // If simple conditions don't yield a solution, proceed with the iterative search.
    // Loop through all possible combinations of 'i' from 1 to N and 'j' from 1 to M.
    for (let i_val = 1; i_val <= dimensionN; i_val++) {
      for (let j_val = 1; j_val <= dimensionM; j_val++) {
        // Calculate the current value using an algebraically equivalent form:
        // Original: (M * i) + (N * j) - 2 * (i * j)
        // Rewritten: (i * (M - j)) + (j * (N - i))
        const currentCalculatedTotal = (i_val * (dimensionM - j_val)) + (j_val * (dimensionN - i_val));

        // If the current calculation matches the target K, a solution is found.
        if (currentCalculatedTotal === targetSumK) {
          solutionFound = true;
          // Use a labeled break or modify loop variables to exit both loops efficiently.
          // Setting i_val to exceed dimensionN will terminate the outer loop in the next iteration.
          i_val = dimensionN + 1;
          break; // Exit the inner loop immediately.
        }
      }
    }
  }

  // Output the final determination.
  if (solutionFound) {
    OutputHandler.displayResult("Yes");
  } else {
    OutputHandler.displayResult("No");
  }
}

// Start the program execution.
executeMainAlgorithm();