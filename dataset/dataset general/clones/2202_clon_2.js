/*
	Content Editor Component v9.1.6
	Revised: October 16, 2013

	http://example.com/editor/

	Copyright (c) 2009-2013, Imperavi Corp.
	License: http://example.com/editor/license/

	Usage: $('#editableArea').contentEditor();
*/

(function(jq)
{
	var instanceIdentifierCounter = 0;

	"use strict"; // Strict mode for improved error handling and prevention of common pitfalls.

	/**
	 * Represents a segment of text within a selection.
	 * @param {object} segmentBounds - Object containing start and end offsets.
	 */
	var TextSegment = function(segmentBounds)
	{
		this.startIndex = segmentBounds.startOffset; // Starting position of the segment.
		this.endIndex = segmentBounds.endOffset;     // Ending position of the segment.

		this.originalSelection = segmentBounds; // Reference to the native range object.

		return this; // Allow chaining or direct assignment.
	};

	/**
	 * Checks if the text segment is empty (collapsed).
	 * @returns {boolean} True if the segment has no length, false otherwise.
	 */
	TextSegment.prototype.isEmpty = function()
	{
		return this.startIndex === this.endIndex; // Compare start and end offsets.
	};

	// jQuery Plugin Definition
	jq.fn.contentEditor = function(settingsObject)
	{
		var collectedResults = []; // Array to store return values from method calls.
		var supplementaryArguments = Array.prototype.slice.call(arguments, 1); // Get additional arguments.

		// Handle method calls as strings.
		if (typeof settingsObject === 'string')
		{
			this.each(function()
			{
				var editorComponent = jq.data(this, 'contentEditor'); // Retrieve existing editor instance.
				// Check if the instance exists and the method is callable.
				if (typeof editorComponent !== 'undefined' && jq.isFunction(editorComponent[settingsObject]))
				{
					var methodReturnValue = editorComponent[settingsObject].apply(editorComponent, supplementaryArguments); // Execute method.
					// Store result if it's not undefined and not the instance itself.
					if (methodReturnValue !== undefined && methodReturnValue !== editorComponent) collectedResults.push(methodReturnValue);
				}
				else return jq.error('No callable method "' + settingsObject + '" found for ContentEditor'); // Error if method not found.
			});
		}
		// Handle initialization with settings object.
		else
		{
			this.each(function()
			{
				// Initialize if no instance exists for this element.
				if (!jq.data(this, 'contentEditor')) jq.data(this, 'contentEditor', EditorComponent(this, settingsObject));
			});
		}

		// Return values based on collected results.
		if (collectedResults.length === 0) return this;      // No results, return the jQuery object.
		else if (collectedResults.length === 1) return collectedResults[0]; // Single result, return it directly.
		else return collectedResults;                           // Multiple results, return the array.
	};

	// Editor Component Initialization Function
	/**
	 * Factory function to create a new EditorComponent instance.
	 * @param {HTMLElement} targetNode - The DOM element to transform into an editor.
	 * @param {object} componentOptions - Configuration options for the editor.
	 * @returns {EditorComponent} A new instance of the EditorComponent.
	 */
	function EditorComponent(targetNode, componentOptions)
	{
		return new EditorComponent.prototype.initialize(targetNode, componentOptions); // Instantiate and return.
	}

	jq.EditorComponent = EditorComponent; // Expose EditorComponent globally via jQuery.
	jq.EditorComponent.RELEASE_VERSION = '9.1.6'; // Current version of the editor.
	jq.EditorComponent.defaultConfiguration = {

			// Core configuration parameters
			enableRangy: false, // Use Rangy library for selection management.

			useIframeMode: false,  // Render content within an iframe.
			fullPageEditing: false, // Enable full HTML page editing in iframe.
			customCssPath: false, // URL to a custom CSS file for iframe content.

			languageCode: 'en',     // Default language for the editor interface.
			textDirection: 'ltr', // Text direction: 'ltr' (left-to-right) or 'rtl' (right-to-left).

			displayPlaceholder: false, // Show a placeholder text when editor is empty.

			whatYouMean: false,     // WYM editing mode (deprecated/experimental).
			mobileFriendly: true,   // Optimize for mobile devices.
			enableCleanup: true,    // Perform content cleanup on paste/save.
			formatHtmlOutput: true, // Tidy up HTML output.
			pasteAsPlainText: false,// Paste content as plain text by default.
			removeEmptyHtmlTags: true, // Automatically remove empty HTML tags.
			allowTemplateVariables: false, // Support template variable syntax.
			generateXhtml: false,   // Output XHTML compliant code.

			visualMode: true,       // Start in visual editing mode.
			autoFocus: false,       // Automatically focus the editor on load.
			tabIndexValue: false,   // Set a custom tabindex for the editor.
			autoResizeHeight: true, // Automatically adjust editor height to content.
			minimumHeight: false,   // Set a minimum height for the editor.
			enableKeyboardShortcuts: true, // Enable editor keyboard shortcuts.

			autoSaveFeature: false, // URL for autosave endpoint or false to disable.
			autoSaveIntervalSeconds: 60, // Interval in seconds for autosaving.

			enabledPlugins: false, // Array of plugin names to load.

			allowLinkAnchors: true, // Allow inserting anchor links.
			allowEmailLinks: true,  // Allow inserting email links.
			defaultLinkProtocol: 'http://', // Default protocol for links.
			addLinkNofollow: false, // Add rel="nofollow" to links.
			maxLinkLength: 50,      // Maximum display length for link text.

			imageFloatMargin: '10px', // Margin around floated images.
			imageGalleryJsonUrl: false, // URL for fetching image gallery data (e.g., /folder/images.json).

			imageUploadEndpoint: false, // URL for image upload handler.
			imageUploadFieldName: 'file', // Name of the input field for image uploads.
			fileUploadEndpoint: false,  // URL for general file upload handler.
			fileUploadFieldName: 'file',  // Name of the input field for file uploads.
			clipboardImageUpload: true, // Allow image uploads from clipboard.
			clipboardUploadHandlerUrl: false, // URL for clipboard image upload handler.
			dragAndDropUpload: true,    // Allow drag-and-drop file uploads.

			dragAndDropImageTypes: ['image/png', 'image/jpeg', 'image/gif'], // Allowed image types for D&D.

			s3Integration: false,    // S3 upload configuration.
			additionalUploadFields: false, // Custom fields to send with uploads.

			monitorImages: true,    // Observe image changes.
			monitorLinks: true,     // Observe link changes.

			showModalOverlay: true, // Display an overlay when modals are open.

			tabSpaces: false,       // Use spaces instead of tabs, or a number for spaces.
			tabFocusEnabled: true,  // Allow tab key to move focus within editor.

			airToolbar: false,      // Enable air toolbar (contextual toolbar).
			airToolbarButtons: ['formatting', '|', 'bold', 'italic', 'deleted', '|', 'unorderedlist', 'orderedlist', 'outdent', 'indent'], // Buttons for air toolbar.

			displayToolbar: true,   // Show the main toolbar.
			fixedToolbar: false,    // Fix the toolbar position.
			fixedToolbarTarget: document, // Target element for fixed toolbar (e.g., document or a specific container).
			fixedToolbarTopOffset: 0, // Offset from the top for fixed toolbar.
			fixedToolbarEnclosure: false, // Constrain fixed toolbar within a box.
			externalToolbarId: false, // ID selector for an external toolbar container.
			showSourceButton: true, // Display HTML source code button.

			buttonSpacer: '<li class="editor_separator"></li>', // HTML for a button separator.

			customButtons: {},      // Custom toolbar buttons.
			additionalButtons: [],  // Buttons to add to the default set.
			defaultButtons: ['html', '|', 'formatting', '|', 'bold', 'italic', 'deleted', '|', 'unorderedlist', 'orderedlist', 'outdent', 'indent', '|', 'image', 'video', 'file', 'table', 'link', '|', 'alignment', '|', 'horizontalrule'], // Main toolbar buttons.

			activeStyleButtons: ['deleted', 'italic', 'bold', 'underline', 'unorderedlist', 'orderedlist', 'alignleft', 'aligncenter', 'alignright', 'justify', 'table'], // Buttons that show active state.
			activeStyleTagMapping: { // Map HTML tags to active style buttons.
				b: 'bold',
				strong: 'bold',
				i: 'italic',
				em: 'italic',
				del: 'deleted',
				strike: 'deleted',
				ul: 'unorderedlist',
				ol: 'orderedlist',
				u: 'underline',
				tr: 'table',
				td: 'table',
				table: 'table'
			},
			additionalActiveButtons: false, // Object, ex.: { tag: 'buttonName' }.

			allowedFormattingTags: ['p', 'blockquote', 'pre', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'], // Tags available in formatting dropdown.

			useLineBreaks: false,   // Use <br> for new lines instead of <p>.
			useParagraphTags: true, // Wrap content in <p> tags.
			convertDivsToParagraphs: true, // Convert <div> to <p> when appropriate.
			autoConvertLinks: true, // Automatically convert URLs to links.
			autoConvertImageLinks: false, // Automatically convert image URLs to img tags.
			autoConvertVideoLinks: false, // Automatically convert video URLs to video embeds.
			formatPreTags: false,   // Apply special formatting to <pre> tags.
			allowPhpTags: false,    // Allow PHP tags in HTML source.

			permittedTags: false, // Array of tags allowed in the editor.
			forbiddenTags: ['html', 'head', 'link', 'body', 'meta', 'script', 'style', 'applet'], // Tags to remove from content.

			boldHtmlTag: 'strong',  // Tag to use for bold text.
			italicHtmlTag: 'em',    // Tag to use for italic text.

			// Internal editor properties
			indentationValue: 20,   // Indentation value in pixels.
			undoBuffer: [],         // History buffer for undo operations.
			redoBuffer: [],         // History buffer for redo operations.
			isTextareaMode: false,  // Flag indicating if the editor is initialized on a textarea.
			emptyContentHtml: '<p>&#x200b;</p>', // HTML for an empty editor.
			zeroWidthSpace: '&#x200b;', // Zero-width space character.
			blockElementChecker: /^(P|H[1-6]|LI|ADDRESS|SECTION|HEADER|FOOTER|ASIDE|ARTICLE)$/i, // Regex to test for block elements.
			alignmentTargetTags: ['P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'DD', 'DL', 'DT', 'DIV', 'TD',
								'BLOCKQUOTE', 'OUTPUT', 'FIGCAPTION', 'ADDRESS', 'SECTION',
								'HEADER', 'FOOTER', 'ASIDE', 'ARTICLE'], // Tags that can be aligned.
			singleLineTags: ['area', 'body', 'head', 'hr', 'i?frame', 'link', 'meta', 'noscript', 'style', 'script', 'table', 'tbody', 'thead', 'tfoot'], // Tags that appear on their own line.
			continuousLineTags: ['li', 'dt', 'dt', 'h[1-6]', 'option', 'script'], // Tags that can continue on same line.
			newBlockLevelTags: ['blockquote', 'div', 'dl', 'fieldset', 'form', 'frameset', 'map', 'ol', 'p', 'pre', 'select', 'td', 'th', 'tr', 'ul'], // Tags that introduce a new block level.
			htmlBlockElements: ['P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'DD', 'DL', 'DT', 'DIV', 'LI',
								'BLOCKQUOTE', 'OUTPUT', 'FIGCAPTION', 'PRE', 'ADDRESS', 'SECTION',
								'HEADER', 'FOOTER', 'ASIDE', 'ARTICLE', 'TD'], // Comprehensive list of block elements.
			// Language definitions
			languages: {
				en: { // English language pack
					html: 'HTML Source',
					video: 'Embed Video',
					image: 'Insert Picture',
					table: 'Data Table',
					link: 'Add Link',
					link_insert: 'Insert Hyperlink',
					link_edit: 'Modify Hyperlink',
					unlink: 'Remove Link',
					formatting: 'Text Formatting',
					paragraph: 'Normal Paragraph',
					quote: 'Block Quote',
					code: 'Code Block',
					header1: 'Heading 1',
					header2: 'Heading 2',
					header3: 'Heading 3',
					header4: 'Heading 4',
					header5: 'Heading 5',
					bold: 'Bold Text',
					italic: 'Italic Text',
					fontcolor: 'Text Color',
					backcolor: 'Background Color',
					unorderedlist: 'Bulleted List',
					orderedlist: 'Numbered List',
					outdent: 'Decrease Indent',
					indent: 'Increase Indent',
					cancel: 'Cancel Action',
					insert: 'Confirm Insert',
					save: 'Save Changes',
					_delete: 'Delete Item',
					insert_table: 'New Table',
					insert_row_above: 'Add Row Above Current',
					insert_row_below: 'Add Row Below Current',
					insert_column_left: 'Add Column Left of Current',
					insert_column_right: 'Add Column Right of Current',
					delete_column: 'Remove Column',
					delete_row: 'Remove Row',
					delete_table: 'Destroy Table',
					rows: 'Number of Rows',
					columns: 'Number of Columns',
					add_head: 'Add Table Header',
					delete_head: 'Remove Table Header',
					title: 'Title Attribute',
					image_position: 'Image Alignment',
					none: 'No Alignment',
					left: 'Align Left',
					right: 'Align Right',
					image_web_link: 'Image URL',
					text: 'Link Text',
					mailto: 'Email Address',
					web: 'Web Address',
					video_html_code: 'Video Embed Code (HTML)',
					file: 'Insert File Link',
					upload: 'Upload File',
					download: 'Download File',
					choose: 'Select File',
					or_choose: 'Or select from library',
					drop_file_here: 'Drag and drop file here',
					align_left: 'Align Text Left',
					align_center: 'Center Text',
					align_right: 'Align Text Right',
					align_justify: 'Justify Text',
					horizontalrule: 'Insert Horizontal Line',
					deleted: 'Strikethrough',
					anchor: 'Insert Anchor',
					link_new_tab: 'Open link in new browser tab',
					underline: 'Underline Text',
					alignment: 'Text Alignment',
					filename: 'File Name (optional)',
					edit: 'Edit Content'
				}
			}
	};

	// Editor Component Methods (Prototype)
	jq.EditorComponent.prototype = {

		keyboardCodes: { // Key codes for common keyboard actions.
			BACKSPACE_KEY: 8,
			DELETE_KEY: 46,
			ARROW_DOWN_KEY: 40,
			ENTER_KEY: 13,
			ESCAPE_KEY: 27,
			TAB_KEY: 9,
			CONTROL_KEY: 17,
			META_KEY: 91,
			ARROW_LEFT_KEY: 37,
			WINDOWS_LEFT_KEY: 91
		},

		// Constructor for the EditorComponent.
		initialize: function(domNode, componentOptions)
		{
			this.richTextPasteActive = false; // Flag for rich text paste operations.
			this.$mainElement = this.$sourceElement = jq(domNode); // Store jQuery wrapped elements.
			this.instanceIdentifier = instanceIdentifierCounter++; // Assign a unique ID to this instance.

			// Create a deep clone of default options.
			var baseOptions = jq.extend(true, {}, jq.EditorComponent.defaultConfiguration);

			// Merge default, data-attributes, and custom options.
			this.currentSettings = jq.extend(
				{},
				baseOptions,
				this.$mainElement.data(), // Options from data attributes.
				componentOptions          // Options passed during initialization.
			);

			this.isStartingUp = true; // Flag for initial setup phase.
			this.menuCollections = []; // Array to hold dropdown menu references.

			// Retrieve original dimensions of the source element.
			this.originalHeight = this.$sourceElement.css('height');
			this.originalWidth = this.$sourceElement.css('width');

			// Adjust settings based on dependencies.
			if (this.currentSettings.fullPageEditing) this.currentSettings.useIframeMode = true;
			if (this.currentSettings.useLineBreaks) this.currentSettings.useParagraphTags = false;
			if (this.currentSettings.useParagraphTags) this.currentSettings.useLineBreaks = false;
			if (this.currentSettings.fixedToolbarEnclosure) this.currentSettings.fixedToolbar = true;

			// Aliases for document and window objects, potentially for iframe context.
			this.docRef = document;
			this.winRef = window;

			this.storedSelection = false; // Variable to store and restore selection ranges.

			// Regular expressions for HTML cleanup and structure.
			this.lineBreakPrePattern = new RegExp('^<(/?' + this.currentSettings.singleLineTags.join('|/?' ) + '|' + this.currentSettings.continuousLineTags.join('|') + ')[ >]');
			this.lineBreakPostPattern = new RegExp('^<(br|/?' + this.currentSettings.singleLineTags.join('|/?' ) + '|/' + this.currentSettings.continuousLineTags.join('|/') + ')[ >]');
			this.newBlockLevelPattern = new RegExp('^</?(' + this.currentSettings.newBlockLevelTags.join('|' ) + ')[ >]');

			// Regex to check if an element is a block-level element.
			this.blockElementTest = new RegExp('^(' + this.currentSettings.htmlBlockElements.join('|' ) + ')$', 'i');

			// Adjust formatting permissions based on line break settings.
			if (this.currentSettings.useLineBreaks === false)
			{
				// Ensure 'p' tag is allowed if line breaks are not used.
				if (this.currentSettings.permittedTags !== false && jq.inArray('p', this.currentSettings.permittedTags) === '-1') this.currentSettings.permittedTags.push('p');

				// Remove 'p' from denied tags if line breaks are not used.
				if (this.currentSettings.forbiddenTags !== false)
				{
					var elementIndex = jq.inArray('p', this.currentSettings.forbiddenTags);
					if (elementIndex !== '-1') this.currentSettings.forbiddenTags.splice(elementIndex, elementIndex);
				}
			}

			// Browser-specific adjustments (e.g., for IE and Opera).
			if (this.detectBrowser('msie') || this.detectBrowser('opera'))
			{
				this.currentSettings.defaultButtons = this.filterArrayValue(this.currentSettings.defaultButtons, 'horizontalrule'); // Remove horizontal rule button.
			}

			// Load the appropriate language pack.
			this.currentSettings.activeLanguage = this.currentSettings.languages[this.currentSettings.languageCode];

			// Begin the editor construction process.
			this.initiateBuildProcess();

		},
		/**
		 * Creates the default toolbar configuration based on the provided language pack.
		 * @param {object} languagePack - The language object containing translated strings.
		 * @returns {object} An object defining the toolbar buttons and their properties.
		 */
		createToolbarConfig: function(languagePack)
		{
			return {
				html:
				{
					title: languagePack.html,
					func: 'toggleSourceView'
				},
				formatting:
				{
					title: languagePack.formatting,
					func: 'showDropdown',
					dropdown:
					{
						paragraph:
						{
							title: languagePack.paragraph,
							func: 'applyBlockFormatting'
						},
						blockquote:
						{
							title: languagePack.quote,
							func: 'applyQuoteFormatting',
							className: 'editor_format_blockquote'
						},
						pre:
						{
							title: languagePack.code,
							func: 'applyBlockFormatting',
							className: 'editor_format_pre'
						},
						h1:
						{
							title: languagePack.header1,
							func: 'applyBlockFormatting',
							className: 'editor_format_h1'
						},
						h2:
						{
							title: languagePack.header2,
							func: 'applyBlockFormatting',
							className: 'editor_format_h2'
						},
						h3:
						{
							title: languagePack.header3,
							func: 'applyBlockFormatting',
							className: 'editor_format_h3'
						},
						h4:
						{
							title: languagePack.header4,
							func: 'applyBlockFormatting',
							className: 'editor_format_h4'
						},
						h5:
						{
							title: languagePack.header5,
							func: 'applyBlockFormatting',
							className: 'editor_format_h5'
						}
					}
				},
				bold:
				{
					title: languagePack.bold,
					exec: 'bold'
				},
				italic:
				{
					title: languagePack.italic,
					exec: 'italic'
				},
				deleted:
				{
					title: languagePack.deleted,
					exec: 'strikethrough'
				},
				underline:
				{
					title: languagePack.underline,
					exec: 'underline'
				},
				unorderedlist:
				{
					title: '&bull; ' + languagePack.unorderedlist,
					exec: 'insertunorderedlist'
				},
				orderedlist:
				{
					title: '1. ' + languagePack.orderedlist,
					exec: 'insertorderedlist'
				},
				outdent:
				{
					title: '< ' + languagePack.outdent,
					func: 'decreaseIndentation'
				},
				indent:
				{
					title: '> ' + languagePack.indent,
					func: 'increaseIndentation'
				},
				image:
				{
					title: languagePack.image,
					func: 'showImageModal'
				},
				video:
				{
					title: languagePack.video,
					func: 'showVideoModal'
				},
				file:
				{
					title: languagePack.file,
					func: 'showFileModal'
				},
				table:
				{
					title: languagePack.table,
					func: 'showDropdown',
					dropdown:
					{
						insert_table:
						{
							title: languagePack.insert_table,
							func: 'showTableModal'
						},