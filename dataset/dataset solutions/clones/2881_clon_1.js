var    GET   =  (  function (   )   {
    /* Private helper function 'f' to create a new instance of 'g' */
    function   f   (   s   )   {

        return   new   g (   s   )   ;
    }

    // Constructor function 'g' to process input string
    function   g   (   s   )   {
        /* Stores the input string split by newlines, trimmed */
        this._s   =   s .   trim (   ) .   split (   "\n"   )   ;
        // Current line index
        this._y   =   0   ;
    }

    /*
     * Prototype method 'a' (advance)
     * Retrieves the next item from the current line, or the next line if current is exhausted.
     * Optionally converts to number.
     */
    g .   prototype .   a   =   function   (   f   )   {
        var   s   =   this .   _s   ,
              y   =   this .   _y   ,
              r   ;

        // If the current line hasn't been split and reversed yet, do it
        if   (   typeof   s [   y   ]   ===   "string"   )
        {
            s [   y   ]   =   s [   y   ] .   split (   " "   ) .   reverse (   )   ;
        }

        // Pop the last element (which was the first before reversing)
        r   =   s [   y   ] .   pop (   )   ;

        // If the current line is now empty, advance to the next line
        if   (   !   s [   y   ] .   length   )
        {
            this .   _y   ++   ;
        }

        // Return as string if 'f' is true, otherwise convert to number
        return   f   ?   r   :   +   r   ;
    }   ;

    /*
     * Prototype method 'l' (line)
     * Retrieves an entire line, splits it by spaces.
     * Optionally converts elements to numbers.
     */
    g .   prototype .   l   =   function   (   f   )   {
        // Get the current line, split it, and advance the line index
        var   s   =   this .   _s [   this .   _y   ++   ] .   split (   " "   )   ;

        // Return as strings if 'f' is true, otherwise map to numbers
        return   f   ?   s   :   s .   map (   a   =>   +   a   )   ;
    }   ;

    /*
     * Prototype method 'm' (matrix)
     * Retrieves 'n' lines, splits each by spaces, forming a matrix.
     * Optionally converts all elements to numbers.
     */
    g .   prototype .   m   =   function   (   n   ,   f   )   {
        // Slice 'n' lines from the input, map each to an array of strings
        var   r   =   this .   _s .   slice (   this .   _y   ,   this .   _y   +=   n   ) .   map (   a   =>   a .   split (   " "   )   )   ;

        // Return as string matrix if 'f' is true, otherwise map all elements to numbers
        return   f   ?   r   :   r .   map (   a   =>   a .   map (   a   =>   +   a   )   )   ;
    }   ;

    /*
     * Prototype method 'r' (rows)
     * Retrieves 'n' raw lines.
     * Optionally converts each line (as a whole) to a number.
     */
    g .   prototype .   r   =   function   (   n   ,   f   )   {
        // Slice 'n' lines from the input
        var   r   =   this .   _s .   slice (   this .   _y   ,   this .   _y   +=   n   )   ;

        // Return as raw strings if 'f' is true, otherwise map each to a number
        return   f   ?   r   :   r .   map (   a   =>   +   a   )   ;
    }   ;

    // Return the public interface 'f' (which is the GET function itself)
    return   f   ;
}   ) (   )   ;

// Initialize 'o' by reading input from stdin using the GET utility
var   o   =   GET (   require (   "fs"   ) .   readFileSync (   "/dev/stdin"   ,   "utf8"   )   )   ;


/*
 * Helper function to create multi-dimensional arrays initialized with a value or expression.
 * The value 'v' is evaluated for each element.
 */
function   xArray (   v   )   {
    var   a   =   arguments   ,
          l   =   a .   length   ,
          r   =   "Array(a["   +   --   l   +   "]).fill(0).map(x=>{return "   +   v   +   ";})"   ;

    // Build the array creation string for each dimension
    while   (   --   l   )
    {
        r   =   "Array(a["   +   l   +   "]).fill(0).map(x=>"   +   r   +   ")"   ;
    }

    // Evaluate the constructed string to create the array
    return   eval (   r   )   ;
}

// Execute the main logic and print the result to console
console .   log (   main (   )   )   ;


/*
 * Main function containing the core logic of the program.
 * It processes input data 'n' and 'x', performs calculations,
 * sorts data, and uses a binary search approach.
 */
function   main (   )   {
    // Read 'n' and 'x' from the input
    var   n   =   o .   a (   )   ;
    var   x   =   o .   a (   )   ;

    // Read a matrix 'b' of 'n' rows
    var   b   =   o .   m (   n   )   ;

    // Initialize sum 's'
    var   s   =   0   ;

    // Loop through each row of 'b'
    for   (   var   i   =   0   ;   i   <   n   ;   i   ++   )   {
        // Calculate 't' based on elements in 'b[i]'
        var   t   =   b [   i   ] [   0   ]   *   b [   i   ] [   1   ]   ;

        // Calculate 'a' based on 'x' and elements in 'b[i]'
        var   a   =   (   x   -   b [   i   ] [   0   ]   )   *   b [   i   ] [   2   ]   ;

        // Add 't' to the total sum 's'
        s   +=   t   ;

        // Push calculated values 'a', 't', and their sum 'a+t' to the current row 'b[i]'
        b [   i   ] .   push (   a   ,   t   ,   a   +   t   )   ;
    }

    // Sort the 'b' array based on the 6th element (index 5) in descending order
    b .   sort (   (   a   ,   b   )   =>   b [   5   ]   -   a [   5   ]   )   ;

    // Initialize binary search bounds
    var   ok   =   n   *   x   ,
          ng   =   -   1   ;

    // Perform binary search
    while   (   ok   -   ng   >   1   )   {
        // Calculate the middle point
        var   m   =   Math .   floor (   (   ok   +   ng   )   /   2   )   ;

        // Initialize 'u' and 'k' for the current iteration
        var   u   =   s   ,
              k   =   m   ;

        // Iterate through 'b' array while 'k' and 'u' are positive
        for   (   var   i   =   0   ;   i   <   n   &&   k   >   0   &&   u   >   0   ;   i   ++   )   {
            // If 'x' is less than or equal to 'k'
            if   (   x   <=   k   )
            {
                // Deduct from 'u' and 'k'
                u   -=   b [   i   ] [   5   ]   ;
                k   -=   x   ;
            }
            else
            {
                // Nested loop for a more complex deduction logic
                for   (   var   v   =   u   ;   i   <   n   &&   v   >   0   ;   i   ++   )
                {
                    v   =   u   ; // Reset 'v' to 'u' at the start of each inner iteration (this seems like a potential logic error or a very specific intent)

                    if   (   k   <   b [   i   ] [   0   ]   )
                    {
                        v   -=   b [   i   ] [   1   ]   *   k   ;
                    }
                    else
                    {
                        v   -=   b [   i   ] [   4   ]   +   (   k   -   b [   i   ] [   0   ]   )   *   b [   i   ] [   2   ]   ;
                    }
                }
                // Update 'u' and reset 'k' after the nested loop
                u   =   v   ;
                k   =   0   ;
            }
        }

        // Adjust binary search bounds based on 'u'
        if   (   u   >   0   )
        {
            ng   =   m   ;
        }
        else
        {
            ok   =   m   ;
        }
    }

    // Return the final 'ok' value
    return   ok   ;
}