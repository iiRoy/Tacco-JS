/*
 * This is a Type I clone of the original JavaScript code.
 * It demonstrates string reversal.
 */

// Define the main function responsible for reversing a string.
function  reverseStr  (  str  )
{
    // Step 1: Convert the input string into an array of characters.
    // An empty string as a delimiter means splitting after each character.
    var   splitString   =   str.split( "" ) ;

    // Step 2: Reverse the order of elements within the character array.
    // This operation modifies the array in place.
    var   reverseArray   =   splitString.reverse()  ;

    // Step 3: Join the characters back together to form a new string.
    // An empty string as a separator means no character will be inserted between elements.
    var   joinArray   =   reverseArray.join( "" ) ;

    // Output the final reversed string to the console.
    console.log(  joinArray  ) ;

} // End of the reverseStr function.


// Call the function with an example string to demonstrate its usage.
reverseStr( "Harry" ) ; // This will output "yrraH" to the console.