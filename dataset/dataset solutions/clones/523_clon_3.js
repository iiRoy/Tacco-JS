const fileSystem = require('fs');

// Read raw input data from standard input.
// This data typically contains configuration parameters and a list of events.
const rawInputData = fileSystem.readFileSync('/dev/stdin', 'utf8');

// Trim any leading/trailing whitespace and split the input into an array of lines.
// Each line represents either initial configuration or a specific event.
const inputEventLines = rawInputData.trim().split('\n');

// The very first line of input provides general configuration parameters.
// Extract this line and parse its numerical components.
const initialConfigurationString = inputEventLines.shift();
const parsedConfigurationValues = initialConfigurationString.split(' ').map(Number);

// Extract key parameters from the configuration:
// 'numberOfParticipants' (N) - the total number of items/participants.
// 'eventTimeHorizon' (L) - a time limit, used for the sentinel event.
const numberOfParticipants = parsedConfigurationValues[0];
const eventTimeHorizon = parsedConfigurationValues[2]; // 'L' in original code, value is used in sentinel event

// Initialize an array to store detailed performance statistics for each participant.
// Each participant's record is an object for improved clarity and maintainability,
// tracking their current score, the total time they've spent as the leader,
// and their original 0-based index for tie-breaking and final output.
const participantPerformanceRecords = [];
for (let participantIndex = 0; participantIndex < numberOfParticipants; participantIndex++) {
    participantPerformanceRecords.push({
        currentScore: 0,           // The participant's current accumulated score.
        totalTimeAtPeak: 0,        // Accumulated time this participant was the sole or tie-breaking leader.
        initialRankIdentifier: participantIndex // Original 0-based index.
    });
}

// Initialize state variables for tracking the current leader and the simulation time.
// 'currentActiveLeader' stores the index and score of the participant currently holding the top score.
// 'currentSimulationTimestamp' tracks the time point of the last processed event.
let currentActiveLeader = {
    identifier: 0, // Index of the participant currently leading (0-based).
    scoreValue: 0  // The score of the participant currently leading.
};
let currentSimulationTimestamp = 0; // Tracks the elapsed time in the simulation.

// --- Helper Function for Recalculating Leader ---

/**
 * Recalculates the current leader from the entire set of participant records.
 * This is necessary when the current leader's score decreases, invalidating their leadership.
 * Tie-breaking rule: if multiple participants have the same highest score, the one
 * with the smallest original index (identifier) is chosen.
 * @param {Array<Object>} records - The array of participant performance records.
 * @returns {{identifier: number, scoreValue: number}} An object representing the new leader.
 */
const reEvaluateLeadership = (records) => {
    // Handle edge case of no participants.
    if (records.length === 0) {
        return { identifier: -1, scoreValue: -1 };
    }

    // Initialize with the first participant's data.
    let highestScoreObserved = records[0].currentScore;
    let newLeaderIdentifier = records[0].initialRankIdentifier; // Or 0

    // Iterate through all participants to find the one with the highest score.
    for (let currentParticipantIdx = 1; currentParticipantIdx < records.length; currentParticipantIdx++) {
        const participant = records[currentParticipantIdx];
        if (participant.currentScore > highestScoreObserved) {
            // Found a participant with a strictly higher score.
            highestScoreObserved = participant.currentScore;
            newLeaderIdentifier = currentParticipantIdx;
        } else if (participant.currentScore === highestScoreObserved) {
            // If scores are equal, apply the tie-breaking rule: smaller index wins.
            if (currentParticipantIdx < newLeaderIdentifier) {
                newLeaderIdentifier = currentParticipantIdx;
            }
        }
    }
    return { identifier: newLeaderIdentifier, scoreValue: highestScoreObserved };
};

// --- Event Processing Setup ---

// Add a final "sentinel" event to the end of the event list.
// This ensures that the time accumulated by the last active leader, up to the 'eventTimeHorizon' (L),
// is correctly accounted for. The original code uses item 1 (index 0), time 'L', and score change 0.
const closingEventDetails = [1, eventTimeHorizon, 0].join(' ');
inputEventLines.push(closingEventDetails);

