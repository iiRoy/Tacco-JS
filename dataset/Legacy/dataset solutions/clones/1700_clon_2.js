function ProcessInput(rawData) {
  // Split the raw input string into individual lines
  let parsedLines = rawData.split("\n");

  // Extract the second line and split it by spaces to get temporary values
  let tempValues = parsedLines[1].split(" ");

  // Parse the first line to get the count of elements
  const countElements = parseInt(parsedLines[0], 10);

  // Initialize an array to store the original numbers
  let originalNumbers = [];

  // Populate the originalNumbers array by parsing values from tempValues
  for (let idx = 0; idx < countElements; idx++) {
    originalNumbers.push(parseInt(tempValues[idx], 10));
  }

  // Initialize an array to store doubled and sorted numbers
  let doubledAndSorted = [];

  // Duplicate each number from originalNumbers into doubledAndSorted
  for (let idx = 0; idx < originalNumbers.length; idx++) {
    doubledAndSorted.push(originalNumbers[idx]);
    doubledAndSorted.push(originalNumbers[idx]);
  }

  // Sort the doubledAndSorted array in descending order
  doubledAndSorted.sort(function (valA, valB) {
    return valA < valB ? 1 : -1; // Custom comparison for descending sort
  });

  // Initialize the final sum with the first element of the sorted array
  let finalSum = doubledAndSorted[0];

  // Add elements from the sorted array starting from the third element
  // (index 2) up to countElements - 1
  for (let idx = 2; idx < countElements; idx++) {
    finalSum = finalSum + doubledAndSorted[idx];
  }

  // Output the calculated final sum to the console
  console.log(finalSum);
}

// Read input from standard input and pass it to the processing function
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
