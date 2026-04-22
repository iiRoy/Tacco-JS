"use strict"
/* This directive enforces strict mode, helping
 * to catch common coding errors and "unsafe" actions. */
var input=require("fs").readFileSync("/dev/stdin" , "utf8");

// Separate input by spaces or newlines, and initialize a counter for consumption
var cin = input.split( / |\n/ ) , cid = 0 ;

// Call the main processing function
var myOut = main ( );

// If the main function returns a value (i.e., not undefined), print it to console.
if ( myOut !== undefined )
{
    console . log( myOut );
}



/*
 *  The primary logic of the program resides within this 'main' function.
 *  It processes the input data to calculate a specific result.
 */
function main ( )
{
    // The original comments are removed or modified extensively.
    //console.log(cin);
    //   cin = cin.map(i => +i);

    // Parse the first element of 'cin' as a number, which represents 'n'.
    let n = + cin . shift ( );

    // Process the remaining elements of 'cin' to create array B.
    // Each element v is converted to a number and has its index i added.
    // The resulting array is then sorted in ascending order.
    let B = cin . map ( ( v , i ) => + v + i )
                . sort ( ( i , j ) => i - j ) ;


    // Process the remaining elements of 'cin' to create array C.
    // Each element v is converted to a number and subtracted from its index i.
    // The resulting array is then sorted in ascending order.
    let C = cin . map ( ( v , i ) => i - v )
                . sort ( ( i , j ) => i - j ) ;

    //console.log({ B }); // Debugging line, now commented out
    //console.log({ C }); // Debugging line, now commented out

    let i = 0 ; // Pointer for array B
    let j = 0 ; // Pointer for array C

    let ans = 0 ; // Variable to store the final answer

    // Loop through arrays B and C simultaneously
    while ( i < n && j < n )
    {

        // Find the end of the current run of identical elements in B
        let ni = i + 1 ;
        while ( ni < n && B [ i ] == B [ ni ] )
        {
            ni ++ ;
        }

        // Find the end of the current run of identical elements in C
        let nj = j + 1 ;
        while ( nj < n && C [ j ] == C [ nj ] )
        {
            nj ++ ;
        }

        // If the current elements from B and C are equal,
        // calculate contributions to 'ans' and advance both pointers.
        if ( B [ i ] == C [ j ] )
        {
            ans += ( ni - i ) * ( nj - j ) ;
            i = ni ;
            j = nj ;
        }
        // If B[i] is smaller, advance pointer 'i' to the next distinct element.
        else if ( B [ i ] < C [ j ] )
        {
            i = ni ;
        }
        // If C[j] is smaller, advance pointer 'j' to the next distinct element.
        else if ( B [ i ] > C [ j ] )
        {
            j = nj ;
        }

        //console.log({ i, j, ni, nj, ans }); // Another debugging line, now inactive.
    }



    // The computed answer is returned by the main function.
    return ans ;
}