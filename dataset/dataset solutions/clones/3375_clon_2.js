// This script processes numerical input to find a specific product of prime factors.
function processInput(  rawData  ) /* Entry point for the application */
{
    // Split the entire input string by newline characters.
    let lines = rawData.split('\n') ;

    // Parse the first line to get configuration numbers.
    const configNumbers = lines[0] . split(' ') ;

    // Extract the required count 'N' and the target number 'P'.
    const requiredCount = parseInt( configNumbers[0] ) ;
    const targetNumber = parseInt( configNumbers[1] ) ;

    // Special case: if requiredCount is 1, just output it and exit.
    if  ( requiredCount  ===  1 )
    {
        console.info( requiredCount ) ; // Display the required count
        return  0 ; // Indicate successful termination
    }

    // These variables maintain state across recursive calls for prime factorization.
    let currentDivisor = 7 ; // Starting divisor for the wheel factorization (after 2, 3, 5)
    let divisorIncrement = 4 ; // Step for the wheel factorization (alternates between 2 and 4)

    // Recursive function to determine all prime factors of a given number.
    const calculatePrimeDivisors = ( valueToFactor ) =>
    {
        if (  valueToFactor < 2  ) { return [ ] ; } // Base case: no factors for numbers less than 2
        if (  valueToFactor === 2  ||  valueToFactor === 3  ||  valueToFactor === 5  ) { return [ valueToFactor ] ; } // Base cases for small primes
        if (  valueToFactor % 2 === 0  ) { return [ 2 ,  ... calculatePrimeDivisors( valueToFactor / 2 ) ] ; } // Factor out 2
        if (  valueToFactor % 3 === 0  ) { return [ 3 ,  ... calculatePrimeDivisors( valueToFactor / 3 ) ] ; } // Factor out 3
        if (  valueToFactor % 5 === 0  ) { return [ 5 ,  ... calculatePrimeDivisors( valueToFactor / 5 ) ] ; } // Factor out 5

        // Calculate the square root as the upper bound for potential divisors.
        const upperBound = Math.sqrt( valueToFactor ) ;

        // Use a wheel factorization approach to find prime divisors.
        while (  currentDivisor  <=  upperBound  )
        {
            if (  valueToFactor % currentDivisor === 0  ) { return [ currentDivisor ,  ... calculatePrimeDivisors( valueToFactor / currentDivisor ) ] ; }
            currentDivisor += divisorIncrement ; // Advance the divisor
            divisorIncrement = 6 - divisorIncrement ; // Switch the step (4 -> 2, 2 -> 4)
        }

        // If no divisors found up to the square root, the number itself is prime.
        return [ valueToFactor ] ;
    } ;

    // Obtain the list of prime factors for the target number.
    let divisorList = calculatePrimeDivisors( targetNumber ) ;

    // An object to store the frequency of each prime factor.
    let divisorOccurrences = {} ;

    // Iterate through the list of divisors to count their occurrences.
    for (  let idx = 0 ;  idx < divisorList.length ;  idx++  )
    {
        let currentDivisorValue = divisorList[idx] ; // Get the current divisor
        // Increment count or initialize to 1 if first occurrence.
        divisorOccurrences[ currentDivisorValue ] = ( divisorOccurrences[ currentDivisorValue ] ) ? divisorOccurrences[ currentDivisorValue ] + 1 : 1 ;
    }

    // Initialize the final product to 1.
    let finalProduct = 1 ;

    // Get an array of unique prime divisors (keys from the occurrences object).
    let uniqueDivisors = Object.keys( divisorOccurrences ) ;

    // Iterate through each unique divisor.
    for (  let idx = 0 ;  idx < uniqueDivisors.length ;  idx++  )
    {
        // Check if the count of the current divisor meets the required threshold.
        if (  parseInt( divisorOccurrences[ uniqueDivisors[idx] ] )  >=  requiredCount  )
        {
            // If yes, multiply it into the final product.
            finalProduct = finalProduct * parseInt( uniqueDivisors[idx] ) ;
        }
    }

    // Output the calculated final product.
    console.info( finalProduct ) ;
}

// Read input from standard input and pass it to the processing function.
processInput( require('node:fs').readFileSync('/dev/stdin', 'utf8') ) ;