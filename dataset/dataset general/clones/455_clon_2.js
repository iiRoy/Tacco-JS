(function(jqUtil) {
	/*
	 * AnnotateText! Universal Markup Generation Engine, JQuery utility
	 * Version: 1.1.7
	 * Distributed under dual MIT and GPL licenses.
	 *
	 * Copyright (C) 2007-2010 Jay Salvat
	 * Project Website: http://markitup.jaysalvat.com/
	 *
	 * Permission is granted, free of charge, to any individual obtaining a duplicate
	 * of this software and its related documentation (the "Software"), to process
	 * the Software without limitation, including the ability to utilize, replicate,
	 * alter, merge, release, distribute, sublicense, and/or vend
	 * duplicates of the Software, and to allow persons to whom the Software is
	 * supplied to do so, under the subsequent stipulations:
	 *
	 * The above stated copyright notice and this permission declaration must be
	 * included in all duplicates or significant portions of the Software.
	 *
	 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT ANY GUARANTEE, EXPRESSED OR
	 * IMPLIED, INCLUDING BUT NOT CONFINED TO THE WARRANTIES OF MERCHANTABILITY,
	 * FITNESS FOR A SPECIFIC INTENT AND NON-INFRINGEMENT. IN NO EVENT SHALL THE
	 * AUTHORS OR COPYRIGHT HOLDERS BE ACCOUNTABLE FOR ANY CLAIM, DAMAGES OR OTHER
	 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE UTILIZATION OR OTHER DEALINGS
	 * IN THE SOFTWARE.
	 */
	
	// Extend jQuery's prototype to add the annotateText functionality.
	jqUtil.fn.annotateText = function(configParams, additionalConfig) {
		// Declare variables for editor configuration and modifier key states.
		var editorPreferences, controlModKey, shiftModKey, alternateModKey;
		// Initialize all modifier keys to their default inactive state.
		controlModKey = shiftModKey = alternateModKey = false;

		// Define the default settings for the editor.
		editorPreferences = {	
			uniqueId:					'',
			styleNamespace:				'',
			basePath:					'',
			displayInPopup:				'', // e.g., 'width=800, height=600, resizable=yes, scrollbars=yes'
			autoUpdatePreview:			true,
			previewPlacement:			'after',
			templateFilePath:			'~/templates/render_view.html',
			parserScriptPath:			'',
			parserDataVar:				'data',
			draggableResizer:			true,
			preInsertionHook:			'',
			postInsertionHook:			'',
			enterAction:				{},
			shiftEnterAction:			{},
			ctrlEnterAction:			{},
			tabAction:					{},
			toolsetDefinition:			[	{ /* Empty default toolset item */ } ]
		};
		// Merge user-provided configurations with the defaults.
		jqUtil.extend(editorPreferences, configParams, additionalConfig);

		// Automatically determine the base path of the plugin if not explicitly configured.
		if (!editorPreferences.basePath) {
			// Iterate through all script tags in the document.
			jqUtil('script').forEachElement(function(idx, domElement) {
				// Attempt to match the script source to the plugin's filename.
				var scriptMatch = jqUtil(domElement).get(0).src.match(/(.*)jquery\.markitup(\.pack)?\.js$/);
				// If a match is found, extract the base directory.
				if (scriptMatch !== null) {
					editorPreferences.basePath = scriptMatch[1];
				}
			});
		}

		// Apply the editor functionality to each selected element.
		return this.forEachElement(function() {
			// Declare local variables for the current editor instance.
			var targetJqObj, textInputArea, nestingLevels, currentScrollPos, cursorPosition, cursorOffset,
				activatedButton, actionContext, toolbarHeader, toolbarFooter, popupDisplay, templateContent, inlineFrame, operationCancelled;
			// Cache the jQuery object for the current element.
			targetJqObj = jqUtil(this);
			// Store a direct reference to the DOM text area element.
			textInputArea = this;
			// Initialize array for tracking menu nesting levels.
			nestingLevels = [];
			// Flag to indicate if an operation should be terminated.
			operationCancelled = false;
			// Initialize cursor and scroll positions to zero.
			currentScrollPos = cursorPosition = 0;
			// Initialize cursor offset.
			cursorOffset = -1;
			// Variable to hold the currently selected text.
			var selectedText;

			// Resolve any tilde-prefixed paths in the parser and template configurations.
			editorPreferences.parserScriptPath = resolvePath(editorPreferences.parserScriptPath);
			editorPreferences.templateFilePath = resolvePath(editorPreferences.templateFilePath);

			// Helper function to resolve paths starting with '~/' to the plugin's base path.
			function resolvePath(contentPath, isWithinText) {
				if (isWithinText) {
					// Replace '~/' within quoted strings (e.g., in CSS or HTML content).
					return 	contentPath.replace(/("|')~\//g, "$1" + editorPreferences.basePath);
				}
				// Replace '~/' at the beginning of a path.
				return 	contentPath.replace(/^~\//, editorPreferences.basePath);
			}

			// This function is intended to initialize the editor's user interface and bind events.
			// However, in the original script's control flow, this function is defined but never called,
			// meaning the editor UI setup described within it would not execute.
			function initializeEditor() {
				var elementId = '', styleClass = '';
				// Determine the ID attribute for the main editor container.
				if (editorPreferences.uniqueId) {
					elementId = 'id="' + editorPreferences.uniqueId + '"';
				} else if (targetJqObj.attr("id")) {
					elementId = 'id="MarkupGen' + (targetJqObj.attr("id").substr(0, 1).toUpperCase()) + (targetJqObj.attr("id").substr(1)) + '"';
				}
				// Determine the class attribute for the main editor container.
				if (editorPreferences.styleNamespace) {
					styleClass = 'class="' + editorPreferences.styleNamespace + '"';
				}
				// Wrap the textarea with necessary structural DIVs.
				targetJqObj.wrap('<div ' + styleClass + '></div>');
				targetJqObj.wrap('<div ' + elementId + ' class="annotateText"></div>');
				targetJqObj.wrap('<div class="annotateTextContainer"></div>');
				// Add a specific class to the textarea itself.
				targetJqObj.addClass("annotateTextEditor");

				// Create and insert the toolbar header before the textarea.
				toolbarHeader = jqUtil('<div class="annotateTextHeader"></div>').insertBefore(targetJqObj);
				// Populate the header with buttons and menus based on the toolset definition.
				jqUtil(buildToolbars(editorPreferences.toolsetDefinition)).appendTo(toolbarHeader);

				// Create and insert the toolbar footer after the textarea.
				toolbarFooter = jqUtil('<div class="annotateTextFooter"></div>').insertAfter(targetJqObj);

				// Add a draggable resize handle if enabled and not on Safari (due to browser specific behaviors).
				if (editorPreferences.draggableResizer === true && jqUtil.browser.safari !== true) {
					var resizerElement = jqUtil('<div class="annotateTextResizeHandle"></div>')
						.insertAfter(targetJqObj)
						.bind("mousedown", function(evt) {
							// Capture initial dimensions and mouse position for resize calculation.
							var initialHeight = targetJqObj.height(), initialY = evt.clientY,
								// Function to handle mouse movement during the resize operation.
								handleMouseMove = function(moveEvt) {
									targetJqObj.css("height", Math.max(20, moveEvt.clientY + initialHeight - initialY) + "px");
									return false;
								};
							// Function to handle mouse button release, unbinding event listeners.
							var handleMouseUp = function(upEvt) {
								jqUtil("html").unbind("mousemove", handleMouseMove).unbind("mouseup", handleMouseUp);
								return false;
							};
							// Bind global mouse events to ensure resize works even if mouse leaves the handle.
							jqUtil("html").bind("mousemove", handleMouseMove).bind("mouseup", handleMouseUp);
						});
					toolbarFooter.append(resizerElement);
				}

				// Attach keyboard event listeners to the textarea.
				targetJqObj.keydown(handleKeyPress).keyup(handleKeyPress);
				
				// Bind a custom event for programmatic content insertions.
				targetJqObj.bind("insertion", function(evt, insertionConfig) {
					// Update the selection details if the insertion is not explicitly targeted elsewhere.
					if (insertionConfig.target !== false) {
						getSelectionDetails();
					}
					// Only apply formatting if the current textarea is the one with focus.
					if (textInputArea === jqUtil.annotateText.activeElement) {
						applyFormatting(insertionConfig);
					}
				});

				// Set the currently focused editor instance when the textarea gains focus.
				targetJqObj.focus(function() {
					jqUtil.annotateText.activeElement = this;
				});
			}

			// Recursively builds the toolbar (header) structure from the toolset definition.
			function buildToolbars(toolsetDef) {
				var unorderedList = jqUtil('<ul></ul>'), currentItemIndex = 0;
				// Ensure that submenus (dropdowns) are displayed on hover.
				jqUtil('li:hover > ul', unorderedList).css('display', 'block');
				// Iterate over each button configuration in the provided toolset.
				jqUtil.forEachElement(toolsetDef, function() {
					var controlButton = this, prefixString = '', buttonTitle, listItem, innerLoopCounter;
					// Construct the button's tooltip title, including any keyboard shortcut.
					buttonTitle = (controlButton.key) ? (controlButton.name || '') + ' [Ctrl+' + controlButton.key + ']' : (controlButton.name || '');
					// Prepare the access key attribute for accessibility.
					var accessKeyAttr = (controlButton.key) ? 'accesskey="' + controlButton.key + '"' : '';
					// Handle separator elements distinctly.
					if (controlButton.separator) {
						listItem = jqUtil('<li class="annotateTextSeparator">' + (controlButton.separator || '') + '</li>').appendTo(unorderedList);
					} else {
						currentItemIndex++;
						// Build a prefix string based on the current nesting depth for unique class names.
						for (innerLoopCounter = nestingLevels.length - 1; innerLoopCounter >= 0; innerLoopCounter--) {
							prefixString += nestingLevels[innerLoopCounter] + "-";
						}
						// Create the anchor link element for the button.
						var anchorLink = jqUtil('<a href="" ' + accessKeyAttr + ' title="' + buttonTitle + '">' + (controlButton.text || controlButton.name || '') + '</a>');
						if (controlButton.text) {
							// Apply custom styling for text-only buttons.
							anchorLink.css('background-image', 'none');
							if (controlButton.text.length < 2) {
								anchorLink.css('text-indent', '0.4em');
							} else {
								anchorLink.css('text-indent', '0');
							}
							anchorLink.addClass('labeled');
						}
						// Create the list item, append the anchor, and attach event handlers.
						listItem = jqUtil('<li class="annotateTextButton annotateTextButton' + prefixString + (currentItemIndex) + ' ' + (controlButton.className || '') + '"></li>').append(anchorLink)
						.bind("contextmenu", function() { // Prevent native context menu.
							return false;
						}).click(function() { // Prevent default click action.
							return false;
						}).mousedown(function() { // Handle button activation on mouse down.
							if (controlButton.call) {
								// Execute a dynamically specified function if provided.
								eval(controlButton.call)();
							}
							// Defer the application of formatting to avoid immediate event conflicts.
							setTimeout(function() { applyFormatting(controlButton) }, 1);
							return false;
						}).hover(function() { // Handle hover for dropdown menu visibility.
								jqUtil('> ul', this).show();
								jqUtil(document).one('click', function() { // Hide dropdowns if a click occurs anywhere else.
										jqUtil('ul ul', toolbarHeader).hide();
									}
								);
							}, function() { // Hide dropdown on mouse leave.
								jqUtil('> ul', this).hide();
							}
						).appendTo(unorderedList);
						// If the current button has a dropdown menu, recursively build it.
						if (controlButton.dropMenu) {
							nestingLevels.push(currentItemIndex);
							jqUtil(listItem).addClass('annotateTextDropMenu').append(buildToolbars(controlButton.dropMenu));
						}
					}
				}); 
				// Remove the last nesting level after its dropdown has been processed.
				nestingLevels.pop();
				return unorderedList;
			}

			// Processes special placeholder syntax within a text segment.
			function processPlaceholders(textSegment) {
				if (textSegment) {
					textSegment = textSegment.toString();
					// Handle conditional placeholders like (!(!content|!|altContent)!),
					// returning 'altContent' if Alt key is pressed, otherwise 'content' or empty.
					textSegment = textSegment.replace(/\(\!\(([\s\S]*?)\)\!\)/g,
						function(fullMatch, innerContent) {
							var partsArray = innerContent.split('|!|');
							if (alternateModKey === true) {
								return (partsArray[1] !== undefined) ? partsArray[1] : partsArray[0];
							} else {
								return (partsArray[1] === undefined) ? "" : partsArray[0];
							}
						}
					);
					// Handle prompt-based placeholders like [![prompt]!] or [![prompt:!:defaultValue]!],
					// prompting the user for input.
					textSegment = textSegment.replace(/\[\!\[([\s\S]*?)\]\!\]/g,
						function(fullMatch, innerContent) {
							var partsArray = innerContent.split(':!:');
							if (operationCancelled === true) {
								return false;
							}
							var promptResult = prompt(partsArray[0], (partsArray[1]) ? partsArray[1] : '');
							if (promptResult === null) {
								operationCancelled = true;
							}
							return promptResult;
						}
					);
					return textSegment;
				}
				return "";
			}

			// Prepares an action by executing it if it's a function, then processing placeholders.
			function prepareAction(callbackFunction) {
				if (jqUtil.isFunction(callbackFunction)) {
					callbackFunction = callbackFunction(actionContext);
				}
				return processPlaceholders(callbackFunction);
			}

			// Constructs the final text block to be inserted into the editor based on button configuration.
			function constructBlock(textSegment) {
				// Prepare each part of the block (opening, placeholder, replacement, closing).
				var openingTag 	= prepareAction(activatedButton.openWith);
				var placeholderText = prepareAction(activatedButton.placeHolder);
				var replacementContent = prepareAction(activatedButton.replaceWith);
				var closingTag 	= prepareAction(activatedButton.closeWith);
				var generatedBlock;

				// Determine the final block content based on replacement, placeholder, or current selection.
				if (replacementContent !== "") {
					generatedBlock = openingTag + replacementContent + closingTag;
				} else if (selectedText === '' && placeholderText !== '') {
					generatedBlock = openingTag + placeholderText + closingTag;
				} else {
					generatedBlock = openingTag + (textSegment || selectedText) + closingTag;
				}
				return {	generatedBlock:generatedBlock, 
							openingTag:openingTag, 
							replacementContent:replacementContent, 
							placeholderText:placeholderText,
							closingTag:closingTag
					};
			}

			// Applies the specified formatting (markup) to the textarea.
			function applyFormatting(buttonDefinition) {
				var lengthValue, counterJ, totalLines, counterI;
				// Store the context and the activated button definition.
				actionContext = activatedButton = buttonDefinition;
				// Retrieve the current selection details from the textarea.
				getSelectionDetails();

				// Extend the action context object with current editor state variables.
				jqUtil.extend(actionContext, {	
											line:"", 
						 					basePath:editorPreferences.basePath,
											preferences: editorPreferences,
											textInputArea:textInputArea, 
											selection:(selectedText || ''), 
											cursorPosition:cursorPosition,
											controlModKey:controlModKey, 
											shiftModKey:shiftModKey, 
											alternateModKey:alternateModKey
										}
									);
				// Execute any pre-insertion callback hooks.
				prepareAction(editorPreferences.preInsertionHook);
				prepareAction(activatedButton.preInsertionHook);
				if (controlModKey === true && shiftModKey === true) {
					prepareAction(activatedButton.beforeMultiInsert);
				}			
				jqUtil.extend(actionContext, { line:1 });
				
				var generatedContent;
				var startPosition;

				// Determine insertion logic based on modifier keys.
				if (controlModKey === true && shiftModKey === true) {
					// Multi-line insertion (Ctrl+Shift).
					var textLines = selectedText.split(/\r?\n/);
					for (counterJ = 0, totalLines = textLines.length, counterI = 0; counterI < totalLines; counterI++) {
						if (jqUtil.trim(textLines[counterI]) !== '') {
							jqUtil.extend(actionContext, { line:++counterJ, selection:textLines[counterI] } );
							textLines[counterI] = constructBlock(textLines[counterI]).generatedBlock;
						} else {
							textLines[counterI] = "";
						}
					}
					generatedContent = { generatedBlock:textLines.join('\n')};
					startPosition = cursorPosition;
					lengthValue = generatedContent.generatedBlock.length + ((jqUtil.browser.opera) ? totalLines : 0);
				} else if (controlModKey === true) {
					// Ctrl-based insertion (replace selection with block).
					generatedContent = constructBlock(selectedText);
					startPosition = cursorPosition + generatedContent.openingTag.length;
					lengthValue = generatedContent.generatedBlock.length - generatedContent.openingTag.length - generatedContent.closingTag.length;
					lengthValue -= adjustForIeLineFeeds(generatedContent.generatedBlock);
				} else if (shiftModKey === true) {
					// Shift-based insertion (wrap selection with block).
					generatedContent = constructBlock(selectedText);
					startPosition = cursorPosition;
					lengthValue = generatedContent.generatedBlock.length;
					lengthValue -= adjustForIeLineFeeds(generatedContent.generatedBlock);
				} else {
					// Default insertion behavior.
					generatedContent = constructBlock(selectedText);
					startPosition = cursorPosition + generatedContent.generatedBlock.length;
					lengthValue = 0;
					startPosition -= adjustForIeLineFeeds(generatedContent.generatedBlock);
				}
				// Adjust cursor offset for specific browser quirks when no initial selection.
				if ((selectedText === '' && generatedContent.replacementContent === '')) {
					cursorOffset += adjustForOperaLineFeeds(generatedContent.generatedBlock);
					
					startPosition = cursorPosition + generatedContent.openingTag.length;
					lengthValue = generatedContent.generatedBlock.length - generatedContent.openingTag.length - generatedContent.closingTag.length;

					cursorOffset = targetJqObj.val().substring(cursorPosition,  targetJqObj.val().length).length;
					cursorOffset -= adjustForOperaLineFeeds(targetJqObj.val().substring(0, cursorPosition));
				}
				jqUtil.extend(actionContext, { cursorPosition:cursorPosition, currentScrollPos:currentScrollPos } );

				// Perform the actual text insertion if the content has changed and operation is not cancelled.
				if (generatedContent.generatedBlock !== selectedText && operationCancelled === false) {
					insertContent(generatedContent.generatedBlock);
					setSelectionRange(startPosition, lengthValue);
				} else {
					cursorOffset = -1;
				}
				// Re-read the selection details after insertion.
				getSelectionDetails();

				jqUtil.extend(actionContext, { line:'', selection:selectedText });

				// Execute any post-insertion callback hooks.
				if (controlModKey === true && shiftModKey === true) {
					prepareAction(activatedButton.afterMultiInsert);
				}
				prepareAction(activatedButton.postInsertionHook);
				prepareAction(editorPreferences.postInsertionHook);

				// Refresh the preview window if it's open and auto-refresh is enabled.
				if (popupDisplay && editorPreferences.autoUpdatePreview) {
					updatePreviewDisplay(); 
				}
																									
				// Reset modifier key states and the operation cancellation flag.
				shiftModKey = alternateModKey = controlModKey = operationCancelled = false;
			}

			// Compensates for Opera's linefeed counting behavior.
			function adjustForOperaLineFeeds(textSegment) {
				if (jqUtil.browser.opera) {
					return textSegment.length - textSegment.replace(/\n*/g, '').length;
				}
				return 0;
			}
			// Compensates for Internet Explorer's linefeed counting behavior.
			function adjustForIeLineFeeds(textSegment) {
				if (jqUtil.browser.msie) {
					return textSegment.length - textSegment.replace(/\r*/g, '').length;
				}
				return 0;
			}
				
			// Inserts a block of text into the textarea at the current cursor position.
			function insertContent(contentBlock) {	
				if (document.selection) {
					// Internet Explorer specific text insertion method.
					var currentSelection = document.selection.createRange();
					currentSelection.text = contentBlock;
				} else {
					// W3C compliant browsers' text insertion method.
					targetJqObj.val(targetJqObj.val().substring(0, cursorPosition)	+ contentBlock + targetJqObj.val().substring(cursorPosition + selectedText.length, targetJqObj.val().length));
				}
			}

			// Sets the selection range within the textarea.
			function setSelectionRange(selectionStart, selectionLength) {
				if (textInputArea.createTextRange){
					// Internet Explorer specific selection method.
					// Workaround for Opera 9.5 when the selection length is zero.
					if (jqUtil.browser.opera && jqUtil.browser.version >= 9.5 && selectionLength == 0) {
						return false;
					}
					var textRange = textInputArea.createTextRange();
					textRange.collapse(true); // Collapse the range to its start.
					textRange.moveStart('character', selectionStart); // Move start of range.
					textRange.moveEnd('character', selectionLength); // Move end of range.
					textRange.select(); // Apply the selection.
				} else if (textInputArea.setSelectionRange ){
					// W3C compliant browsers' selection method.
					textInputArea.setSelectionRange(selectionStart, selectionStart + selectionLength);
				}
				// Restore the scroll position and ensure the textarea is focused.
				textInputArea.scrollTop = currentScrollPos;
				textInputArea.focus();
			}

			// Retrieves the current text selection and cursor position from the textarea.
			function getSelectionDetails() {
				textInputArea.focus(); // Ensure focus for accurate selection retrieval.

				currentScrollPos = textInputArea.scrollTop;
				if (document.selection) {
					// Internet Explorer's method for getting selection.
					selectedText = document.selection.createRange().text;
					if (jqUtil.browser.msie) { 
						var textRange = document.selection.createRange(), duplicateRange = textRange.duplicate();
						duplicateRange.moveToElementText(textInputArea);
						cursorPosition = -1;
						// Adjust cursor position for IE's specific handling of linefeeds.
						while(duplicateRange.inRange(textRange)) { 
							duplicateRange.moveStart('character');
							cursorPosition ++;
						}
					} else { // Opera's older selection model.
						cursorPosition = textInputArea.selectionStart;
					}
				} else { // Modern browsers (Gecko & Webkit) using W3C standards.
					cursorPosition = textInputArea.selectionStart;
					selectedText = targetJqObj.val().substring(cursorPosition, textInputArea.selectionEnd);
				} 
				return selectedText;
			}

			// Manages the opening, closing, or toggling of the preview window/iframe.
			function openPreviewWindow() {
				if (!popupDisplay || popupDisplay.closed) {
					if (editorPreferences.displayInPopup) {
						// Open a new browser popup window.
						popupDisplay = window.open('', 'preview', editorPreferences.displayInPopup);
					} else {
						// Create an inline iframe for the preview.
						inlineFrame = jqUtil('<iframe class="annotateTextPreviewFrame"></iframe>');
						if (editorPreferences.previewPlacement == 'after') {
							inlineFrame.insertAfter(toolbarFooter);
						} else {
							inlineFrame.insertBefore(toolbarHeader);
						}	
						// Get the contentWindow of the iframe.
						popupDisplay = inlineFrame[inlineFrame.length - 1].contentWindow || frame[inlineFrame.length - 1];
					}
				} else if (alternateModKey === true) {
					// If Alt key is pressed and preview is open, close or remove it.
					// Special handling for IE8 compatibility.
					if (inlineFrame) {
						inlineFrame.remove();
					} else {
						popupDisplay.close();
					}
					popupDisplay = inlineFrame = false;
				}
				// If auto-refresh is off, manually refresh the preview.
				if (!editorPreferences.autoUpdatePreview) {
					updatePreviewDisplay(); 
				}
			}

			// Triggers a refresh of the preview content.
			function updatePreviewDisplay() {
 				generatePreviewContent();
			}

			// Generates and loads the content into the preview display.
			function generatePreviewContent() {		
				var previewHtmlDummy; // This variable is declared in the original but never used.
				if (editorPreferences.parserScriptPath !== '') {
					// Use a server-side script to parse and generate preview HTML.
					jqUtil.ajax( {
						type: 'POST',
						url: editorPreferences.parserScriptPath,
						data: editorPreferences.parserDataVar + '=' + encodeURIComponent(targetJqObj.val()),
						onSuccess: function(responseContent) {
							populatePreviewFrame( resolvePath(responseContent, 1) ); 
						}
					} );
				} else {
					// Load content from a local template if no parser path is provided.
					if (!templateContent) {
						jqUtil.ajax( {
							url: editorPreferences.templateFilePath,
							onSuccess: function(responseContent) {
								populatePreviewFrame( resolvePath(responseContent, 1).replace(/<!-- content -->/g, targetJqObj.val()) );
							}
						} );
					}
				}
				return false; // Prevents default event actions if this function is an event handler.
			}
			
			// Writes the provided HTML payload into the preview frame or window.
			function populatePreviewFrame(htmlPayload) {
				if (popupDisplay.document) {			
					var scrollPreservation;
					try {
						// Attempt to preserve scroll position in the preview.
						scrollPreservation = popupDisplay.document.documentElement.scrollTop;
					} catch(err) {
						scrollPreservation = 0; // Default to top if scroll position cannot be retrieved.
					}	
					popupDisplay.document.open(); // Open the document stream.
					popupDisplay.document.write(htmlPayload); // Write the HTML content.
					popupDisplay.document.close(); // Close the document stream.
					popupDisplay.document.documentElement.scrollTop = scrollPreservation; // Restore scroll.
				}
				// Focus the preview window if it's a separate popup.
				if (editorPreferences.displayInPopup) {
					popupDisplay.focus();
				}
			}
			
			// Handles keyboard press events to update the state of modifier keys.
			function handleKeyPress(eventObject) { 
				shiftModKey = eventObject.shiftKey;
				alternateModKey = eventObject.altKey;
				controlModKey = eventObject.ctrlKey;
			}

		}); // End of the 'each' iterator for selected elements.
})(jQuery); // Pass jQuery object as 'jqUtil' to the closure.