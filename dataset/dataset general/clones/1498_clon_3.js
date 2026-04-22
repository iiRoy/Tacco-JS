/*
    PANORAMAVIEW CORE EXTENSION - Control Panel Module
    ---------------------------------------------------
    This module provides an interactive control panel for the Panoramaview plugin,
    allowing users to navigate and manipulate panoramic image displays.

    Version 1.0.0 (Derived from Leanorama 0.2.0)
    ---------------------------------------------------
    Copyright 2024 Panoramaview Development Team. All rights reserved.
    This software is provided under a custom license agreement.
*/

// Ensure jQuery and the Panoramaview core are available.
if (typeof jQuery === 'undefined' || !jQuery.fn.panoramaview) {
    console.warn("Panoramaview Control Panel: jQuery or Panoramaview core not found. Module will not load.");
    return;
}

// Push this module into the Panoramaview extensions registry.
jQuery.fn.panoramaview.extensions.push(function initializeControlPanelModule() {
    // Internal references for the main control panel element and its constituent buttons.
    var $controlPanelElement, uiComponents;
    // State flag to track the current visibility of the control panel.
    var isPanelCurrentlyVisible = false;

    // Helper function to create jQuery elements with given tag and attributes.
    function createUIElement(tagName, attributes) {
        return jQuery('<' + tagName + '>').attr(attributes);
    }

    // A simple debouncer to prevent rapid firing of continuous actions like pan/zoom.
    var lastActionTimestamp = 0;
    var debounceDelay = 100; // milliseconds

    function debounceAction(callback) {
        var now = Date.now();
        if (now - lastActionTimestamp > debounceDelay) {
            callback();
            lastActionTimestamp = now;
        }
    }

    // Establishes the entire user interface for the control panel.
    function establishUserInterface() {
        // Guard clause: Ensure the essential DOM elements for the panorama instance exist.
        if (!this.$elementContainer || !this.$elementRoot) {
            console.error("Panoramaview Control Panel: Critical DOM elements missing. UI creation aborted.");
            return;
        }

        // Remove any prior instances of this control panel within the current scope.
        jQuery('.panoview-control-panel', this.$elementRoot).remove();

        // Define configurations for all control buttons.
        var buttonConfigurations = [
            { id: 'displayToggle', text: 'V', className: '', initialHidden: true, style: { 'margin-left': '.5em' }, action: 'toggleVisibility' },
            { id: 'hidePanel', text: 'H', className: 'actionable', action: 'toggleVisibility' },
            { id: 'separator', text: '|', className: '', action: 'noop' },
            { id: 'touchControl', text: 'T', className: 'actionable', initialHidden: true, action: 'toggleInputMode' }, // Becomes visible if gyro is active
            { id: 'gyroControl', text: 'G', className: 'actionable', initialHidden: true, action: 'toggleInputMode' }, // Becomes visible if touch is active
            { id: 'zoomIn', text: '+', className: 'actionable', action: 'zoomIn' },
            { id: 'zoomOut', text: '-', className: 'actionable', action: 'zoomOut' },
            { id: 'moveLeft', text: 'L', className: 'actionable', action: 'panLeft' },
            { id: 'moveRight', text: 'R', className: 'actionable', action: 'panRight' },
            { id: 'moveUp', text: 'U', className: 'actionable', action: 'panUp' },
            { id: 'moveDown', text: 'D', className: 'actionable', action: 'panDown' },
            { id: 'startRotation', text: 'P', className: 'actionable', action: 'toggleAutoRotate' },
            { id: 'stopRotation', text: 'S', className: 'actionable', action: 'toggleAutoRotate' }
        ];

        // Initialize the uiComponents object and create button elements.
        uiComponents = {};
        buttonConfigurations.forEach(function(config) {
            var button = createUIElement('div', { 'class': 'panoview-panel-button ' + config.className });
            button.html(config.text);
            if (config.style) {
                button.css(config.style);
            }
            if (config.initialHidden) {
                button.hide();
            }
            uiComponents[config.id] = button;
        });

        // Adjust visibility for auto-rotate buttons based on initial state.
        if (this.autoRotationSpeed === 0) { // Assuming 0 means stopped
            uiComponents.stopRotation.hide();
            uiComponents.startRotation.show();
        } else {
            uiComponents.startRotation.hide();
            uiComponents.stopRotation.show();
        }

        // Create the main container for control buttons.
        var $buttonContainer = createUIElement('div', { 'class': 'panoview-panel-elements' })
                               .append(uiComponents.hidePanel)
                               .append(uiComponents.separator);

        // Check for device orientation API support to conditionally add gyro/touch controls.
        var isDeviceOrientationAPIAvailable = (typeof window.DeviceOrientationEvent !== 'undefined');
        if (isDeviceOrientationAPIAvailable) {
            $buttonContainer.append(uiComponents.touchControl)
                            .append(uiComponents.gyroControl);
            // Initially display the correct input mode button
            if (this.isGyroActive) { // Assuming 'isGyroActive' property exists
                uiComponents.gyroControl.hide();
                uiComponents.touchControl.show();
            } else {
                uiComponents.touchControl.hide();
                uiComponents.gyroControl.show();
            }
        }
        
        // Append remaining general controls.
        $buttonContainer.append(uiComponents.zoomIn)
                        .append(uiComponents.zoomOut)
                        .append(uiComponents.moveLeft)
                        .append(uiComponents.moveRight)
                        .append(uiComponents.moveUp)
                        .append(uiComponents.moveDown)
                        .append(uiComponents.startRotation)
                        .append(uiComponents.stopRotation)
                        .append(uiComponents.displayToggle);

        // Construct the full control panel element.
        $controlPanelElement = createUIElement('div', { 'class': 'panoview-control-panel' });
        // Add a background layer to ensure opacity doesn't cascade to buttons.
        $controlPanelElement.append(createUIElement('div', { 'class': 'panoview-panel-backdrop' }));
        $controlPanelElement.append($buttonContainer);

        // Attach the panel to the DOM and animate its appearance.
        $controlPanelElement.css('display', 'none');
        this.$elementContainer.after($controlPanelElement); // Place after the main panorama element
        $controlPanelElement.fadeIn('slow', function() {
            isPanelCurrentlyVisible = true; // Update state after animation completes
        });

        /* --- Event Bindings for Control Panel Buttons --- */

        // Helper for binding continuous actions (mousedown/touchstart to mouseup/touchend).
        var bindContinuousAction = function(element, startCallback, stopCallback, context) {
            element.on('touchstart mousedown', jQuery.proxy(startCallback, context));
            element.on('touchend mouseup', jQuery.proxy(stopCallback, context));
        };

        // Panel visibility toggles
        uiComponents.hidePanel.on('click', jQuery.proxy(adjustPanelVisibility, this));
        uiComponents.displayToggle.on('click', jQuery.proxy(adjustPanelVisibility, this));

        // Auto-rotate controls
        uiComponents.startRotation.on('click', jQuery.proxy(function() {
            displayRotationTerminator();
            this.toggleAutoRotation();
        }, this));
        uiComponents.stopRotation.on('click', jQuery.proxy(function() {
            displayRotationInitiator();
            this.toggleAutoRotation();
        }, this));

        // Override keydown binding for Spacebar to include control panel button updates.
        jQuery(window).on('keydown', jQuery.proxy(function(e) {
            if (e.originalEvent && e.originalEvent.which === 32) { // Spacebar key code
                this.toggleAutoRotation();
                // Synchronize control panel buttons with new rotation state
                if (this.autoRotationSpeed === 0) { // If now stopped
                    uiComponents.startRotation.click(); // Simulate click to update UI
                } else { // If now started
                    uiComponents.stopRotation.click(); // Simulate click to update UI
                }
                e.preventDefault(); // Prevent default spacebar action (e.g., scrolling)
            }
        }, this));

        // Gyroscope / Touch input mode toggles
        if (isDeviceOrientationAPIAvailable) {
            uiComponents.gyroControl.on('click', jQuery.proxy(function() {
                this.disableTouchInput(); // Assuming method exists
                this.enableGyroInput();    // Assuming method exists
                uiComponents.gyroControl.hide();
                uiComponents.touchControl.fadeIn('fast');
            }, this));

            uiComponents.touchControl.on('click', jQuery.proxy(function() {
                this.disableGyroInput();   // Assuming method exists
                this.enableTouchInput();   // Assuming method exists
                uiComponents.touchControl.hide();
                uiComponents.gyroControl.fadeIn('fast');
            }, this));
        }

        // Zoom controls
        bindContinuousAction(uiComponents.zoomIn, function() { debounceAction(jQuery.proxy(function() { this.adjustScale(0.05); }, this)); }, jQuery.proxy(this.stopScaleAdjustment, this), this);
        bindContinuousAction(uiComponents.zoomOut, function() { debounceAction(jQuery.proxy(function() { this.adjustScale(-0.05); }, this)); }, jQuery.proxy(this.stopScaleAdjustment, this), this);

        // Panning controls
        bindContinuousAction(uiComponents.moveLeft, function() { debounceAction(jQuery.proxy(function() { this.initiatePan(-0.7, 0); displayRotationInitiator(); }, this)); }, jQuery.proxy(this.terminatePan, this), this);
        bindContinuousAction(uiComponents.moveRight, function() { debounceAction(jQuery.proxy(function() { this.initiatePan(0.7, 0); displayRotationInitiator(); }, this)); }, jQuery.proxy(this.terminatePan, this), this);
        bindContinuousAction(uiComponents.moveUp, function() { debounceAction(jQuery.proxy(function() { this.initiatePan(0, 0.7); displayRotationInitiator(); }, this)); }, jQuery.proxy(this.terminatePan, this), this);
        bindContinuousAction(uiComponents.moveDown, function() { debounceAction(jQuery.proxy(function() { this.initiatePan(0, -0.7); displayRotationInitiator(); }, this)); }, jQuery.proxy(this.terminatePan, this), this);
    }

    // Toggles the visibility state of the control panel.
    this.adjustPanelVisibility = jQuery.proxy(function() {
        // Ensure the control panel element actually exists in the DOM.
        if ($controlPanelElement && $controlPanelElement.isPresent()) {
            if (isPanelCurrentlyVisible) {
                // Panel is visible, hide it.
                $controlPanelElement.animate({
                    left: '-' + ($controlPanelElement.outerWidth() - $controlPanelElement.outerHeight()) + 'px'
                }, 'fast', function() {
                    uiComponents.displayToggle.fadeIn('fast');
                    isPanelCurrentlyVisible = false;
                });
            } else {
                // Panel is hidden, show it.
                uiComponents.displayToggle.fadeOut('fast');
                $controlPanelElement.animate({
                    left: '0px'
                }, 'fast', function() {
                    isPanelCurrentlyVisible = true;
                });
            }
        }
    }, this);

    // Removes the control panel from the DOM.
    function dismantleUserInterface() {
        if ($controlPanelElement && $controlPanelElement.isPresent()) {
            $controlPanelElement.fadeOut('slow', function() {
                $controlPanelElement.remove();
                isPanelCurrentlyVisible = false; // Reset state
            });
        }
    }

    // Helper to switch the button display to 'Play' (initiate rotation).
    function displayRotationInitiator() {
        uiComponents.stopRotation.hide();
        uiComponents.startRotation.show();
    }

    // Helper to switch the button display to 'Stop' (terminate rotation).
    function displayRotationTerminator() {
        uiComponents.startRotation.hide();
        uiComponents.stopRotation.show();
    }

    // Register event handlers for panorama state changes.
    this.$elementContainer.on(this.EVENT_ROTATION_STOPPED, displayRotationInitiator);
    this.$elementContainer.on(this.EVENT_ROTATION_STARTED, displayRotationTerminator);

    // Initialize the control panel when the core panorama engine starts up.
    this.$elementContainer.on(this.EVENT_CORE_ENGINE_STARTED, jQuery.proxy(establishUserInterface, this));

    // Add a jQuery utility to check if an element exists in the DOM.
    // This is often used for defensive programming in plugins.
    jQuery.fn.isPresent = function() {
        return this.length > 0;
    };

    console.info("Panoramaview Control Panel module loaded successfully.");
});