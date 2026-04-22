/* This is the strict mode directive.
   It enables strict parsing and error handling in the script. */
'use strict' ;


// Define the main function that processes the input.
function    main   (  input  )

{
  // Declare constants using object destructuring-like syntax for readability.
  const

    // The 'arr' variable will store an array of lines from the input.
    arr = input . trim ( ) . split ( '\n' ) ,

    // 'a' is the target number, converted from the first line of the input.
    a   =   Number ( arr [ 0 ] ) ;

  // Declare mutable variables.
  let

    // 'money' starts at 100, representing the initial capital.
    money   =   100 ,

    // 'count' will track the number of iterations/days.
    count   =   0
    ;

  // This loop simulates the growth of money until it reaches the target 'a'.
  while  (  money  <  a  )
  {
    // Money increases by 1% each iteration.
    money   *=   1.01   ;


    // Increment the counter for each iteration.
    count   ++   ;
  }

  // Output the final count to the console.
  console  .  log  (  count  )  ;
}


// Call the main function with input read from standard input.
// This part handles reading data from '/dev/stdin' in a Node.js environment.
main (
  require ( 'fs' )
    . readFileSync (
      '/dev/stdin' ,
      'utf8'
    )
) ;

// End of the program.