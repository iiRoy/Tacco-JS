const parseVoteLine = (lineContent, lineNumber) => {
    // Remove leading/trailing whitespace and split the line by space.
    const voteTokens = lineContent.trim().split(" ");
    
    // Validate that exactly two numeric tokens are present in the line.
    if (voteTokens.length !== 2) {
        throw new Error(`Input format error on line ${lineNumber}: Expected two vote values, but found ${voteTokens.length}.`);
    }
    
    // Parse Takahashi's votes for this specific round.
    const takahashiVotes = parseInt(voteTokens[0], 10);
    // Parse Aoki's votes for this specific round.
    const aokiVotes = parseInt(voteTokens[1], 10);
    
    // Validate that the parsed values are indeed valid numbers.
    if (isNaN(takahashiVotes) || isNaN(aokiVotes)) {
        throw new Error(`Input data error on line ${lineNumber}: One or both vote values are not valid numbers.`);
    }

    // Assuming vote values are always positive integers based on typical problem constraints.
    // If zero or negative votes were possible, additional validation might be needed.
    if (takahashiVotes <= 0 || aokiVotes <= 0) {
        throw new Error(`Input data error on line ${lineNumber}: Vote values must be positive integers.`);
    }
    
    return { T: takahashiVotes, A: aokiVotes };
};

/**
 * Processes raw input data to determine the minimum cumulative votes for Takahashi and Aoki
 * that satisfy all round conditions.
 * @param {string} rawVoteDataString - The complete input string read from a source (e.g., standard input).
 */
function processVoteData(rawVoteDataString) {
    // Initialize the running total of votes for Takahashi and Aoki.
    // These will be updated to ensure they are multiples of each round's votes
    // and maintain a consistent ratio.
    let accumulatedTakahashiVotes = 0;
    let accumulatedAokiVotes = 0;

    // Perform an initial check for empty or malformed input.
    if (!rawVoteDataString || rawVoteDataString.trim().length === 0) {
        console.error("Processing aborted: No input data provided or input is empty.");
        return; 
    }

    // Split the input string into an array of individual lines.
    // .trim() ensures that any leading/trailing blank lines don't affect parsing.
    const inputLines = rawVoteDataString.trim().split("\n");

    // The very first line of the input specifies the total number of voting rounds.
    const numberOfVotingRounds = parseInt(inputLines[0], 10);

    // Validate the number of rounds. It must be a positive integer.
    if (isNaN(numberOfVotingRounds) || numberOfVotingRounds <= 0) {
        console.error(`Processing aborted: Invalid number of voting rounds "${inputLines[0]}". Expected a positive integer.`);
        return;
    }

    // Verify that the number of input lines matches the declared number of rounds plus the header line.
    if (inputLines.length < numberOfVotingRounds + 1) {
        console.error(`Processing aborted: Expected ${numberOfVotingRounds} vote lines, but only ${inputLines.length - 1} were found.`);
        return;
    }

    // Iterate through each voting round, starting from the second line (index 1)
    // up to the total number of rounds.
    for (let roundCounter = 1; roundCounter <= numberOfVotingRounds; roundCounter++) {
        let currentRoundVotes;
        try {
            // Use the helper function to safely parse the vote data for the current round.
            currentRoundVotes = parseVoteLine(inputLines[roundCounter], roundCounter + 1); 
        } catch (error) {
            console.error(`Processing aborted: ${error.message}`);
            return; // Terminate if parsing fails for any line.
        }
        
        const currentTakahashiVotes = currentRoundVotes.T;
        const currentAokiVotes = currentRoundVotes.A;

        // Core logic to update accumulated votes:
        // We need to find the smallest integer multiplier 'k' such that:
        // 1. k * currentTakahashiVotes >= accumulatedTakahashiVotes (current total is met or exceeded)
        // 2. k * currentAokiVotes >= accumulatedAokiVotes (current total is met or exceeded)
        // 3. k * currentTakahashiVotes / currentTakahashiVotes == k * currentAokiVotes / currentAokiVotes (maintaining ratio 'k')

        // If this is the first round (accumulated votes are 0) or if the current round's votes
        // are already greater than or equal to the current accumulated totals,
        // we can simply use the current round's votes as the new accumulated base.
        // This is an optimization as the required scaling factor 'k' would be 1 in these scenarios.
        if (accumulatedTakahashiVotes <= currentTakahashiVotes && accumulatedAokiVotes <= currentAokiVotes) {
            accumulatedTakahashiVotes = currentTakahashiVotes;
            accumulatedAokiVotes = currentAokiVotes;
        } else {
            // Calculate the minimum factor needed for Takahashi's votes to reach or exceed the current accumulated total.
            // (Assuming currentTakahashiVotes is always positive based on problem constraints).
            const takahashiFactor = accumulatedTakahashiVotes / currentTakahashiVotes;
            
            // Calculate the minimum factor needed for Aoki's votes to reach or exceed the current accumulated total.
            // (Assuming currentAokiVotes is always positive based on problem constraints).
            const aokiFactor = accumulatedAokiVotes / currentAokiVotes;
            
            // The overall required scaling factor is the ceiling of the maximum of these two individual factors.
            // Using Math.ceil ensures we get an integer multiplier that satisfies both conditions.
            const requiredScalingFactor = Math.ceil(Math.max(takahashiFactor, aokiFactor));
            
            // Update the accumulated votes by applying this calculated scaling factor.
            accumulatedTakahashiVotes = currentTakahashiVotes * requiredScalingFactor;
            accumulatedAokiVotes = currentAokiVotes * requiredScalingFactor;
        }
    }
    
    // After processing all rounds, output the sum of the final accumulated votes.
    console.log(accumulatedTakahashiVotes + accumulatedAokiVotes);
}

// This section handles reading input from standard input and invoking the main processing function.
// It uses Node.js's 'fs' module to synchronously read the entire content of '/dev/stdin' (standard input).
processVoteData(require("fs").readFileSync("/dev/stdin", "utf8"));