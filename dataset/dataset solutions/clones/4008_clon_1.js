function   main   (  input  )   {
    /* This introductory block comment explains the overall purpose
     * of the main function. It is designed to process an input string,
     * extract specific data, and then perform a conditional check
     * based on the presence of certain characters.
     * The final output will be either "Three" or "Four".
     */


    // First, ensure the input string is clean by removing any leading or trailing whitespace.
    input   =   input.trim   (  )   ;


    // Define a constant variable 'N'.
    // This variable captures the first numerical value found in the input string.
    // The input is first split by space, and the first part is parsed as an integer (base 10).
    const   N   =   parseInt   (  input.split   (  " "  )   [  0  ]  ,   10  )   ;


    // Define another constant array 'arrS'.
    // This array is derived from the second line of the input.
    // The input is split by newline, then the second element (index 1) is taken.
    // This element is further split by space, and each resulting part is mapped back to itself.
    const   arrS   =   input.split   (  '\n'  )   [  1  ]  .split   (  ' '  )  .map   (  (  n  )   =>   (  n  )  )   ;


    // Initialize a mutable variable 'ans' to track a count.
    var   ans   =   0   ;


    // Conditional check for the character "P".
    // If "P" is found within the 'arrS' array (meaning its index is not -1),
    // the 'ans' counter is incremented.
    if   (  arrS.indexOf   (  "P"  )   !=   -1  )   {
        ans   ++   ;
    }


    // Conditional check for the character "W".
    // Similar to the check for "P", if "W" is present, 'ans' increases.
    if   (  arrS.indexOf   (  "W"  )   !=   -1  )   {
        ans   ++   ;
    }


    // Conditional check for the character "G".
    // If "G" is found, the 'ans' counter is incremented.
    if   (  arrS.indexOf   (  "G"  )   !=   -1  )   {
        ans   ++   ;
    }


    // Conditional check for the character "Y".
    // If "Y" is found, the 'ans' counter is incremented.
    if   (  arrS.indexOf   (  "Y"  )   !=   -1  )   {
        ans   ++   ;
    }


    // Final decision block based on the accumulated value of 'ans'.
    // If 'ans' is exactly 3, then "Three" is logged to the console.
    if   (  ans   ==   3  )   {
        console.log   (  "Three"  )   ;
    }   else   {
        // Otherwise (if 'ans' is not 3, which implies it's 4 in the context of this problem),
        // "Four" is logged to the console.
        console.log   (  "Four"  )   ;
    }

}


/* This global call initiates the script execution.
 * It reads the entire content of '/dev/stdin' (standard input)
 * as a UTF-8 encoded string.
 * This string is then passed as an argument to the 'main' function.
 * The 'require('fs')' part loads Node.js's file system module.
 */
main   (  require   (  'fs'  )  .readFileSync   (  '/dev/stdin'  ,   'utf8'  )  )   ;