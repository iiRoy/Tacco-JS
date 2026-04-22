/*
 * JQSymbolSelector - JQuery Utility for Symbol Selection
 *
 * Copyright (c) 2024 Your Name Here
 *
 * Licensed under the Apache License, Version 2.0:
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Project home:
 *   https://github.com/your-repo/jq-symbol-chooser
 *
 * Version:  1.1.0-beta
 *
 * This file is a heavily modified variant of an earlier icon picker.
 * Significant structural and functional changes have been applied.
 */

(function(JQuery) {

    // Internal utility for debouncing function calls
    const debounce = (func, delay) => {
        let timeoutId;
        return function(...args) {
            const context = this;
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func.apply(context, args), delay);
        };
    };

    JQuery.fn.symbolSelector = function( userOptions ) {
        // Flag to track if the pointer is currently within the popup region
        let isPointerOverPopup = false;
        // Reference to the dynamically created popup element
        let currentPopupElement = null;

        // A curated collection of common symbols for selection
        // Note: Some symbols might be added/removed/reordered for variation.
        const availableSymbols = [
            "info-sign", "ok-sign", "remove-sign", "exclamation-sign", "question-sign", "plus-sign", "minus-sign",
            "arrow-left", "arrow-right", "arrow-up", "arrow-down", "circle-arrow-left", "circle-arrow-right",
            "circle-arrow-up", "circle-arrow-down", "hand-left", "hand-right", "hand-up", "hand-down",
            "search", "envelope", "heart", "star", "star-empty", "user", "film", "th-large", "th", "th-list",
            "ok", "remove", "zoom-in", "zoom-out", "off", "signal", "cog", "trash", "home", "file", "time",
            "road", "download-alt", "download", "upload", "inbox", "play-circle", "repeat", "refresh", "list-alt",
            "lock", "flag", "headphones", "volume-off", "volume-down", "volume-up", "qrcode", "barcode", "tag",
            "tags", "book", "bookmark", "print", "camera", "font", "bold", "italic", "text-height", "text-width",
            "align-left", "align-center", "align-right", "align-justify", "list", "indent-left", "indent-right",
            "facetime-video", "picture", "map-marker", "adjust", "tint", "edit", "share", "check", "move", "step-backward",
            "fast-backward", "backward", "play", "pause", "stop", "forward", "fast-forward", "step-forward", "eject",
            "chevron-left", "chevron-right", "chevron-up", "chevron-down", "plus", "minus", "remove-circle", "ok-circle",
            "ban-circle", "arrow-left", "arrow-right", "arrow-up", "arrow-down", "share-alt", "resize-full",
            "resize-small", "exclamation", "gift", "leaf", "fire", "eye-open", "eye-close", "warning-sign", "plane",
            "calendar", "random", "comment", "magnet", "retweet", "shopping-cart", "folder-close", "folder-open",
            "resize-vertical", "resize-horizontal", "hdd", "bullhorn", "bell", "certificate", "thumbs-up", "thumbs-down",
            "globe", "wrench", "tasks", "filter", "briefcase", "dashboard", "paperclip", "heart-empty", "link",
            "phone", "pushpin", "usd", "gbp", "sort", "sort-by-alphabet", "sort-by-alphabet-alt", "sort-by-order",
            "sort-by-order-alt", "sort-by-attributes", "sort-by-attributes-alt", "unchecked", "zoom-in", "zoom-out",
            "cloud", "cloud-download", "cloud-upload", "stats", "credit-card", "cutlery", "paste", "duplicate",
            "hourglass", "dashboard", "bell", "briefcase", "calendar", "camera", "certificate", "check", "chevron-down",
            "chevron-left", "chevron-right", "chevron-up", "circle-arrow-down", "circle-arrow-left", "circle-arrow-right",
            "circle-arrow-up", "cloud", "cloud-download", "cloud-upload", "cog", "collapse-down", "collapse-up", "comment",
            "compressed", "copyright-mark", "credit-card", "cutlery", "dashboard", "download", "download-alt", "earphone",
            "edit", "eject", "envelope", "euro", "exclamation-sign", "expand", "export", "eye-close", "eye-open",
            "facetime-video", "fast-backward", "fast-forward", "file", "film", "filter", "fire", "flag", "flash",
            "floppy-disk", "floppy-open", "floppy-remove", "floppy-save", "floppy-saved", "folder-close", "folder-open",
            "font", "forward", "fullscreen", "gbp", "gift", "glass", "globe", "hand-down", "hand-left", "hand-right",
            "hand-up", "hd-video", "hdd", "header", "headphones", "heart", "heart-empty", "home", "import", "inbox",
            "indent-left", "indent-right", "info-sign", "italic", "leaf", "link", "list", "list-alt", "lock", "log-in",
            "log-out", "magnet", "map-marker", "minus", "minus-sign", "move", "music", "new-window", "off", "ok",
            "ok-circle", "ok-sign", "open", "paperclip", "pause", "pencil", "phone", "phone-alt", "picture", "plane",
            "play", "play-circle", "plus", "plus-sign", "print", "pushpin", "qrcode", "question-sign", "random", "record",
            "refresh", "registration-mark", "remove", "remove-circle", "remove-sign", "repeat", "resize-full",
            "resize-horizontal", "resize-small", "resize-vertical", "retweet", "road", "save", "saved", "screenshot",
            "sd-video", "search", "send", "share", "share-alt", "shopping-cart", "signal", "sort", "sort-by-alphabet",
            "sort-by-alphabet-alt", "sort-by-attributes", "sort-by-attributes-alt", "sort-by-order", "sort-by-order-alt",
            "sound-5-1", "sound-6-1", "sound-7-1", "sound-dolby", "sound-stereo", "star", "star-empty", "stats",
            "step-backward", "step-forward", "stop", "subtitles", "tag", "tags", "tasks", "text-height", "text-width",
            "th", "th-large", "th-list", "thumbs-down", "thumbs-up", "time", "tint", "tower", "transfer", "trash",
            "tree-conifer", "tree-deciduous", "unchecked", "upload", "usd", "user", "volume-down", "volume-off",
            "volume-up", "warning-sign", "wrench", "zoom-in", "zoom-out"
        ];

        // Default configuration options, merged with user-provided settings
        const currentSettings = {
            // If true, the plugin only initializes the button, not the input field wrapper.
            // This option is now deprecated and its functionality largely removed.
            // The plugin will always wrap the input for consistency.
            buttonOnlyMode: false,
            // Default icon to display on the trigger button.
            defaultTriggerIcon: "icon-picture",
            // Placeholder text for the search input within the popup.
            searchPlaceholder: "Filter symbols...",
            // Number of symbols to display per page in the popup.
            symbolsPerPage: 36,
            // Prefix for the icon classes (e.g., "glyphicon", "fa").
            iconClassPrefix: "glyphicon"
        };
        // Merge user options, ensuring deep merge for nested objects if any.
        // For simple objects, Object.assign or spread operator is sufficient.
        Object.assign(currentSettings, userOptions);

        return this.each( function() {
            const inputElement = JQuery(this); // The target input field
            const uniqueDataKey = "symbolSelectorAttached"; // Key for data storage

            // Guard clause: Prevent re-initialization on elements already processed.
            if (inputElement.data(uniqueDataKey)) {
                return;
            }

            // Apply base styling and wrap the input in a container if it's not already.
            if (!inputElement.hasClass("form-control")) {
                inputElement.addClass("form-control");
            }
            
            const inputGroupWrapper = JQuery('<div/>', {
                'class': 'input-group symbol-selector-group'
            });
            inputElement.wrap(inputGroupWrapper);

            // Create the trigger button for the symbol selector.
            const triggerButton = JQuery(`<span class="input-group-addon symbol-trigger-btn pointer">
                                            <i class="${currentSettings.iconClassPrefix} ${currentSettings.defaultTriggerIcon}"></i>
                                          </span>`);
            inputElement.after(triggerButton);

            // Attach the click event handler to the trigger button.
            // Using an IIFE to capture the `inputElement` reference correctly.
            (function(targetInput) {
                triggerButton.on('click', function(evt) {
                    evt.stopPropagation(); // Prevent event bubbling up
                    // Only create/show UI if it's not already present or if it was removed.
                    if (!currentPopupElement || !JQuery('body').has(currentPopupElement).length) {
                        displaySymbolSelectionUI(targetInput);
                        populateSymbolList(targetInput, availableSymbols);
                    } else {
                        // If already open, toggle visibility or simply close if clicked again.
                        removePopupPanel();
                    }
                });
            })(inputElement);

            // Mark the element as initialized to prevent duplicate setups.
            inputElement.data(uniqueDataKey, true);
        });

        /**
         * Creates and appends the symbol selection user interface to the body.
         * @param {JQuery} targetInputField - The input element associated with this selector.
         */
        function displaySymbolSelectionUI(targetInputField) {
            // Remove any existing popup before creating a new one.
            removePopupPanel();

            const inputOffset = targetInputField.offset();
            const inputHeight = targetInputField.outerHeight();

            // Construct the popup panel HTML using template literals for readability.
            const popupHtml = `
                <div class="symbol-panel-controls">
                    <ul>
                        <li><a href="javascript:void(0);" class="panel-nav-btn prev-page" data-direction="-1"><span class="${currentSettings.iconClassPrefix} ${currentSettings.iconClassPrefix}-fast-backward"></span></a></li>
                        <li><input type="text" class="panel-search-field" placeholder="${currentSettings.searchPlaceholder}" /></li>
                        <li><a href="javascript:void(0);" class="panel-nav-btn next-page" data-direction="1"><span class="${currentSettings.iconClassPrefix} ${currentSettings.iconClassPrefix}-fast-forward"></span></a></li>
                    </ul>
                </div>
                <div class="symbol-display-area"></div>
            `;

            currentPopupElement = JQuery('<div/>', {
                'class': 'symbol-selection-popup dropdown-menu', // Using dropdown-menu for Bootstrap styling
                'css': {
                    'top': inputOffset.top + inputHeight + 8, // Adjust vertical position slightly
                    'left': inputOffset.left,
                    'min-width': targetInputField.outerWidth() // Ensure popup is at least as wide as input
                }
            })
            .html(popupHtml)
            .appendTo("body")
            .show();

            // Event handlers for popup interaction.
            currentPopupElement.on({
                'mouseenter': () => { isPointerOverPopup = true; },
                'mouseleave': () => { isPointerOverPopup = false; }
            });

            // Pagination state variables
            let currentSearchTerm = "";
            let currentPageStartIndex = 0;
            const symbolsPerPageCount = currentSettings.symbolsPerPage; // Make this configurable

            // Event handler for pagination buttons
            JQuery(".symbol-panel-controls .panel-nav-btn", currentPopupElement).on('click', function(e) {
                e.preventDefault(); // Prevent default link behavior
                const direction = parseInt(JQuery(this).data("direction"), 10);
                
                // Get currently displayed (filtered) symbols
                const displayedSymbols = getFilteredSymbols(currentSearchTerm);
                const totalSymbols = displayedSymbols.length;

                currentPageStartIndex += symbolsPerPageCount * direction;

                // Clamp the start index to valid bounds
                if (currentPageStartIndex < 0) {
                    currentPageStartIndex = 0;
                } else if (currentPageStartIndex >= totalSymbols) {
                    // Go to the last full page or the start of the last page if not full.
                    currentPageStartIndex = Math.max(0, Math.floor((totalSymbols - 1) / symbolsPerPageCount) * symbolsPerPageCount);
                }
                
                // Re-populate the list with the new page
                populateSymbolList(targetInputField, displayedSymbols, currentPageStartIndex, symbolsPerPageCount);
            });

            // Debounced keyup handler for the search input
            const debouncedSearch = debounce(function() {
                const newSearchTerm = JQuery(this).val().trim();
                if (currentSearchTerm !== newSearchTerm) {
                    currentSearchTerm = newSearchTerm;
                    currentPageStartIndex = 0; // Reset pagination on new search
                    const filtered = getFilteredSymbols(currentSearchTerm);
                    populateSymbolList(targetInputField, filtered, currentPageStartIndex, symbolsPerPageCount);
                }
            }, 300); // 300ms debounce delay

            JQuery('.symbol-panel-controls .panel-search-field', currentPopupElement).on("keyup", debouncedSearch);
            
            // Global click handler to close the popup if clicked outside.
            JQuery(document).on('mouseup.symbolSelector', function(e) {
                // Check if the click was outside the popup AND outside the trigger button.
                // The `has` check is crucial for elements dynamically added to the body.
                if (!isPointerOverPopup && !targetInputField.parent().has(e.target).length && !targetInputField.is(e.target) && !triggerButton.is(e.target) ) {
                    removePopupPanel();
                }
            });
        }

        /**
         * Filters the global list of symbols based on a search term.
         * @param {string} searchTerm - The string to search for.
         * @returns {string[]} An array of matching symbol names.
         */
        function getFilteredSymbols(searchTerm) {
            if (!searchTerm) {
                return availableSymbols;
            }
            const lowerCaseSearch = searchTerm.toLowerCase();
            return availableSymbols.filter(symbol => symbol.toLowerCase().includes(lowerCaseSearch));
        }

        /**
         * Removes the symbol selection popup from the DOM and cleans up event listeners.
         */
        function removePopupPanel() {
            if (currentPopupElement) {
                currentPopupElement.remove();
                currentPopupElement = null;
                isPointerOverPopup = false;
                JQuery(document).off('mouseup.symbolSelector'); // Clean up global event listener
            }
        }

        /**
         * Populates the symbol display area within the popup with a given list of symbols.
         * Handles pagination if start and count are provided.
         * @param {JQuery} targetInputField - The input element to update.
         * @param {string[]} symbolsToDisplay - Array of symbol names to render.
         * @param {number} [startIndex=0] - The starting index for pagination.
         * @param {number} [count=all] - The number of symbols to display (page size).
         */
        function populateSymbolList(targetInputField, symbolsToDisplay, startIndex = 0, count = symbolsToDisplay.length) {
            const symbolListContainer = JQuery(".symbol-display-area", currentPopupElement);
            const symbolList = JQuery('<ul class="symbol-grid"></ul>'); // Use a grid class for styling

            // Slice the array for pagination
            const paginatedSymbols = symbolsToDisplay.slice(startIndex, startIndex + count);

            if (paginatedSymbols.length === 0) {
                symbolList.append('<li class="no-results-msg">No matching symbols found.</li>');
            } else {
                paginatedSymbols.forEach(symbolName => {
                    // Using template literals for clearer HTML structure
                    const listItem = JQuery(`<li>
                                                <a href="javascript:void(0);" title="${symbolName}" data-symbol-name="${symbolName}">
                                                    <span class="${currentSettings.iconClassPrefix} ${currentSettings.iconClassPrefix}-${symbolName}"></span>
                                                </a>
                                            </li>`);
                    symbolList.append(listItem);
                });
            }

            symbolListContainer.html(symbolList); // Replace existing content

            // Attach click handler to each symbol item
            JQuery(".symbol-grid li a", symbolListContainer).on('click', function(e) {
                e.preventDefault();
                const selectedSymbolName = JQuery(this).data("symbol-name");
                targetInputField.val(`${currentSettings.iconClassPrefix} ${currentSettings.iconClassPrefix}-${selectedSymbolName}`);
                removePopupPanel();
            });
        }
    };

}(jQuery));