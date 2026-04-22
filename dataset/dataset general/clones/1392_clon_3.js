/*global angular, jQuery */
/**
 * UI Component: modalWrapper
 *
 * Description: Establishes a jQuery UI modal dialog using provided configuration.
 * A dedicated controller will be registered for this modal, named `<panelControllerName>PopUpService`,
 * offering methods like `displayModal` and `hideModal`.
 *
 * Attributes (bindable to scope functions unless otherwise specified):
 * - on-activation: a scope function invoked when the modal is opened.
 * - on-deactivation: a scope function invoked when the modal is closed.
 * - button-styling-map: an object like {'<button label>': '<CSS class>'} for styling specific buttons.
 * - transfer-args-to-scope: boolean, if true, arguments passed to `displayModal` will be mapped to the parent scope.
 * - panel-controller-name: (string) the unique name used to identify the modal's service.
 * - initial-width: (string, optional) sets the initial width of the modal.
 * - initial-height: (string, optional) sets the initial height of the modal.
 * - All standard jQuery UI dialog options are also available as scope attributes.
 *
 * PopUpController Methods:
 * - isActive(): returns true if the modal is currently open.
 * - bringToForeground(): moves the modal to the top of the z-index stack.
 * - querySetting(settingName): retrieves the value of a specific modal option.
 * - updateSetting(settingName, newValue): modifies an option with a new value.
 * - displayModal(activationOptions): executes `onActivation` if defined, then opens the modal and yields a Promise.
 * - hideModal(resultData): closes the modal and resolves the Promise with the provided data.
 */
