/*
 * -------------------------------------------------------------------
 *  ADVANCED MARKDOWN EDITOR UTILITY 2.0.0
 * -------------------------------------------------------------------
 * Developer: Coderius Labs <http://coderius.dev>
 * Licensed under the Apache 2.0 License.
 *
 * DEPENDENCIES:
 * ===================================================================
 * [1]. https://github.com/some/simple-text-area-processor
 * [2]. https://fontawesome.com/icons
 * ===================================================================
 * -------------------------------------------------------------------
 *
 */

var MarkdownEditor = function (targetElement, editorOptions) {
    // Ensure core functionality can proceed; validate initial inputs.
    if (!(targetElement instanceof Element) || typeof editorOptions !== 'object') {
        console.error("MarkdownEditor: Invalid target element or options provided during initialization.");
        return; // Exit if fundamental inputs are missing or incorrect.
    }

    // Adapt legacy configuration keys for compatibility with current structure.
    if ('prompt' in editorOptions) editorOptions.prompts = editorOptions.prompt;
    if ('placeholder' in editorOptions) editorOptions.placeholders = editorOptions.placeholder;
    if ('iconClassPrefix' in editorOptions) editorOptions.toolbarIconClass = editorOptions.iconClassPrefix + '%s';
    if ('buttonClassPrefix' in editorOptions) editorOptions.toolbarButtonClass = editorOptions.buttonClassPrefix + '%s';

    // Define a set of special Unicode character constants for text manipulation.
    const LEFT_SINGLE_QUOTE = '\u2018';
    const RIGHT_SINGLE_QUOTE = '\u2019';
    const LEFT_DOUBLE_QUOTE = '\u201C';
    const RIGHT_DOUBLE_QUOTE = '\u201D';
    const EN_DASH = '\u2013';
    const EM_DASH = '\u2014';
    const HORIZONTAL_ELLIPSIS = '\u2026';
    const BROKEN_BAR = '\u00A6';
    const COPYRIGHT_SYMBOL = '\u00A9';
    const SOUND_RECORDING_COPYRIGHT = '\u2117';
    const SERVICE_MARK = '\u2120';
    const TRADE_MARK = '\u2122';
    const REGISTERED_SIGN = '\u00AE';
    const PLUS_MINUS_SIGN = '\u00B1';
    const MULTIPLICATION_SIGN = '\u00D7';
    const DIVISION_SIGN = '\u00F7';
    const DEGREE_SYMBOL = '\u00B0';
    const LEFT_ANGLE_QUOTE_SINGLE = '\u2039';
    const RIGHT_ANGLE_QUOTE_SINGLE = '\u203A';
    const LEFT_ANGLE_QUOTE_DOUBLE = '\u00AB';
    const RIGHT_ANGLE_QUOTE_DOUBLE = '\u00BB';
    const LESS_THAN_EQUAL = '\u2264';
    const GREATER_THAN_EQUAL = '\u2265';
    const NOT_EQUAL = '\u2260';
    const LEFT_ARROW = '\u2190';
    const RIGHT_ARROW = '\u2192';
    const UP_ARROW = '\u2191';
    const DOWN_ARROW = '\u2193';
    const CARRIAGE_RETURN_ARROW = '\u21B5';
    const MIDDLE_DOT = '\u00B7';

    // Core references and utility instances.
    const self = this; // Reference to the current instance of MarkdownEditor.
    const windowRef = window;
    const documentRef = document;
    // Assumes 'Editor' is a global or imported class provided by simple-text-area-processor.
    const textProcessor = new Editor(targetElement);

    // Default configuration settings for the editor.
    const defaultSettings = {
        indentationSize: '    ', // Default tab equivalent for indentation.
        showToolbar: true,
        enableShortcuts: false,
        textAreaClass: 'editor-content-area',
        toolbarContainerClass: 'editor-action-bar',
        toolbarIconFormat: 'icon-fa icon-fa-%s', // Class format for toolbar icons.
        toolbarButtonFormat: 'editor-action-button editor-action-button-%s', // Class format for toolbar buttons.
        toolbarSeparatorClass: 'editor-action-separator',
        toolbarPlacement: "before", // Position relative to the textarea: "before" or "after".
        dropdownClass: 'custom-dropdown custom-%s-dropdown',
        dialogClass: 'custom-dialog custom-dialog-%s',
        dialogHeaderClass: 'custom-dialog-header custom-dialog-%s-header',
        dialogContentClass: 'custom-dialog-content custom-dialog-%s-content',
        dialogFooterClass: 'custom-dialog-actions custom-dialog-%s-actions',
        dialogOverlayClass: 'custom-dialog-overlay custom-dialog-%s-overlay',
        closeATXHeadersStrict: false, // If true, headers like `#### Heading ####` are closed.
        BOLD_MARKER: '**',
        EMPHASIS_MARKER: '_',
        UNORDERED_LIST_PREFIX: '- ',
        ORDERED_LIST_PREFIX: '%d. ',
        HORIZONTAL_RULE_MARKER: '---',
        CODE_INLINE_MARKER: '`',
        CODE_BLOCK_PREFIX: '    ', // For fenced code blocks in Markdown Extra: ~~~\n%s\n~~~ or ```\n%s\n```
        displayLabels: { // Text labels for various UI elements.
            confirmOk: 'Confirm',
            confirmYes: 'Yes',
            confirmNo: 'No',
            confirmCancel: 'Dismiss',
            actionOpen: 'Open',
            actionClose: 'Close',
            buttonBold: 'Bold Text',
            buttonItalic: 'Italic Text',
            buttonCode: 'Insert Code',
            buttonQuote: 'Blockquote',
            buttonHeading: 'Heading (H1 ' + EN_DASH + ' H6)',
            buttonLink: 'Insert Link',
            buttonImage: 'Insert Image',
            buttonOrderedList: 'Numbered List',
            buttonUnorderedList: 'Bulleted List',
            buttonRule: 'Horizontal Separator',
            buttonUndo: 'Undo Action',
            buttonRedo: 'Redo Action'
        },
        dialogPrompts: { // Default prompt values for dialogs.
            linkTitle: 'Enter link description' + HORIZONTAL_ELLIPSIS,
            linkTitleLabel: 'Link Description',
            linkUrl: 'https://',
            linkUrlLabel: 'Link URL',
            imageUrl: 'https://',
            imageUrlLabel: 'Image URL'
        },
        editorPlaceholders: { // Placeholder texts for various markdown elements.
            genericText: 'Your content here' + HORIZONTAL_ELLIPSIS,
            headingPlaceholder: 'Main Heading',
            linkTextPlaceholder: 'link description',
            unorderedListItem: 'List item entry',
            orderedListItem: 'Numbered item entry',
            imageAltText: 'Image description'
        },
        // Callback functions for editor events.
        onUpdate: function () { },
        onKeyDown: function () { },
        onClick: function () { },
        onReady: function () { },
        onCopy: function () { },
        onCut: function () { },
        onPaste: function () { }
    };

    // DOM elements for modal and dropdown functionality.
    const bodyElement = documentRef.body;
    const dialogOverlay = documentRef.createElement('div');
    const dialogModal = documentRef.createElement('div');
    const actionDropdown = documentRef.createElement('div');

    let currentScrollPosition = 0;
    let lastClickedButton = null; // Stores the last button that opened a dropdown/modal.
    let draggableElement = null; // Element currently being dragged.
    let mouseX = 0, mouseY = 0; // Current mouse coordinates.
    let dragOffsetX = 0, dragOffsetY = 0; // Offset from mouse to element corner.

    // Viewport dimensions for positioning calculations.
    const viewportWidth = bodyElement.parentNode.offsetWidth;
    const viewportHeight = windowRef.innerHeight > bodyElement.parentNode.offsetHeight ? windowRef.innerHeight : bodyElement.parentNode.offsetHeight;

    // Aliases for frequently used text processor methods to reduce verbosity and aid minification.
    const textAreaElement = targetElement;
    const indentSelection = textProcessor.indent;
    const insertContent = textProcessor.insert;
    const outdentSelection = textProcessor.outdent;
    const replaceSelection = textProcessor.replace;
    const selectRange = textProcessor.select;
    const getCurrentSelection = textProcessor.selection;
    const updateHistory = textProcessor.updateHistory;
    const wrapSelection = textProcessor.wrap;

    // --- Utility Functions ---

    /**
     * Checks if a variable is defined (not undefined).
     * @param {*} value - The variable to check.
     * @returns {boolean} - True if defined, false otherwise.
     */
    function isDefined(value) {
        return typeof value !== "undefined";
    }

    /**
     * Checks if a variable is a string.
     * @param {*} value - The variable to check.
     * @returns {boolean} - True if a string, false otherwise.
     */
    function isString(value) {
        return typeof value === "string";
    }

    /**
     * Checks if a variable is a number.
     * @param {*} value - The variable to check.
     * @returns {boolean} - True if a number, false otherwise.
     */
    function isNumber(value) {
        return typeof value === "number";
    }

    /**
     * Checks if a variable is a function.
     * @param {*} value - The variable to check.
     * @returns {boolean} - True if a function, false otherwise.
     */
    function isFunction(value) {
        return typeof value === "function";
    }

    /**
     * Checks if a variable is an object (and not null).
     * @param {*} value - The variable to check.
     * @returns {boolean} - True if an object, false otherwise.
     */
    function isObject(value) {
        return typeof value === "object" && value !== null;
    }

    /**
     * Attaches an event handler to an element using old-school `on` properties.
     * Supports chaining multiple handlers for the same event.
     * @param {HTMLElement} element - The DOM element.
     * @param {string} eventName - The event name (e.g., 'click', 'keydown').
     * @param {Function|null} handler - The function to attach, or null to remove.
     */
    function attachEventHandler(element, eventName, handler) {
        const fullEventName = 'on' + eventName;
        if (handler === null) {
            element[fullEventName] = null; // Explicitly remove handler.
            return;
        }

        if (isFunction(element[fullEventName])) {
            // If an existing handler is present, chain the new one.
            const existingHandler = element[fullEventName];
            element[fullEventName] = function () {
                existingHandler.apply(this, arguments);
                handler.apply(this, arguments);
            };
        } else {
            element[fullEventName] = handler;
        }
    }

    /**
     * Deeply merges properties from source object(s) into a target object.
     * @param {object} target - The object to merge into.
     * @param {...object} sources - One or more source objects.
     * @returns {object} - The merged target object.
     */
    function deepMerge(target, ...sources) {
        if (!isObject(target)) {
            target = {}; // Ensure target is an object.
        }

        sources.forEach(source => {
            if (isObject(source)) {
                for (const key in source) {
                    if (Object.prototype.hasOwnProperty.call(source, key)) {
                        if (isObject(source[key])) {
                            if (!isObject(target[key])) {
                                target[key] = {}; // Initialize if target property isn't an object.
                            }
                            deepMerge(target[key], source[key]); // Recurse for nested objects.
                        } else {
                            target[key] = source[key]; // Directly assign primitive values.
                        }
                    }
                }
            }
        });
        return target;
    }

    /**
     * Retrieves the computed style value for a given CSS property.
     * @param {HTMLElement} element - The DOM element.
     * @param {string} propertyName - The CSS property name (e.g., 'margin-left').
     * @returns {string} - The computed style value.
     */
    function getComputedStyleValue(element, propertyName) {
        if (documentRef.defaultView && documentRef.defaultView.getComputedStyle) {
            // Modern browsers.
            return documentRef.defaultView.getComputedStyle(element, null).getPropertyValue(propertyName);
        } else {
            // Fallback for older IE (camelCase property names).
            const camelCaseProp = propertyName.replace(/\-(\w)/g, (match, char) => char.toUpperCase());
            return element.style[camelCaseProp];
        }
    }

    /**
     * Inserts text at the current cursor position and updates selection/history.
     * @param {string} textToInsert - The string to insert.
     * @param {object} selectionInfo - Object containing `start` and `end` of current selection.
     * @returns {boolean} - Always false (for event handling).
     */
    function insertAndPositionCursor(textToInsert, selectionInfo) {
        insertContent(textToInsert, function () {
            // Position cursor after the inserted text and update history.
            selectRange(selectionInfo.end + 1, updateHistory);
        });
        return false;
    }

    /**
     * Removes leading and trailing whitespace from a string.
     * @param {string} inputString - The string to trim.
     * @returns {string} - The trimmed string.
     */
    function trimString(inputString) {
        return inputString.replace(/^\s+|\s+$/g, "");
    }

    /**
     * Escapes special characters in a string for safe use within a regular expression.
     * @param {string} inputString - The string to escape.
     * @returns {string} - The escaped string.
     */
    function escapeRegExpCharacters(inputString) {
        // Common regex special characters: . * + ? ^ $ { } ( ) | [ ] \
        return inputString.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    // Merge default and user-provided options.
    const currentConfig = deepMerge({}, defaultSettings, editorOptions);

    // Dynamic regular expressions based on current configuration.
    const re_UNORDERED_LIST = escapeRegExpCharacters(currentConfig.UNORDERED_LIST_PREFIX).replace(/\\[-+*]/g, '[-+*]');
    const re_ORDERED_LIST = escapeRegExpCharacters(currentConfig.ORDERED_LIST_PREFIX).replace(/%d/g, '[0-9]+');
    const re_INDENTATION = escapeRegExpCharacters(currentConfig.indentationSize);
    const re_CODE_BLOCK = escapeRegExpCharacters(currentConfig.CODE_BLOCK_PREFIX);

    // --- Public API for MarkdownEditor Instance ---

    /**
     * Attaches an event listener to a DOM element.
     * @param {string} eventType - The event type (e.g., 'click', 'focus').
     * @param {HTMLElement} elementTarget - The element to attach the listener to.
     * @param {Function} eventHandler - The callback function.
     */
    self.onEvent = function (eventType, elementTarget, eventHandler) {
        return attachEventHandler(elementTarget, eventType, eventHandler);
    };

    /**
     * Displays a modal dialog.
     * @param {string|Function} [dialogType='default'] - The type of dialog (e.g., 'alert', 'prompt') or a callback function.
     * @param {Function} [dialogCallback] - Function to execute after modal is rendered.
     * @param {object} [positionOffset] - Optional {left, top} coordinates for initial positioning.
     */
    self.showModal = function (dialogType, dialogCallback, positionOffset) {
        // Handle flexible argument signature (type can be callback).
        if (isFunction(dialogType)) {
            positionOffset = dialogCallback;
            dialogCallback = dialogType;
            dialogType = 'default';
        }
        dialogType = dialogType || 'default'; // Default to 'default' if not specified.
        positionOffset = positionOffset || {};

        currentScrollPosition = bodyElement.scrollTop || bodyElement.parentNode.scrollTop;

        // Apply dynamic classes based on dialog type.
        dialogOverlay.className = currentConfig.dialogOverlayClass.replace(/%s/g, dialogType);
        dialogModal.className = currentConfig.dialogClass.replace(/%s/g, dialogType);

        // Structure the modal content.
        dialogModal.innerHTML = `
            <div class="${currentConfig.dialogHeaderClass.replace(/%s/g, dialogType)}"></div>
            <div class="${currentConfig.dialogContentClass.replace(/%s/g, dialogType)}"></div>
            <div class="${currentConfig.dialogFooterClass.replace(/%s/g, dialogType)}"></div>
        `;

        const modalStyle = dialogModal.style;
        let hasLeftOffset = 'left' in positionOffset;
        let hasTopOffset = 'top' in positionOffset;

        modalStyle.visibility = 'hidden'; // Hide initially to prevent FOUC.
        bodyElement.appendChild(dialogOverlay);
        bodyElement.appendChild(dialogModal);

        // Position the modal after it's in the DOM to get dimensions.
        windowRef.setTimeout(function () {
            const modalWidth = dialogModal.offsetWidth;
            const modalHeight = dialogModal.offsetHeight;

            modalStyle.position = 'absolute';
            modalStyle.left = hasLeftOffset ? `${positionOffset.left}px` : '50%';
            modalStyle.top = hasTopOffset ? `${positionOffset.top}px` : '50%';
            modalStyle.zIndex = '9999'; // Ensure modal is on top.

            // Adjust margins for centering if no explicit offset is given.
            modalStyle.marginLeft = (hasLeftOffset ? 0 : 0 - (modalWidth / 2)) + 'px';
            modalStyle.marginTop = (hasTopOffset ? 0 : currentScrollPosition - (modalHeight / 2)) + 'px';
            modalStyle.visibility = ""; // Make visible.

            // Boundary checks for modal position.
            if (dialogModal.offsetLeft < 0 && !hasLeftOffset) {
                modalStyle.left = '0';
                modalStyle.marginLeft = '0';
                hasLeftOffset = true; // Update flag as position is now fixed.
                positionOffset.left = 0;
            }
            if (dialogModal.offsetTop < 0 && !hasTopOffset) {
                modalStyle.top = '0';
                modalStyle.marginTop = '0';
                hasTopOffset = true; // Update flag.
                positionOffset.top = 0;
            }

            // Make modal draggable by its header.
            const modalHeader = dialogModal.children[0];
            attachEventHandler(modalHeader, "mousedown", function (event) {
                draggableElement = dialogModal;
                dragOffsetX = event.pageX - draggableElement.offsetLeft;
                dragOffsetY = event.pageY + currentScrollPosition - draggableElement.offsetTop;
                return false; // Prevent default drag behavior.
            });

            // Global mousemove handler for dragging.
            attachEventHandler(bodyElement, "mousemove", function (event) {
                if (draggableElement === null) return; // Only process if an element is being dragged.

                mouseX = event.pageX;
                mouseY = event.pageY + currentScrollPosition; // Account for scroll.

                const halfModalWidth = hasLeftOffset ? 0 : modalWidth / 2;
                const halfModalHeight = hasTopOffset ? 0 : modalHeight / 2;

                let newLeft = mouseX - dragOffsetX + halfModalWidth;
                let newTop = mouseY - dragOffsetY + halfModalHeight;

                // Restrict dragging within viewport boundaries.
                if (newLeft < halfModalWidth) newLeft = halfModalWidth;
                if (newTop < halfModalHeight) newTop = halfModalHeight;

                const effectiveWidth = hasLeftOffset ? modalWidth : 0;
                const effectiveHeight = hasTopOffset ? modalHeight : 0;

                if (newLeft + halfModalWidth + effectiveWidth > viewportWidth) {
                    newLeft = viewportWidth - halfModalWidth - effectiveWidth;
                }
                if (newTop + halfModalHeight + effectiveHeight > viewportHeight) {
                    newTop = viewportHeight - halfModalHeight - effectiveHeight;
                }

                modalStyle.left = `${newLeft}px`;
                modalStyle.top = `${newTop - currentScrollPosition}px`; // Adjust for scroll when setting top.
            });

            // Global mouseup handler to stop dragging.
            attachEventHandler(bodyElement, "mouseup", function () {
                draggableElement = null; // Reset draggable element.
                // Optionally remove mousemove handler here to be more efficient,
                // but for simplicity, it's removed on popup close.
            });

        }, 10); // Small delay to ensure modal is rendered and dimensions are available.

        if (isFunction(dialogCallback)) {
            dialogCallback(dialogOverlay, dialogModal);
        }
    };

    /**
     * Displays a dropdown menu.
     * @param {string|Function} [dropdownType='default'] - The type of dropdown or a callback function.
     * @param {Function} [dropdownCallback] - Function to execute after dropdown is rendered.
     * @param {object} [positionOffset] - Optional {left, top} coordinates for initial positioning.
     */
    self.showDropdown = function (dropdownType, dropdownCallback, positionOffset) {
        if (isFunction(dropdownType)) {
            positionOffset = dropdownCallback;
            dropdownCallback = dropdownType;
            dropdownType = 'default';
        }

        // If no offset provided and a button was clicked, position relative to that button.
        if (!positionOffset && lastClickedButton) {
            positionOffset = {
                left: lastClickedButton.offsetLeft,
                top: lastClickedButton.offsetTop + lastClickedButton.offsetHeight // Position below the button.
            };
        }
        dropdownType = dropdownType || 'default';
        positionOffset = positionOffset || {};

        currentScrollPosition = bodyElement.scrollTop || bodyElement.parentNode.scrollTop;

        actionDropdown.className = currentConfig.dropdownClass.replace(/%s/g, dropdownType);
        const dropdownStyle = actionDropdown.style;
        const hasLeftOffset = 'left' in positionOffset;
        const hasTopOffset = 'top' in positionOffset;

        dropdownStyle.visibility = 'hidden';
        bodyElement.appendChild(actionDropdown);

        windowRef.setTimeout(function () {
            const dropdownWidth = actionDropdown.offsetWidth;
            const dropdownHeight = actionDropdown.offsetHeight;

            dropdownStyle.position = 'absolute';
            dropdownStyle.left = hasLeftOffset ? `${positionOffset.left}px` : '50%';
            dropdownStyle.top = hasTopOffset ? `${positionOffset.top}px` : '50%';
            dropdownStyle.zIndex = '9999';

            dropdownStyle.marginLeft = (hasLeftOffset ? 0 : 0 - (dropdownWidth / 2)) + 'px';
            dropdownStyle.marginTop = (hasTopOffset ? 0 : currentScrollPosition - (dropdownHeight / 2)) + 'px';
            dropdownStyle.visibility = "";

            // Adjust dropdown position if it goes off-screen.
            if (positionOffset.left + dropdownWidth > viewportWidth) {
                dropdownStyle.left = `${viewportWidth - dropdownWidth}px`;
                dropdownStyle.marginLeft = '0';
            }
            if (positionOffset.top + dropdownHeight > viewportHeight) {
                dropdownStyle.top = `${viewportHeight - dropdownHeight}px`;
                dropdownStyle.marginTop = '0';
            }
        }, 10);

        if (isFunction(dropdownCallback)) {
            dropdownCallback(actionDropdown);
        }
    };

    /**
     * Hides and removes all active modals and dropdowns from the DOM.
     * @param {boolean} [shouldFocus=false] - If true, attempts to re-focus the textarea.
     */
    self.closeAllPopups = function (shouldFocus = false) {
        if (dialogOverlay.parentNode) {
            dialogOverlay.parentNode.removeChild(dialogOverlay);
        }
        if (dialogModal.parentNode) {
            dialogModal.parentNode.removeChild(dialogModal);
            // Ensure any dragging state is cleared.
            draggableElement = null;
            // Remove global mousemove/mouseup handlers if they were added for dragging.
            attachEventHandler(bodyElement, "mousemove", null);
            attachEventHandler(bodyElement, "mouseup", null);
        }
        if (actionDropdown.parentNode) {
            actionDropdown.parentNode.removeChild(actionDropdown);
        }

        if (shouldFocus) {
            textAreaElement.focus();
        }
    };

    /**
     * Displays a prompt dialog to get user input.
     * @param {string} dialogTitle - The title of the prompt dialog.
     * @param {string} initialValue - The initial value for the input field.
     * @param {boolean} isRequired - If true, input cannot be empty.
     * @param {Function} resultCallback - Callback function (receives user input).
     * @param {object} [positionOffset] - Optional {left, top} coordinates.
     */
    self.showPrompt = function (dialogTitle, initialValue, isRequired, resultCallback, positionOffset) {
        self.showModal('prompt', function (overlayElement, modalElement) {
            const handleSuccess = function (inputValue) {
                if (isFunction(resultCallback)) {
                    self.closeAllPopups();
                    resultCallback(inputValue);
                } else {
                    self.closeAllPopups(true); // Close and focus textarea.
                }
            };

            const inputField = documentRef.createElement('input');
            inputField.type = 'text';
            inputField.value = initialValue;
            inputField.setAttribute('aria-label', dialogTitle); // Accessibility improvement

            attachEventHandler(inputField, "keydown", function (event) {
                const keyCode = event.keyCode;
                if (keyCode === 27) { // ESC key
                    return self.closeAllPopups(true), false;
                }
                if (keyCode === 40) { // Down arrow
                    return okButton.focus(), false;
                }

                if (keyCode === 13) { // Enter key
                    if (isRequired && (this.value === "" || this.value === initialValue)) {
                        // If required and value is empty or unchanged, do nothing or show error.
                        // For now, just prevent action.
                        return false;
                    }
                    handleSuccess(this.value === initialValue ? "" : this.value);
                    return false;
                }
            });

            const okButton = documentRef.createElement('button');
            okButton.innerHTML = currentConfig.displayLabels.confirmOk;
            okButton.className = 'dialog-button dialog-button-ok'; // Add class for styling

            attachEventHandler(okButton, "click", function () {
                if (isRequired) {
                    if (inputField.value !== "" && inputField.value !== initialValue) {
                        handleSuccess(inputField.value);
                    }
                } else {
                    handleSuccess(inputField.value === initialValue ? "" : inputField.value);
                }
                return false;
            });

            const cancelButton = documentRef.createElement('button');
            cancelButton.innerHTML = currentConfig.displayLabels.confirmCancel;
            cancelButton.className = 'dialog-button dialog-button-cancel'; // Add class for styling

            attachEventHandler(cancelButton, "click", function () {
                return self.closeAllPopups(true), false;
            });

            // Keyboard navigation for buttons.
            attachEventHandler(okButton, "keydown", function (event) {
                const keyCode = event.keyCode;
                if (keyCode === 27) return self.closeAllPopups(true), false;
                if (keyCode === 38) return inputField.focus(), false; // Up arrow to input.
                if (keyCode === 39) return cancelButton.focus(), false; // Right arrow to cancel.
            });
            attachEventHandler(cancelButton, "keydown", function (event) {
                const keyCode = event.keyCode;
                if (keyCode === 27) return self.closeAllPopups(true), false;
                if (keyCode === 37) return okButton.focus(), false; // Left arrow to OK.
                if (keyCode === 38) return inputField.focus(), false; // Up arrow to input.
            });

            // Populate modal elements.
            modalElement.children[0].innerHTML = dialogTitle || "";
            modalElement.children[1].appendChild(inputField);
            modalElement.children[2].appendChild(okButton);
            modalElement.children[2].appendChild(documentRef.createTextNode(' ')); // Spacer
            modalElement.children[2].appendChild(cancelButton);

            // Focus and select input field after modal is visible.
            windowRef.setTimeout(function () {
                inputField.select();
            }, 10);
        }, positionOffset);
    };

    /**
     * Displays a simple alert dialog.
     * @param {string} dialogTitle - The title of the alert.
     * @param {string} alertMessage - The message content.
     * @param {Function} [confirmCallback] - Optional callback when OK is clicked.
     * @param {object} [positionOffset] - Optional {left, top} coordinates.
     */
    self.showAlert = function (dialogTitle, alertMessage, confirmCallback, positionOffset) {
        self.showModal('alert', function (overlayElement, modalElement) {
            const okButton = documentRef.createElement('button');
            okButton.innerHTML = currentConfig.displayLabels.confirmOk;
            okButton.className = 'dialog-button dialog-button-ok';

            attachEventHandler(okButton, "click", function () {
                if (isFunction(confirmCallback)) {
                    self.closeAllPopups();
                    confirmCallback();
                } else {
                    self.closeAllPopups(true);
                }
                return false;
            });

            attachEventHandler(okButton, "keydown", function (event) {
                if (event.keyCode === 27) return self.closeAllPopups(true), false; // ESC key.
            });

            modalElement.children[0].innerHTML = dialogTitle || "";
            modalElement.children[1].innerHTML = alertMessage || "";
            modalElement.children[2].appendChild(okButton);

            windowRef.setTimeout(function () {
                okButton.focus(); // Focus the OK button for immediate action.
            }, 10);
        }, positionOffset);
    };

    /**
     * Displays a confirmation dialog with OK and Cancel options.
     * @param {string} dialogTitle - The title of the confirmation.
     * @param {string} confirmMessage - The message content.
     * @param {object} callbacks - Object with `OK` and `CANCEL` functions.
     * @param {object} [positionOffset] - Optional {left, top} coordinates.
     */
    self.showConfirm = function (dialogTitle, confirmMessage, callbacks, positionOffset) {
        self.showModal('confirm', function (overlayElement, modalElement) {
            const okButton = documentRef.createElement('button');
            okButton.innerHTML = currentConfig.displayLabels.confirmOk;
            okButton.className = 'dialog-button dialog-button-ok';

            attachEventHandler(okButton, "click", function () {
                if (isObject(callbacks) && isFunction(callbacks.OK)) {
                    self.closeAllPopups();
                    callbacks.OK();
                } else {
                    self.closeAllPopups(true);
                }
                return false;
            });

            const cancelButton = documentRef.createElement('button');
            cancelButton.innerHTML = currentConfig.displayLabels.confirmCancel;
            cancelButton.className = 'dialog-button dialog-button-cancel';

            attachEventHandler(cancelButton, "click", function () {
                if (isObject(callbacks) && isFunction(callbacks.CANCEL)) {
                    self.closeAllPopups();
                    callbacks.CANCEL();
                } else {
                    self.closeAllPopups(true);
                }
                return false;
            });

            // Keyboard navigation for buttons.
            attachEventHandler(okButton, "keydown", function (event) {
                const keyCode = event.keyCode;
                if (keyCode === 27) return self.closeAllPopups(true), false;
                if (keyCode === 39) return cancelButton.focus(), false; // Right arrow to cancel.
            });
            attachEventHandler(cancelButton, "keydown", function (event) {
                const keyCode = event.keyCode;
                if (keyCode === 27) return self.closeAllPopups(true), false;
                if (keyCode === 37) return okButton.focus(), false; // Left arrow to OK.
            });

            modalElement.children[0].innerHTML = dialogTitle || "";
            modalElement.children[1].innerHTML = confirmMessage || "";
            modalElement.children[2].appendChild(okButton);
            modalElement.children[2].appendChild(documentRef.createTextNode(' ')); // Spacer
            modalElement.children[2].appendChild(cancelButton);

            windowRef.setTimeout(function () {
                okButton.focus(); // Focus the OK button.
            }, 10);
        }, positionOffset);
    };

    // --- New Code Fragments (Type III additions) ---

    /**
     * Exposes the underlying text processor instance.
     * Useful for direct interaction with the textarea's selection/insertion logic.
     * @returns {Editor} The text processor instance.
     */
    self.getProcessor = function() {
        return textProcessor;
    };

    /**
     * Dynamically updates the editor's configuration settings.
     * Merges new options with the existing configuration.
     * @param {object} newOptions - An object containing new configuration settings.
     */
    self.updateConfig = function(newOptions) {
        if (!isObject(newOptions)) {
            console.warn("MarkdownEditor: Attempted to update config with invalid options.");
            return;
        }
        deepMerge(currentConfig, newOptions);
        // In a more complete implementation, one might re-evaluate regex patterns
        // or re-render toolbar if relevant config changes (e.g., button formats).
    };

    // Initial setup complete, notify if onReady callback exists.
    if (isFunction(currentConfig.onReady)) {
        // Execute the onReady callback in the context of the editor instance.
        currentConfig.onReady.call(self);
    }
};