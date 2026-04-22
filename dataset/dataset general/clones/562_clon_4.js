class ChronosDisplay {
    constructor(targetElement, configOptions) {
        this.hostElement = targetElement;
        this.internalConfig = this.mergeConfigurations(ChronosDisplay.defaultSettings, configOptions);

        this.currentYearValue = new Date().getFullYear();
        this.activeOccurrences = new Map();
        this.selectedMoment = null;
        this.selectedIntervalStart = null;
        this.selectedIntervalEnd = null;

        this.mainVisualContainer = null;
        this.yearNavigationElement = null;
        this.monthGridArea = null;

        this.initializeDisplay();
    }

    mergeConfigurations(defaults, overrides) {
        const result = {};
        for (const key in defaults) {
            result[key] = defaults[key];
        }
        for (const key in overrides) {
            result[key] = overrides[key];
        }
        return result;
    }

    initializeDisplay() {
        this.monthGridArea = document.createElement('div');
        this.monthGridArea.id = 'periodGridContainer';
        this.monthGridArea.className = 'row';

        this.currentYearLabel = document.createElement('div');
        this.currentYearLabel.className = 'visualYearDisplay';

        this.buildMainStructure();
        this.populateMonthViews(this.currentYearValue);
        this.hostElement.appendChild(this.mainVisualContainer);

        this.fetchAndApplyOccurrences(this.currentYearValue);
        this.setupInteractiveSelection();
    }

    buildMainStructure() {
        this.mainVisualContainer = document.createElement('div');
        this.mainVisualContainer.className = 'chronos-widget';
        this.mainVisualContainer.id = 'timeDisplay_' + Math.random().toString(36).substr(2, 9);

        const controlPanel = document.createElement('table');
        controlPanel.className = 'navigation-panel';
        const controlRow = document.createElement('tr');

        const prevYearCell = document.createElement('td');
        const prevYearButton = document.createElement('a');
        prevYearButton.href = '#';
        prevYearButton.className = 'year-backward-button';
        prevYearButton.innerHTML = '<i class="navigate-icon navigate-left"></i>';
        prevYearCell.appendChild(prevYearButton);
        prevYearButton.addEventListener('click', (e) => {
            e.preventDefault();
            this.currentYearValue--;
            this.updateDisplayedPeriod(this.currentYearValue);
        });

        const yearLabelCell = document.createElement('td');
        yearLabelCell.colSpan = 5;
        yearLabelCell.className = 'periodLabelCell';
        yearLabelCell.appendChild(this.currentYearLabel);

        const nextYearCell = document.createElement('td');
        const nextYearButton = document.createElement('a');
        nextYearButton.href = '#';
        nextYearButton.className = 'year-forward-button';
        nextYearButton.innerHTML = '<i class="navigate-icon navigate-right"></i>';
        nextYearCell.appendChild(nextYearButton);
        nextYearButton.addEventListener('click', (e) => {
            e.preventDefault();
            this.currentYearValue++;
            this.updateDisplayedPeriod(this.currentYearValue);
        });

        controlRow.appendChild(prevYearCell);
        controlRow.appendChild(yearLabelCell);
        controlRow.appendChild(nextYearCell);
        controlPanel.appendChild(controlRow);

        this.mainVisualContainer.appendChild(controlPanel);
        this.mainVisualContainer.appendChild(this.monthGridArea);
    }

    updateDisplayedPeriod(newYear) {
        this.monthGridArea.innerHTML = '';
        this.populateMonthViews(newYear);
        this.fetchAndApplyOccurrences(newYear);
        this.highlightChosenInterval();
    }

    populateMonthViews(year) {
        this.currentYearLabel.textContent = year;
        let currentRow = null;
        for (let monthIndex = 0; monthIndex < 12; monthIndex++) {
            if (monthIndex % 3 === 0) {
                currentRow = document.createElement('div');
                currentRow.className = 'row-month-group';
                this.monthGridArea.appendChild(currentRow);
            }
            const monthView = this.buildSingleMonthView(monthIndex, year);
            const columnWrapper = document.createElement('div');
            columnWrapper.className = 'month-column';
            columnWrapper.appendChild(monthView);
            currentRow.appendChild(columnWrapper);
        }
    }

    buildSingleMonthView(monthIndex, year) {
        const monthContainer = document.createElement('div');
        monthContainer.className = 'month-visual-block';

        const monthHeader = document.createElement('div');
        monthHeader.className = 'month-title';
        monthHeader.textContent = this.internalConfig.monthLabels[monthIndex];
        monthContainer.appendChild(monthHeader);

        const monthTable = document.createElement('table');
        monthTable.className = 'period-table';

        if (this.internalConfig.displayWeekdayHeadings) {
            monthTable.appendChild(this.constructWeekdayHeadingRow());
        }

        const firstDayOfMonth = this.determineWeekdayIndex(1, monthIndex, year);
        const daysInMonth = this.getDaysInSpecificMonth(monthIndex, year);

        let dayCounter = 1;
        let currentDayCellIndex = 0;

        let currentRow = document.createElement('tr');
        for (let i = 0; i < firstDayOfMonth; i++) {
            const emptyCell = document.createElement('td');
            emptyCell.className = `inactive-cell weekday-${i}`;
            currentRow.appendChild(emptyCell);
            currentDayCellIndex++;
        }

        while (dayCounter <= daysInMonth) {
            if (currentDayCellIndex % 7 === 0 && currentDayCellIndex !== 0) {
                monthTable.appendChild(currentRow);
                currentRow = document.createElement('tr');
            }

            const dayCell = document.createElement('td');
            dayCell.id = `${this.mainVisualContainer.id}_${dayCounter}_${monthIndex + 1}_${year}`;
            dayCell.className = `active-day weekday-${currentDayCellIndex % 7}`;
            dayCell.setAttribute('data-date-key', this.formatDate(new Date(year, monthIndex, dayCounter)));

            const dayLinkWrapper = document.createElement('div');
            const dayAnchor = document.createElement('a');
            dayAnchor.textContent = dayCounter;
            dayLinkWrapper.appendChild(dayAnchor);
            dayCell.appendChild(dayLinkWrapper);

            currentRow.appendChild(dayCell);
            dayCounter++;
            currentDayCellIndex++;
        }

        while (currentDayCellIndex % 7 !== 0) {
            const emptyCell = document.createElement('td');
            emptyCell.className = `inactive-cell weekday-${currentDayCellIndex % 7}`;
            currentRow.appendChild(emptyCell);
            currentDayCellIndex++;
        }
        monthTable.appendChild(currentRow);

        monthContainer.appendChild(monthTable);
        return monthContainer;
    }

    constructWeekdayHeadingRow() {
        const headerRow = document.createElement('tr');
        headerRow.className = 'weekday-headings';
        this.internalConfig.weekdayLabels.forEach((label, index) => {
            const th = document.createElement('th');
            th.textContent = label;
            th.className = `weekday-heading-${index}`;
            headerRow.appendChild(th);
        });
        return headerRow;
    }

    determineWeekdayIndex(day, month, year) {
        const dateObject = new Date(year, month, day);
        let dayIndex = dateObject.getDay();
        if (dayIndex === 0) dayIndex = 6;
        else dayIndex--;
        return dayIndex;
    }

    isValidDateComponent(month, day, year) {
        return month > 0 && month < 13 && year > 0 && year < 32768 && day > 0 && day <= (new Date(year, month, 0)).getDate();
    }

    getDaysInSpecificMonth(month, year) {
        return new Date(year, month + 1, 0).getDate();
    }

    formatDate(dateObj) {
        const year = dateObj.getFullYear();
        const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
        const day = dateObj.getDate().toString().padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    parseFormattedDate(dateString) {
        const parts = dateString.split('-');
        if (parts.length === 3) {
            return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        }
        return null;
    }

    async fetchAndApplyOccurrences(year) {
        if (this.internalConfig.remoteDataFetch) {
            try {
                const response = await fetch(this.internalConfig.remoteDataFetch.url, {
                    method: this.internalConfig.remoteDataFetch.type,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ year: year })
                });
                const data = await response.json();

                const mergedOccurrences = [...(this.internalConfig.scheduledOccurrences || []), ...data];
                this.processAndStoreOccurrences(mergedOccurrences, year);

            } catch (error) {
                console.error('Failed to fetch occurrences:', error);
                this.processAndStoreOccurrences(this.internalConfig.scheduledOccurrences || [], year);
            }
        } else {
            this.processAndStoreOccurrences(this.internalConfig.scheduledOccurrences || [], year);
        }
    }

    processAndStoreOccurrences(occurrencesArray, currentYear) {
        this.activeOccurrences.clear();
        occurrencesArray.forEach(occurrence => {
            const dateParts = occurrence.date.split('/');
            if (dateParts.length === 3) {
                const day = parseInt(dateParts[0]);
                const month = parseInt(dateParts[1]);
                const year = parseInt(dateParts[2]);

                if (year === currentYear) {
                    const formattedDateKey = this.formatDate(new Date(year, month - 1, day));
                    if (!this.activeOccurrences.has(formattedDateKey)) {
                        this.activeOccurrences.set(formattedDateKey, []);
                    }
                    this.activeOccurrences.get(formattedDateKey).push(occurrence);
                }
            }
        });
        this.applyOccurrenceMarkers();
    }

    applyOccurrenceMarkers() {
        this.mainVisualContainer.querySelectorAll('.active-day').forEach(dayCell => {
            dayCell.classList.remove('has-event', 'has-popup', 'has-hint');
            dayCell.style.backgroundColor = '';

            const dateKey = dayCell.getAttribute('data-date-key');
            const occurrencesForDay = this.activeOccurrences.get(dateKey);

            if (occurrencesForDay && occurrencesForDay.length > 0) {
                dayCell.classList.add('has-event');
                const dayAnchor = dayCell.querySelector('a');

                const primaryOccurrence = occurrencesForDay[0];

                if (primaryOccurrence.color) {
                    dayCell.style.backgroundColor = primaryOccurrence.color;
                }
                if (primaryOccurrence.class) {
                    dayCell.classList.add(primaryOccurrence.class);
                }
                if (primaryOccurrence.link) {
                    dayAnchor.href = primaryOccurrence.link;
                } else {
                    dayAnchor.removeAttribute('href');
                }

                if (primaryOccurrence.content) {
                    dayCell.classList.add('has-popup');
                    dayAnchor.setAttribute('data-content-text', primaryOccurrence.content);
                    dayAnchor.setAttribute('data-title-text', primaryOccurrence.title || '');
                    this.setupCustomPopup(dayCell, dayAnchor);
                } else if (primaryOccurrence.title) {
                    dayCell.classList.add('has-hint');
                    dayAnchor.setAttribute('title', primaryOccurrence.title);
                }
            }
        });
    }

    setupCustomPopup(cellElement, anchorElement) {
        if (cellElement.hasAttribute('data-popup-initialized')) return;
        cellElement.setAttribute('data-popup-initialized', 'true');

        let popupElement = null;
        let hideTimeout = null;

        const showPopup = () => {
            clearTimeout(hideTimeout);
            if (popupElement && document.body.contains(popupElement)) {
                document.body.removeChild(popupElement);
                popupElement = null;
            }

            popupElement = document.createElement('div');
            popupElement.className = 'custom-event-popup';
            popupElement.innerHTML = `<strong>${anchorElement.getAttribute('data-title-text')}</strong><p>${anchorElement.getAttribute('data-content-text')}</p>`;
            document.body.appendChild(popupElement);

            const rect = cellElement.getBoundingClientRect();
            popupElement.style.position = 'absolute';
            popupElement.style.left = `${rect.left + window.scrollX + (rect.width / 2) - (popupElement.offsetWidth / 2)}px`;
            popupElement.style.top = `${rect.bottom + window.scrollY + 5}px`;
            popupElement.style.zIndex = '1000';

            popupElement.addEventListener('mouseenter', () => clearTimeout(hideTimeout));
            popupElement.addEventListener('mouseleave', hidePopup);
        };

        const hidePopup = () => {
            hideTimeout = setTimeout(() => {
                if (popupElement && document.body.contains(popupElement)) {
                    document.body.removeChild(popupElement);
                    popupElement = null;
                }
            }, 100);
        };

        cellElement.addEventListener('mouseenter', showPopup);
        cellElement.addEventListener('mouseleave', hidePopup);
        cellElement.addEventListener('click', (e) => {
            if (popupElement && document.body.contains(popupElement)) {
                e.stopPropagation();
                if (popupElement.style.display === 'block' || popupElement.style.visibility === 'visible') {
                    hidePopup();
                } else {
                    showPopup();
                }
            } else {
                showPopup();
            }
        });
    }

    setupInteractiveSelection() {
        if (!this.internalConfig.allowDateSelection) return;

        this.mainVisualContainer.addEventListener('click', (event) => {
            const targetCell = event.target.closest('.active-day');
            if (!targetCell) return;

            const selectedDateKey = targetCell.getAttribute('data-date-key');
            const selectedDateObj = this.parseFormattedDate(selectedDateKey);

            if (this.internalConfig.allowRangeSelection) {
                if (!this.selectedMoment && !this.selectedIntervalStart && !this.selectedIntervalEnd) {
                    this.selectedMoment = selectedDateKey;
                    this.highlightChosenInterval();
                } else if (this.selectedMoment && !this.selectedIntervalStart) {
                    this.selectedIntervalStart = this.selectedMoment;
                    this.selectedIntervalEnd = selectedDateKey;
                    this.selectedMoment = null;
                    this.highlightChosenInterval();

                    const customEvent = new CustomEvent('chronosDateRangeSelected', {
                        detail: {
                            firstDate: this.selectedIntervalStart,
                            lastDate: this.selectedIntervalEnd
                        }
                    });
                    this.hostElement.dispatchEvent(customEvent);

                } else if (this.selectedIntervalStart && this.selectedIntervalEnd) {
                    this.selectedIntervalStart = null;
                    this.selectedIntervalEnd = null;
                    this.selectedMoment = null;
                    this.highlightChosenInterval();
                }
            } else {
                this.selectedMoment = selectedDateKey;
                this.selectedIntervalStart = null;
                this.selectedIntervalEnd = null;
                this.highlightChosenInterval();

                const customEvent = new CustomEvent('chronosDateSelected', {
                    detail: {
                        chosenDate: selectedDateKey
                    }
                });
                this.hostElement.dispatchEvent(customEvent);
            }
        });
    }

    highlightChosenInterval() {
        this.mainVisualContainer.querySelectorAll('.active-day').forEach(cell => {
            const dayDiv = cell.querySelector('div');
            if (dayDiv) {
                dayDiv.classList.remove('moment-mark', 'range-start-mark', 'range-end-mark', 'range-middle-mark');
            }
        });

        if (this.selectedMoment) {
            const targetCell = this.mainVisualContainer.querySelector(`[data-date-key="${this.selectedMoment}"]`);
            if (targetCell) {
                targetCell.querySelector('div').classList.add('moment-mark');
            }
        } else if (this.selectedIntervalStart && this.selectedIntervalEnd) {
            let startDate = this.parseFormattedDate(this.selectedIntervalStart);
            let endDate = this.parseFormattedDate(this.selectedIntervalEnd);

            if (startDate > endDate) {
                [startDate, endDate] = [endDate, startDate];
            }

            let currentDate = new Date(startDate);
            while (currentDate <= endDate) {
                const formattedKey = this.formatDate(currentDate);
                const targetCell = this.mainVisualContainer.querySelector(`[data-date-key="${formattedKey}"]`);
                if (targetCell) {
                    const dayDiv = targetCell.querySelector('div');
                    if (dayDiv) {
                        dayDiv.classList.add('range-middle-mark');
                        if (formattedKey === this.formatDate(startDate)) {
                            dayDiv.classList.add('range-start-mark');
                        }
                        if (formattedKey === this.formatDate(endDate)) {
                            dayDiv.classList.add('range-end-mark');
                        }
                    }
                }
                currentDate.setDate(currentDate.getDate() + 1);
            }
        }
    }
}

ChronosDisplay.defaultSettings = {
    scheduledOccurrences: [],
    weekdayLabels: ["M", "T", "W", "T", "F", "S", "S"],
    monthLabels: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
    displayWeekdayHeadings: true,
    popupSettings: { position: 'bottom', dynamicHTML: true, activation: 'hover' },
    hintSettings: { position: 'bottom', activation: 'hover' },
    remoteDataFetch: false,
    allowDateSelection: false,
    allowRangeSelection: false,
};

function initializeChronosWidget(elementSelector, options) {
    const targetElements = document.querySelectorAll(elementSelector);
    targetElements.forEach(element => {
        new ChronosDisplay(element, options);
    });
}