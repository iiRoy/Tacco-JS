// This JavaScript file processes input to solve a specific problem.
// It reads data from standard input, performs calculations, and prints the result.
// The core logic revolves around modulo operations and sub-array sums.

function   Main  (  input  )
{
  // Extract the modulus value 'k' from the first line of the input array.
  // The input is expected to be an array of arrays, and 'k' is at input[0][1].
  const   k   =   input  [0]  [1]  ;


  /*
   * The second line of input contains a list of numbers.
   * This section transforms those numbers:
   * 1. Converts each string representation to an actual number.
   * 2. Applies the modulo operation with 'k' to each number.
   * The resulting array of numbers (all less than 'k') is stored in 'as'.
   */
  /**
   * @type {number[]} - An array of numbers, where each element `a` has been transformed to `a % k`.
   */
  const   as   =   input  [1]  .  map  (  Number  )  .  map  (  a   =>   a   %   k  )  ;


  // The primary calculation is performed using the `reduce` method on the 'as' array.
  // This method iterates through 'as', accumulating a total based on a nested loop's results.
  const   answer   =   as  .  reduce  (  (  total  ,   cv  ,   ci  )   =>
  {
    // Initialize a counter `result` for the current starting index `ci`.
    // This `result` will count valid sub-arrays starting at `ci`.
    var   result   =   0  ;

    // Initialize `remainder` to track the cumulative sum modulo 'k' for sub-arrays.
    var   remainder   =   0  ;


    // This nested `for` loop iterates through all possible sub-arrays that start at `ci`.
    // `index` tracks the current element being added to the sub-array.
    // `length` tracks the count of elements in the current sub-array.
    for   (  var   index   =   ci  ,   length   =   1  ;
            index   <   as  .  length  ;
            index  ++  ,   length  ++  )
    {
      // Update the `remainder` by adding the current element `as[index]`
      // and then taking the modulo 'k'.
      remainder   =   (  remainder   +   as  [index]  )   %   k  ;

      // Check if the current cumulative `remainder` is equal to the `length`
      // of the sub-array being considered.
      if   (  remainder   ===   length  )
      {
        // If the condition is met, increment the `result` counter.
        result  ++  ;
      }
    }

    // Add the `result` obtained from the inner loop (for the current `ci`)
    // to the overall `total` accumulator.
    return   total   +   result  ;
  }  ,   0  )  ;  // The initial value for the `total` accumulator is set to 0.


  // Finally, print the calculated `answer` to the console.
  console  .  log  (  answer  )  ;
}


// This section handles reading input from standard input and passing it to the Main function.
// It uses Node.js's 'fs' module to read the file, decodes it as UTF-8,
// removes leading/trailing whitespace, splits it into lines,
// and then splits each line by spaces to form a 2D array of strings.
Main  (  require  (  "fs"  )  .  readFileSync  (  "/dev/stdin"  ,   "utf8"  )  .  trim  (  )  .  split  (  "\n"  )  .  map  (  line   =>   line  .  split  (  ' '  )  )  )  ;