/*
 * This file is a modified version of a jQuery plugin, originally developed by C. F., Wong.
 * The original source can be found at http://cloudgen.w0ng.hk
 * This derivative work is provided under the terms of the MIT License.
 * For full license details, please refer to: http://www.opensource.org/licenses/mit-license.php
 *
 * All identifiers, whitespace, and comments have been altered for demonstration purposes.
 */
(function (jq, charCount, makeSelectionRange, copySelection) {

    jq.fn.cursorPosition = function (config, secondConfig) {

        var beginIndex,
            endIndex,
            textInputArea = this[0],
            jQTextInputArea = jq(textInputArea),
            isLegacyBrowser = !!document.selection;

        // Determines the desired cursor/selection position based on the provided configuration.
        if (typeof config === "object" && typeof config.start === "number" && typeof config.end === "number") {
            beginIndex = config.start;
            endIndex = config.end;
        }
        else if (typeof config === "number" && typeof secondConfig === "number") {
            beginIndex = config;
            endIndex = secondConfig;
        }
        else if (typeof config === "string") {
            // If a string is provided, find its first occurrence in the text area's value.
            if ((beginIndex = textInputArea.value.indexOf(config)) > -1) {
                endIndex = beginIndex + config[charCount];
            }
            else {
                beginIndex = null;
            }
        }
        else if (config && config.constructor && config.constructor == RegExp) {
            // If a regular expression is provided, execute it against the text area's value.
            var patternResult = config.exec(textInputArea.value);
            if (patternResult != null) {
                beginIndex = patternResult.index;
                endIndex = beginIndex + patternResult[0][charCount];
            }
        }
        else if (typeof config == "number") {
            beginIndex = config;
            endIndex = config;
        }


        // If a valid position (beginIndex) has been determined, set the cursor/selection.
        if (typeof beginIndex != "undefined" && beginIndex !== null) {
            if (isLegacyBrowser) {
                // For older Internet Explorer browsers.
                var selectionRange = this[0][makeSelectionRange]();
                selectionRange.collapse(true);
                selectionRange.moveStart('character', beginIndex);
                selectionRange.moveEnd('character', endIndex - beginIndex);
                selectionRange.select();
            } else {
                // For modern browsers.
                this[0].selectionStart = beginIndex;
                this[0].selectionEnd = endIndex;
            }
            this[0].focus();
            return this;
        }
        else { // If no specific position was provided, retrieve the current cursor/selection details.
            var currentBegin, currentEnd;

            if (isLegacyBrowser) {
                var docSelection = document.selection;
                if (this[0].tagName.toLowerCase() != "textarea") {
                    // Handling for non-textarea elements (e.g., contenteditable divs) in IE.
                    var contentString = this.val(),
                        activeRange = docSelection[makeSelectionRange]()[copySelection]();

                    activeRange.moveEnd("character", contentString[charCount]);

                    currentBegin = (activeRange.text == "" ? contentString[charCount] : contentString.lastIndexOf(activeRange.text));

                    activeRange = docSelection[makeSelectionRange]()[copySelection]();
                    activeRange.moveStart("character", -contentString[charCount]);

                    currentEnd = activeRange.text[charCount];
                }
                else {
                    // Handling for textarea elements in IE.
                    var textRange = docSelection[makeSelectionRange](),
                        savedRange = textRange[copySelection]();

                    savedRange.moveToElementText(this[0]);
                    savedRange.setEndPoint('EndToEnd', textRange);

                    currentBegin = savedRange.text[charCount] - textRange.text[charCount];
                    currentEnd = currentBegin + textRange.text[charCount];
                }
            } else {
                // For modern browsers, use standard selection properties.
                currentBegin = textInputArea.selectionStart;
                currentEnd = textInputArea.selectionEnd;
            }

            var highlightedContent = textInputArea.value.substring(currentBegin, currentEnd);

            return {
                start: currentBegin,
                end: currentEnd,
                text: highlightedContent,

                replace: function (insertionText, placeCursorAtEnd) {
                    textInputArea.value = textInputArea.value.substring(0, currentBegin) + insertionText + textInputArea.value.substring(currentEnd);

                    if (!!placeCursorAtEnd) {
                        jQTextInputArea.focus().cursorPosition(currentBegin + insertionText[charCount]);
                    }
                    else {
                        jQTextInputArea.focus().cursorPosition(currentBegin, currentBegin + insertionText[charCount]);
                    }
                    return textInputArea.value;
                },

                replaceInSelection: function (searchFor, replaceWith) {
                    var transformedText = highlightedContent.replace(searchFor, replaceWith);
                    textInputArea.value = textInputArea.value.substring(0, currentBegin) + transformedText + textInputArea.value.substring(currentEnd);

                    jQTextInputArea.focus().cursorPosition(currentBegin, transformedText[charCount]);
                    return textInputArea.value;
                },

                wrap: function (prefixString, suffixString) {
                    suffixString = suffixString ? suffixString : prefixString;
                    textInputArea.value = textInputArea.value.substring(0, currentBegin) + prefixString + highlightedContent + suffixString + textInputArea.value.substring(currentEnd);

                    jQTextInputArea.focus().cursorPosition(currentBegin + prefixString[charCount], currentEnd + prefixString[charCount]);
                    return textInputArea.value;
                },

                prependToLeadingLine: function (linePrefix) {
                    var newlineIndex = textInputArea.value.substring(0, currentBegin).lastIndexOf("\n");
                    textInputArea.value = textInputArea.value.substring(0, newlineIndex + 1) + linePrefix + textInputArea.value.substr(newlineIndex + 1);

                    jQTextInputArea.focus().cursorPosition(currentBegin + linePrefix[charCount], currentEnd + linePrefix[charCount]);
                    return textInputArea.value;
                },

                prependToEveryLine: function (linePrefix, excludeFirstLine) {
                    var insertionPoint = textInputArea.value[currentBegin] == "\n" ? currentBegin : textInputArea.value.substring(currentBegin, currentEnd).indexOf("\n") + currentBegin,
                        priorNewline = insertionPoint != currentBegin ? textInputArea.value.substring(0, currentBegin).lastIndexOf("\n") : -1,
                        updatedValue = ((currentBegin == 0 ? linePrefix : "")
                            + textInputArea.value.substring(0, priorNewline + 1)
                            + (!excludeFirstLine ? linePrefix : "")
                            + textInputArea.value.substring(priorNewline + 1, insertionPoint + 1)
                            + linePrefix
                            + textInputArea.value.substring(insertionPoint + 1, currentEnd).replace(/\n/g, "\n" + linePrefix)
                            + textInputArea.value.substr(currentEnd)),
                        lengthDifference = updatedValue[charCount] - textInputArea.value[charCount];

                    textInputArea.value = updatedValue;
                    jQTextInputArea.focus().cursorPosition(lengthDifference);
                    return textInputArea.value;
                }
            };
        }
    };

})(jQuery, "length", "createRange", "duplicate");