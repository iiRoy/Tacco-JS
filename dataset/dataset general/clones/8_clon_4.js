const ChronosUnit = (initialDate) => {
    let internalDate = initialDate instanceof Date ? new Date(initialDate.getTime()) : new Date();

    const createImmutableUnit = (d) => {
        const newD = new Date(d.getTime());
        const unit = {
            year: () => newD.getFullYear(),
            month: () => newD.getMonth(), // 0-11
            day: () => newD.getDate(),
            hour: () => newD.getHours(),
            minute: () => newD.getMinutes(),
            second: () => newD.getSeconds(),
            millisecond: () => newD.getMilliseconds(),
            weekday: () => newD.getDay(), // 0-6 (Sunday-Saturday)
            valueOf: () => newD.getTime(),
            toDate: () => new Date(newD.getTime()),

            modify: (unitType, amount) => {
                const tempDate = new Date(newD.getTime());
                switch (unitType) {
                    case 'year': tempDate.setFullYear(tempDate.getFullYear() + amount); break;
                    case 'month': tempDate.setMonth(tempDate.getMonth() + amount); break;
                    case 'day': tempDate.setDate(tempDate.getDate() + amount); break;
                    case 'hour': tempDate.setHours(tempDate.getHours() + amount); break;
                    case 'minute': tempDate.setMinutes(tempDate.getMinutes() + amount); break;
                }
                return createImmutableUnit(tempDate);
            },
            set: (unitType, value) => {
                const tempDate = new Date(newD.getTime());
                switch (unitType) {
                    case 'year': tempDate.setFullYear(value); break;
                    case 'month': tempDate.setMonth(value); break;
                    case 'day': tempDate.setDate(value); break;
                    case 'hour': tempDate.setHours(value); break;
                    case 'minute': tempDate.setMinutes(value); break;
                }
                return createImmutableUnit(tempDate);
            },

            startOf: (unitType) => {
                const tempDate = new Date(newD.getTime());
                switch (unitType) {
                    case 'day': tempDate.setHours(0, 0, 0, 0); break;
                    case 'month': tempDate.setDate(1); tempDate.setHours(0, 0, 0, 0); break;
                    case 'year': tempDate.setMonth(0, 1); tempDate.setHours(0, 0, 0, 0); break;
                }
                return createImmutableUnit(tempDate);
            },
            endOf: (unitType) => {
                const tempDate = new Date(newD.getTime());
                switch (unitType) {
                    case 'day': tempDate.setHours(23, 59, 59, 999); break;
                    case 'month': tempDate.setMonth(tempDate.getMonth() + 1, 0); tempDate.setHours(23, 59, 59, 999); break;
                    case 'year': tempDate.setFullYear(tempDate.getFullYear() + 1, 0, 0); tempDate.setHours(23, 59, 59, 999); break;
                }
                return createImmutableUnit(tempDate);
            },

            isBefore: (other, unit) => {
                if (!other) return false;
                if (unit === 'day') {
                    return unit.startOf('day').valueOf() < other.startOf('day').valueOf();
                }
                return newD.getTime() < other.valueOf();
            },
            isAfter: (other, unit) => {
                if (!other) return false;
                if (unit === 'day') {
                    return unit.startOf('day').valueOf() > other.startOf('day').valueOf();
                }
                return newD.getTime() > other.valueOf();
            },
            isSame: (other, unit) => {
                if (!other) return false;
                const oD = other.toDate();
                if (unit === 'day') {
                    return newD.getFullYear() === oD.getFullYear() && newD.getMonth() === oD.getMonth() && newD.getDate() === oD.getDate();
                }
                if (unit === 'month') {
                    return newD.getFullYear() === oD.getFullYear() && newD.getMonth() === oD.getMonth();
                }
                if (unit === 'year') {
                    return newD.getFullYear() === oD.getFullYear();
                }
                return newD.getTime() === oD.getTime();
            },
            format: (pattern, localeData) => {
                const h = newD.getHours();
                const m = newD.getMinutes();
                const s = newD.getSeconds();
                const ampm = h >= 12 ? 'PM' : 'AM';
                const h12 = h % 12 || 12;

                const map = {
                    YYYY: newD.getFullYear(),
                    YY: String(newD.getFullYear()).slice(-2),
                    MM: String(newD.getMonth() + 1).padStart(2, '0'),
                    M: newD.getMonth() + 1,
                    MMM: localeData && localeData.monthNamesShort ? localeData.monthNamesShort[newD.getMonth()] : '',
                    DD: String(newD.getDate()).padStart(2, '0'),
                    D: newD.getDate(),
                    HH: String(h).padStart(2, '0'),
                    H: h,
                    hh: String(h12).padStart(2, '0'),
                    h: h12,
                    mm: String(m).padStart(2, '0'),
                    m: m,
                    ss: String(s).padStart(2, '0'),
                    s: s,
                    A: ampm,
                    a: ampm.toLowerCase()
                };
                let formatted = pattern;
                for (const key in map) {
                    formatted = formatted.replace(new RegExp(key, 'g'), map[key]);
                }
                return formatted;
            }
        };
        return unit;
    };

    return createImmutableUnit(internalDate);
};

