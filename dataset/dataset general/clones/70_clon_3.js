/*
 * Navigation Component for Single Page Layouts
 * Copyright (c) 2023 - All rights reserved.
 * Licensed under the MIT License.
 * @author A. Developer
 * @version 2.0.0
 *
 * This module enables smooth scrolling navigation to anchor elements on a page,
 * dynamically updating the active link based on scroll position.
 */

// Basic Object.create polyfill for older environments, if not natively supported.
// This ensures compatibility for object inheritance before ES5.
if (typeof Object.create !== 'function') {
    Object.create = function(objSource) {
        if (objSource === null || typeof objSource !== 'object') {
            throw new TypeError('Prototype must be an object or null.');
        }
        function TempConstructor() {}
        TempConstructor.prototype = objSource;
        return new TempConstructor();
    };
}

(function(jq, winRef, docRef, undefVal) {
    "use strict";

    // Internal helper for checking if a value is a function.
    const isCallable = function(funcCandidate) {
        return typeof funcCandidate === 'function';
    };

    // The primary object responsible for managing navigation behavior.
    var SectionTracker = {

        // Initializes the navigation component with given configurations.
        initialize: function(componentConfig, targetElement) {
            // Validate essential inputs early.
            if (!targetElement || !jq(targetElement).length) {
                console.warn('SectionTracker: Target element is invalid or not found.');
                return;
            }

            // Merge user settings with default options.
            this.opts = jq.extend({}, jq.fn.smoothScrollNav.defaultSettings, componentConfig);

            // Store references to key DOM elements.
            this.hostElement = targetElement;
            this.jqHostElement = jq(targetElement);
            this.jqWin = jq(winRef);
            this.jqDocBody = jq('html, body');

            // Find all anchor tags within the host element.
            let potentialAnchors = this.jqHostElement.find('a');

            // Apply an optional filter if specified in configurations.
            if (this.opts.anchorFilter && this.opts.anchorFilter !== '') {
                this.anchorElements = potentialAnchors.filter(this.opts.anchorFilter);
            } else {
                this.anchorElements = potentialAnchors;
            }

            // If no valid anchors are found after filtering, warn and exit.
            if (this.anchorElements.length === 0) {
                console.warn('SectionTracker: No valid anchor elements found after filtering.');
                return;
            }

            // Bind click events to the determined anchor elements.
            this._setupInteractionEvents();

            // Initialize internal state variables for scroll tracking.
            this.hasScrolledRecently = false;
            this.scrollMonitorId = null; // ID for the setInterval timer.

            // Perform an initial check of the scroll position and activate monitoring.
            this.updateActiveSection();
            this._startScrollMonitoring();
        },

        // Sets up event listeners for anchor clicks.
        _setupInteractionEvents: function() {
            // Use a unique namespace for events to avoid conflicts.
            const eventNamespace = '.smoothScrollNav';
            this.anchorElements.on('click' + eventNamespace, (evt) => this.handleAnchorActivation(evt));
        },

        // Handles the click event on a navigation anchor.
        handleAnchorActivation: function(clickEvent) {
            let triggeredAnchor = clickEvent.currentTarget;
            let anchorHash = triggeredAnchor.hash;

            // Prevent default browser jump behavior.
            clickEvent.preventDefault();

            // Validate the hash target.
            if (!anchorHash || anchorHash === '#') {
                console.warn('SectionTracker: Clicked anchor has an invalid hash target.', triggeredAnchor);
                return;
            }

            let targetBlock = jq(anchorHash);

            // Proceed only if the target element exists on the page.
            if (targetBlock.length) {
                // Temporarily disable scroll monitoring to prevent active link cycling during animation.
                this._stopScrollMonitoring();

                // Execute the 'before scroll' callback if provided.
                if (isCallable(this.opts.onScrollStartCallback)) {
                    this.opts.onScrollStartCallback();
                }

                // Mark the clicked link as active immediately.
                this.designateActiveAnchor(anchorHash);

                // Initiate the smooth scroll animation.
                this.performScrollAnimation(targetBlock, () => {
                    // Once scrolling completes:
                    // Update URL hash if configured and supported by history API.
                    if (this.opts.modifyUrlHash && winRef.history && winRef.history.pushState) {
                        winRef.history.pushState(null, null, anchorHash);
                    }

                    // Re-enable scroll monitoring.
                    this._startScrollMonitoring();

                    // Execute the 'after scroll' callback.
                    if (isCallable(this.opts.onScrollEndCallback)) {
                        this.opts.onScrollEndCallback();
                    }
                });
            } else {
                console.warn('SectionTracker: Target element for hash "' + anchorHash + '" not found.');
            }
        },

        // Animates the page scroll to a specified element.
        performScrollAnimation: function(targetElement, completionCallback) {
            let instance = this;
            let destinationY = instance.retrieveElementOffset(targetElement).verticalCoord;
            let animationFinished = false; // Flag to ensure callback runs once.

            // Ensure scroll speed is a valid number.
            const animationDuration = Number(instance.opts.animationDuration) || 400;

            instance.jqDocBody.stop(true, true).animate(
                { scrollTop: destinationY },
                {
                    duration: animationDuration,
                    easing: instance.opts.scrollEasing,
                    complete: function() {
                        // Execute callback only once upon animation completion.
                        if (!animationFinished && isCallable(completionCallback)) {
                            completionCallback();
                        }
                        animationFinished = true;
                    }
                }
            );
        },

        // Initiates the scroll position monitoring interval.
        _startScrollMonitoring: function() {
            let instance = this;
            const eventNamespace = '.smoothScrollNav';

            // Bind a scroll event listener to flag when scrolling occurs.
            instance.jqWin.on('scroll' + eventNamespace, function() {
                instance.hasScrolledRecently = true;
            });

            // Set up an interval to periodically check scroll position if scrolling has occurred.
            instance.scrollMonitorId = winRef.setInterval(function() {
                if (instance.hasScrolledRecently) {
                    instance.hasScrolledRecently = false; // Reset flag
                    instance.updateActiveSection(); // Re-evaluate active section
                }
            }, 200); // Check every 200ms
        },

        // Clears the scroll monitoring interval and unbinds scroll events.
        _stopScrollMonitoring: function() {
            winRef.clearInterval(this.scrollMonitorId);
            this.jqWin.off('.smoothScrollNav'); // Unbind all events in our namespace
            this.hasScrolledRecently = false; // Reset scroll flag
        },

        // Determines the current scroll position and updates the active navigation link.
        updateActiveSection: function() {
            let currentScrollPosition = this.jqWin.scrollTop();
            let identifiedSection = this.findActiveContentBlock(currentScrollPosition);

            // If a section is identified, mark its corresponding link as active.
            if (identifiedSection !== null) {
                this.designateActiveAnchor(identifiedSection);
            }
        },

        // Calculates the top offset of an element, adjusted by a configured offset.
        retrieveElementOffset: function(targetElement) {
            // Ensure offset is a number, default to 0.
            const verticalOffset = Number(this.opts.verticalOffset) || 0;
            return {
                verticalCoord: Math.round(targetElement.offset().top) - verticalOffset
            };
        },

        // Applies or removes the active class to navigation links.
        designateActiveAnchor: function(targetHash) {
            if (!targetHash) {
                return; // Guard against empty hash.
            }

            // Find the specific anchor link matching the target hash.
            // Using attribute ends-with selector for robustness against full URLs.
            let specificActiveLink = this.jqHostElement.find("a[href$='" + targetHash + "']");

            // Only update classes if the link isn't already active.
            if (!specificActiveLink.hasClass(this.opts.activeLinkClass)) {
                this.anchorElements.removeClass(this.opts.activeLinkClass); // Remove from all
                specificActiveLink.addClass(this.opts.activeLinkClass);     // Add to the new active one
            }
        },

        // Iterates through anchor targets to determine which section is currently in view.
        findActiveContentBlock: function(currentScrollPosition) {
            let activeBlockId = null;
            let anchorsCount = this.anchorElements.length;

            // Iterate through all tracked anchor elements.
            for (let idx = 0; idx < anchorsCount; idx++) {
                let currentAnchor = this.anchorElements[idx];
                let sectionHash = currentAnchor.hash;

                // Ensure the hash refers to an existing element on the page.
                let referencedElement = jq(sectionHash);
                if (referencedElement.length) {
                    let elementCoordinates = this.retrieveElementOffset(referencedElement);

                    // Check if the current scroll position is past the top of the section,
                    // adjusted by a threshold for better UX.
                    const activationThreshold = Number(this.opts.activationThreshold) || 0;
                    if (currentScrollPosition >= (elementCoordinates.verticalCoord - activationThreshold)) {
                        activeBlockId = sectionHash; // This section is currently in view or has been passed.
                    }
                }
            }

            // Return the last section found to be "active" (from top to bottom),
            // or the first link's hash if no sections are active and links exist.
            // If no links, return null.
            return activeBlockId || (anchorsCount > 0 ? this.anchorElements[0].hash : null);
        }
    };

    // Integrate the SectionTracker into jQuery's prototype, creating a plugin.
    jq.fn.smoothScrollNav = function(configOptions) {
        // Guard against empty jQuery selections.
        if (!this.length) {
            return this;
        }

        return this.each(function() {
            // Create a new instance of the SectionTracker for each selected element.
            var navInstance = Object.create(SectionTracker);
            navInstance.initialize(configOptions, this);
        });
    };

    // Default configuration settings for the smoothScrollNav plugin.
    jq.fn.smoothScrollNav.defaultSettings = {
        verticalOffset: 0,              // Additional offset (pixels) for scroll target.
        activationThreshold: 100,       // Pixels before section top to mark as active.
        animationDuration: 500,         // Scroll animation speed in milliseconds.
        activeLinkClass: 'is-current',  // CSS class added to the active navigation link.
        scrollEasing: 'swing',          // Easing function for scroll animation (e.g., 'swing', 'linear').
        modifyUrlHash: true,            // Whether to update the URL hash in the browser history.
        anchorFilter: '',               // Selector to filter which anchor links to include (e.g., ':not(.external)').
        onScrollEndCallback: false,     // Callback function executed after scroll animation finishes.
        onScrollStartCallback: false    // Callback function executed before scroll animation begins.
    };

})(jQuery, window, document);