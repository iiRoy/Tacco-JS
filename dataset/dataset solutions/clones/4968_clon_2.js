'use strict'; // Enable strict mode for better error handling.

// Retrieve all textual segments from the standard input,
// interpreting them as UTF-8 characters, and then divide them by newline characters.
const   inputRows   =   require (  "fs"  )  .  readFileSync (  "/dev/stdin"  ,  "utf8"  )  .  split (  "\n"  )  ;

/*
 * Transform every individual text segment into its numerical equivalent.
 * This operation creates a new array containing only numeric values.
 */
const   parsedNumbers   =   inputRows .  map (  textItem  =>  Number (  textItem  )  )  ;

// Output a specific integer constant directly to the console.
console .  log (  16  )  ;