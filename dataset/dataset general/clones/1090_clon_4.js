const DayMoment = {
    extractDetails(dateObj) {
        return {
            year: dateObj.getFullYear(),
            month: dateObj.getMonth(),
            day: dateObj.getDate(),
            weekday: dateObj.getDay(),
            time: dateObj.getTime()
        };
    },

    getFirstDayOfMonth(dateObj) {
        const newDate = new Date(dateObj.getTime());
        newDate.setDate(1);
        return newDate;
    },

    addDays(dateObj, days) {
        const newDate = new Date(dateObj.getTime());
        newDate.setDate(dateObj.getDate() + days);
        return newDate;
    },

    getDaysInMonth(year, month) {
        return new Date(year, month + 1, 0).getDate();
    }
};

const datePickerInstances = new WeakMap();

class FancyDateSelector {
    static defaultSettings = {
        styleVariant: 'default',
        layerIndex: 1000,
        borderThickness: 1,
        boxOffset: { x: 0, y: 1 },
        alwaysVisible: false,
        autoHide: true,
        enableMonthPicker: true,
        enableYearPicker: true,
        presentDay: new Date(),
        chosenMoment: null,
        backwardSymbol: '\u25c4',
        forwardSymbol: '\u25ba',
        availableDays: null,
        availableRanges: null,
        markedDays: null,
        allowedMonths: null,
        allowedYears: null,
        allowedWeekdays: null,
        monthLabels: null,
        weekdayLabels: null,
        weekdayShift: 0,
        onDaySelect: (targetElem, gridCell, moment, extraData) => {
            targetElem.value = moment.toLocaleDateString();
        },
        onDayHover: (targetElem, gridCell, moment, extraData) => {},
        onDisplay: (displayBox) => { displayBox.style.display = ''; },
        onConceal: (displayBox) => { displayBox.style.display = 'none'; },
        initialMonthDate: null
    };

    constructor(targetElem, userSettings) {
        const thisInst = this;

        thisInst.targetElem = targetElem;
        thisInst.config = { ...FancyDateSelector.defaultSettings, ...userSettings };

        thisInst.config.chosenMoment = thisInst.config.chosenMoment || thisInst.config.presentDay;
        thisInst.config.initialMonthDate = DayMoment.getFirstDayOfMonth(new Date(thisInst.config.initialMonthDate || thisInst.config.chosenMoment));

        if (!targetElem.dataset.fancyId) {
            targetElem.dataset.fancyId = 'fancy-' + Math.floor(Math.random() * 1e10);
        }

        const existingBox = document.querySelector(`[data-fancy-ref="${targetElem.dataset.fancyId}"]`);
        if (existingBox) {
            thisInst.displayBox = existingBox;
        } else {
            thisInst.displayBox = document.createElement('div');
            thisInst.displayBox.setAttribute('data-fancy-ref', targetElem.dataset.fancyId);
            document.body.appendChild(thisInst.displayBox);
        }

        if (thisInst.displayBox && !thisInst.config.alwaysVisible) {
            thisInst.displayBox.style.display = 'none';
        }

        targetElem.classList.add('fancy-input-field');
        targetElem.addEventListener('click', (e) => thisInst.reveal(e));
        targetElem.addEventListener('focus', (e) => thisInst.reveal(e));

        document.addEventListener('mouseup', (e) => {
            const clickTarget = e.target;
            const displayBox = thisInst.displayBox;

            if (!thisInst.targetElem.contains(clickTarget) && !displayBox.contains(clickTarget) && displayBox.style.display !== 'none' && displayBox.parentElement) {
                thisInst.conceal();
            }
        });

        thisInst.draw();
    }

    reveal(event) {
        for (const [elem, inst] of datePickerInstances.entries()) {
            if (elem !== this.targetElem && inst instanceof FancyDateSelector) {
                if (inst.displayBox && inst.displayBox.style.display !== 'none') {
                    inst.config.onConceal(inst.displayBox);
                }
            }
        }
        this.config.onDisplay(this.displayBox);
        this.repositionCalendar();
    }

    conceal() {
        if (this.config && !this.config.alwaysVisible) {
            this.config.onConceal(this.displayBox);
        }
    }

