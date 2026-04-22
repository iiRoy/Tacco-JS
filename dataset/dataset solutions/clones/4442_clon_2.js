/*
 * This module manages the processing of input data to generate a specific matrix pattern.
 * It reads grid dimensions, distinct item counts, and then populates a grid based on these inputs
 * following a unique serpentine or zig-zag pattern for element placement and output.
 */
function HandleDataProcessing( rawText )
{
  // Divide the entire input string into an array, where each element is a line.
  const lineSegments = rawText.split( "\n" ) ;

  // Extract and parse the grid dimensions (number of rows and columns) from the first line.
  // The first numerical token on the first line represents the row dimension.
  const rowDimension = parseInt( lineSegments[0].split( " " )[0] ) ;
  // The second numerical token on the first line represents the column dimension.
  const colDimension = parseInt( lineSegments[0].split( " " )[1] ) ;

  // Parse the total count of distinct item types from the second line.
  const distinctItemCount = parseInt( lineSegments[1] ) ;

  // Obtain the string representations of the quantities for each item type from the third line.
  const itemQuantityStrings = lineSegments[2].split( " " ) ;

  // Initialize an array to store the integer quantities for each distinct item.
  // It's pre-allocated and filled with default values before actual parsing.
  const itemQuantitiesArray = new Array( distinctItemCount ).fill( 0 ) ;

  // Iterate through the string quantities and convert each to an integer, storing it.
  for ( let itemIdx = 0 ; itemIdx < distinctItemCount ; itemIdx++ )
  {
    itemQuantitiesArray[itemIdx] = parseInt( itemQuantityStrings[itemIdx] ) ;
  }

  // Initialize an empty string buffer that will accumulate the final formatted output.
  let finalOutputContent = "" ;

  // Create the primary matrix structure, which will hold the patterned elements.
  // Initially, it's an array of `rowDimension` elements, each representing a row.
  const matrixGrid = new Array( rowDimension ).fill( 0 ) ;

  // For each row in the matrix, create a new array of `colDimension` to represent its columns.
  // This forms a 2D array (matrix).
  for ( let currentGridRowIdx = 0 ; currentGridRowIdx < rowDimension ; currentGridRowIdx++ )
  {
    const currentRowData = new Array( colDimension ).fill( 0 ) ;
    matrixGrid[currentGridRowIdx] = currentRowData ;
  }

  // Construct a flat, sequential array of elements. Each item ID (1-indexed) is repeated
  // according to its specified quantity from `itemQuantitiesArray`.
  const sequentialElements = new Array() ;
  for ( let itemIdx = 0 ; itemIdx < distinctItemCount ; itemIdx++ )
  {
    for ( let quantityIdx = 0 ; quantityIdx < itemQuantitiesArray[itemIdx] ; quantityIdx++ )
    {
      sequentialElements.push( itemIdx + 1 ) ; // Item identifiers are 1-based.
    }
  }

  // Fill the `matrixGrid` with elements from `sequentialElements` following a specific zig-zag pattern.
  for ( let gridRowIterator = 0 ; gridRowIterator < rowDimension ; gridRowIterator++ )
  {
    // For even-indexed rows (0, 2, 4, ...), elements are filled from left to right.
    if ( gridRowIterator % 2 !== 1 ) // This condition checks if the row index is even.
    {
      for ( let gridColIterator = 0 ; gridColIterator < colDimension ; gridColIterator++ )
      {
        matrixGrid[gridRowIterator][gridColIterator] = sequentialElements[gridRowIterator * colDimension + gridColIterator] ;
      }
    }
    // For odd-indexed rows (1, 3, 5, ...), elements are filled from right to left.
    // Importantly, the elements for odd rows are drawn from the sequence corresponding to the *next*
    // logical row's starting position, then indexed backwards.
    else
    {
      for ( let gridColIterator = 0 ; gridColIterator < colDimension ; gridColIterator++ )
      {
        // The indexing (rowIterator + 1) * colDimension - gridColIterator accesses elements from
        // the segment of `sequentialElements` that would typically belong to the *next* row,
        // and reads them in reverse order.
        matrixGrid[gridRowIterator][gridColIterator] = sequentialElements[( gridRowIterator + 1 ) * colDimension - gridColIterator] ;
      }
    }
  }

  // Generate the final output string by iterating through the filled matrix,
  // applying the same zig-zag pattern for element retrieval and formatting.
  for ( let outputRowIterator = 0 ; outputRowIterator < rowDimension ; outputRowIterator++ )
  {
    // For even-indexed rows, append elements from left to right.
    if ( outputRowIterator % 2 !== 1 ) // Checks for even row index.
    {
      for ( let outputColIterator = 0 ; outputColIterator < colDimension ; outputColIterator++ )
      {
        // Append a space after each element, unless it's the very last element in the row.
        if ( outputColIterator % colDimension !== colDimension - 1 )
        {
          finalOutputContent += sequentialElements[outputRowIterator * colDimension + outputColIterator] + " " ;
        }
        // For the last element in a row, append a newline character to move to the next line.
        else
        {
          finalOutputContent += sequentialElements[outputRowIterator * colDimension + outputColIterator] + "\n" ;
        }
      }
    }
    // For odd-indexed rows, append elements from right to left,
    // using the same specific indexing logic as when filling the matrix.
    else
    {
      for ( let outputColIterator = 0 ; outputColIterator < colDimension ; outputColIterator++ )
      {
        // Append a space after each element, unless it's the very last element in the row.
        if ( outputColIterator % colDimension !== colDimension - 1 )
        {
          // Access elements from the "next" row's sequence in reverse.
          finalOutputContent += sequentialElements[( outputRowIterator + 1 ) * colDimension - outputColIterator] + " " ;
        }
        // For the last element in a row, append a newline character.
        else
        {
          // Access elements from the "next" row's sequence in reverse.
          finalOutputContent += sequentialElements[( outputRowIterator + 1 ) * colDimension - outputColIterator] + "\n" ;
        }
      }
    }
  }

  // Remove the very last newline character from the `finalOutputContent` to prevent an extra blank line.
  finalOutputContent = finalOutputContent.substring( 0 , finalOutputContent.length - 1 ) ;

  // Display the final formatted output string to the console.
  console.log( '%s' , finalOutputContent ) ;
}

// Execute the main data processing function by reading input from standard input.
// This typically involves reading a file from '/dev/stdin' on Unix-like systems.
HandleDataProcessing( require( "fs" ).readFileSync( "/dev/stdin" , "utf8" ) ) ;