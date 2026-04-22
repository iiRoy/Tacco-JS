/*
File: panel-manager.js

Overview: Current Version
	1.0 beta release

Project: ViewSynth

Description:
	ViewSynth's Adaptive Panel Layout Controller.
	This module manages dynamic content loading, segmented views, and responsive design adjustments
	for a user interface comprising tabbed panels and interactive segmented controls.

Dependencies:
	- <view-synth.js> (core utilities, must define ViewSynth.utilities)
	- <scroll-master.js> (enhanced scrolling functionality, must define ViewSynth.utilities.scrollMaster)

License: MIT
*/

/*
    Module: ViewSynth
    This module is attached to the global ViewSynth namespace.
    It ensures that the ViewSynth object exists on the window scope.
*/
var ViewSynth = window.ViewSynth || {};

/*
    Submodule: ViewSynth.Interface
    This sub-namespace holds UI-related components and modules within ViewSynth.
*/
ViewSynth.Interface = ViewSynth.Interface || {};

/*
    Component: ViewSynth.Interface.PanelManager
    This Immediately Invoked Function Expression (IIFE) defines and initializes the PanelManager component.
    It takes a root DOM element and an optional configuration object for setup.
*/
ViewSynth.Interface.PanelManager = (function (rootContainerNode, componentConfig) {

    // Internal reference to the main ViewSynth utilities object for easier access.
    const appContext = ViewSynth;

    // Self-reference to the PanelManager component itself, used for internal method calls.
    const panelModule = ViewSynth.Interface.PanelManager;

    /*
        Data Store: panelModule.state
        An object to store shared internal variables and the current operational state
        of the PanelManager, such as ongoing network requests or timers.
    */
    panelModule.state = {
        activeRequest: null, // Holds the XMLHttpRequest object for any currently pending content request.
        orientationChangeTimer: null // Timer ID used for debouncing the orientation change event.
    };

    /*
        Utilities: panelModule.helpers
        A collection of various helper functions responsible for DOM manipulation,
        class handling, content loading, and general view management tasks.
    */
    panelModule.helpers = {
        /**
         * Adjusts the height of the main content area and positions the footer
         * based on the current window height and orientation.
         * @param {HTMLElement} contentArea - The main scrollable content region.
         * @param {HTMLElement} navigationFooter - The footer element, typically containing navigation tabs.
         */
        adjustLayoutOnOrientation: function(contentArea, navigationFooter) {
            if (!contentArea) {
                console.warn("PanelManager: Content area element not provided for layout adjustment.");
                return; // Exit if the content area is missing.
            }

            // Calculate the available height by subtracting the footer's height from the viewport.
            const viewportHeight = window.innerHeight;
            const footerHeight = navigationFooter ? navigationFooter.offsetHeight : 0;
            const dynamicOffset = viewportHeight - footerHeight;

            // Apply the calculated height to the main content area's style.
            contentArea.style.height = `${dynamicOffset - contentArea.offsetTop}px`;

            // If a footer exists, position it at the bottom of the dynamic offset.
            if (navigationFooter) {
                navigationFooter.style.top = `${dynamicOffset}px`;
            }
            console.info("PanelManager: Layout adjusted in response to orientation change or initial load.");
        },

        /**
         * Updates the displayed header element based on the currently active panel.
         * It hides all headers in the parent and shows only the relevant one.
         * @param {HTMLElement} currentHeaderElement - A reference to an existing header element.
         * @param {HTMLElement|null} newHeaderFragment - A newly created header fragment, or null if querying existing.
         * @param {string} panelIndex - The data-related-index value to identify the header.
         */
        refreshActiveHeader: function(currentHeaderElement, newHeaderFragment, panelIndex) {
            if (!currentHeaderElement || !currentHeaderElement.parentNode) {
                console.error("PanelManager: Parent of the current header element is missing, cannot refresh.");
                return;
            }

            let targetHeader = newHeaderFragment;

            // If a new header fragment is provided, set its custom data attribute and append it.
            // Otherwise, query for an existing header in the DOM based on the panel index.
            if (targetHeader) {
                targetHeader.dataset.relatedIndex = panelIndex; // Use dataset for custom attributes.
                currentHeaderElement.parentNode.appendChild(targetHeader);
            } else {
                targetHeader = currentHeaderElement.parentNode.querySelector(`header[data-related-index='${panelIndex}']`);
            }

            if (!targetHeader) {
                console.warn(`PanelManager: Target header for panel index '${panelIndex}' not found.`);
                return;
            }

            // Iterate through all header elements within the parent and hide them,
            // then remove the 'hidden' class from the identified target header.
            Array.from(currentHeaderElement.parentNode.querySelectorAll("header"))
                 .forEach(headerEl => appContext.utilities.applyClass(headerEl, appContext.utilities.getClassPrefix("hidden")));

            appContext.utilities.removeClass(targetHeader, appContext.utilities.getClassPrefix("hidden"));
            console.log(`PanelManager: Active header updated for panel index: ${panelIndex}.`);
        },

        /**
         * Fetches and loads content into a specified target element. Content can be
         * either from a local DOM selector or an external URL via XMLHttpRequest.
         * @param {string} contentSourcePath - The source path (e.g., "#my-panel-id" or "content/page.html").
         * @param {HTMLElement} currentHeaderElement - The header element to update.
         * @param {HTMLElement} contentTargetElement - The DOM element where content will be loaded.
         * @param {string} panelIndex - The index associated with the panel for header updates.
         */
        fetchContentPanel: function(contentSourcePath, currentHeaderElement, contentTargetElement, panelIndex) {
            if (!contentSourcePath || !contentTargetElement) {
                console.error("PanelManager: Content source path or target element is missing. Cannot fetch panel.");
                return;
            }

            // Abort any currently active XMLHttpRequest to prevent multiple simultaneous requests.
            if (panelModule.state.activeRequest) {
                panelModule.state.activeRequest.abort();
                console.warn("PanelManager: Aborting previous content request to fetch new content.");
            }

            // Check if the content source is a local DOM selector (starts with '#').
            if (contentSourcePath.startsWith("#")) {
                const activePanel = contentTargetElement.querySelector(contentSourcePath);

                if (activePanel) {
                    const panelHeader = activePanel.querySelector("header");
                    panelModule.helpers.refreshActiveHeader(currentHeaderElement, panelHeader, panelIndex);

                    // Hide all content panels within the target and then display only the active one.
                    Array.from(contentTargetElement.querySelectorAll(appContext.utilities.getClassPrefix("panel-display-item", ".")))
                         .forEach(panelEl => appContext.utilities.applyClass(panelEl, appContext.utilities.getClassPrefix("panel-hidden")));

                    appContext.utilities.removeClass(activePanel, appContext.utilities.getClassPrefix("panel-hidden"));
                    console.log(`PanelManager: Displayed local content panel from selector: ${contentSourcePath}.`);
                } else {
                    console.warn(`PanelManager: Local content panel not found for selector: ${contentSourcePath}.`);
                }

                // Ensure the scroll position is reset and scrolling is re-enabled for the content area.
                appContext.utilities.scrollMaster.resetScrollPosition(contentTargetElement, "0");
                appContext.utilities.scrollMaster.activateScroll();

            } else { // If not a local selector, assume it's an external URL to fetch via XHR.
                const xhrRequest = new XMLHttpRequest();
                panelModule.state.activeRequest = xhrRequest; // Store the request object in state.

                xhrRequest.onreadystatechange = function() {
                    // Check if the request is complete.
                    if (xhrRequest.readyState === XMLHttpRequest.DONE) {
                        // Check for successful HTTP status codes (2xx or 304 Not Modified).
                        if ((xhrRequest.status >= 200 && xhrRequest.status < 300) || xhrRequest.status === 304) {
                            // Clear existing content from the target element efficiently.
                            while (contentTargetElement.firstChild) {
                                contentTargetElement.removeChild(contentTargetElement.firstChild);
                            }

                            // Create a document fragment to minimize reflows during DOM manipulation.
                            const documentFragment = document.createDocumentFragment();
                            const tempDiv = document.createElement("div");
                            tempDiv.innerHTML = xhrRequest.responseText; // Parse the HTML response.

                            // Extract the header from the fetched content and update the main header.
                            const newHeaderFromResponse = tempDiv.querySelector("header");
                            panelModule.helpers.refreshActiveHeader(currentHeaderElement, newHeaderFromResponse, panelIndex);

                            // Append all child nodes from the temporary div to the fragment.
                            // The loop uses `tempDiv.firstChild` and `appendChild` which moves the node,
                            // making it an efficient way to transfer all children.
                            while (tempDiv.firstChild) {
                                documentFragment.appendChild(tempDiv.firstChild);
                            }

                            contentTargetElement.appendChild(documentFragment); // Append fragment to the DOM.
                            console.log(`PanelManager: Loaded external content from URL: ${contentSourcePath}.`);

                            // Reset scroll position and re-enable scrolling after content load.
                            appContext.utilities.scrollMaster.resetScrollPosition(contentTargetElement, "0");

                        } else {
                            // Log HTTP errors.
                            console.error(`PanelManager: Failed to load content from ${contentSourcePath}. HTTP Status: ${xhrRequest.status}`);
                            // Optional: Display a user-friendly error message within contentTargetElement.
                        }
                        appContext.utilities.scrollMaster.activateScroll(); // Always re-enable scroll.
                        panelModule.state.activeRequest = null; // Clear the active request reference.
                    }
                };
                // Handle network-level errors (e.g., no internet connection).
                xhrRequest.onerror = function() {
                    console.error(`PanelManager: Network error while attempting to fetch content from ${contentSourcePath}.`);
                    appContext.utilities.scrollMaster.activateScroll();
                    panelModule.state.activeRequest = null;
                };

                xhrRequest.open("GET", contentSourcePath, true); // Open the request asynchronously.
                xhrRequest.send(); // Send the request.
            }
        },

        /**
         * Displays a specific segment of content within a segmented control.
         * It hides all segments and shows only the one identified by the selector.
         * @param {HTMLElement} segmentContainer - The container holding all segment content items.
         * @param {string} segmentIdSelector - The CSS selector for the segment to display (e.g., "#segment-id").
         */
        displaySegmentContent: function(segmentContainer, segmentIdSelector) {
            if (!segmentContainer || !segmentIdSelector) {
                console.error("PanelManager: Segment container or selector is missing. Cannot display segment.");
                return;
            }

            const activeSegmentElement = segmentContainer.querySelector(segmentIdSelector);

            if (activeSegmentElement) {
                // Hide all segment content items within the container.
                Array.from(segmentContainer.querySelectorAll(appContext.utilities.getClassPrefix("segment-item-content", ".")))
                     .forEach(segmentItem => appContext.utilities.applyClass(segmentItem, appContext.utilities.getClassPrefix("visually-hidden")));

                // Show the identified active segment content.
                appContext.utilities.removeClass(activeSegmentElement, appContext.utilities.getClassPrefix("visually-hidden"));
                console.log(`PanelManager: Displayed segment content for selector: ${segmentIdSelector}.`);
            } else {
                console.warn(`PanelManager: Segment content not found for selector: ${segmentIdSelector}.`);
            }

            // Reset scroll position and re-enable scrolling for the segmented content area.
            appContext.utilities.scrollMaster.resetScrollPosition(segmentContainer, "0");
            appContext.utilities.scrollMaster.activateScroll();
        },

        /**
         * Initializes the segmented control functionality by attaching event listeners
         * and handling the initial state based on an active segment.
         * @param {HTMLElement} contentWrapperArea - The main content area where segments are displayed.
         * @param {HTMLElement} associatedHeaderElement - The header element related to the segmented control.
         */
        initializeSegmentedControl: function(contentWrapperArea, associatedHeaderElement) {
            const segmentControlElement = associatedHeaderElement.parentNode.querySelector(appContext.utilities.getClassPrefix("segmented-control", "."));
            const initialActiveLink = segmentControlElement ? segmentControlElement.querySelector(appContext.utilities.getClassPrefix("segmented-control-active", ".") + " a") : null;

            if (!segmentControlElement) {
                console.warn("PanelManager: Segmented control element not found. Initialization skipped.");
                return;
            }

            // Attach a 'pointerup' event listener for broader compatibility (mouse and touch).
            segmentControlElement.addEventListener("pointerup", function(evt) {
                evt.stopPropagation(); // Prevent the event from bubbling up and causing unintended actions.

                const eventTargetNode = evt.target;
                // Use `closest` to find the nearest ancestor <a> tag, which is more robust than `while` loop.
                const clickedLink = eventTargetNode.closest("a");

                // Ensure a link was clicked and it belongs to *this* segmented control.
                if (clickedLink && clickedLink.parentNode && clickedLink.parentNode.closest(appContext.utilities.getClassPrefix("segmented-control", ".")) === segmentControlElement) {
                    const allControlItems = segmentControlElement.querySelectorAll("li");
                    const activeSegmentCssClass = appContext.utilities.getClassPrefix("segmented-control-active");

                    // Remove the active class from all control items.
                    allControlItems.forEach(item => appContext.utilities.removeClass(item, activeSegmentCssClass));

                    // Add the active class to the parent <li> of the clicked link.
                    appContext.utilities.applyClass(clickedLink.parentNode, activeSegmentCssClass);

                    // Load the corresponding segment content based on its 'data-segment-ref' or 'rel' attribute.
                    panelModule.helpers.displaySegmentContent(contentWrapperArea, clickedLink.dataset.segmentRef || clickedLink.getAttribute("rel"));
                    console.log(`PanelManager: Segment control activated by link: ${clickedLink.href || clickedLink.dataset.segmentRef}.`);
                }
            }, false);

            // If an initial active segment link is defined, load its content on setup.
            if (initialActiveLink) {
                panelModule.helpers.displaySegmentContent(contentWrapperArea, initialActiveLink.dataset.segmentRef || initialActiveLink.getAttribute("rel"));
                console.info("PanelManager: Initial segmented control content loaded based on active link.");
            }
        }
    };

    /**
     * Prepares all scrollable 'view' elements within the given container by initializing
     * the ScrollMaster component for each.
     * @param {HTMLElement} containingElement - The root element to search for scrollable views.
     */
    panelModule.prepareScrollableViews = function(containingElement) {
        if (!containingElement) {
            console.error("PanelManager: Root element for preparing scrollable views is null.");
            return;
        }
        const scrollableAreas = containingElement.querySelectorAll("view");

        scrollableAreas.forEach(viewEl => {
            // Instantiate the ScrollMaster for each identified scrollable view.
            new appContext.utilities.scrollMaster({
                target: viewEl
            });
            console.debug(`PanelManager: Initialized ScrollMaster for view element: ${viewEl.id || viewEl.className || 'unnamed'}.`);
        });
    };

    /**
     * Attaches all necessary event handlers for the tab navigation, orientation changes,
     * and segmented controls within the main interface container.
     * @param {HTMLElement} mainContainerNode - The main container element holding the UI components.
     */
    panelModule.attachInterfaceHandlers = function(mainContainerNode) {
        if (!mainContainerNode) {
            console.error("PanelManager: Main container node for event handlers is null. Cannot attach handlers.");
            return;
        }

        // Cache frequently accessed DOM elements for performance.
        const mainViewport = mainContainerNode.querySelector("view > section");
        // Renamed class from ".ui-dup-rivet-wrapper" to ".ui-synth-scroll-wrapper"
        const contentWrapper = mainViewport ? mainViewport.querySelector(appContext.utilities.getClassPrefix("scroll-wrapper", ".")) : null;
        const viewportHeader = mainContainerNode.querySelector("view > viewport header");
        const footerNav = mainContainerNode.querySelector("footer");
        const navTabs = footerNav ? Array.from(footerNav.querySelectorAll("li a")) : [];
        // Renamed class from "li.ui-dup-tab-active a" to "li.ui-synth-tab-active a"
        const initialActiveTabLink = footerNav ? footerNav.querySelector(appContext.utilities.getClassPrefix("tab-active", "li.")) : null;

        // Perform essential element checks before proceeding.
        if (!mainViewport || !contentWrapper || !viewportHeader || !footerNav || navTabs.length === 0) {
            console.error("PanelManager: One or more essential UI elements not found for event attachment. Check DOM structure.");
            return;
        }

        const activeTabCssClass = appContext.utilities.getClassPrefix("tab-active");

        // Attach 'pointerup' event listeners to each navigation tab.
        navTabs.forEach((currentTabEl, tabIndex) => {
            currentTabEl.dataset.tabIndex = tabIndex; // Store index using dataset for easy retrieval.

            currentTabEl.addEventListener("pointerup", function(evt) {
                evt.preventDefault(); // Prevent default link behavior (e.g., navigating to #hash).
                const tabParentLi = this.parentNode;
                const linkRef = this.dataset.segmentRef || this.getAttribute("rel"); // Prefer dataset for content reference.

                // Only proceed if the clicked tab is not already active.
                if (!appContext.utilities.hasClass(tabParentLi, activeTabCssClass)) {
                    // Temporarily disable scrolling during the tab transition for a smoother experience.
                    appContext.utilities.scrollMaster.disableScroll();

                    // Remove the active class from all tab list items.
                    navTabs.forEach(tab => appContext.utilities.removeClass(tab.parentNode, activeTabCssClass));

                    // Add the active class to the parent <li> of the newly clicked tab.
                    appContext.utilities.applyClass(tabParentLi, activeTabCssClass);

                    // Load the content associated with the selected tab.
                    panelModule.helpers.fetchContentPanel(linkRef, viewportHeader, contentWrapper, this.dataset.tabIndex);
                    console.log(`PanelManager: Tab "${linkRef}" activated by user interaction.`);
                }
            }, false);
        });

        // Load initial content based on the active tab defined in the DOM, if one exists.
        if (initialActiveTabLink) {
            const initialLinkRef = initialActiveTabLink.dataset.segmentRef || initialActiveTabLink.getAttribute("rel");
            const initialTabIndex = initialActiveTabLink.dataset.tabIndex;
            panelModule.helpers.fetchContentPanel(initialLinkRef, viewportHeader, contentWrapper, initialTabIndex);
            console.info(`PanelManager: Initial content loaded for pre-selected active tab: ${initialLinkRef}.`);
        }

        // Attach a debounced event listener for 'orientationchange' to optimize layout adjustments.
        window.addEventListener("orientationchange", function() {
            clearTimeout(panelModule.state.orientationChangeTimer); // Clear any previous timer.
            panelModule.state.orientationChangeTimer = setTimeout(() => {
                panelModule.helpers.adjustLayoutOnOrientation(mainViewport, footerNav);
            }, 250); // Debounce for 250 milliseconds.
        }, false);

        // Perform an initial layout adjustment and initialize segmented controls on load.
        panelModule.helpers.adjustLayoutOnOrientation(mainViewport, footerNav);
        panelModule.helpers.initializeSegmentedControl(contentWrapper, viewportHeader);
        console.info("PanelManager: All interface event handlers have been successfully attached.");
    };

    /*
        Method: panelModule.initializeModule
        The primary entry point for the PanelManager component.
        It orchestrates the setup of scrollable views, attaches all UI event listeners,
        and applies any provided configuration properties.
    */
    panelModule.initializeModule = function() {
        panelModule.prepareScrollableViews(rootContainerNode);
        panelModule.attachInterfaceHandlers(rootContainerNode);

        // If an optional configuration object is provided, apply its properties.
        if (componentConfig) {
            appContext.utilities.configureModule(rootContainerNode, componentConfig);
            console.debug("PanelManager: Component configured with provided properties.");
        }
        console.info("PanelManager: Module initialization complete and ready.");
    }(); // The IIFE is immediately invoked to run the initialization.

    // --- MOCK / PLACEHOLDER for ViewSynth.utilities and ScrollMaster ---
    // These objects and methods are assumed to be provided by `view-synth.js` and `scroll-master.js`.
    // They are included here as mock implementations for the clone to be self-contained and runnable,
    // demonstrating the expected interface for external dependencies.
    if (!appContext.utilities) {
        appContext.utilities = {
            /**
             * Generates a prefixed CSS class name.
             * @param {string} baseClass - The base class name (e.g., "hidden").
             * @param {string} [prefixChar=""] - An optional character to prepend (e.g., "." for selectors).
             * @returns {string} The fully prefixed class name.
             */
            getClassPrefix: function(baseClass, prefixChar = "") {
                const classPrefix = "ui-synth-"; // New distinct prefix for all ViewSynth classes.
                return `${prefixChar}${classPrefix}${baseClass}`;
            },
            /**
             * Adds a CSS class to an HTML element.
             * @param {HTMLElement} element - The target HTML element.
             * @param {string} className - The class name to add.
             */
            applyClass: function(element, className) {
                if (element && className) element.classList.add(className);
            },
            /**
             * Removes a CSS class from an HTML element.
             * @param {HTMLElement} element - The target HTML element.
             * @param {string} className - The class name to remove.
             */
            removeClass: function(element, className) {
                if (element && className) element.classList.remove(className);
            },
            /**
             * Checks if an HTML element has a specific CSS class.
             * @param {HTMLElement} element - The target HTML element.
             * @param {string} className - The class name to check for.
             * @returns {boolean} True if the element has the class, false otherwise.
             */
            hasClass: function(element, className) {
                return element && className ? element.classList.contains(className) : false;
            },
            /**
             * A placeholder for a function to apply configuration properties to a module or element.
             * @param {HTMLElement} element - The root element associated with the module.
             * @param {object} properties - An object containing configuration properties.
             */
            configureModule: function(element, properties) {
                console.log("PanelManager: (Mock) configureModule functionality called.", element, properties);
                // In a real implementation, this would iterate through properties
                // and apply them to the element's dataset or internal state.
            },
            scrollMaster: { // Renamed from Rivet.utils
                /**
                 * Resets the scroll position of a given element.
                 * @param {HTMLElement} element - The element whose scroll position needs to be reset.
                 * @param {string} [position="0"] - The scroll position (e.g., "0" for top).
                 */
                resetScrollPosition: function(element, position = "0") {
                    console.log("PanelManager: (Mock) ScrollMaster - resetScrollPosition called for", element, "to", position);
                    if (element) {
                        element.scrollTop = parseInt(position, 10);
                    }
                },
                /**
                 * Activates scrolling functionality.
                 */
                activateScroll: function() {
                    console.log("PanelManager: (Mock) ScrollMaster - activateScroll called.");
                    // Placeholder for logic to enable custom scrolling or native overflow.
                },
                /**
                 * Disables scrolling functionality.
                 */
                disableScroll: function() {
                    console.log("PanelManager: (Mock) ScrollMaster - disableScroll called.");
                    // Placeholder for logic to disable custom scrolling or native overflow.
                }
            }
        };
    }
    // --- End MOCK / PLACEHOLDER ---

}); // End of ViewSynth.Interface.PanelManager IIFE.