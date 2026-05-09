/*-----------------------------------------------------------------------------------*/
/* Asset Management Utility for Options Framework
/* JavaScript Logic (Revised 2023-10-27)
/*
/* This module facilitates media library integration for option pages, allowing users
/* to select and manage various digital assets (images, documents, audio, video).
/* It's designed for use within a WordPress-like administrative environment,
/* specifically for custom theme or plugin option panels.
/*
/* This updated version incorporates modern jQuery practices, enhances
/* robustness, and refactors components for improved readability and maintenance.
/*-----------------------------------------------------------------------------------*/

(function (jQry) {

  const assetManager = {

/*-----------------------------------------------------------------------------------*/
/* Handles the removal of an uploaded file or asset.
/* Triggered when a 'remove' button associated with an asset is clicked.
/*-----------------------------------------------------------------------------------*/

    handleAssetRemoval: function () {

      // Attach a click handler to dynamically added 'remove' buttons.
      jQry(document).on('click', '.asset_deleter', function (e) {
        e.preventDefault(); // Prevent default link behavior

        const $clickedButton = jQry(this);
        const $previewContainer = $clickedButton.closest('.asset_display_area'); // Find nearest preview container
        const $inputField = $previewContainer.siblings('.asset_path_input'); // Find sibling input field for path

        // Optional: Add a confirmation dialog before removal
        if (!confirm('Are you sure you want to remove this asset?')) {
            return; // Abort if user cancels
        }

        $clickedButton.hide(); // Hide the remove button
        $inputField.val(''); // Clear the input field's value
        $previewContainer.slideUp('fast', function() {
            jQry(this).empty(); // Clear content after hiding
        });
        // Also hide any related background property settings if they exist
        $previewContainer.siblings('.background_options_panel').hide();
      });

      // Note: The original logic to hide the delete button on the first row has been removed
      // as it's considered a specific UI detail rather than core asset management.

    }, // End handleAssetRemoval

/*-----------------------------------------------------------------------------------*/
/* Transforms standard HTML file input fields into a custom, styled UI.
/* This provides a text field for display and a button to trigger the upload.
/*-----------------------------------------------------------------------------------*/

    enhanceFileInputs: function () {

      jQry('input.basic_file_input').each(function () {
        const $originalInput = jQry(this);
        const originalInputId = $originalInput.attr('id');

        // Ensure the input has an ID for linking
        if (!originalInputId) {
            console.warn('File input missing ID, skipping enhancement:', $originalInput[0]);
            return;
        }

        const uploadActionButton = '<button type="button" class="upload_trigger_button">Select File</button>';
        const $wrapperDiv = jQry('<div class="custom_file_wrapper" />');
        const $displayDiv = jQry('<div class="file_display_area" />');
        const $displayInput = jQry('<input type="text" class="display_file_path" readonly />')
                                .attr('id', originalInputId + '_display')
                                .val($originalInput.val()); // Initialize with current value

        // Wrap the original input, set it to invisible
        $originalInput.wrap($wrapperDiv)
                      .addClass('hidden_file_input')
                      .css({ 'opacity': 0, 'position': 'absolute', 'left': '-9999px' }); // Visually hide but keep accessible if needed

        // Append the custom display and button
        $originalInput.parent().append(
            $displayDiv.append($displayInput, uploadActionButton)
        );

        // Update the display field when the original input's value changes
        $originalInput.on('change', function () {
          $displayInput.val(jQry(this).val());
        });

        // The original `mouseout` event handler for updating display was redundant and has been removed.
        // The `change` event is sufficient for reflecting file selection.
      });

    }, // End enhanceFileInputs

/*-----------------------------------------------------------------------------------*/
/* Initializes the WordPress Media Library Thickbox for asset selection.
/* Requires jQuery, WordPress Media Upload scripts, and Thickbox.
/* This function overrides the default `send_to_editor` to handle selected assets.
/*-----------------------------------------------------------------------------------*/

    initMediaPicker: function () {

      // Ensure jQuery is in noConflict mode for compatibility within WordPress
      jQry.noConflict();

      // Remove any inline styles that might prevent the button from displaying correctly
      jQry('input.media_picker_trigger').removeAttr('style');

      let targetInputId = null; // Stores the ID of the input field to update
      let postContextId = null; // Stores the post ID context for the media uploader
      let intervalHandle = null; // Handle for the interval used to modify Thickbox UI

      // Regular expressions for common file types
      const assetPatterns = {
        image: /\.(jpg|jpeg|png|gif|ico)$/i,
        document: /\.(pdf|doc|docx|ppt|pptx|odt)$/i,
        audio: /\.(mp3|m4a|ogg|wav)$/i,
        video: /\.(mp4|m4v|mov|wmv|avi|mpg|ogv|3gp|3g2)$/i
      };

      /**
       * Determines the type of asset based on its URL.
       * @param {string} url - The URL of the asset.
       * @returns {string} - 'image', 'document', 'audio', 'video', or 'unknown'.
       */
      const getAssetType = (url) => {
        if (!url || typeof url !== 'string') return 'unknown';
        if (url.match(assetPatterns.image)) return 'image';
        if (url.match(assetPatterns.document)) return 'document';
        if (url.match(assetPatterns.audio)) return 'audio';
        if (url.match(assetPatterns.video)) return 'video';
        return 'unknown';
      };

      /**
       * Generates the HTML markup for displaying an asset preview.
       * @param {string} url - The URL of the asset.
       * @param {string} title - The title of the asset (for non-images).
       * @returns {string} - HTML string for the preview.
       */
      const generateAssetPreviewMarkup = (url, title = 'View File') => {
        const assetType = getAssetType(url);
        let previewHtml = '';

        if (assetType === 'image') {
          previewHtml = `<img src="${url}" alt="Selected Image" style="max-width:150px; display:block;" />`;
        } else {
          // For non-image files, provide a link and a generic icon/display
          previewHtml = `
            <div class="non_image_preview">
              <span class="file_icon type_${assetType}"></span>
              <a href="${url}" target="_blank" rel="noopener noreferrer" class="asset_link_display">${title}</a>
            </div>
          `;
        }
        previewHtml += `<a href="#" class="asset_deleter button secondary">Remove Asset</a>`;
        return previewHtml;
      };

      // Handle click event for media picker buttons
      jQry(document).on("click", 'input.media_picker_trigger', function (e) {
        e.preventDefault(); // Prevent form submission or default button action

        const $clickedButton = jQry(this);
        targetInputId = $clickedButton.prev('input.asset_path_input').attr('id');
        postContextId = $clickedButton.attr('data-post-id') || '0'; // Use data attribute for post ID

        // Guard clause: ensure we have a target input field
        if (!targetInputId) {
            console.error('Media picker button clicked without a linked input field.', $clickedButton[0]);
            return;
        }

        // Change "Insert into Post" button text to "Use This Image/File" within Thickbox
        intervalHandle = setInterval(function () {
          const $tbIframe = jQry('#TB_iframeContent');
          if ($tbIframe.length) {
            const $saveSendButton = $tbIframe.contents().find('.savesend .button');
            if ($saveSendButton.length) {
              $saveSendButton.val('Use This Asset');
              clearInterval(intervalHandle); // Stop the interval once button is found and updated
            }
          }
        }, 500); // Check every 500ms

        // Determine a custom title for the Thickbox popup
        let popupTitle = 'Select an Asset';
        const $sectionHeader = $clickedButton.parents('.content_block').find('.block_header');
        if ($sectionHeader.length) {
          popupTitle = $sectionHeader.text();
        }

        // Open the WordPress media uploader Thickbox
        tb_show(popupTitle, `media-upload.php?post_id=${postContextId}&TB_iframe=1`);
      });

      // Override the default WordPress `send_to_editor` function
      // This is crucial for handling the selected media item.
      window.originalEditorHandler = window.send_to_editor;
      window.send_to_editor = function (htmlContent) {

        // If no target input field is set, revert to original behavior
        if (!targetInputId) {
          window.originalEditorHandler(htmlContent);
          return;
        }

        // Clear the interval for the "Use This Asset" button text modification
        if (intervalHandle) {
          clearInterval(intervalHandle);
        }

        let selectedAssetUrl = '';
        let selectedAssetTitle = '';

        // Attempt to parse the HTML returned by send_to_editor
        const $tempDiv = jQry('<div>').append(htmlContent); // Create a temporary element to parse content

        // First, check for an image tag
        const $imgElement = $tempDiv.find('img');
        if ($imgElement.length > 0) {
          selectedAssetUrl = $imgElement.attr('src'); // Get URL from image src
          selectedAssetTitle = $imgElement.attr('alt') || 'Image';
        } else {
          // If no image, check for an anchor tag (link to a file)
          const $anchorElement = $tempDiv.find('a');
          if ($anchorElement.length > 0) {
            selectedAssetUrl = $anchorElement.attr('href'); // Get URL from link href
            selectedAssetTitle = $anchorElement.text(); // Get title from link text
          } else {
            // Fallback: If no img or a, assume the htmlContent itself might be the URL string
            selectedAssetUrl = htmlContent;
            selectedAssetTitle = 'Selected File';
          }
        }

        // If a URL was successfully extracted
        if (selectedAssetUrl) {
          const $targetInputField = jQry('#' + targetInputId);
          const $previewDisplayArea = $targetInputField.siblings('.asset_display_area');
          const $backgroundOptions = $targetInputField.siblings('.background_options_panel');

          // Update the input field with the asset's URL
          $targetInputField.val(selectedAssetUrl);

          // Generate and display the preview markup
          const previewContent = generateAssetPreviewMarkup(selectedAssetUrl, selectedAssetTitle);
          $previewDisplayArea.slideDown().html(previewContent);

          // Show background properties panel if the asset is an image
          if (getAssetType(selectedAssetUrl) === 'image') {
            $backgroundOptions.show();
          } else {
            $backgroundOptions.hide(); // Hide for non-images
          }

          // Close the Thickbox modal
          if (typeof tb_remove === 'function') {
            tb_remove();
          } else {
            console.warn('tb_remove function not found. Thickbox might not close.');
          }

        } else {
          console.warn('Could not extract a valid asset URL from media picker output:', htmlContent);
          // If URL extraction failed, still close Thickbox if possible
          if (typeof tb_remove === 'function') {
            tb_remove();
          }
        }

        // Reset the target input ID to prevent accidental updates by subsequent media popups
        targetInputId = null;
      };

    } // End initMediaPicker

  }; // End assetManager Object

/*-----------------------------------------------------------------------------------*/
/* Initialize all asset management functionalities when the DOM is ready.
/*-----------------------------------------------------------------------------------*/

  jQry(function () { // Shorthand for jQry(document).ready()

    assetManager.handleAssetRemoval();
    assetManager.enhanceFileInputs();
    assetManager.initMediaPicker();

  });

})(jQuery);