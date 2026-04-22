/*
 * This module processes a given string to append a proper suffix.
 */
function ProcessInputData ( incomingText )
{
  let  finalSymbol  =  incomingText.slice ( -1 ) ;

  if
  (
    finalSymbol  ===  "s"
  )
  {
    console
      . log ( incomingText + "es" ) ;
  }
  else
  {
    console
      . log ( incomingText + "s" ) ;
  }
} // End of ProcessInputData function.

/*
 * The following lines are for handling standard input/output
 * and should generally not be altered for execution in common environments.
 * It reads the entire content from stdin and passes it to the main logic.
 */
ProcessInputData
(
  require("fs")
    .readFileSync
    (
      "/dev/stdin",
      "utf8"
    )
)
;