var textSculptor = (function() {

  // Internal utility functions (replacing SmalleditorCore/SmalleditorService)
  const _toolkit = {
    // Mimics seUtils.generateRandomName
    createUniqueId: function() {
      const charSet = 'abcdefghijklmnopqrstuvwxyz0123456789';
      let result = '';
      for (let i = 0; i < 8; i++) {
        result += charSet.charAt(Math.floor(Math.random() * charSet.length));
      }
      return 'ident-' + result;
    },

    // Mimics seUtils.htmlEntities
    escapeMarkupEntities: function(txt) {
      const elem = document.createElement('div');
      elem.appendChild(document.createTextNode(txt));
      return elem.innerHTML;
    },

    // Placeholder for more complex data model functions
    // These functions' internal logic was not provided in the original code,
    // so we maintain their interface for consistency.
    generateContentModel: function(contentElement) {
      console.warn("generateContentModel: Placeholder implementation.");
      return contentElement.innerHTML; // Simple representation
    },
    composeHtmlFromModel: function(modelData) {
      console.warn("composeHtmlFromModel: Placeholder implementation.");
      return modelData; // Simple representation
    },
    calculateContentDifference: function(a, b) {
      console.warn("calculateContentDifference: Placeholder implementation.");
      return null;
    },
    applyContentDifference: function(target, diff) {
      console.warn("applyContentDifference: Placeholder implementation.");
      return null;
    }
  };

  // Browser detection flags
  const _isFox = /firefox/i.test(navigator.userAgent);
  const _isChr = /chrome/i.test(navigator.userAgent);

  // Helper for caret manipulation
  const _caretOperations = {
    // Replaces SmalleditorService.setCaret
    placeCursorAtEnd: function(targetElement) {
      if (typeof window.getSelection !== "undefined" && typeof document.createRange !== "undefined") {
        const spanRange = document.createRange();
        if (!spanRange) return;
        spanRange.selectNodeContents(targetElement);
        spanRange.collapse(false); // Collapse to end
        if (_isFox) {
          const lineBreak = targetElement.querySelector('br');
          if (lineBreak) {
            spanRange.setEndBefore(lineBreak);
          }
        }
        const currentSelection = window.getSelection();
        currentSelection.removeAllRanges();
        currentSelection.addRange(spanRange);
      } else if (typeof document.body.createTextRange !== "undefined") {
        const textFocusRange = document.body.createTextRange();
        textFocusRange.moveToElementText(targetElement);
        textFocusRange.collapse(false); // Collapse to end
        textFocusRange.select();
      }
    },

    // Replaces SmalleditorService.getSelectionStart
    retrieveSelectionOrigin: function() {
      const currentSelection = document.getSelection();
      const originNode = currentSelection.anchorNode;
      return (originNode && originNode.nodeType === Node.TEXT_NODE) ? originNode.parentNode : originNode;
    },

    // Replaces SmalleditorService.rangeSelectsSingleNode
    doesRangeCoverSingleElement: function(selectionRange) {
      const initialNode = selectionRange.startContainer;
      return initialNode === selectionRange.endContainer &&
        initialNode.hasChildNodes() &&
        selectionRange.endOffset === selectionRange.startOffset + 1;
    },

    // Replaces SmalleditorService.getSelectedParentElement
    fetchSelectionEnclosingElement: function() {
      let enclosingElement = null;
      const currentSelection = window.getSelection();
      if (!currentSelection.rangeCount) return null; // No selection
      const activeRange = currentSelection.getRangeAt(0);

      if (_caretOperations.doesRangeCoverSingleElement(activeRange)) {
        enclosingElement = activeRange.startContainer.childNodes[activeRange.startOffset];
      } else if (activeRange.startContainer.nodeType === Node.TEXT_NODE) {
        enclosingElement = activeRange.startContainer.parentNode;
      } else {
        enclosingElement = activeRange.startContainer;
      }
      return enclosingElement;
    }
  };


  // Factory function for the editor instance
  function createRichTextEditor(targetElement, configOptions = {}) {
    const editorInstance = {};

    // Editor configuration and state
    editorInstance.interfaceFacet = {}; // Replaces `api`
    editorInstance.placementCoordinates = {
      top: 10,
      left: 10,
      below: false
    }; // Replaces `position`
    editorInstance.featureToggleMap = {}; // Replaces `buttons`
    editorInstance.toolbarEnabledFlag = true; // Replaces `enableToolbar`
    editorInstance.toolbarVisibleFlag = false; // Replaces `showToolbar`
    editorInstance.placeholderDisplayStatus = false; // Replaces `showPlaceholder`
    editorInstance.hintText = "Type your text"; // Replaces `placeholder`
    editorInstance.visualThemeIdentifier = ''; // Replaces `iconTheme`
    editorInstance.pastePermitted = true; // Replaces `allowPaste`
    editorInstance.simpleTextPaste = true; // Replaces `plainPaste`
    editorInstance.markupPaste = false; // Replaces `htmlPaste`
    editorInstance.activeStyleIndicators = {}; // Replaces `scope.styles`

    // DOM Elements
    const mainContainer = targetElement;
    const toolbarContainer = mainContainer.querySelector('.text-sculptor-controls'); // Replaces $toolbar
    const editableContentArea = mainContainer.querySelector('.text-sculptor-editable-area'); // Replaces $content
    const documentBody = document.body; // Replaces $body

    // Constants
    const structuralElements = ["p", "h1", "h2", "h3", "h4", "h5", "h6", "pre", "blockquote"]; // Replaces blockTags
    const structuralElementSelector = structuralElements.join(','); // Replaces blockSelector
    const superfluousElements = ["span", "em", "strong", "mark"]; // Replaces unwantedTags
    const superfluousElementSelector = superfluousElements.join(','); // Replaces unwantedSelector

    // Initialize configuration from options
    editorInstance.toolbarEnabledFlag = (configOptions.enabletoolbar !== 'false');
    editorInstance.toolbarVisibleFlag = (configOptions.showtoolbar === 'true');
    editorInstance.hintText = configOptions.placeholder || editorInstance.hintText;
    editorInstance.visualThemeIdentifier = configOptions.icontheme || editorInstance.visualThemeIdentifier;
    editorInstance.pastePermitted = (configOptions.paste !== 'false');
    editorInstance.simpleTextPaste = (configOptions.plain_paste !== 'false');
    editorInstance.markupPaste = (configOptions.html_paste === 'true');

    // Populate featureToggleMap (replaces scope.buttons)
    (configOptions.buttons || "b,i").split(',').forEach(key => {
      const trimmedKey = key.trim().toLowerCase();
      if (trimmedKey) {
        editorInstance.featureToggleMap[trimmedKey] = true;
      }
    });

    // Make content editable
    editableContentArea.setAttribute('contenteditable', 'true');

    // --- Core Logic Functions ---

    // Replaces setToolbarPosition
    const adjustToolbarPlacement = function() {
      const controlsHeight = toolbarContainer.offsetHeight;
      const controlsWidth = toolbarContainer.offsetWidth;
      const margin = 5;
      const currentSelection = window.getSelection();
      if (!currentSelection.rangeCount) return;
      const activeRange = currentSelection.getRangeAt(0);
      const bounds = activeRange.getBoundingClientRect();

      let yCoord = bounds.top;
      let xCoord = bounds.left;

      if (bounds.top < (controlsHeight + margin)) {
        editorInstance.placementCoordinates.top = yCoord + bounds.height + margin;
        editorInstance.placementCoordinates.below = true;
      } else {
        editorInstance.placementCoordinates.top = yCoord - controlsHeight - margin;
        editorInstance.placementCoordinates.below = false;
      }

      editorInstance.placementCoordinates.left = xCoord - (controlsWidth / 2) + (bounds.width / 2);

      // Account for scroll position (cross-browser)
      const horizontalScroll = window.pageXOffset || (document.documentElement || document.body.parentNode || document.body).scrollLeft;
      const verticalScroll = window.pageYOffset || (document.documentElement || document.body.parentNode || document.body).scrollTop;

      editorInstance.placementCoordinates.top += verticalScroll;
      editorInstance.placementCoordinates.left += horizontalScroll;

      // Apply styles directly (instead of Angular scope update)
      toolbarContainer.style.top = `${editorInstance.placementCoordinates.top}px`;
      toolbarContainer.style.left = `${editorInstance.placementCoordinates.left}px`;
      if (editorInstance.placementCoordinates.below) {
        toolbarContainer.classList.add('below-selection');
      } else {
        toolbarContainer.classList.remove('below-selection');
      }
    };

    let selectionCheckTimeout = null;
    // Replaces checkSelection
    const evaluateCurrentSelection = function(evt) {
      // If event originated from toolbar, do nothing
      if (evt && evt.target && toolbarContainer.contains(evt.target)) {
        return;
      }

      const currentSelection = window.getSelection();
      const originNode = currentSelection.anchorNode;

      // Clear previous timeout to prevent flickering
      if (selectionCheckTimeout) {
        clearTimeout(selectionCheckTimeout);
      }

      // Defer DOM updates to allow browser to settle selection
      selectionCheckTimeout = setTimeout(() => {
        if (!originNode || currentSelection.toString().trim() === '') {
          editorInstance.toolbarVisibleFlag = false;
        } else {
          // Check if selection is within the editor's content area
          let parentTraversalNode = originNode;
          let isInEditor = false;
          while (parentTraversalNode && parentTraversalNode !== documentBody) {
            if (parentTraversalNode === editableContentArea) {
              isInEditor = true;
              break;
            }
            parentTraversalNode = parentTraversalNode.parentNode;
          }

          if (isInEditor) {
            editorInstance.toolbarVisibleFlag = true;
            adjustToolbarPlacement();
            updateActiveControls();
          } else {
            editorInstance.toolbarVisibleFlag = false;
          }
        }
        // Update toolbar visibility directly
        if (editorInstance.toolbarVisibleFlag) {
          toolbarContainer.style.display = '';
        } else {
          toolbarContainer.style.display = 'none';
        }
      }, 50); // Small delay to prevent rapid updates
    };

    // Replaces bindSelection
    const attachSelectionListeners = function() {
      editableContentArea.addEventListener('keyup', evaluateCurrentSelection);
      document.addEventListener('mouseup', evaluateCurrentSelection);

      let editorBlurTimer;
      editableContentArea.addEventListener('blur', function() {
        if (editorBlurTimer) {
          clearTimeout(editorBlurTimer);
        }
        editorBlurTimer = setTimeout(evaluateCurrentSelection, 200);
      });
    };

    // Replaces checkActiveButtons
    const updateActiveControls = function() {
      const elementAtSelection = _caretOperations.fetchSelectionEnclosingElement();
      editorInstance.activeStyleIndicators = {}; // Reset

      let currentParent = elementAtSelection;
      while (currentParent && currentParent !== editableContentArea && currentParent !== documentBody) {
        editorInstance.activeStyleIndicators[currentParent.tagName.toLowerCase()] = true;
        currentParent = currentParent.parentNode;
      }
    };

    // Replaces _ph_activate
    const activateHint = function() {
      if (editableContentArea.textContent.replace(/^\s+|\s+$/g, '') === '') {
        editorInstance.placeholderDisplayStatus = true;
        editableContentArea.classList.add('has-hint');
      }
    };

    // Replaces _ph_deactivate
    const deactivateHint = function(evt) {
      editorInstance.placeholderDisplayStatus = false;
      editableContentArea.classList.remove('has-hint');
      if (!evt || (evt.type !== 'keypress' && evt.type !== 'paste')) {
        // Re-activate if empty after non-text-modifying event
        activateHint();
      }
    };

    // Replaces setPlaceholders
    const configureHintBehavior = function() {
      activateHint();
      editableContentArea.addEventListener('blur', activateHint);
      editableContentArea.addEventListener('keypress', deactivateHint);
      editableContentArea.addEventListener('paste', deactivateHint);
    };

    // Replaces bindPaste
    const registerPasteHandler = function() {
      editableContentArea.addEventListener('paste', function(evt) {
        evt.preventDefault();
        if (!editorInstance.pastePermitted) {
          return;
        }
        const eventData = (evt.originalEvent || evt).clipboardData;
        if (eventData) {
          if (eventData.getData('text/plain') && editorInstance.simpleTextPaste) {
            const rawText = eventData.getData('text/plain');
            const sections = rawText.split(/[\r\n]+/g);
            let processedHtml = "";
            sections.forEach((section, idx) => {
              const trimmedSection = section.trim();
              if (trimmedSection) {
                const escapedSection = _toolkit.escapeMarkupEntities(trimmedSection);
                if (idx === 0) {
                  processedHtml += escapedSection;
                } else {
                  processedHtml += `<p data-ident="${_toolkit.createUniqueId()}" class="sculptor-element sculptor-element--p">${escapedSection}</p>`;
                }
              }
            });
            if (processedHtml) {
              document.execCommand('insertHTML', false, processedHtml);
            }
          } else if (eventData.getData('text/html') && editorInstance.markupPaste) {
            // TODO: HTML cleanup and paste (as in original)
            console.warn("HTML paste is enabled but cleanup/processing is not implemented.");
          }
        }
      });
    };

    // Replaces removeNested
    const flattenNestedBlocks = function() {
      editableContentArea.querySelectorAll('.sculptor-element').forEach(outerElem => {
        outerElem.querySelectorAll(structuralElementSelector).forEach(innerBlock => {
          // Move children out of innerBlock and then remove innerBlock
          while (innerBlock.firstChild) {
            innerBlock.parentNode.insertBefore(innerBlock.firstChild, innerBlock);
          }
          innerBlock.remove();
        });
      });
    };

    let cleanupTimeout = null;
    // Replaces bindRemoveUnwanted
    const installCleanupRoutines = function() {
      const performCleanup = () => {
        if (cleanupTimeout) {
          clearTimeout(cleanupTimeout);
        }
        cleanupTimeout = setTimeout(() => {
          // Firefox <br type=_moz>
          editableContentArea.querySelectorAll('br[type="_moz"], br').forEach(br => br.remove());
          // Chrome span styles on backspace
          editableContentArea.querySelectorAll(superfluousElementSelector).forEach(el => {
            while (el.firstChild) {
              el.parentNode.insertBefore(el.firstChild, el);
            }
            el.remove();
          });
          editableContentArea.querySelectorAll('[style]').forEach(el => el.removeAttribute('style'));
          flattenNestedBlocks();
          markFirstStructuralElement();
        }, 50); // Debounce cleanup
      };

      editableContentArea.addEventListener('keyup', performCleanup);
      editableContentArea.addEventListener('paste', performCleanup);
      editableContentArea.addEventListener('focus', performCleanup);
    };

    // Replaces addedNewElem
    const markFirstStructuralElement = function() {
      editableContentArea.querySelectorAll('.sculptor-element--first').forEach(el => el.classList.remove('sculptor-element--first'));
      const firstElem = editableContentArea.querySelector('.sculptor-element');
      if (firstElem) {
        firstElem.classList.add('sculptor-element--first');
      }
    };

    // Replaces createNamedParagraph
    const fabricateNamedParagraph = function() {
      const newParagraph = document.createElement('p');
      newParagraph.setAttribute('data-ident', _toolkit.createUniqueId());
      newParagraph.classList.add('sculptor-element', 'sculptor-element--p');
      newParagraph.appendChild(document.createElement('br'));
      editableContentArea.appendChild(newParagraph);
      _caretOperations.placeCursorAtEnd(newParagraph);

      markFirstStructuralElement();
      return newParagraph;
    };

    // Replaces bindWrapElements
    const applyContentWrapping = function() {
      const wrapContent = () => {
        // If no .sculptor-element, create one
        if (!editableContentArea.querySelector('.sculptor-element')) {
          fabricateNamedParagraph();
        }

        // Wrap text nodes that are direct children of editableContentArea
        Array.from(editableContentArea.childNodes).forEach(node => {
          if (node.nodeType === Node.TEXT_NODE && node.textContent.trim() !== '') {
            const wrapperParagraph = document.createElement('p');
            wrapperParagraph.setAttribute('data-ident', _toolkit.createUniqueId());
            wrapperParagraph.classList.add('sculptor-element', 'sculptor-element--p');
            wrapperParagraph.textContent = node.textContent; // Move text content
            node.parentNode.replaceChild(wrapperParagraph, node); // Replace text node with new paragraph
            markFirstStructuralElement();
          } else if (node.nodeType === Node.ELEMENT_NODE && !node.classList.contains('sculptor-element')) {
            // If it's an element but not a sculptor-element, wrap it too
            const wrapperParagraph = document.createElement('p');
            wrapperParagraph.setAttribute('data-ident', _toolkit.createUniqueId());
            wrapperParagraph.classList.add('sculptor-element', 'sculptor-element--p');
            node.parentNode.insertBefore(wrapperParagraph, node);
            wrapperParagraph.appendChild(node);
            markFirstStructuralElement();
          }
        });
      };

      editableContentArea.addEventListener('blur', wrapContent);
      editableContentArea.addEventListener('keyup', wrapContent);
      editableContentArea.addEventListener('paste', wrapContent);
      editableContentArea.addEventListener('focus', wrapContent);
    };

    // Replaces bindParagraphCreation
    const establishParagraphFormation = function() {
      editableContentArea.addEventListener('keyup', function(evt) {
        if (evt.which === 13 && !evt.shiftKey) { // Enter key without Shift
          document.execCommand('formatBlock', false, 'p');

          // Find the closest parent that is a 'sculptor-element'
          let currentSelectionNode = _caretOperations.retrieveSelectionOrigin();
          let closestSculptorElement = currentSelectionNode;

          // Traverse up to find a sculptor-element or the content area
          while (closestSculptorElement && closestSculptorElement !== editableContentArea && !closestSculptorElement.classList.contains('sculptor-element')) {
            closestSculptorElement = closestSculptorElement.parentNode;
          }

          if (closestSculptorElement && closestSculptorElement !== editableContentArea) {
            closestSculptorElement.setAttribute('data-ident', _toolkit.createUniqueId());
            closestSculptorElement.classList.add('sculptor-element', 'sculptor-element--p');
            markFirstStructuralElement();
          }
        }
      });
    };

    // Replaces setup
    const initializeEditor = function() {
      configureHintBehavior();
      attachSelectionListeners();
      registerPasteHandler();
      establishParagraphFormation();
      installCleanupRoutines();
      applyContentWrapping();
    };

    // Replaces SimpleAction
    editorInstance.performFormattingAction = function(actionIdentifier, elementTag) {
      elementTag = elementTag && elementTag.toLowerCase();
      document.execCommand('styleWithCSS', false, false);
      document.execCommand(actionIdentifier, false, elementTag);

      if (actionIdentifier === 'formatBlock') {
        let currentNode = _caretOperations.retrieveSelectionOrigin();
        let targetBlock = currentNode;

        while (targetBlock && targetBlock !== editableContentArea && targetBlock.tagName.toLowerCase() !== elementTag) {
          targetBlock = targetBlock.parentNode;
        }

        if (targetBlock && targetBlock !== editableContentArea) {
          targetBlock.setAttribute('data-ident', _toolkit.createUniqueId());
          targetBlock.classList.add('sculptor-element', `sculptor-element--${elementTag}`);
          flattenNestedBlocks();
          markFirstStructuralElement();
        }
      }
    };

    // Move the toolbar to the body
    documentBody.appendChild(toolbarContainer);

    // Setup the editor
    initializeEditor();

    // --- Public API (replaces scope.api) ---
    editorInstance.interfaceFacet.contentModel = function(modelInput) {
      if (modelInput === undefined) {
        return _toolkit.generateContentModel(editableContentArea);
      }
      editableContentArea.innerHTML = _toolkit.composeHtmlFromModel(modelInput);
      deactivateHint(); // Ensure placeholder is hidden after content load
    };

    editorInstance.interfaceFacet.retrieveHtmlContent = function(modelInput) {
      if (!modelInput) {
        return null;
      }
      return _toolkit.composeHtmlFromModel(modelInput);
    };

    editorInstance.interfaceFacet.calculateContentDifference = _toolkit.calculateContentDifference;
    editorInstance.interfaceFacet.applyContentDifference = _toolkit.applyContentDifference;

    return editorInstance;
  }

  // A global object for managing editor instances, replacing Angular module concept
  const editorManager = {
    // This function acts like the Angular directive registration
    // It takes a selector and options, finds the element, and initializes an editor.
    // For a Type IV clone, we're replacing the Angular directive structure entirely.
    // This is a more direct, imperative way to create an editor instance.
    initEditor: function(elementSelector, options) {
      const targetDomElement = document.querySelector(elementSelector);
      if (!targetDomElement) {
        console.error(`Element with selector '${elementSelector}' not found.`);
        return null;
      }
      // Assuming the template structure (_se_toolbar.html) is already rendered into targetDomElement
      return createRichTextEditor(targetDomElement, options);
    }
  };

  return editorManager;

})();

// Example usage (simulating Angular directive instantiation)
// Assuming HTML structure:
// <div id="myEditor" class="text-sculptor">
//   <div class="text-sculptor-controls" style="display:none; position:absolute;">
//     <button onclick="window.mySculptor.performFormattingAction('bold')">B</button>
//     <button onclick="window.mySculptor.performFormattingAction('italic')">I</button>
//   </div>
//   <div class="text-sculptor-editable-area"></div>
// </div>
//
// window.mySculptor = textSculptor.initEditor('#myEditor', {
//   buttons: 'b,i',
//   placeholder: 'Write here...',
//   enabletoolbar: 'true',
//   plain_paste: 'true'
// });
//
// To access the API:
// var model = window.mySculptor.interfaceFacet.contentModel();
// console.log(model);
// window.mySculptor.interfaceFacet.contentModel('<h1>Hello World!</h1><p>Some more text.</p>');