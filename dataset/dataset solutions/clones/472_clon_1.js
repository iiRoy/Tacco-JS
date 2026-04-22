function  GCD ( a , b )  {
  // This function calculates the Greatest Common Divisor (GCD) of two numbers
  var   m   =   Math . max ( a , b )  ;
  var   n   =   Math . min ( a , b )  ;

  while  ( n  !=  0 )  {
    // Euclidean algorithm iteration
    var   N   =   n  ;
    n   =   m   %   n  ;
    m   =   N  ;
    // The current 'm' holds the remainder from the previous step
  }
  // 'm' now holds the GCD
  return   m  ;
} // End of GCD function definition


// Read input from standard input
var   input   =   require ( 'fs' ) . readFileSync ( '/dev/stdin' ,   'utf8' )  ;

var   Arr   =   input . trim ( ) . split ( "\n" )  ; // Split input into an array of lines

while  ( true )  {
  // Main processing loop
  var   n   =   Arr . shift ( )   -   0  ; // Read the number of fractions for the current test case

  if  ( n   ==   0 )   break  ; // Exit loop if n is 0

  var   arr   =   [ ]  ; // Initialize an array to store simplified fractions

  for  ( var   I   =   0 ;   I   <   n ;   I ++ )  {
    // Loop through each fraction
    var   v   =   Arr . shift ( ) . split ( " " ) . map ( Number )  ; // Read numerator and denominator

    var   gcd   =   GCD ( v [ 0 ] ,   v [ 1 ] )  ; // Calculate GCD for simplification
    arr . push ( [ v [ 0 ]   /   gcd ,   v [ 1 ]   /   gcd ] )  ; // Store simplified fraction [numerator, denominator]
  }

  var   lcm   =   1  ; // Initialize LCM for denominators

  arr . forEach ( function ( v )  {
    // Calculate LCM of all denominators
    var   gcd   =   GCD ( v [ 1 ] ,   lcm )  ;
    lcm   =   ( v [ 1 ]   *   lcm )   /   gcd  ; // Update LCM
  } )  ;

  // Convert numerators to equivalent numerators with the common LCM denominator
  arr   =   arr . map ( function ( v ,   i )  {   return   v [ 0 ]   *   ( lcm   /   v [ 1 ] )  ;   } )  ;

  var   lcm   =   1  ; // Re-initialize LCM, this time for the transformed numerators

  arr . forEach ( function ( v )  {
    // Calculate LCM of the transformed numerators
    var   gcd   =   GCD ( v ,   lcm )  ;
    lcm   =   ( v   *   lcm )   /   gcd  ;
  } )  ;

  arr . forEach ( function ( v )  {   console . log ( lcm   /   v )  ;   } )  ; // Output the final results
} // End of main processing loop