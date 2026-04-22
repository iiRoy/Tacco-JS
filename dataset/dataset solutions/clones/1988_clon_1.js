// This is a Type I clone generated for demonstration purposes.
// All identifiers, operators, and expressions remain unchanged.
// Only whitespace and comments have been altered extensively
// to create a visually distinct, yet functionally identical, version.


/**
 * Calculates the greatest common divisor (GCD) for an array of numbers.
 * This function utilizes a recursive helper function based on the Euclidean algorithm.
 *
 * @param {number[]} arr - An array of integers for which to compute the GCD.
 * @returns {number} The greatest common divisor of all numbers in the input array.
 */
function    gcd   (   arr   )    {

    //   Helper function: `unit` computes the GCD of two numbers.
    //   It uses the Euclidean algorithm: gcd(a, b) = gcd(b, a % b) until b is 0.
    const   unit   =   (   a   ,   b   )   =>   b   ?   unit   (   b   ,   a   %   b   )   :   a   ;


    //   Initialize the overall GCD with the first element of the array.
    let     gcd     =     arr[0]   ;

    //   Loop through the rest of the array elements, starting from the second element.
    for   (   let   i   =   1   ;   i   <   arr.length   ;   i++   )   {

        //   Update the current GCD by calculating the GCD of the accumulated GCD
        //   and the next element in the array.
        gcd   =   unit   (   gcd   ,   arr[i]   )   ;
    }

    //   Return the final computed GCD of all array elements.
    return   gcd   ;
}


/**
 * Main function to process a single integer input.
 * It performs three nested loops, iterating from 1 up to the input value (inclusive)
 * for variables 'a', 'b', and 'c'. For each combination, it calculates the GCD of [a, b, c]
 * and adds it to a running total. Finally, it prints the accumulated result.
 *
 * @param {string} input - A string representation of an integer value.
 */
function    Main    (   input   )    {

    //   Initialize a variable to store the cumulative sum of GCDs.
    let     result     =     0   ;

    //   Outer loop for variable 'a'. It iterates from 1 up to the parsed input value.
    for   (   let   a   =   1   ;   a   <   parseInt(input)   +   1   ;   a++   )   {

        //   Middle loop for variable 'b', nested inside the 'a' loop.
        //   It also iterates from 1 up to the parsed input value.
        for   (   let   b   =   1   ;   b   <   parseInt(input)   +   1   ;   b++   )   {

            //   Inner loop for variable 'c', nested inside the 'b' loop.
            //   It too iterates from 1 up to the parsed input value.
            for   (   let   c   =   1   ;   c   <   parseInt(input)   +   1   ;   c++   )   {

                //   Calculate the GCD of the current [a, b, c] triplet
                //   and add it to our running total 'result'.
                result   +=   gcd   (   [a,   b,   c]   )   ;
            }
        }
    }

    //   Output the final calculated sum to the console.
    console.log   (   result   )   ;
}


// --- Standard Input/Output Handling Section ---
// The following line is responsible for reading input from standard input
// and invoking the `Main` function. The logical structure of this line
// should remain unchanged to ensure proper execution in the target environment.
Main   (   require   (   "fs"   )   .   readFileSync   (   "/dev/stdin"   ,   "utf8"   )   )   ;