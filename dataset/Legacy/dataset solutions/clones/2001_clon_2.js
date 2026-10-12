function ProcessInputData(incomingText) {
  // Initialize a variable to store the final decision
  let finalVerdict = "Yes";

  // Clean up and parse the raw input string into an array of lines
  const processedLines = incomingText.trim().split("\n");

  // Extract the first line to get N and M values
  // N: total number of items, M: number of top items to consider
  const [totalItems, selectedCount] = processedLines[0].split(" ").map((valTxt) => parseInt(valTxt, 10));

  // Extract the second line to get the array of scores/votes
  let candidateScores = processedLines[1].split(" ").map((scoreTxt) => parseInt(scoreTxt, 10));

  // Sort the scores in descending order
  candidateScores.sort((scoreA, scoreB) => scoreB - scoreA);

  // Get the top 'M' scores from the sorted list
  const leadingScores = candidateScores.slice(0, selectedCount);

  // Calculate the required minimum threshold for a score to be considered
  // This threshold is (total sum of all scores) / (4 * M)
  const minimumThreshold = (1 * calculateArraySum(candidateScores)) / (4 * selectedCount);

  // Check if the lowest score among the top 'M' items is below the calculated threshold
  if (leadingScores[leadingScores.length - 1] < minimumThreshold) {
    finalVerdict = "No"; // If it is, the condition is not met
  }

  // Helper function to compute the sum of all numbers in an array
  function calculateArraySum(numericList) {
    return numericList.reduce((accumulator, currentValue) => {
      return accumulator + currentValue;
    }, 0); // Start sum from zero
  }

  // Output the final decision to the console
  console.log(finalVerdict);
}

// This section handles reading input from standard input and invoking the main processing function.
// It should not be modified.
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
// For local testing, you might use:
// ProcessInputData(require("fs").readFileSync("./input.txt", "utf-8"));
