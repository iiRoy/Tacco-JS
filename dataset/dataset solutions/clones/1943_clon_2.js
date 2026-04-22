// This utility function processes incoming numerical data to evaluate a specific condition.
function runEvaluation ( dataLines )
{
    // Extract the primary numeric component from the first position of the input array.
    var primaryValue   =   parseInt( dataLines[0], 10 );
    // Secure the initial divisor value from the second input element.
    var divisorOne     =   parseInt( dataLines[1], 10 );
    // Retrieve the secondary numeric component from the third position.
    var secondaryValue =   parseInt( dataLines[2], 10 );
    // Obtain the second divisor value from the fourth input element.
    var divisorTwo     =   parseInt( dataLines[3], 10 );

    // Compute the number of iterations required for the secondary process, rounding up to the nearest whole number.
    var targetIterations = Math.ceil( secondaryValue / divisorOne );
    // Calculate the number of iterations available from the primary resource, also rounding up.
    var sourceIterations = Math.ceil( primaryValue   / divisorTwo );

    // Display the outcome: 'Affirmative' if the target iterations are less than or equal to the source, 'Negative' otherwise.
    console.log( targetIterations <= sourceIterations ? 'Affirmative' : 'Negative' );
}

// Execute the evaluation function by feeding it parsed data from standard input.
runEvaluation( require("fs").readFileSync("/dev/stdin", "utf8").trim().split(/\n|\s/) );