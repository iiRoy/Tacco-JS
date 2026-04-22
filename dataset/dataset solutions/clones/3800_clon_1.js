function Main ( input )
{
  // Input processing: split the entire input string by newline characters.
  input = input . split ( "\n" ) ;


  // Parse the first line of input to get the array size 'n'.
  var n = parseInt ( input [ 0 ] ) ;


  // Initialize array 'a' with size 'n'.
  a = new Array ( n ) ;

  // Initialize array 'b' with size 'n'. Note: 'b' is declared but never used in the original logic.
  b = new Array ( n ) ;


  // Parse the second line of input, splitting by space, to get temporary string values.
  tmp = input [ 1 ] . split ( " " ) ;


  // Populate array 'a' with integer values parsed from the 'tmp' array.
  for ( i = 0 ; i < n ; i++ )
  {
    a [ i ] = parseInt ( tmp [ i ] ) ;
  }


  // Initialize the answer variable 'ans' with the value of 'n'.
  var ans = n ;


  // Outer loop: Iterate through the array 'a' starting from the first element.
  for ( i = 0 ; i < n ; i++ )
  {
    // Initialize 'xor' and 'sum' with the current element a[i].
    var xor = a [ i ] ;
    var sum = a [ i ] ;


    // Inner loop: Iterate through the rest of the array elements starting from i+1.
    for ( j = i + 1 ; j < n ; j++ )
    {
      // Update 'xor' by XORing with the next element a[j].
      xor ^= a [ j ] ;
      // Update 'sum' by adding the next element a[j].
      sum += a [ j ] ;


      // Check if the current XOR sum equals the current arithmetic sum.
      if ( xor == sum )
      {
        // If they are equal, increment the answer counter.
        ans ++ ;
      }
    }
  }


  // Output the final calculated answer to the console.
  console . log ( '%s' , ans ) ;
}


// This function is intended for debugging purposes, often used in browser environments.
function debug ( )
{
  // Retrieve input from a text area element with id "input".
  var input = document . getElementById ( "input" ) . value ;

  // Call the main processing function with the retrieved input.
  Main ( input ) ;
}


// This line executes the Main function with input read from standard input in Node.js environment.
// It reads the entire content of "/dev/stdin" as a UTF-8 string.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;