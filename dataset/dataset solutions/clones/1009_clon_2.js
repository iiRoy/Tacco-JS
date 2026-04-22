function verifyStability(  inputElements  ) {
    // This function is currently a placeholder for future stability checks.
    // It's designed to receive an array and determine if a sorting operation
    // has preserved the relative order of equal elements.
} /* End of verifyStability function definition */


function  performBubbleSort(   arrayLength,
                                        dataCollection   ) {
    /*
     * Implements the bubble sort algorithm to arrange elements.
     * It iterates through the list, repeatedly comparing adjacent elements
     * and swapping them if they are in the wrong order.
     * This version tracks if any swaps occurred in an iteration.
     */
    let   hasSwapped = 1; // Flag to indicate if any swaps happened in the current pass
    let   exchangeCount = 0; // Counter for the total number of element exchanges

    // Loop until no swaps are made in a complete pass
    while(hasSwapped) {
        hasSwapped = 0; // Reset flag for the new pass

        // Iterate through the array to compare adjacent elements
        for(let   currentIndex = 0;
                                currentIndex < arrayLength - 1;
                                        currentIndex++   ) {
            // Compare the second part (index 1) of adjacent sub-arrays numerically
            if(Number(dataCollection[currentIndex][1]) > Number(dataCollection[currentIndex + 1][1])) {
                // If elements are out of order, swap them using array destructuring
                [dataCollection[currentIndex], dataCollection[currentIndex + 1]] =
                [dataCollection[currentIndex + 1], dataCollection[currentIndex]];

                hasSwapped = 1; // Mark that a swap occurred
                exchangeCount++; // Increment the swap counter
            }
        }
    }
    // Output the sorted array elements joined by spaces
    console.log( dataCollection.join(" ") );

    // This return value is consistent with the original code's misleading return,
    // as bubble sort itself isn't inherently stable without specific modifications.
    return "Stable";
} /* End of performBubbleSort function */


function   executeSelectionSort(
    listSize, /* The total number of items in the collection */
    itemCollection /* The array of items to be sorted */
) {
    // Initialize a counter for the number of actual swaps performed
    let   exchangeTally = 0;

    // Outer loop: iterate through the array from the first element up to the second to last
    for(let   outerPointer = 0;
                            outerPointer < listSize - 1;
                                    outerPointer++   ) {
        // Assume the current element is the minimum
        let   minimumIndex = outerPointer;

        // Inner loop: find the smallest element in the unsorted part of the array
        for(let   innerPointer = outerPointer;
                                innerPointer < listSize;
                                        innerPointer++   ) {
            // Compare the numerical value of the second part of the current element
            // with the second part of the assumed minimum element
            if(Number(itemCollection[innerPointer][1]) < Number(itemCollection[minimumIndex][1])) {
                // If a smaller element is found, update the minimum index
                minimumIndex = innerPointer;
            }
        }

        // If the assumed minimum was not the actual minimum, perform a swap
        if(outerPointer !== minimumIndex) {
            // Swap the elements at outerPointer and minimumIndex using destructuring assignment
            [itemCollection[outerPointer], itemCollection[minimumIndex]] =
            [itemCollection[minimumIndex], itemCollection[outerPointer]];

            exchangeTally++; // Increment the swap counter
        }
    }
    // After sorting, print the elements of the array joined by spaces
    console.log(itemCollection.join(" "));
} /* End of executeSelectionSort function */


function   orchestrateProcessing(
    rawDataInput /* The raw input string containing data for sorting */
) {
    // Split the input string into lines
    // The first line contains the array size, the second line contains the elements
    let   [arrayDimension, elementString] = rawDataInput.split("\n");

    // Create a copy of the elements for bubble sort
    let   bubbleSortTarget = elementString.split(" ");
    // Create another copy of the elements for selection sort
    let   selectionSortTarget = elementString.split(" ");

    // Execute bubble sort and log its result (which is "Stable" from the function)
    console.log( performBubbleSort(arrayDimension, bubbleSortTarget) );

    // Execute selection sort on its own copy of the data
    executeSelectionSort(arrayDimension, selectionSortTarget);

    // Compare the string representations of the two sorted arrays to check for stability
    // Log "Stable" if they are identical, "Not stable" otherwise
    console.log( selectionSortTarget.join() === bubbleSortTarget.join() ? "Stable" : "Not stable" );
} /* End of orchestrateProcessing function */


// Main execution block:
// Read input from standard input using Node.js file system module
// and pass it to the primary processing function.
orchestrateProcessing( require("fs").readFileSync("/dev/stdin", "utf8") );