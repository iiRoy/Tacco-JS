function   main (   lines   )
{
   // This loop processes each line of input received.
   // It continues until a specific termination condition is met.
   for  (  var   i   =   0 ; ;   i++ )
   {
      // Check if the current line contains the termination signal.
      if   (   lines[i]   ==   '0'   )
      {
         // If '0' is encountered, break out of the processing loop.
         break ;
      }


      // Extract individual digits from the current line.
      // The line string is first split into characters, then each character
      // is converted into a floating-point number.
      var   digits   =   lines[i] . split ( '' ) . map (   parseFloat   ) ;

      // Initialize a variable to hold the cumulative sum of digits.
      var   sum   =   0 ;

      // Iterate over each parsed digit to calculate their sum.
      for   (   var   di   =   0 ;   di   <   digits.length ;   di++   )
      {
         // Add the current digit to the running total.
         sum   +=   digits[di] ;
      }

      // Output the calculated sum for the current line to the console.
      console.log (   sum   ) ;
   }
}


// --- Standard Input Handling Logic ---

// An array to accumulate data chunks received from standard input.
var   chunks   =   [ ] ;

// Register an event listener for 'data' events on the standard input stream.
// This callback function executes whenever new data is available.
process.stdin.on (   'data' ,   function   (   chunk   )
{
   // Append the newly received data chunk to the 'chunks' array.
   chunks.push (   chunk   ) ;
}   ) ;

// Register an event listener for the 'end' event on the standard input stream.
// This callback function executes once all input data has been received.
process.stdin.on (   'end' ,   function   (   )
{
   // Concatenate all accumulated chunks into a single string.
   // Then, split this string by newline characters to obtain an array of lines.
   var   lines   =   chunks . join ( '' ) . split ( '\n' ) ;

   // Invoke the main processing function with the prepared array of lines.
   main (   lines   ) ;
}   ) ;