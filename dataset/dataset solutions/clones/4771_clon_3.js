var _helpers;
var sourceData;
var DisplayResult;

// A general-purpose helper collection for common data manipulations.
class UtilityBelt {
  // Aggregates all numeric elements in a collection by summing them up.
  aggregateNumbers(dataCollection) {
    let totalSum = 0;
    // Input validation: ensure it's an array and not empty.
    if (!Array.isArray(dataCollection) || dataCollection.length === 0) {
      console.warn("Warning: Attempted to sum an empty or non-array collection. Returning 0.");
      return 0;
    }
    // Iterate through the collection to sum numeric values.
    for (let currentValue of dataCollection) {
      if (typeof currentValue === 'number' && !isNaN(currentValue)) {
        totalSum += currentValue;
      } else {
        console.warn(`Warning: Non-numeric element encountered: '${currentValue}'. Skipping this element.`);
      }
    }
    return totalSum;
  }

  // Identifies the smallest element within a collection based on an optional comparator function.
  findMinimum(values, comparator) {
    if (!Array.isArray(values) || values.length === 0) {
      return undefined; // Return undefined for empty or invalid input.
    }
    // Establish a default numerical comparison function if none is provided.
    const comparisonFunction = comparator || ((valA, valB) => valA - valB);

    let currentMin = values[0];
    // Iterate from the second element to find the minimum.
    for (let i = 1; i < values.length; i++) {
      if (comparisonFunction(values[i], currentMin) < 0) {
        currentMin = values[i];
      }
    }
    return currentMin;
  }

  // Identifies the largest element within a collection based on an optional comparator function.
  findMaximum(values, comparator) {
    if (!Array.isArray(values) || values.length === 0) {
      return undefined; // Return undefined for empty or invalid input.
    }
    // Establish a default numerical comparison function if none is provided.
    const comparisonFunction = comparator || ((valA, valB) => valA - valB);

    let currentMax = values[0];
    // Iterate from the second element to find the maximum.
    for (let i = 1; i < values.length; i++) {
      if (comparisonFunction(values[i], currentMax) > 0) {
        currentMax = values[i];
      }
    }
    return currentMax;
  }

  // Sorts an array's elements using a provided comparison function.
  orderElements(items, sortFn) {
    if (!Array.isArray(items)) {
      console.error("Error: Input for orderElements must be an array.");
      return []; // Return an empty array for invalid input.
    }
    // Create a shallow copy to prevent modifying the original array directly.
    const copiedItems = [...items]; 
    const effectiveSortFunction = sortFn || ((valA, valB) => valA - valB);
    return copiedItems.sort(effectiveSortFunction);
  }

  // Generates a numerical sequence of values.
  generateSequence(begin, end, stepVal) {
    let actualStart = begin || 0;
    let actualStop = end;
    let stepAmount = stepVal;

    // Adjust parameters if only a single 'stop' argument is provided.
    if (actualStop == null) {
      actualStop = actualStart;
      actualStart = 0;
    }

    // Determine the step direction if not explicitly given.
    if (stepAmount == null) {
      stepAmount = actualStop < actualStart ? -1 : 1;
    } else if (stepAmount === 0) {
      console.error("Error: Step value cannot be zero in generateSequence.");
      return []; // Return an empty array for invalid step.
    }

    // Calculate the length of the sequence, ensuring it's non-negative.
    let sequenceLength = Math.floor((actualStop - actualStart) / stepAmount);
    if (sequenceLength < 0) {
        sequenceLength = 0;
    }

    const numericSequence = [];
    // Populate the sequence array.
    for (let currentIdx = 0; currentIdx < sequenceLength; currentIdx++) {
      numericSequence.push(actualStart + (currentIdx * stepAmount));
    }
    return numericSequence;
  }

  // Computes the differences between consecutive elements in a numerical series.
  calculateDifferences(inputSeries) {
    if (!Array.isArray(inputSeries) || inputSeries.length < 2) {
      console.warn("Warning: Input series for calculateDifferences must have at least two elements. Returning empty array.");
      return []; // Cannot calculate differences for short arrays.
    }
    // Use array slicing and mapping for a concise transformation.
    return inputSeries.slice(1).map((currentVal, index) => {
      return currentVal - inputSeries[index];
    });
  }

  // Note: Several original Underscore methods (e.g., first, initial, tail, last, sumArray, binarySearch)
  // have been intentionally removed as Type III changes because they are not utilized by the main application logic.
}

// Instantiate the utility collection for global access.
_helpers = new UtilityBelt();

// Manages all operations related to reading and parsing input data.
class DataSource {
  constructor() {
    this.readIndex = 0;
    this.rawLines = [];
    this.loadAllData();
  }

  // Loads all input data from the standard input stream.
  loadAllData() {
    try {
      this.rawLines = (require("fs").readFileSync("/dev/stdin", "utf8")).split('\n');
      // Remove any trailing empty line that might result from stdin.
      if (this.rawLines.length > 0 && this.rawLines[this.rawLines.length - 1] === '') {
        this.rawLines.pop();
      }
    } catch (error) {
      console.error("Critical Error: Failed to load input data from /dev/stdin. Details:", error.message);
      this.rawLines = []; // Ensure rawLines is an array even on error.
    }
  }

  // Retrieves one or multiple lines of text from the input buffer.
  fetchLines(count) {
    // If a specific count of lines is requested.
    if (count != null && count > 0) {
      if (this.readIndex + count > this.rawLines.length) {
        console.warn(`Warning: Requested ${count} lines, but only ${this.rawLines.length - this.readIndex} are available.`);
        count = this.rawLines.length - this.readIndex; // Adjust count to available lines.
      }
      const retrievedBlock = this.rawLines.slice(this.readIndex, this.readIndex + count);
      this.readIndex += count;
      return retrievedBlock;
    }
    // Default behavior: retrieve a single line.
    if (this.readIndex >= this.rawLines.length) {
      console.warn("Warning: Attempted to read past the end of available input data.");
      return undefined;
    }
    return this.rawLines[this.readIndex++];
  }

