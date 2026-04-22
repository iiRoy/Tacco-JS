// ChronosPicker v1.16.4 - a modern date selection utility
// For inquiries, suggestions, or issues, please refer to the project documentation.

// Basic environment check (modernized)
if (typeof window.HTMLElement === 'undefined') {
  console.error("ChronosPicker Error: DOM environment not detected. Ensure this script runs in a browser context.");
}

// Utility for creating and appending elements (modern replacement for Prototype's build)
const domUtils = {
  // Purges all child nodes from an element
  clearChildren: function(parentEl) {
    if (!parentEl) return;
    while (parentEl.firstChild) {
      parentEl.removeChild(parentEl.firstChild);
    }
  },
  // Creates an element and appends it to a parent
  createAndAppend: function(parentEl, tagName, attributes = {}, styles = {}) {
    const newEl = document.createElement(tagName);
    for (const key in attributes) {
      if (key === 'className') {
        newEl.className = attributes[key];
      } else if (key === 'innerHTML') {
        newEl.innerHTML = attributes[key];
      } else if (key === 'onclick') {
        newEl.addEventListener('click', attributes[key]);
      } else if (key.startsWith('on')) { // Generic event listener
        const eventName = key.substring(2).toLowerCase();
        newEl.addEventListener(eventName, attributes[key]);
      }
      else {
        newEl.setAttribute(key, attributes[key]);
      }
    }
    for (const styleKey in styles) {
      newEl.style[styleKey] = styles[styleKey];
    }
    if (parentEl) {
      parentEl.appendChild(newEl);
    }
    return newEl;
  },
  // Creates an element without immediately appending
  create: function(tagName, attributes = {}, styles = {}) {
    return this.createAndAppend(null, tagName, attributes, styles);
  }
};

// Global null replacement
const nothing = null;

// Date utility extensions
// Using 'const' for constants, 'let' for mutable variables.
const ChronosDate = {
  MILLIS_PER_DAY: 24 * 60 * 60 * 1000,
  WEEK_DAYS_SHORT: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"], // Changed from S M T W T F S for clarity
  WEEK_START_DAY: 0, // Sunday
  MONTH_NAMES_FULL: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],

  // Pads a number with a leading zero if less than 10
  padTwoDigits: (num) => {
    return num < 10 ? `0${num}` : `${num}`;
  },

  // Extension methods for Date.prototype
  // Using Object.defineProperty for non-enumerable properties
  extendDatePrototype: () => {
    Object.defineProperties(Date.prototype, {
      getShortMinutes: {
        value: function() { return ChronosDate.padTwoDigits(this.getMinutes()); },
        writable: true, configurable: true
      },
      getTwelveHourFormat: {
        value: function() {
          const hr = this.getHours();
          return (hr === 0) ? 12 : (hr > 12 ? hr - 12 : hr);
        },
        writable: true, configurable: true
      },
      getMeridiem: {
        value: function() { return (this.getHours() < 12) ? "AM" : "PM"; },
        writable: true, configurable: true
      },
      resetTime: {
        value: function() { return new Date(this.getFullYear(), this.getMonth(), this.getDate()); },
        writable: true, configurable: true
      },
      getDaysDifference: {
        value: function(compareDate) {
          const diff = compareDate.resetTime().getTime() - this.resetTime().getTime();
          return Math.round(diff / ChronosDate.MILLIS_PER_DAY);
        },
        writable: true, configurable: true
      },
      toPrettyString: {
        value: function(includeTime = false) {
          let outputStr = `${ChronosDate.MONTH_NAMES_FULL[this.getMonth()]} ${this.getDate()}, ${this.getFullYear()}`;
          if (includeTime) {
            outputStr += ` ${this.getTwelveHourFormat()}:${this.getShortMinutes()} ${this.getMeridiem()}`;
          }
          return outputStr;
        },
        writable: true, configurable: true
      }
    });
  },

  // Parses a formatted string into a Date object
  parseDisplayString: function(inputString) {
    // This is a simple pass-through, similar to original.
    // For robust parsing, a dedicated parser or library would be needed.
    const parsedDate = new Date(inputString);
    return isNaN(parsedDate.getTime()) ? null : parsedDate;
  }
};
ChronosDate.extendDatePrototype(); // Apply extensions

