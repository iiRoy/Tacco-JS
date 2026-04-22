/*
 * This is the main function
 * that processes the input string.
 */
function     Main   (   input   )
{

    var     arr   =   input .   trim  (   )   .   split   (   / \s | \n /   )   ;   // Initialize an array by splitting the input

    var   ts   =   0   ;   // Initialize score for player T
    var   hs   =   0   ;   // Initialize score for player H


    n   =   parseInt   (   arr .   shift   (   )   )   ;   // Get the number of rounds from the array


    for   (   var   i   =   0   ;   i   <   n   ;   i ++   )
    {
        t   =   arr .   shift   (   )   ;   // Get player T's card

        h   =   arr .   shift   (   )   ;   // Get player H's card

        if   (   t   ==   h   )
        {   // If cards are equal, both get 1 point
            ts ++   ;
            hs ++   ;
        }
        else
        {   // If cards are not equal, determine winner and award 3 points
            t   <   h   ?   hs   +=   3   :   ts   +=   3   ;
        }

    } // End of the game loop


    console .   log   (   ts   +   " "   +   hs   )   ;   // Output the final scores

} // End of Main function


/*
 * This part reads the input from standard input
 * and then calls the Main function to process it.
 */
Main   (
    require   (   "fs"   )   .   readFileSync   (
        "/dev/stdin"   ,
        "utf8"
    )
)   ;