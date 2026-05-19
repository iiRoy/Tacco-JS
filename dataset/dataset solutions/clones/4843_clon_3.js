function processCandyData(rawData) {
    const lines = rawData.split('\n');
    let totalEatenCandies = 0;

    const firstLineParts = lines[0].split(' ');
    const numContainers = parseInt(firstLineParts[0], 10); // Parsed but not directly used in loop bounds
    const maxAllowedPerPair = parseInt(firstLineParts[1], 10);

    let candyAmounts = lines[1].split(' ').map(val => parseInt(val, 10));

    // Helper function to adjust candies in a pair of boxes when their sum exceeds the maximum
    function adjustCandiesInPair(boxIndices, excessAmount) {
        totalEatenCandies += excessAmount; // The total amount to be removed from the pair

        const rightBoxIndex = boxIndices[1];
        const leftBoxIndex = boxIndices[0];

        let currentRightBoxCandies = candyAmounts[rightBoxIndex];

        // Determine how much to take from the right box, up to its current content
        const reductionFromRight = Math.min(excessAmount, currentRightBoxCandies);
        candyAmounts[rightBoxIndex] -= reductionFromRight;

        // Calculate the remaining excess amount that still needs to be removed
        const remainingExcess = excessAmount - reductionFromRight;

        // If there's still an excess, take it from the left box
        if (remainingExcess > 0) {
            candyAmounts[leftBoxIndex] -= remainingExcess;
        }
    }

    // Helper function to calculate the sum of candies in a given pair of boxes
    function calculatePairTotal(boxIndices) {
        return candyAmounts[boxIndices[0]] + candyAmounts[boxIndices[1]];
    }

    // Main logic to iterate through adjacent box pairs and adjust candy counts as needed
    function processAllContainers() {
        // The loop should go up to the second-to-last element to form pairs
        const lastPossiblePairStartIndex = candyAmounts.length - 1;

        for (let containerIndex = 0; containerIndex < lastPossiblePairStartIndex; containerIndex++) {
            const currentBoxIndices = [containerIndex, containerIndex + 1];
            const currentPairTotal = calculatePairTotal(currentBoxIndices);
            const excessAmount = currentPairTotal - maxAllowedPerPair;

            // If the pair's total exceeds the maximum, adjust the candy counts
            if (excessAmount > 0) {
                adjustCandiesInPair(currentBoxIndices, excessAmount);
            }
        }
    }

    // Execute the main processing logic
    processAllContainers();

    // Output the final count of candies that were eaten
    console.log(totalEatenCandies);
}

// This line ensures the script can be run in a typical Node.js environment for competitive programming.
processCandyData(require("fs").readFileSync("/dev/stdin", "utf8"));
