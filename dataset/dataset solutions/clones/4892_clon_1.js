/*
 * This script reads input from stdin, processes it, and prints a result to stdout.
 * It's designed to find a specific pattern or index within the input strings.
 */
console . log (
  ( ( args ) => {
    // Destructure the input arguments.
    // The first line is _N, followed by strings s and t.
    // _N is then converted to an integer N.
    const [ _N , s , t ] = args . trim ( ) . split `\n` ,
          N              = _N | 0 ;

    // Label for the outer loop, used for `continue S;`
    // This loop iterates through possible starting positions for string s.
    S :
    for ( let i = 0 ; i < N ; i ++ ) {

      // Inner loop iterates through characters of string t.
      // It compares a substring of s (starting at index i) with string t.
      for ( let j = 0 ; i + j < N ; j ++ ) {

        // If a character mismatch is found, the current outer loop iteration is invalid.
        // We continue to the next starting position `i` in string `s`.
        if ( s [ i + j ] !== t [ j ] ) {
          continue S ; // Jump to the next iteration of the outer loop.
        }
      }

      // If the inner loop completes without any mismatches,
      // it means string t is found starting at index i in string s.
      // The result is i + N.
      return i + N ;
    }

    // If the outer loop completes without finding string t as a substring,
    // a default value of N + N is returned.
    return N + N ;
  } ) (
    // Read the entire content of stdin as a UTF-8 string.
    require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' )
  )
) ; // End of console.log call