/*
	ContentEditorCore v1.0.0
	Last Modified: March 20, 2024

	https://example.com/content-editor/

	Copyright (c) 2024, EditorCo.
	License: https://example.com/content-editor/license/

	Usage: $('#my-textarea').richtextify();
*/

(function(jQueryAlias)
{
	"use strict"; // Ensure strict mode for robust code execution

	// A global counter for unique instance identification
	let editorInstanceCounter = 0;

	/**
	 * Represents a normalized selection boundary within the editor.
	 * @param {object} browserNativeRange - The native DOM Range object.
	 */
	const SelectionBoundary = function(browserNativeRange)
	{
		// Store the start and end offsets of the selection
		this.startPosition = browserNativeRange.startOffset;
		this.endPosition = browserNativeRange.endOffset;

		// Keep a reference to the original DOM Range object
		this.sourceRangeObject = browserNativeRange;

		// Allow chaining for constructor calls
		return this;
	};

	/**
	 * Checks if the selection boundary represents a collapsed (empty) range.
	 * @returns {boolean} True if the start and end positions are identical.
	 */
	SelectionBoundary.prototype.isCollapsed = function()
	{
		const initialPos = this.startPosition;
		const finalPos = this.endPosition;
		return initialPos === finalPos;
	};

	// jQuery Plugin Definition: richtextify
	jQueryAlias.fn.richtextify = function(pluginConfig)
	{
		const collectedMethodResults = [];
		const extraArguments = Array.prototype.slice.call(arguments, 1); // Capture all arguments after the first

		// Handle method calls (if first argument is a string)
		if (typeof pluginConfig === 'string')
		{
			this.each(function()
			{
				const currentEditorInstance = jQueryAlias.data(this, 'richtextify');

				// Validate if an instance exists and the method is callable
				if (currentEditorInstance && typeof currentEditorInstance[pluginConfig] === 'function')
				{
					const result = currentEditorInstance[pluginConfig].apply(currentEditorInstance, extraArguments);
					// Collect results if the method returns something meaningful and not just the instance itself
					if (result !== undefined && result !== currentEditorInstance)
					{
						collectedMethodResults.push(result);
					}
				}
				else
				{
					// Throw an error for unrecognized methods
					jQueryAlias.error(`No such method "${pluginConfig}" available for RichTextComposer instance.`);
				}
			});
		}
		else // Initialize a new editor instance
		{
			this.each(function()
			{
				// Prevent re-initialization if an instance already exists
				if (!jQueryAlias.data(this, 'richtextify'))
				{
					jQueryAlias.data(this, 'richtextify', RichTextComposer(this, pluginConfig));
				}
			});
		}

		// Return values based on the collected results
		if (collectedMethodResults.length === 0)
		{
			return this; // Return the jQuery object for chaining
		}
		else if (collectedMethodResults.length === 1)
		{
			return collectedMethodResults[0]; // Return the single result
		}
		else
		{
			return collectedMethodResults; // Return an array of results
		}
	};

	// Core Editor Initialization Function
	function RichTextComposer(targetDomElement, initialConfig)
	{
		return new RichTextComposer.prototype.initiate(targetDomElement, initialConfig);
	}

	// Expose RichTextComposer globally via jQuery
	jQueryAlias.RichTextComposer = RichTextComposer;
	jQueryAlias.RichTextComposer.RELEASE_IDENTIFIER = '1.0.0'; // Version string
	jQueryAlias.RichTextComposer.baseConfiguration = {

			// Core editor settings
			enableRangySupport: false,
			useIframeMode: false,
			isFullPageEditor: false,
			customCssUrl: false, // URL to custom stylesheet
			languageCode: 'en',
			textDirection: 'ltr', // 'ltr' or 'rtl'
			inputPlaceholderText: false,
			responsiveEnabled: true,
			performContentCleanup: true,
			autoFormatHtml: true,
			forcePlainTextPaste: false,
			stripEmptyHtmlTags: true,
			useXhtmlCompliance: false,

			// UI/UX settings
			visualModeActive: true,
			autoFocusOnLoad: false,
			tabIndexValue: false,
			enableAutoResize: true,
			minimumEditorHeight: false,
			keyboardShortcutsEnabled: true,

			// Data handling
			autoSaveDestinationUrl: false, // false or URL
			autoSaveFrequencySeconds: 60, // Interval in seconds

			// Plugin management
			activePlugins: false, // Array of plugin names

			// Link behavior
			allowAnchorLinks: true,
			allowEmailLinks: true,
			defaultLinkProtocol: 'http://',
			addNofollowToLinks: false,
			maxLinkTextLength: 50,

			// Image handling
			floatingImageMargin: '10px',
			imageGalleryJsonUrl: false, // URL for image list (e.g., /api/images.json)
			imageUploadEndpoint: false, // URL for image upload
			imageUploadFieldName: 'file', // Form field name for image file
			fileUploadEndpoint: false, // URL for general file upload
			fileUploadFieldName: 'file', // Form field name for general file
			allowClipboardImageUpload: true,
			clipboardImageUploadEndpoint: false, // URL for clipboard image upload
			allowDragAndDropUpload: true,
			dragAndDropAllowedImageTypes: ['image/png', 'image/jpeg', 'image/gif'], // Allowed image MIME types
			s3Configuration: false, // S3 upload settings
			additionalUploadFields: false, // Additional data for upload requests

			// DOM observation
			observeImageChanges: true,
			observeLinkChanges: true,

			// Modals
			enableModalOverlay: true,

			// Tab key behavior
			tabSpaceCount: false, // True for default tabs, or number of spaces
			tabKeyFocusEnabled: true,

			// Air toolbar (contextual toolbar)
			enableAirToolbar: false,
			airToolbarButtonList: ['formatting', '|', 'bold', 'italic', 'strikethrough', '|', 'unorderedlist', 'orderedlist', 'outdent', 'indent'],

			// Main toolbar settings
			showMainToolbar: true,
			fixToolbarPosition: false,
			fixedToolbarScrollTarget: document,
			fixedToolbarOffsetTop: 0, // Pixels offset from top
			fixedToolbarContainerMode: false,
			externalToolbarSelector: false, // CSS selector for external toolbar container
			showSourceCodeButton: true,
			toolbarSeparatorHtml: '<li class="editor-separator"></li>',

			// Customization
			customToolbarButtons: {},
			additionalToolbarButtons: [],
			mainToolbarButtons: ['html', '|', 'formatting', '|', 'bold', 'italic', 'deleted', '|', 'unorderedlist', 'orderedlist', 'outdent', 'indent', '|', 'image', 'video', 'file', 'table', 'link', '|', 'alignment', '|', 'horizontalrule'], // 'underline', 'alignleft', 'aligncenter', 'alignright', 'justify'

			// Active state detection
			activeStateButtons: ['deleted', 'italic', 'bold', 'underline', 'unorderedlist', 'orderedlist', 'alignleft', 'align-center', 'align-right', 'justify-text', 'table-edit'],
			activeStateMapping: {
				b: 'bold',
				strong: 'bold',
				i: 'italic',
				em: 'italic',
				del: 'deleted',
				strike: 'deleted',
				ul: 'unorderedlist',
				ol: 'orderedlist',
				u: 'underline',
				tr: 'table-edit',
				td: 'table-edit',
				table: 'table-edit'
			},
			additionalActiveStateMapping: false, // Object, ex.: { span: 'highlight' }

			// Content formatting rules
			blockFormattingTags: ['p', 'blockquote', 'pre', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
			useLineBreaksInsteadOfParagraphs: false,
			autoParagraphFormatting: true,
			convertDivsToParagraphs: true,
			autoConvertUrlsToLinks: true,
			autoConvertImageUrls: false,
			autoConvertVideoUrls: false,
			preservePreformattedText: false,

			permittedHtmlTags: false, // false or array of allowed tags
			restrictedHtmlTags: ['html', 'head', 'link', 'body', 'meta', 'script', 'style', 'applet'], // Tags to remove

			boldHtmlTag: 'strong',
			italicHtmlTag: 'em',

			// Internal operational settings
			indentationPixelValue: 20,
			undoStack: [],
			redoStack: [],
			isSourceModeActive: false,
			defaultEmptyContentHtml: '<p>&#x200b;</p>', // HTML for an empty editor
			zeroWidthSpaceChar: '&#x200b;',
			blockElementRegex: /^(P|H[1-6]|LI|ADDRESS|SECTION|HEADER|FOOTER|ASIDE|ARTICLE)$/i,
			alignableBlockElements: ['P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'DD', 'DL', 'DT', 'DIV', 'TD',
								'BLOCKQUOTE', 'OUTPUT', 'FIGCAPTION', 'ADDRESS', 'SECTION',
								'HEADER', 'FOOTER', 'ASIDE', 'ARTICLE'],
			selfClosingTags: ['area', 'body', 'head', 'hr', 'i?frame', 'link', 'meta', 'noscript', 'style', 'script', 'table', 'tbody', 'thead', 'tfoot'],
			containerSelfClosingTags: ['li', 'dt', 'dt', 'h[1-6]', 'option', 'script'],
			newBlockLevelTags: ['blockquote', 'div', 'dl', 'fieldset', 'form', 'frameset', 'map', 'ol', 'p', 'pre', 'select', 'td', 'th', 'tr', 'ul'],
			allBlockLevelElements: ['P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'DD', 'DL', 'DT', 'DIV', 'LI',
								'BLOCKQUOTE', 'OUTPUT', 'FIGCAPTION', 'PRE', 'ADDRESS', 'SECTION',
								'HEADER', 'FOOTER', 'ASIDE', 'ARTICLE', 'TD'],

			// Localization strings
			localizationStrings: {
				en: {
					htmlSource: 'HTML Code',
					insertVideoCmd: 'Insert Video Content',
					insertImageCmd: 'Add Image',
					tableOps: 'Table Controls',
					linkOps: 'Hyperlink',
					linkInsert: 'Insert Link Here',
					linkModify: 'Edit Current Link',
					unlinkCmd: 'Remove Link',
					formatText: 'Text Formatting',
					paragraphStyle: 'Normal Paragraph',
					blockQuoteStyle: 'Quoted Text',
					codeBlockStyle: 'Code Block',
					headingOne: 'Main Heading (H1)',
					headingTwo: 'Sub Heading (H2)',
					headingThree: 'Heading 3',
					headingFour: 'Heading 4',
					boldText: 'Bold Weight',
					italicText: 'Italic Style',
					fontColorPick: 'Font Color',
					bgColorPick: 'Background Color',
					unorderedListCmd: 'Bullet List',
					orderedListCmd: 'Numbered List',
					outdentCmd: 'Decrease Indent',
					indentCmd: 'Increase Indent',
					cancelAction: 'Cancel Operation',
					insertAction: 'Insert Item',
					saveAction: 'Save Changes',
					deleteAction: 'Remove',
					insertTableCmd: 'Create New Table',
					insertRowAboveCmd: 'Add Row Above Selection',
					insertRowBelowCmd: 'Add Row Below Selection',
					insertColLeftCmd: 'Add Column Left',
					insertColRightCmd: 'Add Column Right',
					deleteColCmd: 'Delete Column',
					deleteRowCmd: 'Delete Row',
					deleteTableCmd: 'Delete Entire Table',
					tableRows: 'Number of Rows',
					tableCols: 'Number of Columns',
					addTableHeader: 'Add Table Header',
					deleteTableHeader: 'Remove Table Header',
					itemTitle: 'Title Attribute',
					imagePosition: 'Image Alignment',
					noAlignment: 'None',
					alignLeft: 'Align Left',
					alignRight: 'Align Right',
					imageWebLink: 'Image URL',
					textLabel: 'Text Content',
					emailLabel: 'Email Address',
					webUrlLabel: 'Web URL',
					videoHtmlCode: 'Video Embed Code',
					insertFileCmd: 'Attach File',
					uploadFile: 'Upload',
					downloadFile: 'Download',
					selectFile: 'Choose',
					orSelectFile: 'Or choose from library',
					dropFileHere: 'Drop file here to upload',
					alignTextLeft: 'Align text to the left',
					alignTextCenter: 'Center text horizontally',
					alignTextRight: 'Align text to the right',
					justifyText: 'Justify text across width',
					insertHorizontalRule: 'Insert Horizontal Line',
					deletedText: 'Strikethrough',
					anchorLink: 'Anchor Point',
					linkNewTab: 'Open link in a new browser tab',
					underlineText: 'Underline Text',
					textAlignment: 'Text Alignment',
					fileNameOptional: 'File Name (optional)',
					editAction: 'Edit'
				}
			}
	};

	// Prototype methods for RichTextComposer instances
	jQueryAlias.RichTextComposer.prototype = {

		// Map of common key codes for keyboard events
		keyCodesMap: {
			KEY_BACKSPACE: 8,
			KEY_DELETE: 46,
			KEY_DOWN: 40,
			KEY_ENTER: 13,
			KEY_ESCAPE: 27,
			KEY_TAB: 9,
			KEY_CTRL: 17,
			KEY_META: 91, // Command key on Mac
			KEY_LEFT: 37,
			KEY_LEFT_WIN: 91 // Left Windows key
		},

		/**
		 * Initializes a new RichTextComposer instance.
		 * @param {HTMLElement} hostElement - The DOM element to convert into an editor.
		 * @param {object} customOptions - User-defined configuration options.
		 */
		initiate: function(hostElement, customOptions)
		{
			this.isPastingRteContent = false;
			this.$hostElement = jQueryAlias(hostElement); // The original textarea/div
			this.$originalSourceInput = this.$hostElement; // Alias for the source element
			this.instanceId = editorInstanceCounter++; // Assign a unique ID

			// Merge default, element-data, and custom options
			const mergedConfig = jQueryAlias.extend(true, {}, jQueryAlias.RichTextComposer.baseConfiguration);
			this.currentConfig = jQueryAlias.extend(
				true,
				mergedConfig,
				this.$hostElement.data(), // Options from data attributes
				customOptions
			);

			// Initial state flags
			this.isEditorReady = false;
			this.activeDropdowns = [];

			// Capture initial dimensions of the host element
			this.initialSourceHeight = this.$hostElement.css('height');
			this.initialSourceWidth = this.$hostElement.css('width');

			// Adjust configuration based on dependencies
			if (this.currentConfig.isFullPageEditor)
			{
				this.currentConfig.useIframeMode = true;
			}
			if (this.currentConfig.useLineBreaksInsteadOfParagraphs)
			{
				this.currentConfig.autoParagraphFormatting = false;
			}
			if (this.currentConfig.autoParagraphFormatting)
			{
				this.currentConfig.useLineBreaksInsteadOfParagraphs = false;
			}
			if (this.currentConfig.fixedToolbarContainerMode)
			{
				this.currentConfig.fixToolbarPosition = true;
			}

			// Reference to the document and window context (might be iframe's)
			this.editorDocument = document;
			this.editorWindow = window;

			// Store the last known selection range
			this.lastSelectionRange = false;

			// Precompile regular expressions for content cleaning
			const ownLineTags = this.currentConfig.selfClosingTags.join('|/?');
			const contOwnLineTags = this.currentConfig.containerSelfClosingTags.join('|');
			const newLevelTags = this.currentConfig.newBlockLevelTags.join('|');
			const blockElements = this.currentConfig.allBlockLevelElements.join('|');

			this.regexPrecedingLineBreak = new RegExp(`^<(/?${ownLineTags}|${contOwnLineTags})[ >]`);
			this.regexFollowingLineBreak = new RegExp(`^<(br|/?${ownLineTags}|/${contOwnLineTags})[ >]`);
			this.regexNewBlockLevel = new RegExp(`^</?(${newLevelTags})[ >]`);
			this.regexBlockElementTest = new RegExp(`^(${blockElements})$`, 'i');

			// Ensure 'p' tag is allowed if paragraphy mode is active
			if (!this.currentConfig.useLineBreaksInsteadOfParagraphs)
			{
				const allowedTags = this.currentConfig.permittedHtmlTags;
				if (allowedTags !== false && jQueryAlias.inArray('p', allowedTags) === -1)
				{
					allowedTags.push('p'); // Add 'p' if not already present
				}

				const deniedTags = this.currentConfig.restrictedHtmlTags;
				if (deniedTags !== false)
				{
					// Remove 'p' from denied tags if it was there
					const pIndex = jQueryAlias.inArray('p', deniedTags);
					if (pIndex !== -1)
					{
						deniedTags.splice(pIndex, 1);
					}
				}
			}

			// Load the appropriate language pack
			this.activeLanguagePack = this.currentConfig.localizationStrings[this.currentConfig.languageCode];

			// Begin the editor's construction process
			this.initiateBuildProcess();
		},

		/**
		 * Generates the definition object for the editor toolbar buttons.
		 * @param {object} languagePack - The active language strings for button labels.
		 * @returns {object} An object containing toolbar button definitions.
		 */
		generateToolbarDefinition: function(languagePack)
		{
			// Guard clause: Ensure languagePack is provided and valid
			if (!languagePack || typeof languagePack !== 'object')
			{
				console.error("Invalid language pack provided for toolbar generation.");
				return {};
			}

			return {
				sourceCodeToggle:
				{
					label: languagePack.htmlSource,
					action: 'toggleSourceView' // Renamed func to action
				},
				formatText:
				{
					label: languagePack.formatText,
					action: 'showDropdown', // Renamed func to action, changed to a more generic name
					subActions: // Renamed dropdown to subActions
					{
						paragraph:
						{
							label: languagePack.paragraphStyle,
							action: 'applyBlockFormat' // Renamed func to action
						},
						blockquote:
						{
							label: languagePack.blockQuoteStyle,
							action: 'applyQuoteFormat',
							cssClass: 'editor_format_blockquote' // Renamed className to cssClass
						},
						pre:
						{
							label: languagePack.codeBlockStyle,
							action: 'applyBlockFormat',
							cssClass: 'editor_format_pre'
						},
						h1:
						{
							label: languagePack.headingOne,
							action: 'applyBlockFormat',
							cssClass: 'editor_format_h1'
						},
						h2:
						{
							label: languagePack.headingTwo,
							action: 'applyBlockFormat',
							cssClass: 'editor_format_h2'
						},
						h3:
						{
							label: languagePack.headingThree,
							action: 'applyBlockFormat',
							cssClass: 'editor_format_h3'
						},
						h4:
						{
							label: languagePack.headingFour,
							action: 'applyBlockFormat',
							cssClass: 'editor_format_h4'
						}
					}
				},
				boldText:
				{
					label: languagePack.boldText,
					command: 'bold' // Renamed exec to command
				},
				italicText:
				{
					label: languagePack.italicText,
					command: 'italic'
				},
				deletedText:
				{
					label: languagePack.deletedText,
					command: 'strikethrough'
				},
				underlineText:
				{
					label: languagePack.underlineText,
					command: 'underline'
				},
				unorderedListCmd:
				{
					label: '&bull; ' + languagePack.unorderedListCmd,
					command: 'insertunorderedlist'
				},
				orderedListCmd:
				{
					label: '1. ' + languagePack.orderedListCmd,
					command: 'insertorderedlist'
				},
				outdentCmd:
				{
					label: '&lt; ' + languagePack.outdentCmd, // Changed '< ' to '&lt; ' for HTML safety
					action: 'decreaseIndentation' // Renamed func to action, changed method name
				},
				indentCmd:
				{
					label: '&gt; ' + languagePack.indentCmd, // Changed '> ' to '&gt; ' for HTML safety
					action: 'increaseIndentation' // Renamed func to action, changed method name
				},
				insertImageCmd:
				{
					label: languagePack.insertImageCmd,
					action: 'showImageModal' // Renamed func to action
				},
				insertVideoCmd:
				{
					label: languagePack.insertVideoCmd,
					action: 'showVideoModal' // Renamed func to action
				},
				insertFileCmd:
				{
					label: languagePack.insertFileCmd,
					action: 'showFileModal' // Renamed func to action
				},
				tableOps:
				{
					label: languagePack.tableOps,
					action: 'showDropdown',
					subActions:
					{
						createTable:
						{
							label: languagePack.insertTableCmd,
							action: 'showCreateTableModal' // Renamed func to action
						},
						insertRowAbove: { label: languagePack.insertRowAboveCmd, action: 'tableInsertRowAbove' },
						insertRowBelow: { label: languagePack.insertRowBelowCmd, action: 'tableInsertRowBelow' },
						insertColumnLeft: { label: languagePack.insertColLeftCmd, action: 'tableInsertColumnLeft' },
						insertColumnRight: { label: languagePack.insertColRightCmd, action: 'tableInsertColumnRight' },
						deleteCurrentColumn: { label: languagePack.deleteColCmd, action: 'tableDeleteColumn' },
						deleteCurrentRow: { label: languagePack.deleteRowCmd, action: 'tableDeleteRow' },
						deleteFullTable: { label: languagePack.deleteTableCmd, action: 'tableDeleteTable' }
					}
				},
				linkOps:
				{
					label: languagePack.linkOps,
					action: 'showDropdown',
					subActions: {
						insertLink: { label: languagePack.linkInsert, action: 'showLinkModal' },
						editLink: { label: languagePack.linkModify, action: 'editLinkModal' },
						removeLink: { label: languagePack.unlinkCmd, action: 'removeLink' }
					}
				},
				textAlignment:
				{
					label: languagePack.textAlignment,
					action: 'showDropdown',
					subActions: {
						alignLeft: { label: languagePack.alignTextLeft, command: 'justifyleft' },
						alignCenter: { label: languagePack.alignTextCenter, command: 'justifycenter' },
						alignRight: { label: languagePack.alignTextRight, command: 'justifyright' },
						justifyText: { label: languagePack.justifyText, command: 'justifyfull' }
					}
				},
				horizontalRule:
				{
					label: languagePack.insertHorizontalRule,
					command: 'inserthorizontalrule'
				},
				anchor:
				{
					label: languagePack.anchorLink,
					action: 'showAnchorModal'
				}
			};
		},

		// Placeholder for the build process (implementation details omitted for brevity)
		initiateBuildProcess: function()
		{
			// This method would contain the complex logic for setting up the editor UI,
			// iframe (if enabled), event handlers, initial content loading, etc.
			// For Type III clone, we just rename it and keep it as a placeholder.
			console.log(`RichTextComposer instance ${this.instanceId} starting build process.`);
			// Example of adding a new property during initialization
			this.editorInitializedTimestamp = new Date().toISOString();

			// Example of a guard clause based on a new config option
			if (this.currentConfig.autoFocusOnLoad && !this.$hostElement.is(':visible')) {
				console.warn("Autofocus requested, but editor host element is not visible.");
			}
		},

		// A placeholder for a potential internal utility method
		// (This could be a new fragment added as Type III)
		_getSanitizedContent: function(inputHtml) {
			if (typeof inputHtml !== 'string') {
				console.warn("Attempted to sanitize non-string input.");
				return '';
			}
			// In a real editor, this would involve DOM parsing and filtering
			// For this clone, it's just a placeholder.
			return inputHtml.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
		}
	};

})(jQuery);