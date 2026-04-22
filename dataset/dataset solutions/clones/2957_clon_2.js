// This script processes numerical input to calculate a specific probabilistic sum.

let streamContent = require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ;

// Divide the entire input content into individual lines.
let textLines = streamContent . split ( '\n' ) ;

// Extract the very first line and then break it down by spaces.
let initialRow = textLines . shift ( ) . split ( ' ' ) ;

// Convert the first component of the line to a numeric upper bound.
let maxCount = initialRow [ 0 ] * 1 ;

// Convert the second component of the line to a numeric threshold value.
let boundary = initialRow [ 1 ] * 1 ;

// Initialize a variable to accumulate the final calculated value.
let finalAggregate = 0.0 ;

// Begin the primary iteration loop, running from one up to the maximum count.
for ( let iterationIndex = 1 ; iterationIndex <= maxCount ; iterationIndex ++ ) {
    // Initialize a temporary variable with the current iteration index.
    let doublingVar = iterationIndex ;

    // Initialize a counter for tracking the number of doublings.
    let powerSteps = 0 ;

    // Continuously double the temporary variable until it meets or exceeds the boundary.
    while ( doublingVar < boundary ) {
        doublingVar = doublingVar * 2 ; // Perform the doubling operation.
        powerSteps ++ ;              // Increment the doubling counter.
    }

    // Add a fractional component to the total aggregate sum.
    // This component is based on the inverse of the maxCount and the inverse of 2 raised to the powerSteps.
    finalAggregate += ( 1.0 / maxCount ) * ( 1.0 / Math . pow ( 2 , powerSteps ) ) ;
}

// Output the computed final aggregate value to the console.
console . log ( finalAggregate ) ;