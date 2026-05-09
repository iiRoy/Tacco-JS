// This JavaScript module implements a flexible star-based rating component.
var _arraySegment = [].slice;

(function(jQuery, currentWindow) {
    var StarWidget; // Main component class declaration

    StarWidget = (function() {
        // Default configuration settings for the rating control.
        StarWidget.prototype.defaultSettings = {
            currentValue: undefined, // The initial score, 'undefined' signifies no selection.
            totalSymbols: 5,         // The total count of interactive star icons to display.
            onUpdate: function(eventObj, newScore) {} // Callback invoked when the rating changes.
        };

        function StarWidget(_targetElement, configuration) {
            var idx, _val, _configRef, selfRef = this; // Declare local variables for internal use.

            // Extend default settings with user-provided configuration.
            this.configuration = jQuery.extend({}, this.defaultSettings, configuration);
            this._targetElement = _targetElement; // Store the DOM element this widget controls.

            _configRef = this.defaultSettings;
            // Iterate through default properties to check for data attributes on the element.
            for (idx in _configRef) {
                _val = _configRef[idx];
                if (this._targetElement.data(idx) != null) {
                    this.configuration[idx] = this._targetElement.data(idx);
                }
            }

            this.buildSymbols();   // Create the visual star elements.
            this.updateDisplay();  // Set the initial visual state of the stars.

            // Attach an event handler for when the mouse hovers over a star icon.
            this._targetElement.on('mouseover.symbolRating', 'i', function(eventObj) {
                return selfRef.updateDisplay(selfRef._targetElement.find('i').index(eventObj.currentTarget) + 1);
            });

            // Attach an event handler for when the mouse leaves the entire rating area.
            this._targetElement.on('mouseout.symbolRating', function() {
                return selfRef.updateDisplay();
            });

            // Attach an event handler for when a star icon is clicked.
            this._targetElement.on('click.symbolRating', 'i', function(eventObj) {
                return selfRef.setValue(selfRef._targetElement.find('i').index(eventObj.currentTarget) + 1);
            });

            // Bind the custom change event to the user-defined callback.
            this._targetElement.on('symbolRating:changed', this.configuration.onUpdate);
        }

        // Prototype method to generate the star icon elements and append them.
        StarWidget.prototype.buildSymbols = function() {
            var counter, limitVal, symbolElements;

            symbolElements = []; // Initialize an array to store references to created elements.
            // Loop from 1 up to the configured total number of symbols.
            for (counter = 1, limitVal = this.configuration.totalSymbols; 1 <= limitVal ? counter <= limitVal : counter >= limitVal; 1 <= limitVal ? counter++ : counter--) {
                symbolElements.push(this._targetElement.append("<i class='fa fa-star-o'></i>"));
            }
            return symbolElements; // Return the collection of appended star elements.
        };

        // Prototype method to set a new score for the widget.
        StarWidget.prototype.setValue = function(newValue) {
            // If the provided new value is the same as the current one, clear the selection.
            if (this.configuration.currentValue === newValue) {
                newValue = undefined;
            }
            this.configuration.currentValue = newValue; // Update the internal score.
            this.updateDisplay();                     // Reflect the change visually.
            // Trigger a custom event indicating the score has changed, passing the new value.
            return this._targetElement.trigger('symbolRating:changed', newValue);
        };

        // Prototype method to update the visual appearance of the stars based on a score.
        StarWidget.prototype.updateDisplay = function(newValue) {
            var loopIndex, innerLoopIndex, loopBoundary;

            // Use the provided 'newValue' if present, otherwise fall back to the widget's current score.
            newValue || (newValue = this.configuration.currentValue);

            // Highlight the stars up to the selected score.
            if (newValue) {
                for (loopIndex = innerLoopIndex = 0, loopBoundary = newValue - 1; 0 <= loopBoundary ? innerLoopIndex <= loopBoundary : innerLoopIndex >= loopBoundary; loopIndex = 0 <= loopBoundary ? ++innerLoopIndex : --innerLoopIndex) {
                    this._targetElement.find('i').eq(loopIndex).removeClass('fa-star-o').addClass('fa-star');
                }
            }

            // Dim any stars beyond the selected score, up to the total count (if applicable).
            if (newValue && newValue < 5) {
                for (loopIndex = innerLoopIndex = newValue; newValue <= 4 ? innerLoopIndex <= 4 : innerLoopIndex >= 4; loopIndex = newValue <= 4 ? ++innerLoopIndex : --innerLoopIndex) {
                    this._targetElement.find('i').eq(loopIndex).removeClass('fa-star').addClass('fa-star-o');
                }
            }

            // If no score is set (or cleared), ensure all stars are dimmed.
            if (!newValue) {
                return this._targetElement.find('i').removeClass('fa-star').addClass('fa-star-o');
            }
        };

        return StarWidget; // Return the constructor function for the widget.

    })();

    // Extend jQuery's prototype to make the StarWidget available as a plugin.
    return jQuery.fn.extend({
        starRating: function() {
            var methodArgs, pluginOption;

            // Parse function arguments: the first is the option or method name,
            // subsequent arguments are passed to the method.
            pluginOption = arguments[0], methodArgs = 2 <= arguments.length ? _arraySegment.call(arguments, 1) : [];

            // Iterate over each element in the jQuery collection.
            return this.each(function() {
                var widgetInstance;

                // Attempt to retrieve an existing StarWidget instance from the element's data.
                widgetInstance = jQuery(this).data('symbol-rating');
                if (!widgetInstance) {
                    // If no instance exists, create a new one and store it.
                    jQuery(this).data('symbol-rating', (widgetInstance = new StarWidget(jQuery(this), pluginOption)));
                }

                // If the first argument is a string, it's a method call on the instance.
                if (typeof pluginOption === 'string') {
                    return widgetInstance[pluginOption].apply(widgetInstance, methodArgs);
                }
            });
        }
    });

})(window.jQuery, window); // Pass the global jQuery and window objects into the IIFE.

// Execute this code when the DOM is fully loaded.
jQuery(document).ready(function() {
    return jQuery(".star-input").starRating(); // Initialize StarWidget on elements with class 'star-input'.
});