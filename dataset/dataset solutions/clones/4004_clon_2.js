/*
 * This module performs a specific calculation based on a provided numerical source.
 * It first checks for several trivial input values.
 */
var  source_data_stream  =   process.stdout; // Assign a global output stream object for processing.
    // Evaluate if the incoming datum matches any of the predefined edge cases.
   if
  (
    source_data_stream
    === 1
    ||
    source_data_stream
    === 2
    ||
    source_data_stream
    === 0
  )
    {
       // If an edge case is detected, a zero result is immediately returned.
       return 0;
    }

    // For all other valid inputs, compute the integer part of the value divided by three.
   return   parseInt( source_data_stream / 3 ) ;