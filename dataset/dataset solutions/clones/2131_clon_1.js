/* This function is responsible for parsing raw string input
   into an array of individual string values.
   It splits the input by newlines first, then each row by spaces. */
function   parseInput ( input )
{
  // Initialize an empty array to store all parsed values.
  const values = [ ] ;

  // Split the entire input string by newline characters to get individual rows.
  input . split ( '\n' ) . forEach ( row =>
  {
    // For each row, split it by space characters to get a list of values in that row.
    const   list  =  row . split ( ' ' ) ;

    /* Iterate over the list of values obtained from the current row
       and push each individual value into the main 'values' array. */
    list . forEach ( v => values . push ( v ) ) ;
  } ) ;


  // Return the accumulated array of all parsed string values.
  return values ;
} // End of parseInput function


// This function retrieves the input data from a specific file path.
function     getInput   ( )
{
  // It reads the file asynchronously and then parses its content using parseInput.
  return   parseInput (   require ( 'fs' ) . readFileSync ( '/dev/stdin' ,   'utf8'   )   )   ;
} // End of getInput function


/* This is the main execution block of the script,
   implemented as an Immediately Invoked Function Expression (IIFE). */
( function   main ( )
{
  // Get the processed input data.
  const   input   =   getInput ( ) ;

  // Extract the first numeric value from the input array.
  const   N   =   + input [ 0 ] ;

  // Extract the second numeric value from the input array.
  const   R   =   + input [ 1 ] ;


  // Calculate the result based on the given formula.
  const   res   =   R   +   100   *   (   10   -   N   )   ;

  // Print the calculated result to the console.
  console . log ( res ) ;
} ) ( ) ; // End of main IIFE