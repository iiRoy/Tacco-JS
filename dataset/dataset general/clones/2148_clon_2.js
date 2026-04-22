/*
 * This module identifies potential sub-domains by querying a search engine.
 * It uses a 'domain:' dork to find related entries on Bing.com.
 * Currently, only results from the initial search page are processed.
 * Future enhancements could involve iterating through multiple result pages.
 */

var domParser = require('cheerio')
  , webFetcher = require('request')
  , uriUtil = require('url')
  , toolkit = require('lodash')
  , notifier = require('events')
  ; // End of module imports

/**
 * Extends the String prototype with a method to check if a string ends with a specific pattern.
 * @param {string} endingPattern - The string pattern to check for at the end.
 * @returns {boolean} True if the string terminates with the pattern, false otherwise.
 */
String.prototype.terminatesWithPattern = function(endingPattern) {
    return this.indexOf(endingPattern, this.length - endingPattern.length) !== -1;
};


/**
 * Initiates a search for subdomains associated with a given target domain.
 * Emits 'discoveredEntity' for each unique subdomain found and 'completionSignal' upon finish.
 *
 * @param {string} targetDomain - The primary domain for which to find subdomains.
 * @returns {notifier.EventHandler} An event emitter instance to subscribe to discovery events.
 */
module.exports.discoverSubdomains = function(targetDomain) {
    var eventEmitterInstance = new notifier.EventEmitter(); // Create a new event handler

    // Perform an HTTP request to Bing search to gather relevant links.
    // The query uses a 'domain:' dork to narrow down results to the specified target.
    webFetcher('http://www.bing.com/search?count=50&q=domain:' + targetDomain, function(fetchError, webResponse, responseContent) {
        if (fetchError) {
            eventEmitterInstance.emit('error', fetchError);
            return;
        }

        var domObject = domParser.load(responseContent); // Load the HTML content into a DOM object for parsing
        var potentialSubdomains = []; // Array to store discovered subdomains

        // Iterate over each anchor tag ('a') found in the parsed HTML.
        domObject('a').each(function(indexVal, elementNode) {
            var hyperlinkRef = elementNode.attribs ? elementNode.attribs.href : null; // Extract the href attribute

            // Skip if the hyperlink reference is null or undefined.
            if (!hyperlinkRef) {
                return;
            }

            var parsedUri = uriUtil.parse(hyperlinkRef); // Parse the full URI to extract its components.
            var domainHost = parsedUri.host; // Get the host component from the parsed URI.

            // Check if the host exists, ends with the target domain (e.g., '.example.com'),
            // and has not been added to our list yet.
            if (domainHost && domainHost.terminatesWithPattern('.' + targetDomain) && potentialSubdomains.indexOf(domainHost) === -1) {
                potentialSubdomains.push(domainHost); // Add the unique host to our list.
                eventEmitterInstance.emit('discoveredEntity', domainHost); // Notify listeners about the newly found subdomain.
            }
        });

        // Ensure all discovered subdomains are unique, using the lodash 'uniq' function.
        potentialSubdomains = toolkit.uniq(potentialSubdomains);

        // Signal the completion of subdomain discovery, passing the final list.
        eventEmitterInstance.emit('completionSignal', potentialSubdomains);
    });

    return eventEmitterInstance; // Return the event emitter for external subscription.
};