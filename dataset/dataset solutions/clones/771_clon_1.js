var input = ''; /* Initialize a string to accumulate input data */

process.stdin.resume(); // Ensure the standard input stream stays open
process.stdin.setEncoding('utf8'); // Set encoding for input data

process.stdin.on('data', function (chunk) { /* Event listener for incoming data chunks */
  input += chunk; /* Append each chunk to the 'input' string */
});

process.stdin.on('end', function () { // Event listener for the end of the input stream
                                  // Once all input is received, call the main function
  main(input.split('\n')); // Split the accumulated input by newline characters
});


function main(inputArr) { /* Main processing function */
  // Declare several variables needed for the game logic
  var i, temp, nGems, map, nMoves, moves = [];

  // Loop continues as long as the number of gems for the current test case is not zero
  while ( ( nGems = +inputArr.shift() ) !== 0 ) {
    // Initialize a 2D map (represented as a 1D array) of size 21x21
    map = new Array( 21 * 21 );
    // Fill the map with zeros, indicating no gems initially
    for ( i = 0; i < 21 * 21; i++ ) {
      map[ i ] = 0;
    }

    // Process the gem locations
    i = 0;
    while ( i < nGems ) {
      temp = inputArr.shift().split(' '); // Get gem coordinates (x, y)
      console.log( temp ); // Log the raw coordinates for debugging
      // Mark the gem's position on the map (flat index calculation: x + y * width)
      map[ ( +temp[0] ) + 21 * ( +temp[1] ) ] = 1;
      // This was a commented-out alternative way to store gem info:
      // { x: +temp[0], y: +temp[1] };
      i++; // Increment gem counter
    }

    // Get the number of moves for the current test case
    nMoves = +inputArr.shift();
    i = 0;
    moves = []; // Clear moves array for the new test case
    // Process each move
    while ( i < nMoves ) {
      temp = inputArr.shift().split(' '); // Get move details (direction, length)
      moves.push( { d: temp[0], l: +temp[1] } ); // Store move as an object
      i++; // Increment move counter
    }

    // Original debug map display comments (now removed or modified)
    /*
    // **debug show map
    // for (i = 0; i < 21; i++) {
    //   console.log(map.slice(i*21,i*21+21).join(' '));
    // }
    */

    // Determine if all gems were collected and print the result
    isAllGems( map, moves ) ? console.log( 'Yes' ) : console.log( 'No' );

    /*
    // Another commented-out debug section for the map after moves
    // for (i = 0; i < 21; i++) {
    //   console.log(map.slice(i*21,i*21+21).join(' '));
    // }
    */
  }
}

function isAllGems( map, moves ) {
  // Initialize player's starting position (center of the 21x21 grid)
  var pos = 10 + 10 * 21, i, walk;

  // Iterate through each move and update the map
  moves.forEach( function ( m ) {
    // Determine the 'walk' increment based on the direction
    switch ( m.d ) {
      case 'N': // North: move up one row (subtract 21 from flat index)
        walk = -21; /* Changed from original to make it different, but logic is still the same as moving "up" on a 1D array representing a 2D grid where rows are stacked */
        break;
      case 'W': // West: move left one column
        walk = -1;
        break;
      case 'E': // East: move right one column
        walk = 1;
        break;
      case 'S': // South: move down one row (add 21 to flat index)
        walk = 21; /* Changed from original */
        break;
    }

    // Apply the move for 'l' steps
    for ( i = 0; i < m.l; i++ ) {
      pos += walk; // Update player's position
      map[ pos ] = 0; // Mark the current position as visited (gem collected)
    }
  } );

  // After all moves, check if any gems remain on the map
  for ( i = 0; i < 21 * 21; i++ ) {
     if ( map[ i ] === 1 ) { // If any position still contains a gem (value 1)
       return false; // Not all gems were collected
     }
  }

  return true; // All gems were successfully collected
}