'use strict';

/**
 * Processes the input data to determine if a condition is met.
 * @param {string} inputContent - The raw string content read from standard input.
 */
function processInput(inputContent) {
  // Trim leading/trailing whitespace and split the input into lines.
  let parsedLines = inputContent.trim().split('\n');

  // Parse the first line to get the two main parameters.
  // The values are converted to numbers using the multiplication by 1 trick.
  let dimensionsArray = parsedLines[0].split(' ').map(currentNumStr => currentNumStr * 1);

  // Extract the individual parameters from the dimensions array.
  // 'numItems' (N) is the total number of items.
  let numItems = dimensionsArray[0];
  // 'minVotesRequired' (M) is the number of top items that must meet a certain vote threshold.
  let minVotesRequired = dimensionsArray[1];

  // Parse the second line, convert vote strings to numbers, and sort them in descending order.
  let itemVotes = parsedLines[1].split(' ').map(currentNumStr => currentNumStr * 1).sort((voteA, voteB) => {
    return voteB - voteA; // Sort from largest to smallest.
  });

  // Initialize the result status to "Yes", assuming the condition is met until proven otherwise.
  let resultStatus = "Yes";

  // Calculate the sum of all votes.
  let totalVotes = itemVotes.reduce((accumulatedSum, currentVote) => accumulatedSum + currentVote, 0);

  // Iterate through the top 'minVotesRequired' items to check the condition.
  // The condition is that each of these top items must have votes greater than or equal to
  // the total votes divided by (4 * minVotesRequired).
  for (let idx = 0; idx < minVotesRequired; idx++) {
    // If any of the top 'minVotesRequired' items fails the condition,
    // set the result status to "No" and the loop can implicitly continue or break.
    // The original code continues, so we will too.
    if (itemVotes[idx] < totalVotes / (4 * minVotesRequired)) {
      resultStatus = "No";
    }
  }

  // Output the final result status.
  console.log(resultStatus);
}

// Read the input from standard input and pass it to the processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