const parseChronos = (dateString, formatString) => {
    if (!dateString || typeof dateString !== 'string') return null;

    const separators = /[\/\-\s:]+/;
    const dateParts = dateString.split(separators);
    const formatParts = formatString.split(separators);

    let year = null, month = null, day = null, hour = 0, minute = 0;
    let ampm = null;

    for (let i = 0; i < formatParts.length; i++) {
        const formatPart = formatParts[i];
        const datePart = dateParts[i];

        if (!datePart) continue;

        const value = parseInt(datePart, 10);
        if (isNaN(value)) {
            if (formatPart.toLowerCase() === 'a' || formatPart.toLowerCase() === 'A') {
                ampm = datePart.toLowerCase();
            }
            continue;
        }

        switch (formatPart) {
            case 'YYYY': year = value; break;
            case 'YY': year = 2000 + value; break;
            case 'MM': case 'M': month = value - 1; break;
            case 'DD': case 'D': day = value; break;
            case 'HH': case 'H': hour = value; break;
            case 'hh': case 'h': hour = value; break;
            case 'mm': case 'm': minute = value; break;
        }
    }

    if (ampm === 'pm' && hour < 12) hour += 12;
    if (ampm === 'am' && hour === 12) hour = 0;

    if (year === null || month === null || day === null) {
        const d = new Date(dateString);
        if (!isNaN(d.getTime())) {
            return ChronosUnit(d);
        }
        return null;
    }

    return ChronosUnit(new Date(year, month, day, hour, minute, 0, 0));
};

const ensureChronosUnit = (val, format) => {
    if (val === false || val === null || typeof val === 'undefined') return false;
    if (val instanceof Date) return ChronosUnit(val);
    if (typeof val === 'object' && typeof val.toDate === 'function') return val;
    if (typeof val === 'string') return parseChronos(val, format);
    if (typeof val === 'number') return ChronosUnit(new Date(val));
    return ChronosUnit();
};

const mergeDeep = (...objects) => {
    const isObject = (obj) => obj && typeof obj === 'object' && !Array.isArray(obj);
    return objects.reduce((accumulator, current) => {
        Object.keys(current).forEach(key => {
            if (isObject(accumulator[key]) && isObject(current[key])) {
                accumulator[key] = mergeDeep(accumulator[key], current[key]);
            } else {
                accumulator[key] = current[key];
            }
        });
        return accumulator;
    }, {});
};

