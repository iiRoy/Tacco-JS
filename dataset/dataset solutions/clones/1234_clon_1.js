var    input    =    require (  'fs'  )
  .  readFileSync  (
    '/dev/stdin'  ,
    'utf8'
  )
  .  split  (
    "\n"
  )
  .  map  (
    Number
  )
; // This line initializes the 'input' array by reading from standard input.

/*
 *  The following block iterates over each element obtained from the input.
 *  Each element 'x' is processed based on a specific condition.
 */
input
  .  map  (
    function  (  x  )
    {
      // Check if the current element 'x' is not equal to the string '0 0'.
      // This is a common way to signal end of input in competitive programming.
      if  (
        x
        !=
        '0 0'
      )
      {
        // If the condition is met, perform a series of operations:
        // 1. Split the string 'x' by a space character.
        // 2. Sort the resulting array lexicographically.
        // 3. Join the sorted array elements back into a string, separated by a space.
        // 4. Print the final string to the console.
        console
          .  log  (
            x
              .  split  (  ' '  )
              .  sort  (  )
              .  join  (  ' '  )
          )
        ; // End of the console.log statement.
      } // End of the 'if' conditional block.
    } // End of the anonymous function passed to 'map'.
  )
; // End of the 'input.map' method call.

// The script finishes execution after processing all elements.