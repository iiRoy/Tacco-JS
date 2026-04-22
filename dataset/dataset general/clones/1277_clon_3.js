let textCraftModule = angular.module('textCraft');

textCraftModule.service('TextCraftUtilityService', function() {
  // Determine browser type for specific handling
  this.isMozillaBrowser = !!navigator.userAgent.match(/firefox/i);
  this.isChromiumBrowser = !!navigator.userAgent.match(/chrome/i);
  // Optional: Add more browser checks if needed
  this.isSafariBrowser = !!navigator.userAgent.match(/safari/i) && !this.isChromiumBrowser;

  // Position the text cursor at the end of a given DOM element
  this.positionTextCursor = function(targetElement) {
    if (window.getSelection && document.createRange) {
      let selectionRange = document.createRange();
      if (!selectionRange) return; // Guard against range creation failure

      selectionRange.selectNodeContents(targetElement);
      selectionRange.collapse(false); // Collapse to the end

      if (this.isMozillaBrowser) {
        // Firefox specific adjustment for <br> tags at the end
        const lastBr = angular.element(targetElement).find('br').last();
        if (lastBr.length) {
          selectionRange.setEndBefore(lastBr[0]);
        }
      }

      let currentSelection = window.getSelection();
      currentSelection.removeAllRanges();
      currentSelection.addRange(selectionRange);
    } else if (document.body.createTextRange) {
      // Fallback for older IE
      let legacyTextRange = document.body.createTextRange();
      legacyTextRange.moveToElementText(targetElement);
      legacyTextRange.collapse(false);
      legacyTextRange.select();
    }
  };

  // Obtain the starting node of the current text selection
  this.retrieveSelectionAnchor = function() {
    let currentSelection = document.getSelection();
    if (!currentSelection || !currentSelection.anchorNode) {
        return null;
    }
    let currentNode = currentSelection.anchorNode;
    // If text node, return its parent element
    return (currentNode && currentNode.nodeType === Node.TEXT_NODE) ? currentNode.parentNode : currentNode;
  };

  // Check if the given range selects only a single DOM node
  this.isSingleNodeSelection = function(selectionRange) {
    if (!selectionRange) return false;
    const startContainer = selectionRange.startContainer;
    return startContainer === selectionRange.endContainer &&
           startContainer.hasChildNodes() &&
           selectionRange.endOffset === selectionRange.startOffset + 1;
  };

  // Find the most relevant parent element containing the current selection
  this.findSelectionParentContainer = function() {
    let selectedParent = null;
    const userSelection = window.getSelection();
    if (!userSelection || userSelection.rangeCount === 0) {
        return null; // No selection active
    }
    const selectionRange = userSelection.getRangeAt(0);

    if (this.isSingleNodeSelection(selectionRange)) {
      selectedParent = selectionRange.startContainer.childNodes[selectionRange.startOffset];
    } else if (selectionRange.startContainer.nodeType === Node.TEXT_NODE) {
      selectedParent = selectionRange.startContainer.parentNode;
    } else {
      selectedParent = selectionRange.startContainer;
    }
    return selectedParent;
  };
});


