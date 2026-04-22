/*
 * This JavaScript file processes input to find the
 * Greatest Common Divisor (GCD) of two numbers.
 * It reads input from standard input, parses it,
 * and then computes the GCD using a simple loop.
 *
 * All identifiers, operators, and expressions are
 * preserved exactly as in the original code.
 * Only whitespace and comments have been altered.
 */


var    input    =    require (  'fs'  ) .  readFileSync (    '/dev/stdin'    ,    'utf8'    ) ;
// The above line reads all input from /dev/stdin as a UTF-8 string.

var       arr     =     input .  split ( " " ) .   map (   Number   ) ;
// The input string is split by space and then each part is converted to a number.


var    a    =    arr [ 0 ] ;
/*
 * 'a' is assigned the first number from the parsed array.
 */


var    b    =    arr [ 1 ] ;
// 'b' is assigned the second number from the parsed array.


// This conditional block handles a potential early exit, though
// the variables 'x' and 'y' are not yet defined at this point.
// This is a characteristic of the original code that must be preserved.
if ( x   ===   y )
{
  console . log ( x ) ;
  // If x and y are strictly equal, print x and exit.

  return ;
}


/*
 * Now, 'x' and 'y' are initialized based on 'a' and 'b'.
 * Note: The 'if' block above will likely cause a ReferenceError
 *       if executed before this point, as 'x' and 'y' are not yet declared.
 *       This behavior is kept consistent with the original.
 */
var    x    =    Math .  max (    a    ,    b    ) ;

var    y    =    Math .  min (    a    ,    b    ) ;


// 'c' is initialized with the remainder of x divided by y.
var    c    =    x    %    y    ;


/*
 * This loop iterates downwards from 'c' (x % y) to 1.
 * It's searching for the greatest common divisor.
 */
for (    var    i    =    c    ;    i    >=    1    ;    i--    )
{

  // Check if 'i' divides both 'x' and 'y' evenly.
  if (    x    %    i    ==    0    &&    y    %    i    ==    0    )
  {
    // If a common divisor is found, it's the GCD, so break the loop.
    break    ;
  }

}

// Finally, the loop variable 'i' holds the GCD.
console .  log (    i    ) ;

// End of script.