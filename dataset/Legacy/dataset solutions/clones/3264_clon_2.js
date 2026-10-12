function ProcessInput(rawData) {
    // Split the raw input string into individual lines
    rawData = rawData.split("\n");

    // Parse the first line to get the total number of items and the selection count
    var firstLineParts = rawData[0].split(" ");
    var totalItems = parseInt(firstLineParts[0]);
    var selectionCount = parseInt(firstLineParts[1]);

    // Declare some variables that are not used in the original logic
    var unusedVarA, unusedVarB, unusedVarC;

    // Initialize an array to store the sushi item data
    var sushiItems = [];

    // Loop through the remaining lines to populate the sushiItems array
    for (let idx = 1; idx <= totalItems; idx++) {
        var itemLineParts = rawData[idx].split(" ");
        var sushiData = {}; // Create an object for each sushi item
        sushiData.typeId = parseInt(itemLineParts[0]); // Store the type identifier
        sushiData.deliciousness = parseInt(itemLineParts[1]); // Store the deliciousness value
        sushiItems.push(sushiData); // Add the item to the array
    }

    // Initialize the overall maximum score found so far
    var overallMaximum = 0;

    // Function to initiate the combination generation process
    function generateCombinations(targetSize, remainingElements) {
        // Initialize an array to hold the indices of the current combination
        // The size 100001 is a magic number from the original, likely an upper bound for K
        var currentCombinationIndices = new Array(100001);
        var startIdx = 0; // Starting index for the next element in the combination
        var currentDepth = 1; // Current depth of recursion (which element of the combination we are choosing)

        // Begin the recursive generation
        recursiveCombinationGenerator(startIdx, currentDepth, targetSize, remainingElements, currentCombinationIndices);
    }

    // Recursive function to generate combinations and calculate scores
    function recursiveCombinationGenerator(startIdx, currentDepth, targetSize, remainingElements, currentCombinationIndices) {
        var loopCounter, innerLoopCounter;

        // Iterate to select the next element for the current combination
        for (loopCounter = startIdx + 1; loopCounter <= remainingElements + currentDepth; loopCounter++) {
            currentCombinationIndices[currentDepth] = loopCounter; // Store the selected index

            // If we haven't reached the target combination size, recurse deeper
            if (targetSize !== currentDepth) {
                recursiveCombinationGenerator(loopCounter, currentDepth + 1, targetSize, remainingElements, currentCombinationIndices);
            } else {
                // Base case: A combination of 'targetSize' elements has been formed
                var tempVal = 0; // Unused variable, kept for structural similarity
                var currentDeliciousnessSum = 0; // Sum of deliciousness for the current combination
                var uniqueTypesSet = new Set(); // Set to store unique type IDs

                // Calculate the score for the current combination
                for (innerLoopCounter = 1; innerLoopCounter <= targetSize; innerLoopCounter++) {
                    var itemIndex = currentCombinationIndices[innerLoopCounter];
                    uniqueTypesSet.add(sushiItems[itemIndex - 1].typeId); // Add type ID to the set
                    currentDeliciousnessSum += sushiItems[itemIndex - 1].deliciousness; // Add deliciousness to sum
                }

                // Calculate the score: (number of unique types)^2 + sum of deliciousness
                var currentCombinationScore = uniqueTypesSet.size * uniqueTypesSet.size;
                currentCombinationScore += currentDeliciousnessSum;

                // Update the overall maximum score if the current score is higher
                overallMaximum = Math.max(overallMaximum, currentCombinationScore);
            }
        }
    }

    // Start the combination generation with K items from N total items
    generateCombinations(selectionCount, totalItems - selectionCount);

    // Output the final maximum score
    console.log(overallMaximum);
}

// Read input from standard input and pass it to the main processing function
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
