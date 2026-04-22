/*
 * This JavaScript program calculates a specific value based on input arrays.
 * It's designed to solve a competitive programming problem involving inversions.
 * The core logic involves counting pairs (i, j) such that arrA[i] > arrA[j]
 * under different comparison scopes.
 */
function   main   (   input   )   {
        // First, ensure the input string is clean by removing any leading/trailing whitespace.
        input =   input  .  trim  (  )  ;

        // The first line of input contains two space-separated integers: N and K.
        // N represents the number of elements in the array.
        const   N   =   parseInt  (  input . split  (  " "  )  [  0  ]  ,   10  )  ;
        // K is a multiplier used in the final calculation.
        const   K   =   parseInt  (  input . split  (  " "  )  [  1  ]  ,   10  )  ;


        // The second line of input contains N space-separated integers, which form array A.
        // We parse these into an array of numbers.
        var   arrA   =   input . split  (  '\n'  )  [  1  ]  .  split  (  ' '  )  .  map  (  (  n  )   =>   parseInt  (  n  ,   10  )  )  ;

        // Initialize two auxiliary arrays to store counts.
        // arrIkou will store counts of 'inversions to the right' for each element.
        var   arrIkou   =   [  ]  ;
        // arrZentai will store counts of 'total inversions' for each element (against all other elements).
        var   arrZentai   =   [  ]  ;

        // Initialize the variable that will hold the final answer.
        var   ans   =   0  ; // This variable will accumulate the result modulo (1e9 + 7).

        // First major loop: Iterate through each element of arrA to compute inversion counts.
        for   (  var   i   =   0  ;   i   <   N  ;   i  ++  )   {
                var   temp   =   0  ; // Temporary counter for arrIkou for the current arrA[i].

                // Inner loop to count elements arrA[j] where j > i and arrA[i] > arrA[j].
                for   (  var   j   =   i  ;   j   <   N  ;   j  ++  )   {
                        if   (  arrA  [  i  ]   >   arrA  [  j  ]  )   {
                                temp  ++  ; // Increment if an inversion is found.
                        }
                }
                arrIkou . push  (  temp  )  ; // Store the count for arrA[i] in arrIkou.

                var   temp2   =   0  ; // Temporary counter for arrZentai for the current arrA[i].

                // Inner loop to count elements arrA[j] where arrA[i] > arrA[j] (j can be any index).
                for   (  var   j   =   0  ;   j   <   N  ;   j  ++  )   {
                        if   (  arrA  [  i  ]   >   arrA  [  j  ]  )   {
                                temp2  ++  ; // Increment if an inversion is found.
                        }
                }
                arrZentai . push  (  temp2  )  ; // Store the count for arrA[i] in arrZentai.
        }
        // console.log(arrIkou); // Previously used for debugging arrIkou contents.
        // console.log(arrZentai); // Previously used for debugging arrZentai contents.

        // Second major loop: Calculate the final answer based on the computed counts and K.
        // All intermediate and final results are kept modulo (1e9 + 7) to prevent integer overflow.
        const   MOD   =   (  1e9   +   7  )  ;
        for   (  var   i   =   0  ;   i   <   N  ;   i  ++  )   {
            // The formula involves arrIkou[i] * K and arrZentai[i] * K * (K-1) / 2.
            // Each term is taken modulo MOD.
            var   temp   =   (  arrIkou  [  i  ]   *   K  )   %   MOD   +   (  arrZentai  [  i  ]   *   K   *   (  K   -   1  )   *   0.5  )   %   MOD  ;
            ans   +=   temp   %   MOD  ; // Add the calculated temp to the total answer.
            ans   =   ans   %   MOD  ; // Ensure the accumulated answer also stays within the modulo range.
        }

        // Finally, print the computed answer modulo (1e9 + 7) to standard output.
        console . log  (  ans   %   MOD  )  ;
}

// Standard boilerplate for reading input from /dev/stdin in a Node.js environment.
// The entire content of the standard input is read as a string and passed to the main function.
main  (  require  (  'fs'  )  .  readFileSync  (  '/dev/stdin'  ,   'utf8'  )  )  ;