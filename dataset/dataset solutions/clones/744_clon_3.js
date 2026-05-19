var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');
var lineBuffer = (rawData.trim()).split("\n");

const COLON_DELIMITER = ":";
const COMMA_DELIMITER = ",";
const LAST_CHAR_SLICE_END = -1; // Used for .slice(0, -1) to remove trailing character

// Helper function to parse a dependency string into its key and an array of values.
// Example: "key:val1,val2," -> { key: "key", values: ["val1", "val2"] }
const extractDependencyParts = (lineString) => {
    const parts = lineString.split(COLON_DELIMITER);
    const dependencyKey = parts[0];
    // Remove the trailing character (assumed to be a comma) and then split by comma
    const dependencyValues = parts[1].slice(0, LAST_CHAR_SLICE_END).split(COMMA_DELIMITER);
    return { dependencyKey, dependencyValues };
};

while (true) {
    // Read the number of entries for the current test case.
    // Using parseInt with radix for robustness.
    var numEntries = parseInt(lineBuffer.shift(), 10);
    if (numEntries === 0) {
        break; // Exit loop if numEntries is 0
    }

    // Parse the initial set of items from the first line.
    // This line is structured as "someKey:item1,item2,..." but only the items are needed initially.
    const initialLineContent = lineBuffer.shift();
    const initialValuesString = initialLineContent.split(COLON_DELIMITER)[1];
    let currentExpansionSet = initialValuesString.slice(0, LAST_CHAR_SLICE_END).split(COMMA_DELIMITER);

    // Build the dependency map from the subsequent lines.
    // Each line defines a key and its associated dependencies.
    const dependencyMap = {};
    for (let idx = 0; idx < numEntries - 1; idx++) {
        const currentDependencyLine = lineBuffer.shift();
        const { dependencyKey, dependencyValues } = extractDependencyParts(currentDependencyLine);
        dependencyMap[dependencyKey] = dependencyValues;
    }

    // Iteratively expand the set of items based on dependencies until no new items are added.
    let previousSetLength = 0;
    while (currentExpansionSet.length !== previousSetLength) {
        previousSetLength = currentExpansionSet.length; // Store length before current iteration's modifications
        const newlyDiscoveredItems = [];

        // Iterate over the items that were present at the start of this iteration.
        // This ensures that items added in the current iteration are processed in the next.
        for (let k = 0; k < previousSetLength; k++) {
            const currentItem = currentExpansionSet[k];
            // Check if the current item is a key in our dependency map.
            if (dependencyMap.hasOwnProperty(currentItem)) {
                currentExpansionSet[k] = ""; // Mark the item for removal later (it's being "expanded")
                newlyDiscoveredItems.push(...dependencyMap[currentItem]); // Add its dependencies to a temporary list
            }
        }
        // Append all newly found dependencies to the main expansion set.
        currentExpansionSet.push(...newlyDiscoveredItems);
    }

    // Filter out the marked (empty string) items and count the number of unique elements.
    const finalFilteredSet = currentExpansionSet.filter(item => item !== "");
    const uniqueElements = new Set(finalFilteredSet); // Use a Set to easily get unique count
    console.log(uniqueElements.size);
}
