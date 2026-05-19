(function(rawData) {
    // Process the raw input string by splitting it into individual lines.
    let linesArray = rawData.split('\n');

    // The first line of input specifies the total number of cards.
    const cardCount = Number(linesArray.shift());

    // Extract the actual card strings from the remaining lines.
    let unsortedCards = linesArray.slice(0, cardCount);

    // Create a duplicate array to maintain the original order for stability verification.
    const originalCards = [].concat(unsortedCards);

    // Execute the custom quicksort-like partitioning function on the card array.
    quickSortCards(unsortedCards, 0, unsortedCards.length - 1);

    // Determine and print whether the sorting process was stable or not.
    console.log(verifyStability(originalCards, unsortedCards) ? 'Stable' : 'Not stable');

    // Output the final sorted list of cards, each on a new line.
    console.log(unsortedCards.join('\n'));
})(require('fs').readFileSync('/dev/stdin', 'utf8')); // Read input from the standard input stream.

/**
 * Extracts the numerical value from a given card string.
 * Card strings are expected to be in a format like "S1", "H13", where the first character is a suit
 * and the subsequent characters represent the card's value.
 * @param {string} cardString The string representation of a card (e.g., "D10").
 * @returns {number} The integer value of the card.
 */
function extractValue(cardString) {
    // The numeric value starts from the second character of the string.
    return Number(cardString.slice(1, cardString.length));
}

/**
 * Iterates through a list of card strings and concatenates all cards that match a specific numeric value.
 * This function is crucial for checking the relative order of cards with identical values,
 * which is a key aspect of sort stability.
 * @param {string[]} cardList An array of card strings to be filtered.
 * @param {number} targetValue The numeric value to match against.
 * @returns {string} A single string composed of all matching card strings, in their original relative order.
 */
function filterByValue(cardList, targetValue) {
    let resultString = ''; // Accumulator for matching card strings.
    // Loop through each card in the provided list.
    for (let idx = 0; idx < cardList.length; idx++) {
        // If the current card's extracted value matches the target value, append it.
        if (extractValue(cardList[idx]) === targetValue) {
            resultString += cardList[idx];
        }
    }
    return resultString; // Return the concatenated string of matching cards.
}

/**
 * Checks if a sorting algorithm has maintained stability by comparing the relative order
 * of equal elements between the initial and final states of an array.
 * @param {string[]} initialOrder The array of card strings before sorting.
 * @param {string[]} finalOrder The array of card strings after sorting.
 * @returns {boolean} True if the sort was stable, false otherwise.
 */
function verifyStability(initialOrder, finalOrder) {
    let loopIndex = 0; // Index to traverse the arrays.
    // Iterate through the entire length of the sorted array.
    while (loopIndex < finalOrder.length) {
        // Get the numeric value of the card at the current index from the original array.
        const currentValue = extractValue(initialOrder[loopIndex]);

        // Compare the concatenated strings of cards with 'currentValue' from both arrays.
        // If these strings differ, it means the relative order of equal elements has changed.
        if (filterByValue(initialOrder, currentValue) !== filterByValue(finalOrder, currentValue)) {
            return false; // The sort is not stable.
        }

        loopIndex++; // Move to the next element for comparison.
    }
    return true; // All elements with equal values maintained their relative order; the sort is stable.
}

/**
 * Implements a recursive quicksort-like partitioning algorithm to sort an array of card strings.
 * This function sorts the array in place based on the numeric value of the cards.
 * @param {string[]} cardArray The array of card strings to be sorted.
 * @param {number} startIndex The starting index of the current sub-array partition.
 * @param {number} endIndex The ending index of the current sub-array partition.
 */
function quickSortCards(cardArray, startIndex, endIndex) {
    // Base case: If the sub-array has one or zero elements, it is already sorted.
    if (startIndex >= endIndex) {
        return;
    }

    // Select the last element of the sub-array as the pivot.
    const pivotCard = cardArray[endIndex];
    // 'smallerElementsEnd' tracks the boundary between elements less than/equal to pivot
    // and elements greater than pivot.
    let smallerElementsEnd = startIndex - 1;

    // Iterate through the sub-array, excluding the pivot element.
    for (let currentElementIndex = startIndex; currentElementIndex <= endIndex - 1; currentElementIndex++) {
        // If the current element's value is less than or equal to the pivot's value.
        if (extractValue(cardArray[currentElementIndex]) <= extractValue(pivotCard)) {
            smallerElementsEnd++; // Expand the 'smaller elements' region.
            // Swap the current element with the element at 'smallerElementsEnd'.
            let tempStorage = cardArray[smallerElementsEnd];
            cardArray[smallerElementsEnd] = cardArray[currentElementIndex];
            cardArray[currentElementIndex] = tempStorage;
        }
    }

    // Special condition: If the pivot's final position would be its current position (endIndex),
    // it means all elements to its left were smaller or equal. No further partitioning needed for this segment.
    if (smallerElementsEnd + 1 === endIndex) {
        return;
    }

    // Place the pivot element into its correct sorted position.
    let tempStorage = cardArray[smallerElementsEnd + 1];
    cardArray[smallerElementsEnd + 1] = cardArray[endIndex];
    cardArray[endIndex] = tempStorage;

    // Recursively sort the left partition (elements less than or equal to the pivot).
    quickSortCards(cardArray, startIndex, smallerElementsEnd + 1);
    // Recursively sort the right partition (elements greater than the pivot).
    quickSortCards(cardArray, smallerElementsEnd + 1, endIndex);
}
