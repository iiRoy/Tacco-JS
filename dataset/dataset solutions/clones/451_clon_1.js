/*
 * This is a Type I clone of the original JavaScript code.
 * All identifiers, operators, and expressions are preserved exactly.
 * Only whitespace (spacing, indentation, blank lines) and comments have been altered.
 */

function   main  (  tmp  )
{
  // Initialize an index variable for iterating through the input array.
  var   i   =   0  ;

  // Loop as long as the current pair of elements are not both zero.
  while  (  tmp [  i  ]  !=  0   &&   tmp [  i  +  1  ]  !=  0  )
  {
    // Check if the first number in the pair is less than the second.
    if  (  tmp [  i  ]  <  tmp [  i  +  1  ]  )
    {
      // If so, print them in ascending order.
      console  .  log  (  tmp [  i  ]  +  " "  +  tmp [  i  +  1  ]  )  ;
    }
    else
    {
      // Otherwise, print them with the smaller one first.
      console  .  log  (  tmp [  i  +  1  ]  +  " "  +  tmp [  i  ]  )  ;
    }

    // Increment the index by 2 to move to the next pair of numbers.
    i   =   i   +   2  ;
  }
}

// Declaring an unused variable, as present in the original code.
var   lines   =   [  ]  ;


// Initialize an array to store the pairs of numbers read from standard input.
var   b   =   [  ]  ;

// Create a readline interface to process input line by line.
var   reader   =   require  (  'readline'  )  .  createInterface  (  {
  input   :   process  .  stdin  ,  // Use standard input as the source.
  output   :   process  .  stdout   // Use standard output for console operations (though not directly used by readline here).
}  )  ;

// Attach an event listener for each 'line' event.
reader  .  on  (  'line'  ,   function   (  line  )
{
  // Split the input line by space to get individual number strings.
  var   a   =   line  .  split  (  ' '  )  ;

  // Parse the first string as an integer (base 10).
  var   c   =   parseInt  (  a [  0  ]  ,  10  )  ;

  // Parse the second string as an integer (base 10).
  var   d   =   parseInt  (  a [  1  ]  ,  10  )  ;

  // Add the parsed numbers to the array 'b'.
  b  .  push  (  c  )  ;
  b  .  push  (  d  )  ;

  // If both parsed numbers are zero, it signals the end of input for processing.
  if  (  c   ==   0   &&   d   ==   0  )
  {
    // Call the main function with the accumulated numbers.
    main  (  b  )  ;
  }
}  )  ;

// Attach an event listener for the 'end' of the standard input stream.
process  .  stdin  .  on  (  'end'  ,   function   (  )
{
  // This function is intentionally left empty, mirroring the original code's structure.
}  )  ;