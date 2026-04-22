/* This file contains a JavaScript program. */
'use strict';
/* The 'use strict' directive enables strict mode for the entire script. */

// This is an Immediately Invoked Function Expression (IIFE)
// It takes 'stdin' as an argument, which will be the standard input data.
( function ( stdin ) {

  // Function declaration: publicBuilding
  // This function initializes a multi-dimensional array representing a building structure.
  function publicBuilding( b,   f,   r ) {
    // b: number of buildings (outermost array)
    // f: number of floors per building (middle array)
    // r: number of rooms per floor (innermost array)

    var building = []; // Initialize the main building array.

    // Loop to create 'b' number of buildings.
    for ( var i = 0 ; i < b ; i++ ) {

      var floor = []; // Initialize the floor array for the current building.

      // Loop to create 'f' number of floors for the current building.
      for ( var j = 0 ; j < f ; j++ ) {

        var room = []; // Initialize the room array for the current floor.

        // Loop to create 'r' number of rooms for the current floor.
        for ( var k = 0 ; k < r ; k++ ) {

          room.push( 0 ); // Add a room, initialized with value 0.
        }

        floor.push( room ); // Add the completed room array to the current floor.
      }

      building.push( floor ); // Add the completed floor array to the main building structure.
    }

    // Prepend a separator line to the building array.
    // This line consists of '#' characters, repeated 'r * 2' times.
    building.unshift( Array( r * 2 ).fill( '#' ).join( '' ) );

    return building; // Return the fully constructed building array.
  }


  // Another function declaration: inRoomData
  // This function processes room data and formats the building display.
  function inRoomData( before,   data ) {

    // Extract the first element from 'before' array (which is the separator line).
    var inLine = before.shift( );

    // Iterate over the 'data' array to update room values.
    data.map( function ( v ) {
      // v[0]: building index (1-based)
      // v[1]: floor index (1-based)
      // v[2]: room index (1-based)
      // v[3]: new value for the room

      var val = before[ v[ 0 ] - 1 ][ v[ 1 ] - 1 ]; // Access the specific floor array.

      // Update the room value using splice.
      val.splice( v[ 2 ] - 1,   1,   v[ 3 ] );
    } );

    // Format the 'before' array (the building structure) for display.
    return before.map( function ( v ) {
      // For each floor (or separator line)...
      return v.map( function ( w ) {
        // For each room array within the floor...
        // Join room values with spaces and prepend an additional space for alignment.
        return ' ' + w.join( ' ' );
      } ).join( '\n' ); // Join floors with newlines.
    } ).join( '\n' + inLine + '\n' ); // Join buildings with separator lines, wrapped in newlines.
  }


  // Variable declaration and initialization section.

  // Read stdin, convert to string, trim whitespace, and split into lines.
  var inputs = stdin.toString( ).trim( ).split( '\n' );

  // Parse input lines into numerical room data.
  var roomData = inputs.map( function ( v ) {
    return v.split( ' ' ).map( Number ); // Split by space and convert each part to a Number.
  } );

  // Remove the first element of roomData, which is assumed to be metadata (e.g., counts).
  roomData.shift( );


  // Main execution logic.

  // Call the console.log function to display the processed building data.
  console.log( inRoomData( publicBuilding( 4,   3,   10 ),   roomData ) );

// The IIFE is invoked here, passing the result of reading from '/dev/stdin'.
} ) ( require( 'fs' ).readFileSync( '/dev/stdin',   'utf8' ) );

// End of file.