/*
 * This JavaScript code processes a 2D grid input
 * to assign unique identifiers to connected regions
 * based on a specific set of rules.
 * It reads input from /dev/stdin.
 */

console.log( ( ( args /* input arguments string */ ) => {
  // Destructure the input string
  const [ HWK, ...s ] = args.trim() .split `\n`;

  /*
   * Parse H, W, K from the first line.
   * H: Height, W: Width, K: (unused in this specific logic, but parsed)
   * The `0|v` is a bitwise OR with 0, a common trick for integer conversion.
   */
  const [ H, W, K ] = HWK.split ` ` .map( v => 0 | v );

  // Initialize a 2D map (grid) with dimensions H x W, filled with zeros.
  const map = Array .from( { length: H }, _ => Array( W ).fill( 0 ) );

  /**
   * Helper function 'cut' for propagating values in the map.
   * If map[i][j] already has a value, use it.
   * Otherwise, if 'k' has a value, assign 'k' to map[i][j].
   * If 'k' is 0 (falsy), then return 0.
   * This effectively propagates the last non-zero 'k' value.
   * @param {number} i - row index
   * @param {number} j - column index
   * @param {number} k - current propagating value
   * @returns {number} The value at map[i][j] after potential assignment.
   */
  const cut = ( i, j, k ) =>
      map[ i ][ j ]
          ? ( k = map[ i ][ j ] )
          : k
              ? ( map[ i ][ j ] = k )
              : k;


  let g = 0; // Global counter for unique region IDs.

  // First pass: Iterate rows to assign initial region IDs based on '#' characters
  // and propagate values horizontally.
  for ( let i = 0 ; i < H ; i ++ )
  {
    let k = 0; // Current propagating value for the row.

    // Forward pass: Assign new IDs when '#' is found.
    for ( let j = 0 ; j < W ; j ++ )
    {
      if ( s[ i ][ j ] === '#' )
      {
        k = ++g; // Increment global ID and assign it.
      }
      map[ i ][ j ] = k; // Assign current k to the map cell.
    }

    // Backward pass: Propagate values from right to left using the 'cut' function.
    // This ensures contiguous regions get the same ID even if '#' was on the left.
    for ( let j = W - 1 ; j >= 0 ; j -- )
    {
      k = cut( i, j, k );
    }
  }


  /*
   * Second pass: Iterate columns to propagate values vertically.
   * This handles regions that span across rows.
   */
  for ( let j = 0 ; j < W ; j ++ )
  {
    let k = 0; // Current propagating value for the column.

    // Forward pass (downwards): Propagate values.
    for ( let i = 0 ; i < H ; i ++ ) k = cut( i, j, k );

    // Backward pass (upwards): Propagate values.
    for ( let i = H - 1 ; i >= 0 ; i -- ) k = cut( i, j, k );
  }


  // Format the resulting map back into a string for output.
  // Each row's elements are joined by a space, and rows are joined by a newline.
  return map .map( r => r .join ` ` ) .join `\n`;

} ) ( require( 'fs' ) .readFileSync( '/dev/stdin', 'utf8' ) ) );

// End of script.