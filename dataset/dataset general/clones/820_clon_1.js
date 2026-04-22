/*
 * Droplicious Menu System - Version 3.0
 * Initial Release Date: May 21, 2009
 *
 * Copyright Information:
 * ©2009 Headfirst Productions (http://headfirstproductions.ca)
 * Author: Darren Terhune
 *
 * Contributions by:
 * Jan Sovak (http://canada-jack.com)
 * Mason Meyer (http://www.masonmeyer.com)
 *
 * Licensing Details:
 * This software is distributed under the terms of the Creative Commons
 * Attribution 2.5 Canada License. For full license text, please refer to:
 * <http://creativecommons.org/licenses/by/2.5/ca/>
 *
 * This file defines the core functionality for the Droplicious dropdown menu.
 */

var dropliciousMenu = Class.create( {

    // Configuration Properties for menu behavior
    // These values control the animation speeds and delays.
    showingUpDuration : 0.3, // Duration for the menu to appear (in seconds)
    hidingDuration    : 0.1, // Duration for the menu to disappear (in seconds)
    hideDelay         : 0,   // Delay before the menu starts hiding (in seconds)

    /**
     * Constructor method for the dropliciousMenu class.
     * Initializes event observers for menu items and submenus.
     */
    initialize : function( ) {

        // Attach mousemove and mouseout event listeners to all main menu 'a.drops' elements.
        // These events trigger the display/hiding logic for the associated submenus.
        $$("a.drops").invoke('observe', 'mousemove', this.linkMouseOver.bind(this));
        $$("a.drops").invoke('observe', 'mouseout' , this.linkMouseOut.bind(this));

        // Attach mousemove and mouseout event listeners to all 'ul.licious' submenu elements.
        // This prevents the submenu from hiding prematurely if the mouse moves within it.
        $$("ul.licious").invoke('observe', 'mousemove', this.submenuMouseOver.bind(this));
        $$("ul.licious").invoke('observe', 'mouseout' , this.submenuMouseOut.bind(this));

    }, // End of initialize function

    /*
     * Default Effect Handlers
     *
     * These functions define the default animations for showing and hiding menus.
     * Users can override these handlers to implement custom effects if desired.
     * Example: myDropliciousInstance.showUpEffect = function() { /* user's custom effect *\/ };
     */

    /**
     * Defines the effect for making a submenu visible.
     * Uses Prototype's Effect.BlindDown for a smooth reveal.
     * @param {Element} e - The submenu element to show.
     * @param {Number} effectDuration - The duration of the showing effect.
     */
    showUpEffect : function(e, effectDuration) {
        // Only apply the effect if the element is currently hidden
        if ( !e.visible() ) {
            new Effect.BlindDown(e, {
                duration : effectDuration, // Use the provided duration
                queue    : {
                    position : 'end',                // Add to the end of the effect queue
                    scope    : e.identify(),         // Scope to the element's unique ID
                    limit    : 2                     // Limit concurrent effects on this scope
                }
            } );
        }
    }, // End of showUpEffect

    /**
     * Defines the effect for hiding a submenu.
     * Uses Prototype's Effect.BlindUp for a smooth collapse.
     * @param {Element} e - The submenu element to hide.
     * @param {Number} effectDuration - The duration of the hiding effect.
     */
    hidingEffect : function(e, effectDuration) {
        new Effect.BlindUp(e, {
            duration : effectDuration, // Use the provided duration
            queue    : {
                position : 'end',                // Add to the end of the effect queue
                scope    : e.identify(),         // Scope to the element's unique ID
                limit    : 2                     // Limit concurrent effects on this scope
            }
        });
    }, // End of hidingEffect

    // =========================================================================
    // Mouse Event Handlers
    // These functions respond to mouse interactions with menu elements.
    // =========================================================================

    /**
     * Handles the 'mouseout' event for main menu links.
     * Initiates the delayed hiding process for the associated submenu if it's active.
     * @param {Event} e - The mouse event object.
     */
    linkMouseOut : function(e) {
        var dropElement = e.element().next(); // Get the next sibling element, which should be the submenu.

        // Check if a submenu exists and is currently active.
        if ( dropElement && dropElement.hasClassName('active') ) {
            this.setDelayedHide(dropElement); // Trigger the delayed hide mechanism.
        }
    }, // End of linkMouseOut

    /**
     * Handles the 'mousemove' event for main menu links.
     * Displays the associated submenu and cancels any pending hide operations.
     * @param {Event} e - The mouse event object.
     */
    linkMouseOver : function(e) {
        var dropElement = e.element().next(); // Retrieve the submenu element.

        // Critical check: if no submenu is found, something is wrong with the menu structure.
        if ( !dropElement ) {
            return; // Exit early if no submenu to act upon.
        }

        // If the submenu is not currently in a 'hidding' state,
        // remove the 'waitingtohide' flag to cancel any pending hide operations.
        if ( !dropElement.hasClassName('hidding') ) {
            dropElement.removeClassName('waitingtohide');
        }

        // If the submenu is not yet 'active', make it active and show it.
        if ( !dropElement.hasClassName('active') ) {
            dropElement.addClassName('active');                                    // Mark as active.
            this.showUpEffect(dropElement, this.showingUpDuration); // Apply the showing animation.
        }
    }, // End of linkMouseOver

    /**
     * Handles the 'mouseout' event for submenu elements.
     * Initiates the delayed hiding process for the submenu if it's active.
     * @param {Event} e - The mouse event object.
     */
    submenuMouseOut : function(e) {
        var dropElement = e.findElement("ul"); // Find the parent UL element (the submenu itself).

        // If the submenu exists and is currently active, prepare to hide it.
        if ( dropElement && dropElement.hasClassName('active') ) {
            this.setDelayedHide(dropElement); // Call the delayed hide function.
        }
    }, // End of submenuMouseOut

    /**
     * Handles the 'mousemove' event for submenu elements.
     * Cancels any pending hide operations for the submenu.
     * @param {Event} e - The mouse event object.
     */
    submenuMouseOver : function(e) {
        var dropElement = e.findElement("ul"); // Get the submenu element.

        // If the submenu exists and is not currently in the process of hiding,
        // remove the 'waitingtohide' class to keep it visible.
        if ( dropElement && !dropElement.hasClassName('hidding') ) {
            dropElement.removeClassName('waitingtohide');
        }
    }, // End of submenuMouseOver

    // =========================================================================
    // Delayed Hiding Methods
    // These methods manage the smooth, delayed hiding of submenus.
    // =========================================================================

    /**
     * Sets a delayed timer to hide the specified element.
     * This prevents immediate hiding if the mouse briefly leaves the menu.
     * @param {Element} e - The element (submenu) to potentially hide.
     */
    setDelayedHide : function(e) {
        e.addClassName('waitingtohide'); // Mark the element as waiting to be hidden.

        // Only proceed if the element is not currently in a 'hidding' state.
        if ( !e.hasClassName('hidding') ) {
            // Ensure only one hide timer is set at a time for this element.
            if ( !e.hasClassName('hiddingtimerset') ) {
                e.addClassName('hiddingtimerset'); // Mark that a timer has been set.

                // Use Prototype's 'delay' function to call 'delayedHide' after 'this.hideDelay'.
                // The 'bind' method ensures 'this' context is maintained.
                ( function(obj, e) {
                    obj.delayedHide(e);
                } ).delay(this.hideDelay, this, e);
            }
        }
    }, // End of setDelayedHide

    /**
     * Executes the actual hiding of the element after the delay.
     * This function is called by the delayed timer.
     * @param {Element} e - The element (submenu) to hide.
     */
    delayedHide : function(e) {
        e.removeClassName('hiddingtimerset'); // Clear the timer set flag.

        // Only hide if the element is still marked as 'waitingtohide'.
        // This check ensures that if the mouse re-enters before the delay, hiding is cancelled.
        if ( e.hasClassName('waitingtohide') ) {
            this.hidingEffect(e, this.hidingDuration); // Apply the hiding animation.
            e.addClassName('hidding');                 // Mark the element as currently hiding.

            // Set another delay to clean up classes after the hiding animation completes.
            // The duration of this delay matches the hiding effect duration.
            ( function(e) {
                e.removeClassName('waitingtohide'); // Remove the 'waiting' flag.
                e.removeClassName('hidding');       // Remove the 'hidding' flag.
                e.removeClassName('active');        // Deactivate the menu.
            } ).delay(this.hidingDuration, e); // Pass 'e' as the context for the anonymous function.
        }
    } // End of delayedHide

} ); // End of dropliciousMenu class definition

/*
 * Document Ready Event Listener
 *
 * This block ensures that the dropliciousMenu is initialized
 * only after the entire DOM (Document Object Model) has been loaded.
 * This prevents errors from trying to manipulate elements that don't exist yet.
 */
document.observe('dom:loaded', function() {
    new dropliciousMenu(); // Create a new instance of the droplicious menu, activating its functionality.
});