let generatedContentBuffer = ""; // A buffer for accumulating generated HTML, currently unused in this revised logic.

const documentReference = document; // A constant reference to the global document object.
const initialDocumentRoot = documentReference; // Retaining for structural similarity, though functionally redundant.

const extractedMetadataTriplets = []; // A collection to store unique metadata triplets (subject, predicate, object).
let licenseInformationPresent = false; // Flag indicating if licensing details have been identified on the page.

/**
 * Sends a message to other parts of the browser extension.
 * This helper centralizes message sending and includes basic error handling.
 * @param {object} messagePayload - The data object to be sent as a message.
 */
function broadcastExtensionMessage(messagePayload) {
    try {
        browser.runtime.sendMessage(messagePayload);
    } catch (error) {
        console.error("Failed to dispatch browser extension message:", error);
        // Note: Errors like "receiving end does not exist" are common if the background script is not listening.
    }
}

/**
 * Listener for incoming messages from the extension's background script or other content scripts.
 * Responds to specific queries, such as requests for the current page's URL.
 * @param {object} incomingMessage - The message object received.
 * @param {browser.runtime.MessageSender} messageSource - Details about the sender of the message.
 * @param {Function} respondToSender - A function to send a response back to the sender.
 * @returns {boolean} - True if an asynchronous response might be sent later.
 */
browser.runtime.onMessage.addListener(function(incomingMessage, messageSource, respondToSender) {
    // Check for a specific message type requesting the page's URL.
    if (incomingMessage && incomingMessage.requestType === "page_url_query") {
        broadcastExtensionMessage({
            responseStatus: "url_provided",
            pageResourceIdentifier: window.location.href
        });
    }
    return true; // Indicates that the response might be sent asynchronously.
});

/**
 * Adds a new metadata triplet to the collection, preventing duplicates.
 * A triplet is considered a duplicate if its subject and predicate are identical to an existing one.
 * @param {Array<string>} metadataTuple - An array containing [subject, predicate, object] strings.
 */
function recordUniqueMetadataTuple(metadataTuple) {
    // Basic validation: Ensure the input is a valid array with at least three elements.
    if (!Array.isArray(metadataTuple) || metadataTuple.length < 3) {
        console.warn("Skipping invalid metadata tuple:", metadataTuple);
        return;
    }

    const [currentSubject, currentPredicate, currentObject] = metadataTuple;

    // Verify if an identical entry (matching subject and predicate) already exists in our store.
    const isAlreadyPresent = extractedMetadataTriplets.some(existingTuple =>
        existingTuple[0] === currentSubject && existingTuple[1] === currentPredicate
    );

    if (!isAlreadyPresent) {
        extractedMetadataTriplets.push(metadataTuple);

        // Special handling for licensing information: update flag and notify the extension.
        if (currentPredicate === "licensing") {
            licenseInformationPresent = true;
            broadcastExtensionMessage({
                licenseDiscovery: "namespace_identified", // A more descriptive key for the message.
                licenseUrl: currentObject, // The object is expected to be the license URL.
                contentSource: currentSubject // The subject is the URL of the content.
            });
        }
    }
    // Optional: Add logging here for debugging attempts to add duplicate tuples.
}

// Initial messages sent to the extension background script upon content script injection.
// These provide fundamental context about the current page.
broadcastExtensionMessage({
    infoCategory: "document_url",
    documentUrl: window.location.href
});
broadcastExtensionMessage({
    infoCategory: "document_title",
    documentTitle: document.title,
    documentUrl: window.location.href
});

// Schedule the primary metadata extraction routine to run after a short delay.
// This allows the page to fully load and dynamic content to render.
const METADATA_PROCESSING_DELAY_MILLISECONDS = 8000; // Adjusted delay for potentially slower pages.
setTimeout(function() {
    executePageMetadataScan();
}, METADATA_PROCESSING_DELAY_MILLISECONDS);

/**
 * Normalizes a given URL string, ensuring it is an absolute HTTP/HTTPS URL.
 * If the input URL is relative, empty, or invalid, it defaults to the current page's URL.
 * @param {string | null | undefined} potentialUrl - The URL string to normalize.
 * @returns {string} The fully qualified and normalized URL.
 */
function getNormalizedResourceUrl(potentialUrl) {
    // Robustly check if the URL is valid and absolute.
    if (typeof potentialUrl !== 'string' || !potentialUrl || !(potentialUrl.startsWith("http://") || potentialUrl.startsWith("https://"))) {
        return window.location.href; // Default to current page URL if invalid or relative.
    }
    return potentialUrl;
}

/**
 * The main function responsible for scanning the HTML document
 * to identify and extract various types of metadata, particularly licenses and attribution.
 * It uses native DOM APIs for improved performance and compatibility.
 */
