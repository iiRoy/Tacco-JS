// A small utility constant to reliably get the current page's full URL.
const currentDocumentLocation = document.URL;

/**
 * Safely extracts a specific query string parameter's value from a given URL.
 * Ensures robust handling of special characters and provides basic input validation.
 * @param {string} fullWebAddress - The complete URL string to be parsed.
 * @param {string} parameterIdentifier - The name (key) of the URL parameter to retrieve.
 * @returns {string|null} The decoded value of the parameter, or null if it's not found or inputs are invalid.
 */
function retrieveQueryStringParameter(fullWebAddress, parameterIdentifier) {
    // Validate inputs to prevent errors and ensure proper execution.
    if (!fullWebAddress || typeof fullWebAddress !== 'string' || !parameterIdentifier || typeof parameterIdentifier !== 'string') {
        // console.warn('Input error: Invalid URL or parameter identifier provided.');
        return null;
    }

    // Escape any special regular expression characters in the parameter name.
    // This ensures that characters like '[', ']', '$' are matched literally.
    let cleanedIdentifier = parameterIdentifier.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    // Construct a regular expression to find the parameter.
    // It looks for '?identifier=' or '&identifier=', then captures everything
    // until the next '&' or '#' or the end of the string.
    const paramRegex = new RegExp(`[?&]${cleanedIdentifier}=([^&#]*)`);

    // Attempt to find a match in the provided URL.
    const searchMatch = paramRegex.exec(fullWebAddress);

    // If no match is found, or the captured group (value) is missing, return null.
    if (!searchMatch || searchMatch.length < 2) {
        return null;
    }

    // Decode the captured parameter value.
    // First, replace '+' characters with spaces, then use decodeURIComponent
    // for comprehensive URL decoding.
    const decodedParameterValue = decodeURIComponent(searchMatch[1].replace(/\+/g, ' '));
    return decodedParameterValue;
}

/**
 * Inserts or updates a query parameter in a URL string.
 * This function handles proper URL encoding for both the parameter name and value.
 * @param {string} baseUri - The initial URL string.
 * @param {string} paramKey - The name of the parameter to add or modify.
 * @param {string} paramValue - The value to assign to the parameter.
 * @returns {string} The modified URL string with the parameter updated or added.
 */
function updateOrCreateUrlParameter(baseUri, paramKey, paramValue) {
    // Ensure valid inputs; return the original URI if inputs are problematic.
    if (typeof baseUri !== 'string' || typeof paramKey !== 'string') {
        // console.warn('Invalid inputs for URL parameter manipulation.');
        return baseUri;
    }

    const encodedKey = encodeURIComponent(paramKey);
    const encodedValue = encodeURIComponent(paramValue);

    // Regular expression to find and replace an existing parameter.
    // It captures the leading separator ('?' or '&') and the trailing separator ('&' or end of string).
    const replacementPattern = new RegExp(`([?&])${encodedKey}=[^&]*(&|$)`, 'i');

    // Check if the parameter already exists in the URL.
    if (baseUri.match(replacementPattern)) {
        // If an existing parameter is found, replace it with the new encoded value.
        // '$1' and '$2' refer to the captured groups (separators).
        return baseUri.replace(replacementPattern, `$1${encodedKey}=${encodedValue}$2`);
    } else {
        // If the parameter does not exist, append it to the URL.
        // Determine whether to use '?' (for the first parameter) or '&' (for subsequent).
        const appenderChar = baseUri.includes('?') ? '&' : '?';
        return `${baseUri}${appenderChar}${encodedKey}=${encodedValue}`;
    }
}

/**
 * Recursively searches a DOM node to find and extract the deepest non-whitespace text content.
 * This function prioritizes text nodes that are not purely whitespace.
 * @param {Node} domNodeToInspect - The DOM node from which to extract text.
 * @returns {string|null} The trimmed text content, or null if no significant text is found.
 */
