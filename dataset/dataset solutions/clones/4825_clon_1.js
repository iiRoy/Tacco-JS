// This JavaScript program is designed to analyze an input string
// to determine if it can be formed by concatenating a specific set of
// reversed words. It primarily focuses on string manipulation and search.

  function   main  (  input  )

{

  /*
   * This is a utility function used throughout the script.
   * Its sole purpose is to take a string as an argument and return
   * a new string that is the reverse of the input string.
   *
   * @param {string} s - The string to be reversed.
   * @returns {string} The reversed version of the input string.
   */
  const   reverse   =   (  s  )   =>
  {
    return   s .split (  ''  ) .reverse (  ) .join (  ''  )  ; // Splits, reverses, then joins.
  } ;


  // Define the core set of words that we will be looking for.
  // These words are immediately reversed upon declaration, as the
  // comparison logic works with reversed versions of the input string.
  const   WORDS   =   [  'dream'  ,  'dreamer'  ,  'erase'  ,  'eraser'  ] .map (  reverse  ) ;


  // The input string is processed here. We take the first line of the input,
  // and then reverse it. This reversed string 'S' is what we will attempt
  // to decompose using the 'WORDS' array.
  const   S   =   reverse (  input .split (  '\n'  ) [  0  ]  ) ;


  var   index   =   0  ; // This variable keeps track of our current position in the string 'S'.


  // This loop attempts to iteratively match parts of 'S' with words from 'WORDS'.
  // It continues until no more matches can be found from the current 'index'.
  while  (  true  )
  {
    // Attempt to find a word in 'WORDS' that matches the beginning of 'S'
    // starting from the current 'index'.
    var   w   =   WORDS .find (  (  w  )   =>   S .startsWith (  w  ,  index  )  ) ;

    // If no matching word 'w' is found, it means we cannot proceed further
    // with decomposing 'S' from this point.
    if   (  ! w  )
    {
      break  ; // Exit the infinite loop.
    }

    // If a word 'w' was successfully matched, advance the 'index' by the
    // length of the matched word to continue searching from the next position.
    index   +=   w .length  ;
  }


  // After the loop concludes, we check if the entire string 'S' was successfully
  // matched and consumed by the words.
  if   (  S .length   ===   index  )
  {
    console .log (  'YES'  ) ; // If 'index' reached the end of 'S', it's a successful decomposition.
  }

  else
  {
    console .log (  'NO'  ) ; // Otherwise, 'S' could not be fully formed by the words.
  }

}

// This line executes the main function, providing it with input read from
// the standard input stream, encoded in UTF-8 format.
main  (  require (  'fs'  ) .readFileSync (  '/dev/stdin'  ,  'utf8'  )  ) ;