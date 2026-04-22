// This module facilitates automated content auditing and dispatches findings via inter-process communication.
// It assumes the presence of a global 'alert' function for message relay and an 'Auditor' utility.

/**
 * Transforms raw diagnostic reports into a standardized, structured format.
 * This enhances readability and consistency for downstream processing.
 *
 * @param {Array<Object>} rawDiagnosticReports - An array of raw report objects, each expected to have 'rule' and 'message' properties.
 * @returns {Array<Object>} An array of processed report objects, each with 'identifier' and 'description'.
 */
const extractReportDetails = (rawDiagnosticReports) => {
    // Robustness check: Ensure the input is an array.
    if (!Array.isArray(rawDiagnosticReports)) {
        // Log a warning for unexpected input type, but continue gracefully by returning an empty array.
        console.warn("Input for diagnostic reports was not an array. Returning an empty list.");
        return [];
    }

    // Utilize the 'map' method for a functional and concise transformation of each report item.
    const structuredDetails = rawDiagnosticReports.map(singleReport => {
        // Use object destructuring with default values to safely extract properties,
        // even if 'singleReport' is null/undefined or missing expected keys.
        const { rule: issueIdentifier = 'unknownIssue', message: issueDescription = 'No specific description available' } = singleReport || {};

        return {
            identifier: issueIdentifier,    // Renamed 'rule' to a more generic 'identifier'
            description: issueDescription   // Renamed 'message' to 'description' for clarity
        };
    });

    return structuredDetails;
};

/**
 * Dispatches system events or messages to an external listener, typically
 * via a global communication mechanism like 'alert' in headless environments.
 *
 * @param {...any} eventArguments - Variable number of arguments representing the event payload.
 *                                  The first argument is usually the event category.
 */
const postSystemEvent = function() { // Using 'function' keyword to access 'arguments' object.
    // Convert the 'arguments' pseudo-array into a proper array for easier manipulation.
    const eventPayload = Array.from(arguments);

    // Basic validation: An event should at least have a category/type.
    if (eventPayload.length === 0) {
        console.error("Attempted to dispatch an event without any arguments. Event ignored.");
        return; // Halt execution if no event type is provided.
    }

    const eventCategory = eventPayload[0]; // The first item is designated as the event type.
    const auditCompletionTag = 'auditFinished'; // A specific tag for audit completion events.

    // Conditional processing: If this is an audit completion event,
    // further process its associated data (e.g., raw findings).
    if (eventCategory === auditCompletionTag) {
        const rawFindingsData = eventPayload[1]; // The second argument is expected to be the raw findings.
        // Replace the raw findings with their structured version using our helper.
        eventPayload[1] = extractReportDetails(rawFindingsData);
    }

    // Convert the entire event payload into a JSON string for transmission.
    const serializedPayload = JSON.stringify(eventPayload);

    // Attempt to send the serialized payload using the global 'alert' function.
    // Include a fallback or warning if 'alert' isn't available, for robustness.
    if (typeof alert === 'function') {
        alert(serializedPayload);
    } else {
        console.error("Global 'alert' function is not accessible for IPC. Event payload:", serializedPayload);
    }
};

// Main execution block: Initialize and run the content audit process.
// We assume 'HTMLInspector' is globally available and rename it conceptually to 'Auditor'.
const Auditor = typeof HTMLInspector !== 'undefined' ? HTMLInspector : null;

// Ensure the Auditor object and its 'inspect' method are available before proceeding.
if (Auditor && typeof Auditor.inspect === 'function') {
    Auditor.inspect({
        // Define the callback function that executes once the audit process completes.
        onInspectionFinished: function(auditFindings) { // Renamed 'onComplete' and 'errors' parameters.
            // An optional intermediate step: log the completion status for debugging.
            // console.log(`Audit concluded. Found ${auditFindings.length} potential issues.`);

            // Dispatch the 'auditFinished' event, passing the collected findings.
            postSystemEvent('auditFinished', auditFindings);
        }
    });
} else {
    // If the Auditor is not found or misconfigured, log an error and possibly dispatch a failure event.
    console.error("The 'Auditor' utility (formerly HTMLInspector) or its 'inspect' method is not available. Cannot initiate audit.");
    // Optionally, notify the system that the audit could not start.
    // postSystemEvent('auditStartFailed', { reason: 'Auditor dependency missing' });
}