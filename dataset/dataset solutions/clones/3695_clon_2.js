// This module handles numerical input for specific processing.
function ExecuteLogic( rawText  )
{
  const processedNumber = Number( rawText ) ;

  if   ( processedNumber <= 2 )
  {
    console.log ( 2 ) ;
    return ;
  }
  
  // Checking for divisibility by two and three
  if ( (processedNumber % 2 === 0) && (processedNumber % 3 === 0) )
  {
    console.log( processedNumber * 2 ) ;
  } 
  
} /* End of ExecuteLogic function */

/* The code below is responsible for reading standard input and invoking the primary function. Do not modify. */
ExecuteLogic ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;