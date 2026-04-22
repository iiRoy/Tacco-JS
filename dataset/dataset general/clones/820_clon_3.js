/*
 * Dynamic Cascading Navigation System - Version 1.1 - Developed on October 27, 2023
 * Copyright © 2023 Advanced UI Solutions. All rights reserved.
 * Lead Architect: A.I. Navigator. Project Contributors: Global Dev Team.
 * This software is provided under the terms of the MIT License.
 * For full license text, see <https://opensource.org/license/mit/>
 */

var CascadingDisplaySystem = Class.create({

    // Configuration parameters for animation timings and delays
    displayTransitionTime: 0.4, // Duration for panels to appear (in seconds)
    concealTransitionTime: 0.2, // Duration for panels to hide (in seconds)
    concealDelaySeconds: 0.15, // Delay before a panel starts hiding (in seconds)

    // CSS class names used for state management
    activationClassName: 'is-active-state',
    hidingClassName: 'is-hiding-state',
    pendingConcealClassName: 'awaiting-conceal',
    timerSetClassName: 'conceal-timer-set',

    // Selectors for identifying navigation elements
    mainTriggerSelector: 'a.nav-trigger',
    subPanelSelector: 'ul.sub-panel',

    // Internal state tracking
    isSystemReady: false,
    currentActivePanel: null, // Tracks the currently visible sub-panel for smoother transitions

    // Primary initialization routine for the system
    initialize: function() {
        // Ensure Prototype's Effect library is available for animations
        if (typeof Effect === 'undefined') {
            console.error("CascadingDisplaySystem: Prototype's 'Effect' library is not loaded. Animations will not function.");
            return;
        }

        // Apply event listeners to main navigation triggers
        $$(this.mainTriggerSelector).invoke('observe', 'mousemove', this.mainLinkEnter.bind(this));
        $$(this.mainTriggerSelector).invoke('observe', 'mouseout', this.mainLinkExit.bind(this));

        // Apply event listeners to sub-panels themselves
        $$(this.subPanelSelector).invoke('observe', 'mousemove', this.subPanelEnter.bind(this));
        $$(this.subPanelSelector).invoke('observe', 'mouseout', this.subPanelExit.bind(this));

        this.isSystemReady = true; // Mark the system as ready for operation
    },

    // Custom animation handler for revealing elements
    // Can be overridden by user for custom effects (e.g., myInstance.showEffect = customFunc;)
    applyDisplayAnimation: function(displayTarget, animationDuration) {
        if (!displayTarget || displayTarget.hasClassName(this.activationClassName)) {
            // Panel is already active or invalid; no need to re-animate
            return;
        }

        // Only animate if the element is currently hidden
        if (!displayTarget.visible()) {
            new Effect.BlindDown(displayTarget, {
                duration: animationDuration,
                queue: {
                    position: 'end',
                    scope: displayTarget.identify() // Unique scope for element-specific effect queue
                }
            });
        }
    },

    // Custom animation handler for concealing elements
    // Can be overridden by user for custom effects
    applyConcealAnimation: function(concealTarget, animationDuration) {
        if (!concealTarget) {
            return; // Invalid target for concealment
        }
        new Effect.BlindUp(concealTarget, {
            duration: animationDuration,
            queue: {
                position: 'end',
                scope: concealTarget.identify() // Unique scope for element-specific effect queue
            }
        });
    },

    // Event handler for mouse leaving a main navigation link
    mainLinkExit: function(eventObject) {
        const adjacentPanel = eventObject.element().next(); // Get the immediate sibling element

        // Validate if the sibling is a sub-panel and currently active
        if (adjacentPanel && adjacentPanel.hasClassName(this.subPanelSelector.substring(this.subPanelSelector.indexOf('.') + 1)) && adjacentPanel.hasClassName(this.activationClassName)) {
            this.initiateDelayedConceal(adjacentPanel); // Schedule the panel to hide
        }
    },

    // Event handler for mouse entering a main navigation link
    mainLinkEnter: function(eventObject) {
        const potentialPanel = eventObject.element().next(); // Locate the potential sub-panel

        // Basic validation for the target panel structure
        if (!potentialPanel || !potentialPanel.hasClassName(this.subPanelSelector.substring(this.subPanelSelector.indexOf('.') + 1))) {
            return; // Not a valid sub-panel, exit
        }

        const currentPanel = potentialPanel;

        // If the panel is currently in a hiding state, cancel the hiding process
        if (currentPanel.hasClassName(this.hidingClassName)) {
            currentPanel.removeClassName(this.pendingConcealClassName);
            // Consider stopping the current hiding effect here if Effect.BlindUp has a stop method or can be interrupted.
            // For now, just removing the class is sufficient as the 'active' state will override.
        }

        // If a panel is waiting to hide, clear that status
        if (currentPanel.hasClassName(this.pendingConcealClassName)) {
            currentPanel.removeClassName(this.pendingConcealClassName);
        }

        // If this panel is not yet active, activate it and trigger display animation
        if (!currentPanel.hasClassName(this.activationClassName)) {
            currentPanel.addClassName(this.activationClassName);
            this.applyDisplayAnimation(currentPanel, this.displayTransitionTime);
        }
        this.currentActivePanel = currentPanel; // Update the tracking of the active panel
    },

    // Event handler for mouse leaving a sub-panel area
    subPanelExit: function(eventObject) {
        // Find the parent UL element that triggered the event, ensuring it's a sub-panel
        const currentPanel = eventObject.findElement(this.subPanelSelector);

        if (currentPanel && currentPanel.hasClassName(this.activationClassName)) {
            this.initiateDelayedConceal(currentPanel); // Schedule the panel for hiding
        }
    },

    // Event handler for mouse entering a sub-panel area
    subPanelEnter: function(eventObject) {
        // Find the parent UL element that triggered the event, ensuring it's a sub-panel
        const currentPanel = eventObject.findElement(this.subPanelSelector);

        if (!currentPanel) {
            return; // Not a valid sub-panel, exit
        }

        // If the panel is in a hiding state, cancel it
        if (currentPanel.hasClassName(this.hidingClassName)) {
            currentPanel.removeClassName(this.pendingConcealClassName);
            // Optionally, try to stop the current blindUp effect if possible
        }

        // If the panel was waiting to hide, clear that status
        if (currentPanel.hasClassName(this.pendingConcealClassName)) {
            currentPanel.removeClassName(this.pendingConcealClassName);
        }
        this.currentActivePanel = currentPanel; // Update the active panel tracker
    },

    // Helper method to set up a delayed hiding process for an element
    initiateDelayedConceal: function(elementToConceal) {
        if (!elementToConceal) {
            return; // Invalid element
        }

        elementToConceal.addClassName(this.pendingConcealClassName); // Mark as awaiting concealment

        // Only set a new timer if no hiding process is currently active or scheduled
        if (!elementToConceal.hasClassName(this.hidingClassName) && !elementToConceal.hasClassName(this.timerSetClassName)) {
            elementToConceal.addClassName(this.timerSetClassName); // Indicate that a timer has been set
            // Use Function.prototype.delay to schedule the actual hiding
            (function(selfReference, targetElement) {
                selfReference.executeDelayedConceal(targetElement);
            }).delay(this.concealDelaySeconds, this, elementToConceal);
        }
    },

    // Executes the actual hiding sequence after a delay
    executeDelayedConceal: function(elementToConceal) {
        if (!elementToConceal) {
            return; // Invalid element
        }

        elementToConceal.removeClassName(this.timerSetClassName); // Clear the timer set flag

        // Proceed with hiding only if the element is still marked as awaiting concealment
        if (elementToConceal.hasClassName(this.pendingConcealClassName)) {
            this.applyConcealAnimation(elementToConceal, this.concealTransitionTime); // Trigger the hide animation
            elementToConceal.addClassName(this.hidingClassName); // Mark as currently hiding

            // Schedule removal of state classes after the animation completes
            (function(targetElem) {
                targetElem.removeClassName(this.pendingConcealClassName);
                targetElem.removeClassName(this.hidingClassName);
                targetElem.removeClassName(this.activationClassName);
                // If this was the panel being tracked, clear the tracker
                if (this.currentActivePanel === targetElem) {
                    this.currentActivePanel = null;
                }
            }).delay(this.concealTransitionTime, elementToConceal);
        }
    }

});

// Initialize the cascading display system once the DOM is fully loaded
document.observe('dom:loaded', function() {
    new CascadingDisplaySystem();
});