"use strict";

/**
 * Orchestrates the processing of a given text input
 * to compute a specific numerical outcome.
 *
 * @param {string} rawInputText - The complete string content read from the input source.
 */
const ProcessDataFlow = (rawInputText) => {
   // Divide the incoming text into an array of individual line strings.
   // Any leading or trailing whitespace for the entire input is removed first.
   let parsedLines = rawInputText.trim().split('\n');

   // The first line contains a single number representing the overall count of items.
   let itemCount = Number(parsedLines[0]);

   // The second line contains two space-separated numbers, acting as classification boundaries.
   let boundaryA = Number(parsedLines[1].split(" ")[0]);
   let boundaryB = Number(parsedLines[1].split(" ")[1]);

   // Initialize three distinct collections to store numbers based on their classification.
   let collectionAlpha = [];
   let collectionBeta = [];
   let collectionGamma = [];

   // The third line contains a series of space-separated numbers; parse them into an array of integers.
   let numericElements = parsedLines[2].split(' ').map(elementValue => parseInt(elementValue, 10));
   
   // Iterate through each numeric element to assign it to the appropriate collection.
   for (let loopCounter = 0; loopCounter < itemCount; loopCounter++) {
     // If the current element is less than or equal to the first boundary,
     // it belongs to the first collection.
     if (numericElements[loopCounter] <= boundaryA) {
       collectionAlpha.push(numericElements[loopCounter]);
     }
     // Else if the current element is less than or equal to the second boundary,
     // it belongs to the second collection. (This implies it's greater than boundaryA).
     else if (numericElements[loopCounter] <= boundaryB) {
       collectionBeta.push(numericElements[loopCounter]);
     }
     // Otherwise, the element must be greater than both boundaries,
     // so it falls into the third collection.
     else {
       collectionGamma.push(numericElements[loopCounter]);
     }
   }

   // Determine the smallest count among the three categorized collections.
   let minimumCategorySize = Math.min(collectionAlpha.length, collectionBeta.length, collectionGamma.length);

   // Output the final calculated minimum size to the standard console.
   console.log(minimumCategorySize);
};

// Invoke the primary data processing function, feeding it content
// read synchronously from the standard input stream as a UTF-8 string.
ProcessDataFlow(require('fs').readFileSync('/dev/stdin', 'utf8'));