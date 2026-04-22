'use strict'

let sourceData = require("fs") . readFileSync (
  "/dev/stdin" ,
  "utf8"
) ;

// Remove any leading or trailing whitespace from the acquired data.
sourceData = sourceData . trim ( ) ;

/*
 * This regular expression pattern is adapted from successful submissions.
 * The '^' anchor ensures the pattern matches from the beginning of the string.
 * The '?' quantifier makes the preceding character optional for a flexible match.
 */
let matchOutcome = sourceData.match (
  /^A?KIHA?BA?RA?/
)
  ? "YES"
  : "NO"
;

console . log ( matchOutcome ) ;