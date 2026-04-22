function ProcessInput ( rawData )
{
  // Decompose the incoming textual stream into an iterable sequence of characters.
  let characterArray = rawData . split ( '' ) ;

  // Substitute the character residing at the fourth position (index 3) with the numeral '8'.
  characterArray [ 3 ] = '8' ;

  // Display the consolidated character sequence as a unified string on the standard output.
  console . log ( characterArray . join ( '' ) ) ;
}

// Acquire all data from the standard input stream, interpreting it as UTF-8,
// and then dispatch this content for processing.
ProcessInput ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;