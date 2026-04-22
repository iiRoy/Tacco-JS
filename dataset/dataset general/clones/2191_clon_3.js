/*
 * Advanced Date and Time Selection Module
 * Copyright (C) 2023  Refactored by AI
 *
 * This JavaScript module provides an interactive calendar and time picker.
 * It supports various localization settings and offers customizable date/time output.
 */

// Global configuration parameters
let restrictYearRange = false; // true: Show only current year and next; false: Show +/- 5 years
let startWeekOnSunday = false; // true: Week starts on Sunday; false: Week starts on Monday
let displayWeekNumbers = true;  // true: Show ISO week numbers; false: Hide week numbers

let localeIdentifier = 'cn'; // Current localization code (e.g., 'en', 'es', 'cn')

let enableTimeSelection = true; // Determines if hour and minute controls are active

// Template for displaying today's date in the calendar footer.
// Placeholders: [todayLabel], [formattedDayOfWeek], [dayOfMonth], [monthName], [currentYear]
let currentDayFormat = '[todayLabel] [formattedDayOfWeek]. [dayOfMonth]. [monthName] [currentYear]';
let assetPath = 'images/'; // Relative path to calendar control images (e.g., arrows)

let dropdownAnimationSpeedMs = 150; // Delay (ms) for continuous scroll in dropdowns (year, hour)
let minuteDropdownInterval = 5; // Interval between minute options in the dropdown (e.g., 5, 10, 15)

let verticalOffsetPx = 0;   // Vertical pixel offset for calendar positioning
let horizontalOffsetPx = 0; // Horizontal pixel offset for calendar positioning

let mainCalendarContainer = null; // Reference to the main calendar DOM element after creation

// Legacy browser detection (primarily for older Internet Explorer versions)
const isInternetExplorer = (navigator.userAgent.indexOf('MSIE') >= 0 && navigator.userAgent.indexOf('Opera') < 0);
const isOperaBrowser = (navigator.userAgent.indexOf('Opera') >= 0); // Not actively used, but kept for historical context

