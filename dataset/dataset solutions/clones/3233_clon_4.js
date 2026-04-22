function parseItemDetails(lineContent) {
    const valueParts = lineContent.split(" ");
    const s1 = parseInt(valueParts[0], 10);
    const s2 = parseInt(valueParts[1], 10);
    return {
        scoreA: s1,
        scoreB: s2,
        totalScore: s1 + s2
    };
}

function arrangeItems(unorderedItems) {
    // Creates a new array and sorts it to ensure immutability of the original list.
    // Sorts primarily by totalScore in ascending order.
    // If totalScores are equal, their relative order is preserved (stable sort).
    return [...unorderedItems].sort((firstItem, secondItem) => {
        if (firstItem.totalScore < secondItem.totalScore) return -1;
        if (firstItem.totalScore > secondItem.totalScore) return 1;
        return 0;
    });
}

function conductMatch(remainingItems, playerOneScore, playerTwoScore, currentRound) {
    // Base case: No items left to pick, return the final score difference.
    if (remainingItems.length === 0) {
        return playerOneScore - playerTwoScore;
    }

    const isPlayerOneTurn = currentRound % 2 === 0;

    const currentMinimumTotal = remainingItems[0].totalScore;
    let eligibleChoices;

    // Determine the set of items eligible for picking in this round.
    // This handles cases where totalScore might be NaN (from invalid input).
    if (isNaN(currentMinimumTotal)) {
        // If the first item's totalScore is NaN, then all remaining items (due to sorting)
        // must also have NaN totalScore. All are eligible.
        eligibleChoices = remainingItems;
    } else {
        // Otherwise, filter for items that exactly match the current minimum totalScore.
        eligibleChoices = remainingItems.filter(item => item.totalScore === currentMinimumTotal);
    }
    
    // Determine the optimal item for the current player from the eligible choices.
    let selectedItem = eligibleChoices[0]; // Default to the first eligible item

    if (isPlayerOneTurn) {
        // Player One wants to maximize their 'scoreA' value.
        selectedItem = eligibleChoices.reduce((bestSoFar, candidate) => {
            return candidate.scoreA > bestSoFar.scoreA ? candidate : bestSoFar;
        }, eligibleChoices[0]);
    } else {
        // Player Two wants to maximize their 'scoreB' value.
        selectedItem = eligibleChoices.reduce((bestSoFar, candidate) => {
            return candidate.scoreB > bestSoFar.scoreB ? candidate : bestSoFar;
        }, eligibleChoices[0]);
    }

    // Update player scores based on the selected item.
    const nextPlayerOneScore = isPlayerOneTurn ? playerOneScore + selectedItem.scoreA : playerOneScore;
    const nextPlayerTwoScore = !isPlayerOneTurn ? playerTwoScore + selectedItem.scoreB : playerTwoScore;

    // Create a new list of remaining items by removing the selected one.
    // `indexOf` relies on object reference equality, which is correct here as `selectedItem`
    // is a direct reference to an object from `remainingItems`.
    const selectedItemIndex = remainingItems.indexOf(selectedItem); 
    
    const updatedRemainingItems = [
        ...remainingItems.slice(0, selectedItemIndex),
        ...remainingItems.slice(selectedItemIndex + 1)
    ];

    // Recursively call for the next round of the match.
    return conductMatch(updatedRemainingItems, nextPlayerOneScore, nextPlayerTwoScore, currentRound + 1);
}

function ProcessData(rawData) {
    const dataLines = rawData.split("\n");
    // The first line contains the count of items, which isn't strictly needed
    // as we can use the length of the parsed item list.
    const itemStrings = dataLines.slice(1); 

    // Parse each item line into an object.
    const itemObjects = itemStrings.map(parseItemDetails);

    // Initial arrangement of items based on their totalScore.
    const arrangedItems = arrangeItems(itemObjects);

    // Start the game simulation with initial scores and round.
    const finalScoreDifference = conductMatch(arrangedItems, 0, 0, 0);

    // Output the final result.
    console.log(finalScoreDifference);
}

ProcessData(require("fs").readFileSync("/dev/stdin", "utf8"));