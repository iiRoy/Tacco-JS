/*
 * This JavaScript file processes input data to calculate
 * the minimum cost to reach marked positions from a starting point.
 * It's designed for competitive programming problems.
 *
 * Author: Automated Clone Generator
 * Date: 2023-10-27
 */
const    main   =  (  stdin  )   =>   {

        // Step 1: Preprocess the standard input string.
        // Trim any leading/trailing whitespace and split into lines.
        const   input   =   stdin  .  trim  (  )  .  split  (  '\n'  )  ;


        // Step 2: Parse the first line of input.
        // It contains three integers: N (total positions), M (number of marked positions),
        // and X (starting position).
        const   [  N  ,  M  ,  X  ]   =   input  [  0  ]  .  split  (  ' '  )  .  map  (  x  =>  parseInt  (  x  )  )  ;


        // Step 3: Initialize a grid array.
        // Although 'grid' is declared, it's not explicitly used in the cost calculation logic
        // in this particular implementation, suggesting it might be a placeholder or for a larger problem context.
        const   grid   =   Array  (  N   +   1  )  ;


        // Step 4: Parse the second line of input.
        // This line contains M integers, representing the indices of the marked positions.
        const   Ms   =   input  [  1  ]  .  split  (  ' '  )  .  map  (  x  =>  parseInt  (  x  )  )  ;


        // Step 5: Calculate the cost of moving left from position X.
        // We iterate from X-1 down to 1.
        let   leftCost   =   0  ;
        for  (  let   i   =   X   -   1  ;  i   >   0  ;  i  --  )   {
            // Check if the current position 'i' is present in the list of marked positions 'Ms'.
            if  (  Ms  .  includes  (  i  )  )   {
                leftCost  ++  ; // Increment cost if it's a marked position.
            }
        }


        // Step 6: Calculate the cost of moving right from position X.
        // We iterate from X up to N-1.
        let   rightCost   =   0  ;
        for  (  let   i   =   X  ;  i   <   N  ;  i  ++  )   {
            // Determine if 'i' is a marked position.
            if  (  Ms  .  includes  (  i  )  )   {
                rightCost  ++  ; // If so, increment the right cost.
            }
        }


        // Step 7: Output the minimum of the two calculated costs.
        // This is the final result of the problem.
        console  .  log  (  Math  .  min  (  leftCost  ,  rightCost  )  )  ;

}  ; // End of the main function.


// --- Entry Point for Script Execution ---
// This line reads the entire content of standard input synchronously
// using Node.js's built-in 'fs' module and passes it to the 'main' function.
main  (  require  (  "fs"  )  .  readFileSync  (  "/dev/stdin"  ,  "utf8"  )  )  ;