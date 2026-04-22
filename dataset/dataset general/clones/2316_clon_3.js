/**
 * Dynamic Accordion Navigation
 * A lightweight jQuery extension to manage nested list visibility, creating interactive navigation trees.
 *
 * Copyright (c) 2024 Your Name or Company
 * Distributed under the terms of the custom license defined at yourwebsite.com/license
 *
 * @version 2.0.0
 */

(function(jqAlias) {
    // Enable strict parsing and execution mode for the current script.
    "use strict";

    /*--------------------------------------------------*
     * Core Logic Module
     *--------------------------------------------------*/

    /**
     * Orchestrates the initialization and event binding for nested navigation elements.
     * It configures the initial display state and attaches event listeners for user interaction.
     *
     * @param {string} containerIdentifier - The unique ID attribute of the main navigation container.
     * @param {object} configurationObject - An object containing user-defined settings for the plugin.
     */
    function processNavigationElements(containerIdentifier, configurationObject) {
        // Ensure a valid container ID is provided before proceeding.
        if (!containerIdentifier || typeof containerIdentifier !== 'string') {
            console.error("Invalid container ID provided for navigation processing.");
            return;
        }

        // Construct the base selector for parent list items that contain sub-lists.
        // This targets any LI element within the main container that has a direct UL child.
        const $parentItemsWithSublists = jqAlias('#' + containerIdentifier + ' li:has(ul)');

        // If no such parent items are found, there's nothing to process.
        if ($parentItemsWithSublists.length === 0) {
            console.debug("No expandable sub-navigation elements detected in container: #" + containerIdentifier);
            return;
        }

        // Iterate over each identified parent list item.
        $parentItemsWithSublists.each(function() {
            const $currentParentListItem = jqAlias(this);
            // The direct child UL is the actual sub-list to be toggled.
            const $targetSublist = $currentParentListItem.children('ul').first();

            // Determine the clickable element within the parent LI to act as the toggle trigger.
            // Prioritize the first direct child that is not a UL (e.g., an <a> or <span>).
            // If no such child exists, the parent LI itself becomes the trigger.
            let $interactionTrigger = $currentParentListItem.children().not('ul').first();
            if ($interactionTrigger.length === 0) {
                $interactionTrigger = $currentParentListItem; // Fallback to the LI if no specific trigger child.
            }

            // Helper function to apply/remove CSS classes based on expansion state.
            const manageDisplayClasses = function($elementToStyle, shouldExpand) {
                if (shouldExpand) {
                    $elementToStyle.removeClass(configurationObject.collapsedClass).addClass(configurationObject.expandedClass);
                } else {
                    $elementToStyle.removeClass(configurationObject.expandedClass).addClass(configurationObject.collapsedClass);
                }
            };

            // Set the initial display state of the sub-list based on configuration.
            if (configurationObject.startCollapsedState === true) {
                $targetSublist.css('display', 'none'); // Use direct CSS for initial hide.
                manageDisplayClasses($targetSublist, false);
            } else {
                manageDisplayClasses($targetSublist, true);
            }

            // Attach the click event handler to the designated trigger element.
            $interactionTrigger.on('click', function(eventObject) {
                // Prevent default action if the trigger is a link, to avoid navigation.
                if (jqAlias(this).is('a')) {
                    eventObject.preventDefault();
                }
                // Stop event propagation to prevent parent list items from also toggling.
                eventObject.stopPropagation();

                const isCurrentlyExpanded = $targetSublist.hasClass(configurationObject.expandedClass);
                const transitionSpeed = configurationObject.animationDurationMs;
                const selectedMethod = configurationObject.transitionMethod.toLowerCase();

                // Execute the appropriate transition based on the configured method.
                switch (selectedMethod) {
                    case 'fade':
                        if (isCurrentlyExpanded) {
                            $targetSublist.fadeOut(transitionSpeed, function() {
                                manageDisplayClasses(jqAlias(this), false);
                            });
                        } else {
                            manageDisplayClasses($targetSublist, true);
                            $targetSublist.fadeIn(transitionSpeed);
                        }
                        break;

                    case 'slide':
                        if (isCurrentlyExpanded) {
                            $targetSublist.slideUp(transitionSpeed, function() {
                                manageDisplayClasses(jqAlias(this), false);
                            });
                        } else {
                            manageDisplayClasses($targetSublist, true);
                            $targetSublist.slideDown(transitionSpeed);
                        }
                        break;

                    case 'instant': // Renamed from 'none' for clarity.
                    default:
                        if (isCurrentlyExpanded) {
                            manageDisplayClasses($targetSublist, false);
                            $targetSublist.hide();
                        } else {
                            manageDisplayClasses($targetSublist, true);
                            $targetSublist.show();
                        }
                        break;
                } // End of transition method switch.
            }); // End of click event handler.
        }); // End of each parent item iteration.
    } // End of processNavigationElements function.

    /*--------------------------------------------------*
     * Plugin Definition and Configuration
     *--------------------------------------------------*/

    /**
     * jQuery plugin entry point for initializing the collapsible navigation.
     *
     * @param {object} userSettings - Optional object to override default plugin settings.
     * @returns {jQuery} The jQuery object for chaining.
     */
    jqAlias.fn.toggleNavItems = function(userSettings) {
        // Merge user-provided settings with the plugin's default options.
        // A deep merge (true) is used to ensure nested objects are also merged correctly,
        // though not strictly necessary for the current simple defaults.
        const effectiveConfig = jqAlias.extend(true, {}, jqAlias.fn.toggleNavItems.defaultOptions, userSettings);

        // Iterate over each selected DOM element.
        return this.each(function() {
            // Validate that the current element has a unique ID attribute.
            // An ID is crucial for correctly targeting nested menus.
            if (!this.id) {
                console.error("Skipping element as it lacks a unique ID attribute, which is required for toggleNavItems.", this);
                return; // Continue to the next element in the collection.
            }

            // Initialize the navigation processing for the current element.
            processNavigationElements(this.id, effectiveConfig);
        });
    }; // End of toggleNavItems plugin function.

    /**
     * Default configuration options for the toggleNavItems plugin.
     * These can be overridden by passing an options object to the plugin call.
     */
    jqAlias.fn.toggleNavItems.defaultOptions = {
        transitionMethod: 'instant', // 'instant', 'fade', or 'slide'
        startCollapsedState: false,  // True to collapse all sub-menus on load, false to expand.
        animationDurationMs: 200,    // Speed of animation in milliseconds (e.g., 'fast' maps to ~200ms).
        collapsedClass: 'nav-closed',// CSS class applied when a sub-menu is hidden.
        expandedClass: 'nav-open'    // CSS class applied when a sub-menu is visible.
    }; // End of defaultOptions.

}(jQuery)); // Pass jQuery object as jqAlias to avoid conflicts and for minification.