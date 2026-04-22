// ------------------------------------------------------------------------
/*
 * Copyright (c) 2023 CodeCloner. All rights reserved.
 *
 * This software is provided under the MIT License.
 * You are free to use, modify, and distribute this code.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 *
 */
// ------------------------------------------------------------------------
// ------------------------------------------------------------------------
/*
 *  PreviewController
 *
 *  Manages the secondary code display for the application.
 *  Ensures the preview panel reflects the primary editor's state.
 *
 */
// ------------------------------------------------------------------------
/*global define, $, console, setTimeout, devEnvironment */
/*jslint plusplus: true, maxlen: 120 */
define(function (obtain, outports, component) {
    'use strict';

    // Load necessary modules
    var DisplayHandler       = obtain("PreviewPanelHandler"),
        SourceEditorManager  = devEnvironment.retrieveUnit("editor/SourceEditorManager"),
        TextEditor           = devEnvironment.retrieveUnit("editor/TextEditor"),
        FileContentManager   = devEnvironment.retrieveUnit("document/ContentManager"),

        _secondaryDisplay = null; // Holds the instance of the auxiliary editor


// ------------------------------------------------------------------------
/*
 *  INTERNAL UTILITY FUNCTIONS
 */
// ------------------------------------------------------------------------
    /*
     * Retrieves the currently active primary code editor instance,
     * returns null if none is available.
     */
    function _fetchActivePrimaryEditor() {

        return SourceEditorManager.getCurrentPrimaryInstance();
    }

    /*
     * Establishes event listeners for the auxiliary editor pane.
     */
    function _configureSecondaryDisplayListeners() {
        $(_secondaryDisplay).on("textCaretMotion", function (eventInfo) {
            // Check if the selected line differs from the main editor's line
            if (eventInfo.target.getCaretPos().line !== _fetchActivePrimaryEditor().getCaretPos().line) {
                // Determine the new insertion point
                var caretLocation = _secondaryDisplay.getCaretPos();

                // Position the main editor's cursor and center its view
                _fetchActivePrimaryEditor().setCaretPos(caretLocation.line, caretLocation.ch, !0, !1);

                // Delay focus return to the primary editor to prevent flicker
                // This addresses an issue where the secondary display might retain focus
                // TODO: Find a more robust solution for focus management!
                setTimeout(function () {
                    _fetchActivePrimaryEditor().focusInstance();
                }, 100);
            }
        });
    }

    /*
     * Configures the auxiliary editor with a specific document and display element.
     * If contentAsset is null, the auxiliary display is deactivated and destroyed.
     */
    function _assignContentToSecondaryDisplay(contentAsset, displayPane) {

        // Proceed only if both content and display panel are provided
        if (contentAsset !== null && displayPane !== void 0) {

            // If the secondary display is not initialized or points to a different document
            if (_secondaryDisplay === null || contentAsset !== _secondaryDisplay.associatedDocument) {

                // If an existing auxiliary display is present, tear it down first
                if (_secondaryDisplay !== null) {
                    _secondaryDisplay.releaseInstance();
                }

                // Instantiate a new auxiliary editor
                _secondaryDisplay = new TextEditor.TextEditor(contentAsset, !1, displayPane.find("#code-preview-surface").get(0));

                // Bind necessary event observers
                _configureSecondaryDisplayListeners();
                // Activate the display panel
                DisplayHandler.activate();
            }
        } else if (contentAsset === null) {
            // If no content, disable and destroy the auxiliary display
            DisplayHandler.deactivate();

            // If an auxiliary editor instance exists, release its resources
            if (_secondaryDisplay !== null) {
                _secondaryDisplay.releaseInstance();
                _secondaryDisplay = null;
            }
        } else {
            console.warn("Unable to configure preview editor; content asset or display panel is missing.");
        }
    }

    /*
     * Updates and reloads the auxiliary editor as necessary.
     */
    function _reinitializeSecondaryDisplay() {
        // Obtain the display panel and the active primary editor
        var displayPane = DisplayHandler.getDisplayPanel();

        // Ensure the display panel is present
        if (displayPane !== null && displayPane !== void 0) {

            var activeEditor = _fetchActivePrimaryEditor();

            // If both the display panel and a primary editor are available
            if (activeEditor !== null) {
                _assignContentToSecondaryDisplay(activeEditor.associatedDocument, displayPane);
            } else {
                console.log("Primary editor not found! Disabling preview.");
                _assignContentToSecondaryDisplay(null, void 0);
            }
        } else {
            console.warn("Preview display element is not available.");
        }
    }

// ------------------------------------------------------------------------
/*
 *  EVENT HANDLER REGISTRATION
 */
// ------------------------------------------------------------------------

    /*
     * Registers all event handlers for the display management system.
     */
    function _setupDisplayHandlerEvents() {

        $(DisplayHandler).on("PanelConnected", function () {
            // If a primary editor is active, enable the display handler
            if (_fetchActivePrimaryEditor() !== null) {
                DisplayHandler.activate();
            }
        });

        $(DisplayHandler).on("ScaleAdjusted", function () {
            _secondaryDisplay.updateView();
        });

        $(DisplayHandler).on("PanelDisplayed", function () {
            _reinitializeSecondaryDisplay();
        });

        $(DisplayHandler).on("PanelConcealed", function () {
            _secondaryDisplay.releaseInstance();
            _secondaryDisplay = null;
        });
    }

    /*
     * Registers event handlers for document lifecycle changes.
     */
    function _setupFileContentObservers() {

        $(FileContentManager).on("activeContentSwitched", function () {

            // If the auxiliary editor exists, reload its content
            // This handles scenarios where a new editor becomes active
            // or the last editor is closed
            if (_secondaryDisplay !== null) {
                _reinitializeSecondaryDisplay();
            } else {
                // Otherwise, simply enable the panel; the editor will load
                // when the preview toolbar button is clicked.
                DisplayHandler.activate();
            }
        });
    }

// ------------------------------------------------------------------------
/*
 *  PUBLIC INTERFACE
 */
// ------------------------------------------------------------------------
    /*
     * Commences the operation of the preview manager.
     */
    function startUp() {
        // Attach all relevant event listeners
        _setupFileContentObservers();
        _setupDisplayHandlerEvents();

        // Perform initial setup of the display manager
        DisplayHandler.initialize();
    }

    // Expose the startup function as part of the module's public API
    outports.startUp = startUp;
});