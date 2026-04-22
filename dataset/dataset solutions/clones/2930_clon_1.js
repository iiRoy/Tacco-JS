/*
 * This is the main entry point for the program.
 * It processes the input and calculates a sequence of values.
 */
function Main ( input )
{

    // Split the entire input string by newline characters
    // to get an array of lines.
    input = input . split ( "\n" ) ;


    // Parse the first line of input to extract 'r', 'D', and 'x'.
    // The values are space-separated.
    var r = parseInt ( input [ 0 ] . split ( " " ) [ 0 ] ) ;

    // D is the second value from the first line
    var D = parseInt ( input [ 0 ] . split ( " " ) [ 1 ] ) ;

    // x is the third value from the first line, representing the initial x_0
    var x = parseInt ( input [ 0 ] . split ( " " ) [ 2 ] ) ;


    // Initialize an array to store the 10 calculated 'x' values.
    var anss = new Array ( 10 ) ;

    // Calculate the first value in the sequence, x_1.
    // The formula is x_i = x_{i-1} * r - D.
    anss [ 0 ] = x * r - D ;


    // Loop to calculate the remaining 9 values (x_2 through x_10).
    for ( var i = 1 ; i < 10 ; i ++ )
    {

        // Apply the recurrence relation: x_i = x_{i-1} * r - D
        anss [ i ] = anss [ i - 1 ] * r - D ;

    }

    // Join the calculated values into a single string, separated by newlines.
    var ans = anss . join ( "\n" ) ;

    // Output the final answer to the console.
    console . log ( '%s' , ans ) ;

    // Return the calculated answer.
    return ans ;
}


/*
 * This function is for debugging purposes, typically in a browser environment.
 * It simulates input from a text area and displays the result.
 */
function debug ( n )
{
  // Get input from a dynamically named HTML element.
  var input = document . getElementById ( "input" + n ) . value ;

  // Call the main processing function.
  var ans = Main ( input ) ;

  // Assume "Wrong Answer" by default.
  var result = "WA" ;

  // Compare the calculated answer with the expected output from another HTML element.
  if ( ans == document . getElementById ( "output" + n ) . value . split ( "\n" ) [ 0 ] )
  {
    // If they match, set result to "Accepted".
    result = "AC" ;
  }

  // Display the result in a dynamically named HTML element.
  document . getElementById ( "result" + n ) . innerHTML = result ;
}


// This block handles the execution when the script is run in a Node.js environment.
// It reads input from standard input, processes it, and implicitly prints the result
// via console.log inside the Main function.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;