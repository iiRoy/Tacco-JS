function ProcessInputData(rawDataStream) {
    // This function is designed to analyze a stream of data to determine
    // the minimum total occurrences that need to be removed to
    // achieve a specified number of distinct elements.
    // It's a re-engineered version of an algorithm for frequency-based item reduction.

    // First, divide the raw input into individual lines for structured processing.
    const inputSegments = rawDataStream.trim().split('\n');

    // Implement a basic sanity check for input format.
    if (inputSegments.length < 2) {
        console.error("Input format error: Expected at least two lines of data.");
        return; // Terminate if input is malformed.
    }

    // Extract parameters from the first line.
    // The first value (N in original) is parsed but deliberately not used,
    // representing a deletion of a non-essential part of the original code's logic.
    const [_, targetUniqueElementCountString] = inputSegments[0].split(' ');
    const desiredUniqueCount = Number(targetUniqueElementCountString); // K from original

    // The actual data elements are on the second line.
    const dataElementCollection = inputSegments[1].split(' '); // 'list' from original

    // Utilize a Map to efficiently store and retrieve the frequency of each unique element.
    // A Map is chosen over a plain object for potential semantic benefits and
    // better handling of non-string keys, though for string-based numbers, both work.
    const elementFrequencyMap = new Map(); // 'hindo' from original

    // Iterate through the collected data elements to populate the frequency map.
    // This loop counts how many times each distinct element appears.
    for (const dataItem of dataElementCollection) {
        elementFrequencyMap.set(dataItem, (elementFrequencyMap.get(dataItem) || 0) + 1);
    }

    // Obtain a list of all distinct elements identified, and prepare to sort them.
    // This array will guide which elements are "removed" based on their rarity.
    let distinctElementsList = Array.from(elementFrequencyMap.keys()); // 'youso' from original

    // Sort the distinct elements by their frequency in ascending order.
    // Elements that appear fewer times will be positioned at the beginning of this list.
    distinctElementsList.sort((itemA, itemB) => {
        // The comparison logic remains consistent with the original.
        return elementFrequencyMap.get(itemA) - elementFrequencyMap.get(itemB);
    });

    // Initialize a variable to accumulate the frequencies of elements targeted for removal.
    let totalFrequencyOfEliminatedItems = 0; // 'output' from original

    // Determine the current number of unique elements present in the data.
    const currentDistinctItemCount = distinctElementsList.length;

    // Guard clause: If the number of distinct items is already less than or equal to
    // the desired count, no items need to be eliminated, so the sum is zero.
    // This covers the original `youso.length < K` condition and `youso.length == K`.
    if (currentDistinctItemCount <= desiredUniqueCount) {
        console.log(0);
        return;
    }

    // Calculate how many distinct types of elements must be eliminated to meet the target.
    const numberOfDistinctItemsToEliminate = currentDistinctItemCount - desiredUniqueCount;

    // To calculate the sum of frequencies, we take the 'numberOfDistinctItemsToEliminate'
    // items from the beginning of the sorted list (which are the least frequent).
    // Using Array.prototype.slice() and Array.prototype.reduce() for a more
    // concise and functional approach, replacing the explicit 'while' loop.
    const itemsMarkedForRemoval = distinctElementsList.slice(0, numberOfDistinctItemsToEliminate);

    totalFrequencyOfEliminatedItems = itemsMarkedForRemoval.reduce((accumulator, itemKey) => {
        // Sum up the frequencies of the identified least frequent items.
        return accumulator + elementFrequencyMap.get(itemKey);
    }, 0); // Ensure the accumulator starts at zero.

    // Finally, output the computed total frequency of the eliminated items.
    console.log(totalFrequencyOfEliminatedItems);
}

// Wrapper function to handle input/output operations, making the core logic more testable.
function executeSolutionPipeline() {
    try {
        // Read the entire content of the standard input file.
        const inputContent = require("fs").readFileSync("/dev/stdin", "utf8");
        // Pass the raw content to the primary processing function.
        ProcessInputData(inputContent);
    } catch (operationError) {
        // Enhanced error reporting for file system operations or other runtime issues.
        console.error("An operational error occurred during the solution execution:", operationError.message);
        // In a production environment, you might log more details or exit with a specific code.
        process.exit(1); // Indicate an abnormal termination.
    }
}

// Initiate the solution pipeline.
executeSolutionPipeline();