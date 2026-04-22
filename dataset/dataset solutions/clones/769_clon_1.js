( function  ( stdin )   {


  // Initialize lines array from input.
  var    lines    =    stdin . trim ( ) . split ( '\n' ) ;


  // Main processing loop. Continues until '0' is encountered.
  while ( 1 )

  {

    // Extract the next line from the input.
    var    line    =    lines . shift ( ) ;


    // Check if the termination condition is met.
    if ( line == '0' )

    {
      // Exit the infinite loop.
      break ;
    }


    // Parse the number of jewels for the current test case.
    var    n    =    Number ( line ) ;

    /*
     * Initialize an object to store the positions of jewels.
     * The key will be the coordinate string "x y", and the value will be 1 (present) or 0 (collected).
     */
    var    jewels    =    { } ;


    // Loop to read and store the positions of 'n' jewels.
    for ( var i = 0 ; i < n ; i ++ )

    {
      // Store each jewel's position. Trim whitespace and set its value to 1.
      jewels [ lines . shift ( ) . trim ( ) ] = 1 ;
    }


    // Read the number of movements for the current test case.
    var    m    =    Number ( lines . shift ( ) . trim ( ) ) ;


    // Initialize the starting coordinates of the explorer.
    var    x    =    10 , y = 10 ;


    // Define the step changes for each direction (North, South, East, West).
    var    dirStep    =    { 'N' : [ 0 , 1 ] , 'S' : [ 0 , -1 ] , 'E' : [ 1 , 0 ] , 'W' : [ -1 , 0 ] } ;

    // Counter for the number of jewels found during the exploration.
    var    found    =    0 ;


    // Loop through each of the 'm' movement instructions.
    for ( var j = 0 ; j < m ; j ++ )

    {
      // Parse the movement instruction (e.g., "N 5").
      var    ops    =    lines . shift ( ) . trim ( ) . split ( ' ' ) ;

      // Extract the direction from the parsed operation.
      var    dir    =    ops [ 0 ] ;

      // Extract and convert the number of steps to take in the given direction.
      var    steps    =    Number ( ops [ 1 ] ) ;


      // Execute each individual step within the current movement instruction.
      for ( var s = 0 ; s < steps ; s ++ )

      {
        // Update the x-coordinate based on the direction.
        x    +=    dirStep [ dir ] [ 0 ] ;

        // Update the y-coordinate based on the direction.
        y    +=    dirStep [ dir ] [ 1 ] ;

        // Create a unique key string for the current coordinates.
        var    key    =    [ x , y ] . join ( ' ' ) ;


        // Check if there is an uncollected jewel at the current position.
        if ( jewels [ key ] )

        {
          // Increment the count of found jewels.
          found    +=    1 ;

          // Mark the jewel as collected by setting its value to 0.
          jewels [ key ]    =    0 ;
        }
      }
    }

    // Output "Yes" if all jewels were found, otherwise "No".
    console . log ( found    ==    m    ?    'Yes'    :    'No' ) ;
  }

} ) ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ;