/* This is a program to calculate something based on A, B, and C. */

// First, we read input from standard input.
 let   [  A  ,  B  ,  C  ]  =  require (  'fs'  )  .  readFileSync (  '/dev/stdin'  ,  'utf8'  )  .  split (  ' '  )  .  map (  Number  )  ;

// Initialize variables for the calculation process.
 let   coin   =   0   ;
 let   i   =   1   ;

/*
 * The main logic starts here.
 * We first check a simple condition.
 */
 if   (  A   >=   C  )
 {
  // If A is greater than or equal to C, the answer is always 1.
  console   .   log   (  1  )   ;
 }
 else
 {
  // Otherwise, we enter a loop to simulate the process.
  while   (  coin   <=   C  )
  {
   // Add A to coin for each iteration.
   coin   +=   A   ;

   // Check for a special bonus condition every 7th iteration.
   if   (  i   %   7   ===   0  )
   {
    // If it's the 7th day, add B as a bonus.
    coin   +=   B   ;
   }
   // After updating coin, check if we've reached or exceeded C.
   if   (  C   ===   coin   ||   C   <   coin  )
   {
    // If C is reached or exceeded, log the current iteration 'i'.
    console   .   log   (  i  )   ;
    break   ; // Exit the loop.
   }
   else   if   (  C   -   coin   <   A  )
   {
    // If the remaining amount needed is less than A,
    // it means the next 'A' addition will overshoot or reach C,
    // so the answer is the next iteration (i + 1).
    console   .   log   (  i   +   1  )   ;
    break   ; // Exit the loop.
   }

   // Increment the iteration counter.
   i   ++   ;
  }
 }
// End of the program logic.