document.addEventListener("DOMContentLoaded", () => {
    // Global state management for open web views and current display page.
    let sessionViews = []; // Stores all active BrowserPane instances.
    let currentDisplayPage = 0; // Tracks which "page" of tabs is currently visible.

    // Configuration object for magic numbers and settings.
    const UI_CONFIG = Object.freeze({
        SPINNER_ROTATION_SPEED: 0.02, // Increment for spinner rotation.
        SPINNER_INTERVAL_MS: 16,     // ~60 FPS for spinner animation.
        TAB_WIDTH_PX: 158,           // Estimated width of a single tab element.
        MIN_UI_BUTTON_WIDTH_PX: 80,  // Combined width of always-visible UI buttons.
        DEFAULT_NEW_TAB_URI: "about:blank", // URI for new tabs.
        MOZ_BROWSER_ERROR_MESSAGE: "!!! Mozbrowser frame creation failed. Ensure experimental mode (-e) is enabled. !!!",
        NAV_UNAVAILABLE_MESSAGE: "Navigation feature not implemented or unavailable without experimental mode (-e).",
        EMPTY_TAB_SET_CLOSE_MESSAGE: "All tabs closed. Exiting application.",
        CLASS_HIDDEN: "hidden",
        CLASS_ACTIVE_TAB: "tab-active",
        CLASS_SPINNER: "tab-indicator-spin",
        CLASS_CLOSE_BTN: "tab-dismiss-icon",
        CLASS_WEB_VIEW: "page-frame-content",
        CLASS_TAB_ITEM: "nav-tab-item",
        CLASS_TAB_TITLE: "nav-tab-label"
    });

    /**
     * Utility function to create a DOM element with specified tag and classes.
     * @param {string} tag - The HTML tag name (e.g., 'div', 'span').
     * @param {string[]} classes - An array of CSS class names to add.
     * @returns {HTMLElement} The created DOM element.
     */
    const createDomElement = (tag, classes = []) => {
        const element = document.createElement(tag);
        if (classes.length > 0) {
            element.classList.add(...classes);
        }
        return element;
    };

    /**
     * Represents a single browser pane (tab) with its associated web view.
     */
    class BrowserPane {
        #resourceUri; // Private field for the URL.
        #spinIntervalRef = null;
        #spinRotation = 0;

        constructor(initialUri) {
            if (!initialUri || typeof initialUri !== 'string') {
                console.error("BrowserPane: Invalid initial URI provided.");
                initialUri = UI_CONFIG.DEFAULT_NEW_TAB_URI;
            }
            this.#resourceUri = initialUri;

            // Create loading indicator
            const loadingIndicator = createDomElement("div", ["fa", "fa-spinner", UI_CONFIG.CLASS_SPINNER]);
            this.loadingIndicator = loadingIndicator;

            // Create close button for the tab
            const dismissButton = createDomElement("div", ["fa", "fa-times", UI_CONFIG.CLASS_CLOSE_BTN]);
            dismissButton.onclick = (evt) => {
                this.closePane(); // Use arrow function to maintain 'this' context.
                evt.stopPropagation(); // Prevent tab activation when closing.
            };

            // Create title text node
            this.paneTitleNode = document.createTextNode(this.#resourceUri);
            const titleWrapper = createDomElement("div", [UI_CONFIG.CLASS_TAB_TITLE]);
            titleWrapper.appendChild(this.paneTitleNode);

            // Assemble the tab label element
            const paneElement = createDomElement("li", [UI_CONFIG.CLASS_TAB_ITEM]);
            paneElement.appendChild(this.loadingIndicator);
            paneElement.appendChild(titleWrapper);
            paneElement.appendChild(dismissButton);
            paneElement.onclick = () => this.activatePane(); // Activate when clicked.

            this.paneElement = paneElement; // Store reference to the UI element.

            // Create the iframe for web content
            const webFrame = createDomElement("iframe", [UI_CONFIG.CLASS_WEB_VIEW, UI_CONFIG.CLASS_HIDDEN]);
            webFrame.src = this.#resourceUri;
            webFrame.mozbrowser = true; // Enable mozbrowser features.

            // Critical check for mozbrowser support.
            if (!webFrame.mozbrowser) {
                console.error(UI_CONFIG.MOZ_BROWSER_ERROR_MESSAGE);
                // In a real application, you might show a fallback UI or error message
                // instead of closing the window immediately.
                window.close();
            }

            // Attach event listeners to the iframe for browser events.
            webFrame.addEventListener("mozbrowserloadstart", () => this.startSpinAnimation());
            webFrame.addEventListener("mozbrowserloadend", () => this.stopSpinAnimation());
            webFrame.addEventListener("mozbrowsertitlechange", (evt) => {
                this.paneTitleNode.nodeValue = evt.detail;
                refreshInterfaceDisplay();
            });
            webFrame.addEventListener("mozbrowserlocationchange", (evt) => {
                this.#resourceUri = evt.detail; // Update internal URL.
                refreshInterfaceDisplay();
            });

            this.webFrame = webFrame; // Store reference to the iframe.

            // Append the iframe to the main content area.
            document.getElementById("content-display-area").appendChild(this.webFrame);
        }

        // Getter for the current URL.
        get currentUrl() {
            return this.#resourceUri;
        }

        /** Initiates the spinning animation for the loading indicator. */
        startSpinAnimation() {
            this.stopSpinAnimation(); // Ensure no multiple intervals.
            this.#spinIntervalRef = setInterval(() => {
                this.loadingIndicator.style.transform = `rotate(${this.#spinRotation}turn)`;
                this.#spinRotation += UI_CONFIG.SPINNER_ROTATION_SPEED;
            }, UI_CONFIG.SPINNER_INTERVAL_MS);
        }

        /** Stops the spinning animation. */
        stopSpinAnimation() {
            if (this.#spinIntervalRef !== null) {
                clearInterval(this.#spinIntervalRef);
                this.#spinIntervalRef = null;
                this.#spinRotation = 0; // Reset rotation.
                this.loadingIndicator.style.transform = ''; // Reset CSS transform.
            }
        }

        /** Checks if this pane is currently active. */
        isActive() {
            return this.paneElement.classList.contains(UI_CONFIG.CLASS_ACTIVE_TAB);
        }

        /** Activates this pane, deactivating any previously active pane. */
        activatePane() {
            const previouslyActivePane = retrieveActivePane();
            if (previouslyActivePane && previouslyActivePane !== this) {
                previouslyActivePane.deactivatePane();
            }

            this.paneElement.classList.add(UI_CONFIG.CLASS_ACTIVE_TAB);
            this.webFrame.classList.remove(UI_CONFIG.CLASS_HIDDEN);

            // Update the display page based on this pane's position.
            const paneIndex = sessionViews.indexOf(this);
            if (paneIndex !== -1) {
                currentDisplayPage = Math.floor(paneIndex / determineMaxVisiblePanes());
            }
            refreshInterfaceDisplay();
        }

        /** Deactivates this pane. */
        deactivatePane() {
            this.webFrame.classList.add(UI_CONFIG.CLASS_HIDDEN);
            this.paneElement.classList.remove(UI_CONFIG.CLASS_ACTIVE_TAB);
        }

        /** Hides the pane's label in the UI. */
        hidePaneLabel() {
            this.paneElement.classList.add(UI_CONFIG.CLASS_HIDDEN);
        }

        /** Shows the pane's label in the UI. */
        showPaneLabel() {
            this.paneElement.classList.remove(UI_CONFIG.CLASS_HIDDEN);
        }

        /** Reloads the content of the web view. */
        reloadContent() {
            try {
                this.webFrame.reload();
            } catch (e) {
                console.warn(`Reload failed: ${e.message || e}. ${UI_CONFIG.NAV_UNAVAILABLE_MESSAGE}`);
            }
        }

        /** Navigates the web view forward in history. */
        navigateForward() {
            try {
                this.webFrame.goForward();
            } catch (e) {
                console.warn(`Forward navigation failed: ${e.message || e}. ${UI_CONFIG.NAV_UNAVAILABLE_MESSAGE}`);
                // Consider closing window if essential feature is missing consistently.
            }
            refreshInterfaceDisplay();
        }

        /** Navigates the web view backward in history. */
        navigateBackward() {
            try {
                this.webFrame.goBack();
            } catch (e) {
                console.warn(`Backward navigation failed: ${e.message || e}. ${UI_CONFIG.NAV_UNAVAILABLE_MESSAGE}`);
                // Consider closing window if essential feature is missing consistently.
            }
            refreshInterfaceDisplay();
        }

        /** Loads a new URL into the web view. */
        loadResource(targetUri) {
            if (!targetUri || typeof targetUri !== 'string') {
                console.warn("Attempted to load an invalid URI.");
                return;
            }

            let standardizedUri = targetUri.trim();
            const lowerUri = standardizedUri.toLowerCase();

            // Simple protocol prefixing if missing.
            if (!lowerUri.startsWith("http://") && !lowerUri.startsWith("https://") && !lowerUri.startsWith("about:")) {
                standardizedUri = "http://" + standardizedUri;
            }

            this.#resourceUri = standardizedUri; // Update internal URL.
            this.webFrame.src = standardizedUri;
            this.startSpinAnimation(); // Start spinner immediately.
        }

        /** Closes this pane and removes it from the UI. */
        closePane() {
            discardPane(this);
        }
    }

    /**
     * Creates a new BrowserPane and adds it to the UI and session.
     * @param {string} uri - The initial URI for the new pane.
     * @returns {BrowserPane} The newly created pane instance.
     */
    const spawnNewPane = (uri) => {
        const newPane = new BrowserPane(uri);
        sessionViews.push(newPane);
        newPane.activatePane(); // Make the new pane active.

        const newTabButton = document.getElementById("new-tab-button");
        const tabContainer = document.getElementById("tab-navigation-container");
        tabContainer.insertBefore(newPane.paneElement, newTabButton);

        return newPane;
    };

    /**
     * Retrieves the currently active BrowserPane.
     * @returns {BrowserPane|null} The active pane, or null if none found.
     */
    const retrieveActivePane = () => {
        for (const pane of sessionViews) {
            if (pane.isActive()) {
                return pane;
            }
        }
        // Fallback for cases where no pane is active (e.g., initial state or error).
        // In a robust app, this might create a default pane if none exists.
        return sessionViews.length > 0 ? sessionViews[0] : null;
    };

    /**
     * Removes a specified BrowserPane from the session and UI.
     * @param {BrowserPane} paneToDiscard - The pane instance to remove.
     */
    const discardPane = (paneToDiscard) => {
        const paneIndex = sessionViews.indexOf(paneToDiscard);
        if (paneIndex === -1) {
            console.warn("Attempted to remove a pane that does not exist in sessionViews.");
            return; // Guard clause.
        }

        // Remove from sessionViews array.
        const [removedPane] = sessionViews.splice(paneIndex, 1);
        const wasActive = removedPane.isActive();

        // Remove UI elements.
        if (removedPane.paneElement && removedPane.paneElement.parentNode) {
            removedPane.paneElement.parentNode.removeChild(removedPane.paneElement);
        }
        if (removedPane.webFrame && removedPane.webFrame.parentNode) {
            removedPane.webFrame.parentNode.removeChild(removedPane.webFrame);
        }
        removedPane.stopSpinAnimation(); // Clean up interval.

        // Handle post-removal state.
        if (sessionViews.length === 0) {
            console.info(UI_CONFIG.EMPTY_TAB_SET_CLOSE_MESSAGE);
            window.close(); // Close application if no tabs remain.
        } else if (wasActive) {
            // Activate an adjacent pane if the removed one was active.
            const nextActiveIndex = Math.min(paneIndex, sessionViews.length - 1);
            sessionViews[nextActiveIndex].activatePane();
        } else {
            refreshInterfaceDisplay(); // Just refresh if a non-active pane was removed.
        }
    };

    /** Handles the request to open a new tab. */
    const handleNewPaneRequest = () => {
        const currentActive = retrieveActivePane();
        if (currentActive) {
            currentActive.deactivatePane();
        }
        spawnNewPane(UI_CONFIG.DEFAULT_NEW_TAB_URI);
    };

    /**
     * Updates the entire user interface based on current session state.
     * This includes address bar, window title, and visible tabs.
     */
    const refreshInterfaceDisplay = () => {
        const currentPane = retrieveActivePane();
        if (!currentPane) {
            // No active pane, perhaps disable UI elements or show a default state.
            getAddressBarInput().value = "";
            document.title = "Browser (No Active Pane)";
            return;
        }

        getAddressBarInput().value = currentPane.currentUrl;
        document.title = currentPane.paneTitleNode.nodeValue;

        // Determine which tabs should be visible based on the current "page" of tabs.
        const maxVisiblePanes = determineMaxVisiblePanes();
        const startIndex = currentDisplayPage * maxVisiblePanes;
        const endIndex = startIndex + maxVisiblePanes;

        sessionViews.forEach((pane, index) => {
            if (index < startIndex || index >= endIndex) {
                pane.hidePaneLabel();
            } else {
                pane.showPaneLabel();
            }
        });

        // Manage visibility of pagination buttons.
        const prevPageButton = document.getElementById("tab-set-prev-button");
        if (prevPageButton) {
            prevPageButton.classList.toggle(UI_CONFIG.CLASS_HIDDEN, currentDisplayPage === 0);
        }

        const nextPageButton = document.getElementById("tab-set-next-button");
        if (nextPageButton) {
            const hasNextPage = endIndex < sessionViews.length;
            nextPageButton.classList.toggle(UI_CONFIG.CLASS_HIDDEN, !hasNextPage);
        }
    };

    /**
     * Calculates the maximum number of tabs that can be displayed given current window width.
     * @returns {number} The maximum number of tabs that fit.
     */
    const determineMaxVisiblePanes = () => {
        const bodyWidth = document.body.getBoundingClientRect().width;
        // Subtract space for fixed UI elements (e.g., new tab button, pagination buttons).
        const availableWidthForTabs = bodyWidth - UI_CONFIG.MIN_UI_BUTTON_WIDTH_PX;
        return Math.max(1, Math.floor(availableWidthForTabs / UI_CONFIG.TAB_WIDTH_PX)); // Ensure at least 1 tab can be shown.
    };

    /** Navigates to the previous page of tabs. */
    const navigatePreviousPage = () => {
        if (currentDisplayPage > 0) {
            currentDisplayPage--;
            refreshInterfaceDisplay();
        }
    };

    /** Navigates to the next page of tabs. */
    const navigateNextPage = () => {
        const maxVisiblePanes = determineMaxVisiblePanes();
        const totalPages = Math.ceil(sessionViews.length / maxVisiblePanes);
        if (currentDisplayPage + 1 < totalPages) {
            currentDisplayPage++;
            refreshInterfaceDisplay();
        }
    };

    /** Handles a reload request for the active pane. */
    const handlePaneReload = () => {
        const activePane = retrieveActivePane();
        if (activePane) {
            activePane.reloadContent();
        }
    };

    /**
     * Processes input from the address bar.
     * @param {KeyboardEvent} event - The keyboard event.
     */
    const processAddressBarInput = (event) => {
        // Clear input on backspace/delete if no specific logic for them.
        if (event.keyCode === 8 || event.keyCode === 46) {
            // getAddressBarInput().value = ""; // Decide if this is desired behavior.
            // event.preventDefault(); // Prevent default browser back/delete.
        } else if (event.keyCode === 13) { // Enter key pressed.
            const activePane = retrieveActivePane();
            if (activePane) {
                activePane.loadResource(getAddressBarInput().value);
                getAddressBarInput().blur(); // Hide keyboard on mobile.
            }
        }
    };

    /** Handles a forward navigation request for the active pane. */
    const handleForwardNav = () => {
        const activePane = retrieveActivePane();
        if (activePane) {
            activePane.navigateForward();
        }
    };

    /** Handles a backward navigation request for the active pane. */
    const handleBackNav = () => {
        const activePane = retrieveActivePane();
        if (activePane) {
            activePane.navigateBackward();
        }
    };

    /** Adjusts layout and activates current tab on window resize. */
    const adjustLayoutOnResize = () => {
        // Re-calculate visible tabs and ensure the active one is shown.
        const activePane = retrieveActivePane();
        if (activePane) {
            activePane.activatePane(); // This will trigger UI refresh and page calculation.
        } else {
            refreshInterfaceDisplay();
        }
    };

    /**
     * Retrieves the address bar input element.
     * @returns {HTMLInputElement} The address bar input element.
     */
    const getAddressBarInput = () => {
        return document.getElementById("header-address-bar");
    };

    // --- Initial Setup and Event Bindings ---

    // Create the very first tab upon application startup.
    spawnNewPane(UI_CONFIG.DEFAULT_NEW_TAB_URI);

    // Attach global event listeners.
    window.addEventListener("resize", adjustLayoutOnResize);

    // Attach event listeners to header buttons.
    document.getElementById("new-tab-button").addEventListener("click", handleNewPaneRequest);
    document.getElementById("reload-button").addEventListener("click", handlePaneReload);
    document.getElementById("forward-button").addEventListener("click", handleForwardNav);
    document.getElementById("back-button").addEventListener("click", handleBackNav);
    document.getElementById("tab-set-prev-button").addEventListener("click", navigatePreviousPage);
    document.getElementById("tab-set-next-button").addEventListener("click", navigateNextPage);
    getAddressBarInput().addEventListener("keydown", processAddressBarInput);

    // Initial UI refresh to ensure everything is correctly displayed.
    refreshInterfaceDisplay();
});