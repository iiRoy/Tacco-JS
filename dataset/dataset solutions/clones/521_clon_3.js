const eventStreamRawData = require('fs').readFileSync('/dev/stdin', 'utf8');

/**
 * Utility function to parse a space-separated string into an array of numbers.
 * @param {string} lineContent - The string line to be parsed.
 * @returns {number[]} An array of numerical values.
 */
const parseNumericSequence = (lineContent) => lineContent.split(" ").map(Number);

// Prepare the raw input by trimming extraneous whitespace and splitting it into individual event lines.
let processedInputLines = eventStreamRawData.trim().split("\n");

// Extract and process the very first line, which contains global configuration parameters.
const initialConfigurationLine = processedInputLines.shift();
if (!initialConfigurationLine) {
    // Implement a robust check for empty or invalid initial input, exiting if critical data is missing.
    console.error("Critical Error: No initial configuration line found in the input stream.");
    process.exit(1);
}
const initialConfigurationParameters = parseNumericSequence(initialConfigurationLine);

// Validate the expected number of initial parameters.
if (initialConfigurationParameters.length < 3) {
    console.error("Critical Error: Initial configuration parameters are incomplete. Expected at least 3 values.");
    process.exit(1);
}

// Destructure the initial parameters for improved readability.
// participantCount: Total number of entities/workers.
// _unusedParam: A parameter present in the input but not utilized in this specific logic.
// finalTimeMarker: A conceptual end-time or limit (used for final time accumulation).
const [participantCount, _unusedParam, finalTimeMarker] = initialConfigurationParameters;

// Initialize a collection of participant records. Each record is an object
// containing the participant's current score, accumulated time as the leader,
// and their original 1-based identifier.
let participantAccountData = [];
for (let entityIndex = 0; entityIndex < participantCount; entityIndex++) {
    participantAccountData.push({
        currentScoreValue: 0,
        totalLeadershipDuration: 0,
        originalIdentifier: entityIndex + 1 // Store 1-based ID for final output
    });
}

// Initialize an object to track the currently dominant participant (leader).
// It stores the 0-based index and the score of this leader.
let currentDominantEntity = {
    index: 0,
    score: 0
};

// Initialize the primary timeline marker for the simulation.
let globalSimulationClock = 0;

/**
 * Scans all participant records to identify the participant with the highest current score.
 * Implements a tie-breaking rule: if scores are equal, the participant with the smaller
 * 0-based index (which corresponds to a smaller original ID) is chosen as the leader.
 * @param {Array<Object>} allRecords - The array of participant record objects.
 * @returns {Object} An object containing the index and score of the newly identified leader.
 */
const reEvaluateLeadership = (allRecords) => {
    let topScoreEncountered = -Infinity; // Start with the lowest possible score.
    let leadingEntityIndex = -1;

    allRecords.forEach((participantInfo, currentIdx) => {
        if (participantInfo.currentScoreValue > topScoreEncountered) {
            topScoreEncountered = participantInfo.currentScoreValue;
            leadingEntityIndex = currentIdx;
        } else if (participantInfo.currentScoreValue === topScoreEncountered) {
            // Tie-breaking: if scores are equal, the participant with a lower index takes precedence.
            if (currentIdx < leadingEntityIndex) {
                leadingEntityIndex = currentIdx;
            }
        }
    });
    return { index: leadingEntityIndex, score: topScoreEncountered };
};

// Iterate through each event line to simulate the process.
processedInputLines.forEach((eventLogLine) => {
    const parsedEventDetails = parseNumericSequence(eventLogLine);

    // Add validation for individual event lines.
    if (parsedEventDetails.length < 3) {
        console.warn(`Warning: Skipping malformed event line: "${eventLogLine}". Expected 3 numeric values.`);
        return; // Skip this event and proceed to the next.
    }

    // Destructure the event details for better clarity.
    const affectedParticipantIdx = parsedEventDetails[0] - 1; // Convert to 0-based index.
    const eventTimestampPoint = parsedEventDetails[1];
    const scoreModifier = parsedEventDetails[2];

    // Validate the participant index referenced by the event.
    if (affectedParticipantIdx < 0 || affectedParticipantIdx >= participantCount) {
        console.warn(`Warning: Event at time ${eventTimestampPoint} references an invalid participant ID (${parsedEventDetails[0]}). Skipping this event.`);
        return;
    }

    // Calculate the duration since the last event and assign it to the then-current leader.
    const durationSincePreviousEvent = eventTimestampPoint - globalSimulationClock;

    // Guard against out-of-order events or negative time durations.
    if (durationSincePreviousEvent < 0) {
        console.warn(`Warning: Event at time ${eventTimestampPoint} occurred before the previous event at ${globalSimulationClock}. Time accumulation for this event might be inaccurate.`);
        // Continue processing the event, but flag the time issue.
    } else if (currentDominantEntity.index !== -1) {
        // Only accumulate time if a valid leader exists.
        participantAccountData[currentDominantEntity.index].totalLeadershipDuration += durationSincePreviousEvent;
    }


    // Update the simulation's current time to the timestamp of the current event.
    globalSimulationClock = eventTimestampPoint;

    // Apply the score change to the affected participant's record.
    participantAccountData[affectedParticipantIdx].currentScoreValue += scoreModifier;

    // --- Logic to re-evaluate the dominant participant after a score change ---

    if (scoreModifier > 0) {
        // If a participant's score increased, they might become the new leader.
        const candidateParticipantScore = participantAccountData[affectedParticipantIdx].currentScoreValue;
        const incumbentLeaderScore = currentDominantEntity.score;

        if (candidateParticipantScore > incumbentLeaderScore) {
            // A new participant has a strictly higher score, so they become the new leader.
            currentDominantEntity = { index: affectedParticipantIdx, score: candidateParticipantScore };
        } else if (candidateParticipantScore === incumbentLeaderScore) {
            // If scores are tied, apply the tie-breaking rule: prefer the participant with a smaller index.
            if (affectedParticipantIdx < currentDominantEntity.index) {
                currentDominantEntity = { index: affectedParticipantIdx, score: candidateParticipantScore };
            }
        }
    } else if (scoreModifier < 0) {
        // If a participant's score decreased, the current leader might have lost their position.
        // A full scan of all participants is required to find the new true leader.
        currentDominantEntity = reEvaluateLeadership(participantAccountData);
    }
    // If scoreModifier is 0, the leadership status is unchanged by this event, so no action is needed.
});

// After all events have been processed, there might be a final period of time
// during which the last determined leader was still dominant.
// This accounts for the time from the last event up to `finalTimeMarker`.
const remainingTimeSegment = finalTimeMarker - globalSimulationClock;

// If there's a positive remaining duration and a valid leader, attribute this time.
if (remainingTimeSegment > 0 && currentDominantEntity.index !== -1) {
    participantAccountData[currentDominantEntity.index].totalLeadershipDuration += remainingTimeSegment;
}

// Perform the final sorting of participant records to determine the ultimate winner.
// Primary sort key: descending by `totalLeadershipDuration` (longest time as leader wins).
// Secondary sort key (for ties): ascending by `originalIdentifier` (smaller ID wins).
participantAccountData.sort((recordOne, recordTwo) => {
    if (recordOne.totalLeadershipDuration === recordTwo.totalLeadershipDuration) {
        return recordOne.originalIdentifier - recordTwo.originalIdentifier;
    }
    return recordTwo.totalLeadershipDuration - recordOne.totalLeadershipDuration;
});

// Output the original 1-based identifier of the participant who accumulated
// the most time as the dominant leader.
console.log(participantAccountData[0].originalIdentifier);