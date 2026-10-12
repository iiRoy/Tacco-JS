const rawData = require("fs").readFileSync("/dev/stdin", "utf8"); // Read input from standard input

// Immediately invoked function expression to encapsulate the logic
((inputContent) => {
    // Split the entire input string into an array of lines
    const textRows = inputContent.split('\n');

    // Parse the first line to get N, M, and X
    // N: number of items (e.g., books)
    // M: number of skill categories
    // X: minimum required skill level for each category
    const [numItems, numSkills, minSkillLevel] = textRows[0].split(' ').map(Number);

    // Arrays to store item-specific data
    const itemCosts = []; // Stores the cost of each item
    const itemSkillIncrements = []; // Stores the skill increments provided by each item

    // Loop through the remaining lines to populate item data
    for (let idx = 0; idx < numItems; idx++) {
        // Parse the current item's data row
        const currentRowData = textRows[idx + 1].split(' ').map(Number);

        // The first element is the cost of the item
        itemCosts[idx] = currentRowData[0];

        // The rest of the elements are the skill increments for this item
        itemSkillIncrements[idx] = currentRowData.splice(1);
    }

    // This array will store all possible combinations (subsets) of item indices.
    // Each combination represents a selection of items.
    let subsetsOfItems = [];

    // Generate all combinations of item indices using an iterative approach.
    // This loop iterates for subset sizes from 1 up to numItems.
    for (let subsetSize = 1; subsetSize <= numItems; subsetSize++) {
        let currentCombination = []; // Stores the indices of items in the current combination being built
        let currentDepth = 0; // Represents the current depth (number of items) in the combination
        let lastIndexAdded = -1; // The last item index added to the current combination

        // This while loop simulates a recursive combination generation process iteratively.
        while (lastIndexAdded !== undefined) {
            if (currentDepth === subsetSize) {
                // If the current combination has reached the desired size, add it to the list of subsets.
                subsetsOfItems.push([...currentCombination]);
                // Backtrack: remove the last item and decrease depth to explore other options.
                currentCombination.pop();
                currentDepth--;
            } else if (lastIndexAdded >= numItems - 1) {
                // If we've exhausted all possible items for the current position (lastIndexAdded is the last item index),
                // backtrack further: remove the previous item and get its index to continue from there.
                lastIndexAdded = currentCombination.pop();
                currentDepth--;
            } else {
                // Otherwise, move to the next item for the current position.
                lastIndexAdded++; // Increment the index to consider the next available item
                currentCombination.push(lastIndexAdded); // Add the new item index to the combination
                currentDepth++; // Increase depth
            }
        }
    }

    // Initialize the minimum total cost to a very large value.
    // This will be updated as we find valid combinations with lower costs.
    let minimumTotalCost = Number.POSITIVE_INFINITY;

    let selectedItemIndices = null; // Variable to hold the current subset of item indices being evaluated.

    // Process each generated subset of items.
    // We pop from the array, so it processes them in reverse order of generation, but order doesn't matter.
    while ((selectedItemIndices = subsetsOfItems.pop()) !== undefined) {
        let currentCombinationCost = 0; // Cost for the current combination of items
        // Initialize an array to accumulate skill levels for the current combination.
        // All skill categories start at 0.
        let accumulatedSkillLevels = Array(numSkills).fill(0);

        // Iterate over each item index in the current combination.
        selectedItemIndices.forEach(itemIndex => {
            // For each item, add its skill increments to the accumulated skill levels.
            for (let skillIdx = 0; skillIdx < numSkills; skillIdx++) {
                accumulatedSkillLevels[skillIdx] += itemSkillIncrements[itemIndex][skillIdx];
            }
            // Add the cost of the current item to the total cost of the combination.
            currentCombinationCost += itemCosts[itemIndex];
        });

        // Check if all skill levels in the current combination meet the minimum requirement (X).
        // Math.min(...accumulatedSkillLevels) finds the lowest skill level among all categories.
        if (Math.min(...accumulatedSkillLevels) >= minSkillLevel) {
            // If the requirements are met, update the minimum total cost if this combination is cheaper.
            minimumTotalCost = Math.min(minimumTotalCost, currentCombinationCost);
        }
    }

    // Output the result.
    // If minimumTotalCost is still Infinity, it means no combination met the requirements, so output -1.
    // Otherwise, output the found minimum cost.
    console.log(minimumTotalCost === Number.POSITIVE_INFINITY ? -1 : minimumTotalCost);

})(rawData); // Pass the raw input data to the IIFE
