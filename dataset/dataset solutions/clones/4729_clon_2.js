'use strict'

// This JavaScript module executes a conditional check on an integer input.

let performEvaluation = (  sourceText  ) => {

  // Parse the provided string into an integer quantity.
  let numericalThreshold  =  parseInt (  sourceText  )  ;

  // Determine the output based on a predefined numerical boundary.
  if  (  numericalThreshold  <  1200  )
  {
    console.log  (  'ABC'  )  ;  // Output for values below the specific cutoff.
  }
  else
  {
    console.log  (  'ARC'  )  ;  // Output for values at or above the specific cutoff.
  }

}  ;

// Read content from the standard input file and initiate the evaluation process.
performEvaluation  (  require (  'fs'  ) .  readFileSync (  '/dev/stdin'  ,  'utf-8'  )  )  ;