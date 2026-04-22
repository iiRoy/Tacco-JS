/*
 * This file presents an enhanced version of the Bootstrap Typeahead component.
 * It addresses specific limitations, particularly around handling empty input queries
 * and refining keyboard navigation behavior.
 *
 * Original project source (concept): https://github.com/ptnplanet/Bootstrap-Better-Typeahead
 * Underlying Bootstrap Typeahead reference: http://twitter.github.com/bootstrap/javascript.html#typeahead
 *
 * Licensed under the permissive Apache License 2.0.
 * Details: http://www.apache.org/licenses/LICENSE-2.0
 */

(function (jbQuery) {

    "use strict";

    /**
     * Defines extensions and overrides for the standard Bootstrap Typeahead.
     * This module permits search queries of zero length and adjusts key event processing
     * to ensure proper display on focus via tab key and consistent selection.
     *
     * @module ImprovedAutoComplete
     * @property {object} methods - Collection of extended methods.
     */
    var ImprovedAutoComplete = {

        /**
         * Initiates the suggestion retrieval process based on current input.
         * Allows for zero-length queries when minLength option permits.
         *
         * @param {Event} keyEvent - The keyboard event that triggered the lookup.
         * @returns {object} The current instance for chaining.
         */
        initiateQuery: function (keyEvent) {
            var potentialMatches;
            var currentInputValue = this.$element.val();
            this.activeQueryString = currentInputValue || '';

            // Guard against short queries, but permit zero-length if options allow.
            if (this.activeQueryString.length < this.options.minLength && this.options.minLength !== 0) {
                return this.shown ? this.hide() : this;
            }

            var dataSource = this.source;
            if (jbQuery.isFunction(dataSource)) {
                potentialMatches = dataSource(this.activeQueryString, jbQuery.proxy(this.refineAndPresent, this));
            } else {
                potentialMatches = dataSource;
            }

            // If we have items immediately, process them. Otherwise, the callback will handle it.
            if (potentialMatches) {
                return this.refineAndPresent(potentialMatches);
            } else {
                return this;
            }
        }

        /**
         * Filters and sorts the provided items, then renders them.
         *
         * @param {Array<string>} rawCandidates - The list of potential suggestion strings.
         * @returns {object} The current instance for chaining.
         */
        , refineAndPresent: function (rawCandidates) {
            var componentContext = this;
            var filteredCandidates = [];

            // Iterate and filter candidates using a different approach
            for (var k = 0; k < rawCandidates.length; k++) {
                var candidateItem = rawCandidates[k];
                if (componentContext.matcher(candidateItem)) {
                    filteredCandidates.push(candidateItem);
                }
            }

            var sortedSuggestions = this.sorter(filteredCandidates);

            // If no suggestions remain after filtering, hide the menu.
            if (sortedSuggestions.length === 0) {
                return this.shown ? this.hide() : this;
            }

            // Apply item limit only if there's an active query.
            // This allows full list display on empty query (e.g., on tab focus).
            var finalSuggestions = sortedSuggestions;
            if (this.activeQueryString.length > 0 && this.options.items > 0) {
                finalSuggestions = sortedSuggestions.slice(0, this.options.items);
            }

            // If after all filtering and slicing, we still have no suggestions, hide.
            if (finalSuggestions.length === 0) {
                return this.shown ? this.hide() : this;
            }

            // Render and display the menu.
            return this.displaySuggestions(finalSuggestions).show();
        }

        /**
         * Renders the filtered suggestion items into the dropdown menu.
         *
         * @param {Array<string>} displayableItems - The items to be displayed.
         * @returns {object} The current instance for chaining.
         */
        , displaySuggestions: function (displayableItems) {
            var currentScope = this;
            var menuElements = [];

            // Transform each item into a menu list element.
            jbQuery(displayableItems).each(function (idx, singleItemText) {
                var listItem = jbQuery(currentScope.options.item);
                listItem.attr('data-value', singleItemText);
                listItem.find('a').html(currentScope.highlighter(singleItemText));
                menuElements.push(listItem[0]);
            });

            // Set the first item as active if there's a query.
            if (this.activeQueryString.length > 0 && menuElements.length > 0) {
                jbQuery(menuElements[0]).addClass('active');
            }

            // Populate the menu with generated elements.
            this.$menu.html(menuElements);
            return this;
        }

        /**
         * Handles keydown events for navigation and selection.
         * The tab key logic is moved here for immediate execution.
         *
         * @param {Event} keyboardEvent - The DOM keydown event.
         */
        , handleKeyInteraction: function (keyboardEvent) {
            var currentKeyCode = keyboardEvent.keyCode;
            var navigationKeys = [40, 38, 9, 13, 27]; // Down, Up, Tab, Enter, Escape

            // Suppress keypress repeat for navigation and action keys.
            this.suppressKeyPressRepeat = navigationKeys.includes(currentKeyCode);

            // Special handling for the Tab key.
            if (currentKeyCode === 9) { // Tab key
                // If suggestions are visible, select the active one and prevent default tab behavior.
                if (this.shown) {
                    this.select();
                    keyboardEvent.preventDefault();
                }
                // If not shown, allow blur and don't interfere.
                return;
            }

            // For other keys, delegate to the original move logic.
            // Only move if suggestions are visible.
            if (this.shown) {
                this.move(keyboardEvent);
            }
        }

        /**
         * Processes keyup events, excluding navigation keys already handled by keydown.
         *
         * @param {Event} releaseEvent - The DOM keyup event.
         */
        , processReleasedKey: function (releaseEvent) {
            var releasedKeyCode = releaseEvent.keyCode;

            // Define keys that do not trigger a lookup on keyup.
            var nonLookupKeys = new Set([
                40, // Down arrow
                38, // Up arrow
                16, // Shift
                17, // Ctrl
                18  // Alt
            ]);

            if (nonLookupKeys.has(releasedKeyCode)) {
                // Do nothing for these keys, they are for navigation or modifiers.
                return;
            }

            // Handle action keys.
            switch (releasedKeyCode) {
                case 13: // Enter key
                    // Select if menu is shown.
                    if (this.shown) {
                        this.select();
                    }
                    break;
                case 27: // Escape key
                    // Hide if menu is shown.
                    if (this.shown) {
                        this.hide();
                    }
                    break;
                default:
                    // For all other keys, initiate a new query.
                    this.initiateQuery(releaseEvent);
                    break;
            }

            // Always stop propagation and prevent default behavior for handled keys.
            if (releasedKeyCode === 13 || releasedKeyCode === 27) {
                releaseEvent.stopPropagation();
                releaseEvent.preventDefault();
            } else if (!nonLookupKeys.has(releasedKeyCode) && releasedKeyCode !== 9) {
                releaseEvent.preventDefault();
            }
        }

        /**
         * Handles the focus event on the input field.
         * Triggers a lookup if the user hasn't moused over the menu.
         *
         * @param {Event} focusEvent - The DOM focus event.
         */
        , onInputFocus: function (focusEvent) {
            this.hasFocus = true;
            var shouldTriggerLookup = !this.mousedover;

            // Only perform a lookup if the mouse is not currently over the menu.
            if (shouldTriggerLookup) {
                this.initiateQuery(focusEvent);
            }
        }
    };

    // Integrate the enhanced methods into the Bootstrap Typeahead's prototype.
    // This effectively overrides or extends its default behavior.
    if (jbQuery && jbQuery.fn && jbQuery.fn.typeahead && jbQuery.fn.typeahead.Constructor) {
        jbQuery.extend(jbQuery.fn.typeahead.Constructor.prototype, ImprovedAutoComplete);
    } else {
        // Optional: Add a console warning or error if Bootstrap Typeahead is not found.
        console.warn("Bootstrap Typeahead Constructor not found. ImprovedAutoComplete extension might not be applied.");
    }

})(window.jQuery);