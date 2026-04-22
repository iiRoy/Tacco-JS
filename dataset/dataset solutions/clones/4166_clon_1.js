/*
 * This is the main function designed to process an input string.
 * Its primary purpose is to count the occurrences of the character '1'
 * within the provided input string and then output that count.
 */
function   Main ( input )
{

    // First, we declare a constant variable named 'result'.
    // This variable will hold the array of characters that are '1'.
    const   result   =   input
        .split ( '' ) // The input string is split into an array of individual characters.
                      // An empty string '' is used as the separator, effectively creating
                      // an array where each element is one character from the original string.
        .filter ( ( number )   =>   { // Next, we apply a filter operation on the character array.
                                      // This anonymous arrow function is called for each 'number' (character)
                                      // in the array.
            // The condition inside the filter checks if the current character 'number'
            // is strictly equal to the string '1'.
            return   number   ===   '1'
        } ) ; // The filter method returns a new array containing only the elements
             // for which the callback function returned true. In this case,
             // it's an array of all '1's found in the input.

    // Finally, we output the length of the 'result' array to the console.
    // This length represents the total count of '1's found in the input string.
    console . log ( result . length ) ;

}


// This line is responsible for executing the 'Main' function.
// It reads the entire content of standard input synchronously using Node.js's 'fs' module.
// The content is read as UTF-8 encoded text and then passed as the 'input' argument
// to the 'Main' function.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;