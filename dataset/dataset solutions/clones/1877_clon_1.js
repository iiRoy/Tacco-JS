"use   strict"
/* This is a Type I clone of the original JavaScript code.
 * It maintains exact logical and structural equivalence,
 * with only variations in whitespace and comments.
 * Extensive changes have been made for visual distinctiveness. */


var    input   =   require (   "fs"   ) .   readFileSync   (   "/dev/stdin"   ,   "utf8"   )   ;   // Reads all input from stdin
var    cin     =   input.split  (  / |\n/  )  ,   cid   =   0   ;   // Splits input into an array 'cin', initializes cursor 'cid'


// Function to read the next value from the input array.
// 'a' parameter determines if it should be returned as a string or number.
function   next (  a  )
{
    return   a
        ?   cin   [   cid++   ]
        :   +   cin   [   cid++   ]   ;
}


/*
 * Function to read 'n' consecutive values from the input array.
 * If 'a' is true, returns strings; otherwise, parses them as numbers.
 */
function   nexts   (   n   ,   a   )
{
    return   a
        ?   cin   .   slice   (   cid   ,   cid   +=   n   )
        :   cin   .   slice   (   cid   ,   cid   +=   n   )   .   map   (   a   =>   +   a   )   ;
}


/**
 * Reads a 2D array (matrix) of dimensions h x w from the input.
 * If 'a' is true, elements are strings; otherwise, they are numbers.
 * @param {number} h - Height of the matrix.
 * @param {number} w - Width of the matrix.
 * @param {boolean} a - Flag for string (true) or number (false) elements.
 * @returns {Array<Array<any>>} The 2D array.
 */
function   nextm   (   h   ,   w   ,   a   )
{
    var   r   =   [  ]   ,   i   =   0   ;   // Initialize result array and counter
    if   (   a   )
    {
        for   (   ;   i   <   h   ;   i++   )
        {
            r   .   push   (   cin   .   slice   (   cid   ,   cid   +=   w   )   )   ;
        }
    }
    else
    {
        for   (   ;   i   <   h   ;   i++   )
        {
            r   .   push   (   cin   .   slice   (   cid   ,   cid   +=   w   )   .   map   (   a   =>   +   a   )   )   ;
        }
    }
    return   r   ;
}


/* This function dynamically creates a multi-dimensional array
 * initialized with a given value 'v'.
 * The dimensions are passed as additional arguments.
 */
function   xArray   (   v   )
{
    var   a   =   arguments   ,   l   =   a   .   length   ,   r   =   "Array(a["   +   --l   +   "]).fill().map(x=>{return "   +   v   +   ";})"   ;
    while   (   --l   )
    {
        r   =   "Array(a["   +   l   +   "]).fill().map(x=>"   +   r   +   ")"   ;   // Builds the array creation string
    }
    return   eval   (   r   )   ;   // Executes the string to create the array
}


// Call the main function and store its result.
var   myOut   =   main   (   )   ;

// If main returns a value, print it to the console.
if   (   myOut   !==   undefined   )
{
    console   .   log   (   myOut   )   ;
}


// Main logic of the program.
function   main   (   )
{
    var   n   =   next   (   )   ;   // Read the first integer 'n'
    var   k   =   BigInt   (   next   (   )   )   ;   // Read 'k' as a BigInt
    var   a   =   nexts   (   n   )   ;   // Read 'n' integers into array 'a'
    var   map   =   xArray   (   -1   ,   n   )   ;   // Initialize a map array of size 'n' with -1
    var   x   =   0   ;   // Starting position
    map   [   0   ]   =   0   ;   // Mark the starting position as visited at step 0

    // Loop 'k' times to simulate movement
    for   (   var   i   =   1   ;   i   <=   k   ;   i++   )
    {
        x   =   a   [   x   ]   -   1   ;   // Move to the next position

        // Check if the current position 'x' has been visited before
        if   (   map   [   x   ]   >=   0   )
        {
            // A cycle is detected. Calculate cycle length and remaining steps.
            var   r   =   i   -   map   [   x   ]   ;   // 'r' is the length of the cycle
            k   -=   BigInt   (   i   )   ;   // Subtract steps already taken to reach cycle
            k   %=   BigInt   (   r   )   ;   // Calculate remaining steps within the cycle

            // Perform the remaining 'k' steps within the cycle
            for   (   var   i   =   1   ;   i   <=   k   ;   i++   )   x   =   a   [   x   ]   -   1   ;
        }
        map   [   x   ]   =   i   ;   // Mark current position 'x' with the current step 'i'
    }
    return   x   +   1   ;   // Return the final position (1-indexed)
}