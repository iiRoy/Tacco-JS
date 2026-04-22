/*
 * This JavaScript file processes input data from standard input.
 * It's designed to identify a "winner" based on a specific counting algorithm
 * applied to sequences of numbers or identifiers.
 * The script reads line by line, processes each sequence, and outputs
 * either the winning element and its position, or "TIE".
 */

// Import the 'fs' (file system) module, which is standard in Node.js environments.
// It's used here to synchronously read the entire content of '/dev/stdin'.
var  input =  require  (  'fs'  )  .  readFileSync  (  '/dev/stdin'  ,  'utf8'  )  ;

// Process the raw input string:
// 1. Trim any leading or trailing whitespace (like a final newline).
// 2. Split the string into an array of individual lines, using the newline character as a delimiter.
var arr = input . trim ( ) . split ( "\n" ) ;


// This is the main processing loop of the script.
// It continues as long as the first element of 'arr' (after being shifted off)
// is not equal to the numeric value 0. This element typically represents the
// number of items in the subsequent line, or a sentinel value to stop processing.
while  (  arr . shift ( )  !=  0  )
{
    // Inside the loop, extract the next line from 'arr'.
    // This line contains space-separated elements which are then split into an array 'a'.
    var   a = arr . shift ( ) . split ( " " ) ;

    // Initialize a boolean flag. It will be set to 'true' if a clear winner is found
    // within the current sequence being processed.
    var   flag = false ;

    // Create an empty JavaScript object. This 'obj' will be used as a hash map
    // to store the frequency (count) of each unique element encountered in array 'a'.
    var   obj = { } ;


    // Begin an iterative loop through each element of the array 'a'.
    // The variable 'i' serves as the index for the current element.
    for  (  var  i = 0  ;  i < a . length  ;  i ++  )
    {
        // Increment the count for the current element 'a[i]' in the 'obj' map.
        // The '|| 1' part ensures that if 'obj[a[i]]' is undefined (first encounter),
        // it's initialized to 1, otherwise, its existing count is incremented.
        obj [ a [ i ] ] = obj [ a [ i ] ] + 1  ||  1 ;

        // Declare a new empty array 's'. This array will temporarily hold
        // [count, element_value] pairs, useful for sorting.
        var   s = [ ] ;

        // Iterate over the properties (keys) of the 'obj' object.
        // For each key 'k' (which represents an element from array 'a'),
        // push an array containing its count and the element itself into 's'.
        for  (  var  k  in  obj  )
        {
            s . push ( [ obj [ k ] , k ] ) ;
        }

        // Sort the 's' array. The sorting function compares the first elements of the inner arrays (the counts).
        // It sorts in descending order of counts, meaning the element with the highest count comes first.
        s . sort (  function ( a , b )
        {
            // This comparison returns true if a[0] (count of 'a') is less than b[0] (count of 'b'),
            // effectively pushing 'a' after 'b' if 'a' has a smaller count.
            return  a [ 0 ]  <  b [ 0 ] ;
        }  ) ;

        // This conditional block handles a specific edge case:
        // If there's only one unique element found so far (meaning s.length is 1),
        // we assign a dummy second element `[0]` to `s[1]`. This is crucial for
        // the subsequent comparison, ensuring `s[1][0]` is defined as 0 for a fair check.
        if  (  s . length  ==  1  )
        {
            s [ 1 ] = [ 0 ] ;
        }

        // This is the core logic for determining if a winner has emerged.
        // It checks if the count of the leading element (s[0][0]) is strictly greater than
        // the sum of:
        // 1. The count of the second leading element (s[1][0]).
        // 2. The number of remaining elements in the current sequence 'a' that are yet to be processed.
        //    (a.length - (i + 1) calculates the remaining items).
        if  (  s [ 0 ] [ 0 ]  >  s [ 1 ] [ 0 ]  +  a . length  -  ( i + 1 )  )
        {
            // If the condition is met, a winner is declared.
            // Log the winning element (s[0][1]) and the current position (i + 1).
            console . log ( s [ 0 ] [ 1 ] , i + 1 ) ;

            // Set the 'flag' to true to indicate that a winner has been found.
            flag = true ;

            // Exit the current 'for' loop immediately, as the winner is identified.
            break ;
        }
    } // End of the 'for' loop that iterates through elements of 'a'.

    // After the 'for' loop completes, check the 'flag'.
    // If 'flag' is still 'false', it means no winner was determined during the iteration,
    // indicating a tie for the current sequence.
    if  (  flag  ==  false  )
    {
        console . log ( "TIE" ) ; // Output "TIE" to standard output.
    }

} // End of the main 'while' loop.

// The script finishes execution once the 'while' loop condition is no longer met.