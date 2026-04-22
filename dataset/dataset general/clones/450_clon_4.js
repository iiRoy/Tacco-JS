(function () {
    const selectorInstances = new Map();
    let currentVisibleSelector = null;
    let selectorIdCounter = 0;

    const standardConfig = {
        labelHour: 'Hour',
        labelMinute: 'Minute',
        labelAmPm: ['AM', 'PM'],
        buttonConfirm: 'Done',
        buttonNow: 'Now',
        buttonClear: 'Deselect',

        activationEvent: 'focus', // 'focus', 'button'
        triggerElement: null,
        displayAnimation: 'fade', // 'fade', 'slide', 'none'
        animationSettings: {},
        postInputText: '',

        beforeShowCallback: null,
        onTimeSelectedCallback: null,
        onCloseCallback: null,

        timeSeparatorChar: ':',
        periodSeparatorChar: ' ',
        showPeriodIdentifier: false,
        displayPeriodLabels: true,
        zeroPadHours: true,
        zeroPadMinutes: true,
        alternativeInputTarget: '',
        defaultTimeValue: 'now', // 'now', ''

        positionMy: 'left top',
        positionAt: 'left bottom',

        hourEnabledPredicate: null, // function(hour) { return true; }
        minuteEnabledPredicate: null, // function(hour,minute) { return true; }

        hourStart: 0,
        hourEnd: 23,
        minuteStart: 0,
        minuteEnd: 55,
        minuteStep: 5,

        displayGridRows: 4,

        displayHourPanel: true,
        displayMinutePanel: true,
        allowPartialMinuteInput: false,
        
        showDoneButton: false,
        showNowButton: false,
        showClearButton: false
    };

    const mainPanelClassPrefix = 'time-select-panel-';
    const inlinePanelClass = 'time-select-inline';
    const highlightCellClass = 'time-select-active';
    const hoverHighlightClass = 'time-select-hover';
    const disabledHostClass = 'time-select-disabled-host';

    class TimeSelector {
        constructor(domHost, customSettings, isInlineDisplay) {
            this.hostElement = domHost;
            this.isInline = isInlineDisplay;
            this.config = { ...standardConfig, ...customSettings };

            this.instanceIdentifier = mainPanelClassPrefix + (selectorIdCounter++);
            this.timePanel = this.createPanelElement(this.isInline);

            this.chosenHour = null;
            this.chosenMinute = null;

            this.bindCoreEvents();
            this.extractInitialTime();
            this.updatePanelDisplay();
        }

        createPanelElement(inline) {
            const panel = document.createElement('div');
            panel.id = this.instanceIdentifier;
            panel.className = `time-select-container ${inline ? inlinePanelClass : ''}`;
            panel.style.display = 'none';
            return panel;
        }

        extractInitialTime() {
            let initialString = this.hostElement.value;
            if (!initialString && this.config.defaultTimeValue === 'now') {
                const moment = new Date();
                this.chosenHour = moment.getHours();
                this.chosenMinute = moment.getMinutes();
            } else if (initialString) {
                const parts = initialString.split(this.config.timeSeparatorChar);
                if (parts.length >= 2) {
                    let hourVal = parseInt(parts[0], 10);
                    let minuteVal = parseInt(parts[1], 10);
                    
                    if (this.config.showPeriodIdentifier && parts.length > 2) {
                        const periodLabel = parts[2].trim().toUpperCase();
                        if (periodLabel === this.config.labelAmPm[1] && hourVal < 12) {
                            hourVal += 12;
                        } else if (periodLabel === this.config.labelAmPm[0] && hourVal === 12) {
                            hourVal = 0;
                        }
                    }
                    this.chosenHour = hourVal;
                    this.chosenMinute = minuteVal;
                }
            }
        }

        composeTimeString(hour, minute, includePeriod = false) {
            let h = hour;
            let m = minute;

            if (this.config.showPeriodIdentifier) {
                if (h === 0) h = 12;
                else if (h > 12) h -= 12;
            }

            const formattedH = this.config.zeroPadHours && h < 10 ? '0' + h : '' + h;
            const formattedM = this.config.zeroPadMinutes && m < 10 ? '0' + m : '' + m;

            let outputString = formattedH + this.config.timeSeparatorChar + formattedM;

            if (includePeriod && this.config.showPeriodIdentifier) {
                const period = hour < 12 ? this.config.labelAmPm[0] : this.config.labelAmPm[1];
                outputString += this.config.periodSeparatorChar + period;
            }
            return outputString;
        }

        syncInputHost() {
            if (this.chosenHour !== null && this.chosenMinute !== null) {
                const formattedTime = this.composeTimeString(this.chosenHour, this.chosenMinute, this.config.showPeriodIdentifier);
                this.hostElement.value = formattedTime;
                if (this.config.alternativeInputTarget) {
                    const altElement = document.querySelector(this.config.alternativeInputTarget);
                    if (altElement) altElement.value = formattedTime;
                }
            } else {
                this.hostElement.value = '';
                if (this.config.alternativeInputTarget) {
                    const altElement = document.querySelector(this.config.alternativeInputTarget);
                    if (altElement) altElement.value = '';
                }
            }
        }

        updatePanelDisplay() {
            this.timePanel.innerHTML = this.renderHtmlContent();
            this.attachPanelEvents();
            if (this.isInline) {
                this.timePanel.style.display = '';
            }
        }

        renderHtmlContent() {
            let contentParts = [];
            contentParts.push('<div class="time-select-main-body">');

            if (this.config.displayHourPanel) {
                contentParts.push(this.renderHourSection());
            }
            if (this.config.displayMinutePanel) {
                contentParts.push(this.renderMinuteSection());
            }

            contentParts.push('</div>');

            contentParts.push(this.renderButtonSection());

            return contentParts.join('');
        }

        renderHourSection() {
            let hourMarkup = `<div class="time-select-hours-segment">`;
            hourMarkup += `<div class="time-select-section-label">${this.config.labelHour}</div>`;
            hourMarkup += `<div class="time-select-grid-layout">`;

            const totalHourCount = this.config.hourEnd - this.config.hourStart + 1;
            const hoursPerLine = Math.ceil(totalHourCount / this.config.displayGridRows);

            let availableHours = [];
            for (let h = this.config.hourStart; h <= this.config.hourEnd; h++) {
                if (!this.config.hourEnabledPredicate || this.config.hourEnabledPredicate(h)) {
                    availableHours.push(h);
                }
            }

            for (let i = 0; i < this.config.displayGridRows; i++) {
                hourMarkup += `<div class="time-select-grid-row">`;
                for (let j = 0; j < hoursPerLine; j++) {
                    const hourIndex = i * hoursPerLine + j;
                    const currentHour = availableHours[hourIndex];
                    if (currentHour !== undefined) {
                        let displayValue = currentHour;
                        if (this.config.showPeriodIdentifier && currentHour === 0) displayValue = 12;
                        else if (this.config.showPeriodIdentifier && currentHour > 12) displayValue -= 12;

                        const displayFormatted = this.config.zeroPadHours && displayValue < 10 ? '0' + displayValue : '' + displayValue;
                        const isCurrentlyActive = (this.chosenHour !== null && this.chosenHour === currentHour) ? highlightCellClass : '';
                        hourMarkup += `<div class="time-select-cell time-select-hour-cell ${isCurrentlyActive}" data-hour-val="${currentHour}">${displayFormatted}</div>`;
                    } else {
                        hourMarkup += `<div class="time-select-cell time-select-empty-cell"></div>`;
                    }
                }
                hourMarkup += `</div>`;
            }

            if (this.config.displayPeriodLabels && this.config.showPeriodIdentifier) {
                hourMarkup += `<div class="time-select-grid-row">`;
                hourMarkup += `<div class="time-select-cell time-select-period-cell" data-period-val="AM">${this.config.labelAmPm[0]}</div>`;
                hourMarkup += `<div class="time-select-cell time-select-period-cell" data-period-val="PM">${this.config.labelAmPm[1]}</div>`;
                hourMarkup += `</div>`;
            }

            hourMarkup += `</div>`;
            hourMarkup += `</div>`;
            return hourMarkup;
        }

        renderMinuteSection() {
            let minuteMarkup = `<div class="time-select-minutes-segment">`;
            minuteMarkup += `<div class="time-select-section-label">${this.config.labelMinute}</div>`;
            minuteMarkup += `<div class="time-select-grid-layout">`;

            const totalMinuteCount = Math.floor((this.config.minuteEnd - this.config.minuteStart) / this.config.minuteStep) + 1;
            const minutesPerLine = Math.ceil(totalMinuteCount / this.config.displayGridRows);

            let availableMinutes = [];
            for (let m = this.config.minuteStart; m <= this.config.minuteEnd; m += this.config.minuteStep) {
                if (!this.config.minuteEnabledPredicate || this.config.minuteEnabledPredicate(this.chosenHour, m)) {
                    availableMinutes.push(m);
                }
            }

            for (let i = 0; i < this.config.displayGridRows; i++) {
                minuteMarkup += `<div class="time-select-grid-row">`;
                for (let j = 0; j < minutesPerLine; j++) {
                    const minuteIndex = i * minutesPerLine + j;
                    const currentMinute = availableMinutes[minuteIndex];
                    if (currentMinute !== undefined) {
                        const displayFormatted = this.config.zeroPadMinutes && currentMinute < 10 ? '0' + currentMinute : '' + currentMinute;
                        const isCurrentlyActive = (this.chosenMinute !== null && this.chosenMinute === currentMinute) ? highlightCellClass : '';
                        minuteMarkup += `<div class="time-select-cell time-select-minute-cell ${isCurrentlyActive}" data-minute-val="${currentMinute}">${displayFormatted}</div>`;
                    } else {
                        minuteMarkup += `<div class="time-select-cell time-select-empty-cell"></div>`;
                    }
                }
                minuteMarkup += `</div>`;
            }

            minuteMarkup += `</div>`;
            minuteMarkup += `</div>`;
            return minuteMarkup;
        }

        renderButtonSection() {
            let buttonMarkup = `<div class="time-select-control-buttons">`;
            if (this.config.showNowButton) {
                buttonMarkup += `<button type="button" class="time-select-action-button time-select-now-btn" data-action-type="set-now">${this.config.buttonNow}</button>`;
            }
            if (this.config.showClearButton) {
                buttonMarkup += `<button type="button" class="time-select-action-button time-select-clear-btn" data-action-type="clear-selection">${this.config.buttonClear}</button>`;
            }
            if (this.config.showDoneButton) {
                buttonMarkup += `<button type="button" class="time-select-action-button time-select-done-btn" data-action-type="finalize">${this.config.buttonConfirm}</button>`;
            }
            buttonMarkup += `</div>`;
            return buttonMarkup;
        }

        attachPanelEvents() {
            this.timePanel.querySelectorAll('.time-select-hour-cell').forEach(cell => {
                cell.addEventListener('click', this.handleHourCellClick.bind(this));
                cell.addEventListener('dblclick', this.handleHourCellClick.bind(this));
                cell.addEventListener('mouseover', this.handleCellHover.bind(this));
                cell.addEventListener('mouseout', this.handleCellOut.bind(this));
            });
            this.timePanel.querySelectorAll('.time-select-minute-cell').forEach(cell => {
                cell.addEventListener('click', this.handleMinuteCellClick.bind(this));
                cell.addEventListener('dblclick', this.handleMinuteCellClick.bind(this));
                cell.addEventListener('mouseover', this.handleCellHover.bind(this));
                cell.addEventListener('mouseout', this.handleCellOut.bind(this));
            });
            this.timePanel.querySelectorAll('.time-select-period-cell').forEach(cell => {
                cell.addEventListener('click', this.handlePeriodCellClick.bind(this));
                cell.addEventListener('mouseover', this.handleCellHover.bind(this));
                cell.addEventListener('mouseout', this.handleCellOut.bind(this));
            });
            this.timePanel.querySelectorAll('.time-select-action-button').forEach(button => {
                button.addEventListener('click', this.handleButtonClick.bind(this));
            });
        }

        handleCellHover(event) {
            event.target.classList.add(hoverHighlightClass);
        }

        handleCellOut(event) {
            event.target.classList.remove(hoverHighlightClass);
        }

        handleHourCellClick(event) {
            const selectedHour = parseInt(event.target.dataset.hourVal, 10);
            if (!isNaN(selectedHour)) {
                this.chosenHour = selectedHour;
                this.updatePanelDisplay();
                this.syncInputHost();
                if (this.config.onTimeSelectedCallback) {
                    this.config.onTimeSelectedCallback.call(this.hostElement, this.composeTimeString(this.chosenHour, this.chosenMinute, this.config.showPeriodIdentifier), this);
                }
                if (event.type === 'dblclick') {
                    this.conceal();
                }
            }
        }

        handleMinuteCellClick(event) {
            const selectedMinute = parseInt(event.target.dataset.minuteVal, 10);
            if (!isNaN(selectedMinute)) {
                this.chosenMinute = selectedMinute;
                this.updatePanelDisplay();
                this.syncInputHost();
                if (this.config.onTimeSelectedCallback) {
                    this.config.onTimeSelectedCallback.call(this.hostElement, this.composeTimeString(this.chosenHour, this.chosenMinute, this.config.showPeriodIdentifier), this);
                }
                if (event.type === 'dblclick') {
                    this.conceal();
                }
            }
        }

        handlePeriodCellClick(event) {
            const selectedPeriod = event.target.dataset.periodVal;
            if (this.chosenHour !== null && selectedPeriod) {
                if (selectedPeriod === 'AM' && this.chosenHour >= 12) {
                    this.chosenHour -= 12;
                } else if (selectedPeriod === 'PM' && this.chosenHour < 12) {
                    this.chosenHour += 12;
                }
                this.updatePanelDisplay();
                this.syncInputHost();
            }
        }

        handleButtonClick(event) {
            const action = event.target.dataset.actionType;
            const nowTime = new Date();
            switch (action) {
                case 'set-now':
                    this.chosenHour = nowTime.getHours();
                    this.chosenMinute = nowTime.getMinutes();
                    this.syncInputHost();
                    this.updatePanelDisplay();
                    break;
                case 'clear-selection':
                    this.chosenHour = null;
                    this.chosenMinute = null;
                    this.syncInputHost();
                    this.updatePanelDisplay();
                    break;
                case 'finalize':
                    this.conceal();
                    break;
            }
        }

        bindCoreEvents() {
            if (this.isInline) {
                this.hostElement.appendChild(this.timePanel);
            } else {
                document.body.appendChild(this.timePanel);
                if (this.config.activationEvent === 'focus') {
                    this.hostElement.addEventListener('focus', this.reveal.bind(this));
                    this.hostElement.addEventListener('click', this.reveal.bind(this));
                }
                if (this.config.activationEvent === 'button' && this.config.triggerElement) {
                    const btn = document.querySelector(this.config.triggerElement);
                    if (btn) btn.addEventListener('click', this.toggleVisibility.bind(this));
                }
                document.addEventListener('mousedown', this.handleGlobalClick.bind(this));
                this.hostElement.addEventListener('keydown', this.handleHostKeydown.bind(this));
            }
        }

        handleHostKeydown(event) {
            if (this.timePanel.style.display === 'block') {
                switch (event.key) {
                    case 'Tab':
                    case 'Escape':
                        this.conceal();
                        break;
                    case 'Enter':
                        this.syncInputHost();
                        this.conceal();
                        event.preventDefault();
                        break;
                }
            }
        }

        handleGlobalClick(event) {
            if (currentVisibleSelector && currentVisibleSelector !== this) return;
            if (this.timePanel.style.display === 'block' &&
                !this.timePanel.contains(event.target) &&
                !this.hostElement.contains(event.target) &&
                !(this.config.triggerElement && document.querySelector(this.config.triggerElement) && document.querySelector(this.config.triggerElement).contains(event.target))) {
                this.conceal();
            }
        }

        reveal() {
            if (this.hostElement.classList.contains(disabledHostClass)) return;

            if (currentVisibleSelector && currentVisibleSelector !== this) {
                currentVisibleSelector.conceal();
            }
            currentVisibleSelector = this;

            this.extractInitialTime();
            this.updatePanelDisplay();

            if (this.config.beforeShowCallback) {
                this.config.beforeShowCallback.call(this.hostElement, this.hostElement, this);
            }

            this.placePanel();
            this.timePanel.style.display = 'block';
            this.animatePanel(true);
        }

        conceal() {
            if (this.timePanel.style.display === 'none') return;

            this.animatePanel(false, () => {
                this.timePanel.style.display = 'none';
                if (this.config.onCloseCallback) {
                    this.config.onCloseCallback.call(this.hostElement, this.composeTimeString(this.chosenHour, this.chosenMinute, this.config.showPeriodIdentifier), this);
                }
                if (currentVisibleSelector === this) {
                    currentVisibleSelector = null;
                }
            });
        }

        toggleVisibility() {
            if (this.timePanel.style.display === 'block') {
                this.conceal();
            } else {
                this.reveal();
            }
        }

        animatePanel(show, completionCallback = () => {}) {
            const panel = this.timePanel;
            if (this.config.displayAnimation === 'fade') {
                panel.style.opacity = show ? '0' : '1';
                panel.style.transition = 'opacity 0.2s ease-in-out';
                setTimeout(() => {
                    panel.style.opacity = show ? '1' : '0';
                    setTimeout(completionCallback, 200);
                }, 10);
            } else if (this.config.displayAnimation === 'slide') {
                // Simplified slide to just a fade for Type IV
                panel.style.opacity = show ? '0' : '1';
                panel.style.transition = 'opacity 0.2s ease-in-out';
                setTimeout(() => {
                    panel.style.opacity = show ? '1' : '0';
                    setTimeout(completionCallback, 200);
                }, 10);
            } else {
                completionCallback();
            }
        }

        placePanel() {
            const hostRect = this.hostElement.getBoundingClientRect();
            const panelRect = this.timePanel.getBoundingClientRect();

            let targetTop = hostRect.bottom + window.scrollY;
            let targetLeft = hostRect.left + window.scrollX;

            // Basic positioning logic resembling 'flip'
            if (targetTop + panelRect.height > window.innerHeight + window.scrollY && hostRect.top - panelRect.height > window.scrollY) {
                targetTop = hostRect.top - panelRect.height + window.scrollY;
            }

            if (targetLeft + panelRect.width > window.innerWidth + window.scrollX && hostRect.right - panelRect.width > window.scrollX) {
                targetLeft = hostRect.right - panelRect.width + window.scrollX;
            }

            this.timePanel.style.position = 'absolute';
            this.timePanel.style.top = `${targetTop}px`;
            this.timePanel.style.left = `${targetLeft}px`;
            this.timePanel.style.zIndex = (parseInt(getComputedStyle(this.hostElement).zIndex) || 0) + 1;
        }

        // Public API
        updateConfig(newSettings) {
            this.config = { ...this.config, ...newSettings };
            this.updatePanelDisplay();
        }

        getCurrentTime() {
            if (this.chosenHour === null || this.chosenMinute === null) {
                return null;
            }
            return this.composeTimeString(this.chosenHour, this.chosenMinute, this.config.showPeriodIdentifier);
        }

        setCurrentTime(timeStr) {
            if (!timeStr) {
                this.chosenHour = null;
                this.chosenMinute = null;
            } else {
                const parts = timeStr.split(this.config.timeSeparatorChar);
                if (parts.length >= 2) {
                    let h = parseInt(parts[0], 10);
                    let m = parseInt(parts[1], 10);
                    this.chosenHour = h;
                    this.chosenMinute = m;
                }
            }
            this.syncInputHost();
            this.updatePanelDisplay();
        }

        disable() {
            this.hostElement.classList.add(disabledHostClass);
            this.hostElement.setAttribute('disabled', 'true');
            if (currentVisibleSelector === this) {
                this.conceal();
            }
        }

        enable() {
            this.hostElement.classList.remove(disabledHostClass);
            this.hostElement.removeAttribute('disabled');
        }
    }

    const SelectorManager = {
        attach: function (targetElements, options) {
            document.querySelectorAll(targetElements).forEach(el => {
                if (!selectorInstances.has(el)) {
                    const isDivOrSpan = el.tagName.toLowerCase() !== 'input';
                    const instance = new TimeSelector(el, options, isDivOrSpan);
                    selectorInstances.set(el, instance);
                    if (isDivOrSpan) {
                        instance.reveal();
                    }
                }
            });
        },

        execute: function (element, command, ...args) {
            const instance = selectorInstances.get(element);
            if (instance && typeof instance[command] === 'function') {
                return instance[command](...args);
            }
            console.warn(`TimeSelector: Command '${command}' not found or instance not initialized for element.`, element);
            return null;
        }
    };

    window.TimeSelectorAPI = SelectorManager;

    const widgetStyles = document.createElement('style');
    widgetStyles.textContent = `
        .time-select-container {
            font-family: Arial, sans-serif;
            font-size: 13px;
            background-color: #ffffff;
            border: 1px solid #c5c5c5;
            border-radius: 3px;
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
            padding: 8px;
            display: flex;
            flex-direction: column;
            gap: 8px;
            position: absolute;
            z-index: 1000;
        }
        .time-select-inline {
            position: static;
            box-shadow: none;
            border: none;
        }
        .time-select-main-body {
            display: flex;
            gap: 12px;
            justify-content: center;
        }
        .time-select-hours-segment,
        .time-select-minutes-segment {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 4px;
        }
        .time-select-section-label {
            font-weight: bold;
            margin-bottom: 4px;
            color: #333;
        }
        .time-select-grid-layout {
            display: flex;
            flex-direction: column;
            gap: 1px;
        }
        .time-select-grid-row {
            display: flex;
            gap: 1px;
        }
        .time-select-cell {
            width: 32px;
            height: 28px;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 1px solid #e0e0e0;
            border-radius: 2px;
            cursor: pointer;
            color: #444;
            transition: background-color 0.15s ease, color 0.15s ease, border-color 0.15s ease;
        }
        .time-select-cell:not(.time-select-empty-cell):hover,
        .time-select-cell.time-select-hover {
            background-color: #f0f0f0;
            border-color: #cccccc;
        }
        .time-select-active {
            background-color: #007bff;
            color: #ffffff;
            border-color: #007bff;
        }
        .time-select-active:hover {
            background-color: #0056b3;
            border-color: #0056b3;
        }
        .time-select-empty-cell {
            background-color: #f8f8f8;
            cursor: default;
            border-color: #f8f8f8;
            color: #bbb;
        }
        .time-select-control-buttons {
            display: flex;
            justify-content: center;
            gap: 8px;
            margin-top: 8px;
        }
        .time-select-action-button {
            padding: 6px 10px;
            border: 1px solid #ccc;
            border-radius: 3px;
            background-color: #f5f5f5;
            cursor: pointer;
            color: #333;
            transition: background-color 0.15s ease, border-color 0.15s ease;
        }
        .time-select-action-button:hover {
            background-color: #e0e0e0;
            border-color: #bbb;
        }
        .time-select-disabled-host {
            opacity: 0.6;
            cursor: not-allowed;
        }
    `;
    document.head.appendChild(widgetStyles);

})();