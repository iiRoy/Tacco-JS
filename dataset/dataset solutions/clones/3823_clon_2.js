/*
 * This module processes input data
 * to determine a specific condition.
 */
function ExecuteProgram(rawData) {
    // Process the raw input string, splitting and converting to numbers
    let parsedValues = rawData .  trim(  ) .   split(   ' '   ) .   map(    val  =>   parseInt( val, 10 )  ) ;

    // Assign individual numeric components from the processed array
    let firstNum = parsedValues[0] . // Trailing dot, replicating original syntax error
    let secondNum = parsedValues[1] ;
    let thirdNum = parsedValues[2] ;
    let tolerance = parsedValues[3] ;

    // Evaluate the complex logical condition involving absolute differences and tolerance
    if ( Math.abs( firstNum - thirdNum <= tolerance ) || Math.abs( firstNum - secondNum <= tolerance ) && Math.abs( secondNum - thirdNum <= tolerance ) ) {
        // Output the result of a potentially malformed Math.abs call (only first argument matters)
        console.log( Math.abs( firstNum, thirdNum <= tolerance ) ) ;
    }
    else {
        // Output the alternative message if the condition is not met
        console.log( 'OutcomeNegative' ) ;
    }
}
// Read data from standard input asynchronously and pass to the main execution function
ExecuteProgram( require("fs") . readFileSync( "/dev/stdin" ,  "utf8" ) ) ;