// Math utility for interval flooring
Math.floorToNearest = (num, interval) => {
  return Math.floor(num / interval) * interval;
};

// Window dimension utilities
const viewport = {
  getWindowHeight: () => {
    return window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight || 0;
  },
  getScrollTop: () => {
    return window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
  }
};

// Localized strings (simplified)
const i18n = {
  "OK_BTN": "OK",
  "NOW_BTN": "Now",
  "TODAY_BTN": "Today",
  "CLEAR_BTN": "Clear"
};

// SelectDropdown class (modernized from SelectBox)
class SelectDropdown {
  constructor(parentElement, valueOptions, htmlAttributes, styleAttributes) {
    this.element = domUtils.createAndAppend(parentElement, "select", htmlAttributes, styleAttributes);
    this.populateOptions(valueOptions);
  }

  populateOptions(optionsArray) {
    domUtils.clearChildren(this.element);
    optionsArray.forEach(pair => {
      let optionPair = Array.isArray(pair) ? pair : [pair, pair];
      domUtils.createAndAppend(this.element, "option", { value: optionPair[1], innerHTML: optionPair[0] });
    });
  }

  setSelectedValue(val) {
    const targetValue = String(val);
    let matched = false;
    for (let i = 0; i < this.element.options.length; i++) {
      if (this.element.options[i].value === targetValue) {
        this.element.selectedIndex = i;
        matched = true;
        break;
      }
    }
    return matched;
  }

  getCurrentValue() {
    return this.element.value;
  }
}

// Main ChronosPicker class (modernized from CalendarDateSelect)
class ChronosPicker {
  constructor(targetElement, configOptions = {}) {
    this.targetInput = typeof targetElement === 'string' ? document.getElementById(targetElement) : targetElement;
    if (!this.targetInput) {
      console.error(`ChronosPicker: Target element ${targetElement} not found!`);
      return;
    }

    // Ensure it's an input element or find the first input within it
    if (this.targetInput.tagName !== "INPUT") {
      const foundInput = this.targetInput.querySelector("INPUT");
      if (foundInput) {
        this.targetInput = foundInput;
      } else {
        console.error(`ChronosPicker: Provided target element is not an INPUT and contains no INPUT.`);
        return;
      }
    }

    // Store reference on the input for external access
    this.targetInput.chronosPicker = this;
    this.lastInteractionTime = 0; // Tracks last click for double-click close logic

    // Default configuration (modernized)
    this.config = {
      embedded: false,
      popupMode: nothing, // null
      showTime: false,
      showButtons: true,
      showClearButton: true,
      yearSpan: 10, // Number for range around current year, or [start, end] array
      closeOnSelect: nothing, // null, auto-detect based on showTime
      minuteStep: 5,
      popupAnchor: this.targetInput,
      monthYearDisplay: "dropdowns", // "dropdowns" or "label"
      onChangeCallback: (inputEl) => { // Modernized event dispatching
        return () => {
          const changeEvent = new Event('change', { bubbles: true, cancelable: true });
          inputEl.dispatchEvent(changeEvent);
        };
      },
      dateValidator: nothing // null, a function to validate dates
    };

    // Merge user options
    Object.assign(this.config, configOptions);

    this.isTimeEnabled = this.config.showTime;
    this.parseInitialDate();
    this.executeCallback("before_display");
    this.setupCalendarContainer();

    if (!this.config.embedded) {
      this.positionCalendarContainer();
      // Attach global event listeners for dismissal
      this.boundDismissHandler = this.dismissOnOutsideClick.bind(this);
      this.boundKeyHandler = this.handleKeyPress.bind(this);
      document.addEventListener("mousedown", this.boundDismissHandler, { passive: true });
      document.addEventListener("keydown", this.boundKeyHandler, { passive: true });
    }
    this.executeCallback("after_display");
  }

