var    lines    =    [ ] ;    // This array will store all lines read from stdin

var    readline    =    require ( 'readline' ) ;


/*
 *  The 'readline' module provides an interface for reading data from a Readable stream
 *  (such as process.stdin) one line at a time.
 */
  var    rl    =    readline . createInterface ( {
    input : process . stdin ,    // Standard input stream
    output : process . stdout ,  // Standard output stream (not strictly used for outputting prompts here)
  } ) ;


rl . on ( 'line' ,    /* Event listener: triggered when a line of input is received */    function ( x )    {
      lines . push ( x ) ;    // Add the received line 'x' to our 'lines' array
} ) ;


/*
 *  Event listener: triggered when the input stream is closed.
 *  This is where the main logic of the program resides, executed after all input is gathered.
 */
rl . on ( 'close' ,
  function ( ) {
    var    S    =    lines[0] . split ( "" ) ;    /* The first line of input, split into an array of characters */
    var    S_rev    =    [ ] ;    // An array to store the inverted version of 'S' (0s become 1s, 1s become 0s)

    var    ans_1    =    Infinity    ,    ans_2    =    Infinity    ;    // Initialize minimum answers to a very large number


    // Populate S_rev by inverting the characters of S
    for    (    var    i    =    0    ;    i    <    S . length    ;    i++    )    {
      // If S[i] is "0", S_rev[i] becomes "1"; otherwise, if S[i] is "1", S_rev[i] becomes "0".
      S_rev[i]    =    (    S[i]    ===    "0"    ?    "1"    :    "0"    )    ;
    }


    var    result    =    0    ;    // Temporary variable to store calculated results

    // First pass: Analyze the original string 'S'
    for    (    var    i    =    0    ;    i    <    S . length    ;    i++    )    {
        if    (    S[i]    ===    "1"    )    {    /* We are interested in segments starting or ending with '1' */
          // Calculate the maximum distance from the current '1' to either end of the string
          result    =    Math . max (    i    +    1    ,    S . length    -    i    )    ;

          // If there's a '0' immediately after this '1', or if this '1' is the last character
          if    (    i    +    1    <    S . length    &&    S[i    +    1]    ===    "0"    )    {
            // Update ans_1 with the minimum 'result' found so far under these conditions
            ans_1    =    Math . min (    ans_1    ,    result    )    ;
          }
          // Special case: if the '1' is at the very end of the string
          else    if    (    i    +    1    ===    S . length    )    {
            /* The '1' is the last character; update ans_1 */
            ans_1    =    Math . min (    ans_1    ,    result    )    ;
          }
        }
    }


    /* Processing the inverted string S_rev. This logic mirrors the previous loop for 'S'. */
    for    (    var    i    =    0    ;    i    <    S_rev . length    ;    i++    )    {
        if    (    S_rev[i]    ===    "1"    )    {
          // Calculate max distance for S_rev
          result    =    Math . max (    i    +    1    ,    S_rev . length    -    i    )    ;

          // Check for '0' immediately after '1' or if '1' is the last character in S_rev
          if    (    i    +    1    <    S_rev . length    &&    S_rev[i    +    1]    ===    "0"    )    {
            // Update ans_2 with the minimum result for S_rev
            ans_2    =    Math . min (    ans_2    ,    result    )    ;
          }
          else    if    (    i    +    1    ===    S_rev . length    )    {
            /* If S_rev[i] is the final character and it's '1' */
            ans_2    =    Math . min (    ans_2    ,    result    )    ;
          }
        }
    }


    // Output the final computed result: the maximum of ans_1 and ans_2, then subtract 1.
    console . log (    Math . max (    ans_1    ,    ans_2    )    -    1    )    ;
  } ) ;