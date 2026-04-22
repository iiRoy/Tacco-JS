(function($) {

    /**
     * @fileoverview This script powers a flexible date selection and event display widget.
     * @author CodeMasterJS
     * @version 2.0.1
     * @license MIT
     */

    // Define the jQuery plugin for the date picker component.
    $.fn.dateNavigator = function(userConfig) {

        // Merge user-provided options with default settings.
        // Using Object.assign for a more modern approach than $.extend.
        const componentSettings = Object.assign({}, $.fn.dateNavigator.defaults, userConfig);

        // Iterate over each selected DOM element to apply the plugin.
        return this.each(function() {

            // Cache the current DOM element as a jQuery object.
            const containerEl = $(this);

            // --- Internal State Variables ---

            let mainCalendarWrapper; // The main container for the entire calendar.
            let allMonthsDisplayArea; // Container for all individual month grids.
            let currentMonthLabel = $('<div class="month-label-display"></div>'); // Displays the current month name.
            let currentYearLabel = $('<div class="year-label-display"></div>'); // Displays the current year.

            // A unique identifier for this calendar instance, derived from the container's ID or a generated one.
            const uniqueCalIdentifier = containerEl.attr('id') || `date-nav-inst-${Math.random().toString(36).substr(2, 9)}`;
            containerEl.attr('id', uniqueCalIdentifier); // Ensure the container has an ID.

            let scheduledEvents = componentSettings.scheduledEvents || []; // Array to store event data.

            // Weekday abbreviations (default to English if not provided).
            const weekDayAbbreviations = componentSettings.weekDayAbbreviations || ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

            // Full month names (default to English if not provided).
            const fullMonthNames = componentSettings.fullMonthNames || ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

            const displayWeekHeader = componentSettings.displayWeekHeader !== undefined ? componentSettings.displayWeekHeader : true; // Flag to show day names row.

            // Configuration for event popovers (tooltips with more content).
            const eventPopoverConfig = componentSettings.eventPopoverConfig || {
                placement: 'bottom',
                html: true,
                trigger: 'hover'
            };

            // Configuration for event tooltips (simple hover text).
            const eventTooltipConfig = componentSettings.eventTooltipConfig || {
                placement: 'bottom',
                trigger: 'hover'
            };

            const ajaxEventSource = componentSettings.ajaxEventSource || false; // AJAX configuration for fetching events.

            let allowDateSelection = componentSettings.allowDateSelection || false; // Can users select dates?
            let enableRangeSelection = componentSettings.enableRangeSelection || false; // Can users select a date range?

            let selectionStart = ''; // Stores the start date of a range selection.
            let selectionEnd = ''; // Stores the end date of a range selection.
            let singleDaySelection = ''; // Stores a single selected day.

            // --- Helper Functions ---

            /**
             * Determines the 0-indexed day of the week for a given date.
             * (0 for Sunday, 1 for Monday, ..., 6 for Saturday).
             * @param {number} dayOfMonth - The day of the month (1-31).
             * @param {number} monthIndex - The 0-indexed month (0-11).
             * @param {number} yearValue - The full year (e.g., 2023).
             * @returns {number} The 0-indexed day of the week.
             */
            const determineWeekdayIndex = (dayOfMonth, monthIndex, yearValue) => {
                const dateObject = new Date(yearValue, monthIndex, dayOfMonth);
                return dateObject.getDay(); // 0 for Sunday, 1 for Monday, etc.
            };

            /**
             * Checks if a given date (month, day, year) is valid.
             * @param {number} monthNum - 1-indexed month (1-12).
             * @param {number} dayNum - Day of the month (1-31).
             * @param {number} yearNum - Full year.
             * @returns {boolean} True if the date is valid, false otherwise.
             */
            const isValidDateComponent = (monthNum, dayNum, yearNum) => {
                if (monthNum < 1 || monthNum > 12 || yearNum <= 0 || dayNum <= 0) {
                    return false;
                }
                const testDate = new Date(yearNum, monthNum - 1, dayNum);
                // Check if the month and year match, preventing overflow issues (e.g., Feb 30th)
                return testDate.getMonth() === (monthNum - 1) && testDate.getDate() === dayNum && testDate.getFullYear() === yearNum;
            };

            /**
             * Calculates the last day of a given month and year.
             * @param {number} monthIndex - The 0-indexed month (0-11).
             * @param {number} yearValue - The full year.
             * @returns {number} The last day of the month (e.g., 31 for January).
             */
            const getLastDayOfMonth = (monthIndex, yearValue) => {
                // Setting day to 0 for the next month automatically gives the last day of the current month.
                return new Date(yearValue, monthIndex + 1, 0).getDate();
            };

            /**
             * Generates a unique ID for a day cell.
             * @param {number} day - Day of month.
             * @param {number} month - 1-indexed month.
             * @param {number} year - Year.
             * @returns {string} The ID string.
             */
            const generateDayCellId = (day, month, year) => {
                return `${uniqueCalIdentifier}_${day}_${month}_${year}`;
            };

            /**
             * Triggers a custom event on the container element.
             * @param {string} eventName - The name of the custom event.
             * @param {object} detail - Data to pass with the event.
             */
            const triggerComponentEvent = (eventName, detail) => {
                const customEvent = new CustomEvent(eventName, {
                    detail: detail,
                    bubbles: true // Allow event to bubble up the DOM tree
                });
                containerEl[0].dispatchEvent(customEvent); // Dispatch on the raw DOM element
                containerEl.trigger(eventName, detail); // Also trigger jQuery event for compatibility
            };

            // --- Calendar Rendering Functions ---

            /**
             * Renders the header row with weekday abbreviations.
             */
            const renderWeekdayHeaders = () => {
                if (!displayWeekHeader) return;

                const weekHeaderRow = $('<tr class="weekday-labels-row"></tr>');
                weekDayAbbreviations.forEach((dayName, index) => {
                    const dayCell = $(`<td class="weekday-cell">${dayName}</td>`);
                    if (index === 0) dayCell.addClass('first-day-col'); // First day of the week column
                    if (index === 6) dayCell.addClass('last-day-col weekend-day'); // Last day (Sunday) column
                    weekHeaderRow.append(dayCell);
                });
                return weekHeaderRow;
            };

            /**
             * Renders the grid for a single month.
             * @param {number} monthIndex - The 0-indexed month (0-11).
             * @param {number} yearValue - The full year.
             */
            const renderSingleMonthGrid = (monthIndex, yearValue) => {
                const monthGridContainer = $('<table class="month-grid-table"></table>');

                // Add month name header
                const monthNameHeader = $(`<div class="month-name-header">${fullMonthNames[monthIndex]}</div>`);

                // Add weekday labels
                const weekdayLabels = renderWeekdayHeaders();
                if (weekdayLabels) {
                    monthGridContainer.append(weekdayLabels);
                }

                const firstDayOfMonthWeekday = determineWeekdayIndex(1, monthIndex, yearValue); // 0-indexed day of week for 1st day
                const totalDaysInMonth = getLastDayOfMonth(monthIndex, yearValue);

                let currentDayCounter = 1;
                let currentWeekRow = $('<tr></tr>');

                // Fill leading empty cells for the first week
                for (let i = 0; i < firstDayOfMonthWeekday; i++) {
                    currentWeekRow.append($('<td class="empty-day-cell"></td>'));
                }

                // Fill actual days of the month
                for (let day = 1; day <= totalDaysInMonth; day++) {
                    const dayWeekdayIndex = determineWeekdayIndex(day, monthIndex, yearValue); // 0 for Sunday, 6 for Saturday
                    const dayCellId = generateDayCellId(day, monthIndex + 1, yearValue);
                    const dateAttribute = `${monthIndex + 1}/${day}/${yearValue}`;

                    const dayCell = $(`
                        <td id="${dayCellId}" data-date="${dateAttribute}" class="day-cell day-of-week-${dayWeekdayIndex}">
                            <div class="day-content">
                                <a href="#" class="day-link">${day}</a>
                            </div>
                        </td>
                    `);

                    if (dayWeekdayIndex === 0 || dayWeekdayIndex === 6) { // Sunday or Saturday
                        dayCell.addClass('weekend-day');
                    }

                    currentWeekRow.append(dayCell);

                    // If it's the end of the week (Saturday) or the last day of the month, append the row and start a new one.
                    if (dayWeekdayIndex === 6 || day === totalDaysInMonth) {
                        monthGridContainer.append(currentWeekRow);
                        currentWeekRow = $('<tr></tr>'); // Start a new row
                    }
                }

                // Fill trailing empty cells for the last week, if any
                const lastDayOfMonthWeekday = determineWeekdayIndex(totalDaysInMonth, monthIndex, yearValue);
                if (lastDayOfMonthWeekday !== 6) { // If last day is not Saturday
                    for (let i = lastDayOfMonthWeekday + 1; i <= 6; i++) {
                        currentWeekRow.append($('<td class="empty-day-cell"></td>'));
                    }
                    monthGridContainer.append(currentWeekRow); // Append the last row
                }

                const monthDisplayBlock = $('<div class="col-md-4 month-block"></div>');
                monthDisplayBlock.append(monthNameHeader).append(monthGridContainer);

                allMonthsDisplayArea.append(monthDisplayBlock);
            };

            /**
             * Generates and displays all 12 months for a given year.
             * @param {number} yearValue - The year to display.
             */
            const generateYearlyMonths = (yearValue) => {
                // Clear previous months
                allMonthsDisplayArea.empty();
                currentYearLabel.text(yearValue); // Update year display

                // Iterate through each month (0-11)
                for (let i = 0; i < 12; i++) {
                    // Start a new row for every 3 months for better layout
                    if (i % 3 === 0) {
                        allMonthsDisplayArea.append($('<div class="row month-row-group"></div>'));
                    }
                    renderSingleMonthGrid(i, yearValue);
                }
            };

            /**
             * Updates the calendar display for a new year.
             * @param {number} newYear - The new year to display.
             */
            const updateCalendarView = (newYear) => {
                generateYearlyMonths(newYear);
                fetchAndProcessEvents(newYear);
                applySelectionHighlight();
            };

            /**
             * Initializes and renders the main calendar structure.
             */
            const initializeCalendarDisplay = () => {
                allMonthsDisplayArea = $('<div id="allMonthsGrid" class="row"></div>');

                // Get current year for initial display.
                const initialYear = new Date().getFullYear();

                // Render the months for the initial year.
                generateYearlyMonths(initialYear);

                // --- Year Navigation Controls ---
                const prevYearButton = $('<td><a href="#" class="year-nav-button prev-year"><i class="fas fa-chevron-left"></i></a></td>');
                prevYearButton.on('click', (e) => {
                    e.preventDefault();
                    let currentYear = parseInt(currentYearLabel.text(), 10);
                    updateCalendarView(--currentYear);
                });

                const nextYearButton = $('<td><a href="#" class="year-nav-button next-year"><i class="fas fa-chevron-right"></i></a></td>');
                nextYearButton.on('click', (e) => {
                    e.preventDefault();
                    let currentYear = parseInt(currentYearLabel.text(), 10);
                    updateCalendarView(++currentYear);
                });

                // --- Header Layout ---
                const headerTable = $('<table class="calendar-header-table"></table>');
                const headerRow = $('<tr></tr>');
                const yearControlCell = $('<td colspan="5" class="year-control-area"></td>');

                yearControlCell.append(currentYearLabel); // Current year displayed here.

                headerRow.append(prevYearButton);
                headerRow.append(yearControlCell);
                headerRow.append(nextYearButton);
                headerTable.append(headerRow);

                // Main calendar container.
                mainCalendarWrapper = $(`<div class="main-date-navigator-wrapper" id="${uniqueCalIdentifier}-wrapper"></div>`);
                mainCalendarWrapper.prepend(headerTable);
                mainCalendarWrapper.append(allMonthsDisplayArea);

                // Append the entire calendar to the target element.
                containerEl.append(mainCalendarWrapper);

                // Check for and apply event markings.
                fetchAndProcessEvents(initialYear);

                // Set up date selection capabilities.
                setupDateSelectionHandlers();
            };

            // --- Event Handling and Marking ---

            /**
             * Fetches events (if AJAX is configured) and then marks them on the calendar.
             * @param {number} yearValue - The year for which to fetch/mark events.
             */
            const fetchAndProcessEvents = (yearValue) => {
                if (!ajaxEventSource) {
                    decorateEventDays(yearValue);
                    return; // No AJAX configured, just mark existing events.
                }

                // Perform AJAX request to get events.
                $.ajax({
                    type: ajaxEventSource.type || 'GET',
                    url: ajaxEventSource.url,
                    data: {
                        targetYear: yearValue
                    }, // Use a more descriptive parameter name
                    dataType: 'json'
                }).done((data) => {
                    if (Array.isArray(data)) {
                        // Append new events if they're not duplicates.
                        // A more robust check might be needed for complex event objects.
                        data.forEach(newEvent => {
                            if (!scheduledEvents.some(existingEvent => existingEvent.date === newEvent.date && existingEvent.title === newEvent.title)) {
                                scheduledEvents.push(newEvent);
                            }
                        });
                    }
                    decorateEventDays(yearValue);
                }).fail((jqXHR, textStatus, errorThrown) => {
                    console.error("Failed to fetch calendar events:", textStatus, errorThrown);
                    // Even if AJAX fails, try to decorate with any existing events.
                    decorateEventDays(yearValue);
                });
            };

            /**
             * Applies styling and interactive elements (tooltips/popovers) to event days.
             * @param {number} yearValue - The year to filter events by.
             */
            const decorateEventDays = (yearValue) => {
                // Clear existing event markings first to prevent duplicates on redraw.
                containerEl.find('.day-cell').removeClass('has-event event-popover-trigger event-tooltip-trigger')
                    .find('a.day-link').removeAttr('data-original-title data-content rel href style');

                scheduledEvents.forEach(eventItem => {
                    const eventDateParts = eventItem.date.split('/'); // Expects "M/D/YYYY" or "MM/DD/YYYY"
                    const eventYear = parseInt(eventDateParts[2], 10);

                    // Only process events for the current displayed year.
                    if (eventYear === yearValue) {
                        const eventMonth = parseInt(eventDateParts[0], 10);
                        const eventDay = parseInt(eventDateParts[1], 10);

                        const dayCellId = generateDayCellId(eventDay, eventMonth, eventYear);
                        const targetCell = $(`#${dayCellId}`);
                        const targetLink = targetCell.find('a.day-link');

                        if (targetCell.length) {
                            targetCell.addClass('has-event');

                            // Apply custom background color if specified.
                            if (eventItem.color) {
                                targetCell.css('background-color', eventItem.color);
                            }

                            // Add custom CSS class if specified.
                            if (eventItem.cssClass) {
                                targetCell.addClass(eventItem.cssClass);
                            }

                            // Set link if provided.
                            if (eventItem.link) {
                                targetLink.attr('href', eventItem.link);
                            }

                            // Determine whether to use popover or tooltip based on content.
                            if (eventItem.content) {
                                targetCell.addClass('event-popover-trigger');
                                targetLink.attr({
                                    'rel': 'popover',
                                    'data-content': eventItem.content,
                                    'data-original-title': eventItem.title // Popover title
                                });
                            } else if (eventItem.title) {
                                targetCell.addClass('event-tooltip-trigger');
                                targetLink.attr({
                                    'rel': 'tooltip',
                                    'data-original-title': eventItem.title // Tooltip title
                                });
                            }
                        }
                    }
                });

                // Initialize tooltips and popovers after all events are marked.
                containerEl.find('.event-tooltip-trigger a').tooltip(eventTooltipConfig);
                containerEl.find('.event-popover-trigger a').popover(eventPopoverConfig);

                // Handle manual popover toggling if needed (e.g., for click triggers).
                containerEl.find('.manual-popover-toggle').on('click', function(e) {
                    e.preventDefault(); // Prevent navigation if href="#"
                    $(this).popover('toggle');
                });
            };

            // --- Date Selection Logic ---

            /**
             * Sets up click handlers for date selection if enabled.
             */
            const setupDateSelectionHandlers = () => {
                if (!allowDateSelection) return;

                containerEl.on('click', '.day-cell:not(.empty-day-cell)', function(e) {
                    e.preventDefault(); // Prevent default link behavior
                    const clickedDateString = $(this).data('date'); // Format "M/D/YYYY"

                    if (enableRangeSelection) {
                        // Multi-selection logic (range selection)
                        if (!singleDaySelection) {
                            // First click in a potential range
                            singleDaySelection = clickedDateString;
                            applySelectionHighlight();
                        } else if (!selectionEnd) {
                            // Second click completes the range
                            selectionStart = singleDaySelection;
                            selectionEnd = clickedDateString;
                            applySelectionHighlight();

                            triggerComponentEvent("dateRangeSelected", {
                                startDate: selectionStart,
                                endDate: selectionEnd
                            });
                        } else {
                            // Third click clears the range
                            selectionStart = '';
                            selectionEnd = '';
                            singleDaySelection = '';
                            containerEl.find('.selected-range-day, .range-start-day, .range-end-day, .single-selected-day').removeClass('selected-range-day range-start-day range-end-day single-selected-day');
                        }
                    } else {
                        // Single day selection logic
                        containerEl.find('.single-selected-day').removeClass('single-selected-day'); // Clear previous selection
                        $(this).find('.day-content').addClass('single-selected-day'); // Mark current day
                        singleDaySelection = clickedDateString;

                        triggerComponentEvent("dateSelected", {
                            selectedDate: clickedDateString
                        });
                    }
                });
            };

            /**
             * Applies CSS classes to highlight selected days or ranges.
             */
            const applySelectionHighlight = () => {
                // Clear all previous selection highlights
                containerEl.find('.selected-range-day, .range-start-day, .range-end-day, .single-selected-day').removeClass('selected-range-day range-start-day range-end-day single-selected-day');

                if (enableRangeSelection) {
                    if (singleDaySelection && !selectionStart && !selectionEnd) {
                        // Only one day selected, awaiting second click for range
                        const parts = singleDaySelection.split('/');
                        const dayId = generateDayCellId(parseInt(parts[1], 10), parseInt(parts[0], 10), parseInt(parts[2], 10));
                        $(`#${dayId} .day-content`).addClass('single-selected-day');
                    } else if (selectionStart && selectionEnd) {
                        // Full range selected
                        let start = new Date(selectionStart);
                        let end = new Date(selectionEnd);

                        // Ensure start is always before or equal to end
                        if (start > end) {
                            [start, end] = [end, start]; // Swap dates
                        }

                        // Mark start day
                        $(`#${generateDayCellId(start.getDate(), start.getMonth() + 1, start.getFullYear())} .day-content`).addClass('range-start-day selected-range-day');

                        // Iterate and mark intermediate days
                        let currentDate = new Date(start);
                        currentDate.setDate(currentDate.getDate() + 1); // Start from the day after the start date

                        while (currentDate < end) {
                            const currentDayId = generateDayCellId(currentDate.getDate(), currentDate.getMonth() + 1, currentDate.getFullYear());
                            $(`#${currentDayId} .day-content`).addClass('selected-range-day');
                            currentDate.setDate(currentDate.getDate() + 1);
                        }

                        // Mark end day (if it's not the same as start)
                        if (start.getTime() !== end.getTime()) {
                            $(`#${generateDayCellId(end.getDate(), end.getMonth() + 1, end.getFullYear())} .day-content`).addClass('range-end-day selected-range-day');
                        }
                    }
                } else if (singleDaySelection) {
                    // Single day selection
                    const parts = singleDaySelection.split('/');
                    const dayId = generateDayCellId(parseInt(parts[1], 10), parseInt(parts[0], 10), parseInt(parts[2], 10));
                    $(`#${dayId} .day-content`).addClass('single-selected-day');
                }
            };

            // Kick off the calendar initialization.
            initializeCalendarDisplay();
        });
    };

    // --- Plugin Defaults ---
    $.fn.dateNavigator.defaults = {
        scheduledEvents: [], // Array of event objects: [{date: "MM/DD/YYYY", title: "Event Title", content: "Details", link: "URL", color: "#hex", cssClass: "custom-class"}]
        weekDayAbbreviations: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
        fullMonthNames: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
        displayWeekHeader: true,
        eventPopoverConfig: { // Options for Bootstrap Popover
            placement: 'bottom',
            html: true,
            trigger: 'hover',
            container: 'body' // Important for popovers to render correctly
        },
        eventTooltipConfig: { // Options for Bootstrap Tooltip
            placement: 'bottom',
            trigger: 'hover',
            container: 'body'
        },
        ajaxEventSource: false, // Set to { url: "path/to/events.json", type: "GET" } to enable AJAX
        allowDateSelection: false, // Enable/disable date selection by clicking
        enableRangeSelection: false // If allowDateSelection is true, enable range selection
    };

})(jQuery);