/*
 * This file contains the main logic for processing input data.
 * It strictly adheres to modern JavaScript practices.
 */
'use strict'

// Define the primary function that processes the input.
function   main ( input   )   {

  // First, clean up the raw input string.
  // Remove leading/trailing whitespace and split into lines.
  input   =   input . trim ( ) . split ( '\n' ) ;

  // Extract the first element as a number 'N'.
  // This value 'N' is consumed from the input array.
  const   N   =   Number ( input . shift ( ) ) ;


  /*
   * Process the remaining input lines.
   * Each line is transformed, sorted, and then simplified.
   */
  input   =   input . map ( ( val , i )   =>   [   i + 1 ,   ... val . split ( ' ' )   ] )
    . sort ( ( a ,   b )   =>   {
                                  // Compare elements based on specified criteria.
                                  // Primary sort key: a[1] (string comparison).
                                  // Secondary sort key: a[2] (numeric, descending).
                                  if   (   a [ 1 ]   ===   b [ 1 ]   )   {
                                    // If the primary keys are identical,
                                    // sort by the secondary key in descending order.
                                    return   Number ( b [ 2 ]   -   a [ 2 ] ) ;
                                  }   else   if   (   a [ 1 ]   <   b [ 1 ]   )   {
                                    // If a[1] comes before b[1] lexicographically.
                                    return   -1   ;
                                  }

                                  /*
                                   * This condition handles the case where a[1] > b[1].
                                   * It implies a[1] comes after b[1] lexicographically.
                                   */
                                  if   (   a [ 1 ]   >   b [ 1 ]   )   {
                                    return   1   ;
                                  }
                                } )
    // After sorting, extract only the original index (the first element of each array).
    . map ( arr   =>   arr [ 0 ] ) ;

  // Output the final processed data, joined by newlines.
  console . log ( input . join ( '\n' ) ) ;
}

// Entry point: Read input from standard input and pass it to the main function.
main (   require ( 'fs' ) . readFileSync ( '/dev/stdin' ,   'utf8' )   ) ;