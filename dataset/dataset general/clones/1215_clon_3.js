(function (jq) {

  // Enforce strict JavaScript parsing rules for this module.
  "use strict";

  // Define a collection of core functionalities for the markup composer plugin.
  const pluginFunctions = {
    /**
     * Initializes the markup composer component on selected elements.
     * @param {object} userSettings - Custom configuration options provided by the user.
     * @returns {jq} The jQuery object for chainability.
     */
    initializeComposer: function (userSettings) {

      // Ensure we're operating on a valid jQuery collection.
      if (!this.length) {
        console.warn("Markup composer target element not found.");
        return this;
      }

      // Merge default settings with user-provided options.
      // Deep merge ensures nested objects are correctly combined.
      const effectiveConfig = jq.extend(true, {}, jq.fn.markupComposer.defaultSettings, userSettings);

      const composerInstance = this; // Cache the jQuery object for frequent use.
      let isPreviewModeActive = false; // Tracks if the preview panel is currently visible.
      let isMaximized = false; // Tracks if the composer is in fullscreen mode.

      // Mark the element as initialized to prevent multiple setups.
      if (composerInstance.data('composerInitialized')) {
          console.info("Markup composer already initialized on this element.");
          return this;
      }
      composerInstance.data('composerInitialized', true);

      // Apply base styling and inject the control panel and editor/preview structures.
      composerInstance.addClass('markup-wrapper').html(generateControlPanelMarkup(this.text(), effectiveConfig));

      // Check for Bootstrap's tooltip functionality and initialize if available.
      if (typeof jq.fn.tooltip === 'function') {
        composerInstance.find('[data-ui-tip="tooltip"]').tooltip({
          container: 'body', // Attach tooltips to the body to prevent clipping issues.
          trigger: 'hover' // Show on hover.
        });
      }

      // Cache frequently accessed DOM elements for performance.
      const cachedElements = {
        inputArea: composerInstance.find('.input-area'),
        outputDisplay: composerInstance.find('.output-display'),
        activityIndicator: composerInstance.find('.activity-indicator'),
        editButton: composerInstance.find('.btn-edit-mode'),
        previewButton: composerInstance.find('.btn-preview-mode')
      };

      // Apply initial dimensions to the main composer container.
      composerInstance.css({
        width: effectiveConfig.viewWidth
      });

      // Set dimensions and font size for the Ace editor input area.
      cachedElements.inputArea.css({
        width: effectiveConfig.viewWidth,
        height: effectiveConfig.viewHeight,
        fontSize: effectiveConfig.textFontSize
      });

      // Set dimensions for the preview display.
      cachedElements.outputDisplay.css({
        width: effectiveConfig.viewWidth,
        height: effectiveConfig.viewHeight
      });

      // Initialize the Ace editor instance.
      // A guard clause for the Ace global object.
      if (typeof ace === 'undefined' || !ace.edit) {
          console.error("Ace editor library not found. Please ensure 'ace.js' is loaded.");
          return this;
      }

      const codeEditor = ace.edit(cachedElements.inputArea[0]);
      let codeSnippetManager; // Will be assigned after language tools load.

      // Configure Ace editor appearance and behavior.
      codeEditor.setTheme('ace/theme/' + effectiveConfig.editorTheme);
      codeEditor.getSession().setMode('ace/mode/markdown');
      codeEditor.getSession().setUseWrapMode(true); // Enable word wrapping.

      // Disable some default Ace editor UI elements for a cleaner look.
      codeEditor.setHighlightActiveLine(false); // No active line highlighting.
      codeEditor.setShowPrintMargin(false); // Hide the print margin line.
      codeEditor.renderer.setShowGutter(false); // Hide line numbers gutter.

      // Dynamically load Ace language tools for snippet management.
      ace.config.loadModule('ace/ext/language_tools', function () {
        codeSnippetManager = ace.require('ace/snippets').snippetManager;
        establishKeybinds(codeEditor, codeSnippetManager); // Set up custom keyboard shortcuts.
      });

      // --- Image Upload Functionality ---
      if (effectiveConfig.allowImageUpload) {
        // Handle file selection via input change.
        composerInstance.find('.upload-file-input').on('change', function() {
            const selectedFiles = this.files; // Access native FileList.

            if (selectedFiles.length > 0) {
                performFileUpload(effectiveConfig.uploadEndpoint, selectedFiles, codeEditor, codeSnippetManager, cachedElements.activityIndicator);
            }
        });

        // Prevent default drag/drop behavior to allow custom handling.
        composerInstance.on('dragenter', (evt) => {
            evt.stopPropagation();
            evt.preventDefault();
        });

        composerInstance.on('dragover', (evt) => {
            evt.stopPropagation();
            evt.preventDefault();
        });

        // Handle files dropped onto the composer.
        composerInstance.on('drop', (evt) => {
            evt.preventDefault();
            const droppedFiles = evt.originalEvent.dataTransfer.files;

            if (droppedFiles.length > 0) {
                performFileUpload(effectiveConfig.uploadEndpoint, droppedFiles, codeEditor, codeSnippetManager, cachedElements.activityIndicator);
            }
        });
      }

      // --- Window Resize Event for Fullscreen Mode ---
      if (effectiveConfig.enableFullscreen) {
        jq(window).on('resize', () => {
          if (isMaximized) {
            // Adjust layout based on current mode (edit or preview).
            if (!isPreviewModeActive) {
              adjustViewportSize(cachedElements.inputArea);
            } else {
              adjustViewportSize(cachedElements.outputDisplay);
            }
            codeEditor.resize(); // Inform Ace editor of dimension changes.
          }
        });
      }

      // --- Toolbar Button Event Handling ---
      composerInstance.find('.composer-button').on('click', function () {
        const actionId = jq(this).data('action');
        const currentSelection = codeEditor.session.getTextRange(codeEditor.getSelectionRange());

        // A helper function to toggle active classes for edit/preview buttons
        const updateModeButtons = (isEditMode) => {
            cachedElements.editButton.toggleClass('active', isEditMode);
            cachedElements.previewButton.toggleClass('active', !isEditMode);
        };

        // Validate actionId to prevent unexpected behavior.
        if (!actionId) {
            console.warn("Toolbar button missing 'data-action' attribute.");
            return;
        }

        switch (actionId) {
          case 'head1':
            insertHeadline(codeEditor, '# ');
            break;
          case 'head2':
            insertHeadline(codeEditor, '## ');
            break;
          case 'head3':
            insertHeadline(codeEditor, '### ');
            break;
          case 'bold':
            codeEditor.execCommand('bold'); // Utilize Ace's built-in command.
            break;
          case 'italic':
            codeEditor.execCommand('italic');
            break;
          case 'link':
            codeEditor.execCommand('link');
            break;
          case 'img':
            // Insert image snippet. If text is selected, use it for alt text.
            codeSnippetManager.insertSnippet(codeEditor, currentSelection === '' ? '![${1:alt text}](https://$2)' : '![' + currentSelection + '](https://$1)');
            break;
          case 'editMode':
            isPreviewModeActive = false;
            cachedElements.outputDisplay.hide();
            cachedElements.inputArea.show();
            updateModeButtons(true); // Activate edit button.
            if (isMaximized) {
              adjustViewportSize(cachedElements.inputArea);
            }
            break;
          case 'previewMode':
            isPreviewModeActive = true;
            cachedElements.outputDisplay.html('<p class="loading-message">' + effectiveConfig.textLabels.loadingStatus + '...</p>');
            // Asynchronously render markdown content.
            effectiveConfig.onContentPreview(codeEditor.getSession().getValue(), (renderedHtml) => {
              cachedElements.outputDisplay.html(renderedHtml);
            });
            cachedElements.inputArea.hide();
            cachedElements.outputDisplay.show();
            updateModeButtons(false); // Activate preview button.
            if (isMaximized) {
              adjustViewportSize(cachedElements.outputDisplay);
            }
            break;
          case 'toggleFullscreen':
            isMaximized = !isMaximized; // Toggle fullscreen state.

            const bodyAndHtml = jq('body, html');
            const newHeight = isMaximized ? 'auto' : effectiveConfig.viewHeight;

            bodyAndHtml.toggleClass('body-maximized-view', isMaximized);
            composerInstance.toggleClass('composer-maximized', isMaximized);

            // Reset heights if exiting fullscreen, or adjust if entering.
            if (!isMaximized) {
              cachedElements.inputArea.css('height', newHeight);
              cachedElements.outputDisplay.css('height', newHeight);
            } else {
              // Adjust the currently visible panel.
              if (!isPreviewModeActive) {
                adjustViewportSize(cachedElements.inputArea);
              } else {
                adjustViewportSize(cachedElements.outputDisplay);
              }
            }
            codeEditor.resize(); // Inform Ace editor about new dimensions.
            break;
          default:
            console.warn(`Unhandled action identifier: ${actionId}`);
        }
        codeEditor.focus(); // Keep editor focused after action.
      });

      console.info("Markup composer initialized successfully.");
      return this; // Allow jQuery method chaining.
    },

    /**
     * Retrieves the current content from the Ace editor.
     * @returns {string} The markdown content.
     */
    getContent: function () {
      // Find the Ace editor instance associated with this composer.
      const editorElement = this.find('.input-area')[0];
      if (editorElement && ace.edit) {
        const currentEditor = ace.edit(editorElement);
        return currentEditor.getSession().getValue();
      }
      console.error("Could not retrieve content: Editor not found or Ace not initialized.");
      return "";
    }
  };

  /**
   * The main jQuery plugin definition for markupComposer.
   * Handles method calls or initialization.
   * @param {string|object} param - Method name or configuration object.
   * @returns {jq} The jQuery object for chainability.
   */
  jq.fn.markupComposer = function (param) {

    // If param is a string, attempt to call a plugin function.
    if (typeof param === 'string' && pluginFunctions[param]) {
      return pluginFunctions[param].apply(this, Array.prototype.slice.call(arguments, 1));
    }
    // If param is an object or undefined, initialize the plugin.
    else if (typeof param === 'object' || !param) {
      return pluginFunctions.initializeComposer.apply(this, arguments);
    }
    // If method does not exist.
    else {
      jq.error('Method "' + param + '" does not exist on jQuery.markupComposer');
    }
  };

  /**
   * Handles the upload of files to a specified endpoint.
   * Inserts markdown image syntax into the editor upon successful upload.
   * @param {string} uploadUrl - The URL for file upload.
   * @param {FileList} filesToUpload - A FileList object containing files to upload.
   * @param {object} editorInstance - The Ace editor instance.
   * @param {object} snippetManagerInstance - The Ace snippet manager.
   * @param {jq} loadingIndicator - jQuery object for the loading spinner.
   */
  function performFileUpload (uploadUrl, filesToUpload, editorInstance, snippetManagerInstance, loadingIndicator) {

    if (!uploadUrl || filesToUpload.length === 0) {
        console.warn("File upload skipped: No URL or no files provided.");
        return;
    }

    loadingIndicator.show(); // Display loading animation.

    const formData = new FormData();
    // Append each file to the FormData object with a unique key.
    Array.from(filesToUpload).forEach((file, index) => {
        formData.append('file' + index, file);
    });

    jq.ajax({
      url: uploadUrl,
      type: 'POST', // Explicitly define the HTTP method.
      contentType: false, // Important for FormData.
      data: formData,
      processData: false, // Important for FormData.
      cache: false, // Prevent browser caching.
      dataType: 'json', // Expect JSON response.
      timeout: 30000 // Set a timeout for the request.
    })
    .done((uploadedAssetList) => {
      // Add each uploaded image URL to the editor.
      if (uploadedAssetList && uploadedAssetList.length > 0) {
        let lineBreakDelimiter = uploadedAssetList.length > 1 ? "\n" : ""; // Add newline for multiple images.

        uploadedAssetList.forEach((assetPath) => {
          snippetManagerInstance.insertSnippet(editorInstance, '![](' + assetPath + ')' + lineBreakDelimiter);
        });
        console.log("Files uploaded successfully.");
      } else {
          console.warn("Upload succeeded, but no file paths returned.");
      }
    })
    .fail((jqXHR, textStatus, errorThrown) => {
        console.error(`File upload failed: ${textStatus}, ${errorThrown}`, jqXHR);
        alert("Image upload failed. Please try again."); // User feedback for failure.
    })
    .always(() => {
      loadingIndicator.hide(); // Hide loading animation regardless of success/failure.
    });
  }

  /**
   * Adjusts the height of a given panel to fit the remaining window space,
   * typically used for fullscreen mode.
   * @param {jq} targetPanel - The jQuery object of the panel to adjust.
   */
  function adjustViewportSize (targetPanel) {
    if (!targetPanel || targetPanel.length === 0) {
        console.warn("Cannot adjust viewport: target panel not found.");
        return;
    }

    const currentWindowHeight = jq(window).height();
    const panelTopOffset = targetPanel.offset().top;
    const paddingBottom = 10; // Add some padding at the bottom.

    // Calculate available height, ensuring it's not negative.
    const calculatedHeight = Math.max(0, currentWindowHeight - panelTopOffset - paddingBottom);

    targetPanel.css('height', calculatedHeight + 'px');
  }

  /**
   * Establishes custom keyboard shortcuts for markdown formatting.
   * @param {object} editorInstance - The Ace editor instance.
   * @param {object} snippetManagerInstance - The Ace snippet manager.
   */
  function establishKeybinds (editorInstance, snippetManagerInstance) {

    // Define common command execution logic for text formatting.
    const createFormattingCommand = (name, winKey, macKey, snippetTemplate, emptySnippetTemplate) => {
        editorInstance.commands.addCommand({
            name: name,
            bindKey: { win: winKey, mac: macKey },
            exec: (editor) => {
                const currentSelection = editor.session.getTextRange(editor.getSelectionRange());
                if (currentSelection === '') {
                    snippetManagerInstance.insertSnippet(editor, emptySnippetTemplate);
                } else {
                    snippetManagerInstance.insertSnippet(editor, snippetTemplate.replace('${1:text}', currentSelection));
                }
            },
            readOnly: false // Command can modify content.
        });
    };

    createFormattingCommand('boldText', 'Ctrl-B', 'Command-B', '**${1:text}**', '**${1:bold text}**');
    createFormattingCommand('italicText', 'Ctrl-I', 'Command-I', '*${1:text}*', '*${1:italic text}*');
    createFormattingCommand('insertLink', 'Ctrl-K', 'Command-K', '[${1:text}](https://$2)', '[${1:link text}](https://$2)');

    console.debug("Custom keyboard shortcuts established.");
  }

  /**
   * Inserts a markdown header prefix at the beginning of the current line.
   * @param {object} editorInstance - The Ace editor instance.
   * @param {string} markupPrefix - The header markdown string (e.g., '# ', '## ').
   */
  function insertHeadline (editorInstance, markupPrefix) {
    // Navigate to the start of the current line.
    editorInstance.navigateLineStart();

    // Check if the line already starts with the prefix to avoid duplication.
    const currentLine = editorInstance.session.getLine(editorInstance.getCursorPosition().row);
    if (!currentLine.startsWith(markupPrefix.trim())) { // Trim to compare just the hash marks.
        editorInstance.insert(markupPrefix);
    } else {
        // If it already has a similar prefix, remove it and re-add. (Optional: or just do nothing)
        // For simplicity, we'll just ensure it's at the start.
        // A more advanced version might toggle.
    }
  }

  /**
   * Generates the HTML string for the composer's toolbar and main panels.
   * Uses template literals for cleaner string construction.
   * @param {string} initialContent - The initial content for the editor.
   * @param {object} configOptions - The effective configuration options.
   * @returns {string} The generated HTML string.
   */
  function generateControlPanelMarkup (initialContent, configOptions) {
    const labels = configOptions.textLabels; // Shortcut to labels.
    const trimmedContent = initialContent ? jq.trim(initialContent) : '';

    // Helper to generate a button with common attributes.
    const createToolbarButton = (action, title, labelOrIconHtml, extraClasses = '') => `
        <button type="button" data-ui-tip="tooltip" title="${title}" class="composer-button btn btn-sm btn-secondary ${extraClasses}" data-action="${action}">
            ${labelOrIconHtml}
        </button>
    `;

    // Helper for button groups.
    const createButtonGroup = (content, alignRight = false) => `
        <div class="control-group ${alignRight ? 'align-right' : ''}">
            ${content}
        </div>
    `;

    let generatedHtml = '';

    generatedHtml += `
        <div class="activity-indicator">
            <span class="activity-icon-wrapper"><span class="activity-icon"></span></span>
        </div>
        <div class="composer-toolbar">
            <div class="button-group-container">
    `;

    // Header Controls
    generatedHtml += createButtonGroup(`
        ${createToolbarButton('head1', labels.btnHeader1, 'H1')}
        ${createToolbarButton('head2', labels.btnHeader2, 'H2')}
        ${createToolbarButton('head3', labels.btnHeader3, 'H3')}
    `);

    // Formatting Controls
    generatedHtml += createButtonGroup(`
        ${createToolbarButton('bold', labels.btnBold, '<span class="icon-glyph icon-bold"></span>')}
        ${createToolbarButton('italic', labels.btnItalic, '<span class="icon-glyph icon-italic"></span>')}
    `);

    // Media Controls
    let mediaButtons = `
        ${createToolbarButton('link', labels.btnLink, '<span class="icon-glyph icon-link"></span>')}
        ${createToolbarButton('img', labels.btnImage, '<span class="icon-glyph icon-picture"></span>')}
    `;
    if (configOptions.allowImageUpload) {
        mediaButtons += `
            <button type="button" data-ui-tip="tooltip" title="${labels.btnUpload}" class="btn btn-sm btn-secondary file-upload-wrapper">
                <span class="icon-glyph icon-upload"></span>
                <input class="upload-file-input" type="file" multiple accept="image/*">
            </button>
        `;
    }
    generatedHtml += createButtonGroup(mediaButtons);

    // Fullscreen Toggle (if enabled)
    if (configOptions.enableFullscreen) {
        generatedHtml += createButtonGroup(`
            ${createToolbarButton('toggleFullscreen', labels.btnFullscreen, '<span class="icon-glyph icon-fullscreen"></span> ' + labels.btnFullscreen)}
        `, true); // Align right.
    }

    // Edit/Preview Toggle (if enabled)
    if (configOptions.enablePreview) {
        generatedHtml += createButtonGroup(`
            ${createToolbarButton('editMode', labels.btnEdit, '<span class="icon-glyph icon-pencil"></span> ' + labels.btnEdit, 'btn-edit-mode active')}
            ${createToolbarButton('previewMode', labels.btnPreview, '<span class="icon-glyph icon-eye-open"></span> ' + labels.btnPreview, 'btn-preview-mode')}
        `, true); // Align right.
    }

    generatedHtml += `
            </div> <!-- .button-group-container -->
        </div> <!-- .composer-toolbar -->

        <div class="input-area">${trimmedContent}</div>
        <div class="output-display" style="display:none"></div>
    `;

    return generatedHtml;
  }

  // --- Default Configuration Settings ---
  // These settings can be overridden during plugin initialization.
  jq.fn.markupComposer.defaultSettings = {
    viewWidth: '100%', // Default width of the composer container.
    viewHeight: '450px', // Default height of the editor/preview panels.
    textFontSize: '13px', // Font size within the Ace editor.
    editorTheme: 'github', // Ace editor theme (e.g., 'twilight', 'chrome', 'monokai').
    enableFullscreen: true, // Allow fullscreen mode toggle.
    allowImageUpload: false, // Enable drag-and-drop image uploads.
    uploadEndpoint: '/api/upload-image', // URL for image upload server endpoint.
    enablePreview: true, // Show the preview button and panel.
    onContentPreview: function (rawContent, renderCallback) {
      // Default preview function: simply returns the raw content.
      // Users should override this to integrate with a Markdown rendering library.
      renderCallback(rawContent);
    },
    textLabels: {
      btnHeader1: 'Level 1 Heading',
      btnHeader2: 'Level 2 Heading',
      btnHeader3: 'Level 3 Heading',
      btnBold: 'Strong Text',
      btnItalic: 'Emphasized Text',
      btnLink: 'Insert Web Link',
      btnImage: 'Embed Image',
      btnUpload: 'Upload Media',
      btnEdit: 'Write',
      btnPreview: 'View',
      btnFullscreen: 'Maximize',
      loadingStatus: 'Rendering content'
    }
  };

}(jQuery));