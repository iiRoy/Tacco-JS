(function(_jq_) {
    // This is the global configuration and utility object for our custom time selection tool.
    // We've renamed it from jQuery.ptTimeSelect to _jq_.timeInputWidget.
    _jq_.timeInputWidget = {};
    _jq_.timeInputWidget.buildRev = "v2.0-alpha"; // Renamed version to buildRev

    // Default configuration options for the time picker.
    // Renamed 'options' to 'defaultSettings' and changed property names.
    _jq_.timeInputWidget.defaultSettings = {
        wrapperClass: undefined, // Renamed containerClass
        panelWidth: '22em',      // Renamed containerWidth
        hourTxt: 'Select Hour',  // Renamed hoursLabel
        minuteTxt: 'Select Minute', // Renamed minutesLabel
        confirmBtnTxt: 'Apply Time', // Renamed setButtonLabel
        triggerIconHtml: undefined, // Renamed popupImage
        activateOnFocus: true,   // Renamed onFocusDisplay
        panelZIndex: 100,        // Renamed zIndex, increased default for better visibility
        beforePanelOpen: undefined, // Renamed onBeforeShow
        afterPanelClose: undefined, // Renamed onClose
        animationSpeed: 'slow',  // New option for animation speed
        suppressMobileKeyboard: true, // New option
        closeOnEscape: true      // New option
    };

    // Internal method to initialize the time selection panel and attach it to the DOM.
    // Renamed _ptTimeSelectInit to _initializeComponent.
    _jq_.timeInputWidget._initializeComponent = function() {
        _jq_(document).ready(function() {
            // Check if the time selection panel already exists in the document.
            // Renamed 'ptTimeSelectCntr' to 'timeInputPanel'.
            if (!_jq_('#timeInputPanel').length) {
                // If not, construct the panel dynamically using jQuery DOM manipulation.
                // This is a significant Type III structural change, replacing large string concatenation.
                const panelContainer = _jq_('<div>')
                    .attr('id', 'timeInputPanel')
                    .addClass('time-select-container')
                    .append(
                        _jq_('<div>').addClass('ui-widget ui-widget-content ui-corner-all').append(
                            _jq_('<div>').addClass('ui-widget-header ui-corner-all').append(
                                _jq_('<div>').attr('id', 'panelCloseBtnDiv').css('float', 'right').append(
                                    _jq_('<a>')
                                        .attr('href', 'javascript:void(0);') // Retained `void(0)` for now but could be `#` with `preventDefault`
                                        .on('click', () => _jq_.timeInputWidget.hidePickerPanel())
                                        .on('mouseover', function() { _jq_(this).removeClass('ui-state-default').addClass('ui-state-hover'); })
                                        .on('mouseout', function() { _jq_(this).removeClass('ui-state-hover').addClass('ui-state-default'); })
                                        .addClass('ui-corner-all ui-state-default')
                                        .append(_jq_('<span>').addClass('ui-icon ui-icon-circle-close').text('X'))
                                ),
                                _jq_('<div>').attr('id', 'selectedTimeDisplay').css('float', 'left').append(
                                    _jq_('<span>').attr('id', 'currentHourDisplay').text('1'),
                                    _jq_('<span>').text(' : '),
                                    _jq_('<span>').attr('id', 'currentMinuteDisplay').text('00'),
                                    _jq_('<span>').text(' '),
                                    _jq_('<span>').attr('id', 'currentAmPmDisplay').text('AM')
                                ),
                                _jq_('<br>').css('clear', 'both'),
                                _jq_('<div>') // Empty div for spacing
                            ),
                            _jq_('<div>').addClass('ui-widget-content ui-corner-all').append(
                                _jq_('<div>').append(
                                    _jq_('<div>').addClass('am-pm-toggle-container').append( // Renamed ptTimeSelectHrAmPmCntr
                                        _jq_('<a>').addClass('hour-selector-btn ui-state-default').attr('href', 'javascript:void(0);').text('AM'), // Renamed ptTimeSelectHr
                                        _jq_('<a>').addClass('hour-selector-btn ui-state-default').attr('href', 'javascript:void(0);').text('PM'),
                                        _jq_('<br>').css('clear', 'left'),
                                        _jq_('<div>') // Empty div for spacing
                                    ),
                                    _jq_('<div>').append(
                                        _jq_('<div>').addClass('time-column-wrapper time-column-left').append( // Renamed ptTimeColumn
                                            _jq_('<div>').addClass('time-labels-row').append( // Renamed ptTimeSelectTimeLabelsCntr
                                                _jq_('<div>').addClass('hour-label-area').css('text-align', 'center').text('Hour') // Renamed ptTimeSelectLeftPane
                                            ),
                                            _jq_('<div>').addClass('ui-widget-content hour-label-area').append(
                                                _jq_('<div>').addClass('hour-buttons-container') // Renamed ptTimeSelectHrCntr
                                            )
                                        ),
                                        _jq_('<div>').addClass('time-column-wrapper time-column-right').append(
                                            _jq_('<div>').addClass('time-labels-row').append(
                                                _jq_('<div>').addClass('minute-label-area').css('text-align', 'center').text('Minutes') // Renamed ptTimeSelectRightPane
                                            ),
                                            _jq_('<div>').addClass('ui-widget-content minute-label-area').append(
                                                _jq_('<div>').addClass('minute-buttons-container') // Renamed ptTimeSelectMinCntr
                                            )
                                        )
                                    )
                                ),
                                _jq_('<div>').css('clear', 'left')
                            ),
                            _jq_('<div>').attr('id', 'confirmButtonSection').append( // Renamed ptTimeSelectSetButton
                                _jq_('<a>')
                                    .attr('href', 'javascript:void(0);')
                                    .on('click', () => _jq_.timeInputWidget.applySelectedTime())
                                    .on('mouseover', function() { _jq_(this).removeClass('ui-state-default').addClass('ui-state-hover'); })
                                    .on('mouseout', function() { _jq_(this).removeClass('ui-state-hover').addClass('ui-state-default'); })
                                    .addClass('ui-corner-all ui-state-default')
                                    .text('APPLY'), // Changed default text
                                _jq_('<br>').css('clear', 'both'),
                                _jq_('<div>') // Empty div for spacing
                            )
                        )
                    );

                _jq_("body").append(panelContainer);

                const panelRef = _jq_('#timeInputPanel');

                // Populate hour and minute buttons dynamically
                const hourButtonsDiv = panelRef.find('.hour-buttons-container');
                for (let hr = 1; hr <= 12; hr++) {
                    hourButtonsDiv.append(
                        _jq_('<a>').addClass('hour-selector-btn ui-state-default').attr('href', 'javascript:void(0);').text(hr)
                    );
                }
                hourButtonsDiv.append(_jq_('<br>').css('clear', 'left'), _jq_('<div>'));

                const minuteButtonsDiv = panelRef.find('.minute-buttons-container');
                for (let min = 0; min < 60; min += 5) {
                    minuteButtonsDiv.append(
                        _jq_('<a>').addClass('minute-selector-btn ui-state-default').attr('href', 'javascript:void(0);').text(min < 10 ? '0' + min : min) // Renamed ptTimeSelectMin
                    );
                }
                minuteButtonsDiv.append(_jq_('<br>').css('clear', 'left'), _jq_('<div>'));


                // Attach event handlers using .on() instead of .bind() for modernization.
                panelRef.find('.minute-selector-btn').on("click", function() {
                    _jq_.timeInputWidget.updateMinuteSelection(_jq_(this).text());
                });

                panelRef.find('.hour-selector-btn').on("click", function() {
                    _jq_.timeInputWidget.updateHourSelection(_jq_(this).text());
                });

                _jq_(document).on('mousedown', _jq_.timeInputWidget._handleExternalClick); // Renamed _doCheckMouseClick

                // Add an escape key listener for closing the panel, based on new option.
                _jq_(document).on('keydown', function(evt) {
                    const activeInput = _jq_(".is-time-picker-active"); // Renamed class
                    if (activeInput.length) {
                        const currentOptions = activeInput.data("timePickerOptions");
                        if (currentOptions && currentOptions.closeOnEscape && evt.key === "Escape") {
                            _jq_.timeInputWidget.hidePickerPanel();
                        }
                    }
                });
            }
        });
    }(); // Self-executing initialization function.

    /**
     * Updates the displayed hour in the time selection panel.
     * Renamed setHr to updateHourSelection.
     * @private
     * @param {string} hourVal - The hour value (1-12) or "AM" / "PM".
     */
    _jq_.timeInputWidget.updateHourSelection = function(hourVal) {
        // Using a more explicit check for AM/PM values.
        const lowerCaseVal = String(hourVal).toLowerCase();
        if (lowerCaseVal === "am" || lowerCaseVal === "pm") {
            _jq_('#currentAmPmDisplay').text(hourVal.toUpperCase()); // Ensure AM/PM is uppercase
        } else {
            _jq_('#currentHourDisplay').text(hourVal);
        }
    }; // END updateHourSelection()

    /**
     * Updates the displayed minutes in the time selection panel.
     * Renamed setMin to updateMinuteSelection.
     * @private
     * @param {string} minuteVal - The minute value (e.g., "00", "05").
     */
    _jq_.timeInputWidget.updateMinuteSelection = function(minuteVal) {
        _jq_('#currentMinuteDisplay').text(minuteVal);
    }; // END updateMinuteSelection()

    /**
     * Retrieves the selected time from the panel and applies it to the active input field.
     * Renamed setTime to applySelectedTime.
     * @private
     */
    _jq_.timeInputWidget.applySelectedTime = function() {
        const selectedHour = _jq_('#currentHourDisplay').text();
        const selectedMinute = _jq_('#currentMinuteDisplay').text();
        const selectedAmPm = _jq_('#currentAmPmDisplay').text();

        // Using template literals for string construction.
        const chosenTimeStr = `${selectedHour}:${selectedMinute} ${selectedAmPm}`;

        const targetField = _jq_(".is-time-picker-active"); // Renamed class.
        if (targetField.length === 0) { // Guard clause for targetField existence
            console.warn("No active time picker input found to apply time to.");
            return;
        }

        const originalFieldValue = targetField.val();
        targetField.val(chosenTimeStr);

        // Trigger change event only if the value actually changed.
        if (chosenTimeStr !== originalFieldValue) {
            targetField.trigger('change');
        }

        this.hidePickerPanel(); // Calling the renamed close method.
    }; // END applySelectedTime()

    /**
     * Displays the time selection panel on the page, positioned below the input field.
     * Renamed openCntr to showPickerPanel.
     * @private
     * @param {HTMLElement} triggeredElement - The input element that triggered the panel display.
     */
    _jq_.timeInputWidget.showPickerPanel = function(triggeredElement) {
        this.hidePickerPanel(); // Ensure any other open panels are closed.
        _jq_(".is-time-picker-active").removeClass("is-time-picker-active"); // Renamed class.

        const panelRef = _jq_("#timeInputPanel");
        const activeInput = _jq_(triggeredElement).eq(0).addClass("is-time-picker-active"); // Renamed class.

        if (activeInput.length === 0) { // Guard clause
            console.error("Attempted to open time picker for a non-existent element.");
            return;
        }

        const currentOptions = activeInput.data("timePickerOptions"); // Renamed data key.

        const inputOffset = activeInput.offset();
        const panelPosition = {
            'z-index': currentOptions.panelZIndex, // Renamed panelZIndex
            top: (inputOffset.top + activeInput.outerHeight()),
            left: inputOffset.left
        };

        if (currentOptions.panelWidth) { // Renamed panelWidth
            panelPosition.width = currentOptions.panelWidth;
        }
        if (currentOptions.wrapperClass) { // Renamed wrapperClass
            panelRef.addClass(currentOptions.wrapperClass);
        }

        panelRef.css(panelPosition);

        let initialHour = '1';
        let initialMinute = '00';
        let initialAmPm = 'AM';

        // Attempt to parse existing time from the input field.
        const inputValue = activeInput.val();
        if (inputValue) {
            // Using a slightly modified regex for robustness and clearer capture groups.
            const timePattern = /(\d{1,2})\s*:\s*(\d{2})\s*(am|pm)/i;
            const timeMatch = timePattern.exec(inputValue);
            if (timeMatch) {
                initialHour = timeMatch[1] || '1';
                initialMinute = timeMatch[2] || '00';
                initialAmPm = timeMatch[3] ? timeMatch[3].toUpperCase() : 'AM'; // Ensure AM/PM is uppercase
            }
        }

        // Update displayed time components and labels.
        panelRef.find("#currentHourDisplay").text(initialHour);
        panelRef.find("#currentMinuteDisplay").text(initialMinute);
        panelRef.find("#currentAmPmDisplay").text(initialAmPm);
        panelRef.find(".time-labels-row .hour-label-area").text(currentOptions.hourTxt); // Renamed hourTxt
        panelRef.find(".time-labels-row .minute-label-area").text(currentOptions.minuteTxt); // Renamed minuteTxt
        panelRef.find("#confirmButtonSection a").text(currentOptions.confirmBtnTxt); // Renamed confirmBtnTxt

        // Call the 'beforePanelOpen' hook if defined.
        if (currentOptions.beforePanelOpen) {
            currentOptions.beforePanelOpen(activeInput, panelRef);
        }

        panelRef.slideDown(currentOptions.animationSpeed); // Using new animationSpeed option.
    }; // END showPickerPanel()

    /**
     * Hides the time selection panel.
     * Renamed closeCntr to hidePickerPanel.
     * @private
     * @param {jQuery} [closedInput] - Optional. The input field associated with the panel being closed.
     */
    _jq_.timeInputWidget.hidePickerPanel = function(closedInput) {
        const panelElement = _jq_("#timeInputPanel");

        if (panelElement.is(":visible")) {
            // Modern browsers don't need the IE-specific visibility check, so we're removing it.

            panelElement
                .hide() // Using .hide() instead of css("display", "none")
                .removeClass() // Remove all classes
                .css("width", ""); // Clear custom width

            let targetInput = closedInput;
            if (!targetInput) {
                targetInput = _jq_(".is-time-picker-active"); // Renamed class.
            }

            if (targetInput && targetInput.length) {
                const fieldOptions = targetInput.removeClass("is-time-picker-active") // Renamed class.
                    .data("timePickerOptions"); // Renamed data key.

                // Call the 'afterPanelClose' hook if defined.
                if (fieldOptions && fieldOptions.afterPanelClose) {
                    fieldOptions.afterPanelClose(targetInput);
                }
            }
        }
    }; // END hidePickerPanel()

    /**
     * Handles clicks outside the time picker panel to close it.
     * Renamed _doCheckMouseClick to _handleExternalClick.
     * @private
     * @param {jQuery.Event} clickEvent - The mouse click event.
     */
    _jq_.timeInputWidget._handleExternalClick = function(clickEvent) {
        const panelElement = _jq_("#timeInputPanel");

        if (!panelElement.is(":visible")) {
            return; // Exit if the panel is not visible.
        }

        const clickedTarget = _jq_(clickEvent.target);

        // Check if the click was outside the panel AND not on an active input field.
        const isClickOutsidePanel = !clickedTarget.closest("#timeInputPanel").length;
        const isClickNotOnActiveInput = !clickedTarget.hasClass("is-time-picker-active"); // Renamed class.

        if (isClickOutsidePanel && isClickNotOnActiveInput) {
            _jq_.timeInputWidget.hidePickerPanel();
        }
    }; // END _handleExternalClick

    /**
     * FUNCTION: $().timeInputPicker()
     * Attaches a custom time selection widget to each matched input element.
     * Renamed jQuery.fn.ptTimeSelect to _jq_.fn.timeInputPicker.
     *
     * @memberOf _jq_
     * @param {Object} [userSettings] - Custom options to override defaults.
     * @returns {jQuery} The jQuery selection for chaining.
     *
     * Extensive changes applied here:
     * - Renamed function and parameters.
     * - Renamed internal variables.
     * - Modernized event binding and DOM manipulation for the trigger icon.
     * - Added guard clauses and new options handling.
     * - Modified mobile keyboard suppression logic.
     */
    _jq_.fn.timeInputPicker = function(userSettings) {
        // Guard clause: ensure userSettings is an object if provided.
        if (userSettings && typeof userSettings !== 'object') {
            console.warn("Invalid settings provided for timeInputPicker. Expected an object.");
            userSettings = {};
        }

        return this.each(function() {
            const currentElement = _jq_(this);

            // Guard clause: ensure element is an input and not already initialized.
            if (this.nodeName.toLowerCase() !== 'input' || currentElement.hasClass('has-time-picker-initialized')) {
                return this;
            }

            // Merge default settings with user-provided settings.
            const resolvedSettings = _jq_.extend({}, _jq_.timeInputWidget.defaultSettings, userSettings);

            currentElement
                .addClass('has-time-picker-initialized') // Renamed class.
                .data("timePickerOptions", resolvedSettings); // Renamed data key.

            // If a trigger icon/HTML is provided, or if onFocusDisplay is disabled, create a clickable trigger.
            if (resolvedSettings.triggerIconHtml || !resolvedSettings.activateOnFocus) {
                const triggerLink = _jq_('<a>')
                    .attr('href', '#') // Using # instead of javascript:void(0)
                    .attr('role', 'button') // Added for accessibility
                    .addClass('time-picker-trigger-link') // New class
                    .html(resolvedSettings.triggerIconHtml || '<span class="ui-icon ui-icon-clock"></span>') // Default icon if none provided
                    .data("linkedTimeInput", currentElement) // Store reference to the input
                    .on('click', function(evt) {
                        evt.preventDefault(); // Prevent default link behavior
                        _jq_.timeInputWidget.showPickerPanel(_jq_(this).data('linkedTimeInput')[0]);
                    });

                currentElement.after(triggerLink);
            }

            // If activation on focus is enabled, attach the focus event.
            if (resolvedSettings.activateOnFocus) {
                currentElement.on('focus', function() {
                    _jq_.timeInputWidget.showPickerPanel(this);
                });
            }

            // Handle mobile virtual keyboard suppression, based on new option.
            if (resolvedSettings.suppressMobileKeyboard) {
                currentElement.on('focus click tap vclick', function(evt) {
                    // Stop propagation and prevent default to keep the picker visible.
                    evt.stopImmediatePropagation();
                    evt.preventDefault();
                    _jq_(this).blur(); // Blur the input to hide the native keyboard.
                });
            }

            // Handle Enter key press to apply the time.
            _jq_(document).on('keypress', function(keyPressed) {
                const enterKeyCode = 13;
                if (keyPressed.which === enterKeyCode && _jq_(".is-time-picker-active").length > 0) {
                    _jq_.timeInputWidget.applySelectedTime();
                }
            });

            return this;
        });
    }; // End of _jq_.fn.timeInputPicker

})(_jq_ || jQuery); // Use _jq_ if defined, otherwise fall back to jQuery.