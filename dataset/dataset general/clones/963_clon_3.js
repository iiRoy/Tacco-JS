'use strict';

// This script enables interactive date selection widgets on a web page.
// It detects elements with a specific class and initializes them as date pickers.

class DateInputWidget {
  // Static array for full month names, used for calendar display.
  static MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Default format for displaying dates in the input field.
  static DEFAULT_DATE_FORMAT = 'yyyy-mm-dd';

  /**
   * Initializes a new DateInputWidget instance.
   * @param {HTMLElement} containerNode The DOM element that wraps the date input components.
   */
  constructor(containerNode) {
    // Ensure the provided container node is a valid DOM element.
    if (!(containerNode instanceof HTMLElement)) {
      console.error('DateInputWidget: Invalid container node provided.', containerNode);
      return;
    }

    // Reference to the main widget instance for event handlers.
    const _thisWidget = this;

    // jQuery object for the entire document, used for global mouse events.
    const globalDocRef = $(document);

    // Identify the core input field within the container.
    // Using `find` and `eq(0)` for robustness, assuming it's the first input.
    this.targetInputField = $(containerNode).find('input').eq(0);
    this.rawInputNode = this.targetInputField.get(0); // Native DOM element reference

    // Find the button/label that toggles the calendar display.
    // Using a more generic class name than 'add-on'.
    this.toggleButton = this.targetInputField.siblings('.date-picker-toggle');
    this.rawToggleButtonNode = this.toggleButton.get(0);

    // Locate the calendar overlay container, typically hidden by default.
    this.calendarOverlay = this.toggleButton.children('.calendar-popup');
    this.rawCalendarOverlayNode = this.calendarOverlay.get(0);

    // Determine the initial date value.
    // Prioritize existing input value, otherwise default to today's date.
    this.currentDateValue = this.parseDateFromInput(this.targetInputField.val()) || new Date();

    // Retrieve the display format from data attributes, or use the default.
    this.outputPattern = this.targetInputField.data('format') || DateInputWidget.DEFAULT_DATE_FORMAT;

    // Store the year and month currently displayed in the calendar.
    this.currentRenderYear = this.currentDateValue.getFullYear();
    this.currentRenderMonth = this.currentDateValue.getMonth();

    // State variables for tracking drag operations (year/month scrolling).
    this.isYearScrollActive = false;
    this.isMonthScrollActive = false;
    this.scrollStartYear = null;
    this.scrollStartMonth = null;
    this.initialPointerX = -1;
    this.initialPointerY = -1;

    // Initially render the calendar grid for the determined month.
    this.displayCalendarForMonth(this.currentRenderYear, this.currentRenderMonth);

    // --- Event Bindings ---

    // Listen for CSS transition end events on the calendar overlay.
    // This can be used to re-render the calendar if the input field's value changes
    // while the calendar is open, ensuring it reflects the new selection.
    this.calendarOverlay.on('transitionend', function(eventObj) {
      // Only proceed if the input field is currently focused.
      if (!_thisWidget.targetInputField.is(':focus')) {
        return;
      }

      // Parse the current input value to update the selected date.
      const updatedValue = _thisWidget.parseDateFromInput(_thisWidget.targetInputField.val());

      // If a valid date was parsed, update the widget's internal state and re-render.
      if (updatedValue) {
        _thisWidget.currentDateValue = updatedValue;
        const newYear = updatedValue.getFullYear();
        const newMonth = updatedValue.getMonth();
        _thisWidget.displayCalendarForMonth(newYear, newMonth);
      }
    });

    // Handle clicks on the toggle button to focus/blur the input.
    this.toggleButton.on('mousedown', function(eventObj) {
      // Toggle focus state of the associated input field.
      if (_thisWidget.targetInputField.is(':focus')) {
        _thisWidget.targetInputField.blur();
      } else {
        _thisWidget.targetInputField.focus();
      }
      // Prevent default browser behavior (e.g., text selection).
      return false;
    });

    // Handle clicks on individual day cells within the calendar grid.
    this.calendarOverlay.on('mousedown', 'td.day-cell', function(eventObj) {
      const clickedCell = $(this);

      // Extract date components from the clicked cell's data attributes.
      const selectedYear = clickedCell.data('year');
      const selectedMonth = clickedCell.data('month');
      const selectedDay = clickedCell.data('date');

      // Update the widget's internal selected date object.
      _thisWidget.currentDateValue = new Date(selectedYear, selectedMonth, selectedDay);

      // Remove 'is-selected' class from previously selected cell.
      _thisWidget.calendarOverlay.find('td.is-selected').removeClass('is-selected');
      // Add 'is-selected' class to the newly clicked cell.
      clickedCell.addClass('is-selected');

      // Format the new date and update the input field's value.
      const formattedDateString = _thisWidget.formatDateForDisplay(_thisWidget.currentDateValue);
      _thisWidget.targetInputField.val(formattedDateString);

      // After a short delay, blur the input field to close the calendar.
      setTimeout(() => {
        _thisWidget.targetInputField.blur();
      }, 200);

      return false; // Prevent default behavior.
    });

    // Handle clicks on the navigation headers (month/year/prev/next).
    this.calendarOverlay.on('mousedown', 'th.nav-cell', function(eventObj) {
      const navCell = $(this);
      const cellAction = navCell.data('action'); // e.g., 'prev', 'next', 'month', 'year'

      // Guard clause: if no action is defined, do nothing.
      if (!cellAction) {
        return;
      }

      let targetYear = _thisWidget.currentRenderYear;
      let targetMonth = _thisWidget.currentRenderMonth;

      // Check if the action initiates a drag operation for year or month.
      if (cellAction === 'year-drag') {
        _thisWidget.isYearScrollActive = true;
      } else if (cellAction === 'month-drag') {
        _thisWidget.isMonthScrollActive = true;
      }

      // If a drag operation has started, record initial state.
      if (_thisWidget.isYearScrollActive || _thisWidget.isMonthScrollActive) {
        _thisWidget.scrollStartYear = targetYear;
        _thisWidget.scrollStartMonth = targetMonth;
        _thisWidget.initialPointerX = eventObj.pageX;
        _thisWidget.initialPointerY = eventObj.pageY;
      }
      // Otherwise, handle simple navigation clicks.
      else {
        // Convert action to an integer for month adjustments.
        const monthAdjustment = parseInt(cellAction, 10);

        // If the action is a valid number, adjust month.
        if (!isNaN(monthAdjustment)) {
          targetMonth += monthAdjustment;

          // Normalize month and year if month goes out of bounds (0-11).
          if (targetMonth < 0) {
            targetMonth = 11;
            targetYear--;
          } else if (targetMonth > 11) {
            targetMonth = 0;
            targetYear++;
          }
          // Re-render calendar with the new month and year.
          _thisWidget.displayCalendarForMonth(targetYear, targetMonth);
        }
      }

      return false; // Prevent default behavior.
    });

    // Global mousemove event handler for drag operations.
    globalDocRef.on('mousemove', function(eventObj) {
      // Only proceed if a drag operation is active.
      if (!_thisWidget.isYearScrollActive && !_thisWidget.isMonthScrollActive) {
        return;
      }

      const currentPointerX = eventObj.pageX;
      const currentPointerY = eventObj.pageY;
      const deltaX = currentPointerX - _thisWidget.initialPointerX;
      const deltaY = currentPointerY - _thisWidget.initialPointerY;

      let adjustedYear = _thisWidget.scrollStartYear;
      let adjustedMonth = _thisWidget.scrollStartMonth;

      // Arbitrary sensitivity factor for drag.
      const dragSensitivity = 16;
      const scrollMagnitude = Math.floor((deltaX + deltaY) / dragSensitivity);

      if (_thisWidget.isYearScrollActive) {
        adjustedYear += scrollMagnitude;
      } else { // isMonthScrollActive
        adjustedMonth += scrollMagnitude;
        // Adjust year based on month overflow/underflow.
        adjustedYear += Math.floor(adjustedMonth / 12);
        adjustedMonth = adjustedMonth % 12;
        // Ensure month is positive.
        adjustedMonth += (adjustedMonth < 0) ? 12 : 0;
      }

      // Update the calendar display based on the drag.
      _thisWidget.displayCalendarForMonth(adjustedYear, adjustedMonth);
    });

    // Global mouseup event handler to end drag operations.
    globalDocRef.on('mouseup', function(eventObj) {
      // Only proceed if a drag operation was active.
      if (!_thisWidget.isYearScrollActive && !_thisWidget.isMonthScrollActive) {
        return;
      }

      // Reset all drag-related state variables.
      _thisWidget.isYearScrollActive = false;
      _thisWidget.isMonthScrollActive = false;
      _thisWidget.scrollStartYear = null;
      _thisWidget.scrollStartMonth = null;
      _thisWidget.initialPointerX = -1;
      _thisWidget.initialPointerY = -1;
    });

    // Store a reference to this widget on the input element's data.
    this.targetInputField.data('dateInputWidget', this);
  }

