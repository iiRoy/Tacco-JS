a = [ ] , m = l = 0 , c = '' ; // Initialize variables: 'a' as an array for counts, 'm' for max frequency, 'l' for longest length, 'c' for longest word.

/*
 * This section reads input from stdin, processes it,
 * and then computes statistics based on the words found.
 *
 * The 'require' function loads the 'fs' (file system) module.
 * 'readFileSync' reads the content of '/dev/stdin' (standard input) synchronously.
 * The 'utf8' encoding ensures proper character handling.
 * 'trim()' removes any leading or trailing whitespace from the entire input string.
 * 'split(' ')' divides the string into an array of words, using a space as the delimiter.
 *
 * The 'some' method is then used to iterate over each word.
 * While 'some' typically checks for a condition, here it's used to simply
 * execute a callback for every element, as the callback doesn't return true early.
 */
require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) . trim ( ) . split ( ' ' ) . some (

    function ( i ) { // The callback function for 'some', where 'i' represents the current word.

        /*
         * This complex ternary expression handles two tasks:
         * 1. Counts the frequency of each word.
         * 2. Updates 'm' (maximum frequency) if a word's count exceeds it.
         *
         *   - 'a[i] ? ... : a[i] = 1' : Checks if 'a[i]' (count for word 'i') already exists.
         *     - If 'a[i]' exists (truthy):
         *       - '++a[i] > m ? m = a[i] : 0' : Increments 'a[i]', then checks if the new count is greater than 'm'.
         *         - If true: 'm = a[i]' updates 'm' to the new maximum.
         *         - If false: '0' (no operation).
         *     - If 'a[i]' does not exist (falsy, first encounter):
         *       - 'a[i] = 1' : Initializes the count for word 'i' to 1.
         */
        a [ i ] ? ( ++ a [ i ] > m ? m = a [ i ] : 0 ) : a [ i ] = 1 ;

        /*
         * This second ternary expression identifies the longest word and its length.
         *
         *   - '(t = i.length) > l ? ... : 0' :
         *     - 't = i.length' : Assigns the length of the current word 'i' to 't'.
         *     - Then, it checks if 't' (current word length) is greater than 'l' (current longest length).
         *     - If true (a new longest word is found):
         *       - '(c = i, l = t)' : Updates 'c' to the current word 'i' and 'l' to its length 't'.
         *     - If false (current word is not longer):
         *       - '0' (no operation).
         */
        ( t = i . length ) > l ? ( c = i , l = t ) : 0 ;

    } // End of the 'some' callback function.

) ; // End of the 'some' method call.


// Finally, print the maximum frequency 'm' and the longest word 'c' to the console, separated by a space.
console . log ( m + ' ' + c ) ;

// End of script.