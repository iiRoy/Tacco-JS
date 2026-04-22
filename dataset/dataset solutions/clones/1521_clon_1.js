/*
 * This is a Type I clone of a JavaScript program.
 * It demonstrates how to achieve visual difference
 * while maintaining exact structural and logical equivalence.
 *
 * This particular script processes a single integer argument
 * and prints 0 if the integer is truthy (non-zero),
 * or 1 if it's falsy (zero).
 */

const    main    =    (    arg    )    =>    {
  // Declare a constant variable 'x'.
  // Its value is the integer parsed from the input 'arg'.
  const    x    =    parseInt    (    arg    )    ;


  // Use a ternary operator to decide the output.
  // If 'x' is truthy (e.g., a non-zero number), log 0.
  // Otherwise (if 'x' is 0 or NaN), log 1.
  console    .    log    (    x    ?    0    :    1    )    ;

}    ;    // End of the main function definition.

// This section reads input from standard input
// and passes it to the 'main' function.
// It uses Node.js 'fs' module.
main    (    require    (    'fs'    )    .    readFileSync    (    '/dev/stdin'    ,    'utf8'    )    )    ;