const solve = (  data  ,  H  ,  W  ,  K  ,  debug  =  0  )  =>
{
  // This function calculates the number of ways to select rows and columns
  // such that exactly K black cells remain.

  const _ = ( i , j ) => i * W + j ; // A helper to map 2D coordinates to a 1D array index.

  let result = 0 ; // This variable will store the final count of valid configurations.


  // The problem involves iterating through all possible combinations of rows and columns.
  // We use bitmasks to represent selections.
  // There are 2^H possible ways to select rows.
  for ( let rows = 0 ; rows < ( 2 ** H ) ; rows ++ )
  {

    // For each row selection, we then consider all 2^W possible column selections.
    for ( let cols = 0 ; cols < ( 2 ** W ) ; cols ++ )
    {

      let count = 0 ; // Initialize a counter for black cells that "survive" this selection.

      // Iterate through every cell in the H x W grid.
      for ( let i = 0 ; i < H ; i ++ )
      {
        for ( let j = 0 ; j < W ; j ++ )
        {
          // Check three conditions for a cell to be counted:
          // 1. Is the original cell (i, j) black? (data[_(i, j)] is true)
          // 2. Is row 'i' selected in the current 'rows' bitmask? ((1 << i) & rows)
          // 3. Is column 'j' selected in the current 'cols' bitmask? ((1 << j) & cols)
          if ( data [ _ ( i , j ) ] && ( ( 1 << i ) & rows ) && ( ( 1 << j ) & cols ) )
          {
            count ++ ; // If all conditions are true, increment the counter.
          }
        }
      }

      // After checking all cells for the current (rows, cols) combination,
      // if the count of surviving black cells equals K, then it's a valid configuration.
      if ( count === K )
      {
        result ++ ; // Increment the total number of valid results.
      }
    }
  }

  return result ; // Return the final tally.

} ; // End of the solve function definition.


const main = async ( istr , ostr ) =>
{
  // This is the main asynchronous function that handles input/output and orchestrates the solution.

  const readline = require ( 'readline' ) ; // Load the 'readline' module for line-by-line input.

  // Create an asynchronous iterator for reading lines from the input stream.
  const it = readline . createInterface ( { input : istr } ) [ Symbol . asyncIterator ] ( ) ;

  // Helper function to asynchronously get the next line of input.
  const getLine = async ( ) => ( await it . next ( ) ) . value ;

  // Helper function to get a line and split it into an array of strings.
  const getMany = async ( ) => ( await getLine ( ) ) . split ( ' ' ) ;

  // Read the first line of input, which contains H, W, and K, and parse them as numbers.
  const [ H , W , K ] = ( await getMany ( ) ) . map ( Number ) ;

  // Initialize a Uint8Array to store the grid data.
  // This is an efficient way to store boolean (0/1) values.
  const data = new Uint8Array ( H * W ) ;

  // Define a local helper function for 2D to 1D indexing, similar to the one in `solve`.
  const _ = ( i , j ) => i * W + j ;

  // Loop through each row of the grid to read the input data.
  for ( let i = 0 ; i < H ; i ++ )
  {
    const line = await getLine ( ) ; // Read the current row as a string.

    // Iterate through each character in the row string.
    for ( let j = 0 ; j < W ; j ++ )
    {
      // If the character is '#', store 1 (true) in the data array; otherwise, store 0 (false).
      data [ _ ( i , j ) ] = line [ j ] === '#' ;
    }
  }

  // Call the 'solve' function with the parsed data and parameters to get the result.
  const result = solve ( data , H , W , K ) ;

  // Write the calculated result to the output stream, followed by a newline character.
  ostr . write ( ` ${ result } \n ` ) ;

} ; // End of the main function definition.


// This conditional block ensures that the 'main' function is executed
// only when the script is run directly (not when it's imported as a module).
if ( require . main === module )
{
  main ( process . stdin , process . stdout ) ; // Run the main function, using standard input and output streams.
}