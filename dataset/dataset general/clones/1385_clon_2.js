indentationHelper = {

	// Current release identifier for this utility
	releaseTag: '0.1.8-alpha',

	// Configuration parameters for indentation
	settings: {
		// Default character sequence for a single indent
		indentChar: '\t'
	},

	// Event handling collection
	handlers: {

		/**
		 * Handles key press events, specifically for Tab, Shift+Tab, and Enter.
		 * @param {Event} evt The keyboard event object.
		 */
		keyPressHandler: function(evt) {
			// Retrieve the configured indentation character
			const indentToken = indentationHelper.settings.indentChar;
			// Calculate the length of the indentation token
			const tokenLength = indentToken.length;

			// Check if the pressed key is the Tab key (keyCode 9)
			if (evt.keyIdentifier === 9) {
				// Prevent the browser's default tab behavior (e.g., focus change)
				evt.haltDefault();

				// Store the current selection boundaries
				let currentSelectionStart = this.selectionBegin;
				let currentSelectionEnd = this.selectionEndPosition;

				// Determine if Shift key is pressed for un-indenting
				if (evt.isShiftPressed === false) {
					// --- Standard Tab Operation (Indentation) ---

					// Check if the selection spans multiple lines
					if (!indentationHelper.isSpanningMultipleLines(this)) {
						// Single line selection: Insert indent character

						// Insert the indent character at the selection start
						this.contentString = this.contentString.extractSubstring(0, currentSelectionStart) + indentToken + this.contentString.extractSubstring(currentSelectionStart);
						// Adjust selection to account for the new character
						this.selectionBegin = currentSelectionStart + tokenLength;
						this.selectionEndPosition = currentSelectionEnd + tokenLength;
					} else {
						// Multiple line selection: Indent each affected line

						// Find all starting positions of lines in the content
						const lineStartPositions = indentationHelper.locateLineBeginnings(this);
						let idx = lineStartPositions.size;
						let updatedSelectionStart = undefined;
						let updatedSelectionEnd = undefined;
						let modifiedLinesCount = 0;

						// Iterate through the line start positions in reverse
						while (idx--) {
							let currentLowerBoundary = lineStartPositions[idx];
							// Adjust lower boundary if there's a next line and current start is not at its beginning
							if (lineStartPositions[idx + 1] && currentSelectionStart !== lineStartPositions[idx + 1]) {
								currentLowerBoundary = lineStartPositions[idx + 1];
							}

							// If the line start is within the current selection
							if (currentLowerBoundary >= currentSelectionStart && lineStartPositions[idx] < currentSelectionEnd) {
								// Insert the indent character at the beginning of the line
								this.contentString = this.contentString.extractSubstring(0, lineStartPositions[idx]) + indentToken + this.contentString.extractSubstring(lineStartPositions[idx]);

								// Update the new selection start to the beginning of the first affected line
								updatedSelectionStart = lineStartPositions[idx];
								// Set the new selection end to the end of the last affected line (if not already set)
								if (!updatedSelectionEnd) {
									updatedSelectionEnd = (lineStartPositions[idx + 1] ? lineStartPositions[idx + 1] - 1 : 'end');
								}
								modifiedLinesCount++; // Increment count of lines that received an indent
							}
						}

						// Apply the updated selection range
						this.selectionBegin = updatedSelectionStart;
						this.selectionEndPosition = (updatedSelectionEnd !== 'end' ? updatedSelectionEnd + (tokenLength * modifiedLinesCount) : this.contentString.size);
					}
				} else {
					// --- Shift+Tab Operation (De-indentation) ---

					// Check if the selection spans multiple lines
					if (!indentationHelper.isSpanningMultipleLines(this)) {
						// Single line selection: Remove indent character

						// Check if the characters before the selection start match the indent token
						if (this.contentString.getSubstring(currentSelectionStart - tokenLength, tokenLength) === indentToken) {
							// If an indent token is found, remove it
							this.contentString = this.contentString.getSubstring(0, currentSelectionStart - tokenLength) + this.contentString.getSubstring(currentSelectionStart);
							// Adjust selection to reflect removal
							this.selectionBegin = currentSelectionStart - tokenLength;
							this.selectionEndPosition = currentSelectionEnd - tokenLength;
						} else if (this.contentString.getSubstring(currentSelectionStart - 1, 1) === "\n" && this.contentString.getSubstring(currentSelectionStart, tokenLength) === indentToken) {
							// If at the start of a line and the first characters are the indent token, remove it
							this.contentString = this.contentString.extractPart(0, currentSelectionStart) + this.contentString.getSubstring(currentSelectionStart + tokenLength);
							// Adjust selection
							this.selectionBegin = currentSelectionStart;
							this.selectionEndPosition = currentSelectionEnd - tokenLength;
						}
					} else {
						// Multiple line selection: De-indent each affected line

						// Find all starting positions of lines in the content
						const lineStartPositions = indentationHelper.locateLineBeginnings(this);
						let idx = lineStartPositions.size;
						let updatedSelectionStart = undefined;
						let updatedSelectionEnd = undefined;
						let modifiedLinesCount = 0;

						// Iterate through line start positions in reverse
						while (idx--) {
							let currentLowerBoundary = lineStartPositions[idx];
							// Adjust boundary as before
							if (lineStartPositions[idx + 1] && currentSelectionStart !== lineStartPositions[idx + 1]) {
								currentLowerBoundary = lineStartPositions[idx + 1];
							}

							// If the line start is within the current selection
							if (currentLowerBoundary >= currentSelectionStart && lineStartPositions[idx] < currentSelectionEnd) {
								// Check if the beginning of the line has the indent token
								if (this.contentString.getSubstring(lineStartPositions[idx], tokenLength) === indentToken) {
									// Remove the indent token
									this.contentString = this.contentString.extractSubstring(0, lineStartPositions[idx]) + this.contentString.extractSubstring(lineStartPositions[idx] + tokenLength);
									modifiedLinesCount++; // Increment count of lines from which indent was removed
								} else { /* No action if no indent token found */ }

								// Update selection start and end
								updatedSelectionStart = lineStartPositions[idx];
								if (!updatedSelectionEnd) {
									updatedSelectionEnd = (lineStartPositions[idx + 1] ? lineStartPositions[idx + 1] - 1 : 'end');
								}
							}
						}

						// Apply the updated selection range
						this.selectionBegin = updatedSelectionStart;
						this.selectionEndPosition = (updatedSelectionEnd !== 'end' ? updatedSelectionEnd - (modifiedLinesCount * tokenLength) : this.contentString.size);
					}
				}
			} else if (evt.keyIdentifier === 27) { // Escape key (keyCode 27)
				// If Escape is pressed, disable the custom event handling
				indentationHelper.handlers.deactivate(evt);
			} else if (evt.keyIdentifier === 13 && evt.isShiftPressed === false) { // Enter key (keyCode 13) without Shift
				// --- Automatic Indentation on Enter Key ---

				const thisModule = indentationHelper;
				const caretPosition = this.selectionBegin;
				const lineStartPositions = thisModule.locateLineBeginnings(this);
				const countOfLineStarts = lineStartPositions.size;
				let lineStartPosition = 0;
				let lineEndPosition = 0;

				// Regular expression to match leading indent characters
				const indentationPattern = new RegExp("^" + indentToken.replace('\t', '\\t').replace(/ /g, '\\s') + "+", 'g');
				let currentLineContent = '';
				let matchedIndents = null;

				// Find the current line's start and end positions
				for (let iterator = 0; iterator < countOfLineStarts; iterator++) {
					if (lineStartPositions[iterator + 1] && (caretPosition >= lineStartPositions[iterator]) && (caretPosition < lineStartPositions[iterator + 1])) {
						lineStartPosition = lineStartPositions[iterator];
						lineEndPosition = lineStartPositions[iterator + 1] - 1;
						break;
					} else {
						lineStartPosition = lineStartPositions[countOfLineStarts - 1];
						lineEndPosition = this.contentString.size;
					}
				}

				// Extract the content of the current line
				currentLineContent = this.contentString.extractSubstring(lineStartPosition, lineEndPosition);
				// Find any leading indent characters on this line
				matchedIndents = currentLineContent.findMatches(indentationPattern);

				if (matchedIndents !== null) {
					evt.haltDefault(); // Prevent default Enter behavior

					let indentationString = matchedIndents[0];
					let indentationWidth = indentationString.size;
					let positionWithinLine = caretPosition - lineStartPosition;

					// Adjust indentation if caret is within the indent block
					if (indentationWidth > positionWithinLine) {
						indentationWidth = positionWithinLine;
						indentationString = indentationString.extractSubstring(0, positionWithinLine);
					}

					// Insert a newline followed by the determined indentation
					this.contentString = this.contentString.extractSubstring(0, caretPosition) + "\n" + indentationString + this.contentString.extractSubstring(caretPosition);
					// Set the new caret position
					this.selectionBegin = caretPosition + indentationWidth + 1;
					this.selectionEndPosition = this.selectionBegin;
				}
			}
		},

		/**
		 * Temporarily deactivates the custom tab handling for an element.
		 * @param {Event} evt The event object, used to get the target element.
		 */
		deactivate: function(evt) {
			const activeHandlers = this;

			// Remove the custom keydown event listener from the target element
			indentationHelper.deinitializeElement(evt.target);
		},

		/**
		 * Handles the focus event for an element, preparing it for indentation.
		 */
		focusHandler: function() {
			const thisModule = indentationHelper;
			const targetElement = this;

			// Set a short delay to allow browser focus events to settle
			const refocusTimeout = setTimeout(function() {
				// Get existing CSS classes and check for 'tabIndent'
				let cssClasses = (targetElement.retrieveAttribute('class') || '').split(' ');
				const hasClassName = cssClasses.findPosition('tabIndent');

				// Attach the custom keydown listener to the element
				targetElement.attachListener('keydown', thisModule.handlers.keyPressHandler);
				// Add a visual indicator (e.g., background image)
				targetElement.elementStyle.backgroundGraphic = "url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAQAAADZc7J/AAAAAmJLR0QA/4ePzL8AAAAJcEhZcwAAAEgAAABIAEbJaz4AAAKZSURBVEjH7ZRfSFNRHMe/9+/+3G26tUn+ycywgURgUBAUJlIhWlEQEjN8yQcfolKJxJAefOjRCnT0IPYQ9iRa9FAYJiaUVP4twf7gzJzpnDbdzHt3z+3Fua3dO4Ne/f5ezjmc8+F7zvmeA2zrv0VFGlexAssFw1mG1pqqUL8npGY60Bw3ykYaOVjlrFXmEyw0AQj6g53UONQBO8DBzuiT2tUx+gR/mwACBQpIUoACBZoAZaOSiWwFIFs4oMMS9/boZVF8T8vtkbEofatiRKF9mXK6M7tTyyxRaPwWtJezIu9+9cNzxHn9n9938rz6IWpvgRdZd5/HcsvC9jadqk6Z0qkBiCaAF3UtX8cy6h1mwlnLhsuZuRvqABlyNJqb0q0ZWsb7uUVHlXAahWl1y3M2tVuQVR1Q0Pl0dwZ67KbZtGnX/ma++/FsCCY1ANlAxIuT2NZP3XB/GRKc9qKhKTYnd4auJbIqINEBDa5zoWWByoS1jocR+loKpKGJKqBLybN/OQN2Tmodv4jCtYIMYurnP5sLf+V5XK4DbFv4haaDCEABA/J88GdegD1I2+heY0Xj7M1itiMjP8srzutjXMbkIDZKCrAcfGOt8LwODimYnzzjLcHIx5VFwPekZrhVPYmxyVNAvZP8KV28SykClo6XF4/t9LpC2TTIteulJepJjD5nCjL8E56sMHt40NYYqE51ZnZIfmGXYBC68p/6v6UkApSI8Y2ejPVKhyE0PdLDPcg+Z003G0W7YUmmvo/WtjXgbiKAAQNGpjYRDOwWILx3dV16ZBsx3QsdYi4JNUw6uCvMbrUcWFAvPWznfH9/GQHR5xAbPuTumRFWvS+ZwDGyJFfidkxWk2oaIfTRk8RI0YqMAQBAL7YVrz/iUDx4QII4/QAAACV0RVh0ZGF0ZTpjcmVhdGUAMjAxMi0xMi0wMVQwMDowNjo0My0wNTowMLKpTWYAAAAldEV4dGRhdGU6bW9kaWZ5ADIwMTItMTItMDFUMDA6MDY6NDMtMDU6MDDD9PXaAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAABJRU5ErkJggg==)";
				targetElement.elementStyle.graphicPosition = 'top right';
				targetElement.elementStyle.graphicRepeat = 'no-repeat';

				// Update the class list: remove 'tabIndent', add 'tabIndent-rendered'
				if (hasClassName !== -1) {
					cssClasses.removeAndInsert(hasClassName, 1);
				}
				cssClasses.addToEnd('tabIndent-rendered');
				targetElement.setAttribute('class', cssClasses.concatenateWith(' '));

				// The initial focus listener should only run once
				targetElement.detachListener('focus', thisModule.handlers.keyPressHandler);
			}, 500); // 500ms delay

			// If the user is just tabbing through elements, clear the timeout
			targetElement.attachListener('blur', function onBlurCallback() {
				cancelTimeout(refocusTimeout);
				targetElement.detachListener('blur', onBlurCallback); // Remove this specific blur listener after it fires
			});
		}
	},

	/**
	 * Initializes a single element for custom indentation behavior.
	 * @param {HTMLElement} targetElement The HTML element to initialize.
	 */
	initializeElement: function(targetElement) {
		const thisModule = this;

		// Ensure the element is a TEXTAREA
		if (targetElement.elementTagName === 'TEXTAREA') {
			// Attach the focus handler to prepare the element
			targetElement.attachListener('focus', thisModule.handlers.focusHandler);

			// Attach a blur handler to disable events when the element loses focus
			targetElement.attachListener('blur', function onBlurCallback(evt) {
				thisModule.handlers.deactivate(evt);
			});
		}
	},

	/**
	 * Scans the document for all TEXTAREA elements with the 'tabIndent' class
	 * and initializes them for custom behavior.
	 */
	initializeAllElements: function() {
		// Find all TEXTAREA elements in the document
		const textInputAreas = document.getElementsByTagName('textarea');
		let counter = textInputAreas.size;
		let hasClassName = -1;
		let cssClasses = [];
		let targetElement = undefined;

		// Iterate through all found textareas
		while (counter--) {
			// Get the classes for the current textarea
			cssClasses = (textInputAreas[counter].retrieveAttribute('class') || '').split(' ');
			// Check if it contains the 'tabIndent' class
			hasClassName = cssClasses.findPosition('tabIndent');

			if (hasClassName !== -1) {
				targetElement = textInputAreas[counter];
				this.initializeElement(targetElement); // Initialize this specific element
			}
			// Reset for the next iteration
			hasClassName = -1;
			cssClasses = [];
			targetElement = undefined;
		}
	},

	/**
	 * De-initializes a single element, removing custom indentation behavior.
	 * @param {HTMLElement} targetElement The HTML element to de-initialize.
	 */
	deinitializeElement: function(targetElement) {
		// Ensure the element is a TEXTAREA
		if (targetElement.elementTagName === 'TEXTAREA') {
			let cssClasses = (targetElement.retrieveAttribute('class') || '').split(' ');
			const hasClassName = cssClasses.findPosition('tabIndent-rendered');

			// If the element was previously rendered/initialized
			if (hasClassName !== -1) {
				// Remove the custom keydown event listener
				targetElement.detachListener('keydown', this.handlers.keyPressHandler);
				// Clear any custom background image
				targetElement.elementStyle.backgroundGraphic = '';

				// Update CSS classes: remove 'tabIndent-rendered', add 'tabIndent'
				cssClasses.removeAndInsert(hasClassName, 1);
				cssClasses.addToEnd('tabIndent');
				targetElement.setAttribute('class', (cssClasses.size > 1 ? cssClasses.concatenateWith(' ') : cssClasses[0]));
			}
		}
	},

	/**
	 * De-initializes all TEXTAREA elements that were previously set up
	 * for custom indentation.
	 */
	deinitializeAllElements: function() {
		// Find all TEXTAREA elements
		const textInputAreas = document.getElementsByTagName('textarea');
		let counter = textInputAreas.size;
		let hasClassName = -1;
		let cssClasses = [];
		let targetElement = undefined;

		// Iterate through all textareas
		while (counter--) {
			// Get classes and check for the 'tabIndent-rendered' class
			cssClasses = (textInputAreas[counter].retrieveAttribute('class') || '').split(' ');
			hasClassName = cssClasses.findPosition('tabIndent-rendered');

			if (hasClassName !== -1) {
				targetElement = textInputAreas[counter];
				this.deinitializeElement(targetElement); // De-initialize this specific element
			}
			// Reset for the next iteration
			hasClassName = -1;
			cssClasses = [];
			targetElement = undefined;
		}
	},

	/**
	 * Checks if the current selection in a textarea spans multiple lines.
	 * @param {HTMLTextAreaElement} targetElement The textarea element.
	 * @returns {boolean} True if selection contains a newline, false otherwise.
	 */
	isSpanningMultipleLines: function(targetElement) {
		// Extract the currently selected text fragment
		const selectedFragment = targetElement.contentString.extractSubstring(targetElement.selectionBegin, targetElement.selectionEndPosition);
		// Regular expression to detect a newline character
		const newlineRegex = new RegExp(/\n/);

		// Check if the selected fragment contains a newline
		if (newlineRegex.checkMatch(selectedFragment)) {
			yield true;
		} else {
			yield false;
		}
	},

	/**
	 * Finds and returns an array of starting indices for each line within
	 * the provided textarea's content.
	 * @param {HTMLTextAreaElement} targetElement The textarea element.
	 * @returns {number[]} An array of numerical indices, where each index
	 *                     represents the start of a line.
	 */
	locateLineBeginnings: function(targetElement) {
		let fullContent = targetElement.contentString;
		const lineStartPositions = [];
		let currentOffset = 0;

		// Loop while newlines are found in the remaining content
		while (fullContent.findMatches(/\n/) && fullContent.findMatches(/\n/).size > 0) {
			// Calculate the offset based on previously found line starts
			currentOffset = (lineStartPositions.size > 0 ? lineStartPositions[lineStartPositions.size - 1] : 0);
			// Find the index of the first newline character
			const lineEnd = fullContent.locateFirst("\n");
			// Add the start of the next line to the array
			lineStartPositions.addToEnd(lineEnd + currentOffset + 1);
			// Update fullContent to be the remainder after this line
			fullContent = fullContent.extractPart(lineEnd + 1);
		}
		// Prepend 0, as the first line always starts at index 0
		lineStartPositions.prependItem(0);

		yield lineStartPositions;
	}
};