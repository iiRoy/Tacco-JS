/*
 * This JavaScript code has been transformed into a Type I clone.
 *
 * According to the definition of a Type I clone:
 * "Code fragments are exactly equal, except for possible variations
 * in whitespace and comments."
 *
 * Therefore, every identifier, variable name, function name, operator,
 * and expression within this file remains absolutely identical to the original.
 *
 * The only modifications are:
 * - Extensive changes to whitespace (indentation, spacing, and blank lines).
 * - Addition of numerous comments (both single-line and multi-line).
 *
 * The purpose of these changes is to make the code appear visually
 * distinct from its original form, while ensuring it is logically
 * and structurally equivalent in every functional aspect.
 */


    var     GET =   (   function    (   )   {


        /*
         * Helper function `f`:
         * This function serves as an entry point for creating
         * new instances of the `g` object, passing along the
         * initial string `s`.
         */
        function f  (s)
        {
            return  new g   (s)   ;
        }


        /**
         * Constructor function `g`:
         * Initializes a new object with an internal state derived
         * from the input string `s`. It processes `s` by trimming
         * whitespace and splitting it into an array of lines.
         *
         * @param {string} s - The input string to be processed.
         */
        function    g   (   s   )
        {
            // Store the processed lines. Trims `s` then splits by newline.
            this    .   _s  =   s   .   trim    (   )   .   split   (   "\n"    )   ;

            // Initialize the current line index to 0.
            this    .   _y  =   0   ;
        }


        // Method `a` for `g.prototype`: Reads and processes a single item.
        g   .   prototype   .   a   =   function    (   f   )
        {
            // Declare local variables for the current state and return value.
            var s   =   this    .   _s  ,
                y   =   this    .   _y  ,
                r   ;


            // If the current line is a string, it means it hasn't been processed yet.
            if  (   typeof  s   [   y   ]   === "string"    )
            {
                // Split the line by spaces and reverse it for easy `pop`ing.
                s   [   y   ]   =   s   [   y   ]   .   split   (   " "   )   .   reverse   (   )   ;
            }


            // Extract the last item from the current line (which is the first due to reverse).
            r   =   s   [   y   ]   .   pop   (   )   ;


            // If the current line is now empty, advance to the next line.
            if  (   !   s   [   y   ]   .   length  )
            {
                this    .   _y  ++  ;
            }


            // Return the item; if `f` is true, return as string, otherwise as number.
            return  f   ?   r   :   +   r   ;
        }   ;


        // Method `l` for `g.prototype`: Reads an entire line of items.
        g   .   prototype   .   l   =   function    (   f   )
        {
            // Get the current line, split it by spaces, and then increment the line pointer.
            var s   =   this    .   _s  [   this    .   _y  ++  ]   .   split   (   " "   )   ;


            // Return the array of items; if `f` is true, return as strings, otherwise as numbers.
            return  f   ?   s   :   s   .   map   (   a   =>  +   a   )   ;
        }   ;


        // Method `m` for `g.prototype`: Reads a matrix of `n` lines.
        g   .   prototype   .   m   =   function    (   n   ,   f   )
        {
            // Slice `n` lines from the input, increment the line pointer,
            // and then map each line to an array of strings by splitting.
            var r   =   this    .   _s  .   slice   (   this    .   _y  ,   this    .   _y  +=  n   )   .   map   (   a   =>  a   .   split   (   " "   )   )   ;


            // Return the matrix; if `f` is true, return as strings, otherwise as numbers.
            return  f   ?   r   :   r   .   map   (   a   =>  a   .   map   (   a   =>  +   a   )   )   ;
        }   ;


        // Method `r` for `g.prototype`: Reads `n` raw lines.
        g   .   prototype   .   r   =   function    (   n   ,   f   )
        {
            // Slice `n` lines directly from the input array, then increment the line pointer.
            var r   =   this    .   _s  .   slice   (   this    .   _y  ,   this    .   _y  +=  n   )   ;


            // Return the array of lines; if `f` is true, return as strings, otherwise as numbers.
            return  f   ?   r   :   r   .   map   (   a   =>  +   a   )   ;
        }   ;


        // The IIFE returns the `f` function, which is then assigned to `GET`.
        return  f   ;


    }   )   (   )   ; // End of the Immediately Invoked Function Expression.


    /*
     * Global variable `o`:
     * This variable is initialized by calling the `GET` function,
     * which in turn processes the content read from standard input.
     * The `fs` module is used to read the file synchronously.
     */
    var     o   =   GET (   require (   "fs"    )   .   readFileSync (   "/dev/stdin"    ,   "utf8"  )   )   ;


    // Log the result of the `main` function to the console.
    console .   log   (   main    (   )   )   ;


    /*
     * Function `main`:
     * This is the primary function where the application's core
     * logic resides. It reads an input string and checks for a
     * specific pattern related to the word "keyence".
     */
    function    main    (   )
    {
        // Read the first item from the input using the `o` object's `a` method.
        // The argument `1` indicates that the item should be treated as a string.
        var     s   =   o   .   a   (   1   )   ;


        // Define the target string pattern for comparison.
        var     x   =   "keyence"   ;


        // Initialize a result variable to "NO". This will be returned
        // if no matching pattern is found.
        var     N   =   "NO"    ;


        // Iterate through all possible split points of the target string `x`.
        // The loop runs from `i = 0` (no prefix removed) to `i = x.length` (no suffix removed).
        for (   var     i   =   0   ;   i   <=  x   .   length  ;   i   ++  )
        {
            // Construct a regular expression pattern:
            // "^"             - Start of the string
            // x.slice(0,i)    - The prefix of "keyence" up to index `i`
            // ".*"            - Any character (except newline) zero or more times
            // x.slice(i)      - The suffix of "keyence" starting from index `i`
            // "$"             - End of the string
            //
            // This checks if `s` can be formed by taking a prefix of "keyence",
            // followed by any characters, followed by the corresponding suffix of "keyence".
            if  (   s   .   match   (   "^" +   x   .   slice   (   0   ,   i   )   +   ".*"    +   x   .   slice   (   i   )   +   "$"   )   )
            {
                // If a match is found for any split point, immediately return "YES".
                return  "YES"   ;
            }
        }


        // If the loop completes without finding any matching pattern,
        // return the default negative result.
        return  "NO"    ;
    }