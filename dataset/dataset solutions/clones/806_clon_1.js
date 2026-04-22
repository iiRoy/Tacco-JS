function move ( y , x , str ) {
  // This function handles the movement of the tank on the game map.
  // It updates the tank's position and the map representation.

  /*
   * Check if the target cell is empty (represented by '.').
   * If it is, the tank can move there.
   */
  if ( yx [ tank [ 0 ] + y ] [ tank [ 1 ] + x ] == "." ) {

    // Move the tank to the new position.
    yx [ tank [ 0 ] + y ] [ tank [ 1 ] + x ] = str ;

    // Mark the old tank position as empty.
    yx [ tank [ 0 ] ] [ tank [ 1 ] ] = "." ;

    // Update the tank's coordinates.
    tank [ 0 ] += y ;
    tank [ 1 ] += x ;
  } // End of if block for moving into an empty space
  else {
    // If the target cell is not empty, just update the tank's direction
    // at its current position without moving.
    yx [ tank [ 0 ] ] [ tank [ 1 ] ] = str ;
  }
} // End of move function


function shot ( y , x ) {
  // This function simulates a shot fired from the tank.
  // It travels in a given direction until it hits a wall ('#') or a target ('*').

  var i = 0 ; // Initialize the shot distance counter.

  while ( true ) { // Loop indefinitely until the shot hits something.
    i ++ ; // Increment the distance.

    // Check if the current cell in the shot's path is a wall.
    if ( yx [ tank [ 0 ] + ( y * i ) ] [ tank [ 1 ] + ( x * i ) ] == "#" ) {
      break ; // If it's a wall, the shot stops.
    }
    // Otherwise, check if it's a target.
    else if ( yx [ tank [ 0 ] + ( y * i ) ] [ tank [ 1 ] + ( x * i ) ] == "*" ) {
      // If it's a target, destroy it by replacing it with an empty space.
      yx [ tank [ 0 ] + ( y * i ) ] [ tank [ 1 ] + ( x * i ) ] = "." ;
      break ; // The shot stops after hitting the target.
    }
    // If neither a wall nor a target, the shot continues.
  }
} // End of shot function


// Read the entire input from stdin.
var input = require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ;

// Trim whitespace, then split the input into an array of lines.
var arr = input . trim ( ) . split ( "\n" ) ;

// The first line contains the number of test cases. Convert it to a number.
var t = arr . shift ( ) - 0 ;

// Loop through each test case.
for ( var i = 0 ; i < t ; i ++ ) {

  // If it's not the first test case, print an empty line for separation.
  if ( i != 0 ) {
    console . log ( "" ) ;
  }

  // Get height and width for the current map.
  // These are on the next line, space-separated, and converted to numbers.
  var hw = arr . shift ( ) . split ( " " ) . map ( Number ) ;

  // Initialize the 2D array representing the game map.
  var yx = [ ] ;

  // Add the top border row to the map.
  yx . push ( "######################" . split ( "" ) ) ;

  // Initialize tank coordinates. Will be updated when tank is found.
  var tank = [ 0 , 0 ] ;

  // Loop to read and process each row of the map.
  for ( var j = 0 ; j < hw [ 0 ] ; j ++ ) {
    var ary = arr . shift ( ) . split ( "" ) ; // Get current map row as char array.
    var w = -1 ; // Variable to store the column index of the tank.

    // Iterate through the current row to find the tank.
    ary . forEach ( function ( v , i ) {
      // Check if the current character is a tank symbol.
      if ( v == "^" || v == "v" || v == "<" || v == ">" ) {
        w = i ; // If found, store its column index.
      }
    } ) ; // End of forEach for row characters.

    // If the tank was found in this row, update its coordinates.
    // Add 1 to j and w because of the added borders.
    if ( w != -1 ) {
      tank = [ j + 1 , w + 1 ] ;
    }

    ary . unshift ( "#" ) ; // Add left border to the current row.
    ary . push ( "#" ) ; // Add right border to the current row.
    yx . push ( ary ) ; // Add the processed row to the game map.
  } // End of loop for map rows.

  // Add the bottom border row to the map.
  yx . push ( "######################" . split ( "" ) ) ;

  arr . shift ( ) ; // Consume the empty line after the map data.

  // Get the sequence of commands for the tank.
  var n = arr . shift ( ) . split ( "" ) ;

  // Process each command in the sequence.
  n . forEach ( function ( v ) {
    if ( v == "U" ) {
      move ( -1 , 0 , "^" ) ; // Move Up
    } else if ( v == "D" ) {
      move ( 1 , 0 , "v" ) ; // Move Down
    } else if ( v == "L" ) {
      move ( 0 , -1 , "<" ) ; // Move Left
    } else if ( v == "R" ) {
      move ( 0 , 1 , ">" ) ; // Move Right
    } else if ( v == "S" ) {
      // If the command is 'S' (Shoot).
      var str = yx [ tank [ 0 ] ] [ tank [ 1 ] ] ; // Get the current direction of the tank.
      if ( str == "^" ) {
        shot ( -1 , 0 ) ; // Shoot Up
      } else if ( str == "v" ) {
        shot ( 1 , 0 ) ; // Shoot Down
      } else if ( str == "<" ) {
        shot ( 0 , -1 ) ; // Shoot Left
      } else if ( str == ">" ) {
        shot ( 0 , 1 ) ; // Shoot Right
      }
    }
  } ) ; // End of forEach for commands.

  // Remove the temporary borders added for processing.
  yx . shift ( ) ; // Remove the top border.
  yx . pop ( ) ; // Remove the bottom border.

  // Format the final map for output:
  // 1. Join rows with newline characters.
  // 2. Remove commas that appear when joining character arrays.
  // 3. Remove leading/trailing '#' characters from each line (the side borders).
  var ans = yx . join ( "\n" ) . replace ( /\,/g , "" ) . replace ( /^#|#$/mg , "" ) ;

  // Print the final state of the map.
  console . log ( ans ) ;
} // End of for loop for test cases.