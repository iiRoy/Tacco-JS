(function() {
  if (typeof Showdown === 'undefined' || typeof Showdown.converter === 'undefined') {
    console.error('Showdown.converter is not available. Please ensure Showdown library is loaded.');
    Showdown = {
      converter: function() {
        return {
          makeHtml: function(text) {
            return text
              .replace(/&/g, '&amp;')
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;')
              .replace(/"/g, '&quot;')
              .replace(/'/g, '&#039;')
              .replace(/\n/g, '<br>');
          },
        };
      },
    };
  }

  function combineConfigurations(baseConfig, userConfig) {
    const merged = {};
    for (const prop in baseConfig) {
      if (Object.prototype.hasOwnProperty.call(baseConfig, prop)) {
        merged[prop] = baseConfig[prop];
      }
    }
    for (const prop in userConfig) {
      if (Object.prototype.hasOwnProperty.call(userConfig, prop)) {
        merged[prop] = userConfig[prop];
      }
    }
    return merged;
  }

  function setupDebouncer(taskFunction, delayDuration) {
    let timeoutIdentifier;
    return function(...args) {
      const currentContext = this;
      clearTimeout(timeoutIdentifier);
      timeoutIdentifier = setTimeout(() => taskFunction.apply(currentContext, args), delayDuration);
    };
  }

  class ContentProcessor {
    constructor(sourceElement, settings) {
      this.sourceElement = sourceElement;
      this.activeSettings = combineConfigurations(
        {
          stateChangeInterval: 2000,
          displayUpdateFrequency: 300,
          interfaceActions: [
            'bold',
            'italic',
            'link',
            'quote',
            'code',
            'picture',
            'headline',
            'list',
            'undo',
            'redo',
            'support',
          ],
          displayTexts: {
            'action-bold': 'Bold',
            'action-italic': 'Italic',
            'action-link': 'Generate Link',
            'action-quote': 'Block Quote',
            'action-code': 'Code Snippet',
            'action-picture': 'Insert Image',
            'action-headline': 'Heading Level',
            'action-list': 'Unordered List',
            'action-undo': 'Revert Last',
            'action-redo': 'Advance Next',
            'action-support': 'Guidance',
            'action-confirm': 'Apply',
            'action-cancel': 'Dismiss',
          },
          initialDocument: '',
        },
        settings
      );

      this.documentHistory = [];
      this.historyIndex = -1;
      this.markupConverter = new Showdown.converter();

      this.outerContainer = null;
      this.controlStrip = null;
      this.textEntryArea = null;
      this.htmlPreviewArea = null;
      this.revertActionBtn = null;
      this.advanceActionBtn = null;

      this.constructUserInterface();
      this.assignEventListeners();
      this.initializeContentState(this.activeSettings.initialDocument || this.sourceElement.value);
    }

    constructUserInterface() {
      this.outerContainer = document.createElement('div');
      this.outerContainer.className = 'content-composer-area';

      this.controlStrip = document.createElement('div');
      this.controlStrip.className = 'content-composer-toolbar';
      this.outerContainer.appendChild(this.controlStrip);

      this.textEntryArea = document.createElement('textarea');
      this.textEntryArea.className = 'content-composer-editor';
      this.outerContainer.appendChild(this.textEntryArea);

      this.htmlPreviewArea = document.createElement('div');
      this.htmlPreviewArea.className = 'content-composer-viewer';
      this.outerContainer.appendChild(this.htmlPreviewArea);

      this.sourceElement.parentNode.insertBefore(this.outerContainer, this.sourceElement);
      this.sourceElement.style.display = 'none';

      this.activeSettings.interfaceActions.forEach((actionIdentifier) => {
        this.controlStrip.appendChild(this.createControlElement(actionIdentifier));
      });

      this.revertActionBtn = this.controlStrip.querySelector('.action-undo');
      this.advanceActionBtn = this.controlStrip.querySelector('.action-redo');
    }

    createControlElement(actionIdentifier) {
      const labelKey = 'action-' + actionIdentifier;
      const elementLink = document.createElement('a');
      elementLink.className = 'format-control ' + labelKey;
      elementLink.title = this.activeSettings.displayTexts[labelKey];

      const visualIcon = document.createElement('span');
      visualIcon.className = 'format-icon format-icon-' + actionIdentifier;
      visualIcon.textContent = this.activeSettings.displayTexts[labelKey];
      elementLink.appendChild(visualIcon);

      const handler = this.commandActions[actionIdentifier];
      if (handler) {
        elementLink.addEventListener('click', handler.bind(this));
      }
      return elementLink;
    }

    saveDocumentStateDebounced = setupDebouncer(this.saveDocumentState, this.activeSettings.stateChangeInterval);
    renderOutputDebounced = setupDebouncer(this.updateOutputDisplay, this.activeSettings.displayUpdateFrequency);

    saveDocumentState() {
      const currentTextContent = this.textEntryArea.value;
      if (this.documentHistory[this.historyIndex] !== currentTextContent) {
        this.historyIndex++;
        this.documentHistory[this.historyIndex] = currentTextContent;
        if (this.documentHistory.length > this.historyIndex + 1) {
          this.documentHistory = this.documentHistory.slice(0, this.historyIndex + 1);
        }
        this.adjustHistoryButtons();
      }
      this.updateOutputDisplay();
    }

    revertPreviousState() {
      if (this.historyIndex > 0) {
        this.historyIndex--;
        this.textEntryArea.value = this.documentHistory[this.historyIndex];
        this.adjustHistoryButtons();
        this.updateOutputDisplay();
      }
    }

    advanceNextState() {
      if (this.historyIndex < this.documentHistory.length - 1) {
        this.historyIndex++;
        this.textEntryArea.value = this.documentHistory[this.historyIndex];
        this.adjustHistoryButtons();
        this.updateOutputDisplay();
      }
    }

    adjustHistoryButtons() {
      if (this.revertActionBtn) {
        if (this.historyIndex <= 0) {
          this.revertActionBtn.setAttribute('disabled', 'true');
        } else {
          this.revertActionBtn.removeAttribute('disabled');
        }
      }
      if (this.advanceActionBtn) {
        if (this.historyIndex >= this.documentHistory.length - 1) {
          this.advanceActionBtn.setAttribute('disabled', 'true');
        } else {
          this.advanceActionBtn.removeAttribute('disabled');
        }
      }
    }

    updateOutputDisplay(immediate = false) {
      if (immediate) {
        this.htmlPreviewArea.innerHTML = this.markupConverter.makeHtml(this.textEntryArea.value);
      } else {
        this.renderOutputDebounced();
      }
      const customEvent = new CustomEvent('contentUpdated', { detail: { value: this.textEntryArea.value } });
      this.textEntryArea.dispatchEvent(customEvent);
    }

    retrieveCurrentSelection(wholeLineMode = false) {
      const fullContent = this.textEntryArea.value;
      let selectionStart = this.textEntryArea.selectionStart;
      let selectionEnd = this.textEntryArea.selectionEnd;

      if (wholeLineMode) {
        while (selectionStart > 0 && fullContent[selectionStart - 1] !== '\n') {
          selectionStart--;
        }
        while (selectionEnd < fullContent.length && fullContent[selectionEnd] !== '\n') {
          selectionEnd++;
        }
      }

      const selectedLength = selectionEnd - selectionStart;
      return {
        startPosition: selectionStart,
        endPosition: selectionEnd,
        length: selectedLength,
        selectedText: fullContent.substring(selectionStart, selectionEnd),
      };
    }

    modifyTextContent(newText, newCursorStart = -1, newCursorEnd = -1) {
      const fullContent = this.textEntryArea.value;
      const currentSelection = this.retrieveCurrentSelection(false);

      const preSelection = fullContent.substring(0, currentSelection.startPosition);
      const postSelection = fullContent.substring(currentSelection.endPosition, fullContent.length);

      this.textEntryArea.value = preSelection + newText + postSelection;

      const cursorStartTarget = newCursorStart === -1 ? currentSelection.startPosition : newCursorStart;
      const cursorEndTarget = newCursorEnd === -1 ? cursorStartTarget + newText.length : newCursorEnd;

      this.textEntryArea.setSelectionRange(cursorStartTarget, cursorEndTarget);
      this.textEntryArea.focus();
    }

    applyTextTransformation(transformationRules) {
      const selectionInfo = this.retrieveCurrentSelection(transformationRules.block);
      if (!transformationRules.block && selectionInfo.selectedText.includes('\n')) {
        return;
      }

      let modifiedTextValue;
      let cursorPlacementStart, cursorPlacementEnd;

      const regexMatch = transformationRules.pattern.exec(selectionInfo.selectedText);

      if (regexMatch) {
        modifiedTextValue = transformationRules.undo ? transformationRules.undo(selectionInfo.selectedText, regexMatch) : regexMatch[1] || '';
        cursorPlacementStart = selectionInfo.startPosition;
        cursorPlacementEnd = selectionInfo.startPosition + modifiedTextValue.length;
      } else {
        modifiedTextValue = transformationRules.apply(selectionInfo.selectedText);
        const trimmedOriginal = selectionInfo.selectedText.trim();
        const prefixOffset = modifiedTextValue.indexOf(trimmedOriginal);

        if (prefixOffset !== -1) {
          cursorPlacementStart = selectionInfo.startPosition + prefixOffset;
          cursorPlacementEnd = cursorPlacementStart + trimmedOriginal.length;
        } else {
          cursorPlacementStart = selectionInfo.startPosition;
          cursorPlacementEnd = selectionInfo.startPosition + modifiedTextValue.length;
        }
      }

      this.modifyTextContent(modifiedTextValue, cursorPlacementStart, cursorPlacementEnd);
      this.saveDocumentState();
    }

    displayLinkInputForm(processCallback) {
      const currentSelectionContent = this.retrieveCurrentSelection().selectedText.replace(/\n/g, '').trim();
      const inputForm = document.createElement('form');
      inputForm.className = 'link-entry-modal';
      inputForm.innerHTML = `
        <input placeholder="Descriptive Text" type="text" class="text-input title-text">
        <input placeholder="https://" type="url" class="text-input url-link">
      `;
      inputForm.appendChild(this.createControlElement('confirm'));
      inputForm.appendChild(this.createControlElement('cancel'));

      const titleInput = inputForm.querySelector('.title-text');
      const urlInput = inputForm.querySelector('.url-link');
      const confirmButton = inputForm.querySelector('.action-confirm');
      const cancelButton = inputForm.querySelector('.action-cancel');

      const hideForm = () => {
        inputForm.remove();
        this.controlStrip.style.display = '';
        this.textEntryArea.focus();
      };

      const submitForm = (event) => {
        event.preventDefault();
        const urlVal = urlInput.value;
        const titleVal = titleInput.value || urlVal;
        this.modifyTextContent(processCallback(titleVal, urlVal));
        this.saveDocumentState();
        hideForm();
      };

      confirmButton.addEventListener('click', submitForm);
      cancelButton.addEventListener('click', hideForm);
      inputForm.addEventListener('keyup', (event) => {
        if (event.key === 'Enter') {
          submitForm(event);
        } else if (event.key === 'Escape') {
          hideForm();
        }
      });

      this.controlStrip.style.display = 'none';
      this.controlStrip.parentNode.insertBefore(inputForm, this.controlStrip.nextSibling);

      if (currentSelectionContent.startsWith('http://') || currentSelectionContent.startsWith('https://')) {
        urlInput.value = currentSelectionContent;
        titleInput.focus();
      } else {
        titleInput.value = currentSelectionContent;
        urlInput.focus();
      }
    }

    commandActions = {
      bold: () => {
        this.applyTextTransformation({
          apply: (val) => `**${val.trim()}**`,
          pattern: /^\*\*(.*)\*\*$/,
        });
      },
      italic: () => {
        this.applyTextTransformation({
          apply: (val) => `*${val.trim()}*`,
          pattern: /^\*((\*\*)?([^*]*)(\*\*))?\*$/,
        });
      },
      link: () => {
        this.displayLinkInputForm((title, href) => `[${title}](${href})`);
      },
      code: () => {
        this.applyTextTransformation({
          apply: (val) => `\`${val}\``,
          pattern: /^`([^`]*)`$/,
        });
      },
      quote: () => {
        this.applyTextTransformation({
          apply: (val) => '> ' + val.replace(/\n/g, '\n> '),
          undo: (val) => val.replace(/(^|\n)>[ \t]*(.*)/g, '$1$2'),
          pattern: /((^|\n)>(.*))+$/,
          block: true,
        });
      },
      picture: () => {
        this.displayLinkInputForm((title, href) => `![${title}](${href} "${title}")`);
      },
      headline: () => {
        this.applyTextTransformation({
          apply: (val) => '#' + val,
          pattern: /^#(.*)$/,
          block: true,
        });
      },
      list: () => {
        this.applyTextTransformation({
          apply: (val) => '* ' + val.replace(/\n/g, '\n* '),
          undo: (val) => val.replace(/^[\s\t]*\*[ \t]*/mg, ''),
          pattern: /^([\s\t]*\*.*)*$/,
          block: true,
        });
      },
      undo: () => this.revertPreviousState(),
      redo: () => this.advanceNextState(),
      support: () => window.open('http://en.wikipedia.org/wiki/Markdown'),
    };

    keyCommandMap = {
      'KeyB': { ctrlOrMeta: true, handler: 'bold' },
      'KeyI': { ctrlOrMeta: true, handler: 'italic' },
      'KeyK': { ctrlOrMeta: true, handler: 'link' },
      'KeyP': { ctrlOrMeta: true, shift: true, handler: 'code' },
      'Quote': { ctrlOrMeta: true, handler: 'quote' },
      'KeyI': { ctrlOrMeta: true, shift: true, handler: 'picture' },
      'KeyH': { ctrlOrMeta: true, handler: 'headline' },
      'KeyL': { ctrlOrMeta: true, shift: true, handler: 'list' },
      'KeyZ': { ctrlOrMeta: true, handler: 'undo' },
      'KeyY': { ctrlOrMeta: true, handler: 'redo' },
      'KeyH': { ctrlOrMeta: true, shift: true, handler: 'support' },
    };

    handleKeyboardInput = (event) => {
      if (this.outerContainer.querySelector('.link-entry-modal')) {
        return;
      }

      const currentTagName = event.target.tagName;
      if (currentTagName === 'INPUT' || currentTagName === 'SELECT') {
        return;
      }

      const isModifierPressed = event.metaKey || event.ctrlKey;
      const isShiftPressed = event.shiftKey;
      const triggeredKey = event.code;

      for (const keyCombo in this.keyCommandMap) {
        if (keyCombo === triggeredKey) {
          const shortcutDefinition = this.keyCommandMap[keyCombo];
          const ctrlMetaMatch = (shortcutDefinition.ctrlOrMeta === undefined || shortcutDefinition.ctrlOrMeta === isModifierPressed);
          const shiftMatch = (shortcutDefinition.shift === undefined || shortcutDefinition.shift === isShiftPressed);

          if (ctrlMetaMatch && shiftMatch) {
            event.preventDefault();
            const actionFunc = this.commandActions[shortcutDefinition.handler];
            if (actionFunc) {
              actionFunc.call(this);
              return;
            }
          }
        }
      }
    };

    assignEventListeners() {
      this.textEntryArea.addEventListener('input', () => {
        this.saveDocumentStateDebounced();
        this.updateOutputDisplay();
      });

      this.textEntryArea.addEventListener('focusin', () => {
        document.addEventListener('keydown', this.handleKeyboardInput);
      });

      this.textEntryArea.addEventListener('focusout', () => {
        document.removeEventListener('keydown', this.handleKeyboardInput);
      });
    }

    initializeContentState(initialValue) {
      this.textEntryArea.value = initialValue;
      this.documentHistory.push(initialValue);
      this.historyIndex = 0;
      this.updateOutputDisplay(true);
      this.adjustHistoryButtons();
    }
  }

  window.initTextComposer = function(targetElementSelector, customOptions) {
    const targetElement = document.querySelector(targetElementSelector);
    if (!targetElement || targetElement.tagName !== 'TEXTAREA') {
      console.error('Initialization target must be a TEXTAREA element.');
      return null;
    }
    return new ContentProcessor(targetElement, customOptions);
  };
})();