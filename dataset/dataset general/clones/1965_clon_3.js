/*
 * Text Composition Environment 1.0.0
 *
 * Copyright (c) 2023
 * CoreLogic Innovations Inc.
 *
 * Distributed under the Revised BSD License
 * http://opensource.org/licenses/BSD-3-Clause
 *
 * Repository: https://github.com/corelogic/text-composer
 * Version: 1.0.0
 *
 * This utility incorporates concepts from earlier WYSIWYG editors,
 * including Medium.js by Jacob Kelley and jQuery Notebook by Raphael Cruzeiro.
 */

(function(jq, doc, win) {
    "use strict";

    // Ensure jQuery is available
    if (typeof jq === 'undefined') {
        console.error("jQuery (jq) is not loaded. This module requires jQuery.");
        return;
    }

    // A small utility for debouncing function calls
    const debounce = (func, delay) => {
        let timeout;
        return function(...args) {
            const context = this;
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(context, args), delay);
        };
    };

    /*
     * The `transformManager` handles CSS 2D transformations. Due to the
     * additive nature of transforms, this module abstracts the process by
     * combining new transformations with any pre-existing ones on an element
     * into a single matrix string, ensuring consistent application across browsers.
     */
    const transformManager = (() => {
        const CSS_PREFIXES = ['-webkit-', '-moz-', '-o-', '-ms-', ''];
        const DEFAULT_MATRIX = [1, 0, 0, 1, 0, 0]; // Identity matrix

        /**
         * Converts a CSS transform matrix string into an array of numbers.
         * @param {string} matrixStr The CSS matrix string (e.g., "matrix(1, 0, 0, 1, 0, 0)").
         * @returns {number[]} An array of matrix values.
         */
        const parseMatrixString = (matrixStr) => {
            if (!matrixStr || matrixStr === 'none') {
                return [...DEFAULT_MATRIX]; // Return a copy of the default matrix
            }
            // Extract numbers, converting them to floats
            return matrixStr.match(/(-?[0-9\.]+)/g).map(Number);
        };

        /**
         * Retrieves any existing CSS transform property from an element, checking various vendor prefixes.
         * @param {jQuery} targetElement The jQuery element.
         * @returns {string|null} The transform string, or null if none found.
         */
        const retrieveComputedTransforms = (targetElement) => {
            for (const prefix of CSS_PREFIXES) {
                const transformValue = targetElement.css(`${prefix}transform`);
                if (transformValue && transformValue !== 'none') {
                    return transformValue;
                }
            }
            return null;
        };

        /**
         * Gets the current transformation matrix for an element.
         * @param {jQuery} targetElement The jQuery element.
         * @returns {number[]} The transformation matrix as an array.
         */
        const fetchCurrentMatrix = (targetElement) => {
            const previousTransform = retrieveComputedTransforms(targetElement);
            return parseMatrixString(previousTransform);
        };

        /**
         * Applies a generated CSS transform string to an element, including all vendor prefixes.
         * @param {jQuery} targetElement The jQuery element.
         * @param {string} transformDeclaration The CSS transform string (e.g., "matrix(...)").
         */
        const applyCssTransform = (targetElement, transformDeclaration) => {
            for (const prefix of CSS_PREFIXES) {
                targetElement.css(`${prefix}transform`, transformDeclaration);
            }
        };

        /**
         * Constructs a CSS matrix string from an array of 6 matrix values.
         * @param {number[]} matrixArray An array of 6 numbers representing the matrix.
         * @returns {string} The CSS 'matrix()' declaration.
         */
        const composeMatrixString = (matrixArray) => {
            // Using template literals for cleaner string construction
            return `matrix(${matrixArray[0]}, ${matrixArray[1]}, ${matrixArray[2]}, ${matrixArray[3]}, ${matrixArray[4]}, ${matrixArray[5]})`;
        };

        /**
         * Extracts the current translation (x, y) values from an element's transform matrix.
         * @param {jQuery} targetElement The jQuery element.
         * @returns {{x: number, y: number}} An object containing the x and y translation values.
         */
        const extractTranslationValues = (targetElement) => {
            const currentMatrix = fetchCurrentMatrix(targetElement);
            // Matrix values for translation are at indices 4 and 5 (tx, ty)
            return {
                x: Number(currentMatrix[4]),
                y: Number(currentMatrix[5])
            };
        };

        /**
         * Applies a scaling factor to an element.
         * @param {jQuery} targetElement The jQuery element.
         * @param {number} scaleFactor The desired scaling factor (e.g., 1 for no scale, 2 for double).
         */
        const setElementScale = (targetElement, scaleFactor) => {
            if (typeof scaleFactor !== 'number' || isNaN(scaleFactor)) {
                console.warn("Invalid scale factor provided. Skipping scale operation.");
                return;
            }
            const currentMatrix = fetchCurrentMatrix(targetElement);
            // Scale factors affect matrix[0] (scaleX) and matrix[3] (scaleY)
            currentMatrix[0] = scaleFactor;
            currentMatrix[3] = scaleFactor;
            const newTransform = composeMatrixString(currentMatrix);
            applyCssTransform(targetElement, newTransform);
        };

        /**
         * Translates an element by specified X and Y pixel values.
         * @param {jQuery} targetElement The jQuery element.
         * @param {number} posX The X-axis translation in pixels.
         * @param {number} posY The Y-axis translation in pixels.
         */
        const applyTranslation = (targetElement, posX, posY) => {
            const currentMatrix = fetchCurrentMatrix(targetElement);
            // Translation values are at matrix[4] (translateX) and matrix[5] (translateY)
            currentMatrix[4] = Number(posX);
            currentMatrix[5] = Number(posY);
            const newTransform = composeMatrixString(currentMatrix);
            applyCssTransform(targetElement, newTransform);
        };

        /**
         * Rotates an element by a specified degree amount.
         * Note: This implementation is a simplification and might not correctly combine with existing scale/translate.
         * For full matrix combination, a more complex matrix multiplication would be needed.
         * @param {jQuery} targetElement The jQuery element.
         * @param {number} degrees The rotation angle in degrees.
         */
        const rotateElementByDegrees = (targetElement, degrees) => {
            const currentMatrix = fetchCurrentMatrix(targetElement);
            const radiansForRotation = degrees * (Math.PI / 180);
            const cosVal = Math.cos(radiansForRotation);
            const sinVal = Math.sin(radiansForRotation);

            // For a simple rotation, we modify a, b, c, d (matrix[0], [1], [2], [3])
            // This will overwrite previous scale/skew if not carefully combined.
            // A more robust solution would involve matrix multiplication.
            currentMatrix[0] = cosVal;
            currentMatrix[1] = sinVal;
            currentMatrix[2] = -sinVal;
            currentMatrix[3] = cosVal;

            const newTransform = composeMatrixString(currentMatrix);
            applyCssTransform(targetElement, newTransform);
        };

        return {
            setElementScale: setElementScale,
            applyTranslation: applyTranslation,
            rotateElementByDegrees: rotateElementByDegrees,
            extractTranslationValues: extractTranslationValues
        };
    })();

    // Global state variables and configurations
    const isAppleDevice = win.navigator.platform.includes('Mac');
    let currentPointerX = 0; // Tracks the last known mouse X coordinate
    let currentPointerY = 0; // Tracks the last known mouse Y coordinate

    // Application-wide cache for transient states
    const applicationCache = {
        isCommandPressed: false,
        isShiftPressed: false,
        isTextSelecting: false,
        activeSelectionRange: null, // Stores the last active text selection range
        focusedElementRef: null, // Reference to the currently focused content element
        focusedElementIndex: -1 // Index of the focused element within its parent
    };

    // Mappings for keyboard shortcuts to editor commands
    const keyboardShortcuts = Object.freeze({
        66: 'bold', // B
        73: 'italic', // I
        85: 'underline', // U
        112: 'h1', // F1
        113: 'h2', // F2
        122: 'undo' // F11
    });

    let pluginConfiguration; // Stores the configuration options for the editor instance
    let hiddenContentStorageArea; // Reference to the hidden textarea for content storage

    // Minimal definition of the 'events' object to prevent errors, as its commands are called.
    // Full implementation of these commands is outside the scope of this cloning task.
    const events = {
        commands: {
            bold: function(e) { console.log("Bold command triggered", e); },
            italic: function(e) { console.log("Italic command triggered", e); },
            underline: function(e) { console.log("Underline command triggered", e); },
            h1: function(e) { console.log("H1 command triggered", e); },
            h2: function(e) { console.log("H2 command triggered", e); },
            undo: function(e) { console.log("Undo command triggered", e); },
            createLink: function(e, selection) { console.log("Create Link command triggered", e, selection); },
            removeLink: function(e, selection) { console.log("Remove Link command triggered", e, selection); }
        },
        paste: function(e) { console.log("Paste event triggered", e); }
    };

    /*
     * The `coreUtilities` module provides a collection of helper functions
     * for keyboard interaction, DOM manipulation, cursor management,
     * text selection, and input validation.
     */
    const coreUtilities = {
        keyInteraction: {
            /**
             * Checks if the Command (Mac) or Control (Windows/Linux) key is pressed.
             * @param {Event} keyEvent The keyboard event.
             * @returns {boolean} True if the command/control key is pressed, false otherwise.
             */
            detectCommandKey: (keyEvent) => {
                return (isAppleDevice && keyEvent.metaKey) || (!isAppleDevice && keyEvent.ctrlKey);
            },
            /**
             * Checks if the Shift key is pressed.
             * @param {Event} keyEvent The keyboard event.
             * @returns {boolean} True if the Shift key is pressed, false otherwise.
             */
            detectShiftKey: (keyEvent) => {
                return keyEvent.shiftKey;
            },
            /**
             * Determines if the pressed key corresponds to a defined editor modifier (shortcut).
             * @param {Event} keyEvent The keyboard event.
             * @param {Function} callback A function to call if a modifier is found, passing the command name.
             */
            handleModifierKey: (keyEvent, callback) => {
                const keyCode = keyEvent.which;
                const commandName = keyboardShortcuts[keyCode];
                if (commandName) {
                    callback.call(this, commandName);
                }
            },
            /**
             * Checks if the Enter key was pressed.
             * @param {Event} keyEvent The keyboard event.
             * @returns {boolean} True if Enter key, false otherwise.
             */
            isEnterKey: (keyEvent) => {
                return keyEvent.which === 13;
            },
            /**
             * Checks if an arrow key (left, up, right, down) was pressed.
             * @param {Event} keyEvent The keyboard event.
             * @returns {boolean} True if an arrow key, false otherwise.
             */
            isArrowKey: (keyEvent) => {
                const keyCode = keyEvent.which;
                return keyCode >= 37 && keyCode <= 40;
            }
        },
        markupManipulation: {
            /**
             * Creates a new DOM element of a specified tag type, appends it to a parent,
             * and optionally sets contenteditable and focus.
             * @param {jQuery} parentElement The jQuery parent element to append to.
             * @param {string} tagName The HTML tag name (e.g., 'p', 'div').
             * @param {boolean} [shouldFocus=false] Whether to set focus on the new element.
             * @param {boolean} [isContentEditable=true] Whether the new element should be contenteditable.
             * @param {Object} [attributes={}] An object of attributes to set on the new element.
             * @returns {jQuery} The newly created jQuery element.
             */
            createElementAndAppend: (parentElement, tagName, shouldFocus = false, isContentEditable = true, attributes = {}) => {
                const newElement = jq(doc.createElement(tagName));
                newElement.attr('contenteditable', Boolean(isContentEditable));
                newElement.attr(attributes); // Apply additional attributes
                newElement.append(' '); // Add a non-breaking space for cursor placement
                parentElement.append(newElement);

                if (shouldFocus) {
                    applicationCache.focusedElementRef = newElement;
                    coreUtilities.caretPlacement.positionCaret(parentElement, 0, newElement);
                }
                return newElement;
            }
        },
        caretPlacement: {
            /**
             * Sets the text caret (cursor) at a specific position within an element.
             * @param {jQuery} editorElement The main editor jQuery element.
             * @param {number} [position=0] The character offset within the target element.
             * @param {jQuery} [targetElement] The specific jQuery element to place the caret in.
             *                                   If not provided, uses the last child of the editor.
             */
            positionCaret: (editorElement, position, targetElement) => {
                let selectionRange;
                if (doc.createRange && win.getSelection) {
                    selectionRange = doc.createRange();
                    const currentSelection = win.getSelection();
                    const lastChildOfEditor = editorElement.children().last();
                    const elementToModify = targetElement ? targetElement[0] : lastChildOfEditor[0];

                    // Ensure elementToModify is a text node or has text content
                    let textNode = elementToModify;
                    if (elementToModify.childNodes.length > 0 && elementToModify.childNodes[0].nodeType === Node.TEXT_NODE) {
                        textNode = elementToModify.childNodes[0];
                    } else if (elementToModify.textContent.length === 0) {
                        // If element is empty, create a text node
                        const emptyTextNode = doc.createTextNode('');
                        elementToModify.appendChild(emptyTextNode);
                        textNode = emptyTextNode;
                    }

                    const desiredPosition = typeof position !== 'undefined' ? position : (textNode.length || 0);

                    selectionRange.setStart(textNode, Math.min(desiredPosition, textNode.length));
                    selectionRange.collapse(true); // Collapse the range to a single point

                    currentSelection.removeAllRanges();
                    currentSelection.addRange(selectionRange);
                } else if (doc.body.createTextRange) { // IE < 9 support
                    selectionRange = doc.body.createTextRange();
                    const ieTarget = targetElement ? targetElement[0] : editorElement.children().last()[0];
                    selectionRange.moveToElementText(ieTarget);
                    selectionRange.collapse(false); // Move to end of element
                    selectionRange.select();
                }
            }
        },
        textSelectionManager: {
            /**
             * Saves the current text selection range.
             * @returns {Range|TextRange|null} The saved selection range object, or null if no selection.
             */
            captureCurrentRange: () => {
                if (win.getSelection) {
                    const sel = win.getSelection();
                    if (sel.rangeCount > 0) {
                        return sel.getRangeAt(0);
                    }
                } else if (doc.selection && doc.selection.createRange) { // IE < 9
                    return doc.selection.createRange();
                }
                return null;
            },
            /**
             * Restores a previously saved text selection range.
             * @param {Range|TextRange} savedRange The selection range to restore.
             */
            applySavedRange: (savedRange) => {
                if (!savedRange) return;
                if (win.getSelection) {
                    const sel = win.getSelection();
                    sel.removeAllRanges();
                    sel.addRange(savedRange);
                } else if (doc.selection && savedRange.select) { // IE < 9
                    savedRange.select();
                }
            },
            /**
             * Retrieves the currently selected text.
             * @returns {string} The selected text.
             */
            retrieveSelectedText: () => {
                if (win.getSelection) {
                    return win.getSelection().toString();
                } else if (doc.getSelection) { // Fallback for older browsers
                    return doc.getSelection().toString();
                } else if (doc.selection) { // IE < 9
                    return doc.selection.createRange().text;
                }
                return '';
            },
            /**
             * Clears the current text selection.
             */
            clearActiveSelection: () => {
                if (win.getSelection) {
                    const sel = win.getSelection();
                    if (sel.empty) { // Chrome
                        sel.empty();
                    } else if (sel.removeAllRanges) { // Firefox
                        sel.removeAllRanges();
                    }
                } else if (doc.selection) { // IE < 9
                    doc.selection.empty();
                }
            },
            /**
             * Gets the common ancestor container node for the current selection.
             * @param {Selection|Range} selectionObject The selection object or a range.
             * @returns {Node|null} The common ancestor node.
             */
            getCommonAncestorContainer: (selectionObject) => {
                if (win.getSelection && selectionObject && selectionObject.commonAncestorContainer) {
                    return selectionObject.commonAncestorContainer;
                } else if (doc.selection && selectionObject && selectionObject.parentElement) {
                    return selectionObject.parentElement(); // IE
                }
                return null;
            },
            /**
             * Gets the native Selection object from the window or document.
             * @returns {Selection|TextRange|null} The native selection object.
             */
            getActiveSelectionObject: () => {
                if (win.getSelection) {
                    return win.getSelection();
                } else if (doc.selection && doc.selection.createRange) { // IE < 9
                    return doc.selection;
                }
                return null;
            }
        },
        dataValidation: {
            /**
             * Validates if a given string is a well-formed URL.
             * @param {string} urlString The string to validate.
             * @returns {boolean} True if it's a valid URL, false otherwise.
             */
            validateUrlFormat: (urlString) => {
                // More robust regex for URL validation, including IP addresses and optional protocol.
                const urlRegex = /^(https?:\/\/)?((([a-z\d]([a-z\d-]*[a-z\d])?)\.)+[a-z]{2,}|((\d{1,3}\.){3}\d{1,3}))(\:\d+)?(\/[-a-z\d%_.~+]*)*(\?[;&a-z\d%_.~+=-]*)?(\#[-a-z\d_]*)?$/i;
                return urlRegex.test(urlString);
            }
        }
    };

    /*
     * The `floatingControlPanel` module manages the display, positioning,
     * and state of the contextual formatting toolbar (the "bubble").
     */
    const floatingControlPanel = {
        /**
         * Recalculates and sets the position of the floating toolbar above the current text selection.
         * @param {jQuery} editorRootElement The main editor container.
         * @param {jQuery} panelElement The jQuery element representing the floating toolbar.
         */
        adjustPanelPosition: (editorRootElement, panelElement) => {
            const currentSel = win.getSelection();
            if (!currentSel || currentSel.rangeCount === 0) return;

            const currentRange = currentSel.getRangeAt(0);
            const selectionBoundary = currentRange.getBoundingClientRect();
            const panelWidth = panelElement.outerWidth();
            const panelHeight = panelElement.outerHeight();
            const editorOffsetLeft = editorRootElement.offset().left;

            // Calculate target X position: center of selection, adjusted for panel width
            const targetX = (selectionBoundary.left + (selectionBoundary.width / 2)) - (panelWidth / 2);
            // Calculate target Y position: above selection, with a small offset, and scroll-aware
            const targetY = selectionBoundary.top - panelHeight - 8 + win.scrollY;

            transformManager.applyTranslation(panelElement, targetX, targetY);
        },

        /**
         * Updates the active/inactive states of buttons in the toolbar based on the current text selection's formatting.
         * @param {jQuery} editorRootElement The main editor container.
         * @param {jQuery} panelElement The jQuery element representing the floating toolbar.
         */
        syncButtonStates: (editorRootElement, panelElement) => {
            panelElement.find('button').removeClass('active');
            const currentSel = win.getSelection();
            if (!currentSel || !currentSel.focusNode) return;

            const detectedFormats = [];
            floatingControlPanel.recursivelyCheckFormats(currentSel.focusNode, detectedFormats);

            const formatClassMap = {
                'b': 'bold',
                'i': 'italic',
                'u': 'underline',
                'h1': 'h1',
                'h2': 'h2',
                'a': 'anchor',
                'ul': 'ul',
                'ol': 'ol',
                'li': 'list-item' // Added for more specific list item highlighting if needed
            };

            for (const formatTag of detectedFormats) {
                const className = formatClassMap[formatTag];
                if (className) {
                    panelElement.find(`button.${className}`).addClass('active');
                }
            }
        },

        /**
         * Recursively traverses up the DOM tree from a given node to identify
         * all formatting tags (e.g., B, I, U, H1) enclosing the node.
         * @param {Node} currentNode The starting DOM node (e.g., selection focus node).
         * @param {string[]} formatTagsAccumulator An array to accumulate detected format tag names (lowercase).
         * @param {number} [depth=0] Current recursion depth to prevent infinite loops.
         */
        recursivelyCheckFormats: (currentNode, formatTagsAccumulator, depth = 0) => {
            const MAX_RECURSION_DEPTH = 10; // Prevent excessively deep recursion

            if (!currentNode || depth > MAX_RECURSION_DEPTH) {
                return;
            }

            const nodeNameLower = currentNode.nodeName.toLowerCase();
            const relevantFormats = ['b', 'strong', 'i', 'em', 'u', 'h1', 'h2', 'ol', 'ul', 'li', 'a'];

            if (nodeNameLower !== '#text' && relevantFormats.includes(nodeNameLower)) {
                if (!formatTagsAccumulator.includes(nodeNameLower)) { // Avoid duplicates
                    formatTagsAccumulator.push(nodeNameLower);
                }
            }

            // Continue recursion up the parent node
            if (currentNode.parentNode) {
                floatingControlPanel.recursivelyCheckFormats(currentNode.parentNode, formatTagsAccumulator, depth + 1);
            }
        },

        /**
         * Builds the interactive menu elements (buttons for formatting, link input) within the toolbar.
         * @param {jQuery} editorRootElement The main editor container.
         * @param {jQuery} panelElement The jQuery element representing the floating toolbar.
         */
        constructPanelElements: (editorRootElement, panelElement) => {
            panelElement.empty(); // Clear existing content before building

            const buttonList = coreUtilities.markupManipulation.createElementAndAppend(panelElement, 'ul', false, false);
            buttonList.addClass('toolbar-actions');

            // Add formatting buttons based on configured shortcuts
            for (const keyCode in keyboardShortcuts) {
                const command = keyboardShortcuts[keyCode];
                const listItem = coreUtilities.markupManipulation.createElementAndAppend(buttonList, 'li', false, false);
                const actionButton = coreUtilities.markupManipulation.createElementAndAppend(listItem, 'button', false, false, {
                    'data-editor-command': command, // Use data-attribute instead of editor-command
                    'title': `Apply ${command} formatting`
                });
                actionButton.addClass(command); // Add class for styling and state
                // Add an icon or text for the button, e.g., using a span
                actionButton.append(`<span class="icon-${command}"></span>`);
            }

            // Attach click handler for all buttons in the toolbar
            buttonList.find('button').on('click', function(evt) {
                evt.preventDefault();
                evt.stopPropagation(); // Prevent event bubbling up to editor
                const commandToExecute = jq(this).data('editor-command'); // Use .data() for data-attributes
                if (events.commands[commandToExecute]) {
                    events.commands[commandToExecute].call(editorRootElement, evt);
                } else {
                    console.warn(`Command "${commandToExecute}" not found.`);
                }
            });

            // Create the link input area
            const linkEditorArea = coreUtilities.markupManipulation.createElementAndAppend(panelElement, 'div', false, false);
            linkEditorArea.addClass('link-input-section');

            const urlInputField = coreUtilities.markupManipulation.createElementAndAppend(linkEditorArea, 'input', false, false, {
                type: 'text',
                placeholder: 'Enter URL and press Enter'
            });
            urlInputField.addClass('url-input-field');

            const closeLinkEditorBtn = coreUtilities.markupManipulation.createElementAndAppend(linkEditorArea, 'button', false, false, {
                title: 'Close link editor'
            });
            closeLinkEditorBtn.addClass('close-link-editor');
            closeLinkEditorBtn.append('&times;'); // HTML entity for 'x'

            closeLinkEditorBtn.on('click', function(evt) {
                evt.preventDefault();
                evt.stopPropagation();
                floatingControlPanel.deactivateLinkInput.call(editorRootElement);
                floatingControlPanel.showActionButtons.call(editorRootElement);
            });
        },

        /**
         * Displays the floating toolbar, builds its content, and positions it.
         * @param {jQuery} editorRootElement The main editor container (this will be `this` in the context).
         */
        displayPanel: function() {
            const editorRootElement = jq(this);
            let panelElement = editorRootElement.parent().find('.floating-toolbar');

            // Create panel if it doesn't exist
            if (panelElement.length === 0) {
                panelElement = coreUtilities.markupManipulation.createElementAndAppend(editorRootElement.parent(), 'div', false, false);
                panelElement.addClass('text-composer-toolbar floating-toolbar');
                // Initially hide it to prevent flash of unstyled content
                panelElement.css('visibility', 'hidden').hide();
            }

            // Rebuild menu content (buttons, link input)
            floatingControlPanel.constructPanelElements(editorRootElement, panelElement);

            // Show and position the panel
            panelElement.css('visibility', 'visible').show();
            floatingControlPanel.adjustPanelPosition(editorRootElement, panelElement);
            floatingControlPanel.syncButtonStates(editorRootElement, panelElement);

            // Add/remove 'jump' class for animation
            if (!panelElement.hasClass('is-active')) {
                panelElement.addClass('animate-in');
            } else {
                panelElement.removeClass('animate-in');
            }
            panelElement.addClass('is-active'); // Mark as active
        },

        /**
         * Updates the state of the buttons in the already displayed toolbar.
         * @param {jQuery} editorRootElement The main editor container (this will be `this` in the context).
         */
        refreshPanel: function() {
            const editorRootElement = jq(this);
            const panelElement = editorRootElement.parent().find('.floating-toolbar');
            if (panelElement.length) {
                floatingControlPanel.syncButtonStates(editorRootElement, panelElement);
                floatingControlPanel.adjustPanelPosition(editorRootElement, panelElement);
            }
        },

        /**
         * Hides and clears the floating toolbar after a short delay.
         * @param {jQuery} editorRootElement The main editor container (this will be `this` in the context).
         */
        concealPanel: function() {
            const editorRootElement = jq(this);
            const panelElement = editorRootElement.parent().find('.floating-toolbar');
            if (!panelElement.length || !panelElement.hasClass('is-active')) {
                return;
            }

            panelElement.removeClass('is-active');
            floatingControlPanel.deactivateLinkInput.call(editorRootElement);
            floatingControlPanel.showActionButtons.call(editorRootElement);

            // Hide after a short delay to allow for CSS transitions
            setTimeout(() => {
                if (!panelElement.hasClass('is-active')) { // Check again in case it became active during timeout
                    panelElement.hide().removeClass('animate-in').css('visibility', 'hidden');
                }
            }, 500); // Matches typical CSS transition duration
        },

        /**
         * Hides the main formatting action buttons in the toolbar.
         * @param {jQuery} editorRootElement The main editor container (this will be `this` in the context).
         */
        hideActionButtons: function() {
            jq(this).parent().find('.floating-toolbar .toolbar-actions').hide();
        },

        /**
         * Shows the main formatting action buttons in the toolbar.
         * @param {jQuery} editorRootElement The main editor container (this will be `this` in the context).
         */
        showActionButtons: function() {
            jq(this).parent().find('.floating-toolbar .toolbar-actions').show();
        },

        /**
         * Displays the link input field and hides the regular formatting buttons.
         * Handles link creation/removal based on user input.
         * @param {Selection} currentNativeSelection The native Selection object.
         * @param {jQuery} editorRootElement The main editor container (this will be `this` in the context).
         */
        activateLinkInput: function(currentNativeSelection) {
            floatingControlPanel.hideActionButtons.call(this);
            const editorRootElement = jq(this);
            const panelElement = editorRootElement.parent().find('.floating-toolbar');
            const linkInputSection = panelElement.find('.link-input-section');
            const urlInputField = linkInputSection.find('.url-input-field');

            // Determine if the current selection is already part of a link
            const isSelectionLinked = panelElement.find('button.anchor').hasClass('active');
            let initialLinkText = 'http://';
            if (isSelectionLinked) {
                const ancestorContainer = coreUtilities.textSelectionManager.getCommonAncestorContainer(currentNativeSelection);
                const anchorElement = jq(ancestorContainer).closest('a');
                initialLinkText = anchorElement.prop('href') || initialLinkText;
            }

            // Unbind previous event handlers to prevent duplicates
            urlInputField.off('keydown.linkEditor paste.linkEditor');

            // Attach keydown handler for Enter key
            urlInputField.on('keydown.linkEditor', debounce(function(keyEvent) {
                if (coreUtilities.keyInteraction.isEnterKey(keyEvent)) {
                    keyEvent.preventDefault(); // Prevent default browser behavior (e.g., new line)
                    const enteredUrl = urlInputField.val().trim();
                    if (coreUtilities.dataValidation.validateUrlFormat(enteredUrl)) {
                        keyEvent.url = enteredUrl; // Attach URL to event object
                        events.commands.createLink(keyEvent, applicationCache.activeSelectionRange);
                        floatingControlPanel.concealPanel.call(editorRootElement);
                    } else if (enteredUrl === '' && isSelectionLinked) {
                        events.commands.removeLink(keyEvent, applicationCache.activeSelectionRange);
                        floatingControlPanel.concealPanel.call(editorRootElement);
                    } else {
                        // Optionally, show an error message for invalid URL
                        urlInputField.addClass('invalid-input');
                        setTimeout(() => urlInputField.removeClass('invalid-input'), 1000);
                    }
                }
            }, 100)); // Debounce to prevent rapid firing

            // Attach paste handler to clean up pasted URLs
            urlInputField.on('paste.linkEditor', function() {
                const inputField = jq(this);
                setTimeout(() => {
                    let pastedText = inputField.val();
                    // Remove duplicate http:// if pasted from certain sources
                    if (pastedText.startsWith('http://http://')) {
                        pastedText = pastedText.substring(7);
                        inputField.val(pastedText);
                    }
                }, 1);
            });

            linkInputSection.show();
            urlInputField.val(initialLinkText).focus();
        },

        /**
         * Hides the link input field.
         * @param {jQuery} editorRootElement The main editor container (this will be `this` in the context).
         */
        deactivateLinkInput: function() {
            const linkInputSection = jq(this).parent().find('.floating-toolbar .link-input-section');
            linkInputSection.find('.url-input-field').off('keydown.linkEditor paste.linkEditor'); // Clean up events
            linkInputSection.hide();
        }
    };

    /*
     * The `editorLifecycleHooks` module manages the editor's setup,
     * event binding, and core operational logic.
     */
    const editorLifecycleHooks = {
        /**
         * Binds all necessary DOM event listeners to the editor element.
         * @param {jQuery} editorElement The main editor container.
         */
        attachEventDelegates: (editorElement) => {
            editorElement.on('keydown', domEventHandlers.onKeyDownAction);
            editorElement.on('keyup', domEventHandlers.onKeyUpAction);
            editorElement.on('focus', domEventHandlers.onFocusAction);
            editorElement.on('paste', domEventHandlers.onPasteAction);
            editorElement.on('mousedown', domEventHandlers.onMouseDownAction);
            editorElement.on('mouseup', domEventHandlers.onMouseUpAction);
            // Debounce mousemove to prevent excessive calls
            editorElement.on('mousemove', debounce(domEventHandlers.onMouseMoveAction, 50));
            editorElement.on('blur', domEventHandlers.onBlurAction);

            // Global mouseup handler for selection ending outside the editor
            jq(doc.body).on('mouseup', function(evt) {
                // Check if the mouseup occurred outside the editor and a selection was active
                if (evt.target === this && applicationCache.isTextSelecting) {
                    domEventHandlers.onMouseUpAction.call(editorElement[0], evt);
                }
            });
        },

        /**
         * Manages the display and removal of the placeholder text within the editor.
         * If the editor is empty, a placeholder paragraph is shown.
         * @param {jQuery} editorElement The main editor container.
         * @param {Object} [context={}] Additional context, e.g., if focus is being set.
         */
        handlePlaceholderText: (editorElement, context = {}) => {
            const editorContent = editorElement.text().trim();
            const hasPlaceholder = editorElement.children('.editor-placeholder-node').length > 0;

            if (editorContent.length === 0 && !hasPlaceholder) {
                editorElement.empty(); // Clear any invisible content
                const placeholderNode = coreUtilities.markupManipulation.createElementAndAppend(
                    editorElement, 'p', false, false, {
                        'class': 'editor-placeholder-node'
                    }
                );
                placeholderNode.text(editorElement.attr('data-editor-placeholder-text'));
                // Add an empty paragraph for actual content entry, make it editable
                const initialParagraph = coreUtilities.markupManipulation.createElementAndAppend(
                    editorElement, 'p', context.shouldFocus || false, true
                );
                // Place caret in the new paragraph if focusing
                if (context.shouldFocus) {
                    coreUtilities.caretPlacement.positionCaret(editorElement, 0, initialParagraph);
                }
            } else if (editorContent.length > 0 && hasPlaceholder) {
                editorElement.children('.editor-placeholder-node').remove();
            }
        },

        /**
         * Removes the placeholder element from the editor.
         * @param {jQuery} editorElement The main editor container.
         */
        removePlaceholderNode: (editorElement) => {
            editorElement.children('.editor-placeholder-node').remove();
        },

        /**
         * Preserves the focus context within the editor, tracking the currently focused
         * child element and its index. This helps in restoring cursor position.
         * @param {jQuery} editorElement The main editor container (this will be `this` in the context).
         */
        maintainEditorFocus: function() {
            const currentSelection = win.getSelection();
            if (!currentSelection || !currentSelection.anchorNode) return;

            // Find the direct contenteditable child that contains the selection
            let actualFocusedNode = currentSelection.anchorNode;
            // If it's a text node, get its parent
            if (actualFocusedNode.nodeType === Node.TEXT_NODE) {
                actualFocusedNode = actualFocusedNode.parentNode;
            }

            // Ensure the node is a direct child of the editor and is contenteditable
            const editorElement = jq(this);
            const directChild = jq(actualFocusedNode).closest(editorElement.children());

            if (directChild.length > 0 && directChild[0] !== applicationCache.focusedElementRef) {
                applicationCache.focusedElementRef = directChild[0];
                applicationCache.focusedElementIndex = editorElement.children().index(directChild);
            }
        },

        /**
         * Sets up a hidden textarea to store the editor's content, allowing easy submission or retrieval.
         * @param {jQuery} editorElement The main editor container.
         */
        setupHiddenContentArea: (editorElement) => {
            const editorId = editorElement.attr('id') || `text-composer-${jq('.text-composer-editor').length + 1}`;
            editorElement.attr('id', editorId);

            hiddenContentStorageArea = jq('<textarea>', {
                css: {
                    position: 'absolute',
                    left: '-9999px', // Off-screen
                    width: '1px',
                    height: '1px',
                    opacity: '0',
                    overflow: 'hidden'
                },
                id: `hidden-content-${editorId}`,
                name: editorElement.data('input-name') || `${editorId}-html` // Use data-input-name or default
            });

            jq(doc.body).append(hiddenContentStorageArea);
        },

        /**
         * Initializes the editor instance, setting up attributes, placeholder, and initial focus.
         * @param {jQuery} editorElement The main editor container.
         * @param {Object} configOptions The configuration options for this editor instance.
         */
        initializeEditor: (editorElement, configOptions) => {
            pluginConfiguration = jq.extend(true, {}, editorLifecycleHooks.defaultOptions, configOptions); // Deep merge options

            editorLifecycleHooks.setupHiddenContentArea(editorElement);

            editorElement.attr({
                'data-editor-mode': pluginConfiguration.mode,
                'data-editor-placeholder-text': pluginConfiguration.placeholder,
                'contenteditable': true,
                'spellcheck': pluginConfiguration.spellcheck // Add spellcheck option
            });
            editorElement.css('position', 'relative'); // Essential for toolbar positioning
            editorElement.addClass('text-composer-editor'); // Standard class for all instances

            editorLifecycleHooks.handlePlaceholderText(editorElement, {
                shouldFocus: false
            }); // Initial placeholder setup

            editorLifecycleHooks.maintainEditorFocus.call(editorElement[0]); // Initialize focus context

            if (pluginConfiguration.autoFocus === true) {
                // Find the first non-placeholder paragraph and set cursor
                const firstEditableP = editorElement.find('p:not(.editor-placeholder-node)').first();
                if (firstEditableP.length) {
                    coreUtilities.caretPlacement.positionCaret(editorElement, 0, firstEditableP);
                    firstEditableP.focus(); // Explicitly focus the paragraph
                } else {
                    editorElement.focus(); // Fallback to focusing the editor itself
                }
            }
        },
        defaultOptions: {
            mode: 'basic',
            placeholder: 'Start typing here...',
            autoFocus: false,
            spellcheck: true
        }
    };

    /*
     * The `domEventHandlers` module contains the raw, low-level event handlers
     * for various DOM events, which then delegate to higher-level logic.
     */
    const domEventHandlers = {
        /**
         * Handles the keydown event within the editor.
         * @param {Event} keyEvent The native keyboard event.
         */
        onKeyDownAction: function(keyEvent) {
            const editorElement = jq(this);
            applicationCache.isCommandPressed = coreUtilities.keyInteraction.detectCommandKey(keyEvent);
            applicationCache.isShiftPressed = coreUtilities.keyInteraction.detectShiftKey(keyEvent);

            coreUtilities.keyInteraction.handleModifierKey(keyEvent, (command) => {
                if (applicationCache.isCommandPressed) { // Only apply if command/ctrl is also pressed
                    keyEvent.preventDefault(); // Prevent default browser action for shortcuts
                    if (events.commands[command]) {
                        events.commands[command].call(editorElement, keyEvent);
                    }
                }
            });

            // Prevent empty editor: if only placeholder is left, create new paragraph on enter
            if (coreUtilities.keyInteraction.isEnterKey(keyEvent)) {
                if (editorElement.children().length === 1 && editorElement.children('.editor-placeholder-node').length === 1) {
                    keyEvent.preventDefault();
                    coreUtilities.markupManipulation.createElementAndAppend(editorElement, 'p', true, true);
                    editorLifecycleHooks.removePlaceholderNode(editorElement); // Remove placeholder after first content
                }
            }
        },

        /**
         * Handles the keyup event within the editor.
         * @param {Event} keyEvent The native keyboard event.
         */
        onKeyUpAction: function(keyEvent) {
            const editorElement = jq(this);
            applicationCache.isCommandPressed = coreUtilities.keyInteraction.detectCommandKey(keyEvent);
            applicationCache.isShiftPressed = coreUtilities.keyInteraction.detectShiftKey(keyEvent);

            // Update placeholder visibility
            editorLifecycleHooks.handlePlaceholderText(editorElement);
            editorLifecycleHooks.maintainEditorFocus.call(editorElement[0]); // Update focused element reference

            const currentSelection = win.getSelection();
            if (currentSelection && !currentSelection.isCollapsed) { // If there's a selection
                applicationCache.activeSelectionRange = coreUtilities.textSelectionManager.captureCurrentRange();
                floatingControlPanel.displayPanel.call(editorElement[0]);
            } else {
                floatingControlPanel.concealPanel.call(editorElement[0]);
            }
        },

        /**
         * Handles the focus event on the editor.
         * @param {Event} focusEvent The native focus event.
         */
        onFocusAction: function(focusEvent) {
            const editorElement = jq(this);
            editorLifecycleHooks.removePlaceholderNode(editorElement);
            editorElement.addClass('editor-focused');
        },

        /**
         * Handles the paste event, preventing default behavior and potentially cleaning content.
         * @param {Event} pasteEvent The native paste event.
         */
        onPasteAction: function(pasteEvent) {
            events.paste.call(this, pasteEvent); // Delegate to a more specific paste handler if needed
        },

        /**
         * Handles the mousedown event, initiating selection tracking.
         * @param {Event} mouseEvent The native mouse event.
         */
        onMouseDownAction: function(mouseEvent) {
            applicationCache.isTextSelecting = true;
            floatingControlPanel.concealPanel.call(this); // Hide panel on new mousedown
        },

        /**
         * Handles the mouseup event, finalizing selection and potentially displaying the toolbar.
         * @param {Event} mouseEvent The native mouse event.
         */
        onMouseUpAction: function(mouseEvent) {
            const editorElement = jq(this);
            applicationCache.isTextSelecting = false;
            applicationCache.activeSelectionRange = coreUtilities.textSelectionManager.captureCurrentRange();

            editorLifecycleHooks.maintainEditorFocus.call(editorElement[0]);

            const currentSelection = win.getSelection();
            if (currentSelection && !currentSelection.isCollapsed) { // If text is selected
                floatingControlPanel.displayPanel.call(editorElement[0]);
            } else {
                floatingControlPanel.concealPanel.call(editorElement[0]);
            }
        },

        /**
         * Handles the mousemove event, primarily for updating pointer coordinates.
         * @param {Event} mouseEvent The native mouse event.
         */
        onMouseMoveAction: function(mouseEvent) {
            currentPointerX = mouseEvent.clientX;
            currentPointerY = mouseEvent.clientY;
            // Additional logic for drag selection or live updates could go here
        },

        /**
         * Handles the blur event on the editor.
         * @param {Event} blurEvent The native blur event.
         */
        onBlurAction: function(blurEvent) {
            const editorElement = jq(this);
            editorLifecycleHooks.handlePlaceholderText(editorElement); // Re-evaluate placeholder
            editorElement.removeClass('editor-focused');
            floatingControlPanel.concealPanel.call(editorElement[0]); // Hide toolbar on blur
        }
    };

    // Integrate into jQuery prototype
    jq.fn.textComposer = function(options) {
        return this.each(function() {
            const editorInstance = jq(this);
            // Prevent re-initialization
            if (!editorInstance.data('textComposerInitialized')) {
                editorLifecycleHooks.initializeEditor(editorInstance, options);
                editorLifecycleHooks.attachEventDelegates(editorInstance);
                editorInstance.data('textComposerInitialized', true);
            }
        });
    };

    // Expose utility for manual content retrieval
    jq.fn.getTextComposerContent = function() {
        const editorElement = jq(this);
        const editorId = editorElement.attr('id');
        const hiddenArea = jq(`#hidden-content-${editorId}`);
        // Update hidden area with current HTML content
        hiddenArea.val(editorElement.html());
        return hiddenArea.val();
    };

})(jQuery, document, window);