/*
 * This is the main entry point function for the program.
 * It takes the raw input string as an argument.
 */
function Main(  input  )
{
  // First, process the raw input data.
  // Trim any leading/trailing whitespace, split into lines,
  // and then split each line by spaces.
 input = input . trim ( ) . split ( "\n" ) . map (  function( x ) { return x . split ( " " ) } ) ;

  // Extract the height (H) and width (W) from the first line of input.
  // Using parseInt with radix 10 for explicit base.
  var H = parseInt( input[0][0] ,  10 );
  var W = parseInt( input[0][1] ,  10 );

  // Initialize arrays to store grid data and temporary island information.
  // arr_S will hold the character grid.
  var arr_S = [ ] ;
  // colorPairMap will indicate if a cell matches the checkerboard pattern.
  var colorPairMap = [ ] ;
  // tmpIslandMap will store the ID of the island each cell belongs to.
  var tmpIslandMap = [ ] ;

  // Loop through each row to populate the arrays.
  // This loop initializes the grid structures.
  for ( var i = 0 ;  i < H ;  i++  )
  {
    // Push the current row of the input grid into arr_S.
    arr_S . push ( input[ i + 1 ] ) ;
    // Initialize a row in colorPairMap with zeros.
    colorPairMap . push ( Array . from ( { length : W } , ( ) => 0 ) ) ;
    // Initialize a row in tmpIslandMap with -1, indicating unassigned islands.
    tmpIslandMap . push ( Array . from ( { length : W } , ( ) => -1 ) ) ;
  }

  // Temporary variable to hold expected checkerboard character.
  var tmp = '' ;

  // This nested loop calculates the initial color pairing for each cell.
  // It checks if the cell's character matches a checkerboard pattern.
  for (  var i = 0 ;  i < H ;  i++  )
  {
    for (  var j = 0 ;  j < W ;  j++  )
    {
      // Determine the expected character based on checkerboard pattern.
      // (row + col) % 2 == 0 implies '#' (e.g., top-left is #)
      if ( ( i + j ) % 2 === 0 )
      {
        tmp = '#' ;
      }
      else
      {
        // Otherwise, it should be a '.'
        tmp = '.' ;
      }

      // Compare the actual character with the expected checkerboard character.
      // If they match, set colorPairMap[i][j] to 1.
      if ( arr_S[i][0] . substr ( j , 1 ) === tmp )
      {
        colorPairMap[i][j] = 1 ;
      }
    }
  }


  // Variables used during the island identification process.
  var tmpIslandID = 0 ; // Counter for unique island IDs.
  var tmpAdj = [ ] ; // Temporary array to store adjacent island IDs.
  var eachIslandColorCount = [ ] ; // Stores counts of '#' and '.' for each island.
  var eachIslandCoordinates = [ ] ; // Stores coordinates of cells belonging to each island.
  var tmpList ; // Temporary list for merging island coordinates.

  // This is the core logic for identifying and merging islands.
  // It iterates through each cell in the grid.
  for ( var i = 0 ;  i < H ;  i++  )
  {
    for ( var j = 0 ;  j < W ;  j++  )
    {
      // console.log(i, j); // Debugging comment, keeping it as is.
      tmpAdj = [ ] ; // Reset temporary adjacent island list for current cell.

      // Check the cell above (i-1, j) if it's within bounds.
      if ( ( i - 1 ) >= 0 )
      {
        // If the colorPairMap value matches, add its island ID to tmpAdj.
        if ( colorPairMap[ i - 1 ][ j ] === colorPairMap[ i ][ j ] )
        {
          tmpAdj . push ( tmpIslandMap[ i - 1 ][ j ] ) ;
        }
      }

      // Check the cell to the left (i, j-1) if it's within bounds.
      if ( ( j - 1 ) >= 0 )
      {
        // If the colorPairMap value matches, add its island ID to tmpAdj.
        if ( colorPairMap[ i ][ j - 1 ] === colorPairMap[ i ][ j ] )
        {
          tmpAdj . push ( tmpIslandMap[ i ][ j - 1 ] ) ;
        }
      }

      // Case 1: Current cell is adjacent to two already identified islands
      // and shares the same checkerboard color pattern.
      if ( tmpAdj . length > 1 )
      {
        // If the two adjacent islands are different IDs, they need to be merged.
        if ( tmpAdj[0] !== tmpAdj[1] )
        {
          // Get the coordinates of the island with the larger ID.
          tmpList = eachIslandCoordinates[ Math . max ( tmpAdj[0] , tmpAdj[1] ) ] ;

          // Reassign all cells from the larger ID island to the smaller ID island.
          for ( var k = 0 ;  k < tmpList . length ;  k++  )
          {
            tmpIslandMap[ tmpList[k][0] ][ tmpList[k][1] ] = Math . min ( tmpAdj[0] , tmpAdj[1] ) ;
            eachIslandCoordinates[ Math . min ( tmpAdj[0] , tmpAdj[1] ) ] . push ( [ tmpList[k][0] , tmpList[k][1] ] ) ;
          }

          // Merge color counts using the VO helper function (vector operation).
          eachIslandColorCount[ Math . min ( tmpAdj[0] , tmpAdj[1] ) ] = VO ( eachIslandColorCount[ Math . min ( tmpAdj[0] , tmpAdj[1] ) ] , eachIslandColorCount[ Math . max ( tmpAdj[0] , tmpAdj[1] ) ] , '+' ) ;
          // Mark the merged (larger ID) island as null to indicate it's no longer active.
          eachIslandColorCount[ Math . max ( tmpAdj[0] , tmpAdj[1] ) ] = null ;
        }
        // Assign the current cell to the merged island (the one with the smaller ID).
        tmpIslandMap[ i ][ j ] = Math . min ( tmpAdj[0] , tmpAdj[1] ) ;
        // Increment the color count for the assigned island based on the cell's checkerboard parity.
        eachIslandColorCount[ tmpIslandMap[ i ][ j ] ][ ( i + j ) % 2 ]++ ;
        // Add the current cell's coordinates to the assigned island's list.
        eachIslandCoordinates[ tmpIslandMap[ i ][ j ] ] . push ( [ i , j ] ) ;
      }

      // Case 2: Current cell is adjacent to exactly one existing island
      // and shares the same checkerboard color pattern.
      if ( tmpAdj . length === 1 )
      {
        // Assign the current cell to the adjacent island.
        tmpIslandMap[ i ][ j ] = tmpAdj[0] ;
        // Update the color count for this island.
        eachIslandColorCount[ tmpAdj[0] ][ ( i + j ) % 2 ]++ ;
        // Add the current cell's coordinates to the island.
        eachIslandCoordinates[ tmpAdj[0] ] . push ( [ i , j ] ) ;
      }

      // Case 3: Current cell is not adjacent to any existing island
      // that shares the same checkerboard color pattern.
      if ( tmpAdj . length === 0 )
      {
        // Create a new island for this cell.
        tmpIslandMap[ i ][ j ] = tmpIslandID ;
        // Initialize color counts for the new island.
        eachIslandColorCount[ tmpIslandID ] = [ 0 , 0 ] ;
        // Increment the count for the current cell's color.
        eachIslandColorCount[ tmpIslandID ][ ( i + j ) % 2 ]++ ;
        // Initialize coordinates for the new island with the current cell.
        eachIslandCoordinates[ tmpIslandID ] = [ [ i , j ] ] ;
        // Increment the global island ID counter for the next new island.
        tmpIslandID++ ;
      }
    } // End of inner loop (j)
  } // End of outer loop (i)

  // Calculate the final answer.
  // The answer is the sum of products of color counts for each valid island.
  var ans = 0 ;

  // Iterate through all identified islands.
  for ( var i of eachIslandColorCount )
  {
    // Only consider islands that were not merged (i.e., not null).
    if ( i != null )
    {
      // Add the product of the two color counts (e.g., # and .) to the total.
      ans += i[0] * i[1] ;
    }
  }

  // console.log(ans, tmpIslandMap, eachIslandColorCount); // Another debugging comment.
  // Output the final calculated answer.
  console . log ( ans ) ;
} // End of Main function definition.

