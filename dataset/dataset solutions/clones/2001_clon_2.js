/*
 * This module processes raw input data for a specific problem.
 * The main function orchestrates the parsing, calculation, and final decision.
 */
function ExecuteLogic(incomingData) {
  // A variable to store the final outcome, initially set to a positive affirmation.
  var finalDecision = "Yes";

  // Clean and segment the input: remove extraneous whitespace, then split into distinct lines.
  incomingData = incomingData.trim().split("\n");

  // Extract problem parameters from the first line: total available items and the count of top items to consider.
  const [totalItemCount, topItemSelectionLimit] = incomingData[0].split(" ").map((valueStr) => parseInt(valueStr, 10));

  // Parse the second line to obtain a list of numerical scores for each item.
  var itemScoresCollection = incomingData[1].split(" ").map((valueStr) => parseInt(valueStr, 10));

  // Arrange the item scores in descending order to easily identify the highest values.
  itemScoresCollection.sort((scoreOne, scoreTwo) => scoreTwo - scoreOne);

  // Extract a subset containing only the highest-scoring items, up to the defined limit.
  var highestRankedItems = itemScoresCollection.slice(0, topItemSelectionLimit);

  // Compute a dynamic qualification threshold based on the aggregated sum of all scores and the selection limit.
  const minimumQualificationScore = (1 * calculateCollectionSum(itemScoresCollection)) / (4 * topItemSelectionLimit);

  // Determine if the lowest score among the highest-ranked items meets the calculated threshold.
  if (highestRankedItems[highestRankedItems.length - 1] < minimumQualificationScore) {
    finalDecision = "No"; // If the condition is not met, update the decision to negative.
  }

  /*
   * Utility function to sum all numerical elements within a given array.
   * @param {Array<number>} numericCollection - An array containing numbers to be summed.
   * @returns {number} The cumulative sum of all numbers in the array.
   */
  function calculateCollectionSum(numericCollection) {
    return numericCollection.reduce((accumulatorValue, currentValue, currentIndex, fullArrayRef) => {
      return accumulatorValue + currentValue;
    });
  }

  // Display the determined final decision to the standard output.
  console.log(finalDecision);
}

// Below this line, standard I/O mechanisms are utilized. Please refrain from altering this section.
ExecuteLogic(require("fs").readFileSync("/dev/stdin", "utf8"));
// ExecuteLogic(require("fs").readFileSync("./input.txt", "utf-8"));