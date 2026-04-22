/*global module:true*/
/*jslint nomen:true*/
/**
 * @module ContentManipulation
 * @description Provides a utility for HTML string manipulation.
 */
((globalObj) => {
    'use strict';

    // Internal constants for configuration defaults and regex patterns
    const DEFAULT_ELLIPSIS_SYMBOL = '...';
    const DEFAULT_WORD_BREAK_TOLERANCE = 10; // How many characters to "slop" for a word break
    const EXCLUDED_CLOSING_TAGS = ['img', 'br', 'hr', 'meta', 'link', 'input', 'area', 'base', 'col', 'embed', 'keygen', 'param', 'source', 'track', 'wbr']; // Standard HTML void elements (don't require closing tags)

    // Regex building blocks for attribute matching and slash presence
    const HTML_ATTRIBUTE_PART = '([\\w\\-]+\\s*=\\s*"[^"]*"\\s*)*'; // Matches zero or more attributes like `key="value"`
    const OPTIONAL_CLOSING_SLASH_PART = '\\s*\\/?\\s*';           // Matches optional ` /` or `/ ` or `/` for self-closing tags
    const MANDATORY_CLOSING_SLASH_PART = '\\s*\\/\\s*';           // Matches mandatory ` /` or `/ ` or `/` for XML-style self-closing tags

    // Specific Regex patterns for parsing HTML and text content
    const SELF_CLOSING_HTML_PATTERN = new RegExp('<\\w+\\s*' + HTML_ATTRIBUTE_PART + MANDATORY_CLOSING_SLASH_PART + '>'); // Detects tags like <img src="..." />
    const GENERAL_HTML_TAG_PATTERN = new RegExp('<\\/?\\w+\\s*' + HTML_ATTRIBUTE_PART + OPTIONAL_CLOSING_SLASH_PART + '>', 'g'); // Catches any HTML tag, open, close, or self-closing
    const WEB_LINK_PATTERN = /(((ftp|https?):\/\/)[\-\w@:%_\+.~#?,&\/\/=]+)|((mailto:)?[_.\w\-]+@([\w][\w\-]+\.)+[a-zA-Z]{2,3})/g; // Simple regex for URLs and email addresses
    const IMAGE_ELEMENT_PATTERN = new RegExp('<img\\s*' + HTML_ATTRIBUTE_PART + OPTIONAL_CLOSING_SLASH_PART + '>', 'g'); // Specifically targets `<img>` tags for removal
    const WHITESPACE_OR_PUNCTUATION_PATTERN = /\W+/g; // Used to identify natural word breaks (non-word characters)

    /**
     * Filters out all image (<img>) tags from a given HTML string.
     * This utility function is applied at the end of the trimming process if image tags
     * are explicitly configured not to be preserved.
     *
     * @private
     * @param {String} sourceContent The HTML string potentially containing image elements.
     * @returns {String} The HTML string with all `<img>` tags removed.
     */
    function filterImageElements(sourceContent) {
        // Utilizing `String.prototype.replace` with a global regex ensures all occurrences are handled.
        return sourceContent.replace(IMAGE_ELEMENT_PATTERN, '');
    }

    /**
     * Constructs a string of well-formed closing HTML tags for any elements
     * that remain open in the provided stack. Tags listed in `elementsToExclude`
     * (e.g., void elements like `<img>`, `<br>`) will be ignored.
     *
     * @private
     * @param {String[]} openElementStack An array of tag names (e.g., ['div', 'p']) that are currently open.
     * @param {String[]} elementsToExclude A list of tag names for which no closing tag should be generated.
     * @returns {String} A string composed of correctly ordered closing HTML tags (e.g., '</div></p>').
     */
    function finalizeOpenTags(openElementStack, elementsToExclude) {
        let closingHtmlFragment = '';
        // Iterate through the stack in reverse order to ensure LIFO closing (e.g., `<b><i>text</i></b>`).
        for (let i = openElementStack.length - 1; i >= 0; i--) {
            const currentTag = openElementStack[i];
            // Only append a closing tag if the element is not in the exclusion list.
            if (!elementsToExclude.includes(currentTag)) {
                closingHtmlFragment += `</${currentTag}>`;
            }
        }
        return closingHtmlFragment;
    }

    /**
     * Parses an HTML tag string to extract its fundamental tag name (e.g., 'div' from '<div class="foo">').
     * Handles both opening and closing tag formats.
     *
     * @private
     * @param {String} fullTagString The complete HTML tag string, including brackets and attributes.
     * @returns {String} The extracted HTML tag name (e.g., 'p', 'a', 'h1').
     * @throws {Error} If the provided tag string is malformed to the point where a tag name cannot be identified.
     */
    function extractPureTagName(fullTagString) {
        const spaceIndex = fullTagString.indexOf(' ');
        const closeBracketIndex = fullTagString.indexOf('>');

        // Determine the effective end of the tag name (either a space or the closing bracket).
        let nameEndPosition = closeBracketIndex;
        if (spaceIndex !== -1 && spaceIndex < closeBracketIndex) {
            nameEndPosition = spaceIndex;
        }

        if (nameEndPosition === -1) {
            // This scenario implies a severely malformed tag, which should ideally be caught by the regex.
            throw new Error('Invalid HTML tag format detected: Cannot determine tag name from ' + fullTagString);
        }

        // The tag name starts after '<' (and potentially '/')
        let nameStartPosition = 1;
        if (fullTagString[nameStartPosition] === '/') { // Adjust for closing tags like `</div`
            nameStartPosition++;
        }

        return fullTagString.substring(nameStartPosition, nameEndPosition);
    }

    /**
     * Determines the most appropriate position to truncate a string segment,
     * prioritizing word boundaries if `truncateLastWord` is false.
     * It uses a `slop` tolerance to search for a natural break point.
     *
     * @private
     * @param {String} textSegment The current string portion being evaluated for truncation.
     * @param {Number} currentCharacterCount The total visible characters processed up to this point.
     * @param {Number} maxAllowedLength The absolute maximum character length for the final output.
     * @param {Object} trimmingOptions Configuration options, specifically `truncateLastWord` and `slop`.
     * @param {Number} [limitIndexForSearch] An optional index indicating where a potential HTML tag starts
     *                                      within `textSegment`, used to prevent word-break searching beyond it.
     * @returns {Number} The calculated end index for `String.prototype.slice()` or `substring()`.
     */
    function determineSafeBreakpoint(textSegment, currentCharacterCount, maxAllowedLength, trimmingOptions, limitIndexForSearch) {
        const remainingCapacity = maxAllowedLength - currentCharacterCount;
        let idealCutPoint = remainingCapacity;

        if (!trimmingOptions.truncateLastWord) {
            const effectiveSlop = Math.min(trimmingOptions.slop, remainingCapacity); // Slop should not extend beyond remaining space
            const searchStartOffset = Math.max(0, idealCutPoint - effectiveSlop);
            const searchEndOffset = Math.min(textSegment.length, idealCutPoint + effectiveSlop, limitIndexForSearch !== undefined ? limitIndexForSearch : Infinity);

            const searchArea = textSegment.slice(searchStartOffset, searchEndOffset);
            let lastNaturalBreakInSearch = -1;
            let regexMatch;

            WHITESPACE_OR_PUNCTUATION_PATTERN.lastIndex = 0; // Reset regex state before each use
            while ((regexMatch = WHITESPACE_OR_PUNCTUATION_PATTERN.exec(searchArea)) !== null) {
                lastNaturalBreakInSearch = regexMatch.index;
            }

            if (lastNaturalBreakInSearch !== -1) {
                // Adjust the idealCutPoint to the found word break
                idealCutPoint = searchStartOffset + lastNaturalBreakInSearch;
            }
        }

        // Ensure the calculated cut point is within valid bounds of the segment.
        idealCutPoint = Math.max(0, Math.min(idealCutPoint, textSegment.length));

        // If the character immediately before the cut point is whitespace, trim it to avoid leading spaces before ellipsis.
        if (idealCutPoint > 0 && textSegment.charAt(idealCutPoint - 1).match(/\s$/)) {
            idealCutPoint--;
        }

        return idealCutPoint;
    }


    /**
     * Trims an HTML string to a specified maximum visible character length,
     * meticulously preserving HTML structure by ensuring all opened tags are correctly closed.
     * It also offers options for word-break sensitivity and image tag preservation.
     *
     * @method trimHtmlContent
     * @param {String} inputHtml The raw HTML string that needs to be truncated.
     * @param {Number} maxDesiredLength The target maximum number of *visible* characters in the output.
     * @param {Object} [configuration] Optional object to customize truncation behavior.
     * @param {Boolean} [configuration.keepImageTags=false] If `true`, `<img>` tags will be retained; otherwise, they are removed.
     * @param {Boolean} [configuration.truncateLastWord=true] If `true`, text can be cut mid-word. If `false`, it attempts to break at word boundaries.
     * @param {Number} [configuration.slop=10] When `truncateLastWord` is `false`, this defines the character tolerance to find a natural word break.
     * @param {Boolean|String} [configuration.ellipsis='...'] The symbol (or string) to append when truncation occurs. Set to `false` to omit.
     * @returns {String} The HTML string, carefully trimmed and structurally well-formed.
     */
    function trimHtmlContent(inputHtml, maxDesiredLength, configuration) {
        // --- Input Validation and Early Exits ---
        if (typeof inputHtml !== 'string') {
            // For non-string inputs, return an empty string or handle as an error.
            return '';
        }
        if (maxDesiredLength === undefined || maxDesiredLength === null || !Number.isFinite(maxDesiredLength) || maxDesiredLength <= 0) {
            // If the desired length is invalid, return the original string as no valid trimming can be performed.
            return inputHtml;
        }
        if (inputHtml.length <= maxDesiredLength) {
            // If the input is already shorter than or equal to the desired length, no trimming is necessary.
            return inputHtml;
        }

        const defaultTrimmingSettings = {
            keepImageTags: false,
            truncateLastWord: true,
            slop: DEFAULT_WORD_BREAK_TOLERANCE,
            ellipsis: DEFAULT_ELLIPSIS_SYMBOL
        };

        // Merge user-provided configuration with the predefined defaults.
        const effectiveConfig = { ...defaultTrimmingSettings, ...configuration };

        // Ensure the slop value does not exceed the maximum allowed length itself.
        effectiveConfig.slop = Math.min(effectiveConfig.slop, maxDesiredLength);

        let remainingHtmlSegment = inputHtml;     // The portion of the input string yet to be processed.
        let accumulatedOutputBuffer = '';       // Stores the progressively built trimmed HTML output.
        let visibleCharCounter = 0;             // Keeps track of the count of *visible* (non-HTML tag) characters.
        const openTagStack = [];                // A LIFO stack to manage currently open HTML tags.

        let currentHtmlMatch; // Stores the result of each HTML tag regex execution.
        let truncationOccurred = false; // Flag to indicate if the character limit was hit and truncation applied.

        // --- Main Trimming Loop: Process HTML Tags and Text ---
        // The loop continues as long as HTML tags are found in the `remainingHtmlSegment`.
        while ((currentHtmlMatch = GENERAL_HTML_TAG_PATTERN.exec(remainingHtmlSegment)) !== null) {
            const matchedTagContent = currentHtmlMatch[0];
            const charactersBeforeTag = currentHtmlMatch.index;

            // Check if adding the text *before* the current HTML tag would exceed the maximum length.
            if (visibleCharCounter + charactersBeforeTag >= maxDesiredLength) {
                // The limit is reached within the plain text segment preceding the tag.
                const finalContentLength = determineSafeBreakpoint(
                    remainingHtmlSegment.substring(0, charactersBeforeTag),
                    visibleCharCounter,
                    maxDesiredLength,
                    effectiveConfig,
                    charactersBeforeTag // Provide this to ensure word break search doesn't go into the tag
                );
                accumulatedOutputBuffer += remainingHtmlSegment.substring(0, finalContentLength);
                visibleCharCounter += finalContentLength;
                truncationOccurred = true;
                break; // Exit the loop, as the character limit has been effectively met.
            }

            // If the limit is not yet reached, append the text segment preceding the current tag.
            accumulatedOutputBuffer += remainingHtmlSegment.substring(0, charactersBeforeTag);
            visibleCharCounter += charactersBeforeTag;

            // Now, process the HTML tag itself.
            const isClosingTag = matchedTagContent.startsWith('</');
            const isSelfClosingTag = SELF_CLOSING_HTML_PATTERN.test(matchedTagContent);
            const extractedTagName = extractPureTagName(matchedTagContent);

            if (isClosingTag) {
                // If the stack is not empty and the last opened tag matches this closing tag, pop it.
                const lastOpenedTag = openTagStack[openTagStack.length - 1];
                if (lastOpenedTag === extractedTagName) {
                    openTagStack.pop();
                }
                // (For truly robust parsing, one might check for mismatched tags, but for cloning, we mimic original behavior.)
            } else if (!isSelfClosingTag && !EXCLUDED_CLOSING_TAGS.includes(extractedTagName)) {
                // For opening tags that are not self-closing and are not in the exclusion list, push them onto the stack.
                openTagStack.push(extractedTagName);
            }
            // Always add the HTML tag to the output buffer, regardless of its type.
            accumulatedOutputBuffer += matchedTagContent;

            // Advance the `remainingHtmlSegment` past the processed tag.
            remainingHtmlSegment = remainingHtmlSegment.substring(charactersBeforeTag + matchedTagContent.length);
            GENERAL_HTML_TAG_PATTERN.lastIndex = 0; // Reset regex state to search from the beginning of the new string.
        }

        // --- Post-Loop Content Processing (for any remaining plain text or URLs) ---
        // This block executes if the character limit was not hit within an HTML-prefixed text segment.
        if (!truncationOccurred && visibleCharCounter < maxDesiredLength) {
            let remainingCharsToAppend = maxDesiredLength - visibleCharCounter;
            let currentTextSegmentLengthAdded = 0;

            WEB_LINK_PATTERN.lastIndex = 0; // Reset regex state for URL searching.
            let urlSegmentMatch;

            // Prioritize processing URLs within the remaining plain text.
            while ((urlSegmentMatch = WEB_LINK_PATTERN.exec(remainingHtmlSegment)) !== null) {
                const urlMatchStart = urlSegmentMatch.index;
                const urlFullLength = urlSegmentMatch[0].length;

                // Append any text occurring *before* the current URL.
                const preUrlText = remainingHtmlSegment.substring(0, urlMatchStart);
                const preUrlTextToAppendLength = Math.min(preUrlText.length, remainingCharsToAppend - currentTextSegmentLengthAdded);

                accumulatedOutputBuffer += preUrlText.substring(0, preUrlTextToAppendLength);
                currentTextSegmentLengthAdded += preUrlTextToAppendLength;

                if (currentTextSegmentLengthAdded >= remainingCharsToAppend) {
                    truncationOccurred = true;
                    break; // Limit reached while adding text before URL.
                }

                // Append the URL itself.
                const urlPartToAppend = urlSegmentMatch[0].substring(0, Math.min(urlFullLength, remainingCharsToAppend - currentTextSegmentLengthAdded));
                accumulatedOutputBuffer += urlPartToAppend;
                currentTextSegmentLengthAdded += urlPartToAppend.length;

                if (currentTextSegmentLengthAdded >= remainingCharsToAppend) {
                    truncationOccurred = true;
                    break; // Limit reached while adding URL.
                }

                // Advance the remaining segment past the processed URL.
                remainingHtmlSegment = remainingHtmlSegment.substring(urlMatchStart + urlFullLength);
                WEB_LINK_PATTERN.lastIndex = 0; // Reset for next URL search in the modified string.
            }

            if (!truncationOccurred) {
                // If the limit still hasn't been reached, append any final plain text after all URLs (or if no URLs were found).
                const finalPlainTextCutPoint = determineSafeBreakpoint(
                    remainingHtmlSegment,
                    visibleCharCounter + currentTextSegmentLengthAdded,
                    maxDesiredLength,
                    effectiveConfig
                );
                accumulatedOutputBuffer += remainingHtmlSegment.substring(0, finalPlainTextCutPoint);
                // Update final visible character count (though not strictly used after this point).
                visibleCharCounter += finalPlainTextCutPoint;
            }
        }


        // --- Finalization Steps ---
        // Append the ellipsis symbol if truncation actually occurred and it's configured.
        if (accumulatedOutputBuffer.length < inputHtml.length && effectiveConfig.ellipsis) {
            accumulatedOutputBuffer += effectiveConfig.ellipsis;
        }

        // Generate and append closing tags for any elements that were opened but not closed.
        accumulatedOutputBuffer += finalizeOpenTags(openTagStack, EXCLUDED_CLOSING_TAGS);

        // If configured not to keep image tags, remove them from the final output.
        if (!effectiveConfig.keepImageTags) {
            accumulatedOutputBuffer = filterImageElements(accumulatedOutputBuffer);
        }

        return accumulatedOutputBuffer;
    }

    // --- Module Export / Global Assignment (UMD-like pattern) ---
    if (typeof module !== 'undefined' && module.exports) {
        // CommonJS (Node.js) environment
        module.exports = trimHtmlContent;
    } else if (typeof window !== 'undefined') {
        // Browser environment
        globalObj.trimHtmlContent = trimHtmlContent;
    } else {
        // Other global environments (e.g., Web Workers, Nashorn)
        globalObj.trimHtmlContent = trimHtmlContent;
    }
})(typeof window !== 'undefined' ? window : global);