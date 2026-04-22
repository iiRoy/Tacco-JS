// This JavaScript file contains the main logic for processing a specific problem.
// It adheres to standard competitive programming practices for input/output.

const    main    =    (   input   )    =>
{

    // Pre-process the raw input string.
    // First, remove any leading or trailing whitespace.
    // Then, split the string into an array of lines based on the newline character.
    input    =    input . trim (  ) . split (  '\n'  )


    // The first line of input typically contains the count or size 'n'.
    // Parse this line as an integer, using base 10 for safety.
    let    n    =    parseInt (   input [ 0 ]   ,    10   )


    // The second line contains space-separated numbers.
    // Split this line by spaces, then convert each resulting string to a Number.
    // Finally, sort these numbers in descending order (from largest to smallest).
    const    nums    =    input [ 1 ] . split (   ' '   ) . map (   Number   ) . sort (   (   a   ,   b   )    =>    b    -    a   )


    // Initialize the variable 'ans' which will accumulate our final result.
    let    ans    =    0


    // Iterate from 'i' equals 1 up to, but not including, 'n'.
    // This loop structure is crucial for the problem's logic.
    for    (   let    i    =    1   ;    i    <    n   ;    i++   )    ans    +=    nums [ Math . floor (   i    /    2   ) ]
    // Inside the loop, we add an element from the 'nums' array to 'ans'.
    // The index is calculated by dividing 'i' by 2 and taking the floor (integer part).


    // After the loop completes, the 'ans' variable holds the final computed value.
    // Print this value to the standard output (console) and return the result of console.log.
    return    console . log (   ans   )
}


// This conditional statement handles the execution environment.
// If the 'MYTEST' environment variable is set, it calls a 'test()' function (presumably for unit testing).
// Otherwise, it reads the input from '/dev/stdin' (standard input), decodes it as UTF-8,
// and passes this content to the 'main' function for processing.
process . env . MYTEST    ?    test (  )    :    main (   require (   'fs'   ) . readFileSync (   '/dev/stdin'   ,   'utf8'   )   )

// End of file content.
// This section is purely for illustrative comments and does not contain executable code.