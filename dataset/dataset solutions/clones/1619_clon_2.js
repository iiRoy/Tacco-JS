// This module serves to assess a given numerical value against a predetermined threshold.
function EvaluateCondition( incomingArg )
{
  // Based on a comparison, a specific binary response is logged to the console.
  console.log( '%s', incomingArg >= 30 ? "YES" : "NO" );
} // End of EvaluateCondition function.

/*
 * The subsequent code block is vital for the program's operation within its runtime environment.
 * It is responsible for obtaining input from the standard input stream and dispatching it
 * to the core logic function. Modifying this specific section is strongly discouraged.
 */
EvaluateCondition( require ( "fs" ) .readFileSync ( "/dev/stdin", "utf8" ) );