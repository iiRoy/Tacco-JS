/* This directive enforces strict mode, helping to write cleaner code. */
'use strict'

// The main function processes the input and calculates a count.
const main = ( input ) => {

    // Split the input string by spaces and convert each part to a number.
    const arr = input . split ( ' ' ) . map ( v => Number ( v ) ) ;

    // Extract the starting value from the array.
    const st = arr [ 0 ] ;

    // Extract the ending value from the array.
    const ed = arr [ 1 ] ;

    // Extract the step/divisor value from the array.
    const n = arr [ 2 ] ;


    let cnt = 0 ; // Initialize a counter variable.

    // Loop from the start value to the end value.
    for ( let i = st ; i <= ed ; i ++ ) {

        // Check if the current number 'i' is divisible by 'n'.
        if ( i % arr [ 2 ] === 0 ) {

            // If divisible, enter a nested loop.
            // This loop increments 'j' by 'n' and updates 'i' to 'j'.
            for ( let j = i ; j <= ed ; j += n ) {

                cnt ++ ; // Increment the counter.

                i = j ; // Update 'i' to 'j' to effectively "skip" numbers
                        // that have already been counted or are part of this sequence.
            }
        }
    }

    // Output the final calculated count to the console.
    console . log ( cnt ) ;
}

// Read input from standard input and pass it to the main function.
main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;