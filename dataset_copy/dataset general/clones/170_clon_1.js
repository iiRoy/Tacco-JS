/*
 * This file defines a jQuery plugin for creating interactive menus.
 * It provides various options to customize the menu's behavior and appearance.
 *
 * Available Configuration Options:
 *
 *   - Animate (boolean, default: true):
 *     Determines whether menu display transitions should be animated.
 *
 *   - AnimateDirection (string, default: "up"):
 *     Specifies the animation direction for the main menu (e.g., "up", "down", "left", "right").
 *     Only applies when 'Animate' is true.
 *
 *   - AnimateDirectionSubMenu (string, default: "left"):
 *     Defines the animation direction for submenus.
 *     Only applies when 'Animate' is true.
 *
 *   - DelayTime (number, default: 500):
 *     The delay in milliseconds before a submenu opens on hover.
 *
 *   - TransitionTime (number, default: 100):
 *     The duration of the animation transition in milliseconds.
 *
 */
$.fn.Menu = function(  options  ) {


    // Initialize default options for the menu plugin.
    // User-provided options will extend and override these defaults.
    var options = $.extend(
        {
            Animate: true,
            AnimateDirection: "up",
            AnimateDirectionSubMenu: "left",
            DelayTime: 500,
            TransitionTime: 100
        }
        , options
    );


    // Store a reference to the jQuery object on which this plugin was invoked.
    var object = $(this);


    // Perform initial setup for the menu.
    Initialize();


    // --- Section: Core Functions ---

        /**
         * Initializes the menu structure by applying necessary CSS classes.
         * This helps in styling and positioning various menu components.
         */
        function Initialize() {
            // Apply styling to menu content lists for consistent layout.
            $(".menucontents UL").addClass("OfficeUI_nowrap OfficeUI_nopadding OfficeUI_nomargin");

            // Position the main menu absolutely within its container.
            $(".menu").addClass("OfficeUI_absolute");
        }

    // --- End of section: Core Functions ---


    // --- Section: Event Handlers ---

        // A handle for managing delayed actions, specifically for submenu opening.
        var waitHandle;


        // Bind a click event handler to menu entries that are not disabled.
        $("LI.menuEntry:not(.OfficeUI_disabled)").on("click", function(e) {
            // Prevent the click event from propagating further up the DOM tree.
            e.stopPropagation();


            // Clear any pending timeout to prevent unintended submenu displays
            // if the user clicks before a hover-initiated delay completes.
            clearTimeout(waitHandle);


            // Check if the clicked menu item contains a submenu.
            if ($(".subMenuHolder", this).length > 0) {
                var element = $(this);

                // Set the transition direction specifically for submenus.
                transitionDirection = options.AnimateDirectionSubMenu;


                // Iterate through all other submenus within the same parent
                // and hide them, then deactivate their parent menu items.
                $(".menu", $(element).parent()).each(function() {
                    $(this).hide().parent().Deactivate();
                });


                // Based on animation settings, display the submenu.
                if (options.Animate) {
                    // Show with a slide animation if animations are enabled.
                    $(".menu", element).first().show("slide", { direction: transitionDirection }, options.TransitionTime).Activate();
                } else {
                    // Otherwise, just show the submenu instantly.
                    $(".menu", element).first().show();
                }
            }
        });


        // Attach a mouseenter event handler for menu entries to handle submenu display on hover.
        $("LI.menuEntry:not(.OfficeUI_disabled)").on("mouseenter", function(e) {
            // Stop event propagation to prevent bubbling up to parent elements.
            e.stopPropagation();


            // Initialize the transition direction with the main menu's animation direction.
            var transitionDirection = options.AnimateDirection;


            // Determine if the current menu item has a submenu.
            if ($(".subMenuHolder", this).length > 0) {
                var element = $(this);


                // Override the transition direction for submenus.
                transitionDirection = options.AnimateDirectionSubMenu;


                // Set a timeout to delay the submenu's appearance.
                waitHandle = setTimeout(function() {

                    // Before showing the current submenu, hide any other open submenus
                    // at the same level and deactivate their respective parent items.
                    $(".menu", $(element).parent()).each(function() {
                        $(this).hide().parent().Deactivate();
                    });


                    // Display the submenu, applying animation if configured.
                    if (options.Animate) {
                        // Use a slide animation for showing the submenu.
                        $(".menu", element).first().show("slide", { direction: transitionDirection }, options.TransitionTime).Activate();
                    } else {
                        // Show without animation.
                        $(".menu", element).first().show();
                    }

                }, options.DelayTime); // The delay before the submenu opens.
            } else {
                // If the hovered item does not have a submenu, ensure all
                // other submenus at the same level are closed.
                $(".menu", $(this).parent()).each(function() {
                    $(this).hide().parent().Deactivate();
                });
            }
        });


        // When the mouse leaves a menu entry, clear any pending submenu open timeouts.
        $("LI.menuEntry").on("mouseout", function(e) {
            // Prevent a submenu from opening if the mouse quickly moves off an item.
            clearTimeout(waitHandle);
        });


        // Global click handler to close all menus when clicking anywhere on the document.
        $(document).on("click", function (e) {
            // Iterate through all elements identified as a 'menu'.
            $(".menu").each(function() {
                // Hide the menu, deactivate its parent, and reset its internal state.
                $(this).hide().parent().Deactivate();
                $(this).data("state", 0); // Assuming 'state' tracks open/closed status.
            });
        });

    // --- End of section: Event Handlers ---


    // --- Section: API Creation ---

        // Return the public API for the menu plugin.
        return CreateMenuAPI();


        /**
         * Factory function to create and return the menu's public interface.
         * @returns {object} An object containing methods to interact with the menu.
         */
        function CreateMenuAPI() {
            return {
                Show: Show,
                Hide: Hide,
                OpenContextMenu : OpenContextMenu
            }
        }


        /**
         * Displays the menu on which this method is called.
         * Applies animation based on plugin options.
         */
        function Show() {
            // If animation is enabled, show the menu with a slide effect.
            if (options.Animate) {
                object.show("slide", { direction: options.AnimateDirection }, options.TransitionTime).Activate();
            } else {
                // Otherwise, show the menu immediately.
                object.show();
            }
        }


        /**
         * Hides the menu on which this method is called.
         */
        function Hide() {
            object.hide();
        }


        /**
         * Opens a context menu at the specified event coordinates.
         *
         * @param {Event} e - The DOM event object, typically a 'contextmenu' event.
         * @returns {boolean} Returns false to prevent default context menu behavior.
         */
        function OpenContextMenu(e) {
            // Prevent the browser's default context menu from appearing.
            e.preventDefault();


            // Calculate the dimensions of the context menu area.
            var height = $(".contextMenuInArea").height();
            var width = $(".contextMenuInArea").width();


            // Determine the top and left positions to center the context menu
            // relative to the mouse pointer.
            leftVal = e.pageX - (width / 2) + "px";
            topVal = e.pageY - (height / 2) + "px";


            // Position and display the context menu.
            if (options.Animate) {
                // Animate the menu's appearance if animations are active.
                object.css({left:leftVal,top:topVal}).show("slide", { direction: options.AnimateDirection }, options.TransitionTime).Activate();
            } else {
                // Show the menu without animation.
                object.css({left:leftVal,top:topVal}).show();
            }

            return false; // Crucial for preventing the browser's native context menu.
        }

    // --- End of section: API Creation ---
}