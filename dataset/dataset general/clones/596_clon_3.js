/*
 * This script is designed to extract specific product information
 * from an e-commerce page and subsequently inject dynamic content
 * based on messages received from a host application.
 * It primarily targets product pages on iread.com.tw to fetch ISBNs
 * and then adds a promotional link for TAAZE's 3-hour delivery service.
 */

// Establish a local reference to the document object for brevity and consistency.
const currentDocument = document;

// --- Phase 1: Product Identifier Retrieval and Communication ---

// Define a regular expression pattern to locate the ISBN within list items.
// This pattern looks for an <li> tag containing "ISBN：" followed by digits.
const isbnPattern = /<li>ISBN：(\d*)<\/li>/;

// Attempt to locate the primary product detail list, typically containing key book information.
const bookDetailSection = currentDocument.querySelector('ul.BookDetail');

let retrievedProductCode = null; // Initialize variable for the extracted ISBN.

// Ensure the target section exists before attempting to extract data.
if (bookDetailSection) {
    // Extract the inner HTML to search for the ISBN.
    const sectionContent = bookDetailSection.innerHTML;
    const isbnMatch = sectionContent.match(isbnPattern);

    // If an ISBN is successfully matched, capture the numeric part.
    if (isbnMatch && isbnMatch[1]) {
        retrievedProductCode = isbnMatch[1];
        // For debugging purposes, log the extracted code.
        // console.log("Extracted ISBN:", retrievedProductCode);
    }
}

// If an ISBN was found and `self.postMessage` is available (e.g., in a Web Worker or extension context),
// send the retrieved product code back to the originating script.
if (retrievedProductCode && typeof self !== 'undefined' && typeof self.postMessage === 'function') {
    self.postMessage(retrievedProductCode);
} else if (!retrievedProductCode) {
    // console.warn("Could not retrieve product ISBN from the current page.");
}


// --- Phase 2: Dynamic Content Injection based on External Message ---

// Constants for the TAAZE affiliate link.
const TAAZE_BASE_URL = "http://www.taaze.tw/apredir.html";
const TAAZE_AFFILIATE_ID = "ap124294093_a_";
const PROMO_TEXT = 'TAAZE 有 3 小時到貨'; // Unicode for "TAAZE Has 3-Hour Delivery"

// Check if the `self.port` API is available for message listening.
if (typeof self !== 'undefined' && self.port && typeof self.port.on === 'function') {
    // Register an event listener for a specific message type, e.g., 'displayAvailabilityPrompt'.
    self.port.on('displayAvailabilityPrompt', function (incomingProductId) {
        // Basic validation: ensure a product ID is provided.
        if (!incomingProductId) {
            // console.error("Received message to display prompt, but no product ID was provided.");
            return;
        }

        // Construct the full redirection URL using the provided product ID.
        const redirectionUrl = `${TAAZE_BASE_URL}?${TAAZE_AFFILIATE_ID}${encodeURIComponent(incomingProductId)}`;

        // Identify the element where the new promotional box should be inserted.
        const referencePlacementElement = currentDocument.getElementById("book_action");

        // Proceed only if the reference element exists.
        if (referencePlacementElement) {
            // Create a new container div for the promotional content.
            const promotionalMessageBox = currentDocument.createElement('div');

            // Apply inline styles to the message box for visual presentation.
            // Using direct style assignments for better control and readability.
            Object.assign(promotionalMessageBox.style, {
                textAlign: 'center',
                border: '1px solid rgb(204, 204, 204)',
                backgroundColor: 'rgb(242, 242, 242)',
                marginTop: '40px',
                marginBottom: '0',
                marginLeft: '0',
                float: 'left',
                width: '160px',
                padding: '10px'
            });

            // Create an anchor (hyperlink) element.
            const callToActionLink = currentDocument.createElement('a');
            callToActionLink.style.color = 'red'; // Set text color to red.
            callToActionLink.href = redirectionUrl; // Set the target URL.
            callToActionLink.textContent = PROMO_TEXT; // Set the visible text.

            // Append the hyperlink to the message box.
            promotionalMessageBox.appendChild(callToActionLink);

            // Adjust the margin of the existing reference element.
            referencePlacementElement.style.marginTop = '5px';

            // Insert the newly created promotional message box before the reference element.
            // Ensure the parent node exists before attempting insertion.
            if (referencePlacementElement.parentNode) {
                referencePlacementElement.parentNode.insertBefore(promotionalMessageBox, referencePlacementElement);
                // console.log("TAAZE promotional box successfully inserted.");
            } else {
                // console.warn("Parent node of 'book_action' not found; cannot insert promotional box.");
            }
        } else {
            // console.warn("Insertion point 'book_action' not found on the page.");
        }
    });
} else {
    // console.log("self.port API not available; dynamic content insertion listener not activated.");
}