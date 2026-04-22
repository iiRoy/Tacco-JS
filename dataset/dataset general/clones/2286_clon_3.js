/*
 * Copyright (c) 2023 CodeForge Labs. All rights reserved.
 *
 * This software is provided under the MIT License.
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
/*global define, brackets, $, console, setTimeout */
/*jslint nomen: true, vars: true */
define(function (require, exports, module) {
    'use strict';

    // Module dependencies
    const DisplayCoordinator    = require("OverviewViewManager");
    const CodeEditingService    = brackets.getModule("editor/EditorManager");
    const TextEditor            = brackets.getModule("editor/Editor");
    const FileContentRegistry   = brackets.getModule("document/DocumentManager");

    // Internal state for the preview panel
    let _activeMiniMap = null;

    // --- Auxiliary Functions ---

    /**
     * Retrieves the currently active primary code editor instance.
     * @returns {object|null} The current full editor object, or null if none.
     */
    function fetchCurrentPrimaryEditor() {
        return CodeEditingService.getCurrentFullEditor();
    }

    /**
     * Attaches event handlers to the mini-map instance for user interaction.
     */
    function configureMiniMapEventHandlers() {
        if (!_activeMiniMap) {
            return; // No mini-map to configure
        }

        $(_activeMiniMap).on("cursorActivity", function (eventObj) {
            const primaryEditor = fetchCurrentPrimaryEditor();
            if (!primaryEditor) {
                return; // No primary editor to sync with
            }

            const miniMapCursorPos = _activeMiniMap.getCursorPos();
            const primaryEditorCursorPos = primaryEditor.getCursorPos();

            // Check if the cursor position in the mini-map differs from the primary editor
            if (miniMapCursorPos.line !== primaryEditorCursorPos.line) {
                // Update primary editor's cursor and center its view
                primaryEditor.setCursorPos(miniMapCursorPos.line, miniMapCursorPos.ch, true, false);

                // Re-focus the primary editor after a short delay
                // This ensures the main editor regains input focus after a mini-map interaction.
                const focusDelayMs = 120; // Slightly adjusted delay
                setTimeout(() => primaryEditor.focus(), focusDelayMs);
            }
        });
    }

    /**
     * Manages the state of the mini-map panel based on the provided document and display element.
     * Destroys and disables the mini-map if the document is null.
     * @param {object|null} docRef - The document object to display in the mini-map.
     * @param {jQuery} displayArea - The jQuery object representing the mini-map's display container.
     */
    function updateMiniMapPanel(docRef, displayArea) {

        // Early exit if essential arguments are missing
        if (!displayArea) {
            // console.warn("Cannot update mini-map: display area is undefined.");
            return;
        }

        if (!docRef) { // If no document is provided, disable and destroy the mini-map
            DisplayCoordinator.disable();
            if (_activeMiniMap) {
                _activeMiniMap.destroy();
                _activeMiniMap = null;
            }
            return; // Exit after disabling
        }

        // Proceed if a valid document and display area are available
        const isNewDocument = !_activeMiniMap || (docRef !== _activeMiniMap.document);

        if (isNewDocument) {
            // If an existing mini-map is present, destroy it before creating a new one
            if (_activeMiniMap) {
                _activeMiniMap.destroy();
            }

            // Create a new mini-map editor instance
            const contentContainer = displayArea.find(".code-preview-content-area").get(0);
            if (contentContainer) {
                _activeMiniMap = new TextEditor.TextEditor(docRef, false, contentContainer);

                // Set up event listeners for the newly created mini-map
                configureMiniMapEventHandlers();

                // Activate the display coordinator to show the mini-map
                DisplayCoordinator.enable();
            } else {
                // console.error("Mini-map content container not found within display area.");
                if (_activeMiniMap) {
                    _activeMiniMap.destroy();
                    _activeMiniMap = null;
                }
            }
        }
    }

    /**
     * Synchronizes the mini-map editor with the current primary editor's state.
     */
    function reconcileMiniMapState() {
        const currentDisplayContainer = DisplayCoordinator.getOverview();

        if (!currentDisplayContainer) {
            // console.warn("Mini-map display container is not available.");
            updateMiniMapPanel(null, null); // Ensure mini-map is disabled
            return;
        }

        const primaryEditor = fetchCurrentPrimaryEditor();

        if (primaryEditor) {
            updateMiniMapPanel(primaryEditor.document, currentDisplayContainer);
        } else {
            // console.info("No primary editor active; disabling mini-map.");
            updateMiniMapPanel(null, currentDisplayContainer); // Disable mini-map if no editor
        }
    }

    // --- Event Listener Setup ---

    /**
     * Initializes observers for UI display coordination events.
     */
    function initializeDisplayCoordinationObservers() {

        $(DisplayCoordinator).on("PanelAttached", function () {
            // If a primary editor is present, ensure the mini-map is enabled.
            if (fetchCurrentPrimaryEditor()) {
                DisplayCoordinator.enable();
            }
        });

        $(DisplayCoordinator).on("ScaleAdjusted", function () {
            // Refresh the mini-map's rendering after a zoom operation.
            if (_activeMiniMap) {
                _activeMiniMap.refresh();
            }
        });

        $(DisplayCoordinator).on("PanelVisibilityChanged", function (event, isVisible) {
            if (isVisible) {
                reconcileMiniMapState();
            } else {
                // When the panel becomes hidden, destroy the mini-map instance.
                if (_activeMiniMap) {
                    _activeMiniMap.destroy();
                    _activeMiniMap = null;
                }
            }
        });
    }

    /**
     * Configures event monitors for changes in the document registry.
     */
    function establishDocumentChangeMonitors() {

        $(FileContentRegistry).on("currentDocumentChange", function () {
            const isMiniMapCurrentlyActive = (_activeMiniMap !== null);

            if (isMiniMapCurrentlyActive) {
                // If the mini-map is active, re-evaluate and update its state.
                reconcileMiniMapState();
            } else {
                // If mini-map is not active, just enable the coordinator.
                // The actual mini-map creation will happen when the panel is made visible.
                DisplayCoordinator.enable();
            }
        });
    }

    // --- Public API ---

    /**
     * Boots up the main module, setting up all necessary listeners and initializing components.
     */
    function bootStrapModule() {
        // First, initialize the display coordination system.
        DisplayCoordinator.init();

        // Then, set up all necessary event listeners.
        establishDocumentChangeMonitors();
        initializeDisplayCoordinationObservers();
    }

    // Expose the bootstrap function as the public API.
    exports.init = bootStrapModule;
});