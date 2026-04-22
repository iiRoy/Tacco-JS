(function(JQueryAlias, currentWindow, currentDocument, undefinedAlias) {
    'use strict';

    // Internal registry for custom event handlers, replacing $(document).on
    const eventBroadcaster = (function() {
        const subscriptions = new Map();

        return {
            emit: function(channelName, payloadData) {
                if (subscriptions.has(channelName)) {
                    subscriptions.get(channelName).forEach(callbackAction => {
                        callbackAction(payloadData);
                    });
                }
            },
            subscribe: function(channelName, callbackAction) {
                if (!subscriptions.has(channelName)) {
                    subscriptions.set(channelName, []);
                }
                subscriptions.get(channelName).push(callbackAction);
            },
            unsubscribe: function(channelName, callbackToRemove) {
                if (subscriptions.has(channelName)) {
                    const currentCallbacks = subscriptions.get(channelName);
                    subscriptions.set(channelName, currentCallbacks.filter(cb => cb !== callbackToRemove));
                }
            },
            unsubscribeAll: function(channelName) {
                subscriptions.delete(channelName);
            }
        };
    })();

    // Default configuration for the alert system
    const baseDispenserConfig = {
        visualStyleEngine: 'none',
        closeDelayMillis: 5000
    };

    // Default settings for an individual message component
    const baseNotifierOptions = {
        kind: 'info',
        autoVanish: false,
        includeDismissButton: false,
        completionAction: undefinedAlias,
        componentIdentifier: null // This will be the 'name' from original
    };

    // Definitions for different UI visual styles
    const frameworkVisuals = {
        jqueryui: {
            markup: '<p><span class="ui-icon" style="float: left; margin-right: .3em;"></span>' + '<span class="message-content"></span></p>',
            positiveClass: 'ui-icon-info',
            negativeClass: 'ui-icon-error',
            neutralClass: 'ui-icon-info',
            dismissButton: '<a href="#" class="ui-dialog-titlebar-close ui-corner-all" role="button"><span class="ui-icon ui-icon-closethick" style="float: right">close</span></a>',
            attachmentPoint: 'span:first',
            attachDismissHandler: function(buttonElement) {
                buttonElement.on('click', function() {
                    JQueryAlias(this).parent().parent().fadeOut('slow', function() {
                        JQueryAlias(this).remove();
                    });
                });
            }
        },
        bootstrap: {
            markup: '<div class="alert-box-component"><span class="message-content"></span></div>',
            positiveClass: 'alert-success',
            negativeClass: 'alert-error',
            neutralClass: 'alert-info',
            dismissButton: '<button class="close-btn" data-dismiss="alert">x</button>',
            attachmentPoint: null,
            attachDismissHandler: function(buttonElement) {
                buttonElement.on('click', function() {
                    JQueryAlias(this).parent().fadeOut('slow', function() {
                        JQueryAlias(this).remove();
                    });
                });
            }
        },
        foundation: {
            markup: '<div class="alert-box-component"><span class="message-content"></span></div>',
            positiveClass: 'success',
            negativeClass: 'alert',
            neutralClass: null,
            dismissButton: '<a class="close-btn">x</a>',
            attachmentPoint: null,
            attachDismissHandler: function(buttonElement) {
                buttonElement.on('click', function() {
                    JQueryAlias(this).parent().fadeOut('slow', function() {
                        JQueryAlias(this).remove();
                    });
                });
            }
        },
        envelope: { // Custom framework, renamed to avoid conflict with plugin name
            markup: '<div class="custom_alert_wrap"><span class="message-content">Hello World</span></div>',
            positiveClass: 'success-style',
            negativeClass: 'error-style',
            neutralClass: null,
            dismissButton: JQueryAlias('<div class="close-btn">&times;</div>'), // Direct jQuery object here
            attachmentPoint: null,
            attachDismissHandler: function(buttonElement) {
                buttonElement.on('click', function() {
                    JQueryAlias(this).parent().fadeOut('slow', function() {
                        JQueryAlias(this).remove();
                    });
                });
            }
        }
    };

    // Utility function to build the alert's DOM element
    const buildMessageComponent = (styleIdentifier, messageKind, contentText, shouldAddDismiss) => {
        const styleData = frameworkVisuals[styleIdentifier];
        if (!styleData) {
            currentWindow.console.error(`Unknown visual style identifier: ${styleIdentifier}`);
            return JQueryAlias('<div>'); // Return an empty div to prevent errors
        }

        let alertComponent = JQueryAlias(styleData.markup);
        let targetArea = styleData.attachmentPoint ? alertComponent.find(styleData.attachmentPoint) : alertComponent;

        switch (messageKind) {
            case 'error':
                if (styleData.negativeClass) targetArea.addClass(styleData.negativeClass);
                break;
            case 'info':
                if (styleData.neutralClass) targetArea.addClass(styleData.neutralClass);
                break;
            case 'success': // Default case if not error or info
            default:
                if (styleData.positiveClass) targetArea.addClass(styleData.positiveClass);
                break;
        }

        if (shouldAddDismiss) {
            let dismissBtn = JQueryAlias(styleData.dismissButton).clone();
            if (styleData.attachDismissHandler) {
                styleData.attachDismissHandler(dismissBtn);
            }
            alertComponent.append(dismissBtn);
        }

        alertComponent.find('.message-content').html(contentText);
        return alertComponent;
    };

    // Class to manage message components
    class MessageDispenser {
        constructor(domElement, configOptions) {
            this.targetContainer = domElement;
            this.dispenserConfig = { ...baseDispenserConfig, ...configOptions };
            // Stores references to created alert elements, their timers, and subscribed callbacks
            this.activeNotifiers = new Map();
        }

        // Method to register a new type of message component
        registerNotifier(componentSettings) {
            const settings = { ...baseNotifierOptions, ...componentSettings };

            if (!settings.componentIdentifier) {
                currentWindow.console.error("A unique 'componentIdentifier' is required for message components.");
                return;
            }

            let chosenStyle = 'envelope'; // Default if no specific framework is matched
            if (this.dispenserConfig.visualStyleEngine.toLowerCase().startsWith('jqueryui')) {
                chosenStyle = 'jqueryui';
            } else if (this.dispenserConfig.visualStyleEngine.toLowerCase().startsWith('bootstrap')) {
                chosenStyle = 'bootstrap';
            } else if (this.dispenserConfig.visualStyleEngine.toLowerCase().startsWith('foundation')) {
                chosenStyle = 'foundation';
            }

            const alertComponent = buildMessageComponent(
                chosenStyle,
                settings.kind,
                settings.content,
                settings.includeDismissButton
            );

            alertComponent.hide(); // Initially hidden

            // Store a reference to the alert component and potentially its timeout handle
            this.activeNotifiers.set(settings.componentIdentifier, {
                element: alertComponent,
                timeoutId: null,
                callbackReference: null // To store the specific callback for removal
            });

            // Subscribe to the custom event to display this alert
            const displayHandler = (payloadData) => {
                const currentNotifier = this.activeNotifiers.get(settings.componentIdentifier);
                if (!currentNotifier) return; // Should not happen if correctly registered

                let updatedAlertElement = currentNotifier.element;

                if (payloadData && payloadData.additionalText) {
                    const messageArea = updatedAlertElement.find(".message-content");
                    messageArea.html(messageArea.html() + ' ' + payloadData.additionalText);
                }

                this.targetContainer.append(updatedAlertElement);
                updatedAlertElement.fadeIn('slow');

                if (settings.autoVanish) {
                    const timerHandle = currentWindow.setTimeout(() => {
                        updatedAlertElement.fadeOut('slow', () => {
                            updatedAlertElement.remove();
                            // Clean up this specific notifier from activeNotifiers if it's auto-vanished
                            this.activeNotifiers.delete(settings.componentIdentifier);
                        });
                        currentNotifier.timeoutId = null; // Clear the timer ID
                    }, this.dispenserConfig.closeDelayMillis);
                    currentNotifier.timeoutId = timerHandle; // Store timer ID
                }

                if (settings.completionAction && typeof settings.completionAction === 'function') {
                    settings.completionAction();
                }
            };

            // Store the handler reference so it can be unsubscribed later
            this.activeNotifiers.get(settings.componentIdentifier).callbackReference = displayHandler;
            eventBroadcaster.subscribe(settings.componentIdentifier, displayHandler);
        }

        // Method to remove a message component's registration
        deregisterNotifier(identifier) {
            const currentNotifier = this.activeNotifiers.get(identifier);
            if (currentNotifier) {
                eventBroadcaster.unsubscribe(identifier, currentNotifier.callbackReference);
                if (currentNotifier.timeoutId) {
                    currentWindow.clearTimeout(currentNotifier.timeoutId);
                }
                currentNotifier.element.remove(); // Ensure the element is removed from DOM if still present
                this.activeNotifiers.delete(identifier);
            }
        }

        // Method to trigger an existing message component by its identifier
        triggerNotifier(identifier, extraPayload) {
            eventBroadcaster.emit(identifier, extraPayload);
        }
    }

    // Main plugin entry point
    JQueryAlias.fn.messageFlow = function(firstArg, secondArg, thirdArg) {
        let currentDispenser = this.data('messageDispenserInstance');
        const instanceContainer = this; // Capture 'this' (the jQuery object)

        // Helper to register a single notifier, used by both initialization and 'add' method calls
        const registerSingleNotifier = (notifierSettings) => {
            if (!currentDispenser) {
                currentDispenser = new MessageDispenser(instanceContainer, {});
                instanceContainer.data('messageDispenserInstance', currentDispenser);
            }
            if (typeof notifierSettings === 'object' && notifierSettings.hasOwnProperty('name')) {
                currentDispenser.registerNotifier({
                    ...baseNotifierOptions,
                    kind: notifierSettings.type,
                    content: notifierSettings.message,
                    autoVanish: notifierSettings.autoClose,
                    includeDismissButton: notifierSettings.addCloseButton,
                    completionAction: notifierSettings.callback,
                    componentIdentifier: notifierSettings.name // 'name' is the unique identifier
                });
            } else {
                currentWindow.console.warn("Invalid notifier settings provided for 'add' operation.");
            }
        };

        // Handle string arguments for method calls (e.g., $(...).messageFlow('add', { ... }))
        if (typeof firstArg === 'string') {
            if (!currentDispenser && firstArg !== 'add') {
                currentWindow.console.warn("MessageDispenser not initialized on this element. Call with options/events first, or 'add' to initialize.");
                return this;
            }

            switch (firstArg) {
                case 'add':
                    // Corresponds to original `_methods.add` being called directly
                    registerSingleNotifier(secondArg);
                    break;
                case 'remove':
                    // Corresponds to original `_methods.remove`
                    currentDispenser.deregisterNotifier(secondArg); // 'secondArg' is the identifier/name
                    break;
                case 'trigger': // A new method to explicitly trigger a registered notifier
                    // 'secondArg' is the identifier, 'thirdArg' is the payload
                    currentDispenser.triggerNotifier(secondArg, thirdArg);
                    break;
                default:
                    currentWindow.console.warn(`Unknown method: ${firstArg}`);
                    break;
            }
            return this;
        }

        // Handle initialization or configuration update for multiple notifiers
        let initialConfig = {};
        let messageConfigurations = [];

        if (typeof firstArg === 'object' && !Array.isArray(firstArg)) {
            initialConfig = firstArg;
            if (Array.isArray(secondArg)) {
                messageConfigurations = secondArg;
            }
        } else if (Array.isArray(firstArg)) {
            messageConfigurations = firstArg;
        }

        if (!currentDispenser) {
            currentDispenser = new MessageDispenser(this, initialConfig);
            this.data('messageDispenserInstance', currentDispenser);
        } else {
            // Update configuration if new options are provided
            currentDispenser.dispenserConfig = { ...currentDispenser.dispenserConfig, ...initialConfig };
        }

        // Register all message configurations provided during initialization
        messageConfigurations.forEach(msgConfig => registerSingleNotifier(msgConfig));

        return this;
    };
})(jQuery, window, window.document);