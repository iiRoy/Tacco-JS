let ProcessInput = function(rawInputData) {
    // This function processes raw string input to determine eligible participants based on height.
    // The input is expected to contain two lines of space-separated numerical data.

    // Prepare input by splitting into individual lines and removing any leading/trailing whitespace.
    const inputLines = rawInputData.trim().split('\n');

    // --- Input Validation and Parsing ---
    // Ensure we have at least two lines of input.
    if (inputLines.length < 2) {
        console.error("Error: Insufficient input lines provided. Expected at least two.");
        return; // Exit if input is malformed
    }

    // A utility function to safely convert a string to a number.
    const convertToNumber = (numStr) => {
        const parsed = Number(numStr);
        if (isNaN(parsed)) {
            console.warn(`Warning: Non-numeric value encountered: '${numStr}'. Treating as 0.`);
            return 0; // Default to 0 or handle error as appropriate
        }
        return parsed;
    };

    // Parse the first line to get participant count and height requirement.
    // Example: "5 170" -> [5, 170]
    const settingsTokens = inputLines[0].split(' ').map(convertToNumber);

    // Validate the number of tokens on the first line.
    if (settingsTokens.length < 2) {
        console.error("Error: First line malformed. Expected 'count threshold'.");
        return;
    }

    const totalParticipants = settingsTokens[0]; // Total number of individuals
    const minimumHeight = settingsTokens[1];    // Height threshold for eligibility

    // Parse the second line to get individual heights.
    // Example: "165 172 168 175 160" -> [165, 172, 168, 175, 160]
    const individualHeightStrings = inputLines[1].split(' ');
    const participantMeasurements = individualHeightStrings.map(convertToNumber);

    // --- Core Logic: Count Eligible Participants ---
    let qualifyingIndividualsCount = 0; // Initialize a counter for those meeting the criteria

    // Optional: Add a check for data consistency if needed
    if (participantMeasurements.length !== totalParticipants) {
        console.warn(`Warning: Expected ${totalParticipants} heights, but received ${participantMeasurements.length}. Proceeding with available data.`);
    }

    // Iterate through each participant's height to check against the minimum requirement.
    for (let currentIdx = 0; currentIdx < participantMeasurements.length; currentIdx++) {
        const individualHeight = participantMeasurements[currentIdx]; // Get the current participant's height

        // If the individual's height meets or exceeds the minimum, increment the counter.
        if (individualHeight >= minimumHeight) {
            qualifyingIndividualsCount++;
        }
    }

    // Output the final count of eligible participants.
    console.log(qualifyingIndividualsCount);
};

// The following section handles standard input/output operations.
// It should not be modified to ensure proper execution in the target environment.
// Reads all data from standard input and passes it to the processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));