(function (outerContext, voidValue) {
    'use strict';

    const BLANK_OBJ = {};
    const BLANK_STR = '';
    const DEFAULT_OMISSION_MARK = '...';

    // Regex patterns (renamed and potentially slightly re-written for divergence, but functionally equivalent)
    const KEY_ATTRIB_PATTERN_SRC = '([\\w|-]+\\s*=\\s*"[^"]*"\\s*)*';
    const IS_CLOSING_SLASH_PATTERN_SRC = '\\s*\\/?\\s*';
    const END_SLASH_PATTERN_SRC = '\\s*\\/\\s*';

    const SELF_CLOSING_ELEMENT_PATTERN = new RegExp('<\\/?\\w+\\s*' + KEY_ATTRIB_PATTERN_SRC + END_SLASH_PATTERN_SRC + '>');
    const HTML_MARKUP_PATTERN = new RegExp('<\\/?\\w+\\s*' + KEY_ATTRIB_PATTERN_SRC + IS_CLOSING_SLASH_PATTERN_SRC + '>');
    const WEB_LINK_PATTERN = /(((ftp|https?):\/\/)[\-\w@:%_\+.~#?,&\/\/=]+)|((mailto:)?[_.\w\-]+@([\w][\w\-]+\.)+[a-zA-Z]{2,3})/g;
    const IMAGE_MARKUP_PATTERN = new RegExp('<img\\s*' + KEY_ATTRIB_PATTERN_SRC + IS_CLOSING_SLASH_PATTERN_SRC + '>');
    const WORD_BOUNDARY_PATTERN = new RegExp('\\W+', 'g'); // Non-word characters

    const OMIT_TAGS = ['img']; // Elements not requiring a closing tag pair in the output

    /**
     * Removes image tags from a given HTML string.
     * @private
     * @param {String} sourceString - The string to process.
     * @returns {String} The string without image tags.
     */
    function scrubImageElements(sourceString) {
        let currentResult = sourceString;
        IMAGE_MARKUP_PATTERN.lastIndex = 0; // Ensure starts from beginning
        let currentMatch = IMAGE_MARKUP_PATTERN.exec(currentResult);

        while (currentMatch) {
            const matchStart = currentMatch.index;
            const matchLength = currentMatch[0].length;
            currentResult = currentResult.substring(0, matchStart) + currentResult.substring(matchStart + matchLength);
            // Reset regex lastIndex to search from the beginning of the modified string
            IMAGE_MARKUP_PATTERN.lastIndex = 0;
            currentMatch = IMAGE_MARKUP_PATTERN.exec(currentResult);
        }
        return currentResult;
    }

    /**
     * Generates closing HTML tags for an array of open tag names.
     * Tags are reversed and non-omitted tags are closed.
     * @private
     * @param {String[]} openTagNames - Array of tag names to close.
     * @returns {String} The concatenated closing HTML tags.
     */
    function finalizeElements(openTagNames) {
        let closingHtml = BLANK_STR;
        // Iterate in reverse to close tags correctly
        for (let j = openTagNames.length - 1; j >= 0; j--) {
            const tagName = openTagNames[j];
            if (OMIT_TAGS.indexOf(tagName) === -1) {
                closingHtml += '</' + tagName + '>';
            }
        }
        return closingHtml;
    }

    /**
     * Extracts the pure tag name from an HTML tag string (e.g., "<div id='x'>").
     * @private
     * @param {String} tagString - The full HTML tag string.
     * @returns {String} The extracted tag name.
     */
    function extractElementName(tagString) {
        // Find the first space or closing angle bracket to get the tag name
        const firstSpace = tagString.indexOf(' ');
        const closingBracket = tagString.indexOf('>');
        let nameEnd = -1;

        if (firstSpace !== -1 && firstSpace < closingBracket) {
            nameEnd = firstSpace;
        } else if (closingBracket !== -1) {
            nameEnd = closingBracket;
        } else {
            // Should not happen with well-formed HTML, but handle defensively
            // The original throws an error here.
            throw new Error('Malformed HTML tag: ' + tagString);
        }

        // Tag name starts after '<' or '</'
        const nameStart = tagString.startsWith('</') ? 2 : 1;
        return tagString.substring(nameStart, nameEnd);
    }

    /**
     * Determines the final cutoff position for a text segment,
     * respecting word boundaries if configured.
     * @private
     * @param {String} textSegment - The current text part.
     * @param {Number} budgetLength - The maximum number of characters allowed for this segment.
     * @param {Number|null} nextHtmlElementPos - The index of the next HTML element in the original segment (if any),
     *                                          used as a boundary for word slop.
     * @param {Object} currentConfig - The configuration settings (e.g., preserveWords, flex).
     * @returns {String} The truncated text segment.
     */
    function determineCutoffPoint(textSegment, budgetLength, nextHtmlElementPos, currentConfig) {
        let finalPosition = budgetLength;

        if (!currentConfig.preserveWords && budgetLength > 0) {
            const searchStart = Math.max(0, budgetLength - currentConfig.flex);
            // Limit search area to not go past next HTML element if it exists
            const searchEnd = nextHtmlElementPos !== null ? Math.min(nextHtmlElementPos, budgetLength + currentConfig.flex) : (budgetLength + currentConfig.flex);
            const searchArea = textSegment.slice(searchStart, searchEnd);

            let bestBreakPosition = -1;
            WORD_BOUNDARY_PATTERN.lastIndex = 0; // Reset for new search

            let wordBreakMatch;
            // Find the last word break before or at the budgetLength relative to segment start
            while ((wordBreakMatch = WORD_BOUNDARY_PATTERN.exec(searchArea)) !== null) {
                const absoluteBreakPos = wordBreakMatch.index + searchStart;
                if (absoluteBreakPos <= budgetLength) {
                    bestBreakPosition = absoluteBreakPos;
                } else {
                    break;
                }
            }

            if (bestBreakPosition !== -1) {
                finalPosition = bestBreakPosition;
            } else {
                // If no break found before/at budget, try to find first break *after* budget within slop
                WORD_BOUNDARY_PATTERN.lastIndex = 0; // Reset again
                while ((wordBreakMatch = WORD_BOUNDARY_PATTERN.exec(searchArea)) !== null) {
                    const absoluteBreakPos = wordBreakMatch.index + searchStart;
                    if (absoluteBreakPos > budgetLength && absoluteBreakPos <= budgetLength + currentConfig.flex) {
                        finalPosition = absoluteBreakPos;
                        break;
                    }
                }
            }

            // If the character at the final position - 1 is a whitespace, trim it
            if (finalPosition > 0 && /\s$/.test(textSegment.charAt(finalPosition - 1))) {
                finalPosition--;
            }
        }
        return textSegment.substring(0, finalPosition);
    }

    /**
     * Truncates HTML string while maintaining tag integrity.
     *
     * @function constrainContent
     * @param {String} sourceText The string to be constrained.
     * @param {Number} charLimit The maximum number of visible characters.
     * @param {Object} configSettings (optional)
     * @param {Boolean} [configSettings.keepImages] If true, image tags are preserved. Default: false.
     * @param {Boolean} [configSettings.preserveWords] If true, avoids breaking words. Default: true.
     * @param {Number} [configSettings.flex] Tolerance for word preservation. Default: 10 (or charLimit if less).
     * @param {Boolean|String} [configSettings.omissionMark] Symbol for omission. Default: '...'.
     * @return {String} The constrained HTML string.
     */
    function constrainContent(sourceText, charLimit, configSettings) {
        configSettings = configSettings || BLANK_OBJ;

        const currentConfig = {
            omissionMark: (configSettings.omissionMark !== voidValue) ? configSettings.omissionMark : DEFAULT_OMISSION_MARK,
            preserveWords: (configSettings.preserveWords !== voidValue) ? configSettings.preserveWords : true,
            keepImages: (configSettings.keepImages !== voidValue) ? configSettings.keepImages : false
        };
        // Calculate flex based on charLimit, similar to original's DEFAULT_SLOP
        currentConfig.flex = (configSettings.flex !== voidValue) ? configSettings.flex : (10 > charLimit ? charLimit : 10);

        let currentPosition = 0; // Current pointer in the sourceText
        let charCount = 0; // Count of visible characters added to output
        const outputParts = []; // Accumulates parts of the final string
        const tagRegistry = []; // Stack for open HTML tags

        while (currentPosition < sourceText.length && charCount < charLimit) {
            HTML_MARKUP_PATTERN.lastIndex = 0; // Reset regex for each slice
            const nextMarkupMatch = HTML_MARKUP_PATTERN.exec(sourceText.slice(currentPosition));

            let textBeforeMarkup = BLANK_STR;
            let markupString = BLANK_STR;
            let markupRelativeStart = null; // Position of the tag relative to textBeforeMarkup

            if (nextMarkupMatch) {
                textBeforeMarkup = sourceText.substring(currentPosition, currentPosition + nextMarkupMatch.index);
                markupString = nextMarkupMatch[0];
                markupRelativeStart = nextMarkupMatch.index;
            } else { // No more HTML tags in the remaining string
                textBeforeMarkup = sourceText.substring(currentPosition);

                // --- Replicating original's URL handling logic ---
                // This block is entered ONLY if no HTML tags are found in the *remaining* string.
                // It has a specific behavior regarding charCount updates (it doesn't update it).
                WEB_LINK_PATTERN.lastIndex = 0; // Reset regex for this search
                let linkMatch = WEB_LINK_PATTERN.exec(textBeforeMarkup);

                if (!linkMatch || linkMatch.index >= (charLimit - charCount)) {
                    // No URL found OR URL starts beyond the remaining character budget
                    const truncatedText = determineCutoffPoint(textBeforeMarkup, charLimit - charCount, null, currentConfig);
                    outputParts.push(truncatedText);
                    charCount = charLimit; // Mark budget as fully used
                } else {
                    // URL found and starts within the remaining character budget
                    let tempSegmentForLinks = textBeforeMarkup;
                    let currentLinkMatch;
                    
                    while ((currentLinkMatch = WEB_LINK_PATTERN.exec(tempSegmentForLinks)) !== null) {
                        const linkStart = currentLinkMatch.index;
                        const linkContent = currentLinkMatch[0];

                        // Add text before current URL and the URL itself.
                        // The original code adds `string.substring(0, (index + result.length) - total);`
                        // which implies adding from the start of the `string` variable up to the end of the URL.
                        // And `total` (our `charCount`) is NOT updated within this `while` loop in the original.
                        // This means content added here does not count towards `charLimit` for subsequent URL checks
                        // within this same `textBeforeMarkup` segment.
                        // The `0` in `(linkStart + linkContent.length) - 0` replicates the original's behavior
                        // where `total` is not updated before this `substring` call within the URL loop.
                        outputParts.push(tempSegmentForLinks.substring(0, linkStart + linkContent.length));
                        tempSegmentForLinks = tempSegmentForLinks.substring(linkStart + linkContent.length);
                        WEB_LINK_PATTERN.lastIndex = 0; // Reset for next search in the new tempSegmentForLinks
                    }
                    // The original code breaks out of the outer loop immediately after the URL processing loop.
                    // Any remaining text in `tempSegmentForLinks` after the last URL is effectively discarded.
                }
                currentPosition = sourceText.length; // Advance pointer to end, effectively ending main loop
                break; // Exit the main processing loop
            }

            // Process text segment (if any) before the next HTML tag
            if (charCount + textBeforeMarkup.length > charLimit) {
                const effectiveTextBudget = charLimit - charCount;
                const truncatedText = determineCutoffPoint(textBeforeMarkup, effectiveTextBudget, markupRelativeStart, currentConfig);
                outputParts.push(truncatedText);
                charCount += truncatedText.length;
                currentPosition += textBeforeMarkup.length; // Advance past the full text segment (even if truncated)
                break; // Exit main loop, as charLimit is reached
            } else {
                outputParts.push(textBeforeMarkup);
                charCount += textBeforeMarkup.length;
                currentPosition += textBeforeMarkup.length;
            }

            // Process the HTML tag (if any)
            if (markupString && charCount < charLimit) { // Only add tag if we haven't hit charLimit by text
                outputParts.push(markupString);
                currentPosition += markupString.length;

                const elementTag = extractElementName(markupString);
                if (markupString.startsWith('</')) {
                    tagRegistry.pop(); // Closing tag
                } else if (!SELF_CLOSING_ELEMENT_PATTERN.test(markupString)) {
                    tagRegistry.push(elementTag); // Opening tag
                }
            }
        }

        // Append ellipsis if the source string was not fully processed and ellipsis is configured
        if (currentPosition < sourceText.length && currentConfig.omissionMark) {
            outputParts.push(currentConfig.omissionMark);
        }

        // Close any remaining open tags
        outputParts.push(finalizeElements(tagRegistry));

        let finalResult = outputParts.join(BLANK_STR);

        // Remove image tags if configured
        if (!currentConfig.keepImages) {
            finalResult = scrubImageElements(finalResult);
        }

        return finalResult;
    }

    // Export module
    if ('undefined' !== typeof module && module.exports) {
        module.exports = constrainContent;
    } else {
        outerContext.constrainContent = constrainContent;
    }
}(this));