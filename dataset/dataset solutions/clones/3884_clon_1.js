"use strict" ;

/*
 * This is the main function that processes the input.
 * It calculates the maximum possible value based on
 * a series of operations involving arrays X and V,
 * first in a clockwise manner, then counter-clockwise.
 */
function Main ( input )
{
    let cin = new Inputer ( input ) ;

    // Read initial parameters: N (number of items) and C (circumference or total distance).
    let N = cin.getInt ( ) ;
    let C = cin.getInt ( ) ;

    // Initialize arrays X (positions) and V (values).
    // X[0] and V[0] are set to 0 as base cases.
    let X = new Array ( N + 1 ) ;
    X [ 0 ] = 0 ;

    let V = new Array ( N + 1 ) ;
    V [ 0 ] = 0 ;

    // Populate X and V arrays from input, starting from index 1.
    for ( let n = 1 ; n <= N ; n ++ )
    {
        X [ n ] = cin.getInt ( ) ;
        V [ n ] = cin.getInt ( ) ;
    }

    // Add C to the end of X array, possibly as a boundary or end point.
    X.push ( C ) ;


    /*
     * Calculation for the clockwise direction.
     * L represents the accumulated value when moving in one direction.
     */
    // Start of clockwise calculation block.
    let L = new Array ( N + 1 ) ;
    L [ 0 ] = 0 ; // Base case for accumulated value.

    for ( let n = 1 ; n <= N ; n ++ )
    {
        // Calculate L[n]: previous accumulated value + current item's value - distance moved.
        L [ n ] = L [ n - 1 ] + V [ n ] - ( X [ n ] - X [ n - 1 ] ) ;
    }

    // R represents accumulated value when moving in the opposite direction (or back).
    let R = new Array ( N + 1 ) ;
    R [ N ] = 0 ; // Base case for reverse accumulated value.

    for ( let n = N - 1 ; n >= 0 ; n -- )
    {
        // Calculate R[n] from N-1 down to 0.
        // It's the previous reverse accumulated value + next item's value - distance moved backwards.
        R [ n ] = R [ n + 1 ] + V [ n + 1 ] - ( X [ n + 2 ] - X [ n + 1 ] ) ;
    }

    // Initialize 'ans' with the smallest safe integer to ensure any valid sum is greater.
    let ans = Number.MIN_SAFE_INTEGER ;

    // Iterate through possible split points 'n' for clockwise path.
    for ( let n = 0 ; n <= N ; n ++ )
    {
        // Update 'ans' with the maximum value found so far (pure clockwise path up to n).
        ans = Math.max ( ans , L [ n ] ) ;

        // Iterate through possible split points 'm' for a return path (clockwise then anti-clockwise).
        for ( let m = n ; m < N ; m ++ )
        {
            // Calculate 's': accumulated value (L[n]) - cost to return from X[n] + reverse accumulated value (R[m]).
            let s = L [ n ] - X [ n ] + R [ m ] ;

            // Update 'ans' if 's' is greater.
            ans = Math.max ( ans , s ) ;
        }
    }


    /*
     * Calculation for the anti-clockwise direction.
     * This involves transforming the X and V arrays to simulate
     * moving in the opposite direction by changing coordinates.
     */
    // Transform X coordinates for anti-clockwise perspective.
    // Each X[n] becomes C - X[n].
    for ( let n = 0 ; n < X.length ; n ++ )
    {
        X [ n ] = C - X [ n ] ;
    }

    // Reverse the X array to align with the new perspective.
    X.reverse ( ) ;

    // Adjust V array: remove first element, add 0 at the end, then reverse.
    V.shift ( ) ;
    V.push ( 0 ) ;
    V.reverse ( ) ;

    // Recalculate L array for the new (anti-clockwise) perspective.
    L [ 0 ] = 0 ;
    for ( let n = 1 ; n <= N ; n ++ )
    {
        L [ n ] = L [ n - 1 ] + V [ n ] - ( X [ n ] - X [ n - 1 ] ) ;
    }

    // Recalculate R array for the new (anti-clockwise) perspective.
    R [ N ] = 0 ;
    for ( let n = N - 1 ; n >= 0 ; n -- )
    {
        R [ n ] = R [ n + 1 ] + V [ n + 1 ] - ( X [ n + 2 ] - X [ n + 1 ] ) ;
    }

    // Re-evaluate 'ans' with the anti-clockwise calculations.
    for ( let n = 0 ; n <= N ; n ++ )
    {
        ans = Math.max ( ans , L [ n ] ) ;
        for ( let m = n ; m < N ; m ++ )
        {
            let s = L [ n ] - X [ n ] + R [ m ] ;
            ans = Math.max ( ans , s ) ;
        }
    }

    // Output the final maximum answer.
    console.log ( ans ) ;
}

/*
 * Helper class for parsing input.
 * It splits the input string by newlines or spaces
 * and provides methods to get integers and strings.
 */
class Inputer
{
    constructor ( t )
    {
        // Ensure an input string is provided.
        if ( typeof t == 'undefined' )
            throw new Error ( '引数（stdin）を省略できません！' ) ;

        // Initialize counter and split input into items.
        this.cnt = 0 ;
        this.items = t.split ( /\n|\s/ ) ;
    }

    // Gets the next integer from the input stream.
    getInt ( )
    {
        return this.items [ this.cnt ++ ] - 0 ;
    }

    // Gets an array of 't' integers.
    getIntArray ( t )
    {
        if ( typeof t == 'undefined' )
            throw new Error ( '引数（1以上）を省略できません！' ) ;

        let r = new Array ( t ) ;
        for ( let e = 0 ; e < t ; e ++ )
            r [ e ] = this.getInt ( ) ;
        return r ;
    }

    // Gets the next string from the input stream.
    getStr ( )
    {
        return this.items [ this.cnt ++ ] ;
    }

    // Gets an array of 't' strings.
    getStrArray ( t )
    {
        if ( typeof t == 'undefined' )
            throw new Error ( '引数（1以上）を省略できません！' ) ;

        let r = new Array ( t ) ;
        for ( let e = 0 ; e < t ; e ++ )
            r [ e ] = this.getStr ( ) ;
        return r ;
    }
}

// Entry point for execution.
// If running in a Node.js environment (not a browser), read from stdin.
if ( typeof window == "undefined" )
    Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;