// This script provides compatibility fixes for rendering custom icon fonts
// on specific older browser versions. It ensures that text-based keywords
// are correctly transformed into their corresponding Unicode glyphs once
// the document is ready.
// Developed by a dedicated team of web archivists for enhanced web compatibility.

// Define a regular expression to identify web browsers that require this
// specialized glyph rendering compatibility layer.
const LEGACY_BROWSER_IDENTIFIER_PATTERN = /(MSIE [7-9]\.|Opera.*Version\/(11|12)\.|Chrome\/([5-9]|10)\.|Version\/(4)[\.0-9]+ Safari\/|Version\/(4|5\.0)[\.0-9]+? Mobile\/.*Safari\/)/;

// Execute the compatibility logic only if the current user agent matches
// one of the identified legacy browser patterns.
// Perform a defensive check for `navigator` and `userAgent` availability.
if (typeof navigator === 'object' && navigator !== null && navigator.userAgent && LEGACY_BROWSER_IDENTIFIER_PATTERN.test(navigator.userAgent)) {

  // This conditional block acts as a guard, ensuring that the core
  // processing functions are defined and initialized only once.
  // This prevents re-initialization issues if the script is loaded multiple times.
  if (typeof applyGlyphTransformationsToNodes === 'undefined') { // Renamed from ss_legacy

    /*
     * Custom DOM Ready Utility (domready-enhanced.js)
     * A robust and cross-browser compatible utility to execute callbacks
     * once the Document Object Model is fully loaded and parsed.
     * This module extends the functionality of a classic domready implementation.
     * Original inspiration from: https://github.com/ded/domready
     */
    (function(globalExportName, factoryDefinition) {
      // Check for CommonJS environment (e.g., Node.js).
      if (typeof module === "object" && module.exports) {
        module.exports = factoryDefinition();
      }
      // Check for Asynchronous Module Definition (AMD) environment (e.g., RequireJS).
      else if (typeof define === "function" && typeof define.amd === "object") {
        define(factoryDefinition);
      }
      // Fallback to attaching the utility to the global `window` object.
      else {
        this[globalExportName] = factoryDefinition();
      }
    }("onDomContentAvailable", function() { // Renamed from "ss_ready"

      let documentIsFullyReady = 0; // Renamed from 'l', indicates if DOM is ready (0=no, 1=yes)
      const pendingCallbacksQueue = []; // Renamed from 'b', stores functions to run on DOM ready
      let domReadyEventHook; // Renamed from 'c', reference to the event listener function
      const useCapturePhase = false; // Renamed from 'd', standard for event listeners
      const currentDocumentInstance = document; // Renamed from 'e'
      const documentRootElementReference = currentDocumentInstance.documentElement; // Renamed from 'f'
      const supportsDoScrollMethod = documentRootElementReference.doScroll; // Renamed from 'g', IE-specific check
      const domContentLoadedEventName = "DOMContentLoaded"; // Renamed from 'h'
      const addEventListenerMethodName = "addEventListener"; // Renamed from 'i'
      const ieReadyStateChange = "onreadystatechange"; // Renamed from 'j'
      const documentReadyStateProperty = "readyState"; // Renamed from 'k'

      // Internal helper function to process and execute all queued callbacks.
      const processAllQueuedCallbacks = function() { // Renamed from 'm'
        if (documentIsFullyReady === 1) return; // Prevent multiple executions.
        documentIsFullyReady = 1; // Mark document as ready.
        let singleCallback;
        while ((singleCallback = pendingCallbacksQueue.shift())) {
          singleCallback(); // Execute each callback.
        }
      };

      // Unified event handler for both modern DOMContentLoaded and IE's onreadystatechange.
      domReadyEventHook = function() {
        // Detach event listeners to prevent memory leaks and redundant calls.
        if (currentDocumentInstance[addEventListenerMethodName]) {
            currentDocumentInstance.removeEventListener(domContentLoadedEventName, domReadyEventHook, useCapturePhase);
        } else if (currentDocumentInstance.attachEvent) { // For older Internet Explorer versions.
            currentDocumentInstance.detachEvent(ieReadyStateChange, domReadyEventHook);
        }
        processAllQueuedCallbacks(); // Now, execute all pending functions.
      };

      // Immediately check if the document is already in a 'loading' or 'complete' state.
      if (/^loade|c/.test(currentDocumentInstance[documentReadyStateProperty])) {
          documentIsFullyReady = 1; // Set flag if already ready.
      }

      // Attach the standard DOMContentLoaded event listener for modern browsers.
      if (currentDocumentInstance[addEventListenerMethodName]) {
        currentDocumentInstance[addEventListenerMethodName](domContentLoadedEventName, domReadyEventHook, useCapturePhase);
      }

      // Fallback mechanism for older IE versions using `onreadystatechange` and `doScroll`.
      if (supportsDoScrollMethod && currentDocumentInstance.attachEvent) {
        currentDocumentInstance.attachEvent(ieReadyStateChange, domReadyEventHook);
      }

      // The public function returned by the IIFE to register new callbacks.
      const registerDomReadyCallback = function(userCallbackFunction) { // Renamed from 'a'
        // Validate input: ensure the provided argument is indeed a function.
        if (typeof userCallbackFunction !== 'function') {
            console.warn("onDomContentAvailable: The provided callback is not a valid function and will be ignored.");
            return;
        }

        // If the DOM is already ready, execute the callback immediately.
        if (documentIsFullyReady === 1) {
          userCallbackFunction();
          return;
        }

        // Handle the `doScroll` hack for IE if supported.
        if (supportsDoScrollMethod) {
          // If the script is running within an iframe or the document is already ready,
          // execute the callback without `doScroll` polling.
          if (window.self !== window.top || documentIsFullyReady === 1) {
            userCallbackFunction();
          } else {
            // Otherwise, initiate the `doScroll` polling loop.
            (function pollForDoScrollSuccess() {
              try {
                // `doScroll` will throw an error until the document is interactive.
                documentRootElementReference.doScroll("left");
              } catch (doScrollError) {
                // If an error occurs, retry after a short delay.
                return setTimeout(pollForDoScrollSuccess, 50);
              }
              // If `doScroll` succeeds, the document is ready, so execute the callback.
              userCallbackFunction();
            })();
          }
        } else {
          // For all other browsers (non-IE and not yet ready), add the callback to the queue.
          pendingCallbacksQueue.push(userCallbackFunction);
        }
      };

      return registerDomReadyCallback; // Expose the callback registration function.
    }())); // End of onDomContentAvailable IIFE

    /**
     * Recursively processes a single DOM node or a collection of nodes
     * to apply character transformations. This function is designed to
     * work with various node types and structures in older browsers.
     * @param {HTMLElement|NodeList|Array<HTMLElement>} currentNodeOrCollection - The node(s) to process.
     * @returns {void}
     */
    const applyGlyphTransformationsToNodes = function(currentNodeOrCollection) { // Renamed from ss_legacy

      // Basic validation: Exit early if the input is null, undefined, or not an object.
      if (!currentNodeOrCollection || typeof currentNodeOrCollection !== 'object') {
        // console.debug("Glyph transformation processor received an invalid or null target.");
        return;
      }

      // If the input is an array-like object (e.g., NodeList, HTMLCollection, or Array),
      // iterate over its members and recursively call this function for each.
      const isCollection = Array.isArray(currentNodeOrCollection) ||
                           (typeof currentNodeOrCollection.length === 'number' &&
                            currentNodeOrCollection.length > 0 &&
                            typeof currentNodeOrCollection.item === 'function'); // Check for NodeList-like
      if (isCollection) {
        for (let i = 0; i < currentNodeOrCollection.length; i++) {
          applyGlyphTransformationsToNodes(currentNodeOrCollection[i]);
        }
        return; // Exit after processing all items in the collection.
      }

      // Helper function to dynamically update the most appropriate text property of a node.
      const updateNodeContentProperty = function(elementToUpdate, transformationRoutine) {
        if (elementToUpdate.value !== undefined) { // For <input>, <textarea> elements.
          elementToUpdate.value = transformationRoutine(elementToUpdate.value);
        } else if (elementToUpdate.nodeValue !== undefined) { // For actual text nodes.
          elementToUpdate.nodeValue = transformationRoutine(elementToUpdate.nodeValue);
        } else if (elementToUpdate.innerHTML !== undefined) { // For general HTML content.
          elementToUpdate.innerHTML = transformationRoutine(elementToUpdate.innerHTML);
        }
      };

      // Apply the keyword-to-symbol transformation to the current node's content.
      updateNodeContentProperty(currentNodeOrCollection, convertKeywordsToUnicodeSymbols);
    };

    /**
     * Provides a robust fallback mechanism for `document.getElementsByClassName`
     * for browsers that do not natively support this method (e.g., IE8 and below).
     * @param {HTMLElement} searchBaseElement - The DOM element to begin the search from.
     * @param {string} classIdentifier - The specific class name to locate.
     * @returns {Array<HTMLElement>} An array containing all matching elements.
     */
    const retrieveElementsByClassFallback = function(searchBaseElement, classIdentifier) { // Renamed from ss_getElementsByClassName
      const foundElementsList = [];
      // Validate the `searchBaseElement` to ensure it's a usable DOM element.
      if (!searchBaseElement || typeof searchBaseElement.getElementsByTagName !== 'function') {
          console.warn("retrieveElementsByClassFallback: Invalid base element for class search.");
          return foundElementsList; // Return empty array on invalid input.
      }

      // Construct a regular expression to accurately match the class name,
      // ensuring it's a distinct class and not part of another class name.
      // Uses template literals for clarity.
      const classMatchingRegex = new RegExp(`(^|\\s)${classIdentifier}(\\s|$)`);

      // Retrieve all descendant elements from the base element.
      const allDescendantElements = searchBaseElement.getElementsByTagName("*");

      // Iterate through all found elements and check their `className` property.
      for (let i = 0, count = allDescendantElements.length; i < count; i++) {
        const currentHtmlElement = allDescendantElements[i];
        // Ensure the element has a `className` property before testing the regex.
        if (currentHtmlElement.className && classMatchingRegex.test(currentHtmlElement.className)) {
          foundElementsList.push(currentHtmlElement);
        }
      }
      return foundElementsList;
    };

    /**
     * Replaces specific keywords within a given text string with their
     * corresponding Unicode symbol representations as defined in the
     * `activeSymbolMapping` object.
     * @param {string} sourceTextContent - The string in which to perform replacements.
     * @returns {string} The modified string with keywords replaced by symbols.
     */
    const convertKeywordsToUnicodeSymbols = function(sourceTextContent) { // Renamed from ss_liga
      // Validate input: ensure `sourceTextContent` is a non-empty string.
      if (typeof sourceTextContent !== 'string' || sourceTextContent.length === 0) {
          return sourceTextContent; // Return original content if not a valid string.
      }
      // Ensure there's an active list of keywords to search for.
      if (!symbolTriggerKeywords || symbolTriggerKeywords.length === 0) {
          return sourceTextContent; // No keywords to replace.
      }

      // Construct a regular expression from the list of keywords.
      // The 'gi' flags ensure global, case-insensitive matching.
      const replacementPattern = new RegExp(`(${symbolTriggerKeywords.join('|')})`, "gi");

      // Perform the replacement using a callback function for each match.
      return sourceTextContent.replace(replacementPattern, function(matchedTerm) {
        // Convert the matched term to lowercase to ensure a consistent lookup key.
        const unicodeSymbol = activeSymbolMapping[matchedTerm.toLowerCase()];
        // Return the found symbol, or the original matched term if no symbol is defined.
        return unicodeSymbol || matchedTerm;
      });
    };

    // Once the DOM is ready, initiate the icon transformation process.
    onDomContentAvailable(function() {
      const targetClassName = 'ss-icon'; // The class name for elements to be processed.
      let elementsToTransform;

      // Prioritize the native `document.getElementsByClassName` for efficiency.
      if (document.getElementsByClassName) {
        elementsToTransform = document.getElementsByClassName(targetClassName);
      } else {
        // Fallback to custom implementation for unsupported browsers, searching from `document.body`.
        elementsToTransform = retrieveElementsByClassFallback(document.body, targetClassName);
      }

      // If any elements matching the target class are found, apply transformations.
      if (elementsToTransform && elementsToTransform.length > 0) {
        applyGlyphTransformationsToNodes(elementsToTransform);
      } else {
        // console.debug(`No elements with class '${targetClassName}' found for symbol transformation.`);
      }
    });

  } // End of if (typeof applyGlyphTransformationsToNodes === 'undefined')

  // --- Core Symbol and Keyword Data Management ---

  // A comprehensive mapping of symbolic names to their corresponding
  // Unicode glyph representations. This object serves as the master source.
  const symbolGlyphDefinitions = { // Renamed from ss_set
    'foursquare': '\uF690', 'googleplus': '\uF613', 'wordpress': '\uF621',
    'pinterest': '\uF650', 'posterous': '\uF623', 'instagram': '\uF641',
    'dribbble': '\uF660', 'linkedin': '\uF612', 'envelope': '\u2709',
    'facebook': '\uF610', 'twitter': '\uF611', 'blogger': '\uF622',
    'google+': '\uF613', 'behance': '\uF661', 'youtube': '\uF630',
    'tumblr': '\uF620', 'github': '\uF670', 'paypal': '\uF680',
    'flickr': '\uF640', 'skype': '\uF6A0', 'email': '\u2709',
    'vimeo': '\uF631', 'mail': '\u2709'
  };

  // Global variables that maintain the currently active symbol map
  // and the list of keywords used for text replacement.
  let activeSymbolMapping; // Renamed from ss_icons
  let symbolTriggerKeywords; // Renamed from ss_keywords

  /**
   * Initializes or extends the global symbol mapping and keyword list.
   * This function ensures that `activeSymbolMapping` and `symbolTriggerKeywords`
   * are correctly populated from `symbolGlyphDefinitions`, handling initial setup
   * and subsequent updates if the script is invoked multiple times.
   */
  const setupSymbolSystem = function() {
      // Determine if this is the first time the symbol system is being set up.
      // This check is more robust than the original's redundant `typeof` checks.
      const needsInitialSetup = (typeof activeSymbolMapping === 'undefined' || activeSymbolMapping === null ||
                                 typeof symbolTriggerKeywords === 'undefined' || symbolTriggerKeywords === null);

      if (needsInitialSetup) {
          activeSymbolMapping = {}; // Initialize as a fresh object.
          symbolTriggerKeywords = []; // Initialize as an empty array.
          // console.log("Symbol system initialized for the first time.");
      } else {
          // console.log("Symbol system is being extended with new definitions.");
      }

      // Iterate through the `symbolGlyphDefinitions` to populate the active map and keyword list.
      // Ensure `symbolGlyphDefinitions` is a valid object before proceeding.
      if (typeof symbolGlyphDefinitions === 'object' && symbolGlyphDefinitions !== null) {
          Object.keys(symbolGlyphDefinitions).forEach(function(keyName) {
              // Add or update the symbol in the active mapping.
              activeSymbolMapping[keyName] = symbolGlyphDefinitions[keyName];

              // Add the keyword to the list only if it's not already present,
              // to avoid duplicates, especially during extensions.
              if (symbolTriggerKeywords.indexOf(keyName) === -1) {
                  symbolTriggerKeywords.push(keyName);
              }
          });
      } else {
          console.error("Critical error: `symbolGlyphDefinitions` is not a valid object. Symbol system cannot be fully operational.");
      }

      // Optional optimization: Sorting keywords by length (descending) can improve
      // regex matching by ensuring longer, more specific keywords are matched first,
      // preventing partial matches by shorter, contained keywords.
      // symbolTriggerKeywords.sort((a, b) => b.length - a.length);
  };

  // Execute the symbol system setup process immediately.
  setupSymbolSystem();

} // End of the legacy browser compatibility check.