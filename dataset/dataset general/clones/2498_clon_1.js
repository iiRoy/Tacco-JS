/*
 * This is a Type I clone of the original metismenu plugin.
 * All functionality, variable names, and logic remain identical.
 * Only whitespace and comments have been altered significantly.
 * This version aims for visual distinctiveness while preserving
 * the exact structural and logical integrity of the source code.
 */
; (  function ($, window, document, undefined) { // Start of the Immediately Invoked Function Expression (IIFE)


  var pluginName = "metisMenu", // The name of our plugin, used for data storage and events
    defaults = { // Default configuration options for the plugin
      toggle: true, // Should only one menu item be open at a time?
      doubleTapToGo: false // Enable double-tap-to-go functionality for touch devices
    };

  // The actual plugin constructor function
  function Plugin (element, options) {
    this.element = $(element); // Store the jQuery-wrapped DOM element
    this.settings = $.extend({}, defaults, options); // Merge default and user-provided options
    this._defaults = defaults; // Keep a reference to the original defaults
    this._name = pluginName; // Store the plugin's name
    this.init(); // Initialize the plugin instance
  }

  // Extend the Plugin prototype with its methods
  Plugin.prototype = {
    /**
     * Initializes the metisMenu plugin functionality.
     * This method sets up initial states and event handlers.
     */
    init: function () {

      var $this = this.element, // Reference to the plugin's main element
        $toggle = this.settings.toggle, // Get the toggle setting
        obj = this; // Store a reference to the current plugin instance

      // Check for Internet Explorer versions for specific behavior
      if (this.isIE() <= 9) {
        // For older IE, use 'collapse' with 'show' and 'hide' directly
        $this.find("li.active").has("ul").children("ul").collapse("show");
        $this.find("li").not(".active").has("ul").children("ul").collapse("hide");
      } else {
        // For modern browsers, add 'collapse' and 'in' classes
        $this.find("li.active").has("ul").children("ul").addClass("collapse in");
        $this.find("li").not(".active").has("ul").children("ul").addClass("collapse");
      }

      // If doubleTapToGo is enabled, add the special class to active items
      if (obj.settings.doubleTapToGo) {
        $this.find("li.active").has("ul").children("a").addClass("doubleTapToGo");
      }

      // Attach the click event handler to menu items with sub-menus
      $this.find("li").has("ul").children("a").on("click" + "." + pluginName, function (e) {
        e.preventDefault(); // Prevent default link behavior

        // Check if doubleTapToGo feature is active
        if (obj.settings.doubleTapToGo) {

          // If it's a double tap and the link is valid, navigate
          if (obj.doubleTapToGo($(this)) && $(this).attr("href") !== "#" && $(this).attr("href") !== "") {
            e.stopPropagation(); // Stop event propagation
            document.location = $(this).attr("href"); // Navigate to the URL
            return; // Exit the handler
          }
        }

        // Toggle the 'active' class on the parent list item and collapse/expand its sub-menu
        $(this).parent("li").toggleClass("active").children("ul").collapse("toggle");

        // If toggle functionality is enabled, collapse siblings
        if ($toggle) {
          $(this).parent("li").siblings().removeClass("active").children("ul.in").collapse("hide");
        }

      }); // End of click event handler
    }, // End of init method

    /**
     * Detects the version of Internet Explorer.
     * @returns {number|undefined} The IE version number or undefined if not IE.
     * (Based on https://gist.github.com/padolsey/527683)
     */
    isIE: function () {
      var undef, // Placeholder for undefined
        v = 3, // Starting IE version for detection
        div = document.createElement("div"), // Temporary div element
        all = div.getElementsByTagName("i"); // Collection of <i> tags

      while (
        // Assign innerHTML and check if 'all' contains elements
        div.innerHTML = "<!--[if gt IE " + (++v) + "]><i></i><![endif]-->",
        all[0]
      ) {
        // Return the IE version if greater than 4, otherwise undefined
        return v > 4 ? v : undef;
      }
    }, // End of isIE method

    /**
     * Implements the double-tap-to-go logic for touch devices.
     * On first tap, adds 'doubleTapToGo' class; on second tap, navigates.
     * @param {jQuery} elem - The jQuery element that was tapped.
     * @returns {boolean} True if navigation should occur, false otherwise.
     */
    doubleTapToGo: function (elem) {
      var $this = this.element; // Reference to the main plugin element

      // If the element already has the 'doubleTapToGo' class, it's the second tap
      if (elem.hasClass("doubleTapToGo")) {
        elem.removeClass("doubleTapToGo"); // Remove the class
        return true; // Indicate that navigation should proceed
      }

      // If the element has a child unordered list (is a parent menu item)
      if (elem.parent().children("ul").length) {
        // First, remove the 'doubleTapToGo' class from any other elements in the menu
        $this.find(".doubleTapToGo").removeClass("doubleTapToGo");
        // Then, add the class to the currently tapped element
        elem.addClass("doubleTapToGo");
        return false; // Indicate that navigation should NOT occur yet
      }
    }, // End of doubleTapToGo method

    /**
     * Cleans up event handlers and data associated with the plugin instance.
     */
    remove: function () {
      this.element.off("." + pluginName); // Unbind all namespaced events
      this.element.removeData(pluginName); // Remove the plugin's data from the element
    }

  }; // End of Plugin.prototype

  // Register the plugin with jQuery
  $.fn[pluginName] = function (options) {
    // Iterate over each selected element
    this.each(function () {
      var el = $(this); // Cache the current element

      // If the element already has a plugin instance, remove it first
      if (el.data(pluginName)) {
        el.data(pluginName).remove();
      }
      // Create a new plugin instance and store it in the element's data
      el.data(pluginName, new Plugin(this, options));
    });
    return this; // Allow for jQuery method chaining
  };

})(jQuery, window, document); // Pass jQuery, window, and document to the IIFE