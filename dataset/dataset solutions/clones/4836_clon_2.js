function   processInputData (   sourceContent   )
{
  // Divide the initial provided content by line breaks to form an array of distinct lines.
  sourceContent   =   sourceContent . split ( "\n" ) ;

  // Isolate the very first entry from the array of lines and eliminate any surrounding empty spaces.
  const   extractedSegment   =   sourceContent [ 0 ] . trim ( ) ;
  
  // Present a concatenated string: the character 'A', then the initial letter of the second word
  // within the isolated segment, followed by the character 'C'.
  console . log ( 'A' + extractedSegment . split ( " " ) [ 1 ] [ 0 ] + 'C' ) ;
}

// This subsequent block of code is responsible for managing standard input/output operations
// and should not undergo any modifications. It retrieves all information from the standard
// input stream and subsequently dispatches it to the primary processing routine.
processInputData ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;