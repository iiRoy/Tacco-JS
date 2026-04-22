(function(jq, doc, win) {

    const visualAdjustment = (function() {
        const fetchElementMatrix = function(targetElement) {
            let currentMatrix = targetElement.data('matrixRepresentation');
            if (!currentMatrix) {
                currentMatrix = [1, 0, 0, 1, 0, 0];
                targetElement.data('matrixRepresentation', currentMatrix);
            }
            return [...currentMatrix];
        };

        const applyMatrixToElement = function(targetElement, newMatrix) {
            targetElement.data('matrixRepresentation', newMatrix);
            const styleValue = `matrix(${newMatrix.join(', ')})`;
            ['WebkitTransform', 'MozTransform', 'OTransform', 'msTransform', 'transform'].forEach(prop => {
                targetElement.css(prop, styleValue);
            });
        };

        const retrieveDisplacement = function(targetElement) {
            const currentMatrix = fetchElementMatrix(targetElement);
            return {
                x_coord: parseInt(currentMatrix[4]),
                y_coord: parseInt(currentMatrix[5])
            };
        };

        const magnifyElement = function(targetElement, factor) {
            const currentMatrix = fetchElementMatrix(targetElement);
            currentMatrix[0] = factor;
            currentMatrix[3] = factor;
            applyMatrixToElement(targetElement, currentMatrix);
        };

        const shiftElement = function(targetElement, xDelta, yDelta) {
            const currentMatrix = fetchElementMatrix(targetElement);
            currentMatrix[4] = xDelta;
            currentMatrix[5] = yDelta;
            applyMatrixToElement(targetElement, currentMatrix);
        };

        const spinElement = function(targetElement, angleDegrees) {
            const currentMatrix = fetchElementMatrix(targetElement);
            const angleRadians = angleDegrees * (Math.PI / 180);
            const negativeAngleRadians = angleRadians * -1;
            currentMatrix[1] = angleRadians;
            currentMatrix[2] = negativeAngleRadians;
            applyMatrixToElement(targetElement, currentMatrix);
        };

        return {
            magnify: magnifyElement,
            shift: shiftElement,
            spin: spinElement,
            retrieveDisplacement: retrieveDisplacement
        };
    })();

    let isAppleDevice = win.navigator.platform === 'MacIntel';
    let pointerX = 0;
    let pointerY = 0;
    let applicationState = {
        controlKeyActive: false,
        shiftKeyActive: false,
        isUserSelecting: false,
        activeContentUnit: null,
        activeContentUnitIndex: 0
    };

    let formatTriggers = {
        66: 'boldStyle',
        73: 'italicStyle',
        85: 'underlineStyle',
        112: 'headingLevelOne',
        113: 'headingLevelTwo',
        122: 'undoOperation'
    };

    let configurationSettings;

    const eventProcessor = {
        handleKeyDown: function(e) {
            // This is the function the user asked to be cloned *up to*.
            // The body of this function is not included in this clone request.
        },
        handleKeyUp: function(e) {},
        handleFocus: function(e) {},
        processPaste: function(e) {},
        handleMouseDown: function(e) {},
        handleMouseUp: function(e) {},
        handleMouseMove: function(e) {},
        handleBlur: function(e) {},
        commands: {
            boldStyle: function() {},
            italicStyle: function() {},
            underlineStyle: function() {},
            headingLevelOne: function() {},
            headingLevelTwo: function() {},
            undoOperation: function() {},
            createLinkAction: function() {},
            removeLinkAction: function() {}
        }
    };

    const auxiliaryFunctions = {
        inputHandler: {
            checkControlKey: function(eventObject) {
                return (isAppleDevice && eventObject.metaKey) || (!isAppleDevice && eventObject.ctrlKey);
            },
            checkShiftKey: function(eventObject) {
                return eventObject.shiftKey;
            },
            getModifierAction: function(eventObject) {
                const eventCode = eventObject.which;
                return formatTriggers[eventCode];
            },
            isEnterKey: function(eventObject) {
                return eventObject.which === 13;
            },
            isArrowKey: function(eventObject) {
                return eventObject.which >= 37 || eventObject.which <= 40;
            }
        },
        domManipulator: {
            insertElement: function(parentElem, tagName, shouldFocus, isEditable) {
                const newDomElement = jq(doc.createElement(tagName));
                newDomElement.attr('contenteditable', Boolean(isEditable));
                newDomElement.append(' ');
                parentElem.append(newDomElement);
                if (shouldFocus) {
                    applicationState.activeContentUnit = parentElem.children().last();
                    auxiliaryFunctions.pointerPosition.placeAt(parentElem, 0, applicationState.activeContentUnit);
                }
                return newDomElement;
            }
        },
        pointerPosition: {
            placeAt: function(containerElement, positionOffset, targetChildElement) {
                let selectionRange;
                if (doc.createRange) {
                    selectionRange = doc.createRange();
                    const currentSelection = win.getSelection();
                    const lastChildInContainer = containerElement.children().last();
                    const contentLen = lastChildInContainer.html().length - 1;
                    const elementToModify = targetChildElement ? targetChildElement[0] : lastChildInContainer[0];
                    const finalPosition = typeof positionOffset !== 'undefined' ? positionOffset : contentLen;
                    selectionRange.setStart(elementToModify, finalPosition);
                    selectionRange.collapse(true);
                    currentSelection.removeAllRanges();
                    currentSelection.addRange(selectionRange);
                } else {
                    selectionRange = doc.body.createTextRange();
                    selectionRange.moveToElementText(targetChildElement);
                    selectionRange.collapse(false);
                    selectionRange.select();
                }
            }
        },
        textSelection: {
            persist: function() {
                if (win.getSelection) {
                    const currentSel = win.getSelection();
                    if (currentSel.rangeCount > 0) {
                        return currentSel.getRangeAt(0);
                    }
                } else if (doc.selection && doc.selection.createRange) {
                    return doc.selection.createRange();
                }
                return null;
            },
            restore: function(savedRange) {
                if (savedRange) {
                    if (win.getSelection) {
                        const currentSel = win.getSelection();
                        currentSel.removeAllRanges();
                        currentSel.addRange(savedRange);
                    } else if (doc.selection && savedRange.select) {
                        savedRange.select();
                    }
                }
            },
            extractContent: function() {
                let content = '';
                if (win.getSelection) {
                    content = win.getSelection().toString();
                } else if (doc.getSelection) {
                    content = doc.getSelection().toString();
                } else if (doc.selection) {
                    content = doc.selection.createRange().text;
                }
                return content;
            },
            clear: function() {
                if (win.getSelection) {
                    if (win.getSelection().empty) {
                        win.getSelection().empty();
                    } else if (win.getSelection().removeAllRanges) {
                        win.getSelection().removeAllRanges();
                    }
                } else if (doc.selection) {
                    doc.selection.empty();
                }
            },
            getBoundaryElement: function(selectionObject) {
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
                } else if (doc.selection && doc.selection.createRange) {
                    return doc.selection;
                }
                return null;
            }
        },
        inputValidation: {
            isValidUrl: function(urlCandidate) {
                return (/^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/).test(urlCandidate);
            }
        }
    };

    const floatingToolbar = {
        repositionToolbar: function(editorContainer, toolbarElement) {
            const currentSelection = win.getSelection();
            if (!currentSelection.rangeCount) return;
            const selectionRange = currentSelection.getRangeAt(0);
            const boundingBox = selectionRange.getBoundingClientRect();
            const toolbarWidth = toolbarElement.width();
            const toolbarHeight = toolbarElement.height();
            const editorOffsetLeft = editorContainer.offset().left;
            const targetCoords = {
                x_val: (boundingBox.left + boundingBox.width / 2) - (toolbarWidth / 2),
                y_val: boundingBox.top - toolbarHeight - 8 + jq(doc).scrollTop()
            };
            visualAdjustment.shift(toolbarElement, targetCoords.x_val, targetCoords.y_val);
        },
        refreshStatus: function(editorContainer, toolbarElement) {
            toolbarElement.find('button').removeClass('active');
            const currentSelection = win.getSelection();
            const detectedFormats = [];
            if (currentSelection.focusNode) {
                floatingToolbar.traverseForStyles(currentSelection.focusNode, detectedFormats);
            }

            const styleMap = {
                'b': 'boldStyle',
                'i': 'italicStyle',
                'u': 'underlineStyle',
                'h1': 'headingLevelOne',
                'h2': 'headingLevelTwo',
                'a': 'hyperlink',
                'ul': 'unorderedList',
                'ol': 'orderedList'
            };
            for (let k = 0; k < detectedFormats.length; k++) {
                const currentFormat = detectedFormats[k];
                const className = styleMap[currentFormat];
                if (className) {
                    toolbarElement.find(`button.${className}`).addClass('active');
                }
            }
        },
        traverseForStyles: function(nodeToCheck, formatList) {
            const permittedTags = ['b', 'i', 'u', 'h1', 'h2', 'ol', 'ul', 'li', 'a'];
            if (nodeToCheck && nodeToCheck.nodeName) {
                const nodeNameLower = nodeToCheck.nodeName.toLowerCase();
                if (nodeNameLower === '#text' || permittedTags.includes(nodeNameLower)) {
                    if (nodeNameLower !== '#text') {
                        formatList.push(nodeNameLower);
                    }
                    if (nodeToCheck.parentNode) {
                        floatingToolbar.traverseForStyles(nodeToCheck.parentNode, formatList);
                    }
                }
            }
        },
        constructControls: function(editorContainer, toolbarElement) {
            const controlList = auxiliaryFunctions.domManipulator.insertElement(toolbarElement, 'ul', false, false);
            for (const commandKey in configurationSettings.modifiers) {
                const listItem = auxiliaryFunctions.domManipulator.insertElement(controlList, 'li', false, false);
                const actionButton = auxiliaryFunctions.domManipulator.insertElement(listItem, 'button', false, false);
                actionButton.attr('data-editor-action', configurationSettings.modifiers[commandKey]);
                actionButton.addClass(configurationSettings.modifiers[commandKey]);
            }
            toolbarElement.find('button').on('click', function(eventObject) {
                eventObject.preventDefault();
                const actionName = jq(this).attr('data-editor-action');
                if (eventProcessor && eventProcessor.commands && eventProcessor.commands[actionName]) {
                    eventProcessor.commands[actionName].call(editorContainer, eventObject);
                }
            });
            const linkInputArea = auxiliaryFunctions.domManipulator.insertElement(toolbarElement, 'div', false, false);
            linkInputArea.addClass('link-input-section');
            const linkEntryField = auxiliaryFunctions.domManipulator.insertElement(linkInputArea, 'input', false, false);
            linkEntryField.attr({
                type: 'text'
            });
            const closeLinkButton = auxiliaryFunctions.domManipulator.insertElement(linkInputArea, 'button', false, false);
            closeLinkButton.on('click', function(eventObject) {
                eventObject.preventDefault();
                const parentEditor = jq(this).closest('.editor');
                jq(this).closest('.link-input-section').hide();
                jq(this).closest('.floatingToolbar').find('ul').show();
            });
        },
        displayToolbar: function() {
            const editorInstance = jq(this);
            let toolbarElement = editorInstance.parent().find('.floatingToolbar');
            if (!toolbarElement.length) {
                toolbarElement = auxiliaryFunctions.domManipulator.insertElement(editorInstance.parent(), 'div', false, false);
                toolbarElement.addClass('plugin-toolbar floatingToolbar');
            }
            toolbarElement.empty();
            floatingToolbar.constructControls(editorInstance, toolbarElement);
            toolbarElement.show();
            floatingToolbar.refreshStatus(editorInstance, toolbarElement);
            if (!toolbarElement.hasClass('active-toolbar')) {
                toolbarElement.addClass('animate-in');
            } else {
                toolbarElement.removeClass('animate-in');
            }
            floatingToolbar.repositionToolbar(editorInstance, toolbarElement);
            toolbarElement.addClass('active-toolbar');
        },
        updateToolbar: function() {
            const toolbarElement = jq(this).parent().find('.floatingToolbar');
            floatingToolbar.refreshStatus(jq(this), toolbarElement);
        },
        hideAndReset: function() {
            const toolbarElement = jq(this).parent().find('.floatingToolbar');
            if (!toolbarElement.hasClass('active-toolbar')) return;
            toolbarElement.removeClass('active-toolbar');
            floatingToolbar.concealLinkEntry.call(this);
            floatingToolbar.revealButtons.call(this);
            setTimeout(function() {
                if (toolbarElement.hasClass('active-toolbar')) return;
                toolbarElement.hide();
            }, 500);
        },
        concealButtons: function() {
            jq(this).parent().find('.floatingToolbar').find('ul').hide();
        },
        revealButtons: function() {
            jq(this).parent().find('.floatingToolbar').find('ul').show();
        },
        presentLinkEntry: function(currentSelection) {
            floatingToolbar.concealButtons.call(this);
            const editorReference = this;
            const linkInputField = jq(this).parent().find('.floatingToolbar').find('input[type=text]');
            const hasExistingLink = linkInputField.closest('.plugin-toolbar').find('button.hyperlink').hasClass('active');
            linkInputField.off('keydown');
            linkInputField.on('keydown', function(eventObject) {
                const inputField = jq(this);
                if (auxiliaryFunctions.inputHandler.isEnterKey(eventObject)) {
                    eventObject.preventDefault();
                    let enteredUrl = inputField.val();
                    if (auxiliaryFunctions.inputValidation.isValidUrl(enteredUrl)) {
                        eventObject.url = enteredUrl;
                        if (eventProcessor && eventProcessor.commands && eventProcessor.commands.createLinkAction) {
                            eventProcessor.commands.createLinkAction(eventObject, currentSelection);
                        }
                        floatingToolbar.hideAndReset.call(editorReference);
                    } else if (enteredUrl === '' && hasExistingLink) {
                        if (eventProcessor && eventProcessor.commands && eventProcessor.commands.removeLinkAction) {
                            eventProcessor.commands.removeLinkAction(eventObject, currentSelection);
                        }
                        floatingToolbar.hideAndReset.call(editorReference);
                    }
                }
            });
            linkInputField.on('paste', function(eventObject) {
                const inputField = jq(this);
                setTimeout(function() {
                    let pastedText = inputField.val();
                    if (/^http:\/\/https?:\/\//.test(pastedText)) {
                        pastedText = pastedText.substring(7);
                        inputField.val(pastedText);
                    }
                }, 1);
            });
            let initialLinkText = 'http://';
            if (hasExistingLink) {
                const anchorElement = jq(auxiliaryFunctions.textSelection.getBoundaryElement(currentSelection)).closest('a');
                initialLinkText = anchorElement.prop('href') || initialLinkText;
            }
            jq(this).parent().find('.link-input-section').show();
            linkInputField.val(initialLinkText).focus();
        },
        concealLinkEntry: function() {
            jq(this).parent().find('.floatingToolbar').find('.link-input-section').hide();
        }
    };

    const editorOperations = {
        attachEventHandlers: function(editorElement) {
            editorElement.on('keydown', eventProcessor.handleKeyDown);
            editorElement.on('keyup', eventProcessor.handleKeyUp);
            editorElement.on('focus', eventProcessor.handleFocus);
            editorElement.on('paste', eventProcessor.processPaste);
            editorElement.on('mousedown', eventProcessor.handleMouseDown);
            editorElement.on('mouseup', eventProcessor.handleMouseUp);
            editorElement.on('mousemove', eventProcessor.handleMouseMove);
            editorElement.on('blur', eventProcessor.handleBlur);
            jq('body').on('mouseup', function(eventObject) {
                if (eventObject.target === eventObject.currentTarget && applicationState.isUserSelecting) {
                    eventProcessor.handleMouseUp.call(editorElement, eventObject);
                }
            });
        },
        managePlaceholderDisplay: function(eventContext) {
            const currentElement = jq(this);
            if (/^\s*$/.test(currentElement.text())) {
                currentElement.empty();
                const placeholderParagraph = auxiliaryFunctions.domManipulator.insertElement(currentElement, 'p').addClass('editor-placeholder-text');
                placeholderParagraph.append(currentElement.attr('data-editor-hint'));
                auxiliaryFunctions.domManipulator.insertElement(currentElement, 'p', typeof eventContext.focus !== 'undefined' ? eventContext.focus : false, true);
            } else {
                currentElement.find('.editor-placeholder-text').remove();
            }
        },
        clearPlaceholder: function() {
            jq(this).find('.editor-placeholder-text').remove();
        },
        maintainFocusState: function() {
            const selectionAnchorNode = win.getSelection() ? win.getSelection().anchorNode : doc.activeElement;
            if (selectionAnchorNode) {
                let currentFocusParent = selectionAnchorNode.parentNode;
                const focusChanged = currentFocusParent !== applicationState.activeContentUnit;
                const childElements = this.children;
                let currentUnitIndex = 0;

                if (currentFocusParent === this) {
                    currentFocusParent = selectionAnchorNode;
                }

                for (let i = 0; i < childElements.length; i++) {
                    if (currentFocusParent === childElements[i]) {
                        currentUnitIndex = i;
                        break;
                    }
                }
                if (focusChanged) {
                    applicationState.activeContentUnit = currentFocusParent;
                    applicationState.activeContentUnitIndex = currentUnitIndex;
                }
            }
        },
        createContentStorage: function(editorElement) {
            const instanceId = jq('body').find('.text-editor-instance').length + 1;
            editorElement.attr('data-notebook-instance-id', instanceId);
            const mainBody = jq('body');
            const hiddenContentArea = jq('<textarea></textarea>');
            hiddenContentArea.css({
                position: 'absolute',
                left: -1000,
                visibility: 'hidden'
            });
            hiddenContentArea.attr('id', 'notebook-content-storage-' + instanceId);
            mainBody.append(hiddenContentArea);
        },
        initializeEditor: function(editorElement, customEditorOptions) {
            configurationSettings = customEditorOptions;
            editorOperations.createContentStorage(editorElement);
            editorElement.attr('editor-operating-mode', configurationSettings.mode);
            editorElement.attr('data-editor-hint', configurationSettings.placeholder);
            editorElement.attr('contenteditable', true);
            editorElement.css('position', 'relative');
            editorElement.addClass('text-editor-instance editor-component');
            editorOperations.managePlaceholderDisplay.call(editorElement, {});
            editorOperations.maintainFocusState.call(editorElement);
            if (configurationSettings.autoFocus === true) {
                const firstEditableParagraph = editorElement.find('p:not(.editor-placeholder-text)');
                auxiliaryFunctions.pointerPosition.placeAt(editorElement, 0, firstEditableParagraph);
            }
        }
    };

})(jQuery, document, window);