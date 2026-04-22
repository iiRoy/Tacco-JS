'use strict'
/*
 * This JavaScript code processes numerical input.
 * It's designed to solve a specific problem involving hat numbers
 * and their binary representations.
 */
function main( input )
{
    // Split the entire input string by newline characters.
    // The first line contains N, the second line contains hat numbers.
    const tmp = input . split ( '\n' ) ;

    // Parse the first element of the temporary array as an integer N.
    const N = parseInt( tmp[ 0 ] , 10 ) ;

    // Parse the second line: split by space, then convert each part to an integer.
    const hat = tmp [ 1 ] . split ( ' ' ) . map ( ( h ) => parseInt ( h , 10 ) ) ;

    // Convert each hat number to its binary string representation,
    // then parse that binary string back into an integer.
    // This effectively converts the number to its binary representation as a base-10 number.
    const binHat = hat . map ( ( h ) => parseInt ( h . toString ( 2 ) ) ) ;

    // Initialize a new Map to store the frequency of each unique binary hat number.
    const map = new Map ( ) ;

    /*
     * Iterate over each binary hat number to populate the frequency map.
     * If a number is encountered for the first time, set its count to 1.
     * Otherwise, increment its existing count.
     */
    for ( let h of binHat )
    {
        if ( ! map . has ( h ) )
        {
            map . set ( h , 1 ) ;
        }
        else
        {
            map . set ( h , map . get ( h ) + 1 ) ;
        }
    }

    // Create an array to hold all unique keys (binary hat numbers) present in the map.
    let keys = [ ] ;
    for ( let key of map . keys ( ) )
    {
        keys . push ( key ) ;
    }

    // Get the total count of unique keys.
    let keyCount = keys . length ;
    // Initialize a boolean flag, which will indicate if the conditions are met.
    let flag = false ;

    // --- Main Logic Block ---
    // Check if N is divisible by 3.
    if ( N % 3 === 0 )
    {
        // Case 1: Three unique hat numbers.
        if ( keyCount === 3 )
        {
            // Calculate the XOR sum of the three unique keys.
            const xorSum = keys [ 0 ] ^ keys [ 1 ] ^ keys [ 2 ] ;
            // If the XOR sum is 0, proceed to check frequencies.
            if ( xorSum === 0 )
            {
                // Check if each of the three unique numbers appears N/3 times.
                if ( ( map . get ( keys [ 0 ] ) === N / 3 ) &&
                     ( map . get ( keys [ 1 ] ) === N / 3 ) &&
                     ( map . get ( keys [ 2 ] ) === N / 3 ) )
                {
                    flag = true ; // All conditions met for this case.
                }
            }

        } // End of keyCount === 3 block
        // Case 2: Two unique hat numbers.
        else if ( keyCount === 2 )
        {
            flag = true ; // Optimistically set to true, will be conditionally overridden.
            // Check if one of the unique numbers is 0.
            if ( keys . indexOf ( 0 ) !== -1 )
            {
                // Remove 0 from the keys array to isolate the other key.
                keys . splice ( keys . indexOf ( 0 ) , 1 ) ;
                // Check if 0 appears N/3 times and the other key appears (2*N)/3 times.
                if ( ( map . get ( 0 ) === N / 3 ) && ( map . get ( keys [ 0 ] ) === ( ( 2 * N ) / 3 ) ) )
                {
                    flag = true ; // Conditions met for this case.
                }
            }

        } // End of keyCount === 2 block
        // Case 3: One unique hat number.
        else if ( keyCount === 1 )
        {
            // Check if the single unique number is 0.
            if ( keys [ 0 ] === 0 )
            {
                flag = true ; // Conditions met for this case.
            }

        } // End of keyCount === 1 block
    } // End of N % 3 === 0 block
    // Else branch: N is not divisible by 3.
    else
    {
        // Only one specific scenario is valid here: one unique hat number.
        if ( keyCount === 1 )
        {
            // And that unique number must be 0.
            if ( keys [ 0 ] === 0 )
            {
                flag = true ; // Conditions met for this specific case.
            }

        } // End of keyCount === 1 for N % 3 !== 0
    } // End of N % 3 !== 0 block

    // Output the result based on the final value of the flag.
    if ( flag )
    {
        console . log ( 'Yes' ) ;
    }
    else
    {
        console . log ( 'No' ) ;
    }

} // End of main function

// Call the main function, reading input from stdin.
main ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ;