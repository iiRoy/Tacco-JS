/*
 * popup-dialog.js v1.0.0, 2024-03-15
 * A versatile JavaScript library for interactive modal dialogs.
 * Developed by CodeCrafter (https://github.com/CodeCrafter, @CodeCrafterJS)
 * Licensed under the Apache 2.0 License
 */
; (function (globalScope, domDocument, undefinedAlias) {
    'use strict';

    // Internal utility methods for DOM manipulation and object handling.
    const CoreUtilities = {
        // Adds a CSS class to an element.
        applyClass: (targetElement, className, completionCallback) => {
            targetElement.classList.add(className);
            if (typeof completionCallback === 'function') {
                setTimeout(completionCallback, 0); // Execute callback asynchronously
            }
        },

        // Removes a CSS class from an element.
        stripClass: (targetElement, className, completionCallback) => {
            targetElement.classList.remove(className);
            if (typeof completionCallback === 'function') {
                setTimeout(completionCallback, 0);
            }
        },

        // Checks if an array contains a specific value.
        elementExistsInArray: (item, collection) => collection.includes(item),

        // Fetches an element by its ID or returns a cloned node.
        retrieveNode: (elementId, shouldClone) => {
            const targetNode = domDocument.getElementById(elementId);
            return targetNode ? (shouldClone ? targetNode.cloneNode(true) : targetNode) : null;
        },

        // Checks if a key exists in an object.
        hasKey: (targetObject, keyName) => Object.prototype.hasOwnProperty.call(targetObject, keyName),

        // Merges properties from source into target, creating a new object.
        mergeObjects: (baseObject, overrides) => {
            const merged = { ...baseObject };
            for (const key in overrides) {
                if (Object.prototype.hasOwnProperty.call(overrides, key)) {
                    if (typeof overrides[key] === 'object' && overrides[key] !== null && !Array.isArray(overrides[key]) && typeof merged[key] === 'object' && merged[key] !== null) {
                        merged[key] = CoreUtilities.mergeObjects(merged[key], overrides[key]);
                    } else {
                        merged[key] = overrides[key];
                    }
                }
            }
            return merged;
        },

        // Valid types of dialogs supported.
        getPermittedDialogTypes: () => ['notification', 'confirmation', 'input_prompt', 'flash_message'],

        // Adds a delay.
        pauseExecution: () => { /* No-op, might be used for visual cues or throttling */ }
    };

    /**
     * Factory class for constructing and managing DOM elements for the dialog.
     * @constructor
     */
    const VisualComponentFactory = function () {
        // Private builder methods for various dialog components.

        // Generates the primary container element for the dialog.
        const constructMainWrapper = function () {
            const mainDiv = domDocument.createElement('div');
            mainDiv.id = 'dialogContainer';
            mainDiv.className = `dialog-wrapper dialog-transition-${this.componentConfig.placement} ${this.componentConfig.dialogKind}`;
            return mainDiv;
        };

        // Creates the header section.
        const constructHeaderSection = function () {
            const headerElem = domDocument.createElement('header');
            headerElem.className = 'dialog-header';
            return headerElem;
        };

        // Builds the main title element.
        const constructPrimaryTitle = function () {
            const h1Elem = domDocument.createElement('h1');
            h1Elem.textContent = this.componentConfig.mainHeading;
            return h1Elem;
        };

        // Builds the secondary title/subtitle element.
        const constructSecondaryTitle = function () {
            const h2Elem = domDocument.createElement('h2');
            h2Elem.textContent = this.componentConfig.subHeading;
            return h2Elem;
        };

        // Creates the content body area.
        const constructContentBody = function () {
            const contentDiv = domDocument.createElement('div');
            contentDiv.className = 'dialog-content';

            if (this.componentConfig.messageBody.startsWith('#')) {
                const sourceElement = CoreUtilities.retrieveNode(this.componentConfig.messageBody.slice(1), true);
                if (sourceElement) {
                    contentDiv.appendChild(sourceElement);
                    this.hasCustomContent = true;
                } else {
                    console.warn(`Dialog: Element with ID "${this.componentConfig.messageBody.slice(1)}" not found.`);
                    contentDiv.textContent = 'Custom content not found.';
                }
            } else {
                contentDiv.textContent = this.componentConfig.messageBody;
            }
            return contentDiv;
        };

        // Generates an input field for prompt dialogs.
        const constructInputField = function () {
            const inputElement = domDocument.createElement('input');
            inputElement.type = 'text';
            inputElement.className = 'dialog-input-field';
            inputElement.placeholder = this.componentConfig.inputPlaceholder || '';
            return inputElement;
        };

        // Creates the footer section for buttons.
        const constructFooterSection = function () {
            const footerElem = domDocument.createElement('footer');
            footerElem.className = 'dialog-footer';
            return footerElem;
        };

        // General button builder.
        const constructActionBtn = function (buttonKey) {
            const buttonElement = domDocument.createElement('button');
            const buttonDefinition = this.componentConfig.actionButtons[buttonKey];

            if (buttonDefinition && typeof buttonDefinition === 'object' && CoreUtilities.hasKey(buttonDefinition, 'attributes')) {
                for (const [attrName, attrValue] of Object.entries(buttonDefinition.attributes)) {
                    if (typeof attrValue !== 'function') { // Ensure attribute value isn't a function
                        buttonElement.setAttribute(attrName, attrValue);
                    }
                }
            } else if (typeof buttonDefinition === 'string') {
                buttonElement.className = 'dialog-btn'; // Default class if only label is provided
            }

            buttonElement.textContent = buttonDefinition && CoreUtilities.hasKey(buttonDefinition, 'label') ? buttonDefinition.label : (buttonDefinition || buttonKey.toLowerCase());
            return buttonElement;
        };

        // Specific OK button builder.
        const constructConfirmButton = function () {
            return constructActionBtn.call(this, 'CONFIRM');
        };

        // Specific Cancel button builder.
        const constructDismissButton = function () {
            return constructActionBtn.call(this, 'DISMISS');
        };

        // Builds the background overlay.
        const constructBackdropOverlay = function () {
            const overlayDiv = domDocument.createElement('div');
            overlayDiv.className = 'dialog-backdrop';
            return overlayDiv;
        };

        // Map for dynamic component creation.
        const componentBuilders = {
            'mainContainer': constructMainWrapper,
            'headerSection': constructHeaderSection,
            'primaryTitle': constructPrimaryTitle,
            'secondaryTitle': constructSecondaryTitle,
            'contentBody': constructContentBody,
            'inputField': constructInputField,
            'footerSection': constructFooterSection,
            'confirmButton': constructConfirmButton,
            'dismissButton': constructDismissButton,
            'backdropOverlay': constructBackdropOverlay
        };

        // Public properties to store created DOM elements and configuration.
        this.mainContainer = null;
        this.headerSection = null;
        this.primaryTitle = null;
        this.secondaryTitle = null;
        this.contentBody = null;
        this.inputField = null;
        this.footerSection = null;
        this.confirmButton = null;
        this.dismissButton = null;
        this.backdropOverlay = null;
        this.componentConfig = null; // Stores the merged options for this instance.
        this.hasCustomContent = false; // Flag for custom HTML content.

        /**
         * Sets the configuration options for the factory.
         * @param {Object} options - User-provided settings.
         */
        this.setConfig = function (options) {
            if (!options || typeof options !== 'object') {
                console.error("Dialog configuration must be an object.");
                this.componentConfig = {}; // Set to empty object to prevent errors
                return;
            }
            this.componentConfig = options;
        };

        /**
         * Creates a specific component based on its type.
         * @param {string} type - The type of component to create (e.g., 'mainContainer').
         * @returns {HTMLElement | null} The created HTML element or null if type is invalid.
         */
        this.createVisualComponent = function (type) {
            const builderMethod = componentBuilders[type];
            if (typeof builderMethod === 'function') {
                const element = builderMethod.call(this);
                // Assign to the corresponding public property.
                this[type] = element;
                return element;
            }
            console.warn(`Dialog: Unknown component type requested: ${type}`);
            return null;
        };
    };

    // Global queue for managing dialog instances.
    const dialogRegistry = [];
    let isProcessingDialog = false; // Mutex to prevent multiple dialogs from activating simultaneously.

    /**
     * Main Dialog class. Manages the lifecycle and display of dialogs.
     * @constructor
     */
    const Dialog = function () {

        /** @private */
        const
            // Default settings for all dialog types.
            defaultSettings = {
                dialogKind: 'notification', // 'notification', 'confirmation', 'input_prompt', 'flash_message'
                mainHeading: '',
                subHeading: '',
                messageBody: '',
                actionButtons: {
                    CONFIRM: {
                        label: 'OK',
                        attributes: {
                            id: 'btn_confirm',
                            'class': 'dialog-btn dialog-btn-confirm'
                        }
                    },
                    DISMISS: {
                        label: 'Cancel',
                        attributes: {
                            id: 'btn_dismiss',
                            'class': 'dialog-btn dialog-btn-dismiss'
                        }
                    }
                },
                showBackdrop: true,
                displayHeader: true,
                animationEffect: 'fade-in', // 'fade-in', 'slide-up', 'zoom-in'
                initialDelay: 0, // Delay before showing the dialog in ms
                placement: 'center', // 'top', 'bottom', 'center', 'custom'
                customX: '50%',
                customY: '50%',
                autoCloseOnClick: false, // For flash messages
                durationMs: 2500, // For flash messages
                onSuccess: null,
                onDismiss: null,
                onCompletion: null,
                inputPlaceholder: ''
            },

            /*
              Constructs and arranges the dialog's visual components based on options.
              @param  {Object} userOptions - User-provided configuration.
              @return {Object} The VisualComponentFactory instance used for construction.
            */
            buildDisplay = function (userOptions) {
                const currentInstance = this;
                const visualFactory = currentInstance.componentFactory;

                // Deep merge user options with defaults.
                const finalConfig = CoreUtilities.mergeObjects(defaultSettings, userOptions);

                // Set internal config for the factory.
                visualFactory.setConfig(finalConfig);

                // For 'notification' dialogs, the dismiss button is not needed.
                if (visualFactory.componentConfig.dialogKind === 'notification') {
                    visualFactory.componentConfig.actionButtons.DISMISS = false;
                }

                // Apply specific settings for 'flash_message' type.
                applyFlashMessageStyling(visualFactory, userOptions);

                // Create main wrapper first.
                visualFactory.createVisualComponent('mainContainer');

                // Conditionally create header components.
                if (visualFactory.componentConfig.displayHeader !== false) {
                    visualFactory.createVisualComponent('headerSection');
                    visualFactory.createVisualComponent('primaryTitle');

                    if (visualFactory.componentConfig.subHeading !== '') {
                        visualFactory.createVisualComponent('secondaryTitle');
                    }
                }

                // Create the body and input field if it's a prompt.
                visualFactory.createVisualComponent('contentBody');
                if (visualFactory.componentConfig.dialogKind === 'input_prompt') {
                    visualFactory.createVisualComponent('inputField');
                }

                // Always create the backdrop, visibility controlled by CSS/options.
                visualFactory.createVisualComponent('backdropOverlay');

                // Create footer and buttons if not explicitly disabled by userOptions.
                // Note: We check userOptions here because finalConfig might have merged in defaults for buttons.
                if (userOptions.actionButtons !== false) {
                    visualFactory.createVisualComponent('footerSection');
                    visualFactory.createVisualComponent('confirmButton');

                    if (visualFactory.componentConfig.actionButtons.DISMISS !== false) {
                        visualFactory.createVisualComponent('dismissButton');
                    }
                }

                // Assemble the created elements into the DOM structure.
                assembleComponents(visualFactory);
                return visualFactory; // Return the factory for further access
            },

            /* Assembles the created DOM elements into a hierarchical structure. */
            assembleComponents = function (factory) {
                const mainContainer = factory.mainContainer;
                if (!mainContainer) {
                    console.error("Dialog: Main container not created.");
                    return;
                }

                domDocument.body.appendChild(mainContainer);

                // Helper to append child if it exists.
                const appendIfExists = (parent, child) => {
                    if (child) {
                        parent.appendChild(child);
                    }
                };

                // Append header components.
                if (factory.headerSection) {
                    appendIfExists(mainContainer, factory.headerSection);
                    appendIfExists(factory.headerSection, factory.primaryTitle);
                    appendIfExists(factory.headerSection, factory.secondaryTitle);
                }

                // Append content body and input.
                appendIfExists(mainContainer, factory.contentBody);
                if (factory.inputField) {
                    appendIfExists(factory.contentBody, factory.inputField); // Input goes inside body
                }

                // Append footer and buttons.
                if (factory.footerSection) {
                    appendIfExists(mainContainer, factory.footerSection);
                    appendIfExists(factory.footerSection, factory.confirmButton);
                    appendIfExists(factory.footerSection, factory.dismissButton);
                }

                // Attach event listeners to buttons.
                if (factory.confirmButton) {
                    registerEventHandler(factory.confirmButton, 'click', () => {
                        triggerCallbacks(true);
                    });
                }

                if (factory.dismissButton) {
                    registerEventHandler(factory.dismissButton, 'click', () => {
                        triggerCallbacks(false);
                    });
                }

                // Special handling for flash messages (click anywhere to dismiss).
                if (factory.componentConfig.dialogKind === 'flash_message') {
                    registerEventHandler(mainContainer, 'click', () => {
                        triggerCallbacks(true);
                    });
                }

                // Auto-focus input field if present and not on a mobile device.
                if (factory.inputField && !/Mobi|Android/i.test(navigator.userAgent)) {
                    factory.inputField.focus();
                }
            },

            // Applies specific configuration for 'flash_message' dialogs.
            applyFlashMessageStyling = function (factory, originalOptions) {
                if (factory.componentConfig.dialogKind === 'flash_message') {
                    factory.componentConfig.showBackdrop = false;
                    factory.componentConfig.displayHeader = false;
                    factory.componentConfig.placement = 'bottom'; // Default flash messages to bottom
                    originalOptions.actionButtons = false; // Ensure no buttons are created
                    factory.componentConfig.autoCloseOnClick = true; // Flash messages autoclose on click
                }
            },

            // Triggers the appropriate success/dismiss/completion callbacks.
            triggerCallbacks = function (status) {
                const currentDialog = getCurrentContext().dialogReference;
                const config = currentDialog.componentFactory.componentConfig;

                currentDialog.hide(); // Immediately hide the dialog.

                if (status && config.onSuccess !== null) {
                    onSuccessTrigger(currentDialog);
                } else if (!status && config.onDismiss !== null) {
                    config.onDismiss.apply(this);
                }

                if (config.onCompletion !== null) {
                    onCompletionTrigger(currentDialog, status);
                }
            },

            // Handles success callback logic, including fetching prompt input or custom data.
            onSuccessTrigger = function (dialogInstance) {
                const config = dialogInstance.componentFactory.componentConfig;
                if (config.dialogKind === 'input_prompt') {
                    config.onSuccess.call(this, dialogInstance.componentFactory.inputField.value);
                } else if (dialogInstance.componentFactory.hasCustomContent) { // Check custom content flag
                    config.onSuccess.call(this, extractFormData(dialogInstance.componentFactory.mainContainer));
                } else {
                    config.onSuccess.apply(this);
                }
            },

            // Handles completion callback logic, similar to success but always fires.
            onCompletionTrigger = function (dialogInstance, status) {
                const config = dialogInstance.componentFactory.componentConfig;
                if (config.dialogKind === 'input_prompt') {
                    config.onCompletion.call(this, status, dialogInstance.componentFactory.inputField.value);
                } else if (dialogInstance.componentFactory.hasCustomContent) {
                    config.onCompletion.call(this, status, extractFormData(dialogInstance.componentFactory.mainContainer));
                } else {
                    config.onCompletion.call(this, status);
                }
            },

            // Extracts data from form elements within the dialog's custom content.
            extractFormData = function (containerElement) {
                const formElements = containerElement.querySelectorAll('input, textarea, select');
                const collectedData = {};

                if (formElements.length > 0) {
                    Array.from(formElements).forEach((input, index) => {
                        const inputName = input.name || `field_${index}`; // Use name attribute or a generic index
                        if (input.type === 'checkbox' || input.type === 'radio') {
                            collectedData[inputName] = input.checked;
                        } else {
                            collectedData[inputName] = input.value;
                        }
                    });
                }
                return collectedData;
            },

            /* Initiates the dialog's entry animation. */
            initiateAnimation = function (dialogInstance) {
                CoreUtilities.pauseExecution(); // Placeholder for potential throttling or visual pause.
                if (dialogInstance && dialogInstance.componentFactory) {
                    const factory = dialogInstance.componentFactory;

                    // Delay before animation starts.
                    setTimeout(() => {
                        // Insert backdrop before the main dialog.
                        if (factory.componentConfig.showBackdrop) {
                            domDocument.body.insertBefore(factory.backdropOverlay, factory.mainContainer);
                        } else {
                            // If overlay is not shown, hide it visually.
                            factory.backdropOverlay.style.visibility = 'hidden';
                        }

                        // Apply the animation class.
                        CoreUtilities.applyClass(factory.mainContainer, `dialog-effect-${factory.componentConfig.animationEffect}`, () => {
                            // After initial class addition, remove the starting position class
                            // This triggers the CSS transition from start position to final.
                            setTimeout(() => {
                                CoreUtilities.stripClass(factory.mainContainer, `dialog-transition-${factory.componentConfig.placement}`);
                            }, 50); // Small delay to ensure class is applied before removal
                        });

                        // For flash messages, set position and auto-hide after duration.
                        if (factory.componentConfig.dialogKind === 'flash_message') {
                            factory.mainContainer.style.left = factory.componentConfig.customX;
                            factory.mainContainer.style.top = factory.componentConfig.customY;
                            setTimeout(() => {
                                getCurrentContext().dialogReference.hide();
                            }, factory.componentConfig.durationMs);
                        }

                    }, factory.componentConfig.initialDelay);
                }
            },

            /*
              Registers an event listener on a DOM element.
              @param {HTMLElement} element - The DOM element.
              @param {string} eventType - The event name (e.g., 'click').
              @param {Function} callback - The function to execute.
             */
            registerEventHandler = function (element, eventType, callback) {
                if (!element) return; // Guard clause for null elements.
                if (element.addEventListener) {
                    element.addEventListener(eventType, callback, false);
                } else if (element.attachEvent) { // Legacy IE support.
                    element.attachEvent("on" + eventType, callback);
                }
            },

            // Processes the dialog queue and initiates display if not locked.
            processQueue = function () {
                if (!isProcessingDialog) {
                    isProcessingDialog = true; // Acquire lock.
                    const context = getCurrentContext();
                    if (context && context.dialogReference && context.dialogOptions) {
                        const factory = buildDisplay.call(context.dialogReference, context.dialogOptions);
                        initiateAnimation(context.dialogReference);
                        return factory;
                    }
                }
                return null; // Return null if locked or no context.
            },

            /*
              Provides access to the current dialog instance from the queue.
            */
            getCurrentContext = function () {
                if (dialogRegistry.length === 0) {
                    return null;
                }
                // Always work with the first item in the queue.
                return dialogRegistry[0];
            };

        // Public interface of the Dialog class.
        return {
            /** @public */
            componentFactory: new VisualComponentFactory(),

            /**
             * Displays a dialog with the given options.
             * @param  {Object}   options  User-defined options for the dialog.
             * @return {Promise<Object>} A promise that resolves with the dialog instance on success/dismiss,
             *                           or rejects if dialog cannot be shown.
             */
            display: function (options) {
                const self = this;

                // Basic input validation for options.
                if (!options || typeof options !== 'object') {
                    console.error("Dialog.display() requires an options object.");
                    return Promise.reject(new Error("Invalid dialog options."));
                }

                // Ensure a valid dialog type is specified, default to 'notification'.
                if (!options.dialogKind || !CoreUtilities.elementExistsInArray(options.dialogKind, CoreUtilities.getPermittedDialogTypes())) {
                    options.dialogKind = 'notification';
                }

                return new Promise((resolve, reject) => {
                    // Push a local copy of Dialog instance and options to the queue.
                    dialogRegistry.push({
                        dialogReference: self,
                        dialogOptions: options,
                        resolvePromise: resolve, // Store promise resolvers for later use
                        rejectPromise: reject
                    });

                    // Attempt to process the dialog.
                    const factoryInstance = processQueue();
                    if (!factoryInstance) {
                        // If processQueue returns null, it means it's locked or invalid context.
                        // Remove from queue and reject.
                        const removed = dialogRegistry.shift();
                        if (removed && removed.rejectPromise) {
                            removed.rejectPromise(new Error("Dialog display locked or failed to initialize."));
                        }
                        return;
                    }
                    this.componentFactory = factoryInstance; // Update the public factory reference.
                });
            },

            /* Hides and removes the currently displayed dialog. */
            hide: function () {
                const currentDialog = this;
                const factory = currentDialog.componentFactory;
                const config = factory.componentConfig;

                if (!factory.mainContainer || !factory.backdropOverlay) {
                    // Dialog already hidden or not fully initialized.
                    return;
                }

                // Add the class for the exit animation.
                CoreUtilities.applyClass(factory.mainContainer, `dialog-transition-${config.placement}`, () => {
                    // Give time for the exit animation to complete.
                    setTimeout(() => {
                        try {
                            // Remove elements from the DOM.
                            if (domDocument.body.contains(factory.backdropOverlay)) {
                                domDocument.body.removeChild(factory.backdropOverlay);
                            }
                            if (domDocument.body.contains(factory.mainContainer)) {
                                domDocument.body.removeChild(factory.mainContainer);
                            }
                        } catch (e) {
                            console.warn("Dialog: Error removing elements from DOM, might have been removed already.", e);
                        } finally {
                            // Clean up the queue.
                            if (dialogRegistry.length > 0) {
                                const completedContext = dialogRegistry.shift(); // Remove the first (current) item.
                                if (completedContext && completedContext.resolvePromise) {
                                    // Resolve the promise associated with the dialog that just completed.
                                    completedContext.resolvePromise(completedContext.dialogReference);
                                }
                            }

                            isProcessingDialog = false; // Release the lock.
                            CoreUtilities.pauseExecution(); // For any post-cleanup or throttling.

                            // If there are more dialogs in the queue, process the next one.
                            if (dialogRegistry.length > 0) {
                                processQueue();
                            }
                        }
                    }, 400); // Matches typical CSS transition duration.
                });
            }
        };
    };

    // Expose Dialog constructor to the global scope.
    globalScope.Dialog = Dialog;

})(window, document);