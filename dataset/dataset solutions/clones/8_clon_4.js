const getModule = require("fs");
const sourceContent = getModule.readFileSync("/dev/stdin", "utf8");

const lineSegments = sourceContent.split('\n');

// Custom comparison logic to replicate `b - a` behavior for sorting strings,
// including how it handles non-numeric values (NaN) by pushing them to the end.
const determineOrder = (firstItem, secondItem) => {
    const numFirst = parseInt(firstItem, 10);
    const numSecond = parseInt(secondItem, 10);

    if (isNaN(numFirst) && isNaN(numSecond)) {
        // Both are non-numeric strings. In `b - a` sort, their relative order is preserved.
        // For insertion, we treat them as "equal" and let the insertion point determine stability.
        return 0;
    } else if (isNaN(numFirst)) {
        // firstItem is non-numeric, secondItem is numeric. Non-numeric should come after numeric.
        // So, firstItem is "smaller" in the descending numeric sort.
        return 1;
    } else if (isNaN(numSecond)) {
        // firstItem is numeric, secondItem is non-numeric. Numeric should come before non-numeric.
        // So, firstItem is "larger" in the descending numeric sort.
        return -1;
    } else {
        // Both are numeric. Sort in descending order.
        return numSecond - numFirst; // Replicates b - a
    }
};

const topThreeElements = [];

for (const currentLine of lineSegments) {
    let inserted = false;
    for (let position = 0; position < topThreeElements.length; position++) {
        const existingLine = topThreeElements[position];
        const comparisonResult = determineOrder(currentLine, existingLine);

        if (comparisonResult < 0) { // currentLine is "larger" and should be placed before existingLine
            topThreeElements.splice(position, 0, currentLine);
            inserted = true;
            break;
        }
        // If comparisonResult is 0 (equal) or > 0 (currentLine is "smaller"), continue to find the correct spot.
        // For equal elements, the splice will insert before existing if comparison is < 0.
        // If comparison is 0, it skips and tries to insert after.
    }

    if (!inserted && topThreeElements.length < 3) {
        // If not inserted yet (meaning it's "smaller" or "equal" to all current topThreeElements),
        // and there's space, append it. This handles the case where it's smaller than all existing,
        // or equal and appears later in the input (preserving stability for equals at the end of the block).
        topThreeElements.push(currentLine);
        inserted = true;
    } else if (!inserted && topThreeElements.length === 3) {
        // If not inserted, and array is full, check if it's "larger" or "equal" to the smallest element.
        const smallestInTopThree = topThreeElements[topThreeElements.length - 1];
        const comparisonWithSmallest = determineOrder(currentLine, smallestInTopThree);
        if (comparisonWithSmallest <= 0) { // currentLine is "larger" or "equal" to the current smallest
            topThreeElements.push(currentLine); // Add it temporarily
            inserted = true;
        }
    }

    // After potential insertion, ensure size is at most 3
    if (topThreeElements.length > 3) {
        topThreeElements.pop(); // Remove the smallest element to maintain top 3
    }
}

// Prepare the final output, ensuring exactly 3 lines are printed,
// including `undefined` if there are fewer than 3 actual results.
const outputLines = [];
for (let idx = 0; idx < 3; idx++) {
    outputLines.push(topThreeElements[idx]); // If topThreeElements[idx] is undefined, it pushes undefined
}

outputLines.forEach(displayValue => {
    const outputWriter = console.log; // Using an alias to avoid reusing the identifier 'console.log' directly
    outputWriter(displayValue);
});