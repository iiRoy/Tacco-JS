(function() {
    const primaryConfig = {
        displayControls: true,
        inputVisible: true,
        firstDayIs: 1, // 0: Sunday, 1: Monday
        isStandalone: true,
        aspectRatio: 1,
        outputFormat: 'D/M/Y',
        bottomPanel: true,
        dayHeadings: true,
        presentationMode: 'block', // 'block', 'ephemeral', 'fullpage'
        animationDuration: 200,
        visualTransition: '', // 'fade', 'crossfade', 'slide-horizontal', 'slide-vertical'
        gridStyling: 'calendar-grid condensed-table',
        initialHide: true,
        updateOnPeriodChange: true,
        compactLayout: false
    };

    const currentMoment = new Date();

    const fullMonthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const abbreviatedMonthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const fullDayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const abbreviatedDayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    function retrieveDaysInMonth(yearVal, monthIdx, periodOffset = 0) {
        return new Date(yearVal, monthIdx + 1 + periodOffset, 0).getDate();
    }

    function isSameCalendarDay(dateOne, dateTwo) {
        const comparisonDate = dateTwo === undefined ? new Date() : dateTwo;
        return dateOne.getFullYear() === comparisonDate.getFullYear() &&
               dateOne.getMonth() === comparisonDate.getMonth() &&
               dateOne.getDate() === comparisonDate.getDate();
    }

    function isValidTemporalObject(inputVal) {
        return Object.prototype.toString.call(inputVal) === "[object Date]" && !isNaN(inputVal.getTime());
    }

    function presentDateAsText(targetDate, settings) {
        let pattern = settings.outputFormat;
        const day = ('0' + targetDate.getDate()).slice(-2);
        const month = ('0' + (targetDate.getMonth() + 1)).slice(-2);
        const yearShort = targetDate.getFullYear().toString().slice(-2);
        const yearFull = targetDate.getFullYear();

        return pattern
            .replace(/D/g, day)
            .replace(/M/g, month)
            .replace(/Y/g, yearFull)
            .replace(/y/g, yearShort);
    }

    function createElementWithClass(tag, classes = [], attributes = {}) {
        const el = document.createElement(tag);
        if (classes.length) el.classList.add(...classes.filter(c => c)); // Filter out empty strings
        for (const key in attributes) {
            el.setAttribute(key, attributes[key]);
        }
        return el;
    }

    function removeAllChildren(element) {
        while (element.firstChild) {
            element.removeChild(element.firstChild);
        }
    }

    window.createTimeNavigator = function(targetElement, configuration = {}) {
        const mergedSettings = { ...primaryConfig, ...configuration };
        let activeDisplayedDate = mergedSettings.date instanceof Date ? mergedSettings.date : new Date(currentMoment.getTime());
        let rootComponentContainer;
        let associatedInputControl;

        const internalState = {
            elementReference: null,
            currentDisplayDate: activeDisplayedDate,
            cachedSettings: mergedSettings,
        };

        function composeTopPanel(moment, config) {
            const headerContainer = createElementWithClass('div', ['time-panel-header']);
            const monthLabels = config.outputFormat.includes('Mon') ? abbreviatedMonthNames : fullMonthNames;

            const previousButton = createElementWithClass('button', ['previous-period', 'period-changer', 'action-btn'], { type: 'button' });
            previousButton.innerHTML = '&laquo;';
            headerContainer.appendChild(previousButton);

            const nextButton = createElementWithClass('button', ['next-period', 'period-changer', 'action-btn'], { type: 'button' });
            nextButton.innerHTML = '&raquo;';
            headerContainer.appendChild(nextButton);

            const monthYearDisplay = createElementWithClass('span', ['current-period-label']);
            const displayDiv = createElementWithClass('div');
            displayDiv.textContent = `${monthLabels[moment.getMonth()]} ${moment.getFullYear()}`;
            monthYearDisplay.appendChild(displayDiv);
            headerContainer.appendChild(monthYearDisplay);

            return headerContainer;
        }

        function buildMonthGrid(moment, config) {
            const currentYear = moment.getFullYear();
            const currentMonthIndex = moment.getMonth();
            const firstDayOfMonth = new Date(currentYear, currentMonthIndex, 1);
            const firstWeekdayIndex = firstDayOfMonth.getDay();

            const weekStartOffset = config.firstDayIs;

            let previousMonthVisibleDays = (firstWeekdayIndex - weekStartOffset + 7) % 7;

            const daysInCurrentMonth = retrieveDaysInMonth(currentYear, currentMonthIndex);
            const daysInPreviousMonth = retrieveDaysInMonth(currentYear, currentMonthIndex - 1);

            const completeDaySequence = [];

            for (let i = 0; i < previousMonthVisibleDays; i++) {
                const dayNumber = daysInPreviousMonth - previousMonthVisibleDays + 1 + i;
                completeDaySequence.push({
                    dateObject: new Date(currentYear, currentMonthIndex - 1, dayNumber),
                    label: dayNumber,
                    visualStyle: ['out-of-scope-month']
                });
            }

            for (let i = 1; i <= daysInCurrentMonth; i++) {
                const currentDayObject = new Date(currentYear, currentMonthIndex, i);
                const visualStyle = [];
                if (isSameCalendarDay(currentDayObject, new Date())) visualStyle.push('present-day');
                if (isSameCalendarDay(currentDayObject, moment)) visualStyle.push('active-selection');
                completeDaySequence.push({
                    dateObject: currentDayObject,
                    label: i,
                    visualStyle: visualStyle
                });
            }

            const remainingCellCount = 42 - completeDaySequence.length;
            for (let i = 1; i <= remainingCellCount; i++) {
                completeDaySequence.push({
                    dateObject: new Date(currentYear, currentMonthIndex + 1, i),
                    label: i,
                    visualStyle: ['out-of-scope-month']
                });
            }

            const gridTable = createElementWithClass('table', config.gridStyling.split(' '));

            if (config.dayHeadings) {
                const headerRow = createElementWithClass('tr');
                Array.from({ length: 7 }).forEach((_, i) => {
                    const dayIndex = (weekStartOffset + i) % 7;
                    const headerCell = createElementWithClass('th');
                    headerCell.textContent = abbreviatedDayNames[dayIndex];
                    headerRow.appendChild(headerCell);
                });
                gridTable.appendChild(headerRow);
            }

            for (let r = 0; r < 6; r++) {
                const dataRow = createElementWithClass('tr');
                for (let c = 0; c < 7; c++) {
                    const cellData = completeDaySequence[r * 7 + c];
                    const dataCell = createElementWithClass('td');
                    dataCell.dataset.epochMillis = cellData.dateObject.getTime();
                    dataCell.textContent = cellData.label;
                    dataCell.classList.add(...cellData.visualStyle);
                    dataRow.appendChild(dataCell);
                }
                gridTable.appendChild(dataRow);
            }

            return gridTable;
        }

        function formBottomBar(moment, config) {
            const footerContainer = createElementWithClass('div', ['time-panel-footer', 'input-prefix']);
            if (!config.bottomPanel) {
                footerContainer.style.display = 'none';
            }

            if (config.displayControls) {
                const todayBtn = createElementWithClass('button', ['action-btn', 'today-shortcut'], { type: 'button' });
                todayBtn.textContent = 'Today';
                footerContainer.appendChild(todayBtn);
            }

            if (config.inputVisible) {
                const displaySpan = createElementWithClass('span', ['current-selection-display', 'read-only-input', 'span-two']);
                displaySpan.textContent = presentDateAsText(moment, config);
                footerContainer.appendChild(displaySpan);
            }

            const hiddenInput = createElementWithClass('input', [], { type: 'hidden', value: Math.floor(moment.getTime() / 1000) });
            footerContainer.appendChild(hiddenInput);

            return footerContainer;
        }

        function assemblePrimaryView(displayMoment, replaceContent = false) {
            const config = internalState.cachedSettings;
            internalState.currentDisplayDate = displayMoment || currentMoment;

            if (replaceContent) {
                removeAllChildren(rootComponentContainer);
            }

            rootComponentContainer.appendChild(composeTopPanel(internalState.currentDisplayDate, config));

            const monthWrapper = createElementWithClass('div', ['time-panel-month-view']);
            const monthGrid = buildMonthGrid(internalState.currentDisplayDate, config);
            monthGrid.classList.add('active-month');
            monthWrapper.appendChild(monthGrid);
            rootComponentContainer.appendChild(monthWrapper);

            rootComponentContainer.appendChild(formBottomBar(internalState.currentDisplayDate, config));

            rootComponentContainer.dataset.initialized = 'true';
            rootComponentContainer.dataset.currentDate = internalState.currentDisplayDate.getTime();
            internalState.elementReference = rootComponentContainer;

            return rootComponentContainer;
        }

        function constructEphemeralView(displayMoment) {
            const config = internalState.cachedSettings;
            internalState.currentDisplayDate = displayMoment || currentMoment;

            let containerWrapper, calendarDisplay;

            if (targetElement.parentNode && targetElement.parentNode.classList.contains('ephemeral-view-wrapper')) {
                containerWrapper = targetElement.parentNode;
                calendarDisplay = containerWrapper.querySelector('.time-panel-ephemeral');
                removeAllChildren(calendarDisplay);
            } else {
                containerWrapper = createElementWithClass('div', ['ephemeral-view-wrapper']);
                calendarDisplay = createElementWithClass('div', ['time-panel', 'time-panel-ephemeral']);
                if (targetElement.offsetWidth) {
                    calendarDisplay.style.width = `${targetElement.offsetWidth}px`;
                }
                targetElement.parentNode.insertBefore(containerWrapper, targetElement);
                containerWrapper.appendChild(targetElement);
            }
            containerWrapper.appendChild(calendarDisplay);
            rootComponentContainer = calendarDisplay;

            if (config.initialHide) {
                calendarDisplay.style.display = 'none';
            }

            calendarDisplay.appendChild(composeTopPanel(internalState.currentDisplayDate, config));

            const monthWrapper = createElementWithClass('div', ['time-panel-month-view']);
            const monthGrid = buildMonthGrid(internalState.currentDisplayDate, config);
            monthGrid.classList.add('active-month');
            monthWrapper.appendChild(monthGrid);
            calendarDisplay.appendChild(monthWrapper);

            calendarDisplay.dataset.initialized = 'true';
            calendarDisplay.dataset.currentDate = internalState.currentDisplayDate.getTime();
            internalState.elementReference = calendarDisplay;

            const affixParent = createElementWithClass('div', ['position-affix']);
            containerWrapper.parentNode.insertBefore(affixParent, containerWrapper);
            affixParent.appendChild(containerWrapper);

            return rootComponentContainer;
        }

        function alterPeriodDisplay(changeValue) {
            const container = internalState.elementReference;
            const config = internalState.cachedSettings;
            const currentMomentDate = new Date(parseInt(container.dataset.currentDate));
            const gridElement = container.querySelector('table');

            const containerWidth = gridElement.offsetWidth;
            const containerHeight = gridElement.offsetHeight;

            const monthViewContainer = container.querySelector('.time-panel-month-view');
            if (monthViewContainer) {
                monthViewContainer.style.height = `${containerHeight}px`;
                monthViewContainer.style.overflow = 'hidden';
            }

            let newDay, newActiveDate, transitionDirection;

            if (typeof changeValue === 'number') {
                transitionDirection = changeValue > 0 ? 1 : -1;
                newDay = Math.min(retrieveDaysInMonth(currentMomentDate.getFullYear(), currentMomentDate.getMonth() + changeValue), currentMomentDate.getDate());
                newActiveDate = new Date(currentMomentDate.getFullYear(), currentMomentDate.getMonth() + transitionDirection, newDay);
            } else if (isValidTemporalObject(changeValue)) {
                transitionDirection = (changeValue.getTime() > currentMomentDate.getTime()) ? 1 : -1;
                newActiveDate = currentMoment;
            } else {
                return;
            }

            internalState.currentDisplayDate = newActiveDate;
            container.dataset.currentDate = newActiveDate.getTime();

            const nextGrid = buildMonthGrid(newActiveDate, config);
            nextGrid.classList.add('active-month');
            const currentGrid = container.querySelector('table.active-month');

            const updateComponents = () => {
                const newHeader = composeTopPanel(newActiveDate, config);
                const newFooter = formBottomBar(newActiveDate, config);

                const currentHeader = container.querySelector('.time-panel-header');
                const currentFooter = container.querySelector('.time-panel-footer');

                if (currentHeader) currentHeader.replaceWith(newHeader);
                if (currentFooter) currentFooter.replaceWith(newFooter);

                if (config.updateOnPeriodChange && associatedInputControl) {
                    associatedInputControl.value = presentDateAsText(newActiveDate, config);
                    associatedInputControl.dispatchEvent(new Event('change', { bubbles: true }));
                }
                if (monthViewContainer) monthViewContainer.style.height = '';
            };

            const animate = (timestamp) => {
                let start = null;
                return (currentTime) => {
                    if (!start) start = currentTime;
                    const progress = (currentTime - start) / config.animationDuration;

                    if (progress < 1) {
                        switch (config.visualTransition) {
                            case 'fade':
                                currentGrid.style.opacity = 1 - progress;
                                nextGrid.style.opacity = progress;
                                break;
                            case 'crossfade':
                                currentGrid.style.opacity = 1 - progress;
                                nextGrid.style.opacity = progress;
                                break;
                            case 'slide-horizontal':
                                currentGrid.style.left = `${-(transitionDirection * containerWidth * progress)}px`;
                                nextGrid.style.left = `${transitionDirection * containerWidth * (1 - progress)}px`;
                                break;
                            case 'slide-vertical':
                                currentGrid.style.top = `${-(transitionDirection * containerHeight * progress)}px`;
                                nextGrid.style.top = `${transitionDirection * containerHeight * (1 - progress)}px`;
                                break;
                        }
                        requestAnimationFrame(animate(start));
                    } else {
                        currentGrid.remove();
                        nextGrid.style.opacity = 1;
                        nextGrid.style.position = '';
                        nextGrid.style.left = '';
                        nextGrid.style.top = '';
                        updateComponents();
                    }
                };
            };

            if (config.visualTransition) {
                currentGrid.style.position = 'absolute';
                currentGrid.style.width = '100%';
                nextGrid.style.position = 'absolute';
                nextGrid.style.width = '100%';

                switch (config.visualTransition) {
                    case 'fade':
                        nextGrid.style.opacity = 0;
                        break;
                    case 'crossfade':
                        nextGrid.style.opacity = 0;
                        break;
                    case 'slide-horizontal':
                        nextGrid.style.left = `${transitionDirection * containerWidth}px`;
                        break;
                    case 'slide-vertical':
                        nextGrid.style.top = `${transitionDirection * containerHeight}px`;
                        break;
                }
                currentGrid.parentNode.appendChild(nextGrid);
                requestAnimationFrame(animate(null));
            } else {
                currentGrid.replaceWith(nextGrid);
                updateComponents();
            }
        }

        function handleDaySelection(event) {
            const targetCell = event.target.closest('td');
            if (!targetCell || !targetCell.dataset.epochMillis) return;

            const container = internalState.elementReference;
            const config = internalState.cachedSettings;
            const selectedDate = new Date(parseInt(targetCell.dataset.epochMillis));

            const previouslySelected = container.querySelector('td.active-selection');
            if (previouslySelected) {
                previouslySelected.classList.remove('active-selection');
            }
            targetCell.classList.add('active-selection');

            const newFooter = formBottomBar(selectedDate, config);
            const currentFooter = container.querySelector('.time-panel-footer');
            if (currentFooter) currentFooter.replaceWith(newFooter);

            container.dataset.currentDate = selectedDate.getTime();

            const customEvent = new CustomEvent('momentselect', {
                detail: { selectedDate: selectedDate },
                bubbles: true
            });
            targetElement.dispatchEvent(customEvent);

            if (associatedInputControl) {
                associatedInputControl.value = presentDateAsText(selectedDate, config);
                associatedInputControl.dispatchEvent(new Event('change', { bubbles: true }));
            }
        }

        function handleEphemeralToggle(event) {
            const wrapper = event.currentTarget.closest('.ephemeral-view-wrapper');
            const calendar = wrapper.querySelector('.time-panel-ephemeral');

            if (wrapper.classList.contains('is-open')) {
                wrapper.classList.remove('is-open');
                calendar.style.display = 'none';
            } else {
                document.querySelectorAll('.ephemeral-view-wrapper.is-open').forEach(openWrapper => {
                    if (openWrapper !== wrapper) {
                        openWrapper.classList.remove('is-open');
                        openWrapper.querySelector('.time-panel-ephemeral').style.display = 'none';
                    }
                });
                wrapper.classList.add('is-open');
                calendar.style.display = '';
            }
        }

        function handleGlobalClick(event) {
            const target = event.target;
            const openPopup = document.querySelector('.ephemeral-view-wrapper.is-open');

            if (openPopup && !openPopup.contains(target)) {
                openPopup.classList.remove('is-open');
                openPopup.querySelector('.time-panel-ephemeral').style.display = 'none';
            }
        }

        function initializeDisplay() {
            if (targetElement.tagName === 'INPUT') {
                associatedInputControl = targetElement;
                rootComponentContainer = createElementWithClass('div');
                associatedInputControl.parentNode.insertBefore(rootComponentContainer, associatedInputControl.nextSibling);
            } else {
                rootComponentContainer = targetElement;
            }

            rootComponentContainer.classList.add('time-panel', mergedSettings.visualTransition);
            if (mergedSettings.visualTransition) {
                rootComponentContainer.classList.add('transition-effect');
            }
            if (mergedSettings.compactLayout) {
                rootComponentContainer.classList.add('compact-view');
            }

            switch (mergedSettings.presentationMode) {
                case 'ephemeral':
                    rootComponentContainer.classList.add('popup-activator');
                    constructEphemeralView(activeDisplayedDate);
                    if (associatedInputControl) {
                        associatedInputControl.addEventListener('click', handleEphemeralToggle);
                        associatedInputControl.readOnly = true;
                    }
                    break;
                case 'block':
                default:
                    assemblePrimaryView(activeDisplayedDate);
                    break;
            }

            rootComponentContainer.addEventListener('click', (event) => {
                const target = event.target;
                if (target.classList.contains('period-changer')) {
                    event.preventDefault();
                    event.stopPropagation();
                    alterPeriodDisplay(target.classList.contains('next-period') ? 1 : -1);
                } else if (target.classList.contains('today-shortcut')) {
                    alterPeriodDisplay(currentMoment);
                } else if (target.tagName === 'TD') {
                    handleDaySelection(event);
                }
            });

            if (!document.body.dataset.timeNavigatorEventsAttached) {
                document.addEventListener('click', handleGlobalClick);
                document.body.dataset.timeNavigatorEventsAttached = 'true';
            }
        }

        function obtainActiveDate() {
            return new Date(parseInt(internalState.elementReference.dataset.currentDate));
        }

        initializeDisplay();

        return {
            changeDisplayPeriod: alterPeriodDisplay,
            getCurrentActiveDate: obtainActiveDate,
            getDisplayElement: () => internalState.elementReference
        };
    };
})();