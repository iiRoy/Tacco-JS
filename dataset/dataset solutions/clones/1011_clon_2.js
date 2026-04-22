const fileData=require('fs').readFileSync('/dev/stdin','utf8').split('\n');
let primaryArray=fileData[1].split(' ');
let secondaryArray=fileData[1].split(' ');
const totalItems=parseInt(fileData[0],10);

function sortWithBubbles(collectionToSort, collectionSize)
{
    // Iterate through the array for multiple passes
    for (let currentPass = 0; currentPass < totalItems; currentPass++)
    {
        // Compare adjacent elements and swap if out of order
        for (let comparisonIdx = totalItems - 1; comparisonIdx > currentPass; comparisonIdx--)
        {
            // Extract numerical value of the first digit for comparison
            const valCurrent = parseInt(collectionToSort[comparisonIdx].match(/\d/)[0],10);
            const valPrevious = parseInt(collectionToSort[comparisonIdx-1].match(/\d/)[0],10);

            if (valCurrent < valPrevious)
            {
                // Perform a swap operation
                let tempSwap=collectionToSort[comparisonIdx];
                collectionToSort[comparisonIdx]=collectionToSort[comparisonIdx-1];
                collectionToSort[comparisonIdx-1]=tempSwap;
            }
        }
    }
}
function sortWithSelection(targetCollection, collectionLength)
{
    // Main loop to select an element for the current position
    for (let outerLoopIndex=0;outerLoopIndex<=collectionLength-1;outerLoopIndex++)
    {
        let minElementPosition=outerLoopIndex; // Assume current element is the smallest

        // Inner loop to find the actual minimum element in the unsorted portion
        for (let innerLoopIndex=outerLoopIndex;innerLoopIndex<=collectionLength-1;innerLoopIndex++)
        {
            // Get the numerical value of the second character for comparison
            const currentItemValue=Number(targetCollection[innerLoopIndex].charAt(1));
            const minItemValue=Number(targetCollection[minElementPosition].charAt(1));

            if (currentItemValue < minItemValue)
            {
                minElementPosition=innerLoopIndex;
            }
        }
        // Swap if the minimum element is not at the current position
        if (Number(targetCollection[outerLoopIndex].charAt(1)) !== Number(targetCollection[minElementPosition].charAt(1)))
        {
            let swapStorage=targetCollection[outerLoopIndex];
            targetCollection[outerLoopIndex]=targetCollection[minElementPosition];
            targetCollection[minElementPosition]=swapStorage;
        }
    }
}

// Execute the first sorting algorithm
sortWithBubbles(primaryArray,totalItems);
console.log(primaryArray.join(' '));
console.log('Stable'); // A comment indicating property of bubble sort

// Execute the second sorting algorithm
sortWithSelection(secondaryArray,totalItems);
console.log(secondaryArray.join(' '));
// Compare the results of both sorts to determine overall stability
console.log((primaryArray.join(' ')===secondaryArray.join(' '))?'Stable':'Not stable');