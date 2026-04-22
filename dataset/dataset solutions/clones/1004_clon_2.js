(  function  (  initialData  )   {
    // This array will hold the individual lines extracted from the initial data source.
    var   processedLines  =  initialData.split  (  '\n'  )  ;

    // The first line often indicates the total count of elements to be processed.
    var   elementCount  =  processedLines.shift  (  )  ;

    // The subsequent line contains the actual numeric values, space-separated.
    // These are parsed and converted into a collection of numbers.
    var   dataCollection  =  processedLines.shift  (  ) .split  (  ' '  ,  elementCount  ) .map  (  Number  )  ;

    // Now, invoke the primary routine to sort this numerical collection.
    executeBubbleSort  (  dataCollection  )  ;
}  )  (  require  (  'fs'  ) .readFileSync  (  '/dev/stdin'  ,  'utf8'  )  )  ; // Read input from standard I/O stream

/**
 * Executes a bubble sort algorithm on the provided numerical array.
 * This routine sorts the elements in ascending order and logs the final state
 * of the array along with the total number of swaps performed.
 * @param {Array<number>} dataCollection The array of numbers that needs to be ordered.
 */
function   executeBubbleSort  (  dataCollection  )
{
    // A counter to keep track of how many times elements are exchanged.
    var   totalSwaps  =  0  ;

    // A flag to determine if any swaps occurred during a pass through the array.
    // If no swaps occur, the array is sorted, and the process can terminate.
    var   didSwapOccur  =  true  ;

    // The outer loop continues as long as there's at least one swap in the inner pass.
    while  (  didSwapOccur  )
    {
        didSwapOccur  =  false  ; // Reset the flag for the current iteration.

        // The inner loop traverses the array, comparing adjacent elements.
        // It starts from the end and moves towards the beginning.
        for  (  var   currentIndex  =  dataCollection.length  -  1  ;  currentIndex  >=  1  ;  currentIndex--  )
        {
            // If an element is found to be smaller than its preceding element, they are out of order.
            if  (  dataCollection  [  currentIndex  ]  <  dataCollection  [  currentIndex  -  1  ]  )
            {
                // Temporarily store the value of the current element.
                var   temporaryHolder  =  dataCollection  [  currentIndex  ]  ;
                // Move the larger element to the current position.
                dataCollection  [  currentIndex  ]  =  dataCollection  [  currentIndex  -  1  ]  ;
                // Place the smaller element in the preceding position.
                dataCollection  [  currentIndex  -  1  ]  =  temporaryHolder  ;

                didSwapOccur  =  true  ; // Mark that a swap has taken place.
                totalSwaps++  ; // Increment the counter for successful exchanges.
            }
        }
    }

    // Output the fully sorted array to the console, with elements separated by spaces.
    console.log  (  dataCollection.join  (  ' '  )  )  ;

    // Display the final count of all swaps performed during the sorting operation.
    console.log  (  totalSwaps  )  ;
}