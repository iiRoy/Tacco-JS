/*
 * This JavaScript file contains a solution for a
 * problem involving simulating movement through towns.
 * The main function processes input to calculate the final
 * position after a certain number of steps,
 * handling cycles efficiently.
 */

// Define the primary function that processes the input data.
function   main (   input   )   {
   // Parse the input string into an array of lines.
   // First, remove leading/trailing whitespace, then split by newline.
   const   lines   =   input . trim ( ) . split ( "\n" ) ;


   // Extract N (number of towns, though not directly used after parsing K)
   // and K (number of steps) from the first line.
   // Split the first line by space.
   let   [ n ,   k ]   =   lines [ 0 ] . split ( ' ' ) ;

   // Convert N to a number.
   n   =   + n ;

   // Convert K to a BigInt to handle potentially very large step counts.
   k   =   BigInt ( k ) ;

   // Parse the second line to get the array of towns.
   // Each element indicates the next town to visit from the current index.
   const   towns   =   lines [ 1 ] . split ( ' ' ) . map ( Number ) ;



   // Initialize an array to keep track of visited positions and their order.
   const   visited   =   [ 0 ] ; // Start at town 0 (index 0).

   // Initialize the current position.
   let   pos   =   0 ;


   // Main loop: Simulate steps until K becomes 0.
   while   (   k   >   0   )   {
      // Move to the next town. Towns are 1-indexed in input, so adjust to 0-indexed.
      pos   =   towns [ pos ]   -   1 ;
      // Decrement the remaining steps.
      k -- ;

      // Check if the current position has been visited before.
      const   i   =   visited . indexOf ( pos ) ;

      // If the position has been visited, a cycle has been detected.
      if   (   i   !==   -1   )   {
         // Calculate the length of the cycle.
         const   cycle   =   BigInt ( visited . length   -   i ) ;

         // Optimize remaining steps using the cycle.
         while   (   k   >   0   )   {
            // If remaining steps are less than the cycle length,
            // simulate step by step within the cycle.
            if   (   k   <   cycle   )   {
               pos   =   towns [ pos ]   -   1 ;
               k -- ;
            }
            // Otherwise, reduce K by taking modulo of cycle length.
            // This effectively skips full cycles.
            else   {
               k   %=   cycle ;
            }
         }
      }
      // If the position has not been visited, add it to the visited list.
      else   {
         visited . push ( pos ) ;
      }
   }
   
   // After all steps are simulated, print the final position (1-indexed).
   console . log ( pos   +   1 ) ;
}


// Invoke the main function with input read from standard input.
// This is typical for competitive programming environments.
main (   require ( "fs" ) . readFileSync ( "/dev/stdin" ,   "utf8" )   ) ;