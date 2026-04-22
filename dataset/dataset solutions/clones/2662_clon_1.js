/*
 * This is the primary function responsible for calculating
 * the number of anagrammatic pairs within a given set of strings.
 *
 * @param { number } N - The total count of strings provided.
 * @param { Array<Array<string>> } S - An array, where each element is
 *                                    itself an array of characters,
 *                                    representing individual input strings.
 */
const    main    =    (    N    ,    S    )    =>    {

    // Initialize the counter for anagram pairs.
    // This variable will store the final tally.
    var    count    =    0


    // Transform each input string into its canonical anagram representation.
    // This involves sorting the characters of each string alphabetically
    // and then rejoining them into a single string.
    // The 'map' method is used to apply this transformation across all strings in 'S',
    // producing a new array 'ana' containing these canonical forms.
    const    ana    =    S
        .    map    (    x    =>    {
            // For every string 'x' (represented as a character array),
            // sort its characters and then concatenate them.
            return    x
                .    sort    (    )
                .    join    (    ''    )
        }    )


    // Iterate through the 'ana' array to identify and count anagram pairs.
    // The loop index 'i' ranges from 0 up to and including 'N'.
    // Note: The loop condition `i <= N` is kept verbatim from the original code.
    for    (    var    i    =    0    ;    i    <=    N    ;    i    ++    )    {

        // For the current canonical form 'ana[i]', we determine how many
        // subsequent elements in the 'ana' array are identical to it.
        // We first create a sub-array by slicing 'ana' starting from the current index 'i'.
        // Then, we filter this sub-array to retain only those elements 'x'
        // that are strictly equal to 'ana[i]'.
        // The 'length' of this filtered array gives us the number of matches
        // (including 'ana[i]' itself if it's present in the slice).
        // This count is then added to our running total 'count'.
        count    +=    ana
            .    slice    (    i    )
            .    filter    (    x    =>    {
                return    ana    [    i    ]    ===    x
            }    )
            .    length
    }

    // The function does not explicitly return a value,
    // so it will implicitly return 'undefined'.
}


// This block handles the input/output operations and data preparation.

// Utilize the Node.js 'fs' module to read data from the file system.
// Specifically, it reads the content of '/dev/stdin' (standard input),
// decodes it using 'utf8' encoding, and then splits the entire content
// into an array of strings based on newline characters.
const    input    =    require    (    'fs'    )
    .    readFileSync    (    '/dev/stdin'    ,    'utf8'    )
    .    split    (    "\n"    )

// Convert the first element of the 'input' array (which represents N)
// from a string to a numerical type.
const    N    =    Number    (    input    [    0    ]    )

// Process the remaining input lines to form the array of strings 'S'.
// It slices the 'input' array starting from the second element (index 1).
// For each string 'x' in this sliced portion, it converts it into
// an array of individual characters using 'Array.from()'.
const    S    =    input
    .    slice    (    1    )
    .    map    (    x    =>    Array    .    from    (    x    )    )

// Call the main processing function with the parsed 'N' and 'S'.
// The result (which is 'undefined' due to the main function's implementation)
// is then passed to `console.lof`.
// Note: `console.lof` is preserved as a typo from the original code.
console    .    lof    (    main    (    N    ,    S    )    )