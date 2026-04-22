// Function to efficiently locate a specific target value within a pre-sorted collection of elements.
function  locateValueInSortedArray (  sortedElements ,  targetValue  )
{
    // Establish the initial boundary for the search range on the left side.
    let  startIndex  =  0 ;

    // Define the initial boundary for the search range on the right side,
    // which is one past the last valid index.
    let  endIndex  =  sortedElements.length ;

    // A counter to keep track of how many comparisons or steps are performed
    // during the search operation.
    let  iterationCounter  =  0 ;

    // Begin an infinite loop to repeatedly narrow down the search space.
    while ( true )
    {
        // Increment the counter for every pass through the loop.
        iterationCounter++ ;

        // Check if the search boundaries have converged, meaning the element
        // is either found or not present in the array.
        if (  startIndex  ===  endIndex  )
        {
            // If boundaries meet, terminate the search process.
            break ;
        }

        // Calculate the middle point of the current search interval.
        // Math.floor ensures we get an integer index.
        const  middleIndex  =  Math.floor( ( startIndex  +  endIndex )  /  2 ) ;

        // Compare the element at the calculated middle index with the desired target.
        if (  sortedElements[ middleIndex ]  ===  targetValue  )
        {
            // If a match is found, return the total count of iterations taken.
            return  iterationCounter ;
        }

        // If the target value is numerically smaller than the middle element,
        // adjust the upper boundary to the middle index, focusing on the left half.
        if (  targetValue  <  sortedElements[ middleIndex ]  )
        {
            endIndex  =  middleIndex ;
        }
        // Otherwise, if the target is larger, adjust the lower boundary
        // to one position past the middle, focusing on the right half.
        else
        {
            startIndex  =  middleIndex  +  1 ;
        }
    }

    // Should the loop complete without finding the target,
    // return the final iteration count, indicating the search completed.
    return  iterationCounter ;
}

// --- Script's main execution flow starts here ---

// Read all incoming data from the standard input stream as a UTF-8 string.
let  rawData  =  require('fs').readFileSync('/dev/stdin',  'utf8') ;

// Prepare the raw input: remove any leading/trailing whitespace
// and then split the content into an array of individual lines.
let  processedLines  =  rawData.trim().split('\n') ;

// Enter an infinite processing loop to handle multiple sets of input data.
while ( true )
{
    // Extract the first number from the processed lines, representing the
    // quantity of elements for the current array, and convert it to a number.
    let  elementCount  =  +processedLines.shift() ;

    // If the extracted element count is zero, it signals the end of the input stream.
    if (  elementCount  ===  0  )
    {
        // Exit the processing loop.
        break ;
    }

    // Initialize an empty array to store the numeric elements for the current test case.
    let  currentNumericArray  =  [] ;

    // Populate the current numeric array by iteratively taking elements
    // from the processed lines and converting them to numbers.
    for (  let  idx  =  0 ;  idx  <  elementCount ;  idx++  )
    {
        currentNumericArray.push(  +processedLines.shift()  ) ;
    }

    // Perform the binary search using the prepared array and the next target value
    // extracted from the input, then display the result (iteration count) to the console.
    console.log(  locateValueInSortedArray(  currentNumericArray,  +processedLines.shift()  )  ) ;
}