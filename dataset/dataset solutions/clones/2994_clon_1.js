/**
 * This JavaScript function simulates a game or navigation process within a grid.
 * It takes an array of strings as input, representing various parameters.
 * The goal is to determine if a character can successfully navigate the grid
 * based on a sequence of moves and counter-moves, without going out of bounds.
 */
function     Main (  input    )
{
    // Height of the grid, parsed from the input.
    const H = parseInt( input.shift() ) ;

    // Width of the grid, parsed from the input.
    const W = parseInt( input.shift() ) ;

    // Number of moves to process, parsed from the input.
    const N = parseInt( input.shift() ) ;

    // Starting row coordinate (1-indexed), parsed from the input.
    const sr = parseInt( input.shift() ) ;

    // Starting column coordinate (1-indexed), parsed from the input.
    const sc = parseInt( input.shift() ) ;

    // String representing the character's planned moves.
    const S = input.shift() ;

    // String representing the opponent's counter-moves.
    const T = input.shift() ;


    // Initialize the boundaries of the character's current possible position.
    // 'left', 'right', 'top', 'bottom' represent the 1-indexed coordinates
    // of the current bounding box that the character *could* be in.

    var left    =   sc;
    var right   =   sc;
    var top     =   sr;
    var bottom  =   sr;


    // Iterate through each of the N moves.
    // 'i' is the current move index.
    for (  var   i   =   0  ;   i   <   N  ;   i++    )
    {
        // Get the character's planned move for the current turn.
        var s = S.charAt( i ) ;

        // Get the opponent's counter-move for the current turn.
        var t = T.charAt( i ) ;


        // Apply the character's planned move 's'.
        // This expands the possible bounding box of the character.
        if (  s   ==   "L"    )
        {
            // Move left: Decrement the left boundary.
            left--;
        }
        else if (  s   ==   "R"    )
        {
            // Move right: Increment the right boundary.
            right++;
        }
        else if (  s   ==   "U"    )
        {
            // Move up: Decrement the top boundary.
            top--;
        }
        else // (s == "D")
        {
            // Move down: Increment the bottom boundary.
            bottom++;
        }


        // Check if the character's current possible bounding box
        // has gone out of the grid boundaries (1 to H/W).
        if(  left   <=   0
             ||   right   >   W
             ||   top   <=   0
             ||   bottom   >   H    )
        {
            // If any boundary is violated, the character cannot survive.
            console.log( "NO" ) ;

            // Exit the function immediately.
            return  ;
        }


        // Apply the opponent's counter-move 't'.
        // This shrinks the possible bounding box of the character
        // by restricting movement in the opposite direction of the counter-move.
        if (  t   ==   "L"    )
        {
            // Opponent blocks left: The character cannot move too far right.
            // The right boundary is constrained to be at least 1 (min grid column)
            // or one less than its current value if it was greater than 1.
            right   =   Math.max(   1  ,   right   -   1    ) ;
        }
        else if (  t   ==   "R"    )
        {
            // Opponent blocks right: The character cannot move too far left.
            // The left boundary is constrained to be at most W (max grid column)
            // or one more than its current value if it was less than W.
            left   =   Math.min(   W  ,   left   +   1    ) ;
        }
        else if (  t   ==   "U"    )
        {
            // Opponent blocks up: The character cannot move too far down.
            // The bottom boundary is constrained to be at least 1 (min grid row)
            // or one less than its current value if it was greater than 1.
            bottom   =   Math.max(   1  ,   bottom   -   1    ) ;
        }
        else // (t == "D")
        {
            // Opponent blocks down: The character cannot move too far up.
            // The top boundary is constrained to be at most H (max grid row)
            // or one more than its current value if it was less than H.
            top   =   Math.min(   H  ,   top   +   1    ) ;
        }
    }

    // If the loop completes without the character going out of bounds,
    // then it is possible to navigate successfully.
    console.log( "YES" ) ;
}


// Read input from standard input, decode as UTF-8, trim whitespace,
// and split by newline or whitespace characters to form an array of strings.
// Then, call the Main function with this processed input.
// This is the entry point for the script execution in a typical competitive programming environment.
Main(   require(   "fs"    )
            .readFileSync(   "/dev/stdin"  ,   "utf8"    )
            .trim()
            .split(   /\n|\s/    )
);