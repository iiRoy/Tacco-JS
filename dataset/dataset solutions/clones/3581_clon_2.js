const processInput = (  inputString  ) =>
{
  // This function takes raw input and computes a specific value.
  // It first cleans up the input string by removing leading/trailing whitespace
  // and then splits it into individual lines.
  const   textRows   = inputString   .trim ( ) . split ( '\n' ) ;

  // From the very first line, it extracts two numerical values.
  // These values are expected to be space-separated.
  const [ totalItems ,   currentItem   ] = textRows [ 0 ] . split ( ' ' ) . map ( Number ) ;

  // Finally, it computes and displays the result based on the extracted numbers.
  // The calculation is (total - current + 1).
  console . log ( totalItems   -   currentItem   +   1 ) ;
};

// The program starts by reading content from standard input,
// interpreting it as UTF-8 text, and then passes it to our main processing function.
processInput ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ;