/*
 * This JavaScript file contains the implementation of a pathfinding-like algorithm.
 * It reads map data, start/goal coordinates, and simulates movement.
 *
 * Author: Code Clone Generator
 * Date: 2023-10-27
 * Version: 1.0
 */

// Original input example (commented out):
// let input = "4 4\n1 1\n4 4\n..#.\n..#.\n.#..\n.#..";

/*
    Input structure interpretation:
    1: map dimensions (height, width)
    2: starting coordinates (y, x)
    3: goal coordinates (y, x)
    4~: map rows (characters representing the terrain)
*/

function  main ( input )
{
    // Ensure the input string is clean by removing leading/trailing whitespace.
    input = input . trim( ) ;

    // Split the input string into an array of lines.
    let lines = input.split ( "\n" ) ;

    // Initialize an array to store parsed input lines.
    let list = [ ] ; // This will be a 2D array after processing.

    // Initialize another array to store the actual map grid.
    let map = [ ] ; // This will also be a 2D array of characters.

    // Loop through each line to parse numerical and coordinate data.
    for ( let i = 0 ; i < lines . length ; i ++ )
    {
        list [ i ] = lines [ i ] . split ( " " ) ;
    }

    /*
     * Populate the 'map' array from the input lines.
     * The map data starts from the 4th line (index 3).
     * The number of map rows is lines.length - 3.
     */
    for
        ( let i = 0 ;
          i < lines . length - 3 ;
          i ++ )
    {
        map [ i ] = lines [ i + 3 ] . split ( "" ) ;
    }

    // Extract map dimensions and coordinates, converting them to integers.
    let mapHeight = parseInt ( list [ 0 ] [ 0 ] ) ; // The height of the grid.
    let mapWidth = parseInt ( list [ 0 ] [ 1 ] ) ;  // The width of the grid.

    // Start Y coordinate (adjusted to be 0-indexed).
    let sY = parseInt ( list [ 1 ] [ 0 ] ) - 1 ;
    // Start X coordinate (adjusted to be 0-indexed).
    let sX = parseInt ( list [ 1 ] [ 1 ] ) - 1 ;

    // Goal Y coordinate (adjusted to be 0-indexed).
    let gY = parseInt ( list [ 2 ] [ 0 ] ) - 1 ;
    // Goal X coordinate (adjusted to be 0-indexed).
    let gX = parseInt ( list [ 2 ] [ 1 ] ) - 1 ;

    // Counter for "warp" moves.
    let warpCount = 0 ;

    /**
     * Function to display the current state of the map,
     * marking the start and goal positions.
     * This function is currently commented out for console logging.
     */
    function showMap ( )
    {
        let mapping = "" ; // String to build the map representation.

        // Create a deep copy of the map to avoid modifying the original during display.
        // JSON.parse(JSON.stringify()) is a common, albeit not always optimal, deep copy method.
        let mapC = JSON . parse ( JSON . stringify ( map ) ) ;

        // Mark the current start position with '@'.
        mapC [ sY ] [ sX ] = "@" ;
        // Mark the goal position with 'G'.
        mapC [ gY ] [ gX ] = "G" ;

        // Iterate through the copied map to build the display string.
        for ( let h = 0 ; h < mapC . length ; h ++ )
        {
            for ( let w = 0 ; w < mapC [ h ] . length ; w ++ )
            {
                mapping += mapC [ h ] [ w ] ;
            }
            mapping += "\n" ; // Add a newline after each row.
        }
        // console.log(mapping); // The actual console output is commented out.
    } // End of showMap function definition.

    /**
     * This function attempts to move the current position (sY, sX)
     * towards the goal (gY, gX) based on specific rules.
     */
    function  move ( )
    {
        // Prioritize moving right if the goal is to the right and the path is clear.
        if ( gX > sX && map [ sY ] [ sX + 1 ] === "." )
        {
            sX ++ ;
        }
        // If not moving right, prioritize moving down if the goal is below and the path is clear.
        else if ( gY > sY && map [ sY + 1 ] [ sX ] === "." )
        {
            sY ++ ;
        }
        // If within a 2x2 proximity to the goal, perform a "warp" jump.
        else if ( Math . abs ( gY - sY ) <= 2 && Math . abs ( gX - sX ) <= 2 )
        {
            sY = gY ; // Directly set current Y to goal Y.
            sX = gX ; // Directly set current X to goal X.
            warpCount ++ ; // Increment the warp counter.
        }
        // After attempting a move, display the updated map (if not commented out).
        showMap ( ) ;
    } // End of move function.

    // Main game loop: continues until the goal is reached.
    for ( let goaled = 0 ; goaled === 0 ; )
    {
        // Check if the current position matches the goal position.
        if ( sY === gY && sX === gX )
        {
            // If goal reached, print the total number of warp moves.
            console . log ( warpCount ) ;
            goaled = 1 ; // Set flag to exit the loop.
        }
        else
        {
            // If not at the goal, attempt to make a move.
            move ( ) ;
        }
    } // End of the main game loop block.

} // End of the main function.

// Call the main function with input from standard input.
main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;
// The previous line reads the entire content of stdin as a string.