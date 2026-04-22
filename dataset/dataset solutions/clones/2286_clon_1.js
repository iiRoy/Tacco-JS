/*
 * This file contains the main logic for processing input and calculating
 * a specific mathematical result using Least Common Multiple (LCM).
 */

function   main(  input  )
{
    // Declare variable N and parse it from the first part of the input string.
    var   N   =   input[0]  .  split(" ")  [0]  -  0  ;


    var   M   =   input[0]  .  split(" ")  [1]  -  0  ;  // M is also parsed from the first input line.

    // The list of numbers for which LCM needs to be calculated.
    var   list   =   input[1]  .  split(" ")  .  map(  v  =>  v  -  0  )  ;

    var   l   =   lcm(  list  )  ;  // Calculate the LCM of the numbers in 'list'.

    // Output the final calculated value to the console.
    console  .  log(  Math  .  trunc(  M  /  (l  /  2)  )   -   Math  .  trunc(  M  /  l  )  )  ;
}


/*
 * Calculates the Least Common Multiple (LCM) of an array of numbers.
 * It uses the Greatest Common Divisor (GCD) helper function.
 */
function   lcm(  args  )
{
        var   a   =   args   ;   // Assign the input array to 'a' for brevity.

        // Helper function to calculate the Greatest Common Divisor (GCD) using Euclidean algorithm.
        var   g   =   (  n  ,   m  )   =>   m   ?   g(  m  ,   n   %   m  )   :   n   ;

        // Helper function to calculate the LCM of two numbers using their GCD.
        var   l   =   (  n  ,   m  )   =>   n   *   m   /   g(  n  ,   m  )   ;

        var   ans   =   a[0]   ;  // Initialize LCM with the first element of the array.


        // Iterate through the rest of the array to calculate the cumulative LCM.
        for   (  var   i   =   1  ;   i   <   a  .  length  ;   i  ++  )
        {
                ans   =   l(  ans  ,   a[i]  )   ;   // Update 'ans' with the LCM of current 'ans' and the next number.
        }

        return   ans   ;   // Return the final LCM.
}


// This section reads input from standard input, processes it, and calls the main function.
main(  require('fs')  .  readFileSync(  '/dev/stdin'  ,   'utf8'  )  .  trim()  .  split("\n")  )  ;