let EDITOR_UTILITIES = {};

(function($) {

    /**
     * Integrates the ContentComposer into jQuery's prototype chain.
     * Allows initializing the rich text editor on selected textareas.
     * @param {object} userConfiguration - Custom settings for the editor instance.
     * @returns {jQuery} The jQuery object for chaining.
     */
    $.fn.contentComposer = function(userConfiguration) {
        return this.each(function() {
            const currentElement = $(this);
            let editorInstance = currentElement.data('contentComposer');

            // If an editor instance doesn't exist, create and store one.
            if (!editorInstance) {
                editorInstance = new ContentComposer(this, userConfiguration);
                currentElement.data('contentComposer', editorInstance);
            }
        });
    };

    /**
     * Main ContentComposer class for rich text editing capabilities.
     * Manages UI, content, and interactions for the editor.
     * @param {HTMLElement} domElement - The original textarea DOM element.
     * @param {object} initialSettings - Configuration settings for this editor instance.
     */
    const ContentComposer = function(domElement, initialSettings) {
        // Reference to the host textarea element wrapped in jQuery.
        this.hostElement = $(domElement);

        // Merge default settings with user-provided and data-attributes.
        this.configuration = $.extend(true, {
            languageCode: 'en',
            toolbarPreset: 'default', // e.g., 'default', 'basic'

            deferAssetLoading: true, // If true, assets (langs, toolbars) are loaded dynamically.
            assetBasePath: false, // Base path for loading assets.
            editorStylesheet: 'style.css', // CSS file for iframe content.
            autoFocusOnLoad: true,
            enableResizing: true, // User can resize editor.
            autoHeightAdjustment: false, // Editor height adjusts automatically to content.
            stickyToolbar: false, // Toolbar sticks to top on scroll.

            applyAutoFormatting: true, // Automatically format newlines to paragraphs.
            performPasteCleanup: true, // Clean up pasted content.
            convertDivsToParagraphs: true, // Convert divs to p tags on paste.
            stripClassesOnPaste: true, // Remove classes from pasted content.
            stripStylesOnPaste: false, // Remove inline styles from pasted content.
            autoLinkDetection: true, // Convert plain text URLs to clickable links.

            serverSyncEndpoint: false, // URL for server-side content processing.
            autoSaveEndpoint: false, // URL for automatic content saving.
            autoSaveIntervalSec: 60, // Interval for autosave in seconds.

            imageGalleryEndpoint: false, // URL to fetch image list (e.g., /api/images.json).
            imageUploadEndpoint: false, // URL for image file uploads.
            linkUploadEndpoint: false, // URL for link file uploads.
            genericFileUploadEndpoint: false, // URL for general file uploads.

            isVisualModeActive: true, // Current editor mode (visual/code).
            startInFullscreen: false, // Editor starts in fullscreen mode.
            useModalOverlay: true, // Use a modal overlay for popups.

            colorPalette: [
                '#ffffff', '#000000', '#eeece1', '#1f497d', '#4f81bd', '#c0504d', '#9bbb59', '#8064a2', '#4bacc6', '#f79646', '#ffff00',
                '#f2f2f2', '#7f7f7f', '#ddd9c3', '#c6d9f0', '#dbe5f1', '#f2dcdb', '#ebf1dd', '#e5e0ec', '#dbeef3', '#fdeada', '#fff2ca',
                '#d8d8d8', '#595959', '#c4bd97', '#8db3e2', '#b8cce4', '#e5b9b7', '#d7e3bc', '#ccc1d9', '#b7dde8', '#fbd5b5', '#ffe694',
                '#bfbfbf', '#3f3f3f', '#938953', '#548dd4', '#95b3d7', '#d99694', '#c3d69b', '#b2a2c7', '#b7dde8', '#fac08f', '#f2c314',
                '#a5a5a5', '#262626', '#494429', '#17365d', '#366092', '#953734', '#76923c', '#5f497a', '#92cddc', '#e36c09', '#c09100',
                '#7f7f7f', '#0c0c0c', '#1d1b10', '#0f243e', '#244061', '#632423', '#4f6128', '#3f3151', '#31859b', '#974806', '#7f6000'
            ],

            // Internal default HTML structures
            defaultEmptyHtml: '<p><br /></p>',
            mozillaEmptyParagraph: '<p>&nbsp;</p>' // Special handling for Mozilla.

        }, initialSettings, this.hostElement.data()); // Data attributes on the element override options.

        this.activeDropdowns = []; // Stores references to active dropdown UI elements.
        this.isInitialized = false; // Flag to indicate editor readiness.

        // Kick off the editor initialization process.
        this.initialize();
    };

    /**
     * Prototype methods for ContentComposer.
     */
    ContentComposer.prototype = {

        /**
         * Dynamically injects a script tag into the document head.
         * @param {string} scriptUrl - The URL of the script to load.
         * @param {function} [callback] - Function to execute once the script is loaded.
         */
        injectScriptTag: function(scriptUrl, callback) {
            const headElement = document.head || document.getElementsByTagName("head")[0];
            if (!headElement) {
                console.error("ContentComposer: Could not find document head to inject script.");
                if (callback) callback(new Error("No head element"));
                return;
            }

            const scriptElement = document.createElement("script");
            scriptElement.src = scriptUrl;
            scriptElement.async = true; // Non-blocking script loading.

            let scriptLoaded = false;

            // Handle script load events for various browsers.
            scriptElement.onload = scriptElement.onreadystatechange = () => {
                if (!scriptLoaded && (!this.readyState || this.readyState === "loaded" || this.readyState === "complete")) {
                    scriptLoaded = true;
                    if (callback) callback();
                    // Clean up event handlers to prevent memory leaks.
                    scriptElement.onload = scriptElement.onreadystatechange = null;
                }
            };

            // Append the script to the head.
            headElement.appendChild(scriptElement);
        },

        /**
         * Processes a single asset from the queue and loads the next.
         * @param {string|function} currentAsset - The current asset URL or callback function.
         * @param {Array<string|function>} remainingAssets - The rest of the assets to load.
         * @private
         */
        _processPendingAsset: function(currentAsset, remainingAssets) {
            // If the current asset is a function, execute it.
            if (typeof currentAsset === 'function') {
                currentAsset.call(this);
                // If there are more assets, process the next one.
                if (remainingAssets.length > 0) {
                    this._processPendingAsset(remainingAssets.shift(), remainingAssets);
                }
                return;
            }

            // If it's a URL, inject the script.
            this.injectScriptTag(currentAsset, () => {
                // Once loaded, if there are more assets, process the next one.
                if (remainingAssets.length > 0) {
                    this._processPendingAsset(remainingAssets.shift(), remainingAssets);
                }
            });
        },

        /**
         * Initiates sequential loading of an array of assets (scripts or functions).
         * @param {Array<string|function>} assetQueue - An array of asset URLs or functions.
         */
        loadRequiredAssets: function(assetQueue) {
            if (!Array.isArray(assetQueue) || assetQueue.length === 0) {
                console.warn("ContentComposer: No assets provided for loading or invalid queue.");
                return;
            }
            // Start processing the queue.
            this._processPendingAsset(assetQueue.shift(), assetQueue);
        },

        /**
         * Main initialization routine for the editor.
         */
        initialize: function() {
            this.determineAssetPath(); // Ensure asset path is known.

            if (this.configuration.deferAssetLoading) {
                // Prepare a queue of assets to load dynamically.
                const assetQueue = [];

                assetQueue.push(`${this.configuration.assetBasePath}/langs/${this.configuration.languageCode}.js`);
                if (this.configuration.toolbarPreset !== false) {
                    assetQueue.push(`${this.configuration.assetBasePath}/toolbars/${this.configuration.toolbarPreset}.js`);
                }
                // The actual editor startup is the last item in the queue.
                assetQueue.push(this.startEditor);

                this.loadRequiredAssets(assetQueue);
            } else {
                // If assets are not deferred, start the editor immediately.
                this.startEditor();
            }
        },

        /**
         * The core startup logic after assets are loaded.
         * Sets up the editor UI, content, and event listeners.
         */
        startEditor: function() {
            if (this.isInitialized) {
                console.warn("ContentComposer: Editor already initialized.");
                return;
            }

            // Cache initial dimensions of the host textarea.
            this.cachedHeight = this.hostElement.css('height');
            this.cachedWidth = this.hostElement.css('width');

            this.constructEditorUI(); // Build the iframe and wrapper.

            // Retrieve initial content from the host textarea.
            let initialMarkup = this.hostElement.val();

            initialMarkup = this.preprocessMarkup(initialMarkup);

            // Apply auto-formatting if enabled (e.g., newlines to paragraphs).
            if (this.configuration.applyAutoFormatting) {
                initialMarkup = this.ensureParagraphFormatting(initialMarkup);
            }

            // Enable content editing within the iframe.
            this.editableContentDiv = this.enableContentEditing(initialMarkup);
            if (!this.editableContentDiv) {
                console.error("ContentComposer: Failed to activate content editing.");
                return;
            }

            // Bind global events to the iframe document.
            this._setupEventListeners();

            this.constructToolbar(); // Create and append the editor toolbar.

            // Setup resizing capabilities.
            if (!this.configuration.autoHeightAdjustment) {
                this.createResizingHandle();
            } else {
                this.setupAutomaticResizing();
            }

            this.registerKeyBindings(); // Register keyboard shortcuts.
            this.enableAutoSaveFeature(); // Start autosave if configured.
            this.monitorImagesForResizing(); // Make images resizable.

            // Handle fullscreen mode if specified in configuration.
            if (this.configuration.startInFullscreen) {
                this.configuration.startInFullscreen = false; // Reset to prevent re-entry.
                this.toggleFullscreenMode();
            }

            // Set initial focus if configured.
            if (this.configuration.autoFocusOnLoad) {
                this.setEditorFocus();
            }

            // Setup sticky toolbar if enabled.
            if (this.configuration.stickyToolbar) {
                $(document).on('scroll.contentComposer', $.proxy(this.handleStickyToolbar, this));
                this.handleStickyToolbar(); // Initial check.
            }

            this.isInitialized = true;
            // Optionally, trigger a custom event indicating editor is ready.
            this.hostElement.trigger('contentComposer.ready');
        },

        /**
         * Sets up common event listeners for the iframe document.
         * @private
         */
        _setupEventListeners: function() {
            // Ensure editor focus when clicking anywhere in the iframe.
            $(this.iframeDocument).on('click.contentComposer', $.proxy(function(e) {
                this.setEditorFocus();
            }, this));

            // Handle paste events for cleanup.
            $(this.iframeDocument).on('paste.contentComposer', $.proxy(function(e) {
                // Defer cleanup to allow browser to insert content first.
                setTimeout($.proxy(function() {
                    const pasteMarker = $('<span id="paste-cleanup-marker">&nbsp;</span>');
                    this.insertDOMNodeAtCaret(pasteMarker.get(0));
                    this.cleanPastedContent();
                }, this), 100); // Shorter timeout might be sufficient.
            }, this));

            // Handle keydown for shortcuts.
            $(this.iframeDocument).on('keydown.contentComposer', $.proxy(this.registerKeyBindings, this));

            // Handle keyup for formatting and content synchronization.
            $(this.iframeDocument).on('keyup.contentComposer', $.proxy(function(e) {
                const key = e.keyCode || e.which;

                // Specific handling for Safari Shift + Enter behavior.
                if (navigator.userAgent.includes('AppleWebKit')) {
                    this.handleSafariShiftEnter(e, key);
                }

                if (this.configuration.applyAutoFormatting) {
                    // Normalize empty content (e.g., delete all to <p><br/></p>).
                    if (key === 8 || key === 46) { // Backspace or Delete
                        this.normalizeEmptyContent(e);
                    }

                    // Format new line on Enter key.
                    if (key === 13 && !e.shiftKey && !e.ctrlKey && !e.metaKey) {
                        this.handleNewlineFormatting(e);
                    }
                }
                // Debounce content synchronization to avoid excessive updates.
                this._debouncedUpdateSourceTextarea();

            }, this));
        },

        /**
         * Registers editor-wide keyboard shortcuts.
         */
        registerKeyBindings: function(event) {
            if (!event) return; // Only process if an event is provided.

            const key = event.keyCode || event.which;
            const isCtrl = event.ctrlKey || event.metaKey; // MetaKey for Mac Cmd.

            if (isCtrl) {
                switch (key) {
                    case 90: // Ctrl + Z (Undo)
                        if (event.shiftKey) {
                            this._executeBoundCommand(event, 'redo'); // Ctrl + Shift + Z (Redo)
                        } else {
                            this._executeBoundCommand(event, 'undo');
                        }
                        break;
                    case 77: // Ctrl + M (Remove Format)
                        this._executeBoundCommand(event, 'removeFormat');
                        break;
                    case 66: // Ctrl + B (Bold)
                        this._executeBoundCommand(event, 'bold');
                        break;
                    case 73: // Ctrl + I (Italic)
                        this._executeBoundCommand(event, 'italic');
                        break;
                    case 74: // Ctrl + J (Unordered List)
                        this._executeBoundCommand(event, 'insertunorderedlist');
                        break;
                    case 75: // Ctrl + K (Ordered List)
                        this._executeBoundCommand(event, 'insertorderedlist');
                        break;
                    case 76: // Ctrl + L (Superscript) - NOTE: Redactor uses L for superscript, common is + for link.
                        this._executeBoundCommand(event, 'superscript');
                        break;
                }
            } else if (key === 9) { // Tab key
                if (event.shiftKey) {
                    this._executeBoundCommand(event, 'outdent'); // Shift + Tab (Outdent)
                } else {
                    this._executeBoundCommand(event, 'indent'); // Tab (Indent)
                }
            }
        },

        /**
         * Executes a rich text command based on a keyboard shortcut.
         * @param {Event} keyEvent - The keyboard event object.
         * @param {string} commandName - The name of the `execCommand` to execute.
         * @private
         */
        _executeBoundCommand: function(keyEvent, commandName) {
            if (keyEvent.preventDefault) {
                keyEvent.preventDefault();
            }
            this.executeEditCommand(commandName, null);
        },

        /**
         * Determines the base path for editor assets (scripts, CSS).
         * Prioritizes configured `assetBasePath` or attempts to infer from script tag.
         */
        determineAssetPath: function() {
            // If path is explicitly set, use it.
            if (this.configuration.assetBasePath !== false) return;

            // Otherwise, try to infer from script tag source.
            $('script').each($.proxy(function(idx, scriptTag) {
                if (scriptTag.src) {
                    // Regex to find 'content-composer.js' or 'content-composer.min.js'
                    const pathRegex = /content-composer(\.min)?\.js(\?.*)?$/;
                    if (scriptTag.src.match(pathRegex)) {
                        this.configuration.assetBasePath = scriptTag.src.replace(pathRegex, '');
                        return false; // Break from $.each loop.
                    }
                }
            }, this));

            if (!this.configuration.assetBasePath) {
                console.warn("ContentComposer: Could not determine assetBasePath. Please set it manually.");
            }
        },

        /**
         * Constructs the editor's main UI elements: wrapper div, iframe, and hides the original textarea.
         */
        constructEditorUI: function() {
            // Create a wrapper div for the editor.
            this.mainWrapperDiv = $('<div class="cc_wrapper_div"></div>');

            // Create the iframe for content editing.
            this.editorIframe = $(`<iframe frameborder="0" scrolling="auto" style="height: ${this.cachedHeight};" class="cc_editor_frame"></iframe>`);

            // Hide the original textarea and set its width.
            this.hostElement.css('width', '100%').hide();

            // Insert the wrapper, then append the iframe and the hidden textarea.
            this.mainWrapperDiv.insertAfter(this.hostElement).append(this.editorIframe).append(this.hostElement);
        },

        /**
         * Writes the provided HTML content into the iframe's document.
         * @param {string} htmlContent - The HTML string to write.
         */
        writeIframeContent: function(htmlContent) {
            if (!this.iframeDocument) {
                console.error("ContentComposer: Iframe document not available for writing.");
                return;
            }
            this.iframeDocument.open();
            this.iframeDocument.write(htmlContent);
            this.iframeDocument.close();
        },

        /**
         * Enables content editing for the iframe, returning the editable div.
         * @param {string} initialHtml - The HTML content to load into the editor.
         * @returns {jQuery|boolean} The jQuery object of the editable div, or false if failed.
         */
        enableContentEditing: function(initialHtml) {
            this.iframeDocument = this.retrieveIframeDocumentObject(this.editorIframe.get(0));

            if (this.iframeDocument !== null) {
                this.writeIframeContent(this.generateIframeMarkup(initialHtml));

                // Special handling for Mozilla to enable rich text editing.
                if ($.browser && $.browser.mozilla) {
                    try {
                        this.iframeDocument.execCommand("useCSS", false, true);
                    } catch (e) {
                        console.warn("ContentComposer: Failed to execCommand 'useCSS' for Mozilla.", e);
                    }
                }
                return $(this.iframeDocument).find('#editable-content-area');
            } else {
                console.error("ContentComposer: Could not retrieve iframe document object.");
                return false;
            }
        },

        /**
         * Generates the complete HTML structure for the iframe's document.
         * @param {string} contentHtml - The HTML content to place inside the editable area.
         * @returns {string} The full HTML string for the iframe.
         */
        generateIframeMarkup: function(contentHtml) {
            let frameHtml = '<!DOCTYPE html>\n';
            frameHtml += '<html><head>';
            // Link editor's stylesheet.
            frameHtml += `<link media="all" type="text/css" href="${this.configuration.assetBasePath}/css/${this.configuration.editorStylesheet}" rel="stylesheet">`;
            frameHtml += '</head>';
            frameHtml += '<body><div id="editable-content-area" contenteditable="true">';
            frameHtml += contentHtml;
            frameHtml += '</div></body></html>';
            return frameHtml;
        },

        /**
         * Retrieves the document object of an iframe.
         * @param {HTMLIFrameElement} iframeElement - The iframe DOM element.
         * @returns {Document|null} The iframe's document object, or null if not accessible.
         */
        retrieveIframeDocumentObject: function(iframeElement) {
            if (iframeElement.contentDocument) return iframeElement.contentDocument;
            if (iframeElement.contentWindow && iframeElement.contentWindow.document) return iframeElement.contentWindow.document;
            if (iframeElement.document) return iframeElement.document; // For older IE versions.
            return null;
        },

        /**
         * Sets focus on the editable content area within the iframe.
         */
        setEditorFocus: function() {
            if (this.editableContentDiv && this.editableContentDiv.length) {
                this.editableContentDiv.focus();
            }
        },

        /**
         * Synchronizes the content from the iframe editor back to the original textarea.
         * Applies post-processing to the HTML.
         */
        updateSourceTextarea: function() {
            if (!this.editableContentDiv) return;

            const currentHtml = this.editableContentDiv.html();
            const processedHtml = this.postprocessMarkup(currentHtml);
            this.hostElement.val(processedHtml);
            this.hostElement.trigger('contentComposer.change', [processedHtml]); // Custom change event.
        },

        /**
         * Debounced version of `updateSourceTextarea` to limit update frequency.
         * @private
         */
        _debouncedUpdateSourceTextarea: function() {
            clearTimeout(this._syncTimeout);
            this._syncTimeout = setTimeout(() => {
                this.updateSourceTextarea();
            }, 250); // Adjust debounce delay as needed.
        },

        // --- API Functions ---

        /**
         * Sets the editor's content with new HTML.
         * @param {string} newHtml - The HTML string to set.
         */
        setContentMarkup: function(newHtml) {
            if (!this.editableContentDiv) {
                console.warn("ContentComposer: Editor not ready to set content.");
                return;
            }
            const processedHtml = this.preprocessMarkup(newHtml);
            this.editableContentDiv.html(processedHtml);
            this.setEditorFocus();
            this.updateSourceTextarea();
        },

        /**
         * Retrieves the current HTML content from the editor, applying post-processing.
         * @returns {string} The processed HTML content.
         */
        getSourceMarkup: function() {
            let currentHtml = this.editableContentDiv ? this.editableContentDiv.html() : this.hostElement.val();
            return this.postprocessMarkup(currentHtml);
        },

        /**
         * Inserts an HTML fragment at the current caret position in the editor.
         * @param {string} htmlFragment - The HTML string to insert.
         */
        insertHtmlFragment: function(htmlFragment) {
            this.executeEditCommand('inserthtml', htmlFragment);
        },

        /**
         * Completely removes the editor instance, restoring the original textarea.
         */
        teardownEditor: function() {
            // Retrieve final content before destroying.
            const finalHtml = this.getSourceMarkup();

            // Restore the original textarea.
            this.mainWrapperDiv.after(this.hostElement);
            this.mainWrapperDiv.remove();
            this.hostElement.val(finalHtml).show();

            // Clean up event listeners and dropdowns.
            this._cleanupOnDestroy();

            // Clear stored data.
            this.hostElement.removeData('contentComposer');

            this.isInitialized = false;
            this.hostElement.trigger('contentComposer.destroyed');
        },

        /**
         * Cleans up event listeners and UI elements when the editor is destroyed.
         * @private
         */
        _cleanupOnDestroy: function() {
            // Remove iframe document event listeners.
            if (this.iframeDocument) {
                $(this.iframeDocument).off('.contentComposer');
            }
            // Remove document scroll listener if present.
            $(document).off('scroll.contentComposer');

            // Remove all dropdowns created by this instance.
            this.activeDropdowns.forEach(dropdown => {
                if (dropdown && dropdown.remove) {
                    dropdown.remove();
                }
            });
            this.activeDropdowns = [];

            // Clear any timeouts/intervals.
            clearTimeout(this._syncTimeout);
            clearInterval(this._autoSaveInterval);
            // Optionally, remove toolbar and resizer elements if they are not child of mainWrapperDiv
            if (this.toolbarElement) this.toolbarElement.remove();
            if (this.resizerHandle) this.resizerHandle.remove();
        },

        /**
         * Sends the current editor content to a server endpoint for processing.
         */
        sendToServer: function() {
            if (!this.configuration.serverSyncEndpoint) {
                console.warn("ContentComposer: Server sync endpoint not configured.");
                return;
            }

            const currentContent = this.getSourceMarkup();
            $.ajax({
                url: this.configuration.serverSyncEndpoint,
                type: 'post',
                data: JSON.stringify({ content: currentContent }), // Send as JSON.
                contentType: 'application/json; charset=utf-8',
                dataType: 'json',
                success: $.proxy(function(response) {
                    if (response && response.data) {
                        this.setContentMarkup(response.data);
                    } else {
                        console.warn("ContentComposer: Server sync response had no 'data' field.");
                    }
                    this.updateSourceTextarea();
                }, this),
                error: function(xhr, status, error) {
                    console.error("ContentComposer: Server sync failed:", status, error, xhr.responseText);
                }
            });
        },

        // --- Observers and Utilities ---

        /**
         * Makes images within the editor resizable by the user.
         */
        monitorImagesForResizing: function() {
            // Disable default object resizing for Mozilla to use custom resizing.
            if ($.browser && $.browser.mozilla) {
                try {
                    this.iframeDocument.execCommand("enableObjectResizing", false, "false");
                } catch (e) {
                    console.warn("ContentComposer: Failed to execCommand 'enableObjectResizing' for Mozilla.", e);
                }
            }

            $(this.iframeDocument).find('img').attr('unselectable', 'on').each($.proxy(function(idx, imgElement) {
                // Implement custom image resizing logic here if needed,
                // or just ensure they are selectable.
                // Original Redactor had a resizeImage(s) method, which is not included here.
                // For now, simply making them unselectable is the extent of this method.
            }, this));
        },

        /**
         * Handles the toolbar becoming sticky/fixed on scroll.
         */
        handleStickyToolbar: function() {
            if (!this.toolbarElement) return;

            const scrollPosition = $(document).scrollTop();
            const wrapperTop = this.mainWrapperDiv.offset().top;

            if (scrollPosition > wrapperTop) {
                if (!this.isToolbarFixed) {
                    this.isToolbarFixed = true;
                    this.toolbarElement.css({
                        position: 'fixed',
                        width: this.mainWrapperDiv.width(), // Match parent width.
                        top: 0,
                        zIndex: 1000 // Ensure toolbar stays on top.
                    });
                    this.mainWrapperDiv.css('padding-top', this.toolbarElement.outerHeight()); // Prevent content jump.
                }
            } else {
                if (this.isToolbarFixed) {
                    this.isToolbarFixed = false;
                    this.toolbarElement.css({
                        position: 'relative',
                        width: 'auto',
                        top: 'auto',
                        zIndex: 'auto'
                    });
                    this.mainWrapperDiv.css('padding-top', 0);
                }
            }
        },

        /**
         * Sets up automatic height adjustment for the iframe.
         */
        setupAutomaticResizing: function() {
            if (!this.editableContentDiv) return;

            // Set min-height for the editable area and overflow for the iframe.
            this.editableContentDiv.css({ 'min-height': this.hostElement.height() + 'px' });
            this.editorIframe.css({ 'overflow-x': 'hidden', 'overflow-y': 'hidden' });

            // Adjust height on iframe load and content changes.
            this.editorIframe.on('load.contentComposer', $.proxy(this.adjustFrameDimensions, this));
            $(this.iframeDocument).on('keyup.contentComposer input.contentComposer', $.proxy(this.adjustFrameDimensions, this));

            // Initial adjustment.
            this.adjustFrameDimensions();
        },

        /**
         * Adjusts the iframe's height to fit its content.
         */
        adjustFrameDimensions: function() {
            if (!this.editableContentDiv) return;

            // Add a small buffer (e.g., 30px) to prevent scrollbars from appearing prematurely.
            const contentHeight = this.editableContentDiv.outerHeight(true) + 30;
            this.editorIframe.height(contentHeight);
        },

        /**
         * Executes a rich text editing command on the iframe's document.
         * @param {string} command - The name of the command (e.g., 'bold', 'inserthtml').
         * @param {*} [value] - The value for the command (e.g., HTML string, block tag).
         */
        executeEditCommand: function(command, value) {
            if (!this.configuration.isVisualModeActive || !this.iframeDocument) {
                console.warn("ContentComposer: Editor not in visual mode or iframe document not ready. Cannot execute command:", command);
                return;
            }

            try {
                // Ensure focus before executing command, especially for IE.
                if ($.browser && $.browser.msie) {
                    this.setEditorFocus();
                }

                if (command === 'inserthtml' && $.browser && $.browser.msie) {
                    // Specific IE handling for insertHtml.
                    const selection = this.iframeDocument.selection;
                    if (selection && selection.createRange) {
                        selection.createRange().pasteHTML(value);
                    } else {
                        this.iframeDocument.execCommand(command, false, value);
                    }
                } else if (command === 'formatblock' && $.browser && $.browser.msie) {
                    // Specific IE handling for formatblock.
                    this.iframeDocument.execCommand(command, false, `<${value}>`);
                } else {
                    // General cross-browser execution.
                    this.iframeDocument.execCommand(command, false, value);
                }

                this.updateSourceTextarea(); // Sync content after command.
                this.setEditorFocus(); // Re-focus after command.
            } catch (e) {
                console.error("ContentComposer: Error executing command", command, e);
            }
        },

        /**
         * Handles formatting for new lines (Enter key presses).
         * Converts DIVs to P tags in certain scenarios.
         * @param {Event} keyEvent - The keyboard event.
         */
        handleNewlineFormatting: function(keyEvent) {
            const parentNode = this.getClosestParentNode();
            // Check if the current parent is the root editable area (often a DIV).
            if (parentNode && parentNode.nodeName === 'DIV' && parentNode.id === 'editable-content-area') {
                if (keyEvent.preventDefault) {
                    keyEvent.preventDefault();
                }

                const currentNode = $(this.getCurrentSelectionNode());
                // If the current node is an empty DIV, replace it with an empty P.
                if (currentNode.get(0).tagName === 'DIV' && (currentNode.html() === '' || currentNode.html() === '<br>')) {
                    const replacementNode = $('<p>').append(currentNode.clone().get(0).childNodes);
                    currentNode.replaceWith(replacementNode);
                    replacementNode.html('<br />'); // Ensure there's a visible line break.
                    this.setFocusNode(replacementNode.get(0)); // Set caret inside the new P.

                    this.updateSourceTextarea();
                    return false;
                } else {
                    this.updateSourceTextarea();
                }
            }
        },

        /**
         * Normalizes empty content in the editor to a default paragraph.
         * Prevents the editor from becoming completely empty and uneditable.
         * @param {Event} keyEvent - The keyboard event (e.g., Backspace, Delete).
         */
        normalizeEmptyContent: function(keyEvent) {
            // Check if the editor is empty or contains only a single <br>.
            const editorHtml = this.editableContentDiv.html().trim().toLowerCase();
            if (editorHtml === '' || editorHtml === '<br>' || editorHtml === '<p>&nbsp;</p>' || editorHtml === '<p><br></p>' || editorHtml === '<p><br/></p>') {
                keyEvent.preventDefault();
                // Replace with the default empty HTML (e.g., <p><br /></p>).
                const emptyContent = ($.browser && $.browser.mozilla) ? this.configuration.mozillaEmptyParagraph : this.configuration.defaultEmptyHtml;
                this.editableContentDiv.html(emptyContent);
                this.setEditorFocus();
                this.updateSourceTextarea();
                return false;
            }
            this.updateSourceTextarea();
        },

        /**
         * Handles specific Safari behavior for Shift + Enter (inserts <br> instead of new <p>).
         * @param {Event} keyEvent - The keyboard event.
         * @param {number} keyCode - The numeric key code.
         */
        handleSafariShiftEnter: function(keyEvent, keyCode) {
            if (keyCode === 13 && keyEvent.shiftKey) {
                keyEvent.preventDefault();
                this.executeEditCommand('insertHTML', '<br>');
                return false;
            }
            return true;
        },

        /**
         * Retrieves the closest parent node of the current selection.
         * @returns {Node|null} The parent node or null.
         */
        getClosestParentNode: function() {
            const selection = this.iframeDocument.getSelection();
            if (selection && selection.rangeCount > 0) {
                const range = selection.getRangeAt(0);
                return range.commonAncestorContainer;
            }
            return null;
        },

        /**
         * Retrieves the node at the current caret position.
         * @returns {Node|null} The current node or null.
         */
        getCurrentSelectionNode: function() {
            const selection = this.iframeDocument.getSelection();
            if (selection && selection.rangeCount > 0) {
                const range = selection.getRangeAt(0);
                return range.startContainer;
            }
            return null;
        },

        /**
         * Inserts a DOM node at the current caret position.
         * @param {Node} nodeToInsert - The DOM node to insert.
         */
        insertDOMNodeAtCaret: function(nodeToInsert) {
            const selection = this.iframeDocument.getSelection();
            if (selection && selection.rangeCount > 0) {
                const range = selection.getRangeAt(0);
                range.deleteContents(); // Remove any selected content.
                range.insertNode(nodeToInsert);
                // Move caret after the inserted node.
                range.setStartAfter(nodeToInsert);
                range.setEndAfter(nodeToInsert);
                selection.removeAllRanges();
                selection.addRange(range);
            }
        },

        /**
         * Sets the caret focus to a specific DOM node.
         * @param {Node} targetNode - The node to set focus on.
         */
        setFocusNode: function(targetNode) {
            const selection = this.iframeDocument.getSelection();
            const range = this.iframeDocument.createRange();
            range.selectNodeContents(targetNode);
            range.collapse(true); // Collapse to the start.
            selection.removeAllRanges();
            selection.addRange(range);
        },

        /**
         * Placeholder for building the toolbar. This would typically involve
         * creating buttons, dropdowns, and binding commands.
         */
        constructToolbar: function() {
            // This method would be implemented by an external toolbar script
            // loaded via configuration.toolbarPreset.
            // For now, just create a placeholder div.
            this.toolbarElement = $('<div class="cc_toolbar" role="toolbar">Toolbar goes here</div>');
            this.mainWrapperDiv.prepend(this.toolbarElement);
        },

        /**
         * Placeholder for building the resizer handle.
         */
        createResizingHandle: function() {
            // This method would create a draggable handle at the bottom of the editor.
            // For now, it's a no-op as the original Redactor's implementation was complex.
        },

        /**
         * Initializes the autosave feature if configured.
         */
        enableAutoSaveFeature: function() {
            if (this.configuration.autoSaveEndpoint) {
                this._autoSaveInterval = setInterval($.proxy(function() {
                    const currentContent = this.getSourceMarkup();
                    // Only save if content has changed since last save/load.
                    if (this._lastSavedContent !== currentContent) {
                        $.ajax({
                            url: this.configuration.autoSaveEndpoint,
                            type: 'post',
                            data: JSON.stringify({ content: currentContent }),
                            contentType: 'application/json; charset=utf-8',
                            dataType: 'json',
                            success: $.proxy(function(response) {
                                this._lastSavedContent = currentContent; // Update last saved state.
                                this.hostElement.trigger('contentComposer.autosaved', [response]);
                            }, this),
                            error: function(xhr, status, error) {
                                console.error("ContentComposer: Autosave failed:", status, error, xhr.responseText);
                            }
                        });
                    }
                }, this), this.configuration.autoSaveIntervalSec * 1000);
            }
        },

        /**
         * Pre-processes HTML content before it's loaded into the editor.
         * @param {string} htmlString - The raw HTML string.
         * @returns {string} The processed HTML string.
         */
        preprocessMarkup: function(htmlString) {
            // Example pre-processing: Remove specific comments, normalize whitespace.
            let processed = htmlString.replace(/<!--[\s\S]*?-->/g, ''); // Remove HTML comments.
            return processed;
        },

        /**
         * Post-processes HTML content after it's retrieved from the editor.
         * @param {string} htmlString - The HTML string from the editor.
         * @returns {string} The processed HTML string.
         */
        postprocessMarkup: function(htmlString) {
            // Example post-processing: Clean up empty paragraphs, extra breaks.
            let processed = htmlString;
            // Remove empty paragraphs that might contain just non-breaking spaces or empty tags.
            processed = processed.replace(/<p>(\s|&nbsp;|<br\/?>)*<\/p>/gi, '');
            // Convert multiple consecutive <br> tags into single ones, or remove trailing ones.
            processed = processed.replace(/(<br\/?>\s*){2,}/gi, '<br>');
            return processed.trim();
        },

        /**
         * Ensures that newlines in plain text are converted into proper paragraph tags.
         * @param {string} rawHtml - The raw HTML/text string.
         * @returns {string} HTML with paragraphs.
         */
        ensureParagraphFormatting: function(rawHtml) {
            // If content is empty or only whitespace, return default empty paragraph.
            if (!rawHtml || rawHtml.trim() === '') {
                return this.configuration.defaultEmptyHtml;
            }

            // Wrap lines separated by two or more newlines into paragraphs.
            // This regex handles various newline combinations and ensures leading/trailing whitespace is trimmed.
            let formattedHtml = rawHtml.split(/(\r?\n){2,}/).map(segment => {
                const trimmedSegment = segment.trim();
                return trimmedSegment ? `<p>${trimmedSegment}</p>` : '';
            }).join('');

            // If there are still single newlines within blocks, convert them to <br>.
            formattedHtml = formattedHtml.replace(/(\r?\n)/g, '<br>');

            return formattedHtml;
        },

        /**
         * Cleans up pasted content according to configuration settings.
         */
        cleanPastedContent: function() {
            if (!this.configuration.performPasteCleanup) return;

            const contentDiv = this.editableContentDiv;
            if (!contentDiv || !this.iframeDocument) {
                console.warn("ContentComposer: Editor not ready for paste cleanup.");
                return;
            }

            // Find the paste marker.
            const marker = contentDiv.find('#paste-cleanup-marker');
            if (marker.length === 0) {
                console.warn("ContentComposer: Paste cleanup marker not found.");
                return;
            }

            // Select the content before the marker (the pasted content).
            const range = this.iframeDocument.createRange();
            range.setStartBefore(contentDiv.get(0).firstChild);
            range.setEndBefore(marker.get(0)); // End before marker.
            const pastedNodes = range.extractContents(); // Extract the pasted content.

            const tempDiv = $('<div>').append(pastedNodes);

            // Apply cleanup rules.
            if (this.configuration.stripClassesOnPaste) {
                tempDiv.find('*').removeClass(); // Remove all classes.
            }
            if (this.configuration.stripStylesOnPaste) {
                tempDiv.find('*').removeAttr('style'); // Remove inline styles.
            }
            if (this.configuration.convertDivsToParagraphs) {
                // Replace <div> with <p>, but handle nested divs carefully.
                tempDiv.find('div').each(function() {
                    const $this = $(this);
                    // If it's a simple div (not a container for complex layout), convert it.
                    if (!$this.children().length || $this.children().is('br')) {
                        $this.replaceWith($('<p>').append($this.contents()));
                    }
                });
            }
            // Further aggressive cleanup: remove empty tags, normalize whitespace, etc.
            tempDiv.find('b, strong, i, em, u, strike, sub, sup').each(function() {
                const $this = $(this);
                if ($this.html().trim() === '') { // Remove empty formatting tags.
                    $this.remove();
                } else { // Replace with plain text if content is simple.
                    // This is an aggressive cleanup. Can be made configurable.
                    // $this.replaceWith($this.contents());
                }
            });

            // Re-insert cleaned content.
            marker.before(tempDiv.contents());
            marker.remove(); // Remove the marker.

            this.updateSourceTextarea();
        },

        /**
         * Toggles fullscreen mode for the editor.
         */
        toggleFullscreenMode: function() {
            this.configuration.startInFullscreen = !this.configuration.startInFullscreen;

            if (this.configuration.startInFullscreen) {
                // Enter fullscreen.
                this.originalBodyOverflow = $('body').css('overflow');
                $('body').css('overflow', 'hidden');
                this.mainWrapperDiv.addClass('cc_fullscreen');
                this.editorIframe.css({ height: '100%', width: '100%' });
                this.toolbarElement.css({ width: '100%' }); // Ensure toolbar fills width in fullscreen.
            } else {
                // Exit fullscreen.
                $('body').css('overflow', this.originalBodyOverflow);
                this.mainWrapperDiv.removeClass('cc_fullscreen');
                this.editorIframe.css({ height: this.cachedHeight, width: '100%' });
                this.toolbarElement.css({ width: 'auto' });
            }
            this.adjustFrameDimensions(); // Re-adjust if auto-resize is on.
            this.handleStickyToolbar(); // Re-evaluate sticky toolbar position.
            this.hostElement.trigger('contentComposer.fullscreen', [this.configuration.startInFullscreen]);
        }
    };

})(jQuery); // End of IIFE.