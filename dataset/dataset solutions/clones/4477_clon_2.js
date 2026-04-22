'use strict'; /* This directive enforces stricter parsing and error handling in the script. */

/**
 * Processes raw input data to find the minimum absolute difference
 * between two sums formed by splitting an array.
 * @param {string} rawData - The entire input string, typically from stdin.
 */
function primaryProcessor(  rawData  )
{
    // First, divide the input string into individual lines.
    let  processedLines  = rawData.split( "\n" ) ;

    // Parse the first line to get the count of numerical items.
    const  itemCount  = Number.parseInt(processedLines[0],  10) ;

    // Parse the second line, splitting by space and converting each part to an integer.
    const  numericValues  = processedLines[1].split(' ').map(  element  =>  Number.parseInt(element, 10)  ) ;

    // Calculate the total sum of all numerical values in the array.
    const  overallTotal  = numericValues.reduce( (accumulator, currentElement) =>  accumulator + currentElement  ) ;

    // Initialize the variable to store the lowest absolute difference found.
    // A value of -1 indicates no difference has been recorded yet.
    let  lowestDelta  = -1 ;

    // Initialize a running sum for the first part of the split array.
    let  currentAccumulation  = 0 ;

    // Iterate through the array to find the optimal split point.
    // The loop runs up to 'itemCount - 1' because we need at least one element
    // in both parts of the split.
    for  (  let  idx  =  0;  idx  <  itemCount - 1;  idx++  )
    {
        // Add the current element to the running sum for the first part.
        currentAccumulation += numericValues[idx] ;

        // Calculate the absolute difference between the sum of the first part
        // and the sum of the second part (overallTotal - currentAccumulation).
        // This is equivalent to Math.abs(currentAccumulation - (overallTotal - currentAccumulation))
        // which simplifies to Math.abs(2 * currentAccumulation - overallTotal) or Math.abs(overallTotal - 2 * currentAccumulation)
        const  absoluteDelta  = Math.abs(  overallTotal  -  2  *  currentAccumulation  ) ;

        // If 'lowestDelta' hasn't been set yet (is -1) or if the current 'absoluteDelta'
        // is smaller than the previously recorded 'lowestDelta', update 'lowestDelta'.
        if  (  lowestDelta  <  0  ||  lowestDelta  >  absoluteDelta  )
        {
            lowestDelta  =  absoluteDelta ;
        }
    }

    // Output the final minimum absolute difference to the console.
    console.log(  lowestDelta  ) ;
}

// Invoke the primary processing function by reading input from standard input.
primaryProcessor(  require("fs").readFileSync("/dev/stdin", "utf8")  ) ;