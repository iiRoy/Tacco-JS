+function (jQuery) {
    "use strict";

    // This module provides a flexible content overlay mechanism, similar to a modal or lightbox.
    // It's designed to display dynamic content, including images, with responsive sizing.

    // --- Component Constants & Selectors ---
    const OVERLAY_NAMESPACE = 'co.overlay';
    const DATA_TOGGLE_ATTR = 'data-toggle="content-overlay"';
    const DISMISS_ATTR = '[data-dismiss="content-overlay"]';
    const KEY_ESCAPE = 27; // ASCII for Escape key code

    // --- Main Component Class Definition ---
    var ContentOverlay = function (hostElement, userConfig) {
        // Ensure a valid host element is provided.
        if (!hostElement) {
            console.error("ContentOverlay: Host element is required for initialization. Aborting.");
            return;
        }

        this._currentConfig = userConfig;
        this._targetElement = jQuery(hostElement);
        this._overlayElement = null; // Represents the dimmer background element
        this._isActive = null; // Tracks the current display state of the overlay

        // If a remote URL is specified in the configuration, load the content dynamically.
        // This is typically used for fetching HTML fragments or partial views.
        if (this._currentConfig.remote && typeof this._currentConfig.remote === 'string') {
            this._targetElement.load(this._currentConfig.remote, jQuery.proxy(function() {
                // Optionally, trigger a custom event once the remote content has loaded.
                this._targetElement.trigger('contentLoaded.' + OVERLAY_NAMESPACE);
            }, this));
        }

        // Assign a unique ID to the overlay element if it doesn't already have one.
        // This is beneficial for accessibility and specific targeting.
        if (!this._targetElement.attr('id')) {
            this._targetElement.attr('id', 'content-overlay-' + Math.random().toString(36).substr(2, 9));
        }

        // Set up initial ARIA attributes for better accessibility.
        this._setupInitialAccessibilityAttributes();
    };

    // Inherit from Bootstrap's Modal constructor to leverage its core functionality.
    // This reduces boilerplate for common modal patterns like event handling and transition management.
    ContentOverlay.prototype = jQuery.extend({}, jQuery.fn.modal.Constructor.prototype);
    ContentOverlay.prototype.constructor = ContentOverlay; // Restore the constructor reference

    // --- Default Settings for the Content Overlay ---
    ContentOverlay.DEFAULT_SETTINGS = {
        backdrop: true, // Display a semi-transparent background overlay
        keyboard: true, // Allow dismissal using the Escape key
        show: true,     // Automatically display the overlay upon instantiation
        remote: false   // URL to fetch content from asynchronously
    };

    // Helper method to apply initial ARIA attributes for accessibility compliance.
    ContentOverlay.prototype._setupInitialAccessibilityAttributes = function() {
        this._targetElement.attr({
            'role': 'dialog', // Indicates the element is a dialog window
            'aria-modal': 'true', // Marks the dialog as modal (blocking interaction outside)
            'aria-hidden': 'true', // Initially hides the element from accessibility trees
            'tabindex': '-1' // Makes the element programmatically focusable but not part of tab order
        });
    };

    // --- Core Methods ---

    // Displays the content overlay, making it visible to the user.
    ContentOverlay.prototype.present = function (triggeringElement) {
        const instanceContext = this;
        // Create a custom event to signify the overlay is about to be shown.
        const displayEvent = jQuery.Event('display.' + OVERLAY_NAMESPACE, { relatedTarget: triggeringElement });

        this._targetElement.trigger(displayEvent);

        // If the overlay is already active or an event handler has prevented its display, exit early.
        if (this._isActive || displayEvent.isDefaultPrevented()) {
            return;
        }

        this._isActive = true; // Mark the overlay as active
        this.handleKeyboardDismiss(true); // Bind the Escape key handler

        // Attach a click listener to dismiss buttons within the overlay.
        this._targetElement.on('click.dismiss.' + OVERLAY_NAMESPACE, DISMISS_ATTR, this.conceal.bind(this));

        // Before making the overlay visible, calculate its optimal dimensions,
        // especially crucial for images to prevent layout shifts.
        this.calculateContentLayout(function () {
            // Manage the backdrop display, and then proceed with showing the overlay.
            instanceContext.manageBackgroundOverlay(function () {
                const hasTransitionEffect = jQuery.support.transition && instanceContext._targetElement.hasClass('fade');

                // Ensure the overlay element is directly appended to the body,
                // which helps with z-index and positioning contexts.
                if (!instanceContext._targetElement.parent().length) {
                    instanceContext._targetElement.appendTo(document.body);
                }

                instanceContext._targetElement.show(); // Make the overlay visible

                if (hasTransitionEffect) {
                    // Force a browser reflow to ensure CSS transitions are correctly applied from the 'in' class.
                    instanceContext._targetElement[0].offsetWidth;
                }

                instanceContext._targetElement
                    .addClass('in') // Apply the transition-in class
                    .attr('aria-hidden', false); // Update accessibility state

                instanceContext.trapFocus(); // Confine keyboard focus within the overlay

                // Create and trigger an event indicating the overlay has fully displayed.
                const displayedEvent = jQuery.Event('displayed.' + OVERLAY_NAMESPACE, { relatedTarget: triggeringElement });

                // If transitions are active, wait for the animation to complete before triggering the event.
                if (hasTransitionEffect) {
                    instanceContext._targetElement.find('.overlay-dialog') // Target the dialog for transition end
                        .one(jQuery.support.transition.end, function () {
                            instanceContext._targetElement.trigger('focus').trigger(displayedEvent);
                        })
                        .emulateTransitionEnd(300); // Fallback for browsers without proper transition end support
                } else {
                    instanceContext._targetElement.trigger('focus').trigger(displayedEvent);
                }
            });
        });
    };

    // Hides the content overlay, making it invisible.
    ContentOverlay.prototype.conceal = function (eventObject, isSlidingBetweenViews) {
        // Prevent the default action of the event if one is provided (e.g., a click event).
        if (eventObject) {
            eventObject.preventDefault();
        }

        // Create a custom event to signify the overlay is about to be hidden.
        const hideEvent = jQuery.Event('conceal.' + OVERLAY_NAMESPACE);
        this._targetElement.trigger(hideEvent);

        // If the overlay is not active or an event handler has prevented its concealment, exit early.
        if (!this._isActive || hideEvent.isDefaultPrevented()) {
            return;
        }

        this._isActive = false; // Mark the overlay as inactive
        this.handleKeyboardDismiss(false); // Unbind the Escape key handler
        jQuery(document).off('focusin.' + OVERLAY_NAMESPACE); // Remove the focus trap

        this._targetElement
            .removeClass('in') // Remove the transition-in class
            .attr('aria-hidden', true) // Update accessibility state
            .off('click.dismiss.' + OVERLAY_NAMESPACE); // Unbind dismiss click handlers

        const hasTransitionEffect = jQuery.support.transition && this._targetElement.hasClass('fade');

        // If transitions are active, wait for the animation to complete before finalizing concealment.
        if (hasTransitionEffect) {
            this._targetElement
                .one(jQuery.support.transition.end, this.completeConcealment.bind(this, isSlidingBetweenViews))
                .emulateTransitionEnd(300); // Fallback
        } else {
            this.completeConcealment(isSlidingBetweenViews);
        }
    };

    // Ensures that keyboard focus remains within the boundaries of the active overlay.
    ContentOverlay.prototype.trapFocus = function () {
        jQuery(document)
            .off('focusin.' + OVERLAY_NAMESPACE) // First, remove any existing focusin handlers to prevent duplicates
            .on('focusin.' + OVERLAY_NAMESPACE, jQuery.proxy(function (focusEvent) {
                // If the currently focused element is not the overlay itself and not a descendant of the overlay,
                // programmatically shift focus back to the overlay element.
                if (this._targetElement[0] !== focusEvent.target && !this._targetElement.has(focusEvent.target).length) {
                    this._targetElement.trigger('focus');
                }
            }, this));
    };

    // Manages the binding and unbinding of the Escape key handler for dismissal.
    ContentOverlay.prototype.handleKeyboardDismiss = function (bind = true) {
        if (bind && this._isActive && this._currentConfig.keyboard) {
            this._targetElement.on('keyup.dismiss.' + OVERLAY_NAMESPACE, jQuery.proxy(function (keyEvent) {
                // Check if the pressed key is the Escape key.
                if (keyEvent.which === KEY_ESCAPE) {
                    this.conceal();
                }
            }, this));
        } else if (!bind) {
            // If `bind` is false, unbind the keyup handler.
            this._targetElement.off('keyup.dismiss.' + OVERLAY_NAMESPACE);
        }
    };

    // Finalizes the hiding process after any CSS transitions are complete.
    ContentOverlay.prototype.completeConcealment = function (isSlidingBetweenViews) {
        const instanceContext = this;
        this._targetElement.hide(); // Visually hide the overlay element
        this.manageBackgroundOverlay(function () {
            instanceContext.removeOverlayElement(); // Remove the backdrop from the DOM

            // Only trigger the 'concealed' event if not transitioning between multiple overlays (e.g., in a gallery).
            if (!isSlidingBetweenViews) {
                instanceContext._targetElement.trigger('concealed.' + OVERLAY_NAMESPACE);
            }
        });
    };

    // Manages the creation, display, and removal of the background overlay (backdrop).
    ContentOverlay.prototype.manageBackgroundOverlay = function (completionCallback) {
        const instanceContext = this;
        const transitionClass = this._targetElement.hasClass('fade') ? 'fade' : '';

        // Case 1: The overlay is being shown and a backdrop is configured.
        if (this._isActive && this._currentConfig.backdrop) {
            const needsTransition = jQuery.support.transition && transitionClass;

            // Create the backdrop element and append it to the document body.
            this._overlayElement = jQuery('<div class="modal-backdrop ' + transitionClass + '" />')
                .appendTo(document.body);

            // Bind a click handler to the backdrop for dismissal, if the backdrop is not 'static'.
            this._overlayElement.on('click.dismiss.' + OVERLAY_NAMESPACE, jQuery.proxy(function (event) {
                // Ensure the click originated directly on the backdrop, not a child element.
                if (event.target !== event.currentTarget) {
                    return;
                }
                if (this._currentConfig.backdrop === 'static') {
                    // If backdrop is 'static', prevent dismissal and refocus on the overlay itself.
                    this._targetElement.trigger('focus');
                } else {
                    this.conceal(); // Dismiss the overlay
                }
            }, this));

            if (needsTransition) {
                this._overlayElement[0].offsetWidth; // Force a reflow for CSS transitions
            }

            this._overlayElement.addClass('in'); // Apply the transition-in class

            if (!completionCallback) {
                return; // If no callback, we're done here
            }

            // Execute the completion callback after the transition or immediately.
            if (needsTransition) {
                this._overlayElement
                    .one(jQuery.support.transition.end, completionCallback)
                    .emulateTransitionEnd(150); // Fallback
            } else {
                completionCallback();
            }

        // Case 2: The overlay is being hidden and a backdrop currently exists.
        } else if (!this._isActive && this._overlayElement) {
            this._overlayElement.removeClass('in'); // Start the transition out

            const needsTransition = jQuery.support.transition && this._targetElement.hasClass('fade');

            if (needsTransition) {
                this._overlayElement
                    .one(jQuery.support.transition.end, completionCallback)
                    .emulateTransitionEnd(150); // Fallback
            } else {
                completionCallback();
            }

        // Case 3: No backdrop is involved, simply execute the callback if provided.
        } else if (completionCallback) {
            completionCallback();
        }
    };

    // Removes the backdrop element from the DOM if it exists.
    ContentOverlay.prototype.removeOverlayElement = function () {
        if (this._overlayElement) {
            this._overlayElement.remove();
            this._overlayElement = null; // Clear the reference
        }
    };

    // Preloads content (specifically images) and calculates optimal display dimensions
    // to ensure the overlay appears correctly sized from the start.
    ContentOverlay.prototype.calculateContentLayout = function (completionCallback) {
        const eventCompletionCallbacks = jQuery.Callbacks();
        if (completionCallback) {
            eventCompletionCallbacks.add(completionCallback);
        }
        const instanceContext = this;

        let viewportHeight, viewportWidth,
            topPad, bottomPad, leftPad, rightPad,
            contentImageElement, imagePreloader,
            initialImgWidth, initialImgHeight;

        // Obtain the current dimensions of the browser viewport.
        viewportHeight = jQuery(window).height();
        viewportWidth = jQuery(window).width();

        // Retrieve padding values from the `.overlay-content` area.
        const contentArea = instanceContext._targetElement.find('.overlay-content');
        topPad = parseInt(contentArea.css('padding-top'), 10) || 0;
        bottomPad = parseInt(contentArea.css('padding-bottom'), 10) || 0;
        leftPad = parseInt(contentArea.css('padding-left'), 10) || 0;
        rightPad = parseInt(contentArea.css('padding-right'), 10) || 0;

        // Attempt to locate the first image within the content area.
        contentImageElement = contentArea.find('img:first');

        // If no image is found or if it lacks a `src` attribute, proceed without image sizing.
        if (contentImageElement.length === 0 || !contentImageElement.attr('src')) {
            return eventCompletionCallbacks.fire();
        }

        imagePreloader = new Image();
        imagePreloader.onload = function () {
            let currentImageWidth = imagePreloader.width;
            let currentImageHeight = imagePreloader.height;

            // Calculate the maximum available space for content within the viewport.
            const maxContentWidth = viewportWidth - leftPad - rightPad;
            const maxContentHeight = viewportHeight - topPad - bottomPad;

            // Adjust image width if it exceeds the maximum content width, maintaining aspect ratio.
            if (currentImageWidth > maxContentWidth) {
                initialImgWidth = currentImageWidth;
                initialImgHeight = currentImageHeight;
                currentImageWidth = maxContentWidth;
                currentImageHeight = (initialImgHeight / initialImgWidth) * currentImageWidth;
            }

            // Adjust image height if it exceeds the maximum content height (after any width adjustment),
            // again maintaining aspect ratio.
            if (currentImageHeight > maxContentHeight) {
                initialImgWidth = currentImageWidth; // Use the potentially scaled width
                initialImgHeight = currentImageHeight; // Use the potentially scaled height
                currentImageHeight = maxContentHeight;
                currentImageWidth = (initialImgWidth / initialImgHeight) * currentImageHeight;
            }

            // Apply the newly calculated dimensions to the overlay dialog, its content area, and the image itself.
            const dialogOverallWidth = Math.round(currentImageWidth + leftPad + rightPad);
            const dialogOverallHeight = Math.round(currentImageHeight + topPad + bottomPad);

            instanceContext._targetElement.find('.overlay-dialog').css({
                'position': 'fixed',
                'width': dialogOverallWidth,
                'height': dialogOverallHeight,
                'top': (viewportHeight / 2) - (dialogOverallHeight / 2),
                'left': '50%',
                'margin-left': -1 * (dialogOverallWidth / 2) // Center horizontally
            });

            contentArea.css({
                'width': dialogOverallWidth,
                'height': dialogOverallHeight
            });

            contentImageElement.css({
                'width': Math.round(currentImageWidth),
                'height': Math.round(currentImageHeight)
            });

            // All sizing adjustments are complete; fire the callbacks.
            eventCompletionCallbacks.fire();
        };
        imagePreloader.onerror = function() {
            // If the image fails to load, log a warning and proceed with overlay display without sizing.
            console.warn("ContentOverlay: Failed to load image from " + contentImageElement.attr('src'));
            eventCompletionCallbacks.fire();
        };
        imagePreloader.src = contentImageElement.attr('src');
    };

    // Navigates to the next or previous content item in a gallery-like sequence.
    ContentOverlay.prototype.navigateContent = function (navigationDirection) {
        const instanceContext = this;

        // Conceal the current overlay. Pass `true` for `isSlidingBetweenViews` to prevent
        // the 'concealed' event from firing until the next overlay is successfully shown.
        instanceContext.conceal(null, true);

        let adjacentTarget;
        if (navigationDirection === 'next') {
            adjacentTarget = instanceContext._targetElement.next('.content-overlay');
        } else if (navigationDirection === 'prev') {
            adjacentTarget = instanceContext._targetElement.prev('.content-overlay');
        }

        if (adjacentTarget && adjacentTarget.length) {
            // If an adjacent overlay exists, initialize and display it.
            adjacentTarget.contentOverlay('present');
        } else {
            // If no next/previous overlay is found, trigger the 'concealed' event for the original overlay.
            // This ensures the hidden state is properly registered when navigation ends.
            instanceContext._targetElement.trigger('concealed.' + OVERLAY_NAMESPACE);
        }
    };


    // --- jQuery Plugin Definition ---

    // Store the original jQuery function associated with 'contentOverlay' to allow no-conflict mode.
    const priorJQueryFn = jQuery.fn.contentOverlay;

    // Define the jQuery plugin for ContentOverlay.
    jQuery.fn.contentOverlay = function (actionOrConfig, triggeringElement) {
        return this.each(function () {
            const currentElement = jQuery(this);
            let componentData = currentElement.data(OVERLAY_NAMESPACE);

            // Merge default settings with data attributes from the element and any user-provided configuration.
            const componentConfig = jQuery.extend(
                {},
                ContentOverlay.DEFAULT_SETTINGS,
                currentElement.data(),
                typeof actionOrConfig === 'object' && actionOrConfig
            );

            // If no ContentOverlay instance exists for this element, create a new one.
            if (!componentData) {
                componentData = new ContentOverlay(this, componentConfig);
                currentElement.data(OVERLAY_NAMESPACE, componentData);
            }

            // If `actionOrConfig` is a string, attempt to call a method on the instance.
            // Otherwise, if `show` is true in the config, display the overlay.
            if (typeof actionOrConfig === 'string') {
                if (componentData[actionOrConfig]) {
                    componentData[actionOrConfig](triggeringElement);
                } else {
                    console.warn(`ContentOverlay: Method "${actionOrConfig}" does not exist on this instance.`);
                }
            } else if (componentConfig.show) {
                componentData.present(triggeringElement);
            }
        });
    };

    // Make the ContentOverlay constructor directly accessible via the jQuery plugin object.
    jQuery.fn.contentOverlay.Constructor = ContentOverlay;


    // --- No Conflict Mode ---

    // Allows other jQuery plugins to use `jQuery.fn.contentOverlay` without interference
    // by restoring the previously assigned function (if any).
    jQuery.fn.contentOverlay.noConflict = function () {
        jQuery.fn.contentOverlay = priorJQueryFn;
        return this; // Return the new plugin definition for chaining
    };


    // --- Data API Integration ---
    // Automatically initialize and control content overlays using HTML data attributes.

    // Handle clicks on elements designated to toggle a content overlay.
    jQuery(document).on('click.' + OVERLAY_NAMESPACE + '.data-api', DATA_TOGGLE_ATTR, function (event) {
        const triggeringElement = jQuery(this);
        const linkUrl = triggeringElement.attr('href');
        // Determine the target overlay element. The regex strips hash for IE7 compatibility.
        const activationTarget = jQuery(triggeringElement.attr('data-target') || (linkUrl && linkUrl.replace(/.*(?=#[^\s]+$)/, '')));
        // Determine the action: 'toggle' if an instance already exists, or create a new one.
        const componentAction = activationTarget.data(OVERLAY_NAMESPACE) ? 'toggle' : jQuery.extend(
            { remote: !/#/.test(linkUrl) && linkUrl }, // If href is not just a hash, treat it as a remote URL
            activationTarget.data(), // Element's data attributes
            triggeringElement.data() // Triggering element's data attributes
        );

        event.preventDefault(); // Prevent default link behavior (e.g., navigating to #hash)

        activationTarget
            .contentOverlay(componentAction, this) // Initialize/toggle the overlay
            .one('conceal.' + OVERLAY_NAMESPACE, function () { // Bind a one-time handler for when the overlay hides
                // If the original triggering element is still visible, return focus to it.
                if (triggeringElement.is(':visible')) {
                    triggeringElement.trigger('focus');
                }
            });
    });

    // Handle clicks on navigation controls within content overlays (e.g., next/previous buttons).
    jQuery(document).on('click', '.overlay-control', function (event) {
        event.preventDefault();

        const controlElement = jQuery(this);
        // Find the closest parent `.content-overlay` and trigger its navigation method.
        controlElement.parents('.content-overlay')
            .contentOverlay('navigateContent', controlElement.data('overlay-nav'));
    });

    // Event handlers for modifying the `body` class based on overlay state.
    // Adds 'overlay-active' class to the body when an overlay is displayed.
    jQuery(document).on('display.' + OVERLAY_NAMESPACE, '.content-overlay', function () {
        jQuery(document.body).addClass('overlay-active');
    });
    // Removes 'overlay-active' class from the body when an overlay is concealed.
    jQuery(document).on('concealed.' + OVERLAY_NAMESPACE, '.content-overlay', function () {
        jQuery(document.body).removeClass('overlay-active');
    });

}(window.jQuery);