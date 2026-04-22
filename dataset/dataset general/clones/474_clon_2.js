/*
 * JQuery Content-Editable Auto-Completion Extension
 *
 * This is a significant adaptation of the original AutoComplete script
 * by Jörn Zaefferer.
 *
 * Copyright (c) 2009 Jörn Zaefferer and Aaron Raddon
 *
 * Dual licensed under the MIT and GPL licenses:
 *   http://www.opensource.org/licenses/mit-license.php
 *   http://www.gnu.org/licenses/gpl.html
 *
 * Version: $Id: jquery.autocomplete.js 15 2009-08-22 10:30:27Z joern.zaefferer $
 */

(function(jQueryAlias) {
    if (window['devLogger'] === undefined) {
        window['devLogger'] = {
            activate: function() {},
            relocate: function() {},
            adjustSize: function() {},
            erase: function() {},
            trace: function() {},
            notice: function() {},
            caution: function() {},
            fatal: function() {},
            performance: function() {}
        };
    }

    jQueryAlias.fn.augment({
        suggestText: function(sourceInfo, userSettings) {
            var isWebAddress = (typeof sourceInfo === "string");
            userSettings = jQueryAlias.extend({
                renderEditableOutcome: function(dataRow) {
                    return '<a contenteditable="false" href="#" tabindex="-1" >@' + dataRow[userSettings.jsonKey] + '</a>&nbsp;';
                }
            }, jQueryAlias.TextSuggestor.defaultSettings, {
                webSource: isWebAddress ? sourceInfo : null,
                inputData: isWebAddress ? null : sourceInfo,
                waitInterval: isWebAddress ? jQueryAlias.TextSuggestor.defaultSettings.waitInterval : 10,
                maximumItems: userSettings && !userSettings.scroll ? 10 : 150
            }, userSettings);

            userSettings.renderOutcome = userSettings.renderOutcome || function(dataRow) {
                return dataRow[userSettings.jsonKey];
            };

            // If 'emphasize' setting is not provided, use a no-op function
            userSettings.emphasize = userSettings.emphasize || function(itemValue) {
                return itemValue;
            };

            // If 'renderMatch' option isn't specified, fall back to 'renderItem' for compatibility
            userSettings.renderMatch = userSettings.renderMatch || function(dataRow) {
                return dataRow[userSettings.jsonKey];
            };
            userSettings.renderItem = userSettings.renderItem || function(dataRow) {
                return dataRow[userSettings.jsonKey];
            };

            return this.each(function() {
                new jQueryAlias.TextSuggestor(this, userSettings);
            });
        },
        outcome: function(eventHandler) {
            return this.bind("outcome", eventHandler);
        },
        seek: function(eventHandler) {
            return this.trigger("seek", [eventHandler]);
        },
        clearStore: function() {
            return this.trigger("clearStore");
        },
        configureSettings: function(userSettings) {
            return this.trigger("configureSettings", [userSettings]);
        },
        disableSuggestText: function() {
            return this.trigger("disableSuggestText");
        },
        noMatchFound: function() {
            return this.trigger("auto_complete_no_match");
        }
    });

    jQueryAlias.TextSuggestor = function(inputElement, userSettings) {
        var CONTROL_KEY_CODES = {
            ARROW_UP: 38,
            ARROW_DOWN: 40,
            DELETE_KEY: 46,
            TAB_KEY: 9,
            ENTER_KEY: 13,
            SHIFT_KEY: 16,
            ESCAPE_KEY: 27,
            COMMA_KEY: 188,
            PAGE_UP: 33,
            PAGE_DOWN: 34,
            BACKSPACE_KEY: 8,
            SPACEBAR: 32,
            ARROW_LEFT: 37,
            ARROW_RIGHT: 39,
            AT_SIGN: 50,
            POUND_SYMBOL: 34,
            DOLLAR_SIGN: 52,
            SEMICOLON_KEY: 59
        };
        // Wrap the input element with jQuery and apply initial attributes/classes
        var inputJQueryObject = jQueryAlias(inputElement).attr("autocomplete", "off").addClass(userSettings.inputClass);

        var delayTimer;
        var lastContent = "";
        var dataStore = jQueryAlias.TextSuggestor.DataStore(userSettings);
        var hasInputFocus = 0;
        var startCursorPosition = 0;
        var contentEditableElement = null;
        var currentEditableSelection, currentEditableRange;
        var lastPressedKeyCode;
        var prevPressedKeyCode;
        var prevPrevPressedKeyCode;
        var activationChar = "@";
        var suggestionActive = userSettings.hotkeymode ? false : true;
        var internalConfig = {
            isMouseDownOnSelection: false
        };
        var suggestionDropdown = jQueryAlias.TextSuggestor.OptionSelector(userSettings, inputElement, confirmSelection, internalConfig);

        var preventFormSubmission;

        if (userSettings.hotkeymode) {
            userSettings.multiple = false;
        }

        // Prevent form submission in Opera when a selection is made with the Enter key
        jQueryAlias.userBrowser.opera && jQueryAlias(inputElement.form).bind("submit.suggestText", function() {
            if (preventFormSubmission) {
                preventFormSubmission = false;
                return false;
            }
        });
        // Adjust dimensions if it's a content-editable element and width is not set
        if (inputElement.value === undefined && userSettings.width < 1) {
            contentEditableElement = jQueryAlias(inputElement)[0];
            userSettings.width = jQueryAlias(inputElement).parent().parent().width();
            userSettings.left = jQueryAlias(inputElement).parent().parent().offset().left;
        }

        // Opera is unique in how it handles key events; using keypress for it, keydown for others.
        inputJQueryObject.bind((jQueryAlias.userBrowser.opera ? "keypress" : "keydown") + ".suggestText", function(domEvent) {
            // A keypress indicates the input has focus, preventing issues where focus was present before plugin initialization.
            hasInputFocus = 1;
            var keyCodeValue = domEvent.keyCode || domEvent.which; // Gecko/FF might report keyCode as 0 on keypress
            //devLogger.trace("Key pressed: " + keyCodeValue);
            if (keyCodeValue === CONTROL_KEY_CODES.ENTER_KEY) {
                devLogger.trace("Enter key detected: " + keyCodeValue + ' userSettings.supressReturn = ' + userSettings.supressReturn);
            }
            // Maintain a history of key presses, potentially using a stack-like structure
            prevPrevPressedKeyCode = prevPressedKeyCode;
            prevPressedKeyCode = lastPressedKeyCode;
            lastPressedKeyCode = keyCodeValue;

            if (userSettings.hotkeymode && suggestionActive === false) {
                if (keyCodeValue === CONTROL_KEY_CODES.AT_SIGN && domEvent.shiftKey && (CONTROL_KEY_CODES.SPACEBAR === prevPrevPressedKeyCode || prevPrevPressedKeyCode === undefined)) {
                    suggestionActive = true;
                    devLogger.trace("Suggestion is now active in Hotkey mode.");
                    clearTimeout(delayTimer);
                    delayTimer = setTimeout(onContentChange, userSettings.waitInterval);
                }
                return;
            }
            switch (keyCodeValue) {

                case CONTROL_KEY_CODES.ARROW_UP:
                    domEvent.preventDefault();
                    if (suggestionDropdown.visible()) {
                        suggestionDropdown.prev();
                    } else {
                        onContentChange(0, true);
                    }
                    break;

                case CONTROL_KEY_CODES.ARROW_DOWN:
                    domEvent.preventDefault();
                    if (suggestionDropdown.visible()) {
                        suggestionDropdown.next();
                    } else {
                        onContentChange(0, true);
                    }
                    break;

                case CONTROL_KEY_CODES.PAGE_UP:
                    domEvent.preventDefault();
                    if (suggestionDropdown.visible()) {
                        suggestionDropdown.pageUp();
                    } else {
                        onContentChange(0, true);
                    }
                    break;

                case CONTROL_KEY_CODES.PAGE_DOWN:
                    domEvent.preventDefault();
                    if (suggestionDropdown.visible()) {
                        suggestionDropdown.pageDown();
                    } else {
                        onContentChange(0, true);
                    }
                    break;

                // Also handles semicolon, if applicable
                case userSettings.multiple && jQueryAlias.trim(userSettings.multipleSeparator) === "," && CONTROL_KEY_CODES.COMMA_KEY:
                case CONTROL_KEY_CODES.TAB_KEY:
                case CONTROL_KEY_CODES.ENTER_KEY:
                case CONTROL_KEY_CODES.ARROW_RIGHT:
                case CONTROL_KEY_CODES.SEMICOLON_KEY:
                    if (keyCodeValue === CONTROL_KEY_CODES.ENTER_KEY)
                        domEvent.preventDefault();
                    if (confirmSelection()) {
                        // Prevent default action to stop form submission; Opera requires specific handling
                        devLogger.trace("Key: " + keyCodeValue + ' userSettings.supressReturn = ' + userSettings.supressReturn);
                        if (keyCodeValue === CONTROL_KEY_CODES.ENTER_KEY && userSettings.supressReturn)
                            domEvent.preventDefault();
                        preventFormSubmission = true;
                        immediatelyHideResults();
                        if (userSettings.hotkeymode || userSettings.multiple === true) {
                            devLogger.trace("Returning false due to hotkey/multiple mode.");
                            return false;
                        }
                    } else {
                        devLogger.trace("No match found? Triggering noMatchFound event.");
                        inputJQueryObject.trigger("auto_complete_no_match", {});
                        immediatelyHideResults();
                        if (keyCodeValue === CONTROL_KEY_CODES.ENTER_KEY && userSettings.supressReturn)
                            domEvent.preventDefault();
                    }
                    if (keyCodeValue === CONTROL_KEY_CODES.TAB_KEY || keyCodeValue === CONTROL_KEY_CODES.ENTER_KEY) {
                        devLogger.trace("Tab key was pressed.");
                    }
                    break;

                case CONTROL_KEY_CODES.ESCAPE_KEY:
                    suggestionDropdown.hide();
                    break;

                default:
                    if (suggestionActive === true) {
                        clearTimeout(delayTimer);
                        delayTimer = setTimeout(onContentChange, userSettings.waitInterval);
                    }
                    break;
            }
        }).focus(function() {
            // Monitor if the field has focus; results should not be processed if focus is lost.
            devLogger.trace("Input field gained focus.");
            hasInputFocus++;
            if (suggestionActive === true && userSettings.hotkeymode) {
                onContentChange(0, true);
            } else if (!userSettings.hotkeymode) {
                if (!suggestionActive)
                    suggestionActive = true;
                onContentChange(0, true);
            }
        }).blur(function() {
            hasInputFocus = 0;
            if (!internalConfig.isMouseDownOnSelection) {
                hideSuggestionResults();
            }
        }).click(function() {
            // Display selection options when clicking into an already focused field
            if (hasInputFocus++ > 1 && !suggestionDropdown.visible()) {
                onContentChange(0, true);
            } else {
                devLogger.trace('hasInputFocus = ' + hasInputFocus);
                devLogger.trace('hasInputFocus > 1: ' + (hasInputFocus > 1));
                devLogger.trace('Not visible: ' + (!suggestionDropdown.visible()));
                devLogger.trace('Is visible: ' + suggestionDropdown.visible());
            }
        }).bind('outcome', function() {
            hasInputFocus = 0;
            hideSuggestionResults();
        }).bind("seek", function() {
            // Consider unifying argument specification here
            var callbackFunction = (arguments.length > 1) ? arguments[1] : null;

            function searchResultCallback(queryTerm, receivedData) {
                var foundResult;
                if (receivedData && receivedData.length) {
                    for (var indexCounter = 0; indexCounter < receivedData.length; indexCounter++) {
                        if (receivedData[indexCounter].result.toLowerCase() === queryTerm.toLowerCase()) {
                            foundResult = receivedData[indexCounter];
                            break;
                        }
                    }
                }
                if (typeof callbackFunction === "function") {
                    callbackFunction(foundResult);
                } else {
                    inputJQueryObject.trigger("outcome", foundResult && [foundResult.data, foundResult.value]);
                }
            }
            jQueryAlias.each(splitAndTrimWords(getCurrentInputContent()), function(indexCounter, currentWord) {
                initiateDataRequest(currentWord, searchResultCallback, searchResultCallback);
            });
        }).bind("clearStore", function() {
            dataStore.flush();
        }).bind("configureSettings", function() {
            jQueryAlias.extend(userSettings, arguments[1]);
            // If data has been updated, repopulate the cache
            if ("inputData" in arguments[1])
                dataStore.populate();
        }).bind("disableSuggestText", function() {
            suggestionDropdown.unbind();
            inputJQueryObject.unbind();
            jQueryAlias(inputElement.form).unbind(".suggestText");
        });

        function confirmSelection() {
            var chosenItem = suggestionDropdown.selected();
            if (!chosenItem)
                return false;

            var newValue = chosenItem.result;
            lastContent = newValue;

            if (userSettings.multiple) {
                var contentWords = splitAndTrimWords(getCurrentInputContent());
                if (contentWords.length > 1) {
                    var delimiterLength = userSettings.multipleSeparator.length;
                    var currentCursorPosition = jQueryAlias(inputElement).selection().start;
                    var wordAtIndex, currentProgress = 0;
                    jQueryAlias.each(contentWords, function(indexCounter, currentWord) {
                        currentProgress += currentWord.length;
                        if (currentCursorPosition <= currentProgress) {
                            wordAtIndex = indexCounter;
                            return false;
                        }
                        currentProgress += delimiterLength;
                    });
                    contentWords[wordAtIndex] = newValue;
                    // Note: This part is intended to set the cursor, but its effect might be overridden elsewhere.
                    // jQueryAlias.TextSuggestor.Selection(inputElement, currentProgress + delimiterLength, currentProgress + delimiterLength);
                    newValue = contentWords.join(userSettings.multipleSeparator);
                }
                newValue += userSettings.multipleSeparator;

            } else if (userSettings.hotkeymode) {
                suggestionActive = false;
                var currentText = getCurrentInputContent();
                currentText = currentText.substring(0, startCursorPosition - 1);
                devLogger.notice("Data found! " + chosenItem.data[0] + ' ' + chosenItem.data[1]);
                newValue = currentText + userSettings.renderOutcome(chosenItem.data);
                if (inputElement.value === undefined) {
                    newValue = newValue + '<span id="startCursorMarker">—</span>';
                }

                // saveContentEditableCursor(); // Disabling for now, re-enable if needed
            }
            getCurrentInputContent(newValue);
            immediatelyHideResults();
            inputJQueryObject.trigger("outcome", [chosenItem.data, chosenItem.value]);
            if (userSettings.hotkeymode && inputElement.value === undefined)
                restoreEditableCursor();
            return true;
        }

        function initializeContentEditable() {
            if (currentEditableSelection.getRangeAt !== undefined) {
                // Standard browser selection handling
            } else if (
                document.createSelectionRange &&
                currentEditableSelection.anchorNode &&
                currentEditableSelection.anchorOffset &&
                currentEditableSelection.focusNode &&
                currentEditableSelection.focusOffset
            ) {
                var temporaryVar = ''; // Placeholder for older Safari range handling
            }
        }

        function saveContentEditableCursor() {
            // 'contentEditableElement' refers to the contentEditable div
            // Ensure selection is within the bounds of the editable region
            var anchorWithinEditable = false,
                focusWithinEditable = false,
                currentSelection = window.getSelection(),
                anchorParentNode = currentSelection.anchorNode,
                focusParentNode = currentSelection.focusNode;

            while (anchorParentNode && anchorParentNode !== document.documentElement) {
                if (anchorParentNode === contentEditableElement) {
                    anchorWithinEditable = true;
                }
                anchorParentNode = anchorParentNode.parentNode;
            }

            while (focusParentNode && focusParentNode !== document.documentElement) {
                if (focusParentNode === contentEditableElement) {
                    focusWithinEditable = true;
                }
                focusParentNode = focusParentNode.parentNode;
            }

            if (!anchorWithinEditable || !focusWithinEditable) {
                return; // Selection is outside the editable area
            }

            currentEditableSelection = window.getSelection();

            // Retrieve the range (standard compliant browsers)
            if (currentEditableSelection.getRangeAt !== undefined) {
                currentEditableRange = currentEditableSelection.getRangeAt(0);
                //devLogger.trace("Inside content-editable keyup event.");
                // Retrieve range (older Safari)
            } else if (
                document.createSelectionRange &&
                currentEditableSelection.anchorNode &&
                currentEditableSelection.anchorOffset &&
                currentEditableSelection.focusNode &&
                currentEditableSelection.focusOffset
            ) {
                currentEditableRange = document.createSelectionRange();
                currentEditableRange.setStart(currentSelection.anchorNode, currentEditableSelection.anchorOffset);
                currentEditableRange.setEnd(currentSelection.focusNode, currentEditableSelection.focusOffset);
            } else {
                // Fallback for unrecognized browsers (e.g., older IE).
                // TODO: Consider gracefully degrading to a standard textarea in such cases.
            }

            var startCursorMarker = document.createElement('span'),
                isCollapsed = !!currentEditableRange.collapsed;

            startCursorMarker.id = 'startCursorMarker';
            startCursorMarker.appendChild(document.createTextNode('—'));

            // Insert the beginning cursor indicator
            currentEditableRange.insertNode(startCursorMarker);

            // If text was selected, insert an end cursor indicator
            if (!isCollapsed) {
                var endCursorMarker = document.createElement('span');
                endCursorMarker.id = 'endCursorMarker';
                currentEditableRange.collapse();
                currentEditableRange.insertNode(endCursorMarker);
            }
        }

        function restoreEditableCursor() {
            // A brief delay helps prevent the browser's default initial selection behavior
            setTimeout(function() {
                var startCursorMarker = document.getElementById('startCursorMarker'),
                    endCursorMarker = document.getElementById('endCursorMarker');

                if (window.getSelection) { // Modern browsers (Firefox, Safari, Opera)
                    currentEditableSelection = window.getSelection();
                    var selectionRange = document.createRange();
                    selectionRange.selectNode(startCursorMarker);
                    // Apply the range as selection
                    currentEditableSelection.removeAllRanges();
                    currentEditableSelection.addRange(selectionRange);
                    // Remove the temporary cursor marker
                    document.execCommand('delete', false, null);
                } else {
                    if (document.body.createTextRange) { // Internet Explorer specific handling
                        var textRangeToSelect = document.body.createTextRange();
                        textRangeToSelect.moveToElementText(startCursorMarker);
                        textRangeToSelect.select();
                        document.selection.clear();
                    }
                }

                // Re-register the selection if needed
                // captureSelection();
            }, 10);
        }

        function onContentChange(unusedParam, forceCheck) {
            if (lastPressedKeyCode === CONTROL_KEY_CODES.DELETE_KEY) {
                suggestionDropdown.hide();
                return;
            }

            var currentSearchValue = getCurrentInputContent();
            if (!forceCheck && currentSearchValue === lastContent) {
                return;
            }

            currentSearchValue = extractSearchQuery(currentSearchValue);
            lastContent = currentSearchValue;
            devLogger.trace("onContentChange currentSearchValue = " + currentSearchValue);

            if (currentSearchValue.length >= userSettings.minChars) {
                inputJQueryObject.addClass(userSettings.loadingClass);
                if (!userSettings.matchCase)
                    currentSearchValue = currentSearchValue.toLowerCase();
                initiateDataRequest(currentSearchValue, processReceivedData, immediatelyHideResults);
            } else {
                devLogger.trace("In else block for character count.");
                haltLoadingIndicator();
                if (userSettings.initialMessage !== null) {
                    suggestionDropdown.emptyList();
                    suggestionDropdown.showItems({}, null);
                    suggestionDropdown.show();
                } else {
                    suggestionDropdown.hide();
                }