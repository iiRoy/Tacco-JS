class TemporalDisplay {
    constructor(domContainer, userConfigurations) {
        this.targetElement = domContainer;

        this.defaultConfigurations = {
            startDayOfWeek: 1, // 0 for Sunday, 1 for Monday
            dayAbbreviations: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
            fullMonthNames: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
            currentDayLabel: 'Present Day',
            eventHeaderLabel: 'Scheduled Engagements',
            engagementData: null
        };

        this.activeSettings = Object.assign({}, this.defaultConfigurations, userConfigurations);

        this.daysPerMonthArray = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
        this.todayReference = new Date();
        this.viewingPeriod = new Date(this.todayReference.getFullYear(), this.todayReference.getMonth(), 1); // Represents the displayed month/year

        this.initiateComponent();
    }

    initiateComponent() {
        const baseMarkup = `
            <h1 class="component-year-display"></h1>
            <h3 class="component-month-display"></h3>
            <table class="component-grid-table" id="main-component-grid">
                <thead class="grid-table-head"></thead>
                <tbody class="grid-table-body"></tbody>
                <tfoot>
                    <tr>
                        <th colspan="2" class="navigation-element" data-nav-action="previous"><div class="arrow-symbol"><i class="icon-left"></i></div></th>
                        <th colspan="3" class="navigation-element" data-nav-action="today">${this.activeSettings.currentDayLabel}</th>
                        <th colspan="2" class="navigation-element" data-nav-action="next"><div class="arrow-symbol"><i class="icon-right"></i></div></th>
                    </tr>
                </tfoot>
            </table>
        `;
        this.targetElement.innerHTML = baseMarkup;

        this.mainGridElement = this.targetElement.querySelector('#main-component-grid');
        this.mainGridElement.addEventListener('click', this.handleGridInteraction.bind(this));

        this.buildCalendarGrid(this.viewingPeriod);
    }

    applyEngagementHighlights(engagementRecords, gridBodyNode) {
        const currentYear = this.viewingPeriod.getFullYear();
        const currentMonth = this.viewingPeriod.getMonth();

        if (!engagementRecords || !Array.isArray(engagementRecords.event)) return;

        engagementRecords.event.forEach(record => {
            const recordDate = new Date(record.date);
            if (recordDate.getFullYear() === currentYear && recordDate.getMonth() === currentMonth) {
                const dayValue = recordDate.getDate();
                const dayCell = gridBodyNode.querySelector(`[data-day-value="${dayValue}"]`);
                if (dayCell) {
                    dayCell.classList.remove("day-cell-normal");
                    dayCell.classList.add("day-cell-event");
                    dayCell.setAttribute('title', this.activeSettings.eventHeaderLabel);
                    dayCell.setAttribute('data-event-details', `You have ${record.title} appointments`);
                    dayCell.addEventListener('mouseover', this.displayEventPopup.bind(this, dayCell));
                    dayCell.addEventListener('mouseout', this.hideEventPopup.bind(this, dayCell));
                }
            }
        });
    }

    displayEventPopup(cellNode, eventObject) {
        let eventPopup = document.createElement('div');
        eventPopup.className = 'event-info-popup';
        eventPopup.innerHTML = `<strong>${cellNode.getAttribute('title')}</strong><br>${cellNode.getAttribute('data-event-details')}`;
        eventPopup.style.position = 'absolute';
        eventPopup.style.background = '#f9f9f9';
        eventPopup.style.border = '1px solid #ddd';
        eventPopup.style.padding = '8px';
        eventPopup.style.borderRadius = '4px';
        eventPopup.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
        eventPopup.style.zIndex = '1000';
        eventPopup.style.left = (eventObject.pageX + 15) + 'px';
        eventPopup.style.top = (eventObject.pageY + 15) + 'px';
        document.body.appendChild(eventPopup);
        cellNode._eventPopupRef = eventPopup;
    }

    hideEventPopup(cellNode) {
        if (cellNode._eventPopupRef) {
            cellNode._eventPopupRef.remove();
            delete cellNode._eventPopupRef;
        }
    }

    retrieveEngagements() {
        if (this.activeSettings.engagementData) {
            if (typeof this.activeSettings.engagementData === 'function') {
                const engagements = this.activeSettings.engagementData.apply(this, []);
                this.applyEngagementHighlights(engagements, this.mainGridElement);
            } else {
                this.applyEngagementHighlights(this.activeSettings.engagementData, this.mainGridElement);
            }
        }
    }

    buildCalendarGrid(currentDate) {
        const yearDisplay = this.targetElement.querySelector('.component-year-display');
        const monthDisplay = this.targetElement.querySelector('.component-month-display');
        const gridHead = this.mainGridElement.querySelector('.grid-table-head');
        const gridBody = this.mainGridElement.querySelector('.grid-table-body');

        yearDisplay.textContent = currentDate.getFullYear();
        monthDisplay.textContent = this.activeSettings.fullMonthNames[currentDate.getMonth()];

        this.daysPerMonthArray[1] = this.isYearBissextile(currentDate.getFullYear()) ? 29 : 28;

        gridHead.innerHTML = '';
        gridBody.innerHTML = '';

        this.generateDayHeaders(gridHead);

        const firstDayOfMonthIndex = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay(); // 0 (Sun) - 6 (Sat)
        const totalDaysInCurrentMonth = this.daysPerMonthArray[currentDate.getMonth()];

        let dayCounter = 1;
        let weekRowNode;

        const paddingCellsBeforeMonth = (firstDayOfMonthIndex - this.activeSettings.startDayOfWeek + 7) % 7;

        for (let weekIndex = 0; weekIndex < 6; weekIndex++) {
            weekRowNode = document.createElement('tr');
            for (let dayOfWeekIndex = 0; dayOfWeekIndex < 7; dayOfWeekIndex++) {
                const cellNode = document.createElement('td');
                if (weekIndex === 0 && dayOfWeekIndex < paddingCellsBeforeMonth) {
                    cellNode.classList.add('day-cell-empty');
                    cellNode.innerHTML = '&nbsp;';
                } else if (dayCounter > totalDaysInCurrentMonth) {
                    cellNode.classList.add('day-cell-empty');
                    cellNode.innerHTML = '&nbsp;';
                } else {
                    cellNode.classList.add('day-cell-normal');
                    cellNode.dataset.dayValue = dayCounter;
                    cellNode.dataset.monthValue = currentDate.getMonth() + 1; // 1-indexed month
                    cellNode.dataset.yearValue = currentDate.getFullYear();
                    cellNode.textContent = dayCounter;

                    if (currentDate.getFullYear() === this.todayReference.getFullYear() &&
                        currentDate.getMonth() === this.todayReference.getMonth() &&
                        dayCounter === this.todayReference.getDate()) {
                        cellNode.classList.add('day-cell-today');
                    } else {
                        const actualDayIndex = (this.activeSettings.startDayOfWeek + dayOfWeekIndex) % 7;
                        if (actualDayIndex === 0 || actualDayIndex === 6) { // Sunday or Saturday
                            cellNode.classList.add('day-cell-weekend');
                        }
                    }
                    dayCounter++;
                }
                weekRowNode.appendChild(cellNode);
            }
            gridBody.appendChild(weekRowNode);
            if (dayCounter > totalDaysInCurrentMonth && weekIndex >= 4) {
                break;
            }
        }
        this.retrieveEngagements();
    }

    generateDayHeaders(headerElement) {
        const headerRow = document.createElement('tr');
        for (let i = 0; i < 7; i++) {
            const headerCell = document.createElement('th');
            const dayIdx = (this.activeSettings.startDayOfWeek + i) % 7;
            headerCell.textContent = this.activeSettings.dayAbbreviations[dayIdx];
            headerRow.appendChild(headerCell);
        }
        headerElement.appendChild(headerRow);
    }

    handleGridInteraction(eventTrigger) {
        eventTrigger.preventDefault();
        const interactedElement = eventTrigger.target.closest('td, th');

        if (!interactedElement) return;

        if (interactedElement.tagName.toLowerCase() === 'td') {
            if (interactedElement.classList.contains('day-cell-normal') || interactedElement.classList.contains('day-cell-today') || interactedElement.classList.contains('day-cell-event')) {
                const selectedDay = parseInt(interactedElement.dataset.dayValue, 10);
                const selectedMonth = parseInt(interactedElement.dataset.monthValue, 10);
                const selectedYear = parseInt(interactedElement.dataset.yearValue, 10);

                const eventCategory = interactedElement.classList.contains('day-cell-event') ? 'engagementSelected' : 'dateChosen';
                this.targetElement.dispatchEvent(new CustomEvent(eventCategory, {
                    detail: { day: selectedDay, month: selectedMonth, year: selectedYear }
                }));
            }
        } else if (interactedElement.tagName.toLowerCase() === 'th' && interactedElement.classList.contains('navigation-element')) {
            const navigationAction = interactedElement.dataset.navAction;
            let updatedViewDate;
            let customEventName;

            switch (navigationAction) {
                case 'previous':
                    updatedViewDate = new Date(this.viewingPeriod.getFullYear(), this.viewingPeriod.getMonth() - 1, 1);
                    customEventName = 'previousMonthViewed';
                    break;
                case 'today':
                    updatedViewDate = new Date(this.todayReference.getFullYear(), this.todayReference.getMonth(), 1);
                    customEventName = 'currentMonthViewed';
                    break;
                case 'next':
                    updatedViewDate = new Date(this.viewingPeriod.getFullYear(), this.viewingPeriod.getMonth() + 1, 1);
                    customEventName = 'nextMonthViewed';
                    break;
                default:
                    return;
            }
            this.viewingPeriod = updatedViewDate;
            this.buildCalendarGrid(this.viewingPeriod);
            this.targetElement.dispatchEvent(new CustomEvent(customEventName));
        }
    }

    isYearBissextile(yearNumericValue) {
        return ((yearNumericValue % 4 === 0) && (yearNumericValue % 100 !== 0)) || (yearNumericValue % 400 === 0);
    }
}