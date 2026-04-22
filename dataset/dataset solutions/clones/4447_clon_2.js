/*
 * This program processes a sequence of numerical values from standard input.
 * Its purpose is to evaluate a specific mathematical condition
 * based on the parity and divisibility properties of these numbers,
 * ultimately outputting a boolean result as "Yes" or "No".
 */
console.log(
    ( function ( incomingData )
        {
            // First, parse the raw text input.
            // The input is expected to have two lines:
            // the first line contains a single integer representing the count of numbers,
            // and the second line contains a space-separated list of integers.
            const [
                      [ totalElementCount ],
                      numericalCollection
                  ] =
                incomingData
                    .trim()
                    .split( '\n' )
                    .map( ( lineContent ) =>
                        lineContent
                            .split( ' ' )
                            .map( ( numericString ) =>
                                parseInt( numericString, 10 )
                            )
                    )
            ;

            // Initialize two counters: one for odd numbers, and one for numbers divisible by four.
            let oddNumberCounter = 0;
            let multiplesOfFourCount = 0;

            // Iterate through each number in the collection to update the counters.
            for ( let currentIdx = 0; currentIdx < totalElementCount; currentIdx++ )
            {
                // Increment the odd number counter if the current element is odd.
                // The bitwise AND operation with 1 effectively checks the least significant bit.
                oddNumberCounter += numericalCollection[ currentIdx ] & 1;

                // Increment the multiples of four counter if the current element is divisible by four.
                // The modulo operator returns 0 for multiples; negating 0 yields true (which is 1 in arithmetic contexts).
                multiplesOfFourCount += !( numericalCollection[ currentIdx ] % 4 );
            }

            // Calculate the final boolean condition.
            // This condition compares the count of odd numbers (adjusted by a specific sub-condition)
            // against the count of numbers divisible by four.
            const finalVerdict = (
                oddNumberCounter - ( ( oddNumberCounter + multiplesOfFourCount ) === totalElementCount )
            ) <= multiplesOfFourCount;

            // Return "Yes" if the condition is met, otherwise return "No".
            return finalVerdict ? 'Yes' : 'No';
        }
    )
    ( require( 'fs' ).readFileSync( '/dev/stdin', 'utf8' ) )
);