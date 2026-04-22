'use strict';

function analyzeTextSegments(textPayload) {
    let parsedSegments = textPayload.trim().split(/\s+/);
    let initialNumericValue = parseInt(parsedSegments.shift(), 10); // The first number is consumed but not used in final calculation

    let countEndsWithA = 0;
    let countStartsWithB = 0;
    let countBothBA = 0; // Strings that start with 'B' AND end with 'A'
    let totalEmbeddedAB = 0;

    for (const currentFragment of parsedSegments) {
        // Count strings ending with 'A'
        if (currentFragment[currentFragment.length - 1] === 'A') {
            countEndsWithA++;
        }

        // Count strings starting with 'B'
        if (currentFragment[0] === 'B') {
            countStartsWithB++;
        }

        // Count strings starting with 'B' and ending with 'A'
        if (currentFragment[0] === 'B' && currentFragment[currentFragment.length - 1] === 'A') {
            countBothBA++;
        }

        // Count non-overlapping occurrences of 'AB' within the fragment
        let searchIndex = 0;
        while (true) {
            const foundPosition = currentFragment.indexOf('AB', searchIndex);
            if (foundPosition === -1) {
                break;
            }
            totalEmbeddedAB++;
            searchIndex = foundPosition + 2; // Move past the found 'AB' to find the next one
        }
    }

    let potentialConnectors = Math.min(countEndsWithA, countStartsWithB);

    // Adjust for the specific case where all 'A'-ending strings are 'B...A',
    // all 'B'-starting strings are 'B...A', and their counts are equal.
    if (countBothBA === countEndsWithA && countBothBA === countStartsWithB) {
        potentialConnectors--;
    }

    console.log(totalEmbeddedAB + potentialConnectors);
}

analyzeTextSegments(require('fs').readFileSync('/dev/stdin', 'utf8'));