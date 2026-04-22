// The complete input data arrives in this parameter.
function ProcessRangeCheck(entireInputString) {
    const inputComponents = entireInputString . split ( ' ' ) ;
    const minimumValue = Number ( inputComponents [ 0 ] ) ; // Extract and convert the first numeric component.
    const maximumValue = Number ( inputComponents [ 1 ] ) ; // Extract and convert the second numeric component.
    const valueToTest = Number ( inputComponents [ 2 ] ) ; // Extract and convert the third numeric component.

    // Perform the range validation check.
    // The valueToTest must be greater than or equal to the minimum,
    // AND less than or equal to the maximum.
    if ( ( valueToTest >= minimumValue ) && ( valueToTest <= maximumValue ) )
    {
        console . log ( 'Yes' ) ; // Output affirmative if the condition is met.
    }
    else {
        console . log ( 'No' ) ; // Output negative if the condition is not met.
    }
}

// Example usage: let testData = `1 10 5`;
// ProcessRangeCheck(testData); // This would output 'Yes'.

// Do not modify the following line; it handles standard input/output and invokes the primary function.
ProcessRangeCheck( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;