(function() {

    // Centralized collection of core application services and utilities.
    const serviceHub = {
        applicationLogger: Meeko.logger, // Renamed logger for application-specific logging.
        dataProcessingTools: Meeko.stuff, // Renamed '_' to dataProcessingTools for clearer purpose.
        domInteractionKit: Meeko.DOM, // Renamed DOM to domInteractionKit.
        urlManipulationEngine: Meeko.DOM.URL // Renamed URL to urlManipulationEngine.
    };

    // Destructure frequently used services for immediate access.
    const { applicationLogger, dataProcessingTools, domInteractionKit, urlManipulationEngine } = serviceHub;
    const { $id: retrieveElementById, $$: selectAllElements, tagName: fetchTagName } = domInteractionKit;

    // Establish the foundational URL for resolving relative paths.
    // Includes a safeguard for environments where 'document' or 'document.URL' might be absent.
    const basePageUrl = (document && document.URL) ? urlManipulationEngine(document.URL) : urlManipulationEngine('about:blank');

    /**
     * Transforms an array-like structure (e.g., NodeList, HTMLCollection) into a standard JavaScript Array.
     * This is useful for enabling array methods on live collections.
     * @param {ArrayLike<T>|null|undefined} collectionToConvert - The collection to process.
     * @returns {Array<T>} A fresh Array instance containing the collection's elements, or an empty array if input is null/undefined.
     * @template T
     */
    const convertToArrayFromCollection = (collectionToConvert) => Array.from(collectionToConvert || []);

    // A utility function to standardize string inputs for case-insensitive and whitespace-agnostic comparisons.
    const sanitizeStringForComparison = (inputString) => dataProcessingTools.lc(dataProcessingTools.trim(inputString || ''));

    // Determines if a given 'rel' attribute value signifies a theme-related link.
    const indicatesThemeLinkRelation = (relAttributeValue) => /^\s*SITE-THEME-DOC\s*$/i.test(relAttributeValue);

    // Primary configuration block for WebFlow's theme decoration system.
    Meeko.decor.config({
        /*
         * This module has been updated to use a `resolveThemeDocumentPath` function instead of the legacy `detect` option.
         * The `resolveThemeDocumentPath` is responsible for dynamically identifying the most appropriate theme URL
         * based on various contextual factors of the current web page.
         *
         * Key considerations for theme path resolution include:
         *  - The user's device type or current browser window dimensions to optimize for responsive layouts.
         *  - Browser compatibility checks to offer a fallback or simplified theme for older browsers.
         *  - User preferences, potentially retrieved from cookies or localStorage, which can enable
         *    A/B testing of different themes or personalized user experiences.
         */
        resolveThemeDocumentPath: (pageContextDocument) => {
            const potentialThemeUrl = findApplicableThemeResourceUrl(pageContextDocument);
            if (!potentialThemeUrl) {
                applicationLogger.warn("Theme system could not identify a suitable theme resource URL for this page. Operating without specific theming.");
                return null; // Explicitly return null if no theme URL is found.
            }
            applicationLogger.debug(`Theme resource URL successfully identified: ${potentialThemeUrl}`);
            return potentialThemeUrl;
        }
    });

    // Configuration for WebFlow's page transition and content management system.
    Meeko.panner.config({
        /**
         * Standardizes the document's content by systematically removing specific fallback or legacy elements.
         * This ensures that only relevant content for the active theme is displayed.
         * @param {Document} targetDocumentInstance - The document whose content requires standardization.
         * @param {object} transitionMetadata - Contains request-specific details, such as `url` and `method`.
         */
        standardizeDocumentContent: (targetDocumentInstance, transitionMetadata) => {
            // The designated flag for elements intended as fallbacks in the absence of a theme.
            const fallbackStyleDesignator = 'no-webflow-theme';
            const documentHeadSection = targetDocumentInstance.head;

            // Implement a crucial guard clause: exit if the document's head is not available.
            if (!documentHeadSection) {
                applicationLogger.error("Content standardization aborted: Document head element is inaccessible or missing.");
                return;
            }

            // Create a static array of head children to safely iterate while removing elements.
            const currentHeadChildren = convertToArrayFromCollection(documentHeadSection.childNodes);

            currentHeadChildren.forEach(childElement => {
                // Process only actual element nodes, ignoring text nodes, comments, etc.
                if (childElement.nodeType !== Node.ELEMENT_NODE) {
                    return;
                }

                const elementTag = fetchTagName(childElement);
                let needsRemoval = false;

                // Target <style> and <link> elements that carry the fallback designator.
                if (elementTag === "style" || elementTag === "link") {
                    const elementTitleAttribute = childElement.getAttribute('title');
                    // Perform a robust comparison using the sanitized strings.
                    if (elementTitleAttribute && sanitizeStringForComparison(elementTitleAttribute) === fallbackStyleDesignator) {
                        needsRemoval = true;
                    }
                }

                // If the element is marked for removal, detach it from the document head.
                if (needsRemoval) {
                    applicationLogger.info(`Removing identified fallback element: <${elementTag} title="${childElement.getAttribute('title') || 'N/A'}"> from head.`);
                    documentHeadSection.removeChild(childElement);
                }
            });

            // This section is reserved for additional, custom content standardization logic.
            // Developers can insert their specific document adjustments here.
            applicationLogger.debug(`Document content standardization successfully completed for: ${transitionMetadata.url}`);
            // Example: Dynamically append a global metadata tag or a custom script.
            // const metaTag = targetDocumentInstance.createElement('meta');
            // metaTag.setAttribute('name', 'webflow-processed');
            // documentHeadSection.appendChild(metaTag);
        },

        // Default duration for page transition animations, in milliseconds.
        // A non-zero value provides a smoother user experience.
        transitionAnimationDurationMs: 300,

        // Lifecycle callbacks for handling element visibility during page transitions.
        // These can be customized by individual theme documents for bespoke effects.
        elementRemovedFromDOM: {
            before: hideElementVisually, // Prior to removal, ensure the element is visually hidden.
            after: showElementVisually // Post-removal (or during subsequent insertions), ensure visibility.
        },
        elementInsertedIntoDOM: {
            before: hideElementVisually, // Prior to insertion, keep the element hidden.
            after: showElementVisually // After insertion, make the element visible.
        },
        pageTransitionOut: {
            before: executeNoOperation, // No specific action required before a page exits.
            after: executeNoOperation // No specific action required after a page exits.
        },
        pageTransitionIn: {
            before: executeNoOperation, // No specific action required before a page enters.
            after: executeNoOperation // No specific action required after a page enters.
        }
    });

    /**
     * Identifies and returns the absolute URL for the theme document based on the current page's context.
     * This function is pivotal for ensuring the correct theme is loaded.
     * @param {Document} contextDocument - The document instance to be analyzed for theme links.
     * @returns {string|null} The fully resolved absolute URL of the theme document, or null if no suitable link is found.
     */
    function findApplicableThemeResourceUrl(contextDocument) {
        const primaryThemeLinkElement = locateBestThemeLinkElement(contextDocument);
        if (!primaryThemeLinkElement) {
            return null; // If no theme link is found, return null immediately.
        }

        const resourceHrefPath = primaryThemeLinkElement.getAttribute("href");
        // Essential validation: ensure the 'href' attribute is actually present.
        if (!resourceHrefPath) {
            applicationLogger.warn("A potential theme link element was found, but it lacks a valid 'href' attribute.");
            return null;
        }

        // Attempt to resolve the potentially relative URL against the established base page URL.
        // This guarantees an absolute URL is consistently returned.
        try {
            const absoluteResolvedThemeUrl = basePageUrl.resolve(resourceHrefPath);
            return absoluteResolvedThemeUrl;
        } catch (error) {
            applicationLogger.error(`Error encountered while resolving theme URL '${resourceHrefPath}': ${error.message}`);
            return null;
        }
    }

    /**
     * Scans the document's head for `<link>` elements that designate a theme document.
     * It employs a scoring mechanism to prioritize links based on their media queries and MIME types.
     * @param {Document} documentToSearch - The document instance to be inspected.
     * @returns {HTMLLinkElement|null} The most appropriate HTMLLinkElement for the theme, or null if none are found.
     */
    function locateBestThemeLinkElement(documentToSearch) {
        const documentHeadSection = documentToSearch.head;
        // Guard clause: if the document head is missing, no links can be found.
        if (!documentHeadSection) {
            applicationLogger.debug("Document head not available; unable to search for theme links.");
            return null;
        }

        let topScoringLink = null;
        let maximumScoreAchieved = -1; // Initialize with a value lower than any possible valid score.

        // Retrieve all `<link>` elements present within the document's head.
        const candidateLinkElements = selectAllElements("link", documentHeadSection);

        // Iterate through each candidate link, evaluating its suitability.
        for (const currentCandidate of convertToArrayFromCollection(candidateLinkElements)) {
            // Ensure we are processing an actual DOM element node.
            if (currentCandidate.nodeType !== Node.ELEMENT_NODE) {
                continue;
            }

            const linkRelationAttribute = currentCandidate.getAttribute('rel');
            // Filter out links that do not explicitly indicate a theme relation.
            if (!indicatesThemeLinkRelation(linkRelationAttribute)) {
                continue;
            }

            const linkMimeType = sanitizeStringForComparison(currentCandidate.getAttribute('type') || '');
            let currentLinkScore = 0;

            // Award points for valid HTML theme document types.
            if (linkMimeType === "text/html" || linkMimeType === "") {
                currentLinkScore += 1; // Base score for a recognized type.
            } else {
                applicationLogger.warn(`Theme link rejected due to unsupported MIME type: '${linkMimeType}' for rel='${linkRelationAttribute}'.`);
                continue; // Skip this link if its type is not appropriate.
            }

            const mediaQueryString = currentCandidate.getAttribute("media");
            if (mediaQueryString) {
                // Verify browser support for `matchMedia` and evaluate the query.
                if (window.matchMedia && window.matchMedia(mediaQueryString).matches) {
                    currentLinkScore += 2; // Significant bonus for a matching media query.
                } else {
                    applicationLogger.debug(`Theme link '${currentCandidate.getAttribute('href')}' dismissed: media query '${mediaQueryString}' did not match or 'matchMedia' API is unavailable.`);
                    continue; // Disregard links whose media queries don't match or cannot be evaluated.
                }
            }

            // If the current link's score surpasses the highest score recorded so far,
            // it becomes the new best candidate.
            if (currentLinkScore > maximumScoreAchieved) {
                maximumScoreAchieved = currentLinkScore;
                topScoringLink = currentCandidate;
            }
        }
        return topScoringLink;
    }

    /**
     * Applies a visual concealment effect to a given DOM element by adding a specific CSS class.
     * This method is part of the transition effects API.
     * @param {object} payloadObject - An object expected to contain a 'node' property referencing the DOM element.
     */
    function hideElementVisually(payloadObject) {
        // Validate that the payload contains a valid Element instance.
        if (payloadObject && payloadObject.node instanceof Element) {
            payloadObject.node.classList.add("webflow-concealed-state");
            applicationLogger.debug(`Element concealed:`, payloadObject.node);
        } else {
            applicationLogger.debug("Attempted to conceal an invalid or non-existent DOM node.");
        }
    }

    /**
     * Reverses the visual concealment of a DOM element by removing its dedicated CSS class.
     * This method is part of the transition effects API.
     * @param {object} payloadObject - An object expected to contain a 'node' property referencing the DOM element.
     */
    function showElementVisually(payloadObject) {
        // Validate that the payload contains a valid Element instance.
        if (payloadObject && payloadObject.node instanceof Element) {
            payloadObject.node.classList.remove("webflow-concealed-state");
            applicationLogger.debug(`Element revealed:`, payloadObject.node);
        } else {
            applicationLogger.debug("Attempted to reveal an invalid or non-existent DOM node.");
        }
    }

    /**
     * A utility function that performs no operation. It serves as a placeholder for
     * lifecycle hooks where no specific action is required.
     * @param {any} incomingData - Any data passed to this function is intentionally ignored.
     */
    const executeNoOperation = (incomingData) => { /* This function is designed to do nothing. */ };

})();