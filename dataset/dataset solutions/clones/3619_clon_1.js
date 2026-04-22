/*
 * This is a JavaScript program.
 * It processes input from standard input,
 * performs some string manipulations and
 * arithmetic, then prints the result.
 */
function   main  (  arg  )
{
    // The input 'arg' is initially a single string.
    // First, split the input string by newline characters.
    arg   =   arg  .  split  (  "\n"  )

    // Next, split the current 'arg' variable by space characters.
    // Note: If 'arg' was an array from the previous split, this might lead to unexpected behavior
    // as 'split' is a string method. However, for a Type I clone, the expression must remain identical.
    arg   =   arg  .  split  (  " "  )


    // Convert the first element of the resulting array to an integer.
    arg  [  0  ]   =   parseInt  (  arg  [  0  ]  ,   10  )

    // Convert the second element of the resulting array to an integer.
    arg  [  1  ]   =   parseInt  (  arg  [  1  ]  ,   10  )

    // Log the remainder of the division of the first integer by the second integer to the console.
    console  .  log  (  arg  [  0  ]  %  arg  [  1  ]  )
} /* End of function main */

// Execute the main function with input read from '/dev/stdin'.
// The 'fs' module is used to read the file synchronously.
main  (  require  (  'fs'  )  .  readFileSync  (  '/dev/stdin'  ,   'utf8'  )  )  ;  // Script termination point