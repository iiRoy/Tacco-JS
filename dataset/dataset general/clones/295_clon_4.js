(function() {
    class VisualAssetManager {
        constructor(assetNodes, configurationData) {
            const defaultParameters = {
                viewBoundaryMargin: 0,
                checkFailureLimit: 0,
                triggeringAction: "scroll",
                displayTransition: "show", // Accepted: 'show', 'fade'
                animationDuration: 400, // in milliseconds
                viewportReference: window, // Can be 'window' or a CSS selector string
                hideIfInvisible: false
            };

            this.currentConfiguration = Object.assign({}, defaultParameters, configurationData);
            this.managedVisuals = Array.from(assetNodes).map(node => ({
                domReference: node,
                isAcquired: false
            }));

            // Determine the element that triggers events (scroll, resize, etc.)
            this.actionOrigin = (this.currentConfiguration.viewportReference === window)
                ? window
                : document.querySelector(this.currentConfiguration.viewportReference);

            if (!this.actionOrigin) {
                 this.actionOrigin = window; // Fallback to window if selector fails
            }

            this.setupEventHandlers();
            this.performInitialCheck();
        }

        // Determines if an element is currently within the visible viewport or specified container
        isWithinVisualBoundary(visualItem) {
            const element = visualItem.domReference;

            // Option to skip elements that are not rendered (e.g., display: none)
            if (this.currentConfiguration.hideIfInvisible && (element.offsetWidth === 0 && element.offsetHeight === 0)) {
                return false;
            }

            const elementRectangle = element.getBoundingClientRect();
            const windowHeight = window.innerHeight || document.documentElement.clientHeight;
            const windowWidth = window.innerWidth || document.documentElement.clientWidth;

            let containerTopBoundary = 0;
            let containerLeftBoundary = 0;
            let containerBottomBoundary = windowHeight;
            let containerRightBoundary = windowWidth;

            // If a specific container is specified, adjust boundaries relative to it
            if (this.currentConfiguration.viewportReference !== window) {
                const containerElement = this.actionOrigin;
                const containerRectangle = containerElement.getBoundingClientRect();
                containerTopBoundary = containerRectangle.top;
                containerLeftBoundary = containerRectangle.left;
                containerBottomBoundary = containerRectangle.bottom;
                containerRightBoundary = containerRectangle.right;
            }

            // Check if the element is completely above or to the left of the container/viewport
            const isAboveContainer = elementRectangle.bottom + this.currentConfiguration.viewBoundaryMargin < containerTopBoundary;
            const isLeftOfContainer = elementRectangle.right + this.currentConfiguration.viewBoundaryMargin < containerLeftBoundary;

            // Check if the element is completely below or to the right of the container/viewport
            const isBelowContainer = elementRectangle.top - this.currentConfiguration.viewBoundaryMargin > containerBottomBoundary;
            const isRightOfContainer = elementRectangle.left - this.currentConfiguration.viewBoundaryMargin > containerRightBoundary;

            // Element is within visual boundary if it's not completely outside in any direction
            return !isAboveContainer && !isLeftOfContainer && !isBelowContainer && !isRightOfContainer;
        }

        // Initiates the loading of an asset's source
        activateAssetSource(visualItem) {
            if (visualItem.isAcquired) return;

            const element = visualItem.domReference;
            const originalSourcePath = element.dataset.sourceReference;

            if (!originalSourcePath) {
                visualItem.isAcquired = true; // Mark as acquired even if no source to prevent re-attempts
                return;
            }

            // Apply initial styling based on the desired display transition
            if (this.currentConfiguration.displayTransition === "fade") {
                element.style.opacity = '0';
                element.style.transition = `opacity ${this.currentConfiguration.animationDuration}ms ease-in`;
            } else { // 'show'
                element.style.display = 'none';
            }

            const temporaryImage = new Image();
            temporaryImage.onload = () => {
                element.setAttribute("src", originalSourcePath);
                element.removeAttribute("data-source-reference"); // Clean up the data attribute

                // Apply final styling after the image has loaded
                if (this.currentConfiguration.displayTransition === "fade") {
                    element.style.opacity = '1';
                } else { // 'show'
                    element.style.display = ''; // Revert to default display (e.g., 'block' for img)
                }
                visualItem.isAcquired = true;
            };
            temporaryImage.onerror = () => {
                visualItem.isAcquired = true; // Mark as acquired to stop retrying, even on error
                // Optional: add a 'broken-image' class or set a placeholder src
            };
            temporaryImage.src = originalSourcePath;
        }

        // Handler for viewport updates (scroll, resize)
        handleViewportUpdate() {
            let currentFailedChecks = 0;
            for (let i = 0; i < this.managedVisuals.length; i++) {
                const item = this.managedVisuals[i];
                if (item.isAcquired) continue; // Skip already loaded items

                if (this.isWithinVisualBoundary(item)) {
                    this.activateAssetSource(item);
                } else {
                    currentFailedChecks++;
                    if (this.currentConfiguration.checkFailureLimit > 0 && currentFailedChecks > this.currentConfiguration.checkFailureLimit) {
                        return; // Stop processing if failure limit is reached
                    }
                }
            }

            // If all elements are acquired, remove the event listeners to save resources
            if (this.managedVisuals.every(item => item.isAcquired)) {
                this.actionOrigin.removeEventListener(this.currentConfiguration.triggeringAction, this.boundUpdateHandler);
                if (this.currentConfiguration.triggeringAction === "scroll") {
                    this.actionOrigin.removeEventListener("resize", this.boundUpdateHandler);
                }
            }
        }

        // Sets up the appropriate event listeners
        setupEventHandlers() {
            // Store a bound reference to the handler for easy removal
            this.boundUpdateHandler = this.handleViewportUpdate.bind(this);

            if (this.currentConfiguration.triggeringAction === "scroll") {
                this.actionOrigin.addEventListener("scroll", this.boundUpdateHandler);
                this.actionOrigin.addEventListener("resize", this.boundUpdateHandler); // Also check on resize
            } else {
                // For custom events, bind to each individual element
                this.managedVisuals.forEach(item => {
                    if (!item.isAcquired) {
                        // Use { once: true } to ensure the event triggers the load only once
                        item.domReference.addEventListener(this.currentConfiguration.triggeringAction, () => this.activateAssetSource(item), { once: true });
                    }
                });
            }
        }

        // Performs an immediate check after initialization
        performInitialCheck() {
            // Delay slightly to ensure browser has rendered and calculated initial layouts
            setTimeout(() => this.handleViewportUpdate(), 100);
        }
    }

    // Expose a global factory function to initialize the asset loader
    window.initializeAssetLoader = function(cssSelector, initializationOptions) {
        const selectedElements = document.querySelectorAll(cssSelector);
        if (selectedElements.length > 0) {
            return new VisualAssetManager(selectedElements, initializationOptions);
        }
        return null; // Return null if no elements match the selector
    };

})();