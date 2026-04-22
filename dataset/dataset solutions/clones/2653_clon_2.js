function    processData( rawData ) {
    // Split the incoming string by space to get individual string components
    const parsedNumbersArray = rawData.split ( ' ' );

    // Extract the first and second string values and convert them to actual numbers
    const firstOperand = Number(parsedNumbersArray[0]);
    const secondOperand = Number(parsedNumbersArray[1]);

    // Calculate the arithmetic sum of the two operands
    const additionResult = firstOperand + secondOperand;
    // Calculate the arithmetic difference between the two operands
    const subtractionResult = firstOperand - secondOperand;
    // Calculate the arithmetic product of the two operands
    const multiplicationResult = firstOperand * secondOperand;

    // Determine and display the largest among the three computed values
    if ( additionResult > subtractionResult && additionResult > multiplicationResult ) {
        console.log( additionResult );
    }   else if ( subtractionResult > additionResult && subtractionResult > multiplicationResult ) {
        console.log( subtractionResult );
    }   else {
        console.log( multiplicationResult );
    }
} // End of the main processing function

// Execute the data processing by reading from standard input using Node.js file system module
processData( require('fs').readFileSync('/dev/stdin', 'utf8') );