/*!
 * ==========================================================
 *  MARKDOWN CONTENT MANIPULATOR 2.1.0
 * ==========================================================
 * Creator: Alex Smith <http://example.com/alexsmith>
 * Distributed under the BSD 3-Clause License.
 *
 * DEPENDENCIES:
 * ==========================================================
 * [1]. https://github.com/anotherrepo/simple-text-edit-util
 * [2]. https://icons-library.com/awesome-icons
 * ==========================================================
 * ----------------------------------------------------------
 *
 */

var TextSculptor = function (targetElement, optionsConfig) {

    // Legacy Settings Adaptation
    if ("inquire" in optionsConfig) optionsConfig.inquiries = optionsConfig.inquire;
    if ("visualHint" in optionsConfig) optionsConfig.visualHints = optionsConfig.visualHint;
    if ("iconClassPrefix" in optionsConfig) optionsConfig.toolbarIconClass = optionsConfig.iconClassPrefix + '%s';
    if ("buttonClassPrefix" in optionsConfig) optionsConfig.toolbarButtonClass = optionsConfig.buttonClassPrefix + '%s';

    var leftSingleQuote  = '\u2018', // Opening single quote
        rightSingleQuote = '\u2019', // Closing single quote
        leftDoubleQuote  = '\u201C', // Opening double quote
        rightDoubleQuote = '\u201D', // Closing double quote
        nDashCharacter   = '\u2013', // N-dash symbol
        mDashCharacter   = '\u2014', // M-dash symbol
        ellipses         = '\u2026', // Horizontal ellipsis
        brokenBar        = '\u00A6', // Vertical broken bar
        copyrightSymbol  = '\u00A9', // Copyright mark
        soundRecordCopyright = '\u2117', // Sound recording copyright
        serviceMark      = '\u2120', // Service mark symbol
        tradeMarkSymbol  = '\u2122', // Trademark symbol
        registeredSymbol = '\u00AE', // Registered trademark
        plusMinus        = '\u00B1', // Plus-minus sign
        multiplicationSign = '\u00D7', // Multiplication operator
        divisionSign     = '\u00F7', // Division operator
        degreeSign       = '\u00B0', // Degree symbol
        leftAngleBracket = '\u2039', // Left single angle quote
        rightAngleBracket = '\u203A', // Right single angle quote
        leftDoubleAngle  = '\u00AB', // Left double angle quote
        rightDoubleAngle = '\u00BB', // Right double angle quote
        lessThanOrEqual  = '\u2264', // Less than or equal to
        greaterThanOrEqual = '\u2265', // Greater than or equal to
        notEqual         = '\u2260', // Not equal to
        leftArrow        = '\u2190', // Leftwards arrow
        rightArrow       = '\u2192', // Rightwards arrow
        upArrow          = '\u2191', // Upwards arrow
        downArrow        = '\u2193', // Downwards arrow
        carriageReturn   = '\u21B5', // Carriage return arrow
        middleDot        = '\u00B7', // Middle dot character

        instanceCore = this,
        globalWindow = window,
        htmlDocument = document,
        textProcessor = new Editor(targetElement),
        defaultSettings = {
            indentSpaces: '    ',
            showToolbar: true,
            enableShortcuts: false,
            mainAreaClass: 'content-edit-area',
            toolBarClass: 'content-tool-bar',
            toolbarIconClass: 'fas fa-%s',
            toolbarButtonClass: 'tool-bar-item tool-bar-item-%s',
            toolbarSeparatorClass: 'tool-bar-separator',
            toolbarPlacement: "before", // Should toolbar be placed 'before' or 'after' the textarea?
            dropdownClass: 'custom-dropdown custom-%s-dropdown',
            dialogClass: 'custom-dialog custom-dialog-%s',
            dialogHeaderClass: 'custom-dialog-header custom-dialog-%s-header',
            dialogContentClass: 'custom-dialog-content custom-dialog-%s-content',
            dialogFooterClass: 'custom-dialog-actions custom-dialog-%s-actions',
            dialogOverlayClass: 'custom-dialog-overlay custom-dialog-%s-overlay',
            closeATXHeaders: false, // Set to `true` for `#### My Header ####` style
            BOLD_MARKER: '**',
            ITALIC_MARKER: '_',
            UNORDERED_LIST_MARKER: '- ',
            ORDERED_LIST_MARKER: '%d. ',
            HORIZONTAL_RULE_MARKER: '---',
            INLINE_CODE_MARKER: '`',
            PREFORMATTED_CODE_MARKER: '    ', // Use ~~~\n%s\n~~~ or ```\n%s\n``` for fenced code blocks in "Markdown Extra"
            actionLabels: {
                confirm: 'OK',
                affirm: 'Yes',
                deny: 'No',
                abort: 'Cancel',
                openFile: 'Open',
                closeWindow: 'Close',
                boldText: 'Bold',
                italicText: 'Italic',
                codeBlock: 'Code',
                blockQuote: 'Quote',
                headingLevel: 'H1 ' + nDashCharacter + ' H6',
                hyperlink: 'Link',
                imageEmbed: 'Image',
                orderedList: 'Ordered List',
                unorderedList: 'Unordered List',
                separatorRule: 'Horizontal Rule',
                undoAction: 'Undo',
                redoAction: 'Redo'
            },
            inquiries: {
                link_caption: 'link caption here' + ellipses,
                link_caption_label: 'Link Caption',
                link_address: 'https://',
                link_address_label: 'Link Address',
                image_address: 'https://',
                image_address_label: 'Image Address'
            },
            visualHints: {
                generic_text: 'sample text' + ellipses,
                heading_text: 'Header',
                link_text: 'link text content',
                list_ul_text: 'List item entry',
                list_ol_text: 'List item entry',
                image_alt: 'Image description'
            },
            onEditorUpdate: function() {},
            onKeyPress: function() {},
            onClick: function() {},
            onReady: function() {},
            onCopy: function() {},
            onCut: function() {},
            onPaste: function() {}
        };

    var bodyContainer = htmlDocument.body,
        modalCurtain = htmlDocument.createElement('div'),
        dialogBox = htmlDocument.createElement('div'),
        floatingPanel = htmlDocument.createElement('div'),
        currentScrollPos = 0,
        activeButton = null,
        draggableElement = null,
        eventCoordX = 0,
        eventCoordY = 0,
        mouseOffsetX = 0,
        mouseOffsetY = 0,
        viewportWidth = bodyContainer.parentNode.offsetWidth,
        viewportHeight = globalWindow.innerHeight > bodyContainer.parentNode.offsetHeight ? globalWindow.innerHeight : bodyContainer.parentNode.offsetHeight,
        emptyFunction = function() {},

        // Re-aliasing core editor methods for brevity and minification
        textAreaElement = targetElement,
        indentContent = textProcessor.indent,
        insertContent = textProcessor.insert,
        outdentContent = textProcessor.outdent,
        replaceContent = textProcessor.replace,
        selectRange = textProcessor.select,
        currentSelection = textProcessor.selection,
        updateEditorHistory = textProcessor.updateHistory,
        wrapContent = textProcessor.wrap;

    function isDefined(checkValue) {
        return typeof checkValue !== "undefined";
    }

    function isText(checkValue) {
        return typeof checkValue === "string";
    }

    function isNumeric(checkValue) {
        return typeof checkValue === "number";
    }

    function isCallable(checkValue) {
        return typeof checkValue === "function";
    }

    function isStructure(checkValue) {
        return typeof checkValue === "object";
    }

    function attachHandler(domNode, eventType, handlerFunction) {
        eventType = 'on' + eventType;
        if (handlerFunction === null) {
            return domNode[eventType] = null;
        }
        if (isCallable(domNode[eventType])) {
            handlerFunction = (function (firstHandler, secondHandler) {
                return function () {
                    return firstHandler.apply(this, arguments), secondHandler.apply(this, arguments);
                }
            })(domNode[eventType], handlerFunction);
        }
        domNode[eventType] = handlerFunction;
    }

    function mergeObjects(destinationObj, sourceObj) {
        destinationObj = destinationObj || {};
        for (var propertyKey in sourceObj) {
            if (isStructure(sourceObj[propertyKey])) {
                destinationObj[propertyKey] = mergeObjects(destinationObj[propertyKey], sourceObj[propertyKey]);
            } else {
                destinationObj[propertyKey] = sourceObj[propertyKey];
            }
        }
        return destinationObj;
    }

    function getStyleProperty(domNode, cssRuleName) {
        var ruleJS = cssRuleName.replace(/\-(\w)/g, function (regexMatch, capturedGroup) {
            return capturedGroup.toUpperCase();
        }), propertyValue = 0;
        if (htmlDocument.defaultView && htmlDocument.defaultView.getComputedStyle) {
            propertyValue = htmlDocument.defaultView.getComputedStyle(domNode, null).getPropertyValue(cssRuleName);
        } else {
            propertyValue = domNode.style[ruleJS];
        }
        return propertyValue;
    }

    function insertTextAndSelect(textToProcess, selectionInfo) {
        insertContent(textToProcess, function () {
            selectRange(selectionInfo.end + 1, updateEditorHistory);
        });
        return false;
    }

    function trimWhitespace(textValue) {
        return textValue.replace(/^\s+|\s+$/g, "");
    }

    function trimLeft(textValue) {
        return textValue.replace(/^\s+/, "");
    }

    function trimRight(textValue) {
        return textValue.replace(/\s+$/, "");
    }

    function escapeRegExp(textValue) {
        return textValue.replace(textProcessor.escape, '\\$1');
    }

    function hasParentNode(domNode) {
        return domNode.parentNode;
    }

    var currentOptions = mergeObjects(defaultSettings, optionsConfig),
        toolbarNav = htmlDocument.createElement('span');

    // Regular Expression Escapes
    var regexUnorderedList = escapeRegExp(currentOptions.UNORDERED_LIST_MARKER).replace(/\\[-+*]/g, '[-+*]'),
        regexOrderedList = escapeRegExp(currentOptions.ORDERED_LIST_MARKER).replace(/%d/g, '[0-9]+'),
        regexTabSize = escapeRegExp(currentOptions.indentSpaces),
        regexPreformatted = escapeRegExp(currentOptions.PREFORMATTED_CODE_MARKER);

    // Core Event Management
    instanceCore.event = function (eventType, domNode, handlerFunction) {
        return attachHandler(domNode, eventType, handlerFunction);
    };

    // Core Modal Dialog Functionality
    instanceCore.modal = function (modalType, completionCallback, positionOffset) {
        if (isCallable(modalType)) {
            positionOffset = completionCallback;
            completionCallback = modalType;
            modalType = 'standard';
        }
        modalType = modalType || 'standard';
        positionOffset = positionOffset || {};
        currentScrollPos = bodyContainer.scrollTop || bodyContainer.parentNode.scrollTop;
        modalCurtain.className = currentOptions.dialogOverlayClass.replace(/%s/g, modalType);
        dialogBox.className = currentOptions.dialogClass.replace(/%s/g, modalType);
        dialogBox.innerHTML = '<div class="' + currentOptions.dialogHeaderClass.replace(/%s/g, modalType) + '"></div><div class="' + currentOptions.dialogContentClass.replace(/%s/g, modalType) + '"></div><div class="' + currentOptions.dialogFooterClass.replace(/%s/g, modalType) + '"></div>';
        var dialogStyle = dialogBox.style,
            hasFixedLeft = 'left' in positionOffset,
            hasFixedTop = 'top' in positionOffset;
        dialogStyle.visibility = 'hidden';
        bodyContainer.appendChild(modalCurtain);
        bodyContainer.appendChild(dialogBox);
        globalWindow.setTimeout(function () {
            var elementWidth = dialogBox.offsetWidth,
                elementHeight = dialogBox.offsetHeight;
            dialogStyle.position = 'absolute';
            dialogStyle.left = hasFixedLeft ? positionOffset.left + 'px' : '50%';
            dialogStyle.top = hasFixedTop ? positionOffset.top + 'px' : '50%';
            dialogStyle.zIndex = '9999';
            dialogStyle.marginLeft = (hasFixedLeft ? 0 : 0 - (elementWidth / 2)) + 'px';
            dialogStyle.marginTop = (hasFixedTop ? 0 : currentScrollPos - (elementHeight / 2)) + 'px';
            dialogStyle.visibility = "";
            if (dialogBox.offsetLeft < 0 && !hasFixedLeft) {
                dialogStyle.left = 0;
                dialogStyle.marginLeft = 0;
                hasFixedLeft = true;
                positionOffset.left = 0;
            }
            if (dialogBox.offsetTop < 0 && !hasFixedTop) {
                dialogStyle.top = 0;
                dialogStyle.marginTop = 0;
                hasFixedTop = true;
                positionOffset.top = 0;
            }
            var dialogHandle = dialogBox.children[0];
            attachHandler(dialogHandle, "mousedown", function (eventObject) {
                draggableElement = dialogBox;
                mouseOffsetX = eventCoordX - draggableElement.offsetLeft;
                mouseOffsetY = eventCoordY - draggableElement.offsetTop;
                return false;
            });
            attachHandler(bodyContainer, "mousemove", null); // Clear previous mousemove handler
            attachHandler(bodyContainer, "mousemove", function (eventObject) {
                eventCoordX = eventObject.pageX;
                eventCoordY = eventObject.pageY + currentScrollPos;
                var modalLeftMargin = hasFixedLeft ? elementWidth / 2 : 0,
                    modalTopMargin = hasFixedTop ? elementHeight / 2 : 0,
                    finalLeftPos, finalTopPos;
                if (draggableElement !== null) {
                    var effectiveWidth = hasFixedLeft ? elementWidth : 0,
                        effectiveHeight = hasFixedTop ? elementHeight : 0;
                    finalLeftPos = eventCoordX - mouseOffsetX + modalLeftMargin;
                    finalTopPos = eventCoordY - mouseOffsetY + modalTopMargin;
                    if (finalLeftPos < modalLeftMargin) finalLeftPos = modalLeftMargin;
                    if (finalTopPos < modalTopMargin) finalTopPos = modalTopMargin;
                    if (finalLeftPos + modalLeftMargin + effectiveWidth > viewportWidth) finalLeftPos = viewportWidth - modalLeftMargin - effectiveWidth;
                    if (finalTopPos + modalTopMargin + effectiveHeight > viewportHeight) finalTopPos = viewportHeight - modalTopMargin - effectiveHeight;
                    dialogStyle.left = finalLeftPos + 'px';
                    dialogStyle.top = (finalTopPos - currentScrollPos) + 'px';
                }
            });
        }, 10);
        if (isCallable(completionCallback)) completionCallback(modalCurtain, dialogBox);
    };

    // Core Dropdown Panel Functionality
    instanceCore.drop = function (panelType, completionCallback, positionOffset) {
        if (isCallable(panelType)) {
            positionOffset = completionCallback;
            completionCallback = panelType;
            panelType = 'standard';
        }
        if (!positionOffset && activeButton) {
            positionOffset = {
                left: activeButton.offsetLeft,
                top: activeButton.offsetTop + activeButton.offsetHeight // Panel drops below the button
            };
        }
        panelType = panelType || 'standard';
        positionOffset = positionOffset || {};
        currentScrollPos = bodyContainer.scrollTop || bodyContainer.parentNode.scrollTop;
        floatingPanel.className = currentOptions.dropdownClass.replace(/%s/g, panelType);
        var panelStyle = floatingPanel.style,
            hasFixedLeft = 'left' in positionOffset,
            hasFixedTop = 'top' in positionOffset;
        panelStyle.visibility = 'hidden';
        bodyContainer.appendChild(floatingPanel);
        globalWindow.setTimeout(function () {
            var elementWidth = floatingPanel.offsetWidth,
                elementHeight = floatingPanel.offsetHeight;
            panelStyle.position = 'absolute';
            panelStyle.left = hasFixedLeft ? positionOffset.left + 'px' : '50%';
            panelStyle.top = hasFixedTop ? positionOffset.top + 'px' : '50%';
            panelStyle.zIndex = '9999';
            panelStyle.marginLeft = (hasFixedLeft ? 0 : 0 - (elementWidth / 2)) + 'px';
            panelStyle.marginTop = (hasFixedTop ? 0 : currentScrollPos - (elementHeight / 2)) + 'px';
            panelStyle.visibility = "";
            if (positionOffset.left + elementWidth > viewportWidth) {
                panelStyle.left = (viewportWidth - elementWidth) + 'px';
                panelStyle.marginLeft = 0;
            }
            if (positionOffset.top + elementHeight > viewportHeight) {
                panelStyle.top = (viewportHeight - elementHeight) + 'px';
                panelStyle.marginTop = 0;
            }
        }, 10);
        if (isCallable(completionCallback)) completionCallback(floatingPanel);
    };

    // Custom Prompt Dialog
    instanceCore.prompt = function (dialogTitle, initialValue, isRequired, completionCallback, positionOffset) {
        instanceCore.modal('prompt', function (overlayElement, dialogElement) {
            var onPromptSuccess = function (resultValue) {
                if (isCallable(completionCallback)) {
                    instanceCore.close();
                    completionCallback(resultValue);
                } else {
                    instanceCore.close(true);
                }
            };
            var inputField = htmlDocument.createElement('input');
            inputField.type = 'text';
            inputField.value = initialValue;
            attachHandler(inputField, "keydown", function (eventObject) {
                var keyCodeValue = eventObject.keyCode;
                if (keyCodeValue === 27) return instanceCore.close(true), false;
                if (keyCodeValue === 40) return confirmButton.focus(), false;
                if (isRequired) {
                    if (keyCodeValue === 13 && this.value !== "" && this.value !== initialValue) {
                        return onPromptSuccess(this.value), false;
                    }
                } else {
                    if (keyCodeValue === 13) {
                        return onPromptSuccess(this.value === initialValue ? "" : this.value), false;
                    }
                }
            });
            var confirmButton = htmlDocument.createElement('button');
            confirmButton.innerHTML = currentOptions.actionLabels.confirm;
            attachHandler(confirmButton, "click", function () {
                if (isRequired) {
                    if (inputField.value !== "" && inputField.value !== initialValue) onPromptSuccess(inputField.value);
                } else {
                    onPromptSuccess(inputField.value === initialValue ? "" : inputField.value);
                }
                return false;
            });
            var cancelButton = htmlDocument.createElement('button');
            cancelButton.innerHTML = currentOptions.actionLabels.abort;
            attachHandler(cancelButton, "click", function () {
                return instanceCore.close(true), false;
            });
            attachHandler(confirmButton, "keydown", function (eventObject) {
                var keyCodeValue = eventObject.keyCode;
                if (keyCodeValue === 27) return instanceCore.close(true), false;
                if (keyCodeValue === 38) return inputField.focus(), false;
                if (keyCodeValue === 39) return cancelButton.focus(), false;
            });
            attachHandler(cancelButton, "keydown", function (eventObject) {
                var keyCodeValue = eventObject.keyCode;
                if (keyCodeValue === 27) return instanceCore.close(true), false;
                if (keyCodeValue === 37) return confirmButton.focus(), false;
                if (keyCodeValue === 38) return inputField.focus(), false;
            });
            dialogElement.children[0].innerHTML = dialogTitle ? dialogTitle : "";
            dialogElement.children[1].appendChild(inputField);
            dialogElement.children[2].appendChild(confirmButton);
            dialogElement.children[2].appendChild(htmlDocument.createTextNode(' '));
            dialogElement.children[2].appendChild(cancelButton);
            globalWindow.setTimeout(function () {
                inputField.select();
            }, 10);
        }, positionOffset);
    };

    // Custom Alert Dialog
    instanceCore.alert = function (dialogTitle, alertMessage, completionCallback, positionOffset) {
        instanceCore.modal('alert', function (overlayElement, dialogElement) {
            var confirmButton = htmlDocument.createElement('button');
            confirmButton.innerHTML = currentOptions.actionLabels.confirm;
            attachHandler(confirmButton, "click", function () {
                if (isCallable(completionCallback)) {
                    instanceCore.close();
                    completionCallback();
                } else {
                    instanceCore.close(true);
                }
                return false;
            });
            attachHandler(confirmButton, "keydown", function (eventObject) {
                if (eventObject.keyCode === 27) return instanceCore.close(true), false;
            });
            dialogElement.children[0].innerHTML = dialogTitle ? dialogTitle : "";
            dialogElement.children[1].innerHTML = alertMessage ? alertMessage : "";
            dialogElement.children[2].appendChild(confirmButton);
            globalWindow.setTimeout(function () {
                confirmButton.focus();
            }, 10);
        }, positionOffset);
    };

    // Custom Confirmation Dialog
    instanceCore.confirm = function (dialogTitle, confirmMessage, completionCallback, positionOffset) {
        instanceCore.modal('confirm', function (overlayElement, dialogElement) {
            var confirmButton = htmlDocument.createElement('button');
            confirmButton.innerHTML = currentOptions.actionLabels.confirm;
            attachHandler(confirmButton, "click", function () {
                if (isDefined(completionCallback)) {
                    if (isCallable(completionCallback.OK)) {
                        instanceCore.close();
                        completionCallback.OK();
                    } else {
                        instanceCore.close(true);
                    }
                } else {
                    instanceCore.close(true);
                }
                return false;
            });
            var cancelButton = htmlDocument.createElement('button');
            cancelButton.innerHTML = currentOptions.actionLabels.abort;
            attachHandler(cancelButton, "click", function () {
                if (isDefined(completionCallback)) {
                    if (isCallable(completionCallback.CANCEL)) {
                        instanceCore.close();
                        completionCallback.CANCEL();
                    } else {
                        instanceCore.close(true);
                    }
                } else {
                    instanceCore.close(true);
                }
                return false;
            });
            attachHandler(confirmButton, "keydown", function (eventObject) {
                var keyCodeValue = eventObject.keyCode;
                if (keyCodeValue === 27) return instanceCore.close(true), false;
                if (keyCodeValue === 39) return cancelButton.focus(), false;
            });