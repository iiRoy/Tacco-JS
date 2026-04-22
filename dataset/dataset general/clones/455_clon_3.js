(function($, undefined) { // Use undefined for robustness
    // ----------------------------------------------------------------------------
    // TextMarkup! Enhanced Text Editor Module, jQuery extension
    // Version 2.0.1 (Refactored and Modernized)
    // Licensed under a permissive open-source license (e.g., MIT equivalent)
    // ----------------------------------------------------------------------------
    // This module provides a flexible framework for adding markup capabilities
    // to text areas within web applications. It supports dynamic button generation,
    // advanced text manipulation, and real-time preview functionality.
    // ----------------------------------------------------------------------------
    // (C) 2023 Development Team
    // For documentation and updates, visit project-site.com
    // ----------------------------------------------------------------------------
    // This software is provided "as is", without any express or implied warranties.
    // In no event shall the authors or copyright holders be liable for any claims,
    // damages, or other liabilities arising from the use or inability to use this software.
    // ----------------------------------------------------------------------------

    $.fn.textMarkup = function(initialConfig, supplementalConfig) {
        let editorContext, shiftActive, altActive, controlActive;
        shiftActive = altActive = controlActive = false; // Initialize key state flags

        // Default configuration for the text editor instance.
        // These settings can be overridden by user-provided configurations.
        const defaultModuleOptions = {
            instanceId:             '', // Unique identifier for the editor instance
            cssPrefix:              'tm_unit', // CSS class prefix for styling elements
            basePath:               '', // Base path for resources (e.g., images, templates)
            previewDisplayMode:     '', // Options: 'width=...,height=...', or empty for inline iframe
            autoPreviewRefresh:     true, // Automatically refresh preview on text changes
            previewInsertionPoint:  'after', // 'before' or 'after' the textarea for inline preview
            previewTemplateUri:     '~/templates/live_render.html', // Path to the preview HTML template
            parserEndpoint:         '', // URL for server-side parsing of content
            parserDataVariable:     'documentContent', // Variable name for POSTing content to parser
            resizeCapability:       true, // Enable or disable textarea resizing
            beforeTextOperation:    null, // Callback before any text insertion
            afterTextOperation:     null, // Callback after any text insertion
            keyBindings: { // Custom actions for key combinations
                onEnter:        {},
                onShiftEnter:   {},
                onCtrlEnter:    {},
                onTab:          {}
            },
            markupSchema:       [ { /* Placeholder for markup definition */ } ]
        };

        // Merge default options with user-provided configurations.
        // Supplemental config takes precedence over initial config.
        const mergedOptions = $.extend(true, {}, defaultModuleOptions, initialConfig, supplementalConfig);

        // Determine the base path for assets if not explicitly provided.
        // Scans script tags to find the module's own location.
        if (!mergedOptions.basePath) {
            $('script').each(function() {
                const scriptTagSource = $(this).attr('src');
                if (scriptTagSource) {
                    const pathMatch = scriptTagSource.match(/(.*)jquery\.textmarkup(\.min)?\.js$/);
                    if (pathMatch && pathMatch[1]) {
                        mergedOptions.basePath = pathMatch[1];
                        return false; // Exit $.each loop early
                    }
                }
            });
        }

        // Apply module to each selected textarea element.
        return this.each(function() {
            const $targetElement = $(this); // jQuery object for the textarea
            const nativeTextarea = this;    // Native DOM element for the textarea

            let currentDropLevels = []; // Tracks depth of nested dropdown menus
            let currentScrollPosition = 0;
            let currentCaretPosition = 0;
            let currentCaretOffset = -1; // Used for adjusting caret after insertion
            let activeMarkupButton = null; // Stores the button object that triggered the last action
            let operationCancelled = false; // Flag to abort markup insertion
            let headerContainer, footerContainer, livePreviewWindow, livePreviewIframe;

            // Normalize resource paths by replacing '~/' with the determined base path.
            const resolvePath = (resourcePath, isContent) => {
                if (!resourcePath) return '';
                if (isContent) { // For content that might contain paths (e.g., HTML template)
                    return resourcePath.replace(/("|')~\//g, `$1${mergedOptions.basePath}`);
                }
                return resourcePath.replace(/^~\//, mergedOptions.basePath); // For direct path strings
            };

            // Apply path localization to preview-related URLs.
            mergedOptions.parserEndpoint = resolvePath(mergedOptions.parserEndpoint);
            mergedOptions.previewTemplateUri = resolvePath(mergedOptions.previewTemplateUri);

            /**
             * Initializes the editor interface by wrapping the textarea and building the toolbar.
             */
            const initializeEditorUI = () => {
                let editorIdAttribute = '';
                let editorNamespaceClass = '';

                // Generate unique ID for the editor wrapper.
                if (mergedOptions.instanceId) {
                    editorIdAttribute = `id="${mergedOptions.instanceId}"`;
                } else if ($targetElement.attr("id")) {
                    // Derive ID from textarea's ID, e.g., "myTextarea" -> "TextMarkupMyTextarea"
                    const originalId = $targetElement.attr("id");
                    editorIdAttribute = `id="TextMarkup${originalId.charAt(0).toUpperCase()}${originalId.slice(1)}"`;
                }

                // Apply namespace class for styling.
                if (mergedOptions.cssPrefix) {
                    editorNamespaceClass = `class="${mergedOptions.cssPrefix}"`;
                }

                // Wrap the textarea with necessary container elements.
                $targetElement.wrap(`<div ${editorNamespaceClass}></div>`);
                $targetElement.wrap(`<div ${editorIdAttribute} class="${mergedOptions.cssPrefix}_wrapper"></div>`);
                $targetElement.wrap(`<div class="${mergedOptions.cssPrefix}_container"></div>`);
                $targetElement.addClass(`${mergedOptions.cssPrefix}_editor`); // Add editor-specific class to textarea

                // Create and insert the header (toolbar).
                headerContainer = $(`<div class="${mergedOptions.cssPrefix}_header"></div>`).insertBefore($targetElement);
                buildToolbar(mergedOptions.markupSchema).appendTo(headerContainer);

                // Create and insert the footer.
                footerContainer = $(`<div class="${mergedOptions.cssPrefix}_footer"></div>`).insertAfter($targetElement);

                // Add a resize handle if enabled and not on Safari (due to native resize).
                if (mergedOptions.resizeCapability === true && !/Safari/.test(navigator.userAgent)) { // Check for Safari
                    const resizeHandle = $(`<div class="${mergedOptions.cssPrefix}_resize_handle"></div>`)
                        .insertAfter($targetElement)
                        .on("mousedown", (mouseDownEvent) => {
                            const initialHeight = $targetElement.height();
                            const initialMouseY = mouseDownEvent.clientY;

                            const handleMouseMove = (mouseMoveEvent) => {
                                // Calculate new height, ensuring a minimum height of 20px.
                                $targetElement.css("height", Math.max(20, initialHeight + mouseMoveEvent.clientY - initialMouseY) + "px");
                                return false; // Prevent default drag behavior
                            };

                            const handleMouseUp = () => {
                                $("html").off("mousemove", handleMouseMove).off("mouseup", handleMouseUp);
                                return false; // Prevent default release behavior
                            };

                            $("html").on("mousemove", handleMouseMove).on("mouseup", handleMouseUp);
                        });
                    footerContainer.append(resizeHandle);
                }

                // Attach key event listeners to the textarea.
                $targetElement.on("keydown", handleKeyPress).on("keyup", handleKeyPress);

                // Custom event listener for external insertion calls.
                $targetElement.on("insertContent", (event, contentSettings) => {
                    if (contentSettings && contentSettings.target !== false) {
                        retrieveSelectionState(); // Update selection info before insertion
                    }
                    if (nativeTextarea === $.textMarkup.activeEditor) { // Ensure this editor has focus
                        applyMarkup(contentSettings);
                    }
                });

                // Track the currently focused editor instance.
                $targetElement.on("focus", () => {
                    $.textMarkup.activeEditor = nativeTextarea;
                });
            };

            /**
             * Recursively constructs the toolbar's dropdown menus from the markup schema.
             * @param {Array<Object>} schemaItems - Array of markup button definitions.
             * @returns {jQuery} - The constructed <ul> element.
             */
            const buildToolbar = (schemaItems) => {
                const menuList = $('<ul></ul>');

                // Ensure dropdowns are hidden by default, and show on hover.
                $('li:hover > ul', menuList).css('display', 'block');

                $.each(schemaItems, function(indexInSchema) {
                    const itemDefinition = this;
                    const itemLabel = itemDefinition.name || '';
                    const itemKeyHint = itemDefinition.key ? `[Ctrl+${itemDefinition.key}]` : '';
                    const itemTitle = `${itemLabel} ${itemKeyHint}`.trim();
                    const itemAccessKey = itemDefinition.key ? `accesskey="${itemDefinition.key}"` : '';

                    if (itemDefinition.separator) {
                        // Create a separator item.
                        $(`<li class="${mergedOptions.cssPrefix}_separator">${itemDefinition.separator || ''}</li>`).appendTo(menuList);
                    } else {
                        // Increment level counter for unique class naming.
                        const currentLevelIndex = currentDropLevels.length > 0 ? currentDropLevels[currentDropLevels.length - 1] : 0;
                        const uniqueClassSuffix = currentLevelIndex > 0 ? `${currentDropLevels.join('-')}-${indexInSchema + 1}` : `${indexInSchema + 1}`;

                        const anchorElement = $(`<a href="#" ${itemAccessKey} title="${itemTitle}">${itemDefinition.text || itemLabel}</a>`);

                        // Adjust styling for text-only buttons.
                        if (itemDefinition.text) {
                            anchorElement.css('background-image', 'none');
                            anchorElement.addClass('text_button');
                            if (itemDefinition.text.length < 2) {
                                anchorElement.css('text-indent', '0.4em');
                            } else {
                                anchorElement.css('text-indent', '0');
                            }
                        }

                        const listItem = $(`<li class="${mergedOptions.cssPrefix}_button ${mergedOptions.cssPrefix}_button_${uniqueClassSuffix} ${itemDefinition.className || ''}"></li>`)
                            .append(anchorElement)
                            .on("contextmenu", () => false) // Prevent native context menu
                            .on("click", () => false) // Prevent default anchor click
                            .on("mousedown", () => {
                                // Execute custom call function if defined.
                                if (itemDefinition.call && typeof itemDefinition.call === 'string') {
                                    try {
                                        // Using Function constructor for dynamic execution safely.
                                        new Function(itemDefinition.call)();
                                    } catch (e) {
                                        console.error("Error executing custom call:", e);
                                    }
                                }
                                // Defer markup application to prevent race conditions with focus/selection.
                                setTimeout(() => applyMarkup(itemDefinition), 1);
                                return false; // Prevent default mousedown
                            })
                            .on("mouseenter", function() {
                                // Show submenu on hover.
                                $('> ul', this).show();
                                // Close all submenus if user clicks anywhere outside.
                                $(document).one('click', () => {
                                    $(`ul ul`, headerContainer).hide();
                                });
                            })
                            .on("mouseleave", function() {
                                // Hide submenu when mouse leaves.
                                $('> ul', this).hide();
                            })
                            .appendTo(menuList);

                        // If the item has a nested dropMenu, recursively build it.
                        if (itemDefinition.dropMenu && itemDefinition.dropMenu.length > 0) {
                            currentDropLevels.push(indexInSchema + 1); // Add current index to path
                            listItem.addClass(`${mergedOptions.cssPrefix}_drop_menu`).append(buildToolbar(itemDefinition.dropMenu));
                            currentDropLevels.pop(); // Remove current index when done
                        }
                    }
                });
                return menuList;
            };

            /**
             * Processes special markup tokens within a string (e.g., `(!(!...!)!)`, `[![...!]!]`).
             * @param {string} inputString - The string containing markup tokens.
             * @returns {string} The processed string.
             */
            const processSpecialTokens = (inputString) => {
                if (!inputString) return '';
                let processed = String(inputString);

                // Handle conditional blocks: (!(!alt_text|!|normal_text!)!)
                // If altKey is active, use alt_text; otherwise, use normal_text.
                processed = processed.replace(/\(\!\(([\s\S]*?)\)\!\)/g, (match, content) => {
                    const parts = content.split('|!|');
                    return altActive ? (parts[1] !== undefined ? parts[1] : parts[0]) : (parts[1] === undefined ? '' : parts[0]);
                });

                // Handle prompt blocks: [![prompt_message:!:default_value!]!]
                processed = processed.replace(/\[\!\[([\s\S]*?)\]\!\]/g, (match, content) => {
                    if (operationCancelled) return ''; // If a previous prompt was cancelled, skip further prompts.
                    const promptParts = content.split(':!:');
                    const promptMessage = promptParts[0];
                    const defaultValue = promptParts[1] || '';
                    const userValue = prompt(promptMessage, defaultValue);

                    if (userValue === null) {
                        operationCancelled = true; // User cancelled the prompt.
                        return '';
                    }
                    return userValue;
                });
                return processed;
            };

            /**
             * Prepares an action (string or function) by processing special tokens.
             * @param {string|Function} actionDefinition - The action to prepare.
             * @returns {string} The prepared action string.
             */
            const prepareAction = (actionDefinition) => {
                if (typeof actionDefinition === 'function') {
                    // Call the function with the current editor context.
                    return processSpecialTokens(actionDefinition(editorContext));
                }
                return processSpecialTokens(actionDefinition);
            };

            /**
             * Constructs the text block to be inserted based on the active markup button and current selection.
             * @param {string} [currentSegment] - The text segment to wrap (if part of a multi-line operation).
             * @returns {Object} An object containing the constructed block and its components.
             */
            const buildInsertionBlock = (currentSegment) => {
                const openTag     = prepareAction(activeMarkupButton.openWith);
                const placeholder = prepareAction(activeMarkupButton.placeHolder);
                const replacement = prepareAction(activeMarkupButton.replaceWith);
                const closeTag    = prepareAction(activeMarkupButton.closeWith);

                let constructedBlock;
                if (replacement !== '') {
                    constructedBlock = openTag + replacement + closeTag;
                } else if (editorContext.selection === '' && placeholder !== '') {
                    constructedBlock = openTag + placeholder + closeTag;
                } else {
                    constructedBlock = openTag + (currentSegment || editorContext.selection) + closeTag;
                }
                return {
                    fullBlock: constructedBlock,
                    opening:   openTag,
                    replacing: replacement,
                    holding:   placeholder,
                    closing:   closeTag
                };
            };

            /**
             * Applies the selected markup to the textarea content.
             * @param {Object} buttonConfig - The configuration object for the markup button.
             */
            const applyMarkup = (buttonConfig) => {
                activeMarkupButton = buttonConfig; // Store the active button config
                retrieveSelectionState(); // Get current selection and caret position

                // Create a context object for callbacks and token processing.
                editorContext = {
                    lineNum:        "",
                    rootPath:       mergedOptions.basePath,
                    editorOptions:  mergedOptions,
                    targetElement:  nativeTextarea,
                    selection:      (editorContext.selection || ''),
                    caretPos:       currentCaretPosition,
                    isCtrlPressed:  controlActive,
                    isShiftPressed: shiftActive,
                    isAltPressed:   altActive
                };

                // Execute 'beforeTextOperation' callbacks.
                prepareAction(mergedOptions.beforeTextOperation);
                prepareAction(activeMarkupButton.beforeInsert);
                if (controlActive && shiftActive) {
                    prepareAction(activeMarkupButton.beforeMultiInsert);
                }

                let finalBlockStructure, insertionStart, insertionLength;
                let lineCounter = 1;

                if (controlActive && shiftActive) {
                    // Multi-line insertion mode (Ctrl+Shift)
                    const linesToProcess = editorContext.selection.split(/\r?\n/);
                    const processedLines = [];
                    for (let i = 0; i < linesToProcess.length; i++) {
                        if ($.trim(linesToProcess[i]) !== '') {
                            editorContext.lineNum = lineCounter++;
                            editorContext.selection = linesToProcess[i];
                            processedLines.push(buildInsertionBlock(linesToProcess[i]).fullBlock);
                        } else {
                            processedLines.push("");
                        }
                    }
                    finalBlockStructure = { fullBlock: processedLines.join('\n') };
                    insertionStart = currentCaretPosition;
                    insertionLength = finalBlockStructure.fullBlock.length;
                    // Note: Opera linefeed fix might be needed here, or if we ensure consistent newlines.
                } else if (controlActive) {
                    // Block insertion mode (Ctrl)
                    finalBlockStructure = buildInsertionBlock(editorContext.selection);
                    insertionStart = currentCaretPosition + finalBlockStructure.opening.length;
                    insertionLength = finalBlockStructure.fullBlock.length - finalBlockStructure.opening.length - finalBlockStructure.closing.length;
                    insertionLength -= compensateForNewlineBugs(finalBlockStructure.fullBlock);
                } else if (shiftActive) {
                    // Inline insertion mode (Shift)
                    finalBlockStructure = buildInsertionBlock(editorContext.selection);
                    insertionStart = currentCaretPosition;
                    insertionLength = finalBlockStructure.fullBlock.length;
                    insertionLength -= compensateForNewlineBugs(finalBlockStructure.fullBlock);
                } else {
                    // Simple insertion mode (no modifiers)
                    finalBlockStructure = buildInsertionBlock(editorContext.selection);
                    insertionStart = currentCaretPosition + finalBlockStructure.fullBlock.length;
                    insertionLength = 0;
                    insertionStart -= compensateForNewlineBugs(finalBlockStructure.fullBlock);
                }

                // Adjust caret if selection was empty and no replacement was provided.
                if (editorContext.selection === '' && finalBlockStructure.replacing === '') {
                    currentCaretOffset += compensateForNewlineBugs(finalBlockStructure.fullBlock);
                    insertionStart = currentCaretPosition + finalBlockStructure.opening.length;
                    insertionLength = finalBlockStructure.fullBlock.length - finalBlockStructure.opening.length - finalBlockStructure.closing.length;
                    currentCaretOffset = $targetElement.val().substring(currentCaretPosition, $targetElement.val().length).length;
                    currentCaretOffset -= compensateForNewlineBugs($targetElement.val().substring(0, currentCaretPosition));
                }

                $.extend(editorContext, { caretPos: currentCaretPosition, scrollPos: currentScrollPosition });

                // Perform the insertion only if content changed and not cancelled.
                if (finalBlockStructure.fullBlock !== editorContext.selection && operationCancelled === false) {
                    performTextInsertion(finalBlockStructure.fullBlock);
                    setSelectionRange(insertionStart, insertionLength);
                } else {
                    currentCaretOffset = -1; // Reset offset if no insertion
                }
                retrieveSelectionState(); // Update context after insertion

                $.extend(editorContext, { lineNum: '', selection: editorContext.selection });

                // Execute 'afterTextOperation' callbacks.
                if (controlActive && shiftActive) {
                    prepareAction(activeMarkupButton.afterMultiInsert);
                }
                prepareAction(activeMarkupButton.afterInsert);
                prepareAction(mergedOptions.afterTextOperation);

                // Refresh the preview if it's open and auto-refresh is enabled.
                if (livePreviewWindow && mergedOptions.autoPreviewRefresh) {
                    updatePreviewContent();
                }

                // Reset key states and cancellation flag.
                shiftActive = altActive = controlActive = operationCancelled = false;
            };

            /**
             * Compensates for newline character handling differences across browsers.
             * Specifically for IE (CRLF) vs. others (LF).
             * @param {string} textChunk - The text segment to analyze.
             * @returns {number} The difference in character count due to newline representation.
             */
            const compensateForNewlineBugs = (textChunk) => {
                if (navigator.userAgent.match(/MSIE|Trident/)) { // Detect IE/Edge (Trident)
                    return textChunk.length - textChunk.replace(/\r*/g, '').length;
                }
                // Opera historically had issues, but modern Opera (Chromium-based) behaves like Webkit.
                // This check is for older Opera versions if support is needed.
                // if ($.browser.opera) {
                //     return textChunk.length - textChunk.replace(/\n*/g, '').length;
                // }
                return 0;
            };

            /**
             * Inserts the given block of text into the textarea at the current selection/caret position.
             * @param {string} blockContent - The text to insert.
             */
            const performTextInsertion = (blockContent) => {
                if (document.selection) { // IE-specific text range handling
                    const activeRange = document.selection.createRange();
                    activeRange.text = blockContent;
                } else { // Modern browser (Gecko/WebKit) selection handling
                    const currentValue = $targetElement.val();
                    $targetElement.val(currentValue.substring(0, currentCaretPosition) +
                                      blockContent +
                                      currentValue.substring(currentCaretPosition + editorContext.selection.length, currentValue.length));
                }
            };

            /**
             * Sets the selection range within the textarea.
             * @param {number} startPos - The starting position of the selection.
             * @param {number} length - The length of the selection.
             */
            const setSelectionRange = (startPos, length) => {
                if (nativeTextarea.createTextRange) { // IE-specific method
                    // Quick fix for Opera 9.5 (if still needed) where 0-length selection fails.
                    // if ($.browser.opera && $.browser.version >= 9.5 && length === 0) {
                    //     return;
                    // }
                    const textRange = nativeTextarea.createTextRange();
                    textRange.collapse(true);
                    textRange.moveStart('character', startPos);
                    textRange.moveEnd('character', length);
                    textRange.select();
                } else if (nativeTextarea.setSelectionRange) { // Modern browser method
                    nativeTextarea.setSelectionRange(startPos, startPos + length);
                }
                nativeTextarea.scrollTop = currentScrollPosition; // Restore scroll position
                nativeTextarea.focus(); // Ensure textarea is focused
            };

            /**
             * Retrieves the current selection and caret position from the textarea.
             * Updates `editorContext.selection`, `currentCaretPosition`, and `currentScrollPosition`.
             */
            const retrieveSelectionState = () => {
                nativeTextarea.focus();
                currentScrollPosition = nativeTextarea.scrollTop;

                if (document.selection) { // IE-specific
                    editorContext.selection = document.selection.createRange().text;
                    if (navigator.userAgent.match(/MSIE|Trident/)) {
                        const selectionRange = document.selection.createRange();
                        const fullRange = nativeTextarea.createTextRange();
                        fullRange.moveToElementText(nativeTextarea);
                        fullRange.setEndPoint('EndToStart', selectionRange);
                        currentCaretPosition = fullRange.text.length; // More accurate caret position in IE
                    } else { // Older Opera (pre-Chromium) via document.selection
                        currentCaretPosition = nativeTextarea.selectionStart; // Fallback for some non-IE
                    }
                } else { // Modern browsers (Gecko/WebKit/Chromium)
                    currentCaretPosition = nativeTextarea.selectionStart;
                    editorContext.selection = $targetElement.val().substring(currentCaretPosition, nativeTextarea.selectionEnd);
                }
            };

            /**
             * Manages the preview window/iframe lifecycle (open, close, toggle).
             */
            const togglePreview = () => {
                // If preview is not open or was closed, open it.
                if (!livePreviewWindow || livePreviewWindow.closed) {
                    if (mergedOptions.previewDisplayMode) {
                        // Open in a new popup window.
                        livePreviewWindow = window.open('', 'textmarkup_preview', mergedOptions.previewDisplayMode);
                    } else {
                        // Open in an inline iframe.
                        livePreviewIframe = $(`<iframe class="${mergedOptions.cssPrefix}_preview_frame"></iframe>`);
                        if (mergedOptions.previewInsertionPoint === 'after') {
                            livePreviewIframe.insertAfter(footerContainer);
                        } else {
                            livePreviewIframe.insertBefore(headerContainer);
                        }
                        // Get the contentWindow of the iframe for cross-browser compatibility.
                        livePreviewWindow = livePreviewIframe[0].contentWindow || livePreviewIframe[0];
                    }
                } else if (altActive) {
                    // If Alt key is pressed, close the preview.
                    if (livePreviewIframe) {
                        livePreviewIframe.remove();
                    } else {
                        livePreviewWindow.close();
                    }
                    livePreviewWindow = livePreviewIframe = null; // Reset references
                }

                // If not auto-refreshing, manually refresh on open/toggle.
                if (!mergedOptions.autoPreviewRefresh && livePreviewWindow) {
                    updatePreviewContent();
                }
            };

            /**
             * Triggers a refresh of the preview content.
             */
            const updatePreviewContent = () => {
                generatePreviewHTML(); // Delegate to the rendering function.
            };

            /**
             * Generates the HTML content for the preview.
             * Can either use a parser endpoint or a local template.
             * @returns {boolean} False to prevent default event actions.
             */
            const generatePreviewHTML = () => {
                if (!livePreviewWindow) { // Guard clause: No preview window open.
                    return false;
                }

                // If a server-side parser is configured.
                if (mergedOptions.parserEndpoint) {
                    $.ajax({
                        type: 'POST',
                        url: mergedOptions.parserEndpoint,
                        data: `${mergedOptions.parserDataVariable}=${encodeURIComponent($targetElement.val())}`,
                        success: (parsedData) => {
                            injectContentIntoPreview(resolvePath(parsedData, true));
                        },
                        error: (xhr, status, error) => {
                            console.error("Preview parser error:", status, error);
                            injectContentIntoPreview(`<h1>Error Loading Preview</h1><p>Could not load content from parser: ${status} - ${error}</p>`);
                        }
                    });
                } else {
                    // Use local template if no parser endpoint.
                    $.ajax({
                        url: mergedOptions.previewTemplateUri,
                        success: (templateData) => {
                            // Replace placeholder in template with current textarea content.
                            const finalHtml = resolvePath(templateData, true).replace(/<!-- content -->/g, $targetElement.val());
                            injectContentIntoPreview(finalHtml);
                        },
                        error: (xhr, status, error) => {
                            console.error("Preview template error:", status, error);
                            injectContentIntoPreview(`<h1>Error Loading Template</h1><p>Could not load template: ${status} - ${error}</p>`);
                        }
                    });
                }
                return false;
            };

            /**
             * Writes the given HTML content into the preview window/iframe.
             * @param {string} htmlContent - The HTML string to write.
             */
            const injectContentIntoPreview = (htmlContent) => {
                if (livePreviewWindow && livePreviewWindow.document) {
                    let savedScrollPos = 0;
                    try {
                        // Attempt to preserve scroll position in preview.
                        savedScrollPos = livePreviewWindow.document.documentElement.scrollTop;
                    } catch (e) {
                        // Cross-origin issues might prevent access.
                        console.warn("Could not access preview window scroll position:", e);
                    }

                    livePreviewWindow.document.open();
                    livePreviewWindow.document.write(htmlContent);
                    livePreviewWindow.document.close();
                    if (savedScrollPos > 0) {
                        livePreviewWindow.document.documentElement.scrollTop = savedScrollPos;
                    }
                }
                if (mergedOptions.previewDisplayMode) {
                    livePreviewWindow.focus(); // Bring popup window to front.
                }
            };

            /**
             * Handles keydown and keyup events to track modifier key states.
             * @param {Event} event - The keyboard event object.
             */
            const handleKeyPress = (event) => {
                shiftActive = event.shiftKey;
                altActive = event.altKey;
                controlActive = event.ctrlKey || event.metaKey; // Support Cmd key on Mac

                // Potentially add logic here for handling specific key combinations
                // defined in mergedOptions.keyBindings (e.g., Tab, Enter variants).
                // This would involve preventing default behavior and calling `applyMarkup`
                // with a special button config for the key binding.
            };

            // Initial editor setup.
            initializeEditorUI();
        });
    };

    // Store the currently focused editor instance globally.
    $.textMarkup = {
        activeEditor: null
    };

})(jQuery);