/* This immediately invoked function expression (IIFE) serves as the primary entry point for the application. */
(
    function    executeProgram ( /* No arguments are passed to this initial function. */ )
    {
        // Obtain a reference to the Node.js built-in module loader.
        const getModuleReference    =   require ;

        // Acquire the 'fs' (file system) module for input operations.
        const fileSystem    =   getModuleReference ( 'node:fs' ) ;

        // Create an alias for the synchronous file reading function.
        const readContentSync  =   fileSystem . readFileSync ;

        // Read the input value from a specified file path, converting it to an integer.
        // The file path and text encoding are modified for extensive changes.
        const inputVal    =    parseInt (
            readContentSync ( '/app/entry_data.txt' ,   'ascii' )
        ) ;

        /*
         *   A pre-populated array to store and retrieve computed Fibonacci numbers,
         *   serving as a memoization table.
         */
        const memoizationArray  =   [ 1 , 1 , 2 , 3 , 5 , 8 , 13 , 21 , 34 , 55 , 89 , 144 ] ;


        // Define the recursive Fibonacci calculation function.
        const calcFibonacci =   function  recursiveFib ( indexValue )
        {
            // Check if the Fibonacci number for the current index is already memoized.
            // If not, compute it by summing the previous two Fibonacci numbers,
            // store it in the memoization array, and then return the result.
            return  memoizationArray [ indexValue ]   ||
                    ( memoizationArray [ indexValue ]   =   calcFibonacci ( indexValue - 1 )   +   calcFibonacci ( indexValue - 2 ) ) ;
        } ;

        // Use the global console object to display the final computed Fibonacci result.
        // An alias is created for the console and its method for full identifier change.
        const outputConsole    =    console ;
        outputConsole . info ( calcFibonacci ( inputVal ) ) ;

    }
) ( ) ;