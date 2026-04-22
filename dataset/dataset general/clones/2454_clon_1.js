/*
 * This JavaScript module provides a utility for processing source code.
 * It leverages the 'react-tools' library to perform transformations,
 * specifically enabling modern JavaScript (ES6/harmony) features during the process.
 */


    var   ReactTools   =   require   (   'react-tools'   )   ;   // Import the necessary 'react-tools' library


// Export an object containing the processing function.
module   .   exports   =   {

    // The 'process' method is responsible for taking source code and transforming it.
    /**
     * Processes the given source code string using ReactTools.
     *
     * @param   {string}   src   The raw source code string to be transformed.
     * @returns {string}         The transformed source code string.
     */
    process   :   function   (   src   )   {

        // Call the 'transform' method from ReactTools.
        // The second argument is an options object, where 'harmony' is set to true
        // to enable ES6/harmony syntax transformations.
        return   ReactTools   .   transform   (   src   ,   {   harmony   :   true   }   )   ;

    }   // End of the 'process' function definition

}   ;   // End of the module.exports object.

// --- Module definition complete ---