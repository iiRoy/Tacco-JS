"use strict";

const obtainSortedFrequencies = (inputString) => {
    const charCounts = [...inputString].reduce((accumulator, char) => {
        const charIndex = char.charCodeAt(0) - 97;
        accumulator[charIndex] = (accumulator[charIndex] || 0) + 1;
        return accumulator;
    }, Array(26).fill(0));

    return charCounts.sort((valA, valB) => valA - valB);
};

const main = (inputData) => {
    const [firstString, secondString] = inputData.trim().split("\n");

    const sortedDistributionA = obtainSortedFrequencies(firstString);
    const sortedDistributionB = obtainSortedFrequencies(secondString);

    console.log(sortedDistributionA.join("") === sortedDistributionB.join("") ? "Yes" : "No");
};

main(require('fs').readFileSync('/dev/stdin', 'utf8'));
