"use strict";

// This function processes the input data to calculate a specific sum based on several lists of numbers.
function processInputData(dataLines) {
  // The first line contains configuration parameters: limitP, limitQ, and three unused values.
  const initialConfig = dataLines[0].trim().split(" ").map(strVal => parseInt(strVal, 10));

  // Subsequent lines contain lists of numbers that will be processed.
  let listP = dataLines[1].trim().split(" ").map(strVal => parseInt(strVal, 10));
  let listQ = dataLines[2].trim().split(" ").map(strVal => parseInt(strVal, 10));
  let listR = dataLines[3].trim().split(" ").map(strVal => parseInt(strVal, 10));

  // Extract specific limits for listP and listQ from the initial configuration.
  const limitP = initialConfig[0];
  const limitQ = initialConfig[1];
  const configA = initialConfig[2]; // This variable is declared but not utilized further in the logic.
  const configB = initialConfig[3]; // This variable is declared but not utilized further in the logic.
  const configC = initialConfig[4]; // This variable is declared but not utilized further in the logic.

  // Sort listP in descending order and then truncate it to keep only the top 'limitP' elements.
  listP.sort(function(valA, valB) {
    return valB - valA;
  });
  listP = listP.slice(0, limitP);

  // Sort listQ in descending order and then truncate it to keep only the top 'limitQ' elements.
  listQ.sort(function(valA, valB) {
    return valB - valA;
  });
  listQ = listQ.slice(0, limitQ);

  // Sort listR in descending order and then truncate it to keep only the top 'limitP + limitQ' elements.
  listR.sort(function(valA, valB) {
    return valB - valA;
  });
  listR = listR.slice(0, limitP + limitQ);

  // Concatenate the processed listP and listQ, then sort the resulting combined list in descending order.
  let combinedAndSorted = listP.concat(listQ);
  combinedAndSorted.sort(function(valA, valB) {
    return valB - valA;
  });

  // Iterate through elements of listR. For each element, try to replace an element in combinedAndSorted.
  // If an element from listR is greater than an element in combinedAndSorted, replace it and move to the next listR element.
  for (let idxR = 0; idxR < listR.length; idxR++) {
    for (let idxCombined = 0; idxCombined < combinedAndSorted.length; idxCombined++) {
      if (listR[idxR] > combinedAndSorted[idxCombined]) {
        combinedAndSorted[idxCombined] = listR[idxR];
        break; // Exit inner loop and proceed with the next element from listR
      }
    }
  }

  // Calculate the total sum of all elements in the final combinedAndSorted list.
  let finalTotal = 0;
  for (let idxSum = 0; idxSum < combinedAndSorted.length; idxSum++) {
    finalTotal += combinedAndSorted[idxSum];
  }

  // Output the computed sum to the standard console.
  console.log(finalTotal);
}

// Read the entire input from standard input, decode it as UTF-8, trim whitespace, and split into lines.
// Then, pass the array of lines to the main processing function.
processInputData(require('fs').readFileSync('/dev/stdin', 'utf8').trim().split("\n"));
