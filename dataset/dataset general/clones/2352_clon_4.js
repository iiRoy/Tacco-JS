(function (root, undefined) {

    // Default configuration settings for the layout engine
    var standardSettings = {
        layoutSchema: [
            {
                minimumWidth: 960,
                columnCount: 4
            },
            {
                minimumWidth: 720,
                columnCount: 3
            },
            {
                minimumWidth: 550,
                columnCount: 2
            },
            {
                minimumWidth: 0,
                columnCount: 1
            }
        ],
        visualMode: null, // e.g., 'verticalStack', 'urbanScape'
        prioritizeRightmost: false,
        heightAlignmentFactor: 25,
    };

    // The main layout engine class
    class LayoutEngine {
        constructor(hostElement, userConfiguration) {
            this.mainContainer = hostElement;

            // Merge user configuration with standard settings
            this.configuration = Object.assign({}, standardSettings, userConfiguration);

            this._baseSettings = standardSettings;
            this._engineName = 'dynamicLayout';

            this._initiateProcess();
        }

        _initiateProcess() {
            // Create an inner wrapper for the grid content
            const contentWrapper = document.createElement('div');
            contentWrapper.classList.add('flex-arrangement-zone');
            while (this.mainContainer.firstChild) {
                contentWrapper.appendChild(this.mainContainer.firstChild);
            }
            this.mainContainer.appendChild(contentWrapper);
            this.flexZone = contentWrapper;

            // Gather and store references to key DOM elements
            this._captureStructureElements();

            // Set up the initial grid layout
            this._recalculateLayout();

            // Attach event listeners for responsiveness and content updates
            window.addEventListener('resize', () => {
                this._recalculateLayout();
            });

            this.mainContainer.addEventListener('layout:refresh', () => {
                this._recalculateLayout();
            });

            this.mainContainer.addEventListener('content:add', () => {
                this._integrateNewContent();
            });
        }

        /*
         * Integrates newly added content items into the layout.
         */
        _integrateNewContent() {
            const newContentNodes = Array.from(this.mainContainer.children).filter(
                node => node !== this.flexZone && node.matches(':scope > *')
            );

            newContentNodes.forEach(node => {
                this.contentItems.push(node); // Add to internal array
            });

            // Re-arrange all content based on the current column count
            this._constructColumns(this._currentColumnCount);
        }

        /*
         * Gathers references to the main DOM elements used by the engine.
         */
        _captureStructureElements() {
            this.contentItems = Array.from(this.flexZone.children);
            this.columnElements = []; // Will be populated when columns are constructed
            this.columnHeights = []; // Tracks current height of each column
        }

        /*
         * Determines the appropriate column configuration and triggers layout updates.
         */
        _recalculateLayout() {
            const currentZoneWidth = this.flexZone.offsetWidth;
            let activeColumnCount;
            let zoneClass;
            const self = this; // Capture 'this' for loop context

            // Iterate through layout schemes to find the matching configuration
            for (const schemeConfig of this.configuration.layoutSchema) {
                if (schemeConfig.minimumWidth <= currentZoneWidth) {
                    activeColumnCount = schemeConfig.columnCount;
                    zoneClass = 'zone-' + activeColumnCount;

                    // Check if the container's class needs to be updated
                    if (!this.flexZone.classList.contains(zoneClass)) {
                        // Reset and apply new classes
                        this.flexZone.className = 'flex-arrangement-zone ' + zoneClass;

                        // Store current column count
                        this._currentColumnCount = activeColumnCount;

                        // Reconstruct and distribute content into columns
                        this._constructColumns(activeColumnCount);
                    } else {
                        // If column count hasn't changed, just resize existing items
                        this._rescaleAllItems();
                    }
                    break; // Found the matching scheme, exit loop
                }
            }
        }

        /*
         * Creates or recreates the column structure within the layout zone.
         */
        _constructColumns(count) {
            // Clear existing columns
            while (this.flexZone.firstChild) {
                this.flexZone.removeChild(this.flexZone.firstChild);
            }

            // Generate and append new column elements
            this.columnElements = []; // Reset stored column references
            for (let i = 1; i <= count; i++) {
                const colElement = document.createElement('div');
                colElement.classList.add('column', `column-${i}`);
                this.flexZone.appendChild(colElement);
                this.columnElements.push(colElement);
            }

            // Initialize internal height trackers for columns
            this.columnHeights = new Array(count).fill(0);

            // Distribute all content items into the new columns
            this._distributeItemsToColumns(count);
        }

        /*
         * Organizes and distributes content items into the columns.
         */
        _distributeItemsToColumns(count) {
            // Apply rightmost priority if enabled
            if (this.configuration.prioritizeRightmost && count > 0) {
                this.columnHeights[count - 1] = -1; // Make the last column initially the shortest
            }

            // Iterate through each content item to place it
            this.contentItems.forEach((itemElement, index) => {
                let leastHeight = Infinity;
                let targetColumnIndex = -1;

                // Find the column with the minimum accumulated height
                this.columnHeights.forEach((colHeight, colIndex) => {
                    if (colHeight < leastHeight) {
                        leastHeight = colHeight;
                        targetColumnIndex = colIndex;
                    }
                });

                // Append the item to the chosen (shortest) column
                this.columnElements[targetColumnIndex].appendChild(itemElement);

                // Adjust the item's height if a divisor is specified
                if (this.configuration.heightAlignmentFactor > 1) {
                    this._standardizeItemHeight(itemElement);
                }

                // Update the internal height tracker for the chosen column
                // Use offsetHeight which includes padding and border, similar to jQuery's height()
                this.columnHeights[targetColumnIndex] += itemElement.offsetHeight;
            });

            // After all items are placed, make the main container visible if hidden
            if (window.getComputedStyle(this.mainContainer).visibility === 'hidden') {
                this.mainContainer.style.visibility = 'visible';
            }

            // Apply special visual modes if configured
            if (this.configuration.visualMode) {
                if (this.configuration.visualMode === 'verticalStack') {
                    this.flexZone.classList.add('mode-verticalStack');
                } else if (this.configuration.visualMode === 'urbanScape') {
                    this.flexZone.classList.add('mode-urbanScape');
                }
            }
        }

        /*
         * Adjusts a single content item's height to align with the heightAlignmentFactor.
         */
        _standardizeItemHeight(itemElement) {
            // Remove any existing inline height style
            itemElement.style.height = '';

            const currentHeight = itemElement.offsetHeight; // Use offsetHeight for actual rendered height
            const factor = this.configuration.heightAlignmentFactor;
            const remainder = currentHeight % factor;

            if (remainder > 0) {
                itemElement.style.height = (currentHeight + factor - remainder) + 'px';
            }
        }

        /*
         * Iterates through all content items and rescales their heights.
         */
        _rescaleAllItems() {
            this.contentItems.forEach(itemElement => {
                this._standardizeItemHeight(itemElement);
            });
        }
    }

    // Expose the layout engine as a global function for initialization
    // This serves as a lightweight alternative to a jQuery plugin wrapper.
    root.createDynamicGrid = function (targetElement, config) {
        if (!(targetElement instanceof HTMLElement)) {
            console.error('DynamicGrid: Provided target element is not a valid DOM element.');
            return;
        }
        // Prevent multiple instantiations on the same element by storing a reference
        if (!targetElement.dataset.layoutEngineInstance) {
            const instance = new LayoutEngine(targetElement, config);
            targetElement.dataset.layoutEngineInstance = 'initialized'; // Mark as initialized
            return instance;
        } else {
            console.warn('DynamicGrid: Layout engine already initialized on this element.');
            return targetElement.dataset.layoutEngineInstance; // Return existing instance if needed, or null
        }
    };

}(window));