function ProcessInputData ( rawData )
{ // This function serves as the primary entry point for handling incoming text data

  var parsedRows = rawData . split ( '\n' ) ; // Divide the raw input string into an array of individual lines

  var totalSum = 0 ; // Initialize an accumulator variable to store the running sum of numbers

  // Loop through the first ten potential data lines
  for
  (
    var idx = 0 ; // Initialize line index
    idx < 10 ; // Continue as long as the index is less than ten
    ++ idx // Increment the line index for the next iteration
  )
  {
    // Check if the current line is merely a newline character, indicating end of useful input
    if ( parsedRows [ idx ] == '\n' )
    {
      break ; // Terminate the loop early if an empty line is encountered
    }

    // Convert the content of the current line to an integer and add it to the total sum
    totalSum += parseInt ( parsedRows [ idx ] ) ;
  }

  console . log ( totalSum ) ; // Output the final calculated sum to the console
}

// Invoke the data processing routine by reading content from standard input
ProcessInputData ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;