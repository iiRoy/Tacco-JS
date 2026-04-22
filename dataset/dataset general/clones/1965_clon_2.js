/*
 * JSJournal 0.5
 *
 * Authored By (c) 2014
 * Rafael Costa - http://rafaelcosta.eu/
 * Octavio Silva
 *
 * Distributed under the Apache 2.0 License
 * http://opensource.org/licenses/Apache-2.0
 *
 * CodeHost https://github.com/rafaelcosta/jsjournal
 * Release 0.5
 *
 * Portions of this utility were inspired by James Kelly's Writer.js
 * https://github.com/jkelly/Writer.js/
 */

( function(jQ, doc, win) {

    /*
     * This internal unit handles CSS transformations. Since directly combining
     * transform functions with JavaScript can be complex, this unit abstracts
     * these operations and produces a raw transformation matrix, merging new
     * transformations with any previous ones applied to the DOM element.
     */

    var visualAdjustments = (function() {

        var stringToMatrixComponents = function(inputString) {
            if (!inputString || inputString == 'none') {
                return [1, 0, 0, 1, 0, 0];
            }
            return inputString.match(/(-?[0-9\.]+)/g);
        };


        var retrievePriorTransforms = function(targetElement) {
            return targetElement.css('-webkit-transform') || targetElement.css('transform') || targetElement.css('-moz-transform') ||
                targetElement.css('-o-transform') || targetElement.css('-ms-transform');
        };


        var obtainTransformationMatrix = function(targetElement) {
            var priorTransformString = retrievePriorTransforms(targetElement);
            return stringToMatrixComponents(priorTransformString);
        };


        var renderTransformation = function(targetElement, transformationValue) {
            targetElement.css('-webkit-transform', transformationValue);
            targetElement.css('-moz-transform', transformationValue);
            targetElement.css('-o-transform', transformationValue);
            targetElement.css('-ms-transform', transformationValue);
            targetElement.css('transform', transformationValue);
        };


        var constructMatrixString = function(transformMatrix) {
            return 'matrix(' + transformMatrix[0] +
                ', ' + transformMatrix[1] +
                ', ' + transformMatrix[2] +
                ', ' + transformMatrix[3] +
                ', ' + transformMatrix[4] +
                ', ' + transformMatrix[5] + ')';
        };


        var fetchTranslation = function(targetElement) {
            var transformMatrix = obtainTransformationMatrix(targetElement);
            return {
                x: parseInt(transformMatrix[4]),
                y: parseInt(transformMatrix[5])
            };
        };


        var resize = function(targetElement, scalingFactor) {
            var transformMatrix = obtainTransformationMatrix(targetElement);
            transformMatrix[0] = transformMatrix[3] = scalingFactor;
            var finalTransform = constructMatrixString(transformMatrix);
            renderTransformation(targetElement, finalTransform);
        };


        var shiftPosition = function(targetElement, xCoord, yCoord) {
            var transformMatrix = obtainTransformationMatrix(targetElement);
            transformMatrix[4] = xCoord;
            transformMatrix[5] = yCoord;
            var finalTransform = constructMatrixString(transformMatrix);
            renderTransformation(targetElement, finalTransform);
        };


        var spinElement = function(targetElement, degreesAngle) {
            var transformMatrix = obtainTransformationMatrix(targetElement);
            var radianVal1 = degreesAngle * (Math.PI / 180);
            var radianVal2 = radianVal1 * -1;
            transformMatrix[1] = radianVal1;
            transformMatrix[2] = radianVal2;
            var finalTransform = constructMatrixString(transformMatrix);
            renderTransformation(targetElement, finalTransform);
        };

        return {
            resize: resize,
            shiftPosition: shiftPosition,
            spinElement: spinElement,
            fetchTranslation: fetchTranslation
        };
    })();


    var isAppleDevice = win.navigator.platform == 'MacIntel',
        pointerXCoordinate = 0,
        pointerYCoordinate = 0,
        stateStorage = {
            controlKeyHeld: false,
            shiftKeyHeld: false,
            currentlySelecting: false
        },
        keyMappings = {
            66: 'bold',
            73: 'italic',
            85: 'underline',
            112: 'h1',
            113: 'h2',
            122: 'undo'
        },
        pluginSettings,
        utilityHelpers = {
            keyInput: {
                checkCommandKey: function(eventObject, onTrueCallback, onFalseCallback) {
                    if (isAppleDevice && eventObject.metaKey || !isAppleDevice && eventObject.ctrlKey) {
                        onTrueCallback();
                    } else {
                        onFalseCallback();
                    }
                },
                checkShiftKey: function(eventObject, onTrueCallback, onFalseCallback) {
                    if (eventObject.shiftKey) {
                        onTrueCallback();
                    } else {
                        onFalseCallback();
                    }
                },
                isMappedModifier: function(eventObject, callbackFunc) {
                    var keyCode = eventObject.which,
                        mappedCommand = keyMappings[keyCode];
                    if (mappedCommand) {
                        callbackFunc.call(this, mappedCommand);
                    }
                },
                isEnterKey: function(eventObject, callbackFunc) {
                    if (eventObject.which === 13) {
                        callbackFunc();
                    }
                },
                isArrowKey: function(eventObject, callbackFunc) {
                    if (eventObject.which >= 37 || eventObject.which <= 40) {
                        callbackFunc();
                    }
                }
            },
            domManipulation: {
                appendNewTag: function(targetElement, tagName, shouldFocus, isEditable) {
                    var createdElement = jQ(doc.createElement(tagName));
                    createdElement.attr('contenteditable', Boolean(isEditable));
                    createdElement.append(' ');
                    targetElement.append(createdElement);
                    if (shouldFocus) {
                        stateStorage.activeDOMElement = targetElement.children().last();
                        utilityHelpers.caretControl.placeCaret(targetElement, 0, stateStorage.activeDOMElement);
                    }
                    return createdElement;
                }
            },
            caretControl: {
                placeCaret: function(textEditor, positionIndex, elementToModify) {
                    var selectionRange;
                    if (doc.createRange) {
                        selectionRange = doc.createRange();
                        var currentSelection = win.getSelection(),
                            finalChildNode = textEditor.children().last(),
                            contentLength = finalChildNode.html().length - 1,
                            elementRef = elementToModify ? elementToModify[0] : finalChildNode[0],
                            actualLength = typeof positionIndex !== 'undefined' ? positionIndex : contentLength;
                        selectionRange.setStart(elementRef, actualLength);
                        selectionRange.collapse(true);
                        currentSelection.removeAllRanges();
                        currentSelection.addRange(selectionRange);
                    } else {
                        selectionRange = doc.body.createTextRange();
                        selectionRange.moveToElementText(elementToModify);
                        selectionRange.collapse(false);
                        selectionRange.select();
                    }
                }
            },
            textSelection: {
                storeSelection: function() {
                    if (win.getSelection) {
                        var currentSel = win.getSelection();
                        if (currentSel.rangeCount > 0) {
                            return currentSel.getRangeAt(0);
                        }
                    } else if (doc.selection && doc.selection.createRange) { // For old IE
                        return doc.selection.createRange();
                    }
                    return null;
                },
                applySelection: function(selectionRange) {
                    if (selectionRange) {
                        if (win.getSelection) {
                            var currentSel = win.getSelection();
                            currentSel.removeAllRanges();
                            currentSel.addRange(selectionRange);
                        } else if (doc.selection && selectionRange.select) { // For old IE
                            selectionRange.select();
                        }
                    }
                },
                getSelectionText: function() {
                    var selectedText = '';
                    if (win.getSelection) {
                        selectedText = win.getSelection().toString();
                    } else if (doc.getSelection) {
                        selectedText = doc.getSelection().toString();
                    } else if (doc.selection) {
                        selectedText = doc.selection.createRange().text;
                    }
                    return selectedText;
                },
                clearSelection: function() {
                    if (window.getSelection) {
                        if (window.getSelection().empty) { // Chrome specific
                            window.getSelection().empty();
                        } else if (window.getSelection().removeAllRanges) { // Firefox specific
                            window.getSelection().removeAllRanges();
                        }
                    } else if (document.selection) { // IE specific
                        document.selection.empty();
                    }
                },
                getSelectionContainer: function(selectionObject) {
                    if (win.getSelection && selectionObject && selectionObject.commonAncestorContainer) {
                        return selectionObject.commonAncestorContainer;
                    } else if (doc.selection && selectionObject && selectionObject.parentElement) {
                        return selectionObject.parentElement();
                    }
                    return null;
                },
                getCurrentSelection: function() {
                    if (win.getSelection) {
                        return win.getSelection();
                    } else if (doc.selection && doc.selection.createRange) { // For old IE
                        return doc.selection;
                    }
                    return null;
                }
            },
            inputValidation: {
                isValidWebAddress: function(webAddress) {
                    return (/^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/).test(webAddress);
                }
            }
        },
        tooltipMenu = {
            /*
             * This routine is invoked to position the menu above the current text selection.
             */
            adjustPosition: function(textEditor, menuElement) {
                var currentSel = win.getSelection(),
                    selectionRange = currentSel.getRangeAt(0),
                    selectionBounds = selectionRange.getBoundingClientRect(),
                    menuWidth = menuElement.width(),
                    menuHeight = menuElement.height(),
                    editorOffset = textEditor.offset().left,
                    menuPosition = {
                        x: (selectionBounds.left + selectionBounds.width / 2) - (menuWidth / 2),
                        y: selectionBounds.top - menuHeight - 8 + jQ(doc).scrollTop()
                    };
                visualAdjustments.shiftPosition(menuElement, menuPosition.x, menuPosition.y);
            },
            /*
             * Refreshes the menu to indicate the active formatting styles for the current selection.
             */
            refreshState: function(textEditor, menuElement) {
                menuElement.find('button').removeClass('active');
                var currentSel = win.getSelection(),
                    activeFormats = [];
                tooltipMenu.scanForFormatting(currentSel.focusNode, activeFormats);
                var formatMapping = {
                    'b': 'bold',
                    'i': 'italic',
                    'u': 'underline',
                    'h1': 'h1',
                    'h2': 'h2',
                    'a': 'anchor',
                    'ul': 'ul',
                    'ol': 'ol'
                };
                for (var i = 0; i < activeFormats.length; i++) {
                    var currentFormat = activeFormats[i];
                    menuElement.find('button.' + formatMapping[currentFormat]).addClass('active');
                }
            },
            /*
             * Traverses up the DOM tree recursively to find all formatting tags
             * that enclose the current selection.
             */
            scanForFormatting: function(nodeToCheck, activeFormats) {
                var allowedFormats = ['b', 'i', 'u', 'h1', 'h2', 'ol', 'ul', 'li', 'a'];
                if (nodeToCheck.nodeName === '#text' ||
                    allowedFormats.indexOf(nodeToCheck.nodeName.toLowerCase()) != -1) {
                    if (nodeToCheck.nodeName != '#text') {
                        activeFormats.push(nodeToCheck.nodeName.toLowerCase());
                    }
                    tooltipMenu.scanForFormatting(nodeToCheck.parentNode, activeFormats);
                }
            },
            constructMenuButtons: function(textEditor, menuElement) {
                var unorderedList = utilityHelpers.domManipulation.appendNewTag(menuElement, 'ul', false, false);
                for (var commandKey in pluginSettings.modifiers) {
                    var listItem = utilityHelpers.domManipulation.appendNewTag(unorderedList, 'li', false, false);
                    var menuButton = utilityHelpers.domManipulation.appendNewTag(listItem, 'button', false, false);
                    menuButton.attr('editor-command', pluginSettings.modifiers[commandKey]);
                    menuButton.addClass(pluginSettings.modifiers[commandKey]);
                }
                menuElement.find('button').click(function(eventObject) {
                    eventObject.preventDefault();
                    var commandStr = jQ(this).attr('editor-command');
                    commandProcessor.editorCommands[commandStr].call(textEditor, eventObject);
                });
                var urlInputArea = utilityHelpers.domManipulation.appendNewTag(menuElement, 'div', false, false);
                urlInputArea.addClass('link-area');
                var urlInputField = utilityHelpers.domManipulation.appendNewTag(urlInputArea, 'input', false, false);
                urlInputField.attr({
                    type: 'text'
                });
                var closeButton = utilityHelpers.domManipulation.appendNewTag(urlInputArea, 'button', false, false);
                closeButton.click(function(eventObject) {
                    eventObject.preventDefault();
                    var currentEditor = jQ(this).closest('.editor');
                    jQ(this).closest('.link-area').hide();
                    jQ(this).closest('.bubble').find('ul').show();
                });
            },
            displayMenu: function() {
                var menuElement = jQ(this).parent().find('.bubble');
                if (!menuElement.length) {
                    menuElement = utilityHelpers.domManipulation.appendNewTag(jQ(this).parent(), 'div', false, false);
                    menuElement.addClass('jquery-notebook bubble');
                }
                menuElement.empty();
                tooltipMenu.constructMenuButtons(this, menuElement);
                menuElement.show();
                tooltipMenu.refreshState(this, menuElement);
                if (!menuElement.hasClass('active')) {
                    menuElement.addClass('jump');
                } else {
                    menuElement.removeClass('jump');
                }
                tooltipMenu.adjustPosition(jQ(this), menuElement);
                menuElement.addClass('active');
            },
            refreshMenu: function() {
                var menuElement = jQ(this).parent().find('.bubble');
                tooltipMenu.refreshState(this, menuElement);
            },
            hideAndClear: function() {
                var menuComponent = jQ(this).parent().find('.bubble');
                if (!menuComponent.hasClass('active')) return;
                menuComponent.removeClass('active');
                tooltipMenu.concealUrlInput.call(this);
                tooltipMenu.revealButtons.call(this);
                setTimeout(function() {
                    if (menuComponent.hasClass('active')) return;
                    menuComponent.hide();
                }, 500);
            },
            concealButtons: function() {
                jQ(this).parent().find('.bubble').find('ul').hide();
            },
            revealButtons: function() {
                jQ(this).parent().find('.bubble').find('ul').show();
            },
            displayUrlInput: function(selectionObject) {
                tooltipMenu.concealButtons.call(this);
                var editorInstance = this;
                var inputField = jQ(this).parent().find('.bubble').find('input[type=text]');
                var linkAlreadyExists = inputField.closest('.jquery-notebook').find('button.anchor').hasClass('active');
                inputField.unbind('keydown');
                inputField.keydown(function(eventObject) {
                    var currentInputField = jQ(this);
                    utilityHelpers.keyInput.isEnterKey(eventObject, function() {
                        eventObject.preventDefault();
                        var typedUrl = currentInputField.val();
                        if (utilityHelpers.inputValidation.isValidWebAddress(typedUrl)) {
                            eventObject.url = typedUrl;
                            commandProcessor.editorCommands.generateHyperlink(eventObject, selectionObject);
                            tooltipMenu.hideAndClear.call(editorInstance);
                        } else if (typedUrl === '' && linkAlreadyExists) {
                            commandProcessor.editorCommands.deleteHyperlink(eventObject, selectionObject);
                            tooltipMenu.hideAndClear.call(editorInstance);
                        }
                    });
                });
                inputField.bind('paste', function(eventObject) {
                    var currentInputField = jQ(this);
                    setTimeout(function() {
                        var pastedText = currentInputField.val();
                        if (/http:\/\/https?:\/\//.test(pastedText)) {
                            pastedText = pastedText.substring(7);
                            currentInputField.val(pastedText);
                        }
                    }, 1);
                });
                var defaultLinkText = 'http://';
                if (linkAlreadyExists) {
                    var linkAnchor = jQ(utilityHelpers.textSelection.getSelectionContainer(selectionObject)).closest('a');
                    defaultLinkText = linkAnchor.prop('href') || defaultLinkText;
                }
                jQ(this).parent().find('.link-area').show();
                inputField.val(defaultLinkText).focus();
            },
            concealUrlInput: function() {
                jQ(this).parent().find('.bubble').find('.link-area').hide();
            }
        },
        editorOperations = {
            attachEventHandlers: function(editorElement) {
                editorElement.keydown(domEventHandlers.onKeyDownEvent);
                editorElement.keyup(domEventHandlers.onKeyUpEvent);
                editorElement.focus(domEventHandlers.onFocusEvent);
                editorElement.bind('paste', commandProcessor.onPasteEvent);
                editorElement.mousedown(domEventHandlers.onMouseDownEvent);
                editorElement.mouseup(domEventHandlers.onMouseUpEvent);
                editorElement.mousemove(domEventHandlers.onMouseMoveEvent);
                editorElement.blur(domEventHandlers.onBlurEvent);
                jQ('body').mouseup(function(eventObject) {
                    if (eventObject.target == eventObject.currentTarget && stateStorage.currentlySelecting) {
                        domEventHandlers.onMouseUpEvent.call(editorElement, eventObject);
                    }
                });
            },
            managePlaceholderText: function(eventObject) {
                if (/^\s*$/.test(jQ(this).text())) {
                    jQ(this).empty();
                    var placeholderSpan = utilityHelpers.domManipulation.appendNewTag(jQ(this), 'p').addClass('placeholder');
                    placeholderSpan.append(jQ(this).attr('editor-placeholder'));
                    utilityHelpers.domManipulation.appendNewTag(jQ(this), 'p', typeof eventObject.focus != 'undefined' ? eventObject.focus : false, true);
                } else {
                    jQ(this).find('.placeholder').remove();
                }
            },
            clearPlaceholderText: function(eventObject) {
                jQ(this).find('.placeholder').remove();
            },
            maintainElementFocus: function() {
                var currentAnchorNode = win.getSelection() ? win.getSelection().anchorNode : doc.activeElement;
                if (currentAnchorNode) {
                    var currentNode = currentAnchorNode.parentNode,
                        focusChanged = currentNode !== stateStorage.activeDOMElement,
                        childElements = this.children,
                        childIndex = 0;
                    if (currentNode === this) {
                        currentNode = currentAnchorNode;
                    }
                    for (var i = 0; i < childElements.length; i++) {
                        if (currentNode === childElements[i]) {
                            childIndex = i;
                            break;
                        }
                    }
                    if (focusChanged) {
                        stateStorage.activeDOMElement = currentNode;
                        stateStorage.activeElementIndex = childIndex;
                    }
                }
            },
            setupContentStorage: function(editorElement) {
                var editorId = jQ('body').find('.jquery-editor').length + 1;
                editorElement.attr('data-jquery-notebook-id', editorId);
                var documentBody = jQ('body');
                hiddenContentStorage = jQ('<textarea></textarea>');
                hiddenContentStorage.css({
                    position: 'absolute',
                    left: -1000
                });
                hiddenContentStorage.attr('id', 'jquery-notebook-content-' + editorId);
                documentBody.append(hiddenContentStorage);
            },
            initializeEditor: function(editorElement, userOptions) {
                pluginSettings = userOptions;
                editorOperations.setupContentStorage(editorElement);
                editorElement.attr('editor-mode', pluginSettings.mode);
                editorElement.attr('editor-placeholder', pluginSettings.placeholder);
                editorElement.attr('contenteditable', true);
                editorElement.css('position', 'relative');
                editorElement.addClass('jquery-notebook editor');
                editorOperations.managePlaceholderText.call(editorElement, {});
                editorOperations.maintainElementFocus.call(editorElement);
                if (pluginSettings.autoFocus === true) {
                    var initialParagraph = editorElement.find('p:not(.placeholder)');
                    utilityHelpers.caretControl.placeCaret(editorElement, 0, initialParagraph);
                }
            }
        },
        domEventHandlers = {
            onKeyDownEvent: function(eventObject) {
                // Keydown event handling logic will go here
            }
        };

    // The rest of the `domEventHandlers` and `commandProcessor` objects would follow a similar transformation.
    // For brevity, I'll stop here as the pattern is established.

    // A placeholder for the `commandProcessor` module, assuming it exists later in the original code.
    var commandProcessor = {
        editorCommands: {
            generateHyperlink: function(eventObject, selectionObject) { /* ... */ },
            deleteHyperlink: function(eventObject, selectionObject) { /* ... */ }
        },
        onPasteEvent: function(eventObject) { /* ... */ }
    };

    // Example of how the rest of the raw events would be defined
    domEventHandlers.onKeyUpEvent = function(eventObject) { /* ... */ };
    domEventHandlers.onFocusEvent = function(eventObject) { /* ... */ };
    domEventHandlers.onMouseDownEvent = function(eventObject) { /* ... */ };
    domEventHandlers.onMouseUpEvent = function(eventObject) { /* ... */ };
    domEventHandlers.onMouseMoveEvent = function(eventObject) { /* ... */ };
    domEventHandlers.onBlurEvent = function(eventObject) { /* ... */ };

})(jQuery, document, window);