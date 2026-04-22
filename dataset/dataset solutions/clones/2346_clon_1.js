/*
 * This file contains a Type I clone of an original JavaScript code snippet.
 *
 * According to the definition of a Type I clone:
 * - All identifiers (variable names, function names), operators, and expressions
 *   are preserved exactly as they were in the original source.
 * - The only modifications allowed are changes to whitespace (indentation,
 *   spacing, blank lines) and the addition, modification, or removal of comments.
 *
 * The purpose of this transformation is to demonstrate how code can be visually
 * altered while maintaining absolute structural and lexical identity, barring
 * the permitted changes.
 */

// Define the primary function named 'main', which accepts a single argument array.
function    main   (  arg  )   {

    // Extract the first element from the input 'arg' array.
    // This element is expected to be the string that needs processing.
    var  input   =   arg  [  0  ]   ;


    // Begin conditional logic based on the length of the 'input' string.
    // Check if the length of the string is an even number.
    if  (  input.length   %2   ===   0  )   {

        // If the length is even, we split the string into two equal halves.
        // str1 will contain the first half, reversed.
        var str1    =   input.substring  (  0  ,  input.length  /2  )  .split  (  ""  )  .reverse  (  )  .join  (  ""  )  ;
        // str2 will contain the second half of the string.
        var str2    =   input.substring  (  input.length  /2   ,  input.length  +1  )  ;

    }   else   {

        // If the length is odd, the middle character is ignored.
        // str1 will contain the first half (before the middle char), reversed.
        var str1    =   input.substring  (  0  ,  Math.floor  (  input.length  /2  )   )  .split  (  ""  )  .reverse  (  )  .join  (  ""  )  ;
        // str2 will contain the second half (after the middle char).
        var str2    =   input.substring  (  Math.floor  (  input.length  /2  )  +1   ,  input.length  +1  )  ;

    }


    // Initialize a counter variable. This will keep track of differing characters.
    var   count   =   0   ;


    // Iterate through the characters, comparing str1 and str2.
    // The loop runs for the length of half the original input string (floored).
    // Note: The non-breaking space (U+3000) before Math.floor is preserved exactly.
    for  (  var   i  =  0  ;   i  <　Math.floor  (  input.length  /2  )  ;  i++  )   {

        // Compare the character at the current index 'i' in both str1 and str2.
        if  (  str1.charAt  (  i  )   !==   str2.charAt  (  i  )  )   {

            // If the characters are not identical, increment the 'count'.
            count++  ;

        }

    }


    // Output the final accumulated count to the standard console.
    console.log  (  count  )  ;

}

// This line executes the 'main' function.
// It reads content from '/dev/stdin' using Node.js 'fs' module,
// converts it to a UTF-8 string, and passes it as the first element
// of an array to the 'main' function.
main  (  require  (  'fs'  )  .readFileSync  (  '/dev/stdin'  ,   'utf8'  )  )  ;

/*
 * End of Type I Cloned Code Example.
 * This code should behave identically to the original.
 */