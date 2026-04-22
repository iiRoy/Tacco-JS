// This module orchestrates the processing of various data sets.
function processInputData(rawDataContent) {
    // Split the entire raw input string into individual lines for easier processing.
    // Each line potentially contains numbers or a sequence of numbers.
    const inputLines = rawDataContent.split("\n");

    // Initialize an index to keep track of the current line being processed.
    // This allows sequential reading through the input data.
    let currentLinePointer = 0;

    // A helper function to retrieve the next line from the input and advance the pointer.
    // This encapsulates the line reading logic, making the main loop cleaner.
    const retrieveNextLine = () => {
        // In a real-world scenario, this might throw an error or return null if input is exhausted.
        // For competitive programming, input format and termination are usually guaranteed.
        if (currentLinePointer >= inputLines.length) {
            return ""; // Return empty string or handle error appropriately
        }
        return inputLines[currentLinePointer++];
    };

    // An array to store all the results before printing them at once.
    // This is more efficient for I/O operations than multiple console.log calls.
    const collectedResults = [];

    // The main processing loop continues until a specific termination condition is met.
    // This structure handles multiple test cases within a single input.
    while (true) {
        // Read the first line of the current test case, which contains two integers
        // representing the sizes of the two subsequent arrays.
        const sizeSpecification = retrieveNextLine().split(" ");
        const firstArraySize = Number(sizeSpecification[0]); // Using Number() for type conversion
        const secondArraySize = Number(sizeSpecification[1]);

        // Termination condition: If both sizes are zero, it signifies the end of input.
        if (firstArraySize === 0 && secondArraySize === 0) {
            break; // Exit the main processing loop.
        }

        // Initialize arrays to store elements and their respective sums.
        // Using 'const' for array references as they won't change, only their contents.
        const elementsOfFirstArray = [];
        let totalSumOfFirst = 0;

        // Populate the first array and calculate its sum.
        // The elements are read one per line following the size specification.
        for (let idxA = 0; idxA < firstArraySize; idxA++) {
            const currentElement = Number(retrieveNextLine());
            elementsOfFirstArray.push(currentElement);
            totalSumOfFirst += currentElement;
        }

        const elementsOfSecondArray = [];
        let totalSumOfSecond = 0;

        // Populate the second array and calculate its sum similarly.
        for (let idxB = 0; idxB < secondArraySize; idxB++) {
            const currentElement = Number(retrieveNextLine());
            elementsOfSecondArray.push(currentElement);
            totalSumOfSecond += currentElement;
        }

        // --- Core Logic for Swapping Elements to Achieve Equal Sums ---

        // Calculate the combined sum of all elements from both arrays.
        const combinedOverallSum = totalSumOfFirst + totalSumOfSecond;

        // Condition check: If the combined sum is odd, it's mathematically impossible
        // to divide it into two equal integer sums. Thus, no swap can achieve equality.
        if (combinedOverallSum % 2 !== 0) {
            collectedResults.push("-1");
            continue; // Skip to the next test case, as no solution exists here.
        }

        // Determine the target sum for each array after a successful swap.
        // If a swap makes sums equal, each new sum must be exactly half of the combined total.
        const targetSumPerArray = combinedOverallSum / 2;

        // Calculate the required difference between an element from the first array (valA)
        // and an element from the second array (valB) to achieve the target sums.
        // The goal is: (totalSumOfFirst - valA + valB) == targetSumPerArray
        // Rearranging this equation leads to: valA - valB == totalSumOfFirst - targetSumPerArray
        // Substituting targetSumPerArray: valA - valB == totalSumOfFirst - (totalSumOfFirst + totalSumOfSecond) / 2
        // Further simplification: valA - valB == (totalSumOfFirst - totalSumOfSecond) / 2
        const desiredElementDifference = (totalSumOfFirst - totalSumOfSecond) / 2;

        // A flag to indicate if a suitable pair for swapping has been found within this test case.
        let swapFoundForTestCase = false;
        let chosenElementA = -1; // Placeholder for the specific element from the first array
        let chosenElementB = -1; // Placeholder for the specific element from the second array

        // For optimized search, store elements of the second array in a Set.
        // This allows for average O(1) time complexity when checking for the existence of an element,
        // significantly improving performance over iterating through the entire second array (O(M)).
        const elementsInSetB = new Set(elementsOfSecondArray);

        // Iterate through each element of the first array using a modern for...of loop.
        for (const currentValA of elementsOfFirstArray) {
            // For the current 'currentValA', calculate what 'valB' from the second array
            // would be precisely needed to satisfy the 'desiredElementDifference' condition.
            // The condition is: currentValA - valB === desiredElementDifference
            // Solving for valB: valB === currentValA - desiredElementDifference
            const requiredValB = currentValA - desiredElementDifference;

            // Check if this calculated 'requiredValB' actually exists within the second array's elements.
            if (elementsInSetB.has(requiredValB)) {
                // If found, we have successfully identified a pair that can achieve equal sums.
                swapFoundForTestCase = true;
                chosenElementA = currentValA;
                chosenElementB = requiredValB;
                break; // A solution has been found, so no need to search further in this test case.
            }
        }

        // Based on whether a swap pair was found, append the appropriate result to our collection.
        if (swapFoundForTestCase) {
            collectedResults.push(`${chosenElementA} ${chosenElementB}`);
        } else {
            collectedResults.push("-1"); // No such pair exists for this test case.
        }
    }

    // After processing all test cases, print all the collected results as a single block of output.
    console.log(collectedResults.join("\n"));
}

// Entry point: Read the entire input from standard input (typically '/dev/stdin' in Linux-like environments)
// and pass it as a string to our main data processing function.
// The 'utf8' encoding ensures proper character interpretation.
processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));