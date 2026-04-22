a = [ ] , m = n = c = 0 ; // Initialize array 'a' and variables 'm', 'n', 'c' to zero.

// Use 'require' to load the 'fs' (file system) module.
// Read the content from standard input ('/dev/stdin') using UTF-8 encoding.
require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" )

    // Split the entire input string into an array of substrings, using a space as the delimiter.
    . split ( ' ' )

    // Iterate over each individual item 'i' obtained from the split operation.
    . map ( function ( i )
        {
            // This is a nested ternary operator structure.
            // First condition: Check if 'a[i]' (the count of item 'i') is truthy (i.e., not undefined or 0).
            a [ i ]
            ?
                // If 'a[i]' exists, increment its value.
                // Second condition: Check if the incremented 'a[i]' is greater than 'm' (maximum frequency).
                ++ a [ i ] > m
                ?
                    // If the new count is greater than 'm', update 'm' to the new count.
                    // Also, simultaneously update 'n' to store the current item 'i' as the one with max frequency.
                    m = a [ n = i ]
                :
                    // If the new count is not greater than 'm', do nothing (represented by '0').
                    0
            :
                // If 'a[i]' does not exist (first time encountering item 'i'), initialize its count to 1.
                a [ i ] = 1
            ;

            // This is another ternary operator.
            // Check if the length of the current item 'i' is greater than the length of the current longest string 'c'.
            i . length > c . length
            ?
                // If 'i' is longer, update 'c' to be the current item 'i'.
                c = i
            :
                // If 'i' is not longer, do nothing (represented by '0').
                0
            ;
        }
    ) ; // End of the map() function call.

// Output the value of 'n' (the number with the highest frequency)
// and 'c' (the longest string found), separated by a space, to the console.
console . log ( n + ' ' + c ) ;