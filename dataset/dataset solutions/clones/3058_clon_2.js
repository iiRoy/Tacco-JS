var storedInputs = [];


var lineReaderModule = require('readline');


var inputOutputHandler = lineReaderModule.createInterface({
    input:   process.stdin,
    output:  process.stdout
});


inputOutputHandler.on('line', function (currentInputLine) {
    storedInputs.push(currentInputLine);
});


inputOutputHandler.on('close', function () {
    
    var firstInputParts = storedInputs.shift().split(" ");
    
    var totalItems = Number(firstInputParts[0]);
    var maxAllowedSwaps = Number(firstInputParts[1]);

    var characterArray = storedInputs[0].split("");

    var segmentSizes = [];
    var activeBit = 1; 
    var currentSegmentLength = 0;

    // This loop processes the input character sequence to determine
    // lengths of consecutive blocks of '1's and '0's.
    for (var idxA = 0; idxA < totalItems; idxA++) {
        if (characterArray[idxA] === activeBit.toString()) { 
            currentSegmentLength++; 
        }
        else {
            segmentSizes.push(currentSegmentLength);
            activeBit = 1 - activeBit; 
            currentSegmentLength = 1;
        }
    }

    // Append the final segment's length if it was non-zero.
    if (currentSegmentLength !== 0) { 
        segmentSizes.push(currentSegmentLength); 
    }

    // Ensure the segment array always has an odd number of elements
    // by adding a zero at the end if its length is even.
    // This helps in consistent window calculations later.
    if (segmentSizes.length % 2 === 0) { 
        segmentSizes.push(0); 
    }
    
    var windowSum = 0; 
    var maximumLength = 1; // Initialize with 1 as per typical problem constraints.

    // Iterate through the processed segment lengths to find the maximum possible
    // consecutive '1's by applying at most 'maxAllowedSwaps' flips.
    // A window of (2 * maxAllowedSwaps + 1) segments represents the maximum
    // span achievable by flipping 'maxAllowedSwaps' blocks of zeros.
    for (var idxA = 0; idxA < segmentSizes.length; idxA++) {
        // We only consider windows that start with a block of '1's (even indices).
        if (idxA % 2 === 0) {
            // Calculate the sum of segment lengths within the current window.
            for (var idxB = 0; idxB <= 2 * maxAllowedSwaps; idxB++) { 
                if (idxA + idxB < segmentSizes.length) {
                    windowSum += segmentSizes[idxA + idxB]; 
                }
            }
            
            // Update the overall maximum length if the current window sum is greater.
            if (maximumLength < windowSum) { 
                maximumLength = windowSum; 
            }
            
            // Reset the window sum for the next iteration.
            windowSum = 0;
        }
    }

    // Print the final calculated maximum length.
    console.log(maximumLength);
});