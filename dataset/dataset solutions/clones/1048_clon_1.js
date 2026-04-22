/*
 * This is a self-executing anonymous function that serves as the main entry point
 * for the program. It encapsulates all variables and functions within its scope,
 * preventing them from polluting the global namespace.
 */
(   function   main   (   )   {

    // Declare a variable 'lines' to store the input data.
    // It reads the content of '/dev/stdin' synchronously using Node.js 'fs' module,
    // decodes it as UTF-8, removes any leading or trailing whitespace (like a final newline),
    // and then splits the entire content into an array of strings, where each string is a line.
    let   lines   =   require   (   'fs'   )
                                    .   readFileSync   (   '/dev/stdin'   ,   'utf8'   )
                                    .   trim   (   )
                                    .   split   (   "\n"   )   ;

    // Destructure the first line of input to extract two numbers: 'n' and 'k'.
    // 'lines.shift()' removes and returns the first element of the 'lines' array.
    // This element (the first line) is then split by space characters,
    // and each resulting string part is converted into a numerical type using 'Number'.
    let   [   n   ,   k   ]   =   lines   .   shift   (   )
                                                .   split   (   ' '   )
                                                .   map   (   Number   )   ;

    // Convert the remaining lines in the 'lines' array into an array of numbers, 'w'.
    // Each line (which is now expected to be a single number) is mapped to its numerical representation.
    let   w   =   lines   .   map   (   Number   )   ;


    /*
     * Define a constant arrow function named 'canAllStack'.
     * This function determines how many items can be successfully stacked
     * into 'k' containers, given a maximum capacity 'p' for each container.
     *
     * @param {number} p - The maximum allowable weight capacity for a single container.
     * @returns {number} The total count of items that were successfully stacked across all containers.
     */
    const   canAllStack   =   (   p   )   =>   {
                                              // Initialize a counter for the items successfully stacked.
                                              let   cnt   =   0   ;

                                              // Iterate through each of the 'k' available containers.
                                              for   (   let   i   =   0   ;   i   <   k   ;   i ++   )
                                              {
                                                  // For the current container, try to stack items from the 'w' array.
                                                  // 'sum' tracks the current total weight in the container.
                                                  // 'w[++cnt]' increments 'cnt' *before* accessing the array,
                                                  // effectively moving to the next item in 'w' for each iteration.
                                                  for   (   let   sum   =   0   ;   sum   <=   p   ;   sum   +=   w   [   ++   cnt   ]   )
                                                  {
                                                      // If the total number of stacked items ('cnt')
                                                      // has reached 'n' (all items), then we've succeeded.
                                                      // Return the count immediately as no more checking is needed.
                                                      if   (   cnt   ===   n   )   return   cnt   ;
                                                  }
                                              }
                                              // If the loops complete without stacking all 'n' items,
                                              // return the current count of items that were stacked.
                                              return   cnt   ;
                                          }   ;


    // Calculate an initial estimated minimum capacity 'p'.
    // This is done by summing all weights in 'w' using 'reduce',
    // dividing by the number of containers 'k', and taking the floor.
    // This serves as a starting point for finding the optimal 'p'.
    let   p   =   Math   .   floor   (   w   .   reduce   (   (   a   ,   b   )   =>   a   +   b   )   /   k   )   ;

    // Increment 'p' and repeatedly call 'canAllStack' until it returns 'n'.
    // This 'while' loop iteratively searches for the smallest 'p' (by incrementing it)
    // for which all 'n' items can be successfully stacked into 'k' containers.
    while   (   canAllStack   (   ++   p   )   !==   n   )   ;

    // Once the loop terminates, 'p' holds the minimum capacity required.
    // Print this value to the standard output.
    console   .   log   (   p   )   ;

}   )   (   )   ;