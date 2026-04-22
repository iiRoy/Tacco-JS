'use strict';

const dateManipulator = (function() {
    const monthNamesCollection = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    function calculateDaysInMonth(yearValue, monthValue) {
        return new Date(yearValue, monthValue + 1, 0).getDate();
    }

    function retrieveMonthName(monthNumber) {
        return monthNamesCollection[monthNumber];
    }

    function parseInputToDate(textValue) {
        if (!textValue || typeof textValue !== 'string') return null;
        const components = textValue.split('-');
        if (components.length !== 3) return null;
        const yearComponent = parseInt(components[0], 10);
        const monthComponent = parseInt(components[1], 10) - 1;
        const dayComponent = parseInt(components[2], 10);

        if (isNaN(yearComponent) || isNaN(monthComponent) || isNaN(dayComponent)) return null;
        if (monthComponent < 0 || monthComponent > 11) return null;
        if (dayComponent < 1 || dayComponent > 31) return null;

        return new Date(yearComponent, monthComponent, dayComponent);
    }

    function formatDateObject(dateObject, pattern) {
        if (!(dateObject instanceof Date) || isNaN(dateObject)) return '';

        const fullYear = dateObject.getFullYear();
        const monthIndex = dateObject.getMonth() + 1;
        const dayOfMonth = dateObject.getDate();

        let outputString = String(pattern || 'yyyy-mm-dd');

        outputString = outputString
            .replace(/yyyy/g, String(fullYear))
            .replace(/yy/g, String(fullYear).substring(2))
            .replace(/mm/g, (monthIndex < 10 ? '0' : '') + monthIndex)
            .replace(/m/g, String(monthIndex))
            .replace(/dd/g, (dayOfMonth < 10 ? '0' : '') + dayOfMonth)
            .replace(/d/g, String(dayOfMonth));

        return outputString;
    }

    return {
        calculateDaysInMonth,
        retrieveMonthName,
        parseInputToDate,
        formatDateObject
    };
})();


