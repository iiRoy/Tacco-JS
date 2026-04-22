// This file contains a JavaScript implementation for a dice rotation simulation.
// It defines a Dice object and a main function to process input.


function    dice( num )
{
    // The 'n' property holds the current state of the dice faces as an array.
    // The order typically represents: Top, Front, Right, Left, Back, Bottom.
    this.n = num;


    // Define the 'rotate' method for the dice object.
    // This method simulates rotating the dice in a given direction.
    this.rotate  = function(  dir  )
    {
        // Check if the rotation direction is 'N' (North).
        // A North rotation moves the Front face to the Top, and the Top face to the Back.
        if (  dir == 'N'  )
        {
            this.n = [ this.n[1], this.n[5], this.n[2], this.n[3], this.n[0], this.n[4] ];
        }

        // Check for 'E' (East) rotation.
        // An East rotation moves the Right face to the Top, and the Top face to the Left.
        else if ( dir == 'E' )
        {
            this.n = [ this.n[3], this.n[1], this.n[0], this.n[5], this.n[4], this.n[2] ];
        }

        // Check for 'S' (South) rotation.
        // A South rotation moves the Back face to the Top, and the Top face to the Front.
        else if ( dir == 'S' )
        {
            this.n = [ this.n[4], this.n[0], this.n[2], this.n[3], this.n[5], this.n[1] ];
        }

        // Check for 'W' (West) rotation.
        // A West rotation moves the Left face to the Top, and the Top face to the Right.
        else if ( dir == 'W' )
        {
            this.n = [ this.n[2], this.n[1], this.n[5], this.n[0], this.n[4], this.n[3] ];
        }
    }
}


/**
 * The main entry point function for the program.
 * It reads input, simulates dice rotations, and outputs the result.
 * @param {string} input - The raw input string, typically from stdin.
 */
function     Main( input )
{
    // Split the input string by newlines to get individual lines.
    input = input.split( "\n" );

    // Create a new dice object.
    // The initial face values are taken from the first line of input, split by spaces.
    var     dice_a    =   new dice( input[0].split( " " ) );

    // Process the rotation commands from the second line of input.
    // Each character in the string represents a rotation direction.
    input[1].split( "" ).forEach( function( d ) {
        dice_a.rotate( d );
    } );

    // After all rotations, print the value of the top face of the dice.
    console.log( dice_a.n[0] );
}


// --- Program Execution Start ---
// Read the entire standard input as a UTF-8 string, then pass it to the Main function.
Main( require( "fs" ).readFileSync( "/dev/stdin", "utf8" ) );