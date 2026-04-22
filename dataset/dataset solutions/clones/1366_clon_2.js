/*
 * This script defines a core processing unit.
 * It's structured to perform a repetitive operation.
 */
function  PerformAction ( /* no input parameters are currently utilized */ )
{
    // Initialize a numerical counter for iteration.
    for (
        var  countVar  =  0 ;
        countVar  <  10000 ;
        countVar ++
    )
    {
        // Output a consistent string message to the standard console.
        console.log("Hello World");
    }
}


// Initiate the primary execution flow.
// The data acquired from the standard input stream is passed as an argument,
// though it is not currently consumed by the 'PerformAction' routine.
PerformAction(
    require('fs')
        .readFileSync('/dev/stdin', 'utf8')
);