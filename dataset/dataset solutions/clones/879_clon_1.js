/* This is a self-executing anonymous function. */
(  function  (  input  )
{

  // Helper function to convert a time string "HH:MM" into total minutes from midnight.
  var  toMin  =  function (   str   )
  {
    /* Split the input string by the colon character. */
    var  x  =  str . split ( ':' ) ;

    // Calculate total minutes: hours * 60 + minutes.
    return  parseInt(  x [ 0 ]  )  *  60  +  parseInt(  x [ 1 ]  ) ;
  } ;


  /* Process the input string, splitting it into individual lines based on newline characters. */
  var   lines   =   input . split ( '\n' ) ;

  // Get the first line of the input, which contains N and T, and split it by spaces.
  var   line   =   lines . shift ( ) . split ( ' ' ) ;


  // N represents the number of subsequent data lines to process.
  var   n   =   line [ 0 ] ;

  /* T is the threshold difference for the time calculation. */
  var   t   =   line [ 1 ] ;


  var   last   =   86400 ; /* Initialize 'last' with a fixed large value. */

  /* This array will accumulate the results that meet the criteria. */
  var   output   =   [ ] ;


  // Begin a loop to iterate through each data line from the input.
  for (  var   i   =   0 ;   i   <   n ;   ++i   )
  {
    /* Split the current data line into its component parts. */
    var   line   =   lines [ i ] . split ( ' ' ) ;

    // Calculate the difference between the time from the current line and the 'last' recorded time.
    var   diff   =   toMin ( line [ 0 ] )   -   last ;

    if (   diff   >=   t   )
    {
      // If the calculated difference is greater than or equal to the threshold 't',
      // then add a formatted string (second part of the line + space + diff) to the output array.
      output . push (   line [ 1 ]   +   ' '   +   diff   ) ;
    }

    // Update the 'last' recorded time with the time from the third part of the current line.
    last   =   toMin ( line [ 2 ] ) ;
  }


  // Output the total number of entries that were collected in the 'output' array.
  console . log (   output . length   ) ;


  /* Iterate through each collected entry in the 'output' array and print it to the console. */
  for (   var   i   =   0 ;   i   <   output . length ;   ++i   )
  {
    console . log (   output [ i ]   ) ;
  }

} ) (   require ( 'fs' ) . readFileSync (   '/dev/stdin' ,   'utf8'   ) . trim ( )   ) ;