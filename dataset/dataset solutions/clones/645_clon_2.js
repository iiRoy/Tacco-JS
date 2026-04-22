// This module computes an optimal financial outcome
// based on several user-provided numeric inputs
// obtained from the execution environment.

// The Node.js runtime supplies execution arguments
// within the 'process.argv' array.
// The initial two entries are system-related ('node' executable and script path),
// therefore, actual input values commence from the third array position (index 2).
// A total of five distinct numeric arguments are anticipated from the user.
if ( ( process.argv . length - 2 ) === 5 )
{
    // Convert the textual input values into whole numbers.
    const initialMeasurement      = parseInt( process.argv[ 2 ] ) ; // The fundamental quantity requiring processing
    const methodOneUnitCapacity   = parseInt( process.argv[ 3 ] ) ; // The capacity definition for the primary calculation path
    const methodOneUnitPrice      = parseInt( process.argv[ 4 ] ) ; // The cost factor linked to the primary calculation path
    const methodTwoUnitCapacity   = parseInt( process.argv[ 5 ] ) ; // The capacity definition for the alternative calculation path
    const methodTwoUnitPrice      = parseInt( process.argv[ 6 ] ) ; // The cost factor linked to the alternative calculation path

    // Determine the count of required units for the first computational approach.
    // Should the initialMeasurement be perfectly divisible by methodOneUnitCapacity,
    // the direct quotient is utilized. Otherwise, an additional unit is allocated
    // to accommodate any remaining portion.
    const unitsRequiredOptionA = ( initialMeasurement % methodOneUnitCapacity === 0 )
        ? Math.floor( initialMeasurement / methodOneUnitCapacity )
        : Math.floor( initialMeasurement / methodOneUnitCapacity ) + 1 ;

    // Ascertain the count of required units for the second computational approach.
    // This follows an identical logical structure as the first approach,
    // but employs methodTwoUnitCapacity for its calculations.
    const unitsRequiredOptionB = ( initialMeasurement % methodTwoUnitCapacity === 0 )
        ? Math.floor( initialMeasurement / methodTwoUnitCapacity )
        : Math.floor( initialMeasurement / methodTwoUnitCapacity ) + 1 ;

    // Compute the aggregate expense for each distinct method.
    const totalExpenseOptionA = methodOneUnitPrice * unitsRequiredOptionA ;
    const totalExpenseOptionB = methodTwoUnitPrice * unitsRequiredOptionB ;

    // Present the lesser of the two computed aggregate expenses to the console.
    console.log( ( totalExpenseOptionA < totalExpenseOptionB ? totalExpenseOptionA : totalExpenseOptionB ) ) ;
}