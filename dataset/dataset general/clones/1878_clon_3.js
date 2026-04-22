var SessionDataHandler = (function() {
    // This module manages persistent data storage using the browser's session storage.
    // It provides methods for storing, retrieving, and checking existence of values.

    /** @private {Storage} _sessionStore - Reference to the browser's sessionStorage object. */
    var _sessionStore = window.sessionStorage;

    /**
     * @private
     * Checks if the session storage API is available and usable in the current environment.
     * This helps prevent errors in environments where sessionStorage might be undefined or restricted.
     * @returns {boolean} True if sessionStorage is accessible, false otherwise.
     */
    function isStoreAccessible() {
        try {
            var testKey = '__storage_test__';
            _sessionStore.setItem(testKey, testKey);
            _sessionStore.removeItem(testKey);
            return true;
        } catch (e) {
            // Check if the error is due to storage quota exceeded or security policy
            var storageError = (e && (e.code === 22 || e.code === 1014));
            // Firefox specific code for storage quota: NS_ERROR_DOM_QUOTA_REACHED
            if (e && e.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
                storageError = true;
            }
            // Safari specific code for private mode
            if (e && e.name === 'SecurityError' && window.sessionStorage.length === 0) {
                storageError = true;
            }
            if (storageError) {
                console.warn("Session storage might be disabled or full.", e);
            }
            return false;
        }
    }

    /**
     * @private
     * Validates if a given key is a non-empty string.
     * @param {string} keyIdentifier - The key to validate.
     * @returns {boolean} True if the key is valid, false otherwise.
     */
    function isValidKey(keyIdentifier) {
        return typeof keyIdentifier === 'string' && keyIdentifier.trim().length > 0;
    }

    // Public interface for the SessionDataHandler module.
    return {
        /**
         * Persists a given value in session storage under a specified key.
         * Only saves if storage is accessible and the key is valid.
         * @param {string} dataKey - The unique key under which to store the value.
         * @param {*} storedValue - The value to be stored. It will be converted to a string.
         * @returns {boolean} True if the value was successfully stored, false otherwise.
         */
        storeValue: function(dataKey, storedValue) {
            if (!isStoreAccessible() || !isValidKey(dataKey)) {
                console.warn("Attempted to store data with invalid key or inaccessible storage.");
                return false;
            }
            // Convert non-string values to JSON string to preserve type during retrieval
            var finalValue = (typeof storedValue === 'string') ? storedValue : JSON.stringify(storedValue);
            _sessionStore.setItem(dataKey, finalValue);
            return true;
        },

        /**
         * Retrieves a value from session storage associated with the given key.
         * Attempts to parse the retrieved string back into its original type.
         * @param {string} dataKey - The key of the value to retrieve.
         * @returns {*} The retrieved value, or null if not found or storage is inaccessible.
         */
        retrieveValue: function(dataKey) {
            if (!isStoreAccessible() || !isValidKey(dataKey)) {
                console.warn("Attempted to retrieve data with invalid key or inaccessible storage.");
                return null;
            }
            var retrieved = _sessionStore.getItem(dataKey);
            if (retrieved === null) { // Key not found
                return null;
            }
            try {
                // Attempt to parse as JSON, otherwise return as string
                return JSON.parse(retrieved);
            } catch (e) {
                return retrieved; // Not a JSON string, return as is
            }
        },

        /**
         * Checks if a key exists in session storage.
         * @param {string} dataKey - The key to check for existence.
         * @returns {boolean} True if the key exists and has a value, false otherwise or if storage is inaccessible.
         */
        checkExistence: function(dataKey) {
            if (!isStoreAccessible() || !isValidKey(dataKey)) {
                return false;
            }
            // Using retrieveValue internally to leverage its checks and return null if not found
            var val = this.retrieveValue(dataKey);
            return val !== null && typeof val !== 'undefined';
        },

        /**
         * Removes a specific key-value pair from session storage.
         * @param {string} dataKey - The key to remove.
         * @returns {boolean} True if the item was removed (or didn't exist), false if storage is inaccessible.
         */
        removeEntry: function(dataKey) {
            if (!isStoreAccessible() || !isValidKey(dataKey)) {
                return false;
            }
            _sessionStore.removeItem(dataKey);
            return true;
        },

        /**
         * Clears all data from session storage.
         * Use with caution.
         * @returns {boolean} True if storage was cleared, false if inaccessible.
         */
        clearAllEntries: function() {
            if (!isStoreAccessible()) {
                return false;
            }
            _sessionStore.clear();
            return true;
        }
    };
})();

