const fileSystemModule = require('fs'); // Renamed 'fs' to 'fileSystemModule' for clarity

// --- Section 1: Data Acquisition and Initial Parsing ---

/**
 * Reads raw input data from the standard input stream.
 * @type {string}
 */
const rawInputContent = fileSystemModule.readFileSync('/dev/stdin', 'utf8');

// Safeguard against empty or invalid input.
if (!rawInputContent || rawInputContent.trim().length === 0) {
    // In a production system, more robust error handling or default values might be used.
    // For competitive programming, this might indicate an issue with the test environment.
    console.error("Input data is empty or malformed. Exiting.");
    process.exit(1);
}

/**
 * Splits the raw input into an array of individual event lines, after trimming whitespace.
 * @type {string[]}
 */
let eventDescriptionLines = rawInputContent.trim().split('\n');

// --- Section 2: Extracting Core Simulation Parameters ---

/**
 * Parses the first line of the input, which contains global simulation parameters.
 * Assumed format: "PARTICIPANT_COUNT <UNUSED_VALUE> FINAL_TIMESTAMP".
 * @type {number[]}
 */
const initialConfigurationValues = eventDescriptionLines.shift().split(' ').map(Number);

/**
 * The total number of participants in the simulation.
 * @type {number}
 */
const totalParticipantCount = initialConfigurationValues[0];

/**
 * The timestamp at which the simulation officially concludes.
 * @type {number}
 */
const simulationEndTime = initialConfigurationValues[2];

// Validate critical parameters to ensure they are within expected ranges.
if (isNaN(totalParticipantCount) || totalParticipantCount <= 0 ||
    isNaN(simulationEndTime) || simulationEndTime < 0) {
    console.error("Invalid initial simulation parameters (participant count or end time). Exiting.");
    process.exit(1);
}

// --- Section 3: Initialization of Simulation State ---

/**
 * Represents the state and statistics for each participant.
 * Each object contains:
 * - `id`: The original 0-based index of the participant.
 * - `score`: The participant's current score.
 * - `leadDuration`: The cumulative time this participant has held the top score.
 * @type {Array<{id: number, score: number, leadDuration: number}>}
 */
const participantTrackingData = Array.from({ length: totalParticipantCount }, (_, index) => ({
    id: index,
    score: 0,
    leadDuration: 0
}));

/**
 * Tracks the current leader in the simulation.
 * Contains:
 * - `leaderId`: The 0-based index of the participant currently holding the highest score.
 * - `topScore`: The highest score achieved by the current leader.
 * Initialized assuming participant 0 is the leader with 0 score.
 * @type {{leaderId: number, topScore: number}}
 */
let currentDominantPlayer = {
    leaderId: 0,
    topScore: 0
};

/**
 * The current timestamp within the simulation. Advances with each processed event.
 * @type {number}
 */
let currentMomentInTime = 0;

/**
 * Helper function to re-evaluate and determine the current leader among all participants.
 * This is crucial when the existing leader's score decreases or upon initialization.
 * @param {Array<{id: number, score: number, leadDuration: number}>} participantDataArray - Array of all participant statistics.
 * @returns {{leaderId: number, topScore: number}} The new leader's ID and their score.
 */
const recalculateCurrentLeader = (participantDataArray) => {
    let highestObservedScore = -1; // Assuming scores are non-negative.
    let leadingParticipantIdentifier = -1; // Initialize with an invalid ID.

    for (let participantIdx = 0; participantIdx < participantDataArray.length; participantIdx++) {
        const participantRecord = participantDataArray[participantIdx];

        // If a new highest score is found, update the leader.
        if (participantRecord.score > highestObservedScore) {
            highestObservedScore = participantRecord.score;
            leadingParticipantIdentifier = participantRecord.id;
        }
        // Tie-breaking rule: if scores are equal, the participant with the smaller original ID wins.
        else if (participantRecord.score === highestObservedScore && participantRecord.id < leadingParticipantIdentifier) {
            leadingParticipantIdentifier = participantRecord.id;
        }
    }
    return { leaderId: leadingParticipantIdentifier, topScore: highestObservedScore };
};

// --- Section 4: Final Event Injection for Accurate Duration Calculation ---

// Appends a synthetic event to ensure that the duration of the final leader
// is correctly accounted for up to the `simulationEndTime`.
// This event involves participant 1 (0-indexed: 0), occurs at `simulationEndTime`,
// and has a score change of 0, effectively just marking the end of the timeline.
eventDescriptionLines.push(`1 ${simulationEndTime} 0`);

