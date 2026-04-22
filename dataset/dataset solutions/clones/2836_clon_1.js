function    Main   (   input   )   {
  // This variable is declared but not used in the original logic.
  // It might be a placeholder or intended for future use.
  var    result  ;

  // Parsing the number of entries from the input array.
  // input.shift() removes the first element and returns it.
  const   N   =   parseInt (   input.shift ( )   )   ;

  // The remaining part of the input array contains the x, y, and direction data.
  const   XYD   =   input   ;

  // Initialize boundary variables for different directions.
  // L_xmin, L_xmax: X-coordinates for 'L' (Left) moving elements.
  var L_xmin = Number.MAX_SAFE_INTEGER    ;
  var L_xmax = Number.MIN_SAFE_INTEGER    ;

  // LR_ymin, LR_ymax: Y-coordinates for 'L' and 'R' (Left and Right) moving elements.
  var LR_ymin = Number.MAX_SAFE_INTEGER    ;
  var LR_ymax = Number.MIN_SAFE_INTEGER    ;

  // R_xmin, R_xmax: X-coordinates for 'R' (Right) moving elements.
  var R_xmin = Number.MAX_SAFE_INTEGER    ;
  var R_xmax = Number.MIN_SAFE_INTEGER    ;

  // UD_xmin, UD_xmax: X-coordinates for 'U' and 'D' (Up and Down) moving elements.
  var UD_xmin = Number.MAX_SAFE_INTEGER    ;
  var UD_xmax = Number.MIN_SAFE_INTEGER    ;

  // U_ymin, U_ymax: Y-coordinates for 'U' (Up) moving elements.
  var U_ymin = Number.MAX_SAFE_INTEGER    ;
  var U_ymax = Number.MIN_SAFE_INTEGER    ;

  // D_ymin, D_ymax: Y-coordinates for 'D' (Down) moving elements.
  var D_ymin = Number.MAX_SAFE_INTEGER    ;
  var D_ymax = Number.MIN_SAFE_INTEGER    ;

  // Flags to check if any elements exist for each direction.
  var   hasL   =   false   ,
        hasR   =   false   ,
        hasU   =   false   ,
        hasD   =   false   ;


  // Loop through each element to process its coordinates and direction.
  for    (   var   i   =   0   ;   i   <   N   ;   i ++   )    {

    // Extract x-coordinate, y-coordinate, and direction string for the current element.
    var   x   =   parseInt (   input [   i   *   3   ]   )   ;
    var   y   =   parseInt (   input [   i   *   3   +   1   ]   )   ;
    var   st   =   input [   i   *   3   +   2   ]   ;

    // Use a switch statement to handle different directions.
    switch    (   st   )    {
      case   "L"   :
        // Update min/max X for 'L' elements.
        L_xmin   =   Math.min (   L_xmin   ,   x   )   ;
        L_xmax   =   Math.max (   L_xmax   ,   x   )   ;

        // Update min/max Y for 'L' and 'R' elements (grouped as LR).
        LR_ymin   =   Math.min (   LR_ymin   ,   y   )   ;
        LR_ymax   =   Math.max (   LR_ymax   ,   y   )   ;

        // Set flag indicating presence of 'L' elements.
        hasL   =   true   ;
        break   ;

      case   "R"   :
        // Update min/max X for 'R' elements.
        R_xmin   =   Math.min (   R_xmin   ,   x   )   ;
        R_xmax   =   Math.max (   R_xmax   ,   x   )   ;

        // Update min/max Y for 'L' and 'R' elements (grouped as LR).
        LR_ymin   =   Math.min (   LR_ymin   ,   y   )   ;
        LR_ymax   =   Math.max (   LR_ymax   ,   y   )   ;

        // Set flag indicating presence of 'R' elements.
        hasR   =   true   ;
        break   ;

      case   "U"   :
        // Update min/max X for 'U' and 'D' elements (grouped as UD).
        UD_xmin   =   Math.min (   UD_xmin   ,   x   )   ;
        UD_xmax   =   Math.max (   UD_xmax   ,   x   )   ;

        // Update min/max Y for 'U' elements.
        U_ymin   =   Math.min (   U_ymin   ,   y   )   ;
        U_ymax   =   Math.max (   U_ymax   ,   y   )   ;

        // Set flag indicating presence of 'U' elements.
        hasU   =   true   ;
        break   ;

      case   "D"   :
        // Update min/max X for 'U' and 'D' elements (grouped as UD).
        UD_xmin   =   Math.min (   UD_xmin   ,   x   )   ;
        UD_xmax   =   Math.max (   UD_xmax   ,   x   )   ;

        // Update min/max Y for 'D' elements.
        D_ymin   =   Math.min (   D_ymin   ,   y   )   ;
        D_ymax   =   Math.max (   D_ymax   ,   y   )   ;

        // Set flag indicating presence of 'D' elements.
        hasD   =   true   ;
        break   ;

      default   :
        // No action needed for other cases, if any.
        break   ;
    }
  }

  // Initialize sum with a very large value to find the minimum area.
  var   sum   =   Number.MAX_SAFE_INTEGER   ;

  // Loop control variable.
  var   loop   =   true   ;

  // Main simulation loop.
  while    (   loop   )    {

    // Calculate the overall minimum and maximum X and Y coordinates considering all directions.
    var   minX   =   Math.min (   R_xmin   ,   L_xmin   ,   UD_xmin   )   ;
    var   maxX   =   Math.max (   R_xmax   ,   L_xmax   ,   UD_xmax   )   ;
    var   minY   =   Math.min (   LR_ymin   ,   U_ymin   ,   D_ymin   )   ;
    var   maxY   =   Math.max (   LR_ymax   ,   U_ymax   ,   D_ymax   )   ;

    // Update the minimum sum (area) encountered so far.
    sum   =   Math.min (   sum   ,   (   maxX   -   minX   )   *   (   maxY   -   minY   )   )   ;

    // Determine if the loop should continue.
    // The loop stops when all boundary conditions are met or there are no elements for a direction.
    loop   =   !   (
              (   minX   ==   L_xmin   ||   !   hasL   )   &&
              (   maxX   ==   R_xmax   ||   !   hasR   )   &&
              (   minY   ==   D_ymin   ||   !   hasD   )   &&
              (   maxY   ==   U_ymax   ||   !   hasU   )
            )   ;

    // Adjust coordinates for the next iteration based on movement directions.
    // 'L' elements move left, so their x-coordinates decrease.
    L_xmin --   ;
    L_xmax --   ;

    // 'R' elements move right, so their x-coordinates increase.
    R_xmin ++   ;
    R_xmax ++   ;

    // 'U' elements move up, so their y-coordinates increase.
    U_ymin ++   ;
    U_ymax ++   ;

    // 'D' elements move down, so their y-coordinates decrease.
    D_ymin --   ;
    D_ymax --   ;
  }

  // Output the calculated minimum area.
  console.log (   sum   )   ;
}

// The following lines are for input handling, typically used in competitive programming environments.

// Example: For single-line input.
// Main(require("fs").readFileSync("/dev/stdin", "utf8").trim());

// Example: For input split by newlines.
// Main(require("fs").readFileSync("/dev/stdin", "utf8").trim().split(/\n/));

// This is the active input handling method: split by newlines or spaces.
Main (   require (   "fs"   ) . readFileSync (   "/dev/stdin"   ,   "utf8"   ) . trim ( ) . split (   / \n | \s /   )   )   ;