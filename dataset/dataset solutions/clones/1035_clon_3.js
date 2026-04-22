/**
 * A Type III clone of the original JavaScript code.
 * This version introduces significant structural changes, identifier renames,
 * and utilizes modern JavaScript array methods for clarity and conciseness,
 * while preserving the core logic of counting matching elements.
 *
 * Changes include:
 * - Renamed all variables and the main function.
 * - Used `const` and `let` for variable declarations.
 * - Replaced traditional `for` loops with `for...of` and `Array.prototype.map`.
 * - Replaced the inner linear search loop with `Array.prototype.includes()`.
 * - Added comments to explain different sections and logic.
 * - Introduced basic input validation checks and intermediate variables.
 * - Reformatted whitespace and overall code structure.
 */
function processInputData(rawInputContent) {
    // Remove any leading/trailing whitespace from the entire input string
    // and then split it into an array of individual lines.
    const textLines = rawInputContent.trim().split("\n");

    // --- Input Parsing and Initial Data Extraction ---

    // Attempt to parse the size of the primary data collection from the first line.
    // Using Number.parseInt with radix 10 for explicit base conversion.
    const mainCollectionSize = Number.parseInt(textLines[0], 10);
    // Implement a basic guard clause for invalid collection size.
    if (Number.isNaN(mainCollectionSize) || mainCollectionSize <= 0) {
        console.error("Input Error: The specified main collection size is invalid or non-positive.");
        // In a real application, one might throw an error or exit.
        // For competitive programming, input is usually guaranteed valid.
        return;
    }

    // Attempt to parse the total number of search queries from the third line.
    const numberOfQueries = Number.parseInt(textLines[2], 10);
    // Another guard clause for invalid query count.
    if (Number.isNaN(numberOfQueries) || numberOfQueries < 0) {
        console.error("Input Error: The specified number of search queries is invalid or negative.");
        return;
    }

    // Process the line containing the elements for the primary collection.
    // Split the string by spaces and then use `map` to convert each string
    // token into an integer. Includes a warning for non-numeric values.
    const primaryDataset = textLines[1].split(" ").map(stringValue => {
        const parsedNumber = Number.parseInt(stringValue, 10);
        if (Number.isNaN(parsedNumber)) {
            console.warn(`Data Warning: Non-numeric value '${stringValue}' encountered in primary dataset. Defaulting to 0.`);
            return 0; // Return a default or handle as an error.
        }
        return parsedNumber;
    });

    // Process the line containing the elements that will be used as search queries.
    // Similar mapping process to transform string values into integers.
    const searchTargets = textLines[3].split(" ").map(stringValue => {
        const parsedNumber = Number.parseInt(stringValue, 10);
        if (Number.isNaN(parsedNumber)) {
            console.warn(`Data Warning: Non-numeric value '${stringValue}' encountered in search targets. Defaulting to 0.`);
            return 0;
        }
        return parsedNumber;
    });

    // Initialize a counter to keep track of how many search targets are found
    // within the primary dataset.
    let successfulMatchesCount = 0;

    // --- Core Search Algorithm ---
    // Iterate through each individual search query value from the 'searchTargets' array.
    // The `for...of` loop provides a more readable way to iterate directly over elements.
    for (const currentTargetValue of searchTargets) {
        // For each search target, perform a check to see if it exists within the
        // 'primaryDataset'. The `Array.prototype.includes()` method offers a
        // concise and efficient way to perform this linear search.
        // This replaces the original nested `for` loop and `break` logic.
        const isValueFoundInDataset = primaryDataset.includes(currentTargetValue);

        // If the current search target was successfully located in the primary dataset,
        // increment our total count of matches.
        if (isValueFoundInDataset) {
            successfulMatchesCount++;
        }
    }

    // Output the final tally of how many search queries were found.
    console.log(successfulMatchesCount);
}

// This is the entry point for the script when executed in a Node.js environment.
// It reads the entire content of standard input (usually from a file or pipe)
// as a UTF-8 encoded string and then passes it to our main processing function.
processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));