// --- Section 5: Event Processing Loop ---

// Iterates through each event line to update participant scores and track lead durations.
for (let eventIterator = 0; eventIterator < eventDescriptionLines.length; eventIterator++) {
    const eventString = eventDescriptionLines[eventIterator];

    // Parse event details: participant ID (1-based), event timestamp, and score change.
    const parsedEventValues = eventString.split(' ').map(Number);

    const participantIdOneBased = parsedEventValues[0];
    const eventTimestamp = parsedEventValues[1];
    const scoreChangeDelta = parsedEventValues[2];

    // Convert 1-based participant ID to a 0-based index for array access.
    const affectedParticipantIndex = participantIdOneBased - 1;

    // Basic validation for the current event. Skip if invalid.
    if (isNaN(affectedParticipantIndex) || affectedParticipantIndex < 0 || affectedParticipantIndex >= totalParticipantCount ||
        isNaN(eventTimestamp) || eventTimestamp < currentMomentInTime || isNaN(scoreChangeDelta)) {
        console.warn(`Skipping malformed or out-of-order event at line ${eventIterator + 2}: "${eventString}"`);
        continue;
    }

    // --- Update the lead duration for the PREVIOUS leader ---
    // The time elapsed since the last event (or simulation start) is added
    // to the total lead duration of the participant who was leading during that interval.
    if (currentDominantPlayer.leaderId !== -1) { // Ensure a valid leader existed.
        participantTrackingData[currentDominantPlayer.leaderId].leadDuration += (eventTimestamp - currentMomentInTime);
    }

    // Advance the simulation time to the current event's timestamp.
    currentMomentInTime = eventTimestamp;

    // Apply the score change to the affected participant.
    participantTrackingData[affectedParticipantIndex].score += scoreChangeDelta;

    const newScoreOfAffectedParticipant = participantTrackingData[affectedParticipantIndex].score;

    // --- Re-evaluate the leadership status ---
    // This logic determines if the leader changes after the current event.
    if (scoreChangeDelta > 0) {
        // If the participant's score increased:
        // A new leader emerges if their new score is strictly higher than the current top score,
        // OR if scores are tied, but this participant has a smaller ID (tie-breaker).
        if (newScoreOfAffectedParticipant > currentDominantPlayer.topScore ||
            (newScoreOfAffectedParticipant === currentDominantPlayer.topScore && affectedParticipantIndex < currentDominantPlayer.leaderId)) {
            currentDominantPlayer = {
                leaderId: affectedParticipantIndex,
                topScore: newScoreOfAffectedParticipant
            };
        }
    } else if (scoreChangeDelta < 0 && currentDominantPlayer.leaderId === affectedParticipantIndex) {
        // If the participant's score decreased AND they were the current leader:
        // A full re-scan is necessary to find the new leader, as the previous leader's position is now contested.
        currentDominantPlayer = recalculateCurrentLeader(participantTrackingData);
    }
    // If scoreChangeDelta is 0, or if score decreased but the affected participant was not the leader,
    // the leadership status remains unchanged (as a decrease cannot make a non-leader a leader).
}

// --- Section 6: Final Winner Determination ---

let maximumLeadDurationFound = -1; // Durations are non-negative.
let winningParticipantIdentifier = -1; // Initialize with an invalid ID.

// Iterate through all participants to find the one with the longest cumulative lead duration.
for (let participantIterator = 0; participantIterator < participantTrackingData.length; participantIterator++) {
    const individualParticipantRecord = participantTrackingData[participantIterator];

    // If a new maximum lead duration is found, update the winner.
    if (individualParticipantRecord.leadDuration > maximumLeadDurationFound) {
        maximumLeadDurationFound = individualParticipantRecord.leadDuration;
        winningParticipantIdentifier = individualParticipantRecord.id;
    }
    // Tie-breaking rule for the final winner: if lead durations are equal,
    // the participant with the smaller original ID wins.
    else if (individualParticipantRecord.leadDuration === maximumLeadDurationFound &&
             individualParticipantRecord.id < winningParticipantIdentifier) {
        winningParticipantIdentifier = individualParticipantRecord.id;
    }
}

// --- Section 7: Outputting the Result ---

// Output the 1-based index of the participant who accumulated the most lead duration.
console.log(winningParticipantIdentifier + 1);