function ProcessInput(rawData) {
  "use strict"; // Enforce strict parsing and error handling.

  // Split the entire input string into an array of lines.
  const lines = rawData.split("\n");

  // Extract the first line, split it by space, and convert parts to integers.
  const dimensionsAndParams = lines.shift().split(" ").map(elementStr => parseInt(elementStr, 10));

  // Assign the parsed values to descriptive variables.
  const heightVal = dimensionsAndParams.shift(); // Represents 'h'
  const widthVal = dimensionsAndParams.shift();  // Represents 'w'
  const paramA = dimensionsAndParams.shift();    // Represents 'a'
  const paramB = dimensionsAndParams.shift();    // Represents 'b'

  // --- Conditional logic based on parameters ---

  // Case 1: If parameter 'b' is zero.
  if (paramB === 0) {
    let outputLine = ""; // Initialize an empty string for the pattern.
    // Construct the pattern for a single row: 'a' ones followed by 'w-a' zeros.
    for (let colIdx = 0; colIdx < widthVal; colIdx++) {
      if (colIdx < paramA) {
        outputLine += "1";
      } else {
        outputLine += "0";
      }
    }
    // Print this pattern 'h' times.
    for (let rowIdx = 0; rowIdx < heightVal; rowIdx++) {
      console.log(outputLine);
    }
  }
  // Case 2: If parameter 'a' is zero (and 'b' is not zero, due to previous if).
  else if (paramA === 0) {
    let zeroString = ""; // String of all zeros.
    let oneString = "";  // String of all ones.
    // Populate the two pattern strings.
    for (let colIdx = 0; colIdx < widthVal; colIdx++) {
      zeroString += "0";
      oneString += "1";
    }
    // Print 'zeroString' for the first 'b' rows, then 'oneString' for the remaining 'h-b' rows.
    for (let rowIdx = 0; rowIdx < heightVal; rowIdx++) {
      if (rowIdx < paramB) {
        console.log(zeroString);
      } else {
        console.log(oneString);
      }
    }
  }
  // Case 3: If the product of height and 'a' does not equal the product of width and 'b'.
  else if (heightVal * paramA !== widthVal * paramB) {
    console.log("No"); // Output "No" as per problem specification.
  }
  // Case 4: General case where 'a' and 'b' are non-zero, and the products match.
  else {
    // Sub-case 4.1: If 'w' is perfectly divisible by 'a'.
    if (widthVal % paramA === 0) {
      // Iterate through each row to generate its pattern.
      for (let rowIdx = 0; rowIdx < heightVal; rowIdx++) {
        let outputLine = "";
        // Determine the current block index based on row and 'b'.
        const currentBlockIndex = Math.floor(rowIdx / paramB);
        // Generate the pattern for the current row.
        for (let colIdx = 0; colIdx < widthVal; colIdx++) {
          // A '1' is placed if the column index falls within the current block.
          if (colIdx >= currentBlockIndex * paramA && colIdx < (currentBlockIndex + 1) * paramA) {
            outputLine += "1";
          } else {
            outputLine += "0";
          }
        }
        console.log(outputLine); // Print the generated row pattern.
      }
    }
    // Sub-case 4.2: If 'w' is not perfectly divisible by 'a'.
    else {
      // Iterate through each row to generate its pattern.
      for (let rowIdx = 0; rowIdx < heightVal; rowIdx++) {
        let outputLine = "";
        // Check a specific condition involving modulo arithmetic.
        if ((rowIdx * paramA % widthVal) + paramA >= widthVal) {
          // Generate pattern for this specific sub-condition.
          for (let colIdx = 0; colIdx < widthVal; colIdx++) {
            // '1' if column index is in one of two ranges (wrapping around).
            if (colIdx >= (rowIdx * paramA % widthVal) || colIdx < ((rowIdx + 1) * paramA % widthVal)) {
              outputLine += "1";
            } else {
              outputLine += "0";
            }
          }
        } else {
          // Generate pattern for the alternative sub-condition.
          for (let colIdx = 0; colIdx < widthVal; colIdx++) {
            // '1' if column index is within a single contiguous range.
            if (colIdx >= (rowIdx * paramA % widthVal) && colIdx < ((rowIdx + 1) * paramA % widthVal)) {
              outputLine += "1";
            } else {
              outputLine += "0";
            }
          }
        }
        console.log(outputLine); // Print the generated row pattern.
      }
    }
  }
}

// The following line handles standard input/output and should not be modified.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
