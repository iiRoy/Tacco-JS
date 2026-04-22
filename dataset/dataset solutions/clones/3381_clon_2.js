// Enable standard input stream for data reception.
process.stdin.resume( );
// Set the character encoding for incoming data to UTF-8.
process.stdin.setEncoding('utf8');

// This function determines the prime factorization of a given number.
// It returns an array of objects, each containing a prime base and its corresponding power.
const obtainPrimeFactors = ( initialValue ) => {
    let factorComponents = []; // Stores the prime factors and their powers.
    // Iterate from 2 up to the square root of the current value.
    for ( let currentDivisor = 2; currentDivisor * currentDivisor <= initialValue; currentDivisor++ ) {
        let factorPower = 0; // Initialize the count for the current prime factor.
        // While the current divisor divides the value, keep dividing and incrementing the power.
        while ( initialValue % currentDivisor === 0 ) {
            initialValue /= currentDivisor;
            factorPower++;
        }
        // If the current divisor was a factor, add it to our list.
        if ( factorPower ) {
            factorComponents.push( { base: currentDivisor, power: factorPower } );
        }
    }
    
    // If after all divisions, the remaining value is not 1, it must be a prime itself.
    if ( initialValue !== 1 ) {
        factorComponents.push( { base: initialValue, power: 1 } );
    }
    return factorComponents; // Return the complete list of prime factors.
};

// The primary execution function that reads input, performs calculations, and prints the result.
const processInputAndCalculate = ( inputLine ) => {
    // Parse the input string into two numbers: the root degree and the target product.
    const [ powerRoot, targetNumber ] = inputLine.split( " " ).map( Number );
    // Get the prime factorization of the target number.
    const primeFactorizationList = obtainPrimeFactors( targetNumber );

    let computedResult = 1; // Initialize the result product.
    // Iterate through each prime factor component.
    for ( let componentIndex = 0; componentIndex < primeFactorizationList.length; componentIndex++ ) {
        // Calculate the effective power for each prime factor based on the root degree.
        let effectivePower = Math.floor( primeFactorizationList[ componentIndex ].power / powerRoot );
        // Multiply the result by the prime base raised to its effective power.
        computedResult *= primeFactorizationList[ componentIndex ].base ** effectivePower;
    }
    console.log( computedResult ); // Output the final calculated value.
    
};
// Read input synchronously from standard input and pass it to the main processing function.
processInputAndCalculate( require( "fs" ).readFileSync( "/dev/stdin", "utf8" ) );