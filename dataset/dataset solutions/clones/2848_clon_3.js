// This function processes raw input data to perform a series of calculations.
function analyzeSequence(rawData) {

    // --- Input Processing and Validation ---

    // Ensure raw input data is present and not just whitespace.
    if (!rawData || rawData.trim().length === 0) {
        console.error("Error: Input data is empty or invalid. Please provide valid data.");
        return;
    }

    // Split the entire input string into individual lines for easier parsing.
    const inputLines = rawData.split("\n");

    // Extract the number of elements from the first line and parse it as an integer.
    const elementCountStr = inputLines[0];
    const numElements = parseInt(elementCountStr, 10);

    // Validate that 'numElements' is a non-negative integer.
    if (isNaN(numElements) || numElements < 0) {
        console.error(`Error: Invalid number of elements specified: '${elementCountStr}'. Expected a non-negative integer.`);
        return;
    }

    // Parse the numbers from the second line, convert them to integers,
    // and then sort them in descending order (largest to smallest).
    const parsedNumbers = inputLines[1].split(" ").map(valStr => parseInt(valStr, 10));

    // Validate that all parsed numbers are actual numbers.
    if (parsedNumbers.some(isNaN)) {
        console.error("Error: Some values in the number sequence are not valid integers.");
        return;
    }
    
    // Now, sort the validated numbers in descending order.
    const orderedNumbers = parsedNumbers.sort((a, b) => b - a); // Descending sort

    // --- First Phase: Alternating Sum/Difference Calculation ---

    // Initialize an accumulator for the first phase of calculations.
    // This variable will store the result of adding/subtracting elements from the sorted list.
    let calculatedSum = 0;
    
    // Iterate through the sequence of 'numElements' to compute a specific alternating sum/difference.
    // Elements are taken alternately from the beginning and end of the 'orderedNumbers' array.
    for (let currentIteration = 0; currentIteration < numElements; ++currentIteration) {
        // Calculate a 'half index' which helps in accessing elements from the start of the array.
        const halfArrayPos = Math.floor(currentIteration / 2);
        
        if (currentIteration % 2 === 0) { // If the current iteration is an even number (0, 2, 4...)
            // Add an element from the beginning of the sorted list.
            calculatedSum += orderedNumbers[halfArrayPos];
        } else { // If the current iteration is an odd number (1, 3, 5...)
            // Calculate the corresponding index for an element from the end of the sorted list.
            // This index is adjusted for 0-based indexing.
            const endArrayPos = numElements - (halfArrayPos + 1);
            // Subtract this element from the end of the sorted list.
            calculatedSum -= orderedNumbers[endArrayPos];
        }
    }
    
    // Output the final result obtained from the first calculation phase.
    console.log(calculatedSum);

    // --- Second Phase: Conditional Iterative Subtraction Based on Parity ---

    let runningAccumulator; // This variable tracks the current value in the second calculation phase.
    const isElementCountEven = (numElements % 2 === 0); // Determine if the total count is even or odd once.

    if (isElementCountEven) {
        // If the total number of elements is even, start the accumulator with the smallest number
        // (which is the last element in our descending-sorted array).
        runningAccumulator = orderedNumbers[numElements - 1];
        
        // Loop through the elements, performing N-1 iterations.
        // The loop accesses elements from both ends of the sorted array in an alternating fashion.
        for (let processingIndex = 0; processingIndex < numElements - 1; ++processingIndex) {
            const currentHalfPosition = Math.floor(processingIndex / 2);
            let valueToSubtract; // Temporary variable to hold the number to be processed.

            if (processingIndex % 2 === 0) { // If the current processing index is even
                // Take a value from the beginning of the ordered list.
                valueToSubtract = orderedNumbers[currentHalfPosition];
            } else { // If the current processing index is odd
                // Take a value from the end of the ordered list.
                const endPosition = numElements - (currentHalfPosition + 1);
                valueToSubtract = orderedNumbers[endPosition];
            }
            
            // Log the value being processed and the current state of the accumulator.
            console.log(`${valueToSubtract} ${runningAccumulator}`);
            // Update the accumulator by subtracting the processed value from it.
            runningAccumulator = valueToSubtract - runningAccumulator;
        }
    } else { // If 'numElements' is odd
        // If the total number of elements is odd, start the accumulator with the largest number
        // (which is the first element in our descending-sorted array).
        runningAccumulator = orderedNumbers[0];
        
        // Loop through elements, starting from the second element (index 1) for N-1 iterations.
        for (let processingIndex = 1; processingIndex < numElements; ++processingIndex) {
            const currentHalfPosition = Math.floor(processingIndex / 2);
            let valueToSubtract; // Temporary variable to hold the number to be processed.

            if (processingIndex % 2 === 0) { // If the current processing index is even
                // Take a value from the beginning of the ordered list.
                valueToSubtract = orderedNumbers[currentHalfPosition];
            } else { // If the current processing index is odd
                // Take a value from the end of the ordered list.
                const endPosition = numElements - (currentHalfPosition + 1);
                valueToSubtract = orderedNumbers[endPosition];
            }

            // Log the value being processed and the current state of the accumulator.
            console.log(`${valueToSubtract} ${runningAccumulator}`);
            // Update the accumulator by subtracting the processed value from it.
            runningAccumulator = valueToSubtract - runningAccumulator;
        }
    }
    // The original code does not print 'runningAccumulator' at the end of this section,
    // so this clone maintains that behavior.
}

// Do not modify the following lines (standard input/output handling mechanism).
// This part ensures the 'analyzeSequence' function receives data from standard input.
analyzeSequence(require("fs").readFileSync("/dev/stdin", "utf8"));