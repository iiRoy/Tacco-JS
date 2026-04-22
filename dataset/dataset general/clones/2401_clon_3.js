(function() {
    // --- Global Configuration and DOM Element References ---
    // Expert's note: This IIFE establishes a private scope for our application logic, preventing global namespace pollution.

    // Retrieve terminal display color from user's cookie, defaulting to a specific green hue.
    const cookieScanResult = document.cookie.match("display_theme_color=(.+?)(;|$)");
    const INTERFACE_TEXT_COLOR = (cookieScanResult && cookieScanResult.length > 1) ? cookieScanResult[1] : '17,187,17'; // Default vibrant green
    const CONTENT_SPACING_UNIT = 12; // A base unit for visual separation, replacing 'PADDING'

    // Establish WebSocket communication with the server.
    const webClient = window.io ? io.connect(window.location.origin) : null;
    let needsReconnection = false; // Flag to indicate if a reconnect has occurred and a refresh is needed.

    // Core data structure for active display panels.
    let activeDisplayPanels;

    // References to key UI elements using jQuery for efficient selection.
    const colorSelectionWidget = $('#color-picker');
    const pageReloadPrompt = $('#refresh-countdown');
    const topApplicationBar = $('#nav_bar');
    const panelCreationLink = $('#add-feed-dropdown');
    const mainContentArea = $('#feeds-container');
    const layoutConfigurationSelector = $('#layout-options');
    const activityIndicator = $('.data_received_pulse');
    const networkStatusIcon = $('#connection_indicator');
    const systemNotificationBar = $('#status_message_bar');

    let isPageReloadActive = false; // Prevents multiple reload sequences.
    const dataCacheStore = {}; // Stores received data for each stream.

    // Dynamic dimensions for layout calculations.
    let currentViewportWidth = mainContentArea.width();
    let currentAvailableHeight = window.innerHeight - topApplicationBar.height();

    let resizeDebounceHandle = null; // Used to throttle window resize events.

    // Predefined layout presets.
    const displayLayoutPresets = Object.freeze({
        singleFull: 'full_screen_mode',
        splitHorizontal: 'two_column_view',
        splitVertical: 'two_row_view',
        quadrantGrid: 'four_quadrant_layout'
    });

    const RAW_STREAM_SUFFIX = ':raw'; // Constant for subscription topic suffix.
    const CACHE_MAX_ENTRIES = 2500; // Max lines to store in cache per panel.
    const CACHE_TRIM_THRESHOLD = 2000; // Trim cache when it exceeds this.

    // --- Utility Functions ---

    /**
     * Helper to safely access localStorage.
     * @param {string} key - The key for localStorage.
     * @returns {string|null} The stored value or null if an error occurs.
     */
    function getLocalStorageItem(key) {
        try {
            return localStorage.getItem(key);
        } catch (e) {
            console.warn(`Local storage access error for key "${key}":`, e);
            return null;
        }
    }

    /**
     * Helper to safely set localStorage.
     * @param {string} key - The key for localStorage.
     * @param {string} value - The value to store.
     */
    function setLocalStorageItem(key, value) {
        try {
            localStorage.setItem(key, value);
        } catch (e) {
            console.warn(`Local storage write error for key "${key}":`, e);
        }
    }

    /**
     * Helper to safely remove localStorage item.
     * @param {string} key - The key for localStorage.
     */
    function removeLocalStorageItem(key) {
        try {
            localStorage.removeItem(key);
        } catch (e) {
            console.warn(`Local storage removal error for key "${key}":`, e);
        }
    }

    // --- Core Application Initialization ---

    /**
     * Initializes the application by loading state, setting up UI, and binding events.
     * This function acts as the primary entry point after the DOM is ready.
     */
    function initializeApplication() {
        if (!webClient) {
            systemNotificationBar.find('p').text('WebSocket client not available. Please check your connection.');
            systemNotificationBar.slideDown();
            return;
        }

        activeDisplayPanels = retrieveStateFromURL();

        // If URL hash contains panel configurations, populate the display.
        if (activeDisplayPanels.length > 0) {
            activeDisplayPanels.forEach(panelConfig => instantiateNewPanel(panelConfig));
            managePanelStackingOrder(); // Ensure correct z-index.
            $('.feed-pane input[type="text"]').trigger('keyup'); // Re-apply filters.
        }

        bindInterfaceActions();
        colorSelectionWidget.css('background-color', `rgb(${INTERFACE_TEXT_COLOR})`);
        syncLayoutConfiguration(); // Apply stored layout preference.
    }

    // --- Event Binding ---

    /**
     * Attaches all necessary event listeners for WebSocket communication and user interface interactions.
     */
    function bindInterfaceActions() {
        // WebSocket event handlers.
        webClient.on('connect', () => {
            if (needsReconnection) {
                needsReconnection = false;
                triggerApplicationReload(); // Reload content after successful reconnection.
            }
            networkStatusIcon.attr('title', 'Connected to server').addClass('online');
        });

        webClient.on('disconnect', () => {
            needsReconnection = true;
            networkStatusIcon.attr('title', 'Disconnected from server').removeClass('online');
        });

        webClient.on('server_refresh_signal', triggerApplicationReload); // Server-initiated refresh.

        // UI event handlers.
        layoutConfigurationSelector.on('click', '.layout-option', function() {
            const chosenPreset = $(this).data('preset');
            selectLayoutPreset(chosenPreset);
        });

        $(window).on('resize', onViewportDimensionsChange); // Debounced window resize.

        panelCreationLink.on('click', 'li a', handlePanelAdditionRequest); // Adding new panels.
    }

    // --- Panel Management Functions ---

    /**
     * Handles clicks on channel links to add new display panels.
     * @param {Event} eventObj - The DOM event object.
     */
    function handlePanelAdditionRequest(eventObj) {
        eventObj.preventDefault();

        const streamIdentifier = $(this).attr('href').slice(1); // Extract channel ID from href.
        const existingPanelElement = $(`#panel-${streamIdentifier}`);

        // If panel already exists, bring it to front and exit.
        if (existingPanelElement.length > 0) {
            managePanelStackingOrder(streamIdentifier);
            return;
        }

        const currentPanelCount = $('.feed-pane').length;
        // Calculate initial position to cascade new panels.
        const initialTop = 100 + (currentPanelCount * 20);
        const initialLeft = 100 + (currentPanelCount * 20);

        const newPanelConfig = {
            streamId: streamIdentifier,
            topPosition: initialTop,
            leftPosition: initialLeft
        };

        instantiateNewPanel(newPanelConfig);

        activeDisplayPanels.push(newPanelConfig); // Add to our active panels array.

        managePanelStackingOrder(newPanelConfig.streamId);
        syncLayoutConfiguration(); // Re-apply layout to include new panel.
        synchronizeURLState(); // Update browser URL hash.
    }

    /**
     * Creates and appends a new display panel to the UI.
     * @param {object} panelConfig - Configuration object for the new panel (streamId, topPosition, leftPosition, width, height, regex).
     */
    function instantiateNewPanel(panelConfig) {
        const panelId = `panel-${panelConfig.streamId}`;
        const panelListItem = $(`#add-feed-dropdown li:has(a[href="#${panelConfig.streamId}"])`);

        // Construct the new panel element.
        const newPanelElement = $('<div />', {
            'class': 'feed-pane',
            'id': panelId
        });

        // Apply initial positioning and dimensions.
        newPanelElement.css({
            top: panelConfig.topPosition || 100, // Default if not provided.
            left: panelConfig.leftPosition || 100,
            width: panelConfig.width || '50%', // Default width
            height: panelConfig.height || '50%' // Default height
        });

        // Build panel header and content area.
        const panelHeader = $('<nav />').append(
            `<span>${panelConfig.streamId}</span>`,
            $('<a />', { 'href': '#', 'class': 'close-panel-btn', 'html': '&times;' }),
            $('<input />', { 'type': 'text', 'placeholder': '/search pattern/' }),
            $('<button />', { 'class': 'toggle-pause-btn btn-mini btn-inverse', 'text': 'pause' })
        );
        const terminalOutputArea = $('<pre />', { 'class': 'terminal-output', 'contenteditable': 'true' })
            .css('color', `rgb(${INTERFACE_TEXT_COLOR})`);

        newPanelElement
            .append(panelHeader, terminalOutputArea)
            .hide(); // Initially hide for fade-in effect.

        // Pre-fill regex input if available in config.
        if (panelConfig.regexFilter) {
            newPanelElement.find('input').val(panelConfig.regexFilter);
        }

        // Make panels draggable and resizable.
        newPanelElement
            .draggable({
                handle: "nav",
                containment: mainContentArea,
                stop: () => {
                    synchronizeURLState();
                    clearLayoutPreset(); // Draggable implies custom layout.
                }
            })
            .resizable({
                handles: 'se', // South-east handle for resizing.
                stop: synchronizeURLState
            })
            .on('mousedown', () => {
                managePanelStackingOrder(panelConfig.streamId);
                synchronizeURLState();
            });

        // Handle pause/resume button.
        newPanelElement.find('.toggle-pause-btn').on('click', (eventObj) => {
            newPanelElement.toggleClass('is-paused');
            const isCurrentlyPaused = newPanelElement.hasClass('is-paused');
            $(eventObj.target).text(isCurrentlyPaused ? 'resume' : 'pause');

            if (isCurrentlyPaused) {
                webClient.emit('unsubscribe', `${panelConfig.streamId}${RAW_STREAM_SUFFIX}`);
            } else {
                webClient.emit('subscribe', `${panelConfig.streamId}${RAW_STREAM_SUFFIX}`);
            }
        });

        // Handle regex input field.
        newPanelElement.find('input[type="text"]')
            .on('keydown', (eventObj) => eventObj.stopImmediatePropagation()) // Prevent drag conflicts.
            .on('keyup', (eventObj) => {
                const inputField = $(eventObj.target);
                const currentInputValue = inputField.val().trim();

                if (currentInputValue.length === 0) {
                    const hadRegexBefore = !!inputField.data('current-regex');
                    inputField.data('current-regex', null);
                    synchronizeURLState();
                    if (hadRegexBefore) {
                        processAndDisplayStream(terminalOutputArea, null, panelConfig.streamId, true);
                    }
                    inputField.removeClass('regex-error'); // Clear error style.
                    return;
                }

                try {
                    let regexPattern = currentInputValue.replace(/^\//, '').replace(/\/[a-z]*$/, '');
                    let regexModifiers = (currentInputValue.match(/\/([a-z]+)$/) || [])[1];
                    const compiledRegex = new RegExp(regexPattern, regexModifiers);

                    inputField.data('current-regex', compiledRegex).removeClass('regex-error');
                    synchronizeURLState();
                    processAndDisplayStream(terminalOutputArea, null, panelConfig.streamId, true); // Re-filter existing data.
                } catch (error) {
                    console.error(`Invalid regex for ${panelConfig.streamId}:`, error);
                    inputField.addClass('regex-error');
                    systemNotificationBar.find('p').text(`Invalid regex for '${panelConfig.streamId}'.`);
                    systemNotificationBar.slideDown().delay(2000).slideUp();
                }
            });

        // Auto-scroll logic for terminal output.
        terminalOutputArea
            .data('auto-scroll-enabled', true)
            .on('scroll', (eventObj) => {
                const element = eventObj.target;
                // Check if scrolled to bottom.
                const isAtBottom = element.scrollHeight - element.scrollTop === element.clientHeight;
                $(element).data('auto-scroll-enabled', isAtBottom);
            });

        mainContentArea.append(newPanelElement);
        newPanelElement.fadeIn('fast');

        // Store the specific listener function for later removal.
        const streamDataListener = function(incomingPayload) {
            activityIndicator.addClass('is-active');
            setTimeout(() => activityIndicator.removeClass('is-active'), 800);

            const preEl = terminalOutputArea[0];
            const shouldAutoScroll = terminalOutputArea.data('auto-scroll-enabled');

            processAndDisplayStream(terminalOutputArea, incomingPayload, panelConfig.streamId);

            if (shouldAutoScroll) {
                preEl.scrollTop = preEl.scrollHeight; // Scroll to bottom.
            }
        };
        webClient.on(`${panelConfig.streamId}${RAW_STREAM_SUFFIX}`, streamDataListener);
        newPanelElement.data('stream-listener', streamDataListener); // Store reference.

        // Handle close button.
        newPanelElement.find('a.close-panel-btn').on('click', (eventObj) => {
            eventObj.preventDefault();
            panelListItem.removeClass('active-channel'); // Deactivate corresponding channel link.

            webClient.emit('unsubscribe', `${panelConfig.streamId}${RAW_STREAM_SUFFIX}`);
            // Remove the *specific* listener function instance.
            webClient.removeListener(`${panelConfig.streamId}${RAW_STREAM_SUFFIX}`, newPanelElement.data('stream-listener'));
            newPanelElement.remove(); // Remove panel from DOM.

            // Remove from activeDisplayPanels array.
            activeDisplayPanels = activeDisplayPanels.filter(p => p.streamId !== panelConfig.streamId);
            delete dataCacheStore[panelConfig.streamId]; // Clear data cache for this stream.

            synchronizeURLState(); // Update browser URL hash.
            managePanelStackingOrder(); // Re-evaluate z-index.
        });
    }

    /**
     * Manages the Z-index of display panels to bring the most recently interacted one to the front.
     * @param {string} [focusStreamId] - The ID of the stream whose panel should be brought to the front.
     */
    function managePanelStackingOrder(focusStreamId = null) {
        if (focusStreamId) {
            const focusedPanelIndex = activeDisplayPanels.findIndex(p => p.streamId === focusStreamId);
            if (focusedPanelIndex > -1) {
                // Move the focused panel to the end of the array (highest z-index).
                const [focusedPanel] = activeDisplayPanels.splice(focusedPanelIndex, 1);
                activeDisplayPanels.push(focusedPanel);
            }
        }

        activeDisplayPanels.forEach((panelConfig, index) => {
            const panelElement = $(`#panel-${panelConfig.streamId}`);
            panelElement
                .css('z-index', 100 + index) // Base z-index + index for stacking.
                .removeClass('is-active-panel');
        });

        // Highlight the very top panel as active.
        if (activeDisplayPanels.length > 0) {
            const topPanelId = activeDisplayPanels[activeDisplayPanels.length - 1].streamId;
            $(`#panel-${topPanelId}`).addClass('is-active-panel');
        }
    }

    // --- Layout Management Functions ---

    /**
     * Handles window resize events, debouncing them and applying UI adjustments.
     * @param {Event} eventObj - The DOM event object.
     */
    function onViewportDimensionsChange(eventObj) {
        clearTimeout(resizeDebounceHandle);

        // If a specific element within the window is being resized (e.g., a resizable panel),
        // we might not want to apply a global layout preset.
        if (eventObj.target !== window) {
            clearLayoutPreset(); // User is manually adjusting, so clear preset.
            applyMovementStyle(); // Add a class for visual feedback during resizing.
        } else if (!systemNotificationBar.is(':visible')) {
            systemNotificationBar.find('p').text('Adjusting layout...');
            systemNotificationBar.slideDown();
        }

        // Debounce actual layout update to prevent excessive re-renders.
        resizeDebounceHandle = setTimeout(() => {
            removeMovementStyle();
            syncLayoutConfiguration(); // Re-apply layout based on new window size.
            systemNotificationBar.slideUp();
        }, 150); // Increased debounce time for smoother experience.
    }

    /** Adds a CSS class to the body to indicate active UI movement. */
    function applyMovementStyle() {
        document.body.classList.add('ui-moving');
    }

    /** Removes the CSS class from the body, indicating UI movement has ceased. */
    function removeMovementStyle() {
        document.body.classList.remove('ui-moving');
    }

    /** Recalculates the main content area's dimensions. */
    function adjustContainerDimensions() {
        currentViewportWidth = mainContentArea.width();
        currentAvailableHeight = window.innerHeight - topApplicationBar.outerHeight(true); // Include margin/padding.
        mainContentArea.height(currentAvailableHeight);
    }

    /**
     * Synchronizes the current layout configuration, applying a stored preference or default.
     */
    function syncLayoutConfiguration() {
        adjustContainerDimensions(); // Ensure dimensions are up-to-date.

        const storedLayout = getLocalStorageItem('preferred_layout_mode');
        if (storedLayout) {
            selectLayoutPreset(storedLayout);
        } else {
            // Apply a default layout if none is stored.
            selectLayoutPreset(displayLayoutPresets.singleFull);
        }
    }

    /**
     * Sets the active layout preset and applies it to the display panels.
     * @param {string} presetKey - The key corresponding to a layout preset (e.g., 'full_screen_mode').
     */
    function selectLayoutPreset(presetKey) {
        layoutConfigurationSelector.find('.layout-option').removeClass('is-active-preset');
        layoutConfigurationSelector.find(`[data-preset="${presetKey}"]`).addClass('is-active-preset');
        setLocalStorageItem('preferred_layout_mode', presetKey);

        applySelectedLayout(presetKey);
    }

    /**
     * Clears any active layout preset, indicating a custom or manual layout.
     */
    function clearLayoutPreset() {
        layoutConfigurationSelector.find('.layout-option').removeClass('is-active-preset');
        removeLocalStorageItem('preferred_layout_mode');
    }

    /**
     * Applies the visual styling for the chosen layout preset to all active panels.
     * @param {string} presetKey - The key of the layout preset to apply.
     */
    function applySelectedLayout(presetKey) {
        // Ensure container dimensions are fresh before applying layout.
        adjustContainerDimensions();

        switch (presetKey) {
            case displayLayoutPresets.singleFull:
                layoutFullView();
                break;
            case displayLayoutPresets.splitHorizontal:
                layoutSideBySide();
                break;
            case displayLayoutPresets.splitVertical:
                layoutStacked();
                break;
            case displayLayoutPresets.quadrantGrid:
                layoutQuadrantGrid();
                break;
            default:
                console.warn(`Unknown layout preset: ${presetKey}. Defaulting to full view.`);
                layoutFullView();
                break;
        }
        synchronizeURLState(); // Layout changes affect panel positions, so update hash.
    }

    /** Arranges all panels to fill the entire available content area. */
    function layoutFullView() {
        $('.feed-pane').each((index, panel) => {
            $(panel).css({
                width: currentViewportWidth,
                height: currentAvailableHeight - (3 * CONTENT_SPACING_UNIT), // Account for header/footer margins.
                left: 0,
                top: 0
            });
        });
    }

    /** Arranges panels side-by-side, splitting the width. */
    function layoutSideBySide() {
        const panelWidth = (currentViewportWidth - (2 * CONTENT_SPACING_UNIT)) / 2;
        $('.feed-pane').each((index, panel) => {
            $(panel).css({
                width: panelWidth,
                height: currentAvailableHeight - (3 * CONTENT_SPACING_UNIT),
                left: index % 2 === 0 ? 0 : currentViewportWidth / 2,
                top: 0
            });
        });
    }

    /** Arranges panels stacked vertically, splitting the height. */
    function layoutStacked() {
        const panelHeight = (currentAvailableHeight - (6 * CONTENT_SPACING_UNIT)) / 2; // More space for headers.
        $('.feed-pane').each((index, panel) => {
            $(panel).css({
                width: currentViewportWidth,
                height: panelHeight,
                left: 0,
                top: index % 2 === 0 ? 0 : currentAvailableHeight / 2
            });
        });
    }

    /** Arranges panels in a 2x2 grid. */
    function layoutQuadrantGrid() {
        const panelWidth = (currentViewportWidth - (2 * CONTENT_SPACING_UNIT)) / 2;
        const panelHeight = (currentAvailableHeight - (6 * CONTENT_SPACING_UNIT)) / 2;

        $('.feed-pane').each((index, panel) => {
            const panelProperties = { width: panelWidth, height: panelHeight };

            // Determine position based on modulo 4.
            switch (index % 4) {
                case 0: // Top-left
                    panelProperties.top = 0;
                    panelProperties.left = 0;
                    break;
                case 1: // Top-right
                    panelProperties.top = 0;
                    panelProperties.left = currentViewportWidth / 2;
                    break;
                case 2: // Bottom-left
                    panelProperties.top = currentAvailableHeight / 2;
                    panelProperties.left = 0;
                    break;
                case 3: // Bottom-right
                    panelProperties.top = currentAvailableHeight / 2;
                    panelProperties.left = currentViewportWidth / 2;
                    break;
            }
            $(panel).css(panelProperties);
        });
    }

    // --- Page Reload Mechanism ---

    /**
     * Initiates a timed page refresh sequence, displaying a countdown.
     */
    function triggerApplicationReload() {
        if (isPageReloadActive) return; // Prevent multiple concurrent reloads.
        isPageReloadActive = true;

        let countdownValue = parseInt(pageReloadPrompt.find('.timer-value').text(), 10);
        let countdownIntervalId; // Store interval ID for clearing.

        // Setup click handler for the close button within the refresh prompt.
        pageReloadPrompt.find('.cancel-reload-btn').on('click', (eventObj) => {
            eventObj.preventDefault();
            clearInterval(countdownIntervalId); // Stop the countdown.
            pageReloadPrompt.fadeOut(() => {
                isPageReloadActive = false;
                pageReloadPrompt.find('.timer-value').text(10); // Reset timer text.
            });
        });

        // Show the refresh prompt and start the countdown.
        pageReloadPrompt.fadeIn(() => {
            countdownIntervalId = setInterval(() => {
                countdownValue--;
                pageReloadPrompt.find('.timer-value').text(countdownValue);

                if (countdownValue <= 0) {
                    clearInterval(countdownIntervalId); // Stop the interval.
                    $('.feed-pane, #refresh-countdown').fadeOut(() => {
                        window.location.reload(true); // Force a full page reload from server.
                    });
                }
            }, 1000); // Update every second.
        });
    }

    // --- URL Hash State Management ---

    /**
     * Retrieves application state from the URL hash.
     * @returns {Array<object>} An array of panel configuration objects.
     */
    function retrieveStateFromURL() {
        try {
            let hashString = window.location.hash.slice(1); // Remove leading '#'
            if (hashString.startsWith('%')) { // Check for URL-encoded hash.
                hashString = decodeURIComponent(hashString);
            }
            // Parse JSON, return empty array if parsing fails.
            return JSON.parse(hashString) || [];
        } catch (error) {
            console.error('Error parsing URL hash:', error);
            return [];
        }
    }

    /**
     * Persists application state (panel configurations) to the URL hash.
     * @param {Array<object>} dataToStore - Array of panel configuration objects.
     */
    function persistStateToURL(dataToStore) {
        try {
            window.location.hash = encodeURIComponent(JSON.stringify(dataToStore));
        } catch (error) {
            console.error('Error setting URL hash:', error);
        }
    }

    /**
     * Updates the `activeDisplayPanels` array with current panel positions/dimensions and saves to URL hash.
     */
    function synchronizeURLState() {
        const updatedPanels = [];
        activeDisplayPanels.forEach(panelConfig => {
            const panelElement = $(`#panel-${panelConfig.streamId}`);
            if (panelElement.length === 0) {
                // If a panel in our array no longer exists in DOM, skip it.
                return;
            }

            const currentPosition = panelElement.position();
            const currentDimensions = { width: panelElement.width(), height: panelElement.height() };
            const currentRegex = panelElement.find('input[type="text"]').val();

            // Create a new object for updated config to avoid direct mutation issues.
            updatedPanels.push({
                ...panelConfig, // Keep existing properties.
                topPosition: Math.round(currentPosition.top),
                leftPosition: Math.round(currentPosition.left),
                width: Math.round(currentDimensions.width),
                height: Math.round(currentDimensions.height),
                regexFilter: currentRegex || undefined // Store regex only if present.
            });
        });

        activeDisplayPanels = updatedPanels; // Update the main array.
        persistStateToURL(activeDisplayPanels);
    }

    // --- Data Processing and Display ---

    /**
     * Filters and displays incoming stream data in a panel's output area.
     * @param {jQuery} preElementRef - jQuery object for the <pre> element.
     * @param {string|null} incomingPayload - New data string to add to the stream, or null to just re-filter existing cache.
     * @param {string} streamIdentifier - The ID of the stream.
     * @param {boolean} [isRegexModified=false] - True if the regex filter has just been changed, forcing a scroll.
     */
    function processAndDisplayStream(preElementRef, incomingPayload, streamIdentifier, isRegexModified = false) {
        if (!(streamIdentifier in dataCacheStore)) {
            dataCacheStore[streamIdentifier] = [];
        }

        let streamDataBuffer = dataCacheStore[streamIdentifier];

        // Trim cache if it exceeds max entries.
        if (streamDataBuffer.length > CACHE_MAX_ENTRIES) {
            // Remove older entries, keeping a segment of the most recent data.
            streamDataBuffer.splice(0, streamDataBuffer.length - CACHE_TRIM_THRESHOLD);
        }

        if (incomingPayload) {
            // Process incoming data: Replace Unix timestamps with readable dates, split into lines.
            const processedLines = incomingPayload
                .replace(/\b13\d{8,11}\b/g, (timestamp) => {
                    // Convert Unix timestamp (potentially with milliseconds) to ISO string.
                    const ms = timestamp.length === 10 ? parseInt(timestamp, 10) * 1000 : parseInt(timestamp, 10);
                    return `"${new Date(ms).toISOString()}"`;
                })
                .split(/\s*\n+/)
                .filter(line => line.trim().length > 0); // Filter out empty lines.

            streamDataBuffer = streamDataBuffer.concat(processedLines);
            dataCacheStore[streamIdentifier] = streamDataBuffer; // Update the cache.
        }

        const currentRegex = preElementRef.parent().find('input[type="text"]').data('current-regex');
        let linesToDisplay = streamDataBuffer;

        if (currentRegex instanceof RegExp) {
            linesToDisplay = [];
            for (const line of streamDataBuffer) {
                const matchResult = line.match(currentRegex);
                if (matchResult) {
                    // If groups are captured, display them; otherwise, display the full line.
                    linesToDisplay.push(matchResult.length > 1 && matchResult.slice(1).join(', ') || line);
                }
            }
        }

        preElementRef.text(linesToDisplay.join("\n") + "\n");

        if (isRegexModified) {
            preElementRef[0].scrollTop = preElementRef[0].scrollHeight; // Force scroll to bottom on new filter.
        }
    }

    // --- Application Entry Point ---
    // Ensure the DOM is fully loaded before initializing the application.
    $(document).ready(initializeApplication);

})(); // End of IIFE.