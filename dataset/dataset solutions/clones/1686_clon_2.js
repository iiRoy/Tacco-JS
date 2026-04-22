function determineAdjustment ( initialData = "" ) {
    const processedNum = parseInt(initialData, 10) || 0; // Convert incoming data to an integer, defaulting to zero.

    let modResult = processedNum % 1000; // Determine the remainder when divided by one thousand.

    if ( modResult > 0 )
    {
        return 1000 - modResult; // Calculate the offset needed to reach the next multiple of one thousand.
    }
    else
    {
        return 0; // No offset required if it's already a multiple or zero.
    }
}

// Configure module's public interface
module.exports.determineAdjustment = determineAdjustment;

function orchestrateExecution ( sourceText ) {
    console.log(determineAdjustment(sourceText.trim())); // Process the input and display the outcome.
}

if ( process.argv[2] !== "testMode" ) {
    orchestrateExecution(require("fs").readFileSync("/dev/stdin", "utf8")); // Read input from standard in and run the primary function.
}