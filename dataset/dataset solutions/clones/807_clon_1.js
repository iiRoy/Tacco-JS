function  shot ( y ,  x )
{
    // This function simulates a shot fired by the tank.
    // It takes y and x as direction vectors (e.g., -1, 0 for up, 1, 0 for down).
    // The shot continues in the given direction until it hits a wall or a target.

    var i = 0 ; // Initialize a counter for the shot's range or distance.


    // Loop indefinitely, simulating the projectile's travel.
    while ( true )
    {
        // Increment the distance/range for each step of the shot.
        i ++ ;

        // Check the character at the current cell where the shot would be.
        // yx[tank[0] + (y*i)][tank[1] + (x*i)] represents the cell.

        // If the shot hits a wall ('#'), it stops.
        if ( yx [ tank [ 0 ] + ( y * i ) ] [ tank [ 1 ] + ( x * i ) ] == "#" )
        {
            break ; // The shot has hit an impassable wall.
        }
        // Else if the shot hits a target ('*'), destroy it and stop.
        else if ( yx [ tank [ 0 ] + ( y * i ) ] [ tank [ 1 ] + ( x * i ) ] == "*" )
        {
            // Replace the target character '*' with an empty space '.'
            // indicating it has been destroyed.
            yx [ tank [ 0 ] + ( y * i ) ] [ tank [ 1 ] + ( x * i ) ] = "." ;
            break ; // The shot has successfully hit and destroyed a target.
        }
        // If the shot hits an empty space ('.') or a tank (U, D, L, R - though it shouldn't hit its own tank),
        // it continues to the next cell in the same direction.
    }
    // End of shot simulation.
}



// Main program execution begins here.
// We are reading input from standard input using Node.js 'fs' module.
var input = require ( 'fs' ) . readFileSync ( '/dev/stdin' ,  'utf8' ) ;


// The input characters for tank directions need to be standardized.
// Original input characters: ^ (Up), v (Down), < (Left), > (Right)
// Internal representation: U, D, L, R
input = input . replace ( /\^/g , "U" ) // Replace '^' with 'U'
              . replace ( /v/g , "D" ) // Replace 'v' with 'D'
              . replace ( /\</g , "L" ) // Replace '<' with 'L'
              . replace ( /\>/g , "R" ) ; // Replace '>' with 'R'

// Split the processed input string into an array of lines.
var arr = input . trim ( ) . split ( "\n" ) ;

// The first line of the input array represents the number of test cases.
// We use 'shift()' to remove it from 'arr' and '- 0' to convert it to a number.
var t = arr . shift ( ) - 0 ;

