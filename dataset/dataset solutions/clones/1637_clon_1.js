/*
 * This JavaScript program processes input to perform specific calculations.
 * It reads data representing a collection of 'balls' and then executes a series of queries.
 * Each query involves finding the number of unique elements within a given range of the 'balls' collection.
 */
const main = (  stdin  ) =>   { // The main function receives the standard input as a string.
  // First, we split the entire input string by newline characters.
  // This creates an array where each element is a line from the input.
  const input = stdin.split ( "\n" ) ;

  // The very first line of input (input[0]) contains two space-separated numbers:
  // 'n' (which might represent the total number of items, though not directly used in the current logic)
  // and 'q' (the number of queries that follow).
  // We parse these string numbers into actual numerical values.
  const [ n , q ] = input [ 0 ] . split ( ' ' ) . map ( x => Number ( x ) ) ;
  
  // The second line of input (input[1]) contains the 'balls' data.
  // These are assumed to be space-separated values, which we store as strings in an array.
  const   balls   =   input [ 1 ] . split ( ' ' ) ;
  
  // A blank line for visual separation and readability within the code.

  // We now iterate through each query. Queries start from the third line of input (index 2)
  // and continue for 'q' number of times. So, the loop runs from index 2 up to 'q + 2' (exclusive).
  for ( let i = 2 ; i < q + 2 ; i ++ )   {
    // For each query line (input[i]), it contains two space-separated numbers:
    // 's' (the start index for the range, typically 1-based)
    // and 'e' (the end index for the range, typically 1-based).
    // These are parsed from string to number.
    const [ s , e ] = input [ i ] . split ( ' ' ) . map ( x => Number ( x ) ) ;
    
    // This is the core logic for processing each query:
    // 1. `balls.slice(s - 1, e)`: Extracts a sub-array from the 'balls' array.
    //    We use `s - 1` because array indexing in JavaScript is 0-based, while problem statements
    //    often use 1-based indexing. The `e` remains as is because `slice` extracts up to, but not including, the end index.
    // 2. `.filter((elm, index, self) => self.indexOf(elm) === index)`: This filters the sliced sub-array
    //    to obtain only unique elements. It works by checking if the current element's first occurrence
    //    within the sub-array is at its current `index`. If `indexOf` returns a different index,
    //    it means the element has appeared before, and thus it's a duplicate.
    // 3. `.length`: Finally, we get the total count of the unique elements found in the filtered sub-array.
    // 4. `console.log(...)`: The calculated unique count for the current query is then printed to the standard output.
    console . log ( balls . slice ( s - 1 , e ) . filter ( ( elm , index , self ) => self . indexOf ( elm ) === index ) . length ) ;
  }
  /*
   * End of the main function's execution block.
   * All queries have been processed and their results logged.
   */
}

// This line executes the `main` function.
// It reads the content of '/dev/stdin' (standard input) synchronously using Node.js's 'fs' module.
// The content is read as 'utf8' encoded text and passed as the `stdin` argument to the `main` function.
main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;