// This dedicated Web Worker script is responsible for dynamically generating
// HTML content based on a structured dataset received from the main thread.
// It processes a list of social connections and formats them into an unordered list.

self.addEventListener('message', (incomingTransmission) => {
    let rawPayloadSegment = incomingTransmission.data;
    let decodedManifest; // Will hold the parsed JavaScript object.

    // Implement robust error handling for JSON parsing.
    try {
        decodedManifest = JSON.parse(rawPayloadSegment);
    } catch (parsingErr) {
        // If data cannot be parsed, inform the main thread and halt processing.
        self.postMessage(`{"status": "error", "message": "Corrupted data received: ${parsingErr.message}"}`);
        // Terminate the worker as the input was invalid and further processing is impossible.
        self.close();
        return;
    }

    // Validate the essential structure of the decoded manifest.
    // Ensure the 'connections' array exists and is indeed an array.
    if (!decodedManifest || !Array.isArray(decodedManifest.connections)) {
        self.postMessage(`{"status": "error", "message": "Invalid manifest structure. Expected an array 'connections'."}`);
        self.close();
        return;
    }

    const socialConnectionsList = decodedManifest.connections;
    const htmlSnippetCollection = []; // An array to accumulate HTML fragments.

    // Iterate through each individual connection record.
    for (const connectionEntry of socialConnectionsList) {
        // Extract relevant details, providing fallback defaults for robustness.
        const primaryIdentifier = connectionEntry.handle || 'Anonymous User';
        const geographicalReference = connectionEntry.location || 'Undisclosed Location';
        const recordId = connectionEntry.id || `temp-${Math.random().toString(36).substring(2, 11)}`; // Added a new property 'id' or generate one.

        // Construct a single list item's HTML using modern template literals.
        // This includes updated class names and element structure.
        const singleItemMarkup = `
            <li data-record-id="${recordId}" class="connection-item">
                <div class="connection-details">
                    <span class="connection-handle">${primaryIdentifier}</span>
                    <span class="connection-location">${geographicalReference}</span>
                </div>
            </li>
        `;
        htmlSnippetCollection.push(singleItemMarkup);
    }

    // Join all generated HTML snippets into a single, cohesive string.
    // Wrap the entire collection in an outer container for better semantic grouping.
    const finalRenderedHtml = `<ul class="social-feed-container">\n${htmlSnippetCollection.join('\n')}\n</ul>`;

    // Dispatch the completed HTML string back to the main thread.
    self.postMessage(finalRenderedHtml);

    // Based on an optional instruction in the payload, decide whether to terminate this worker instance.
    if (decodedManifest.shouldWorkerTerminate === true) {
        self.close();
    }
});