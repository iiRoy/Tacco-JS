"use strict";

// This function processes the input data to find a specific value based on cumulative sums.
const processInput = (inputData) => {
  // Clean up the input string and split it into lines.
  inputData = inputData.trim().split("\n");

  // Parse the first line to get the total count of items and the target cumulative value.
  const firstLineParts = inputData[0].split(" ");
  const countItems = parseInt(firstLineParts[0], 10); // Total number of entries
  const targetValue = parseInt(firstLineParts[1], 10); // The threshold for the cumulative sum

  // Extract item details from the remaining lines.
  // Each item has an identifier and a quantity.
  const itemDetails = inputData
    .slice(1, countItems + 1)
    .map((lineStr) => lineStr.split(" ").map((partStr) => parseInt(partStr, 10)));

  // Initialize an array to store cumulative data and the current running sum.
  let cumulativeData = [
    {
      identifier: itemDetails[0][0],
      quantity: itemDetails[0][1],
      runningSum: itemDetails[0][1],
    },
  ];
  let currentSum = itemDetails[0][1]; // Initialize with the first item's quantity

  // Iterate through the rest of the items to build the cumulative data array.
  for (let idx = 1; idx < countItems; idx++) {
    currentSum += itemDetails[idx - 1][1]; // Add the quantity of the *previous* item to the running sum
    // Create a new object for the current item with its identifier, quantity, and the updated running sum.
    let currentItem = {
      identifier: itemDetails[idx][0],
      quantity: itemDetails[idx][1],
      runningSum: currentSum,
    };

    cumulativeData.push(currentItem); // Add the current item's cumulative data to the array.
  }

  // Now, iterate through the cumulative data to find the first entry that meets or exceeds the target value.
  for (let entryIndex in cumulativeData) {
    if (cumulativeData[entryIndex].runningSum >= targetValue) {
      // If the running sum for the current entry is greater than or equal to the target value,
      // determine the final result.
      // The result is the current item's identifier if the sum *before* adding its quantity was less than K,
      // otherwise, it's the previous item's identifier.
      const finalResult =
        cumulativeData[entryIndex].runningSum - cumulativeData[entryIndex].quantity <
        targetValue
          ? cumulativeData[entryIndex].identifier
          : cumulativeData[entryIndex - 1].identifier;
      console.log(finalResult); // Output the determined identifier.
      return; // Exit the function after finding and printing the result.
    }
  }

  // If no entry's running sum met the target value (this case might indicate an issue or specific scenario),
  // print the entire cumulative data array as a JSON string.
  console.log(JSON.stringify(cumulativeData));
};

// Read input from standard input and pass it to the processing function.
processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
