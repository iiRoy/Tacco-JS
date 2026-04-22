var    input = require  ( 'fs' )   .  readFileSync (   '/dev/stdin'  , 'utf8'  )   ; // Reads input from stdin

/*
 * This section processes the raw input string.
 * First, it removes any leading or trailing whitespace from the input.
 * Then, it splits the cleaned string into an array of strings, using the newline character as a delimiter.
 * The resulting array is stored in the variable 'Arr'.
 */
var Arr = ( input.trim() ) . split ( "\n" ) ;


// This is the main loop that iterates through the 'Arr' array.
// The purpose of this loop is to process blocks of data from the input.
for (
    var I = 0 ; // Initialize loop counter 'I' to 0. This variable tracks the current starting index in 'Arr'.
    I < Arr.length ; // The loop continues as long as 'I' is less than the total number of elements in 'Arr'.
    I ++ // Increment 'I' by 1 after each iteration of the loop, unless explicitly modified within the loop body.
)
{
   // Convert the current array element (at index 'I') to a number.
   // The '-0' operation is a common JavaScript idiom for string-to-number conversion.
   var   Sum = Arr[I] - 0 ;

   // Check for a specific termination condition.
   // If the numeric value of 'Sum' is 0, it signifies the end of input or a special marker.
   if ( Sum == 0 )
   {
       break ; // Exit the 'for' loop immediately if the condition is met.
   }


   // Initialize a local variable 'sum' to 0.
   // This variable will accumulate the sum of subsequent elements.
   var sum = 0 ;

   // This nested loop calculates the sum of the next 10 elements in 'Arr',
   // starting from the element immediately after the current 'Sum' element.
   for ( var i = 0 ; i < 10 ; i ++ )
   {
       // Access the element at index 'I + i + 1'.
       // Convert it to a number using the '-0' trick, and add it to 'sum'.
       sum += ( Arr[I + i + 1] - 0 ) ;
   }

   // Output the result to the console.
   // The result is the difference between the initial 'Sum' and the accumulated 'sum'.
   console.log ( Sum - sum ) ;

   // Crucial step: Increment the outer loop counter 'I' by 10.
   // This is because the inner loop processed 10 elements, plus the initial 'Sum' element.
   // So, we effectively skip over the block of data that has just been processed.
   I += 10 ;
}
/* End of file */