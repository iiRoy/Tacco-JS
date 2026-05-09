(function (jq) {
    "use strict";
    // This script augments core JavaScript prototypes and provides a jQuery plugin for content sanitization.

    // Enhances the String prototype to replicate a string a specified number of times.
    // @param {number} timesToRepeat - The quantity of repetitions for the string.
    // @returns {string} A new string consisting of the original string repeated.
    String.prototype.replicateString = function (timesToRepeat) {
        if (typeof timesToRepeat !== 'number' || timesToRepeat < 0) {
            console.warn("Invalid repetition count provided. Defaulting to 0.");
            return '';
        }
        return Array.from({ length: timesToRepeat }, () => this.toString()).join('');
    };

    // Extends the Array prototype to return a new array containing only the distinct elements.
    // This method removes duplicate entries, preserving the order of first appearance (conceptually).
    // @returns {Array} A new array with all duplicate elements removed.
    Array.prototype.getDistinctElements = function () {
        // Modern and efficient way to obtain unique elements using a Set.
        // This is a significant rewrite for performance and clarity.
        return Array.from(new Set(this));
    };

    // Standard configuration for the content sanitization module.
    // These settings can be overridden by user-provided options.
    var moduleConfiguration = {
        substitutionPattern: '#', // Default character(s) to replace censored words with. Can be a string or array of chars.
        userProvidedTerms: null, // Custom list of words to censor, supplied by the user.
        remoteWordListUrl: null // URL to an external JSON file containing additional words to censor.
    };

    // jQuery plugin for sanitizing textual content within selected elements.
    // It identifies and replaces specified "forbidden" terms with a chosen substitution pattern.
    // @param {object} userOptions - An object containing user-defined configuration settings.
    // @returns {jQuery} The jQuery object, allowing for method chaining.
    jq.fn.contentSanitizer = function (userOptions) {

        // Merge default settings with user-provided options to create the active configuration.
        var activeConfiguration = jq.extend(true, {}, moduleConfiguration, userOptions);

        // Utility function to check if browser's localStorage is available and functional.
        // This is an IIFE that runs once to determine localStorage capability.
        var isLocalDataAvailable = (function() {
              const testKey = 'storageTestKey';
              try {
                localStorage.setItem(testKey, testKey);
                localStorage.removeItem(testKey);
                return true;
              } catch(e) {
                console.warn("Local storage is not available or accessible:", e);
                return false;
              }
        })();

        // Recursively traverses a DOM element to collect all its direct text node descendants.
        // @param {HTMLElement} rootNode - The parent DOM element to start traversal from.
        // @returns {Array<Text>} An array of text nodes found within the rootNode.
        function extractLeafTextNodes(rootNode) {
            if (!rootNode || rootNode.nodeType !== 1) { // Guard clause for invalid rootNode
                console.error("Invalid root node provided for text extraction.");
                return [];
            }

            let processedNodes = []; // Nodes that have been identified as text nodes.
            let nodesToProcess = Array.from(rootNode.childNodes); // Nodes currently being considered.

            // Iterative approach to traverse the DOM tree.
            while (nodesToProcess.length > 0) {
                let currentNode = nodesToProcess.shift(); // Get the next node from the front.

                // Check node type: 1 for element, 3 for text.
                if (currentNode.nodeType === 1) {
                    // If it's an element, add its children to the front of the queue for processing.
                    // This ensures a depth-first-like traversal (or breadth-first depending on shift/unshift).
                    // Using unshift with spread for better performance than apply for large arrays.
                    nodesToProcess.unshift(...Array.from(currentNode.childNodes));
                } else if (currentNode.nodeType === 3) {
                    // If it's a text node, add it to our collection.
                    processedNodes.push(currentNode);
                }
            }
            return processedNodes;
        }

        // Synchronously fetches and parses JSON data from a given URL.
        // This is a blocking call, primarily for initial setup or small data.
        // @param {string} jsonPath - The URL path to the JSON resource.
        // @returns {object|null} The parsed JSON object, or null if an error occurs.
        function fetchJsonResourceSynchronously(jsonPath) {
            const xhrRequest = new XMLHttpRequest();
            xhrRequest.open('GET', jsonPath, false); // `false` makes the request synchronous.
            xhrRequest.setRequestHeader('X-Requested-With', 'XMLHttpRequest'); // Standard header for XHR.
            xhrRequest.send(null);

            if (xhrRequest.status === 200) {
                try {
                    return JSON.parse(xhrRequest.responseText);
                } catch (jsonError) {
                    console.error(`Failed to parse JSON from ${jsonPath}:`, jsonError);
                    return null;
                }
            } else {
                console.error(`Failed to fetch JSON from ${jsonPath}. Status: ${xhrRequest.status} ${xhrRequest.statusText}`);
                return null;
            }
        }

        // Generates a random integer within a specified upper bound (exclusive).
        // This version is simplified to just produce a random index without complex non-repeating logic.
        // @param {number} upperLimit - The exclusive upper bound for the random number.
        // @returns {number} A random integer between 0 (inclusive) and upperLimit (exclusive).
        function produceRandomIndex(upperLimit) {
            if (upperLimit <= 0) {
                return 0; // Handle edge case for non-positive upper limits.
            }
            return Math.floor(Math.random() * upperLimit);
        }


        return this.each(function () {
            let forbiddenTerms = []; // The final compiled list of words to censor.
            let textNodes = extractLeafTextNodes(this); // All text nodes within the current element.

            // --- Logic to compile the list of forbidden terms ---

            // Check if external words are configured.
            if (activeConfiguration.remoteWordListUrl) {
                let remoteWords = null;
                const localStorageKey = 'cachedRemoteWords'; // Key for local storage.

                if (isLocalDataAvailable) {
                    let cachedData = localStorage.getItem(localStorageKey);
                    if (cachedData) {
                        try {
                            remoteWords = JSON.parse(cachedData);
                        } catch (parseErr) {
                            console.error("Error parsing cached remote words, refetching:", parseErr);
                            localStorage.removeItem(localStorageKey); // Clear corrupted cache.
                            remoteWords = fetchJsonResourceSynchronously(activeConfiguration.remoteWordListUrl);
                            if (remoteWords) {
                                localStorage.setItem(localStorageKey, JSON.stringify(remoteWords));
                            }
                        }
                    } else {
                        // No cached data, fetch and store.
                        remoteWords = fetchJsonResourceSynchronously(activeConfiguration.remoteWordListUrl);
                        if (remoteWords) {
                            localStorage.setItem(localStorageKey, JSON.stringify(remoteWords));
                        }
                    }
                } else {
                    // Local storage not available, fetch directly.
                    remoteWords = fetchJsonResourceSynchronously(activeConfiguration.remoteWordListUrl);
                }

                if (remoteWords && Array.isArray(remoteWords)) {
                    forbiddenTerms = forbiddenTerms.concat(remoteWords);
                } else if (remoteWords) {
                    console.warn("Remote word list is not an array:", remoteWords);
                }
            }

            // Add user-provided terms if they exist.
            if (activeConfiguration.userProvidedTerms && Array.isArray(activeConfiguration.userProvidedTerms)) {
                forbiddenTerms = forbiddenTerms.concat(activeConfiguration.userProvidedTerms);
            } else if (activeConfiguration.userProvidedTerms) {
                console.warn("User-provided terms are not an array:", activeConfiguration.userProvidedTerms);
            }

            // Ensure the final list is unique and not empty.
            forbiddenTerms = forbiddenTerms.getDistinctElements();

            // Early exit if no words to censor.
            if (forbiddenTerms.length === 0) {
                // console.log("No forbidden terms configured. Skipping sanitization.");
                return;
            }

            // --- Prepare the substitution characters ---
            let replacementChars;
            if (typeof activeConfiguration.substitutionPattern === 'string' && activeConfiguration.substitutionPattern.length > 0) {
                replacementChars = activeConfiguration.substitutionPattern.split('');
            } else if (Array.isArray(activeConfiguration.substitutionPattern) && activeConfiguration.substitutionPattern.length > 0) {
                replacementChars = activeConfiguration.substitutionPattern;
            } else {
                console.warn("Invalid or empty substitution pattern. Defaulting to '*'.");
                replacementChars = ['*']; // Fallback to a default character.
            }

            // --- Main loop for censoring content ---
            for (let nodeIterator = 0; nodeIterator < textNodes.length; nodeIterator++) {
                const currentTextNode = textNodes[nodeIterator];
                if (!currentTextNode || !currentTextNode.nodeValue) {
                    continue; // Skip invalid or empty text nodes.
                }

                let currentText = currentTextNode.nodeValue;

                for (let termIndex = 0; termIndex < forbiddenTerms.length; termIndex++) {
                    const termToCensor = forbiddenTerms[termIndex];
                    if (!termToCensor || typeof termToCensor !== 'string' || termToCensor.length === 0) {
                        continue; // Skip invalid terms.
                    }

                    // Create a regular expression for the current term, ensuring whole word matching.
                    // 'gi' for global (all occurrences) and case-insensitive.
                    const regexPattern = new RegExp('\\b' + termToCensor.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'gi');

                    // If the current text contains the term, perform replacement.
                    if (regexPattern.test(currentText)) {
                        // Select a random character from the available replacement characters.
                        const selectedCharIdx = produceRandomIndex(replacementChars.length);
                        const chosenReplacementChar = replacementChars[selectedCharIdx];

                        // Create the full replacement string, replicating the chosen character.
                        // This ensures the censored word maintains its original length.
                        const replacementString = chosenReplacementChar.replicateString(termToCensor.length);

                        // Replace all occurrences of the term in the text node's value.
                        currentText = currentText.replace(regexPattern, replacementString);
                    }
                }
                currentTextNode.nodeValue = currentText; // Update the DOM with the sanitized text.
            }
        });
    };
})(jQuery);