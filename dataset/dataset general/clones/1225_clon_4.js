(function (globalReference) {
    const defaultSettings = {
        imageQuery: "img",
        adjustOnViewportChange: true,
        applyInitialStyles: true
    };

    // A collection to keep track of all active background scaling instances
    const activeBackgroundScalers = new Set();

    // A flag to ensure the global resize listener is attached only once
    let globalResizeListenerAttached = false;

    // The single, central handler for viewport resize events
    function manageGlobalViewportResize() {
        activeBackgroundScalers.forEach(instance => {
            if (instance.configuration.adjustOnViewportChange) {
                instance.updateVisualLayout();
            }
        });
    }

    class BackgroundScaler {
        constructor(targetContainerElement, providedOptions) {
            if (!targetContainerElement) {
                console.error("A target container element is necessary for background scaling.");
                return;
            }

            this.mainContainer = targetContainerElement;
            this.configuration = Object.assign({}, defaultSettings, providedOptions);
            this.internalImages = []; // Stores references to the image elements being managed

            this.setupInitialState();
            activeBackgroundScalers.add(this); // Register this instance

            // Attach the global resize listener if it's not already and this instance needs it
            if (this.configuration.adjustOnViewportChange && !globalResizeListenerAttached) {
                globalReference.addEventListener('resize', manageGlobalViewportResize);
                globalResizeListenerAttached = true;
            }
        }

        setupInitialState() {
            if (this.configuration.applyInitialStyles) {
                const docRoot = globalReference.document.documentElement;
                const docBody = globalReference.document.body;

                Object.assign(docRoot.style, {
                    width: "100%",
                    height: "100%"
                });
                Object.assign(docBody.style, {
                    width: "100%",
                    height: "100%"
                });

                Object.assign(this.mainContainer.style, {
                    height: "100%",
                    width: "100%",
                    overflow: "hidden",
                    position: "fixed",
                    top: "0px",
                    left: "0px",
                    zIndex: 1 // Numeric zIndex
                });
            }

            // Populate internalImages from the container using the specified query
            this.internalImages = Array.from(this.mainContainer.querySelectorAll(this.configuration.imageQuery));

            // Perform the initial layout adjustment
            this.updateVisualLayout();
        }

        updateVisualLayout() {
            const currentViewportHeight = globalReference.innerHeight;
            const currentViewportWidth = globalReference.innerWidth;

            this.internalImages.forEach(currentImageElement => {
                // Retrieve original dimensions from attributes, mimicking the original's behavior
                const storedImageWidth = parseFloat(currentImageElement.getAttribute("width"));
                const storedImageHeight = parseFloat(currentImageElement.getAttribute("height"));

                // If attributes are missing or invalid, calculations might become NaN,
                // replicating the original's potential behavior in such cases.
                // No fallback to naturalWidth/Height for strict functional equivalence.

                let calculatedFinalWidth = currentViewportWidth;
                let calculatedFinalHeight = (currentViewportWidth / storedImageWidth) * storedImageHeight;
                let verticalPositionOffset = ((calculatedFinalHeight - currentViewportHeight) / 2) * -1;
                let horizontalPositionOffset = 0;

                if (calculatedFinalHeight < currentViewportHeight) {
                    calculatedFinalWidth = (currentViewportHeight / storedImageHeight) * storedImageWidth;
                    calculatedFinalHeight = currentViewportHeight;
                    verticalPositionOffset = 0;
                    horizontalPositionOffset = ((calculatedFinalWidth - currentViewportWidth) / 2) * -1;
                }

                Object.assign(currentImageElement.style, {
                    height: calculatedFinalHeight + "px",
                    width: calculatedFinalWidth + "px",
                    marginLeft: horizontalPositionOffset + "px",
                    marginTop: verticalPositionOffset + "px",
                    display: "block"
                });
            });
        }

        // Method to clean up an instance if it's no longer required
        deactivate() {
            activeBackgroundScalers.delete(this);
            // If no more scalers require resize handling, remove the global listener
            if (globalResizeListenerAttached && !Array.from(activeBackgroundScalers).some(s => s.configuration.adjustOnViewportChange)) {
                globalReference.removeEventListener('resize', manageGlobalViewportResize);
                globalResizeListenerAttached = false;
            }
        }
    }

    // Expose a factory function to initialize background scaling,
    // allowing it to be called with a CSS selector, similar to a jQuery plugin.
    globalReference.initiateViewportBackground = function (targetCssSelector, configurationParameters) {
        const matchingElements = globalReference.document.querySelectorAll(targetCssSelector);
        const createdInstances = [];
        matchingElements.forEach(element => {
            createdInstances.push(new BackgroundScaler(element, configurationParameters));
        });
        return createdInstances; // Returns an array of created instances for potential external management
    };

})(window);