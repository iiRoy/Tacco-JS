const SEPARATOR_MARKER = '§'; // A unique placeholder to replace commas within :matches() arguments

class SelectorProcessor {
    constructor() {
        // No specific state needed for this processor instance.
        // The methods are largely pure or operate on passed data.
    }

    // Helper to check for nested forbidden pseudo-classes like :matches() or :not()
    // The input 'segmentContent' is expected to have SEPARATOR_MARKERs replaced back to commas
    static checkNestedPseudoClasses(segmentContent) {
        if (segmentContent.includes(':matches(') || segmentContent.includes(':not(')) {
            throw new Error(
                'Nesting of :matches(...) or :not(...) within :matches(...) is disallowed: ' +
                segmentContent
            );
        }
    }

    // Parses a single selector string into a structured representation.
    // The input 'expressionWithPlaceholders' is expected to have internal commas in :matches()
    // already replaced with SEPARATOR_MARKERs.
    // Example: 'div:matches(a§b) > :matches(c§d)' -> ['div', ['a','b'], ' > ', ['c','d']]
    extractStructuralSegments(expressionWithPlaceholders) {
        const structuralSegments = [];
        let cursorPosition = 0;
        let lastMatchEndingPosition = -1; // To detect sequential :matches() pseudo-classes

        // Use a non-global regex to find each instance of :matches(
        const pseudoMatcher = /:matches\(/g;
        let currentPseudoMatch;

        while ((currentPseudoMatch = pseudoMatcher.exec(expressionWithPlaceholders)) !== null) {
            const currentMatchStart = currentPseudoMatch.index;
            // Add any plain string part preceding the :matches()
            if (currentMatchStart > cursorPosition) {
                structuralSegments.push(expressionWithPlaceholders.substring(cursorPosition, currentMatchStart));
            }

            // Check for sequential :matches() pseudo-classes
            if (currentMatchStart === lastMatchEndingPosition) {
                 throw new Error(
                    'Consecutive :matches pseudo-classes are not allowed: ' +
                    expressionWithPlaceholders.replace(new RegExp(SEPARATOR_MARKER, 'g'), ',')
                );
            }
            // Update lastMatchEndingPosition after parsing the current :matches block
            // This will be set below after finding the closing parenthesis

            // Find the corresponding closing parenthesis for the current :matches(...)
            let parenthesisDepth = 1; // Starts at 1 because we just found the opening '(' of :matches(
            let searchIndex = currentMatchStart + ':matches('.length;
            while (searchIndex < expressionWithPlaceholders.length && parenthesisDepth > 0) {
                if (expressionWithPlaceholders[searchIndex] === '(') {
                    parenthesisDepth++;
                } else if (expressionWithPlaceholders[searchIndex] === ')') {
                    parenthesisDepth--;
                }
                searchIndex++;
            }

            if (parenthesisDepth !== 0) {
                throw new Error('Unclosed :matches() pseudo-class in selector: ' + expressionWithPlaceholders);
            }

            const innerContent = expressionWithPlaceholders.substring(currentMatchStart + ':matches('.length, searchIndex - 1);
            // Check for forbidden nesting within the content, reverting placeholders for clearer error message
            SelectorProcessor.checkNestedPseudoClasses(innerContent.replace(new RegExp(SEPARATOR_MARKER, 'g'), ','));

            // Split the content by the placeholder to get the individual alternatives
            const alternatives = innerContent.split(new RegExp(SEPARATOR_MARKER, 'g')).map(s => s.trim());
            structuralSegments.push(alternatives);

            cursorPosition = searchIndex;
            lastMatchEndingPosition = searchIndex; // Update for the next check of sequential matches
            pseudoMatcher.lastIndex = cursorPosition; // Continue search from after this match
        }

        // Add any remaining plain string part after the last :matches()
        if (cursorPosition < expressionWithPlaceholders.length) {
            structuralSegments.push(expressionWithPlaceholders.substring(cursorPosition));
        }

        return structuralSegments;
    }

    // Generates all possible expanded selector strings from the parsed structural segments.
    // This implements an iterative cartesian product algorithm.
    generateCombinations(segments) {
        let currentResultingSelectors = ['']; // Start with an empty string as the base for combinations

        for (const segment of segments) {
            if (Array.isArray(segment)) { // This segment represents a :matches() group with alternatives
                const nextResultingSelectors = [];
                for (const existingSelectorFragment of currentResultingSelectors) {
                    for (const alternativeOption of segment) {
                        nextResultingSelectors.push(existingSelectorFragment + alternativeOption);
                    }
                }
                currentResultingSelectors = nextResultingSelectors;
            } else { // This segment is a plain string part of the selector
                currentResultingSelectors = currentResultingSelectors.map(selectorFragment => selectorFragment + segment);
            }
        }
        return currentResultingSelectors;
    }

    // Main entry point to process a stylesheet object, traversing its rules.
    transformStylesheet(stylesheetObject) {
        this.processRuleGroup(stylesheetObject.rules);
        return stylesheetObject;
    }

    // Recursively processes a list of CSS rules.
    processRuleGroup(ruleCollection) {
        for (const currentRule of ruleCollection) {
            if (currentRule.rules) { // Handle nested rule groups (e.g., @media queries)
                this.processRuleGroup(currentRule.rules);
            }

            if (currentRule.selectors && currentRule.selectors.length > 0) {
                // Step 1: Normalize selector strings. Join them, replace internal commas
                // within :matches() with a placeholder, then split back into individual selectors.
                // This prepares the selectors for detailed parsing.
                const joinedSelectors = currentRule.selectors.join(',');
                const selectorsWithMarkers = joinedSelectors.replace(/:matches\((.*?)\)/g, (entireMatch) => {
                    // Extract content inside parentheses, non-greedy.
                    const contentPart = entireMatch.substring(':matches('.length, entireMatch.length - 1);
                    // Replace all commas in the content with our unique SEPARATOR_MARKER
                    const markedContent = contentPart.replace(/,/g, SEPARATOR_MARKER);
                    // Reconstruct the :matches() block with marked content
                    return `:matches(${markedContent})`;
                });

                const normalizedSelectorStrings = selectorsWithMarkers.split(',');

                const expandedAndFilteredSelectors = [];
                for (const singleNormalizedSelector of normalizedSelectorStrings) {
                    // Check if the current selector contains any :matches() pseudo-classes
                    if (singleNormalizedSelector.includes(':matches(')) {
                        const parsedStructure = this.extractStructuralSegments(singleNormalizedSelector);
                        const generatedExpandedForms = this.generateCombinations(parsedStructure);
                        expandedAndFilteredSelectors.push(...generatedExpandedForms);
                    } else {
                        // If no :matches(), add the selector as is, but revert any placeholder markers
                        // that might have been introduced if it was part of a broader string.
                        expandedAndFilteredSelectors.push(singleNormalizedSelector.replace(new RegExp(SEPARATOR_MARKER, 'g'), ','));
                    }
                }
                currentRule.selectors = expandedAndFilteredSelectors;
            }
        }
    }
}

// The module export structure mimics the original: a function that returns
// another function which takes a 'style' object and processes it.
module.exports = function() {
    const selectorExpansionEngine = new SelectorProcessor();
    return function(style) {
        return selectorExpansionEngine.transformStylesheet(style);
    };
};