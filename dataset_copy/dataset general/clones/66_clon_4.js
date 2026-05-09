(function (globalRecipient) {
    "use strict";

    // Helper: replicateString (replaces String.prototype.repeat)
    const replicateString = (textComponent, repetitionCount) => {
        if (repetitionCount <= 0) return '';
        if (repetitionCount === 1) return textComponent;
        const halfCount = Math.floor(repetitionCount / 2);
        const firstHalf = replicateString(textComponent, halfCount);
        const secondHalf = replicateString(textComponent, repetitionCount - halfCount);
        return firstHalf + secondHalf;
    };

    // Helper: deduplicateElements (replaces Array.prototype.unique)
    const deduplicateElements = (collectionInput) => {
        return Array.from(new Set(collectionInput));
    };

    // Helper: isStorageFunctional (replaces localStorageIsEnabled)
    const isStorageFunctional = (() => {
        let storageAvailabilityStatus = false;
        try {
            const testItemKey = 'storage_probe_key_123';
            localStorage.setItem(testItemKey, testItemKey);
            storageAvailabilityStatus = localStorage.getItem(testItemKey) === testItemKey;
            localStorage.removeItem(testItemKey);
        } catch (errorDetails) { /* Local storage not accessible */ }
        return storageAvailabilityStatus;
    })();

    // Helper: retrieveAllTextSegments (replaces allTextNodes)
    const retrieveAllTextSegments = (rootNode) => {
        const collectedTextNodes = [];
        const processNodeRecursively = (currentNode) => {
            if (currentNode.nodeType === Node.TEXT_NODE) {
                collectedTextNodes.push(currentNode);
            } else if (currentNode.nodeType === Node.ELEMENT_NODE) {
                Array.from(currentNode.childNodes).forEach(processNodeRecursively);
            }
        };
        processNodeRecursively(rootNode);
        return collectedTextNodes;
    };

    // Helper: acquireDataFromSource (replaces readJsonFromController)
    const acquireDataFromSource = async (dataSourcePath) => {
        try {
            const networkResponse = await fetch(dataSourcePath);
            if (!networkResponse.ok) {
                throw new Error(`Network issue! HTTP Status: ${networkResponse.status}`);
            }
            return await networkResponse.json();
        } catch (fetchError) {
            console.error("Data acquisition failed:", fetchError);
            return []; // Return empty array on error, matching original's behavior for JSON parsing failure
        }
    };

    // Helper: createVariedIndexProducer (replaces generateRandomNumber)
    const createVariedIndexProducer = (upperBoundExclusive) => {
        let lastGeneratedIndex = null;
        return () => {
            let currentGeneratedIndex;
            if (upperBoundExclusive <= 0) return 0; // Handle cases where there's only one or no option
            do {
                currentGeneratedIndex = Math.floor(Math.random() * upperBoundExclusive);
            } while (currentGeneratedIndex === lastGeneratedIndex);
            lastGeneratedIndex = currentGeneratedIndex;
            return currentGeneratedIndex;
        };
    };

    // Default configuration (replaces defaults)
    const initialConfiguration = {
        obscuringCharacter: '*', // Renamed from replaceWith
        supplementaryTerms: null, // Renamed from customSwears
        remoteWordlistUrl: null    // Renamed from externalSwears
    };

    // Main content sanitization module (replaces $.fn.profanityFilter)
    const performContentSanitization = async (targetDomElement, userProvidedOptions) => {
        const activeConfiguration = { ...initialConfiguration, ...userProvidedOptions };

        let forbiddenVocabulary = [];

        if (activeConfiguration.remoteWordlistUrl) {
            if (isStorageFunctional) {
                const cacheIdentifier = 'sanitizer_word_cache';
                let cachedWordlist = localStorage.getItem(cacheIdentifier);
                if (!cachedWordlist) {
                    const fetchedWordlist = await acquireDataFromSource(activeConfiguration.remoteWordlistUrl);
                    localStorage.setItem(cacheIdentifier, JSON.stringify(fetchedWordlist));
                    forbiddenVocabulary = fetchedWordlist;
                } else {
                    forbiddenVocabulary = JSON.parse(cachedWordlist);
                }
            } else {
                forbiddenVocabulary = await acquireDataFromSource(activeConfiguration.remoteWordlistUrl);
            }

            if (activeConfiguration.supplementaryTerms) {
                forbiddenVocabulary = deduplicateElements([...forbiddenVocabulary, ...activeConfiguration.supplementaryTerms]);
            }
        } else if (activeConfiguration.supplementaryTerms) {
            forbiddenVocabulary = activeConfiguration.supplementaryTerms;
        }

        if (!forbiddenVocabulary || forbiddenVocabulary.length === 0) {
            return; // No words to filter, exit
        }

        const domTextSegments = retrieveAllTextSegments(targetDomElement);
        const getObscuringCharIndex = createVariedIndexProducer(activeConfiguration.obscuringCharacter.length);

        domTextSegments.forEach(currentSegment => {
            forbiddenVocabulary.forEach(prohibitedPhrase => {
                const searchPattern = new RegExp(`\\b${prohibitedPhrase}\\b`, 'gi');

                if (searchPattern.test(currentSegment.nodeValue)) {
                    let finalObscuration;
                    const chosenCharPosition = getObscuringCharIndex();
                    const chosenChar = activeConfiguration.obscuringCharacter[chosenCharPosition];

                    if (typeof activeConfiguration.obscuringCharacter === 'string') {
                        finalObscuration = replicateString(chosenChar, prohibitedPhrase.length);
                    } else {
                        // Assumes obscuringCharacter can be an array of strings as per original's logic
                        finalObscuration = activeConfiguration.obscuringCharacter[chosenCharPosition];
                    }
                    
                    currentSegment.nodeValue = currentSegment.nodeValue.split(searchPattern).join(finalObscuration);
                }
            });
        });
    };

    // Expose the main function on a global object to mimic plugin availability
    globalRecipient.ContentProcessor = globalRecipient.ContentProcessor || {};
    globalRecipient.ContentProcessor.sanitizeText = performContentSanitization;

})(window);