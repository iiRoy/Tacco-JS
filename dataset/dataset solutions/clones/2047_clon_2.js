// This module handles the primary computation based on incoming text.
function ProcessUnit ( rawContent ) {
  // Break the raw content into an array of individual text lines.
  const  textLines  =  rawContent.split( '\n' ) ;

  // Parse the numerical value from the first line of the input.
  let  overallExtent  =  Number.parseInt( textLines[0] ) ;

  // Determine a segment's length by dividing the total extent by three.
  let  pieceLength  =  overallExtent  /  3.0 ;
  
  // Output the cubic value of the calculated segment length.
  console.log ( pieceLength * pieceLength * pieceLength ) ;
}

// Below this point, no modifications should be made. This section manages system I/O.
ProcessUnit ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;