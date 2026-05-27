// This function processes the input data to determine if a travel plan is feasible.
function processInput(rawData) {
    // Parse the raw string input into a 2D array of numbers.
    // Each line is split by newline, then each line by space, and finally converted to numbers.
    const parsedData = rawData.split("\n").map(lineStr => lineStr.split(" ").map(numStr => Number(numStr)));

    // The first element of the first line typically contains the number of entries,
    // though it's not explicitly used in the loop bounds here.
    const numEntries = parsedData[0][0];

    // Extract the actual travel information, skipping the first line which contains N.
    const travelLog = parsedData.slice(1);

    // Initialize current position and time.
    // These variables track the traveler's state.
    let currentTime = 0;
    let currentX = 0;
    let currentY = 0;

    // Flag to determine if the entire travel plan is possible.
    let isPossible = true;

    // Iterate through each planned travel entry.
    for (const entryDetails of travelLog) {
        // Destructure the current entry into target time and coordinates.
        const targetTime = entryDetails[0];
        const targetX = entryDetails[1];
        const targetY = entryDetails[2];

        // Calculate the absolute difference in X and Y coordinates.
        const deltaX = Math.abs(targetX - currentX);
        const deltaY = Math.abs(targetY - currentY);

        // Calculate the time difference required for this segment.
        const deltaTime = targetTime - currentTime;

        // The original code had a commented-out line, keeping it as a comment.
        // const totalDistance = Math.abs(targetX) + Math.abs(targetY);

        // Check two conditions for feasibility:
        // 1. The Manhattan distance (deltaX + deltaY) must be less than or equal to the available time (deltaTime).
        // 2. The parity (even/odd) of the target time must match the parity of the Manhattan distance.
        //    This ensures that the traveler can reach the destination at exactly the target time,
        //    as each step changes time by 1 and distance by 1.
        if (!((deltaX + deltaY <= deltaTime) && (targetTime % 2 === (deltaX + deltaY) % 2))) {
            isPossible = false; // If conditions are not met, the plan is impossible.
            // No need to break here, as the problem statement implies checking all points,
            // though breaking early would be an optimization. The original doesn't break.
        }

        // Update current position and time for the next iteration.
        currentTime = targetTime;
        currentX = targetX;
        currentY = targetY;
    }

    // Determine the final message based on the feasibility flag.
    const resultMessage = isPossible ? "Yes" : "No";

    // Output the result to the console.
    console.log(resultMessage);
}

// Read input from standard input and pass it to the processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
