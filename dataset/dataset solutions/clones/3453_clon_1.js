/*
 * This JavaScript file processes input data to generate formatted IDs.
 * It demonstrates array manipulation, mapping, sorting, and string formatting.
 * The script expects input from standard input, typically a list of numeric pairs.
 */

'use strict'; // Enforce strict mode for cleaner code and fewer errors, preventing common mistakes.


function   main(  input  )   { // The primary function responsible for orchestrating the entire processing flow.

    // Step 1: Normalize the input.
    // The raw input string is split into an array of individual lines.
    input  =  input.split(  '\n'  ) ;

    // The first line of input is removed. This is often done to discard
    // metadata like the total number of entries, if it's not needed for processing.
    input.shift(  ) ;


    // Step 2: Initialize a data structure to hold grouped and sorted values.
    let   count   =   [  ] ; // An array initialized to store related data, indexed by an ID.

    // Step 3: Process each line to populate the 'count' array.
    input   =   input
        .map(  c   =>   { // Iterate over each line 'c' of the input array.

            // For each line, split it by spaces and convert each resulting string
            // part into a numerical value using 'w - 0' coercion.
            let   arr   =   c.split(  ' '  ).map(  w   =>   w   -   0  ) ;

            // Check if an entry for the current ID (arr[0]) exists in the 'count' array.
            // If it's undefined, initialize it as a new empty array.
            if   (  count[  arr[  0  ]  ]   ===   undefined  )
                count[  arr[  0  ]  ]   =   [  ] ;

            // Add the second numerical value (arr[1]) to the list associated with arr[0].
            count[  arr[  0  ]  ].push(  arr[  1  ]  ) ;

            return   arr ; // Return the numerical array for further processing if needed.
        }  ) ;


    // Step 4: Sort the collected values.
    // For each non-empty sub-array within 'count', sort its elements numerically in ascending order.
    count.forEach(  v   =>   v.sort(  (  a,   b  )   =>   a   -   b  )  ) ;


    // Step 5: Generate and output the final formatted IDs.
    input   =   input.map(  c   =>   { // Re-iterate over the original processed input lines.

        // Construct the first part of the ID:
        // Convert the first number (c[0]) to a string (base 10),
        // pad it with leading zeros to ensure a total length of 6 characters.
        let   id   =   (  '000000'   +   c[  0  ].toString(  10  )  ).slice(  -6  ) ;

        // Construct the second part of the ID:
        // Find the 0-based index of the second number (c[1]) within its sorted group (count[c[0]]),
        // add 1 to make it 1-based, convert to string, and pad with leading zeros to 6 characters.
        id   +=   (  '000000'   +   (  count[  c[  0  ]  ].indexOf(  c[  1  ]  )   +   1  ).toString(  10  )  ).slice(  -6  ) ;

        console.log(  id  ) ; // Print the complete 12-character formatted ID to standard output.
    }  ) ;
}


// Entry point of the script:
// Read the entire content of standard input synchronously as a UTF-8 encoded string,
// and pass it to the 'main' function for processing.
main(  require(  'fs'  ).readFileSync(  '/dev/stdin',   'utf8'  )  ) ;