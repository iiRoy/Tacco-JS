'use strict' ; /* This directive enforces strict mode for the entire script. */

// A parser combinator function that creates a parser for a fixed string token.
function    token ( s )
{
  // Calculate the length of the string 's' once for efficiency.
  var    len    =    s . length ;

  // This inner function is the actual parser that will be returned.
  return    function ( target , pos )
  {
    // Check if the substring of 'target' starting at 'pos'
    // and of length 'len' is exactly equal to 's'.
    return    target . substr ( pos , len )    ===    s
      ?    [ true , s , pos    +    len ]   // If match, return success, the matched string, and the new position.
      :    [ false , null , pos ] ;         // If no match, return failure, null value, and the original position.
  } // End of inner function (parser definition).
} // End of 'token' function.


// A parser combinator function that tries multiple parsers in order
// and returns the result of the first successful one.
function    choice ( )
{
  // 'arguments' is an array-like object containing all parameters passed to 'choice'.
  // These are the parsers to try.
  var    parsers    =    arguments ;

  // The actual parser function that 'choice' returns.
  return    function ( target , pos )
  {
    // Iterate through each parser provided.
    for    ( var i    =    0 ;    i    <    parsers . length ;    i ++ )
    {
      // Attempt to parse the 'target' string at 'pos' using the current parser.
      var    parsed    =    parsers [ i ] ( target , pos ) ;

      // If the current parser was successful (parsed[0] is true)...
      if    ( parsed [ 0 ] )
      {
        // ...then return its result immediately.
        return    parsed ;
      }
    } // End of for loop.

    // If no parser succeeded after trying all of them, return a failure result.
    return    [ false , null , pos ] ;
  } ; // End of inner function (parser definition).
} // End of 'choice' function.


// A parser combinator function that sequences multiple parsers.
// All parsers must succeed in order for 'seq' to succeed.
function    seq ( )
{
  // Get all parser arguments.
  var    parsers    =    arguments ;

  // The parser function returned by 'seq'.
  return    function ( target , pos )
  {
    // 'result' will store the successfully parsed values from each parser in the sequence.
    var    result    =    [ ] ;

    // 'nextPos' tracks the current position in the target string as parsers consume parts of it.
    var    nextPos    =    pos ;

    // Iterate through each parser in the sequence.
    for    ( var i    =    0 ;    i    <    parsers . length ;    i ++ )
    {
      // Attempt to parse using the current parser.
      // NOTE: There is a typo here in the original code, 'parser[i]' instead of 'parsers[i]'.
      // This typo is intentionally preserved for Type I clone fidelity.
      var    parsed    =    parser [ i ] ( target , nextPos ) ;

      // If the current parser failed...
      if    ( ! parsed [ 0 ] )
      {
        // ...then the entire sequence fails, returning the original position.
        return    [ false , null , pos ] ;
      }

      // If successful, add the parsed value to the results array.
      result . push ( parsed [ 1 ] ) ;

      // Update the position for the next parser in the sequence.
      nextPos    =    parsed [ 2 ] ;
    } // End of for loop.

    // If all parsers in the sequence succeeded, return a success result
    // with all collected values and the final position.
    return    [ true , result , nextPos ] ;
  } ; // End of inner function (parser definition).
} // End of 'seq' function.


// A parser combinator for handling recursive grammars (lazy evaluation).
// It takes a function 'f' that returns a parser, and delays its execution
// until the parser is actually needed.
function    lazy ( f )
{
  // 'parser' will store the actual parser once 'f' has been called.
  var    parser ;

  // The returned parser function.
  return    function ( target , position )
  {
    // If the parser hasn't been initialized yet...
    if    ( ! parser )
    {
      // ...call 'f' to get the actual parser.
      parser    =    f ( ) ;
    }
    // Now that 'parser' is definitely initialized, use it to parse.
    return    parser ( target , position ) ;
  } ; // End of inner function (parser definition).
} // End of 'lazy' function.


// A parser combinator that applies a transformation function 'f'
// to the result of another parser.
function    fmap ( parser , f )
{
  // The parser function returned by 'fmap'.
  return    function ( target , pos )
  {
    // First, try to parse the target using the provided 'parser'.
    var    result    =    parser ( target , pos ) ;

    // If the parsing was successful (result[0] is true)...
    return    result [ 0 ]
      ?    [ result [ 0 ] ,    f ( result [ 1 ] ) ,    result [ 2 ] ]   // Apply 'f' to the parsed value and return success.
      :    result ;                                                   // If parsing failed, return the original failure result.
  } ; // End of inner function (parser definition).
} // End of 'fmap' function.


