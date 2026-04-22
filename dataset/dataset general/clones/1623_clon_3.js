/*
	Content Composer Pro v1.0.0
	Last Modified: April 15, 2024

	https://example.com/content-composer/

	Copyright (c) 2023-2024, ACME Corp.
	Licensing: https://example.com/content-composer/license/

	Usage Example: $('#editorArea').markupComposer();
*/

(function($)
{
	let componentIdCounter = 0; // Unique identifier for each editor instance

	"use strict"; // Enforce strict mode for better code quality

	/**
	 * Represents a normalized text selection range.
	 * @param {Range} nativeDomRange - The browser's native Range object.
	 */
	const TextSelectionBounds = function(nativeDomRange)
	{
		// Store start and end offsets directly as properties
		this.startOffset = nativeDomRange.startOffset;
		this.endOffset = nativeDomRange.endOffset;

		// Keep a reference to the original DOM Range object
		this.originalRange = nativeDomRange;

		return this;
	};

	TextSelectionBounds.prototype.isCollapsed = function()
	{
		// Check if the selection start and end points are identical
		return this.startOffset === this.endOffset;
	};

	// jQuery Plugin Interface
	$.fn.markupComposer = function(operationOrSettings)
	{
		const accumulatedResults = []; // Stores return values from method calls
		const invocationArguments = Array.prototype.slice.call(arguments, 1);

		if (typeof operationOrSettings === 'string')
		{
			// If the first argument is a string, it's a method call
			this.each(function()
			{
				const editorInstance = $.data(this, 'composerInstance');
				if (editorInstance && typeof editorInstance[operationOrSettings] === 'function')
				{
					const methodOutcome = editorInstance[operationOrSettings].apply(editorInstance, invocationArguments);
					// Collect results if they are meaningful and not just the instance itself
					if (methodOutcome !== undefined && methodOutcome !== editorInstance) {
						accumulatedResults.push(methodOutcome);
					}
				}
				else
				{
					// Throw an error if the method doesn't exist or instance is not initialized
					$.error('Composer: Method "' + operationOrSettings + '" does not exist or instance not found.');
					return false; // Stop iterating
				}
			});
		}
		else
		{
			// Otherwise, it's an initialization call
			this.each(function()
			{
				// Prevent re-initialization on the same element
				if (!$.data(this, 'composerInstance')) {
					$.data(this, 'composerInstance', new RichContentEditor(this, operationOrSettings));
				}
			});
		}

		// Handle return values based on the number of collected results
		if (accumulatedResults.length === 0) {
			return this; // Return the jQuery object for chaining
		} else if (accumulatedResults.length === 1) {
			return accumulatedResults[0]; // Return the single result directly
		} else {
			return accumulatedResults; // Return an array of results
		}
	};

	// Core Editor Functionality
	function RichContentEditor(targetElement, userSettings)
	{
		return new RichContentEditor.prototype.init(targetElement, userSettings);
	}

	$.RichContentEditor = RichContentEditor;
	$.RichContentEditor.BUILD_VERSION = '1.0.0'; // Publicly accessible version string
	$.RichContentEditor.globalDefaults = {

			// Core Configuration
			enableRangyJs: false,
			useIframeMode: false,
			fullPageEditing: false, // Requires useIframeMode: true
			customCssUrl: false, // URL to an external stylesheet for iframe content

			locale: 'en', // Language code (e.g., 'en', 'fr', 'de')
			textDirection: 'ltr', // 'ltr' or 'rtl'

			placeholderText: false, // Text to display when editor is empty

			wysiwygMode: true, // What you see is what you get
			responsiveMobile: true,
			autoCleanupHtml: true,
			formatHtmlOutput: true, // Tidy up generated HTML
			pasteAsPlainText: false,
			removeEmptyMarkupTags: true,
			enableTemplateVariables: false,
			outputXhtmlCompliant: false,

			// Editor Behavior
			initialFocus: false, // Focus editor on load
			tabIndexValue: false, // Custom tabindex for accessibility
			autoResizeHeight: true,
			minimumEditorHeight: false, // e.g., '200px'
			maximumEditorHeight: false, // e.g., '600px'
			enableKeyboardShortcuts: true,

			// Data Management
			autoSaveUrl: false, // URL for autosaving content
			autoSaveIntervalSeconds: 60, // Frequency of autosave

			// Plugin Integration
			activePlugins: false, // Array of plugin names or objects

			// Link Handling
			allowAnchorLinks: true,
			allowEmailLinks: true,
			defaultLinkProtocol: 'http://',
			addNofollowToLinks: false,
			maxLinkTextLength: 50,

			// Image Handling
			imageFloatMarginCss: '10px',
			imageGalleryJsonUrl: false, // URL to fetch image list (e.g., /api/images.json)

			imageUploadEndpoint: false, // URL for image uploads
			imageUploadFieldName: 'file', // Form field name for image file
			fileUploadEndpoint: false, // URL for generic file uploads
			fileUploadFieldName: 'file', // Form field name for generic file
			clipboardImageUpload: true,
			clipboardUploadTargetUrl: false, // URL for clipboard image uploads
			dragAndDropUpload: true,

			permittedDnDImageTypes: ['image/png', 'image/jpeg', 'image/gif'],

			s3UploadConfiguration: false, // S3 bucket details for direct uploads
			additionalUploadFields: false, // Custom data to send with uploads

			// Content Observation
			observeEmbeddedImages: true,
			observeEmbeddedLinks: true,

			// UI/UX
			modalOverlayVisible: true, // Show overlay when modals are open

			// Tab Behavior
			tabKeySpaces: false, // true for 4 spaces, or a number for custom spaces
			tabKeyFocusNext: true, // Allow tab to move focus out of editor

			// Air Toolbar (Contextual Toolbar)
			enableAirToolbar: false,
			airToolbarButtons: ['textFormat', '|', 'bold', 'italic', 'strike', '|', 'unorderedList', 'orderedList', 'indentLeft', 'indentRight'],

			// Main Toolbar
			showMainToolbar: true,
			fixedToolbar: false,
			fixedToolbarScrollTarget: document, // Element to monitor for scroll
			fixedToolbarTopOffset: 0, // Pixels from top
			fixedToolbarContainer: false, // If toolbar should be appended to a specific element
			externalToolbarSelector: false, // ID selector for an external toolbar container
			showHtmlSourceButton: true,

			toolbarButtonSeparator: '<li class="editor_toolbar_separator"></li>',

			customToolbarButtons: {},
			additionalToolbarButtons: [],
			defaultToolbarButtons: ['source', '|', 'textFormat', '|', 'bold', 'italic', 'strike', '|', 'unorderedList', 'orderedList', 'indentLeft', 'indentRight', '|', 'insertImage', 'insertVideo', 'insertFile', 'insertTable', 'insertLink', '|', 'textAlignment', '|', 'horizontalLine'], // 'underline', 'alignLeft', 'alignCenter', 'alignRight', 'justify'

			// Active State Buttons
			activeStyleButtons: ['strike', 'italic', 'bold', 'underline', 'unorderedList', 'orderedList', 'alignLeft', 'alignCenter', 'alignRight', 'justify', 'table'],
			activeButtonTagMapping: {
				b: 'bold',
				strong: 'bold',
				i: 'italic',
				em: 'italic',
				del: 'strike',
				strike: 'strike',
				ul: 'unorderedList',
				ol: 'orderedList',
				u: 'underline',
				tr: 'table',
				td: 'table',
				table: 'table'
			},
			additionalActiveButtons: false, // object, ex.: { tag: 'buttonName' }

			// Formatting Options
			supportedFormattingTags: ['p', 'blockquote', 'pre', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'],

			useLineBreaks: false, // Use <br> for new lines
			useParagraphs: true, // Use <p> for new lines
			convertDivsToParagraphs: true,
			autoConvertLinks: true,
			autoConvertImageLinks: false,
			autoConvertVideoLinks: false,
			preservePreFormatting: false,
			allowPhpTags: false,

			// HTML Filtering
			allowedHtmlTags: false, // Array of tags
			deniedHtmlTags: ['html', 'head', 'link', 'body', 'meta', 'script', 'style', 'applet'], // Tags to always remove

			boldMarkupTag: 'strong', // Tag to use for bold text
			italicMarkupTag: 'em', // Tag to use for italic text

			// Internal Properties
			indentationPixelValue: 20,
			undoBuffer: [],
			redoBuffer: [],
			isTextareaMode: false,
			defaultEmptyContent: '<p>&#x200b;</p>',
			nonBreakingSpaceChar: '&#x200b;',
			blockElementTestRegex: /^(P|H[1-6]|LI|ADDRESS|SECTION|HEADER|FOOTER|ASIDE|ARTICLE)$/i,
			alignmentApplicableTags: ['P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'DD', 'DL', 'DT', 'DIV', 'TD',
								'BLOCKQUOTE', 'OUTPUT', 'FIGCAPTION', 'ADDRESS', 'SECTION',
								'HEADER', 'FOOTER', 'ASIDE', 'ARTICLE'],
			selfClosingTags: ['area', 'body', 'head', 'hr', 'i?frame', 'link', 'meta', 'noscript', 'style', 'script', 'table', 'tbody', 'thead', 'tfoot'],
			inlineBlockTags: ['li', 'dt', 'dt', 'h[1-6]', 'option', 'script'],
			newBlockLevelTags: ['blockquote', 'div', 'dl', 'fieldset', 'form', 'frameset', 'map', 'ol', 'p', 'pre', 'select', 'td', 'th', 'tr', 'ul'],
			allBlockElements: ['P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'DD', 'DL', 'DT', 'DIV', 'LI',
								'BLOCKQUOTE', 'OUTPUT', 'FIGCAPTION', 'PRE', 'ADDRESS', 'SECTION',
								'HEADER', 'FOOTER', 'ASIDE', 'ARTICLE', 'TD'],
			// Localization Data
			localeData: {
				en: {
					source: 'HTML Source',
					video: 'Embed Video',
					image: 'Insert Image',
					table: 'Table',
					link: 'Hyperlink',
					link_insert: 'Insert Link',
					link_edit: 'Modify Link',
					unlink: 'Remove Link',
					textFormat: 'Text Formatting',
					paragraph: 'Normal Paragraph',
					quote: 'Blockquote',
					code: 'Code Block',
					header1: 'Heading 1',
					header2: 'Heading 2',
					header3: 'Heading 3',
					header4: 'Heading 4',
					header5: 'Heading 5',
					bold: 'Bold Text',
					italic: 'Italic Text',
					fontcolor: 'Font Color',
					backcolor: 'Highlight Color',
					unorderedList: 'Bulleted List',
					orderedList: 'Numbered List',
					indentLeft: 'Decrease Indent',
					indentRight: 'Increase Indent',
					cancel: 'Cancel',
					insert: 'Insert',
					save: 'Save',
					delete: 'Delete',
					insert_table: 'Insert Table',
					insert_row_above: 'Add Row Above',
					insert_row_below: 'Add Row Below',
					insert_column_left: 'Add Column Left',
					insert_column_right: 'Add Column Right',
					delete_column: 'Delete Column',
					delete_row: 'Delete Row',
					delete_table: 'Delete Table',
					rows: 'Rows',
					columns: 'Columns',
					add_head: 'Add Table Header',
					delete_head: 'Delete Table Header',
					title: 'Title',
					image_position: 'Image Position',
					none: 'None',
					left: 'Left',
					right: 'Right',
					image_web_link: 'Image URL',
					text: 'Text',
					mailto: 'Email Address',
					web: 'Web URL',
					video_html_code: 'Video Embed Code',
					file: 'Insert File',
					upload: 'Upload',
					download: 'Download',
					choose: 'Choose',
					or_choose: 'Or select from device',
					drop_file_here: 'Drop file here to upload',
					align_left: 'Align Left',
					align_center: 'Align Center',
					align_right: 'Align Right',
					align_justify: 'Justify',
					horizontalLine: 'Insert Horizontal Line',
					strike: 'Strikethrough',
					anchor: 'Anchor Name',
					link_new_tab: 'Open link in new tab',
					underline: 'Underline',
					textAlignment: 'Text Alignment',
					filename: 'File Name (optional)',
					edit: 'Edit'
				}
			},
			// New options added
			maxImageWidth: 800, // Maximum width for images inserted
			enableDarkTheme: false // Option to toggle dark theme for editor UI
	};

	// Editor Prototype Methods
	RichContentEditor.prototype = {

		keyboardKeyCodes: {
			BACKSPACE: 8,
			DELETE: 46,
			ARROW_DOWN: 40,
			ENTER: 13,
			ESCAPE: 27,
			TAB: 9,
			CONTROL: 17,
			META_KEY: 91, // Command key on Mac, Windows key on Windows
			ARROW_LEFT: 37,
			WINDOWS_KEY: 91
		},

		/**
		 * Initializes a new editor instance.
		 * @param {HTMLElement} el - The DOM element to convert into an editor.
		 * @param {object} options - User-provided configuration options.
		 */
		init: function(el, options)
		{
			this.isPastingRTEContent = false; // Flag to track rich text paste operations
			this.$targetElement = this.$originalSource = $(el); // jQuery wrapped target element
			this.instanceId = componentIdCounter++; // Assign a unique ID

			// Deep clone default options and merge with element data and user options
			const mergedConfig = $.extend(true, {}, $.RichContentEditor.globalDefaults);
			this.currentConfig = $.extend(
				{},
				mergedConfig,
				this.$targetElement.data(), // Options from data attributes
				options // User-provided options
			);

			this.isInitialized = true; // Editor is now initialized
			this.activeDropdowns = []; // List of currently open dropdowns

			// Capture initial dimensions of the source element
			this.initialHeight = this.$originalSource.css('height');
			this.initialWidth = this.$originalSource.css('width');

			// Adjust configuration based on dependencies
			if (this.currentConfig.fullPageEditing) {
				this.currentConfig.useIframeMode = true;
			}
			if (this.currentConfig.useLineBreaks) {
				this.currentConfig.useParagraphs = false;
			} else if (this.currentConfig.useParagraphs) {
				this.currentConfig.useLineBreaks = false; // Ensure mutual exclusivity
			}
			if (this.currentConfig.fixedToolbarContainer) {
				this.currentConfig.fixedToolbar = true;
			}
			if (this.currentConfig.responsiveMobile === false) { // Example of a new conditional check
				this.currentConfig.maximumEditorHeight = 'none';
			}

			// Aliases for document and window objects, potentially for iframe context
			this.contentDocument = document;
			this.contentWindow = window;

			this.lastSelectionRange = false; // Stores the last known text selection

			// Pre-compile regular expressions for HTML cleaning and parsing
			this.regexCleanLineBefore = new RegExp('^<(/?' + this.currentConfig.selfClosingTags.join('|/?' ) + '|' + this.currentConfig.inlineBlockTags.join('|') + ')[ >]');
			this.regexCleanLineAfter = new RegExp('^<(br|/?' + this.currentConfig.selfClosingTags.join('|/?' ) + '|/' + this.currentConfig.inlineBlockTags.join('|/') + ')[ >]');
			this.regexNewBlockLevel = new RegExp('^</?(' + this.currentConfig.newBlockLevelTags.join('|' ) + ')[ >]');

			// Regex to test if an element is a block-level type
			this.regexIsBlockElement = new RegExp('^(' + this.currentConfig.allBlockElements.join('|' ) + ')$', 'i');

			// --- Advanced tag permission setup ---
			// If paragraphy mode is off, and specific tags are allowed/denied,
			// ensure consistency with bold/italic/deleted tags and paragraph tag.
			if (!this.currentConfig.useParagraphs)
			{
				if (this.currentConfig.allowedHtmlTags !== false)
				{
					const commonInlineTags = ['strong', 'em', 'del'];
					const compatibilityTags = ['b', 'i', 'strike'];

					// Ensure 'p' is allowed if linebreaks are not used and no explicit 'p' in denied list
					if (!this.currentConfig.allowedHtmlTags.includes('p')) {
						this.currentConfig.allowedHtmlTags.push('p');
					}

					// Add compatibility tags if their modern equivalents are allowed
					commonInlineTags.forEach((tag, index) => {
						if (this.currentConfig.allowedHtmlTags.includes(tag) && !this.currentConfig.allowedHtmlTags.includes(compatibilityTags[index])) {
							this.currentConfig.allowedHtmlTags.push(compatibilityTags[index]);
						}
					});
				}

				if (this.currentConfig.deniedHtmlTags !== false)
				{
					// Ensure 'p' is not denied if linebreaks are not used
					const pTagIndex = this.currentConfig.deniedHtmlTags.indexOf('p');
					if (pTagIndex !== -1) {
						this.currentConfig.deniedHtmlTags.splice(pTagIndex, 1);
					}
				}
			}

			// Browser-specific adjustments (example: removing hr for older browsers)
			if (this.isBrowser('msie') || this.isBrowser('opera'))
			{
				this.currentConfig.defaultToolbarButtons = this.currentConfig.defaultToolbarButtons.filter(btn => btn !== 'horizontalLine');
			}

			// Load the active language pack based on configuration
			this.activeLanguagePack = this.currentConfig.localeData[this.currentConfig.locale];
			if (!this.activeLanguagePack) {
				console.warn(`Composer: Locale '${this.currentConfig.locale}' not found, falling back to 'en'.`);
				this.activeLanguagePack = this.currentConfig.localeData['en'];
			}

			// Begin the editor construction process
			this.beginConstruction();
		},

		/**
		 * Helper function to detect browser.
		 * (Simplified for Type III, actual implementation would be more robust)
		 * @param {string} browserName - e.g., 'msie', 'opera'
		 * @returns {boolean}
		 */
		isBrowser: function(browserName) {
			const ua = navigator.userAgent.toLowerCase();
			return ua.includes(browserName);
		},

		/**
		 * Generates the toolbar button configuration schema.
		 * @param {object} localeStrings - The localized strings for button titles.
		 * @returns {object} A structured object defining toolbar buttons.
		 */
		generateToolbarConfig: function(localeStrings)
		{
			const commonButtonProps = (title, handler, dropdownItems = null, cssClass = '') => ({
				title: title,
				handler: handler,
				dropdown: dropdownItems,
				className: cssClass
			});

			return {
				source: commonButtonProps(localeStrings.source, 'toggleSourceView'),
				textFormat: commonButtonProps(localeStrings.textFormat, 'showDropdown', {
					paragraph: { title: localeStrings.paragraph, execCommand: 'formatBlock', value: 'p' },
					blockquote: { title: localeStrings.quote, execCommand: 'formatBlock', value: 'blockquote', className: 'editor_format_blockquote' },
					pre: { title: localeStrings.code, execCommand: 'formatBlock', value: 'pre', className: 'editor_format_pre' },
					h1: { title: localeStrings.header1, execCommand: 'formatBlock', value: 'h1', className: 'editor_format_h1' },
					h2: { title: localeStrings.header2, execCommand: 'formatBlock', value: 'h2', className: 'editor_format_h2' },
					h3: { title: localeStrings.header3, execCommand: 'formatBlock', value: 'h3', className: 'editor_format_h3' },
					h4: { title: localeStrings.header4, execCommand: 'formatBlock', value: 'h4', className: 'editor_format_h4' },
					h5: { title: localeStrings.header5, execCommand: 'formatBlock', value: 'h5', className: 'editor_format_h5' }
				}),
				bold: commonButtonProps(localeStrings.bold, 'executeCommand', null, '', 'bold'), // Added a 'name' property for clarity
				italic: commonButtonProps(localeStrings.italic, 'executeCommand', null, '', 'italic'),
				strike: commonButtonProps(localeStrings.strike, 'executeCommand', null, '', 'strikethrough'),
				underline: commonButtonProps(localeStrings.underline, 'executeCommand', null, '', 'underline'),
				unorderedList: commonButtonProps('&bull; ' + localeStrings.unorderedList, 'executeCommand', null, '', 'insertunorderedlist'),
				orderedList: commonButtonProps('1. ' + localeStrings.orderedList, 'executeCommand', null, '', 'insertorderedlist'),
				indentLeft: commonButtonProps('< ' + localeStrings.indentLeft, 'adjustIndentation', null, '', 'outdent'),
				indentRight: commonButtonProps('> ' + localeStrings.indentRight, 'adjustIndentation', null, '', 'indent'),
				insertImage: commonButtonProps(localeStrings.image, 'showImageModal'),
				insertVideo: commonButtonProps(localeStrings.video, 'showVideoModal'),
				insertFile: commonButtonProps(localeStrings.file, 'showFileModal'),
				// Example of a new button:
				insertEmoji: commonButtonProps('😀', 'showEmojiPicker', null, '', 'emoji'),
				// ... other buttons would follow a similar structure
			};
		},
		// Placeholder for the actual build process, to be implemented later
		beginConstruction: function() {
			// This method would contain the logic for creating the editor UI,
			// initializing events, loading content, etc.
			// For a Type III clone, we just need to rename it and ensure its presence.
			console.log(`RichContentEditor instance ${this.instanceId} starting construction.`);
			// Actual implementation details are not part of the cloning scope,
			// just the function signature and its call.
		}
		// ... more prototype methods would follow
	};

})(jQuery);