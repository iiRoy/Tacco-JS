/*
 * This file contains the main logic for processing golem movements.
 * It's a slightly reformatted and commented version of an original script.
 */
function         Main ( input )
{
  // Initialize an array 's' to store individual characters later.
  var s =        [];


  // Process the input string: split by newlines, then map each line.
  input = input . split ('\n') . map( ( val , index ) => {

    // The first line contains numerical parameters.
    if ( index        ===        0 )
    {
      // Split by space and parse each part as an integer.
      return val . split (' ') . map( val => parseInt ( val ) )
    }
    // The second line defines the initial state of 'checker' and populates 's'.
    else if ( index         ===         1 )
    {
      // Split into individual characters.
      return val . split ('') . map( val => {
        // Add the character to the global 's' array.
        s . push ( val );
        // Return an object representing the character's state and count.
        return { [ val ] : true, num : 1 };
      });
    }
    // All subsequent lines are command inputs.
    else
    {
      // Split command by space.
      return val . split (' ');
    }
  });


  // Extract numerical parameters from the first processed line.
  var nums           = input [ 0 ];
  var N              = nums [ 0 ]; // Total number of positions for golems.
  var Q              = nums [ 1 ]; // Number of queries/commands.

  // Initialize the total count of active golems.
  var total_golems   = N;

  // The 'checker' array holds the state of each position and golem type.
  var checker        = input [ 1 ];


  // Iterate through each query/command.
  for ( var i = 2 ; i < Q + 2 ; i ++ )
  {
    // Retrieve the current command.
    var temp         = input [ i ]
    var si           = temp [ 0 ]; // The type of golem to move.
    var di           = temp [ 1 ]; // The direction of movement ('L' or 'R').

    // Loop through all possible golem positions.
    for ( var j       in      s )
    {
      // Check if a golem of type 'si' exists at position 'j'.
      if ( checker [ j ] [ si ] )
      {
        // Mark the golem at position 'j' as moved (no longer there).
        checker [ j ] [ si ] = false;

        // Calculate the new position after movement.
        var afterMove = parseInt ( j ) + ( di === 'L' ? ( -1 ) : 1 );

        // Check if the golem moved off the board.
        if ( afterMove < 0       ||       afterMove >= N )
        {
          // If off board, decrement the total golem count.
          total_golems -= checker [ j ] . num;
        }
        else
        {
          // If still on board, update the new position.
          checker [ afterMove ] [ s [ afterMove ] ] = true;
          // Transfer the number of golems to the new position.
          checker [ afterMove ] . num += checker [ j ] . num;
        }
        // Reset the count of golems at the original position 'j'.
        checker [ j ] . num = 0;
      };
    }
  }

  // Output the final count of golems remaining on the board.
  console . log ( total_golems );
}

// Read input from stdin and pass it to the Main function.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin", "utf8" ) );
/* End of file */