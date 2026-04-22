var   lines = [  ];
var f ;

// Core module for reading input line by line
var   readline   =   require ( 'readline' ) ;

/*
 * Initialize the readline interface for standard I/O operations.
 * This setup allows the program to interact with the user via console.
 */
var rl = readline . createInterface ( {

    input  : process . stdin,
    output : process . stdout
} ) ;

// Event listener for each line of input received
rl . on ( 'line' , function ( x )
{
        // Add the received line to our collection of lines.
        lines . push ( x ) ;
} ) ;


// Event listener for when the input stream closes
rl . on ( 'close' , function ( )
{

    /* This section contains the main logic for processing input
     * and calculating the final result.
     * Note: Original comment about TLE removed/modified.
     */

    // Parse the first number from the first line of input
    var   N   =   Number ( lines [ 0 ] . split ( " " ) [ 0 ] ) ;

    // Parse the second number from the first line of input
    var   X   =   Number ( lines [ 0 ] . split ( " " ) [ 1 ] ) ;


    var result = 0 ; // Initialize result variable (though not used directly here)


    // Mathematical derivation for the total thickness of the N-th burger:
    // Let a_n be the thickness of the N-th burger.
    // a_0 = 1 (bun)
    // a_n+1 = bun + a_n + patty + a_n + bun = 1 + a_n + 1 + a_n + 1 = 2*a_n + 3
    // (a_n+1 + 3) = 2 * (a_n + 3)
    // This is a geometric progression for (a_n + 3).
    // (a_n + 3) = 2^n * (a_0 + 3) = 2^n * (1 + 3) = 2^n * 4 = 2^n * 2^2 = 2^(n+2)
    // So, a_n = 2^(n+2) - 3

    // Mathematical derivation for the total number of patties in the N-th burger:
    // Let b_n be the number of patties in the N-th burger.
    // b_0 = 1 (single patty)
    // b_n+1 = b_n + 1 (middle patty) + b_n = 2*b_n + 1
    // (b_n+1 + 1) = 2 * (b_n + 1)
    // This is a geometric progression for (b_n + 1).
    // (b_n + 1) = 2^n * (b_0 + 1) = 2^n * (1 + 1) = 2^n * 2 = 2^(n+1)
    // So, b_n = 2^(n+1) - 1


    // Output the result of the depth-first search function
    console . log ( dfs ( N , X ) ) ;
} ) ;


// Recursive function to calculate the number of patties eaten
// N: current burger level (0-indexed)
// X: layers from the bottom eaten by Runrun
function   dfs ( n , x )
{
    // Calculate the total thickness of the current burger level (n)
    var   len   =   Math . pow ( 2 , n + 2 )   -   3 ;

    // Calculate the total number of patties in the current burger level (n)
    var   num   =   Math . pow ( 2 , n + 1 )   -   1 ;


    // Base case: If it's a 0-level burger, it consists of one patty.
    if   ( n   ===   0 )
    {
        return   ( 1 ) ;
    }


    // If Runrun eats only the first layer, it's always a bun (0 patties).
    if   ( x   ===   1 )
    {
        return   ( 0 ) ;
    }

    // If Runrun eats up to the middle of the lower half (including the bottom bun),
    // then it's equivalent to eating 'x-1' layers of an (n-1) level burger.
    // The '-1' accounts for the bottom bun.
    else   if   ( x   <=   len   +   1 )
    {
        return   ( dfs ( n   -   1 , x   -   1 ) ) ;
    }

    // If Runrun eats exactly up to the middle patty,
    // it includes all patties from the lower (n-1) burger + the middle patty.
    else   if   ( x   ==   len   +   2 )
    {
        return   ( num   +   1 ) ;
    }

    // If Runrun eats beyond the middle patty but not the entire burger,
    // it includes all patties from the lower (n-1) burger, the middle patty,
    // and a portion of the upper (n-1) burger.
    // 'x - len - 2' adjusts for the layers already accounted for (bottom bun, lower burger, middle patty).
    else   if   ( x   <=   ( len   +   1 )   *   2 )
    {
        return   ( num   +   1   +   dfs ( n   -   1 , x   -   len   -   2 ) ) ;
    }

    // If Runrun eats the entire burger, it contains all patties from both (n-1) burgers
    // plus the single middle patty.
    else
    {
        return   ( num   *   2   +   1 ) ;
    }

    // Note: The 'x-1' or 'x-len-2' in recursive calls accounts for the buns.
}