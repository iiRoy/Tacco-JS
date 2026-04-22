/*
 * This JavaScript code defines a main function to process input.
 * It's designed to solve a specific problem, likely from a competitive programming context.
 */
function   main  (   input   ) {
  // Split the input string by newline characters to get individual arguments.
  const     args    =   input.split  (  '\n'  )  ;

  /*
   * The first line of input contains two space-separated values: N and M.
   * We parse them here.
   */
  var   NM    =   args[0] .  split  (  ' '  )  ;


  // The second line contains a series of space-separated spin values.
  var    Spins   =   args[1] .  split  (  ' '  )  ;

  // Convert the first value from NM to an integer N.
  var     N     =   parseInt  (  NM[0]  )  ;

  // Convert the second value from NM to an integer M.
  var     M     =   parseInt  (  NM[1]  )  ;


  // Loop through the 'Spins' array and convert each string element to an integer.
  for   (   var   i   =   0  ;
          i   <   M  ;
          i++   )
  {
    // Convert the current spin value to an integer.
    Spins[i]   =   parseInt  (  Spins[i]  )  ;
  }

  // Sort the 'Spins' array in ascending order.
  Spins.sort  (  function  (  a  ,  b  )   {
        return    a   -   b  ;
    }  )  ;

  /*
   * Initialize an array 'diff' to store the absolute differences between consecutive spin values.
   * The size is M-1, but we're initializing with a single element here.
   */
  var   diff    =   [ M   -   1 ]  ;

  // Calculate the absolute differences between adjacent elements in the sorted 'Spins' array.
  for   (   var   i   =   0  ;
          i   <   M   -   1  ;
          i++   )
  {
        // Store the absolute difference.
        diff[i]   =   Math.abs  (  Spins[i]   -   Spins[i   +   1]  )  ;
  }

  // Initialize the answer variable.
  var   ans   =   0  ;

  // If M is less than N, update N to M. This might be a constraint handling.
  if   (  M   <   N  )
  {
        N   =   M  ;   //   Adjust N if M is smaller.
  }

  // Initialize an index variable.
  var   index   =   0  ;
  // Re-initialize the answer variable (this was in the original code, keeping it for Type I).
  var   ans   =   0  ;

  /*
   * This loop identifies and "removes" the N-1 largest differences
   * by setting them to 0. This implies we are trying to minimize the sum of remaining differences.
   */
  for   (   var   i   =   0  ;
          i   <   N   -   1  ;
          i++   )
  {
        // Find the index of the maximum value in the 'diff' array.
        index   =   diff.indexOf  (  Math.max.apply  (  null  ,  diff  )  )  ;
        // Set the largest difference found to 0.
        diff[index]   =   0  ;
  }

  // Sum up all the remaining (non-zero) differences in the 'diff' array.
  for   (   var   i   =   0  ;
          i   <   M   -   1  ;
          i++   )
  {
        ans   +=   diff[i]  ;   //   Accumulate the differences.
  }

  // Output the final calculated answer to the console.
  console.log  (  ans  )  ;
}

// Read input from /dev/stdin and pass it to the main function.
main  (  require  (  'fs'  )  .  readFileSync  (  '/dev/stdin'  ,  'utf8'  )  )  ;