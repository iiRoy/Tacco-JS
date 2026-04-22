(function(scope, undefined) {

    let identCounter = 0;

    const dateUtility = (function() {
        const _padZero = (num) => String(num).padStart(2, '0');

        const _formats = {
            'M': (d) => d.getMonth() + 1,
            'MM': (d) => _padZero(d.getMonth() + 1),
            'd': (d) => d.getDate(),
            'dd': (d) => _padZero(d.getDate()),
            'y': (d) => String(d.getFullYear()).slice(-2),
            'yy': (d) => d.getFullYear(),
            'D': (d) => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getDay()],
            'DD': (d) => ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][d.getDay()],
            'Mname': (d) => ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][d.getMonth()],
            'MMname': (d) => ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][d.getMonth()]
        };

        const _formatPatterns = {
            'M d, yy': (d) => `${_formats.Mname(d)} ${_formats.d(d)}, ${_formats.yy(d)}`,
            'yy-mm-dd': (d) => `${_formats.yy(d)}-${_formats.MM(d)}-${_formats.dd(d)}`
        };

        const formatDate = (date, formatString) => {
            if (!date) return '';
            if (_formatPatterns[formatString]) {
                return _formatPatterns[formatString](date);
            }
            return formatString.replace(/([M]{1,2}|[d]{1,2}|[y]{1,2})/g, (match) => {
                const formatter = _formats[match];
                return formatter ? formatter(date) : match;
            });
        };

        const parseDate = (formatString, dateString) => {
            if (!dateString) return null;
            let year, month, day;

            if (formatString === 'M d, yy') {
                const parts = dateString.match(/([A-Za-z]+)\s+(\d+),\s+(\d{4})/);
                if (!parts) return null;
                const monthName = parts[1];
                const monthIndex = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].indexOf(monthName);
                if (monthIndex === -1) return null;
                month = monthIndex;
                day = parseInt(parts[2], 10);
                year = parseInt(parts[3], 10);
            } else if (formatString === 'yy-mm-dd') {
                const parts = dateString.match(/(\d{4})-(\d{2})-(\d{2})/);
                if (!parts) return null;
                year = parseInt(parts[1], 10);
                month = parseInt(parts[2], 10) - 1;
                day = parseInt(parts[3], 10);
            } else {
                return new Date(dateString);
            }

            const parsedDate = new Date(year, month, day);
            if (parsedDate.getFullYear() === year && parsedDate.getMonth() === month && parsedDate.getDate() === day) {
                return parsedDate;
            }
            return null;
        };

        const adjustDate = (date, type, amount) => {
            const newDate = new Date(date.getTime());
            switch (type) {
                case 'days':
                    newDate.setDate(newDate.getDate() + amount);
                    break;
                case 'months':
                    newDate.setMonth(newDate.getMonth() + amount);
                    break;
                case 'years':
                    newDate.setFullYear(newDate.getFullYear() + amount);
                    break;
            }
            return newDate;
        };

        const setTimeBounds = (date, type) => {
            const newDate = new Date(date.getTime());
            if (type === 'startOfDay') {
                newDate.setHours(0, 0, 0, 0);
            } else if (type === 'endOfDay') {
                newDate.setHours(23, 59, 59, 999);
            } else if (type === 'startOfMonth') {
                newDate.setDate(1);
                newDate.setHours(0, 0, 0, 0);
            } else if (type === 'endOfMonth') {
                newDate.setMonth(newDate.getMonth() + 1, 0);
                newDate.setHours(23, 59, 59, 999);
            } else if (type === 'startOfYear') {
                newDate.setMonth(0, 1);
                newDate.setHours(0, 0, 0, 0);
            }
            return newDate;
        };

        const setIsoWeekday = (date, dayOfWeek) => {
            const newDate = new Date(date.getTime());
            const currentDay = newDate.getDay();
            const diff = dayOfWeek - (currentDay === 0 ? 7 : currentDay);
            newDate.setDate(newDate.getDate() + diff);
            return newDate;
        };

        return {
            format: formatDate,
            parse: parseDate,
            addDays: (d, a) => adjustDate(d, 'days', a),
            subtractDays: (d, a) => adjustDate(d, 'days', -a),
            subtractMonths: (d, a) => adjustDate(d, 'months', -a),
            startOfDay: (d) => setTimeBounds(d, 'startOfDay'),
            endOfDay: (d) => setTimeBounds(d, 'endOfDay'),
            startOfMonth: (d) => setTimeBounds(d, 'startOfMonth'),
            endOfMonth: (d) => setTimeBounds(d, 'endOfMonth'),
            startOfYear: (d) => setTimeBounds(d, 'startOfYear'),
            isoWeekday: setIsoWeekday,
            now: () => new Date(),
            clone: (d) => d ? new Date(d.getTime()) : null,
            isSameDay: (d1, d2) => d1 && d2 && d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate()
        };
    })();

    const domHelper = {
        create: (tag, classes = [], attributes = {}, content = '') => {
            const element = document.createElement(tag);
            if (classes.length) {
                element.className = classes.join(' ');
            }
            for (const key in attributes) {
                element.setAttribute(key, attributes[key]);
            }
            if (content) {
                element.innerHTML = content;
            }
            return element;
        },
        appendChildren: (parent, children) => {
            children.forEach(child => parent.appendChild(child));
        },
        addClass: (element, className) => {
            if (element) element.classList.add(className);
        },
        removeClass: (element, className) => {
            if (element) element.classList.remove(className);
        },
        hasClass: (element, className) => element ? element.classList.contains(className) : false,
        setAttributes: (element, attrs) => {
            for (const key in attrs) {
                element.setAttribute(key, attrs[key]);
            }
        },
        insertAfter: (newNode, referenceNode) => {
            referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
        }
    };

    function createActivationControl(inputNode, styleNamespace, configSettings) {
        let componentElement;
        let elementIdentifier;

        function adjustReferences() {
            elementIdentifier = 'date_interval_gen' + identCounter++;
            const relatedLabel = document.querySelector(`label[for="${inputNode.id}"]`);
            if (relatedLabel) {
                relatedLabel.setAttribute('for', elementIdentifier);
            }
        }

        function setup() {
            adjustReferences();
            componentElement = domHelper.create('button', [styleNamespace + '-activationbutton'], {
                'type': 'button',
                'title': inputNode.title,
                'tabindex': inputNode.tabIndex,
                'id': elementIdentifier
            }, configSettings.defaultPrompt);
            const spanText = domHelper.create('span', ['ui-button-text'], {}, configSettings.defaultPrompt);
            const spanIcon = domHelper.create('span', ['ui-button-icon-secondary', 'ui-icon', configSettings.indicatorGlyph]);
            domHelper.appendChildren(componentElement, [spanIcon, spanText]);
        }

        function retrieveLabel() {
            return componentElement.querySelector('.ui-button-text').textContent;
        }

        function updateLabel(value) {
            componentElement.querySelector('.ui-button-text').textContent = value;
        }

        function restoreDefault() {
            inputNode.value = '';
            inputNode.dispatchEvent(new Event('change'));
            updateLabel(configSettings.defaultPrompt);
        }

        setup();
        return {
            getVisualElement: () => componentElement,
            retrieveLabel: retrieveLabel,
            updateLabel: updateLabel,
            restoreDefault: restoreDefault
        };
    }

    function constructPresetList(styleNamespace, configSettings, selectionCallback) {
        let componentElement;
        let menuList;

        function setup() {
            componentElement = domHelper.create('div', [styleNamespace + '-presets']);
            menuList = domHelper.create('ul');

            configSettings.fixedIntervals.forEach(interval => {
                const listItem = domHelper.create('li');
                const anchor = domHelper.create('a', [], { 'href': '#' }, interval.text);
                listItem.appendChild(anchor);

                listItem._initiationDateFn = interval.initiationDate;
                listItem._terminationDateFn = interval.terminationDate;

                listItem.addEventListener('click', (evt) => {
                    evt.preventDefault();
                    selectionCallback.call(listItem);
                });
                menuList.appendChild(listItem);
            });
            componentElement.appendChild(menuList);
        }

        setup();
        return {
            getVisualElement: () => componentElement
        };
    }

    function generateDateGrid(styleNamespace, configSettings) {
        let componentElement;
        let selectedPeriod = { beginning: null, ending: null };

        const calendarClasses = [styleNamespace + '-calendar', 'ui-widget-content'];
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

        let currentDisplayDate = dateUtility.now();

        function getDaysInMonth(year, month) {
            return new Date(year, month + 1, 0).getDate();
        }

        function createMonthTable(year, month) {
            const firstDay = new Date(year, month, 1);
            const firstDayOfWeek = firstDay.getDay();
            const daysInMonth = getDaysInMonth(year, month);

            const table = domHelper.create('table', ['ui-datepicker-calendar']);
            const caption = domHelper.create('caption', [], {}, `${monthNames[month]} ${year}`);
            table.appendChild(caption);

            const thead = domHelper.create('thead');
            const headRow = domHelper.create('tr');
            dayNames.forEach(day => {
                headRow.appendChild(domHelper.create('th', [], {}, day));
            });
            thead.appendChild(headRow);
            table.appendChild(thead);

            const tbody = domHelper.create('tbody');
            let date = 1;
            for (let i = 0; i < 6; i++) {
                const weekRow = domHelper.create('tr');
                for (let j = 0; j < 7; j++) {
                    const dayCell = domHelper.create('td');
                    if (i === 0 && j < firstDayOfWeek) {
                        dayCell.textContent = '';
                    } else if (date > daysInMonth) {
                        dayCell.textContent = '';
                    } else {
                        const cellDate = new Date(year, month, date);
                        const dayLink = domHelper.create('a', ['ui-state-default'], { 'href': '#' }, date);
                        dayLink._date = cellDate;

                        const today = dateUtility.startOfDay(dateUtility.now());
                        const cellDateStartOfDay = dateUtility.startOfDay(cellDate);
                        const isSelectedStart = selectedPeriod.beginning && dateUtility.isSameDay(cellDate, selectedPeriod.beginning);
                        const isSelectedEnd = selectedPeriod.ending && dateUtility.isSameDay(cellDate, selectedPeriod.ending);
                        const isInRange = selectedPeriod.beginning && selectedPeriod.ending &&
                                          cellDateStartOfDay >= dateUtility.startOfDay(selectedPeriod.beginning) &&
                                          cellDateStartOfDay <= dateUtility.startOfDay(selectedPeriod.ending);

                        if (isSelectedStart || isSelectedEnd || isInRange) {
                            domHelper.addClass(dayLink, 'ui-state-highlight');
                        }
                        if (dateUtility.isSameDay(cellDate, today)) {
                            domHelper.addClass(dayLink, 'ui-state-active');
                        }

                        if (configSettings.calendarDisplayOptions.maxDate !== undefined) {
                            const maxDate = dateUtility.startOfDay(dateUtility.addDays(dateUtility.now(), configSettings.calendarDisplayOptions.maxDate));
                            if (cellDateStartOfDay > maxDate) {
                                domHelper.addClass(dayLink, 'ui-state-disabled');
                                dayLink.removeAttribute('href');
                            }
                        }

                        dayCell.appendChild(dayLink);
                        dayCell.addEventListener('click', (e) => {
                            e.preventDefault();
                            if (!domHelper.hasClass(dayLink, 'ui-state-disabled')) {
                                handleDaySelection(dayLink._date);
                            }
                        });
                        date++;
                    }
                    weekRow.appendChild(dayCell);
                }
                tbody.appendChild(weekRow);
                if (date > daysInMonth && i >= 4 && firstDayOfWeek === 0 && daysInMonth === 28) break;
            }
            table.appendChild(tbody);
            return table;
        }

        function renderCalendars() {
            componentElement.innerHTML = '';
            const numMonths = configSettings.calendarDisplayOptions.numberOfMonths || 1;
            let currentMonth = new Date(currentDisplayDate.getFullYear(), currentDisplayDate.getMonth(), 1);

            for (let i = 0; i < numMonths; i++) {
                const monthContainer = domHelper.create('div', ['ui-datepicker-group']);
                monthContainer.appendChild(createMonthTable(currentMonth.getFullYear(), currentMonth.getMonth()));
                componentElement.appendChild(monthContainer);
                currentMonth.setMonth(currentMonth.getMonth() + 1);
            }
        }

        function handleDaySelection(selectedDate) {
            const normalizedDate = dateUtility.startOfDay(selectedDate);
            
            if (!selectedPeriod.beginning || selectedPeriod.ending) {
                selectedPeriod.beginning = normalizedDate;
                selectedPeriod.ending = null;
            } else if (normalizedDate < selectedPeriod.beginning) {
                selectedPeriod.ending = selectedPeriod.beginning;
                selectedPeriod.beginning = normalizedDate;
            } else {
                selectedPeriod.ending = normalizedDate;
            }

            if (configSettings.calendarDisplayOptions.onSelect) {
                configSettings.calendarDisplayOptions.onSelect(normalizedDate);
            }
            renderCalendars();
        }

        function setup() {
            componentElement = domHelper.create('div', calendarClasses);
            renderCalendars();
            scheduleMidnightRefresh();
        }

        function scheduleMidnightRefresh() {
            const now = dateUtility.now();
            const endOfToday = dateUtility.endOfDay(now);
            const timeUntilMidnight = endOfToday.getTime() - now.getTime() + 1000;

            setTimeout(() => {
                refreshCalendar();
                scheduleMidnightRefresh();
            }, timeUntilMidnight);
        }

        function refreshCalendar() {
            currentDisplayDate = dateUtility.now();
            renderCalendars();
        }

        function resetSelectedPeriod() {
            selectedPeriod = { beginning: null, ending: null };
            refreshCalendar();
        }

        setup();
        return {
            getVisualElement: () => componentElement,
            retrieveSelectedPeriod: () => ({ ...selectedPeriod }),
            assignSelectedPeriod: (value) => {
                selectedPeriod = {
                    beginning: dateUtility.clone(value.beginning),
                    ending: dateUtility.clone(value.ending)
                };
                renderCalendars();
            },
            refreshCalendar: refreshCalendar,
            resetSelectedPeriod: resetSelectedPeriod,
            adjustViewToStart: () => {
                if (selectedPeriod.beginning) {
                    const currentMonthStart = new Date(currentDisplayDate.getFullYear(), currentDisplayDate.getMonth(), 1);
                    const selectedMonthStart = new Date(selectedPeriod.beginning.getFullYear(), selectedPeriod.beginning.getMonth(), 1);
                    if (selectedMonthStart.getTime() < currentMonthStart.getTime() ||
                        selectedMonthStart.getTime() >= dateUtility.addMonths(currentMonthStart, configSettings.calendarDisplayOptions.numberOfMonths || 1).getTime()) {
                        currentDisplayDate = dateUtility.clone(selectedPeriod.beginning);
                        renderCalendars();
                    }
                }
            }
        };
    }

    function assembleControlBar(styleNamespace, configSettings, actionHandlers) {
        let componentElement;
        let confirmButton, clearButton, abortButton;

        function setup() {
            confirmButton = domHelper.create('button', ['ui-priority-primary'], { 'type': 'button' }, configSettings.confirmActionLabel);
            clearButton = domHelper.create('button', ['ui-priority-secondary'], { 'type': 'button' }, configSettings.resetActionLabel);
            abortButton = domHelper.create('button', ['ui-priority-secondary'], { 'type': 'button' }, configSettings.abortActionLabel);

            componentElement = domHelper.create('div', [styleNamespace + '-controlbar', 'ui-helper-clearfix']);
            domHelper.appendChildren(componentElement, [confirmButton, clearButton, abortButton]);

            bindActions();
        }

        function bindActions() {
            if (actionHandlers) {
                confirmButton.addEventListener('click', actionHandlers.onConfirm);
                clearButton.addEventListener('click', actionHandlers.onReset);
                abortButton.addEventListener('click', actionHandlers.onAbort);
            }
        }

        setup();
        return {
            getVisualElement: () => componentElement
        };
    }

    class DateIntervalSelector {
        constructor(inputNode, initialOptions) {
            this.inputNode = inputNode;
            this.configSettings = Object.assign({}, DateIntervalSelector.defaultConfiguration, initialOptions);

            this.styleNamespace = 'date-interval-picker';
            this.floatingPanel = null;
            this.overlayShield = null;
            this.activationControl = null;
            this.presetOptions = null;
            this.dateGrid = null;
            this.actionControls = null;

            this.isPanelVisible = false;
            this.layoutSide = 'right';
            this.verticalAlignment = 'bottom';
            this.needsLayoutAdjustment = false;

            this.initializeComponent();
        }

        initializeComponent() {
            this.activationControl = createActivationControl(this.inputNode, this.styleNamespace, this.configSettings);
            this.presetOptions = constructPresetList(this.styleNamespace, this.configSettings, this.handlePresetSelection.bind(this));
            this.dateGrid = generateDateGrid(this.styleNamespace, this.configSettings);
            this.actionControls = assembleControlBar(this.styleNamespace, this.configSettings, {
                onConfirm: this.handleApply.bind(this),
                onReset: this.handleClear.bind(this),
                onAbort: this.handleCancel.bind(this)
            });

            this.renderPickerStructure();
            this.resetSelection();
            this.bindCoreEvents();

            this.inputNode._dateIntervalSelectorInstance = this;
        }

        removeComponent() {
            if (this.floatingPanel) this.floatingPanel.remove();
            if (this.overlayShield) this.overlayShield.remove();
            if (this.activationControl) this.activationControl.getVisualElement().remove();
            this.inputNode.style.display = '';
            this.unbindCoreEvents();
            delete this.inputNode._dateIntervalSelectorInstance;
        }

        renderPickerStructure() {
            this.floatingPanel = domHelper.create('div', [
                this.styleNamespace,
                `${this.styleNamespace}-${this.layoutSide}`,
                'ui-widget', 'ui-widget-content', 'ui-corner-all', 'ui-front'
            ]);

            const mainContent = domHelper.create('div', [`${this.styleNamespace}-main`, 'ui-widget-content']);
            domHelper.appendChildren(mainContent, [
                this.presetOptions.getVisualElement(),
                this.dateGrid.getVisualElement()
            ]);

            const clearfixDiv = domHelper.create('div', ['ui-helper-clearfix']);
            clearfixDiv.appendChild(this.actionControls.getVisualElement());

            domHelper.appendChildren(this.floatingPanel, [mainContent, clearfixDiv]);
            this.floatingPanel.style.display = 'none';

            this.inputNode.style.display = 'none';
            domHelper.insertAfter(this.activationControl.getVisualElement(), this.inputNode);

            this.overlayShield = domHelper.create('div', ['ui-front', `${this.styleNamespace}-overlay`]);
            this.overlayShield.style.display = 'none';

            document.body.appendChild(this.overlayShield);
            document.body.appendChild(this.floatingPanel);
        }

        bindCoreEvents() {
            this.activationControl.getVisualElement().addEventListener('click', this.togglePanel.bind(this));
            this.activationControl.getVisualElement().addEventListener('keydown', this.handleKeyToggle.bind(this));
            this.overlayShield.addEventListener('click', this.hidePanel.bind(this));
            window.addEventListener('resize', this.handleResize.bind(this));
        }

        unbindCoreEvents() {
            this.activationControl.getVisualElement().removeEventListener('click', this.togglePanel.bind(this));
            this.activationControl.getVisualElement().removeEventListener('keydown', this.handleKeyToggle.bind(this));
            this.overlayShield.removeEventListener('click', this.hidePanel.bind(this));
            window.removeEventListener('resize', this.handleResize.bind(this));
        }

        handleResize() {
            if (this.isPanelVisible) {
                this.repositionPanel();
            } else {
                this.needsLayoutAdjustment = true;
            }
        }

        revealPanel() {
            if (this.isPanelVisible) return;

            this.isPanelVisible = true;
            this.overlayShield.style.display = 'block';
            this.floatingPanel.style.display = 'block';

            this.dateGrid.adjustViewToStart();
            this.repositionPanel();

            if (this.configSettings.onOpen) {
                this.configSettings.onOpen();
            }
        }

        hidePanel() {
            if (!this.isPanelVisible) return;

            this.isPanelVisible = false;
            this.overlayShield.style.display = 'none';
            this.floatingPanel.style.display = 'none';

            if (this.configSettings.onClose) {
                this.configSettings.onClose();
            }
        }

        togglePanel() {
            if (this.isPanelVisible) {
                this.hidePanel();
            } else {
                this.revealPanel();
            }
        }

        handleKeyToggle(event) {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                this.togglePanel();
            }
        }

        repositionPanel() {
            const triggerRect = this.activationControl.getVisualElement().getBoundingClientRect();
            const panelRect = this.floatingPanel.getBoundingClientRect();
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;

            let top = triggerRect.bottom + this.configSettings.verticalOffset;
            let left = triggerRect.left;

            if (left + panelRect.width > viewportWidth && this.configSettings.adjustPositionOnOverlap) {
                left = triggerRect.right - panelRect.width;
                if (left < 0) left = 0;
                this.layoutSide = 'left';
            } else {
                this.layoutSide = 'right';
            }

            if (top + panelRect.height > viewportHeight) {
                top = triggerRect.top - panelRect.height - this.configSettings.verticalOffset;
                this.verticalAlignment = 'top';
            } else {
                this.verticalAlignment = 'bottom';
            }

            this.floatingPanel.style.top = `${top + window.scrollY}px`;
            this.floatingPanel.style.left = `${left + window.scrollX}px`;
            this.floatingPanel.className = [
                this.styleNamespace,
                `${this.styleNamespace}-${this.layoutSide}`,
                'ui-widget', 'ui-widget-content', 'ui-corner-all', 'ui-front'
            ].join(' ');
        }

        formatForDisplay(period) {
            if (!period.beginning) return '';
            const startStr = dateUtility.format(period.beginning, this.configSettings.displayFormat);
            if (!period.ending || dateUtility.isSameDay(period.beginning, period.ending)) {
                return startStr;
            }
            const endStr = dateUtility.format(period.ending, this.configSettings.displayFormat);
            return `${startStr}${this.configSettings.intervalDivider}${endStr}`;
        }

        formatForStorage(period) {
            if (!period.beginning) return '';
            const formatted = {
                start: dateUtility.format(period.beginning, this.configSettings.storageFormat),
                end: dateUtility.format(period.ending || period.beginning, this.configSettings.storageFormat)
            };
            return JSON.stringify(formatted);
        }

        parseStoredRange(jsonText) {
            if (!jsonText) return null;
            try {
                const parsed = JSON.parse(jsonText);
                if (parsed && parsed.start) {
                    return {
                        beginning: dateUtility.parse(this.configSettings.storageFormat, parsed.start),
                        ending: dateUtility.parse(this.configSettings.storageFormat, parsed.end)
                    };
                }
            } catch (e) {
                console.error("Error parsing stored date range:", e);
            }
            return null;
        }

        assignInterval(period) {
            const currentSelectedPeriod = this.dateGrid.retrieveSelectedPeriod();
            let newPeriod = period || currentSelectedPeriod;

            if (!newPeriod.beginning) {
                return;
            }
            if (!newPeriod.ending) {
                newPeriod.ending = dateUtility.clone(newPeriod.beginning);
            }

            this.dateGrid.assignSelectedPeriod(newPeriod);
            this.activationControl.updateLabel(this.formatForDisplay(newPeriod));
            this.inputNode.value = this.formatForStorage(newPeriod);
            this.inputNode.dispatchEvent(new Event('change'));

            if (this.configSettings.onChange) {
                this.configSettings.onChange(newPeriod);
            }
        }

        retrieveInterval() {
            return this.parseStoredRange(this.inputNode.value);
        }

        eraseInterval() {
            this.activationControl.restoreDefault();
            this.dateGrid.resetSelectedPeriod();
            this.inputNode.value = '';
            this.inputNode.dispatchEvent(new Event('change'));
            if (this.configSettings.onChange) {
                this.configSettings.onChange(null);
            }
        }

        resetSelection() {
            const storedPeriod = this.parseStoredRange(this.inputNode.value);
            if (storedPeriod && storedPeriod.beginning && storedPeriod.ending) {
                this.activationControl.updateLabel(this.formatForDisplay(storedPeriod));
                this.dateGrid.assignSelectedPeriod(storedPeriod);
            } else {
                this.dateGrid.resetSelectedPeriod();
                this.activationControl.updateLabel(this.configSettings.defaultPrompt);
            }
        }

        handlePresetSelection() {
            const startFn = this._initiationDateFn;
            const endFn = this._terminationDateFn;

            const start = dateUtility.startOfDay(startFn());
            const end = dateUtility.startOfDay(endFn());

            this.dateGrid.assignSelectedPeriod({ beginning: start, ending: end });

            if (this.configSettings.autoConfirmPreset) {
                this.hidePanel();
                this.assignInterval();
            }
        }

        handleApply() {
            this.hidePanel();
            this.assignInterval();
        }

        handleClear() {
            this.hidePanel();
            this.eraseInterval();
        }

        handleCancel() {
            this.hidePanel();
            this.resetSelection();
        }

        getVisualElement() {
            return this.floatingPanel;
        }
    }

    DateIntervalSelector.defaultConfiguration = {
        fixedIntervals: [
            {text: 'Today', initiationDate: () => dateUtility.now(), terminationDate: () => dateUtility.now() },
            {text: 'Yesterday', initiationDate: () => dateUtility.subtractDays(dateUtility.now(), 1), terminationDate: () => dateUtility.subtractDays(dateUtility.now(), 1) },
            {text: 'Last 7 Days', initiationDate: () => dateUtility.subtractDays(dateUtility.now(), 6), terminationDate: () => dateUtility.now() },
            {text: 'Last Week (Mo-Su)', initiationDate: () => dateUtility.isoWeekday(dateUtility.subtractDays(dateUtility.now(), 7), 1), terminationDate: () => dateUtility.isoWeekday(dateUtility.subtractDays(dateUtility.now(), 7), 7) },
            {text: 'Month to Date', initiationDate: () => dateUtility.startOfMonth(dateUtility.now()), terminationDate: () => dateUtility.now() },
            {text: 'Previous Month', initiationDate: () => dateUtility.startOfMonth(dateUtility.subtractMonths(dateUtility.now(), 1)), terminationDate: () => dateUtility.endOfMonth(dateUtility.subtractMonths(dateUtility.now(), 1)) },
            {text: 'Year to Date', initiationDate: () => dateUtility.startOfYear(dateUtility.now()), terminationDate: () => dateUtility.now() }
        ],
        verticalOffset: 0,
        defaultPrompt: 'Choose a date range...',
        indicatorGlyph: 'ui-icon-triangle-1-s',
        confirmActionLabel: 'Confirm',
        resetActionLabel: 'Erase',
        abortActionLabel: 'Discard',
        intervalDivider: ' -- ',
        displayFormat: 'M d, yy',
        storageFormat: 'yy-mm-dd',
        adjustPositionOnOverlap: true,
        autoConfirmPreset: true,
        dynamicCalendarSizing: true,
        onOpen: null,
        onClose: null,
        onChange: null,
        calendarDisplayOptions: {
            numberOfMonths: 3,
            maxDate: 0
        }
    };

    scope.createDateRangePicker = function(element, options) {
        if (!(element instanceof HTMLElement)) {
            element = document.querySelector(element);
        }
        if (!element) {
            console.error("DateIntervalSelector: Element not found.");
            return null;
        }

        if (element._dateIntervalSelectorInstance) {
            return element._dateIntervalSelectorInstance;
        }

        return new DateIntervalSelector(element, options);
    };

})(window);