/* This is a generated Type I clone of an existing JavaScript program.
 * It maintains exact structural and logical equivalence to the original,
 * with only variations in whitespace and comments.
 * The original program solves a problem involving grid manipulation and cutting.
 */
function Main ( input ) {
  // Process the raw input string.
  // First, remove leading/trailing whitespace.
  // Then, split into lines, and each line into space-separated tokens.
  input = input . trim ( ) . split ( "\n" ) . map ( function ( x ) {
    return x . split ( " " )
  } ) ;

  // Parse dimensions and the maximum allowed sum K from the first line of input.
  var H = parseInt ( input [ 0 ] [ 0 ] , 10 ) ; // Height of the grid
  var W = parseInt ( input [ 0 ] [ 1 ] , 10 ) ; // Width of the grid
  var K = parseInt ( input [ 0 ] [ 2 ] , 10 ) ; // Maximum sum allowed per segment

  // Initialize arrays to store the grid data and its prefix sums.
  arr_S = [ ] ; // Stores the parsed integer grid (S_ij)
  arr_SS = [ ] ; // Stores the 1D prefix sums for each row (S_i,j = sum(S_i,k for k=0 to j-1))

  // Temporary variable for calculations within loops.
  var tmp ;

  // Loop through each row of the input grid to populate arr_S and arr_SS.
  for ( var i = 0 ; i < H ; i ++ ) {
    // Parse the current row of the grid.
    // Each character is converted to an integer.
    arr_S . push ( input [ i + 1 ] [ 0 ] . split ( "" ) . map ( e => parseInt ( e , 10 ) ) ) ;

    // Initialize the prefix sum array for the current row with a leading zero.
    arr_SS . push ( [ 0 ] ) ;

    // Reset temporary sum for the current row.
    tmp = 0 ;

    // Calculate prefix sums for the current row.
    for ( var j = 0 ; j < W ; j ++ ) {
      tmp += arr_S [ i ] [ j ] ; // Accumulate sum
      arr_SS [ i ] . push ( tmp ) ; // Store the accumulated sum
    }
  }

  // This line was commented out in the original code, likely for debugging purposes.
  // console.log(arr_S, arr_SS);

  // N represents the number of horizontal cuts possible (H-1).
  var N = H - 1 ; /* N is the number of bits in the binary representation,
                     corresponding to H-1 potential cut positions. */

  // Declare variables for the main processing loop.
  var hDiv ; // Stores horizontal division information.
  var tmpRowSet ; // Stores combined rows based on horizontal cuts.
  var tmpSum ; // Stores prefix sums for the combined rows.
  var CountHCut ; // Counts the number of horizontal cuts made.
  var tmpCut ; // Stores the positions of vertical cuts.

  // Initialize 'ans' with an upper bound: max possible cuts (H-1 horizontal + W-1 vertical).
  var ans = ( H - 1 ) + ( W - 1 ) ;

  // Label for the outer loop, allowing 'continue whole_loop'.
  whole_loop:
  // Iterate through all possible combinations of horizontal cuts.
  // There are 2^(H-1) combinations.
  for ( var k = 0 ; k < Math . pow ( 2 , N ) ; k ++ ) {
    // The following line is commented out in the original, for specific test cases.
    // for ( var k = 3 ; k < 4 ; k ++ ) {

    // Initialize hDiv array. Its length will be adjusted to H.
    hDiv = [ 0 , 1 , 2 , 3 , 4 , 5 , 6 , 7 ] ;
    hDiv . length = H ; // Adjust array length to match H.

    // Start with the first row's prefix sums as the initial set of combined rows.
    tmpRowSet = [ arr_SS [ 0 ] . slice ( ) ] ;

    // This line was commented out in the original code, likely for debugging purposes.
    // console.log(hDiv, H);

    // Convert the loop counter 'k' to its binary string representation.
    tmp = k . toString ( 2 ) ;
    // Pad the binary string with leading zeros to ensure N bits.
    tmp = ( '0' . repeat ( N ) + tmp ) . substr ( -1 * N ) ;

    // Initialize the count of horizontal cuts for this combination.
    CountHCut = 0 ;

    // This line was commented out in the original code, likely for debugging purposes.
    // console.log(arr_SS)

    // Process each bit of the binary string 'tmp' to determine horizontal cuts.
    for ( var l = 0 ; l < tmp . length ; l ++ ) {
      // This line was commented out in the original code, likely for debugging purposes.
      // console.log("l", l);

      // If the bit is '0', it means no cut, so combine the current row with the previous segment.
      if ( tmp . substr ( l , 1 ) === '0' ) {
        hDiv [ l + 1 ] = hDiv [ l ] ; // Assign the same group ID.
        // Add the prefix sums of the current row to the last combined row in tmpRowSet.
        tmpRowSet [ tmpRowSet . length - 1 ] = VO ( tmpRowSet [ tmpRowSet . length - 1 ] , arr_SS [ l + 1 ] , '+' ) ;
      } else {
        // If the bit is '1', it means a cut, so start a new segment with the current row.
        tmpRowSet . push ( arr_SS [ l + 1 ] . slice ( ) ) ; // Add a new row set.
        CountHCut ++ ; // Increment the horizontal cut count.
      }
    }
    // This line was commented out in the original code, likely for debugging purposes.
    // console.log("hD",hDiv);
    // This line was commented out in the original code, likely for debugging purposes.
    // console.log("tRS", tmpRowSet);

    // Initialize tmpSum for each combined row set. These will track accumulated sums for vertical cuts.
    tmpSum = [ 0 , 0 , 0 , 0 , 0 , 0 , 0 , 0 ] ;
    tmpSum . length = tmpRowSet . length ; // Adjust length to match the number of combined rows.

    tmpCut = [ ] ; // Initialize array to store vertical cut positions.

    // Iterate through columns to determine vertical cuts.
    for ( var i = 1 ; i <= W ; i ++ ) {
      // Label for the inner loop, allowing 'break part_loop'.
      part_loop:
      // Check each combined row set for exceeding K.
      for ( var j = 0 ; j < tmpRowSet . length ; j ++ ) {
        // This line was commented out in the original code, likely for debugging purposes.
        // console.log("ji", j, i, tmpRowSet[j][i], tmpSum[j], tmpCut);

        // If the sum of the current segment (from last cut to current column) exceeds K.
        if ( tmpRowSet [ j ] [ i ] - tmpSum [ j ] > K ) {
          // If this is the first column AND no previous cut, or if the previous cut was at the same position,
          // this horizontal cut combination is invalid.
          if ( i === 1 || tmpCut [ tmpCut . length - 1 ] === i - 1 ) continue whole_loop ;

          // A cut is needed before the current column (between i-1 and i).
          tmpCut . push ( i - 1 ) ; /* This indicates a vertical cut
                                       between column i-1 and column i. */
          // Reset tmpSum for all combined rows to the prefix sum up to the new cut position (i-1).
          for ( var jj = 0 ; jj < tmpRowSet . length ; jj ++ ) {
            tmpSum [ jj ] = tmpRowSet [ jj ] [ i - 1 ] ; // Update sum for all combined rows.
            // This line was commented out in the original code, likely for debugging purposes.
            // console.log("here");
          }
          i -- ; // Re-evaluate the current column 'i' after the cut.
          break part_loop ; // Break from inner loop to re-check current column with new sums.
        }
      }
    }
    // This line was commented out in the original code, likely for debugging purposes.
    // console.log(CountHCut, tmpCut.length, tmpCut);

    // Update the minimum total cuts found so far.
    ans = Math . min ( ans , CountHCut + tmpCut . length ) ;
    // This line was commented out in the original code, likely for debugging purposes.
    // console.log("a", ans);

  } // End of the main loop iterating through horizontal cut combinations.

  // Output the final minimum number of cuts.
  console . log ( ans ) ;

}


