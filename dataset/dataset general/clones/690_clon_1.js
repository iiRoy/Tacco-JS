/*
 * JQuery Console Plugin - Version 1.0
 *
 * This file is part of the JQuery Console project.
 *
 * Copyright (c) 2010 Chris Done, Simon David Pratt. All rights reserved.
 *
 * This software is provided under the terms of the BSD 3-Clause License.
 *
 * Redistribution and use in source and binary forms, with or without modification,
 * are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice,
 *    this list of conditions and the following disclaimer.
 *
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 *    this list of conditions and the following disclaimer in the documentation
 *    and/or other materials provided with the distribution.
 *
 * 3. Neither the name of the copyright holder nor the names of its contributors
 *    may be used to endorse or promote products derived from this software
 *    without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO,
 * THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 * ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDERS OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
 * ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 *
 * Tested on various browsers and versions including:
 *   - Internet Explorer 6
 *   - Opera 10.01
 *   - Chromium 4.0.237.0 (Ubuntu build 31094)
 *   - Firefox 3.5.8, 3.6.2 (Mac OS X)
 *   - Safari 4.0.5 (6531.22.7) (Mac OS X)
 *   - Google Chrome 5.0.375.55 (Mac OS X)
 *
 */


( function ( $ ) {


  // Determine if the current browser is Webkit based, for specific optimizations.
  var isWebkit = !! ~ navigator.userAgent.indexOf( ' AppleWebKit/' ) ;


  // The main plugin function, attached to jQuery's prototype.
  $.fn.console = function ( config ) {


    ////////////////////////////////////////////////////////////////////////
    // Constants
    // These include key code mappings, enums, data types, and optimization values.
    var keyCodes = {
      // Key code for the left arrow key, mapped to the moveBackward function.
      37 : moveBackward ,
      // Key code for the right arrow key, mapped to the moveForward function.
      39 : moveForward ,
      // Key code for the up arrow key, mapped to the previousHistory function.
      38 : previousHistory ,
      // Key code for the down arrow key, mapped to the nextHistory function.
      40 : nextHistory ,
      // Key code for the backspace key, mapped to the backDelete function.
      8  : backDelete ,
      // Key code for the delete key, mapped to the forwardDelete function.
      46 : forwardDelete ,
      // Key code for the 'End' key, mapped to the moveToEnd function.
      35 : moveToEnd ,
      // Key code for the 'Home' (start) key, mapped to the moveToStart function.
      36 : moveToStart ,
      // Key code for the 'Return' (Enter) key, mapped to the commandTrigger function.
      13 : commandTrigger ,
      // Key code for the Alt key (often used with Tab), mapped to doNothing.
      18 : doNothing ,
      // Key code for the Tab key, mapped to the doComplete function for autocompletion.
      9  : doComplete
    };


    // Control codes mapping (Ctrl + Key).
    var ctrlCodes = {
      // Ctrl-a: Move cursor to the beginning of the line.
      65 : moveToStart ,
      // Ctrl-e: Move cursor to the end of the line.
      69 : moveToEnd ,
      // Ctrl-d: Delete character under cursor (forward delete).
      68 : forwardDelete ,
      // Ctrl-n: Navigate to the next command in history.
      78 : nextHistory ,
      // Ctrl-p: Navigate to the previous command in history.
      80 : previousHistory ,
      // Ctrl-b: Move cursor backward one character.
      66 : moveBackward ,
      // Ctrl-f: Move cursor forward one character.
      70 : moveForward ,
      // Ctrl-k: Delete all characters from cursor to the end of the line.
      75 : deleteUntilEnd
    };


    // If custom control codes are provided in the configuration, extend the default set.
    if ( config.ctrlCodes ) {

      $.extend( ctrlCodes , config.ctrlCodes ) ;

    }


    // Alt codes mapping (Alt + Key).
    var altCodes = {
      // Alt-f: Move cursor to the next word.
      70 : moveToNextWord ,
      // Alt-b: Move cursor to the previous word.
      66 : moveToPreviousWord ,
      // Alt-d: Delete the next word.
      68 : deleteNextWord
    };


    // Shift codes mapping (Shift + Key).
    var shiftCodes = {
      // Shift-Enter: Insert a new line character.
      13 : newLine ,
    };


    // HTML string for the blinking cursor element.
    var cursor = '<span class="jquery-console-cursor">&nbsp;</span>';


    ////////////////////////////////////////////////////////////////////////
    // Globals
    // These variables maintain the state of the console.

    // The main container element for the console.
    var container = $( this ) ;

    // The inner div that holds all console output and the prompt.
    var inner = $( '<div class="jquery-console-inner"></div>' ) ;

    // The hidden textarea used for capturing user input, including pasted newlines.
    // This was changed from a text input to a textarea to support multiline paste.
    var typer = $( '<textarea autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" class="jquery-console-typer"></textarea>' ) ;

    // The div element that contains the current prompt line.
    var promptBox ;

    // The span element within promptBox where the user's input text is displayed.
    var prompt ;

    // Label used for continued input lines (e.g., after pressing Shift+Enter).
    var continuedPromptLabel = config && config.continuedPromptLabel ?
      config.continuedPromptLabel : "> " ;

    // The current column position of the cursor within the promptText.
    var column = 0 ;

    // The actual text content of the current prompt input.
    var promptText = '' ;

    // Stores the prompt text temporarily when navigating history, to restore it later.
    var restoreText = '' ;

    // Stores text for continued input, if any.
    var continuedText = '' ;

    // Flag to control if the console fades out and in on reset. Defaults to true.
    var fadeOnReset = config.fadeOnReset !== undefined ? config.fadeOnReset : true ;

    // Array to store the history of executed commands.
    var history = [] ;

    // Index into the history array for navigation.
    var ringn = 0 ;

    // A flag to prevent duplicate keypress events, especially in browsers like Opera.
    // Some browsers trigger both keydown and keypress for certain keys.
    var cancelKeyPress = 0 ;

    // Controls whether the console accepts input from the user.
    var acceptInput = true ;

    // Indicates if the current command execution has been cancelled (e.g., via Ctrl+C).
    var cancelCommand = false ;


    // An object to expose public methods of the console.
    var extern = {} ;


    ////////////////////////////////////////////////////////////////////////
    // Main entry point - Initialization routine.
    ( function ( ) {

      // Set the prompt label, defaulting to "> " if not specified in config.
      extern.promptLabel = config && config.promptLabel ? config.promptLabel : "> " ;

      // Append the inner console div to the main container.
      container.append( inner ) ;

      // Append the hidden typer (textarea) to the inner div.
      inner.append( typer ) ;

      // Position the typer off-screen to hide it visually.
      typer.css( { position : 'absolute' , top : 0 , left : '-9999px' } ) ;

      // Display a welcome message if provided in the configuration.
      if ( config.welcomeMessage ) {
        message( config.welcomeMessage , 'jquery-console-welcome' ) ;
      }

      // Create the initial prompt box.
      newPromptBox ( ) ;

      // Set focus to the console if autofocus is enabled.
      if ( config.autofocus ) {

        inner.addClass( 'jquery-console-focus' ) ;
        typer.focus ( ) ;

        // A small delay to ensure focus is applied consistently.
        setTimeout( function ( ) {
          inner.addClass( 'jquery-console-focus' ) ;
          typer.focus ( ) ;
        } , 100 ) ;
      }

      // Expose internal elements and functions for external access.
      extern.inner = inner ;
      extern.typer = typer ;
      extern.scrollToBottom = scrollToBottom ;
      extern.report = report ;

    } ) ( ) ;


    ////////////////////////////////////////////////////////////////////////
    // Reset terminal - Clears all output and creates a new prompt.
    extern.reset = function ( ) {

      // Check if a welcome message exists.
      var welcome = ( typeof config.welcomeMessage != 'undefined' ) ;


      // Helper function to remove console elements.
      var removeElements = function ( ) {

        inner.find( 'div' ).each( function ( ) {
          if ( ! welcome ) {
            $( this ).remove ( ) ;
          } else {
            // Keep the welcome message if it's the first element.
            welcome = false ;
          }
        } ) ;
      };


      // Animate the reset if fadeOnReset is true.
      if ( fadeOnReset ) {

        inner.parent ( ).fadeOut( function ( ) {
          removeElements ( ) ;
          newPromptBox ( ) ;
          inner.parent ( ).fadeIn( focusConsole ) ;
        } ) ;

      } else {

        removeElements ( ) ;
        newPromptBox ( ) ;
        focusConsole ( ) ;

      }
    };


    // Sets focus to the console input area.
    var focusConsole = function ( ) {

      inner.addClass( 'jquery-console-focus' ) ;
      typer.focus ( ) ;

    };


    // Public method to explicitly set focus on the console.
    extern.focus = function ( ) {

      focusConsole ( ) ;

    }


    ////////////////////////////////////////////////////////////////////////
    // Display a notice message within the console.
    extern.notice = function ( msg , style ) {

      // Create a new notice div and append the message.
      var n = $( '<div class="notice"></div>' ).append( $( '<div></div>' ).text( msg ) )
        .css( { visibility : 'hidden' } ) ;

      container.append( n ) ;

      var focused = true ;

      // Apply fade out style if specified.
      if ( style == 'fadeout' ) {

        setTimeout( function ( ) {
          n.fadeOut( function ( ) {
            n.remove ( ) ;
          } ) ;
        } , 4000 ) ;

      } else if ( style == 'prompt' ) {

        // If style is 'prompt', add an 'OK' action button.
        var a = $( '<br/><div class="action"><a href="javascript:">OK</a><div class="clear"></div></div>' ) ;
        n.append( a ) ;
        focused = false ;

        // Click handler for the 'OK' button.
        a.click( function ( ) { n.fadeOut( function ( ) { n.remove ( ) ; inner.css( { opacity : 1 } ) } ) ; } ) ;

      }

      // Get the height of the notice before animating.
      var h = n.height ( ) ;

      // Animate the notice to slide down.
      n.css( { height : '0px' , visibility : 'visible' } )
        .animate( { height : h + 'px' } , function ( ) {
          if ( ! focused ) {
            inner.css( { opacity : 0.5 } ) ;
          }
        } ) ;

      n.css( 'cursor' , 'default' ) ;

      return n ;
    };


    ////////////////////////////////////////////////////////////////////////
    // Make a new prompt box for user input.
    function newPromptBox ( ) {

      column = 0 ;                        // Reset cursor column to the beginning.
      promptText = '' ;                   // Clear the current prompt text.
      ringn = 0 ;                         // Reset history ring position.
      enableInput ( ) ;                   // Ensure input is enabled.

      // Create the main prompt box div.
      promptBox = $( '<div class="jquery-console-prompt-box"></div>' ) ;

      // Create the label for the prompt (e.g., "> ").
      var label = $( '<span class="jquery-console-prompt-label"></span>' ) ;

      // Determine the correct label text (continued prompt or regular).
      var labelText = extern.continuedPrompt ? continuedPromptLabel : extern.promptLabel ;

      // Append and display the label.
      promptBox.append( label.text( labelText ).show ( ) ) ;

      // Replace spaces in the label with non-breaking spaces for consistent rendering.
      label.html( label.html ( ).replace( ' ' , '&nbsp;' ) ) ;

      // Create the span where the actual command text will appear.
      prompt = $( '<span class="jquery-console-prompt"></span>' ) ;

      promptBox.append( prompt ) ;       // Add the prompt span to the prompt box.
      inner.append( promptBox ) ;        // Add the prompt box to the console's inner div.
      updatePromptDisplay ( ) ;          // Update the visual display of the prompt.

    };


    ////////////////////////////////////////////////////////////////////////
    // Handle setting focus when the container is clicked.
    container.click( function ( ) {

      // If there's an active text selection, do not interfere with focus.
      if ( window.getSelection ( ).toString ( ) ) {
        return false ;
      }

      inner.addClass( 'jquery-console-focus' ) ;     // Add focus class to the inner div.
      inner.removeClass( 'jquery-console-nofocus' ) ; // Remove no-focus class.

      // Use specific focus methods for Webkit browsers to prevent scrolling.
      if ( isWebkit ) {
        typer.focusWithoutScrolling ( ) ;
      } else {
        // For other browsers, temporarily fix position and then focus.
        typer.css( 'position' , 'fixed' ).focus ( ) ;
      }

      scrollToBottom ( ) ; // Scroll to the bottom of the console.
      return false ;       // Prevent default click behavior.

    } ) ;


    ////////////////////////////////////////////////////////////////////////
    // Handle losing focus when the typer (textarea) blurs.
    typer.blur( function ( ) {

      inner.removeClass( 'jquery-console-focus' ) ; // Remove focus class.
      inner.addClass( 'jquery-console-nofocus' ) ;    // Add no-focus class.

    } ) ;


    ////////////////////////////////////////////////////////////////////////
    // Bind to the paste event of the input box so we know when we
    // get pasted data.
    typer.bind( 'paste' , function ( e ) {

      // Temporarily clear the typer's value to ensure only pasted content is captured.
      typer.val( "" ) ;

      // This timeout is crucial because the 'paste' event fires *before*
      // the actual text is inserted into the textarea.
      setTimeout( function ( ) {
        typer.consoleInsert( typer.val ( ) ) ; // Insert the pasted text into the console prompt.
        typer.val( "" ) ;                     // Clear the typer again after processing.
      } , 0 ) ;

    } ) ;


    ////////////////////////////////////////////////////////////////////////
    // Handle key hit before translation (keydown event).
    // This is used for picking up control characters like up/left/down/right arrows,
    // and combinations like Ctrl+C.

    typer.keydown( function ( e ) {

      cancelKeyPress = 0 ;           // Reset the flag for canceling keypress events.
      var keyCode = e.keyCode ;      // Get the key code of the pressed key.

      // Special handling for Ctrl-c: cancel the execution of the current command.
      if ( e.ctrlKey && keyCode == 67 ) {
        cancelKeyPress = keyCode ;   // Mark this keypress as handled.
        cancelExecution ( ) ;        // Call the cancel execution handler.
        return false ;               // Prevent default browser action.
      }

      // Only process input if the console is accepting input.
      if ( acceptInput ) {

        // Check for Shift key combinations.
        if ( e.shiftKey && keyCode in shiftCodes ) {
          cancelKeyPress = keyCode ;          // Mark as handled.
          ( shiftCodes [ keyCode ] ) ( ) ;    // Execute the corresponding function.
          return false ;                      // Prevent default.
        }
        // Check for Alt key combinations.
        else if ( e.altKey && keyCode in altCodes ) {
          cancelKeyPress = keyCode ;          // Mark as handled.
          ( altCodes [ keyCode ] ) ( ) ;      // Execute the corresponding function.
          return false ;                      // Prevent default.
        }
        // Check for Ctrl key combinations.
        else if ( e.ctrlKey && keyCode in ctrlCodes ) {
          cancelKeyPress = keyCode ;          // Mark as handled.
          ( ctrlCodes [ keyCode ] ) ( ) ;     // Execute the corresponding function.
          return false ;                      // Prevent default.
        }
        // Check for standalone key codes.
        else if ( keyCode in keyCodes ) {
          cancelKeyPress = keyCode ;          // Mark as handled.
          ( keyCodes [ keyCode ] ) ( ) ;      // Execute the corresponding function.
          return false ;                      // Prevent default.
        }
      }
    } ) ;


    ////////////////////////////////////////////////////////////////////////
    // Handle key press (keypress event).
    // This event is generally used for character input.

    typer.keypress( function ( e ) {

      var keyCode = e.keyCode || e.which ; // Get the key code (e.which is for cross-browser compatibility).

      // Check if the key is ignorable (e.g., Alt+Tab).
      if ( isIgnorableKey ( e ) ) {
        return false ; // Ignore the keypress.
      }

      // Special handling for Ctrl-v (or Cmd-v on Mac): don't insert a 'v' character on paste.
      if ( ( e.ctrlKey || e.metaKey ) && String.fromCharCode( keyCode ).toLowerCase ( ) == 'v' ) {
        return true ; // Allow the paste event to proceed.
      }

      // If input is accepted, and this keypress wasn't cancelled by keydown, and it's a printable character.
      if ( acceptInput && cancelKeyPress != keyCode && keyCode >= 32 ) {
        if ( cancelKeyPress ) {
          return false ; // If keydown already handled it, cancel this keypress.
        }

        // Check if a custom character insertion trigger function exists and allows insertion.
        if (
          typeof config.charInsertTrigger == 'undefined' || (
            typeof config.charInsertTrigger == 'function' &&
              config.charInsertTrigger( keyCode , promptText )
          )
        ) {
          typer.consoleInsert( keyCode ) ; // Insert the character into the prompt.
        }
      }

      // For Webkit browsers, prevent default keypress behavior to avoid double insertion.
      if ( isWebkit ) {
        return false ;
      }
    } ) ;


    // Determines if a key event should be ignored.
    function isIgnorableKey ( e ) {
      // Currently, it filters Alt+Tab and Alt+` (backtick) which can occur when switching windows.
      return ( ( e.keyCode == keyCodes.tab || e.keyCode == 192 ) && e.altKey ) ;
    };


    ////////////////////////////////////////////////////////////////////////
    // Rotate through the command history.
    function rotateHistory ( n ) {

      // If history is empty, there's nothing to rotate.
      if ( history.length == 0 ) {
        return ;
      }

      ringn += n ; // Adjust the history ring index.

      // Wrap around the history ring.
      if ( ringn < 0 ) {
        ringn = history.length ;
      } else if ( ringn > history.length ) {
        ringn = 0 ;
      }

      var prevText = promptText ; // Store current prompt text before changing.

      // If ringn is 0, restore the original text before history navigation.
      if ( ringn == 0 ) {
        promptText = restoreText ;
      } else {
        // Otherwise, set promptText to the command from history.
        promptText = history [ ringn - 1 ] ;
      }

      // Handle cursor column preservation based on configuration.
      if ( config.historyPreserveColumn ) {
        if ( promptText.length < column + 1 ) {
          column = promptText.length ;
        } else if ( column == 0 ) {
          column = promptText.length ;
        }
      } else {
        column = promptText.length ; // Default: place cursor at the end of the history command.
      }

      updatePromptDisplay ( ) ; // Update the visual display.

    };


    // Moves to the previous command in history.
    function previousHistory ( ) {

      rotateHistory( -1 ) ;

    };


    // Moves to the next command in history.
    function nextHistory ( ) {

      rotateHistory( 1 ) ;

    };


    // Add a given line of text to the command history.
    function addToHistory ( line ) {

      history.push( line ) ; // Add the line to the end of the history array.
      restoreText = '' ;     // Clear any temporarily stored text.

    };


    // Delete the character at the current cursor position.
    function deleteCharAtPos ( ) {

      // Only delete if the cursor is within the bounds of the prompt text.
      if ( column < promptText.length ) {
        promptText =
          promptText.substring( 0 , column ) +   // Text before the cursor.
          promptText.substring( column + 1 ) ;   // Text after the character to be deleted.
        restoreText = promptText ;               // Update restoreText.
        return true ;                            // Indicate successful deletion.
      } else {
        return false ;                           // No character to delete.
      }
    };


    // Handles the backspace key: moves cursor back, then deletes character.
    function backDelete ( ) {

      if ( moveColumn( -1 ) ) { // Try to move the cursor one position back.
        deleteCharAtPos ( ) ;   // If successful, delete the character.
        updatePromptDisplay ( ) ; // Update the display.
      }

    };


    // Handles the delete key: deletes character at current cursor position.
    function forwardDelete ( ) {

      if ( deleteCharAtPos ( ) ) { // Delete the character.
        updatePromptDisplay ( ) ;  // If successful, update the display.
      }

    };


    // Deletes all characters from the current cursor position to the end of the line.
    function deleteUntilEnd ( ) {

      while ( deleteCharAtPos ( ) ) { // Keep deleting characters until the end is reached.
        updatePromptDisplay ( ) ;     // Update the display after each deletion.
      }

    };


    // Deletes the next word from the current cursor position.
    function deleteNextWord ( ) {

      // A word is defined here as a sequence of alphanumeric characters.

      // First, delete any non-alphanumeric characters until the start of a word.
      while (
        column < promptText.length &&
          ! isCharAlphanumeric( promptText [ column ] )
      ) {
        deleteCharAtPos ( ) ;
        updatePromptDisplay ( ) ;
      }

      // Then, delete alphanumeric characters until the end of the word.
      while (
        column < promptText.length &&
          isCharAlphanumeric( promptText [ column ] )
      ) {
        deleteCharAtPos ( ) ;
        updatePromptDisplay ( ) ;
      }

    };


    // Inserts a new line character at the current cursor position.
    function newLine ( ) {

      var lines = promptText.split( "\n" ) ;           // Split the prompt text into lines.
      var last_line = lines.slice( -1 ) [ 0 ] ;        // Get the last line.
      var spaces = last_line.match( /^(\s*)/g ) [ 0 ] ; // Extract leading whitespace for indentation.
      var new_line = "\n" + spaces ;                   // Create the new line with indentation.
      promptText += new_line ;                         // Append the new line to the prompt text.
      moveColumn( new_line.length ) ;                  // Move the cursor to the end of the new line.
      updatePromptDisplay ( ) ;                        // Update the visual display.

    };


    ////////////////////////////////////////////////////////////////////////
    // Validate command and trigger it if valid, or show a validation error.
    function commandTrigger ( ) {

      var line = promptText ; // Get the current command line.

      // If a command validation function is provided in the config.
      if ( typeof config.commandValidate == 'function' ) {

        var ret = config.commandValidate( line ) ; // Call the validation function.

        // If validation returns true or false.
        if ( ret == true || ret == false ) {
          if ( ret ) {
            handleCommand ( ) ; // If valid, handle the command.
          }
        } else {
          // If validation returns an error message, display it.
          commandResult( ret , "jquery-console-message-error" ) ;
        }

      } else {
        handleCommand ( ) ; // If no validator, proceed directly to handling the command.
      }

    };


    // Scrolls the console output area to the very bottom.
    function scrollToBottom ( ) {

      // Get jQuery version to handle differences in property access.
      var version = jQuery.fn.jquery.split( '.' ) ;
      var major = parseInt( version [ 0 ] ) ;
      var minor = parseInt( version [ 1 ] ) ;


      // Check if jQuery version is greater than 1.6.
      if ( ( major == 1 && minor > 6 ) || major > 1 ) {
        inner.prop( { scrollTop : inner.prop( "scrollHeight" ) } ) ;
      }
      else {
        // For older jQuery versions, use attr.
        inner.attr( { scrollTop : inner.attr( "scrollHeight" ) } ) ;
      }

    };


    // Handles cancellation of currently executing commands.
    function cancelExecution ( ) {

      // If a custom cancel handler is provided, call it.
      if ( typeof config.cancelHandle == 'function' ) {
        config.cancelHandle ( ) ;
      }

    }


    ////////////////////////////////////////////////////////////////////////
    // Handle a command - processes the command input.
    function handleCommand ( ) {

      // If a command handler function is provided in the configuration.
      if ( typeof config.commandHandle == 'function' ) {

        disableInput ( ) ;         // Disable further input while command is processing.
        addToHistory( promptText ) ; // Add the command to history.
        var text = promptText ;    // Store the prompt text.