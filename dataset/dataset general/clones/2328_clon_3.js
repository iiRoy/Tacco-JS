let nextPageContentCache = '';
let previousPageContentCache = '';

// Helper function to execute an asynchronous HTTP request.
function performAjaxFetch(resourceURL, completionCallback) {
    const httpRequest = new XMLHttpRequest();
    httpRequest.open("GET", resourceURL);
    // Optional: Add a custom header to identify AJAX requests on the server-side.
    httpRequest.setRequestHeader('X-Requested-Page', 'true');
    httpRequest.send();

    httpRequest.onreadystatechange = function() {
        // Check if the request is fully completed.
        if (this.readyState === XMLHttpRequest.DONE) {
            // Check for successful HTTP status codes (2xx range).
            if (this.status >= 200 && this.status < 300) {
                completionCallback(null, this.responseText); // Success: pass response text.
            } else {
                // Error: pass an Error object with status details.
                completionCallback(new Error(`Server responded with status: ${this.status} (${this.statusText})`), null);
            }
        }
    };
}

// Utility to parse and extract the content within the <body> tags from a full HTML string.
function extractPageContent(fullHtmlString) {
    // Basic validation for the input.
    if (!fullHtmlString || typeof fullHtmlString !== 'string') {
        console.warn("Attempted to extract content from an invalid HTML string.");
        return '';
    }

    const lowerCaseHtml = fullHtmlString.toLowerCase();
    const bodyTagStartMarker = lowerCaseHtml.indexOf('<body');
    if (bodyTagStartMarker === -1) {
        // If no body tag is found, return the original string or an empty string, depending on desired behavior.
        // For this clone, let's return the whole string as a fallback.
        return fullHtmlString;
    }

    const contentSectionStart = fullHtmlString.indexOf('>', bodyTagStartMarker) + 1;
    const bodyTagEndMarker = lowerCaseHtml.indexOf('</body', contentSectionStart);

    if (contentSectionStart === 0 || bodyTagEndMarker === -1) {
        console.warn("Failed to identify body content boundaries within the provided HTML.");
        return fullHtmlString; // Fallback to full string.
    }
    return fullHtmlString.substring(contentSectionStart, bodyTagEndMarker);
}

// Sets up click handlers for all internal navigation links.
function setupNavigationInterceptors() {
    // Select all anchor tags that don't have a target="_blank" attribute (assumed internal).
    const internalNavLinks = document.querySelectorAll('a:not([target="_blank"])');

    if (internalNavLinks.length === 0) {
        // console.info("No internal links found for AJAX navigation setup.");
        return;
    }

    internalNavLinks.forEach(linkElement => {
        // Ensure no duplicate event listeners are attached if this function is called multiple times.
        linkElement.removeEventListener("click", processAjaxPageRequest);
        linkElement.addEventListener("click", processAjaxPageRequest);
    });
}

// Handles the click event on a navigation link, initiating AJAX load and page transition.
function processAjaxPageRequest(clickEvent) {
    clickEvent.preventDefault(); // Prevent the browser's default link behavior.

    const clickedLink = this; // 'this' refers to the anchor element that was clicked.
    const destinationPath = clickedLink.href;

    // Basic validation for the URL.
    if (!destinationPath || destinationPath.startsWith('javascript:')) {
        console.warn("Blocked navigation due to an invalid or script-based URL:", destinationPath);
        return;
    }

    const mainPageContainer = document.body;
    mainPageContainer.classList.add('page-transitioning'); // Indicate a transition is active.

    // Define transition steps as nested functions to capture `destinationPath` and `mainPageContainer` from closure.
    const initiateContentOutTransition = () => {
        mainPageContainer.removeEventListener('transitionend', initiateContentOutTransition); // Clean up this listener.
        mainPageContainer.addEventListener('transitionend', bringNewContentIn); // Set up the next transition step.

        mainPageContainer.style.opacity = '0';
        // Move the current page content off-screen to the right.
        mainPageContainer.style.transform = 'translateX(100vw)';
    };

    const bringNewContentIn = () => {
        mainPageContainer.removeEventListener('transitionend', bringNewContentIn); // Clean up.

        mainPageContainer.innerHTML = nextPageContentCache; // Update the body with the new page content.
        history.pushState({ path: destinationPath, content: nextPageContentCache }, '', destinationPath); // Update browser history.

        mainPageContainer.style.opacity = '1';
        mainPageContainer.style.transform = 'translateX(0)'; // Bring the new content to the center.
        mainPageContainer.classList.remove('page-transitioning'); // Remove transition indicator.

        setupNavigationInterceptors(); // Re-initialize handlers for any new links in the loaded content.
    };

    // Perform the AJAX request to fetch the new page content.
    performAjaxFetch(destinationPath, (requestError, htmlResponse) => {
        if (requestError) {
            console.error("AJAX content load failed:", requestError);
            // Fallback: If AJAX fails, navigate directly to the URL.
            window.location.href = destinationPath;
            return;
        }

        nextPageContentCache = extractPageContent(htmlResponse);
        if (!nextPageContentCache) {
            console.warn("No body content extracted from response, falling back to direct navigation.");
            window.location.href = destinationPath;
            return;
        }

        // Trigger the initial transition to move the current content off-screen.
        mainPageContainer.addEventListener('transitionend', initiateContentOutTransition);
        mainPageContainer.style.opacity = '0';
        // Move the current page content off-screen to the left (preparing for next content to slide in from right).
        mainPageContainer.style.transform = 'translateX(-100vw)';
    });
}

