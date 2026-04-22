class MarkdownTextProcessorCore {
  constructor(documentArea) {
    this.writingSurface = documentArea;
    this.editorHost = this.writingSurface.closest('fieldset') || this.writingSurface.closest('form') || this.writingSurface.parentNode;
    this.markdownFormatter = new Showdown.Converter();

    this.constructUserInterface();
    this.bindInteractionEvents();
  }

  // Obtains the current text selection range (start and end indices)
  obtainSelectionBoundary() {
    const targetElement = this.writingSurface;
    if (!targetElement) return { initial: 0, terminal: 0 };

    let initial = 0, terminal = 0;
    if (typeof targetElement.selectionStart === "number" && typeof targetElement.selectionEnd === "number") {
      initial = targetElement.selectionStart;
      terminal = targetElement.selectionEnd;
    } else if (document.selection) { // Legacy IE handling
      const activeRange = document.selection.createRange();
      const entireRange = activeRange.duplicate();
      entireRange.moveToElementText(targetElement);
      entireRange.setEndPoint('EndToEnd', activeRange);
      initial = entireRange.text.length - activeRange.text.length;
      terminal = initial + activeRange.text.length;

      // Adjust for IE's TextRange counting \r\n as two chars while .value counts as one \n
      let lineFeedCount = 0;
      for (let k = 0; k < initial; k++) {
        if (targetElement.value.charAt(k) === '\r') lineFeedCount++;
      }
      if (lineFeedCount > 0) initial -= lineFeedCount;

      lineFeedCount = 0;
      for (let k = 0; k < terminal; k++) {
        if (targetElement.value.charAt(k) === '\r') lineFeedCount++;
      }
      if (lineFeedCount > 0) terminal -= lineFeedCount;
    }
    return { initial: initial, terminal: terminal };
  }

  // Retrieves the currently selected text string
  retrieveCurrentSelection() {
    const boundary = this.obtainSelectionBoundary();
    return this.writingSurface.value.substring(boundary.initial, boundary.terminal);
  }

  // Replaces the selected text with new content and adjusts selection/cursor
  applyContentModification(newContent, shouldRehighlight, cursorMoveOffset) {
    const boundary = this.obtainSelectionBoundary();
    const completeContent = this.writingSurface.value;
    const scrollOffset = this.writingSurface.scrollTop;

    this.writingSurface.value = completeContent.substring(0, boundary.initial) + newContent + completeContent.substring(boundary.terminal);
    this.writingSurface.focus();

    let newInitial, newTerminal;
    if (shouldRehighlight !== false) {
      if (cursorMoveOffset !== null && cursorMoveOffset !== undefined) {
        newInitial = boundary.initial + cursorMoveOffset;
        newTerminal = boundary.initial + cursorMoveOffset;
      } else {
        newInitial = boundary.initial;
        newTerminal = boundary.initial + newContent.length;
      }

      if (this.writingSurface.setSelectionRange) {
        this.writingSurface.setSelectionRange(newInitial, newTerminal);
      } else if (this.writingSurface.createTextRange) { // Legacy IE handling
        const textRangeObject = this.writingSurface.createTextRange();
        textRangeObject.collapse(true);
        textRangeObject.moveEnd('character', newTerminal);
        textRangeObject.moveStart('character', newInitial);
        textRangeObject.select();
      }
    }

    if (scrollOffset !== null) {
      this.writingSurface.scrollTop = scrollOffset;
    }
  }

  // Expands the current selection to cover the entire line
  extendSelectionToLine() {
    const boundary = this.obtainSelectionBoundary();
    const contentValue = this.writingSurface.value;
    let lineStart = boundary.initial;

    while (lineStart > 0 && contentValue.charAt(lineStart - 1) !== '\n') {
      lineStart--;
    }
    this.writingSurface.setSelectionRange(lineStart, boundary.terminal);
  }

  // Executes a markdown formatting operation based on provided parameters
  processEditorOperation(pattern, substitution, lineEmphasis, additionalText) {
    const activeTextarea = this.writingSurface;
    if (lineEmphasis) this.extendSelectionToLine();

    const currentBoundary = this.obtainSelectionBoundary();
    let currentSelectionString = this.retrieveCurrentSelection();
    let alteredSelectionString = currentSelectionString;
    let rehighlightFlag = true;
    let insertionPoint = null;

    if (pattern && substitution) {
      alteredSelectionString = alteredSelectionString.replace(pattern, substitution);
      alteredSelectionString = alteredSelectionString.replace(/\$[\d]/g, ''); // Remove backreferences
      if (alteredSelectionString === '') {
        insertionPoint = substitution.indexOf('$1');
        alteredSelectionString = substitution.replace(/\$[\d]/g, '');
        if (insertionPoint === -1) insertionPoint = Math.floor(substitution.length / 2);
      }
    }

    if (additionalText) {
      if (alteredSelectionString === currentSelectionString) rehighlightFlag = false;
      alteredSelectionString += additionalText;
    }

    if (alteredSelectionString) {
      this.applyContentModification(alteredSelectionString, rehighlightFlag, insertionPoint);
    }
    
    // Trigger an event to simulate keyup for live preview
    const syntheticEvent = new Event('keyup');
    const editorBody = this.editorHost.querySelector('.editor-body');
    if (editorBody) {
      editorBody.dispatchEvent(syntheticEvent);
    }
  }

  // Builds and inserts the toolbar above the textarea
  constructUserInterface() {
    const toolbarOuter = document.createElement('div');
    toolbarOuter.className = 'function-bar';
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'function-buttons';

    const buttonSpecs = [
      { type: 'bold', label: 'Bold' },
      { type: 'italic', label: 'Italic' },
      { type: 'code', label: 'Code' },
      { type: 'divider' },
      { type: 'ul', label: 'Unordered List' },
      { type: 'ol', label: 'Ordered List' },
      { type: 'blockquote', label: 'Blockquote' },
      { type: 'hr', label: 'Horizontal Rule' },
      { type: 'divider' },
      { type: 'h1', label: 'h1' },
      { type: 'h2', label: 'h2' },
      { type: 'h3', label: 'h3' },
      { type: 'divider' },
      { type: 'link', label: 'Link' },
      { type: 'image', label: 'Image' },
      { type: 'divider' },
      { type: 'help', label: 'Help' }
    ];

    buttonSpecs.forEach(spec => {
      if (spec.type === 'divider') {
        const separator = document.createElement('span');
        separator.className = 'function-divider';
        separator.innerHTML = '&nbsp;';
        buttonContainer.appendChild(separator);
      } else {
        const actionLink = document.createElement('a');
        actionLink.href = '#';
        actionLink.className = `function-${spec.type} function-button`;
        const labelSpan = document.createElement('span');
        labelSpan.textContent = spec.label;
        actionLink.appendChild(labelSpan);
        buttonContainer.appendChild(actionLink);
      }
    });

    toolbarOuter.appendChild(buttonContainer);
    this.writingSurface.parentNode.insertBefore(toolbarOuter, this.writingSurface);

    this.writingSurface.classList.add('editor-body');
    if (this.editorHost) {
      this.editorHost.classList.add('editor');
    }
  }

  // Sets up event listeners for the toolbar and live preview
  bindInteractionEvents() {
    this.editorHost.addEventListener('click', (event) => {
      const clickedButton = event.target.closest('.function-button');
      if (clickedButton) {
        // Original code had 'e.preventDefault' (buggy), so we don't call preventDefault here
        const actionIdentifier = Array.from(clickedButton.classList).find(cls => cls.startsWith('function-'));
        this.processToolbarClick(actionIdentifier.replace('function-', ''));
      }
    });

    const previewButton = this.editorHost.querySelector('.preview');
    if (previewButton) {
      previewButton.addEventListener('click', (e) => {
        e.preventDefault(); // Prevent default for preview button for modal
        const textContent = this.writingSurface.value;
        const htmlOutput = this.markdownFormatter.makeHtml(textContent);
        this.displayCustomModal('<div class="preview-output">' + htmlOutput + '</div>', 'Preview Content');
      });
    }

    const liveOutputArea = this.editorHost.querySelector('.live-preview');
    if (liveOutputArea) {
      this.writingSurface.addEventListener('keyup', () => {
        liveOutputArea.innerHTML = this.markdownFormatter.makeHtml(this.writingSurface.value);
      });
      // Initial render for live preview
      liveOutputArea.innerHTML = this.markdownFormatter.makeHtml(this.writingSurface.value);
    }
  }

  // Dispatches actions based on which toolbar button was clicked
  processToolbarClick(operationType) {
    let orderedListIndex = 0;
    switch (operationType) {
      case 'bold':
        this.processEditorOperation(/([^\n]+)([\n\s]*)/g, "**$1**$2");
        break;
      case 'italic':
        this.processEditorOperation(/([^\n]+)([\n\s]*)/g, "_$1_$2");
        break;
      case 'code':
        this.processEditorOperation(/([\s\S]*)/, "`$1`");
        break;
      case 'hr':
        this.processEditorOperation(false, false, false, "\n***\n");
        break;
      case 'ul':
        this.processEditorOperation(/(.+)([\n]?)/g, "* $1$2", true);
        break;
      case 'ol':
        this.processEditorOperation(/(.+)([\n]?)/g, (match, p1, p2) => (++orderedListIndex) + ". " + p1 + p2, true);
        break;
      case 'blockquote':
        this.processEditorOperation(/(.+)([\n]?)/g, "> $1$2");
        break;
      case 'h1':
        this.processEditorOperation(/(.+)([\n]?)/g, "# $1$2", true);
        break;
      case 'h2':
        this.processEditorOperation(/(.+)([\n]?)/g, "## $1$2", true);
        break;
      case 'h3':
        this.processEditorOperation(/(.+)([\n]?)/g, "### $1$2", true);
        break;
      case 'link':
        this.showLinkInputModal();
        break;
      case 'image':
        // Original code doesn't implement image action, just the button.
        // For exact functional equivalence, we do nothing explicit here.
        console.warn("Image button clicked. No explicit action defined in original.");
        break;
      case 'help':
        console.info("Help button clicked. No explicit action defined in original.");
        break;
      default:
        console.warn(`Unrecognized editor operation: ${operationType}`);
    }
  }

  // Custom modal implementation to replace $.facebox
  displayCustomModal(innerHtmlContent, modalTitle) {
    const modalOverlayElement = document.createElement('div');
    modalOverlayElement.id = 'modal-backdrop-layer';
    Object.assign(modalOverlayElement.style, {
      position: 'fixed', top: '0', left: '0', width: '100%', height: '100%',
      background: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center',
      alignItems: 'center', zIndex: '10000'
    });

    const modalDialogElement = document.createElement('div');
    modalDialogElement.id = 'modal-content-container';
    Object.assign(modalDialogElement.style, {
      background: 'white', padding: '20px', borderRadius: '5px', minWidth: '300px',
      boxShadow: '0 0 10px rgba(0,0,0,0.5)'
    });

    if (modalTitle) {
      const heading = document.createElement('h4');
      heading.textContent = modalTitle;
      modalDialogElement.appendChild(heading);
    }

    const contentWrapper = document.createElement('div');
    contentWrapper.innerHTML = innerHtmlContent;
    modalDialogElement.appendChild(contentWrapper);

    modalOverlayElement.appendChild(modalDialogElement);
    document.body.appendChild(modalOverlayElement);

    const closeModal = (e) => {
      e.preventDefault();
      document.body.removeChild(modalOverlayElement);
      modalOverlayElement.removeEventListener('click', closeModal);
    };

    modalOverlayElement.addEventListener('click', (e) => {
      if (e.target === modalOverlayElement || e.target.classList.contains('cancel-trigger') || e.target.classList.contains('confirm-trigger')) {
        closeModal(e);
      }
    });

    return modalDialogElement;
  }

  showLinkInputModal() {
    const currentSelectedText = this.retrieveCurrentSelection();
    const dialogMarkup = `
      <div id="link-dialog-form">
        <h4>Insert Link</h4>
        <fieldset>
          <div class="field">
            <label for="link-text-entry">Link Text</label>
            <input type="text" class="text-entry" id="link-text-entry" value="${currentSelectedText}">
          </div>
          <div class="field">
            <label for="url-entry">URL</label>
            <input type="text" class="url-entry" id="url-entry">
          </div>
        </fieldset>
        <div class="buttons">
          <a href="#" title="Cancel" class="cancel-trigger minibutton">Cancel</a>
          <a href="#" title="OK" class="confirm-trigger minibutton">OK</a>
        </div>
      </div>
    `;
    const dialogInstance = this.displayCustomModal(dialogMarkup, '');

    const confirmBtn = dialogInstance.querySelector('.confirm-trigger');
    confirmBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const urlVal = dialogInstance.querySelector('.url-entry').value;
      const textVal = dialogInstance.querySelector('.text-entry').value;
      if (urlVal && textVal) {
        this.processEditorOperation(/([\s\S]*)/, `[${textVal}](${urlVal})`);
      }
      dialogInstance.closest('#modal-backdrop-layer').remove();
    });

    const cancelBtn = dialogInstance.querySelector('.cancel-trigger');
    cancelBtn.addEventListener('click', (e) => {
      e.preventDefault();
      dialogInstance.closest('#modal-backdrop-layer').remove();
    });
  }
}

// Global utility for initializing and accessing editor functionality
(function() {
  const instanceRegistry = new WeakMap();

  window.GlobalEditorUtility = {
    // Initializes the Markdown editor on a given textarea element
    initializeEditor: function(targetTextarea) {
      if (!(targetTextarea instanceof Element) || targetTextarea.tagName !== 'TEXTAREA') {
        console.error("initializeEditor requires a textarea DOM element.");
        return;
      }
      if (!instanceRegistry.has(targetTextarea)) {
        instanceRegistry.set(targetTextarea, new MarkdownTextProcessorCore(targetTextarea));
      }
    },

    // Public method to perform an action on a specific editor instance
    performSpecificAction: function(targetTextarea, regexPattern, replacementValue, fullLineMode, appendedText) {
      if (!(targetTextarea instanceof Element) || targetTextarea.tagName !== 'TEXTAREA') {
        console.error("performSpecificAction requires a textarea DOM element.");
        return;
      }
      const editorInstance = instanceRegistry.get(targetTextarea);
      if (editorInstance) {
        editorInstance.processEditorOperation(regexPattern, replacementValue, fullLineMode, appendedText);
      } else {
        console.error("No MarkdownTextProcessorCore instance found for this textarea element.");
      }
    }
  };
})();