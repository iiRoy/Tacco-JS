// This function serves as the primary entry point for processing the input data.
function ProcessDataStream(inputBytes) {
  // First, the raw input string is separated into an array of individual lines.
  const linesOfData = inputBytes.split("\n");

  // The initial configuration parameters (counts for two lists) are extracted
  // from the very first line of the input.
  const firstLineParts = linesOfData[0].split(" ");
  let countA = Number(firstLineParts[0]); // Determines the desired size for the 'listA' collection.
  let countB = Number(firstLineParts[1]); // Determines the desired size for the 'listB' collection.

  // Prepare 'listA':
  // - Take the second line of data.
  // - Split it by spaces to get individual string values.
  // - Convert each string value to a numerical type.
  // - Sort these numbers in descending order (largest first).
  // - Filter the sorted list to keep only the top 'countA' elements.
  let listA = linesOfData[1]
    .split(" ")
    .map(currentVal => Number(currentVal))
    .sort((item1, item2) => item2 - item1)
    .filter((currentVal, idx) => idx < countA);

  // Prepare 'listB':
  // - Take the third line of data.
  // - Apply the same processing steps as for 'listA' (parse, sort descending, filter).
  // - Keep only the top 'countB' elements for this collection.
  let listB = linesOfData[2]
    .split(" ")
    .map(currentVal => Number(currentVal))
    .sort((item1, item2) => item2 - item1)
    .filter((currentVal, idx) => idx < countB);

  // Prepare 'listC':
  // - Take the fourth line of data.
  // - Parse all values to numbers and sort them in descending order.
  // - This list is not truncated; all elements are considered.
  let listC = linesOfData[3]
    .split(" ")
    .map(currentVal => Number(currentVal))
    .sort((item1, item2) => item2 - item1);

  // Initialize index pointers for 'listA' and 'listB'.
  // These pointers will always point to the smallest *available* element in their respective lists.
  let idxA = listA.length - 1;
  let idxB = listB.length - 1;

  // The core optimization loop:
  // Iterate through each element in 'listC' (from largest to smallest implicitly due to sorting).
  // The goal is to replace the smallest elements in 'listA' or 'listB' with larger values from 'listC'
  // if such a replacement would increase the overall sum.
  for (let loopIndex = 0; loopIndex < listC.length; loopIndex++) {
    const currentItemC = listC[loopIndex]; // The current value from list C being considered.

    // Check if 'currentItemC' is larger than the smallest element in 'listA' (if 'listA' is not empty)
    // OR if 'currentItemC' is larger than the smallest element in 'listB' (if 'listB' is not empty).
    if ((idxA >= 0 && currentItemC > listA[idxA]) || (idxB >= 0 && currentItemC > listB[idxB])) {
      // If 'listA' has a valid smallest element AND it is strictly smaller than 'listB's smallest element
      // (or if 'listB' is exhausted, meaning 'listA's smallest is the only candidate).
      if (idxA >= 0 && listA[idxA] < listB[idxB]) {
        listA[idxA] = currentItemC; // Replace 'listA's smallest with 'currentItemC'.
        idxA--;                     // Move the pointer to the new smallest element in 'listA'.
      }
      // Otherwise (if 'listA' is exhausted, or its smallest is not smaller than 'listB's smallest),
      // if 'listB' still has a valid smallest element.
      else if (idxB >= 0) {
        listB[idxB] = currentItemC; // Replace 'listB's smallest with 'currentItemC'.
        idxB--;                     // Move the pointer to the new smallest element in 'listB'.
      }
    }
  }

  // After all potential replacements, calculate the total sum of elements
  // across the modified 'listA' and 'listB'.
  let totalSum = 0;

  // Add all elements from 'listA' to the total sum.
  listA.forEach(currentVal => totalSum += currentVal);

  // Add all elements from 'listB' to the total sum.
  listB.forEach(currentVal => totalSum += currentVal);

  // Display the final calculated sum to the console.
  console.log(totalSum);
}

// Invoke the main processing function, reading the input data from standard input.
ProcessDataStream(
  require("fs")
    .readFileSync("/dev/stdin", "utf8")
);