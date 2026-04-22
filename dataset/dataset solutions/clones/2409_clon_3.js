'use strict';

// Function responsible for processing raw input and delivering the calculated result.
const processInputData = rawInputContent => {

  // Validate input to ensure it's a non-empty string.
  if (typeof rawInputContent !== 'string' || rawInputContent.length === 0) {
    console.error("Input processing error: Provided data is not a valid string or is empty.");
    return; // Exit or handle error gracefully.
  }

  // Clean and split the input string into individual lines.
  const inputLinesArray = rawInputContent.trim().split('\n');

  // Verify that there are enough lines in the input. We need at least two.
  if (inputLinesArray.length < 2) {
    console.error("Input processing error: Not enough lines in the input file. Expected at least two.");
    return;
  }

  // Extract the line containing the space-separated numeric segments.
  const numericStringLine = inputLinesArray[1];

  // Convert the space-separated string into an array of numbers.
  // Using `Number` constructor for type conversion, which handles various number formats.
  const listOfNumbers = numericStringLine.split(' ').map(str => Number(str));

  // Calculate the grand total sum of all numbers in the list.
  const grandTotalSum = listOfNumbers.reduce((acc, num) => acc + num, 0);

  // Determine the target sum for an ideal 'half' partition.
  const desiredHalfSum = grandTotalSum / 2;

  // Initialize variables for tracking the running prefix sum and the current index.
  let currentAccumulatedSum = 0;
  let currentIndex = 0;

  // Iterate through the list to find the point where the prefix sum first reaches or exceeds the 'desiredHalfSum'.
  // The loop will stop when `currentAccumulatedSum` is `>= desiredHalfSum` or when `currentIndex` reaches the end of the array.
  while (currentIndex < listOfNumbers.length && currentAccumulatedSum < desiredHalfSum) {
    currentAccumulatedSum += listOfNumbers[currentIndex];
    currentIndex++;
  }

  // At this point:
  // `currentAccumulatedSum` holds the sum of `listOfNumbers[0]` through `listOfNumbers[currentIndex-1]`.
  // `currentIndex` is the index of the element *after* the last one added to `currentAccumulatedSum`.

  // Define the two candidate partition sums for evaluation.
  // The first candidate sum considers the partition ending at `currentIndex - 1`.
  // This is `currentAccumulatedSum` itself.
  const firstPartitionSumCandidate = currentAccumulatedSum;

  // The second candidate sum considers the partition ending at `currentIndex`.
  // This is `currentAccumulatedSum` plus the element at `currentIndex`.
  // Handle cases where `currentIndex` might be out of bounds if the loop completed by reaching `listOfNumbers.length`.
  const secondPartitionSumCandidate = currentAccumulatedSum + (listOfNumbers[currentIndex] || 0);

  // Initialize variables to store the final calculated differences for each candidate.
  let finalDifferenceOptionA = 0;
  let finalDifferenceOptionB = 0;

  // Calculate `finalDifferenceOptionA` based on the original problem's specific logic.
  // This logic checks if `firstPartitionSumCandidate` precisely divides `grandTotalSum` into two equal halves.
  if (grandTotalSum === 2 * firstPartitionSumCandidate) {
    finalDifferenceOptionA = 0; // If it's a perfect split, the difference is 0.
  } else {
    // Otherwise, calculate the absolute difference between `firstPartitionSumCandidate` and `grandTotalSum`.
    // Since `firstPartitionSumCandidate` will always be less than or equal to `grandTotalSum`,
    // this simplifies to `grandTotalSum - firstPartitionSumCandidate`.
    finalDifferenceOptionA = Math.abs(firstPartitionSumCandidate - grandTotalSum);
  }

  // Calculate `finalDifferenceOptionB` based on the original problem's specific logic.
  // This checks if `secondPartitionSumCandidate` is equal to the `grandTotalSum`.
  if (secondPartitionSumCandidate === grandTotalSum) {
    finalDifferenceOptionB = Infinity; // If it's the total sum, consider it an infinite difference (not a valid split).
  } else {
    // Otherwise, calculate the absolute difference between `secondPartitionSumCandidate` and `grandTotalSum`.
    // Similar to above, this simplifies to `grandTotalSum - secondPartitionSumCandidate`.
    finalDifferenceOptionB = Math.abs(secondPartitionSumCandidate - grandTotalSum);
  }

  // The ultimate result is the minimum of the two calculated difference options.
  const minimumAchievableDifference = Math.min(finalDifferenceOptionA, finalDifferenceOptionB);

  // Display the computed minimum difference to the console.
  console.log(minimumAchievableDifference);
};

// --- Execution Start Point ---
// This block handles reading input from standard input and invoking the main processing function.
try {
  // Use 'fs' module to synchronously read the entire content of '/dev/stdin'.
  // Specify 'utf8' encoding for correct character interpretation.
  const fileData = require('fs').readFileSync('/dev/stdin', { encoding: 'utf8', flag: 'r' });
  processInputData(fileData); // Pass the read data to our processing function.
} catch (ioError) {
  // Catch and report any errors that occur during file reading.
  console.error(`Input/Output Error: Could not read from /dev/stdin. Details: ${ioError.message}`);
  // In a production environment, you might want to log this error and exit the process.
  process.exit(1);
}