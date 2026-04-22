// This is a Type I clone of the original JavaScript code.
// Only whitespace and comments have been altered.
// All functional code, identifiers, and expressions remain identical.

// --- Start of File ---
// This section contains the license information.
// The original block comment has been converted to multiple line comments.
//
// Copyright (c) 2014 Thomas Valera. All rights reserved.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the "Software"),
// to deal in the Software without restriction, including without limitation
// the rights to use, copy, modify, merge, publish, distribute, sublicense,
// and/or sell copies of the Software, and to permit persons to whom the
// Software is furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
// FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
// DEALINGS IN THE SOFTWARE.
//
// --- End of License Header ---


// --- Module Description ---
//
// OverviewManager
//
// This module defines the primary manager for the overview extension.
// Its core responsibility is to keep the overview view synchronized
// with the currently active editor instance.
//
// --- End of Module Description ---


/*global define, brackets, $, console, setTimeout */
/*jslint nomen: true, vars: true */
define(
	function( require, exports, module ) {

		'use strict'; // Enforce strict mode for cleaner code.

		// Module dependencies are loaded here.
		var ViewManager     = require( "OverviewViewManager" ), // Manages the overview UI.
			EditorManger    = brackets.getModule( "editor/EditorManager" ), // Manages Brackets editors.
			Editor          = brackets.getModule( "editor/Editor" ), // The Editor class itself.
			DocumentManager = brackets.getModule( "document/DocumentManager" ), // Manages Brackets documents.

			_overviewEditor = null; // Private variable to hold the CodeMirror editor instance for the overview.


		// --- HELPER FUNCTIONS SECTION ---
		// This block contains internal utility functions.

		/**
		 * Retrieves the currently active full editor instance.
		 * @returns {Editor} The current full editor, or null if none is active.
		 */
		function _getCurrentFullEditor() {
			return EditorManger.getCurrentFullEditor();
		}


		/**
		 * Establishes event listeners for the `_overviewEditor` instance.
		 * Currently, it listens for 'cursorActivity' to synchronize with the main editor.
		 */
		function _setOverviewEditorListeners() {

			// Bind to the 'cursorActivity' event of the overview editor.
			$( _overviewEditor ).on( "cursorActivity", function( obj ) {

				// Check if the selected line in the overview differs from the main editor's current line.
				if ( obj.target.getCursorPos().line !== _getCurrentFullEditor().getCursorPos().line ) {

					// Get the new cursor position from the overview editor.
					var cursorPos = _overviewEditor.getCursorPos();

					// Set the main editor's cursor to the selected line and center the view.
					_getCurrentFullEditor().setCursorPos( cursorPos.line, cursorPos.ch, true, false );

					// A small delay is introduced to ensure the main editor regains focus.
					// This addresses a known bug where focus might remain on the overview editor.
					// TODO: Investigate and implement a more robust fix for the focus issue.
					setTimeout(
						function() {
							_getCurrentFullEditor().focus();
						},
						100
					);
				}
			});
		}


		/**
		 * Configures the `_overviewEditor` with a specified document and overview element.
		 * If `document` is null, the overview is destroyed and disabled.
		 * @param {Document} document - The document to display in the overview editor.
		 * @param {jQuery} overview - The jQuery object representing the overview DOM element.
		 */
		function _setOverviewEditorWithDocument( document, overview ) {

			// Proceed only if a document and overview element are provided.
			if ( document !== null && overview !== undefined ) {

				// If the overview editor doesn't exist yet, or if it's showing a different document,
				// we need to (re)create it.
				if ( _overviewEditor === null || document !== _overviewEditor.document ) {

					// If an existing overview editor is present, destroy it first to clean up resources.
					if ( _overviewEditor !== null ) {
						_overviewEditor.destroy();
					}

					// Create a new CodeMirror editor instance for the overview.
					// It's read-only (false) and targets a specific DOM element within the overview.
					_overviewEditor = new Editor.Editor( document, false, overview.find( "#code-overview-content" ).get( 0 ) );

					// Attach event listeners to the newly created overview editor.
					_setOverviewEditorListeners();

					// Ensure the overview functionality is enabled in the ViewManager.
					ViewManager.enable();
				}
			} else if ( document === null ) { // If the document is null, disable and clean up the overview.

				// Disable the overview functionality.
				ViewManager.disable();

				// If an overview editor exists, destroy it and reset its reference.
				if ( _overviewEditor !== null ) {
					_overviewEditor.destroy();
					_overviewEditor = null;
				}
			} else { // Log an error if neither document nor overview are valid.
				console.error( "Cannot set overview editor, document or overview do not exist" );
			}
		}


		/**
		 * Reloads the overview editor, updating its content based on the current state.
		 * This function ensures the overview reflects the active editor's document.
		 */
		function _reloadOverviewEditor() {

			// Retrieve the overview UI element from the ViewManager.
			var overview = ViewManager.getOverview();

			// Check if the overview UI element is available.
			if ( overview !== null && overview !== undefined ) {

				// Get the currently active full editor.
				var fullEditor = _getCurrentFullEditor();

				// If both the overview UI and a full editor exist, update the overview editor.
				if ( fullEditor !== null ) {
					_setOverviewEditorWithDocument( fullEditor.document, overview );
				} else {
					// Log an error if the full editor is missing and disable the overview.
					console.error( "Full editor does not exist!" );
					_setOverviewEditorWithDocument( null, undefined );
				}
			} else {
				// Log an error if the overview UI element is not found.
				console.error( "Overview element does not exist" );
			}
		}

		// --- END OF HELPER FUNCTIONS SECTION ---


		// --- LISTENERS FUNCTIONS SECTION ---
		// This block defines functions responsible for setting up event listeners.

		/**
		 * Sets up event listeners for the `ViewManager`.
		 * These listeners respond to changes in the overview's state (attached, zoom, visibility).
		 */
		function _setViewManagerListeners() {

			// Listener for when the overview panel is attached to the UI.
			$( ViewManager ).on( "OverviewAttached", function() {
				// If a full editor is active, enable the overview functionality.
				if ( _getCurrentFullEditor() !== null ) {
					ViewManager.enable();
				}
			});

			// Listener for when a zoom level is applied to the overview.
			$( ViewManager ).on( "ZoomApplied", function() {
				// Refresh the overview editor to apply the new zoom.
				_overviewEditor.refresh();
			});

			// Listener for when the overview becomes visible.
			$( ViewManager ).on( "OverviewVisible", function() {
				// Reload the overview editor to display the correct content.
				_reloadOverviewEditor();
			});

			// Listener for when the overview becomes hidden.
			$( ViewManager ).on( "OverviewHidden", function() {
				// Destroy the overview editor and clear its reference to free resources.
				_overviewEditor.destroy();
				_overviewEditor = null;
			});
		}


		/**
		 * Sets up event listeners for the `DocumentManager`.
		 * This listener primarily responds to changes in the currently active document.
		 */
		function _setDocumentManagerListeners() {

			// Listen for changes in the current document.
			$( DocumentManager ).on( "currentDocumentChange", function() {

				// If an overview editor currently exists, reload it to reflect the new document.
				// This handles cases where a new editor becomes active or the last editor is closed.
				if ( _overviewEditor !== null ) {
					_reloadOverviewEditor();
				} else {
					// If no overview editor exists, simply enable the ViewManager.
					// The overview editor itself will be reloaded later when the toolbar is clicked.
					ViewManager.enable();
				}
			});
		}

		// --- END OF LISTENERS FUNCTIONS SECTION ---


		// --- API FUNCTIONS SECTION ---
		// This block contains functions exposed as part of the module's public API.

		/**
		 * Initializes the OverviewManager module.
		 * This function sets up all necessary listeners and initializes the ViewManager.
		 */
		function init() {
			// Set up listeners for document and view manager events.
			_setDocumentManagerListeners();
			_setViewManagerListeners();

			// Initialize the ViewManager component.
			ViewManager.init();
		}

		// --- END OF API FUNCTIONS SECTION ---


		// EXPORTED API:
		// The `init` function is exposed as the public interface of this module.
		exports.init = init;

	}
);
// --- End of File ---