  // Determines calendar position relative to anchor element
  positionCalendarContainer() {
    if (!this.calendarContainer) return;

    const anchorEl = this.config.popupAnchor;
    if (!anchorEl) return; // Guard clause

    const containerRect = this.calendarContainer.getBoundingClientRect();
    const anchorRect = anchorEl.getBoundingClientRect();
    const viewportScrollTop = viewport.getScrollTop();
    const viewportHeight = viewport.getWindowHeight();

    let placeAbove = false;
    // Check if placing below would go off screen and placing above is possible
    if ((anchorRect.bottom + containerRect.height > viewportScrollTop + viewportHeight) &&
        (anchorRect.top - containerRect.height > viewportScrollTop)) {
      placeAbove = true;
    }

    const leftPos = anchorRect.left + window.scrollX;
    const topPos = placeAbove ? (anchorRect.top + window.scrollY - containerRect.height) : (anchorRect.bottom + window.scrollY);

    this.calendarContainer.style.left = `${leftPos}px`;
    this.calendarContainer.style.top = `${topPos}px`;
    this.calendarContainer.style.visibility = "visible"; // Make visible after positioning
  }

  // Initializes the main calendar DOM structure
  setupCalendarContainer() {
    let parentEl;
    let containerStyles = {};

    if (this.config.embedded) {
      parentEl = this.targetInput.parentNode;
    } else {
      parentEl = document.body;
      containerStyles = { position: "absolute", visibility: "hidden", left: "0", top: "0" };
    }

    this.calendarContainer = domUtils.createAndAppend(parentEl, 'div', { className: "chronos_picker_container" }, containerStyles);

    // Create sub-sections
    const sectionNames = ["header", "navigation", "body", "controls", "status", "footer"];
    sectionNames.forEach(name => {
      this[`${name}Section`] = domUtils.createAndAppend(this.calendarContainer, 'div', { className: `cp_${name}` }, { clear: 'left' });
    });

    this.initNavigationSection();
    this.initControlButtons();
    this.initCalendarGrid();
    this.updateStatusDisplay("&nbsp;"); // Initial empty status

    this.refreshDisplay();
    this.setUseTimeSelection(this.isTimeEnabled); // Initialize time selectors if applicable
  }

  // Sets up month/year navigation elements
  initNavigationSection() {
    const navSection = this.navigationSection;
    this.closeButton = domUtils.createAndAppend(navSection, "a", {
      innerHTML: "&times;", // 'x'
      href: "#",
      className: "cp_close_btn",
      onclick: (e) => { e.preventDefault(); this.closePicker(); }
    });
    this.nextMonthButton = domUtils.createAndAppend(navSection, "a", {
      innerHTML: "&gt;",
      href: "#",
      className: "cp_next_month",
      onclick: (e) => { e.preventDefault(); this.navigateMonth(this.currentDate.getMonth() + 1); }
    });
    this.prevMonthButton = domUtils.createAndAppend(navSection, "a", {
      innerHTML: "&lt;",
      href: "#",
      className: "cp_prev_month",
      onclick: (e) => { e.preventDefault(); this.navigateMonth(this.currentDate.getMonth() - 1); }
    });

    if (this.config.monthYearDisplay === "dropdowns") {
      // Generate options for months (0-11)
      const monthOptions = Array.from({ length: 12 }, (_, i) => [ChronosDate.MONTH_NAMES_FULL[i], i]);
      this.monthSelector = new SelectDropdown(navSection, monthOptions, {
        className: "cp_month_selector",
        onchange: (e) => { this.navigateMonth(parseInt(e.target.value, 10)); }
      });
      this.yearSelector = new SelectDropdown(navSection, [], {
        className: "cp_year_selector",
        onchange: (e) => { this.navigateYear(parseInt(e.target.value, 10)); }
      });
      this.populateYearDropdown();
    } else {
      this.monthYearLabel = domUtils.createAndAppend(navSection, "span", { className: "cp_month_year_label" });
    }
  }

