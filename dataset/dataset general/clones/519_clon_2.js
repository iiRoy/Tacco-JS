/*
 * =========================================================
 * Custom Popup Panel v1.0.0
 * Based on Bootstrap Modal logic
 * =========================================================
 * Copyright 2023 Acme Corp.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =========================================================
 */
! function ( $jQ ) {

    "use strict";

    /*
     * POPUP PANEL CORE CLASS
     * ======================
     * Defines the structure and behavior for a popup window.
     */
    var PopupPanel = function ( displayArea, settings ) {
        this.settings = settings;
        this.$container = $jQ(displayArea)
            .delegate('[data-action="close-popup"]', 'tap.close.popup', $jQ.proxy(this.conceal, this));
    };

    PopupPanel.prototype = {

        // The constructor reference for this class.
        constructor: PopupPanel,

        // Toggles the current visibility state of the panel.
        toggleVisibility: function () {
            return this[!this.isVisible ? 'display' : 'conceal']();
        },

        // Makes the popup panel visible.
        display: function () {
            var currentInstance = this;

            if (currentInstance.isVisible) {
                return;
            }

            // Add a class to the body to indicate an active popup.
            $jQ('body')
                .addClass('popup-active');

            this.isVisible = true;
            this.$container
                .trigger('display'); // Emit a custom 'display' event.

            // Enable keyboard dismissal.
            handleEscapeKey.call(currentInstance);
            // Initiate the background overlay and then show the panel.
            overlayScreen.call(currentInstance, function () {
                var animateEffect = $jQ.support.transition && currentInstance.$container.hasClass('transition-fade');

                // If the panel is not attached to a parent, append it to the document body.
                !currentInstance.$container.parent().length && currentInstance.$container.appendTo(document.body);

                currentInstance.$container
                    .show(); // Display the main panel element.

                // Force a browser reflow to ensure CSS transitions apply correctly.
                if (animateEffect) {
                    currentInstance.$container[0].offsetWidth;
                }

                currentInstance.$container
                    .addClass('visible'); // Add a class for visual 'in' state.

                // Wait for transition to end before triggering 'displayed', or trigger immediately.
                animateEffect ?
                    currentInstance.$container.one($jQ.support.transition.end, function () {
                        currentInstance.$container.trigger('displayed');
                    }) :
                    currentInstance.$container.trigger('displayed');
            });
        },

        // Hides the popup panel.
        conceal: function ( triggeredEvent ) {
            // Prevent the default action for the event that triggered concealment.
            triggeredEvent && triggeredEvent.preventDefault();

            if (!this.isVisible) {
                return;
            }

            var currentInstance = this;
            this.isVisible = false;

            // Remove the body class indicating an active popup.
            $jQ('body')
                .removeClass('popup-active');

            // Disable keyboard dismissal.
            handleEscapeKey.call(currentInstance);

            this.$container
                .trigger('conceal') // Emit a custom 'conceal' event.
                .removeClass('visible'); // Remove the visual 'in' state class.

            // Use animation for hiding if supported and the panel has the 'transition-fade' class.
            $jQ.support.transition && this.$container.hasClass('transition-fade') ?
                concealWithAnimation.call(currentInstance) :
                concealPanel.call(currentInstance);
        }
    };


    /*
     * POPUP PANEL HELPER FUNCTIONS
     * ============================
     * Internal methods supporting popup panel operations.
     */

    // Hides the panel with a CSS transition effect.
    function concealWithAnimation() {
        var currentInstance = this,
            delayHandle = setTimeout(function () {
                currentInstance.$container.off($jQ.support.transition.end);
                concealPanel.call(currentInstance);
            }, 500); // Timeout for transition completion (e.g., 500ms).

        this.$container.one($jQ.support.transition.end, function () {
            clearTimeout(delayHandle);
            concealPanel.call(currentInstance);
        });
    }

    // Immediately hides the panel and triggers its 'concealed' event.
    function concealPanel() {
        this.$container
            .hide() // Set the element's display to 'none'.
            .trigger('concealed'); // Emit a custom 'concealed' event.

        // Remove the background overlay.
        overlayScreen.call(this);
    }

    // Manages the display and removal of the background overlay screen.
    function overlayScreen( completionCallback ) {
        var currentInstance = this,
            shouldAnimate = this.$container.hasClass('transition-fade') ? 'transition-fade' : '';

        // If the panel is visible and the overlay is enabled in settings.
        if (this.isVisible && this.settings.overlayScreen) {
            var performAnimation = $jQ.support.transition && shouldAnimate;

            this.$overlay = $jQ('<div class="popup-overlay ' + shouldAnimate + '" />')
                .appendTo(".application-root"); // Append overlay to a specific root element.

            // If overlay is not 'static', allow clicking it to dismiss the panel.
            if (this.settings.overlayScreen !== 'static') {
                this.$overlay.click($jQ.proxy(this.conceal, this));
            }

            // Force reflow for CSS animations.
            if (performAnimation) {
                this.$overlay[0].offsetWidth;
            }

            this.$overlay
                .addClass('visible'); // Add class for visual 'in' state.

            // Execute the callback after transition or immediately.
            performAnimation ?
                this.$overlay.one($jQ.support.transition.end, completionCallback) :
                completionCallback();

        } else if (!this.isVisible && this.$overlay) { // If panel is not visible and an overlay currently exists.
            this.$overlay
                .removeClass('visible'); // Remove 'visible' class.

            // Remove overlay after transition or immediately.
            $jQ.support.transition && this.$container.hasClass('transition-fade') ?
                this.$overlay.one($jQ.support.transition.end, $jQ.proxy(clearOverlay, this)) :
                clearOverlay.call(this);

        } else if (completionCallback) { // If no overlay action, just run the callback.
            completionCallback();
        }
    }

    // Removes the overlay element from the DOM and clears its reference.
    function clearOverlay() {
        this.$overlay.remove();
        this.$overlay = null;
    }

    // Sets up or tears down the escape key listener for panel dismissal.
    function handleEscapeKey() {
        var currentInstance = this;
        // If panel is visible and keyboard dismissal is allowed.
        if (this.isVisible && this.settings.keyboard) {
            $jQ(document)
                .on('keyUp.close.popup', function ( eventObj ) {
                    eventObj.which === 27 && currentInstance.conceal(); // Dismiss on ESC key press (keyCode 27).
                });
        } else if (!this.isVisible) { // If panel is not visible, remove the event listener.
            $jQ(document)
                .off('keyUp.close.popup');
        }
    }


    /*
     * POPUP PANEL JQUERY PLUGIN DEFINITION
     * ====================================
     * Extends jQuery's prototype with a 'popup' function.
     */
    $jQ.fn.popup = function ( configParam ) {
        return this.each(function () {
            var $processedItem = $jQ(this),
                instanceRef = $processedItem.data('popup'),
                extendedSettings = $jQ.extend({}, $jQ.fn.popup.defaultSettings, $processedItem.data(), typeof configParam === 'object' && configParam);

            // Create a new PopupPanel instance if one doesn't exist for this element.
            if (!instanceRef) {
                $processedItem.data('popup', (instanceRef = new PopupPanel(this, extendedSettings)));
            }

            // Execute a specific method or display the panel based on configuration.
            if (typeof configParam === 'string') {
                instanceRef[configParam]();
            } else if (extendedSettings.display) {
                instanceRef.display();
            }
        });
    };

    // Default configuration settings for the popup plugin.
    $jQ.fn.popup.defaultSettings = {
        overlayScreen: true, // Whether to show a background overlay.
        keyboard: true, // Whether the escape key can dismiss the popup.
        display: true // Whether the popup should be shown immediately upon initialization.
    };

    // Expose the PopupPanel constructor for external access.
    $jQ.fn.popup.PanelConstructor = PopupPanel;


    /*
     * POPUP PANEL DATA-API INTEGRATION
     * ================================
     * Auto-initialization and control via HTML data attributes.
     */
    $jQ(function () {
        $jQ('body')
            .on('tap.popup.data-interface', '[data-trigger="popup"]', function ( triggeredEvent ) {
                var $processedItem = $jQ(this),
                    targetLink,
                    // Determine the target element for the popup from data attributes or href.
                    $destination = $jQ($processedItem.attr('data-display-target') || (targetLink = $processedItem.attr('href')) && targetLink.replace(/.*(?=#[^\s]+$)/, '')); // Regex to strip base URL for IE7 compatibility.

                triggeredEvent.preventDefault(); // Prevent default link/button action.

                // Determine the action to take: toggle visibility or initialize with settings.
                var actionRequest = $destination.data('popup') ? 'toggleVisibility' : $jQ.extend({}, $destination.data(), $processedItem.data());

                $destination.popup(actionRequest); // Call the popup plugin on the target element.
            });
    });

}(window.jQuery);