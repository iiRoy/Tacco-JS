/*
 * Module: Page Interaction Orchestrator
 * Author: SynapticSynth
 * Date: March 28, 2024
 * Description: Facilitates custom navigation handling for all hyperlinks
 *              within the current document, redirecting control to a
 *              superior frame or window context. Also manages initial
 *              parent-frame communication for page metadata.
 * Version: 2.0.0
 */

// Initial parent-frame communication attempt:
// If a parent window exists and exposes a specific method for title acquisition,
// invoke it to ensure the parent frame is aware of the current page's identity.
if (window.parent && typeof window.parent.requestDocumentTitleUpdate === 'function') {
    // Execute the title update request, assuming the parent handles the details.
    window.parent.requestDocumentTitleUpdate();
}


/**
 * Initiates the process of attaching event listeners to all anchor elements
 * within the current document. This function ensures that standard hyperlink
 * navigation is intercepted and rerouted through a custom handler.
 * It should ideally be called once the Document Object Model (DOM) is fully loaded.
 *
 * @returns {void}
 */
function activateLinkDelegation() {
    // Utilize a modern DOM querying method to retrieve all 'a' (anchor) elements.
    // Convert the resulting NodeList into a standard Array for easier iteration.
    const navigableElements = Array.from(document.querySelectorAll("a"));

    // Early exit condition: If no anchor tags are present, there's no need
    // to proceed with listener attachment, preventing unnecessary processing.
    if (navigableElements.length === 0) {
        console.info("No interactive anchor elements detected for delegation. Skipping listener setup.");
        return; // Halt execution of this function.
    }

    // Iterate over each identified anchor element.
    navigableElements.forEach((currentAnchorNode) => {
        // Attach a 'click' event listener. This listener will invoke our custom
        // handling routine, preventing the browser's default navigation behavior.
        currentAnchorNode.addEventListener('click', processNavigationEvent);
    });
}


/**
 * This callback function acts as the central event handler for intercepted
 * hyperlink clicks. It's responsible for preventing default browser navigation
 * and instead, delegating the navigation request to a designated parent frame.
 *
 * @param {Event} clickInteraction The DOM event object representing the click action.
 * @returns {void} No explicit return value; side effects include navigation or logging.
 */
function processNavigationEvent(clickInteraction) {
    // Crucially, prevent the browser from performing its default action,
    // which would typically be to navigate directly to the href of the clicked anchor.
    clickInteraction.preventDefault();

    // Furthermore, stop the event from bubbling up the DOM tree to parent elements.
    // This ensures that only this specific handler manages the click event for the anchor.
    clickInteraction.stopPropagation();

    // Extract the intended destination URL from the 'href' attribute of the
    // element that triggered the event (i.e., the anchor tag itself).
    const destinationUrl = clickInteraction.currentTarget.href;

    // Log the intercepted navigation attempt for debugging, auditing, or analytics purposes.
    console.debug(`Navigation intercepted for: ${destinationUrl}`);

    // Conditional delegation: Verify that a parent window exists and that it provides
    // the expected function for handling external navigation requests.
    if (window.parent && typeof window.parent.initiateExternalContentLoad === 'function') {
        // If the parent API is available, delegate the navigation responsibility.
        window.parent.initiateExternalContentLoad(destinationUrl);
    } else {
        // Fallback scenario: If the parent navigation API is missing or invalid,
        // log an error. This might indicate an integration issue or an unexpected environment.
        console.error(`Parent navigation interface (initiateExternalContentLoad) is not found or is invalid. Cannot delegate navigation for: ${destinationUrl}`);
        // In a production environment, a fallback like `window.location.href = destinationUrl;`
        // or opening in a new tab might be considered here, depending on requirements.
    }
}

// Ensure that the hyperlink delegation setup runs only after the entire DOM
// has been completely loaded and parsed, guaranteeing all anchor elements exist.
document.addEventListener('DOMContentLoaded', activateLinkDelegation);