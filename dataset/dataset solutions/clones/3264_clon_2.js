function ProcessInputData(initialText) {
  // The raw input string is split into an array of individual lines.
  initialText = initialText.split("\n");

  // The very first line contains two crucial numbers: N and K.
  let firstLineTokens = initialText[0].split(" ");
  let totalAvailableItems = parseInt(firstLineTokens[0]);
  let desiredSelectionSize = parseInt(firstLineTokens[1]);

  // Declare some iterator variables; not all might be actively used or necessary.
  let loopCounterA, loopCounterB, loopCounterC, loopCounterD;

  // This array will hold parsed details for each individual food item.
  let foodEntries = [];

  // Iterate through the subsequent lines to parse each item's data.
  for (loopCounterA = 1; loopCounterA <= totalAvailableItems; loopCounterA++) {
    let currentLineParts = initialText[loopCounterA].split(" ");
    let itemDetails = {};
    // Each item has a 'kind' (type) and a 'deliciousness' value.
    itemDetails.kind = parseInt(currentLineParts[0]);
    itemDetails.deliciousness = parseInt(currentLineParts[1]);
    foodEntries.push(itemDetails);
  }

  /*
   * The original code contained a commented-out line for sorting the food items.
   * This sorting was likely for an alternative approach or optimization not used in the final logic.
   * foodEntries.sort(function(itemX, itemY) { return itemY.deliciousness - itemX.deliciousness; });
   */

  // Initialize the variable that will store the maximum score found across all combinations.
  let highestScore = 0;

  // This function acts as an entry point to kick off the recursive combination generation.
  function generateCombinations(selectionTarget, totalElementsMinusSelection) {
    // An array to temporarily store the indices of the items currently selected in a combination.
    let combinationIndices = new Array(100001);
    let currentDepth = 0;  // Represents the starting index for the next element in the array.
    let columnIndex = 1;   // Represents the current position within the combinationIndices array.

    // Begin the recursive search to explore all possible combinations.
    recursiveCombinationSearch(currentDepth, columnIndex, selectionTarget, totalElementsMinusSelection, combinationIndices);
  }

  // The core recursive function that generates and evaluates combinations.
  function recursiveCombinationSearch(startIndexForNext, currentColumnPosition, targetSelectionCount, maxAvailableIndex, combinationStore) {
    let iteratorX, iteratorY;

    // Loop through possible indices for the current position in the combination.
    for (iteratorX = startIndexForNext + 1; iteratorX <= maxAvailableIndex + currentColumnPosition; iteratorX++) {
      combinationStore[currentColumnPosition] = iteratorX;

      // If we haven't yet picked 'targetSelectionCount' items, go deeper into recursion.
      if (targetSelectionCount !== currentColumnPosition) {
        recursiveCombinationSearch(iteratorX, currentColumnPosition + 1, targetSelectionCount, maxAvailableIndex, combinationStore);
      } else {
        // If 'targetSelectionCount' items have been picked, evaluate this combination.
        let placeholderVariable = 0; // This variable existed in the original but was unused.
        let accumulatedDeliciousness = 0;
        let distinctItemTypes = new Set(); // A Set to easily count unique item types.

        // Calculate the score for the current combination.
        for (iteratorY = 1; iteratorY <= targetSelectionCount; iteratorY++) {
          let chosenItemIndex = combinationStore[iteratorY];
          // Store the type of the selected item to count unique types.
          distinctItemTypes.add(foodEntries[chosenItemIndex - 1].kind);
          // Add the deliciousness value of the selected item to the running sum.
          accumulatedDeliciousness += foodEntries[chosenItemIndex - 1].deliciousness;
        }

        // The final score is calculated as (number of unique types)^2 + total deliciousness.
        let currentCombinationScore = distinctItemTypes.size * distinctItemTypes.size;
        currentCombinationScore += accumulatedDeliciousness;

        // Update the global maximum score if the current combination yields a higher score.
        highestScore = Math.max(highestScore, currentCombinationScore);
      }
    }
  }

  // Call the combination generator with the required parameters (K and N-K).
  generateCombinations(desiredSelectionSize, totalAvailableItems - desiredSelectionSize);

  // Print the final highest score to the console.
  console.log(highestScore);
}

// Read the input data from standard input and pass it to the main processing function.
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));