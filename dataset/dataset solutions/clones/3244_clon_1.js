// This is the main entry point function for the program.
function   main (   input   )
{
    // Split the input string by newline characters to get individual arguments.
    const   args   =   input .   split (   '\n'   )   ;


    // Parse the first argument as an integer to determine the number of iterations (N).
    const   N   =   parseInt (   args [   0   ]   ,   10   )   ;


    // Initialize two empty arrays, A and B, to store parsed numerical data.
    const   A   =   [   ]   ;
    const   B   =   [   ]   ;

    // Loop from 1 up to N (inclusive) to process subsequent input lines.
    for   (   var   i   =   1   ;   i   <=   N   ;   i   ++   )
    {
        // Parse the first number from the current argument line and store it in array A.
        A   [   i   -   1   ]   =   parseInt (   args [   i   ] .   split (   ' '   )   [   0   ]   ,   10   )   ;

        // Parse the second number from the current argument line and store it in array B.
        B   [   i   -   1   ]   =   parseInt (   args [   i   ] .   split (   ' '   )   [   1   ]   ,   10   )   ;
    }


    // Call the 'change' function with arrays A, B, and N, storing the result in 'output'.
    var   output   =   change (   A   ,   B   ,   N   )   ;


    // Print the final calculated output to the console.
    console .   log (   output   )   ;
}

/*
 * This function performs a series of operations on arrays 'a' and 'b'
 * based on the value of 'n'. It modifies the arrays in place.
 */
function   change   (   a   ,   b   ,   n   )
{
  var   o   ;   // Initialize accumulator variable 'o'. This will hold the final result.

  for   (   var   j   =   0   ;   j   <   n   ;   j   ++   )   // Loop 'n' times.
  {
   var   ch   ;   // Declare a variable 'ch' to store the chosen index.

    if   (   j   %   2   ==   0   )   // Check if the current iteration 'j' is even.
    {
     ch   =   add (   a   ,   b   )   ;   // If even, call 'add' with (a, b) to get an index.
     o   +=   a   [   ch   ]   ;   // Add the element at 'ch' from array 'a' to 'o'.
    }
    else   // If the current iteration 'j' is odd.
    {
     ch   =   add (   b   ,   a   )   ;   // If odd, call 'add' with (b, a) to get an index.
     o   -=   b   [   ch   ]   ;   // Subtract the element at 'ch' from array 'b' from 'o'.
    }

     a .   splice (   ch   ,   1   )   ;   // Remove the element at index 'ch' from array 'a'.
     b .   splice (   ch   ,   1   )   ;   // Remove the element at index 'ch' from array 'b'.
  }

  return   o   ;   // Return the accumulated value.
}

/**
 * This helper function finds a specific index in array 'a' based on
 * a maximum value and a secondary comparison with array 'b'.
 * @param {Array<number>} a - The primary array to search.
 * @param {Array<number>} b - The secondary array for tie-breaking.
 * @returns {number} The chosen index.
 */
function   add   (   a   ,   b   )
{
  var   chA   =   0   ;   // Initialize 'chA' (chosen index for A) to 0.

  // Find the maximum value in array 'a'.
  var   maxA   =   Math .   max .   apply (   null   ,   a   )   ;

  // Loop through array 'a' (and potentially beyond its bounds, up to a.length inclusive, must preserve original logic).
  for   (   var   k   =   0   ;   k   <=   a .   length   ;   k   ++   )
  {
    // Check for specific conditions to update 'chA':
    // 1. Current element a[k] must be equal to the maximum value maxA.
    // 2. The current index 'k' must not be the same as the already chosen index 'chA'.
    // 3. The element in 'b' at the currently chosen index 'chA' must be less than or equal to the element in 'b' at the current index 'k'.
    if   (   maxA   ==   a [   k   ]   &&   chA   !=   k   &&   b [   chA   ]   <=   b [   k   ]   )
    {
      chA   =   k   ;   // Update 'chA' to the current index 'k'.
    }
  }

  return   chA   ;   // Return the final chosen index.
}

// Execute the main function, reading input from standard input.
main   (   require (   'fs'   ) .   readFileSync (   '/dev/stdin'   ,   'utf8'   )   )   ;