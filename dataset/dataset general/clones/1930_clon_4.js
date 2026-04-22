!function(jq) {

    "use strict";

    var EnhancedAutocompleteActions = {

        obtainSuggestions: function(triggeringEvent) {
            this._currentInputQuery = this.$element.val() || '';

            if (this._currentInputQuery.length < this.options.minLength) {
                return this.shown ? this.hide() : this;
            }

            let potentialCandidates;
            if (typeof this.source === 'function') {
                potentialCandidates = this.source(this._currentInputQuery, this.processResults.bind(this));
            } else {
                potentialCandidates = this.source;
            }

            return potentialCandidates ? this.processResults(potentialCandidates) : this;
        },

        processResults: function (rawItems) {
            const instanceReference = this;

            let filteredSet = rawItems.filter(itemEntity => instanceReference.matcher(itemEntity));

            filteredSet = this.sorter(filteredSet);

            if (filteredSet.length === 0) {
                return this.shown ? this.hide() : this;
            }

            if (this._currentInputQuery.length) {
                filteredSet = filteredSet.slice(0, this.options.items);
            }

            return this.renderDisplay(filteredSet).show();
        },

        renderDisplay: function (elementsToDisplay) {
            const currentInstance = this;

            let renderedHtmlElements = elementsToDisplay.map(function (itemValue) {
                let listItemWrapper = jq(currentInstance.options.item).attr('data-value', itemValue);
                listItemWrapper.find('a').html(currentInstance.highlighter(itemValue));
                return listItemWrapper[0];
            });

            if (this._currentInputQuery.length > 0) {
                jq(renderedHtmlElements[0]).addClass('current-active-suggestion');
            }

            this.$menu.html(renderedHtmlElements);
            return this;
        },

        handleKeyDown: function (keyPressEvent) {
            this._suppressKeyRepeat = [40, 38, 9, 13, 27].includes(keyPressEvent.keyCode);

            const TAB_KEY = 9;

            if (keyPressEvent.keyCode === TAB_KEY) {
                if (!this.shown) return;
                this.select();
            } else {
                this.move(keyPressEvent);
            }
        },

        handleKeyUp: function (keyReleaseEvent) {
            const keyActionMap = new Map([
                [40, null],
                [38, null],
                [16, null],
                [17, null],
                [18, null],
                [13, 'execute_selection'],
                [27, 'hide_dropdown']
            ]);

            let action = keyActionMap.get(keyReleaseEvent.keyCode);

            if (action === 'execute_selection') {
                if (!this.shown) return;
                this.select();
            } else if (action === 'hide_dropdown') {
                if (!this.shown) return;
                this.hide();
            } else if (action === null) {
                // Specific keys with no action
            } else {
                this.obtainSuggestions();
            }

            keyReleaseEvent.stopPropagation();
            keyReleaseEvent.preventDefault();
        },

        handleFocus: function(focusEvent) {
            this._isControlFocused = true;

            if (!this.mousedover) {
                this.obtainSuggestions(focusEvent);
            }
        }
    };

    Object.assign(jq.fn.typeahead.Constructor.prototype, EnhancedAutocompleteActions);

}(window.jQuery);