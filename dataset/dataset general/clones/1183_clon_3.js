/**
 * Module: Application Runtime Environment Setup
 *
 * This script is responsible for initializing the application's core environment.
 * It performs critical checks related to the execution context, such as
 * browser type, protocol, and specific environment flags (e.g., Framer Studio),
 * to determine the appropriate bootstrapping method.
 *
 * Key functionalities include:
 * - Detecting and bypassing execution within the Framer Studio IDE.
 * - Identifying potential security restrictions in Chrome when loading local files.
 * - Dynamically injecting the main application script (`app.coffee`) when conditions are met.
 */

/**
 * Displays a non-intrusive warning message to the user concerning
 * browser security restrictions, particularly for local file access.
 * This typically targets Chrome's limitations.
 */
function displayLocalFileWarning() {
    // Define unique identifier for the warning banner to prevent duplicates.
    const warningIdentifier = "app-security-warning-banner";

    // Guard clause: If a warning element with this ID already exists,
    // we assume it's already been displayed and prevent re-creation.
    if (document.getElementById(warningIdentifier)) {
        console.debug("Application security warning already present. Skipping new banner creation.");
        return;
    }

    // Prepare the message content using template literals for clarity.
    const primaryMessage = `Heads up! Your current browser (likely Chrome) enforces security policies `;
    const secondaryMessage = `that may restrict direct loading of local files. `;
    const resolutionSuggestion = `Consider using Safari or running this project on a small web server. `;
    const learnMoreLink = `https://github.com/koenbok/Framer/wiki/LocalLoading`;
    const linkText = `Find more details here`;

    // Construct the HTML content for the message.
    const messageHtmlContent = `
        <p>
            ${primaryMessage}
            ${secondaryMessage}
            ${resolutionSuggestion}
            <a href="${learnMoreLink}" target="_blank" rel="noopener noreferrer">${linkText}</a>.
        </p>
    `;

    // Create the main container for the warning. Using 'aside' for semantic meaning.
    const warningContainerElement = document.createElement("aside");
    warningContainerElement.id = warningIdentifier;
    // Assign multiple CSS classes for styling.
    warningContainerElement.className = "application-alert-message user-notification-critical";
    warningContainerElement.innerHTML = messageHtmlContent;

    // Helper function to insert the warning into the DOM.
    // This ensures `document.body` is available before attempting insertion.
    const insertWarningIntoDocument = () => {
        if (document.body) {
            // Prepend the warning to the body to ensure it's visible at the top.
            document.body.prepend(warningContainerElement);
            console.info("Security warning banner has been successfully appended to the document body.");
        } else {
            console.error("Document body was not available to append the security warning.");
        }
    };

    // Check if the DOM is already ready. If not, wait for it.
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", insertWarningIntoDocument, { once: true });
    } else {
        // If DOM is already interactive or complete, insert immediately.
        insertWarningIntoDocument();
    }
}

/**
 * Dynamically injects the main application script (`app.coffee`) into the document's head.
 * This is typically used when the environment is deemed safe for direct script loading.
 */
function injectApplicationCoreScript() {
    // Define the path and type for the application script.
    const coreScriptPath = "app.coffee";
    const coreScriptType = "text/coffeescript";

    // Guard clause: Check if a script with the same source and type is already present.
    const existingScriptElement = document.querySelector(`script[src="${coreScriptPath}"][type="${coreScriptType}"]`);
    if (existingScriptElement) {
        console.debug(`Application core script "${coreScriptPath}" is already loaded. Skipping re-injection.`);
        return;
    }

    // Create a new script element.
    const newScriptElement = document.createElement("script");

    // Set attributes directly as properties for efficiency.
    newScriptElement.src = coreScriptPath;
    newScriptElement.type = coreScriptType;
    newScriptElement.async = true; // Add 'async' attribute for non-blocking loading.

    // Attach event listeners to monitor script loading status.
    newScriptElement.onload = (loadEvent) => {
        console.log(`Application core script "${coreScriptPath}" loaded successfully.`, loadEvent);
    };
    newScriptElement.onerror = (errorEvent) => {
        console.error(`Failed to load application core script "${coreScriptPath}".`, errorEvent);
    };

    // Append the script element to the document's head.
    document.head.appendChild(newScriptElement);
    console.info(`Attempting to inject application core script: "${coreScriptPath}" into document head.`);
}

/**
 * Main entry point for the application's initial setup and environment checks.
 * This function orchestrates the loading process based on the detected environment.
 */
function performInitialEnvironmentChecks() {
    // Start a console group for better organization of initialization logs.
    console.groupCollapsed("Application Bootstrapping: Environment Checks");

    // Retrieve the user agent string, providing a fallback for robustness.
    const userAgentInfo = navigator.userAgent || "";
    // Determine if the execution is within the Framer Studio environment.
    const isRunningInFramerStudio = userAgentInfo.includes("FramerStudio");

    // --- Environment Specific Guard ---
    if (isRunningInFramerStudio) {
        console.warn("Framer Studio environment detected. Application bootstrapping halted.");
        console.groupEnd(); // End the console group before returning.
        return; // Exit early as per original logic.
    }
    console.log("Framer Studio environment not detected. Proceeding with browser and protocol checks.");

    // Retrieve current location protocol.
    const currentDocumentProtocol = window.location.protocol;
    // Check if the protocol indicates a local file system.
    const isLocalFileSystemProtocol = currentDocumentProtocol === "file:";

    // Check for Chrome browser: `window.chrome` object exists and is not null/undefined.
    const isChromeBrowserDetected = (typeof window.chrome !== "undefined" && window.chrome !== null);

    // Log the detected environment characteristics for debugging.
    console.log(`Detected Protocol: '${currentDocumentProtocol}' (Is Local File System: ${isLocalFileSystemProtocol})`);
    console.log(`Detected Browser: ${isChromeBrowserDetected ? "Chrome" : "Other"} (Is Chrome: ${isChromeBrowserDetected})`);

    // --- Conditional Logic for Application Flow ---
    let initializationPathEstablished = false; // Helper flag to confirm a path was taken.

    if (isChromeBrowserDetected && isLocalFileSystemProtocol) {
        // Scenario 1: Chrome browser attempting to load local files.
        // This combination typically triggers security restrictions.
        console.info("Chrome browser identified in a local file context. Activating security warning.");
        displayLocalFileWarning();
        initializationPathEstablished = true;
    } else {
        // Scenario 2: Any other combination (e.g., Safari local, Chrome web server, any browser web server).
        // In these cases, it's generally safe to inject the application script.
        console.log("Environment deemed suitable for direct application script injection.");
        injectApplicationCoreScript();
        initializationPathEstablished = true;
    }

    // Post-check validation: Ensure one of the paths was executed.
    if (!initializationPathEstablished) {
        console.error("Error: No defined application initialization path was executed. This indicates a logical flaw.");
    }

    console.groupEnd(); // Conclude the console group.
}

// Initiate the application's environment checks immediately upon script execution.
// The internal functions handle their own DOM readiness checks if necessary.
performInitialEnvironmentChecks();