/*
 * This JavaScript module processes coordinate data to find a maximum matching.
 * It expects input from stdin, where the first line specifies the count 'N',
 * followed by 'N' pairs of red point coordinates, and then 'N' pairs of blue point coordinates.
 * The goal is to match blue points with red points under specific conditions.
 */
console . log ( ( args => {

  // The input string 'args' is first trimmed, then split by newlines.
  // Each resulting row is further split by spaces, and values are converted to integers.
  // The first element of the first row is N, and the rest form the 'tmp' array.
  const [ [ N ] , ...tmp ] = args . trim ( ) . split ( '\n' ) . map ( r => r . split ( ' ' ) . map ( v => v | 0 ) ) ;

  // Initialize two arrays: 'rp' for red points and 'bp' for blue points.
  const rp = [ ] , bp = [ ] ;

  // Loop N times to populate the 'rp' and 'bp' arrays.
  // The first N entries from 'tmp' go into 'rp'.
  // The next N entries (from index N to 2N-1) from 'tmp' go into 'bp'.
  for ( let i = 0 ; i < N ; i ++ ) {
    rp . push ( tmp [ i ] ) ;
    bp . push ( tmp [ N + i ] ) ;
  }

  // Sort the 'bp' (blue points) array based on their x-coordinate in ascending order.
  // The sort function takes two elements, extracts their first component (x-coordinate),
  // and compares them.
  bp . sort ( ( [ a ] , [ b ] ) => a - b ) ;

  // Initialize a counter for successful matches.
  let count = 0 ;

  // This 'test' array is declared but not used in the final logic.
  // It is maintained to preserve the exact structure of the original code.
  const test = [ ] ;

  // Begin the main matching algorithm.
  // Iterate through each blue point in the sorted 'bp' array.
  for ( let i = 0 ; i < N ; i ++ ) {

    // Destructure the current blue point's coordinates into 'bx' (x-coordinate)
    // and 'by' (y-coordinate).
    const [ bx , by ] = bp [ i ] ;

    // Initialize 'max' to keep track of the best red point found for the current blue point.
    // 'max[0]' will store the index of the red point in 'rp', and 'max[1]' its y-coordinate.
    // Initial value [-1, -1] indicates no suitable red point found yet.
    let max = [ -1 , -1 ] ;

    // Iterate through the currently available red points.
    for ( let j = 0 ; j < rp . length ; j ++ ) {

      // Destructure the current red point's coordinates into 'rx' and 'ry'.
      const [ rx , ry ] = rp [ j ] ;

      // Condition 1: A blue point can only match a red point if its x-coordinate
      // is greater than the red point's x-coordinate.
      if ( bx < rx ) continue ;

      // Condition 2: A blue point can only match a red point if its y-coordinate
      // is greater than the red point's y-coordinate.
      // Additionally, we want to find the red point with the largest y-coordinate
      // that satisfies both conditions.
      if ( by > ry && ry > max [ 1 ] ) {
        max = [ j , ry ] ; // Update 'max' with the new best red point.
      }
    }

    // After checking all red points, if a suitable red point was found (i.e., max[1] is not -1),
    // then perform the match.
    if ( max [ 1 ] >= 0 ) {
      rp . splice ( max [ 0 ] , 1 ) ; // Remove the matched red point from 'rp' to prevent re-matching.
      count ++ ; // Increment the total count of successful matches.
    }
  }

  // The final count of successful matches is returned as a string.
  return `${count}` ;

} ) ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ) ;