"use strict";

const EditorToolkit = {
	/**
	 * Represents a configurable overlay dialog box.
	 * @param {object} config - Configuration object for the dialog.
	 * @param {jQuery} config.contentElement - The jQuery element to display inside the dialog.
	 * @param {number|string} [config.dialogWidth='600px'] - The width of the dialog.
	 * @param {number|string} [config.dialogHeight='auto'] - The height of the dialog.
	 * @param {number} [config.initialTopOffset=50] - Vertical offset from the top of the viewport.
	 */
	OverlayDialog: function(config) {
		if (!config || !config.contentElement) {
			console.error("OverlayDialog: Missing configuration or content element.");
			return;
		}

		this.contentElement = config.contentElement;
		this.dialogWidth = config.dialogWidth || '600px';
		this.dialogHeight = config.dialogHeight || 'auto';
		this.initialTopOffset = config.initialTopOffset || 50;

		// Re-imagined dialog structure using modern HTML elements
		this.dialogContainer = $('<div class="editor-overlay-dialog-wrapper">\
													<div class="dialog-header-region"></div>\
													<div class="dialog-content-area">\
														<div class="dialog-left-pane"></div>\
														<div class="dialog-body" id="dialog-main-content-slot" style="vertical-align:top;padding:2px;"></div>\
														<div class="dialog-right-pane"></div>\
													</div>\
													<div class="dialog-footer-region"></div>\
												</div>');

		/**
		 * Hides and removes the dialog from the DOM.
		 * @returns {boolean} - Always returns false.
		 */
		this.dismissDialog = () => {
			const activeContainer = this.dialogContainer;
			activeContainer.fadeOut(350, () => {
				$('#editor-backdrop-layer').remove();
				activeContainer.remove();
			});
			return false;
		};

		/**
		 * Renders the dialog, inserts content, positions it, and displays it.
		 * @returns {OverlayDialog} - The current dialog instance.
		 */
		this.renderDialog = () => {
			$('#dialog-main-content-slot', this.dialogContainer).empty().append(this.contentElement);

			// Calculate horizontal center position
			const bodyWidth = $('body').innerWidth();
			const dialogWidthNum = parseFloat(this.dialogWidth);
			const horizontalPosition = (bodyWidth - dialogWidthNum) / 2;
			const scrollPosition = $(window).scrollTop();

			this.dialogContainer.css({
				'width': this.dialogWidth,
				'height': this.dialogHeight,
				'position': 'absolute', // Use 'absolute' to follow scroll, or 'fixed' for fixed position
				'z-index': 9999,
				'display': 'none',
				'left': horizontalPosition,
				'top': scrollPosition + this.initialTopOffset
			});

			$('body').append(this.dialogContainer);
			this.dialogContainer.fadeIn(400);
			return this;
		};

		// Initialize and display the dialog upon creation
		this.renderDialog();
	},

	/**
	 * Core content editor module.
	 * @param {object} settings - Configuration settings for the editor.
	 * @param {string} settings.targetElement - Selector for the element to be edited.
	 * @param {number} [settings.responsiveBreakpoint=700] - Width threshold for switching between inline/modal editing.
	 * @param {boolean} [settings.useBackdrop=true] - Whether to display a modal backdrop.
	 * @param {string} [settings.assetPath="/editor/assets"] - Directory for editor images/icons.
	 * @param {function} [settings.onBeforeContentSave] - Callback before saving, receives HTML.
	 * @param {function} [settings.onAfterContentSave] - Callback after saving, receives HTML.
	 * @param {string} [settings.editingMode] - 'inline' or 'modal'. If undefined, determined by responsiveBreakpoint.
	 * @param {string} [settings.toolbarTemplate] - Custom HTML for the editor toolbar.
	 */
	ContentEditor: function(settings) {
		// Store original settings for re-initialization if needed
		this.editorSettings = settings;

		// Default configuration values
		this.responsiveBreakpoint = settings.responsiveBreakpoint || 700;
		this.useBackdrop = settings.useBackdrop !== undefined ? settings.useBackdrop : true;
		this.assetPath = settings.assetPath || "/editor/assets";

		// Assign Callbacks with default no-op functions
		this.onBeforeContentSave = settings.onBeforeContentSave || ((html) => html);
		this.onAfterContentSave = settings.onAfterContentSave || (() => false);

		// Reference to the element being edited
		this.activeEditorTarget = $(settings.targetElement);
		// Reference to the original element for modal context
		this.originalContentSource = this.activeEditorTarget;

		// Determine editing mode: inline or modal
		this.editingMode = settings.editingMode || (this.activeEditorTarget.width() < this.responsiveBreakpoint ? 'modal' : 'inline');

		/**
		 * Creates and configures the modal editor interface.
		 */
		this.createModalEditor = () => {
			const modalFrame = $('<div id="editor-modal-frame" class="editor-modal-container"></div>');
			const editableContentArea = $('<div id="editor-content-area" class="editable-content-body" contenteditable="true"></div>');
			editableContentArea.html(this.activeEditorTarget.html());

			modalFrame.append(this.editorMenu.getToolbarMarkup()); // Add toolbar to modal frame
			modalFrame.append(editableContentArea);

			this.dialogInstance = new EditorToolkit.OverlayDialog({
				dialogWidth: '700px', // Slightly wider than original _w
				contentElement: modalFrame,
				initialTopOffset: 30
			});
			this.activeEditorTarget = editableContentArea; // Set the modal's editable area as the active target
		};

		/**
		 * Initializes the editor based on its mode.
		 */
		this.initializeEditor = () => {
			this.editorMenu = new EditorToolkit.Toolbar(this); // Create toolbar instance
			if (this.editingMode === 'inline') {
				this.attachToolbarToTarget();
				this.enableContentEdit();
			} else {
				this.createModalEditor();
			}
			if (this.useBackdrop) {
				this.renderBackdrop();
			}
			// Store a snapshot of the initial content for revert functionality
			this.initialContentSnapshot = this.activeEditorTarget.html();
		};

		/**
		 * Appends and positions the toolbar for inline editing.
		 */
		this.attachToolbarToTarget = () => {
			const targetOffset = this.activeEditorTarget.offset();
			const toolbarMarkup = this.editorMenu.getToolbarMarkup();

			toolbarMarkup.attr("id", `${this.activeEditorTarget.attr('id') || 'unnamed-editor'}-toolbar`);
			$('body').append(toolbarMarkup);

			// Position the toolbar dynamically
			toolbarMarkup.css({
				'position': 'absolute',
				'display': 'none',
				'top': targetOffset.top - 55, // Adjusted position above the element
				'left': targetOffset.left,
				'z-index': 9998,
				'opacity': 0
			});
			toolbarMarkup.animate({ opacity: 1, top: targetOffset.top - 48 }, 300); // Smooth fade-in and slight slide
		};

		/**
		 * Draws a semi-transparent overlay backdrop, typically for modal editors.
		 */
		this.renderBackdrop = () => {
			const currentBg = this.activeEditorTarget.css('background-color');
			const effectiveBg = (currentBg && currentBg !== 'transparent' && currentBg !== 'rgba(0, 0, 0, 0)') ? currentBg : '#f0f0f0';

			$('body').append('<div id="editor-backdrop-layer" class="editor-backdrop-style"></div>');

			$('#editor-backdrop-layer').css({
				'background-color': '#333333',
				'height': Math.max($('body').height(), $(document).height()), // Robust height calculation
				'left': 0,
				'opacity': 0,
				'position': 'absolute',
				'top': 0,
				'width': '100%',
				'z-index': 9997,
				'display': 'none'
			});

			this.activeEditorTarget.css({
				'z-index': 9998, // Ensure editor target is above backdrop
				'position': 'relative',
				'background': effectiveBg
			});

			$('#editor-backdrop-layer').fadeIn(300).on('click', this.editorMenu.cancelEdit); // Click backdrop to cancel
		};

		/**
		 * Enables contenteditable mode for the target element and removes click handlers.
		 * @returns {boolean} - Always returns true.
		 */
		this.enableContentEdit = () => {
			this.activeEditorTarget.off('click');
			this.activeEditorTarget.prop('contenteditable', true);
			return true;
		};

		/**
		 * Disables contenteditable mode and cleans up editor UI elements.
		 * @returns {boolean} - Always returns false.
		 */
		this.disableContentEdit = () => {
			this.editorMenu.getToolbarMarkup().fadeOut(250, function() { $(this).remove(); }); // Fade out and remove toolbar
			$('#editor-backdrop-layer').fadeOut(250, function() { $(this).remove(); }); // Fade out and remove backdrop

			this.activeEditorTarget.prop('contenteditable', false).css('z-index', 'auto'); // Reset z-index

			// Re-bind click handler to re-initialize editor
			this.originalContentSource.on('click', () => {
				// Re-initialize the editor with its original settings
				new EditorToolkit.ContentEditor(this.editorSettings);
			});
			return false;
		};

		// Start the editor initialization process
		this.initializeEditor();
	},

	/**
	 * Represents the editor toolbar with various command buttons.
	 * @param {ContentEditor} editorInstance - The associated ContentEditor instance.
	 */
	Toolbar: function(editorInstance) {
		this.isSourceModeActive = false;
		// Mix in the document manipulation commands
		$.extend(this, EditorToolkit.DocumentManipulation);
		this.linkedEditorInstance = editorInstance;

		// Default toolbar HTML, using buttons and data-commands for better semantics
		this.toolbarMarkup = this.linkedEditorInstance.editorSettings.toolbarTemplate || $(`
			<div class="editor-toolbar-container">
				<button type="button" class="editor-tool-button" data-command="toggleBold" title="Bold Text"><img src="${this.linkedEditorInstance.assetPath}/icon_bold.svg" alt="Bold"></button>
				<button type="button" class="editor-tool-button" data-command="toggleItalic" title="Italic Text"><img src="${this.linkedEditorInstance.assetPath}/icon_italic.svg" alt="Italic"></button>
				<button type="button" class="editor-tool-button" data-command="toggleStrikethrough" title="Strikethrough Text"><img src="${this.linkedEditorInstance.assetPath}/icon_strike.svg" alt="Strikethrough"></button>
				<button type="button" class="editor-tool-button" data-command="toggleUnderline" title="Underline Text"><img src="${this.linkedEditorInstance.assetPath}/icon_underline.svg" alt="Underline"></button>
				<span class="toolbar-separator"></span>
				<button type="button" class="editor-tool-button" data-command="insertParagraph" title="Insert Paragraph"><img src="${this.linkedEditorInstance.assetPath}/icon_paragraph.svg" alt="Paragraph"></button>
				<button type="button" class="editor-tool-button" data-command="insertHeading1" title="Insert Heading 1"><img src="${this.linkedEditorInstance.assetPath}/icon_h1.svg" alt="H1"></button>
				<button type="button" class="editor-tool-button" data-command="insertHeading2" title="Insert Heading 2"><img src="${this.linkedEditorInstance.assetPath}/icon_h2.svg" alt="H2"></button>
				<button type="button" class="editor-tool-button" data-command="insertHeading3" title="Insert Heading 3"><img src="${this.linkedEditorInstance.assetPath}/icon_h3.svg" alt="H3"></button>
				<button type="button" class="editor-tool-button" data-command="insertHeading4" title="Insert Heading 4"><img src="${this.linkedEditorInstance.assetPath}/icon_h4.svg" alt="H4"></button>
				<span class="toolbar-separator"></span>
				<button type="button" class="editor-tool-button" data-command="insertMedia" title="Insert Image"><img src="${this.linkedEditorInstance.assetPath}/icon_image.svg" alt="Image"></button>
				<button type="button" class="editor-tool-button" data-command="applyLink" title="Create Link"><img src="${this.linkedEditorInstance.assetPath}/icon_link.svg" alt="Link"></button>
				<span class="toolbar-separator"></span>
				<button type="button" class="editor-tool-button" data-command="insertOrderedList" title="Ordered List"><img src="${this.linkedEditorInstance.assetPath}/icon_ol.svg" alt="Ordered List"></button>
				<button type="button" class="editor-tool-button" data-command="insertUnorderedList" title="Unordered List"><img src="${this.linkedEditorInstance.assetPath}/icon_ul.svg" alt="Unordered List"></button>
				<span class="toolbar-separator"></span>
				<button type="button" class="editor-tool-button" data-command="toggleSourceCodeView" title="View/Edit Source HTML"><img src="${this.linkedEditorInstance.assetPath}/icon_code.svg" alt="Source Code"></button>
				<button type="button" class="editor-tool-button confirm-btn" data-command="confirmChanges" title="Save Changes"><img src="${this.linkedEditorInstance.assetPath}/icon_save.svg" alt="Save"></button>
				<button type="button" class="editor-tool-button cancel-btn" data-command="cancelEdit" title="Discard Changes"><img src="${this.linkedEditorInstance.assetPath}/icon_cancel.svg" alt="Cancel"></button>
			</div>
		`);

		/**
		 * Provides the jQuery object for the toolbar's HTML markup.
		 * @returns {jQuery} - The toolbar's jQuery element.
		 */
		this.getToolbarMarkup = () => this.toolbarMarkup;

		/**
		 * Binds click event handlers to all toolbar buttons.
		 */
		this.attachCommandHandlers = () => {
			const self = this;
			$('.editor-tool-button', this.toolbarMarkup).each(function() {
				const commandName = $(this).data('command');
				if (commandName && typeof self[commandName] === 'function') {
					$(this).on('click', (event) => {
						event.preventDefault(); // Prevent default link/button action
						self[commandName].call(self); // Execute the command method
						return false;
					});
				} else {
					console.warn(`Toolbar: Command "${commandName}" not found or not a function.`);
				}
			});
		};

		/**
		 * Finalizes editing, processes content through callbacks, and disables the editor.
		 */
		this.confirmChanges = () => {
			if (this.isSourceModeActive) {
				this.leaveSourceCodeView();
			}

			let finalContent = this.linkedEditorInstance.activeEditorTarget.html();
			// Apply before-save transformations
			finalContent = this.linkedEditorInstance.onBeforeContentSave(finalContent);

			if (this.linkedEditorInstance.editingMode === 'inline') {
				this.linkedEditorInstance.activeEditorTarget.html(finalContent);
				this.linkedEditorInstance.disableContentEdit();
			} else { // Modal mode
				this.linkedEditorInstance.dialogInstance.dismissDialog();
				this.linkedEditorInstance.originalContentSource.html(finalContent);
			}
			// Trigger after-save callback
			this.linkedEditorInstance.onAfterContentSave(finalContent);
		};

		/**
		 * Discards all changes made since the editor was opened and disables it.
		 */
		this.cancelEdit = () => {
			this.linkedEditorInstance.activeEditorTarget.html(this.linkedEditorInstance.initialContentSnapshot);
			this.linkedEditorInstance.disableContentEdit();
			if (this.linkedEditorInstance.editingMode === 'modal') {
				this.linkedEditorInstance.dialogInstance.dismissDialog();
			}
			return false;
		};

		// Bind event handlers upon toolbar initialization
		this.attachCommandHandlers();
	},

	/**
	 * Collection of document manipulation commands for the content editor.
	 * These methods are mixed into the Toolbar instance.
	 */
	DocumentManipulation: {
		/**
		 * Prompts the user for input and handles cancellation/empty input.
		 * @param {string} message - The message to display in the prompt.
		 * @returns {string|null} - The user's input, or null if cancelled/empty.
		 */
		promptForInput: function(message) {
			let userResponse = prompt(message);
			while (userResponse !== null && userResponse.trim() === '') {
				userResponse = prompt(message + " (Input cannot be empty)");
			}
			return userResponse !== null ? userResponse.trim() : null;
		},

		/**
		 * Executes a native document editing command.
		 * @param {string} commandName - The name of the command (e.g., 'bold', 'createLink').
		 * @param {*} [commandValue=null] - The value for the command (e.g., URL for 'createLink').
		 * @returns {boolean} - True if command was executed, false otherwise.
		 */
		executeNativeCommand: function(commandName, commandValue = null) {
			if (document.execCommand) {
				try {
					return document.execCommand(commandName, false, commandValue);
				} catch (e) {
					console.warn(`execCommand failed for ${commandName}:`, e);
					return false;
				}
			} else {
				console.warn("document.execCommand is not supported in this browser.");
				return false;
			}
		},

		/** Core Text Formatting Commands **/
		toggleBold: function() {
			this.executeNativeCommand('bold');
		},
		toggleUnderline: function() {
			this.executeNativeCommand('underline');
		},
		toggleItalic: function() {
			this.executeNativeCommand('italic');
		},
		toggleStrikethrough: function() {
			this.executeNativeCommand('strikethrough');
		},
		toggleBlockquote: function() {
			this.executeNativeCommand('blockquote');
		},
		applyTextColor: function(color) {
			const selectedColor = color || this.promptForInput("Enter color (e.g., red, #FF0000):");
			if (selectedColor) {
				this.executeNativeCommand('forecolor', selectedColor);
			}
		},

		/** List Commands **/
		insertOrderedList: function() {
			this.executeNativeCommand('insertorderedlist');
		},
		insertUnorderedList: function() {
			this.executeNativeCommand('insertunorderedlist');
		},

		/** Media & Link Commands **/
		insertMedia: function() {
			const imageUrl = this.promptForInput("Enter image URL (e.g., http://example.com/image.png):");
			if (imageUrl) {
				this.executeNativeCommand('insertImage', imageUrl);
			}
		},
		insertCustomHtml: function() {
			const htmlContent = this.promptForInput('Enter HTML content to insert:');
			if (htmlContent) {
				this.executeNativeCommand('insertHTML', htmlContent);
			}
		},
		applyLink: function() {
			const linkUrl = this.promptForInput("Enter URL (e.g., http://example.com):");
			if (linkUrl) {
				this.executeNativeCommand('createLink', linkUrl);
			}
		},

		/** Block Formatting Commands **/
		insertHeading1: function() {
			this.executeNativeCommand('FormatBlock', 'h1');
		},
		insertHeading2: function() {
			this.executeNativeCommand('FormatBlock', 'h2');
		},
		insertHeading3: function() {
			this.executeNativeCommand('FormatBlock', 'h3');
		},
		insertHeading4: function() {
			this.executeNativeCommand('FormatBlock', 'h4');
		},
		insertParagraph: function() {
			this.executeNativeCommand('FormatBlock', 'p');
		},

		/** Source Code View Commands **/
		leaveSourceCodeView: function() {
			this.isSourceModeActive = false;
			const self = this;
			const rawContent = $('#source-code-editor').val().replace(/[\n\t]/g, '');
			const targetElement = this.linkedEditorInstance.activeEditorTarget;

			// Replace the textarea with its content
			$('#source-code-editor', targetElement).replaceWith(rawContent);

			// Rebind the source view button to toggle back to source mode
			$('[data-command="toggleSourceCodeView"]', this.toolbarMarkup)
				.off('click')
				.on('click', (e) => { e.preventDefault(); self.toggleSourceCodeView(); });
			return false;
		},
		toggleSourceCodeView: function() {
			this.isSourceModeActive = true; // Indicate that source mode is active
			const self = this;
			const targetElement = this.linkedEditorInstance.activeEditorTarget;
			const currentHtml = targetElement.html();

			const sourceTextArea = $('<textarea id="source-code-editor" class="source-editor-area"></textarea>');

			// Wrap the entire content of the editable element in the textarea
			targetElement.wrapInner(sourceTextArea);
			$('#source-code-editor').val(currentHtml); // Set textarea value to current HTML

			// Apply styling to the textarea
			$('#source-code-editor').css({
				'width': targetElement.width() - 10,
				'height': targetElement.height()
			});

			// Rebind the source view button to exit source mode
			$('[data-command="toggleSourceCodeView"]', this.toolbarMarkup)
				.off('click')
				.on('click', (e) => { e.preventDefault(); self.leaveSourceCodeView(); });
		}
	}
};