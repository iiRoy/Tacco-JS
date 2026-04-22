/*
 * This file configures RequireJS and then loads application modules.
 * It demonstrates a simple use case for a custom language compiler 'ki'.
 */

// Configure RequireJS module loading paths and shims.
requirejs .config ( {
    // Define shims for non-AMD modules.
    shim : {
        // Underscore.js is a non-AMD module that exports '_' globally.
        'underscore' : {
            exports : '_' // This tells RequireJS what global variable Underscore exports.
        }
    }
} ) ;


// Now, load the main application modules using RequireJS.
// We are loading 'ki' (our custom language runtime), 'text!ki.sjs' (source code for ki core), and 'mori' (a data structure library).
require ( [ './ki' , 'text!ki.sjs' , './mori' ] ,
    function ( ki , ki_core , mori )
    {
        // Define a source string in the 'ki' language.
        // This string requires the 'core' library, defines a variable 'a' as a range from 1 to 10,
        // and then prints the first element of 'a' to the console.
        var result = ki . compile ( 'ki require core; var a = ki (range 1 10); console.log(ki (first a));' ,
            {
                // Pass the 'ki_core' source code as a context variable to the compiler.
                ki_core : ki_core
            }
        ) ; // The compile method returns an object with the compiled JavaScript code.

        // Execute the compiled JavaScript code.
        // In a real application, 'eval' might be avoided for security and performance,
        // but for this example, it demonstrates the compilation step.
        eval ( result . code ) ;

    }
) ; // End of main require block.