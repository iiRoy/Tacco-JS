// Helper function to display the final result.
function displayFinalOutput(resultValue) {
  console.log(resultValue);
}

// Main function to process the incoming raw data stream.
// This function reads configuration and data, performs calculations, and outputs the result.
function processInputData(rawDataStream) {
  // Split the raw input string into an array of lines.
  const inputLines = rawDataStream.split('\n');

  // Validate that the input contains at least the expected number of lines.
  // The problem setup typically expects at least two lines for parameters and data.
  if (inputLines.length < 2) {
    console.error("Input data is malformed: Expected at least two lines of data.");
    displayFinalOutput(0); // Output a default or error value in case of insufficient input.
    return;
  }

  // Process the first line to extract global parameters.
  // This line typically contains space-separated integer values.
  const firstLineParts = inputLines[0].split(' ');
  
  // In the original problem, 'N' (first element) was often present but unused in the sum.
  // We'll acknowledge it but not assign it to a variable if it's not needed for the core logic.
  // const totalItemCount = Number(firstLineParts[0]); // This would be 'N' if used.

  // Extract the count of elements that should be aggregated (equivalent to 'K').
  // Using `Number()` for type conversion, which handles base-10 integers well.
  const elementsToAggregateCount = Number(firstLineParts[1]);

  // Perform basic validation on the extracted count.
  if (isNaN(elementsToAggregateCount) || elementsToAggregateCount < 0) {
      console.error("Invalid aggregation count received. Must be a non-negative number.");
      displayFinalOutput(0);
      return;
  }

  // Parse the second line, which contains the sequence of numbers.
  // First, split by space, then filter out any empty strings that might arise from
  // multiple spaces, ensuring only valid number strings are processed.
  const rawNumberStrings = inputLines[1].split(' ').filter(s => s.trim() !== '');
  
  // Convert all collected string representations into actual numeric values.
  const parsedNumericValues = rawNumberStrings.map(currentStrValue => Number(currentStrValue));

  // Sort the numeric values in descending order (largest to smallest).
  // This prepares the array for selecting the top 'K' elements efficiently.
  const sortedValuesDescending = parsedNumericValues.sort((valueA, valueB) => valueB - valueA);

  // Initialize a variable to accumulate the sum.
  let finalCalculatedSum = 0;

  // If no elements are to be aggregated, or if the sorted list is empty, the sum is 0.
  if (elementsToAggregateCount === 0 || sortedValuesDescending.length === 0) {
      displayFinalOutput(0);
      return;
  }
  
  // Determine the actual number of elements to sum, ensuring we don't exceed
  // the bounds of the sorted array. This is a robust guard against invalid 'K'.
  const effectiveElementsToTake = Math.min(elementsToAggregateCount, sortedValuesDescending.length);

  // Extract the top 'K' (or fewer) elements from the sorted array.
  // Using `slice()` creates a new array containing only the relevant items.
  const topKElementsForSummation = sortedValuesDescending.slice(0, effectiveElementsToTake);

  // Calculate the sum of these selected elements using the `reduce` method.
  // This is a functional approach to iterating and accumulating a value.
  finalCalculatedSum = topKElementsForSummation.reduce((accumulator, currentValue) => accumulator + currentValue, 0);

  // Output the final computed sum using the helper function.
  displayFinalOutput(finalCalculatedSum);
}

// Entry point for the script: Reads input from standard input and initiates processing.
// Uses a try-catch block for robust error handling during file system operations.
try {
  const standardInputContent = require('fs').readFileSync('/dev/stdin', 'utf8');
  processInputData(standardInputContent);
} catch (fileReadError) {
  console.error("Failed to read input from /dev/stdin:", fileReadError.message);
  // In a real application, more sophisticated error handling or logging might be implemented here.
  process.exit(1); // Exit with a non-zero code to indicate an error.
}