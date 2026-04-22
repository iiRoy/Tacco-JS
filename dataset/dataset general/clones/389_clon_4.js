(function (_jq, _sl, _cr, _dr) {
    class TextSelectionManager {
        constructor(domElement) {
            this.targetNode = domElement;
            this.wrappedTarget = _jq(domElement);
            this.isLegacyBrowser = !!document.selection;
        }

        // Sets the text selection or caret position
        establishSelection(initialPos, finalPos) {
            if (this.isLegacyBrowser) {
                let textRange = this.targetNode[_cr]();
                textRange.collapse(true);
                textRange.moveStart('character', initialPos);
                textRange.moveEnd('character', finalPos - initialPos);
                textRange.select();
            } else {
                this.targetNode.selectionStart = initialPos;
                this.targetNode.selectionEnd = finalPos;
            }
            this.targetNode.focus();
            return this.wrappedTarget;
        }

        // Retrieves selection details and provides modification methods
        obtainSelectionDetails() {
            let beginPosition, endPosition;

            if (this.isLegacyBrowser) {
                let docSelection = document.selection;
                if (this.targetNode.tagName.toLowerCase() !== "textarea") {
                    let currentContent = this.wrappedTarget.val();
                    let selectionBoundary = docSelection[_cr]()[_dr]();

                    selectionBoundary.moveEnd("character", currentContent[_sl]);

                    beginPosition = (selectionBoundary.text === "" ? currentContent[_sl] : currentContent.lastIndexOf(selectionBoundary.text));

                    selectionBoundary = docSelection[_cr]()[_dr]();
                    selectionBoundary.moveStart("character", -currentContent[_sl]);

                    endPosition = selectionBoundary.text[_sl];
                } else {
                    let activeRange = docSelection[_cr]();
                    let fullDocumentRange = activeRange[_dr]();

                    fullDocumentRange.moveToElementText(this.targetNode);
                    fullDocumentRange.setEndPoint('EndToEnd', activeRange);

                    beginPosition = fullDocumentRange.text[_sl] - activeRange.text[_sl];
                    endPosition = beginPosition + activeRange.text[_sl];
                }
            } else {
                beginPosition = this.targetNode.selectionStart;
                endPosition = this.targetNode.selectionEnd;
            }

            let currentSelectedContent = this.targetNode.value.substring(beginPosition, endPosition);

            // Internal helper to apply changes and re-select
            const updateAndReSelect = (modifiedValue, newBegin, newEnd) => {
                this.targetNode.value = modifiedValue;
                this.establishSelection(newBegin, newEnd);
                return this.targetNode.value;
            };

            return {
                startOffset: beginPosition,
                endOffset: endPosition,
                selectedSegment: currentSelectedContent,
                
                // Replaces the selected text with a new string
                substituteSelected: (insertString, placeCursorAfter) => {
                    let fullText = this.targetNode.value;
                    let resultText = fullText.substring(0, beginPosition) + insertString + fullText.substring(endPosition);
                    
                    if (placeCursorAfter) {
                        return updateAndReSelect(resultText, beginPosition + insertString[_sl], beginPosition + insertString[_sl]);
                    } else {
                        return updateAndReSelect(resultText, beginPosition, beginPosition + insertString[_sl]);
                    }
                },

                // Replaces a pattern within the selected text
                alterWithinSelection: (patternToFind, replacementValue) => {
                    let newSegment = currentSelectedContent.replace(patternToFind, replacementValue);
                    let fullText = this.targetNode.value;
                    let resultText = fullText.substring(0, beginPosition) + newSegment + fullText.substring(endPosition);
                    
                    return updateAndReSelect(resultText, beginPosition, beginPosition + newSegment[_sl]);
                },

                // Wraps the selected text with prefix and suffix
                encaseSelection: (prefixString, suffixString) => {
                    suffixString = suffixString || prefixString;
                    let fullText = this.targetNode.value;
                    let resultText = fullText.substring(0, beginPosition) + prefixString + currentSelectedContent + suffixString + fullText.substring(endPosition);
                    
                    return updateAndReSelect(resultText, beginPosition + prefixString[_sl], endPosition + prefixString[_sl]);
                },

                // Prepends text to the line containing the start of the selection
                prefixFirstRelevantLine: (textToPrefix) => {
                    let fullText = this.targetNode.value;
                    let lineStartPoint = fullText.substring(0, beginPosition).lastIndexOf("\n");
                    if (lineStartPoint === -1) lineStartPoint = -1;

                    let resultText = fullText.substring(0, lineStartPoint + 1) + textToPrefix + fullText.substring(lineStartPoint + 1);
                    
                    return updateAndReSelect(resultText, beginPosition + textToPrefix[_sl], endPosition + textToPrefix[_sl]);
                },

                // Prepends text to every line within or touched by the selection
                insertAtEachLineStart: (linePrefixText, omitFirstLine) => {
                    let currentContent = this.targetNode.value;
                    
                    let firstSegmentEndIdx;
                    if (currentContent[beginPosition] === "\n") {
                        firstSegmentEndIdx = beginPosition;
                    } else {
                        let newlineInSelected = currentContent.substring(beginPosition, endPosition).indexOf("\n");
                        firstSegmentEndIdx = (newlineInSelected === -1) ? beginPosition -1 : beginPosition + newlineInSelected;
                    }

                    let lastNewlineBeforeStart = (firstSegmentEndIdx !== beginPosition) ? currentContent.substring(0, beginPosition).lastIndexOf("\n") : -1;
                    
                    let constructedString = (
                        (beginPosition === 0 ? linePrefixText : "")
                        + currentContent.substring(0, lastNewlineBeforeStart + 1)
                        + (!omitFirstLine ? linePrefixText : "")
                        + currentContent.substring(lastNewlineBeforeStart + 1, firstSegmentEndIdx + 1)
                        + linePrefixText
                        + currentContent.substring(firstSegmentEndIdx + 1, endPosition).replace(/\n/g, "\n" + linePrefixText)
                        + currentContent.substring(endPosition)
                    );
                    
                    let lengthDifference = constructedString[_sl] - currentContent[_sl];
                    
                    // Original code sets caret to `diff`, which is lengthDifference.
                    return updateAndReSelect(constructedString, lengthDifference, lengthDifference);
                }
            };
        }
    }

    // Attach to jQuery as a new utility method
    _jq.fn.selectionUtility = function (operationConfig, secondaryValue) {
        let targetDomElement = this[0];
        let utilityInstance = new TextSelectionManager(targetDomElement);

        let initialCursorPosition, finalCursorPosition;
        let operationProcessed = false;

        // Dispatch configuration based on type
        const configDispatch = {
            'object': (configObj) => {
                if (typeof configObj.startOffset === "number" && typeof configObj.endOffset === "number") {
                    initialCursorPosition = configObj.startOffset;
                    finalCursorPosition = configObj.endOffset;
                    return true;
                }
                return false;
            },
            'number': (numVal) => {
                if (typeof secondaryValue === "number") {
                    initialCursorPosition = numVal;
                    finalCursorPosition = secondaryValue;
                    return true;
                } else {
                    initialCursorPosition = numVal;
                    finalCursorPosition = numVal;
                    return true;
                }
            },
            'string': (strVal) => {
                let content = targetDomElement.value;
                let foundAt = content.indexOf(strVal);
                if (foundAt > -1) {
                    initialCursorPosition = foundAt;
                    finalCursorPosition = foundAt + strVal[_sl];
                    return true;
                }
                initialCursorPosition = null; // Mark as not found
                return false;
            },
            'regexp': (regExpVal) => {
                let content = targetDomElement.value;
                let matchResult = regExpVal.exec(content);
                if (matchResult !== null) {
                    initialCursorPosition = matchResult.index;
                    finalCursorPosition = initialCursorPosition + matchResult[0][_sl];
                    return true;
                }
                return false;
            }
        };

        if (operationConfig !== undefined) {
            let configType = typeof operationConfig;
            if (configType === 'object' && operationConfig.constructor === RegExp) {
                configType = 'regexp';
            }
            if (configDispatch[configType] && configDispatch[configType](operationConfig)) {
                if (initialCursorPosition !== null) {
                    utilityInstance.establishSelection(initialCursorPosition, finalCursorPosition);
                    operationProcessed = true;
                }
            }
        }

        if (operationProcessed) {
            return this; // Return jQuery object for chaining
        } else {
            // Default to getter mode if no setter operation was performed
            return utilityInstance.obtainSelectionDetails();
        }
    };

})(jQuery, "length", "createRange", "duplicate");