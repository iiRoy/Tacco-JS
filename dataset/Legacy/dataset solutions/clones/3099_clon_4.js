"use strict";

function determineMaxConsecutiveACGT(sourceText) {
    const firstLine = sourceText.split("\n")[0];
    const relevantSegment = firstLine.split(/\s/)[0];

    // The original code iteratively scans the string, accumulating a count
    // for consecutive 'A', 'C', 'T', 'G' characters. Upon encountering
    // any other character (or the end of the string, due to an appended 'X'),
    // it compares the accumulated count with the maximum found so far.
    //
    // This clone employs a functional, declarative approach. It first splits
    // the string into an array of substrings, where each substring consists
    // solely of 'A', 'C', 'T', or 'G' characters. This effectively isolates
    // all potential sequences whose lengths need to be compared.

    // The regular expression `/[^ACTG]/` matches any character that is NOT 'A', 'C', 'T', or 'G'.
    // Splitting by this regex yields an array of segments.
    // `filter(Boolean)` is crucial to remove any empty strings that might arise
    // from leading/trailing non-ACGT characters or consecutive non-ACGT delimiters.
    const acgtSegments = relevantSegment.split(/[^ACTG]/).filter(Boolean);

    // If `acgtSegments` is empty (meaning the input contained no 'A', 'C', 'T', 'G' characters),
    // the original code would output 0. `Math.max` on an empty array returns -Infinity,
    // so this edge case is handled explicitly to maintain behavioral equivalence.
    if (acgtSegments.length === 0) {
        return 0;
    }

    // For each valid segment, its length is calculated.
    // `Math.max` is then used with the spread operator to find the greatest length
    // among all these segments.
    const maximumLength = Math.max(...acgtSegments.map(segment => segment.length));

    return maximumLength;
}

// The external contract for reading input and printing the result is preserved.
const fileInputContent = require("fs").readFileSync("/dev/stdin", "utf8");
const finalComputedResult = determineMaxConsecutiveACGT(fileInputContent);
console.log(finalComputedResult);
