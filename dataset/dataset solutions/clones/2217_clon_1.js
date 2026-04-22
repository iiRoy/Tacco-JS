/*
 * This is a JavaScript program designed to solve a specific problem.
 * It reads input, processes an array of numbers, and outputs a result.
 */
function   main (   input   )   {

  // The input string is first split into an array of lines.
  const   inputs   =   input.split ( '\n' )


  // The first line of input is parsed to extract the value of N.
  // It's split by spaces and then each part is converted to a Number.
  const   [   N   ]   =   inputs [ 0 ].split ( ' ' ).map ( Number )

  // The second line of input contains the array P.
  // Similar to N, it's split by spaces and converted to numbers.
  const   P   =   inputs [ 1 ].split ( ' ' ).map ( Number )


  // Initialize 'min' with the first element of the array P.
  let   min   =   P [ 0 ]

  // Initialize 'count' to 1, as the first element is always considered a 'minimum' initially.
  let   count   =   1


  // A loop iterates through the array P, starting from the second element (index 1).
  for   (   let   i   =   1   ;   i   <   N   ;   i++   )   {

    // This conditional statement checks if the current element P[i] is less than the current minimum.
    if   (   min   >   P [ i ]   )   {

      // If P[i] is indeed smaller, update 'min' to this new smaller value.
      min   =   P [ i ]

      // Increment 'count' because a new minimum has been found.
      count++
    }
  }


  // Finally, the total count of times a new minimum was set is printed to the console.
  console.log (   count   )
}


// This part of the code handles reading the input from standard input.
// It uses Node.js 'fs' module to synchronously read the file,
// decodes it as 'utf8', and then removes any leading/trailing whitespace.
main (   require ( 'fs' ).readFileSync (   '/dev/stdin'   ,   'utf8'   ).trim ( )   )