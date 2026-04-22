/*
 * JQuery Console 1.0 (Clone)
 * Date: Sunday, February 21, 2010 20:28:47 GMT
 *
 * Copyright (c) 2010 Chris Done, Simon David Pratt. All rights reserved.
 *
 * This software is licensed under the following BSD-style license:
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions
 * are met:
 *
 *    1. Redistributions of source code must retain the above
 *       copyright notice, this list of conditions and the following
 *       disclaimer.
 *
 *    2. Redistributions in binary form must reproduce the above
 *       copyright notice, this list of conditions and the following
 *       disclaimer in the documentation and/or other materials
 *       provided with the distribution.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS
 * FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE
 * COPYRIGHT HOLDERS OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT,
 * INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING,
 * BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT
 * LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN
 * ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 * POSSIBILITY OF SUCH DAMAGE.
 */

/*
 * This version of the console has been tested on various browsers:
 * - Internet Explorer 6
 * - Opera 10.01
 * - Chromium 4.0.237.0 (Ubuntu build 31094)
 * - Firefox 3.5.8, 3.6.2 (Mac)
 * - Safari 4.0.5 (6531.22.7) (Mac)
 * - Google Chrome 5.0.375.55 (Mac)
 */

( function( $ ) {

	// Check if the browser is Webkit-based.
	var isWebkit = !!~navigator.userAgent.indexOf( ' AppleWebKit/' );


	$.fn.console = function( config ) {

		// All constants used throughout the console
		// Some are enumerations, others are just for performance optimization.
		var keyCodes = {
			// Left arrow key
			37: moveBackward,
			// Right arrow key
			39: moveForward,
			// Up arrow key
			38: previousHistory,
			// Down arrow key
			40: nextHistory,
			// Backspace key
			8: backDelete,
			// Delete key
			46: forwardDelete,
			// End key
			35: moveToEnd,
			// Home/Start key
			36: moveToStart,
			// Enter/Return key
			13: commandTrigger,
			// Tab key (alternative)
			18: doNothing,
			// Tab key
			9: doComplete
		};


		var ctrlCodes = {
			// Ctrl-A: Move cursor to the beginning of the line
			65: moveToStart,
			// Ctrl-E: Move cursor to the end of the line
			69: moveToEnd,
			// Ctrl-D: Delete character under cursor
			68: forwardDelete,
			// Ctrl-N: Next history entry
			78: nextHistory,
			// Ctrl-P: Previous history entry
			80: previousHistory,
			// Ctrl-B: Move cursor backward
			66: moveBackward,
			// Ctrl-F: Move cursor forward
			70: moveForward,
			// Ctrl-K: Delete from cursor to end of line
			75: deleteUntilEnd
		};


		var altCodes = {
			// Alt-F: Move cursor to the next word
			70: moveToNextWord,
			// Alt-B: Move cursor to the previous word
			66: moveToPreviousWord,
			// Alt-D: Delete the next word
			68: deleteNextWord
		};

		// HTML string for the cursor element
		var cursor = '<span class="jquery-console-cursor">&nbsp;</span>';


		// Global variables for the console state and elements
		var container = $( this );
		var inner = $( '<div class="jquery-console-inner"></div>' );

		// The typer element, changed from text input to textarea to handle pasted newlines
		var typer = $( '<textarea class="jquery-console-typer"></textarea>' );

		// The prompt box element
		var promptBox;

		// The prompt span element
		var prompt;

		// The label for the prompt, configurable
		var promptLabel = config && config.promptLabel ? config.promptLabel : "> ";

		// The label for continued prompts, configurable
		var continuedPromptLabel = config && config.continuedPromptLabel ?
		                           config.continuedPromptLabel : "> ";

		// Current column position of the cursor
		var column = 0;

		// The text currently in the prompt
		var promptText = '';

		// Text to restore after history navigation
		var restoreText = '';

		// Text for continued commands across multiple lines
		var continuedText = '';

		// Array to store command history
		var history = [];

		// Index into the history ring buffer
		var ringn = 0;

		// Flag to cancel keypress events after keydown has handled a special key.
		// This is a workaround for inconsistent browser behavior (e.g., Opera).
		var cancelKeyPress = 0;

		// Flag indicating if the prompt is currently accepting user input
		var acceptInput = true;

		// Flag indicating if the current command has been cancelled (e.g., by Ctrl+C)
		var cancelCommand = false;

		// Object for exposing internal functions externally
		var extern = {};


		// Main initialization function, executed immediately
		( function() {

			container.append( inner );
			inner.append( typer );

			// Position the typer off-screen
			typer.css( { position: 'absolute', top: 0, left: '-9999px' } );

			// Display a welcome message if configured
			if ( config.welcomeMessage ) {
				message( config.welcomeMessage, 'jquery-console-welcome' );
			}

			// Create the initial prompt box
			newPromptBox();

			// Set focus if autofocus is enabled
			if ( config.autofocus ) {
				inner.addClass( 'jquery-console-focus' );
				typer.focus();

				// A small delay for consistent focus behavior across browsers
				setTimeout( function() {
					inner.addClass( 'jquery-console-focus' );
					typer.focus();
				}, 100 );
			}

			// Export key internal elements for external access
			extern.inner = inner;
			extern.typer = typer;
			extern.scrollToBottom = scrollToBottom;

		} )();


		// Resets the terminal, clearing all previous output.
		extern.reset = function() {
			var welcome = ( typeof config.welcomeMessage != 'undefined' );

			inner.parent().fadeOut( function() {
				inner.find( 'div' ).each( function() {

					if ( !welcome ) {
						$( this ).remove();
					} else {
						welcome = false; // Only skip the first message if it's the welcome message
					}

				} );

				newPromptBox();

				inner.parent().fadeIn( function() {
					inner.addClass( 'jquery-console-focus' );
					typer.focus();
				} );
			} );
		};


		// Displays a notice message.
		extern.notice = function( msg, style ) {

			var n = $( '<div class="notice"></div>' )
				.append( $( '<div></div>' ).text( msg ) )
				.css( { visibility: 'hidden' } );

			container.append( n );

			var focused = true;

			// Handle different notice styles
			if ( style == 'fadeout' ) {
				setTimeout( function() {
					n.fadeOut( function() {
						n.remove();
					} );
				}, 4000 );
			} else if ( style == 'prompt' ) {
				var a = $( '<br/><div class="action"><a href="javascript:">OK</a><div class="clear"></div></div>' );
				n.append( a );
				focused = false;
				a.click( function() {
					n.fadeOut( function() {
						n.remove();
						inner.css( { opacity: 1 } );
					} );
				} );
			}

			var h = n.height();

			n.css( { height: '0px', visibility: 'visible' } )
				.animate( { height: h + 'px' }, function() {
					if ( !focused ) {
						inner.css( { opacity: 0.5 } );
					}
				} );
			n.css( 'cursor', 'default' );

			return n;
		};


		// Creates and appends a new prompt box to the console.
		function newPromptBox() {
			column = 0; // Reset cursor column
			promptText = ''; // Clear current prompt text
			ringn = 0; // Reset history position

			enableInput(); // Ensure input is enabled for the new prompt

			promptBox = $( '<div class="jquery-console-prompt-box"></div>' );
			var label = $( '<span class="jquery-console-prompt-label"></span>' );

			// Determine which prompt label to use (normal or continued)
			var labelText = extern.continuedPrompt ? continuedPromptLabel : promptLabel;

			promptBox.append( label.text( labelText ).show() );

			// Replace spaces with non-breaking spaces for proper rendering
			label.html( label.html().replace( ' ', '&nbsp;' ) );

			prompt = $( '<span class="jquery-console-prompt"></span>' );
			promptBox.append( prompt );
			inner.append( promptBox );

			updatePromptDisplay(); // Update the visual display of the prompt
		}


		// Handles click events on the console container to set focus.
		container.click( function() {
			inner.addClass( 'jquery-console-focus' );
			inner.removeClass( 'jquery-console-nofocus' );

			// Special handling for Webkit browsers for focus without scrolling
			if ( isWebkit ) {
				typer.focusWithoutScrolling();
			} else {
				// For other browsers, use fixed position to prevent scroll
				typer.css( 'position', 'fixed' ).focus();
			}

			scrollToBottom(); // Scroll to the end of the console

			return false; // Prevent default click behavior
		} );


		// Handles blur events on the typer element to indicate loss of focus.
		typer.blur( function() {
			inner.removeClass( 'jquery-console-focus' );
			inner.addClass( 'jquery-console-nofocus' );
		} );


		// Binds to the 'paste' event of the typer to handle pasted text.
		typer.bind( 'paste', function( e ) {
			// Clear the typer's value temporarily to ensure only pasted content is processed.
			typer.val( "" );

			// Use a timeout because the 'paste' event fires *before* the text is actually
			// inserted into the input field.
			setTimeout( function() {
				// Insert the pasted content into the console's prompt.
				typer.consoleInsert( typer.val() );
				// Clear the typer again after processing.
				typer.val( "" );
			}, 0 );
		} );


		// Handles keydown events for special keys and control sequences.
		typer.keydown( function( e ) {
			cancelKeyPress = 0; // Reset cancellation flag
			var keyCode = e.keyCode;

			// Ctrl-C: Cancel current command execution
			if ( e.ctrlKey && keyCode == 67 ) {
				cancelKeyPress = keyCode; // Mark keypress as handled
				cancelExecution();
				return false; // Prevent default action
			}

			if ( acceptInput ) {
				// Handle standard key codes (arrows, backspace, delete, etc.)
				if ( keyCode in keyCodes ) {
					cancelKeyPress = keyCode;
					( keyCodes[keyCode] )();
					return false;
				}
				// Handle Ctrl-key combinations
				else if ( e.ctrlKey && keyCode in ctrlCodes ) {
					cancelKeyPress = keyCode;
					( ctrlCodes[keyCode] )();
					return false;
				}
				// Handle Alt-key combinations
				else if ( e.altKey && keyCode in altCodes ) {
					cancelKeyPress = keyCode;
					( altCodes[keyCode] )();
					return false;
				}
			}
		} );


		// Handles keypress events for character input.
		typer.keypress( function( e ) {
			var keyCode = e.keyCode || e.which;

			if ( isIgnorableKey( e ) ) {
				return false; // Ignore certain key combinations
			}

			// Ctrl-V (or Cmd-V on Mac): Allow paste to proceed normally
			if ( ( e.ctrlKey || e.metaKey ) && String.fromCharCode( keyCode ).toLowerCase() == 'v' ) {
				return true;
			}

			// Only process input if allowed, and if keydown didn't already handle it
			if ( acceptInput && cancelKeyPress != keyCode && keyCode >= 32 ) {
				if ( cancelKeyPress ) {
					return false; // Key already handled by keydown
				}

				// Check if character insertion is allowed by a custom trigger function
				if (
					typeof config.charInsertTrigger == 'undefined' || (
						typeof config.charInsertTrigger == 'function' &&
						config.charInsertTrigger( keyCode, promptText )
					)
				) {
					typer.consoleInsert( keyCode ); // Insert the character
				}
			}

			// For Webkit, prevent default keypress behavior to avoid double input
			if ( isWebkit ) {
				return false;
			}
		} );


		// Determines if a key event should be ignored.
		function isIgnorableKey( e ) {
			// Currently, it filters Alt+Tab and Alt+` (backtick) which can occur
			// when switching windows, to prevent unwanted input.
			return ( ( e.keyCode == keyCodes.tab || e.keyCode == 192 ) && e.altKey );
		}


		// Rotates through the command history.
		function rotateHistory( n ) {
			if ( history.length == 0 ) {
				return; // No history to rotate
			}

			ringn += n; // Adjust history index

			// Wrap around the history array
			if ( ringn < 0 ) {
				ringn = history.length;
			} else if ( ringn > history.length ) {
				ringn = 0;
			}

			var prevText = promptText; // Store current text before history change

			if ( ringn == 0 ) {
				promptText = restoreText; // Restore original text if at the end of history
			} else {
				promptText = history[ringn - 1]; // Load history entry
			}

			// Adjust cursor column based on configuration
			if ( config.historyPreserveColumn ) {
				if ( promptText.length < column + 1 ) {
					column = promptText.length;
				} else if ( column == 0 ) {
					column = promptText.length;
				}
			} else {
				column = promptText.length; // Default: move cursor to end of line
			}

			updatePromptDisplay(); // Refresh the prompt display
		}


		// Move to the previous command in history.
		function previousHistory() {
			rotateHistory( -1 );
		}


		// Move to the next command in history.
		function nextHistory() {
			rotateHistory( 1 );
		}


		// Adds a line to the command history.
		function addToHistory( line ) {
			history.push( line ); // Add the line to the history array
			restoreText = ''; // Clear the restore text
		}


		// Deletes the character at the current cursor position.
		function deleteCharAtPos() {
			if ( column < promptText.length ) {
				promptText =
					promptText.substring( 0, column ) + // Part before cursor
					promptText.substring( column + 1 ); // Part after cursor
				restoreText = promptText; // Update restore text
				return true;
			} else {
				return false; // Nothing to delete
			}
		}


		// Handles backspace key: moves cursor back and deletes character.
		function backDelete() {
			if ( moveColumn( -1 ) ) { // Try to move cursor back
				deleteCharAtPos(); // Delete character at new position
				updatePromptDisplay(); // Update display
			}
		}


		// Handles delete key: deletes character under cursor.
		function forwardDelete() {
			if ( deleteCharAtPos() ) { // Delete character at current position
				updatePromptDisplay(); // Update display
			}
		}


		// Deletes all characters from the current cursor position to the end of the line.
		function deleteUntilEnd() {
			while ( deleteCharAtPos() ) { // Keep deleting until no more characters
				updatePromptDisplay(); // Update display after each deletion
			}
		}


		// Deletes the next word from the current cursor position.
		function deleteNextWord() {
			// A word is defined here as a sequence of alphanumeric characters.

			// First, skip and delete any non-alphanumeric characters until an alphanumeric one is found.
			while (
				column < promptText.length &&
				!isCharAlphanumeric( promptText[column] )
			) {
				deleteCharAtPos();
				updatePromptDisplay();
			}

			// Then, delete all alphanumeric characters until a non-alphanumeric one is found.
			while (
				column < promptText.length &&
				isCharAlphanumeric( promptText[column] )
			) {
				deleteCharAtPos();
				updatePromptDisplay();
			}
		}


		// Validates the command and triggers its execution or displays an error.
		function commandTrigger() {
			var line = promptText;

			if ( typeof config.commandValidate == 'function' ) {
				var ret = config.commandValidate( line );

				if ( ret == true || ret == false ) {
					if ( ret ) {
						handleCommand(); // Command is valid, proceed
					}
					// If 'ret' is false, it implies validation failed without a specific message
					// No action needed, input remains for correction
				} else {
					// Validation returned a string (error message)
					commandResult( ret, "jquery-console-message-error" );
				}
			} else {
				handleCommand(); // No validation function, always proceed
			}
		}


		// Scrolls the console output to the bottom.
		function scrollToBottom() {
			// Different property names for scrollTop in jQuery versions
			if ( jQuery.fn.jquery > "1.6" ) {
				inner.prop( { scrollTop: inner.prop( "scrollHeight" ) } );
			} else {
				inner.attr( { scrollTop: inner.attr( "scrollHeight" ) } );
			}
		}


		// Cancels the currently executing command, if a handler is provided.
		function cancelExecution() {
			if ( typeof config.cancelHandle == 'function' ) {
				config.cancelHandle();
			}
		}


		// Handles the execution of a command.
		function handleCommand() {
			if ( typeof config.commandHandle == 'function' ) {
				disableInput(); // Disable input while command is processing
				addToHistory( promptText ); // Add current command to history

				var text = promptText;
				// If a continued prompt is active, append current text
				if ( extern.continuedPrompt ) {
					if ( continuedText ) {
						continuedText += '\n' + promptText;
					} else {
						continuedText = promptText;
					}
				} else {
					continuedText = undefined; // Reset if not continued
				}

				if ( continuedText ) {
					text = continuedText; // Use combined text for continued commands
				}

				// Execute the command handler
				var ret = config.commandHandle( text, function( msgs ) {
					commandResult( msgs ); // Callback for command result
				} );

				// If it's a continued prompt and continuedText was just started
				if ( extern.continuedPrompt && !continuedText ) {
					continuedText = promptText;
				}

				// Handle synchronous return values from commandHandle
				if ( typeof ret == 'boolean' ) {
					if ( ret ) {
						commandResult(); // Command succeeded without explicit message
					} else {
						commandResult(
							'Command failed.',
							"jquery-console-message-error"
						);
					}
				} else if ( typeof ret == "string" ) {
					commandResult( ret, "jquery-console-message-success" );
				} else if ( typeof ret == 'object' && ret.length ) {
					commandResult( ret ); // Array of messages
				} else if ( extern.continuedPrompt ) {
					commandResult(); // For async continued prompts, just reset
				}
			}
		}


		// Disables input to the console.
		function disableInput() {
			acceptInput = false;
		}


		// Enables input to the console.
		function enableInput() {
			acceptInput = true;
		}


		// Displays the result of a command and resets the prompt.
		function commandResult( msg, className ) {
			column = -1; // Reset column to trigger full prompt redraw
			updatePromptDisplay(); // Update prompt display

			if ( typeof msg == 'string' ) {
				message( msg, className ); // Display single string message
			} else if ( $.isArray( msg ) ) {
				for ( var x in msg ) {
					// The loop continues in the next part of the original code.
					// This ensures the clone is identical up to this point.