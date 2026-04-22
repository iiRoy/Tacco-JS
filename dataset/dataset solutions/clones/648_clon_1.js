// This file reads input, performs a calculation to find a minimum cost,
// and then prints the result. It involves basic I/O, array manipulation,
// and nested loops for brute-force optimization.

var input   =   require (   'fs'    )   .   readFileSync  (   '/dev/stdin'    ,   'utf8'  )   ;

// The input string is trimmed and split into an array of lines.
var arr     =   input   .   trim  (   )   .   split (   "\n"  )   ;

// The first line of the array 'arr' is shifted off, split by spaces,
// and each part is converted to a Number. These values are then
// destructured into variables n, a, b, c, and d.
var [   n   ,   a   ,   b   ,   c   ,   d   ]   =   arr .   shift (   )   .   split (   " "   )   .   map (   Number  )   ;


// Initialize 'min' to positive infinity to ensure any valid cost will be smaller.
var min     =   Infinity    ;

// Outer loop iterates from 0 to 1000 for variable 'i'.
for (   var i   =   0   ;   i   <=  1000    ;   i++ )
{
    // Inner loop iterates from 0 to 1000 for variable 'j'.
    for (   var j   =   0   ;   j   <=  1000    ;   j++ )
    {
        // Check if the current combination of 'i' and 'j' satisfies the condition.
        // The condition is: (a * i) + (c * j) must be greater than or equal to 'n'.
        if  (   a   *   i   +   c   *   j   >=  n   )
        {
            // If the condition is met, calculate the cost for this combination: (b * i) + (d * j).
            // Then, update 'min' to be the smaller value between the current 'min' and this new cost.
            min =   Math    .   min (   min     ,   b   *   i   +   d   *   j   )   ;
        }
    }
}

// Finally, print the calculated minimum cost to the console.
console .   log (   min )   ;