/*
 * This JavaScript code processes a list of numbers from standard input.
 * It aims to count numbers that are not multiples of any smaller number in the list,
 * effectively finding numbers that are "unique" in a specific sense (related to prime factors).
 *
 * Type I Clone Requirements:
 * - Exact same identifiers, variable names, function names, operators, expressions.
 * - Extensive variations in whitespace (spaces, tabs, newlines).
 * - Extensive use of comments (add, remove, modify).
 */


  console  .  log (
    (
        args   =>    {
            // --- Input processing and initialization phase ---
            // The following line parses the input string:
            // 1. Trims whitespace.
            // 2. Splits by newline to get lines.
            // 3. Maps each line:
            //    a. Splits by space.
            //    b. Maps each resulting string to an integer using bitwise OR 0.
            // 4. Destructures the result into N (first element of first line) and A (second line as array).
            const    [    [ N ]    ,    A    ]    =    args    .    trim    (    )
            .    split    `\n`
            .    map    (    r    =>    r    .    split    ` `    .    map    (    v    =>    v    |    0    )    )    ;

            /*
             * Sort the array A in ascending order.
             * This is crucial for the algorithm's logic, as it processes smaller numbers first.
             */
            A    .    sort    (    (    a    ,    b    )    =>    a    -    b    )    ;

            // Determine the maximum value present in the sorted array A.
            // This maximum value defines the upper bound for the 'ex' boolean array.
            const    MAX    =    A    [    N    -    1    ]    ;


            // Initialize a boolean array 'ex' of size MAX + 1.
            // All elements are initially set to 'false'.
            // 'ex[k]' will be true if 'k' has been found to be a multiple of some A[i].
            const    ex    =    Array    (    MAX    +    1    )    .    fill    (    false    )    ;

            // Initialize a counter for the numbers that meet the specific criteria.
            let    count    =    0    ;


            // --- Main algorithm loop ---
            // Iterate through each element of the sorted array A.
            for    (    let    i    =    0    ;    i    <    N    ;    i    ++    )    {

                // Check if the current number A[i] has already been marked as a multiple
                // of a previously processed smaller number.
                if    (    ex    [    A    [    i    ]    ]    )
                {
                    // If it is already marked, then it's not a unique "base" number for this problem.
                    // Skip to the next iteration.
                    continue    ;
                }

                // If A[i] is NOT marked, it means it's a potential candidate.
                // Now, mark all its multiples in the 'ex' array.
                // This ensures that any subsequent occurrences of these multiples will be skipped.
                for    (    let    j    =    A    [    i    ]    ;
                             j    <=    MAX    ;
                             j    +=    A    [    i    ]    )
                {
                    ex    [    j    ]    =    true    ;    // Mark 'j' as a multiple.
                }

                /*
                 * After processing A[i] and marking its multiples,
                 * we check if A[i] is distinct from the next element A[i+1].
                 * If they are different, it means A[i] is a unique number
                 * (in the context of the sorted array and its distinctness).
                 * This is often used in problems to count distinct prime factors or similar.
                 */
                if    (    A    [    i    ]    !==    A    [    i    +    1    ]    )
                {
                    count    ++    ;    // Increment the counter.
                }

            }    // End of the main 'for' loop iterating through A.


            // --- Result formatting and return ---
            // The problem requires the final count to be returned as a string.
            return    `    ${    count    }    `    ;

        }    )    (    // End of the immediately invoked function expression (IIFE) definition.

            // This part handles reading the input from standard input using Node.js 'fs' module.
            require    (    'fs'    )    .    readFileSync    (    '/dev/stdin'    ,    'utf8'    )

        )    // End of IIFE invocation with input argument.
    )    ;    // End of console.log call.

// End of file.