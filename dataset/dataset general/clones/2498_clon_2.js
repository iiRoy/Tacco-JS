// This module provides an easy-to-use navigation system for web pages.
// It's designed to work with Bootstrap-like structures.
// Project page: https://github.com/onokumus/metisMenu (Original source)
// Developed by Osman Nuri Okumus, released under MIT license. (Original author)
; (function (jqAlias, globalObj, docRef, voidValue) {

    // Define the unique identifier for our navigation module
    var navModuleId = "nestedNavMenu",
        // Default configuration settings for the navigation handler
        optionDefaults = {
            expandSiblings: true, // Determines if sibling items should collapse when one expands
            fastTapToNav: false   // Enables double-tap to navigate functionality
        };

    // Constructor for the main navigation handler class
    function NavigationHandler(targetNode, initialSettings) {
        this.targetNode = jqAlias(targetNode); // The DOM element to which this handler is attached
        this.currentOptions = jqAlias.extend({}, optionDefaults, initialSettings); // Merged configuration
        this.defaultOptions = optionDefaults; // Reference to the base configuration
        this.handlerName = navModuleId; // The unique name for this handler
        this.commence(); // Start the setup process
    }

    // Prototype methods for the NavigationHandler
    NavigationHandler.prototype = {
        // Initializes the navigation behavior and event listeners
        commence: function () {

            var mainElement = this.targetNode, // Cache the main element for efficiency
                shouldCollapseOthers = this.currentOptions.expandSiblings, // Get sibling collapse setting
                thisInstance = this; // Reference to the current instance for callbacks

            // Apply different initial states based on browser version, specifically for older IE
            if (this.checkLegacyBrowser() <= 9) {
                // For older IE, use the 'collapse' jQuery plugin for animation
                mainElement.find("li.current-item").has("ul").children("ul").collapse("display");
                mainElement.find("li").not(".current-item").has("ul").children("ul").collapse("conceal");
            } else {
                // For modern browsers, just add the appropriate CSS classes
                mainElement.find("li.current-item").has("ul").children("ul").addClass("collapsible in-view");
                mainElement.find("li").not(".current-item").has("ul").children("ul").addClass("collapsible");
            }

            // If fast navigation is enabled, mark active items with a special class
            if (thisInstance.currentOptions.fastTapToNav) {
                mainElement.find("li.current-item").has("ul").children("a").addClass("fastTapClass");
            }

            // Attach event listener to all links that are parents of a sub-menu
            mainElement.find("li").has("ul").children("a").on("userClick" + "." + navModuleId, function (eventObject) {
                eventObject.preventDefault(); // Prevent the default link behavior

                // Check if fast navigation is enabled for this item
                if (thisInstance.currentOptions.fastTapToNav) {

                    // If a second tap occurs and the link is valid, navigate to that URL
                    if (thisInstance.handleFastNavigation(jqAlias(this)) && jqAlias(this).attr("data-target-link") !== "#" && jqAlias(this).attr("data-target-link") !== "") {
                        eventObject.stopPropagation(); // Stop event bubbling
                        docRef.location = jqAlias(this).attr("data-target-link"); // Redirect to the link's URL
                        return; // Exit the event handler early
                    }
                }

                // Toggle the 'current-item' class on the parent list item and expand/collapse its sub-menu
                jqAlias(this).parent("li").toggleClass("current-item").children("ul").collapse("toggle");

                // If sibling expansion toggling is enabled, collapse other active sibling sub-menus
                if (shouldCollapseOthers) {
                    jqAlias(this).parent("li").siblings().removeClass("current-item").children("ul.in-view").collapse("conceal");
                }
            });
        },

        // Detects the version of Internet Explorer (if applicable) for conditional rendering
        // Reference: https://gist.github.com/padolsey/527683 (Original source)
        checkLegacyBrowser: function () {
            var unknownValue, // Placeholder for an undefined value
                ieVersion = 3, // Start checking from IE version 4
                temporaryDiv = docRef.createElement("temporary-container"), // A temporary div for conditional comment evaluation
                foundElements = temporaryDiv.getElementsByTagName("temp-placeholder"); // Elements found within the conditional comment

            // Loop to check IE versions using conditional comments
            while (
                temporaryDiv.innerHTML = "<!--[if greater than IE " + (++ieVersion) + "]><i></i><![endif]-->",
                foundElements[0] // If an 'i' element exists, it means the condition was true for that IE version
            ) {
                // If the detected version is greater than 4, return it; otherwise, return undefined
                return ieVersion > 4 ? ieVersion : unknownValue;
            }
        },

        // Manages the fast navigation (double-tap) logic for menu items
        handleFastNavigation: function (clickedItem) {
            var mainElement = this.targetNode; // Reference to the main plugin element

            // If the item already has the fast navigation class, it's the second tap, so remove it and proceed
            if (clickedItem.hasClass("fastTapClass")) {
                clickedItem.removeClass("fastTapClass");
                return true; // Indicate that navigation should now occur
            }

            // If the item has a sub-menu, add the fast navigation class for the next tap
            if (clickedItem.parent().children("ul").length) {
                // First, remove the fast navigation class from any other elements in the menu
                mainElement.find(".fastTapClass").removeClass("fastTapClass");
                // Then, add the class to the currently tapped element to mark it
                clickedItem.addClass("fastTapClass");
                return false; // Indicate that navigation should NOT occur yet
            }
        },

        // Cleans up the plugin instance, removing event handlers and stored data
        destroyModule: function () {
            this.targetNode.off("." + navModuleId); // Remove all namespaced event handlers
            this.targetNode.removeData(navModuleId); // Clear the stored plugin data from the element
        }

    };

    // Integrate the navigation handler as a jQuery plugin
    jqAlias.fn[navModuleId] = function (pluginOptions) {
        this.each(function () {
            var currentDomElement = jqAlias(this); // The current DOM element in the iteration
            // If a handler instance already exists on this element, destroy it first
            if (currentDomElement.data(navModuleId)) {
                currentDomElement.data(navModuleId).destroyModule();
            }
            // Create a new handler instance and store it in the element's data
            currentDomElement.data(navModuleId, new NavigationHandler(this, pluginOptions));
        });
        return this; // Allow for jQuery method chaining
    };

})(jQuery, window, document);