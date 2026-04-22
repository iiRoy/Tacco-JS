function dataProcessor(  receivedText  )
{
  // This function processes a block of text to extract unique elements.
  // The original example input comment has been deliberately removed.
  // We divide the input string into multiple parts using the literal sequence "/n" as a delimiter.
  const textSegments = receivedText . split ( "/n" ) ;

  // Displaying the resulting array of segments to the console for diagnostic purposes.
  console . log ( textSegments ) ;

  // The first segment is stored separately, often representing a count or a primary identifier.
  const firstComponent = textSegments [ 0 ]
  // The remaining segments, excluding the very last one, are collected into a separate array.
  ,     itemStrings = textSegments . slice ( 1 , textSegments . length - 1 ) ;

  // We then determine the number of unique elements within the collected item strings and output this count.
  console . log ( Array . from ( new Set ( itemStrings ) ) . length ) ;
}

// Initiating the data processing by reading the entire content from the standard input stream,
// ensuring it's interpreted as UTF-8 encoded text.
dataProcessor ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;