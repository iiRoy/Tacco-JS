;(function() {
    $.fn.calendarWidget = function(settings) {
        var widgetIdentifier = 'calendarWidget';

        // Locate the widget instance linked to the DOM element
        var widgetInstance = this.data(widgetIdentifier);

        // If no existing instance is found, initialize a new one...
        if (!widgetInstance) {
            // Return the host element for chaining
            return this.each(function() {
                return $(this).data(widgetIdentifier, new calendarControl(this, settings));
            });
        }

        // Otherwise, if a boolean true is passed, return the widget instance; else, return the host element.
        return (settings === true) ? widgetInstance : this;
    };

    // Standard configuration settings
    $.fn.calendarWidget.standardSettings =
    {
        // Visual theme to apply to the calendar. This name should correspond to a stylesheet class, e.g., "cc-styleName".
        styleClass: 'standard',

        // The stacking order (z-index) for the calendar display.
        layerIndex: 1000,

        // The thickness of the panel's frame, in pixels.
        frameThickness: 1,

        // Pixel displacement for the calendar panel relative to its host.
        panelDisplacement: { horiz: 0, vert: 1 },

        // Set to true to keep the calendar perpetually visible.
        // IMPORTANT: If the associated input element is hidden, the calendar will also be concealed.
        alwaysVisible: false,

        // Automatically hide the calendar panel after a date is chosen (only if `alwaysVisible` is false).
        concealOnSelect: true,

        // Enable month selection via clicking the month in the header.
        enableMonthPick: true,

        // Enable year selection via clicking the year in the header.
        enableYearPick: true,

        // The date considered as 'today' for display purposes.
        currentMoment: new Date(),

        // The date initially highlighted upon calendar rendering. Defaults to `currentMoment`.
        chosenDate: null,

        // Unicode characters for the backward and forward navigation arrows in the header. Set to empty string to hide.
        backwardIndicator: '\u25c4',
        forwardIndicator: '\u25ba',

        // An array of specific dates available for user selection.
        // Dates can be single occurrences or repeat annually/monthly using `repeatYear` or `repeatMonth` flags.
        // These flags are `false` by default.
        //
        // Example:
        // availableDates: [
        //     { date: new Date(0, 8, 5), repeatYear: true },
        //     { date: new Date(0, 0, 14), repeatMonth: true, repeatYear: true },
        //     { date: new Date(2013, 0, 24), repeatMonth: true },
        //     { date: new Date(2013, 11, 25) }
        // ]
        availableDates: null,

        // An array of date periods available for user interaction.
        // Ranges can repeat annually by setting `repeatYear: true` (monthly repetition is not supported for ranges).
        //
        // Example:
        // availableDateRanges: [
        //     { start: new Date(2013, 1, 1), end: new Date (2013, 2, 1) },
        //     { start: new Date(2013, 4, 1), end: new Date (2013, 8, 1) },
        //     { start: new Date(2013, 7, 10), end: new Date (2013, 9, 10) },
        //     { start: new Date(0, 8, 10), repeatYear: true },
        //     { start: new Date(0, 9, 1), repeatYear: true }
        // ]
        availableDateRanges: null,

        // Designate specific dates as notable, similar to `availableDates`, supporting `repeatYear` and `repeatMonth`.
        // Each notable date can receive custom styling via `styleClass` and carry arbitrary `info` (JSON-like object)
        // accessible in the `onDateChosen` callback.
        //
        // Example:
        // notableDates: [
        //     {
        //         date: new Date(0, 8, 5),
        //         info: { note: 'Happy Birthday!' },
        //         repeatYear: true,
        //         styleClass: 'special-event'
        //     },
        //     {
        //         date: new Date(2013, 0, 8),
        //         info: { note: 'Monthly meeting' },
        //         repeatMonth: true
        //     }
        // ]
        notableDates: null,

        // An array of month indices (0-11) that are permitted for selection,
        // including via dropdown from the header.
        // Example: [8, 11] (September, December)
        availableMonths : null,

        // An array of specific years permitted for selection. If omitted, defaults to 5 years prior and 5 years subsequent to the current year.
        // Example: [2012, 2013, 2015]
        availableYears: null,

        // An array of permitted days of the week (0=Sunday, 1=Monday, etc.).
        // Example: [0, 2, 4] (Sunday, Tuesday, Thursday)
        availableWeekDays : null,

        // Custom labels for months displayed in the calendar header.
        // Defaults to full month names.
        monthLabels: null,

        // Custom labels for days of the week displayed below the header.
        // Defaults to abbreviated day names.
        weekDayLabels: null,

        // The starting day of the week for the calendar grid (0=Sunday, 1=Monday, etc.).
        weekStartOffset: 0,

        // Function invoked when a user clicks an available date.
        // Arguments passed:
        // hostElement : The DOM input element linked to the date picker.
        // gridCell : The specific calendar cell that was clicked.
        // pickedDate : The Date object corresponding to the clicked cell.
        // customData : Any `info` object attached to notable dates (or `null`).
        onDateChosen: (function(hostElement, gridCell, pickedDate, customData) {
            hostElement.val(pickedDate.toLocaleDateString());
        }),

        // Function invoked when the user hovers over an available date.
        // Receives the same arguments as `onDateChosen`.
        onDateHovered: function(hostElement, gridCell, hoveredDate, customData) {},

        // Function invoked when the calendar panel is about to be shown.
        // Useful for custom display animations.
        onPanelDisplay: function(displayPanel) { displayPanel.show(); },

        // Function invoked when the calendar panel is about to be hidden.
        // Useful for custom concealment animations.
        onPanelConceal: function(displayPanel) { displayPanel.hide(); },

        // The initial date to display when the calendar first renders.
        initialDisplayDate: null
    };

    // Our widget object
    var calendarControl = (function() {
        // Primary constructor for the calendar control. Initializes the widget.
        function calendarControl(domElement, customSettings) {
            // Store a reference to the current instance
            var thisRef = this;

            // Store the associated DOM element
            thisRef.hostElement = $(domElement);
            var hostElement = thisRef.hostElement;

            // Combine user-provided settings with the standard default configuration
            thisRef.settings = $.extend(true, {}, $.fn.calendarWidget.standardSettings, customSettings);
            var settings = thisRef.settings;

            // Locate the calendar display panel if pre-existing via its attribute
            thisRef.displayPanel = $($.find('[cal-panel-id=' + hostElement.attr('cal-id') + ' ]'));

            // Set the initial display date to the chosen date if not explicitly set
            settings.chosenDate = settings.chosenDate || settings.currentMoment;
            settings.initialDisplayDate = (new Date((settings.initialDisplayDate || settings.chosenDate)))._first();

            if (!(hostElement.attr('cal-id') || '').length) {
                hostElement.attr('cal-id', 'cc-' + Math.round(Math.random() * 1e10));
            }

            // Display the calendar when the host element receives focus or is clicked
            hostElement
                .addClass('cc-host')
                .bind('click', function(evt) { thisRef.reveal(evt); })
                .bind('focus', function(evt) { thisRef.reveal(evt); });

            // If a custom container for the calendar exists, hide it initially
            // unless `alwaysVisible` is enabled; `composeUI` will manage visibility.
            if (thisRef.displayPanel.length && !settings.alwaysVisible) {
                thisRef.displayPanel.hide();
            }

            // Conceal the calendar if a mouse click occurs outside of the widget or its host
            $(document).bind('mouseup', function(evt) {
                var eventTarget = evt.target;
                var displayPanel = thisRef.displayPanel;

                if (!hostElement.is(eventTarget) && !displayPanel.is(eventTarget) && displayPanel.has(eventTarget).length === 0 && displayPanel.is(':visible')) {
                    thisRef.conceal();
                }
            });

            // Generate the calendar's visual interface
            thisRef.composeUI();
        }

        // Exposed methods for the calendar control
        calendarControl.prototype =
        {
            reveal: function() {
                // Conceal other active calendar instances and reveal this one
                $.each($('.cc-host').not(this.hostElement), function(idx, obj) {
                    if (obj.length) { obj.settings.onPanelConceal(obj.displayPanel); }
                });

                // Display the current calendar instance
                this.settings.onPanelDisplay(this.displayPanel);
            },

            conceal: function() {
                if (this.settings && !this.settings.alwaysVisible) {
                    this.settings.onPanelConceal(this.displayPanel);
                }
            },

            // Reconstruct and update the calendar's visual elements
            composeUI: function(uiCallback) {
                var thisRef = this;
                var hostElement = thisRef.hostElement;
                var settings = thisRef.settings;
                var displayPanel = thisRef.displayPanel;

                // Define a base style class for all calendar elements, including a frame
                var baseStyle = ' fundamental frame ';
                var displayStyle = 'cc-' + settings.styleClass;

                // Retrieve today's date information
                var currentMomentValue = settings.currentMoment._val();
                var currentMomentTime = currentMomentValue.time;

                // Fixed values for grid dimensions and styling
                var maximumRows = 6;
                var maximumColumns = 7;
                var frameThickness = settings.frameThickness + 'px';

                // Utility function to generate a list of permitted values
                var determinePermittedList = function(lowerBound, upperBound, providedList) {
                    // Create a default list within the specified bounds
                    var finalList = [];
                    for (var index = lowerBound; index <= upperBound; index++) { finalList.push(index); }

                    // If a custom list is provided, filter it to ensure values are within bounds and unique
                    if (providedList) {
                        var filteredList = [];
                        $.each(providedList, function(idx, itemValue) {
                            if (itemValue >= lowerBound && itemValue <= upperBound && filteredList._indexOf(itemValue) < 0) {
                                filteredList.push(itemValue);
                            }
                        });

                        finalList = filteredList.length ? filteredList : finalList;
                    }

                    // Sort the resulting list numerically
                    finalList.sort();

                    return finalList;
                };

                // Pre-calculated lists of selectable elements
                var availableMonths = determinePermittedList(0, 11, settings.availableMonths);
                var availableYears = determinePermittedList(currentMomentValue.year - 5, currentMomentValue.year + 5, settings.availableYears);
                var availableWeekDays = determinePermittedList(0, 6, settings.availableWeekDays);
                var weekDayLabels = settings.weekDayLabels || ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                var monthLabels = settings.monthLabels || ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

                // Determine individual cell width based on the host element's size
                var enclosingWidth = hostElement.outerWidth();
                var enclosingHeight = enclosingWidth;

                // Calculate cell dimensions relative to the overall container size
                var calculateCellDimensions = function(totalDimension, itemCount) {
                    return (totalDimension / itemCount) + ((settings.frameThickness / itemCount) * (itemCount - 1));
                };
                var unitWidth = calculateCellDimensions(enclosingWidth, maximumColumns);
                var unitHeight = calculateCellDimensions(enclosingHeight, maximumRows + 2);

                // If the display panel does not exist, create it and update the internal reference
                if (!displayPanel.length) {
                    thisRef.displayPanel = displayPanel = $('<div/>')
                        .attr('cal-panel-id', hostElement.attr('cal-id'))
                        .data('initialized', true)
                        .css(
                        {
                            display: (settings.alwaysVisible ? undefined : 'none'),
                            zIndex: settings.layerIndex,
                            width: (unitWidth * maximumColumns) + 'px'
                        });

                    $('body').append(displayPanel);
                }
                else {
                    if (!eval(displayPanel.data('initialized'))) { // Keeping eval as in original, though generally avoided.
                        enclosingWidth = displayPanel.outerWidth();
                        enclosingHeight = displayPanel.outerHeight();

                        unitWidth = calculateCellDimensions(enclosingWidth, maximumColumns);
                        unitHeight = calculateCellDimensions(enclosingHeight, maximumRows + 2);
                    }
                }

                // If the associated input element isn't visible, hide the calendar panel
                if (!hostElement.is(':visible')) { displayPanel.hide(); }

                // Apply base styling and clear any previous child elements from the panel
                displayPanel
                    .removeClass()
                    .addClass(displayStyle)
                    .children().remove();

                // Attach an event listener for window resizing to reposition the calendar
                var adjustPosition = function() {
                    var hostPosition = hostElement.offset();
                    displayPanel.css(
                    {
                        top: (hostPosition.top + hostElement.outerHeight() + settings.panelDisplacement.vert) + 'px',
                        left: (hostPosition.left + settings.panelDisplacement.horiz) + 'px'
                    });
                };
                $(window).resize(adjustPosition);
                adjustPosition();

                // Define CSS properties for individual calendar cells
                var unitStyles =
                {
                    width: unitWidth + 'px',
                    height: unitHeight + 'px',
                    lineHeight: unitHeight + 'px'
                };

                // Helper function to update the calendar's displayed month
                var setInitialDate = function(inputDate) {
                    if (inputDate) {
                        // Retrieve the first day of the month
                        settings.initialDisplayDate = inputDate;

                        // Re-render the calendar with the new month
                        thisRef.composeUI();
                    }
                };

                var retrieveStartDate = function(monthShift) {
                    // Initialize a date object to the first day of the current month
                    var workingDate = new Date(settings.initialDisplayDate);

                    // Assume no month shift initially
                    monthShift = monthShift || 0;

                    // Iterate until a selectable month/year is found (if shifting)
                    while (true) {
                        // Apply the month offset to the working date
                        workingDate.setMonth(workingDate.getMonth() + monthShift);
                        workingDate.setDate(Math.min(1, workingDate._max()));

                        // If no offset was applied, exit the loop
                        if (monthShift == 0) { break; }

                        // Extract components from the working date
                        var dateValue = workingDate._val();

                        // Store month and year values locally
                        var monthIndex = dateValue.month;
                        var yearValue = dateValue.year;

                        // Check if the month is allowed
                        if (availableMonths._indexOf(monthIndex) != -1) {
                            // If the year is also permitted, the date is valid, so break.
                            if (availableYears._indexOf(yearValue) != -1) {
                                break;
                            }
                            else {
                                // Otherwise, if the year is outside the permitted range, return null.
                                if (yearValue < availableYears[0] || yearValue > availableYears[availableYears.length - 1]) {
                                    return null;
                                }
                            }
                        }
                    }

                    return workingDate;
                };

                // Calculate the starting dates for the previous and next months
                var previousMonthStart = retrieveStartDate(-1);
                var nextMonthStart = retrieveStartDate(1);

                // Determine the actual first day of the month to be rendered
                var currentMonthStart = (settings.initialDisplayDate = retrieveStartDate());
                var currentMonthStartValue = currentMonthStart._val();
                var currentMonthIndex = currentMonthStartValue.month;
                var currentYearValue = currentMonthStartValue.year;

                // Initialize the date for the very first cell in the calendar grid
                var calendarGridStart = new Date(currentMonthStart);

                // Validate and normalize the starting day of the week offset
                var weekStartOffset = Math.abs(Math.min(6, Math.max(0, settings.weekStartOffset)));

                // Adjust the order of weekday labels based on the start offset
                var gridDayOffset = calendarGridStart.getDay() - weekStartOffset;
                    gridDayOffset = gridDayOffset < 1 ? -7 - gridDayOffset : -gridDayOffset;
                    weekDayLabels = (weekDayLabels.concat(weekDayLabels))
                                .slice(weekStartOffset, weekStartOffset + 7);

                // Shift the grid start date to align with the first visible day
                calendarGridStart._add(gridDayOffset);

                // Determine if previous/next month navigation is possible
                var canGoBackward = (previousMonthStart);
                var canGoForward = (nextMonthStart);

                // Construct the navigation arrows and the month/year title element
                var headerBaseStyle = baseStyle + 'month-year-header ';

                var backwardNavCell = $('<div/>')
                                .addClass(headerBaseStyle)
                                .css(
                                    $.extend({}, unitStyles,
                                    {
                                        borderWidth: frameThickness + ' 0 0 ' + frameThickness
                                    })
                                )
                                .append(
                                    $('<a/>')
                                        .addClass('backward-nav' + (canGoBackward ? '' : '-disabled'))
                                        .html(settings.backwardIndicator)
                                )
                                .mousedown(function() { return false; })
                                .click(function(evt) {
                                    if (settings.backwardIndicator != '' && canGoBackward) {
                                        evt.stopPropagation();
                                        setInitialDate(previousMonthStart);
                                    }
                                });

                var headerTitleSpan = maximumColumns - 2;
                var headerTitleWidth = (unitWidth * headerTitleSpan) - (headerTitleSpan * settings.frameThickness) + (settings.frameThickness);
                var headerTitleCell = $('<div/>')
                                .addClass(headerBaseStyle + 'caption')
                                .css(
                                    $.extend({}, unitStyles,
                                    {
                                        width: headerTitleWidth + 'px',
                                        borderTopWidth: frameThickness,
                                        marginLeft: '-' + (frameThickness)
                                    })
                                );

                var forwardNavCell = $('<div/>')
                                .addClass(headerBaseStyle)
                                .css(
                                    $.extend({}, unitStyles,
                                    {
                                        marginLeft: '-' + (frameThickness),
                                        borderWidth: frameThickness + ' ' + frameThickness + ' 0 0'
                                    })
                                )
                                .append(