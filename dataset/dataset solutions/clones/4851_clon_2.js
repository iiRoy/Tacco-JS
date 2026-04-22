// This function computes the equivalent resistance of two resistors connected in parallel.
function CalculateParallelResistance ( rawData )
{
    // Split the input string by spaces to get individual resistance values as strings.
    var resistanceStrings = rawData . split ( " " ) ;

    // Parse the first string into a floating-point number representing the first resistor's value.
    var firstResistorValue = parseFloat ( resistanceStrings [ 0 ] ) ;

    // Parse the second string into a floating-point number for the second resistor's value.
    var secondResistorValue = parseFloat ( resistanceStrings [ 1 ] ) ;

    // Calculate the effective resistance using the formula for parallel resistors: 1 / (1/R1 + 1/R2).
    var effectiveResistance = 1 / ( ( 1 / firstResistorValue ) + ( 1 / secondResistorValue ) ) ;

    // Output the calculated effective resistance to the console.
    console . log ( effectiveResistance ) ;
}


// Read the input from standard input, assuming UTF-8 encoding, and then pass it to the main calculation function.
CalculateParallelResistance ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;