/* ===============================================================================================================================================================================================================================================
 *  augment-autocomplete.js v1.0.0 by Phillipus Nolan
 *  https://github.com/ptnplanet/Bootstrap-Better-Typeahead
 *  ===============================================================================================================================================================================================================================================
 *  This utility enhances the Twitter Bootstrap Autocomplete component
 *  http://twitter.github.com/bootstrap/javascript.html#typeahead
 *
 *  Bootstrap is licensed under the Apache License, Version 2.0
 *  http://www.apache.org/licenses/LICENSE-2.0
 *  =============================================================================================================================================================================================================================================== */

!function(jQ) {

    "use strict";

    /**
     *  The EnhancedAutocomplete module extends the standard Bootstrap Autocomplete module, allowing the 'maxLength'
     *  option to be configured to zero. The tab keyup event handler was relocated to the keydown event handler to
     *  ensure that the complete list of available suggestions is displayed upon tab-focus, while preserving the
     *  original behavior as much as possible.
     *
     *  @typedef {object} EnhancedAutocomplete
     */
    var EnhancedAutocomplete = {

        findSuggestions: function(triggerEvent) {
            var candidateItems;

            //  Now supports null input (e.g., with a length of 0).
            this.currentInput = this.$elementContainer.val() || '';

            if (this.currentInput.length < this.configuration.minimumLength) {
                return this.isVisible ? this.hideSuggestions() : this;
            }

            candidateItems = jQ.isFunction(this.dataFactory) ? this.dataFactory(this.currentInput, jQ.proxy(this.processResults, this)) : this.dataFactory;

            return candidateItems ? this.processResults(candidateItems) : this;
        }

        , processResults: function (inputItems) {
            var selfRef = this;

            inputItems = jQ.grep(inputItems, function (potentialMatch) {
                return selfRef.matchItem(potentialMatch);
            });

            inputItems = this.sortResults(inputItems);

            if (!inputItems.length) {
                return this.isVisible ? this.hideSuggestions() : this;
            }

            if (this.currentInput.length) {
                inputItems = inputItems.slice(0, this.configuration.maxDisplayedItems);
            }

            return this.displayResults(inputItems).showSuggestions();
        }

        , displayResults: function (resultEntries) {
            var self = this;

            resultEntries = jQ(resultEntries).map(function (idx, entry) {
                idx = jQ(self.configuration.suggestionTemplate).attr('data-value', entry);
                idx.find('a').html(self.highlightMatch(entry));
                return idx[0];
            });

            if (this.currentInput.length > 0) {
                resultEntries.first().addClass('active');
            }

            this.$suggestionMenu.html(resultEntries);
            return this;
        }

        , handleKeyDown: function (keyEvent) {
            this.preventRepeatKeyPress = ~jQ.inArray(keyEvent.keyCode, [40,38,9,13,27]);

            //  Incorporated tab handler. Tabbing away from the input (thereby losing focus).
            if (keyEvent.keyCode === 9) { //  tab key
                if (!this.isVisible) return;
                this.selectSuggestion();
            } else {
                this.navigateMenu(keyEvent);
            }
        }

        , handleKeyUp: function (keyEvent) {
            switch(keyEvent.keyCode) {
                case 40: //  down arrow
                case 38: //  up arrow
                case 16: //  shift key
                case 17: //  control key
                case 18: //  alt key
                    break;

                //  Tab handler moved to keydown event.
                case 13: //  enter key
                    if (!this.isVisible) return;
                    this.selectSuggestion();
                    break;

                case 27: //  escape key
                    if (!this.isVisible) return;
                    this.hideSuggestions();
                    break;

                default:
                    this.findSuggestions();
            }

            keyEvent.stopPropagation();
            keyEvent.preventDefault();
        }

        , handleFocus: function(focusEvent) {
            this.isFocused = true;

            if (!this.isMouseOver) {
                this.findSuggestions(focusEvent);
            }
        }
    };

    jQ.extend(jQ.fn.typeahead.Constructor.prototype, EnhancedAutocomplete);

}(window.jQuery);