// This file contains a custom logging utility and a console polyfill.
// Original source: paulirish.com/2009/log-a-lightweight-wrapper-for-console.log/
//
// This utility aims to provide a robust logging mechanism that gracefully
// handles environments where `console.log` might not be available or
// might behave unexpectedly.
//
// Example usage of the custom log function:
//   log('Entering function:', someVariable, this, arguments);
//   log('Debug message:', 'Value of X is', x);


// Define a global logging function, 'log', attached to the window object.
// This function will store a history of all calls and attempt to proxy
// them to the native console if available.
window.log = function f()
{
    // Initialize log history if it doesn't exist.
    // This allows inspecting past log calls, which can be useful for debugging.
    log.history = log.history || [];

    // Store the current arguments in the history for later inspection.
    // The `arguments` object captures all parameters passed to this function.
    log.history.push(arguments);

    // Check if the browser's native console object is available in the current context.
    if ( this.console )
    {
        // Declare variables for the original arguments object and the processed array.
        var args    = arguments,
            newarr; // This will hold the array-like arguments converted to a true Array.

        // Attempt to get the caller of the current function.
        // Note: `args.callee` is a deprecated feature and will throw an error
        // in strict mode. Its use here is for compatibility with older browsers/patterns.
        args.callee = args.callee.caller;

        // Convert the 'arguments' object into a true Array using Array.prototype.slice.call.
        // This is a common technique to get an array from an array-like object.
        newarr      = [].slice.call(args);

        // Determine the correct way to call console.log based on its type.
        // Some older Internet Explorer versions might have `console.log` as an object
        // rather than a function, which requires a different invocation pattern.
        if ( typeof console.log === 'object' )
        {
            // For object-based console.log, use Function.prototype.apply.call.
            // This allows invoking the method with `console` as its `this` context.
            log.apply.call( console.log, console, newarr );
        }
        else
        {
            // For function-based console.log (the standard behavior), use direct apply.
            // This applies the `newarr` as individual arguments to `console.log`.
            console.log.apply( console, newarr );
        }
    }
}; // End of window.log function definition.


// This immediately-invoked function expression (IIFE) serves as a console polyfill.
// Its primary purpose is to ensure that console methods are always available,
// preventing runtime errors in browsers or environments that do not natively
// support the `console` object or some of its specific methods.
// It effectively "polyfills" the console object.

(function( a )
{
    // Define a no-operation (no-op) function. This function does nothing when called.
    // It will be used as a placeholder for any console methods that are not natively supported.
    function b()
    {
        /* This function intentionally does nothing. It acts as a silent fallback. */
    }

    // A comma-separated string containing a comprehensive list of common console methods.
    // These are the methods we want to ensure exist on the console object to prevent errors.
    var c = "assert,count,debug,dir,dirxml,error,exception,group,groupCollapsed,groupEnd,info,log,markTimeline,profile,profileEnd,time,timeEnd,trace,warn".split( "," ),
        d; // This variable will temporarily hold the name of each console method popped from array 'c'.

    // Iterate through the array of console method names in reverse order.
    // The `while ( !!( d = c.pop() ) )` loop continues as long as `d` (the popped method name) is truthy.
    while ( !!( d = c.pop() ) )
    {
        // If the console method `a[d]` (e.g., `console.log` or `console.warn`) does not exist
        // (i.e., it's undefined or null), assign our no-op function `b` to it.
        // This ensures that calling `console.nonExistentMethod()` will not throw an error.
        a[d] = a[d] || b;
    }
})

// This second IIFE is immediately invoked and its return value is passed as the 'a' argument
// to the first IIFE. Its role is to safely obtain the console object.
(function()
{
    try
    {
        // Attempt to call `console.log()`. This is done to check for the existence
        // and basic functionality of the console object. In some very old or
        // non-standard environments, `console` might exist but its methods could be undefined
        // or not callable, leading to an error here.
        console.log();

        // If `console.log()` succeeds without throwing an error, it means `window.console`
        // is likely a valid and usable console object. Return it.
        return window.console;
    }
    catch ( a )
    {
        // If an error occurs (e.g., `console` is undefined, or `console.log` is not a function),
        // then define a dummy, empty console object on `window`. This prevents subsequent
        // calls to `console` methods from throwing errors.
        // The empty object will then be populated with no-op functions by the first IIFE.
        return ( window.console = {} );
    }
}()); // The outer parentheses immediately invoke this function.


// This section is typically reserved for additional JavaScript plugins,
// such as jQuery extensions or other utility libraries.
// Placing them here can sometimes optimize load times by reducing HTTP requests,
// as they are bundled into a single file.
// It's a common practice in older web development workflows.
//
// End of file.