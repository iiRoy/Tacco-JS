const ProcessData = (rawData) => {
  // Split the raw input string into an array of individual lines
  let linesOfText = rawData.split('\n');

  // Loop indefinitely to process each line of input data
  for (let lineIndex = 0; ; lineIndex++) {
    // Further split the current line into an array of string parts
    linesOfText[lineIndex] = linesOfText[lineIndex].split(' ');

    // Parse the numerical values from the current line's parts
    const valA = parseInt(linesOfText[lineIndex][0], 10);
    const valB = parseInt(linesOfText[lineIndex][1], 10);
    const targetSum = parseInt(linesOfText[lineIndex][2], 10);

    // Check if the termination condition (all zeros) is met
    if (valA === 0 && valB === 0 && targetSum === 0) {
      break; // Exit the primary processing loop
    }

    // Initialize a variable to store the maximum calculated value for the current line
    let greatestValue = 0;

    // Iterate through possible ways to split the target sum into two parts
    for (let firstPart = 1; firstPart < targetSum; firstPart++) {
      // Create an array to hold the two parts of the split sum
      const partsArray = [];
      partsArray[0] = firstPart;
      partsArray[1] = targetSum - firstPart;

      // Initialize a running total and a flag for invalid conditions
      let currentTotal = 0;
      let isInvalid = false;

      // Process each of the two parts
      for (let partIndex = 0; partIndex < 2; partIndex++) {
        // Calculate an adjusted part value based on valA
        let adjustedPart = Math.floor(partsArray[partIndex] / (100 + valA) * 100) + 1;

        // Decrement the adjusted part until a specific condition is met
        while (adjustedPart * (100 + valA) / 100 >= partsArray[partIndex] + 1) {
          adjustedPart--;
        }

        // Check if the adjusted part falls below a threshold, indicating an invalid state
        if (adjustedPart * (100 + valA) / 100 < partsArray[partIndex]) {
          isInvalid = true; // Set the flag
        }

        // Calculate a final part value based on the adjusted part and valB
        let calculatedPart = Math.floor(adjustedPart * (100 + valB) / 100);

        // Handle a specific edge case for the calculated part
        if (calculatedPart + 1 === adjustedPart * (100 + valB) / 100) {
          calculatedPart++;
        }

        // Add the calculated part to the running total
        currentTotal += calculatedPart;
      } // End of inner loop for parts

      // If an invalid condition was detected, skip to the next iteration of the outer loop
      if (isInvalid) {
        continue;
      }

      // Update the greatest value if the current total is higher
      if (greatestValue < currentTotal) {
        greatestValue = currentTotal;
      }
    } // End of loop for firstPart

    // Output the maximum value found for the current line's input
    console.log(greatestValue);
  } // End of main line processing loop
}; // Close the function definition

// Read the input from standard input and pass it to the processing function
ProcessData(require('fs').readFileSync('/dev/stdin', 'utf8'));