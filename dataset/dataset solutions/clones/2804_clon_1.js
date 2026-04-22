/*
 * This is a Type I clone of the original JavaScript code.
 *
 * The purpose of this program is to calculate the total taste of a
 * set of apples, after removing the single apple whose individual
 * taste value is closest to zero.
 *
 * This version features extensive changes to whitespace and comments
 * to demonstrate a Type I clone, while preserving the exact logic
 * and structure of the original source code.
 */
"use strict" ; // Enforce strict mode for cleaner and safer JavaScript execution.


// The primary function that orchestrates the entire logic.
// It takes the raw input string as its sole argument.
const   main    =   arg   =>   {
  // Step 1: Prepare the input data.
  // First, remove any leading or trailing whitespace from the input string.
  // Then, split the string into an array of lines based on the newline character.
  arg   =   arg . trim() . split( "\n" ) ;


  // Step 2: Parse the initial parameters N (number of apples) and L (base taste).
  // These values are expected to be on the first line of the input, separated by a space.
  const   N   =   parseInt(   arg[0] . split( " " )[0]   ) ; // N: Total count of apples.
  const   L   =   parseInt(   arg[0] . split( " " )[1]   ) ; // L: A base value influencing apple taste.


  // Step 3: Initialize a dynamic array (list) to store the taste value of each apple.
  let list = [ ] ;


  // Step 4: Calculate the individual taste for each apple and populate the list.
  // The taste formula for the i-th apple (1-indexed) is L + (i+1) - 1, which simplifies to L + i.
  for  (  let   i = 0  ;  i  <  N  ;  i++  )  {
    // The taste calculation. parseInt(i) is redundant here as i is already a number,
    // but preserving the original expression for Type I cloning.
    let   taste   =   (   L   +   (   parseInt(i)   +   1   )   )   -   1   ;

    // Add the computed taste value to our list of apple tastes.
    list . push(   taste   ) ;
  }


  // Step 5: Prepare for finding the apple to remove.
  // Calculate the initial total sum of all apple tastes.
  let max = list . reduce(   (m,n)   =>   m+n   ) ;

  // Initialize 'min' to a very large number to ensure the first comparison succeeds.
  // This will hold the minimum absolute taste value found so far.
  let min = Infinity ;

  // 'target' will store the index of the apple that has the taste closest to zero.
  let target ;


  // Step 6: Iterate through the list to identify which apple to remove.
  // We want to remove the apple whose taste value is closest to zero.
  for  (  let   i = 0  ;  i  <  N  ;  i++  )  {
    // 'temp' represents the sum of tastes if the current apple (list[i]) were removed.
    let   temp   =   max   -   list[i]   ;

    // 'abs' calculates the absolute value of the current apple's taste.
    // The original code's expression `Math.abs(max - temp)` simplifies to `Math.abs(list[i])`.
    let   abs    =   Math . abs(   max   -   temp   ) ;


    // Check if this apple's absolute taste is closer to zero than any we've seen so far.
    if  (  abs   <   min  )  {
      // If it is, update 'min' with this new minimum absolute taste.
      min   =   abs   ;

      // And record the index of this apple as our current 'target' for removal.
      target   =   i   ;
    }
  }


  // Step 7: Remove the identified apple from the list.
  // The 'splice' method modifies the array in place.
  list . splice(   target,   1   ) ;


  // Step 8: Calculate and output the final sum of tastes for the remaining apples.
  // Use 'reduce' again to sum the elements of the modified list.
  console . log(   list . reduce(   (m,n)   =>   m+n   )   ) ;
} ;


// This line handles reading the input from standard input (/dev/stdin)
// and passes it to the 'main' function to begin execution.
main(   require('fs') . readFileSync('/dev/stdin',   'utf8')   ) ;