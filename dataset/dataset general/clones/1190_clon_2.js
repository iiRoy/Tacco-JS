(function(jq){

// This JavaScript module facilitates a rich text editing experience.
// It's a reimplementation inspired by earlier works on Markdown processing.
// The licensing terms are permissive, allowing broad usage.
//
// Configuration parameters:
// * stringResources: Object holding localized text entries.
// * actionButtons: Array of command keys for the toolbar.
// * initialContent: The starting text for the editor.
// * historyDelayMs: Time in milliseconds without input to record a new state.
// * renderDelayMs: Time in milliseconds without input to refresh the output view.

/*
 * Mathias Bynens' clever solution for capturing real-time changes in textareas.
 * More details can be found at: http://mathiasbynens.be/notes/oninput
 */
jq.fn.liveInput = function(callbackFunction) {
  var $thisElement = this;
  if (!callbackFunction) {
    // If no callback, just trigger the event for immediate processing
    return $thisElement.trigger('keydown.liveInput');
  }
  // Bind both 'input' and 'keydown' to ensure broad browser compatibility
  return $thisElement.bind({
    'input.liveInput': function(evtObj) {
      // Unbind keydown when 'input' event fires to prevent double calls
      $thisElement.unbind('keydown.liveInput');
      callbackFunction.call(this, evtObj);
    },
    'keydown.liveInput': function(evtObj) {
      callbackFunction.call(this, evtObj);
    }
  });
};

jq.fn.richTextEditor = function(settings) {

	// Merge user settings with default configuration
	settings = jq.extend({
		historyDelayMs: 2000,
		renderDelayMs: 300,
		actionButtons: [ 'bold', 'italic', 'link', 'quote', 'codeblock', 'image', 'heading', 'unorderedlist', 'revert', 'advance', 'info' ],
		stringResources: {
			'editor-cmd-bold': 'Strong Text',
			'editor-cmd-italic': 'Emphasized Text',
			'editor-cmd-link': 'Insert Web Link',
			'editor-cmd-quote': 'Block Quote',
			'editor-cmd-codeblock': 'Inline Code',
			'editor-cmd-image': 'Add Picture',
			'editor-cmd-heading': 'Section Heading',
			'editor-cmd-unorderedlist': 'Bullet List',
			'editor-cmd-revert': 'Step Back',
			'editor-cmd-advance': 'Step Forward',
			'editor-cmd-info': 'Help Guide',
			'editor-cmd-confirm': 'Apply',
			'editor-cmd-dismiss': 'Cancel'
		}
	}, settings);

	var

		// A chronological log of content states (array of strings)
		contentLog = [],

		// Current position within the content log
		currentLogIndex = 0,

		// Instance of the Markdown-to-HTML processing engine
		markupProcessor = new Showdown.converter(),

		// Helper function to generate HTML for a toolbar button
		forgeControl = function(controlKey) {
			var labelIdentifier = 'editor-cmd-' + controlKey;
			return '<a class="editor-control ' + labelIdentifier + '" title="' + settings.stringResources[labelIdentifier] + '"><span class="editor-icon editor-icon-' + controlKey + '">' + settings.stringResources[labelIdentifier] + '</span></a>';
		},

		// Main structural elements of the editor UI
		$mainElement = jq('<div class="editor-wrapper"><div class="editor-toolbar"></div><textarea class="editor-input"></textarea><div class="editor-output-display"></div></div>'),
		$toolTray = $mainElement.find('.editor-toolbar'),
		$textInput = $mainElement.find('.editor-input'),
		$outputDisplay = $mainElement.find('.editor-output-display')
		;

	/*
		The following selection utilities are adapted from Alex Brem's fieldSelection jQuery plugin.
	*/
	var inputNode = $textInput[0],

	/*
		@param currentContent The full text content of the editor.
		@param initialPosition The start of the current selection.
		@param isBlockOperation Boolean, true if selecting an entire line/block.
		@returns The adjusted starting character position.
	*/
	findStartPos = function(currentContent, initialPosition, isBlockOperation) {
		if (!isBlockOperation) return initialPosition;
		while (initialPosition > 1) {
			if (currentContent[initialPosition - 1] == '\n')
				break;
			initialPosition--;
		}
		return initialPosition;
	},

	findEndPos = function(currentContent, finalPosition, isBlockOperation) {
		if (!isBlockOperation) return finalPosition;
		while (finalPosition < currentContent.length - 1) {
			if (currentContent[finalPosition] == '\n')
				break;
			finalPosition++;
		}
		return finalPosition;
	},

	/*
		Retrieves information about the user's current text selection.
		Supports various browser implementations.
	*/
	acquireHighlight =

		/* Modern browsers (DOM Level 3) */
		('selectionStart' in inputNode && function(isBlockOperation) {
			var adjustedStart = findStartPos(inputNode.value, inputNode.selectionStart, isBlockOperation);
			var adjustedEnd = findEndPos(inputNode.value, inputNode.selectionEnd, isBlockOperation);
			var segmentLength = adjustedEnd - adjustedStart;
			return {
				startPosition: adjustedStart,
				endPosition: adjustedEnd,
				segmentLength: segmentLength,
				highlightedText: inputNode.value.substr(adjustedStart, segmentLength)
			};
		}) ||

		/* Internet Explorer legacy */
		(document.selection && function() {

			inputNode.focus();

			var activeRange = document.selection.createRange();
			if (activeRange === null) {
				return {
					startPosition: 0,
					endPosition: inputNode.value.length,
					segmentLength: 0
				};
			}

			var fullTextRange = inputNode.createTextRange();
			var preSelectionRange = fullTextRange.duplicate();
			fullTextRange.moveToBookmark(activeRange.getBookmark());
			preSelectionRange.setEndPoint('EndToStart', fullTextRange);

			// Note: Block-level selection adjustment is not fully implemented for IE in this clone.

			return {
				startPosition: preSelectionRange.text.length,
				endPosition: preSelectionRange.text.length + activeRange.text.length,
				segmentLength: activeRange.text.length,
				highlightedText: activeRange.text
			};
		}) ||

		/* Fallback for unsupported browsers */
		function() { return null; };


	/*
	 * Function to replace the currently selected text, also from Alex Brem's work.
	 */
	var alterHighlight =

		/* Modern browsers */
		('selectionStart' in inputNode && function(newText, isBlockOperation) {
			var adjustedStart = findStartPos(inputNode.value, inputNode.selectionStart, isBlockOperation);
			var adjustedEnd = findEndPos(inputNode.value, inputNode.selectionEnd, isBlockOperation);
			inputNode.value = inputNode.value.substr(0, adjustedStart) + newText + inputNode.value.substr(adjustedEnd, inputNode.value.length);
			inputNode.selectionStart = adjustedStart;
			inputNode.selectionEnd = adjustedStart + newText.length;
			inputNode.focus();
		}) ||

		// Note: Block-level selection adjustment is not fully implemented for IE in this clone.
		/* Internet Explorer */
		(document.selection && function(newText) {
			inputNode.focus();
			document.selection.createRange().text = newText;
		}) ||

		/* Unsupported browsers */
		function(newText) {
			inputNode.value += newText;
		};

	/**
		Adds a new state to the historical log.
		New states are only recorded if the content has changed.
	*/
	var logUpdateTimer = 0;
	var storeCurrentState = function() {
		clearTimeout(logUpdateTimer); // Reset the timer on new input
		logUpdateTimer = setTimeout(function() {
			if (inputNode.value != contentLog[currentLogIndex]) {
				currentLogIndex++;
				contentLog[currentLogIndex] = inputNode.value;
				// If user typed after an undo, discard future states
				if (contentLog.length > currentLogIndex + 1) {
					contentLog = contentLog.slice(0, currentLogIndex + 1);
					$restoreBtn.attr('disabled', ''); // Disable redo button
				}
			}
		}, settings.historyDelayMs);
		$revertBtn.removeAttr('disabled'); // Enable undo button
		refreshDisplay(); // Also trigger a display refresh
	};

	/**
		Reverts the editor content to a previous state in the log.
	*/
	var undoLast = function() {
		if (currentLogIndex > 0) {
			inputNode.value = contentLog[--currentLogIndex];
			$restoreBtn.removeAttr('disabled'); // Enable redo button
			refreshDisplay();
		}
		if (currentLogIndex === 0) {
			$revertBtn.attr('disabled', ''); // Disable undo if at the beginning
		}
	};

	/**
		Advances the editor content to a subsequent state in the log.
	*/
	var redoNext = function() {
		if (currentLogIndex < contentLog.length - 1) {
			inputNode.value = contentLog[++currentLogIndex];
			if (currentLogIndex === contentLog.length - 1) {
				$restoreBtn.attr('disabled', ''); // Disable redo if at the end
			}
			refreshDisplay();
			$revertBtn.removeAttr('disabled'); // Enable undo button
		}
	};

	/**
		Updates the output display with the current editor content.
		@param synchronous {boolean} If true, updates immediately; otherwise, throttled.
	*/
	var viewRefreshTimer = 0;
	var refreshDisplay = function(synchronous) {
		if (!synchronous) {
			clearTimeout(viewRefreshTimer);
			viewRefreshTimer = setTimeout(function() {
				$outputDisplay.html(markupProcessor.makeHtml(inputNode.value));
				$textInput.trigger('editor.contentChanged', inputNode);
			}, settings.renderDelayMs);
		} else {
			$outputDisplay.html(markupProcessor.makeHtml(inputNode.value));
		}
	};

	// Populate the toolbar with command buttons
	jq.each(settings.actionButtons, function(idx, toolItem) {
		$toolTray.append(forgeControl(toolItem));
	});
	var $revertBtn = $toolTray.find('.editor-cmd-revert');
	var $restoreBtn = $toolTray.find('.editor-cmd-advance');

	/**
		Prompts the user for hyperlink details (title and URL).
		@param callbackFunction A function to process the entered title and URL.
	*/
	var insertHyperlink = function(callbackFunction) {
		var
			currentHighlight = acquireHighlight().highlightedText.replace(/\n/g, '').trim(),
			$hyperlinkForm = jq(
			'<form class="editor-link-prompt" action="#">' +
				'<input placeholder="Link Description" type="text" class="editor-input-field editor-link-description">' +
				'<input placeholder="https://example.com" type="url" class="editor-input-field editor-link-url">' +
				forgeControl('confirm') + forgeControl('dismiss') +
			'</form>'
			),
			dismissDialog = function() {
				$hyperlinkForm.remove();
				$toolTray.show();
				return false;
			},
			confirmDialog = function() {
				var $targetURL = $hyperlinkForm.find('.editor-link-url'),
					$linkCaption = $hyperlinkForm.find('.editor-link-description'),
					targetURL = $targetURL.val(),
					linkCaption = $linkCaption.val() || targetURL
				;
				alterHighlight(callbackFunction(linkCaption, targetURL));
				storeCurrentState();
				$hyperlinkForm.remove();
				$toolTray.show();
				return false;
			};
		$toolTray
			.hide()
			.after($hyperlinkForm);
		$hyperlinkForm
			.on('click', '.editor-cmd-confirm', confirmDialog)
			.on('click', '.editor-cmd-dismiss', dismissDialog)
			.on('keyup', '.editor-input-field', function(keyboardEvent) {
				if (keyboardEvent.keyCode === 13) // Enter key
					confirmDialog();
				else if (keyboardEvent.keyCode === 27) // Escape key
					dismissDialog();
			});
		if (!currentHighlight || /^http(s?):\/\//.exec(currentHighlight)) {
			$hyperlinkForm.find('.editor-link-url').val(currentHighlight);
			$hyperlinkForm.find('.editor-link-description').focus();
		} else {
			$hyperlinkForm.find('.editor-link-description').val(currentHighlight);
			$hyperlinkForm.find('.editor-link-url').focus();
		}

	};

	/**
		Applies or removes formatting based on selection and provided options.
		@param formatOptions Object containing:
			- pattern: Regex to check if format is applied/removed.
			- apply: Callback to apply the format.
			- remove: Optional callback to remove the format.
			- blockLevel: True to operate on entire lines.
	*/
	var applyFormat = function(formatOptions) {
		var highlightedContent = acquireHighlight(formatOptions.blockLevel).highlightedText;
		// For single-line commands, ignore if selection spans multiple lines
		if (!formatOptions.blockLevel && /\n/.exec(highlightedContent))
			return;
		var matchedSegments = formatOptions.pattern.exec(highlightedContent);
		var processedValue = !matchedSegments ? formatOptions.apply(highlightedContent) :
			formatOptions.remove ? formatOptions.remove(highlightedContent, formatOptions) :
			matchedSegments[1];
		alterHighlight(processedValue, formatOptions.blockLevel);
	};

	// Array defining all editor commands and their behaviors
	var toolActions = [
		{
			actionCode: 'bold',
			actionRoutine: function() {
				applyFormat({
					apply: function(textValue) {
						return '**' + textValue.trim() + '**';
					},
					pattern: /^\*\*(.*)\*\*$/
				});
				storeCurrentState();
			}
		},
		{
			actionCode: 'italic',
			actionRoutine: function() {
				applyFormat({
					apply: function(textValue) {
						return '*' + textValue.trim() + '*';
					},
					pattern: /^\*((\*\*)?([^*]*)(\*\*))?\*$/
				});
				storeCurrentState();
			}
		},
		{
			actionCode: 'link',
			keyboardShortcut: '⌘+k, ctrl+k',
			actionRoutine: function() {
				insertHyperlink(function(captionText, urlAddress) {
					return '[' + captionText + '](' + urlAddress + ')';
				});
			}
		},
		{
			actionCode: 'codeblock',
			keyboardShortcut: 'shift+⌘+p, shift+ctrl+p',
			actionRoutine: function() {
				applyFormat({
					apply: function(textValue) {
						return '`' + textValue + '`';
					},
					pattern: /^`([^`]*)`$/
				});
				storeCurrentState();
			}
		},
		{
			actionCode: 'quote',
			keyboardShortcut: '⌘+\', ctrl+\'',
			actionRoutine: function() {
				applyFormat({
					apply: function(textValue) {
						return '> ' + textValue.replace(/\n/g, '\n> ');
					},
					remove: function(textValue) {
						return textValue.replace(/(^|\n)>[ \t]*(.*)/g, "$1$2");
					},
					pattern: /((^|\n)>(.*))+$/,
					blockLevel: true
				});
				storeCurrentState();
			}
		},
		{
			actionCode: 'image',
			keyboardShortcut: 'shift+⌘+i, shift+ctrl+i',
			actionRoutine: function() {
				insertHyperlink(function(captionText, urlAddress) {
					return '![' + captionText + '](' + urlAddress + ' "' + captionText + '")';
				});
			}
		},
		{
			actionCode: 'heading',
			actionRoutine: function() {
				applyFormat({
					apply: function(textValue) {
						return '#' + textValue;
					},
					pattern: /^#(.*)$/,
					blockLevel: true
				});
				storeCurrentState();
			}
		},
		{
			actionCode: 'unorderedlist',
			keyboardShortcut: 'shift+⌘+l, shift+ctrl+l',
			actionRoutine: function() {
				applyFormat({
					apply: function(textValue) {
						return '* ' + textValue.replace(/\n/g, '\n* ');
					},
					remove: function(textValue) {
						return textValue.replace(/^[\s\t]*\*[ \t]*/mg, "");
					},
					pattern: /^([\s\t]*\*.*)*$/,
					blockLevel: true
				});
				storeCurrentState();
			}
		},
		{
			actionCode: 'revert',
			keyboardShortcut: '⌘+z, ctrl+z',
			actionRoutine: undoLast
		},
		{
			actionCode: 'advance',
			keyboardShortcut: '⌘+y, ctrl+y',
			actionRoutine: redoNext
		},
		{
			actionCode: 'info',
			keyboardShortcut: 'shift+⌘+h, shift+ctrl+h',
			actionRoutine: function() {
				window.open('http://en.wikipedia.org/wiki/Markdown'); // External link for Markdown help
			}
		}
	];

	// Override default key binding filter to allow input fields to handle their own keys
	key.filter = function (eventObject){
		var elementTag = (eventObject.target || eventObject.srcElement).tagName;
		return !(elementTag == 'INPUT' || elementTag == 'SELECT');
	};

	// Assign event handlers for each defined action
	for (var i = 0; i < toolActions.length; i++) {
		var operation = toolActions[i],
			keyIdentifier = operation.actionCode,
			eventProcessor = operation.actionRoutine;

		// Mouse click event binding
		$toolTray.on('click', '.editor-cmd-' + keyIdentifier, eventProcessor);

		// Keyboard shortcut binding
		key(operation.keyboardShortcut || '⌘+' + keyIdentifier + ', ctrl+' + keyIdentifier, 'editorScope', eventProcessor);
	}

	$textInput
		.focusin(function() {
			// Set the keyboard scope for editor-specific shortcuts
			key.setScope('editorScope');
		})
		.focusout(function() {
			// Revert to the default global keyboard scope
			key.setScope();
		});

	// Expose internal functions for testing or advanced usage if configured
	if (settings.exposedInternals) {
		var exposed = settings.exposedInternals;
		exposed.storeCurrentState = storeCurrentState;
		exposed.undoLast = undoLast;
		exposed.contentLog = contentLog;
	}

	// Initialize the editor with provided content, if any
	settings.initialContent && $textInput.val(settings.initialContent);
	// Bind the live input event to trigger state storage
	$textInput.liveInput(storeCurrentState);

	// Perform initial history setup and display rendering
	contentLog[currentLogIndex] = inputNode.value;
	refreshDisplay(true); // Initial render is synchronous
	$restoreBtn.attr('disabled', ''); // Redo is disabled initially
});

})(jQuery);