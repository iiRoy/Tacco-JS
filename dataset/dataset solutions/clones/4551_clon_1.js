/* This is a Type I clone of the original JavaScript code.
 * All identifiers, variable names, function names, operators, and expressions
 * remain completely unchanged.
 *
 * Only whitespace and comments have been altered to provide a visually
 * distinct version while maintaining logical and structural equivalence.
 */

// Start of the main program execution.
console.log(

  // This is a self-executing anonymous arrow function.
  // It takes 'args' (the input string) as its parameter.
  ( args => {

      // Declare constant variables for input parsing.
      // Destructuring assignment is used here for clarity and brevity.
      const [
          // The first line of input provides N, A, and B.
          [ N, A, B ],
          // The rest of the lines represent the heights 'h'.
          ...h
      ] = args
          // Remove any leading or trailing whitespace from the raw input string.
          .trim()
          // Split the cleaned string into an array of lines, using newline as delimiter.
          .split`\n`
          // Map over each line to further process it.
          .map(
              // For each line 'r'...
              r => r
                  // Split the line into individual string values by spaces.
                  .split` `
                  // Map over these string values to convert them into integers.
                  .map(
                      // Convert each value 'v' to an integer using the bitwise OR operator.
                      // This is a concise way to achieve parseInt(v, 10).
                      v => v | 0
                  )
          );


      // Initialize variables for the binary search algorithm.
      // 'ok' represents a "good" (feasible) value for the number of special attacks.
      // It's initialized to a sufficiently large upper bound.
      let ok = Math.ceil(
              1e9 / B // A large number (1 billion) divided by B to ensure a high initial ceiling.
          ),
          // 'ng' represents a "bad" (infeasible) value for the number of special attacks.
          // It's initialized to 0, as 0 special attacks might be too few.
          ng = 0;

      // The 'bisect' label is optional but can be used for breaking out of nested loops.
      // Here, it simply labels the binary search loop.
      bisect:
      while (
          // The binary search continues as long as there's a gap between 'ok' and 'ng'.
          // 'ok' is always greater than 'ng', and we want to find the smallest 'ok'.
          ok > ng + 1
      ) {
          // Calculate the midpoint 'm' between 'ok' and 'ng'.
          // The '>> 1' performs an integer division by 2, effectively floor((ok+ng)/2).
          let m = ( ok + ng ) >> 1,
              // 'k' represents the available special attacks for the current 'm'.
              // It's initialized to 'm'.
              k = m;

          // Loop through each enemy's height to determine the special attacks needed.
          for (
              let i = 0; // Initialize loop counter 'i'.
              i < N;     // Continue loop while 'i' is less than the total number of enemies 'N'.
              i++        // Increment 'i' after each iteration.
          ) {
              // Calculate the remaining height 'r' after 'm' regular attacks.
              // Each regular attack deals 'B' damage.
              let r = h[ i ] - m * B;

              // If the remaining height is less than or equal to 0,
              // no special attacks are needed for this enemy.
              if (
                  r <= 0
              ) {
                  continue; // Skip to the next enemy.
              }

              // If special attacks are required, calculate how many.
              // Each special attack deals 'A' damage but replaces a regular 'B' attack,
              // so the effective damage per special attack is (A - B).
              k -= Math.ceil(
                  r / ( A - B ) // Subtract the number of special attacks needed from 'k'.
              );
          }

          // After checking all enemies for the current 'm',
          // determine if 'm' was a feasible number of special attacks.
          if (
              k >= 0 // If 'k' is non-negative, it means 'm' special attacks were sufficient.
          ) {
              ok = m; // 'm' becomes the new upper bound (a possible answer).
          } else {
              // If 'k' is negative, 'm' special attacks were not enough.
              ng = m; // 'm' becomes the new lower bound (not a possible answer).
          }
      }

      // Once the binary search completes, 'ok' will hold the minimum feasible number of special attacks.
      // Return this value as a string.
      return `${ ok }`;

  } ) (
      // This is the input source for the self-executing function.
      // It reads the entire content of standard input synchronously.
      require( 'fs' )
          .readFileSync(
              '/dev/stdin', // Specifies the file path for standard input.
              'utf8'        // Specifies UTF-8 encoding for reading the file content.
          )
  ) // The result of readFileSync is passed as 'args' to the arrow function.

); // The final result is printed to the console.

// End of the JavaScript program.