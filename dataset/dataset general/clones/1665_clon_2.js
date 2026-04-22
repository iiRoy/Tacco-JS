var EDITOR_TOOLSET = {};

(function($) {

	// Core Module for Content Editing
	jQuery.fn.markupMaster = function(configuration)
	{
		return this.each(function()
		{
			var $thisElement = $(this);

			var componentData = $thisElement.data('markupMaster');
			if (!componentData) $thisElement.data('markupMaster', (componentData = new ContentEditor(this, configuration)));
		});
	};


	// Editor Initialization
	var ContentEditor = function(domElement, componentOptions)
	{
		// Target DOM Element
		this.$mainElement = $(domElement);

		// Configuration Settings
		this.settings = $.extend({

			languageCode: 'en',
			toolsetVariant: 'default',

			deferredLoad: true,

			assetPath: false,
			styleSheet: 'style.css',
			autoFocus: true,
			allowResizing: true,
			enableAutoResize: false,
			fixedToolbar: false,

			autoFormatContent: true,
			performCleanup: true,
			transformDivsToParagraphs: true,
			stripClasses: true,
			stripStyles: false,
			autoLinkConversion: true,

			contentProcessorUrl: false, // false or URL

			autoSaveEnabled: false, // false or URL
			saveIntervalSeconds: 60, // seconds

			imageGalleryJsonUrl: false, // URL (e.g., /directory/images.json ) or false

			imageUploadUrl: false, // URL
			linkUploadUrl: false, // URL
			generalFileUploadUrl: false, // URL

			visualMode: true,
			startInFullscreen: false,
			modalOverlayEnabled: true, // modal overlay

			colorPalette: Array(
				'#ffffff', '#000000', '#eeece1', '#1f497d', '#4f81bd', '#c0504d', '#9bbb59', '#8064a2', '#4bacc6', '#f79646', '#ffff00',
				'#f2f2f2', '#7f7f7f', '#ddd9c3', '#c6d9f0', '#dbe5f1', '#f2dcdb', '#ebf1dd', '#e5e0ec', '#dbeef3', '#fdeada', '#fff2ca',
				'#d8d8d8', '#595959', '#c4bd97', '#8db3e2', '#b8cce4', '#e5b9b7', '#d7e3bc', '#ccc1d9', '#b7dde8', '#fbd5b5', '#ffe694',
				'#bfbfbf', '#3f3f3f', '#938953', '#548dd4', '#95b3d7', '#d99694', '#c3d69b', '#b2a2c7', '#b7dde8', '#fac08f', '#f2c314',
				'#a5a5a5', '#262626', '#494429', '#17365d', '#366092', '#953734', '#76923c', '#5f497a', '#92cddc', '#e36c09', '#c09100',
				'#7f7f7f', '#0c0c0c', '#1d1b10', '#0f243e', '#244061', '#632423', '#4f6128', '#3f3151', '#31859b', '#974806', '#7f6000'),

			// internal use
			defaultEmptyParagraph: '<p><br /></p>',
			firefoxEmptyParagraph: '<p>&nbsp;</p>'


		}, componentOptions, this.$mainElement.data());

		this.dropPanels = [];

		// Start Setup
		this.initialize();
	};

	// Editor Functionality
	ContentEditor.prototype = {

		// DYNAMIC SCRIPT LOADING
		_fetchScript: function(scriptUrl, scriptQueue)
		{
			var currentItem = scriptQueue[0];
			scriptQueue.splice(0, 1);

			var nextAction;
			if (typeof(currentItem) == 'function') nextAction = currentItem;
			else nextAction = $.proxy(function() { this._fetchScript(currentItem, scriptQueue); }, this);

			this.injectScriptDynamically(scriptUrl, nextAction);
		},
		loadMultipleScripts: function(scriptList)
		{
			var firstScript = scriptList[0];
			scriptList.splice(0, 1);

			this._fetchScript(firstScript, scriptList);
		},
		injectScriptDynamically: function (scriptSource, completionCallback)
		{
			var documentHead = document.getElementsByTagName("head")[0];
			var newScriptElement = document.createElement("script");
			newScriptElement.src = scriptSource;

			var scriptLoaded = false;

			newScriptElement.onload = newScriptElement.onreadystatechange = function()
			{
				if (!scriptLoaded && (!this.readyState || this.readyState == "loaded" || this.readyState == "complete"))
				{
					scriptLoaded = true;
					if (completionCallback) completionCallback();
					newScriptElement.onload = newScriptElement.onreadystatechange = null;
				}
			};

			documentHead.appendChild(newScriptElement);

		},

		// Initialization Routine
		initialize: function()
		{
			// Determine asset base path
			this.resolveScriptPath();

			if (this.settings.deferredLoad)
			{
				// Prepare files for loading
				var scriptFiles = [];

				scriptFiles.push(this.settings.assetPath + '/langs/' + this.settings.languageCode + '.js');
				if (this.settings.toolsetVariant !== false) scriptFiles.push(this.settings.assetPath + '/toolbars/' + this.settings.toolsetVariant + '.js');
				scriptFiles.push($.proxy(this.beginEditing, this));

				this.loadMultipleScripts(scriptFiles);
			}
			else this.beginEditing();


		},
		beginEditing: function()
		{

			// Store original dimensions
			this.visualHeight = this.$mainElement.css('height');
			this.visualWidth = this.$mainElement.css('width');

			// Build the editor interface
			this.constructEditorUI();

			// Get initial HTML content
			var currentHtml = this.$mainElement.val();

			// Apply pre-formatting
			currentHtml = this.preformater(currentHtml);

			// Convert newlines to paragraphs if autoformat is enabled
			if (this.settings.autoFormatContent) currentHtml = this.paragraphy(currentHtml);

			// Activate the editor and get the editable area
			this.$editableArea = this.activateEditor(currentHtml);

			// Ensure editor maintains focus on document click
			$(this.contentDocument).click($.proxy(function(event) { this.$editableArea.focus(); }, this));

			// Handle paste cleanup
			$(this.contentDocument).bind('paste', $.proxy(function(event)
			{
				setTimeout($.proxy(function ()
				{
					var markerNode = $('<span id="pasteContentEnd">&nbsp;</span>');
					this.insertNodeAtCaret(markerNode.get(0));

					this.pasteCleanUp();

				}, this), 200);



			}, this));

			// Keypress event handling
			$(this.contentDocument).keypress($.proxy(function(event)
			{
				var pressedKey = event.keyCode || event.which;

				// Special handling for Safari Shift + Enter
				if (navigator.userAgent.indexOf('AppleWebKit') != -1) return this.safariShiftKeyEnter(event, pressedKey);

			}, this))

			// Keyup event handling
			.keyup($.proxy(function(event)
			{
				var releasedKey = event.keyCode || event.which;

				if (this.settings.autoFormatContent)
				{
					// If editor becomes empty
					if (releasedKey == 8 || releasedKey == 46) return this.formatEmpty(event);

					// New line as paragraph
					if (releasedKey == 13 && !event.shiftKey && !event.ctrlKey && !event.metaKey) return this.handleNewLineFormatting(event);
				}
				//console.log(event);
				this.synchronizeContent();

			}, this));

			// Construct the toolbar
			this.buildToolbar();

			// Setup resizing functionality
			if (this.settings.enableAutoResize === false) this.buildResizer();
			else this.setupAutoResizing();

			// Initialize keyboard shortcuts
			this.keyboardShortcuts();

			// Setup autosave
			this.autoSave();

			// Set up observers
			this.monitorImages();

			// Start in fullscreen mode if configured
			if (this.settings.startInFullscreen)
			{
				this.settings.startInFullscreen = false;
				this.fullscreen();
			}

			// Set initial focus
			if (this.settings.autoFocus) this.setFocusOnEditor();

			// Enable fixed toolbar position
			if (this.settings.fixedToolbar)
			{
				this.trackScrollPosition();
				$(document).scroll($.proxy(this.trackScrollPosition, this));
			}
		},
		keyboardShortcuts: function()
		{
			$(this.contentDocument).keydown($.proxy(function(event)
			{
				var pressedKeyCode = event.keyCode || event.which;

				if (event.ctrlKey)
				{
					if (pressedKeyCode == 90) this._handleShortcut(event, 'undo'); // Ctrl + Z
					else if (pressedKeyCode == 90 && event.shiftKey) this._handleShortcut(event, 'redo');	// Ctrl + Shift + Z
					else if (pressedKeyCode == 77) this._handleShortcut(event, 'removeFormat'); // Ctrl + M
					else if (pressedKeyCode == 66) this._handleShortcut(event, 'bold'); // Ctrl + B
					else if (pressedKeyCode == 73) this._handleShortcut(event, 'italic'); // Ctrl + I
					else if (pressedKeyCode == 74) this._handleShortcut(event, 'insertunorderedlist'); // Ctrl + J
					else if (pressedKeyCode == 75) this._handleShortcut(event, 'insertorderedlist'); // Ctrl + K
					else if (pressedKeyCode == 76) this._handleShortcut(event, 'superscript'); // Ctrl + L
				}

				if (!event.shiftKey && pressedKeyCode == 9) this._handleShortcut(event, 'indent'); // Tab
				else if (event.shiftKey && pressedKeyCode == 9 ) this._handleShortcut(event, 'outdent'); // Shift + Tab

			}, this));

		},
		_handleShortcut: function(eventObject, commandName)
		{
			if (eventObject.preventDefault) eventObject.preventDefault();
			this.executeEditorCommand(commandName, null);
		},
		resolveScriptPath: function()
		{
			if (this.settings.assetPath !== false) return this.settings.assetPath;

			$('script').each($.proxy(function(index, scriptTag)
			{
				if (scriptTag.src)
				{
					// Match the editor script file (e.g., markupmaster.js or markupmaster.min.js), and optional query string
					var pathRegex = new RegExp(/\/markupmaster(\.min)?\.js(\?.*)?/);
					if (scriptTag.src.match(pathRegex)) this.settings.assetPath = scriptTag.src.replace(pathRegex, '');
				}
			}, this));

		},
		constructEditorUI: function()
		{
			// Editor container box
			this.$containerBox = $('<div class="markup_master_container"></div>');

			// Iframe for editable content
			this.$contentFrame = $('<iframe frameborder="0" scrolling="auto" style="height: ' + this.visualHeight + ';" class="markup_master_frame"></iframe>');

			// Hide original textarea
			this.$mainElement.css('width', '100%').hide();

			// Insert box and frame into the DOM
			this.$containerBox.insertAfter(this.$mainElement).append(this.$contentFrame).append(this.$mainElement);

		},
		writeToFrame: function(frameHtmlContent)
		{
			this.contentDocument.open();
			this.contentDocument.write(frameHtmlContent);
			this.contentDocument.close();
		},
		activateEditor: function(initialHtml)
		{
			this.contentDocument = this.retrieveFrameDocument(this.$contentFrame.get(0));

			if (this.contentDocument !== null)
			{
				this.writeToFrame(this.composeFrameContent(initialHtml));
				if ($.browser.mozilla) this.contentDocument.execCommand("useCSS", false, true);
				return $(this.contentDocument).find('#contentPage');
			}
			else return false;
		},
		composeFrameContent: function(editorHtml)
		{
			var fullFrameHtml = '<!DOCTYPE html>\n';
			fullFrameHtml += '<html><head><link media="all" type="text/css" href="' + this.settings.assetPath + '/css/' + this.settings.styleSheet + '" rel="stylesheet"></head>';
			fullFrameHtml += '<body><div id="contentPage" contenteditable="true">';
			fullFrameHtml += editorHtml;
			fullFrameHtml += '</div></body></html>';
			return fullFrameHtml;
		},
		retrieveFrameDocument: function(iframeElement)
		{
			if (iframeElement.contentDocument) return iframeElement.contentDocument;
			else if (iframeElement.contentWindow && iframeElement.contentWindow.document) return iframeElement.contentWindow.document;
			else if (iframeElement.document) return iframeElement.document;
			else return null;
		},
		setFocusOnEditor: function()
		{
			this.$editableArea.focus();
		},
		synchronizeContent: function()
		{
			var processedHtml = this.formating(this.$editableArea.html());
			this.$mainElement.val(processedHtml);
		},

		// API Methods
		setContentHtml: function(newHtml)
		{
			newHtml = this.preformater(newHtml);

			this.$editableArea.html(newHtml).focus();

			this.synchronizeContent();
		},
		getContentHtml: function()
		{
			var currentContent = this.$editableArea ? this.$editableArea.html() : this.$mainElement.val();
			currentContent = this.reformater(currentContent);

			return currentContent;
		},
		injectHtmlFragment: function(fragmentHtml)
		{
			this.executeEditorCommand('inserthtml', fragmentHtml);
		},
		deactivateEditor: function()
		{
			var finalHtml = this.getContentHtml();

			this.$containerBox.after(this.$mainElement);
			this.$containerBox.remove();
			this.$mainElement.val(finalHtml).show();

			this.dropPanels.forEach(function(panelItem, index)
			{
				panelItem.remove();
				delete(this.dropPanels[index]);
			}, this);
		},
		processContentHandler: function()
		{
			$.ajax({
				url: this.settings.contentProcessorUrl,
				type: 'post',
				data: 'editorContent=' + escape(encodeURIComponent(this.getContentHtml())),
				success: $.proxy(function(responseData)
				{
					this.setContentHtml(responseData);
					this.synchronizeContent();

				}, this)
			});

		},
		// End API Methods

		// EVENT LISTENERS
		monitorImages: function()
		{
			if ($.browser.mozilla) this.contentDocument.execCommand("enableObjectResizing", false, "false");

			$(this.contentDocument).find('img').attr('unselectable', 'on').each($.proxy(function(idx, imgElement)
			{
				this.resizeImage(imgElement);

			}, this));

		},
		trackScrollPosition: function()
		{
			var currentScrollTop = $(document).scrollTop();
			var containerBoxTop = this.$containerBox.offset().top;

			if (currentScrollTop > containerBoxTop)
			{
				this.isFixedPosition = true;
				this.$controlPanel.css({position: 'fixed', width: '100%'});
			}
			else
			{
				this.isFixedPosition = false;
				this.$controlPanel.css({position: 'relative', width: 'auto'});
			}
		},
		setupAutoResizing: function()
		{
			this.$editableArea.css({ 'min-height':this.$mainElement.height()+'px' });
			this.$contentFrame.css({ 'overflow-x':'auto', 'overflow-y':'hidden' });
			this.$contentFrame.load($.proxy(this.adjustFrameSize, this));
			$(this.contentDocument).keyup($.proxy(this.adjustFrameSize, this));
		},
		adjustFrameSize: function()
		{
			this.$contentFrame.height(this.$editableArea.outerHeight(true)+30);
		},


		// COMMAND EXECUTION
		executeEditorCommand: function(commandIdentifier, commandParameter)
		{
			if (this.settings.visualMode && this.contentDocument)
			{
				try
				{
					if ($.browser.msie) this.setFocusOnEditor();

					if (commandIdentifier == 'inserthtml' && $.browser.msie) this.contentDocument.selection.createRange().pasteHTML(commandParameter);
					else if (commandIdentifier == 'formatblock' && $.browser.msie) this.contentDocument.execCommand(commandIdentifier, false, '<' +commandParameter + '>');
					else
					{
						this.contentDocument.execCommand(commandIdentifier, false, commandParameter);
					}

					this.synchronizeContent();
					this.setFocusOnEditor();
				}
				catch (error) { }

			}
		},

		// NEW LINE FORMATTING
		handleNewLineFormatting: function(eventObject)
		{
			var currentParent = this.getParentNode();
			if (currentParent.nodeName == 'DIV' && currentParent.id == 'contentPage')
			{
				if (eventObject.preventDefault) eventObject.preventDefault();

				var currentElement = $(this.getCurrentNode());
				if (currentElement.get(0).tagName == 'DIV' && (currentElement.html() == '' || currentElement.html() == '<br>'))
				{
					var newParagraphElement = $('<p>').append(currentElement.clone().get(0).childNodes);
					currentElement.replaceWith(newParagraphElement);
					newParagraphElement.html('<br />');
					this.setFocusNode(newParagraphElement.get(0));

					this.synchronizeContent();
					return false;
				 }
				 else this.synchronizeContent();