function extractDeepestTextContent(domNodeToInspect) {
    // Guard clause for invalid or non-existent nodes.
    if (!domNodeToInspect || !domNodeToInspect.nodeType) {
        return null;
    }

    // Check if the current node is a text node.
    if (domNodeToInspect.nodeType === Node.TEXT_NODE) {
        const textData = domNodeToInspect.data;
        // Return trimmed text if it's not just whitespace.
        if (textData && textData.trim().length > 0) {
            return textData.trim();
        }
    }
    // If it's an element node and has children, iterate through them.
    else if (domNodeToInspect.hasChildNodes()) {
        for (let childIndex = 0; childIndex < domNodeToInspect.childNodes.length; ++childIndex) {
            const childTextResult = extractDeepestTextContent(domNodeToInspect.childNodes[childIndex]);
            // Return the first non-null text found, indicating it's the "innermost".
            if (childTextResult !== null) {
                return childTextResult;
            }
        }
    }
    // If no text node found in this branch, or all children returned null.
    return null;
}

/**
 * Determines if a given string concludes with a specific suffix.
 * Provides robust checks for various string lengths and types.
 * @param {string} inputString - The string to be examined.
 * @param {string} stringSuffix - The suffix to check for.
 * @returns {boolean} True if `inputString` ends with `stringSuffix`, false otherwise.
 */
function doesStringEndWith(inputString, stringSuffix) {
    // Type validation for inputs.
    if (typeof inputString !== 'string' || typeof stringSuffix !== 'string') {
        // console.warn('Input error: Both arguments must be strings for doesStringEndWith.');
        return false;
    }
    // An empty suffix always matches.
    if (stringSuffix.length === 0) {
        return true;
    }
    // If the input string is shorter than the suffix, it cannot end with it.
    if (inputString.length < stringSuffix.length) {
        return false;
    }

    // Compare the end portion of the input string with the suffix.
    return inputString.slice(-stringSuffix.length) === stringSuffix;
}

// --- DOM Manipulation Routines ---

/**
 * Locates and transforms specific anchor elements that act as OpenGraph redirectors.
 * These links are updated to point directly to their final destination, and their
 * attributes are adjusted for user experience (e.g., opening in a new tab).
 */
function adjustOpenGraphRedirections() {
    // Select all anchor elements whose 'href' attribute contains the OpenGraph uiserver path.
    const ogRedirectLinks = document.querySelectorAll('a[href*="connect/uiserver.php"]');

    // If no such links are found, there's nothing to do.
    if (ogRedirectLinks.length === 0) {
        return;
    }

    // Iterate over each found link using a modern Array.from().forEach() pattern.
    Array.from(ogRedirectLinks).forEach(currentAnchor => {
        const originalLinkHref = currentAnchor.getAttribute('href');
        // Extract the true destination URI from the 'redirect_uri' query parameter.
        const actualDestinationUri = retrieveQueryStringParameter(originalLinkHref, 'redirect_uri');

        // If a valid redirect URI is successfully extracted, modify the link.
        if (actualDestinationUri) {
            currentAnchor.setAttribute('href', actualDestinationUri); // Update the link's target.
            currentAnchor.removeAttribute('rel'); // Remove 'rel' attribute, often used for security/SEO.
            currentAnchor.setAttribute('target', '_blank'); // Force opening in a new browser tab.
            currentAnchor.setAttribute('data-og-processed', 'true'); // Mark this link as processed.
        }
    });
}

// Constants for processing link titles.
const ELLIPSIS_CHARACTERS = "...";
const MINIMUM_TITLE_LENGTH = 3; // Titles shorter than this are likely not meaningful.

/**
 * Enhances Facebook application links by embedding their display titles as a
 * 'redirectTitle' query parameter. This can be used downstream for custom redirects.
 */
