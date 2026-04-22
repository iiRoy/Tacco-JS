/* This is a global variable for the Angular application. */
/**
 * UI Component: modalComponent
 *
 * Outline: Constructs a jQuery UI modal window using provided configuration. A dedicated
 * service will be established for the modal, named <agentIdentifier>ModalWindowAgent,
 * offering methods like launchWindow and terminateWindow.
 *
 * Attributes accepted:
 * - on-window-open: A function within the scope, invoked when the modal is displayed.
 * - on-window-close: A function within the scope, invoked when the modal is dismissed.
 * - action-button-styles: A mapping of {'<button label>': '<CSS class>'} for any buttons present.
 * - modal-name: The unique identifier for the modal agent service.
 * - All standard jQuery UI modal options will be available as attributes on the component's scope.
 *
 * Service Capabilities:
 * - isWindowOpen: Checks if the modal is currently visible.
 * - bringToFront: Moves the modal to the topmost layer.
 * - retrieveSetting(settingKey): Fetches the current value of a specified option.
 * - updateSetting(settingKey, newValue): Modifies an option to a new value.
 * - launchWindow(configParams): Executes onWindowOpen if available, then displays the modal and returns a Promise.
 * - terminateWindow(payload): Closes the modal and resolves the Promise with the given payload.
 */
