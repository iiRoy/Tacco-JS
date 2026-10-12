function processInputData(rawDataLines) {
    // Parse the total number of items from the first line of input.
    let itemCount = rawDataLines[0] - 0;

    // Initialize two collections to store parsed data.
    const primaryItems = [];
    const secondaryItems = [];

    // Populate the collections based on the input lines.
    // The first 'itemCount' lines after the initial count go to primaryItems,
    // and the next 'itemCount' lines go to secondaryItems.
    for (let loopIterator = 1; loopIterator <= itemCount; loopIterator++) {
        primaryItems.push(rawDataLines[loopIterator].split(" ").map(stringValue => stringValue - 0));
        secondaryItems.push(rawDataLines[loopIterator + itemCount].split(" ").map(stringValue => stringValue - 0));
    }

    // Sort the primary collection.
    // The sorting logic prioritizes the second element if the first is greater than the second,
    // otherwise it sorts by the first element.
    primaryItems.sort((firstElement, secondElement) => firstElement[0] > firstElement[1] ? (firstElement[1] - secondElement[1]) : (firstElement[0] - secondElement[0]));

    // Sort the secondary collection.
    // The sorting logic is similar to primaryItems, but with a reversed comparison for the second element
    // when the first element is greater than the second.
    secondaryItems.sort((firstElement, secondElement) => firstElement[0] > firstElement[1] ? (secondElement[1] - firstElement[1]) : (firstElement[0] - secondElement[0]));

    // Initialize pointers and a variable that is declared but not used.
    let primaryIndex = 0;
    let secondaryIndex = 0;
    let unusedMaximum = 0; // This variable is not utilized in the subsequent logic.

    // Initialize the counter for successful matches.
    let successfulMatches = 0;

    // Iterate through both collections to find matching pairs.
    // A match occurs if an item from primaryItems can "cover" an item from secondaryItems
    // based on their respective first and second values.
    while (primaryIndex < itemCount && secondaryIndex < itemCount) {
        const currentPrimary = primaryItems[primaryIndex];
        const currentSecondary = secondaryItems[secondaryIndex];

        // Check the matching condition.
        if (currentPrimary[0] < currentSecondary[0] && currentPrimary[1] < currentSecondary[1]) {
            // If a match is found, increment the match count and advance both pointers.
            successfulMatches++;
            primaryIndex++;
            secondaryIndex++;
        } else {
            // If no match, only advance the secondary collection pointer to look for a potential match.
            secondaryIndex++;
        }
    }

    // Output the total number of successful matches.
    console.log(successfulMatches);
}

// Read input from standard input, decode as UTF-8, trim whitespace, and split into lines.
processInputData(require('fs').readFileSync('/dev/stdin', 'utf8').trim().split("\n"));
