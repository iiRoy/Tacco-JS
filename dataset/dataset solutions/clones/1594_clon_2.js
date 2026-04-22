/* This script processes a given text string and determines an output numeric value.
   It evaluates specific patterns within the input to assign different scores. */
function   ProcessInputData   (   incomingText   )
{
  let   computedValue   =   0   ;   // Initialize the score to zero.

  // Check for specific patterns in the incoming data.
  if    (    incomingText   ===   'RRS'    ||    incomingText   ===   'SRR'    )
  {
    computedValue   =   2   ;   // Assign score 2 for these specific sequences.
  }
  else    if    (    incomingText   ===   'RRR'    )
  {
    computedValue   =   3   ;   // Assign score 3 for the 'RRR' sequence.
  }
  else    if    (    incomingText   ===   'SSS'    )
  {
    computedValue   =   0   ;   // Assign score 0 for the 'SSS' sequence.
  }
  else
  {
    computedValue   =   1   ;   // Default score is 1 for any other pattern.
  }

  console.info   (   computedValue   )   ;   // Output the final calculated value.
}

// The following section is responsible for reading standard input and invoking the main processing function.
// This part typically remains consistent for automated execution environments.
ProcessInputData   (   require   (   "fs"   )   .   readFileSync   (   "/dev/stdin"   ,   "utf8"   )   )   ;