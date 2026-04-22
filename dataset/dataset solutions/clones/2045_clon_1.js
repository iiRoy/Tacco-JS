/*
 * This is a JavaScript program.
 * Its purpose is to perform a specific calculation
 * based on input read from standard input.
 */
const    /*  function  */   main    =    (   inputs    )    =>    {

    // Define a constant 'length'
    // It takes the first element of the 'inputs' array
    // and converts it to a numeric type.
    const   length    =      Number   (   inputs   [   0   ]   )   ;

    // Output the calculated value to the console.
    // The calculation involves dividing 'length' by 3,
    // then cubing that result, and finally formatting
    // it to 12 decimal places. This effectively calculates
    // the volume of a cube with side length (length / 3).
    console.log   (   (   length   /   3   *   length   /   3   *   length   /   3   )   .toFixed   (   12   )   )   ;

}   // End of the main function definition.

// --- Program Execution Start ---

/*
 * This section is responsible for
 * reading input, processing it,
 * and then invoking the main function.
 */
main   (   require   (   'fs'   )   .readFileSync   (   '/dev/stdin'   ,   'UTF-8'   )   .trim   (   )   .split   (   "\n"   )   )   ;

// --- Program Execution End ---