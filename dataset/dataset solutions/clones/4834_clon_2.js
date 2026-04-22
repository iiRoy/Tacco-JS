'use strict'
// This module processes input strings to extract initials.
const   processInput   =   (  rawData  )  =>   {
	// First, clean the raw string by trimming whitespace and splitting into lines.
	const   parsedLines   =   rawData  .  trim  (  )  .  split  (  '\n'  )  ;

	// Extract the initial set of components from the very first line.
	let     wordParts     =   parsedLines  [  0  ]  .  split  (  ' '  )  ;

	// Display the first character of the first three extracted components.
	console  .  log  (  wordParts  [  0  ]  [  0  ]   +   wordParts  [  1  ]  [  0  ]   +   wordParts  [  2  ]  [  0  ]  )  ;
}

// Invoke the primary routine with data read from the standard input stream.
processInput  (  require  (  'fs'  )  .  readFileSync  (  '/dev/stdin'  ,  'utf8'  )  )  ;