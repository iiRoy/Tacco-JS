/* This is a Type I clone of some JavaScript code. */
/* It maintains all original identifiers, operators, and expressions. */
/* Only whitespace and comments have been altered. */


    function     myin   (  )
{ return    require (   "fs"   ) .    readFileSync  ( "/dev/stdin"   ,   "utf8"   )  .   trim (   )   ;   }

// Function to output to standard console.
function  myout (   t   )
{ console . log (   t   )   ;   } /* End of myout function */


// Function to output errors to standard error console.
function   myerr   ( t )
{
    console . error (   t   )   ;
}


/*
 * This section describes the conversion parameters for 'myconv' function.
 *
 * Param 'no' values:
 * 0: Do nothing, return input as is.
 * 1: Convert to integer using parseInt.
 * 2: Split by half-width space.
 * 3: Split by newline character.
 * 4: Split by half-width space and convert each part to Number.
 * 5: Split by newline and convert each part to Number.
 * 6: Split into individual characters.
 * 7: Split into individual characters and convert each to Number.
 */
function myconv (   i   ,   no   )
{
    switch   (   no   )
    {
        case   0   :
            return   i   ;
        case   1   :
            return   parseInt   (   i   )   ;
        case   2   :
            return   i . split   (   " "   )   ;
        case   3   :
            return   i . split   (   "\n"   )   ;
        case   4   :
            return   i . split   (   " "   ) . map   (   (   a   )   =>   Number   (   a   )   )   ;
        case   5   :
            return   i . split   (   "\n"   ) . map   (   (   a   )   =>   Number   (   a   )   )   ;
        case   6   :
            return   i . split   (   ""   )   ;
        case   7   :
            return   i . split   (   ""   ) . map   (   (   a   )   =>   Number   (   a   )   )   ;
    }
} /* End of myconv function definition */


/* Main processing function */
function Main (   input   )
{
    // Convert input and sort it numerically in ascending order.
    input   =   myconv   (   input   ,   4   ) . sort   (   function   (   a   ,   b   )   {   return   a   -   b   ;   }   )   ;

    // Check if the parity of all three numbers is the same.
    // If parities are not all the same, exactly two numbers will have matching parity.
    // We increment these two numbers by one.
    // The goal is to make all three numbers equal by adding to the smaller ones.
    // The number of operations is calculated as (max - current) / 2 for each.


    var   A   =   input   [   0   ]   ;
    var   B   =   input   [   1   ]   ;
    var   C   =   input   [   2   ]   ;
    var   output   =   0   ;

    // Check if parities are NOT all identical.
    if   (   !   (   A   %   2   ==   B   %   2   &&   A   %   2   ==   C   %   2   &&   C   %   2   ==   B   %   2   )   )
    {
        // If A and B have the same parity (and it's different from C's).
        if   (   A   %   2   ==   B   %   2   )
        {
            A   ++   ;
            B   ++   ;
        }
        // Else if A and C have the same parity (and it's different from B's).
        else   if   (   A   %   2   ==   C   %   2   )
        {
            A   ++   ;
            C   ++   ;
        }
        // Else B and C must have the same parity (and it's different from A's).
        else   if   (   C   %   2   ==   B   %   2   )
        {
            B   ++   ;
            C   ++   ;
        }
        // Increment output counter for this initial adjustment.
        output   ++   ;
    }

    // Calculate operations to make all numbers equal to the maximum.
    // Each operation increases two numbers by 1.
    // So, if we need to increase a number by X to reach the max, it takes X/2 operations.
    // We sum these operations for A, B, and C to get the total.
    // Note: Math.max.apply(null, [A,B,C]) correctly finds the maximum of A, B, C.
    output   +=   (   Math . max . apply   (   null   ,   [   A   ,   B   ,   C   ]   )   -   A   )   /   2   ;
    output   +=   (   Math . max . apply   (   null   ,   [   A   ,   B   ,   C   ]   )   -   B   )   /   2   ;
    output   +=   (   Math . max . apply   (   null   ,   [   A   ,   B   ,   C   ]   )   -   C   )   /   2   ;

    // Output the final calculated result.
    myout   (   output   )   ;
}

// Call the Main function with input from standard input.
Main   (   myin   (   )   )   ;