    repositionCalendar = () => {
        const targetElemRect = this.targetElem.getBoundingClientRect();
        const scrollX = window.scrollX || window.pageXOffset;
        const scrollY = window.scrollY || window.pageYOffset;

        this.displayBox.style.position = 'absolute';
        this.displayBox.style.top = (targetElemRect.bottom + scrollY + this.config.boxOffset.y) + 'px';
        this.displayBox.style.left = (targetElemRect.left + scrollX + this.config.boxOffset.x) + 'px';
    }

    draw(redrawCallback) {
        const thisInst = this;
        const targetElem = thisInst.targetElem;
        const config = thisInst.config;
        const displayBox = thisInst.displayBox;

        const baseClass = ' base-style border-style ';
        const styleName = 'fancy-' + config.styleVariant;

        const todayDetails = DayMoment.extractDetails(config.presentDay);
        const todayTimestamp = todayDetails.time;

        const maxRows = 6;
        const maxCols = 7;
        const borderPx = config.borderThickness + 'px';

        const createSelectionList = (minVal, maxVal, userProvidedList) => {
            let resultList = [];
            for (let i = minVal; i <= maxVal; i++) { resultList.push(i); }

            if (userProvidedList) {
                const uniqueUserList = [...new Set(userProvidedList)];
                const filteredList = uniqueUserList.filter(v => v >= minVal && v <= maxVal);
                resultList = filteredList.length ? filteredList : resultList;
            }
            return resultList.sort((a, b) => a - b);
        };

        const allowedMonths = createSelectionList(0, 11, config.allowedMonths);
        const allowedYears = createSelectionList(todayDetails.year - 5, todayDetails.year + 5, config.allowedYears);
        const allowedWeekdays = createSelectionList(0, 6, config.allowedWeekdays);
        const weekdayLabels = config.weekdayLabels || ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const monthLabels = config.monthLabels || ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

        const getCellDim = (containerDim, count) => {
            return (containerDim / count) + ((config.borderThickness / count) * (count - 1));
        };

        let wrapperWidth = targetElem.offsetWidth;
        if (displayBox.dataset.hasDimensions === 'true' && displayBox.offsetWidth > 0) {
            wrapperWidth = displayBox.offsetWidth;
        }

        const gridCellWidth = getCellDim(wrapperWidth, maxCols);
        const gridCellHeight = getCellDim(wrapperWidth / maxCols * (maxRows + 2), maxRows + 2);

        if (!displayBox.dataset.hasDimensions) {
            displayBox.style.width = (gridCellWidth * maxCols) + 'px';
            displayBox.dataset.hasDimensions = 'true';
        }

        if (window.getComputedStyle(targetElem).display === 'none') {
            displayBox.style.display = 'none';
        }

        displayBox.innerHTML = '';
        displayBox.className = '';
        displayBox.classList.add(styleName);
        displayBox.style.zIndex = config.layerIndex;
        displayBox.style.display = config.alwaysVisible ? '' : 'none';

        window.removeEventListener('resize', this.repositionCalendar);
        window.addEventListener('resize', this.repositionCalendar);
        this.repositionCalendar();

        const cellStyling = {
            width: gridCellWidth + 'px',
            height: gridCellHeight + 'px',
            lineHeight: gridCellHeight + 'px'
        };

        const updateInitialMonthDate = (newDate) => {
            if (newDate) {
                config.initialMonthDate = newDate;
                thisInst.draw();
            }
        };

        const getAdjustedInitialMonthDate = (monthOffset = 0) => {
            const momentDate = new Date(config.initialMonthDate.getTime());

            if (monthOffset !== 0) {
                momentDate.setMonth(momentDate.getMonth() + monthOffset);
                momentDate.setDate(1);
            }

            if (monthOffset !== 0) {
                while (true) {
                    const currentDetails = DayMoment.extractDetails(momentDate);
                    const currentMonth = currentDetails.month;
                    const currentYear = currentDetails.year;

                    const monthAllowed = allowedMonths.includes(currentMonth);
                    const yearAllowed = allowedYears.includes(currentYear);

                    if (monthAllowed && yearAllowed) {
                        break;
                    }

                    if (currentYear < allowedYears[0] || currentYear > allowedYears[allowedYears.length - 1]) {
                        return null;
                    }

                    momentDate.setMonth(momentDate.getMonth() + (monthOffset > 0 ? 1 : -1));
                    momentDate.setDate(1);
                }
            }
            return momentDate;
        };

        const prevInitialDate = getAdjustedInitialMonthDate(-1);
        const nextInitialDate = getAdjustedInitialMonthDate(1);

        const currentInitialDate = (config.initialMonthDate = getAdjustedInitialMonthDate());
        const currentInitialDetails = DayMoment.extractDetails(currentInitialDate);
        const currentMonth = currentInitialDetails.month;
        const currentYear = currentInitialDetails.year;

        let startDateForGrid = new Date(currentInitialDate.getTime());

        const adjustedWeekdayShift = Math.abs(Math.min(6, Math.max(0, config.weekdayShift)));

        let startGridOffset = startDateForGrid.getDay() - adjustedWeekdayShift;
        if (startGridOffset < 0) startGridOffset += 7;

        startDateForGrid = DayMoment.addDays(startDateForGrid, -startGridOffset);

        const shiftedWeekdayLabels = (weekdayLabels.concat(weekdayLabels)).slice(adjustedWeekdayShift, adjustedWeekdayShift + 7);

        const canShowPrev = !!prevInitialDate;
        const canShowNext = !!nextInitialDate;

        const headerCellBaseClass = baseClass + 'month-year-header ';

        const prevNavCell = document.createElement('div');
        prevNavCell.classList.add(headerCellBaseClass);
        Object.assign(prevNavCell.style, cellStyling, {
            borderWidth: `${borderPx} 0 0 ${borderPx}`
        });
        const prevLink = document.createElement('a');
        prevLink.classList.add('prev-nav-arrow' + (canShowPrev ? '' : '-disabled'));
        prevLink.innerHTML = config.backwardSymbol;
        prevNavCell.appendChild(prevLink);
        prevNavCell.addEventListener('mousedown', (e) => e.preventDefault());
        prevNavCell.addEventListener('click', (e) => {
            if (config.backwardSymbol !== '' && canShowPrev) {
                e.stopPropagation();
                updateInitialMonthDate(prevInitialDate);
            }
        });

        const titleCellCount = maxCols - 2;
        const titleWidth = (gridCellWidth * titleCellCount) - (titleCellCount * config.borderThickness) + (config.borderThickness);
        const titleHeaderCell = document.createElement('div');
        titleHeaderCell.classList.add(headerCellBaseClass, 'title-display');
        Object.assign(titleHeaderCell.style, cellStyling, {
            width: titleWidth + 'px',
            borderTopWidth: borderPx,
            marginLeft: `-${borderPx}`
        });
        const monthTitle = document.createElement('span');
        monthTitle.classList.add('month-label');
        monthTitle.textContent = monthLabels[currentMonth];
        titleHeaderCell.appendChild(monthTitle);

        const yearTitle = document.createElement('span');
        yearTitle.classList.add('year-label');
        yearTitle.textContent = currentYear;
        titleHeaderCell.appendChild(yearTitle);

        const nextNavCell = document.createElement('div');
        nextNavCell.classList.add(headerCellBaseClass);
        Object.assign(nextNavCell.style, cellStyling, {
            marginLeft: `-${borderPx}`,
            borderWidth: `${borderPx} ${borderPx} 0 0`
        });
        const nextLink = document.createElement('a');
        nextLink.classList.add('next-nav-arrow' + (canShowNext ? '' : '-disabled'));
        nextLink.innerHTML = config.forwardSymbol;
        nextNavCell.appendChild(nextLink);
        nextNavCell.addEventListener('mousedown', (e) => e.preventDefault());
        nextNavCell.addEventListener('click', (e) => {
            if (config.forwardSymbol !== '' && canShowNext) {
                e.stopPropagation();
                updateInitialMonthDate(nextInitialDate);
            }
        });

        displayBox.appendChild(prevNavCell);
        displayBox.appendChild(titleHeaderCell);
        displayBox.appendChild(nextNavCell);

        const weekdayRow = document.createElement('div');
        weekdayRow.classList.add('weekday-row');
        for (let i = 0; i < maxCols; i++) {
            const weekdayCell = document.createElement('div');
            weekdayCell.classList.add(baseClass, 'weekday-cell');
            Object.assign(weekdayCell.style, cellStyling, {
                borderWidth: `${borderPx} ${borderPx} 0 0`,
                marginLeft: i === 0 ? '0' : `-${borderPx}`
            });
            weekdayCell.textContent = shiftedWeekdayLabels[i];
            weekdayRow.appendChild(weekdayCell);
        }
        displayBox.appendChild(weekdayRow);

        let currentMoment = new Date(startDateForGrid.getTime());
        for (let row = 0; row < maxRows; row++) {
            const dayRow = document.createElement('div');
            dayRow.classList.add('day-row');
            for (let col = 0; col < maxCols; col++) {
                const dayDetails = DayMoment.extractDetails(currentMoment);
                const isCurrentMonth = dayDetails.month === currentMonth;
                const isToday = dayDetails.time === todayTimestamp;
                const isChosen = DayMoment.extractDetails(config.chosenMoment).time === dayDetails.time;

                const dayGridCell = document.createElement('div');
                dayGridCell.classList.add(baseClass, 'day-grid-cell');
                Object.assign(dayGridCell.style, cellStyling, {
                    borderWidth: `${borderPx} ${borderPx} ${borderPx} ${borderPx}`,
                    marginLeft: col === 0 ? '0' : `-${borderPx}`,
                    marginTop: `-${borderPx}`
                });
                dayGridCell.textContent = dayDetails.day;

                if (!isCurrentMonth) {
                    dayGridCell.classList.add('other-month');
                }
                if (isToday) {
                    dayGridCell.classList.add('current-day');
                }
                if (isChosen) {
                    dayGridCell.classList.add('selected-day');
                }

                dayGridCell.setAttribute('data-moment-timestamp', dayDetails.time);
                dayGridCell.setAttribute('data-moment-date', currentMoment.toISOString());

                dayGridCell.addEventListener('click', (e) => {
                    const clickedMoment = new Date(parseInt(e.currentTarget.dataset.momentTimestamp, 10));
                    config.chosenMoment = clickedMoment;
                    thisInst.draw();
                    config.onDaySelect(targetElem, e.currentTarget, clickedMoment, null);
                    if (config.autoHide && !config.alwaysVisible) {
                        thisInst.conceal();
                    }
                });

                dayRow.appendChild(dayGridCell);
                currentMoment = DayMoment.addDays(currentMoment, 1);
            }
            displayBox.appendChild(dayRow);
        }

        if (config.enableMonthPicker) {
            monthTitle.classList.add('clickable');
            monthTitle.addEventListener('click', (e) => {
                e.stopPropagation();
                thisInst.showMonthPicker(monthTitle);
            });
        }
        if (config.enableYearPicker) {
            yearTitle.classList.add('clickable');
            yearTitle.addEventListener('click', (e) => {
                e.stopPropagation();
                thisInst.showYearPicker(yearTitle);
            });
        }
    }

