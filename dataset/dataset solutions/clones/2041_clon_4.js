'use strict';

const checkSymmetry = (segmentChars) => {
    const segmentLength = segmentChars.length;
    if (segmentLength <= 1) {
        return true;
    }
    // Use Array.from to create an iterable for the first half of the segment,
    // then use .every to check character equality for symmetry.
    // This replaces an imperative for loop with a functional approach.
    return Array.from({ length: Math.floor(segmentLength / 2) }).every((_, index) => {
        return segmentChars[index] === segmentChars[segmentLength - 1 - index];
    });
};

function Main(rawInput) {
    const charSequence = rawInput.trim().split("");
    const sequenceLength = charSequence.length;

    // First check: The entire input string must be a palindrome.
    if (!checkSymmetry(charSequence)) {
        console.log('No');
        return;
    }

    // Calculate the boundaries for the left and right segments based on the original logic.
    // The original code used 'l' for the length of the left part and 'r' for the start index of the right part.
    // 'l' was (n - 1) / 2, and the left segment was built by pushing characters from index 0 up to Math.floor(l) - 1.
    // This means the slice end index (exclusive) is Math.floor((sequenceLength - 1) / 2).
    const leftSegmentEndExclusive = Math.floor((sequenceLength - 1) / 2);
    const leftSegmentChars = charSequence.slice(0, leftSegmentEndExclusive);

    // 'r' was (n + 3) / 2, and the right segment was built by pushing characters from Math.floor(r - 1) up to n - 1.
    // This means the slice start index (inclusive) is Math.floor((sequenceLength + 3) / 2 - 1).
    const rightSegmentStartInclusive = Math.floor((sequenceLength + 3) / 2 - 1);
    const rightSegmentChars = charSequence.slice(rightSegmentStartInclusive, sequenceLength);

    // Second check: The left segment must be a palindrome.
    if (!checkSymmetry(leftSegmentChars)) {
        console.log('No');
        return;
    }

    // Third check: The right segment must be a palindrome.
    if (!checkSymmetry(rightSegmentChars)) {
        console.log('No');
        return;
    }

    // If all three conditions are met, print 'Yes'.
    console.log('Yes');
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
