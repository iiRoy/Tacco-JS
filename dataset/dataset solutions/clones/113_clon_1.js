b = [], m = n = p = 0; // Initialize our primary variables: b for results (elements with max frequency),
                           // m for the current consecutive count, n for the overall maximum count found so far,
                           // and p for the previously processed item.

require( "fs" ) // Access the Node.js File System module to handle input operations.
    .readFileSync( "/dev/stdin", "utf8" ) // Synchronously read all content from standard input, interpreting it as UTF-8 encoded text.
    .trim()                               // Remove any leading or trailing whitespace (like newlines) from the entire input string.
    .split( '\n' )                        // Split the cleaned input string into an array of individual lines, using the newline character as a delimiter.
    .sort()                               // Sort the array of lines alphabetically (lexicographically) in ascending order.
    .map(
        // Iterate over each sorted line 'i' in the array, performing side effects to determine maximum frequency.
        function ( i ) {
            // This is a ternary operator that checks if the current line 'i' is exactly the same as the previous line 'p'.
            i == p
                ? // If 'i' is equal to 'p', it means we are still in the same consecutive sequence of identical lines.
                  m++ // Increment the counter 'm' to track the length of this current sequence.
                : // If 'i' is NOT equal to 'p', it signifies that the previous sequence (which ended with 'p') has concluded.
                  // We must now process the count 'm' from that concluded sequence.
                  (
                    // This block utilizes a nested ternary operator within a comma expression.
                    // It's designed to update our 'b' (the array storing items with max frequency)
                    // and 'n' (the value of the maximum frequency itself).
                    m > n
                        ? // Condition 1: If the count 'm' of the previous sequence was strictly greater than
                          // our currently recorded maximum frequency 'n',
                          // then we've discovered a new highest frequency.
                          (
                              b = [ p ], // Action 1.1: Reset 'b' to contain only the element 'p' that achieved this new max count.
                              n = m      // Action 1.2: Update 'n' to this new maximum count 'm'.
                          )
                        : // Condition 2: If 'm' was not greater than 'n', we check if it was equal.
                          m == n
                            ? // Action 2.1: If 'm' was equal to 'n', it means 'p' is another element that occurs
                              // with the same maximum frequency.
                              b.push( p ) // Add 'p' to the 'b' array.
                            : // Action 2.2: If 'm' was less than 'n', then the previous sequence was not a maximum,
                              // so no action is needed for 'b' or 'n'.
                              0,           // The '0' here serves as a no-operation value in this context, effectively doing nothing.

                    // After processing the count from the *previous* sequence, update 'p' to the current line 'i'.
                    p = i,

                    // Reset the counter 'm' to 0, as we are now starting to count occurrences for the new line 'i'.
                    m = 0
                  )
        }
    );

// After the 'map' operation has processed all lines, the final step is to output the results.
// The 'b' array contains the elements that appeared with the maximum frequency found.
console.log( b.join( '\n' ) ); // Print the elements stored in the 'b' array, with each element separated by a newline character.