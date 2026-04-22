/*
 * This file contains JavaScript code for solving a specific problem.
 * It was originally found at: https://abc102.contest.atcoder.jp/tasks/abc102_b
 *
 * The primary goal of this code is to find the difference between the maximum
 * and minimum elements in a given array of numbers.
 *
 * This implementation provides a straightforward approach to achieve the objective.
 * It leverages array sorting to easily identify the extreme values.
 */


  // Defines a helper function to sort an array of numbers in descending order.
  // The input 'arr' is expected to be an array of numeric values.
  function   descSort ( arr )   {
    // The array's built-in sort method is utilized here.
    // A custom comparison function (b - a) is provided to ensure
    // that the sorting occurs in descending numerical order.
    // This means larger numbers will come before smaller numbers.
    return   arr . sort ( ( a ,   b )   =>   b   -   a ) ;
  }


  // This is the core logic function designed to compute the difference
  // between the largest and smallest numbers within a given array.
  // It accepts a single argument 'arr', which should be an array of numbers.
  function   f ( arr )   {
    // First, the input array 'arr' is sorted in descending order.
    // The 'descSort' helper function is called for this purpose,
    // and the result is stored in 'sortedArr'.
    const   sortedArr   =   descSort ( arr ) ;

    // After sorting in descending order, the largest number will always be
    // at the first position (index 0) of the 'sortedArr'.
    // The smallest number will consequently be at the last position.
    // The difference between these two extreme values is then calculated
    // and returned as the function's result.
    return   sortedArr [ 0 ]   -   sortedArr [ sortedArr . length   -   1 ] ;
  }


  // This section handles the module exports, making the 'f' function
  // available for use in other JavaScript modules or files if this
  // script were to be imported.
  module . exports   =   {
    f , // Exporting the main logic function 'f'.
  } ;


  // The 'Main' function simulates the typical entry point for competitive
  // programming problems. It processes the raw input string.
  function   Main ( input )   {
    // The entire input string is split into an array of strings,
    // where each element represents a line from the input.
    const   lines   =   input . split ( "\n" ) ;

    // According to the problem's input format, the second line (index 1)
    // contains the space-separated numbers.
    // This line is split by spaces, and then each resulting string item
    // is parsed into an integer using 'parseInt' with base 10.
    // The final array of integers is stored in 'arr'.
    const   arr   =   lines [ 1 ] . split ( " " ) . map ( ( item )   =>   parseInt ( item ,   10 ) ) ;

    // Finally, the 'f' function is called with the prepared array 'arr',
    // and its returned value (the difference between max and min)
    // is printed to the console.
    console . log ( f ( arr ) ) ;
  }


  // This is the actual execution trigger for the script.
  // It reads the entire content of standard input synchronously
  // as a UTF-8 string, and then passes this string to the 'Main' function
  // to begin processing. This is a common pattern in Node.js
  // for competitive programming environments.
  Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" ,   "utf8" ) ) ;