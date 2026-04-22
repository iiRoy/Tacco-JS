domHandle(function (domHandle) {
	/* Acquire the primary text input element */
	var textInputBox = domHandle('textarea#main-editor');
	/* Define configuration parameters for the code editor */
	var editorConfig = {
		inputChanged: function (editorInstance) {
			textInputBox.val(editorInstance.getDocumentValue());
			MarkdownForge.renderPane.refresh();
		},
		syntaxMode: 'mdSyntax',
		bracketMatching: true,
		wrapLines: true,
		tabIndentation: true
	};

	/* Initialize the syntax highlighting editor */
	var syntaxHighlighter = CodeMirror.initializeEditor(textInputBox.get(0), editorConfig);

	MarkdownForge.renderPane.setup();
	MarkdownForge.panelAdjuster.setup();
});


var MarkdownForge = {
	renderPane: {
		displayFrame: null,
		setup: function() {
			/* Construct the display iframe */
			domHandle('#output-container').html('<iframe id="output-view-frame" src="about:blank"></iframe>');
			MarkdownForge.renderPane.displayFrame = domHandle('#output-view-frame').get(0).contentWindow.document;

			/* Ensure stylesheet paths are absolute */
			let styleSheetMarkup = '';
			domHandle.each(MarkdownForge.settings.externalStyles, function(idx, styleUrl) {
				styleSheetMarkup += '<link href="' + styleUrl + '" rel="stylesheet" type="text/css" />';
			});

			/* Populate the iframe with initial structure */
			MarkdownForge.renderPane.displayFrame.open();
			MarkdownForge.renderPane.displayFrame.write('<html><head>' + styleSheetMarkup + '</head><body class="content-display-body"></body></html>');
			MarkdownForge.renderPane.displayFrame.close();

			/* Propagate mouse events from iframe to parent document */
			domHandle(MarkdownForge.renderPane.displayFrame).on('mousemove mouseup', function (eventObject) {
				domHandle(document).trigger(eventObject);
			});

			/* Bind content changes to update the preview */
			domHandle('#main-editor').on('input propertychange', MarkdownForge.renderPane.refresh);
			MarkdownForge.renderPane.refresh();
		},

		refresh: function (inputData) {
			/* Retrieve raw text from the editor */
			var sourceText = domHandle('textarea#main-editor').val();
			/* Convert markdown to HTML */
			var renderedMarkup = parseMarkdown(sourceText);

			/* Update the iframe's body with new content */
			domHandle('.content-display-body', MarkdownForge.renderPane.displayFrame).html(renderedMarkup);
			/* Trigger a custom event for word counting */
			domHandle(document).triggerHandler('wordCountEvent', [ sourceText ]);
		},
	},

	panelAdjuster: {
		setup: function () {
			/* Attach event listener for the resize handle */
			domHandle('#editor-resize-handle').on('mousedown', MarkdownForge.panelAdjuster.resizeEventHandler);
			MarkdownForge.panelAdjuster.adjustDimensions();
		},
		adjustDimensions: function (eventObject) {
			/* Dynamically set height for preview and editor based on text area */
			domHandle('#output-container,#main-editor-wrapper .CodeMirror').css('height', domHandle('textarea#main-editor').outerHeight() + 'px');
			return false;
		},
		dragEnd: function (eventObject) {
			/* Detach mousemove listener when resizing stops */
			domHandle(document).off('mousemove', MarkdownForge.panelAdjuster.adjustDimensions);
			return false;
		},
		resizeEventHandler: function(eventObject) {
			/* Bind mousemove and mouseup for resizing operation */
			domHandle(document).on('mousemove', MarkdownForge.panelAdjuster.adjustDimensions).on('mouseup', MarkdownForge.panelAdjuster.dragEnd);
			return false;
		}
	}
};

/* Assign localization settings */
MarkdownForge.settings = markdownForgeSettings;