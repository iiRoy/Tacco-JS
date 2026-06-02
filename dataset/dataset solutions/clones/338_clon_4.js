var print = console.log;

function PreMain(rawInputContent) {
    const lines = rawInputContent.split("\n");
    // The original Main function's loop starts from index 1, effectively skipping the first line.
    // We pass the relevant lines (from index 1 onwards) directly to the main processing function.
    Main(lines.slice(1));
}

function Main(dataSegments) {
    // Using a Map to store categorized entries, where keys are strings and values are arrays of numbers.
    // This replaces the original array of arrays (`lst`) and provides more efficient lookups.
    const categorizedEntries = new Map();

    // Iterate over each data segment (line) to populate the map.
    // This replaces the original imperative `for` loop with an inner `forEach` and `flg` variable.
    for (const segment of dataSegments) {
        // Skip any empty lines that might result from splitting.
        if (!segment.trim()) continue;

        // Split each line into its key part and value part.
        const [keyPart, valuePart] = segment.split(' ');
        // Parse the value part into an integer.
        const numericalValue = parseInt(valuePart);

        // Check if the key already exists in the map.
        if (categorizedEntries.has(keyPart)) {
            // If it exists, append the new numerical value to its associated array.
            categorizedEntries.get(keyPart).push(numericalValue);
        } else {
            // If it's a new key, create a new array with the numerical value and set it in the map.
            categorizedEntries.set(keyPart, [numericalValue]);
        }
    }

    // Extract all keys from the map and sort them alphabetically.
    // This replaces the custom `item_getter_key(0)` used for sorting the main list.
    const orderedKeys = Array.from(categorizedEntries.keys()).sort();

    // Iterate through the sorted keys to produce the output.
    for (const currentKey of orderedKeys) {
        // Print the current key.
        print(currentKey);

        // Retrieve the array of associated numerical values for the current key.
        const associatedValues = categorizedEntries.get(currentKey);

        // Sort the array of numbers numerically in ascending order.
        // This replaces the `Array.prototype.Sort()` extension.
        associatedValues.sort((a, b) => a - b);

        // Join the sorted numbers with spaces and print the result.
        // This replaces the `Array.prototype.Format()` extension.
        print(associatedValues.join(' '));
    }
}

// The external contract for reading input remains the same.
PreMain(require("fs").readFileSync("input.txt", "utf8"));
