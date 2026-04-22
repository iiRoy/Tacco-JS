/*
 * This module defines a primary function to handle textual data.
 */
function  ProcessData(  incomingString  )
{
  // Output the initial three characters from the supplied string.
  console.log(  incomingString.slice(  0,  3  )  )  ;
}


// --- Automated execution block below ---
// The subsequent lines manage the acquisition of input from standard I/O
// and then trigger the main data processing routine.
ProcessData(  require(  "fs"  )  .  readFileSync(  "/dev/stdin"  ,  "utf8"  )  )  ;