function executePageMetadataScan() {
    try {
        const currentDocumentLocation = window.location.href;

        // --- Phase 1: Scan for metadata within elements marked with 'data-about' (formerly 'about') ---
        // This targets structured data where a resource is explicitly 'about' something.
        const aboutScopedElements = document.querySelectorAll('[data-about]');
        aboutScopedElements.forEach(scopeElement => {
            let resourceSubjectUrl = getNormalizedResourceUrl(scopeElement.getAttribute("data-about"));

            // Look for licensing information nested within the 'data-about' scope.
            const scopedLicenseLink = scopeElement.querySelector('[rel*="licensing"]');
            if (scopedLicenseLink && scopedLicenseLink.href) {
                recordUniqueMetadataTuple([resourceSubjectUrl, "licensing", scopedLicenseLink.href]);
                licenseInformationPresent = true; // Confirm license presence.
            }

            // Look for attribution URL (Creative Commons specific) within the 'data-about' scope.
            const scopedAttributionUrl = scopeElement.querySelector('[rel="cc:attributionLink"]'); // Using 'cc:attributionLink' as a new predicate.
            if (scopedAttributionUrl && scopedAttributionUrl.href) {
                recordUniqueMetadataTuple([resourceSubjectUrl, "attributionLink", scopedAttributionUrl.href]);
            }

            // Look for attribution name (Creative Commons specific) within the 'data-about' scope.
            const scopedAttributionName = scopeElement.querySelector('[property="cc:attributedTo"]'); // Using 'cc:attributedTo' as a new predicate.
            if (scopedAttributionName && scopedAttributionName.textContent) {
                recordUniqueMetadataTuple([resourceSubjectUrl, "attributedTo", scopedAttributionName.textContent.trim()]);
            }
        });

        // --- Phase 2: Scan for general, page-level metadata elements ---

        // Identify page-wide license links.
        const pageWideLicenseLinks = document.querySelectorAll('[rel*="licensing"]');
        if (pageWideLicenseLinks.length > 0) {
            let selectedLicenseHref = null;
            // Special logic for Wikipedia, which might present multiple license links where the second is often primary.
            if (currentDocumentLocation.includes("wikipedia.org") && pageWideLicenseLinks.length > 1) {
                selectedLicenseHref = pageWideLicenseLinks[1].href;
            } else {
                selectedLicenseHref = pageWideLicenseLinks[0].href;
            }

            if (selectedLicenseHref) {
                recordUniqueMetadataTuple([currentDocumentLocation, "licensing", selectedLicenseHref]);
                licenseInformationPresent = true; // Ensure flag is set.
            }
        }

        // Identify page-wide attribution URL.
        const pageWideAttributionUrl = document.querySelector('[rel="cc:attributionLink"]');
        if (pageWideAttributionUrl && pageWideAttributionUrl.href) {
            recordUniqueMetadataTuple([currentDocumentLocation, "attributionLink", pageWideAttributionUrl.href]);
        }

        // Identify page-wide attribution name.
        const pageWideAttributionName = document.querySelector('[property="cc:attributedTo"]');
        if (pageWideAttributionName && pageWideAttributionName.textContent) {
            recordUniqueMetadataTuple([currentDocumentLocation, "attributedTo", pageWideAttributionName.textContent.trim()]);
        }

        // Specific check for elements with the class 'charm-item-license-url', common in certain widgets.
        const charmLicenseElement = document.querySelector(".charm-item-license-url");
        if (charmLicenseElement && charmLicenseElement.href) {
            recordUniqueMetadataTuple([currentDocumentLocation, "licensing", charmLicenseElement.href]);
        }

        // --- Phase 3: Site-specific heuristic-based metadata extraction (e.g., for Flickr) ---
        // Determines the main domain to apply specific rules.
        const hostnameParts = window.location.hostname.split('.');
        const primaryDomain = hostnameParts.length > 1 ? hostnameParts[hostnameParts.length - 2] : hostnameParts[0];

        switch (primaryDomain) {
            case "flickr": // Targeting the Flickr domain for content creator info.
                let discoveredAuthor = null;

                // Attempt to find the author/owner name using the '.owner-name' class.
                const ownerNameContainer = document.querySelector('.owner-name');
                if (ownerNameContainer) {
                    discoveredAuthor = ownerNameContainer.textContent?.trim();
                }

                // If not found, try an alternative selector for the author.
                if (!discoveredAuthor) {
                    const photoNameLineOne = document.querySelector('.photo-name-line-1');
                    // Use optional chaining for safer access to nested properties.
                    discoveredAuthor = photoNameLineOne?.firstElementChild?.textContent?.trim();
                }

                // If an author is successfully identified and is not just an empty string.
                if (discoveredAuthor && discoveredAuthor.length > 1) {
                    recordUniqueMetadataTuple([currentDocumentLocation, "author", discoveredAuthor]);
                }
                break;
            // No other specific site cases are handled in this version.
        }

    } catch (error) {
        console.error("An error occurred during page metadata scanning:", error);
        // The script will continue to its final notification step even if an error occurs.
    } finally {
        // --- Finalization: Notify the extension if any license information was found ---
        if (licenseInformationPresent) {
            broadcastExtensionMessage({
                actionRequired: "display_indicator", // Renamed action key for clarity.
                pageUrlTarget: currentDocumentLocation, // The URL where metadata was extracted.
                extractedMetadata: extractedMetadataTriplets // The collection of discovered metadata.
            });
        }
    }
}