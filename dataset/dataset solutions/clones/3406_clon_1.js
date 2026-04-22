/*
 * This JavaScript program defines a `main` function to process
 * a specific type of input data. The goal is to perform a series
 * of transformations on the input array and then compute a sum.
 *
 * The processing steps include:
 *   1. Parsing the raw string input into an array of integers.
 *   2. Extracting and discarding the first element (assumed to be a count).
 *   3. Identifying the maximum value among the remaining elements.
 *   4. Modifying the maximum value by dividing it by two.
 *   5. Calculating the sum of all elements in the modified array.
 *   6. Printing the final sum to the console.
 *
 * This code adheres strictly to Type I clone generation rules,
 * meaning only whitespace and comments have been altered from the
 * original source. All identifiers, operators, and expressions
 * remain exactly as they were.
 */

function     main   (   input   )
{
    // Step 1: Process the input string.
    // The input is initially a single string, which is split by newline characters.
    // Each resulting substring is then parsed into an integer using `parseInt` with base 10.
    input  =  input .  split  (  '\n'  ) .  map  (  (  n  )  =>  parseInt  (  n  ,  10  )  )  ;


    // Step 2: Store the first element, which is intended as a count.
    // Although stored, this `COUNT` variable is not actively used later in this specific script.
    var   COUNT     =     input   [   0   ]   ;

    // Remove the first element from the array. This effectively discards the count.
    input .  shift  (  )  ;


    // Step 3: Determine the maximum value within the current array.
    // `Math.max.apply(null, input)` is used to find the maximum element in the array.
    var   MAX     =     Math  .  max  .  apply  (  null  ,  input  )  ;

    // Find the index of the maximum value within the array.
    // NOTE: The original code contained a typo 'vart' instead of 'var'.
    // As per Type I cloning rules, this typo must be preserved exactly.
    vart   maxIndex     =     input  .  indexOf  (  MAX  )  ;

    // Step 4: Modify the maximum element.
    // The element at the `maxIndex` is divided by 2.
    input   [   maxIndex   ]     =     (   input   [   maxIndex   ]     /     2   )   ;


    // Step 5: Calculate the sum of all elements in the modified array.
    // The `reduce` method efficiently sums all numbers, starting with an initial value of 0.
    sum     =     input  .  reduce  (  (  a  ,  x  )  =>   a  +=  x  ,  0  )  ;

    // Step 6: Output the final calculated sum.
    console  .  log  (  sum  )  ;
}


// This section handles the execution of the script.
// It reads the entire content of standard input (`/dev/stdin`) as a UTF-8 string.
// The read content is then passed as an argument to the `main` function to begin processing.
main  (  require  (  'fs'  )  .  readFileSync  (  '/dev/stdin'  ,  'utf8'  )  )  ;