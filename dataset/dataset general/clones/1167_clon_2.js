/* eslint-env commonjs */
/* istanbul ignore file */
/**
 * @namespace MarkupProcessors
 */
(function (globalScope, voidValue) {
    'use strict';

    /**
     * Shortens an HTML string while preserving the integrity of its tags.
     *
     * @function abridgeContent
     * @param {String} htmlSource The string of HTML to be shortened.
     * @param {Number} trimLimit The maximum desired length of the resulting string.
     * @param {Object} [processingOpts] Optional configuration settings for the truncation.
     * @param {Boolean} [processingOpts.retainImageTags] Flag to indicate whether to keep `<img>` elements; defaults to `false`.
     * @param {Boolean} [processingOpts.breakLastWord] Specifies if the last word should be broken; defaults to `true`.
     * @param {Number} [processingOpts.slackAllowance] A tolerance margin when `processingOpts.breakLastWord` is `false`, before a hard cut-off; defaults to `10` (but not exceeding `trimLimit`).
     * @param {Boolean|String} [processingOpts.omissionSymbol] The character(s) to denote truncation, e.g., '...'; defaults to '...'.
     * @returns {String} The HTML string after being shortened.
     */
    function abridgeContent(htmlSource, trimLimit, processingOpts) {
        var BLANK_OBJECT = {},
            VOID_STRING = '',
            ELLIPSIS_SYMBOL = '...',
            MIN_SLACK = 10 > trimLimit ? trimLimit : 10,
            FORBIDDEN_TAGS = ['img'],         // Elements not requiring a closing tag or special handling
            elementLog = new Array(),         // Stack to keep track of open HTML elements
            processedLength = 0,              // Tracks the number of characters processed outside of tags
            outputBuffer = VOID_STRING,       // Accumulates the shortened HTML content
            ATTRIBUTE_PATTERN = '([\\w|-]+\\s*=\\s*"[^"]*"\\s*)*',
            CLOSING_MARK_PATTERN = '\\s*\\/?\\s*',
            FINAL_SLASH_REGEX = '\\s*\\/\\s*',
            AUTOCLOSE_REGEX = new RegExp('<\\/?\\w+\\s*' + ATTRIBUTE_PATTERN + FINAL_SLASH_REGEX + '>'),
            GENERAL_TAG_REGEX = new RegExp('<\\/?\\w+\\s*' + ATTRIBUTE_PATTERN + CLOSING_MARK_PATTERN + '>'),
            HYPERLINK_REGEX = /(((ftp|https?):\/\/)[\-\w@:%_\+.~#?,&\/\/=]+)|((mailto:)?[_.\w\-]+@([\w][\w\-]+\.)+[a-zA-Z]{2,3})/g, // A straightforward regex for URLs
            IMG_TAG_REGEX = new RegExp('<img\\s*' + ATTRIBUTE_PATTERN + CLOSING_MARK_PATTERN + '>'),
            WORD_SEP_REGEX = new RegExp('\\W+', 'g'),
            foundMatch = true,
            segment,
            matchPosition,
            segmentEnd,
            currentTag,
            standaloneTag;

        /**
         * Eliminates image tags from a given string.
         *
         * @private
         * @method _stripImageElements
         * @param {String} inputString The string possibly containing image tags.
         * @returns {String} The input string with all `<img>` tags removed.
         */
        function _stripImageElements(inputString) {
            var regexResult = IMG_TAG_REGEX.exec(inputString),
                startPosition,
                segmentLength;

            if (!regexResult) {
                return inputString;
            }

            startPosition = regexResult.index;
            segmentLength = regexResult[0].length;

            return inputString.substring(0, startPosition) + inputString.substring(startPosition + segmentLength);
        }

        /**
         * Generates the necessary closing tags for all currently open HTML elements.
         *
         * @private
         * @method _closeRemainingElements
         * @param {String[]} activeTags A collection of open tag names that need to be closed.
         * @returns {String} A string containing the correctly formatted closing HTML tags.
         */
        function _closeRemainingElements(activeTags) {
            var generatedHtml = VOID_STRING;

            activeTags.reverse().forEach(function (elementToClose, loopIndex) {
                // Only add closing tags for elements not explicitly excluded
                if (-1 === FORBIDDEN_TAGS.indexOf(elementToClose)) {
                    generatedHtml += '</' + elementToClose + '>';
                }
            });

            return generatedHtml;
        }

        /**
         * Extracts the pure tag name from an HTML tag string.
         *
         * @private
         * @method _getElementIdentifier
         * @param {String} sourceSegment The raw HTML tag string.
         * @returns {String} The name of the HTML element.
         */
        function _getElementIdentifier(sourceSegment) {
            var spaceIndex = sourceSegment.indexOf(' ');

            // Handle cases where the tag might not have attributes (e.g., `<div>`)
            if (-1 === spaceIndex) {
                spaceIndex = sourceSegment.indexOf('>');
                if (-1 === spaceIndex) {
                    throw new Error('HTML element appears malformed: ' + sourceSegment);
                }
            }

            return sourceSegment.substring(1, spaceIndex);
        }


        /**
         * Calculates the precise ending position for the substring operation.
         *
         * If `processingOpts.breakLastWord` is `false`, this function attempts to adjust
         * the end position by up to `processingOpts.slackAllowance` characters to avoid
         * cutting a word in half.
         *
         * @private
         * @method _findTruncationIndex
         * @param {String} inputString The original HTML content.
         * @param {Number} [limitPosition] An optional boundary to prevent the "slop" from extending into a trailing HTML tag.
         * @returns {Number} The calculated index where the string should be cut.
         */
        function _findTruncationIndex (inputString, limitPosition) {
            var basePosition = trimLimit - processedLength,
                calculatedIndex = basePosition,
                isWithinSlop = basePosition < processingOpts.slackAllowance,
                slackPoint = isWithinSlop ? basePosition : processingOpts.slackAllowance - 1,
                section,
                beginSlice = isWithinSlop ? 0 : basePosition - processingOpts.slackAllowance,
                finishSlice = limitPosition || (basePosition + processingOpts.slackAllowance),
                wordBoundary;

            if (!processingOpts.breakLastWord) {

                section = inputString.slice(beginSlice, finishSlice);

                if (limitPosition && section.length <= limitPosition) {
                    calculatedIndex = section.length;
                }
                else {
                    while ((wordBoundary = WORD_SEP_REGEX.exec(section)) !== null) {
                        // A natural break occurring before the intended hard break
                        if (wordBoundary.index < slackPoint) {
                            calculatedIndex = basePosition - (slackPoint - wordBoundary.index);
                            // Continue searching closer to the hard break point
                            // unless the break is at position 0 and the base position is very small
                            if (wordBoundary.index === 0 && basePosition <= 1) break;
                        }
                        // A natural break found exactly at the hard break point
                        else if (wordBoundary.index === slackPoint) {
                            calculatedIndex = basePosition;
                            break; // No further search needed
                        }
                        // A natural break found after the hard break point
                        else {
                            calculatedIndex = basePosition + (wordBoundary.index - slackPoint);
                            break;  // No further search needed
                        }
                    }
                }
                if (inputString.charAt(calculatedIndex - 1).match(/\s$/)) calculatedIndex--;
            }
            return calculatedIndex;
        }

        processingOpts = processingOpts || BLANK_OBJECT;
        processingOpts.omissionSymbol = (voidValue !== processingOpts.omissionSymbol) ? processingOpts.omissionSymbol : ELLIPSIS_SYMBOL;
        processingOpts.breakLastWord = (voidValue !== processingOpts.breakLastWord) ? processingOpts.breakLastWord : true;
        processingOpts.slackAllowance = (voidValue !== processingOpts.slackAllowance) ? processingOpts.slackAllowance : MIN_SLACK;

        while (foundMatch) {
            foundMatch = GENERAL_TAG_REGEX.exec(htmlSource);

            if (!foundMatch) {
                if (processedLength >= trimLimit) { break; } // Content already reached max length

                foundMatch = HYPERLINK_REGEX.exec(htmlSource);
                if (!foundMatch || foundMatch.index >= trimLimit) {
                    outputBuffer += htmlSource.substring(0, _findTruncationIndex(htmlSource));
                    break;
                }

                // Handle URLs within the remaining text
                while (foundMatch) {
                    segment = foundMatch[0];
                    matchPosition = foundMatch.index;
                    outputBuffer += htmlSource.substring(0, (matchPosition + segment.length) - processedLength);
                    htmlSource = htmlSource.substring(matchPosition + segment.length);
                    foundMatch = HYPERLINK_REGEX.exec(htmlSource);
                }
                break;
            }

            segment = foundMatch[0];
            matchPosition = foundMatch.index;

            if (processedLength + matchPosition > trimLimit) {
                // If the text before the current tag exceeds the limit, truncate and close tags
                outputBuffer += htmlSource.substring(0, _findTruncationIndex(htmlSource, matchPosition));
                break;
            } else {
                processedLength += matchPosition;
                outputBuffer += htmlSource.substring(0, matchPosition);
            }

            if ('/' === segment[1]) {
                // Pop the last open tag from the stack
                elementLog.pop();
                standaloneTag = null;
            } else {
                standaloneTag = AUTOCLOSE_REGEX.exec(segment);
                if (!standaloneTag) {
                    currentTag = _getElementIdentifier(segment);

                    elementLog.push(currentTag);
                }
            }

            if (standaloneTag) {
                outputBuffer += standaloneTag[0];
            } else {
                outputBuffer += segment;
            }
            htmlSource = htmlSource.substring(matchPosition + segment.length);
        }

        if (htmlSource.length > trimLimit - processedLength && processingOpts.omissionSymbol) {
            outputBuffer += processingOpts.omissionSymbol;
        }
        outputBuffer += _closeRemainingElements(elementLog);

        if (!processingOpts.retainImageTags) {
            outputBuffer = _stripImageElements(outputBuffer);
        }

        return outputBuffer;
    }

    if ('object' === typeof globalScope.module && globalScope.module.exports) {
        globalScope.module.exports = abridgeContent;
    } else {
        globalScope.abridgeContent = abridgeContent;
    }
}(this, undefined));