  /**
   * Helper method to pad a number with a leading zero if it's less than 10.
   * @param {number} num The number to pad.
   * @returns {string} The padded number as a string.
   */
  _padNum(num) {
    return num < 10 ? '0' + num : '' + num;
  }

  /**
   * Calculates the total number of days in a given month and year.
   * @param {number} currentYear The year.
   * @param {number} currentMonth The zero-indexed month (0-11).
   * @returns {number} The number of days in the specified month.
   */
  getDaysInSpecifiedMonth(currentYear, currentMonth) {
    // Date(year, month + 1, 0) gives the last day of the *previous* month.
    // Date(year, month + 1, 0).getDate() gives the number of days in the current month.
    return new Date(currentYear, currentMonth + 1, 0).getDate();
  }

  /**
   * Retrieves the full name of a month based on its zero-indexed number.
   * @param {number} monthIndex The zero-indexed month number (0-11).
   * @returns {string} The full name of the month.
   */
  retrieveMonthName(monthIndex) {
    // Basic validation for month index.
    if (monthIndex < 0 || monthIndex > 11) {
      return 'Invalid Month';
    }
    return DateInputWidget.MONTH_NAMES[monthIndex];
  }

  /**
   * Generates and updates the calendar grid display for a specific month and year.
   * @param {number} targetYear The year to display.
   * @param {number} targetMonth The zero-indexed month (0-11) to display.
   */
  displayCalendarForMonth(targetYear, targetMonth) {
    // Guard against invalid year/month values.
    if (typeof targetYear !== 'number' || typeof targetMonth !== 'number' || isNaN(targetYear) || isNaN(targetMonth)) {
      console.error('displayCalendarForMonth: Invalid year or month provided.');
      return;
    }

    // Create a Date object for the first day of the target month.
    const firstDayOfMonth = new Date(targetYear, targetMonth, 1);
    // Get the day of the week (0 for Sunday, 6 for Saturday) for the first day.
    const firstWeekDay = firstDayOfMonth.getDay();
    // Get the total number of days in the target month.
    const totalDays = this.getDaysInSpecifiedMonth(targetYear, targetMonth);

    // Get today's date components for highlighting.
    const today = new Date();
    const todayYear = today.getFullYear();
    const todayMonth = today.getMonth();
    const todayDate = today.getDate();

    // Get the currently selected date's components for highlighting.
    const selectedDate = this.currentDateValue;
    const selectedYear = selectedDate.getFullYear();
    const selectedMonth = selectedDate.getMonth();
    const selectedDay = selectedDate.getDate();

    let dayCounter = 0; // Tracks the current day number (1-based) being rendered.

    // Build the calendar header (month, year, navigation buttons).
    const calendarHeader = `
      <thead>
        <tr>
          <th class="nav-cell prev-month" data-action="-1">&lt;</th>
          <th class="nav-cell month-label" data-action="month-drag" colspan="3">${this.retrieveMonthName(targetMonth)}</th>
          <th class="nav-cell year-label" data-action="year-drag" colspan="2">${targetYear}</th>
          <th class="nav-cell next-month" data-action="1">&gt;</th>
        </tr>
        <tr class="week-days">
          <th>Sun</th><th>Mon</th><th>Tue</th><th>Wed</th><th>Thu</th><th>Fri</th><th>Sat</th>
        </tr>
      </thead>
    `;

    // Build the calendar body (days grid).
    let calendarBodyRows = [];
    for (let weekRow = 0; weekRow < 6; weekRow++) {
      let weekCells = [];
      for (let dayOfWeek = 0; dayOfWeek < 7; dayOfWeek++) {
        // Determine if a day should be rendered for the current cell.
        if (dayCounter > 0 || dayOfWeek === firstWeekDay) {
          dayCounter++; // Increment day counter once we hit the first day of the month.

          if (dayCounter <= totalDays) {
            // Apply CSS classes for today's date and the selected date.
            let cellClasses = ['day-cell'];
            if (todayYear === targetYear && todayMonth === targetMonth && todayDate === dayCounter) {
              cellClasses.push('is-today');
            }
            if (selectedYear === targetYear && selectedMonth === targetMonth && selectedDay === dayCounter) {
              cellClasses.push('is-selected');
            }

            weekCells.push(`
              <td class="${cellClasses.join(' ')}"
                  data-year="${targetYear}"
                  data-month="${targetMonth}"
                  data-date="${dayCounter}">
                ${dayCounter}
              </td>
            `);
          } else {
            // Render empty cells for days beyond the end of the month.
            weekCells.push('<td class="empty-cell">&nbsp;</td>');
          }
        } else {
          // Render empty cells for days before the start of the month.
          weekCells.push('<td class="empty-cell">&nbsp;</td>');
        }
      }
      calendarBodyRows.push(`<tr>${weekCells.join('')}</tr>`);
    }

    // Combine header and body into a full table structure.
    const fullCalendarHtml = `
      <table class="calendar-grid">
        ${calendarHeader}
        <tbody>
          ${calendarBodyRows.join('')}
        </tbody>
      </table>
    `;

    // Update the DOM with the newly generated calendar HTML.
    this.calendarOverlay.html(fullCalendarHtml);
    // Store the currently rendered year and month.
    this.currentRenderYear = targetYear;
    this.currentRenderMonth = targetMonth;
  }

