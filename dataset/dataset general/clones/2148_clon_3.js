// This module aims to locate potential sub-domains by querying a search engine.
// Specifically, it leverages Bing's "domain:" dork to find related entries.
// Currently, its scope is limited to parsing only the initial search results page.
// Future enhancements could include iterating through multiple result pages for broader coverage.

const domParser = require('cheerio'); // Library for parsing and manipulating HTML structures.
const httpClient = require('request'); // Utility for making HTTP requests.
const uriUtils = require('url'); // Module for URL resolution and parsing.
const notifier = require('events'); // Core Node.js event management system.

/**
 * Helper function to ascertain if a string sequence concludes with a specific suffix.
 * This provides a more explicit check than a direct string method, allowing for potential
 * future enhancements or custom logic, and handles edge cases more robustly.
 * @param {string} mainString The string to check.
 * @param {string} sfx The suffix to look for.
 * @returns {boolean} True if mainString ends with sfx, false otherwise.
 */
function checkStringSuffix(mainString, sfx) {
    // Implement robust input validation for string types and non-empty suffix.
    if (typeof mainString !== 'string' || typeof sfx !== 'string' || sfx.length === 0) {
        return false;
    }
    // Perform the suffix check using slice.
    return mainString.length >= sfx.length && mainString.slice(-sfx.length) === sfx;
}

/**
 * Initiates a search for subdomains associated with a given primary domain.
 * It uses a web search engine to discover publicly indexed subdomains by constructing
 * a specific search query and parsing the results.
 *
 * @param {string} targetDomain - The main domain for which subdomains are to be discovered (e.g., "example.com").
 * @returns {notifier.EventEmitter} An event emitter instance that dispatches 'foundHost' for each discovered subdomain
 *          and 'discoveryComplete' upon the search's conclusion, or 'searchError' if an issue occurs.
 */
exports.discoverSubdomains = function(targetDomain) {
    const resultEmitter = new notifier.EventEmitter();

    // Input validation: Ensure the target domain is a non-empty string with proper trimming.
    if (typeof targetDomain !== 'string' || targetDomain.trim().length === 0) {
        // Emit error asynchronously to allow event listeners to be registered.
        process.nextTick(() => resultEmitter.emit('searchError', new Error('Invalid target domain provided. Must be a non-empty string.')));
        return resultEmitter;
    }

    const baseSearchUrl = 'http://www.bing.com/search';
    const queryParameters = `count=50&q=domain:${targetDomain}`;
    const fullSearchQueryUrl = `${baseSearchUrl}?${queryParameters}`;

    // Utilize a Set data structure for efficient tracking of unique hosts,
    // avoiding duplicate entries and improving lookup performance.
    const uniqueHostsFound = new Set();

    // Define custom HTTP headers to mimic a common browser, potentially reducing
    // the likelihood of being blocked by the search engine. Also, set a sensible timeout.
    const requestConfiguration = {
        url: fullSearchQueryUrl,
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.127 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5'
        },
        timeout: 15000 // Set a timeout for the request (15 seconds) to prevent hanging.
    };

    // Perform the HTTP request to the search engine to retrieve the search results page.
    httpClient(requestConfiguration, (errorOccurred, serverResponse, responseContent) => {
        // Handle any network-related errors that might occur during the HTTP request.
        if (errorOccurred) {
            return resultEmitter.emit('searchError', new Error(`HTTP request failed: ${errorOccurred.message}`));
        }

        // Validate the HTTP response status code. A non-200 code indicates a problem.
        if (serverResponse.statusCode !== 200) {
            return resultEmitter.emit('searchError', new Error(`Received non-200 status code: ${serverResponse.statusCode} from ${fullSearchQueryUrl}`));
        }

        // Load the HTML content into Cheerio for DOM manipulation and parsing.
        const dom = domParser.load(responseContent);
        // Select all anchor tags within the parsed document, as these typically contain links.
        const allAnchorElements = dom('a');

        // Iterate through each discovered anchor element to extract potential subdomains.
        allAnchorElements.each((index, anchorElement) => {
            // Safely retrieve the 'href' attribute from the element.
            const hyperlinkRef = anchorElement.attribs ? anchorElement.attribs.href : null;

            // Skip processing if no valid href attribute is present.
            if (!hyperlinkRef) {
                return;
            }

            let extractedHost = null;
            try {
                // Attempt to parse the host from the hyperlink reference using uriUtils.
                const parsedUri = uriUtils.parse(hyperlinkRef);
                extractedHost = parsedUri.host;
            } catch (uriParseError) {
                // If URI parsing fails, log the error and skip this particular URL.
                // This prevents the entire process from crashing due to malformed URIs.
                console.warn(`Skipping malformed URI: ${hyperlinkRef} - Error: ${uriParseError.message}`);
                return;
            }

            // Define the expected suffix for a valid subdomain.
            const expectedSubdomainSuffix = `.${targetDomain}`;

            // Check if the extracted host is valid, ends with the target domain's suffix,
            // and has not been discovered before (using the Set for uniqueness).
            const isPotentialSubdomain = extractedHost && checkStringSuffix(extractedHost, expectedSubdomainSuffix);

            if (isPotentialSubdomain && !uniqueHostsFound.has(extractedHost)) {
                uniqueHostsFound.add(extractedHost); // Add to Set to mark as found and unique.
                resultEmitter.emit('foundHost', extractedHost); // Notify listeners of a newly discovered subdomain.
            }
        });

        // Convert the Set of unique hosts into an array for the final output.
        const finalDiscoveredHosts = Array.from(uniqueHostsFound);
        resultEmitter.emit('discoveryComplete', finalDiscoveredHosts); // Signal the completion of the discovery process.
    });

    return resultEmitter; // Return the emitter immediately, allowing external code to subscribe to events.
};