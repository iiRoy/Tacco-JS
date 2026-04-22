// Function to extract a specific parameter's value from a given URL string.
function extractQueryParamValue(resourceLocator, keyName) {
    // Escape special characters in the key name for regex safety.
    keyName = keyName.replace(/\[/g, "\\[").replace(/\]/g, "\\]");

    // Construct the regular expression pattern to find the parameter.
    var patternString = "[\\?&]" + keyName + "=([^&#]*)";
    var queryMatcher = new RegExp(patternString);

    // Execute the regex against the URL.
    var matchResults = queryMatcher.exec(resourceLocator);

    // If no match is found, return nothing.
    if (matchResults === null) return null;
    // Otherwise, decode and return the captured value, replacing '+' with spaces.
    else {
        return decodeURIComponent(matchResults[1].replace(/\+/g, " "));
    }
}

// Function to add or update a parameter in a URL string.
function appendURLParameter(webAddress, paramKey, paramVal) {
    // Encode parameter key and value to ensure URL safety.
    paramKey = escape(paramKey);
    paramVal = escape(paramVal);

    // Regular expression to find existing parameter or its position.
    var searchExp = new RegExp("([?|&])" + paramKey + "=.*?(&|$)", "i"),
        // Determine the correct separator for the new parameter.
        delimiter = webAddress.indexOf('?') !== -1 ? "&" : "?";

    // If the parameter already exists, update its value.
    if (webAddress.match(searchExp)) {
        return webAddress.replace(searchExp, '$1' + paramKey + "=" + paramVal + '$2');
    }
    // Otherwise, append the new parameter to the URL.
    else {
        return webAddress + delimiter + paramKey + "=" + paramVal;
    }
}

// Recursively retrieves the deepest text content within a DOM element.
function retrieveDeepestTextContent(domElement) {
    // Check if the current node is a text node (nodeType 3).
    if (domElement.nodeType === Node.TEXT_NODE) {
        // Filter out text nodes that consist only of whitespace.
        if (!/^\s*$/.test(domElement.data)) {
            return domElement.data;
        }
    }
    // If it has child nodes, iterate through them.
    else if (domElement.hasChildNodes()) {
        for (var idx = 0, nodeCount = domElement.childNodes.length; idx < nodeCount; ++idx) {
            // Recursively call for each child.
            var extractedText = retrieveDeepestTextContent(domElement.childNodes[idx]);
            // If text is found, return it immediately.
            if (extractedText !== null) return extractedText;
        }
        // No text found in any child.
        return null;
    }
    // No text node or children, return null.
    else {
        return null;
    }
}

// Checks if a given string ends with a specified suffix.
function stringEndsWith(mainString, endingSequence) {
    // Utilizes indexOf to check for the suffix at the correct position.
    return mainString.indexOf(endingSequence, mainString.length - endingSequence.length) !== -1;
}

// Modifies Open Graph related links to point directly to their redirect URIs.
function updateSocialShareLinks() {
    // Select all anchor elements that contain 'connect/uiserver.php' in their href.
    var anchorElements = document.querySelectorAll('a[href*="connect/uiserver.php"]');

    for (var idx = 0; idx < anchorElements.length; idx++) {
        // Extract the 'redirect_uri' parameter from the link's href.
        var targetURL = extractQueryParamValue(anchorElements[idx].getAttribute('href'), "redirect_uri");

        // If a redirect URI is found, update the link.
        if (targetURL) {
            anchorElements[idx].setAttribute('href', targetURL); // Set new destination
            anchorElements[idx].removeAttribute('rel');          // Remove 'rel' attribute
            anchorElements[idx].setAttribute('target', '_blank'); // Open in new tab
        }
    }
}

// Adds story titles to Facebook application URLs for better context.
function injectTitlesIntoAppURLs() {
    // Map to store URL to title associations.
    var urlToCaptionMap = {};
    // Find all links pointing to Facebook applications.
    var appLinks = document.querySelectorAll('a[href*="apps.facebook.com"]');

    // First pass: collect titles for each unique URL.
    for (var jdx = 0; jdx < appLinks.length; jdx++) {
        var itemCaption = retrieveDeepestTextContent(appLinks[jdx]);
        // If a valid title is found (not too short).
        if (itemCaption && itemCaption.length > 2) {
            // Remove ellipsis if present.
            if (stringEndsWith(itemCaption, "...")) {
                itemCaption = itemCaption.substring(0, itemCaption.lastIndexOf("..."));
            }
            urlToCaptionMap[appLinks[jdx].getAttribute('href')] = itemCaption;
        }
    }

    // Second pass: update the links with the collected titles.
    for (var kdx = 0; kdx < appLinks.length; kdx++) {
        var linkAddress = appLinks[kdx].getAttribute('href');
        var storedCaption = urlToCaptionMap[linkAddress];

        // If a title was found for this URL, modify the link.
        if (storedCaption) {
            // Append the title as a new URL parameter.
            appLinks[kdx].setAttribute('href', appendURLParameter(linkAddress, "redirectTitle", storedCaption));
            appLinks[kdx].setAttribute('target', '_blank'); // Ensure it opens in a new tab.
        }
    }
}

// Examines the current URL for OAuth redirect parameters and handles them.
function examineOAuthRedirects() {
    // Key for storing the last accessed Facebook page in local storage.
    var prevPageKey = "lastVisitedFBPage";

    // Check if the current URL is the same as the last stored one (potential loop).
    var isRecursiveCall = localStorage.getItem(prevPageKey) === document.URL;
    // Update local storage with the current URL.
    localStorage.setItem(prevPageKey, document.URL);

    // Check if the current URL is an OAuth dialog or UI server redirect.
    if (document.URL.indexOf("dialog/oauth") !== -1 || document.URL.indexOf("connect/uiserver") !== -1) {
        // Extract relevant parameters from the current URL.
        var targetLocation = extractQueryParamValue(document.URL, "redirect_uri");
        var destinationLabel = extractQueryParamValue(targetLocation, "redirectTitle");
        var accessScope = extractQueryParamValue(document.URL, "scope");

        // Determine if a redirection is needed based on parameters.
        if ((targetLocation && accessScope && accessScope.indexOf("publish_actions") !== -1) || destinationLabel) {
            // If redirect URI is not a FB app and not a recursive call, redirect.
            if (targetLocation.indexOf("apps.facebook.com") === -1 && (!isRecursiveCall)) {
                window.location = targetLocation;
            }
            // If a redirect title is present, perform a Google search.
            else if (destinationLabel) {
                window.location = "https://www.google.com/search?btnI&q=" + unescape(destinationLabel);
            }
        }
    }
}

// Execute the OAuth check immediately upon script loading.
examineOAuthRedirects();

// Set up event listeners for DOM content and subtree modifications.
document.addEventListener('DOMContentLoaded', function (eventObject) {
    // Initial calls to update links once the DOM is ready.
    updateSocialShareLinks();
    injectTitlesIntoAppURLs();

    // Attach listeners for dynamic content changes.
    document.addEventListener('DOMSubtreeModified', updateSocialShareLinks, false);
    document.addEventListener('DOMSubtreeModified', injectTitlesIntoAppURLs, false);

}, false);