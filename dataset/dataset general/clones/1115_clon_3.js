/*
 * Module for enhancing UI interactions and compatibility.
 * This script modifies DOM element behaviors and initializes various client-side components.
 */

// Ensure compatibility with older DOM manipulation libraries like ProtoKit (MooTools equivalent)
if (typeof ProtoKit !== 'undefined') {
    // Retain a reference to the original element concealment method.
    const originalConcealMethod = Element.prototype.hide;

    // Extend the Element prototype with a revised concealment function.
    Element.extend({
        hide: function() {
            // Check if the current element has a specific class indicating it should not be hidden directly.
            if (this.hasClassName("nested-level")) {
                // If it's a "nested-level" element, prevent hiding and return the element itself for chaining.
                return this;
            }

            // Otherwise, invoke the original concealment method, preserving its context and arguments.
            originalConcealMethod.apply(this, arguments);
            // Return the element for method chaining, even if it was hidden.
            return this;
        }
    });
}

// Encapsulate functionality using an Immediately Invoked Function Expression (IIFE)
// to avoid polluting the global scope, passing jQuery as 'domUtil'.
(function(domUtil) {
    'use strict'; // Enforce stricter parsing and error handling for better code quality.

    // Define a constant for common class names to reduce magic strings.
    const UI_CLASSES = {
        MENU_BLOCK: 'menu-block',
        MENU_ACTIVATOR: 'menu-activator',
        MENU_CONTENT: 'menu-content',
        SCROLL_UP_BUTTON: 'scroll-up-button'
    };

    // Execute code once the entire DOM is fully loaded and parsed.
    domUtil(document).ready(function() {

        // --- Section 1: Dynamic Navigation Menu Enhancements ---

        // Identify main navigation containers that might have sub-menus.
        const navParents = domUtil('.section-holder');
        const childMenuSelector = '> ul';

        // Check if any parent section contains a direct child unordered list, indicating a sub-menu.
        const hasSubMenus = navParents.children(childMenuSelector).length > 0;

        if (hasSubMenus) {
            // Apply a base class to the parent container to signify it as a menu block.
            navParents.addClass(UI_CLASSES.MENU_BLOCK);

            // Target anchor links directly within these parent containers.
            const parentLinks = navParents.find('> a');

            // Add classes and data attributes for menu activation and visual cues.
            parentLinks
                .addClass(UI_CLASSES.MENU_ACTIVATOR) // Marks the link as an activator.
                .attr('data-action-trigger', 'menu') // Custom data attribute for JS or CSS hooks.
                .append('<span class="indicator-arrow"></span>'); // Adds a visual indicator.

            // Apply a specific class to the direct child unordered lists, marking them as menu content.
            navParents.children(childMenuSelector).addClass(UI_CLASSES.MENU_CONTENT);

            // Optional: Log successful menu initialization.
            console.info('Navigation menu structure initialized.');
        }

        // --- Section 2: Prevent Menu Closure on Form Interaction ---

        // Select interactive elements within dropdown menus (inputs, labels).
        // This prevents the menu from closing when a user interacts with form elements inside it.
        domUtil(`.${UI_CLASSES.MENU_CONTENT} input, .${UI_CLASSES.MENU_CONTENT} label`).on('click', function(eventObject) {
            // Stop the event from propagating up the DOM tree, which would trigger menu closure.
            if (eventObject && typeof eventObject.stopPropagation === 'function') {
                eventObject.stopPropagation();
            }
        });

        // --- Section 3: Initialize Custom Hint Boxes (Tooltips) ---

        // Configuration object for the hint box plugin.
        const hintBoxOptions = {
            contentAsHtml: true // Allow HTML content within the hint box.
        };

        // Initialize hint boxes on elements marked with the 'hint-target' class.
        domUtil('.hint-target').hintbox(hintBoxOptions);

        // --- Section 4: "Scroll to Top" Functionality ---

        // Define scroll activation threshold and animation speed.
        const scrollActivationThreshold = 250; // Pixels from top.
        const scrollAnimationSpeed = 600; // Milliseconds for animation.

        // Reference to the scroll-up button element.
        const scrollUpBtn = domUtil(`.${UI_CLASSES.SCROLL_UP_BUTTON}`);

        // Only proceed if the scroll-up button actually exists in the DOM.
        if (scrollUpBtn.length > 0) {
            // Monitor scroll events on the window.
            domUtil(window).on('scroll', function() {
                // Get the current vertical scroll position.
                const currentScrollPosition = domUtil(this).scrollTop();

                // Determine visibility based on the scroll threshold.
                if (currentScrollPosition > scrollActivationThreshold) {
                    scrollUpBtn.showWithFade(scrollAnimationSpeed); // Custom fade-in method.
                } else {
                    scrollUpBtn.hideWithFade(scrollAnimationSpeed); // Custom fade-out method.
                }
            });

            // Handle click events on the scroll-up button.
            scrollUpBtn.on('click', function(eventObj) {
                // Prevent the default anchor link behavior (e.g., jumping to a hash).
                eventObj.preventDefault();

                // Animate the scroll position of the document body and HTML element to the top.
                domUtil('html, body').animate({
                    scrollTop: 0
                }, scrollAnimationSpeed);
            });
        }
    });

    // Custom jQuery extensions for fade effects, to replace native fadeIn/fadeOut
    // This is an example of adding new code fragments.
    if (domUtil.fn) {
        domUtil.fn.showWithFade = function(speed) {
            return this.each(function() {
                domUtil(this).stop(true, true).fadeIn(speed);
            });
        };

        domUtil.fn.hideWithFade = function(speed) {
            return this.each(function() {
                domUtil(this).stop(true, true).fadeOut(speed);
            });
        };

        // Placeholder for a custom hintbox plugin, if it were to be defined.
        domUtil.fn.hintbox = function(options) {
            console.log('Hintbox plugin invoked with options:', options);
            // In a real scenario, this would initialize a tooltip library.
            // For this clone, it serves as a structural placeholder.
            return this;
        };
    }

})(jQuery); // Pass the global jQuery object to the IIFE.