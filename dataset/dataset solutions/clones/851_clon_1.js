'use strict'; // This directive enforces strict parsing and error handling.

/*
 * This JavaScript code implements a simple parser combinator library
 * and uses it to parse and evaluate propositional logic formulas.
 * It reads propositional logic equations from standard input,
 * determines if they are tautologies, and prints 'YES' or 'NO'.
 */

function token( s )
{
  // Store the length of the string 's' for efficient substring comparison.
  var len = s.length ;
  // This function returns another function (a parser).
  return function ( target , pos )
  {
    // Check if the substring of 'target' starting at 'pos'
    // with length 'len' is strictly equal to 's'.
    return target.substr( pos , len ) === s
      ? [ true , s , pos + len ]   // If matched: [success, matched_value, new_position]
      : [ false , null , pos ] ; // If not matched: [failure, null, original_position]
  }
}


function choice( )
{
  // 'arguments' is a special keyword that holds all parameters passed to the function.
  var parsers = arguments;


  // Return a new parser function that tries each parser in order.
  return function ( target , pos )
  {
    // Iterate through all the parsers provided to 'choice'.
    for ( var i = 0 ; i < parsers.length ; i++ )
    {
      // Attempt to parse the 'target' string at 'pos' using the current parser.
      var parsed = parsers[ i ]( target , pos );
      // If the parsing was successful (parsed[0] is true), return its result immediately.
      if ( parsed[ 0 ] )
      {
        return parsed ;
      }
    }
    // If none of the parsers succeeded, return a failure indication.
    return [ false , null , pos ] ;
  };
}


function seq( )
{
  // Collect all argument parsers into a variable.
  var parsers = arguments ;
  // Return a new parser that applies the given parsers in sequence.
  return function ( target , pos )
  {
    var result = [ ];    // An array to store the results of successfully parsed sub-components.
    var nextPos = pos ; // Keep track of the current parsing position, updated by each successful sub-parser.

    // Loop through each parser in the sequence.
    for ( var i = 0 ; i < parsers.length ; i++ )
    {
      // Apply the current parser, starting from 'nextPos'.
      var parsed = parsers[ i ]( target , nextPos );
      // If the current parser fails, the entire sequence fails.
      if ( !parsed[ 0 ] )
      {
        return [ false , null , pos ] ; // Return failure, reverting to the original starting position.
      }
      // If successful, add the parsed value to our results.
      result.push( parsed[ 1 ] ) ;
      // Update 'nextPos' to the position where the current parser finished.
      nextPos = parsed[ 2 ] ;
    }
    // If all parsers in the sequence succeeded, return the combined result.
    return [ true , result , nextPos ] ;
  };
}


function lazy( f )
{
  var parser ; // This variable will hold the parser once it's initialized.

  // Returns a parser that, on its first invocation, initializes itself
  // by calling the function 'f', and then uses the initialized parser.
  return function ( target , position )
  {
    // If 'parser' is not yet defined (first call), initialize it.
    if ( !parser )
    {
      parser = f( ) ; // Call the factory function 'f' to get the actual parser.
    }
    // Now that 'parser' is guaranteed to be initialized, use it to parse.
    return parser( target , position ) ;
  };
}


function fmap( parser , f )
{
  // Returns a new parser that first applies the given 'parser',
  // and if successful, transforms its result using function 'f'.
  return function ( target , pos )
  {
    // First, attempt to parse the target using the provided 'parser'.
    var result = parser( target , pos ) ;
    // If parsing was successful (result[0] is true), apply the mapping function 'f'
    // to the parsed value (result[1]) before returning.
    // Otherwise, return the original result (which indicates failure).
    return result[ 0 ]
      ? [ result[ 0 ] , f( result[ 1 ] ) , result[ 2 ] ]
      : result ;
  };
}


function oneOf( s )
{
  // Create a hash map (object) for efficient character lookup.
  var d = { } ;
  for ( var i = 0 ; i < s.length ; i++ )
  {
    d[ s[ i ] ] = s[ i ] ; // Map each character to itself.
  }
  // Returns a new parser that matches any single character present in 's'.
  return function ( target , pos )
  {
    // Extract a single character from the 'target' string at 'pos'.
    var c = target.substr( pos , 1 ) ;
    // Check if the extracted character 'c' exists as a key in our map 'd'.
    return d[ c ]
      ? [ true , c , pos + 1 ]   // If found: [success, character, new_position]
      : [ false , null , pos ] ; // If not found: [failure, null, original_position]
  };
}


