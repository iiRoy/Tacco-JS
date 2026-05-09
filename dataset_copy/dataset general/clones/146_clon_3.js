(function(jq) {

  // --- Internal Text Manipulation Routines ---

  // Determines the current character index range for a text selection within an input element.
  // This helper function accounts for differences in how browsers handle text selections.
  const obtainTextCursorRange = function(targetInput) {
    // If the target element is not valid or empty, return a default zero range.
    if (!targetInput || targetInput.length === 0) {
      return {
        startIndex: 0,
        endIndex: 0
      };
    }

    let cursorStartPos = 0;
    let cursorEndPos = 0;
    const domElement = targetInput.get(0); // Access the native DOM element

    // Standard-compliant browsers (e.g., Chrome, Firefox, Safari)
    if (typeof domElement.selectionStart === "number" && typeof domElement.selectionEnd === "number") {
      cursorStartPos = domElement.selectionStart;
      cursorEndPos = domElement.selectionEnd;
    } else if (document.selection && domElement.createTextRange) {
      // Older Internet Explorer compatibility (IE < 9)
      const activeRange = document.selection.createRange();
      const fullRange = activeRange.duplicate();
      fullRange.moveToElementText(domElement);
      fullRange.setEndPoint('EndToEnd', activeRange); // Position fullRange's end at activeRange's end

      cursorStartPos = fullRange.text.length - activeRange.text.length;
      cursorEndPos = cursorStartPos + activeRange.text.length;

      // IE's TextRange API interprets line breaks (\r\n) as two characters,
      // while JavaScript's string length counts them as one (\n).
      // We must adjust the indices to match JavaScript's string character counting.
      let lineBreakCount = 0;
      const elementValue = domElement.value;
      for (let k = 0; k < cursorStartPos; k++) {
        if (elementValue.charAt(k) === '\r') {
          lineBreakCount++;
        }
      }
      cursorStartPos -= lineBreakCount;

      lineBreakCount = 0; // Reset counter for the end position
      for (let k = 0; k < cursorEndPos; k++) {
        if (elementValue.charAt(k) === '\r') {
          lineBreakCount++;
        }
      }
      cursorEndPos -= lineBreakCount;
    }

    // Ensure that calculated indices are never negative.
    cursorStartPos = Math.max(0, cursorStartPos);
    cursorEndPos = Math.max(0, cursorEndPos);

    return {
      startIndex: cursorStartPos,
      endIndex: cursorEndPos
    };
  };

  // Retrieves the currently highlighted portion of text from a textarea.
  const extractSelectedSegment = function(targetInput) {
    if (!targetInput || targetInput.length === 0) {
      console.warn("Attempted to retrieve selection from an invalid or missing element.");
      return ''; // Return empty string for invalid input
    }

    const rangeInfo = obtainTextCursorRange(targetInput);
    // If start and end indices are identical, no text is actually selected.
    if (rangeInfo.startIndex === rangeInfo.endIndex) {
      return '';
    }

    const completeText = targetInput.val();
    return completeText.substring(rangeInfo.startIndex, rangeInfo.endIndex);
  };

  // Replaces the currently selected text (or inserts at caret) with a new string.
  // Provides options for re-selecting the new text or placing the caret at an offset.
  const updateContentWithReplacement = function(
    targetInput,
    newContent,
    shouldMaintainSelection = true, // By default, select the newly inserted/replaced text
    caretOffset = null // Specific caret position relative to the start of the new text
  ) {
    // Basic validation for input parameters.
    if (!targetInput || targetInput.length === 0 || typeof newContent !== 'string') {
      console.error("Invalid arguments for content replacement operation.");
      return false;
    }

    const rangeInfo = obtainTextCursorRange(targetInput);
    const currentFullText = targetInput.val();
    const initialScrollPosition = targetInput[0].scrollTop || null;

    // Construct the updated text by splicing in the new content.
    const modifiedText = currentFullText.substring(0, rangeInfo.startIndex) +
                         newContent +
                         currentFullText.substring(rangeInfo.endIndex);

    targetInput.val(modifiedText); // Update the textarea's value
    targetInput[0].focus(); // Ensure the textarea remains focused

    // Re-establish selection or caret position if requested.
    if (shouldMaintainSelection) {
      const targetDomElement = targetInput[0];
      let newSelectionStart = rangeInfo.startIndex;
      let newSelectionEnd = rangeInfo.startIndex + newContent.length;

      // Adjust selection/caret based on provided offset.
      if (caretOffset !== null && typeof caretOffset === 'number') {
        newSelectionStart = rangeInfo.startIndex + caretOffset;
        newSelectionEnd = newSelectionStart; // Collapse selection to a caret
      }

      if (targetDomElement.setSelectionRange) {
        // Modern browser method
        targetDomElement.setSelectionRange(newSelectionStart, newSelectionEnd);
      } else if (targetDomElement.createTextRange) {
        // Legacy IE method
        const textSelectionRange = targetDomElement.createTextRange();
        textSelectionRange.collapse(true); // Start at the beginning of the element

        // Move the range to the desired selection boundaries.
        textSelectionRange.moveEnd('character', newSelectionEnd);
        textSelectionRange.moveStart('character', newSelectionStart);
        textSelectionRange.select();
      }
    }

    // Attempt to restore the scroll position, if it was recorded.
    if (initialScrollPosition !== null) {
      // A small timeout can sometimes prevent scroll position jumps in certain browsers.
      setTimeout(() => {
        targetInput[0].scrollTop = initialScrollPosition;
      }, 5);
    }
    return true;
  };

  // Expands the current text selection to encompass the entire line(s) where it resides.
  const highlightCurrentLine = function(targetInput) {
    if (!targetInput || targetInput.length === 0) return; // Exit if no valid input.

    const rangeInfo = obtainTextCursorRange(targetInput);
    const domElement = targetInput.get(0);
    const contentText = domElement.value;

    let beginningOfLine = rangeInfo.startIndex;
    // Scan backwards to find the start of the line (or beginning of the text).
    while (beginningOfLine > 0 && contentText.charAt(beginningOfLine - 1) !== '\n') {
      beginningOfLine--;
    }

    let endOfLine = rangeInfo.endIndex;
    // Scan forwards to find the end of the line (or end of the text).
    while (endOfLine < contentText.length && contentText.charAt(endOfLine) !== '\n') {
      endOfLine++;
    }

    // Apply the new, expanded selection.
    if (domElement.setSelectionRange) {
      domElement.setSelectionRange(beginningOfLine, endOfLine);
    } else if (domElement.createTextRange) {
      const textRange = domElement.createTextRange();
      textRange.collapse(true);
      textRange.moveStart('character', beginningOfLine);
      textRange.moveEnd('character', endOfLine);
      textRange.select();
    }
  };


  // --- User Interface and Event Management ---

  // Default configuration options for the editor plugin.
  const pluginDefaultSettings = {
    toolbarVariant: 'standard', // Future expansion: 'basic', 'full', etc.
    enableRealtimePreview: true,
    previewUpdateDelay: 400 // Milliseconds for debouncing live preview updates
  };

  // Utility function for debouncing frequent function calls (e.g., on keyup).
  const createDebouncedFunction = (callbackFunc, delayDuration) => {
    let timerHandle;
    return (...args) => {
      clearTimeout(timerHandle);
      timerHandle = setTimeout(() => callbackFunc.apply(this, args), delayDuration);
    };
  };

  // Dynamically adds the markdown formatting toolbar elements before the textarea.
  const injectToolbarUI = function(targetTextarea) {
    if (!targetTextarea || targetTextarea.length === 0) {
      console.error("Toolbar injection failed: target element is invalid.");
      return;
    }

    const toolbarMarkup = `
      <div class="editor-action-bar">
        <div class="action-control-group">
          <button type="button" class="ctrl-btn ctrl-bold" title="Make text bold"><strong>B</strong></button>
          <button type="button" class="ctrl-btn ctrl-italic" title="Italicize text"><em>I</em></button>
          <button type="button" class="ctrl-btn ctrl-inline-code" title="Insert inline code"><code>&lt;/&gt;</code></button>
          <span class="ctrl-separator">|</span>
          <button type="button" class="ctrl-btn ctrl-unordered-list" title="Add unordered list">&#x2022; List</button>
          <button type="button" class="ctrl-btn ctrl-ordered-list" title="Add ordered list">1. List</button>
          <button type="button" class="ctrl-btn ctrl-blockquote" title="Create blockquote">&#x201C; Quote</button>
          <button type="button" class="ctrl-btn ctrl-horizontal-rule" title="Insert horizontal rule">---</button>
          <span class="ctrl-separator">|</span>
          <button type="button" class="ctrl-btn ctrl-heading-1" title="Heading Level 1">H1</button>
          <button type="button" class="ctrl-btn ctrl-heading-2" title="Heading Level 2">H2</button>
          <button type="button" class="ctrl-btn ctrl-heading-3" title="Heading Level 3">H3</button>
          <span class="ctrl-separator">|</span>
          <button type="button" class="ctrl-btn ctrl-insert-link" title="Insert a hyperlink">Link</button>
          <button type="button" class="ctrl-btn ctrl-insert-image" title="Insert an image">Image</button>
          <span class="ctrl-separator">|</span>
          <button type="button" class="ctrl-btn ctrl-help" title="Markdown Help">?</button>
        </div>
      </div>`;
    targetTextarea.before(toolbarMarkup);
  };

  // Configures and attaches all necessary event listeners for the editor's UI components.
  const establishEventHandlers = function(editorHostContainer, currentConfig) {
    const markdownProcessor = typeof Showdown !== 'undefined' ? new Showdown.converter() : null;
    if (!markdownProcessor) {
      console.warn("Showdown converter library not detected. Live preview and certain markdown features will be disabled.");
    }

    // Prevent default browser behavior (e.g., navigation) for toolbar buttons.
    editorHostContainer.on("click", ".ctrl-btn", function(event) {
      event.preventDefault();
    });

    // Event handlers for specific formatting actions.
    editorHostContainer.on("click", ".ctrl-bold", function() {
      jq.editorManager.applyFormatting(editorHostContainer, /([^\n]+)([\n\s]*)/g, "**$1**$2");
    });
    editorHostContainer.on("click", ".ctrl-italic", function() {
      jq.editorManager.applyFormatting(editorHostContainer, /([^\n]+)([\n\s]*)/g, "_$1_$2");
    });
    editorHostContainer.on("click", ".ctrl-inline-code", function() {
      jq.editorManager.applyFormatting(editorHostContainer, /([\s\S]*)/, "`$1`");
    });
    editorHostContainer.on("click", ".ctrl-horizontal-rule", function() {
      jq.editorManager.applyFormatting(editorHostContainer, false, false, false, "\n---\n");
    });
    editorHostContainer.on("click", ".ctrl-unordered-list", function() {
      jq.editorManager.applyFormatting(editorHostContainer, /(.+)([\n]?)/g, "* $1$2", true);
    });
    editorHostContainer.on("click", ".ctrl-ordered-list", function() {
      let listItemIndex = 0; // Counter for ordered list items
      jq.editorManager.applyFormatting(editorHostContainer, /(.+)([\n]?)/g, (match, content, lineEnd) => {
        listItemIndex++;
        return `${listItemIndex}. ${content}${lineEnd}`;
      }, true);
    });
    editorHostContainer.on("click", ".ctrl-blockquote", function() {
      jq.editorManager.applyFormatting(editorHostContainer, /(.+)([\n]?)/g, "> $1$2");
    });
    editorHostContainer.on("click", ".ctrl-heading-1", function() {
      jq.editorManager.applyFormatting(editorHostContainer, /(.+)([\n]?)/g, "# $1$2", true);
    });
    editorHostContainer.on("click", ".ctrl-heading-2", function() {
      jq.editorManager.applyFormatting(editorHostContainer, /(.+)([\n]?)/g, "## $1$2", true);
    });
    editorHostContainer.on("click", ".ctrl-heading-3", function() {
      jq.editorManager.applyFormatting(editorHostContainer, /(.+)([\n]?)/g, "### $1$2", true);
    });

    // Link insertion dialog handling.
    editorHostContainer.on("click", ".ctrl-insert-link", function() {
      const targetTextarea = editorHostContainer.find('textarea.editor-content-input');
      const currentSelection = extractSelectedSegment(targetTextarea);
      const linkModalHtml = `
        <div id="editor-link-prompt" class="action-dialog">
          <h4>Add Hyperlink</h4>
          <div class="dialog-content">
            <div class="input-row">
              <label for="link-text-val">Link Display Text</label>
              <input type="text" id="link-text-val" class="dialog-input-field" value="${currentSelection}">
            </div>
            <div class="input-row">
              <label for="link-url-val">Target URL</label>
              <input type="text" id="link-url-val" class="dialog-input-field" placeholder="https://www.example.com">
            </div>
          </div>
          <div class="dialog-controls">
            <button type="button" class="dialog-action-btn dialog-cancel">Cancel</button>
            <button type="button" class="dialog-action-btn dialog-confirm">Apply Link</button>
          </div>
        </div>`;
      // Append the dialog to the body for a modal effect.
      jq('body').append(linkModalHtml);
      jq('#editor-link-prompt').data("linkedEditor", editorHostContainer); // Store reference to the editor.
    });

    // Delegated event handlers for dialog buttons (assuming dialogs are in the body).
    jq("body").on("click", ".dialog-confirm", function() {
      const dialogElement = jq(this).closest(".action-dialog");
      const associatedEditor = dialogElement.data("linkedEditor");
      const urlValue = dialogElement.find(".dialog-input-field#link-url-val").val();
      const textValue = dialogElement.find(".dialog-input-field#link-text-val").val();

      if (associatedEditor && urlValue && textValue) {
        jq.editorManager.applyFormatting(associatedEditor, /([\s\S]*)/, `[${textValue}](${urlValue})`);
      }
      dialogElement.remove(); // Remove the dialog from the DOM.
    });

    jq("body").on("click", ".dialog-cancel", function() {
      jq(this).closest(".action-dialog").remove(); // Remove the dialog.
    });

    // Preview button toggle logic.
    editorHostContainer.find('.preview-mode-toggle').on("click", function() {
      if (markdownProcessor) {
        const rawContent = editorHostContainer.find('.editor-content-input').val();
        const generatedHtml = `<div class="full-screen-preview-modal">${markdownProcessor.makeHtml(rawContent)}</div>`;
        jq('body').append(generatedHtml); // Show preview in a temporary modal.
        // Simple click to close the preview modal.
        jq('.full-screen-preview-modal').on('click', function() {
          jq(this).remove();
        });
      } else {
        alert("Markdown rendering is unavailable as the converter library was not found.");
      }
    });

    // Live preview updates, debounced for performance on rapid typing.
    const livePreviewDisplay = editorHostContainer.find(".live-rendered-output");
    if (currentConfig.enableRealtimePreview && livePreviewDisplay.length && markdownProcessor) {
      const updateLivePreview = () => {
        const currentTextValue = editorHostContainer.find('.editor-content-input').val();
        livePreviewDisplay.html(markdownProcessor.makeHtml(currentTextValue));
      };
      editorHostContainer.find('.editor-content-input').on('keyup', createDebouncedFunction(updateLivePreview, currentConfig.previewUpdateDelay));
      // Perform an initial render of the preview.
      updateLivePreview();
    }
  };


  // --- jQuery Plugin Integration ---

  const editorPluginMethods = {
    // Primary method for initializing the markdown editor on selected textarea(s).
    initEditor: function(customOptions) {
      const successfullyInitializedElements = [];

      this.each(function() {
        const currentTextarea = jq(this);
        // Combine default settings with any user-provided options.
        const effectiveSettings = jq.extend({}, pluginDefaultSettings, customOptions);

        // Assign a unique class for identification and styling.
        currentTextarea.addClass('editor-content-input');
        // Wrap the textarea in a main container for the editor UI.
        currentTextarea.wrap('<div class="markdown-editor-instance"></div>');
        const editorContainerWrapper = currentTextarea.closest('.markdown-editor-instance');

        // Insert UI elements: toolbar, live preview, and a preview toggle button.
        injectToolbarUI(currentTextarea);
        editorContainerWrapper.append('<div class="live-rendered-output"></div>');
        editorContainerWrapper.prepend('<button type="button" class="preview-mode-toggle">Toggle Preview</button>');

        // Apply a general container class to relevant parent for layout.
        const parentFieldset = currentTextarea.closest('fieldset');
        const parentForm = currentTextarea.closest('form');
        if (parentFieldset.length) {
          parentFieldset.addClass('editor-parent-context');
        } else if (parentForm.length) {
          parentForm.addClass('editor-parent-context');
        } else {
          editorContainerWrapper.addClass('editor-parent-context'); // Fallback to wrapper itself.
        }

        // Attach all event listeners to the newly constructed editor.
        establishEventHandlers(editorContainerWrapper, effectiveSettings);
        successfullyInitializedElements.push(this);
      });
      return jq(successfullyInitializedElements); // Return jQuery object of initialized elements.
    },

    // A public utility to manually add the toolbar to an element.
    addToolbarToElement: function() {
      this.each(function() {
        injectToolbarUI(jq(this));
      });
      return this; // Enable chaining.
    }
  };

  // Expose core editor functionality directly under the jQuery object for modular access.
  jq.editorManager = {};
  jq.editorManager.applyFormatting = function(
    containerElement,
    searchRegex,
    replacementLogic,
    shouldProcessEntireLine = false,
    contentToAppend = null
  ) {
    const targetTextarea = containerElement.find('textarea.editor-content-input');
    if (!targetTextarea.length) {
      console.error("Target textarea not found within the specified editor container.");
      return;
    }

    if (shouldProcessEntireLine) {
      highlightCurrentLine(targetTextarea);
    }

    let currentlySelectedText = extractSelectedSegment(targetTextarea);
    let finalReplacementText = currentlySelectedText;
    let shouldUpdateSelection = true;
    let explicitCaretOffset = null;

    if (searchRegex && replacementLogic) {
      if (typeof replacementLogic === 'function') {
        // If replacementLogic is a function, it handles the replacement dynamically.
        finalReplacementText = currentlySelectedText.replace(searchRegex, replacementLogic);
      } else {
        // Standard string replacement with regex.
        finalReplacementText = currentlySelectedText.replace(searchRegex, replacementLogic);
        // Clean up any unmatched backreferences (e.g., $1, $2) that might remain.
        finalReplacementText = finalReplacementText.replace(/\$[\d]/g, '');
      }

      // Special handling for cases where replacement might yield an empty string (e.g., deleting selection).
      if (finalReplacementText === '' && typeof replacementLogic === 'string') {
        explicitCaretOffset = replacementLogic.indexOf('$1');
        finalReplacementText = replacementLogic.replace(/\$[\d]/g, ''); // Ensure no backrefs remain.
        if (explicitCaretOffset === -1) {
          explicitCaretOffset = Math.floor(replacementLogic.length / 2); // Default caret to middle.
        }
      }
    }

    if (contentToAppend !== null) {
      // If no text was selected, or the main replacement didn't alter it,
      // appending should not lead to re-selecting the original text segment.
      if (finalReplacementText === currentlySelectedText) {
        shouldUpdateSelection = false;
      }
      finalReplacementText += contentToAppend;
    }

    if (finalReplacementText !== null && finalReplacementText !== undefined) {
      updateContentWithReplacement(targetTextarea, finalReplacementText, shouldUpdateSelection, explicitCaretOffset);
    } else {
      console.warn("No valid text generated for replacement operation.");
    }
    // Trigger a synthetic 'keyup' event to ensure live preview or other reactive components update.
    targetTextarea.trigger('keyup');
  };

  // The main jQuery plugin entry point.
  jq.fn.enhancedTextarea = function(methodNameOrOptions) {
    // Check if the argument is a method name that exists in our pluginMethods.
    if (editorPluginMethods[methodNameOrOptions] && typeof editorPluginMethods[methodNameOrOptions] === 'function') {
      // Call the specified method, passing any additional arguments.
      const methodArguments = Array.prototype.slice.call(arguments, 1);
      return editorPluginMethods[methodNameOrOptions].apply(this, methodArguments);
    } else if (typeof methodNameOrOptions === 'object' || !methodNameOrOptions) {
      // If no argument or an options object is provided, initialize the editor.
      return editorPluginMethods.initEditor.apply(this, arguments);
    } else {
      // Handle cases where an unknown method name is passed.
      jq.error(`Method "${methodNameOrOptions}" does not exist on jQuery.enhancedTextarea.`);
      return this; // Maintain chainability even on error.
    }
  };

})(jQuery); // Pass jQuery to the immediately invoked function expression.