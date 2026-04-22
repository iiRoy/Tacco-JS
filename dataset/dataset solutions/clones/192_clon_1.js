/* This array 'C' maps indices to cup labels.
   It's used to convert between string labels and array positions. */
var       C        =        [      "A"     ,     "B"      ,     "C"      ]     ;

/**
 *  Swaps two elements within an array.
 *  This is a utility function crucial for the cup-moving logic.
 *
 *  @param {Array} A   - The array on which to perform the swap.
 *  @param {number} i1 - The index of the first element to swap.
 *  @param {number} i2 - The index of the second element to swap.
 */
function     swap     (    A    ,    i1    ,    i2    )
{
  // Temporarily store the value at the first index.
  var     tmp      =      A     [     i1     ]     ;

  /*
   * Assign the value from the second index
   * to the first index.
   */
  A    [    i1    ]    =    A    [    i2    ]    ;


  // Now, assign the stored temporary value to the second index.
  A    [    i2    ]    =    tmp    ;

} // End of the 'swap' function definition.


// Read the entire standard input synchronously as a UTF-8 string.
var     input      =      require     (     'fs'     )     .     readFileSync     (     '/dev/stdin'     ,     'utf8'     )     ;

// Trim any leading/trailing whitespace from the input and split it into an array of lines.
var     lines      =      input     .     trim     (     )     .     split     (     '\n'     )     ;


/*
 *  Represents the state of the cups.
 *  '1' indicates the cup with the ball, '0' indicates an empty cup.
 *  Initial state: Ball in the first cup.
 */
var     cups      =      [      1      ,      0      ,      0      ]     ;

// Declare a variable to hold each line read from the input.
var     line     ;

// Process each line of input until there are no more lines.
while     (     (     line     =     lines     .     shift     (     )     )     )
{
  // Split the current line by comma to get the two command parts (e.g., "A,B").
  var     command      =      line     .     split     (     ','     )     ;

  /*
   *  Perform the swap operation on the 'cups' array.
   *  'C.indexOf(command[0])' gets the numerical index for the first cup label.
   *  'C.indexOf(command[1])' gets the numerical index for the second cup label.
   */
  swap     (     cups     ,     C     .     indexOf     (     command     [     0     ]     )     ,     C     .     indexOf     (     command     [     1     ]     )     )     ;

} // End of the while loop for processing input lines.


/*
 *  After all swaps are done, iterate through the cups array
 *  to find which cup now contains the ball (indicated by '1').
 */
for     (     var     i     =     0     ;     i     <     cups     .     length     ;     i     ++     )
{
  // Check if the current cup 'i' contains the ball.
  if     (     cups     [     i     ]     )
  {
    // If it does, print the corresponding cup label from array 'C'.
    console     .     log     (     C     [     i     ]     )     ;

    // Since we found the ball, we can stop checking.
    break     ;
  } // End of the if condition.

} // End of the for loop.