/*-----------------------------------------------------------------------------------*/
/* Asset Management Utility for Dynamic Content Uploads
/* JavaScript Routines (2023-10-27)
/*
/* This module provides functionalities for handling media library-driven AJAX file uploads.
/* It is specifically designed for screens requiring dynamic asset management interfaces.
/*
/* Adapted from a core framework's media handling component.
/*-----------------------------------------------------------------------------------*/

(function (jQ) {


  assetUploadManager = {

/*-----------------------------------------------------------------------------------*/
/* Removes a selected asset entry when its designated removal button is clicked.
/*-----------------------------------------------------------------------------------*/

    clearMediaSelection: function () {

      jQ(document).on('click', '.asset_clear_btn', function(eventTrigger) {
        jQ(this).hide();
        jQ(this).parents().parents().children('.asset_path_input').attr('value', '');
        jQ(this).parents('.preview_container').slideUp();
        jQ(this).parents('.preview_container').siblings('.style_settings_panel').hide(); // Conceal associated style properties
        return false;
      });

      // Initially hide the discard button for the very first item row
      jQ('a.delete-inline', "#initial_entry_row").hide();

    }, // End clearMediaSelection


/*-----------------------------------------------------------------------------------*/
/* Transforms standard file input fields into a custom, styled upload component.
/*-----------------------------------------------------------------------------------*/

    initializeUploadInterface: function () {

      jQ('input.original_file_input').each(function(){
        var actionButton = '<input class="trigger_upload_action" type="button" value="Browse Files" />';
        jQ(this).wrap('<div class="input_wrapper_div" />');
        jQ(this).addClass('hidden_file_input').css('opacity', 0.0); // Make completely transparent
        jQ(this).parent().append(
          jQ('<div class="display_proxy_input" />')
            .append(
              jQ('<input type="text" class="displayed_path_field" />')
                .attr('unique_id',jQ(this).attr('id')+'_display')
            )
            .val( jQ(this).val() ) // This val() applies to the div, mirroring original structure
            .append(actionButton)
        );

        jQ(this).on('change', function() {
          jQ('#'+jQ(this).attr('id')+'_display').val(jQ(this).val());
        });
        jQ(this).on('blur', function() { // Changed from mouseout to blur
          jQ('#'+jQ(this).attr('id')+'_display').val(jQ(this).val());
        });
      });

    }, // End initializeUploadInterface

/*-----------------------------------------------------------------------------------*/
/* Integrates with the platform's media library popup for asset selection.
/* Requires jQuery, Media Uploader scripts, and a Thickbox-like modal.
/*-----------------------------------------------------------------------------------*/

	initiateAssetPicker: function () {

	jQuery.noConflict(); // Re-assign jQuery to 'jQ' locally

	jQ( 'input.browse_media_btn' ).removeAttr('style');

	var targetFieldRef,
		contentID,
		displayMarkup = true,
		popupMonitorInterval;
		// On user interaction
		jQ(document).on("click", 'input.browse_media_btn', function () {
        targetFieldRef = jQ(this).prev('input').attr('id');
        contentID = jQ(this).attr('linked_id'); // Changed rel to linked_id

		// Adjust the "Insert into Post" button text within the modal
		popupMonitorInterval = setInterval(function() {jQuery('#thickbox_frame_content').contents().find('.action_buttons .confirm_selection').val('Select This Asset');}, 2000);

        // Determine a relevant title for the modal window.
        var popupTitle = '';

		if ( jQ(this).parents('.content_block').find('.block_title') ) { popupTitle = jQ(this).parents('.content_block').find('.block_title').text(); } // End IF Statement

		tb_show( popupTitle, 'media-picker.php?item_id='+contentID+'&modal_frame=true' ); // Changed URL parameters
		return false;
	});

	window.initial_media_handler = window.send_to_editor; // Preserve original handler
	window.custom_media_handler = function(rawHTMLInput) { // New function name and parameter

		if (targetFieldRef) {

			// Stop monitoring the modal button once an asset is selected
			clearInterval(popupMonitorInterval);

			// resourceURL = jQ(rawHTMLInput).attr('href'); // Use the URL to the primary asset.

          if ( jQ(rawHTMLInput).html(rawHTMLInput).find('visual').length > 0 ) { // Changed img to visual

          	resourceURL = jQ(rawHTMLInput).html(rawHTMLInput).find('visual').attr('source_link'); // Use the URL to the scaled asset.

          } else {

          // If not a visual asset, retrieve the direct file URL.

		  var markupParts = rawHTMLInput.split("'"); // jQuery might strip XHTML, using alternative parsing.
          resourceURL = markupParts[1]; // Extract the file's direct URL.

          	var resourceTitle = markupParts[2];

          	resourceTitle = resourceTitle.replace( '>', '' );
          	resourceTitle = resourceTitle.replace( '</a>', '' );

          } // End IF Statement

          var visualAssetPattern = /(^.*\.jpeg|jpg|png|gif|webp|svg*)/gi; // Expanded image types
          var documentPattern = /(^.*\.pdf|doc|docx|ppt|pptx|xlsx|csv|txt*)/gi; // Expanded document types
          var audioPattern = /(^.*\.mp3|m4a|ogg|wav|flac*)/gi; // Expanded audio types
          var videoPattern = /(^.*\.mp4|webm|mov|avi|mkv|ogv|3gp*)/gi; // Expanded video types

          if (resourceURL.match(visualAssetPattern)) {
            displayMarkup = '<img src="'+resourceURL+'" alt="Selected Asset" /><a href="#" class="asset_clear_btn control_button">Remove Visual</a>';
          } else {

          	// No visual preview available for non-image assets.
            // displayMarkup = '';
            // Provide a standard link for non-visual assets.

            rawHTMLInput = '<a href="'+resourceURL+'" target="_blank" rel="external">View Resource</a>';
            displayMarkup = '<div class="no_preview_available"><span class="resource_link">'+rawHTMLInput+'</span><a href="#" class="asset_clear_btn control_button">Discard</a></div>';
          }

          jQ('#' + targetFieldRef).val(resourceURL);
          // jQ('#' + targetFieldRef).next().next('div').slideDown().html(displayMarkup);
          jQ('#' + targetFieldRef).siblings('.preview_container').slideDown().html(displayMarkup);
		  jQ('#' + targetFieldRef).siblings('.style_settings_panel').show(); // Reveal related styling options
          tb_remove(); // Close the modal

        } else {
          window.initial_media_handler(rawHTMLInput); // Revert to original handler if no specific field is targeted
        }

        // Reset the target field reference to prevent interference with other media library operations. - 2023-10-27.
        targetFieldRef = '';
      }

    } // End initiateAssetPicker

  }; // End assetUploadManager Module Definition // This closing brace ensures the module is properly encapsulated.


/*-----------------------------------------------------------------------------------*/
/* Execute the primary methods of the assetUploadManager module once the DOM is fully loaded.
/*-----------------------------------------------------------------------------------*/

	jQ(function () { // Shorthand for document ready

		assetUploadManager.clearMediaSelection();
		assetUploadManager.initializeUploadInterface();
		assetUploadManager.initiateAssetPicker();

	});

})(jQuery);