// This module is responsible for dynamically injecting content into a specific DOM element.
const contentProviderModule = require('./data-source'); // Load the primary content string from an external data module.

/**
 * Initializes and displays a key informational heading within the web page structure.
 * This function handles the creation of the display element and its insertion into the DOM.
 */
module.exports = function () {
    // Define the ID of the HTML element where the new content should be appended.
    const targetElementIdentifier = '#main-content-wrapper'; // Using a CSS selector for target identification.

    // A small validation to ensure the browser environment (document object) is available.
    if (typeof document === 'undefined') {
        console.warn('DOM environment not available. Cannot inject content.');
        return;
    }

    // Attempt to locate the designated parent element in the DOM.
    const parentContainerNode = document.querySelector(targetElementIdentifier);

    // If the target container doesn't exist, log a warning and exit.
    if (!parentContainerNode) {
        console.error(`Target container with selector '${targetElementIdentifier}' not found in the DOM.`);
        return;
    }

    // Create a new HTML heading element, specifically an H2, for the main title.
    let generatedDisplayHeading = document.createElement('h2');

    // Assign a unique ID and a CSS class for styling purposes to the new heading.
    generatedDisplayHeading.id = 'dynamic-page-title';
    generatedDisplayHeading.className = 'page-section-heading primary-title';

    // Retrieve the textual content. Provide a fallback message if the imported content is not available.
    const finalContentText = contentProviderModule || 'Default Section Title';

    // Set the plain text content of the newly created heading element.
    generatedDisplayHeading.textContent = finalContentText;

    // Append the fully configured heading element as a child to the identified parent container.
    parentContainerNode.appendChild(generatedDisplayHeading);

    // Optional: Log a confirmation message to the console.
    console.info(`Content block "${finalContentText}" successfully appended to ${targetElementIdentifier}.`);
};