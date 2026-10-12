process.stdin.resume();
process.stdin.setEncoding('utf8');

let entireInputBuffer = '';

process.stdin.on('data', function(chunk) {
    entireInputBuffer += chunk;
});

process.stdin.on('end', function() {
    const inputLines = entireInputBuffer.split('\n');

    const totalElementsCount = parseInt(inputLines[0], 10);
    const numberStrings = inputLines[1].split(' ');

    // Type III: Use map for parsing numbers from string array
    const originalNumbersArray = numberStrings.map(numStr => parseInt(numStr, 10));

    // Type III: Create a copy of the array and sort it using spread operator
    const sortedNumbersArray = [...originalNumbersArray].sort((a, b) => a - b);

    // Type III: Use a Map object for better key handling and to store numeric indices
    const sortedValueToIndicesMap = new Map();
    for (let k = 0; k < sortedNumbersArray.length; k++) {
        const currentSortedValue = sortedNumbersArray[k];
        // Type III: Initialize array if key doesn't exist
        if (!sortedValueToIndicesMap.has(currentSortedValue)) {
            sortedValueToIndicesMap.set(currentSortedValue, []);
        }
        // Store the numeric index directly
        sortedValueToIndicesMap.get(currentSortedValue).push(k);
    }
    
    // Type III: Introduce a new variable for the count of elements after one is conceptually removed
    const remainingElementsCount = totalElementsCount - 1;
    
    // Type III: Extract the median determination logic into a small helper function
    const determineAdjustedMedian = (currentRankInSortedArray, medianIdxForRemaining, lowerMedianCandidateValue, upperMedianCandidateValue) => {
        // If the current element's rank is in the lower half (or exactly the median for odd remaining count)
        // the median of the remaining elements shifts to the right.
        if (currentRankInSortedArray <= medianIdxForRemaining) {
            return upperMedianCandidateValue;
        } 
        // Otherwise, the current element is in the upper half, and the median shifts to the left.
        else {
            return lowerMedianCandidateValue;
        }
    };

    // Type III: Loop through each element of the original array using its full length
    for (let i = 0; i < totalElementsCount; i++) {
        const currentOriginalValue = originalNumbersArray[i];
        
        // Type III: Retrieve the rank. Map.get returns the array of indices, pop gets the last one (numeric index)
        const rankInSortedArray = sortedValueToIndicesMap.get(currentOriginalValue).pop();
        
        // Type III: Calculate the median index for the list of remaining elements
        const medianIdxForRemaining = Math.floor(remainingElementsCount / 2);
        
        // Type III: Get the two potential median values from the sorted array
        const lowerMedianCandidateValue = sortedNumbersArray[medianIdxForRemaining];
        const upperMedianCandidateValue = sortedNumbersArray[medianIdxForRemaining + 1];
        
        // Type III: Use the helper function for the final median determination
        const calculatedMedian = determineAdjustedMedian(rankInSortedArray, medianIdxForRemaining, lowerMedianCandidateValue, upperMedianCandidateValue);
        
        console.log(calculatedMedian);
    }
});