// Handles browser's popstate event (back/forward button presses).
function manageBrowserHistoryNavigation(historyPopEvent) {
    const mainPageContainer = document.body;
    mainPageContainer.classList.add('history-transitioning'); // Indicate history-driven transition.

    const currentBrowserPath = window.location.pathname;

    const initiateHistoryOutTransition = () => {
        mainPageContainer.removeEventListener('transitionend', initiateHistoryOutTransition);
        mainPageContainer.addEventListener('transitionend', bringHistoryContentIn);

        mainPageContainer.style.opacity = '0';
        // Move current content off-screen to the left.
        mainPageContainer.style.transform = 'translateX(-100vw)';
    };

    const bringHistoryContentIn = () => {
        mainPageContainer.removeEventListener('transitionend', bringHistoryContentIn);

        mainPageContainer.innerHTML = previousPageContentCache; // Update with historical content.
        mainPageContainer.style.opacity = '1';
        mainPageContainer.style.transform = 'translateX(0)'; // Bring historical content to center.
        mainPageContainer.classList.remove('history-transitioning');

        setupNavigationInterceptors(); // Re-initialize handlers for new links.
    };

    // Attempt to retrieve content from the history state object first.
    if (historyPopEvent.state && historyPopEvent.state.content) {
        previousPageContentCache = historyPopEvent.state.content;
        // Content is available immediately, trigger transition.
        mainPageContainer.addEventListener('transitionend', initiateHistoryOutTransition);
        mainPageContainer.style.opacity = '0';
        // Move current content off-screen to the right (preparing for history content to slide in from left).
        mainPageContainer.style.transform = 'translateX(100vw)';
    } else {
        // If content is not in state (e.g., initial load or external navigation), fetch it via AJAX.
        performAjaxFetch(currentBrowserPath, (requestError, htmlResponse) => {
            if (requestError) {
                console.error("AJAX history content load failed:", requestError);
                window.location.reload(); // Fallback: reload the page on error.
                return;
            }
            previousPageContentCache = extractPageContent(htmlResponse);
            if (!previousPageContentCache) {
                console.warn("No body content extracted for history, reloading page.");
                window.location.reload();
                return;
            }
            // Trigger transition after fetching content.
            mainPageContainer.addEventListener('transitionend', initiateHistoryOutTransition);
            mainPageContainer.style.opacity = '0';
            // Move current content off-screen to the right.
            mainPageContainer.style.transform = 'translateX(100vw)';
        });
    }
}

// Entry point: Ensure DOM is fully loaded before attaching event listeners.
document.addEventListener('DOMContentLoaded', () => {
    // Attach the popstate listener globally, ensuring it's only added once.
    window.removeEventListener("popstate", manageBrowserHistoryNavigation); // Prevent potential duplicates.
    window.addEventListener("popstate", manageBrowserHistoryNavigation);

    // Initial setup of navigation handlers for the current page.
    setupNavigationInterceptors();
});