/* This function computes the count of specific divisor pairs recursively. */
function calculateValidFactorPairs  ( maximumValue, limitCondition )
{
    /* Inner helper function to check individual factor candidates. */
    function evaluatePotentialFactor( currentFactorCandidate )
    {
        // If the square of the candidate exceeds the maximum value, no more factors
        // can be found in this branch starting from currentFactorCandidate.
        if  ( currentFactorCandidate * currentFactorCandidate > maximumValue )
        {
            return 0 ;
        }

        /* Check if currentFactorCandidate is a divisor of maximumValue. */
        if ( maximumValue % currentFactorCandidate === 0 )
        {
            let otherFactor = maximumValue / currentFactorCandidate; // Calculate the complementary factor.

            // Condition check: if the other factor is less than 10.
            if ( otherFactor < 10 )
            {
                // Further specific conditions for counting.
                let combinedValue = otherFactor * 10 + currentFactorCandidate;
                let additionalCount = 0;

                // Check if combinedValue is less than limitCondition AND factors are distinct.
                if ( combinedValue < limitCondition && otherFactor !== currentFactorCandidate )
                {
                    additionalCount = 2; // Count both factors as distinct pair.
                }
                else
                {
                    additionalCount = 1; // Count as a single pair (either factors are same or combinedValue >= limitCondition).
                }
                // Recursively call with the next candidate and add the current count.
                return evaluatePotentialFactor( currentFactorCandidate + 1 ) + additionalCount;
            }
            else
            {
                // If otherFactor is not less than 10, proceed to the next candidate without adding to count.
                return evaluatePotentialFactor( currentFactorCandidate + 1 );
            }
        }
        else
        {
            // If currentFactorCandidate is not a divisor, move to the next candidate.
            return evaluatePotentialFactor( currentFactorCandidate + 1 );
        }
    }

    // Base case for the main recursive function: if maximumValue is too small.
    if ( maximumValue < 4 )
    {
        return 0;
    }
    else
    {
        // Start evaluating factors from 2 and recursively call for (maximumValue - 1).
        return evaluatePotentialFactor( 2 ) + calculateValidFactorPairs( maximumValue - 1, limitCondition );
    }
}


/* Main program entry point to process the input string. */
function ProcessInputData( incomingText )
{
    // Split the input string by space to get individual numeric components.
    incomingText = incomingText.split(" ");

    // Parse the first component into an integer for the maximum value.
    var firstNumericArgument = parseInt(incomingText[0], 10);

    // Parse the second component into an integer for the limit criterion.
    var secondNumericArgument = parseInt(incomingText[1], 10);

    // Display the final computed result to the console.
    console.log('%d', calculateValidFactorPairs(firstNumericArgument, secondNumericArgument));
}


/* !!! IMPORTANT: Do not modify the following line. It handles standard input/output and invokes the main processing function. */
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));