jQuery(function($){ // Using jQuery alias for document ready, different syntax

    // --- Configuration Constants & Global State ---
    // These values define crucial dimensions and behavior for the UI components.
    const MINIMUM_PAGE_BUFFER = 55; // Renamed from 'visiblePageMargin', represents space kept visible on main page
    const MAX_SLIDE_WIDTH_PX = 500; // Renamed from 'maximumMenuWith', caps the drawer's width
    const LOADER_HTML_SNIPPET = '<div class="app-spinner-wrapper"><img src="assets/images/loading-spinner.gif" alt="Loading application content..." /></div>'; // Rewritten preloader, new path/classes

    // --- UI Element References (Cached for Performance) ---
    // Variables to hold jQuery objects for frequently accessed DOM elements.
    let mainPageViewElement;        // Renamed from 'page', represents the main content area that slides
    let contentDisplayArea;         // Renamed from 'pageContent', where dynamic content is loaded
    let navDrawerPanel;             // Renamed from 'slidingMenu', the side navigation panel
    let navDrawerContentWrapper;    // Renamed from 'slidingMenuContent', inner content of the nav drawer

    // --- Application State Flags ---
    let currentViewportDimensions;  // Renamed from 'viewport', stores current screen size
    let isNavigationDrawerOpen = false; // Renamed from 'isMenuOpen', tracks drawer state

    // --- Initial Application Setup ---
    // Execute core initialization logic once the DOM is fully loaded.
    initializeLayoutMetrics();

    /**
     * @function getViewportSize
     * @description Retrieves the current width and height of the browser viewport.
     * @returns {object} An object containing 'width' and 'height' properties.
     */
    function getViewportSize() {
        return {
            width: $(window).width(),
            height: $(window).height()
        };
    }

    /**
     * @function initializeLayoutMetrics
     * @description Caches references to critical DOM elements and updates viewport dimensions.
     * This function should be called on initial load and whenever the screen size changes.
     */
    function initializeLayoutMetrics() {
        mainPageViewElement = $("#main-application-view"); // Renamed ID
        contentDisplayArea = $("#dynamic-content-display"); // Renamed ID
        navDrawerPanel = $("#side-navigation-drawer"); // Renamed ID
        navDrawerContentWrapper = $("#drawer-inner-content"); // Renamed ID

        // Update the global viewport dimensions.
        currentViewportDimensions = getViewportSize();
        console.info('UI layout metrics refreshed. Viewport:', currentViewportDimensions.width, 'x', currentViewportDimensions.height);
    }

    /**
     * @function openNavigationDrawer
     * @description Initiates the animation to open the side navigation drawer.
     * Includes calculations for responsive drawer width and state management.
     */
    function openNavigationDrawer() {
        // Guard clause: Prevent opening if already open to avoid redundant animations.
        if (isNavigationDrawerOpen) {
            console.warn("Attempted to open an already open navigation drawer.");
            return;
        }

        isNavigationDrawerOpen = true;

        // Determine the optimal width for the drawer based on screen size and configuration.
        // It's either the viewport width minus a buffer, or a predefined maximum width.
        const calculatedDrawerWidth = currentViewportDimensions.width - MINIMUM_PAGE_BUFFER;
        const effectiveDrawerWidth = Math.min(calculatedDrawerWidth, MAX_SLIDE_WIDTH_PX);

        // Make the navigation drawer element visible *before* starting the animation.
        // Also ensure it's block-level for proper layout.
        navDrawerPanel.css({ "visibility": "visible", "display": "block" });

        // Synchronize heights of the drawer and main content to handle potential overflow.
        synchronizePanelHeights();

        // Animate the main content view to slide right, revealing the drawer.
        mainPageViewElement.stop(true, true).animate({ // Added .stop() to prevent animation queueing
            left: effectiveDrawerWidth + "px"
        }, {
            duration: 350, // Slightly increased duration for smoother feel
            easing: "easeOutQuad", // Added easing function
            complete: () => { // Using arrow function for concise callback
                console.log(`Navigation drawer successfully opened to ${effectiveDrawerWidth}px.`);
            }
        });
    }

    /**
     * @function closeNavigationDrawer
     * @description Initiates the animation to close the side navigation drawer.
     * Manages state and hides the drawer after animation completion.
     */
    function closeNavigationDrawer() {
        // Guard clause: Prevent closing if already closed.
        if (!isNavigationDrawerOpen) {
            console.warn("Attempted to close an already closed navigation drawer.");
            return;
        }

        isNavigationDrawerOpen = false;

        // Animate the main content view back to its original position.
        mainPageViewElement.stop(true, true).animate(
            { left: "0px" },
            {
                duration: 200, // Adjusted duration for quicker close
                easing: "easeInQuad", // Added easing function
                complete: function() {
                    // After the animation finishes, hide the drawer entirely.
                    // This is crucial for preventing interaction with elements under the drawer on some devices.
                    navDrawerPanel.css({ "visibility": "hidden", "display": "none" });
                    console.log("Navigation drawer closed and hidden.");
                }
            }
        );
        // Removed the redundant `animate({ height: "100%" }, { duration: 0 })` as it was a no-op.
    }

    /**
     * @function synchronizePanelHeights
     * @description Adjusts the heights of the navigation drawer and main page
     * to prevent scroll overflow issues, especially on older mobile browsers.
     */
    function synchronizePanelHeights() {
        const currentDrawerHeight = navDrawerPanel.height();
        const currentMainPageHeight = mainPageViewElement.height();
        const innerDrawerContentHeight = navDrawerContentWrapper.height();

        // If the main content area is shorter than the drawer's content,
        // expand both to match the drawer's inner content height.
        if (currentMainPageHeight < innerDrawerContentHeight) { // Changed condition slightly
            navDrawerPanel.css("height", innerDrawerContentHeight + "px");
            mainPageViewElement.css("height", innerDrawerContentHeight + "px"); // Ensure main page also stretches
            console.debug("Panel heights synchronized: Main page shorter than drawer content.");
        } else if (currentDrawerHeight < currentMainPageHeight) { // If drawer is shorter than main page
            navDrawerPanel.css("height", currentMainPageHeight + "px"); // Make drawer match main page
            console.debug("Panel heights synchronized: Drawer shorter than main page.");
        } else {
             console.debug("Panel heights are already synchronized or no adjustment needed.");
        }
    }

    /**
     * @function loadDynamicContentFragment
     * @description Fetches and injects new HTML content into the designated display area.
     * @param {string} contentResourcePath - The URL or path to the HTML fragment to load.
     */
    function loadDynamicContentFragment(contentResourcePath) {
        // Input validation: Ensure a valid path is provided.
        if (!contentResourcePath || typeof contentResourcePath !== 'string') {
            console.error("Invalid or missing content resource path provided:", contentResourcePath);
            contentDisplayArea.html('<p class="error-message">Error: Content path is invalid.</p>');
            return;
        }

        closeNavigationDrawer(); // Always close the drawer before loading new content.
        contentDisplayArea.html(LOADER_HTML_SNIPPET); // Display a loading indicator.

        // Removed the setTimeout wrapping the .load() call, as it was explicitly for demo purposes.
        // In a production environment, content should load as quickly as possible.
        contentDisplayArea.load(contentResourcePath, function(response, status, xhr) {
            if (status === "error") {
                console.error(`Failed to load content from ${contentResourcePath}. Status: ${xhr.status}, Error: ${xhr.statusText}`);
                contentDisplayArea.html('<p class="error-message">Failed to load content. Please check your network connection or try again.</p>');
            } else {
                console.info(`Content from "${contentResourcePath}" loaded successfully.`);
                // Optional: Scroll to top after new content is loaded, if needed.
                // Modern browsers often handle this automatically, or CSS `scroll-behavior: smooth` can be used.
                // window.scrollTo(0, 0); // Removed initial scrollTo(0,1) from original code.
            }
        });
    }

    /**
     * @function handleViewportChange
     * @description Callback for window resize and orientation change events.
     * Re-initializes layout metrics and re-adjusts the drawer position.
     */
    function handleViewportChange() {
        // Debounce mechanism: Wait a short period to allow the browser to settle
        // on the new dimensions, particularly critical for older mobile devices.
        window.setTimeout(() => { // Using arrow function for cleaner context
            initializeLayoutMetrics(); // Recalculate all dimensions.

            // Re-evaluate drawer position based on its current state.
            if (isNavigationDrawerOpen) {
                openNavigationDrawer(); // Re-open to adjust to new screen size.
            } else {
                closeNavigationDrawer(); // Ensure it's fully closed and hidden if it was.
            }
            console.log('Viewport change detected and handled.');
        }, 600); // Slightly increased debounce time for robustness
    }

    // --- Event Bindings ---

    // Toggle the navigation drawer when a specific button is clicked.
    $("a.toggle-side-nav").on("click", function (event) { // Renamed class, using .on()
        event.preventDefault(); // Prevent default link behavior (e.g., navigating to '#').

        // Get the current left position of the main content view.
        // Use parseInt for reliable numerical comparison.
        const currentMainViewPosition = parseInt(mainPageViewElement.css('left'), 10);

        if (currentMainViewPosition === 0) { // If the main view is at its original (closed) position.
            openNavigationDrawer();
        } else {
            closeNavigationDrawer();
        }
    });

    // Attach a single handler for both window resize and orientation change events.
    // This simplifies event management and ensures consistent behavior.
    $(window).on("resize orientationchange", handleViewportChange);

    // Monitor URL hash changes to load different content fragments dynamically.
    $(window).on('hashchange', function (e) { // Using .on() instead of .bind()
        console.log('URL hash fragment changed to:', location.hash);

        let requestedFragment = location.hash.substring(1); // Remove the '#' prefix from the hash.

        let targetContentUrl;
        // Determine the content URL based on the hash.
        if (!requestedFragment || requestedFragment === 'home') { // Added 'home' as an explicit default path
            targetContentUrl = "content/pages/default_dashboard.html"; // New default file and path structure
        } else {
            targetContentUrl = `content/pages/${requestedFragment}.html`; // Using template literal for path construction
        }

        loadDynamicContentFragment(targetContentUrl);
    });

    // --- Initial Content Load on Page Ready ---
    // Load content immediately based on the initial URL hash or a default page.
    if (location.hash) {
        $(window).trigger('hashchange'); // Trigger hashchange if a hash exists on initial load.
    } else {
        loadDynamicContentFragment("content/pages/default_dashboard.html"); // Load default content if no hash.
    }

}); // End of jQuery ready function