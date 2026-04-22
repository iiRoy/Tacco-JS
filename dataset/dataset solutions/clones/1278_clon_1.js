/* This is a Type I clone of the original JavaScript code.
 *
 * As per the definition of Type I clones,
 * all identifiers, variable names, function names, operators,
 * and expressions remain absolutely identical to the source.
 *
 * The only modifications made are variations in whitespace
 * (like indentation, spacing around operators, and blank lines)
 * and the addition of extensive comments.
 *
 * This version aims to appear visually distinct
 * while maintaining exact logical and structural equivalence.
 */

var     input     =     require('fs') . readFileSync ( '/dev/stdin' ,     'utf8' ) ;     //  Read all data from standard input into the 'input' variable, treating it as UTF-8 text.


var      Arr      = input . split ( "\n" ) ;     //  Convert the input string into an array of strings, splitting by newline characters.


Arr . shift ( ) ;     //  Remove the very first element from the 'Arr' array. This often discards an initial count or header line.


var      shcd      = "SHCD" . split ( "" ) ;     //  Create an array 'shcd' containing the characters 'S', 'H', 'C', 'D' representing card suits.

var      str      = "" ;     //  Initialize an empty string 'str' which will be used to store any missing cards found.


//  Begin the primary loop: iterate through each of the four card suits.
for    (    var    i    =    0    ;    i    <    4    ;    i++    )
{

        //  Begin the secondary loop: iterate through each card rank from 1 (Ace) to 13 (King).
        for    (    var    j    =    1    ;    j    <=    13    ;    j++    )
        {

                var      card      =      shcd [ i ]      +      " "      +      j    ;     //  Construct the full string representation of a card (e.g., "S 1", "H 13").

                //  Check if the currently constructed 'card' string is NOT found within the 'Arr' array (which holds the input cards).
                if    (    Arr . indexOf ( card )      ===      -1    )
                {
                        str      +=      card      +      "\n"    ;     //  If the card is missing, append it to the 'str' variable, followed by a newline character.
                }

        }
}


//  After iterating through all possible 52 cards and identifying any missing ones,
//  check if the 'str' variable contains any accumulated missing cards.
if    (    str    !==    ""    )
{

        console . log ( str . trim ( ) ) ;     //  If 'str' is not empty, print its content to the console, ensuring any trailing whitespace is removed.

}

//  End of the JavaScript program logic.