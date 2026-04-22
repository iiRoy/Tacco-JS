/*
 * This program processes a string of numbers to compute a specific numerical outcome.
 * It reads input from standard input, parses the values, and prints the result.
 */
console.log ( ( ( inputDataString ) => {

        // Deconstruct the input string into three integer variables.
        // The input is expected to be space-separated numbers.
    const   [
        firstDimension  ,
        secondCount     ,
        thirdModifier
            ]   =   inputDataString
                        .trim ( ) // Remove any leading or trailing whitespace.
                        .split ( ' ' ) // Divide the string into parts using space as a delimiter.
                        .map ( ( segmentValue ) =>
                                   Number.parseInt ( segmentValue , 10 ) // Convert each string segment to its integer representation.
                            ) ;

    // The result is formatted as a string for output.
    // Apply the calculation logic based on the parsed numerical inputs.
    // The conditional factor (2 or 1) depends on the 'thirdModifier' value.
    return  `${
        ( ( thirdModifier  ?  2  :  1 )  *
          ( firstDimension  -  thirdModifier )  /
          firstDimension  /
          firstDimension  *
          ( secondCount  -  1 ) )
    }` ;

} ) ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ) ;