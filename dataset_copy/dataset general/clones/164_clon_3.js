/*
 * document_overlay_manager.js: Manages visual overlays and interactive editing for document content
 * Based on ALTO XML structure represented as JSON.
 * For further information, consult: http://opendatachallenge.kbresearch.nl/ (historical reference)
 * Original Copyright (C) 2011 R. van der Ark, Koninklijke Bibliotheek - National Library of the Netherlands
 *
 * This software is distributed under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 *
 * This software is provided "as is", WITHOUT ANY EXPRESS OR IMPLIED WARRANTY,
 * including but not limited to, the implied warranties of MERCHANTABILITY and FITNESS FOR A PARTICULAR PURPOSE.
 * Refer to the GNU General Public License for complete details.
 *
 * A copy of the GNU General Public License should have been provided with this program.
 * If not, see <http://www.gnu.org/licenses/>.
 */

var DocumentOverlayManager = Class.create({

  // Internal configuration parameters for styling and behavior
  _config: {
    highlightColors: {
      block: "rgba(255, 0, 0, 0.2)", // Semi-transparent red for text blocks
      line: "rgba(0, 0, 255, 0.3)", // Semi-transparent blue for text lines
      word: "rgba(0, 0, 255, 0.4)", // Darker blue for words
      editFocus: "rgba(0, 170, 0, 0.4)" // Green for active edit
    },
    segmentationCorrectionStyles: {
      errorLink: "color: #e60000; font-weight: bold; margin-right: 40px; text-decoration: underline;",
      actionLink: "float: right; color: #0000e6; font-weight: bold; margin-right: 3px; text-decoration: underline;"
    },
    lineHoverBackgroundColor: "#e0ffe0", // Light green
    wordHoverBackgroundColor: "#e0e0ff", // Light blue
    defaultWordInputWidthMultiplier: 10, // px per char
    minZoomLevel: 0.5,
    zoomPadding: 60
  },

  /**
   * Initializes the document overlay manager.
   * @param {Object} docModel The document data model (e.g., ALTO JSON structure).
   * @param {Object} visualComponent The image client responsible for rendering images and overlays.
   * @param {string} targetContentElementId The ID of the HTML element where text content will be displayed.
   * @param {string} initialKeywords A space-separated string of keywords for potential future use.
   * @param {Object} zoomControl An optional zoom controller object (currently unused).
   */
  setupManager: function(docModel, visualComponent, targetContentElementId, initialKeywords, zoomControl) {
    // Validate essential inputs
    if (!docModel || !visualComponent || !targetContentElementId) {
      console.error("DocumentOverlayManager: Missing essential initialization parameters.");
      return;
    }

    this.docData = docModel;
    this.keywordList = initialKeywords ? initialKeywords.toLowerCase().split(" ") : [];
    this.imgClient = visualComponent;
    this.imgDisplayArea = this.imgClient.container; // Reference to the image container DOM element
    this.txtDisplayArea = $(targetContentElementId); // Using Prototype.js '$' for element lookup

    // State variables for managing interaction and rendering
    this.activeLineHighlight = null; // Stores the current highlighted line overlay ID
    this.activeWordHighlight = null; // Stores the current highlighted word overlay ID
    this.contentRegionOverlays = []; // Array to hold IDs of block overlays
    this.pendingModifications = {}; // Stores changes to be submitted (e.g., word content updates)
    this.processingSequence = []; // Ordered list of word IDs for navigation
    this.currentEditSession = null; // Holds details of the currently active word edit session
    this.preventLineClicks = false; // Flag to disable line click events during certain operations
    this.maximumLineExtent = 0; // Tracks the widest line encountered for zoom calculations

    // Begin the rendering process after initialization
    this._beginVisualRendering();
  },

  /**
   * Initiates the rendering of document content and associated image overlays.
   * This method orchestrates the display of text blocks and their corresponding visual regions.
   */
  _beginVisualRendering: function() {
    var selfRef = this; // Capture 'this' for use in callbacks

    if (!this.docData || !this.docData.blocks || this.docData.blocks.length === 0) {
      console.warn("DocumentOverlayManager: No content blocks found to render.");
      return;
    }

    // Process each content block present in the document data
    this.docData.blocks.each(function(contentBlock) {
      // Render the text content for the current block into the text display area
      selfRef._processContentBlock(contentBlock);

      // Add a clickable overlay on the image for the current text block
      selfRef.contentRegionOverlays.push(selfRef.imgClient.addOverlay(
        contentBlock.hpos,
        contentBlock.vpos,
        contentBlock.width,
        contentBlock.height,
        selfRef._config.highlightColors.block, // Use configured block highlight color
        true, // Make the overlay clickable
        contentBlock.id + "_box", // Unique ID for the overlay
        function(event) {
          // Callback when a block overlay is clicked
          var targetId = this.id.replace("_box", ""); // Get original text block ID
          var targetElement = $(targetId); // Find the corresponding text element
          if (targetElement) {
            // Scroll the text container to bring the block into view
            var scrollOffset = Prototype.Browser.IE ? 0 : selfRef.txtDisplayArea.offsetTop;
            selfRef.txtDisplayArea.scrollTop = targetElement.offsetTop - scrollOffset;

            // Apply a visual highlight effect to the text block
            new Effect.Highlight(targetId, {
              startcolor: '#ffff99',
              endcolor: '#ffffff'
            });

            // Adjust the image viewport to center on the clicked block
            selfRef.imgClient.setViewportPosition(
              contentBlock.hpos * selfRef.imgClient.getZoom(),
              contentBlock.vpos * selfRef.imgClient.getZoom()
            );
            selfRef.imgClient.refreshDisplay(); // Re-render the image with new position
          } else {
            console.warn("DocumentOverlayManager: Corresponding text element not found for block ID:", targetId);
          }
        }
      ));
    });
  },

  /**
   * Processes a single content block, rendering its lines and words into the text container.
   * Attaches event listeners for user interaction (hover, click, edit).
   * @param {Object} contentBlock The data object for the text block.
   */
  _processContentBlock: function(contentBlock) {
    var selfRef = this; // Capture 'this' for use in callbacks
    var blockWrapperDiv = new Element("div", {
      "id": contentBlock.id,
      "class": "documentTextBlock"
    }); // Wrapper for the text block

    if (!contentBlock.lines || contentBlock.lines.length === 0) {
      // console.info("DocumentOverlayManager: Content block ID " + contentBlock.id + " has no lines.");
      this.txtDisplayArea.insert(blockWrapperDiv);
      this.txtDisplayArea.insert(new Element("br"));
      return;
    }

    contentBlock.lines.each(function(lineSegment) {
      var currentLineElement = new Element("div", {
        "id": lineSegment.id,
        "class": "documentLineSegment"
      });

      // Event listener for mouse over on a line
      currentLineElement.observe("mouseover", function(event) {
        this.style.backgroundColor = selfRef._config.lineHoverBackgroundColor;
        this.style.cursor = "pointer";
        selfRef.highlightRegion(lineSegment); // Highlight the line on the image
      });

      // Event listener for mouse movement on a line (to show segmentation corrector)
      currentLineElement.observe("mousemove", function(event) {
        // Hide all segmentation corrector triggers initially
        $$('.segment_action_trigger').each(Element.hide);
        // If mouse is near the right edge, show the corrector trigger for this line
        var elementWidth = this.getWidth();
        if (event.clientX > (this.cumulativeOffset()[0] + elementWidth - 40)) {
          var correctorElement = $(this.id + ":corrector1");
          if (correctorElement) {
            correctorElement.show();
          }
        }
      });

      // Add a link for segmentation actions (e.g., splitting, merging)
      selfRef.addSegmentationActionLink(currentLineElement);

      // Process each word unit within the line segment
      lineSegment.strings.each(function(wordUnit) {
        if (!wordUnit.isDeleted) { // Only render words that are not marked as deleted
          // Record the word's position in the sequential reading order
          selfRef.processingSequence.push(contentBlock.id + ":" + lineSegment.id + ":" + wordUnit.id);

          var wordDisplaySpan = new Element("span", {
            "id": contentBlock.id + ":" + lineSegment.id + ":" + wordUnit.id,
            "class": "wordDisplayUnit"
          });
          wordDisplaySpan.insert(wordUnit.content); // Insert word text

          if (wordUnit.isModified) {
            wordDisplaySpan.style.color = "green"; // Indicate updated words
          }

          currentLineElement.insert(wordDisplaySpan);
          currentLineElement.insert("&nbsp;"); // Add a non-breaking space between words

          // Event listeners for word interaction
          wordDisplaySpan.observe("click", function(event) {
            event.stop(); // Prevent line click event from firing
            selfRef.initiateWordEdit(this);
          });
          wordDisplaySpan.observe("mouseover", function(event) {
            this.style.backgroundColor = selfRef._config.wordHoverBackgroundColor;
            this.style.cursor = "pointer";
            selfRef.highlightEntity(wordUnit); // Highlight the word on the image
          });
          wordDisplaySpan.observe("mouseout", function(event) {
            this.style.backgroundColor = "transparent";
          });
        }
      });

      // Event listener for clicking on a line (initiates word edit if no other edit is active)
      currentLineElement.observe("click", function(event) {
        if (selfRef.preventLineClicks) {
          event.stop(); // Prevent default if clicks are locked
          return;
        }

        selfRef.adjustImageZoomToLine(lineSegment, contentBlock, selfRef.getRelativeScrollPosition(this));
        selfRef.highlightRegion(lineSegment);

        // Check if there's an active input field, if not, activate the first word for editing
        var hasInputField = this.childElements().detect(function(e) {
          return e.id && e.id.match(/_input$/);
        });
        if (!hasInputField && !selfRef.preventLineClicks) {
          var firstWordSpan = this.childElements().find(function(el) {
            return el.tagName.toLowerCase() === 'span' && el.className === 'wordDisplayUnit';
          });
          if (firstWordSpan) {
            selfRef.initiateWordEdit(firstWordSpan);
          }
        }
      });

      // Event listener for mouse out on a line
      currentLineElement.observe("mouseout", function(event) {
        this.style.backgroundColor = "transparent";
      });

      // Update the maximum line width for zoom calculations
      selfRef.maximumLineExtent = Math.max(selfRef.maximumLineExtent, lineSegment.width);

      blockWrapperDiv.insert(currentLineElement);

      // After rendering the line, validate its segmentation and add a correction link if needed
      if (!selfRef.verifySegmentationIntegrity(currentLineElement)) {
        selfRef.addCorrectionLink(currentLineElement);
      }
    });

    this.txtDisplayArea.insert(blockWrapperDiv);
    this.txtDisplayArea.insert(new Element("br")); // Add a line break after each block
  },

  /**
   * Retrieves line data from the document model based on its ID.
   * @param {string} targetLineId The ID of the line to find.
   * @returns {Object|null} The line data object if found, otherwise null.
   */
  retrieveLineData: function(targetLineId) {
    if (!this.docData || !this.docData.blocks) return null;

    for (var blockIdx = 0; blockIdx < this.docData.blocks.length; ++blockIdx) {
      var currentBlock = this.docData.blocks[blockIdx];
      if (!currentBlock.lines) continue;

      var foundLine = currentBlock.lines.detect(function(line) {
        return line.id === targetLineId;
      });
      if (foundLine) return foundLine;
    }
    return null;
  },

  /**
   * Locates a word entity within the document model by its ID.
   * @param {string} entityId The full ID of the word (e.g., "blockId:lineId:wordId").
   * @returns {Object|null} The word data object if found, otherwise null.
   */
  locateWordEntity: function(entityId) {
    if (!this.docData || !this.docData.blocks) return null;

    var actualWordId = entityId.replace(/.*:/, ""); // Extract just the word's local ID

    for (var blockIndex = 0; blockIndex < this.docData.blocks.length; ++blockIndex) {
      var currentBlock = this.docData.blocks[blockIndex];
      if (!currentBlock.lines) continue;

      for (var lineIndex = 0; lineIndex < currentBlock.lines.length; ++lineIndex) {
        var currentLine = currentBlock.lines[lineIndex];
        if (!currentLine.strings) continue;

        var foundWord = currentLine.strings.detect(function(word) {
          return word.id === actualWordId;
        });
        if (foundWord) return foundWord;
      }
    }
    return null;
  },

  /**
   * Calculates the vertical position of a given text division relative to the current scroll.
   * @param {Element} targetDiv The DOM element representing a text division (e.g., a line).
   * @returns {number} The scroll-adjusted offset top of the element.
   */
  getRelativeScrollPosition: function(targetDiv) {
    if (!targetDiv) return 0;
    return targetDiv.offsetTop - this.getCurrentScrollOffset();
  },

  /**
   * Retrieves the current vertical scroll position of the text content area.
   * Accounts for browser differences in offset calculations.
   * @returns {number} The current scroll offset.
   */
  getCurrentScrollOffset: function() {
    // Prototype.Browser.IE handles offsetTop differently for scroll calculations
    var containerOffsetAdjustment = Prototype.Browser.IE ? 0 : this.txtDisplayArea.offsetTop;
    return this.txtDisplayArea.scrollTop + containerOffsetAdjustment;
  },

  /**
   * Adjusts the image client's zoom level and position to focus on a specific line.
   * @param {Object} lineData The data object for the line to zoom to.
   * @param {Object} [blockData] The data object for the parent text block (optional, for context).
   * @param {number} atPosition The vertical position within the text container to align the line to.
   */
  adjustImageZoomToLine: function(lineData, blockData, atPosition) {
    if (!lineData || typeof lineData.width === 'undefined' || typeof lineData.hpos === 'undefined' || typeof lineData.vpos === 'undefined') {
      console.warn("DocumentOverlayManager: Invalid line data provided for zoom adjustment.");
      return;
    }

    // Calculate an appropriate zoom level based on the broadest line and page width
    // This aims to fit the broadest line within the image display area
    var calculatedZoom = 1.0 - ((this.maximumLineExtent + this._config.zoomPadding) / this.docData.page_width);

    // Ensure zoom doesn't go below a minimum threshold
    if (calculatedZoom < this._config.minZoomLevel) {
      calculatedZoom = this._config.minZoomLevel;
    }

    // Further adjust zoom if the current line at this zoom would exceed the image container width
    var imageContainerWidth = parseInt(this.imgDisplayArea.style.width);
    if (calculatedZoom * lineData.width > imageContainerWidth + this._config.zoomPadding) {
      calculatedZoom *= imageContainerWidth / (calculatedZoom * (this.maximumLineExtent + this._config.zoomPadding));
    }

    this.imgClient.setZoomLevel(calculatedZoom);

    // Set the viewport position to center on the line, adjusted by the scroll position
    this.imgClient.setViewportPosition(
      (lineData.hpos * this.imgClient.getZoom()) - 20, // Small horizontal offset
      (lineData.vpos * this.imgClient.getZoom()) - atPosition
    );
    this.imgClient.refreshDisplay(); // Re-render the image
  },

  /**
   * Highlights a specific text line on the image by adding an overlay.
   * Removes any previously active line highlight.
   * @param {Object} lineDetails The data object for the line to highlight.
   */
  highlightRegion: function(lineDetails) {
    if (!lineDetails) return;

    // Remove any existing line highlight
    if (this.activeLineHighlight) {
      this.imgClient.removeOverlay(this.activeLineHighlight);
    }
    // Add a new overlay for the specified line
    this.activeLineHighlight = this.imgClient.addOverlay(
      lineDetails.hpos,
      lineDetails.vpos,
      lineDetails.width,
      lineDetails.height,
      this._config.highlightColors.line // Use configured line highlight color
    );
  },

  /**
   * Highlights a specific word entity on the image.
   * Removes any previously active word highlight.
   * @param {Object} wordDetails The data object for the word to highlight.
   * @param {string} [customColor] Optional custom color for the highlight.
   */
  highlightEntity: function(wordDetails, customColor) {
    if (!wordDetails) return;

    // Remove any existing word highlight
    if (this.activeWordHighlight) {
      this.imgClient.removeOverlay(this.activeWordHighlight);
    }
    // Add a new overlay for the specified word
    this.activeWordHighlight = this.imgClient.addOverlay(
      wordDetails.hpos,
      wordDetails.vpos,
      wordDetails.width,
      wordDetails.height,
      customColor || this._config.highlightColors.word // Use custom color or default word highlight
    );
  },

  /**
   * Appends a "correction link" to a line element, typically for lines
   * that fail segmentation validation.
   * @param {Element} targetLineContainer The DOM element representing the text line.
   */
  addCorrectionLink: function(targetLineContainer) {
    if (!targetLineContainer) return;

    var selfRef = this;
    var correctionPromptAnchor = new Element("a", {
      "style": this._config.segmentationCorrectionStyles.errorLink,
      "id": targetLineContainer.id + ":corrector",
      "class": "segmentErrorCorrection"
    });

    correctionPromptAnchor.insert("!!!"); // Visual indicator for error
    targetLineContainer.insert(correctionPromptAnchor);

    correctionPromptAnchor.observe("click", function(event) {
      event.stop(); // Prevent parent line click
      selfRef.persistPendingEdit(); // Save any active edit before opening editor
      selfRef.preventLineClicks = true; // Lock line clicks while editor is open
      // Instantiate a new segmentation editor (assuming SegEdit is a global class)
      new SegEdit(selfRef.retrieveLineData(targetLineContainer.id), selfRef.imgClient, targetLineContainer, selfRef);
    });
  },

  /**
   * Appends a generic "segmentation action link" to a line element,
   * typically for advanced segmentation operations.
   * @param {Element} targetLineContainer The DOM element representing the text line.
   */
  addSegmentationActionLink: function(targetLineContainer) {
    if (!targetLineContainer) return;

    var selfRef = this;
    var actionTriggerAnchor = new Element("a", {
      "style": this._config.segmentationCorrectionStyles.actionLink,
      "class": "segment_action_trigger",
      "id": targetLineContainer.id + ":corrector1" // Unique ID for this type of trigger
    });

    actionTriggerAnchor.insert("..."); // Visual indicator for action
    targetLineContainer.insert(actionTriggerAnchor);

    actionTriggerAnchor.observe("click", function(event) {
      event.stop(); // Prevent parent line click
      selfRef.persistPendingEdit(); // Save any active edit
      selfRef.preventLineClicks = true; // Lock line clicks
      // Instantiate segmentation editor
      new SegEdit(selfRef.retrieveLineData(targetLineContainer.id), selfRef.imgClient, targetLineContainer, selfRef);
    });
    actionTriggerAnchor.hide(); // Initially hide this trigger
  },

  /**
   * Updates the segmentation data (words) within a specific line based on editor changes.
   * Handles insertions, deletions, resizings, and content updates.
   * @param {Array} deletedIds List of word IDs that were deleted.
   * @param {Array} resizedEntities List of word objects with updated dimensions.
   * @param {Array} newInsertions List of new word objects to insert.
   * @param {Array} updatedContent List of word objects with new text content.
   * @param {Element} targetLineElement The DOM element of the line being updated.
   */
  refreshSegmentationData: function(deletedIds, resizedEntities, newInsertions, updatedContent, targetLineElement) {
    var selfRef = this;
    var lineSegment = this.retrieveLineData(targetLineElement.id);
    if (!lineSegment) {
      console.error("DocumentOverlayManager: Cannot refresh segmentation, line data not found for ID:", targetLineElement.id);
      return;
    }

    // Handle insertions
    newInsertions.each(function(insertionData) {
      var existingSpans = targetLineElement.childElements().findAll(function(el) {
        return el.tagName.toLowerCase() === 'span' && el.className === 'wordDisplayUnit';
      });
      // Find the correct position to insert the new word
      for (var idx = 0; idx < existingSpans.length; ++idx) {
        var currentWordObj = selfRef.locateWordEntity(existingSpans[idx].id);
        var nextWordObj = (idx === existingSpans.length - 1) ? null : selfRef.locateWordEntity(existingSpans[idx + 1].id);

        var insertPositionFound = false;
        if (currentWordObj && nextWordObj && currentWordObj.hpos < insertionData.hpos && nextWordObj.hpos > insertionData.hpos) {
          insertPositionFound = true;
        } else if (currentWordObj && !nextWordObj && currentWordObj.hpos < insertionData.hpos) {
          // Insert after the last word if it's beyond it
          insertPositionFound = true;
        }

        if (insertPositionFound) {
          var newWordSpanId = targetLineElement.ancestors()[0].id + ":" + targetLineElement.id + ":" + insertionData.id;
          var insertedSpan = new Element("span", {
            "id": newWordSpanId,
            "class": "wordDisplayUnit",
            "style": "color: green"
          });
          insertedSpan.insert(insertionData.content);
          existingSpans[idx].insert({
            after: insertedSpan
          });
          insertedSpan.insert({
            before: "&nbsp;"
          });

          // Update the underlying document model
          lineSegment.strings.splice(idx + 1, 0, insertionData);
          // Update the sequential reading order
          selfRef.processingSequence.splice(selfRef.processingSequence.indexOf(existingSpans[idx].id) + 1, 0, newWordSpanId);

          // Re-attach event listeners for the new span
          insertedSpan.observe("click", function(event) {
            event.stop();
            selfRef.initiateWordEdit(this);
          });
          insertedSpan.observe("mouseover", function(event) {
            this.style.backgroundColor = selfRef._config.wordHoverBackgroundColor;
            this.style.cursor = "pointer";
            selfRef.highlightEntity(insertionData);
          });
          insertedSpan.observe("mouseout", function(event) {
            this.style.backgroundColor = "transparent";
          });

          // Record the changes for submission
          selfRef.recordChangeEntry("insert", newWordSpanId, "after", existingSpans[idx].id);
          selfRef.recordChangeEntry("insert", newWordSpanId, "width", insertionData.width);
          selfRef.recordChangeEntry("insert", newWordSpanId, "hpos", insertionData.hpos);
          selfRef.recordChangeEntry("insert", newWordSpanId, "vpos", insertionData.vpos);
          selfRef.recordChangeEntry("insert", newWordSpanId, "height", insertionData.height);
          selfRef.recordChangeEntry("insert", newWordSpanId, "content", insertionData.content);
          break;
        }
      }
    });

    // Handle content updates
    updatedContent.each(function(contentUpdate) {
      var targetWordSpan = $(targetLineElement.ancestors()[0].id + ":" + targetLineElement.id + ":" + contentUpdate.id);
      if (targetWordSpan) {
        targetWordSpan.innerHTML = contentUpdate.content;
        selfRef.recordChangeEntry("update", targetWordSpan.id, "content", contentUpdate.content);
      }
    });

    // Handle resizings
    resizedEntities.each(function(resizeData) {
      var wordToResize = selfRef.locateWordEntity(resizeData.id);
      if (wordToResize) {
        wordToResize.hpos += resizeData.left;
        wordToResize.width += resizeData.width;
        selfRef.recordChangeEntry("update", resizeData.id, "width", wordToResize.width);
        selfRef.recordChangeEntry("update", resizeData.id, "hpos", wordToResize.hpos);
      }
    });

    // Handle deletions
    deletedIds.each(function(deletedId) {
      var elementToRemove = $(deletedId);
      if (elementToRemove) {
        elementToRemove.remove();
        // Remove from the sequential reading order
        selfRef.processingSequence = selfRef.processingSequence.without(deletedId);
        selfRef.recordChangeEntry("update", deletedId, "isDeleted", "true"); // Mark as deleted
      }
    });

    // Re-validate the line segmentation after updates
    if (this.verifySegmentationIntegrity(targetLineElement)) {
      var correctorLink = $(targetLineElement.id + ":corrector");
      if (correctorLink) {
        correctorLink.remove(); // Remove correction link if validation passes
      }
    } else {
      // Add correction link if validation fails and one doesn't exist
      if (!$(targetLineElement.id + ":corrector")) {
        this.addCorrectionLink(targetLineElement);
      }
    }
  },

  /**
   * Records a change entry to be potentially submitted to the server.
   * This generates hidden input fields within a form.
   * @param {string} changeType The type of change (e.g., "insert", "update").
   * @param {string} entityId The ID of the entity being changed.
   * @param {string} fieldName The name of the field being updated (e.g., "content", "width").
   * @param {*} fieldValue The new value of the field.
   */
  recordChangeEntry: function(changeType, entityId, fieldName, fieldValue) {
    var formId = 'update_form'; // Assuming a form with this ID exists
    var formElement = $(formId);
    if (!formElement) {
      console.warn("DocumentOverlayManager: Update form with ID '" + formId + "' not found. Cannot record change.");
      return;
    }

    var inputName = changeType + "[" + entityId + "][" + fieldName + "]";

    // Check if an input for this specific change already exists
    var existingField = formElement.select('input[name="' + inputName + '"]').first();

    if (existingField) {
      existingField.value = fieldValue; // Update existing field
    } else {
      // Create a new hidden input field
      formElement.insert(new Element("input", {
        "name": inputName,
        "value": fieldValue,
        "type": "hidden"
      }));
    }
  },

  /**
   * Validates the segmentation integrity of a given line element.
   * Checks for empty spans or spans containing multiple words.
   * @param {Element} lineContainer The DOM element representing the line.
   * @returns {boolean} True if segmentation is valid, false otherwise.
   */
  verifySegmentationIntegrity: function(lineContainer) {
    if (!lineContainer) return true; // Treat non-existent lines as valid

    var childSpans = lineContainer.childElements().findAll(function(el) {
      return el.tagName.toLowerCase() === 'span';
    });

    for (var idx = 0; idx < childSpans.length; idx++) {
      var spanContent = childSpans[idx].innerHTML.strip(); // Remove leading/trailing whitespace
      if (spanContent === "" || spanContent === "&nbsp;") {
        return false; // Empty span detected
      }
      // Check for multiple words within a single span (simple whitespace check)
      if (spanContent.match(/\s+/)) {
        return false;
      }
    }
    return true;
  },

  /**
   * Saves the content of the currently active edit session.
   * Updates the corresponding word span and records the change.
   * @returns {boolean} True if an edit was saved or if no edit was active, false if an error occurred.
   */
  persistPendingEdit: function() {
    if (!this.currentEditSession) {
      return true; // No active edit session
    }

    var editInputField = this.currentEditSession.inputField;
    var targetSpanElement = $(editInputField.name); // Original span element
    if (!targetSpanElement || !editInputField) {
      console.error("DocumentOverlayManager: Failed to find target elements for current edit session.");
      this.currentEditSession = null;
      return false;
    }

    var parentLineElement = targetSpanElement.ancestors()[0];

    // Stop observing events on the input field to prevent memory leaks and redundant triggers
    editInputField.stopObserving("keypress");
    editInputField.stopObserving("mouseover");
    editInputField.stopObserving("keydown");

    // Handle empty input values
    var newContentValue = editInputField.value.strip();
    if (newContentValue === "") {
      newContentValue = "&nbsp;"; // Use non-breaking space for visual consistency
    }

    // Check if the content has actually changed
    if (newContentValue !== targetSpanElement.innerHTML) {
      this.pendingModifications[editInputField.name] = newContentValue;
      this.recordChangeEntry("update", editInputField.name, "content", newContentValue);
      targetSpanElement.style.color = "green"; // Visually mark as updated
    }

    targetSpanElement.innerHTML = newContentValue; // Update the displayed text
    targetSpanElement.show(); // Make the original span visible again

    // Re-validate the segmentation of the parent line
    if (this.verifySegmentationIntegrity(parentLineElement)) {
      var correctorLink = $(parentLineElement.id + ":corrector");
      if (correctorLink) {
        correctorLink.remove(); // Remove error indicator if fixed
      }
    } else if (!$(parentLineElement.id + ":corrector")) {
      this.addCorrectionLink(parentLineElement); // Add error indicator if still invalid
    }

    editInputField.remove(); // Remove the input field from the DOM
    this.currentEditSession = null; // Clear the active edit session
    return true;
  },

  /**
   * Initiates an in-place editing session for a specific word element.
   * Replaces the word's span with an input field.
   * @param {Element} targetElement The DOM element (span) of the word to edit.
   */
  initiateWordEdit: function(targetElement) {
    if (!targetElement || targetElement.tagName.toLowerCase() !== 'span') {
      console.warn("DocumentOverlayManager: Attempted to edit a non-span element.");
      return;
    }

    // Save any existing active edit before starting a new one
    if (!this.persistPendingEdit()) {
      return; // If saving failed, don't proceed
    }

    var selfRef = this;
    var initialValue = targetElement.innerHTML.replace("&nbsp;", ""); // Get text, remove &nbsp;
    var editInputField = new Element("input", {
      "type": "text",
      "value": initialValue,
      "name": targetElement.id, // Use the word's ID as the input's name
      "style": "width: " + (Math.max(initialValue.length, 1) * selfRef._config.defaultWordInputWidthMultiplier) + "px; color: " + targetElement.style.color,
      "id": targetElement.id + "_input", // Unique ID for the input field
      "class": "wordEditInput"
    });

    // Highlight the word on the image with a specific edit focus color
    this.highlightEntity(this.locateWordEntity(targetElement.id), this._config.highlightColors.editFocus);
    this.currentEditSession = {
      "inputField": editInputField
    }; // Store the active edit session details

    targetElement.hide(); // Hide the original span
    targetElement.insert({
      after: editInputField
    }); // Insert the input field after it

    // Event listener for mouse over on the input field (to highlight the word on the image)
    editInputField.observe("mouseover", function(event) {
      selfRef.highlightEntity(selfRef.locateWordEntity(this.name));
    });

    // Event listener for keydown events to handle navigation and saving
    editInputField.observe("keydown", function(event) {
      var keyCode = event.keyCode || event.which;

      switch (keyCode) {
        case 9: // Tab key
          selfRef.persistPendingEdit();
          if (event.shiftKey) {
            selfRef.navigateEditFocus(this.name, -1); // Previous word
          } else {
            selfRef.navigateEditFocus(this.name, 1); // Next word
          }
          event.preventDefault(); // Prevent default tab behavior
          break;
        case 13: // Enter key
          selfRef.persistPendingEdit();
          event.preventDefault(); // Prevent form submission
          break;
        case 38: // Up arrow
          selfRef.shiftEditLineFocus(this.ancestors()[0].id, -1); // Previous line
          event.preventDefault();
          break;
        case 40: // Down arrow
          selfRef.shiftEditLineFocus(this.ancestors()[0].id, 1); // Next line
          event.preventDefault();
          break;
        case 39: // Right arrow
        case 37: // Left arrow
          var cursorPosition = null;
          if (document.selection) { // IE-specific caret position
            var range = document.selection.createRange();
            range.moveEnd('character', this.value.length);
            cursorPosition = this.value.lastIndexOf(range.text);
          } else { // Standard browser caret position
            cursorPosition = this.selectionStart;
          }

          if (cursorPosition === 0 && keyCode === 37) { // Left arrow at start of word
            selfRef.navigateEditFocus(this.name, -1);
            event.preventDefault();
          } else if (cursorPosition === this.value.length && keyCode === 39) { // Right arrow at end of word
            selfRef.navigateEditFocus(this.name, 1);
            event.preventDefault();
          }
          break;
      }
    });

    // Set focus and select the text in the input field after a short delay
    // This ensures the element is rendered and ready for interaction
    setTimeout(function() {
      if (editInputField) {
        editInputField.focus();
        editInputField.select();
      }
    }, 50);
  },

  /**
   * Navigates the editing focus to the previous or next word in the sequential reading order.
   * @param {string} currentWordId The ID of the word currently being edited.
   * @param {number} moveDirection -1 for previous, 1 for next.
   */
  navigateEditFocus: function(currentWordId, moveDirection) {
    var currentIndex = this.processingSequence.indexOf(currentWordId);
    if (currentIndex === -1) {
      console.warn("DocumentOverlayManager: Current word ID not found in processing sequence.");
      return;
    }

    var nextIndex = currentIndex + moveDirection;
    if (nextIndex >= 0 && nextIndex < this.processingSequence.length) {
      var nextWordElement = $(this.processingSequence[nextIndex]);
      if (nextWordElement) {
        this.initiateWordEdit(nextWordElement);

        // Adjust scroll/zoom if navigating to a word in a different line
        var currentLineDiv = $(currentWordId).ancestors()[0];
        var nextLineDiv = nextWordElement.ancestors()[0];
        if (currentLineDiv && nextLineDiv && currentLineDiv.id !== nextLineDiv.id) {
          this.adjustImageZoomToLine(
            this.retrieveLineData(nextLineDiv.id),
            null,
            this.getRelativeScrollPosition(nextLineDiv)
          );
        }
      }
    }
  },

  /**
   * Shifts the editing focus to a word in the line above or below the current line.
   * It attempts to select the first word in the target line.
   * @param {string} currentLineDivId The ID of the current line's DOM element.
   * @param {number} moveDirection -1 for up, 1 for down.
   */
  shiftEditLineFocus: function(currentLineDivId, moveDirection) {
    // Get IDs of all line elements in the text container
    var lineElementIDs = this.txtDisplayArea.select('div.documentLineSegment').map(function(d) {
      return d.id;
    });

    var currentIndex = lineElementIDs.indexOf(currentLineDivId);
    if (currentIndex === -1) {
      console.warn("DocumentOverlayManager: Current line ID not found in line element list.");
      return;
    }

    var targetIndex = currentIndex + moveDirection;
    if (targetIndex >= 0 && targetIndex < lineElementIDs.length) {
      var targetLineElement = $(lineElementIDs[targetIndex]);
      if (targetLineElement) {
        // Find the first word span in the target line
        var firstWordInTargetLine = targetLineElement.childElements().find(function(el) {
          return el.tagName.toLowerCase() === 'span' && el.className === 'wordDisplayUnit';
        });
        if (firstWordInTargetLine) {
          this.initiateWordEdit(firstWordInTargetLine);
          // Adjust zoom to the new line
          this.adjustImageZoomToLine(
            this.retrieveLineData(targetLineElement.id),
            null,
            this.getRelativeScrollPosition(targetLineElement)
          );
        }
      }
    }
  }
});