  /**
   * Formats a Date object into a string based on the widget's outputPattern.
   * @param {Date} dateObject The Date object to format.
   * @returns {string} The formatted date string.
   */
  formatDateForDisplay(dateObject) {
    // Extract components.
    const fullYear = dateObject.getFullYear();
    const shortYear = String(fullYear).substring(2);
    const monthNum = dateObject.getMonth() + 1;
    const dayNum = dateObject.getDate();

    // Use the _padNum helper for consistent zero-padding.
    const paddedMonth = this._padNum(monthNum);
    const paddedDay = this._padNum(dayNum);

    // Replace placeholders in the output pattern.
    // Order matters for 'yyyy' vs 'yy'.
    let formattedString = this.outputPattern;
    formattedString = formattedString.replace(/yyyy/g, String(fullYear));
    formattedString = formattedString.replace(/yy/g, shortYear);
    formattedString = formattedString.replace(/mm/g, paddedMonth);
    formattedString = formattedString.replace(/m/g, String(monthNum));
    formattedString = formattedString.replace(/dd/g, paddedDay);
    formattedString = formattedString.replace(/d/g, String(dayNum));

    return formattedString;
  }

  /**
   * Parses a date string from the input field into a Date object.
   * Supports 'yyyy-mm-dd' format.
   * @param {string} dateString The date string to parse.
   * @returns {Date|null} A Date object if parsing is successful, otherwise null.
   */
  parseDateFromInput(dateString) {
    // Guard clause for empty or invalid input.
    if (!dateString || typeof dateString !== 'string' || dateString.trim() === '') {
      return null;
    }

    const parts = dateString.split('-');
    // Expecting 3 parts: year, month, day.
    if (parts.length !== 3) {
      return null;
    }

    // Parse integers from string parts.
    const pYear = parseInt(parts[0], 10);
    const pMonth = parseInt(parts[1], 10) - 1; // Month is 0-indexed for Date constructor.
    const pDay = parseInt(parts[2], 10);

    // Basic validation for parsed numbers.
    if (isNaN(pYear) || isNaN(pMonth) || isNaN(pDay)) {
      return null;
    }

    // Create a new Date object.
    const parsedDate = new Date(pYear, pMonth, pDay);

    // Additional validation: check if the parsed date components
    // actually match the input, preventing invalid dates like Feb 30th.
    if (parsedDate.getFullYear() !== pYear ||
        parsedDate.getMonth() !== pMonth ||
        parsedDate.getDate() !== pDay) {
      return null;
    }

    return parsedDate;
  }
}

// jQuery document ready function to initialize all date picker widgets.
$(function() {
  // Select all elements designated as date picker containers.
  // Using a more specific class name: 'date-input-container'.
  const dateInputContainers = $('.date-input-container');

  // Iterate over each container and create a new DateInputWidget instance.
  dateInputContainers.each(function(idx, containerElem) {
    new DateInputWidget(containerElem);
  });
});