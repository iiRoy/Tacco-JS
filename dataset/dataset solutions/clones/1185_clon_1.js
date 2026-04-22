"use strict"
; /* This directive enforces strict mode for the entire script. */

// Definition of the Dice class, representing a six-sided die.
class Dice
{
    /**
     *    +---+
     *    | 0 |  // Top face of the die
     * +--+---+---+---+
     * | 3| 1 | 2 | 4 |  // Faces: Left, Front, Right, Back
     * +--+---+---+---+
     *    | 5 |  // Bottom face of the die
     *    +---+
     *
     * This ASCII art illustrates the net of the die and the indexing
     * of its faces within the 'stat' array.
     */
    constructor( stat )
    {
        // The 'stat' array holds the current values on each face of the die.
        this.stat = stat ;
    }

    /*
     * Rotates the die along the North-South axis.
     * A positive 'val' indicates a rotation towards North (top moves to front).
     * A negative 'val' indicates a rotation towards South (top moves to back).
     */
    rot_ns ( val )
    {
        // Normalize 'val' to be a positive number within [0, 3]
        // This handles negative rotations and rotations exceeding a full turn.
        if ( val < 0 )
        {
            val += 4 * Math.floor( -val / 4 ) + 4 ;
        }

        // Indices of the faces involved in a North-South rotation:
        // Top (0), Front (1), Bottom (5), Back (4)
        const old_i = [ 0 , 1 , 5 , 4 ] ;

        // Calculate the new positions for the faces after rotation.
        // The modulo 4 ensures wrapping around the circular sequence.
        const new_i = [ val , val + 1 , val + 2 , val + 3 ] .map( elt => old_i[ elt % 4 ] ) ;

        // Perform the actual rotation by reassigning values using destructuring.
        // The value at old_i[0] (Top) moves to the position of new_i[0], etc.
        [ this .stat [ old_i[ 0 ] ] , this .stat [ old_i[ 1 ] ] , this .stat [ old_i[ 2 ] ] , this .stat [ old_i[ 3 ] ] ] =
            [ this .stat [ new_i[ 0 ] ] , this .stat [ new_i[ 1 ] ] , this .stat [ new_i[ 2 ] ] , this .stat [ new_i[ 3 ] ] ] ;
    }

    // This method handles rotation along the West-East axis.
    // A positive 'val' means rotating towards West (top moves to left).
    // A negative 'val' means rotating towards East (top moves to right).
    rot_we ( val )
    {
        // Ensure 'val' is a positive index within [0, 3] for rotation logic.
        if ( val < 0 )
        {
            val += 4 * Math.floor( -val / 4 ) + 4 ;
        }

        // Indices of faces affected by a West-East rotation:
        // Top (0), Right (2), Bottom (5), Left (3)
        const old_i = [ 0 , 2 , 5 , 3 ] ;

        // Determine the mapping from old positions to new positions based on 'val'.
        const new_i = [ val , val + 1 , val + 2 , val + 3 ] .map( elt => old_i[ elt % 4 ] ) ;

        // Update the face values according to the rotation.
        [ this .stat [ old_i[ 0 ] ] , this .stat [ old_i[ 1 ] ] , this .stat [ old_i[ 2 ] ] , this .stat [ old_i[ 3 ] ] ] =
            [ this .stat [ new_i[ 0 ] ] , this .stat [ new_i[ 1 ] ] , this .stat [ new_i[ 2 ] ] , this .stat [ new_i[ 3 ] ] ] ;
    }
}


// Start of the main program logic, encapsulated in a Promise for async input/output.
new Promise( function ( resolve , reject )
{
    // Variable to accumulate input data from stdin.
    let content = "" ;

    // Event listener for incoming data chunks from standard input.
    process .stdin .on ( "data" , chunk =>
    {
        content += chunk ; // Append each chunk to the content string.
    }
    ) ;

    // Event listener for the end of standard input stream.
    process .stdin .on ( "end" , () =>
    {
        // Resolve the Promise with the accumulated content and the stdout stream.
        resolve( [ content , process .stdout ] ) ;
    }
    ) ;
}
) .then ( function ( [ cin , cout ] )
{
    // Destructure the input string into initial die state and commands.
    // .slice(0, 2) ensures we only take the first two lines.
    const [ init , command ] = cin .split ( "\n" ) .slice ( 0 , 2 ) ;

    // Create a new Dice instance.
    // Initialize its 'stat' array by parsing integer values from the 'init' string.
    const dice = new Dice ( init .split ( " " ) .map ( elt => parseInt ( elt ) ) ) ;

    // Iterate through each character in the command string.
    for ( const ch of command )
    {
        // Perform die rotation based on the command character.
        switch ( ch )
        {
            case "N" : // Rotate North
                dice .rot_ns ( 1 ) ;
                break ;
            case "S" : // Rotate South
                dice .rot_ns ( -1 ) ;
                break ;
            case "W" : // Rotate West
                dice .rot_we ( 1 ) ;
                break ;
            case "E" : // Rotate East
                dice .rot_we ( -1 ) ;
                break ;
        }
    }
    // After all commands, write the value of the top face (index 0) to stdout.
    cout .write ( `${ dice .stat [ 0 ] }\n` ) ;
}
) ;