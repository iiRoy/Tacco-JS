"use strict"

function processInputAndCount(rawInput) {
    const inputString = rawInput.trim().split("\n")[0];
    const targetModulus = 2019;
    let totalDivisibleSubstrings = 0;

    // Initialize arrays for prefix sums modulo targetModulus and powers of 10 modulo targetModulus.
    // `cumulativeModuli[k]` stores the value of `inputString[0...k-1]` modulo `targetModulus`.
    // `tenPowersMod[k]` stores `(10^k) % targetModulus`.
    const cumulativeModuli = new Array(inputString.length + 1).fill(0);
    const tenPowersMod = new Array(inputString.length + 1).fill(1);

    // Populate the prefix sum and powers of 10 arrays.
    for (let currentIdx = 0; currentIdx < inputString.length; currentIdx++) {
        const digitValue = parseInt(inputString[currentIdx], 10);
        cumulativeModuli[currentIdx + 1] = (cumulativeModuli[currentIdx] * 10 + digitValue) % targetModulus;
        tenPowersMod[currentIdx + 1] = (tenPowersMod[currentIdx] * 10) % targetModulus;
    }

    // Iterate through all possible substrings of length 4 or more.
    // `subStart` is the 0-based starting index of the substring.
    // `subEndExclusive` is the 0-based exclusive ending index of the substring.
    for (let subStart = 0; subStart <= inputString.length - 5; subStart++) {
        for (let subEndExclusive = subStart + 4; subEndExclusive <= inputString.length; subEndExclusive++) {
            // Calculate the value of the substring `inputString[subStart...subEndExclusive-1]` modulo `targetModulus`.
            // This is derived from the prefix sums:
            // (cumulativeModuli[subEndExclusive] - cumulativeModuli[subStart] * 10^(subEndExclusive - subStart)) % targetModulus
            let currentSubstringValueMod = (
                cumulativeModuli[subEndExclusive] -
                (cumulativeModuli[subStart] * tenPowersMod[subEndExclusive - subStart]) % targetModulus +
                targetModulus // Add targetModulus to handle potential negative results from subtraction before final modulo
            ) % targetModulus;

            if (currentSubstringValueMod === 0) {
                totalDivisibleSubstrings++;
            }
        }
    }
    console.log(totalDivisibleSubstrings);
}

processInputAndCount(require('fs').readFileSync('/dev/stdin', 'utf8'));

function countStringOccurrences(haystack, needle) {
    // Utilize the String.prototype.matchAll method for a declarative approach
    // to find all non-overlapping occurrences of 'needle' within 'haystack'.
    // The 'g' flag is essential for matchAll to find all matches, not just the first.
    const searchRegex = new RegExp(needle, 'g');
    const allMatches = Array.from(haystack.matchAll(searchRegex));
    return allMatches.length;
}
