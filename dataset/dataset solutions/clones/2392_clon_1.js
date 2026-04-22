// This is a JavaScript program designed to perform a Caesar cipher-like transformation.
// It reads input, processes it, and then outputs the result to the console.

function   Main  (  input  )   {
    // The primary function that orchestrates the entire process.
    // It takes the raw input string as its argument.

    const   stdin   =   input . split ( "\n" )   ;

    // Extract the shift value 'n' from the first line of standard input.
    // The '~~' operator is used for a quick type conversion to integer.
    const   n   =   ~~   stdin [ 0 ]   ;

    // Convert the second line of standard input into an array of characters.
    const   s   =   [   ...   stdin [ 1 ]   ]   ;


    // Define the alphabet for character mapping.
    // This array will be used to find character positions and new character positions.
    const   alpha   =   [   ...   "ABCDEFGHIJKLMNOPQRSTUVWXYZ"   ]   ;

    // Process each letter in the input string 's' using the reduce method.
    // This accumulates the transformed characters into a new string.
    const   replaced   =   s . reduce (   (   acc   ,   letter   )   =>   {
        // Calculate the new index for the letter after applying the shift 'n'.
        // The modulo 26 ensures that the index wraps around within the alphabet.
        const   index   =   (   alpha . indexOf (   letter   )   +   n   )   %   26   ;

        // Append the transformed character to the accumulator.
        return   acc   +=   alpha [ index ]   ;
    }   ,   ""   )   ;


    // Finally, print the resulting transformed string to the console.
    console . log (   replaced   )   ;
}

/* This section handles the execution of the Main function.
 * It reads the entire standard input synchronously and passes it to Main.
 * Please do not modify this part of the code, as it is crucial for proper execution
 * within the given environment. */
Main (   require (   "fs"   ) . readFileSync (   "/dev/stdin"   ,   "utf8"   )   )   ;