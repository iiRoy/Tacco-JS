const rawInputContent = require('fs').readFileSync('/dev/stdin', 'utf8');
let processedInputLines = rawInputContent.trim().split("\n");
let currentLinePointer = 0;

// Utility function to parse a line of space-separated numbers
const extractNumericValues = (lineContent) => lineContent.split(/\s+/).map(Number);

// Main processing loop for multiple test cases
while (true) {
    // Read and parse the dimensions for the current case (N, M)
    const caseDimensions = extractNumericValues(processedInputLines[currentLinePointer]);
    currentLinePointer++; // Advance the input pointer

    let totalAttendees = caseDimensions[0];
    let totalIncidents = caseDimensions[1];

    // Termination condition for the input loop
    if (totalAttendees === 0 && totalIncidents === 0) {
        break;
    }

    // Guard clause: Basic validation for input dimensions
    if (totalAttendees < 0 || totalIncidents < 0) {
        // Skipping cases with invalid (negative) dimensions
        continue;
    }

    // Initialize the immunity status for all attendees.
    // 'true' means immune, 'false' means susceptible.
    // By default, everyone is susceptible, but the first attendee (index 0) is immune.
    let immunityTracker = Array.from({ length: totalAttendees }, () => false);
    if (totalAttendees > 0) { // Ensure there is at least one attendee
        immunityTracker[0] = true;
    }

    // Collect all incident records
    // Each record contains [eventTime, sourcePersonId (0-indexed), targetPersonId (0-indexed)]
    let eventTimeline = [];
    for (let eventIdx = 0; eventIdx < totalIncidents; eventIdx++) {
        const incidentDetails = extractNumericValues(processedInputLines[currentLinePointer]);
        currentLinePointer++; // Advance the input pointer

        const eventTime = incidentDetails[0];
        const sourcePersonId = incidentDetails[1] - 1; // Convert to 0-indexed
        const targetPersonId = incidentDetails[2] - 1; // Convert to 0-indexed

        // Guard clause: Validate person IDs are within bounds
        if (sourcePersonId < 0 || sourcePersonId >= totalAttendees ||
            targetPersonId < 0 || targetPersonId >= totalAttendees) {
            // Skipping incidents with invalid person IDs
            continue;
        }
        eventTimeline.push([eventTime, sourcePersonId, targetPersonId]);
    }

    // Sort the incidents chronologically by their event time
    eventTimeline.sort((incidentA, incidentB) => {
        const timeA = incidentA[0];
        const timeB = incidentB[0];
        if (timeA < timeB) return -1;
        if (timeA > timeB) return 1;
        return 0; // Maintain relative order if times are equal
    });

    // Process each incident to propagate immunity
    // If a source person is immune, any person they interact with also becomes immune.
    for (const currentIncident of eventTimeline) {
        const originatorId = currentIncident[1];
        const recipientId = currentIncident[2];

        // Check if the originator is currently immune
        if (immunityTracker[originatorId]) {
            // If the originator is immune, the recipient also gains immunity
            immunityTracker[recipientId] = true;
        }
    }

    // Count the total number of immune attendees after all incidents
    let immunePopulationCount = 0;
    for (const isCurrentlyImmune of immunityTracker) {
        if (isCurrentlyImmune) { // If the attendee's status is 'true' (immune)
            immunePopulationCount++;
        }
    }

    // Output the final count for the current test case
    console.log(immunePopulationCount);
}