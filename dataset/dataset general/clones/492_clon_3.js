(function(jQueryRef, deckCore) {
    // Ensure jQuery and deck.js core are available
    if (!jQueryRef || !deckCore) {
        console.error("Deck Search Extension: jQuery or Deck.js core not found.");
        return;
    }

    const documentElement = jQueryRef(document);
    let searchInterfaceContainer; // Main container element for the search UI
    let searchModuleActive = false; // Flag to track if the search UI is currently active

    // Unique identifier for this plugin's settings within deck.js
    const moduleConfigKey = 'searchEnhancements';

    /**
     * Default configuration options for the deck.search plugin.
     * These can be overridden by deck.js global defaults or passed directly to setupSearchInterface.
     */
    const defaultSearchOptions = {
        slideHeadingSelectors: 'header, h1, h2, h3, h4', // Selectors for slide titles
        enableDeckNavigation: true, // Use deck.js 'go' function for navigation
        minimumQueryLength: 2, // Minimum characters required to start a search
        searchDebounceDelay: 250, // Delay in ms before performing search after key input

        uiContainer: {
            attachTo: 'body', // Selector for the parent element to append the search UI
            elementId: 'deckSearchWrapper', // ID for the main search container
            baseStyling: { // Default styles for the container
                position: 'fixed',
                top: '0',
                left: '0',
                background: 'none',
                border: 'none',
                padding: '0.6em',
                'font-size': '1.1em',
                'z-index': '100',
                overflow: 'auto',
                'max-height': '100vh',
                'box-sizing': 'border-box'
            },
            resultDisplayStyling: { // Styles applied when search results are visible
                background: '#fff',
                border: '1px solid #aaa',
                'border-left': 'none',
                'border-top': 'none',
                'box-shadow': '2px 2px 5px rgba(0,0,0,0.2)'
            },
            activeClassName: 'deck-search-active' // Class added to body when search is open
        },
        searchPrompt: {
            display: true, // Whether to show the hint text
            elementId: 'deckSearchHint', // ID for the hint element
            promptText: "(Press 'F' to activate search)", // Text for the hint
            promptStyling: {
                'font-style': 'italic',
                color: '#333',
                background: '#eee',
                opacity: '0.7',
                padding: '0.3em',
                'border-radius': '3px'
            }
        },
        searchInputField: {
            elementId: 'deckSearchInput', // ID for the input field
            placeholderText: 'Search slides...', // Placeholder for the input
            inactiveStyling: { // Styles when input is not focused
                outline: 'none',
                width: '4em',
                'border-radius': '4px',
                border: '1px solid #ccc',
                padding: '0.2em 0.4em'
            },
            activeStyling: { // Styles when input is focused
                outline: 'none',
                width: 'auto', // Allow input to expand
                'border-radius': '4px',
                border: '1px solid #999',
                padding: '0.2em 0.4em'
            }
        },
        searchResultsDisplay: {
            elementId: 'deckSearchResultsList', // ID for the results container
            resultItemClass: 'searchResultEntry', // Class for individual result items
            hitCountStyling: 'font-style: italic; font-size: 0.85em; color: #666;' // Inline styles for hit counts
        },
        keyBindings: {
            activateSearch: 70, // 'f' key
            deactivateSearch: 27, // 'esc' key
            navigateResult: 13 // 'enter' key
        }
    };

    // Make defaultSearchOptions visible in deck.js core defaults
    jQueryRef[deckCore].defaults[moduleConfigKey] = {};
    jQueryRef.extend(true, jQueryRef[deckCore].defaults[moduleConfigKey], defaultSearchOptions);

    let searchDebounceTimer = null; // Timer for debouncing search input

    /**
     * Removes the search user interface elements and unbinds associated events.
     */
    function destroySearchComponent() {
        if (!searchModuleActive) {
            return; // Nothing to destroy if not active
        }

        documentElement.off('.deckSearchModule'); // Unbind all events for this module
        jQueryRef(window).off('.deckSearchModule'); // Unbind window resize
        clearTimeout(searchDebounceTimer); // Clear any pending debounced searches

        if (searchInterfaceContainer) {
            searchInterfaceContainer.remove();
        }
        // Also ensure any lingering container by ID is removed, just in case
        jQueryRef('#' + defaultSearchOptions.uiContainer.elementId).remove();
        jQueryRef('body').removeClass(defaultSearchOptions.uiContainer.activeClassName);
        searchModuleActive = false;
        searchInterfaceContainer = null; // Reset container reference
    }

    /**
     * Initializes and displays the search user interface.
     * @param {object} [userOverrides] - Optional settings to override defaults.
     */
    function setupSearchInterface(userOverrides) {
        if (searchModuleActive) {
            // If already active, destroy and re-initialize to apply new settings or refresh state
            destroySearchComponent();
        }

        const currentSettings = jQueryRef.extend(true, {}, jQueryRef[deckCore].defaults[moduleConfigKey], userOverrides);

        // Immediately mark as active to prevent re-entry during setup
        searchModuleActive = true;

        // Clean up any previous instances before creating new ones
        destroySearchComponent();

        let hintDisplayElement, searchInputFieldElement, searchResultsAreaElement;

        // --- Initialize the main container ---
        searchInterfaceContainer = jQueryRef(`<div id="${currentSettings.uiContainer.elementId}" />`)
            .css(currentSettings.uiContainer.baseStyling)
            .on('focusin.deckSearchModule', function() {
                if (hintDisplayElement) {
                    hintDisplayElement.fadeOut(200, function() { jQueryRef(this).remove(); });
                    hintDisplayElement = null;
                }
                searchInputFieldElement.css(currentSettings.searchInputField.activeStyling);
            })
            .on('focusout.deckSearchModule', function() {
                searchInputFieldElement.removeAttr('placeholder');
                // Only revert container style if no results are showing
                if (!searchResultsAreaElement.html().trim()) {
                    searchInputFieldElement.css(currentSettings.searchInputField.inactiveStyling);
                    searchInterfaceContainer.css(currentSettings.uiContainer.baseStyling);
                }
            });

        // Add a class to the body to indicate search is active
        jQueryRef('body').addClass(currentSettings.uiContainer.activeClassName);

        // --- Add hint text if enabled ---
        if (currentSettings.searchPrompt.display) {
            hintDisplayElement = jQueryRef(`<div id="${currentSettings.searchPrompt.elementId}">${currentSettings.searchPrompt.promptText}</div>`)
                .css(currentSettings.searchPrompt.promptStyling)
                .appendTo(searchInterfaceContainer);
        }

        // --- Initialize search input field ---
        searchInputFieldElement = jQueryRef(`<input id="${currentSettings.searchInputField.elementId}" type="search" placeholder="${currentSettings.searchInputField.placeholderText}" />`)
            .css(currentSettings.searchInputField.inactiveStyling)
            .on('keyup.deckSearchModule', function(event) {
                event.stopPropagation(); // Prevent normal deck navigation
                const queryText = jQueryRef(this).val().trim();
                const keyCodeVal = event.keyCode || event.which;

                // Handle special keys first
                if (keyCodeVal === currentSettings.keyBindings.deactivateSearch) {
                    jQueryRef(this).blur(); // Blur the search field
                    return;
                }
                if (keyCodeVal === currentSettings.keyBindings.navigateResult) {
                    // Trigger click on the first result if Enter is pressed
                    searchResultsAreaElement.find(`.${currentSettings.searchResultsDisplay.resultItemClass} a`).first().trigger('click');
                    return;
                }

                // Debounce the actual search execution
                clearTimeout(searchDebounceTimer);
                searchDebounceTimer = setTimeout(() => {
                    performSearch(queryText, currentSettings, searchResultsAreaElement, searchInterfaceContainer);
                }, currentSettings.searchDebounceDelay);
            })
            .on('click.deckSearchModule', function() {
                // If input is empty on click, clear results
                if (!jQueryRef(this).val().trim().length) {
                    searchResultsAreaElement.empty();
                    searchInterfaceContainer.css(currentSettings.uiContainer.baseStyling);
                }
            })
            .appendTo(searchInterfaceContainer);

        // --- Global document keyup event for activating search ---
        documentElement.on('keyup.deckSearchModule', function(event) {
            const keyCodeVal = event.keyCode || event.which;
            if (keyCodeVal === currentSettings.keyBindings.activateSearch && !searchInputFieldElement.is(':focus')) {
                searchInputFieldElement.focus();
                event.preventDefault(); // Prevent 'f' from typing into the field
            }
        });

        // --- Global document click event to blur search if clicked outside ---
        documentElement.on('click.deckSearchModule', function(event) {
            if (!jQueryRef(event.target).closest(`#${currentSettings.uiContainer.elementId}`).length) {
                searchInputFieldElement.val('').trigger('click'); // Clear input and results
                searchInterfaceContainer.trigger('focusout'); // Revert styles
            }
        });

        // --- Initialize search results display area ---
        searchResultsAreaElement = jQueryRef(`<div id="${currentSettings.searchResultsDisplay.elementId}" />`)
            .on('click.deckSearchModule', `.${currentSettings.searchResultsDisplay.resultItemClass} a`, function(event) {
                event.preventDefault(); // Prevent default anchor behavior
                event.stopPropagation(); // Prevent event from bubbling up to document click

                if (currentSettings.enableDeckNavigation) {
                    const targetSlideIndex = jQueryRef(this).data('slide-index');
                    if (targetSlideIndex !== undefined) {
                        jQueryRef[deckCore]('go', parseInt(targetSlideIndex, 10));
                    }
                }
                searchInputFieldElement.blur(); // Blur input after navigation
            })
            .on('keyup.deckSearchModule', `.${currentSettings.searchResultsDisplay.resultItemClass} a`, function(event) {
                const keyCodeVal = event.keyCode || event.which;
                // Only handle Enter/Space for navigation, others should pass through if needed
                if (keyCodeVal === currentSettings.keyBindings.navigateResult || keyCodeVal === 32) { // 32 is Space
                    jQueryRef(this).trigger('click');
                    event.preventDefault(); // Prevent default browser behavior
                    event.stopPropagation();
                } else if (keyCodeVal === currentSettings.keyBindings.deactivateSearch) {
                    searchInputFieldElement.val('').trigger('click');
                    searchInterfaceContainer.trigger('focusout');
                }
            })
            .appendTo(searchInterfaceContainer);

        // --- Handle window resize to adjust max-height ---
        jQueryRef(window).on('resize.deckSearchModule', function() {
            searchInterfaceContainer.css({'max-height': jQueryRef(window).height()});
        });

        // --- Append the complete search UI to its target ---
        searchInterfaceContainer.appendTo(currentSettings.uiContainer.attachTo);

        // --- Apply font family from first slide if available ---
        const firstSlideFont = jQueryRef('.slide:first').css('font-family');
        if (firstSlideFont) {
            searchInterfaceContainer.css({'font-family': firstSlideFont});
        }
    }

    /**
     * Performs the actual search based on the query and updates the results display.
     * @param {string} queryText - The text to search for.
     * @param {object} currentSettings - The current configuration settings.
     * @param {jQuery} searchResultsAreaElement - The jQuery object for the results display area.
     * @param {jQuery} searchInterfaceContainer - The jQuery object for the main search container.
     */
    function performSearch(queryText, currentSettings, searchResultsAreaElement, searchInterfaceContainer) {
        let resultEntries = [];

        if (queryText.length < currentSettings.minimumQueryLength) {
            searchResultsAreaElement.empty();
            searchInterfaceContainer.css(currentSettings.uiContainer.baseStyling);
            return;
        }

        // Use a case-insensitive regex for searching, 'g' for global match if we want all occurrences for counting
        const searchPattern = new RegExp(queryText, 'img');

        jQueryRef('.slide').each(function(index, slideNode) {
            const currentSlide = jQueryRef(this);
            const slideContent = currentSlide.text();
            const matchCount = slideContent.match(searchPattern);

            // Check if the query matches text or if the query is a slide number
            const isNumericQuery = !isNaN(parseInt(queryText, 10)) && parseInt(queryText, 10) === index;
            if (matchCount || isNumericQuery) {
                let slideHeading = '';
                let resultDetails = '';
                let entryStyling = '';

                const parentDeckSlide = currentSlide.parent().closest('.slide');

                if (!parentDeckSlide.length) {
                    // This is a top-level slide
                    entryStyling += 'margin-top: 0.8em;';
                    slideHeading = currentSlide.children(currentSettings.slideHeadingSelectors).first().text().trim();
                    if (slideHeading.length > 30) {
                        slideHeading = slideHeading.substring(0, 27) + "...";
                    }
                } else {
                    // This is a nested slide, apply indent
                    entryStyling += 'margin-left: 1.2em; font-size: 0.95em;';
                }

                if (matchCount) {
                    resultDetails = `(${matchCount.length} match${matchCount.length > 1 ? 'es' : ''})`;
                } else if (isNumericQuery) {
                    resultDetails = `(slide #${index})`;
                }

                const displayTitle = slideHeading ? `<span style="font-weight: bold;">${slideHeading}</span><br>` : '';

                resultEntries.push(`
                    <div class="${currentSettings.searchResultsDisplay.resultItemClass}" style="${entryStyling}">
                        <a href="#${slideNode.id}" data-slide-index="${index}">
                            ${displayTitle}#${slideNode.id}
                        </a>
                        <span style="${currentSettings.searchResultsDisplay.hitCountStyling}">${resultDetails}</span>
                    </div>
                `);
            }
        });

        const generatedResultsMarkup = resultEntries.length ? resultEntries.join('') : '<div style="padding: 0.5em;">No relevant slides found.</div>';
        searchResultsAreaElement.html(generatedResultsMarkup);

        // Adjust container style based on whether results are present
        const hasResultsContent = !!resultEntries.length;
        searchInterfaceContainer.css(hasResultsContent ? currentSettings.uiContainer.resultDisplayStyling : currentSettings.uiContainer.baseStyling);
        searchInterfaceContainer.css({'max-height': jQueryRef(window).height()}); // Re-evaluate max-height
    }


    // --- Extend deck.js API ---
    jQueryRef[deckCore]('extend', 'activateDeckSearch', setupSearchInterface);
    jQueryRef[deckCore]('extend', 'deactivateDeckSearch', destroySearchComponent);

    // --- Automatically initialize the search UI when deck.js initializes ---
    documentElement.on('deck.init.deckSearchModule', setupSearchInterface);

})(jQuery, 'deck');