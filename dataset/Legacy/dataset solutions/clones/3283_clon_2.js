function ProcessInput(rawData) {
  // Split the raw input string into individual lines
  let processedLines = rawData.split("\n");

  // Extract the total count of numeric values from the first line
  let totalCount = Number(processedLines[0]);

  // Parse the thresholds from the second line
  let thresholdsStr = processedLines[1].split(" ");
  let firstThreshold = Number(thresholdsStr[0]);
  let secondThreshold = Number(thresholdsStr[1]);

  // Extract the numeric values from the third line
  let numericValues = processedLines[2].split(" ");

  // Initialize arrays to categorize the numeric values
  let groupOne = []; // For values less than or equal to firstThreshold
  let groupTwo = []; // For values greater than firstThreshold but less than or equal to secondThreshold
  let groupThree = []; // For values greater than secondThreshold

  // Convert all string numeric values to actual numbers
  for (let idx = 0; idx < totalCount; idx++) {
    numericValues[idx] = Number(numericValues[idx]);
  }

  // Sort the numeric values in ascending order
  numericValues.sort(function (valA, valB) {
    if (valA < valB) return -1; // valA comes before valB
    if (valA > valB) return 1; // valA comes after valB
    return 0; // valA and valB are equal
  });

  // Iterate through the sorted numeric values and categorize them
  for (let idx = 0; idx < totalCount; idx++) {
    if (numericValues[idx] <= firstThreshold) {
      groupOne.push(numericValues[idx]);
    } else if (numericValues[idx] <= secondThreshold) {
      groupTwo.push(numericValues[idx]);
    } else {
      groupThree.push(numericValues[idx]);
    }
  }

  // Output the minimum length among the three categorized groups
  console.log(Math.min(groupOne.length, groupTwo.length, groupThree.length));
}

// Read input from standard input and pass it to the processing function
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
