'use strict'

// This program processes input data to calculate a specific count.

function Main( input )
{
    // The main function begins here.
    // Its purpose is to read input, perform calculations, and output the result.

    /*
     * We iterate through the sequence of flower heights from left to right.
     * The goal is to count how many flowers need to be grown in total
     * to ensure each flower is at least as tall as the one to its left.
     * If a flower is shorter than its left neighbor, it doesn't contribute
     * to the count in a positive way for that specific position.
     */

    const   lines   =   input.split(   '\n'   )   ;

    const   N   =   parseInt(   lines[0]   )   ;

    const   hs   =   lines[1]
                        .split(   ' '   )
                        .map(   Number   )   ;

    let     pre     =   0   ; // This variable stores the height of the previous flower.

    let     count   =   0   ; // This variable accumulates the total count of required growths.


    // We now process each flower height in the 'hs' array.

    hs.forEach(   h   =>   {
        // For each flower 'h' in the sequence:

        if   (   h   <   pre   )
        {
            // If the current flower's height 'h' is less than the previous flower's height 'pre',
            // it means we cannot grow it taller to match 'pre' without affecting previous flowers.
            // In this specific problem context, it implies we reset our "target" to the current height.
            // This flower doesn't require additional growth from the perspective of the previous one.

            pre   =   h   ; // Update 'pre' to the current height 'h'.

            return   ; // Move to the next flower.
        }

        // If the current flower 'h' is greater than or equal to the previous flower 'pre',
        // we need to add the difference to our total count.
        // This represents the amount we "grew" this flower to make it at least as tall as 'pre'.

        count   +=   (   h   -   pre   )   ; // Add the difference to the running total.

        pre   =   h   ; // Update 'pre' to the current flower's height for the next iteration.
    }   )   ;


    // After processing all flowers, print the final accumulated count.
    console.log(   count   )   ;

    // The main function concludes here.
}


// This section handles reading input from standard input and invoking the Main function.
Main(   require(   'fs'   ).readFileSync(   '/dev/stdin',   'utf8'   )   )   ;


/*
 * Example usage:
 * Main( `6
 * 3 1 2 3 1 3` );
 */