(function(moduleInstance) {

    // Defines the core logic for the modal window management service.
    function ModalWindowAgent(promiseService) {
        this.promiseHandler = promiseService; // Dependency for promise handling
        this.deferredResult = null;          // Stores the deferred object for async operations
        this.modalElement = null;            // Reference to the actual jQuery UI modal instance
        this.onWindowOpen = null;            // Callback to execute when the modal opens
        this.onWindowClose = null;           // Callback to execute when the modal closes
    }

    ModalWindowAgent.prototype = {

        // Determines if the current modal is displayed.
        isWindowOpen: function() {
            return this.modalElement.dialog('isOpen');
        },

        // Positions the modal at the highest z-index.
        bringToFront: function() {
            this.modalElement.dialog('moveToTop');
        },

        // Obtains a specific configuration setting for the modal.
        retrieveSetting: function(settingKey) {
            return this.modalElement.dialog("option", settingKey);
        },

        // Modifies an existing configuration setting for the modal.
        updateSetting: function(settingKey, newValue) {
            this.modalElement.dialog("option", settingKey, newValue);
        },

        // Initiates the display of the modal window.
        launchWindow: function(configParams) {
            var openDeferred = null, // Deferred object for the pre-open callback
                currentInstance = this; // Reference to the service instance
            this.deferredResult = this.promiseHandler.defer(); // Create a new deferred for this open cycle

            if (this.onWindowOpen) {
                openDeferred = this.onWindowOpen(configParams); // Invoke the custom open callback
            }
            if (this.passArgsToScope === true) {
                Object.keys(configParams).forEach(function (propName) {
                    this.viewScope[propName] = configParams[propName]; // Transfer arguments to the scope
                }, this);
            }
            // Wait for any pre-open operations to complete, then display the modal.
            return (openDeferred || this.promiseHandler.when()).then(function() {
                currentInstance.modalElement.dialog('open'); // Show the jQuery UI modal
                return currentInstance.deferredResult.promise; // Return the promise for modal completion
            });
        },

        // Terminates the modal window's display.
        terminateWindow: function(payload) {
            if (this.onWindowClose) {
                this.onWindowClose(payload); // Execute the custom close callback
            }
            this.modalElement.dialog('close'); // Hide the jQuery UI modal
            this.deferredResult.resolve(payload); // Resolve the promise with the closing payload
        }
    };

    // Registers the directive with the Angular module.
    moduleInstance.directive('modalComponent', ['dependencyInjector', function ModalComponentDirective(dependencyInjector) {
        'use strict'; // Enforce strict mode for cleaner code

        // Gather all default and extended options for jQuery UI dialogs.
        var allModalSettings = Object.keys(jQuery.ui.dialog.prototype.settings)
            .concat(['beforeClose','close','create','drag','dragStart','dragStop','focus','open','resize','resizeStart','resizeStop']);

        return {

            // Define scope bindings for component attributes.
            // All jQuery UI dialog options are bound as parent functions.
            // Additionally, custom callbacks and button styling are bound.
            scope: allModalSettings.reduce(function(accumulator, item) {
                accumulator[item] = "&"; // Bind each setting as a function call
                return accumulator;
            }, {
                onWindowOpen: "&",       // Custom callback for modal opening
                onWindowClose: "&",      // Custom callback for modal closing
                actionButtonStyles: "&", // Styling map for dialog buttons
                passArgsToScope: "&"     // Flag to pass arguments to parent scope
            }),

            restriction: 'E', // Element-only restriction for the component

            replaceElement: true, // Replace the custom tag with the template content

            embedContent: true, // Allow content inside the component to be transcluded

            componentTemplate: '<div style="display:none"></div>', // The base element for the modal

            // The compilation function, executed once per directive type.
            compilationFunction: function(elementNode, attributesObject) {
                var agentIdentifier = attributesObject.modalName + 'ModalWindowAgent';

                // Dynamically register the modal agent service during compilation
                // so it can be injected by its generated name.
                moduleInstance.provide.service(agentIdentifier, ['promiseService', ModalWindowAgent]);

                // The linking function, executed once per instance of the directive.
                return function(viewScope, elementNode, attributesObject, controllerInstance, embedContentFn) {
                    var modalAgent = dependencyInjector.get(agentIdentifier), // Retrieve the specific modal agent
                        windowOptions = allModalSettings.reduce(function(accumulator, item) {
                            // Evaluate each attribute from the component's scope.
                            // If a value exists, add it to the jQuery UI dialog options.
                            var optionValue = viewScope[item] ? viewScope[item]() : undefined;
                            if (optionValue !== undefined) {
                                accumulator[item] = optionValue;
                                // Special handling for 'buttons' option to bind close functionality.
                                if (item === 'buttons') {
                                    Object.keys(optionValue).forEach(function(actionButtonName) {
                                        if (optionValue[actionButtonName] === 'shut') { // Check for a 'shut' action
                                            optionValue[actionButtonName] = modalAgent.terminateWindow.bind(modalAgent); // Bind close method
                                        }
                                    });
                                }
                            }
                            return accumulator;
                        }, {}),
                        constructedModal = elementNode.dialog(windowOptions), // Initialize the jQuery UI dialog
                        actionButtons = constructedModal.parent().find('.ui-dialog-buttonset button'); // Find generated buttons

                    // Apply any custom CSS classes to the modal's buttons if specified.
                    if (actionButtons.length > 0 && viewScope.actionButtonStyles) {
                        var appliedButtonStyles = viewScope.actionButtonStyles();
                        if (appliedButtonStyles) {
                            Object.keys(appliedButtonStyles).forEach(function (styleKey) {
                                actionButtons
                                    .find('.ui-button-text:contains("' + styleKey + '")')
                                    .parent()
                                    .addClass(appliedButtonStyles[styleKey]);
                            });
                        }
                    }

                    modalAgent.modalElement = constructedModal;     // Store the jQuery UI modal instance
                    modalAgent.onWindowOpen = viewScope.onWindowOpen(); // Store the open callback
                    modalAgent.onWindowClose = viewScope.onWindowClose(); // Store the close callback
                    modalAgent.viewScope = viewScope.$parent;       // Reference to the parent scope
                    modalAgent.passArgsToScope = viewScope.passArgsToScope(); // Store the argument passing flag

                    // Transclude the component's content into the modal element.
                    embedContentFn(viewScope.$parent, function(clonedContent) {
                        elementNode.append(clonedContent);
                    });

                };
            }
        };

    }]);
}(angular.module('ng.jQueryIntegration')));