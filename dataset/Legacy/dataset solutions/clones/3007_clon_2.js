function ProcessInput(rawData) {
  // Split the raw input string into an array of lines for easier processing.
  let processedLines = rawData.split("\n");

  // Extract the string representations of values from the second line.
  let valueStrings = processedLines[1].split(" ");
  // Extract the string representations of costs from the third line.
  let costStrings = processedLines[2].split(" ");

  // Parse the total number of elements from the first line of input.
  const countElements = parseInt(processedLines[0], 10);

  // Initialize arrays to hold the numeric values and costs after parsing.
  let itemValues = new Array(countElements);
  let itemCosts = new Array(countElements);

  // Initialize a variable to accumulate the total positive benefit.
  let totalBenefit = 0;

  // Iterate through the string arrays to parse and store integer values and costs.
  for (let idx = 0; idx < countElements; idx++) {
    itemValues[idx] = parseInt(valueStrings[idx], 10);
    itemCosts[idx] = parseInt(costStrings[idx], 10);
  }

  // Iterate again to calculate the benefit for each item and sum up only the positive ones.
  for (let idx = 0; idx < countElements; idx++) {
    // Calculate the current item's net benefit (value minus cost).
    let currentBenefit = itemValues[idx] - itemCosts[idx];
    // If the calculated benefit is greater than zero, add it to the running total.
    if (currentBenefit > 0) {
      totalBenefit += currentBenefit;
    }
  }

  // Print the final accumulated total positive benefit to the console.
  console.log(totalBenefit);
}

// Read the entire content of standard input as a UTF-8 string and pass it to the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf-8"));