// Loop through each test case provided in the input.
for ( var i = 0 ;  i < t ;  i ++ )
{
    // If it's not the first test case, print a newline character
    // to separate the output of different test cases.
    if ( i != 0 )
    {
        console . log ( "\n" ) ;
    }


    // Read the map dimensions (Height and Width) for the current test case.
    // The line is split by space, and each part is converted to a number.
    var hw = arr . shift ( ) . split ( " " ) . map ( Number ) ;

    // Initialize the game map as a 2D array (array of arrays).
    // This will store the state of the battlefield.
    var yx = [ ] ;

    // Add a top border row of walls ('#') to the map.
    // This simplifies boundary checks later.
    yx . push ( "####################" . split ( "" ) ) ;


    // Initialize the tank's coordinates.
    // tank[0] will store the row (y-coordinate), tank[1] will store the column (x-coordinate).
    var tank = [ 0 , 0 ] ;

    // Loop through each row of the actual map data to populate 'yx'.
    for ( var j = 0 ;  j < hw [ 0 ] ;  j ++ )
    {
        // Get a row of the map from the input and split it into individual characters.
        var ary = arr . shift ( ) . split ( "" ) ;

        // Variable to temporarily store the column index of the tank within the current row.
        // Initialized to -1, indicating the tank has not yet been found in this row.
        var w = -1 ;

        // Iterate over the characters in the current row to find the tank's initial position.
        ary . forEach ( function ( v , index )
        {
            // If the character represents a tank (any direction), store its index.
            if ( v == "U" || v == "D" || v == "L" || v == "R" )
            {
                w = index ;
            }
        } ) ;

        // If the tank was found in this row (w is not -1), update its global coordinates.
        // We add 1 to 'j' and 'w' because of the border walls added to 'yx'.
        if ( w != -1 )
        {
            tank = [ j + 1 , w + 1 ] ;
        }

        // Add left and right wall borders to the current row.
        ary . unshift ( "#" ) ; // Add a '#' to the beginning of the row.
        ary . push ( "#" ) ;   // Add a '#' to the end of the row.

        // Add the modified row (with borders) to the game map 'yx'.
        yx . push ( ary ) ;
    }

    // After processing all map rows, add a bottom border row of walls.
    yx . push ( "####################" . split ( "" ) ) ;


    // Consume the blank line that separates the map data from the command sequence in the input.
    arr . shift ( ) ;

    // Get the sequence of commands for the tank for this test case.
    var n = arr . shift ( ) . split ( "" ) ;

    // Process each command in the sequence.
    n . forEach ( function ( v )
    {
        // Handle 'U' (Up) command.
        if ( v == "U"  &&  yx [ tank [ 0 ] - 1 ] [ tank [ 1 ] ] == "." )
        {
            // If the cell above is empty ('.'), move the tank up.
            yx [ tank [ 0 ] - 1 ] [ tank [ 1 ] ] = "U" ; // Place tank in new position.
            yx [ tank [ 0 ] ] [ tank [ 1 ] ] = "." ;     // Clear old position.
            tank [ 0 ] -- ; // Update tank's row coordinate.
        }
        else if ( v == "U"  &&  yx [ tank [ 0 ] - 1 ] [ tank [ 1 ] ] != "." )
        {
            // If the cell above is not empty (e.g., wall, target), only change tank's direction.
            yx [ tank [ 0 ] ] [ tank [ 1 ] ] = "U" ;
        }
        // Handle 'D' (Down) command.
        else if ( v == "D"  &&  yx [ tank [ 0 ] + 1 ] [ tank [ 1 ] ] == "." )
        {
            // If the cell below is empty ('.'), move the tank down.
            yx [ tank [ 0 ] + 1 ] [ tank [ 1 ] ] = "D" ;
            yx [ tank [ 0 ] ] [ tank [ 1 ] ] = "." ;
            tank [ 0 ] ++ ;
        }
        else if ( v == "D"  &&  yx [ tank [ 0 ] + 1 ] [ tank [ 1 ] ] != "." )
        {
            // If the cell below is not empty, only change tank's direction.
            yx [ tank [ 0 ] ] [ tank [ 1 ] ] = "D" ;
        }
        // Handle 'L' (Left) command.
        else if ( v == "L"  &&  yx [ tank [ 0 ] ] [ tank [ 1 ] - 1 ] == "." )
        {
            // If the cell to the left is empty ('.'), move the tank left.
            yx [ tank [ 0 ] ] [ tank [ 1 ] - 1 ] = "L" ;
            yx [ tank [ 0 ] ] [ tank [ 1 ] ] = "." ;
            tank [ 1 ] -- ;
        }
        else if ( v == "L"  &&  yx [ tank [ 0 ] ] [ tank [ 1 ] - 1 ] != "." )
        {
            // If the cell to the left is not empty, only change tank's direction.
            yx [ tank [ 0 ] ] [ tank [ 1 ] ] = "L" ;
        }
        // Handle 'R' (Right) command.
        else if ( v == "R"  &&  yx [ tank [ 0 ] ] [ tank [ 1 ] + 1 ] == "." )
        {
            // If the cell to the right is empty ('.'), move the tank right.
            yx [ tank [ 0 ] ] [ tank [ 1 ] + 1 ] = "R" ;
            yx [ tank [ 0 ] ] [ tank [ 1 ] ] = "." ;
            tank [ 1 ] ++ ;
        }
        else if ( v == "R"  &&  yx [ tank [ 0 ] ] [ tank [ 1 ] + 1 ] != "." )
        {
            // If the cell to the right is not empty, only change tank's direction.
            yx [ tank [ 0 ] ] [ tank [ 1 ] ] = "R" ;
        }
        // Handle 'S' (Shot) command.
        else if ( v == "S" )
        {
            // Determine the tank's current facing direction from its symbol on the map.
            var udlr = yx [ tank [ 0 ] ] [ tank [ 1 ] ] ;

            // Call the 'shot' function with appropriate direction vectors based on tank's facing.
            if ( udlr == "U" )
            {
                shot ( -1 , 0 ) ; // Tank is facing Up: shot goes up (y-1, x).
            }
            else if ( udlr == "D" )
            {
                shot ( 1 , 0 ) ; // Tank is facing Down: shot goes down (y+1, x).
            }
            else if ( udlr == "L" )
            {
                shot ( 0 , -1 ) ; // Tank is facing Left: shot goes left (y, x-1).
            }
            else if ( udlr == "R" )
            {
                shot ( 0 , 1 ) ; // Tank is facing Right: shot goes right (y, x+1).
            }
        }
    } ) ; // End of forEach loop for commands.

    // After all commands are processed, remove the temporary border rows from 'yx'.
    yx . shift ( ) ; // Remove the top border row.
    yx . pop ( ) ;   // Remove the bottom border row.

    // Prepare the final map for output.
    // 1. Join the rows with newline characters to form a single string.
    // 2. Remove the left and right border '#' characters from each row.
    // 3. Remove commas introduced by joining inner arrays (e.g., from split("")).
    // 4. Convert internal direction characters (U, D, L, R) back to original input symbols (^, v, <, >).
    console . log ( yx . join ( "\n" )
                     . replace ( /^#/mg , "" ) // Remove leading '#' (left border) from each line.
                     . replace ( /#$/mg , "" ) // Remove trailing '#' (right border) from each line.
                     . replace ( /\,/g , "" )  // Remove commas that might appear if `split("")` is used on output.
                     . replace ( /U/g , "^" )  // Convert 'U' back to '^'.
                     . replace ( /D/g , "v" )  // Convert 'D' back to 'v'.
                     . replace ( /L/g , "<" )  // Convert 'L' back to '<'.
                     . replace ( /R/g , ">" ) ) ; // Convert 'R' back to '>'.
} // End of test cases loop.