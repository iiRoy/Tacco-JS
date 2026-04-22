const computeCumulativeValue = (rawInputDataString) => {
  // First, split the entire raw input string into an array of individual lines.
  // We trim to handle potential leading/trailing whitespace in the overall input.
  const inputDataLines = rawInputDataString.trim().split("\n");

  // A small helper function to ensure robust integer parsing.
  const convertToInteger = (textValue) => parseInt(textValue, 10);

  // Define a constant for converting 1-based indexing (common in problems) to 0-based.
  const ONE_BASED_OFFSET = 1;

  // The first line indicates the total count of items to process.
  // Original: `n = input[0].split("");` - This was likely a mistake, assuming 'n' was a number.
  // Corrected and explicitly parsed as an integer.
  const totalItemCount = convertToInteger(inputDataLines[0]);

  // Implement a guard clause: if there are no items or a negative count, the total value is zero.
  if (totalItemCount <= 0) {
    return 0;
  }

  // The second line contains a sequence of item identifiers, which are 1-based.
  // We parse them into an array of 0-based indices.
  // Original: `a = input[1].split(" ");`
  const itemIdentifierSequence = inputDataLines[1]
    .split(" ")
    .map(idString => convertToInteger(idString) - ONE_BASED_OFFSET);

  // The third line provides base values associated with each item identifier.
  // We parse these into an array of numbers directly.
  // Original: `b = input[2].split(" ");`
  const itemBaseValues = inputDataLines[2]
    .split(" ")
    .map(convertToInteger);

  // The fourth line provides bonus values for specific consecutive item sequences.
  // We parse these into an array of numbers.
  // Original: `c = input[3].split(" ");`
  const consecutiveBonusValues = inputDataLines[3]
    .split(" ")
    .map(convertToInteger);

  // Initialize a variable to accumulate the final calculated score.
  let finalCalculatedScore = 0;

  // Iterate through the sequence of items based on the total count.
  for (let currentIterationIndex = 0; currentIterationIndex < totalItemCount; currentIterationIndex++) {
    // Retrieve the 0-based index of the current item in the sequence.
    const currentItemZeroBasedIndex = itemIdentifierSequence[currentIterationIndex];

    // Add the base value for the current item to the total score.
    // Original: `ans+=Number(b[a[i]-1]);`
    finalCalculatedScore += itemBaseValues[currentItemZeroBasedIndex];

    // Check for a consecutive bonus condition. This condition applies only from the second item onwards.
    // Original: `if(i>0 && a[i]==Number(a[i-1])+1){`
    if (currentIterationIndex > 0) {
      // Get the 0-based index of the previously processed item.
      const previousItemZeroBasedIndex = itemIdentifierSequence[currentIterationIndex - 1];

      // The original logic checked if the 1-based IDs were consecutive.
      // With 0-based indices, this translates to:
      // (currentItemZeroBasedIndex + 1) === (previousItemZeroBasedIndex + 1) + 1
      // Which simplifies to:
      // currentItemZeroBasedIndex === previousItemZeroBasedIndex + 1
      if (currentItemZeroBasedIndex === previousItemZeroBasedIndex + ONE_BASED_OFFSET) {
        // If the condition is met, add the bonus value associated with the *previous* item.
        // Original: `ans+=Number(c[a[i-1]-1]);`
        finalCalculatedScore += consecutiveBonusValues[previousItemZeroBasedIndex];
      }
    }
  }

  // Return the accumulated score.
  return finalCalculatedScore;
};

// --- Main execution block to read input and display output ---
try {
  // Attempt to load the file system module.
  const fileSystemModule = require("fs");
  // Read the entire content from standard input, assuming UTF-8 encoding.
  const standardInputContent = fileSystemModule.readFileSync("/dev/stdin", "utf8");

  // Call the primary function to calculate the score.
  const resultValue = computeCumulativeValue(standardInputContent);

  // Output the final result to the console.
  console.log(resultValue);
} catch (inputError) {
  // In case of any error during input reading or processing, log an error message.
  console.error("An error occurred during input processing:", inputError.message);
  // Optionally, exit the process with an error code.
  // process.exit(1);
}