// This script reads input from standard input, processes it, and prints a result.

// Require the 'fs' (file system) module to read files.
const lineList = require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) . trim ( ) . split ( '\n' )

// The first line of input is assigned to variable 's'.
const s = lineList [ 0 ]

// The second line of input is parsed as an integer and assigned to variable 'k'.
const k = parseInt ( lineList [ 1 ] )

// This regular expression `/(.)\1*/g` matches consecutive identical characters.
// For example, "AAABBC" would be matched as ["AAA", "BB", "C"].
var blockList = s . match ( / ( . ) \1* / g )

// Initialize a variable to store the number of rewrites needed for a single string 's'.
// This calculation is based on the logic of converting blocks of identical characters.
var timesOfRewrite = blockList . reduce ( ( acc , e , i ) => {

  // For each block 'e', calculate how many pairs of characters can be formed.
  // e.g., "AAA" has length 3. (3 - 3 % 2) / 2 = (3 - 1) / 2 = 1.
  //       "AA"  has length 2. (2 - 2 % 2) / 2 = (2 - 0) / 2 = 1.
  //       "A"   has length 1. (1 - 1 % 2) / 2 = (1 - 1) / 2 = 0.
  // This effectively counts `floor(e.length / 2)`.
  return acc + ( e . length - e . length % 2 ) / 2

} , 0 )

// The total number of rewrites for 'k' copies of 's'
// is initially calculated as 'timesOfRewrite' multiplied by 'k'.
total = timesOfRewrite * k

// Get the first block and the last block from the `blockList`.
var head = blockList [ 0 ]
var tail = blockList [ blockList . length - 1 ]

/*
 * Check for a special condition:
 * If the first character of the first block is the same as the first character of the last block,
 * AND both the first block's length and the last block's length are odd,
 * it means that when 's' is concatenated 'k' times, the boundary between 's' copies
 * might form new pairs that can be rewritten.
 *
 * Example: s = "ABA", k = 2.
 * blockList = ["A", "B", "A"]
 * head = "A", tail = "A"
 * head[0][0] = 'A', tail[0][0] = 'A' (match)
 * head.length = 1 (odd), tail.length = 1 (odd)
 * The condition is met.
 *
 * Concatenated: "ABA" + "ABA" = "ABAA BA" -> "ABAAA BA"
 * The two 'A's at the boundary ("A" + "A") can form an additional pair.
 * This adds (k - 1) additional rewrites.
 */
if ( head [ 0 ] [ 0 ] === tail [ 0 ] [ 0 ] && head . length % 2 === 1 && tail . length % 2 === 1 ) {

  total += k - 1 // Add k-1 because there are k-1 boundaries between k copies of 's'.

}

// Handle the edge case where the input string 's' has only one character.
if ( s . length === 1 ) {

  // If s = "A", k = 3.
  // The string becomes "AAA".
  // (3 - 3 % 2) / 2 = (3 - 1) / 2 = 1.
  // This formula calculates floor(k/2).
  total = ( k - k % 2 ) / 2

}

// Finally, print the calculated total number of rewrites to the console.
console . log ( total )