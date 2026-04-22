/*
 *
 * dual date display
 * Creator: codecrafter
 * Online-Creator: example.com
 * Online script: https://example.com/dual_date_display/
 * MIT License
 *
 */

$.fn.date_view_control = function(settings) {
    var config = $.extend({}, $.fn.date_view_control.defaults, settings);



    this.each(function() {


        // --- internal variables ---


        // target DOM element
        var currentElement = $(this);

        var dateDisplay;
        var monthPanel;
        var dayGridContainer;
        var currentMonthVisual = $('<div class="month_label"></div>');
        var currentYearVisual = $('<div class="year_label"></div>');

        var displayId = "date_panel_id";

        var eventData = config.eventData;

        var weekDayLabels;
        if (typeof config.weekDayLabels !== "undefined")
            weekDayLabels = config.weekDayLabels;
        else
            weekDayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

        var monthLabels;
        if (typeof config.monthLabels !== "undefined")
            monthLabels = config.monthLabels;
        else
            monthLabels = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

        var displayWeekdays;
        if (typeof config.displayWeekdays !== "undefined")
            displayWeekdays = config.displayWeekdays;
        else
            displayWeekdays = true;

        var popupSettings;
        if (typeof config.popupSettings !== "undefined")
            popupSettings = config.popupSettings;
        else
            popupSettings = {position: 'bottom', htmlContent: true, triggerAction: 'hover'};

        var hintSettings;
        if (typeof config.hintSettings !== "undefined")
            hintSettings = config.hintSettings;
        else
            hintSettings = {position: 'bottom', triggerAction: 'hover'};

        var ajaxRequestConfig;
        if (typeof config.ajaxRequestConfig !== "undefined")
            ajaxRequestConfig = config.ajaxRequestConfig;
        else
            ajaxRequestConfig = false;

        var allowSelection = false;
        if (typeof config.allowSelection !== 'undefined')
            allowSelection = config.allowSelection;

        var multipleSelection = false;
        if (typeof config.multipleSelection !== 'undefined')
            multipleSelection = config.multipleSelection;

        var firstMarkedDay = '';
        var lastMarkedDay = '';
        var singleMarkedDay = '';

        // --- end internal variables ---





        // --- internal functions ---

        // initialize and render the date display
        function renderDisplay() {

            // container for all month day grids
            dayGridContainer = $('<div id="monthGrid" class="row"></div>');

            // Date object for initial calculations
            var initialDate = new Date();
            initialDate.setMonth(0);

            // initial year to display
            var currentDisplayYear = initialDate.getFullYear();

            // render the month views for the configured year
            renderMonthViews(currentDisplayYear);

            // navigation controls for previous/next year
            var nextYearControl = $('<td><a href="#" class="button-next-year"><i class="glyphicon glyphicon-arrow-right" ></i></a></td>');
            // attach event handler
            nextYearControl.click(function(eventObj) {
                eventObj.preventDefault();
                currentDisplayYear++;
                updateDisplayDate(currentDisplayYear);
            })
            var prevYearControl = $('<td><a href="#" class="button-previous-year"><i class="glyphicon glyphicon-arrow-left" ></i></a></td>');
            // attach event handler
            prevYearControl.click(function(eventObj) {
                eventObj.preventDefault();
                currentDisplayYear--;
                updateDisplayDate(currentDisplayYear);
            })


            // container for current year and month labels
            var mainHeaderPanel = $('<table class="table header-panel"></table>');
            var yearNavigationRow = $('<tr></tr>');
            var yearLabelCell = $('<td colspan=5 class="yearAndMonthLabel col-xs-6"></td>');

            yearNavigationRow.append(prevYearControl);
            yearNavigationRow.append(yearLabelCell);
            yearNavigationRow.append(nextYearControl);
            yearLabelCell.append(currentYearVisual);

            mainHeaderPanel.append(yearNavigationRow);

            // main date display wrapper
            dateDisplay = $('<div class="date_panel" id="' + displayId + '" ></div>');
            dateDisplay.prepend(mainHeaderPanel);
            dateDisplay.append(dayGridContainer);

            // insert the constructed display into the document
            currentElement.append(dateDisplay);

            // fetch and apply event markers
            fetchAndMarkEvents(currentDisplayYear);

            // activate day selection if enabled
            activateDaySelection();
        }

        // update the displayed year or month
        function updateDisplayDate(newYear) {
            dayGridContainer.empty();
            renderMonthViews(newYear);
            fetchAndMarkEvents(newYear);
            highlightChosenDays();
        }

        // render the weekday headers
        function renderWeekdayHeaders() {
            if (displayWeekdays !== false) {
                var weekdayRow = $('<tr class="weekday-labels" >');
                var htmlContent = '';
                $(weekDayLabels).each(function(idx, dayVal) {
                    htmlContent += '<td';
                    if (idx === 0) {
                        htmlContent += ' class="first-day"';
                    }
                    if (idx === 6) {
                        htmlContent += ' class="sunday last-day"';
                    }
                    htmlContent += ">" + dayVal + '</td>';
                });
                htmlContent += '</tr>';
                weekdayRow.append(htmlContent);

                monthPanel.append(weekdayRow);
            }
        }

        // display all months for a given year
        function renderMonthViews(targetYear) {
            for (var monthIndex = 0; monthIndex !== 12; monthIndex++) {
                if (monthIndex % 3 === 0)
                    dayGridContainer.append($('</div><div class="row">'));
                renderSingleMonthDays(monthIndex, targetYear);
            }
        }

        // generate and insert the day cells for a specific month
        function renderSingleMonthDays(targetMonth, targetYear) {

            // monthPanel for current month
            monthPanel = $('<table class="table-month-grid"></table>');

            // update visual labels for year and month
            currentMonthVisual.text(monthLabels[targetMonth]);
            currentYearVisual.text(targetYear);

            // internal counter for days
            var dayIterator = 1;

            // determine the weekday of the first day of the month
            var firstDayOfWeek = calculateWeekday(1, targetMonth, targetYear);

            // find the last day of the current month
            var lastDayOfMonth = findLastDay(targetMonth, targetYear);

            var actualMonthNum = targetMonth + 1;

            var monthHtmlContent = "";

            // render the first partial week
            for (var currentDayCell = 0; currentDayCell < 7; currentDayCell++) {
                if (currentDayCell < firstDayOfWeek) {
                    var cellHtml = "";
                    if (currentDayCell === 0)
                        cellHtml += "<tr>";
                    // insert empty placeholder cell
                    cellHtml += '<td class="empty-cell day-of-week-'+ currentDayCell +'"';
                    cellHtml += '"></td>';
                } else {
                    var cellHtml = "";
                    if (currentDayCell === 0)
                        cellHtml += '<tr>';
                    cellHtml += '<td id="' + displayId + '_' + dayIterator + "_" + actualMonthNum + "_" + targetYear + '" data-date="' + actualMonthNum + "/" + dayIterator + "/" + targetYear + '" ';
                    // add weekday class
                    cellHtml += ' class="day-of-week-'+ currentDayCell +'"';
                    cellHtml += '><div><a>' + dayIterator + '</a></div></span>';
                    if (currentDayCell === 6)
                        cellHtml += '</tr>';
                    dayIterator++;
                }
                monthHtmlContent += cellHtml
            }

            // render remaining days until the end of the month
            var currentWeekPosition = 1;
            while (dayIterator <= lastDayOfMonth) {
                var cellHtml = "";
                if (currentWeekPosition % 7 === 1)
                    cellHtml += "<tr>";
                cellHtml += '<td id="' + displayId + '_' + dayIterator + "_" + actualMonthNum + "_" + targetYear + '" data-date="' + actualMonthNum + "/" + dayIterator + "/" + targetYear + '" ';
                // add weekday class
                cellHtml += ' class="day-of-week-'+ ((currentWeekPosition-1)%7) +'"';
                cellHtml += '><div><a>' + dayIterator + '</a></div></td>';
                if (currentWeekPosition % 7 === 0)
                    cellHtml += "</tr>";
                dayIterator++;
                currentWeekPosition++;
                monthHtmlContent += cellHtml
            }

            // fill in empty cells for the last week of the month if necessary
            currentWeekPosition--;
            if (currentWeekPosition % 7 !== 0) {
                var cellHtml = "";
                for (var j = (currentWeekPosition % 7) + 1; j <= 7; j++) {
                    var cellHtml = "";
                    cellHtml += '<td ';
                    // add weekday class
                    cellHtml += ' class="empty-cell day-of-week-'+ (j-1) +'"';
                    cellHtml += '"></td>';
                    if (j === 7)
                        cellHtml += '</tr>'
                    monthHtmlContent += cellHtml
                }
            }

            renderWeekdayHeaders();

            monthPanel.append(monthHtmlContent);

            monthPanel = $('<div class="month-wrapper" ></div>').append(monthPanel);

            monthPanel.prepend($('<div class="month-label-header" >' + monthLabels[targetMonth] + '</div>'));

            monthPanel = $('<div class="col-md-4" ></div>').append(monthPanel);


            dayGridContainer.append(monthPanel);
        }

        // determine the numerical day of the week for a given date
        function calculateWeekday(dayVal, monthVal, yearVal) {
            var dateObject = new Date(yearVal, monthVal, dayVal);
            var weekDayNum = dateObject.getDay();
            if (weekDayNum === 0)
                weekDayNum = 6;
            else
                weekDayNum--;
            return weekDayNum;
        }

        // validate if a provided date is valid
        // adapted from various online resources
        function isValidDate(monthNum, dayNum, yearNum) {
            return monthNum > 0 && monthNum < 13 && yearNum > 0 && yearNum < 32768 && dayNum > 0 && dayNum <= (new Date(yearNum, monthNum, 0)).getDate();
        }

        // retrieve the last day of a specified month and year
        function findLastDay(monthVal, yearVal) {
            var finalDay = 28;
            while (isValidDate(monthVal + 1, finalDay + 1, yearVal)) {
                finalDay++;
            }
            return finalDay;
        }

        function verifyInputDate(inputDateString) {
            var dateParts = inputDateString.split("/");
            if (dateParts.length !== 3)
                return false;
            return isValidDate(dateParts[1], dateParts[0], dateParts[2]);
        }

        // determine if external event data needs to be fetched via AJAX
        function fetchAndMarkEvents(currentYear) {
            if (ajaxRequestConfig !== false) {
                // initiate AJAX request
                $.ajax({
                    type: ajaxRequestConfig.type,
                    url: ajaxRequestConfig.url,
                    data: {yearParam: currentYear},
                    dataType: 'json'
                }).done(function(responseData) {

                    if (typeof eventData === 'undefined')
                        eventData = [];

                    $.each(responseData, function(key, value) {
                        eventData.push(responseData[key]);
                    });

                    applyEventMarkers(currentYear);

                });
            } else {
                applyEventMarkers(currentYear);
            }
        }

        // apply visual markers for events and attach interaction logic
        function applyEventMarkers(currentYear) {

            for (var eventIdx = 0; eventIdx < eventData.length; eventIdx++) {

                if (eventData[eventIdx].date.split('/')[2] === currentYear.toString()) {

                    var dayCellElement = $('#' + displayId + '_' + eventData[eventIdx].date.replace(/\//g, "_"));
                    var dayAnchorElement = $('#' + displayId + '_' + eventData[eventIdx].date.replace(/\//g, "_") + ' a');

                    dayCellElement.addClass('event_marker');

                    dayAnchorElement.attr('data-original-title', eventData[eventIdx].title);

                    // apply background color
                    if (eventData[eventIdx].color)
                        dayCellElement.css('background', eventData[eventIdx].color);

                    // attach hyperlink
                    if (typeof eventData[eventIdx].link !== 'undefined') {
                        dayAnchorElement.attr('href', eventData[eventIdx].link);
                    }

                    // add custom CSS class
                    if (eventData[eventIdx].cssClass)
                        dayCellElement.addClass(eventData[eventIdx].cssClass);

                    // configure tooltip or popover
                    if (eventData[eventIdx].description) {
                        dayCellElement.addClass('popup_event');
                        dayAnchorElement.attr('rel', 'popover');
                        dayAnchorElement.attr('data-content', eventData[eventIdx].description);
                    } else {
                        dayCellElement.addClass('hint_event');
                        dayAnchorElement.attr('rel', 'tooltip');
                    }
                }
            }

            $('#' + displayId + ' ' + '.hint_event a').tooltip(hintSettings);
            $('#' + displayId + ' ' + '.popup_event a').popover(popupSettings);

            $('.toggle_popup').click(function() {
                $(this).popover('toggle');
            });
        }

        // enable user interaction for selecting days
        function activateDaySelection() {
            if (allowSelection === true) {

                var customSelectEvent;

                currentElement.on('click', '#monthGrid td', function() {
                    // if multiple day selection is active
                    if (multipleSelection === true) {
                        if (singleMarkedDay === '') {
                            singleMarkedDay = $(this).data('date');
                            highlightChosenDays();
                        } else {
                            if (lastMarkedDay === '') {
                                // set the initial and final days for a range
                                firstMarkedDay = singleMarkedDay;
                                lastMarkedDay = $(this).data('date');

                                highlightChosenDays();

                                // trigger a custom event for range selection
                                var customSelectEvent = new CustomEvent("dateViewSelect", {
                                    detail: {
                                        startDate: firstMarkedDay,
                                        endDate: lastMarkedDay
                                    }
                                });
                                document.dispatchEvent(customSelectEvent);
                            } else {
                                firstMarkedDay = '';
                                lastMarkedDay = '';
                                singleMarkedDay = '';
                                currentElement.find('.selected-range').removeClass('mid-range-selection selected-range start-range-selection end-range-selection');
                            }
                        }
                    } else {
                        // for single day selection
                        // remove selection class from all other day elements
                        currentElement.find('td div').removeClass('selected-range');
                        // apply selection class to the clicked day
                        $(this).find('div').addClass('selected-range');
                        // trigger a custom event for single day selection
                        var customSelectEvent = new CustomEvent("dateViewSelect", {
                            detail: {
                                selectedDate: $(this).data('date')
                            }
                        });
                        document.dispatchEvent(customSelectEvent);
                    }
                })
            }
        }

        // visually highlight selected dates
        function highlightChosenDays() {
            if (singleMarkedDay !== '' && firstMarkedDay === '') {
                var dateComponents = singleMarkedDay.split('/');
                $('#' + displayId + '_' + dateComponents[1] + '_' + dateComponents[0] + '_' + dateComponents[2] + ' div').addClass('selected-range');
            } else if (firstMarkedDay !== '') {
                // parse date strings into arrays
                var firstDayParts = firstMarkedDay.split('/');
                var lastDayParts = lastMarkedDay.split('/');

                // clear existing selected classes
                currentElement.find('td.selected-range').removeClass('selected-range');

                // convert date strings to Date objects
                var initialRangeDate = new Date(firstMarkedDay);
                var finalRangeDate = new Date(lastMarkedDay);

                // iterate and mark days within the range
                // swap dates if the order is reversed
                if (initialRangeDate > finalRangeDate) {
                    // temporary variable for swapping
                    var temporaryDate = initialRangeDate;
                    initialRangeDate = finalRangeDate;
                    finalRangeDate = temporaryDate;
                }

                // mark the beginning of the selection range
                $('#' + displayId + '_' + initialRangeDate.getDate() + '_' + (parseInt(initialRangeDate.getMonth()) + 1) + '_' + initialRangeDate.getFullYear() + ' div').addClass('selected-range start-range-selection');
                while (initialRangeDate < finalRangeDate) {
                    initialRangeDate.setDate(initialRangeDate.getDate() + 1);
                    // Mark intermediate days
                    $('#' + displayId + '_' + initialRangeDate.getDate() + '_' + (parseInt(initialRangeDate.getMonth()) + 1) + '_' + initialRangeDate.getFullYear() + ' div').addClass('selected-range mid-range-selection');
                }
                // Mark the end of the selection range
                $('#' + displayId + '_' + finalRangeDate.getDate() + '_' + (parseInt(finalRangeDate.getMonth()) + 1) + '_' + finalRangeDate.getFullYear() + ' div').removeClass('mid-range-selection').addClass('selected-range end-range-selection');
            }
        } // End of highlightChosenDays

        // Initial rendering of the display
        renderDisplay();

    }); // End of currentElement.each

}; // End of $.fn.date_view_control

$.fn.date_view_control.defaults = {
    // default configuration parameters
};