function augmentFacebookAppLinksWithTitles() {
    // Select all anchor elements whose 'href' attribute contains the Facebook apps domain.
    const fbAppAnchors = document.querySelectorAll('a[href*="apps.facebook.com"]');

    // Early exit if no relevant links are present.
    if (fbAppAnchors.length === 0) {
        return;
    }

    // Use a Map to store unique URL-to-title mappings. Maps are generally more robust
    // for keys than plain objects, especially if URLs could contain unusual characters.
    const uriToDisplayTitleMap = new Map();

    // First pass: Collect potential titles from the link text.
    Array.from(fbAppAnchors).forEach(singleLink => {
        const currentLinkText = extractDeepestTextContent(singleLink);
        const currentLinkUri = singleLink.getAttribute('href');

        if (currentLinkText && currentLinkText.length >= MINIMUM_TITLE_LENGTH) {
            let refinedTitle = currentLinkText;
            // If the title ends with an ellipsis, remove it to get the core title.
            if (doesStringEndWith(refinedTitle, ELLIPSIS_CHARACTERS)) {
                refinedTitle = refinedTitle.substring(0, refinedTitle.lastIndexOf(ELLIPSIS_CHARACTERS));
            }
            // Store the title, ensuring we only add it once per unique URL (first one wins).
            if (!uriToDisplayTitleMap.has(currentLinkUri)) {
                uriToDisplayTitleMap.set(currentLinkUri, refinedTitle);
            }
        }
    });

    // Second pass: Apply the collected titles back to the links as parameters.
    Array.from(fbAppAnchors).forEach(singleLink => {
        const linkHref = singleLink.getAttribute('href');
        const correspondingTitle = uriToDisplayTitleMap.get(linkHref);

        // If a title was found for this link's URL, update its href.
        if (correspondingTitle) {
            const newHrefWithTitle = updateOrCreateUrlParameter(linkHref, 'redirectTitle', correspondingTitle);
            singleLink.setAttribute('href', newHrefWithTitle);
            singleLink.setAttribute('target', '_blank'); // Also ensure these open in new tabs.
            singleLink.setAttribute('data-fb-title-processed', 'true'); // Mark as processed.
        }
    });
}

// --- Core Redirect Logic for OAuth Flows ---

const PREV_PAGE_STORAGE_KEY = "lastVisitedPageUri";
const OAUTH_ENDPOINT_SEGMENT = "dialog/oauth";
const UISERVER_ENDPOINT_SEGMENT = "connect/uiserver";
const REQUIRED_AUTH_SCOPE = "publish_actions";
const SEARCH_ENGINE_FALLBACK_URL = "https://www.google.com/search?btnI&q="; // Google "I'm Feeling Lucky" search

/**
 * Executes checks for OpenGraph OAuth or uiserver redirection scenarios.
 * It attempts to redirect the user based on URL parameters and internal state
 * (to prevent redirect loops).
 */
