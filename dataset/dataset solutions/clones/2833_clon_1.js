function Main ( input ) {
  // Declare a variable to store the final result, though it's not directly used for assignment here.
  // The 'sum' variable will hold the final calculated value.
  var result ;

  // Parse the number of elements (N) from the input array.
  // input.shift() removes the first element, which is N, and returns it.
  const N = parseInt( input.shift( ) ) ;

  // The remaining input array contains the X, Y, and direction (D) data.
  const XYD = input ;

  /*
   * Initialize boundary variables for different directions.
   * L_xmin, L_xmax: Minimum/Maximum X-coordinate for 'L' (Left) moving objects.
   * R_xmin, R_xmax: Minimum/Maximum X-coordinate for 'R' (Right) moving objects.
   * UD_xmin, UD_xmax: Minimum/Maximum X-coordinate for 'U' (Up) and 'D' (Down) moving objects.
   * U_ymin, U_ymax: Minimum/Maximum Y-coordinate for 'U' (Up) moving objects.
   * D_ymin, D_ymax: Minimum/Maximum Y-coordinate for 'D' (Down) moving objects.
   * LR_ymin, LR_ymax: Minimum/Maximum Y-coordinate for 'L' (Left) and 'R' (Right) moving objects.
   *
   * Initializing with MAX_SAFE_INTEGER for 'min' ensures any coordinate will be smaller.
   * Initializing with MIN_SAFE_INTEGER for 'max' ensures any coordinate will be larger.
   */
  var L_xmin  =  Number.MAX_SAFE_INTEGER ,
      L_xmax  =  Number.MIN_SAFE_INTEGER ,
      LR_ymin =  Number.MAX_SAFE_INTEGER ,
      LR_ymax =  Number.MIN_SAFE_INTEGER ,
      R_xmin  =  Number.MAX_SAFE_INTEGER ,
      R_xmax  =  Number.MIN_SAFE_INTEGER ,
      UD_xmin =  Number.MAX_SAFE_INTEGER ,
      UD_xmax =  Number.MIN_SAFE_INTEGER ,
      U_ymin  =  Number.MAX_SAFE_INTEGER ,
      U_ymax  =  Number.MIN_SAFE_INTEGER ,
      D_ymin  =  Number.MAX_SAFE_INTEGER ,
      D_ymax  =  Number.MIN_SAFE_INTEGER ;

  // Flags to check if any objects for a specific direction exist.
  // These are crucial for handling cases where no objects move in a certain direction.
  var hasL = false , hasR = false , hasU = false , hasD = false ;

  // Loop through each set of (x, y, direction) data.
  // Each set consists of 3 elements in the input array.
  for ( var i = 0 ; i < N ; i++ ) {
    // Extract x-coordinate, parse it as an integer.
    var x = parseInt( input[ i * 3 ] ) ;
    // Extract y-coordinate, parse it as an integer.
    var y = parseInt( input[ i * 3 + 1 ] ) ;
    // Extract the direction string.
    var st = input[ i * 3 + 2 ] ;

    // Use a switch statement to process based on the direction.
    switch ( st ) {
      case "L" : // For objects moving 'Left'
        L_xmin  =  Math.min( L_xmin , x ) ; // Update min X for L
        L_xmax  =  Math.max( L_xmax , x ) ; // Update max X for L
        LR_ymin =  Math.min( LR_ymin , y ) ; // Update min Y for LR group
        LR_ymax =  Math.max( LR_ymax , y ) ; // Update max Y for LR group
        hasL    =  true ; // Mark that there's at least one 'L' object
        break ;
      case "R" : // For objects moving 'Right'
        R_xmin  =  Math.min( R_xmin , x ) ; // Update min X for R
        R_xmax  =  Math.max( R_xmax , x ) ; // Update max X for R
        LR_ymin =  Math.min( LR_ymin , y ) ; // Update min Y for LR group
        LR_ymax =  Math.max( LR_ymax , y ) ; // Update max Y for LR group
        hasR    =  true ; // Mark that there's at least one 'R' object
        break ;
      case "U" : // For objects moving 'Up'
        UD_xmin =  Math.min( UD_xmin , x ) ; // Update min X for UD group
        UD_xmax =  Math.max( UD_xmax , x ) ; // Update max X for UD group
        U_ymin  =  Math.min( U_ymin , y ) ; // Update min Y for U
        U_ymax  =  Math.max( U_ymax , y ) ; // Update max Y for U
        hasU    =  true ; // Mark that there's at least one 'U' object
        break ;
      case "D" : // For objects moving 'Down'
        UD_xmin =  Math.min( UD_xmin , x ) ; // Update min X for UD group
        UD_xmax =  Math.max( UD_xmax , x ) ; // Update max X for UD group
        D_ymin  =  Math.min( D_ymin , y ) ; // Update min Y for D
        D_ymax  =  Math.max( D_ymax , y ) ; // Update max Y for D
        hasD    =  true ; // Mark that there's at least one 'D' object
        break ;
      default :
        // This case should ideally not be reached if input is valid.
        // No action needed for default.
        break ;
    }
  }

  // Initialize 'sum' with a very large value to find the minimum area.
  var sum = Number.MAX_SAFE_INTEGER ;
  // Control flag for the simulation loop.
  var loop = true ;

  // This loop simulates time steps, expanding the boundaries of the objects.
  while ( loop ) {
    // Calculate the overall minimum X and maximum X coordinates considering all object types.
    // Note: If a direction has no objects (e.g., !hasL), its min/max will be MAX/MIN_SAFE_INTEGER,
    // so Math.min/max will effectively ignore them if other directions have valid coordinates.
    // However, if all directions are empty, then minX and maxX will remain their initial values.
    var minX = Math.min( R_xmin , L_xmin , UD_xmin ) ;
    var maxX = Math.max( R_xmax , L_xmax , UD_xmax ) ;

    // Calculate the overall minimum Y and maximum Y coordinates considering all object types.
    var minY = Math.min( LR_ymin , U_ymin , D_ymin ) ;
    var maxY = Math.max( LR_ymax , U_ymax , D_ymax ) ;

    // Calculate the current area and update 'sum' if it's smaller.
    // The area is (width * height).
    sum = Math.min( sum , ( maxX - minX ) * ( maxY - minY ) ) ;

    // Determine if the loop should continue.
    // The loop stops when the bounding box can no longer shrink by moving objects.
    // This happens when the overall min/max X/Y match the boundary of an object
    // that won't expand further in that direction, or if there are no objects
    // for a particular boundary.
    loop = !(
      ( minX == L_xmin || !hasL ) && // If overall minX is determined by L_xmin, or no 'L' objects exist
      ( maxX == R_xmax || !hasR ) && // If overall maxX is determined by R_xmax, or no 'R' objects exist
      ( minY == D_ymin || !hasD ) && // If overall minY is determined by D_ymin, or no 'D' objects exist
      ( maxY == U_ymax || !hasU )    // If overall maxY is determined by U_ymax, or no 'U' objects exist
    ) ;

    // Simulate movement for the next time step by adjusting boundaries by 0.5 units.
    // 'L' objects move left, so their x-coords decrease.
    L_xmin -= 0.5 ;
    L_xmax -= 0.5 ;
    // 'R' objects move right, so their x-coords increase.
    R_xmin += 0.5 ;
    R_xmax += 0.5 ;
    // 'U' objects move up, so their y-coords increase.
    U_ymin += 0.5 ;
    U_ymax += 0.5 ;
    // 'D' objects move down, so their y-coords decrease.
    D_ymin -= 0.5 ;
    D_ymax -= 0.5 ;
  }
  // Output the minimum calculated area to the console.
  console.log( sum ) ;
}

// The following lines are for handling input in a typical competitive programming environment.
// They read from standard input, trim whitespace, and split the content into an array.

// Example for single-line input (commented out):
// Main( require( "fs" ).readFileSync( "/dev/stdin" , "utf8" ).trim( ) ) ;

// Example for input split by newlines (commented out):
// Main( require( "fs" ).readFileSync( "/dev/stdin" , "utf8" ).trim( ).split( /\n/ ) ) ;

// This is the chosen input method: split by newlines OR spaces.
// It reads the entire standard input, removes leading/trailing whitespace,
// then splits the string into an array using either newline or space as a delimiter.
Main( require( "fs" ).readFileSync( "/dev/stdin" , "utf8" ).trim( ).split( /\n|\s/ ) ) ;