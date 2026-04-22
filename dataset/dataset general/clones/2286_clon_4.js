/*global define, brackets, $, console, setTimeout */
/*jslint nomen: true, vars: true */
define(function (req, exp, mod) {
    'use strict';

    // Local aliases for required modules and global utilities, avoiding original internal names
    const InterfaceOverseer = req("OverviewViewManager");
    const PrimaryDisplayManager = brackets.getModule("editor/EditorManager");
    const DisplayUnit = brackets.getModule("editor/Editor");
    const SourceDataGate = brackets.getModule("document/DocumentManager");
    const JqueryAdapter = $;

    /**
     * Manages the lifecycle and synchronization of an auxiliary code display.
     * This class offers a distinct implementation from the original OverviewManager.
     */
    class CodeDisplayController {
        #viewHandler;
        #mainDisplayProvider;
        #displayConstructor;
        #sourceMediator;
        #eventBus;

        #auxiliaryDisplayInstance = null; // Replaces _overviewEditor

        /**
         * Constructs the controller with necessary dependencies.
         * @param {object} viewHandlerModule - The module for managing the display view.
         * @param {object} mainDisplayModule - The module providing access to the primary editor.
         * @param {object} displayModule - The module containing the Editor class.
         * @param {object} sourceModule - The module managing documents.
         * @param {function} eventUtility - A utility for event binding (e.g., jQuery).
         */
        constructor(viewHandlerModule, mainDisplayModule, displayModule, sourceModule, eventUtility) {
            this.#viewHandler = viewHandlerModule;
            this.#mainDisplayProvider = mainDisplayModule;
            this.#displayConstructor = displayModule.Editor;
            this.#sourceMediator = sourceModule;
            this.#eventBus = eventUtility;

            // Initialize the view handler as part of the controller setup
            this.#viewHandler.init();
        }

        /**
         * Retrieves the currently active primary editor instance.
         * @returns {object|null} The primary editor object or null if none is active.
         */
        #fetchMainDisplay() {
            return this.#mainDisplayProvider.getCurrentFullEditor();
        }

        /**
         * Configures event listeners for the auxiliary display instance.
         * This ensures cursor activity in the auxiliary display reflects in the primary.
         */
        #configureAuxiliaryDisplayEvents() {
            this.#eventBus(this.#auxiliaryDisplayInstance).on("cursorActivity", (eventObject) => {
                const currentAuxPos = eventObject.target.getCursorPos();
                const primaryDisplay = this.#fetchMainDisplay();

                // Only proceed if a primary display exists and cursor positions differ
                if (primaryDisplay && currentAuxPos.line !== primaryDisplay.getCursorPos().line) {
                    primaryDisplay.setCursorPos(currentAuxPos.line, currentAuxPos.ch, true, false);

                    // Defer focus return to the primary display to avoid immediate re-focus issues
                    setTimeout(() => {
                        primaryDisplay.focus();
                    }, 100);
                }
            });
        }

        /**
         * Manages the state and content of the auxiliary display.
         * It either creates, updates, or destroys the auxiliary display based on input.
         * @param {object|null} sourceDocument - The document to display in the auxiliary view, or null to disable.
         * @param {object} displayMountPoint - The jQuery object for the DOM element where the auxiliary display should be mounted.
         */
        #manageAuxiliaryDisplayContent(sourceDocument, displayMountPoint) {
            const isDocumentProvided = sourceDocument !== null;
            const isMountPointReady = displayMountPoint !== undefined && displayMountPoint !== null;
            const isAuxiliaryPresent = this.#auxiliaryDisplayInstance !== null;
            const isSameDocument = isAuxiliaryPresent && sourceDocument === this.#auxiliaryDisplayInstance.document;

            // Using a dispatcher pattern to handle distinct states and actions
            const actionDispatcher = new Map([
                ['disableAndClear', () => {
                    this.#viewHandler.disable();
                    if (isAuxiliaryPresent) {
                        this.#auxiliaryDisplayInstance.destroy();
                        this.#auxiliaryDisplayInstance = null;
                    }
                }],
                ['setupNewDisplay', () => {
                    if (isAuxiliaryPresent) { // Destroy existing if document is different
                        this.#auxiliaryDisplayInstance.destroy();
                    }
                    this.#auxiliaryDisplayInstance = new this.#displayConstructor(
                        sourceDocument,
                        false,
                        displayMountPoint.find("#code-overview-content").get(0)
                    );
                    this.#configureAuxiliaryDisplayEvents();
                    this.#viewHandler.enable();
                }],
                ['reportSetupIssue', () => console.error("Auxiliary display setup failed: invalid source document or mount point.")],
                ['maintainCurrentState', () => {}] // No operation needed if already configured correctly
            ]);

            let actionKey;
            if (!isDocumentProvided) {
                actionKey = 'disableAndClear';
            } else if (!isMountPointReady) {
                actionKey = 'reportSetupIssue';
            } else if (!isAuxiliaryPresent || !isSameDocument) {
                actionKey = 'setupNewDisplay';
            } else {
                actionKey = 'maintainCurrentState';
            }

            actionDispatcher.get(actionKey)();
        }

        /**
         * Forces a refresh or re-initialization of the auxiliary display based on the current primary editor.
         */
        #refreshAuxiliaryDisplay() {
            const currentMountPoint = this.#viewHandler.getOverview();

            if (currentMountPoint) {
                const activeMainDisplay = this.#fetchMainDisplay();
                if (activeMainDisplay) {
                    this.#manageAuxiliaryDisplayContent(activeMainDisplay.document, currentMountPoint);
                } else {
                    console.error("No primary editor found to populate auxiliary display.");
                    // If no primary editor, ensure auxiliary display is disabled
                    this.#manageAuxiliaryDisplayContent(null, undefined);
                }
            } else {
                console.error("Auxiliary display container not detected.");
            }
        }

        /**
         * Attaches event listeners to the view management system.
         */
        #attachViewManagementEvents() {
            this.#eventBus(this.#viewHandler).on("OverviewAttached", () => {
                if (this.#fetchMainDisplay()) {
                    this.#viewHandler.enable();
                }
            });

            this.#eventBus(this.#viewHandler).on("ZoomApplied", () => {
                if (this.#auxiliaryDisplayInstance) {
                    this.#auxiliaryDisplayInstance.refresh();
                }
            });

            this.#eventBus(this.#viewHandler).on("OverviewVisible", () => {
                this.#refreshAuxiliaryDisplay();
            });

            this.#eventBus(this.#viewHandler).on("OverviewHidden", () => {
                if (this.#auxiliaryDisplayInstance) {
                    this.#auxiliaryDisplayInstance.destroy();
                    this.#auxiliaryDisplayInstance = null;
                }
            });
        }

        /**
         * Attaches event listeners to the document management system.
         */
        #attachDocumentManagementEvents() {
            this.#eventBus(this.#sourceMediator).on("currentDocumentChange", () => {
                // Conditionally execute refresh or enable based on auxiliary display's existence
                (this.#auxiliaryDisplayInstance ?
                    () => this.#refreshAuxiliaryDisplay() :
                    () => this.#viewHandler.enable())();
            });
        }

        /**
         * The public entry point to initialize the entire display system.
         */
        initializeDisplaySystem() {
            this.#attachDocumentManagementEvents();
            this.#attachViewManagementEvents();
        }
    }

    /**
     * Factory function to create and expose the initialization method for the display system.
     * This mimics the module export pattern of the original.
     * @param {object} overviewViewManager - Dependency.
     * @param {object} editorManager - Dependency.
     * @param {object} editorModule - Dependency.
     * @param {object} documentManager - Dependency.
     * @param {function} jQuery - Dependency.
     * @returns {object} An object with a 'startSystem' function.
     */
    function createOverviewSystem(overviewViewManager, editorManager, editorModule, documentManager, jQuery) {
        const controller = new CodeDisplayController(
            overviewViewManager,
            editorManager,
            editorModule,
            documentManager,
            jQuery
        );

        return {
            startSystem: () => controller.initializeDisplaySystem()
        };
    }

    // The module's public interface
    exp.init = createOverviewSystem(
        InterfaceOverseer,
        PrimaryDisplayManager,
        DisplayUnit,
        SourceDataGate,
        JqueryAdapter
    ).startSystem;
});