class TimeSpanSelector {
    constructor(triggerElement, userOptions, completionCallback) {
        this.triggerNode = triggerElement;
        this.startMoment = ChronosUnit().startOf('day');
        this.endMoment = ChronosUnit().startOf('day');
        this.minimumMoment = false;
        this.maximumMoment = false;
        this.spanLimit = false;

        this.showSelectionDropdowns = false;
        this.displayWeekNumbers = false;
        this.timeSelectionEnabled = false;
        this.timeStep = 30;
        this.time12HourFormat = true;
        this.periodOptions = {};
        this.panelPlacement = 'right';

        this.actionButtonClasses = ['btn', 'btn-small'];
        this.confirmButtonClass = 'btn-success';
        this.dismissButtonClass = 'btn-default';

        this.displayFormat = 'MM/DD/YYYY';
        this.rangeSeparator = ' - ';

        this.localSettings = {
            confirmLabel: 'Apply',
            dismissLabel: 'Cancel',
            originLabel: 'From',
            terminusLabel: 'To',
            weekColumnLabel: 'W',
            customRangeText: 'Custom Range',
            dayNamesShort: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"],
            monthNamesShort: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
            firstDayOfWeek: 0
        };

        this.completionAction = () => {};

        this.containerParent = document.body;

        this.leftPanelState = {
            currentMonthUnit: ChronosUnit(),
            gridData: []
        };
        this.rightPanelState = {
            currentMonthUnit: ChronosUnit(),
            gridData: []
        };

        this.boundPanelMouseDown = this.handlePanelMouseDown.bind(this);
        this.boundDocumentMouseDown = this.handleDocumentMouseDown.bind(this);
        this.boundTriggerClick = this.handleTriggerClick.bind(this);
        this.boundNavPrevClick = this.handleNavPrevClick.bind(this);
        this.boundNavNextClick = this.handleNavNextClick.bind(this);
        this.boundConfirmClick = this.handleConfirmClick.bind(this);
        this.boundDismissClick = this.handleDismissClick.bind(this);
        this.boundStartInputClick = this.handleStartInputClick.bind(this);
        this.boundEndInputClick = this.handleEndInputClick.bind(this);
        this.boundDayCellClick = this.handleDayCellClick.bind(this);
        this.boundDayCellEnter = this.handleDayCellEnter.bind(this);
        this.boundDayCellLeave = this.refreshDisplay.bind(this);
        this.boundPeriodOptionClick = this.handlePeriodOptionClick.bind(this);
        this.boundPeriodOptionEnter = this.handlePeriodOptionEnter.bind(this);
        this.boundPeriodOptionLeave = this.refreshDisplay.bind(this);
        this.boundYearSelectChange = this.handleYearSelectChange.bind(this);
        this.boundMonthSelectChange = this.handleMonthSelectChange.bind(this);
        this.boundTimeSelectChange = this.handleTimeSelectChange.bind(this);
        this.boundTriggerKeyUp = this.handleTriggerKeyUp.bind(this);

        const effectiveOptions = userOptions || {};
        this.localSettings = mergeDeep(this.localSettings, effectiveOptions.locale || {});

        if (effectiveOptions.confirmButtonClass) this.confirmButtonClass = effectiveOptions.confirmButtonClass;
        if (effectiveOptions.dismissButtonClass) this.dismissButtonClass = effectiveOptions.dismissButtonClass;

        if (typeof this.localSettings.firstDayOfWeek === 'number') {
            let iterator = this.localSettings.firstDayOfWeek;
            while (iterator > 0) {
                this.localSettings.dayNamesShort.push(this.localSettings.dayNamesShort.shift());
                iterator--;
            }
        }

        if (this.triggerNode.classList.contains('pull-right')) {
            this.panelPlacement = 'left';
        }

        if (this.triggerNode.tagName === 'INPUT') {
            this.triggerNode.addEventListener('click', this.boundTriggerClick);
            this.triggerNode.addEventListener('focus', this.boundTriggerClick);
        } else {
            this.triggerNode.addEventListener('click', this.boundTriggerClick);
        }

        this.panelUnit = document.createElement('div');
        this.panelUnit.className = 'time-span-selector-panel hidden';
        this.panelUnit.innerHTML = `
            <div class="calendar-display left-calendar"></div>
            <div class="calendar-display right-calendar"></div>
            <div class="selection-controls">
                <div class="input-section">
                    <div class="start-input-wrapper">
                        <label for="start_moment_input">${this.localSettings.originLabel}</label>
                        <input type="text" id="start_moment_input" class="date-input" value="" disabled />
                    </div>
                    <div class="end-input-wrapper">
                        <label for="end_moment_input">${this.localSettings.terminusLabel}</label>
                        <input type="text" id="end_moment_input" class="date-input" value="" disabled />
                    </div>
                    <button class="${this.confirmButtonClass} confirm-action-btn" disabled>${this.localSettings.confirmLabel}</button>
                    <button class="${this.dismissButtonClass} dismiss-action-btn">${this.localSettings.dismissLabel}</button>
                </div>
                <div class="period-options-list"></div>
            </div>
        `;
        this.containerParent = (effectiveOptions.containerParent && document.querySelector(effectiveOptions.containerParent)) || document.body;
        this.containerParent.appendChild(this.panelUnit);

        if (typeof effectiveOptions.displayFormat === 'string') this.displayFormat = effectiveOptions.displayFormat;
        if (typeof effectiveOptions.rangeSeparator === 'string') this.rangeSeparator = effectiveOptions.rangeSeparator;

        this.startMoment = ensureChronosUnit(effectiveOptions.startMoment, this.displayFormat) || this.startMoment;
        this.endMoment = ensureChronosUnit(effectiveOptions.endMoment, this.displayFormat) || this.endMoment;
        this.minimumMoment = ensureChronosUnit(effectiveOptions.minimumMoment, this.displayFormat) || this.minimumMoment;
        this.maximumMoment = ensureChronosUnit(effectiveOptions.maximumMoment, this.displayFormat) || this.maximumMoment;

        if (typeof effectiveOptions.periodOptions === 'object') {
            for (const key in effectiveOptions.periodOptions) {
                const rangePair = effectiveOptions.periodOptions[key];
                let start = ensureChronosUnit(rangePair[0]);
                let end = ensureChronosUnit(rangePair[1]);

                if (this.minimumMoment && start.isBefore(this.minimumMoment)) start = this.minimumMoment;
                if (this.maximumMoment && end.isAfter(this.maximumMoment)) end = this.maximumMoment;

                if (!((this.minimumMoment && end.isBefore(this.minimumMoment)) || (this.maximumMoment && start.isAfter(this.maximumMoment)))) {
                    this.periodOptions[key] = [start, end];
                }
            }
            this.renderPeriodOptions();
        }

        if (typeof effectiveOptions.spanLimit === 'object') this.spanLimit = effectiveOptions.spanLimit;

        if (typeof effectiveOptions.panelPlacement === 'string') this.panelPlacement = effectiveOptions.panelPlacement;
        if (typeof effectiveOptions.displayWeekNumbers === 'boolean') this.displayWeekNumbers = effectiveOptions.displayWeekNumbers;
        if (typeof effectiveOptions.actionButtonClasses === 'string') this.actionButtonClasses = [effectiveOptions.actionButtonClasses];
        if (Array.isArray(effectiveOptions.actionButtonClasses)) this.actionButtonClasses = effectiveOptions.actionButtonClasses;
        if (typeof effectiveOptions.showSelectionDropdowns === 'boolean') this.showSelectionDropdowns = effectiveOptions.showSelectionDropdowns;
        if (typeof effectiveOptions.timeSelectionEnabled === 'boolean') this.timeSelectionEnabled = effectiveOptions.timeSelectionEnabled;
        if (typeof effectiveOptions.timeStep === 'number') this.timeStep = effectiveOptions.timeStep;
        if (typeof effectiveOptions.time12HourFormat === 'boolean') this.time12HourFormat = effectiveOptions.time12HourFormat;

        if (!this.timeSelectionEnabled) {
            this.startMoment = this.startMoment.startOf('day');
            this.endMoment = this.endMoment.startOf('day');
        }

        this.panelUnit.querySelectorAll('.confirm-action-btn, .dismiss-action-btn').forEach(btn => {
            this.actionButtonClasses.forEach(cls => btn.classList.add(cls));
        });

        if (this.panelPlacement === 'right') {
            const leftCal = this.panelUnit.querySelector('.calendar-display.left-calendar');
            const rightCal = this.panelUnit.querySelector('.calendar-display.right-calendar');
            if (leftCal && rightCal) {
                this.panelUnit.insertBefore(rightCal, leftCal);
                rightCal.classList.remove('right-calendar');
                rightCal.classList.add('left-calendar');
                leftCal.classList.remove('left-calendar');
                leftCal.classList.add('right-calendar');
            }
        }

        if (!effectiveOptions.periodOptions) {
            this.panelUnit.querySelector('.left-calendar').classList.remove('hidden');
            this.panelUnit.querySelector('.right-calendar').classList.remove('hidden');
            this.repositionPanel();
        } else {
            this.panelUnit.querySelector('.left-calendar').classList.add('hidden');
            this.panelUnit.querySelector('.right-calendar').classList.add('hidden');
        }

        if (typeof completionCallback === 'function') this.completionAction = completionCallback;

        this.panelUnit.classList.add('placement-' + this.panelPlacement);

        if (this.triggerNode.tagName === 'INPUT' && this.triggerNode.type === 'text') {
            const currentVal = this.triggerNode.value;
            const parts = currentVal.split(this.rangeSeparator);
            if (parts.length === 2) {
                const pStart = parseChronos(parts[0], this.displayFormat);
                const pEnd = parseChronos(parts[1], this.displayFormat);
                if (pStart && pEnd) {
                    this.startMoment = pStart;
                    this.endMoment = pEnd;
                }
            }
        }

        this.cachedStart = this.startMoment.toDate();
        this.cachedEnd = this.endMoment.toDate();

        this.leftPanelState.currentMonthUnit = ChronosUnit(this.startMoment.toDate()).startOf('month');
        this.rightPanelState.currentMonthUnit = ChronosUnit(this.endMoment.toDate()).startOf('month');

        this.panelUnit.addEventListener('mousedown', this.boundPanelMouseDown);
        this.panelUnit.querySelector('.left-calendar').addEventListener('click', (e) => this.delegateClick(e, '.prev-month', this.boundNavPrevClick));
        this.panelUnit.querySelector('.right-calendar').addEventListener('click', (e) => this.delegateClick(e, '.prev-month', this.boundNavPrevClick));
        this.panelUnit.querySelector('.left-calendar').addEventListener('click', (e) => this.delegateClick(e, '.next-month', this.boundNavNextClick));
        this.panelUnit.querySelector('.right-calendar').addEventListener('click', (e) => this.delegateClick(e, '.next-month', this.boundNavNextClick));

        this.panelUnit.querySelector('.confirm-action-btn').addEventListener('click', this.boundConfirmClick);
        this.panelUnit.querySelector('.dismiss-action-btn').addEventListener('click', this.boundDismissClick);

        this.panelUnit.querySelector('.start-input-wrapper').addEventListener('click', this.boundStartInputClick);
        this.panelUnit.querySelector('.end-input-wrapper').addEventListener('click', this.boundEndInputClick);

        this.panelUnit.querySelector('.left-calendar').addEventListener('click', (e) => this.delegateClick(e, '.day-cell.available', this.boundDayCellClick));
        this.panelUnit.querySelector('.right-calendar').addEventListener('click', (e) => this.delegateClick(e, '.day-cell.available', this.boundDayCellClick));
        this.panelUnit.querySelector('.left-calendar').addEventListener('mouseenter', (e) => this.delegateEvent(e, '.day-cell.available', this.boundDayCellEnter), true);
        this.panelUnit.querySelector('.right-calendar').addEventListener('mouseenter', (e) => this.delegateEvent(e, '.day-cell.available', this.boundDayCellEnter), true);
        this.panelUnit.querySelector('.left-calendar').addEventListener('mouseleave', (e) => this.delegateEvent(e, '.day-cell.available', this.boundDayCellLeave), true);
        this.panelUnit.querySelector('.right-calendar').addEventListener('mouseleave', (e) => this.delegateEvent(e, '.day-cell.available', this.boundDayCellLeave), true);

        this.panelUnit.querySelector('.period-options-list').addEventListener('click', (e) => this.delegateClick(e, 'li', this.boundPeriodOptionClick));
        this.panelUnit.querySelector('.period-options-list').addEventListener('mouseenter', (e) => this.delegateEvent(e, 'li', this.boundPeriodOptionEnter), true);
        this.panelUnit.querySelector('.period-options-list').addEventListener('mouseleave', (e) => this.delegateEvent(e, 'li', this.boundPeriodOptionLeave), true);

        this.panelUnit.querySelector('.left-calendar').addEventListener('change', (e) => this.delegateChange(e, '.year-select', this.boundYearSelectChange));
        this.panelUnit.querySelector('.left-calendar').addEventListener('change', (e) => this.delegateChange(e, '.month-select', this.boundMonthSelectChange));
        this.panelUnit.querySelector('.right-calendar').addEventListener('change', (e) => this.delegateChange(e, '.year-select', this.boundYearSelectChange));
        this.panelUnit.querySelector('.right-calendar').addEventListener('change', (e) => this.delegateChange(e, '.month-select', this.boundMonthSelectChange));

        this.panelUnit.querySelector('.left-calendar').addEventListener('change', (e) => this.delegateChange(e, '.hour-select, .minute-select, .ampm-select', this.boundTimeSelectChange));
        this.panelUnit.querySelector('.right-calendar').addEventListener('change', (e) => this.delegateChange(e, '.hour-select, .minute-select, .ampm-select', this.boundTimeSelectChange));

        this.triggerNode.addEventListener('keyup', this.boundTriggerKeyUp);

        this.refreshDisplay();
        this.updateCalendarGrids();
    }