function handleOpenGraphOAuthRedirection() {
    // Retrieve the URL of the last page recorded in local storage.
    const lastStoredPageUri = localStorage.getItem(PREV_PAGE_STORAGE_KEY);

    // Determine if the current page load is immediately following itself,
    // which could indicate a redirect loop.
    const isRecursiveNavigationAttempt = (lastStoredPageUri === currentDocumentLocation);

    // Update local storage with the current URL for future checks.
    localStorage.setItem(PREV_PAGE_STORAGE_KEY, currentDocumentLocation);

    // Check if the current URL matches either an OAuth dialog or uiserver pattern.
    const isRelevantRedirectPage = currentDocumentLocation.includes(OAUTH_ENDPOINT_SEGMENT) || currentDocumentLocation.includes(UISERVER_ENDPOINT_SEGMENT);

    if (isRelevantRedirectPage) {
        // Extract key parameters from the current URL.
        const primaryRedirectUri = retrieveQueryStringParameter(currentDocumentLocation, 'redirect_uri');
        // A custom title might be embedded within the primary redirect URI itself.
        const embeddedRedirectTitle = primaryRedirectUri ? retrieveQueryStringParameter(primaryRedirectUri, 'redirectTitle') : null;
        const requestedAuthScope = retrieveQueryStringParameter(currentDocumentLocation, 'scope');

        // Define conditions for initiating a redirect:
        // 1. A valid primary redirect URI is present AND 'publish_actions' scope is requested.
        // 2. A custom embedded redirect title is found.
        const shouldProceedWithRedirect = (primaryRedirectUri && requestedAuthScope && requestedAuthScope.includes(REQUIRED_AUTH_SCOPE)) || !!embeddedRedirectTitle;

        if (shouldProceedWithRedirect) {
            const isTargetingFacebookAppDomain = primaryRedirectUri && primaryRedirectUri.includes("apps.facebook.com");

            // Prioritized redirect condition: If a non-Facebook app URI is found
            // and we're not in a recursive navigation loop, redirect directly.
            if (primaryRedirectUri && !isTargetingFacebookAppDomain && !isRecursiveNavigationAttempt) {
                window.location.replace(primaryRedirectUri); // Use replace to avoid history stack issues.
            }
            // Secondary redirect condition: If a custom title is present, perform a search.
            else if (embeddedRedirectTitle) {
                const unescapedSearchQuery = decodeURIComponent(embeddedRedirectTitle);
                window.location.replace(SEARCH_ENGINE_FALLBACK_URL + unescapedSearchQuery);
            }
        }
    }
}

// --- Initialization and Event Listeners ---

// Execute the OAuth redirection check immediately upon script load.
// This is crucial for handling redirects before the DOM content is fully parsed.
handleOpenGraphOAuthRedirection();

/**
 * Creates a debounced version of a function, ensuring it's only called after a
 * specified delay has passed without further invocations. Useful for performance.
 * @param {Function} callableFunction - The function to debounce.
 * @param {number} pauseDurationMs - The delay in milliseconds before the function is executed.
 * @returns {Function} The debounced function.
 */
const createDebouncedFunction = (callableFunction, pauseDurationMs) => {
    let timerHandle;
    return function(...invocationArgs) {
        const contextOfCall = this;
        clearTimeout(timerHandle); // Clear any existing timer.
        timerHandle = setTimeout(() => callableFunction.apply(contextOfCall, invocationArgs), pauseDurationMs);
    };
};

const DOM_MODIFICATION_DEBOUNCE_DELAY_MS = 200; // Adjust this value to control responsiveness vs. performance.

// Create debounced versions of the DOM manipulation functions.
const debouncedOgRedirectProcessor = createDebouncedFunction(adjustOpenGraphRedirections, DOM_MODIFICATION_DEBOUNCE_DELAY_MS);
const debouncedFbAppLinkEnhancer = createDebouncedFunction(augmentFacebookAppLinksWithTitles, DOM_MODIFICATION_DEBOUNCE_DELAY_MS);

/**
 * Main function to initialize all DOM-related enhancements and attach event listeners.
 * This is designed to run once the entire HTML document has been loaded and parsed.
 */
function setupDomEnhancements() {
    // Perform initial scans and updates on the existing DOM.
    adjustOpenGraphRedirections();
    augmentFacebookAppLinksWithTitles();

    // Attach event listeners for dynamic content.
    // Note: 'DOMSubtreeModified' is deprecated due to performance concerns,
    // but used here for functional equivalence. Debouncing helps mitigate issues.
    document.addEventListener('DOMSubtreeModified', debouncedOgRedirectProcessor, false);
    document.addEventListener('DOMSubtreeModified', debouncedFbAppLinkEnhancer, false);

    // A more modern approach would involve MutationObserver for better performance,
    // but for cloning purposes, sticking to the original event type is desired.
}

// Wait for the entire DOM content to be loaded and parsed before setting up enhancements.
document.addEventListener('DOMContentLoaded', setupDomEnhancements, false);