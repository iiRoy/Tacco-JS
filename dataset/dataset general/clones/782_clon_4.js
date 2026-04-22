(function (globalDiagnostic, domManipulator) {
    'use strict';

    // Global settings for the diagnostic tools
    globalDiagnostic._preferences = {
        verticalShiftAmount: -8, // Renamed from baselineAdjust

        retrieveElementPxSize: function (targetElementRef) { // Renamed from fontSize
            // Use vanilla JS getComputedStyle instead of jQuery .css()
            const computedStyle = window.getComputedStyle(targetElementRef);
            return parseInt(computedStyle.fontSize.replace('px', ''), 10);
        },

        calculateDynamicLineHeight: function () { // Renamed from lineHeight
            const currentBodyLineHeight = window.getComputedStyle(document.body).lineHeight;
            if (currentBodyLineHeight.includes('px')) { // Check for 'px' unit
                return parseFloat(currentBodyLineHeight.replace('px', ''));
            } else { // Assume unitless or 'normal', multiply by html font-size
                return parseFloat(currentBodyLineHeight) * globalDiagnostic._preferences.retrieveElementPxSize(document.documentElement);
            }
        }
    };

    // Core function to set up the control panel
    globalDiagnostic.establishControlPanel = function () { // Renamed from buildPanel
        const panelHtmlString = // Using template literals for multi-line HTML
            `<div id="diag-control-overlay">
                <button class="diag-toggle-btn">Diagnostics</button>
                <ul>
                    <li><button data-feature-key="regionHighlight">Highlight sections</button></li>
                    <li><button data-feature-key="verticalRhythm">Display baseline</button></li>
                    <li><button data-feature-key="gridOverlay">Show grid lines</button></li>
                    <li><button data-feature-key="viewportInfo">Viewport dimensions</button></li>
                    <li>
                        <button data-feature-key="breakpointSummary">Breakpoint overview</button>
                        <button class="panel-position-btn" data-placement-index="1">Adjust position</button>
                    </li>
                    <li><button data-feature-key="mediaQueryVisuals">Visualize breakpoints</button></li>
                </ul>
            </div>`;

        // Append to body using vanilla DOM
        document.body.insertAdjacentHTML('beforeend', panelHtmlString);

        const panelElementRef = document.getElementById('diag-control-overlay');

        globalDiagnostic.overlayInteractions.configureFeatureToggles(panelElementRef);
        globalDiagnostic.overlayInteractions.managePanelDisplay(panelElementRef);
    };

    // Object to handle UI interactions for the control panel
    globalDiagnostic.overlayInteractions = { // Renamed from buildButtons
        configureFeatureToggles: function (panelRef) { // Renamed from options
            const featureToggleButtons = panelRef.querySelectorAll('[data-feature-key]');
            const registeredFeatureKeys = [];

            // Populate registeredFeatureKeys array
            featureToggleButtons.forEach(btn => {
                registeredFeatureKeys.push(btn.getAttribute('data-feature-key'));
            });

            // Event listener for feature toggle buttons
            featureToggleButtons.forEach(btn => {
                btn.addEventListener('click', function () {
                    const currentButton = this;
                    const selectedFeature = currentButton.getAttribute('data-feature-key');

                    if (currentButton.classList.contains('active-state')) {
                        globalDiagnostic._toolModules[selectedFeature].deactivate();
                        currentButton.classList.remove('active-state');
                        globalDiagnostic._persistence.remove('diag-' + selectedFeature);
                    } else {
                        globalDiagnostic._toolModules[selectedFeature].activate();
                        currentButton.classList.add('active-state');
                        globalDiagnostic._persistence.set('diag-' + selectedFeature, 'true');
                    }
                });
            });

            // Initialize state from local storage
            registeredFeatureKeys.forEach(key => {
                if (globalDiagnostic._persistence.get('diag-' + key) === 'true') {
                    // Find the button and trigger a click to activate it
                    const matchingButton = panelRef.querySelector(`[data-feature-key="${key}"]`);
                    if (matchingButton) {
                        matchingButton.click(); // Simulate click to trigger activation logic
                    }
                }
            });
        },

        managePanelDisplay: function (panelRef) { // Renamed from view
            const mainToggleButton = panelRef.querySelector('.diag-toggle-btn');

            const hidePanel = () => {
                panelRef.classList.remove('is-visible');
                document.removeEventListener('click', documentClickHandler);
            };

            const showPanel = () => {
                panelRef.classList.add('is-visible');
                // Attach a document click listener to close if clicking outside
                document.addEventListener('click', documentClickHandler);
            };

            const documentClickHandler = (event) => {
                // Check if the click target is outside the panel
                if (!panelRef.contains(event.target) && event.target !== mainToggleButton) {
                    hidePanel();
                }
            };

            mainToggleButton.addEventListener('click', (event) => {
                event.preventDefault(); // Prevent default button behavior if any
                if (panelRef.classList.contains('is-visible')) {
                    hidePanel();
                } else {
                    showPanel();
                }
            });
        }
    };

    // Helper for localStorage interaction
    globalDiagnostic._persistence = {
        get: (key) => window.localStorage ? window.localStorage.getItem(key) : null,
        set: (key, value) => { if (window.localStorage) window.localStorage.setItem(key, value); },
        remove: (key) => { if (window.localStorage) window.localStorage.removeItem(key); }
    };

    // Object containing individual diagnostic tool modules
    globalDiagnostic._toolModules = { // Renamed from debug.module
        verticalRhythm: { // Renamed from baseline
            deactivate: function () { // Renamed from off
                const existingBaseline = document.getElementById('diag-baseline-display');
                if (existingBaseline) {
                    existingBaseline.remove();
                }
            },

            activate: function () { // Renamed from on
                const currentSettings = globalDiagnostic._preferences;
                const calculatedLineHeight = currentSettings.calculateDynamicLineHeight();
                const fontSizeForBody = currentSettings.retrieveElementPxSize(document.body);

                const lineUnitHeight = (calculatedLineHeight - 1) / fontSizeForBody;
                const totalLinesCount = Math.ceil(document.documentElement.scrollHeight / calculatedLineHeight); // Use scrollHeight for full document height

                let lineElements = [];
                for (let j = 0; j < totalLinesCount; j++) { // Using a traditional loop for divergence
                    lineElements.push(`<li style="height:${lineUnitHeight}em;"></li>`);
                }

                const baselineContainerHtml = `<ol id="diag-baseline-display" style="top:${currentSettings.verticalShiftAmount}px;">${lineElements.join('')}</ol>`;
                document.body.insertAdjacentHTML('beforeend', baselineContainerHtml);
            }
        },

        regionHighlight: { // Renamed from boxes
            deactivate: function () { // Renamed from off
                document.documentElement.classList.remove('diag-active');

                document.querySelectorAll('.diag-index-label').forEach(label => label.remove());

                document.querySelectorAll('.diag-highlight-wrapper').forEach(wrapper => {
                    // Manually unwrap elements
                    const parent = wrapper.parentNode;
                    while (wrapper.firstChild) {
                        parent.insertBefore(wrapper.firstChild, wrapper);
                    }
                    wrapper.remove();
                });
            },

            activate: function () { // Renamed from on
                document.documentElement.classList.add('diag-active');

                // Select regions, excluding those within diag-layout-grid or nested
                const targetRegions = document.querySelectorAll('.region:not(#diag-layout-grid .region, .region .region)');

                targetRegions.forEach((regionElement, index) => {
                    // Custom wrap function
                    const wrapperDiv = document.createElement('div');
                    wrapperDiv.className = 'diag-highlight-wrapper';

                    // Move children from regionElement to wrapperDiv
                    while (regionElement.firstChild) {
                        wrapperDiv.appendChild(regionElement.firstChild);
                    }
                    // Append wrapperDiv to regionElement
                    regionElement.appendChild(wrapperDiv);

                    // Append index label
                    const indexLabel = document.createElement('div');
                    indexLabel.className = 'diag-index-label';
                    indexLabel.textContent = (index + 1).toString();
                    wrapperDiv.appendChild(indexLabel);
                });
            }
        },

        extractCssNumericValue: function (queryText, propertyName) { // Renamed from calculatePixels
            let foundValue;

            // Using includes and regex for parsing
            const propertyPattern = new RegExp(`\\b${propertyName}:\\s*([\\d.]+)(em|px)?\\)`, 'i');
            const match = queryText.match(propertyPattern);

            if (match) {
                foundValue = parseFloat(match[1]);
                const unit = match[2];

                if (unit === 'em') {
                    foundValue = Math.round(foundValue * globalDiagnostic._preferences.retrieveElementPxSize(document.documentElement) * 100000) / 100000;
                }
                // 'px' unit already parsed as float, no further conversion needed
            }

            return foundValue !== undefined ? foundValue : false;
        },

        gridOverlay: { // Renamed from grid
            deactivate: function () { // Renamed from off
                const existingGrid = document.getElementById('diag-layout-grid');
                if (existingGrid) {
                    existingGrid.remove();
                }
            },

            activate: function () { // Renamed from on
                let gridStructure = `<div id="diag-layout-grid"><div class="grid-columns">`;

                // Generate 17 column divs
                for (let k = 0; k <= 16; k++) {
                    gridStructure += '<div class="grid-column-segment"></div>'; // Renamed from region
                }

                gridStructure += '</div></div>';
                document.body.insertAdjacentHTML('beforeend', gridStructure);
            }
        },

        viewportInfo: { // Renamed from viewportSize
            _refreshDisplayHandler: null, // Store reference to event listener
            deactivate: function () { // Renamed from off
                const existingInfoDisplay = document.getElementById('diag-viewport-info');
                if (existingInfoDisplay) {
                    existingInfoDisplay.remove();
                }
                if (this._refreshDisplayHandler) {
                    window.removeEventListener('resize', this._refreshDisplayHandler);
                    this._refreshDisplayHandler = null;
                }
            },

            activate: function () { // Renamed from on
                const infoDisplayHtml = '<div id="diag-viewport-info"></div>';
                document.body.insertAdjacentHTML('beforeend', infoDisplayHtml);

                const infoDisplayElement = document.getElementById('diag-viewport-info');

                this._refreshDisplayHandler = () => { // Renamed from updateSize
                    const currentWidth = globalDiagnostic._utils.getCurrentViewportWidth();
                    const currentHeight = globalDiagnostic._utils.getCurrentViewportHeight();
                    const pixelRatio = window.devicePixelRatio ? (Math.round(window.devicePixelRatio * 100000) / 100000) : '?';

                    infoDisplayElement.textContent =
                        `${currentWidth} \u00D7 ${currentHeight} / ${pixelRatio}`; // \u00D7 is '×'
                };

                this._refreshDisplayHandler(); // Initial display
                window.addEventListener('resize', this._refreshDisplayHandler);
            }
        },

        breakpointSummary: { // Renamed from viewportSummary
            _updateMediaQueryStatesHandler: null,
            deactivate: function () { // Renamed from off
                const existingSummary = document.getElementById('diag-breakpoint-summary');
                if (existingSummary) {
                    existingSummary.remove();
                }
                if (this._updateMediaQueryStatesHandler) {
                    window.removeEventListener('resize', this._updateMediaQueryStatesHandler);
                    this._updateMediaQueryStatesHandler = null;
                }
            },

            activate: function () { // Renamed from on
                const summaryPanelHtml = '<div id="diag-breakpoint-summary"></div>';
                document.body.insertAdjacentHTML('beforeend', summaryPanelHtml);

                const summaryElement = document.getElementById('diag-breakpoint-summary');
                let tableContent = '';
                const layoutBreakpoints = window.FrontEndFramework.mediaQueryData; // Renamed external dependency

                this._updateMediaQueryStatesHandler = () => { // Renamed from updateSize
                    Object.entries(layoutBreakpoints).forEach(([key, value]) => {
                        const isMatching = window.FrontEndFramework.isViewportMatching(key); // Renamed external dependency
                        const rowElement = summaryElement.querySelector(`.mq-${key}`); // Use new class name
                        if (rowElement) {
                            rowElement.classList.toggle('true', isMatching);
                            rowElement.classList.toggle('false', !isMatching);
                        }
                    });
                };

                tableContent += '<table>' +
                    '<tr class="no-active-queries true">' + // Renamed class
                        '<th>none</th>' +
                        '<td colspan="3">no currently active media queries</td>' +
                    '</tr>';

                Object.entries(layoutBreakpoints).forEach(([indexKey, queryData]) => {
                    const queryDefinition = queryData.query;
                    const minWidthPx = globalDiagnostic._toolModules.extractCssNumericValue(queryDefinition, 'min-width');
                    const minHeightPx = globalDiagnostic._toolModules.extractCssNumericValue(queryDefinition, 'min-height');
                    // Combine into a single 'pixels' column as per original's display logic
                    const displayedPixels = (minWidthPx !== false ? minWidthPx + 'px' : '') || (minHeightPx !== false ? minHeightPx + 'px' : '');

                    tableContent += `<tr class="mq-${indexKey}">` + // Renamed class for rows
                            `<th>${indexKey}</th>` +
                            `<td>${queryDefinition}</td>` +
                            `<td>${displayedPixels}</td>` +
                        '</tr>';
                });

                tableContent += '</table>';
                summaryElement.innerHTML = tableContent; // Set innerHTML once

                this._updateMediaQueryStatesHandler();
                window.addEventListener('resize', this._updateMediaQueryStatesHandler);

                globalDiagnostic._toolModules.breakpointSummary.panelPlacement.initiate();
                globalDiagnostic._toolModules.breakpointSummary.panelMinimization.initiate();
            },

            panelMinimization: { // Renamed from minimize
                _toggleHandlerRef: null,
                _setupToggleHandler: function () { // Renamed from click
                    const summaryPanel = document.getElementById('diag-breakpoint-summary');
                    if (summaryPanel) {
                        this._toggleHandlerRef = (event) => {
                            event.preventDefault();
                            globalDiagnostic._toolModules.breakpointSummary.panelMinimization[summaryPanel.classList.contains('is-minimized') ? 'unfold' : 'fold']();
                        };
                        summaryPanel.addEventListener('click', this._toggleHandlerRef);
                    }
                },

                initiate: function () { // Renamed from init
                    if (window.localStorage && globalDiagnostic._persistence.get('diag-minimized-state')) {
                        globalDiagnostic._toolModules.breakpointSummary.panelMinimization[globalDiagnostic._persistence.get('diag-minimized-state')]();
                    }
                    this._setupToggleHandler();
                },

                unfold: function () { // Renamed from off
                    const summaryPanel = document.getElementById('diag-breakpoint-summary');
                    if (summaryPanel) {
                        summaryPanel.classList.remove('is-minimized');
                        globalDiagnostic._persistence.set('diag-minimized-state', 'unfold');
                    }
                },

                fold: function () { // Renamed from on
                    const summaryPanel = document.getElementById('diag-breakpoint-summary');
                    if (summaryPanel) {
                        summaryPanel.classList.add('is-minimized');
                        globalDiagnostic._persistence.set('diag-minimized-state', 'fold');
                    }
                },
            },

            panelPlacement: { // Renamed from position
                _positionClickHandlerRef: null,
                _setupChangeHandler: function () { // Renamed from click
                    const positionButton = document.getElementById('diag-control-overlay').querySelector('.panel-position-btn');
                    if (positionButton) {
                        this._positionClickHandlerRef = function () {
                            const currentPosAttr = this.getAttribute('data-placement-index');
                            let nextPosIndex = parseInt(currentPosAttr, 10) + 1;
                            if (nextPosIndex > 4) nextPosIndex = 1;

                            globalDiagnostic._toolModules.breakpointSummary.panelPlacement.reposition(nextPosIndex);
                            globalDiagnostic._persistence.set('diag-panel-position', nextPosIndex);
                        };
                        // Ensure only one handler is attached
                        positionButton.removeEventListener('click', this._positionClickHandlerRef);
                        positionButton.addEventListener('click', this._positionClickHandlerRef);
                    }
                },

                initiate: function () { // Renamed from init
                    if (window.localStorage && globalDiagnostic._persistence.get('diag-panel-position')) {
                        globalDiagnostic._toolModules.breakpointSummary.panelPlacement.reposition(globalDiagnostic._persistence.get('diag-panel-position'));
                    }
                    this._setupChangeHandler();
                },

                reposition: function (idx) { // Renamed from move
                    const summaryElement = document.getElementById('diag-breakpoint-summary');
                    const controlPanelButton = document.getElementById('diag-control-overlay').querySelector('.panel-position-btn');

                    if (summaryElement) {
                        const wasMinimized = summaryElement.classList.contains('is-minimized');
                        summaryElement.className = ''; // Clear all classes
                        summaryElement.classList.add(`position-${idx}`);
                        if (wasMinimized) {
                            summaryElement.classList.add('is-minimized'); // Re-add if it was minimized
                        }
                    }
                    if (controlPanelButton) {
                        controlPanelButton.setAttribute('data-placement-index', idx);
                    }
                }
            }
        },

        mediaQueryVisuals: { // Renamed from visualize
            deactivate: function () { // Renamed from off
                document.querySelectorAll('.diag-breakpoint-visualizer').forEach(el => el.remove());
            },

            activate: function () { // Renamed from on
                let widthMarkers = '';
                let heightMarkers = '';
                const layoutBreakpoints = window.FrontEndFramework.mediaQueryData; // External dependency

                Object.entries(layoutBreakpoints).forEach(([indexKey, queryData]) => {
                    const queryDefinition = queryData.query;

                    const widthValue = globalDiagnostic._toolModules.extractCssNumericValue(queryDefinition, 'min-width');
                    if (widthValue !== false) {
                        widthMarkers += `<li style="width: ${widthValue}px;"><span>${indexKey}</span></li>`;
                    }

                    const heightValue = globalDiagnostic._toolModules.extractCssNumericValue(queryDefinition, 'min-height');
                    if (heightValue !== false) {
                        heightMarkers += `<li style="height: ${heightValue}px;"><span>${indexKey}</span></li>`;
                    }
                });

                if (widthMarkers) {
                    document.body.insertAdjacentHTML('beforeend', `<ol class="diag-breakpoint-visualizer width-visualizer">${widthMarkers}</ol>`);
                }

                if (heightMarkers) {
                    document.body.insertAdjacentHTML('beforeend', `<ol class="diag-breakpoint-visualizer height-visualizer">${heightMarkers}</ol>`);
                }
            }
        }
    };

    // Utility functions
    globalDiagnostic._utils = {
        getCurrentViewportHeight: function () { // Renamed from viewportHeight
            return window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight || 0;
        },

        getCurrentViewportWidth: function () { // Renamed from viewportWidth
            return window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth || 0;
        }
    };

    // Initialize the diagnostic panel when the DOM is fully loaded
    document.addEventListener('DOMContentLoaded', globalDiagnostic.establishControlPanel);

}(window.DiagnosticHub = window.DiagnosticHub || {}, null));