(function(jq) {
    // Default configuration for the smart choice system
    var defaultConfiguration = {
        permitMismatch: false,
        activeOptionClass: "smart_choice_active",
        optionContainerClass: "smart_choice_container",
        inputIdentifierTransformer: function(origId) { return origId + "_smart_entry"; },
        inputNameTransformer: function(origName) { return ""; },
        containerIdentifierTransformer: function(origId) { return origId + "_smart_container"; }
    };

    // Factory function to create a new smart choice instance
    function createSmartChoice(originalSelectElement, userOptions) {
        var currentConfig = jq.extend({}, defaultConfiguration, userOptions);

        var _originalSelect = originalSelectElement; // jQuery object for the original select
        var _hiddenInput;     // Hidden input holding the selected value
        var _displayInput;    // Text input for user entry
        var _dropdownWrapper; // Div that holds the dropdown list
        var _dropdownList;    // Ul that contains the options

        var _allPossibleOptions = [];  // Array of { label, val, score }
        var _filteredDisplayOptions = []; // Array of currently matched options

        var _lastEntryText = null;  // Last text processed for filtering
        var _previousFocusText = ""; // Text in input when it gained focus, for reset
        var _currentActiveIndex = -1; // Index of the currently highlighted option in _filteredDisplayOptions
        var _isOptionChosen = false;  // Flag if an option was explicitly picked
        var _isMouseOverDropdown = false; // Workaround for blur event with dropdown interaction

        // --- Core Logic Functions ---

        // Populate _allPossibleOptions from the original select
        function cacheSourceOptions() {
            _allPossibleOptions = _originalSelect.children("option").map(function() {
                var optionElement = jq(this);
                return {
                    label: jq.trim(optionElement.text()),
                    val: optionElement.val(),
                    score: 0.0 // Initial score
                };
            }).get(); // .get() to convert jQuery object to a plain array
        }

        // Build and insert the new DOM elements, remove the original select
        function constructInterfaceElements() {
            var selectedOption = _originalSelect.children("option:selected");

            _hiddenInput = jq("<input type='hidden'/>").attr({
                id: _originalSelect.attr("id"),
                name: _originalSelect.attr("name")
            }).val(selectedOption.val());

            _displayInput = jq("<input type='text' autocomplete='off' />").attr({
                id: currentConfig.inputIdentifierTransformer(_originalSelect.attr("id")),
                name: currentConfig.inputNameTransformer(_originalSelect.attr("name")),
                accesskey: _originalSelect.attr("accesskey"),
                tabindex: _originalSelect.attr("tabindex"),
                style: _originalSelect.attr("style")
            }).addClass(_originalSelect.attr("class")).val(jq.trim(selectedOption.text()));

            _dropdownWrapper = jq("<div></div>").attr({
                id: currentConfig.containerIdentifierTransformer(_originalSelect.attr("id"))
            }).addClass(currentConfig.optionContainerClass);
            _dropdownList = jq("<ul></ul>");
            _dropdownWrapper.append(_dropdownList);

            // Insert new elements and remove the original
            _originalSelect.after(_displayInput).after(_hiddenInput).remove();
            jq("body").append(_dropdownWrapper);
        }

        // Attach event handlers
        function setupEventBindings() {
            _displayInput.on("click", function() {
                _lastEntryText = null; // Clear last processed to force re-filter on click
                _displayInput.trigger("focus"); // Explicitly trigger focus for consistent behavior
            });

            _displayInput.on("mouseup", function(evt) {
                evt.preventDefault(); // Prevent text selection issues in some browsers
            });

            _displayInput.on("focus", function() {
                _previousFocusText = _displayInput.val();
                _displayInput.select(); // Select all text in the input
                if (!_isOptionChosen) {
                  evaluateInputForMatches(); // Filter results if not explicitly picked
                }
            });

            _displayInput.on("blur", function() {
                if (!_isMouseOverDropdown) {
                    hideSuggestionBox();
                    if (!_isOptionChosen && !currentConfig.permitMismatch) {
                        resetInputToPreviousValue();
                    }
                }
            });

            _dropdownList.on("mouseover", "li", function() {
                var rowElements = _dropdownList.find("li");
                activateOption(rowElements.index(jq(this)));
            });

            _dropdownList.on("mouseleave", function() {
                activateOption(-1); // Deactivate all
            });

            _dropdownList.on("mouseup", function() {
                confirmActiveOption();
                focusAndHide();
            });

            _dropdownWrapper.on("mouseover", function() {
                _isMouseOverDropdown = true;
            });

            _dropdownWrapper.on("mouseleave", function() {
                _isMouseOverDropdown = false;
            });

            _dropdownWrapper.on("mousedown", function(evt) {
                evt.preventDefault(); // Prevent input blur when clicking dropdown
            });

            _displayInput.on("keyup", function(evt) {
                switch (evt.keyCode) {
                    case 13: // Enter
                        evt.preventDefault();
                        confirmActiveOption();
                        focusAndHide();
                        break;
                    case 27: // Escape
                        evt.preventDefault();
                        resetInputToPreviousValue();
                        focusAndHide();
                        break;
                    default:
                        evaluateInputForMatches();
                        break;
                }
            });

            _displayInput.on("keydown", function(evt) {
                switch (evt.keyCode) {
                    case 9:  // Tab
                        confirmActiveOption();
                        hideSuggestionBox();
                        break;
                    case 33: // Page Up
                        evt.preventDefault();
                        activateFirstOption();
                        break;
                    case 34: // Page Down
                        evt.preventDefault();
                        activateLastOption();
                        break;
                    case 38: // Up Arrow
                        evt.preventDefault();
                        shiftActiveOption(-1);
                        break;
                    case 40: // Down Arrow
                        evt.preventDefault();
                        shiftActiveOption(1);
                        break;
                    case 13: // Enter
                    case 27: // Escape
                        evt.preventDefault();
                        evt.stopPropagation();
                        break;
                }
            });
        }

        // Filters options based on current input value
        function evaluateInputForMatches() {
            var currentEntry = _displayInput.val();
            if (currentEntry === _lastEntryText) {
                return; // No change, no need to re-filter
            }

            var scoredResults = [];
            jq.each(_allPossibleOptions, function() {
                // Assumes LiquidMetal.score is available globally or through another plugin
                // It's an external dependency of the original code, so we maintain it.
                this.score = LiquidMetal.score(this.label, currentEntry);
                if (this.score > 0.0) {
                    scoredResults.push(this);
                }
            });
            _filteredDisplayOptions = scoredResults;

            sortResultsByScore();
            renderSuggestionBox();
            activateFirstOption();
            _lastEntryText = currentEntry;
            _isOptionChosen = false;
        }

        // Sorts _filteredDisplayOptions by score
        function sortResultsByScore() {
            _filteredDisplayOptions.sort(function(a, b) {
                return b.score - a.score;
            });
        }

        // Renders and positions the dropdown
        function renderSuggestionBox() {
            var borderWidth = _dropdownWrapper.outerWidth() - _dropdownWrapper.innerWidth();
            var inputPosition = _displayInput.offset();
            _dropdownWrapper.css({
                width: (_displayInput.outerWidth() - borderWidth) + "px",
                top: (inputPosition.top + _displayInput.outerHeight()) + "px",
                left: inputPosition.left + "px"
            });

            _dropdownList.empty(); // Clear previous items
            var fragment = document.createDocumentFragment(); // Use fragment for performance
            jq.each(_filteredDisplayOptions, function() {
                var listItem = jq("<li></li>").html(this.label);
                fragment.append(listItem[0]); // Append native DOM element
            });
            _dropdownList.append(fragment);
            _dropdownWrapper.show();
        }

        // Highlights an option in the dropdown list
        function activateOption(idx) {
            if (idx >= _filteredDisplayOptions.length) {
                return;
            }

            var optionRows = _dropdownList.find("li");
            optionRows.removeClass(currentConfig.activeOptionClass);
            _currentActiveIndex = idx;

            if (idx >= 0) {
                jq(optionRows[idx]).addClass(currentConfig.activeOptionClass);
            }
        }

        // Selects the currently highlighted option
        function confirmActiveOption() {
            var selectedItem = _filteredDisplayOptions[_currentActiveIndex];
            if (selectedItem) {
                _displayInput.val(selectedItem.label);
                _hiddenInput.val(selectedItem.val);
                _isOptionChosen = true;
            } else if (currentConfig.permitMismatch) {
                _hiddenInput.val(""); // Clear hidden value if mismatch allowed
            } else {
                resetInputToPreviousValue(); // Reset if no item picked and mismatch not allowed
            }
        }

        // Hides the dropdown
        function hideSuggestionBox() {
            _dropdownWrapper.hide();
            _lastEntryText = null; // Reset last processed text
        }

        // Resets the input field value
        function resetInputToPreviousValue() {
            _displayInput.val(_previousFocusText);
        }

        // Moves the active selection by a given offset
        function shiftActiveOption(offset) {
            activateOption(_currentActiveIndex + offset);
        }

        // Activates the first option
        function activateFirstOption() {
            activateOption(0);
        }

        // Activates the last option
        function activateLastOption() {
            activateOption(_filteredDisplayOptions.length - 1);
        }

        // Focuses the input and hides the dropdown
        function focusAndHide() {
            _displayInput.trigger("focus");
            hideSuggestionBox();
        }

        // --- Initialization Sequence ---
        cacheSourceOptions();
        constructInterfaceElements();
        setupEventBindings();
    }

    // Extend jQuery's prototype to add the smartChoice method
    jq.fn.smartChoice = function(options) {
        this.each(function() {
            // Ensure it's a select element before processing
            if (this.tagName.toUpperCase() === "SELECT") {
                createSmartChoice(jq(this), options);
            }
        });
        return this; // Maintain jQuery chainability
    };

})(jQuery);