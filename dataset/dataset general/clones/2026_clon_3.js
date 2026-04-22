if (typeof Object.create !== 'function') {
    Object.create = function (proto) {
        if (typeof proto !== 'object' && proto !== null) {
            throw new TypeError('Object prototype may only be an Object or null.');
        }
        function TempConstructor() {}
        TempConstructor.prototype = proto;
        return new TempConstructor();
    };
}

(function (J) {

    // Internal object representing a single popup notification instance
    var PopUpInstance = {

        // Initializes the notification with user-defined settings
        initiate: function (userPrefs) {
            // Validate input for user preferences
            if (!userPrefs || typeof userPrefs !== 'object') {
                userPrefs = {}; // Default to empty object if invalid
            }

            // Merge default global settings with user-provided options
            // Start with a fresh object to avoid modifying global defaults directly
            this.activeSettings = J.extend(true, {}, J.PopupConfig.globalSettings, userPrefs);

            // Dynamically load layout and theme configurations
            this.activeSettings.layoutPreset = (this.activeSettings.isCustomPlacement) ? J.PopupConfig.layoutPresets['inline'] : J.PopupConfig.layoutPresets[this.activeSettings.layoutPreset];
            this.activeSettings.skinStyle = J.PopupConfig.skinStyles[this.activeSettings.skinStyle];

            // Deep merge layout-specific options after initial theme/layout selection
            // This ensures layout options override general defaults but are still overridden by userPrefs
            this.activeSettings = J.extend(true, {}, this.activeSettings, this.activeSettings.layoutPreset.options);

            // Generate a unique identifier for this notification if not provided
            if (!this.activeSettings.uniqueId) {
                this.activeSettings.uniqueId = 'pui_' + (new Date().getTime() * Math.floor(Math.random() * 10000000));
            }


            // Re-apply user preferences to ensure they have the highest priority, especially after layout/theme merges
            this.activeSettings = J.extend(true, {}, this.activeSettings, userPrefs);


            // Construct the visual elements of the popup
            this.renderVisuals();

            // Return the instance for chaining API calls
            return this;
        }, // end initiate

        // Builds the DOM structure for the notification
        renderVisuals: function () {

            // Create the main bar element with a unique ID and base class
            var $notificationContainer = J('<div class="pui_wrapper_bar"></div>').attr('id', this.activeSettings.uniqueId);
            // Append the template and populate the text content
            $notificationContainer.append(this.activeSettings.htmlTemplate).find('.pui_text_content').html(this.activeSettings.messageText);

            // Determine where to place the notification bar based on layout settings
            var targetParent = this.activeSettings.layoutPreset.parent.elementObject;
            if (targetParent && J(targetParent).length) {
                this.$notificationBar = J(targetParent).css(this.activeSettings.layoutPreset.parent.cssProps).append($notificationContainer);
            } else {
                this.$notificationBar = $notificationContainer; // No specific parent, it will be added to the layout container later
            }

            // Handle action buttons if provided in settings
            if (this.activeSettings.actionButtons && this.activeSettings.actionButtons.length > 0) {
                // If buttons exist, disable auto-closing mechanisms
                this.activeSettings.closeTriggers = [];
                this.activeSettings.displayDuration = false;

                var $buttonPanel = J('<div/>').addClass('pui_button_panel');

                // Append the button panel to the appropriate location within the notification
                if (targetParent && J(targetParent).length) {
                    this.$notificationBar.find('.pui_wrapper_bar').append($buttonPanel);
                } else {
                    this.$notificationBar.append($buttonPanel);
                }

                var currentInstance = this; // Capture 'this' for use within the button loop

                // Iterate through each button definition and create its DOM element
                J.each(this.activeSettings.actionButtons, function (idx, buttonDef) {
                    var buttonClasses = buttonDef.cssClasses || 'pui_btn_default';
                    var $actionButton = J('<button/>')
                        .addClass(buttonClasses)
                        .html(buttonDef.buttonText)
                        .appendTo(currentInstance.$notificationBar.find('.pui_button_panel'));

                    // Attach click handler for the button
                    $actionButton.on('click', function (evt) {
                        evt.preventDefault(); // Prevent default button behavior
                        if (J.isFunction(buttonDef.clickHandler)) {
                            buttonDef.clickHandler.call($actionButton, currentInstance); // Call custom handler
                        }
                    });
                });
            }

            // Cache commonly accessed elements for performance
            this.$messageBody = this.$notificationBar.find('.pui_message_body');
            this.$dismissButton = this.$notificationBar.find('.pui_close_btn');
            this.$buttonGroup = this.$notificationBar.find('.pui_button_panel');

            // Store the current instance in the global registry for API access
            J.PopupConfig.activeInstances[this.activeSettings.uniqueId] = this;

        }, // end renderVisuals

        // Displays the notification on screen
        display: function () {

            var instanceRef = this; // Alias 'this' for use in callbacks and closures

            // Append the notification bar to its layout container
            J(instanceRef.activeSettings.layoutPreset.container.selector).append(instanceRef.$notificationBar);

            // Apply theme-specific styling
            instanceRef.activeSettings.skinStyle.applyStyle.apply(instanceRef);

            // Apply layout-specific CSS properties
            if (J.type(instanceRef.activeSettings.layoutPreset.cssProps) === 'function') {
                instanceRef.activeSettings.layoutPreset.cssProps.apply(instanceRef.$notificationBar);
            } else {
                instanceRef.$notificationBar.css(instanceRef.activeSettings.layoutPreset.cssProps || {});
            }

            // Add layout-specific classes
            instanceRef.$notificationBar.addClass(instanceRef.activeSettings.layoutPreset.addClasses);

            // Apply container-specific styling from the layout
            instanceRef.activeSettings.layoutPreset.container.applyContainerStyle.apply(J(instanceRef.activeSettings.layoutPreset.container.selector));

            // Execute theme's on-show callback
            if (instanceRef.activeSettings.skinStyle.callbacks && instanceRef.activeSettings.skinStyle.callbacks.onShow) {
                instanceRef.activeSettings.skinStyle.callbacks.onShow.apply(this);
            }


            // Configure close triggers based on settings
            if (instanceRef.activeSettings.closeTriggers.includes('click')) {
                instanceRef.$notificationBar.css('cursor', 'pointer').one('click', function () {
                    instanceRef.dismiss();
                });
            }

            if (instanceRef.activeSettings.closeTriggers.includes('hover')) {
                instanceRef.$notificationBar.one('mouseenter', function () {
                    instanceRef.dismiss();
                });
            }

            if (instanceRef.activeSettings.closeTriggers.includes('button')) {
                instanceRef.$dismissButton.one('click', function () {
                    instanceRef.dismiss();
                });
            }

            // Remove the default close button if 'button' is not in closeTriggers
            if (!instanceRef.activeSettings.closeTriggers.includes('button')) {
                instanceRef.$dismissButton.remove();
            }

            // Execute user-defined onShow callback
            if (J.isFunction(instanceRef.activeSettings.callbacks.onDisplay)) {
                instanceRef.activeSettings.callbacks.onDisplay.apply(instanceRef);
            }

            // Animate the notification into view
            instanceRef.$notificationBar.animate(
                instanceRef.activeSettings.displayAnim.openEffect,
                instanceRef.activeSettings.displayAnim.speedMs,
                instanceRef.activeSettings.displayAnim.easingType,
                function () {
                    if (J.isFunction(instanceRef.activeSettings.callbacks.afterDisplay)) {
                        instanceRef.activeSettings.callbacks.afterDisplay.apply(instanceRef);
                    }
                    instanceRef.isDisplayed = true;
                }
            );

            // Set up auto-dismissal if a duration is specified
            if (typeof instanceRef.activeSettings.displayDuration === 'number' && instanceRef.activeSettings.displayDuration > 0) {
                instanceRef.$notificationBar.delay(instanceRef.activeSettings.displayDuration).promise().done(function () {
                    instanceRef.dismiss();
                });
            }

            return this; // Allow method chaining
        }, // end display

        // Dismisses (closes) the notification
        dismiss: function () {

            if (this.isDismissed) {
                console.warn('Attempted to dismiss an already dismissed notification:', this.activeSettings.uniqueId);
                return; // Prevent double dismissal
            }

            var instanceRef = this; // Alias 'this'

            // If the notification hasn't been shown yet (e.g., still in queue), remove it from the queue directly
            if (!this.isDisplayed) {
                var updatedQueue = J.PopupConfig.displayQueue.filter(function (queuedNotification) {
                    return queuedNotification.activeSettings.uniqueId !== instanceRef.activeSettings.uniqueId;
                });
                J.PopupConfig.displayQueue = updatedQueue;
                console.log('Notification removed from queue before display:', instanceRef.activeSettings.uniqueId);
                return;
            }

            // Add a class to indicate it's in the process of closing
            instanceRef.$notificationBar.addClass('pui_closing_state');

            // Execute user-defined onClose callback
            if (J.isFunction(instanceRef.activeSettings.callbacks.onDismiss)) {
                instanceRef.activeSettings.callbacks.onDismiss.apply(instanceRef);
            }

            // Stop any ongoing animations and animate the notification out of view
            instanceRef.$notificationBar.clearQueue().stop().animate(
                instanceRef.activeSettings.displayAnim.closeEffect,
                instanceRef.activeSettings.displayAnim.speedMs,
                instanceRef.activeSettings.displayAnim.easingType,
                function () {
                    // After close animation completes
                    if (J.isFunction(instanceRef.activeSettings.callbacks.afterDismiss)) {
                        instanceRef.activeSettings.callbacks.afterDismiss.apply(instanceRef);
                    }
                })
                .promise().done(function () {

                    // Handle modal overlay cleanup
                    if (instanceRef.activeSettings.isModal) {
                        J.PopupEngine.updateModalCount(-1);
                        if (J.PopupEngine.getModalCount() === 0) {
                            J('.pui_modal_overlay').fadeOut('fast', function () {
                                J(this).remove();
                                console.log('Modal overlay removed.');
                            });
                        }
                    }

                    // Handle layout container cleanup
                    J.PopupEngine.updateLayoutInstanceCount(instanceRef, -1);
                    if (J.PopupEngine.getLayoutInstanceCount(instanceRef) === 0) {
                        var containerSelector = instanceRef.activeSettings.layoutPreset.container.selector;
                        if (J(containerSelector).length > 0) { // Ensure container still exists
                            J(containerSelector).remove();
                            console.log('Layout container removed:', containerSelector);
                        }
                    }

                    // Remove the notification bar from the DOM
                    if (instanceRef.$notificationBar && instanceRef.$notificationBar.length > 0) {
                        instanceRef.$notificationBar.remove();
                        instanceRef.$notificationBar = null; // Dereference to aid garbage collection
                        instanceRef.isDismissed = true;
                        console.log('Notification DOM element removed:', instanceRef.activeSettings.uniqueId);
                    } else {
                        console.warn('Notification bar not found for removal:', instanceRef.activeSettings.uniqueId);
                    }


                    // Remove instance from global store
                    delete J.PopupConfig.activeInstances[instanceRef.activeSettings.uniqueId];
                    console.log('Notification instance removed from store:', instanceRef.activeSettings.uniqueId);

                    // Execute theme's on-close callback
                    if (instanceRef.activeSettings.skinStyle.callbacks && instanceRef.activeSettings.skinStyle.callbacks.onClose) {
                        instanceRef.activeSettings.skinStyle.callbacks.onClose.apply(instanceRef);
                    }

                    // If queue processing is not dismissed, trigger the next notification
                    if (!instanceRef.activeSettings.shouldDismissQueue) {
                        J.PopupConfig.isReadyForNext = true;
                        J.PopupEngine.processQueue();
                    }
                });

        }, // end dismiss

        // Updates the text content of the notification
        updateTextContent: function (newText) {
            if (!this.isDismissed && newText !== undefined) {
                this.activeSettings.messageText = newText;
                this.$notificationBar.find('.pui_text_content').html(newText);
            }
            return this;
        },

        // Changes the type (e.g., 'alert', 'success') of the notification
        modifyType: function (newType) {
            if (!this.isDismissed && newType) {
                this.activeSettings.messageType = newType;
                // Re-apply theme styles to reflect the new type
                this.activeSettings.skinStyle.applyStyle.apply(this);
                // Re-run onShow callback if it affects appearance
                if (this.activeSettings.skinStyle.callbacks && this.activeSettings.skinStyle.callbacks.onShow) {
                    this.activeSettings.skinStyle.callbacks.onShow.apply(this);
                }
            }
            return this;
        },

        // Resets the timeout for auto-dismissal
        resetDismissTimeout: function (durationMs) {
            if (!this.isDismissed && typeof durationMs === 'number' && durationMs > 0) {
                var instanceRef = this;
                this.activeSettings.displayDuration = durationMs;
                // Clear any existing timeout and set a new one
                instanceRef.$notificationBar.clearQueue().stop(); // Stop any pending delays
                instanceRef.$notificationBar.delay(durationMs).promise().done(function () {
                    instanceRef.dismiss();
                });
            }
            return this;
        },

        isDismissed: false, // Flag to track if notification is dismissed
        isDisplayed: false  // Flag to track if notification is currently shown
    }; // end PopUpInstance

    // Centralized engine for managing and rendering popup notifications
    J.PopupEngine = {};

    // Initiates a new notification and adds it to the queue
    J.PopupEngine.createNotification = function (optionsObject) {

        // Create a new notification instance from the PopUpInstance prototype
        var newNotification = Object.create(PopUpInstance).initiate(optionsObject);

        // Add to queue: forcefully display immediately or add to end
        if (newNotification.activeSettings.forceDisplay) {
            J.PopupConfig.displayQueue.unshift(newNotification); // Add to front
            console.log('Notification added to front of queue (forced):', newNotification.activeSettings.uniqueId);
        } else {
            J.PopupConfig.displayQueue.push(newNotification); // Add to end
            console.log('Notification added to end of queue:', newNotification.activeSettings.uniqueId);
        }

        // Attempt to process the queue
        J.PopupEngine.processQueue();

        // Return either the full object or just the ID based on configuration
        return (J.PopupConfig.returnType === 'object') ? newNotification : newNotification.activeSettings.uniqueId;
    };

    // Processes the notification queue, showing notifications as needed
    J.PopupEngine.processQueue = function () {

        var nextNotification = J.PopupConfig.displayQueue[0];

        // Only proceed if there's a notification and the engine is ready for the next one
        if (nextNotification && typeof nextNotification === 'object') {
            if (nextNotification.activeSettings.shouldDismissQueue) {
                // If queue should be dismissed, show the current one and remove it
                J.PopupEngine.displayNotification(J.PopupConfig.displayQueue.shift());
                console.log('Showing notification from dismissible queue:', nextNotification.activeSettings.uniqueId);
            } else {
                // If queue is not dismissible, only show if ready
                if (J.PopupConfig.isReadyForNext) {
                    J.PopupEngine.displayNotification(J.PopupConfig.displayQueue.shift());
                    J.PopupConfig.isReadyForNext = false; // Mark engine as busy
                    console.log('Showing notification from non-dismissible queue:', nextNotification.activeSettings.uniqueId);
                } else {
                    console.log('Engine not ready for next notification, waiting.');
                }
            }
        } else {
            J.PopupConfig.isReadyForNext = true; // Queue is empty, engine is ready
            console.log('Notification queue is empty.');
        }

    };

    // Displays a given notification instance
    J.PopupEngine.displayNotification = function (notificationInstance) {

        if (!notificationInstance || !notificationInstance.activeSettings) {
            console.error('Attempted to display an invalid notification instance.');
            return;
        }

        // Handle modal functionality
        if (notificationInstance.activeSettings.isModal) {
            J.PopupEngine.ensureModalOverlay(notificationInstance);
            J.PopupEngine.updateModalCount(+1);
            console.log('Modal overlay ensured for notification:', notificationInstance.activeSettings.uniqueId);
        }

        // Ensure the layout container exists in the DOM
        var containerElement = J(notificationInstance.activeSettings.layoutPreset.container.selector);
        if (containerElement.length === 0) {
            var newContainer = J(notificationInstance.activeSettings.layoutPreset.container.elementObject).addClass('pui_new_container_element');
            if (notificationInstance.activeSettings.isCustomPlacement && notificationInstance.activeSettings.customContainerTarget) {
                J(notificationInstance.activeSettings.customContainerTarget).append(newContainer);
                console.log('Custom container appended for layout:', notificationInstance.activeSettings.layoutPreset.container.selector);
            } else {
                J('body').append(newContainer);
                console.log('Default body container appended for layout:', notificationInstance.activeSettings.layoutPreset.container.selector);
            }
        } else {
            containerElement.removeClass('pui_new_container_element'); // Remove temporary class if already existing
        }

        J.PopupEngine.updateLayoutInstanceCount(notificationInstance, +1);

        // Finally, trigger the notification's display method
        notificationInstance.display();
    };

    // Creates or ensures the modal overlay exists
    J.PopupEngine.ensureModalOverlay = function (notificationInstance) {
        var $modalOverlay = J('.pui_modal_overlay');
        if ($modalOverlay.length === 0) {
            J('<div/>').addClass('pui_modal_overlay')
                .data('pui_modal_count', 0) // Initialize count
                .css(notificationInstance.activeSettings.skinStyle.modalConfig.cssProps)
                .prependTo(J('body'))
                .fadeIn('fast', function() {
                    console.log('Modal overlay created and faded in.');
                });
        }
    };

    // Retrieves the count of notifications within a specific layout container
    J.PopupEngine.getLayoutInstanceCount = function (notificationInstance) {
        var containerSelector = notificationInstance.activeSettings.layoutPreset.container.selector;
        return J(containerSelector).data('pui_layout_instance_count') || 0;
    };

    // Updates the count of notifications within a specific layout container
    J.PopupEngine.updateLayoutInstanceCount = function (notificationInstance, changeAmount) {
        var containerSelector = notificationInstance.activeSettings.layoutPreset.container.selector;
        var currentCount = J.PopupEngine.getLayoutInstanceCount(notificationInstance);
        var newCount = currentCount + changeAmount;
        if (newCount < 0) newCount = 0; // Ensure count doesn't go negative
        return J(containerSelector).data('pui_layout_instance_count', newCount);
    };

    // Retrieves the current count of active modal notifications
    J.PopupEngine.getModalCount = function () {
        return J('.pui_modal_overlay').data('pui_modal_count') || 0;
    };

    // Updates the count of active modal notifications
    J.PopupEngine.updateModalCount = function (changeAmount) {
        var currentCount = J.PopupEngine.getModalCount();
        var newCount = currentCount + changeAmount;
        if (newCount < 0) newCount = 0; // Ensure count doesn't go negative
        return J('.pui_modal_overlay').data('pui_modal_count', newCount);
    };

    // jQuery plugin extension for creating notifications on specific elements
    J.fn.popup = function (optionsObject) {
        var element = J(this);
        if (element.length === 0) {
            console.warn('Popup called on an empty jQuery selection.');
            return;
        }
        optionsObject = optionsObject || {};
        optionsObject.isCustomPlacement = true;
        optionsObject.customContainerTarget = element; // Store the target element for custom placement
        return J.PopupEngine.createNotification(optionsObject);
    };

    // Global configuration and utility object for notifications
    J.PopupConfig = {};
    J.PopupConfig.displayQueue = [];        // Queue for notifications awaiting display
    J.PopupConfig.isReadyForNext = true;    // Flag indicating if the engine can display the next notification
    J.PopupConfig.layoutPresets = {};       // Storage for predefined layout configurations
    J.PopupConfig.skinStyles = {};          // Storage for predefined visual themes
    J.PopupConfig.returnType = 'object';    // Default return type for createNotification ('object' or 'id')
    J.PopupConfig.activeInstances = {};     // Registry of all currently active notification instances

    // API method to retrieve a notification instance by its ID
    J.PopupConfig.getInstance = function (instanceId) {
        return J.PopupConfig.activeInstances.hasOwnProperty(instanceId) ? J.PopupConfig.activeInstances[instanceId] : null;
    };

    // API method to dismiss a notification by its ID
    J.PopupConfig.closeById = function (instanceId) {
        var instance = J.PopupConfig.getInstance(instanceId);
        if (instance) {
            instance.dismiss();
            return true;
        }
        return false;
    };

    // API method to update the text of a notification
    J.PopupConfig.updateInstanceText = function (instanceId, newText) {
        var instance = J.PopupConfig.getInstance(instanceId);
        if (instance) {
            instance.updateTextContent(newText);
            return true;
        }
        return false;
    };

    // API method to change the type of a notification
    J.PopupConfig.updateInstanceType = function (instanceId, newType) {
        var instance = J.PopupConfig.getInstance(instanceId);
        if (instance) {
            instance.modifyType(newType);
            return true;
        }
        return false;
    };

    // API method to clear the entire display queue
    J.PopupConfig.flushQueue = function () {
        J.PopupConfig.displayQueue = [];
        console.log('Notification display queue has been flushed.');
    };

    // API method to dismiss all active notifications and clear the queue
    J.PopupConfig.closeAllActive = function () {
        J.PopupConfig.flushQueue(); // Clear pending notifications
        // Iterate over a copy of the keys to avoid issues with modification during iteration
        Object.keys(J.PopupConfig.activeInstances).forEach(function (instanceId) {
            J.PopupConfig.activeInstances[instanceId].dismiss();
        });
        console.log('All active notifications are being dismissed.');
    };

    var originalWindowAlert = window.alert; // Store original alert function

    // Overrides window.alert to display a notification instead
    J.PopupConfig.hijackAlert = function (customOptions) {
        window.alert = function (message) {
            var alertOptions = customOptions ? J.extend({}, customOptions) : {};
            alertOptions.messageText = message; // Set the message
            J.PopupEngine.createNotification(alertOptions);
        };
        console.log('window.alert has been hijacked by PopupConfig.');
    };

    // Restores the original window.alert function
    J.PopupConfig.restoreAlert = function () {
        window.alert = originalWindowAlert;
        console.log('window.alert has been restored.');
    };

    // Default configuration settings for all notifications
    J.PopupConfig.globalSettings = {
        layoutPreset: 'top', // Default layout
        skinStyle: 'defaultSkin', // Default visual theme
        messageType: 'info', // Default type ('info', 'success', 'warning', 'error')
        messageText: '',     // Default message content
        shouldDismissQueue: true, // If true, notifications in queue are shown immediately
        htmlTemplate: '<div class="pui_message_body"><span class="pui_text_content"></span><div class="pui_close_btn"></div></div>',
        displayAnim: {
            openEffect: {opacity: 'show'}, // Animation for showing the notification
            closeEffect: {opacity: 'hide'}, // Animation for hiding the notification
            easingType: 'swing', // Easing function for animations
            speedMs: 400         // Animation duration in milliseconds
        },
        displayDuration: false, // Auto-dismissal timeout (false for no timeout, number for duration in ms)
        forceDisplay: false,    // If true, notification is added to front of queue and shown ASAP
        isModal: false,         // If true, a modal overlay will be displayed
        closeTriggers: ['click'], // Array of events that can close the notification (e.g., 'click', 'hover', 'button')
        callbacks: {            // Callback functions for various stages of notification lifecycle
            onDisplay: function () {
            },
            afterDisplay: function () {
            },
            onDismiss: function () {
            },
            afterDismiss: function () {
            }
        },
        actionButtons: false, // Array of button configurations
        isCustomPlacement: false, // Internal flag for custom jQuery element placement
        customContainerTarget: null // Internal reference to the custom jQuery target element
    };

    // Handle window resize events to adjust layout containers
    J(window).on('resize', function () {
        J.each(J.PopupConfig.layoutPresets, function (layoutName, layoutDefinition) {
            // Ensure the container exists and has the applyContainerStyle method
            if (layoutDefinition.container && J.isFunction(layoutDefinition.container.applyContainerStyle)) {
                layoutDefinition.container.applyContainerStyle.apply(J(layoutDefinition.container.selector));
            }
        });
    });

})(jQuery); // Pass jQuery object as 'J' alias