  // Parses the next available line as an integer.
  getNextInteger() {
    const lineContent = this.fetchLines();
    if (lineContent === undefined) return NaN; // Indicate failure if no line is available.
    const parsedValue = parseInt(lineContent, 10); // Use radix 10 for explicit base.
    if (isNaN(parsedValue)) {
      console.warn(`Warning: Could not parse "${lineContent}" as an integer. Returning NaN.`);
    }
    return parsedValue;
  }

  // Parses the next line into an array of strings, split by spaces.
  getNextStringArray() {
    const line = this.fetchLines();
    return line ? line.split(' ') : []; // Return empty array if no line was fetched.
  }

  // Parses the next line into an array of integers.
  retrieveIntegerArray() {
    const stringParts = this.getNextStringArray();
    return stringParts.map((str) => {
      const num = parseInt(str, 10);
      return isNaN(num) ? 0 : num; // Default to 0 if parsing fails.
    });
  }

  // Parses the next line into an array of floating-point numbers.
  retrieveFloatArray() {
    const stringParts = this.getNextStringArray();
    return stringParts.map((str) => {
      const num = parseFloat(str);
      return isNaN(num) ? 0.0 : num; // Default to 0.0 if parsing fails.
    });
  }

  // Fetches multiple lines and parses each into an integer.
  fetchIntegerLines(num) {
    const lines = this.fetchLines(num);
    if (!Array.isArray(lines)) return [];
    return lines.map((line) => parseInt(line, 10));
  }

  // Fetches multiple lines and parses each into a float.
  fetchFloatLines(num) {
    const lines = this.fetchLines(num);
    if (!Array.isArray(lines)) return [];
    return lines.map((line) => parseFloat(line));
  }

  // Fetches multiple lines and splits each into a string array, forming a 2D string matrix.
  fetchStringMatrix(numRows) {
    const lines = this.fetchLines(numRows);
    if (!Array.isArray(lines)) return [];
    return lines.map((rowText) => rowText.split(' '));
  }

  // Fetches multiple lines and parses each into an integer array, forming a 2D integer matrix.
  fetchIntegerMatrix(numRows) {
    const lines = this.fetchLines(numRows);
    if (!Array.isArray(lines)) return [];
    return lines.map((rowText) => rowText.split(' ').map((e) => parseInt(e, 10)));
  }

  // Fetches multiple lines and parses each into a float array, forming a 2D float matrix.
  fetchFloatMatrix(numRows) {
    const lines = this.fetchLines(numRows);
    if (!Array.isArray(lines)) return [];
    return lines.map((rowText) => rowText.split(' ').map((e) => parseFloat(e)));
  }
}

// Instantiate the data source for input operations.
sourceData = new DataSource();

// Main application logic container.
class Processor {
  // Executes the primary computation task.
  computeOutcome() {
    // Retrieve initial configuration values (e.g., N, A, B).
    const configurationValues = sourceData.retrieveIntegerArray();
    // Retrieve the main data series (e.g., X values).
    const inputDataSeries = sourceData.retrieveIntegerArray();

    // Extensive validation for required input data.
    if (!Array.isArray(configurationValues) || configurationValues.length < 3) {
      console.error("Error: Configuration values array is missing or has fewer than 3 elements.");
      return 0; // Default error value.
    }
    if (!Array.isArray(inputDataSeries) || inputDataSeries.length < 2) {
      console.error("Error: Input data series is missing or has fewer than 2 elements for difference calculation.");
      return 0; // Default error value.
    }

    // Extract specific parameters from the configuration array for clarity.
    const multiplierParam = configurationValues[1]; // Corresponds to 'A' in original problem context.
    const ceilingValue = configurationValues[2];    // Corresponds to 'B' in original problem context.

    // Calculate the differences between adjacent elements in the input series.
    const sequentialDifferences = _helpers.calculateDifferences(inputDataSeries);

    // Process each difference: multiply it by 'A', then cap the result at 'B'.
    const processedValues = [];
    for (const differential of sequentialDifferences) {
      const multipliedValue = differential * multiplierParam;
      // Apply the ceiling value using a ternary operator.
      const cappedValue = (multipliedValue < ceilingValue) ? multipliedValue : ceilingValue;
      processedValues.push(cappedValue);
    }

    // Finally, sum all the processed values to get the outcome.
    return _helpers.aggregateNumbers(processedValues);
  }
}

// Function to handle the display of the final computed result.
DisplayResult = function(finalOutcome) {
  let outputString;

  // Handle cases where the outcome is null or undefined explicitly.
  if (finalOutcome === null || finalOutcome === undefined) {
    outputString = "No result was computed.";
    console.log(outputString);
    return;
  }

  // Use a switch statement to format the output based on its type.
  switch (typeof finalOutcome) {
    case 'boolean':
      outputString = finalOutcome ? 'Yes' : 'No';
      break;
    case 'number':
    case 'string':
      outputString = String(finalOutcome); // Ensure it's a string for consistent output.
      break;
    default:
      // Attempt to serialize complex objects or arrays for display.
      try {
        outputString = JSON.stringify(finalOutcome, null, 2); // Pretty print JSON.
      } catch (e) {
        outputString = `[Unserializable Result Type: ${typeof finalOutcome}]`;
      }
      break;
  }
  // Log the final output with a descriptive prefix.
  console.log("Final Computed Outcome: " + outputString);
};

// Initiate the main processing flow and display its result.
DisplayResult(new Processor().computeOutcome());