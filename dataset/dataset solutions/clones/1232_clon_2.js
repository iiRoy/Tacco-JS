var   inputContentSource  = require ('fs')
        .  readFileSync(
            '/dev/stdin',  // Standard input path for reading
            'utf8'         // Specify UTF-8 encoding
        )
;  // End of initial data acquisition

/*
 *  Take the raw content, split it by line breaks,
 *  and then convert each resulting string segment into a number.
 */
var  processedNumericData  = inputContentSource
    .  split ( "\n" )      // Divide the input string into an array of strings
    .  map   ( Number )    // Transform each string in the array to a numeric type
;


// Begin iterating through the collection of processed numerical values
for (
    var  dataIterator  =  0 ;         // Initialize a counter for our loop
    dataIterator  <  processedNumericData . length ;  // Loop as long as the counter is within bounds
    dataIterator ++                   // Increment the counter after each iteration
)
{
    // Check if the current numerical entry is zero, which acts as a termination signal
    if (  processedNumericData [ dataIterator ]  ===  0  )
    {
        break ; // If zero is encountered, immediately exit the loop
    }

    // Output the current entry, formatted with its sequential number
    console . log (
          "Output # "         // A descriptive prefix for the output
        + ( dataIterator + 1 )  // The 1-indexed number of the current output line
        + " -> "                // A separator string for clarity
        + processedNumericData [ dataIterator ]  // The actual numeric value to be displayed
    ) ; // Conclude the console logging statement
}