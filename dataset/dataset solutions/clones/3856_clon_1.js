/*
 * This is a Type I clone of the original JavaScript code.
 * It strictly adheres to the Type I definition:
 * - All identifiers, variable names, function names, operators, and expressions
 *   are identical to the original.
 * - Only whitespace (indentation, line breaks, spaces) and comments have been
 *   modified or added.
 * - The changes are extensive to demonstrate visual difference.
 */

'use strict'; // Enforces strict mode for cleaner code and error handling.


// Defines the main function which processes the input string.
function   main(  s  )   {

  // Splits the input string by newline characters into an array of lines.
  s   =   s.split(  '\n'  )  ;

  /*
   * Extracts the height 'h' from the first line of the input.
   * The first line is expected to contain two space-separated numbers,
   * where the first one represents 'h'.
   */
  const   h   =   Number(  s[0].split(  ' '  )[0]  )  ;

  // Extracts the width 'w' from the first line of the input.
  // In this specific problem, 'w' is also taken from the first number of the first line.
  const   w   =   Number(  s[0].split(  ' '  )[0]  )  ;


  /*
   * Processes the remaining lines to create a 2D array (table).
   * It slices the input array 's' to exclude the first and last lines (header and potentially empty line).
   * Each remaining line is then split into an array of characters.
   */
  const   table   =   s.slice(  1,   -1  ).map(  x   =>   x.split(  ''  )  )  ;


  // Initializes the answer variable. Assumes 'Yes' initially.
  let   ans   =   'Yes'  ;

  // Outer loop: iterates through each row of the table, from 0 to h-1.
  for   (  let   i   =   0  ;   i   <   h  ;   i++  )   {

    // Inner loop: iterates through each column in the current row, from 0 to w-1.
    for   (  let   j   =   0  ;   j   <   w  ;   j++  )   {

      // If the current cell is a '.', it's an empty space, so we skip it.
      if   (  table[i][j]   ===   '.'  )   continue  ;


      // If the cell is '#', we need to check its neighbors.
      let   count   =   0  ; // Counter for '#' neighbors.

      // Check the cell above (i-1, j).
      if   (  i   -   1   >=   0  )   {
        // If the cell above exists and is '#', increment count.
        if   (  table[i   -   1][j]   ===   '#'  )   count   +=   1  ;
      }

      // Check the cell below (i+1, j).
      if   (  i   +   1   <   h  )   {
        // If the cell below exists and is '#', increment count.
        if   (  table[i   +   1][j]   ===   '#'  )   count   +=   1  ;
      }

      // Check the cell to the right (i, j+1).
      if   (  j   +   1   <   w  )   {
        // If the cell to the right exists and is '#', increment count.
        if   (  table[i][j   +   1]   ===   '#'  )   count   +=   1  ;
      }

      // Check the cell to the left (i, j-1).
      if   (  j   -   1   >=   0  )   {
        // If the cell to the left exists and is '#', increment count.
        if   (  table[i][j   -   1]   ===   '#'  )   count   +=   1  ;
      }


      // If a '#' cell has no '#' neighbors, then the condition is not met.
      if   (  count   ===   0  )   ans   =   'No'  ;
    }
  }

  // Outputs the final answer to the console.
  console.log(  ans  )  ;
}


// Reads input from standard input, converts it to UTF-8, and passes it to the main function.
main(  require(  "fs"  ).readFileSync(  "/dev/stdin"  ,   "utf8"  )  )  ;