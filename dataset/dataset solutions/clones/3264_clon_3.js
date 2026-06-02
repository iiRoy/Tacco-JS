function ProcessInput(rawData) {
    // Helper function to parse the initial problem data from the input string.
    function parseProblemData(inputString) {
        const lines = inputString.split("\n");
        const firstLineParts = lines[0].split(" ");
        const totalItems = parseInt(firstLineParts[0], 10);
        const selectionCount = parseInt(firstLineParts[1], 10);

        const dishCollection = [];
        for (let itemIndex = 1; itemIndex <= totalItems; itemIndex++) {
            const currentLineParts = lines[itemIndex].split(" ");
            const dishEntry = {
                typeId: parseInt(currentLineParts[0], 10),
                deliciousness: parseInt(currentLineParts[1], 10)
            };
            dishCollection.push(dishEntry);
        }
        return { totalItems, selectionCount, dishCollection };
    }

    // Helper function to calculate the score for a given array of selected dish entries.
    function calculateCombinationScore(selectedDishes) {
        let currentDeliciousnessSum = 0;
        const uniqueTypes = new Set();

        for (const dish of selectedDishes) {
            uniqueTypes.add(dish.typeId);
            currentDeliciousnessSum += dish.deliciousness;
        }

        const typeVarietyBonus = Math.pow(uniqueTypes.size, 2);
        return typeVarietyBonus + currentDeliciousnessSum;
    }

    // Parse the input data using the helper function.
    const { totalItems, selectionCount, dishCollection } = parseProblemData(rawData);

    let overallMaxScore = 0;

    // This function encapsulates the combination generation logic and updates the maximum score found.
    function generateCombinationsAndEvaluate(targetSelectionSize, availableItemsCount) {
        // Array to store the 1-based indices of selected items for the current combination.
        // The size is `availableItemsCount + 1` to accommodate 1-based indexing up to `availableItemsCount`.
        const currentCombinationIndices = new Array(availableItemsCount + 1);

        // Recursive helper function to generate combinations.
        // startIndex: The last chosen index (0-based) from the `dishCollection`.
        // currentPosition: The current slot (1-based) in `currentCombinationIndices` we are trying to fill.
        // targetSelectionSize: The total number of items to select (`K`).
        // availableItemsCount: The total number of items available in `dishCollection` (`N`).
        function recursiveCombinator(startIndex, currentPosition, targetSelectionSize, availableItemsCount) {
            // Loop through possible items to pick for the current position.
            // The upper bound for `loopIndex` is adjusted to ensure enough items remain
            // in `dishCollection` for subsequent positions to reach `targetSelectionSize`.
            const maxPossibleIndex = availableItemsCount - (targetSelectionSize - currentPosition);
            for (let loopIndex = startIndex + 1; loopIndex <= maxPossibleIndex; loopIndex++) {
                currentCombinationIndices[currentPosition] = loopIndex;

                // If we haven't filled all target slots yet, recurse to fill the next position.
                if (targetSelectionSize !== currentPosition) {
                    recursiveCombinator(loopIndex, currentPosition + 1, targetSelectionSize, availableItemsCount);
                } else {
                    // A complete combination of `targetSelectionSize` items has been formed.
                    // Extract the actual dish entries for the current combination.
                    const selectedDishesForCurrentCombo = [];
                    for (let comboElementIndex = 1; comboElementIndex <= targetSelectionSize; comboElementIndex++) {
                        const selectedItemIndex = currentCombinationIndices[comboElementIndex];
                        selectedDishesForCurrentCombo.push(dishCollection[selectedItemIndex - 1]);
                    }

                    // Calculate the score for this combination using the helper function.
                    const currentCombinationScore = calculateCombinationScore(selectedDishesForCurrentCombo);
                    // Update the overall maximum score if the current combination's score is higher.
                    overallMaxScore = Math.max(overallMaxScore, currentCombinationScore);
                }
            }
        }

        // Initiate the combination generation process.
        // Start picking from index 0, fill the first position (1-based),
        // with `targetSelectionSize` items from `availableItemsCount` total items.
        recursiveCombinator(0, 1, targetSelectionSize, availableItemsCount);
    }

    // Call the main combination generation function with the parsed parameters.
    // `selectionCount` is `K`, `totalItems` is `N`.
    generateCombinationsAndEvaluate(selectionCount, totalItems);

    // Output the final maximum score.
    console.log(overallMaxScore);
}

// Read input from stdin and pass it to the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
