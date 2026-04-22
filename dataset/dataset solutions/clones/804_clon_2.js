/* This JavaScript module processes incoming data to calculate specific values.
 * It reads from standard input, parses numerical sequences, and performs
 * weighted sum calculations with conditional logic.
 */
function ProcessData(rawData)
{
    // Split the entire input string into an array of individual lines.
    let lineRecords = rawData.split('\n') ;
    let recordPointer = 0 ; // Initialize a pointer to track the current line being processed.

    // Begin an infinite loop to process data sets until a specific termination condition is met.
    while (true)
    {
        // For the current line indicated by recordPointer, split it by spaces
        // to get individual components for the current data set.
        lineRecords[recordPointer] = lineRecords[recordPointer].split(' ');

        // Parse the first three numbers from the current line.
        // These represent key parameters for the current calculation block.
        const numItems = parseInt(lineRecords[recordPointer][0], 10);
        const targetIndex = parseInt(lineRecords[recordPointer][1], 10);
        const discountPercentage = parseInt(lineRecords[recordPointer++][2], 10); // Increment pointer after use.

        // Check for the termination condition: all three parameters are zero.
        if ( numItems === 0 && targetIndex === 0 && discountPercentage === 0 )
        {
            break; // Exit the processing loop.
        }

        // Initialize variables for the inner processing phase.
        let accumulatedValue = 0; // Stores the running total.
        let markedValue ; // Will store the value at the target index.

        // Loop through 'numItems' subsequent lines to read individual data points.
        for ( let itemCounter = 0; itemCounter < numItems; itemCounter++ )
        {
            // Parse the next number from the input, which is on its own line.
            // Increment the recordPointer to move to the next data line.
            const currentEntry = parseInt(lineRecords[recordPointer++], 10);

            // Each entry contributes 100 times its value to the accumulated total.
            accumulatedValue += currentEntry * 100;

            // If the current itemCounter matches the target index (adjusted for zero-based indexing),
            // store this 'currentEntry' as the 'markedValue'.
            if ( targetIndex - 1 === itemCounter )
            {
                markedValue = currentEntry;
            }
        }

        // Apply the percentage discount to the accumulated value.
        // The formula is: total * (100 - discount) / 100
        accumulatedValue = accumulatedValue * (100 - discountPercentage) / 100;

        // Determine the final output based on the 'markedValue'.
        if ( markedValue > 0 )
        {
            // If markedValue is positive, calculate and print the floor of the division.
            console.log(Math.floor(accumulatedValue / markedValue)) ;
        }
        else
        {
            // If markedValue is zero or negative, print "0".
            console.log("0");
        }
    }
}

// Invoke the main processing function by reading content from standard input.
ProcessData(require("fs").readFileSync("/dev/stdin", "utf8")) ;