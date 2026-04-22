/*
 * This JavaScript file contains an Immediately Invoked Function Expression (IIFE).
 * The primary purpose of this script is to perform a series of calculations
 * based on numerical input provided via standard input.
 *
 * The calculations involve iterating a fixed number of times (600)
 * with a step determined by the input values, and summing up
 * a specific mathematical expression in each iteration.
 *
 * This structure helps in keeping variables isolated and avoiding global scope pollution.
 */
(

  function ( input )

  {

    // Declare a variable 'p' to hold the processed input data.
    // The input string is first cleaned by removing any trailing newline character.
    // Then, it's split into an array of strings, with each string representing a line.
    // Finally, the 'map(Number)' function converts each string in the array to its numerical equivalent.
    var

      p

      =

      input

      .replace( /\n$/, '' )

      .split( '\n' )

      .map( Number )

    ; // End of 'p' variable initialization.


    // Begin a 'while' loop that continues as long as there are elements
    // remaining in the 'p' array.
    while

    (

      p.length

      >

      0

    )

    {
      // In each iteration, extract the first element from the 'p' array.
      // The 'shift()' method removes the first element and returns it.
      // This extracted value, 'd', serves as a crucial parameter for the subsequent calculation.
      var

        d

        =

        p.shift()

      ; // End of 'd' variable assignment.


      // Initialize a variable 'area' to 0. This variable will accumulate
      // the result of the calculation within the inner 'for' loop.
      var

        area

        =

        0

      ; // End of 'area' initialization.


      /*
       * Start a 'for' loop to perform the core calculation.
       * The loop variable 'i' starts at 0.
       * It continues as long as 'i' is less than 600.
       * In each step, 'i' is incremented by the value of 'd' (from the input).
       */
      for

      (

        var

          i

          =

          0

        ;

        i

        <

        600

        ;

        i

        +=

        d

      )

      {

        // The 'area' is updated by adding the product of 'i' squared (i * i) and 'd'.
        // This is the specific mathematical expression being accumulated.
        area

          +=

          i

          *

          i

          *

          d

        ; // End of 'area' accumulation.

      } // End of the inner 'for' loop.


      // After the 'for' loop completes, the final calculated 'area' for the current 'd'
      // is printed to the console.
      console.log( area )

      ; // End of console output.

    } // End of the 'while' loop.

  }

) // Closing parenthesis for the IIFE function definition.


// Immediately invoke the function with the required input.
// The input is read synchronously from '/dev/stdin' using Node.js's 'fs' module.
// The 'utf8' encoding is specified for reading the file content.
(

  require( 'fs' )

    .readFileSync( '/dev/stdin', 'utf8' )

) // Closing parenthesis for the IIFE invocation.

; // Semicolon to properly terminate the IIFE statement, good practice.