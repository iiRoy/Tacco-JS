// This primary routine handles incoming data.
function HandleData ( sourceString )
{
  // Divide the complete input string into individual text lines.
  let textRows = sourceString.split( "\n" ) ;

  // Retrieve the leading numerical component from the very first line.
  const firstValue = textRows[0].split(' ')[0] ;

  // Fetch the subsequent numerical component from that same initial line.
  let secondValue = textRows[0].split(' ')[1] ;

  // Execute a conditional computation and output the final outcome.
  // If the second numerical component is equal to one, the result is zero;
  // otherwise, it's the difference between the first and second values.
  console.log( secondValue == 1 ? 0 : firstValue - secondValue ) ;
}

// Initiate the main data processing operation.
// This involves reading content from the standard input stream synchronously,
// leveraging Node.js's built-in file system module for operation.
HandleData( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;