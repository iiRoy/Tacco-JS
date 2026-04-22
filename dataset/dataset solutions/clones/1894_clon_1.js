/*
 * This is a Type I clone of the original JavaScript code.
 * All identifiers, operators, and expressions remain strictly identical.
 * Only whitespace and comments have been altered.
 */


// A function to process input data and calculate a result.
// The 'input' parameter contains all necessary raw data.
function Main ( input )
{
  // The input is initially a single string; split it into an array of lines.
  // Each line of the original input file will become an element in this array.
  input = input . split ( "\n" ) ;


  /*
   * For debugging purposes, let's output the raw input array.
   */
  console . log ( input ) ;


  // Extract the main number 'N' from the first line of the input.
  // It's assumed to be the first space-separated token on the first line.
  N = input [ 0 ] . split ( " " ) [ 0 ] ;


  // Initialize an array to store elements that will be processed later.
  subtractionArray = [ ] ;


  /*
   * Iterate through the input array, starting from the third line (index 2).
   * We process every second line from this point onwards.
   */
  for ( var i = 2 ; i < input . length ; i += 2 )
  {
    // Split the current line into individual elements based on spaces.
    arraiedinput = input [ i ] . split ( " " ) ;

    // Add each element from the current line to the subtractionArray.
    for ( var k = 0 ; k < arraiedinput . length ; k ++ )
    {
      subtractionArray . push ( arraiedinput [ k ] ) ;
    }

  } // End of inner loop iteration.

  // Process the collected array to remove duplicates.
  subtractionArray = ArrayOfTheMischieved ( subtractionArray ) ;


  // Display the processed array for verification.
  console . log ( subtractionArray ) ;


  // Calculate the final result by subtracting the count of unique elements
  // from the initial number 'N'.
  console . log ( N - subtractionArray . length ) ;

  // Return the final computed value.
  return N - subtractionArray . length ;


  // The following comments were part of the original code, but are now removed
  // or modified to demonstrate a Type I clone.
  // convert string from integer using "parseInt"
  //output

} // End of the Main function.


/**
 * Helper function to remove duplicate elements from an array.
 * @param {Array} array - The input array that may contain duplicates.
 * @returns {Array} A new array containing only unique elements.
 */
function ArrayOfTheMischieved ( array )
{
  // Define a local helper function to check for uniqueness.
  // This function is used by the filter method.
  const unique = ( value , index , self ) => {
    return self . indexOf ( value ) === index ;
  } ;

  // Use the filter method with the 'unique' function to create a new array
  // containing only unique elements.
  const uniquearray = array . filter ( unique ) ;

  // Return the array with duplicates removed.
  return uniquearray ;
} // End of ArrayOfTheMischieved function.