// This is an immediately invoked function expression (IIFE)
// that takes 'stdin' as an argument, allowing the script to
// read from standard input.
( function ( stdin )
{
  // Define a lazy parser for propositional logic formulas.
  // 'lazy' is crucial here to handle recursive grammar definitions.
  var formulaP = lazy( function ( )
  {
    // Parser for logical AND expressions, e.g., (A*B)
    var andP = fmap( seq( token( '(' ) , formulaP , token( '*' ) , formulaP , token( ')' ) ) , function ( x )
    {
      return { op : '*' , fs : [ x[ 1 ] , x[ 3 ] ] } ; // Extract operands from parsed sequence.
    } ) ;

    // Parser for logical OR expressions, e.g., (A+B)
    var orP = fmap( seq( token( '(' ) , formulaP , token( '+' ) , formulaP , token( ')' ) ) , function ( x )
    {
      return { op : '+' , fs : [ x[ 1 ] , x[ 3 ] ] } ;
    } ) ;

    // Parser for logical IMPLICATION expressions, e.g., (A->B)
    var impP = fmap( seq( token( '(' ) , formulaP , token( '->' ) , formulaP , token( ')' ) ) , function ( x )
    {
      return { op : '->' , fs : [ x[ 1 ] , x[ 3 ] ] } ;
    } ) ;

    // Parser for logical NOT expressions, e.g., -A
    var notP = fmap( seq( token( '-' ) , formulaP ) , function ( x )
    {
      return { op : '-' , fs : [ x[ 1 ] ] } ; // NOT has only one operand.
    } ) ;

    // Parser for atomic values: propositional variables (a-k) or constants (T/F).
    var valP = fmap( oneOf( 'abcdefghijkTF' ) , function ( x ) { return { val : x , fs : [ ] } ; } ) ;

    // A formula can be any of the above defined parsers (choice combinator).
    return choice( andP , orP , impP , notP , valP ) ;
  } ) ;

  // Parser for an entire equation, e.g., A=B
  var equationP = fmap( seq( formulaP , token( '=' ) , formulaP ) , function ( x )
  {
    return { left : x[ 0 ] , right : x[ 2 ] } ; // Extract the left and right sides of the equation.
  } ) ;


  // Process each line of input from stdin.
  stdin.toString( ).split( '\n' ).forEach( function ( s )
  {
    // If the input line is a single hash character, exit the program.
    if ( s == '#' )
    {
      process.exit( 0 ) ;
    }
    // Parse the current line as an equation.
    var r = equationP( s , 0 ) ;
    var isValid = true ; // Assume the equation is a tautology initially.

    // Iterate through all possible truth assignments for up to 11 variables ('a' through 'k').
    // (1 << 11) generates 2^11 combinations.
    for ( var i = 0 ; i < ( 1 << 11 ) ; i++ )
    {
      // Helper function to convert a character (variable or constant) to its boolean value
      // based on the current truth assignment 'i'.
      var toBool = function ( c )
      {
        if ( c === 'T' )
        {
          return true ; // 'T' is always true.
        }
        if ( c === 'F' )
        {
          return false ; // 'F' is always false.
        }
        // For variables 'a' through 'k', determine truth value from the 'i' bitmask.
        // 'c.charCodeAt() - 'a'.charCodeAt()' gives the 0-indexed position of the variable.
        // '& 1' checks if the corresponding bit is set. '!!' converts to boolean.
        return !!( i >> ( c.charCodeAt( ) - 'a'.charCodeAt( ) ) & 1 ) ;
      }

      // Recursive function to evaluate a parsed formula 'f' given the current truth assignment.
      var evalF = function ( f )
      {
        switch ( f.fs.length ) // Check the number of sub-formulas (operands).
        {
          case 0 : // Base case: atomic value (variable or constant).
            return toBool( f.val ) ;

          case 1 : // Unary operation (NOT).
            return !evalF( f.fs[ 0 ] ) ;

          case 2 : // Binary operations.
            switch ( f.op )
            {
              case '*' : // AND operation.
                return evalF( f.fs[ 0 ] ) && evalF( f.fs[ 1 ] ) ;
              case '+' : // OR operation.
                return evalF( f.fs[ 0 ] ) || evalF( f.fs[ 1 ] ) ;
              case '->' : // IMPLICATION (A -> B is equivalent to !A || B).
                return !evalF( f.fs[ 0 ] ) || evalF( f.fs[ 1 ] ) ;
            }
        }
      }
      // The original problem statement indicates this line was commented out.
      // If it were active, it would update 'isValid' based on the evaluation
      // of the left and right sides of the equation.
      // isValid &= evalF(r[1].left) === evalF(r[1].right);
    }
    // Print 'YES' if 'isValid' remains true (indicating a tautology), otherwise 'NO'.
    // Given the commented-out line above, 'isValid' will always be true in this version.
    console.log( isValid ? 'YES' : 'NO' ) ;
  } ) ;
} )( require( 'fs' ).readFileSync( '/dev/stdin' , 'utf8' ) ) ; // Read the entire standard input as a UTF-8 string.