function   Main   ( input ) {
  // Initial parsing of input values N and M.
  var   N    =    input.split ( " " ) [ 0 ]   ;
  var   M    =    input.split ( " " ) [ 1 ]   ;

  // Convert N and M to numbers using bitwise NOT operator.
  N   =   ~~N   ;
  M   =   ~~M   ;

  // Initialize a list of prime numbers, starting with 2 and 3.
  var   prime   =   [ 2 , 3 ]   ;

  // The 'input' variable is repurposed to hold the value of M for prime factorization.
  input =   M   ;

  // Calculate the square root of 'input' to optimize prime factorization.
  var   inputRoot   =   Math.floor ( Math.sqrt ( input ) )   ;

  /*
   *  Loop to find prime numbers up to the square root of M.
   *  It starts checking from the next number after the last known prime.
   */
  for   ( var   i   =   prime [ prime.length - 1 ]   +   1   ;   i   <=   inputRoot   ;   i ++ ) {
    // If 'i' is not divisible by any existing prime, it's a new prime.
    if   ( prime.find ( a   =>   i % a   ==   0 )   ===   undefined )   {
      prime.push ( i )   ;
    }
  }

  // An object to store the prime factors and their counts.
  var   output   =   { }   ;

  /*
   *  Iterate through the found prime numbers to factorize 'input' (original M).
   *  This loop performs the prime factorization.
   */
  for   ( var   elem   of   prime ) {
    while   ( input % elem   ==   0 ) {
      input   /=   elem   ;
      // Increment the count for the current prime factor.
      output [ elem ]   =   ( output [ elem ]   ||   0 )   +   1   ;
    }
  }

  // If 'input' is still not 1 after the loop, it means the remaining 'input' is also a prime factor.
  if   ( input   !=   1 )   {
    output [ input ]   =   ( output [ input ]   ||   0 )   +   1   ;
  }

  // Initialize the final result variable.
  var   fu   =   1   ;
  // Define the modulo value.
  var   mod   =   Math.pow ( 10 , 9 )   +   7   ;

  /*
   *  Helper function to calculate combinations (nCk).
   *  It simplifies k to min(k, n-k) for efficiency.
   *  Note: This implementation might suffer from precision issues for large numbers.
   */
  var   combination   =   function   ( n , k ) {
    k   =   Math.min ( k , n - k )   ;
    var   ho   =   1   ;

    // Calculate the numerator part of the combination formula.
    for   ( var   i   =   0   ;   i   <   k   ;   i ++ )   {
      ho   *=   n - i   ;
    }

    // Calculate the denominator part.
    for   ( var   i   =   0   ;   i   <   k   ;   i ++ )   {
      ho   /=   ( i + 1 )   ;
    }
    return   ho   ;
  }

  // This combination function can have precision problems with large arguments.
  // This is a known limitation for now.

  /*
   *  Calculate the final result based on prime factors and N,
   *  applying modular arithmetic.
   */
  for   ( var   key   in   output ) {
    var   val   =   output [ key ]   ;
    // Compute combinations using (val + N - 1) C (val).
    var   com   =   combination ( val   +   N   -   1 , val )   ;
    fu   *=   com   ;
    fu   %=   mod   ;
  }

  // Return the final computed value.
  return   fu   ;
}

/*
 *  The following block handles input/output based on the execution environment.
 *  It's designed to work in competitive programming environments (like AtCoder)
 *  and also provide a basic browser-based test interface.
 */
( ( b , c , d ) => "undefined"   !=   typeof   require   ?   console.log ( Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ) : [ b   =   b . split ( "\n" ) . slice ( 1 , -1 ) . join ( "\n" ) , c   =   function ( ) { try { return   Main ( b ) } catch ( f ) { return   f . stack   ||   f . message } } ( ) , d   =   typeof   c , "string"   ==   d   ||   ( c   =   JSON.stringify ( c ) ) , $ ( "<form>" ) . append ( [ [ 10 , b ] , 0 , [ 1 , d ] , 0 , [ 10 , c ] ] . map ( f   =>   $ ( f   ?   "<textarea>"   :   "<br>" , f   &&   { rows : f [ 0 ] , cols : 40 , text : f [ 1 ] } ) ) ) . appendTo ( "body" ) ] ) ( `
3 12
` )