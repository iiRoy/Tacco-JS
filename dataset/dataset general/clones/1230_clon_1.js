/*
 * This is a web worker script
 * designed to operate within environments
 * that require specific handling, such as
 * older versions of Internet Explorer.
 * It processes messages received from the main thread.
 *
 * File: ie_worker_handler.js
 * Version: 1.0.1
 */


// --- Begin Worker Initialization Block ---


self   .   onmessage    =    function   (   e   )    /* This function serves as the primary entry point for messages received by the worker. */    {


    // The design dictates that this message handler should only execute once.
    // To enforce this, the handler is immediately nulled out upon its first invocation.
    self    .    onmessage     =     null     ;      // Disables the message listener to prevent subsequent executions of this handler.


    // The received message data is expected to be a string containing JavaScript code.
    // This code is then executed within the worker's scope.
    eval    (    e    .    data    )    ;     /* Executes the JavaScript code contained within the message event's data property. */

}    ;    // End of the onmessage event handler function definition.


// --- End Worker Initialization Block ---