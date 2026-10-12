/* This script processes a series of numeric inputs
 * and determines an outcome based on specific calculations. */

// A mock data source for demonstration purposes, simulating console input.
const sourceData = [
    "1 2 3",
    "4 5 6",
    "7 8 9",
    "10 1 2"
];

let currentPosition = 0; // Tracks the current line being read from the source.

// Helper function to fetch the next line from our simulated input.
function obtainNextEntry() {
    if (currentPosition < sourceData.length) {
        return sourceData[currentPosition++]; // Increment position after use.
    }
    return null; // Return null when no more entries are available.
}


let finalOutcomes = []; // Collection to store the final results.

// Main processing loop: continues as long as there's input.
let currentScan;
while ( ( currentScan = obtainNextEntry ( ) ) !== null )
{
    // Decompose the incoming line into individual string tokens.
    const tokenSet = currentScan.split ( ' ' );

    // Convert string tokens to integer values.
    const firstNum  = Number.parseInt ( tokenSet [ 0 ] ) ;
    const secondNum = Number.parseInt ( tokenSet [ 1 ] ) ;
    const thirdNum  = Number.parseInt ( tokenSet [ 2 ] ) ;

    // Calculate an intermediate total. Note: This variable is not used later in the logic.
    const calculatedTotal = firstNum + secondNum ;

    // Initialize an array to store specific numeric marks.
    let elevationMarks = [ ] ;

    // Populate the elevationMarks array based on conditions.
    for ( let iteratorValue = 1 ; iteratorValue <= 10 ; iteratorValue++ )
    {
        // Check if the current iterator value is different from the three parsed numbers.
        if ( iteratorValue !== firstNum || iteratorValue !== secondNum || iteratorValue !== thirdNum )
        {
            elevationMarks.push ( iteratorValue ) ; // Add value to the collection.
        }
    }

    // Evaluate a primary condition using parsed numbers and an element from elevationMarks.
    if ( firstNum + secondNum + elevationMarks [ 3 ] <= 20 )
    {
        finalOutcomes.push ( "POSITIVE" ) ; // Store a positive indicator.
    }
    else
    {
        finalOutcomes.push ( "NEGATIVE" ) ; // Store a negative indicator.
    }
}

// Iterate through the collected outcomes and display each one.
for ( const individualOutcome of finalOutcomes )
{
    console.log ( individualOutcome ) ; // Output the result to the console.
}