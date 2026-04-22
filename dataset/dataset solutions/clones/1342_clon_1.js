/*
 * This file contains a JavaScript program to calculate (m^n) % C efficiently.
 * It uses a custom modular exponentiation function (`fastRuijoR`)
 * and a custom modular multiplication function (`kakeruR`)
 * to handle large numbers and avoid overflow by breaking down multiplication.
 */

function   Main   (   input   ) {
    // Process the input string: trim whitespace, split into lines,
    // then split each line by space.
    input   =   input.trim()
                  .split("\n")
                  .map(
                      function(x) {
                          return   x.split(" ");
                      }
                  );

    // Parse m and n from the first line of input.
    let   m   =   parseInt(   input[0][0],   10   );
    let   n   =   parseInt(   input[0][1],   10   );


    // Define the modulo constant C and an intermediate constant C2.
    // C is 10^9 + 7, a common prime modulo in competitive programming.
    let   C   =   1e9   +   7;
    // C2 is used to split multiplication into smaller parts for modular arithmetic.
    let   C2   =   1e5   *   5;

    // Call the fast modular exponentiation function and print the result.
    console.log(   fastRuijoR(m,   n,   C,   C2)   );

} // End of Main function


function   fastRuijoR   (   a,   b,   C,   C2   ) {
    var   ans   =   1; // Initialize the answer to 1 (a^0).
    var   binary   =   b.toString(2); // Convert exponent 'b' to its binary representation.
    var   l   =   binary.length; // Get the length of the binary string.
    var   tmp   =   a; // 'tmp' will store a^(2^k) modulo C.

    // Iterate through the binary representation of 'b' from right to left.
    // Each '1' bit corresponds to a term in the sum of powers of 2 for 'b'.
    for   (   var   i   =   0;   i   <   l;   i++   ) {
        // Check if the current bit (from right) is '1'.
        if   (   binary.substr(   (i   +   1)   *   -1,   1   )   ===   '1'   )
            // If it's '1', multiply 'ans' by the current 'tmp' value.
            // Use the custom modular multiplication `kakeruR`.
            ans   =   kakeruR(   ans,   tmp,   C,   C2   );

        // Square 'tmp' for the next iteration (a^(2^k) -> a^(2^(k+1))).
        // Use the custom modular multiplication `kakeruR`.
        tmp   =   kakeruR(   tmp,   tmp,   C,   C2   );
    } // End of for loop

    return   ans; // Return the final result.
} // End of fastRuijoR function


function   kakeruR   (   a,   b,   C,   C2   ) {
    var   tmpQ,   tmpR,   ans; // Declare temporary variables for quotient, remainder, and answer.

    // Split 'b' into two parts: a quotient 'tmpQ' and a remainder 'tmpR',
    // based on the constant C2. This helps prevent intermediate overflows
    // when multiplying large numbers before taking modulo.
    tmpQ   =   (   b   /   C2   |   0   ); // Integer division of b by C2.
    tmpR   =   b   -   (   tmpQ   *   C2   ); // Remainder of b divided by C2.

    // Calculate (a * b) % C using the split parts of b:
    // (a * (tmpQ * C2 + tmpR)) % C
    // = ((a * tmpQ * C2) % C + (a * tmpR) % C) % C
    // The C2 is used to keep numbers manageable.
    ans   =   (   a   *   tmpQ   %   C   )   *   C2   %   C   +   (   a   *   tmpR   );

    // Apply the modulo operation one last time to ensure the result is within [0, C-1].
    ans   %=   C;

    return   ans; // Return the modular product.
} // End of kakeruR function


// Read input from standard input and pass it to the Main function.
Main(   require("fs")
           .readFileSync(
               "/dev/stdin",
               "utf8"
           )
   );