    delegateClick(event, selector, handler) {
        const target = event.target.closest(selector);
        if (target && this.panelUnit.contains(target)) {
            handler.call(this, event, target);
        }
    }

    delegateEvent(event, selector, handler) {
        const target = event.target.closest(selector);
        if (target && this.panelUnit.contains(target)) {
            handler.call(this, event, target);
        } else if (event.type === 'mouseleave' && event.relatedTarget && !this.panelUnit.contains(event.relatedTarget)) {
            handler.call(this, event, null);
        }
    }

    delegateChange(event, selector, handler) {
        const target = event.target.closest(selector);
        if (target && this.panelUnit.contains(target)) {
            handler.call(this, event, target);
        }
    }

    refreshDisplay() {
        this.panelUnit.querySelector('#start_moment_input').value = this.startMoment.format(this.displayFormat, this.localSettings);
        this.panelUnit.querySelector('#end_moment_input').value = this.endMoment.format(this.displayFormat, this.localSettings);

        const confirmBtn = this.panelUnit.querySelector('.confirm-action-btn');
        if (this.startMoment.isSame(this.endMoment, 'day') || this.startMoment.isBefore(this.endMoment, 'day')) {
            confirmBtn.removeAttribute('disabled');
        } else {
            confirmBtn.setAttribute('disabled', 'disabled');
        }
    }

