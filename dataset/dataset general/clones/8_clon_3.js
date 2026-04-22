// Licensed under Apache License v2.0. See http://www.apache.org/licenses/LICENSE-2.0

(function ($, M) { // Exposing jQuery as $ and moment as M for clarity and brevity

    /**
     * @class IntervalSelector
     * @description A versatile component for selecting date ranges or single dates,
     *              built upon jQuery and Moment.js. It allows for custom configurations
     *              including locales, date formats, predefined ranges, and time selection.
     * @param {HTMLElement|jQuery} hostElement - The DOM element (e.g., an input field)
     *                                           that triggers and is associated with the picker.
     * @param {Object} [opts] - Configuration options for customizing the picker's behavior and appearance.
     * @param {Function} [selectionHandler] - An optional callback function invoked when a date
     *                                       range is confirmed. It receives the start and end
     *                                       Moment.js objects as arguments.
     */
    const IntervalSelector = function (hostElement, opts, selectionHandler) {
        // Determine if an options object was provided to avoid errors.
        const configProvided = typeof opts === 'object' && opts !== null;
        let effectiveLocale = {}; // Will hold the merged localization settings.

        // --- Core Internal State and Default Configurations ---
        // These properties define the picker's current selection and default behavior.
        this.startInterval = M().startOf('day'); // Currently selected start date/time.
        this.endInterval = M().startOf('day');   // Currently selected end date/time.
        this.earliestPossible = null;            // Global minimum selectable date.
        this.latestPossible = null;              // Global maximum selectable date.
        this.limitInterval = null;               // Maximum allowed duration for a selected range.

        this.displayDropdowns = false;           // Show year/month dropdowns in calendars.
        this.displayWeekNumbers = false;         // Show week numbers in calendar grid.
        this.enableTimeSelection = false;        // Allow time selection (hours/minutes).
        this.timeStepMinutes = 30;               // Increment for minute dropdown.
        this.use12HourFormat = true;             // Use 12-hour AM/PM format for time selection.
        this.predefinedIntervals = {};           // Custom named date ranges.
        this.displayDirection = 'right';         // Direction the picker opens ('left' or 'right').

        this.actionButtonClasses = ['btn', 'btn-sm']; // Base CSS classes for action buttons.
        this.confirmBtnClass = 'btn-success';    // CSS class for the 'Apply' button.
        this.abortBtnClass = 'btn-secondary';    // CSS class for the 'Cancel' button (renamed from 'btn-default').

        this.dateFormatPattern = 'MM/DD/YYYY';   // Moment.js format string for dates.
        this.dateSeparator = ' - ';              // Separator used in the host input field.

        // Default localization strings, drawing from Moment.js's current locale.
        this.localizationStrings = {
            confirmLabel: 'Apply Selection',     // Renamed from 'applyLabel'.
            abortLabel: 'Cancel',                // Renamed from 'cancelLabel'.
            fromTxt: 'From',                     // Renamed from 'fromLabel'.
            toTxt: 'To',                         // Renamed from 'toLabel'.
            weekSymbol: 'Wk',                    // Renamed from 'weekLabel'.
            customRangeTxt: 'Custom Period',     // Renamed from 'customRangeLabel'.
            weekDayShortNames: M.weekdaysMin().slice(), // Get moment's short weekday names.
            monthShortNames: M.monthsShort().slice(),   // Get moment's short month names.
            firstDayOfWeekIndex: 0               // 0 for Sunday, 1 for Monday, etc.
        };

        // The primary callback function to execute on selection confirmation.
        this.onIntervalSelect = () => {};

        // The DOM element where the picker's container will be appended.
        this.containerParent = 'body';

        // The jQuery-wrapped DOM element that initiated this picker.
        this.hostElement = $(hostElement);

        // --- Initialization Logic ---

        // Adjust picker opening direction if the host element has a 'pull-right' class
        // and no explicit 'opens' option was provided.
        if (this.hostElement.hasClass('pull-right') && (!configProvided || !opts.opens)) {
            this.displayDirection = 'left';
        }

        // Attach event listeners to the host element to display the picker.
        if (this.hostElement.is('input')) {
            this.hostElement.on('click focus', $.proxy(this.displayPicker, this)); // Combined events for input fields.
        } else {
            this.hostElement.on('click', $.proxy(this.displayPicker, this));
        }

        // Merge user-provided locale settings with the defaults.
        effectiveLocale = this.localizationStrings;
        if (configProvided && typeof opts.locale === 'object') {
            Object.assign(effectiveLocale, opts.locale); // Use Object.assign for cleaner merging.
        }

        // Apply custom button classes from options.
        if (configProvided) {
            if (opts.confirmBtnClass) {
                this.confirmBtnClass = opts.confirmBtnClass;
            }
            if (opts.abortBtnClass) { // Using the new property name.
                this.abortBtnClass = opts.abortBtnClass;
            }
        }

        // Generate the picker's HTML structure and append it to the determined parent.
        const pickerHtml = this._generatePickerTemplate(); // Delegating HTML generation to a private method.
        this.containerParent = (configProvided && opts.parentEl && $(opts.parentEl)) || $(this.containerParent);
        this.pickerWrapper = $(pickerHtml).appendTo(this.containerParent);

        // Process and apply all configuration options provided by the user.
        if (configProvided) {
            this._parseAndApplyOptions(opts); // Delegating option parsing to a private method.
        }

        // Ensure date intervals are at the start of the day if time selection is not enabled.
        this._normalizeIntervalsForTimePicker();

        // Apply base CSS classes to all buttons within the picker.
        this.actionButtonClasses.forEach(cssClass => {
            this.pickerWrapper.find('button').addClass(cssClass);
        });

        // If the picker is set to open to the left, swap the visual positions of the calendar panes.
        if (this.displayDirection === 'left') {
            const calendarLeft = this.pickerWrapper.find('.calendar-pane.left-pane'); // Using new class names.
            const calendarRight = this.pickerWrapper.find('.calendar-pane.right-pane');
            calendarLeft.removeClass('left-pane').addClass('right-pane');
            calendarRight.removeClass('right-pane').addClass('left-pane');
        }

        // By default, display the calendars and position the picker if no predefined ranges are used.
        if (!configProvided || !opts.ranges) {
            this.pickerWrapper.find('.calendar-pane').show();
            this.positionPicker();
        }

        // Assign the user-provided selection callback function.
        if (typeof selectionHandler === 'function') {
            this.onIntervalSelect = selectionHandler;
        }

        // Add a class to the picker wrapper to indicate its display orientation.
        this.pickerWrapper.addClass('opens-' + this.displayDirection); // Changed class naming.

        // Attempt to initialize start/end dates from the host input element's value,
        // but only if dates weren't explicitly set in the options.
        this._tryParseInitialInputDates(configProvided, opts);

        // Store the initial state of the selected intervals for comparison on hide.
        this.prevStartInterval = this.startInterval.clone();
        this.prevEndInterval = this.endInterval.clone();

        // Initialize state objects for the left and right calendar panes.
        this.leftCalendarState = {
            currentMonth: M([this.startInterval.year(), this.startInterval.month(), 1, this.startInterval.hour(), this.startInterval.minute()]),
            dateGrid: [] // Will store Moment.js objects for each day in the rendered grid.
        };

        this.rightCalendarState = {
            currentMonth: M([this.endInterval.year(), this.endInterval.month(), 1, this.endInterval.hour(), this.endInterval.minute()]),
            dateGrid: []
        };

        // Set up all event listeners for the picker's internal elements.
        this._setupPickerEventListeners();

        // Perform initial UI updates and render the calendars.
        this.refreshDisplay();
        this._updateCalendarViews();
    };

    // --- IntervalSelector Prototype Methods ---
    IntervalSelector.prototype = {

        constructor: IntervalSelector, // Explicitly set constructor reference.

        /**
         * Prevents event propagation for mousedown events occurring within the picker.
         * This is crucial for preventing the document-wide mousedown listener (which hides the picker)
         * from being triggered when interacting with picker elements.
         * @param {Event} evt - The mousedown event object.
         * @private
         */
        handleMouseDown: function (evt) {
            evt.stopPropagation();
        },

        /**
         * Generates the HTML template string for the entire picker UI.
         * This method centralizes the picker's structure for easier modification.
         * @returns {string} The complete HTML string for the picker wrapper.
         * @private
         */
        _generatePickerTemplate: function () {
            // Using an array of strings and then joining them is often more readable
            // for complex HTML templates than a single concatenated string.
            const templateParts = [
                '<div class="interval-selector dropdown-menu">', // Main wrapper class changed.
                '  <div class="calendar-pane left-pane"></div>', // Calendar pane classes changed.
                '  <div class="calendar-pane right-pane"></div>',
                '  <div class="selection-controls">', // Renamed class for range/button section.
                '    <div class="interval-inputs-group">', // Renamed class for date inputs.
                '      <div class="start-date-input-wrap">', // Renamed class.
                '        <label for="interval_start_input">' + this.localizationStrings.fromTxt + '</label>',
                '        <input class="mini-input form-control" type="text" name="interval_start_input" value="" disabled />', // Added form-control, changed name.
                '      </div>',
                '      <div class="end-date-input-wrap">', // Renamed class.
                '        <label for="interval_end_input">' + this.localizationStrings.toTxt + '</label>',
                '        <input class="mini-input form-control" type="text" name="interval_end_input" value="" disabled />', // Added form-control, changed name.
                '      </div>',
                '      <button class="' + this.confirmBtnClass + ' confirm-selection-btn" disabled>' + this.localizationStrings.confirmLabel + '</button>', // Renamed button class.
                '      <button class="' + this.abortBtnClass + ' cancel-selection-btn">' + this.localizationStrings.abortLabel + '</button>', // Renamed button class.
                '    </div>',
                '  </div>',
                '</div>'
            ];
            return templateParts.join('\n');
        },

        /**
         * Parses and applies all configurable options provided during instantiation.
         * This method centralizes option processing, handling various data types and validations.
         * @param {Object} opts - The options object passed to the constructor.
         * @private
         */
        _parseAndApplyOptions: function (opts) {
            // Helper function to robustly parse date values into Moment.js objects.
            const parseMomentDate = (dateValue, formatPattern) => {
                if (dateValue instanceof M) { // Already a Moment.js object.
                    return dateValue.clone(); // Clone to prevent direct mutation.
                } else if (typeof dateValue === 'string') {
                    return M(dateValue, formatPattern);
                } else if (typeof dateValue === 'object' && dateValue !== null) { // Generic Date object or similar.
                    return M(dateValue);
                }
                return null; // Return null for unparseable values.
            };

            // Apply string-based options.
            if (typeof opts.dateFormatPattern === 'string') this.dateFormatPattern = opts.dateFormatPattern;
            if (typeof opts.dateSeparator === 'string') this.dateSeparator = opts.dateSeparator;
            if (typeof opts.displayDirection === 'string') this.displayDirection = opts.displayDirection;

            // Apply date-related options (start, end, min, max).
            const dateOptionMap = {
                startDate: 'startInterval',
                endDate: 'endInterval',
                minDate: 'earliestPossible',
                maxDate: 'latestPossible'
            };
            for (const optKey in dateOptionMap) {
                if (opts.hasOwnProperty(optKey) && opts[optKey]) {
                    const parsedDate = parseMomentDate(opts[optKey], this.dateFormatPattern);
                    if (parsedDate && parsedDate.isValid()) {
                         this[dateOptionMap[optKey]] = parsedDate;
                    } else {
                        console.warn(`IntervalSelector: Invalid date provided for option "${optKey}".`);
                    }
                }
            }

            // Process predefined date ranges.
            if (typeof opts.ranges === 'object' && opts.ranges !== null) {
                for (const rangeLabel in opts.ranges) {
                    if (!opts.ranges.hasOwnProperty(rangeLabel)) continue; // Skip inherited properties.

                    let rangeStart = parseMomentDate(opts.ranges[rangeLabel][0]);
                    let rangeEnd = parseMomentDate(opts.ranges[rangeLabel][1]);

                    // Validate parsed range moments.
                    if (!rangeStart || !rangeEnd || !rangeStart.isValid() || !rangeEnd.isValid()) {
                        console.warn(`IntervalSelector: Invalid range definition for key "${rangeLabel}". Skipping.`);
                        continue;
                    }

                    // Bound the range by global min/max dates if they are set.
                    if (this.earliestPossible && rangeStart.isBefore(this.earliestPossible)) {
                        rangeStart = this.earliestPossible.clone();
                    }
                    if (this.latestPossible && rangeEnd.isAfter(this.latestPossible)) {
                        rangeEnd = this.latestPossible.clone();
                    }

                    // Only include the range if it's still valid after bounding (i.e., not completely outside min/max).
                    if (!(this.earliestPossible && rangeEnd.isBefore(this.earliestPossible)) &&
                        !(this.latestPossible && rangeStart.isAfter(this.latestPossible))) {
                        this.predefinedIntervals[rangeLabel] = [rangeStart, rangeEnd];
                    }
                }

                // Dynamically generate the HTML list for predefined ranges.
                const rangeItemsHtml = Object.keys(this.predefinedIntervals)
                                             .map(key => `<li>${key}</li>`)
                                             .join('');
                const fullRangeListHtml = `<ul>${rangeItemsHtml}<li>${this.localizationStrings.customRangeTxt}</li></ul>`;
                this.pickerWrapper.find('.selection-controls').prepend(fullRangeListHtml); // Append to the controls section.
            }

            // Apply date limit (duration) option.
            if (typeof opts.limitInterval === 'object') this.limitInterval = opts.limitInterval;

            // Update weekday order based on `firstDayOfWeekIndex` in locale options.
            if (typeof opts.locale === 'object' && typeof opts.locale.firstDayOfWeekIndex === 'number') {
                this.localizationStrings.firstDayOfWeekIndex = opts.locale.firstDayOfWeekIndex;
                let shiftCount = opts.locale.firstDayOfWeekIndex;
                while (shiftCount > 0) {
                    this.localizationStrings.weekDayShortNames.push(this.localizationStrings.weekDayShortNames.shift());
                    shiftCount--;
                }
            }

            // Apply boolean options, using ternary operator for concise assignment.
            this.displayWeekNumbers = typeof opts.displayWeekNumbers === 'boolean' ? opts.displayWeekNumbers : this.displayWeekNumbers;
            this.displayDropdowns = typeof opts.displayDropdowns === 'boolean' ? opts.displayDropdowns : this.displayDropdowns;
            this.enableTimeSelection = typeof opts.enableTimeSelection === 'boolean' ? opts.enableTimeSelection : this.enableTimeSelection;
            this.use12HourFormat = typeof opts.use12HourFormat === 'boolean' ? opts.use12HourFormat : this.use12HourFormat;

            // Apply numeric options.
            if (typeof opts.timeStepMinutes === 'number') this.timeStepMinutes = opts.timeStepMinutes;

            // Apply action button classes (can be a string or an array).
            if (typeof opts.actionButtonClasses === 'string') {
                this.actionButtonClasses = [opts.actionButtonClasses];
            } else if (Array.isArray(opts.actionButtonClasses)) {
                this.actionButtonClasses = opts.actionButtonClasses;
            }
        },

        /**
         * Normalizes the start and end intervals to the beginning of the day
         * if time selection is not enabled. This ensures consistency for date-only selections.
         * @private
         */
        _normalizeIntervalsForTimePicker: function () {
            if (!this.enableTimeSelection) {
                this.startInterval = this.startInterval.startOf('day');
                this.endInterval = this.endInterval.startOf('day');
            }
        },

        /**
         * Attempts to parse initial start and end dates from the host input element's value.
         * This is typically done when the picker is initialized without explicit start/end date options.
         * @param {boolean} configProvided - Indicates if the `opts` object was passed to the constructor.
         * @param {Object} opts - The configuration options object.
         * @private
         */
        _tryParseInitialInputDates: function (configProvided, opts) {
            // Check if explicit start/end dates were provided in options.
            const hasExplicitDates = (configProvided && (opts.startDate || opts.endDate));

            // Proceed only if no explicit dates were given and the host element is a text input.
            if (!hasExplicitDates && this.hostElement.is('input[type=text]')) {
                const inputValue = this.hostElement.val();
                if (!inputValue) return; // Exit if input is empty.

                const dateParts = inputValue.split(this.dateSeparator);
                let potentialStart, potentialEnd;

                if (dateParts.length === 2) {
                    potentialStart = M(dateParts[0], this.dateFormatPattern);
                    potentialEnd = M(dateParts[1], this.dateFormatPattern);
                } else if (dateParts.length === 1) {
                    // If only one date part is found, assume it's both start and end for a single-day selection.
                    potentialStart = M(dateParts[0], this.dateFormatPattern);
                    potentialEnd = potentialStart.clone();
                } else {
                    return; // Invalid number of date parts.
                }

                // Validate the parsed dates.
                if (potentialStart && potentialEnd && potentialStart.isValid() && potentialEnd.isValid()) {
                    // Basic sanity check: end date should not precede start date.
                    if (potentialEnd.isBefore(potentialStart)) {
                        console.warn("IntervalSelector: Initial input dates are invalid (end date before start). Using default interval.");
                        return;
                    }
                    this.startInterval = potentialStart;
                    this.endInterval = potentialEnd;
                } else {
                    console.warn("IntervalSelector: Could not parse initial input dates. Using default interval.");
                }
            }
        },

        /**
         * Centralized method to set up all event listeners for the picker's UI elements.
         * This improves organization and makes it easier to manage event bindings.
         * @private
         */
        _setupPickerEventListeners: function () {
            // Prevent mousedown events within the picker from propagating to the document.
            this.pickerWrapper.on('mousedown', $.proxy(this.handleMouseDown, this));

            // Calendar navigation buttons (Previous/Next month).
            this.pickerWrapper.find('.calendar-pane').on('click', '.prev', $.proxy(this.handlePrevMonthClick, this));
            this.pickerWrapper.find('.calendar-pane').on('click', '.next', $.proxy(this.handleNextMonthClick, this));

            // Action buttons (Apply/Cancel).
            this.pickerWrapper.find('.selection-controls').on('click', '.confirm-selection-btn', $.proxy(this.handleApplyClick, this));
            this.pickerWrapper.find('.selection-controls').on('click', '.cancel-selection-btn', $.proxy(this.handleCancelClick, this));

            // Clicking on the internal date input fields should reveal calendars if they are hidden.
            this.pickerWrapper.find('.selection-controls').on('click', '.start-date-input-wrap, .end-date-input-wrap', $.proxy(this.revealCalendars, this));

            // Interactions with individual date cells in the calendars.
            this.pickerWrapper.find('.calendar-pane').on('click', 'td.available', $.proxy(this.handleDateClick, this));
            this.pickerWrapper.find('.calendar-pane').on('mouseenter', 'td.available', $.proxy(this.handleDateHover, this));
            this.pickerWrapper.find('.calendar-pane').on('mouseleave', 'td.available', $.proxy(this.refreshDisplay, this));

            // Interactions with predefined range list items.
            this.pickerWrapper.find('.selection-controls').on('click', 'li', $.proxy(this.handleRangeClick, this));
            this.pickerWrapper.find('.selection-controls').on('mouseenter', 'li', $.proxy(this.handleRangeHover, this));
            this.pickerWrapper.find('.selection-controls').on('mouseleave', 'li', $.proxy(this.refreshDisplay, this));

            // Dropdown selectors for changing month/year and time.
            this.pickerWrapper.find('.calendar-pane').on('change', 'select.yearselect, select.monthselect', $.proxy(this.adjustMonthYear, this));
            this.pickerWrapper.find('.calendar-pane').on('change', 'select.hourselect, select.minuteselect, select.ampmselect', $.proxy(this.adjustTime, this));

            // Monitor keyup events on the host input element to synchronize internal state.
            this.hostElement.on('keyup', $.proxy(this.syncFromInput, this));
        },

        /**
         * Refreshes the visual display of the picker. This includes updating the internal
         * date input fields and enabling/disabling the 'Apply' button based on selection validity.
         * This method was previously named `updateView`.
         */
        refreshDisplay: function () {
            // Update the Moment.js objects that represent the current month/year for each calendar pane.
            this.leftCalendarState.currentMonth.month(this.startInterval.month()).year(this.startInterval.year());
            this.rightCalendarState.currentMonth.month(this.endInterval.month()).year(this.endInterval.year());

            // Update the text in the picker's internal input fields.
            const startInput = this.pickerWrapper.find('input[name=interval_start_input]');
            const endInput = this.pickerWrapper.find('input[name=interval_end_input]');

            startInput.val(this.startInterval.format(this.dateFormatPattern));
            endInput.val(this.endInterval.format(this.dateFormatPattern));

            // Determine if the current date selection is valid (start <= end) and enable/disable the 'Apply' button accordingly.
            const isSelectionValid = this.startInterval.isValid() && this.endInterval.isValid() &&
                                     (this.startInterval.isSameOrBefore(this.endInterval));
            this.pickerWrapper.find('.confirm-selection-btn').prop('disabled', !isSelectionValid);
        },

        /**
         * Synchronizes the picker's internal `startInterval` and `endInterval` properties
         * with the value from the host input element. This is typically triggered by `keyup` events.
         * This method was previously named `updateFromControl`.
         */
        syncFromInput: function () {
            // Only proceed if the host element is an input field and has a value.
            if (!this.hostElement.is('input')) return;
            const inputValue = this.hostElement.val();
            if (!inputValue || inputValue.length === 0) return;

            const dateParts = inputValue.split(this.dateSeparator);
            // Ensure both start and end date parts are present in the input value.
            if (dateParts.length < 2) return;

            const potentialStart = M(dateParts[0], this.dateFormatPattern);
            const potentialEnd = M(dateParts[1], this.dateFormatPattern);

            // Validate the parsed dates for validity and correct order.
            if (!potentialStart.isValid() || !potentialEnd.isValid() || potentialEnd.isBefore(potentialStart)) {
                return; // If invalid, do not update the internal state.
            }

            // Only update the internal state and trigger events if the dates have actually changed.
            if (!this.startInterval.isSame(potentialStart) || !this.endInterval.isSame(potentialEnd)) {
                this.startInterval = potentialStart;
                this.endInterval = potentialEnd;

                this.triggerSelectionEvent(); // Notify any registered callbacks.
                this._updateCalendarViews(); // Refresh the calendar display to reflect new dates.
            }
        },

        /**
         * Triggers the `onIntervalSelect` callback function with the current `startInterval`
         * and `endInterval`. Also ensures the picker's display is refreshed.
         * This method was previously named `notify`.
         */
        triggerSelectionEvent: function () {
            this.refreshDisplay();
            this.onIntervalSelect(this.startInterval, this.endInterval);
        },

        /**
         * Dynamically positions the picker wrapper (`pickerWrapper`) relative to its
         * host element (`hostElement`), taking into account the `displayDirection`
         * and screen boundaries.
         * This method was previously named `move`.
         */
        positionPicker: function () {
            const parentOffset = {
                top: this.containerParent.offset().top - (this.containerParent.is('body') ? 0 : this.containerParent.scrollTop()),
                left: this.containerParent.offset().left - (this.containerParent.is('body') ? 0 : this.containerParent.scrollLeft())
            };

            const hostElementOffset = this.hostElement.offset();
            const hostElementHeight = this.hostElement.outerHeight();
            const pickerWrapperWidth = this.pickerWrapper.outerWidth();
            const windowWidth = $(window).width();

            let pickerCss = {
                top: hostElementOffset.top + hostElementHeight - parentOffset.top,
                right: 'auto', // Reset right property.
                left: 'auto'   // Reset left property.
            };

            if (this.displayDirection === 'left') {
                pickerCss.right = windowWidth - hostElementOffset.left - this.hostElement.outerWidth() - parentOffset.left;
                // If opening left would make the picker go off the left edge, adjust to open right.
                if (hostElementOffset.left - pickerWrapperWidth < 0) {
                    pickerCss.left = 9; // A small fixed left margin.
                    pickerCss.right = 'auto';
                }
            } else { // Default to 'right'.
                pickerCss.left = hostElementOffset.left - parentOffset.left;
                // If opening right would make the picker go off the right edge, adjust to open left.
                if (hostElementOffset.left + pickerWrapperWidth > windowWidth) {
                    pickerCss.right = 0; // Align to the right edge of the window.
                    pickerCss.left = 'auto';
                }
            }
            this.pickerWrapper.css(pickerCss);
        },

        /**
         * Displays the picker UI, positions it, updates calendars, and sets up
         * a document-wide listener to hide it on outside clicks.
         * This method was previously named `show`.
         * @param {Event} [evt] - The event object that triggered the display (optional).
         */
        displayPicker: function (evt) {
            // Prevent showing the picker if it's already visible.
            if (this.pickerWrapper.is(':visible')) {
                return;
            }

            this.pickerWrapper.show(); // Make the picker visible.
            this.positionPicker();     // Position it correctly.
            this._updateCalendarViews(); // Ensure calendars are rendered with current state.

            if (evt) {
                evt.stopPropagation(); // Stop event bubbling.
                evt.preventDefault();  // Prevent default action (e.g., form submission).
            }

            // Bind a global mousedown listener to hide the picker when clicking outside.
            // Using a namespaced event (`.intervalselector`) for easier unbinding.
            $(document).on('mousedown.intervalselector', $.proxy(this.concealPicker, this));
            // Trigger a custom event on the host element when the picker is shown.
            this.hostElement.trigger('picker:shown', { target: evt ? evt.target : null, instance: this });
        },

        /**
         * Hides the picker UI, cleans up the document-wide event listener,
         * and triggers a selection event if the dates have changed.
         * This method was previously named `hide`.
         * @param {Event} [evt] - The event object that triggered the hide (optional).
         */
        concealPicker: function (evt) {
            // If the event originated from within the picker itself, do not hide it.
            if (evt && $(evt.target).closest('.interval-selector').length) {
                return;
            }

            // Prevent hiding if the picker is already hidden.
            if (!this.pickerWrapper.is(':visible')) {
                return;
            }

            this.pickerWrapper.hide(); // Hide the picker.

            // Check if the current selection differs from the state when the picker was last shown.
            if (!this.startInterval.isSame(this.prevStartInterval) || !this.endInterval.isSame(this.prevEndInterval)) {
                this.triggerSelectionEvent(); // If changed, trigger the selection callback.
            }

            // Update the stored previous intervals to the current selection.
            this.prevStartInterval = this.startInterval.clone();
            this.prevEndInterval = this.endInterval.clone();

            // Unbind the specific namespaced document mousedown listener.
            $(document).off('mousedown.intervalselector', this.concealPicker);
            // Trigger a custom event on the host element when the picker is hidden.
            this.hostElement.trigger('picker:hidden', { instance: this });
        },

        /**
         * Handles the `mouseenter` event on predefined range list items.
         * This updates the temporary input fields in the picker to show the dates of the hovered range,
         * without actually selecting them.
         * This method was previously named `enterRange`.
         * @param {Event} evt - The mouseenter event object.
         */
        handleRangeHover: function (evt) {
            const rangeLabel = evt.target.innerHTML;
            if (rangeLabel === this.localizationStrings.customRangeTxt) {
                this.refreshDisplay(); // If "Custom Range" is hovered, revert inputs to current selection.
            } else {
                const dates = this.predefinedIntervals[rangeLabel];
                if (dates) { // Ensure dates exist for the hovered label.
                    this.pickerWrapper.find('input[name=interval_start_input]').val(dates[0].format(this.dateFormatPattern));
                    this.pickerWrapper.find('input[name=interval_end_input]').val(dates[1].format(this.dateFormatPattern));
                }
            }
        },

        /**
         * Makes the calendar panes visible and ensures the picker is correctly positioned.
         * Also triggers a calendar view update to ensure fresh rendering.
         * This method was previously named `showCalendars`.
         */
        revealCalendars: function () {
            this.pickerWrapper.find('.calendar-pane').show(); // Show the calendar panes.
            this.positionPicker(); // Reposition the picker.
            this._updateCalendarViews(); // Refresh the calendar content.
        },

        /**
         * Updates the value of the external host input element with the currently selected
         * `startInterval` and `endInterval`, formatted according to `dateFormatPattern`
         * and `dateSeparator`.
         * This method was previously named `updateInputText`.
         */
        updateAssociatedInput: function () {
            if (this.hostElement.is('input')) { // Only update if the host element is an input.
                const formattedStart = this.startInterval.format(this.dateFormatPattern);
                const formattedEnd = this.endInterval.format(this.dateFormatPattern);
                this.hostElement.val(formattedStart + this.dateSeparator + formattedEnd);
            }
        },

        /**
         * Handles a click event on a predefined range list item.
         * If 'Custom Period' is clicked, it reveals the calendars. Otherwise, it
         * sets the `startInterval` and `endInterval` to the dates of the selected range,
         * updates the UI, and hides the picker.
         * This method was previously named `clickRange`.
         * @param {Event} evt - The click event object.
         */
        handleRangeClick: function (evt) {
            const rangeLabel = evt.target.innerHTML;
            if (rangeLabel === this.localizationStrings.customRangeTxt) {
                this.revealCalendars(); // Show calendars for manual selection.
            } else {
                const dates = this.predefinedIntervals[rangeLabel];
                if (!dates) {
                    console.warn(`IntervalSelector: No dates found for predefined range "${rangeLabel}".`);
                    return;
                }

                // Update internal interval states, cloning moments to prevent shared references.
                this.startInterval = dates[0].clone();
                this.endInterval = dates[1].clone();

                this._normalizeIntervalsForTimePicker(); // Apply startOf('day') if time picker is off.

                // Update the calendar states to reflect the new selection's months/years.
                this.leftCalendarState.currentMonth = this.startInterval.clone().startOf('month'); // Simplified assignment.
                this.rightCalendarState.currentMonth = this.endInterval.clone().startOf('month');
                this._updateCalendarViews(); // Re-render calendars.

                this.updateAssociatedInput(); // Update the host input field.
                this.concealPicker(); // Hide the picker.
            }
        },

        /**
         * Handles a click event on the 'Previous Month' navigation button for either calendar pane.
         * It decrements the month of the corresponding calendar state and re-renders calendars.
         * This method was previously named `clickPrev`.
         * @param {Event} evt - The click event object.
         */
        handlePrevMonthClick: function (evt) {
            const clickedCalendarPane = $(evt.target).parents('.calendar-pane');
            // Check if the button is disabled before proceeding.
            if ($(evt.target).hasClass('disabled')) return;

            if (clickedCalendarPane.hasClass('left-pane')) {
                this.leftCalendarState.currentMonth.subtract(1, 'month');
            } else {
                this.rightCalendarState.currentMonth.subtract(1, 'month');
            }
            this._updateCalendarViews(); // Re-render calendars.
        },

        /**
         * Handles a click event on the 'Next Month' navigation button for either calendar pane.
         * It increments the month of the corresponding calendar state and re-renders calendars.
         * This method was previously named `clickNext`.
         * @param {Event} evt - The click event object.
         */
        handleNextMonthClick: function (evt) {
            const clickedCalendarPane = $(evt.target).parents('.calendar-pane');
            // Check if the button is disabled before proceeding.
            if ($(evt.target).hasClass('disabled')) return;

            if (clickedCalendarPane.hasClass('left-pane')) {
                this.leftCalendarState.currentMonth.add(1, 'month');
            } else {
                this.rightCalendarState.currentMonth.add(1, 'month');
            }
            this._updateCalendarViews(); // Re-render calendars.
        },

        /**
         * Handles the `mouseenter` event on an individual date cell within a calendar.
         * It temporarily updates the picker's internal date input fields to show the hovered date,
         * providing visual feedback without actually changing the selected interval.
         * This method was previously named `enterDate`.
         * @param {Event} evt - The mouseenter event object.
         */
        handleDateHover: function (evt) {
            const dateCell = $(evt.target);
            const dateTitle = dateCell.attr('data-title');
            if (!dateTitle) return; // Guard for cells without a data-title.

            const [row, col] = dateTitle.split(':').map(Number); // Assuming 'row:col' format for data-title.
            const hoveredCalendarPane = dateCell.parents('.calendar-pane');

            let hoveredMoment;
            if (hoveredCalendarPane.hasClass('left-pane')) {
                hoveredMoment = this.leftCalendarState.dateGrid[row][col];
                this.pickerWrapper.find('input[name=interval_start_input]').val(hoveredMoment.format(this.dateFormatPattern));
            } else {
                hoveredMoment = this.rightCalendarState.dateGrid[row][col];
                this.pickerWrapper.find('input[name=interval_end_input]').val(hoveredMoment.format(this.dateFormatPattern));
            }
        },

        /**
         * Handles a click event on an individual date cell within a calendar.
         * This method updates either the `startInterval` or `endInterval` based on the current selection state.
         * It also enforces `limitInterval` and then refreshes the calendar views and display.
         * This method was previously named `clickDate`.
         * @param {Event} evt - The click event object.
         */
        handleDateClick: function (evt) {
            const dateCell = $(evt.target);
            if (dateCell.hasClass('disabled')) return; // Do not select disabled dates.

            const dateTitle = dateCell.attr('data-title');
            if (!dateTitle) return;

            const [row, col] = dateTitle.split(':').map(Number);
            const clickedCalendarPane = dateCell.parents('.calendar-pane');

            let selectedMoment;
            if (clickedCalendarPane.hasClass('left-pane')) {
                selectedMoment = this.leftCalendarState.dateGrid[row][col].clone();
            } else {
                selectedMoment = this.rightCalendarState.dateGrid[row][col].clone();
            }

            // Logic to determine if we're setting the start or end date.
            // If the current selection is a single day, or the clicked date is before the current start,
            // or if it's the same day as start (and time picker is off), treat as new start.
            if (this.startInterval.isSame(this.endInterval, 'day') ||
                selectedMoment.isBefore(this.startInterval) ||
                (this.startInterval.isSame(selectedMoment, 'day') && !this.enableTimeSelection)) {
                this.startInterval = selectedMoment;
                this.endInterval = selectedMoment.clone(); // Reset end to be same as new start.
            } else {
                // Otherwise, assume we are setting the end date.
                this.endInterval = selectedMoment;
            }

            // Enforce the maximum interval duration if `limitInterval` is set.
            if (this.limitInterval && this.endInterval.diff(this.startInterval, 'days') > this.limitInterval.asDays()) {
                this.endInterval = this.startInterval.clone().add(this.limitInterval);
            }

            this._normalizeIntervalsForTimePicker(); // Ensure times are correct if time picker is off.
            this._updateCalendarViews(); // Re-render calendars to show new selection.
            this.refreshDisplay();       // Update input fields and button state.
        },

        /**
         * Updates the month and/or year of a calendar pane based on selections from
         * the month and year dropdowns.
         * This method was previously named `updateMonthYear`.
         * @param {Event} evt - The change event from the dropdown.
         */
        adjustMonthYear: function (evt) {
            const targetSelect = $(evt.target);
            const calendarPane = targetSelect.parents('.calendar-pane');
            const isLeftPane = calendarPane.hasClass('left-pane');
            const calendarState = isLeftPane ? this.leftCalendarState : this.rightCalendarState;

            if (targetSelect.hasClass('monthselect')) {
                calendarState.currentMonth.month(parseInt(targetSelect.val(), 10));
            } else if (targetSelect.hasClass('yearselect')) {
                calendarState.currentMonth.year(parseInt(targetSelect.val(), 10));
            }

            this._updateCalendarViews(); // Re-render calendars with the new month/year.
        },

        /**
         * Updates the time components (hour, minute, AM/PM) of the selected interval
         * based on selections from the time picker dropdowns.
         * This method was previously named `updateTime`.
         * @param {Event} evt - The change event from the dropdown.
         */
        adjustTime: function (evt) {
            if (!this.enableTimeSelection) return; // Only proceed if time selection is enabled.

            const targetSelect = $(evt.target);
            const calendarPane = targetSelect.parents('.calendar-pane');
            const isLeftPane = calendarPane.hasClass('left-pane');

            let currentInterval = isLeftPane ? this.startInterval : this.endInterval;

            if (targetSelect.hasClass('hourselect')) {
                let newHour = parseInt(targetSelect.val(), 10);
                if (this.use12HourFormat) {
                    const ampmSelect = calendarPane.find('.ampmselect');
                    if (ampmSelect.val() === 'PM' && newHour < 12) newHour += 12; // Convert 12-hour PM to 24-hour.
                    if (ampmSelect.val() === 'AM' && newHour === 12) newHour = 0; // Convert 12 AM to 0 (midnight).
                }
                currentInterval.hour(newHour);
            } else if (targetSelect.hasClass('minuteselect')) {
                currentInterval.minute(parseInt(targetSelect.val(), 10));
            } else if (targetSelect.hasClass('ampmselect')) {
                let currentHour = currentInterval.hour();
                if (targetSelect.val() === 'PM' && currentHour < 12) currentHour += 12;
                if (targetSelect.val() === 'AM' && currentHour >= 12) currentHour -= 12;
                currentInterval.hour(currentHour);
            }

            // If start and end dates are the same day, synchronize their times.
            if (this.startInterval.isSame(this.endInterval, 'day')) {
                if (isLeftPane) {
                    this.endInterval.hour(this.startInterval.hour()).minute(this.startInterval.minute());
                } else {
                    this.startInterval.hour(this.endInterval.hour()).minute(this.endInterval.minute());
                }
            }

            this.refreshDisplay();        // Update input fields.
            this._updateCalendarViews(); // Re-render calendars for updated time display.
        },

        /**
         * Handles the click event for the 'Apply Selection' button.
         * This confirms the current selection, updates the host input, and hides the picker.
         * This method was previously named `clickApply`.
         */
        handleApplyClick: function () {
            this.updateAssociatedInput(); // Update the external host input field.
            this.concealPicker();         // Hide the picker.
        },

        /**
         * Handles the click event for the 'Cancel' button.
         * This reverts the current selection to the state it was in when the picker was opened
         * and then hides the picker without triggering a selection event.
         * This method was previously named `clickCancel`.
         */
        handleCancelClick: function () {
            // Revert the current selection to the previously stored state.
            this.startInterval = this.prevStartInterval.clone();
            this.endInterval = this.prevEndInterval.clone();
            this.concealPicker(); // Hide the picker. No selection event is triggered on cancel.
        },

        /**
         * Orchestrates the rendering of both the left and right calendar panes.
         * It calls `_renderCalendar` for each pane and then performs additional
         * synchronization for navigation buttons.
         * This method was previously named `updateCalendars`.
         * @private
         */
        _updateCalendarViews: function () {
            this._renderCalendar(this.leftCalendarState, 'left-pane');
            this._renderCalendar(this.rightCalendarState, 'right-pane');

            this._syncCalendarNavigation(); // Adjust prev/next button states between calendars.
            this.refreshDisplay(); // Ensure inputs and buttons reflect the newly rendered calendars.
        },

        /**
         * Renders a single calendar pane (left or right) based on its state object.
         * This involves generating the month/year dropdowns, weekday headers, date grid,
         * and optionally time picker controls.
         * @param {Object} calendarState - The state object for the calendar being rendered
         *                                (e.g., `this.leftCalendarState`).
         * @param {string} paneClass - The CSS class string identifying the target calendar pane
         *                             (e.g., 'left-pane', 'right-pane').
         * @private
         */
        _renderCalendar: function (calendarState, paneClass) {
            const targetPane = this.pickerWrapper.find(`.${paneClass}`);
            const currentMonthMoment = calendarState.currentMonth;

            // Generate HTML for month and year dropdowns.
            const yearOptions = this._generateYearOptions(currentMonthMoment.year());
            const monthOptions = this._generateMonthOptions(currentMonthMoment.month());
            const monthYearDropdownsHtml = `
                <div class="calendar-header">
                    <div class="nav-button prev"></div> <!-- Changed class name -->
                    <select class="monthselect">${monthOptions}</select>
                    <select class="yearselect">${yearOptions}</select>
                    <div class="nav-button next"></div> <!-- Changed class name -->
                </div>
            `;

            // Generate week number header if enabled.
            let weekNumberHeader = '';
            if (this.displayWeekNumbers) {
                weekNumberHeader = `<th>${this.localizationStrings.weekSymbol}</th>`;
            }

            // Generate weekday names header, adjusting order based on `firstDayOfWeekIndex`.
            const dayNamesHeader = this.localizationStrings.weekDayShortNames.map(day => `<th>${day}</th>`).join('');

            // --- Generate the main date grid (table cells) ---
            let dateCellsHtml = '';
            calendarState.dateGrid = []; // Reset the date grid for the new month.

            // Determine the starting day for the calendar grid, which might be in the previous month.
            const firstDayOfMonth = currentMonthMoment.clone().startOf('month').day();
            const startDayOffset = (firstDayOfMonth - this.localizationStrings.firstDayOfWeekIndex + 7) % 7;
            let dayIterator = M(currentMonthMoment).startOf('month').subtract(startDayOffset, 'days');

            for (let week = 0; week < 6; week++) { // Render 6 weeks to ensure full month display.
                let weekRowHtml = '<tr>';
                let weekDatesArray = [];

                if (this.displayWeekNumbers) {
                    weekRowHtml += `<td class="week-number">${dayIterator.week()}</td>`;
                }

                for (let day = 0; day < 7; day++) {
                    const isOtherMonth = dayIterator.month() !== currentMonthMoment.month();
                    const isBeforeMin = this.earliestPossible && dayIterator.isBefore(this.earliestPossible, 'day');
                    const isAfterMax = this.latestPossible && dayIterator.isAfter(this.latestPossible, 'day');
                    const isDisabled = isBeforeMin || isAfterMax;

                    // Determine if the current day falls within the selected interval.
                    const isSelected = (dayIterator.isSame(this.startInterval, 'day') || dayIterator.isSame(this.endInterval, 'day')) ||
                                       (dayIterator.isAfter(this.startInterval, 'day') && dayIterator.isBefore(this.endInterval, 'day'));

                    let cellClasses = ['day'];
                    if (isOtherMonth) cellClasses.push('off-month'); // Changed class name.
                    if (isDisabled) cellClasses.push('disabled');
                    else cellClasses.push('available'); // Only 'available' if not disabled.
                    if (isSelected) cellClasses.push('selected-range'); // Changed class name.
                    if (dayIterator.isSame(M(), 'day')) cellClasses.push('current-day'); // Changed class name.

                    // Store the moment object for this day in the grid for later access (e.g., click events).
                    weekDatesArray.push(dayIterator.clone());
                    weekRowHtml += `<td class="${cellClasses.join(' ')}" data-title="${week}:${day}">${dayIterator.date()}</td>`;

                    dayIterator.add(1, 'day'); // Move to the next day.
                }
                weekRowHtml += '</tr>';
                dateCellsHtml += weekRowHtml;
                calendarState.dateGrid.push(weekDatesArray);
            }

            // Generate time picker dropdowns if time selection is enabled.
            let timePickerHtml = '';
            if (this.enableTimeSelection) {
                const currentHour = currentMonthMoment.hour();
                const currentMinute = currentMonthMoment.minute();
                const hoursOptions = this._generateHourOptions(currentHour);
                const minutesOptions = this._generateMinuteOptions(currentMinute);
                const ampmOptions = this._generateAmPmOptions(currentHour);

                timePickerHtml = `
                    <div class="calendar-time-controls">
                        <select class="hourselect">${hoursOptions}</select> :
                        <select class="minuteselect">${minutesOptions}</select>
                        ${this.use12HourFormat ? `<select class="ampmselect">${amppmOptions}</select>` : ''}
                    </div>
                `;
            }

            // Assemble the final HTML for the calendar pane.
            targetPane.html(`
                ${monthYearDropdownsHtml}
                <table class="calendar-grid-table"> <!-- Changed class name -->
                    <thead>
                        <tr>
                            ${weekNumberHeader}
                            ${dayNamesHeader}
                        </tr>
                    </thead>
                    <tbody>
                        ${dateCellsHtml}
                    </tbody>
                </table>
                ${timePickerHtml}
            `);

            // Disable prev/next buttons based on global min/max dates.
            const prevButton = targetPane.find('.prev');
            const nextButton = targetPane.find('.next');

            if (this.earliestPossible && currentMonthMoment.clone().startOf('month').isSameOrBefore(this.earliestPossible.clone().startOf('month'))) {
                prevButton.addClass('disabled');
            } else {
                prevButton.removeClass('disabled');
            }

            if (this.latestPossible && currentMonthMoment.clone().endOf('month').isSameOrAfter(this.latestPossible.clone().endOf('month'))) {
                nextButton.addClass('disabled');
            } else {
                nextButton.removeClass('disabled');
            }
        },

        /**
         * Generates HTML `<option>` elements for the year dropdown.
         * The range typically spans 50 years before and 50 years after the current year.
         * @param {number} selectedYear - The year that should be marked as `selected`.
         * @returns {string} An HTML string containing all year options.
         * @private
         */
        _generateYearOptions: function (selectedYear) {
            let optionsHtml = '';
            const currentYear = M().year();
            const startYear = currentYear - 50;
            const endYear = currentYear + 50;
            for (let year = startYear; year <= endYear; year++) {
                optionsHtml += `<option value="${year}" ${year === selectedYear ? 'selected' : ''}>${year}</option>`;
            }
            return optionsHtml;
        },

        /**
         * Generates HTML `<option>` elements for the month dropdown.
         * Uses the localized short month names.
         * @param {number} selectedMonthIndex - The 0-indexed month (0-11) that should be `selected`.
         * @returns {string} An HTML string containing all month options.
         * @private
         */
        _generateMonthOptions: function (selectedMonthIndex) {
            return this.localizationStrings.monthShortNames.map((monthName, index) =>
                `<option value="${index}" ${index === selectedMonthIndex ? 'selected' : ''}>${monthName}</option>`
            ).join('');
        },

        /**
         * Generates HTML `<option>` elements for the hour dropdown,
         * supporting both 12-hour and 24-hour formats.
         * @param {number} selectedHour - The 24-hour format hour (0-23) to be `selected`.
         * @returns {string} An HTML string containing all hour options.
         * @private
         */
        _generateHourOptions: function (selectedHour) {
            let optionsHtml = '';
            const startHour = this.use12HourFormat ? 1 : 0;
            const endHour = this.use12HourFormat ? 12 : 23;
            for (let h = startHour; h <= endHour; h++) {
                let displayHour = h;
                let valueHour = h; // Value is always 24-hour for internal consistency.

                if (this.use12HourFormat) {
                    if (h === 12) displayHour = 12; // 12 PM or 12 AM
                    else displayHour = h % 12; // 1-11
                    if (displayHour === 0) displayHour = 12; // Make 0 become 12 AM

                    // Determine if this 12-hour display corresponds to the selected 24-hour.
                    const isSelected = (selectedHour === h) ||
                                       (this.use12HourFormat && selectedHour % 12 === h % 12 && (selectedHour >= 12 === h >= 12));
                    optionsHtml += `<option value="${valueHour}" ${isSelected ? 'selected' : ''}>${displayHour}</option>`;
                } else {
                    optionsHtml += `<option value="${valueHour}" ${valueHour === selectedHour ? 'selected' : ''}>${valueHour.toString().padStart(2, '0')}</option>`;
                }
            }
            return optionsHtml;
        },

        /**
         * Generates HTML `<option>` elements for the minute dropdown,
         * respecting the `timeStepMinutes` configuration.
         * @param {number} selectedMinute - The minute (0-59) to be `selected`.
         * @returns {string} An HTML string containing all minute options.
         * @private
         */
        _generateMinuteOptions: function (selectedMinute) {
            let optionsHtml = '';
            for (let m = 0; m < 60; m += this.timeStepMinutes) {
                optionsHtml += `<option value="${m}" ${m === selectedMinute ? 'selected' : ''}>${M().minute(m).format('mm')}</option>`;
            }
            return optionsHtml;
        },

        /**
         * Generates HTML `<option>` elements for the AM/PM dropdown,
         * only if `use12HourFormat` is true.
         * @param {number} selectedHour - The 24-hour format hour (0-23) to determine AM/PM.
         * @returns {string} An HTML string containing AM/PM options, or an empty string.
         * @private
         */
        _generateAmPmOptions: function (selectedHour) {
            if (!this.use12HourFormat) return '';
            const isPM = selectedHour >= 12;
            return `
                <option value="AM" ${!isPM ? 'selected' : ''}>AM</option>
                <option value="PM" ${isPM ? 'selected' : ''}>PM</option>
            `;
        },

        /**
         * Synchronizes the navigation buttons (prev/next month) between the left and right calendars.
         * This prevents illogical navigation, e.g., the right calendar showing a month before the left.
         * @private
         */
        _syncCalendarNavigation: function () {
            const leftNextButton = this.pickerWrapper.find('.left-pane .next');
            const rightPrevButton = this.pickerWrapper.find('.right-pane .prev');

            // Disable the right calendar's 'prev' button if it would navigate to a month
            // that is the same as or before the left calendar's current month.
            if (this.rightCalendarState.currentMonth.clone().subtract(1, 'month').isBefore(this.leftCalendarState.currentMonth, 'month') ||
                this.rightCalendarState.currentMonth.isSame(this.leftCalendarState.currentMonth, 'month')) {
                rightPrevButton.addClass('disabled');
            } else {
                rightPrevButton.removeClass('disabled');
            }

            // Disable the left calendar's 'next' button if it would navigate to a month
            // that is the same as or after the right calendar's current month.
            if (this.leftCalendarState.currentMonth.clone().add(1, 'month').isAfter(this.rightCalendarState.currentMonth, 'month') ||
                this.leftCalendarState.currentMonth.isSame(this.rightCalendarState.currentMonth, 'month')) {
                leftNextButton.addClass('disabled');
            } else {
                leftNextButton.removeClass('disabled');
            }
        }

    }; // End of IntervalSelector.prototype

    // --- jQuery Plugin Integration ---
    // This allows the IntervalSelector to be initialized and managed as a jQuery plugin.
    $.fn.intervalSelector = function (options, selectionCallback) {
        // Iterate over each selected DOM element.
        return this.each(function () {
            const $this = $(this);
            // Retrieve any existing IntervalSelector instance associated with this element.
            let instance = $this.data('intervalSelector');

            // If no instance exists, create a new one and store it.
            if (!instance) {
                instance = new IntervalSelector(this, options, selectionCallback);
                $this.data('intervalSelector', instance);
            }

            // If the first argument is a string, assume it's a method call on the instance.
            if (typeof options === 'string') {
                if (typeof instance[options] === 'function') {
                    // Call the method, passing any additional arguments.
                    instance[options].apply(instance, Array.prototype.slice.call(arguments, 1));
                } else {
                    console.warn(`IntervalSelector: Method "${options}" does not exist on instance.`);
                }
            }
        });
    };

})(jQuery, moment); // Pass jQuery and moment explicitly to the IIFE.