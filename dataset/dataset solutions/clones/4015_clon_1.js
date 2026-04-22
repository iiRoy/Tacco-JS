console . log ( ( args => { // Begin IIFE to process input and output result

  // Parse input arguments.
  // The first line contains H, W, D (Height, Width, Step/Distance).
  // Subsequent lines form the grid and then queries.
  const   [
    [H, W, D], // Destructuring the first line into H, W, D.
    ...tmp     // The rest of the lines are collected into 'tmp' array.
  ]   =   args
    .  trim  (  )  // Remove any leading or trailing whitespace from the entire input string.
    .  split  `\n`  // Split the trimmed input string into an array of lines using newline as delimiter.
    .  map  (  r  =>  r  .  split  ` `  .  map  (  v  =>  v  |  0  )  )  ; // For each line, split by space and convert each part to an integer (using bitwise OR 0).

  // Initialize an array 'p' to store the coordinates [row, column] for each number in the grid.
  // The size is H*W + 1 because numbers can range from 1 to H*W.
  // Using fill([]) here is safe because each element will be immediately overwritten with a new array.
  const   p   =   Array  (  H  *  W  +  1  )  .  fill  (  [  ]  )  ;


  // Populate the 'p' array with the coordinates of each number.
  // Iterate through the rows of the grid.
  for (   let   i   =   0  ;   i   <   H  ;   i  ++   )   {

    // Iterate through the columns of the grid.
    for (   let   j   =   0  ;   j   <   W  ;   j  ++   )   {
      // The value at grid position (i, j) is tmp[i][j].
      // Store its coordinates [i, j] in the 'p' array at the index corresponding to its value.
      p   [   tmp  [  i  ]  [  j  ]   ]   =   [  i  ,  j  ]  ;
    }
  }


  // Initialize an array 's' to store the accumulated "magic power" costs.
  // s[k] will store the total cost to reach number 'k' from the start of its D-sequence.
  // The size is H*W + 1, and all elements are initialized to 0.
  const   s   =   Array  (  H  *  W  +  1  )  .  fill  (  0  )  ;


  // Calculate prefix sums of "magic power" costs for all possible sequences.
  // 'i' represents the starting number of each distinct D-sequence (from 1 to D).
  for (   let   i   =   1  ;   i   <=   D  ;   i  ++   )   {

    // 'j' iterates through the numbers within a specific D-sequence.
    // It starts from 'i' and increments by 'D'.
    // The loop continues as long as 'j+D' (the next number in sequence) is within the grid's value range (up to H*W).
    for (   let   j   =   i  ;   j   <=   H  *  W  -  D  ;   j  +=  D   )   {

      // Calculate the "magic power" cost to move from number 'j' to 'j+D'.
      // This cost is the Manhattan distance between their coordinates.
      // Add this current step's cost to the accumulated cost up to 'j' (s[j])
      // to get the total accumulated cost up to 'j+D' (s[j+D]).
      s  [  j  +  D  ]   =   Math  .  abs  (   p  [  j  ]  [  0  ]   -   p  [  j  +  D  ]  [  0  ]   )   // Absolute difference in row coordinates.
        +   Math  .  abs  (   p  [  j  ]  [  1  ]   -   p  [  j  +  D  ]  [  1  ]   )   // Absolute difference in column coordinates.
        +   s  [  j  ]  ; // Add the previously calculated accumulated cost.
    }
  }


  // Extract the number of queries 'Q' from the 'tmp' array.
  // 'Q' is located right after the grid data, which occupies 'H' rows.
  // So, tmp[H] contains the line with Q.
  const   [Q]   =   tmp  [  H  ]  ;

  // Initialize an empty array to store the results of each query.
  let   mp   =   [  ]  ;


  // Process each of the 'Q' queries.
  for (   let   i   =   0  ;   i   <   Q  ;   i  ++   )   {

    // For each query, extract the left (L) and right (R) bounds.
    // Query data starts from tmp[H+1], with 'i' as an offset for the current query.
    const   [L, R]   =   tmp  [  H  +  1  +  i  ]  ;

    // Calculate the "magic power" for the current query (from L to R).
    // This is simply the difference between the accumulated costs s[R] and s[L].
    // Push this result into the 'mp' array.
    mp  .  push  (   s  [  R  ]   -   s  [  L  ]   )  ;
  }


  // Join all the calculated magic power results with newline characters
  // and return the resulting string. This will be printed by console.log.
  return   mp  .  join  `\n`  ;

}  )  (  // End of the anonymous function's body.
  // This is the argument passed to the IIFE: read the entire standard input.
  require  (  'fs'  )  .  readFileSync  (  '/dev/stdin'  ,  'utf8'  )   // Use Node.js 'fs' module to synchronously read '/dev/stdin' as UTF-8.
)  )  ; // End of console.log call and IIFE execution.