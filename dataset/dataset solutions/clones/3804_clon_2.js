"use strict"

let  sourceContent = require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf-8" ) ;
// This line retrieves the entire content from the standard input stream, interpreting it as UTF-8 text.

sourceContent = sourceContent . split ( "\n" ) ;
// The fetched content is then divided into an array of strings, with each element representing a line from the input.

let  rowConfig = sourceContent [ 1 ] ;
// We extract the second line from the processed input array; this line contains the participant configurations.

let  reorientations = 0 ;
// A counter is initialized to keep track of the total number of individuals who might need to adjust their facing direction.

// The following loop calculates the initial count of required direction changes, assuming the leftmost person is the reference point.
for ( let  pos = 1 ; pos < rowConfig . length ; pos ++ ) {
  reorientations += rowConfig [ pos ] === "E" ? 1 : 0 ;
}

let  optimalReorientations = reorientations ;
// The initial calculated number of reorientations is stored as the current best (minimum) count.

// This loop iterates through the configuration, simulating each participant as the potential pivot,
// and continually updates the count of necessary direction adjustments.
for ( let  pos = 1 ; pos < rowConfig . length ; pos ++ ) {

  reorientations += rowConfig [ pos - 1 ] === "W" ? 1 : 0 ;
  reorientations -= rowConfig [ pos ] === "E" ? 1 : 0 ;
  // The reorientation count is adjusted based on the shift in perspective:
  // - If the participant just passed (at 'pos - 1') was facing West, they now require a flip.
  // - If the participant at the new pivot point ('pos') was facing East, they no longer need a flip from this perspective.

  optimalReorientations = Math . min ( optimalReorientations , reorientations ) ;
  // The overall minimum number of required reorientations is updated if the current iteration yields a better result.
}

console . log ( optimalReorientations ) ;
// Finally, the program outputs the smallest number of direction changes identified across all possible configurations.