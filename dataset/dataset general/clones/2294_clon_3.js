(function (jq) {
  // Purpose: Transforms a standard textarea into an advanced rich text editor
  // utilizing CodeMirror for markdown editing, integrated with a live preview
  // and optional cloud-based image upload capabilities (e.g., Cloudinary).
  //
  // Usage: jq('textarea.my-editor').richtextEditor({ ...config... });
  jq.fn.richtextEditor = function (configParams) {
    // --- Default Configuration Settings ---
    const defaultEditorConfig = {
      // General editor options
      initialContent: '',             // Pre-fill the editor with this content
      placeholderText: 'Start composing your document...', // Placeholder for empty editor
      // Cloud service integration options (e.g., for image uploads)
      cloudService: {
        serviceAccountIdentifier: null, // e.g., Cloudinary cloud name
        uploadAuthToken: null           // e.g., Cloudinary unsigned upload preset
      }
    };

    // Merge user-provided configuration with defaults.
    // Deep merge ensures nested objects like `cloudService` are handled correctly.
    const componentSettings = jq.extend(true, {}, defaultEditorConfig, configParams);

    const { cloudService } = componentSettings;
    const isCloudUploadEnabled = cloudService && cloudService.serviceAccountIdentifier && cloudService.uploadAuthToken;

    // --- Utility Helper Functions ---

    /**
     * Presents a prompt to the user to gather input.
     * @param {string} message - The message to display in the prompt.
     * @param {string} [defaultValue=''] - The default value for the input field.
     * @returns {string|null} The user's input, or null if cancelled.
     */
    const getPromptedInput = (message, defaultValue = '') => window.prompt(message, defaultValue);

    /**
     * Renders markdown text into HTML. Uses 'marked' library if available, otherwise provides a fallback.
     * @param {string} markdownSource - The markdown string to render.
     * @returns {string} The rendered HTML.
     */
    const interpretMarkdownContent = (markdownSource) => {
      // Check for the global 'marked' function (common markdown parser).
      if (typeof marked === 'function') {
        try {
          return marked(markdownSource);
        } catch (error) {
          console.error("Error rendering markdown with 'marked':", error);
          return `<div class="render-error">Failed to render markdown. Error: ${error.message}</div><pre>${jq('<div/>').text(markdownSource).html()}</pre>`;
        }
      } else {
        console.warn("Markdown rendering library 'marked' not found. Displaying raw markdown as preformatted text.");
        // Escape HTML entities to prevent XSS when displaying raw markdown.
        return `<pre class="raw-markdown-fallback">${jq('<div/>').text(markdownSource).html()}</pre>`;
      }
    };

    // --- Main Plugin Logic: Iterate over each selected textarea element ---
    return this.each(function () {
      const targetDomElement = this; // The original textarea HTML element.
      // Ensure the target element has an ID, generating one if missing.
      const elementUniqueId = targetDomElement.id || `rte-instance-${Math.random().toString(36).substr(2, 9)}`;
      jq(targetDomElement).attr('id', elementUniqueId); // Apply ID to the element.

      // --- Pre-initialization Checks ---
      if (typeof CodeMirror === 'undefined') {
        console.error(`CodeMirror library not loaded. Rich text editor for #${elementUniqueId} cannot be initialized.`);
        return; // Skip this element if CodeMirror is missing.
      }

      // --- Initialize CodeMirror Editor ---
      const codeMirrorInstance = CodeMirror.fromTextArea(targetDomElement, {
        syntaxMode: 'markdown',         // Specifies the language mode.
        showLineNumbers: true,          // Display line numbers.
        enableLineWrapping: true,       // Wrap lines that exceed the editor width.
        editorTheme: "default",         // Visual theme for the editor.
        placeholder: componentSettings.placeholderText, // Custom placeholder text.
        customKeyMappings: {            // Custom key bindings.
          "ReturnKey": "insertNewlineAndContinueList" // Enhanced Enter key behavior for lists.
        }
      });

      // Set initial content if provided in the configuration.
      if (componentSettings.initialContent) {
        codeMirrorInstance.setValue(componentSettings.initialContent);
      } else if (jq(targetDomElement).val()) {
        // If initialContent is not set, use existing textarea content.
        codeMirrorInstance.setValue(jq(targetDomElement).val());
      }

      // --- Editor Change Event Handling ---
      let contentUpdateTimeout;
      codeMirrorInstance.on('change', () => {
        clearTimeout(contentUpdateTimeout);
        contentUpdateTimeout = setTimeout(() => {
          const currentContent = codeMirrorInstance.getValue();
          jq(targetDomElement).val(currentContent); // Update the hidden textarea's value.
          // Trigger a custom event for external listeners to react to content changes.
          jq(targetDomElement).trigger('rte:contentChanged', [currentContent]);
          // console.log(`Content updated for #${elementUniqueId}`); // Debugging log
        }, 350); // Debounce interval to prevent excessive updates.
      });

      // --- Content Insertion Handlers ---
      // A collection of functions to insert predefined markdown structures into the editor.
      const contentInsertionUtilities = {
        // Inserts text with optional prefix/suffix (e.g., for bold, italic).
        insertFormattedText: function(triggerElement) {
          const prefixMark = triggerElement.data('prefix-marker');
          const suffixMark = triggerElement.data('suffix-marker');
          const currentSelection = codeMirrorInstance.getSelection();

          codeMirrorInstance.replaceSelection(prefixMark + currentSelection);
          if (suffixMark) {
            codeMirrorInstance.replaceSelection(suffixMark, 'start'); // Place cursor at the start of suffix
          }
        },
        // Inserts a markdown hyperlink.
        insertHyperlink: function() {
          const urlPrompt = getPromptedInput('Enter the URL for the link:', 'https://');
          if (urlPrompt) {
            const linkDisplay = codeMirrorInstance.getSelection() || 'Link Text';
            codeMirrorInstance.replaceSelection(`[${linkDisplay}](${urlPrompt})`);
          }
        },
        // Inserts an HTML iframe for embedding video.
        insertVideoEmbed: function() {
          const videoUrlPrompt = getPromptedInput('Enter the video URL (e.g., YouTube, Vimeo link):');
          if (videoUrlPrompt) {
            // A basic iframe template. Could be expanded with more options.
            codeMirrorInstance.replaceSelection(`\n\n<iframe width="560" height="315" src="${videoUrlPrompt}" frameborder="0" allowfullscreen></iframe>\n\n`);
          }
        },
        // Triggers the file input for image uploads.
        initiateImageUpload: function(triggerElement) {
          // Locate the associated file input field based on data attributes.
          const controlPanelContainer = triggerElement.closest('.content-editor-controls');
          const boundTargetId = controlPanelContainer.data('bind-editor-id');
          const fileInputTargetSelector = `#${boundTargetId}-file_upload_input`;
          jq(fileInputTargetSelector).trigger('click');
        }
      };

      // --- Toolbar Button Event Handlers ---

      // Handle clicks on content insertion buttons.
      jq(`.content-editor-controls[data-bind-editor-id="${elementUniqueId}"] .action-btn--insert`).on('click', function (domEvent) {
        const actionType = jq(this).data('action-type') || 'insertFormattedText';
        const handlerFunction = contentInsertionUtilities[actionType];

        if (handlerFunction) {
          handlerFunction(jq(this));
        } else {
          console.warn(`No specific handler found for action type: '${actionType}' on editor #${elementUniqueId}.`);
        }
        codeMirrorInstance.focus(); // Keep the editor focused after button click.
        domEvent.preventDefault(); // Prevent default button form submission behavior.
      });

      // Handle clicks on the preview toggle button.
      const previewDisplayPanelClass = `${elementUniqueId}-preview-display`;
      jq(`.action-btn--toggle-preview[data-bind-editor-id="${elementUniqueId}"]`).on('click', function (domEvent) {
        const $toggleButton = jq(this);
        const $editorWrapperElement = jq(codeMirrorInstance.getWrapperElement());
        const $previewRenderArea = jq(`.${previewDisplayPanelClass}`);

        // Toggle visibility of the editor and the preview panel.
        $editorWrapperElement.toggleClass('editor-component--hidden');
        $previewRenderArea.toggleClass('editor-component--hidden');

        // Update button text and preview content based on visibility state.
        if ($editorWrapperElement.hasClass('editor-component--hidden')) {
          // Editor is now hidden, preview is visible. Update preview content.
          $previewRenderArea.html(interpretMarkdownContent(codeMirrorInstance.getValue()));
          $toggleButton.text('Hide Preview');
          jq(targetDomElement).trigger('rte:previewShown', [codeMirrorInstance.getValue()]);
        } else {
          // Editor is now visible, preview is hidden.
          $toggleButton.text('Show Preview');
          jq(targetDomElement).trigger('rte:editorShown');
        }
        domEvent.preventDefault();
      });

      // Initialize: Ensure the preview area is hidden by default on load.
      jq(`.${previewDisplayPanelClass}`).addClass('editor-component--hidden');

      // --- Cloud Image Upload Integration (e.g., Cloudinary) ---
      if (isCloudUploadEnabled) {
        // Validate if the cloud upload plugin is loaded.
        if (typeof jq.fn.initializeCloudUpload === 'undefined') {
          console.error(`Cloud upload plugin (e.g., unsigned_cloudinary_upload) not found. Image uploads for #${elementUniqueId} will be disabled.`);
          return; // Exit if the plugin isn't available.
        }

        // Dynamically append a hidden form with a file input to the body.
        // This input will be used by the cloud upload plugin.
        jq('body').append(`
          <form class="image-upload-form" enctype="multipart/form-data" style="display:none;">
            <input
              class="file_upload_input"
              data-bind-editor-id="${elementUniqueId}"
              id="${elementUniqueId}-file_upload_input"
              name="file"
              type="file"
              accept="image/*"
              aria-label="Upload image file"
            />
          </form>
        `);

        // Initialize the cloud upload plugin for the newly created file input.
        jq(`.file_upload_input[data-bind-editor-id="${elementUniqueId}"]`)
          .initializeCloudUpload(
            cloudService.uploadAuthToken,
            { account_id: cloudService.serviceAccountIdentifier, upload_tags: 'rich_text_editor_uploads' }, // Renamed options
            { allowMultiple: false } // Changed from `multiple: true` to `false` for simpler single image upload flow.
          )
          .on('uploadComplete', function(uploadEvent, uploadData) { // Custom event name
            // On successful upload, insert the image URL into the CodeMirror editor.
            if (uploadData && uploadData.result && uploadData.result.public_id) {
              const imageUrl = jq.cloudinary.createUrl(uploadData.result.public_id, {
                account_id: cloudService.serviceAccountIdentifier,
                secure: true // Ensure HTTPS URL
              });
              // Insert markdown image syntax.
              codeMirrorInstance.replaceSelection(`![Uploaded Image](${imageUrl})\n`);
              jq(targetDomElement).trigger('rte:imageUploaded', [imageUrl]);
            } else {
              console.error(`Cloud upload for #${elementUniqueId} failed or returned incomplete data.`, uploadData);
              alert("Image upload failed: Could not retrieve image URL.");
            }
            codeMirrorInstance.focus(); // Return focus to the editor after insertion.
          })
          .on('fileuploadfail', function(domEvent, data) {
            // Handle upload failures and inform the user.
            console.error(`Image upload for #${elementUniqueId} encountered an error:`, data.jqXHR.responseJSON || data);
            alert("Image upload failed. Please check your network connection and try again.");
            jq(targetDomElement).trigger('rte:imageUploadFailed', [data]);
          });
      }
    });
  };
})(jQuery); // Pass jQuery as `jq` alias to avoid conflicts and for brevity.