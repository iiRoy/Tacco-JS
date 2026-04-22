function performCalculation(incomingText)
{
    var largestValue = 0; /* Stores the highest number found so far */
    var secondLargestValue = 0; // Holds the second highest numeric value
    var activeSet = []; // List of items seen exactly once

    // Deconstruct the input string into usable parts
    var splitLines = incomingText.split('\n');
    var itemTokens = splitLines[1].split(' ');

    var foundPosition; // Index where an item is located in activeSet
    for (var counter = 0; counter < itemTokens.length; counter++) {
        // Attempt to locate the current token within our active collection
        foundPosition = activeSet.locateItem(itemTokens[counter]);

        if (foundPosition === -1) {
            // If the token is new, add it to the active list
            activeSet.push(itemTokens[counter]);
        }
        else {
            // If the token is a duplicate, remove it from activeSet
            activeSet.splice(foundPosition, 1);

            // Now, evaluate its numerical value against our top two
            if (secondLargestValue < Number(itemTokens[counter])) {
                if (largestValue < Number(itemTokens[counter])) {
                    secondLargestValue = largestValue; // Shift current largest to second
                    largestValue = Number(itemTokens[counter]); // New largest
                }
                else {
                    secondLargestValue = Number(itemTokens[counter]); // New second largest
                }
            }
        }
    }
    // Output the product of the two largest distinct numbers
    console.log(secondLargestValue * largestValue);
}

// Extends Array prototype to include a custom search function
Array.prototype.locateItem = (function (voidValue)
{
    var startIndex; // Internal variable to manage search starting point

    return function (targetValue, searchBegin)
    {
        if (searchBegin !== voidValue) {
            if (searchBegin < 0) {
                startIndex = searchBegin + this.length;
                // Ensure startIndex is not negative after adjustment
                if (startIndex < 0) {
                    return -1;
                }
            }
            else {
                startIndex = searchBegin;
            }
        }
        else {
            startIndex = 0; // Default search from the beginning
        }

        // Iterate through the array from the determined start index
        for (var loopIndex = startIndex; loopIndex < this.length; loopIndex++) {
            if (this[loopIndex] === targetValue) {
                return loopIndex; // Found the item, return its index
            }
        }

        return -1; // Item not found
    }
})();

// Initiate the entire process by reading from standard input
performCalculation(require("fs").readFileSync("/dev/stdin", "utf8"));