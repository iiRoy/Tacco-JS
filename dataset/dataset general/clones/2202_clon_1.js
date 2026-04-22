/*******************************************************************************
 * Redactor v9.1.6 - A powerful WYSIWYG editor for web applications.
 *
 * Updated: October 16, 2013
 *
 * Project Homepage:      http://imperavi.com/redactor/
 * Copyright (c) 2009-2013, Imperavi LLC. All rights reserved.
 * License Information:   http://imperavi.com/redactor/license/
 *
 * Basic Usage Example:
 *   $( '#content' ).redactor();
 *
 * This file contains the core Redactor editor functionality and configuration.
 ******************************************************************************/

( function ( $ ) {
// Declare a global unique ID counter for Redactor instances.
var uuid = 0;

// Enforce strict parsing and execution of JavaScript.
"use strict";

// Range object constructor to encapsulate a DOM Range.
var Range = function ( range )
{
	// Store start and end offsets as array-like properties.
	this[ 0 ] = range.startOffset;
	this[ 1 ] = range.endOffset;

	// Keep a reference to the original DOM Range object.
	this.range = range;

	return this; // Allow chaining, although not typically used for constructor.
};

// Method to check if the start and end offsets of the range are identical.
Range.prototype.equals = function ()
{
	return this[0] === this[1];
};

// jQuery plugin definition for Redactor.
$.fn.redactor = function ( options )
{
	// Array to store return values from method calls.
	var val = [];
	// Extract arguments passed after the 'options' parameter.
	var args = Array.prototype.slice.call( arguments, 1 );

	// Check if the options parameter is a string (indicating a method call).
	if ( typeof options === 'string' )
	{
		// Iterate over each selected element.
		this.each( function ()
		{
			// Retrieve the Redactor instance associated with the element.
			var instance = $.data( this, 'redactor' );

			// Ensure an instance exists and the method is callable.
			if ( typeof instance !== 'undefined' && $.isFunction( instance[ options ] ) )
			{
				// Call the method and store its return value if it's not undefined or the instance itself.
				var methodVal = instance[ options ].apply( instance, args );
				if ( methodVal !== undefined && methodVal !== instance ) val.push( methodVal );
			}
			else {
				// Throw an error if the method does not exist.
				return $.error( 'No such method "' + options + '" for Redactor' );
			}
		} );
	}
	else // If options is not a string, it's an initialization call.
	{
		// Iterate over each selected element to initialize Redactor.
		this.each( function ()
		{
			// Initialize Redactor only if it hasn't been initialized yet for this element.
			if ( ! $.data( this, 'redactor' ) ) {
				$.data( this, 'redactor', Redactor( this, options ) );
			}
		} );
	}

	// Handle return values based on the number of results.
	if ( val.length === 0 ) {
		return this; // Return jQuery object for chaining if no values were returned.
	}
	else if ( val.length === 1 ) {
		return val[ 0 ]; // Return the single value.
	}
	else {
		return val; // Return an array of values.
	}

};

// Main Redactor constructor function.
function Redactor( el, options )
{
	// Always return a new instance of Redactor.prototype.init.
	return new Redactor.prototype.init( el, options );
}

// Attach Redactor to jQuery's global object.
$.Redactor = Redactor;
// Define the Redactor version.
$.Redactor.VERSION = '9.1.6';
// Default options for Redactor instances.
$.Redactor.opts = {

	// Core settings for the editor behavior.
	rangy: false,
	iframe: false, // Use iframe mode?
	fullpage: false, // Full HTML page editing.
	css: false, // Custom CSS file URL for iframe.

	lang: 'en', // Editor language.
	direction: 'ltr', // Text direction: 'ltr' or 'rtl'.

	placeholder: false, // Placeholder text for empty editor.

	wym: false, // What You Mean mode (experimental).
	mobile: true, // Enable mobile-specific features.
	cleanup: true, // Clean pasted content.
	tidyHtml: true, // Tidy up generated HTML.
	pastePlainText: false, // Paste as plain text by default.
	removeEmptyTags: true, // Automatically remove empty tags.
	templateVars: false, // Enable template variable support.
	xhtml: false, // Output XHTML compliant tags.

	visual: true, // Start in visual mode.
	focus: false, // Focus editor on initialization.
	tabindex: false, // Custom tabindex.
	autoresize: true, // Auto-resize editor height.
	minHeight: false, // Minimum height for the editor.
	shortcuts: true, // Enable keyboard shortcuts.

	autosave: false, // Autosave URL or false.
	autosaveInterval: 60, // Autosave interval in seconds.

	plugins: false, // Array of plugin names to load.

	linkAnchor: true, // Allow anchor links.
	linkEmail: true, // Allow email links.
	linkProtocol: 'http://', // Default link protocol.
	linkNofollow: false, // Add rel="nofollow" to links.
	linkSize: 50, // Max length for link text in dialog.

	imageFloatMargin: '10px', // Margin for floated images.
	imageGetJson: false, // URL to fetch image list (JSON).

	imageUpload: false, // Image upload URL.
	imageUploadParam: 'file', // Name of the input field for image upload.
	fileUpload: false, // File upload URL.
	fileUploadParam: 'file', // Name of the input field for file upload.
	clipboardUpload: true, // Enable image uploads from clipboard.
	clipboardUploadUrl: false, // Clipboard upload URL.
	dragUpload: true, // Enable drag-and-drop file upload.

	dnbImageTypes: [ 'image/png', 'image/jpeg', 'image/gif' ], // Allowed image types for drag-n-drop.

	s3: false, // S3 upload configuration.
	uploadFields: false, // Additional fields to send with uploads.

	observeImages: true, // Observe image clicks.
	observeLinks: true, // Observe link clicks.

	modalOverlay: true, // Show modal overlay.

	tabSpaces: false, // Convert tabs to spaces (true or number of spaces).
	tabFocus: true, // Allow tab key to focus next element outside editor.

	air: false, // Enable Air toolbar.
	airButtons: [ 'formatting', '|', 'bold', 'italic', 'deleted', '|', 'unorderedlist', 'orderedlist', 'outdent', 'indent' ], // Buttons for Air toolbar.

	toolbar: true, // Show main toolbar.
	toolbarFixed: false, // Fix toolbar position.
	toolbarFixedTarget: document, // Element to fix toolbar relative to.
	toolbarFixedTopOffset: 0, // Offset for fixed toolbar.
	toolbarFixedBox: false, // Use a fixed box for toolbar.
	toolbarExternal: false, // External toolbar selector (e.g., '#my-toolbar').
	buttonSource: true, // Show HTML source button.

	buttonSeparator: '<li class="redactor_separator"></li>', // HTML for button separator.

	buttonsCustom: {}, // Custom button definitions.
	buttonsAdd: [], // Additional buttons to add to the toolbar.
	buttons: [ 'html', '|', 'formatting', '|', 'bold', 'italic', 'deleted', '|', 'unorderedlist', 'orderedlist', 'outdent', 'indent', '|', 'image', 'video', 'file', 'table', 'link', '|', 'alignment', '|', 'horizontalrule' ], // Default toolbar buttons. // Removed 'underline', 'alignleft', 'aligncenter', 'alignright', 'justify' in original list.

	activeButtons: [ 'deleted', 'italic', 'bold', 'underline', 'unorderedlist', 'orderedlist', 'alignleft', 'aligncenter', 'alignright', 'justify', 'table' ], // Buttons that show active state.
	activeButtonsStates: { // Mapping of HTML tags to active button names.
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
	activeButtonsAdd: false, // Object to add custom active buttons, e.g., { tag: 'buttonName' }.

	formattingTags: [ 'p', 'blockquote', 'pre', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6' ], // Tags available in the formatting dropdown.

	linebreaks: false, // Use <br> for new lines instead of <p>.
	paragraphy: true, // Wrap content in <p> tags.
	convertDivs: true, // Convert <div> to <p> on paste.
	convertLinks: true, // Convert plain text URLs to links.
	convertImageLinks: false, // Convert plain text image URLs to images.
	convertVideoLinks: false, // Convert plain text video URLs to video embeds.
	formattingPre: false, // Apply formatting inside <pre> tags (usually false).
	phpTags: false, // Allow PHP tags in source (be careful!).

	allowedTags: false, // Array of allowed HTML tags (false for all).
	deniedTags: [ 'html', 'head', 'link', 'body', 'meta', 'script', 'style', 'applet' ], // Tags to strip.

	boldTag: 'strong', // Tag to use for bold.
	italicTag: 'em', // Tag to use for italic.

	// Private internal settings and regular expressions.
	indentValue: 20, // Indent amount in pixels.
	buffer: [], // Undo buffer.
	rebuffer: [], // Redo buffer.
	textareamode: false, // Internal flag for textarea mode.
	emptyHtml: '<p>&#x200b;</p>', // HTML for an empty editor.
	invisibleSpace: '&#x200b;', // Zero-width space character.
	rBlockTest: /^(P|H[1-6]|LI|ADDRESS|SECTION|HEADER|FOOTER|ASIDE|ARTICLE)$/i, // Regex for block elements.
	alignmentTags: [ 'P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'DD', 'DL', 'DT', 'DIV', 'TD',
		'BLOCKQUOTE', 'OUTPUT', 'FIGCAPTION', 'ADDRESS', 'SECTION',
		'HEADER', 'FOOTER', 'ASIDE', 'ARTICLE' ], // Tags that can have alignment.
	ownLine: [ 'area', 'body', 'head', 'hr', 'i?frame', 'link', 'meta', 'noscript', 'style', 'script', 'table', 'tbody', 'thead', 'tfoot' ], // Tags that should be on their own line.
	contOwnLine: [ 'li', 'dt', 'dt', 'h[1-6]', 'option', 'script' ], // Tags that contain content on their own line.
	newLevel: [ 'blockquote', 'div', 'dl', 'fieldset', 'form', 'frameset', 'map', 'ol', 'p', 'pre', 'select', 'td', 'th', 'tr', 'ul' ], // Tags that introduce a new indentation level.
	blockLevelElements: [ 'P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'DD', 'DL', 'DT', 'DIV', 'LI',
		'BLOCKQUOTE', 'OUTPUT', 'FIGCAPTION', 'PRE', 'ADDRESS', 'SECTION',
		'HEADER', 'FOOTER', 'ASIDE', 'ARTICLE', 'TD' ], // Comprehensive list of block-level elements.
	// Language definitions.
	langs: {
		en: { // English language pack.
			html: 'HTML',
			video: 'Insert Video',
			image: 'Insert Image',
			table: 'Table',
			link: 'Link',
			link_insert: 'Insert link',
			link_edit: 'Edit link',
			unlink: 'Unlink',
			formatting: 'Formatting',
			paragraph: 'Normal text',
			quote: 'Quote',
			code: 'Code',
			header1: 'Header 1',
			header2: 'Header 2',
			header3: 'Header 3',
			header4: 'Header 4',
			header5: 'Header 5',
			bold: 'Bold',
			italic: 'Italic',
			fontcolor: 'Font Color',
			backcolor: 'Back Color',
			unorderedlist: 'Unordered List',
			orderedlist: 'Ordered List',
			outdent: 'Outdent',
			indent: 'Indent',
			cancel: 'Cancel',
			insert: 'Insert',
			save: 'Save',
			_delete: 'Delete',
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
			add_head: 'Add Head',
			delete_head: 'Delete Head',
			title: 'Title',
			image_position: 'Position',
			none: 'None',
			left: 'Left',
			right: 'Right',
			image_web_link: 'Image Web Link',
			text: 'Text',
			mailto: 'Email',
			web: 'URL',
			video_html_code: 'Video Embed Code',
			file: 'Insert File',
			upload: 'Upload',
			download: 'Download',
			choose: 'Choose',
			or_choose: 'Or choose',
			drop_file_here: 'Drop file here',
			align_left: 'Align text to the left',
			align_center: 'Center text',
			align_right: 'Align text to the right',
			align_justify: 'Justify text',
			horizontalrule: 'Insert Horizontal Rule',
			deleted: 'Deleted',
			anchor: 'Anchor',
			link_new_tab: 'Open link in new tab',
			underline: 'Underline',
			alignment: 'Alignment',
			filename: 'Name (optional)',
			edit: 'Edit'
		}
	}
};

// Redactor prototype methods and properties.
Redactor.fn = $.Redactor.prototype = {

	// Key code constants for keyboard event handling.
	keyCode: {
		BACKSPACE: 8,
		DELETE: 46,
		DOWN: 40,
		ENTER: 13,
		ESC: 27,
		TAB: 9,
		CTRL: 17,
		META: 91, // Command key on Mac.
		LEFT: 37,
		LEFT_WIN: 91 // Left Windows key.
	},

	/**
	 * Redactor initialization method.
	 * This is the entry point for creating a new editor instance.
	 * @param {HTMLElement} el The element to convert into a Redactor editor.
	 * @param {Object} options Configuration options for this instance.
	 */
	init: function ( el, options )
	{
		// Flag to indicate if content is being pasted.
		this.rtePaste = false;
		// Store references to the jQuery-wrapped element and source element.
		this.$element = this.$source = $( el );
		// Assign a unique ID to this Redactor instance.
		this.uuid = uuid++;

		// Deep clone default options to avoid modifying them directly.
		var opts = $.extend( true, {}, $.Redactor.opts );

		// Merge default options with data attributes and user-provided options.
		this.opts = $.extend(
			{},
			opts,
			this.$element.data(), // Options from data-attributes.
			options // User-provided options.
		);

		// Initial state flags.
		this.start = true;
		// Array to hold dropdown instances.
		this.dropdowns = [];

		// Store initial dimensions of the source element.
		this.sourceHeight = this.$source.css( 'height' );
		this.sourceWidth = this.$source.css( 'width' );

		// Adjust options based on dependencies.
		if ( this.opts.fullpage ) {
			this.opts.iframe = true; // Fullpage implies iframe.
		}
		if ( this.opts.linebreaks ) {
			this.opts.paragraphy = false; // Linebreaks conflict with paragraphy.
		}
		if ( this.opts.paragraphy ) {
			this.opts.linebreaks = false; // Paragraphy conflicts with linebreaks.
		}
		if ( this.opts.toolbarFixedBox ) {
			this.opts.toolbarFixed = true; // Fixed box implies fixed toolbar.
		}

		// Aliases for document and window objects (important for iframe mode).
		this.document = document;
		this.window = window;

		// Variable to store the current text selection.
		this.savedSel = false;

		// Pre-compile regular expressions for cleaning HTML.
		this.cleanlineBefore = new RegExp( '^<(/?' + this.opts.ownLine.join( '|/?' ) + '|' + this.opts.contOwnLine.join( '|' ) + ')[ >]' );
		this.cleanlineAfter = new RegExp( '^<(br|/?' + this.opts.ownLine.join( '|/?' ) + '|/' + this.opts.contOwnLine.join( '|/' ) + ')[ >]' );
		this.cleannewLevel = new RegExp( '^</?(' + this.opts.newLevel.join( '|' ) + ')[ >]' );

		// Regular expression to test for block-level elements.
		this.rTestBlock = new RegExp( '^(' + this.opts.blockLevelElements.join( '|' ) + ')$', 'i' );

		// Adjust formatting permissions based on linebreaks option.
		if ( this.opts.linebreaks === false )
		{
			// If allowedTags is set and 'p' is not included, add it.
			if ( this.opts.allowedTags !== false && $.inArray( 'p', this.opts.allowedTags ) === '-1' ) {
				this.opts.allowedTags.push( 'p' );
			}

			// If deniedTags is set and 'p' is included, remove it.
			if ( this.opts.deniedTags !== false )
			{
				var pos = $.inArray( 'p', this.opts.deniedTags );
				if ( pos !== '-1' ) {
					this.opts.deniedTags.splice( pos, pos );
				}
			}
		}

		// Special handling for IE and Opera browsers regarding horizontal rule button.
		if ( this.browser( 'msie' ) || this.browser( 'opera' ) )
		{
			this.opts.buttons = this.removeFromArrayByValue( this.opts.buttons, 'horizontalrule' );
		}

		// Load the current language pack.
		this.opts.curLang = this.opts.langs[ this.opts.lang ];

		// Begin the Redactor editor build process.
		this.buildStart();

	},
	/**
	 * Defines the structure and behavior of the toolbar buttons.
	 * @param {Object} lang The current language object.
	 * @returns {Object} An object defining all toolbar buttons.
	 */
	toolbarInit: function ( lang )
	{
		return {
			html: {
				title: lang.html,
				func: 'toggle' // Toggles between visual and HTML view.
			},
			formatting: {
				title: lang.formatting,
				func: 'show', // Shows a dropdown menu.
				dropdown: {
					p: {
						title: lang.paragraph,
						func: 'formatBlocks' // Applies paragraph formatting.
					},
					blockquote: {
						title: lang.quote,
						func: 'formatQuote',
						className: 'redactor_format_blockquote' // Custom class for dropdown item.
					},
					pre: {
						title: lang.code,
						func: 'formatBlocks',
						className: 'redactor_format_pre'
					},
					h1: {
						title: lang.header1,
						func: 'formatBlocks',
						className: 'redactor_format_h1'
					},
					h2: {
						title: lang.header2,
						func: 'formatBlocks',
						className: 'redactor_format_h2'
					},
					h3: {
						title: lang.header3,
						func: 'formatBlocks',
						className: 'redactor_format_h3'
					},
					h4: {
						title: lang.header4,
						func: 'formatBlocks',
						className: 'redactor_format_h4'
					},
					h5: {
						title: lang.header5,
						func: 'formatBlocks',
						className: 'redactor_format_h5'
					}
				}
			},
			bold: {
				title: lang.bold,
				exec: 'bold' // Executes the browser's 'bold' command.
			},
			italic: {
				title: lang.italic,
				exec: 'italic' // Executes the browser's 'italic' command.
			},
			deleted: {
				title: lang.deleted,
				exec: 'strikethrough' // Executes 'strikethrough'.
			},
			underline: {
				title: lang.underline,
				exec: 'underline' // Executes 'underline'.
			},
			unorderedlist: {
				title: '&bull; ' + lang.unorderedlist, // Bullet point prefix.
				exec: 'insertunorderedlist'
			},
			orderedlist: {
				title: '1. ' + lang.orderedlist, // Number prefix.
				exec: 'insertorderedlist'
			},
			outdent: {
				title: '< ' + lang.outdent,
				func: 'indentingOutdent' // Custom function for outdent.
			},
			indent: {
				title: '> ' + lang.indent,
				func: 'indentingIndent' // Custom function for indent.
			},
			image: {
				title: lang.image,
				func: 'imageShow' // Shows the image modal.
			},
			video: {
				title: lang.video,
				func: 'videoShow' // Shows the video modal.
			},
			file: {
				title: lang.file,
				func: 'fileShow' // Shows the file modal.
			},
			table: {
				title: lang.table,
				func: 'show', // Shows a dropdown menu for table operations.
				dropdown: {
					insert_table: {
						title: lang.insert_table,
						func: 'tableShow' // Shows the insert table modal.
					},