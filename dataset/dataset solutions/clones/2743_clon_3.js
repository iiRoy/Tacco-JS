function processNumericalSequence(rawInputData) {
    // Perform initial checks for null or empty input data.
    if (rawInputData === null || rawInputData.trim().length === 0) {
        console.error("Input data is empty or invalid. Cannot process sequence.");
        return;
    }

    // Split the entire input string into an array of individual lines.
    const inputLines = rawInputData.trim().split("\n");

    // Validate if the input contains at least two lines (one for count, one for numbers).
    if (inputLines.length < 2) {
        console.error("Insufficient input lines. Expected at least N and then N numbers.");
        return;
    }

    // Parse the total count of elements (N) from the very first line.
    const totalElementCount = parseInt(inputLines[0].trim(), 10);

    // Further validation for the parsed count.
    if (isNaN(totalElementCount) || totalElementCount < 0) {
        console.error("Invalid number of elements (N) provided in the input. N must be a non-negative integer.");
        return;
    }

    // Handle the edge case where N is zero; no sequence means no piles.
    if (totalElementCount === 0) {
        console.log(0);
        return;
    }

    // Parse the actual numeric values from the remaining lines.
    // Filtering out any lines that do not convert to valid numbers ensures robustness.
    const actualNumericValues = inputLines.slice(1)
                                          .map(line => parseInt(line.trim(), 10))
                                          .filter(val => !isNaN(val));

    // A warning if the declared count N doesn't match the actual number of parsed elements.
    // The algorithm will proceed using `totalElementCount` as specified by N.
    if (actualNumericValues.length < totalElementCount) {
        console.warn(`Warning: Declared N (${totalElementCount}) is greater than the actual number of parsed elements (${actualNumericValues.length}).`);
    }


    // `activePileHeads` is a Map storing the current top element for each active pile.
    // The key is a unique identifier assigned to the pile (an index), and the value is the number on its top.
    let activePileHeads = new Map();

    // `nextAvailablePileIdentifier` keeps track of the highest identifier (index) assigned to a pile.
    // It starts at -1, so the first pile created will correctly receive identifier 0.
    let nextAvailablePileIdentifier = -1;


    // Iterate through each number in the input sequence to place it onto a pile.
    for (let currentItemIndex = 0; currentItemIndex < totalElementCount; currentItemIndex++) {
        // Retrieve the current number being processed from the sequence.
        const currentNumericalValue = actualNumericValues[currentItemIndex];

        // This variable will hold the identifier of an existing pile if `currentNumericalValue`
        // can be placed on it. If no suitable pile is found, it remains `null`, signaling
        // the need to create a brand new pile.
        let matchedExistingPileId = null;

        // Create a temporary snapshot of all active piles' entries (id, top_value).
        // This snapshot is then sorted by the piles' top values in descending order.
        // This sorting is critical for the search logic to efficiently find the *first*
        // suitable pile that satisfies the placement condition.
        const sortedPileEntrySnapshot = Array.from(activePileHeads.entries())
                                             .sort((entryA, entryB) => entryB[1] - entryA[1]);

        // Search through the sorted snapshot of piles.
        // We are looking for the first pile (starting from the one with the largest top value)
        // whose top element is strictly less than the `currentNumericalValue`.
        for (let snapshotIterator = 0; snapshotIterator < sortedPileEntrySnapshot.length; snapshotIterator++) {
            const [pileKey, pileCurrentTopValue] = sortedPileEntrySnapshot[snapshotIterator];

            if (pileCurrentTopValue < currentNumericalValue) {
                // A suitable pile has been found. Store its identifier.
                matchedExistingPileId = pileKey;
                // No need to continue searching; we found the target pile.
                break;
            }
        }

        // Based on the search result, either create a new pile or update an existing one.
        if (matchedExistingPileId === null) {
            // If no existing pile could accommodate the `currentNumericalValue`, a new pile is created.
            nextAvailablePileIdentifier++; // Assign a new, unique identifier for this pile.
            activePileHeads.set(nextAvailablePileIdentifier, currentNumericalValue);
        } else {
            // If a suitable existing pile was found, its top element is updated.
            activePileHeads.set(matchedExistingPileId, currentNumericalValue);
        }

        // IMPORTANT: Reconstruct the `activePileHeads` Map from its entries, sorted by value in descending order.
        // This step is crucial to replicate the original algorithm's behavior. By doing this,
        // the `Map.prototype.entries()` method in the *next* iteration will yield entries
        // that are already ordered by their top values (descending), thus implicitly sorting
        // the `sortedPileEntrySnapshot` (though it's explicitly sorted again for clarity).
        activePileHeads = new Map(Array.from(activePileHeads.entries()).sort((a, b) => b[1] - a[1]));
    }


    // The total number of piles is determined by `nextAvailablePileIdentifier + 1`,
    // as identifiers are 0-indexed. If no elements were processed, `nextAvailablePileIdentifier`
    // would remain -1, resulting in `0` piles, which is correct.
    const finalNumberOfPilesFormed = nextAvailablePileIdentifier + 1;
    console.log(finalNumberOfPilesFormed);
}

// --- Script Entry Point: Handles I/O and invokes the main processing function ---
try {
    // Attempt to read the entire content from standard input synchronously.
    const standardInputContent = require("fs").readFileSync("/dev/stdin", "utf8");
    // Call the core processing function with the obtained input.
    processNumericalSequence(standardInputContent);
} catch (ioError) {
    // Catch and report any errors that occur during the file reading process.
    console.error(`An error occurred while attempting to read from standard input: ${ioError.message}`);
}