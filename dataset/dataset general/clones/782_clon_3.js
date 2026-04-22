(function (frontEndKit, jq) {
    'use strict'; // Enforce strict mode for cleaner code

    /**
     * @fileoverview Front-End Development Toolkit for browser inspection.
     * This module provides various utilities for debugging and visualizing
     * layout, responsive breakpoints, and other UI aspects directly in the browser.
     * Version: 1.1.0
     */

    // Internal utility functions and constants
    const _toolkit_prefix = 'fe-toolkit-'; // Prefix for local storage keys and some CSS classes

    /**
     * Manages persistent state in localStorage.
     * @type {object}
     */
    const _storage_manager = {
        /**
         * Retrieves an item from localStorage with the toolkit prefix.
         * @param {string} key - The key to retrieve.
         * @returns {string|null} The stored value or null if not found.
         */
        get: (key) => {
            if (window.localStorage) {
                return localStorage.getItem(_toolkit_prefix + key);
            }
            return null;
        },

        /**
         * Stores an item in localStorage with the toolkit prefix.
         * @param {string} key - The key to store.
         * @param {string} value - The value to store.
         */
        set: (key, value) => {
            if (window.localStorage) {
                localStorage.setItem(_toolkit_prefix + key, value);
            }
        },

        /**
         * Removes an item from localStorage with the toolkit prefix.
         * @param {string} key - The key to remove.
         */
        remove: (key) => {
            if (window.localStorage) {
                localStorage.removeItem(_toolkit_prefix + key);
            }
        },

        /**
         * Checks if a key exists and its value is 'true'.
         * @param {string} key - The key to check.
         * @returns {boolean} True if the key exists and its value is 'true', false otherwise.
         */
        isEnabled: (key) => _storage_manager.get(key) === 'true'
    };

    /**
     * Throttles a function call to limit its execution rate.
     * @param {function} func - The function to throttle.
     * @param {number} limit - The time in milliseconds to wait before allowing another execution.
     * @returns {function} The throttled function.
     */
    const _throttle = (func, limit) => {
        let inThrottle;
        let lastResult;
        return function () {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
                lastResult = func.apply(context, args);
            }
            return lastResult;
        };
    };

    /**
     * Core configuration settings for the toolkit.
     * @type {object}
     */
    frontEndKit.settings = {
        layoutOffsetPx: -8, // Vertical adjustment for baseline grid

        /**
         * Calculates the computed font size of an element in pixels.
         * @param {string|HTMLElement|jQuery} targetElement - The element to inspect.
         * @returns {number} The font size in pixels.
         */
        getComputedFontSize: (targetElement) => {
            const sizeString = jq(targetElement).css('font-size');
            return Number.parseInt(sizeString.replace('px', ''), 10);
        },

        /**
         * Calculates the effective line height in pixels.
         * @returns {number} The line height in pixels.
         */
        calculateLineHeightPx: () => {
            const rawLineHeight = jq('body').css('line-height');
            if (!rawLineHeight || rawLineHeight === '0') {
                return frontEndKit.settings.getComputedFontSize('html') * 1.2; // Default if undefined
            }
            if (rawLineHeight.includes('px')) {
                return Number.parseInt(rawLineHeight.replace('px', ''), 10);
            }
            // If unitless, multiply by the font size of the root element (html)
            return parseFloat(rawLineHeight) * frontEndKit.settings.getComputedFontSize('html');
        }
    };

    /**
     * Initializes the main diagnostic panel in the DOM.
     */
    frontEndKit.initializeUserInterface = () => {
        const panelId = 'fe-toolkit-panel';
        if (jq(`#${panelId}`).length) {
            console.warn('Front-End Toolkit: Panel already exists. Skipping initialization.');
            return; // Prevent duplicate panel creation
        }

        const panelHtml = `
            <div id="${panelId}" aria-label="Front-End Toolkit Panel">
                <button class="fe-toolkit-cog" aria-expanded="false" aria-controls="${panelId}-menu">
                    <span class="sr-only">Toggle Toolkit</span>
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                        <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                    </svg>
                </button>
                <ul id="${panelId}-menu" role="menu" aria-hidden="true">
                    <li><button data-tool-option="regionHighlighting" role="menuitem">Highlight Regions</button></li>
                    <li><button data-tool-option="rhythmGuidance" role="menuitem">Show Baseline</button></li>
                    <li><button data-tool-option="layoutGrid" role="menuitem">Show Grid</button></li>
                    <li><button data-tool-option="displayViewportDimensions" role="menuitem">Viewport Size</button></li>
                    <li>
                        <button data-tool-option="responsiveSummary" role="menuitem">Viewport Summary</button>
                        <button class="fe-toolkit-position-toggle" data-position-idx="1" role="menuitem">Position</button>
                    </li>
                    <li><button data-tool-option="breakpointVisualizer" role="menuitem">Visualize Breakpoints</button></li>
                </ul>
            </div>
        `;
        jq('body').append(panelHtml);

        const $mainPanelElement = jq(`#${panelId}`);
        frontEndKit.controlHandlers.setupOptionToggles($mainPanelElement);
        frontEndKit.controlHandlers.handlePanelVisibility($mainPanelElement);
    };

    /**
     * Manages user interactions with the toolkit panel buttons.
     * @type {object}
     */
    frontEndKit.controlHandlers = {
        /**
         * Sets up click handlers for feature toggle buttons.
         * @param {jQuery} $panelContainer - The main toolkit panel element.
         */
        setupOptionToggles: ($panelContainer) => {
            const $toggleControls = $panelContainer.find('[data-tool-option]');
            const activeFeatureKeys = Array.from($toggleControls).map(el => jq(el).attr('data-tool-option'));

            // Event listener for option buttons
            $toggleControls.on('click', function () {
                const $clickedButton = jq(this);
                const featureKey = $clickedButton.attr('data-tool-option');

                if (!frontEndKit[featureKey]) {
                    console.warn(`Front-End Toolkit: Feature "${featureKey}" not found.`);
                    return;
                }

                if ($clickedButton.hasClass('is-active')) {
                    frontEndKit[featureKey].disable();
                    $clickedButton.removeClass('is-active').attr('aria-pressed', 'false');
                    _storage_manager.remove(featureKey);
                } else {
                    frontEndKit[featureKey].enable();
                    $clickedButton.addClass('is-active').attr('aria-pressed', 'true');
                    _storage_manager.set(featureKey, 'true');
                }
            });

            // Initialize button states from local storage
            activeFeatureKeys.forEach(key => {
                if (_storage_manager.isEnabled(key)) {
                    $toggleControls.filter(`[data-tool-option="${key}"]`).trigger('click');
                }
            });
        },

        /**
         * Handles the opening and closing of the main toolkit panel.
         * @param {jQuery} $panelContainer - The main toolkit panel element.
         */
        handlePanelVisibility: ($panelContainer) => {
            const $toggleButton = $panelContainer.children('.fe-toolkit-cog');
            const $panelMenu = $panelContainer.children('ul');

            /**
             * Hides the toolkit panel.
             */
            const hideOverlayPanel = () => {
                $panelContainer.removeClass('is-open');
                $panelMenu.attr('aria-hidden', 'true');
                $toggleButton.attr('aria-expanded', 'false');
                jq(document).off('click.panelDismiss'); // Remove delegated event
            };

            /**
             * Displays the toolkit panel.
             */
            const displayOverlayPanel = () => {
                $panelContainer.addClass('is-open');
                $panelMenu.attr('aria-hidden', 'false');
                $toggleButton.attr('aria-expanded', 'true');

                // Delegate click event to document to close panel when clicking outside
                jq(document).on('click.panelDismiss', (evt) => {
                    if (!jq(evt.target).closest($panelContainer).length) {
                        hideOverlayPanel();
                    }
                });
            };

            // Toggle panel visibility on button click
            $toggleButton.on('click', (e) => {
                e.preventDefault(); // Prevent default button behavior
                if ($panelContainer.hasClass('is-open')) {
                    hideOverlayPanel();
                } else {
                    displayOverlayPanel();
                }
            });
        }
    };

    /**
     * Module for visualizing the typographic baseline grid.
     * @type {object}
     */
    frontEndKit.rhythmGuidance = {
        /**
         * Disables the baseline visual guide.
         */
        disable: () => {
            jq('#fe-toolkit-baseline-grid').remove();
        },

        /**
         * Enables and displays the baseline visual guide.
         */
        enable: () => {
            if (jq('#fe-toolkit-baseline-grid').length) {
                return; // Already active
            }

            const currentSettings = frontEndKit.settings;
            const rhythmUnitHeightEm = (currentSettings.calculateLineHeightPx() - 1) / currentSettings.getComputedFontSize('body');
            const numRhythmLines = Math.ceil(jq(document).height() / currentSettings.calculateLineHeightPx());

            const lineElementsHtml = Array.from({ length: numRhythmLines + 1 }, (_, i) =>
                `<li style="height:${rhythmUnitHeightEm}em;" aria-hidden="true"></li>`
            ).join('');

            jq('body').append(`
                <ol id="fe-toolkit-baseline-grid" style="top:${currentSettings.layoutOffsetPx}px;" role="presentation">
                    ${lineElementsHtml}
                </ol>
            `);
        }
    };

    /**
     * Module for highlighting structural regions on the page.
     * @type {object}
     */
    frontEndKit.regionHighlighting = {
        /**
         * Removes all region highlights.
         */
        disable: () => {
            jq('html').removeClass('show-regions');
            jq('.region-index-label').remove(); // Remove index numbers

            jq('.highlight-wrapper').each(function () {
                const $highlightWrapper = jq(this);
                $highlightWrapper.contents().appendTo($highlightWrapper.parent()); // Unwrap contents
                $highlightWrapper.remove();
            });
        },

        /**
         * Applies highlights to identified regions.
         */
        enable: () => {
            if (jq('html').hasClass('show-regions')) {
                return; // Already active
            }
            jq('html').addClass('show-regions');

            // Select elements with class 'region' that are not part of the grid or nested regions
            jq('.region')
                .not('#fe-toolkit-grid .region, .region .region')
                .each((idx, el) => {
                    const $regionElement = jq(el);
                    $regionElement
                        .wrapInner('<div class="highlight-wrapper"></div>') // Wrap content
                        .find('.highlight-wrapper')
                        .append(`<div class="region-index-label" aria-hidden="true">${idx + 1}</div>`); // Add index label
                });
        }
    };

    /**
     * Converts a CSS unit string (e.g., '10em', '20px') from a media query into pixel values.
     * @param {string} cssValueString - The CSS value string from a media query (e.g., "min-width: 10em)").
     * @param {string} cssPropertyKey - The CSS property key to look for (e.g., "min-width", "min-height").
     * @returns {number|boolean} The calculated pixel value, or false if not found/invalid.
     */
    frontEndKit.convertCssUnitToPx = (cssValueString, cssPropertyKey) => {
        const regex = new RegExp(`${cssPropertyKey}:\\s*(\\d+(\\.\\d+)?)(em|px)\\)`);
        const match = cssValueString.match(regex);

        if (!match) {
            return false;
        }

        let value = parseFloat(match[1]);
        const unit = match[3];

        if (unit === 'em') {
            // Convert em to px based on the root html font size
            value = Math.round(value * frontEndKit.settings.getComputedFontSize('html') * 100) / 100;
        }
        // If unit is 'px', value is already in pixels

        return value;
    };

    /**
     * Module for displaying a visual layout grid.
     * @type {object}
     */
    frontEndKit.layoutGrid = {
        /**
         * Hides the layout grid overlay.
         */
        disable: () => {
            jq('#fe-toolkit-grid').remove();
        },

        /**
         * Shows the layout grid overlay.
         */
        enable: () => {
            if (jq('#fe-toolkit-grid').length) {
                return; // Already active
            }
            const gridColumnHtml = Array.from({ length: 16 }, () => '<div class="grid-column-segment"></div>').join('');
            const gridOverlayHtml = `
                <div id="fe-toolkit-grid" role="presentation">
                    <div class="grid-field-segments">
                        ${gridColumnHtml}
                    </div>
                </div>
            `;
            jq('body').append(gridOverlayHtml);
        }
    };

    /**
     * Module for displaying current viewport dimensions.
     * @type {object}
     */
    frontEndKit.displayViewportDimensions = {
        _dimensionDisplayElement: null, // Cached jQuery object for display element

        /**
         * Hides the viewport dimension display.
         */
        disable: () => {
            if (frontEndKit.displayViewportDimensions._dimensionDisplayElement) {
                frontEndKit.displayViewportDimensions._dimensionDisplayElement.remove();
                frontEndKit.displayViewportDimensions._dimensionDisplayElement = null;
                jq(window).off('resize.dimensionDisplay'); // Remove resize listener
            }
        },

        /**
         * Shows the viewport dimension display.
         */
        enable: () => {
            if (jq('#fe-toolkit-viewport-size').length) {
                return; // Already active
            }
            jq('body').append('<div id="fe-toolkit-viewport-size" aria-live="polite"></div>');
            frontEndKit.displayViewportDimensions._dimensionDisplayElement = jq('#fe-toolkit-viewport-size');

            /**
             * Refreshes the displayed viewport dimensions.
             */
            const refreshDimensions = () => {
                const currentWidth = frontEndKit.getCurrentViewportWidth();
                const currentHeight = frontEndKit.getCurrentViewportHeight();
                const pixelRatio = window.devicePixelRatio ?
                    (Math.round(window.devicePixelRatio * 1000) / 1000).toFixed(2) : '?'; // Format to 2 decimal places

                frontEndKit.displayViewportDimensions._dimensionDisplayElement.html(
                    `${currentWidth} &times; ${currentHeight} / DPR: ${pixelRatio}`
                );
            };

            refreshDimensions();
            // Throttle resize event for performance
            jq(window).on('resize.dimensionDisplay', _throttle(refreshDimensions, 150));
        }
    };

    /**
     * Module for summarizing active responsive media queries.
     * @type {object}
     */
    frontEndKit.responsiveSummary = {
        _summaryContainer: null, // Cached jQuery object for summary container

        /**
         * Deactivates the viewport summary display.
         */
        disable: () => {
            if (frontEndKit.responsiveSummary._summaryContainer) {
                frontEndKit.responsiveSummary._summaryContainer.remove();
                frontEndKit.responsiveSummary._summaryContainer = null;
                jq(window).off('resize.summaryUpdate'); // Remove resize listener
            }
        },

        /**
         * Activates and displays the viewport summary.
         */
        enable: () => {
            if (jq('#fe-toolkit-viewport-summary').length) {
                return; // Already active
            }
            jq('body').append('<div id="fe-toolkit-viewport-summary" aria-live="polite"></div>');
            frontEndKit.responsiveSummary._summaryContainer = jq('#fe-toolkit-viewport-summary');

            // Ensure pageInsight (formerly frwd) and its mediaQueries are available
            if (!window.pageInsight || !window.pageInsight.mediaQueries || !window.pageInsight.matchViewport) {
                console.error('Front-End Toolkit: window.pageInsight.mediaQueries or matchViewport is not defined. Cannot display responsive summary.');
                frontEndKit.responsiveSummary._summaryContainer.html('<p>Error: Media query data not available.</p>');
                return;
            }

            const mqDefinitions = window.pageInsight.mediaQueries;
            let tableHtmlContent = `
                <table role="grid">
                    <thead>
                        <tr class="mq-none is-active">
                            <th scope="col">Name</th>
                            <th scope="col">Query</th>
                            <th scope="col">Min-Width/Height</th>
                            <th scope="col">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr class="mq-none">
                            <td colspan="4">No specific media queries active</td>
                        </tr>
            `;

            // Dynamically generate table rows for each media query
            Object.entries(mqDefinitions).forEach(([mqName, mqValue]) => {
                const query = mqValue.query;
                const minWidthPx = frontEndKit.convertCssUnitToPx(query, 'min-width');
                const minHeightPx = frontEndKit.convertCssUnitToPx(query, 'min-height');
                const pixelValue = minWidthPx || minHeightPx;

                tableHtmlContent += `
                    <tr data-mq-name="${mqName}">
                        <th scope="row">${mqName}</th>
                        <td><code>${query}</code></td>
                        <td>${pixelValue ? pixelValue + 'px' : 'N/A'}</td>
                        <td class="mq-status"></td>
                    </tr>
                `;
            });

            tableHtmlContent += '</tbody></table>';

            frontEndKit.responsiveSummary._summaryContainer.html(tableHtmlContent);

            /**
             * Updates the active status of media queries in the summary table.
             */
            const updateActiveQueries = () => {
                const $rows = frontEndKit.responsiveSummary._summaryContainer.find('tr[data-mq-name]');
                let anyMqActive = false;

                $rows.each((_, row) => {
                    const $row = jq(row);
                    const mqName = $row.data('mq-name');
                    const isActive = window.pageInsight.matchViewport(mqName);

                    $row.toggleClass('is-active', isActive);
                    $row.find('.mq-status').text(isActive ? 'Active' : 'Inactive');
                    if (isActive) {
                        anyMqActive = true;
                    }
                });

                // Update "No specific media queries active" row
                frontEndKit.responsiveSummary._summaryContainer.find('tr.mq-none')
                    .toggleClass('is-active', !anyMqActive)
                    .find('.mq-status').text(!anyMqActive ? 'Active' : '');
            };

            updateActiveQueries();
            jq(window).on('resize.summaryUpdate', _throttle(updateActiveQueries, 100)); // Throttled update

            frontEndKit.responsiveSummary.displayPositioning.initializeState();
            frontEndKit.responsiveSummary.collapsibleBehavior.initializeState();
        },

        /**
         * Handles the minimization/maximization behavior of the summary panel.
         * @type {object}
         */
        collapsibleBehavior: {
            _cachedSelector: null, // Cache the summary panel selector

            /**
             * Gets the cached summary panel element, or finds and caches it.
             * @returns {jQuery} The summary panel element.
             */
            _getPanel: function () {
                if (!this._cachedSelector) {
                    this._cachedSelector = jq('#fe-toolkit-viewport-summary');
                }
                return this._cachedSelector;
            },

            /**
             * Sets up click handlers for toggling minimization.
             */
            setupClickHandlers: function () {
                this._getPanel().off('click.minimize').on('click.minimize', (e) => {
                    // Only trigger if click is on the panel itself, not its children (e.g., table)
                    if (jq(e.target).is(this._getPanel())) {
                        this._getPanel().hasClass('is-collapsed') ? this.expand() : this.collapse();
                        return false; // Prevent further propagation
                    }
                });
            },

            /**
             * Initializes the minimization state based on local storage.
             */
            initializeState: function () {
                const storedState = _storage_manager.get('summary-collapsed');
                if (storedState === 'true') {
                    this.collapse();
                } else {
                    this.expand(); // Ensure it's expanded by default if not explicitly collapsed
                }
                this.setupClickHandlers();
            },

            /**
             * Collapses the viewport summary panel.
             */
            collapse: function () {
                this._getPanel().addClass('is-collapsed').attr('aria-expanded', 'false');
                _storage_manager.set('summary-collapsed', 'true');
            },

            /**
             * Expands the viewport summary panel.
             */
            expand: function () {
                this._getPanel().removeClass('is-collapsed').attr('aria-expanded', 'true');
                _storage_manager.set('summary-collapsed', 'false');
            }
        },

        /**
         * Manages the positioning of the summary panel.
         * @type {object}
         */
        displayPositioning: {
            _cachedPanel: null, // Cache the summary panel selector
            _cachedPositionToggle: null, // Cache the position toggle button

            /**
             * Gets the cached summary panel element, or finds and caches it.
             * @returns {jQuery} The summary panel element.
             */
            _getPanel: function () {
                if (!this._cachedPanel) {
                    this._cachedPanel = jq('#fe-toolkit-viewport-summary');
                }
                return this._cachedPanel;
            },

            /**
             * Gets the cached position toggle button, or finds and caches it.
             * @returns {jQuery} The position toggle button.
             */
            _getPositionToggle: function () {
                if (!this._cachedPositionToggle) {
                    this._cachedPositionToggle = jq('#fe-toolkit-panel').find('.fe-toolkit-position-toggle');
                }
                return this._cachedPositionToggle;
            },

            /**
             * Sets up click handlers for changing the panel's position.
             */
            setupClickHandlers: function () {
                this._getPositionToggle().off('click.position').on('click.position', () => {
                    let currentPosition = Number.parseInt(this._getPositionToggle().attr('data-position-idx'), 10);
                    let nextPosition = currentPosition + 1;

                    if (nextPosition > 4) { // Cycle through 4 positions
                        nextPosition = 1;
                    }

                    this.relocateSummary(nextPosition);
                    _storage_manager.set('summary-position', nextPosition.toString());
                });
            },

            /**
             * Initializes the panel position based on local storage.
             */
            initializeState: function () {
                const storedPosition = _storage_manager.get('summary-position');
                this.relocateSummary(storedPosition ? Number.parseInt(storedPosition, 10) : 1); // Default to position 1
                this.setupClickHandlers();
            },

            /**
             * Moves the summary panel to a specified position.
             * @param {number} positionIndex - The index of the desired position (1-4).
             */
            relocateSummary: function (positionIndex) {
                const $panel = this._getPanel();
                const wasCollapsed = $panel.hasClass('is-collapsed'); // Preserve collapse state

                $panel.removeClass('position1 position2 position3 position4').addClass(`position${positionIndex}`);
                if (wasCollapsed) {
                    $panel.addClass('is-collapsed'); // Reapply collapse class if it was present
                }
                this._getPositionToggle().attr('data-position-idx', positionIndex);
            }
        }
    };

    /**
     * Retrieves the current viewport height in pixels.
     * @returns {number} The viewport height.
     */
    frontEndKit.getCurrentViewportHeight = () => {
        return window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight || 0;
    };

    /**
     * Retrieves the current viewport width in pixels.
     * @returns {number} The viewport width.
     */
    frontEndKit.getCurrentViewportWidth = () => {
        return window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth || 0;
    };

    /**
     * Module for visualizing media query breakpoints.
     * @type {object}
     */
    frontEndKit.breakpointVisualizer = {
        /**
         * Hides the breakpoint visualization overlays.
         */
        disable: () => {
            jq('.fe-toolkit-breakpoint-visualizer').remove();
        },

        /**
         * Shows the breakpoint visualization overlays.
         */
        enable: () => {
            if (jq('.fe-toolkit-breakpoint-visualizer').length) {
                return; // Already active
            }

            // Ensure pageInsight (formerly frwd) and its mediaQueries are available
            if (!window.pageInsight || !window.pageInsight.mediaQueries) {
                console.error('Front-End Toolkit: window.pageInsight.mediaQueries is not defined. Cannot visualize breakpoints.');
                return;
            }

            const mqDefinitions = window.pageInsight.mediaQueries;
            let widthMarkersHtml = '';
            let heightMarkersHtml = '';

            Object.entries(mqDefinitions).forEach(([mqName, mqValue]) => {
                const mediaQueryString = mqValue.query;

                const minWidthPx = frontEndKit.convertCssUnitToPx(mediaQueryString, 'min-width');
                if (minWidthPx !== false) {
                    widthMarkersHtml += `<li style="width: ${minWidthPx}px;"><span>${mqName} (${minWidthPx}px)</span></li>`;
                }

                const minHeightPx = frontEndKit.convertCssUnitToPx(mediaQueryString, 'min-height');
                if (minHeightPx !== false) {
                    heightMarkersHtml += `<li style="height: ${minHeightPx}px;"><span>${mqName} (${minHeightPx}px)</span></li>`;
                }
            });

            if (widthMarkersHtml) {
                jq('body').append(`<ol class="fe-toolkit-breakpoint-visualizer fe-toolkit-visualizer-width">${widthMarkersHtml}</ol>`);
            }

            if (heightMarkersHtml) {
                jq('body').append(`<ol class="fe-toolkit-breakpoint-visualizer fe-toolkit-visualizer-height">${heightMarkersHtml}</ol>`);
            }
        }
    };

    // Initialize the UI panel when the DOM is ready
    jq(() => {
        frontEndKit.initializeUserInterface();
    });

}(window.pageInsight = window.pageInsight || {}, jQuery)); // Use `pageInsight` as the global namespace, alias jQuery to `jq`