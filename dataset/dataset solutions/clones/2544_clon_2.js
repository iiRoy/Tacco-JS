function ExecuteProgram(dataSource) {
  // Enforce strict mode for better code quality and fewer common errors.
  "use strict";

  // Split the entire provided input string into an array of individual line segments.
  const dataSegments = dataSource.split("\n");

  // Process the first line of input to extract configuration parameters.
  // This involves removing the first line, splitting it by space,
  // and converting each part from a string to an integer.
  const configurationValues = dataSegments.shift().split(" ").map(itemValue => parseInt(itemValue, 10));

  // Destructure the configuration values into distinct, meaningful variables.
  const rowsCount = configurationValues.shift();       // Represents the total number of rows.
  const colsCount = configurationValues.shift();       // Represents the total number of columns.
  const firstThreshold = configurationValues.shift();  // A primary threshold parameter, often 'a'.
  const secondThreshold = configurationValues.shift(); // A secondary threshold parameter, often 'b'.


  // --- Main Logic Branching Based on Thresholds ---

  // Case 1: The secondary threshold is zero.
  if (secondThreshold === 0) {
    let currentLinePattern = ""; // Initialize an empty string to build the output pattern for a single row.

    // Construct the pattern for one row: '1's up to 'firstThreshold', then '0's.
    for (let colIterator = 0; colIterator < colsCount; colIterator++) {
      if (colIterator < firstThreshold) {
        currentLinePattern += "1";
      } else {
        currentLinePattern += "0";
      }
    }

    // Output this constructed pattern for all 'rowsCount' rows.
    for (let rowIterator = 0; rowIterator < rowsCount; rowIterator++) {
      console.log(currentLinePattern);
    }
  }
  // Case 2: The primary threshold is zero.
  else if (firstThreshold === 0) {
    let allZerosPattern = ""; // String to hold a pattern of all '0's.
    let allOnesPattern = "";  // String to hold a pattern of all '1's.

    // Fill the 'allZerosPattern' and 'allOnesPattern' based on 'colsCount'.
    for (let colIterator = 0; colIterator < colsCount; colIterator++) {
      allZerosPattern += "0";
      allOnesPattern += "1";
    }

    // Print patterns: 'allZerosPattern' for rows up to 'secondThreshold', then 'allOnesPattern'.
    for (let rowIterator = 0; rowIterator < rowsCount; rowIterator++) {
      if (rowIterator < secondThreshold) {
        console.log(allZerosPattern);
      } else {
        console.log(allOnesPattern);
      }
    }
  }
  // Case 3: A specific condition relating dimensions and thresholds is not met.
  else if (rowsCount * firstThreshold !== colsCount * secondThreshold) {
    console.log("No"); // Indicate that a valid pattern cannot be formed under this condition.
  }
  // Case 4: General pattern generation logic for non-zero thresholds and valid matrix property.
  else {
    // Sub-case 4a: The column count is perfectly divisible by the primary threshold.
    if (colsCount % firstThreshold === 0) {
      for (let rowIdx = 0; rowIdx < rowsCount; rowIdx++) {
        let generatedString = ""; // String to build the output for the current row.

        // Calculate a block identifier based on current row and secondary threshold.
        const blockIdentifier = Math.floor(rowIdx / secondThreshold);

        for (let colIdx = 0; colIdx < colsCount; colIdx++) {
          // Place '1's within a specific block range determined by the block identifier.
          if (colIdx >= blockIdentifier * firstThreshold && colIdx < (blockIdentifier + 1) * firstThreshold) {
            generatedString += "1";
          } else {
            generatedString += "0";
          }
        }
        console.log(generatedString); // Output the complete row string.
      }
    }
    // Sub-case 4b: The column count is not perfectly divisible by the primary threshold.
    else {
      for (let rowIdx = 0; rowIdx < rowsCount; rowIdx++) {
        let generatedString = ""; // String to build the output for the current row.

        // Check for pattern wrapping condition across column boundaries.
        if ((rowIdx * firstThreshold % colsCount) + firstThreshold >= colsCount) {
          for (let colIdx = 0; colIdx < colsCount; colIdx++) {
            // Apply wrapping logic for placing '1's.
            if (colIdx >= (rowIdx * firstThreshold % colsCount) || colIdx < ((rowIdx + 1) * firstThreshold % colsCount)) {
              generatedString += "1";
            } else {
              generatedString += "0";
            }
          }
        } else {
          for (let colIdx = 0; colIdx < colsCount; colIdx++) {
            // Apply standard non-wrapping logic for placing '1's.
            if (colIdx >= (rowIdx * firstThreshold % colsCount) && colIdx < ((rowIdx + 1) * firstThreshold % colsCount)) {
              generatedString += "1";
            } else {
              generatedString += "0";
            }
          }
        }
        console.log(generatedString); // Output the complete row string.
      }
    }
  }
}

// This section handles reading input from standard input and then executing
// the primary program function. It should generally remain unchanged
// as it is part of the execution environment setup.
ExecuteProgram(require("fs").readFileSync("/dev/stdin", "utf8"));