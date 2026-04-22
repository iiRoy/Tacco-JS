/*
 * This is a Type I clone of the original Uedit.js library.
 * All functionality remains identical.
 * The primary purpose of this file is to demonstrate code cloning
 * where only whitespace and comments are altered.
 *
 * Author: Amir Hadzic (original)
 * Web: http://www.randomshouting.com (original)
 */
"use strict";


// Ensure Function.prototype.bind exists, providing a polyfill if not present.
if ( ! Function.prototype.bind )
{
  Function.prototype.bind = function (obj) {

    var slice = [].slice
    ,   args = slice.call(arguments, 1) // arguments after the 'obj'
    ,   self = this
    ,   nop = function () {}
    ,   bound = function () {
          // Determine the correct context for 'this'
          // If 'this' is an instance of 'nop' (i.e., called with 'new'),
          // use 'this' for the context. Otherwise, use 'obj' or an empty object.
          return self.apply( this instanceof nop ? this : (obj || {}),
                              args.concat(slice.call(arguments)));
        };

    // Set up the prototype chain to correctly inherit from the original function.
    nop.prototype = self.prototype;

    // The bound function's prototype should be an instance of 'nop'.
    bound.prototype = new nop();

    return bound;
  };
}


// Polyfill for String.prototype.startsWith if it's not natively supported.
if ( !String.prototype.startsWith )
{

    String.prototype.startsWith = function ( string ) {

        return this.substr(0, string.length) === string;

    }

}


