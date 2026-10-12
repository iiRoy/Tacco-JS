"use strict";

// This function performs a binary search-like operation
// to find an insertion point or the index of a target value.
const findPosition = (dataCollection, searchValue) => {
    let upperBound = dataCollection.length - 1; // Upper boundary of the search range
    let lowerBound = 0; // Lower boundary of the search range
    
    // Continue searching while the lower bound is less than the upper bound
    while (lowerBound < upperBound) {
        // Calculate the middle index, rounding down
        let middleIndex = Math.floor((lowerBound + upperBound) / 2); 
        
        // If the search value is found at the middle, return its index
        if (searchValue === dataCollection[middleIndex]) {
            return middleIndex;
        }
        
        // If the search value is less than the middle element,
        // narrow the search to the left half.
        if (searchValue < dataCollection[middleIndex]) {
            upperBound = middleIndex - 1;
        } 
        // Otherwise, narrow the search to the right half.
        else {
            lowerBound = middleIndex + 1;
        }
    }
    
    // After the loop, 'lowerBound' (which equals 'upperBound')
    // points to a potential insertion point or the element itself.
    if (dataCollection[lowerBound] < searchValue) {
        return lowerBound + 1; // Target should be inserted after this element
    }
    if (dataCollection[lowerBound] >= searchValue) {
        return lowerBound; // Target should be inserted at or before this element
    }
    return 0; // Fallback, typically indicates an empty array or specific edge case
};

// Main function to process the input data
const processInput = (inputData) => {
    // Split the entire input string by newline characters
    inputData = inputData.split("\n");
    
    // Parse the first line as the count of elements (N)
    const countElements = parseInt(inputData[0]);
    
    // Process the second line: split by space, convert to integers, and sort numerically
    const upperArray = inputData[1].split(" ").map(itemVal => parseInt(itemVal)).sort((valA, valB) => valA - valB);
    
    // Process the third line similarly for the middle array
    const middleArray = inputData[2].split(" ").map(itemVal => parseInt(itemVal)).sort((valA, valB) => valA - valB);
    
    // Process the fourth line similarly for the lower array
    const lowerArray = inputData[3].split(" ").map(itemVal => parseInt(itemVal)).sort((valA, valB) => valA - valB);
    
    // Log the processed upper and lower arrays
    console.log(upperArray);
    console.log(lowerArray);
    console.log("    "); // Output a line with spaces for separation
    
    let totalSum = 0; // Initialize a counter for the final result
    
    // Iterate over the indices of the middle array
    for (let idx in middleArray) {
        // Find the count of elements in 'upperArray' less than or equal to current middle element
        let upperCount = findPosition(upperArray, middleArray[idx]);
        
        // Calculate the count of elements in 'lowerArray' greater than or equal to current middle element
        let lowerCount = lowerArray.length - findPosition(lowerArray, middleArray[idx]);
        
        // Log the raw result of the lower array search
        console.log(findPosition(lowerArray, middleArray[idx]));
        
        // Log intermediate results with specific string formatting
        console.log(middleArray[idx] + "以下が" + upperCount + "個");
        console.log(middleArray[idx] + "以上が" + lowerCount + "個");
        console.log("-----------"); // Separator line
        
        // Accumulate the product of the two counts
        totalSum += upperCount * lowerCount;
    }
    
    // Output the final calculated sum
    console.log(totalSum);
};

// Read input from standard input and pass it to the processing function
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