// Localization data storage, mapped by localeIdentifier
const localeData = {
    'en': { months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'], monthsShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'], days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], weekLabel: 'Week', todayLabel: '' },
    'ge': { months: ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'], monthsShort: ['Jan', 'Feb', 'Mar', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'], days: ['Mon', 'Die', 'Mit', 'Don', 'Fre', 'Sam', 'Son'], weekLabel: 'Woche', todayLabel: 'Heute' },
    'no': { months: ['Januar', 'Februar', 'Mars', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Desember'], monthsShort: ['Jan', 'Feb', 'Mar', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Des'], days: ['Man', 'Tir', 'Ons', 'Tor', 'Fre', 'L&oslash;r', 'S&oslash;n'], weekLabel: 'Uke', todayLabel: 'Dagen i dag er' },
    'nl': { months: ['Januari', 'Februari', 'Maart', 'April', 'Mei', 'Juni', 'Juli', 'Augustus', 'September', 'Oktober', 'November', 'December'], monthsShort: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dec'], days: ['Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za', 'Zo'], weekLabel: 'Week', todayLabel: 'Vandaag' },
    'es': { months: ['Enero', 'Febrero', 'Marzo', 'April', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'], monthsShort: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'], days: ['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom'], weekLabel: 'Semana', todayLabel: 'Hoy es' },
    'pt-br': { months: ['Janeiro', 'Fevereiro', 'Mar&ccedil;o', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'], monthsShort: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'], days: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'S&aacute;b', 'Dom'], weekLabel: 'Sem.', todayLabel: 'Hoje &eacute;' },
    'fr': { months: ['Janvier', 'F&eacute;vrier', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Ao&ucirc;t', 'Septembre', 'Octobre', 'Novembre', 'D&eacute;cembre'], monthsShort: ['Jan', 'Fev', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aou', 'Sep', 'Oct', 'Nov', 'Dec'], days: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'], weekLabel: 'Sem', todayLabel: "Aujourd'hui" },
    'da': { months: ['januar', 'februar', 'marts', 'april', 'maj', 'juni', 'juli', 'august', 'september', 'oktober', 'november', 'december'], monthsShort: ['jan', 'feb', 'mar', 'apr', 'maj', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec'], days: ['man', 'tirs', 'ons', 'tors', 'fre', 'l&oslash;r', 's&oslash;n'], weekLabel: 'Uge', todayLabel: 'I dag er den' },
    'hu': { months: ['Január', 'Február', 'Március', 'Április', 'Május', 'Június', 'Július', 'Augusztus', 'Szeptember', 'Október', 'November', 'December'], monthsShort: ['Jan', 'Feb', 'Márc', 'Ápr', 'Máj', 'Jún', 'Júl', 'Aug', 'Szep', 'Okt', 'Nov', 'Dec'], days: ['Hé', 'Ke', 'Sze', 'Cs', 'Pé', 'Szo', 'Vas'], weekLabel: 'Hét', todayLabel: 'Mai nap' },
    'it': { months: ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'], monthsShort: ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lugl', 'Ago', 'Set', 'Ott', 'Nov', 'Dic'], days: ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'], weekLabel: 'Settimana', todayLabel: 'Oggi &egrave; il' },
    'sv': { months: ['Januari', 'Februari', 'Mars', 'April', 'Maj', 'Juni', 'Juli', 'Augusti', 'September', 'Oktober', 'November', 'December'], monthsShort: ['Jan', 'Feb', 'Mar', 'Apr', 'Maj', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dec'], days: ['M&aring;n', 'Tis', 'Ons', 'Tor', 'Fre', 'L&ouml;r', 'S&ouml;n'], weekLabel: 'Vecka', todayLabel: 'Idag &auml;r det den' },
    'cz': { months: ['leden', 'únor', 'březen', 'duben', 'květen', 'červen', 'červenec', 'srpen', 'září', 'říjen', 'listopad', 'prosinec'], monthsShort: ['led', 'ún', 'bř', 'dub', 'kvě', 'čer', 'čer-ec', 'srp', 'zář', 'říj', 'list', 'pros'], days: ['Pon', 'Út', 'St', 'Čt', 'Pá', 'So', 'Ne'], weekLabel: 'týden', todayLabel: '' },
    'cn': { months: ['壹月', '贰月', '叁月', '肆月', '伍月', '陆月', '柒月', '捌月', '玖月', '拾月', '拾壹月', '拾贰月'], monthsShort: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'], days: ['周壹', '周贰', '周叁', '周肆', '周伍', '周陆', '周日'], weekLabel: '', todayLabel: '' }
};

const currentLocale = localeData[localeIdentifier] || localeData['en'];

// Adjust day names array if week starts on Sunday (e.g., for US calendars)
if (startWeekOnSunday) {
    const lastDay = currentLocale.days.pop();
    currentLocale.days.unshift(lastDay);
}

// Default number of days in each month (February is updated for leap years)
const monthDayCounts = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

let activeMonthIndex; // The currently displayed month (0-indexed)
let activeYearValue;  // The currently displayed year
let activeHourValue;  // The currently selected hour
let activeMinuteValue; // The currently selected minute

let calendarGridElement; // The DOM element that holds the day cells

let targetInputReference; // The <input> element to populate with the selected date/time
let outputFormatString;   // The format string for the date/time returned to targetInputReference

let activeMonthDropdownItem;   // Currently highlighted month in dropdown
let activeYearDropdownItem;    // Currently highlighted year in dropdown
let activeHourDropdownItem;    // Currently highlighted hour in dropdown
let activeMinuteDropdownItem;  // Currently highlighted minute in dropdown

// IE iframe shims for dropdowns (to prevent select boxes from showing through)
let ieShimFrame = null;     // Covers the entire calendar
let ieTimeShimFrame = null; // Specifically covers time dropdowns

// Separate output elements for year, month, day, hour, minute (optional)
let outputYearElement;
let outputMonthElement;
let outputDayElement;
let outputHourElement;
let outputMinuteElement;

// Initial date values derived from the input field or current date
let initialYearValue;
let initialMonthValue;
let initialDayValue;
let initialHourValue;
let initialMinuteValue;

const dropdownHighlightColor = '#D60808'; // Color for active dropdown items
const dropdownHoverBgColor = '#E2EBED';   // Background color on dropdown item hover

let dropdownScrollingActive = false; // Flag for continuous scrolling in dropdowns
let currentActiveDropdownElement = null; // The DOM element currently active in a dropdown
let dropdownScrollDirection = 0; // -1 for decrement, 1 for increment during continuous scroll
let dropdownScrollInterval = null; // Interval ID for continuous scrolling

/**
 * Prevents the default action and stops propagation of an event.
 * @param {Event} event - The event object.
 * @returns {boolean} Always returns false.
 */
const preventDefaultAction = (event) => {
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }
    return false;
};

/**
 * Determines if a given year is a leap year.
 * @param {number} year - The year to check.
 * @returns {boolean} True if it's a leap year, false otherwise.
 */
const checkIsLeapYear = (year) => (year % 400 === 0) || (year % 4 === 0 && year % 100 !== 0);

/**
 * Toggles the 'monthYearActive' class on a dropdown item and manages continuous scrolling.
 * This is a generic handler for month, year, hour, and minute dropdown items.
 */
function toggleDropdownSelection() {
    // Remove highlight from previously active dropdown item
    if (currentActiveDropdownElement) {
        currentActiveDropdownElement.classList.remove('monthYearActive');
    }
    currentActiveDropdownElement = this; // Set current item as active

    // Toggle the highlight class
    this.classList.toggle('monthYearActive');

    // Check if the clicked item is a scroll control ('-' or '+')
    const isScrollControl = this.textContent.includes('-') || this.textContent.includes('+');
    dropdownScrollingActive = isScrollControl && this.classList.contains('monthYearActive');
    dropdownScrollDirection = this.textContent.includes('-') ? -1 : 1;

    // Start or stop the continuous scrolling interval
    if (dropdownScrollingActive) {
        if (dropdownScrollInterval) clearInterval(dropdownScrollInterval); // Clear any existing interval
        dropdownScrollInterval = setInterval(() => {
            const parentId = this.parentNode.id;
            if (parentId === 'yearDropDown') updateYearDropdownOptions(null, this);
            else if (parentId === 'hourDropDown') updateHourDropdownOptions(null, this);
            else if (parentId === 'minuteDropDown') updateMinuteDropdownOptions(null, this);
        }, dropdownAnimationSpeedMs);
    } else {
        clearInterval(dropdownScrollInterval); // Stop scrolling when control is deselected or non-control item clicked
        dropdownScrollInterval = null;
    }
}

/**
 * Manages the visibility of a dropdown menu and its associated IE shim.
 * @param {string} dropdownId - The ID of the dropdown element to toggle.
 * @param {string[]} otherDropdownIds - An array of IDs for other dropdowns to hide.
 * @param {string} [shimTargetId] - The ID of the element the IE shim should cover (defaults to dropdownId).
 */
const toggleDropdownVisibility = (dropdownId, otherDropdownIds, shimTargetId = dropdownId) => {
    const targetDropdown = document.getElementById(dropdownId);
    if (!targetDropdown) {
        console.warn(`Dropdown element with ID '${dropdownId}' not found.`);
        return;
    }

    // Toggle display state
    if (targetDropdown.style.display === 'block') {
        targetDropdown.style.display = 'none';
        if (isInternetExplorer) hideIEShimFrame(); // Hide IE shim if closing dropdown
    } else {
        targetDropdown.style.display = 'block';
        // Hide all other specified dropdowns
        otherDropdownIds.forEach(id => {
            const otherDropdown = document.getElementById(id);
            if (otherDropdown) otherDropdown.style.display = 'none';
        });
        if (isInternetExplorer) adjustIEShimPosition(shimTargetId); // Adjust IE shim for the newly opened dropdown
    }
};

// Specific functions to display each type of dropdown
const displayMonthDropdown = () => toggleDropdownVisibility('monthDropDown', ['yearDropDown', 'hourDropDown', 'minuteDropDown']);
const displayYearDropdown = () => toggleDropdownVisibility('yearDropDown', ['monthDropDown', 'hourDropDown', 'minuteDropDown']);
const displayHourDropdown = () => toggleDropdownVisibility('hourDropDown', ['monthDropDown', 'yearDropDown', 'minuteDropDown']);
const displayMinuteDropdown = () => toggleDropdownVisibility('minuteDropDown', ['monthDropDown', 'yearDropDown', 'hourDropDown']);

/**
 * Handles the selection of a month from the dropdown.
 * Updates the display and re-renders the calendar grid.
 */
function handleMonthSelection() {
    const monthTextElement = document.getElementById('calendar_month_txt');
    if (!monthTextElement) {
        console.warn('Calendar month display element not found.');
        return;
    }
    monthTextElement.innerHTML = this.innerHTML;
    activeMonthIndex = parseInt(this.id.replace(/[^\d]/g, ''), 10); // Extract month index from ID

    toggleDropdownVisibility('monthDropDown', [], 'monthDropDown'); // Hide only the month dropdown

    // Remove highlight from all month items, then apply to the selected one
    currentLocale.months.forEach((_, idx) => {
        const monthDiv = document.getElementById(`monthDiv_${idx}`);
        if (monthDiv) monthDiv.style.color = '';
    });
    this.style.color = dropdownHighlightColor;
    activeMonthDropdownItem = this;

    renderCalendarContent(); // Re-render calendar with new month
}

/**
 * Handles the selection of an hour from the dropdown.
 * Updates the display and stores the selected hour value.
 */
function handleHourSelection() {
    const hourTextElement = document.getElementById('calendar_hour_txt');
    if (!hourTextElement) {
        console.warn('Calendar hour display element not found.');
        return;
    }
    hourTextElement.innerHTML = this.innerHTML;
    activeHourValue = parseInt(this.innerHTML.replace(/[^\d]/g, ''), 10);
    toggleDropdownVisibility('hourDropDown', [], 'hourDropDown');

    if (activeHourDropdownItem) {
        activeHourDropdownItem.style.color = '';
    }
    activeHourDropdownItem = this;
    this.style.color = dropdownHighlightColor;
}

/**
 * Handles the selection of a minute from the dropdown.
 * Updates the display and stores the selected minute value.
 */
function handleMinuteSelection() {
    const minuteTextElement = document.getElementById('calendar_minute_txt');
    if (!minuteTextElement) {
        console.warn('Calendar minute display element not found.');
        return;
    }
    minuteTextElement.innerHTML = this.innerHTML;
    activeMinuteValue = parseInt(this.innerHTML.replace(/[^\d]/g, ''), 10);
    toggleDropdownVisibility('minuteDropDown', [], 'minuteDropDown');

    if (activeMinuteDropdownItem) {
        activeMinuteDropdownItem.style.color = '';
    }
    activeMinuteDropdownItem = this;
    this.style.color = dropdownHighlightColor;
}

/**
 * Handles the selection of a year from the dropdown.
 * Updates the display and re-renders the calendar grid.
 */
function handleYearSelection() {
    const yearTextElement = document.getElementById('calendar_year_txt');
    if (!yearTextElement) {
        console.warn('Calendar year display element not found.');
        return;
    }
    yearTextElement.innerHTML = this.innerHTML;
    activeYearValue = parseInt(this.innerHTML.replace(/[^\d]/g, ''), 10);
    toggleDropdownVisibility('yearDropDown', [], 'yearDropDown');

    if (activeYearDropdownItem) {
        activeYearDropdownItem.style.color = '';
    }
    activeYearDropdownItem = this;
    this.style.color = dropdownHighlightColor;
    renderCalendarContent(); // Re-render calendar with new year
}

/**
 * Navigates to the previous or next month based on the clicked arrow image.
 * @param {Event} event - The click event object.
 */
const navigateMonth = (event) => {
    const clickedElement = event.currentTarget;
    if (clickedElement.src.includes('left')) { // Previous month
        activeMonthIndex--;
        if (activeMonthIndex < 0) {
            activeMonthIndex = 11;
            activeYearValue--;
        }
    } else if (clickedElement.src.includes('right')) { // Next month
        activeMonthIndex++;
        if (activeMonthIndex > 11) {
            activeMonthIndex = 0;
            activeYearValue++;
        }
    }
    renderCalendarContent(); // Update the calendar display
};

/**
 * Creates and returns a DIV element containing month names for the dropdown.
 * @returns {HTMLDivElement} The month dropdown container element.
 */
const buildMonthDropdownElements = () => {
    const monthDropdownDiv = document.createElement('DIV');
    monthDropdownDiv.classList.add('monthYearPicker');
    monthDropdownDiv.id = 'monthDropDown';

    currentLocale.months.forEach((monthName, index) => {
        const monthItem = document.createElement('DIV');
        monthItem.innerHTML = monthName;
        monthItem.onmouseover = toggleDropdownSelection;
        monthItem.onmouseout = toggleDropdownSelection;
        monthItem.onclick = handleMonthSelection;
        monthItem.id = `monthDiv_${index}`;
        monthItem.style.width = '56px'; // Fixed width for consistent layout
        monthItem.onselectstart = preventDefaultAction; // Prevent text selection
        monthDropdownDiv.appendChild(monthItem);

        if (activeMonthIndex === index) {
            monthItem.style.color = dropdownHighlightColor;
            activeMonthDropdownItem = monthItem;
        }
    });
    return monthDropdownDiv;
};

/**
 * Creates and returns a DIV element containing year options for the dropdown.
 * Includes scroll controls ('-' and '+').
 * @returns {HTMLDivElement} The year dropdown container element.
 */
const buildYearDropdownElements = () => {
    const yearDropdownDiv = document.createElement('DIV');
    yearDropdownDiv.classList.add('monthYearPicker');
    yearDropdownDiv.id = 'yearDropDown';

    // Helper function to create scroll control buttons
    const createScrollControl = (text) => {
        const controlDiv = document.createElement('DIV');
        controlDiv.textContent = text;
        controlDiv.classList.add('monthYearPicker_control');
        controlDiv.onmouseover = toggleDropdownSelection;
        controlDiv.onmouseout = toggleDropdownSelection;
        controlDiv.onclick = (e) => {
            updateYearDropdownOptions(e); // Update options on click
            e.stopPropagation(); // Prevent dropdown from immediately closing
        };
        controlDiv.onselectstart = preventDefaultAction;
        return controlDiv;
    };

    yearDropdownDiv.appendChild(createScrollControl('-')); // Add decrement button

    const currentYear = new Date().getFullYear();
    let startYear = currentYear - 5;
    let endYear = currentYear + 5;

    if (restrictYearRange) { // Apply year range restriction if enabled
        startYear = currentYear;
        endYear = currentYear + 1;
    }

    // Populate year options
    for (let i = startYear; i <= endYear; i++) {
        const yearItem = document.createElement('DIV');
        yearItem.textContent = i;
        yearItem.onmouseover = toggleDropdownSelection;
        yearItem.onmouseout = toggleDropdownSelection;
        yearItem.onclick = handleYearSelection;
        yearItem.id = `yearDiv${i}`;
        yearItem.onselectstart = preventDefaultAction;
        yearDropdownDiv.appendChild(yearItem);

        if (activeYearValue === i) {
            yearItem.style.color = dropdownHighlightColor;
            activeYearDropdownItem = yearItem;
        }
    }
    yearDropdownDiv.appendChild(createScrollControl('+')); // Add increment button
    return yearDropdownDiv;
};

/**
 * Updates the options displayed within the year dropdown based on scroll direction.
 * This is triggered by clicking or holding on the '-' or '+' buttons.
 * @param {Event} [event] - The event object (optional).
 * @param {HTMLElement} [callingElement] - The element that triggered the update (optional, for interval calls).
 */
const updateYearDropdownOptions = (event, callingElement) => {
    const inputObj = callingElement || event.currentTarget;
    const yearItems = Array.from(inputObj.parentNode.querySelectorAll('div'));

    if (yearItems.length < 3) { // Expects at least '-', a year, and '+'
        console.warn('Year dropdown structure is incomplete.');
        return;
    }

    // Determine the first year currently visible in the dropdown
    const currentFirstYearInView = parseInt(yearItems[1].textContent, 10);
    let newStartYear;

    if (inputObj.textContent.includes('-')) {
        newStartYear = currentFirstYearInView - 1;
    } else { // '+'
        newStartYear = currentFirstYearInView + 1;
    }

    // Clear previous highlight
    if (activeYearDropdownItem) {
        activeYearDropdownItem.style.color = '';
    }

    // Update the text content and IDs for the visible year options
    for (let i = 1; i < yearItems.length - 1; i++) { // Skip the control buttons
        const currentOptionYear = newStartYear + i - 1;
        yearItems[i].textContent = currentOptionYear;
        yearItems[i].id = `yearDiv${currentOptionYear}`;
    }

    // Re-highlight the active year if it's currently visible in the dropdown
    const currentYearElement = document.getElementById(`yearDiv${activeYearValue}`);
    if (currentYearElement) {
        activeYearDropdownItem = currentYearElement;
        activeYearDropdownItem.style.color = dropdownHighlightColor;
    }
};

/**
 * Creates and returns a DIV element containing hour options for the dropdown.
 * Includes scroll controls ('-' and '+').
 * @returns {HTMLDivElement} The hour dropdown container element.
 */
const buildHourDropdownElements = () => {
    const hourDropdownDiv = document.createElement('DIV');
    hourDropdownDiv.classList.add('monthYearPicker');
    hourDropdownDiv.id = 'hourDropDown';

    const createScrollControl = (text) => {
        const controlDiv = document.createElement('DIV');
        controlDiv.textContent = text;
        controlDiv.classList.add('monthYearPicker_control');
        controlDiv.onmouseover = toggleDropdownSelection;
        controlDiv.onmouseout = toggleDropdownSelection;
        controlDiv.onclick = (e) => {
            updateHourDropdownOptions(e);
            e.stopPropagation();
        };
        controlDiv.onselectstart = preventDefaultAction;
        return controlDiv;
    };

    hourDropdownDiv.appendChild(createScrollControl('-'));

    // Display a range of hours around the current active hour
    const startHourDisplay = Math.max(0, activeHourValue - 3); // Start display a few hours before current
    for (let i = 0; i < 7; i++) { // Display 7 hours at a time
        const hour = startHourDisplay + i;
        if (hour > 23) break; // Don't show hours beyond 23

        const hourItem = document.createElement('DIV');
        hourItem.textContent = hour < 10 ? `0${hour}` : `${hour}`; // Format with leading zero
        hourItem.onmouseover = toggleDropdownSelection;
        hourItem.onmouseout = toggleDropdownSelection;
        hourItem.onclick = handleHourSelection;
        hourItem.id = `hourDiv${hour}`;
        hourItem.onselectstart = preventDefaultAction;
        hourDropdownDiv.appendChild(hourItem);

        if (activeHourValue === hour) {
            hourItem.style.color = dropdownHighlightColor;
            activeHourDropdownItem = hourItem;
        }
    }
    hourDropdownDiv.appendChild(createScrollControl('+'));
    return hourDropdownDiv;
};

/**
 * Updates the options displayed within the hour dropdown based on scroll direction.
 * @param {Event} [event] - The event object (optional).
 * @param {HTMLElement} [callingElement] - The element that triggered the update (optional).
 */
const updateHourDropdownOptions = (event, callingElement) => {
    const inputObj = callingElement || event.currentTarget;
    const hourItems = Array.from(inputObj.parentNode.querySelectorAll('div'));

    if (hourItems.length < 3) {
        console.warn('Hour dropdown structure is incomplete.');
        return;
    }

    const currentFirstHourInView = parseInt(hourItems[1].textContent, 10);
    let newStartHour;

    if (inputObj.textContent.includes('-')) {
        newStartHour = currentFirstHourInView - 1;
        if (newStartHour < 0) newStartHour = 0; // Clamp at 0
    } else { // '+'
        newStartHour = currentFirstHourInView + 1;
        if (newStartHour > 23 - (hourItems.length - 3)) newStartHour = 23 - (hourItems.length - 3); // Ensure last hour doesn't exceed 23
        if (newStartHour < 0) newStartHour = 0; // Guard against negative if few items
    }

    if (activeHourDropdownItem) {
        activeHourDropdownItem.style.color = '';
    }

    for (let i = 1; i < hourItems.length - 1; i++) {
        const currentOptionHour = newStartHour + i - 1;
        if (currentOptionHour > 23) { // Hide extra slots if scrolling past 23
            hourItems[i].textContent = '';
            hourItems[i].id = '';
        } else {
            const formattedHour = currentOptionHour < 10 ? `0${currentOptionHour}` : `${currentOptionHour}`;
            hourItems[i].textContent = formattedHour;
            hourItems[i].id = `hourDiv${currentOptionHour}`;
        }
    }

    const currentHourElement = document.getElementById(`hourDiv${activeHourValue}`);
    if (currentHourElement) {
        activeHourDropdownItem = currentHourElement;
        activeHourDropdownItem.style.color = dropdownHighlightColor;
    }
};

/**
 * Creates and returns a DIV element containing minute options for the dropdown.
 * Includes scroll controls ('-' and '+').
 * @returns {HTMLDivElement} The minute dropdown container element.
 */
const buildMinuteDropdownElements = () => {
    const minuteDropdownDiv = document.createElement('DIV');
    minuteDropdownDiv.classList.add('monthYearPicker');
    minuteDropdownDiv.id = 'minuteDropDown';

    const createScrollControl = (text) => {
        const controlDiv = document.createElement('DIV');
        controlDiv.textContent = text;
        controlDiv.classList.add('monthYearPicker_control');
        controlDiv.onmouseover = toggleDropdownSelection;
        controlDiv.onmouseout = toggleDropdownSelection;
        controlDiv.onclick = (e) => {
            updateMinuteDropdownOptions(e);
            e.stopPropagation();
        };
        controlDiv.onselectstart = preventDefaultAction;
        return controlDiv;
    };

    minuteDropdownDiv.appendChild(createScrollControl('-'));

    // Display a range of minutes around the current active minute, aligned to interval
    const startMinuteDisplay = activeMinuteValue - (activeMinuteValue % minuteDropdownInterval);
    for (let i = 0; i < 7; i++) { // Display 7 minute options at a time
        const minute = startMinuteDisplay + i * minuteDropdownInterval;
        if (minute >= 60) break; // Don't show minutes beyond 59

        const minuteItem = document.createElement('DIV');
        minuteItem.textContent = minute < 10 ? `0${minute}` : `${minute}`;
        minuteItem.onmouseover = toggleDropdownSelection;
        minuteItem.onmouseout = toggleDropdownSelection;
        minuteItem.onclick = handleMinuteSelection;
        minuteItem.id = `minuteDiv${minute}`;
        minuteItem.onselectstart = preventDefaultAction;
        minuteDropdownDiv.appendChild(minuteItem);

        if (activeMinuteValue === minute) {
            minuteItem.style.color = dropdownHighlightColor;
            activeMinuteDropdownItem = minuteItem;
        }
    }
    minuteDropdownDiv.appendChild(createScrollControl('+'));
    return minuteDropdownDiv;
};

/**
 * Updates the options displayed within the minute dropdown based on scroll direction.
 * @param {Event} [event] - The event object (optional).
 * @param {HTMLElement} [callingElement] - The element that triggered the update (optional).
 */
const updateMinuteDropdownOptions = (event, callingElement) => {
    const inputObj = callingElement || event.currentTarget;
    const minuteItems = Array.from(inputObj.parentNode.querySelectorAll('div'));

    if (minuteItems.length < 3) {
        console.warn('Minute dropdown structure is incomplete.');
        return;
    }

    const currentFirstMinuteInView = parseInt(minuteItems[1].textContent, 10);
    let newStartMinute;

    if (inputObj.textContent.includes('-')) {
        newStartMinute = currentFirstMinuteInView - minuteDropdownInterval;
        if (newStartMinute < 0) newStartMinute = 0; // Clamp at 0
    } else { // '+'
        newStartMinute = currentFirstMinuteInView + minuteDropdownInterval;
        // Ensure the last displayed minute does not exceed 59
        const maxDisplayableMinute = 59 - ((minuteItems.length - 3) * minuteDropdownInterval);
        if (newStartMinute > maxDisplayableMinute) newStartMinute = maxDisplayableMinute;
        if (newStartMinute < 0) newStartMinute = 0; // Guard against negative if interval is large
    }

    if (activeMinuteDropdownItem) {
        activeMinuteDropdownItem.style.color = '';
    }

    let visibleMinuteCount = 0;
    for (let i = 1; i < minuteItems.length - 1; i++) {
        const currentOptionMinute = newStartMinute + (visibleMinuteCount * minuteDropdownInterval);
        if (currentOptionMinute > 59) { // Clear extra slots if scrolling past 59
            minuteItems[i].textContent = '';
            minuteItems[i].id = '';
        } else {
            const formattedMinute = currentOptionMinute < 10 ? `0${currentOptionMinute}` : `${currentOptionMinute}`;
            minuteItems[i].textContent = formattedMinute;
            minuteItems[i].id = `minuteDiv${currentOptionMinute}`;
            visibleMinuteCount++;
        }
    }

    const currentMinuteElement = document.getElementById(`minuteDiv${activeMinuteValue}`);
    if (currentMinuteElement) {
        activeMinuteDropdownItem = currentMinuteElement;
        activeMinuteDropdownItem.style.color = dropdownHighlightColor;
    }
};

/**
 * Gets the absolute top pixel position of an HTML element relative to the document.
 * @param {HTMLElement} element - The element to query.
 * @returns {number} The absolute top position.
 */
const getTopPosition = (element) => {
    let top = 0;
    let currentElement = element;
    if (currentElement.offsetParent) {
        do {
            top += currentElement.offsetTop;
            currentElement = currentElement.offsetParent;
        } while (currentElement.offsetParent);
    }
    return top;
};

/**
 * Gets the absolute left pixel position of an HTML element relative to the document.
 * @param {HTMLElement} element - The element to query.
 * @returns {number} The absolute left position.
 */
const getLeftPosition = (element) => {
    let left = 0;
    let currentElement = element;
    if (currentElement.offsetParent) {
        do {
            left += currentElement.offsetLeft;
            currentElement = currentElement.offsetParent;
        } while (currentElement.offsetParent);
    }
    return left;
};

/**
 * Displays the calendar popup and initializes its state.
 * @param {HTMLElement} targetInput - The input field that triggered the calendar.
 * @param {string} formatString - The format string for the returned date (e.g., 'dd.mm.yyyy hh:ii').
 * @param {boolean} showTime - Whether to enable or disable time selection for this instance.
 * @param {HTMLElement} [yearTarget] - Optional element to output year to.
 * @param {HTMLElement} [monthTarget] - Optional element to output month to.
 * @param {HTMLElement} [dayTarget] - Optional element to output day to.
 * @param {HTMLElement} [hourTarget] - Optional element to output hour to.
 * @param {HTMLElement} [minuteTarget] - Optional element to output minute to.
 */
const showCalendarPopup = (targetInput, formatString, showTime, yearTarget, monthTarget, dayTarget, hourTarget, minuteTarget) => {
    if (!mainCalendarContainer) {
        console.error('Calendar module not initialized. Call initializeCalendarModule() first.');
        return;
    }

    // Store references for later use
    targetInputReference = targetInput;
    outputFormatString = formatString;
    enableTimeSelection = showTime; // Override global setting if specified
    outputYearElement = yearTarget;
    outputMonthElement = monthTarget;
    outputDayElement = dayTarget;
    outputHourElement = hourTarget;
    outputMinuteElement = minuteTarget;

    const today = new Date();
    initialYearValue = today.getFullYear();
    initialMonthValue = today.getMonth();
    initialDayValue = today.getDate();
    initialHourValue = today.getHours();
    initialMinuteValue = today.getMinutes();

    let inputDate = new Date(); // Default to today's date
    // Attempt to parse existing input value for initial calendar state
    if (targetInput.value) {
        try {
            // A basic parsing strategy; a more robust solution would respect formatString
            const parts = targetInput.value.match(/(\d+)/g);
            if (parts && parts.length >= 3) {
                let d = parseInt(parts[0], 10);
                let m = parseInt(parts[1], 10);
                let y = parseInt(parts[2], 10);

                // Basic validation for date parts
                if (y < 1000 || y > 3000 || m < 1 || m > 12 || d < 1 || d > 31) {
                    throw new Error('Invalid date parts in input, using current date.');
                }
                inputDate = new Date(y, m - 1, d); // Month is 0-indexed for Date object

                if (enableTimeSelection && parts.length >= 5) {
                    initialHourValue = parseInt(parts[3], 10);
                    initialMinuteValue = parseInt(parts[4], 10);
                    // Basic validation for time parts
                    if (initialHourValue < 0 || initialHourValue > 23 || initialMinuteValue < 0 || initialMinuteValue > 59) {
                         throw new Error('Invalid time parts in input, using current time.');
                    }
                }
            }
        } catch (e) {
            console.warn('Could not parse input date, falling back to current date/time:', e.message);
        }
    }

    // Set the initial active date and time for the calendar display
    activeMonthIndex = inputDate.getMonth();
    activeYearValue = inputDate.getFullYear();
    activeHourValue = initialHourValue;
    // Align initial minute to the specified interval
    activeMinuteValue = initialMinuteValue - (initialMinuteValue % minuteDropdownInterval);

    // Render the calendar grid and dropdowns
    renderCalendarContent();

    // Position the calendar relative to the target input field
    const calendarTop = getTopPosition(targetInput) + targetInput.offsetHeight + verticalOffsetPx;
    const calendarLeft = getLeftPosition(targetInput) + horizontalOffsetPx;

    mainCalendarContainer.style.top = `${calendarTop}px`;
    mainCalendarContainer.style.left = `${calendarLeft}px`;
    mainCalendarContainer.style.display = 'block';

    // Handle IE iframe shim for the main calendar
    if (isInternetExplorer) {
        if (!ieShimFrame) { // Create iframe only once
            ieShimFrame = document.createElement('IFRAME');
            ieShimFrame.style.position = 'absolute';
            ieShimFrame.style.border = '0px';
            ieShimFrame.style.zIndex = parseInt(mainCalendarContainer.style.zIndex, 10) - 1; // Position behind calendar
            ieShimFrame.frameBorder = '0';
            document.body.appendChild(ieShimFrame);
        }
        ieShimFrame.style.left = `${calendarLeft}px`;
        ieShimFrame.style.top = `${calendarTop}px`;
        ieShimFrame.style.width = mainCalendarContainer.offsetWidth + 'px';
        ieShimFrame.style.height = mainCalendarContainer.offsetHeight + 'px';
        ieShimFrame.style.display = 'block';
    }

    // Handle IE iframe shim for time dropdowns (if enabled)
    if (isInternetExplorer && enableTimeSelection && !ieTimeShimFrame) {
        ieTimeShimFrame = document.createElement('IFRAME');
        ieTimeShimFrame.style.position = 'absolute';
        ieTimeShimFrame.style.border = '0px';
        ieTimeShimFrame.style.zIndex = parseInt(mainCalendarContainer.style.zIndex, 10) - 1; // Behind dropdowns
        ieTimeShimFrame.frameBorder = '0';
        document.body.appendChild(ieTimeShimFrame);
    }
};

/**
 * Adjusts the position and size of the IE shim iframe to cover a dropdown.
 * @param {string} targetElementId - The ID of the dropdown element to cover.
 */
const adjustIEShimPosition = (targetElementId) => {
    if (!ieTimeShimFrame) return;

    const targetElement = document.getElementById(targetElementId);
    if (!targetElement) {
        console.warn(`Target element with ID '${targetElementId}' not found for IE shim adjustment.`);
        return;
    }

    ieTimeShimFrame.style.display = 'block';
    ieTimeShimFrame.style.height = targetElement.offsetHeight + 1 + 'px';
    ieTimeShimFrame.style.width = targetElement.offsetWidth + 'px';
    ieTimeShimFrame.style.left = (getLeftPosition(targetElement) + 1 - horizontalOffsetPx) + 'px';
    ieTimeShimFrame.style.top = (getTopPosition(targetElement) - targetElement.offsetHeight - verticalOffsetPx) + 'px';
};

/**
 * Hides the IE shim iframe for dropdowns.
 */
const hideIEShimFrame = () => {
    if (ieTimeShimFrame) ieTimeShimFrame.style.display = 'none';
};

/**
 * Hides the calendar popup and all associated IE shims.
 */
const hideCalendarPopup = () => {
    if (mainCalendarContainer) {
        mainCalendarContainer.style.display = 'none';
        if (isInternetExplorer) {
            if (ieShimFrame) ieShimFrame.style.display = 'none';
            if (ieTimeShimFrame) ieTimeShimFrame.style.display = 'none';
        }
    }
};

/**
 * Renders the calendar grid content (days, week numbers) for the active month and year.
 * Also updates the month/year display and the "Today is" footer.
 */
const renderCalendarContent = () => {
    if (!calendarGridElement) {
        console.error('Calendar grid element not found for rendering.');
        return;
    }

    // Update month and year text in the header
    const monthText = document.getElementById('calendar_month_txt');
    const yearText = document.getElementById('calendar_year_txt');
    if (monthText) monthText.innerHTML = currentLocale.months[activeMonthIndex];
    if (yearText) yearText.innerHTML = activeYearValue;

    // Update hour and minute text if time selection is enabled
    const hourText = document.getElementById('calendar_hour_txt');
    const minuteText = document.getElementById('calendar_minute_txt');
    if (enableTimeSelection) {
        if (hourText) hourText.innerHTML = activeHourValue < 10 ? `0${activeHourValue}` : `${activeHourValue}`;
        if (minuteText) minuteText.innerHTML = activeMinuteValue < 10 ? `0${activeMinuteValue}` : `${activeMinuteValue}`;
    }

    calendarGridElement.innerHTML = ''; // Clear existing day cells

    const totalDaysInMonth = getDaysInMonth(activeMonthIndex, activeYearValue);
    const firstDayOfMonth = new Date(activeYearValue, activeMonthIndex, 1).getDay(); // 0 = Sunday, 1 = Monday...

    // Adjust the starting day offset based on locale's week start preference
    let startOffset = firstDayOfMonth;
    if (!startWeekOnSunday) { // If week starts on Monday, Sunday (0) should be last day (6)
        startOffset = (firstDayOfMonth === 0) ? 6 : firstDayOfMonth - 1;
    }

    let currentRow = document.createElement('div');
    currentRow.classList.add('calendar_row');
    calendarGridElement.appendChild(currentRow);

    // Add day headers (Mon, Tue, etc.)
    currentLocale.days.forEach(dayName => {
        const dayHeader = document.createElement('div');
        dayHeader.classList.add('calendar_day_header');
        dayHeader.innerHTML = dayName;
        currentRow.appendChild(dayHeader);
    });

    // Add week number header if enabled
    if (displayWeekNumbers) {
        const weekHeader = document.createElement('div');
        weekHeader.classList.add('calendar_week_header');
        weekHeader.innerHTML = currentLocale.weekLabel;
        currentRow.appendChild(weekHeader);
    }

    currentRow = document.createElement('div');
    currentRow.classList.add('calendar_row');
    calendarGridElement.appendChild(currentRow);

    // Create empty cells for days before the 1st of the month
    for (let i = 0; i < startOffset; i++) {
        const emptyCell = document.createElement('div');
        emptyCell.classList.add('calendar_day_cell', 'calendar_blank_day');
        currentRow.appendChild(emptyCell);
    }

    let dayCounter = 1;
    let currentWeek = calcWeek(activeYearValue, activeMonthIndex, 1);

    // Populate day cells for the month
    // Loop for a maximum of 6 weeks (42 cells) to cover all possible month layouts
    for (let i = 0; i < 6 * 7; i++) {
        // Start a new row every 7 days
        if (i % 7 === 0 && i !== 0) {
            // Add week number to the end of the completed row
            if (displayWeekNumbers) {
                const weekNumCell = document.createElement('div');
                weekNumCell.classList.add('calendar_week_number');
                weekNumCell.textContent = currentWeek;
                currentRow.appendChild(weekNumCell);
            }
            currentRow = document.createElement('div');
            currentRow.classList.add('calendar_row');
            calendarGridElement.appendChild(currentRow);
            // Recalculate week number for the first day of the new row
            currentWeek = calcWeek(activeYearValue, activeMonthIndex, dayCounter);
        }

        const dayCell = document.createElement('div');
        dayCell.classList.add('calendar_day_cell');

        if (i >= startOffset && dayCounter <= totalDaysInMonth) {
            // This is an actual day of the month
            dayCell.textContent = dayCounter;
            dayCell.onclick = () => handleDateSelection(dayCounter);

            // Highlight today's date
            const today = new Date();
            if (dayCounter === today.getDate() && activeMonthIndex === today.getMonth() && activeYearValue === today.getFullYear()) {
                dayCell.classList.add('calendar_today_highlight');
            }
            dayCounter++;
        } else {
            // These are blank cells (before 1st or after last day)
            dayCell.classList.add('calendar_blank_day');
        }
        currentRow.appendChild(dayCell);
    }

    // Add the week number for the last row if it wasn't added in the loop
    if (displayWeekNumbers && currentRow.children.length === 7) {
        const weekNumCell = document.createElement('div');
        weekNumCell.classList.add('calendar_week_number');
        weekNumCell.textContent = currentWeek;
        currentRow.appendChild(weekNumCell);
    }

    // Update the "Today is" information in the footer
    const todayInfoElement = document.getElementById('calendar_today_info');
    if (todayInfoElement) {
        const today = new Date();
        const formattedTodayString = formatTodayString(today);
        todayInfoElement.innerHTML = formattedTodayString;
        todayInfoElement.onclick = () => handleTodaySelection(today);
    }

    // Adjust IE shim size if calendar content changed its dimensions
    if (isInternetExplorer && ieShimFrame) {
        ieShimFrame.style.width = mainCalendarContainer.offsetWidth + 'px';
        ieShimFrame.style.height = mainCalendarContainer.offsetHeight + 'px';
    }
};

/**
 * Handles the selection of a specific date from the calendar grid.
 * Updates the target input and hides the calendar.
 * @param {number} day - The selected day of the month.
 */
const handleDateSelection = (day) => {
    // Create a new Date object using the active year, month, and selected day/time
    const selectedDate = new Date(activeYearValue, activeMonthIndex, day, activeHourValue, activeMinuteValue);
    updateTargetInput(selectedDate); // Update the output field(s)
    hideCalendarPopup(); // Close the calendar
};

/**
 * Handles the selection of today's date from the footer link.
 * @param {Date} todayDate - The current date object.
 */
const handleTodaySelection = (todayDate) => {
    // Use current active hour/minute if time selection is enabled, otherwise default to 00:00
    const finalHour = enableTimeSelection ? activeHourValue : 0;
    const finalMinute = enableTimeSelection ? activeMinuteValue : 0;
    const selectedDate = new Date(todayDate.getFullYear(), todayDate.getMonth(), todayDate.getDate(), finalHour, finalMinute);
    updateTargetInput(selectedDate);
    hideCalendarPopup();
};

/**
 * Updates the target input field and/or separate output elements with the selected date.
 * @param {Date} selectedDate - The Date object to format and output.
 */
const updateTargetInput = (selectedDate) => {
    if (!targetInputReference) return; // Guard clause if no target input is set

    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth() + 1; // Convert to 1-indexed month
    const day = selectedDate.getDate();
    const hour = selectedDate.getHours();
    const minute = selectedDate.getMinutes();

    let outputString = outputFormatString;

    // Replace date placeholders
    outputString = outputString.replace(/yyyy/g, year.toString());
    outputString = outputString.replace(/yy/g, year.toString().substring(2, 4)); // Last two digits of year
    outputString = outputString.replace(/mm/g, month < 10 ? `0${month}` : month.toString()); // Month with leading zero
    outputString = outputString.replace(/m/g, month.toString()); // Month without leading zero
    outputString = outputString.replace(/dd/g, day < 10 ? `0${day}` : day.toString()); // Day with leading zero
    outputString = outputString.replace(/d/g, day.toString()); // Day without leading zero

    // Replace time placeholders if time selection is enabled
    if (enableTimeSelection) {
        outputString = outputString.replace(/hh/g, hour < 10 ? `0${hour}` : hour.toString()); // Hour with leading zero
        outputString = outputString.replace(/h/g, hour.toString()); // Hour without leading zero
        outputString = outputString.replace(/ii/g, minute < 10 ? `0${minute}` : minute.toString()); // Minute with leading zero (using 'ii' to avoid 'm' conflict)
        outputString = outputString.replace(/i/g, minute.toString()); // Minute without leading zero
    } else {
        // Remove any time-related placeholders if time selection is disabled
        outputString = outputString.replace(/hh|h|ii|i/g, '').trim();
    }

    targetInputReference.value = outputString; // Set the value of the primary input field

    // Update separate output elements if they were provided
    if (outputYearElement) outputYearElement.value = year;
    if (outputMonthElement) outputMonthElement.value = month;
    if (outputDayElement) outputDayElement.value = day;
    if (enableTimeSelection) {
        if (outputHourElement) outputHourElement.value = hour;
        if (outputMinuteElement) outputMinuteElement.value = minute;
    }
};

/**
 * Calculates the number of days in a given month for a specific year.
 * Accounts for leap years in February.
 * @param {number} monthIndex - The 0-indexed month (0 for January, 11 for December).
 * @param {number} year - The full year (e.g., 2023).
 * @returns {number} The number of days in the specified month.
 */
const getDaysInMonth = (monthIndex, year) => {
    if (monthIndex === 1 && checkIsLeapYear(year)) { // February in a leap year
        return 29;
    }
    return monthDayCounts[monthIndex]; // Use predefined array for other months
};

/**
 * Calculates the ISO 8601 week number for a given date.
 * @param {number} year - The full year.
 * @param {number} monthIndex - The 0-indexed month.
 * @param {number} day - The day of the month.
 * @returns {number} The ISO week number (1-53).
 */
const calcWeek = (year, monthIndex, day) => {
    const date = new Date(year, monthIndex, day);
    // Set to nearest Thursday to ensure it's within the correct ISO week
    date.setDate(date.getDate() + 4 - (date.getDay() || 7));
    const yearStart = new Date(date.getFullYear(), 0, 1);
    // Calculate week number: (days since year start + 1) / 7, then round up
    return Math.ceil((((date - yearStart) / 86400000) + 1) / 7);
};

/**
 * Formats the "Today is" string for the calendar footer based on the current locale and format.
 * @param {Date} date - The Date object representing today.
 * @returns {string} The formatted string for the footer.
 */
const formatTodayString = (date) => {
    let formatted = currentDayFormat;
    const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday...

    // Adjust day of week string based on week start preference
    const adjustedDayOfWeekIndex = (dayOfWeek === 0 && !startWeekOnSunday) ? 6 : dayOfWeek - (startWeekOnSunday ? 0 : 1);
    const dayOfWeekString = currentLocale.days[adjustedDayOfWeekIndex];
    const capitalizedDayOfWeekString = dayOfWeekString.charAt(0).toUpperCase() + dayOfWeekString.slice(1);

    // Replace placeholders in the format string
    formatted = formatted.replace(/\[todayLabel\]/g, currentLocale.todayLabel);
    formatted = formatted.replace(/\[dayString\]/g, dayOfWeekString);
    formatted = formatted.replace(/\[UCFdayString\]/g, capitalizedDayOfWeekString);
    formatted = formatted.replace(/\[dayOfMonth\]/g, date.getDate());
    formatted = formatted.replace(/\[monthName\]/g, currentLocale.months[date.getMonth()]);
    formatted = formatted.replace(/\[currentYear\]/g, date.getFullYear());
    return formatted;
};

/**
 * Attaches an event listener to an element, providing cross-browser compatibility.
 * @param {EventTarget} element - The DOM element or window to attach the listener to.
 * @param {string} eventType - The type of event (e.g., 'click', 'load').
 * @param {Function} handler - The function to execute when the event occurs.
 */
const attachEventHandler = (element, eventType, handler) => {
    if (element.addEventListener) {
        element.addEventListener(eventType, handler, false);
    } else if (element.attachEvent) { // Legacy IE support
        element.attachEvent(`on${eventType}`, handler);
    } else {
        element[`on${eventType}`] = handler; // Fallback for very old browsers
    }
};

/**
 * Initializes the calendar module by creating the main calendar DOM structure.
 * This function should be called once when the page loads to set up the calendar.
 */
const initializeCalendarModule = () => {
    mainCalendarContainer = document.createElement('DIV');
    mainCalendarContainer.id = 'calendar_div';
    mainCalendarContainer.style.zIndex = '10000'; // Ensure calendar appears on top
    mainCalendarContainer.style.display = 'none'; // Initially hidden
    document.body.appendChild(mainCalendarContainer);

    // Create calendar header
    const headerDiv = document.createElement('DIV');
    headerDiv.id = 'calendar_header';
    mainCalendarContainer.appendChild(headerDiv);

    // Left month navigation arrow
    const leftMonthNav = document.createElement('IMG');
    leftMonthNav.src = `${assetPath}left.gif`;
    leftMonthNav.classList.add('calendar_nav_arrow');
    leftMonthNav.onclick = navigateMonth;
    headerDiv.appendChild(leftMonthNav);

    // Month display element (clickable to open month dropdown)
    const monthDisplay = document.createElement('DIV');
    monthDisplay.id = 'calendar_month_txt';
    monthDisplay.onclick = displayMonthDropdown;
    headerDiv.appendChild(monthDisplay);

    // Year display element (clickable to open year dropdown)
    const yearDisplay = document.createElement('DIV');
    yearDisplay.id = 'calendar_year_txt';
    yearDisplay.onclick = displayYearDropdown;
    headerDiv.appendChild(yearDisplay);

    // Right month navigation arrow
    const rightMonthNav = document.createElement('IMG');
    rightMonthNav.src = `${assetPath}right.gif`;
    rightMonthNav.classList.add('calendar_nav_arrow');
    rightMonthNav.onclick = navigateMonth;
    headerDiv.appendChild(rightMonthNav);

    // Time controls (only if enableTimeSelection is true)
    if (enableTimeSelection) {
        const timeControlsDiv = document.createElement('DIV');
        timeControlsDiv.id = 'calendar_time_controls';
        headerDiv.appendChild(timeControlsDiv);

        const hourDisplay = document.createElement('SPAN');
        hourDisplay.id = 'calendar_hour_txt';
        hourDisplay.onclick = displayHourDropdown;
        timeControlsDiv.appendChild(hourDisplay);

        const separator = document.createElement('SPAN');
        separator.textContent = ':';
        timeControlsDiv.appendChild(separator);

        const minuteDisplay = document.createElement('SPAN');
        minuteDisplay.id = 'calendar_minute_txt';
        minuteDisplay.onclick = displayMinuteDropdown;
        timeControlsDiv.appendChild(minuteDisplay);
    }

    // Calendar grid container (where days are rendered)
    calendarGridElement = document.createElement('DIV');
    calendarGridElement.id = 'calendar_grid';
    mainCalendarContainer.appendChild(calendarGridElement);

    // "Today is" footer element
    const todayInfoDiv = document.createElement('DIV');
    todayInfoDiv.id = 'calendar_today_info';
    mainCalendarContainer.appendChild(todayInfoDiv);

    // Append dropdown containers (initially hidden by CSS)
    mainCalendarContainer.appendChild(buildMonthDropdownElements());
    mainCalendarContainer.appendChild(buildYearDropdownElements());
    if (enableTimeSelection) {
        mainCalendarContainer.appendChild(buildHourDropdownElements());
        mainCalendarContainer.appendChild(buildMinuteDropdownElements());
    }

    // Add a global click listener to hide the calendar when clicking outside it
    attachEventHandler(document, 'click', (event) => {
        if (mainCalendarContainer && mainCalendarContainer.style.display === 'block') {
            let target = event.target;
            let isInsideCalendar = false;
            // Traverse up the DOM tree to check if click was inside the calendar or its target input
            while (target && target !== document.body) {
                if (target === mainCalendarContainer || (targetInputReference && target === targetInputReference)) {
                    isInsideCalendar = true;
                    break;
                }
                target = target.parentNode;
            }
            if (!isInsideCalendar) {
                hideCalendarPopup();
            }
        }
    });

    // Prevent clicks within the calendar from propagating and triggering the document-wide hide listener
    attachEventHandler(mainCalendarContainer, 'click', preventDefaultAction);
};

// Expose the main calendar display function globally
window.showCalendarPopup = showCalendarPopup;

// Initialize the calendar module once the entire page has loaded
attachEventHandler(window, 'load', initializeCalendarModule);