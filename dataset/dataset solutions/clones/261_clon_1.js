/*
 * This is a Type I clone of the original JavaScript code.
 * All identifiers, operators, and expressions are strictly preserved.
 * Only whitespace and comments have been altered significantly
 * to create a visually distinct, yet functionally identical, version.
 */

function    perm    (   xs  ,   n   ,   s   ,   callback  )
{  // Function to generate permutations
    var
    x   ,   i   ,   len =   xs  .   length  ;
    s   =   s   ||  [   ]   ;   // Initialize s if not provided

    if  (   n   === 0   )
    {
        callback    (   s   )   ;   // Base case: permutation complete
    }
    else
    {
        for (   i   =   0   ;   i   <   len   ;   i   ++  )
        {   // Loop through elements
            x   =   xs  .   shift (   )   ;   // Remove first element
            s   .   push  (   x   )   ;   // Add to current permutation

            perm    (   xs  ,   n   -   1   ,   s   ,   callback    )   ;   // Recursive call

            s   .   pop (   )   ;   // Backtrack: remove last element from s
            xs  .   push    (   x   )   ;   // Backtrack: add x back to xs (at the end)
        }
    }
} // End of perm function

function    main    (   )
{   // Main processing function for input lines
    input   .   forEach (   function    (   line    )
    {
        var
        n   ,   s   ,
        r   =   0   ;   // Initialize result counter

        if  (   line    .   trim    (   )   === ''  )
            return  ;   // Skip empty lines

        line    =   line    .   split   (   ' ' )   .   map (   parseFloat  )   ;   // Parse numbers from line
        n   =   line    [   0   ]   ;
        s   =   line    [   1   ]   ;

        perm    (   [   0   ,   1   , 2   , 3   , 4   , 5   , 6   , 7   , 8   , 9   ]   ,   n   ,   [   ]   ,   function    (   xs  )
        {   // Generate permutations of digits 0-9
            r   +=  xs  .   reduce  (   function    (   m   ,   x   ,   i   )
            {   // Calculate sum of (digit * position)
                return  m   +   x   *   (   i   +   1   )   ;
            }   ,   0   )   === s   ?   1   :   0   ;   // Increment r if sum matches s
        }   )   ;

        console .   log   (   r   )   ;   // Output the count
    }   )   ;
} // End of main function

var
input   =   ''  ;   // Global variable to store input data

process .   stdin   .   resume    (   )   ;   // Keep the process alive
process .   stdin   .   setEncoding (   'utf8'  )   ;   // Set input encoding

process .   stdin   .   on  (   'data'  ,   function    (   chunk   )
{   // Event listener for incoming data
    input   +=  chunk   ;   // Append chunk to input
}   )   ;

process .   stdin   .   on  (   'end'   ,   function    (   )
{   // Event listener for end of input stream
    input   =   input   .   split (   '\n'    )   ;   // Split input into lines
    main    (   )   ;   // Call the main processing function
}   )   ;