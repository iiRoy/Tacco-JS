/*
Content Editing Module by CodeCrafters Inc.
This utility is derived from the pioneering work of Showdown by John Fraser and Markdown by John Gruber.
Licensed under the permissive MIT license. Feel free to adapt and use as you see fit.

Configuration Parameters:
* localeStrings: Object containing all internationalization entries for UI elements.
* toolActions: An array specifying the buttons to be included in the toolbar.
* initialContent: The starting text content for the editor.
* reversionDelayMs: Time in milliseconds without user activity that triggers a new history snapshot.
* previewUpdateDelayMs: Time in milliseconds without user changes that triggers an HTML preview refresh.
*/

(function(jq){

  // Utility to detect text input changes across different browsers.
  // Based on a proposal by Mathias Bynens: http://mathiasbynens.be/notes/oninput
  jq.fn.observeTextInput = function(changeHandler) {
    const currentElement = this;
    if (!changeHandler || typeof changeHandler !== 'function') {
      // If no handler is provided, trigger a synthetic change event.
      return currentElement.trigger('keydown.inputMonitor');
    }

    return currentElement.on({
      'input.inputMonitor': function(evt) {
        // For browsers supporting 'input' event, unbind keydown to avoid double-triggering.
        currentElement.off('keydown.inputMonitor');
        changeHandler.call(this, evt);
      },
      'keydown.inputMonitor': function(evt) {
        // Fallback for older browsers or specific key events.
        changeHandler.call(this, evt);
      }
    });
  };

  jq.fn.richTextComposer = function(settings) {

    // Default configuration merged with user-provided settings.
    const mergedSettings = jq.extend({
      reversionDelayMs: 2000,
      previewUpdateDelayMs: 300,
      toolActions: [ 'bold', 'italic', 'link', 'blockquote', 'code', 'image', 'heading', 'unorderedlist', 'undo', 'redo', 'help' ],
      localeStrings: {
        'action-bold': 'Bold text',
        'action-italic': 'Italic text',
        'action-link': 'Insert hyperlink',
        'action-blockquote': 'Add quote block',
        'action-code': 'Insert code snippet',
        'action-image': 'Insert image',
        'action-heading': 'Apply heading style',
        'action-unorderedlist': 'Create bullet list',
        'action-undo': 'Undo last action',
        'action-redo': 'Redo last action',
        'action-help': 'View Markdown help',
        'action-confirm': 'Confirm',
        'action-cancel': 'Cancel',
        'link-title-placeholder': 'Link Text/Title',
        'link-url-placeholder': 'https://example.com',
        'url-required': 'A valid URL is required for links and images.'
      }
    }, settings);

    let
      // Array to store past and future content states for undo/redo.
      editTrail = [],

      // Current position within the editTrail array.
      trailIndex = 0,

      // Markdown-to-HTML conversion engine instance.
      mdProcessor = new Showdown.converter(),

      // Helper function to generate HTML for a toolbar button.
      buildActionBtn = function(actionIdentifier) {
        const buttonName = `action-${actionIdentifier}`;
        const buttonTitle = mergedSettings.localeStrings[buttonName] || actionIdentifier;
        return `<a class="editor-btn ${buttonName}" title="${buttonTitle}"><span class="editor-icon icon-${actionIdentifier}">${buttonTitle}</span></a>`;
      };

    // Construct the main editor UI components.
    const mainWrapper = jq('<div class="content-editor-wrapper"></div>');
    const controlBar = jq('<div class="editor-toolbar"></div>');
    const inputArea = jq('<textarea class="editor-input-area"></textarea>');
    const displayPanel = jq('<div class="editor-preview-panel"></div>');

    mainWrapper.append(controlBar, inputArea, displayPanel); // Append all at once for efficiency.
    this.append(mainWrapper); // Append the entire editor to the target element.

    const editableElement = inputArea[0]; // Direct reference to the DOM textarea element.

    // --- Text Selection and Manipulation Utilities ---

    /**
     * Determines the effective start index of a selection, optionally expanding to a full line.
     * @param {string} fullContent The entire text content.
     * @param {number} currentStart The current selection start.
     * @param {boolean} expandToLine If true, expands to the beginning of the line.
     * @returns {number} The adjusted start index.
     */
    const fetchTextRangeStart = (fullContent, currentStart, expandToLine) => {
      if (!expandToLine) return currentStart;
      let adjustedStart = currentStart;
      while (adjustedStart > 0 && fullContent[adjustedStart - 1] !== '\n') {
        adjustedStart--;
      }
      return adjustedStart;
    };

    /**
     * Determines the effective end index of a selection, optionally expanding to a full line.
     * @param {string} fullContent The entire text content.
     * @param {number} currentEnd The current selection end.
     * @param {boolean} expandToLine If true, expands to the end of the line.
     * @returns {number} The adjusted end index.
     */
    const fetchTextRangeEnd = (fullContent, currentEnd, expandToLine) => {
      if (!expandToLine) return currentEnd;
      let adjustedEnd = currentEnd;
      while (adjustedEnd < fullContent.length && fullContent[adjustedEnd] !== '\n') {
        adjustedEnd++;
      }
      return adjustedEnd;
    };

    /**
     * Retrieves the current text selection within the editable area.
     * Supports modern browsers and older IE.
     * @param {boolean} expandToLine If true, selection is expanded to cover full lines.
     * @returns {object} An object containing start, end, length, and text of the selection.
     */
    const retrieveCurrentSelection = (expandToLine = false) => {
      if ('selectionStart' in editableElement) { // Modern browsers
        const initialStart = editableElement.selectionStart;
        const initialEnd = editableElement.selectionEnd;
        const finalStart = fetchTextRangeStart(editableElement.value, initialStart, expandToLine);
        const finalEnd = fetchTextRangeEnd(editableElement.value, initialEnd, expandToLine);
        const selectedLength = finalEnd - finalStart;
        return {
          start: finalStart,
          end: finalEnd,
          length: selectedLength,
          text: editableElement.value.substring(finalStart, finalEnd)
        };
      } else if (document.selection) { // IE < 9
        editableElement.focus();
        const docRange = document.selection.createRange();
        if (docRange === null) {
          return { start: 0, end: editableElement.value.length, length: 0, text: '' };
        }

        const editorRange = editableElement.createTextRange();
        const cloneRange = editorRange.duplicate();
        editorRange.moveToBookmark(docRange.getBookmark());
        cloneRange.setEndPoint('EndToStart', editorRange);

        const ieStart = cloneRange.text.length;
        const ieEnd = ieStart + docRange.text.length;
        
        if (expandToLine) {
            const finalStart = fetchTextRangeStart(editableElement.value, ieStart, true);
            const finalEnd = fetchTextRangeEnd(editableElement.value, ieEnd, true);
            return {
                start: finalStart,
                end: finalEnd,
                length: finalEnd - finalStart,
                text: editableElement.value.substring(finalStart, finalEnd)
            };
        }

        return {
          start: ieStart,
          end: ieEnd,
          length: docRange.text.length,
          text: docRange.text
        };
      }
      return { start: 0, end: 0, length: 0, text: '' }; // Fallback for unsupported browsers
    };

    /**
     * Replaces the current selection with new text.
     * @param {string} newText The text to insert.
     * @param {boolean} expandToLine If true, replacement applies to full lines.
     */
    const applyTextChange = (newText, expandToLine = false) => {
      if ('selectionStart' in editableElement) { // Modern browsers
        const initialStart = editableElement.selectionStart;
        const initialEnd = editableElement.selectionEnd;
        const finalStart = fetchTextRangeStart(editableElement.value, initialStart, expandToLine);
        const finalEnd = fetchTextRangeEnd(editableElement.value, initialEnd, expandToLine);

        editableElement.value = editableElement.value.substring(0, finalStart) + newText + editableElement.value.substring(finalEnd);
        editableElement.selectionStart = finalStart;
        editableElement.selectionEnd = finalStart + newText.length;
        editableElement.focus();
      } else if (document.selection) { // IE < 9
        editableElement.focus();
        const currentRange = document.selection.createRange();
        
        if (expandToLine) {
            const currentSelection = retrieveCurrentSelection(true); // Get expanded range
            const newContent = editableElement.value.substring(0, currentSelection.start) + newText + editableElement.value.substring(currentSelection.end);
            editableElement.value = newContent;
            // Reposition cursor after full line replacement
            const tempRange = editableElement.createTextRange();
            tempRange.collapse(true);
            tempRange.moveEnd('character', currentSelection.start + newText.length);
            tempRange.moveStart('character', currentSelection.start);
            tempRange.select();
        } else {
            currentRange.text = newText;
        }
      }
    };

    // --- History Management ---

    let reversionTimerHandle = 0; // Timer for throttling history snapshots.

    /**
     * Records the current content state into the history trail.
     * Throttled to avoid excessive history entries.
     */
    const recordContentState = () => {
      clearTimeout(reversionTimerHandle);
      reversionTimerHandle = setTimeout(() => {
        const currentContent = editableElement.value;
        if (currentContent !== editTrail[trailIndex]) { // Only push if content actually changed
          trailIndex++;
          editTrail[trailIndex] = currentContent;
          // If we were in an 'undo' state and then typed, truncate future history.
          if (editTrail.length > trailIndex + 1) {
            editTrail.splice(trailIndex + 1); // Remove all elements after current index
            redoButton.prop('disabled', true); // Disable redo button after new entry
          }
          undoButton.prop('disabled', false); // Enable undo button
        }
        updateOutputDisplay();
      }, mergedSettings.reversionDelayMs);
    };

    /**
     * Reverts the editor content to a previous state in the history.
     */
    const revertToPreviousState = () => {
      if (trailIndex > 0) {
        trailIndex--;
        editableElement.value = editTrail[trailIndex];
        redoButton.prop('disabled', false); // Enable redo button
        updateOutputDisplay();
      }
      if (trailIndex === 0) {
        undoButton.prop('disabled', true); // Disable undo if at the beginning of history
      }
    };

    /**
     * Advances the editor content to a future state in the history (after an undo).
     */
    const advanceToNextState = () => {
      if (trailIndex < editTrail.length - 1) {
        trailIndex++;
        editableElement.value = editTrail[trailIndex];
        undoButton.prop('disabled', false); // Enable undo button
        updateOutputDisplay();
      }
      if (trailIndex === editTrail.length - 1) {
        redoButton.prop('disabled', true); // Disable redo if at the end of history
      }
    };

    // --- Preview Rendering ---

    let previewTimerHandle = 0; // Timer for throttling preview updates.

    /**
     * Updates the HTML preview panel with the current Markdown content.
     * @param {boolean} immediateRender If true, bypasses throttling and renders immediately.
     */
    const updateOutputDisplay = (immediateRender = false) => {
      if (!mdProcessor) { // Guard clause: ensure converter exists
        console.warn("Markdown processor not initialized.");
        return;
      }

      if (!immediateRender) {
        clearTimeout(previewTimerHandle);
        previewTimerHandle = setTimeout(() => {
          displayPanel.html(mdProcessor.makeHtml(editableElement.value));
          inputArea.trigger('composer.contentChanged', editableElement); // Custom event for external listeners
        }, mergedSettings.previewUpdateDelayMs);
      } else {
        displayPanel.html(mdProcessor.makeHtml(editableElement.value));
        inputArea.trigger('composer.contentChanged', editableElement);
      }
    };

    // --- Toolbar Initialization ---

    // Populate the toolbar with buttons based on configured actions.
    mergedSettings.toolActions.forEach(actionKey => {
      controlBar.append(buildActionBtn(actionKey));
    });

    const undoButton = controlBar.find('.action-undo');
    const redoButton = controlBar.find('.action-redo');

    // --- Action-specific Dialogs ---

    /**
     * Prompts the user for link/image details and applies the formatting.
     * @param {function(string, string): string} formatCallback A function to format the output Markdown string.
     */
    const promptForUrlAndText = (formatCallback) => {
      const currentSelection = retrieveCurrentSelection().text.trim();
      const linkPromptForm = jq(
        `<form class="editor-link-prompt" action="#">
          <input placeholder="${mergedSettings.localeStrings['link-title-placeholder']}" type="text" class="prompt-input prompt-title">
          <input placeholder="${mergedSettings.localeStrings['link-url-placeholder']}" type="url" class="prompt-input prompt-href">
          ${buildActionBtn('confirm')}${buildActionBtn('cancel')}
        </form>`
      );

      const dismissPrompt = () => {
        linkPromptForm.remove();
        controlBar.show();
        return false;
      };

      const processInput = () => {
        const urlInput = linkPromptForm.find('.prompt-href');
        const titleInput = linkPromptForm.find('.prompt-title');
        const urlValue = urlInput.val().trim();
        const titleValue = titleInput.val().trim() || urlValue; // Title defaults to URL if empty.

        if (!urlValue || !/^https?:\/\/\S+$/.test(urlValue)) { // Basic URL format validation
            alert(mergedSettings.localeStrings['url-required']);
            urlInput.focus();
            return false;
        }

        applyTextChange(formatCallback(titleValue, urlValue));
        recordContentState();
        dismissPrompt();
        return false;
      };

      controlBar.hide().after(linkPromptForm); // Hide toolbar, show prompt form.

      linkPromptForm
        .on('click', '.editor-btn.action-confirm', processInput)
        .on('click', '.editor-btn.action-cancel', dismissPrompt)
        .on('keyup', '.prompt-input', function(event) {
          if (event.keyCode === 13) { // Enter key
            processInput();
          } else if (event.keyCode === 27) { // Escape key
            dismissPrompt();
          }
        });

      // Pre-fill fields based on current selection heuristic.
      if (currentSelection && /^https?:\/\//i.test(currentSelection)) {
        linkPromptForm.find('.prompt-href').val(currentSelection);
        linkPromptForm.find('.prompt-title').focus();
      } else {
        linkPromptForm.find('.prompt-title').val(currentSelection);
        linkPromptForm.find('.prompt-href').focus();
      }
    };

    /**
     * Applies or removes Markdown formatting based on selection and command options.
     * @param {object} operationOpts Configuration for the text manipulation.
     * @param {RegExp} operationOpts.pattern Regex to detect existing formatting.
     * @param {function(string): string} operationOpts.applyFormatter Function to apply formatting.
     * @param {function(string): string} [operationOpts.removeFormatter] Optional function to remove formatting.
     * @param {boolean} [operationOpts.block=false] If true, operate on entire lines.
     */
    const manipulateSelection = (operationOpts) => {
      const currentSegment = retrieveCurrentSelection(operationOpts.block).text;
      
      if (operationOpts.block === false && currentSegment.includes('\n')) {
          // For inline commands, ignore multi-line selections unless explicitly block-level.
          return;
      }

      let formattedValue;
      const matchResult = operationOpts.pattern.exec(currentSegment);

      if (matchResult) { // If pattern matches, assume formatting exists.
        formattedValue = operationOpts.removeFormatter ? operationOpts.removeFormatter(currentSegment, operationOpts) : (matchResult[1] || '');
      } else { // Otherwise, apply formatting.
        formattedValue = operationOpts.applyFormatter(currentSegment);
      }
      applyTextChange(formattedValue, operationOpts.block);
    };

    // --- Command Definitions ---

    // Array of editor commands, including their handlers and keyboard shortcuts.
    const editorCommands = [
      {
        actionId: 'bold',
        actionCallback: () => {
          manipulateSelection({
            applyFormatter: (val) => `**${val.trim()}**`,
            pattern: /^\*\*(.*)\*\*$/,
            removeFormatter: (val) => val.replace(/^\*\*(.*)\*\*$/, '$1') // Explicit removal
          });
          recordContentState();
        }
      },
      {
        actionId: 'italic',
        actionCallback: () => {
          manipulateSelection({
            applyFormatter: (val) => `*${val.trim()}*`,
            pattern: /^\*((\*\*)?([^*]*)(\*\*))?\*$/, // Matches both *text* and **text** for italic removal edge case
            removeFormatter: (val) => val.replace(/^\*((\*\*)?([^*]*)(\*\*))?\*$/, '$3') // Extract inner text
          });
          recordContentState();
        }
      },
      {
        actionId: 'link',
        keyBinding: 'cmd+k, ctrl+k',
        actionCallback: () => {
          promptForUrlAndText((title, url) => `[${title}](${url})`);
        }
      },
      {
        actionId: 'code',
        keyBinding: 'shift+cmd+p, shift+ctrl+p',
        actionCallback: () => {
          manipulateSelection({
            applyFormatter: (val) => `\`${val}\``,
            pattern: /^`([^`]*)`$/,
            removeFormatter: (val) => val.replace(/^`([^`]*)`$/, '$1')
          });
          recordContentState();
        }
      },
      {
        actionId: 'blockquote',
        keyBinding: 'cmd+\', ctrl+\'',
        actionCallback: () => {
          manipulateSelection({
            applyFormatter: (val) => '> ' + val.replace(/\n/g, '\n> '),
            removeFormatter: (val) => val.replace(/(^|\n)>[ \t]*(.*)/g, "$1$2"),
            pattern: /((^|\n)>.*)+$/, // Matches lines starting with >
            block: true
          });
          recordContentState();
        }
      },
      {
        actionId: 'image',
        keyBinding: 'shift+cmd+i, shift+ctrl+i',
        actionCallback: () => {
          promptForUrlAndText((title, url) => `![${title}](${url} "${title}")`);
        }
      },
      {
        actionId: 'heading',
        actionCallback: () => {
          manipulateSelection({
            applyFormatter: (val) => `# ${val}`, // Add a space after # for better markdown
            removeFormatter: (val) => val.replace(/^#+\s*(.*)$/, '$1'), // Remove any number of # and optional space
            pattern: /^(#+)\s*(.*)$/, // Matches one or more # at start of line
            block: true
          });
          recordContentState();
        }
      },
      {
        actionId: 'unorderedlist',
        keyBinding: 'shift+cmd+l, shift+ctrl+l',
        actionCallback: () => {
          manipulateSelection({
            applyFormatter: (val) => '* ' + val.replace(/\n/g, '\n* '),
            removeFormatter: (val) => val.replace(/^[\s\t]*\*+\s*/mg, ""), // Remove * and any leading whitespace
            pattern: /^([\s\t]*\*.*)*$/, // Matches lines starting with *
            block: true
          });
          recordContentState();
        }
      },
      {
        actionId: 'undo',
        keyBinding: 'cmd+z, ctrl+z',
        actionCallback: revertToPreviousState
      },
      {
        actionId: 'redo',
        keyBinding: 'cmd+y, ctrl+y',
        actionCallback: advanceToNextState
      },
      {
        actionId: 'help',
        keyBinding: 'shift+cmd+h, shift+ctrl+h',
        actionCallback: () => {
          window.open('https://www.markdownguide.org/basic-syntax/', '_blank'); // Updated help URL
        }
      }
    ];

    // --- Keyboard Shortcut Management ---

    // Override the default key.js filter to ensure shortcuts work inside textarea.
    // Assuming 'key.js' library is available globally.
    if (typeof key !== 'undefined') {
        key.filter = function (event) {
            const targetTagName = (event.target || event.srcElement).tagName;
            // Allow shortcuts within TEXTAREA by default, unless specific elements are excluded.
            return !(targetTagName === 'INPUT' || targetTagName === 'SELECT');
        };

        // Assign handlers for each command.
        editorCommands.forEach(commandEntry => {
            // Mouse click event binding for toolbar buttons.
            controlBar.on('click', `.editor-btn.action-${commandEntry.actionId}`, commandEntry.actionCallback);

            // Keyboard shortcut binding.
            if (commandEntry.keyBinding) {
                key(commandEntry.keyBinding, 'composerScope', commandEntry.actionCallback);
            }
        });
    } else {
        console.warn("Key.js library not found. Keyboard shortcuts will not be active.");
    }


    // --- Editor Focus and Scope Management ---

    inputArea
      .on('focusin', function() {
        // Set keyboard scope when editor is focused.
        if (typeof key !== 'undefined') {
            key.setScope('composerScope');
        }
      })
      .on('focusout', function() {
        // Reset keyboard scope when editor loses focus.
        if (typeof key !== 'undefined') {
            key.setScope('all'); // Revert to 'all' or default scope.
        }
      });

    // --- Initialization Sequence ---

    // Set initial content if provided.
    if (mergedSettings.initialContent !== undefined && mergedSettings.initialContent !== null) {
      inputArea.val(mergedSettings.initialContent);
    }

    // Attach the custom text input observer.
    inputArea.observeTextInput(recordContentState);

    // Initialize history with the current content.
    editTrail[trailIndex] = editableElement.value;
    updateOutputDisplay(true); // Perform an immediate initial render.
    redoButton.prop('disabled', true); // Redo is disabled initially.
    undoButton.prop('disabled', true); // Undo is disabled initially as well.

    // Exposed API for testing (if enabled in settings).
    if (mergedSettings.exposedApiForTesting) {
      const api = mergedSettings.exposedApiForTesting;
      api.recordState = recordContentState;
      api.revertState = revertToPreviousState;
      api.contentHistory = editTrail;
      api.processor = mdProcessor; // Expose processor for advanced testing.
    }

    return this; // Allow chaining.
  };

})(jQuery);