/*
 * VO function: Vector Operation.
 * Performs element-wise operation (addition, subtraction, etc.) on two vectors.
 * If v2 has only one element, it attempts to broadcast it across v1's length.
 * Otherwise, v1 and v2 must have the same length.
 */
function VO ( v1 , v2 , op ) {
  var ans = [ ] ; // Initialize the result array.

  // Check for length mismatch.
  if ( v1 . length !== v2 . length ) {
    // If v2 is a single element, broadcast it.
    if ( v2 . length == 1 ) {
      v2 = Array . from ( { length: ( v1 . length ) } , ( ) => v2 ) ;
    } else {
      return null ; // Cannot perform operation if lengths don't match and v2 is not a single element.
    }
  }

  // Iterate through elements and perform the specified operation.
  for ( var i = 0 ; i < v1 . length ; i ++ ) {
    if ( op == '+' ) {
      ans . push ( v1 [ i ] + v2 [ i ] ) ;
    }
    if ( op == '-' ) {
      ans . push ( v1 [ i ] - v2 [ i ] ) ;
    }
    if ( op == '*' ) {
      ans . push ( v1 [ i ] * v2 [ i ] ) ;
    }
    if ( op == '/' ) {
      ans . push ( v1 [ i ] / v2 [ i ] ) ;
    }
    if ( op == '%' ) {
      ans . push ( v1 [ i ] % v2 [ i ] ) ;
    }
    if ( op == '||' ) { // This likely means Math.max based on original usage context.
      ans . push ( Math . max ( v1 [ i ] , v2 [ i ] ) ) ;
    }
  }
  return ans ; // Return the resulting vector.
}

// Call the main function with input read from standard input.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;