    showMonthPicker(triggerElem) {
        const thisInst = this;
        const config = thisInst.config;
        const displayBox = thisInst.displayBox;
        const currentDetails = DayMoment.extractDetails(config.initialMonthDate);
        const currentMonth = currentDetails.month;

        const pickerOverlay = document.createElement('div');
        pickerOverlay.classList.add('picker-overlay', 'month-picker');
        Object.assign(pickerOverlay.style, {
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(255,255,255,0.9)',
            zIndex: config.layerIndex + 1,
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gridTemplateRows: 'repeat(4, 1fr)',
            gap: '1px',
            boxSizing: 'border-box',
            padding: `${config.borderThickness}px`
        });

        const allowedMonths = thisInst.getSelectableList(0, 11, config.allowedMonths);

        config.monthLabels.forEach((label, index) => {
            const monthCell = document.createElement('div');
            monthCell.classList.add('picker-cell');
            monthCell.textContent = label.substring(0, 3);
            Object.assign(monthCell.style, {
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: `${config.borderThickness}px solid #ccc`,
                cursor: 'pointer',
                backgroundColor: 'white'
            });

            if (index === currentMonth) {
                monthCell.classList.add('selected-picker-item');
                monthCell.style.backgroundColor = '#e0e0e0';
            }

            if (!allowedMonths.includes(index)) {
                monthCell.classList.add('disabled-picker-item');
                monthCell.style.cursor = 'not-allowed';
                monthCell.style.opacity = '0.5';
            } else {
                monthCell.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const newDate = new Date(config.initialMonthDate.getTime());
                    newDate.setMonth(index);
                    newDate.setDate(1);
                    config.initialMonthDate = newDate;
                    thisInst.draw();
                    pickerOverlay.remove();
                });
            }
            pickerOverlay.appendChild(monthCell);
        });

        displayBox.appendChild(pickerOverlay);
    }

    showYearPicker(triggerElem) {
        const thisInst = this;
        const config = thisInst.config;
        const displayBox = thisInst.displayBox;
        const currentDetails = DayMoment.extractDetails(config.initialMonthDate);
        const currentYear = currentDetails.year;

        const pickerOverlay = document.createElement('div');
        pickerOverlay.classList.add('picker-overlay', 'year-picker');
        Object.assign(pickerOverlay.style, {
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(255,255,255,0.9)',
            zIndex: config.layerIndex + 1,
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gridTemplateRows: 'repeat(5, 1fr)',
            gap: '1px',
            boxSizing: 'border-box',
            padding: `${config.borderThickness}px`
        });

        const allowedYears = thisInst.getSelectableList(currentYear - 10, currentYear + 10, config.allowedYears);
        const minYear = allowedYears[0] || currentYear - 5;
        const maxYear = allowedYears[allowedYears.length - 1] || currentYear + 5;

        for (let year = minYear; year <= maxYear; year++) {
            const yearCell = document.createElement('div');
            yearCell.classList.add('picker-cell');
            yearCell.textContent = year;
            Object.assign(yearCell.style, {
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: `${config.borderThickness}px solid #ccc`,
                cursor: 'pointer',
                backgroundColor: 'white'
            });

            if (year === currentYear) {
                yearCell.classList.add('selected-picker-item');
                yearCell.style.backgroundColor = '#e0e0e0';
            }

            if (!allowedYears.includes(year)) {
                yearCell.classList.add('disabled-picker-item');
                yearCell.style.cursor = 'not-allowed';
                yearCell.style.opacity = '0.5';
            } else {
                yearCell.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const newDate = new Date(config.initialMonthDate.getTime());
                    newDate.setFullYear(year);
                    newDate.setDate(1);
                    config.initialMonthDate = newDate;
                    thisInst.draw();
                    pickerOverlay.remove();
                });
            }
            pickerOverlay.appendChild(yearCell);
        }

        displayBox.appendChild(pickerOverlay);
    }

    getSelectableList(minVal, maxVal, userProvidedList) {
        let resultList = [];
        for (let i = minVal; i <= maxVal; i++) { resultList.push(i); }

        if (userProvidedList) {
            const uniqueUserList = [...new Set(userProvidedList)];
            const filteredList = uniqueUserList.filter(v => v >= minVal && v <= maxVal);
            resultList = filteredList.length ? filteredList : resultList;
        }
        return resultList.sort((a, b) => a - b);
    }
}

const manageDateSelectors = (selector, settings) => {
    const elements = document.querySelectorAll(selector);
    const returnValues = [];

    elements.forEach(elem => {
        let instance = datePickerInstances.get(elem);

        if (!instance) {
            instance = new FancyDateSelector(elem, settings);
            datePickerInstances.set(elem, instance);
            if (settings !== true) {
                returnValues.push(elem);
            } else {
                returnValues.push(instance);
            }
        } else {
            if (settings === true) {
                returnValues.push(instance);
            } else {
                returnValues.push(elem);
            }
        }
    });

    return returnValues.length === 1 ? returnValues[0] : returnValues;
};

window.initFancyDateSelector = manageDateSelectors;
window.FancyDateSelectorDefaults = FancyDateSelector.defaultSettings;