// This section configures the input source for the script.
// The commented-out line shows a configuration for Windows, using a 'tmp' file and Windows-style newlines.
// config = { input: 'tmp', newline: '\r\n' }; // win

// The active configuration is for Linux, typically reading from standard input.
config = { input: '/dev/stdin', newline: '\n' }; // linux


// The 'fs' module is used for file system operations in Node.js.
// readFileSync synchronously reads the entire content of the specified input file.
// The content is read as 'ascii' encoding.
// It is then split into an array of lines using the configured newline character.
line = require('fs').readFileSync( config.input, 'ascii' )
  .split( config.newline );

// Extract the main text (T) from the first line of input.
T = line[0];

// Convert the second line of input to a number (Q), representing the quantity of patterns.
Q = Number( line[1] );

// Extract the patterns (P) from the input lines, starting from the third line (index 2)
// up to (2 + Q) lines.
P = line.slice( 2, 2 + Q );

// The 'line' array is no longer needed after extracting T, Q, and P.
// Setting it to null allows the garbage collector to reclaim its memory.
line = null; // dispose


// This function implements the Rabin-Karp string matching algorithm.
// It efficiently searches for occurrences of a pattern P within a text T
// using hashing.
//
// Parameters:
//   T: The main text string to be searched.
//   P: The pattern string to find within T.
//   d: The size of the alphabet (e.g., 256 for ASCII characters).
//   q: A large prime number used as a modulus for hash calculations,
//      to keep hash values within a manageable range and prevent overflow.
function rabinKarpMatcher( T, P, d, q )
{
  // Declare all local variables at the beginning of the function scope.
  // T (text), n (text length), P (pattern), m (pattern length),
  // h (hash multiplier), p (pattern hash), t (text window hashes),
  // i (loop counter for preprocessing), s (loop counter for matching shifts).
  var T, n, P, m, h, p, t, i, s;

  // Store the length of the original text string.
  n = T.length;

  // Prepend an underscore to the text string. This is a common technique
  // to convert a 0-indexed string into a 1-indexed string for simpler
  // alignment with algorithmic notations and array access in loops.
  T = "_" + T; // Adjusts text T to be 1-indexed.

  // Store the length of the original pattern string.
  m = P.length;

  // Prepend an underscore to the pattern string, similar to the text,
  // for consistent 1-indexed access.
  P = "_" + P; // Adjusts pattern P to be 1-indexed.

  // Calculate the value h = (d^(m-1)) % q.
  // This 'h' value is used in the rolling hash calculation to efficiently
  // remove the contribution of the leading character when the window slides.
  h = Math.pow( d, m - 1 ) % q;

  // Initialize the hash value for the pattern to zero.
  p = 0;

  // Initialize an empty object 't' to store the hash values of text windows.
  // t[s] will hold the hash of the text window starting at shift 's'.
  t = {};

  // Initialize the hash for the first text window (at shift 0) to zero.
  t[0] = 0;

  // --- Preprocessing Phase ---
  // This loop calculates the hash for the pattern and the initial text window.
  for ( i = 1; i <= m; i++ ) // Iterate from 1 to m (length of pattern).
  {
    // Update the hash for the pattern 'p'.
    // The formula is ( (d * current_hash) + character_code ) % q.
    p = ( d * p + P[i].charCodeAt() ) % q;

    // Update the hash for the first text window 't[0]'.
    // Applies the same hashing formula.
    t[0] = ( d * t[0] + T[i].charCodeAt() ) % q;
  }

  // --- Matching Phase ---
  // This loop slides a window of size 'm' across the text 'T'.
  // 's' represents the current starting position (shift) of the window.
  for ( s = 0; s <= n - m; s++ ) // Iterate through all possible shifts.
  {
    // If the hash of the current text window 't[s]' matches the pattern's hash 'p',
    // a potential match has been found.
    // Due to hash collisions, a direct character-by-character comparison is still required
    // to confirm a true match and rule out spurious hits.
    if ( p == t[s] )
    {
      // Perform a direct substring comparison.
      // P.slice(1, m+1) gets the actual pattern string (excluding the prepended '_').
      // T.slice(s+1, s+m+1) gets the current text window (also excluding the prepended '_').
      if ( P.slice( 1, m + 1 ) === T.slice( s + 1, s + m + 1 ) )
      {
        // If the strings are exactly equal, a match is confirmed.
        // The following line can be uncommented for debugging purposes.
        // console.log("pattern match at shift " + s);
        return 1; // Return 1 to indicate that the pattern was found.
      }
    }

    // If not at the last possible window position, calculate the hash for the next window.
    // This is the core of the rolling hash:
    // (1) Subtract the contribution of the character leaving the window (T[s+1]).
    // (2) Multiply by 'd'.
    // (3) Add the contribution of the new character entering the window (T[s+m+1]).
    // (4) Take the result modulo 'q'.
    if ( s < n - m )
    {
      t[s + 1] =
        ( d * ( t[s] - T[s + 1].charCodeAt() * h ) + T[s + m + 1].charCodeAt() ) % q;
    }
  }

  // If the loop completes without returning 1, it means no match was found.
  return 0; // Return 0 to indicate that the pattern was not found.
}


// Iterate through each pattern stored in the array P.
// The 'in' operator iterates over the enumerable properties (indices) of P.
for ( i in P )
{
  // For each pattern P[i], call the Rabin-Karp matcher.
  // Parameters:
  //   T: The main text.
  //   P[i]: The current pattern from the array.
  //   256: The alphabet size (for ASCII).
  //   Math.pow(2, 31) - 1: A large prime number (2,147,483,647), commonly used as a modulus.
  // The result (1 for found, 0 for not found) is printed to the console.
  console.log( rabinKarpMatcher( T, P[i], 256, Math.pow( 2, 31 ) - 1 ) );
}