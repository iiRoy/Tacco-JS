"use strict" ;

// This program identifies the common characters present in a list of input strings,
// determining the minimum frequency for each character across all strings.
// The final output is a string composed of these common characters, repeated by their minimum frequency.

const   main  =  arg  =>   {

        // Step 1: Pre-process the raw input string.
        // First, remove any leading or trailing whitespace.
        // Then, split the string into an array of individual lines.
        arg   =   arg . trim ( ) . split ( "\n" ) ;

        // Step 2: Extract the number of strings (N) from the first line of input.
        // The `parseInt` function converts the string representation of N to an integer.
        const N = parseInt( arg[0] ) ;

        // Step 3: Isolate the actual data strings.
        // The `slice` method creates a new array containing strings from the second line
        // up to (and including) the N-th string.
        const S = arg . slice ( 1, N + 1 ) ;

        // Step 4: Initialize a reference array containing all lowercase English alphabets.
        // This array will be used to iterate through each possible character.
        const alphabets = "abcdefghijklmnopqrstuvwxyz" . split ( "" ) ;

        // Step 5: Prepare an empty array to accumulate the characters for the final answer.
        let answer = [ ] ;

        // Step 6: Begin the main processing loop.
        // Iterate through each character in the `alphabets` array.
        for ( let i in alphabets )
        {
                // For the current alphabet character, initialize a variable `contains`.
                // This variable will store the minimum count of the current character found
                // across all input strings. It's initialized to `Infinity` to ensure
                // the first comparison with `Math.min` correctly sets its value.
                let contains = Infinity ;

                // Step 6.1: Inner loop to check the current alphabet character against each input string.
                for ( let j in S )
                {
                        // Count occurrences of the current `alphabets[i]` character within the string `S[j]`.
                        // The string is split into an array of characters, then filtered to count matches.
                        let cnt = S[j] . split ( "" ) . filter ( n => n === alphabets[i] ) . length ;

                        // Conditional check: If the character was found in the current string...
                        if ( cnt > 0 )
                        {
                                // Update `contains` to be the minimum of its current value
                                // and the count `cnt` from the current string.
                                contains = Math . min ( cnt , contains ) ;
                        }
                        else
                        {
                                // If the character was *not* found in the current string (cnt is 0),
                                // then this character cannot be common to all strings.
                                // Set `contains` to 0 and break out of this inner loop,
                                // as further checks for this character are unnecessary.
                                contains = 0 ;
                                break ;
                        }
                }

                // Step 6.2: After checking all strings for the current alphabet character,
                // append it to the `answer` array `contains` number of times.
                for ( let j = 0 ; j < contains ; j ++ )
                {
                        answer . push ( alphabets[i] ) ;
                }
        }

        // Step 7: Join all characters in the `answer` array into a single string
        // and print this final result to the console (standard output).
        console . log ( answer . join ( "" ) ) ;

} ; // End of the 'main' function definition.

// Initial call to the `main` function.
// It reads the entire content of `/dev/stdin` (standard input) as a UTF-8 string
// using Node.js's file system module and passes it to `main`.
main ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ;