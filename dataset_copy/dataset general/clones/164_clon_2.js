/*
 * document_processor.js: Tool for viewing and adjusting structured document data in JSON format.
 * For more information, consult: http://datadocs.example.com/specifications/
 * Copyright (C) 2023 A. DataHandler, Digital Archives Consortium - National Data Repository
 *
 * This utility is open-source software: you are free to redistribute and/or modify
 * it according to the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your discretion) any subsequent version.
 *
 * This utility is distributed in the hope that it will be beneficial,
 * but WITHOUT ANY EXPRESS OR IMPLIED WARRANTY; including, without limitation, the implied warranties of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. Refer to the
 * GNU General Public License for additional details.
 *
 * A copy of the GNU General Public License should have been provided
 * with this utility. If not, see <http://www.gnu.org/licenses/>.
 */

var DocumentRenderer = Class.create({

	/**
	 * Initializes a new instance of the DocumentRenderer.
	 * @param {object} docData - The structured document data (e.g., ALTO JSON).
	 * @param {object} graphicClient - An interface to the image display and manipulation component.
	 * @param {HTMLElement} contentDisplay - The HTML element where text content will be rendered.
	 * @param {string} searchTerms - A string of space-separated words for initial highlighting.
	 * @param {object} zoomController - An optional controller for zoom interactions.
	 */
	initialize: function(docData, graphicClient, contentDisplay, searchTerms, zoomController) {

		// Store the main document data for later access.
		this.docData = docData;

		// Process and store search terms, if provided.
		this.searchTerms = (searchTerms ? searchTerms.toLowerCase().split(" ") : []);

		// Keep a reference to the graphical client.
		this.graphicClient = graphicClient;

		// Directly access the container element from the graphical client.
		this.graphicArea = this.graphicClient.container;

		// Obtain the HTML element for displaying textual content using Prototype's $ selector.
		this.contentDisplay = $(contentDisplay);

		// Initialize a variable to track the currently highlighted text line overlay.
		this.lineOverlay = null;

		// An array to store references to graphical overlays for text blocks.
		this.regionLayers = [];

		// A collection to keep track of all modifications made.
		this.changeLog = [];

		// An ordered list of text fragment identifiers, representing the reading flow.
		this.flowSequence = [];

		// Stores information about the currently active text fragment modification.
		this.activeModification = null;

		// A flag to prevent line click events during certain operations.
		this.preventLineInteraction = false;

		// Tracks the maximum width encountered among all text lines for scaling purposes.
		this.widestLineExtent = 0;

		// Begin the process of rendering the document's textual content.
		this.displayContent();
	},

	/**
	 * Renders the entire text content of the document into the designated display area.
	 * Iterates through all text blocks and calls helper methods for rendering.
	 */
	displayContent: function() {
		// Capture 'this' for use within nested function scopes.
		var selfRef = this;

		// Process each block of text data present in the document.
		this.docData.sections.forEach(function(dataSection) {
			// Render the content of the current text block.
			selfRef.displayDataSection(dataSection);

			// Add a visual overlay on the image for the current text block.
			selfRef.regionLayers.push(selfRef.graphicClient.addOverlayShape(
				dataSection.horizontalPos,
				dataSection.verticalPos,
				dataSection.widthMeasure,
				dataSection.heightMeasure,
				"red",
				true,
				dataSection.identifier + "_frame",
				function(eventObject) {
					// When a block overlay is clicked, scroll the text display to the corresponding block.
					selfRef.contentDisplay.scrollPositionTop = $(this.identifier.replace("_frame", "")).offsetFromTop - (Prototype.Browser.IE ? 0 : selfRef.contentDisplay.offsetFromTop);
					// Apply a visual highlight effect to the clicked block in the text display.
					new VisualEffect.Highlight(this.identifier.replace("_frame", ""), { startColor: '#ffff99', endColor: '#ffffff' });
					// Adjust the image viewport to center on the clicked text block.
					selfRef.graphicClient.setViewportPosition(dataSection.horizontalPos * selfRef.graphicClient.getCurrentZoom(), (dataSection.verticalPos * selfRef.graphicClient.getCurrentZoom()));
					// Redraw the image to reflect the new position.
					selfRef.graphicClient.redraw();
				}
			));
		});
	},

	/**
	 * Renders a single text block, including its lines and individual text fragments.
	 * @param {object} contentSection - The data object for a specific text block.
	 */
	displayDataSection: function(contentSection) {
		// Store a reference to the current instance for nested functions.
		var instanceRef = this;

		// Create a new HTML div element to contain the text block's content.
		var sectionDivElement = new HtmlElement("div", { "identifier": contentSection.identifier });

		// Iterate through each line of text within the current text block.
		contentSection.linesData.forEach(function(contentLine) {
			// Create a div element for the current text line.
			var lineDivElement = new HtmlElement("div", { "identifier": contentLine.identifier, "cssClass": "docLineDisplay" });

			// Attach an event listener for mouseover on the line div.
			lineDivElement.onEvent("mouseover", function(mouseEvent) {
				// Change background color and cursor style on hover.
				this.style.backgroundFill = "#dfd";
				this.style.pointerShape = "pointer";
				// Highlight the corresponding line on the image.
				instanceRef.highlightContentLine(contentLine);
			});

			// Attach an event listener for mousemove on the line div.
			lineDivElement.onEvent("mousemove", function(mouseMoveEvent) {
				// Hide all segment correction links by default.
				$$('.segment_fixer').forEach(HtmlElement.conceal);
				// If the mouse is near the right edge of the line div, reveal the correction link.
				if (mouseMoveEvent.clientXCoord > (this.totalOffset()[0] + this.getComputedWidth() - 40))
					$(this.identifier + ":fixer1").reveal();
			});

			// Append a segment correction link to the line.
			instanceRef.addSegmentLink(lineDivElement);

			// Process each text fragment (word) within the current line.
			contentLine.textFragments.forEach(function(fragment) {
				// Only render fragments that are not marked for deletion.
				if (!fragment["remove"]) {
					// Add the fragment's identifier to the reading flow sequence.
					instanceRef.flowSequence.push(contentSection.identifier + ":" + contentLine.identifier + ":" + fragment.identifier);

					// Create a span element for the text fragment.
					var fragmentSpan = new HtmlElement("span", { "identifier": contentSection.identifier + ":" + contentLine.identifier + ":" + fragment.identifier });
					fragmentSpan.placeContent(fragment.textContent); // Insert the actual text content.

					// If the fragment has been updated, change its text color.
					if (fragment.modified)
						fragmentSpan.style.textColor = "green";

					// Add the fragment span to the line div.
					lineDivElement.placeContent(fragmentSpan);
					lineDivElement.placeContent("&nbsp;"); // Insert a non-breaking space after each fragment.

					// Attach a click event listener to the fragment span.
					fragmentSpan.onEvent("click", function(clickEvent) {
						instanceRef.modifyFragment(this); // Initiate modification for this fragment.
					});

					// Attach a mouseover event listener to the fragment span.
					fragmentSpan.onEvent("mouseover", function(hoverEvent) {
						this.style.backgroundFill = "#ddf"; // Change background on hover.
						this.style.pointerShape = "pointer"; // Change cursor on hover.
						instanceRef.emphasizeFragment(fragment); // Highlight the fragment on the image.
					});

					// Attach a mouseout event listener to the fragment span.
					fragmentSpan.onEvent("mouseout", function(leaveEvent) {
						this.style.backgroundFill = "transparent"; // Reset background on mouse out.
					});
				}
			});

			// Attach a click event listener to the line div.
			lineDivElement.onEvent("click", function(clickEvent) {
				// Zoom the image client to the clicked line's position.
				instanceRef.zoomToContentLine(contentLine, contentSection, instanceRef.getScrolledLinePosition(this));
				// Highlight the clicked line on the image.
				instanceRef.highlightContentLine(contentLine);
				// If no input field is active and line interaction is not locked, allow editing the first fragment.
				if (!this.childElements().find(function(element) { return element.identifier.match(/_inputField$/); }) && !instanceRef.preventLineInteraction)
					instanceRef.modifyFragment(this.childElements()[0]);
			});

			// Attach a mouseout event listener to the line div.
			lineDivElement.onEvent("mouseout", function(leaveEvent) {
				this.style.backgroundFill = "transparent"; // Reset background color on mouse out.
			});

			// Update the widest line extent if the current line is broader.
			instanceRef.widestLineExtent = (instanceRef.widestLineExtent > contentLine.widthMeasure) ? instanceRef.widestLineExtent : contentLine.widthMeasure;

			// Add the line div to the text block div.
			sectionDivElement.placeContent(lineDivElement);

			// Check if segment integrity is valid for this line; if not, add a correction link.
			if (!instanceRef.checkFragmentIntegrity(lineDivElement))
				instanceRef.addCorrectionLink(lineDivElement);
		});

		// Add the completed text block div to the main content display.
		this.contentDisplay.placeContent(sectionDivElement);
		// Add a line break for spacing between blocks.
		this.contentDisplay.placeContent(new HtmlElement("br"));
	},

	/**
	 * Locates a text line object within the document data by its identifier.
	 * @param {string} lineIdentifier - The unique identifier of the line to find.
	 * @returns {object|null} The line data object if found, otherwise null.
	 */
	findLineData: function(lineIdentifier) {
		// Iterate through each text block.
		for (idx = 0; idx < this.docData.sections.length; ++idx) {
			// Within each block, search for the line with the matching identifier.
			var currentLine = this.docData.sections[idx].linesData.find(function(lineObject) { return lineObject.identifier == lineIdentifier; });
			if (currentLine) return currentLine; // Return the line if found.
		};
		return null; // Return null if no line is found.
	},

	/**
	 * Locates a text fragment (word) object within the document data by its identifier.
	 * @param {string} fragmentIdentifier - The unique identifier of the fragment to find.
	 * @returns {object|null} The fragment data object if found, otherwise null.
	 */
	findFragmentData: function(fragmentIdentifier) {
		// Clean the identifier to get just the fragment part.
		fragmentIdentifier = fragmentIdentifier.replace(/.*:/, "");
		// Iterate through each text block.
		for (idx = 0; idx < this.docData.sections.length; ++idx) {
			// Iterate through each line within the block.
			for (jdx = 0; jdx < this.docData.sections[idx].linesData.length; ++jdx) {
				// Within each line, search for the fragment with the matching identifier.
				var currentFragment = this.docData.sections[idx].linesData[jdx].textFragments.find(function(fragmentObject) { return fragmentObject.identifier == fragmentIdentifier; });
				if (currentFragment) return currentFragment; // Return the fragment if found.
			}
		};
		return null; // Return null if no fragment is found.
	},

	/**
	 * Calculates the vertical position of a line display element relative to the scrolled content.
	 * @param {HTMLElement} lineDisplayElement - The HTML element representing the text line.
	 * @returns {number} The scrolled position of the line.
	 */
	getScrolledLinePosition: function(lineDisplayElement) {
		return lineDisplayElement.offsetFromTop - this.getScrollOffset();
	},

	/**
	 * Retrieves the current vertical scroll offset of the main content display.
	 * @returns {number} The scroll position from the top.
	 */
	getScrollOffset: function() {
		return this.contentDisplay.scrollPositionTop + (Prototype.Browser.IE ? 0 : this.contentDisplay.offsetFromTop);
	},

	/**
	 * Adjusts the image client's zoom and position to center on a specified text line.
	 * @param {object} targetLine - The data object for the line to zoom to.
	 * @param {object} parentSection - The data object for the parent text block (can be null).
	 * @param {number} verticalPosition - The vertical scroll position to align the line.
	 */
	zoomToContentLine: function(targetLine, parentSection, verticalPosition) {
		// Calculate a new zoom level based on the widest line and page width.
		var calculatedZoomLevel = 1.0 - ((this.widestLineExtent + 60) / this.docData.pageWidth);

		// Ensure the zoom level doesn't go below a minimum threshold.
		if (calculatedZoomLevel < 0.5)
			calculatedZoomLevel = 0.5;

		// Further adjust zoom if the line's scaled width exceeds the image container width.
		if (calculatedZoomLevel * targetLine.widthMeasure > parseInt(this.graphicArea.style.width) + 60) {
			calculatedZoomLevel *= parseInt(this.graphicArea.style.width) / (calculatedZoomLevel * (this.widestLineExtent + 60));
		}

		// Apply the calculated zoom level to the image client.
		this.graphicClient.setZoomLevel(calculatedZoomLevel);
		// Set the viewport position to center on the line, accounting for scroll.
		this.graphicClient.setViewportPosition((targetLine.horizontalPos * this.graphicClient.getCurrentZoom()) - 20, (targetLine.verticalPos * this.graphicClient.getCurrentZoom()) - verticalPosition);
		// Redraw the image to display the new view.
		this.graphicClient.redraw();
	},

	/**
	 * Highlights a specific text line on the image by adding an overlay.
	 * Removes any previously existing line highlight.
	 * @param {object} lineObject - The data object for the line to highlight.
	 */
	highlightContentLine: function(lineObject) {
		// If a line is already highlighted, remove its overlay.
		if (this.lineOverlay) this.graphicClient.removeOverlayShape(this.lineOverlay);
		// Add a new blue overlay for the specified line.
		this.lineOverlay = this.graphicClient.addOverlayShape(lineObject.horizontalPos, lineObject.verticalPos, lineObject.widthMeasure, lineObject.heightMeasure, "blue");
	},

	/**
	 * Highlights a specific text fragment (word) on the image by adding an overlay.
	 * Removes any previously existing fragment highlight.
	 * @param {object} textFragment - The data object for the fragment to highlight.
	 * @param {string} highlightColor - The color to use for the highlight overlay (defaults to blue).
	 */
	emphasizeFragment: function(textFragment, highlightColor) {
		// If a fragment is already highlighted, remove its overlay.
		if (this.fragmentOverlay) this.graphicClient.removeOverlayShape(this.fragmentOverlay);
		// Add a new overlay for the specified fragment with the given color.
		this.fragmentOverlay = this.graphicClient.addOverlayShape(textFragment.horizontalPos, textFragment.verticalPos, textFragment.widthMeasure, textFragment.heightMeasure, (highlightColor ? highlightColor : "blue"));
	},

	/**
	 * Appends a 'correction' link to a line div, used for indicating segmentation issues.
	 * @param {HTMLElement} targetDivElement - The HTML element for the text line.
	 */
	addCorrectionLink: function(targetDivElement) {
		// Create an anchor element for the correction link.
		var correctionAnchor = new HtmlElement("a", {
			"style": "textColor: red; fontWeight: bold; marginRight: 40px; textDecoration: underline",
			"identifier": targetDivElement.identifier + ":corrector" // Unique ID for the link.
		});

		correctionAnchor.placeContent("!!!"); // Set the text of the link.
		targetDivElement.placeContent(correctionAnchor); // Insert the link into the line div.

		var selfInstance = this; // Reference to 'this' for the event handler.
		correctionAnchor.onEvent("click", function(clickEvent) {
			selfInstance.persistCurrentChanges(); // Save any active edits.
			selfInstance.preventLineInteraction = true; // Lock line clicks during segmentation editing.
			// Initialize a new SegmentEditor for the current line.
			new SegmentEditor(selfInstance.findLineData(targetDivElement.identifier), selfInstance.graphicClient, targetDivElement, selfInstance);
		});
	},

	/**
	 * Appends a 'segmentation' link to a line div, for initiating segmentation editing.
	 * This link is initially hidden and appears on mousemove.
	 * @param {HTMLElement} targetDivElement - The HTML element for the text line.
	 */
	addSegmentLink: function(targetDivElement) {
		// Create an anchor element for the segment link.
		var correctionAnchor = new HtmlElement("a", {
			"style": "float: right; textColor: blue; fontWeight: bold; marginRight: 3px; textDecoration: underline",
			"cssClass": "segment_fixer", // Class for styling and hiding.
			"identifier": targetDivElement.identifier + ":fixer1" // Unique ID for the link.
		});

		correctionAnchor.placeContent("..."); // Set the text of the link.
		targetDivElement.placeContent(correctionAnchor); // Insert the link into the line div.

		var selfInstance = this; // Reference to 'this' for the event handler.
		correctionAnchor.onEvent("click", function(clickEvent) {
			selfInstance.persistCurrentChanges(); // Save any active edits.
			selfInstance.preventLineInteraction = true; // Lock line clicks during segmentation editing.
			// Initialize a new SegmentEditor for the current line.
			new SegmentEditor(selfInstance.findLineData(targetDivElement.identifier), selfInstance.graphicClient, targetDivElement, selfInstance);
		});
		correctionAnchor.conceal(); // Hide the link initially.
	},

	/**
	 * Applies updates to segments (insertions, deletions, resizings, content changes)
	 * within a specified line.
	 * @param {Array} removedElements - List of fragment identifiers to delete.
	 * @param {Array} dimensionAdjustments - List of objects with fragment ID and resize deltas.
	 * @param {Array} newElements - List of new fragment data to insert.
	 * @param {Array} textModifications - List of objects with fragment ID and new content.
	 * @param {HTMLElement} targetLineElement - The HTML element for the affected text line.
	 */
	updateSegments: function(removedElements, dimensionAdjustments, newElements, textModifications, targetLineElement) {
		var selfRef = this; // Reference to 'this'.
		var documentLine = this.findLineData(targetLineElement.identifier); // Get the data object for the line.

		// Process new fragment insertions.
		newElements.forEach(function(newEntry) {
			var fragmentSpans = targetLineElement.childElements(); // Get current fragment spans.
			for (var idx = 0; idx < fragmentSpans.length; ++idx) {
				var currentFragment = selfRef.findFragmentData(fragmentSpans[idx].identifier);
				var nextFragment = (idx == fragmentSpans.length - 1 ? null : selfRef.findFragmentData(fragmentSpans[idx + 1].identifier));

				// Determine the correct insertion point based on horizontal position.
				if ((currentFragment && nextFragment && currentFragment.horizontalPos < newEntry.horizontalPos && nextFragment.horizontalPos > newEntry.horizontalPos) ||
					(currentFragment && !nextFragment && currentFragment.horizontalPos < newEntry.horizontalPos)) {

					// Create a new span for the inserted fragment.
					var newFragmentSpan = new HtmlElement("span", { "identifier": targetLineElement.ancestors()[0].identifier + ":" + targetLineElement.identifier + ":" + newEntry.identifier, "style": "textColor: green" });
					newFragmentSpan.placeContent(newEntry.textContent); // Set its content.
					fragmentSpans[idx].placeContent({ after: newFragmentSpan }); // Insert it after the preceding span.
					newFragmentSpan.placeContent({ before: "&nbsp;" }); // Add a space before it.

					// Update the document data model and reading flow sequence.
					documentLine.textFragments.splice(idx, 0, newEntry);
					selfRef.flowSequence.splice(selfRef.flowSequence.indexOf(fragmentSpans[idx].identifier) + 1, 0, newFragmentSpan.identifier);

					// Attach event listeners for the new span.
					newFragmentSpan.onEvent("click", function(clickEvent) {
						selfRef.modifyFragment(this);
					});
					newFragmentSpan.onEvent("mouseover", function(hoverEvent) {
						this.style.backgroundFill = "#ddf";
						this.style.pointerShape = "pointer";
						selfRef.emphasizeFragment(newEntry);
					});
					newFragmentSpan.onEvent("mouseout", function(leaveEvent) {
						this.style.backgroundFill = "transparent";
					});

					// Record the insertion in the modification log.
					selfRef.recordModificationEntry("add", newFragmentSpan.identifier, "after", fragmentSpans[idx].identifier);
					selfRef.recordModificationEntry("add", newFragmentSpan.identifier, "widthMeasure", newEntry.widthMeasure);
					selfRef.recordModificationEntry("add", newFragmentSpan.identifier, "horizontalPos", newEntry.horizontalPos);
					selfRef.recordModificationEntry("add", newFragmentSpan.identifier, "verticalPos", newEntry.verticalPos);
					selfRef.recordModificationEntry("add", newFragmentSpan.identifier, "heightMeasure", newEntry.heightMeasure);
					selfRef.recordModificationEntry("add", newFragmentSpan.identifier, "textContent", newEntry.textContent);
					break;
				}
			}
		});

		// Process content updates for existing fragments.
		textModifications.forEach(function(contentUpdateItem) {
			// Update the innerHTML of the corresponding span element.
			$(targetLineElement.ancestors()[0].identifier + ":" + targetLineElement.identifier + ":" + contentUpdateItem.identifier).innerHTMLContent = contentUpdateItem.textContent;
			// Record the content change.
			selfRef.recordModificationEntry("change", targetLineElement.ancestors()[0].identifier + ":" + targetLineElement.identifier + ":" + contentUpdateItem.identifier, "textContent", contentUpdateItem.textContent);
		});

		// Process dimension adjustments (resizings).
		dimensionAdjustments.forEach(function(dimensionChange) {
			var fragment = selfRef.findFragmentData(dimensionChange.identifier);
			if (fragment) {
				// Apply the width and horizontal position changes to the fragment data.
				fragment.horizontalPos += dimensionChange.leftOffset;
				fragment.widthMeasure += dimensionChange.widthDelta;
				// Record these changes.
				selfRef.recordModificationEntry("change", dimensionChange.identifier, "widthMeasure", fragment.widthMeasure);
				selfRef.recordModificationEntry("change", dimensionChange.identifier, "horizontalPos", fragment.horizontalPos);
			}
		});

		// Process fragment deletions.
		removedElements.forEach(function(removedId) {
			$(removedId).erase(); // Remove the HTML element.
			// Remove the identifier from the reading flow sequence.
			selfRef.flowSequence.deleteItem(selfRef.flowSequence.indexOf(removedId)); // Assuming Array.prototype.deleteItem is used similarly to Array.prototype.remove in Prototype.js
			// Record the deletion.
			selfRef.recordModificationEntry("change", removedId, "status", "deleted");
		});

		// After updates, re-validate segments for the line.
		if (this.checkFragmentIntegrity(targetLineElement) && $(targetLineElement.identifier + ":corrector"))
			$(targetLineElement.identifier + ":corrector").erase(); // Remove the correction link if segments are now valid.
	},

	/**
	 * Inserts or updates a hidden input field in the submission form,
	 * recording a specific modification.
	 * @param {string} operationType - The type of operation (e.g., "add", "change").
	 * @param {string} targetIdentifier - The ID of the element being modified.
	 * @param {string} attributeKey - The attribute of the element being changed.
	 * @param {*} newValue - The new value for the attribute.
	 */
	recordModificationEntry: function(operationType, targetIdentifier, attributeKey, newValue) {
		// Check if an input field for this specific modification already exists.
		var existingField = $$("#change_submission_form input").find(function(inputElement) {
			return inputElement.getAttribute("inputName") == operationType + "[" + targetIdentifier + "][" + attributeKey + "]";
		});

		if (existingField) {
			existingField.inputValue = newValue; // Update its value if it exists.
		} else {
			// Otherwise, create a new hidden input field.
			$('change_submission_form').placeContent(new HtmlElement("input", {
				"inputName": operationType + "[" + targetIdentifier + "][" + attributeKey + "]",
				"inputValue": newValue,
				"fieldType": "hidden"
			}));
		}
	},

	/**
	 * Validates the segmentation of text fragments within a given line div.
	 * Checks for empty or multi-word fragments.
	 * @param {HTMLElement} currentLineDiv - The HTML element for the line to validate.
	 * @returns {boolean} True if segments are valid, false otherwise.
	 */
	checkFragmentIntegrity: function(currentLineDiv) {
		var fragmentSpans = currentLineDiv.childElements(); // Get all child spans (fragments).
		for (var index = 0; index < fragmentSpans.length; index++) {
			// Check if a span is empty or contains multiple words (separated by space).
			if (fragmentSpans[index].innerHTMLContent == "&nbsp;" || fragmentSpans[index].innerHTMLContent == " " || fragmentSpans[index].innerHTMLContent.match(/[^\s]+\s+[^\s]+/)) {
				return false; // Invalid segmentation found.
			}
		}
		return true; // All segments are valid.
	},

	/**
	 * Saves the currently active text fragment modification, if any.
	 * Updates the display and records changes.
	 * @returns {boolean} True if the save operation completed (or no edit was active).
	 */
	persistCurrentChanges: function() {
		if (this.activeModification) {
			var targetSpan = $(this.activeModification.inputElement.inputName); // Get the original span element.
			var parentLineDiv = this.activeModification.inputElement.ancestors()[0]; // Get the parent line div.

			// Remove event listeners from the input field.
			this.activeModification.inputElement.removeEvent("keypress");

			// If the input is empty, set it to a non-breaking space.
			if (this.activeModification.inputElement.inputValue == "")
				this.activeModification.inputElement.inputValue = "&nbsp;";

			// Check if the content has actually changed.
			if (this.activeModification.inputElement.inputValue != targetSpan.innerHTMLContent) {
				this.changeLog[this.activeModification.inputElement.inputName] = this.activeModification.inputElement.inputValue;
				// Record the content update in the modification log.
				this.recordModificationEntry("change", this.activeModification.inputElement.inputName, "textContent", this.activeModification.inputElement.inputValue);
				targetSpan.style.textColor = "green"; // Indicate change visually.
			}

			targetSpan.innerHTMLContent = this.activeModification.inputElement.inputValue; // Update the span's content.
			targetSpan.reveal(); // Show the original span again.

			// Re-validate the line's segments after the edit.
			if (this.checkFragmentIntegrity(parentLineDiv)) {
				if ($(parentLineDiv.identifier + ":corrector"))
					$(parentLineDiv.identifier + ":corrector").erase(); // Remove correction link if valid.
			} else if (!$(parentLineDiv.identifier + ":corrector"))
				this.addCorrectionLink(parentLineDiv); // Add correction link if invalid.

			// Remove remaining event listeners and the input field itself.
			this.activeModification.inputElement.removeEvent("mouseover");
			this.activeModification.inputElement.removeEvent("keydown");
			this.activeModification.inputElement.erase();
			this.activeModification = null; // Clear the active modification state.
		}
		return true;
	},

	/**
	 * Initiates the editing process for a given text fragment element.
	 * Replaces the fragment with an input field.
	 * @param {HTMLElement} targetElement - The HTML element (span) of the fragment to edit.
	 */
	modifyFragment: function(targetElement) {
		if (this.persistCurrentChanges()) { // Ensure any previous edit is saved.
			// Create a new input field, pre-filled with the fragment's content.
			var editInput = new HtmlElement("input", {
				"fieldType": "text",
				"inputValue": targetElement.innerHTMLContent.replace("&nbsp;", ""),
				"inputName": targetElement.identifier,
				"style": "width: " + (10 * targetElement.innerHTMLContent.length) + "px; textColor: " + targetElement.style.textColor,
				"identifier": targetElement.identifier + "_inputField"
			});

			// Highlight the corresponding fragment on the image in a distinct color.
			this.emphasizeFragment(this.findFragmentData(targetElement.identifier), "#2A2");
			this.activeModification = { "inputElement": editInput }; // Set this as the active modification.

			targetElement.conceal(); // Hide the original fragment span.
			targetElement.placeContent({ after: editInput }); // Insert the input field after it.

			var selfReference = this; // Reference to 'this' for event handlers.
			editInput.onEvent("mouseover", function(mouseEvent) {
				// Highlight the fragment on the image when hovering over the input.
				selfReference.emphasizeFragment(selfReference.findFragmentData(this.inputName));
			});

			editInput.onEvent("keydown", function(keyEvent) {
				var keyCodeVal = keyEvent.keyCode || keyEvent.which; // Get the key code.
				if (keyCodeVal == 9) { // Tab key pressed.
					selfReference.persistCurrentChanges(); // Save current edit.
					if (keyEvent.shiftKey == 1) selfReference.navigateEdit(this.inputName, -1); // Shift+Tab: previous fragment.
					else selfReference.navigateEdit(this.inputName, 1); // Tab: next fragment.
					return keyEvent.preventDefault(); // Prevent default tab behavior.
				} else if (keyCodeVal == 13) { // Enter key pressed.
					selfReference.persistCurrentChanges(); // Save current edit.
					return keyEvent.preventDefault(); // Prevent default form submission.
				} else if (keyCodeVal == 38) { // Up arrow pressed.
					selfReference.navigateUpDown(this.ancestors()[0].identifier, -1); // Move to line above.
					return keyEvent.preventDefault();
				} else if (keyCodeVal == 40) { // Down arrow pressed.
					selfReference.navigateUpDown(this.ancestors()[0].identifier, 1); // Move to line below.
					return keyEvent.preventDefault();
				} else if (keyCodeVal == 39 || keyCodeVal == 37) { // Left/Right arrow pressed.
					var cursorPosition = null;
					if (window.document.selection) { // For IE.
						var range = window.document.selection.createRange();
						range.moveEnd('character', this.inputValue.length);
						cursorPosition = this.inputValue.lastIndexOf(range.text);
					} else
						cursorPosition = this.selectionStartIndex; // For modern browsers.

					if (cursorPosition == 0 && keyCodeVal == 37) { // Left arrow at start of input.
						selfReference.navigateEdit(this.inputName, -1); // Move to previous fragment.
						return keyEvent.preventDefault();
					} else if (cursorPosition == this.inputValue.length && keyCodeVal == 39) { // Right arrow at end of input.
						selfReference.navigateEdit(this.inputName, 1); // Move to next fragment.
						return keyEvent.preventDefault();
					}
				}
			});
			// Set a timeout to ensure the input field is rendered before focusing and selecting its text.
			window.setTimeout("$('" + targetElement.identifier + "_inputField').focus(); $('" + targetElement.identifier + "_inputField').select()", 50);
		}
	},

	/**
	 * Navigates to the previous or next editable text fragment in the reading flow.
	 * @param {string} fragmentIdentifier - The ID of the current fragment.
	 * @param {number} movementDirection - -1 for previous, 1 for next.
	 */
	navigateEdit: function(fragmentIdentifier, movementDirection) {
		var idx = 0;
		// Find the index of the current fragment in the flow sequence.
		for (idx = 0; idx < this.flowSequence.length; ++idx)
			if (this.flowSequence[idx] == fragmentIdentifier)
				break;

		// If a fragment exists in the specified direction.
		if (this.flowSequence[idx + movementDirection]) {
			// Initiate editing for that fragment.
			this.modifyFragment($(this.flowSequence[idx + movementDirection]));
			var modificationDiv = $(this.flowSequence[idx + movementDirection]).ancestors()[0];
			// If the new fragment is in a different line, adjust the image view.
			if ($(fragmentIdentifier).ancestors()[0] != modificationDiv)
				this.zoomToContentLine(this.findLineData(modificationDiv.identifier), null, this.getScrolledLinePosition(modificationDiv));
		}
	},

	/**
	 * Navigates to an editable text fragment in the line above or below the current one.
	 * @param {string} currentDivIdentifier - The ID of the HTML div for the current line.
	 * @param {number} verticalDirection - -1 for up, 1 for down.
	 */
	navigateUpDown: function(currentDivIdentifier, verticalDirection) {
		// Get all line div identifiers in the content display.
		var lineElementIdentifiers = $$("#" + this.contentDisplay.identifier + " div.docLineDisplay").map(function(divElement) {
			return divElement.identifier
		});

		// Find the index of the current line.
		var currentIndex = lineElementIdentifiers.indexOf(currentDivIdentifier);

		// If a line exists in the specified vertical direction.
		if (lineElementIdentifiers[currentIndex + verticalDirection]) {
			var targetEditDiv = $(lineElementIdentifiers[currentIndex + verticalDirection]);
			// Initiate editing for the first fragment in that line.
			this.modifyFragment(targetEditDiv.childElements()[1]);
			// Adjust the image view to center on the new line.
			this.zoomToContentLine(this.findLineData(targetEditDiv.identifier), null, this.getScrolledLinePosition(targetEditDiv));
		}
	}
});