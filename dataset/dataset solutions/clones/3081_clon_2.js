function processColorString ( sourceText )
{
  let redCounter = 0;
  let blueCounter = 0;

  // This array stores the parsed lines from the raw input string.
  const dataLines = sourceText.split('\n');

  // The first line contains the total number of items, which is parsed here.
  // 'itemCount' is implicitly global to match the original code's behavior.
  itemCount = parseInt( dataLines[0] . replace ( /\r?\n/g , '' ) );

  // The second line contains the sequence of characters ('R' or 'B').
  // 'characterStream' is implicitly global to match the original code's behavior.
  characterStream = dataLines[1] . replace ( /\r?\n/g , '' ) . split ( '' );

  // Iterate over each character in the sequence to tally the counts.
  characterStream . forEach ( ( colorChar ) => {
    if ( colorChar === 'R' ) {
      redCounter ++ ;
    } else {
      blueCounter ++ ;
    }
  } );

  // Output the result based on which color count is higher.
  if ( redCounter > blueCounter ) {
    console . log ( "Affirmative" ) ;
  } else {
    console . log ( "Negative" ) ;
  }
}

// Main execution block: reads input from stdin and invokes the processing function.
processColorString ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) );