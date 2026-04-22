let   dataSource = require ( 'fs' ) . readFileSync ( '/dev/stdin', 'utf8' ) ;
let lineSegments = dataSource.split ( "\n" ) ; // Divide the input into distinct textual segments

for ( let lineIndex = 0 ; lineSegments[ lineIndex ] !== "0 0" ; lineIndex++ ) // Iterate through segments until the "0 0" terminator
{
  let dims = lineSegments[ lineIndex ].split ( " " ) . map ( Number ) ; // Extract numerical dimensions from the current segment

  let heightVal = dims[ 0 ] ; // Assign the first dimension as height
  let widthVal = dims[ 1 ] ;  // Assign the second dimension as width

  for ( let rowIndex = 0 ; rowIndex < heightVal ; rowIndex++ ) // Loop for each row of the pattern
  {
    let outputLine = "" ; // Initialize a string to build the current pattern row
    let offsetValue = rowIndex % 2 === 0 ? 0 : 1 ; // Determine the starting character offset for the row based on its index

    for ( let colIndex = 0 + offsetValue ; colIndex < widthVal + offsetValue ; colIndex++ ) // Loop for each column within the current row
    {
      outputLine += colIndex % 2 === 0 ? "#" : "." ; // Append '#' or '.' based on the column's parity
    }
    console.log ( outputLine ) ; // Display the completed row
  }
  console.log ( ) ; // Print an empty line to separate distinct patterns
}