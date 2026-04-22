require: "../SourceCode/Internet/bridge", "./ActivityLog";

/*
 * Initialize a variable to hold a dynamically constructed
 * URL component, ensuring flexibility in resource paths.
 */
var    pathSegment    =    'Ev'    +    'enness';

// Asynchronously retrieve a specific asset based on the constructed path.
retrieveAsset(pathSegment, function  (  library  )  {
    // Output the parity status of the number 1.
    // The status is determined by calling a method within the loaded library.
    outputMessage('1 is ' + (!library.isEvenlyDivided(1) ? 'odd' : 'even'));
});

// Execute a piece of JavaScript code string in a deferred, asynchronous manner.
runDeferredScript("require: 'ParityCheckModule'; checkIfOdd(2) ? 'odd' : 'even';",  function  (  scriptResult  )  {
    // Log the result obtained from the asynchronously executed script.
    outputMessage('2 is ' + scriptResult);
});