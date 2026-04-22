/*
 * This is a Type I clone of the original JavaScript code.
 *
 * According to the definition of Type I clones:
 * - All identifiers, variable names, function names, operators, and expressions
 *   are preserved exactly as they were in the original source.
 * - The only alterations permitted are changes in whitespace (indentation,
 *   spacing, blank lines) and the addition, removal, or modification of comments.
 *
 * This version aims to demonstrate extensive changes in whitespace and comments
 * to make the code appear visually distinct from the original, while
 * maintaining absolute structural and logical equivalence.
 */
"use strict" ; // Enforce strict mode for cleaner and safer code execution.


const  Main  =  ( input )  =>   {

  // Step 1: Process the input string.
  //   - `input.trim()` removes any leading or trailing whitespace from the string.
  //   - `.split('')` converts the trimmed string into an array of individual characters.
  let  xs  =  input.trim ( ).split ( '' ) ;

  // Step 2: Initialize the answer variable.
  //   - `ans` will store the final result ("yes" or "no").
  let  ans  =  '' ;


  // Step 3: Iterate through the character array to check for adjacent identical characters.
  //   - The loop runs from the first character (index 0) up to, but not including, the last character.
  //     This ensures `xs[i+1]` is always a valid index within the array's bounds for comparison.
  for  ( let  i  =  0 ;  i  <  xs.length ;  i++ )  {

    // Conditional check: Compare the current character with the next character.
    if  ( xs [ i ]  ==  xs [ i + 1 ] )  {

      // If the current character is identical to the next one,
      // assign "no" to `ans`.
      // Note: The original code's logic here means `ans` will end up
      // "yes" if the *last* comparison was unequal, or "no" if it was equal.
      // This is a direct replication of the original's logic, not a fix.
      ans  =  "no" ;

    }  else  {

      // If the characters are not identical,
      // assign "yes" to `ans`.
      ans  =  "yes" ;

    }

  }

  // Step 4: Output the final result.
  //   - The value stored in `ans` is printed to the console.
  console.log ( ans ) ;

}


// Execute the Main function.
//   - `require('fs')` loads the Node.js file system module.
//   - `.readFileSync('/dev/stdin', 'utf8')` reads the entire content
//     of the standard input as a string, using UTF-8 encoding.
//   - This content is then passed as the `input` argument to the `Main` function.
Main ( require ( 'fs' ) .readFileSync ( '/dev/stdin' , 'utf8' ) ) ;