/*
 * This file contains the primary JavaScript function 'Main'
 * which processes an input string to determine a specific pattern.
 * The goal is to identify if the input string consists of
 * exactly two unique characters, each appearing precisely twice.
 */
function     Main  (   input   ) { // Main processing function starts here


  // Declare a local variable 'inputArr'
  // to hold the input string broken down into individual characters.
  var   inputArr    =    input.split  (  ""  ) ;


  /*
   * Initialize an empty JavaScript object named 'ret'.
   * This object will serve as a frequency map or hash table
   * where keys will be characters from the input and values
   * will be their respective counts.
   */
  var   ret   =   { } ;


  // Begin an iteration loop:
  // For each character 'str' found within the 'inputArr' array.
  for    (    str    of      inputArr    )
  {
    // This line uses a ternary operator to update the character count.
    // If 'ret[str]' (the count for the current character) is not null (i.e., it exists),
    // then increment its value by 1.
    // Otherwise (if it's null, meaning the character is encountered for the first time),
    // initialize its count to 1.
    ret [ str ]    =    ret [ str ]    !=    null    ?    ret [ str ]    +    1    :    1    ;
  } // End of the character frequency counting loop.


  // Now, evaluate a complex conditional statement
  // to check if the input string matches the desired pattern.
  // The pattern requires:
  // 1. The 'ret' object (character frequency map) must contain exactly two distinct keys (characters).
  // 2. The count associated with the first distinct character (ret[Object.keys(ret)[0]]) must be exactly 2.
  // 3. The count associated with the second distinct character (ret[Object.keys(ret)[1]]) must also be exactly 2.
  if    (
          Object.keys(ret).length    ===    2
          &&
          ret[Object.keys(ret)[0]]    ===    2
          &&
          ret[Object.keys(ret)[1]]    ===    2
        )
  {
    // If all conditions specified above are true,
    // print the string 'Yes' to the standard output.
    console.log ( 'Yes' ) ;
  }
  else // This block executes if any of the above conditions are false.
  {
    // If the input string does not match the required pattern,
    // print the string 'No' to the standard output.
    console.log ( 'No' ) ;
  }

} // End of the Main function.


// This is the entry point for executing the script.
// It reads the entire content of the standard input stream (/dev/stdin)
// as a UTF-8 encoded string.
// The 'require("fs").readFileSync' method from Node.js's file system module
// is used for this purpose.
// The resulting string is then passed as an argument to the 'Main' function.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;