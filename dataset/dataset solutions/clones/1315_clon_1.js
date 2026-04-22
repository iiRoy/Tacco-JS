/*
 * This JavaScript code demonstrates character frequency counting and a string parsing utility.
 * It's structured as an Immediately Invoked Function Expression (IIFE)
 * followed by a separate helper function.
 */

(  function (   input   )
{
    // Initialize a lookup table (object acting as a map) for lowercase English alphabet characters.
    var    l    =    [ ]   ;

    // Populate the lookup table with all lowercase letters 'a' through 'z',
    // setting their initial counts to zero.
    for
    (
        var   i   =   'a' . charCodeAt ( 0 ) ;   /* Start ASCII value for 'a' */
        i   <=   'z' . charCodeAt ( 0 ) ;      /* End ASCII value for 'z' */
        i   ++
    )
    {
        l [ String . fromCharCode ( i ) ]   =   0 ;  // Assign initial count of 0
    }


    /*
     * Process the input string:
     * 1. Split it into individual characters.
     * 2. Iterate over each character.
     * 3. Convert the character to lowercase.
     * 4. If it's a lowercase English letter, increment its count in our lookup table.
     */
    input
        . split ( '' )
        . forEach (
            function (   e   )
            {
                e   =   e . toLowerCase ( ) ; // Normalize character to lowercase

                if   ( e   in   l ) // Check if the character is one of our tracked letters
                {
                    l [ e ] ++ ; // Increment the count for this character
                }
            }
        ) ;

    // Output the character counts.
    // 1. Get all keys (characters) from the lookup table 'l'.
    // 2. Map each key to a formatted string "key: count".
    //    Note: 'this' context is explicitly set to 'l' for the map callback.
    // 3. Join all formatted strings with a newline character.
    console . log
    (
        Object . keys ( l )
            . map
            (
                function (   k   )
                {
                    return   k   +   ': '   +   this [ k ] ; // Format "character: count"
                } ,
                l // The context for 'this' inside the map callback
            )
            . join ( '\n' ) // Separate each character count with a newline
    ) ;
}
) ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ; // IIFE invocation: Reads input from standard in


/*
 * parse function: A general utility to parse a string into a 2D array.
 * It splits the string first by a 'terminator' and then each resulting
 * sub-string by a 'separator'.
 */
function   parse
(
    str , // The string to be parsed
    sep , // The separator character (defaults to space if undefined)
    ter   // The terminator character (defaults to newline if undefined)
)
{
    // Set default values for separator and terminator if they are not provided.
    sep   =   typeof ( sep )   !==   'undefined'   ?   sep   :   ' ' ;
    ter   =   typeof ( ter )   !==   'undefined'   ?   ter   :   '\n' ;

    // Remove any trailing newline character from the input string to prevent
    // an empty string at the end of the first split.
    str   =   str . replace ( / \n $ / , '' ) ;

    // First split: Divide the string into lines/segments using the terminator.
    var   a   =   str . split ( ter ) ;

    // Second split: Iterate through each segment and split it further
    // by the separator, effectively creating a 2D array.
    for
    (
        var   i   =   0 ; // Loop counter initialization
        i   <   a . length ; // Loop condition
        i   ++ // Loop increment
    )
    {
        a [ i ]   =   a [ i ] . split ( sep ) ; // Split current segment by separator
    }

    // Return the resulting 2D array.
    return   a ;
}