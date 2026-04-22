"use strict";

// This is the primary function that handles the incoming data stream.
const processInput = rawInputData => {

  // First, normalize the input by trimming whitespace and splitting into individual lines.
  let processedLines = rawInputData.trim()
                                   .split("\n");

  // Extract the first configuration number (N) from the initial line.
  const recordCount = parseInt(processedLines[0].split(" ")[0]);

  // Extract the second configuration number (K) from the initial line.
  const thresholdValue = parseInt(processedLines[0].split(" ")[1]);


  // Parse the subsequent lines into an array of number pairs.
  const dataPairs = processedLines.slice(1, recordCount + 1)
                                  .map(lineStr => lineStr.split(" ")
                                                           .map(numStr => parseInt(numStr)));


  // Initialize a list to store cumulative data.
  let cumulativeList = [
    {
      identifier: dataPairs[0][0],
      individualValue: dataPairs[0][1],
      runningSum: dataPairs[0][1]
    }
  ];

  // Initialize a variable to keep track of the current running total.
  let currentSum = dataPairs[0][1];


  // Iterate through the remaining data pairs to build the cumulative list.
  for (let idx = 1; idx < recordCount; idx++) {

    // Add the current individual value to the running total.
    currentSum += dataPairs[idx][1];

    // Create a temporary object for the current entry.
    let currentItem = {
      identifier: dataPairs[idx][0],
      individualValue: dataPairs[idx][1],
      runningSum: currentSum
    };

    // Add the new cumulative item to our collection.
    cumulativeList.push(currentItem);

  } // End of data accumulation loop.

  // The following line was used for debugging purposes and is now commented out.
  // console.debug(JSON.stringify(cumulativeList));


  // Now, iterate through the constructed list to find the first entry that meets the condition.
  for (let entryIndex in cumulativeList) {

    // Check if the running sum of the current entry meets or exceeds the specified threshold.
    if (cumulativeList[entryIndex].runningSum >= thresholdValue) {

      // Output the full details of the entry that satisfied the condition.
      console.log(JSON.stringify(cumulativeList[entryIndex]));

      // Determine the final result based on whether the previous entry's sum was also above the threshold.
      const finalResult = (cumulativeList[entryIndex].runningSum - cumulativeList[entryIndex].individualValue < thresholdValue)
                            ? cumulativeList[entryIndex].identifier
                            : cumulativeList[entryIndex - 1].identifier;

      // Print the calculated result.
      console.log(finalResult);

      // Exit the function immediately after finding the first matching entry.
      return;
    }
  }

  // If no entry met the threshold, output the entire cumulative list (this case should ideally not be reached if K is reasonable).
  console.log(JSON.stringify(cumulativeList));
};

// Invoke the main processing function with content read from standard input.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));