"use strict";

// Utilize Node.js file system module to read input from standard input
const inputString = require('fs').readFileSync('/dev/stdin', 'UTF-8');

// Divide the entire input string into individual lines
const inputLines = inputString.split('\n');

// Separate the first line's content by spaces to extract initial parameters
const firstLineParts = inputLines[0].split(' ');

// Separate the second line's content by spaces to get the array elements
const permutationElements = inputLines[1].split(' ');

// Convert the string representations of N and K into integer values
const totalElements = parseInt(firstLineParts[0]);
const subArrayLength = parseInt(firstLineParts[1]);

// Initialize an array to store unique string representations of permutations
let uniquePermutations = [];
// Initialize a counter for the number of iterations performed
let iterationCounter = 0;

// Create an array whose length determines the number of times we iterate.
// This length corresponds to the number of possible starting positions for the K-length segment.
const indicesArray = new Array(permutationElements.length - subArrayLength + 1).fill(0);

// Iterate through each possible starting index for the segment that will be sorted
indicesArray.map(function(_, currentIdx) {
    // This conditional check is present in the original code,
    // even though the array length calculation usually prevents out-of-bounds access.
    // It's preserved to maintain identical control flow.
    if (currentIdx + subArrayLength > permutationElements.length) {
        return; // Exit the current iteration if the segment would extend beyond array bounds
    }

    // Extract the portion of the array before the current K-length segment
    const prefixElements = permutationElements.slice(0, currentIdx);
    // Extract the K-length segment and sort its elements lexicographically
    const sortedSegment = permutationElements.slice(currentIdx, currentIdx + subArrayLength).sort((valA, valB) => valA > valB);
    // Extract the portion of the array after the current K-length segment
    const suffixElements = permutationElements.slice(currentIdx + subArrayLength);

    // Combine the three parts to form the new permutation
    const currentPermutation = prefixElements.concat(sortedSegment).concat(suffixElements);
    // Convert the permutation array into a single string for efficient comparison and storage
    const permutationString = currentPermutation.join('');

    // Check if this specific permutation string has already been added to our collection
    if (uniquePermutations.indexOf(permutationString) < 0) {
        // If it's a new unique permutation, add it to the list
        uniquePermutations.push(permutationString);
    }
    // Increment the counter for each iteration completed
    iterationCounter++;
});

// Output the total count of unique permutations found.
// Using Object.keys().length on an array returns its length, preserving original expression.
console.log(Object.keys(uniquePermutations).length);
