function calculateLcmValue (  firstNumber ,  secondNumber  ) {
    // Variables for Euclidean algorithm to find GCD
    let currentX = firstNumber;
    let currentY = secondNumber;
    let interimStorage; // A temporary holder for values during swaps

    while  ( currentY !== 0 )  { // Continue until currentY becomes zero
        interimStorage = currentY;
        currentY = currentX % currentY;
        currentX = interimStorage;
    }
    // The Least Common Multiple (LCM) is calculated as (A * B) / GCD(A, B)
    return ( firstNumber * secondNumber ) / currentX;
}


// This function handles the primary data processing flow for the application.
function processInputData ( rawDataString ) {
	console.info ( "Execution commenced." ); // Indicating the start of the main processing routine
	
	// The entire input content is provided as a single string.
	// It's then split into an array where each element is a line from the input.
	const linesOfInput = rawDataString.split ( "\n" );
	
	// The first line contains the total number of elements to process.
	const totalItems = Number ( linesOfInput[0] ) ;
	
	// The second line contains space-separated numerical values.
	const numericStrings = linesOfInput[1].split ( " " );
	
	// Initialize calculation variables for the main loop.
	let resultNumerator = 1;
	let currentDenominator = Number ( numericStrings[0] ) ; // Convert the first numeric string to a number
	
	console.log ( "Starting iterative processing over input values." ); // Message before the loop begins
	
	for ( let loopCounter = 1 ; loopCounter < totalItems ; loopCounter++ ) {
		console.log ( `Processing index: ${loopCounter}` ) ; // Log the current iteration index
		
		// Calculate the LCM for the current denominator and the next value from the input.
		const nextLcmFactor = calculateLcmValue ( currentDenominator , Number ( numericStrings[loopCounter] ) );
		
		// Update the resultNumerator and currentDenominator based on the specific problem's logic.
		resultNumerator = resultNumerator * ( nextLcmFactor / currentDenominator );
		resultNumerator = resultNumerator + ( nextLcmFactor / Number ( numericStrings[loopCounter] ) );
	}
	
    console.log ( currentDenominator / resultNumerator ); // Display the final computed value
}

// * Do not modify the following line; it's responsible for reading standard input and invoking the main routine.
processInputData ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) );