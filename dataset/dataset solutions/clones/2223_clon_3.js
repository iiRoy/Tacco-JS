"use strict";

function processInputData(rawDataString) {
    const inputLines = rawDataString.trim().split("\n");
    let numericalLimit = Number(inputLines[0].split(" ")[0]);

    // Type III: Added input validation for robustness.
    if (isNaN(numericalLimit) || numericalLimit <= 0) {
        console.error("Error: Invalid or non-positive numerical limit provided. Exiting.");
        return;
    }

    const limitDigitCount = String(numericalLimit).length;
    let finalAggregateCount = 0; // Renamed 'count' to 'finalAggregateCount' for clarity.

    // Outer loop iterates through each potential base value, 'baseVal', from 1 up to numericalLimit - 1.
    for (let baseVal = 1; baseVal < numericalLimit; baseVal++) {
        const boundaryDigits = extractBoundaryDigits(baseVal); // Renamed 'row' to 'boundaryDigits'.
        const firstBoundaryDigit = boundaryDigits[0]; // Renamed 'row[0]'.
        const lastBoundaryDigit = boundaryDigits[1]; // Renamed 'row[1]'.

        // Type III: Rewriting the complex and inconsistent inner 'j' loop logic
        // to a more structured and consistent generation of numbers.
        // The original 'j' loop's role was ambiguous, often ignored for 'k' loop.
        // This new structure aims to consistently count numbers X <= numericalLimit
        // that start with 'firstBoundaryDigit' and end with 'lastBoundaryDigit',
        // covering various lengths of middle segments.

        // Case 1: Numbers with no middle part (two digits total, e.g., 'AB').
        // This implicitly covers scenarios like the original's L=1, j=1 case.
        let candidateString = `${firstBoundaryDigit}${lastBoundaryDigit}`;
        let formedNumber = Number(candidateString);
        if (formedNumber <= numericalLimit) {
            finalAggregateCount++;
        }

        // Case 2: Numbers with a single middle digit (three digits total, e.g., 'A0B', 'A1B', ..., 'A9B').
        // This partially covers the original's L=1, j=2, and L>1, j=1/2 logic,
        // and also the start of the 'k' loop for j>2.
        for (let middleDigit = 0; middleDigit <= 9; middleDigit++) {
            candidateString = `${firstBoundaryDigit}${middleDigit}${lastBoundaryDigit}`;
            formedNumber = Number(candidateString);

            if (formedNumber <= numericalLimit) {
                finalAggregateCount++;
            } else {
                // Type III: Optimization - If the current formed number exceeds the limit,
                // any subsequent middle digits (for the same length) will also result in
                // numbers greater than the limit. This mirrors the 'if (x > N) break' from the original 'k' loop.
                // Added a safeguard to prevent excessively long numbers from being processed.
                if (String(formedNumber).length > limitDigitCount + 1) break;
                if (String(formedNumber).length === limitDigitCount && formedNumber > numericalLimit) break;
                if (String(formedNumber).length === limitDigitCount + 1 && formedNumber > numericalLimit) break;
            }
        }

        // Case 3: Numbers with multiple middle digits (four or more digits total, e.g., 'A00B', 'A01B', etc.).
        // This comprehensively replaces the original's 'j > 2' blocks, which used the 'k' loop
        // to generate numbers like 'A k B', where 'k' could be multi-digit.
        // We iterate by the *length* of the middle segment.
        for (let middleLength = 2; middleLength <= limitDigitCount - 2; middleLength++) {
            // Calculate the range of middle segment values for the current 'middleLength'.
            // For middleLength=2, middleSegment goes from 10 to 99 (e.g., 'A10B' to 'A99B').
            const minMiddleValue = Math.pow(10, middleLength - 1);
            const maxMiddleValue = Math.pow(10, middleLength) - 1;

            // Type III: Added an early exit condition to avoid generating numbers that are
            // already too long even with the smallest possible middle segment.
            let testWithMinMiddle = Number(`${firstBoundaryDigit}${minMiddleValue}${lastBoundaryDigit}`);
            if (testWithMinMiddle > numericalLimit && String(testWithMinMiddle).length > limitDigitCount) {
                 break; // If the smallest number for this middleLength is too large, skip this length.
            }

            for (let middleSegment = minMiddleValue; middleSegment <= maxMiddleValue; middleSegment++) {
                candidateString = `${firstBoundaryDigit}${middleSegment}${lastBoundaryDigit}`;
                formedNumber = Number(candidateString);

                if (formedNumber <= numericalLimit) {
                    finalAggregateCount++;
                } else {
                    // Type III: Optimization - Similar to the above, if the current formed number
                    // exceeds the limit, further 'middleSegment' values of the same length
                    // will also likely be too large. This directly mirrors the 'if (x > N) break' from original.
                    break;
                }
            }
        }
    }
    console.log(finalAggregateCount);
}

// Helper utility to obtain the first and last digits of a given number.
function extractBoundaryDigits(inputVal) { // Renamed 'get_tip' to 'extractBoundaryDigits'.
    const valueAsString = String(inputVal); // Renamed 'a_str' to 'valueAsString'.
    const lengthOfValue = valueAsString.length; // Renamed 'x' to 'lengthOfValue'.
    
    // For single-digit numbers, both boundary digits are identical.
    if (lengthOfValue === 1) {
        const digitValue = Number(valueAsString);
        return [digitValue, digitValue];
    } else {
        // For multi-digit numbers, extract the first and last characters, then convert them to numbers.
        return [Number(valueAsString[0]), Number(valueAsString[lengthOfValue - 1])];
    }
}

// Entry point for script execution, reading input from standard input.
processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));