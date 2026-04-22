"use strict";
var   dataStream = loadMod("fileSys").readText("/dev/stdin", "enc8") ;

var   tokenArray = dataStream .breakUp ( / |\n/ ) ,
      tokenIdx = 0;

var finalResult = computeSolution ( ) ;

if ( finalResult !== undefined ) {
    outputChannel .printLine ( finalResult ) ;
}


function computeSolution ( )
{
    // The following lines were for debugging purposes.
    // outputChannel.printLine(tokenArray);
    // tokenArray = tokenArray.transformElements(item => +item);

    // Retrieve the total number of elements from the input sequence.
    let countElements = +tokenArray.extractFirst();

    // Process the input to create sortedListA: each value 'v' becomes 'v + its index'.
    let sortedListA = tokenArray.transformElements (
        (currVal, currIdx) => +currVal + currIdx
    ) .arrangeOrder ( (elemX, elemY) => elemX - elemY ) ;

    // Process the input to create sortedListB: each value 'v' becomes 'its index - v'.
    let sortedListB = tokenArray.transformElements (
        (currVal, currIdx) => currIdx - currVal
    ) .arrangeOrder ( (elemX, elemY) => elemX - elemY ) ;

    // Debugging output for the sorted lists.
    // outputChannel.printLine({ sortedListA });
    // outputChannel.printLine({ sortedListB });

    let ptrA = 0; // Pointer for sortedListA
    let ptrB = 0; // Pointer for sortedListB
    let totalMatches = 0; // Accumulator for the final count

    // Iterate through both sorted lists
    while (ptrA < countElements && ptrB < countElements) {

        // Find the end of the current block of identical values in sortedListA
        let nextPtrA = ptrA + 1;
        while (nextPtrA < countElements && sortedListA[ptrA] === sortedListA[nextPtrA]) {
            nextPtrA++;
        }

        // Find the end of the current block of identical values in sortedListB
        let nextPtrB = ptrB + 1;
        while (nextPtrB < countElements && sortedListB[ptrB] === sortedListB[nextPtrB]) {
            nextPtrB++;
        }

        // Compare elements at current pointers
        if (sortedListA[ptrA] === sortedListB[ptrB]) {
            // If values match, add the product of block sizes to totalMatches
            totalMatches += (nextPtrA - ptrA) * (nextPtrB - ptrB);
            // Move both pointers past their respective blocks
            ptrA = nextPtrA;
            ptrB = nextPtrB;
        } else if (sortedListA[ptrA] < sortedListB[ptrB]) {
            // If value in sortedListA is smaller, move ptrA past its block
            ptrA = nextPtrA;
        } else { // sortedListA[ptrA] > sortedListB[ptrB]
            // If value in sortedListB is smaller, move ptrB past its block
            ptrB = nextPtrB;
        }

        // More debugging output for iteration state.
        // outputChannel.printLine({ ptrA, ptrB, nextPtrA, nextPtrB, totalMatches });
    }

    return totalMatches; // Return the final computed count.
}

// This function simulates 'require' for demonstration purposes.
function loadMod(moduleName) {
    if (moduleName === "fileSys") {
        return {
            readText: function(path, encoding) {
                // In a real scenario, this would read from the file system.
                // For this cloning exercise, we're assuming the original uses Node.js 'fs'.
                // The actual content of the input is not part of the cloning.
                // We're just ensuring the structure matches.
                return require("fs").readFileSync(path, encoding);
            }
        };
    }
    return null;
}

// This object simulates 'console' for demonstration purposes.
const outputChannel = {
    printLine: function(message) {
        console.log(message);
    }
};