function computePrimes( upperLimit ) { // This function identifies all prime numbers up to a specified maximum value using a sieve method.
    // Initialize an array to act as a sieve; each index will represent a number.
    const sieveArray = [];

    // Populate the array with numbers from 0 up to the upper limit.
    for ( let currentIdx = 0; currentIdx <= upperLimit; currentIdx++ ) {
        sieveArray[ currentIdx ] = currentIdx;
    }

    // Mark 0 and 1 as not prime, as per definition.
    sieveArray[ 0 ] = false;
    sieveArray[ 1 ] = false;

    // Calculate the integer part of the square root of the upper limit for optimization.
    // We only need to check for prime factors up to this square root.
    const sqrtLimit = Math.floor( Math.sqrt( upperLimit ) );

    // Apply the Sieve of Eratosthenes algorithm.
    // Iterate from 2 up to the square root limit.
    for ( let currentIdx = 2; currentIdx <= sqrtLimit; currentIdx++ ) {
        // If the current number is already marked as false (not prime), skip to the next.
        if ( sieveArray[ currentIdx ] === false ) {
            continue;
        }

        // If 'currentIdx' is prime, mark all its multiples as not prime.
        // Start marking from 'currentIdx * currentIdx' (or currentIdx + currentIdx for clarity)
        // because smaller multiples would have already been marked by smaller primes.
        for ( let multipleIdx = currentIdx + currentIdx; multipleIdx <= upperLimit; multipleIdx += currentIdx ) {
            sieveArray[ multipleIdx ] = false;
        }
    }

    // After the sieve process, collect all numbers that are still marked as true (their own value).
    const primeList = []; // This array will hold the final list of prime numbers.
    for ( let currentIdx = 0; currentIdx <= upperLimit; currentIdx++ ) {
        if ( sieveArray[ currentIdx ] !== false ) { // If the number is not marked as false, it is a prime.
            primeList.push( sieveArray[ currentIdx ] ); // Add it to our list of primes.
        }
    }

    return primeList; // Return the generated list of primes.
}

// Execute the prime number computation for numbers up to 50,000.
const generatedPrimes = computePrimes( 50000 );

// Read input data from standard input, using Node.js's 'fs' module.
const fileData = require( 'fs' ).readFileSync( '/dev/stdin', 'utf8' );

// Process the raw input: trim whitespace, split by newline characters, and convert each part to a number.
const parsedData = ( fileData.trim() ).split( "\n" ).map( Number );

// Begin the main processing loop for each target value provided in the input.
while ( true ) {
    // Extract the next number from the parsed input array.
    const targetValue = parsedData.shift();

    // If the extracted number is 0, it signifies the end of input; break out of the loop.
    if ( targetValue === 0 ) {
        break;
    }

    // Initialize an object to store unique combinations of prime pairs that sum to the target value.
    // The keys will be string representations of prime pairs, and values will be 'true'.
    const sumCombinations = {};

    // Iterate through the list of generated primes using an outer loop.
    for ( let outerIndex = 0; outerIndex < generatedPrimes.length; outerIndex++ ) {
        const firstPrime = generatedPrimes[ outerIndex ];

        // Optimization: If the current 'firstPrime' is already greater than or equal to the 'targetValue',
        // then no subsequent primes in the sorted list will form a sum with another prime to reach 'targetValue'.
        if ( firstPrime >= targetValue ) {
            break;
        }

        // Iterate through the list of generated primes again using an inner loop.
        for ( let innerIndex = 0; innerIndex < generatedPrimes.length; innerIndex++ ) {
            const secondPrime = generatedPrimes[ innerIndex ];

            // Optimization: If the current 'secondPrime' is already greater than or equal to the 'targetValue',
            // it cannot be part of a sum for 'targetValue' (assuming positive primes); skip to the next.
            if ( secondPrime >= targetValue ) {
                continue;
            }

            // Check if the sum of the two current primes equals the 'targetValue'.
            if ( ( firstPrime + secondPrime ) === targetValue ) {
                // Construct a key for the reverse order of the prime pair (e.g., "73" for (3,7)).
                const reverseKey = secondPrime + "" + firstPrime;

                // Check if the reverse-ordered key already exists in 'sumCombinations'.
                // This ensures that pairs like (3,7) and (7,3) are counted only once.
                if ( sumCombinations.hasOwnProperty( reverseKey ) === false ) {
                    // If the reverse key does not exist, then this specific pair (in either order)
                    // has not been recorded yet.
                    const currentKey = firstPrime + "" + secondPrime; // Construct the key for the current order.
                    sumCombinations[ currentKey ] = true; // Store this unique pair.
                }
            }
        }
    }

    // After checking all prime pairs, print the total number of unique combinations found
    // for the current 'targetValue'. This is determined by the number of keys in 'sumCombinations'.
    console.log( Object.keys( sumCombinations ).length );
}