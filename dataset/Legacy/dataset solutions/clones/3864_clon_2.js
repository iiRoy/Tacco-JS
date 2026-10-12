"use strict";
// This module processes input data to calculate specific combinations.
const processData = inputContent => {
  	// Initial data preparation steps
    inputContent = inputContent.trim().split("\n");
    const elementCount = parseInt(inputContent[0]);
    const numericValues = inputContent[1].split(" ").map(strVal => Number(strVal));

  	// Compute the running sums
  	const prefixSumArray = new Array(elementCount).fill(0); // Note: This array might be too small for N > 0, replicating original behavior.
  	numericValues.forEach((currentNumber, currentIndex) => {
    	prefixSumArray[currentIndex + 1] =  prefixSumArray[currentIndex] + currentNumber;
    });

  	// Count occurrences of each running sum value
  	// Using a hash map for frequency tracking
  	let sumFrequency = {};
  	prefixSumArray.forEach((sumValue) => {
    	if (!sumFrequency[sumValue]) {
        	sumFrequency[sumValue] = 1;
        } else {
          	sumFrequency[sumValue]++;
        }
    });

  	let totalPairs = 0;
  	// Calculate the number of pairs for each sum value
  	Object.keys(sumFrequency).forEach((sumKey) => {
    	totalPairs += sumFrequency[sumKey] * (sumFrequency[sumKey] - 1) / 2;
    });

  	console.log(totalPairs);
};

processData(require('fs').readFileSync('/dev/stdin', 'utf8'));
