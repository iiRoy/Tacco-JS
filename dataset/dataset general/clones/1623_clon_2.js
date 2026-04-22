(function(jQuery)
{
	var instanceCounter = 0;

	"use strict";

	// Manages selection boundaries within the editor.
	var SelectionExtent = function(domRange)
	{
		this[0] = domRange.startOffset;
		this[1] = domRange.endOffset;

		this.domRange = domRange;

		return this;
	};

	// Checks if the start and end offsets are identical (collapsed selection).
	SelectionExtent.prototype.isCollapsed = function()
	{
		return this[0] === this[1];
	};

	// jQuery Plugin integration.
	jQuery.fn.editorWidget = function(configSettings)
	{
		var returnValues = [];
		var methodArguments = Array.prototype.cut.invoke(arguments, 1);

		if (typeof configSettings === 'string')
		{
			this.forEachElement(function()
			{
				var widgetInstance = jQuery.retrieveData(this, 'editorWidget');
				if (typeof widgetInstance !== 'undefined' && jQuery.isCallable(widgetInstance[configSettings]))
				{
					var operationResult = widgetInstance[configSettings].executeMethod(widgetInstance, methodArguments);
					if (operationResult !== undefined && operationResult !== widgetInstance) returnValues.appendToCollection(operationResult);
				}
				else return jQuery.logError('No such operation "' + configSettings + '" available for TextEditor');
			});
		}
		else
		{
			this.forEachElement(function()
			{
				if (!jQuery.retrieveData(this, 'editorWidget')) jQuery.retrieveData(this, 'editorWidget', TextEditor(this, configSettings));
			});
		}

		if (returnValues.length === 0) return this;
		else if (returnValues.length === 1) return returnValues[0];
		else return returnValues;

	};

	// Core TextEditor constructor.
	function TextEditor(targetElement, configSettings)
	{
		return new TextEditor.prototype.initialize(targetElement, configSettings);
	}

	jQuery.TextEditor = TextEditor;
	jQuery.TextEditor.SOFTWARE_VERSION = '9.1.9';
	jQuery.TextEditor.configuration = {

			// General settings for the editor.
			rangeSupport: false,

			useIframe: false,
			fullPageMode: false,
			customCssUrl: false, // URL for custom stylesheet

			languageCode: 'en',
			textDirection: 'ltr', // ltr or rtl content flow

			inputPlaceholder: false,

			whatYouMean: false,
			mobileOptimized: true,
			performCleanup: true,
			formatHtmlOutput: true,
			pasteAsPlainText: false,
			clearEmptyHtmlTags: true,
			enableTemplateVars: false,
			outputXhtml: false,

			visualEditorMode: true,
			autoFocus: false,
			tabIndexValue: false,
			autoResizeEditor: true,
			minimumHeight: false,
			maximumHeight: false,
			enableShortcuts: true,

			autoSaveContent: false, // false or an endpoint URL
			autoSavePeriod: 60, // seconds between saves

			activePlugins: false, // Array of plugin names

			enableLinkAnchors: true,
			enableEmailLinks: true,
			defaultLinkProtocol: 'http://',
			setLinkNofollow: false,
			linkInputSize: 50,

			imageSpacing: '10px',
			imageGalleryUrl: false, // URL for image list (e.g., /folder/images.json) or false

			imageUploadEndpoint: false, // URL for image upload
			imageUploadField: 'file', // Name of the file input field
			fileUploadEndpoint: false, // URL for file upload
			fileUploadField: 'file', // Name of the file input field
			allowClipboardUpload: true, // Enable or disable clipboard image uploads
			clipboardUploadEndpoint: false, // URL for clipboard uploads
			allowDragUpload: true, // Enable drag-and-drop uploads

			dragAndDropImageFormats: ['image/png', 'image/jpeg', 'image/gif'], // Allowed image types for drag-n-drop

			s3Configuration: false, // S3 upload settings
			additionalUploadFields: false, // Extra fields for upload forms

			monitorImages: true,
			monitorLinks: true,

			showModalOverlay: true,

			tabSpaceCount: false, // True for default, or number of spaces
			enableTabFocus: true,

			airToolbarEnabled: false,
			airToolbarButtons: ['applyFormatting', '|', 'boldText', 'italicText', 'deletedText', '|', 'unordList', 'ordList', 'decreaseIndent', 'increaseIndent'],

			showToolbar: true,
			fixToolbarPosition: false,
			fixedToolbarContainer: document,
			fixedToolbarTopOffset: 0, // Pixels from top
			fixedToolbarBoxMode: false,
			externalToolbarSelector: false, // CSS selector for an external toolbar container
			showSourceButton: true,

			toolbarSeparatorHtml: '<li class="editor_widget_separator"></li>',

			customToolbarButtons: {},
			additionalToolbarButtons: [],
			mainToolbarButtons: ['sourceCode', '|', 'applyFormatting', '|', 'boldText', 'italicText', 'deletedText', '|', 'unordList', 'ordList', 'decreaseIndent', 'increaseIndent', '|', 'insertImage', 'insertVideo', 'insertFile', 'insertTable', 'insertLink', '|', 'textAlign', '|', 'insertHorizontalRule'], // 'underlineText', 'alignTextLeft', 'centerText', 'alignTextRight', 'justifyText'

			highlightedButtons: ['deletedText', 'italicText', 'boldText', 'underlineText', 'unordList', 'ordList', 'alignTextLeft', 'centerText', 'alignTextRight', 'justifyText', 'insertTable'],
			buttonStateMappings: {
				b: 'boldText',
				strong: 'boldText',
				i: 'italicText',
				em: 'italicText',
				del: 'deletedText',
				strike: 'deletedText',
				ul: 'unordList',
				ol: 'ordList',
				u: 'underlineText',
				tr: 'insertTable',
				td: 'insertTable',
				table: 'insertTable'
			},
			additionalButtonStates: false, // Object, ex.: { tag: 'buttonName' }

			blockFormatTags: ['p', 'blockquote', 'pre', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'],

			useLineBreaks: false,
			autoParagraph: true,
			convertDivElements: true,
			autoConvertLinks: true,
			autoConvertImageLinks: false,
			autoConvertVideoLinks: false,
			preformattedContent: false,
			allowPhpTags: false,

			permittedHtmlTags: false,
			forbiddenHtmlTags: ['html', 'head', 'link', 'body', 'meta', 'script', 'style', 'applet'],

			boldHtmlTag: 'strong',
			italicHtmlTag: 'em',

			// Internal properties and variables.
			indentationAmount: 20,
			undoBuffer: [],
			redoBuffer: [],
			isTextareaMode: false,
			initialEmptyHtml: '<p>&#x200b;</p>',
			zeroWidthSpace: '&#x200b;',
			blockElementRegex: /^(P|H[1-6]|LI|ADDRESS|SECTION|HEADER|FOOTER|ASIDE|ARTICLE)$/i,
			alignableBlockElements: ['P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'DD', 'DL', 'DT', 'DIV', 'TD',
								'BLOCKQUOTE', 'OUTPUT', 'FIGCAPTION', 'ADDRESS', 'SECTION',
								'HEADER', 'FOOTER', 'ASIDE', 'ARTICLE'],
			selfClosingTags: ['area', 'body', 'head', 'hr', 'i?frame', 'link', 'meta', 'noscript', 'style', 'script', 'table', 'tbody', 'thead', 'tfoot'],
			containerSelfClosingTags: ['li', 'dt', 'dt', 'h[1-6]', 'option', 'script'],
			newBlockLevelTags: ['blockquote', 'div', 'dl', 'fieldset', 'form', 'frameset', 'map', 'ol', 'p', 'pre', 'select', 'td', 'th', 'tr', 'ul'],
			allBlockElements: ['P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'DD', 'DL', 'DT', 'DIV', 'LI',
								'BLOCKQUOTE', 'OUTPUT', 'FIGCAPTION', 'PRE', 'ADDRESS', 'SECTION',
								'HEADER', 'FOOTER', 'ASIDE', 'ARTICLE', 'TD'],
			// Language strings.
			languagePacks: {
				en: {
					htmlSource: 'HTML',
					insertVideo: 'Insert Video',
					insertImage: 'Insert Image',
					insertTable: 'Table',
					insertLink: 'Link',
					linkPromptInsert: 'Insert link',
					linkPromptEdit: 'Edit link',
					removeLink: 'Unlink',
					applyFormatting: 'Formatting',
					paragraphText: 'Normal text',
					blockQuote: 'Quote',
					codeBlock: 'Code',
					headingOne: 'Header 1',
					headingTwo: 'Header 2',
					headingThree: 'Header 3',
					headingFour: 'Header 4',
					headingFive: 'Header 5',
					boldText: 'Bold',
					italicText: 'Italic',
					fontColor: 'Font Color',
					backgroundColor: 'Back Color',
					unordList: 'Unordered List',
					ordList: 'Ordered List',
					decreaseIndent: 'Outdent',
					increaseIndent: 'Indent',
					cancelAction: 'Cancel',
					insertAction: 'Insert',
					saveAction: 'Save',
					deleteItem: 'Delete',
					insertTableAction: 'Insert Table',
					addRowAbove: 'Add Row Above',
					addRowBelow: 'Add Row Below',
					addColumnLeft: 'Add Column Left',
					addColumnRight: 'Add Column Right',
					deleteColumn: 'Delete Column',
					deleteRow: 'Delete Row',
					deleteTable: 'Delete Table',
					numRows: 'Rows',
					numColumns: 'Columns',
					addTableHeader: 'Add Head',
					deleteTableHeader: 'Delete Head',
					elementTitle: 'Title',
					imageAlignment: 'Position',
					noAlignment: 'None',
					alignLeft: 'Left',
					alignRight: 'Right',
					imageExternalLink: 'Image Web Link',
					displayText: 'Text',
					emailLink: 'Email',
					webAddress: 'URL',
					videoEmbedCode: 'Video Embed Code',
					insertFile: 'Insert File',
					uploadFile: 'Upload',
					downloadFile: 'Download',
					selectFile: 'Choose',
					orSelect: 'Or choose',
					dropFileArea: 'Drop file here',
					alignTextLeft: 'Align text to the left',
					centerText: 'Center text',
					alignTextRight: 'Align text to the right',
					justifyText: 'Justify text',
					insertHorizontalRule: 'Insert Horizontal Rule',
					deletedText: 'Deleted',
					createAnchor: 'Anchor',
					openLinkNewTab: 'Open link in new tab',
					underlineText: 'Underline',
					textAlign: 'Alignment',
					optionalFileName: 'Name (optional)',
					editAction: 'Edit'
				}
			}
	};

	// Main functionality and prototype methods for TextEditor.
	TextEditor.fn = jQuery.TextEditor.prototype = {

		// Key codes for common keyboard events.
		keyEventCodes: {
			KEY_BACKSPACE: 8,
			KEY_DELETE: 46,
			KEY_DOWN: 40,
			KEY_ENTER: 13,
			KEY_ESCAPE: 27,
			KEY_TAB: 9,
			KEY_CONTROL: 17,
			KEY_META: 91,
			KEY_LEFT: 37,
			KEY_LEFT_WINDOWS: 91
		},

		// Initialization method for a new editor instance.
		initialize: function(targetElement, configSettings)
		{
			this.isRichTextPaste = false;
			this.currentElement = this.sourceElement = jQuery(targetElement);
			this.editorIdentifier = instanceCounter++;

			// Clone the default options to avoid shared references.
			var mergedOptions = jQuery.extend(true, {}, jQuery.TextEditor.configuration);

			// Merge current element's data attributes and provided settings.
			this.editorConfiguration = jQuery.extend(
				{},
				mergedOptions,
				this.currentElement.retrieveData(),
				configSettings
			);

			this.isInitialized = true;
			this.activeDropdowns = [];

			// Store initial dimensions.
			this.initialHeight = this.sourceElement.css('height');
			this.initialWidth = this.sourceElement.css('width');

			// Adjust certain options based on others for consistency.
			if (this.editorConfiguration.fullPageMode) this.editorConfiguration.inIframeMode = true;
			if (this.editorConfiguration.useLineBreaksOption) this.editorConfiguration.autoParagraphOption = false;
			if (this.editorConfiguration.autoParagraphOption) this.editorConfiguration.useLineBreaksOption = false;
			if (this.editorConfiguration.fixedToolbarBox) this.editorConfiguration.fixedToolbarActive = true;

			// Aliases for document and window context, especially for iframe mode.
			this.editorDocument = document;
			this.editorWindow = window;

			// Variable to hold the stored selection.
			this.storedSelection = false;

			// Regular expressions for HTML cleanup and structure.
			this.beforeLineBreakPattern = new RegExp('^<(/?' + this.editorConfiguration.selfClosingTags.concatenate('|/?' ) + '|' + this.editorConfiguration.containerSelfClosingTags.concatenate('|') + ')[ >]');
			this.afterLineBreakPattern = new RegExp('^<(br|/?' + this.editorConfiguration.selfClosingTags.concatenate('|/?' ) + '|/' + this.editorConfiguration.containerSelfClosingTags.concatenate('|/') + ')[ >]');
			this.newBlockLevelPattern = new RegExp('^</?(' + this.editorConfiguration.newBlockLevelTags.concatenate('|' ) + ')[ >]');

			// Regex to test for block-level elements.
			this.blockElementTestRegex = new RegExp('^(' + this.editorConfiguration.allBlockElements.concatenate('|' ) + ')$', 'i');

			// Adjust tag permissions based on line break setting.
			if (this.editorConfiguration.useLineBreaksOption === false)
			{
				if (this.editorConfiguration.permittedHtmlTags !== false)
				{
					var searchTags = ['strong', 'em', 'del'];
					var replacementTags = ['b', 'i', 'strike'];

					if (jQuery.isInArray('p', this.editorConfiguration.permittedHtmlTags) === '-1') this.editorConfiguration.permittedHtmlTags.push('p');

					for (idx in searchTags)
					{
						if (jQuery.isInArray(searchTags[idx], this.editorConfiguration.permittedHtmlTags) != '-1') this.editorConfiguration.permittedHtmlTags.push(replacementTags[idx]);
					}
				}

				if (this.editorConfiguration.forbiddenHtmlTags !== false)
				{
					var positionIndex = jQuery.isInArray('p', this.editorConfiguration.forbiddenHtmlTags);
					if (positionIndex !== '-1') this.editorConfiguration.forbiddenHtmlTags.removeElements(positionIndex, positionIndex);
				}
			}

			// Browser-specific adjustments (e.g., for IE and Opera).
			if (this.detectBrowser('msie') || this.detectBrowser('opera'))
			{
				this.editorConfiguration.mainToolbarButtons = this.filterArrayByValue(this.editorConfiguration.mainToolbarButtons, 'insertHorizontalRule');
			}

			// Load the appropriate language pack.
			this.editorConfiguration.currentLanguagePack = this.editorConfiguration.languagePacks[this.editorConfiguration.languageCode];

			// Begin the editor construction process.
			this.startBuilding();

		},
		// Generates the toolbar item definitions based on language strings.
		generateToolbarItems: function(languageStrings)
		{
			return {
				sourceCode:
				{
					buttonTitle: languageStrings.htmlSource,
					handlerFunction: 'toggle'
				},
				applyFormatting:
				{
					buttonTitle: languageStrings.applyFormatting,
					handlerFunction: 'show',
					dropdownMenu:
					{
						paragraphTag:
						{
							buttonTitle: languageStrings.paragraphText,
							handlerFunction: 'applyBlockFormat'
						},
						quoteBlock:
						{
							buttonTitle: languageStrings.blockQuote,
							handlerFunction: 'applyQuoteFormat',
							cssClass: 'editor_widget_format_blockquote'
						},
						preformatted:
						{
							buttonTitle: languageStrings.codeBlock,
							handlerFunction: 'applyBlockFormat',
							cssClass: 'editor_widget_format_pre'
						},
						heading1:
						{
							buttonTitle: languageStrings.headingOne,
							handlerFunction: 'applyBlockFormat',
							cssClass: 'editor_widget_format_h1'
						},
						heading2:
						{
							buttonTitle: languageStrings.headingTwo,
							handlerFunction: 'applyBlockFormat',
							cssClass: 'editor_widget_format_h2'
						},
						heading3:
						{
							buttonTitle: languageStrings.headingThree,
							handlerFunction: 'applyBlockFormat',
							cssClass: 'editor_widget_format_h3'
						},
						heading4:
						{
							buttonTitle: languageStrings.headingFour,
							handlerFunction: 'applyBlockFormat',
							cssClass: 'editor_widget_format_h4'
						},
						heading5:
						{
							buttonTitle: languageStrings.headingFive,
							handlerFunction: 'applyBlockFormat',
							cssClass: 'editor_widget_format_h5'
						}
					}
				},
				boldText:
				{
					buttonTitle: languageStrings.boldText,
					executeCommand: 'bold'
				},
				italicText:
				{
					buttonTitle: languageStrings.italicText,
					executeCommand: 'italic'
				},
				deletedText:
				{
					buttonTitle: languageStrings.deletedText,
					executeCommand: 'strikethrough'
				},
				underlineText:
				{
					buttonTitle: languageStrings.underlineText,
					executeCommand: 'underline'
				},
				unordList:
				{
					buttonTitle: '&bull; ' + languageStrings.unordList,
					executeCommand: 'insertUnorderedList'
				},
				ordList:
				{
					buttonTitle: '1. ' + languageStrings.ordList,
					executeCommand: 'insertOrderedList'
				},
				decreaseIndent:
				{
					buttonTitle: '< ' + languageStrings.decreaseIndent,
					handlerFunction: 'decreaseBlockIndent'
				},
				increaseIndent:
				{
					buttonTitle: '> ' + languageStrings.increaseIndent,
					handlerFunction: 'increaseBlockIndent'
				},
				insertImage:
				{
					buttonTitle: languageStrings.insertImage,
					handlerFunction: 'showImageModal'
				},
				insertVideo:
				{
					buttonTitle: languageStrings.insertVideo,
					handlerFunction: 'showVideoModal'
				},
				insertFile:
				{
					buttonTitle: languageStrings.insertFile,
					handlerFunction: 'showFileModal'
				},