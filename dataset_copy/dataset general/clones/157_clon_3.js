"use strict";

define(
  ["jquery"],
  function(jq){
    /**
     * Module-specific configuration constants.
     * These values can be easily adjusted to modify behavior.
     */
    const SCROLL_OFFSET_VERTICAL = 25; // Pixels to offset from the top of the target element
    const SCROLL_ANIMATION_DURATION = 1100; // Duration of the scroll animation in milliseconds
    const SCROLL_EASING_FUNCTION = "swing"; // Easing function for the scroll animation (e.g., "linear", "swing")
    const NAVIGATION_OVERFLOW_CLASS = "layout-overflow"; // CSS class applied when navigation overflows viewport

    // Cache common DOM elements for performance
    let applicationContainer = jq(".main-container");
    let browserViewport = jq(window);

    /**
     * Locates and returns a jQuery-wrapped DOM element based on the hash fragment
     * found within a provided anchor element's href attribute.
     *
     * @param {HTMLElement} sourceAnchor - The original HTML anchor element that was clicked.
     * @returns {jQuery|null} A jQuery object representing the target element, or null if not found or invalid.
     */
    function resolveTargetElement(sourceAnchor) {
      // Input validation: Ensure a valid anchor element with an href is provided
      if (!sourceAnchor || !sourceAnchor.href || typeof sourceAnchor.href !== 'string') {
        console.error("Invalid or missing anchor element provided for target resolution.");
        return null;
      }

      const fullLinkUrl = sourceAnchor.href;
      const hashDelimiterIndex = fullLinkUrl.indexOf("#");

      // Check if a hash fragment exists in the URL
      if (hashDelimiterIndex === -1) {
        console.warn("Link does not contain a hash fragment: " + fullLinkUrl);
        return null;
      }

      // Extract the ID from the hash fragment
      const targetElementId = fullLinkUrl.substring(hashDelimiterIndex + 1);

      // Validate that the extracted ID is not empty
      if (!targetElementId) {
        console.warn("Empty hash fragment found in link: " + fullLinkUrl);
        return null;
      }

      // Attempt to find the target element in the DOM
      let foundElement = jq("#" + targetElementId);

      // Check if the element was actually found
      if (foundElement.length === 0) {
        console.warn("No DOM element found with ID: " + targetElementId);
        return null;
      }

      return foundElement;
    }

    /**
     * Executes a smooth scrolling animation to bring a specified section into view.
     * The scroll position is adjusted by a predefined offset.
     *
     * @param {HTMLElement} triggeringLink - The HTML element (e.g., an anchor) that initiated the scroll.
     * @returns {void}
     */
    function initiateSmoothScroll(triggeringLink) {
      const destinationSection = resolveTargetElement(triggeringLink);

      // Guard clause: Exit if the target section could not be resolved
      if (!destinationSection) {
        console.info("Skipping smooth scroll due to unresolved target.");
        return;
      }

      // Retrieve the vertical position of the target section
      const sectionPositionData = destinationSection.offset();

      // Validate offset data
      if (!sectionPositionData || typeof sectionPositionData.top === 'undefined') {
          console.error("Failed to retrieve offset data for the destination section.");
          return;
      }

      // Calculate the final scroll position, applying the vertical offset
      let adjustedScrollTop = sectionPositionData.top - SCROLL_OFFSET_VERTICAL;

      // Ensure the scroll position does not go below the very top of the document
      adjustedScrollTop = Math.max(0, adjustedScrollTop);

      // Animate the scroll of the HTML and body elements
      // .stop(true, true) is used to clear any existing animations and jump to the end state
      jq("html, body").stop(true, true).animate(
        {
          scrollTop: adjustedScrollTop
        },
        SCROLL_ANIMATION_DURATION,
        SCROLL_EASING_FUNCTION
      );
    }

    /**
     * Dynamically adjusts the primary navigation's layout based on the current
     * viewport height. If the navigation content exceeds the viewport, a class
     * is added to indicate that it's no longer 'fixed' or fully visible.
     * This helps in handling responsive layouts where navigation might become scrollable.
     *
     * @returns {void}
     */
    function adaptNavigationDisplay() {
      const currentViewportHeight = browserViewport.height();
      const primaryNavigationList = applicationContainer.find("nav > ul");
      // Use outerHeight(true) to include padding, border, and margin for accurate height
      const navigationTotalHeight = primaryNavigationList.outerHeight(true);

      // Determine if the navigation content is taller than the viewport
      if (navigationTotalHeight > currentViewportHeight) {
        // Add the overflow class if it's not already present
        if (!primaryNavigationList.hasClass(NAVIGATION_OVERFLOW_CLASS)) {
            primaryNavigationList.addClass(NAVIGATION_OVERFLOW_CLASS);
        }
      } else {
        // Remove the overflow class if it's present and no longer needed
        if (primaryNavigationList.hasClass(NAVIGATION_OVERFLOW_CLASS)) {
            primaryNavigationList.removeClass(NAVIGATION_OVERFLOW_CLASS);
        }
      }
    }

    /**
     * Initializes all event listeners and performs initial setup actions
     * for this module. This function is called once when the module loads.
     *
     * @returns {void}
     */
    function initializeComponent() {
      // Attach a delegated click event handler to the main application container.
      // This handles clicks on navigation links (excluding top-level ones) and specific "jumper" elements.
      applicationContainer.on("click", "nav a:not(.main-menu-item), .section-anchor-link", function(eventObject) {
        // Prevent the default browser action for the link (e.g., jumping directly to the hash)
        eventObject.preventDefault();
        // Execute the smooth scroll animation to the target section
        initiateSmoothScroll(this);
      });

      // Perform an initial adjustment of the navigation layout immediately upon load
      adaptNavigationDisplay();

      // Bind the navigation display adjustment function to the window's resize and orientation change events
      // This ensures the layout adapts dynamically when the browser window changes size or device orientation changes.
      browserViewport.on("resize orientationchange", adaptNavigationDisplay);
    }

    // Execute the initialization routine to set up the component
    initializeComponent();
  }
);