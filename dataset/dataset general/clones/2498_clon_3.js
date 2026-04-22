/*
 * navAccordion - v2.0.0
 * Advanced Accordion Navigation for Modern Web Applications
 * https://github.com/your-new-repo/navAccordion
 *
 * Developed by A. N. Other
 * Licensed under the MIT License
 */
;(function(jQueryAlias, currentWindow, docObject, undefinedValue) {

    // Unique identifier for this component and its associated data
    var componentName = "navAccordion",
        // Default configuration settings for the accordion behavior
        standardOptions = {
            // Determines if sibling sub-menus should collapse when one expands
            shouldCollapseSiblings: true,
            // Enables a double-tap/click feature for navigation links with sub-menus
            enableDoubleTap: false,
            // Prevents default link behavior for menu items (useful for purely interactive menus)
            preventDefaultLinks: true,
            // Optional: Animation speed for expanding/collapsing (though not fully implemented in this version)
            animationDuration: 250 // milliseconds
        };

    /**
     * Constructor function for the AccordionMenu component.
     * @param {HTMLElement} domElement - The DOM element to initialize the accordion on.
     * @param {object} options - User-defined options to override defaults.
     */
    function AccordionMenu(domElement, options) {
        // Store a jQuery-wrapped reference to the main element
        this.$mainElement = jQueryAlias(domElement);

        // If the element doesn't exist, log a warning and exit.
        if (this.$mainElement.length === 0) {
            console.warn("AccordionMenu: Target DOM element not found or is empty.", domElement);
            return;
        }

        // Merge default options with user-provided options.
        // Using `true` for deep merge, though not strictly needed for current options.
        this.currentConfig = jQueryAlias.extend(true, {}, standardOptions, options);

        // Store a reference to this instance for use in event handlers
        this.instanceContext = this;

        // Begin the initialization process
        this.initializeComponent();
    }

    /**
     * Prototype methods for the AccordionMenu component.
     */
    AccordionMenu.prototype = {

        /**
         * Initializes the accordion component, setting up initial states and event listeners.
         */
        initializeComponent: function() {
            console.log("Initializing NavAccordion on:", this.$mainElement[0]);

            const $menuContainer = this.$mainElement;
            const shouldCollapseSiblings = this.currentConfig.shouldCollapseSiblings;
            const instanceContext = this; // Self-reference for event handlers

            // Find all list items that contain a sub-menu (ul)
            const $allSubmenuParents = $menuContainer.find("li:has(ul)");
            // Find currently active list items and their direct sub-menus
            const $activeSubmenuParents = $allSubmenuParents.filter(".is-active");
            const $activeSubmenus = $activeSubmenuParents.children("ul");

            // Initially hide all sub-menus that are not marked as active
            $allSubmenuParents.not(".is-active").children("ul")
                .addClass("submenu-hidden")
                .removeClass("submenu-visible"); // Ensure no visible class initially

            // For active sub-menus, ensure they are visible
            $activeSubmenus
                .addClass("submenu-visible")
                .removeClass("submenu-hidden");

            // Apply "double-tap" class to active items if the feature is enabled
            if (instanceContext.currentConfig.enableDoubleTap) {
                console.log("Double-tap feature is enabled.");
                $menuContainer.find("li.is-active").has("ul").children("a").addClass("link-awaiting-second-tap");
            }

            // Attach click event listener to links within list items that have sub-menus
            $menuContainer.find("li").has("ul").children("a").on("click.navAccordion", function(eventObj) {
                const $clickedLink = jQueryAlias(this);
                const $parentListItem = $clickedLink.parent("li");
                const hasSubmenu = $parentListItem.children("ul").length > 0;

                // Prevent default link behavior if configured
                if (instanceContext.currentConfig.preventDefaultLinks || hasSubmenu) {
                    eventObj.preventDefault();
                }

                // Handle the double-tap/click feature if enabled
                if (instanceContext.currentConfig.enableDoubleTap && hasSubmenu) {
                    console.log("Checking for double-tap on:", $clickedLink.attr("href"));

                    // If it's a second tap and the link is valid, navigate
                    if (instanceContext.handleDoubleTap($clickedLink) && $clickedLink.attr("href") !== "#" && $clickedLink.attr("href").trim() !== "") {
                        eventObj.stopPropagation(); // Stop event propagation to prevent other handlers
                        currentWindow.location.href = $clickedLink.attr("href");
                        console.log("Navigating to:", $clickedLink.attr("href"));
                        return; // Exit function after navigation
                    }
                }

                // Toggle the active state of the current list item and its submenu visibility
                instanceContext._toggleSubmenuState($parentListItem);

                // Collapse sibling sub-menus if configured
                if (shouldCollapseSiblings) {
                    console.log("Collapsing sibling menus.");
                    $parentListItem.siblings(".is-active").each(function() {
                        const $siblingItem = jQueryAlias(this);
                        // Ensure we only collapse direct children sub-menus
                        $siblingItem.removeClass("is-active").children("ul.submenu-visible")
                            .removeClass("submenu-visible")
                            .addClass("submenu-hidden");
                        // Also remove any double-tap classes from sibling links
                        $siblingItem.children("a.link-awaiting-second-tap").removeClass("link-awaiting-second-tap");
                    });
                }
            });
        },

        /**
         * Manages the active state and visibility of a submenu.
         * @param {jQuery} $listItem - The jQuery object of the list item containing the submenu.
         * @private
         */
        _toggleSubmenuState: function($listItem) {
            const $submenu = $listItem.children("ul");
            const isActive = $listItem.hasClass("is-active");

            // Toggle the 'is-active' class on the parent list item
            $listItem.toggleClass("is-active");

            // Toggle submenu visibility classes
            if (isActive) {
                $submenu.removeClass("submenu-visible").addClass("submenu-hidden");
                console.log("Submenu hidden for:", $listItem[0]);
            } else {
                $submenu.removeClass("submenu-hidden").addClass("submenu-visible");
                console.log("Submenu shown for:", $listItem[0]);
            }

            // If double-tap is enabled, manage the 'link-awaiting-second-tap' class
            if (this.currentConfig.enableDoubleTap) {
                const $link = $listItem.children("a");
                if (isActive) { // If it was active and now is not, remove double-tap class
                    $link.removeClass("link-awaiting-second-tap");
                } else { // If it's becoming active, add double-tap class
                    // First, remove from all other links to ensure only one is "awaiting"
                    this.$mainElement.find(".link-awaiting-second-tap").removeClass("link-awaiting-second-tap");
                    $link.addClass("link-awaiting-second-tap");
                }
            }
        },

        /**
         * Handles the logic for the double-tap/click feature.
         * @param {jQuery} $targetLink - The jQuery object of the clicked link.
         * @returns {boolean} True if the link should navigate, false otherwise.
         */
        handleDoubleTap: function($targetLink) {
            // Check if the link actually has a submenu, otherwise double-tap is irrelevant
            if (!$targetLink.parent().children("ul").length) {
                console.warn("handleDoubleTap: Link has no submenu, ignoring double-tap logic.");
                return false;
            }

            // If the link already has the 'link-awaiting-second-tap' class, it's the second tap
            if ($targetLink.hasClass("link-awaiting-second-tap")) {
                $targetLink.removeClass("link-awaiting-second-tap"); // Remove class after navigation
                console.log("Second tap detected, navigating.");
                return true; // Indicate that navigation should occur
            }

            // If it's the first tap, add the class and prevent navigation
            // First, clear any other links that might be awaiting a second tap
            this.$mainElement.find(".link-awaiting-second-tap").removeClass("link-awaiting-second-tap");
            $targetLink.addClass("link-awaiting-second-tap");
            console.log("First tap detected, setting link-awaiting-second-tap.");
            return false; // Prevent navigation on the first tap
        },

        /**
         * Destroys the component, removing event listeners and data.
         */
        destroyComponent: function() {
            console.log("Destroying NavAccordion instance on:", this.$mainElement[0]);
            // Remove all event handlers bound by this component
            this.$mainElement.off(".navAccordion");
            // Remove the instance data stored on the element
            this.$mainElement.removeData('navAccordionInstance');
            // Clean up any lingering double-tap classes
            this.$mainElement.find(".link-awaiting-second-tap").removeClass("link-awaiting-second-tap");
            // Optionally, revert classes to original state or remove all custom classes
            this.$mainElement.find("li.is-active").removeClass("is-active");
            this.$mainElement.find("ul.submenu-visible").removeClass("submenu-visible").addClass("submenu-hidden");
        }

    };

    /**
     * jQuery plugin wrapper.
     * Allows usage like: `jQueryAlias('#myMenu').navAccordion({ ... });`
     * Handles multiple elements and prevents re-initialization.
     */
    jQueryAlias.fn.navAccordion = function(options) {
        return this.each(function () {
            const $currentElement = jQueryAlias(this);
            let instance = $currentElement.data('navAccordionInstance');

            // If an instance already exists, destroy it before creating a new one
            if (instance) {
                console.log("Existing NavAccordion instance found, destroying before re-initialization.");
                instance.destroyComponent();
            }

            // Create a new instance and store it on the element's data
            instance = new AccordionMenu(this, options);
            if (instance.$mainElement && instance.$mainElement.length > 0) { // Only store if initialization was successful
                $currentElement.data('navAccordionInstance', instance);
            }
        });
    };

})(jQuery, window, document, undefined);