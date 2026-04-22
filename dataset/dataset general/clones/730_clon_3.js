(function($pluginHost) {
    // Enforcing strict JavaScript mode for enhanced code quality.
    'use strict';

    // Core identification and metadata for the scroll management utility.
    var moduleID = 'SectionNavigator',
        versionInfo = '2.0.1-alpha'; // A slightly different version string

    // Default parameters governing the navigation behavior.
    var configPresets = {
        keyUpCode: 38,                   // Standard key code for the 'Up' arrow
        keyDownCode: 40,                 // Standard key code for the 'Down' arrow
        scrollEase: 'swing',             // Easing function for smooth animation, changed from 'linear'
        animationDuration: 850,          // Duration of the scroll transition in milliseconds, changed from 600
        highlightClass: 'current-section', // CSS class applied to the active navigation item, changed from 'active'
        pageChangeCallback: null,        // Custom function invoked upon active section change
        verticalPad: 10,                 // Additional vertical offset for scroll target position, changed from 0
        debugMode: false                 // New feature: Enable verbose console logging for development
    };

    /**
     * Initializes the SectionNavigator module, setting up all necessary event handlers
     * and configurations for seamless page scrolling.
     * @param {object} userOptions - Optional overrides to the default configuration.
     * @returns {object} An API object exposing public methods.
     */
    $pluginHost.sectionNavigator = function(userOptions) {

        // Consolidate default settings with any user-provided configurations.
        var currentConfig = $pluginHost.extend(true, {}, configPresets, userOptions); // Deep merge added

        // Internal state management for the current scroll position.
        var navigationState = {
            currentSectionIdx: 0, // Index of the section presently in view.
            maxSectionIdx: -1     // Highest valid section index found on the page.
        };

        // Conditional logging utility, active only in debugMode.
        var logMessage = function(msg) {
            if (currentConfig.debugMode && typeof console !== 'undefined' && console.log) {
                console.log(`[${moduleID} v${versionInfo}] ${msg}`);
            }
        };

        // Determines the maximum section index by scanning the DOM.
        var ascertainMaxSectionIndex = function() {
            var $allSectionDivs = $pluginHost('[data-section-id]');
            if ($allSectionDivs.length === 0) {
                logMessage("No elements with 'data-section-id' detected. Navigation will be limited.");
                navigationState.maxSectionIdx = -1;
                return;
            }
            var highestFoundIndex = -1;
            $allSectionDivs.each(function() {
                var sectionIdStr = $pluginHost(this).attr('data-section-id');
                var parsedIdNum = parseInt(sectionIdStr, 10);
                if (!isNaN(parsedIdNum) && parsedIdNum > highestFoundIndex) {
                    highestFoundIndex = parsedIdNum;
                }
            });
            navigationState.maxSectionIdx = highestFoundIndex;
            logMessage(`Maximum section index established as: ${navigationState.maxSectionIdx}.`);
        };

        // Execute initial setup for section indexing.
        ascertainMaxSectionIndex();

        /**
         * Initiates a smooth scrolling animation to the specified section.
         * @param {number} targetIndex - The numerical index of the section to navigate to.
         * @returns {boolean} True if the scroll animation was started, false otherwise.
         */
        var performScrollAnimation = function(targetIndex) {
            // Validate the target index before proceeding.
            if (targetIndex < 0 || targetIndex > navigationState.maxSectionIdx || isNaN(targetIndex)) {
                logMessage(`Attempted to scroll to an invalid index: ${targetIndex}.`);
                return false;
            }

            var $destinationSection = $pluginHost('[data-section-id=' + targetIndex + ']');
            if ($destinationSection.length === 0) {
                logMessage(`Target section with data-section-id=${targetIndex} not found in DOM.`);
                return false;
            }

            var sectionBaseOffset = $destinationSection.offset().top;
            var finalScrollPosition = sectionBaseOffset + currentConfig.verticalPad + 7; // Small arbitrary adjustment

            $pluginHost('html, body').stop(true, true).animate({ // Added .stop(true, true) to clear previous animations
                scrollTop: finalScrollPosition
            }, {
                duration: currentConfig.animationDuration,
                easing: currentConfig.scrollEase,
                complete: function() {
                    logMessage(`Scroll animation finalized for section ${targetIndex}.`);
                    // Ensure the visual highlight reflects the final scroll position.
                    updateActiveHighlight(targetIndex);
                }
            });
            return true;
        };

        /**
         * Processes click events from navigation elements.
         * @param {object} DOMevent - The DOM event object generated by the click.
         */
        var processNavigationClick = function(DOMevent) {
            DOMevent.preventDefault(); // Halt default browser behavior for anchor tags.

            var $originatingElement = $pluginHost(DOMevent.target);
            var navTargetVal = $originatingElement.closest("[data-nav-target]").attr('data-nav-target');
            var goToVal = $originatingElement.closest("[data-go-to]").attr('data-go-to');

            var resolvedSectionIdentifier = navTargetVal || goToVal; // Prioritize data-nav-target

            if (resolvedSectionIdentifier) {
                var numericalIdentifier = parseInt(resolvedSectionIdentifier, 10);
                if (!isNaN(numericalIdentifier)) {
                    performScrollAnimation(numericalIdentifier);
                    logMessage(`Click event triggered navigation to section: ${numericalIdentifier}.`);
                } else {
                    logMessage(`Failed to parse section identifier from click: ${resolvedSectionIdentifier}.`);
                }
            } else {
                logMessage("Click event on navigation element, but no valid target attribute found.");
            }
        };

        /**
         * Manages keyboard input for navigation actions.
         * @param {object} keyEvent - The keyboard event object.
         * @returns {boolean} False if the key event was handled, true to allow default browser behavior.
         */
        var processKeyboardInput = function(keyEvent) {
            var keyCode = keyEvent.which;
            var isPageAnimating = $pluginHost('html, body').is(':animated');

            // If an animation is active and an arrow key is pressed, consume the event.
            if (isPageAnimating && (keyCode === currentConfig.keyUpCode || keyCode === currentConfig.keyDownCode)) {
                logMessage("Keyboard input suppressed during active scroll animation.");
                return false;
            }

            var proposedTargetIndex = -1;
            if (keyCode === currentConfig.keyUpCode && navigationState.currentSectionIdx > 0) {
                proposedTargetIndex = navigationState.currentSectionIdx - 1;
            } else if (keyCode === currentConfig.keyDownCode && navigationState.currentSectionIdx < navigationState.maxSectionIdx) {
                proposedTargetIndex = navigationState.currentSectionIdx + 1;
            }

            if (proposedTargetIndex !== -1) {
                performScrollAnimation(proposedTargetIndex);
                logMessage(`Keyboard command: moving to section ${proposedTargetIndex}.`);
                return false; // Prevent default scroll for handled keys.
            }

            return true; // Allow other key presses to propagate.
        };

        /**
         * Adjusts the highlight class on navigation elements and notifies about page changes.
         * @param {number} newActiveIndex - The index of the section now considered active.
         */
        var updateActiveHighlight = function(newActiveIndex) {
            if (newActiveIndex === null || newActiveIndex === undefined || isNaN(newActiveIndex)) {
                logMessage("Attempted to update highlight with an invalid index.");
                return;
            }

            var priorActiveIndex = navigationState.currentSectionIdx;

            // Invoke the callback only if a genuine section change occurred.
            if (currentConfig.pageChangeCallback && newActiveIndex !== priorActiveIndex) {
                logMessage(`Section change detected: from ${priorActiveIndex} to ${newActiveIndex}. Executing callback.`);
                currentConfig.pageChangeCallback(newActiveIndex, priorActiveIndex);
            }

            navigationState.currentSectionIdx = newActiveIndex; // Update the internal state.

            // Remove highlight from all navigation items and then apply it to the new active one.
            $pluginHost('[data-nav-target]').removeClass(currentConfig.highlightClass);
            $pluginHost('[data-nav-target=' + newActiveIndex + ']').addClass(currentConfig.highlightClass);

            logMessage(`Navigation highlight updated for section: ${newActiveIndex}.`);
        };

        /**
         * Monitors the window's scroll position and updates the active section highlight accordingly.
         * This function is debounced to optimize performance during rapid scrolling.
         */
        var observeScrollPosition = (function() {
            var debounceTimer = null;
            var debounceInterval = 100; // Delay in milliseconds for scroll debounce.

            var executeScrollCheck = function() {
                var currentWindowScrollTop = $pluginHost($pluginHost.window).scrollTop();
                var $allScrollableSections = $pluginHost('[data-section-id]');

                if ($allScrollableSections.length === 0) {
                    logMessage("No scrollable sections found during continuous monitoring.");
                    return;
                }

                var identifiedActiveSectionId = null;
                var windowHeight = $pluginHost($pluginHost.window).height();
                var viewportCenter = currentWindowScrollTop + (windowHeight / 2); // Use viewport center for more robust detection

                $allScrollableSections.each(function() {
                    var $sectionElement = $pluginHost(this);
                    var sectionIdentifier = parseInt($sectionElement.attr('data-section-id'), 10);
                    if (isNaN(sectionIdentifier)) return true; // Skip invalid sections

                    var sectionTopEdge = $sectionElement.offset().top + currentConfig.verticalPad;
                    var sectionBottomEdge = sectionTopEdge + $sectionElement.outerHeight();

                    // Determine if the viewport's center point is within this section's bounds.
                    if (viewportCenter >= sectionTopEdge && viewportCenter < sectionBottomEdge) {
                        identifiedActiveSectionId = sectionIdentifier;
                        return false; // Found the active section, break the loop.
                    }
                });

                // Update highlight only if a new active section is identified and it's different from current.
                if (identifiedActiveSectionId !== null && identifiedActiveSectionId !== navigationState.currentSectionIdx) {
                    updateActiveHighlight(identifiedActiveSectionId);
                } else if (identifiedActiveSectionId === null && $allScrollableSections.length > 0) {
                    // Edge case: If no section is clearly active (e.g., scrolled between sections or outside defined areas),
                    // default to the first section if available.
                    var firstSectionID = parseInt($allScrollableSections.first().attr('data-section-id'), 10);
                    if (!isNaN(firstSectionID) && navigationState.currentSectionIdx !== firstSectionID) {
                        updateActiveHighlight(firstSectionID);
                    }
                }
            };

            return function() {
                clearTimeout(debounceTimer);
                debounceTimer = setTimeout(executeScrollCheck, debounceInterval);
            };
        })();


        // --- Event Listener Registration & Initial Execution ---

        // Bind the debounced scroll monitoring function to the window's scroll event.
        $pluginHost($pluginHost.window).on('scroll', observeScrollPosition);

        // Perform an initial check to correctly set the active section and highlight on page load.
        observeScrollPosition();

        // Attach the keyboard input handler to the window.
        $pluginHost($pluginHost.window).on('keydown', processKeyboardInput);

        // Delegate click event handling for navigation items to the document body.
        // This ensures compatibility with dynamically added navigation elements.
        $pluginHost('body').on('click', '[data-nav-target], [data-go-to]', processNavigationClick);

        // Public API for external control and information retrieval (Type III addition).
        return {
            /**
             * Programmatically scrolls to a specific section.
             * @param {number} index - The index of the section to scroll to.
             * @returns {boolean} True if the scroll was initiated, false otherwise.
             */
            goToSection: function(index) {
                logMessage(`External API call: goToSection(${index}).`);
                return performScrollAnimation(index);
            },
            /**
             * Retrieves the index of the currently active section.
             * @returns {number} The index of the current active section.
             */
            getActiveSection: function() {
                return navigationState.currentSectionIdx;
            },
            /**
             * Provides the current version string of the module.
             * @returns {string} The module's version information.
             */
            getModuleVersion: function() {
                return versionInfo;
            }
        };
    };
}(jQuery));