function myin ( ) {
  // This function reads input from standard input.
  return require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) . trim ( ) ;
}


function myout ( t ) {
  // This function is for standard output operations.
  console . log ( t ) ;
}


function myerr ( t ) {
  // This function handles standard error messages.
  console . error ( t ) ;
}


// --- Conversion Options for myconv function ---
// 0 : No operation (returns input as is)
// 1 : Converts input to an integer
// 2 : Splits input by half-width space
// 3 : Splits input by newline character
// 4 : Splits input by half-width space and converts elements to numbers
// 5 : Splits input by newline and converts elements to numbers
// 6 : Splits input into individual characters
// 7 : Splits input into individual characters and converts them to numbers


function myconv ( i , no ) {
  switch ( no ) {
    case 0 : // Option 0: No conversion, return original input
      return i ;

    case 1 : // Option 1: Convert to integer
      return parseInt ( i ) ;

    case 2 : // Option 2: Split by space
      return i . split ( " " ) ;

    case 3 : // Option 3: Split by newline
      return i . split ( "\n" ) ;

    case 4 : // Option 4: Split by space and map to numbers
      return i . split ( " " ) . map ( ( a ) => Number ( a ) ) ;

    case 5 : // Option 5: Split by newline and map to numbers
      return i . split ( "\n" ) . map ( ( a ) => Number ( a ) ) ;

    case 6 : // Option 6: Split into characters
      return i . split ( "" ) ;

    case 7 : // Option 7: Split into characters and map to numbers
      return i . split ( "" ) . map ( ( a ) => Number ( a ) ) ;
  }
}


function Main ( input ) {
  // The main entry point of the program logic.

  // First, split the raw input by newline characters.
  input = myconv ( input , 3 ) ;

  // Get the number N from the first line of input and convert it to an integer.
  var N = myconv ( input [ 0 ] , 1 ) ;

  // Get the list of numbers from the second line of input.
  var list = myconv ( input [ 1 ] , 4 ) ;

  // Calculate the average of the numbers in the list.
  var ave = getAverage ( list ) ;

  // Initialize the output variable to store the index of the closest number.
  var output = 0 ;

  // Initialize a variable to keep track of the minimum difference found so far.
  // Set it to a value larger than any possible difference (e.g., 101, assuming numbers are within a certain range).
  var lastThumb = 101 ;

  // Loop through each element in the list to find the one closest to the average.
  for ( var i = 0 ; i < N ; i ++ ) {
    // Calculate the absolute difference between the current number and the average.
    // If this difference is smaller than the smallest difference found so far,
    // update lastThumb and store the current index in output.
    if ( lastThumb > Math . abs ( list [ i ] - ave ) ) {
      lastThumb = Math . abs ( list [ i ] - ave ) ;
      output = i ;
    }
  }

  // Output the index of the number closest to the average.
  myout ( output ) ;
}


function getAverage ( list ) {
  // This helper function calculates the average of a given list of numbers.

  // Initialize sum to zero.
  var sum = 0 ;

  // Iterate through the list and add each element to the sum.
  for ( var i = 0 ; i < list . length ; i ++ ) {
    sum += list [ i ] ;
  }

  // Return the sum divided by the number of elements in the list.
  return sum / list . length ;
}


// Call the Main function with the input read from standard input.
Main ( myin ( ) ) ;