    updateFromTriggerControl() {
        if (this.triggerNode.tagName !== 'INPUT') return;
        if (!this.triggerNode.value.length) return;

        const valParts = this.triggerNode.value.split(this.rangeSeparator);
        let updatedStart, updatedEnd;

        if (valParts.length === 2) {
            updatedStart = parseChronos(valParts[0], this.displayFormat);
            updatedEnd = parseChronos(valParts[1], this.displayFormat);
        }

        if (!updatedStart || !updatedEnd) return;
        if (updatedEnd.isBefore(updatedStart, 'day')) return;

        this.startMoment = updatedStart;
        this.endMoment = updatedEnd;

        this.triggerCompletion();
        this.updateCalendarGrids();
    }

    triggerCompletion() {
        this.refreshDisplay();
        this.completionAction(this.startMoment, this.endMoment);
        this.triggerNode.dispatchEvent(new CustomEvent('timespan:selected', { detail: { start: this.startMoment, end: this.endMoment, selector: this } }));
    }

    repositionPanel() {
        const triggerRect = this.triggerNode.getBoundingClientRect();
        const parentRect = this.containerParent.getBoundingClientRect();
        this.panelUnit.style.visibility = 'hidden'; // Hide temporarily for accurate measurement
        this.panelUnit.classList.remove('hidden'); // Ensure it's rendered for measurement
        const panelRect = this.panelUnit.getBoundingClientRect();
        this.panelUnit.style.visibility = ''; // Restore visibility

        let top = triggerRect.top + triggerRect.height - parentRect.top;
        let left = triggerRect.left - parentRect.left;
        let right = 'auto';

        if (this.panelPlacement === 'left') {
            right = window.innerWidth - triggerRect.right - (parentRect.left - window.scrollX);
            left = 'auto';
            this.panelUnit.style.right = `${right}px`;
            this.panelUnit.style.left = 'auto';
            if (triggerRect.left - panelRect.width < 0) {
                this.panelUnit.style.left = '9px';
                this.panelUnit.style.right = 'auto';
            }
        } else {
            this.panelUnit.style.left = `${left}px`;
            this.panelUnit.style.right = 'auto';
            if (triggerRect.left + panelRect.width > window.innerWidth) {
                this.panelUnit.style.left = 'auto';
                this.panelUnit.style.right = '0px';
            }
        }
        this.panelUnit.style.top = `${top}px`;
    }

    displayPanel(event) {
        this.panelUnit.classList.remove('hidden');
        this.repositionPanel();

        if (event) {
            event.stopPropagation();
            event.preventDefault();
        }

        document.addEventListener('mousedown', this.boundDocumentMouseDown);
        this.triggerNode.dispatchEvent(new CustomEvent('timespan:show', { detail: { target: event ? event.target : this.triggerNode, selector: this } }));
    }

    concealPanel() {
        this.panelUnit.classList.add('hidden');

        const newStart = this.startMoment;
        const newEnd = this.endMoment;

        if (!ChronosUnit(this.cachedStart).isSame(newStart) || !ChronosUnit(this.cachedEnd).isSame(newEnd)) {
            this.triggerCompletion();
        }

        this.cachedStart = newStart.toDate();
        this.cachedEnd = newEnd.toDate();

        document.removeEventListener('mousedown', this.boundDocumentMouseDown);
        this.triggerNode.dispatchEvent(new CustomEvent('timespan:hide', { detail: { selector: this } }));
    }

