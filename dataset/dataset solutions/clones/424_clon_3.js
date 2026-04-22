// Function to determine the number of comparisons required to locate a value
// within a sorted array using a bisection method.
// If the value is present, the count reflects the successful find.
// If not present, the count reflects the probes until the search space is exhausted.
function probeSortedCollection(searchTarget, dataCollection) {
    // Basic validation for the input collection.
    // An empty or non-array collection cannot be searched, or if it's not an array at all.
    if (!Array.isArray(dataCollection) || dataCollection.length === 0) {
        return 0; // No comparisons performed on an empty or invalid collection.
    }

    let lowerBoundIdx = 0; // Represents the inclusive start index of the current search segment.
    let upperBoundIdxExclusive = dataCollection.length; // Represents the exclusive end index of the current search segment.
    let comparisonCount = 0; // Tracks the number of iterations or probes made during the search.

    // Continue searching as long as the lower bound is strictly less than the upper bound.
    // This condition ensures there's a valid search space (at least one element).
    while (lowerBoundIdx < upperBoundIdxExclusive) {
        comparisonCount++; // Increment the probe counter for each step of the binary search.

        // Calculate the midpoint index. Using 'lowerBoundIdx + Math.floor((upperBoundIdxExclusive - lowerBoundIdx) / 2)'
        // helps prevent potential integer overflow issues that can occur with '(lowerBoundIdx + upperBoundIdxExclusive) / 2'
        // when dealing with extremely large index values, although less common in JavaScript.
        let midpointCandidate = lowerBoundIdx + Math.floor((upperBoundIdxExclusive - lowerBoundIdx) / 2);

        // Fetch the element at the calculated midpoint for comparison.
        const currentElement = dataCollection[midpointCandidate];

        // Compare the target value with the element found at the midpoint.
        if (currentElement === searchTarget) {
            // If the target is found, we immediately return the current comparison count.
            return comparisonCount;
        } else if (searchTarget < currentElement) {
            // If the target is smaller than the midpoint element, it must reside in the left half
            // of the current search segment. The upper bound is updated to the midpoint.
            upperBoundIdxExclusive = midpointCandidate;
        } else {
            // If the target is larger than the midpoint element, it must reside in the right half
            // of the current search segment. The lower bound is updated to one position past the midpoint.
            lowerBoundIdx = midpointCandidate + 1;
        }
    }

    // If the loop completes without returning, it means the target value was not found
    // within the collection. In this case, we return the total number of comparisons made
    // until the search space was exhausted.
    return comparisonCount;
}

// --- Main application logic for processing standard input streams ---

// Import the 'fs' (file system) module to enable reading from standard input.
const fileSystemModule = require('fs');

// Read the entire content from standard input ('/dev/stdin'),
// interpreting the data as a UTF-8 encoded string.
const rawInputBuffer = fileSystemModule.readFileSync('/dev/stdin', 'utf8');

// Process the raw input: first, remove any leading/trailing whitespace,
// then split the content into an array of strings, where each string represents a line.
const inputLineSegments = rawInputBuffer.trim().split('\n');

// Initialize a pointer to keep track of the current line being processed from 'inputLineSegments'.
let lineCursorPosition = 0;

// Define a semantic constant for the termination condition of the main input processing loop.
const TERMINATION_SIGNAL = 0;

// Main loop to iterate through multiple test cases provided in the input file.
// Each test case typically consists of a collection size, followed by the collection elements,
// and finally the search target.
while (true) {
    // Read the size of the current collection for the test case.
    // The `Number()` function converts the string line to a numeric value.
    // The postfix `++` increments `lineCursorPosition` after its value is used for array access.
    let collectionSize = Number(inputLineSegments[lineCursorPosition++]);

    // Check if the read collection size matches the termination signal.
    // If it does, exit the main processing loop.
    if (collectionSize === TERMINATION_SIGNAL) {
        break;
    }

    // Initialize an empty array to store the numeric data points for the current test case.
    const numericDataPoints = [];

    // Populate the 'numericDataPoints' array with 'collectionSize' elements.
    // Each element is read from a new line in the input and converted to a number.
    for (let currentItemIndex = 0; currentItemIndex < collectionSize; ++currentItemIndex) {
        const valueToAdd = Number(inputLineSegments[lineCursorPosition++]);
        numericDataPoints.push(valueToAdd);
    }

    // Read the target element that needs to be searched for in the 'numericDataPoints' collection.
    const targetElement = Number(inputLineSegments[lineCursorPosition++]);

    // Execute the binary search function (`probeSortedCollection`) with the current target and data.
    // The result, which is the total number of comparisons, is stored.
    const numberOfProbes = probeSortedCollection(targetElement, numericDataPoints);

    // Output the calculated number of probes to the console.
    // This adheres to the original program's output format, printing a single numeric value per test case.
    console.log(numberOfProbes);
}