const makeCalendarInput = function(targetInputField) {
    if (!targetInputField || targetInputField.tagName !== 'INPUT') {
        console.error('Calendar input must be an HTML input element.');
        return;
    }

    const componentData = {
        currentDisplayMonthStart: new Date(),
        chosenDate: null,
        isYearDragActive: false,
        isMonthDragActive: false,
        dragStartPointX: -1,
        dragStartPointY: -1,
        dragInitialDisplayYear: null,
        dragInitialDisplayMonth: null,
        displayPattern: targetInputField.dataset.displayFormat || 'yyyy-mm-dd'
    };

    const initialValueText = targetInputField.value;
    const parsedInitialDate = dateManipulator.parseInputToDate(initialValueText);
    if (parsedInitialDate) {
        componentData.chosenDate = parsedInitialDate;
        componentData.currentDisplayMonthStart = new Date(parsedInitialDate.getFullYear(), parsedInitialDate.getMonth(), 1);
    } else {
        componentData.currentDisplayMonthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
        componentData.chosenDate = null;
    }

    const wrapperDiv = document.createElement('div');
    wrapperDiv.className = 'calendar-component-wrapper';
    targetInputField.parentNode.insertBefore(wrapperDiv, targetInputField.nextSibling);

    const controlButton = document.createElement('button');
    controlButton.className = 'calendar-toggle-button';
    controlButton.textContent = '📅';
    wrapperDiv.appendChild(controlButton);
    
    wrapperDiv.insertBefore(targetInputField, controlButton);

    const calendarPanelElement = document.createElement('div');
    calendarPanelElement.className = 'calendar-grid-overlay';
    wrapperDiv.appendChild(calendarPanelElement);

    let hidePanelTimer = null;

    function renderCalendarGrid(yearValue, monthValue) {
        componentData.currentDisplayMonthStart = new Date(yearValue, monthValue, 1);
        const firstDayOfGrid = new Date(yearValue, monthValue, 1).getDay();
        const daysInCurrentMonth = dateManipulator.calculateDaysInMonth(yearValue, monthValue);

        const currentMoment = new Date();
        const currentYear = currentMoment.getFullYear();
        const currentMonth = currentMoment.getMonth();
        const currentDay = currentMoment.getDate();

        const selectedYear = componentData.chosenDate ? componentData.chosenDate.getFullYear() : null;
        const selectedMonth = componentData.chosenDate ? componentData.chosenDate.getMonth() : null;
        const selectedDay = componentData.chosenDate ? componentData.chosenDate.getDate() : null;

        let dayCounter = 0;

        const gridTable = document.createElement('table');
        gridTable.className = 'calendar-view-table';

        const tableHeader = gridTable.createTHead();
        const navRow = tableHeader.insertRow();

        const prevNav = navRow.insertCell();
        prevNav.textContent = '◀';
        prevNav.colSpan = 1;
        prevNav.dataset.controlAction = 'navigate-back';
        prevNav.className = 'calendar-nav-cell';

        const monthDisplay = navRow.insertCell();
        monthDisplay.textContent = dateManipulator.retrieveMonthName(monthValue);
        monthDisplay.colSpan = 3;
        monthDisplay.dataset.controlAction = 'drag-month-label';
        monthDisplay.className = 'calendar-month-label';

        const yearDisplay = navRow.insertCell();
        yearDisplay.textContent = String(yearValue);
        yearDisplay.colSpan = 2;
        yearDisplay.dataset.controlAction = 'drag-year-label';
        yearDisplay.className = 'calendar-year-label';

        const nextNav = navRow.insertCell();
        nextNav.textContent = '▶';
        nextNav.colSpan = 1;
        nextNav.dataset.controlAction = 'navigate-forward';
        nextNav.className = 'calendar-nav-cell';

        const weekdaysRow = tableHeader.insertRow();
        ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].forEach(dayName => {
            const heading = document.createElement('th');
            heading.textContent = dayName;
            weekdaysRow.appendChild(heading);
        });

        const tableBody = gridTable.createTBody();

        for (let weekIdx = 0; weekIdx < 6; weekIdx++) {
            const weekRow = tableBody.insertRow();
            for (let dayIdx = 0; dayIdx < 7; dayIdx++) {
                const cell = weekRow.insertCell();
                cell.className = 'calendar-day-item';

                if (dayCounter > 0 || dayIdx === firstDayOfGrid) {
                    dayCounter++;
                    if (dayCounter <= daysInCurrentMonth) {
                        cell.textContent = String(dayCounter);
                        cell.dataset.displayYear = String(yearValue);
                        cell.dataset.displayMonth = String(monthValue);
                        cell.dataset.displayDay = String(dayCounter);

                        if (currentYear === yearValue && currentMonth === monthValue && currentDay === dayCounter) {
                            cell.classList.add('today-marker');
                        }
                        if (selectedYear === yearValue && selectedMonth === monthValue && selectedDay === dayCounter) {
                            cell.classList.add('selected-day-marker');
                        }
                    } else {
                        cell.textContent = '\xa0';
                        cell.classList.add('empty-grid-cell');
                    }
                } else {
                    cell.textContent = '\xa0';
                    cell.classList.add('empty-grid-cell');
                }
            }
        }

        calendarPanelElement.innerHTML = '';
        calendarPanelElement.appendChild(gridTable);
    }

    targetInputField.addEventListener('keydown', (event) => { event.preventDefault(); });
    targetInputField.addEventListener('keyup', (event) => { event.preventDefault(); });
    targetInputField.addEventListener('keypress', (event) => { event.preventDefault(); });

    targetInputField.addEventListener('focus', () => {
        calendarPanelElement.classList.add('active-calendar-panel');
        const currentInputDate = dateManipulator.parseInputToDate(targetInputField.value);
        if (!componentData.chosenDate || !currentInputDate || currentInputDate.getTime() !== componentData.chosenDate.getTime()) {
            componentData.chosenDate = currentInputDate;
            const effectiveDate = currentInputDate || new Date();
            renderCalendarGrid(effectiveDate.getFullYear(), effectiveDate.getMonth());
        }
        clearTimeout(hidePanelTimer);
    });

    targetInputField.addEventListener('blur', () => {
        hidePanelTimer = setTimeout(() => {
            calendarPanelElement.classList.remove('active-calendar-panel');
        }, 200);
    });
    
    controlButton.addEventListener('click', (event) => {
        event.preventDefault();
        if (targetInputField === document.activeElement && calendarPanelElement.classList.contains('active-calendar-panel')) {
            targetInputField.blur();
        } else {
            targetInputField.focus();
        }
    });

    calendarPanelElement.addEventListener('mousedown', (event) => {
        event.preventDefault();

        const clickedTarget = event.target;
        const currentDisplayedYear = componentData.currentDisplayMonthStart.getFullYear();
        let currentDisplayedMonth = componentData.currentDisplayMonthStart.getMonth();

        if (clickedTarget.tagName === 'TD' && clickedTarget.dataset.displayDay) {
            const year = parseInt(clickedTarget.dataset.displayYear, 10);
            const month = parseInt(clickedTarget.dataset.displayMonth, 10);
            const day = parseInt(clickedTarget.dataset.displayDay, 10);

            componentData.chosenDate = new Date(year, month, day);
            targetInputField.value = dateManipulator.formatDateObject(componentData.chosenDate, componentData.displayPattern);

            calendarPanelElement.querySelectorAll('.selected-day-marker').forEach(el => el.classList.remove('selected-day-marker'));
            clickedTarget.classList.add('selected-day-marker');

            setTimeout(() => {
                targetInputField.blur();
            }, 200);
            return;
        }

        if (clickedTarget.tagName === 'TH' && clickedTarget.dataset.controlAction) {
            const actionType = clickedTarget.dataset.controlAction;

            if (actionType === 'navigate-back') {
                currentDisplayedMonth--;
                if (currentDisplayedMonth < 0) {
                    currentDisplayedMonth = 11;
                    renderCalendarGrid(currentDisplayedYear - 1, currentDisplayedMonth);
                } else {
                    renderCalendarGrid(currentDisplayedYear, currentDisplayedMonth);
                }
            } else if (actionType === 'navigate-forward') {
                currentDisplayedMonth++;
                if (currentDisplayedMonth > 11) {
                    currentDisplayedMonth = 0;
                    renderCalendarGrid(currentDisplayedYear + 1, currentDisplayedMonth);
                } else {
                    renderCalendarGrid(currentDisplayedYear, currentDisplayedMonth);
                }
            } else if (actionType === 'drag-year-label') {
                componentData.isYearDragActive = true;
                componentData.isMonthDragActive = false;
            } else if (actionType === 'drag-month-label') {
                componentData.isMonthDragActive = true;
                componentData.isYearDragActive = false;
            }

            if (componentData.isYearDragActive || componentData.isMonthDragActive) {
                componentData.dragInitialDisplayYear = currentDisplayedYear;
                componentData.dragInitialDisplayMonth = currentDisplayedMonth;
                componentData.dragStartPointX = event.pageX;
                componentData.dragStartPointY = event.pageY;
            }
        }
    });

    document.addEventListener('mousemove', (event) => {
        if (!componentData.isYearDragActive && !componentData.isMonthDragActive) return;

        const currentMouseX = event.pageX;
        const currentMouseY = event.pageY;
        const deltaMovementX = currentMouseX - componentData.dragStartPointX;
        const deltaMovementY = currentMouseY - componentData.dragStartPointY;
        
        let newDisplayYear = componentData.dragInitialDisplayYear;
        let newDisplayMonth = componentData.dragInitialDisplayMonth;

        const dragSensitivity = 20;

        if (componentData.isYearDragActive) {
            newDisplayYear += Math.floor((deltaMovementX + deltaMovementY) / dragSensitivity);
        } else {
            newDisplayMonth += Math.floor((deltaMovementX + deltaMovementY) / dragSensitivity);
            newDisplayYear += Math.floor(newDisplayMonth / 12);
            newDisplayMonth = newDisplayMonth % 12;
            newDisplayMonth += (newDisplayMonth < 0) ? 12 : 0;
        }
        
        if (newDisplayYear !== componentData.currentDisplayMonthStart.getFullYear() || newDisplayMonth !== componentData.currentDisplayMonthStart.getMonth()) {
            renderCalendarGrid(newDisplayYear, newDisplayMonth);
        }
    });

    document.addEventListener('mouseup', () => {
        if (!componentData.isYearDragActive && !componentData.isMonthDragActive) return;

        componentData.isYearDragActive = false;
        componentData.isMonthDragActive = false;
        componentData.dragStartPointX = -1;
        componentData.dragStartPointY = -1;
        componentData.dragInitialDisplayYear = null;
        componentData.dragInitialDisplayMonth = null;
    });

    renderCalendarGrid(componentData.currentDisplayMonthStart.getFullYear(), componentData.currentDisplayMonthStart.getMonth());

    targetInputField.dataset.calendarManaged = 'true';
};

document.addEventListener('DOMContentLoaded', () => {
    const inputElementsForCalendar = document.querySelectorAll('.date-input-field');
    inputElementsForCalendar.forEach(inputEl => {
        makeCalendarInput(inputEl);
    });
});