    handlePanelMouseDown(e) {
        e.stopPropagation();
    }

    handleDocumentMouseDown(e) {
        if (!this.panelUnit.contains(e.target) && !this.triggerNode.contains(e.target)) {
            this.concealPanel();
        }
    }

    handleTriggerClick(e) {
        this.displayPanel(e);
    }

    renderPeriodOptions() {
        const listContainer = this.panelUnit.querySelector('.period-options-list');
        listContainer.innerHTML = '';
        const ul = document.createElement('ul');
        for (const rangeName in this.periodOptions) {
            const li = document.createElement('li');
            li.textContent = rangeName;
            li.dataset.rangeName = rangeName;
            ul.appendChild(li);
        }
        const customRangeLi = document.createElement('li');
        customRangeLi.textContent = this.localSettings.customRangeText;
        customRangeLi.dataset.rangeName = 'custom';
        ul.appendChild(customRangeLi);
        listContainer.appendChild(ul);
    }

    handlePeriodOptionEnter(e, target) {
        const rangeLabel = target.dataset.rangeName;
        if (rangeLabel === 'custom') {
            this.refreshDisplay();
        } else {
            const dates = this.periodOptions[rangeLabel];
            this.panelUnit.querySelector('#start_moment_input').value = dates[0].format(this.displayFormat, this.localSettings);
            this.panelUnit.querySelector('#end_moment_input').value = dates[1].format(this.displayFormat, this.localSettings);
        }
    }

    showCalendarPanels() {
        this.panelUnit.querySelector('.left-calendar').classList.remove('hidden');
        this.panelUnit.querySelector('.right-calendar').classList.remove('hidden');
        this.repositionPanel();
    }

    updateTriggerInputText() {
        if (this.triggerNode.tagName === 'INPUT') {
            this.triggerNode.value = this.startMoment.format(this.displayFormat, this.localSettings) + this.rangeSeparator + this.endMoment.format(this.displayFormat, this.localSettings);
        }
    }

    handlePeriodOptionClick(e, target) {
        const rangeLabel = target.dataset.rangeName;
        if (rangeLabel === 'custom') {
            this.showCalendarPanels();
        } else {
            const dates = this.periodOptions[rangeLabel];
            this.startMoment = dates[0];
            this.endMoment = dates[1];

            if (!this.timeSelectionEnabled) {
                this.startMoment = this.startMoment.startOf('day');
                this.endMoment = this.endMoment.startOf('day');
            }

            this.leftPanelState.currentMonthUnit = ChronosUnit(this.startMoment.toDate()).startOf('month');
            this.rightPanelState.currentMonthUnit = ChronosUnit(this.endMoment.toDate()).startOf('month');
            this.updateCalendarGrids();

            this.updateTriggerInputText();

            this.panelUnit.querySelector('.left-calendar').classList.add('hidden');
            this.panelUnit.querySelector('.right-calendar').classList.add('hidden');
            this.concealPanel();
        }
    }

    handleNavPrevClick(e, target) {
        const calendarSide = target.closest('.calendar-display').classList.contains('left-calendar') ? 'left' : 'right';
        if (calendarSide === 'left') {
            this.leftPanelState.currentMonthUnit = this.leftPanelState.currentMonthUnit.modify('month', -1);
        } else {
            this.rightPanelState.currentMonthUnit = this.rightPanelState.currentMonthUnit.modify('month', -1);
        }
        this.updateCalendarGrids();
    }

    handleNavNextClick(e, target) {
        const calendarSide = target.closest('.calendar-display').classList.contains('left-calendar') ? 'left' : 'right';
        if (calendarSide === 'left') {
            this.leftPanelState.currentMonthUnit = this.leftPanelState.currentMonthUnit.modify('month', 1);
        } else {
            this.rightPanelState.currentMonthUnit = this.rightPanelState.currentMonthUnit.modify('month', 1);
        }
        this.updateCalendarGrids();
    }

    handleDayCellEnter(e, target) {
        const cellDate = ChronosUnit(new Date(parseInt(target.dataset.dateValue, 10)));
        const calendarSide = target.closest('.calendar-display').classList.contains('left-calendar') ? 'left' : 'right';

        if (calendarSide === 'left') {
            this.panelUnit.querySelector('#start_moment_input').value = cellDate.format(this.displayFormat, this.localSettings);
        } else {
            this.panelUnit.querySelector('#end_moment_input').value = cellDate.format(this.displayFormat, this.localSettings);
        }
    }

    handleStartInputClick() {
        this.showCalendarPanels();
    }

    handleEndInputClick() {
        this.showCalendarPanels();
    }

