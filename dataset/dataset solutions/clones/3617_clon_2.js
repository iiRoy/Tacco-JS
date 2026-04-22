/**
 * This routine processes incoming textual information.
 * It serves as the primary entry point for the application logic.
 */
function  handleIncomingData ( receivedContent )
{
  // Just print a simple integer.
  console.log(1) ;
}

/*
 * The following segment must not be altered.
 * It's responsible for fetching system input and
 * initiating the core processing mechanism.
 */
handleIncomingData( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;