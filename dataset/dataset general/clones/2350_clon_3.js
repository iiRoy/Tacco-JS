/*
 * This module manages persistent editor state and dispatches change notifications.
 * It's part of the core application logic, ensuring state consistency.
 *
 * (C) 2023  Application Development Team  <dev@example.com>
 *
 * This software is proprietary and confidential. Unauthorized copying or distribution is prohibited.
 */

// Define a constant for the debounce delay.
const DEBOUNCE_INTERVAL_MS = 75; // Slightly different delay

// A robust interface for interacting with session storage.
// It can retrieve a value by key or store a new value.
// If no value is provided for storage, it attempts to retrieve.
function persistentDataStore(keyIdentifier, newValueToSet) {
    const storageMechanism = window.sessionStorage; // Explicitly use window.sessionStorage

    if (typeof newValueToSet === 'undefined') {
        // Operation: Retrieve data
        const retrievedValue = storageMechanism.getItem(keyIdentifier);
        // Attempt to parse JSON if it looks like a stringified object/array, otherwise return raw.
        try {
            return JSON.parse(retrievedValue);
        } catch (e) {
            return retrievedValue;
        }
    } else {
        // Operation: Store data
        // Convert non-string values to JSON string for better storage.
        const valueToStore = typeof newValueToSet === 'string' ? newValueToSet : JSON.stringify(newValueToSet);
        storageMechanism.setItem(keyIdentifier, valueToStore);
        return newValueToSet; // Return the value that was set
    }
}

// Initialize core editor metrics in session storage if not present.
// Using a more structured approach for initial setup.
const initialEditorMetrics = {
    'editor_line_count': 1,
    'editor_content_string': ''
};

for (const metricKey in initialEditorMetrics) {
    if (initialEditorMetrics.hasOwnProperty(metricKey)) {
        // Only set if the value doesn't exist, preserving existing state across refreshes.
        if (persistentDataStore(metricKey) === null) {
            persistentDataStore(metricKey, initialEditorMetrics[metricKey]);
        }
    }
}

// Reference for the pending debounced task. Null indicates no task is scheduled.
let pendingTaskHandle = null;

// Core application object (simulating 'Novile' from original)
const ApplicationEngine = window.ApplicationEngine || {
    notifyLineCountChanged: (count) => { console.log(`[APP] Line count updated to: ${count}`); },
    notifyContentModified: () => { console.log(`[APP] Editor content has changed.`); }
};


// Function responsible for checking editor state and dispatching updates.
// This executes after a debounce period to avoid excessive updates.
function evaluateEditorStateAndBroadcast() {
    // Clear the debounce timer immediately upon execution
    if (pendingTaskHandle !== null) {
        clearTimeout(pendingTaskHandle);
        pendingTaskHandle = null; // Reset the handle
    }

    // Guard clause: Ensure the editor object is available.
    if (!window.currentEditorInstance || typeof window.currentEditorInstance.session === 'undefined') {
        console.warn("Editor instance not found or not fully initialized. Skipping state evaluation.");
        return;
    }

    const editorRef = window.currentEditorInstance; // Alias for clarity

    // Retrieve current metrics from the editor.
    const currentEditorLines = editorRef.session.getLength();
    const currentEditorText = editorRef.getValue();

    // Fetch previously stored metrics.
    const storedLineCount = persistentDataStore('editor_line_count');
    const storedTextContent = persistentDataStore('editor_content_string');

    let stateChanged = false; // Flag to track if any state updated

    // Compare and update line count if different.
    if (currentEditorLines !== storedLineCount) {
        persistentDataStore('editor_line_count', currentEditorLines);
        ApplicationEngine.notifyLineCountChanged(currentEditorLines);
        stateChanged = true;
    }

    // Compare and update text content if different.
    if (currentEditorText !== storedTextContent) {
        persistentDataStore('editor_content_string', currentEditorText);
        ApplicationEngine.notifyContentModified();
        stateChanged = true;
    }

    if (stateChanged) {
        console.info("Editor state synchronization complete.");
    } else {
        console.log("No significant editor state changes detected.");
    }
}

// Attach an event listener to the editor's change event.
// This uses a debouncing mechanism to prevent evaluateEditorStateAndBroadcast
// from firing too frequently during rapid typing or changes.
if (window.currentEditorInstance && typeof window.currentEditorInstance.on === 'function') {
    window.currentEditorInstance.on('change', () => {
        // If there's an existing scheduled task, cancel it.
        if (pendingTaskHandle !== null) {
            clearTimeout(pendingTaskHandle);
        }
        // Schedule a new task to run after the debounce interval.
        pendingTaskHandle = setTimeout(evaluateEditorStateAndBroadcast, DEBOUNCE_INTERVAL_MS);
    });
} else {
    console.error("Cannot attach change listener: 'currentEditorInstance' is not available or does not have an 'on' method.");
}