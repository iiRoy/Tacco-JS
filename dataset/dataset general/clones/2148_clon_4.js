// Custom implementation of a basic event emitter.
class DomainMonitor {
    constructor() {
        this.observerCallbacks = {};
    }

    on(eventKey, handlerFunction) {
        if (!this.observerCallbacks[eventKey]) {
            this.observerCallbacks[eventKey] = [];
        }
        this.observerCallbacks[eventKey].push(handlerFunction);
    }

    notify(eventKey, dataPayload) {
        if (this.observerCallbacks[eventKey]) {
            this.observerCallbacks[eventKey].forEach(callback => callback(dataPayload));
        }
    }
}

// Custom function to check if a string ends with another string.
const checkSuffix = (mainText, endingSegment) => {
    if (endingSegment.length === 0) return true;
    return mainText.slice(-endingSegment.length) === endingSegment;
};

// Node.js built-in modules for network requests and URL parsing.
const webConnector = require('https');
const webAddressUtil = require('url');

// Main function to discover subdomains.
exports.discoverSites = (targetHostName) => {
    const resultStream = new DomainMonitor();
    const searchEndpoint = `/search?count=50&q=domain:${targetHostName}`;
    const searchEngineHost = 'www.bing.com';

    const connectionOptions = {
        hostname: searchEngineHost,
        path: searchEndpoint,
        method: 'GET',
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
    };

    const requestInitiator = webConnector.request(connectionOptions, (serverResponse) => {
        let receivedData = '';
        serverResponse.on('data', (chunk) => {
            receivedData += chunk;
        });

        serverResponse.on('end', () => {
            const foundDomains = new Set();
            // Regular expression to find href attributes in anchor tags.
            // This pattern looks for <a ... href="LINK_VALUE" ...>
            const hyperlinkPattern = /<a[^>]*href=["']([^"']*)["'][^>]*>/g;
            let currentMatch;

            while ((currentMatch = hyperlinkPattern.exec(receivedData)) !== null) {
                const linkDestination = currentMatch[1]; // The captured group is the href attribute's value

                let parsedLinkObject;
                try {
                    // Resolve relative URLs using the search engine's base URL.
                    parsedLinkObject = new webAddressUtil.URL(linkDestination, `http://${searchEngineHost}`);
                } catch (parsingError) {
                    // Skip malformed or unresolvable URLs.
                    continue;
                }

                const extractedHost = parsedLinkObject.host;

                // Check if the extracted host exists and ends with '.targetHostName'.
                // The original code checks for `.` + `domainName`.
                if (extractedHost && checkSuffix(extractedHost, `.${targetHostName}`)) {
                    if (!foundDomains.has(extractedHost)) {
                        foundDomains.add(extractedHost);
                        resultStream.notify('subdomain', extractedHost);
                    }
                }
            }
            resultStream.notify('end', Array.from(foundDomains));
        });
    });

    requestInitiator.on('error', (networkError) => {
        // In case of a network error, signal 'end' with an empty array,
        // mirroring the original's implicit behavior of not finding anything on error.
        resultStream.notify('end', []);
    });

    requestInitiator.end(); // Send the HTTP request.

    return resultStream;
};