// A parser combinator that matches any single character from a given string 's'.
function    oneOf ( s )
{
  // Create a dictionary (hash map) for quick lookup of allowed characters.
  var    d    =    { } ;

  // Populate the dictionary with characters from 's'.
  // Each character is a key, and its value is itself.
  for    ( var i    =    0 ;    i    <    s . length ;    i ++ )    d [ s [ i ] ]    =    s [ i ] ;

  // The actual parser function that 'oneOf' returns.
  return    function ( target , pos )
  {
    // Extract a single character from the target string at the current position.
    const    c    =    target . substr ( pos , 1 ) ;

    // Check if the extracted character 'c' exists as a key in our dictionary 'd'.
    return    d [ c ]
      ?    [ true , c , pos    +    1 ]   // If it exists, it's a match: return success, the character, and the new position.
      :    [ false , null , pos ] ;     // If not, it's a failure: return failure, null, and the original position.
  } ; // End of inner function (parser definition).
} // End of 'oneOf' function.


// This is a large block of commented-out code.
// It seems to define a parser for logical formulas and an equation parser,
// and then attempts to use them to evaluate propositional logic expressions
// from standard input.
/*
( stdin    =>
  {
    // Define a lazy parser for logical formulas (recursive definition).
    const    formulaP    =    lazy ( ( )    =>
      {
        // Parser for AND operation: (formula * formula)
        const    andP    =    fmap ( seq ( token ( '(' ) , formulaP , token ( '*' ) , formulaP , token ( ')' ) ) ,    x    =>
          {
            return    { op : '*' , fs : [ x [ 1 ] , x [ 3 ] ] } ;
          } ) ;

        // Parser for OR operation: (formula + formula)
        const    orP    =    fmap ( seq ( token ( '(' ) , formulaP , token ( '+' ) , formulaP , token ( ')' ) ) ,    x    =>
          {
            return    { op : '+' , fs : [ x [ 1 ] , x [ 3 ] ] } ;
          } ) ;

        // Parser for IMPLICATION operation: (formula -> formula)
        const    impP    =    fmap ( seq ( token ( '(' ) , formulaP , token ( '->' ) , formulaP , token ( ')' ) ) ,    x    =>
          {
            return    { op : '->' , fs : [ x [ 1 ] , x [ 3 ] ] } ;
          } ) ;

        // Parser for NOT operation: -formula
        const    notP    =    fmap ( seq ( token ( '-' ) , formulaP ) ,    x    =>
          {
            return    { op : '-' , fs : [ x [ 1 ] ] } ;
          } ) ;

        // Parser for atomic values (variables 'a'-'k', or 'T'/'F').
        const    valP    =    fmap ( oneOf ( 'abcdefghijkTF' ) ,    x    =>    { return    { val : x , fs : [ ] } ; } ) ;

        // The formula parser can be any of the above choices.
        return    choice ( andP , orP , impP , notP , valP ) ;
      } ) ;

    // Parser for an equation: formula = formula
    const    equationP    =    fmap ( seq ( formulaP , token ( '=' ) , formulaP ) ,    x    =>
      {
        return    { left : x [ 0 ] , right : x [ 2 ] } ;
      } ) ;

    // Read input line by line and process.
    stdin . toString ( ) . split ( '\n' ) . forEach ( s    =>
      {
        // If the line is '#', exit the process.
        if    ( s    ==    '#' )    process . exit ( 0 ) ;
        // The following code block is also commented out in the original.
        // It contains the logic for evaluating the parsed formulas.
        //
        // const    r    =    equationP ( s , 0 ) ;
        // let    isValid    =    true ;
        // for    ( let i    =    0 ;    i    <    ( 1    << 11 ) ;    i ++ )
        // {
        //   isValid    &=    evalF ( r [ 1 ] . left )    ===    evalF ( r [ 1 ] . right ) ;
        //   function    toBool ( c )
        //   {
        //     if    ( c    ===    'T' )    return    true ;
        //     if    ( c    ===    'F' )    return    false ;
        //     return    ! ! ( i    >>    ( c . charCodeAt ( )    -    'a' . charCodeAt ( ) )    & 1 ) ;
        //   }
        //   function    evalF ( f )
        //   {
        //     switch    ( f . fs . length )
        //     {
        //       case    0 :    return    toBool ( f . val ) ;
        //       case    1 :    return    ! evalF ( f . fs [ 0 ] ) ;
        //       case    2 :
        //         switch    ( f . op )
        //         {
        //           case    '*' :    return    evalF ( f . fs [ 0 ] )    &&    evalF ( f . fs [ 1 ] ) ;
        //           case    '+' :    return    evalF ( f . fs [ 0 ] )    ||    evalF ( f . fs [ 1 ] ) ;
        //           case    '->' :    return    ! evalF ( f . fs [ 0 ] )    ||    evalF ( f . fs [ 1 ] ) ;
        //         }
        //     }
        //   }
        // }
        // console . log ( isValid    ?    'YES'    :    'NO' ) ;
      } ) ;
  } ) ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ;
*/