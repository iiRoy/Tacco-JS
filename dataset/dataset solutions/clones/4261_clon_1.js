function myout ( text ) { console . log ( text ) ; } // This is a utility function for displaying output to the console.


 function Main ( input ) { // The primary function that processes the given input.

  // First, parse the input string into an integer value.
  input = parseInt ( input ) ;

  // The following lines are commented out as they represent alternative input parsing strategies
  // input = input . trim ( ) . split ( " " ) ;
  // input = input . trim ( ) . split ( "\n" ) ;
  // input = input . trim ( ) . split ( " " ) . map ( ( a ) => Number ( a ) ) ;
  // input = input . trim ( ) . split ( "\n" ) . map ( ( a ) => Number ( a ) ) ;
  
  var output = 1000000000 ; // Initialize output with a very large number, serving as an initial maximum.
  
  // Begin a loop that iterates from 1 up to 100,000.
  for ( var i = 1 ; i <= 100000 ; i ++ ) {
    
    // Calculate the product of input and the current loop variable 'i'.
    // Convert the product to a string, then split it into individual digits (as strings).
    // Finally, map each digit string back to a number.
    var tmp = ( input * i ) . toString ( ) . split ( "" ) . map ( ( a ) => Number ( a ) ) ;
    
    var check = 0 ; // Initialize a variable to accumulate the sum of digits.
    
    // Iterate through the array of digits obtained from 'tmp'.
    for ( var j = 0 ; j < tmp . length ; j ++ ) {
      
      // Add the current digit to the 'check' sum.
      check += tmp [ j ] ;
    }
    
    // Update the 'output' if the current 'check' sum is smaller.
    output = Math . min ( output , check ) ;
  }
  
  // After the loop completes, print the final minimum sum of digits.
  myout ( output ) ;
}


// This section is responsible for reading input from standard input (/dev/stdin),
// trimming any leading/trailing whitespace, and then passing it to the Main function.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) . trim ( ) ) ;