/**
 * Vector Operation (VO) function.
 * Performs an element-wise operation between two vectors (arrays).
 *
 * @param {Array<number>} v1 - The first vector.
 * @param {Array<number>} v2 - The second vector.
 * @param {string} op - The operation to perform ('+', '-', '*', '/', '%', '||').
 * @returns {Array<number>|null} - The result vector or null if dimensions are incompatible.
 */
function VO (  v1  ,  v2  ,  op  )
{
  var ans = [ ] ; // Initialize the result array.

  // Handle dimension mismatch for vector operations.
  if ( v1 . length !== v2 . length )
  {
    // If v2 has only one element, 'broadcast' it to match v1's length.
    if ( v2 . length == 1 )
    {
      v2 = Array . from ( { length : ( v1 . length ) } , ( ) => v2 ) ;
    }
    else
    {
      // If lengths are genuinely incompatible, return null.
      return null ;
    }
  }

  // Iterate through elements and apply the specified operation.
  for ( var i = 0 ;  i < v1 . length ;  i++  )
  {
    if ( op == '+' )
    {
      ans . push ( v1[i] + v2[i] ) ;
    }
    if ( op == '-' )
    {
      ans . push ( v1[i] - v2[i] ) ;
    }
    if ( op == '*' )
    {
      ans . push ( v1[i] * v2[i] ) ;
    }
    if ( op == '/' )
    {
      ans . push ( v1[i] / v2[i] ) ;
    }
    if ( op == '%' )
    {
      ans . push ( v1[i] % v2[i] ) ;
    }
    if ( op == '||' )
    {
      // For '||' (logical OR, or maximum in this context), push the maximum.
      ans . push ( Math . max ( v1[i] , v2[i] ) ) ;
    }
  }
  return ans ; // Return the computed result vector.
}


// The program execution starts here.
// It reads input from standard input (/dev/stdin) using Node.js 'fs' module.
// The read content is then passed to the Main function.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;