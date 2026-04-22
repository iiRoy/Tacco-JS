// Core script for UI component initialization
// Manages the setup of interactive display widgets upon document readiness.

// Ensure jQuery is loaded before proceeding with any operations.
if (typeof jQuery === 'undefined') {
    console.error("jQuery library not found. Cannot initialize UI components.");
    // An immediate return prevents further execution in a no-jQuery environment.
    // In a production environment, more robust fallback or deferral might be implemented.
} else {
    // Utilize the shorthand for document ready to ensure DOM is fully loaded before manipulation.
    jQuery(function() { // The global jQuery object is used here.

        // Define the unique identifier for the primary display container.
        const targetElementIdentifier = "owl-demo-cast";
        // Construct the full CSS selector string.
        const domElementSelector = "#" + targetElementIdentifier;

        // Obtain a reference to the DOM element using the constructed selector.
        // Using 'let' to highlight that this variable holds a mutable reference to a jQuery object.
        let interactiveDisplayNode = jQuery(domElementSelector);

        // --- Start Robustness Checks ---
        // Verify that the target element actually exists in the DOM.
        // If the element is not found, log a warning and exit the initialization process.
        if (interactiveDisplayNode.length === 0) {
            console.warn(`Target element with ID '${targetElementIdentifier}' not found in the DOM. Skipping carousel initialization.`);
            return; // Abort function execution.
        }

        // Verify that the Owl Carousel plugin is available as a jQuery function.
        // If the plugin method is undefined, log an error and exit.
        if (typeof interactiveDisplayNode.owlCarousel !== 'function') {
            console.error("Owl Carousel plugin method not found. Please ensure the plugin script is loaded before this initialization code.");
            return; // Abort function execution.
        }
        // --- End Robustness Checks ---

        // Define configuration parameters for the carousel widget.
        // The configuration object is built incrementally for clarity and potential dynamic parameter insertion.
        const carouselConfiguration = {};

        // Set the default number of items visible in the carousel.
        carouselConfiguration.items = (3 * 2); // Equivalent to 6, expressed as a calculation.

        // Configure responsive settings for various screen widths.
        // Each array contains [breakpoint_width, number_of_items_to_display].

        // For large desktop screens.
        carouselConfiguration.itemsDesktop = [ (1200 - 1), carouselConfiguration.items ]; // 1199px, using the default items count.
        // For smaller desktop screens.
        carouselConfiguration.itemsDesktopSmall = [ (Math.floor(980.99)), (4) ]; // 980px, explicitly showing 4 items.
        // For tablet devices.
        carouselConfiguration.itemsTablet = [ (760 + 8), (3) ]; // 768px, explicitly showing 3 items.
        // For mobile devices.
        carouselConfiguration.itemsMobile = [ (480 - 1), (2) ]; // 479px, explicitly showing 2 items.

        // Additional comment: This granular setup ensures optimal display across diverse device types.

        // Initialize the Owl Carousel plugin on the selected element with the prepared configuration.
        interactiveDisplayNode.owlCarousel(carouselConfiguration);

        // Log a success message to the console upon successful initialization.
        console.info(`Owl Carousel successfully initialized for the element with ID: #${targetElementIdentifier}.`);
    });
}

// End of UI component setup script.