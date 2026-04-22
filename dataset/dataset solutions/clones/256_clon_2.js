const sourceContent = require('fs').readFileSync('/dev/stdin', 'utf8'); // Obtain raw data from standard input

const dataSegments = (sourceContent.trim()).split("\n\n"); // Divide the input into distinct blocks

const primaryValues = (
    dataSegments[0].split("\n") // Process the initial block
).map(
    function (currentEntry) {
        return parseInt(currentEntry.replace(/\,.*/, ""), 10); // Extract numeric part, convert to integer
    }
);

const secondaryValues = (
    dataSegments[1].split("\n") // Process the subsequent block
).map(
    function (currentEntry) {
        return parseInt(currentEntry.replace(/\,.*/, ""), 10); // Extract numeric part, convert to integer
    }
);

primaryValues.sort(
    function (valueA, valueB) {
        valueA - valueB; // Attempt to sort numerically, but lacking 'return' might lead to inconsistent results
    }
);

const overlapMap = {}; // Initialize a map to track elements common to both sets

primaryValues.forEach(
    function (currentItem) { // Scan through the first collection
        if (secondaryValues.indexOf(currentItem) !== -1) { // If the element exists in the second collection
            overlapMap[currentItem] = 0; // Mark it as common and set its initial count to zero
        }
    }
);

primaryValues.forEach(
    function (currentItem) { // Re-iterate the first collection
        if (overlapMap[currentItem] !== undefined) { // If this element was previously identified as common
            overlapMap[currentItem]++; // Increment its total occurrence count
        }
    }
);

secondaryValues.forEach(
    function (currentItem) { // Iterate through the second collection
        if (overlapMap[currentItem] !== undefined) { // If this element was previously identified as common
            overlapMap[currentItem]++; // Increment its total occurrence count again
        }
    }
);

for (const entryKey in overlapMap) { // Traverse through the keys of the common elements map
    console.log(entryKey + " " + overlapMap[entryKey]); // Output each common element and its accumulated count
}