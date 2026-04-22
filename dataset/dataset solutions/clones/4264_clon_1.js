function   main  ( input )
{
  //  This function processes the given 'input' string.
  //  It calculates a specific sum of digits based on the first number in the input.


  //  Split the entire input string into an array of individual lines.
  //  The delimiter used for splitting is the newline character.
  const   lines   =   input.split ( '\n' ) ;


  //  Extract the first numerical value from the first line of the input.
  //  First, 'shift()' removes and returns the first element (the first line) from 'lines'.
  //  Then, that line is 'split()' by spaces to get an array of string numbers.
  //  Each string number is then 'map()'ped to an integer using 'parseInt(x)'.
  //  Finally, '[0]' selects the very first integer from the resulting array.
  const   K   =   lines.shift ( ) .split ( ' ' ) .map ( x   =>   parseInt ( x ) ) [ 0 ] ;


  //  Initialize a variable 'result' to positive Infinity.
  //  This is done so that any actual sum calculated later will always be smaller
  //  than this initial value, allowing 'result' to correctly track the minimum sum.
  var   result   =   Infinity ;


  //  Begin a loop that iterates a fixed number of times.
  //  The loop counter 'i' starts from 1 and goes up to 100,000, inclusive.
  for   ( var   i   =   1 ;   i   <=   100000 ;   i ++ )
  {
    //  Declare and initialize 'current' to 0 at the start of each outer loop iteration.
    //  This variable will store the sum of digits for the current product (K * i).
    var   current   =   0 ;


    //  Calculate the product of 'K' and the current loop iteration 'i'.
    //  Convert this product to a string using '.toString()'.
    //  Split the string into an array of individual character digits using '.split('')'.
    //  Map each character digit back to an integer using 'parseInt(x)'.
    //  The 'nums' array now holds the individual digits of (K * i) as numbers.
    var   nums   =   ( K * i ) .toString ( ) .split ( '' ) .map ( x   =>   parseInt ( x ) ) ;


    //  Start an inner loop to iterate through each digit in the 'nums' array.
    //  The loop counter 'j' goes from 0 up to (but not including) the length of 'nums'.
    for   ( var   j   =   0 ;   j   <   nums.length ;   j ++ )
    {
      //  Add the current digit (nums[j]) to the 'current' sum.
      current   +=   nums [ j ] ;
    }


    //  After summing all digits for the current product (K * i),
    //  check if this 'current' sum is less than the 'result' found so far.
    if   ( current   <   result )
    {
      //  If the 'current' sum is indeed smaller, update 'result' to this new minimum.
      result   =   current ;
    }

    //  This line resets 'current' to 0.
    //  While 'current' is re-initialized at the top of the loop, this line is part of the original code
    //  and must be preserved exactly as is for a Type I clone.
    current   =   0 ;
  }


  //  Once the main loop completes, print the final minimum sum of digits to the console.
  console.log ( result ) ;

}


//  This is the entry point for executing the script.
//  It uses Node.js's 'fs' (file system) module to read input.
//  'require('fs')' loads the file system module.
//  '.readFileSync('/dev/stdin', 'utf8')' reads the entire content of standard input
//  as a UTF-8 encoded string.
//  This string is then passed as an argument to the 'main' function.
main ( require ( 'fs' ) .readFileSync ( '/dev/stdin' ,   'utf8' ) ) ;