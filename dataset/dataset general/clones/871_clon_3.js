/*
 * Enhanced Text Formatting Module for Web Applications
 *
 * This module provides basic markdown-like text manipulation
 * functionalities for textarea elements, integrating with jQuery.
 *
 * Original source: https://github.com/digitalnature/MarkdownEditor
 */

;(function(jq, globalScope, domRoot, voidVal) {
  'use strict';

  // Defines the structural properties for various text formatting operations.
  // Each key represents a formatting type, with associated prefix, suffix, and default text.
  const formatDefinitions = {
    strong: { prefixMark: '**', suffixMark: '**', defaultText: 'Your bold text' },
    emphasis: { prefixMark: '*', suffixMark: '*', defaultText: 'Your emphasized text' },
    hyperlink: { prefixMark: '[', suffixMark: '][N]', defaultText: 'Add your link title' },
    mediaEmbed: { prefixMark: '![', suffixMark: '][N]', defaultText: 'Add image description' },
    blockQuote: { prefixMark: '', suffixMark: '', defaultText: '\n' + '> Place quoted text here' + '\n' },
    codeBlock: { prefixMark: '', suffixMark: '', defaultText: '\n' + '    Add your code block here' + '\n' },
    inlineCode: { prefixMark: '`', suffixMark: '`', defaultText: 'Add inline code here' },
  };

  // Helper utility to generate a string repeated 'num' times.
  const repeatString = (str, num) => {
    return new Array(num + 1).join(str);
  };

  // Normalizes the caret/selection offset in a textarea, accounting for
  // different newline conventions (e.g., CRLF vs LF) across browsers.
  const normalizeCaretOffset = (txtInput, posOffset) => {
    if (!txtInput || typeof txtInput.value !== 'string') {
      return posOffset;
    }
    const currentContent = txtInput.value;
    let adjustedPos = posOffset;

    // If CRLF newlines are present, adjust the offset to match LF-only indexing.
    if (currentContent.includes('\r\n')) {
      const lineBreakCount = (currentContent.substring(0, posOffset).match(/\r\n/g) || []).length;
      adjustedPos += lineBreakCount;
    }
    return adjustedPos;
  };

  // Positions the text cursor or sets a selection range within a textarea element.
  const positionTextCursor = (txtInput, startIdx, endIdx) => {
    if (!txtInput) return;

    txtInput.focus();

    // Ensure offsets are normalized for consistent behavior.
    const normalizedStart = normalizeCaretOffset(txtInput, startIdx);
    const normalizedEnd = normalizeCaretOffset(txtInput, endIdx);

    if (txtInput.setSelectionRange) {
      txtInput.setSelectionRange(normalizedStart, normalizedEnd);
    } else if (txtInput.createTextRange) { // Fallback for older IE browsers.
      const ieRange = txtInput.createTextRange();
      ieRange.collapse(true);
      ieRange.moveEnd('character', normalizedEnd);
      ieRange.moveStart('character', normalizedStart);
      ieRange.select();
    }
  };

  // Applies a given prefix string to each line within the currently selected
  // block of text in a textarea.
  const applyLinePrefix = (textInputArea, linePrefixStr, repeatCount) => {
    if (!textInputArea || !linePrefixStr || repeatCount === voidVal) {
      return;
    }

    const currentContent = textInputArea.value;
    let { selectionStart, selectionEnd } = textInputArea;

    // Determine the start of the line containing the selection start.
    let effectiveStart = currentContent.lastIndexOf('\n', selectionStart - 1);
    effectiveStart = (effectiveStart === -1) ? 0 : effectiveStart + 1;

    // Determine the end of the line containing the selection end.
    let effectiveEnd = currentContent.indexOf('\n', selectionEnd);
    effectiveEnd = (effectiveEnd === -1) ? currentContent.length : effectiveEnd;

    // Adjust `effectiveEnd` if the selection ends exactly at a newline character.
    if (selectionEnd > effectiveStart && currentContent.charAt(selectionEnd - 1) === '\n') {
      effectiveEnd = selectionEnd - 1;
    }

    const blockSelection = currentContent.substring(effectiveStart, effectiveEnd);
    const prefixToApply = repeatString(linePrefixStr, repeatCount);
    
    // Split the selected block into lines, add the prefix to each, then rejoin.
    const prefixedBlock = blockSelection
      .split('\n')
      .map(line => prefixToApply + line)
      .join('\n');

    // Update the textarea's content with the new prefixed block.
    textInputArea.value = currentContent.substring(0, effectiveStart) + prefixedBlock + currentContent.substring(effectiveEnd);

    // Calculate new selection boundaries, accounting for the added prefixes.
    const linesInBlock = blockSelection.split('\n').length;
    const totalPrefixLengthAdded = prefixToApply.length * linesInBlock;
    const newSelectionStart = selectionStart + totalPrefixLengthAdded;
    const newSelectionEnd = selectionEnd + totalPrefixLengthAdded;
    
    positionTextCursor(textInputArea, newSelectionStart, newSelectionEnd);
  };

  // jQuery plugin definition for the Enhanced Text Formatter.
  jq.fn.EnhancedTextFormatter = function() {

    // If no elements are selected, log a warning and return.
    if (this.length === 0) {
      console.warn("EnhancedTextFormatter: No elements selected for initialization.");
      return this;
    }

    return this.each(function() {
      const currentTextArea = this; // The textarea element being processed.
      const actionControlsContainer = jq('<div class="editor-toolbar" />'); // Container for formatting buttons.

      let resourceCounter = 0; // Tracks indexed resources (links/images) for unique IDs.

      // Define buttons and their properties for dynamic generation.
      const buttonDefinitions = [
        { key: 'strong', label: '<strong>B</strong>', title: 'Bold Text' },
        { key: 'emphasis', label: '<em>I</em>', title: 'Italic Text' },
        { key: 'hyperlink', label: 'Link', title: 'Insert Link' },
        { key: 'mediaEmbed', label: 'Image', title: 'Insert Image' },
        { key: 'blockQuote', label: 'Quote', title: 'Blockquote' },
        { key: 'inlineCode', label: 'Code', title: 'Insert Code' },
      ];

      // Dynamically generate and append buttons to the control container.
      buttonDefinitions.forEach(btn => {
        const buttonElement = jq(`<a class="editor-btn editor-btn-${btn.key}" data-format-type="${btn.key}" title="${btn.title}">${btn.label}</a>`);
        actionControlsContainer.append(buttonElement);
      });

      // Insert the control toolbar before the textarea.
      jq(currentTextArea).before(actionControlsContainer);

      // Attach a click handler to all dynamically generated buttons within the toolbar.
      actionControlsContainer.on('click', 'a.editor-btn', function(eventObj) {
        eventObj.preventDefault(); // Prevent default link behavior.
        currentTextArea.focus(); // Ensure the textarea is focused.

        const triggerButton = jq(this);
        let currentFormatKey = triggerButton.data('format-type'); // Retrieve format type from data attribute.

        const selectionBoundaries = { start: currentTextArea.selectionStart, end: currentTextArea.selectionEnd };
        let highlightedContent = currentTextArea.value.substring(selectionBoundaries.start, selectionBoundaries.end);

        // Check for surrounding characters to determine if selection is "isolated".
        const contentBeforeSelection = currentTextArea.value.charAt(selectionBoundaries.start - 1);
        const contentAfterSelection = currentTextArea.value.charAt(selectionBoundaries.end);
        const hasAdjacentChars = jq.trim(contentBeforeSelection + contentAfterSelection);

        // Logic to switch 'inlineCode' to 'codeBlock' if selection warrants it.
        if (currentFormatKey === 'inlineCode') {
          if (highlightedContent.includes('\n') || !hasAdjacentChars || currentTextArea.value.length < 1) {
            currentFormatKey = 'codeBlock';
          }
        }

        let activeFormatRule = jq.extend({}, formatDefinitions[currentFormatKey]);
        let trimmedDefault = activeFormatRule.defaultText.trim();
        let leadingSpaceCount = activeFormatRule.defaultText.indexOf(trimmedDefault);

        // Special handling for 'blockQuote' placeholder, which has intentional leading spaces.
        if (currentFormatKey === 'blockQuote') {
          trimmedDefault = trimmedDefault.substring(2); // Remove the initial '> ' for comparison.
          leadingSpaceCount += 2; // Adjust for the '> ' characters.
        }

        // If the selected text is already the exact default placeholder, do nothing.
        if (highlightedContent === trimmedDefault) {
          return false;
        }

        // Handle specific prompts for 'hyperlink' and 'mediaEmbed'.
        if (['hyperlink', 'mediaEmbed'].includes(currentFormatKey)) {
          const promptMessage = (currentFormatKey !== 'mediaEmbed') ? 'Enter the URL for your hyperlink:' : 'Enter the URL for your image:';
          let resourceURL = globalScope.prompt(promptMessage, 'http://');

          // If user cancels or enters an empty URL, abort the operation.
          if (!resourceURL || resourceURL.trim() === '') {
            return false;
          }

          resourceCounter++;
          activeFormatRule.suffixMark = activeFormatRule.suffixMark.replace('N', resourceCounter);
          
          // Append the resource definition to the end of the textarea content.
          currentTextArea.value += `\n\n  [${resourceCounter}]: ${resourceURL}`;
        }

        // Apply formatting based on whether text is selected or not.
        if (selectionBoundaries.start === selectionBoundaries.end) { // No text is highlighted.
          const contentBeforeCaret = currentTextArea.value.substring(0, selectionBoundaries.end);
          const contentAfterCaret = currentTextArea.value.substring(selectionBoundaries.end);

          // Insert the format's prefix, default text, and suffix.
          currentTextArea.value = contentBeforeCaret + activeFormatRule.prefixMark + activeFormatRule.defaultText + activeFormatRule.suffixMark + contentAfterCaret;

          // Position the caret within the newly inserted placeholder text.
          const newCaretPosition = selectionBoundaries.end + activeFormatRule.prefixMark.length + leadingSpaceCount;
          positionTextCursor(currentTextArea, newCaretPosition, newCaretPosition + trimmedDefault.length);

        } else { // Text is highlighted/selected.
          // For block-level formats, apply a line prefix.
          if (currentFormatKey === 'codeBlock') {
            applyLinePrefix(currentTextArea, ' ', 4);
          } else if (currentFormatKey === 'blockQuote') {
            applyLinePrefix(currentTextArea, '> ', 1);
          } else { // For inline formats, wrap the selected text with prefix/suffix.
            currentTextArea.value = currentTextArea.value.replace(highlightedContent, activeFormatRule.prefixMark + highlightedContent + activeFormatRule.suffixMark);
          }
        }
        return false; // Indicate that the event has been handled.
      });
    });
  };

})(jQuery, window, document);