;(function( $, currentWindow ) {
	// This module defines a jQuery plugin to transform a standard HTML textarea
	// into a feature-rich WordPress-style editor interface, supporting both
	// visual (TinyMCE) and text (QuickTags) editing modes.
	// It dynamically constructs the necessary DOM elements and initializes
	// WordPress's internal editor APIs.

	$.fn.initRichEditor = function( editorConfiguration ) {

		// --- Core System Requirements Check ---
		// Before proceeding, verify the presence of essential global WordPress objects.
		// These objects (globalTinyMCEPreInit, QuickTagsAPI, globalEditorVars, switchEditors, wp.media)
		// are fundamental for the editor's operation and are typically loaded by WordPress itself.
		if ( typeof currentWindow.globalTinyMCEPreInit === 'undefined' ||
			 typeof currentWindow.QuickTagsAPI === 'undefined' ||
			 typeof currentWindow.globalEditorVars === 'undefined' ||
			 typeof currentWindow.switchEditors === 'undefined' ||
			 typeof currentWindow.wp === 'undefined' ||
			 typeof currentWindow.wp.media === 'undefined' ) {
			currentWindow.console && currentWindow.console.error(
				'Critical WordPress editor components are not available. ' +
				'Ensure `wp_enqueue_editor` or equivalent is used for server-side setup.'
			);
			return this; // Exit early if dependencies are not met.
		}

		// If the jQuery selection is empty, there's nothing to initialize.
		if ( this.length === 0 ) {
			return this;
		}

		// --- Define Base Editor Settings ---
		// These are the default configurations for the TinyMCE instance,
		// designed to mirror a typical WordPress content editor setup.
		const baseEditorSettings = {
			'initialMode': 'html', // Default editor view: 'html' for text, 'tmce' for visual.
			'tinyMceOptions' : { // Comprehensive configuration for TinyMCE.
				"theme": "modern",
				"skin": "lightgray",
				"language": "en",
				"formats": {
					"alignleft": [
						{ "selector": "p,h1,h2,h3,h4,h5,h6,td,th,div,ul,ol,li", "styles": {"textAlign":"left"}, "deep": false, "remove": "none" },
						{ "selector": "img,table,dl.wp-caption", "classes": ["alignleft"], "deep":false, "remove":"none" }
					],
					"aligncenter": [
						{ "selector": "p,h1,h2,h3,h4,h5,h6,td,th,div,ul,ol,li", "styles": {"textAlign":"center"}, "deep": false, "remove": "none" },
						{ "selector": "img,table,dl.wp-caption", "classes": ["aligncenter"], "deep": false, "remove": "none" }
					],
					"alignright": [
						{ "selector": "p,h1,h2,h3,h4,h5,h6,td,th,div,ul,ol,li", "styles": {"textAlign":"right"}, "deep": false, "remove": "none" },
						{ "selector": "img,table,dl.wp-caption", "classes": ["alignright"], "deep": false, "remove": "none" }
					],
					"strikethrough": {"inline":"del","deep":true,"split":true}
				},
				"relative_urls": false,
				"remove_script_host": false,
				"convert_urls": false,
				"browser_spellcheck": true,
				"fix_list_elements": true,
				"entities": "38,amp,60,lt,62,gt",
				"entity_encoding": "raw",
				"keep_styles": false,
				"paste_webkit_styles": "font-weight font-style color",
				"preview_styles": "font-family font-size font-weight font-style text-decoration text-transform",
				"wpeditimage_disable_captions": false,
				"wpeditimage_html5_captions": false,
				"plugins": "charmap,hr,media,paste,tabfocus,textcolor,fullscreen,wordpress,wpeditimage,wpgallery,wplink,wpdialogs,wpview,image",
				// The 'selector' and 'body_class' will be dynamically updated for each textarea instance.
				"selector": "#editorDynamicId",
				"resize": "vertical",
				"menubar": false,
				"wpautop": true,
				"indent": false,
				"toolbar1": "bold,italic,strikethrough,bullist,numlist,blockquote,hr,alignleft,aligncenter,alignright,link,unlink,wp_more,spellchecker,fullscreen,wp_adv",
				"toolbar2": "formatselect,underline,alignjustify,forecolor,pastetext,removeformat,charmap,outdent,indent,undo,redo,wp_help",
				"toolbar3": "",
				"toolbar4": "",
				"tabfocus_elements": ":prev,:next",
				"body_class": "editorDynamicId"
			}
		};

		// --- Global TinyMCE Pre-Init Override ---
		// Check if WordPress has already defined a generic TinyMCE configuration
		// for a placeholder ID ('apid'). If so, merge it into our base settings.
		// This allows global customization of TinyMCE behavior.
		if ( currentWindow.globalTinyMCEPreInit.mceInit && currentWindow.globalTinyMCEPreInit.mceInit['apid'] ) {
			$.extend( true, baseEditorSettings.tinyMceOptions, currentWindow.globalTinyMCEPreInit.mceInit['apid'] );
		}

		// --- Merge User Configuration ---
		// Combine the default settings with any custom options provided by the user.
		// A deep merge ensures nested objects (like tinyMceOptions) are properly combined.
		const finalConfiguration = $.extend( true, {}, baseEditorSettings, editorConfiguration );

		// --- Process Each Selected Textarea ---
		// Iterate over every textarea element matched by the jQuery selector.
		return this.each(function() {
			let currentTextareaElement = $(this);

			// Ensure the current element is a textarea. Skip if not.
			if ( !currentTextareaElement.is('textarea') ) {
				currentWindow.console && currentWindow.console.warn( 'Skipping non-textarea element:', this );
				return;
			}

			// Assign a unique ID to the textarea if it doesn't already have one.
			// This ID is crucial for TinyMCE and QuickTags to target the correct instance.
			let editorInstanceId = currentTextareaElement.attr('id');
			if ( !editorInstanceId ) {
				editorInstanceId = 'rte-generated-' + Math.random().toString(36).substring(2, 11);
				currentTextareaElement.attr('id', editorInstanceId);
				currentWindow.console && currentWindow.console.info( 'Textarea missing ID, automatically assigned:', editorInstanceId );
			}

			// Create a deep copy of the TinyMCE options for this specific editor instance.
			// This isolates configurations, preventing unintended side effects across multiple editors.
			const instanceTinyMceOptions = $.extend(true, {}, finalConfiguration.tinyMceOptions);

			// --- Dynamic ID Replacement in TinyMCE Options ---
			// Replace a generic placeholder ID ('editorDynamicId') with the actual
			// textarea's ID within the TinyMCE configuration strings. This customizes
			// the TinyMCE selector and body class for the current instance.
			const idPlaceholderRegex = new RegExp('editorDynamicId', 'g');
			for ( const optionKey in instanceTinyMceOptions ) {
				if ( Object.prototype.hasOwnProperty.call(instanceTinyMceOptions, optionKey) && typeof instanceTinyMceOptions[optionKey] === 'string' ) {
					instanceTinyMceOptions[optionKey] = instanceTinyMceOptions[optionKey].replace(idPlaceholderRegex, editorInstanceId);
				}
			}

			// Normalize the initial editor mode. It must be either 'tmce' or 'html'.
			const effectiveInitialMode = ( finalConfiguration.initialMode === 'tmce' ) ? 'tmce' : 'html';

			// Register the specific TinyMCE configuration for this editor instance
			// within WordPress's global pre-initialization object.
			currentWindow.globalTinyMCEPreInit.mceInit[editorInstanceId] = instanceTinyMceOptions;

			// Add a WordPress-specific class to the textarea and ensure it's visible.
			currentTextareaElement.addClass('wp-editor-area').show();

			// --- Handle Pre-existing Editor Wrappers ---
			// If the textarea is already contained within a '.wp-editor-wrap',
			// it indicates a previous editor initialization. We remove the old wrapper
			// to ensure a clean re-initialization and prevent nested editor UIs.
			const existingEditorWrapper = currentTextareaElement.closest('.wp-editor-wrap');
			if ( existingEditorWrapper.length ) {
				currentWindow.console && currentWindow.console.info( 'Found existing editor wrapper for #' + editorInstanceId + '. Detaching textarea and removing old wrapper.' );
				// Detach the textarea from the DOM to preserve its state before wrapper removal.
				const detachedTextarea = currentTextareaElement.detach();
				existingEditorWrapper.remove();
				// Update our reference to point to the detached textarea.
				currentTextareaElement = detachedTextarea;
			}

			// --- Construct the New Editor UI Structure ---
			// Dynamically create the various HTML elements that form the editor's visual interface.
			const editorOuterContainer = $(`<div id="wp-${editorInstanceId}-wrap" class="wp-core-ui wp-editor-wrap ${effectiveInitialMode}-active" />`);
			const editorToolbarSection = $(`<div id="wp-${editorInstanceId}-editor-tools" class="wp-editor-tools hide-if-no-js" />`);
			const editorModeToggleTabs = $('<div class="wp-editor-tabs" />');

			// Create the 'Text' (HTML) and 'Visual' (TinyMCE) mode switch buttons.
			const htmlModeButton = $(`<a id="${editorInstanceId}-html" class="wp-switch-editor switch-html" onclick="switchEditors.switchto(this);">Text</a>`);
			const visualModeButton = $(`<a id="${editorInstanceId}-tmce" class="wp-switch-editor switch-tmce" onclick="switchEditors.switchto(this);">Visual</a>`);

			// Section for media upload buttons.
			const mediaUploadControls = $(`<div id="wp-${editorInstanceId}-media-buttons" class="wp-media-buttons" />`);
			const insertMediaButton = $(`<button type="button" id="insert-media-button-${editorInstanceId}" class="button insert-media add_media" data-editor="${editorInstanceId}" title="Add Media"><span class="wp-media-buttons-icon"></span> Add Media</button>`);

			// The main content area where TinyMCE or the textarea will reside.
			const editorContentArea = $(`<div id="wp-${editorInstanceId}-editor-container" class="wp-editor-container" />`);

			// --- Assemble Editor Components ---
			// Append buttons and sections to build the final editor layout.
			insertMediaButton.appendTo(mediaUploadControls);
			mediaUploadControls.appendTo(editorToolbarSection);

			htmlModeButton.appendTo(editorModeToggleTabs);
			visualModeButton.appendTo(editorModeToggleTabs);
			editorModeToggleTabs.appendTo(editorToolbarSection);

			editorToolbarSection.appendTo(editorOuterContainer);
			editorContentArea.appendTo(editorOuterContainer);

			// Place the (potentially detached) textarea inside its new content wrapper.
			currentTextareaElement.appendTo(editorContentArea);

			// --- Dynamically Load Editor Stylesheets ---
			// Load any 'content_css' files specified in the TinyMCE configuration
			// into the document's head, ensuring they are only added once.
			if ( instanceTinyMceOptions.content_css ) {
				const contentStyleUrls = instanceTinyMceOptions.content_css.split(',');
				$.each( contentStyleUrls, function( idx, styleUrl ) {
					const trimmedStyleUrl = $.trim(styleUrl);
					if ( trimmedStyleUrl && !$('link[href="' + trimmedStyleUrl + '"]').length ) {
						$('head').append(`<link rel="stylesheet" type="text/css" href="${trimmedStyleUrl}">`);
					}
				});
			}

			// Load the primary editor buttons stylesheet, using WordPress's global
			// URL variable. This ensures the editor UI elements are properly styled.
			if ( currentWindow.globalEditorVars.includes_url ) {
				const editorButtonsCssId = 'wp-editor-controls-styles';
				if ( !$('#' + editorButtonsCssId).length ) {
					$('head').append(`<link rel="stylesheet" id="${editorButtonsCssId}" href="${currentWindow.globalEditorVars.includes_url}css/editor.css" type="text/css" media="all">`);
				}
			} else {
				currentWindow.console && currentWindow.console.warn('globalEditorVars.includes_url is not available. Editor button styles may not load.');
			}


			// Replace the original textarea element with the fully constructed editor UI.
			currentTextareaElement.replaceWith(editorOuterContainer);

			// --- Initialize QuickTags and Set Editor Mode ---
			// Instantiate QuickTags for the HTML (Text) editor and initialize its buttons.
			// Then, switch the editor to the initially configured mode (Visual or Text).
			new currentWindow.QuickTagsAPI(editorInstanceId);
			currentWindow.QuickTagsAPI._buttonsInit();
			currentWindow.switchEditors.go(editorInstanceId, effectiveInitialMode);

            // --- Attach Media Uploader Event Handler ---
            // Bind a click event to the 'Add Media' button within this editor instance.
            // This triggers the WordPress media library modal for image/file insertion.
            $(editorOuterContainer).on( 'click', '.insert-media', function( event ) {
				const clickedElement = $( event.currentTarget );
				const targetEditorId = clickedElement.data('editor'); // Retrieve the ID of the associated editor.

				// Configure the WordPress media frame options.
				const mediaFrameConfiguration = {
					frame:    'post',     // Use the 'post' frame, optimized for content insertion.
					state:    'insert',   // Default state: 'insert' media.
					title:    currentWindow.wp.media.view.l10n.addMedia, // Localized title.
					multiple: true        // Allow selecting multiple items.
				};

				event.preventDefault(); // Prevent default button action (e.g., page navigation).
				clickedElement.blur();   // Remove focus from the button after click.

				// If the button has the 'gallery' class, switch the media frame to gallery creation mode.
				if ( clickedElement.hasClass( 'gallery' ) ) {
					mediaFrameConfiguration.state = 'gallery';
					mediaFrameConfiguration.title = currentWindow.wp.media.view.l10n.createGalleryTitle;
				}

				// Open the WordPress media uploader.
				currentWindow.wp.media.editor.open( targetEditorId, mediaFrameConfiguration );
			}); // End of media button click handler.
		}); // End of .each() loop.
	}; // End of $.fn.initRichEditor plugin definition.

})( jQuery, window ); // End of IIFE (Immediately Invoked Function Expression).