/*
 * This JavaScript program serves as a Type I code clone example.
 *
 * According to the official definition of a Type I clone:
 * "Code fragments are exactly equal, except for possible variations
 * in whitespace and comments."
 *
 * This implies that every single identifier, variable name, function name,
 * operator, and expression must remain entirely unchanged from the original.
 * The only alterations permitted are in whitespace (such as indentation,
 * spacing between tokens, and the inclusion of blank lines) and comments
 * (which can be added, removed, or modified extensively).
 *
 * The goal is to make the resulting code visually distinct from the source,
 * while maintaining absolute logical and structural equivalence.
 */


// ---  Initialization Phase: Reading Input Data  ---

// First, we import the 'fs' (File System) module, which is necessary
// for interacting with the file system, including standard input in this context.
// The 'readFileSync' method is used to synchronously read the content
// of '/dev/stdin', which represents the standard input stream.
// The data is then decoded as 'utf8' and subsequently split into
// an array of strings, with each element representing a line from the input.
var    input    =    require ( 'fs' )
                     . readFileSync ( '/dev/stdin' ,    'utf8' )
                     . split ( '\n' )


// We extract the first element of the 'input' array.
// This element is expected to be a string representing an integer 'N'.
// The 'parseInt' function converts this string into its numerical equivalent.
// 'N' typically defines the size or range for subsequent data processing.
var    N    =    parseInt ( input [ 0 ] )


// An array named 'count' is declared and initialized.
// Its length is set to 'N', as determined from the input.
// The 'fill(0)' method ensures that all elements within this newly created
// array are set to the integer value zero. This array will act as a frequency
// counter for a series of numbers that will be processed later.
var    count    =    new    Array ( N ) . fill ( 0 )


// ---  Processing Phase: Counting Frequencies  ---

// We access the second line of the input, which is 'input[1]'.
// This line is expected to contain a sequence of numbers separated by spaces.
input [ 1 ]
    . split ( ' ' )                                                 // The string is first split into an array of string-numbers using space as a delimiter.
    . map ( Number )                                                // Each string element in the array is then transformed into its numerical representation.
    . forEach ( v    =>    {                                        // We then iterate over each number 'v' obtained from the previous step.
                                                                    // For each number 'v', we increment its corresponding counter in the 'count' array.
                                                                    // It's crucial to note that if the input numbers are 1-indexed (e.g., from 1 to N),
                                                                    // we must subtract 1 from 'v' to correctly access the 0-indexed 'count' array.
                                                                    count [ v - 1 ] ++
                                                                } )


// ---  Output Phase: Displaying Results  ---

// Finally, we iterate through the 'count' array from its beginning to its end.
count . forEach ( v    =>    {
                                // For each element 'v' in the 'count' array (which represents a frequency),
                                // 'console.log(v)' is invoked to print this value to the standard output.
                                // Each frequency will be displayed on a new line.
                                console . log ( v )
                            } )


// ---  End of Program Execution  ---