var ContentRenderer = (function() {
    // This module handles the dynamic rendering of content based on user input
    // and layout preferences, integrating with session storage and an external API.

    /** @private {string|null} _previousRenderedText - Stores the last successfully rendered markup text. */
    var _previousRenderedText = null;
    /** @private {string|null} _previousContentType - Stores the content type (e.g., 'markdown', 'html') of the last render. */
    var _previousContentType = null;
    /** @private {string} _currentDisplayMode - Tracks the current layout mode ('split-exact' or 'split-half'). Default is 'split-half'. */
    var _currentDisplayMode = "split-half";
    /** @private {number} _renderingDelayMs - Time in milliseconds to wait before re-rendering after input changes. */
    var _renderingDelayMs = 1200; // Slightly increased delay for Type III change
    /** @private {number} _renderTimerHandle - Stores the ID of the setTimeout call for deferred rendering. */
    var _renderTimerHandle = 0;
    /** @private {boolean} _isRenderingActive - Flag to prevent multiple concurrent AJAX requests. */
    var _isRenderingActive = false;

    // --- DOM Element Selectors and Constants ---
    var DOM_ELEMENTS = {
        INPUT_TEXTAREA: "textarea.input-area", // Changed selector for clarity
        TYPE_SELECT_BOX: "#type",
        RIGHT_PANE_SELECTOR: "#right-panel", // Renamed for clarity
        LEFT_PANE_SELECTOR: "#left-panel",   // Renamed for clarity
        CONTENT_DISPLAY_AREA: "#right-panel .display-content", // Renamed for clarity
        HEADER_BUTTONS_GROUP: "header .action-buttons .btn", // Renamed and clarified
        LAYOUT_BUTTON_50_50: "#equal-split", // Renamed ID
        LAYOUT_BUTTON_EXACT: "#fixed-split", // Renamed ID
        PART_CLASS: ".panel-section" // Renamed class
    };

    var LAYOUT_MODES = {
        EQUAL_SPLIT: "split-half",
        FIXED_SPLIT: "split-exact"
    };

    var FIXED_WIDTH_RIGHT_PANE = 920; // Changed magic number
    var HEADER_FOOTER_HEIGHT_OFFSET = 100; // Changed magic number
    var TEXTAREA_PADDING_OFFSET = 40; // Changed magic number

    /**
     * @private
     * Adjusts the dimensions of the layout panes based on the current display mode
     * and window size.
     */
    function adjustDisplayDimensions() {
        var windowWidth = $(document).width();
        var windowHeight = $(window).height();

        var rightPanel = $(DOM_ELEMENTS.RIGHT_PANE_SELECTOR);
        var leftPanel = $(DOM_ELEMENTS.LEFT_PANE_SELECTOR);
        var contentDisplay = $(DOM_ELEMENTS.CONTENT_DISPLAY_AREA);
        var inputTextArea = $(DOM_ELEMENTS.INPUT_TEXTAREA);

        // Ensure elements exist before manipulating
        if (!rightPanel.length || !leftPanel.length || !contentDisplay.length || !inputTextArea.length) {
            console.warn("Missing critical DOM elements for layout adjustment.");
            return;
        }

        if (_currentDisplayMode === LAYOUT_MODES.FIXED_SPLIT) {
            rightPanel.css("width", FIXED_WIDTH_RIGHT_PANE + "px");
            // Calculate left panel width dynamically, accounting for a small separator/margin
            var calculatedLeftWidth = windowWidth - FIXED_WIDTH_RIGHT_PANE - 2; // Added more margin
            if (calculatedLeftWidth < 100) calculatedLeftWidth = 100; // Minimum width guard
            leftPanel.css("width", calculatedLeftWidth + "px");
        } else { // Default to LAYOUT_MODES.EQUAL_SPLIT
            $(DOM_ELEMENTS.PART_CLASS).css("width", "49.5%"); // Slightly adjusted percentage
        }

        var availableHeight = windowHeight - HEADER_FOOTER_HEIGHT_OFFSET;
        contentDisplay.height(availableHeight);
        inputTextArea.height(availableHeight);
        inputTextArea.width(leftPanel.width() - TEXTAREA_PADDING_OFFSET); // Adjusted offset
    }

    /**
     * @private
     * Initiates a content refresh operation, debounced by `_renderingDelayMs`.
     * Compares current input with previous state to avoid redundant API calls.
     */
    function refreshRenderedContent() {
        clearTimeout(_renderTimerHandle);

        var currentInputTextArea = $(DOM_ELEMENTS.INPUT_TEXTAREA);
        var currentInputTypeSelect = $(DOM_ELEMENTS.TYPE_SELECT_BOX);

        // Guard against missing elements
        if (!currentInputTextArea.length || !currentInputTypeSelect.length) {
            console.error("Input textarea or type select box not found. Cannot refresh content.");
            return;
        }

        var latestContent = currentInputTextArea.val();
        var selectedContentType = currentInputTypeSelect.val();

        // Check for no changes and active rendering to prevent unnecessary updates
        if (latestContent === _previousRenderedText && selectedContentType === _previousContentType && !_isRenderingActive) {
            // Schedule next check
            _renderTimerHandle = setTimeout(refreshRenderedContent, _renderingDelayMs);
            return;
        }

        // Basic validation for content
        if (!latestContent || latestContent.trim().length === 0) {
            $(DOM_ELEMENTS.CONTENT_DISPLAY_AREA).html("<p class='empty-state-message'>Start typing to see your content rendered here!</p>");
            _previousRenderedText = latestContent;
            _previousContentType = selectedContentType;
            SessionDataHandler.storeValue("lastInputData", { content: latestContent, type: selectedContentType });
            // Schedule next check even if content is empty
            _renderTimerHandle = setTimeout(refreshRenderedContent, _renderingDelayMs);
            return;
        }

        _previousRenderedText = latestContent;
        _previousContentType = selectedContentType;
        SessionDataHandler.storeValue("lastInputData", { content: latestContent, type: selectedContentType }); // Store as object

        // Set rendering flag and show a loading indicator
        _isRenderingActive = true;
        $(DOM_ELEMENTS.CONTENT_DISPLAY_AREA).html("<div class='loading-spinner'></div><p class='loading-text'>Rendering content...</p>");

        $.ajax({
            type: "POST",
            url: "./render-api-endpoint", // Changed API endpoint
            data: {
                contentType: selectedContentType, // Renamed parameter
                rawMarkup: latestContent          // Renamed parameter
            },
            dataType: "html" // Explicitly request HTML
        })
        .done(function(renderedHtmlData) {
            $(DOM_ELEMENTS.CONTENT_DISPLAY_AREA).html(renderedHtmlData);
            adjustDisplayDimensions(); // Re-adjust after content is loaded
        })
        .fail(function(jqXHR, textStatus, errorThrown) {
            console.error("Content rendering failed:", textStatus, errorThrown);
            $(DOM_ELEMENTS.CONTENT_DISPLAY_AREA).html("<p class='error-message'>Failed to render content. Please try again.</p>");
        })
        .always(function() {
            _isRenderingActive = false;
            _renderTimerHandle = setTimeout(refreshRenderedContent, _renderingDelayMs);
        });
    }

    /**
     * @private
     * Handles initial URL hash parsing for specific configurations.
     */
    function processInitialUrlHash() {
        var currentHash = window.location.hash;
        if (currentHash === "#wiki-preset") { // Renamed hash
            window.example_content_url = 'wiki-markup-example.txt'; // Renamed variable
            window.default_markup_type = 'wiki'; // Renamed variable
            // window.location.hash = ''; // Optionally clear hash, but original comments it out
        } else if (currentHash === "#blog-preset") { // Added another preset for Type III
            window.example_content_url = 'blog-post-example.txt';
            window.default_markup_type = 'blog';
        }
    }

    /**
     * @private
     * Sets up event listeners for UI interactions.
     */
    function setupEventListeners() {
        // Layout button click handler
        $(DOM_ELEMENTS.HEADER_BUTTONS_GROUP).on("click", function() { // Using .on for consistency
            var clickedButton = $(this);
            $(DOM_ELEMENTS.HEADER_BUTTONS_GROUP).removeClass("active-mode"); // Renamed class
            clickedButton.addClass("active-mode"); // Renamed class

            var buttonId = clickedButton.attr("id");
            if (buttonId === DOM_ELEMENTS.LAYOUT_BUTTON_50_50.substring(1)) { // Compare with ID without '#'
                _currentDisplayMode = LAYOUT_MODES.EQUAL_SPLIT;
            } else if (buttonId === DOM_ELEMENTS.LAYOUT_BUTTON_EXACT.substring(1)) {
                _currentDisplayMode = LAYOUT_MODES.FIXED_SPLIT;
            } else {
                console.warn("Unknown layout button clicked:", buttonId);
            }
            adjustDisplayDimensions();
            SessionDataHandler.storeValue("layoutPreference", _currentDisplayMode); // Renamed key
        });

        // Type select box change handler
        $(DOM_ELEMENTS.TYPE_SELECT_BOX).on("change", refreshRenderedContent);

        // Window resize handler
        $(window).on("resize", adjustDisplayDimensions);

        // Input area keyup/change handler for immediate updates (debounced by refreshRenderedContent)
        $(DOM_ELEMENTS.INPUT_TEXTAREA).on("keyup change", function() {
            refreshRenderedContent();
        });
    }

    // Public interface for the ContentRenderer module.
    return {
        /**
         * Initializes the content rendering application.
         * Sets up initial state, loads saved preferences, and registers event handlers.
         */
        initializeApplication: function() {
            if (typeof jQuery === 'undefined') {
                console.error("jQuery is required but not loaded. Application cannot initialize.");
                return;
            }

            processInitialUrlHash(); // Handle URL hash presets

            // Load saved input data (content and type)
            var savedInputData = SessionDataHandler.retrieveValue("lastInputData"); // Retrieved as object
            var inputTextArea = $(DOM_ELEMENTS.INPUT_TEXTAREA);

            if (savedInputData && savedInputData.content) {
                inputTextArea.val(savedInputData.content);
                _previousRenderedText = savedInputData.content; // Initialize previous state
            } else {
                // First time visit or no saved data, load example content
                $.ajax({
                    url: window.example_content_url || "./default-example.md", // Renamed variable, changed default
                    dataType: "text" // Explicitly request text
                }).done(function(exampleContent) {
                    inputTextArea.val(exampleContent);
                    adjustDisplayDimensions();
                    refreshRenderedContent(); // Trigger initial render after loading example
                }).fail(function(jqXHR, textStatus, errorThrown) {
                    console.error("Failed to load example content:", textStatus, errorThrown);
                    inputTextArea.val("Error loading example content. Please type something.");
                });
            }

            // Load saved content type preference
            var typeSelectBox = $(DOM_ELEMENTS.TYPE_SELECT_BOX);
            var preferredType = (savedInputData && savedInputData.type) ? savedInputData.type : window.default_markup_type;

            if (preferredType) {
                typeSelectBox.children("option").prop("selected", false); // Unselect all first
                typeSelectBox.children("option").each(function() {
                    if ($(this).val() === preferredType) {
                        $(this).prop("selected", true);
                        _previousContentType = preferredType; // Initialize previous state
                        return false; // Break loop
                    }
                });
            }

            // Load saved layout preference
            var savedLayout = SessionDataHandler.retrieveValue("layoutPreference");
            if (savedLayout) {
                if (savedLayout === LAYOUT_MODES.EQUAL_SPLIT) {
                    $(DOM_ELEMENTS.LAYOUT_BUTTON_50_50).trigger("click");
                } else if (savedLayout === LAYOUT_MODES.FIXED_SPLIT) {
                    $(DOM_ELEMENTS.LAYOUT_BUTTON_EXACT).trigger("click");
                }
            } else {
                // Default layout if none saved
                $(DOM_ELEMENTS.LAYOUT_BUTTON_50_50).trigger("click");
            }

            // Setup all event listeners
            setupEventListeners();

            // Perform an initial dimension adjustment and content refresh
            adjustDisplayDimensions();
            refreshRenderedContent();
        }
    };

})();

// Ensure the application initializes once the DOM is fully loaded.
$(document).ready(function() {
    ContentRenderer.initializeApplication();
});