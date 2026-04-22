"use strict" /* This directive enforces stricter parsing and error handling in the code. */ ;

/*
 * This JavaScript module provides utilities for reading input from stdin
 * and contains the main logic to solve a specific programming problem.
 * It's structured with an input reader and a computational function.
 */

// Function definition to create an input stream utility object.
const   create  =   (   )   =>  {
    // Read the entire standard input stream, assuming UTF-8 encoding.
    // Then, remove leading/trailing whitespace and split the content into an array of lines.
    const   input   =   require (   "fs"    )   .   readFileSync (   "/dev/stdin"    ,   "utf8"    )   .   trim (   )   .   split (   "\n"    )   ;

    // Construct the input reader object 'res'.
    const   res     =   {
        "list"      :   input           ,   /* The array of input lines. */
        "index"     :   0               ,   /* Current position in the input array. */
        "max"       :   input . length  ,   /* Total number of lines in the input array. */

        // Method to check if there are more lines to read.
        "hasNext"   :   function (   )   {
            return  this    .   index   <   this    .   max
        }   ,

        // Method to retrieve the next line from the input.
        "next"      :   function (   )   {
            // If no more elements, throw an error to prevent out-of-bounds access.
            if  (   !   this    .   hasNext (   )   )   {
                throw   "ArrayIndexOutOfBoundsException"    ;
            }
            // Otherwise, return the current line and then increment the index.
            else    {
                return  this    .   list    [   this    .   index   ++  ]   ;
            }
        }
    }   ;

    // Return the fully configured input reader object.
    return  res ;
}   ;

// Initialize a global instance of the input reader.
const   o   =   create (   )   ;

/*
 * Define a set of convenience functions for reading different types of input
 * using the 'o' (input reader) instance.
 */

// Reads the next raw string token from the input.
const   next        =   (   )   =>  o   .   next (   )   ;

// Reads the next token and parses it as an integer.
const   nextInt     =   (   )   =>  parseInt (   o   .   next (   )   )   ;

// Reads the next token, splits it by spaces, and returns an array of strings.
const   nextStrArray    =   (   )   =>  o   .   next (   )   .   split (   " "    )   ;

// Reads the next token, splits it by spaces, and maps each part to an integer, returning an array of numbers.
const   nextIntArray    =   (   )   =>  o   .   next (   )   .   split (   " "    )   .   map (   el  =>  parseInt (   el   )   )   ;

// Reads the next token and splits it into an array of individual characters.
const   nextCharArray   =   (   )   =>  o   .   next (   )   .   split (   ""    )   ;

// Checks if there are more elements available in the input stream.
const   hasNext     =   (   )   =>  o   .   hasNext (   )   ;

// A custom output function that logs arguments to the console.
const   myout       =   (   ... x   )   =>  console . log (   ... x   )   ;

/**
 * Calculates the number of times 'n' needs to be doubled until it exceeds 'k'.
 * This is a core calculation function for the problem.
 *
 * @param {number} n - The initial value.
 * @param {number} k - The threshold value.
 * @returns {number} The count of doublings.
 */
const   calc    =   (   n   ,   k   )   =>  {
    let cnt =   0   ; // Initialize a counter for the doubling operations.
    // Continue doubling 'n' as long as it is not greater than 'k'.
    while   (   n   >   k   )   {
        n   *=  2   ; // Double the value of 'n'.
        cnt ++  ; // Increment the counter for each doubling.
    }
    return  cnt ; // Return the total count of doublings.
}   ;


// The main function where the primary logic of the program is executed.
const   Main    =   (   )   =>  {
    // Read two integers, N and K, from the input using the helper function.
    const   [   N   ,   K   ]   =   nextIntArray (   )   ;

    let ans =   0   ; // Initialize the variable to store the final answer.

    // Loop from 1 up to N (inclusive).
    for (   let i   =   1   ;   i   <=  N   ;   i   ++  )   {
        // Calculate the doubling count for the current value of 'i' against 'K'.
        const   cnt =   calc (   i   ,   K   )   ;

        // Accumulate the result based on the problem's specific formula:
        // (1/N) multiplied by (0.5 raised to the power of 'cnt').
        ans +=  1   /   N   *   (   0.5 **  cnt   )   ;
    }

    // Print the final calculated answer to the console.
    console . log (   ans   )   ;
}   ;

// Execute the main function to begin the program's execution flow.
Main (   )   ;