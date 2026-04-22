/*
 *  JavaScript Code Clone - Type I
 *  This file contains a Type I clone of an original JavaScript code snippet.
 *  Only whitespace and comments have been altered.
 *  All identifiers, keywords, operators, and expressions remain identical.
 */

//  Strict mode directive ensures cleaner code and helps catch common errors.
"use strict" ;


// This is the main entry point function for the application.
function   Main (   input   )
{
    // Initialize an Inputer instance to handle standard input parsing.
    let   cin   =   new   Inputer (   input   ) ;

    // Read the total number of queries (q) from the input.
    let   q   =   cin.getInt ( ) ;

    // Loop through each query provided in the input.
    for   (   let   i   =   0   ;   i   <   q   ;   i ++   )
    {
        // For each query, read two integer values, 'a' and 'b'.
        let   a   =   cin.getInt ( ) ,   b   =   cin.getInt ( ) ;

        // Conditional logic based on the relationship between 'a' and 'b'.

        // Case 1: If 'a' and 'b' are exactly equal.
        if   (   a   ==   b   )
        {
            // Output a specific calculation for this case.
            console.log (   2   *   a   -   2   ) ;
        }
        // Case 2: If 'a' and 'b' are consecutive integers (e.g., a=5, b=6 or a=6, b=5).
        else   if   (   a   +   1   ==   b   ||   b   +   1   ==   a   )
        {
            // Output a calculation involving the minimum of 'a' and 'b'.
            console.log (   2   *   Math.min (   a ,   b   )   -   2   ) ;
        }
        // Case 3: For all other relationships between 'a' and 'b'.
        else
        {
            // Calculate the product of 'a' and 'b'.
            let   ab   =   a   *   b   ;

            // Find the floor of the square root of 'ab'.
            let   d   =   Math.floor (   Math.sqrt (   ab   )   ) ;

            // Adjust 'd' if it's an exact square root.
            if   (   d   *   d   ==   ab   )
            {
                d --   ;
            }

            // Further conditional logic based on 'd' and 'ab'.
            if   (   d   *   (   d   +   1   )   >=   ab   )
            {
                // Output a calculation for this sub-case.
                console.log (   2   *   d   -   2   ) ;
            }
            else
            {
                // Output a calculation for the alternative sub-case.
                console.log (   2   *   d   -   1   ) ;
            }
        }
    }
}


// Definition of the Inputer class, designed to parse input strings efficiently.
class   Inputer
{
    // Constructor for the Inputer class.
    constructor   (   t   )
    {
        // Ensure that an input string is provided; it cannot be undefined.
        if   (   typeof   t   ==   'undefined'   )
            throw   new   Error (   '引数（stdin）を省略できません！'   ) ; // Error message in Japanese

        // Initialize a counter for tracking the current position in the input items.
        this.cnt   =   0   ;

        // Split the input string by newlines or spaces into an array of items.
        this.items   =   t.split (   /\n|\s/   ) ;
    }


    // Method to get the next integer from the input items array.
    getInt   (   )
    {
        // Return the current item as an integer and then increment the counter.
        return   this.items [   this.cnt ++   ]   -   0   ;
    }


    // Method to get an array of 't' integers from the input.
    getIntArray   (   t   )
    {
        // Ensure that the count of integers to retrieve is specified.
        if   (   typeof   t   ==   'undefined'   )
            throw   new   Error (   '引数（1以上）を省略できません！'   ) ; // Error message in Japanese

        // Create a new array to store the integers.
        let   r   =   new   Array (   t   ) ;

        // Populate the array by repeatedly calling getInt().
        for   (   let   e   =   0   ;   e   <   t   ;   e ++   )
            r [   e   ]   =   this.getInt ( ) ;

        // Return the array of integers.
        return   r   ;
    }


    // Method to get the next string from the input items array.
    getStr   (   )
    {
        // Return the current item as a string and then increment the counter.
        return   this.items [   this.cnt ++   ]   ;
    }


    // Method to get an array of 't' strings from the input.
    getStrArray   (   t   )
    {
        // Ensure that the count of strings to retrieve is specified.
        if   (   typeof   t   ==   'undefined'   )
            throw   new   Error (   '引数（1以上）を省略できません！'   ) ; // Error message in Japanese

        // Create a new array to store the strings.
        let   r   =   new   Array (   t   ) ;

        // Populate the array by repeatedly calling getStr().
        for   (   let   e   =   0   ;   e   <   t   ;   e ++   )
            r [   e   ]   =   this.getStr ( ) ;

        // Return the array of strings.
        return   r   ;
    }
}


// This block checks if the code is running in a Node.js-like environment (not a browser).
// If it's not in a browser, it reads input from stdin and passes it to the Main function.
if   (   typeof   window   ==   "undefined"   )
{
    // Read the entire standard input as a UTF-8 string.
    // Then, invoke the Main function with this input.
    Main (   require (   "fs"   ) . readFileSync (   "/dev/stdin" ,   "utf8"   )   ) ;
}

// End of Type I code clone.