textCraftModule.directive('textCraftEditor', [
  '$timeout',
  'SmalleditorCore', // Keeping original name for external dependency
  'TextCraftUtilityService',
  function ($timeout, txtCraftCore, txtCraftUtils) {
    'use strict';
    return {
      scope: {
        editorApi: '=?api' // Renamed API binding
      },
      templateUrl: 'views/_tc_panel.html', // Renamed template
      link: function (scope, hostElement, attributes) {

        // Initialize editor API object
        let editorApi = scope.editorApi = scope.editorApi || {};

        // Default control panel display coordinates
        scope.panelPosition = {
          vertical: 10,
          horizontal: 10,
          isBelow: false // Indicates if panel is positioned below selection
        };

        // Parse available formatting buttons from attributes
        scope.availableCommands = {};
        const defaultCommands = "bold,italic,underline".split(',');
        const commandList = attributes.commands ? attributes.commands.split(',') : defaultCommands;

        for (const cmd of commandList) {
          const key = cmd.trim().toLowerCase();
          if (key) {
            scope.availableCommands[key] = true;
          }
        }

        // Control panel activation status
        scope.isPanelEnabled = (attributes.enablePanel !== 'false'); // Default `true`
        scope.showControlPanel = (attributes.showPanel === 'true'); // Default `false`
        scope.displayPlaceholder = false;

        // Placeholder text configuration
        scope.placeholderText = attributes.placeholder || "Start typing your content...";

        // Icon set theme
        scope.iconSetTheme = attributes.iconTheme;

        // Paste handling options
        scope.allowContentPaste = (attributes.allowPaste !== 'false');
        scope.pasteAsPlainText = (attributes.plainPaste !== 'false');
        scope.pasteAsRichText = (attributes.richPaste === 'true'); // Renamed htmlPaste

        // Definition of structural block-level elements
        const structuralElements = "p h1 h2 h3 h4 h5 h6 pre blockquote".split(' ');
        const structuralSelector = structuralElements.join(',');
        // Tags to remove or unwrap during cleanup
        const ephemeralStyles = "span em strong mark".split(' ');
        const ephemeralSelector = ephemeralStyles.join(',');

        // References to key DOM elements
        const $controlPanel = hostElement.find('.textcraft-panel');
        const $editableZone = hostElement.find('.textcraft-content');
        const $documentBody = angular.element(document.body);

        // Make the content area editable
        $editableZone.attr('contenteditable', true);

        // Helper to create unique identifiers
        const createUniqueId = () => txtCraftCore.generateRandomName();

        // Dynamically adjust the position of the control panel
        const adjustControlPanelPlacement = () => {
          const panelHeight = $controlPanel[0].offsetHeight;
          const panelWidth = $controlPanel[0].offsetWidth;
          const paddingOffset = 8; // Increased spacing

          const userSelection = window.getSelection();
          if (!userSelection || userSelection.rangeCount === 0) return;

          const selectionRange = userSelection.getRangeAt(0);
          const selectionBounds = selectionRange.getBoundingClientRect();

          let verticalPos = selectionBounds.top;
          let horizontalPos = selectionBounds.left;

          // Determine if panel should be above or below selection
          if (selectionBounds.top < (panelHeight + paddingOffset + 20)) { // Added buffer
            scope.panelPosition.vertical = verticalPos + selectionBounds.height + paddingOffset;
            scope.panelPosition.isBelow = true;
          } else {
            scope.panelPosition.vertical = verticalPos - panelHeight - paddingOffset;
            scope.panelPosition.isBelow = false;
          }

          // Center panel horizontally above selected text, clamp to viewport
          const viewportWidth = window.innerWidth || document.documentElement.clientWidth;
          const calculatedLeft = horizontalPos - (panelWidth / 2) + (selectionBounds.width / 2);
          scope.panelPosition.horizontal = Math.max(
            paddingOffset, // Min left bound
            Math.min(calculatedLeft, viewportWidth - panelWidth - paddingOffset) // Max right bound
          );

          // Account for page scroll
          const hScrollOffset = window.pageXOffset || (document.documentElement || document.body.parentNode || document.body).scrollLeft;
          const vScrollOffset = window.pageYOffset || (document.documentElement || document.body.parentNode || document.body).scrollTop;

          scope.panelPosition.vertical += vScrollOffset;
          scope.panelPosition.horizontal += hScrollOffset;
        };

        // Evaluate current text selection and update toolbar visibility/position
        const evaluateActiveSelection = (eventObject) => {
          // If interaction is within the control panel itself, ignore
          if (eventObject && eventObject.target && $controlPanel[0].contains(eventObject.target)) {
            return;
          }

          const activeSelection = window.getSelection();
          const focusNode = activeSelection.anchorNode;

          if (!focusNode) {
            scope.showControlPanel = false;
            return;
          }

          // Check if selection is within the current editor's content area
          let ancestorNode = focusNode.parentNode;
          let isInEditor = false;
          while (ancestorNode && ancestorNode !== document.body) {
            if (ancestorNode === $editableZone[0]) {
              isInEditor = true;
              break;
            }
            ancestorNode = ancestorNode.parentNode;
          }

          $timeout(() => {
            if (isInEditor && activeSelection.toString().trim().length > 0) {
              scope.showControlPanel = true;
              adjustControlPanelPlacement();
              updateActiveFormatButtons();
            } else {
              scope.showControlPanel = false;
            }
          });
        };

        // Attach listeners for selection events
        const attachSelectionListeners = () => {
          $editableZone.on('keyup', evaluateActiveSelection); // For keyboard selections
          angular.element(document).on('mouseup', evaluateActiveSelection); // For mouse selections

          let editorBlurTimerId;
          $editableZone.on('blur', () => {
            if (editorBlurTimerId) {
              clearTimeout(editorBlurTimerId);
            }
            // Delay check to allow for toolbar interaction
            editorBlurTimerId = setTimeout(() => $timeout(() => evaluateActiveSelection()), 250);
          });
        };

        // Refresh the state of active formatting buttons based on current selection
        const updateActiveFormatButtons = () => {
          const selectedParent = txtCraftUtils.findSelectionParentContainer();
          scope.activeStyles = {}; // Renamed `styles` to `activeStyles`

          let currentElement = selectedParent;
          while (currentElement && currentElement !== $editableZone[0] && currentElement.tagName) {
            scope.activeStyles[currentElement.tagName.toLowerCase()] = true;
            currentElement = currentElement.parentNode;
          }
        };

        // Activate placeholder display if editor is empty
        const activatePlaceholderDisplay = () => {
          if (scope.placeholderText && $editableZone[0].textContent.trim() === '') {
            scope.displayPlaceholder = true;
          }
        };

        // Deactivate placeholder display
        const deactivatePlaceholderDisplay = (eventObject) => {
          scope.displayPlaceholder = false;
          // Re-activate placeholder if content becomes empty after certain events
          if (!eventObject || (eventObject.type !== 'keypress' && eventObject.type !== 'paste')) {
            $timeout(activatePlaceholderDisplay, 50);
          }
        };

        // Configure event listeners for placeholder behavior
        const configurePlaceholderBehavior = () => {
          activatePlaceholderDisplay();
          $editableZone.on('blur.tc_placeholder', activatePlaceholderDisplay)
                       .on('keypress.tc_placeholder paste.tc_placeholder', deactivatePlaceholderDisplay);
        };

        // Bind paste events for custom handling
        const attachPasteHandlers = () => {
          $editableZone.on('paste.tc_paste', (event) => {
            event.preventDefault(); // Prevent default paste behavior

            if (!scope.allowContentPaste) {
              return;
            }

            const originalEventObj = event.originalEvent || event;
            const clipboardData = originalEventObj.clipboardData;

            if (clipboardData) {
              if (scope.pasteAsPlainText && clipboardData.getData('text/plain')) {
                const rawText = clipboardData.getData('text/plain');
                const lineSegments = rawText.split(/[\r\n]+/g);
                let processedHtml = '';

                for (const paragraphLine of lineSegments) {
                  const trimmedLine = paragraphLine.trim();
                  if (trimmedLine.length > 0) {
                    const encodedSegment = txtCraftCore.htmlEntities(trimmedLine); // Using core utility
                    if (encodedSegment) {
                      if (processedHtml === '') {
                        processedHtml += encodedSegment; // First line can be inserted directly
                      } else {
                        processedHtml += `<p name="${createUniqueId()}" class="tc-block tc-block--p">${encodedSegment}</p>`;
                      }
                    }
                  }
                }
                if (processedHtml) {
                  document.execCommand('insertHTML', false, processedHtml);
                }
              } else if (scope.pasteAsRichText && clipboardData.getData('text/html')) {
                // TODO: Implement robust HTML cleanup and insertion
                const rawHtml = clipboardData.getData('text/html');
                console.warn("Rich text paste not fully implemented for cleanup yet.", rawHtml);
                // For now, allow basic rich text paste without extensive cleanup
                document.execCommand('insertHTML', false, rawHtml);
              }
            }
          });
        };

        // Remove nested block-level elements to maintain a flat structure
        const flattenStructuralElements = () => {
          $editableZone.find('> .tc-block').find(structuralSelector).contents().unwrap();
        };

        // Attach listeners for internal cleanup operations
        const attachCleanupListeners = () => {
          $editableZone.on('keyup.tc_cleanup paste.tc_cleanup focus.tc_cleanup', () => {
            $timeout(() => {
              // Remove Firefox specific <br> tags
              $editableZone.find('> br[type=_moz], > br:not([data-tc-persist])').remove();
              // Unwrap ephemeral style tags (e.g., spans from copy-paste)
              $editableZone.find(ephemeralSelector).contents().unwrap();
              // Remove inline styles that might be pasted
              $editableZone.find('[style]').removeAttr('style');
              flattenStructuralElements(); // Ensure no nested blocks
            });
          });
        };

        // Mark the first structural element in the editor
        const markFirstStructuralElement = () => {
          $editableZone.find('.tc-block--first').removeClass('tc-block--first');
          const firstBlock = $editableZone.find('.tc-block').first();
          if (firstBlock.length) {
            firstBlock.addClass('tc-block--first');
          }
        };

        // Create and insert a new paragraph element, positioning the caret within it
        const insertNewParagraphElement = () => {
          const generatedParagraph = angular.element('<p>', {
            name: createUniqueId(),
            class: 'tc-block tc-block--p'
          }).appendTo($editableZone);
          generatedParagraph.append(angular.element('<br/>')); // Ensure paragraph is visible
          txtCraftUtils.positionTextCursor(generatedParagraph[0]);

          markFirstStructuralElement();
          return generatedParagraph;
        };

        // Ensure all top-level text nodes are wrapped in paragraphs
        const attachWrappingHandlers = () => {
          $editableZone.on('blur keyup paste focus', () => {
            // If no structural elements exist, create a default paragraph
            const elementList = $editableZone.find('.tc-block');
            if (elementList.length === 0) {
              insertNewParagraphElement();
            }

            // Wrap any bare text nodes directly under the editable zone
            $editableZone.contents().each((index, domNode) => {
              if (domNode.nodeType === Node.TEXT_NODE && domNode.textContent.trim().length > 0) {
                const textContent = domNode.data.trim();
                if (textContent) {
                    document.execCommand('insertHTML', false,
                      `<p name="${createUniqueId()}" class="tc-block tc-block--p">${txtCraftCore.htmlEntities(textContent)}<br/></p>`);
                    domNode.remove(); // Remove the original text node
                    markFirstStructuralElement();
                }
              }
            });
          });
        };

        // Handle paragraph creation on Enter key press
        const attachParagraphCreationHandlers = () => {
          $editableZone.on('keyup.tc_paragraph_create', (eventObject) => {
            // Process only the Enter key, not Shift+Enter
            if (eventObject.key === 'Enter' && !eventObject.shiftKey) {
              document.execCommand('formatBlock', false, 'p');

              // After formatBlock, the newly created paragraph might not have our classes/name
              const currentSelectionNode = txtCraftUtils.retrieveSelectionAnchor();
              let nearestElement = angular.element(currentSelectionNode).closest('.tc-block');

              if (nearestElement.length === 0) {
                // Fallback: if closest .tc-block not found, assume current node is the new block
                nearestElement = angular.element(currentSelectionNode);
              }
              // Ensure the element has a unique name and class
              nearestElement.attr('name', createUniqueId()).addClass('tc-block tc-block--p');
              markFirstStructuralElement();
            }
          });
        };

        // Orchestrate all editor initialization steps
        const initializeEditorComponents = () => {
          configurePlaceholderBehavior();
          attachSelectionListeners();
          attachPasteHandlers();
          attachParagraphCreationHandlers();
          attachCleanupListeners();
          attachWrappingHandlers();
          // Initial check for placeholder and cleanup
          $timeout(() => {
            activatePlaceholderDisplay();
            flattenStructuralElements();
            markFirstStructuralElement();
          }, 0);
        };

        // Execute a simple formatting command (bold, italic, underline, block formats)
        scope.executeFormattingCommand = (formatAction, formatElement) => {
          if (!document.queryCommandSupported(formatAction)) {
              console.warn(`Command "${formatAction}" not supported by browser.`);
              return;
          }
          document.execCommand('styleWithCSS', false, false); // Ensure semantic formatting
          document.execCommand(formatAction, false, formatElement);

          if (formatAction === 'formatBlock') {
            const currentSelectionNode = txtCraftUtils.retrieveSelectionAnchor();
            let nearestElement = angular.element(currentSelectionNode).closest(formatElement);

            if (nearestElement.length === 0) {
              // If not directly found, check previous sibling (e.g., after Enter)
              nearestElement = angular.element(currentSelectionNode).prev(formatElement);
            }
            if (nearestElement.length) {
              nearestElement.attr('name', createUniqueId()).addClass('tc-block tc-block--' + formatElement);
              flattenStructuralElements(); // Ensure no nested blocks
              markFirstStructuralElement();
            }
          }
        };

        // Move the control panel to the document body to prevent overflow issues
        $documentBody.append($controlPanel);

        // Run the full editor setup
        initializeEditorComponents();


        //
        // Public Editor API Methods
        //

        // Get or set the editor's content data model
        editorApi.setContentData = (contentModel) => {
          if (!contentModel) {
            return txtCraftCore.generateModel($editableZone);
          }
          $editableZone.html(txtCraftCore.generateHTMLFromModel(contentModel));
          deactivatePlaceholderDisplay(); // Hide placeholder if content is loaded
          markFirstStructuralElement(); // Re-evaluate first element
        };

        // Retrieve the rendered HTML from a given data model
        editorApi.getRenderedHtml = (contentModel) => {
          if (!contentModel) {
            return ''; // Return empty string instead of null
          }
          return txtCraftCore.generateHTMLFromModel(contentModel);
        };

        // Calculate the difference (delta) between two content models
        editorApi.calculateContentDiff = txtCraftCore.computeDelta;
        // Apply a calculated delta to the editor's content
        editorApi.applyContentDiff = txtCraftCore.applyDelta;

        // Clear all content from the editor
        editorApi.clearContent = () => {
            $editableZone.empty();
            $timeout(() => {
                insertNewParagraphElement(); // Ensure there's always at least one editable paragraph
                activatePlaceholderDisplay();
            }, 0);
        };
      }
    };
  }
]);