    handleDayCellClick(e, target) {
        const clickedDate = ChronosUnit(new Date(parseInt(target.dataset.dateValue, 10)));

        let newStart = clickedDate;
        let newEnd = clickedDate;

        if (this.timeSelectionEnabled) {
            newStart = clickedDate.set('hour', this.startMoment.hour()).set('minute', this.startMoment.minute());
            newEnd = clickedDate.set('hour', this.endMoment.hour()).set('minute', this.endMoment.minute());
        } else {
            newStart = clickedDate.startOf('day');
            newEnd = clickedDate.startOf('day');
        }

        if (this.startMoment.isSame(this.endMoment) || clickedDate.isBefore(this.startMoment)) {
            this.startMoment = newStart;
            this.endMoment = newEnd;
        } else if (clickedDate.isAfter(this.endMoment)) {
            this.endMoment = newEnd;
        } else {
            const diffFromStart = Math.abs(clickedDate.valueOf() - this.startMoment.valueOf());
            const diffFromEnd = Math.abs(clickedDate.valueOf() - this.endMoment.valueOf());

            if (diffFromStart <= diffFromEnd) {
                this.startMoment = newStart;
            } else {
                this.endMoment = newEnd;
            }
        }

        if (this.spanLimit) {
            const diffDays = Math.floor(Math.abs(this.endMoment.valueOf() - this.startMoment.valueOf()) / (1000 * 60 * 60 * 24));
            if (diffDays > this.spanLimit.days) {
                if (this.startMoment.isSame(clickedDate, 'day')) {
                    this.endMoment = this.startMoment.modify('day', this.spanLimit.days);
                } else {
                    this.startMoment = this.endMoment.modify('day', -this.spanLimit.days);
                }
            }
        }

        this.updateCalendarGrids();
    }

    handleConfirmClick() {
        this.updateTriggerInputText();
        this.concealPanel();
    }

    handleDismissClick() {
        this.startMoment = ChronosUnit(this.cachedStart);
        this.endMoment = ChronosUnit(this.cachedEnd);
        this.updateCalendarGrids();
        this.concealPanel();
    }

    handleYearSelectChange(e, target) {
        const newYear = parseInt(target.value, 10);
        const calendarSide = target.closest('.calendar-display').classList.contains('left-calendar') ? 'left' : 'right';

        if (calendarSide === 'left') {
            this.leftPanelState.currentMonthUnit = this.leftPanelState.currentMonthUnit.set('year', newYear);
        } else {
            this.rightPanelState.currentMonthUnit = this.rightPanelState.currentMonthUnit.set('year', newYear);
        }
        this.updateCalendarGrids();
    }

    handleMonthSelectChange(e, target) {
        const newMonth = parseInt(target.value, 10);
        const calendarSide = target.closest('.calendar-display').classList.contains('left-calendar') ? 'left' : 'right';

        if (calendarSide === 'left') {
            this.leftPanelState.currentMonthUnit = this.leftPanelState.currentMonthUnit.set('month', newMonth);
        } else {
            this.rightPanelState.currentMonthUnit = this.rightPanelState.currentMonthUnit.set('month', newMonth);
        }
        this.updateCalendarGrids();
    }

    handleTimeSelectChange(e, target) {
        const calendarSide = target.closest('.calendar-display').classList.contains('left-calendar') ? 'left' : 'right';
        let currentMoment = calendarSide === 'left' ? this.startMoment : this.endMoment;

        let newHour = currentMoment.hour();
        let newMinute = currentMoment.minute();

        const hourSelect = target.closest('.time-controls').querySelector('.hour-select');
        const minuteSelect = target.closest('.time-controls').querySelector('.minute-select');
        const ampmSelect = target.closest('.time-controls').querySelector('.ampm-select');

        if (hourSelect) newHour = parseInt(hourSelect.value, 10);
        if (minuteSelect) newMinute = parseInt(minuteSelect.value, 10);
        if (ampmSelect && this.time12HourFormat) {
            const ampm = ampmSelect.value;
            if (ampm === 'PM' && newHour < 12) newHour += 12;
            if (ampm === 'AM' && newHour === 12) newHour = 0;
        }

        currentMoment = currentMoment.set('hour', newHour).set('minute', newMinute);

        if (calendarSide === 'left') {
            this.startMoment = currentMoment;
        } else {
            this.endMoment = currentMoment;
        }
        this.updateCalendarGrids();
    }

    handleTriggerKeyUp() {
        this.updateFromTriggerControl();
    }

    updateCalendarGrids() {
        if (this.leftPanelState.currentMonthUnit.isSame(this.rightPanelState.currentMonthUnit, 'month')) {
            this.rightPanelState.currentMonthUnit = this.rightPanelState.currentMonthUnit.modify('month', 1);
        }

        this.leftPanelState.gridData = this.generateCalendarGrid(this.leftPanelState.currentMonthUnit);
        this.rightPanelState.gridData = this.generateCalendarGrid(this.rightPanelState.currentMonthUnit);

        this.renderCalendar(this.panelUnit.querySelector('.left-calendar'), this.leftPanelState);
        this.renderCalendar(this.panelUnit.querySelector('.right-calendar'), this.rightPanelState);

        this.refreshDisplay();
    }

    generateCalendarGrid(monthUnit) {
        const calendar = [];
        const startOfMonth = monthUnit.startOf('month');

        let firstDay = startOfMonth.weekday();
        const firstDayAdjusted = (firstDay - this.localSettings.firstDayOfWeek + 7) % 7;

        let currentDay = startOfMonth.modify('day', -firstDayAdjusted);

        for (let week = 0; week < 6; week++) {
            const weekDays = [];
            for (let day = 0; day < 7; day++) {
                weekDays.push(currentDay);
                currentDay = currentDay.modify('day', 1);
            }
            calendar.push(weekDays);
        }
        return calendar;
    }

