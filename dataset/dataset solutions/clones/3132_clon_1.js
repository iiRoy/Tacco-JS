"use    strict"

function  bitChange ( a , n )
{
  // This function flips the nth bit of number 'a'.
  // It uses the XOR operator with a bitmask.
  return a ^ ( 1 << n ) ;
}

function gray ( arr , n ) { // n represents the exponent of the bit currently being manipulated. arr will store the calculated 2^n values.
  // Recursive function to generate Gray codes.
  if ( n > 0 )
  {
    gray( arr , n - 1 ) ;

    // The next element is derived by flipping the nth bit of the last element.
    arr . push ( bitChange ( arr [ arr . length - 1 ] , n ) ) ;

    gray ( arr , n - 1 ) ;
    return ;
  }
  if ( n === 0 )
  {
    // Base case: for the 0th bit, flip the LSB of the last element.
    arr . push ( arr [ arr . length - 1 ] ^ 1 ) ;
  }
  return ;
}

function grayBitInversion ( arr , m ) {
  // This function prepares an array representing the steps to transform
  // a number with 2m+1 zeros to a number with 2m+1 ones.
  // Initialize a temporary array 'g' for Gray codes.
  var g = [ 0 ] ;

  // Generate Gray codes up to 2*m bits.
  gray ( g , 2 * m ) ;

  // Remove the initial zero as it's not needed for the inversion sequence.
  g . shift ( ) ;

  // Iterate through each bit position from 0 to 2*m - 1.
  for ( let i = 0 ; i < 2 * m ; i ++ )
  {
    // Filter 'g' to include only elements where the i-th bit is zero.
    g = g . filter ( x => ( x >> i ) % 2 === 0 ) ;

    let last = arr [ arr . length - 1 ] ;

    // Append XORed values to 'arr'.
    for ( let j = 0 ; j < g . length ; j ++ )
    {
      arr . push ( last ^ g [ j ] ) ;
    }
    // After processing a block, flip the i-th bit.
    arr . push ( arr [ arr . length - 1 ] ^ ( 1 << i ) ) ;
  }
  // Finally, flip the (2*m)-th bit.
  arr . push ( arr [ arr . length - 1 ] ^ ( 1 << 2 * m ) ) ;
}

function Main ( input ) {
  // Parse the input string into numbers.
  input = input . trim ( ) . split ( / \s + / ) . map ( x => x - 0 ) ;

  // Extract N, A, and B from the input array.
  var N = input . shift ( ) ;
  var A = input . shift ( ) ;
  var B = input . shift ( ) ;

  // Calculate C, which represents the XOR difference between A and B.
  var C = A ^ B ;

  // Initialize arrays to store bit positions that are zero or one in C.
  var zeros = [ ] ;
  var ones = [ ] ;

  // Iterate through N bits to categorize positions based on C's bits.
  for ( let i = 0 ; i < N ; i ++ ) {
    if ( C % 2 === 0 ) {
      zeros . push ( i ) ; // If the current LSB of C is 0, add its position to 'zeros'.
    } else {
      ones . push ( i ) ; // If the current LSB of C is 1, add its position to 'ones'.
    }
    C = Math . floor ( C / 2 ) ; // Shift C to the right by one bit.
  }

  // Check if the number of 'ones' bits is even.
  // If it is, it's impossible to reach B from A with the given constraints.
  if ( ones . length % 2 === 0 ) {
    console . log ( 'NO' ) ;
    return ; // Exit the function.
  }

  // If the number of 'ones' bits is odd, it is possible.
  console . log ( 'YES' ) ;

  // Initialize G with 0 for Gray code generation on 'zeros' positions.
  var G = [ 0 ] ;

  // Generate Gray codes for the 'zeros' bits.
  gray ( G , zeros . length - 1 ) ;

  // Transform elements in G to reflect actual bit positions.
  for ( let i = 0 ; i < G . length ; i ++ ) {
    let acc = 0 ; // Accumulator for the transformed value.
    for ( let j = 0 ; j < zeros . length ; j ++ ) {
      // If the j-th bit of G[i] is set, add 2^(zeros[j]) to accumulator.
      acc += ( ( G [ i ] >> j ) % 2 ) * Math . pow ( 2 , zeros [ j ] ) ;
    }
    G [ i ] = acc ; // Update G[i] with the transformed value.
  }
  G . shift ( ) ; // Remove the initial 0 from G.

  // Initialize GI with 0 for Gray code generation on 'ones' positions.
  var GI = [ 0 ] ;

  // Generate Gray bit inversion sequence for the 'ones' bits.
  grayBitInversion ( GI , ones . length - 1 ) ;

  // Transform elements in GI to reflect actual bit positions.
  for ( let i = 0 ; i < GI . length ; i ++ ) {
    let acc = 0 ; // Accumulator for the transformed value.
    for ( let j = 0 ; j < ones . length ; j ++ ) {
      // If the j-th bit of GI[i] is set, add 2^(ones[j]) to accumulator.
      acc += ( ( GI [ i ] >> j ) % 2 ) * Math . pow ( 2 , ones [ j ] ) ;
    }
    GI [ i ] = acc ; // Update GI[i] with the transformed value.
  }
  GI . shift ( ) ; // Remove the initial 0 from GI.

  // Initialize the answer array with the starting value A.
  var ans = [ A ] ;

  // Construct the final sequence using G and GI.
  for ( let i = 0 ; i < GI . length ; i ++ ) {
    let last = ans [ ans . length - 1 ] ; // Get the last element of the answer sequence.
    for ( let j = 0 ; j < G . length ; j ++ ) {
      ans . push ( last ^ G [ j ] ) ; // Append XORed values from G.
    }
    // Append the next value by XORing the current last with GI[i].
    ans . push ( ans [ ans . length - 1 ] ^ GI [ i ] ) ;
  }
  ans . push ( B ) ; // Finally, add B to the sequence.

  // Print the final sequence, joined by spaces.
  console . log ( ans . join ( ' ' ) ) ;
}

// Read input from stdin and pass it to the Main function.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;