(function(componentModule) {

    /**
     * @class PopUpController
     * @param {object} promiseHandler - The Angular $q service for promise management.
     */
    class PopUpController {
        constructor(promiseHandler) {
            this.promiseHandler = promiseHandler;
            this.currentDeferred = null; // Stores the deferred object for the current modal operation
            this.modalInstance = null;   // Reference to the jQuery UI dialog instance
            this.openHook = null;        // Callback for modal activation
            this.closeHook = null;       // Callback for modal deactivation
            this.parentContext = null;   // The parent scope where arguments might be mapped
            this.shouldMapArgsToScope = false; // Flag to control argument mapping
            this.isInitialized = false;  // Indicates if the controller has been linked
            this.isBeingDestroyed = false; // Flag to prevent multiple close operations
            this.elementRef = null; // Reference to the directive's element
        }

        /**
         * Checks if the modal dialog is currently active.
         * @returns {boolean} True if the modal is open, false otherwise.
         */
        isActive() {
            return this.modalInstance && this.modalInstance.dialog('isOpen');
        }

        /**
         * Brings the modal dialog to the front.
         */
        bringToForeground() {
            if (this.modalInstance) {
                this.modalInstance.dialog('moveToTop');
            }
        }

        /**
         * Retrieves a specific setting from the modal dialog.
         * @param {string} settingName - The name of the option to retrieve.
         * @returns {*} The value of the specified option.
         */
        querySetting(settingName) {
            return this.modalInstance ? this.modalInstance.dialog("option", settingName) : undefined;
        }

        /**
         * Updates a specific setting of the modal dialog.
         * @param {string} settingName - The name of the option to update.
         * @param {*} newValue - The new value for the option.
         */
        updateSetting(settingName, newValue) {
            if (this.modalInstance) {
                this.modalInstance.dialog("option", settingName, newValue);
            }
        }

        /**
         * Displays the modal dialog.
         * @param {object} [activationOptions={}] - Options to pass to the `openHook` and potentially map to scope.
         * @returns {Promise} A promise that resolves when the modal is closed.
         */
        displayModal(activationOptions = {}) {
            if (this.isActive()) {
                console.warn('Modal already active. Returning existing promise.');
                return this.currentDeferred.promise;
            }

            let activationPromiseChain = this.promiseHandler.when();
            this.currentDeferred = this.promiseHandler.defer();

            if (typeof this.openHook === 'function') {
                const hookResult = this.openHook(activationOptions);
                if (hookResult && typeof hookResult.then === 'function') {
                    activationPromiseChain = hookResult;
                }
            }

            if (this.shouldMapArgsToScope && this.parentContext) {
                for (const propName in activationOptions) {
                    if (Object.prototype.hasOwnProperty.call(activationOptions, propName)) {
                        this.parentContext[propName] = activationOptions[propName];
                    }
                }
            }

            return activationPromiseChain.then(() => {
                if (this.modalInstance) {
                    this.modalInstance.dialog('open');
                } else {
                    console.error('Modal instance not found. Cannot open dialog.');
                    this.currentDeferred.reject('Modal instance not initialized.');
                }
                return this.currentDeferred.promise;
            }).catch(error => {
                console.error('Error during modal activation:', error);
                this.currentDeferred.reject(error);
                return this.promiseHandler.reject(error);
            });
        }

        /**
         * Hides (closes) the modal dialog.
         * @param {*} [resultData] - Data to resolve the promise with.
         */
        hideModal(resultData) {
            if (this.isBeingDestroyed) {
                console.info('Modal is already in the process of being destroyed.');
                return;
            }
            this.isBeingDestroyed = true;

            if (typeof this.closeHook === 'function') {
                this.closeHook(resultData);
            }

            if (this.modalInstance) {
                this.modalInstance.dialog('close');
            } else {
                console.warn('Modal instance not found when trying to close.');
            }

            if (this.currentDeferred) {
                this.currentDeferred.resolve(resultData);
                this.currentDeferred = null;
            }

            // Reset the flag after a short delay to allow for async operations
            setTimeout(() => {
                this.isBeingDestroyed = false;
            }, 50);
        }
    }

    componentModule.directive('modalWrapper', ['dependencyResolver', function ModalPanelDirector(dependencyResolver) {
        'use strict';

        // Collect all standard jQuery UI dialog options
        const standardModalOptions = Object.keys(jQuery.ui.dialog.prototype.options);
        // Define common event callbacks and special options
        const eventCallbacksAndSpecialOptions = [
            'beforeClose', 'close', 'create', 'drag', 'dragStart', 'dragStop', 'focus',
            'open', 'resize', 'resizeStart', 'resizeStop', 'buttons' // 'buttons' is an option but often contains functions
        ];
        // Merge all potential configuration keys for binding
        const mergedConfigKeys = [...standardModalOptions, ...eventCallbacksAndSpecialOptions];

        return {
            // Map all jQuery UI dialog options as parent bindings,
            // then add custom bindings for activation/deactivation hooks, button styles, and argument transfer.
            scope: mergedConfigKeys.reduce((accumulator, key) => {
                accumulator[key] = "&"; // Default to expression binding
                return accumulator;
            }, {
                onActivation: "&",
                onDeactivation: "&",
                buttonStylingMap: "&", // For applying custom CSS classes to buttons
                transferArgsToScope: "&", // For mapping arguments to the parent scope
                initialWidth: "@?", // Optional string attribute for initial width
                initialHeight: "@?" // Optional string attribute for initial height
            }),

            restrict: 'E',          // Element restriction
            replace: true,          // Replace the directive element with the template
            transclude: true,       // Transclude content into the modal
            template: '<div class="modal-container" style="visibility:hidden;"></div>', // Initial hidden container

            /**
             * Compile function for setting up the service dynamically.
             * @param {jQuery} elementNode - The directive's element.
             * @param {object} attributesObj - The element's attributes.
             * @returns {function} The link function.
             */
            compile: function compileDialog(elementNode, attributesObj) {
                const controllerId = attributesObj.panelControllerName + 'PopUpService';

                // Dynamically register the PopUpController service by its generated name
                // This makes it available for injection anywhere by its specific name.
                componentModule.provide.service(controllerId, ['$q', PopUpController]);

                /**
                 * Link function for handling scope, element, and transclusion.
                 * @param {object} componentScope - The directive's isolated scope.
                 * @param {jQuery} dialogElement - The directive's element (now the template).
                 * @param {object} elementAttributes - The element's attributes.
                 * @param {object} controllerInstance - The directive's controller (if defined).
                 * @param {function} contentTranscluder - The transclusion function.
                 */
                return function linkDialog(componentScope, dialogElement, elementAttributes, controllerInstance, contentTranscluder) {
                    const panelController = dependencyResolver.get(controllerId);

                    // Resolve all dialog configuration options from the scope
                    const resolvedConfig = mergedConfigKeys.reduce((configMap, configKey) => {
                        let configValue;
                        // Check if it's a function binding or a direct value binding
                        if (componentScope[configKey] && typeof componentScope[configKey] === 'function') {
                            configValue = componentScope[configKey]();
                        } else if (componentScope[configKey] !== undefined) {
                            configValue = componentScope[configKey];
                        }

                        if (configValue !== undefined) {
                            configMap[configKey] = configValue;

                            // Special handling for the 'buttons' option:
                            // Bind 'close' or 'cancel' actions to the service's hideModal method.
                            if (configKey === 'buttons' && typeof configValue === 'object') {
                                for (const btnActionLabel in configValue) {
                                    if (Object.prototype.hasOwnProperty.call(configValue, btnActionLabel)) {
                                        const lowerCaseLabel = btnActionLabel.toLowerCase();
                                        if (lowerCaseLabel.includes('close') || lowerCaseLabel.includes('cancel')) {
                                            configMap[configKey][btnActionLabel] = panelController.hideModal.bind(panelController);
                                        }
                                    }
                                }
                            }
                        }
                        return configMap;
                    }, {});

                    // Apply initial width and height if provided as attributes
                    if (componentScope.initialWidth) {
                        resolvedConfig.width = componentScope.initialWidth;
                    }
                    if (componentScope.initialHeight) {
                        resolvedConfig.height = componentScope.initialHeight;
                    }

                    // Initialize the jQuery UI dialog
                    const jqueryModal = dialogElement.dialog(resolvedConfig);
                    const actionButtons = jqueryModal.parent().find('.ui-dialog-buttonset button');

                    // Apply custom CSS classes to buttons if specified
                    if (actionButtons.length > 0 && componentScope.buttonStylingMap) {
                        const customButtonStyles = componentScope.buttonStylingMap();
                        if (customButtonStyles && Object.keys(customButtonStyles).length > 0) {
                            for (const [buttonText, className] of Object.entries(customButtonStyles)) {
                                // Find buttons by their text content and add the class
                                actionButtons
                                    .filter((idx, btn) => jQuery(btn).find('.ui-button-text').text().includes(buttonText))
                                    .addClass(className);
                            }
                        }
                    }

                    // Assign the jQuery UI dialog instance and callbacks to the PopUpController
                    panelController.modalInstance = jqueryModal;
                    panelController.openHook = componentScope.onActivation();
                    panelController.closeHook = componentScope.onDeactivation();
                    panelController.parentContext = componentScope.$parent; // Reference to the parent scope
                    panelController.shouldMapArgsToScope = componentScope.transferArgsToScope();
                    panelController.isInitialized = true;
                    panelController.elementRef = dialogElement;

                    // Transclude the content into the dialog element
                    contentTranscluder(componentScope.$parent, (clonedContent) => {
                        dialogElement.append(clonedContent);
                    });

                    // Ensure modal is hidden initially if it's not already
                    if (!panelController.isActive()) {
                        dialogElement.dialog('close'); // Explicitly close to ensure visibility:hidden takes effect
                    }

                    // Clean up on scope destruction
                    componentScope.$on('$destroy', () => {
                        if (panelController.modalInstance && panelController.modalInstance.dialog('instance')) {
                            panelController.modalInstance.dialog('destroy');
                        }
                        panelController.modalInstance = null;
                        panelController.elementRef = null;
                        panelController.isInitialized = false;
                        panelController.currentDeferred = null; // Clear any pending promises
                    });
                };
            }
        };

    }]);
}(angular.module('application.ui.elements')));