// Global helper function for creating notifications, offering backward compatibility
function createPopup(opts) {

    // Helper for logging deprecated options
    var logDeprecated = function(oldName, newName) {
        console.warn('DEPRECATED OPTION: Use "' + newName + '" instead of "' + oldName + '".');
    };

    if (!opts || typeof opts !== 'object') {
        opts = {};
    }

    var legacyOptionMap = {
        'animateOpen': 'displayAnim.openEffect',
        'animateClose': 'displayAnim.closeEffect',
        'easing': 'displayAnim.easingType',
        'speed': 'displayAnim.speedMs',
        'onShow': 'callbacks.onDisplay',
        'onShown': 'callbacks.afterDisplay',
        'onClose': 'callbacks.onDismiss',
        'onClosed': 'callbacks.afterDismiss',
        'type': 'messageType', // Direct mapping
        'text': 'messageText', // Direct mapping
        'layout': 'layoutPreset', // Direct mapping
        'theme': 'skinStyle', // Direct mapping
        'timeout': 'displayDuration', // Direct mapping
        'force': 'forceDisplay', // Direct mapping
        'modal': 'isModal', // Direct mapping
        'buttons': 'actionButtons', // Direct mapping
        'dismissQueue': 'shouldDismissQueue', // Direct mapping
        'template': 'htmlTemplate', // Direct mapping
        'id': 'uniqueId' // Direct mapping
    };

    // Process deprecated options and map them to new structure
    Object.keys(opts).forEach(function (oldKey) {
        if (legacyOptionMap[oldKey]) {
            logDeprecated(oldKey, legacyOptionMap[oldKey]);
            var newPath = legacyOptionMap[oldKey].split('.');
            var target = opts;
            for (var i = 0; i < newPath.length - 1; i++) {
                if (!target[newPath[i]]) target[newPath[i]] = {};
                target = target[newPath[i]];
            }
            target[newPath[newPath.length - 1]] = opts[oldKey];
            delete opts[oldKey]; // Remove the old key
        }
    });

    // Handle 'closeWith' backward compatibility
    if (opts.closeWith === undefined) { // If not explicitly set, use default
        opts.closeTriggers = jQuery.PopupConfig.globalSettings.closeTriggers;
    } else { // If set, ensure it's an array and use it
        opts.closeTriggers = Array.isArray(opts.closeWith) ? opts.closeWith : [opts.closeWith];
        delete opts.closeWith;
    }


    // Specific boolean options that map to 'closeTriggers'
    if (opts.hasOwnProperty('closeButton')) {
        logDeprecated('closeButton', 'closeTriggers (with "button")');
        if (opts.closeButton && !opts.closeTriggers.includes('button')) opts.closeTriggers.push('button');
        delete opts.closeButton;
    }

    if (opts.hasOwnProperty('closeOnSelfClick')) {
        logDeprecated('closeOnSelfClick', 'closeTriggers (with "click")');
        if (opts.closeOnSelfClick && !opts.closeTriggers.includes('click')) opts.closeTriggers.push('click');
        delete opts.closeOnSelfClick;
    }

    if (opts.hasOwnProperty('closeOnSelfOver')) {
        logDeprecated('closeOnSelfOver', 'closeTriggers (with "hover")');
        if (opts.closeOnSelfOver && !opts.closeTriggers.includes('hover')) opts.closeTriggers.push('hover');
        delete opts.closeOnSelfOver;
    }

    // Handle 'custom' for element-bound popups
    if (opts.hasOwnProperty('custom')) {
        logDeprecated('custom', 'jQuery.fn.popup()');
        if (opts.custom && opts.custom.container) {
            opts.isCustomPlacement = true;
            opts.customContainerTarget = jQuery(opts.custom.container);
        }
        delete opts.custom;
    }

    // Remove legacy 'cssPrefix' if present
    if (opts.hasOwnProperty('cssPrefix')) {
        logDeprecated('cssPrefix', 'theme definitions');
        delete opts.cssPrefix;
    }

    // Map old default theme name
    if (opts.skinStyle === 'noty_theme_default') {
        logDeprecated('noty_theme_default', 'defaultSkin');
        opts.skinStyle = 'defaultSkin';
    }

    // Adjust dismissQueue default based on specific layouts if not explicitly set
    if (!opts.hasOwnProperty('shouldDismissQueue')) {
        var layout = opts.layoutPreset || jQuery.PopupConfig.globalSettings.layoutPreset;
        if (['topLeft', 'topRight', 'bottomLeft', 'bottomRight'].includes(layout)) {
            opts.shouldDismissQueue = true;
        } else {
            opts.shouldDismissQueue = false;
        }
    }

    // Process old button click handlers
    if (opts.actionButtons) {
        jQuery.each(opts.actionButtons, function (i, button) {
            if (button.click && !button.clickHandler) { // If old 'click' exists but new 'clickHandler' doesn't
                logDeprecated('button.click', 'button.clickHandler');
                button.clickHandler = button.click;
                delete button.click;
            }
        });
    }

    return jQuery.PopupEngine.createNotification(opts);
}