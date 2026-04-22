/*
 * This JavaScript file defines a simple weather state transition logic.
 * It takes a current weather state as input and outputs the next state.
 *
 * This is a Type I clone, meaning only whitespace and comments have been altered.
 */

// The primary function to handle the weather state determination.
function Main ( input )
{
    // Define an object to map current weather states to their next states.
    var   obj   =
    {
        // If the current state is 'Sunny', the next state will be 'Cloudy'.
        'Sunny'   :   'Cloudy'   ,

        // If the current state is 'Cloudy', the next state will be 'Rainy'.
        'Cloudy'   :   'Rainy'   ,

        // If the current state is 'Rainy', the next state will be 'Sunny'.
        'Rainy'   :   'Sunny'
    }   ; // End of the weather transition map object.


    // Retrieve the next weather state using the input as a key and print it to the console.
    console   .   log   (   obj   [   input   ]   )   ;

} // End of the Main function definition.


// Execute the Main function, providing input read from standard input.
// The 'fs' module is used to read the file contents, assuming standard input is treated as a file.
Main   (   require   (   "fs"   )   .   readFileSync   (   "/dev/stdin"   ,   "utf8"   )   )   ;