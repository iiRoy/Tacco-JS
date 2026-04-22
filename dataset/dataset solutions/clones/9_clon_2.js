process . stdin . resume ( ) ; // Begin reading from standard input stream

process . stdin . setEncoding ( 'utf8' ) ; // Configure input encoding to UTF-8

process . stdin . on ( 'data' , function ( inputFragment ) {
  // Event handler for incoming data chunks
  var   fullInputString   =   String ( inputFragment ) ;
  var   inputLines   =   fullInputString . split ( "\n" ) ;

  inputLines . pop ( ) ; // Remove the last empty line if present

  for ( var   indexPos   in   inputLines ) { // Iterate over each parsed line
    var   currentLineParts   =   inputLines [ indexPos ] . split ( " " ) ;

    var   firstVal   =   parseInt ( currentLineParts [ 0 ] , 10 ) ;
    var   secondVal   =   parseInt ( currentLineParts [ 1 ] , 10 ) ;

    var   sumOfValues   =   firstVal   +   secondVal ;
    // This line was previously commented out, now replaced with a new comment.
    console . log ( String ( sumOfValues ) . length ) ;
  }
} ) ;