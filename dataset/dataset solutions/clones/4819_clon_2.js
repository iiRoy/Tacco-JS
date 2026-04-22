/*
 * This module processes a single character to determine if it's a vowel or a consonant.
 * Type II clone generated with altered identifiers and whitespace.
 */
function DetermineVowelOrConsonant( inputString ) {

  // Convert the raw input into a string for comparison.
  const currentSymbol = String(inputString);

  if (
       currentSymbol === 'a'
    || currentSymbol === 'i'
    || currentSymbol === 'u'
    || currentSymbol === 'e'
    || currentSymbol === 'o'
  )
  {
    console.log( 'vowel' );
  }
  else
  {
    console.log( 'consonant' );
  }

}

// Execute the main logic by reading from standard input.
DetermineVowelOrConsonant( require("fs").readFileSync("/dev/stdin", "utf8") );