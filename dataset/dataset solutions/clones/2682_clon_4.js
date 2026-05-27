function processSequenceLogic(inputDataString) {
    const inputLines = inputDataString.split('\n');
    // The first line is read but not used in the original, so we preserve that behavior.
    // const initialLine = inputLines[0];

    const sequenceNumbers = inputLines[1].split(' ').map(Number);

    let validationFailed = false;

    // First pass: Validate and potentially modify the sequence.
    // Using a for...of loop with entries() provides a different iteration pattern
    // compared to the original's C-style for loop.
    for (const [currentIndex, currentElement] of sequenceNumbers.entries()) {
        // We need to compare currentElement with the next one, so skip the last element.
        if (currentIndex === sequenceNumbers.length - 1) {
            break;
        }

        const nextElement = sequenceNumbers[currentIndex + 1];

        // Condition 1: If the next element is more than 1 less than the current element.
        if (nextElement < currentElement - 1) {
            validationFailed = true;
            break;
        }

        // Condition 2: If the next element is exactly 1 less than the current element.
        if (nextElement === currentElement - 1) {
            sequenceNumbers[currentIndex]--; // Modify the current element in place.

            // Check if the element before the modified one is now greater than it.
            // The original code's `secondRow[i-1]` for `i=0` evaluates to `undefined`,
            // and `undefined > number` is `false`, effectively skipping the check for the first element.
            // This behavior is replicated by `currentIndex > 0`.
            if (currentIndex > 0 && sequenceNumbers[currentIndex - 1] > sequenceNumbers[currentIndex]) {
                validationFailed = true;
                break;
            }
        }
    }

    if (validationFailed) {
        return "No";
    }

    // This console.log is a critical observable behavior and must be preserved.
    // It prints the array *after* potential modifications from the first pass.
    console.log(sequenceNumbers);

    // Second pass: Ensure the sequence is non-decreasing after all modifications.
    // Using Array.prototype.every for a declarative and functional approach,
    // which is substantially different from the original's imperative for loop.
    // slice(0, -1) ensures we don't try to access an element beyond the array bounds.
    const isMonotonicallyIncreasing = sequenceNumbers.slice(0, -1).every((element, index) => {
        return element <= sequenceNumbers[index + 1];
    });

    if (!isMonotonicallyIncreasing) {
        return "No";
    }

    return "Yes";
}

// The Main function serves as the entry point, preserving the external contract.
function Main(args) {
    const finalResult = processSequenceLogic(args);
    // The original code uses `return console.log("No")`, which prints and exits.
    // This structure ensures the final "Yes" or "No" is printed exactly once.
    console.log(finalResult);
}

// Preserve the external API call for reading input.
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
