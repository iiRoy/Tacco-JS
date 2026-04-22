/* This ensures strict mode for the JavaScript code execution. */
"use strict"

// Define a factory function to create an input reader object.
const   create   =   (   )   =>   {
    /* Read input from standard input, decode as UTF-8, remove leading/trailing whitespace,
     * and split into an array of lines. */
    const   input   =   require   (   "fs"   )   .   readFileSync   (   "/dev/stdin"   ,   "utf8"   )   .   trim   (   )   .   split   (   "\n"   )   ;

    // Construct the result object which acts as an iterator over the input lines.
    const   res   =   {
        "list"      :   input   ,   // Store the array of input lines.
        "index"     :   0       ,   // Current position in the input array.
        "max"       :   input.length, // Total number of input lines.

        // Method to check if there are more elements to read.
        "hasNext"   :   function   (   )   {
            return   this   .   index   <   this   .   max
        }   ,

        // Method to get the next element from the input array.
        "next"      :   function   (   )   {
            // Check if there are no more elements.
            if   (   !   this   .   hasNext   (   )   )   {
                // Throw an error if attempting to read beyond the array bounds.
                throw   "ArrayIndexOutOfBoundsException"   ;
            }   else   {
                // Return the current element and then increment the index.
                return   this   .   list   [   this   .   index   ++   ]   ;
            }
        }
    }   ;

    // Return the created input reader object.
    return   res   ;
}

// Create an instance of the input reader.
const   o   =   create   (   )   ;

// Helper function to get the next line as a string.
const   next   =   (   )   =>   o   .   next   (   )

// Helper function to get the next line as an integer.
const   nextInt   =   (   )   =>   parseInt   (   o   .   next   (   )   )

// Helper function to get the next line as an array of strings, split by space.
const   nextStrArray   =   (   )   =>   o   .   next   (   )   .   split   (   " "   )

// Helper function to get the next line as an array of integers, split by space.
const   nextIntArray   =   (   )   =>   o   .   next   (   )   .   split   (   " "   )   .   map   (   el   =>   parseInt   (   el   )   )

// Helper function to get the next line as an array of characters.
const   nextCharArray   =   (   )   =>   o   .   next   (   )   .   split   (   ""   )

// Helper function to check if there is more input available.
const   hasNext   =   (   )   =>   o   .   hasNext   (   )

// Helper function for console output.
const   myout   =   (   ...   x   )   =>   console   .   log   (   ...   x   )

// The main function where the program logic resides.
const   Main   =   (   )   =>   {
    // Read the target integer 'x' from input.
    const   x   =   nextInt   (   )

    // Initialize time counter.
    let     time    =   0

    // Initialize a queue with the starting position.
    let     q       =   [   0   ]

    // Loop while the queue is not empty. This simulates a BFS-like search.
    while   (   q   .   length   >   0   )   {
        // Increment time for each level of the search.
        time   ++

        // Store the current size of the queue for this level.
        let     ql   =   q   .   length

        // Process all elements at the current time level.
        for   (   let   i   =   0   ;   i   <   ql   ;   i   ++   )   {
            // Dequeue the current location.
            let     loc   =   q   .   shift   (   )

            // Check if either of the possible new locations matches the target 'x'.
            if   (   loc   -   time   ==   x   ||   loc   +   time   ==   x   )   {
                // If a match is found, print the current time and terminate.
                console   .   log   (   time   )
                return
            }

            // Enqueue the new possible locations for the next time step.
            q   .   push   (   loc   -   time   )   // Move 'time' steps left
            q   .   push   (   loc   +   time   )   // Move 'time' steps right
            q   .   push   (   loc   )           // Stay at the current location
        }
    }
}

// Invoke the main function to start the program execution.
Main   (   )