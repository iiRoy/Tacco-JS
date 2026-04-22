// This script reads input from standard input, counts occurrences of
// English alphabet characters (case-insensitive), and prints the results.

// Acquire necessary modules for file system operations.
const fileSysUtil = require('fs');

// Read raw data from the standard input path, using UTF-8 encoding.
const dataSource = fileSysUtil.readFileSync('/dev/stdin', 'textEncoding');

// Convert the input string into an array of individual characters.
const charCollection = [ ...dataSource ];

// Initialize a string builder to accumulate the final output.
let outputBuffer = '';

// Create an object to store the frequency of each letter.
// All initial counts are set to zero.
let charOccurrences = {
  letterA: 0,
  letterB: 0,
  letterC: 0,
  letterD: 0,
  letterE: 0,
  letterF: 0,
  letterG: 0,
  letterH: 0,
  letterI: 0,
  letterJ: 0,
  letterK: 0,
  letterL: 0,
  letterM: 0,
  letterN: 0,
  letterO: 0,
  letterP: 0,
  letterQ: 0,
  letterR: 0,
  letterS: 0,
  letterT: 0,
  letterU: 0,
  letterV: 0,
  letterW: 0,
  letterX: 0,
  letterY: 0,
  letterZ: 0,
}; // End of character frequency map initialization

// Iterate through each character in the input collection.
for ( let idx = 0 ; idx < charCollection.length ; idx++ )
{
  // If the current character is not an English alphabet letter (A-Z or a-z)
  // or a comma, skip it and proceed to the next character.
  // The original regex `/[^A-Z,a-z]/` defines characters to skip.
  if ( ( /[^A-Z,a-z]/ ) . test ( charCollection[idx] ) )
  {
    continue;
  }

  // Increment the counter for the corresponding letter, checking both cases.
  if ( ( /[Aa]/ ) . test ( charCollection[idx] ) ) charOccurrences.letterA++;
  if ( ( /[Bb]/ ) . test ( charCollection[idx] ) ) charOccurrences.letterB++;
  if ( ( /[Cc]/ ) . test ( charCollection[idx] ) ) charOccurrences.letterC++;
  if ( ( /[Dd]/ ) . test ( charCollection[idx] ) ) charOccurrences.letterD++;
  if ( ( /[Ee]/ ) . test ( charCollection[idx] ) ) charOccurrences.letterE++;
  if ( ( /[Ff]/ ) . test ( charCollection[idx] ) ) charOccurrences.letterF++;
  if ( ( /[Gg]/ ) . test ( charCollection[idx] ) ) charOccurrences.letterG++;
  if ( ( /[Hh]/ ) . test ( charCollection[idx] ) ) charOccurrences.letterH++;
  if ( ( /[Ii]/ ) . test ( charCollection[idx] ) ) charOccurrences.letterI++;
  if ( ( /[Jj]/ ) . test ( charCollection[idx] ) ) charOccurrences.letterJ++;
  if ( ( /[Kk]/ ) . test ( charCollection[idx] ) ) charOccurrences.letterK++;
  if ( ( /[Ll]/ ) . test ( charCollection[idx] ) ) charOccurrences.letterL++;
  if ( ( /[Mm]/ ) . test ( charCollection[idx] ) ) charOccurrences.letterM++;
  if ( ( /[Nn]/ ) . test ( charCollection[idx] ) ) charOccurrences.letterN++;
  if ( ( /[Oo]/ ) . test ( charCollection[idx] ) ) charOccurrences.letterO++;
  if ( ( /[Pp]/ ) . test ( charCollection[idx] ) ) charOccurrences.letterP++;
  if ( ( /[Qq]/ ) . test ( charCollection[idx] ) ) charOccurrences.letterQ++;
  if ( ( /[Rr]/ ) . test ( charCollection[idx] ) ) charOccurrences.letterR++;
  if ( ( /[Ss]/ ) . test ( charCollection[idx] ) ) charOccurrences.letterS++;
  if ( ( /[Tt]/ ) . test ( charCollection[idx] ) ) charOccurrences.letterT++;
  if ( ( /[Uu]/ ) . test ( charCollection[idx] ) ) charOccurrences.letterU++;
  if ( ( /[Vv]/ ) . test ( charCollection[idx] ) ) charOccurrences.letterV++;
  if ( ( /[Ww]/ ) . test ( charCollection[idx] ) ) charOccurrences.letterW++;
  if ( ( /[Xx]/ ) . test ( charCollection[idx] ) ) charOccurrences.letterX++;
  if ( ( /[Yy]/ ) . test ( charCollection[idx] ) ) charOccurrences.letterY++;
  if ( ( /[Zz]/ ) . test ( charCollection[idx] ) ) charOccurrences.letterZ++;
} // End of character counting loop

// Iterate over the keys (letter names) in the character occurrences object.
Object.keys ( charOccurrences ) . forEach ( currentLetter => {
  // Append each letter and its count to the output buffer, followed by a newline.
  outputBuffer += currentLetter + ' : ' + charOccurrences[currentLetter] + '\n';
}); // End of result formatting

// Print the final accumulated string to the console, removing any trailing whitespace.
console . log ( outputBuffer . trim () );