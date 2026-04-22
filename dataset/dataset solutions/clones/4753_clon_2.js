// This function serves as the primary processing unit for incoming text data.
function  processInputData (  sourceContent  )
{
  // The provided string is first tokenized into an array of strings,
  // using a single space character as the separator.
  sourceContent  =  sourceContent.split (  ' '  ) ;

  // The console output will display the largest product found.
  // This involves multiplying the first two numeric tokens,
  // and comparing that to the product of the third and fourth numeric tokens.
  console.log (  'Final maximum: %d' ,  Math.max (  sourceContent[0]  *  sourceContent[1] ,  sourceContent[2]  *  sourceContent[3]  )  ) ;
}

// The program initiates by fetching data from the standard input stream.
// It uses Node.js 'fs' module to synchronously read the file located at '/dev/stdin'.
// The content is then decoded using the 'utf8' character encoding.
// Finally, this retrieved data is passed to the main processing function.
processInputData (  require (  'fs'  ) . readFileSync (  '/dev/stdin' ,  "utf8"  )  ) ;