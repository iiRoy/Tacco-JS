// This function performs a character-by-character comparison between two input sequences.
// It determines which sequence is lexicographically greater, lesser, or if they are equal.
function compareSegments(segmentA, segmentB) {
    // Check if the initial character of the first segment is greater than the initial character of the second.
    if (segmentA[0] > segmentB[0]) {
        return 'GREATER'; // If so, the first segment is considered greater.
    }
    // Otherwise, check if the initial character of the first segment is less than the initial character of the second.
    else if (segmentA[0] < segmentB[0]) {
        return 'LESS'; // If so, the first segment is considered lesser.
    }
    // If the initial characters are identical, check if we have reached the end of a segment.
    // A length of 1 implies only the current character was left for comparison.
    else if (segmentA.length === 1) {
        return 'EQUAL'; // If segments are equal up to this point and no more characters remain, they are equal.
    }
    // If initial characters are identical and more characters exist, recurse with the remaining parts of the segments.
    else {
        // Recursively call the comparison function, advancing to the next characters in both segments.
        return compareSegments(segmentA.slice(1), segmentB.slice(1));
    }
}

// The main entry point function that processes the raw input data.
function processInputData(rawInputString) {
    // Divide the incoming string into an array of individual lines, using the newline character as a delimiter.
    let inputLines = rawInputString.split('\n');

    // First, evaluate the lengths of the initial two lines from the input.
    if (inputLines[0].length > inputLines[1].length) {
        console.log('GREATER'); // Output 'GREATER' if the first line is longer.
    }
    // If the first line is not longer, check if it is shorter than the second line.
    else if (inputLines[0].length < inputLines[1].length) {
        console.log('LESS'); // Output 'LESS' if the first line is shorter.
    }
    // If the lengths of both lines are found to be identical, proceed with a detailed character-by-character comparison.
    else {
        // Invoke the recursive comparison function with full copies of the two lines.
        // The .slice(0) operation creates a shallow copy of the string, which is functionally equivalent to the original string itself.
        console.log(compareSegments(inputLines[0].slice(0), inputLines[1].slice(0)));
    }
}

// Execute the primary processing function by reading content from standard input.
// The 'fs' module is used to read the file synchronously, and 'utf8' specifies the encoding.
processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
