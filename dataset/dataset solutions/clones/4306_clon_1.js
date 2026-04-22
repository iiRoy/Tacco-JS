// This is a Type I clone of the original JavaScript code.
// The primary purpose of this file is to process some input data.

function    Main ( input )
{
  // The 'input' parameter is expected to contain all the necessary data.
  // The following line is commented out, but it shows how input might typically be processed.
  // input = input.split ( "\n" ) ;

  // Determine the length of the provided input string.
  var     len   =    input.length   ;

  // Extract a substring from the input, excluding the last 8 characters.
  var ans = input.substr( 0, len - 8 ) ;

  // Display the resulting string to the console.
  console.log ( '%s', ans ) ;
}


// This debug function is typically used when running the code in a browser environment.
// It retrieves input from an HTML element and passes it to the Main function.
function debug ( )
{
  // Retrieve the value from an HTML element with the ID "input".
  var   input   = document.getElementById ( "input" ) . value   ;

  // Call the main processing function with the retrieved input.
  Main ( input ) ;
}


// ********************************************************************************
// * DO NOT EDIT BELOW THIS LINE. This section handles standard input/output.   *
// * It reads all data from standard input and then invokes the Main function.  *
// ********************************************************************************

Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;