    renderCalendar(targetElement, panelState) {
        const currentMonthUnit = panelState.currentMonthUnit;
        const gridData = panelState.gridData;
        const isLeftCalendar = targetElement.classList.contains('left-calendar');

        let calendarHTML = `
            <div class="calendar-header">
                <div class="prev-month">&lsaquo;</div>
                <div class="month-year-selects">
                    ${this.showSelectionDropdowns ? this.renderMonthDropdown(currentMonthUnit.month()) : `<span class="month-label">${this.localSettings.monthNamesShort[currentMonthUnit.month()]}</span>`}
                    ${this.showSelectionDropdowns ? this.renderYearDropdown(currentMonthUnit.year()) : `<span class="year-label">${currentMonthUnit.year()}</span>`}
                </div>
                <div class="next-month">&rsaquo;</div>
            </div>
            <table>
                <thead>
                    <tr>
                        ${this.displayWeekNumbers ? `<th>${this.localSettings.weekColumnLabel}</th>` : ''}
                        ${this.localSettings.dayNamesShort.map(day => `<th>${day}</th>`).join('')}
                    </tr>
                </thead>
                <tbody>
        `;

        gridData.forEach(week => {
            calendarHTML += '<tr>';
            if (this.displayWeekNumbers) {
                const firstDayOfWeek = week[0];
                const weekNum = Math.ceil((firstDayOfWeek.day() + (firstDayOfWeek.weekday() - this.localSettings.firstDayOfWeek + 7) % 7) / 7) + 1;
                calendarHTML += `<td class="week-number">${weekNum}</td>`;
            }
            week.forEach(dayUnit => {
                let classes = ['day-cell'];
                const isCurrentMonth = dayUnit.isSame(currentMonthUnit, 'month');
                const isDisabled =
                    (this.minimumMoment && dayUnit.isBefore(this.minimumMoment, 'day')) ||
                    (this.maximumMoment && dayUnit.isAfter(this.maximumMoment, 'day'));

                if (!isCurrentMonth) classes.push('off-month');
                if (isDisabled) classes.push('disabled');
                else classes.push('available');

                if (dayUnit.isSame(this.startMoment, 'day')) classes.push('start-date');
                if (dayUnit.isSame(this.endMoment, 'day')) classes.push('end-date');
                if (dayUnit.isAfter(this.startMoment, 'day') && dayUnit.isBefore(this.endMoment, 'day')) classes.push('in-range');

                calendarHTML += `<td class="${classes.join(' ')}" data-date-value="${dayUnit.valueOf()}">${dayUnit.day()}</td>`;
            });
            calendarHTML += '</tr>';
        });

        calendarHTML += `
                </tbody>
            </table>
        `;

        if (this.timeSelectionEnabled) {
            const targetMoment = isLeftCalendar ? this.startMoment : this.endMoment;
            calendarHTML += this.renderTimeControls(targetMoment);
        }

        targetElement.innerHTML = calendarHTML;
    }

    renderMonthDropdown(selectedMonth) {
        let options = '';
        for (let i = 0; i < 12; i++) {
            options += `<option value="${i}" ${i === selectedMonth ? 'selected' : ''}>${this.localSettings.monthNamesShort[i]}</option>`;
        }
        return `<select class="month-select">${options}</select>`;
    }

    renderYearDropdown(selectedYear) {
        const currentYear = ChronosUnit().year();
        let options = '';
        for (let i = currentYear - 5; i <= currentYear + 5; i++) {
            options += `<option value="${i}" ${i === selectedYear ? 'selected' : ''}>${i}</option>`;
        }
        return `<select class="year-select">${options}</select>`;
    }

    renderTimeControls(targetMoment) {
        let hourOptions = '';
        let minuteOptions = '';
        const currentHour = targetMoment.hour();
        const currentMinute = targetMoment.minute();

        for (let h = 0; h < 24; h++) {
            const displayHour = this.time12HourFormat ? (h % 12 || 12) : h;
            const formattedHour = String(displayHour).padStart(2, '0');
            const selected = (this.time12HourFormat ? (h % 12 || 12) : h) === (this.time12HourFormat ? (currentHour % 12 || 12) : currentHour);
            hourOptions += `<option value="${h}" ${selected ? 'selected' : ''}>${formattedHour}</option>`;
        }

        for (let m = 0; m < 60; m += this.timeStep) {
            const formattedMinute = String(m).padStart(2, '0');
            minuteOptions += `<option value="${m}" ${m === currentMinute ? 'selected' : ''}>${formattedMinute}</option>`;
        }

        const ampmSelect = this.time12HourFormat ? `
            <select class="ampm-select">
                <option value="AM" ${currentHour < 12 ? 'selected' : ''}>AM</option>
                <option value="PM" ${currentHour >= 12 ? 'selected' : ''}>PM</option>
            </select>
        ` : '';

        return `
            <div class="time-controls">
                <select class="hour-select">${hourOptions}</select> :
                <select class="minute-select">${minuteOptions}</select>
                ${ampmSelect}
            </div>
        `;
    }
}

window.createTimeSpanSelector = (targetElement, options, callback) => {
    return new TimeSpanSelector(targetElement, options, callback);
};