function Main ( input )
{
  /*
   * This function processes the given input string.
   * It determines a sequence of numbers or pairs based on N's parity.
   */
  input = input . split ( "\n" ) ; // Split the input by newline characters
  var N = parseInt ( input [ 0 ] ) ; // Parse the first line as an integer N
  var anssub = new Array ( ) ; // Initialize an empty array to store results

  if ( N % 2 == 0 )
  {
    // Case where N is an even number
    anssub . push ( ( N - 2 ) * N / 2 ) ; // Push the first calculated value
    for ( var i = 1 ; i < N + 1 ; i ++ )
    {
      for ( var j = i + 1 ; j < N + 1 ; j ++ )
      {
        if ( j != N + 1 - i ) // Condition for adding pairs
        {
          anssub . push ( i + " " + j ) ; // Add the pair as a string
        }
      }
    }
  }
  else
  {
    // Case where N is an odd number
    anssub . push ( ( N - 3 ) * ( N - 1 ) / 2 + ( N - 1 ) ) ; // Push the first calculated value

    for ( var i = 1 ; i < N + 1 ; i ++ )
    {
      for ( var j = i + 1 ; j < N + 1 ; j ++ )
      {
        if ( j != N - i ) // Another condition for adding pairs
        {
          anssub . push ( i + " " + j ) ; // Add the pair as a string
        }
      }
    }
  }
  var ans = anssub . join ( "\n" ) ; // Join all elements of anssub with newlines

  // Output the final answer to the console
  console . log ( '%s' , ans ) ;
  return ans ; // Return the generated answer string
}

// This is a debugging utility function.
// It simulates button clicks for testing purposes within a web environment.
function debug ( n )
{
  var input = document . getElementById ( "input" + n ) . value ; // Get input from a specific element
  var ans = Main ( input ) ; // Call the main processing function
  var result = "WA" ; // Default result is "Wrong Answer"

  // Compare the generated answer with the expected output
  if ( ans == document . getElementById ( "output" + n ) . value . split ( "\n" ) [ 0 ] )
  {
    result = "AC" ; // If they match, it's "Accepted"
  }
  document . getElementById ( "result" + n ) . innerHTML = result ; // Display the result
}

// Entry point for execution in a typical competitive programming environment (Node.js)
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;