/*!
 * calendarium-widget plugin
 * Original author: @ahmontero (adapted)
 * License: MIT
 *
 * jQuery component boilerplate
 * Original author: @ajpiano (adapted)
 * Refinements, notes: @addyosmani (adapted)
 * License: MIT
 */

// A semicolon before the immediately invoked function expression (IIFE)
// serves as a defensive measure against potential issues arising from
// preceding scripts that might not have been properly terminated.
;(function ( $, windowObject, documentObject, isUndefined ) {

    // The `isUndefined` parameter ensures that the value of `undefined`
    // is truly undefined within this scope, guarding against environments
    // where it might have been erroneously reassigned.

    // Passing `windowObject` and `documentObject` as local variables
    // enhances lookup performance and allows for more aggressive minification,
    // particularly when these global objects are frequently referenced.

    // Define core configuration and constants for the widget
    var componentId = 'Calendarium', // Unique identifier for the plugin
        initialSettings = { // Default configuration options
            firstDayOfWeek: 1, // 0 for Sunday, 1 for Monday
            dayLabels: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
            monthNames: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
            todayLabel: 'Today',
            eventSummaryHeader: 'Scheduled Events',
            eventDataSource: null // Function or object providing event data
        },
        // HTML structure for the calendar widget
        markupStructure = ''+
                        '<div class="cal-header-display">'+
                            '<h1 class="cal-year-display"></h1>'+
                            '<h3 class="cal-month-display"></h3>'+
                        '</div>'+
                        '<table class="calendar-grid" id="main-calendar-table">'+
                            '<thead class="grid-head-row"></thead>'+
                            '<tbody class="grid-body-rows"></tbody>'+
                            '<tfoot>'+
                                '<th colspan="2" class="nav-control" id="prev-month-nav"><div class="arrow-icon"><i class="icon-arrow-left"></i></div></th>'+
                                '<th colspan="3" class="nav-control" id="current-month-nav">%todayLabelPlaceholder%</th>'+
                                '<th colspan="2" class="nav-control" id="next-month-nav"><div class="arrow-icon"><i class="icon-arrow-right"></i></div></th>'+
                            '</tfoot>'+
                        '</table>'+
                    '',
        // Array storing the number of days in each month (non-leap year)
        monthDayCounts = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31],

        // Capture the current date and time for "today" references
        currentMoment = new Date();

    // Utility function to get days in a specific month and year
    function getMonthLength(year, monthIndex) {
        var days = monthDayCounts[monthIndex];
        // Adjust for February in a leap year
        if (monthIndex === 1 && isYearALeapYear(year)) {
            days = 29;
        }
        return days;
    }

    // The primary constructor for our calendar widget
    function CalendarWidget( targetElement, userOptions ) {
        if (!targetElement) {
            console.error("Calendarium: Target element is not provided.");
            return;
        }
        this.targetElement = $(targetElement);

        // Merge user-provided options with default settings.
        // An empty object `{}` is used as the target to prevent
        // modification of the `initialSettings` object.
        this.config = $.extend( {}, initialSettings, userOptions );

        // Store the original defaults and the widget's name
        this._baseSettings = initialSettings;
        this._widgetName = componentId;

        // Initialize internal state variables
        this._widgetState = {
            firstDayOfWeek: this.config.firstDayOfWeek,
            dayLabels: this.config.dayLabels,
            monthNames: this.config.monthNames,
            todayLabel: this.config.todayLabel,
            eventSummaryHeader: this.config.eventSummaryHeader,
            eventDataSource: this.config.eventDataSource,
            displayedDate: new Date(), // The date currently shown in the calendar view
            currentMonthIndex: currentMoment.getMonth(), // Month index (0-11) of the currently viewed month
            currentYear: currentMoment.getFullYear() // Full year of the currently viewed month
        };

        this.initializeWidget();
    }

    // Prototype methods for the CalendarWidget
    CalendarWidget.prototype.initializeWidget = function () {
        // Render the calendar's main structure and attach event handlers
        this.widgetContainer = $(markupStructure.replace("%todayLabelPlaceholder%", this._widgetState.todayLabel))
                                .appendTo(this.targetElement)
                                .on({
                                    click: $.proxy(this.handleInteraction, this) // Delegate click events
                                });

        // Initial rendering of the calendar grid
        var initialDisplayDate = new Date(this._widgetState.currentYear, this._widgetState.currentMonthIndex, 1);
        this.drawCalendarGrid(initialDisplayDate);
    };

    // Displays event markers on the calendar grid cells
    CalendarWidget.prototype.displayEventMarkers = function (eventData) {
        // Guard against empty or invalid event data
        if (!eventData || !eventData.event || eventData.event.length === 0) {
            return;
        }

        var currentViewDate = this._widgetState.displayedDate;
        var summaryHeader = this._widgetState.eventSummaryHeader;
        var targetMonthDays = getMonthLength(currentViewDate.getFullYear(), currentViewDate.getMonth());

        for (var i = 1; i <= targetMonthDays; i++) {
            var viewDay = i;
            var viewMonth = currentViewDate.getMonth();
            var viewYear = currentViewDate.getFullYear();

            // Create a date object for the current cell being checked
            var cellDate = new Date(viewYear, viewMonth, viewDay, 0, 0, 0, 0);

            $.each(eventData.event, function() {
                var eventDate = new Date(this.date); // Event date from data source

                // Check if the event date matches the current cell date
                if (eventDate.getDate() === cellDate.getDate() &&
                    eventDate.getMonth() === cellDate.getMonth() &&
                    eventDate.getFullYear() === cellDate.getFullYear()
                ) {
                    // Mark the cell as having an event
                    $('#day-cell-' + viewDay)
                        .removeClass("day-cell")
                        .addClass('event-day-cell')
                        .empty()
                        .append('<span class="day-number">' + viewDay + '</span>')
                        .popover({
                            'title': summaryHeader,
                            'content': 'You have ' + (this.title || 'various') + ' appointments',
                            'delay': { 'show': 250, 'hide': 250 },
                            'trigger': 'hover' // Added hover trigger for popover
                        });
                }
            });
        }
    };

    // Fetches event data and applies it to the calendar
    CalendarWidget.prototype.fetchAndApplyEvents = function () {
        var eventSource = this._widgetState.eventDataSource;
        if (eventSource !== null) {
            if (typeof eventSource === 'function') {
                // If eventDataSource is a function, execute it to get data
                var dynamicEvents = eventSource.apply(this, []);
                this.displayEventMarkers(dynamicEvents);
            } else if (typeof eventSource === 'object') {
                // If it's an object, assume it's directly the event data
                this.displayEventMarkers(eventSource);
            }
        }
    };

    // Renders the main calendar grid for the current month/year
    CalendarWidget.prototype.drawCalendarGrid = function (displayDate) {
        var firstDayOfMonth = new Date(this._widgetState.currentYear, this._widgetState.currentMonthIndex, 1);

        // Update the displayed year and month in the widget header
        this.widgetContainer.find('.cal-year-display').text(firstDayOfMonth.getFullYear());
        this.widgetContainer.find('.cal-month-display').text(this._widgetState.monthNames[firstDayOfMonth.getMonth()]);

        // Clear previous calendar grid content
        this.widgetContainer.find('.grid-head-row').empty();
        this.widgetContainer.find('.grid-body-rows').empty();

        // Render the day headers (Mon, Tue, Wed...)
        this.renderDayHeaders();

        var firstDayWeekday = firstDayOfMonth.getDay(); // 0 for Sunday, 1 for Monday, etc.
        var numDaysInMonth = getMonthLength(firstDayOfMonth.getFullYear(), firstDayOfMonth.getMonth());

        // Calculate leading blank cells
        var leadingBlanks = (firstDayWeekday - this._widgetState.firstDayOfWeek + 7) % 7;
        var dayCounter = 1; // Counter for actual days of the month

        var weekRowsHtml = '';
        var totalCells = leadingBlanks + numDaysInMonth; // Minimum cells needed
        var numRows = Math.ceil(totalCells / 7); // Calculate number of rows (weeks)

        // Ensure we always render at least 6 weeks for consistent layout
        if (numRows < 6) numRows = 6;

        for (var rowIdx = 0; rowIdx < numRows; rowIdx++) {
            var currentRowHtml = '';
            for (var colIdx = 0; colIdx < 7; colIdx++) {
                var cellClasses = "calendar-cell";
                var cellId = "";
                var cellContent = "";

                if (rowIdx * 7 + colIdx < leadingBlanks || dayCounter > numDaysInMonth) {
                    // Blank cell before the first day or after the last day of the month
                    currentRowHtml += '<td class="empty-cell">&nbsp;</td>';
                } else {
                    // This is an actual day of the month
                    var currentDay = dayCounter;
                    var currentMonth = firstDayOfMonth.getMonth() + 1; // 1-indexed month
                    var currentYear = firstDayOfMonth.getFullYear();

                    // Check for "today"
                    if (currentMoment.getDate() === currentDay &&
                        currentMoment.getMonth() === firstDayOfMonth.getMonth() &&
                        currentMoment.getFullYear() === firstDayOfMonth.getFullYear()
                    ) {
                        cellClasses += " today-cell";
                    }

                    // Check for weekend (adjust based on firstDayOfWeek)
                    var currentWeekday = (this._widgetState.firstDayOfWeek + colIdx) % 7;
                    if (currentWeekday === 0 || currentWeekday === 6) { // Sunday or Saturday
                        cellClasses += " weekend-cell";
                    }

                    cellClasses += " day-cell"; // Default class for valid days
                    cellId = "day-cell-" + currentDay;
                    cellContent = currentDay;

                    currentRowHtml += '<td class="' + cellClasses + '" id="' + cellId +
                                      '" data-year="' + currentYear + '" data-month="' + currentMonth +
                                      '" data-day="' + currentDay + '">' + cellContent + '</td>';
                    dayCounter++;
                }
            }
            weekRowsHtml += "<tr>" + currentRowHtml + "</tr>";
        }
        this.widgetContainer.find('.grid-body-rows').append(weekRowsHtml);
        this.fetchAndApplyEvents(); // Load events after rendering the grid
    };

    // Renders the header row with day names (e.g., "Mon", "Tue")
    CalendarWidget.prototype.renderDayHeaders = function () {
        var headerCellsHtml = '';
        var dayLabels = this._widgetState.dayLabels;
        var startDay = this._widgetState.firstDayOfWeek;

        for (var i = 0; i < 7; i++) {
            headerCellsHtml += "<th>" + dayLabels[(startDay + i) % 7] + "</th>";
        }

        var headerRow = "<tr>" + headerCellsHtml + "</tr>";
        this.widgetContainer.find('.grid-head-row').append(headerRow);
    };

    // Helper to parse date attributes from a clicked cell
    function _parseDateAttributes(element) {
        return {
            day: parseInt(element.attr('data-day'), 10) || 1,
            month: parseInt(element.attr('data-month'), 10) || 1,
            year: parseInt(element.attr('data-year'), 10) || 1
        };
    }

    // Helper to trigger custom events on the target element
    CalendarWidget.prototype._triggerCustomEvent = function (eventName, eventData) {
        this.targetElement.trigger($.extend({ type: eventName }, eventData));
    };

    // Handles user interactions (clicks) on the calendar widget
    CalendarWidget.prototype.handleInteraction = function (eventObject) {
        eventObject.stopPropagation(); // Prevent event bubbling
        eventObject.preventDefault();  // Prevent default browser action

        var clickedTarget = $(eventObject.target).closest('td, th');

        if (clickedTarget.length === 0) {
            return; // No relevant target clicked
        }

        switch (clickedTarget[0].nodeName.toLowerCase()) {
            case 'td':
                var cellData = _parseDateAttributes(clickedTarget);
                if (clickedTarget.is('.day-cell')) {
                    this._triggerCustomEvent('daySelected', cellData);
                } else if (clickedTarget.is('.event-day-cell')) {
                    this._triggerCustomEvent('eventDayClicked', cellData);
                } else if (clickedTarget.is('.today-cell')) {
                    this._triggerCustomEvent('todayCellClicked', cellData);
                }
                break;
            case 'th':
                if (clickedTarget.is('.nav-control')) {
                    switch (clickedTarget.attr("id")) {
                        case 'prev-month-nav':
                            this.adjustDisplayDate('prevMonth');
                            var previousMonthDate = new Date(this._widgetState.currentYear, this._widgetState.currentMonthIndex, 1);
                            this._widgetState.displayedDate = previousMonthDate;
                            this.drawCalendarGrid(previousMonthDate);
                            this._triggerCustomEvent('previousMonthNavigated');
                            break;
                        case 'current-month-nav':
                            this.adjustDisplayDate('currentMonth');
                            var todayDate = new Date();
                            this._widgetState.displayedDate = todayDate;
                            this.drawCalendarGrid(todayDate);
                            this._triggerCustomEvent('currentMonthNavigated');
                            break;
                        case 'next-month-nav':
                            this.adjustDisplayDate('nextMonth');
                            var nextMonthDate = new Date(this._widgetState.currentYear, this._widgetState.currentMonthIndex, 1);
                            this._widgetState.displayedDate = nextMonthDate;
                            this.drawCalendarGrid(nextMonthDate);
                            this._triggerCustomEvent('nextMonthNavigated');
                            break;
                        default:
                            // No action for other header cells
                            break;
                    }
                }
                break;
            default:
                // Handle other potential clicked elements if necessary
                break;
        }
    };

    // Adjusts the internal month and year based on navigation action
    CalendarWidget.prototype.adjustDisplayDate = function (navigationAction) {
        var newDate = new Date(this._widgetState.currentYear, this._widgetState.currentMonthIndex, 1);

        switch (navigationAction) {
            case 'prevMonth':
                newDate.setMonth(newDate.getMonth() - 1);
                break;
            case 'nextMonth':
                newDate.setMonth(newDate.getMonth() + 1);
                break;
            case 'currentMonth':
                newDate = new Date(); // Reset to current system date
                break;
            default:
                // No change
                return;
        }

        this._widgetState.currentMonthIndex = newDate.getMonth();
        this._widgetState.currentYear = newDate.getFullYear();
    };

    // Determines if a given year is a leap year
    CalendarWidget.prototype.isYearALeapYear = function (year) {
        // A year is a leap year if it is divisible by 4,
        // unless it is divisible by 100 but not by 400.
        return ((year % 4 === 0) && (year % 100 !== 0)) || (year % 400 === 0);
    };

    // Integrate the CalendarWidget into jQuery's prototype,
    // ensuring single instantiation per element.
    if (typeof $ === 'undefined') {
        console.warn("Calendarium: jQuery not found. Plugin will not initialize.");
        return;
    }

    $.fn[componentId] = function ( userOptions ) {
        return this.each(function () {
            // Prevent multiple instantiations on the same element
            if (!$.data(this, 'widget_' + componentId)) {
                $.data(this, 'widget_' + componentId,
                new CalendarWidget( this, userOptions ));
            }
        });
    };

})( jQuery, window, document );