document.observe('dom:ready', function () {
    // Primary application namespace for system-wide utilities.
    if (!window.AppUtilities) {
        window.AppUtilities = {};
    }

    /**
     * Module for managing and displaying transient or persistent system alerts.
     * Implemented as a self-executing anonymous function to encapsulate scope.
     */
    window.AppUtilities.AlertService = (function () {

        // Default configuration for individual notification items.
        // These can be overridden per alert.
        var notificationDefaults = {
            titleText: '&nbsp;',        // Header for the notification.
            fadeDurationIn: 0.25,       // Speed (seconds) for notification to appear.
            fadeDurationOut: 0.4,       // Speed (seconds) for notification to disappear.
            exitDirection: { y: 25 },   // Direction and distance for exit animation.
            displayTime: 6,             // How long (seconds) the notification stays visible if not sticky.
            isSticky: false,            // If true, notification requires manual dismissal.
            baseCssClass: "app-notification", // Base class for the notification wrapper.
            // Callbacks for life cycle events.
            onCreated: null,
            onDestroyed: null
        };

        // Default configuration for the main alert container (the "growler").
        var containerSettings = {
            position: "bottomRight", // Placement on the screen.
            containerWidth: "480px", // Width of the notification container.
            zIndexLevel: "55000"     // Ensures alerts are on top.
        };

        /**
         * Initiates the dismissal process for a given notification element.
         * This includes animation and cleanup of event listeners.
         * @param {Element} notificationElement - The DOM element representing the notification.
         * @param {Object} currentOptions - The options object specific to this notification.
         */
        function dismissNotification(notificationElement, currentOptions) {
            // Ensure options are provided, otherwise fall back to defaults.
            const effectiveOptions = currentOptions || notificationDefaults;

            // Guard clause: if element is not valid, do nothing.
            if (!notificationElement || !notificationElement.present()) {
                console.warn("Attempted to dismiss a non-existent or invalid notification element.");
                return;
            }

            // Parallel animation for moving and fading out the notification.
            new Effect.Parallel([
                new Effect.Move(notificationElement, Object.extend({
                    sync: true,
                    mode: 'relative'
                }, effectiveOptions.exitDirection)),
                new Effect.Opacity(notificationElement, {
                    sync: true,
                    to: 0
                })
            ], {
                duration: effectiveOptions.fadeDurationOut,
                afterFinish: function () {
                    // Clean up event listeners and remove the element from the DOM.
                    try {
                        const exitControl = notificationElement.down("button.close-alert-btn");
                        if (exitControl) {
                            exitControl.stopObserving("click"); // Stop all click observers for simplicity.
                        }

                        // Trigger and unobserve destroyed callback if defined.
                        if (effectiveOptions.onDestroyed && Object.isFunction(effectiveOptions.onDestroyed)) {
                            notificationElement.fire("alert:destroyed");
                            notificationElement.stopObserving("alert:destroyed", effectiveOptions.onDestroyed);
                        }
                    } catch (error) {
                        console.error("Error during notification cleanup callbacks:", error);
                    } finally {
                        // Always attempt to remove the element.
                        if (notificationElement.parentNode) {
                            notificationElement.remove();
                        }
                    }
                }
            });
        }

        /**
         * Creates and displays a new notification within the specified container.
         * @param {Element} displayContainer - The parent DOM element where the notification will be inserted.
         * @param {string} contentMessage - The main message content of the notification.
         * @param {Object} optionalSettings - Additional settings to override defaults for this specific notification.
         * @returns {Element|null} The created notification element, or null if creation failed.
         */
        function constructAlert(displayContainer, contentMessage, optionalSettings) {
            // Validate essential inputs.
            if (!displayContainer || !contentMessage) {
                console.error("Cannot construct alert: Missing display container or message content.");
                return null;
            }

            // Merge default and provided options.
            let activeOptions = Object.clone(notificationDefaults);
            optionalSettings = optionalSettings || {};
            Object.extend(activeOptions, optionalSettings);

            // Determine the final CSS class for the notification.
            let finalClassList = activeOptions.baseCssClass;
            if (activeOptions.customClass) {
                finalClassList += ' ' + activeOptions.customClass;
            }

            // Create the main notification element.
            const alertItem = new Element("div", {
                "class": finalClassList,
                "data-alert-id": "alert-" + Date.now() // Unique ID for potential future reference.
            }).setStyle({
                display: "block",
                opacity: 0
            });

            // Set up life cycle event observers.
            if (activeOptions.onCreated && Object.isFunction(activeOptions.onCreated)) {
                alertItem.observe("alert:created", activeOptions.onCreated);
            }
            if (activeOptions.onDestroyed && Object.isFunction(activeOptions.onDestroyed)) {
                alertItem.observe("alert:destroyed", activeOptions.onDestroyed);
            }

            // If sticky, add a close button.
            if (activeOptions.isSticky) {
                const closeButton = new Element("button", {
                    "class": "close-alert-btn dismiss-action"
                }).update("&#x2715;"); // Unicode 'X' mark.

                // Attach event listener for dismissal.
                closeButton.observe("click", function () {
                    dismissNotification(alertItem, activeOptions);
                });
                alertItem.insert(closeButton);
            }

            // Insert header (if provided and not just an empty space).
            if (activeOptions.titleText && activeOptions.titleText !== '&nbsp;') {
                alertItem.insert(new Element("div", {
                    "class": "app-notification-header"
                }).update(activeOptions.titleText));
            }

            // Insert message body.
            alertItem.insert(new Element("div", {
                "class": "app-notification-body"
            }).update(contentMessage));

            // Add the notification to the display container.
            displayContainer.insert(alertItem);

            // Animate its appearance.
            new Effect.Opacity(alertItem, {
                to: 0.9, // Slightly transparent for a modern look.
                duration: activeOptions.fadeDurationIn
            });

            // If not sticky, schedule automatic dismissal.
            if (!activeOptions.isSticky) {
                dismissNotification.delay(activeOptions.displayTime, alertItem, activeOptions);
            }

            // Fire the created event.
            alertItem.fire("alert:created");

            return alertItem;
        }

        /**
         * Creates a themed notification with specific background and text colors.
         * This is a specialized helper for visual differentiation.
         * @param {Element} container - The container for the alert.
         * @param {string} content - The message content.
         * @param {Object} opts - Options for the alert.
         * @param {string} defaultHeader - A fallback header text.
         * @param {string} backgroundColor - CSS background color.
         * @param {string} foregroundColor - CSS text color.
         * @returns {Element} The created notification element.
         */
        function displayThemedAlert(container, content, opts, defaultHeader, backgroundColor, foregroundColor) {
            // Ensure options object exists.
            opts = opts || {};
            // Set header if not already defined.
            opts.titleText = opts.titleText || defaultHeader;

            // Create the base notification.
            const themedAlert = constructAlert(container, content, opts);

            // Apply custom styling.
            if (themedAlert) {
                themedAlert.setStyle({
                    backgroundColor: backgroundColor,
                    color: foregroundColor
                });
            }
            return themedAlert;
        }

        /**
         * Main class for managing application alerts.
         * This acts as the public interface for the AlertService.
         */
        var SystemAlertManager = Class.create({
            /**
             * Initializes the SystemAlertManager, creating and positioning its container.
             * @param {Object} configOverrides - Optional configuration to override default container settings.
             */
            initialize: function (configOverrides) {
                let currentConfig = Object.clone(containerSettings);
                configOverrides = configOverrides || {};
                Object.extend(currentConfig, configOverrides);

                // Define positioning styles based on the chosen location.
                const positionStyles = {
                    "bottomRight": { bottom: '0', right: '0' },
                    "topLeft": { top: '0', left: '0' },
                    "bottomLeft": { bottom: '0', left: '0' },
                    "topCenter": { top: '0', left: '25%', width: '50%' },
                    "bottomCenter": { bottom: '0', left: '25%', width: '50%' },
                    "topRight": { top: '0', right: '0' } // Default if position is not found.
                };

                // Create the main container element for all notifications.
                this.notificationDisplayArea = new Element("div", {
                    "class": "AlertsHostContainer",
                    "id": "MainAppAlertsContainer"
                });

                // Apply base styles.
                this.notificationDisplayArea.setStyle({
                    position: 'fixed',
                    padding: "12px",
                    width: currentConfig.containerWidth,
                    "z-index": currentConfig.zIndexLevel
                });

                // Apply specific positioning styles.
                const specificPosition = positionStyles[currentConfig.position] || positionStyles["bottomRight"];
                this.notificationDisplayArea.setStyle(specificPosition);

                // Insert the container into the document body.
                // Using insert instead of wrap to avoid potential Prototype.js wrap quirks with body.
                document.body.insert(this.notificationDisplayArea);
            },

            /**
             * Displays a generic notification message.
             * @param {string} messageText - The main content of the notification.
             * @param {Object} alertConfig - Configuration options for this specific alert.
             * @returns {Element|null} The created alert element.
             */
            postNotification: function (messageText, alertConfig) {
                return constructAlert(this.notificationDisplayArea, messageText, alertConfig);
            },

            /**
             * Displays an error notification, typically sticky.
             * @param {string} headerTitle - The title for the error.
             * @param {string} errorMessage - The error message content.
             * @returns {Element|null} The created alert element.
             */
            showError: function (headerTitle, errorMessage) {
                const errorOptions = {
                    titleText: headerTitle,
                    isSticky: true,
                    customClass: 'error-alert' // Specific class for error styling.
                };
                return this.postNotification(errorMessage, errorOptions);
            },

            /**
             * Displays a success notification.
             * @param {string} headerTitle - The title for the success message.
             * @param {string} successMessage - The success message content.
             * @returns {Element|null} The created alert element.
             */
            confirmSuccess: function (headerTitle, successMessage) {
                const successOptions = {
                    titleText: headerTitle,
                    isSticky: false,
                    customClass: 'success-alert' // Specific class for success styling.
                };
                return this.postNotification(successMessage, successOptions);
            },

            /**
             * Displays a warning notification.
             * @param {string} headerTitle - The title for the warning message.
             * @param {string} warningMessage - The warning message content.
             * @returns {Element|null} The created alert element.
             */
            issueWarning: function (headerTitle, warningMessage) {
                const warningOptions = {
                    titleText: headerTitle,
                    isSticky: true, // Warnings often need user attention.
                    customClass: 'warning-alert', // Specific class for warning styling.
                    displayTime: 10 // Longer display for warnings.
                };
                return this.postNotification(warningMessage, warningOptions);
            },

            /**
             * Manually dismisses an active notification.
             * @param {Element} notificationNode - The DOM element of the notification to dismiss.
             * @param {Object} overrideOptions - Optional options to use for dismissal animation/logic.
             */
            clearNotification: function (notificationNode, overrideOptions) {
                dismissNotification(notificationNode, overrideOptions);
            }
        });

        // Instantiate and return the SystemAlertManager, making it the public interface of the module.
        return new SystemAlertManager();
    })();
});