var Uedit = function ( ) { // Main Uedit constructor function

    // Private variable to hold the reference to the target textarea element.
    var textarea = null;


    // URL for Markdown syntax help.
    var HELP_URL = "http://daringfireball.net/projects/markdown/syntax";


    // Key codes for various actions.
    var KEY_U = 90; // 'U' key
    var KEY_I = 73; // 'I' key
    var KEY_D = 68; // 'D' key
    var KEY_B = 66; // 'B' key
    var KEY_K = 75; // 'K' key
    var KEY_SPACE = 32; // Spacebar
    var KEY_ENTER = 13; // Enter key


    // Default tab string (4 spaces). Can be changed to '\t' for actual tabs.
    var tab = "    ";

    // Flags and state variables for list handling.
    var isLeavingListItem = false;
    var listType = ''; // 'ul' for unordered, 'num' for numbered
    var sel_lastListItem = null; // Stores selection for the last list item.
    var lastItemNumber = null; // Stores the number for numbered lists.
    var cachedSelection = null; // Used for IE selection caching.


    // Browser detection for specific EOL (End-Of-Line) and IE quirks.
    var isBadEol = typeof window.opera != "undefined"
                 || (navigator.appName && navigator.appName == "Microsoft Internet Explorer");
    var isIE = navigator.appName && navigator.appName == "Microsoft Internet Explorer";


    // Simple logging function, active only if UEDIT_DEBUG is defined.
    function log ( record ) {
        var now = new Date(); // Get current timestamp.


        // If debug mode is not enabled, exit immediately.
        if ( typeof UEDIT_DEBUG === "undefined" ) {
            return;
        }

        // Log to console if it exists.
        typeof console !== "undefined" && console.log(
            "uedit -> [" + now.getHours() + ":"
                + now.getMinutes() + ":"
                + now.getSeconds() + "] "
            + record
        );
    }


    // State manager object, responsible for undo/redo functionality.
    this.stateManager = {};
    ( function ( ) { // IIFE for stateManager to create a private scope.

        var _ueditor = arguments[0]; // Reference to the parent Uedit instance.
        var _states = []; // Array to store historical states of the editor content and selection.


        var _stateTypes = { // Enum for different state manager modes.
            activeState: 0, // Editor is actively being typed into.
            staticState: 1  // Editor is in an undo/redo review state.
        };


        var _stateType = _stateTypes.activeState; // Current state manager type.
        var _preLockState = null; // Not used in this version.
        var _canRedo = false; // Flag to indicate if a redo operation is possible.
        var _staticStateIndex = null; // Index of the current state when in staticState.


        this.init = function ( ) {
            // Save the initial state of the editor.
            this.save();
        }


        /*
         * This function should be called when the user makes a new edit,
         * moving the state manager back to an active editing mode.
         */
        this.gotoActiveStateType = function ( ) {
            if ( _stateType == _stateTypes.staticState ) {
                // If we were in a static (undo/redo) state, any new edits
                // invalidate future redo states.
                var remainingStates = _states.length - _staticStateIndex - 1;
                _states.splice(_staticStateIndex + 1, remainingStates); // Remove future states.

                _canRedo = false; // Redo is no longer possible.
                _stateType = _stateTypes.activeState; // Switch back to active editing.
                _staticStateIndex = null; // Reset static state index.
            }
        }


        this.save = function ( ) {
            if ( _stateType == _stateTypes.activeState ) {
                // Only save new states if in active editing mode.
                var newState = this.getCurrentState();

                // Prevent saving identical consecutive states.
                if ( ! _states.length ||
                     ! _states[ _states.length - 1 ].equals(newState) )
                {
                    _states.push(this.getCurrentState()); // Add the current editor state.
                }
            } else {
                throw "New state cannot be saved while in static state."; // Error if trying to save in static mode.
            }
        }


        this.undo = function ( ) {
            if ( this.canUndo() ) { // Check if an undo operation is possible.
                if ( _staticStateIndex == null ) {
                    // If this is the first undo, transition to static state.
                    _stateType = _stateTypes.staticState;
                    _staticStateIndex = _states.length - 1; // Point to the current state.

                    // Save the current state to allow for redo later.
                    _states.push(this.getCurrentState());
                    _canRedo = true; // Redo is now possible.
                } else {
                    _staticStateIndex--; // Move to the previous state.
                }

                _states[_staticStateIndex].restore(); // Restore the selected state.

                // Trigger callbacks for UI updates (e.g., enable/disable undo/redo buttons).
                if ( _ueditor.setRedoStateCallback ) {
                    _ueditor.setRedoStateCallback(this.canRedo());
                }

                if ( _ueditor.setUndoStateCallback ) {
                    _ueditor.setUndoStateCallback(this.canUndo());
                }
            }
        }


        this.redo = function ( ) {
            if ( this.canRedo() ) { // Check if a redo operation is possible.
                // Move to the next state in the history.
                _staticStateIndex++;

                // Restore the state.
                _states[_staticStateIndex].restore();

                if ( _staticStateIndex == _states.length - 1 ) {
                    // If we've reached the last state, there's no more to redo.
                    // Revert to active state.
                    _staticStateIndex = null;
                    _stateType = _stateTypes.activeState;
                    _canRedo = false;
                }

                // Trigger callbacks for UI updates.
                if ( _ueditor.setRedoStateCallback ) {
                    _ueditor.setRedoStateCallback(this.canRedo());
                }

                if ( _ueditor.setUndoStateCallback ) {
                    _ueditor.setUndoStateCallback(this.canUndo());
                }
            }
        }


        this.canUndo = function ( ) {
            if ( _stateType == _stateTypes.activeState ) {
                // In active state, can undo if current text is different from last saved state.
                // This check might be slightly flawed as it compares text only, not selection.
                // A better check would involve comparing 'content' and 'selection' of the last state.
                return (_states.length > 1); // Or more accurately, if current state is different from _states[_states.length - 1]
            } else if ( _stateType == _stateTypes.staticState ) {
                // In static state, can undo if not at the very first state.
                return (_staticStateIndex > 0);
            } else {
            	return false; // Should not happen.
            }
        }


        this.canRedo = function ( ) {
            // Can redo only if in static state and the _canRedo flag is set.
            return (_canRedo && _stateType == _stateTypes.staticState);
        }


        this.getSelectedState = function ( ) {
            if ( _stateType == _stateTypes.staticState ) {
                // Return the state currently being viewed in static mode.
                return _states[_staticStateIndex];
            } else {
                // Return the most recent state in active mode.
                return _states[_states.length - 1];
            }
        }


        this.getCurrentState = function ( ) {
            // Returns an object representing the current editor state (selection and content).
            return {
                selection: _ueditor.getSelection(), // Current selection object.
                content: _ueditor.getText(), // Current text content.

                restore: function ( ) {
                    // Method to restore the editor to this state.
                    _ueditor.setText(this.content);
                    _ueditor.select(this.selection);
                },

                equals: function ( state ) {
                    // Method to compare if two states are identical.
                    return this.content == state.content &&
                           this.selection.equals(state.selection);
                }
            }
        }
    } ).bind(this.stateManager, this)(); // Bind the IIFE to this.stateManager and pass 'this' (Uedit instance) as argument[0].


    // Initializes the Uedit instance with a target textarea.
    this.init = function ( targetTextArea ) {
        // Validate the target element.
        if ( targetTextArea == null || targetTextArea.type != "textarea" ) {
            throw "Invalid target text area";
        }

        textarea = targetTextArea; // Store the textarea reference.
        this.stateManager.init(); // Initialize the state manager.

        // Attach event handlers for key presses.
        textarea.onkeyup = this.onkeyup.bind(this);
        textarea.onkeydown = this.onkeydown.bind(this);

        // Attach event handlers for paste and cut actions, saving state.
        textarea.onpaste = ( function ( ) {
            this.saveState(); // Save state before paste.
        } ).bind(this);

        textarea.oncut = ( function ( ) {
            this.saveState(); // Save state before cut.
        } ).bind(this);

    }


    // Normalizes End-Of-Line characters to '\n' for consistency.
    this.fixEol = function ( text ) {
        text = text.replace(/\r\n/g, "\n"); // Replace Windows EOL.
        text = text.replace(/\r/g, "\n");   // Replace old Mac EOL.
        return text;
    }


    // Gets the current window width.
    this.windowWidth = function ( ) {
        if ( window.innerWidth ) {
            return window.innerWidth;
        } else if ( document.documentElement ) {
            return document.documentElement.clientWidth;
        } else if ( document.body ) {
            return document.body.clientWidth;
        }

        return null; // Fallback if no width can be determined.
    }


    // Gets the current window height.
    this.windowHeight = function ( ) {
        if ( window.innerHeight ) {
            return window.innerHeight;
        } else if ( document.documentElement ) {
            return document.documentElement.clientHeight;
        } else if ( document.body ) {
            return document.body.clientHeight;
        }

        return null; // Fallback if no height can be determined.
    }


    // Helper constructor for managing text selections.
    function Selection ( start, end ) {
        this.start = start; // Start index of the selection.
        this.end = end;     // End index of the selection.

        this.equals = ( function ( selection ) {
            // Compares if this selection is identical to another.
            return this.start == selection.start &&
                   this.end == selection.end;
        } ).bind(this);

        this.length = ( function ( ) {
            // Calculates the length of the selection.
            return this.end - this.start;
        } ).bind(this);
    }


    // Retrieves the current selection in the textarea.
    this.getSelection = function ( ) {
        var start = 0
        ,   end = 0
        ,   normalizedValue
        ,   range
        ,   textInputRange
        ,   len
        ,   endRange
        ,   el = textarea; // Reference to the textarea element.

        // Modern browsers (and IE9+) support selectionStart/selectionEnd.
        if ( typeof el.selectionStart == "number" && typeof el.selectionEnd == "number" ) {
            start = el.selectionStart;
            end = el.selectionEnd;
        } else {
            // Legacy IE handling using document.selection.
            if ( cachedSelection != null ) {
                range = cachedSelection; // Use cached range if available.
            } else {
                range = document.selection.createRange(); // Get current selection range.
            }

            if ( range && range.parentElement() == el ) { // Ensure range is within our textarea.

                len = el.value.length;
                normalizedValue = el.value.replace(/\r\n/g, "\n"); // Normalize EOL for calculation.

                // Create a TextRange that lives only in the input element.
                textInputRange = el.createTextRange();
                textInputRange.moveToBookmark(range.getBookmark()); // Move to current selection.

                // Check if the selection is at the very end of the input.
                endRange = el.createTextRange();
                endRange.collapse(false); // Collapse to the end of the input.

                if ( textInputRange.compareEndPoints("StartToEnd", endRange) > -1 ) {
                    start = end = len; // Selection is at the very end.
                } else {
                    // Calculate start position.
                    start = -textInputRange.moveStart("character", -len);
                    start += normalizedValue.slice(0, start).split("\n").length - 1;

                    // Calculate end position.
                    if ( textInputRange.compareEndPoints("EndToEnd", endRange) > -1 ) {
                        end = len; // Selection extends to the very end.
                    } else {
                        end = -textInputRange.moveEnd("character", -len);
                        end += normalizedValue.slice(0, end).split("\n").length - 1;
                    }
                }
            }
        }

        // Adjust for '\r' characters in IE and Opera, which treat '\r\n' as two characters.
        var matches = el.value.substring(0, start).match(/\r/g);

        if ( matches ) {
           start -= matches.length;
           end -= matches.length;
        }

        return new Selection(start, end); // Return a new Selection object.
    }


    // Sets the selection in the textarea to the specified start and end positions.
    this.setSelection = function ( start, end ) {
        if ( textarea.setSelectionRange ) {
            // Modern browsers (and IE9+).
            var fixedText = this.fixEol(textarea.value); // Normalize text for calculation.

            var matches = fixedText.substring(0, start).match(/\n/g);

            // Opera and IE (older versions) use \r\n, so adjust selection.
            if ( matches && isBadEol ) {
                start += matches.length;
                end += matches.length;
            }

            textarea.setSelectionRange(start, end);
        } else {
            // Legacy IE handling.
            var range = textarea.createTextRange();
            var textLength = this.getText().length;
            range.moveStart("character", -textLength); // Move to start.
            range.moveEnd("character", -textLength);   // Collapse.
            range.moveEnd("character", end);            // Expand to end.
            range.moveStart("character", start);        // Move start.
            range.select();                             // Apply selection.
        }

        textarea.focus(); // Ensure textarea has focus after setting selection.
    }


    // Retrieves the full text content of the textarea.
    this.getText = function ( ) {
        return textarea.value;
    }


    // Sets the full text content of the textarea.
    this.setText = function ( text ) {
        textarea.value = text;
    }


    // Retrieves the currently selected text in the textarea.
    this.getSelectedText = function ( ) {
        var selection = this.getSelection(); // Get current selection object.

        // Return the substring based on the selection, after fixing EOLs.
        return this.fixEol(textarea.value).substr(
            selection.start,
            selection.length()
        );
    }


    // Caches the current selection, primarily for IE's document.selection.
    this.cacheSelection = function ( ) {
        if ( document.selection && document.selection.createRange ) {
            cachedSelection = document.selection.createRange();
        }
    }


    // Clears the cached selection.
    this.purgeCachedSelection = function ( ) {
        cachedSelection = null;
    }


    // Handles the 'keyup' event for the textarea.
    this.onkeyup = function ( e ) {
        if ( e == undefined ) {
            e = event; // Fallback for IE event model.
        }

        // If the text content has changed, notify the state manager to go to active state.
        if ( this.stateManager.getSelectedState().content != this.getText() ) {
            this.stateManager.gotoActiveStateType();

            // Update UI for redo/undo buttons.
            if ( this.setRedoStateCallback ) {
                this.setRedoStateCallback(this.stateManager.canRedo());
            }

            if ( this.setUndoStateCallback ) {
                this.setUndoStateCallback(this.stateManager.canUndo());
            }
        }

        // Specific handling for list items when 'Enter' is pressed.
        if ( isLeavingListItem && listType == 'ul' && e.keyCode == 13 ) {
            // User pressed Enter after an unordered list item.
            var lastListItem = this.getTextAtSelection(sel_lastListItem);

            if ( ( /^(  \*\s*)$/i ).test(lastListItem) ) {
                // If the last item was just '  * ', remove it.
                var selection = this.replaceTextAtSelection("\n", sel_lastListItem);
            } else {
                // Otherwise, insert a new list item '  * '.
                var selection = this.injectText('  * ');
                this.selectEnd(selection); // Place cursor at the end of the new item.
            }

            // Reset list state.
            isLeavingListItem = false;
            listType = null;
            sel_lastListItem = null;
        } else if ( isLeavingListItem && listType == 'num' && e.keyCode == 13 ) {
            // User pressed Enter after a numbered list item.
            var lastListItem = this.getTextAtSelection(sel_lastListItem);

            if ( ( /^(  \d+\.\s*)$/i ).test(lastListItem) ) {
                // If the last item was just '  N. ', remove it.
                var selection = this.replaceTextAtSelection("\n", sel_lastListItem);
                this.selectEnd(selection);
            } else {
                // Otherwise, insert the next numbered list item.
                var selection = this.injectText('  ' + (++lastItemNumber) + '. ');
                this.selectEnd(selection);
            }

            // Reset list state.
            isLeavingListItem = false;
            listType = null;
            sel_lastListItem = null;
            lastItemNumber = null;
        }
    }


    // Handles the 'keydown' event for the textarea.
    this.onkeydown = function ( e ) {
        if ( e == undefined ) {
            e = event; // Fallback for IE event model.

            // Polyfill preventDefault for IE.
            e.preventDefault = ( function ( ) {
                this.returnValue = false;
            } ).bind(e);
        }


        switch ( true ) {
            // Ctrl+Shift+U for Redo.
            case e.ctrlKey && e.shiftKey && e.keyCode == KEY_U:
                e.preventDefault();
                this.stateManager.redo();
                break; // Added break.
            // Ctrl+U for Undo.
            case ! e.altKey && e.ctrlKey && e.keyCode == KEY_U:
                e.preventDefault();
                this.stateManager.undo();
                break;
            // Ctrl+B for Bold.
            case ! e.altKey && e.ctrlKey && e.keyCode == KEY_B:
                e.preventDefault();
                this.button_bold();
                break;
            // Ctrl+I for Italic.
            case ! e.altKey && e.ctrlKey && e.keyCode == KEY_I:
                e.preventDefault();
                this.button_italic();
                break;
            // Ctrl+D for Deleted text (strikethrough).
            case ! e.altKey && e.ctrlKey && e.keyCode == KEY_D:
                e.preventDefault();
                this.button_deleted();
                break;
            // Ctrl+K for Code block.
            case ! e.altKey && e.ctrlKey && e.keyCode == KEY_K:
                e.preventDefault();
                this.button_code();
                break;
            // Save state on Enter or Space key press.
            case e.keyCode == KEY_ENTER || e.keyCode == KEY_SPACE:
                this.saveState();
                break;
        }

        if ( e.keyCode == KEY_ENTER ) {
            // Check if the user is currently editing a list item.

            var line = this.getCurrentLine(); // Get the current line of text.
            var matches = null;
            if ( line.startsWith("  *") ) {
                // Detected an unordered list item.
                isLeavingListItem = true;
                listType = 'ul';
                sel_lastListItem = this.getCurrentLineSelection();
            } else if ( ( matches = line.match(/^  (\d+)\./i) ) != null ) {
                // Detected a numbered list item.
                isLeavingListItem = true;
                listType = "num";
                sel_lastListItem = this.getCurrentLineSelection();
                lastItemNumber = parseInt(matches[1]); // Parse the number.
            }
        }
    }