// This file defines the 'Spies' utility library for JavaScript.
// It provides functionality for creating stubs and spies on functions.

var Spies; // Declare the global 'Spies' object.

// Check if the 'Spies' namespace has already been defined to prevent conflicts.
if ( Spies )
{
    // If it exists, throw an error to alert the developer.
    throw "The Spies namespace has already been defined by a previously loaded library";
}

// Initialize the 'Spies' object as an empty container.
Spies = {};




/*
 * Spies.stub:
 * Creates a function stub that records calls and arguments,
 * but does not execute any original logic.
 *
 * @returns {object} A spy object that can be queried.
 */
Spies.stub = function ( )
{
    var spy; // Declare a variable to hold the newly created spy.

    // Utilize Spies.spyOn to create the stub.
    // 'null' context is used as there's no specific object method to call.
    spy = Spies.spyOn.apply ( null, arguments );

    // Provide an alias for stopping the stub.
    spy.removeStub = spy.stopSpying;

    // Return the configured spy object.
    return spy;
};




/**
 * Spies.spyOn:
 * Replaces a method on an object with a spy function,
 * or creates a standalone spy.
 *
 * The spy records invocations and arguments, allowing for inspection.
 *
 * @param {object|string} objOrFunctionName - The object to spy on, or the name for a standalone spy.
 * @param {string|any} functionNameOrReturnValue - The name of the function on the object, or the return value for a standalone spy.
 * @param {any} [returnValue] - The value the spy function should return (optional, if spying on an object method).
 * @returns {object} A spy object with methods to inspect its behavior.
 */
Spies.spyOn = function ( )
{
    var obj,                // The target object (or a temporary object for standalone spies).
        functionName,       // The name of the function to spy on.
        returnValue,        // The value the spy function will return.
        wasCalled,          // Flag to indicate if the spy has been invoked.
        capturedArgs,       // Stores the arguments from the last invocation.
        originalFunction,   // Holds a reference to the original function before replacement.
        spy;                // The final spy object to be returned.

    // Determine the arguments based on the first parameter's type.
    // If it's a string, we're creating a standalone spy.
    if ( typeof arguments[0] === 'string' )
    {
        obj          = {};             // Create a simple object to hold the spy.
        functionName = arguments[0];   // The first argument is the function's name.
        returnValue  = arguments[1];   // The second argument is the desired return value.
    }
    // Otherwise, we're spying on an existing method of an object.
    else
    {
        obj          = arguments[0];   // The first argument is the object.
        functionName = arguments[1];   // The second argument is the method name.
        returnValue  = arguments[2];   // The third argument is the desired return value.
    }


    /**
     * initialize():
     * Resets the internal state of the spy.
     * Sets 'wasCalled' to false and clears 'capturedArgs'.
     */
    function initialize ( )
    {
        wasCalled    = false; // Reset the called status.
        capturedArgs = [ ];   // Clear any previously captured arguments.
    }


    /**
     * passedArguments():
     * Retrieves the arguments passed to the spy.
     *
     * @param {number} [index] - Optional. A 1-based index to retrieve a specific argument.
     * @returns {Array|any} All captured arguments, or a specific argument if an index is provided.
     */
    function passedArguments ( index )
    {
        if ( arguments.length === 0 )
        {
            return capturedArgs; // If no index, return all arguments.
        }
        else
        {
            // Adjust for 1-based indexing for user convenience.
            return capturedArgs[ index - 1 ];
        }
    }


    /**
     * spyFunction():
     * The actual function that replaces the original method.
     * It records its invocation details and returns the predetermined value.
     */
    function spyFunction ( )
    {
        capturedArgs = arguments; // Store the arguments received by this call.
        wasCalled    = true;      // Mark the spy as having been called.
        return returnValue;       // Return the configured return value.
    }


    // Store the original function so it can be restored later.
    originalFunction = obj[ functionName ];


    /**
     * resetOriginalFunction():
     * Restores the original function to the object, effectively
     * stopping the spying process.
     */
    function resetOriginalFunction ( )
    {
        obj[ functionName ] = originalFunction; // Put the original function back.
    }


    // Replace the target function with our spy function.
    obj[ functionName ] = spyFunction;


    // Construct the spy object with various helper methods.
    spy = {
        // Method to check if the spy has been called.
        wasCalled: function ( ) { return wasCalled; },

        // Method to retrieve arguments passed to the spy.
        passedArguments: passedArguments,

        // Method to stop spying and restore the original function.
        stopSpying: resetOriginalFunction,

        // Method to reset the spy's internal state.
        resetSpy: initialize,

        // A reference to the object being spied on.
        object: obj,

        // A reference to the actual spy function.
        spyFunction: spyFunction
    };


    // Initialize the spy's state immediately after creation.
    spy.resetSpy ( );

    // Return the fully configured spy object.
    return spy;
};