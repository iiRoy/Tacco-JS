class MarkupManipulator {
    #documentReference;
    #windowReference;
    #bodyElement;
    #contentEditor;
    #configSettings;
    #specialSymbols;
    #currentScrollPosition = 0;
    #activeFloatingPanel = null;
    #activeModalOverlay = null;
    #draggedElement = null;
    #dragOffsetX = 0;
    #dragOffsetY = 0;
    #viewWidth = 0;
    #viewHeight = 0;
    #toolbarButtonRef = null;

    constructor(targetElement, userOptions) {
        this.#documentReference = document;
        this.#windowReference = window;
        this.#bodyElement = this.#documentReference.body;
        this.#contentEditor = new ContentEditor(targetElement);

        if ('prompt' in userOptions) userOptions.prompts = userOptions.prompt;
        if ('placeholder' in userOptions) userOptions.placeholders = userOptions.placeholder;
        if ('iconClassPrefix' in userOptions) userOptions.toolbarIconClass = userOptions.iconClassPrefix + '%s';
        if ('buttonClassPrefix' in userOptions) userOptions.toolbarButtonClass = userOptions.buttonClassPrefix + '%s';

        const defaultSettings = {
            indentSize: '    ',
            showToolbar: true,
            useShortcuts: false,
            editorAreaClass: 'editor-area',
            toolbarContainerClass: 'editor-toolbar',
            toolbarIconPattern: 'fa fa-%s',
            toolbarButtonPattern: 'editor-toolbar-button editor-toolbar-button-%s',
            toolbarSeparatorClass: 'editor-toolbar-separator',
            toolbarPlacement: "before",
            dropdownClass: 'custom-drop custom-%s-drop',
            dialogClass: 'custom-modal custom-modal-%s',
            dialogHeaderClass: 'custom-modal-header custom-modal-%s-header',
            dialogContentClass: 'custom-modal-content custom-modal-%s-content',
            dialogActionClass: 'custom-modal-action custom-modal-%s-action',
            dialogOverlayClass: 'custom-modal-overlay custom-modal-%s-overlay',
            closeHashHeaders: false,
            strongText: '**',
            emphasisText: '_',
            unorderedListPrefix: '- ',
            orderedListPrefix: '%d. ',
            horizontalRule: '---',
            inlineCode: '`',
            codeBlockPrefix: '    ',
            actionLabels: {
                okay: 'OK',
                affirm: 'Yes',
                negate: 'No',
                cancel: 'Cancel',
                openItem: 'Open',
                closeItem: 'Close',
                boldFormat: 'Bold',
                italicFormat: 'Italic',
                codeFormat: 'Code',
                quoteBlock: 'Quote',
                headingLevel: 'H1 ' + '\u2013' + ' H6',
                hyperlink: 'Link',
                picture: 'Image',
                orderedList: 'Ordered List',
                unorderedList: 'Unordered List',
                horizontalSeparator: 'Horizontal Rule',
                undoAction: 'Undo',
                redoAction: 'Redo'
            },
            inputPrompts: {
                linkTitle: 'link title goes here' + '\u2026',
                linkTitleLabel: 'Link Title',
                linkAddress: 'http://',
                linkAddressLabel: 'Link URL',
                imageUrl: 'http://',
                imageUrlLabel: 'Image URL'
            },
            inputPlaceholders: {
                genericText: 'text goes here' + '\u2026',
                headingText: 'Heading',
                linkDescription: 'link text',
                ulListItem: 'List item',
                olListItem: 'List item',
                imageAltText: 'Image'
            },
            onUpdate: () => {},
            onKeyPress: () => {},
            onClick: () => {},
            onReady: () => {},
            onCopy: () => {},
            onCut: () => {},
            onPaste: () => {}
        };

        this.#configSettings = this.#mergeObjects(defaultSettings, userOptions);

        this.#specialSymbols = {
            leftSingleQuote: '\u2018',
            rightSingleQuote: '\u2019',
            leftDoubleQuote: '\u201C',
            rightDoubleQuote: '\u201D',
            nDash: '\u2013',
            mDash: '\u2014',
            ellipsis: '\u2026',
            brokenBar: '\u00A6',
            copyrightSign: '\u00A9',
            soundCopyright: '\u2117',
            serviceMark: '\u2120',
            tradeMark: '\u2122',
            registeredSign: '\u00AE',
            plusMinus: '\u00B1',
            multiplication: '\u00D7',
            division: '\u00F7',
            degreeSign: '\u00B0',
            leftAngleQuoteSingle: '\u2039',
            rightAngleQuoteSingle: '\u203A',
            leftAngleQuoteDouble: '\u00AB',
            rightAngleQuoteDouble: '\u00BB',
            lessEqual: '\u2264',
            greaterEqual: '\u2265',
            notEqual: '\u2260',
            arrowLeft: '\u2190',
            arrowRight: '\u2192',
            arrowUp: '\u2191',
            arrowDown: '\u2193',
            carriageReturn: '\u21B5',
            middleDot: '\u00B7'
        };

        this.#viewWidth = this.#bodyElement.parentElement.offsetWidth;
        this.#viewHeight = this.#windowReference.innerHeight > this.#bodyElement.parentElement.offsetHeight ? this.#windowReference.innerHeight : this.#bodyElement.parentElement.offsetHeight;

        this.#attachEvent(this.#documentReference, "mouseup", this.#handleGlobalMouseUp.bind(this));
        this.#attachEvent(this.#documentReference, "mousemove", this.#handleGlobalMouseMove.bind(this));
    }

    #isFunction(param) { return typeof param === "function"; }
    #isObject(param) { return typeof param === "object" && param !== null; }
    #isString(param) { return typeof param === "string"; }
    #isDefined(param) { return typeof param !== "undefined"; }

    #mergeObjects(target, source) {
        return Object.assign(target, source);
    }

    #getComputedStyleValue(element, property) {
        const camelCaseProperty = property.replace(/\-(\w)/g, (match, char) => char.toUpperCase());
        if (this.#documentReference.defaultView && this.#documentReference.defaultView.getComputedStyle) {
            return this.#documentReference.defaultView.getComputedStyle(element, null).getPropertyValue(property);
        } else {
            return element.style[camelCaseProperty];
        }
    }

    #attachEvent(element, eventType, handler) {
        if (!element) return;
        if (this.#isFunction(element[`on${eventType}`])) {
            const existingHandler = element[`on${eventType}`];
            element[`on${eventType}`] = function(...args) {
                existingHandler.apply(this, args);
                handler.apply(this, args);
            };
        } else {
            element[`on${eventType}`] = handler;
        }
    }

    #cleanWhitespace(text) { return text.replace(/^\s+|\s+$/g, ""); }
    #cleanLeadingWhitespace(text) { return text.replace(/^\s+/, ""); }
    #cleanTrailingWhitespace(text) { return text.replace(/\s+$/, ""); }
    #escapeForRegex(text) { return text.replace(this.#contentEditor.escape, '\\$1'); }

    #insertContent(content, selectionState) {
        this.#contentEditor.insert(content, () => {
            this.#contentEditor.select(selectionState.end + 1, this.#contentEditor.updateHistory);
        });
        return false;
    }

    #handleGlobalMouseUp() {
        this.#draggedElement = null;
    }

    #handleGlobalMouseMove(event) {
        if (this.#draggedElement) {
            event.preventDefault();
            const currentX = event.pageX;
            const currentY = event.pageY + this.#currentScrollPosition;

            let newLeft = currentX - this.#dragOffsetX;
            let newTop = currentY - this.#dragOffsetY;

            const elementWidth = this.#draggedElement.offsetWidth;
            const elementHeight = this.#draggedElement.offsetHeight;

            newLeft = Math.max(0, Math.min(newLeft, this.#viewWidth - elementWidth));
            newTop = Math.max(0, Math.min(newTop, this.#viewHeight - elementHeight));

            this.#draggedElement.style.left = newLeft + 'px';
            this.#draggedElement.style.top = (newTop - this.#currentScrollPosition) + 'px';
        }
    }

    #createDialogElement(type) {
        const dialogContainer = this.#documentReference.createElement('div');
        dialogContainer.className = this.#configSettings.dialogClass.replace(/%s/g, type);
        dialogContainer.innerHTML = `
            <div class="${this.#configSettings.dialogHeaderClass.replace(/%s/g, type)}"></div>
            <div class="${this.#configSettings.dialogContentClass.replace(/%s/g, type)}"></div>
            <div class="${this.#configSettings.dialogActionClass.replace(/%s/g, type)}"></div>
        `;
        return dialogContainer;
    }

    #showGenericDialog(dialogType, callbackFunction, positionOffset = {}) {
        this.#currentScrollPosition = this.#bodyElement.scrollTop || this.#bodyElement.parentElement.scrollTop;

        this.#activeModalOverlay = this.#documentReference.createElement('div');
        this.#activeModalOverlay.className = this.#configSettings.dialogOverlayClass.replace(/%s/g, dialogType);
        this.#bodyElement.appendChild(this.#activeModalOverlay);

        this.#activeFloatingPanel = this.#createDialogElement(dialogType);
        const panelStyle = this.#activeFloatingPanel.style;
        panelStyle.visibility = 'hidden';
        this.#bodyElement.appendChild(this.#activeFloatingPanel);

        this.#windowReference.setTimeout(() => {
            const panelWidth = this.#activeFloatingPanel.offsetWidth;
            const panelHeight = this.#activeFloatingPanel.offsetHeight;

            panelStyle.position = 'absolute';
            panelStyle.zIndex = '9999';

            let targetLeft = '50%';
            let targetMarginLeft = -(panelWidth / 2) + 'px';
            let targetTop = '50%';
            let targetMarginTop = (this.#currentScrollPosition - (panelHeight / 2)) + 'px';

            const useFixedLeft = 'left' in positionOffset;
            const useFixedTop = 'top' in positionOffset;

            if (useFixedLeft) {
                targetLeft = positionOffset.left + 'px';
                targetMarginLeft = '0';
            }
            if (useFixedTop) {
                targetTop = positionOffset.top + 'px';
                targetMarginTop = '0';
            }

            panelStyle.left = targetLeft;
            panelStyle.top = targetTop;
            panelStyle.marginLeft = targetMarginLeft;
            panelStyle.marginTop = targetMarginTop;
            panelStyle.visibility = '';

            if (this.#activeFloatingPanel.offsetLeft < 0 && !useFixedLeft) {
                panelStyle.left = '0';
                panelStyle.marginLeft = '0';
                positionOffset.left = 0;
            }
            if (this.#activeFloatingPanel.offsetTop < 0 && !useFixedTop) {
                panelStyle.top = '0';
                panelStyle.marginTop = '0';
                positionOffset.top = 0;
            }

            const headerHandle = this.#activeFloatingPanel.children[0];
            this.#attachEvent(headerHandle, "mousedown", (e) => {
                this.#draggedElement = this.#activeFloatingPanel;
                this.#dragOffsetX = e.pageX - this.#draggedElement.offsetLeft;
                this.#dragOffsetY = e.pageY - this.#draggedElement.offsetTop;
                e.preventDefault();
            });

            if (this.#isFunction(callbackFunction)) {
                callbackFunction(this.#activeModalOverlay, this.#activeFloatingPanel);
            }
        }, 10);
    }

    #showGenericDrop(dropType, callbackFunction, positionOffset) {
        if (!positionOffset && this.#toolbarButtonRef) {
            positionOffset = {
                left: this.#toolbarButtonRef.offsetLeft,
                top: this.#toolbarButtonRef.offsetTop + this.#toolbarButtonRef.offsetHeight
            };
        }
        positionOffset = positionOffset || {};

        this.#currentScrollPosition = this.#bodyElement.scrollTop || this.#bodyElement.parentElement.scrollTop;

        this.#activeFloatingPanel = this.#documentReference.createElement('div');
        this.#activeFloatingPanel.className = this.#configSettings.dropdownClass.replace(/%s/g, dropType);

        const panelStyle = this.#activeFloatingPanel.style;
        panelStyle.visibility = 'hidden';
        this.#bodyElement.appendChild(this.#activeFloatingPanel);

        this.#windowReference.setTimeout(() => {
            const panelWidth = this.#activeFloatingPanel.offsetWidth;
            const panelHeight = this.#activeFloatingPanel.offsetHeight;

            panelStyle.position = 'absolute';
            panelStyle.zIndex = '9999';

            let targetLeft = '50%';
            let targetMarginLeft = -(panelWidth / 2) + 'px';
            let targetTop = '50%';
            let targetMarginTop = (this.#currentScrollPosition - (panelHeight / 2)) + 'px';

            const useFixedLeft = 'left' in positionOffset;
            const useFixedTop = 'top' in positionOffset;

            if (useFixedLeft) {
                targetLeft = positionOffset.left + 'px';
                targetMarginLeft = '0';
            }
            if (useFixedTop) {
                targetTop = positionOffset.top + 'px';
                targetMarginTop = '0';
            }

            panelStyle.left = targetLeft;
            panelStyle.top = targetTop;
            panelStyle.marginLeft = targetMarginLeft;
            panelStyle.marginTop = targetMarginTop;
            panelStyle.visibility = '';

            if (positionOffset.left + panelWidth > this.#viewWidth) {
                panelStyle.left = (this.#viewWidth - panelWidth) + 'px';
                panelStyle.marginLeft = '0';
            }
            if (positionOffset.top + panelHeight > this.#viewHeight) {
                panelStyle.top = (this.#viewHeight - panelHeight) + 'px';
                panelStyle.marginTop = '0';
            }

            if (this.#isFunction(callbackFunction)) {
                callbackFunction(this.#activeFloatingPanel);
            }
        }, 10);
    }

    #removeActiveDialogs() {
        if (this.#activeModalOverlay && this.#activeModalOverlay.parentNode) {
            this.#activeModalOverlay.parentNode.removeChild(this.#activeModalOverlay);
            this.#activeModalOverlay = null;
        }
        if (this.#activeFloatingPanel && this.#activeFloatingPanel.parentNode) {
            this.#activeFloatingPanel.parentNode.removeChild(this.#activeFloatingPanel);
            this.#activeFloatingPanel = null;
        }
        this.#draggedElement = null;
    }

    attachDomEvent(element, eventType, handler) {
        return this.#attachEvent(element, eventType, handler);
    }

    displayUtilityDialog(dialogType, callback, offsetCoords) {
        if (this.#isFunction(dialogType)) {
            offsetCoords = callback;
            callback = dialogType;
            dialogType = 'standard';
        }
        dialogType = dialogType || 'standard';
        this.#showGenericDialog(dialogType, callback, offsetCoords);
    }

    displayUtilityDrop(dropType, callback, offsetCoords) {
        if (this.#isFunction(dropType)) {
            offsetCoords = callback;
            callback = dropType;
            dropType = 'standard';
        }
        dropType = dropType || 'standard';
        this.#showGenericDrop(dropType, callback, offsetCoords);
    }

    showPromptInput(titleText, initialValue, isRequired, completionCallback, positionOffset) {
        this.displayUtilityDialog('prompt', (overlay, dialog) => {
            const handleSuccess = (value) => {
                if (this.#isFunction(completionCallback)) {
                    this.dismissActiveDialog();
                    completionCallback(value);
                } else {
                    this.dismissActiveDialog(true);
                }
            };

            const inputField = this.#documentReference.createElement('input');
            inputField.type = 'text';
            inputField.value = initialValue;

            this.#attachEvent(inputField, "keydown", (e) => {
                const key = e.keyCode;
                if (key === 27) return this.dismissActiveDialog(true), false;
                if (key === 40) return okButton.focus(), false;
                if (isRequired) {
                    if (key === 13 && inputField.value !== "" && inputField.value !== initialValue) {
                        return handleSuccess(inputField.value), false;
                    }
                } else {
                    if (key === 13) {
                        return handleSuccess(inputField.value === initialValue ? "" : inputField.value), false;
                    }
                }
            });

            const okButton = this.#documentReference.createElement('button');
            okButton.innerHTML = this.#configSettings.actionLabels.okay;
            this.#attachEvent(okButton, "click", () => {
                if (isRequired) {
                    if (inputField.value !== "" && inputField.value !== initialValue) handleSuccess(inputField.value);
                } else {
                    handleSuccess(inputField.value === initialValue ? "" : inputField.value);
                }
                return false;
            });

            const cancelButton = this.#documentReference.createElement('button');
            cancelButton.innerHTML = this.#configSettings.actionLabels.cancel;
            this.#attachEvent(cancelButton, "click", () => {
                return this.dismissActiveDialog(true), false;
            });

            this.#attachEvent(okButton, "keydown", (e) => {
                const key = e.keyCode;
                if (key === 27) return this.dismissActiveDialog(true), false;
                if (key === 38) return inputField.focus(), false;
                if (key === 39) return cancelButton.focus(), false;
            });

            this.#attachEvent(cancelButton, "keydown", (e) => {
                const key = e.keyCode;
                if (key === 27) return this.dismissActiveDialog(true), false;
                if (key === 37) return okButton.focus(), false;
                if (key === 38) return inputField.focus(), false;
            });

            dialog.children[0].innerHTML = titleText ? titleText : "";
            dialog.children[1].appendChild(inputField);
            dialog.children[2].appendChild(okButton);
            dialog.children[2].appendChild(this.#documentReference.createTextNode(' '));
            dialog.children[2].appendChild(cancelButton);

            this.#windowReference.setTimeout(() => {
                inputField.select();
            }, 10);
        }, positionOffset);
    }

    displayAlertMessage(titleText, messageContent, completionCallback, positionOffset) {
        this.displayUtilityDialog('alert', (overlay, dialog) => {
            const okButton = this.#documentReference.createElement('button');
            okButton.innerHTML = this.#configSettings.actionLabels.okay;
            this.#attachEvent(okButton, "click", () => {
                if (this.#isFunction(completionCallback)) {
                    this.dismissActiveDialog();
                    completionCallback();
                } else {
                    this.dismissActiveDialog(true);
                }
                return false;
            });
            this.#attachEvent(okButton, "keydown", (e) => {
                if (e.keyCode === 27) return this.dismissActiveDialog(true), false;
            });

            dialog.children[0].innerHTML = titleText ? titleText : "";
            dialog.children[1].innerHTML = messageContent ? messageContent : "";
            dialog.children[2].appendChild(okButton);

            this.#windowReference.setTimeout(() => {
                okButton.focus();
            }, 10);
        }, positionOffset);
    }

    displayConfirmation(titleText, messageContent, actionCallbacks, positionOffset) {
        this.displayUtilityDialog('confirm', (overlay, dialog) => {
            const okButton = this.#documentReference.createElement('button');
            okButton.innerHTML = this.#configSettings.actionLabels.okay;
            this.#attachEvent(okButton, "click", () => {
                if (this.#isDefined(actionCallbacks) && this.#isFunction(actionCallbacks.OK)) {
                    this.dismissActiveDialog();
                    actionCallbacks.OK();
                } else {
                    this.dismissActiveDialog(true);
                }
                return false;
            });

            const cancelButton = this.#documentReference.createElement('button');
            cancelButton.innerHTML = this.#configSettings.actionLabels.cancel;
            this.#attachEvent(cancelButton, "click", () => {
                if (this.#isDefined(actionCallbacks) && this.#isFunction(actionCallbacks.CANCEL)) {
                    this.dismissActiveDialog();
                    actionCallbacks.CANCEL();
                } else {
                    this.dismissActiveDialog(true);
                }
                return false;
            });

            this.#attachEvent(okButton, "keydown", (e) => {
                const key = e.keyCode;
                if (key === 27) return this.dismissActiveDialog(true), false;
                if (key === 39) return cancelButton.focus(), false;
            });

            dialog.children[0].innerHTML = titleText ? titleText : "";
            dialog.children[1].innerHTML = messageContent ? messageContent : "";
            dialog.children[2].appendChild(okButton);
            dialog.children[2].appendChild(this.#documentReference.createTextNode(' '));
            dialog.children[2].appendChild(cancelButton);

            this.#windowReference.setTimeout(() => {
                okButton.focus();
            }, 10);
        }, positionOffset);
    }

    dismissActiveDialog(force = false) {
        if (this.#activeModalOverlay || this.#activeFloatingPanel || force) {
            this.#removeActiveDialogs();
        }
    }
}