  // Initializes the calendar day grid
  initCalendarGrid() {
    const bodySection = this.bodySection;
    this.dayGridCells = []; // Array to hold references to day cells

    const dayTable = domUtils.createAndAppend(bodySection, "table", { cellPadding: "0", cellSpacing: "0", width: "100%", className: "cp_day_table" });
    const tableHead = domUtils.createAndAppend(dayTable, "thead");
    const weekdaysRow = domUtils.createAndAppend(tableHead, "tr");

    // Create weekday headers
    ChronosDate.WEEK_DAYS_SHORT.forEach(dayName => {
      domUtils.createAndAppend(weekdaysRow, "th", { innerHTML: dayName });
    });

    const daysTbody = domUtils.createAndAppend(dayTable, "tbody");
    let currentDayRow;
    let rowIndex = 0;

    // Create 42 day cells (6 weeks * 7 days)
    for (let cellIndex = 0; cellIndex < 42; cellIndex++) {
      const dayOfWeek = (cellIndex + ChronosDate.WEEK_START_DAY) % 7;
      if (cellIndex % 7 === 0) {
        currentDayRow = domUtils.createAndAppend(daysTbody, "tr", { className: `cp_row_${rowIndex++}` });
      }

      const dayCell = domUtils.createAndAppend(currentDayRow, "td", {
        className: (dayOfWeek === 0 || dayOfWeek === 6) ? "cp_weekend" : "",
        tabIndex: 0 // Make cells focusable
      }, { cursor: "pointer" });

      // Store context and attach event listeners using arrow functions for 'this' binding
      dayCell.addEventListener('mouseover', (e) => this.handleDayHover(dayCell));
      dayCell.addEventListener('mouseout', (e) => this.handleDayHoverOut(dayCell));
      dayCell.addEventListener('click', (e) => {
        e.preventDefault(); // Prevent default if any
        if (!dayCell.classList.contains('cp_disabled')) {
          this.updateChosenDate({ day: dayCell.day, month: dayCell.month, year: dayCell.year }, true);
        }
      });
      dayCell.addEventListener('keyup', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          if (!dayCell.classList.contains('cp_disabled')) {
            this.updateChosenDate({ day: dayCell.day, month: dayCell.month, year: dayCell.year }, true);
          }
        }
      });

