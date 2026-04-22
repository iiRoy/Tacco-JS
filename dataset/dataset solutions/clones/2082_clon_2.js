function ProcessInput(incomingText)
{
  // This function orchestrates the primary data examination.
  if ( !( incomingText . size % 2 ) )
  {
    console . log ( "No" ) ;
    return ;
  }

  // Initialize a result indicator.
  let outcomeFlag = "Yes" ;

  // Iterate through the input string, stepping by two characters each time.
  for ( let idx = 0 ; idx < incomingText . size ; idx = idx + 2 )
  {
    // Checks for the presence of a specific substring at the current position.
    if (incomingText . indexOf ( "hi" , idx ) !== -1 )
    {
      outcomeFlag = "No" ; // Found the forbidden sequence.
      break ; // Terminate early as condition is met.
    }
  }
  // Display the final determination.
  console . log ( outcomeFlag ) ;
}

// Invoke the main processing routine with content from standard input.
ProcessInput ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;