// --- Main Event Loop for Processing All Events ---

// Iterate through each event line to update participant scores and leadership status.
for (let eventCounter = 0; eventCounter < inputEventLines.length; eventCounter++) {
    const currentEventString = inputEventLines[eventCounter];

    // Parse the current event string into its numerical components.
    const eventDataTokens = currentEventString.split(' ').map(Number);

    // Extract event details: target participant index, event timestamp, and score modification.
    const affectedParticipantIndex = eventDataTokens[0] - 1; // Convert to 0-based index.
    const eventTimePoint = eventDataTokens[1];
    const scoreModificationAmount = eventDataTokens[2];

    // Optional: Basic input validation for participant index to ensure robustness (Type III addition).
    if (affectedParticipantIndex < 0 || affectedParticipantIndex >= numberOfParticipants) {
        // In a real application, one might log an error or skip the event.
        // For this problem, we proceed assuming valid input indices.
    }

    // Calculate the duration since the last event.
    const durationSinceLastEvent = eventTimePoint - currentSimulationTimestamp;

    // If time has genuinely passed, accumulate this duration to the 'totalTimeAtPeak'
    // of the participant who was the leader during this interval.
    if (durationSinceLastEvent > 0) {
        participantPerformanceRecords[currentActiveLeader.identifier].totalTimeAtPeak += durationSinceLastEvent;
    }

    // Update the global simulation timestamp to the current event's time.
    currentSimulationTimestamp = eventTimePoint;

    // Apply the score change to the affected participant's record.
    participantPerformanceRecords[affectedParticipantIndex].currentScore += scoreModificationAmount;

    // --- Logic to Update Current Leadership Status ---

    if (scoreModificationAmount > 0) {
        // If a participant's score increased:
        const candidateLeaderScore = participantPerformanceRecords[affectedParticipantIndex].currentScore;

        if (candidateLeaderScore > currentActiveLeader.scoreValue) {
            // This participant now has a strictly higher score, becoming the new leader.
            currentActiveLeader = {
                identifier: affectedParticipantIndex,
                scoreValue: candidateLeaderScore
            };
        } else if (candidateLeaderScore === currentActiveLeader.scoreValue) {
            // If scores are equal, apply tie-breaking: the participant with the smaller index wins.
            if (affectedParticipantIndex < currentActiveLeader.identifier) {
                currentActiveLeader = {
                    identifier: affectedParticipantIndex,
                    scoreValue: candidateLeaderScore
                };
            }
        }
    } else if (scoreModificationAmount < 0) {
        // If a participant's score decreased:
        // Only re-evaluate leadership if the affected participant was the current leader.
        // A non-leader decreasing their score doesn't change the current leader unless they were tied.
        // The original logic specifically re-scans only if the leader's score drops.
        if (affectedParticipantIndex === currentActiveLeader.identifier) {
            currentActiveLeader = reEvaluateLeadership(participantPerformanceRecords);
        }
    }
    // If scoreModificationAmount is 0, no change in score, so no change in leadership.
}

// --- Final Sorting and Output ---

// Sort the participant performance records to determine the ultimate winner.
// The primary sorting criterion is 'totalTimeAtPeak' in descending order (more time at peak is better).
// The secondary sorting criterion (for ties in 'totalTimeAtPeak') is 'initialRankIdentifier' in ascending order (smaller index wins).
participantPerformanceRecords.sort((recordA, recordB) => {
    // Primary sort: by total time spent at peak (descending).
    if (recordA.totalTimeAtPeak === recordB.totalTimeAtPeak) {
        // Secondary sort: if times are equal, sort by original identifier (ascending).
        return recordA.initialRankIdentifier - recordB.initialRankIdentifier;
    }
    // Otherwise, sort by total time at peak in descending order.
    return recordB.totalTimeAtPeak - recordA.totalTimeAtPeak;
});

// The participant at the first position in the sorted array is the overall winner.
// Output their original 1-based index (as per problem requirements).
const winningParticipantOriginalIndex = participantPerformanceRecords[0].initialRankIdentifier;
console.log(winningParticipantOriginalIndex + 1);