      domUtils.createAndAppend(dayCell, "div", { className: "cp_day_label" }); // Inner div for day number
      this.dayGridCells[cellIndex] = dayCell;
    }
  }

  // Initializes action buttons and time selectors
  initControlButtons() {
    const controlsSection = this.controlsSection;

    if (this.config.showTime) {
      domUtils.createAndAppend(controlsSection, "span", { innerHTML: "@", className: "cp_at_sign" });

      const now = new Date();
      const blankTimeOption = this.config.showTime === "mixed" ? [[" - ", ""]] : [];

      // Hour selector
      const hourOptions = Array.from({ length: 24 }, (_, i) => {
        now.setHours(i);
        return [`${now.getTwelveHourFormat()} ${now.getMeridiem()}`, i];
      });
      this.hourSelector = new SelectDropdown(controlsSection, blankTimeOption.concat(hourOptions), {
        className: "cp_hour_selector",
        onchange: (e) => { this.updateChosenDate({ hour: e.target.value === "" ? "" : parseInt(e.target.value, 10) }); }
      });

      domUtils.createAndAppend(controlsSection, "span", { innerHTML: ":", className: "cp_separator" });

      // Minute selector
      const minuteOptions = Array.from({ length: 60 }, (_, i) => i)
        .filter(i => i % this.config.minuteStep === 0)
        .map(i => [ChronosDate.padTwoDigits(i), i]);
      this.minuteSelector = new SelectDropdown(controlsSection, blankTimeOption.concat(minuteOptions), {
        className: "cp_minute_selector",
        onchange: (e) => { this.updateChosenDate({ minute: e.target.value === "" ? "" : parseInt(e.target.value, 10) }); }
      });
    } else if (!this.config.showButtons) {
      // Remove the controls section entirely if no time and no buttons
      controlsSection.remove();
    }

    if (this.config.showButtons) {
      domUtils.createAndAppend(controlsSection, "span", { innerHTML: "&nbsp;", className: "cp_button_spacer" });

      // Today button
      if (this.config.showTime === "mixed" || !this.config.showTime) {
        domUtils.createAndAppend(controlsSection, "a", {
          innerHTML: i18n.TODAY_BTN,
          href: "#",
          className: "cp_today_btn",
          onclick: (e) => { e.preventDefault(); this.selectToday(false); }
        });
      }

      // Separator for "Now" button
      if (this.config.showTime === "mixed") {
        domUtils.createAndAppend(controlsSection, "span", { innerHTML: "&nbsp;|&nbsp;", className: "cp_button_separator" });
      }

      // Now button
      if (this.config.showTime) {
        domUtils.createAndAppend(controlsSection, "a", {
          innerHTML: i18n.NOW_BTN,
          href: "#",
          className: "cp_now_btn",
          onclick: (e) => { e.preventDefault(); this.selectToday(true); }
        });
      }

      // OK button (if not embedded and not auto-closing)
      if (!this.config.embedded && !this.shouldCloseOnSelect()) {
        domUtils.createAndAppend(controlsSection, "span", { innerHTML: "&nbsp;|&nbsp;", className: "cp_button_separator" });
        domUtils.createAndAppend(controlsSection, "a", {
          innerHTML: i18n.OK_BTN,
          href: "#",
          className: "cp_ok_btn",
          onclick: (e) => { e.preventDefault(); this.closePicker(); }
        });
      }

      // Clear button
      if (this.config.showClearButton) {
        domUtils.createAndAppend(controlsSection, "span", { innerHTML: "&nbsp;|&nbsp;", className: "cp_button_separator" });
        domUtils.createAndAppend(controlsSection, "a", {
          innerHTML: i18n.CLEAR_BTN,
          href: "#",
          className: "cp_clear_btn",
          onclick: (e) => { e.preventDefault(); this.clearSelectedDate(); if (!this.config.embedded) this.closePicker(); }
        });
      }
    }
  }

  // Refreshes the calendar display (month/year, grid, selection, footer)
  refreshDisplay() {
    this.updateMonthYearDisplay();
    this.updateCalendarGrid();
    this.highlightSelectedDay();
    this.updateStatusDisplay();
  }

  // Populates the year dropdown
  populateYearDropdown() {
    if (!this.yearSelector) return;
    this.yearSelector.populateOptions(this.getYearRange().map(y => [y, y]));
  }

  // Calculates the range of years to display
  getYearRange() {
    const yearSpanConfig = this.config.yearSpan;
    if (Array.isArray(yearSpanConfig)) {
      return Array.from({ length: yearSpanConfig[1] - yearSpanConfig[0] + 1 }, (_, i) => yearSpanConfig[0] + i);
    }
    // Flexible range around current year
    const currentYear = this.currentDate.getFullYear();
    const startYear = currentYear - yearSpanConfig;
    const endYear = currentYear + yearSpanConfig;
    return Array.from({ length: endYear - startYear + 1 }, (_, i) => startYear + i);
  }

  // Checks if a year is within the valid range
  isValidYear(year) {
    const yearSpanConfig = this.config.yearSpan;
    if (typeof yearSpanConfig === "number") { // Flexible range
      return true; // Always valid if flexible, just adjusts dropdown
    }
    // Fixed range
    return year >= yearSpanConfig[0] && year <= yearSpanConfig[1];
  }

  // Updates the calendar grid (days of the month)
  updateCalendarGrid() {
    this.monthStartDay = new Date(this.currentDate).resetTime();
    this.monthStartDay.setDate(1);
    this.monthStartDay.setHours(12); // Prevent DST issues

    // Calculate start day for the grid (previous month's days)
    let preDays = this.monthStartDay.getDay();
    if (preDays < ChronosDate.WEEK_START_DAY) { // Adjust if first day of week is not Sunday
      preDays += 7;
    }
    this.monthStartDay.setDate(1 - preDays + ChronosDate.WEEK_START_DAY);

    let dayIterator = new Date(this.monthStartDay);
    const today = new Date().resetTime();
    const currentMonth = this.currentDate.getMonth();
    const dateValidator = this.config.dateValidator;

    this.todayCell = nothing; // Reset today's cell reference

    for (let cellIndex = 0; cellIndex < 42; cellIndex++) {
      const day = dayIterator.getDate();
      const month = dayIterator.getMonth();
      const year = dayIterator.getFullYear();
      const cell = this.dayGridCells[cellIndex];
      const dayLabelDiv = cell.querySelector('.cp_day_label');

      // Clear previous content and set new day number
      if (dayLabelDiv) {
        dayLabelDiv.textContent = day;
      }

      // Update cell data for event handlers
      cell.day = day;
      cell.month = month;
      cell.year = year;
      cell.dateRef = new Date(year, month, day); // Store a date object for easy validation

      // Apply classes
      cell.className = (cell.classList.contains("cp_weekend") ? "cp_weekend" : ""); // Preserve weekend class
      if (month !== currentMonth) {
        cell.classList.add("cp_other_month");
      } else {
        cell.classList.remove("cp_other_month");
      }

      // Disable invalid dates
      if (dateValidator && !dateValidator(cell.dateRef.resetTime())) {
        cell.classList.add("cp_disabled");
        cell.tabIndex = -1; // Make it not focusable
      } else {
        cell.classList.remove("cp_disabled");
        cell.tabIndex = 0; // Make it focusable
      }

      // Mark today's date
      if (cell.dateRef.resetTime().getTime() === today.getTime()) {
        cell.classList.add("cp_today");
        this.todayCell = cell;
      } else {
        cell.classList.remove("cp_today");
      }

      dayIterator.setDate(day + 1); // Move to the next day
    }
  }

  // Updates the month/year display (dropdowns or label)
  updateMonthYearDisplay() {
    const month = this.currentDate.getMonth();
    const year = this.currentDate.getFullYear();

    if (this.config.monthYearDisplay === "dropdowns") {
      this.monthSelector.setSelectedValue(month);

      // Refresh year dropdown if current year is near the edge of the dynamic range
      if (typeof this.config.yearSpan === "number") {
        if (!this.yearSelector.setSelectedValue(year) ||
            this.yearSelector.element.selectedIndex <= 1 ||
            this.yearSelector.element.selectedIndex >= this.yearSelector.element.options.length - 2) {
          this.populateYearDropdown(); // Re-populate if year isn't found or is at edge
          this.yearSelector.setSelectedValue(year); // Try again after repopulating
        }
      } else { // Fixed range
        this.yearSelector.setSelectedValue(year);
      }
    } else {
      if (this.monthYearLabel) {
        this.monthYearLabel.textContent = `${ChronosDate.MONTH_NAMES_FULL[month]} ${year}`;
      }
    }
  }

  // Handles mouseover on a day cell
  handleDayHover(cellElement) {
    if (cellElement.classList.contains('cp_disabled')) return;
    const hoverDate = new Date(this.selectedDate); // Use selectedDate as base for time
    hoverDate.setFullYear(cellElement.year, cellElement.month, cellElement.day);
    this.updateStatusDisplay(hoverDate.toPrettyString(this.isTimeEnabled));
  }

  // Handles mouseout on a day cell
  handleDayHoverOut(cellElement) {
    this.updateStatusDisplay(); // Reset to selected date's string
  }

  // Clears the "selected" class from the previously selected cell
  clearSelectedClass() {
    if (this.selectedCell) {
      this.selectedCell.classList.remove("cp_selected");
    }
  }

  // Applies the "selected" class to the currently selected day
  highlightSelectedDay() {
    if (!this.hasSelection) return;
    this.clearSelectedClass();

    const selectedDateResetTime = this.selectedDate.resetTime();
    const daysFromMonthStart = this.monthStartDay.resetTime().getDaysDifference(selectedDateResetTime);

    // Check if the selected date falls within the currently displayed 42 cells
    if (daysFromMonthStart >= 0 && daysFromMonthStart < 42) {
      this.selectedCell = this.dayGridCells[daysFromMonthStart];
      this.selectedCell.classList.add("cp_selected");
    }
  }

  // Reparses the target input's value and refreshes the display
  reparseInputDate() {
    this.parseInitialDate();
    this.refreshDisplay();
  }

  // Generates the formatted date string for display
  getCurrentDateString() {
    return this.hasSelection ? this.selectedDate.toPrettyString(this.isTimeEnabled) : "&nbsp;";
  }

  // Parses the initial date from the target input or uses default
  parseInitialDate() {
    const inputValue = this.targetInput.value.trim();
    const defaultTimeConfig = this.config.defaultTime; // Can be a Date object or a function returning one

    this.hasSelection = (inputValue !== "" || defaultTimeConfig);
    let parsedDate = ChronosDate.parseDisplayString(inputValue);

    if (!parsedDate) {
      if (defaultTimeConfig) {
        parsedDate = (typeof defaultTimeConfig === 'function') ? defaultTimeConfig() : defaultTimeConfig;
      } else {
        parsedDate = new Date(); // Fallback to current date
      }
    }

    // Ensure year is within valid range, adjust if necessary
    if (!this.isValidYear(parsedDate.getFullYear())) {
      const yearRange = this.getYearRange();
      parsedDate.setFullYear(parsedDate.getFullYear() < yearRange[0] ? yearRange[0] : yearRange[yearRange.length - 1]);
    }

    this.currentDate = new Date(parsedDate); // Date for calendar navigation
    this.selectedDate = new Date(parsedDate); // The actual selected date with time

    // Auto-detect if time is present in input string, override if `showTime` is explicit
    if (this.config.showTime === "mixed") {
      this.isTimeEnabled = /[0-9]:[0-9]{2}/.test(inputValue);
    } else if (this.config.showTime === true) {
      this.isTimeEnabled = true;
    } else {
      this.isTimeEnabled = false;
    }

    this.currentDate.setDate(1); // Set to first day of month for navigation
  }

  // Updates the footer/status display area
  updateStatusDisplay(text) {
    const displayHtml = text || this.getCurrentDateString();
    domUtils.clearChildren(this.statusSection);
    domUtils.createAndAppend(this.statusSection, "span", { innerHTML: displayHtml });
  }

  // Clears the selected date from the input
  clearSelectedDate() {
    if (this.targetInput.disabled || this.targetInput.readOnly) return false;
    const previousValue = this.targetInput.value;
    this.targetInput.value = "";
    this.clearSelectedClass();
    this.updateStatusDisplay('&nbsp;');
    if (previousValue !== this.targetInput.value) {
      this.executeCallback("onchange");
    }
    this.hasSelection = false;
    return true;
  }

  // Updates the selected date based on user interaction
  updateChosenDate(dateParts = {}, fromClick = false) {
    if (this.targetInput.disabled || this.targetInput.readOnly) {
      if (this.config.popupMode !== "force") return false;
    }

    let tempSelectedDate = new Date(this.selectedDate); // Work with a copy

    // Update day, month, year if provided
    if (dateParts.day !== undefined) {
      tempSelectedDate.setFullYear(dateParts.year, dateParts.month, dateParts.day);

      // Validate the date if a validator is provided
      if (this.config.dateValidator && !this.config.dateValidator(tempSelectedDate.resetTime())) {
        return false; // Don't update if invalid
      }
      this.selectedDate = tempSelectedDate;
      this.hasSelection = true;
    }

    // Update hour if provided
    if (dateParts.hour !== undefined && dateParts.hour !== "") {
      this.selectedDate.setHours(dateParts.hour);
    }
    // Update minute if provided
    if (dateParts.minute !== undefined && dateParts.minute !== "") {
      this.selectedDate.setMinutes(Math.floorToNearest(dateParts.minute, this.config.minuteStep));
    }

    // Determine if time selection is active based on inputs
    if (dateParts.hour === "" || dateParts.minute === "") {
      this.setUseTimeSelection(false);
    } else if (dateParts.hour !== undefined || dateParts.minute !== undefined) {
      this.setUseTimeSelection(true);
    }

    this.updateStatusDisplay();
    this.highlightSelectedDay();

    if (this.hasSelection) {
      this.updateInputValue();
    }

    // Close logic
    if (this.shouldCloseOnSelect()) {
      this.closePicker();
    }
    if (fromClick && !this.config.embedded) {
      // Double-click close (similar to original)
      if ((Date.now() - this.lastInteractionTime) < 333) {
        this.closePicker();
      }
      this.lastInteractionTime = Date.now();
    }
    return true;
  }

  // Determines if the picker should close after a date selection
  shouldCloseOnSelect() {
    if (this.config.embedded) return false;
    if (this.config.closeOnSelect === nothing) {
      return !this.config.showTime; // Default: close if no time selection
    }
    return this.config.closeOnSelect;
  }

  // Navigates to a different month
  navigateMonth(targetMonth) {
    const newDate = new Date(this.currentDate);
    newDate.setMonth(targetMonth);
    return this.navigateTo(newDate);
  }

  // Navigates to a different year
  navigateYear(targetYear) {
    const newDate = new Date(this.currentDate);
    newDate.setFullYear(targetYear);
    return this.navigateTo(newDate);
  }

  // General navigation method
  navigateTo(targetDate) {
    if (!this.isValidYear(targetDate.getFullYear())) {
      // Potentially show a message or prevent navigation
      return false;
    }
    this.currentDate = targetDate;
    this.currentDate.setDate(1); // Always set to 1st for consistent month view
    this.refreshDisplay();
    this.executeCallback("after_navigate", this.currentDate);
    return true;
  }

  // Toggles time selection UI and logic
  setUseTimeSelection(enable) {
    // Only proceed if time selection is configured
    if (!this.config.showTime) {
      this.isTimeEnabled = false;
      return;
    }

    this.isTimeEnabled = (this.config.showTime === "mixed" ? enable : true);

    if (this.isTimeEnabled && this.selectedDate) {
      // Set hour/minute selectors to current selected date's time
      this.hourSelector.setSelectedValue(this.selectedDate.getHours());
      this.minuteSelector.setSelectedValue(Math.floorToNearest(this.selectedDate.getMinutes(), this.config.minuteStep));
    } else if (this.config.showTime === "mixed") {
      // Clear time selectors if mixed mode and time is disabled
      this.hourSelector.setSelectedValue("");
      this.minuteSelector.setSelectedValue("");
    }
  }

  // Updates the target input's value
  updateInputValue() {
    const previousValue = this.targetInput.value;
    this.targetInput.value = this.getCurrentDateString();
    if (previousValue !== this.targetInput.value) {
      this.executeCallback("onchange");
    }
  }

  // Sets the selected date to today (with or without current time)
  selectToday(includeTime) {
    const now = new Date();
    const dateParts = {
      day: now.getDate(),
      month: now.getMonth(),
      year: now.getFullYear(),
      hour: now.getHours(),
      minute: now.getMinutes()
    };
    if (!includeTime) {
      dateParts.hour = ""; // Clear hour to disable time selection
      dateParts.minute = ""; // Clear minute
    }
    this.updateChosenDate(dateParts, true);
    this.currentDate = new Date(now.getFullYear(), now.getMonth(), 1); // Reset navigation to current month
    this.refreshDisplay();
  }

  // Closes and cleans up the picker
  closePicker() {
    if (this.isClosed) return false; // Already closed

    this.executeCallback("before_close");
    this.targetInput.chronosPicker = nothing; // Remove reference from input
    // Remove global event listeners
    document.removeEventListener("mousedown", this.boundDismissHandler);
    document.removeEventListener("keydown", this.boundKeyHandler);

    this.calendarContainer.remove(); // Remove calendar DOM
    this.isClosed = true;

    // Focus target input if it's not hidden/disabled
    if (this.targetInput.type !== "hidden" && !this.targetInput.disabled) {
      this.targetInput.focus();
    }
    this.executeCallback("after_close");
    return true;
  }

  // Handles clicks outside the calendar to dismiss it
  dismissOnOutsideClick(event) {
    const clickedElement = event.target;
    // Check if the clicked element is outside the calendar container
    if (!this.calendarContainer.contains(clickedElement) && clickedElement !== this.targetInput) {
      this.closePicker();
    }
  }

  // Handles key presses for dismissal (Escape key)
  handleKeyPress(event) {
    if (event.key === "Escape") {
      this.closePicker();
    }
  }

  // Executes a callback function if defined in config
  executeCallback(callbackName, parameter) {
    const callbackFn = this.config[callbackName];
    if (typeof callbackFn === "function") {
      callbackFn.bind(this.targetInput)(parameter); // Bind 'this' to the target input for the callback
    }
  }
}