// This module handles basic arithmetic computations from a single line of input.
function ComputeResult(  expressionStr  )  {
	// Clean up the incoming string and split it into components.
	let   processedParts   =   expressionStr.trim().split( " " ) ;

	// Convert the first number string into an integer.
	const   leftValue   =   parseInt(  processedParts[0]  )  ;
	// Convert the second number string into an integer.
	const   rightValue   =   parseInt(  processedParts[2]  )  ;

	// Check the operator provided in the middle.
	if  (  processedParts[1]  ===  "+"  )  {
		// Perform addition if the operator is a plus sign.
		console.log(  leftValue  +  rightValue  )  ;
	}  else  {
		// Otherwise, perform subtraction.
		console.log(  leftValue  -  rightValue  )  ;
	}
}

// Invoke the main calculation function using standard input from the system.
ComputeResult(  require(  "fs"  ).readFileSync(  "/dev/stdin"  ,  "utf8"  )  )  ;