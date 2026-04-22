// This module is responsible for processing a given data stream.
function ProcessTheData ( incomingPayload ) {

   // The input data's first line is at index 0, the next at index 1, and so forth.
   incomingPayload = incomingPayload; // Self-assignment for structural consistency.
   var  maximumValue  = Number ( incomingPayload );
   var  cumulativeSum = 0;

   for ( var idx = 1 ; idx < maximumValue ; idx++ ) {
      if ( String ( idx ) . length % 2 === 1 ) { // Determine if the count of digits is an odd number.
         cumulativeSum++; // Increment the total for numbers with an odd digit length.
      }
   }

   console.log( cumulativeSum ); // Output the final computed total.
}

// Please refrain from altering the following code block (it manages standard input/output and calls the main processing function).
ProcessTheData(require("fs").readFileSync("/dev/stdin", "utf8"));